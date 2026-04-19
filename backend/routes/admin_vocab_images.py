"""
Admin Vocabulary Image Management API
"""
import os
import uuid
import hashlib
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from pymongo import MongoClient
from PIL import Image
import io

router = APIRouter(prefix="/api/admin/vocab-images", tags=["admin-vocab-images"])

client = MongoClient(os.environ.get("MONGO_URL"))
db = client[os.environ.get("DB_NAME", "ielts_database")]

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from security_utils import require_admin_email, validate_upload_filename

VOCAB_DIR = "/app/backend/static/vocab_images"

def check_admin(email: str):
    require_admin_email(email)


@router.get("/lessons")
async def get_lessons_with_vocab(admin_email: str = Query(...)):
    """Get all lessons grouped by stage/unit with vocabulary word counts."""
    check_admin(admin_email)
    
    stages = list(db.unified_stages.find({}, {"_id": 0}).sort("number", 1))
    units = list(db.unified_units.find({}, {"_id": 0}))
    lessons = list(db.unified_lessons.find({}, {"_id": 0, "lesson_id": 1, "title": 1, "unit_id": 1, "activity_flow": 1}))
    
    unit_map = {}
    for u in units:
        u["lessons"] = []
        unit_map[u["unit_id"]] = u
    
    for lesson in lessons:
        # Count vocab words and images
        vocab_words = []
        for act in lesson.get("activity_flow", []):
            if act.get("type") == "vocabulary":
                for w in act.get("data", {}).get("words", []):
                    if isinstance(w, dict):
                        vocab_words.append({
                            "word": w.get("word", ""),
                            "image_url": w.get("image_url"),
                            "emoji": w.get("emoji", ""),
                            "definition": w.get("definition", "")
                        })
        
        lesson_info = {
            "lesson_id": lesson["lesson_id"],
            "title": lesson["title"],
            "total_words": len(vocab_words),
            "words_with_images": sum(1 for w in vocab_words if w.get("image_url")),
        }
        
        uid = lesson.get("unit_id", "")
        if uid in unit_map:
            unit_map[uid]["lessons"].append(lesson_info)
    
    result = []
    for stage in stages:
        stage_units = []
        for u in units:
            if u.get("stage_id") == stage["stage_id"] and u.get("lessons"):
                stage_units.append({
                    "unit_id": u["unit_id"],
                    "title": u.get("title", ""),
                    "number": u.get("unit_number") or u.get("number") or u.get("unit_num", 0),
                    "lessons": u["lessons"]
                })
        if stage_units:
            result.append({
                "stage_id": stage["stage_id"],
                "name": stage.get("name", ""),
                "number": stage.get("number", 0),
                "units": sorted(stage_units, key=lambda x: x["number"])
            })
    
    return result


@router.get("/words/{lesson_id}")
async def get_lesson_words(lesson_id: str, admin_email: str = Query(...)):
    """Get all vocabulary words for a specific lesson with their images."""
    check_admin(admin_email)
    
    lesson = db.unified_lessons.find_one({"lesson_id": lesson_id}, {"_id": 0, "activity_flow": 1, "title": 1})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    words = []
    for act in lesson.get("activity_flow", []):
        if act.get("type") == "vocabulary":
            for w in act.get("data", {}).get("words", []):
                if isinstance(w, dict):
                    words.append({
                        "word": w.get("word", ""),
                        "image_url": w.get("image_url"),
                        "emoji": w.get("emoji", ""),
                        "definition": w.get("definition", ""),
                        "example": w.get("example", "")
                    })
    
    # Also get distractor words that appear in games for this lesson
    game_words = set()
    for act in lesson.get("activity_flow", []):
        for game in act.get("data", {}).get("games", []):
            for item in game.get("items", []):
                for d in item.get("distractors", []):
                    if isinstance(d, dict):
                        dw = d.get("word", "").lower().strip()
                        if dw and dw not in [w["word"].lower() for w in words]:
                            game_words.add((d.get("word", ""), d.get("image_url"), d.get("emoji", "")))
    
    distractors = [{"word": w, "image_url": img, "emoji": em, "definition": "", "is_distractor": True} for w, img, em in game_words]
    
    return {
        "lesson_id": lesson_id,
        "title": lesson.get("title", ""),
        "words": words,
        "distractors": distractors
    }


@router.post("/upload/{word}")
async def upload_word_image(
    word: str,
    admin_email: str = Query(...),
    file: UploadFile = File(...)
):
    """Upload a new image for a vocabulary word. Auto-resizes to 512x512."""
    check_admin(admin_email)
    
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    try:
        img = Image.open(io.BytesIO(contents))
        img = img.convert("RGBA")
        img = img.resize((512, 512), Image.LANCZOS)
        
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        buf.seek(0)
        img_bytes = buf.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")
    
    file_hash = hashlib.md5(img_bytes).hexdigest()
    filename = f"{file_hash}.png"
    filepath = os.path.join(VOCAB_DIR, filename)
    
    os.makedirs(VOCAB_DIR, exist_ok=True)
    with open(filepath, "wb") as f:
        f.write(img_bytes)
    
    image_url = f"/static/vocab_images/{filename}"
    
    # Update ALL occurrences of this word across all lessons
    word_lower = word.lower().strip()
    updated = 0
    
    for lesson in db.unified_lessons.find({}):
        changed = False
        for act in lesson.get("activity_flow", []):
            data = act.get("data", {})
            for w in data.get("words", []):
                if isinstance(w, dict) and w.get("word", "").lower().strip() == word_lower:
                    w["image_url"] = image_url
                    changed = True
                    updated += 1
            for game in data.get("games", []):
                for item in game.get("items", []):
                    if item.get("word", "").lower().strip() == word_lower:
                        item["image_url"] = image_url
                        changed = True
                        updated += 1
                    for d in item.get("distractors", []):
                        if isinstance(d, dict) and d.get("word", "").lower().strip() == word_lower:
                            d["image_url"] = image_url
                            changed = True
                            updated += 1
        if changed:
            db.unified_lessons.update_one({"_id": lesson["_id"]}, {"$set": {"activity_flow": lesson["activity_flow"]}})
    
    return {
        "success": True,
        "word": word,
        "image_url": image_url,
        "updated_references": updated
    }
