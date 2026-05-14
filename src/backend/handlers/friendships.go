package handlers

import (
	"log"
	"net/http"
	"time"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/models"
	"ft_transcendence/backend/repository"

	"github.com/gin-gonic/gin"
)

//TODO: GetFriendships:       GET    /api/friendships
//TODO: CreateFriendRequest:  POST   /api/friendships
//TODO: AcceptFriendRequest:  PATCH  /api/friendships/:id
//TODO: DeleteFriendship:     DELETE /api/friendships/:id

func GetFriendships(c *gin.Context) {
	userID := c.GetString("userID")
	if !authorization.IsValidUUID(userID) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

	rows, err := repository.GetFriendshipsForUser(userID)
	if err != nil {
		log.Printf("GetFriendships error: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	resp := models.FriendshipsResponse{
		Friends:  []models.FriendshipListItem{},
		Sent:     []models.FriendshipListItem{},
		Incoming: []models.FriendshipListItem{},
	}
	for _, row := range rows {
		switch {
		case row.Status == "accepted":
			online := time.Since(row.Last_seen) < onlineThreshold
			row.Is_online = &online
			resp.Friends = append(resp.Friends, row)
		case row.SentByMe:
			resp.Sent = append(resp.Sent, row)
		default:
			resp.Incoming = append(resp.Incoming, row)
		}
	}

	c.IndentedJSON(http.StatusOK, resp)
}

func CreateFriendRequest(c *gin.Context) {
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func AcceptFriendRequest(c *gin.Context) {
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}

func DeleteFriendship(c *gin.Context) {
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}
