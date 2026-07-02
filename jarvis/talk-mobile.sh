#!/usr/bin/env bash
# Talk to JARVIS from your iPhone — by web (talk.html) OR hands-free via Siri.
#
# Starts the FULL JARVIS backend (agent execution ENABLED) and exposes it over a
# temporary HTTPS Cloudflare tunnel, gated by JARVIS_TOKEN. Prints the public URL
# in a big banner (and writes it to data/tunnel_url.txt) so you can paste it into
# the iPhone Siri Shortcut. Voice in/out is on-device (free) by default.
#
#   ./talk-mobile.sh
#
# ⚠️  This exposes a backend that can run Claude with tool access on the repo
#     (bypassPermissions). The shared JARVIS_TOKEN is the ONLY protection.
#     Keep the token secret; stop the tunnel (Ctrl+C) when done.
#     The trycloudflare URL changes every restart — keep it running for a stable
#     address during the day; update the Shortcut only when it changes.
set -euo pipefail
cd "$(dirname "$0")"

PORT="${JARVIS_PORT:-8765}"
CLOUDFLARED="${CLOUDFLARED_BIN:-$(command -v cloudflared || true)}"
[ -z "$CLOUDFLARED" ] && { echo "cloudflared yok. Kur: brew install cloudflared"; exit 1; }

if [ -z "${JARVIS_TOKEN:-}" ] && [ -f ".token" ]; then
  JARVIS_TOKEN="$(tr -d '[:space:]' < .token)"
fi
[ -z "${JARVIS_TOKEN:-}" ] && { echo "JARVIS_TOKEN gerekli. Oluştur: openssl rand -hex 16 > .token"; exit 1; }
export JARVIS_TOKEN
[ -d ".venv" ] || { echo "venv yok — önce ./run.sh çalıştır."; exit 1; }

server_pid=""; cf_pid=""
cleanup(){ [ -n "$cf_pid" ] && kill "$cf_pid" 2>/dev/null || true
           [ -n "$server_pid" ] && kill "$server_pid" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

# Health probe must send the token — /api/health is gated when JARVIS_TOKEN is set.
health(){ curl -fsS "http://127.0.0.1:${PORT}/api/health" -H "Authorization: Bearer ${JARVIS_TOKEN}" >/dev/null 2>&1; }

# Start the full backend if not already up on this port.
if ! health; then
  export PYTHONPATH="$PWD/backend"
  ./.venv/bin/python3 -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port "$PORT" \
    >/tmp/jarvis-backend.log 2>&1 &
  server_pid=$!
  for _ in {1..40}; do health && break; sleep 0.25; done
fi
health || { echo "backend başlamadı — /tmp/jarvis-backend.log bak"; exit 1; }

# Start the tunnel and capture its public URL.
CF_LOG="$(mktemp -t jarvis-cf.XXXXXX)"
"$CLOUDFLARED" tunnel --url "http://127.0.0.1:${PORT}" --no-autoupdate >"$CF_LOG" 2>&1 &
cf_pid=$!

URL=""
for _ in {1..60}; do
  URL="$(grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' "$CF_LOG" | head -1 || true)"
  [ -n "$URL" ] && break
  kill -0 "$cf_pid" 2>/dev/null || { echo "cloudflared çıktı:"; cat "$CF_LOG"; exit 1; }
  sleep 0.5
done
[ -z "$URL" ] && { echo "Tünel URL alınamadı:"; cat "$CF_LOG"; exit 1; }

mkdir -p data; printf '%s\n' "$URL" > data/tunnel_url.txt

cat <<BANNER

════════════════════════════════════════════════════════════
  📱  JARVIS HAZIR  —  iPhone'da kullan
════════════════════════════════════════════════════════════
  🔒 TOKEN (Shortcut'a yapıştır):
     ${JARVIS_TOKEN}

  🗣️  SIRI SHORTCUT endpoint'i (POST):
     ${URL}/api/ask

  🌐 Web arayüzü (Safari'de aç):
     ${URL}/talk.html
════════════════════════════════════════════════════════════
  URL ayrıca: jarvis/data/tunnel_url.txt
  Durdurmak için Ctrl+C.  (URL'i sabit tutmak için açık bırak.)
════════════════════════════════════════════════════════════

BANNER

wait "$cf_pid"
