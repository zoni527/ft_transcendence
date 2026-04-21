package handlers

// Recipe handlers needed:
// [done] GetAllRecipes     — GET /api/recipes
// [done] GetRecipeById     — GET /api/recipes/:id
// [done] CreateRecipe      — POST /api/recipes (validate + call CreateRecipe)
// [TODO] UpdateRecipe      — PUT /api/recipes/:id
// [TODO] PatchRecipe       — PATCH /api/recipes/:id
// [TODO] DeleteRecipe      — DELETE /api/recipes/:id
// [TODO] UploadRecipeImage — POST /api/recipes/:id/image (multipart upload)

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"unicode"

	"ft_transcendence/backend/models"
	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
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

	recipe, err := repository.GetRecipeById(&id)
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

	// TODO:	currently anyone can create a recipe as any user, need further
	//			validation later
	if !isValidUUID(r.Author_id) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid author_id format"})
		return
	}

	if err := ValidateRecipeFields(&r); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%v", err)})
		return
	}

	newRecipeId, err := repository.CreateRecipe(&r)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case pgerrcode.ForeignKeyViolation:
				c.IndentedJSON(http.StatusBadRequest, gin.H{
					"error": fmt.Sprintf("author id %v not in database", r.Author_id),
				})
				return
			case pgerrcode.CheckViolation:
				c.IndentedJSON(http.StatusBadRequest, gin.H{
					"error": fmt.Sprintf("constraint %v violated", pgErr.ConstraintName),
				})
				return
			}
		}
		log.Printf("CreateRecipe error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, gin.H{"id": newRecipeId})
}

func UpdateRecipe(c *gin.Context) {
	// TODO: call repository.UpdateRecipe()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func PatchRecipe(c *gin.Context) {
	// TODO: call repository.PatchRecipe()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func DeleteRecipe(c *gin.Context) {
	// TODO: call repository.DeleteRecipe()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func UploadRecipeImage(c *gin.Context) {
	// TODO: call repository.UploadRecipeImage()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

//------------------------------------------------------------------------------
// helper functions
// ----------------

// I know these values are ridiculous, but with this you could feed 100 sumo wrestlers
const PREP_TIME_MAX = 60 * 1000 // 1000 hours max
const COOK_TIME_MAX = 60 * 100  // 100 hours max
const SERVINGS_MAX = 100
const CALORIES_MAX = 1000000

const PROTEIN_MAX = 1000 * 100 // 100 kg
const CARBS_MAX = 1000 * 100   // 100 kg
const FAT_MAX = 1000 * 100     // 100 kg

const TITLE_LEN_MIN = 3
const TITLE_LEN_MAX = 60
const DESCRIPTION_LEN_MIN = 0
const DESCRIPTION_LEN_MAX = 10000
const CUISINE_LEN_MAX = 50
const IMAGE_URL_LEN_MAX = 100

func ValidateRecipeFields(r *models.Recipe) error {

	type intValidation struct {
		val      int
		s        string
		min, max int
	}

	// Minimum food: 1 serving of ice water
	intFields := []intValidation{
		{r.Prep_time_min, "prep_time_min", 0, PREP_TIME_MAX},
		{r.Cook_time_min, "cook_time_min", 0, COOK_TIME_MAX},
		{r.Servings, "servings", 1, SERVINGS_MAX},
		{r.Calories, "calories", 0, CALORIES_MAX},
	}

	for _, v := range intFields {
		if err := NumFieldOk(v.val, &v.s, v.min, v.max); err != nil {
			return err
		}
	}

	// ------------------
	// float64 parameters
	// ------------------

	type floatValidation struct {
		val      float64
		s        string
		min, max float64
	}

	floatFields := []floatValidation{
		{r.Protein_g, "protein_g", 0, PROTEIN_MAX},
		{r.Carbs_g, "carbs_g", 0, CARBS_MAX},
		{r.Fat_g, "fat_g", 0, FAT_MAX},
	}

	for _, v := range floatFields {
		if err := NumFieldOk(v.val, &v.s, v.min, v.max); err != nil {
			return err
		}
	}

	// -----------------
	// string parameters
	// -----------------

	type stringLenValidation struct {
		field          *string
		tag            string
		minLen, maxLen int
	}

	r.Title = strings.TrimSpace(r.Title)
	r.Description = strings.TrimSpace(r.Description)
	r.Cuisine = strings.TrimSpace(r.Cuisine)
	r.Image_url = strings.TrimSpace(r.Image_url)

	stringLimits := []stringLenValidation{
		{&r.Title, "title", TITLE_LEN_MIN, TITLE_LEN_MAX},
		{&r.Description, "description", DESCRIPTION_LEN_MIN, DESCRIPTION_LEN_MAX},
		{&r.Cuisine, "cuisine", 0, CUISINE_LEN_MAX},
		{&r.Image_url, "image_url", 0, IMAGE_URL_LEN_MAX},
	}

	for _, v := range stringLimits {
		runeLen := len([]rune(*v.field))
		if runeLen < v.minLen {
			return fmt.Errorf("%v: too short", v.tag)
		} else if runeLen > v.maxLen {
			return fmt.Errorf("%v: too long", v.tag)
		}
	}

	if err := IsValidTitle(&r.Title); err != nil {
		return fmt.Errorf("title: %w", err)
	}

	if err := OnlyGraphicChars(&r.Description); err != nil {
		return fmt.Errorf("description: %w", err)
	}

	switch r.Difficulty {
	case "easy", "medium", "hard":
	default:
		return fmt.Errorf("difficulty: must be easy, medium, or hard")
	}

	for _, c := range r.Cuisine {
		if !(unicode.IsLetter(c) ||
			unicode.IsSymbol(c) ||
			unicode.IsPunct(c) ||
			c == ' ') {
			return fmt.Errorf("cuisine: bad character: %v", c)
		}
	}

	switch r.Meal_type {
	case "breakfast", "lunch", "dinner", "snack":
	default:
		return fmt.Errorf("meal_type: must be breakfast, lunch, dinner, or snack")
	}

	if err := OnlyGraphicChars(&r.Image_url); err != nil {
		return fmt.Errorf("image_url: %w", err)
	}

	return nil
}

func NumFieldOk[T int | float64](field T, fieldName *string, fieldMin, fieldMax T) error {
	if field < fieldMin || field > fieldMax {
		return fmt.Errorf("%v: bad value: %v", *fieldName, field)
	}
	return nil
}

func IsValidTitle(t *string) error {
	if *t == "" {
		return fmt.Errorf("empty string")
	}

	runeLen := len([]rune(*t))
	switch {
	case runeLen < TITLE_LEN_MIN:
		return fmt.Errorf("too short")
	case runeLen > TITLE_LEN_MAX:
		return fmt.Errorf("too long")
	}

	for _, c := range *t {
		if !(unicode.IsLetter(c) ||
			unicode.IsNumber(c) ||
			unicode.IsSymbol(c) ||
			unicode.IsPunct(c) ||
			c == ' ') {
			return fmt.Errorf("forbidden character: %v", c)
		}
	}

	return nil
}

func OnlyGraphicChars(s *string) error {
	for _, c := range *s {
		if !unicode.IsGraphic(c) {
			return fmt.Errorf("invalid character: %v", c)
		}
	}
	return nil
}
