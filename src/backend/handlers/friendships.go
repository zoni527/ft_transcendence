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

//done: GetFriendships:       GET    /api/friendships
//done: CreateFriendRequest:  POST   /api/friendships
//done: AcceptFriendRequest:  PATCH  /api/friendships/:id
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

// POST /api/friendships — the requester is the logged-in user; the receiver
// comes from the JSON body. Self-requests, unknown receivers, and duplicates
// (in either direction) are rejected by the DB and surfaced as 400/404.
func CreateFriendRequest(c *gin.Context) {
	requesterID := c.GetString("userID")
	if !authorization.IsValidUUID(requesterID) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

	var body models.CreateFriendRequestBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	if !authorization.IsValidUUID(body.Receiver_id) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "receiver not found"})
		return
	}
	if body.Receiver_id == requesterID {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "cannot send a request to yourself"})
		return
	}

	if err := repository.CreateFriendRequest(requesterID, body.Receiver_id); err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.CreateFriendRequest: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, gin.H{"status": "pending"})
}

// PATCH /api/friendships/:id — :id is the requester's user ID (the friend
// who sent me the pending request). The receiver is the logged-in user.
func AcceptFriendRequest(c *gin.Context) {
	receiverID := c.GetString("userID")
	if !authorization.IsValidUUID(receiverID) {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

	requesterID := c.Param("id")
	if !authorization.IsValidUUID(requesterID) {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "friend request not found"})
		return
	}
	if requesterID == receiverID {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "cannot accept your own request"})
		return
	}

	if err := repository.AcceptFriendRequest(requesterID, receiverID); err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.AcceptFriendRequest: %v", err)
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"status": "accepted"})
}

func DeleteFriendship(c *gin.Context) {
	c.IndentedJSON(http.StatusNotImplemented, gin.H{"error": "not implemented yet"})
}
