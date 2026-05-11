# Backend Guide

## Stack
- **Go** — main language
- **Gin** — HTTP framework (handles routes, requests, JSON responses)
- **pgx** — PostgreSQL driver (talks to the database)

## Architecture Layers

```
Routes (main.go)              → defines routes, attaches middleware, calls handlers
Middleware                    → authenticates user, checks permissions/roles
Handlers (handlers/)          → validates input, calls authorization checks, calls repository, returns JSON
Authorization (authorization/) → JWT handling, permissions/roles logic, token blacklist
Repository (repository/)      → handles SQL queries, returns Go structs
PostgreSQL                    → stores the actual data
```
In particular:
- **main.go** — defines **Gin** routes and wires them to middleware and handler functions.
- **middleware/** — `Authentication()` validates JWT and loads user info; `RequireRoles()` and `RequirePermission()` gate routes by role/permission.
- **handlers/** — receives requests, validates input, calls authorization functions for authorship checks, calls repository functions, returns JSON.
- **authorization/** — JWT token generation/validation, token blacklist management, permission/role helpers, and authorship checking functions.
- **config/** — loads environment variables for JWT secret and Cloudinary credentials.
- **repository/** — pgx query functions (`GetAllUsers`, `CreateUser`, etc.). Only talks to the database.
- Each layer only talks to the one below it.

For user updates or recipe modifications, handlers use authorization functions to check whether the caller is editing their own content or holds necessary permissions.

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

## HTTP Status Codes Examples

| Code | Constant                          | When to use                              |
|------|-----------------------------------|------------------------------------------|
| 200  | `http.StatusOK`                   | Success (GET, PUT)                       |
| 201  | `http.StatusCreated`              | Successfully created a resource (POST)   |
| 400  | `http.StatusBadRequest`           | User sent invalid/missing data           |
| 403  | `http.StatusForbidden`            | User lacks required permissions/roles    |
| 404  | `http.StatusNotFound`             | Resource doesn't exist (wrong ID, etc.)  |
| 500  | `http.StatusInternalServerError`  | Server/DB error (not the user's fault)   |

## Middleware

Routes are protected by middleware that runs before handlers. Middleware is stacked; all conditions must pass for the handler to run.

### Authentication

```go
middleware.Authentication()
```

Validates the user by reading the `token` cookie, validating the JWT, checking the token blacklist, and storing user data on the Gin context:

- `userID` — the user's UUID
- `userRoles` — a map of role names the user holds
- `userPerms` — a map of permissions the user has (flattened from all roles)
- `token` — the raw JWT
- `expDate` — token expiration time

**Returns:**
| Status | When |
|---|---|
| 401 `{"error":"unauthorized"}`   | No `token` cookie |
| 401 `{"error":"invalid token"}`  | JWT validation failed or token is blacklisted |
| 500                              | Blacklist lookup errored |

### Role-Based Access Control

```go
middleware.RequireRoles("admin", "moderator")
```

Checks if the user has at least one of the required roles. Must come after `Authentication()`. Returns `403 Forbidden` if the user lacks all specified roles.

**Example:**
```go
router.POST("/api/recipes",
    middleware.Authentication(),
    middleware.RequireRoles("chef", "admin"),
    handlers.CreateRecipe)
```

### Permission-Based Access Control

```go
middleware.RequirePermission("create_recipe", "edit_recipe")
```

Checks if the user has at least one of the required permissions. Must come after `Authentication()`. Admin users automatically pass all permission checks. Returns `403 Forbidden` if the user lacks all specified permissions.

**Example:**
```go
router.POST("/api/recipes",
    middleware.Authentication(),
    middleware.RequirePermission("create_recipe"),
    handlers.CreateRecipe)
```

## Authorization Functions

Helper functions for role and permission checks inside handlers:

- `HasAnyRole(roleSet, ...roles)` — true if user holds at least one role
- `HasPermission(roleSet, permSet, permission)` — true if user has permission (admin always passes)
- `HasAnyPermission(roleSet, permSet, ...permissions)` — true if user has at least one permission
- `CanEditRecipe(roleSet, permSet, userID, authorID)` — true if user is author or has `edit_recipe` permission
- `CanDeleteRecipe(roleSet, permSet, userID, authorID)` — true if user is author or has `delete_recipe` permission

**Authorship Pattern:**
For "edit your own thing" endpoints, handlers check authorship first:

```go
func UpdateRecipe(c *gin.Context) {
    userID := c.GetString("userID")
    roleSet, _ := authorization.RolesFromContext(c)
    permSet, _ := authorization.PermsFromContext(c)
    
    original, err := repository.GetRecipeById(recipeID)
    
    if !authorization.CanEditRecipe(roleSet, permSet, userID, original.Author.Id) {
        c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
        return
    }
    
    // ... update the recipe
}
```

## JWT Tokens

- `GenerateJWTToken(userID)` — creates a signed JWT with 1-hour expiration
- `ValidateJWTToken(token)` — parses and validates the JWT signature and expiration
- `InitJWTSecret(secret)` — loads the JWT secret from the environment (called at startup)
- `TokenCleanupLoop()` — background goroutine that clears expired tokens from the blacklist (called at startup)

Tokens are stored in the `token` cookie (HttpOnly, SameSite=Lax). When a user logs out, their token is added to the blacklist table so it cannot be replayed.

## Configuration

Loads environment variables at startup:

- `JWT_SECRET` — secret key for signing JWT tokens
- `CLOUDINARY_KEY` — Cloudinary API key for image uploads
- `CLOUDINARY_SECRET` — Cloudinary API secret
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name

Missing variables cause the app to exit on startup.

## Connecting Gin handlers to repository functions

- `c.IndentedJSON(status, data)` — serializes the given struct as pretty JSON (indented + endlines) into the response body. First argument is the HTTP status code, second is the data to send.
- `gin.H{"key": "value"}` — shorthand for creating a JSON object (used for error messages, etc.)
