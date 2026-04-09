package main

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// GetRolesByUserId returns the role names for a given user.
// Joins user_role and role tables to get the role name strings.
func GetRolesByUserId(userId string) ([]string, error) {
	sql := `SELECT r.name
			FROM user_role ur
			JOIN role r ON ur.role_id = r.id
			WHERE ur.user_id = $1`

	rows, err := DB.Query(context.Background(), sql, userId)
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

//http://betterstack.com/community/guides/scaling-go/postgresql-pgx-golang/
func GetAllUsers() ([]user, error) {
	sql := `SELECT id, email, name, display_name, created_at
			FROM "user" `

	//DB.Query() returns a pgx.Rows object point to the result set of db.
	rows, err := DB.Query(context.Background(), sql)
	if err != nil {
		return nil, fmt.Errorf("error querying users: %w", err)
    }

	// releases the database connection back to the pool. If you forget to close, you'll leak connections and eventually run out.
	defer rows.Close()

	var users []user
	//step through rows one by one with
	for rows.Next() {
		var u user
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

	//declaring err, then check if it's nil
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

//placeholder — $1 tells pgx "use the first parameter I pass in"
func GetUserById(id string) (user, error) {
	sql := `SELECT id, email, name, display_name, created_at
			FROM "user"
			WHERE id = $1`

	var u user
	err := DB.QueryRow(context.Background(), sql, id).Scan(&u.Id, &u.Email, &u.Name, &u.Display_name, &u.Created_at)

	// built-in error that pgx defines
	if err == pgx.ErrNoRows {
		return user{}, pgx.ErrNoRows
	}

	if err != nil {
		return user{}, fmt.Errorf("error getting user by id: %w", err)
	}

	// Attach roles
	roles, err := GetRolesByUserId(u.Id)
	if err != nil {
		return user{}, fmt.Errorf("error getting roles for user: %w", err)
	}
	u.Roles = roles

	return u, nil
}
