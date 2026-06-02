#!/usr/bin/env bash
# Start the JARVIS control room locally.
#   ./run.sh            → http://localhost:8765
# Uses the project's backend venv if present, else a local .venv.
set -euo pipefail
cd "$(dirname "$0")"

REPO_ROOT="$(cd .. && pwd)"
PORT="${JARVIS_PORT:-8765}"

# Pick a Python with the deps. Prefer a dedicated jarvis venv.
if [ ! -d ".venv" ]; then
  echo "Creating jarvis venv…"
  python3 -m venv .venv
  ./.venv/bin/pip install -q -r backend/requirements.txt
fi
PY="./.venv/bin/python3"

export PYTHONPATH="$PWD/backend"
# JARVIS_TOKEN gates /api + /ws. If not set in env, read jarvis/.token (gitignored).
# REQUIRED before exposing publicly. JARVIS_PERMISSION_MODE defaults to bypassPermissions.
if [ -z "${JARVIS_TOKEN:-}" ] && [ -f ".token" ]; then
  export JARVIS_TOKEN="$(tr -d '[:space:]' < .token)"
fi
if [ -n "${JARVIS_TOKEN:-}" ]; then echo "🔒 auth ON (token gerekli)"; else echo "⚠️  auth OFF (lokal)"; fi
echo "JARVIS → http://localhost:${PORT}   (repo: ${REPO_ROOT})"
exec "$PY" -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port "$PORT"
