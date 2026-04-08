# Backend Guide

## Stack
- **Go** — main language
- **Gin** — HTTP framework (handles routes, requests, JSON responses)
- **pgx** — PostgreSQL driver (talks to the database)

## pgx Query Pattern

### 1. Query multiple rows

Use `DB.Query()` to get multiple rows, then loop through them with `rows.Next()` and `rows.Scan()`.

```go
func GetAllUsers() ([]user, error) {
    rows, err := DB.Query(context.Background(),
        `SELECT id, email, display_name, created_at FROM "user"`)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var users []user
    for rows.Next() {
        var u user
        err := rows.Scan(&u.Id, &u.Email, &u.Display_name, &u.Created_at)
        if err != nil {
            return nil, err
        }
        users = append(users, u)
    }
    return users, nil
}
```

**Key points:**
- `defer rows.Close()` — always close rows when done
- `rows.Scan()` fields must match the SELECT column order exactly
- Wrap `"user"` in quotes because `user` is a reserved word in PostgreSQL

### 2. Query a single row

Use `DB.QueryRow()` when you expect one result (e.g. find by ID).

```go
func GetUserByID(id string) (user, error) {
    var u user
    err := DB.QueryRow(context.Background(),
        `SELECT id, email, display_name, created_at FROM "user" WHERE id = $1`, id,
    ).Scan(&u.Id, &u.Email, &u.Display_name, &u.Created_at)
    if err != nil {
        return u, err
    }
    return u, nil
}
```

**Key points:**
- `$1`, `$2`, etc. are placeholders for parameters — never use string formatting (`fmt.Sprintf`) to build queries (SQL injection risk)
- Returns `pgx.ErrNoRows` if nothing is found

### 3. Insert a row

Use `DB.Exec()` for INSERT/UPDATE/DELETE, or `QueryRow()` if you want the inserted row back.

```go
func CreateUser(u user) (user, error) {
    err := DB.QueryRow(context.Background(),
        `INSERT INTO "user" (email, password_hash, display_name)
         VALUES ($1, $2, $3)
         RETURNING id, created_at`,
        u.Email, u.Password_hash, u.Display_name,
    ).Scan(&u.Id, &u.Created_at)
    if err != nil {
        return u, err
    }
    return u, nil
}
```

**Key points:**
- `RETURNING` lets PostgreSQL send back auto-generated fields (id, created_at)
- Don't insert `id` or `created_at` — the DB generates those

## Connecting Gin handlers to DB functions

Once you have a DB function, replace the hardcoded handler:

```go
// Before (hardcoded)
func getUsers(c *gin.Context) {
    c.IndentedJSON(http.StatusOK, users)
}

// After (real DB)
func getUsers(c *gin.Context) {
    users, err := GetAllUsers()
    if err != nil {
        c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.IndentedJSON(http.StatusOK, users)
}
```
