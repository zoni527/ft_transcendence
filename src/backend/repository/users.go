package repository

// Users DB functions needed:
	// [done] GetRolesByUserId  — helper for attaching roles
	// [done] GetAllUsers       — GET /api/users
	// [done] GetUserById       — GET /api/users/:id

// [TODO] CreateUser        — POST /api/users (transaction: insert user + assign default role. good time to learn about db transaction)
// [TODO] UpdateUser        — PUT /api/users/:id (full replace)
// [TODO] UpdateUser        — PATCH /api/users/:id (partial update)
// [TODO] DeleteUser        — DELETE /api/users/:id
// [TODO] SearchUsers       — GET /api/users/search?q=

import (
	"context"
	"fmt"

	"ft_transcendence/backend/models"

	"github.com/jackc/pgx/v5"
)

// GetRolesByUserId returns the role names for a given user.
// Joins user_role and role tables to get the role name strings.
func GetRolesByUserId(userId string) ([]string, error) {
	sql := `SELECT r.name
			FROM user_role ur
			JOIN role r ON ur.role_id = r.id
			WHERE ur.user_id = $1`

	rows, err := Pool.Query(context.Background(), sql, userId)
	if err != nil {
		return nil, fmt.Errorf("error querying roles: %w", err)
	}
	defer rows.Close()

	var roles []string
	for rows.Next() {
		var role string
		if err := rows.Scan(&role); err != nil {
			return nil, fmt.Errorf("error scanning role: %w", err)
		}
		roles = append(roles, role)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating roles: %w", err)
	}
	return roles, nil
}

// GetAllUsers returns all users with their roles attached.
func GetAllUsers() ([]models.User, error) {
	sql := `SELECT id, email, name, display_name, created_at
			FROM "user" `

	rows, err := Pool.Query(context.Background(), sql)
	if err != nil {
		return nil, fmt.Errorf("error querying users: %w", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		err := rows.Scan(
			&u.Id,
			&u.Email,
			&u.Name,
			&u.Display_name,
			&u.Created_at,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning user row: %w", err)
		}
		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating user rows: %w", err)
	}

	// Attach roles to each user
	for i := range users {
		roles, err := GetRolesByUserId(users[i].Id)
		if err != nil {
			return nil, fmt.Errorf("error getting roles for user %s: %w", users[i].Id, err)
		}
		users[i].Roles = roles
	}

	return users, nil
}

// GetUserById returns a single user by UUID, with roles attached.
func GetUserById(id string) (models.User, error) {
	sql := `SELECT id, email, name, display_name, created_at
			FROM "user"
			WHERE id = $1`

	var u models.User
	err := Pool.QueryRow(context.Background(), sql, id).Scan(
		&u.Id,
		&u.Email,
		&u.Name,
		&u.Display_name,
		&u.Created_at,
	)

	if err == pgx.ErrNoRows {
		return models.User{}, pgx.ErrNoRows
	}

	if err != nil {
		return models.User{}, fmt.Errorf("error getting user by id: %w", err)
	}

	// Attach roles
	roles, err := GetRolesByUserId(u.Id)
	if err != nil {
		return models.User{}, fmt.Errorf("error getting roles for user: %w", err)
	}
	u.Roles = roles

	return u, nil
}
