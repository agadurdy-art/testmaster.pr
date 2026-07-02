"""
Liz Teacher — user-context builders & prompt assembly.

Single job: build everything Liz's system prompt needs — the student
profile (get_user_context), homework context, the D8 study-plan helpers
(LLM-generated 7-day plan), voice pronunciation context (Azure), the
system prompt template itself, and the [HOMEWORK]/[NAVIGATE] response
parsers.

Extracted from routes/liz_teacher.py (Faz 1 refactor, 2026-07-02).
`db` is injected via routes/liz_teacher.py (server.py sets
`liz_teacher.db = db`, which fans out to every liz_* module).
"""
import os
import re
import json
import uuid
import logging
import base64
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

from services import liz_llm

db = None
logger = logging.getLogger(__name__)
LIZ_ALLOWED_HOMEWORK_TYPES = {"vocabulary", "writing", "grammar", "speaking"}
LIZ_HISTORY_TURNS = 6
LIZ_CONTEXT_MESSAGE_CHARS = 240
LIZ_SUPPORTED_FEEDBACK_LANGUAGES = {
    "en", "tr", "vi", "zh", "ar", "ko", "th", "ja", "es", "pt", "ru", "id",
}
NAVIGATE_PATTERN = re.compile(r"\[NAVIGATE:\s*(?P<path>[^|\]]+?)\s*\|\s*(?P<label>[^\]]+?)\s*\]")

LIZ_SYSTEM_PROMPT = """You are Liz, a professional IELTS teacher and personal study coach on the "IELTS Ace" platform.

## Your Role
You are NOT a chatbot or a generic AI assistant. You are a dedicated IELTS teacher who:
- Knows the student's current level, progress, and weak areas
- Guides them step by step with structured, actionable plans
- Provides analytical, IELTS-specific feedback
- Motivates realistically based on actual performance data

## Personality
- Professional and analytical
- Supportive but never generic
- Uses proper IELTS terminology (band descriptors, task achievement, coherence & cohesion, lexical resource, grammatical range & accuracy)
- Always references past performance when data is available
- Gives structured plans and specific, actionable advice
- Avoids empty praise

WRONG: "Amazing!!! Keep going!!!"
RIGHT: "Your coherence has improved from your last attempt. Focus on paragraph transitions next."

## Communication Rules
- Use IELTS band descriptor terminology
- Keep structured formatting with clear sections
- Be concise unless delivering a lesson or evaluation
- Avoid childish tone or excessive emojis
- Never give generic praise without backing it with data
- Always respond in English (you are an English teacher)
- If the student writes in another language, gently encourage them to try in English

## Remembering the student's stated goals
The Student Profile below may include onboarding-declared fields: native language,
their stated motivation ("Why they're studying"), exam date, self-reported current
and target bands, and self-declared weak areas. Treat these as things the student
told you personally. Reference them naturally when relevant — e.g. "You mentioned
you need this for university admission, so let's prioritize Writing Task 2," or
"Since your exam is on {date}, here's a 6-week plan." Do NOT list them back as
data; weave them into coaching. If score-derived data later contradicts the
self-report (e.g. their actual writing average is lower than the band they
claimed), gently use the real data without calling out the discrepancy.

## Core Capabilities

### 1. Progress Analysis
- Analyze score changes over time
- Detect stagnation or plateaus
- Predict band readiness with realistic timelines
- Identify the weakest skill that needs attention
- Recommend optimal practice order

Example: "Based on your recent scores, IELTS 6.5 is realistic in 6-8 weeks if you focus on writing coherence."

### 2. Skill Builder (Interactive Micro-Lessons)
When teaching a skill, follow this structure:
1. Brief explanation of the concept
2. Short practice task
3. Immediate feedback on the student's attempt
4. A slightly harder task
5. Recap of what was learned

Skill types: Vocabulary expansion, Grammar correction, Reading strategy, Listening focus training, Speaking fluency drills, Writing structure building.

### 3. Speaking Evaluation
When evaluating spoken English (from voice transcription):
- Evaluate using IELTS criteria:
  * Fluency & Coherence (FC)
  * Lexical Resource (LR)
  * Grammatical Range & Accuracy (GRA)
  * Pronunciation (limited by transcription quality)
- Give estimated band score per criterion
- Provide a model improved version of what the student said
- Identify hesitation patterns or filler word overuse

### 4. Writing Evaluation
When evaluating written English:
- Estimate band score using IELTS criteria:
  * Task Achievement/Response
  * Coherence & Cohesion
  * Lexical Resource
  * Grammatical Range & Accuracy
- Highlight weak areas specifically
- Suggest vocabulary upgrades with examples
- Provide model corrections for 1-2 weak paragraphs
- TEACH improvement, do not rewrite everything

### 5. Study Planning
- Create short-term study plans (daily/weekly)
- Recommend specific practice activities
- Detect inactivity and give accountability reminders
- Adjust difficulty based on performance

### 6. Motivation Engine
- Give accountability reminders when student is inactive
- Provide performance-based encouragement (backed by data)
- Give realistic timeline predictions
- Never use empty motivational phrases

Example: "You haven't practiced writing in 4 days. This may slow your progress toward Band 7."

## Student Profile
{user_context}

{homework_context}

## Deep-linking to IELTS Ace routes
When you recommend a specific practice activity inside the app, add a navigation marker at the end of the sentence using this EXACT format:

[NAVIGATE: /route | Button label]

Examples:
- Try a Task 2 essay next. [NAVIGATE: /writing-task2 | Start Task 2]
- Let's fix your pronunciation on /θ/. [NAVIGATE: /speaking/v2 | Speaking practice]

Rules:
- Only use real in-app routes (start with /). Never invent URLs.
- Maximum 2 NAVIGATE markers per response.
- The marker itself is stripped from the chat bubble and rendered as a button — so the surrounding sentence must still make sense without it.

## Homework Assignment
At the end of lessons or when appropriate, you can assign homework to the student. Use this EXACT format:

[HOMEWORK]
type: vocabulary
title: Academic Word List Practice
task: Learn these 10 words and write one sentence for each. Be ready for a quiz next session.
due: 2
[/HOMEWORK]

Available homework types: vocabulary, writing, grammar, speaking
The [HOMEWORK] block is automatically detected and tracked as an assignment.
After the block, briefly tell the student what you've assigned.
Only assign 1 homework per response. Make tasks specific and achievable.

When a student submits homework or says they completed it, evaluate their work thoroughly using IELTS criteria.

## Boundaries
- Focus exclusively on English learning and IELTS preparation
- No medical advice, life coaching, or unrelated topics
- Never encourage cheating or break academic integrity
- Only reference actual data - never fabricate scores or progress
- If you don't know something, be honest about it"""


HOMEWORK_PATTERN = re.compile(r'\[HOMEWORK\](.*?)\[/HOMEWORK\]', re.DOTALL)


def parse_navigate_links(response: str):
    """Extract [NAVIGATE: /route | Label] tokens from Liz's response.

    Returns (cleaned_response, [{"path": "/x", "label": "Y"}, ...]).
    The tokens are stripped so they don't render in the chat bubble; the
    frontend is expected to render them as pill-buttons next to the message.
    """
    links = []
    for match in NAVIGATE_PATTERN.finditer(response):
        path = match.group("path").strip()
        label = match.group("label").strip()
        if path and label and path.startswith("/"):
            links.append({"path": path, "label": label})
    cleaned = NAVIGATE_PATTERN.sub("", response).strip()
    return cleaned, links


def _normalize_feedback_language(lang: Optional[str]) -> Optional[str]:
    if not lang:
        return None
    code = lang.strip().lower()[:2]
    return code if code in LIZ_SUPPORTED_FEEDBACK_LANGUAGES else None


def _language_directive(lang: Optional[str]) -> str:
    """Build a language instruction block for the system prompt.

    English output stays the default. Other supported languages override the
    explanatory portion while keeping IELTS terminology in English.
    """
    if not lang or lang == "en":
        return ""
    names = {
        "tr": "Turkish",
        "vi": "Vietnamese",
        "zh": "Mandarin Chinese",
        "ar": "Arabic",
        "ko": "Korean",
        "th": "Thai",
        "ja": "Japanese",
        "es": "Spanish",
        "pt": "Portuguese",
        "ru": "Russian",
        "id": "Indonesian",
    }
    name = names.get(lang)
    if not name:
        return ""
    return (
        f"\n\n## Feedback Language\n"
        f"Write your explanations and coaching in {name}. Keep IELTS-specific "
        f"terms (band descriptors, task achievement, coherence & cohesion, "
        f"lexical resource, grammatical range & accuracy) in English. Model "
        f"answers and vocabulary examples stay in English."
    )


def _sanitize_homework_text(value: str, max_length: int) -> str:
    cleaned = re.sub(r"\s+", " ", (value or "")).strip()
    return cleaned[:max_length]


def build_recent_conversation_context(messages: List[Dict[str, Any]]) -> str:
    """Compress recent turns into a bounded prompt block."""
    if not messages:
        return ""
    recent = messages[-(LIZ_HISTORY_TURNS * 2):]
    history_lines = []
    for msg in recent:
        role = "Student" if msg.get("role") == "user" else "Liz"
        content = _sanitize_homework_text(msg.get("content", ""), LIZ_CONTEXT_MESSAGE_CHARS)
        if content:
            history_lines.append(f"{role}: {content}")
    if not history_lines:
        return ""
    return "\n\n## Recent Conversation:\n" + "\n".join(history_lines)


def parse_homework_from_response(response: str, user_id: str, session_id: str):
    """Parse [HOMEWORK] blocks from Liz's response. Returns (cleaned_response, homework_list)."""
    matches = HOMEWORK_PATTERN.findall(response)
    homework_list = []
    for match in matches:
        hw = {"user_id": user_id, "session_id": session_id, "status": "pending",
              "homework_id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat()}
        for line in match.strip().split("\n"):
            line = line.strip()
            if line.lower().startswith("type:"):
                hw_type = line.split(":", 1)[1].strip().lower()
                hw["type"] = hw_type if hw_type in LIZ_ALLOWED_HOMEWORK_TYPES else "vocabulary"
            elif line.lower().startswith("title:"):
                hw["title"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("task:"):
                hw["task"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("due:"):
                try:
                    days = int(line.split(":", 1)[1].strip())
                except ValueError:
                    days = 2
                hw["due_date"] = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
        if hw.get("title") and hw.get("task"):
            hw.setdefault("type", "vocabulary")
            hw.setdefault("due_date", (datetime.now(timezone.utc) + timedelta(days=2)).isoformat())
            homework_list.append(hw)

    cleaned = HOMEWORK_PATTERN.sub("", response).strip()
    return cleaned, homework_list


async def get_homework_context(user_id: str) -> str:
    """Get pending homework info for system prompt."""
    if db is None:
        return ""
    pending = await db.liz_homework.find(
        {"user_id": user_id, "status": {"$in": ["pending", "submitted"]}},
        {"_id": 0}
    ).sort("due_date", 1).to_list(10)
    if not pending:
        return ""
    lines = ["## Student's Pending Homework:"]
    for hw in pending:
        status_text = "awaiting submission" if hw["status"] == "pending" else "submitted - needs your review"
        overdue = ""
        if hw.get("due_date"):
            due = datetime.fromisoformat(hw["due_date"])
            if due < datetime.now(timezone.utc) and hw["status"] == "pending":
                overdue = " (OVERDUE)"
        lines.append(f"- [{hw.get('type', 'general').upper()}] {hw.get('title', 'Untitled')} - {status_text}{overdue}")
        if hw["status"] == "submitted":
            lines.append(f"  Student's submission: \"{hw.get('submission', '')[:200]}\"")
    return "\n".join(lines)


# ─── D8 Study Plan helpers ────────────────────────────────────────────────────
# Backs lizStatus.{plan_day, plan_days, week_plan, focus_steps, focus_note,
# recommended_course, streak_days}. Plan persists in db.liz_study_plans for 7
# days; after expiry a fresh plan is generated by Sonnet from the user's
# latest target_band + weak_skills + streak. Frontend has fallback paths if
# any of these come back null.

async def _get_minimal_profile(user_id: str) -> dict:
    """Lightweight profile slice for plan generation + status payload."""
    profile = {"current_estimated_level": None, "target_band": 6.5, "weak_skills": [], "study_streak_days": 0}
    if db is None:
        return profile

    completions = await db.user_completions.find(
        {"user_id": user_id},
        {"_id": 0, "band_score": 1, "skill": 1, "completed_at": 1},
    ).sort("completed_at", -1).to_list(30)

    skill_scores: Dict[str, List[float]] = {}
    all_scores: List[float] = []
    activity_dates = set()
    for c in completions:
        score = c.get("band_score")
        if score:
            all_scores.append(score)
            skill = c.get("skill")
            if skill:
                skill_scores.setdefault(skill, []).append(score)
        dt = c.get("completed_at")
        if dt:
            activity_dates.add(str(dt)[:10])

    if all_scores:
        recent_avg = sum(all_scores[:5]) / min(len(all_scores), 5)
        profile["current_estimated_level"] = round(recent_avg, 1)
        profile["target_band"] = min(round(recent_avg + 1.0, 1), 9.0)

    skill_avgs = {s: sum(v) / len(v) for s, v in skill_scores.items() if v}
    if skill_avgs:
        sorted_skills = sorted(skill_avgs.items(), key=lambda x: x[1])
        profile["weak_skills"] = [s for s, avg in sorted_skills[:2] if avg < 7.0]

    sessions = await db.liz_sessions.find(
        {"user_id": user_id}, {"_id": 0, "created_at": 1}
    ).to_list(50)
    for s in sessions:
        dt = s.get("created_at")
        if dt:
            activity_dates.add(str(dt)[:10])

    if activity_dates:
        streak = 0
        check_date = datetime.now(timezone.utc).date()
        for _ in range(60):
            if check_date.isoformat() in activity_dates:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        profile["study_streak_days"] = streak

    return profile


def _recommended_course_for_band(current_band: Optional[float]) -> Dict[str, str]:
    """Map estimated band → course shell tile.
    Returned shape matches what the D8 LizD8 study-plan drawer expects."""
    band = current_band if current_band is not None else 5.5
    if band < 5.5:
        return {
            "level": "beginner",
            "short_label": "Beginner Course",
            "href": "/beginner-course",
            "sub": "Foundation grammar + vocab",
        }
    if band < 6.5:
        return {
            "level": "mastery",
            "short_label": "Mastery Course",
            "href": "/mastery-course",
            "sub": "Band 5–6.5 → Band 7",
        }
    return {
        "level": "advanced",
        "short_label": "Advanced Mastery",
        "href": "/advanced-mastery",
        "sub": "Band 7+ polish and exam tactics",
    }


async def _generate_study_plan_via_llm(profile: dict) -> Optional[dict]:
    """Ask Sonnet for a JSON 7-day plan. Returns None on any failure."""
    target = profile.get("target_band", 6.5)
    current = profile.get("current_estimated_level")
    weak = profile.get("weak_skills", []) or []
    streak = profile.get("study_streak_days", 0)
    weak_str = ", ".join(weak) if weak else "balanced (no clear weakness)"
    current_str = f"Band {current}" if current is not None else "unknown (new student)"

    system = """You are Liz, an IELTS coach generating a 7-day study plan.
Output ONLY a valid JSON object — no prose, no code fences.

Schema:
{
  "plan_days": 7,
  "focus_note": "one short sentence framing this week's priority",
  "week_plan": [
    {
      "day": 1,
      "skill": "writing|speaking|reading|listening|grammar|vocabulary",
      "focus": "short topic label (max 6 words)",
      "task_min": 25,
      "steps": ["actionable step 1", "step 2", "step 3", "step 4"]
    }
  ]
}

Rules:
- Exactly 7 entries in week_plan, days 1..7.
- Each day's `steps` has exactly 4 items, each ≤12 words, imperative voice.
- Rotate skills with double weight on weak skills.
- `focus` is a label, not a sentence.
- Keep band-realistic difficulty for this student."""

    user_msg = f"""Profile:
- Current level: {current_str}
- Target band: {target}
- Weak skills: {weak_str}
- Current study streak: {streak} days

Build the 7-day plan."""

    try:
        raw = await liz_llm.complete(
            system=system,
            user_message=user_msg,
            session_id="liz_plan_gen",
            task="deep",
            max_tokens=1800,
        )
    except Exception as e:
        logger.warning("Liz study plan LLM call failed: %s", e)
        return None

    raw = (raw or "").strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw.rsplit("```", 1)[0]
        raw = raw.strip()

    try:
        parsed = json.loads(raw)
    except Exception as e:
        logger.warning("Liz study plan JSON parse failed: %s | raw=%s", e, raw[:200])
        return None

    if not isinstance(parsed, dict) or not isinstance(parsed.get("week_plan"), list):
        return None
    parsed.setdefault("plan_days", 7)
    parsed["target_band"] = target
    parsed["weak_skills"] = weak
    return parsed


async def get_or_create_study_plan(user_id: str, profile: Optional[dict] = None) -> Optional[dict]:
    """Return the user's active 7-day plan, generating one if absent/expired."""
    if db is None:
        return None

    existing = await db.liz_study_plans.find_one({"user_id": user_id}, {"_id": 0})
    now = datetime.now(timezone.utc)

    if existing:
        try:
            created_str = existing.get("created_at", "")
            created_at = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
            plan_days = int(existing.get("plan_days", 7))
            days_elapsed = (now - created_at).days
            if 0 <= days_elapsed < plan_days:
                existing["plan_day"] = min(days_elapsed + 1, plan_days)
                return existing
        except Exception as e:
            logger.warning("Liz plan cache read failed (regenerating): %s", e)

    if profile is None:
        profile = await _get_minimal_profile(user_id)

    plan = await _generate_study_plan_via_llm(profile)
    if not plan:
        return None

    plan["user_id"] = user_id
    plan["created_at"] = now.isoformat()
    plan["plan_day"] = 1
    try:
        await db.liz_study_plans.replace_one({"user_id": user_id}, plan, upsert=True)
    except Exception as e:
        logger.warning("Liz plan persist failed: %s", e)
    return plan


async def build_voice_pronunciation_context(audio_data_b64: Optional[str]) -> tuple:
    if not audio_data_b64 or not os.getenv("AZURE_SPEECH_KEY"):
        return "", None
    try:
        from routes.speaking_qb import azure_pronunciation_assessment
        audio_bytes = base64.b64decode(audio_data_b64)
        azure_result = await azure_pronunciation_assessment(audio_bytes, reference_text=None, language="en-US")
        if not azure_result or not azure_result.get("success"):
            return "", None

        # Word-level pronunciation array — frontend (D8 LizTeacher TeacherNote)
        # underlines low-score words inline. Each item: {word, score, tip?}.
        # We surface every word so the UI can render the full sentence; weak
        # ones (score < 70) get a wavy underline, strong ones render plain.
        word_results = azure_result.get("word_results", []) or []
        words_payload = []
        weak_words = []
        for w in word_results:
            word_text = (w.get("word") or "").strip()
            if not word_text:
                continue
            try:
                score_val = round(float(w.get("accuracy_score", 100)), 1)
            except (TypeError, ValueError):
                score_val = 100.0
            err = (w.get("error_type") or "None")
            tip_parts = [f"{score_val:.0f}/100 accuracy"]
            if err and err != "None":
                tip_parts.append(f"{err.lower()} error")
            problem_phonemes = w.get("problem_phonemes") or []
            if problem_phonemes:
                phon_list = ", ".join(p.get("phoneme", "?") for p in problem_phonemes[:3])
                tip_parts.append(f"weak phonemes: {phon_list}")
            words_payload.append({
                "word": word_text,
                "score": score_val,
                "tip": " · ".join(tip_parts),
            })
            if score_val < 70 or (err and err != "None"):
                weak_words.append(word_text)

        azure_scores = {
            "pronunciation": round(float(azure_result.get("pronunciation_score", 0)), 1),
            "accuracy": round(float(azure_result.get("accuracy_score", 0)), 1),
            "fluency": round(float(azure_result.get("fluency_score", 0)), 1),
            "completeness": round(float(azure_result.get("completeness_score", 0)), 1),
            "prosody": round(float(azure_result.get("prosody_score", 0)), 1),
            "words": words_payload or None,
        }
        weak_words_line = (
            f"- Words to practice: {', '.join(weak_words[:8])}\n"
            if weak_words else ""
        )
        azure_context = (
            "\n\n## Acoustic Pronunciation Signals\n"
            f"- Pronunciation: {azure_scores['pronunciation']}/100\n"
            f"- Accuracy: {azure_scores['accuracy']}/100\n"
            f"- Fluency: {azure_scores['fluency']}/100\n"
            f"- Completeness: {azure_scores['completeness']}/100\n"
            f"- Prosody: {azure_scores['prosody']}/100\n"
            f"{weak_words_line}"
            "Use these scores when you comment on pronunciation and fluency."
        )
        return azure_context, azure_scores
    except Exception as exc:
        logger.warning("Liz Azure pronunciation unavailable: %s", exc)
        return "", None


async def get_user_context(user_id: str) -> str:
    """Build comprehensive student profile for Liz's context injection."""
    if db is None:
        return "No student data available. This appears to be a new student."

    profile = {}

    # 1. Basic user info
    user = await db.users.find_one(
        {"id": user_id},
        {
            "_id": 0,
            "name": 1,
            "email": 1,
            "plan": 1,
            "created_at": 1,
            # B3 onboarding goals — surfaced so Liz can reference them naturally.
            "native_language": 1,
            "motivation": 1,
            "declared_weak_skills": 1,
            "exam_date": 1,
            "target_band": 1,
            "current_band": 1,
            "path": 1,
        },
    )
    if user:
        profile["name"] = user.get("name", "Student")
        profile["plan"] = user.get("plan", "free")
        created = user.get("created_at")
        if created:
            profile["member_since"] = str(created)[:10] if isinstance(created, str) else created.strftime("%Y-%m-%d")
        # Onboarding-declared goals. These are *self-reported* — the score-derived
        # target_band/weak_skills below override them once the student has data.
        if user.get("native_language"):
            profile["native_language"] = user["native_language"]
        if user.get("motivation"):
            profile["motivation"] = user["motivation"]
        if user.get("declared_weak_skills"):
            profile["declared_weak_skills"] = user["declared_weak_skills"]
        if user.get("exam_date"):
            profile["exam_date"] = user["exam_date"]
        if user.get("current_band") is not None:
            profile["declared_current_band"] = user["current_band"]
        if user.get("target_band") is not None:
            profile["declared_target_band"] = user["target_band"]
        if user.get("path"):
            profile["path"] = user["path"]

    # 2. Test completions with scores
    completions = await db.user_completions.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("completed_at", -1).to_list(50)

    skill_scores = {"listening": [], "reading": [], "writing": [], "speaking": []}
    all_scores = []
    last_5_scores = []

    for c in completions:
        score = c.get("band_score")
        if score:
            all_scores.append({
                "score": score,
                "test_id": c.get("test_id", ""),
                "category": c.get("category", ""),
                "date": str(c.get("completed_at", ""))[:10]
            })
            # Categorize by skill if available
            skill = c.get("skill")
            if skill and skill in skill_scores:
                skill_scores[skill].append(score)

    if all_scores:
        last_5_scores = all_scores[:5]
        profile["tests_completed"] = len(all_scores)

    # 3. Calculate level and trends
    if all_scores:
        recent_avg = sum(s["score"] for s in all_scores[:5]) / min(len(all_scores), 5)
        profile["current_estimated_level"] = round(recent_avg, 1)
        profile["target_band"] = min(round(recent_avg + 1.0, 1), 9.0)

        if len(all_scores) >= 3:
            recent_3 = sum(s["score"] for s in all_scores[:3]) / 3
            older_3 = sum(s["score"] for s in all_scores[-3:]) / min(len(all_scores), 3)
            if recent_3 > older_3 + 0.3:
                profile["improvement_trend"] = "improving"
            elif recent_3 < older_3 - 0.3:
                profile["improvement_trend"] = "declining"
            else:
                profile["improvement_trend"] = "stable"

    # 4. Identify weak and strong skills
    weak_skills = []
    strong_skills = []
    skill_averages = {}

    for skill, scores in skill_scores.items():
        if scores:
            avg = sum(scores) / len(scores)
            skill_averages[skill] = round(avg, 1)

    if skill_averages:
        sorted_skills = sorted(skill_averages.items(), key=lambda x: x[1])
        weak_skills = [s[0] for s in sorted_skills[:2] if s[1] < 7.0]
        strong_skills = [s[0] for s in sorted_skills[-2:] if s[1] >= 6.0]

    # 5. Study streak and last active
    activity_dates = set()
    for c in completions:
        dt = c.get("completed_at")
        if dt:
            date_str = str(dt)[:10]
            activity_dates.add(date_str)

    # Check chat sessions for activity
    sessions = await db.liz_sessions.find(
        {"user_id": user_id}, {"_id": 0, "created_at": 1}
    ).to_list(50)

    for s in sessions:
        dt = s.get("created_at")
        if dt:
            date_str = str(dt)[:10]
            activity_dates.add(date_str)

    if activity_dates:
        sorted_dates = sorted(activity_dates, reverse=True)
        profile["last_active"] = sorted_dates[0]

        # Calculate streak
        streak = 0
        today = datetime.now(timezone.utc).date()
        check_date = today
        for _ in range(30):
            if check_date.isoformat() in activity_dates:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        profile["study_streak_days"] = streak

        # Detect inactivity
        last_date = datetime.fromisoformat(sorted_dates[0]).date() if sorted_dates[0] else today
        days_inactive = (today - last_date).days
        if days_inactive > 2:
            profile["days_inactive"] = days_inactive

    # 6. Learning progress
    learning_progress = await db.user_learning_progress.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(50)
    if learning_progress:
        profile["completed_lessons"] = len(learning_progress)

    # 7. Grammar Blueprint practice is stateless — no per-user quiz progress stored.
    #    The old `vocab_grammar_quiz_progress` signal was retired 2026-04-23.

    # 8. Build recommended next step
    if weak_skills:
        profile["recommended_focus"] = f"Practice {weak_skills[0]} - this is currently your weakest area"
    elif not all_scores:
        profile["recommended_focus"] = "Take a practice test to establish your baseline level"
    else:
        profile["recommended_focus"] = "Continue balanced practice across all skills"

    # Format as readable context
    lines = []
    lines.append(f"Student: {profile.get('name', 'Unknown')}")
    lines.append(f"Plan: {profile.get('plan', 'free')}")

    # Onboarding-declared goals (B3 — Liz remembers what they told us up front).
    if profile.get("path"):
        lines.append(f"Goal track: {profile['path']}")
    if profile.get("native_language"):
        nl = profile["native_language"]
        nl_name = nl.get("name") if isinstance(nl, dict) else str(nl)
        if nl_name:
            lines.append(f"Native language: {nl_name}")
    if profile.get("motivation"):
        lines.append(f"Why they're studying: \"{profile['motivation']}\"")
    if profile.get("exam_date"):
        lines.append(f"Stated exam date: {profile['exam_date']}")
    if profile.get("declared_current_band") is not None:
        lines.append(f"Self-reported current band: {profile['declared_current_band']}")
    if profile.get("declared_target_band") is not None:
        lines.append(f"Self-reported target band: {profile['declared_target_band']}")
    if profile.get("declared_weak_skills"):
        lines.append(
            f"Self-declared weak areas: {', '.join(str(s) for s in profile['declared_weak_skills'])}"
        )

    if "current_estimated_level" in profile:
        lines.append(f"Current estimated level: Band {profile['current_estimated_level']}")
        lines.append(f"Target band: {profile['target_band']}")

    if "improvement_trend" in profile:
        lines.append(f"Improvement trend: {profile['improvement_trend']}")

    if "tests_completed" in profile:
        lines.append(f"Tests completed: {profile['tests_completed']}")

    if skill_averages:
        lines.append("Skill breakdown:")
        for skill, avg in sorted(skill_averages.items(), key=lambda x: x[1]):
            lines.append(f"  - {skill.capitalize()}: Band {avg}")

    if weak_skills:
        lines.append(f"Weak skills: {', '.join(s.capitalize() for s in weak_skills)}")
    if strong_skills:
        lines.append(f"Strong skills: {', '.join(s.capitalize() for s in strong_skills)}")

    if last_5_scores:
        lines.append("Recent scores:")
        for s in last_5_scores:
            lines.append(f"  - {s['test_id']} ({s['category']}): Band {s['score']} on {s['date']}")

    if "study_streak_days" in profile:
        lines.append(f"Study streak: {profile['study_streak_days']} days")

    if "days_inactive" in profile:
        lines.append(f"WARNING: Student has been inactive for {profile['days_inactive']} days")

    if "last_active" in profile:
        lines.append(f"Last active: {profile['last_active']}")

    if "completed_lessons" in profile:
        lines.append(f"Lessons completed: {profile['completed_lessons']}")

    if "grammar_quizzes_completed" in profile:
        lines.append(f"Grammar quizzes: {profile['grammar_quizzes_completed']} (avg score: {profile.get('avg_grammar_score', 'N/A')})")

    if "recommended_focus" in profile:
        lines.append(f"Recommended next step: {profile['recommended_focus']}")

    # 9. Detailed speaking history — per-criterion bands + weakest area from the
    #    latest structured evaluations, so Liz coaches on specifics (e.g. "your
    #    pronunciation was 5.5 last time") rather than just the skill average.
    try:
        spk_attempts = await db.speaking_practice_structured_attempts.find(
            {"user_id": user_id},
            {"_id": 0, "part": 1, "topic": 1, "result": 1, "created_at": 1},
        ).sort("created_at", -1).to_list(3)
    except Exception:
        spk_attempts = []
    _CRIT = {"fc": "fluency & coherence", "lr": "lexical resource", "gra": "grammar", "pr": "pronunciation"}
    if spk_attempts:
        lines.append("Recent speaking evaluations (newest first):")
        for a in spk_attempts:
            sc = (a.get("result") or {}).get("scores") or {}
            part = a.get("part") or "speaking"
            when = str(a.get("created_at", ""))[:10]
            crit_bits = [f"{label} {sc.get(k)}" for k, label in _CRIT.items() if sc.get(k) is not None]
            line = f"  - {part} (band {sc.get('overall')}) on {when}"
            if crit_bits:
                line += f": {', '.join(crit_bits)}"
            lines.append(line)
        latest = (spk_attempts[0].get("result") or {}).get("scores") or {}
        crit_vals = {k: latest.get(k) for k in _CRIT if isinstance(latest.get(k), (int, float))}
        if crit_vals:
            weakest = min(crit_vals, key=crit_vals.get)
            lines.append(
                f"Speaking weakest area (latest): {_CRIT[weakest]} (band {crit_vals[weakest]}) — prioritise this in coaching."
            )

    if not lines or len(lines) <= 2:
        return "This is a new student with no test history yet. Welcome them and help them get started with IELTS preparation. Suggest taking a diagnostic test first."

    return "\n".join(lines)
