"""
AI Content Enrichment API Routes
Allows triggering content enrichment from the admin panel
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from pathlib import Path
import os
import json
import asyncio
from datetime import datetime, timezone

router = APIRouter(prefix="/api/admin/content", tags=["Content Enrichment"])

# backend/routes/content_enrichment.py → parent.parent = backend/
# Works on both Railway (service root = backend/) and local repo layout.
_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_CONTENT_DIR = str(_BACKEND_ROOT / "content")
_ENRICHED_DIR = str(_BACKEND_ROOT / "content" / "enriched")

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
    
    content_dir = _CONTENT_DIR
    enriched_dir = _ENRICHED_DIR
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


@router.post("/merge-and-seed")
async def merge_and_seed_content(unit_numbers: Optional[List[int]] = None, stage: Optional[str] = "all"):
    """
    MERGE original content with enriched content and seed to database.
    
    Walks original lesson steps, selectively replaces game/quiz sections
    with enriched AI content, and saves merged activity_flow to DB.
    
    stage: "stage1", "stage2", or "all" (default)
    """
    from motor.motor_asyncio import AsyncIOMotorClient
    from services.content_merger import ContentMerger
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'ielts_ace')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    content_dir = _CONTENT_DIR
    enriched_dir = _ENRICHED_DIR
    
    if unit_numbers is None:
        unit_numbers = list(range(1, 21))  # cover Stage 3 U1-U20 too

    # Determine which stages to process. Stage 3+ enriched-only files now
    # live under backend/content/enriched/ as stage3_unitNN_enriched.json
    # — include them in the default "all" sweep so a fresh deploy seeds
    # Movers content automatically.
    stage_prefixes = []
    if stage == "all":
        stage_prefixes = ["stage1", "stage2", "stage3"]
    elif stage in ("stage1", "stage2", "stage3"):
        stage_prefixes = [stage]
    else:
        stage_prefixes = [stage]
    
    merger = ContentMerger()
    seeded_count = 0
    TS = datetime.now(timezone.utc).isoformat()

    # ── Pre-pass: build enrichment pools (vocab + grammar) from every
    # enriched file in scope. Review lessons reference earlier words/
    # patterns by string only; without this lookup their UI rows render
    # with empty ipa/definition/image_emoji.
    vocab_pool: Dict[str, Dict[str, Any]] = {}
    grammar_pool: Dict[str, Dict[str, Any]] = {}
    for sp in stage_prefixes:
        for un in unit_numbers:
            us = str(un).zfill(2)
            ep = f"{enriched_dir}/{sp}_unit{us}_enriched.json"
            if not os.path.exists(ep):
                continue
            with open(ep, 'r') as f:
                edata = json.load(f)
            for eunit in edata.get('units', []):
                for elesson in eunit.get('lessons', []):
                    for estep in elesson.get('steps', []):
                        if estep.get('type') == 'vocabulary':
                            for w in estep.get('items', []) or []:
                                if isinstance(w, dict) and w.get('word'):
                                    key = w['word'].strip().lower()
                                    if key and key not in vocab_pool:
                                        vocab_pool[key] = w
                        elif estep.get('type') == 'grammar_focus':
                            pat = estep.get('rule_pattern') or estep.get('rule') or ''
                            pat = pat.strip()
                            if pat and pat not in grammar_pool:
                                grammar_pool[pat] = {
                                    'pattern': pat,
                                    'rule_text': pat,
                                    'explanation': estep.get('explanation', ''),
                                    'examples': estep.get('examples', []),
                                }

    def _resolve_vocab(word: str) -> Dict[str, Any]:
        """Look up enriched word object by lowercase word; fallback to placeholder."""
        if not word:
            return {'word': '', 'ipa': '', 'definition': '', 'example': '', 'image_emoji': ''}
        hit = vocab_pool.get(word.strip().lower())
        if hit:
            return hit
        return {'word': word, 'ipa': '', 'definition': '', 'example': '', 'image_emoji': ''}

    # Map step types -> activity_flow types used by frontend
    STEP_TO_ACTIVITY = {
        "warm_up": "retrieval_warmup",
        "vocabulary": "vocabulary",
        "vocabulary_review": "vocabulary",
        "vocab_games": "micro_game_vocab",
        "micro_game_vocab": "micro_game_vocab",
        "micro_reading": "micro_reading",
        "grammar_focus": "grammar_focus",
        "grammar_review": "grammar_focus",
        "grammar_games": "micro_game_grammar",
        "grammar_game": "micro_game_grammar",
        "listening": "listening_task",
        "production": "production",
        "exit_ticket": "exit_ticket",
    }
    
    _STAGE_PREFIX_TO_ID = {
        "stage1": "stage_1",
        "stage2": "stage_2_starters",
        "stage3": "stage_3_movers",
        "stage4": "stage_4_flyers",
        "stage5": "stage_5_b1",
        "stage6": "stage_6_b2",
        "stage7": "stage_7_ielts_foundation",
        "stage8": "stage_8_ielts_mastery",
    }

    def _stage_id_from_prefix(prefix: str) -> str:
        return _STAGE_PREFIX_TO_ID.get(prefix, prefix)

    def build_activity_data(step):
        """Convert a content step into frontend-ready activity data dict"""
        step_type = step.get('type')
        
        if step_type == "warm_up":
            if step.get('questions') and len(step['questions']) > 0:
                qs = step['questions']
                for qi, q in enumerate(qs):
                    if not q.get('question_id'):
                        q['question_id'] = f"warmup_q{qi+1}"
                return {"video_url": step.get("video_url", ""), "instruction": step.get("instruction", ""), "questions": qs}
            return {
                "video_url": step.get("video_url", ""),
                "instruction": step.get("instruction", ""),
                "questions": [{
                    "question_id": "warmup_q1",
                    "question_text": step.get("question_text", ""),
                    "correct_answer": step.get("correct_answer", ""),
                    "options": step.get("options", []),
                    "image_emoji": step.get("image_emoji", ""),
                    "hint": step.get("hint", "")
                }]
            }
        
        if step_type == "vocabulary":
            return {"words": step.get("items", [])}
        
        if step_type == "vocabulary_review":
            # items may be plain strings or word objects. For strings, resolve
            # against the unit-wide enriched vocab pool so review rows show
            # ipa/definition/image from the lessons where each word was taught.
            items = step.get("items", [])
            words = []
            for it in items:
                if isinstance(it, str):
                    words.append(_resolve_vocab(it))
                elif isinstance(it, dict):
                    # Already an object — fill missing fields from pool if possible.
                    pool_hit = vocab_pool.get((it.get('word') or '').strip().lower())
                    if pool_hit:
                        words.append({**pool_hit, **{k: v for k, v in it.items() if v}})
                    else:
                        words.append(it)
            return {"words": words, "is_review": True, "review_words": [
                (w.get('word') if isinstance(w, dict) else w) for w in items
            ]}
        
        if step_type in ("vocab_games", "micro_game_vocab"):
            if step.get("games"):
                return {"games": step.get("games", [])}
            # Old single-question format
            return {"games": [], "question_text": step.get("question_text", ""), "correct_answer": step.get("correct_answer", ""), "options": step.get("options", [])}
        
        if step_type == "micro_reading":
            passage = step.get("text", "") or step.get("passage", "")
            return {"passage": passage, "passage_text": passage, "questions": step.get("questions", [])}
        
        if step_type == "grammar_focus":
            return {
                "rule": step.get("rule_pattern", "") or step.get("rule", ""),
                "explanation": step.get("explanation", ""),
                "examples": step.get("examples", [])
            }

        if step_type == "listening":
            return {
                "audio_text": step.get("audio_text", ""),
                "audio_url": step.get("audio_url", ""),
                "questions": step.get("questions", [])
            }
        
        if step_type == "grammar_review":
            patterns = step.get("patterns", []) or []
            rules = []
            for p in patterns:
                if isinstance(p, str):
                    hit = grammar_pool.get(p.strip())
                    rules.append(hit or {"pattern": p, "rule_text": p, "explanation": "", "examples": []})
                elif isinstance(p, dict):
                    rules.append(p)
            return {"rules": rules, "is_review": True}
        
        if step_type in ("grammar_games", "grammar_game"):
            # Normalize inner game items where Stage 3+ JSON uses Sonnet-style
            # field names but the existing renderers expect different keys.
            def _normalize_games(games):
                out = []
                for g in games or []:
                    if not isinstance(g, dict):
                        continue
                    gt = g.get("game_type")
                    items = g.get("items", []) or []
                    if gt == "error_hunter":
                        # ErrorHunter.js expects {sentence, errorWord, alternateErrors?}
                        items = [
                            {
                                **it,
                                "errorWord": it.get("errorWord") or it.get("wrong_word") or "",
                                "alternateErrors": it.get("alternateErrors", []),
                            }
                            for it in items if isinstance(it, dict)
                        ]
                    out.append({**g, "items": items})
                return out

            if step.get("games"):
                return {"games": _normalize_games(step.get("games", []))}
            # Stage 3+ single-game step uses mode + items at root.
            # Pass through so the GrammarGame mode router can delegate to the
            # right renderer (audio_match, transform_sentence, word_order, etc.).
            return {
                "games": [],
                "mode": step.get("mode", ""),
                "instruction": step.get("instruction", ""),
                "items": step.get("items", []),
                "time_limit_seconds": step.get("time_limit_seconds", 0),
                # Legacy single-sentence fields preserved for older formats
                "words": step.get("words", []),
                "correct_sentence": step.get("correct_sentence", ""),
            }
        
        if step_type == "listening":
            return {"audio_text": step.get("audio_text", ""), "transcript": step.get("audio_text", ""), "questions": step.get("questions", [])}
        
        if step_type == "production":
            return {
                "prompt": step.get("prompt", ""),
                "expected_text": step.get("expected_text", ""),
                "example_response": step.get("expected_text", ""),
                "production_type": step.get("mode", "speaking")
            }
        
        if step_type == "exit_ticket":
            if step.get('questions') and len(step['questions']) > 0:
                qs = []
                for qi, q in enumerate(step['questions']):
                    if not isinstance(q, dict):
                        continue
                    nq = dict(q)
                    if not nq.get('question_id'):
                        nq['question_id'] = f"exit_q{qi+1}"
                    # Frontend ExitTicket renderer reads `question_text`;
                    # Sonnet-produced JSON uses `question`. Normalize both ways.
                    if not nq.get('question_text') and nq.get('question'):
                        nq['question_text'] = nq['question']
                    qs.append(nq)
                return {"questions": qs}
            return {"questions": [{
                "question_id": "exit_q1",
                "question_text": step.get("question_text", ""),
                "correct_answer": step.get("correct_answer", ""),
                "options": step.get("options", [])
            }]}
        
        # Unknown step type - pass through all data
        return {k: v for k, v in step.items() if k not in ('step', 'type')}
    
    for stage_prefix in stage_prefixes:
      for unit_num in unit_numbers:
        unit_str = str(unit_num).zfill(2)
        original_path = f"{content_dir}/{stage_prefix}_unit{unit_str}.json"
        enriched_path = f"{enriched_dir}/{stage_prefix}_unit{unit_str}_enriched.json"

        # Stage 1+2 always have both original + enriched files.
        # Stage 3+ may ship enriched-only (the enriched JSON already contains
        # the full lesson; no separate "original" base is required).
        if not os.path.exists(original_path) and not os.path.exists(enriched_path):
            continue

        original_data = None
        if os.path.exists(original_path):
            with open(original_path, 'r') as f:
                original_data = json.load(f)

        enriched_data = None
        if os.path.exists(enriched_path):
            with open(enriched_path, 'r') as f:
                enriched_data = json.load(f)

        # If we have no original, use enriched as the base directly.
        if original_data is None and enriched_data is not None:
            for enrich_unit_only in enriched_data.get('units', []):
                unit_id = enrich_unit_only.get('unit_id')
                unit_num_val = enrich_unit_only.get('unit_num') or enrich_unit_only.get('unit_number')
                # Upsert full unit metadata — without this, late-added Stage 3+
                # units (e.g. U3, U4 after a deploy where DB only had U1+U2)
                # never get a unified_units doc and the stage page silently
                # caps at the older unit count. update_one without upsert=True
                # was a no-op for missing docs.
                await db.unified_units.update_one(
                    {"unit_id": unit_id},
                    {"$set": {
                        "unit_id": unit_id,
                        "stage_id": _stage_id_from_prefix(stage_prefix),
                        "unit_number": unit_num_val,
                        "number": unit_num_val,
                        "title": enrich_unit_only.get('title', ''),
                        "subtitle": enrich_unit_only.get('subtitle', ''),
                        "phonics_focus": enrich_unit_only.get('phonics_focus', ''),
                        "grammar_focus": enrich_unit_only.get('grammar_focus', ''),
                        "total_lessons": len(enrich_unit_only.get('lessons', [])),
                        "ai_enriched": True,
                        "enriched_at": TS,
                    }},
                    upsert=True,
                )
                for elesson in enrich_unit_only.get('lessons', []):
                    lesson_id = elesson.get('lesson_id')
                    activity_flow = []
                    for i, step in enumerate(elesson.get('steps', [])):
                        step_type = step.get('type')
                        activity_type = STEP_TO_ACTIVITY.get(step_type, step_type)
                        activity_flow.append({
                            "order": i + 1,
                            "type": activity_type,
                            "activity_id": f"step_{i+1}",
                            "data": build_activity_data(step)
                        })
                    activity_flow.append({
                        "order": len(activity_flow) + 1,
                        "type": "auto_review",
                        "activity_id": "auto_review",
                        "data": {}
                    })
                    # Upsert: create lesson doc if it doesn't exist yet (Stage 3+).
                    await db.unified_lessons.update_one(
                        {"lesson_id": lesson_id},
                        {"$set": {
                            "lesson_id": lesson_id,
                            "unit_id": unit_id,
                            "lesson_num": elesson.get('lesson_num'),
                            "title": elesson.get('title'),
                            "topic": elesson.get('topic'),
                            "activity_flow": activity_flow,
                            "merged": True,
                            "merged_at": TS,
                            "context": {"enriched": True, "enriched_at": TS}
                        }},
                        upsert=True
                    )
                    seeded_count += 1
            continue

        for orig_unit in original_data.get('units', []):
            unit_id = orig_unit.get('unit_id')

            enrich_unit = None
            if enriched_data:
                enrich_unit = next(
                    (u for u in enriched_data.get('units', []) if u.get('unit_id') == unit_id),
                    None
                )

            # Ensure unit doc exists in unified_units. seed_content_v4 only
            # runs at boot when file count > db count; for late-added units
            # (e.g. Stage 3 Unit 2 produced after first deploy) the merged
            # path is the only place that touches the DB, so we upsert
            # metadata here as well.
            unit_num_val = orig_unit.get('unit_num') or orig_unit.get('unit_number')
            await db.unified_units.update_one(
                {"unit_id": unit_id},
                {"$set": {
                    "unit_id": unit_id,
                    "stage_id": _stage_id_from_prefix(stage_prefix),
                    "unit_number": unit_num_val,
                    "number": unit_num_val,
                    "title": orig_unit.get('title', ''),
                    "subtitle": orig_unit.get('subtitle', ''),
                    "phonics_focus": orig_unit.get('phonics_focus', ''),
                    "grammar_focus": orig_unit.get('grammar_focus', ''),
                    "total_lessons": len(orig_unit.get('lessons', [])),
                    "ai_enriched": bool(enrich_unit),
                    "enriched_at": TS,
                }},
                upsert=True,
            )

            for orig_lesson in orig_unit.get('lessons', []):
                lesson_id = orig_lesson.get('lesson_id')

                enrich_lesson = None
                if enrich_unit:
                    enrich_lesson = next(
                        (l for l in enrich_unit.get('lessons', []) if l.get('lesson_id') == lesson_id),
                        None
                    )

                # Merge lessons (original base + enriched games)
                if enrich_lesson:
                    merged_lesson = merger.merge_lesson(orig_lesson, enrich_lesson)
                else:
                    merged_lesson = orig_lesson
                
                # Build activity_flow from merged steps
                activity_flow = []
                for i, step in enumerate(merged_lesson.get('steps', [])):
                    step_type = step.get('type')
                    activity_type = STEP_TO_ACTIVITY.get(step_type, step_type)
                    
                    activity_flow.append({
                        "order": i + 1,
                        "type": activity_type,
                        "activity_id": f"step_{i+1}",
                        "data": build_activity_data(step)
                    })
                
                # Add auto_review at end
                activity_flow.append({
                    "order": len(activity_flow) + 1,
                    "type": "auto_review",
                    "activity_id": "auto_review",
                    "data": {}
                })
                
                await db.unified_lessons.update_one(
                    {"lesson_id": lesson_id},
                    {"$set": {
                        "lesson_id": lesson_id,
                        "unit_id": unit_id,
                        "stage_id": _stage_id_from_prefix(stage_prefix),
                        "lesson_num": orig_lesson.get('lesson_num'),
                        "number": orig_lesson.get('lesson_num'),
                        "title": orig_lesson.get('title'),
                        "topic": orig_lesson.get('topic', ''),
                        "is_review": orig_lesson.get('is_review', False),
                        "activity_flow": activity_flow,
                        "merged": True,
                        "merged_at": TS,
                        "context": {"enriched": True, "enriched_at": TS}
                    }},
                    upsert=True,
                )
                seeded_count += 1
    
    client.close()
    
    return {
        "message": f"Merged and seeded {seeded_count} lessons",
        "status": "success"
    }


@router.post("/seed-enriched")
async def seed_enriched_content(unit_numbers: Optional[List[int]] = None):
    """Seed the database with enriched content - NEW FORMAT"""
    from motor.motor_asyncio import AsyncIOMotorClient
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'ielts_ace')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    enriched_dir = _ENRICHED_DIR

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
    enriched_file = f"{_ENRICHED_DIR}/stage1_unit{str(unit_num).zfill(2)}_enriched.json"
    
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
