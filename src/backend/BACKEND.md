# Backend Guide

## Stack
- **Go** — main language
- **Gin** — HTTP framework (handles routes, requests, JSON responses)
- **pgx** — PostgreSQL driver (talks to the database)

## Architecture Layers

```
Routes (main.go)              → defines routes, calls handlers
Handlers (handlers/)          → validates input, sends JSON responses
Repository (repository/)      → handles SQL queries, returns Go structs
PostgreSQL                    → stores the actual data
```
In particular:
- **main.go** — defines **Gin** routes and wires them to handler functions.
- **handlers/** — receives requests, validates input, calls repository functions, returns JSON.
- **repository/** — pgx query functions (`GetAllUsers`, `CreateUser`, etc.). Only talks to the database.
- Each layer only talks to the one below it.

For user updates, the handler decides whether the caller is editing their own profile or acting as an admin, then allows only the fields that fit that role.

## Connection Pool (pgxpool)

The pool is like a **circle** with multiple **straws** sticking into it — each straw is a connection to PostgreSQL, and the items rolling through those straws are queries (requests).

```
                    ┌──────────────┐
    handler A ───→  │              │ ───→  PostgreSQL
    handler B ───→  │   Pool (DB)  │ ───→  PostgreSQL
    handler C ───→  │              │ ───→  PostgreSQL
                    └──────────────┘
                     3 connections
                     reused by all
```

- **Connection** — a persistent link between the app and PostgreSQL (a straw)
- **Query** — a single `Pool.Query()` or `Pool.QueryRow()` call sent through a connection (an item in the straw)
- **Pool** — manages the connections. Reuses them, replaces broken ones, and queues requests if all are busy

One connection handles many queries over its lifetime, one at a time. The pool keeps several open so multiple requests can run in parallel.

**How it works:**
1. App starts → `ConnectPool()` opens the pool (stored in `repository.Pool`)
2. A handler calls a repository function → pool picks an idle connection
3. Query runs on PostgreSQL → result comes back
4. Connection returns to the pool, ready for the next query

You never open or close connections yourself — the pool handles it all.

## How a query works (flow)

1. Go code sends SQL to **PostgreSQL** via pgx
2. PostgreSQL searches the table (uses index for PRIMARY KEY lookups — very fast, like a map)
3. PostgreSQL sends back the matching row(s)
4. `Scan()` reads the result into your Go struct

The database does the searching — Go just asks and receives. No for-loop needed for single-row lookups.

## pgx Query Pattern

### 1. Query multiple rows

Use `Pool.Query()` to get multiple rows, then loop through them with `rows.Next()` and `rows.Scan()`.

```go
func GetAllUsers() ([]user, error) {

    //Pool.Query() returns a pgx.Rows object point to the result set of db.
    rows, err := Pool.Query(context.Background(),
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

Use `Pool.QueryRow()` when you expect one result (e.g. find by ID).

```go
func GetUserByID(id string) (user, error) {
    var u user
    err := Pool.QueryRow(context.Background(),
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

Use `Pool.Exec()` for INSERT/UPDATE/DELETE, or `QueryRow()` if you want the inserted row back.

```go
func CreateUser(u user) (user, error) {
    err := Pool.QueryRow(context.Background(),
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
| 200  | `http.StatusOK`                   | Success (GET, PUT)                       |
| 201  | `http.StatusCreated`              | Successfully created a resource (POST)   |
| 400  | `http.StatusBadRequest`           | User sent invalid/missing data           |
| 404  | `http.StatusNotFound`             | Resource doesn't exist (wrong ID, etc.)  |
| 500  | `http.StatusInternalServerError`  | Server/DB error (not the user's fault)   |


## Connecting Gin handlers to repository functions

- `c.IndentedJSON(status, data)` — serializes the given struct as pretty JSON (indented + endlines) into the response body. First argument is the HTTP status code, second is the data to send.
- `gin.H{"key": "value"}` — shorthand for creating a JSON object (used for error messages, etc.)
