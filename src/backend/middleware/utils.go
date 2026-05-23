package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type identifierMode int

const (
	byUserID identifierMode = iota
	byApiKey
	byIPOnly
)

type client struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var clients = make(map[string]*client)
var mu sync.Mutex

func init() {
	go func() {
		for {
			time.Sleep(1 * time.Minute)
			mu.Lock()
			for id, client := range clients {
				if time.Since(client.lastSeen) > 3*time.Minute {
					delete(clients, id)
				}
			}
			mu.Unlock()
		}
	}()
}

func getClientIdentifier(c *gin.Context, mode identifierMode) string {
	switch mode {
	case byApiKey:
		apiKey := c.GetString("apiKey")
		if apiKey == "" {
			apiKey = c.GetHeader("X-API-Key")
		}
		if apiKey != "" {
			h := sha256.Sum256([]byte(apiKey))
			return "hashKey:" + hex.EncodeToString(h[:])
		}
	case byUserID:
		if userID := c.GetString("userID"); userID != "" {
			return "user:" + userID
		}
	case byIPOnly:
		return "ip:" + c.ClientIP()
	}
	return "ip:" + c.ClientIP()
}
