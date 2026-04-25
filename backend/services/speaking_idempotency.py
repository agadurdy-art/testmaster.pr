"""
Idempotency cache for /api/speaking/evaluate.

Why: a flaky network can make the browser retry a multipart POST after
the server has already done expensive work (Azure call + Sonnet eval).
Without a guard, the user is double-charged quota and we burn LLM tokens
twice. Solution: callers send `client_request_id` (UUIDv4); we cache the
successful result for 10 minutes keyed by (user_id, client_request_id).

Storage: MongoDB TTL collection `speaking_idempotency`. We use Mongo (not
in-process dict) because the API may run multiple uvicorn workers and a
retry can land on a different process. TTL is enforced server-side via a
Mongo TTL index on `expires_at` so we don't need a sweeper cron.

Only successes are cached. Failures shouldn't pin the user to the same
error response on retry — they should be free to try again.

Anonymous users get keyed by IP+email instead of user_id; the route
layer chooses the key.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

COLLECTION = "speaking_idempotency"
TTL_SECONDS = 10 * 60  # 10 minutes


async def ensure_indexes(db) -> None:
    """Create the TTL index. Safe to call multiple times — Mongo treats
    repeat createIndex on the same spec as a no-op."""
    if db is None:
        return
    try:
        await db[COLLECTION].create_index(
            "expires_at", expireAfterSeconds=0
        )
        await db[COLLECTION].create_index(
            [("scope", 1), ("client_request_id", 1)], unique=True
        )
    except Exception as exc:
        logger.warning("Failed to create idempotency indexes: %s", exc)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _scope_key(*, user_id: Optional[str], anon_key: Optional[str]) -> str:
    """Compose the namespace half of the cache key. Authenticated users
    use their user_id; anonymous users use a `anon:{ip}|{email}` shape
    composed by the caller and passed in as anon_key."""
    if user_id:
        return f"user:{user_id}"
    if anon_key:
        return anon_key
    return "anon:unknown"


async def lookup(
    db,
    *,
    user_id: Optional[str],
    anon_key: Optional[str],
    client_request_id: Optional[str],
) -> Optional[Dict[str, Any]]:
    """Return the cached result dict if a matching entry exists and hasn't
    expired. Returns None if the caller didn't supply a client_request_id."""
    if not client_request_id or db is None:
        return None
    scope = _scope_key(user_id=user_id, anon_key=anon_key)
    doc = await db[COLLECTION].find_one(
        {"scope": scope, "client_request_id": client_request_id},
        {"_id": 0, "result": 1, "expires_at": 1},
    )
    if not doc:
        return None
    expires = doc.get("expires_at")
    if isinstance(expires, datetime) and expires < _now():
        # TTL index will reap this; don't serve stale.
        return None
    return doc.get("result")


async def store(
    db,
    *,
    user_id: Optional[str],
    anon_key: Optional[str],
    client_request_id: Optional[str],
    result: Dict[str, Any],
) -> None:
    """Persist a successful result. No-op if client_request_id is missing
    (caller opted out of idempotency)."""
    if not client_request_id or db is None:
        return
    scope = _scope_key(user_id=user_id, anon_key=anon_key)
    expires = _now() + timedelta(seconds=TTL_SECONDS)
    try:
        await db[COLLECTION].update_one(
            {"scope": scope, "client_request_id": client_request_id},
            {
                "$set": {
                    "scope": scope,
                    "client_request_id": client_request_id,
                    "result": result,
                    "expires_at": expires,
                    "stored_at": _now(),
                }
            },
            upsert=True,
        )
    except Exception as exc:
        # Idempotency is best-effort — never fail the user-visible response
        # because the cache write hiccupped.
        logger.warning("Idempotency store failed: %s", exc)
