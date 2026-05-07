package handlers

import (
	"net/http"

	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
)

// Favourites handlers needed:
// [....] AddFavourite		— POST		/api/recipes/:id/favourite
// [TODO] RemoveFavourite	— DELETE	/api/recipes/:id/favourite
// [TODO] GetUserFavourites	— GET		/api/users/:id/favourites

func AddFavourite(c *gin.Context) {
	userId := c.GetString("userID")
	if !isValidUUID(userId) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	recipeId := c.Param("id")
	if !isValidUUID(recipeId) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}

	if err := repository.AddFavourite(c, userId, recipeId); err != nil {
		identifyAndRespondToError(c, "handlers.AddFavourite", err)
		return
	}

	c.Status(http.StatusOK)
}

type adminPayload struct {
	UserId   string `json:"user_id"`
	RecipeId string `json:"recipe_id"`
}

func AddFavouriteAdmin(c *gin.Context) {
	var p adminPayload
	if err := c.ShouldBindJSON(&p); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}

	if !isValidUUID(p.UserId) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	if !isValidUUID(p.RecipeId) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}

	if err := repository.AddFavourite(c, p.UserId, p.RecipeId); err != nil {
		identifyAndRespondToError(c, "handlers.AddFavouriteAdmin", err)
		return
	}

	c.Status(http.StatusOK)
}
