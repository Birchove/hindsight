#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f "$ROOT_DIR/.env" ]; then
  echo "Warning: .env not found at $ROOT_DIR/.env"
  echo "Default Control Plane API URL: http://localhost:8888"
  echo ""
fi

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "node_modules missing — run ./scripts/dev/setup.sh first"
  exit 1
fi

echo "Building TypeScript client..."
npm run build -w @vectorize-io/hindsight-client
echo ""

echo "Starting Control Plane (Next.js)..."
_CALLER_PORT="${PORT:-}"
_CALLER_DATAPLANE_URL="${HINDSIGHT_CP_DATAPLANE_API_URL:-}"

if [ -f "$ROOT_DIR/.env" ]; then
  echo "Loading environment from $ROOT_DIR/.env"
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

export HOSTNAME="${HINDSIGHT_CP_HOSTNAME:-0.0.0.0}"
export PORT="${_CALLER_PORT:-${HINDSIGHT_CP_PORT:-9999}}"
export HINDSIGHT_CP_DATAPLANE_API_URL="${_CALLER_DATAPLANE_URL:-${HINDSIGHT_CP_DATAPLANE_API_URL:-http://localhost:8888}}"

npm run dev -w @vectorize-io/hindsight-control-plane
