"""
TESTMASTER: Content-Driven Seed V4
Reads author-provided content JSON files from /app/backend/content/
Each file = 1 unit with 4 lessons, each lesson has 9 steps.
"""
import asyncio
import json
import os
import glob
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

TS = datetime.now(timezone.utc).isoformat()

# Activity type mapping: author step type -> DB collection suffix & activity_flow type
STEP_TO_ACTIVITY = {
    "warm_up": "retrieval_warmup",
    "vocabulary": "vocabulary",
    "vocabulary_review": "vocabulary",
    "micro_game_vocab": "micro_game_vocab",
    "micro_reading": "micro_reading",
    "grammar_focus": "grammar_focus",
    "grammar_review": "grammar_focus",
    "grammar_game": "micro_game_grammar",
    "listening": "listening_task",
    "production": "production",
    "exit_ticket": "exit_ticket",
}


def build_activity_flow(steps):
    """Build the activity_flow array from lesson steps"""
    flow = []
    for i, step in enumerate(steps):
        activity_type = STEP_TO_ACTIVITY.get(step["type"], step["type"])
        flow.append({
            "order": i + 1,
            "type": activity_type,
            "activity_id": f"step_{i+1}"
        })
    # Add auto_review as step 10
    flow.append({"order": len(steps) + 1, "type": "auto_review", "activity_id": "auto_review"})
    return flow


def build_warmup(step, lesson_id, lesson_num, unit_num):
    """Build warmup activity document"""
    q = {
        "question_id": f"wq_{unit_num}_{lesson_num}_0",
        "question_text": step["question_text"],
        "correct_answer": step["correct_answer"],
        "options": step["options"],
        "question_type": "multiple_choice",
        "image_emoji": step.get("image_emoji", ""),
        "hint": step.get("hint", ""),
    }
    if step.get("video_url"):
        q["video_url"] = step["video_url"]
    return {
        "activity_id": f"warmup_{lesson_id}",
        "lesson_id": lesson_id,
        "questions": [q],
        "created_at": TS
    }


def build_vocabulary(step, lesson_id):
    """Build vocabulary activity document"""
    if step["type"] == "vocabulary_review":
        # Review just has word list references
        return {
            "activity_id": f"vocab_{lesson_id}",
            "lesson_id": lesson_id,
            "is_review": True,
            "review_words": step["items"],
            "words": [],
            "created_at": TS
        }
    words = []
    for w in step["items"]:
        words.append({
            "word": w["word"],
            "ipa": w.get("ipa", ""),
            "definition": w["definition"],
            "example_sentence": w["example"],
            "image_emoji": w.get("image_emoji", ""),
        })
    return {
        "activity_id": f"vocab_{lesson_id}",
        "lesson_id": lesson_id,
        "words": words,
        "created_at": TS
    }


def build_vocab_game(step, lesson_id, lesson_num, unit_num):
    """Build vocab game activity document"""
    return {
        "activity_id": f"game_vocab_{lesson_id}",
        "lesson_id": lesson_id,
        "type": "micro_game_vocab",
        "game_type": "match",
        "items": [{
            "question_text": step["question_text"],
            "correct_answer": step["correct_answer"],
            "options": step["options"],
        }],
        "scoring": {"perfect": 100, "good": 75, "pass": 50},
        "created_at": TS
    }


def build_reading(step, lesson_id):
    """Build micro reading activity document"""
    return {
        "activity_id": f"reading_{lesson_id}",
        "lesson_id": lesson_id,
        "title": step["title"],
        "text": step["text"],
        "questions": [{
            "question": q["question"],
            "answer": q["answer"],
            "options": q.get("options", []),
        } for q in step["questions"]],
        "created_at": TS
    }


def build_grammar(step, lesson_id):
    """Build grammar focus activity document"""
    if step["type"] == "grammar_review":
        return {
            "activity_id": f"grammar_{lesson_id}",
            "lesson_id": lesson_id,
            "is_review": True,
            "review_patterns": step["patterns"],
            "rules": [],
            "created_at": TS
        }
    return {
        "activity_id": f"grammar_{lesson_id}",
        "lesson_id": lesson_id,
        "rules": [{
            "pattern": step["rule_pattern"],
            "explanation": step["explanation"],
            "examples": step["examples"],
        }],
        "created_at": TS
    }


def build_grammar_game(step, lesson_id, lesson_num, unit_num):
    """Build grammar game activity document with specific mode"""
    mode = step.get("mode", "mixed")
    doc = {
        "activity_id": f"game_grammar_{lesson_id}",
        "lesson_id": lesson_id,
        "type": "micro_game_grammar",
        "game_type": mode,
        "items": [],
        "word_order_items": [],
        "fill_blank_items": [],
        "time_limit_seconds": 300,
        "scoring": {"perfect": 90, "good": 70, "pass": 50},
        "created_at": TS
    }
    if mode == "word_order":
        doc["word_order_items"] = [{
            "words": step["words"],
            "correct_sentence": step["correct_sentence"],
        }]
    elif mode == "fill_blank":
        doc["fill_blank_items"] = [{
            "sentence": step["sentence"],
            "correct_answer": step["correct_answer"],
            "options": step["options"],
            "hint": step.get("hint", ""),
        }]
    elif mode == "error_hunter":
        doc["items"] = [{
            "sentence": step["sentence"],
            "has_error": step.get("has_error", True),
            "correct_sentence": step.get("correct_sentence", step["sentence"]),
        }]
    return doc


def build_listening(step, lesson_id):
    """Build listening activity document"""
    return {
        "activity_id": f"listening_{lesson_id}",
        "lesson_id": lesson_id,
        "audio_text": step["audio_text"],
        "transcript": step.get("transcript", step["audio_text"]),
        "questions": [{
            "question": q["question"],
            "answer": q["answer"],
            "options": q.get("options", []),
        } for q in step["questions"]],
        "created_at": TS
    }


def build_production(step, lesson_id):
    """Build production (speaking/writing) activity document"""
    return {
        "activity_id": f"production_{lesson_id}",
        "lesson_id": lesson_id,
        "prompt": step["prompt"],
        "expected_text": step["expected_text"],
        "mode": step.get("mode", "speaking"),
        "created_at": TS
    }


def build_exit_ticket(step, lesson_id, lesson_num, unit_num):
    """Build exit ticket activity document"""
    return {
        "activity_id": f"exit_{lesson_id}",
        "lesson_id": lesson_id,
        "questions": [{
            "question_id": f"eq_{unit_num}_{lesson_num}_0",
            "question_text": step["question_text"],
            "correct_answer": step["correct_answer"],
            "options": step.get("options", []),
            "question_type": "multiple_choice" if step.get("options") else "fill_blank",
            "hint": step.get("hint", ""),
            "acceptable_answers": step.get("acceptable_answers", []),
        }],
        "time_limit_seconds": 120,
        "scoring": {"perfect": 100, "good": 75, "pass": 50},
        "created_at": TS
    }


# Builder dispatch
BUILDERS = {
    "warm_up": build_warmup,
    "vocabulary": build_vocabulary,
    "vocabulary_review": build_vocabulary,
    "micro_game_vocab": build_vocab_game,
    "micro_reading": build_reading,
    "grammar_focus": build_grammar,
    "grammar_review": build_grammar,
    "grammar_game": build_grammar_game,
    "listening": build_listening,
    "production": build_production,
    "exit_ticket": build_exit_ticket,
}

# DB collection mapping
COLLECTION_MAP = {
    "warm_up": "unified_warmup_activities",
    "vocabulary": "unified_vocabulary_activities",
    "vocabulary_review": "unified_vocabulary_activities",
    "micro_game_vocab": "unified_game_activities",
    "micro_reading": "unified_reading_activities",
    "grammar_focus": "unified_grammar_activities",
    "grammar_review": "unified_grammar_activities",
    "grammar_game": "unified_game_activities",
    "listening": "unified_listening_activities",
    "production": "unified_production_activities",
    "exit_ticket": "unified_exit_activities",
}


STAGE_FILE_TO_DB_ID = {
    "stage1": "stage_1",
    "stage2": "stage_2_starters",
    "stage3": "stage_3_movers",
    "stage4": "stage_4_flyers",
    "stage5": "stage_5_b1",
    "stage6": "stage_6_b2",
    "stage7": "stage_7_ielts_foundation",
    "stage8": "stage_8_ielts_mastery",
}


def get_stage_id_from_file(fpath):
    """Extract DB stage_id from content file path like stage2_unit01.json"""
    import re
    basename = os.path.basename(fpath)
    m = re.match(r'(stage\d+)_unit', basename)
    if m:
        return STAGE_FILE_TO_DB_ID.get(m.group(1), m.group(1))
    return None


async def seed_from_content(target_db=None):
    if target_db is not None:
        db = target_db
        client = None
    else:
        client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
        db = client[os.environ.get('DB_NAME', 'ielts_ace')]

    content_dir = "/app/backend/content"
    files = sorted(glob.glob(f"{content_dir}/stage*_unit*.json"))

    if not files:
        print("No content files found!")
        return

    print("=" * 60)
    print(f"SEEDING FROM AUTHORED CONTENT ({len(files)} files)")
    print("=" * 60)

    all_unit_ids = []
    all_lesson_ids = []

    for fpath in files:
        stage_id = get_stage_id_from_file(fpath)
        if not stage_id:
            print(f"WARNING: Cannot determine stage_id for {fpath}, skipping")
            continue

        with open(fpath) as f:
            data = json.load(f)

        for unit_data in data.get("units", []):
            unit_id = unit_data["unit_id"]
            unit_num = unit_data["unit_num"]
            all_unit_ids.append(unit_id)

            print(f"\n[{stage_id}] Unit {unit_num}: {unit_data['title']}")

            # Clear old data for this unit
            await db.unified_units.delete_many({"unit_id": unit_id})

            # Upsert unit
            await db.unified_units.update_one(
                {"unit_id": unit_id},
                {"$set": {
                    "unit_id": unit_id,
                    "stage_id": stage_id,
                    "unit_number": unit_num,
                    "number": unit_num,
                    "title": unit_data["title"],
                    "subtitle": unit_data.get("subtitle", ""),
                    "phonics_focus": unit_data.get("phonics_focus", []),
                    "grammar_focus": unit_data.get("grammar_focus", []),
                    "total_lessons": len(unit_data["lessons"]),
                    "created_at": TS
                }},
                upsert=True
            )

            for lesson_data in unit_data["lessons"]:
                lesson_id = lesson_data["lesson_id"]
                lesson_num = lesson_data["lesson_num"]
                all_lesson_ids.append(lesson_id)

                print(f"  L{lesson_num}: {lesson_data['title']}")

                # Clear old lesson activities
                await db.unified_lessons.delete_many({"lesson_id": lesson_id})
                for coll_name in set(COLLECTION_MAP.values()):
                    await db[coll_name].delete_many({"lesson_id": lesson_id})

                # Build activity flow
                activity_flow = build_activity_flow(lesson_data["steps"])

                # Collect all vocab words from this lesson for summary
                all_words = []
                all_rules = []
                for step in lesson_data["steps"]:
                    if step["type"] == "vocabulary" and "items" in step:
                        all_words.extend(step["items"])
                    if step["type"] == "grammar_focus":
                        all_rules.append({
                            "pattern": step.get("rule_pattern", ""),
                            "explanation": step.get("explanation", ""),
                        })

                # Upsert lesson
                await db.unified_lessons.update_one(
                    {"lesson_id": lesson_id},
                    {"$set": {
                        "lesson_id": lesson_id,
                        "unit_id": unit_id,
                        "stage_id": stage_id,
                        "number": lesson_num,
                        "title": lesson_data["title"],
                        "topic": lesson_data.get("topic", ""),
                        "is_review": lesson_data.get("is_review", False),
                        "activity_flow": activity_flow,
                        "estimated_duration_minutes": 25,
                        "points_reward": 50,
                        "extra_links": lesson_data.get("extra_links", []),
                        "summary_data": {
                            "words": [{"word": w["word"], "definition": w.get("definition", ""), "image_emoji": w.get("image_emoji", "")} for w in all_words],
                            "grammar_rules": all_rules,
                        },
                        "created_at": TS
                    }},
                    upsert=True
                )

                # Build and insert each step's activity
                for step in lesson_data["steps"]:
                    step_type = step["type"]
                    builder = BUILDERS.get(step_type)
                    collection = COLLECTION_MAP.get(step_type)

                    if not builder or not collection:
                        print(f"    WARNING: No builder for step type '{step_type}'")
                        continue

                    # Builders that need extra args
                    if step_type in ("warm_up", "micro_game_vocab", "grammar_game", "exit_ticket"):
                        doc = builder(step, lesson_id, lesson_num, unit_num)
                    else:
                        doc = builder(step, lesson_id)

                    await db[collection].insert_one(doc)

                print(f"    -> {len(lesson_data['steps'])} steps seeded")

    # Update stage metadata for all seeded stages
    seeded_stage_ids = set()
    for fpath in files:
        sid = get_stage_id_from_file(fpath)
        if sid:
            seeded_stage_ids.add(sid)

    for sid in seeded_stage_ids:
        unit_count = await db.unified_units.count_documents({"stage_id": sid})
        lesson_count = await db.unified_lessons.count_documents({"stage_id": sid})
        await db.unified_stages.update_one(
            {"stage_id": sid},
            {"$set": {
                "total_units": unit_count,
                "updated_at": TS
            }}
        )
        print(f"\n[{sid}] Updated: {unit_count} units, {lesson_count} lessons")

    total = await db.unified_lessons.count_documents({})
    print(f"\n{'='*60}")
    print(f"CONTENT SEED COMPLETE! {total} total lessons in database")
    print(f"{'='*60}")

    if client:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed_from_content())
