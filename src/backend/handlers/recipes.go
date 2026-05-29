package handlers

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

type RecipeHandler struct {
	Repo repository.RecipeRepository
}

func NewRecipeHandler(repo repository.RecipeRepository) *RecipeHandler {
	return &RecipeHandler{Repo: repo}
}

func (h *RecipeHandler) GetAllRecipes(c *gin.Context) {
	recipes, err := h.Repo.GetAllRecipes(c.Request.Context())
	if err != nil {
		log.Printf("handlers.GetAllRecipes: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, recipes)
}

func (h *RecipeHandler) GetRecipeByID(c *gin.Context) {
	id := c.Param("id")
	if !authorization.IsValidUUID(id) {
		c.JSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}

	recipe, err := h.Repo.GetRecipeByID(c.Request.Context(), id)
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.GetRecipeByID: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, recipe)
}

func (h *RecipeHandler) SearchRecipes(c *gin.Context) {
	var f models.SearchRecipeFilters

	if err := c.ShouldBindQuery(&f); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	f.Query = strings.TrimSpace(f.Query)
	const limitInt = 12

	if f.Page <= 0 {
		f.Page = 1
	}
	offset := (f.Page - 1) * limitInt

	recipes, err := h.Repo.SearchRecipes(c.Request.Context(), f, limitInt, offset)
	if err != nil {
		log.Printf("handlers.SearchRecipes: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, recipes)
}

func (h *RecipeHandler) CreateRecipe(c *gin.Context) {
	var r models.Recipe
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}
	r.AuthorID = c.GetString("userID")
	if !authorization.IsValidUUID(r.AuthorID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	if err := validateRecipeFields(&r); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%v", err)})
		return
	}

	newRecipeID, err := h.Repo.CreateRecipe(c.Request.Context(), &r)
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.CreateRecipe: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": newRecipeID})
}

func (h *RecipeHandler) UpdateRecipe(c *gin.Context) {
	userID := c.GetString("userID")
	if !authorization.IsValidUUID(userID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	recipeID := c.Param("id")
	if !authorization.IsValidUUID(recipeID) {
		c.JSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}

	var r models.Recipe
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}

	original, err := h.Repo.GetRecipeByID(c.Request.Context(), recipeID)
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.UpdateRecipe: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	roleSet, okRoles := authorization.RolesFromContext(c)
	permSet, okPerms := authorization.PermsFromContext(c)
	if !okRoles || !okPerms {
		log.Printf("handlers.UpdateRecipe: data missing from context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	allowed := authorization.CanEditRecipe(roleSet, permSet, userID, original.Author.ID)
	if !allowed {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	if err := validateRecipeFields(&r); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%v", err)})
		return
	}

	r.ID = recipeID
	if err := h.Repo.UpdateRecipe(c.Request.Context(), &r); err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.UpdateRecipe: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": recipeID})
}

func (h *RecipeHandler) DeleteRecipe(c *gin.Context) {
	userID := c.GetString("userID")
	if !authorization.IsValidUUID(userID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	recipeID := c.Param("id")
	if !authorization.IsValidUUID(recipeID) {
		c.JSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}

	original, err := h.Repo.GetRecipeByID(c.Request.Context(), recipeID)
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.DeleteRecipe: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	roleSet, okRoles := authorization.RolesFromContext(c)
	permSet, okPerms := authorization.PermsFromContext(c)
	if !okRoles || !okPerms {
		log.Printf("handlers.DeleteRecipe: data missing from context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	allowed := authorization.CanDeleteRecipe(roleSet, permSet, userID, original.Author.ID)
	if !allowed {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	if err := h.Repo.DeleteRecipe(c.Request.Context(), recipeID); err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.DeleteRecipe: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *RecipeHandler) RecipeImageSignature(c *gin.Context) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	folder := "recipes"
	allowedFormats := "jpg, jpeg, png, webp"
	params := map[string]string{
		"timestamp":       timestamp,
		"folder":          folder,
		"allowed_formats": allowedFormats,
	}
	signature := integrations.GenerateCloudinarySignature(params)

	c.JSON(http.StatusOK, gin.H{
		"signature":       signature,
		"api_key":         integrations.APIKey(),
		"cloud_name":      integrations.CloudName(),
		"timestamp":       timestamp,
		"folder":          folder,
		"allowed_formats": allowedFormats,
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
const imageURLLenMax = 255

func validateRecipeFields(r *models.Recipe) error {

	type intValidation struct {
		val      int
		s        string
		min, max int
	}

	// Minimum food: 1 serving of ice water
	intFields := []intValidation{
		{r.PreparationTimeMin, "preparation_time_min", 0, preparationTimeMax},
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
		{r.ProteinGrams, "protein_g", 0, proteinMax},
		{r.CarbsGrams, "carbs_g", 0, carbsMax},
		{r.FatGrams, "fat_g", 0, fatMax},
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
	r.ImageURL = strings.TrimSpace(r.ImageURL)

	stringLimits := []stringLenValidation{
		{r.Title, "title", titleLenMin, titleLenMax},
		{r.Description, "description", descriptionLenMin, descriptionLenMax},
		{r.Cuisine, "cuisine", 0, cuisineLenMax},
		{r.ImageURL, "image_url", 0, imageURLLenMax},
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

	switch r.MealType {
	case "breakfast", "lunch", "dinner", "snack":
	default:
		return errors.New("meal_type: must be breakfast, lunch, dinner, or snack")
	}

	if err := onlyGraphicChars(r.ImageURL); err != nil {
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
		c.JSON(http.StatusBadRequest, gin.H{"error": br.Error()})
		return true
	case errors.As(err, &nf):
		c.JSON(http.StatusNotFound, gin.H{"error": nf.Error()})
		return true
	}

	return false
}
