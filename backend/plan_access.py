"""
Plan Access Control Module
Defines plan tiers, feature access, and usage limits for Testmaster.
"""

PLAN_TIERS = {
    "free": 0,
    # Legacy GE (General English) tiers -- kept for GE-side billing.
    # Do NOT use for IELTS; IELTS uses weekly/monthly/exam below.
    "explorer": 1,
    "learner": 2,
    "achiever": 3,
    "master": 4,
    # New IELTS tiers (locked 2026-05-08, see project_ielts_ace_tier_quotas.md).
    "weekly": 2,    # 20 Liz / 3W / 2S per week
    "monthly": 4,   # 100 Liz / 10W / 10S per month
    "exam": 3,      # 200 Liz / 25W / 15S over 30-day pack
    "custom": 3,    # slider purchase; effective_tier resolved from price threshold
}

PLAN_FEATURES = {
    "free": {
        "unified_stages": ["stage_1"],
        # Cap matrix locked 2026-05-08: Free gets 5L / 1W / 1S per month so the
        # acquisition flow can show one full evaluation before the paywall.
        # Resets monthly via the period-keyed counter in services/usage_tracking.py.
        "max_liz_messages": 5,
        "writing_credits": 1,
        "speaking_credits": 1,
        "mastery_course": False,
        "advanced_mastery": False,
        "speaking_eval": True,
        "speaking_agent": False,
    },
    "explorer": {
        "unified_stages": "all",
        "max_liz_messages": 0,
        "speaking_credits": 1,
        "mastery_course": False,
        "advanced_mastery": False,
        "speaking_eval": True,
        "speaking_agent": False,
    },
    "learner": {
        "unified_stages": "all",
        "max_liz_messages": 50,
        "speaking_credits": 5,
        "mastery_course": True,
        "advanced_mastery": False,
        "speaking_eval": True,
        "speaking_agent": False,
    },
    "achiever": {
        "unified_stages": "all",
        "max_liz_messages": 150,
        "speaking_credits": 999,
        "mastery_course": True,
        "advanced_mastery": True,
        "speaking_eval": True,
        "speaking_agent": False,
    },
    "master": {
        "unified_stages": "all",
        "max_liz_messages": 999,
        "speaking_credits": 999,
        "mastery_course": True,
        "advanced_mastery": True,
        "speaking_eval": True,
        "speaking_agent": True,
    },
    # ====== IELTS plans (cap matrix locked 2026-05-08) ======
    # Feature copy tracks PlanCards.jsx + PricingTeaserDemo.jsx so UI promises
    # match backend gating. Caps are enforced per period via usage_tracking.
    "weekly": {
        "unified_stages": "all",
        "max_liz_messages": 20,          # 20 Liz / week
        "writing_credits": 3,             # 3 essays / week
        "speaking_credits": 2,            # 2 speaking evals / week
        "mastery_course": False,
        "advanced_mastery": False,
        "speaking_eval": True,
        "speaking_agent": False,
        "progress_charts": True,
        "band_rewrite": True,
        "email_reminders": True,
    },
    "monthly": {
        "unified_stages": "all",
        "max_liz_messages": 100,          # 100 Liz / month
        "writing_credits": 10,             # 10 essays / month
        "speaking_credits": 10,            # 10 speaking evals / month
        "mastery_course": True,
        "advanced_mastery": True,
        "speaking_eval": True,
        "speaking_agent": True,
        "progress_charts": True,
        "band_rewrite": True,
        "email_reminders": True,
        "sample_library": True,
        "priority_queue": True,
        "teacher_reports": True,
    },
    "exam": {
        "unified_stages": "all",
        "max_liz_messages": 200,          # 200 Liz / 30-day pack
        "writing_credits": 25,             # 25 essays / pack
        "speaking_credits": 15,            # 15 speaking evals / pack
        "mastery_course": False,
        "advanced_mastery": False,
        "speaking_eval": True,
        "speaking_agent": False,
        "full_mocks": True,
        "all_four_skills": True,
        "auto_expires_30d": True,
    },
    # Custom slider purchase: pool-based (not period). Real pool sizes are
    # derived from purchase price via custom_pools(); this entry is a feature
    # baseline only -- limit checks must read user.subscription.*_pool_total
    # / *_pool_used and call get_effective_plan() to know which feature set
    # the price unlocked.
    "custom": {
        "unified_stages": "all",
        "max_liz_messages": 0,             # not used; pool comes from subscription doc
        "writing_credits": 0,
        "speaking_credits": 0,
        "mastery_course": False,
        "advanced_mastery": False,
        "speaking_eval": True,
        "speaking_agent": False,
        "auto_expires_custom": True,
    },
}

PLAN_PRICES_USD = {
    # Legacy GE tiers
    "explorer": "4.99",
    "learner": "9.00",
    "achiever": "19.00",
    "master": "29.00",
    # New IELTS plans (locked 2026-05-08, see PlanCards.jsx)
    "weekly": "2.99",
    "monthly": "9.99",
    "exam": "19.99",
}

# VND prices — SePay (VietQR bank transfer) checkout.
# Rounded to friendly thousands (approx USD * 24,500 as of 2026-04).
# Update these when the FX rate drifts materially.
PLAN_PRICES_VND = {
    # Legacy GE tiers
    "explorer": "119000",
    "learner": "219000",
    "achiever": "459000",
    "master": "699000",
    # New IELTS plans (match PlanCards.jsx display)
    "weekly": "73000",
    "monthly": "243000",
    "exam": "487000",
}

SUPPORTED_CURRENCIES = ("USD", "VND")


def get_plan_price(plan_name: str, currency: str = "USD") -> str:
    """Return the string price for `plan_name` in the requested currency.
    Falls back to USD if the currency is unknown."""
    normalized = normalize_plan_name(plan_name)
    cur = (currency or "USD").upper()
    table = PLAN_PRICES_VND if cur == "VND" else PLAN_PRICES_USD
    return table.get(normalized, "0")

LEGACY_PLAN_ALIASES = {
    "starter": "learner",
    "booster": "achiever",
    "pro": "master",
}


def normalize_plan_name(plan_name: str) -> str:
    normalized = (plan_name or "free").strip().lower()
    return LEGACY_PLAN_ALIASES.get(normalized, normalized or "free")


def get_plan_label(plan_name: str) -> str:
    normalized = normalize_plan_name(plan_name)
    return normalized.replace("_", " ").title()


ADMIN_EMAILS_FOR_BYPASS = [
    "aga.durdy@gmail.com",
    "stemhousebenluc@gmail.com",
    "admin@ieltsace.com",
]


def is_admin_user(email: str) -> bool:
    if not email:
        return False
    return email.lower() in [e.lower() for e in ADMIN_EMAILS_FOR_BYPASS] or "aga.durdy" in email.lower()


def get_plan_features(plan_name: str, email: str = None) -> dict:
    if email and is_admin_user(email):
        return PLAN_FEATURES["master"]
    return PLAN_FEATURES.get(normalize_plan_name(plan_name), PLAN_FEATURES["free"])


def has_feature_access(user_plan: str, feature: str) -> bool:
    features = get_plan_features(user_plan)
    val = features.get(feature)
    if isinstance(val, bool):
        return val
    if isinstance(val, int):
        return val > 0
    if val == "all":
        return True
    return False


def can_access_stage(user_plan: str, stage_id: str) -> bool:
    features = get_plan_features(user_plan)
    allowed = features.get("unified_stages", [])
    if allowed == "all":
        return True
    return stage_id in allowed


def get_plan_tier(plan_name: str) -> int:
    return PLAN_TIERS.get(normalize_plan_name(plan_name), 0)


def plan_meets_minimum(user_plan: str, required_plan: str) -> bool:
    return get_plan_tier(user_plan) >= get_plan_tier(required_plan)


# ============================================================================
# Custom slider tier resolution + pool helpers (locked 2026-05-08)
#
# Custom is a one-time purchase priced via DaySlider.jsx ($1.20/day → $0.28/day,
# 3-365 days). The total purchase price decides which feature set the user
# unlocks AND how big each of the three quota pools is.
#
# Pool ratios (locked, Aga-approved):
#   $1 → ~13.33 Liz messages, ~1.67 essays, ~1.0 speaking evals
# Stored in user.subscription as *_pool_total / *_pool_used; period-style
# resets do NOT apply -- the package runs until any of (a) all three pools
# empty, (b) expires_at passes, whichever comes first.
# ============================================================================

CUSTOM_TIER_THRESHOLDS = (
    # (price_usd_min_inclusive, effective_tier)
    # Sorted high → low; first match wins in resolve_custom_tier.
    (14.99, "exam"),
    (8.99, "monthly"),
    (2.99, "weekly"),
)

CUSTOM_POOL_PER_DOLLAR = {
    # Coefficients derived from the Exam Pack reference point ($15 ⇒ 200/25/15).
    "liz": 200.0 / 15.0,         # ≈ 13.333
    "writing": 25.0 / 15.0,      # ≈ 1.667
    "speaking": 15.0 / 15.0,     # = 1.0
}


def resolve_custom_tier(price_usd) -> str:
    """Return the effective feature tier ('weekly'|'monthly'|'exam') unlocked
    by a Custom purchase of `price_usd`. Falls back to 'free' if the price
    is below the Weekly threshold (slider min ≈ $3.60 stays above it)."""
    try:
        price = float(price_usd)
    except (TypeError, ValueError):
        return "free"
    for threshold, tier in CUSTOM_TIER_THRESHOLDS:
        if price >= threshold:
            return tier
    return "free"


def custom_pools(price_usd) -> dict:
    """Compute the three quota pools (Liz, writing, speaking) for a Custom
    purchase. Returns ints with at-least-1 floor so a paid package always
    grants something. Free fallback returns zero pools."""
    try:
        price = float(price_usd)
    except (TypeError, ValueError):
        return {"liz": 0, "writing": 0, "speaking": 0}
    if price <= 0:
        return {"liz": 0, "writing": 0, "speaking": 0}
    return {
        "liz": max(1, round(price * CUSTOM_POOL_PER_DOLLAR["liz"])),
        "writing": max(1, round(price * CUSTOM_POOL_PER_DOLLAR["writing"])),
        "speaking": max(1, round(price * CUSTOM_POOL_PER_DOLLAR["speaking"])),
    }


def _now_iso() -> str:
    """Local helper -- avoids a hard import of datetime at module load."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def _is_expired(expires_at) -> bool:
    """Return True iff expires_at (ISO string or datetime) is in the past."""
    if not expires_at:
        return False
    try:
        from datetime import datetime, timezone
        if hasattr(expires_at, "tzinfo"):
            dt = expires_at
        else:
            raw = str(expires_at).replace("Z", "+00:00")
            dt = datetime.fromisoformat(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt < datetime.now(timezone.utc)
    except (ValueError, TypeError):
        return False


def get_effective_plan(user) -> str:
    """Resolve the *effective* plan name for `user`, normalizing Custom and
    handling expiry. Always returns one of: free / weekly / monthly / exam.

    Reads from user.subscription:
      - effective_tier: pre-resolved tier for Custom (set at checkout)
      - expires_at: ISO timestamp; once past, plan collapses to free
    Mongo doc and Pydantic model both supported via duck typing.
    """
    if user is None:
        return "free"
    plan = getattr(user, "plan", None) or (user.get("plan") if isinstance(user, dict) else None) or "free"
    plan = normalize_plan_name(plan)

    sub = getattr(user, "subscription", None)
    if sub is None and isinstance(user, dict):
        sub = user.get("subscription")
    if sub is None:
        return plan if plan != "custom" else "free"

    expires_at = getattr(sub, "expires_at", None) if not isinstance(sub, dict) else sub.get("expires_at")
    if _is_expired(expires_at):
        return "free"

    if plan == "custom":
        eff = getattr(sub, "effective_tier", None) if not isinstance(sub, dict) else sub.get("effective_tier")
        return normalize_plan_name(eff) if eff else "free"
    return plan


def get_quota(user, kind: str) -> dict:
    """Return a unified quota descriptor for `kind` in {liz, writing, speaking}.

    Shape:
      {
        "kind": "pool" | "period",
        "remaining": int,
        "total": int,
        "tier": str,
      }

    For Custom plans, reads pool_total/pool_used from subscription.
    For standard plans, returns the period cap from PLAN_FEATURES (caller
    is responsible for subtracting period usage from usage_tracking).
    """
    if kind not in ("liz", "writing", "speaking"):
        raise ValueError(f"unknown quota kind: {kind}")

    plan = "free"
    sub = None
    if user is not None:
        plan = getattr(user, "plan", None) or (user.get("plan") if isinstance(user, dict) else None) or "free"
        plan = normalize_plan_name(plan)
        sub = getattr(user, "subscription", None) if not isinstance(user, dict) else user.get("subscription")

    # Custom: pool semantics
    if plan == "custom" and sub is not None:
        if _is_expired(getattr(sub, "expires_at", None) if not isinstance(sub, dict) else sub.get("expires_at")):
            return {"kind": "pool", "remaining": 0, "total": 0, "tier": "free"}
        get = (lambda k: sub.get(k)) if isinstance(sub, dict) else (lambda k: getattr(sub, k, 0))
        total = int(get(f"{kind}_pool_total") or 0)
        used = int(get(f"{kind}_pool_used") or 0)
        eff = get("effective_tier") or "free"
        return {
            "kind": "pool",
            "remaining": max(0, total - used),
            "total": total,
            "tier": normalize_plan_name(eff),
        }

    # Standard plan: period cap from PLAN_FEATURES
    eff_plan = get_effective_plan(user)
    feats = PLAN_FEATURES.get(eff_plan, PLAN_FEATURES["free"])
    field = {"liz": "max_liz_messages", "writing": "writing_credits", "speaking": "speaking_credits"}[kind]
    total = int(feats.get(field, 0) or 0)
    return {
        "kind": "period",
        "remaining": total,   # caller subtracts usage_tracking counter
        "total": total,
        "tier": eff_plan,
    }
