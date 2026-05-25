package repository

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

func GetEffectivePermissionsByUser(userId string) (map[string]bool, map[string]bool, error) {
	sql := `SELECT r.name, p.name
			FROM user_role ur
			JOIN role r ON ur.role_id = r.id
			LEFT JOIN role_permission rp ON rp.role_id = r.id
			LEFT JOIN permission p ON rp.permission_id = p.id
			WHERE ur.user_id = $1`
	rows, err := Pool.Query(context.Background(), sql, userId)
	if err != nil {
		return nil, nil, fmt.Errorf("error querying roles/permissions: %w", err)
	}
	defer rows.Close()

	roles := make(map[string]bool)
	perms := make(map[string]bool)
	for rows.Next() {
		var roleName string
		var permName *string
		if err := rows.Scan(&roleName, &permName); err != nil {
			return nil, nil, err
		}
		roles[roleName] = true
		if permName != nil && *permName != "" {
			perms[*permName] = true
		}
	}
	if err := rows.Err(); err != nil {
		return nil, nil, err
	}
	return roles, perms, nil
}

func SearchUsersByUsername(username string) ([]models.UserSearchResult, error) {
	searchTerm := "%" + username + "%"
	sql := `SELECT id, name, display_name
		    FROM "user"
		    WHERE display_name ILIKE $1
			LIMIT 10`
	rows, err := Pool.Query(context.Background(), sql, searchTerm)
	if err != nil {
		return nil, fmt.Errorf("error querying users: %w", err)
	}
	defer rows.Close()

	users := make([]models.UserSearchResult, 0)
	for rows.Next() {
		var u models.UserSearchResult
		err := rows.Scan(
			&u.Id,
			&u.Name,
			&u.Display_name,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning user row: %w", err)
		}
		users = append(users, u)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating user rows: %w", err)
	}
	return users, nil
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
				created_at, updated_at, last_seen
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
			&u.Last_seen,
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
				created_at, updated_at, last_seen
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
		&u.Last_seen,
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

// Helper function for fetching user credentials by a unique field
func getUserCredentialsBy(field, value string) (models.User, error) {
	if !(field == "email" || field == "display_name") {
		return models.User{}, fmt.Errorf("invalid query field")
	}

	sql := fmt.Sprintf(`
		SELECT id, email, password_hash
		FROM "user"
		WHERE %v = $1`, field)

	var u models.User
	err := Pool.QueryRow(context.Background(), sql, value).Scan(
		&u.Id,
		&u.Email,
		&u.Password_hash,
	)
	if err == pgx.ErrNoRows {
		return models.User{}, pgx.ErrNoRows
	}
	if err != nil {
		return models.User{}, fmt.Errorf("error getting user by %v: %w", field, err)
	}
	return u, nil
}

// Returns a single user's credentials by email
func GetUserCredentialsByEmail(email string) (models.User, error) {
	return getUserCredentialsBy("email", email)
}

// Returns a single user's credentials by display_name
func GetUserCredentialsByDisplayName(displayName string) (models.User, error) {
	return getUserCredentialsBy("display_name", displayName)
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
			RETURNING id, email, name, display_name, avatar_url, created_at, updated_at, last_seen`

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
		&u.Last_seen,
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

func UpdateLastSeen(userId string) error {
	sql := `UPDATE "user" SET last_seen = NOW() WHERE id = $1`

	commandTag, err := Pool.Exec(context.Background(), sql, userId)
	if err != nil {
		return fmt.Errorf("UpdateLastSeen: %w", err)
	}
	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("UpdateLastSeen: %w", pgx.ErrNoRows)
	}
	return nil
}

func MarkOffline(userId string) error {
	sql := `UPDATE "user" SET last_seen = '1970-01-01' WHERE id = $1`

	commandTag, err := Pool.Exec(context.Background(), sql, userId)
	if err != nil {
		return fmt.Errorf("MarkOffline: %w", err)
	}
	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("MarkOffline: %w", pgx.ErrNoRows)
	}
	return nil
}

var ErrLastAdmin = errors.New("cannot delete the last admin")

func DeleteUser(userId string) error {
	ctx := context.Background()
	tx, err := Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("repository.DeleteUser: %w", err)
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `
		SELECT 1 FROM user_role ur
		JOIN role r ON ur.role_id = r.id
		WHERE r.name = 'admin'
		ORDER BY ur.user_id
		FOR UPDATE`); err != nil {
		return fmt.Errorf("repository.DeleteUser: %w", err)
	}

	var isLast bool
	if err := tx.QueryRow(ctx, `
		SELECT
			EXISTS(SELECT 1 FROM user_role ur
			       JOIN role r ON ur.role_id = r.id
			       WHERE ur.user_id = $1 AND r.name = 'admin')
			AND
			(SELECT COUNT(*) FROM user_role ur
			 JOIN role r ON ur.role_id = r.id
			 WHERE r.name = 'admin') = 1`, userId).Scan(&isLast); err != nil {
		return fmt.Errorf("repository.DeleteUser: %w", err)
	}
	if isLast {
		return ErrLastAdmin
	}

	res, err := tx.Exec(ctx, `DELETE FROM "user" WHERE id = $1`, userId)
	if err != nil {
		return fmt.Errorf("repository.DeleteUser: %w", err)
	}
	if res.RowsAffected() == 0 {
		return &NotFoundError{"user not found"}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("repository.DeleteUser: %w", err)
	}
	return nil
}
