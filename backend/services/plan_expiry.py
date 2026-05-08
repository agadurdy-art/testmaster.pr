"""
Shared plan-expiry enforcement.

Two distinct expiry paths converge here:

* Legacy `user.plan_expires_at` — set for the GE Stripe/SePay flow on
  weekly/monthly/exam upgrades that don't have their own subscription
  document. When the timestamp passes, the user is downgraded to 'free'
  and the (legacy) subscription label is cleared.

* Custom slider purchases — `user.plan == 'custom'` with the actual
  expiry recorded in `user.subscription.expires_at`. When that passes,
  the package's three pools are unreachable anyway (plan_access.get_quota
  returns total=0 for expired Custom), but the user.plan still reads
  'custom' which confuses every other surface (PlanCards, dashboard
  banner, Liz greeting, etc.). So the lazy on-read check here also
  rewrites user.plan -> 'free' and clears the subscription doc.

Why "lazy on-read" instead of a cron: webhooks miss, crons get
disabled accidentally, and we already have to fetch the user on every
authenticated request — checking expiry in that path is a single bool
comparison and never goes stale. tier_resolver already does this for
speaking; this helper exposes the same guarantee to Liz / writing /
mocks without duplicating logic.

Public surface (one function):
    async def enforce_plan_expiry(db, user) -> dict
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from plan_access import normalize_plan_name


def _parse_iso(value: Any) -> Optional[datetime]:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        dt = value
    else:
        try:
            dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except ValueError:
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _is_past(dt: Optional[datetime], now: datetime) -> bool:
    return dt is not None and dt < now


async def enforce_plan_expiry(db, user: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """If `user`'s plan or Custom package has expired, downgrade in-memory
    AND persist the downgrade. Returns the (possibly mutated) user dict.

    Idempotent: calling on an already-expired-and-downgraded user is a no-op.
    Safe with `db is None` (test path) — only the in-memory mutation runs.
    """
    if not user:
        return user

    now = datetime.now(timezone.utc)
    plan = normalize_plan_name(user.get("plan", "free"))

    legacy_expired = _is_past(_parse_iso(user.get("plan_expires_at")), now)

    custom_expired = False
    if plan == "custom":
        sub = user.get("subscription") or {}
        sub_expires = sub.get("expires_at") if isinstance(sub, dict) else getattr(sub, "expires_at", None)
        custom_expired = _is_past(_parse_iso(sub_expires), now)

    if not (legacy_expired or custom_expired):
        return user

    # Persist the downgrade. Failure here is non-fatal — we still mutate
    # in-memory so the *current* request sees the right plan; the next
    # request will retry the persist.
    if db is not None:
        try:
            await db.users.update_one(
                {"id": user["id"]},
                {
                    "$set": {
                        "plan": "free",
                        "plan_expires_at": None,
                        "subscription": None,
                    }
                },
            )
        except Exception:
            pass

    user["plan"] = "free"
    user["plan_expires_at"] = None
    user["subscription"] = None
    return user
