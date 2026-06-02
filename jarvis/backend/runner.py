"""Run Claude Code headless against the project and stream normalized events.

We shell out to the installed `claude` CLI in stream-json mode rather than the
SDK so we use the already-authed binary and it auto-loads .claude/agents/.
Each raw stream-json line is normalized into a small, UI-friendly event dict."""
from __future__ import annotations

import asyncio
import json
import os
import shutil
from pathlib import Path
from typing import AsyncIterator

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CLAUDE_BIN = os.environ.get("JARVIS_CLAUDE_BIN") or shutil.which("claude") or "claude"
# bypassPermissions = full headless autonomy (needed for build agents that run
# bash/edit). Safe locally on your own repo; lock behind auth before exposing.
PERMISSION_MODE = os.environ.get("JARVIS_PERMISSION_MODE", "bypassPermissions")
DEFAULT_MODEL = os.environ.get("JARVIS_MODEL", "")  # empty = inherit CLI default

JARVIS_PREFIX = (
    "You are JARVIS, the control interface for the testmaster.pro agent team. "
    "Route this request to the right orchestrator (release-captain for "
    "build/QA/deploy work, marketing-lead for marketing) or to the specific "
    "specialist it names, using the Agent tool. Enforce the mandatory gates. "
    "Narrate progress in short, clear status lines. Request:\n\n"
)


def build_command(prompt: str, *, agent: str | None = None,
                  session_id: str | None = None) -> list[str]:
    text = prompt if agent else (JARVIS_PREFIX + prompt)
    cmd = [
        CLAUDE_BIN, "-p", text,
        "--output-format", "stream-json",
        "--verbose",
        "--include-partial-messages",
        "--setting-sources", "project",
        "--permission-mode", PERMISSION_MODE,
        "--add-dir", str(REPO_ROOT),
    ]
    if agent:
        cmd += ["--agent", agent]
    if DEFAULT_MODEL:
        cmd += ["--model", DEFAULT_MODEL]
    if session_id:
        cmd += ["--resume", session_id]
    return cmd


def _normalize(raw: dict) -> list[dict]:
    """Map a raw stream-json object to zero or more UI events.
    UI event types: system, text, tool, agent, tool_result, result, error."""
    out: list[dict] = []
    sid = raw.get("session_id")
    t = raw.get("type")

    if t == "system":
        out.append({"type": "system", "subtype": raw.get("subtype"),
                    "model": raw.get("model"), "session_id": sid})
        return out

    if t == "stream_event":
        ev = raw.get("event", {})
        et = ev.get("type")
        if et == "content_block_delta":
            delta = ev.get("delta", {})
            if delta.get("type") == "text_delta" and delta.get("text"):
                out.append({"type": "text", "text": delta["text"], "session_id": sid})
        elif et == "content_block_start":
            block = ev.get("content_block", {})
            if block.get("type") == "tool_use":
                out.append(_tool_event(block, sid))
        return out

    # Full (non-partial) assistant/user messages carry tool_use / tool_result.
    if t in ("assistant", "user"):
        msg = raw.get("message", {})
        for block in msg.get("content", []) or []:
            bt = block.get("type")
            if bt == "tool_use":
                out.append(_tool_event(block, sid))
            elif bt == "tool_result":
                content = block.get("content")
                if isinstance(content, list):
                    content = " ".join(c.get("text", "") for c in content
                                       if isinstance(c, dict))
                out.append({"type": "tool_result",
                            "text": (content or "")[:4000], "session_id": sid})
            # NOTE: assistant `text` blocks are intentionally NOT emitted here —
            # with --include-partial-messages the text already streamed via
            # content_block_delta. Re-emitting it would duplicate the whole reply.
        return out

    if t == "result":
        out.append({
            "type": "result",
            "result": raw.get("result", ""),
            "is_error": raw.get("is_error", False),
            "usage": raw.get("usage", {}),
            "total_cost_usd": raw.get("total_cost_usd"),
            "num_turns": raw.get("num_turns"),
            "session_id": sid,
        })
        return out

    return out


def _tool_event(block: dict, sid: str | None) -> dict:
    name = block.get("name", "")
    inp = block.get("input", {}) or {}
    # Detect subagent dispatch via the Agent/Task tool.
    if name in ("Agent", "Task"):
        sub = inp.get("subagent_type") or inp.get("agent") or "agent"
        desc = inp.get("description") or inp.get("task") or inp.get("prompt", "")
        return {"type": "agent", "agent": sub, "label": desc[:200], "session_id": sid}
    return {"type": "tool", "tool": name,
            "summary": _tool_summary(name, inp), "session_id": sid}


def _tool_summary(name: str, inp: dict) -> str:
    if name in ("Edit", "Write", "Read"):
        return inp.get("file_path", "")
    if name == "Bash":
        return (inp.get("command", "") or "")[:160]
    if name in ("Grep", "Glob"):
        return inp.get("pattern", "")
    return ", ".join(f"{k}={str(v)[:40]}" for k, v in list(inp.items())[:2])


def _child_env() -> dict:
    """Environment for the claude subprocess. By default strip ANTHROPIC_API_KEY /
    AUTH_TOKEN so the CLI uses its own logged-in (subscription) auth instead of a
    stale key that backend/.env may have injected ("Invalid API key"). Set
    JARVIS_USE_API_KEY=1 to keep them (if you really want CLI to use the key)."""
    env = dict(os.environ)
    if os.environ.get("JARVIS_USE_API_KEY") not in ("1", "true", "yes"):
        env.pop("ANTHROPIC_API_KEY", None)
        env.pop("ANTHROPIC_AUTH_TOKEN", None)
    return env


async def stream_run(prompt: str, *, agent: str | None = None,
                     session_id: str | None = None) -> AsyncIterator[dict]:
    """Yield normalized UI events for a single command run."""
    cmd = build_command(prompt, agent=agent, session_id=session_id)
    yield {"type": "started", "command": " ".join(cmd[:3]) + " …", "agent": agent}
    proc = await asyncio.create_subprocess_exec(
        *cmd, cwd=str(REPO_ROOT), env=_child_env(),
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    assert proc.stdout is not None
    try:
        async for line in proc.stdout:
            line = line.strip()
            if not line:
                continue
            try:
                raw = json.loads(line)
            except json.JSONDecodeError:
                continue
            for ev in _normalize(raw):
                yield ev
    finally:
        err = b""
        if proc.stderr is not None:
            err = await proc.stderr.read()
        rc = await proc.wait()
        if rc != 0:
            yield {"type": "error", "code": rc,
                   "message": (err.decode(errors="replace") or "claude exited")[:2000]}
        yield {"type": "done", "code": rc}
