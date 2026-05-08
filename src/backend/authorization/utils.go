package authorization

import (
	"fmt"
	"net/http"
	"regexp"
	"time"

	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
)

var uuidRegex = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

func IsValidUUID(s string) bool {
	return uuidRegex.MatchString(s)
}

func IsTokenBlacklisted(token string) (bool, error) {
	exist, err := repository.GetTokenBlacklisted(token)
	if err != nil {
		return false, fmt.Errorf("IsTokenBlacklisted: %w", err)
	}
	return exist, nil
}

func AddTokenToBlacklist(token string, expirationDate time.Time) error {
	if err := repository.AddTokenToBlacklist(token, expirationDate); err != nil {
		return fmt.Errorf("AddTokenToBlacklist: %w", err)
	}
	return nil
}

func ClearAuthCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", "", -1, "/", "", false, true)
}
