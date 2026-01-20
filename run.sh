#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Please update Docker."
  exit 1
fi

if [[ ! -f ".env" ]]; then
  if [[ -f "env.example" ]]; then
    cp env.example .env
    echo "Created .env from env.example"
  else
    echo "Missing env.example (cannot create .env)"
    exit 1
  fi
fi

docker compose up --build

