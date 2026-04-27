"""Slice 2 smoke: drive the /api/speaking/liz-live/ws WebSocket end-to-end.

Boots the FastAPI app via uvicorn on a random port, connects with the
websockets client, sends an init frame, collects examiner audio + transcript
until turn_complete, then closes. No browser, no real mic — verifies that
the proxy correctly bridges to Gemini Live and shapes JSON frames.
"""
from __future__ import annotations

import asyncio
import base64
import json
import os
import socket
import sys
from contextlib import closing
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")

import uvicorn  # noqa: E402
import websockets  # noqa: E402


def _free_port() -> int:
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


async def _drive_session(uri: str) -> int:
    audio_bytes_total = 0
    transcripts: list[str] = []
    saw_ready = False
    saw_turn_complete = False
    closed_payload: dict | None = None

    async with websockets.connect(uri, max_size=8 * 1024 * 1024) as ws:
        # init frame — Part 1 with seed topic
        await ws.send(json.dumps({
            "type": "init",
            "part": "part1",
            "topic": "Hometown",
        }))

        try:
            async for raw in ws:
                msg = json.loads(raw)
                t = msg.get("type")
                if t == "ready":
                    saw_ready = True
                elif t == "audio":
                    audio_bytes_total += len(base64.b64decode(msg["data"]))
                elif t == "transcript" and msg.get("role") == "examiner":
                    transcripts.append(msg.get("text", ""))
                elif t == "turn_complete":
                    saw_turn_complete = True
                    # Politely end the session after the first examiner turn
                    await ws.send(json.dumps({"type": "close"}))
                elif t == "closed":
                    closed_payload = msg
                    break
                elif t == "error":
                    print(f"[ws error] {msg.get('message')}", file=sys.stderr)
                    return 1
        except websockets.ConnectionClosed:
            pass

    transcript = "".join(transcripts).strip()
    print(f"[ws smoke] ready={saw_ready} turn_complete={saw_turn_complete}")
    print(f"[examiner audio bytes] {audio_bytes_total}")
    print(f"[examiner transcript ] {transcript or '(none)'}")
    print(f"[closed payload      ] {closed_payload}")

    if not saw_ready:
        print("Did not receive {'type':'ready'}", file=sys.stderr)
        return 2
    if audio_bytes_total <= 0:
        print("No audio received from examiner", file=sys.stderr)
        return 3
    return 0


async def main() -> int:
    if not os.environ.get("GEMINI_API_KEY"):
        print("GEMINI_API_KEY not set", file=sys.stderr)
        return 2

    # Minimal FastAPI app — full server.py pulls Motor/Mongo/many deps the
    # local venv may not have. We just mount the Liz Live router.
    from fastapi import FastAPI
    from routes.liz_live import router as liz_live_router

    app = FastAPI()
    app.include_router(liz_live_router)

    port = _free_port()
    config = uvicorn.Config(
        app,
        host="127.0.0.1",
        port=port,
        log_level="warning",
        reload=False,
    )
    server = uvicorn.Server(config)
    server_task = asyncio.create_task(server.serve(), name="liz-live-uvicorn")

    # Wait until the server is accepting connections.
    for _ in range(50):  # ~10s max
        await asyncio.sleep(0.2)
        if server.started:
            break
    else:
        print("Server failed to start", file=sys.stderr)
        return 4

    try:
        rc = await _drive_session(f"ws://127.0.0.1:{port}/api/speaking/liz-live/ws")
    finally:
        server.should_exit = True
        try:
            await asyncio.wait_for(server_task, timeout=5.0)
        except asyncio.TimeoutError:
            server_task.cancel()
            try:
                await server_task
            except (asyncio.CancelledError, Exception):  # noqa: BLE001
                pass
    return rc


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
