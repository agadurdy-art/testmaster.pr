"""JARVIS control-room backend. Serves the roster, streams agent runs over a
WebSocket, and proxies ElevenLabs TTS for the voice. Single-user: set JARVIS_TOKEN
to require a shared secret (mandatory before exposing publicly)."""
from __future__ import annotations

import os

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Header, HTTPException
from fastapi.responses import Response, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from agents import load_roster, GATES
from runner import stream_run, PERMISSION_MODE
import tts

app = FastAPI(title="JARVIS Control Room")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"
AUTH_TOKEN = os.environ.get("JARVIS_TOKEN")  # if set, required on /ws and /api


def _check(token: str | None):
    if AUTH_TOKEN and token != AUTH_TOKEN:
        raise HTTPException(status_code=401, detail="unauthorized")


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
def health():
    return {"ok": True, "permission_mode": PERMISSION_MODE,
            "auth": bool(AUTH_TOKEN), "agents": len(load_roster())}


@app.get("/api/agents")
def agents(authorization: str | None = Header(default=None)):
    _check((authorization or "").removeprefix("Bearer ").strip() or None)
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
        if AUTH_TOKEN and req.get("token") != AUTH_TOKEN:
            await ws.send_json({"type": "error", "message": "unauthorized"})
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
@app.get("/")
def index():
    return FileResponse(FRONTEND / "index.html")


@app.get("/{path:path}")
def static_files(path: str):
    target = FRONTEND / path
    if target.is_file():
        return FileResponse(target)
    return FileResponse(FRONTEND / "index.html")
