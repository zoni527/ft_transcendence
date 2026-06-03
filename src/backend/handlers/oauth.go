package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/errorhandling"
	"ft_transcendence/backend/integrations"
	"ft_transcendence/backend/models"
	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

const displayNameVersionLimit = 1000

func RandomStateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		log.Printf("unexpected random state generation error: %v", err)
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func GoogleLogin(c *gin.Context) {
	randomState, err := RandomStateToken()
	if err != nil {
		errorhandling.Respond(c, "GoogleLogin", err)
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("oauth_state", randomState, 600, "/", "", true, true)

	url := integrations.GoogleOAuthConfig.AuthCodeURL(randomState)
	c.Redirect(http.StatusFound, url)
}

func GoogleCallback(c *gin.Context) {
	queryState := c.Query("state")
	cookieState, err := c.Cookie("oauth_state")
	if err != nil || queryState != cookieState {
		reportError(c, http.StatusForbidden, "forbidden")
		return
	}
	c.SetCookie("oauth_state", "", -1, "/", "", true, true)

	code := c.Query("code")
	token, err := integrations.GoogleOAuthConfig.Exchange(c, code)
	if err != nil {
		err := errorhandling.Unauthorized(errorhandling.OAuthLoginFail, "google login failed")
		errorhandling.Respond(c, "GoogleCallback", err)
		return
	}

	client := integrations.GoogleOAuthConfig.Client(c, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		err := errorhandling.UnauthorizedUser()
		errorhandling.Respond(c, "GoogleCallback", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		err := errorhandling.UnauthorizedUser()
		errorhandling.Respond(c, "GoogleCallback", err)
		return
	}

	var gu models.GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&gu); err != nil || !gu.VerifiedEmail {
		err := errorhandling.UnauthorizedUser()
		errorhandling.Respond(c, "GoogleCallback", err)
		return
	}

	u, err := getOrCreateGoogleUser(c.Request.Context(), &gu)
	if err != nil {
		var eu *errorUnauthorized
		var eb *errorBadRequest
		if errors.As(err, &eu) {
			reportError(c, http.StatusUnauthorized, eu.Error())
			return
		}
		if errors.As(err, &eb) {
			reportError(c, http.StatusBadRequest, eb.Error())
			return
		}
		errorhandling.Respond(c, "getOrCreateGoogleUser", err)
		return
	}

	jwt, err := authorization.GenerateJWTToken(u.ID)
	if err != nil {
		errorhandling.Respond(c, "LoginUser GenerateJWTToken", err)
		return
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", jwt, 3600, "/", "", true, true)

	c.Redirect(http.StatusSeeOther, "/")
}

type errorUnauthorized struct {
	msg string
}

func (e *errorUnauthorized) Error() string {
	return e.msg
}

type errorBadRequest struct {
	msg string
}

func (e *errorBadRequest) Error() string {
	return e.msg
}

func getOrCreateGoogleUser(ctx context.Context, gu *models.GoogleUser) (models.User, error) {
	user, err := repository.GetUserCredentialsByEmail(ctx, gu.Email)
	if err != nil && err != pgx.ErrNoRows {
		return models.User{}, err
	}

	// User found
	if err == nil {
		if user.PasswordHash != integrations.GoogleOAuthLockedPassword {
			return models.User{}, &errorUnauthorized{"not a google user"}
		}
		return user, nil
	}

	// New user
	at := strings.IndexByte(gu.Email, '@')
	if at <= 0 {
		return models.User{}, fmt.Errorf("invalid google user email")
	}
	stem := gu.Email[:at]
	params := models.CreateUserParams{
		Email:          gu.Email,
		PasswordHashed: integrations.GoogleOAuthLockedPassword,
		Name:           gu.Name,
		DisplayName:    stem,
	}

	for i := range displayNameVersionLimit {
		_, err := repository.GetUserCredentialsByDisplayName(ctx, params.DisplayName)
		if err == pgx.ErrNoRows {
			err = normalizeAndValidateUserFields(&params.Email, &params.Name, &params.DisplayName)
			if err != nil {
				return models.User{}, &errorBadRequest{"bad email/name/display name value"}
			}
			return repository.CreateUser(ctx, params)
		} else if err != nil {
			return models.User{}, err
		}

		postfix := strconv.Itoa(i)
		params.DisplayName = stem + postfix
	}
	return models.User{}, fmt.Errorf("all display name versions already in use")
}

func reportError(c *gin.Context, statusCode int, msg string) {
	c.AbortWithStatusJSON(statusCode, gin.H{"error": msg})
}
