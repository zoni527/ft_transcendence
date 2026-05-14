package repository

func SaveAPIKey(userID, rawSecret string) error {

	hashedSecret := hashToken(rawSecret)

	sql := `INSERT INTO  api_keys(user_id, secret_hash, created_at)
			VALUES ($1, $2, NOW())`

	_, err := Pool.Exec(context.Background(), sql, userID, hashedSecret)
	if err != nil {
		return fmt.Errorf("SaveAPIKey: %w", err)
	}
	return nil
}
