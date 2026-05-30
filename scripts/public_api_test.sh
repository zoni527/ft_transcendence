#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-https://localhost:8443}"
LOGIN_EMAIL="${LOGIN_EMAIL:-eve@test.com}"
LOGIN_PASSWORD="${LOGIN_PASSWORD:-12345678}"
API_KEY_FILE="${PUBLIC_API_KEY_FILE:-$HOME/.cache/ft_transcendence/public_api_key.txt}"
CA_CERT="${CA_CERT:-$(pwd)/certs/ca.crt}"

COOKIE_JAR="$(mktemp)"
WORK_DIR="$(mktemp -d)"

cleanup() {
  rm -f "$COOKIE_JAR"
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

request() {
  local output_file="$1"
  shift
  sleep "${PUBLIC_API_PAUSE_SECONDS:-1}"
  local curl_args=( -sS --cacert "$CA_CERT" -o "$output_file" -w '%{http_code}' )
  curl "${curl_args[@]}" "$@"
}

assert_status() {
  local actual="$1"
  local expected="$2"
  local label="$3"
  local body_file="${4:-}"

  if [[ "$actual" != "$expected" ]]; then
    printf 'FAIL: %s (expected %s, got %s)\n' "$label" "$expected" "$actual" >&2
    if [[ -n "$body_file" && -f "$body_file" ]]; then
      printf 'Response body:\n' >&2
      cat "$body_file" >&2
      printf '\n' >&2
    fi
    exit 1
  fi

  printf 'PASS: %s (%s)\n' "$label" "$actual"
}

json_get() {
  local file_path="$1"
  local expression="$2"

  python3 - "$@" <<'PY'
import json
import sys

file_path = sys.argv[1]
expression = sys.argv[2]

with open(file_path, 'r', encoding='utf-8') as handle:
    data = json.load(handle)

if expression == 'id':
    print(data['id'])
elif expression == 'first_recipe_id':
    print(data[0]['id'])
elif expression == 'first_foreign_recipe_id':
    owner_id = sys.argv[3]
    for recipe in data:
        if recipe['author']['id'] != owner_id:
            print(recipe['id'])
            break
    else:
        raise SystemExit('no recipe found that is owned by another user')
else:
    raise SystemExit(f'unknown expression: {expression}')
PY
}

login_payload="$WORK_DIR/login.json"
cat >"$login_payload" <<JSON
{"email":"$LOGIN_EMAIL","password":"$LOGIN_PASSWORD"}
JSON

login_response="$WORK_DIR/login-response.json"
status_code="$(request "$login_response" \
  -c "$COOKIE_JAR" \
  -b "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -d @"$login_payload" \
  "$BASE_URL/api/auth/login")"
# Expect 200 (OK): login should succeed for the seeded user and return session cookie
assert_status "$status_code" 200 'login with seeded user' "$login_response"

if ! grep -q 'token' "$COOKIE_JAR"; then
  printf 'FAIL: login did not store the auth cookie\n' >&2
  exit 1
fi
printf 'PASS: auth cookie stored\n'

eve_user_id="$(json_get "$login_response" id)"
printf 'Logged in as %s\n' "$LOGIN_EMAIL"

api_key_response="$WORK_DIR/api-key-response.json"
status_code="$(request "$api_key_response" \
  -c "$COOKIE_JAR" \
  -b "$COOKIE_JAR" \
  -X POST \
  "$BASE_URL/api/users/apikey")"
if [[ "$status_code" == 201 ]]; then
  api_key="$(python3 - "$api_key_response" <<'PY'
import json
import sys

with open(sys.argv[1], 'r', encoding='utf-8') as handle:
    print(json.load(handle))
PY
  )"
  mkdir -p "$(dirname "$API_KEY_FILE")"
  printf '%s\n' "$api_key" >"$API_KEY_FILE"
  assert_status "$status_code" 201 'request API key' "$api_key_response"
elif [[ "$status_code" == 429 && -s "$API_KEY_FILE" ]]; then
  api_key="$(<"$API_KEY_FILE")"
  printf 'WARN: API key issuance is rate-limited; reusing cached key from %s\n' "$API_KEY_FILE"
else
  printf 'FAIL: request API key (expected 201, got %s)\n' "$status_code" >&2
  exit 1
fi

printf 'PASS: API key received\n'

sleep "${PUBLIC_API_INITIAL_PAUSE_SECONDS:-6}"

no_key_response="$WORK_DIR/no-key.json"
# Expect 401 (Unauthorized): requests without an API key must be rejected
status_code="$(request "$no_key_response" \
  -H 'X-Forwarded-For: 203.0.113.42' \
  "$BASE_URL/api/v1/recipes")"
assert_status "$status_code" 401 'GET /api/v1/recipes without API key' "$no_key_response"

bad_key_response="$WORK_DIR/bad-key.json"
# Expect 401 (Unauthorized): invalid API keys must be rejected
status_code="$(request "$bad_key_response" \
  -H 'X-API-Key: invalid.key' \
  "$BASE_URL/api/v1/recipes")"
assert_status "$status_code" 401 'GET /api/v1/recipes with invalid API key' "$bad_key_response"

recipes_response="$WORK_DIR/recipes.json"
# Expect 200 (OK): valid API key returns the list of recipes
status_code="$(request "$recipes_response" \
  -H "X-API-Key: $api_key" \
  "$BASE_URL/api/v1/recipes")"
assert_status "$status_code" 200 'GET /api/v1/recipes with valid API key' "$recipes_response"

first_recipe_id="$(json_get "$recipes_response" first_recipe_id)"
foreign_recipe_id="$(json_get "$recipes_response" first_foreign_recipe_id "$eve_user_id")"

single_recipe_response="$WORK_DIR/single-recipe.json"
# Expect 200 (OK): fetching an existing recipe by ID should succeed
status_code="$(request "$single_recipe_response" \
  -H "X-API-Key: $api_key" \
  "$BASE_URL/api/v1/recipes/$first_recipe_id")"
assert_status "$status_code" 200 'GET /api/v1/recipes/:id with valid API key' "$single_recipe_response"

missing_recipe_response="$WORK_DIR/missing-recipe.json"
# Expect 404 (Not Found): requesting a recipe with an unknown UUID
status_code="$(request "$missing_recipe_response" \
  -H "X-API-Key: $api_key" \
  "$BASE_URL/api/v1/recipes/00000000-0000-0000-0000-000000000000")"
assert_status "$status_code" 404 'GET /api/v1/recipes/:id with unknown UUID' "$missing_recipe_response"

invalid_post_payload="$WORK_DIR/invalid-post.json"
cat >"$invalid_post_payload" <<'JSON'
{}
JSON

invalid_post_response="$WORK_DIR/invalid-post-response.json"
# Expect 400 (Bad Request): POST with invalid payload should be rejected
status_code="$(request "$invalid_post_response" \
  -H "X-API-Key: $api_key" \
  -H 'Content-Type: application/json' \
  -d @"$invalid_post_payload" \
  "$BASE_URL/api/v1/recipes")"
assert_status "$status_code" 400 'POST /api/v1/recipes with invalid payload' "$invalid_post_response"

create_payload="$WORK_DIR/create.json"
cat >"$create_payload" <<'JSON'
{
  "title": "Curl Smoke Recipe",
  "description": "Step 1: Prepare a smoke-test recipe.\nStep 2: Verify the backend returns the expected status codes.",
  "preparation_time_min": 15,
  "servings": 2,
  "difficulty": "easy",
  "cuisine": "test",
  "meal_type": "dinner",
  "image_url": "https://example.com/image.jpg",
  "calories": 120,
  "protein_g": 4.5,
  "carbs_g": 18.0,
  "fat_g": 3.0
}
JSON

create_response="$WORK_DIR/create-response.json"
# Expect 201 (Created): valid POST should create a recipe
status_code="$(request "$create_response" \
  -H "X-API-Key: $api_key" \
  -H 'Content-Type: application/json' \
  -d @"$create_payload" \
  "$BASE_URL/api/v1/recipes")"
assert_status "$status_code" 201 'POST /api/v1/recipes with valid payload' "$create_response"

created_recipe_id="$(json_get "$create_response" id)"

invalid_put_payload="$WORK_DIR/invalid-put.json"
cat >"$invalid_put_payload" <<'JSON'
{}
JSON

invalid_put_response="$WORK_DIR/invalid-put-response.json"
# Expect 400 (Bad Request): PUT with an invalid payload should be rejected
status_code="$(request "$invalid_put_response" \
  -H "X-API-Key: $api_key" \
  -H 'Content-Type: application/json' \
  -X PUT \
  -d @"$invalid_put_payload" \
  "$BASE_URL/api/v1/recipes/$created_recipe_id")"
assert_status "$status_code" 400 'PUT /api/v1/recipes/:id with invalid payload' "$invalid_put_response"

update_payload="$WORK_DIR/update.json"
cat >"$update_payload" <<'JSON'
{
  "title": "Curl Smoke Recipe Updated",
  "description": "Step 1: Update the recipe.\nStep 2: Confirm the backend accepts the change.",
  "preparation_time_min": 20,
  "servings": 3,
  "difficulty": "medium",
  "cuisine": "test",
  "meal_type": "lunch",
  "image_url": "https://example.com/image-updated.jpg",
  "calories": 180,
  "protein_g": 5.0,
  "carbs_g": 22.0,
  "fat_g": 6.0
}
JSON

update_response="$WORK_DIR/update-response.json"
# Expect 200 (OK): valid PUT should update the recipe
status_code="$(request "$update_response" \
  -H "X-API-Key: $api_key" \
  -H 'Content-Type: application/json' \
  -X PUT \
  -d @"$update_payload" \
  "$BASE_URL/api/v1/recipes/$created_recipe_id")"
assert_status "$status_code" 200 'PUT /api/v1/recipes/:id with valid payload' "$update_response"

forbidden_put_response="$WORK_DIR/forbidden-put.json"
# Expect 403 (Forbidden): updating another user's recipe should be forbidden
status_code="$(request "$forbidden_put_response" \
  -H "X-API-Key: $api_key" \
  -H 'Content-Type: application/json' \
  -X PUT \
  -d @"$update_payload" \
  "$BASE_URL/api/v1/recipes/$foreign_recipe_id")"
assert_status "$status_code" 403 'PUT /api/v1/recipes/:id for another user' "$forbidden_put_response"

forbidden_delete_response="$WORK_DIR/forbidden-delete.json"
# Expect 403 (Forbidden): deleting another user's recipe should be forbidden
status_code="$(request "$forbidden_delete_response" \
  -H "X-API-Key: $api_key" \
  -X DELETE \
  "$BASE_URL/api/v1/recipes/$foreign_recipe_id")"
assert_status "$status_code" 403 'DELETE /api/v1/recipes/:id for another user' "$forbidden_delete_response"

missing_delete_response="$WORK_DIR/missing-delete.json"
# Expect 404 (Not Found): deleting a non-existent recipe should return 404
status_code="$(request "$missing_delete_response" \
  -H "X-API-Key: $api_key" \
  -X DELETE \
  "$BASE_URL/api/v1/recipes/00000000-0000-0000-0000-000000000000")"
assert_status "$status_code" 404 'DELETE /api/v1/recipes/:id with unknown UUID' "$missing_delete_response"

delete_response="$WORK_DIR/delete-response.json"
# Expect 204 (No Content): successful delete returns no body
status_code="$(request "$delete_response" \
  -H "X-API-Key: $api_key" \
  -X DELETE \
  "$BASE_URL/api/v1/recipes/$created_recipe_id")"
assert_status "$status_code" 204 'DELETE /api/v1/recipes/:id with valid ownership' "$delete_response"

printf '\nAll public API checks passed.\n'