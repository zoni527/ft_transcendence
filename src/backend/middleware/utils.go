package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type IdentifierMode int

const (
	ByUserID IdentifierMode = iota
	ByApiKey
	ByIPOnly
)

type client struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var cleanRetention = 5 * time.Minute
var sleepInterval = 1 * time.Minute
var clients = make(map[string]*client)
var mu sync.Mutex

func init() {
	go func() {
		for {
			time.Sleep(sleepInterval)
			mu.Lock()
			for id, client := range clients {
				if time.Since(client.lastSeen) > cleanRetention {
					delete(clients, id)
				}
			}
			mu.Unlock()
		}
	}()
}

func getClientIdentifier(c *gin.Context, mode IdentifierMode) string {
	switch mode {
	case ByApiKey:
		apiKey := c.GetString("apiKey")
		if apiKey == "" {
			apiKey = c.GetHeader("X-API-Key")
		}
		if apiKey != "" {
			h := sha256.Sum256([]byte(apiKey))
			return "hashKey:" + hex.EncodeToString(h[:])
		}
	case ByUserID:
		if userID := c.GetString("userID"); userID != "" {
			return "user:" + userID
		}
	case ByIPOnly:
		return "ip:" + c.ClientIP()
	}
	return "ip:" + c.ClientIP()
}
