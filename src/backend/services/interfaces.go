package services

import (
	"context"

	"ft_transcendence/backend/models"
)

type RecipeService interface {
	ListPublicRecipes(ctx context.Context) ([]models.RecipeResponse, error)
	GetPublicRecipe(ctx context.Context, id string) (models.RecipeResponse, error)
	CreateRecipe(ctx context.Context, actorID string, in models.Recipe) (string, error)
	UpdateRecipe(ctx context.Context, actorID, recipeID string, in models.Recipe) error
	DeleteRecipe(ctx context.Context, actorID, recipeID string) error
}
