#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3000}"
USERNAME="${AUTH_USERNAME:-admin}"
PASSWORD="${AUTH_PASSWORD:-admin}"

echo "==> API_URL=$API_URL"

echo "==> 1) Login and get JWT"
TOKEN="$(
  curl -sS -X POST "$API_URL/api/v1/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" \
  | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const j=JSON.parse(s);process.stdout.write(j.accessToken||'')})"
)"

if [[ -z "$TOKEN" ]]; then
  echo "ERROR: empty token (check API is running and credentials)"
  exit 1
fi
echo "TOKEN (first 24 chars): ${TOKEN:0:24}..."

echo
echo "==> 2) POST /api/v1/add-user (auto-generate fields)"
CREATED_JSON="$(
  curl -sS -X POST "$API_URL/api/v1/add-user" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{}'
)"
echo "$CREATED_JSON"

USER_ID="$(echo "$CREATED_JSON" | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const j=JSON.parse(s);process.stdout.write(j.id||'')})")"
if [[ -z "$USER_ID" ]]; then
  echo "ERROR: could not extract user id"
  exit 1
fi

echo
echo "==> 3) GET /api/v1/get-user/:id"
curl -sS "$API_URL/api/v1/get-user/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | cat
echo

echo
echo "==> 4) GET /api/v1/get-users?limit=2 (first page)"
PAGE1="$(
  curl -sS "$API_URL/api/v1/get-users?limit=2" \
    -H "Authorization: Bearer $TOKEN"
)"
echo "$PAGE1"

CURSOR="$(echo "$PAGE1" | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const j=JSON.parse(s);process.stdout.write(j.nextCursor||'')})")"
if [[ -n "$CURSOR" ]]; then
  echo
  echo "==> 5) GET /api/v1/get-users?limit=2&cursor=... (next page)"
  curl -sS "$API_URL/api/v1/get-users?limit=2&cursor=$CURSOR" \
    -H "Authorization: Bearer $TOKEN" | cat
  echo
else
  echo "No nextCursor returned (not enough users)."
fi

echo
echo "==> 6) GET /api/v1/get-users?name=User (optional filter example)"
curl -sS "$API_URL/api/v1/get-users?name=User&limit=5" \
  -H "Authorization: Bearer $TOKEN" | cat
echo

echo
echo "DONE"