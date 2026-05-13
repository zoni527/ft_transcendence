package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/integrations"
	"ft_transcendence/backend/models"
	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

const GoogleOAuthLockedPassword = "OAUTH_LOCKED_GOOGLE"
const GenericInternalErrorMsg = "internal server error"
const DisplayNameVersionLimit = 1000

func RandomStateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}

func GoogleLogin(c *gin.Context) {
	randomState := RandomStateToken()

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
		reportError(c, http.StatusUnauthorized, "google login failed")
		return
	}

	client := integrations.GoogleOAuthConfig.Client(c, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		reportError(c, http.StatusUnauthorized, "unauthorized")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		reportError(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	var gu models.GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&gu); err != nil || !gu.EmailVerified {
		reportError(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	u, err := getOrCreateGoogleUser(&gu)
	if err != nil {
		var eu *errorUnauthorized
		if errors.As(err, &eu) {
			reportError(c, http.StatusUnauthorized, eu.Error())
			return
		}
		log.Printf("getOrCreateGoogleUser: %v", err)
		reportError(c, http.StatusInternalServerError, GenericInternalErrorMsg)
	}

	jwt, err := authorization.GenerateJWTToken(u.Id)
	if err != nil {
		log.Printf("LoginUser GenerateJWTToken: %v", err)
		reportError(c, http.StatusInternalServerError, GenericInternalErrorMsg)
		return
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", jwt, 3600, "/", "", true, true)

	c.Redirect(http.StatusMovedPermanently, "/")
}

type errorUnauthorized struct {
	msg string
}

func (e *errorUnauthorized) Error() string {
	return e.msg
}

func getOrCreateGoogleUser(gu *models.GoogleUser) (models.User, error) {
	user, err := repository.GetUserCredentialsByEmail(gu.Email)
	if err != nil && err != pgx.ErrNoRows {
		return models.User{}, err
	}

	// User found
	if err == nil {
		if user.Password_hash != GoogleOAuthLockedPassword {
			return models.User{}, &errorUnauthorized{"not a google user"}
		}
		return user, nil
	}

	// New user
	stem := gu.Email[:strings.IndexByte(gu.Email, '@')]
	params := models.CreateUserParams{
		Email:           gu.Email,
		Password_hashed: GoogleOAuthLockedPassword,
		Name:            gu.Name,
		Display_name:    stem,
	}

	for i := range DisplayNameVersionLimit {
		_, err := repository.GetCredentialsByDisplayName(params.Display_name)
		if err == pgx.ErrNoRows {
			return repository.CreateUser(params)
		} else if err != nil {
			return models.User{}, err
		}

		postfix := strconv.Itoa(i)
		params.Display_name = stem + postfix
	}
	return user, nil
}

func reportError(c *gin.Context, statusCode int, msg string) {
	c.AbortWithStatusJSON(statusCode, gin.H{"error": msg})
}
