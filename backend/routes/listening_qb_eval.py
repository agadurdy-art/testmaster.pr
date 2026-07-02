"""
Listening QB — evaluation + band + root-cause/study-plan builders
=================================================================
Single job: score submitted answers, estimate the IELTS band, identify
weak skills, and build the root-cause analysis / study plan / lesson
recommendations returned by /api/listening/evaluate.
Extracted from routes/listening_qb.py (Faz 1 refactor, 2026-07-02).
"""

from fastapi import HTTPException, Body
from typing import Optional, List, Dict, Any
import logging

from routes.listening_qb_common import router

logger = logging.getLogger(__name__)


@router.post("/evaluate")
async def evaluate_listening_answers(
    set_id: str = Body(...),
    responses: List[Dict[str, Any]] = Body(...),
    band_range: Optional[str] = Body(None),
    user_id: Optional[str] = Body(None),
):
    """
    Evaluate user's listening answers.

    Payload:
    {
        "set_id": "ls_b45_001",
        "responses": [{"question_id": "q1", "answer": "15th"}, ...],
        "band_range": "4.0-5.0"
    }
    """
    from content.listening.listening_sets import get_listening_set_by_id

    listening_set = get_listening_set_by_id(set_id)

    if not listening_set:
        raise HTTPException(status_code=404, detail=f"Listening set '{set_id}' not found")

    # Create response map
    # Index responses by both raw and stringified question id so int<->str
    # mismatches between content and frontend payloads don't drop answers.
    response_map: Dict[Any, Any] = {}
    for r in responses:
        qid = r.get("question_id")
        ans = r.get("answer", "")
        response_map[qid] = ans
        response_map[str(qid)] = ans

    # Evaluate each question
    correct = 0
    total = len(listening_set["questions"])
    mistakes = []
    detailed_results = []

    for q in listening_set["questions"]:
        q_id = q["id"]
        raw_user_answer = response_map.get(q_id, response_map.get(str(q_id), ""))
        # Preserve list/dict shape for multi-MCQ and matching; only strip
        # plain strings. Calling .strip()/.lower() on a list previously
        # raised AttributeError and silently scored a 0.
        if isinstance(raw_user_answer, str):
            user_answer = raw_user_answer.strip()
        else:
            user_answer = raw_user_answer

        # Handle different question types
        if q["type"] == "matching":
            # For matching, answers is a dict
            correct_answers = q.get("answers", {})
            user_answers = {}
            if isinstance(user_answer, dict):
                user_answers = user_answer

            is_correct = user_answers == correct_answers
            correct_answer_display = correct_answers
        elif q["type"] in ("multiple_selection", "multi_mcq", "select_two", "select_three"):
            # IELTS "select TWO/THREE" — set equality, no partial credit.
            # See task #140: this case used to fall through the string
            # branch and crash on user_answer.lower().
            correct_answers_list = q.get("answers") or q.get("answer") or []
            if not isinstance(correct_answers_list, list):
                correct_answers_list = [correct_answers_list]
            user_list = user_answer if isinstance(user_answer, list) else (
                [user_answer] if user_answer else []
            )

            def _norm(x: Any) -> str:
                return str(x).strip().lower().replace(".", "").replace(",", "")

            is_correct = (
                bool(correct_answers_list)
                and {_norm(a) for a in user_list} == {_norm(a) for a in correct_answers_list}
            )
            correct_answer_display = correct_answers_list
        else:
            # Single-answer types (multiple_choice, fill_blank, short_answer,
            # note_completion, etc). Honour answer_variants for spelling/format
            # tolerance; both sides are normalised the same way.
            correct_answer = q.get("answer", "")
            answer_variants = q.get("answer_variants") or [correct_answer]

            def _norm(x: Any) -> str:
                return str(x).strip().lower().replace(".", "").replace(",", "")

            user_normalized = _norm(user_answer)
            is_correct = (
                bool(user_normalized)
                and any(_norm(v) == user_normalized for v in answer_variants)
            )
            correct_answer_display = correct_answer

        if is_correct:
            correct += 1
        else:
            mistakes.append({
                "question_id": q_id,
                "question": q["question"],
                "user_answer": user_answer if user_answer not in (None, "", []) else "(no answer)",
                "correct_answer": correct_answer_display,
                "explanation": generate_explanation(q, user_answer, correct_answer_display)
            })

        detailed_results.append({
            "question_id": q_id,
            "is_correct": is_correct,
            "user_answer": user_answer if user_answer not in (None, "", []) else "(no answer)",
            "correct_answer": correct_answer_display,
            "skill_tested": q.get("skill_tested", [])
        })

    # Calculate score and estimated band
    percentage = (correct / total) * 100 if total > 0 else 0
    estimated_band = calculate_listening_band(percentage)

    # Get lesson recommendations based on weaknesses
    weak_skills = identify_weak_skills(detailed_results)
    recommended_lessons = await get_listening_lesson_recommendations(
        listening_set.get("topic"),
        weak_skills,
        band_range or listening_set["band_range"]
    )
    root_cause_analysis = build_listening_root_cause_analysis(detailed_results)
    study_plan = build_listening_study_plan(
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
            skill="listening",
            mistakes=mistakes,
            weak_skills=weak_skills,
            correct=correct,
            total=total,
            percentage=percentage,
            estimated_band=estimated_band,
        )
        if sonnet_block:
            # Preserve recommended-lesson route hints from the deterministic
            # roadmap step #1 (Sonnet has no lesson registry visibility).
            primary_lesson = recommended_lessons[0] if recommended_lessons else {}
            if primary_lesson.get("lesson_path") and sonnet_block["study_plan"].get("roadmap_steps"):
                sonnet_block["study_plan"]["roadmap_steps"][0].setdefault(
                    "route", primary_lesson["lesson_path"]
                )
            root_cause_analysis = sonnet_block["root_cause_analysis"]
            study_plan = sonnet_block["study_plan"]
    except Exception as exc:  # pragma: no cover
        logger.warning("Sonnet QB advisor failed for listening: %s", exc)

    # Persist to test_attempts so Progress page + Liz see this attempt.
    try:
        from server import persist_attempt
        await persist_attempt(
            user_id=user_id,
            test_id=f"qb_listening_{set_id}",
            test_type="listening",
            band_score=float(estimated_band or 0.0),
            score=float(round(percentage, 1)),
            feedback={
                "source": "listening_qb",
                "set_id": set_id,
                "correct": correct,
                "total": total,
                "weak_skills": weak_skills,
            },
        )
    except Exception as _e:
        logger.warning("persist_attempt skipped (listening_qb): %s", _e)

    return {
        "success": True,
        "skill": "listening",
        "set_id": set_id,
        "score": {
            "correct": correct,
            "total": total,
            "percentage": round(percentage, 1)
        },
        "estimated_band": estimated_band,
        "mistakes": mistakes,
        "detailed_results": detailed_results,
        "weak_skills": weak_skills,
        "recommended_lessons": recommended_lessons,
        "feedback": generate_overall_feedback(percentage, weak_skills),
        "root_cause_analysis": root_cause_analysis,
        "study_plan": study_plan,
    }


def generate_explanation(question: Dict, user_answer: str, correct_answer: str) -> str:
    """Generate a brief explanation for incorrect answers."""
    q_type = question.get("type", "")
    skills = question.get("skill_tested", [])

    explanations = {
        "numbers": "Pay attention to numbers - they are often repeated or spelled out.",
        "spelling": "Names and places are often spelled out letter by letter.",
        "dates": "Listen for day, month, and year separately.",
        "prices": "Currency amounts may include decimal points.",
        "time": "Time expressions can be in 12-hour or 24-hour format.",
        "specific information": "This detail was stated directly in the recording.",
        "inference": "This required understanding implied meaning.",
        "main idea": "Focus on the overall message, not just details."
    }

    for skill in skills:
        if skill in explanations:
            return explanations[skill]

    return f"The correct answer is '{correct_answer}'. Listen again to identify where this information appears."


def calculate_listening_band(percentage: float) -> float:
    """Estimated IELTS Listening band. Routes through the official 40-question
    raw-score table (services.ielts_band_tables) — the previous percentage
    buckets undershot real scores by half a band in the 60-90 range."""
    from services.ielts_band_tables import band_for_listening_pct
    return band_for_listening_pct(percentage)


def identify_weak_skills(results: List[Dict]) -> List[str]:
    """Identify skills that need improvement based on results."""
    skill_counts = {}
    skill_errors = {}

    for r in results:
        for skill in r.get("skill_tested", []):
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
            if not r["is_correct"]:
                skill_errors[skill] = skill_errors.get(skill, 0) + 1

    weak_skills = []
    for skill, count in skill_counts.items():
        error_rate = skill_errors.get(skill, 0) / count
        if error_rate >= 0.5:  # 50% or more errors
            weak_skills.append(skill)

    return weak_skills


def build_listening_root_cause_analysis(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Summarize the main listening failure patterns."""
    explanation_map = {
        "numbers": "Exact figures are slipping. Slow down and capture digits deliberately.",
        "spelling": "You hear the word, but the final written form is not stable enough yet.",
        "dates": "Calendar detail is breaking down across day, month, or year.",
        "prices": "Currency values and decimal detail need tighter checking.",
        "time": "Schedule language and clock references need more control.",
        "specific information": "You need stronger evidence capture for direct factual details.",
        "inference": "You are missing implied meaning or speaker attitude.",
        "main idea": "You need a stronger grasp of overall message before chasing details.",
        "matching": "Matching speaker/detail questions need more structured elimination."
    }
    skill_counts: Dict[str, int] = {}

    for result in results:
        if result.get("is_correct"):
            continue
        skills = result.get("skill_tested") or ["specific information"]
        for skill in skills:
            normalized = str(skill).lower()
            skill_counts[normalized] = skill_counts.get(normalized, 0) + 1

    return [
        {
            "code": code,
            "label": code.replace("_", " ").title(),
            "count": count,
            "impact": "high" if count >= 3 else "medium" if count == 2 else "targeted",
            "what_it_means": explanation_map.get(code, "This listening sub-skill needs more targeted practice."),
        }
        for code, count in sorted(skill_counts.items(), key=lambda item: item[1], reverse=True)[:4]
    ]


def build_listening_study_plan(
    estimated_band: float,
    weak_skills: List[str],
    recommended_lessons: List[Dict[str, Any]],
    root_cause_analysis: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Create an actionable listening roadmap from the weak skill profile."""
    top_cause = root_cause_analysis[0] if root_cause_analysis else {}
    primary_lesson = recommended_lessons[0] if recommended_lessons else {}

    return {
        "target_band": round(min(9.0, estimated_band + (1.0 if estimated_band < 6.5 else 0.5)), 1),
        "priority_skill": top_cause.get("label") or (weak_skills[0] if weak_skills else "Listening"),
        "top_root_cause": top_cause.get("code"),
        "roadmap_steps": [
            {
                "title": "Review the top lesson match",
                "why_now": primary_lesson.get("reason") or "Start with the lesson that targets your biggest listening gap.",
                "route": primary_lesson.get("lesson_path"),
            },
            {
                "title": "Replay every wrong item with evidence",
                "why_now": "Write the exact word or phrase that proves the correct answer before moving on.",
            },
            {
                "title": "Do a fresh timed set",
                "why_now": "Check whether the weak skill improves on unfamiliar audio, not just on repetition.",
            },
        ],
        "three_day_plan": [
            "Day 1: Review the linked lesson and note the main error pattern behind your misses.",
            "Day 2: Replay the wrong items and record the exact evidence for each correction.",
            "Day 3: Take a new listening set and compare your weakest skill before and after review.",
        ],
        "retest_strategy": "If the same weak skill appears again, slow down note capture and prioritise exact evidence over speed.",
    }


async def get_listening_lesson_recommendations(
    topic: str,
    weak_skills: List[str],
    band_range: str
) -> List[Dict[str, Any]]:
    """Get course-linked lesson recommendations based on topic and weaknesses."""
    from server import db
    from services.lesson_registry import LessonRegistry

    registry = LessonRegistry(db)
    band_score = 4.5 if band_range == "4.0-5.0" else 6.0 if band_range == "5.5-6.5" else 7.5
    return await registry.get_recommended_lessons(
        weaknesses=weak_skills or ["listening"],
        current_band=band_score,
        skill="listening",
        topic=topic,
        context=f"listening practice about {topic or 'general listening'}",
        limit=3,
    )


def generate_overall_feedback(percentage: float, weak_skills: List[str]) -> str:
    """Generate overall feedback message."""
    if percentage >= 80:
        feedback = "Excellent performance! You demonstrated strong listening comprehension skills."
    elif percentage >= 60:
        feedback = "Good work! You understood most of the recording, but there's room for improvement."
    elif percentage >= 40:
        feedback = "You're making progress. Focus on the highlighted weak areas to improve your score."
    else:
        feedback = "Keep practicing! Consider using the transcript feature to follow along and identify key information."

    if weak_skills:
        skill_list = ", ".join(weak_skills[:3])
        feedback += f" Pay special attention to: {skill_list}."

    return feedback
