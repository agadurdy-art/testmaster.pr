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
    # New IELTS tiers (design handoff D4).
    "weekly": 2,    # feature-parity with learner (unlimited evals, no Liz)
    "monthly": 4,   # top-tier IELTS: Liz unlimited + samples + priority
    "exam": 3,      # 30-day burst: full mocks + all 4 skills
}

PLAN_FEATURES = {
    "free": {
        "unified_stages": ["stage_1"],
        # Small Liz preview allowance on free — gives new users a taste so
        # Monthly upgrade ("Liz unlimited") is the obvious next step. Resets
        # monthly via the period-keyed counter in services/usage_tracking.py.
        "max_liz_messages": 5,
        "speaking_credits": 0,
        "mastery_course": False,
        "advanced_mastery": False,
        "speaking_eval": False,
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
    # ====== IELTS plans (design handoff D4) ======
    # Feature copy tracks PlanCards.jsx so UI promises match backend gating.
    "weekly": {
        "unified_stages": "all",
        "max_liz_messages": 0,          # Liz locked until Monthly
        "speaking_credits": 999,         # "unlimited evaluations"
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
        "max_liz_messages": 999,         # "AI Tutor (Liz) unlimited"
        "speaking_credits": 999,
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
        "max_liz_messages": 0,
        "speaking_credits": 999,
        "mastery_course": False,
        "advanced_mastery": False,
        "speaking_eval": True,
        "speaking_agent": False,
        "full_mocks": True,              # "Full mock tests with timing"
        "all_four_skills": True,
        "auto_expires_30d": True,
    },
}

PLAN_PRICES_USD = {
    # Legacy GE tiers
    "explorer": "4.99",
    "learner": "9.00",
    "achiever": "19.00",
    "master": "29.00",
    # New IELTS plans
    "weekly": "2.99",
    "monthly": "8.99",
    "exam": "14.99",
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
    "monthly": "219000",
    "exam": "365000",
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
