package repository

import (
	"context"
	"fmt"
)

// IsLastAdmin returns true if the given user holds the admin role and is the only admin currently in the system.
func IsLastAdmin(userId string) (bool, error) {
	sql := `SELECT
		EXISTS(SELECT 1 FROM user_role ur
		       JOIN role r ON ur.role_id = r.id
		       WHERE ur.user_id = $1 AND r.name = 'admin')
		AND
		(SELECT COUNT(*) FROM user_role ur
		 JOIN role r ON ur.role_id = r.id
		 WHERE r.name = 'admin') = 1`
         
	var isLast bool
	if err := Pool.QueryRow(context.Background(), sql, userId).Scan(&isLast); err != nil {
		return false, fmt.Errorf("IsLastAdmin: %w", err)
	}
	return isLast, nil
}
