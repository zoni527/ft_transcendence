package handlers

// User handlers needed:
// [done] GetUsers      — GET /api/users
// [done] GetUserById   — GET /api/users/:id
// [done] CreateUser    — POST /api/users (validate + hash password + call CreateUser)
// [TODO] UpdateUser    — PUT /api/users/:id
// [TODO] PatchUser     — PATCH /api/users/:id
// [TODO] DeleteUser    — DELETE /api/users/:id
// [TODO] SearchUsers   — GET /api/users/search?q=

import (
	"errors"
	"log"
	"net/http"
	"os"
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

func CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}
	normalizeCreateUserRequest(&req)
	if req.Name != "" && !isValidName(req.Name) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid name"})
		return
	}
	if !isValidDisplayName(req.Display_name) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid display_name"})
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
			c.IndentedJSON(http.StatusConflict, gin.H{"error": "user already exists"})
			return
		}
		log.Printf("CreateUser repository.CreateUser error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusCreated, gin.H{"id": data.Id, "email": data.Email})
}

func LoginUser(c *gin.Context) {

}

func UpdateUser(c *gin.Context) {
	// TODO: call repository.UpdateUser()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func PatchUser(c *gin.Context) {
	// TODO: call repository.PatchUser()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func DeleteUser(c *gin.Context) {
	// TODO: call repository.DeleteUser()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func SearchUsers(c *gin.Context) {
	// TODO: call repository.SearchUsers()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

// Function to trim leading and trailing blank spaces, set email to lowercase
func normalizeCreateUserRequest(req *models.CreateUserRequest) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Name = strings.TrimSpace(req.Name)
	req.Display_name = strings.TrimSpace(req.Display_name)
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

// Secret key used to sign every generated JWT - passed as env variable once
var jwtSecret []byte

// Load env var to package variable for use. To be done only once when the backend starts
func LoadJWTSecret() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("error loading JWT secret")
	}
	jwtSecret = []byte(secret)
}

// Function to generate JSON web tokens -
func generateJWTToken(userID string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     now.Add(time.Hour * 24).Unix(),
		"iat":     now.Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}
