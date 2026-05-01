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

| Header | Description |
|---|---|
| `X-RateLimit-Limit` | Max requests per window |
| `X-RateLimit-Remaining` | Requests left in current window |
| `X-RateLimit-Reset` | Seconds until the window resets |

## Common Error Responses

All errors return JSON in this format:

```json
{
  "error": "description of what went wrong"
}
```

| Status | Meaning |
|---|---|
| 400 | Bad request — invalid or missing data |
| 401 | Unauthorized — missing or invalid API key |
| 404 | Not found — resource does not exist |
| 429 | Too many requests — rate limit exceeded |
| 500 | Internal server error |

---

## Users

### GET /api/users

Get all users.

**Query parameters (optional):**
| Param | Type | Description |
|---|---|---|
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
|---|---|---|
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
|---|---|
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
|---|---|
| 400 | Missing required fields or invalid data |
| 409 | Email already exists |

---

### PUT /api/users/:id

Replace a user completely. All fields are required.

**Request body:**
```json
{
  "email": "user@example.com",
  "name": "Jane",
  "display_name": "jane_cooks"
}
```

**Response** `200 OK` — returns the updated user.

**Errors:**
| Status | When |
|---|---|
| 400 | Missing required fields |
| 404 | User not found |

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
|---|---|
| 404 | User not found |

---

## Recipes

### GET /api/recipes

Get all published recipes.

> **Future:** Once auth + roles are implemented, admins can use `?include_drafts=true` to see unpublished recipes. Authors will be able to see their own drafts via `GET /api/users/:id/recipes`.

**Query parameters (optional):**
| Param | Type | Description |
|---|---|---|
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
    "author_id": "uuid",
    "title": "Pasta Carbonara",
    "description": "Classic Italian pasta",
    "prep_time_min": 10,
    "cook_time_min": 20,
    "servings": 4,
    "difficulty": "medium",
    "cuisine": "italian",
    "meal_type": "dinner",
    "image_url": "/images/carbonara.jpg",
    "calories": 550,
    "protein_g": 25.0,
    "carbs_g": 60.0,
    "fat_g": 22.0,
    "is_published": true,
    "created_at": "2026-04-09T12:00:00Z",
    "updated_at": "2026-04-09T12:00:00Z"
  }
]
```

---

### GET /api/recipes/:id

Get a single recipe by ID, including its steps and ingredients.

> **TODO:** Currently returns only the base recipe fields. Steps and ingredients are not yet included in the response.

**Response** `200 OK`
```json
{
  "id": "uuid",
  "author_id": "uuid",
  "title": "Pasta Carbonara",
  "description": "Classic Italian pasta",
  "prep_time_min": 10,
  "cook_time_min": 20,
  "servings": 4,
  "difficulty": "medium",
  "cuisine": "italian",
  "meal_type": "dinner",
  "image_url": "/images/carbonara.jpg",
  "calories": 550,
  "protein_g": 25.0,
  "carbs_g": 60.0,
  "fat_g": 22.0,
  "is_published": true,
  "created_at": "2026-04-09T12:00:00Z",
  "updated_at": "2026-04-09T12:00:00Z",
  "steps": [
    {
      "step_number": 1,
      "instruction": "Boil water and cook pasta",
      "media_url": null,
      "timer_seconds": 600
    }
  ],
  "ingredients": [
    {
      "name": "Spaghetti",
      "quantity": 400,
      "unit": "g",
      "sort_order": 1
    }
  ]
}
```

**Errors:**
| Status | When |
|---|---|
| 404 | Recipe not found |

---

### POST /api/recipes

Create a new recipe with steps and ingredients.

**Request body:**
```json
{
  "author_id": "uuid",
  "title": "Pasta Carbonara",
  "description": "Classic Italian pasta",
  "prep_time_min": 10,
  "cook_time_min": 20,
  "servings": 4,
  "difficulty": "medium",
  "cuisine": "italian",
  "meal_type": "dinner",
  "image_url": "/images/carbonara.jpg",
  "calories": 550,
  "protein_g": 25.0,
  "carbs_g": 60.0,
  "fat_g": 22.0,
  "steps": [
    {
      "step_number": 1,
      "instruction": "Boil water and cook pasta",
      "media_url": null,
      "timer_seconds": 600
    }
  ],
  "ingredients": [
    {
      "ingredient_id": "uuid",
      "quantity": 400,
      "unit": "g",
      "sort_order": 1
    }
  ]
}
```

**Response** `201 Created` — returns the created recipe (same format as GET /api/recipes/:id).

**Errors:**
| Status | When |
|---|---|
| 400 | Missing required fields (title, author_id) |
| 400 | Invalid difficulty or meal_type value |
| 400 | Negative or zero numeric fields (servings, prep_time, etc.) |

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
|---|---|
| 400 | No file, wrong format, or exceeds size limit |
| 404 | Recipe not found |

---

### PUT /api/recipes/:id

Replace a recipe completely. All fields are required.

**Request body:** same as POST /api/recipes (without author_id, which cannot be changed).

**Response** `200 OK` — returns the updated recipe.

**Errors:**
| Status | When |
|---|---|
| 400 | Missing required fields or invalid values |
| 404 | Recipe not found |

---

### DELETE /api/recipes/:id

Delete a recipe. Cascades: removes its steps, ingredients, and favourites.

**Response** `204 No Content`

**Errors:**
| Status | When |
|---|---|
| 404 | Recipe not found |

---

## Ingredients

### GET /api/ingredients

Get all ingredients.

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Spaghetti",
    "category": "grains",
    "default_unit": "g"
  }
]
```

---

### POST /api/ingredients

Create a new ingredient.

**Request body:**
```json
{
  "name": "Spaghetti",
  "category_id": "uuid",
  "default_unit": "g"
}
```

**Response** `201 Created` — returns the created ingredient.

**Errors:**
| Status | When |
|---|---|
| 400 | Missing name |
| 409 | Ingredient name already exists |

---

## Ingredient Categories

### GET /api/ingredient-categories

Get all ingredient categories.

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Dairy",
    "description": "Milk, cheese, butter, etc.",
    "icon_url": "/icons/dairy.png"
  }
]
```

---

### POST /api/ingredient-categories

Create a new ingredient category.

**Request body:**
```json
{
  "name": "Dairy",
  "description": "Milk, cheese, butter, etc.",
  "icon_url": "/icons/dairy.png"
}
```

**Response** `201 Created`

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
|---|---|
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
|---|---|
| 404 | Recipe or favourite not found |

---

### GET /api/users/:id/favourites

Get all recipes a user has favourited.

**Response** `200 OK` — returns an array of recipe objects (same format as GET /api/recipes).

---

## Implementation Status

| Endpoint | Status |
|---|---|
| GET /api/users | done |
| GET /api/users/:id | done |
| GET /api/users/search?q= | TODO |
| POST /api/users | TODO |
| PUT /api/users/:id | TODO |
| DELETE /api/users/:id | TODO |
| GET /api/recipes | done |
| GET /api/recipes/:id | done |
| POST /api/recipes | TODO |
| POST /api/recipes/:id/image | TODO |
| PUT /api/recipes/:id | TODO |
| DELETE /api/recipes/:id | done |
| GET /api/ingredients | TODO |
| POST /api/ingredients | TODO |
| GET /api/ingredient-categories | TODO |
| POST /api/ingredient-categories | TODO |
| POST /api/recipes/:id/favourite | TODO |
| DELETE /api/recipes/:id/favourite | TODO |
| GET /api/users/:id/favourites | TODO |
