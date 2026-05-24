_This project has been created as part of the 42 curriculum by bgazur, lsurco-t, hiennguy, jvarila._

# ft_transcendence

A recipe sharing platform, full-stack web dev project

## Description

### The Goal

Our goal for the transcendence project was to learn how to design a proper full stack web application
that uses a RESTful API and consists of multiple docker containers, practice project management,
team work, and improve our Git workflows. At the same time we set out to learn React and Go, as well
as getting familiar with SQL using PostgreSQL as our database.

## Instructions

### Prerequisites

- Docker (developed using 26.1.4)
- Docker Compose (developed using v2.27.1)
- [Cloudinary for image hosting](https://cloudinary.com/)
- JWT secret
- Git

### Steps

1. Download the repository using the Git CLI or GUI

```sh
git clone https://github.com/Kiiskii/ft_transcendence.git && cd ./ft_transcendence
```

2. Set up a `.env` file, and place it in the src folder (`src/.env.example` provided as a starting point)

```sh
cp ./src/.env.example ./src/.env
```

3. run `make` in the root folder of the repository
4. Open [https://localhost:8443] on a web browser (replace port if customized)

## Resources

- [Golang links](docs/go_links.md)
- [nginx links](docs/nginx_links.md)
- [JWT and cookies](docs/jwt_and_cookies.md)

### AI Use

AI was used for code review on GitHub, debugging, planning of features, pointing to resources...

## Team Information

### bgazur

- Assigned roles: developer

### lsurco-t

- Assigned roles: developer

### hiennguy

- Assigned roles: developer

### jvarila

- Assigned roles: developer

## Project Management

Regular team meetings, communication through Discord, documentation in Google Docs, GitHub issues,
GitHub Project for Kanban board

## Technical Stack

- Frontend: React & Vite
- Backend: Golang, gin, pgx
- Database: PostgreSQL
- Reverse proxy: nginx
- Containerization: Docker Compose

## Database Schema

PostgreSQL with UUID primary keys. The schema is initialised on first container startup from numbered SQL migration files in
`src/database/migrations/`.

### Tables

| Table              | Purpose                                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `user`             | User accounts: email, password hash, display name, avatar, `last_seen` timestamp for online status                                |
| `role`             | Role definitions: `admin`, `moderator`, `chef`, `user`                                                                            |
| `permission`       | Permission definitions: `create_recipe`, `edit_recipe`, `delete_recipe`, `manage_users`, `manage_roles`, `moderate_content`       |
| `user_role`        | Many-to-many link between users and roles                                                                                         |
| `role_permission`  | Many-to-many link between roles and permissions                                                                                   |
| `token_blacklist`  | Hashes of revoked JWTs, retained until natural expiry                                                                             |
| `api_keys`         | One hashed API key per user for the public API module                                                                             |
| `recipe`           | Recipe content, nutrition, image URL, and author (set to `NULL` if the author deletes their account)                              |
| `recipe_favourite` | Many-to-many link between users and favourited recipes                                                                            |
| `friendship`       | Directed friend requests with status `pending` or `accepted`, with a unique pair index that blocks duplicates in either direction |

See [src/database/DATABASE.md](src/database/DATABASE.md) for design decisions,
the rationale behind UUIDs, constraint details, and the local dev workflow
(`make`, `make dbclean`, Adminer on port `8081`).

## Features List

- **Recipes:** create, edit, delete, and browse recipes with images hosted on Cloudinary
- **Advanced search:** filter recipes by difficulty, cuisine, and meal type, with sorting and infinite scroll pagination
- **User accounts:** sign up, log in, log out, edit profile, upload avatar, delete account
- **Authentication:** email/password login plus Google OAuth, JWT cookies with a server-side blacklist for revocation
- **Roles and permissions:** `admin`, `moderator`, `chef`, and `user`, with role-based access enforced on both backend routes and frontend views
- **Friends:** send, accept, deny, cancel, and unfriend, with separate dashboard buckets for accepted / sent / incoming
- **Online presence:** heartbeat keeps `last_seen` fresh and exposes `is_online` on accepted friends
- **Public API:** dedicated `/api/public/*` routes for recipes, gated by a per-user API key with hashing and rate limiting
- **Admin panel:** user management UI for assigning roles and reviewing accounts
- **Notification system:** pop-ups appear for events triggered

## Modules - @TODO need checking before submit

The ft_transcendence subject requires a minimum of 14 points.

### Web

- **Minor:** Use a frontend framework (React + Vite)
- **Minor:** Use a backend framework (Gin)
- **Major:** A public API to interact with the database, with a secured API key, rate limiting, documentation, and at least 5 endpoints
- **Minor:** Implement advanced search functionality with filters, sorting, and pagination.
- **Minor:** Custom-made design system with reusable components, including a proper color palette, typography, and icons (minimum: 10 reusable components).
- **Minor:** A complete notification system for all creation, update, and deletion actions.

Count: 6 points.

### User Management

- **Major:** Standard user management and authentication — sign-up, login, profile editing, avatar upload, friend system, and online status
- **Minor:** Implement remote authentication with OAuth 2.0
- **Major:** Advanced permission system — `admin`, `moderator`, `chef`, `user` roles, CRUD, enforced on both backend routes and frontend views

Count: 11 points.

### Accessibility and Internationalization

- **Minor:** Support for multiple languages (at least 3 languages).
- **Minor:** Support for additional browsers.

Count: 13

### Data and Analytics @TODO

- **Minor:** GDPR compliance features.

Count: 14

### Module of choice @TODO

- **Major:** Testing and other things

Count: 1x

## Individual Contributions

### hiennguy

Database design and backend integration.

- **Database design.** Designed and built the PostgreSQL schema from scratch
  (10 tables across user management, RBAC, recipes, engagement, friendship, and
  public API). Chose UUID primary keys via the `uuid-ossp` extension and
  documented the rationale.
- **Database infrastructure.** Set up the `postgres` and `adminer` services in
  Docker Compose, wired the migration auto-init pattern (numbered SQL files in
  `src/database/migrations/`), and added `make dbclean` for fresh resets.
- **Backend ↔ database integration.** Connected the Go backend to PostgreSQL
  via a `pgx` connection pool and established the backend layering
  (`models/` / `repository/` / `handlers/`) that the rest of the backend
  follows.
- **Recipe endpoints.** Implemented `GET /api/recipes` and
  `GET /api/recipes/:id` (with nested author info).
- **User endpoints.** Implemented `GET /api/users`, `GET /api/users/:id`, and
  the full `DELETE /api/users/:id` flow including the last-admin guard and the
  blacklist-before-delete ordering so revocation can never silently fail.
- **Friendship system.** Implemented the full friendship API
  (`GET` / `POST` / `PATCH` / `DELETE /api/friendships`), including the
  pending / accepted state machine and exposing `is_online` on accepted
  friends.
- **Online presence.** Added the `last_seen` column, the heartbeat
  `PUT /api/users/me/heartbeat` endpoint, and the `markOnline()` hook on user
  updates.
- **Seed data.** Built the seed file (25 users with bcrypt-hashed passwords,
  25 recipes with hand-picked Cloudinary images and prose cooking steps, 49
  friendship pairs, randomised timestamps) so every dashboard view has
  meaningful data on a fresh database.
- **Documentation.** Authored `src/database/DATABASE.md`,
  `src/backend/BACKEND.md`, and `src/backend/API.md`.

To be written - CONTINUE
