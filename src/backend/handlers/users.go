package handlers

// User handlers needed:
// [done] GetUsers      — GET /api/users
// [done] GetUserById   — GET /api/users/:id
// [TODO] CreateUser    — POST /api/users (validate + hash password + call CreateUser)
// [TODO] UpdateUser    — PUT /api/users/:id
// [TODO] PatchUser     — PATCH /api/users/:id
// [TODO] DeleteUser    — DELETE /api/users/:id
// [TODO] SearchUsers   — GET /api/users/search?q=

import (
	"log"
	"net/http"
	"strings"
	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"github.com/nbutton23/zxcvbn-go"

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
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(),})
		return
	}
	if req.Password != req.Password_confirm || !PasswordStrength(req.Password) 
		|| hashedPassword := HashPassword(req.Password) == nil{
		return c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(),})
	}
	user := User {
		ID = uuid.New()
		Email = strings.ToLower(req.Email)
		Password_hash = hashedPassword
		Name = req.Name
		Display_name = req.Display_name
	}
	err := repository.CreateUser()
	if err != nil {

	}
	go GreetNewUser()
}

func UpdateUser(c *gin.Context) {
	// TODO: call db.UpdateUser()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

//Create a hashed password to store in Database
func HashPassword(password string) ([]byte, bool) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, false
	}
	return hashedPassword, true
}

//Use zxcvbn to assess password strength: 0 = very weak, 4 = very strong
func IsPasswordStrong(password string) bool {
	result := zxcvbn.PasswordStrength(password, nil)
	return result.Score >= 3 
}

//Call API that will send a greeting email to new user created, will be launched in a routine
func GreetNewUser(){

}

