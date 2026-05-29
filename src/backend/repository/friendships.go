package repository

import (
	"context"
	"errors"
	"fmt"
	"log"

	"ft_transcendence/backend/models"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// Gets a list of everyone the user has a "friendship" with, identifying who the other person is,
// and checking if the user was the one who started the request.
func GetFriendshipsForUser(ctx context.Context, userID string) ([]models.FriendshipListItem, error) {
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
	rows, err := Pool.Query(ctx, sql, userID)
	if err != nil {
		return nil, fmt.Errorf("query friendships: %w", err)
	}
	defer rows.Close()

	var items []models.FriendshipListItem
	for rows.Next() {
		var it models.FriendshipListItem
		if err := rows.Scan(&it.Status, &it.SentByMe, &it.LastSeen, &it.ID, &it.DisplayName, &it.Name); err != nil {
			return nil, fmt.Errorf("scan friendship: %w", err)
		}
		items = append(items, it)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate friendships: %w", err)
	}
	return items, nil
}

// Inserts a pending row with the logged-in user as requester. PG errors map to
// typed errors the handler turns into 400/404: the unique pair index catches
// duplicates in either direction, the FK catches a deleted/unknown receiver,
// and the no-self CHECK catches requester == receiver.
func CreateFriendRequest(ctx context.Context, requesterID, receiverID string) error {
	sql := `INSERT INTO friendship (requester_id, receiver_id, status)
			VALUES ($1, $2, 'pending')`
	_, err := Pool.Exec(ctx, sql, requesterID, receiverID)
	if err != nil {
		return friendshipPostgresErrorClassification("repository.CreateFriendRequest", err)
	}
	return nil
}

func friendshipPostgresErrorClassification(functionName string, err error) error {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return fmt.Errorf("%v: %w", functionName, err)
	}
	switch pgErr.Code {
	case pgerrcode.UniqueViolation:
		return &BadRequestError{"friendship already exists"}
	case pgerrcode.ForeignKeyViolation:
		return &NotFoundError{"receiver not found"}
	case pgerrcode.CheckViolation:
		if pgErr.ConstraintName == "friendship_no_self" {
			return &BadRequestError{"cannot send a request to yourself"}
		}
		log.Printf("%v: check violation: %v", functionName, pgErr.ConstraintName)
		return &BadRequestError{"invalid friendship data"}
	case pgerrcode.InvalidTextRepresentation:
		return &NotFoundError{"receiver not found"}
	default:
		return fmt.Errorf("%v: %w", functionName, err)
	}
}

// requesterID is the user who sent the original request
// receiverID is the logged in user who is accepting it
// The WHERE clause pins receiver_id to the caller so a user can only flip
// rows where someone else asked them; status = 'pending' makes the call
// idempotent and prevents re accepting an already-accepted row
func AcceptFriendRequest(ctx context.Context, requesterID, receiverID string) error {
	sql := `UPDATE friendship
			SET status = 'accepted'
			WHERE requester_id = $1
			  AND receiver_id = $2
			  AND status = 'pending'`
	res, err := Pool.Exec(ctx, sql, requesterID, receiverID)
	if err != nil {
		return fmt.Errorf("repository.AcceptFriendRequest: %w", err)
	}
	if res.RowsAffected() == 0 {
		return &NotFoundError{"friend request not found"}
	}
	return nil
}

// Returns the friendship row's status between two users, or NotFoundError if
// no row exists. The pair is symmetric: order of the two ids doesn't matter...
func GetFriendshipStatus(ctx context.Context, userAID, userBID string) (string, error) {
	sql := `SELECT status FROM friendship
			WHERE (requester_id = $1 AND receiver_id = $2)
			   OR (requester_id = $2 AND receiver_id = $1)`
	var status string
	err := Pool.QueryRow(ctx, sql, userAID, userBID).Scan(&status)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", &NotFoundError{"friendship not found"}
		}
		return "", fmt.Errorf("repository.GetFriendshipStatus: %w", err)
	}
	return status, nil
}

// Deletes a pending row between the two users. Either side may call it: the
// requester is cancelling their outgoing request, or the receiver is denying
// an incoming one. The status = pending filter prevents this from
// accidentally unfriending an accepted pair.
func DeleteFriendRequest(ctx context.Context, callerID, otherID string) error {
	sql := `DELETE FROM friendship
			WHERE status = 'pending'
			  AND ((requester_id = $1 AND receiver_id = $2)
			    OR (requester_id = $2 AND receiver_id = $1))`
	res, err := Pool.Exec(ctx, sql, callerID, otherID)
	if err != nil {
		return fmt.Errorf("repository.DeleteFriendRequest: %w", err)
	}
	if res.RowsAffected() == 0 {
		return &NotFoundError{"friend request not found"}
	}
	return nil
}

// Deletes an accepted row between the two users (unfriend). Either side may
// call it. The status = 'accepted' filter prevents this from accidentally
// removing a pending request, those are deleted via DeleteFriendRequest.
func DeleteFriendship(ctx context.Context, callerID, otherID string) error {
	sql := `DELETE FROM friendship
			WHERE status = 'accepted'
			  AND ((requester_id = $1 AND receiver_id = $2)
			    OR (requester_id = $2 AND receiver_id = $1))`
	res, err := Pool.Exec(ctx, sql, callerID, otherID)
	if err != nil {
		return fmt.Errorf("repository.DeleteFriendship: %w", err)
	}
	if res.RowsAffected() == 0 {
		return &NotFoundError{"friendship not found"}
	}
	return nil
}
