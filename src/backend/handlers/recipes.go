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
	"strconv"
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

func intParamParse(c *gin.Context, s string, r *models.Recipe) bool {
	var iPtr *int

	switch s {
	case "prep_time_min":
		iPtr = &r.Prep_time_min
	case "cook_time_min":
		iPtr = &r.Cook_time_min
	case "servings":
		iPtr = &r.Servings
	case "calories":
		iPtr = &r.Calories
	default:
		c.IndentedJSON(http.StatusInternalServerError, gin.H{
			"error": "internal server error",
		})
		return false
	}

	var err error = nil

	// int parameters aren required fields in the database, thus "" -> 0 isn't validated
	// at the moment
	if c.Param(s) != "" {
		*iPtr, err = strconv.Atoi(c.Param(s))
		if err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintln("%v: not a valid int: %v", s, c.Param(s)),
			})
			return false
		}
	}

	return true
}

func floatParamParse(c *gin.Context, s string, r *models.Recipe) bool {
	var fPtr *float64

	switch s {
	case "protein_g":
		fPtr = &r.Protein_g
	case "carbs_g":
		fPtr = &r.Carbs_g
	case "Fat_g":
		fPtr = &r.Fat_g
	default:
		c.IndentedJSON(http.StatusInternalServerError, gin.H{
			"error": "internal server error",
		})
		return false
	}

	var err error = nil
	if c.Param(s) != "" {
		*fPtr, err = strconv.ParseFloat(s, 64)
		if err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintln("%v: not a valid float: %v", s, c.Param(s)),
			})
			return false
		}
	}

	return true
}

func CreateRecipe(c *gin.Context) {
	// -----------------
	// string parameters
	// -----------------
	r := models.Recipe{
		Author_id:   c.Param("author_id"),
		Title:       c.Param("title"),
		Description: c.Param("description"),
		Difficulty:  c.Param("difficulty"),
		Cuisine:     c.Param("cuisine"),
		Meal_type:   c.Param("meal_type"),
		Image_url:   c.Param("image_url"),
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

	if !intParamParse(c, "prep_time_min", &r) ||
		!intParamParse(c, "cook_time_min", &r) ||
		!intParamParse(c, "servings", &r) ||
		!intParamParse(c, "calories", &r) {
		return
	}

	// ------------------
	// float64 parameters
	// ------------------

	if !floatParamParse(c, "protein_g", &r) ||
		!floatParamParse(c, "carbs_g", &r) ||
		!floatParamParse(c, "fat_g", &r) {
		return
	}

	// --------------
	// bool parameter
	// --------------

	isPublished := c.Param("is_published")
	if isPublished != "true" && isPublished != "false" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("bad value for is_publised: %v", isPublished),
		})
		return
	}
	r.Is_published = isPublished == "true"

	// TODO: call repository.CreateRecipe()
	repository.CreateRecipe(&r)
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

//------------------------------------------------------------------------------

const TITLE_MAX_LEN = 20

func IsValidTitle(t *string) error {
	if *t == "" {
		return fmt.Errorf("empty string")
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
