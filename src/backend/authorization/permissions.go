package authorization

const (
	PermCreateRecipe    = "create_recipe"
	PermEditRecipe      = "edit_recipe"
	PermDeleteRecipe    = "delete_recipe"
	PermModerateContent = "moderate_content"
	PermManageUsers     = "manage_users"
	PermManageRoles     = "manage_roles"
)

const (
	RoleUser      = "user"
	RoleChef      = "chef"
	RoleModerator = "moderator"
	RoleDeveloper = "developer"
	RoleAdmin     = "admin"
)

func HasAnyRole(roleSet map[string]bool, requiredRoles ...string) bool {
	if roleSet == nil {
		return false
	}
	for _, r := range requiredRoles {
		if roleSet[r] {
			return true
		}
	}
	return false
}

func HasPermission(roleSet, permSet map[string]bool, requiredPermission string) bool {
	if roleSet != nil && roleSet[RoleAdmin] {
		return true
	}
	if permSet == nil {
		return false
	}
	return permSet[requiredPermission]
}

func HasAnyPermission(roleSet, permSet map[string]bool, permissions ...string) bool {
	if roleSet != nil && roleSet[RoleAdmin] {
		return true
	}
	if permSet == nil {
		return false
	}
	for _, p := range permissions {
		if permSet[p] {
			return true
		}
	}
	return false
}
