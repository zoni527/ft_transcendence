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
