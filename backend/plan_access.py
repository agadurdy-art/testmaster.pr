"""
Plan Access Control Module
Defines plan tiers, feature access, and usage limits for Testmaster.
"""

PLAN_TIERS = {
    "free": 0,
    "explorer": 1,
    "learner": 2,
    "achiever": 3,
    "master": 4,
}

PLAN_FEATURES = {
    "free": {
        "unified_stages": ["stage_1", "stage_2"],
        "max_liz_messages": 5,
        "speaking_credits": 0,
        "mastery_course": False,
        "advanced_mastery": False,
        "speaking_eval": False,
        "speaking_agent": False,
    },
    "explorer": {
        "unified_stages": "all",
        "max_liz_messages": 15,
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
}

PLAN_PRICES_USD = {
    "explorer": "4.99",
    "learner": "9.00",
    "achiever": "19.00",
    "master": "29.00",
}


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
    return PLAN_FEATURES.get(plan_name, PLAN_FEATURES["free"])


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
    return PLAN_TIERS.get(plan_name, 0)


def plan_meets_minimum(user_plan: str, required_plan: str) -> bool:
    return get_plan_tier(user_plan) >= get_plan_tier(required_plan)
