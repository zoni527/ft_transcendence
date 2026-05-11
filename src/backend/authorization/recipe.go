package authorization

import (
	"ft_transcendence/backend/models"
)

func CanEditRecipe(roleSet, permSet map[string]bool, userID string, recipe *models.Recipe) bool {
	if userID == recipe.Author_id {
		return true
	}
	return HasPermission(roleSet, permSet, PermEditRecipe)
}

func CanDeleteRecipe(roleSet, permSet map[string]bool, userID string, recipe *models.Recipe) bool {
	if userID == recipe.Author_id {
		return true
	}
	return HasPermission(roleSet, permSet, PermDeleteRecipe)
}
