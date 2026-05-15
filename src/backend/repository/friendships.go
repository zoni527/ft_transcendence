package repository

import (
	"context"
	"fmt"
	"ft_transcendence/backend/models"
)

// Friendship DB functions needed:
//done: GetFriendshipsForUser: List all rows the logged-in user is in, bucketed by status
//TODO: CreateFriendRequest:   Insert a new pending row, requester = me
//done: AcceptFriendRequest:   Flip status from pending to accepted (only the receiver can do this)
//TODO: DeleteFriendship:      Remove the row (covers cancel, reject, unfriend)

// getting a list of everyone I have a "friendship" with, identifying who the other person is, and checking if I was the one who started the request.
func GetFriendshipsForUser(userID string) ([]models.FriendshipListItem, error) {
	sql := `SELECT f.status, (f.requester_id = $1) AS sent_by_me, u.last_seen,
			u.id, u.display_name, COALESCE(u.name, '') AS name
			FROM friendship f
			JOIN "user" u
				ON u.id = CASE
				WHEN f.requester_id = $1 THEN f.receiver_id
							ELSE f.requester_id
						  END
			WHERE f.requester_id = $1 OR f.receiver_id = $1
			ORDER BY u.display_name ASC
			`
	rows, err := Pool.Query(context.Background(), sql, userID)
	if err != nil {
		return nil, fmt.Errorf("query friendships: %w", err)
	}
	defer rows.Close()

	var items []models.FriendshipListItem
	for rows.Next() {
		var it models.FriendshipListItem
		if err := rows.Scan(&it.Status, &it.SentByMe, &it.Last_seen, &it.Id, &it.Display_name, &it.Name); err != nil {
			return nil, fmt.Errorf("scan friendship: %w", err)
		}
		items = append(items, it)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate friendships: %w", err)
	}
	return items, nil
}

func CreateFriendRequest(requesterID, receiverID string) error {
	return nil
}

// requesterID is the user who sent the original request,
// receiverID is the logged-in user who is accepting it.
// The WHERE clause pins receiver_id to the caller so a user can only flip
// rows where someone else asked them; status = 'pending' makes the call
// idempotent and prevents re-accepting an already-accepted row.
func AcceptFriendRequest(requesterID, receiverID string) error {
	sql := `UPDATE friendship
			SET status = 'accepted'
			WHERE requester_id = $1
			  AND receiver_id = $2
			  AND status = 'pending'`
	res, err := Pool.Exec(context.Background(), sql, requesterID, receiverID)
	if err != nil {
		return fmt.Errorf("repository.AcceptFriendRequest: %w", err)
	}
	if res.RowsAffected() == 0 {
		return &NotFoundError{"friend request not found"}
	}
	return nil
}

// userAID and userBID are interchangeable: the SQL deletes the row
// regardless of which side each user is on.
func DeleteFriendship(userAID, userBID string) error {
	return nil
}
