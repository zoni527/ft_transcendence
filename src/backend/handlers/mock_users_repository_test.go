package handlers

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"ft_transcendence/backend/models"
	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
)

type MockUserRepo struct {
	MockGetRolesByUserID func(ctx context.Context, userID string) ([]string, error)
	MockGetAllUsers      func(ctx context.Context) ([]models.User, error)
	MockGetUserByID      func(ctx context.Context, id string) (models.User, error)
	MockCreateUser       func(ctx context.Context, params models.CreateUserParams) (models.User, error)
	MockUpdateUser       func(ctx context.Context, id string, params models.UpdateUserParams) (models.User, error)
	MockDeleteUser       func(ctx context.Context, userID string) error

	MockSearchUsersByUsername           func(ctx context.Context, username string) ([]models.UserSearchResult, error)
	MockGetUserCredentialsByEmail       func(ctx context.Context, email string) (models.User, error)
	MockGetUserCredentialsByDisplayName func(ctx context.Context, displayName string) (models.User, error)
	MockUpdateLastSeen                  func(ctx context.Context, userID string) error
	MockMarkOffline                     func(ctx context.Context, userID string) error
}

func (m *MockUserRepo) GetRolesByUserID(ctx context.Context, userID string) ([]string, error) {
	if m.MockGetRolesByUserID != nil {
		return m.MockGetRolesByUserID(ctx, userID)
	}
	return nil, nil
}

func (m *MockUserRepo) GetAllUsers(ctx context.Context) ([]models.User, error) {
	if m.MockGetAllUsers != nil {
		return m.MockGetAllUsers(ctx)
	}
	return nil, nil
}

func (m *MockUserRepo) GetUserByID(ctx context.Context, id string) (models.User, error) {
	if m.MockGetUserByID != nil {
		return m.MockGetUserByID(ctx, id)
	}
	return models.User{}, nil
}

func (m *MockUserRepo) CreateUser(ctx context.Context, params models.CreateUserParams) (models.User, error) {
	if m.MockCreateUser != nil {
		return m.MockCreateUser(ctx, params)
	}
	return models.User{}, nil
}

func (m *MockUserRepo) UpdateUser(ctx context.Context, id string, params models.UpdateUserParams) (models.User, error) {
	if m.MockUpdateUser != nil {
		return m.MockUpdateUser(ctx, id, params)
	}
	return models.User{}, nil
}

func (m *MockUserRepo) DeleteUser(ctx context.Context, userID string) error {
	if m.MockDeleteUser != nil {
		return m.MockDeleteUser(ctx, userID)
	}
	return nil
}

func (m *MockUserRepo) SearchUsersByUsername(ctx context.Context, username string) ([]models.UserSearchResult, error) {
	if m.MockSearchUsersByUsername != nil {
		return m.MockSearchUsersByUsername(ctx, username)
	}
	return nil, nil
}

func (m *MockUserRepo) GetUserCredentialsByEmail(ctx context.Context, email string) (models.User, error) {
	if m.MockGetUserCredentialsByEmail != nil {
		return m.MockGetUserCredentialsByEmail(ctx, email)
	}
	return models.User{}, nil
}

func (m *MockUserRepo) GetUserCredentialsByDisplayName(ctx context.Context, displayName string) (models.User, error) {
	if m.MockGetUserCredentialsByDisplayName != nil {
		return m.MockGetUserCredentialsByDisplayName(ctx, displayName)
	}
	return models.User{}, nil
}

func (m *MockUserRepo) UpdateLastSeen(ctx context.Context, userID string) error {
	if m.MockUpdateLastSeen != nil {
		return m.MockUpdateLastSeen(ctx, userID)
	}
	return nil
}
func (m *MockUserRepo) MarkOffline(ctx context.Context, userID string) error {
	if m.MockMarkOffline != nil {
		return m.MockMarkOffline(ctx, userID)
	}
	return nil
}

var getUsersTests = []struct {
	name           string
	mockSetup      func(repo *MockUserRepo)
	expectedStatus int
	expectedBody   string
}{
	{
		name: "Success",
		mockSetup: func(repo *MockUserRepo) {
			repo.MockGetAllUsers = func(ctx context.Context) ([]models.User, error) {
				return []models.User{{
					ID:          "11111111-1111-1111-1111-111111111111",
					DisplayName: "Alice",
					Name:        "Alice Example",
					LastSeen:    time.Now().Add(-time.Second),
				}}, nil
			}
		},
		expectedStatus: http.StatusOK,
		expectedBody:   `"display_name":"Alice"`,
	},
	{
		name: "Internal server error",
		mockSetup: func(repo *MockUserRepo) {
			repo.MockGetAllUsers = func(ctx context.Context) ([]models.User, error) {
				return nil, errors.New("error")
			}
		},
		expectedStatus: http.StatusInternalServerError,
		expectedBody:   `"error":"internal server error"`,
	},
}

func TestGetUsers_TableDriven(t *testing.T) {
	for _, tt := range getUsersTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockUserRepo{}
			tt.mockSetup(mockRepo)

			handler := NewUserHandler(mockRepo)
			router := gin.New()
			router.GET("/api/users", handler.GetUsers)

			req := httptest.NewRequest(http.MethodGet, "/api/users", nil)
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

var getUserByIDTests = []struct {
	name           string
	userID         string
	mockSetup      func(repo *MockUserRepo)
	expectedStatus int
	expectedBody   string
}{
	{
		name:   "Success",
		userID: "aa899f26-cf36-4570-b952-58752e6bf79a",
		mockSetup: func(repo *MockUserRepo) {
			repo.MockGetUserByID = func(ctx context.Context, id string) (models.User, error) {
				return models.User{
					ID:          id,
					DisplayName: "Alice",
					Name:        "Alice Example",
					LastSeen:    time.Now().Add(-time.Second),
				}, nil
			}
		},
		expectedStatus: http.StatusOK,
		expectedBody:   `"display_name":"Alice"`,
	},
	{
		name:           "Invalid UUID caught by handler validation",
		userID:         "invalid-uuid",
		mockSetup:      func(repo *MockUserRepo) {},
		expectedStatus: http.StatusNotFound,
		expectedBody:   `"error":"user not found"`,
	},
	{
		name:   "Internal server error",
		userID: "aa899f26-cf36-4570-b952-58752e6bf79a",
		mockSetup: func(repo *MockUserRepo) {
			repo.MockGetUserByID = func(ctx context.Context, id string) (models.User, error) {
				return models.User{}, errors.New("problem with database")
			}
		},
		expectedStatus: http.StatusInternalServerError,
		expectedBody:   `"error":"internal server error"`,
	},
}

func TestGetUserByID_TableDriven(t *testing.T) {
	for _, tt := range getUserByIDTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockUserRepo{}
			tt.mockSetup(mockRepo)

			handler := NewUserHandler(mockRepo)
			router := gin.New()
			router.GET("/api/users/:id", handler.GetUserByID)

			req := httptest.NewRequest(http.MethodGet, "/api/users/"+tt.userID, nil)
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

var createUserTests = []struct {
	name           string
	body           string
	mockSetup      func(repo *MockUserRepo)
	expectedStatus int
	expectedBody   string
}{
	{
		name: "success",
		body: `{"email":"user@example.com","password":"CorrectHorseBatteryStaple#2026!","name":"Test User","display_name":"test-user"}`,
		mockSetup: func(repo *MockUserRepo) {
			repo.MockCreateUser = func(ctx context.Context, params models.CreateUserParams) (models.User, error) {
				return models.User{
					ID:          "11111111-1111-1111-1111-111111111111",
					Email:       params.Email,
					Name:        params.Name,
					DisplayName: params.DisplayName,
				}, nil
			}
		},
		expectedStatus: http.StatusCreated,
		expectedBody:   `"authenticated":true`,
	},
}

func TestCreateUser_TableDriven(t *testing.T) {
	for _, tt := range createUserTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockUserRepo{}
			tt.mockSetup(mockRepo)

			handler := NewUserHandler(mockRepo)
			router := gin.New()
			router.POST("/api/users", handler.CreateUser)

			req := httptest.NewRequest(http.MethodPost, "/api/users", strings.NewReader(tt.body))
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

var updateUserTests = []struct {
	name           string
	targetUserID   string
	body           string
	mockSetup      func(repo *MockUserRepo)
	routerSetup    func(router *gin.Engine)
	expectedStatus int
	expectedBody   string
	called         bool
}{
	{
		name:         "forbidden for non-owner non-admin",
		targetUserID: "22222222-2222-2222-2222-222222222222",
		body:         `{"name":"Updated Name"}`,
		mockSetup: func(repo *MockUserRepo) {
			repo.MockUpdateUser = func(ctx context.Context, id string, params models.UpdateUserParams) (models.User, error) {
				return models.User{}, nil
			}
		},
		routerSetup: func(router *gin.Engine) {
			router.Use(func(c *gin.Context) {
				c.Set("userID", "11111111-1111-1111-1111-111111111111")
				c.Set("userRoles", map[string]bool{"user": true})
				c.Set("userPerms", map[string]bool{})
				c.Next()
			})
		},
		expectedStatus: http.StatusForbidden,
		expectedBody:   `"code":"USER_UPDATE_FORBIDDEN"`,
		called:         false,
	},
}

func TestUpdateUser_TableDriven(t *testing.T) {
	for _, tt := range updateUserTests {
		t.Run(tt.name, func(t *testing.T) {
			called := false
			mockRepo := &MockUserRepo{}
			tt.mockSetup(mockRepo)
			originalUpdateUser := mockRepo.MockUpdateUser
			mockRepo.MockUpdateUser = func(ctx context.Context, id string, params models.UpdateUserParams) (models.User, error) {
				called = true
				if originalUpdateUser != nil {
					return originalUpdateUser(ctx, id, params)
				}
				return models.User{}, nil
			}

			handler := NewUserHandler(mockRepo)
			router := gin.New()
			if tt.routerSetup != nil {
				tt.routerSetup(router)
			}
			router.PUT("/api/users/:id", handler.UpdateUser)

			req := httptest.NewRequest(http.MethodPut, "/api/users/"+tt.targetUserID, strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
			if !strings.Contains(w.Body.String(), tt.expectedBody) {
				t.Errorf("Expected body to contain %q, got %q", tt.expectedBody, w.Body.String())
			}
			if called != tt.called {
				t.Errorf("Expected repo call=%v, got %v", tt.called, called)
			}
		})
	}
}

var deleteUserTests = []struct {
	name           string
	targetUserID   string
	mockSetup      func(repo *MockUserRepo)
	routerSetup    func(router *gin.Engine)
	expectedStatus int
	expectedBody   string
}{
	{
		name:         "last admin error mapped to forbidden",
		targetUserID: "22222222-2222-2222-2222-222222222222",
		mockSetup: func(repo *MockUserRepo) {
			repo.MockDeleteUser = func(ctx context.Context, userID string) error {
				return repository.ErrLastAdmin
			}
		},
		routerSetup: func(router *gin.Engine) {
			router.Use(func(c *gin.Context) {
				c.Set("userID", "11111111-1111-1111-1111-111111111111")
				c.Set("userRoles", map[string]bool{"admin": true})
				c.Next()
			})
		},
		expectedStatus: http.StatusForbidden,
		expectedBody:   `"code":"USER_LAST_ADMIN"`,
	},
}

func TestDeleteUser_TableDriven(t *testing.T) {
	for _, tt := range deleteUserTests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockUserRepo{}
			tt.mockSetup(mockRepo)

			handler := NewUserHandler(mockRepo)
			router := gin.New()
			if tt.routerSetup != nil {
				tt.routerSetup(router)
			}
			router.DELETE("/api/users/:id", handler.DeleteUser)

			req := httptest.NewRequest(http.MethodDelete, "/api/users/"+tt.targetUserID, nil)
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
