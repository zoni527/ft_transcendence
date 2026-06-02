package errorhandling

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ErrorCode string

const (
	RecipeNotFound          ErrorCode = "RECIPE_NOT_FOUND"
	RecipeBindingError      ErrorCode = "RECIPE_BINDING_ERROR"
	RecipeAuthorIDInvalid   ErrorCode = "RECIPE_AUTHOR_ID_INVALID"
	RecipeDataInvalid       ErrorCode = "RECIPE_DATA_INVALID"
	RecipeDifficultyInvalid ErrorCode = "RECIPE_DIFFICULTY_INVALID"
	RecipeMealTypeInvalid   ErrorCode = "RECIPE_MEAL_TYPE_INVALID"
	RecipeCantEdit          ErrorCode = "RECIPE_CANT_EDIT"
	RecipeCantDelete        ErrorCode = "RECIPE_CANT_DELETE"
	RecipeBadField          ErrorCode = "RECIPE_BAD_FIELD"

	UserNotFound                ErrorCode = "USER_NOT_FOUND"
	UserBindingError            ErrorCode = "USER_BINDING_ERROR"
	UserUnauthorized            ErrorCode = "USER_UNAUTHORIZED"
	UserBadField                ErrorCode = "USER_BAD_FIELD"
	UserNameInvalid             ErrorCode = "USER_NAME_INVALID"
	UserEmailInvalid            ErrorCode = "USER_EMAIL_INVALID"
	UserDisplayNameInvalid      ErrorCode = "USER_DISPLAY_NAME_INVALID"
	UserPasswordInvalid         ErrorCode = "USER_PASSWORD_INVALID"
	UserPasswordTooWeak         ErrorCode = "USER_PASSWORD_TOO_WEAK"
	UserPasswordChangeForbidden ErrorCode = "USER_PASSWORD_CHANGE_FORBIDDEN"
	UserAlreadyExists           ErrorCode = "USER_ALREADY_EXISTS"

	FriendshipAlreadyExists    ErrorCode = "FRIENDSHIP_ALREADY_EXISTS"
	FriendshipReceiverNotFound ErrorCode = "FRIENDSHIP_RECEIVER_NOT_FOUND"
	FriendshipNoSelf           ErrorCode = "FRIENDSHIP_NO_SELF"
	FriendshipDataInvalid      ErrorCode = "FRIENDSHIP_DATA_INVALID"
	FriendshipRequestNotFound  ErrorCode = "FRIENDSHIP_REQUEST_NOT_FOUND"
	FriendshipNotFound         ErrorCode = "FRIENDSHIP_NOT_FOUND"
)

type APIError struct {
	HTTPStatus int       `json:"-"`
	Code       ErrorCode `json:"code"`
	Message    string    `json:"error"`
}

func (e *APIError) Error() string {
	return e.Message
}

func IdentifyAndRespond(c *gin.Context, context string, err error) {
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

func NewBadRequest(code ErrorCode, msg string) *APIError {
	return newError(http.StatusBadRequest, code, msg)
}

func NewNotFound(code ErrorCode, msg string) *APIError {
	return newError(http.StatusNotFound, code, msg)
}

func NewUnauthorized(code ErrorCode, msg string) *APIError {
	return newError(http.StatusUnauthorized, code, msg)
}

func NewForbidden(code ErrorCode, msg string) *APIError {
	return newError(http.StatusForbidden, code, msg)
}

func NewConflict(code ErrorCode, msg string) *APIError {
	return newError(http.StatusConflict, code, msg)
}

func NewUnprocessableEntity(code ErrorCode, msg string) *APIError {
	return newError(http.StatusUnprocessableEntity, code, msg)
}

func NewRecipeNotFound() *APIError {
	return NewNotFound(RecipeNotFound, "recipe not found")
}

func NewUserNotFound() *APIError {
	return NewNotFound(UserNotFound, "user not found")
}
