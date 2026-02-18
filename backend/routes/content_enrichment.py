"""
AI Content Enrichment API Routes
Allows triggering content enrichment from the admin panel
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import asyncio
from datetime import datetime, timezone

router = APIRouter(prefix="/api/admin/content", tags=["Content Enrichment"])

# Track enrichment status
enrichment_status = {}


class EnrichmentRequest(BaseModel):
    unit_numbers: Optional[List[int]] = None  # If None, enrich all units
    

class EnrichmentStatus(BaseModel):
    status: str
    current_unit: Optional[int] = None
    current_lesson: Optional[str] = None
    completed_units: List[int] = []
    errors: List[str] = []
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


async def run_enrichment(unit_numbers: Optional[List[int]] = None):
    """Background task to run content enrichment"""
    from services.ai_content_enricher import AIContentEnricher
    
    global enrichment_status
    enrichment_status['status'] = 'running'
    enrichment_status['started_at'] = datetime.now(timezone.utc).isoformat()
    enrichment_status['completed_units'] = []
    enrichment_status['errors'] = []
    
    content_dir = "/app/backend/content"
    enriched_dir = "/app/backend/content/enriched"
    os.makedirs(enriched_dir, exist_ok=True)
    
    # Get list of unit files
    if unit_numbers:
        files = [f"{content_dir}/stage1_unit{str(u).zfill(2)}.json" for u in unit_numbers]
    else:
        import glob
        files = sorted(glob.glob(f"{content_dir}/stage1_unit*.json"))
    
    enricher = AIContentEnricher()
    
    for file_path in files:
        if not os.path.exists(file_path):
            enrichment_status['errors'].append(f"File not found: {file_path}")
            continue
        
        try:
            # Extract unit number from filename
            unit_num = int(os.path.basename(file_path).replace('stage1_unit', '').replace('.json', ''))
            enrichment_status['current_unit'] = unit_num
            
            with open(file_path, 'r') as f:
                unit_data = json.load(f)
            
            # Enrich each lesson in the unit
            for unit in unit_data.get('units', []):
                unit_context = {
                    'title': unit.get('title'),
                    'subtitle': unit.get('subtitle'),
                    'grammar_focus': unit.get('grammar_focus', []),
                    'phonics_focus': unit.get('phonics_focus', [])
                }
                
                enriched_lessons = []
                
                for lesson in unit.get('lessons', []):
                    enrichment_status['current_lesson'] = lesson.get('title')
                    try:
                        enriched_lesson = await enricher.enrich_lesson(lesson, unit_context)
                        enriched_lessons.append(enriched_lesson)
                    except Exception as e:
                        enrichment_status['errors'].append(f"Lesson {lesson.get('lesson_id')}: {str(e)}")
                        enriched_lessons.append(lesson)  # Keep original on error
                    
                    # Small delay to avoid rate limiting
                    await asyncio.sleep(1)
                
                unit['lessons'] = enriched_lessons
            
            # Mark as enriched
            unit_data['ai_enriched'] = True
            unit_data['enriched_at'] = datetime.now(timezone.utc).isoformat()
            
            # Save enriched content
            output_path = f"{enriched_dir}/stage1_unit{str(unit_num).zfill(2)}_enriched.json"
            with open(output_path, 'w') as f:
                json.dump(unit_data, f, indent=2, ensure_ascii=False)
            
            enrichment_status['completed_units'].append(unit_num)
            
        except Exception as e:
            enrichment_status['errors'].append(f"Unit {file_path}: {str(e)}")
    
    enrichment_status['status'] = 'completed'
    enrichment_status['completed_at'] = datetime.now(timezone.utc).isoformat()
    enrichment_status['current_unit'] = None
    enrichment_status['current_lesson'] = None


@router.post("/enrich")
async def start_enrichment(request: EnrichmentRequest, background_tasks: BackgroundTasks):
    """Start content enrichment process"""
    global enrichment_status
    
    if enrichment_status.get('status') == 'running':
        raise HTTPException(status_code=400, detail="Enrichment already in progress")
    
    background_tasks.add_task(run_enrichment, request.unit_numbers)
    
    return {
        "message": "Enrichment started",
        "units": request.unit_numbers or "all"
    }


@router.get("/enrich/status")
async def get_enrichment_status():
    """Get current enrichment status"""
    return EnrichmentStatus(**enrichment_status) if enrichment_status else EnrichmentStatus(status="idle")


@router.post("/seed-enriched")
async def seed_enriched_content(unit_numbers: Optional[List[int]] = None):
    """Seed the database with enriched content - NEW FORMAT"""
    from motor.motor_asyncio import AsyncIOMotorClient
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'ielts_ace')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    enriched_dir = "/app/backend/content/enriched"
    
    if not os.path.exists(enriched_dir):
        raise HTTPException(status_code=400, detail="No enriched content found. Run enrichment first.")
    
    # Get enriched files
    import glob
    if unit_numbers:
        files = [f"{enriched_dir}/stage1_unit{str(u).zfill(2)}_enriched.json" for u in unit_numbers]
    else:
        files = sorted(glob.glob(f"{enriched_dir}/stage1_unit*_enriched.json"))
    
    if not files:
        raise HTTPException(status_code=400, detail="No enriched content files found")
    
    seeded_count = 0
    TS = datetime.now(timezone.utc).isoformat()
    
    # Type mapping for activity_flow
    STEP_TO_ACTIVITY = {
        "warm_up": "retrieval_warmup",
        "vocabulary": "vocabulary",
        "vocab_games": "micro_game_vocab",
        "micro_reading": "micro_reading",
        "grammar_focus": "grammar_focus",
        "grammar_games": "micro_game_grammar",
        "listening": "listening_task",
        "production": "production",
        "exit_ticket": "exit_ticket",
    }
    
    for file_path in files:
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        for unit_data in data.get('units', []):
            unit_id = unit_data['unit_id']
            unit_num = unit_data['unit_num']
            
            # Update unit
            await db.unified_units.update_one(
                {"unit_id": unit_id},
                {"$set": {
                    "ai_enriched": True,
                    "enriched_at": TS
                }}
            )
            
            for lesson_data in unit_data.get('lessons', []):
                lesson_id = lesson_data['lesson_id']
                lesson_num = lesson_data['lesson_num']
                
                # Build activity_flow with enriched data embedded
                activity_flow = []
                for i, step in enumerate(lesson_data.get('steps', [])):
                    step_type = step.get('type')
                    activity_type = STEP_TO_ACTIVITY.get(step_type, step_type)
                    
                    activity = {
                        "order": i + 1,
                        "type": activity_type,
                        "activity_id": f"step_{i+1}",
                        "data": {}
                    }
                    
                    # Embed data based on step type
                    if step_type == "warm_up":
                        activity["data"] = {
                            "video_url": step.get("video_url", ""),
                            "instruction": step.get("instruction", ""),
                            "questions": [{
                                "question_text": step.get("question_text", ""),
                                "correct_answer": step.get("correct_answer", ""),
                                "options": step.get("options", []),
                                "image_emoji": step.get("image_emoji", ""),
                                "hint": step.get("hint", "")
                            }]
                        }
                    
                    elif step_type == "vocabulary":
                        activity["data"] = {
                            "items": step.get("items", [])
                        }
                    
                    elif step_type == "vocab_games":
                        activity["data"] = {
                            "games": step.get("games", [])
                        }
                    
                    elif step_type == "micro_reading":
                        # Enricher produces 'text', map to 'passage'
                        activity["data"] = {
                            "passage": step.get("text", "") or step.get("passage", ""),
                            "questions": step.get("questions", [])
                        }
                    
                    elif step_type == "grammar_focus":
                        # Enricher produces 'rule_pattern' and 'explanation'
                        activity["data"] = {
                            "rule": step.get("rule_pattern", "") or step.get("rule", ""),
                            "explanation": step.get("explanation", ""),
                            "examples": step.get("examples", []),
                            "exercises": step.get("exercises", [])
                        }
                    
                    elif step_type == "grammar_games":
                        activity["data"] = {
                            "games": step.get("games", [])
                        }
                    
                    elif step_type == "listening":
                        activity["data"] = {
                            "audio_text": step.get("audio_text", ""),
                            "questions": step.get("questions", [])
                        }
                    
                    elif step_type == "production":
                        activity["data"] = {
                            "task": step.get("task", ""),
                            "prompts": step.get("prompts", [])
                        }
                    
                    elif step_type == "exit_ticket":
                        activity["data"] = {
                            "questions": step.get("questions", [])
                        }
                    
                    activity_flow.append(activity)
                
                # Add auto_review
                activity_flow.append({
                    "order": len(activity_flow) + 1,
                    "type": "auto_review",
                    "activity_id": "auto_review",
                    "data": {}
                })
                
                # Update lesson with enriched activity_flow
                await db.unified_lessons.update_one(
                    {"lesson_id": lesson_id},
                    {"$set": {
                        "activity_flow": activity_flow,
                        "ai_enriched": True,
                        "enriched_at": TS
                    }}
                )
                
                seeded_count += 1
    
    client.close()
    
    return {
        "message": f"Seeded {seeded_count} enriched lessons with embedded data",
        "status": "success"
    }


@router.get("/preview/{unit_num}/{lesson_num}")
async def preview_enriched_lesson(unit_num: int, lesson_num: int):
    """Preview enriched content for a specific lesson"""
    enriched_file = f"/app/backend/content/enriched/stage1_unit{str(unit_num).zfill(2)}_enriched.json"
    
    if not os.path.exists(enriched_file):
        raise HTTPException(status_code=404, detail="Enriched content not found for this unit")
    
    with open(enriched_file, 'r') as f:
        data = json.load(f)
    
    for unit in data.get('units', []):
        for lesson in unit.get('lessons', []):
            if lesson.get('lesson_num') == lesson_num:
                return {
                    "unit": unit.get('title'),
                    "lesson": lesson
                }
    
    raise HTTPException(status_code=404, detail="Lesson not found")
