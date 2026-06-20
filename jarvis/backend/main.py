"""JARVIS control-room backend. Serves the roster, streams agent runs over a
WebSocket, and proxies ElevenLabs TTS for the voice. Single-user: set JARVIS_TOKEN
to require a shared secret (mandatory before exposing publicly)."""
from __future__ import annotations

import hmac
import os

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Header, HTTPException
from fastapi.responses import Response, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from agents import load_roster, GATES
from runner import stream_run, PERMISSION_MODE
from social_routes import build_social_router
import tts

app = FastAPI(title="JARVIS Control Room")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"
AUTH_TOKEN = os.environ.get("JARVIS_TOKEN")  # if set, required on /ws and /api
SOCIAL_ONLY = os.environ.get("JARVIS_SOCIAL_ONLY", "").lower() in {"1", "true", "yes"}


def _token_ok(token: str | None) -> bool:
    """Constant-time shared-secret check. No token configured ⇒ open (local dev);
    the mobile/tunnel launchers require JARVIS_TOKEN so exposure is always gated."""
    if not AUTH_TOKEN:
        return True
    return bool(token) and hmac.compare_digest(str(token), AUTH_TOKEN)


def _check(token: str | None):
    if not _token_ok(token):
        raise HTTPException(status_code=401, detail="unauthorized")


app.include_router(build_social_router(_check))


def _narration(ev: dict) -> str | None:
    """Short spoken status for milestone events (not every log line)."""
    t = ev.get("type")
    if t == "agent":
        a = ev.get("agent", "an agent").replace("-", " ")
        if ev.get("agent") in GATES:
            return f"{a} gate reached. Awaiting your review."
        return f"Dispatching {a}."
    if t == "result":
        return "Task complete." if not ev.get("is_error") else "The task ended with an error."
    if t == "error":
        return "Something went wrong. Check the log."
    return None


@app.get("/api/health")
def health(authorization: str | None = Header(default=None)):
    _check((authorization or "").removeprefix("Bearer ").strip() or None)
    return {"ok": True, "permission_mode": PERMISSION_MODE,
            "auth": bool(AUTH_TOKEN), "agents": 0 if SOCIAL_ONLY else len(load_roster()),
            "social_only": SOCIAL_ONLY}


@app.get("/api/agents")
def agents(authorization: str | None = Header(default=None)):
    _check((authorization or "").removeprefix("Bearer ").strip() or None)
    if SOCIAL_ONLY:
        return {"agents": [], "squads": {"product": [], "marketing": []},
                "social_only": True}
    roster = load_roster()
    return {
        "agents": roster,
        "squads": {
            "product": [a for a in roster if a["squad"] == "product"],
            "marketing": [a for a in roster if a["squad"] == "marketing"],
        },
    }


@app.post("/api/tts")
async def tts_endpoint(payload: dict, authorization: str | None = Header(default=None)):
    _check((authorization or "").removeprefix("Bearer ").strip() or None)
    text = (payload or {}).get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text required")
    try:
        audio = tts.synthesize(text)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"tts failed: {e}")
    return Response(content=audio, media_type="audio/mpeg")


@app.websocket("/ws/run")
async def ws_run(ws: WebSocket):
    await ws.accept()
    try:
        req = await ws.receive_json()
        if not _token_ok(req.get("token")):
            await ws.send_json({"type": "error", "message": "unauthorized"})
            await ws.close()
            return
        if SOCIAL_ONLY:
            await ws.send_json({
                "type": "error",
                "message": "agent execution is disabled on the mobile Social Studio",
            })
            await ws.close()
            return
        command = (req.get("command") or "").strip()
        agent = req.get("agent") or None
        session_id = req.get("session_id") or None
        speak = req.get("speak", True)
        if not command:
            await ws.send_json({"type": "error", "message": "command required"})
            await ws.close()
            return
        async for ev in stream_run(command, agent=agent, session_id=session_id):
            await ws.send_json(ev)
            if speak:
                line = _narration(ev)
                if line:
                    await ws.send_json({"type": "say", "text": line})
    except WebSocketDisconnect:
        return
    except Exception as e:  # noqa: BLE001
        try:
            await ws.send_json({"type": "error", "message": str(e)[:500]})
        except Exception:
            pass


# --- static frontend (served last so /api and /ws take precedence) ---
_FRONTEND_ROOT = FRONTEND.resolve()


def _spa_index():
    return FileResponse(_FRONTEND_ROOT / "index.html")


@app.get("/")
def index():
    return _spa_index()


@app.get("/{path:path}")
def static_files(path: str):
    # Containment guard: resolve the requested path and only serve files that
    # live INSIDE the frontend dir. Without this, `/..%2f.token` (or any `../`)
    # would escape the static root and leak jarvis/.token + backend source —
    # critical once the studio is exposed over the Cloudflare tunnel. Anything
    # outside the root falls back to the SPA shell.
    target = (_FRONTEND_ROOT / path).resolve()
    if (target == _FRONTEND_ROOT or _FRONTEND_ROOT in target.parents) and target.is_file():
        return FileResponse(target)
    return _spa_index()
