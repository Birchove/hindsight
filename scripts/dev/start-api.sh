#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment file $ENV_FILE not found at project root."
  echo "Run ./scripts/dev/setup.sh first, then edit .env."
  exit 1
fi

echo "Loading environment from $ENV_FILE"
echo ""

set -a
# shellcheck disable=SC1091
source "$ENV_FILE"
set +a

uv run hindsight-api "$@"
