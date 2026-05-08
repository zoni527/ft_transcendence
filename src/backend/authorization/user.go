package authorization

func CanEditUser(roleSet map[string]bool, userID, targetUserID string) bool {
	if userID == targetUserID {
		return true
	}
	return HasAnyRole(roleSet, RoleAdmin)
}

func CanManageRoles(roleSet, permSet map[string]bool, userID, targetUserID string) bool {
	allowed := HasPermission(roleSet, permSet, PermManageRoles)
	if !allowed {
		return false
	}
	if userID == targetUserID {
		return false
	}
	return true
}

/*----------- These functions are not used yet, to be implement with advanced permissions/GDPR----------*/

func CanManageUsers(roleSet, permSet map[string]bool, userID string) bool {
	return HasPermission(roleSet, permSet, PermManageUsers)
}

func CanModerateContent(roleSet, permSet map[string]bool, userID string) bool {
	return HasPermission(roleSet, permSet, PermModerateContent)
}

func CanDeleteUser(roleSet map[string]bool, userID, targetUserID string) bool {
	if userID == targetUserID {
		return true
	}
	return HasAnyRole(roleSet, RoleAdmin)
}
