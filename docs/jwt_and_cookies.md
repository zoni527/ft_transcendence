# JWT and Cookies

## Quick idea

- JWT is the identity card.
- Cookie is the envelope that carries the identity card automatically in browser requests.

The backend creates the JWT, then stores it in a cookie called `token`.

## What is a JWT?

A JWT (JSON Web Token) is a signed string.

In this project, the token includes at least:
- `sub`: user id
- `exp`: expiration time
- `iat`: issued-at time

The backend signs it with `JWT_SECRET`.

## How to generate JWT_SECRET

Create a strong random key with OpenSSL:

```bash
openssl rand -base64 32
```

Copy the output value into your environment as `JWT_SECRET`.

Example:

```env
JWT_SECRET=PASTE_GENERATED_VALUE_HERE
```

How this key is used in this project:
- On startup, `config.Load()` reads `JWT_SECRET` from env into `cfg.JWTSecret`.
- In `main.go`, the backend passes that value to `authorization.InitJWTSecret(cfg.JWTSecret)`.
- On signup/login, backend uses the initialized JWT secret to sign JWTs.
- On protected routes, backend uses the same initialized key to validate JWT signatures.

## What is the cookie used for?

After signup or login, backend sends:
- `Set-Cookie: token=...`

The browser stores this cookie and sends it back automatically on next requests to backend (if frontend request uses credentials and CORS allows it).

Current cookie behavior in this project:
- Name: `token`
- Path: `/`
- HttpOnly: true
- SameSite: Lax
- Max-Age: 3600 seconds
- Secure: false (temporary for local development)

## Login and signup flow

1. User signs up (`POST /api/users`) or logs in (`POST /api/users/login`).
2. Backend validates input/credentials.
3. Backend creates JWT.
4. Backend sends JWT in `token` cookie.
5. Browser stores cookie.

## Protected route flow

Example route:
- `GET /api/users/me`

Flow:
1. Browser sends `token` cookie.
2. `AuthMiddleware` reads cookie.
3. Backend validates JWT signature and claims.
4. Middleware puts authenticated user id into Gin context as `userID`.
5. Handler uses `userID` to load user data from database.

## Why frontend must use credentials include

Frontend and backend are different origins (`5173` and `8080`).
For browser to include cookies in cross-origin requests, frontend must set:

```ts
fetch(url, { credentials: 'include' })
```

Without this, cookie-based auth can fail even if backend sends `Set-Cookie`.
