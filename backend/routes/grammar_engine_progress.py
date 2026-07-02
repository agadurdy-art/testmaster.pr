"""
Grammar Engine progress tracking — save/read per-stage progress and
score checkpoint quiz submissions with diagnostics.
Extracted from routes/grammar_engine.py (Faz 1 refactor, 2026-07-02).
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException
from pydantic import BaseModel

from routes.grammar_engine_core import router, get_cached

# Will be set via routes.grammar_engine_core.set_db (called from server.py)
db = None

# ═══════════════════════════════════════════
# PROGRESS TRACKING
# ═══════════════════════════════════════════

class GrammarProgressRequest(BaseModel):
    user_id: str
    module_id: str
    stage: str  # learn, practice, quiz, guided, free
    completed: bool = True
    score: Optional[int] = None
    diagnostics: Optional[dict] = None


@router.post("/progress")
async def save_grammar_progress(req: GrammarProgressRequest):
    """Save grammar engine progress"""
    key = f"{req.module_id}_{req.stage}"
    update_data = {
        "user_id": req.user_id,
        "module_id": req.module_id,
        "stage": req.stage,
        "completed": req.completed,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if req.score is not None:
        update_data["score"] = req.score
    if req.diagnostics:
        update_data["diagnostics"] = req.diagnostics

    await db.grammar_engine_progress.update_one(
        {"user_id": req.user_id, "key": key},
        {"$set": {**update_data, "key": key}},
        upsert=True,
    )
    return {"status": "saved"}


@router.get("/progress/{user_id}")
async def get_grammar_progress(user_id: str):
    """Get all grammar engine progress for a user"""
    progress = await db.grammar_engine_progress.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(length=500)
    return {"progress": progress}


# ═══════════════════════════════════════════
# QUIZ SUBMISSION
# ═══════════════════════════════════════════

class QuizSubmitRequest(BaseModel):
    user_id: str
    module_id: str
    answers: list  # [{question_id, answer}]
    time_taken_seconds: Optional[int] = None


@router.post("/{module_id}/quiz/submit")
async def submit_grammar_quiz(module_id: str, req: QuizSubmitRequest):
    """Submit quiz answers and get diagnostic results"""
    cached = await get_cached(module_id, "quiz")
    if not cached:
        raise HTTPException(status_code=404, detail="Quiz not found. Generate quiz first.")

    questions = cached.get("questions", [])
    q_map = {q["id"]: q for q in questions}

    correct = 0
    total = len(questions)
    results = []
    diagnostics = {"form": 0, "meaning": 0, "usage": 0, "recognition": 0, "form_total": 0, "meaning_total": 0, "usage_total": 0, "recognition_total": 0}

    for ans in req.answers:
        q = q_map.get(ans.get("question_id"))
        if not q:
            continue

        tests_area = q.get("tests", "form")
        diagnostics[f"{tests_area}_total"] = diagnostics.get(f"{tests_area}_total", 0) + 1

        is_correct = False
        q_type = q.get("type")

        if q_type in ["multiple_choice", "usage_choice"]:
            is_correct = ans.get("answer") == q.get("correct_index")
        elif q_type == "gap_fill":
            is_correct = str(ans.get("answer", "")).lower().strip() == str(q.get("correct", "")).lower().strip()
        elif q_type == "error_detection":
            is_correct = ans.get("answer") == q.get("has_error")

        if is_correct:
            correct += 1
            diagnostics[tests_area] = diagnostics.get(tests_area, 0) + 1

        results.append({
            "question_id": q["id"],
            "correct": is_correct,
            "explanation": q.get("explanation", ""),
            "user_answer": ans.get("answer"),
        })

    score = round((correct / total) * 100) if total > 0 else 0
    mastery = "mastered" if score >= 90 else "good" if score >= 70 else "needs_review" if score >= 50 else "retry"
    stars = 3 if score >= 90 else 2 if score >= 70 else 1 if score >= 50 else 0

    # Build diagnostic message
    weak_areas = []
    for area in ["form", "meaning", "usage", "recognition"]:
        t = diagnostics.get(f"{area}_total", 0)
        c = diagnostics.get(area, 0)
        if t > 0 and c / t < 0.7:
            weak_areas.append(area)

    diagnostic_msg = ""
    if not weak_areas:
        diagnostic_msg = "Excellent! You have a strong understanding of all aspects."
    else:
        diagnostic_msg = f"Focus on improving: {', '.join(weak_areas)}."

    result = {
        "score": score,
        "correct": correct,
        "total": total,
        "mastery": mastery,
        "stars": stars,
        "diagnostic_message": diagnostic_msg,
        "weak_areas": weak_areas,
        "diagnostics": diagnostics,
        "results": results,
    }

    # Save progress
    await save_grammar_progress(GrammarProgressRequest(
        user_id=req.user_id,
        module_id=module_id,
        stage="quiz",
        completed=True,
        score=score,
        diagnostics={"weak_areas": weak_areas, "mastery": mastery},
    ))

    return result

