"""
Reading Question Bank API Routes
================================
Mirrors routes/listening_qb.py for the reading skill so the frontend can
post real answers to the server instead of recomputing scores client-side
(asymmetry between the two skills, see task #139).

Endpoints
---------
  GET  /api/reading/modules                List mastery reading modules.
  GET  /api/reading/module/{module_id}     Fetch passage + questions
                                           (answers stripped).
  POST /api/reading/evaluate               Score user responses, return
                                           feedback bundle compatible with
                                           the listening evaluate response.

Reuses cambridge helpers (compare_answers, calculate_band_from_percentage,
generate_explanation, get_skill_tip, extract_evidence_text,
classify_reason_code) for parity with cambridge / full-test scoring.
"""

from fastapi import APIRouter, HTTPException, Body, Query
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/reading", tags=["Reading Question Bank"])


# ---------- Cambridge shared helpers (best-effort import) ----------

try:
    from routes.cambridge import (
        compare_answers as cambridge_compare,
        calculate_band_from_percentage,
        get_skill_tip,
        generate_explanation as cambridge_generate_explanation,
        extract_evidence_text,
        classify_reason_code,
    )
    CAMBRIDGE_HELPERS_AVAILABLE = True
except Exception as exc:  # pragma: no cover — defensive fallback
    CAMBRIDGE_HELPERS_AVAILABLE = False
    print(f"⚠️  reading_qb: cambridge helpers unavailable: {exc}")


# ---------- Module loaders ----------

def _load_module(module_id: str) -> Optional[Dict[str, Any]]:
    """Look up a reading module by id across academic + general mastery
    content. Returns None if not found in either."""
    try:
        from content.reading.mastery import (
            get_mastery_reading_by_id,
            get_mastery_general_by_id,
        )
    except ImportError:
        return None

    module = get_mastery_reading_by_id(module_id)
    if module:
        return {**module, "track": module.get("track", "academic")}
    module = get_mastery_general_by_id(module_id)
    if module:
        return {**module, "track": module.get("track", "general")}
    return None


def _module_summary(module: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "module_id": module.get("module_id"),
        "title": module.get("title"),
        "topic": module.get("topic"),
        "band_range": module.get("band_target") or module.get("band_range"),
        "track": module.get("track", "academic"),
        "question_type": module.get("question_type"),
        "text_type": module.get("text_type"),
        "word_count": module.get("word_count"),
        "question_count": len(module.get("questions", [])),
    }


# ---------- GET /modules ----------

@router.get("/modules")
async def list_reading_modules(
    track: Optional[str] = Query(None, description="academic | general"),
    topic: Optional[str] = Query(None),
    question_type: Optional[str] = Query(None),
    band: Optional[str] = Query(None),
):
    """List reading modules with optional filters. Mirrors
    /api/listening/modules so the frontend can use a single picker
    pattern for both skills."""
    try:
        from content.reading.mastery import (
            get_all_mastery_reading_modules,
            get_all_mastery_general_modules,
        )
    except ImportError:
        return {"success": True, "total": 0, "modules": []}

    modules: List[Dict[str, Any]] = []
    if track in (None, "academic"):
        modules.extend(get_all_mastery_reading_modules())
    if track in (None, "general"):
        modules.extend(get_all_mastery_general_modules())

    if topic:
        modules = [m for m in modules if (m.get("topic") or "").lower() == topic.lower()]
    if question_type:
        modules = [m for m in modules if m.get("question_type") == question_type]
    if band:
        modules = [m for m in modules if (m.get("band_target") or m.get("band_range") or "").startswith(band)]

    return {
        "success": True,
        "total": len(modules),
        "modules": [_module_summary(m) for m in modules],
    }


# ---------- GET /module/{module_id} ----------

@router.get("/module/{module_id}")
async def get_reading_module(module_id: str):
    """Return passage + questions with answers stripped. Frontend submits
    answers back via POST /evaluate."""
    module = _load_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail=f"Reading module '{module_id}' not found")

    questions_without_answers = []
    for q in module.get("questions", []):
        q_copy = {
            "id": q.get("id"),
            "type": q.get("type", module.get("question_type", "multiple_choice")),
            "question": q.get("question") or q.get("statement") or q.get("text", ""),
        }
        if "options" in q:
            q_copy["options"] = q["options"]
        if "items" in q:
            q_copy["items"] = q["items"]
            q_copy["match_options"] = q.get("match_options") or q.get("options", [])
        questions_without_answers.append(q_copy)

    return {
        "success": True,
        "module": {
            **_module_summary(module),
            "passage": module.get("passage", ""),
            "questions": questions_without_answers,
            "tips": module.get("tips", []),
        },
    }


# ---------- POST /evaluate ----------

@router.post("/evaluate")
async def evaluate_reading_answers(
    module_id: str = Body(...),
    responses: List[Dict[str, Any]] = Body(...),
    band_range: Optional[str] = Body(None),
):
    """
    Evaluate reading answers server-side and return a feedback bundle
    that matches the listening evaluate response shape. The Results.js
    page reads `score.{correct,total,percentage}` as the authoritative
    totals (see task #141 fix), so percentages MUST be computed here.

    Payload:
    {
        "module_id": "technology_mc",
        "responses": [{"question_id": 1, "answer": "B"}, ...],
        "band_range": "6.0-7.0"
    }
    """
    module = _load_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail=f"Reading module '{module_id}' not found")

    questions = module.get("questions", [])
    passage_text = module.get("passage", "")

    # Index responses by question id; coerce ids to str so int/string
    # mismatches between content (int) and frontend (string) don't drop
    # answers silently.
    response_map: Dict[str, Any] = {
        str(r.get("question_id")): r.get("answer", "") for r in responses
    }

    correct = 0
    total = len(questions)
    mistakes: List[Dict[str, Any]] = []
    detailed_results: List[Dict[str, Any]] = []

    for q in questions:
        q_id = q.get("id")
        q_type = q.get("type", module.get("question_type", "multiple_choice"))
        user_answer = response_map.get(str(q_id), "")
        correct_answer = q.get("answer", "")

        # Compare with cambridge helper when available, else simple
        # case-insensitive equality.
        if CAMBRIDGE_HELPERS_AVAILABLE:
            is_correct = cambridge_compare(user_answer, correct_answer)
        else:
            is_correct = (
                str(user_answer or "").strip().lower()
                == str(correct_answer or "").strip().lower()
            )

        if is_correct:
            correct += 1

        # Per-question detail row used by the Results UI.
        detail: Dict[str, Any] = {
            "question_id": q_id,
            "question_type": q_type,
            "question_text": q.get("question") or q.get("statement", ""),
            "user_answer": user_answer if user_answer else "(no answer)",
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "skill_tested": q.get("skill_tested", []),
            "explanation": q.get("explanation"),
            "reason_code": None,
            "reason_label": None,
            "evidence_text": None,
            "skill_tip": None,
        }

        if CAMBRIDGE_HELPERS_AVAILABLE:
            if not is_correct:
                reason = classify_reason_code(user_answer, correct_answer, q_type)
                detail["reason_code"] = reason.get("code")
                detail["reason_label"] = reason.get("label")
                if passage_text:
                    detail["evidence_text"] = extract_evidence_text(correct_answer, passage_text)
            # Prefer the curated per-question explanation when present;
            # fall back to the generic cambridge generator.
            if not detail["explanation"]:
                detail["explanation"] = cambridge_generate_explanation(q_type, correct_answer, is_correct)
            detail["skill_tip"] = get_skill_tip("reading", q_type, 1 if is_correct else 0)

        if not is_correct:
            mistakes.append({
                "question_id": q_id,
                "question": detail["question_text"],
                "user_answer": detail["user_answer"],
                "correct_answer": correct_answer,
                "explanation": detail["explanation"],
                "evidence_text": detail["evidence_text"],
                "reason_label": detail["reason_label"],
            })

        detailed_results.append(detail)

    percentage = (correct / total) * 100 if total > 0 else 0.0

    if CAMBRIDGE_HELPERS_AVAILABLE:
        estimated_band = calculate_band_from_percentage(percentage)
    else:
        estimated_band = _fallback_reading_band(percentage)

    weak_skills = _identify_weak_skills(detailed_results)
    recommended_lessons = await _get_lesson_recommendations(
        topic=module.get("topic"),
        weak_skills=weak_skills,
        band_range=band_range or module.get("band_target") or "6.0-7.0",
    )
    root_cause_analysis = _build_reading_root_cause_analysis(detailed_results)
    study_plan = _build_reading_study_plan(
        estimated_band=estimated_band,
        weak_skills=weak_skills,
        recommended_lessons=recommended_lessons,
        root_cause_analysis=root_cause_analysis,
    )

    # Optional Sonnet enrichment (#146). Gated by SONNET_QB_ANALYSIS_ENABLED.
    # Falls back to the deterministic blocks above on any failure so a slow
    # or broken LLM never breaks an evaluation response.
    try:
        from services.sonnet_qb_advisor import sonnet_root_cause_and_plan
        sonnet_block = await sonnet_root_cause_and_plan(
            skill="reading",
            mistakes=mistakes,
            weak_skills=weak_skills,
            correct=correct,
            total=total,
            percentage=percentage,
            estimated_band=estimated_band,
        )
        if sonnet_block:
            primary_lesson = recommended_lessons[0] if recommended_lessons else {}
            if primary_lesson.get("lesson_path") and sonnet_block["study_plan"].get("roadmap_steps"):
                sonnet_block["study_plan"]["roadmap_steps"][0].setdefault(
                    "route", primary_lesson["lesson_path"]
                )
            root_cause_analysis = sonnet_block["root_cause_analysis"]
            study_plan = sonnet_block["study_plan"]
    except Exception as exc:  # pragma: no cover
        logger.warning("Sonnet QB advisor failed for reading: %s", exc)

    return {
        "success": True,
        "skill": "reading",
        "module_id": module_id,
        "score": {
            "correct": correct,
            "total": total,
            "percentage": round(percentage, 1),
        },
        "estimated_band": estimated_band,
        "mistakes": mistakes,
        "detailed_results": detailed_results,
        "weak_skills": weak_skills,
        "recommended_lessons": recommended_lessons,
        "feedback": _generate_overall_feedback(percentage, weak_skills),
        "root_cause_analysis": root_cause_analysis,
        "study_plan": study_plan,
    }


# ---------- Helpers (private) ----------

def _fallback_reading_band(percentage: float) -> float:
    """Percentage→band fallback when cambridge helpers cannot be imported.
    Calibrated to roughly match calculate_band_from_percentage."""
    if percentage >= 90:
        return 8.5
    if percentage >= 80:
        return 8.0
    if percentage >= 70:
        return 7.0
    if percentage >= 60:
        return 6.5
    if percentage >= 50:
        return 6.0
    if percentage >= 40:
        return 5.5
    if percentage >= 30:
        return 5.0
    if percentage >= 20:
        return 4.5
    return 4.0


def _identify_weak_skills(results: List[Dict[str, Any]]) -> List[str]:
    """Return skills where >=50% of questions tagged with that skill were
    answered incorrectly. Mirrors listening_qb.identify_weak_skills."""
    skill_counts: Dict[str, int] = {}
    skill_errors: Dict[str, int] = {}
    for r in results:
        for skill in r.get("skill_tested") or []:
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
            if not r.get("is_correct"):
                skill_errors[skill] = skill_errors.get(skill, 0) + 1
    return [
        skill for skill, count in skill_counts.items()
        if count and (skill_errors.get(skill, 0) / count) >= 0.5
    ]


def _build_reading_root_cause_analysis(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Summarise the dominant reading failure patterns. Returns the top
    four sub-skills by error count."""
    explanation_map = {
        "factual detail retrieval": "You are missing direct facts that are stated in the passage.",
        "main idea": "You need a stronger grasp of overall passage purpose before chasing details.",
        "inference": "You are missing implied meaning or the writer's stance.",
        "writer's opinion": "Distinguishing facts from the writer's opinion is breaking down.",
        "scanning": "Locating specific information in the passage is too slow or inaccurate.",
        "paraphrasing recognition": "You are missing matches when wording in the question differs from the passage.",
        "categorization": "Matching items to categories or speakers needs tighter elimination.",
        "summary skills": "Summary completion is leaking — focus on which words actually fit the gap.",
    }
    skill_counts: Dict[str, int] = {}
    for result in results:
        if result.get("is_correct"):
            continue
        skills = result.get("skill_tested") or ["factual detail retrieval"]
        for skill in skills:
            normalized = str(skill).lower()
            skill_counts[normalized] = skill_counts.get(normalized, 0) + 1

    return [
        {
            "code": code,
            "label": code.title(),
            "count": count,
            "impact": "high" if count >= 3 else "medium" if count == 2 else "targeted",
            "what_it_means": explanation_map.get(code, "This reading sub-skill needs more targeted practice."),
        }
        for code, count in sorted(skill_counts.items(), key=lambda item: item[1], reverse=True)[:4]
    ]


def _build_reading_study_plan(
    estimated_band: float,
    weak_skills: List[str],
    recommended_lessons: List[Dict[str, Any]],
    root_cause_analysis: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Reading roadmap parallel to listening's three-day plan."""
    top_cause = root_cause_analysis[0] if root_cause_analysis else {}
    primary_lesson = recommended_lessons[0] if recommended_lessons else {}

    return {
        "target_band": round(min(9.0, estimated_band + (1.0 if estimated_band < 6.5 else 0.5)), 1),
        "priority_skill": top_cause.get("label") or (weak_skills[0] if weak_skills else "Reading"),
        "top_root_cause": top_cause.get("code"),
        "roadmap_steps": [
            {
                "title": "Review the top lesson match",
                "why_now": primary_lesson.get("reason") or "Start with the lesson that targets your biggest reading gap.",
                "route": primary_lesson.get("lesson_path"),
            },
            {
                "title": "Replay every wrong item with passage evidence",
                "why_now": "Highlight the exact line in the passage that proves the correct answer before moving on.",
            },
            {
                "title": "Do a fresh timed passage",
                "why_now": "Confirm the weak skill improves on unfamiliar text, not just on the same module.",
            },
        ],
        "three_day_plan": [
            "Day 1: Review the linked lesson and label the dominant error pattern from your misses.",
            "Day 2: Re-read the passage and write the evidence sentence next to every wrong question.",
            "Day 3: Take a new reading module and compare your weakest skill before and after review.",
        ],
        "retest_strategy": "If the same weak skill recurs, slow your scanning and prioritise pinning evidence over speed.",
    }


async def _get_lesson_recommendations(
    topic: Optional[str],
    weak_skills: List[str],
    band_range: str,
) -> List[Dict[str, Any]]:
    """Fetch course-linked lesson suggestions; return [] if registry unavailable."""
    try:
        from server import db
        from services.lesson_registry import LessonRegistry
    except Exception:
        return []

    try:
        registry = LessonRegistry(db)
        band_score = (
            4.5 if band_range.startswith("4") else
            6.0 if band_range.startswith("5") or band_range.startswith("6") else
            7.5
        )
        return await registry.get_recommended_lessons(
            weaknesses=weak_skills or ["reading"],
            current_band=band_score,
            skill="reading",
            topic=topic,
            context=f"reading practice about {topic or 'general reading'}",
            limit=3,
        )
    except Exception as exc:
        print(f"⚠️  reading_qb lesson recommendations failed: {exc}")
        return []


def _generate_overall_feedback(percentage: float, weak_skills: List[str]) -> str:
    """Plain-English wrap-up shown above the question review."""
    if percentage >= 80:
        feedback = "Excellent performance! You demonstrated strong reading comprehension."
    elif percentage >= 60:
        feedback = "Good work — you understood most of the passage, but there's room to tighten weak areas."
    elif percentage >= 40:
        feedback = "You're making progress. Focus on the highlighted weak areas to improve your score."
    else:
        feedback = "Keep practising. Re-read the passage and use evidence-tracking to anchor each answer."

    if weak_skills:
        feedback += f" Pay special attention to: {', '.join(weak_skills[:3])}."
    return feedback
