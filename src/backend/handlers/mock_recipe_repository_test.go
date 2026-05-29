package handlers

import (
	"context"
	"errors"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"ft_transcendence/backend/models"
	"ft_transcendence/backend/repository"

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

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	os.Exit(m.Run())
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
		expectedBody:   `"title":"Success"`,
	},
	{
		name: "Error",
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockGetAllRecipes = func(ctx context.Context) ([]models.RecipeResponse, error) {
				return nil, errors.New("error")
			}
		},
		expectedStatus: 500,
		expectedBody:   `"error":"internal server error"`,
	},
}

func TestGetAllRecipes_TableDriven(t *testing.T) {
	for _, tt := range getAllRecipesTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockRecipeRepo{}
			tt.mockSetup(mockRepo)

			recipeHandler := NewRecipeHandler(mockRepo)
			router := gin.New()
			router.GET("/api/recipes", recipeHandler.GetAllRecipes)
			req := httptest.NewRequest(
				"GET",
				"/api/recipes",
				nil,
			)
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

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
		expectedBody:   `"title":"Success"`,
	},
	{
		name:           "Invalid UUID caught by handler validation",
		recipeId:       "invalid-uuid",
		mockSetup:      func(repo *MockRecipeRepo) {},
		expectedStatus: 404,
		expectedBody:   `"error":"recipe not found"`,
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
		expectedBody:   `"error":"internal server error"`,
	},
}

func TestGetRecipeById_TableDriven(t *testing.T) {
	for _, tt := range getRecipeByIdTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockRecipeRepo{}
			tt.mockSetup(mockRepo)

			recipeHandler := NewRecipeHandler(mockRepo)
			router := gin.New()
			router.GET("/api/recipes/:id", recipeHandler.GetRecipeById)
			req := httptest.NewRequest(
				"GET",
				"/api/recipes/"+tt.recipeId,
				nil,
			)
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

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
// SearchRecipes
// =============

var searchRecipesTests = []struct {
	name           string
	queryString    string
	mockSetup      func(repo *MockRecipeRepo)
	expectedStatus int
	expectedBody   string
}{
	{
		name:        "Success with Filters",
		queryString: "?query=Pasta&difficulty=easy&meal_type=dinner&page=1",
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockSearchRecipes = func(ctx context.Context, f models.SearchRecipeFilters, limit, offset int) ([]models.SearchRecipeResponse, error) {
				return []models.SearchRecipeResponse{{Title: "Pasta Night"}}, nil
			}
		},
		expectedStatus: 200,
		expectedBody:   `"title":"Pasta Night"`,
	},
	{
		name:        "Database Error",
		queryString: "?query=Pasta",
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockSearchRecipes = func(ctx context.Context, f models.SearchRecipeFilters, limit, offset int) ([]models.SearchRecipeResponse, error) {
				return nil, errors.New("search index failure")
			}
		},
		expectedStatus: 500,
		expectedBody:   `"error":"internal server error"`,
	},
}

func TestSearchRecipes_TableDriven(t *testing.T) {
	for _, tt := range searchRecipesTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockRecipeRepo{}
			tt.mockSetup(mockRepo)

			recipeHandler := NewRecipeHandler(mockRepo)
			router := gin.New()
			router.GET("/api/recipes/search", recipeHandler.SearchRecipes)
			req := httptest.NewRequest(
				"GET",
				"/api/recipes/search"+tt.queryString,
				nil,
			)
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

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
// CreateRecipe
// =============

var createRecipeTests = []struct {
	name           string
	userID         string
	requestBody    string
	mockSetup      func(repo *MockRecipeRepo)
	expectedStatus int
	expectedBody   string
}{
	{
		name:        "Success",
		userID:      "00000000-0000-0000-0000-000000000001",
		requestBody: `{"title":"Valid Title","servings":2,"difficulty":"easy","meal_type":"lunch"}`,
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockCreateRecipe = func(ctx context.Context, r *models.Recipe) (string, error) {
				return "new-recipe-uuid", nil
			}
		},
		expectedStatus: 201,
		expectedBody:   `"id":"new-recipe-uuid"`,
	},
	{
		name:           "Validation Failure - Title Too Short",
		userID:         "00000000-0000-0000-0000-000000000001",
		requestBody:    `{"title":"No","servings":2,"difficulty":"easy","meal_type":"lunch"}`,
		mockSetup:      func(repo *MockRecipeRepo) {},
		expectedStatus: 400,
		expectedBody:   `title: too short`,
	},
	{
		name:        "Repository Bad Request Error (Foreign Key / Constraint)",
		userID:      "00000000-0000-0000-0000-000000000001",
		requestBody: `{"title":"Valid Title","servings":2,"difficulty":"easy","meal_type":"lunch"}`,
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockCreateRecipe = func(ctx context.Context, r *models.Recipe) (string, error) {
				return "", &repository.BadRequestError{Msg: "invalid author id"}
			}
		},
		expectedStatus: 400,
		expectedBody:   `"error":"invalid author id"`,
	},
}

func TestCreateRecipe_TableDriven(t *testing.T) {
	for _, tt := range createRecipeTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockRecipeRepo{}
			tt.mockSetup(mockRepo)

			recipeHandler := NewRecipeHandler(mockRepo)
			router := gin.New()
			router.Use(func(c *gin.Context) {
				if tt.userID != "" {
					c.Set("userID", tt.userID)
				}
				c.Next()
			})
			router.POST("/api/recipes", recipeHandler.CreateRecipe)
			bodyReader := strings.NewReader(tt.requestBody)
			req := httptest.NewRequest(
				"POST",
				"/api/recipes",
				bodyReader,
			)
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

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
// UpdateRecipe
// =============

var updateRecipeTests = []struct {
	name           string
	recipeID       string
	userID         string
	requestBody    string
	mockSetup      func(repo *MockRecipeRepo)
	expectedStatus int
	expectedBody   string
}{
	{
		name:        "Success",
		recipeID:    "aa899f26-cf36-4570-b952-58752e6bf79a",
		userID:      "00000000-0000-0000-0000-000000000001",
		requestBody: `{"title":"Updated Title","servings":4,"difficulty":"medium","meal_type":"dinner"}`,
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockGetRecipeById = func(ctx context.Context, id string) (models.RecipeResponse, error) {
				resp := models.RecipeResponse{}
				resp.Author.Id = "00000000-0000-0000-0000-000000000001"
				return resp, nil
			}
			repo.MockUpdateRecipe = func(ctx context.Context, r *models.Recipe) error {
				return nil
			}
		},
		expectedStatus: 200,
		expectedBody:   `"id":"aa899f26-cf36-4570-b952-58752e6bf79a"`,
	},
	{
		name:        "Target Recipe Not Found",
		recipeID:    "aa899f26-cf36-4570-b952-58752e6bf79a",
		userID:      "00000000-0000-0000-0000-000000000001",
		requestBody: `{"title":"Updated Title","servings":4,"difficulty":"medium","meal_type":"dinner"}`,
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockGetRecipeById = func(ctx context.Context, id string) (models.RecipeResponse, error) {
				return models.RecipeResponse{}, &repository.NotFoundError{Msg: "recipe not found"}
			}
		},
		expectedStatus: 404,
		expectedBody:   `"error":"recipe not found"`,
	},
}

func TestUpdateRecipe_TableDriven(t *testing.T) {
	for _, tt := range updateRecipeTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockRecipeRepo{}
			tt.mockSetup(mockRepo)

			recipeHandler := NewRecipeHandler(mockRepo)
			router := gin.New()
			router.Use(func(c *gin.Context) {
				if tt.userID != "" {
					c.Set("userID", tt.userID)
				}
				c.Set("userPerms", map[string]bool{
					"edit_recipe": true,
				})
				c.Set("userRoles", map[string]bool{
					"user": true,
				})
				c.Next()
			})
			router.PUT("/api/recipes/:id", recipeHandler.UpdateRecipe)
			bodyReader := strings.NewReader(tt.requestBody)
			req := httptest.NewRequest(
				"PUT",
				"/api/recipes/"+tt.recipeID,
				bodyReader,
			)
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

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
// DeleteRecipe
// =============

var deleteRecipeTests = []struct {
	name           string
	recipeID       string
	userID         string
	mockSetup      func(repo *MockRecipeRepo)
	expectedStatus int
	expectedBody   string
}{
	{
		name:     "Success",
		recipeID: "aa899f26-cf36-4570-b952-58752e6bf79a",
		userID:   "00000000-0000-0000-0000-000000000001",
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockGetRecipeById = func(ctx context.Context, id string) (models.RecipeResponse, error) {
				resp := models.RecipeResponse{}
				resp.Author.Id = "00000000-0000-0000-0000-000000000001"
				return resp, nil
			}
			repo.MockDeleteRecipe = func(ctx context.Context, id string) error {
				return nil
			}
		},
		expectedStatus: 204,
		expectedBody:   "",
	},
	{
		name:     "Internal DB Failure During Delete Execution",
		recipeID: "aa899f26-cf36-4570-b952-58752e6bf79a",
		userID:   "00000000-0000-0000-0000-000000000001",
		mockSetup: func(repo *MockRecipeRepo) {
			repo.MockGetRecipeById = func(ctx context.Context, id string) (models.RecipeResponse, error) {
				resp := models.RecipeResponse{}
				resp.Author.Id = "00000000-0000-0000-0000-000000000001"
				return resp, nil
			}
			repo.MockDeleteRecipe = func(ctx context.Context, id string) error {
				return errors.New("deadlock encountered row locking table")
			}
		},
		expectedStatus: 500,
		expectedBody:   `"error":"internal server error"`,
	},
}

func TestDeleteRecipe_TableDriven(t *testing.T) {
	for _, tt := range deleteRecipeTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockRecipeRepo{}
			tt.mockSetup(mockRepo)

			recipeHandler := NewRecipeHandler(mockRepo)
			router := gin.New()
			router.Use(func(c *gin.Context) {
				if tt.userID != "" {
					c.Set("userID", tt.userID)
				}
				c.Set("userPerms", map[string]bool{
					"delete_recipe": true,
				})
				c.Set("userRoles", map[string]bool{
					"user": true,
				})
				c.Next()
			})
			router.DELETE("/api/recipes/:id", recipeHandler.DeleteRecipe)
			req := httptest.NewRequest(
				"DELETE",
				"/api/recipes/"+tt.recipeID,
				nil,
			)
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
			if tt.expectedBody != "" && !strings.Contains(w.Body.String(), tt.expectedBody) {
				t.Errorf("Expected body to contain %q, got %q", tt.expectedBody, w.Body.String())
			}
		})
	}
}
