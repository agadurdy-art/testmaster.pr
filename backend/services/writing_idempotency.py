"""
Idempotency cache for the IELTS Writing evaluator endpoints.

Why: Writing evaluation is the most expensive single LLM call in the
product (Sonnet, ~2000 output tokens × ~1500 input tokens against a
cached 230-line rubric). A user pressing Submit twice — or a flaky
network triggering a browser retry — was billing the API twice and
producing two distinct results. Worse: the user, seeing the second
spinner, sometimes refreshed, billing a third call. Three Sonnet calls
to grade one essay was a real cost-leakage vector.

Solution mirrors `speaking_idempotency.py`: callers must send a stable
`client_request_id` (UUIDv4 generated client-side and stable across
retries). We cache the successful result in MongoDB for 10 minutes,
keyed by (scope, client_request_id). Repeat submissions return the
cached payload without re-invoking Sonnet.

Why a separate module (not generalize speaking_idempotency.py):
    - Different collection name → easier to inspect/clean per surface.
    - Future divergence likely: writing results are large (~30KB) while
      speaking is smaller; storage limits and TTL may need to differ.
    - Keeping the abstraction explicit per surface avoids accidental
      cross-surface key collisions.

Only successes are cached. Failures stay free to retry — we never want
a transient 5xx pinned for 10 minutes.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

COLLECTION = "writing_idempotency"
TTL_SECONDS = 10 * 60  # 10 minutes — matches speaking surface


async def ensure_indexes(db) -> None:
    """Create the TTL + unique compound index. Idempotent (Mongo no-ops
    when the spec already exists)."""
    if db is None:
        return
    try:
        await db[COLLECTION].create_index("expires_at", expireAfterSeconds=0)
        await db[COLLECTION].create_index(
            [("scope", 1), ("client_request_id", 1)], unique=True
        )
    except Exception as exc:
        logger.warning("Failed to create writing idempotency indexes: %s", exc)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _scope_key(*, user_id: Optional[str], anon_key: Optional[str]) -> str:
    """Compose the namespace half of the cache key.

    Authenticated users use `user:{user_id}`; anonymous callers
    (`/public/evaluate-essay`) pass an `anon:{ip}|{email}` key composed
    by the route layer. Falls back to `anon:unknown` if neither is set,
    which still scopes per-process but offers weak deduplication."""
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
    """Return the cached result if a matching unexpired entry exists.

    Returns None when:
      - caller didn't send a client_request_id (opt-out / legacy client)
      - no cache hit
      - entry exists but expires_at is past (TTL index will reap it shortly)
    """
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
    """Persist a successful evaluation result. No-op when the caller
    opted out of idempotency (no client_request_id).

    Idempotency is best-effort: a failed cache write must NOT propagate
    to the user — they already have their result, the cache miss only
    means the next retry would re-bill us. We log and move on."""
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
        logger.warning("Writing idempotency store failed: %s", exc)
