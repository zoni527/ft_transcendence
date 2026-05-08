package authorization

import (
	"fmt"

	"ft_transcendence/backend/models"
)

func CanCreateRecipe(userID string) (bool, error) {
	return HasPermission(userID, PermCreateRecipe)
}

func CanEditRecipe(userID string, recipe *models.Recipe) (bool, error) {
	if recipe == nil {
		return false, fmt.Errorf("recipe cannot be nil")
	}
	if userID == recipe.Author_id {
		return true, nil
	}
	return HasPermission(userID, PermEditRecipe)
}

func CanDeleteRecipe(userID string, recipe *models.Recipe) (bool, error) {
	if recipe == nil {
		return false, fmt.Errorf("recipe cannot be nil")
	}
	if userID == recipe.Author_id {
		return true, nil
	}
	return HasPermission(userID, PermDeleteRecipe)
}
