package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

// -------------------------------------------------------------------------- //
// GET

func getUsers(c *gin.Context) {
	users, err := GetAllUsers()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, users)
}

func getUserById(c *gin.Context) {
	id := c.Param("id")

	user, err := GetUserById(id)
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

// -------------------------------------------------------------------------- //
// POST

func postUsers(c *gin.Context) {
	// TODO: replace with CreateUser() from users_db.go
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}

// -------------------------------------------------------------------------- //
// PATCH

func patchUsers(c *gin.Context) {
	// TODO: replace with UpdateUser() from users_db.go
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}
