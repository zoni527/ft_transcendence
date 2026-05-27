# API Reference

Base URL: `https://localhost:8443`

## Authentication

The API uses **JWT tokens** stored in an HttpOnly cookie. When you call `/api/auth/login` successfully, the server sets a `token` cookie containing the JWT. All subsequent authenticated requests automatically include this cookie.

**Token lifespan:** 1 hour. After expiration, login again.

**Behind the scenes:**
- Authenticated endpoints require `middleware.Authentication()` which validates the JWT and blocks requests without a valid token.
- Permission/role checks use `middleware.RequirePermission()` or `middleware.RequireRoles()` after authentication.

| Status    | When                                               |
|-----------|----------------------------------------------------|
| 401       | Missing `token` cookie or JWT validation failed    |
| 403       | Authenticated but lacks required permissions/roles |

---

## Rate Limiting

Requests are rate-limited per API key. If you exceed the limit, the server responds with `429 Too Many Requests`.

| Header                    | Description                                   |
|---------------------------|-----------------------------------------------|
| `X-RateLimit-Limit`       | Max requests per window                       |
| `X-RateLimit-Remaining`   | Requests left in current window               |
| `X-RateLimit-Reset`       | Seconds until the window resets               |

---

## Common Error Responses

All errors return JSON in this format:

```json
{
  "error": "description of what went wrong"
}
```

| Status    | Meaning                                                  |
|-----------|----------------------------------------------------------|
| 400       | Bad request — invalid or missing data                    |
| 401       | Unauthorized — missing or invalid JWT token              |
| 403       | Forbidden — lacks required permissions/roles             |
| 404       | Not found — resource does not exist                      |
| 500       | Internal server error                                    |

---

## Users

### GET /api/users

Get all users.

**Query parameters (optional):**
| Param | Type  | Description                                       |
|-------|-------|---------------------------------------------------|
| page  | int   | Page number for pagination (default: 1) — TODO    |
| limit | int   | Results per page (default: 20) — TODO             |

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane",
    "display_name": "jane_cooks",
    "last_seen": "2026-05-11T14:30:00Z",
    "is_online": true,
    "created_at": "2026-04-09T12:00:00Z",
    "updated_at": "2026-04-09T12:00:00Z",
    "roles": ["user"]
  }
]
```

---

### GET /api/users/search?q=

Search users by display name. Useful for the "Add Friend" feature.

**Query parameters:**
| Param | Type      | Description                                   |
|-------|-----------|-----------------------------------------------|
| q     | string    | Search term (matches display_name)            |

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "display_name": "jane_cooks"
  }
]
```

---

### GET /api/users/:id

Get a single user by ID.

**Response** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane",
  "display_name": "jane_cooks",
  "last_seen": "2026-05-11T14:30:00Z",
  "is_online": true,
  "created_at": "2026-04-09T12:00:00Z",
  "updated_at": "2026-04-09T12:00:00Z",
  "roles": ["user"]
}
```

**Errors:**
| Status    | When              |
|-----------|-------------------|
| 404       | User not found    |

---

### POST /api/users

Create a new user.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "plaintext_password",
  "name": "Jane",
  "display_name": "jane_cooks"
}
```

**Response** `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane",
  "display_name": "jane_cooks",
  "last_seen": "2026-05-11T14:30:00Z",
  "is_online": true,
  "created_at": "2026-04-09T12:00:00Z",
  "updated_at": "2026-04-09T12:00:00Z",
  "roles": ["user"]
}
```

**Errors:**
| Status    | When                                      |
|-----------|-------------------------------------------|
| 400       | Missing required fields or invalid data   |
| 422       | Password is too weak                      |
| 409       | Email already exists                      |

---

### PUT /api/users/:id

Update a user profile. Requires authentication.

**Authentication:** JWT token in `token` cookie (via `middleware.Authentication()`)

**Permissions:**
- A user can update their own profile (all fields except roles)
- A user can change their own password
- An admin can update any user's profile fields
- An admin can update roles (only)
- An admin cannot change another user's password

**Request body:**
```json
{
  "email": "newemail@example.com",
  "name": "Jane Doe",
  "password": "newPassword123",
  "display_name": "jane_updated",
  "avatar_url": "https://res.cloudinary.com/dhuk7trpf/image/upload/image.png",
  "roles": ["user", "admin"]
}
```

**Notes:**
- All fields are optional
- `password` is only accepted when the caller is updating their own profile
- `roles` is only accepted for admins
- If a field is omitted, it is left unchanged
- Email must be unique; changing to an existing email will fail
- Role updates replace the full role list when provided

**Response** `200 OK`
```json
{
  "id": "uuid",
  "email": "newemail@example.com",
  "name": "Jane Doe",
  "display_name": "jane_updated",
  "last_seen": "2026-05-11T14:30:00Z",
  "is_online": true,
  "avatar_url": "https://example.com/avatar.png",
  "created_at": "2026-04-09T12:00:00Z",
  "updated_at": "2026-04-09T12:00:00Z",
  "roles": ["user", "admin"]
}
```

**Errors:**
| Status    | When                                                              |
|-----------|-------------------------------------------------------------------|
| 400       | Invalid input data, missing payload fields, or invalid values     |
| 401       | Unauthorized — invalid or missing token                           |
| 403       | Forbidden — caller is not allowed to change the requested fields  |
| 422       | Password is too weak                                              |
| 409       | Email already exists (taken by another user)                      |
| 500       | Internal server error                                             |

---

### DELETE /api/users/:id

Delete a user. Requires authentication. A user may delete their own account; admins may delete any account. Cascades: removes the user's role assignments, favourites, and friendships. Recipes they authored remain with `author_id` set to NULL.

On self-delete the caller's JWT is added to the token blacklist and the auth cookie is cleared in the response.

**Response** `204 No Content`

**Errors:**
| Status    | When                                                              |
|-----------|-------------------------------------------------------------------|
| 401       | Missing or invalid auth cookie                                    |
| 403       | Caller is not the target user and is not an admin                 |
| 403       | Target is the last remaining admin                                |
| 404       | User not found (or malformed UUID in path)                        |
| 500       | Internal server error                                             |

---

### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "plaintext_password"
}
```

**Response** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "authenticated": true
}
```

Sets a `token` cookie with JWT. The cookie can be marked Secure once the API is served over HTTPS.

**Errors:**
| Status    | When                      |
|-----------|---------------------------|
| 400       | Missing email or password |
| 401       | Invalid credentials       |

---

### POST /api/auth/logout

Log out the current authenticated user. Clears the authentication cookie.

**Requires:** Valid JWT in `token` cookie (set during login).

**Response** `200 OK`
```json
{
  "message": "logged out successfully"
}
```

**Errors:**
| Status    | When                                  |
|-----------|---------------------------------------|
| 401       | Unauthorized — missing or invalid JWT |

---

### GET /api/users/me

Get the profile of the currently authenticated user.

**Requires:** Valid JWT in `token` cookie (set during login).

**Response** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane",
  "display_name": "jane_cooks",
  "last_seen": "2026-05-11T14:30:00Z",
  "is_online": true,
  "created_at": "2026-04-09T12:00:00Z",
  "updated_at": "2026-04-09T12:00:00Z",
  "roles": ["user"]
}
```

**Errors:**
| Status    | When                                  |
|-----------|---------------------------------------|
| 401       | Unauthorized — missing or invalid JWT |
| 404       | User not found                        |

---

### PUT /api/users/me/heartbeat

Update the current user's `last_seen` timestamp. Used by the frontend to drive the green/red online dot.

**Requires:** Valid JWT in `token` cookie (set during login).

**Body:** none

**Response** `204 No Content`

**Notes:**
- Frontend should call this every 30 seconds while the user is logged in.
- Other endpoints returning a User now include `last_seen` and `is_online`.
- A user is considered online if their `last_seen` is within the last 60 seconds.

**Errors:**
| Status    | When                                  |
|-----------|---------------------------------------|
| 401       | Unauthorized — missing or invalid JWT |
| 500       | Internal server error                 |

---

### GET /api/auth/session

Check whether the current browser session is authenticated.

**Response** `200 OK` (authenticated):
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane",
    "display_name": "jane_cooks",
    "last_seen": "2026-05-11T14:30:00Z",
    "is_online": true,
    "created_at": "2026-04-09T12:00:00Z",
    "updated_at": "2026-04-09T12:00:00Z",
    "roles": ["user"]
  }
}
```

**Response** `200 OK` (not authenticated):
```json
{
  "authenticated": false
}
```

---

### GET /api/users/avatar

Get a Cloudinary upload signature for uploading user avatars. This endpoint provides the authentication credentials needed to upload files directly to Cloudinary.

**Requires:** Valid JWT in `token` cookie (set during login).

**Response** `200 OK`
```json
{
  "signature": "cloudinary_signature_string",
  "api_key": "your_cloudinary_api_key",
  "cloud_name": "your_cloudinary_cloud_name",
  "timestamp": "1712700000",
  "folder": "avatar"
}
```

**Notes:**
- This endpoint is used by the frontend before uploading an avatar to Cloudinary
- The returned signature, API key, and other parameters should be used with Cloudinary's upload widget or API

**Errors:**
| Status    | When                                  |
|-----------|---------------------------------------|
| 401       | Unauthorized — missing or invalid JWT |
| 500       | Failed to generate signature          |


---

## Recipes

### GET /api/recipes

Get all recipes.

**Query parameters (optional):**
| Param         | Type      | Description                                                   |
|---------------|-----------|---------------------------------------------------------------|
| cuisine       | string    | Filter by cuisine (e.g. "italian")                            |
| meal_type     | string    | Filter by meal type (breakfast/lunch/dinner/snack)            |
| difficulty    | string    | Filter by difficulty (easy/medium/hard)                       |
| sort          | string    | Sort by field (e.g. "created_at", "title", "calories") — TODO |
| order         | string    | Sort order: "asc" or "desc" (default: "desc") — TODO          |
| page          | int       | Page number for pagination (default: 1) — TODO                |
| limit         | int       | Results per page (default: 20) — TODO                         |

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "author": {
      "id": "uuid",
      "display_name": "jane_cooks",
      "avatar_url": "https://res.cloudinary.com/.../jane.png"
    },
    "title": "Pasta Carbonara",
    "description": "Classic Italian pasta",
    "preparation_time_min": 20,
    "servings": 4,
    "difficulty": "medium",
    "cuisine": "italian",
    "meal_type": "dinner",
    "image_url": "/images/carbonara.jpg",
    "calories": 550,
    "protein_g": 25.0,
    "carbs_g": 60.0,
    "fat_g": 22.0,
    "created_at": "2026-04-09T12:00:00Z",
    "updated_at": "2026-04-09T12:00:00Z"
  }
]
```

If the original author has been deleted (`author_id` is NULL on the row), the
`author` object is returned with empty string fields rather than `null`, so the
shape stays stable on the frontend.

---

### GET /api/recipes/:id

Get a single recipe by ID.

**Response** `200 OK`
```json
{
  "id": "uuid",
  "author": {
    "id": "uuid",
    "display_name": "jane_cooks",
    "avatar_url": "https://res.cloudinary.com/.../jane.png"
  },
  "title": "Pasta Carbonara",
  "description": "Classic Italian pasta",
  "preparation_time_min": 20,
  "servings": 4,
  "difficulty": "medium",
  "cuisine": "italian",
  "meal_type": "dinner",
  "image_url": "/images/carbonara.jpg",
  "calories": 550,
  "protein_g": 25.0,
  "carbs_g": 60.0,
  "fat_g": 22.0,
  "created_at": "2026-04-09T12:00:00Z",
  "updated_at": "2026-04-09T12:00:00Z"
}
```

**Errors:**
| Status    | When              |
|-----------|-------------------|
| 404       | Recipe not found  |

---

### GET /api/recipes/search?q=

Search recipes by title with optional filters.

**Query parameters:**
| Param      | Type      | Description                                                   |
|------------|-----------|---------------------------------------------------------------|
| q          | string    | Search term (matches recipe title, case-insensitive)          |
| page       | int       | Page number for pagination (default: 1)                       |
| difficulty | string    | Filter by difficulty (easy/medium/hard)                     |
| meal_type  | string    | Filter by meal type (breakfast/lunch/dinner/snack/dessert)    |
| date       | string    | Sort order: "oldest" (ASC) or "newest" (DESC, default)        |

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Pasta Carbonara",
    "preparation_time_min": 20,
    "image_url": "/images/carbonara.jpg"
  }
]
```

**Notes:**
- Returns a paginated list with 12 results per page
- If page ≤ 0, defaults to page 1
- All filters are optional

---

### POST /api/recipes

Create a new recipe.

**Authentication/Authorization:**
- Requires: `middleware.Authentication()` + `middleware.RequirePermission("create_recipe")`
- Returns `401 Unauthorized` if the JWT cookie is missing or invalid
- Returns `403 Forbidden` if the authenticated user does not have `create_recipe` permission

**Request body:**
```json
{
  "title": "Pasta Carbonara",
  "description": "Classic Italian pasta",
  "preparation_time_min": 20,
  "servings": 4,
  "difficulty": "medium",
  "cuisine": "italian",
  "meal_type": "dinner",
  "image_url": "/images/carbonara.jpg",
  "calories": 550,
  "protein_g": 25.0,
  "carbs_g": 60.0,
  "fat_g": 22.0
}
```

**Notes:**
- `author_id` is automatically derived from the authenticated user and cannot be specified in the request body.

**Response** `201 Created` — returns the created recipe's id.

**Errors:**
| Status    | When                                                                  |
|-----------|-----------------------------------------------------------------------|
| 400       | Missing required fields (title, description, etc) or invalid values   |
| 400       | Invalid difficulty or meal_type value                                 |
| 400       | Negative or zero numeric fields (servings, preparation_time, etc.)    |
| 401       | Unauthorized — missing or invalid JWT                                 |
| 403       | Forbidden — user lacks create_recipe permission                       |

---

### GET /api/recipes/image-signature

Get a pre-signed Cloudinary signature for uploading recipe images. Required for secure client-side image uploads.

**Authentication:** `middleware.Authentication()` + `middleware.RequirePermission("create_recipe")`

**Response** `200 OK`
```json
{
  "signature": "cloudinary_signature_string",
  "timestamp": 1701234567,
  "api_key": "cloudinary_api_key",
  "cloud_name": "your_cloud_name"
}
```

**Errors:**
| Status    | When                                         |
|-----------|----------------------------------------------|
| 401       | Unauthorized — missing or invalid JWT        |
| 403       | Forbidden — lacks `create_recipe` permission |
| 500       | Failed to generate signature                 |

---

### PUT /api/recipes/:id

Update a recipe.

**Authentication:** `middleware.Authentication()`

**Authorization:**
- Owner (author) can edit their own recipe
- Users with `edit_recipe` permission can edit any recipe

**Request body:**
```json
{
  "title": "Pasta Carbonara",
  "description": "Classic Italian pasta",
  "preparation_time_min": 20,
  "servings": 4,
  "difficulty": "medium",
  "cuisine": "italian",
  "meal_type": "dinner",
  "image_url": "/images/carbonara.jpg",
  "calories": 550,
  "protein_g": 25.0,
  "carbs_g": 60.0,
  "fat_g": 22.0
}
```

**Response** `200 OK` — returns the updated recipe's id.

**Errors:**
| Status    | When                                            |
|-----------|-------------------------------------------------|
| 400       | Missing required fields or invalid values       |
| 401       | Unauthorized — missing or invalid JWT           |
| 403       | Forbidden — not the author and lacks permission |
| 404       | Recipe not found                                |

---

### DELETE /api/recipes/:id

Delete a recipe. Cascades: removes its favourites.

**Authentication:** `middleware.Authentication()`

**Authorization:**
- Owner (author) can delete their own recipe
- Users with `delete_recipe` permission can delete any recipe

**Response** `204 No Content`

**Errors:**
| Status    | When                                            |
|-----------|-------------------------------------------------|
| 401       | Unauthorized — missing or invalid JWT           |
| 403       | Forbidden — not the author and lacks permission |
| 404       | Recipe not found                                |

---

## Favourites

### POST /api/recipes/:id/favourite

Favourite a recipe for the current user.

**Request body:**
```json
{
  "user_id": "uuid"
}
```

**Response** `201 Created`
```json
{
  "message": "recipe favourited"
}
```

**Errors:**
| Status    | When                  |
|-----------|-----------------------|
| 400       | Already favourited    |
| 404       | Recipe not found      |

---

### DELETE /api/recipes/:id/favourite

Unfavourite a recipe.

**Request body:**
```json
{
  "user_id": "uuid"
}
```

**Response** `200 OK`
```json
{
  "message": "favourite removed"
}
```

**Errors:**
| Status    | When                          |
|-----------|-------------------------------|
| 404       | Recipe or favourite not found |

---

### GET /api/users/:id/favourites

Get all recipes a user has favourited.

**Response** `200 OK` — returns an array of recipe objects (same format as GET /api/recipes).

---

## Friendships

A friendship is a single row in the `friendship` table with `requester_id`, `receiver_id`, and `status` (`pending` or `accepted`). The pair is unique in both directions: if A has already sent a request to B, B cannot send one back — they accept the existing one instead.

### GET /api/friendships

List everyone the logged-in user has a friendship row with, bucketed by status.

**Requires:** Valid JWT in `token` cookie.

**Response** `200 OK`
```json
{
  "friends": [
    {
      "id": "uuid",
      "display_name": "jane_cooks",
      "name": "Jane",
      "is_online": true
    }
  ],
  "sent": [
    {
      "id": "uuid",
      "display_name": "bob_bakes",
      "name": "Bob"
    }
  ],
  "incoming": [
    {
      "id": "uuid",
      "display_name": "alice_eats",
      "name": "Alice"
    }
  ]
}
```

**Notes:**
- `friends` — accepted on either side. Includes `is_online` (true if `last_seen` is within the last 60 seconds).
- `sent` — pending requests the logged-in user sent. `is_online` is omitted.
- `incoming` — pending requests sent *to* the logged-in user. `is_online` is omitted.
- The other user's id is always returned as `id` regardless of which side of the row they are on.

**Errors:**
| Status    | When                                  |
|-----------|---------------------------------------|
| 401       | Unauthorized — missing or invalid JWT |
| 500       | Internal server error                 |

---

### POST /api/friendships

Send a friend request. The requester is the logged-in user; only the receiver's id is sent in the body.

**Requires:** Valid JWT in `token` cookie.

**Request body:**
```json
{
  "receiver_id": "uuid"
}
```

**Response** `201 Created`
```json
{
  "status": "pending"
}
```

**Notes:**
- The receiver becomes friends only after they call `PATCH /api/friendships/:id`.
- Duplicates are rejected in either direction — if B already sent A a request, A cannot send one back. The frontend should call `PATCH` to accept instead.

**Errors:**
| Status    | When                                                    |
|-----------|---------------------------------------------------------|
| 400       | Missing `receiver_id`, self-request, or already exists  |
| 401       | Unauthorized — missing or invalid JWT                   |
| 404       | Receiver not found (unknown id or malformed UUID)       |
| 500       | Internal server error                                   |

---

### PATCH /api/friendships/:id

Accept an incoming friend request. `:id` is the **requester's** user id (the user who originally sent the pending request); the receiver is the logged-in user.

**Requires:** Valid JWT in `token` cookie.

**Body:** none

**Response** `200 OK`
```json
{
  "status": "accepted"
}
```

**Notes:**
- Only the receiver can flip a request to accepted — the SQL pins `receiver_id` to the caller, so users cannot accept their own outgoing requests.
- Idempotent on already-accepted rows: a second call returns `404` because the `WHERE status = 'pending'` filter no longer matches.

**Errors:**
| Status    | When                                                  |
|-----------|-------------------------------------------------------|
| 400       | `:id` equals the caller's id (cannot accept own)      |
| 401       | Unauthorized — missing or invalid JWT                 |
| 404       | No pending request from `:id` to the caller           |
| 500       | Internal server error                                 |

---

### DELETE /api/friendships/:id

Remove the friendship row between the logged-in user and `:id`. One endpoint covers three product actions; the server decides based on the row's current status:

- **Cancel** an outgoing request — caller is the requester on a `pending` row.
- **Deny** an incoming request — caller is the receiver on a `pending` row.
- **Unfriend** — row is `accepted`; either side may call.

The frontend passes the intended UI action as a query parameter: `?action=cancel`, `?action=reject`, or `?action=unfriend`.

**Requires:** Valid JWT in `token` cookie.

**Body:** none

**Response** `200 OK`
```json
{
  "status": "deleted"
}
```

**Notes:**
- The pair is symmetric: the SQL matches the row regardless of which side the caller is on, so the frontend never needs to know who originally sent the request.
- Internally the handler reads the row's status and dispatches to one of two repository functions (`DeleteFriendRequest` for `pending`, `DeleteFriendship` for `accepted`). This keeps the two states strictly separated so a stale UI cannot accidentally unfriend an accepted pair by hitting the cancel path or vice versa.
- After deletion either user may send a fresh request — there is no cooldown.

**Errors:**
| Status    | When                                                  |
|-----------|-------------------------------------------------------|
| 400       | `:id` equals the caller's id                          |
| 401       | Unauthorized — missing or invalid JWT                 |
| 404       | No friendship row between caller and `:id`            |
| 500       | Internal server error                                 |

---

## Implementation Status

| Endpoint                          | Status    |
|-----------------------------------|-----------|
| GET /api/users                    | done      |
| GET /api/users/me                 | done      |
| GET /api/users/avatar             | done      |
| GET /api/users/search?q=          | done      |
| GET /api/users/:id                | done      |
| POST /api/users                   | done      |
| PUT /api/users/me/heartbeat       | done      |
| PUT /api/users/:id                | done      |
| DELETE /api/users/:id             | done      |
| GET /api/recipes                  | done      |
| GET /api/recipes/image-signature  | done      |
| GET /api/recipes/search           | done      |
| GET /api/recipes/:id              | done      |
| POST /api/recipes                 | TODO      |
| PUT /api/recipes/:id              | TODO      |
| DELETE /api/recipes/:id           | done      |
| GET /api/auth/session             | done      |
| GET /api/auth/google/login        | done      |
| GET /api/auth/google/callback     | done      |
| POST /api/auth/login              | done      |
| POST /api/auth/logout             | done      |
| GET /api/friendships              | done      |
| POST /api/friendships             | done      |
| PATCH /api/friendships/:id        | done      |
| DELETE /api/friendships/:id       | done      |
