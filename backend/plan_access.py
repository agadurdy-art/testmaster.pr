"""
Plan Access Control Module
Defines plan tiers, feature access, and usage limits for Testmaster.
"""

# Plan hierarchy (higher index = more access)
PLAN_TIERS = {
    "free": 0,
    "explorer": 1,
    "learner": 2,
    "achiever": 3,
    "master": 4,
}

# What each plan unlocks
PLAN_FEATURES = {
    "free": {
        "unified_stages": ["stage_1"],  # Only Stage 1 free
        "max_liz_messages": 0,
        "mastery_course": False,
        "advanced_mastery": False,
        "speaking_eval": False,
        "speaking_agent": False,
    },
    "explorer": {
        "unified_stages": "all",  # All 8 stages
        "max_liz_messages": 0,
        "mastery_course": False,
        "advanced_mastery": False,
        "speaking_eval": False,
        "speaking_agent": False,
    },
    "learner": {
        "unified_stages": "all",
        "max_liz_messages": 50,
        "mastery_course": True,
        "advanced_mastery": False,
        "speaking_eval": False,
        "speaking_agent": False,
    },
    "achiever": {
        "unified_stages": "all",
        "max_liz_messages": 150,
        "mastery_course": True,
        "advanced_mastery": True,
        "speaking_eval": True,
        "speaking_agent": False,
    },
    "master": {
        "unified_stages": "all",
        "max_liz_messages": 999,  # Effectively unlimited
        "mastery_course": True,
        "advanced_mastery": True,
        "speaking_eval": True,
        "speaking_agent": True,
    },
}

# PayPal pricing
PLAN_PRICES_USD = {
    "explorer": "4.99",
    "learner": "9.00",
    "achiever": "19.00",
    "master": "29.00",
}


def get_plan_features(plan_name: str) -> dict:
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
