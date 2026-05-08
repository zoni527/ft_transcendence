package authorization

import (
	"fmt"
	"log"
	"time"

	"ft_transcendence/backend/repository"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

func InitJWTSecret(secret string) {
	jwtSecret = []byte(secret)
}

func GenerateJWTToken(userID string) (string, error) {
	now := time.Now()
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(now.Add(1 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(now),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ValidateJWTToken(token string) (*jwt.RegisteredClaims, error) {
	claims := &jwt.RegisteredClaims{}
	parsedToken, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
		if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, fmt.Errorf("unexpected signing method %s", t.Method.Alg())
		}
		return jwtSecret, nil
	})
	if err != nil || !parsedToken.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	if claims.Subject == "" {
		return nil, fmt.Errorf("missing userID")
	}
	if claims.ExpiresAt == nil {
		return nil, fmt.Errorf("missing expiration date")
	}
	return claims, nil
}

func TokenCleanupLoop() {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()
	for range ticker.C {
		if err := repository.CleanExpiredTokens(time.Now()); err != nil {
			log.Printf("TokenCleanupLoop: %v", err)
		}
	}
}
