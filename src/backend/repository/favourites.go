package repository

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5/pgconn"
)

// Favourites repository functions needed:
// [TODO] AddFavourite        — POST /api/recipes/:id/favourite
// [TODO] RemoveFavourite     — DELETE /api/recipes/:id/favourite
// [TODO] GetUserFavourites   — GET /api/users/:id/favourites

func AddFavourite(userId, recipeId string) error {
	sql := `
		INSERT INTO recipe_favourite(user_id, recipe_id)
		VALUES ($1, $2)
	`

	_, err := Pool.Exec(context.Background(), sql, userId, recipeId)
	if err != nil {
		return favouritePostgresErrorClassification("repository.AddFavourite", err)
	}

	return nil
}

func favouritePostgresErrorClassification(functionName string, err error) error {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return fmt.Errorf("%v: %w", functionName, err)
	}

	switch pgErr.Code {
	case pgerrcode.ForeignKeyViolation:
		switch pgErr.ConstraintName {
		case "fk_user_id":
			return &BadRequestError{"invalid user id"}
		case "fk_recipe_id":
			return &NotFoundError{"recipe not found"}
		default:
			log.Printf("%v: check violation: %v", functionName, pgErr.ConstraintName)
			return &BadRequestError{"invalid data"}
		}

	case pgerrcode.UniqueViolation:
		return &ConflictError{"recipe already favourited"}

	case pgerrcode.InvalidTextRepresentation:
		return &NotFoundError{"bad format"}

	default:
		return fmt.Errorf("%v: %w", functionName, err)
	}
}
