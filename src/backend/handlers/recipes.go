package handlers

// Recipe handlers needed:
// [done] GetAllRecipes     — GET /api/recipes
// [done] GetRecipeById     — GET /api/recipes/:id
// [done] CreateRecipe      — POST /api/recipes (validate + call CreateRecipe)
// [TODO] UpdateRecipe      — PUT /api/recipes/:id
// [TODO] DeleteRecipe      — DELETE /api/recipes/:id
// [TODO] UploadRecipeImage — POST /api/recipes/:id/image (multipart upload)

import (
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
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

	if err := c.ShouldBindJSON(&r); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid input data"})
		return
	}

	// TODO:	currently anyone can create a recipe as any user, need further
	//			validation later
	if !isValidUUID(r.Author_id) {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid author_id format"})
		return
	}

	if err := validateRecipeFields(&r); err != nil {
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
				log.Printf("%v: %v", pgErr.ColumnName, pgErr.ConstraintName)
				c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "bad recipe field"})
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

func DeleteRecipe(c *gin.Context) {
	// TODO: call repository.DeleteRecipe()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

// Cloudinary API details to generate signature
var cloudinarySecret []byte
var cloudinaryUser []byte
var cloudinaryKey []byte

func LoadCloudinaryVars() error {
	secret := strings.TrimSpace(os.Getenv("CLOUDINARY_SECRET"))
	user := strings.TrimSpace(os.Getenv("CLOUDINARY_USER"))
	key := strings.TrimSpace(os.Getenv("CLOUDINARY_KEY"))
	if secret == "" || user == "" || key == "" {
		return errors.New("missing or empty Cloudinary env variables")
	}
	cloudinarySecret = []byte(secret)
	cloudinaryUser = []byte(user)
	cloudinaryKey = []byte(key)
	return nil
}

func RecipeImageSignature(c *gin.Context) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	params := map[string]string{
		"timestamp": timestamp,
		"folder":    "recipes",
	}
	signature := generateCloudinarySignature(params)
	c.IndentedJSON(http.StatusOK, gin.H{
		"signature":  signature,
		"api_key":    string(cloudinaryKey),
		"cloud_name": string(cloudinaryUser),
		"timestamp":  timestamp,
		"folder":     "recipes",
	})
}

func UploadRecipeImage(c *gin.Context) {
	// TODO: call repository.DeleteRecipe()
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

//------------------------------------------------------------------------------
// helper functions
// ----------------

// I know these values are ridiculous, but with this you could feed 100 sumo wrestlers
const prepTimeMax = 60 * 1000 // 1000 hours max
const cookTimeMax = 60 * 100  // 100 hours max
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
		{r.Prep_time_min, "prep_time_min", 0, prepTimeMax},
		{r.Cook_time_min, "cook_time_min", 0, cookTimeMax},
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

func generateCloudinarySignature(params map[string]string) string {
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var strToSign []string
	for _, k := range keys {
		strToSign = append(strToSign, fmt.Sprintf("%s=%s", k, params[k]))
	}

	queryString := strings.Join(strToSign, "&")
	fullString := queryString + string(cloudinarySecret)

	h := sha1.New()
	h.Write([]byte(fullString))

	return hex.EncodeToString(h.Sum(nil))
}

func RequiredRolesMiddleware(allowed ...string) gin.HandlerFunc {
	allowedRoles := map[string]bool{}
	for _, r := range allowed {
		allowedRoles[r] = true
	}
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		if !isValidUUID(userID) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		roles, err := repository.GetRolesByUserId(userID)
		if err != nil {
			log.Printf("GetRolesByUserId: %v", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		for _, r := range roles {
			if allowedRoles[r] {
				c.Next()
				return
			}
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
	}
}
