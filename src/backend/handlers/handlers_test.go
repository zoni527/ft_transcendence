package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"strings"
	"testing"

	"ft_transcendence/backend/models"

	"github.com/gin-gonic/gin"
)

var goodTestRecipes = []models.Recipe{
	{
		Title:                "Max preparation time",
		Description:          strings.Repeat("-", descriptionLenMin),
		Servings:             1,
		Difficulty:           "easy",
		Meal_type:            "snack",
		Preparation_time_min: preparationTimeMax,
	},
	{
		Title:       "Max servings",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    servingsMax,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Max calories",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
		Calories:    caloriesMax,
	},
	{
		Title:       "Max protein",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
		Protein_g:   proteinMax,
	},
	{
		Title:       "Max carbs",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
		Carbs_g:     carbsMax,
	},
	{
		Title:       "Max fat",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
		Fat_g:       fatMax,
	},
	{
		Title:       strings.Repeat("-", titleLenMin),
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       strings.Repeat("-", titleLenMax),
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Max description length",
		Description: strings.Repeat("-", descriptionLenMax),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Max cuisine length",
		Description: strings.Repeat("-", descriptionLenMin),
		Cuisine:     strings.Repeat("-", cuisineLenMax),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Max image url length",
		Description: strings.Repeat("-", descriptionLenMin),
		Image_url:   strings.Repeat("-", imageUrlLenMax),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Newlines in description",
		Description: "Testing\nnewlines\nin\na\ndescription",
		Image_url:   strings.Repeat("-", imageUrlLenMax),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
}

var badTestRecipes = []models.Recipe{
	{
		Title:       "No servings",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    0,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:                "Preparation time too big",
		Description:          strings.Repeat("-", descriptionLenMin),
		Servings:             1,
		Difficulty:           "easy",
		Meal_type:            "snack",
		Preparation_time_min: preparationTimeMax + 1,
	},
	{
		Title:                "Negative preparation time",
		Description:          strings.Repeat("-", descriptionLenMin),
		Servings:             1,
		Difficulty:           "easy",
		Meal_type:            "snack",
		Preparation_time_min: -1,
	},
	{
		Title:       "Too many servings",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    servingsMax + 1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Negative servings",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    -1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Too many calories",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Calories:    caloriesMax + 1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Negative calories",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Calories:    -1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Too much protein",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Protein_g:   proteinMax + 1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Negative protein",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Protein_g:   -1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Too much carbs",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Carbs_g:     carbsMax + 1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Negative carbs",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Carbs_g:     -1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Too much fat",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Fat_g:       fatMax + 1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Negative fat",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Fat_g:       -1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       strings.Repeat("-", titleLenMin-1),
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       strings.Repeat("-", titleLenMax+1),
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Description too long",
		Description: strings.Repeat("-", descriptionLenMax+1),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Cuisine too long",
		Description: strings.Repeat("-", descriptionLenMin),
		Cuisine:     strings.Repeat("-", cuisineLenMax+1),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Image url too long",
		Description: strings.Repeat("-", descriptionLenMin),
		Image_url:   strings.Repeat("-", imageUrlLenMax+1),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
}

var goodTitles = []string{
	"Hamburger",
	"abc",
	"Dal",
	"Smash burger",
	"SUPER TASTY RECIPE!",
	"This too, is a recipe 🍜",
	"🍣🍣🍣",
	"Over 9000",
	"Mom's spaghetti",
}

var badTitles = []string{
	"",
	"a",
	"ab",
	"This title is too long for a title, nobody has time to read all this text I must say",
}

func TestRecipeValidation(t *testing.T) {
	for _, v := range goodTestRecipes {
		if err := validateRecipeFields(&v); err != nil {
			t.Errorf(`validateRecipeFields(%#v) = %v, want %v`, v, err, nil)
		}
	}

	for _, v := range badTestRecipes {
		if err := validateRecipeFields(&v); err == nil {
			t.Errorf(`validateRecipeFields(%#v) = %v, expected error`, v, err)
		}
	}
}

func TestTitles(t *testing.T) {
	for _, v := range goodTitles {
		if err := isValidTitle(v); err != nil {
			t.Errorf(`isValidTitle(%#v) = %v, want %v`, v, err, nil)
		}
	}

	for _, v := range badTitles {
		if err := isValidTitle(v); err == nil {
			t.Errorf(`isValidTitle(%#v) = %v, expected error`, v, err)
		}
	}
}

func TestValidateCloudinaryAvatarURL(t *testing.T) {
	goodURLs := []string{
		"",
		"https://res.cloudinary.com/demo/image/upload/v123/avatar.png",
		"https://res.cloudinary.com/my-cloud/avatar/user-1.webp",
	}

	badURLs := []string{
		"http://res.cloudinary.com/demo/image/upload/v123/avatar.png",
		"https://example.com/demo/image/upload/v123/avatar.png",
		"https://res.cloudinary.com",
		"https://res.cloudinary.com/demo",
		"not-a-url",
	}

	for _, u := range goodURLs {
		if err := validateCloudinaryAvatarURL(u); err != nil {
			t.Errorf("validateCloudinaryAvatarURL(%q) returned unexpected error: %v", u, err)
		}
	}

	for _, u := range badURLs {
		if err := validateCloudinaryAvatarURL(u); err == nil {
			t.Errorf("validateCloudinaryAvatarURL(%q) expected error, got nil", u)
		}
	}
}

type MockRecipeRepo struct {
	MockGetAllRecipes func(ctx context.Context) ([]models.RecipeResponse, error)
	MockGetRecipeById func(ctx context.Context, id string) (models.RecipeResponse, error)
	MockCreateRecipe  func(ctx context.Context, r *models.Recipe) (string, error)
	MockUpdateRecipe  func(ctx context.Context, r *models.Recipe) error
	MockDeleteRecipe  func(ctx context.Context, id string) error
}

func (repo *MockRecipeRepo) GetAllRecipes(ctx context.Context) ([]models.RecipeResponse, error) {
	if repo.MockGetAllRecipes != nil {
		return repo.MockGetAllRecipes(ctx)
	}
	return nil, nil
}
func (repo *MockRecipeRepo) GetRecipeById(ctx context.Context, id string) (models.RecipeResponse, error) {
	if repo.MockGetRecipeById != nil {
		return repo.MockGetRecipeById(ctx, id)
	}
	return models.RecipeResponse{}, nil
}
func (repo *MockRecipeRepo) CreateRecipe(ctx context.Context, r *models.Recipe) (string, error) {
	if repo.MockCreateRecipe != nil {
		return repo.MockCreateRecipe(ctx, r)
	}
	return "", nil
}
func (repo *MockRecipeRepo) UpdateRecipe(ctx context.Context, r *models.Recipe) error {
	if repo.MockUpdateRecipe != nil {
		return repo.MockUpdateRecipe(ctx, r)
	}
	return nil
}
func (repo *MockRecipeRepo) DeleteRecipe(ctx context.Context, id string) error {
	if repo.MockDeleteRecipe != nil {
		return repo.MockDeleteRecipe(ctx, id)
	}
	return nil
}

// =============
// GetRecipeById
// =============

func TestGetRecipeById_Success(t *testing.T) {
	mockRepo := &MockRecipeRepo{
		MockGetRecipeById: func(ctx context.Context, id string) (models.RecipeResponse, error) {
			return models.RecipeResponse{Id: id, Title: "Success"}, nil
		},
	}

	recipeHandler := NewRecipeHandler(mockRepo)
	r := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(r)
	testId := "aa899f26-cf36-4570-b952-58752e6bf79a"

	c.Request = httptest.NewRequest("GET", fmt.Sprintf("/api/recipes/%v", testId), nil)
	c.Params = append(c.Params, gin.Param{Key: "id", Value: testId})

	recipeHandler.GetRecipeById(c)

	if r.Code != 200 {
		t.Fatalf("expected 200, got %v", r.Code)
	}

	var response models.RecipeResponse
	if err := json.Unmarshal(r.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to parse response body: %v", err)
	}

	if response.Id != testId {
		t.Errorf("expected Id %q, got %q", testId, response.Id)
	}

	if response.Title != "Success" {
		t.Errorf("expected Title `Success', got `%q'", response.Title)
	}
}
