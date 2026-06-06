package repository

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"ft_transcendence/backend/errorhandling"
	"ft_transcendence/backend/integrations"
	"ft_transcendence/backend/models"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository interface {
	GetRolesByUserID(ctx context.Context, userID string) ([]string, error)
	SearchUsersByUsername(ctx context.Context, username string) ([]models.UserSearchResult, error)
	GetAllUsers(ctx context.Context) ([]models.User, error)
	GetUserByID(ctx context.Context, id string) (models.User, error)
	GetUserCredentialsByEmail(ctx context.Context, email string) (models.User, error)
	GetUserCredentialsByDisplayName(ctx context.Context, displayName string) (models.User, error)
	CreateUser(ctx context.Context, params models.CreateUserParams) (models.User, error)
	UpdateUser(ctx context.Context, id string, params models.UpdateUserParams) (models.User, error)
	UpdateLastSeen(ctx context.Context, userID string) error
	MarkOffline(ctx context.Context, userID string) error
	DeleteUser(ctx context.Context, userID string) error
}

type postgresUserRepo struct {
	pool *pgxpool.Pool
}

func NewPostgresUserRepo(pool *pgxpool.Pool) UserRepository {
	return &postgresUserRepo{pool: pool}
}

// GetRolesByUserID returns the role names for a given user.
// Joins user_role and role tables to get the role name strings.
func (pgRepo *postgresUserRepo) GetRolesByUserID(ctx context.Context, userID string) ([]string, error) {
	sql := `SELECT r.name
			FROM user_role ur
			JOIN role r ON ur.role_id = r.id
			WHERE ur.user_id = $1`

	rows, err := pgRepo.pool.Query(ctx, sql, userID)
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

func GetEffectivePermissionsByUser(ctx context.Context, userID string) (map[string]bool, map[string]bool, error) {
	sql := `SELECT r.name, p.name
			FROM user_role ur
			JOIN role r ON ur.role_id = r.id
			LEFT JOIN role_permission rp ON rp.role_id = r.id
			LEFT JOIN permission p ON rp.permission_id = p.id
			WHERE ur.user_id = $1`
	rows, err := Pool.Query(ctx, sql, userID)
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

func (pgRepo *postgresUserRepo) SearchUsersByUsername(ctx context.Context, username string) ([]models.UserSearchResult, error) {
	searchTerm := "%" + username + "%"
	sql := `SELECT id, name, display_name
		    FROM "user"
		    WHERE display_name ILIKE $1
			LIMIT 10`
	rows, err := pgRepo.pool.Query(ctx, sql, searchTerm)
	if err != nil {
		return nil, fmt.Errorf("error querying users: %w", err)
	}
	defer rows.Close()

	users := make([]models.UserSearchResult, 0)
	for rows.Next() {
		var u models.UserSearchResult
		err := rows.Scan(
			&u.ID,
			&u.Name,
			&u.DisplayName,
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

// getRolesByUserIDTx is the transaction version of GetRolesByUserID.
func getRolesByUserIDTx(ctx context.Context, tx pgx.Tx, userID string) ([]string, error) {
	sql := `SELECT r.name
			FROM user_role ur
			JOIN role r ON ur.role_id = r.id
			WHERE ur.user_id = $1`

	rows, err := tx.Query(ctx, sql, userID)
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
func (pgRepo *postgresUserRepo) GetAllUsers(ctx context.Context) ([]models.User, error) {
	sql := `SELECT id, email, name, display_name, avatar_url,
				created_at, updated_at, last_seen
			FROM "user" `

	rows, err := pgRepo.pool.Query(ctx, sql)
	if err != nil {
		return nil, fmt.Errorf("error querying users: %w", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		err := rows.Scan(
			&u.ID,
			&u.Email,
			&u.Name,
			&u.DisplayName,
			&u.AvatarURL,
			&u.CreatedAt,
			&u.UpdatedAt,
			&u.LastSeen,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning user row: %w", err)
		}
		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating user rows: %w", err)
	}

	for i := range users {
		roles, err := pgRepo.GetRolesByUserID(ctx, users[i].ID)
		if err != nil {
			return nil, fmt.Errorf("error getting roles for user %s: %w", users[i].ID, err)
		}
		users[i].Roles = roles
	}

	return users, nil
}

// GetUserByID returns a single user by UUID, with roles attached.
func (pgRepo *postgresUserRepo) GetUserByID(ctx context.Context, id string) (models.User, error) {
	sql := `SELECT id, email, name, display_name, avatar_url,
				created_at, updated_at, last_seen
			FROM "user"
			WHERE id = $1`

	var u models.User
	err := pgRepo.pool.QueryRow(ctx, sql, id).Scan(
		&u.ID,
		&u.Email,
		&u.Name,
		&u.DisplayName,
		&u.AvatarURL,
		&u.CreatedAt,
		&u.UpdatedAt,
		&u.LastSeen,
	)

	if err == pgx.ErrNoRows {
		return models.User{}, errorhandling.NotFoundUser()
	}

	if err != nil {
		return models.User{}, fmt.Errorf("error getting user by id: %w", err)
	}

	roles, err := pgRepo.GetRolesByUserID(ctx, u.ID)
	if err != nil {
		return models.User{}, fmt.Errorf("error getting roles for user: %w", err)
	}
	u.Roles = roles

	return u, nil
}

// Helper function for fetching user credentials by a unique field
func (pgRepo *postgresUserRepo) getUserCredentialsBy(ctx context.Context, field, value string) (models.User, error) {
	if !(field == "email" || field == "display_name") {
		return models.User{}, fmt.Errorf("invalid query field")
	}

	sql := fmt.Sprintf(`
		SELECT id, email, password_hash
		FROM "user"
		WHERE %v = $1`, field)

	var u models.User
	err := pgRepo.pool.QueryRow(ctx, sql, value).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
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
func (pgRepo *postgresUserRepo) GetUserCredentialsByEmail(ctx context.Context, email string) (models.User, error) {
	return pgRepo.getUserCredentialsBy(ctx, "email", email)
}

// Returns a single user's credentials by display_name
func (pgRepo *postgresUserRepo) GetUserCredentialsByDisplayName(ctx context.Context, displayName string) (models.User, error) {
	return pgRepo.getUserCredentialsBy(ctx, "display_name", displayName)
}

// Add new user to database, Database validates email and username uniqueness, checked at this level to avoid race conditions
func (pgRepo *postgresUserRepo) CreateUser(ctx context.Context, params models.CreateUserParams) (models.User, error) {
	tx, err := pgRepo.pool.Begin(ctx)
	if err != nil {
		return models.User{}, fmt.Errorf("start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	sql := `INSERT INTO "user"(email, password_hash, name, display_name)
			VALUES($1, $2, $3, $4)
			RETURNING id, email, name, display_name, created_at, updated_at;`

	var u models.User
	err = tx.QueryRow(ctx, sql, params.Email, params.PasswordHashed,
		params.Name, params.DisplayName).Scan(
		&u.ID,
		&u.Email,
		&u.Name,
		&u.DisplayName,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
			return models.User{}, errorhandling.Conflict(
				errorhandling.UserAlreadyExists,
				"user with email/username already exists",
			)
		}
		return models.User{}, fmt.Errorf("create user: %w", err)
	}

	roleSQL := `INSERT INTO user_role(user_id, role_id)
				VALUES($1, (SELECT id FROM role WHERE name = $2))`
	_, err = tx.Exec(ctx, roleSQL, u.ID, "user")
	if err != nil {
		return models.User{}, fmt.Errorf("assign role: %w", err)
	}
	err = tx.Commit(ctx)
	if err != nil {
		return models.User{}, fmt.Errorf("commit transaction: %w", err)
	}
	return u, nil
}

func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func AddTokenToBlacklist(ctx context.Context, token string, expirationDate time.Time) error {
	tokenHash := hashToken(token)
	sql := `INSERT INTO token_blacklist(token_hash, expiration_date)
			VALUES ($1, $2)
			ON CONFLICT (token_hash) DO UPDATE
			SET expiration_date = EXCLUDED.expiration_date`
	if _, err := Pool.Exec(ctx, sql, tokenHash, expirationDate); err != nil {
		return fmt.Errorf("AddTokenToBlacklist: %w", err)
	}
	return nil
}

func GetTokenBlacklisted(ctx context.Context, token string) (bool, error) {
	tokenHash := hashToken(token)
	sql := `SELECT EXISTS (
			SELECT 1
			FROM token_blacklist
			WHERE token_hash = $1
	)`
	var exists bool
	err := Pool.QueryRow(ctx, sql, tokenHash).Scan(&exists)
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

var ErrOAuthUserBlock = errors.New("password and email changing blocked for OAuth users")

func (pgRepo *postgresUserRepo) UpdateUser(ctx context.Context, id string, params models.UpdateUserParams) (models.User, error) {
	tx, err := pgRepo.pool.Begin(ctx)
	if err != nil {
		return models.User{}, fmt.Errorf("start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	sql := `UPDATE "user" SET
				email = CASE
					WHEN password_hash = $7 AND $1::varchar IS NOT NULL THEN email
					ELSE COALESCE($1, email)
				END,
				name = COALESCE($2, name),
				password_hash = CASE
					WHEN password_hash = $7 AND $3::varchar IS NOT NULL THEN password_hash
					ELSE COALESCE($3, password_hash)
				END,
				display_name = COALESCE($4, display_name),
				avatar_url = COALESCE($5, avatar_url),
				updated_at = CASE
					WHEN (password_hash = $7 AND $3::varchar IS NOT NULL)
					  OR (password_hash = $7 AND $1::varchar IS NOT NULL) THEN updated_at
					ELSE NOW()
				END
			WHERE id = $6
			RETURNING
				id, email, name, display_name, avatar_url, created_at, updated_at, last_seen,
				   (password_hash = $7 AND $1::varchar IS NOT NULL AND $1 != email)
				OR (password_hash = $7 AND $3::varchar IS NOT NULL) AS is_oauth_block`

	var u models.User
	var isOAuthBlock bool

	err = tx.QueryRow(ctx, sql,
		nullableString(params.Email),
		nullableString(params.Name),
		nullableString(params.PasswordHashed),
		nullableString(params.DisplayName),
		nullableString(params.AvatarURL),
		id,
		integrations.GoogleOAuthLockedPassword,
	).Scan(
		&u.ID,
		&u.Email,
		&u.Name,
		&u.DisplayName,
		&u.AvatarURL,
		&u.CreatedAt,
		&u.UpdatedAt,
		&u.LastSeen,
		&isOAuthBlock,
	)
	if err == pgx.ErrNoRows {
		return models.User{}, errorhandling.NotFoundUser()
	}
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
			return models.User{}, errorhandling.Conflict(
				errorhandling.UserAlreadyExists,
				"user with email/username already exists",
			)
		}
		return models.User{}, fmt.Errorf("UpdateUser profile: %w", err)
	}

	if isOAuthBlock {
		return models.User{}, ErrOAuthUserBlock
	}

	if params.Roles != nil {
		delSQL := `DELETE FROM user_role WHERE user_id = $1`
		if _, err := tx.Exec(ctx, delSQL, id); err != nil {
			return models.User{}, fmt.Errorf("UpdateUser delete roles: %w", err)
		}

		insSQL := `INSERT INTO user_role(user_id, role_id)
				   VALUES($1, (SELECT id FROM role WHERE name = $2))`
		for _, r := range params.Roles {
			if _, err := tx.Exec(ctx, insSQL, id, r); err != nil {
				return models.User{}, fmt.Errorf("UpdateUser insert role %s: %w", r, err)
			}
		}
	}

	roles, err := getRolesByUserIDTx(ctx, tx, u.ID)
	if err != nil {
		return models.User{}, fmt.Errorf("UpdateUser get roles: %w", err)
	}
	u.Roles = roles

	if err := tx.Commit(ctx); err != nil {
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

func (pgRepo *postgresUserRepo) UpdateLastSeen(ctx context.Context, userID string) error {
	sql := `UPDATE "user" SET last_seen = NOW() WHERE id = $1`

	commandTag, err := pgRepo.pool.Exec(ctx, sql, userID)
	if err != nil {
		return fmt.Errorf("UpdateLastSeen: %w", err)
	}
	if commandTag.RowsAffected() == 0 {
		return errorhandling.NotFoundUser()
	}
	return nil
}

func (pgRepo *postgresUserRepo) MarkOffline(ctx context.Context, userID string) error {
	sql := `UPDATE "user" SET last_seen = '1970-01-01' WHERE id = $1`

	commandTag, err := pgRepo.pool.Exec(ctx, sql, userID)
	if err != nil {
		return fmt.Errorf("MarkOffline: %w", err)
	}
	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("MarkOffline: %w", pgx.ErrNoRows)
	}
	return nil
}

var ErrLastAdmin = errors.New("cannot delete the last admin")

func (pgRepo *postgresUserRepo) DeleteUser(ctx context.Context, userID string) error {
	tx, err := pgRepo.pool.Begin(ctx)
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
			 WHERE r.name = 'admin') = 1`, userID).Scan(&isLast); err != nil {
		return fmt.Errorf("repository.DeleteUser: %w", err)
	}
	if isLast {
		return ErrLastAdmin
	}

	res, err := tx.Exec(ctx, `DELETE FROM "user" WHERE id = $1`, userID)
	if err != nil {
		return fmt.Errorf("repository.DeleteUser: %w", err)
	}
	if res.RowsAffected() == 0 {
		return errorhandling.NotFoundUser()
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("repository.DeleteUser: %w", err)
	}
	return nil
}
