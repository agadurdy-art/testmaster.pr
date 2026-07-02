"""
Full Test evaluation orchestrator: aggregates per-skill results into the
overall band + rich feedback (skill breakdown, study plan), AI teacher
feedback, and the human-readable summary.

Extracted from routes/full_test.py (Faz 1 refactor, 2026-07-02).
"""

from typing import Dict, Any, Optional
import uuid
import json
import os

from routes.full_test_scoring import (
    evaluate_listening,
    evaluate_reading,
    evaluate_writing_section,
    evaluate_speaking_section,
)

# Import shared evaluation helpers from cambridge routes
try:
    from routes.cambridge import (
        classify_reason_code, compare_answers as cambridge_compare,
        calculate_band_from_percentage, get_skill_tip,
        generate_explanation, generate_lesson_recommendations,
        build_root_cause_analysis, build_study_plan,
        extract_evidence_text
    )
    CAMBRIDGE_HELPERS_AVAILABLE = True
except ImportError:
    CAMBRIDGE_HELPERS_AVAILABLE = False
    print("Warning: Could not import cambridge evaluation helpers")


# ============ EVALUATION FUNCTIONS ============

async def evaluate_full_test(
    test: Dict[str, Any],
    answers: Dict[str, Dict[str, Any]],
    section_times: Dict[str, int]
) -> Dict[str, Any]:
    """
    Comprehensive test evaluation with rich feedback.
    Returns: sections, overall, skill_breakdown, teacher_feedback,
    recommended_lessons, question_results, fastest_gain, integrity_warnings, reason_summary
    """
    results = {
        "sections": {},
        "overall": {}
    }

    # Evaluate Listening
    listening_result = None
    if "listening" in answers and "listening" in test.get("sections", {}):
        listening_result = evaluate_listening(test, answers["listening"])
        results["sections"]["listening"] = listening_result

    # Evaluate Reading
    reading_result = None
    if "reading" in answers and "reading" in test.get("sections", {}):
        reading_result = evaluate_reading(test, answers["reading"])
        results["sections"]["reading"] = reading_result

    # Evaluate Writing (AI)
    if "writing" in answers and "writing" in test.get("sections", {}):
        writing_result = await evaluate_writing_section(test, answers["writing"])
        results["sections"]["writing"] = writing_result

    # Evaluate Speaking
    # Faz 2 path: frontend orchestrator submits 3 audio blobs to
    # /api/speaking/evaluate-fulltest (holistic Sonnet eval) and forwards
    # the result here as `answers["speaking"]["fulltest_eval"]`. In that
    # case we just pass it through and ensure a top-level `band` field
    # is set so the overall-band aggregation at line ~520 works.
    # Legacy path (transcript-only): fall back to evaluate_speaking_section.
    if "speaking" in answers and "speaking" in test.get("sections", {}):
        sa = answers["speaking"] or {}
        if isinstance(sa, dict) and isinstance(sa.get("fulltest_eval"), dict):
            ft = sa["fulltest_eval"]
            speaking_result = dict(ft)
            if "band" not in speaking_result:
                scores = ft.get("scores") or {}
                if isinstance(scores, dict):
                    speaking_result["band"] = scores.get("overall", 0)
            results["sections"]["speaking"] = speaking_result
        else:
            speaking_result = await evaluate_speaking_section(test, sa)
            results["sections"]["speaking"] = speaking_result

    # Calculate overall band
    bands = []
    for section in ["listening", "reading", "writing", "speaking"]:
        if section in results["sections"]:
            bands.append(results["sections"][section].get("band", 0))
    if bands:
        overall = round(sum(bands) / len(bands) * 2) / 2
        results["overall"]["band"] = overall
        results["overall"]["sections_completed"] = len(bands)

    # ============ RICH FEEDBACK ============
    if CAMBRIDGE_HELPERS_AVAILABLE:
        # Skill breakdown by question type
        skill_breakdown = []
        for section_name, section_result in [("listening", listening_result), ("reading", reading_result)]:
            if section_result and "by_type" in section_result:
                for qtype, stats in section_result["by_type"].items():
                    accuracy = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
                    skill_breakdown.append({
                        "skill_id": f"{section_name}_{qtype}",
                        "label": f"{section_name.title()} - {qtype.replace('_', ' ').title()}",
                        "correct": stats["correct"],
                        "total": stats["total"],
                        "tip": get_skill_tip(section_name, qtype, accuracy)
                    })
        results["skill_breakdown"] = skill_breakdown

        # Fastest gain
        gain_candidates = []
        for s in skill_breakdown:
            if s["total"] > 0:
                wrong = s["total"] - s["correct"]
                if wrong > 0:
                    gain_candidates.append({
                        "label": s["label"],
                        "skill_id": s["skill_id"],
                        "wrong_count": wrong,
                        "total": s["total"],
                        "accuracy": round((s["correct"] / s["total"]) * 100),
                        "potential_gain": wrong,
                        "tip": s.get("tip", "")
                    })
        gain_candidates.sort(key=lambda x: x["wrong_count"], reverse=True)
        results["fastest_gain"] = gain_candidates[:3]

        # Question results (detailed per question)
        results["question_results"] = {
            "listening": listening_result.get("details", []) if listening_result else [],
            "reading": reading_result.get("details", []) if reading_result else []
        }

        # Integrity warnings
        integrity_warnings = []
        for sec_name, sec_result in [("listening", listening_result), ("reading", reading_result)]:
            if sec_result:
                unanswered = sum(1 for d in sec_result.get("details", []) if d.get("reason_code") == "UNANSWERED")
                if unanswered > 0:
                    integrity_warnings.append({
                        "type": "unanswered",
                        "section": sec_name,
                        "count": unanswered,
                        "message": f"{unanswered} {sec_name} question(s) left unanswered. These count as wrong."
                    })
        results["integrity_warnings"] = integrity_warnings

        # Reason summary
        all_details = results["question_results"]["listening"] + results["question_results"]["reading"]
        reason_counts = {}
        for d in all_details:
            rc = d.get("reason_code")
            if rc:
                reason_counts[rc] = reason_counts.get(rc, 0) + 1
        results["reason_summary"] = reason_counts

        # Recommended lessons
        results["recommended_lessons"] = await generate_lesson_recommendations(skill_breakdown, test.get("test_type", "academic"))

        results["root_cause_analysis"] = build_root_cause_analysis(
            reason_counts,
            results["question_results"]
        )
        results["study_plan"] = build_study_plan(
            overall_band=results.get("overall", {}).get("band", 0),
            skill_breakdown=skill_breakdown,
            fastest_gain=results["fastest_gain"],
            recommended_lessons=results["recommended_lessons"],
            reason_summary=reason_counts,
            question_results=results["question_results"],
        )

        # AI Teacher Feedback
        teacher_feedback = await generate_ai_teacher_feedback(results, skill_breakdown, test)
        results["teacher_feedback"] = teacher_feedback
    else:
        results["skill_breakdown"] = []
        results["fastest_gain"] = []
        results["question_results"] = {"listening": [], "reading": []}
        results["integrity_warnings"] = []
        results["reason_summary"] = {}
        results["recommended_lessons"] = []
        results["root_cause_analysis"] = []
        results["study_plan"] = {}
        results["teacher_feedback"] = None

    # Summary
    results["summary"] = generate_test_summary(results)
    return results


async def generate_ai_teacher_feedback(results: Dict, skill_breakdown: list, test: Dict) -> Optional[Dict]:
    """Generate AI teacher feedback using LLM."""
    EMERGENT_LLM_KEY = os.environ.get("OPENAI_API_KEY")
    if not EMERGENT_LLM_KEY:
        return None
    try:
        from services.llm_compat import LlmChat, UserMessage

        sections = results.get("sections", {})
        listening = sections.get("listening", {})
        reading = sections.get("reading", {})

        weak_areas = [s for s in skill_breakdown if s["total"] > 0 and (s["correct"] / s["total"]) < 0.5]
        strong_areas = [s for s in skill_breakdown if s["total"] > 0 and (s["correct"] / s["total"]) >= 0.7]
        weak_summary = ", ".join([s["label"] for s in weak_areas[:3]]) if weak_areas else "None identified"
        strong_summary = ", ".join([s["label"] for s in strong_areas[:3]]) if strong_areas else "Keep practicing"

        prompt = f"""You are an experienced IELTS teacher providing feedback on an IELTS practice test.
Respond in English.

TEST RESULTS:
- Listening: {listening.get('correct', 0)}/{listening.get('total', 0)} ({listening.get('percentage', 0):.1f}%)
- Reading: {reading.get('correct', 0)}/{reading.get('total', 0)} ({reading.get('percentage', 0):.1f}%)
- Overall Band: {results.get('overall', {}).get('band', 'N/A')}

WEAK AREAS: {weak_summary}
STRONG AREAS: {strong_summary}

DETAILED BREAKDOWN:
{json.dumps(skill_breakdown, indent=2)}

Generate personalized feedback in JSON format:
{{
    "short": "2-3 sentence summary of performance with encouragement",
    "detailed": "4-5 sentences with specific study recommendations based on weak areas"
}}

Be specific, constructive, and mention actual question types by name."""

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an IELTS teacher. Respond only with valid JSON."
        )
        response = await chat.send_message(user_message=UserMessage(text=prompt))

        response_text = str(response)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]

        return json.loads(response_text.strip())
    except Exception as e:
        print(f"AI teacher feedback error: {e}")
        return None


def generate_test_summary(results: Dict) -> Dict:
    """Generate human-readable test summary."""
    sections = results.get("sections", {})
    overall = results.get("overall", {})
    
    summary_lines = []
    
    if overall.get("band"):
        summary_lines.append(f"Overall Band Score: {overall['band']}")
    
    for section in ["listening", "reading", "writing", "speaking"]:
        if section in sections:
            s = sections[section]
            if "correct" in s:
                summary_lines.append(f"{section.capitalize()}: Band {s['band']} ({s['correct']}/{s['total']} correct)")
            else:
                summary_lines.append(f"{section.capitalize()}: Band {s.get('band', 'N/A')}")
    
    return {
        "text": "\n".join(summary_lines),
        "recommendation": get_band_recommendation(overall.get("band", 0))
    }


def get_band_recommendation(band: float) -> str:
    """Get study recommendation based on band score."""
    if band >= 8.0:
        return "Excellent! You have expert command of English. Focus on maintaining your skills."
    elif band >= 7.0:
        return "Very good! You have operational command. Focus on advanced vocabulary and complex structures."
    elif band >= 6.0:
        return "Good! You're a competent user. Work on accuracy and expanding your range of expression."
    elif band >= 5.0:
        return "Modest user. Focus on improving grammatical accuracy and developing vocabulary."
    else:
        return "Limited user. Recommend intensive study focusing on all language skills."
