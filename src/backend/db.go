package main

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//THIS IS THE DATABASE LAYER CODE. main.go us
// DB is the connection pool shared across the application.
// A pool manages multiple connections so the backend can handle
// concurrent requests without opening a new connection each time.
// Docs: https://pkg.go.dev/github.com/jackc/pgx/v5/pgxpool#Pool
var DB *pgxpool.Pool

// ConnectDB opens a connection pool to PostgreSQL using the DATABASE_URL
// environment variable. Call this once at startup in main().
func ConnectDB() error {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return fmt.Errorf("DATABASE_URL environment variable is not set")
	}

	// Create the connection pool
	var err error
	DB, err = pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}

	// Verify the connection actually works
	err = DB.Ping(context.Background())
	if err != nil {
		return fmt.Errorf("unable to ping database: %w", err)
	}

	fmt.Println("Connected to PostgreSQL")
	return nil
}

// CloseDB closes the connection pool. Call this when the app shuts down.
func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}

//http://betterstack.com/community/guides/scaling-go/postgresql-pgx-golang/
func GetAllUsers() ([]user, error) {
	sql := `SELECT id, email, name, display_name, created_at
			FROM "user" `

	//DB.Query() returns a pgx.Rows object point to the result set of db.
	rows, err := DB.Query(context.Background(), sql)
	if err != nil {
		return nil, fmt.Errorf("error querying users: %w", err)
    }

	// releases the database connection back to the pool. If you forget to close, you'll leak connections and eventually run out.
	defer rows.Close()
	
	var users []user
	//step through rows one by one with
	for rows.Next() {
		var u user
		err := rows.Scan(
			&u.Id,
			&u.Email,
			&u.Name,
			&u.Display_name,
			&u.Created_at,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning user row: %w", err)
		}
		users = append(users, u)
	}

	//declaring err, then check if it's nil
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating user rows: %w", err)
	}
	return users, nil
}

//placeholder — $1 tells pgx "use the first parameter I pass in"
func GetUserById(id string) (user, error) {
	sql := `SELECT id, email, name, display_name, created_at
			FROM "user"
			WHERE id = $1`

	var u user
	err := DB.QueryRow(context.Background(), sql, id).Scan(&u.Id, &u.Email, &u.Name, &u.Display_name, &u.Created_at)

	// built-in error that pgx defines
	if err == pgx.ErrNoRows {
		return user{}, pgx.ErrNoRows
	}
	
	if err != nil {
		return user{}, fmt.Errorf("error getting user by id: %w", err)
	}
	return u, nil
}