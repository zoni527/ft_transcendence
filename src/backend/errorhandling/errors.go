package errorhandling

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ErrorCode string

const (
	RecipeAuthorIDInvalid   ErrorCode = "RECIPE_AUTHOR_ID_INVALID"
	RecipeBadField          ErrorCode = "RECIPE_BAD_FIELD"
	RecipeBindingError      ErrorCode = "RECIPE_BINDING_ERROR"
	RecipeCantDelete        ErrorCode = "RECIPE_CANT_DELETE"
	RecipeCantEdit          ErrorCode = "RECIPE_CANT_EDIT"
	RecipeDataInvalid       ErrorCode = "RECIPE_DATA_INVALID"
	RecipeDifficultyInvalid ErrorCode = "RECIPE_DIFFICULTY_INVALID"
	RecipeMealTypeInvalid   ErrorCode = "RECIPE_MEAL_TYPE_INVALID"
	RecipeNotFound          ErrorCode = "RECIPE_NOT_FOUND"

	UserAlreadyExists             ErrorCode = "USER_ALREADY_EXISTS"
	UserBadField                  ErrorCode = "USER_BAD_FIELD"
	UserBindingError              ErrorCode = "USER_BINDING_ERROR"
	UserCantDelete                ErrorCode = "USER_CANT_DELETE"
	UserCredentialsInvalid        ErrorCode = "USER_CREDENTIALS_INVALID"
	UserDisplayNameInvalid        ErrorCode = "USER_DISPLAY_NAME_INVALID"
	UserEmailInvalid              ErrorCode = "USER_EMAIL_INVALID"
	UserLastAdmin                 ErrorCode = "USER_LAST_ADMIN"
	UserNameInvalid               ErrorCode = "USER_NAME_INVALID"
	UserNotFound                  ErrorCode = "USER_NOT_FOUND"
	UserPasswordChangeForbidden   ErrorCode = "USER_PASSWORD_CHANGE_FORBIDDEN"
	UserPasswordInvalid           ErrorCode = "USER_PASSWORD_INVALID"
	UserPasswordTooWeak           ErrorCode = "USER_PASSWORD_TOO_WEAK"
	UserQueryMissing              ErrorCode = "USER_QUERY_MISSING"
	UserQueryTooLong              ErrorCode = "USER_QUERY_TOO_LONG"
	UserQueryTooShort             ErrorCode = "USER_QUERY_TOO_SHORT"
	UserRequiredPermissionMissing ErrorCode = "USER_REQUIRED_PERMISSION_MISSING"
	UserRequiredRoleMissing       ErrorCode = "USER_REQUIRED_ROLE_MISSING"
	UserUnauthorized              ErrorCode = "USER_UNAUTHORIZED"
	UserUpdateForbidden           ErrorCode = "USER_UPDATE_FORBIDDEN"
	UserUpdateNoPermOrSelf        ErrorCode = "USER_UPDATE_NO_PERM_OR_SELF"
	UserUpdateNoUpdate            ErrorCode = "USER_UPDATE_NO_UPDATE"
	UserUpdateOAuthForbidden      ErrorCode = "USER_UPDATE_OAUTH_FORBIDDEN"
	UserUpdateRolesInvalid        ErrorCode = "USER_UPDATE_ROLES_INVALID"

	FriendshipAcceptNoSelf     ErrorCode = "FRIENDSHIP_ACCEPT_NO_SELF"
	FriendshipAlreadyExists    ErrorCode = "FRIENDSHIP_ALREADY_EXISTS"
	FriendshipCreateNoSelf     ErrorCode = "FRIENDSHIP_CREATE_NO_SELF"
	FriendshipDataInvalid      ErrorCode = "FRIENDSHIP_DATA_INVALID"
	FriendshipDeleteNoSelf     ErrorCode = "FRIENDSHIP_DELETE_NO_SELF"
	FriendshipNotFound         ErrorCode = "FRIENDSHIP_NOT_FOUND"
	FriendshipQueryInvalid     ErrorCode = "FRIENDSHIP_QUERY_INVALID"
	FriendshipReceiverNotFound ErrorCode = "FRIENDSHIP_RECEIVER_NOT_FOUND"
	FriendshipRequestNotFound  ErrorCode = "FRIENDSHIP_REQUEST_NOT_FOUND"

	OAuthLoginFail         ErrorCode = "OAUTH_LOGIN_FAIL"
	OAuthLoginNotOAuthUser ErrorCode = "OAUTH_LOGIN_NOT_OAUTH_USER"

	APIKeyInvalid ErrorCode = "API_KEY_INVALID"

	TokenInvalid ErrorCode = "TOKEN_INVALID"
	TokenMissing ErrorCode = "TOKEN_MISSING"

	RateLimit ErrorCode = "RATE_LIMIT"
)

type APIError struct {
	HTTPStatus int       `json:"-"`
	Code       ErrorCode `json:"code"`
	Message    string    `json:"error"`
}

func (e *APIError) Error() string {
	return e.Message
}

func Respond(c *gin.Context, context string, err error) {
	var apiErr *APIError

	if errors.As(err, &apiErr) {
		log.Printf("%s: %s (Code: %s)", context, apiErr.Message, apiErr.Code)

		c.JSON(apiErr.HTTPStatus, apiErr)
		c.Abort()
		return
	}

	log.Printf("%s: %v", context, err)
	c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
	c.Abort()
}

func newError(httpStatus int, code ErrorCode, msg string) *APIError {
	return &APIError{
		HTTPStatus: httpStatus,
		Code:       code,
		Message:    msg,
	}
}

func BadRequest(code ErrorCode, msg string) *APIError {
	return newError(http.StatusBadRequest, code, msg)
}

func NotFound(code ErrorCode, msg string) *APIError {
	return newError(http.StatusNotFound, code, msg)
}

func Unauthorized(code ErrorCode, msg string) *APIError {
	return newError(http.StatusUnauthorized, code, msg)
}

func Forbidden(code ErrorCode, msg string) *APIError {
	return newError(http.StatusForbidden, code, msg)
}

func Conflict(code ErrorCode, msg string) *APIError {
	return newError(http.StatusConflict, code, msg)
}

func UnprocessableEntity(code ErrorCode, msg string) *APIError {
	return newError(http.StatusUnprocessableEntity, code, msg)
}

func NotFoundRecipe() *APIError {
	return NotFound(RecipeNotFound, "recipe not found")
}

func NotFoundUser() *APIError {
	return NotFound(UserNotFound, "user not found")
}

func UnauthorizedUser() *APIError {
	return Unauthorized(UserUnauthorized, "unauthorized user")
}
