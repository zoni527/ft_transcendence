package repository

// Users DB functions needed:
// [done] GetRolesByUserId  — helper for attaching roles
// [done] GetAllUsers       — GET /api/users
// [done] GetUserById       — GET /api/users/:id

// [done] CreateUser        — POST /api/users (transaction: insert user + assign default role. good time to learn about db transaction)
// [done] UpdateUser        — PUT /api/users/:id (self-update + admin update)
// [TODO] DeleteUser        — DELETE /api/users/:id
// [TODO] SearchUsers       — GET /api/users/search?q=
// [TODO] Add pagination (?page=1&limit=20) to GetAllUsers

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"ft_transcendence/backend/models"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
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

// WIP
func GetPermissionsByRole(role string) ([]string, error) {
	sql := `SELECT p.name
			FROM role_permission rp
			JOIN permission p ON rp.permission_id = p.id
			WHERE rp.role_name = $1`

	rows, err := Pool.Query(context.Background(), sql, role)
	if err != nil {
		return nil, fmt.Errorf("error querying permissions: %w", err)
	}
	defer rows.Close()

	var permissions []string
	for rows.Next() {
		var permission string
		if err := rows.Scan(&permission); err != nil {
			return nil, fmt.Errorf("error scanning permission: %w", err)
		}
		permissions = append(permissions, permission)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating permissions: %w", err)
	}
	return permissions, nil
}

// getRolesByUserIdTx is the transaction version of GetRolesByUserId.
func getRolesByUserIdTx(tx pgx.Tx, userId string) ([]string, error) {
	sql := `SELECT r.name
			FROM user_role ur
			JOIN role r ON ur.role_id = r.id
			WHERE ur.user_id = $1`

	rows, err := tx.Query(context.Background(), sql, userId)
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
	sql := `SELECT id, email, name, display_name, avatar_url,
				created_at, updated_at
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
			&u.Avatar_url,
			&u.Created_at,
			&u.Updated_at,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning user row: %w", err)
		}
		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating user rows: %w", err)
	}

	// TODO: N+1 query problem — this loops one query per user to get roles.
	// Optimize with LEFT JOIN + array_agg to fetch users and roles in a single query.
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
	sql := `SELECT id, email, name, display_name, avatar_url,
				created_at, updated_at
			FROM "user"
			WHERE id = $1`

	var u models.User
	err := Pool.QueryRow(context.Background(), sql, id).Scan(
		&u.Id,
		&u.Email,
		&u.Name,
		&u.Display_name,
		&u.Avatar_url,
		&u.Created_at,
		&u.Updated_at,
	)

	if err == pgx.ErrNoRows {
		return models.User{}, pgx.ErrNoRows
	}

	if err != nil {
		return models.User{}, fmt.Errorf("error getting user by id: %w", err)
	}

	// TODO: Same N+1 issue — optimize with JOIN when GetAllUsers is updated.
	roles, err := GetRolesByUserId(u.Id)
	if err != nil {
		return models.User{}, fmt.Errorf("error getting roles for user: %w", err)
	}
	u.Roles = roles

	return u, nil
}

// GetUserCredentialsByEmail returns a single user credentials by email
func GetUserCredentialsByEmail(email string) (models.User, error) {
	sql := `SELECT id, email, password_hash
			FROM "user"
			WHERE email = $1`

	var u models.User
	err := Pool.QueryRow(context.Background(), sql, email).Scan(
		&u.Id,
		&u.Email,
		&u.Password_hash,
	)
	if err == pgx.ErrNoRows {
		return models.User{}, pgx.ErrNoRows
	}
	if err != nil {
		return models.User{}, fmt.Errorf("error getting user by email: %w", err)
	}
	return u, nil
}

var ErrUserAlreadyExists = errors.New("user already exists")

// Add new user to database, Database validates email and username uniqueness, checked at this level to avoid race conditions
func CreateUser(params models.CreateUserParams) (models.User, error) {
	tx, err := Pool.Begin(context.Background())
	if err != nil {
		return models.User{}, fmt.Errorf("start transaction: %w", err)
	}
	defer tx.Rollback(context.Background())

	sql := `INSERT INTO "user"(email, password_hash, name, display_name)
			VALUES($1, $2, $3, $4)
			RETURNING id, email, name, display_name, created_at, updated_at;`

	var u models.User
	err = tx.QueryRow(context.Background(), sql, params.Email, params.Password_hashed,
		params.Name, params.Display_name).Scan(
		&u.Id,
		&u.Email,
		&u.Name,
		&u.Display_name,
		&u.Created_at,
		&u.Updated_at,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
			return models.User{}, ErrUserAlreadyExists
		}
		return models.User{}, fmt.Errorf("create user: %w", err)
	}

	roleSQL := `INSERT INTO user_role(user_id, role_id)
				VALUES($1, (SELECT id FROM role WHERE name = $2))`
	_, err = tx.Exec(context.Background(), roleSQL, u.Id, "user")
	if err != nil {
		return models.User{}, fmt.Errorf("assign role: %w", err)
	}
	err = tx.Commit(context.Background())
	if err != nil {
		return models.User{}, fmt.Errorf("commit transaction: %w", err)
	}
	return u, nil
}

func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func AddTokenToBlacklist(token string, expirationDate time.Time) error {
	tokenHash := hashToken(token)
	sql := `INSERT INTO token_blacklist(token_hash, expiration_date)
			VALUES ($1, $2)
			ON CONFLICT (token_hash) DO UPDATE
			SET expiration_date = EXCLUDED.expiration_date`
	if _, err := Pool.Exec(context.Background(), sql, tokenHash, expirationDate); err != nil {
		return fmt.Errorf("AddTokenToBlacklist: %w", err)
	}
	return nil
}

func GetTokenBlacklisted(token string) (bool, error) {
	tokenHash := hashToken(token)
	sql := `SELECT EXISTS (
			SELECT 1
			FROM token_blacklist
			WHERE token_hash = $1
	)`
	var exists bool
	err := Pool.QueryRow(context.Background(), sql, tokenHash).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("GetTokenBlacklisted: %w", err)
	}
	return exists, nil
}

func CleanExpiredTokens(currentTime time.Time) error {
	sql := `DELETE FROM token_blacklist
            WHERE expiration_date < $1`
	_, err := Pool.Exec(context.Background(), sql, currentTime)
	if err != nil {
		return fmt.Errorf("CleanExpiredTokens: %w", err)
	}
	return nil
}

func UpdateUser(id string, params models.UpdateUserParams) (models.User, error) {
	tx, err := Pool.Begin(context.Background())
	if err != nil {
		return models.User{}, fmt.Errorf("start transaction: %w", err)
	}
	defer tx.Rollback(context.Background())

	sql := `UPDATE "user"
			SET email = COALESCE($1, email),
				name = COALESCE($2, name),
				password_hash = COALESCE($3, password_hash),
				display_name = COALESCE($4, display_name),
				avatar_url = COALESCE($5, avatar_url),
				updated_at = NOW()
			WHERE id = $6
			RETURNING id, email, name, display_name, avatar_url, created_at, updated_at`

	var u models.User
	err = tx.QueryRow(context.Background(), sql,
		nullableString(params.Email),
		nullableString(params.Name),
		nullableString(params.Password_hashed),
		nullableString(params.Display_name),
		nullableString(params.Avatar_url),
		id,
	).Scan(
		&u.Id,
		&u.Email,
		&u.Name,
		&u.Display_name,
		&u.Avatar_url,
		&u.Created_at,
		&u.Updated_at,
	)
	if err == pgx.ErrNoRows {
		return models.User{}, pgx.ErrNoRows
	}
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
			return models.User{}, ErrUserAlreadyExists
		}
		return models.User{}, fmt.Errorf("UpdateUser profile: %w", err)
	}

	if params.Roles != nil {
		delSQL := `DELETE FROM user_role WHERE user_id = $1`
		if _, err := tx.Exec(context.Background(), delSQL, id); err != nil {
			return models.User{}, fmt.Errorf("UpdateUser delete roles: %w", err)
		}

		insSQL := `INSERT INTO user_role(user_id, role_id)
				   VALUES($1, (SELECT id FROM role WHERE name = $2))`
		for _, r := range params.Roles {
			if _, err := tx.Exec(context.Background(), insSQL, id, r); err != nil {
				return models.User{}, fmt.Errorf("UpdateUser insert role %s: %w", r, err)
			}
		}
	}

	roles, err := getRolesByUserIdTx(tx, u.Id)
	if err != nil {
		return models.User{}, fmt.Errorf("UpdateUser get roles: %w", err)
	}
	u.Roles = roles

	if err := tx.Commit(context.Background()); err != nil {
		return models.User{}, fmt.Errorf("UpdateUser commit: %w", err)
	}
	return u, nil
}

func nullableString(value *string) any {
	if value == nil {
		return nil
	}
	return *value
}
