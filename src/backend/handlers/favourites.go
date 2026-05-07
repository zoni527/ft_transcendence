package handlers

import (
	"log"
	"net/http"

	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
)

// Favourites handlers needed:
// [TODO] AddFavourite		— POST		/api/recipes/:id/favourite
// [TODO] RemoveFavourite	— DELETE	/api/recipes/:id/favourite
// [TODO] GetUserFavourites	— GET		/api/users/:id/favourites

func AddFavourite(c *gin.Context) {
	recipeId := c.Param("id")
	if !isValidUUID(recipeId) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}

	userId := c.GetString("userID")
	if !isValidUUID(userId) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := repository.AddFavourite(c, userId, recipeId); err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.FavouriteRecipe: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
	}

	c.Status(http.StatusOK)
}
