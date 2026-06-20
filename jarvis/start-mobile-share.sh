#!/usr/bin/env bash
# Start restricted Social Studio and expose it through a temporary HTTPS URL.
set -euo pipefail
cd "$(dirname "$0")"

PORT="${JARVIS_SOCIAL_PORT:-8766}"
CLOUDFLARED="${CLOUDFLARED_BIN:-$(command -v cloudflared || true)}"
if [ -z "$CLOUDFLARED" ]; then
  echo "cloudflared is missing. Install it with: brew install cloudflared"
  exit 1
fi

started_server=0
cleanup() {
  if [ "$started_server" -eq 1 ] && [ -n "${server_pid:-}" ]; then
    kill "$server_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

if ! curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
  ./run-social-mobile.sh &
  server_pid=$!
  started_server=1
  for _ in {1..30}; do
    if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
      break
    fi
    sleep 0.25
  done
fi

echo
echo "Aşağıda oluşan https://...trycloudflare.com adresini iPhone Safari'de açın."
echo "Durdurmak için Ctrl+C."
echo
exec "$CLOUDFLARED" tunnel --url "http://127.0.0.1:${PORT}" --no-autoupdate
