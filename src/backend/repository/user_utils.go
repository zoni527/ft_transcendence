package repository

import (
	"context"
	"fmt"
)
func IsLastAdmin(targetID string) (bool, error) {
    ctx := context.Background()
    var count int

    countAdmin := `
        SELECT COUNT(ur.user_id)
        FROM user_role ur
        JOIN role r ON ur.role_id = r.id
        WHERE r.name = 'admin'`

    err := Pool.QueryRow(ctx, countAdmin).Scan(&count)
    if err != nil {
        return false, fmt.Errorf("error counting admins: %w", err)
    }

    // 2. If count is 1 or less, check if the targetID is that specific admin
    if count <= 1 {
        var isTargetAdmin bool
        checkSql := `
            SELECT EXISTS (
                SELECT 1 FROM user_role ur
                JOIN role r ON ur.role_id = r.id
                WHERE ur.user_id = $1 AND r.name = 'admin'
            )`

        err = Pool.QueryRow(ctx, checkSql, targetID).Scan(&isTargetAdmin)
        if err != nil {
            return false, fmt.Errorf("error checking if target is admin: %w", err)
        }
        return isTargetAdmin, nil
    }

    // If count > 1, even if the target is an admin, they aren't the LAST one.
    return false, nil
}