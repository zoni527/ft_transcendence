package handlers

// Recipe handlers needed:
// [done] GetAllRecipes     — GET /api/recipes
// [done] GetRecipeById     — GET /api/recipes/:id
// [done] CreateRecipe      — POST /api/recipes (validate + call CreateRecipe)
// [done] UpdateRecipe      — PUT /api/recipes/:id
// [done] DeleteRecipe      — DELETE /api/recipes/:id
// [TODO] UploadRecipeImage — POST /api/recipes/:id/image (multipart upload)

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/integrations"
	"ft_transcendence/backend/models"
	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
)

func GetAllRecipes(c *gin.Context) {
	recipes, err := repository.GetAllRecipes()
	if err != nil {
		log.Printf("handlers.GetAllRecipes: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, recipes)
}

func GetRecipeById(c *gin.Context) {
	id := c.Param("id")
	if !authorization.IsValidUUID(id) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}

	recipe, err := repository.GetRecipeById(id)
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

func CreateRecipe(c *gin.Context) {
	var r models.Recipe
	if err := c.ShouldBindJSON(&r); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}
	r.Author_id = c.GetString("userID")
	if !authorization.IsValidUUID(r.Author_id) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	if err := validateRecipeFields(&r); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%v", err)})
		return
	}

	newRecipeId, err := repository.CreateRecipe(&r)
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.CreateRecipe: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, gin.H{"id": newRecipeId})
}

func UpdateRecipe(c *gin.Context) {
	userId := c.GetString("userID")
	if !authorization.IsValidUUID(userId) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	recipeId := c.Param("id")
	if !authorization.IsValidUUID(recipeId) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}

	var r models.Recipe
	if err := c.ShouldBindJSON(&r); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}

	original, err := repository.GetRecipeById(recipeId)
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.UpdateRecipe: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	allowed, err := authorization.CanEditRecipe(userId, &original)
	if err != nil {
		log.Printf("CanEditRecipe: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	if !allowed {
		c.IndentedJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	if err := validateRecipeFields(&r); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%v", err)})
		return
	}

	r.Id = recipeId
	r.Author_id = original.Author_id
	if err := repository.UpdateRecipe(&r); err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.UpdateRecipe: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"id": recipeId})
}

func DeleteRecipe(c *gin.Context) {
	userId := c.GetString("userID")
	if !authorization.IsValidUUID(userId) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	recipeId := c.Param("id")
	if !authorization.IsValidUUID(recipeId) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}

	original, err := repository.GetRecipeById(recipeId)
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.DeleteRecipe: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	allowed, err := authorization.CanDeleteRecipe(userId, &original)
	if err != nil {
		log.Printf("CanDeleteRecipe: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	if !allowed {
		c.IndentedJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	if err := repository.DeleteRecipe(recipeId); err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.DeleteRecipe: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.Status(http.StatusNoContent)
}

func UploadRecipeImage(c *gin.Context) {
	// TODO: call repository.UploadRecipeImage()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func RecipeImageSignature(c *gin.Context) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	params := map[string]string{
		"timestamp": timestamp,
		"folder":    "recipes",
	}
	signature := integrations.GenerateCloudinarySignature(params)
	c.IndentedJSON(http.StatusOK, gin.H{
		"signature":  signature,
		"api_key":    integrations.APIKey(),
		"cloud_name": integrations.CloudName(),
		"timestamp":  timestamp,
		"folder":     "recipes",
	})
}

//------------------------------------------------------------------------------
// helper functions
// ----------------

// I know these values are ridiculous, but with this you could feed 100 sumo wrestlers
const preparationTimeMax = 60 * 1000 // 1000 hours max
const servingsMax = 100
const caloriesMax = 1000000

const proteinMax = 1000 * 100 // 100 kg
const carbsMax = 1000 * 100   // 100 kg
const fatMax = 1000 * 100     // 100 kg

const titleLenMin = 3
const titleLenMax = 60
const descriptionLenMin = 0
const descriptionLenMax = 10000
const cuisineLenMax = 50
const imageUrlLenMax = 255

func validateRecipeFields(r *models.Recipe) error {

	type intValidation struct {
		val      int
		s        string
		min, max int
	}

	// Minimum food: 1 serving of ice water
	intFields := []intValidation{
		{r.Preparation_time_min, "preparation_time_min", 0, preparationTimeMax},
		{r.Servings, "servings", 1, servingsMax},
		{r.Calories, "calories", 0, caloriesMax},
	}

	for _, v := range intFields {
		if err := numFieldOk(v.val, v.s, v.min, v.max); err != nil {
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
		{r.Protein_g, "protein_g", 0, proteinMax},
		{r.Carbs_g, "carbs_g", 0, carbsMax},
		{r.Fat_g, "fat_g", 0, fatMax},
	}

	for _, v := range floatFields {
		if err := numFieldOk(v.val, v.s, v.min, v.max); err != nil {
			return err
		}
	}

	// -----------------
	// string parameters
	// -----------------

	type stringLenValidation struct {
		field          string
		tag            string
		minLen, maxLen int
	}

	r.Title = strings.TrimSpace(r.Title)
	r.Description = strings.TrimSpace(r.Description)
	r.Cuisine = strings.TrimSpace(r.Cuisine)
	r.Image_url = strings.TrimSpace(r.Image_url)

	stringLimits := []stringLenValidation{
		{r.Title, "title", titleLenMin, titleLenMax},
		{r.Description, "description", descriptionLenMin, descriptionLenMax},
		{r.Cuisine, "cuisine", 0, cuisineLenMax},
		{r.Image_url, "image_url", 0, imageUrlLenMax},
	}

	for _, v := range stringLimits {
		runeLen := len([]rune(v.field))
		if runeLen < v.minLen {
			return fmt.Errorf("%v: too short", v.tag)
		} else if runeLen > v.maxLen {
			return fmt.Errorf("%v: too long", v.tag)
		}
	}

	if err := isValidTitle(r.Title); err != nil {
		return fmt.Errorf("title: %w", err)
	}

	if err := isValidDescription(r.Description); err != nil {
		return fmt.Errorf("description: %w", err)
	}

	switch r.Difficulty {
	case "easy", "medium", "hard":
	default:
		return errors.New("difficulty: must be easy, medium, or hard")
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
		return errors.New("meal_type: must be breakfast, lunch, dinner, or snack")
	}

	if err := onlyGraphicChars(r.Image_url); err != nil {
		return fmt.Errorf("image_url: %w", err)
	}

	return nil
}

func numFieldOk[T int | float64](field T, fieldName string, fieldMin, fieldMax T) error {
	if field < fieldMin || field > fieldMax {
		return fmt.Errorf("%v: bad value: %v", fieldName, field)
	}
	return nil
}

func isValidTitle(t string) error {
	runeLen := len([]rune(t))
	switch {
	case runeLen < titleLenMin:
		return fmt.Errorf("too short, min length is %v", titleLenMin)
	case runeLen > titleLenMax:
		return fmt.Errorf("too long, max length is %v", titleLenMax)
	}

	for _, c := range t {
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

func isValidDescription(d string) error {
	runeLen := len([]rune(d))
	switch {
	case runeLen < descriptionLenMin:
		return fmt.Errorf("too short, min length is %v", descriptionLenMin)
	case runeLen > descriptionLenMax:
		return fmt.Errorf("too long, max length is %v", descriptionLenMax)
	}

	for _, c := range d {
		if !(unicode.IsGraphic(c) || unicode.IsSpace(c)) {
			return fmt.Errorf("forbidden character: %v", c)
		}
	}

	return nil
}

func onlyGraphicChars(s string) error {
	for _, c := range s {
		if !unicode.IsGraphic(c) {
			return fmt.Errorf("invalid character: %v", c)
		}
	}
	return nil
}

func identifyAndRespondToUserError(c *gin.Context, err error) bool {
	var br *repository.BadRequestError
	var nf *repository.NotFoundError
	switch {
	case errors.As(err, &br):
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": br.Error()})
		return true
	case errors.As(err, &nf):
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": nf.Error()})
		return true
	}

	return false
}
