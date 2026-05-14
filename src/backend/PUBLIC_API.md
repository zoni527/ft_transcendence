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
- Sensitive operations (creating/updating/deleting) require a valid API key with the appropriate scope.
- For additional protection, clients should call the API over HTTPS in production.

## Rate Limiting

Requests are rate-limited per API key. If the limit is exceeded, the server responds with `429 Too Many Requests` and the following headers:

| Header                    | Description                                   |
|---------------------------|-----------------------------------------------|
| `X-RateLimit-Limit`       | Max requests per window                       |
| `X-RateLimit-Remaining`   | Requests left in current window               |
| `X-RateLimit-Reset`       | Seconds until the window resets               |

The exact window size and quota are configurable; the default should be conservative for public usage.

## Endpoint Summary

| HTTP Method & URL         | What it maps to in SQL               | What it does for the user                                     |
|---------------------------|--------------------------------------|---------------------------------------------------------------|
| `GET /api/v1/recipes`        | `SELECT * FROM recipe`               | Fetches a list of recipes (This is your search feature!)   |
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

Description: Fetch a paginated list of recipes. This endpoint can accept common query parameters to filter, sort, and paginate results (e.g., `cuisine`, `meal_type`, `difficulty`, `sort`, `order`, `page`, `limit`).

Response `200 OK` — array of recipe objects (see `API.md` Recipes section for the full response shape).

Errors: `400` for invalid query params, `429` rate limit exceeded, `500` server error.

### GET /api/v1/recipes/:id

SQL:

```
SELECT * FROM recipe WHERE id = $1
```

Description: Fetch the full details for a single recipe by `id`.

Response `200 OK` — recipe object.

Errors: `404` recipe not found, `429` rate limit exceeded, `500` server error.

### POST /api/v1/recipes

SQL:

```
INSERT INTO recipe (title, description, ...) VALUES (...) RETURNING id
```

Description: Create a new recipe. Requires a valid `X-API-Key` header and the key must have the `create_recipe` scope.

Request body: JSON object with recipe fields (title, description, preparation_time_min, servings, difficulty, cuisine, meal_type, image_url, calories, protein_g, carbs_g, fat_g, ...).

Response `201 Created` — returns the created recipe's `id`.

Errors: `400` missing/invalid fields, `401` invalid API key, `403` insufficient scope, `429` rate limit exceeded.

### PUT /api/v1/recipes/:id

SQL:

```
UPDATE recipe SET title = $1, description = $2, ... WHERE id = $N
```

Description: Update an existing recipe. Requires a valid `X-API-Key` header. The API key must have `edit_recipe` scope, or the request must be performed by the recipe owner (when authenticated as a user).

Request body: JSON object with fields to update. Partial updates are supported; omitted fields remain unchanged.

Response `200 OK` — returns the updated recipe's id or full object (implementation-defined).

Errors: `400` invalid input, `401` invalid API key, `403` forbidden, `404` not found, `429` rate limit exceeded.

### DELETE /api/v1/recipes/:id

SQL:

```
DELETE FROM recipe WHERE id = $1
```

Description: Permanently remove a recipe. Requires `X-API-Key` with `delete_recipe` scope or appropriate authenticated permissions.

Response `204 No Content` on success.

Errors: `401` invalid API key, `403` forbidden, `404` not found, `429` rate limit exceeded.

## Notes on Scopes & Key Management

- Keys should be issued with scopes such as `read_recipes`, `create_recipe`, `edit_recipe`, and `delete_recipe` so you can enforce least privilege.
- Admin or management endpoints for issuing/revoking keys should be internal (not part of this public doc).

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

