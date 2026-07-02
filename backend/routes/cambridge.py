"""
Cambridge IELTS Tests Router — evaluation endpoints + aggregation shim.
=======================================================================
Faz 1 refactor (2026-07-02): the original 2,213-line module was split into
single-responsibility modules:

- routes/cambridge_content.py    test/book serving, answer stripping, images,
                                 answer keys, sample answers, audio paths
- services/cambridge_scoring.py  scoring engine (answer normalization/compare,
                                 multi-select groups, section results, bands)
- services/cambridge_feedback.py explanations, skill tips, root-cause,
                                 study plan, lesson recommendations

This module keeps the two Sonnet evaluation endpoints and re-exports every
historical name so `from routes.cambridge import ...` (full_test.py,
ge/tests_v1.py, qa_admin.py) keeps working. Route paths are byte-identical:
the umbrella `router` includes the content router and the eval router, both
carrying the original /api/cambridge prefix.
"""

from fastapi import APIRouter, HTTPException, Body, Depends
import auth_session  # audit NEW-2: require auth on the Sonnet writing evaluator
from typing import Optional, Dict, Any
import os
import json
import uuid
import asyncio

from routes import cambridge_content
from routes.cambridge_content import (  # noqa: F401 — historical re-exports
    ANSWER_KEYS_BLACKLIST,
    CAMBRIDGE_TESTS,
    _strip_answers,
)
from services.cambridge_scoring import (  # noqa: F401 — historical re-exports
    _build_multi_selection_groups,
    _find_letter_paragraph,
    _get_passage_texts,
    _label_variants,
    _normalize_answer,
    _resolve_mcq_search_input,
    calculate_band_from_percentage,
    calculate_band_from_raw,
    calculate_section_results,
    classify_reason_code,
    compare_answers,
    extract_answer_keys_from_test,
    extract_evidence_text,
)
from services.cambridge_feedback import (  # noqa: F401 — historical re-exports
    _format_answer_text,
    _stub_teacher_feedback,
    build_root_cause_analysis,
    build_study_plan,
    generate_explanation,
    generate_lesson_recommendations,
    get_skill_tip,
)

_eval_router = APIRouter(prefix="/api/cambridge", tags=["cambridge"])

# Simple cache for teacher feedback based on performance patterns
_feedback_cache = {}

EMERGENT_LLM_KEY = os.environ.get("OPENAI_API_KEY")  # legacy var name; reads own OpenAI key


@_eval_router.post("/evaluate/writing")
async def evaluate_cambridge_writing(
    book_id: str = Body(...),
    test_id: str = Body(...),
    task_number: int = Body(...),  # 1 or 2
    response: str = Body(...),
    user_id: Optional[str] = Body(None),
    caller: dict = Depends(auth_session.current_user),
):
    # Audit NEW-2: require login; bind to the authenticated user so anon can't
    # bypass the quota by omitting user_id, and no cross-user billing.
    if user_id:
        auth_session.require_self_or_admin(user_id, caller)
    else:
        user_id = caller["id"]
    """
    Evaluate Cambridge Writing Task using the unified Sonnet-based v2 evaluator.

    Faz 4 (2026-05-13): this route used to call GPT-4o via EMERGENT_LLM_KEY with
    its own ad-hoc JSON prompt. That diverged from the rest of the platform on
    calibration, gave inflated bands, and bypassed the v2 retry/timeout/idempotency
    discipline. The wrapper now delegates to `writing_evaluator_v2.evaluate_writing`
    (Sonnet 4.6, 75s single-shot) and adapts the v2 schema back into the legacy
    Cambridge response shape the existing `CambridgeTestResults.js` UI expects:
        {success, word_count, minimum_words, overall_band, criteria, feedback,
         reference_samples}
    """
    from schemas.writing_evaluator import (
        TaskType,
        WritingEvaluationRequest,
    )
    from services import writing_evaluator_v2

    # Look up the Cambridge test + task to recover the prompt and the band-6/8
    # sample answers the UI shows alongside the score.
    book = CAMBRIDGE_TESTS.get(book_id, {})
    test_data = book.get("tests", {}).get(test_id)
    if not test_data:
        raise HTTPException(status_code=404, detail="Test not found")

    writing_section = test_data.get("sections", {}).get("writing", {})
    task_entries = writing_section.get("tasks", [])
    task = next((t for t in task_entries if t.get("task_number") == task_number), None)
    task_prompt = (task or {}).get("prompt") or (task or {}).get("instructions") or ""
    if not task_prompt:
        # Sonnet needs *some* task context; fall back to a generic stem rather
        # than failing the evaluation outright.
        task_prompt = (
            "Cambridge IELTS Academic Writing Task 1 — describe the visual."
            if task_number == 1
            else "Cambridge IELTS Academic Writing Task 2 — respond to the prompt."
        )

    word_count = len(response.split()) if response else 0
    min_words = 150 if task_number == 1 else 250

    sample_answers = test_data.get("sample_answers", {}).get("writing", {})
    reference_samples = sample_answers.get(f"task{task_number}", {})

    # Cambridge books are Academic — the v2 evaluator will refine the exact
    # subtype from the essay itself; the hint only seeds the word-count target.
    task_hint = (
        TaskType.task1_academic_chart if task_number == 1 else TaskType.task2_opinion
    )

    eval_req = WritingEvaluationRequest(
        essay_text=response,
        task_type_hint=task_hint,
        task_prompt=task_prompt,
        user_language="en",
    )

    # Quota (audit PAY-2): enforce the locked writing caps SERVER-SIDE for
    # authenticated users — this route ran Sonnet with no quota check. Cambridge
    # has no shared db handle, so use a scoped client (same pattern as
    # speaking_qb). Claim BEFORE the eval; roll back if the evaluator fails.
    _quota_claimed = False
    if user_id:
        from motor.motor_asyncio import AsyncIOMotorClient
        from services.usage_tracking import claim_usage_atomic
        _qc = AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
        try:
            _qdb = _qc[os.environ.get("DB_NAME", "ielts_database")]
            _u = await _qdb.users.find_one({"id": user_id}, {"_id": 0})
            if _u:
                _usage = await claim_usage_atomic(_qdb, _u, "evaluations")
                if not _usage["allowed"]:
                    raise HTTPException(
                        status_code=402,
                        detail={
                            "code": "quota_exceeded",
                            "message": "Monthly evaluation quota reached. Upgrade to keep going.",
                            "counter": "evaluations",
                            "used": _usage.get("used"),
                            "quota": _usage.get("quota"),
                            "upgrade_url": "/pricing",
                        },
                    )
                _quota_claimed = True
        finally:
            _qc.close()

    async def _rollback_quota():
        if not _quota_claimed:
            return
        from motor.motor_asyncio import AsyncIOMotorClient
        from services.usage_tracking import current_period_key
        _rc = AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
        try:
            _rdb = _rc[os.environ.get("DB_NAME", "ielts_database")]
            period = current_period_key()
            await _rdb.users.update_one({"id": user_id}, {"$inc": {f"usage.{period}.evaluations": -1}})
        except Exception:
            pass
        finally:
            _rc.close()

    try:
        result = await writing_evaluator_v2.evaluate_writing(eval_req)
    except writing_evaluator_v2.EvaluatorFailure as exc:
        await _rollback_quota()
        # Surface a structured 502 so the UI can show a retry-friendly message.
        raise HTTPException(
            status_code=502,
            detail={
                "code": "evaluator_failed",
                "message": str(exc),
                "attempts": getattr(exc, "attempts", 1),
            },
        ) from exc

    crit = result.criteria

    # Compose examiner_comment from the v2 diagnosis if available, else from
    # the strongest criterion explanations. Keeps the legacy UI panel non-empty.
    examiner_comment = ""
    if result.response_diagnosis:
        examiner_comment = result.response_diagnosis.main_issue
        if result.response_diagnosis.band_ceiling_reason:
            examiner_comment += " " + result.response_diagnosis.band_ceiling_reason
    if not examiner_comment:
        examiner_comment = crit.task_achievement.explanation

    # Flatten per-criterion strengths into one list; same for weaknesses.
    legacy_strengths: list = []
    for c in (
        crit.task_achievement,
        crit.coherence_cohesion,
        crit.lexical_resource,
        crit.grammatical_range_accuracy,
    ):
        legacy_strengths.extend(c.strengths)

    # `highest_priority_fixes` is the v2 equivalent of "areas for improvement";
    # fall back to flattened criterion weaknesses if Sonnet omitted them.
    if result.highest_priority_fixes:
        legacy_improvements = list(result.highest_priority_fixes)
    else:
        legacy_improvements = []
        for c in (
            crit.task_achievement,
            crit.coherence_cohesion,
            crit.lexical_resource,
            crit.grammatical_range_accuracy,
        ):
            legacy_improvements.extend(c.weaknesses)

    legacy_payload = {
        "success": True,
        "task_number": task_number,
        "word_count": word_count,
        "minimum_words": min_words,
        "overall_band": result.overall_band,
        "criteria": {
            "task_achievement": crit.task_achievement.band,
            "coherence_cohesion": crit.coherence_cohesion.band,
            "lexical_resource": crit.lexical_resource.band,
            # Legacy UI key is `grammatical_range` (no `_accuracy`); keep both
            # so older readers don't break and new ones can pick the full name.
            "grammatical_range": crit.grammatical_range_accuracy.band,
            "grammatical_range_accuracy": crit.grammatical_range_accuracy.band,
        },
        "feedback": {
            "examiner_comment": examiner_comment,
            "strengths": legacy_strengths[:5],
            "improvements": legacy_improvements[:5],
            "vocabulary_notes": crit.lexical_resource.explanation,
            "grammar_notes": crit.grammatical_range_accuracy.explanation,
        },
        "reference_samples": reference_samples,
        # Pass through v2 extras so any newer UI can render them without
        # needing a second call. Legacy readers ignore unknown keys.
        "evaluator_version": "v2",
        "improved_version": result.improved_version,
        "inline_annotations": [a.model_dump() for a in result.inline_annotations],
    }

    # Persist to test_attempts so Progress page + Liz see this writing task.
    try:
        from server import persist_attempt
        await persist_attempt(
            user_id=user_id,
            test_id=f"{book_id}_{test_id}_writing_task{task_number}",
            test_type="writing",
            band_score=float(result.overall_band or 0.0),
            feedback={
                "source": "cambridge",
                "task_number": task_number,
                "evaluation": legacy_payload,
            },
        )
    except Exception as _e:
        print(f"persist_attempt skipped (writing): {_e}")

    return legacy_payload


@_eval_router.post("/evaluate/full-test")
async def evaluate_cambridge_full_test(
    book_id: str = Body(...),
    test_id: str = Body(...),
    answers: Dict[str, Any] = Body(...),
    user_plan: str = Body("free"),
    skill: Optional[str] = Body(None),
    user_id: Optional[str] = Body(None),
):
    """
    Comprehensive Cambridge Test Evaluation
    Returns: skill_breakdown, teacher_feedback, recommended_lessons
    Matches the existing QB Results page format

    `skill` is an optional filter:
      - "reading"   → only the reading section is scored / returned
      - "listening" → only the listening section is scored / returned
      - None / ""   → both sections (legacy full-test behaviour)
    The response shape stays the same; the skipped section gets zeroed
    scores and an empty details list so the frontend can detect it.
    """
    # LLM is OPTIONAL: deterministic scoring + per-question results
    # (drilldown data) all work without it. Only `teacher_feedback`
    # depends on the LLM. Without a key we still return scores +
    # question_results so the frontend renders the full drilldown
    # instead of falling back to a basic-only path that hides it.
    llm_available = bool(EMERGENT_LLM_KEY)

    try:
        from services.llm_compat import LlmChat, UserMessage
        
        # Get test data and answers
        book = CAMBRIDGE_TESTS.get(book_id, {})
        test_data = book.get("tests", {}).get(test_id)
        
        if not test_data:
            raise HTTPException(status_code=404, detail="Test not found")
        
        # Get answer key - extract from test data if not provided directly
        answer_key = test_data.get("answer_keys", {})
        
        # If answer_keys not present, extract from questions
        if not answer_key:
            answer_key = extract_answer_keys_from_test(test_data)
        
        # ============ CALCULATE SCORES ============
        # Empty-section sentinel — used for the skipped half when `skill`
        # is set so downstream code (band, breakdown, study plan) keeps the
        # same shape without extra branches.
        _empty_section = {
            "correct": 0,
            "total": 0,
            "percentage": 0,
            "by_type": {},
            "details": [],
        }

        # Tolerate non-string defaults (e.g. when this function is invoked
        # directly in tests with the FastAPI Body() sentinel as default).
        skill_norm = skill.strip().lower() if isinstance(skill, str) else ""
        do_listening = skill_norm in ("", "listening", "all", "both")
        do_reading = skill_norm in ("", "reading", "all", "both")

        listening_results = (
            calculate_section_results("listening", answers, answer_key.get("listening", {}), test_data)
            if do_listening else dict(_empty_section)
        )
        reading_results = (
            calculate_section_results("reading", answers, answer_key.get("reading", {}), test_data)
            if do_reading else dict(_empty_section)
        )
        
        # Combine results
        total_correct = listening_results["correct"] + reading_results["correct"]
        total_questions = listening_results["total"] + reading_results["total"]
        overall_percentage = (total_correct / total_questions * 100) if total_questions > 0 else 0
        
        # ============ SKILL BREAKDOWN BY QUESTION TYPE ============
        skill_breakdown = []
        
        # Listening breakdown
        for qtype, stats in listening_results.get("by_type", {}).items():
            skill_breakdown.append({
                "skill_id": f"listening_{qtype}",
                "label": f"Listening - {qtype.replace('_', ' ').title()}",
                "correct": stats["correct"],
                "total": stats["total"],
                "tip": get_skill_tip("listening", qtype, stats["correct"] / stats["total"] if stats["total"] > 0 else 0)
            })
        
        # Reading breakdown
        for qtype, stats in reading_results.get("by_type", {}).items():
            skill_breakdown.append({
                "skill_id": f"reading_{qtype}",
                "label": f"Reading - {qtype.replace('_', ' ').title()}",
                "correct": stats["correct"],
                "total": stats["total"],
                "tip": get_skill_tip("reading", qtype, stats["correct"] / stats["total"] if stats["total"] > 0 else 0)
            })
        
        # ============ GENERATE AI TEACHER FEEDBACK ============
        # Find weakest areas
        weak_areas = [s for s in skill_breakdown if s["total"] > 0 and (s["correct"] / s["total"]) < 0.5]
        strong_areas = [s for s in skill_breakdown if s["total"] > 0 and (s["correct"] / s["total"]) >= 0.7]
        
        weak_summary = ", ".join([s["label"] for s in weak_areas[:3]]) if weak_areas else "None identified"
        strong_summary = ", ".join([s["label"] for s in strong_areas[:3]]) if strong_areas else "Keep practicing"
        
        # Build section-aware results lines so we don't tell the LLM about
        # a section the user never took (e.g. reading-only test).
        section_lines = []
        if listening_results['total'] > 0:
            section_lines.append(f"- Listening: {listening_results['correct']}/{listening_results['total']} ({listening_results['percentage']:.1f}%)")
        if reading_results['total'] > 0:
            section_lines.append(f"- Reading: {reading_results['correct']}/{reading_results['total']} ({reading_results['percentage']:.1f}%)")
        if listening_results['total'] > 0 and reading_results['total'] > 0:
            section_lines.append(f"- Overall: {total_correct}/{total_questions} ({overall_percentage:.1f}%)")
        section_block = "\n".join(section_lines) if section_lines else "(no sections completed)"

        skill_label = (
            "Reading" if skill_norm == "reading" else
            "Listening" if skill_norm == "listening" else
            "Reading + Listening"
        )

        feedback_prompt = f"""You are Liz, an experienced IELTS teacher giving warm, specific feedback on a Cambridge IELTS {skill_label} practice test.

TEST RESULTS:
{section_block}

WEAK AREAS: {weak_summary}
STRONG AREAS: {strong_summary}

DETAILED BREAKDOWN:
{json.dumps(skill_breakdown, indent=2)}

Write feedback as Liz speaking directly to the student. Mention only the section(s) above — do NOT reference any section that isn't listed. Reference the specific question types they struggled with by name (T/F/NG, matching headings, MCQ, etc.).

Respond with ONLY a JSON object, no prose, no markdown:
{{
    "short": "2-3 sentences. Open with the actual score in plain words, name the strongest pattern, name the next thing to fix.",
    "detailed": "4-5 sentences. Explain what the wrong-answer pattern shows, give one concrete drill for the weakest question type, end with how to verify the gain."
}}"""

        teacher_feedback: Dict[str, str]
        # Previously we skipped LLM for free reading/listening tests; that
        # produced templated stub text the user complained about. We now
        # always run the LLM when available so the feedback feels real.
        skip_llm_for_rl = False

        # Simple caching based on performance pattern
        cache_key = f"{listening_results['percentage']:.0f}L_{reading_results['percentage']:.0f}R_{len(weak_areas)}W"
        cached_feedback = _feedback_cache.get(cache_key) if len(_feedback_cache) < 100 else None

        if llm_available and not skip_llm_for_rl and not cached_feedback:
            try:
                chat = LlmChat(
                    api_key=EMERGENT_LLM_KEY,
                    session_id=str(uuid.uuid4()),
                    system_message="You are an IELTS teacher. Respond only with valid JSON."
                )
                feedback_response = await chat.send_message(user_message=UserMessage(text=feedback_prompt))
                # Rate limiting: prevent Claude API Usage Policy violations
                await asyncio.sleep(1.0)
                response_text = str(feedback_response)
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0]
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0]
                teacher_feedback = json.loads(response_text.strip())
                # Cache successful response
                if len(_feedback_cache) < 100:  # Prevent memory bloat
                    _feedback_cache[cache_key] = teacher_feedback
            except Exception as llm_exc:
                # LLM failure shouldn't break the whole evaluation — fall back
                # to a deterministic short summary so the page still renders.
                print(f"Cambridge teacher_feedback LLM failed (non-fatal): {llm_exc}")
                teacher_feedback = _stub_teacher_feedback(
                    listening_results, reading_results, weak_summary, strong_summary,
                )
        elif cached_feedback:
            # Use cached response
            teacher_feedback = cached_feedback
        else:
            # No LLM key configured, skipped for free R/L, or no cache — return deterministic summary
            teacher_feedback = _stub_teacher_feedback(
                listening_results, reading_results, weak_summary, strong_summary,
            )
        
        # ============ RECOMMENDED LESSONS ============
        recommended_lessons = generate_lesson_recommendations(skill_breakdown, "academic")
        
        # ============ CALCULATE BAND SCORE ============
        # Per-section bands use the official Cambridge raw-score tables.
        # Overall band is the average of the bands the candidate actually
        # took (round to nearest 0.5), NOT a percentage average — averaging
        # percentages then re-bucketing produces a different number from
        # averaging the published bands, and IELTS scores the latter.
        track = (test_data.get("track") or "academic").lower()
        listening_band = calculate_band_from_raw(
            listening_results["correct"], listening_results["total"], "listening"
        ) if listening_results["total"] > 0 else 0.0
        reading_band = calculate_band_from_raw(
            reading_results["correct"], reading_results["total"], "reading", track
        ) if reading_results["total"] > 0 else 0.0
        taken_bands = [b for b in (listening_band, reading_band) if b > 0]
        if taken_bands:
            overall_band = round(sum(taken_bands) / len(taken_bands) * 2) / 2
        else:
            overall_band = 0.0
        
        # ============ FASTEST SCORE GAIN ============
        fastest_gain = []
        # Sort skill areas by: most wrong answers that are easiest to fix
        gain_candidates = []
        for s in skill_breakdown:
            if s["total"] > 0:
                wrong = s["total"] - s["correct"]
                accuracy = s["correct"] / s["total"]
                if wrong > 0:
                    gain_candidates.append({
                        "label": s["label"],
                        "skill_id": s["skill_id"],
                        "wrong_count": wrong,
                        "total": s["total"],
                        "accuracy": round(accuracy * 100),
                        "potential_gain": wrong,  # how many more correct answers possible
                        "tip": s.get("tip", "")
                    })
        # Sort by most wrong answers (biggest potential gain)
        gain_candidates.sort(key=lambda x: x["wrong_count"], reverse=True)
        fastest_gain = gain_candidates[:3]
        
        # ============ INTEGRITY WARNINGS ============
        integrity_warnings = []
        # Check for unanswered questions
        listening_answers = answers.get("listening", {})
        reading_answers = answers.get("reading", {})
        
        unanswered_listening = sum(1 for k in answer_key.get("listening", {}) if not listening_answers.get(f"listening_{k}", "").strip() if isinstance(listening_answers.get(f"listening_{k}", ""), str)) if isinstance(listening_answers, dict) else 0
        unanswered_reading = sum(1 for k in answer_key.get("reading", {}) if not reading_answers.get(f"reading_{k}", "").strip() if isinstance(reading_answers.get(f"reading_{k}", ""), str)) if isinstance(reading_answers, dict) else 0
        
        # Count unanswered from flat answers dict (only for sections we
        # actually scored — when skill="reading" we don't want to flag
        # listening as "all unanswered").
        unanswered_l = 0
        unanswered_r = 0
        if do_listening:
            for qnum in answer_key.get("listening", {}):
                key = f"listening_{qnum}"
                val = answers.get(key, "")
                if not val or (isinstance(val, str) and not val.strip()):
                    unanswered_l += 1
        if do_reading:
            for qnum in answer_key.get("reading", {}):
                key = f"reading_{qnum}"
                val = answers.get(key, "")
                if not val or (isinstance(val, str) and not val.strip()):
                    unanswered_r += 1

        if unanswered_l > 0:
            integrity_warnings.append({
                "type": "unanswered",
                "section": "listening",
                "count": unanswered_l,
                "message": f"{unanswered_l} listening question(s) left unanswered. These count as wrong."
            })
        if unanswered_r > 0:
            integrity_warnings.append({
                "type": "unanswered",
                "section": "reading",
                "count": unanswered_r,
                "message": f"{unanswered_r} reading question(s) left unanswered. These count as wrong."
            })
        
        # ============ REASON CODE SUMMARY ============
        all_details = listening_results.get("details", []) + reading_results.get("details", [])
        reason_counts = {}
        for d in all_details:
            rc = d.get("reason_code")
            if rc:
                reason_counts[rc] = reason_counts.get(rc, 0) + 1

        # Persist to test_attempts so Progress page + Liz see this attempt.
        # test_type follows skill filter; section-only mode preserves which
        # half the user actually practiced.
        try:
            from server import persist_attempt
            if skill_norm == "reading":
                _attempt_type = "reading"
                _attempt_band = float(reading_band or 0.0)
            elif skill_norm == "listening":
                _attempt_type = "listening"
                _attempt_band = float(listening_band or 0.0)
            else:
                _attempt_type = "mixed"
                _attempt_band = float(overall_band or 0.0)
            await persist_attempt(
                user_id=user_id,
                test_id=f"{book_id}_{test_id}",
                test_type=_attempt_type,
                band_score=_attempt_band,
                score=float(overall_percentage or 0.0),
                feedback={
                    "source": "cambridge",
                    "skill": skill_norm or "all",
                    "scores": {
                        "listening": {"correct": listening_results["correct"], "total": listening_results["total"], "band": listening_band},
                        "reading": {"correct": reading_results["correct"], "total": reading_results["total"], "band": reading_band},
                        "overall": {"correct": total_correct, "total": total_questions, "band": overall_band},
                    },
                },
            )
        except Exception as _e:
            print(f"persist_attempt skipped (cambridge full-test): {_e}")

        return {
            "success": True,
            "test_id": test_id,
            "book_id": book_id,
            "scores": {
                "listening": {
                    "correct": listening_results["correct"],
                    "total": listening_results["total"],
                    "percentage": listening_results["percentage"],
                    "band": listening_band,
                    "transcripts": (test_data.get("sections", {}) or {}).get("listening", {}).get("transcripts") or {},
                },
                "reading": {
                    "correct": reading_results["correct"],
                    "total": reading_results["total"],
                    "percentage": reading_results["percentage"],
                    "band": reading_band
                },
                "overall": {
                    "correct": total_correct,
                    "total": total_questions,
                    "percentage": overall_percentage,
                    "band": overall_band
                }
            },
            "skill_breakdown": skill_breakdown,
            "teacher_feedback": teacher_feedback,
            "recommended_lessons": recommended_lessons,
            "question_results": {
                "listening": listening_results.get("details", []),
                "reading": reading_results.get("details", [])
            },
            "fastest_gain": fastest_gain,
            "integrity_warnings": integrity_warnings,
            "reason_summary": reason_counts,
            "root_cause_analysis": build_root_cause_analysis(
                reason_counts,
                {"listening": listening_results.get("details", []), "reading": reading_results.get("details", [])}
            ),
            "study_plan": build_study_plan(
                overall_band=overall_band,
                skill_breakdown=skill_breakdown,
                fastest_gain=fastest_gain,
                recommended_lessons=recommended_lessons,
                reason_summary=reason_counts,
                question_results={"listening": listening_results.get("details", []), "reading": reading_results.get("details", [])},
            ),
        }
        
    except Exception as e:
        print(f"Full test evaluation error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# Umbrella router: content endpoints first (original registration order),
# then the evaluation endpoints. Both children carry the full /api/cambridge
# prefix, so this umbrella stays prefix-less.
router = APIRouter()
router.include_router(cambridge_content.router)
router.include_router(_eval_router)
