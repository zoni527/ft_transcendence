package authorization

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

// InitJWTSecret stores the signing key loaded from configuration
func InitJWTSecret(secret string) {
	jwtSecret = []byte(secret)
}

// GenerateJWTToken creates a signed token for a user id
func GenerateJWTToken(userID string) (string, error) {
	now := time.Now()
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(now.Add(1 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(now),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateJWTToken verifies the signature and required claims
func ValidateJWTToken(token string) (*jwt.RegisteredClaims, error) {
	claims := &jwt.RegisteredClaims{}
	parsedToken, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
		if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, fmt.Errorf("unexpected signing method %s", t.Method.Alg())
		}
		return jwtSecret, nil
	})
	if err != nil || !parsedToken.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	if claims.Subject == "" {
		return nil, fmt.Errorf("missing userID")
	}
	if claims.ExpiresAt == nil {
		return nil, fmt.Errorf("missing expiration date")
	}
	return claims, nil
}

// AuthMiddleware validates the session cookie and stores the user identity in the context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		claims, err := ValidateJWTToken(token)
		if err != nil {
			log.Printf("ValidateJWTToken failed: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		blacklisted, err := IsTokenBlacklisted(token)
		if err != nil {
			log.Printf("Check blacklist failed: %v", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		if blacklisted {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		c.Set("token", token)
		c.Set("userID", claims.Subject)
		c.Set("expDate", claims.ExpiresAt.Time)
		c.Next()
	}
}

// RequireRoles allows requests from users with any of the listed roles
func RequireRoles(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		if !IsValidUUID(userID) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		userRoles, err := getUserRoles(userID)
		if err != nil {
			log.Printf("GetRolesByUserId: %v", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		if HasAnyRole(userRoles, roles...) {
			c.Next()
			return
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
	}
}

// RequirePermission allows requests from users that hold at least one permission
func RequirePermission(permissions ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		if !IsValidUUID(userID) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		allowed, err := HasAnyPermission(userID, permissions...)
		if err != nil {
			log.Printf("HasAnyPermission: %v", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		if !allowed {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
			return
		}

		c.Next()
	}
}

// IsTokenBlacklisted checks whether the token exists in the blacklist table
func IsTokenBlacklisted(token string) (bool, error) {
	exist, err := repository.GetTokenBlacklisted(token)
	if err != nil {
		return false, fmt.Errorf("check token blacklist: %w", err)
	}
	return exist, nil
}

// AddTokenToBlacklist stores the token until it expires
func AddTokenToBlacklist(token string, expirationDate time.Time) error {
	if err := repository.AddTokenToBlacklist(token, expirationDate); err != nil {
		return fmt.Errorf("addTokenToBlacklist: %w", err)
	}
	return nil
}

// TokenCleanupLoop periodically removes expired blacklisted tokens
func TokenCleanupLoop() {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()
	for range ticker.C {
		if err := repository.CleanExpiredTokens(time.Now()); err != nil {
			log.Printf("TokenCleanupLoop: %v", err)
		}
	}
}

// ClearAuthCookie removes the session cookie from the response
func ClearAuthCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", "", -1, "/", "", false, true)
}
