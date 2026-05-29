package authorization

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
	"strings"

	"ft_transcendence/backend/repository"
)

func GenerateAPIKey(userID string) (string, string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", "", err
	}
	randomSecret := hex.EncodeToString(b)

	rawApiKey := fmt.Sprintf("%s.%s", userID, randomSecret)

	return rawApiKey, randomSecret, nil
}

func ValidateAPIKey(ctx context.Context, key string) (userID string, err error) {
	parts := strings.Split(key, ".")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return "", fmt.Errorf("invalid api key format")
	}

	userID = parts[0]
	secret := parts[1]
	if !IsValidUUID(userID) {
		return "", fmt.Errorf("invalid api key format")
	}
	storedHash, err := repository.GetAPIKeyHash(ctx, userID)
	if err != nil {
		return "", err
	}

	sum := sha256.Sum256([]byte(secret))
	providedHash := hex.EncodeToString(sum[:])

	if subtle.ConstantTimeCompare([]byte(providedHash), []byte(storedHash)) != 1 {
		return "", fmt.Errorf("provided hash does not match")
	}

	return userID, nil
}
