"""
Route timeout + client-disconnect middleware — Faz 6.

Two problems this solves:

1. **Route-level timeout.** Service-layer code already wraps individual LLM
   calls in `asyncio.wait_for` (75s for writing/speaking eval). But anything
   *outside* that — Azure speech, Mongo writes, idempotency lookups, audio
   read/write — has no upper bound. A single slow Mongo round-trip during a
   network blip could keep a worker pinned for minutes. This middleware caps
   each request at a per-prefix limit; on timeout the worker is freed, the
   client sees a clean 504, and any in-flight `await` (including Sonnet)
   receives `CancelledError` so we stop paying for it.

2. **Client disconnect.** Mobile clients backgrounding the tab, network
   drops, or impatient refreshes leave the server happily finishing the eval
   into the void — Sonnet tokens billed, no one to deliver them to. The
   middleware races the handler against a 2s-poll of `request.is_disconnected()`;
   if the client is gone, it cancels the handler so the LLM call aborts.

Per-prefix timeouts (longest-prefix-wins):
  /api/writing-practice/evaluate    → 100s  (Sonnet 75s + I/O headroom)
  /api/speaking/evaluate            → 110s  (Azure + Sonnet + audio I/O)
  /api/speaking/evaluate-fulltest   → 180s  (3 parts in parallel; Azure dominates)
  /api/admin                        → 30s   (only aggregations)
  default                           → 120s

These can be tuned via env (`ROUTE_TIMEOUT_<KEY>_S`) without code change.
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

logger = logging.getLogger(__name__)


def _env_seconds(key: str, default: float) -> float:
    raw = os.environ.get(key)
    if not raw:
        return default
    try:
        return float(raw)
    except ValueError:
        logger.warning("invalid float for %s: %r — falling back to %s", key, raw, default)
        return default


# Longest prefix wins. Order matters for ties but Python dicts preserve order.
TIMEOUTS_S: dict[str, float] = {
    "/api/speaking/evaluate-fulltest": _env_seconds("ROUTE_TIMEOUT_FULLTEST_S", 180.0),
    "/api/speaking/evaluate":          _env_seconds("ROUTE_TIMEOUT_SPEAKING_S", 110.0),
    "/api/writing-practice/evaluate":  _env_seconds("ROUTE_TIMEOUT_WRITING_S", 100.0),
    "/api/cambridge/evaluate/writing": _env_seconds("ROUTE_TIMEOUT_CAMBRIDGE_WRITING_S", 100.0),
    "/api/admin":                      _env_seconds("ROUTE_TIMEOUT_ADMIN_S", 30.0),
}
DEFAULT_TIMEOUT_S = _env_seconds("ROUTE_TIMEOUT_DEFAULT_S", 120.0)

# Disconnect polling cadence. Keep it modest: too tight wastes CPU on every
# in-flight request; too loose and we keep billing Sonnet after the user gave
# up. 2s ≈ 1-2 Sonnet token-decode windows, which is a reasonable trade.
DISCONNECT_POLL_S = _env_seconds("ROUTE_DISCONNECT_POLL_S", 2.0)

# Tiny endpoints that should *never* be subjected to disconnect monitoring
# (healthchecks, static, websocket upgrades). Substring match.
DISCONNECT_EXEMPT_SUBSTRINGS = ("/health", "/api/health", "/static/", "/api/static/")


def resolve_timeout(path: str) -> float:
    """Pick the longest matching prefix from TIMEOUTS_S, else default."""
    best_prefix = ""
    best_value = DEFAULT_TIMEOUT_S
    for prefix, value in TIMEOUTS_S.items():
        if path.startswith(prefix) and len(prefix) > len(best_prefix):
            best_prefix = prefix
            best_value = value
    return best_value


class RouteLifecycleMiddleware(BaseHTTPMiddleware):
    """Single middleware combining timeout + disconnect-driven cancellation."""

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Cheap path → skip all the machinery so health probes stay fast.
        if any(s in path for s in DISCONNECT_EXEMPT_SUBSTRINGS):
            return await call_next(request)

        timeout = resolve_timeout(path)

        handler_task: asyncio.Task[Response] = asyncio.create_task(call_next(request))
        disconnect_task: asyncio.Task[Optional[str]] = asyncio.create_task(
            self._watch_disconnect(request, handler_task)
        )

        try:
            done, _pending = await asyncio.wait(
                {handler_task, disconnect_task},
                timeout=timeout,
                return_when=asyncio.FIRST_COMPLETED,
            )
        except asyncio.CancelledError:
            handler_task.cancel()
            disconnect_task.cancel()
            raise

        # Case 1: route exceeded its budget → 504 + cancel everything.
        if handler_task not in done:
            handler_task.cancel()
            disconnect_task.cancel()
            logger.warning(
                "route timeout %s after %.1fs (limit %.1fs)",
                path, timeout, timeout,
            )
            return JSONResponse(
                status_code=504,
                content={
                    "code": "request_timeout",
                    "message": (
                        "The request took too long and was cancelled. "
                        "Please try again."
                    ),
                    "path": path,
                    "timeout_seconds": timeout,
                },
            )

        # Case 2: handler finished normally OR disconnect monitor cancelled it.
        disconnect_task.cancel()
        try:
            return handler_task.result()
        except asyncio.CancelledError:
            # The disconnect monitor pulled the rug — return a Response the
            # client will never see, but Starlette still needs a value.
            return Response(status_code=499)  # 499 = client closed request

    async def _watch_disconnect(
        self, request: Request, handler_task: asyncio.Task
    ) -> Optional[str]:
        """Cancel handler_task when the client goes away. Returns the reason
        so the outer wait can log it."""
        try:
            while not handler_task.done():
                await asyncio.sleep(DISCONNECT_POLL_S)
                try:
                    gone = await request.is_disconnected()
                except Exception:
                    # is_disconnected() can raise after some ASGI shutdowns;
                    # treat that as "we don't know" and keep going.
                    continue
                if gone:
                    logger.info(
                        "client disconnect on %s — cancelling handler",
                        request.url.path,
                    )
                    handler_task.cancel()
                    return "disconnected"
            return "handler_done"
        except asyncio.CancelledError:
            return "monitor_cancelled"
