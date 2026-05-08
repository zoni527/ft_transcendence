package authorization

func CanEditUser(userID, targetUserID string) (bool, error) {
	if userID == targetUserID {
		return true, nil
	}
	roles, err := getUserRoles(userID)
	if err != nil {
		return false, err
	}
	return hasRole(roles, RoleAdmin), nil
}

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

func CanManageUsers(userID string) (bool, error) {
	return HasPermission(userID, PermManageUsers)
}

func CanModerateContent(userID string) (bool, error) {
	return HasPermission(userID, PermModerateContent)
}

func CanDeleteUser(userID, targetUserID string) (bool, error) {
	if userID == targetUserID {
		return true, nil
	}
	roles, err := getUserRoles(userID)
	if err != nil {
		return false, err
	}
	return hasRole(roles, RoleAdmin), nil
}
