package repository

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"

	"ft_transcendence/backend/errorhandling"
	"ft_transcendence/backend/models"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RecipeRepository interface {
	GetAllRecipes(ctx context.Context) ([]models.RecipeResponse, error)
	GetRecipeByID(ctx context.Context, id string) (models.RecipeResponse, error)
	CreateRecipe(ctx context.Context, r *models.Recipe) (string, error)
	UpdateRecipe(ctx context.Context, r *models.Recipe) error
	DeleteRecipe(ctx context.Context, id string) error
	SearchRecipes(ctx context.Context, f models.SearchRecipeFilters, limit, offset int) ([]models.SearchRecipeResponse, error)
}

type postgresRecipeRepo struct {
	Pool *pgxpool.Pool
}

func NewPostgresRecipeRepo(pool *pgxpool.Pool) RecipeRepository {
	return &postgresRecipeRepo{Pool: pool}
}

// GetAllRecipes returns all recipes.
func (pgRepo *postgresRecipeRepo) GetAllRecipes(ctx context.Context) ([]models.RecipeResponse, error) {
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

	rows, err := pgRepo.Pool.Query(ctx, sql)
	if err != nil {
		return nil, fmt.Errorf("error querying recipes: %w", err)
	}
	defer rows.Close()

	var recipes []models.RecipeResponse
	for rows.Next() {
		var r models.RecipeResponse
		err := rows.Scan(
			&r.ID,
			&r.Author.ID, &r.Author.DisplayName, &r.Author.AvatarURL,
			&r.Title, &r.Description,
			&r.PreparationTimeMin, &r.Servings,
			&r.Difficulty, &r.Cuisine, &r.MealType, &r.ImageURL,
			&r.Calories, &r.ProteinGrams, &r.CarbsGrams, &r.FatGrams,
			&r.CreatedAt, &r.UpdatedAt,
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

func (pgRepo *postgresRecipeRepo) SearchRecipes(ctx context.Context, f models.SearchRecipeFilters, limit, offset int) ([]models.SearchRecipeResponse, error) {
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

	rows, err := pgRepo.Pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var recipes []models.SearchRecipeResponse
	for rows.Next() {
		var r models.SearchRecipeResponse
		err := rows.Scan(
			&r.ID,
			&r.Title,
			&r.PreparationTimeMin,
			&r.ImageURL,
		)
		if err != nil {
			return nil, err
		}
		recipes = append(recipes, r)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("repository.SearchRecipes: %w", err)
	}
	return recipes, nil
}

// GetRecipeByID returns a single recipe by UUID.
func (pgRepo *postgresRecipeRepo) GetRecipeByID(ctx context.Context, id string) (models.RecipeResponse, error) {
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
	err := pgRepo.Pool.QueryRow(ctx, sql, id).Scan(
		&r.ID,
		&r.Author.ID, &r.Author.DisplayName, &r.Author.AvatarURL,
		&r.Title, &r.Description,
		&r.PreparationTimeMin, &r.Servings,
		&r.Difficulty, &r.Cuisine, &r.MealType, &r.ImageURL,
		&r.Calories, &r.ProteinGrams, &r.CarbsGrams, &r.FatGrams,
		&r.CreatedAt, &r.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return models.RecipeResponse{}, errorhandling.NotFoundRecipe()
	}

	if err != nil {
		return models.RecipeResponse{}, fmt.Errorf("GetRecipeByID: %w", err)
	}

	return r, nil
}

func (pgRepo *postgresRecipeRepo) CreateRecipe(ctx context.Context, r *models.Recipe) (string, error) {
	sql := `
		INSERT INTO recipe (
			author_id, title, description, preparation_time_min,
			servings, difficulty, cuisine, meal_type, image_url,
			calories, protein_g, carbs_g, fat_g
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
		) RETURNING id`

	var newID string

	err := pgRepo.Pool.QueryRow(ctx, sql,
		r.AuthorID, r.Title, r.Description, r.PreparationTimeMin,
		r.Servings, r.Difficulty, r.Cuisine, r.MealType, r.ImageURL,
		r.Calories, r.ProteinGrams, r.CarbsGrams, r.FatGrams,
	).Scan(&newID)
	if err != nil {
		return "", recipePostgresErrorClassification("repository.CreateRecipe", err)
	}

	return newID, nil
}

func (pgRepo *postgresRecipeRepo) UpdateRecipe(ctx context.Context, r *models.Recipe) error {
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

	res, err := pgRepo.Pool.Exec(ctx, sql,
		r.Title, r.Description, r.PreparationTimeMin, r.Servings,
		r.Difficulty, r.Cuisine, r.MealType, r.ImageURL, r.Calories,
		r.ProteinGrams, r.CarbsGrams, r.FatGrams,
		r.ID,
	)
	if err != nil {
		return recipePostgresErrorClassification("repository.UpdateRecipe", err)
	}
	if res.RowsAffected() == 0 {
		return errorhandling.NotFoundRecipe()
	}

	return nil
}

func (pgRepo *postgresRecipeRepo) DeleteRecipe(ctx context.Context, id string) error {
	sql := `DELETE FROM recipe WHERE id = $1`
	res, err := pgRepo.Pool.Exec(ctx, sql, id)
	if err != nil {
		return fmt.Errorf("repository.DeleteRecipe: %w", err)
	}
	if res.RowsAffected() == 0 {
		return errorhandling.NotFoundRecipe()
	}

	return nil
}

// -----------------------------------------------------------------------------
// helper functions

func recipePostgresErrorClassification(functionName string, err error) error {
	var pgErr *pgconn.PgError
	// Not a Postgres error -> internal server error
	if !errors.As(err, &pgErr) {
		return fmt.Errorf("%v: %w", functionName, err)
	}
	switch pgErr.Code {
	case pgerrcode.ForeignKeyViolation:
		if pgErr.ConstraintName == "fk_author_id" {
			return errorhandling.BadRequest(
				errorhandling.RecipeAuthorIDInvalid,
				"invalid author id",
			)
		}
		log.Printf("%v: foreign key violation: %v", functionName, pgErr.ConstraintName)
		return errorhandling.BadRequest(
			errorhandling.RecipeDataInvalid,
			"invalid recipe data",
		)

	case pgerrcode.CheckViolation:
		switch pgErr.ConstraintName {
		case "recipe_difficulty_allowed_values":
			return errorhandling.BadRequest(
				errorhandling.RecipeDifficultyInvalid,
				"invalid difficulty value",
			)
		case "recipe_meal_type_allowed_values":
			return errorhandling.BadRequest(
				errorhandling.RecipeMealTypeInvalid,
				"invalid meal type value",
			)
		default:
			log.Printf("%v: check violation: %v", functionName, pgErr.ConstraintName)
			return errorhandling.BadRequest(
				errorhandling.RecipeDataInvalid,
				"invalid recipe data",
			)
		}

	case pgerrcode.InvalidTextRepresentation:
		return errorhandling.NotFoundRecipe()

	default:
		return fmt.Errorf("%v: %w", functionName, err)
	}
}
