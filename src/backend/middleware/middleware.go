package middleware

import (
	"log"
	"net/http"

	"ft_transcendence/backend/authorization"

	"github.com/gin-gonic/gin"
)

func Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		claims, err := authorization.ValidateJWTToken(token)
		if err != nil {
			log.Printf("ValidateJWTToken: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		blacklisted, err := authorization.IsTokenBlacklisted(token)
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

func RequireRoles(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		if !authorization.IsValidUUID(userID) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		allowed, err := authorization.HasAnyRole(userID, roles...)
		if err != nil {
			log.Printf("GetRolesByUserId: %v", err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		if allowed {
			c.Next()
			return
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
	}
}

func RequirePermission(permissions ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		if !authorization.IsValidUUID(userID) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		allowed, err := authorization.HasAnyPermission(userID, permissions...)
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
