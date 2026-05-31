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

func CanDeleteUser(roleSet map[string]bool, userID, targetUserID string) bool {
	if userID == targetUserID {
		return true
	}
	return HasAnyRole(roleSet, RoleAdmin)
}
