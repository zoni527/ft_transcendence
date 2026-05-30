#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://localhost:8443}"
LOGIN_EMAIL="${LOGIN_EMAIL:-eve@test.com}"
LOGIN_PASSWORD="${LOGIN_PASSWORD:-12345678}"
CA_CERT="${CA_CERT:-$(pwd)/certs/ca.crt}"

COOKIE_JAR="$(mktemp)"
WORK_DIR="$(mktemp -d)"

cleanup() {
  rm -f "$COOKIE_JAR"
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

request() {
  local out="$1"; shift
  # small pause between requests to avoid bursts
  sleep 0.5
  local curl_args=( -sS --cacert "$CA_CERT" -c "$COOKIE_JAR" -b "$COOKIE_JAR" -o "$out" -w '%{http_code}' )
  curl "${curl_args[@]}" "$@"
}

assert_status() {
  local got="$1" expected="$2" label="$3" bodyfile="$4"
  if [[ "$got" != "$expected" ]]; then
    printf 'FAIL: %s (expected %s, got %s)\n' "$label" "$expected" "$got" >&2
    if [[ -n "$bodyfile" && -f "$bodyfile" ]]; then
      printf 'Response body:\n' >&2
      cat "$bodyfile" >&2
      printf '\n' >&2
    fi
    exit 1
  fi
  printf 'PASS: %s (%s)\n' "$label" "$got"
}

json_get_field() {
  python3 - <<PY
import json,sys
f=sys.argv[1]
field=sys.argv[2]
data=json.load(open(f))
val=data.get(field)
if val is None:
    print("")
else:
    print(val)
PY
}

assert_json_field_equals() {
  local file="$1" field="$2" expected="$3" label="$4"
  python3 -c "import json,sys
f=sys.argv[1]; field=sys.argv[2]; expected=sys.argv[3]; label=sys.argv[4]
data=json.load(open(f))
val=data.get(field)
if val is None:
    sys.stderr.write(f'FAIL: {label} - field {field} missing\n'); sys.exit(2)
if str(val) != expected:
    sys.stderr.write(f'FAIL: {label} - expected {expected}, got {val}\n'); sys.exit(1)
sys.exit(0)" "$file" "$field" "$expected" "$label"
  if [[ $? -ne 0 ]]; then
    cat "$file" >&2 || true
    exit 1
  fi
  printf 'PASS: %s (json check)\n' "$label"
}

wait_for_ready() {
  local attempts=0
  local max=30
  echo "Waiting for server readiness at $BASE_URL..."
  while true; do
    attempts=$((attempts+1))
    code=$(request /dev/null "$BASE_URL/api/v1/recipes" || true)
    # Accept 200, 401 (unauth), or 404 as signs server is up
    if [[ "$code" =~ ^(200|401|404)$ ]]; then
      echo "Server ready (status $code)"
      return 0
    fi
    if (( attempts >= max )); then
      echo "Timed out waiting for server after $max attempts" >&2
      return 1
    fi
    sleep 1
  done
}

echo "User auth test against $BASE_URL"
wait_for_ready

# Test steps overview:
# 1) Login with provided credentials and assert 200
# 2) Ensure auth cookie/token persisted in cookie jar
# 3) GET /api/users/me and extract `id`
# 4) PUT /api/users/:id to update `display_name`
# 5) Re-GET /api/users/me and assert `display_name` changed
# 6) Logout and verify unauthenticated state (401 or authenticated=false)

login_payload="$WORK_DIR/login.json"
cat >"$login_payload" <<JSON
{"email":"$LOGIN_EMAIL","password":"$LOGIN_PASSWORD"}
JSON

login_out="$WORK_DIR/login-response.json"
status=$(request "$login_out" -X POST -H 'Content-Type: application/json' -d @"$login_payload" "$BASE_URL/api/auth/login")
assert_status "$status" 200 'login' "$login_out"

if ! grep -q 'token' "$COOKIE_JAR"; then
  printf 'FAIL: login did not store the auth cookie\n' >&2
  exit 1
fi
printf 'PASS: auth cookie stored\n'

me_out="$WORK_DIR/me.json"
status=$(request "$me_out" "$BASE_URL/api/users/me")
assert_status "$status" 200 'GET /api/users/me' "$me_out"

# extract user id for update (handlers expect PUT /api/users/:id)
user_id=$(python3 -c "import json,sys; data=json.load(open(sys.argv[1])); print(data.get('id',''))" "$me_out")
if [[ -z "$user_id" ]]; then
  echo "failed to extract user id from $me_out" >&2
  python3 -m json.tool "$me_out" >&2 || cat "$me_out" >&2 || true
  exit 1
fi

# build a short display name that satisfies server validation (3-15 chars, alnum + separators)
# base 'smoketest' (9 chars) + last 4 digits of epoch -> 13 chars total
ts=$(date +%s)
suffix=${ts: -4}
new_display="smoketest${suffix}"
update_payload="$WORK_DIR/update.json"
cat >"$update_payload" <<JSON
{"display_name":"$new_display"}
JSON

update_out="$WORK_DIR/update-response.json"
# send update to the user-specific route
status=$(request "$update_out" -X PUT -H 'Content-Type: application/json' -d @"$update_payload" "$BASE_URL/api/users/$user_id")
assert_status "$status" 200 "PUT /api/users/$user_id" "$update_out"

me2_out="$WORK_DIR/me2.json"
status=$(request "$me2_out" "$BASE_URL/api/users/me")
assert_status "$status" 200 'GET /api/users/me after update' "$me2_out"
assert_json_field_equals "$me2_out" "display_name" "$new_display" 'display_name updated'

logout_out="$WORK_DIR/logout.json"
status=$(request "$logout_out" -X POST "$BASE_URL/api/auth/logout")
assert_status "$status" 200 'logout' "$logout_out"

me3_out="$WORK_DIR/me3.json"
status=$(request "$me3_out" "$BASE_URL/api/users/me")

if [[ "$status" == 200 ]]; then
  python3 -c "import json,sys; data=json.load(open(sys.argv[1])); sys.exit(0) if data.get('authenticated') is False else sys.exit(1)" "$me3_out"
  if [[ $? -eq 0 ]]; then
    printf 'PASS: logout cleared authentication (authenticated=false)\n'
  else
    printf 'FAIL: still authenticated after logout\n' >&2
    cat "$me3_out" >&2
    exit 1
  fi
elif [[ "$status" == 401 ]]; then
  printf 'PASS: logout cleared authentication (401)\n'
else
  printf 'FAIL: unexpected status after logout: %s\n' "$status" >&2
  cat "$me3_out" >&2
  exit 1
fi

printf '\nAll user-auth checks passed.\n'
