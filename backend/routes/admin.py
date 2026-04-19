"""
Admin Routes Module
===================
Extracted from server.py for deploy-readiness refactoring.
Handles: user management, course seeding, DB status, vocabulary image management.
"""
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from security_utils import is_admin_email

router = APIRouter(prefix="/api", tags=["admin"])

db = None
ROOT_DIR = Path(__file__).parent.parent


def set_db(database):
    global db
    db = database


@router.get("/admin/users")
async def admin_get_all_users(admin_email: str = None):
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    enriched_users = []
    for user in users:
        attempts = await db.test_attempts.find(
            {"user_id": user["id"]},
            {"_id": 0, "test_type": 1, "band_score": 1, "completed_at": 1}
        ).sort("completed_at", -1).to_list(100)
        total_tests = len(attempts)
        avg_band = sum(a.get("band_score", 0) for a in attempts) / total_tests if total_tests > 0 else 0
        enriched_users.append({
            **user,
            "total_tests": total_tests,
            "avg_band": round(avg_band, 1),
            "last_active": attempts[0].get("completed_at") if attempts else user.get("created_at"),
            "recent_tests": attempts[:5]
        })
    return enriched_users


@router.get("/admin/users/{user_id}")
async def admin_get_user_detail(user_id: str, admin_email: str = None):
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    attempts = await db.test_attempts.find({"user_id": user_id}, {"_id": 0}).sort("completed_at", -1).to_list(100)
    progress_by_type = {}
    for attempt in attempts:
        t_type = attempt.get("test_type", "unknown")
        if t_type not in progress_by_type:
            progress_by_type[t_type] = {"count": 0, "total_band": 0, "best_band": 0}
        progress_by_type[t_type]["count"] += 1
        progress_by_type[t_type]["total_band"] += attempt.get("band_score", 0)
        progress_by_type[t_type]["best_band"] = max(progress_by_type[t_type]["best_band"], attempt.get("band_score", 0))
    for t_type in progress_by_type:
        progress_by_type[t_type]["avg_band"] = round(
            progress_by_type[t_type]["total_band"] / progress_by_type[t_type]["count"], 1
        ) if progress_by_type[t_type]["count"] > 0 else 0
    return {"user": user, "test_attempts": attempts, "progress_by_type": progress_by_type, "total_tests": len(attempts)}


@router.put("/admin/users/{user_id}")
async def admin_update_user(user_id: str, admin_email: str = None, plan: str = None, exam_credits: int = None, add_credits: int = None):
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_fields = {}
    if plan:
        update_fields["plan"] = plan
    if exam_credits is not None:
        update_fields["examCredits"] = exam_credits
    if add_credits is not None:
        update_fields["examCredits"] = user.get("examCredits", 0) + add_credits
    if not update_fields:
        raise HTTPException(status_code=400, detail="Nothing to update")
    await db.users.update_one({"id": user_id}, {"$set": update_fields})
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return {"detail": "User updated", "user": updated_user}


@router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin_email: str = None):
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.test_attempts.delete_many({"user_id": user_id})
    await db.users.delete_one({"id": user_id})
    return {"detail": "User deleted", "email": user.get("email")}


@router.post("/admin/seed-advanced-mastery")
async def admin_seed_advanced_mastery(admin_email: str = None):
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        from seed_advanced_mastery import ADVANCED_MODULES
        current_count = await db.advanced_mastery_modules.count_documents({})
        if current_count != len(ADVANCED_MODULES):
            await db.advanced_mastery_modules.delete_many({})
            for module in ADVANCED_MODULES:
                await db.advanced_mastery_modules.update_one({"id": module["id"]}, {"$set": module}, upsert=True)
            new_count = await db.advanced_mastery_modules.count_documents({})
            return {"status": "success", "message": f"Seeded {new_count} Advanced Mastery modules", "previous_count": current_count, "new_count": new_count}
        else:
            return {"status": "already_seeded", "message": f"Database already has {current_count} modules", "count": current_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seed failed: {str(e)}")


@router.post("/admin/seed-mastery")
async def admin_seed_mastery(admin_email: str = None, force: bool = False):
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        from seed_mastery_course import MASTERY_MODULES
        current_count = await db.mastery_course_modules.count_documents({})
        if force or current_count != len(MASTERY_MODULES):
            await db.mastery_course_modules.delete_many({})
            for module in MASTERY_MODULES:
                await db.mastery_course_modules.update_one({"id": module["id"]}, {"$set": module}, upsert=True)
            new_count = await db.mastery_course_modules.count_documents({})
            return {"status": "success", "message": f"Seeded {new_count} Mastery modules", "previous_count": current_count, "new_count": new_count, "forced": force}
        else:
            return {"status": "already_seeded", "message": f"Database already has {current_count} modules", "count": current_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seed failed: {str(e)}")


@router.post("/admin/seed-beginner")
async def admin_seed_beginner(admin_email: str = None):
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        from seed_beginner_english import BEGINNER_LESSONS
        current_count = await db.beginner_english_lessons.count_documents({})
        if current_count != len(BEGINNER_LESSONS):
            await db.beginner_english_lessons.delete_many({})
            for lesson in BEGINNER_LESSONS:
                await db.beginner_english_lessons.update_one({"id": lesson["id"]}, {"$set": lesson}, upsert=True)
            new_count = await db.beginner_english_lessons.count_documents({})
            return {"status": "success", "message": f"Seeded {new_count} Beginner lessons", "previous_count": current_count, "new_count": new_count}
        else:
            return {"status": "already_seeded", "message": f"Database already has {current_count} lessons", "count": current_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seed failed: {str(e)}")


@router.post("/admin/seed-all-courses")
async def admin_seed_all_courses(admin_email: str = None, force: bool = False):
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    results = {}
    try:
        from seed_advanced_mastery import ADVANCED_MODULES
        if force:
            await db.advanced_mastery_modules.delete_many({})
        for module in ADVANCED_MODULES:
            await db.advanced_mastery_modules.update_one({"id": module["id"]}, {"$set": module}, upsert=True)
        results["advanced_mastery"] = await db.advanced_mastery_modules.count_documents({})
    except Exception as e:
        results["advanced_mastery_error"] = str(e)
    try:
        from seed_mastery_course import MASTERY_MODULES
        if force:
            await db.mastery_course_modules.delete_many({})
        for module in MASTERY_MODULES:
            await db.mastery_course_modules.update_one({"id": module["id"]}, {"$set": module}, upsert=True)
        results["mastery"] = await db.mastery_course_modules.count_documents({})
    except Exception as e:
        results["mastery_error"] = str(e)
    try:
        from seed_beginner_english import BEGINNER_LESSONS
        if force:
            await db.beginner_english_lessons.delete_many({})
        for lesson in BEGINNER_LESSONS:
            await db.beginner_english_lessons.update_one({"id": lesson["id"]}, {"$set": lesson}, upsert=True)
        results["beginner"] = await db.beginner_english_lessons.count_documents({})
    except Exception as e:
        results["beginner_error"] = str(e)
    return {"status": "success", "message": "All courses seeded", "forced": force, "results": results}


@router.get("/admin/db-status")
async def admin_db_status(admin_email: str = None):
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    return {
        "advanced_mastery_modules": await db.advanced_mastery_modules.count_documents({}),
        "mastery_modules": await db.mastery_course_modules.count_documents({}),
        "beginner_lessons": await db.beginner_english_lessons.count_documents({}),
        "users": await db.users.count_documents({}),
        "test_attempts": await db.test_attempts.count_documents({})
    }


@router.get("/admin/vocabulary-groups")
async def admin_get_vocabulary_groups(admin_email: str = None):
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    stages = await db.unified_stages.find({}, {"_id": 0}).sort("number", 1).to_list(10)
    result = []
    for stage in stages:
        stage_id = stage["stage_id"]
        units = await db.unified_units.find({"stage_id": stage_id}, {"_id": 0}).sort("unit_number", 1).to_list(20)
        stage_units = []
        for unit in units:
            unit_id = unit["unit_id"]
            lessons = await db.unified_lessons.find(
                {"unit_id": unit_id}, {"_id": 0, "lesson_id": 1, "title": 1, "number": 1, "activity_flow": 1}
            ).sort("number", 1).to_list(10)
            unit_lessons = []
            for lesson in lessons:
                words = []
                for act in lesson.get("activity_flow", []):
                    if act.get("type") == "vocabulary" and act.get("data", {}).get("words"):
                        for w in act["data"]["words"]:
                            words.append({
                                "word": w.get("word", ""), "definition": w.get("definition", ""),
                                "image_emoji": w.get("image_emoji", ""), "image_url": w.get("image_url", ""),
                            })
                if words:
                    unit_lessons.append({
                        "lesson_id": lesson["lesson_id"], "title": lesson.get("title", ""),
                        "number": lesson.get("number", 0), "words": words,
                        "word_count": len(words), "image_count": sum(1 for w in words if w.get("image_url"))
                    })
            if unit_lessons:
                stage_units.append({
                    "unit_id": unit_id, "title": unit.get("title", ""),
                    "number": unit.get("unit_number") or unit.get("number", 0),
                    "lessons": unit_lessons,
                    "total_words": sum(l["word_count"] for l in unit_lessons),
                    "total_images": sum(l["image_count"] for l in unit_lessons)
                })
        if stage_units:
            result.append({
                "stage_id": stage_id, "name": stage.get("name", ""), "number": stage.get("number", 0),
                "cefr_level": stage.get("cefr_level", ""), "color": stage.get("color", "#666"), "units": stage_units
            })
    return {"groups": result}


@router.post("/admin/vocabulary/update-image")
async def admin_update_vocab_image(
    admin_email: str = Form(...), lesson_id: str = Form(...),
    word: str = Form(...), file: UploadFile = File(None), image_url: str = Form(None)
):
    if not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    new_image_url = image_url
    if file and file.filename:
        ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "png"
        file_hash = hashlib.md5(f"{lesson_id}_{word}_{file.filename}".encode()).hexdigest()
        filename = f"{file_hash}.{ext}"
        save_path = ROOT_DIR / "static" / "vocab_images" / filename
        save_path.parent.mkdir(parents=True, exist_ok=True)
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)
        new_image_url = f"/static/vocab_images/{filename}"
    if not new_image_url:
        raise HTTPException(status_code=400, detail="No image file or URL provided")
    lesson = await db.unified_lessons.find_one({"lesson_id": lesson_id})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    updated = False
    activity_flow = lesson.get("activity_flow", [])
    for act in activity_flow:
        if act.get("type") == "vocabulary" and act.get("data", {}).get("words"):
            for w in act["data"]["words"]:
                if w.get("word", "").lower() == word.lower():
                    w["image_url"] = new_image_url
                    updated = True
    for act in activity_flow:
        if act.get("type") in ("micro_game_vocab",) and act.get("data"):
            for item in act["data"].get("items", []):
                if isinstance(item, dict):
                    for opt in item.get("options", []):
                        if isinstance(opt, dict) and opt.get("word", "").lower() == word.lower():
                            opt["image_url"] = new_image_url
    if not updated:
        raise HTTPException(status_code=404, detail=f"Word '{word}' not found in lesson {lesson_id}")
    await db.unified_lessons.update_one(
        {"lesson_id": lesson_id},
        {"$set": {"activity_flow": activity_flow, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "success", "word": word, "image_url": new_image_url}
