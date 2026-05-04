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
`ban_user`"), we add a `RequiredPermissionsMiddleware` without breaking the
existing wiring.

## Roles

Four roles, seeded in [002_seed.sql](../database/migrations/002_seed.sql).

| Role | Description |
|---|---|
| `user` | Default. Browse, favourite, comment. Every signed-up user gets this. |
| `chef` | Can create and publish recipes. |
| `moderator` | Can edit, delete, and unpublish any recipe. Reviews user content. |
| `admin` | Everything. Manages users, roles, and site settings. |

Roles are additive: a chef who is also a moderator holds both. The default
signup flow assigns `user` only ([repository/users.go:192](repository/users.go#L192)).

## Permissions

Defined in [001_schema.sql](../database/migrations/001_schema.sql) and seeded
with role mappings in [002_seed.sql](../database/migrations/002_seed.sql).

| Permission | admin | moderator | chef | user |
|---|:-:|:-:|:-:|:-:|
| `create_recipe` | yes | | yes | |
| `edit_recipe` | yes | yes | | |
| `delete_recipe` | yes | yes | | |
| `publish_recipe` | yes | yes | yes | |
| `manage_users` | yes | | | |
| `manage_roles` | yes | | | |
| `ban_user` | yes | | | |
| `moderate_content` | yes | yes | | |

Two patterns the table doesn't show:

- **Authorship overrides.** A chef can edit and delete their *own* recipes
  even though `edit_recipe` and `delete_recipe` are not in their role. The
  handler checks `recipe.author_id == current_user.id` and short-circuits
  the role check. See the TODO note in [002_seed.sql:46](../database/migrations/002_seed.sql#L46).
- **Public reads.** Browsing published recipes needs no permission. Auth
  middleware is not attached to public GET routes.

## How enforcement works

Two middlewares, applied in order on protected routes.

### AuthMiddleware

[handlers/users.go:335](handlers/users.go#L335). Reads the `token` cookie,
validates the JWT, and stores `userID` on the Gin context. Returns
`401 Unauthorized` on failure.

### RequiredRolesMiddleware

[handlers/recipes.go:406](handlers/recipes.go#L406). Looks up the user's
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
// ...
userID := c.GetString("userID")
roles, _ := repository.GetRolesByUserId(userID)

isOwner := recipe.Author_id == userID
isPrivileged := contains(roles, "moderator") || contains(roles, "admin")
if !isOwner && !isPrivileged {
    c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
    return
}
```

Used by `PUT /api/recipes/:id` and `DELETE /api/recipes/:id`.

## Endpoints

### GET /api/users/:id/roles

Returns the role names for a user. Public read so the frontend can render
role badges on profile pages without an extra auth dance.

**Response** `200 OK`
```json
{ "roles": ["chef", "moderator"] }
```

`404` if the user does not exist.

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

| Status | Meaning |
|---|---|
| 400 | Missing or unknown role name |
| 401 | Not signed in |
| 403 | Caller is not admin |
| 404 | Target user not found |
| 409 | User already has that role |

Idempotent-by-PK in the DB (`user_role` PRIMARY KEY (user_id, role_id)),
but we surface `409` rather than silently no-op so the UI can show feedback.

### DELETE /api/users/:id/roles/:role

Revoke a role from a user. Admin only.

**Auth:** AuthMiddleware + RequiredRolesMiddleware("admin")

**Response** `204 No Content`

| Status | Meaning |
|---|---|
| 400 | Trying to revoke `user` (the default role cannot be removed) |
| 401 | Not signed in |
| 403 | Caller is not admin, OR caller is trying to revoke their own `admin` |
| 404 | User has no such role |

The self-revoke admin rule is a lockout guard: if every admin removed their
own admin role we would have nobody who can grant it back.

### GET /api/roles

Returns the catalogue of role names and descriptions. Used by the admin
panel to populate a "grant role" dropdown.

**Response** `200 OK`
```json
[
  { "name": "user",      "description": "Default. Browse, favourite, comment." },
  { "name": "chef",      "description": "Can create and publish recipes." },
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

## Open questions

- Should `user` ever be revocable? Today it is the default role and can be
  removed via the same DELETE endpoint, but doing so leaves an account in
  an odd state (logged in, no permissions). Leaning toward "no, treat it
  as a permanent baseline."
- Do we need an audit log on role grants/revokes? Not required by the
  subject, but would be cheap to add (`role_change` table with actor,
  target, role, action, timestamp).
- Permission-level middleware vs role-level: defer until a real use case
  shows up.

## Implementation checklist

Schema and middleware are already in place. Remaining work:

- [ ] `GET /api/roles` handler + repository query
- [ ] `GET /api/users/:id/roles` handler
- [ ] `POST /api/users/:id/roles` handler (with 409 on duplicate)
- [ ] `DELETE /api/users/:id/roles/:role` handler (with self-revoke admin guard)
- [ ] `repository.GrantRole(userID, roleName)`
- [ ] `repository.RevokeRole(userID, roleName)`
- [ ] Wire all four routes in [main.go](main.go)
- [ ] Add the new endpoints to [API.md](API.md)
