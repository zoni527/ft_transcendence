package middleware

import (
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
		if apiKey := c.GetString("apiKey"); apiKey != "" {
			return "key:" + apiKey
		}
		if apiKey := c.GetHeader("X-API-Key"); apiKey != "" {
			return "key:" + apiKey
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
