package handlers

// Recipe handlers needed:
// [TODO] GetRecipes      — GET /api/recipes (parse query params for filters)
// [TODO] GetRecipeById   — GET /api/recipes/:id
// [TODO] PostRecipe      — POST /api/recipes (validate + call CreateRecipe)
// [TODO] PutRecipe       — PUT /api/recipes/:id
// [TODO] PatchRecipe     — PATCH /api/recipes/:id
// [TODO] DeleteRecipe    — DELETE /api/recipes/:id
// [TODO] PostRecipeImage — POST /api/recipes/:id/image (multipart upload)

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetRecipes(c *gin.Context) {
	// TODO: call db.GetAllRecipes()
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}

func GetRecipeById(c *gin.Context) {
	// TODO: call db.GetRecipeById()
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}

func PostRecipe(c *gin.Context) {
	// TODO: call db.CreateRecipe()
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}
