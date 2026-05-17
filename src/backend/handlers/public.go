package handlers

import (
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/models"
	"ft_transcendence/backend/services"
)

type PublicRecipeHandler struct {
	svc services.RecipeService
}

func NewPublicRecipeHandler(svc services.RecipeService) *PublicRecipeHandler {
	return &PublicRecipeHandler{svc: svc}
}

func (h *PublicRecipeHandler) GetAllRecipes(c *gin.Context) {
	recipes, err := h.svc.ListPublicRecipes(c.Request.Context())
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.GetAllRecipes: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, recipes)
}

func (h *PublicRecipeHandler) GetRecipeById(c *gin.Context) {
	id := c.Param("id")
	if !authorization.IsValidUUID(id) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}
	recipe, err := h.svc.GetPublicRecipe(c.Request.Context(), id)
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.GetRecipeById: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, recipe)
}

func (h *PublicRecipeHandler) CreateRecipe(c *gin.Context) {
	var r models.Recipe
	if err := c.ShouldBindJSON(&r); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}

	id := c.GetString("userID")
	if !authorization.IsValidUUID(id) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	r.Author_id = id
	if err := validateRecipeFields(&r); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%v", err)})
		return
	}
	recipeID, err := h.svc.CreateRecipe(c.Request.Context(), r.Author_id, r)
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.CreateRecipe: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusCreated, gin.H{"id": recipeID})
}

func (h *PublicRecipeHandler) UpdateRecipe(c *gin.Context) {
	userID := c.GetString("userID")
	if !authorization.IsValidUUID(userID) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	recipeID := c.Param("id")
	if !authorization.IsValidUUID(recipeID) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}
	var r models.Recipe
	if err := c.ShouldBindJSON(&r); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}
	if err := validateRecipeFields(&r); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%v", err)})
		return
	}
	err := h.svc.UpdateRecipe(c.Request.Context(), userID, recipeID, r)
	if err != nil {
		if errors.Is(err, services.ErrForbidden) {
			c.IndentedJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.UpdateRecipe: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, gin.H{"id": recipeID})
}

func (h *PublicRecipeHandler) DeleteRecipe(c *gin.Context) {
	userID := c.GetString("userID")
	if !authorization.IsValidUUID(userID) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	recipeID := c.Param("id")
	if !authorization.IsValidUUID(recipeID) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}
	if err := h.svc.DeleteRecipe(c.Request.Context(), userID, recipeID); err != nil {
		if errors.Is(err, services.ErrForbidden) {
			c.IndentedJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.DeleteRecipe: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.Status(http.StatusNoContent)
}
