package authorization

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"ft_transcendence/backend/repository"
	"strings"
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

func ValidateAPIKey(key string) (userID string, err error) {
	parts := strings.Split(key, ".")
	if len(parts) != 2 {
		return "", fmt.Errorf("invalid api key format")
	}

	userID = parts[0]
	secret := parts[1]
	storedHash, err := repository.GetAPIKeyHash(userID)
	if err != nil {
		return "", err
	}

	sum := sha256.Sum256([]byte(secret))
	providedHash := hex.EncodeToString(sum[:])

	if providedHash != storedHash {
		return "", fmt.Errorf("provided hash do not match")
	}

	return userID, nil
}
