#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-https://localhost:8443}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
CA_CERT="${CA_CERT:-$SCRIPT_DIR/../certs/ca.crt}"

if [[ ! -f "$CA_CERT" ]]; then
	printf 'ERROR: CA certificate not found at %s\n' "$CA_CERT" >&2
	exit 1
fi

COOKIE_JAR="$(mktemp)"
WORK_DIR="$(mktemp -d)"

cleanup() {
	if [[ -n "${SMOKE_USER_ID:-}" ]]; then
		curl -sS --cacert "$CA_CERT" -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
			-o /dev/null -w '%{http_code}' \
			-X DELETE "$BASE_URL/api/users/$SMOKE_USER_ID" >/dev/null 2>&1 || true
	fi
	rm -f "$COOKIE_JAR"
	rm -rf "$WORK_DIR"
}
trap cleanup EXIT

request() {
	local output_file="$1"
	shift
	sleep "${USER_SMOKE_PAUSE_SECONDS:-1}"
	local curl_args=( -sS --cacert "$CA_CERT" -c "$COOKIE_JAR" -b "$COOKIE_JAR" -o "$output_file" -w '%{http_code}' )
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

assert_field_equals() {
	local file_path="$1"
	local field="$2"
	local expected="$3"
	local label="$4"
	local actual

	actual="$(json_get_field "$file_path" "$field")"
	if [[ "$actual" != "$expected" ]]; then
		printf 'FAIL: %s (expected %s, got %s)\n' "$label" "$expected" "$actual" >&2
		printf 'Response body:\n' >&2
		cat "$file_path" >&2
		printf '\n' >&2
		exit 1
	fi

	printf 'PASS: %s (%s)\n' "$label" "$actual"
}

json_get_field() {
	python3 - "$@" <<'PY'
import json
import sys

file_path = sys.argv[1]
field = sys.argv[2]

with open(file_path, 'r', encoding='utf-8') as handle:
    data = json.load(handle)

value = data.get(field)
if value is None:
    raise SystemExit(f'field {field} missing')

if isinstance(value, bool):
    print('true' if value else 'false')
else:
    print(value)
PY
}

wait_for_ready() {
	local attempts=0
	local max_attempts=60
	printf 'Waiting for %s to become ready...\n' "$BASE_URL"
	while true; do
		attempts=$((attempts + 1))
		local_probe="$WORK_DIR/probe.json"
		code="$(request "$local_probe" "$BASE_URL/api/users" || true)"
		if [[ "$code" == "200" ]]; then
			printf 'Backend ready (%s)\n' "$code"
			return 0
		fi
		if (( attempts >= max_attempts )); then
			printf 'Timed out waiting for backend after %d attempts\n' "$max_attempts" >&2
			if [[ -f "$local_probe" ]]; then
				cat "$local_probe" >&2 || true
			fi
			return 1
		fi
		sleep 1
	done
}

SMOKE_SUFFIX="${SMOKE_SUFFIX:-$(date +%s%N | tail -c 8)}"
SMOKE_EMAIL="smoke${SMOKE_SUFFIX}@example.com"
SMOKE_PASSWORD="SmokeTest#2026!Pass"
SMOKE_NAME="Smoke Test"
SMOKE_DISPLAY_NAME="smoke${SMOKE_SUFFIX: -4}"
SMOKE_UPDATED_DISPLAY_NAME="upd${SMOKE_SUFFIX: -4}"

printf 'Running user lifecycle smoke test against %s\n' "$BASE_URL"
wait_for_ready

create_payload="$WORK_DIR/create.json"
cat >"$create_payload" <<JSON
{"email":"$SMOKE_EMAIL","password":"$SMOKE_PASSWORD","name":"$SMOKE_NAME","display_name":"$SMOKE_DISPLAY_NAME"}
JSON

create_response="$WORK_DIR/create-response.json"
status_code="$(request "$create_response" \
	-H 'Content-Type: application/json' \
	-d @"$create_payload" \
	"$BASE_URL/api/users")"
assert_status "$status_code" 201 'POST /api/users' "$create_response"

if ! grep -q 'token' "$COOKIE_JAR"; then
	printf 'FAIL: create did not store the auth cookie\n' >&2
	exit 1
fi
printf 'PASS: auth cookie stored after create\n'

SMOKE_USER_ID="$(json_get_field "$create_response" id)"
assert_field_equals "$create_response" authenticated true 'create returned authenticated user'

login_payload="$WORK_DIR/login.json"
cat >"$login_payload" <<JSON
{"email":"$SMOKE_EMAIL","password":"$SMOKE_PASSWORD"}
JSON

login_response="$WORK_DIR/login-response.json"
status_code="$(request "$login_response" \
	-H 'Content-Type: application/json' \
	-d @"$login_payload" \
	"$BASE_URL/api/auth/login")"
assert_status "$status_code" 200 'POST /api/auth/login' "$login_response"
assert_field_equals "$login_response" authenticated true 'login returned authenticated user'

update_payload="$WORK_DIR/update.json"
cat >"$update_payload" <<JSON
{"display_name":"$SMOKE_UPDATED_DISPLAY_NAME"}
JSON

update_response="$WORK_DIR/update-response.json"
status_code="$(request "$update_response" \
	-H 'Content-Type: application/json' \
	-X PUT \
	-d @"$update_payload" \
	"$BASE_URL/api/users/$SMOKE_USER_ID")"
assert_status "$status_code" 200 'PUT /api/users/:id' "$update_response"

get_response="$WORK_DIR/get-response.json"
status_code="$(request "$get_response" \
	"$BASE_URL/api/users/$SMOKE_USER_ID")"
assert_status "$status_code" 200 'GET /api/users/:id after update' "$get_response"
assert_field_equals "$get_response" display_name "$SMOKE_UPDATED_DISPLAY_NAME" 'display_name updated'

delete_response="$WORK_DIR/delete-response.json"
status_code="$(request "$delete_response" \
	-X DELETE \
	"$BASE_URL/api/users/$SMOKE_USER_ID")"
assert_status "$status_code" 204 'DELETE /api/users/:id' "$delete_response"

post_delete_response="$WORK_DIR/post-delete-response.json"
status_code="$(request "$post_delete_response" \
	"$BASE_URL/api/users/$SMOKE_USER_ID")"
assert_status "$status_code" 404 'GET /api/users/:id after delete' "$post_delete_response"

printf '\nUser lifecycle smoke test passed.\n'