# Permissions Design

Status: design spec, partially implemented. This doc is the source of truth
for how authorization works on the backend so the frontend team can build
role-based views before the grant/revoke endpoints land.

## Why RBAC

The subject's "Advanced permission system" module asks for roles, CRUD on
those roles, and role-based views. We use a standard Role-Based Access
Control (RBAC) model: users have one or more roles, each role bundles a set
of permissions, and the backend gates routes by role.

Permissions exist in the schema for future granularity but are not yet
checked individually. Today, route middleware only looks at role names. If
we ever need finer control (e.g. "this moderator can `edit_recipe` but not
`delete_recipe`"), we **replace** `RequiredRolesMiddleware` with a
`RequiredPermissionsMiddleware` on the affected routes, we do not stack
both layers.

**No per-user overrides.** A user's effective permissions are the union of
permissions across their assigned roles, period. There is no
`user_permission` table, and we will not glue an extra permission onto one
specific user as a one-off. If someone needs a capability their role
doesn't grant, the answer is either an authorship check (for "edit your
own thing" cases) or a different role — never a direct grant.

Concretely: a chef can edit her *own* recipes via authorship check. She
*cannot* edit another user's recipes. We do not promote her to moderator
just to let her touch one other recipe, and we do not bolt `edit_recipe`
onto her chef role for one user. The two paths are: own → allowed,
not own → forbidden unless you hold a role that grants it for everyone.

## Roles

Four roles, seeded in [002_seed.sql](../database/migrations/002_seed.sql).

| Role          | Description                                                               |
|---------------|---------------------------------------------------------------------------|
| `user`        | Default. Browse and favourite. Every signed-up user gets this.            |
| `chef`        | Can create recipes.                                                       |
| `moderator`   | Can edit and delete any recipe. Reviews user content.                     |
| `admin`       | Everything. Manages users, roles, and site settings.                      |

Roles are additive: a chef who is also a moderator holds both. The default
signup flow assigns `user` only ([repository/users.go:193](repository/users.go#L193)).

## Permissions

Defined in [001_schema.sql](../database/migrations/001_schema.sql) and seeded
with role mappings in [002_seed.sql](../database/migrations/002_seed.sql).

| Permission            | admin | moderator | chef              | user  |
|-----------------------|:-----:|:---------:|:-----------------:|:-----:|
| `create_recipe`       | yes   |           | yes               |       |
| `edit_recipe`         | yes   | yes       | yes (only own)    |       |
| `delete_recipe`       | yes   | yes       | yes (only own)    |       |
| `moderate_content`    | yes   | yes       |                   |       |
| `manage_users`        | yes   |           |                   |       |
| `manage_roles`        | yes   |           |                   |       |

Two patterns the table doesn't show:

- **Authorship overrides.** A chef can edit and delete their *own* recipes
  even though `edit_recipe` and `delete_recipe` are not in their role. The
  handler checks `recipe.author_id == current_user.id` and short-circuits
  the role check. See the TODO note in [002_seed.sql:45](../database/migrations/002_seed.sql#L45).
- **Public reads.** Browsing recipes needs no permission. Auth
  middleware is not attached to public GET routes.

## How enforcement works

Two middlewares run before any protected route:

- `AuthMiddleware` — "are you logged in?" (identity)
- `RequiredRolesMiddleware` — "do you have one of these roles?" (authorization)

These stack because they answer **different** questions: one identifies
the user, the other checks what they can do. You always need both.

If both pass, the handler runs. Some handlers do an extra check of their
own (e.g. authorship — see below). That's the only handler-level pattern
in the code today.

> **Rule of thumb for adding new middleware:** stack middlewares that ask
> different questions, replace middlewares that ask the same question. So
> a future `RequiredPermissionsMiddleware` would *replace*
> `RequiredRolesMiddleware` on the affected routes (same question, finer
> grain), not run alongside it.

### AuthMiddleware

[handlers/users.go:396](handlers/users.go#L396). Reads the `token` cookie,
validates the JWT, checks the token blacklist, and stores `userID` on the
Gin context.

| Status | When |
|---|---|
| 401 `{"error":"unauthorized"}`   | Missing `token` cookie |
| 401 `{"error":"invalid token"}`  | JWT validation failed, or token is blacklisted |
| 500                              | Blacklist lookup itself errored |

### RequiredRolesMiddleware

[handlers/recipes.go:441](handlers/recipes.go#L441). Looks up the user's
roles via `GetRolesByUserId` and allows the request if *any* of the user's
roles match the allowed list. Returns `403 Forbidden` on failure.

```go
router.POST("/api/recipes",
    handlers.AuthMiddleware(),
    handlers.RequiredRolesMiddleware("chef", "moderator", "admin"),
    handlers.CreateRecipe)
```

### Authorship checks

For "edit your own thing" routes, the handler runs the authorship check
*after* AuthMiddleware and *instead of* RequiredRolesMiddleware. Pattern:

```go
// inside handler
recipe, err := repository.GetRecipeById(recipeID)
if err != nil {
    // ... 404 if not found, 500 otherwise
    return
}

userID := c.GetString("userID")
roles, err := repository.GetRolesByUserId(userID)
if err != nil {
    log.Printf("GetRolesByUserId: %v", err)
    c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
    return
}

isOwner := recipe.Author_id == userID
isPrivileged := contains(roles, "moderator") || contains(roles, "admin")
if !isOwner && !isPrivileged {
    c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
    return
}
```

Used by `PUT /api/recipes/:id` and `DELETE /api/recipes/:id`.

## Endpoints

> Note: there is no dedicated `GET /api/users/:id/roles` endpoint. Roles
> are already part of the User JSON returned by `GET /api/users/:id` and
> `GET /api/users/me`. Frontend reads `user.roles` from those calls.

### POST /api/users/:id/roles

Grant a role to a user. Admin only.

**Auth:** AuthMiddleware + RequiredRolesMiddleware("admin")

**Body**
```json
{ "role": "chef" }
```

**Response** `200 OK`. Returns the user's full role list after the grant.
```json
{ "roles": ["user", "chef"] }
```

| Status    | Meaning                       |
|-----------|-------------------------------|
| 400       | Missing or unknown role name  |
| 401       | Not signed in                 |
| 403       | Caller is not admin           |
| 404       | Target user not found         |
| 409       | User already has that role    |

Idempotent-by-PK in the DB (`user_role` PRIMARY KEY (user_id, role_id)),
but we surface `409` rather than silently no-op so the UI can show feedback.

**One role per call.** Bulk grants are intentionally not supported — the
frontend can fire parallel requests if it needs to grant multiple. This
keeps per-role status codes (especially `409`) clean and avoids
partial-success ambiguity.

### DELETE /api/users/:id/roles/:role

Revoke a role from a user. Admin only.

**Auth:** AuthMiddleware + RequiredRolesMiddleware("admin")

**Response** `204 No Content`

| Status    | Meaning                                                               |
|-----------|-----------------------------------------------------------------------|
| 400       | Trying to revoke `user` (the default role cannot be removed)          |
| 401       | Not signed in                                                         |
| 403       | Caller is not admin, OR caller is trying to revoke their own `admin`  |
| 404       | User has no such role                                                 |

The self-revoke admin rule is a lockout guard: if every admin removed their
own admin role we would have nobody who can grant it back.

### GET /api/roles

Returns the catalogue of role names and descriptions. Used by the admin
panel to populate a "grant role" dropdown.

**Response** `200 OK`
```json
[
  { "name": "user",      "description": "Default. Browse and favourite." },
  { "name": "chef",      "description": "Can create recipes." },
  { "name": "moderator", "description": "Review and moderate content." },
  { "name": "admin",     "description": "Full access." }
]
```

## Frontend usage

The `User` JSON already includes `roles` as a string array
([models/models.go:23](models/models.go#L23)):

```json
{
  "id": "uuid",
  "display_name": "alice",
  "roles": ["admin"],
  ...
}
```

Role-based view tips:

- `GET /api/users/me` returns the current user including roles. Cache it
  in app state on login so the UI can branch without an extra round trip.
- For "show admin panel link" type checks, just look at `roles.includes("admin")`.
- For "can I edit this recipe?" checks, combine the authorship check with
  the role check on the client too, so the button is hidden when it would 403.
  Server still enforces, client only hides.

## Deferred (post-MVP)

None of the below blocks the permission module's subject requirements.
They are tracked here so we don't lose them if we have time at the end.

- **`user` role is permanent.** The default role can't be revoked.
  `DELETE /api/users/:id/roles/user` returns `400`. Removing it would
  leave an account logged in with no permissions, which is an odd state
  with no use case.
- **Audit log on role grants/revokes.** Cheap to add (`role_change`
  table: actor, target, role, action, timestamp). Not required by the
  subject. Defer.
- **Permission-level middleware.** Schema supports it; add
  `RequiredPermissionsMiddleware` only when a route genuinely needs
  finer control than role names. Defer.

## Implementation checklist

Schema and middleware are already in place. Remaining work:

- [ ] `GET /api/roles` handler + repository query
- [ ] `POST /api/users/:id/roles` handler (with 409 on duplicate)
- [ ] `DELETE /api/users/:id/roles/:role` handler (with self-revoke admin guard)
- [ ] `repository.GrantRole(userID, roleName)`
- [ ] `repository.RevokeRole(userID, roleName)`
- [ ] Wire the three routes in [main.go](main.go)
- [ ] Add the new endpoints to [API.md](API.md)
