# Public API

## Overview

Major requirements for the public API:
- Secured by an API key (see **Security**)
- Rate limiting per API key (see **Rate Limiting**)
- Documentation for each endpoint (this file)
- At least five endpoints: `GET`, `POST`, `PUT`, `DELETE` (listed below)

## Security

Public clients must supply an API key with each request using the `X-API-Key` header. Example:

```
X-API-Key: your_public_api_key_here
```

Notes:
- API keys are issued per-client and can be revoked.
- Sensitive operations (creating/updating/deleting) require a valid API key.
- For additional protection, clients should call the API over HTTPS in production.

## Rate Limiting

Requests are rate-limited per API key. If the limit is exceeded, the server responds with `429 Too Many Requests`

The exact window size and quota are configurable; the default should be conservative for public usage.

## Endpoint Summary

| HTTP Method & URL            | What it maps to in SQL               | What it does for the user                                  |
|------------------------------|--------------------------------------|------------------------------------------------------------|
| `GET /api/v1/recipes`        | `SELECT * FROM recipe`               | Fetches a list of recipes                                  |
| `GET /api/v1/recipes/:id`    | `SELECT * FROM recipe WHERE id = $1` | Fetches the full details of one specific recipe.           |
| `POST /api/v1/recipes`       | `INSERT INTO recipe ...`             | Creates a brand new recipe in the system.                  |
| `PUT /api/v1/recipes/:id`    | `UPDATE recipe SET ...`              | Replaces or updates the information of an existing recipe. |
| `DELETE /api/v1/recipes/:id` | `DELETE FROM recipe WHERE id = $1`   | Removes a recipe from the database permanently.            |

## Detailed Endpoints

### GET /api/v1/recipes

SQL:

```
SELECT * FROM recipe
```

Description: Fetch all recipes.

**Response** `200 OK` - returns an array of recipe objects. See `API.md` Recipes section for the full response shape 

**Errors:**
| Status | When                |
|--------|---------------------|
| 429    | Rate limit exceeded |
| 500    | Server error        |

---

### GET /api/v1/recipes/:id

SQL:

```
SELECT * FROM recipe WHERE id = $1
```

Description: Fetch the full details for a single recipe by `id`.

Response `200 OK` — recipe object.

**Errors:**
| Status    | When                  |
|-----------|-----------------------|
| 404       | Recipe not found      |
| 500       | Internal server error |

---

### POST /api/v1/recipes

SQL:

```
INSERT INTO recipe (title, description, ...) VALUES (...) RETURNING id
```

Description: Create a new recipe.

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

Response `201 Created` — returns the created recipe's `id`.

**Errors:**
| Status    | When                    |
|-----------|-------------------------|
| 400       | Missing/invalid fields  |
| 401       | Invalid API key         |
| 500       | Internal server error   |

---

### PUT /api/v1/recipes/:id

SQL:

```
UPDATE recipe SET title = $1, description = $2, ... WHERE id = $N
```

Description: Update an existing recipe

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

Response `200 OK` — returns the updated recipe's `id`.

**Errors:**
| Status    | When                    |
|-----------|-------------------------|
| 400       | Missing/invalid fields  |
| 401       | Invalid API key         |
| 403       | Forbidden               |
| 404       | Recipe not found        |
| 500       | Internal server error   |

---

### DELETE /api/v1/recipes/:id

SQL:

```
DELETE FROM recipe WHERE id = $1
```

Description: Permanently remove a recipe.

Response `204 No Content` on success.

**Errors:**
| Status    | When                    |
|-----------|-------------------------|
| 401       | Invalid API key         |
| 403       | Forbidden               |

---

## Documentation and Discoverability

This `PUBLIC_API.md` file serves as the public documentation for third-party integrators. For more detailed internal behavior and authenticated-only endpoints see `API.md`.

## Implementation Status

| Endpoint                     | Status  |
|------------------------------|---------|
| `GET /api/v1/recipes`        | planned |
| `GET /api/v1/recipes/:id`    | planned |
| `POST /api/v1/recipes`       | planned |
| `PUT /api/v1/recipes/:id`    | planned |
| `DELETE /api/v1/recipes/:id` | planned |

