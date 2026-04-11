# Database Documentation

## Overview

ft_transcendence uses **PostgreSQL 17** as its relational database, running as a Docker container alongside the backend and frontend services. **Adminer** is included as a web-based database management tool for easy viewing and editing of data during development.

## How It Works

### Docker Setup

The database is defined in `src/compose.yaml` with two services:

- **postgres** — the PostgreSQL database server (container port `5432`, host port `5433`)
- **adminer** — a web UI for browsing the database (host port `8081`)

### Environment Variables

Database credentials are stored in `src/.env` (not committed to git!). Copy from the template:

```bash
cp src/.env.example src/.env
```

Variables:
| Variable | Description |
|---|---|
| `POSTGRES_USER` | Database username |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |

### Schema Initialization

When the postgres container starts **for the first time**, it automatically runs all `.sql` files found in `src/database/migrations/` (mounted to `/docker-entrypoint-initdb.d/` inside the container) in **alphabetical order**.

**How does PostgreSQL know to run these files?** 
It's not a PostgreSQL feature — it's built into the official PostgreSQL Docker image (`postgres:17-alpine`). The image creators programmed it to check the `docker-entrypoint-initdb.d` folder on first startup and execute any `.sql` files it finds. In `compose.yaml`, this line maps our local folder into that special folder:

```yaml
volumes:
  - ./database/migrations:/docker-entrypoint-initdb.d
```

This is why migration files are numbered:

```
001_schema.sql              ← runs first (creates tables)
002_seed.sql                ← runs second (inserts test data)
```

All files modify the **same database** — they don't create separate databases.

> **Note:** Init scripts only run on a fresh database. If you change a migration file and want to re-initialize, reset the database volume from the project root:
>
> ```bash
> make dbclean
> ```

### UUID Primary Keys

#### Why do we use UUID?

INTs are simple and small but predictable — a user could guess other users' IDs by just trying /api/users/2, /api/users/3. We don't want someone iterating through those numbers to scrape all user data.
It can cause problems if we ever merge data from multiple sources (ID conflicts).
Example:

- Server A creates a recipe with id = 1
- Server B also creates a recipe with id = 1
  If we ever need to combine them into one database, both have id = 1 —-> conflict.

UUIDs are random and unguessable --> better for a web app with a public API and prevent conflicts when multiple services create records.

PostgreSQL doesn't generate UUIDs by default. The schema enables the `uuid-ossp` extension, which provides the `uuid_generate_v4()` function used as the default value for all primary key columns.

## Schema

### Tables

**User Management:**
| Table | Purpose |
|---|---|
| `user` | User accounts (email, password hash, name, display name) |
| `role` | Role definitions (admin, moderator, chef, user) |
| `permission` | Permission definitions (create_recipe, ban_user, etc.) |
| `user_role` | Links users to roles (many-to-many) |
| `role_permission` | Links roles to permissions (many-to-many) |

**Recipes:**
| Table | Purpose |
|---|---|
| `recipe` | Recipe details (title, description, nutrition, etc.) |
| `recipe_step` | Ordered cooking steps for each recipe |
| `ingredient_category` | Categories for ingredients (e.g. poultry, dairy) |
| `ingredient` | Ingredient definitions with default units |
| `recipe_ingredient` | Links recipes to ingredients with quantities (many-to-many) |

**Engagement:**
| Table | Purpose |
|---|---|
| `recipe_favourite` | Tracks which users favourited which recipes |

### Key Design Decisions

- **Favourite count is computed, not stored** — instead of a `has_been_favourite_times` column on recipe, we count from `recipe_favourite` with `COUNT(*)`. This prevents the count from going out of sync.
- **Serving-based ingredient scaling** — `recipe.servings` stores the base serving count. `recipe_ingredient.quantity` stores the amount for that base. Scaling (e.g. 4 servings → 2 servings) is done in app logic: `adjusted = quantity * (desired / base)`.
- **CHECK constraints** — `difficulty` (easy/medium/hard) and `meal_type` (breakfast/lunch/dinner/snack) are validated at the database level.
- **ON DELETE CASCADE** — deleting a user removes their favourites and roles. Deleting a recipe removes its steps, ingredients, and favourites.
- **ON DELETE SET NULL** — deleting a user sets `recipe.author_id` to NULL (keeps the recipe, removes authorship).
  - **TODO:** Decide whether to keep this behavior when a user is deleted.

## Accessing the Database

### Login Via Adminer (Web UI)

1. Run `make` to start all containers
2. Open `http://localhost:8081`
3. Login with:
   - System: **PostgreSQL**
   - Server: **postgres**
   - Username: value from `.env`
   - Password: value from `.env`
   - Database: value from `.env`

### Via command line

```bash
docker exec -it postgres psql -U dbuser -d ft_transcendence
```

## Port Configuration

The postgres container runs on port **5433** on the host machine (mapped from 5432 inside the container). This avoids conflicts if we have PostgreSQL installed locally on machine.

| Service  | Internal Port | Host Port |
| -------- | ------------- | --------- |
| postgres | 5432          | 5433      |
| adminer  | 8080          | 8081      |
| backend  | 8080          | 8080      |
| frontend | 5173          | 5173      |

## Changing .env Credentials

If you change `.env` values after the database has been created, you need to delete the volume and restart — the credentials are set on first initialization only. Just like this:

```bash
make clean
make dbclean
make
```

## Adding New Tables (Future Migrations)

1. Create a new file: `src/database/002_descriptive_name.sql`
2. Write your `CREATE TABLE` or `ALTER TABLE` statements
3. Delete the volume and restart to re-initialize: `make dbclean`
4. Or run the SQL manually via Adminer or psql

## Backend ↔ Database Connection

The backend connects to PostgreSQL using the `pgx` driver (via a connection pool).

**How it works:**

- `db.go` — contains `ConnectDB()` and `CloseDB()` functions
- `ConnectDB()` reads the `DATABASE_URL` environment variable and opens a connection pool
- A **connection pool** manages multiple connections so the backend can handle concurrent requests without opening a new connection each time
- `main.go` calls `ConnectDB()` on startup and `CloseDB()` on shutdown via `defer`

**`DATABASE_URL` format:**

```
postgres://username:password@host:port/database_name
```

Inside Docker, the host is `postgres` (the container name), not `localhost`.

**Verifying the connection:**

```bash
docker logs backend
```

You should see "Connected to PostgreSQL" in the output.

## What's Next

- [x] Add `pgx` PostgreSQL driver to Go backend
- [x] Write DB connection code in Gin (startup)
- [ ] Refactor existing hardcoded endpoints to query real database

![alt text](pic.png)
