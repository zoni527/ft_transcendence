package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/repository"
)

func GetAPIKey(c *gin.Context) {
	userID := c.GetString("userID")
	if !authorization.IsValidUUID(userID) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	apiKey, randomSecret, err := authorization.GenerateAPIKey(userID)
	if err != nil {
		log.Printf("GetAPIKey error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	if err := repository.SaveAPIKey(userID, randomSecret); err != nil {
		log.Printf("GetApiKey error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusCreated, apiKey)
}
