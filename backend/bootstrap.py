"""
Startup/shutdown bootstrap.
===========================
Single job: everything that runs at app startup — Mongo index creation and
the auto-seed pipeline (beginner/mastery/advanced modules, courses, unified
learning stages, A2 level, vocab-image restoration) — plus the shutdown hook.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
Call install(app, db, client) once from server.py (end of module).
"""

import asyncio
import logging
import os
from datetime import datetime, timezone
from pathlib import Path

db = None
client = None

logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent


def install(app, database, mongo_client):
    """Register the startup/shutdown handlers on the FastAPI app."""
    global db, client
    db = database
    client = mongo_client
    app.on_event("startup")(startup_event)
    app.on_event("shutdown")(shutdown_db_client)


async def seed_a2_level():
    """Seed A2 Pre-Intermediate level if missing"""
    try:
        a2_level = {
            "id": "level_a2",
            "level_code": "A2",
            "level_name": "A2 Pre-Intermediate",
            "level_order": 3,
            "description": "Build confidence with everyday conversations, travel, shopping, and describing experiences",
            "target_band_range": "4.0-4.5",
            "pathway": "cefr",
            "total_estimated_hours": 55,
            "units": [
                {
                    "id": "unit_a2_1",
                    "unit_number": 1,
                    "title": "Travel & Transport",
                    "description": "Learn to navigate travel situations and discuss journeys",
                    "learning_objectives": ["Book tickets and accommodation", "Ask for and give directions", "Describe travel experiences", "Use past simple for completed actions"],
                    "estimated_hours": 11,
                    "is_locked": True,
                    "lessons": [
                        {"id": "lesson_a2_1_1", "lesson_number": 1, "title": "At the Airport", "description": "Learn vocabulary for air travel", "duration_minutes": 45, "lesson_type": "vocabulary", "required_for_next": True, "content": {"vocabulary": ["check-in", "boarding pass", "gate", "departure", "arrival", "luggage", "passport", "flight", "delayed", "cancelled"], "grammar_focus": "Past Simple: I flew to London", "example_sentences": ["I checked in online yesterday.", "My flight was delayed by two hours.", "Where is gate 12?"], "exercises": []}},
                        {"id": "lesson_a2_1_2", "lesson_number": 2, "title": "Asking for Directions", "description": "Navigate cities and ask for help", "duration_minutes": 45, "lesson_type": "speaking", "required_for_next": True, "content": {"vocabulary": ["turn left", "turn right", "go straight", "next to", "opposite", "corner", "roundabout", "traffic lights"], "grammar_focus": "Imperatives and prepositions of place", "example_sentences": ["Excuse me, where is the train station?", "Go straight and turn left at the traffic lights.", "It's opposite the bank."], "exercises": []}}
                    ],
                    "unit_quiz": {"id": "quiz_a2_1", "title": "Unit 1 Quiz: Travel & Transport", "quiz_type": "unit_quiz", "duration_minutes": 20, "passing_score": 70, "questions": [{"id": "q1", "type": "multiple_choice", "question": "I ___ to Paris last summer.", "options": ["A) fly", "B) flew", "C) flying"], "correct_answer": "B"}]}
                },
                {
                    "id": "unit_a2_2",
                    "unit_number": 2,
                    "title": "Shopping & Services",
                    "description": "Handle shopping situations and describe products",
                    "learning_objectives": ["Ask about prices and compare products", "Describe clothes and items", "Make complaints politely", "Use comparatives and superlatives"],
                    "estimated_hours": 11,
                    "is_locked": True,
                    "lessons": [
                        {"id": "lesson_a2_2_1", "lesson_number": 1, "title": "In the Shop", "description": "Shopping vocabulary and phrases", "duration_minutes": 45, "lesson_type": "vocabulary", "required_for_next": True, "content": {"vocabulary": ["receipt", "refund", "exchange", "discount", "sale", "fitting room", "size", "price", "cash", "card"], "grammar_focus": "Comparatives: cheaper than, more expensive", "example_sentences": ["Can I try this on?", "Do you have this in a smaller size?", "This one is cheaper than that one."], "exercises": []}}
                    ],
                    "unit_quiz": {"id": "quiz_a2_2", "title": "Unit 2 Quiz: Shopping", "quiz_type": "unit_quiz", "duration_minutes": 15, "passing_score": 70, "questions": [{"id": "q1", "type": "multiple_choice", "question": "This jacket is ___ than that one.", "options": ["A) expensive", "B) more expensive", "C) most expensive"], "correct_answer": "B"}]}
                },
                {
                    "id": "unit_a2_3",
                    "unit_number": 3,
                    "title": "Health & Body",
                    "description": "Describe symptoms and visit the doctor",
                    "learning_objectives": ["Describe health problems", "Understand medical advice", "Talk about healthy habits", "Use should/shouldn't for advice"],
                    "estimated_hours": 11,
                    "is_locked": True,
                    "lessons": [
                        {"id": "lesson_a2_3_1", "lesson_number": 1, "title": "At the Doctor's", "description": "Medical vocabulary and expressions", "duration_minutes": 45, "lesson_type": "vocabulary", "required_for_next": True, "content": {"vocabulary": ["headache", "fever", "cough", "prescription", "medicine", "appointment", "symptom", "pain", "rest", "recover"], "grammar_focus": "Should/Shouldn't: You should rest", "example_sentences": ["I have a terrible headache.", "You should take this medicine twice a day.", "How long have you had this cough?"], "exercises": []}}
                    ],
                    "unit_quiz": {"id": "quiz_a2_3", "title": "Unit 3 Quiz: Health", "quiz_type": "unit_quiz", "duration_minutes": 15, "passing_score": 70, "questions": [{"id": "q1", "type": "multiple_choice", "question": "You ___ eat more vegetables.", "options": ["A) should", "B) shouldn't", "C) must to"], "correct_answer": "A"}]}
                }
            ],
            "exit_test": {
                "id": "exit_test_a2",
                "title": "A2 Exit Test",
                "description": "Complete assessment to unlock B1 level",
                "quiz_type": "exit_test",
                "duration_minutes": 45,
                "passing_score": 75,
                "target_band": 4.5,
                "questions": [
                    {"id": "q1", "type": "multiple_choice", "question": "We ___ to Italy last year.", "options": ["A) go", "B) went", "C) going"], "correct_answer": "B"},
                    {"id": "q2", "type": "multiple_choice", "question": "This hotel is ___ than the other one.", "options": ["A) comfortable", "B) more comfortable", "C) most comfortable"], "correct_answer": "B"},
                    {"id": "q3", "type": "multiple_choice", "question": "You ___ smoke in the hospital.", "options": ["A) should", "B) shouldn't", "C) must"], "correct_answer": "B"}
                ]
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert A2 level
        await db.learning_levels.insert_one(a2_level)
        
        # Update level orders for B1 and higher
        await db.learning_levels.update_one({"id": "level_b1"}, {"$set": {"level_order": 4}})
        await db.learning_levels.update_one({"id": "level_b2"}, {"$set": {"level_order": 5}})
        await db.learning_levels.update_one({"id": "level_ielts_7"}, {"$set": {"level_order": 6}})
        
        logger.info("✅ A2 level seeded successfully")
    except Exception as e:
        logger.error(f"Error seeding A2 level: {e}")


async def startup_event():
    """Seed vocab grammar lessons and beginner english lessons if they don't exist"""
    # Public essay-evaluation lead magnet — one-per-email uniqueness.
    # Safe to run on every startup (idempotent).
    try:
        await db.anonymous_evaluations.create_index("email", unique=True)
    except Exception as e:
        logger.warning(f"anonymous_evaluations index create failed: {e}")
    # Session tokens (audit F01/F03): fast unique lookup by hash + auto-expiry.
    try:
        await db.sessions.create_index("token_hash", unique=True)
        await db.sessions.create_index("expires_at")
    except Exception as e:
        logger.warning(f"sessions index create failed: {e}")
    # Writing evaluator idempotency cache — TTL + (scope, client_request_id)
    # unique. See services/writing_idempotency.py for rationale.
    try:
        from services import writing_idempotency
        await writing_idempotency.ensure_indexes(db)
    except Exception as e:
        logger.warning(f"writing_idempotency index create failed: {e}")
    try:
        # Seed beginner english lessons
        beginner_count = await db.beginner_english_lessons.count_documents({})
        if beginner_count == 0:
            logger.info("No beginner english lessons found, running seed...")
            import subprocess
            result = subprocess.run(["python", "seed_beginner_english.py"], cwd="/app/backend", capture_output=True, text=True)
            logger.info(f"Beginner seed output: {result.stdout}")
            if result.returncode != 0:
                logger.error(f"Beginner seed error: {result.stderr}")
        else:
            logger.info(f"Found {beginner_count} beginner english lessons in database")
        
        # Seed IELTS mastery course modules (Band 4.5-6.5) - FORCE RESEED on every startup
        mastery_count = await db.mastery_course_modules.count_documents({})
        logger.info(f"Found {mastery_count} mastery course modules, force reseeding...")
        from seed_mastery_course import MASTERY_MODULES
        await db.mastery_course_modules.delete_many({})
        if MASTERY_MODULES:
            await db.mastery_course_modules.insert_many(MASTERY_MODULES)
            logger.info(f"✅ Mastery course reseeded: {len(MASTERY_MODULES)} modules")
        
        # Seed Advanced IELTS mastery course modules (Band 6.0-9.0) - FORCE RESEED on every startup
        advanced_count = await db.advanced_mastery_modules.count_documents({})
        logger.info(f"Found {advanced_count} advanced mastery modules, force reseeding...")
        from seed_advanced_mastery import ADVANCED_MODULES
        await db.advanced_mastery_modules.delete_many({})
        if ADVANCED_MODULES:
            await db.advanced_mastery_modules.insert_many(ADVANCED_MODULES)
            logger.info(f"✅ Advanced mastery reseeded: {len(ADVANCED_MODULES)} modules")
        
        # ========== FULL DATABASE SYNC - HER STARTUP'TA TÜM VERİYİ SENKRONIZE ET ==========
        try:
            from full_sync import full_database_sync
            await full_database_sync(db)
        except Exception as e:
            logger.error(f"FULL SYNC FAILED: {e}")
            # Fallback: En azından kritik verileri sync et
            import subprocess
            subprocess.run(["python", "seed_data.py"], cwd="/app/backend", timeout=300)
        
        # Seed learning platform levels if not present
        learning_levels_count = await db.learning_levels.count_documents({})
        if learning_levels_count == 0:
            logger.info("No learning levels found, running seed...")
            import subprocess
            result = subprocess.run(["python", "seed_learning_platform.py"], cwd="/app/backend", capture_output=True, text=True)
            logger.info(f"Learning platform seed output: {result.stdout}")
            if result.returncode != 0:
                logger.error(f"Learning platform seed error: {result.stderr}")
            # Also add A2 level
            await seed_a2_level()
        else:
            logger.info(f"Found {learning_levels_count} learning levels in database")
            # Check if A2 exists, add if missing
            a2_exists = await db.learning_levels.find_one({"id": "level_a2"})
            if not a2_exists:
                logger.info("A2 level missing, adding...")
                await seed_a2_level()
        
        # ============ AUTO-SEED COURSES ON STARTUP ============
        await auto_seed_courses()
        
        # ============ AUTO-SEED UNIFIED LEARNING ON STARTUP ============
        await auto_seed_unified_learning()
            
    except Exception as e:
        logger.error(f"Startup seed error: {e}")


async def auto_seed_courses():
    """Automatically seed all course data if missing on startup"""
    try:
        logger.info("🔄 Checking course data...")
        
        # Check and seed Advanced Mastery (should be 20 modules)
        advanced_count = await db.advanced_mastery_modules.count_documents({})
        if advanced_count < 20:
            logger.info(f"⚠️ Advanced Mastery has {advanced_count} modules, expected 20. Seeding...")
            try:
                from seed_advanced_mastery import ADVANCED_MODULES
                await db.advanced_mastery_modules.delete_many({})
                for module in ADVANCED_MODULES:
                    await db.advanced_mastery_modules.update_one(
                        {"id": module["id"]}, {"$set": module}, upsert=True
                    )
                new_count = await db.advanced_mastery_modules.count_documents({})
                logger.info(f"✅ Advanced Mastery seeded: {new_count} modules")
            except Exception as e:
                logger.error(f"❌ Advanced Mastery seed error: {e}")
        else:
            logger.info(f"✅ Advanced Mastery OK: {advanced_count} modules")
        
        # Check and seed Mastery (should be 17 modules)
        mastery_count = await db.mastery_course_modules.count_documents({})
        if mastery_count < 17:
            logger.info(f"⚠️ Mastery has {mastery_count} modules, expected 17. Seeding...")
            try:
                from seed_mastery_course import MASTERY_MODULES
                await db.mastery_course_modules.delete_many({})
                for module in MASTERY_MODULES:
                    await db.mastery_course_modules.update_one(
                        {"id": module["id"]}, {"$set": module}, upsert=True
                    )
                new_count = await db.mastery_course_modules.count_documents({})
                logger.info(f"✅ Mastery seeded: {new_count} modules")
            except Exception as e:
                logger.error(f"❌ Mastery seed error: {e}")
        else:
            logger.info(f"✅ Mastery OK: {mastery_count} modules")
        
        # Check and seed Beginner WITH LISTENING (should be 14 lessons)
        beginner_count = await db.beginner_english_lessons.count_documents({})
        beginner_with_listening = await db.beginner_english_lessons.count_documents({"listening": {"$exists": True, "$ne": None}})
        
        if beginner_count < 14 or beginner_with_listening < 14:
            logger.info(f"⚠️ Beginner has {beginner_count} lessons ({beginner_with_listening} with listening), expected 14. Seeding...")
            try:
                from seed_beginner_english import BEGINNER_LESSONS
                await db.beginner_english_lessons.delete_many({})
                for lesson in BEGINNER_LESSONS:
                    await db.beginner_english_lessons.update_one(
                        {"id": lesson["id"]}, {"$set": lesson}, upsert=True
                    )
                new_count = await db.beginner_english_lessons.count_documents({})
                new_listening = await db.beginner_english_lessons.count_documents({"listening": {"$exists": True, "$ne": None}})
                logger.info(f"✅ Beginner seeded: {new_count} lessons ({new_listening} with listening)")
            except Exception as e:
                logger.error(f"❌ Beginner seed error: {e}")
        else:
            logger.info(f"✅ Beginner OK: {beginner_count} lessons ({beginner_with_listening} with listening)")
        
        logger.info("🎉 Course data check complete!")
        
    except Exception as e:
        logger.error(f"Auto-seed courses error: {e}")


async def auto_seed_unified_learning():
    """Auto-seed unified learning stages and content from JSON files on startup"""
    try:
        # Ensure admin accounts have full access
        from security_utils import DEFAULT_ADMIN_EMAILS
        for admin_email in DEFAULT_ADMIN_EMAILS:
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"plan": "master", "examCredits": 25, "verified": True, "email_verified": True}},
            )
        logger.info(f"✅ Admin accounts ensured: master plan + 25 credits")
        
        stages_count = await db.unified_stages.count_documents({})
        lessons_count = await db.unified_lessons.count_documents({})
        units_count = await db.unified_units.count_documents({})
        
        logger.info(f"🔄 Unified Learning: {stages_count} stages, {units_count} units, {lessons_count} lessons")
        
        # Seed stages metadata if missing
        if stages_count < 8:
            logger.info("⚠️ Stages missing, seeding all 8 stages...")
            from seed_unified_learning import ALL_STAGES
            for stage_data in ALL_STAGES:
                await db.unified_stages.update_one(
                    {"stage_id": stage_data["stage_id"]},
                    {"$set": stage_data},
                    upsert=True
                )
            new_count = await db.unified_stages.count_documents({})
            logger.info(f"✅ Seeded {new_count} stages")
        
        # Count content JSON files available
        import glob
        from pathlib import Path as _Path
        # Resolve relative to this file (backend/server.py) — works on both
        # Railway (service root = backend/) and local dev.
        content_dir = str(_Path(__file__).resolve().parent / "content")
        content_files = glob.glob(f"{content_dir}/stage*_unit*.json")
        expected_units = len(content_files)
        
        if expected_units > 0 and units_count < expected_units:
            logger.info(f"⚠️ Units ({units_count}) < expected ({expected_units}). Seeding content from JSON files...")
            from seed_content_v4 import seed_from_content
            await seed_from_content(target_db=db)
            final_units = await db.unified_units.count_documents({})
            final_lessons = await db.unified_lessons.count_documents({})
            logger.info(f"✅ Unified Learning seeded: {final_units} units, {final_lessons} lessons")
        else:
            logger.info(f"✅ Unified Learning OK: {units_count} units, {lessons_count} lessons")
        
        # Check if enriched content needs to be merged
        enriched_dir = f"{content_dir}/enriched"
        enriched_files = glob.glob(f"{enriched_dir}/stage*_unit*_enriched.json")
        if enriched_files:
            # Check if any lesson is missing the enrichment context field
            not_enriched = await db.unified_lessons.count_documents({"context": {"$exists": False}})
            needs_enrich = await db.unified_lessons.count_documents({"$or": [
                {"context": {"$exists": False}},
                {"context.enriched": {"$ne": True}}
            ]})
            if needs_enrich > 0:
                logger.info(f"⚠️ {needs_enrich} lessons not yet enriched. Running merge...")
                from routes.content_enrichment import merge_and_seed_content
                result = await merge_and_seed_content(stage="all")
                logger.info(f"✅ Merge complete: {result.get('message', 'done')}")
            else:
                logger.info(f"✅ All lessons already merged with enriched content")

            # Stage 3 (Movers) iterates quickly during launch; force-merge
            # Stage 3 on every boot so the live DB reflects the latest
            # enriched JSON. Once Stage 3 stabilises (~Unit 20 shipped) this
            # can drop back to needs_enrich-only.
            try:
                stage3_files = glob.glob(f"{enriched_dir}/stage3_unit*_enriched.json")
                if stage3_files:
                    from routes.content_enrichment import merge_and_seed_content
                    logger.info(f"⟳ Force-merging Stage 3 ({len(stage3_files)} files) on boot...")
                    result3 = await merge_and_seed_content(stage="stage3")
                    logger.info(f"✅ Stage 3 force-merge: {result3.get('message', 'done')}")
            except Exception as e3:
                logger.warning(f"Stage 3 force-merge failed (non-fatal): {e3}")
        
        # Always restore image mappings after seed/merge to ensure images are preserved
        await _restore_vocab_image_mappings()
        
    except Exception as e:
        logger.error(f"Auto-seed unified learning error: {e}")
        import traceback
        traceback.print_exc()


async def _restore_vocab_image_mappings():
    """Restore image_urls and enrichment data from mapping files"""
    import json as _json
    mapping_dir = "/app/tools"
    img_map_path = f"{mapping_dir}/image_mapping.json"
    gpt_map_path = f"{mapping_dir}/gpt_image_mapping.json"
    enrich_path = f"{mapping_dir}/vocab_enrichment.json"
    
    if not os.path.exists(img_map_path):
        return
    
    with open(img_map_path) as f:
        img_map = _json.load(f)
    gpt_map = {}
    if os.path.exists(gpt_map_path):
        with open(gpt_map_path) as f:
            gpt_map = _json.load(f)
    enrich = {}
    if os.path.exists(enrich_path):
        with open(enrich_path) as f:
            enrich = _json.load(f)
    
    all_images = {**img_map, **gpt_map}
    
    # Check if restoration is needed
    sample = await db.unified_lessons.find_one(
        {"activity_flow.type": "vocabulary", "activity_flow.data.words.image_url": {"$exists": True, "$ne": ""}},
        {"_id": 1}
    )
    if sample:
        logger.info("✅ Vocab images already present in DB")
        return
    
    updated = 0
    async for lesson_doc in db.unified_lessons.find({}, {"_id": 1, "activity_flow": 1}):
        af = lesson_doc.get("activity_flow", [])
        changed = False
        for act in af:
            if act.get("type") == "vocabulary" and act.get("data", {}).get("words"):
                for w in act["data"]["words"]:
                    word = w.get("word", "").lower().strip()
                    if not word:
                        continue
                    if not w.get("image_url", "").strip() and word in all_images:
                        w["image_url"] = all_images[word]
                        changed = True
                    if not w.get("definition", "").strip() and word in enrich and enrich[word].get("definition"):
                        w["definition"] = enrich[word]["definition"]
                        changed = True
                    if not w.get("example", "").strip() and word in enrich and enrich[word].get("example"):
                        w["example"] = enrich[word]["example"]
                        changed = True
        if changed:
            await db.unified_lessons.update_one({"_id": lesson_doc["_id"]}, {"$set": {"activity_flow": af}})
            updated += 1
    
    if updated > 0:
        logger.info(f"✅ Restored vocab images/enrichment for {updated} lessons")
    else:
        logger.info("✅ No vocab restoration needed")

async def shutdown_db_client():
    client.close()
