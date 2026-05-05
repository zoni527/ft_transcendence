package handlers

// User handlers needed:
// [done] GetUsers      — GET /api/users
// [done] GetUserById   — GET /api/users/:id
// [done] CreateUser    — POST /api/users (validate + hash password + call CreateUser)
// [done] UpdateUser   — PUT /api/users/:id (self-update + admin update)
// [TODO] DeleteUser    — DELETE /api/users/:id
// [TODO] SearchUsers   — GET /api/users/search?q=

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"unicode"

	"ft_transcendence/backend/models"
	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/nbutton23/zxcvbn-go"
	"golang.org/x/crypto/bcrypt"
)

func GetUsers(c *gin.Context) {
	users, err := repository.GetAllUsers()
	if err != nil {
		log.Printf("GetUsers error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, users)
}

func GetUserById(c *gin.Context) {
	id := c.Param("id")
	if !isValidUUID(id) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid user ID format"})
		return
	}

	user, err := repository.GetUserById(id)
	if err == pgx.ErrNoRows {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	if err != nil {
		log.Printf("GetUserById error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, user)
}

func GetMe(c *gin.Context) {
	userID := c.GetString("userID")
	if !isValidUUID(userID) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}
	user, err := repository.GetUserById(userID)
	if err == pgx.ErrNoRows {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	if err != nil {
		log.Printf("Getme error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, user)
}

func GetSession(c *gin.Context) {
	token, err := c.Cookie("token")
	if err != nil {
		c.IndentedJSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}

	claims, err := ValidateJWTToken(token)
	if err != nil {
		clearAuthCookie(c)
		c.IndentedJSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}

	blacklisted, err := isTokenBlacklisted(token)
	if err != nil {
		log.Printf("GetSession blacklist check: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	if blacklisted {
		clearAuthCookie(c)
		c.IndentedJSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}

	user, err := repository.GetUserById(claims.Subject)
	if err == pgx.ErrNoRows {
		clearAuthCookie(c)
		c.IndentedJSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}
	if err != nil {
		log.Printf("GetSession error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"authenticated": true, "user": user})
}

func CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}
	if err := normalizeAndValidateUserFields(&req.Email, &req.Name, &req.Display_name); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := validatePassword(req.Password); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !isPasswordStrong(req.Password) {
		c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": "password is too weak"})
		return
	}
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		log.Printf("CreateUser hashPassword error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	userParams := models.CreateUserParams{
		Email:           req.Email,
		Password_hashed: hashedPassword,
		Name:            req.Name,
		Display_name:    req.Display_name,
	}
	data, err := repository.CreateUser(userParams)
	if err != nil {
		if errors.Is(err, repository.ErrUserAlreadyExists) {
			c.IndentedJSON(http.StatusConflict, gin.H{"error": "user/email already exists"})
			return
		}
		log.Printf("CreateUser error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	token, err := generateJWTToken(data.Id)
	if err != nil {
		log.Printf("CreateUser generateJWTToken error: %v", err)
		c.IndentedJSON(http.StatusCreated, gin.H{"id": data.Id, "email": data.Email, "authenticated": false})
		return
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", token, 3600, "/", "", false, true)
	c.IndentedJSON(http.StatusCreated, gin.H{"id": data.Id, "email": data.Email, "authenticated": true})
}

func LoginUser(c *gin.Context) {
	var req models.LoginUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	data, err := repository.GetUserCredentialsByEmail(req.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}
		log.Printf("LoginUser error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(data.Password_hash), []byte(req.Password)); err != nil {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	token, err := generateJWTToken(data.Id)
	if err != nil {
		log.Printf("LoginUser generateJWTToken error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", token, 3600, "/", "", false, true)
	c.IndentedJSON(http.StatusOK, gin.H{"id": data.Id, "email": data.Email, "authenticated": true})
}

func LogoutUser(c *gin.Context) {
	token := c.GetString("token")
	expDate := c.GetTime("expDate")
	if err := addTokenToBlacklist(token, expDate); err != nil {
		log.Printf("LogoutUser: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	clearAuthCookie(c)
	c.IndentedJSON(http.StatusOK, gin.H{"message": "logged out successfully"})
}

func UpdateUser(c *gin.Context) {
	targetUserID := c.Param("id")
	if !isValidUUID(targetUserID) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	callerUserID := c.GetString("userID")
	if !isValidUUID(callerUserID) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

	callerRoles, err := repository.GetRolesByUserId(callerUserID)
	if err != nil {
		log.Printf("UpdateUser GetRolesByUserId: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	callerIsAdmin := hasRole(callerRoles, "admin")
	callerIsOwner := callerUserID == targetUserID
	if !callerIsOwner && !callerIsAdmin {
		c.IndentedJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}
	if err := normalizeAndValidateUpdateUserRequest(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Password != nil && !callerIsOwner {
		c.IndentedJSON(http.StatusForbidden, gin.H{"error": "password can only be changed by the account owner"})
		return
	}
	if req.Password != nil {
		if err := validatePassword(*req.Password); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if !isPasswordStrong(*req.Password) {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": "password is too weak"})
			return
		}
	}
	if req.Roles != nil && !callerIsAdmin {
		c.IndentedJSON(http.StatusForbidden, gin.H{"error": "roles can only be changed by an admin"})
		return
	}
	if req.Roles != nil {
		if err := validateRoles(req.Roles); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}
	if !hasAnyUpdateField(&req) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	var hashedPassword *string
	if req.Password != nil {
		hash, err := hashPassword(*req.Password)
		if err != nil {
			log.Printf("UpdateUser hashPassword error: %v", err)
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		hashedPassword = &hash
	}

	userParams := models.UpdateUserParams{
		Email:           req.Email,
		Name:            req.Name,
		Password_hashed: hashedPassword,
		Display_name:    req.Display_name,
		Avatar_url:      req.Avatar_url,
		Roles:           req.Roles,
	}
	user, err := repository.UpdateUser(targetUserID, userParams)
	if err != nil {
		if errors.Is(err, repository.ErrUserAlreadyExists) {
			c.IndentedJSON(http.StatusConflict, gin.H{"error": "user/email already exists"})
			return
		}
		log.Printf("UpdateUser: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, user)
}

func DeleteUser(c *gin.Context) {
	// TODO: call repository.DeleteUser()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func SearchUsers(c *gin.Context) {
	// TODO: call repository.SearchUsers()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func clearAuthCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", "", -1, "/", "", false, true)
}

// normalizeAndValidateUpdateUserRequest normalizes only the fields the caller sent.
func normalizeAndValidateUpdateUserRequest(req *models.UpdateUserRequest) error {
	if req.Email != nil {
		lowered := strings.ToLower(*req.Email)
		req.Email = &lowered
	}
	if req.Name != nil {
		trimmed := strings.TrimSpace(*req.Name)
		if !isValidName(trimmed) {
			return errors.New("invalid name")
		}
		req.Name = &trimmed
	}
	if req.Display_name != nil {
		trimmed := strings.TrimSpace(*req.Display_name)
		if !isValidDisplayName(trimmed) {
			return errors.New("invalid display_name")
		}
		req.Display_name = &trimmed
	}
	if req.Avatar_url != nil {
		trimmed := strings.TrimSpace(*req.Avatar_url)
		req.Avatar_url = &trimmed
	}
	return nil
}

// normalizeAndValidateUserFields normalizes and validates the required create-user fields.
func normalizeAndValidateUserFields(email, name, displayName *string) error {
	*email = strings.ToLower(*email)
	*displayName = strings.TrimSpace(*displayName)
	if *name != "" {
		*name = strings.TrimSpace(*name)
		if !isValidName(*name) {
			return errors.New("invalid name")
		}
	}
	if !isValidDisplayName(*displayName) {
		return errors.New("invalid display_name")
	}
	return nil
}

// Create a hashed password to store in Database
func hashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	hashedString := string(hashedBytes)
	return hashedString, nil
}

// Password validation helper to check if password has control characters
// Any extra validations would come in this step
func validatePassword(password string) error {
	for _, r := range password {
		if unicode.IsControl(r) {
			return errors.New("password contains invalid control characters")
		}
	}
	return nil
}

// Use zxcvbn to assess password strength: 0 = very weak, 4 = very strong
// Set to 0 for development phase, to be set to 3
func isPasswordStrong(password string) bool {
	result := zxcvbn.PasswordStrength(password, nil)
	return result.Score >= 0
}

// Validate roles: must not be empty, no duplicates, and only valid role names
func validateRoles(roles []string) error {
	if len(roles) == 0 {
		return errors.New("roles cannot be empty")
	}

	validRoles := map[string]bool{
		"user":      true,
		"chef":      true,
		"moderator": true,
		"admin":     true,
	}

	seen := make(map[string]bool)
	for _, role := range roles {
		if !validRoles[role] {
			return fmt.Errorf("invalid role: %s", role)
		}
		if seen[role] {
			return fmt.Errorf("duplicate role: %s", role)
		}
		seen[role] = true
	}
	return nil
}

// Custom name validator: Allows letters + separators (space, apostrophe, hyphen),
// but rejects separator-only names like "-----".
func isValidName(name string) bool {
	name = strings.TrimSpace(name)
	if name == "" {
		return false
	}

	var letters int
	var prevSep bool

	for i, r := range name {
		isLetter := unicode.IsLetter(r)
		isSep := r == ' ' || r == '\'' || r == '-'

		if !isLetter && !isSep {
			return false
		}
		if isLetter {
			letters++
			prevSep = false
			continue
		}
		if i == 0 || i == len(name)-1 {
			return false
		}
		if prevSep {
			return false
		}
		prevSep = true
	}
	return letters >= 2
}

// Username validator: allows letters, numbers and separators (_ . -).
// but rejects separators at start/end, spaces, and only symbols
func isValidDisplayName(displayName string) bool {
	displayName = strings.TrimSpace(displayName)
	if displayName == "" {
		return false
	}

	runeLen := len([]rune(displayName))
	if runeLen < 3 || runeLen > 15 {
		return false
	}

	var hasAlphaNum bool
	var prevSep bool

	for i, r := range displayName {
		isAlphaNum := unicode.IsLetter(r) || unicode.IsDigit(r)
		isSep := r == '_' || r == '.' || r == '-'

		if !isAlphaNum && !isSep {
			return false
		}
		if isAlphaNum {
			hasAlphaNum = true
			prevSep = false
			continue
		}
		if i == 0 || i == len(displayName)-1 {
			return false
		}
		if prevSep {
			return false
		}
		prevSep = true
	}

	return hasAlphaNum
}

func hasRole(roles []string, role string) bool {
	for _, currentRole := range roles {
		if currentRole == role {
			return true
		}
	}
	return false
}

func hasAnyUpdateField(req *models.UpdateUserRequest) bool {
	return req.Email != nil || req.Name != nil || req.Password != nil || req.Display_name != nil || req.Avatar_url != nil || req.Roles != nil
}

// Secret key used to sign every generated JWT
var jwtSecret []byte

// Initialize JWT secret from JWT_SECRET at startup.
func LoadJWTSecret() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("Error loading JWT secret")
	}
	jwtSecret = []byte(secret)
}

// Function to generate JWT to be sent to frontend for authentication on successful login
func generateJWTToken(userID string) (string, error) {
	now := time.Now()
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(now.Add(1 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(now),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// Function to validate JWT sent by frontend
func ValidateJWTToken(token string) (*jwt.RegisteredClaims, error) {
	claims := &jwt.RegisteredClaims{}
	parsedToken, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
		if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, fmt.Errorf("unexpected signing method %s", t.Method.Alg())
		}
		return jwtSecret, nil
	})
	if err != nil || !parsedToken.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	if claims.Subject == "" {
		return nil, fmt.Errorf("missing userID")
	}
	if claims.ExpiresAt == nil {
		return nil, fmt.Errorf("missing expiration date")
	}
	return claims, nil
}

// Middleware to check cookies validity and JWT before granting access to restricted paths
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		claims, err := ValidateJWTToken(token)
		if err != nil {
			log.Printf("ValidateJWTToken failed: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		blacklisted, err := isTokenBlacklisted(token)
		if err != nil {
			log.Printf("Check blacklist failed: %v", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		if blacklisted {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set("token", token)
		c.Set("userID", claims.Subject)
		c.Set("expDate", claims.ExpiresAt.Time)
		c.Next()
	}
}

func isTokenBlacklisted(token string) (bool, error) {
	exist, err := repository.GetTokenBlacklisted(token)
	if err != nil {
		return false, fmt.Errorf("check token blacklist: %w", err)
	}
	return exist, nil
}

func addTokenToBlacklist(token string, expirationDate time.Time) error {
	err := repository.AddTokenToBlacklist(token, expirationDate)
	if err != nil {
		return fmt.Errorf("addTokenToBlacklist: %w", err)
	}
	return nil
}

func TokenCleanupLoop() {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()
	for range ticker.C {
		if err := repository.CleanExpiredTokens(time.Now()); err != nil {
			log.Printf("TokenCleanupLoop: %v", err)
		}
	}
}

func UserAvatarSignature(c *gin.Context) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	params := map[string]string{
		"timestamp": timestamp,
		"folder":    "avatar",
	}
	signature := GenerateCloudinarySignature(params)
	c.IndentedJSON(http.StatusOK, gin.H{
		"signature":  signature,
		"api_key":    string(cloudinaryKey),
		"cloud_name": string(cloudinaryCloudName),
		"timestamp":  timestamp,
		"folder":     "avatar",
	})
}
