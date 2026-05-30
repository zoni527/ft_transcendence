_This project has been created as part of the 42 curriculum by bgazur, lsurco-t, hiennguy, jvarila._

# ft_transcendence

**Rise**: a recipe sharing platform, built as our full-stack web dev project at 42.

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
git clone https://github.com/zoni527/ft_transcendence.git && cd ./ft_transcendence
```

2. Set up a `.env` file, and place it in the src folder (`src/.env.example` provided as a starting point)

```sh
cp ./src/.env.example ./src/.env
```

3. run `make` in the root folder of the repository
4. Open [https://localhost:8443] on a web browser (replace port if customized)

## Usage

Once the containers are running and you have visited the site, the main flows
are:

### Account

- **Sign up** with an email and a password, or click **Continue with Google**
  to sign in with OAuth.
- From the navbar, open your **profile** to edit your display name, change
  your password, upload a new avatar, or delete the account. Deleting an
  account keeps your published recipes but detaches them from your name.

### Recipes

- Open **Recipes** in the navbar to browse the full list.
- Use the **search bar** to filter by title, the **filter sidebar** to narrow
  by difficulty, cuisine, and meal type, and the **sort controls** to reorder.
  The list pages itself with **infinite scroll**.
- Click any card to open the **recipe detail** view.
- Click **Create recipe** to add your own. The form takes a title, description,
  image (JPG/PNG, validated client-side and uploaded directly to Cloudinary),
  prep and cook times, servings, nutrition, ingredients, and steps.
- On a recipe you own, **Edit** and **Delete** buttons appear in the detail
  view.

### Friends

- Open **Friends** in the navbar.
- Click **Add friend** and search for other users by username.
- Pending requests show up under the **Sent** and **Incoming** subtabs.
  Accept, deny, cancel, or unfriend from each row.
- Accepted friends display an online/offline indicator, kept fresh by the
  heartbeat.

### Language

- Use the **language switcher** in the navbar to change between **English**,
  **Finnish**, and **Czech**.

### Admin panel (admin role)

- Open **Admin** in the navbar to manage users (assign roles, edit, delete)
  and to review recipes.

### Public API (developer role)

- A user with the **developer** role can open the **API key** modal from the
  navbar.
- Click **Generate** to create a new key. The key is shown once and is then
  stored only as a hash, so it cannot be retrieved later. Generation is rate
  limited to one new key per user per hour.
- Send the key as the `X-API-Key` header on any `/api/public/*` route. See
  [src/backend/PUBLIC_API.md](src/backend/PUBLIC_API.md) for the full
  endpoint list.

### Demo data

The database seed creates 25 demo users and 25 recipes so every page has
content on a fresh database. All seeded users share the same bcrypt-hashed
test password. See
[src/database/migrations/002_seed.sql](src/database/migrations/002_seed.sql)
for the seeded usernames and the test password.

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

- Assigned roles: Tech Lead, Developer

## Project Management

Regular team meetings, communication through Discord, documentation in Google Docs, GitHub issues,
GitHub Project for Kanban board

## Technical Stack

- Frontend: React & Vite
- Backend: Golang, gin, pgx
- Database: PostgreSQL
- Reverse proxy: nginx
- Containerization: Docker Compose

## Why these choices

### Tech stack

- **React + Vite (frontend).** React gave us a component model the whole team
  could share, and Vite's hot reload and ES module dev server were much faster
  to iterate against than Webpack or CRA.

  _Trade-off:_ a single-page app means client-side routing only, no SSR, and no
  meaningful SEO. We accepted this because the app is gated behind login for
  most actions anyway.
- **Go + Gin (backend).** Go for the learning goal (the subject encourages new
  languages) and for the single static binary in the container. Gin stays close
  to `net/http` without pulling in a heavy framework or dependency injection we
  did not need.
  
  _Trade-off:_ Gin is deliberately minimal, so we wrote our own middleware,
  validation, and authorization plumbing instead of getting it for free from a
  batteries-included framework like Django or Rails.
- **PostgreSQL with `pgx` and no ORM.** Postgres for first-class UUIDs,
  constraints, and indexes. We picked the `pgx` driver directly rather than an
  ORM because one of our explicit goals was to actually learn SQL; an ORM would
  have hidden exactly the joins, constraints, and migrations we wanted to
  practice.
  
  _Trade-off:_ every repository function maps rows to structs by hand, which is
  more boilerplate per endpoint and one more place a bug can land. We also do
  not get automatic migrations: schema changes are numbered SQL files we have
  to write and apply ourselves.
- **nginx reverse proxy.** Centralises HTTPS termination and serves frontend and
  backend behind a single origin, which removes a whole class of CORS issues and
  satisfies the subject's HTTPS-everywhere requirement.
  
  _Trade-off:_ one more container to keep alive, plus the certificate-generation
  script and templated config that comes with it. Debugging a failing request
  now means checking nginx as well as the backend.
- **Docker Compose.** The subject requires the project to start with one
  command, so Compose orchestrates frontend, backend, Postgres, Adminer, the
  reverse proxy, and the certificate generator together.
  
  _Trade-off:_ Compose is a dev/single-host tool, not real production
  orchestration: no autoscaling, no rolling deploys, no health-driven
  rescheduling. Fine for a school project, not something we would ship as-is.
- **Cloudinary for images.** Image upload, resizing, and CDN delivery were not
  the part of the project we wanted to build from scratch, and Cloudinary's
  signed-upload flow lets the browser upload directly without proxying bytes
  through our backend.
  
  _Trade-off:_ we depend on an external service with its own free-tier limits
  and vendor lock-in on the image URLs. If Cloudinary is down or the account is
  exhausted, image uploads stop working.

### Design decisions

- **UUID primary keys.** IDs are exposed in URLs and in the public API, so
  sequential integers would have leaked record counts and made enumeration
  trivial. UUIDs via the `uuid-ossp` extension fix both.
  _Trade-off:_ UUIDs are 16 bytes instead of 4 or 8, indexes are bigger, and the
  values are not human-friendly when reading logs or the Adminer UI.
- **Layered backend (`handlers` / `repository` / `models`).** Handlers only
  validate input and serialise JSON, the repository owns all SQL, and models
  are the shared structs. This separation is what made it possible to swap the
  repository for a mock in the backend tests.
  _Trade-off:_ even a one-line query requires a handler function, a repository
  function, and a model. There is more indirection per endpoint than a flatter
  design would have.
- **JWT in HttpOnly cookies + token blacklist.** Cookies keep the token out of
  reach of any XSS, and the server-side blacklist gives us real
  logout/revocation instead of waiting for tokens to expire naturally.
  _Trade-off:_ the blacklist requires a database lookup on every authenticated
  request, which gives up most of the "stateless JWT" performance argument. We
  also have to handle CSRF because we authenticate with cookies.
- **Friendship as directed rows with a unique pair index.** One `friendship`
  table with `pending` / `accepted` status was simpler than splitting requests
  and friendships into two tables, and the unique pair index makes "a request
  already exists in the other direction" impossible at the database level
  rather than something the application has to check.
  _Trade-off:_ every read that asks "is X friends with Y" has to check both
  `(X, Y)` and `(Y, X)`, which makes the queries a bit uglier than a
  symmetric design would.
- **Recipe author set to `NULL` on user delete.** When a user deletes their
  account we keep the recipes (they have value to other users) but detach
  authorship, which is both the GDPR-friendly choice and what makes account
  deletion safe to allow at all.
  _Trade-off:_ orphaned recipes lose attribution and a moderation contact
  point, and any per-user statistics (e.g. recipes-per-chef) become inaccurate
  once the account is gone.
- **Per-user API keys, hashed, behind a `developer` role.** Storing the hash
  (not the key) means a database leak does not compromise live keys, and gating
  the public API behind an opt-in role keeps regular users from accidentally
  generating credentials they would not use.
  _Trade-off:_ because we only store the hash, a lost key cannot be recovered,
  only regenerated. The rate limit is also per user rather than per integration,
  so a developer running two clients shares one bucket.

## Database Schema

PostgreSQL with UUID primary keys. The schema is initialised on first container startup from numbered SQL migration files in
`src/database/migrations/`.

### Tables

| Table              | Purpose                                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `user`             | User accounts: email, password hash, display name, avatar, `last_seen` timestamp for online status                                |
| `role`             | Role definitions: `admin`, `moderator`, `chef`, `developer`, `user`                                                               |
| `permission`       | Permission definitions: `create_recipe`, `edit_recipe`, `delete_recipe`, `manage_users`, `manage_roles`, `moderate_content`       |
| `user_role`        | Many-to-many link between users and roles                                                                                         |
| `role_permission`  | Many-to-many link between roles and permissions                                                                                   |
| `token_blacklist`  | Hashes of revoked JWTs, retained until natural expiry                                                                             |
| `api_keys`         | One hashed API key per user for the public API module                                                                             |
| `recipe`           | Recipe content, nutrition, image URL, and author (set to `NULL` if the author deletes their account)                              |
| `friendship`       | Directed friend requests with status `pending` or `accepted`, with a unique pair index that blocks duplicates in either direction |

See [src/database/DATABASE.md](src/database/DATABASE.md) for design decisions,
the rationale behind UUIDs, constraint details, and the local dev workflow
(`make`, `make dbclean`, Adminer on port `8081`).

## Features List

- **Recipes** (Lily: reads, Johnny: writes, Boris: UI): create, edit, delete, and browse recipes with images hosted on Cloudinary
- **Advanced search** (Lucio: backend, Boris: UI): filter recipes by difficulty, cuisine, and meal type, with sorting and infinite scroll pagination
- **User accounts** (Lily, Lucio: backend, Boris: UI): sign up, log in, log out, edit profile, upload avatar, delete account
- **Authentication** (Lucio: JWT and sessions, Johnny: Google OAuth, Boris: UI): email/password login plus Google OAuth, JWT cookies with a server-side blacklist for revocation
- **Roles and permissions** (Lily: schema, Lucio: backend enforcement, Boris: UI gating): `admin`, `moderator`, `chef`, and `user`, with role-based access enforced on both backend routes and frontend views
- **Friends** (Lily: backend, Boris: UI): send, accept, deny, cancel, and unfriend, with separate dashboard buckets for accepted / sent / incoming
- **Online presence** (Lily: backend, Boris: UI): heartbeat keeps `last_seen` fresh and exposes `is_online` on accepted friends
- **Public API** (Lucio: backend, Boris: UI): dedicated `/api/v1/*` routes for recipes, gated by a per-user API key with hashing and rate limiting (required role: `developer`)
- **Admin panel** (Lucio: backend, Boris: UI): user management UI for assigning roles and reviewing accounts
- **Notification system** (Boris): pop-ups appear for events triggered
- **Privacy Policy and Terms of Service** (Boris): dedicated pages linked from the footer, with content tailored to the app

## Modules

The ft_transcendence subject requires a minimum of 14 points (Major = 2pts,
Minor = 1pt). We claim **14 points** across three categories. For each
module we record the justification, how it was implemented, and who worked
on it.

### Web (7 points)

- **Minor, 1pt: Frontend framework (React + Vite).**
  - _Justification:_ React is on the subject's accepted frontend framework
    list; Vite provides the dev server and bundler.
  - _Implementation:_ React 19 app under [src/frontend/](src/frontend/) with
    file-based routing and a custom component design system.
  - _Worked on by:_ Boris.
- **Minor, 1pt: Backend framework (Gin / Go).**
  - _Justification:_ Gin is the idiomatic web framework on top of Go's
    `net/http`; it provides routing, middleware, and parameter binding.
  - _Implementation:_ All HTTP routes wired in
    [src/backend/main.go](src/backend/main.go); Gin middleware enforces
    auth, roles, and rate limits.
  - _Worked on by:_ Johnny, Lucio, Lily.
- **Major, 2pts: Public API.**
  - _Justification:_ Meets all four subject requirements: secured API key
    (`X-API-Key` header), per-user rate limiting, dedicated documentation
    file, and at least 5 endpoints covering `GET` / `POST` / `PUT` /
    `DELETE`.
  - _Implementation:_ Five `/api/v1/recipes` endpoints (list, get, create,
    update, delete) gated by the `validateAPIKey` middleware. Keys are
    issued via `POST /api/users/apikey`, stored only as a hash, and gated
    behind the `developer` role. Full documentation in
    [src/backend/PUBLIC_API.md](src/backend/PUBLIC_API.md).
  - _Worked on by:_ Lucio (backend), Boris (UI).
- **Minor, 1pt: Advanced search.**
  - _Justification:_ Implements all three subject requirements: filters,
    sorting, and pagination.
  - _Implementation:_ `searchRecipes` repository query supports filtering
    on difficulty, cuisine, and meal type plus sort order and
    limit/offset. The frontend builds the query string from filter
    components and pages via infinite scroll.
  - _Worked on by:_ Lucio (backend), Boris (UI).
- **Minor, 1pt: Custom design system.**
  - _Justification:_ Subject minimum is 10 reusable components; the app
    ships 30+.
  - _Implementation:_ Reusable components under
    [src/frontend/src/components/](src/frontend/src/components/) (buttons,
    inputs, fields, navbar, footer, status boxes, language switcher, etc.)
    with a shared Tailwind palette and typography.
  - _Worked on by:_ Boris.
- **Minor, 1pt: Notification system.**
  - _Justification:_ Subject requires creation, update, and deletion
    notifications; all three are covered.
  - _Implementation:_ A notification context dispatches pop-ups on
    create / update / delete mutations across the app.
  - _Worked on by:_ Boris.

### User Management (5 points)

- **Major, 2pts: Standard user management and authentication.**
  - _Justification:_ All four subject requirements covered: profile
    editing, avatar upload (with a default), friends and online status,
    profile page.
  - _Implementation:_ Email + password signup with bcrypt-hashed
    passwords, JWT cookies, profile-edit handlers, avatar uploads via a
    Cloudinary signed URL, friendship system, and a heartbeat that
    updates `last_seen` for online status.
  - _Worked on by:_ Lily, Lucio (backend), Boris (UI).
- **Minor, 1pt: OAuth 2.0 (Google).**
  - _Justification:_ Google is a recognized OAuth 2.0 provider.
  - _Implementation:_ Backend flow in
    [src/backend/integrations/google.go](src/backend/integrations/google.go)
    creates or links a user on a successful Google sign-in; auth
    endpoints sit under `/api/auth`.
  - _Worked on by:_ Johnny (backend), Boris (UI).
- **Major, 2pts: Advanced permissions system.**
  - _Justification:_ Subject requires CRUD on users, role management, and
    role-based views; all three are implemented.
  - _Implementation:_ Five roles (`admin`, `moderator`, `chef`,
    `developer`, `user`) wired through `user_role` and `role_permission`
    join tables. The `authorization` and `middleware` packages load each
    user's roles and permissions into request context; the `Requires`
    middleware enforces them. The frontend hides routes and actions based
    on the user's roles, and the admin panel exposes CRUD on users.
  - _Worked on by:_ Lily (schema), Lucio (backend), Boris (UI).

### Accessibility and Internationalization (2 points)

- **Minor, 1pt: Multiple languages.**
  - _Justification:_ Subject minimum is 3 languages with i18n, a switcher,
    and translatable user-facing text. We ship English, Finnish, and
    Czech.
  - _Implementation:_ `react-i18next` with locale files in
    [src/frontend/src/locales/](src/frontend/src/locales/); language
    switcher in the navbar.
  - _Worked on by:_ Boris (i18n setup and most translations), Johnny
    (Finnish strings).
- **Minor, 1pt: Additional browsers.**
  - _Justification:_ Subject requires functional compatibility with at
    least two browsers beyond Chrome.
  - _Implementation:_ Manually tested in Firefox and Safari in addition
    to Chrome; Tailwind autoprefixes vendor-specific CSS and no
    Chrome-only APIs are used.
  - _Worked on by:_ team.

**Total: 14 points (14 required, no buffer).**

## Individual Contributions

### hiennguy

Database design and backend integration.

- **Database design.** Designed and built the PostgreSQL schema from scratch
  (covering user management, RBAC, recipes, engagement, friendship, and the
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

### bgazur

Frontend development.

- **Frontend foundation.** Set up the React + Vite app and linting, and built the
  reusable component design system (30+ components in `components/`: buttons,
  inputs, fields, navbar, footer, status boxes, language switcher).
- **Recipe UI.** Recipe browsing (`RecipeCard`, `RecipeDetail`), the create and
  edit recipe modals, and client-side image upload validation.
- **Advanced search UI.** The search bar, the three filters (difficulty, cuisine,
  meal type), sorting controls, and infinite scroll, with a sticky filter that
  collapses into a sidebar on mobile.
- **Friends UI.** The full friendship interface: add-friend modal with user
  search, accept / deny / cancel / unfriend actions, and the
  accepted / sent / incoming subtabs on the dashboard.
- **Online presence UI.** Online/offline indicators wired to the heartbeat API.
- **Admin panel.** The user-management split view, role-selection checkboxes, and
  the edit/delete user flows.
- **Auth and API key UI.** The Google login button, developer-role gating, and
  the API key generation modal.
- **Notifications.** The pop-up notification system for create/update/delete
  actions.
- **Internationalization.** English, Finnish, and Czech translations
  (`locales/`).
- **Responsive design.** Mobile layouts across the navbar, dashboard, recipe
  detail, and admin panel.

### lsurco-t

Backend authentication, authorization, and the public API.

- **Authentication.** JWT generation and validation (`jwt.go`), the login/logout
  handlers, the token blacklist (add / check / clean revoked tokens),
  `GetSession`, and cookie clearing.
- **Authorization.** The `authorization` and `middleware` packages, which load
  each user's roles and permissions from the database, pass them through the
  request context, and enforce role/permission checks via the `Requires`
  middleware (including self-action checks).
- **Public API module.** API key generation and hashing, the `validateAPIKey`
  middleware, per-user rate limiting (1 key request per hour), and gating the
  public routes behind the `developer` role. Authored `PUBLIC_API.md`.
- **User updates.** The `UpdateMe` (self) and `UpdateUser` (admin) handlers with
  field validation, password updates, and avatar handling.
- **Advanced search (backend).** The `searchRecipes` repository query and handler
  with the difficulty / cuisine / meal-type filters, plus the search-users-by-
  username endpoint.
- **Cloudinary.** The avatar upload signature handler/integration.

### jvarila

Backend endpoints and infrastructure.

- **HTTPS and reverse proxy.** The nginx reverse proxy, the certificate-generation
  script (`cert_generator`), HTTPS-only JWT cookies, and configurable port
  propagation from `.env` through Docker Compose.
- **DevOps.** The `.env` validation script, and the Docker
  Compose service dependencies.
- **Google OAuth.** The backend OAuth 2.0 flow (`integrations/google.go`), Google
  user creation/validation, and moving the auth endpoints under `/api/auth`.
- **Recipe write endpoints.** `PUT /api/recipes/:id` and `DELETE /api/recipes/:id`
  with authentication, role, and authorship checks, plus unified PostgreSQL error
  classification.
- **Backend testing.** Refactored the recipe handlers and repository to interfaces
  for mock-database testing, and added table-driven tests for `GetRecipeById` and
  `GetAllRecipes`.
- **Documentation and code quality.** Maintained `API.md`, `DATABASE.md`, and the
  JWT and nginx docs, and ran codebase-wide style passes (`Id` to `ID`, `Url` to
  `URL`, request-context handling, JSON serialization).
