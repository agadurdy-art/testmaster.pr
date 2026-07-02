"""
Cambridge feedback generators: per-question explanations, skill tips,
root-cause analysis, study plan and lesson recommendations.
Extracted from routes/cambridge.py (Faz 1 refactor, 2026-07-02).
"""

from typing import Dict


def _format_answer_text(ans) -> str:
    """Render a possibly list/None/empty answer as a readable string.
    Returns empty string for blanks so callers can distinguish "no answer"
    from "answer was the empty string", which matters for the explanation
    contrast templates ("you answered X" vs "you left this blank")."""
    if ans is None or ans == "" or ans == []:
        return ""
    if isinstance(ans, list):
        parts = [str(a) for a in ans if a not in (None, "")]
        return ", ".join(parts)
    return str(ans)


def get_skill_tip(
    section: str,
    qtype: str,
    accuracy: float,
    *,
    question_text: str = "",
    correct_ans=None,
    user_answer=None,
    reason_code: str = None,
) -> str:
    """Section + qtype tip, optionally enriched with the user's actual
    mistake. Legacy callers (skill_breakdown aggregates) pass only the
    first three positionals and get a type-level tip; per-question callers
    pass keyword args for a contextual, mistake-aware tip that names the
    specific reason code or the correct answer."""

    qt = (qtype or "").lower()
    is_correct = accuracy >= 0.7
    correct_text = _format_answer_text(correct_ans)
    user_text = _format_answer_text(user_answer)

    # ---- Reason-code aware tips for wrong answers (most specific) ----
    rc = (reason_code or "").upper()
    if not is_correct and rc:
        if rc == "TFNG_CONFUSION":
            upper = correct_text.upper()
            if upper == "NOT GIVEN":
                return ("NOT GIVEN means the passage doesn't address the claim either way. If you can't find a sentence "
                        "that confirms or contradicts it, the answer is NOT GIVEN — don't infer.")
            if upper == "FALSE":
                return ("FALSE means the passage actively contradicts the statement. NOT GIVEN means the passage is "
                        "silent. Re-read: did the text say the opposite, or just not mention it?")
            return ("Watch the line between TRUE / FALSE / NOT GIVEN. The passage must directly support (TRUE) or "
                    "contradict (FALSE) — anything else is NOT GIVEN.")
        if rc == "YNNG_CONFUSION":
            return ("Yes/No tests the writer's stance, not facts. NOT GIVEN means the writer doesn't express an "
                    "opinion either way — don't infer their view from neutral statements.")
        if rc == "SPELLING_ERROR":
            return (f"Your spelling differed from the passage. The correct form is '{correct_text}' — copy it "
                    f"exactly, even if it looks unusual. IELTS marks misspellings wrong.")
        if rc == "DISTRACTOR_TRAP":
            return ("You picked an option that shares vocabulary with the passage but not its meaning. Read each "
                    "option against the question stem before deciding — distractors are designed to look right.")
        if rc == "NEAR_MISS":
            return (f"You were close — your answer shared a root with '{correct_text}'. Check the exact word form "
                    f"(singular/plural, verb tense, derivation) and copy from the passage exactly.")
        if rc == "UNANSWERED":
            return ("You left this blank. Even a guess is better than blank in IELTS — never skip an answer, "
                    "especially on T/F/NG and multiple-choice where you have a 33–50% chance of being right.")

    # ---- Per-qtype tips (legacy shape, no extra context) ----
    base_tips = {
        "listening": {
            "note_completion": "Listen for keywords that signal the answer is coming. Write exactly what you hear — don't change the form of words.",
            "multiple_choice": "Read all options before the audio. Eliminate wrong answers as you listen. Be careful of distractors.",
            "matching": "Identify the key information for each item. Listen for synonyms and paraphrases.",
            "form_completion": "Predict the type of information needed (name, number, date). Listen for spelling clues.",
        },
        "reading": {
            "true_false_ng": "Focus on exact meaning. NOT GIVEN means the passage is silent — don't infer or assume.",
            "yes_no_ng": "These test the writer's opinion, not facts. Look for opinion language.",
            "matching_headings": "Skim paragraphs for main ideas. Match the general meaning, not individual words.",
            "matching_information": "Scan for specific details. Underline keywords from the questions.",
            "sentence_completion": "The answer must be grammatically correct. Copy words exactly from the passage.",
            "summary_completion": "Read the summary first. Answers follow passage order.",
            "multiple_choice": "Read the question stem carefully. Find the relevant section before checking options.",
        },
    }
    section_tips = base_tips.get(section, {})
    default_tip = f"Practice more {qt.replace('_', ' ')} questions to improve your accuracy."
    base = section_tips.get(qt, default_tip)

    if is_correct:
        return f"Good work on {qt.replace('_', ' ')}! {base}"

    if correct_text:
        return f"{base} For this question the answer was '{correct_text}'."
    return base


def generate_explanation(
    qtype: str,
    correct_ans,
    is_correct: bool,
    *,
    user_answer=None,
    question_text: str = "",
    reason_code: str = None,
) -> str:
    """Per-question explanation, optionally grounded in the user's actual
    answer. Legacy positional callers still work (templates fall back to
    generic 'The correct answer is X' phrasing); keyword callers get a
    contrast like "You answered X, but the answer is Y because ..."."""

    correct_text = _format_answer_text(correct_ans) or "N/A"
    user_text = _format_answer_text(user_answer)
    has_user = bool(user_text) and user_text not in ("(no answer)", "-")

    qt = (qtype or "").lower()
    upper = correct_text.upper()
    user_upper = user_text.upper() if has_user else ""

    your = f"You answered '{user_text}'" if has_user else "You left this blank"

    # ===== TRUE / FALSE / NOT GIVEN =====
    if qt in ("true_false_ng", "true_false_not_given"):
        if is_correct:
            if upper == "NOT GIVEN":
                return ("Correct — 'NOT GIVEN'. The passage neither confirms nor contradicts this; you spotted "
                        "that absence rather than inferring beyond the text.")
            if upper == "FALSE":
                return "Correct — 'FALSE'. The passage actively contradicts the statement (it isn't silent on this point)."
            return "Correct — 'TRUE'. The passage explicitly supports this statement."
        if upper == "NOT GIVEN":
            return (f"{your}, but the answer is 'NOT GIVEN'. The passage doesn't address this claim — it's neither "
                    f"confirmed nor contradicted. NOT GIVEN ≠ FALSE; FALSE means the text says the opposite.")
        if upper == "FALSE":
            if user_upper == "NOT GIVEN":
                return (f"{your}, but the answer is 'FALSE'. The passage states the opposite of this claim — "
                        f"it's actively contradicted, not silent.")
            if user_upper == "TRUE":
                return (f"{your}, but the answer is 'FALSE'. Re-read the relevant section: the passage contradicts "
                        f"what's claimed here.")
            return f"{your}, but the answer is 'FALSE'. The passage states something that contradicts this."
        if upper == "TRUE":
            if user_upper == "NOT GIVEN":
                return (f"{your}, but the answer is 'TRUE'. The passage explicitly supports this — you may have "
                        f"missed the relevant sentence.")
            if user_upper == "FALSE":
                return (f"{your}, but the answer is 'TRUE'. The passage confirms this rather than contradicting it.")
            return f"{your}, but the answer is 'TRUE'. The passage explicitly supports this statement."
        return f"{your}, but the answer is '{correct_text}'."

    # ===== YES / NO / NOT GIVEN =====
    if qt in ("yes_no_ng", "yes_no_not_given"):
        if is_correct:
            if upper == "NOT GIVEN":
                return "Correct — 'NOT GIVEN'. The writer doesn't express an opinion on this either way."
            stance = "this view" if upper == "YES" else "the opposite view"
            return f"Correct — '{correct_text}'. The writer expresses {stance} in the passage."
        if upper == "NOT GIVEN":
            return (f"{your}, but the answer is 'NOT GIVEN'. The writer doesn't state an opinion on this — don't "
                    f"infer their view from neutral facts they mention.")
        if upper == "YES":
            return f"{your}, but the answer is 'YES'. The writer expresses this view in the passage."
        if upper == "NO":
            return f"{your}, but the answer is 'NO'. The writer takes the opposite stance."
        return f"{your}, but the answer is '{correct_text}'."

    # ===== MULTIPLE SELECTION (set-equality) =====
    if qt in ("multiple_selection", "multi_mcq", "select_two", "select_three"):
        if is_correct:
            return f"Correct — '{correct_text}'. You picked the full set."
        if not has_user:
            return (f"You didn't pick any options. The full set is '{correct_text}' — multi-select needs every "
                    f"required answer, no partial credit.")
        return (f"{your}, but the full set is '{correct_text}'. Multi-select scores 0 unless every required "
                f"option is chosen — no partial credit.")

    # ===== MULTIPLE CHOICE =====
    if qt == "multiple_choice":
        if is_correct:
            return (f"Correct — '{correct_text}'. You picked the option that matches the question's meaning, "
                    f"not just shared vocabulary.")
        if has_user:
            return (f"{your}, but the answer is '{correct_text}'. The other options are distractors — they share "
                    f"vocabulary with the passage but don't match the question's meaning.")
        return (f"You didn't choose. The answer is '{correct_text}' — distractors share words with the passage "
                f"but not its meaning.")

    # ===== MATCHING HEADINGS =====
    if qt == "matching_headings":
        if is_correct:
            return f"Correct — '{correct_text}'. That heading captures the paragraph's main idea (not just one detail)."
        return (f"{your}, but the answer is '{correct_text}'. Headings test the paragraph's overall idea — "
                f"eliminate options that fit a single sentence only.")

    # ===== MATCHING INFORMATION / SECTION =====
    if qt in ("matching_information", "section_matching"):
        if is_correct:
            return f"Correct — '{correct_text}'. You matched on meaning, not just shared vocabulary."
        return (f"{your}, but the answer is '{correct_text}'. Match on meaning, not just words the question "
                f"and paragraph share.")

    # ===== COMPLETION (summary / sentence / note / table / form / diagram / flow) =====
    if qt in ("summary_completion", "sentence_completion", "note_completion",
              "table_completion", "form_completion", "diagram_labelling",
              "flow_chart_completion"):
        if is_correct:
            return f"Correct — '{correct_text}'. You copied the word(s) from the passage exactly."
        if has_user and user_text.strip().lower() == correct_text.strip().lower():
            return (f"{your}, the answer is '{correct_text}'. Capitalisation/spelling difference — copy exactly "
                    f"as in the passage.")
        if has_user:
            return (f"{your}, but the answer is '{correct_text}'. Completion answers must come straight from the "
                    f"text — don't paraphrase or change the form.")
        return f"You left this blank. The answer is '{correct_text}' — copy it exactly from the passage."

    # ===== MATCHING (listening) =====
    if qt == "matching":
        if is_correct:
            return f"Correct — '{correct_text}'. You caught the paraphrase — speakers rarely use the question's exact words."
        return (f"{your}, but the answer is '{correct_text}'. The speaker rephrased the idea — listen for "
                f"synonyms, not exact words.")

    # ===== SHORT ANSWER =====
    if qt == "short_answer":
        if is_correct:
            return f"Correct — '{correct_text}'."
        return (f"{your}, but the answer is '{correct_text}'. Stay within the word limit and use the passage's wording.")

    # ===== FALLBACK =====
    if is_correct:
        return f"Correct — '{correct_text}'."
    return f"{your}, but the answer is '{correct_text}'."


def _stub_teacher_feedback(
    listening_results: Dict,
    reading_results: Dict,
    weak_summary: str,
    strong_summary: str,
) -> Dict[str, str]:
    """Deterministic teacher_feedback stub used when the LLM key is missing
    or the call fails. Same shape as the LLM JSON response so the frontend
    template renders unchanged. Section-aware: only mention sections that
    were actually taken (total > 0)."""
    l_total = listening_results.get("total", 0) or 0
    r_total = reading_results.get("total", 0) or 0
    l_correct = listening_results.get("correct", 0) or 0
    r_correct = reading_results.get("correct", 0) or 0
    l_pct = listening_results.get("percentage", 0)
    r_pct = reading_results.get("percentage", 0)

    # Build section-aware score line — skip sections with 0 questions.
    parts = []
    if l_total > 0:
        parts.append(f"Listening {l_correct}/{l_total} ({l_pct:.0f}%)")
    if r_total > 0:
        parts.append(f"Reading {r_correct}/{r_total} ({r_pct:.0f}%)")
    score_line = " and ".join(parts) if parts else "No sections completed"

    # Pick a tone based on the dominant section's accuracy.
    if r_total > 0 and l_total == 0:
        primary_pct = r_pct
        primary_name = "reading"
    elif l_total > 0 and r_total == 0:
        primary_pct = l_pct
        primary_name = "listening"
    else:
        primary_pct = (l_pct + r_pct) / 2 if (l_total or r_total) else 0
        primary_name = "test"

    if primary_pct >= 75:
        opener = f"Strong {primary_name} performance — you scored {score_line}."
    elif primary_pct >= 55:
        opener = f"Decent {primary_name} run at {score_line} — there's clear room to push higher."
    elif primary_pct > 0:
        opener = f"This {primary_name} attempt landed at {score_line} — let's pinpoint what tripped you up."
    else:
        opener = f"Your {primary_name} result: {score_line}."

    strong_clause = f" You handled {strong_summary} well." if strong_summary and strong_summary != "Keep practicing" else ""
    weak_clause = f" The biggest gain will come from working on {weak_summary}." if weak_summary and weak_summary != "None identified" else ""
    short = f"{opener}{strong_clause}{weak_clause}".strip()

    # Pull the single weakest skill name (first in the comma list) for a
    # tighter, less list-y sentence. The stub is intentionally short — the
    # rich drilldown + Skill Breakdown panel already shows the numbers.
    primary_weak = (weak_summary.split(",")[0].strip() if weak_summary and weak_summary != "None identified" else "")
    if primary_weak:
        detailed = (
            f"The pattern in your wrong answers points to {primary_weak} as the single biggest leak. "
            f"Open one wrong item at a time, read the evidence sentence, and decide whether you missed a paraphrase, a synonym, or a number/word-form clue. "
            f"Once you can name the cause for each one, retry a fresh passage and you should see the score move."
        )
    else:
        detailed = (
            "Open each wrong item one at a time, read the evidence sentence, and decide whether you missed a paraphrase, a synonym, or a word-form clue. "
            "Once you can name the cause for each one, a fresh passage should show the score move."
        )
    return {"short": short, "detailed": detailed}


def generate_lesson_recommendations(skill_breakdown: list, track: str) -> list:
    """Generate lesson recommendations based on weak areas"""
    recommendations = []

    # Find weakest skills
    weak_skills = [s for s in skill_breakdown if s["total"] > 0 and (s["correct"] / s["total"]) < 0.6]
    weak_skills.sort(key=lambda x: x["correct"] / x["total"] if x["total"] > 0 else 0)

    # Map question types to course lessons
    lesson_mapping = {
        "true_false_ng": {
            "lesson_id": "tfng-mastery",
            "title": "True/False/Not Given Mastery",
            "route": "/mastery?section=reading&lesson=tfng",
            "course": "IELTS Reading Mastery"
        },
        "yes_no_ng": {
            "lesson_id": "ynng-mastery",
            "title": "Yes/No/Not Given Strategies",
            "route": "/mastery?section=reading&lesson=ynng",
            "course": "IELTS Reading Mastery"
        },
        "matching_headings": {
            "lesson_id": "headings-mastery",
            "title": "Matching Headings Technique",
            "route": "/mastery?section=reading&lesson=headings",
            "course": "IELTS Reading Mastery"
        },
        "matching_information": {
            "lesson_id": "matching-info",
            "title": "Matching Information Practice",
            "route": "/mastery?section=reading&lesson=matching",
            "course": "IELTS Reading Mastery"
        },
        "sentence_completion": {
            "lesson_id": "sentence-comp",
            "title": "Sentence Completion Skills",
            "route": "/mastery?section=reading&lesson=sentence",
            "course": "IELTS Reading Mastery"
        },
        "summary_completion": {
            "lesson_id": "summary-comp",
            "title": "Summary Completion Strategy",
            "route": "/mastery?section=reading&lesson=summary",
            "course": "IELTS Reading Mastery"
        },
        "note_completion": {
            "lesson_id": "note-comp",
            "title": "Note Completion Listening",
            "route": "/mastery?section=listening&lesson=notes",
            "course": "IELTS Listening Mastery"
        },
        "form_completion": {
            "lesson_id": "form-comp",
            "title": "Form Completion Skills",
            "route": "/mastery?section=listening&lesson=forms",
            "course": "IELTS Listening Mastery"
        },
        "multiple_choice": {
            "lesson_id": "mc-strategy",
            "title": "Multiple Choice Strategy",
            "route": "/mastery?section=skills&lesson=mc",
            "course": "IELTS Skills Mastery"
        }
    }

    for skill in weak_skills[:5]:
        qtype = skill["skill_id"].split("_", 1)[-1] if "_" in skill["skill_id"] else skill["skill_id"]

        if qtype in lesson_mapping:
            lesson = lesson_mapping[qtype]
            recommendations.append({
                "lesson_id": lesson["lesson_id"],
                "title": lesson["title"],
                "course": lesson["course"],
                "route": lesson["route"],
                "reason": f"Your {skill['label']} accuracy is {skill['correct']}/{skill['total']} ({int(skill['correct']/skill['total']*100) if skill['total'] > 0 else 0}%)",
                "priority": "high" if (skill["correct"] / skill["total"] if skill["total"] > 0 else 0) < 0.4 else "medium"
            })

    return recommendations


def build_root_cause_analysis(reason_summary, question_results):
    """Summarize the main root causes behind wrong answers."""
    cause_labels = {
        "SPELLING_ERROR": "Spelling accuracy",
        "DISTRACTOR_TRAP": "Distractor trap",
        "NEAR_MISS": "Precision gap",
        "UNANSWERED": "Time management",
        "WRONG_ANSWER": "Core comprehension error",
    }
    sample_by_reason = {}
    all_details = (question_results.get("listening") or []) + (question_results.get("reading") or [])
    for detail in all_details:
        code = detail.get("reason_code")
        if code and code not in sample_by_reason and not detail.get("is_correct"):
            question_type = detail.get("question_type") or detail.get("type") or "question"
            sample_by_reason[code] = {
                "question_type": question_type,
                "question_id": detail.get("question_id"),
            }
    analysis = []
    for code, count in sorted(reason_summary.items(), key=lambda item: item[1], reverse=True):
        label = cause_labels.get(code, code.replace("_", " ").title())
        sample = sample_by_reason.get(code, {})
        analysis.append({
            "code": code,
            "label": label,
            "count": count,
            "impact": "high" if count >= 4 else "medium" if count >= 2 else "low",
            "what_it_means": {
                "SPELLING_ERROR": "You likely heard the right answer but wrote it inaccurately.",
                "DISTRACTOR_TRAP": "You followed an early tempting answer instead of the final evidence.",
                "NEAR_MISS": "Your answer was close, but not precise enough for IELTS marking.",
                "UNANSWERED": "You lost marks without giving yourself a chance to score them.",
                "WRONG_ANSWER": "The main idea or evidence was misunderstood."
            }.get(code, "This error pattern is costing you repeated marks."),
            "sample_question_type": sample.get("question_type"),
            "sample_question_id": sample.get("question_id"),
        })
    return analysis


def build_study_plan(overall_band, skill_breakdown, fastest_gain, recommended_lessons, reason_summary, question_results):
    """Build a prescriptive roadmap from the diagnostic data."""
    weakest_skills = [item for item in skill_breakdown if item.get("total", 0) > 0]
    weakest_skills.sort(key=lambda item: (item.get("correct", 0) / item.get("total", 1)))
    priority_skill = weakest_skills[0] if weakest_skills else None
    top_reason = next(iter(sorted(reason_summary.items(), key=lambda item: item[1], reverse=True)), None)
    target_band = min(9.0, round((overall_band + 0.5) * 2) / 2)
    expected_gain = sum(item.get("wrong_count", 0) for item in fastest_gain[:2])
    primary_lessons = recommended_lessons[:3]

    roadmap_steps = []
    if priority_skill:
        roadmap_steps.append({
            "title": f"Fix {priority_skill['label']}",
            "focus": priority_skill["label"],
            "why_now": "This is currently your lowest-performing question family.",
            "action": "Review the linked lesson, then revisit only the wrong questions from this skill.",
            "expected_gain": f"Recover up to {priority_skill['total'] - priority_skill['correct']} marks here.",
        })
    if top_reason:
        roadmap_steps.append({
            "title": f"Break the {top_reason[0].replace('_', ' ').title()} pattern",
            "focus": top_reason[0].replace("_", " ").title(),
            "why_now": f"This mistake pattern appeared {top_reason[1]} times.",
            "action": "Study the explanation pattern, then retry those items under timed conditions.",
            "expected_gain": f"Removing this pattern could recover up to {top_reason[1]} marks.",
        })
    for lesson in primary_lessons:
        roadmap_steps.append({
            "title": f"Study {lesson.get('title', 'Recommended Lesson')}",
            "focus": lesson.get("course_name") or lesson.get("course"),
            "why_now": lesson.get("reason") or "This lesson directly targets your current weaknesses.",
            "action": f"Open {lesson.get('unit_label', 'the lesson')} and complete the section tied to your weak skill.",
            "expected_gain": lesson.get("why_now") or "Build accuracy before retesting.",
            "lesson_path": lesson.get("lesson_path") or lesson.get("route") or lesson.get("url"),
        })

    day_plan = [
        {"day": 1, "title": "Audit your mistakes", "tasks": [
            "Review every wrong answer and group them by question type.",
            "Read the root-cause section and mark repeated patterns."
        ]},
        {"day": 2, "title": "Study the highest-impact lesson", "tasks": [
            primary_lessons[0]["title"] if primary_lessons else "Study the top recommended lesson.",
            "Write down 3 rules you will apply in the next test."
        ]},
        {"day": 3, "title": "Targeted retest", "tasks": [
            "Retry only the wrong questions from your weakest skill.",
            "Do one short timed set to check whether the same pattern repeats."
        ]},
    ]

    return {
        "target_band": target_band,
        "estimated_weeks": 2 if overall_band >= 6.5 else 3,
        "priority_skill": priority_skill["label"] if priority_skill else None,
        "top_root_cause": top_reason[0] if top_reason else None,
        "expected_mark_recovery": expected_gain,
        "roadmap_steps": roadmap_steps[:5],
        "three_day_plan": day_plan,
        "retest_strategy": {
            "immediate": "Retry only the question types with the highest wrong count after lesson review.",
            "timed_recheck": "Run a short timed mini-test after 2-3 focused sessions.",
            "full_retake": "Take a full test only after your top two weak areas stabilize."
        }
    }
