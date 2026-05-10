package middleware

import (
	"log"
	"net/http"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/repository"

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
		roles, perms, err := repository.GetEffectivePermissionsByUser(claims.Subject)
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
		if userRoles, ok := RolesFromContext(c); ok {
			allowed := false
			for _, r := range roles {
				if userRoles[r] {
					allowed = true
					break
				}
			}
			if !allowed {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
				return
			}
			c.Next()
			return
		}
		log.Printf("RequireRoles: missing userRoles for user %s", userID)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
}

func RequirePermission(permissions ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		if !authorization.IsValidUUID(userID) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		if perms, ok := PermsFromContext(c); ok {
			allowed := false
			for _, p := range permissions {
				if perms[p] {
					allowed = true
					break
				}
			}
			if !allowed {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
				return
			}
			c.Next()
			return
		}
		log.Printf("RequirePermission: missing perms for user %s", userID)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
}
