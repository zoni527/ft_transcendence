package repository

// Recipe repository functions needed:
// [done] GetAllRecipes     — GET /api/recipes
// [done] GetRecipeById     — GET /api/recipes/:id
// [done] CreateRecipe      — POST /api/recipes (currently inserts the recipe row only)
// [....] UpdateRecipe      — PUT /api/recipes/:id
// [done] DeleteRecipe      — DELETE /api/recipes/:id
// [TODO] GetAllRecipes should support ?include_drafts=true for admins (once auth is implemented)
// [TODO] Add GET /api/users/:id/recipes so authors can see their own unpublished recipes
// [TODO] Add sorting (?sort=created_at&order=desc) to GetAllRecipes
// [TODO] Add pagination (?page=1&limit=20) to GetAllRecipes

import (
	"context"
	"errors"
	"fmt"
	"log"

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
		return models.Recipe{}, &NotFoundError{"recipe not found"}
	}

	if err != nil {
		return models.Recipe{}, fmt.Errorf("repository.GetRecipeById: %w", err)
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
		return "", recipePostgresErrorClassification("repository.CreateRecipe", err)
	}

	return newId, nil
}

func UpdateRecipe(r *models.Recipe) error {
	sql := `
		UPDATE recipe
		SET (
			author_id, title, description, prep_time_min, cook_time_min,
			servings, difficulty, cuisine, meal_type, image_url,
			calories, protein_g, carbs_g, fat_g, is_published
		) = (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
		)
		WHERE id = $16`

	res, err := Pool.Exec(context.Background(), sql,
		r.Author_id, r.Title, r.Description, r.Prep_time_min, r.Cook_time_min,
		r.Servings, r.Difficulty, r.Cuisine, r.Meal_type, r.Image_url,
		r.Calories, r.Protein_g, r.Carbs_g, r.Fat_g, r.Is_published,
		r.Id,
	)
	if err != nil {
		return recipePostgresErrorClassification("repository.UpdateRecipe", err)
	}
	if res.RowsAffected() == 0 {
		return &NotFoundError{"recipe not found"}
	}

	return nil
}

func DeleteRecipe(id string) error {
	sql := `DELETE FROM recipe WHERE id = $1`
	res, err := Pool.Exec(context.Background(), sql, id)
	if err != nil {
		return fmt.Errorf("repository.DeleteRecipe: %w", err)
	}
	if res.RowsAffected() == 0 {
		return &NotFoundError{"recipe not found"}
	}

	return nil
}

// -----------------------------------------------------------------------------
// helper functions

type BadRequestError struct {
	msg string
}

func (e *BadRequestError) Error() string {
	return e.msg
}

type NotFoundError struct {
	msg string
}

func (e *NotFoundError) Error() string {
	return e.msg
}

func recipePostgresErrorClassification(functionName string, err error) error {
	var pgErr *pgconn.PgError
	// Not a Postgres error -> internal server error
	if !errors.As(err, &pgErr) {
		return fmt.Errorf("%v: %w", functionName, err)
	}
	switch pgErr.Code {
	case pgerrcode.ForeignKeyViolation:
		if pgErr.ConstraintName == "fk_author_id" {
			return &BadRequestError{"invalid author id"}
		}
		log.Printf("%v: foreign key violation: %v", functionName, pgErr.ConstraintName)
		return &BadRequestError{"invalid recipe data"}

	case pgerrcode.CheckViolation:
		switch pgErr.ConstraintName {
		case "recipe_difficulty_allowed_values":
			return &BadRequestError{"invalid difficulty value"}
		case "recipe_meal_type_allowed_values":
			return &BadRequestError{"invalid meal type value"}
		default:
			log.Printf("%v: check violation: %v", functionName, pgErr.ConstraintName)
			return &BadRequestError{"invalid recipe data"}
		}

	default:
		return fmt.Errorf("%v: %w", functionName, err)
	}
}
