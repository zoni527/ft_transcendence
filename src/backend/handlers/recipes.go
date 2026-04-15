package handlers

// Recipe handlers needed:
// [done] GetAllRecipes     — GET /api/recipes
// [done] GetRecipeById     — GET /api/recipes/:id
// [....] CreateRecipe      — POST /api/recipes (validate + call CreateRecipe)
// [TODO] UpdateRecipe      — PUT /api/recipes/:id
// [TODO] PatchRecipe       — PATCH /api/recipes/:id
// [TODO] DeleteRecipe      — DELETE /api/recipes/:id
// [TODO] UploadRecipeImage — POST /api/recipes/:id/image (multipart upload)

import (
	"fmt"
	"log"
	"net/http"
	"unicode"

	"ft_transcendence/backend/models"
	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

func GetAllRecipes(c *gin.Context) {
	recipes, err := repository.GetAllRecipes()
	if err != nil {
		log.Printf("GetAllRecipes error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, recipes)
}

func GetRecipeById(c *gin.Context) {
	id := c.Param("id")
	if !isValidUUID(id) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid recipe ID format"})
		return
	}

	recipe, err := repository.GetRecipeById(id)
	if err == pgx.ErrNoRows {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}
	if err != nil {
		log.Printf("GetRecipeById error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, recipe)
}

func CreateRecipe(c *gin.Context) {
	var r models.Recipe

	// BindJSON calls a function that will respond 400 if there is an error,
	// not possible to get further details
	if err := c.BindJSON(&r); err != nil {
		return
	}

	// Check if author_id exists in database, if not, no go
	if _, err := repository.GetUserById(r.Author_id); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("author `%v' not in database", r.Author_id),
		})
		return
	}

	if err := IsValidTitle(&r.Title); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%v", err)})
		return
	}

	// --------------
	// int parameters
	// --------------

	// I know these values are ridiculous, but with this you could feed 100 sumo wrestlers
	const PREP_TIME_MAX = 60 * 1000 // 1000 hours max
	const COOK_TIME_MAX = 60 * 100  // 100 hours max
	const SERVINGS_MAX = 100
	const CALORIES_MAX = 1000000

	switch {
	case !intFieldOk(c, &r.Prep_time_min, "prep time", 0, PREP_TIME_MAX),
		!intFieldOk(c, &r.Cook_time_min, "cook time", 0, COOK_TIME_MAX),
		!intFieldOk(c, &r.Servings, "servings", 1, SERVINGS_MAX),
		!intFieldOk(c, &r.Calories, "calories", 0, CALORIES_MAX): // Allows one serving of ice water
		return
	}

	// ------------------
	// float64 parameters
	// ------------------

	const PROTEIN_MAX = 1000 * 100 // 100 kg
	const CARBS_MAX = 1000 * 100   // 100 kg
	const FAT_MAX = 1000 * 100     // 100 kg

	switch {
	case !floatFieldOk(c, &r.Protein_g, "protein grams", 0, PROTEIN_MAX),
		!floatFieldOk(c, &r.Carbs_g, "carbs grams", 0, CARBS_MAX),
		!floatFieldOk(c, &r.Fat_g, "calories", 0, FAT_MAX):
		return
	}

	newRecipe, err := repository.CreateRecipe(&r)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("internal server error: %w", err),
		})
	}
	c.IndentedJSON(http.StatusOK, newRecipe)
}

//------------------------------------------------------------------------------
// helper functions
// ----------------

func intFieldOk(c *gin.Context, field *int, fieldName string, fieldMin, fieldMax int) bool {
	if *field < fieldMin || *field > fieldMax {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("bad %v value: %v", fieldName, *field),
		})
		return false
	}
	return true
}

func floatFieldOk(c *gin.Context, field *float64, fieldName string, fieldMin, fieldMax float64) bool {
	if *field < fieldMin || *field > fieldMax {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("bad %v value: %v", fieldName, *field),
		})
		return false
	}
	return true
}

const TITLE_MAX_LEN = 20

func IsValidTitle(t *string) error {
	if *t == "" {
		return fmt.Errorf("title: empty string")
	}

	if len(*t) > TITLE_MAX_LEN {
		return fmt.Errorf("title too long")
	}

	for _, c := range *t {
		if !(unicode.IsLetter(c) || unicode.IsNumber(c) || c == ' ') {
			return fmt.Errorf("forbidden title character: %v", c)
		}
	}

	return nil
}
