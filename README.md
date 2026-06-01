_This project has been created as part of the 42 curriculum by bgazur, lsurco-t, hiennguy, jvarila._

# ft_transcendence

## Description

**Rise**: a recipe sharing platform, built as our full-stack web dev project at 42.

### Goals

Our goal for the transcendence project was to learn how to design a proper full
stack web application that uses a RESTful API, and consists of multiple docker
containers, practice project management, team work, and improve our Git
workflows. At the same time we set out to learn React and Go, as well as getting
more familiar with SQL, using PostgreSQL as our database.

### Overview & key features

Rise is a recipe-sharing platform with email and Google sign-in, role-based
permissions, recipe browsing with filters and infinite scroll, a friendship
system with online presence, multilingual UI (English, Finnish, Czech), an
admin panel, and a documented public API gated by per-user keys. See the
[Features List](#features-list) for the full breakdown.

## Instructions

### Prerequisites

- Docker (developed using 26.1.4)
- Docker Compose (developed using v2.27.1)
- [Cloudinary for image hosting](https://cloudinary.com/)
- Git
- GNU Make

### Steps

1. Download the repository using the Git CLI or GUI

```sh
git clone https://github.com/zoni527/ft_transcendence.git && cd ./ft_transcendence
```

2. Set up a `.env` file, and place it in the src folder (`src/.env.example` provided as a starting point)

```sh
cp ./src/.env.example ./src/.env
```

In order to use image hosting one has to setup [Cloudinary](https://cloudinary.com/),
and for Google login a [Google Console OAuth 2.0 Client](https://developers.google.com/identity/protocols/oauth2)
registered to the application.

3. run `make` in the root folder of the repository (`make help` for list of commands)
4. Open [https://localhost:8443](https://localhost:8443) on a web browser (replace port if customized)

## Usage

Once the containers are running and you have visited the site, the main flows
are:

### Account

- **Sign up** with an email and a password, or through Google OAuth.
- From the navbar, open your **profile** to edit your display name, change
  your password, upload a new avatar, or delete the account. Deleting an
  account keeps your published recipes but detaches them from your name.

### Recipes

- Open **Recipes** in the navbar to browse the full list.
- Use the **search bar** to filter by title, the **filter sidebar** to narrow
  by difficulty, cuisine, and meal type, and the **sort controls** to reorder.
  The list pages itself with **infinite scroll**.
- Click any card to open the **recipe detail** view.
- Click **Create recipe** from the Profile view to add your own (requires
  chef role). The form takes a recipe name, preparation steps,
  image (JPG/PNG, validated client-side and uploaded directly to Cloudinary),
  preparation time, servings, difficulty, cuisine and meal type, and nutrition information.
- On a recipe you own, **Edit** and **Delete** buttons appear in the detail
  view.

### Friends

- Open **Friends** in the Profile view.
- Click **Add friend** and search for other users by username.
- Pending requests show up under the **Sent** and **Requests** subtabs.
  Accept, Reject, Cancel, or Remove based on friendship state.
- Accepted friends display an online/offline indicator, kept updated by the
  heartbeat endpoint call.

### Language

- Use the **language switcher** in the navbar to change between **English**,
  **Finnish**, and **Czech**.

### Admin panel (admin role)

- Open **Admin** in the navbar to manage users (assign roles, edit, delete)
  and to review recipes.

### Public API (developer role)

- A user with the **developer** role can create a personal API key from their
  profile.
- Click **Generate** to create a new key. The key is shown once and is then
  stored only as a hash, so it cannot be retrieved later.
- Send the key as the `X-API-Key` header on any `/api/v1/*` route. See
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
- [Google Console OAuth 2.0 Client](https://developers.google.com/identity/protocols/oauth2)
- [Cloudinary](https://cloudinary.com/)

### AI Use

The team used GitHub Copilot's PR review bot, Google Gemini, ChatGPT, and Claude (chat and Claude
Code) at these specific points:

- **Code review on pull requests.** Copilot's PR review surfaced style,
  edge-case, and naming suggestions on most backend and frontend PRs;
  authors accepted or rejected each suggestion before merging.
- **Drafting documentation.** Claude generated first drafts of `API.md`,
  `DATABASE.md`, `PUBLIC_API.md`, this README, and inline comments. Every
  generated paragraph was reviewed and edited by hand before commit; no
  AI-generated text was committed without a human author's understanding
  of it.
- Troubleshooting, finding bugs, searching for resources and documentation.
- Test generation based on a pre-established structure, reviewed by humans.

AI was not used to write feature code unattended: any AI-suggested code
was reviewed and modified by the author before landing in `main`, and
every team member can explain the code they shipped.

## Team Information

Roles below reflect primary ownership, with explicit shared ownership
where two people genuinely drove the same area together. All product and
process decisions were discussed across the team; the named person (or
pair) drove and was accountable.

### bgazur

- **Assigned roles:** Product Owner, Developer
- **Responsibilities:** owned the user-facing product surface (React +
  Vite app, design system, every page layout, mobile responsiveness) and
  drove user-experience decisions on every flow (recipe browsing and
  creation, friends, admin panel, notifications, API key modal). As PO,
  validated that completed features matched what users would actually
  expect, made the call on UX trade-offs, and prioritized which frontend
  slices landed first. Highest commit count on the team (310).

### lsurco-t

- **Assigned roles:** Security Lead, Developer
- **Responsibilities:** owned the auth and security surface end-to-end:
  JWT generation and validation (`jwt.go`), the token blacklist for real
  logout and revocation, the `authorization` and `middleware` packages,
  role and permission enforcement via the `Requires` middleware, the
  public API module (key issuance, SHA-256 hashing, per-user rate
  limiting), the Cloudinary signature handler, and input validation
  across the user-update handlers. Also built the advanced recipe search
  backend. Roughly 42% of his commits (92 of 221) are explicitly on the
  security and auth axis.

### hiennguy

- **Assigned roles:** Technical Lead (shared with jvarila), Project Manager (shared with jvarila), Developer
- **Responsibilities:** researched the stack choices, designed the
  PostgreSQL schema from scratch, and established the backend
  architecture (`pgx` connection pool, the
  `models` / `repository` / `handlers` layering that the rest of the
  backend follows. Built the recipe and
  user/friendship read endpoints, online presence (`last_seen` plus
  heartbeat), account deletion with the last-admin guard, the seed data,
  and the database documentation. As shared Tech Lead, owns database
  architecture and backend structural decisions. As shared PM,
  coordinated the README finalization, drove module selection and
  ordering, and planned the schema-first sequence that unblocked
  frontend work.

### jvarila

- **Assigned roles:** Technical Lead (shared with hiennguy), Project Manager (shared with hiennguy), Developer
- **Responsibilities:** built the HTTPS infrastructure (nginx reverse
  proxy and the certificate-generation script), Docker Compose wiring
  (configurable port propagation from `.env`), the env-validation
  script, the Google OAuth backend (`integrations/google.go`), recipe
  write endpoints (`PUT` and `DELETE /api/recipes/:id`), the backend
  test scaffolding (interface refactor for a mockable DB plus
  table-driven tests), and ongoing documentation upkeep. As shared Tech
  Lead, owns infrastructure architecture (HTTPS, reverse proxy, Docker,
  CI conventions) and ran codebase-wide style passes (`Id` to `ID`,
  `Url` to `URL`). As shared PM, hosts the GitHub repo (`zoni527`),
  manages the Kanban board, and merged the majority of cross-team PRs.

## Project Management

### How we organized work

Modules were split by domain (frontend, backend authentication, database
plus backend integration, infrastructure) so each person owned a coherent
slice that could move forward without blocking others. Cross-cutting
features like advanced search and friendship were broken into a backend
ticket and a frontend ticket so the two halves could land independently.

### Cadence and communication

- **Bi-weekly team meetings** to sync on progress, demo what landed,
  agree on the next slice of work, and unblock anyone stuck.
- **Discord** for daily chat, screen shares, and async questions between
  meetings.

### Pull request process

All changes landed in `main` through pull requests. At least two
teammates had to approve a PR before it could be merged. Copilot's PR review
bot was also utilized and its suggestions were considered (accepted or
explicitly dismissed) before merging.

### Tools

- **GitHub Issues** for feature and bug tickets.
- **GitHub Projects** for the Kanban board tracking ticket status.
- **Google Docs** for design notes, API spec drafts, and meeting notes.
- **Discord** for communication.

## Technical Stack

- Frontend: React & Vite
- Backend: Golang, gin, pgx
- Database: PostgreSQL
- Reverse proxy: nginx
- Containerization: Docker Compose

## Justifications

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
  only regenerated.

## Database Schema

PostgreSQL with UUID primary keys. The schema is initialised on first container startup from numbered SQL migration files in
`src/database/migrations/`.

### Tables

| Table             | Purpose                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `user`            | User accounts: email, password hash, display name, avatar, `last_seen` timestamp for online status                                |
| `role`            | Role definitions: `admin`, `moderator`, `chef`, `developer`, `user`                                                               |
| `permission`      | Permission definitions: `create_recipe`, `edit_recipe`, `delete_recipe`, `manage_users`, `manage_roles`, `moderate_content`       |
| `user_role`       | Many-to-many link between users and roles                                                                                         |
| `role_permission` | Many-to-many link between roles and permissions                                                                                   |
| `token_blacklist` | Hashes of revoked JWTs, retained until natural expiry                                                                             |
| `api_keys`        | One hashed API key per user for the public API module                                                                             |
| `recipe`          | Recipe content, nutrition, image URL, and author (set to `NULL` if the author deletes their account)                              |
| `friendship`      | Directed friend requests with status `pending` or `accepted`, with a unique pair index that blocks duplicates in either direction |

See [src/database/DATABASE.md](src/database/DATABASE.md) for design decisions,
the rationale behind UUIDs, constraint details, and the local dev workflow
(`make`, `make dbclean`, Adminer on port `8081`).

### Diagram

![Database schema diagram](/docs/db_schema.png)

## Features List

What the application lets a user do, and who built each part:

- **Sign up and sign in** with email + password, or with a Google account.
  _Built by:_ Lucio (backend auth and sessions), Johnny (Google OAuth flow),
  Boris (UI).
- **Browse and search recipes** by title, with a filter sidebar (difficulty,
  cuisine, meal type), sort controls, and infinite scroll.
  _Built by:_ Lily (read endpoints), Lucio (search backend), Boris (UI).
- **Create, edit, and delete recipes** with a photo, ingredients, steps,
  preparation time, and nutrition info.
  _Built by:_ Lily (read endpoints), Johnny (write endpoints), Boris (UI and
  image upload).
- **Manage your account**: edit your display name, change your password,
  upload a new avatar, or delete the account (your recipes stay but your
  authorship is removed).
  _Built by:_ Lucio (update handlers and Cloudinary avatar signing), Lily
  (account deletion flow), Boris (profile UI).
- **Add friends and see who's online**: send, accept, deny, cancel, or
  unfriend; pending requests show up in Sent and Incoming tabs; accepted
  friends show a live online/offline indicator.
  _Built by:_ Lily (friendship API and heartbeat), Boris (UI).
- **Switch the interface language** between English, Finnish, and Czech.
  _Built by:_ Boris (i18n setup and most translations), Johnny (Finnish
  strings).
- **Manage users from the admin panel** (admin role): assign roles, edit,
  or delete users.
  _Built by:_ Lily and Lucio (backend), Boris (UI).
- **Get in-app notifications** when something is created, updated, or
  deleted.
  _Built by:_ Boris.
- **Access recipes through a public API** (developer role): generate a
  personal API key in the navbar, then call `GET / POST / PUT / DELETE /api/v1/recipes`
  with the `X-API-Key` header. Rate-limited and documented.
  _Built by:_ Lucio (backend), Boris (UI).
- **Read the Privacy Policy and Terms of Service** pages linked from the
  footer.
  _Built by:_ Boris.
- **Use the app with multiple users at the same time**: each user has
  their own session, online status updates in near real time across users,
  and the database prevents collisions on shared writes.
  _Built by:_ team.

## Modules

The ft_transcendence subject requires a minimum of 14 points (Major = 2pts,
Minor = 1pt). We claim **14 points** across three categories. For each
module we record the justification, how it was implemented, and who worked
on it.

### Web (7 points)

- **Minor, 1pt: Frontend framework (React + Vite).**
  - _Justification:_ React is on the subject's accepted frontend framework
    list; Vite provides the dev server and bundler.
  - _Implementation:_ React 19 app under [src/frontend/](src/frontend/) using React Router and a custom component design system.
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

**Total: 14 points.**

## Individual Contributions

### hiennguy

Database design and backend integration.

- **Database design:** PostgreSQL schema from scratch (user management, RBAC, recipes, friendship, public API), UUID PKs via `uuid-ossp`.
- **Database infrastructure:** `postgres` and `adminer` services in Docker Compose, migration auto-init from numbered SQL files, `make dbclean`.
- **Backend ↔ database integration:** `pgx` connection pool, `models/` / `repository/` / `handlers/` layering.
- **Recipe endpoints:** `GET /api/recipes`, `GET /api/recipes/:id` (nested author).
- **User endpoints:** `GET /api/users`, `GET /api/users/:id`, `DELETE /api/users/:id` (last-admin guard, blacklist-before-delete).
- **Friendship API:** `GET / POST / PATCH / DELETE /api/friendships` (pending / accepted state machine).
- **Online presence:** `last_seen` column, `PUT /api/users/me/heartbeat`, `markOnline()` hook.
- **Seed data:** 25 users, 25 recipes, 49 friendship pairs in `002_seed.sql`.
- **Documentation:** `DATABASE.md`, `BACKEND.md`, `PERMISSIONS.md`, plus a heavy share of `API.md`.
- **Challenges.** Designing the `friendship` table so it could power
  directional views (who-sent-who) AND block duplicate requests in either
  direction at the database level: solved with a unique sorted-pair index
  on top of the composite primary key. Also: wiring the migration
  auto-init through Docker Compose so `make`, `make dbclean`, and
  first-boot on a fresh volume all behave the same way.

### bgazur

Frontend development.

- **Frontend foundation:** React + Vite app, linting, 30+ reusable components in `components/`.
- **Recipe UI:** `RecipeCard`, `RecipeDetail`, create/edit modals, image upload validation.
- **Advanced search UI:** search bar, three filters, sort controls, infinite scroll, mobile sticky filter sidebar.
- **Friends UI:** add-friend modal, accept / deny / cancel / unfriend, accepted / sent / incoming subtabs.
- **Online presence UI:** indicators wired to the heartbeat.
- **Admin panel UI:** split view, role checkboxes, edit/delete user flows.
- **Auth and API key UI:** Google login button, developer-role gating, API key modal.
- **Notifications:** pop-up system for create / update / delete.
- **Internationalization:** `locales/` for English, Finnish, Czech.
- **Responsive design:** mobile layouts across navbar, dashboard, recipe detail, admin panel.
- **Challenges.** Keeping the design system consistent across very different
  pages (admin panel, dashboard, recipe detail, friends) while supporting
  mobile breakpoints; the navbar and several layouts were reworked
  mid-project. Also: managing the Friends page state across the
  accepted / sent / incoming subtabs without prop-drilling, and reconciling
  the heartbeat-driven online indicators with the friend list cache.

### lsurco-t

Backend authentication, authorization, and the public API.

- **Authentication:** `jwt.go`, login/logout handlers, token blacklist (add / check / clean), `GetSession`, cookie clearing.
- **Authorization:** `authorization` and `middleware` packages, `Requires` middleware with self-action checks.
- **Public API module:** API key generation + hashing, `validateAPIKey` middleware, 1-per-hour rate limit, `developer` role gate, `PUBLIC_API.md`.
- **User updates:** `UpdateMe` and `UpdateUser` handlers with field validation, password updates, avatar handling.
- **Advanced search (backend):** `searchRecipes` repository + handler, search-users-by-username endpoint.
- **Cloudinary:** avatar upload signature handler.
- **Documentation:** `PUBLIC_API.md`, plus a heavy share of `API.md`.
- **Challenges.** Reconciling cookie-based JWT auth with the new
  `X-API-Key` path so neither code path could accidentally satisfy the
  other. Designing the rate limit to be per-user rather than per-IP (since
  the API key identifies the user), and storing the key so a database
  leak does not expose live secrets: solution is to keep only the SHA-256
  hash and let the user regenerate if lost.

### jvarila

Backend endpoints and infrastructure.

- **HTTPS and reverse proxy:** nginx reverse proxy, `cert_generator` script, HTTPS-only JWT cookies, configurable port propagation from `.env`.
- **DevOps:** `.env` validation script, Docker Compose service dependencies.
- **Google OAuth:** `integrations/google.go`, user creation/validation, auth endpoints under `/api/auth`.
- **Recipe write endpoints:** `PUT /api/recipes/:id`, `DELETE /api/recipes/:id` (auth + role + authorship checks).
- **Backend testing:** interface refactor for mockable DB, table-driven tests for `GetRecipeById` and `GetAllRecipes`.
- **Documentation:** authored `docs/jwt_and_cookies.md`, `docs/nginx_links.md`, `docs/go_links.md`; co-maintained `API.md`, `DATABASE.md`, `BACKEND.md`, `PERMISSIONS.md`.
- **Code quality:** codebase-wide style passes (`Id` to `ID`, `Url` to `URL`, request-context handling, JSON serialization).
- **Challenges.** Bootstrapping self-signed certificates across multiple
  containers and getting the browser to trust them locally for
  development; configuring nginx to route a single origin to both the Go
  backend and the React dev server. Also: making the env-validation
  script catch missing variables before the stack starts up, so we fail
  fast with a clear message instead of a cryptic container crash.
