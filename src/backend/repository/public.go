package repository

import (
	"fmt"

	"context"
)

func SaveAPIKey(userID, rawSecret string) error {
	hashedSecret := hashToken(rawSecret)
	sql := `INSERT INTO api_keys(user_id, secret_hash, created_at)
			VALUES ($1, $2, NOW())
			ON CONFLICT (user_id)
			DO UPDATE SET
				secret_hash = EXCLUDED.secret_hash,
				created_at = NOW()`

	_, err := Pool.Exec(context.Background(), sql, userID, hashedSecret)
	if err != nil {
		return fmt.Errorf("SaveAPIKey: %w", err)
	}
	return nil
}

func GetAPIKeyHash(userID string) (string, error) {
	sql := `SELECT secret_hash
			FROM api_keys
			WHERE user_id = $1`
	var hash string
	err := Pool.QueryRow(context.Background(), sql, userID).Scan(
		&hash,
	)
	if err != nil {
		return "", fmt.Errorf("GetAPIKeyHash: %w", err)
	}
	return hash, nil
}
