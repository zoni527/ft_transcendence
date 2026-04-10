package repository

// Recipe repository functions needed:
// [done] GetAllRecipes     — GET /api/recipes
// [done] GetRecipeById     — GET /api/recipes/:id
// [TODO] CreateRecipe      — POST /api/recipes (transaction: insert recipe + steps + ingredients)
// [TODO] UpdateRecipe      — PUT /api/recipes/:id
// [TODO] PatchRecipe       — PATCH /api/recipes/:id
// [TODO] DeleteRecipe      — DELETE /api/recipes/:id
// [TODO] GetAllRecipes should support ?include_drafts=true for admins (once auth is implemented)
// [TODO] Add GET /api/users/:id/recipes so authors can see their own unpublished recipes
// [TODO] Add sorting (?sort=created_at&order=desc) to GetAllRecipes
// [TODO] Add pagination (?page=1&limit=20) to GetAllRecipes

import (
	"context"
	"fmt"

	"ft_transcendence/backend/models"

	"github.com/jackc/pgx/v5"
)

// GetAllRecipes returns all published recipes.
// COALESCE(column, fallback) — if column is NULL, use the fallback value instead.
// We need this because pgx can't scan NULL into a Go string or int!!!
// Example: COALESCE(image_url, '') → if image_url is NULL, return '' instead.
//          COALESCE(calories, 0)   → if calories is NULL, return 0 instead.
func GetAllRecipes() ([]models.Recipe, error) {
	sql := `SELECT id, COALESCE(author_id::text, ''), title, COALESCE(description, ''),
				COALESCE(prep_time_min, 0), COALESCE(cook_time_min, 0),
				servings, COALESCE(difficulty, ''), COALESCE(cuisine, ''),
				COALESCE(meal_type, ''), COALESCE(image_url, ''),
				COALESCE(calories, 0), COALESCE(protein_g, 0), COALESCE(carbs_g, 0),
				COALESCE(fat_g, 0), is_published,
				created_at, updated_at
			FROM recipe
			WHERE is_published = true
			ORDER BY created_at DESC`

	rows, err := Pool.Query(context.Background(), sql)
	if err != nil {
		return nil, fmt.Errorf("error querying recipes: %w", err)
	}
	defer rows.Close()

	var recipes []models.Recipe
	for rows.Next() {
		var r models.Recipe
		err := rows.Scan(
			&r.Id, &r.Author_id, &r.Title, &r.Description,
			&r.Prep_time_min, &r.Cook_time_min, &r.Servings,
			&r.Difficulty, &r.Cuisine, &r.Meal_type, &r.Image_url,
			&r.Calories, &r.Protein_g, &r.Carbs_g, &r.Fat_g,
			&r.Is_published, &r.Created_at, &r.Updated_at,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning recipe row: %w", err)
		}
		recipes = append(recipes, r)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating recipe rows: %w", err)
	}

	return recipes, nil
}

// GetRecipeById returns a single recipe by UUID.
func GetRecipeById(id string) (models.Recipe, error) {
	sql := `SELECT id, COALESCE(author_id::text, ''), title, COALESCE(description, ''),
				COALESCE(prep_time_min, 0), COALESCE(cook_time_min, 0),
				servings, COALESCE(difficulty, ''), COALESCE(cuisine, ''),
				COALESCE(meal_type, ''), COALESCE(image_url, ''),
				COALESCE(calories, 0), COALESCE(protein_g, 0), COALESCE(carbs_g, 0),
				COALESCE(fat_g, 0), is_published,
				created_at, updated_at
			FROM recipe
			WHERE id = $1`

	var r models.Recipe
	err := Pool.QueryRow(context.Background(), sql, id).Scan(
		&r.Id, &r.Author_id, &r.Title, &r.Description,
		&r.Prep_time_min, &r.Cook_time_min, &r.Servings,
		&r.Difficulty, &r.Cuisine, &r.Meal_type, &r.Image_url,
		&r.Calories, &r.Protein_g, &r.Carbs_g, &r.Fat_g,
		&r.Is_published, &r.Created_at, &r.Updated_at,
	)

	if err == pgx.ErrNoRows {
		return models.Recipe{}, pgx.ErrNoRows
	}

	if err != nil {
		return models.Recipe{}, fmt.Errorf("error getting recipe by id: %w", err)
	}

	return r, nil
}