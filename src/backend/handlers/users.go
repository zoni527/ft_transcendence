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

	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
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
	// TODO: validate + hash password + call db.CreateUser()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func UpdateUser(c *gin.Context) {
	// TODO: call db.UpdateUser()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}
