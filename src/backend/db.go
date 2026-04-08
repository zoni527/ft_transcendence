package main

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

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
