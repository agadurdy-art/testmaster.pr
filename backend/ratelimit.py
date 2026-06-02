"""Lightweight in-memory IP rate limiting (F05-hardening / security backlog item A).

No new dependencies, no Redis — a sliding-window counter per (rule, client-IP).
Single-instance assumption (Railway runs one backend instance); if the service is
ever scaled horizontally, move the store to Redis. Fail-OPEN: any limiter error
lets the request through (never break the app because of the limiter).

Wired as an HTTP middleware in server.py. Targets the abuse-prone surfaces:
  - auth (login/register/social)        → brute-force
  - password/email senders              → email-bomb abuse
  - /evaluate* (LLM-backed, costly)      → burst / cost (per-user quota still applies)
  - evaluate-anonymous (no auth!)        → strictest; quota can't protect it
  - study-time heartbeat                 → flood cap
"""
from __future__ import annotations

import os
import time
from collections import deque

from starlette.requests import Request
from starlette.responses import JSONResponse

# Each rule: (match_fn, bucket, limit, window_seconds). First match wins.
# Limits are per client IP within the rolling window. Env-overridable multiplier
# RATE_LIMIT_FACTOR scales every limit (e.g. 2 = double everything); 0 disables.
_FACTOR = float(os.environ.get("RATE_LIMIT_FACTOR", "1") or "1")


def _has(*subs):
    return lambda p: any(s in p for s in subs)


def _starts(*prefixes):
    return lambda p: p.startswith(prefixes)


# Order matters — most specific first.
_RULES = [
    # Anonymous (unauthenticated) LLM eval — no quota can protect it → strictest.
    (_has("evaluate-anonymous"),                         "eval_anon",   12,  3600),
    # Password / email senders → email-bomb protection.
    (_has("/auth/forgot-password", "/auth/reset-password",
          "/auth/resend-verification", "/auth/verify-email"), "auth_email", 6,  900),
    # Auth brute-force.
    (_has("/auth/login", "/auth/register", "/auth/facebook-login",
          "/auth/google/session"),                       "auth",        12,  300),
    # Costly LLM-backed evaluators (per-user quota still applies on top).
    (_has("/evaluate"),                                  "eval",        45,  300),
    # Study-time heartbeat (~30s tick) — generous but capped against floods.
    (_has("/study-time/heartbeat"),                      "heartbeat",  150,   60),
]

# store[(bucket, ip)] = deque[timestamps]
_store: dict[tuple[str, str], deque] = {}
_MAX_KEYS = 50_000  # safety cap; prune empties when exceeded


def client_ip(request: Request) -> str:
    """Real client IP. Trust X-Forwarded-For (set by Railway/Vercel ingress) if
    present, else the socket peer. Mirrors the existing pattern in routes."""
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def _match(path: str):
    for fn, bucket, limit, window in _RULES:
        if fn(path):
            return bucket, limit, window
    return None


def _allow(bucket: str, ip: str, limit: int, window: int) -> tuple[bool, int]:
    """Return (allowed, retry_after_seconds)."""
    if _FACTOR <= 0:
        return True, 0
    limit = max(1, int(limit * _FACTOR))
    now = time.monotonic()
    key = (bucket, ip)
    dq = _store.get(key)
    if dq is None:
        dq = deque()
        _store[key] = dq
    cutoff = now - window
    while dq and dq[0] < cutoff:
        dq.popleft()
    if not dq and len(_store) > _MAX_KEYS:
        _store.pop(key, None)
        _prune()
        _store[key] = dq
    if len(dq) >= limit:
        retry = int(window - (now - dq[0])) + 1
        return False, max(1, retry)
    dq.append(now)
    return True, 0


def _prune() -> None:
    for k in [k for k, v in _store.items() if not v]:
        _store.pop(k, None)


async def rate_limit_middleware(request: Request, call_next):
    try:
        if request.method == "OPTIONS":  # never limit CORS preflight
            return await call_next(request)
        path = request.url.path
        rule = _match(path)
        if rule is not None:
            bucket, limit, window = rule
            ok, retry = _allow(bucket, client_ip(request), limit, window)
            if not ok:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please slow down.",
                             "retry_after": retry},
                    headers={"Retry-After": str(retry)},
                )
    except Exception:  # noqa: BLE001 — fail open, never break the request path
        pass
    return await call_next(request)
