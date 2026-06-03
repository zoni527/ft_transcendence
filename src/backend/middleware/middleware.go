package middleware

import (
	"log"
	"net/http"
	"time"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/errorhandling"
	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "unauthorized",
				"code":  errorhandling.TokenMissing,
			})
			return
		}

		claims, err := authorization.ValidateJWTToken(token)
		if err != nil {
			log.Printf("ValidateJWTToken: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid token",
				"code":  errorhandling.TokenInvalid,
			})
			return
		}

		blacklisted, err := authorization.IsTokenBlacklisted(c.Request.Context(), token)
		if err != nil {
			log.Printf("Check blacklist failed: %v", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		if blacklisted {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid token",
				"code":  errorhandling.TokenInvalid,
			})
			return
		}
		roles, perms, err := repository.GetEffectivePermissionsByUser(c.Request.Context(), claims.Subject)
		if err != nil {
			log.Printf("GetEffectivePermissionsByUser: %v", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		c.Set("userRoles", roles)
		c.Set("userPerms", perms)
		c.Set("token", token)
		c.Set("userID", claims.Subject)
		c.Set("expDate", claims.ExpiresAt.Time)
		c.Next()
	}
}

func RequireRoles(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		if !authorization.IsValidUUID(userID) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		if userRoles, ok := authorization.RolesFromContext(c); ok {
			allowed := false
			for _, r := range roles {
				if userRoles[r] {
					allowed = true
					break
				}
			}
			if !allowed {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"error": "insufficient permissions",
					"code":  errorhandling.UserRequiredRoleMissing,
				})
				return
			}
			c.Next()
			return
		}
		log.Printf("RequireRoles: missing userRoles for user %s", userID)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
	}
}

func RequirePermission(permissions ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		if !authorization.IsValidUUID(userID) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "unauthorized",
				"code":  errorhandling.UserUnauthorized,
			})
			return
		}
		if perms, ok := authorization.PermsFromContext(c); ok {
			allowed := false
			for _, p := range permissions {
				if perms[p] {
					allowed = true
					break
				}
			}
			if !allowed {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"error": "insufficient permissions",
					"code":  errorhandling.UserRequiredPermissionMissing,
				})
				return
			}
			c.Next()
			return
		}
		log.Printf("RequirePermission: missing perms for user %s", userID)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
	}
}

func APIKeyAuthenticator() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		userID, err := authorization.ValidateAPIKey(c.Request.Context(), apiKey)
		if err != nil {
			log.Printf("APIKeyAuthenticator: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid api key",
				"code":  errorhandling.APIKeyInvalid,
			})
			return
		}
		c.Set("userID", userID)
		c.Set("apiKey", apiKey)
		c.Next()
	}
}

func RateLimiter(r rate.Limit, m IdentifierMode, b int) gin.HandlerFunc {
	return func(c *gin.Context) {
		identifier := getClientIdentifier(c, m)
		mu.Lock()
		cl, exists := clients[identifier]
		if !exists {
			cl = &client{limiter: rate.NewLimiter(r, b)}
			clients[identifier] = cl
		}
		cl.lastSeen = time.Now()
		mu.Unlock()
		if !cl.limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded",
				"code":  errorhandling.RateLimit,
			})
			return
		}
		c.Next()
	}
}
