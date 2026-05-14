package handlers

import (
	"fmt"
	"github.com/gin-gonic/gin"

	"ft_transcendence/backend/authorization"
)

func GetAPIKey(c *gin.Context) {
	id := c.GetString("userID")
	if !authorization.IsValidUUID() {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	apiKey, hashedSecret, err := authorization.generateAPIKey(id)
	if err != nil {
		log.Printf("getAPIKey error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, apiKey)
}
