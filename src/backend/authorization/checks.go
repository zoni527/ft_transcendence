package authorization

import "ft_transcendence/backend/repository"

func HasAnyRole(userID string, requiredRoles ...string) (bool, error) {
	roles, err := getUserRoles(userID)
	if err != nil {
		return false, err
	}
	return hasAnyRole(roles, requiredRoles...), nil
}

func HasPermission(userID string, requiredPermission string) (bool, error) {
	roles, err := getUserRoles(userID)
	if err != nil {
		return false, err
	}
	return hasPermission(roles, requiredPermission), nil
}

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

/*-----------------------Package private helpers---------------------------*/

func hasRole(roles []string, role string) bool {
	for _, currentRole := range roles {
		if currentRole == role {
			return true
		}
	}
	return false
}

func hasAnyRole(roles []string, requiredRoles ...string) bool {
	for _, requiredRole := range requiredRoles {
		if hasRole(roles, requiredRole) {
			return true
		}
	}
	return false
}

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

func getUserRoles(userID string) ([]string, error) {
	return repository.GetRolesByUserId(userID)
}
