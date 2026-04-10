package handlers

// Recipe handlers needed:
// [done] GetAllRecipes   — GET /api/recipes
// [done] GetRecipeById   — GET /api/recipes/:id
// [TODO] CreateRecipe    — POST /api/recipes (validate + call CreateRecipe)
// [TODO] UpdateRecipe    — PUT /api/recipes/:id
// [TODO] PatchRecipe     — PATCH /api/recipes/:id
// [TODO] DeleteRecipe    — DELETE /api/recipes/:id
// [TODO] UploadRecipeImage — POST /api/recipes/:id/image (multipart upload)

import (
	"net/http"
	"ft_transcendence/backend/repository"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

func GetAllRecipes(c *gin.Context) {
	recipes, err := repository.GetAllRecipes()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, recipes)
}

func GetRecipeById(c *gin.Context) {
	id := c.Param("id")

	recipe, err := repository.GetRecipeById(id)
	if err == pgx.ErrNoRows {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, recipe)
}

func CreateRecipe(c *gin.Context) {
	// TODO: call repository.CreateRecipe()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"message": "not implemented yet"})
}
