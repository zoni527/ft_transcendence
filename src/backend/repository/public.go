package repository

import (
	"context"
	"fmt"
	"time"
)

func SaveAPIKey(ctx context.Context, userID, rawSecret string) error {
	hashedSecret := hashToken(rawSecret)
	sql := `INSERT INTO api_keys(user_id, secret_hash, created_at)
			VALUES ($1, $2, NOW())
			ON CONFLICT (user_id)
			DO UPDATE SET
				secret_hash = EXCLUDED.secret_hash,
				created_at = NOW()`

	_, err := Pool.Exec(ctx, sql, userID, hashedSecret)
	if err != nil {
		return fmt.Errorf("SaveAPIKey: %w", err)
	}
	return nil
}

func GetAPIKeyHash(ctx context.Context, userID string) (string, error) {
	sql := `SELECT secret_hash
			FROM api_keys
			WHERE user_id = $1`
	var hash string
	err := Pool.QueryRow(ctx, sql, userID).Scan(
		&hash,
	)
	if err != nil {
		return "", fmt.Errorf("GetAPIKeyHash: %w", err)
	}
	return hash, nil
}

func GetAPIKeyCreatedAt(ctx context.Context, userID string) (time.Time, error) {
	sql := `SELECT created_at FROM api_keys WHERE user_id = $1`
	var createdAt time.Time
	err := Pool.QueryRow(ctx, sql, userID).Scan(&createdAt)
	if err != nil {
		return time.Time{}, fmt.Errorf("GetAPIKeyCreatedAt: %w", err)
	}
	return createdAt, nil
}
