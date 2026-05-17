package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/repository"
	"ft_transcendence/backend/services"
)

type PublicRecipeHandler struct {
	svc services.RecipeService
}

func NewPublicRecipeHandler(svc services.RecipeService) *PublicRecipeHandler {
	return &PublicRecipeHandler{svc: svc}
}

func (h *PublicRecipeHandler) GetAllRecipes(c *gin.Context) {
	out, err := h.svc.ListPublicRecipes(c.Request.Context())
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.GetAllRecipes: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, out)
}

func (h *PublicRecipeHandler) GetRecipeById(c *gin.Context) {
	id := c.Param("id")
	if !authorization.IsValidUUID(id) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}

	out, err := h.svc.GetPublicRecipe(c.Request.Context(), id)
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.GetRecipeById: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, out)
}

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
