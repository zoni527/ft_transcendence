# API Reference

Base URL: `http://localhost:8080`

> **TODO:** Switch to HTTPS (required by subject).

## Authentication

> **TODO:** API key middleware not implemented yet. Spec below describes target behavior.

All API requests require an API key in the header:

```
X-API-Key: your_api_key_here
```

Requests without a valid API key will receive `401 Unauthorized`.

## Rate Limiting

> **TODO:** Rate limiting middleware not implemented yet. Spec below describes target behavior.

Requests are rate-limited per API key. If you exceed the limit, the server responds with `429 Too Many Requests`.

| Header                  | Description                     |
| ----------------------- | ------------------------------- |
| `X-RateLimit-Limit`     | Max requests per window         |
| `X-RateLimit-Remaining` | Requests left in current window |
| `X-RateLimit-Reset`     | Seconds until the window resets |

## Common Error Responses

All errors return JSON in this format:

```json
{
  "error": "description of what went wrong"
}
```

| Status | Meaning                                   |
| ------ | ----------------------------------------- |
| 400    | Bad request — invalid or missing data     |
| 401    | Unauthorized — missing or invalid API key |
| 404    | Not found — resource does not exist       |
| 429    | Too many requests — rate limit exceeded   |
| 500    | Internal server error                     |

---

## Users

### GET /api/users

Get all users.

**Query parameters (optional):**
| Param | Type | Description |
|-------|-------|---------------------------------------------------|
| page | int | Page number for pagination (default: 1) — TODO |
| limit | int | Results per page (default: 20) — TODO |

**Response** `200 OK`

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane",
    "display_name": "jane_cooks",
    "created_at": "2026-04-09T12:00:00Z",
    "updated_at": "2026-04-09T12:00:00Z",
    "roles": ["user"]
  }
]
```

---

### GET /api/users/search?q=

Search users by name or display name. Useful for the "Add Friend" feature.

**Query parameters:**
| Param | Type | Description |
|-------|-----------|-----------------------------------------------|
| q | string | Search term (matches name or display_name) |

**Response** `200 OK`

```json
[
  {
    "id": "uuid",
    "name": "Jane",
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
  "created_at": "2026-04-09T12:00:00Z",
  "updated_at": "2026-04-09T12:00:00Z",
  "roles": ["user"]
}
```

**Errors:**
| Status | When |
|-----------|-------------------|
| 404 | User not found |

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
  "created_at": "2026-04-09T12:00:00Z",
  "updated_at": "2026-04-09T12:00:00Z",
  "roles": ["user"]
}
```

**Errors:**
| Status | When |
|-----------|-------------------------------------------|
| 400 | Missing required fields or invalid data |
| 422 | Password is too weak |
| 409 | Email already exists |

---

### PUT /api/users/:id

Update a user profile. Requires authentication.

**Authentication:** JWT token in `token` cookie

**Permissions:**

- A user can update their own profile
- A user can change their own password
- An admin can update any user's profile fields
- An admin can update roles
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
  "avatar_url": "https://example.com/avatar.png",
  "created_at": "2026-04-09T12:00:00Z",
  "updated_at": "2026-04-09T12:00:00Z",
  "roles": ["user", "admin"]
}
```

**Errors:**
| Status | When |
|-----------|-------------------------------------------------------------------|
| 400 | Invalid input data, missing payload fields, or invalid values |
| 401 | Unauthorized — invalid or missing token |
| 403 | Forbidden — caller is not allowed to change the requested fields |
| 422 | Password is too weak |
| 409 | Email already exists (taken by another user) |
| 500 | Internal server error |

---

### DELETE /api/users/:id

Delete a user. Cascades: removes their roles and favourites. Recipes they authored keep existing with `author_id` set to NULL.

**Response** `200 OK`

```json
{
  "message": "user deleted"
}
```

**Errors:**
| Status | When |
|-----------|---------------------------|
| 404 | User not found |

---

### POST /api/users/login

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
| Status | When |
|-----------|---------------------------|
| 400 | Missing email or password |
| 401 | Invalid credentials |

---

### POST /api/users/logout

Log out the current authenticated user. Clears the authentication cookie.

**Requires:** Valid JWT in `token` cookie (set during login).

**Response** `200 OK`

```json
{
  "message": "logged out successfully"
}
```

**Errors:**
| Status | When |
|-----------|---------------------------------------|
| 401 | Unauthorized — missing or invalid JWT |

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
  "created_at": "2026-04-09T12:00:00Z",
  "updated_at": "2026-04-09T12:00:00Z",
  "roles": ["user"]
}
```

**Errors:**
| Status | When |
|-----------|---------------------------------------|
| 401 | Unauthorized — missing or invalid JWT |
| 404 | User not found |

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
| Status | When |
|--------|---------------------------------------|
| 401 | Unauthorized — missing or invalid JWT |
| 500 | Internal server error |

### GET /api/users/session

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
| Status | When |
|-----------|---------------------------------------|
| 401 | Unauthorized — missing or invalid JWT |
| 500 | Failed to generate signature |

---

## Recipes

### GET /api/recipes

Get all recipes.

**Query parameters (optional):**
| Param | Type | Description |
|---------------|-----------|---------------------------------------------------------------|
| cuisine | string | Filter by cuisine (e.g. "italian") |
| meal_type | string | Filter by meal type (breakfast/lunch/dinner/snack) |
| difficulty | string | Filter by difficulty (easy/medium/hard) |
| sort | string | Sort by field (e.g. "created_at", "title", "calories") — TODO |
| order | string | Sort order: "asc" or "desc" (default: "desc") — TODO |
| page | int | Page number for pagination (default: 1) — TODO |
| limit | int | Results per page (default: 20) — TODO |

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
| Status | When |
|-----------|-------------------|
| 404 | Recipe not found |

---

### POST /api/recipes

Create a new recipe.

**Authentication/Authorization:**

- Requires a valid JWT in the authentication cookie.
- Requires the `create_recipe` permission.
- Returns `401 Unauthorized` if the JWT cookie is missing or invalid.
- Returns `403 Forbidden` if the authenticated user does not have the `create_recipe` permission.

**Request body:**

```json
{
  "author_id": "uuid",
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

**Response** `201 Created` — returns the created recipe's id.

**Errors:**
| Status | When |
|-----------|-----------------------------------------------------------------------|
| 400 | Missing required fields (title, author_id) |
| 400 | Invalid difficulty or meal_type value |
| 400 | Negative or zero numeric fields (servings, preparation_time, etc.) |

---

### GET /api/recipes/image-signature

Get a pre-signed Cloudinary signature for uploading recipe images. Required for secure client-side image uploads.

**Requires:** Valid JWT in `token` cookie (set during login).

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
| Status | When |
|-----------|---------------------------------------|
| 401 | Unauthorized — missing or invalid JWT |
| 500 | Failed to generate signature |

---

### POST /api/recipes/:id/image

Upload an image for a recipe. Uses multipart form data.

**Request:** `multipart/form-data` with field `image` (JPEG, PNG, max 5MB).

**Response** `200 OK`

```json
{
  "image_url": "/images/recipes/uuid.jpg"
}
```

**Errors:**
| Status | When |
|-----------|-----------------------------------------------|
| 400 | No file, wrong format, or exceeds size limit |
| 404 | Recipe not found |

---

### PUT /api/recipes/:id

Replace a recipe completely. All fields are required.

**Request body:** same as POST /api/recipes (without author_id, which cannot be changed).

**Response** `200 OK` — returns the updated recipe.

**Errors:**
| Status | When |
|-----------|-------------------------------------------|
| 400 | Missing required fields or invalid values |
| 404 | Recipe not found |

---

### DELETE /api/recipes/:id

Delete a recipe. Cascades: removes its favourites.

**Response** `204 No Content`

**Errors:**
| Status | When |
|-----------|-------------------|
| 404 | Recipe not found |

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
| Status | When |
|-----------|-----------------------|
| 400 | Already favourited |
| 404 | Recipe not found |

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
| Status | When |
|-----------|-------------------------------|
| 404 | Recipe or favourite not found |

---

### GET /api/users/:id/favourites

Get all recipes a user has favourited.

**Response** `200 OK` — returns an array of recipe objects (same format as GET /api/recipes).

---

## Implementation Status

| Endpoint                          | Status |
| --------------------------------- | ------ |
| GET /api/users                    | done   |
| GET /api/users/:id                | done   |
| POST /api/users/login             | done   |
| POST /api/users/logout            | done   |
| GET /api/users/me                 | done   |
| GET /api/users/session            | done   |
| PUT /api/users/me/heartbeat       | done   |
| GET /api/users/search?q=          | TODO   |
| POST /api/users                   | TODO   |
| PUT /api/users/:id                | TODO   |
| DELETE /api/users/:id             | TODO   |
| GET /api/recipes                  | done   |
| GET /api/recipes/:id              | done   |
| GET /api/recipes/image-signature  | done   |
| POST /api/recipes                 | TODO   |
| POST /api/recipes/:id/image       | TODO   |
| PUT /api/recipes/:id              | TODO   |
| DELETE /api/recipes/:id           | done   |
| POST /api/recipes/:id/favourite   | TODO   |
| DELETE /api/recipes/:id/favourite | TODO   |
| GET /api/users/:id/favourites     | TODO   |
