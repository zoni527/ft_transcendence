package repository

// Recipe repository functions needed:
// [done] GetAllRecipes     — GET /api/recipes
// [done] GetRecipeById     — GET /api/recipes/:id
// [done] SearchRecipes     — GET /api/recipes/search
// [done] CreateRecipe      — POST /api/recipes (currently inserts the recipe row only)
// [done] UpdateRecipe      — PUT /api/recipes/:id
// [done] DeleteRecipe      — DELETE /api/recipes/:id
// [TODO] Add GET /api/users/:id/recipes so authors can see their own recipes
// [TODO] Add sorting (?sort=created_at&order=desc) to GetAllRecipes
// [TODO] Add pagination (?page=1&limit=20) to GetAllRecipes

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"

	"ft_transcendence/backend/models"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// GetAllRecipes returns all recipes.
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
// LEFT JOIN, not INNER: author_id is ON DELETE SET NULL, so a recipe can
// outlive its author. We still want to return the recipe, just with an empty
// author block.
func GetAllRecipes() ([]models.RecipeResponse, error) {
	sql := `SELECT r.id,
				COALESCE(r.author_id::text, ''),
				COALESCE(u.display_name, ''),
				COALESCE(u.avatar_url, ''),
				r.title, COALESCE(r.description, ''),
				COALESCE(r.preparation_time_min, 0),
				r.servings, COALESCE(r.difficulty, ''), COALESCE(r.cuisine, ''),
				COALESCE(r.meal_type, ''), COALESCE(r.image_url, ''),
				COALESCE(r.calories, 0), COALESCE(r.protein_g, 0), COALESCE(r.carbs_g, 0),
				COALESCE(r.fat_g, 0),
				r.created_at, r.updated_at
			FROM recipe r
			LEFT JOIN "user" u ON u.id = r.author_id
			ORDER BY r.created_at DESC`

	rows, err := Pool.Query(context.Background(), sql)
	if err != nil {
		return nil, fmt.Errorf("error querying recipes: %w", err)
	}
	defer rows.Close()

	var recipes []models.RecipeResponse
	for rows.Next() {
		var r models.RecipeResponse
		err := rows.Scan(
			&r.Id,
			&r.Author.Id, &r.Author.Display_name, &r.Author.Avatar_url,
			&r.Title, &r.Description,
			&r.Preparation_time_min, &r.Servings,
			&r.Difficulty, &r.Cuisine, &r.Meal_type, &r.Image_url,
			&r.Calories, &r.Protein_g, &r.Carbs_g, &r.Fat_g,
			&r.Created_at, &r.Updated_at,
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

func SearchRecipes(f models.SearchRecipeFilters, limit, offset int) ([]models.SearchRecipeResponse, error) {
	sql := `SELECT id, title, 
			COALESCE(preparation_time_min, 0),
			COALESCE(image_url, '')
			FROM recipe
			WHERE  1=1`
	var args []interface{}
	pCount := 1

	if f.Query != "" {
		sql += fmt.Sprintf(" AND title ILIKE $%d", pCount)
		args = append(args, "%"+f.Query+"%")
		pCount++
	}

	if f.Cuisine != "" {
		sql += fmt.Sprintf(" AND cuisine = $%d", pCount)
		args = append(args, f.Cuisine)
		pCount++
	}
	if f.Difficulty != "" {
		sql += fmt.Sprintf(" AND difficulty = $%d", pCount)
		args = append(args, f.Difficulty)
		pCount++
	}
	if f.MealType != "" {
		sql += fmt.Sprintf(" AND meal_type = $%d", pCount)
		args = append(args, f.MealType)
		pCount++
	}

	sortOrder := "DESC"
	if strings.ToLower(f.Date) == "oldest" {
		sortOrder = "ASC"
	}
	sql += fmt.Sprintf(" ORDER BY created_at %s LIMIT $%d OFFSET $%d", sortOrder, pCount, pCount+1)
	args = append(args, limit, offset)

	rows, err := Pool.Query(context.Background(), sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var recipes []models.SearchRecipeResponse
	for rows.Next() {
		var r models.SearchRecipeResponse
		err := rows.Scan(
			&r.Id,
			&r.Title,
			&r.Preparation_time_min,
			&r.Image_url,
		)
		if err != nil {
			return nil, err
		}
		recipes = append(recipes, r)
		if err := rows.Err(); err != nil {
			return nil, fmt.Errorf("repository.SearchRecipes: %w", err)
		}
	}
	return recipes, nil
}

// GetRecipeById returns a single recipe by UUID.
func GetRecipeById(id string) (models.RecipeResponse, error) {
	sql := `SELECT r.id,
				COALESCE(r.author_id::text, ''),
				COALESCE(u.display_name, ''),
				COALESCE(u.avatar_url, ''),
				r.title, COALESCE(r.description, ''),
				COALESCE(r.preparation_time_min, 0),
				r.servings, COALESCE(r.difficulty, ''), COALESCE(r.cuisine, ''),
				COALESCE(r.meal_type, ''), COALESCE(r.image_url, ''),
				COALESCE(r.calories, 0), COALESCE(r.protein_g, 0), COALESCE(r.carbs_g, 0),
				COALESCE(r.fat_g, 0),
				r.created_at, r.updated_at
			FROM recipe r
			LEFT JOIN "user" u ON u.id = r.author_id
			WHERE r.id = $1`

	var r models.RecipeResponse
	err := Pool.QueryRow(context.Background(), sql, id).Scan(
		&r.Id,
		&r.Author.Id, &r.Author.Display_name, &r.Author.Avatar_url,
		&r.Title, &r.Description,
		&r.Preparation_time_min, &r.Servings,
		&r.Difficulty, &r.Cuisine, &r.Meal_type, &r.Image_url,
		&r.Calories, &r.Protein_g, &r.Carbs_g, &r.Fat_g,
		&r.Created_at, &r.Updated_at,
	)

	if err == pgx.ErrNoRows {
		return models.RecipeResponse{}, &NotFoundError{"recipe not found"}
	}

	if err != nil {
		return models.RecipeResponse{}, fmt.Errorf("repository.GetRecipeById: %w", err)
	}

	return r, nil
}

func CreateRecipe(r *models.Recipe) (string, error) {
	sql := `
		INSERT INTO recipe (
			author_id, title, description, preparation_time_min,
			servings, difficulty, cuisine, meal_type, image_url,
			calories, protein_g, carbs_g, fat_g
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
		) RETURNING id`

	var newId string

	err := Pool.QueryRow(context.Background(), sql,
		r.Author_id, r.Title, r.Description, r.Preparation_time_min,
		r.Servings, r.Difficulty, r.Cuisine, r.Meal_type, r.Image_url,
		r.Calories, r.Protein_g, r.Carbs_g, r.Fat_g,
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
			title, description, preparation_time_min, servings,
			difficulty, cuisine, meal_type, image_url, calories,
			protein_g, carbs_g, fat_g
		) = (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
		),
			updated_at = now()
		WHERE id = $13`

	res, err := Pool.Exec(context.Background(), sql,
		r.Title, r.Description, r.Preparation_time_min, r.Servings,
		r.Difficulty, r.Cuisine, r.Meal_type, r.Image_url, r.Calories,
		r.Protein_g, r.Carbs_g, r.Fat_g,
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

	case pgerrcode.InvalidTextRepresentation:
		return &NotFoundError{"recipe not found"}

	default:
		return fmt.Errorf("%v: %w", functionName, err)
	}
}
