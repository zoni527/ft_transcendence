package services

import (
	"context"
	"errors"

	"ft_transcendence/backend/models"
)

type RecipeRepo interface {
	GetAllRecipes(ctx context.Context) ([]models.RecipeResponse, error)
	GetRecipeById(ctx context.Context, id string) (models.RecipeResponse, error)
	CreateRecipe(ctx context.Context, r *models.Recipe) (string, error)
	UpdateRecipe(ctx context.Context, r *models.Recipe) error
	DeleteRecipe(ctx context.Context, id string) error
}

var ErrForbidden = errors.New("forbidden")

type recipeService struct {
	repo RecipeRepo
}

func NewRecipeService(repo RecipeRepo) RecipeService {
	return &recipeService{repo: repo}
}

func (s *recipeService) ListPublicRecipes(ctx context.Context) ([]models.RecipeResponse, error) {
	return s.repo.GetAllRecipes(ctx)
}

func (s *recipeService) GetPublicRecipe(ctx context.Context, id string) (models.RecipeResponse, error) {
	return s.repo.GetRecipeById(ctx, id)
}

func (s *recipeService) CreateRecipe(ctx context.Context, actorID string, in models.Recipe) (string, error) {
	in.Author_id = actorID
	return s.repo.CreateRecipe(ctx, &in)
}

func (s *recipeService) UpdateRecipe(ctx context.Context, actorID, recipeID string, in models.Recipe) error {
	in.Id = recipeID
	recipe, err := s.repo.GetRecipeById(ctx, recipeID)
	if err != nil {
		return err
	}
	if recipe.Author.Id != actorID {
		return ErrForbidden
	}
	return s.repo.UpdateRecipe(ctx, &in)
}

func (s *recipeService) DeleteRecipe(ctx context.Context, actorID, recipeID string) error {
	recipe, err := s.repo.GetRecipeById(ctx, recipeID)
	if err != nil {
		return err
	}
	if recipe.Author.Id != actorID {
		return ErrForbidden
	}
	return s.repo.DeleteRecipe(ctx, recipeID)
}
