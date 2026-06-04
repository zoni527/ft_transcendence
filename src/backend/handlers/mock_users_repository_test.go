package handlers

import (
	"context"
	"os"
	"reflect"
	"testing"

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


func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	os.Exit(m.Run())
}

var getRolesByUserIDTests = []struct {
	name           string
	userID         string
	mockSetup      func(repo *MockUserRepo)
	expectedRoles  []string
	expectedError  bool
}{
	{
		name:   "Success",
		userID: "123",
		mockSetup: func(repo *MockUserRepo) {
			repo.MockGetRolesByUserID = func(ctx context.Context, userID string) ([]string, error) {
				if userID != "123" {
					return nil, nil
				}
				return []string{"admin", "user"}, nil
			}
		},
		expectedRoles: []string{"admin", "user"},
		expectedError: false,
	},
	{
		name:   "Nil func field",
		userID: "any",
		mockSetup: func(repo *MockUserRepo) {
		},
		expectedRoles: nil,
		expectedError: false,
	},
}

func TestMockGetRolesByUserID_TableDriven(t *testing.T) {
	for _, tt := range getRolesByUserIDTests {

}

