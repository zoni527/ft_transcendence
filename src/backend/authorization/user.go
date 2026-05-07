package authorization

// CanEditUser allows a user to edit their own profile or an admin to edit any profile
func CanEditUser(userID, targetUserID string) (bool, error) {
	if userID == targetUserID {
		return true, nil
	}
	roles, err := getUserRoles(userID)
	if err != nil {
		return false, err
	}
	return HasRole(roles, RoleAdmin), nil
}

// CanManageRoles checks whether the user may change role assignments
func CanManageRoles(userID, targetUserID string) (bool, error) {
	allowed, err := HasPermission(userID, PermManageRoles)
	if err != nil {
		return false, err
	}
	if !allowed {
		return false, nil
	}
	if userID == targetUserID {
		return false, nil
	}
	return true, nil
}

// CanManageUsers checks whether the user may manage other users
func CanManageUsers(userID string) (bool, error) {
	return HasPermission(userID, PermManageUsers)
}

// CanModerateContent checks whether the user may moderate others content
func CanModerateContent(userID string) (bool, error) {
	return HasPermission(userID, PermModerateContent)
}

// CanDeleteUser allows self-delete or admin deletion
func CanDeleteUser(userID, targetUserID string) (bool, error) {
	if userID == targetUserID {
		return true, nil
	}
	roles, err := getUserRoles(userID)
	if err != nil {
		return false, err
	}
	return HasRole(roles, RoleAdmin), nil
}
