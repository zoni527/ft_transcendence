package repository

// Recipe repository functions needed:
// [done] GetAllRecipes     — GET /api/recipes
// [done] GetRecipeById     — GET /api/recipes/:id
// [done] CreateRecipe      — POST /api/recipes (currently inserts the recipe row only)
// [TODO] UpdateRecipe      — PUT /api/recipes/:id
// [TODO] PatchRecipe       — PATCH /api/recipes/:id
// [done] DeleteRecipe      — DELETE /api/recipes/:id
// [TODO] GetAllRecipes should support ?include_drafts=true for admins (once auth is implemented)
// [TODO] Add GET /api/users/:id/recipes so authors can see their own unpublished recipes
// [TODO] Add sorting (?sort=created_at&order=desc) to GetAllRecipes
// [TODO] Add pagination (?page=1&limit=20) to GetAllRecipes

import (
	"context"
	"errors"
	"fmt"

	"ft_transcendence/backend/models"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// GetAllRecipes returns all published recipes.
// COALESCE(column, fallback) — if column is NULL, use the fallback value instead.
// We need this because pgx can't scan NULL into a Go string or int!!!
//
// Example:
//
//	COALESCE(image_url, '')	→ if image_url is NULL, return '' instead.
//	COALESCE(calories, 0)	→ if  calories is NULL, return  0 instead.
//
// TODO: Replace COALESCE with pointer types (*string, *int) in the Recipe struct
// so NULL fields return JSON null instead of empty strings/zeros.
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
			WHERE id = $1 AND is_published = true`

	var r models.Recipe
	err := Pool.QueryRow(context.Background(), sql, id).Scan(
		&r.Id, &r.Author_id, &r.Title, &r.Description,
		&r.Prep_time_min, &r.Cook_time_min, &r.Servings,
		&r.Difficulty, &r.Cuisine, &r.Meal_type, &r.Image_url,
		&r.Calories, &r.Protein_g, &r.Carbs_g, &r.Fat_g,
		&r.Is_published, &r.Created_at, &r.Updated_at,
	)

	if err == pgx.ErrNoRows {
		return models.Recipe{}, &UserError{"recipe not found"}
	}

	if err != nil {
		return models.Recipe{}, fmt.Errorf("error getting recipe by id: %w", err)
	}

	return r, nil
}

func CreateRecipe(r *models.Recipe) (string, error) {
	sql := `
		INSERT INTO recipe (
			author_id, title, description, prep_time_min, cook_time_min,
			servings, difficulty, cuisine, meal_type, image_url,
			calories, protein_g, carbs_g, fat_g, is_published
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
		) RETURNING id`

	var newId string

	err := Pool.QueryRow(context.Background(), sql,
		r.Author_id, r.Title, r.Description, r.Prep_time_min, r.Cook_time_min,
		r.Servings, r.Difficulty, r.Cuisine, r.Meal_type, r.Image_url,
		r.Calories, r.Protein_g, r.Carbs_g, r.Fat_g, r.Is_published,
	).Scan(&newId)
	if err != nil {
		var pgErr *pgconn.PgError
		if !errors.As(err, &pgErr) {
			return "", fmt.Errorf("repository.CreateRecipe: %w", err)
		}
		switch pgErr.Code {
		case pgerrcode.ForeignKeyViolation:
			return "", &UserError{"invalid author_id"}
		case pgerrcode.CheckViolation:
			return "", &UserError{fmt.Sprintf("%v: constraint %v violated",
				pgErr.ColumnName, pgErr.ConstraintName),
			}
		default:
			return "", fmt.Errorf("repository.CreateRecipe: %w", err)
		}
	}

	return newId, nil
}

func DeleteRecipe(id string) error {
	sql := `DELETE FROM recipe WHERE id = $1`
	res, err := Pool.Exec(context.Background(), sql, id)
	if err != nil {
		return fmt.Errorf("repository.DeleteRecipe: %w", err)
	}
	if res.RowsAffected() == 0 {
		return &UserError{"invalid recipe id"}
	}

	return nil
}

type UserError struct {
	msg string
}

func (e *UserError) Error() string {
	return e.msg
}
