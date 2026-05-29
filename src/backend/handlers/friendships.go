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

func GetFriendships(c *gin.Context) {
	userID := c.GetString("userID")
	if !authorization.IsValidUUID(userID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

	rows, err := repository.GetFriendshipsForUser(c.Request.Context(), userID)
	if err != nil {
		log.Printf("GetFriendships error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
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
			online := time.Since(row.LastSeen) < onlineThreshold
			row.IsOnline = &online
			resp.Friends = append(resp.Friends, row)
		case row.SentByMe:
			resp.Sent = append(resp.Sent, row)
		default:
			resp.Incoming = append(resp.Incoming, row)
		}
	}

	c.JSON(http.StatusOK, resp)
}

// POST /api/friendships
func CreateFriendRequest(c *gin.Context) {
	requesterID := c.GetString("userID")
	if !authorization.IsValidUUID(requesterID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

	var body models.CreateFriendRequestBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	if !authorization.IsValidUUID(body.ReceiverID) {
		c.JSON(http.StatusNotFound, gin.H{"error": "receiver not found"})
		return
	}
	if body.ReceiverID == requesterID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot send a request to yourself"})
		return
	}

	if err := repository.CreateFriendRequest(c.Request.Context(), requesterID, body.ReceiverID); err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.CreateFriendRequest: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "pending"})
}

// PATCH /api/friendships/:id — :id is the requester's user ID (the friend
// who sent me the pending request)
func AcceptFriendRequest(c *gin.Context) {
	receiverID := c.GetString("userID")
	if !authorization.IsValidUUID(receiverID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

	requesterID := c.Param("id")
	if !authorization.IsValidUUID(requesterID) {
		c.JSON(http.StatusNotFound, gin.H{"error": "friend request not found"})
		return
	}
	if requesterID == receiverID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot accept your own request"})
		return
	}

	if err := repository.AcceptFriendRequest(c.Request.Context(), requesterID, receiverID); err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.AcceptFriendRequest: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "accepted"})
}

// DELETE /api/friendships/:id?action=cancel|reject|unfriend (:id is the other
// user). One endpoint covers three product actions: cancel an outgoing
// request, deny an incoming request, and unfriend.
func DeleteFriendship(c *gin.Context) {
	callerID := c.GetString("userID")
	if !authorization.IsValidUUID(callerID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

	otherID := c.Param("id")
	if !authorization.IsValidUUID(otherID) {
		c.JSON(http.StatusNotFound, gin.H{"error": "friendship not found"})
		return
	}
	if otherID == callerID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot delete a friendship with yourself"})
		return
	}

	status, err := repository.GetFriendshipStatus(c.Request.Context(), callerID, otherID)
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.DeleteFriendship: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	action := c.Query("action")
	if (action == "reject" || action == "cancel") && status == "pending" {
		err = repository.DeleteFriendRequest(c.Request.Context(), callerID, otherID)
	} else if action == "unfriend" && status == "accepted" {
		err = repository.DeleteFriendship(c.Request.Context(), callerID, otherID)
	} else {
		log.Printf("handlers.DeleteFriendship: unexpected status and action %q, %q", status, action)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	if err != nil {
		if identifyAndRespondToUserError(c, err) {
			return
		}
		log.Printf("handlers.DeleteFriendship: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}
