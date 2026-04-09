package handlers

// User handlers needed:
// [done] GetUsers      — GET /api/users
// [done] GetUserById   — GET /api/users/:id
// [TODO] PostUser      — POST /api/users (validate + hash password + call CreateUser)
// [TODO] PutUser       — PUT /api/users/:id
// [TODO] PatchUser     — PATCH /api/users/:id
// [TODO] DeleteUser    — DELETE /api/users/:id
// [TODO] SearchUsers   — GET /api/users/search?q=

import (
	"net/http"
	"ft_transcendence/backend/repository"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

func GetUsers(c *gin.Context) {
	users, err := repository.GetAllUsers()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, users)
}

func GetUserById(c *gin.Context) {
	id := c.Param("id")

	user, err := repository.GetUserById(id)
	if err == pgx.ErrNoRows {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "user not found"})
		return
	}
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, user)
}

func PostUser(c *gin.Context) {
	// TODO: validate + hash password + call db.CreateUser()
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}

func PatchUser(c *gin.Context) {
	// TODO: call db.PatchUser()
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}
