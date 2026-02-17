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
    """Seed the database with enriched content"""
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
    
    # Import seed logic (reuse existing)
    from seed_content_v4 import (
        build_activity_flow, build_warmup, build_vocabulary, build_vocab_game,
        build_reading, build_grammar, build_grammar_game, build_listening,
        build_production, build_exit_ticket, COLLECTION_MAP, BUILDERS
    )
    
    TS = datetime.now(timezone.utc).isoformat()
    
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
                
                # Clear old activities
                for coll_name in set(COLLECTION_MAP.values()):
                    await db[coll_name].delete_many({"lesson_id": lesson_id})
                
                # Build and insert enriched activities
                activity_flow = build_activity_flow(lesson_data['steps'])
                
                # Update lesson
                await db.unified_lessons.update_one(
                    {"lesson_id": lesson_id},
                    {"$set": {
                        "activity_flow": activity_flow,
                        "ai_enriched": True,
                        "enriched_at": TS
                    }}
                )
                
                # Insert activities
                for step in lesson_data['steps']:
                    step_type = step['type']
                    builder = BUILDERS.get(step_type)
                    collection = COLLECTION_MAP.get(step_type)
                    
                    if builder and collection:
                        if step_type in ("warm_up", "micro_game_vocab", "grammar_game", "exit_ticket"):
                            doc = builder(step, lesson_id, lesson_num, unit_num)
                        else:
                            doc = builder(step, lesson_id)
                        
                        await db[collection].insert_one(doc)
                
                seeded_count += 1
    
    client.close()
    
    return {
        "message": f"Seeded {seeded_count} enriched lessons",
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
