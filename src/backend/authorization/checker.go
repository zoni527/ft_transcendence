package authorization

import "ft_transcendence/backend/repository"

// getUserRoles returns all roles assigned to the given user
func getUserRoles(userID string) ([]string, error) {
	return repository.GetRolesByUserId(userID)
}

// hasPermission reports whether any of the provided roles grants the named permission
func hasPermission(roles []string, permission string) bool {
	for _, role := range roles {
		if role == RoleAdmin {
			return true
		}
		if permissionsForRole, ok := rolePermissions[role]; ok && permissionsForRole[permission] {
			return true
		}
	}
	return false
}

// HasPermission checks whether the user has a single permission
func HasPermission(userID string, requiredPermission string) (bool, error) {
	roles, err := getUserRoles(userID)
	if err != nil {
		return false, err
	}
	return hasPermission(roles, requiredPermission), nil
}

// HasAnyPermission checks whether the user has at least one permission
func HasAnyPermission(userID string, permissions ...string) (bool, error) {
	roles, err := getUserRoles(userID)
	if err != nil {
		return false, err
	}
	for _, permission := range permissions {
		if hasPermission(roles, permission) {
			return true, nil
		}
	}
	return false, nil
}

// HasRole checks whether a role slice contains a specific role
func HasRole(roles []string, role string) bool {
	for _, currentRole := range roles {
		if currentRole == role {
			return true
		}
	}
	return false
}

// HasAnyRole checks whether a role slice contains at least one of the roles
func HasAnyRole(roles []string, requiredRoles ...string) bool {
	for _, requiredRole := range requiredRoles {
		if HasRole(roles, requiredRole) {
			return true
		}
	}
	return false
}
