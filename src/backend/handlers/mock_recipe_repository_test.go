package handlers

import (
	"context"
	"errors"
	"io"
	"net/http/httptest"
	"strings"
	"testing"

	"ft_transcendence/backend/models"

	"github.com/gin-gonic/gin"
)

type MockRecipeRepo struct {
	MockGetAllRecipes func(ctx context.Context) ([]models.RecipeResponse, error)
	MockGetRecipeById func(ctx context.Context, id string) (models.RecipeResponse, error)
	MockCreateRecipe  func(ctx context.Context, r *models.Recipe) (string, error)
	MockUpdateRecipe  func(ctx context.Context, r *models.Recipe) error
	MockDeleteRecipe  func(ctx context.Context, id string) error
	MockSearchRecipes func(ctx context.Context, f models.SearchRecipeFilters, limit, offset int) ([]models.SearchRecipeResponse, error)
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
func (repo *MockRecipeRepo) SearchRecipes(ctx context.Context, f models.SearchRecipeFilters, limit, offset int) ([]models.SearchRecipeResponse, error) {
	if repo.MockSearchRecipes != nil {
		return repo.MockSearchRecipes(ctx, f, limit, offset)
	}
	return nil, nil
}

// =============
// GetAllRecipes
// =============

var getAllRecipesTests = []struct {
	name           string
	mockSetup      func(repo *MockRecipeRepo)
	expectedStatus int
	expectedBody   string
}{
	{
		name: "Success",
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockGetAllRecipes = func(ctx context.Context) ([]models.RecipeResponse, error) {
				return []models.RecipeResponse{{Title: "Success"}}, nil
			}
		},
		expectedStatus: 200,
		expectedBody:   `"title": "Success"`,
	},
	{
		name: "Error",
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockGetAllRecipes = func(ctx context.Context) ([]models.RecipeResponse, error) {
				return nil, errors.New("error")
			}
		},
		expectedStatus: 500,
		expectedBody:   `"error": "internal server error"`,
	},
}

func TestGetAllRecipes_TableDriven(t *testing.T) {
	for _, tt := range getAllRecipesTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockRecipeRepo{}
			tt.mockSetup(mockRepo)

			recipeHandler := NewRecipeHandler(mockRepo)
			w, c := setupTestContext("GET", "/api/recipes", nil)

			recipeHandler.GetAllRecipes(c)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
			if !strings.Contains(w.Body.String(), tt.expectedBody) {
				t.Errorf("Expected body to contain %q, got %q", tt.expectedBody, w.Body.String())
			}
		})
	}
}

// =============
// GetRecipeById
// =============

var getRecipeByIdTests = []struct {
	name           string
	recipeId       string
	mockSetup      func(repo *MockRecipeRepo)
	expectedStatus int
	expectedBody   string
}{
	{
		name:     "Success",
		recipeId: "aa899f26-cf36-4570-b952-58752e6bf79a",
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockGetRecipeById = func(ctx context.Context, id string) (models.RecipeResponse, error) {
				return models.RecipeResponse{Id: id, Title: "Success"}, nil
			}
		},
		expectedStatus: 200,
		expectedBody:   `"title": "Success"`,
	},
	{
		name:           "Invalid UUID caught by handler validation",
		recipeId:       "invalid-uuid",
		mockSetup:      func(repo *MockRecipeRepo) {},
		expectedStatus: 404,
		expectedBody:   `"error": "recipe not found"`,
	},
	{
		name:     "Internal server error",
		recipeId: "aa899f26-cf36-4570-b952-58752e6bf79a",
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockGetRecipeById = func(ctx context.Context, id string) (models.RecipeResponse, error) {
				return models.RecipeResponse{}, errors.New("problem with database")
			}
		},
		expectedStatus: 500,
		expectedBody:   `"error": "internal server error"`,
	},
}

func TestGetRecipeById_TableDriven(t *testing.T) {
	for _, tt := range getRecipeByIdTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockRecipeRepo{}
			tt.mockSetup(mockRepo)

			recipeHandler := NewRecipeHandler(mockRepo)
			w, c := setupTestContext("GET", "/api/recipes/"+tt.recipeId, nil)
			c.Params = append(c.Params, gin.Param{Key: "id", Value: tt.recipeId})

			recipeHandler.GetRecipeById(c)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
			if !strings.Contains(w.Body.String(), tt.expectedBody) {
				t.Errorf("Expected body to contain %q, got %q", tt.expectedBody, w.Body.String())
			}
		})
	}
}

func setupTestContext(method, path string, body io.Reader) (*httptest.ResponseRecorder, *gin.Context) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(method, path, body)
	return w, c
}
