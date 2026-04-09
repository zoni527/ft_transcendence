package repository

// This file only handles connecting and disconnecting.
// Query functions go in their own files (users.go, recipes.go, etc.)

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool is the connection pool. Capitalized = exported, so main.go could
// access it, but it shouldn't — all queries go through functions in this package.
var Pool *pgxpool.Pool

func ConnectPool() error {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return fmt.Errorf("DATABASE_URL environment variable is not set")
	}

	var err error
	Pool, err = pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}

	err = Pool.Ping(context.Background())
	if err != nil {
		return fmt.Errorf("unable to ping database: %w", err)
	}

	fmt.Println("Connected to PostgreSQL")
	return nil
}

func ClosePool() {
	if Pool != nil {
		Pool.Close()
	}
}
