package handlers

import (
	"net/http"

	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
)

// Favourites handlers needed:
// [done] AddFavourite		— POST		/api/recipes/:id/favourite
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

	if err := repository.AddFavourite(userId, recipeId); err != nil {
		identifyAndRespondToError(c, "handlers.AddFavourite", err)
		return
	}

	c.Status(http.StatusOK)
}
