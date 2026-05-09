package authorization

import (
	"fmt"

	"ft_transcendence/backend/models"
)

func CanEditRecipe(roleSet, permSet map[string]bool, userID string, recipe *models.Recipe) (bool, error) {
	if recipe == nil {
		return false, fmt.Errorf("recipe cannot be nil")
	}
	if userID == recipe.Author_id {
		return true, nil
	}
	return HasPermission(roleSet, permSet, PermEditRecipe), nil
}

func CanDeleteRecipe(roleSet, permSet map[string]bool, userID string, recipe *models.Recipe) (bool, error) {
	if recipe == nil {
		return false, fmt.Errorf("recipe cannot be nil")
	}
	if userID == recipe.Author_id {
		return true, nil
	}
	return HasPermission(roleSet, permSet, PermDeleteRecipe), nil
}
