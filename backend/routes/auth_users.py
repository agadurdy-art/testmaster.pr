"""
Auth — user profile / usage / onboarding endpoints
==================================================
Single job: authenticated user endpoints — usage counters, profile fetch,
and OnboardingQuiz persistence (with input normalizers).
Extracted from routes/auth.py (Faz 1 refactor, 2026-07-02).
"""
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from fastapi import HTTPException, Depends
from pydantic import BaseModel, ConfigDict

from services.usage_tracking import get_all_counters
import auth_session  # opaque session tokens (audit F01/F03)

from routes.auth_common import (
    router,
    User,
    _check_plan_expiry,
)

db = None
logger = logging.getLogger(__name__)


def set_db(database):
    global db
    db = database


@router.get("/users/{user_id}/usage")
async def get_user_usage(user_id: str, caller: Dict[str, Any] = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Return the current-period quota + used counts for every tracked counter.

    Response shape:
        {
          "plan": "learner",
          "period": "2026-04",
          "counters": {
            "evaluations": {"used": 12, "quota": 100, "remaining": 88, "unlimited": false, "allowed": true, ...},
            "mocks": {...},
            "speaking_minutes": {...}
          }
        }
    The dashboard usage meter consumes this verbatim.
    """
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return await get_all_counters(db, user)


@router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, caller: Dict[str, Any] = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = await _check_plan_expiry(user)
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    user.pop("password_hash", None)
    return User(**user)


# ─── Onboarding persistence ──────────────────────────────────────────────────

_ALLOWED_LANGS = {"en", "vi", "tr", "zh", "ar", "ko", "th", "ja", "es", "pt", "ru", "id"}
_ALLOWED_MODES = {"ielts", "general_english"}


class OnboardingPayload(BaseModel):
    """Accepts the OnboardingQuiz state. Tolerant of extra fields so the
    frontend can evolve without breaking this contract."""
    model_config = ConfigDict(extra="ignore")
    path: Optional[str] = None  # "ielts" | "general"
    targetBand: Optional[float] = None
    currentBand: Optional[float] = None
    examDate: Optional[str] = None  # ISO string or free-text
    language: Optional[Dict[str, Any]] = None  # {name, code?} — UI/feedback language
    # B3 — "Liz remembers your goals". nativeLanguage powers Liz's L1-aware
    # error coaching ("Vietnamese speakers often drop articles" etc.).
    # motivation is short free-text Liz weaves into encouragement copy
    # ("you said you want this for grad school admissions — let's get you
    # to 7.0 by your exam date"). Both optional; missing values fall back
    # to Liz's generic warm-but-firm voice.
    nativeLanguage: Optional[Dict[str, Any]] = None  # {name, code?}
    motivation: Optional[str] = None
    weakSkills: Optional[list] = None  # e.g. ["writing","speaking"] — user-declared


def _normalize_language_code(lang_field: Any) -> Optional[str]:
    """Extract ISO 639-1 code from the quiz's language object."""
    if not lang_field:
        return None
    if isinstance(lang_field, str):
        candidate = lang_field
    elif isinstance(lang_field, dict):
        candidate = lang_field.get("code") or lang_field.get("name") or ""
    else:
        candidate = str(lang_field)
    code = candidate.strip().lower().split("-")[0][:2]
    return code if code in _ALLOWED_LANGS else None


def _normalize_native_language(lang_field: Any) -> Optional[Dict[str, str]]:
    """Native language is stored as {code, name} so Liz can address learners
    by both ('Vietnamese speakers...' / 'Tiếng Việt'). Unlike feedback_language
    we don't gate on the 12-lang allow-list — students may speak languages
    we don't translate UI for, and Liz still benefits from knowing it."""
    if not lang_field:
        return None
    if isinstance(lang_field, str):
        # Bare-string input — keep the name only; downstream prompt formatting
        # uses `name` so missing code is harmless and beats a wrong-guess code.
        name = lang_field.strip()
        return {"name": name[:48], "code": ""} if name else None
    if isinstance(lang_field, dict):
        name = (lang_field.get("name") or "").strip()
        code = (lang_field.get("code") or "").strip().lower()
        if not (name or code):
            return None
        return {"name": name[:48], "code": code[:5]}
    return None


def _normalize_motivation(value: Any) -> Optional[str]:
    """Free-text reason for studying. Capped at 240 chars (about a tweet)
    so it can be cleanly inlined in Liz's prompt without runaway tokens."""
    if not value:
        return None
    text = str(value).strip()
    return text[:240] if text else None


def _normalize_weak_skills(value: Any) -> Optional[list]:
    """User-declared problem areas. Stored as the canonical 4-skill set so
    Liz can prioritize without parsing freeform input."""
    if not value or not isinstance(value, list):
        return None
    valid = {"listening", "reading", "writing", "speaking"}
    cleaned = [s.strip().lower() for s in value if isinstance(s, str)]
    return [s for s in cleaned if s in valid] or None


def _normalize_learning_mode(path: Optional[str]) -> Optional[str]:
    if not path:
        return None
    p = path.strip().lower()
    if p in {"ielts", "ielts_ace", "ielts-ace"}:
        return "ielts"
    if p in {"general", "general_english", "general-english", "ge"}:
        return "general_english"
    return None


def _normalize_exam_date(value: Any) -> Optional[str]:
    """Accept Date-ish inputs, return ISO YYYY-MM-DD when possible."""
    if not value:
        return None
    if isinstance(value, str):
        # Already a string — store as-is (trim length to something safe)
        return value.strip()[:32] or None
    # Frontend may JSON-serialize Date objects as ISO strings; other shapes we
    # just stringify defensively.
    return str(value)[:32]


@router.post("/users/{user_id}/onboarding", response_model=User)
async def save_onboarding(
    user_id: str,
    payload: OnboardingPayload,
    caller: Dict[str, Any] = Depends(auth_session.current_user),
):
    """Persist OnboardingQuiz completion and mark the user onboarded.

    Idempotent: posting again simply overwrites with the latest values.
    """
    auth_session.require_self_or_admin(user_id, caller)
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update: Dict[str, Any] = {}
    mode = _normalize_learning_mode(payload.path)
    if mode:
        update["learning_mode"] = mode
    if payload.targetBand is not None:
        try:
            tb = float(payload.targetBand)
            if 0 <= tb <= 9:
                update["target_band"] = round(tb * 2) / 2
        except (TypeError, ValueError):
            pass
    if payload.currentBand is not None:
        try:
            cb = float(payload.currentBand)
            if 0 <= cb <= 9:
                update["current_band"] = round(cb * 2) / 2
        except (TypeError, ValueError):
            pass
    exam_date = _normalize_exam_date(payload.examDate)
    if exam_date:
        update["exam_date"] = exam_date
    lang = _normalize_language_code(payload.language)
    if lang:
        update["feedback_language"] = lang

    native = _normalize_native_language(payload.nativeLanguage)
    if native:
        update["native_language"] = native
    motivation = _normalize_motivation(payload.motivation)
    if motivation:
        update["motivation"] = motivation
    declared_weak = _normalize_weak_skills(payload.weakSkills)
    if declared_weak:
        update["declared_weak_skills"] = declared_weak

    # First completion only — subsequent partial patches (e.g. the Progress
    # page updating just targetBand) must not re-flip the completion timestamp.
    if not user.get("onboarding_complete"):
        update["onboarding_complete"] = True
        update["onboarding_completed_at"] = datetime.now(timezone.utc).isoformat()

    if not update:
        # No-op patch — avoid an empty $set which Mongo rejects.
        refreshed = user
    else:
        await db.users.update_one({"id": user_id}, {"$set": update})
        refreshed = None  # force a re-read below

    if refreshed is None:
        refreshed = await db.users.find_one({"id": user_id}, {"_id": 0})
    if isinstance(refreshed.get("created_at"), str):
        refreshed["created_at"] = datetime.fromisoformat(refreshed["created_at"])
    refreshed.pop("password_hash", None)
    return User(**refreshed)
