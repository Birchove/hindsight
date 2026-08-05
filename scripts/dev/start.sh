#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

RANDOM_PORT=false
for arg in "$@"; do
  if [ "$arg" = "--random-port" ]; then
    RANDOM_PORT=true
  fi
done

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

get_free_port() {
  python3 -c "import socket; s=socket.socket(); s.bind(('', 0)); print(s.getsockname()[1]); s.close()"
}

if [ "$RANDOM_PORT" = true ]; then
  API_PORT="$(get_free_port)"
  CP_PORT="$(get_free_port)"
  echo "Using random ports — API: $API_PORT, Control Plane: $CP_PORT"
else
  API_PORT="${HINDSIGHT_API_PORT:-8888}"
  CP_PORT="${HINDSIGHT_CP_PORT:-9999}"
fi

PIDS=()

kill_tree() {
  local pid=$1
  local children
  children=$(pgrep -P "$pid" 2>/dev/null) || true
  for child in $children; do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

cleanup() {
  echo ""
  echo "Shutting down..."
  for pid in "${PIDS[@]}"; do
    kill_tree "$pid"
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting API server..."
"$SCRIPT_DIR/start-api.sh" --port "$API_PORT" &
API_PID=$!
PIDS+=("$API_PID")

echo "Waiting for API to be ready..."
API_READY=false
for _ in $(seq 1 60); do
  if curl -sf "http://localhost:${API_PORT}/health" &>/dev/null; then
    echo "API is ready"
    API_READY=true
    break
  fi
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "API process exited unexpectedly"
    exit 1
  fi
  sleep 1
done
if [ "$API_READY" = false ]; then
  echo "API did not become ready in time"
  exit 1
fi

echo ""
PORT="$CP_PORT" HINDSIGHT_CP_DATAPLANE_API_URL="http://localhost:${API_PORT}" \
  "$SCRIPT_DIR/start-control-plane.sh" &
CP_PID=$!
PIDS+=("$CP_PID")

echo ""
echo "Hindsight is running!"
echo ""
echo "  API:            http://localhost:${API_PORT}"
echo "  Control Plane:  http://localhost:${CP_PORT}"
echo ""
echo "Press Ctrl+C to stop both services."
echo ""

while true; do
  for pid in "${PIDS[@]}"; do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "A service exited unexpectedly (PID $pid)"
      exit 1
    fi
  done
  sleep 2
done
