# Backend Guide

## Stack
- **Go** — main language
- **Gin** — HTTP framework (handles routes, requests, JSON responses)
- **pgx** — PostgreSQL driver (talks to the database)

## Architecture Layers

```
API layer (main.go)      → handles HTTP requests, sends JSON responses
Database layer (db.go)   → handles SQL queries, returns Go structs
PostgreSQL               → stores the actual data
```
In particular:
- **main.go** — **Gin** routes and handlers. Receives a request, calls a db function, returns JSON.
- **db.go** — pgx query functions (`GetAllUsers`, `CreateUser`, etc.). Only talks to the database.
- Each layer only talks to the one below it.

## pgx Query Pattern

### 1. Query multiple rows

Use `DB.Query()` to get multiple rows, then loop through them with `rows.Next()` and `rows.Scan()`.

```go
func GetAllUsers() ([]user, error) {

    //DB.Query() returns a pgx.Rows object point to the result set of db.
    rows, err := DB.Query(context.Background(),
        `SELECT id, email, display_name, created_at FROM "user"`)
    if err != nil {
        return nil, err
    }
    // releases the database connection back to the pool. If you forget to close, you'll leak connections and eventually run out.
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

## HTTP Status Codes

| Code | Constant                          | When to use                              |
|------|-----------------------------------|------------------------------------------|
| 200  | `http.StatusOK`                   | Success (GET, PATCH)                     |
| 201  | `http.StatusCreated`              | Successfully created a resource (POST)   |
| 400  | `http.StatusBadRequest`           | User sent invalid/missing data           |
| 404  | `http.StatusNotFound`             | Resource doesn't exist (wrong ID, etc.)  |
| 500  | `http.StatusInternalServerError`  | Server/DB error (not the user's fault)   |

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
