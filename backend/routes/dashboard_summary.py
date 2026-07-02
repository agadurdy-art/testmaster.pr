"""
Dashboard summary
=================
Single job: GET /dashboard/summary — the D1 dashboard aggregate (streaks,
recent sessions, per-skill stats). Collections: users, test_attempts,
study_time_intervals (read-only).

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException

import auth_session

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


#
# /api/dashboard/summary is the single read the IELTS-Ace dashboard makes on
# mount. It returns everything DashboardPage needs: user state + skill bands
# + streak + recent sessions + a recommended Today's Task, Liz nudge, and
# Mock pick — all derived from real test_attempts data rather than frontend
# fixtures (bug report 2026-04-21: "bilgisi olmadigi halde band bilgisi veriyor").
#
# Today's Task / Liz message / Mock are picked with a small rules engine (no
# LLM call) so they remain deterministic, fast, and free to serve. Copy lives
# inline in SKILL_TASK_LIBRARY below; localise via i18n on the frontend if we
# ever want non-EN output.

SKILL_TASK_LIBRARY = {
    "writing": {
        "today_task_key": "writing_task2_coherence",
        "today_task": {
            "title": "Task 2 coherence drill",
            "description": "Tighten the links between body paragraphs in a Task 2 essay — cohesive devices, topic sentences, and the rhythm that pushes a 6 toward a 7.",
            "duration_minutes": 10,
            "steps": [
                "Identify weak transitions in a sample essay.",
                "Rewrite three body paragraphs with Liz's feedback.",
                "Run the final draft through the evaluator.",
            ],
            "cta_href": "/question-bank/writing/task2",
        },
        "liz_message": "Your writing band is pulling the overall down. Let's work on coherence today — the quietest skill that lifts a 6 toward a 7.",
        "mock_section_href": "/practice-test/writing",
        "mock_recommendation": "Writing full mock (60 min)",
    },
    "reading": {
        "today_task_key": "reading_skim_scan",
        "today_task": {
            "title": "Skim + scan drill",
            "description": "A 20-minute academic passage with True/False/Not Given — build speed without losing the gist.",
            "duration_minutes": 20,
            "steps": [
                "Skim the passage in under three minutes.",
                "Answer the T/F/NG block before reading closely.",
                "Check missed ones against the paragraph that paraphrased them.",
            ],
            "cta_href": "/question-bank/reading",
        },
        "liz_message": "Reading accuracy is where your next half-band lives. A timed T/F/NG set today will tell us which question type is leaking marks.",
        "mock_section_href": "/practice-test/reading",
        "mock_recommendation": "Reading full mock (60 min)",
    },
    "listening": {
        "today_task_key": "listening_section3",
        "today_task": {
            "title": "Section 3 note completion",
            "description": "Academic discussion — the section where most students lose their streak. Focus on signposting words and spelling.",
            "duration_minutes": 15,
            "steps": [
                "Preview the questions for 30 seconds.",
                "Listen once through and answer in real time.",
                "Check spelling — that's where the marks go.",
            ],
            "cta_href": "/question-bank/listening",
        },
        "liz_message": "Listening drops in Section 3 for most students. Let's do a 15-minute set today and see where the gaps are.",
        "mock_section_href": "/practice-test/listening",
        "mock_recommendation": "Listening full mock (30 min)",
    },
    "speaking": {
        "today_task_key": "speaking_part2_cue",
        "today_task": {
            "title": "Part 2 cue card",
            "description": "A two-minute monologue from a fresh cue card — record, self-review, then ask Liz for two concrete fixes.",
            "duration_minutes": 5,
            "steps": [
                "Prepare for 60 seconds.",
                "Record a two-minute answer.",
                "Send it to the evaluator for a band + top-two fixes.",
            ],
            "cta_href": "/question-bank/speaking",
        },
        "liz_message": "Speaking fluency grows with daily minutes, not weekly hours. A single Part 2 cue today keeps the muscle warm.",
        "mock_section_href": "/practice-test/speaking",
        "mock_recommendation": "Speaking mock (11–14 min)",
    },
}

# Fallback when the user has zero history — give them a gentle on-ramp.
NEW_USER_TASK = {
    "today_task_key": "first_drill",
    "today_task": {
        "title": "Your first drill",
        "description": "A ten-minute Writing Task 2 prompt to set a baseline. Liz will read it and flag your first two fixes.",
        "duration_minutes": 10,
        "steps": [
            "Read the prompt and plan for two minutes.",
            "Write 220+ words against the timer.",
            "Submit for a band score and two concrete fixes.",
        ],
        "cta_href": "/question-bank/writing/task2",
    },
    "liz_message": "Welcome in. Before anything else, let's set a baseline — a short writing prompt today tells me where to point the rest of your week.",
    "mock_section_href": "/practice-test",
    "mock_recommendation": "Full mock test (2h 45m)",
    "skill": None,
}


def _skill_from_test_type(test_type: str) -> str:
    """Map legacy test_type values onto the four-skill taxonomy."""
    if not test_type:
        return "writing"
    t = test_type.lower()
    if "writ" in t:
        return "writing"
    if "read" in t:
        return "reading"
    if "listen" in t:
        return "listening"
    if "speak" in t:
        return "speaking"
    return "writing"


def _session_title(attempt: dict) -> str:
    """Build a short editorial title for a recent session card."""
    skill = _skill_from_test_type(attempt.get("test_type"))
    skill_label = {
        "writing": "Writing",
        "reading": "Reading",
        "listening": "Listening",
        "speaking": "Speaking",
    }.get(skill, skill.capitalize())
    test_id = attempt.get("test_id") or ""
    # test_id often encodes the sub-type (e.g. "writing-task2-line-graph").
    subtitle_frag = ""
    if test_id:
        tail = test_id.rsplit("-", 2)
        if len(tail) >= 2:
            subtitle_frag = " — " + tail[-1].replace("_", " ").title()
    return f"{skill_label}{subtitle_frag}"


@router.get("/dashboard/summary")
async def get_dashboard_summary(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Everything the authenticated dashboard renders. Derived from the user
    doc + recent test_attempts; no fixtures."""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    attempts = (
        await db.test_attempts.find(
            {"user_id": user_id}, {"_id": 0}
        )
        .sort("completed_at", -1)
        .to_list(200)
    )

    now = datetime.now(timezone.utc)
    today = now.date()

    # --- Per-skill band history (latest 5 attempts per skill, averaged) ---
    per_skill_bands: dict = {
        "listening": [],
        "reading": [],
        "writing": [],
        "speaking": [],
    }
    # Exclude failed/aborted sessions (band <= 2) so they don't drag the
    # per-skill averages down — same rule as /progress.
    for a in attempts:
        skill = _skill_from_test_type(a.get("test_type"))
        band = a.get("band_score") or 0
        if band > 2 and skill in per_skill_bands:
            per_skill_bands[skill].append(float(band))

    skill_bands: dict = {}
    for skill, bands in per_skill_bands.items():
        if not bands:
            skill_bands[skill] = {
                "band": None,
                "pctOfTarget": 0,
                "trend": "flat",
                "attempts": 0,
            }
            continue
        recent = bands[:5]
        avg = round(sum(recent) / len(recent), 1)
        trend = "flat"
        if len(recent) >= 2:
            first_half = recent[len(recent) // 2 :]
            second_half = recent[: len(recent) // 2]
            if sum(second_half) / len(second_half) > sum(first_half) / len(first_half) + 0.25:
                trend = "up"
            elif sum(second_half) / len(second_half) < sum(first_half) / len(first_half) - 0.25:
                trend = "down"
        target = float(user.get("target_band") or 0) or None
        pct = int(round(min(100.0, max(0.0, (avg / target) * 100)))) if target else 0
        skill_bands[skill] = {
            "band": avg,
            "pctOfTarget": pct,
            "trend": trend,
            "attempts": len(bands),
        }

    # --- Weakest skill (must have at least one attempt to be picked) ---
    attempted = {k: v for k, v in skill_bands.items() if v["band"] is not None}
    weakest_skill = None
    if attempted:
        weakest_skill = min(attempted.items(), key=lambda kv: kv[1]["band"])[0]
        # Flag it for the frontend
        skill_bands[weakest_skill]["isWeakest"] = True

    # --- Current band (average across genuine attempts; band <= 2 excluded) ---
    all_bands = [float(a["band_score"]) for a in attempts if (a.get("band_score") or 0) > 2]
    current_band = round(sum(all_bands) / len(all_bands), 1) if all_bands else None
    # Prefer the explicit user doc value if the onboarding flow captured one.
    if user.get("current_band") is not None:
        try:
            current_band = float(user["current_band"])
        except (TypeError, ValueError):
            pass

    target_band = user.get("target_band")
    try:
        target_band = float(target_band) if target_band is not None else None
    except (TypeError, ValueError):
        target_band = None

    # --- Streak: ISO dates of activity in the last 30 days ---
    activity_dates: set = set()
    for a in attempts:
        completed = a.get("completed_at")
        if not completed:
            continue
        if isinstance(completed, str):
            try:
                completed = datetime.fromisoformat(completed.replace("Z", "+00:00"))
            except ValueError:
                continue
        activity_dates.add(completed.date())
    streak_iso = [
        d.isoformat()
        for d in activity_dates
        if (today - d).days <= 30 and (today - d).days >= 0
    ]

    # --- Recent sessions (last 3) ---
    recent_sessions = []
    for a in attempts[:3]:
        completed = a.get("completed_at")
        if isinstance(completed, datetime):
            subtitle_dt = completed
        elif isinstance(completed, str):
            try:
                subtitle_dt = datetime.fromisoformat(completed.replace("Z", "+00:00"))
            except ValueError:
                subtitle_dt = None
        else:
            subtitle_dt = None
        if subtitle_dt:
            delta_days = (today - subtitle_dt.date()).days
            if delta_days == 0:
                subtitle = "Today"
            elif delta_days == 1:
                subtitle = "Yesterday"
            else:
                subtitle = subtitle_dt.strftime("%b %d")
        else:
            subtitle = ""
        recent_sessions.append(
            {
                "title": _session_title(a),
                "subtitle": subtitle,
                "band": a.get("band_score"),
                "attempt_id": a.get("id"),
            }
        )

    # --- Today's Task + Liz + Mock pick ---
    if weakest_skill:
        lib = SKILL_TASK_LIBRARY[weakest_skill]
        today_block = {
            **lib["today_task"],
            "skill": weakest_skill,
            "key": lib["today_task_key"],
        }
        liz_message = lib["liz_message"]
        mock_recommendation = {
            "label": lib["mock_recommendation"],
            "href": lib["mock_section_href"],
        }
    else:
        today_block = {
            **NEW_USER_TASK["today_task"],
            "skill": None,
            "key": NEW_USER_TASK["today_task_key"],
        }
        liz_message = NEW_USER_TASK["liz_message"]
        mock_recommendation = {
            "label": NEW_USER_TASK["mock_recommendation"],
            "href": NEW_USER_TASK["mock_section_href"],
        }

    # --- Weekly study time (Monday 00:00 UTC → now) ---
    # Source = study_time_intervals (heartbeat-tracked active time across the
    # whole site), not just test attempts. The dial used to read 0h 0m for
    # everyone because we only summed completed-test durations.
    week_start = datetime.combine(
        today - timedelta(days=today.weekday()), time.min, tzinfo=timezone.utc
    )
    week_seconds = 0
    async for row in db.study_time_intervals.aggregate(
        [
            {"$match": {"user_id": user_id, "ts": {"$gte": week_start, "$lte": now}}},
            {"$group": {"_id": None, "total": {"$sum": "$seconds"}}},
        ]
    ):
        week_seconds = int(row.get("total", 0))
    total_study_minutes_week = week_seconds // 60

    # --- Days to exam ---
    exam_date = user.get("exam_date")
    days_remaining = None
    if exam_date:
        try:
            exam_dt = datetime.fromisoformat(str(exam_date).replace("Z", "+00:00"))
            days_remaining = max(0, (exam_dt.date() - today).days)
        except ValueError:
            days_remaining = None

    return {
        "user": {
            "id": user.get("id"),
            "email": user.get("email"),
            "name": user.get("name"),
            "first_name": (user.get("name") or "").split(" ")[0] if user.get("name") else None,
            "plan": user.get("plan"),
            "exam_date": exam_date,
            "days_remaining": days_remaining,
        },
        "current_band": current_band,
        "target_band": target_band,
        "skill_bands": skill_bands,
        "weakest_skill": weakest_skill,
        "streak": streak_iso,
        "recent_sessions": recent_sessions,
        "total_study_minutes_week": total_study_minutes_week,
        "today_task": today_block,
        "liz_message": liz_message,
        "mock_recommendation": mock_recommendation,
        "has_history": bool(attempts),
        "generated_at": now.isoformat(),
    }
