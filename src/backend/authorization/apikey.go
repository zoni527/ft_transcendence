package authorization

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
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

	return "", nil
}
