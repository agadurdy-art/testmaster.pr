"""
Speaking-eval tier resolver
===========================
Decides, for a given user + speaking context, whether the call is allowed
and which evaluation mode (`full` Azure+Sonnet vs `basic` Whisper+Sonnet)
to run.

Public surface:

    resolve_speaking_eval(db, user) -> EvalDecision
        Read-only tier check. Use this *before* doing the expensive work
        so we can return 402 cleanly.

    record_speaking_eval(db, user, decision) -> None
        Atomically increments the period counter and (for free tier on the
        full taste) flips the speaking_taste_used flag. Call this *only on
        success* so failed evals don't burn quota.

Why a dedicated resolver (instead of stuffing logic into usage_tracking
directly): speaking has two orthogonal axes — quota AND mode. The eval
endpoint needs both decisions in one call, and free-tier mode depends
on whether the weekly taste was used. Keeping that fused logic in one
place avoids drift between "checked quota" and "decided mode".

This module is also responsible for plan-expiry enforcement: every
resolve call inspects user.plan_expires_at and downgrades to "free"
in-memory + on disk if the plan has expired. We don't trust webhooks —
explicit on-read check guarantees consistency even if a Stripe/SePay
event was missed.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from plan_access import is_admin_user, normalize_plan_name
from services.usage_tracking import (
    SPEAKING_QUOTAS,
    speaking_period_key_for_plan,
    speaking_period_resets_at,
    speaking_quota_for,
)


# ─── Data classes ────────────────────────────────────────────────────────────


@dataclass
class EvalDecision:
    allowed: bool
    mode: str                     # "full" | "basic"
    plan: str                     # effective plan after expiry check
    period_key: str
    used: int
    quota: int
    remaining: int
    upgrade_to: list
    resets_at: str                # ISO-8601 UTC
    taste_used: bool              # free-tier weekly taste flag (current state)
    counter_name: str             # e.g. "speaking_evals"
    taste_flag_name: str          # e.g. "speaking_taste_used"
    message: Optional[str] = None # 402 detail message when allowed=False

    def to_quota_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d.pop("counter_name", None)
        d.pop("taste_flag_name", None)
        return d


# ─── Plan expiry ─────────────────────────────────────────────────────────────


async def _enforce_plan_expiry(db, user: Dict[str, Any]) -> Dict[str, Any]:
    """If user.plan_expires_at is past, downgrade to 'free' and persist.
    Returns the (possibly mutated) user dict.

    Webhook misses (Stripe/SePay event dropped, IP blip, manual admin
    intervention) shouldn't strand a user on a paid plan they no longer
    own. Doing this check on every speaking-eval call is cheap (single
    Mongo update_one) and authoritative.
    """
    expires_at = user.get("plan_expires_at")
    if not expires_at:
        return user

    if isinstance(expires_at, datetime):
        exp_dt = expires_at
    else:
        try:
            exp_dt = datetime.fromisoformat(str(expires_at).replace("Z", "+00:00"))
        except ValueError:
            # Malformed — leave as-is rather than downgrading silently.
            return user

    if exp_dt.tzinfo is None:
        exp_dt = exp_dt.replace(tzinfo=timezone.utc)

    if exp_dt >= datetime.now(timezone.utc):
        return user  # still valid

    # Expired. Persist downgrade.
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
            # If the write fails we still return the in-memory downgrade so
            # the caller sees the correct effective plan. The next request
            # will retry the persist.
            pass
    user["plan"] = "free"
    user["plan_expires_at"] = None
    user["subscription"] = None
    return user


# ─── Counter / flag bookkeeping ──────────────────────────────────────────────


COUNTER_NAME = "speaking_evals"
TASTE_FLAG_NAME = "speaking_taste_used"


def _read_period_state(user: Dict[str, Any], period_key: str) -> Dict[str, Any]:
    bucket = (user.get("usage") or {}).get(period_key) or {}
    return {
        "used": int(bucket.get(COUNTER_NAME, 0) or 0),
        "taste_used": bool(bucket.get(TASTE_FLAG_NAME, False)),
    }


# ─── Resolution ──────────────────────────────────────────────────────────────


UPGRADE_TARGETS = {
    "free":     ["weekly", "monthly", "exam"],
    "weekly":   ["monthly", "exam"],
    "monthly":  ["exam"],
    "exam":     [],
    # Legacy GE plans nudge toward IELTS plans.
    "explorer": ["weekly", "monthly", "exam"],
    "learner":  ["monthly", "exam"],
    "achiever": ["monthly", "exam"],
    "master":   [],
}


FULL_TEST_PLANS = {"monthly", "exam", "master"}


async def resolve_speaking_eval(
    db,
    user: Dict[str, Any],
    *,
    context: str = "practice",
) -> EvalDecision:
    """Decide allow/mode/quota for a single speaking eval call.

    Side-effect: persists plan-expiry downgrade to disk if needed (but does
    NOT increment any counter; that is record_speaking_eval's job).

    `context` is the eval kind from the route layer (practice / qb / cambridge
    / full_test). Full Test sessions are gated to Monthly + Exam Pack tiers
    (Aga's pricing call 2026-04-30) — a Free or Weekly user hitting
    /evaluate-fulltest gets a clean `fulltest_locked` 402 instead of burning
    their per-part quota.
    """
    user = await _enforce_plan_expiry(db, user)

    plan, quota_cfg = speaking_quota_for(user)
    plan_norm = normalize_plan_name(plan)
    limit = int(quota_cfg["limit"])
    period_key = speaking_period_key_for_plan(plan_norm, user)
    state = _read_period_state(user, period_key)
    used = state["used"]
    taste_used = state["taste_used"]
    resets_at = speaking_period_resets_at(plan_norm, user)

    # Admins bypass quota entirely and always get full mode.
    is_admin = bool(user.get("email")) and is_admin_user(user["email"])
    if is_admin:
        return EvalDecision(
            allowed=True,
            mode="full",
            plan=plan_norm,
            period_key=period_key,
            used=used,
            quota=limit,
            remaining=max(limit - used, 0),
            upgrade_to=[],
            resets_at=resets_at.astimezone(timezone.utc).isoformat(),
            taste_used=taste_used,
            counter_name=COUNTER_NAME,
            taste_flag_name=TASTE_FLAG_NAME,
        )

    remaining = max(limit - used, 0)
    allowed = used < limit

    # Full Test gate — only Monthly and Exam Pack (and legacy Master) can run
    # a 3-part holistic eval. Block before considering the per-part quota so
    # the upgrade message stays specific.
    locked_message: Optional[str] = None
    if context == "full_test" and plan_norm not in FULL_TEST_PLANS:
        allowed = False
        locked_message = (
            "Full Test is available on the Monthly and Exam Pack plans."
        )

    # Mode decision.
    if not allowed:
        mode = "basic"  # nominal — never executed when allowed=False
    elif plan_norm == "free":
        # Free tier: first eval of the period = full taste, rest = basic.
        full_per_period = int(SPEAKING_QUOTAS["free"].get("full_per_period", 1))
        mode = "full" if (not taste_used and used < full_per_period) else "basic"
    else:
        mode = "full"

    decision = EvalDecision(
        allowed=allowed,
        mode=mode,
        plan=plan_norm,
        period_key=period_key,
        used=used,
        quota=limit,
        remaining=remaining,
        upgrade_to=UPGRADE_TARGETS.get(plan_norm, []),
        resets_at=resets_at.astimezone(timezone.utc).isoformat(),
        taste_used=taste_used,
        counter_name=COUNTER_NAME,
        taste_flag_name=TASTE_FLAG_NAME,
        message=(
            None if allowed
            else (
                locked_message
                or f"You've used all {limit} speaking evaluations for this period."
            )
        ),
    )
    return decision


async def record_speaking_eval(
    db,
    user: Dict[str, Any],
    decision: EvalDecision,
) -> None:
    """Increment the period counter atomically. Free-tier full-mode taste
    also flips the taste_used flag in the same write so a concurrent retry
    can't double-spend the taste."""
    if db is None:
        return
    is_admin = bool(user.get("email")) and is_admin_user(user["email"])
    if is_admin:
        return  # admins skip persistence (no quota, no taste)

    counter_path = f"usage.{decision.period_key}.{COUNTER_NAME}"
    update: Dict[str, Any] = {"$inc": {counter_path: 1}}

    if decision.plan == "free" and decision.mode == "full":
        flag_path = f"usage.{decision.period_key}.{TASTE_FLAG_NAME}"
        update["$set"] = {flag_path: True}

    await db.users.update_one({"id": user["id"]}, update)

    # Mirror in-memory so subsequent reads in the same request see fresh values.
    usage = dict(user.get("usage") or {})
    bucket = dict(usage.get(decision.period_key) or {})
    bucket[COUNTER_NAME] = int(bucket.get(COUNTER_NAME, 0) or 0) + 1
    if decision.plan == "free" and decision.mode == "full":
        bucket[TASTE_FLAG_NAME] = True
    usage[decision.period_key] = bucket
    user["usage"] = usage
