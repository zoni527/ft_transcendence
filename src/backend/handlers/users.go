package handlers

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/mail"
	"net/url"
	"strconv"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/integrations"
	"ft_transcendence/backend/models"
	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/nbutton23/zxcvbn-go"
	"golang.org/x/crypto/bcrypt"
)

const onlineThreshold = 60 * time.Second

func markOnline(user *models.User) {
	user.IsOnline = time.Since(user.LastSeen) < onlineThreshold
}

func GetUsers(c *gin.Context) {
	users, err := repository.GetAllUsers(c.Request.Context())
	if err != nil {
		log.Printf("GetUsers: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	for i := range users {
		markOnline(&users[i])
	}
	c.JSON(http.StatusOK, users)
}

func GetUserByID(c *gin.Context) {
	id := c.Param("id")
	if !authorization.IsValidUUID(id) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID format"})
		return
	}

	user, err := repository.GetUserByID(c.Request.Context(), id)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	if err != nil {
		log.Printf("GetUserByID: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	markOnline(&user)
	c.JSON(http.StatusOK, user)
}

func GetMe(c *gin.Context) {
	userID := c.GetString("userID")
	if !authorization.IsValidUUID(userID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}
	user, err := repository.GetUserByID(c.Request.Context(), userID)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	if err != nil {
		log.Printf("Getme: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	markOnline(&user)
	c.JSON(http.StatusOK, user)
}

func UserAvatarSignature(c *gin.Context) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	folder := "avatar"
	allowedFormats := "jpg, jpeg, png, webp"
	params := map[string]string{
		"timestamp":       timestamp,
		"folder":          folder,
		"allowed_formats": allowedFormats,
	}
	signature := integrations.GenerateCloudinarySignature(params)
	c.JSON(http.StatusOK, gin.H{
		"signature":       signature,
		"api_key":         integrations.APIKey(),
		"cloud_name":      integrations.CloudName(),
		"timestamp":       timestamp,
		"folder":          folder,
		"allowed_formats": allowedFormats,
	})
}

func GetSession(c *gin.Context) {
	token, err := c.Cookie("token")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}

	claims, err := authorization.ValidateJWTToken(token)
	if err != nil {
		authorization.ClearAuthCookie(c)
		c.JSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}

	blacklisted, err := authorization.IsTokenBlacklisted(c.Request.Context(), token)
	if err != nil {
		log.Printf("GetSession blacklist check: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	if blacklisted {
		authorization.ClearAuthCookie(c)
		c.JSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}

	user, err := repository.GetUserByID(c.Request.Context(), claims.Subject)
	if err == pgx.ErrNoRows {
		authorization.ClearAuthCookie(c)
		c.JSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}
	if err != nil {
		log.Printf("GetSession: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	markOnline(&user)
	c.JSON(http.StatusOK, gin.H{"authenticated": true, "user": user})
}

func CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}
	if err := normalizeAndValidateUserFields(&req.Email, &req.Name, &req.DisplayName); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := validatePassword(req.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !isPasswordStrong(req.Password) {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "password is too weak"})
		return
	}
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		log.Printf("CreateUser hashPassword: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	userParams := models.CreateUserParams{
		Email:          req.Email,
		PasswordHashed: hashedPassword,
		Name:           req.Name,
		DisplayName:    req.DisplayName,
	}
	data, err := repository.CreateUser(c.Request.Context(), userParams)
	if err != nil {
		if errors.Is(err, repository.ErrUserAlreadyExists) {
			c.JSON(http.StatusConflict, gin.H{"error": "username/email already exists"})
			return
		}
		log.Printf("CreateUser: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	token, err := authorization.GenerateJWTToken(data.ID)
	if err != nil {
		log.Printf("CreateUser generateJWTToken: %v", err)
		c.JSON(http.StatusCreated, gin.H{"id": data.ID, "email": data.Email, "authenticated": false})
		return
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", token, 3600, "/", "", true, true)
	c.JSON(http.StatusCreated, gin.H{"id": data.ID, "email": data.Email, "authenticated": true})
}

func LoginUser(c *gin.Context) {
	var req models.LoginUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	data, err := repository.GetUserCredentialsByEmail(c.Request.Context(), req.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}
		log.Printf("LoginUser: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(data.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	token, err := authorization.GenerateJWTToken(data.ID)
	if err != nil {
		log.Printf("LoginUser GenerateJWTToken: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	if err := repository.UpdateLastSeen(c.Request.Context(), data.ID); err != nil {
		log.Printf("LoginUser UpdateLastSeen: %v", err)
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", token, 3600, "/", "", true, true)
	c.JSON(http.StatusOK, gin.H{"id": data.ID, "email": data.Email, "authenticated": true})
}

func LogoutUser(c *gin.Context) {
	token := c.GetString("token")
	expDate := c.GetTime("expDate")
	if err := authorization.AddTokenToBlacklist(c.Request.Context(), token, expDate); err != nil {
		log.Printf("LogoutUser: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	userID := c.GetString("userID")
	if userID != "" {
		if err := repository.MarkOffline(c.Request.Context(), userID); err != nil {
			log.Printf("LogoutUser MarkOffline: %v", err)
		}
	}

	authorization.ClearAuthCookie(c)
	c.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
}

func UpdateUser(c *gin.Context) {
	targetUserID := c.Param("id")
	if !authorization.IsValidUUID(targetUserID) {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	callerUserID := c.GetString("userID")
	if !authorization.IsValidUUID(callerUserID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}
	roleSet, okRoles := authorization.RolesFromContext(c)
	permSet, okPerms := authorization.PermsFromContext(c)
	if !okRoles || !okPerms {
		log.Printf("handlers.UpdateUser: data missing from context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	allowed := authorization.CanEditUser(roleSet, callerUserID, targetUserID)
	if !allowed {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}
	if err := normalizeAndValidateUpdateUserRequest(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Password != nil && callerUserID != targetUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "password can only be changed by the account owner"})
		return
	}
	if req.Password != nil {
		if err := validatePassword(*req.Password); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if !isPasswordStrong(*req.Password) {
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "password is too weak"})
			return
		}
	}
	if req.Roles != nil {
		canManageRoles := authorization.CanManageRoles(roleSet, permSet, callerUserID, targetUserID)
		if !canManageRoles {
			c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions or self-update not allowed"})
			return
		}
		if err := validateRoles(req.Roles); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}
	if !hasAnyUpdateField(&req) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no fields to update"})
		return
	}

	var hashedPassword *string
	if req.Password != nil {
		hash, err := hashPassword(*req.Password)
		if err != nil {
			log.Printf("UpdateUser hashPassword: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		hashedPassword = &hash
	}

	userParams := models.UpdateUserParams{
		Email:          req.Email,
		Name:           req.Name,
		PasswordHashed: hashedPassword,
		DisplayName:    req.DisplayName,
		AvatarURL:      req.AvatarURL,
		Roles:          req.Roles,
	}
	user, err := repository.UpdateUser(c.Request.Context(), targetUserID, userParams)
	if err != nil {
		if errors.Is(err, repository.ErrUserAlreadyExists) {
			c.JSON(http.StatusConflict, gin.H{"error": "username/email already exists"})
			return
		}
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		log.Printf("UpdateUser: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	markOnline(&user)
	c.JSON(http.StatusOK, user)
}

func SearchUser(c *gin.Context) {
	query := c.Query("q")
	query = strings.TrimSpace(query)
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "search query not included"})
		return
	}
	if utf8.RuneCountInString(query) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query must be at least 2 characters"})
		return
	}
	users, err := repository.SearchUsersByUsername(c.Request.Context(), query)
	if err != nil {
		log.Printf("SearchUser: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func GenerateAPIKey(c *gin.Context) {
	userID := c.GetString("userID")
	if !authorization.IsValidUUID(userID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	apiKey, randomSecret, err := authorization.GenerateAPIKey(userID)
	if err != nil {
		log.Printf("GenerateAPIKey error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	if err := repository.SaveAPIKey(c.Request.Context(), userID, randomSecret); err != nil {
		log.Printf("GenerateApiKey error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.Header("Cache-Control", "no-store, private")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
	c.JSON(http.StatusCreated, apiKey)
}

// normalizeAndValidateUpdateUserRequest normalizes only the fields the caller sent.
func normalizeAndValidateUpdateUserRequest(req *models.UpdateUserRequest) error {
	if req.Email != nil {
		lowered := strings.ToLower(strings.TrimSpace(*req.Email))
		if lowered != "" {
			if err := validateEmail(lowered); err != nil {
				return err
			}
			req.Email = &lowered
		} else {
			req.Email = nil
		}
	}
	if req.Name != nil {
		trimmed := strings.TrimSpace(*req.Name)
		if trimmed != "" {
			if !isValidName(trimmed) {
				return errors.New("invalid name")
			}
			req.Name = &trimmed
		} else {
			req.Name = nil
		}
	}
	if req.DisplayName != nil {
		trimmed := strings.TrimSpace(*req.DisplayName)
		if trimmed != "" {
			if !isValidDisplayName(trimmed) {
				return errors.New("invalid display_name")
			}
			req.DisplayName = &trimmed
		} else {
			req.DisplayName = nil
		}
	}
	if req.AvatarURL != nil {
		trimmed := strings.TrimSpace(*req.AvatarURL)
		if trimmed != "" {
			if err := validateCloudinaryAvatarURL(trimmed); err != nil {
				return err
			}
			req.AvatarURL = &trimmed
		} else {
			req.AvatarURL = nil
		}
	}
	return nil
}

// normalizeAndValidateUserFields normalizes and validates the required create-user fields.
func normalizeAndValidateUserFields(email, name, displayName *string) error {
	*email = strings.ToLower(strings.TrimSpace(*email))
	if *email != "" {
		if err := validateEmail(*email); err != nil {
			return err
		}
	}
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

func validateCloudinaryAvatarURL(avatarURL string) error {
	if avatarURL == "" {
		return nil
	}

	parsed, err := url.Parse(avatarURL)
	if err != nil {
		return errors.New("invalid avatar_url")
	}

	if parsed.Scheme != "https" || parsed.Host != "res.cloudinary.com" {
		return errors.New("avatar_url must be a Cloudinary URL")
	}

	if !strings.HasPrefix(parsed.Path, "/") || len(strings.Split(strings.Trim(parsed.Path, "/"), "/")) < 2 {
		return errors.New("avatar_url must include cloud name and asset path")
	}

	return nil
}

func validateEmail(email string) error {
	if email == "" {
		return nil
	}

	for _, r := range email {
		if unicode.IsControl(r) {
			return errors.New("email contains control characters")
		}
	}

	addr, err := mail.ParseAddress(email)
	if err != nil {
		return err
	}

	parts := strings.Split(addr.Address, "@")
	allowed := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-+"
	for _, r := range parts[0] {
		if !strings.ContainsRune(allowed, r) {
			return fmt.Errorf("invalid character in email local part: %c", r)
		}
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
	return result.Score >= 3
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
		"developer": true,
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
	if runeLen < 3 || runeLen > 30 {
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

func hasAnyUpdateField(req *models.UpdateUserRequest) bool {
	return req.Email != nil ||
		req.Name != nil ||
		req.Password != nil ||
		req.DisplayName != nil ||
		req.AvatarURL != nil ||
		req.Roles != nil
}

func Heartbeat(c *gin.Context) {
	userID := c.GetString("userID")

	if !authorization.IsValidUUID(userID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}
	if err := repository.UpdateLastSeen(c.Request.Context(), userID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.IndentedJSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		log.Printf("Heartbeat: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.Status(http.StatusNoContent)
}

func DeleteUser(c *gin.Context) {
	targetUserID := c.Param("id")
	if !authorization.IsValidUUID(targetUserID) {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	callerUserID := c.GetString("userID")
	if !authorization.IsValidUUID(callerUserID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

	roleSet, ok := authorization.RolesFromContext(c)
	if !ok {
		log.Printf("handlers.DeleteUser: data missing from context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	if !authorization.CanDeleteUser(roleSet, callerUserID, targetUserID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	if err := repository.DeleteUser(c.Request.Context(), targetUserID); err != nil {
		if errors.Is(err, repository.ErrLastAdmin) {
			c.JSON(http.StatusForbidden, gin.H{"error": "cannot delete the last admin"})
			return
		}
		var nf *repository.NotFoundError
		if errors.As(err, &nf) {
			c.JSON(http.StatusNotFound, gin.H{"error": nf.Error()})
			return
		}
		log.Printf("handlers.DeleteUser: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	if callerUserID == targetUserID {
		token := c.GetString("token")
		expDate := c.GetTime("expDate")
		if err := authorization.AddTokenToBlacklist(c.Request.Context(), token, expDate); err != nil {
			log.Printf("handlers.DeleteUser blacklist: %v", err)
		}
		authorization.ClearAuthCookie(c)
	}
	c.Status(http.StatusNoContent)
}
