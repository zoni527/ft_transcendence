package authorization

func CanEditRecipe(roleSet, permSet map[string]bool, userID, authorID string) bool {
	if userID == authorID {
		return true
	}
	return HasPermission(roleSet, permSet, PermEditRecipe)
}

func CanDeleteRecipe(roleSet, permSet map[string]bool, userID, authorID string) bool {
	if userID == authorID {
		return true
	}
	return HasPermission(roleSet, permSet, PermDeleteRecipe)
}
