package middleware

import (
	"github.com/gin-gonic/gin"
)

func RolesFromContext(c *gin.Context) (map[string]bool, bool) {
	v, ok := c.Get("userRoles")
	if !ok {
		return nil, false
	}
	roles, ok := v.(map[string]bool)
	return roles, ok
}

func PermsFromContext(c *gin.Context) (map[string]bool, bool) {
	v, ok := c.Get("userPerms")
	if !ok {
		return nil, false
	}
	perms, ok := v.(map[string]bool)
	return perms, ok
}
