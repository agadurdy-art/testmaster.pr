# JARVIS — testmaster.pro control room

A voice-enabled web console to drive the 19-agent team in `../.claude/agents/`.
You type or speak a command; JARVIS runs Claude Code headless against the repo,
routes to the right orchestrator/agent, and streams the activity back live. A
British "JARVIS" voice (ElevenLabs) narrates milestones.

## Architecture
```
browser (Preact UI + Web Speech mic + ElevenLabs voice)
   │  WebSocket /ws/run
FastAPI backend  ── spawns ──▶  claude -p --output-format stream-json …
   │  /api/agents (roster from .claude/agents)        (cwd = repo root)
   │  /api/tts    (ElevenLabs proxy, key server-side)
```
- Streaming uses the installed, already-authed `claude` CLI (no SDK version drift).
- Agents load automatically via `--setting-sources project` + repo cwd.
- Reuses the project's `ELEVENLABS_API_KEY` from `backend/.env`.

## Run (local)
```bash
cd jarvis && ./run.sh         # → http://localhost:8765
```
First run creates `jarvis/.venv` and installs deps. Open the URL in Chrome (Web
Speech mic needs Chrome). Pick an agent on the left, or leave it on Auto and let
JARVIS route. Voice output toggle is top-right.

## Config (env)
| var | default | meaning |
|---|---|---|
| `JARVIS_PORT` | 8765 | server port |
| `JARVIS_PERMISSION_MODE` | `bypassPermissions` | how headless tools are approved |
| `JARVIS_MODEL` | (CLI default) | override model for runs |
| `JARVIS_VOICE_ID` | Daniel (British M) | ElevenLabs voice |
| `JARVIS_TTS_MODEL` | `eleven_turbo_v2_5` | TTS model |
| `JARVIS_TOKEN` | (unset) | if set, required on /ws + /api (shared secret) |

## ⚠️ Security — before exposing publicly (deploy phase)
This backend runs Claude with tool access on the repo. With
`bypassPermissions` it can edit files and run shell commands autonomously — fine
locally on your own machine, **dangerous if open to the internet**. Before deploy:
1. Set a strong `JARVIS_TOKEN` (and ideally real per-user auth).
2. Run it where the repo lives (your Mac via Cloudflare Tunnel, or a container
   that git-clones the repo with scoped credentials).
3. Consider tightening `JARVIS_PERMISSION_MODE` + `--allowedTools` for the
   marketing-only surface (which mostly writes to `/marketing/`).

## Status
Phase 1 (local voice control room) — built. Phase 2 (auth + deploy) — next.
