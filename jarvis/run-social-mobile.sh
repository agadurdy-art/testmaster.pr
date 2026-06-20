#!/usr/bin/env bash
# Run the restricted mobile Social Studio. Agent execution is disabled.
set -euo pipefail
cd "$(dirname "$0")"

PORT="${JARVIS_SOCIAL_PORT:-8766}"
if [ ! -d ".venv" ]; then
  echo "Run ./run.sh once to create the JARVIS virtual environment."
  exit 1
fi

if [ -z "${JARVIS_TOKEN:-}" ] && [ -f ".token" ]; then
  export JARVIS_TOKEN="$(tr -d '[:space:]' < .token)"
fi
if [ -z "${JARVIS_TOKEN:-}" ]; then
  echo "JARVIS_TOKEN is required for mobile access."
  exit 1
fi

export JARVIS_SOCIAL_ONLY=1
export PYTHONPATH="$PWD/backend"
echo "JARVIS Social Studio → http://0.0.0.0:${PORT} (agent execution disabled)"
exec "./.venv/bin/python3" -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port "$PORT"
