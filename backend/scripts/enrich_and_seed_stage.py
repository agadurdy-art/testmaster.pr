"""Enrich and seed Stage 2 unit content."""
import os, json, asyncio, sys
from dotenv import load_dotenv
load_dotenv()
sys.path.insert(0, '/app/backend')

from services.ai_content_enricher import AIContentEnricher
from services.content_merger import ContentMerger


async def enrich_and_seed_unit(stage: str, unit_num: int):
    unit_str = str(unit_num).zfill(2)
    original_path = f"/app/backend/content/{stage}_unit{unit_str}.json"
    enriched_path = f"/app/backend/content/enriched/{stage}_unit{unit_str}_enriched.json"

    if not os.path.exists(original_path):
        print(f"NOT FOUND: {original_path}")
        return

    with open(original_path, 'r') as f:
        original_data = json.load(f)

    enricher = AIContentEnricher()
    merger = ContentMerger()

    # Step 1: Enrich all lessons
    print(f"=== Enriching {stage} Unit {unit_num} ===")
    enriched_units = []
    for unit in original_data.get('units', []):
        enriched_lessons = []
        unit_context = {
            'title': unit.get('title'),
            'subtitle': unit.get('subtitle'),
            'grammar_focus': unit.get('grammar_focus', []),
            'phonics_focus': unit.get('phonics_focus', [])
        }
        for lesson in unit.get('lessons', []):
            lid = lesson.get('lesson_id')
            print(f"  Enriching: {lid}")
            chat = enricher._create_chat(f"enrich_{lid}")
            enriched_steps = []
            for step in lesson.get('steps', []):
                st = step.get('type')
                try:
                    if st == 'warm_up':
                        e = await enricher._enrich_warmup(chat, step, lesson, unit_context)
                        qs = e.get('questions', [])
                        print(f"    warm_up: {len(qs)} questions")
                        enriched_steps.append(e if len(qs) >= 2 else step)
                    elif st == 'exit_ticket':
                        e = await enricher._enrich_exit_ticket(chat, step, lesson, unit_context)
                        qs = e.get('questions', [])
                        print(f"    exit_ticket: {len(qs)} questions")
                        enriched_steps.append(e if len(qs) >= 2 else step)
                    elif st == 'listening':
                        e = await enricher._enrich_listening(chat, step, lesson, unit_context)
                        ok = all(q.get('options') and len(q['options']) >= 2 for q in e.get('questions', []))
                        print(f"    listening: {len(e.get('questions',[]))} qs, opts={ok}")
                        enriched_steps.append(e if ok else step)
                    elif st in ('micro_game_vocab', 'vocabulary'):
                        enriched_steps.append(step)
                        # Generate vocab games from vocabulary
                        if st == 'vocabulary':
                            vg = await enricher._enrich_vocab_game(chat, step, lesson, unit_context)
                            games = vg.get('games', [])
                            total_items = sum(len(g.get('items', [])) for g in games)
                            print(f"    vocab_games: {len(games)} games, {total_items} items")
                            if total_items >= 3:
                                enriched_steps.append(vg)
                    elif st == 'grammar_focus':
                        enriched_steps.append(step)
                        # Generate grammar games
                        gg = await enricher._enrich_grammar_game(chat, step, lesson, unit_context)
                        games = gg.get('games', [])
                        total_items = sum(len(g.get('items', [])) for g in games)
                        print(f"    grammar_games: {len(games)} games, {total_items} items")
                        if total_items >= 3:
                            enriched_steps.append(gg)
                    elif st == 'production':
                        e = await enricher._enrich_production(chat, step, lesson, unit_context)
                        prompts = e.get('prompts', [])
                        print(f"    production: {len(prompts)} prompts")
                        enriched_steps.append(e if len(prompts) >= 2 else step)
                    else:
                        enriched_steps.append(step)
                except Exception as e:
                    print(f"    {st} FAILED: {e}")
                    enriched_steps.append(step)
                await asyncio.sleep(0.3)

            enriched_lessons.append({**lesson, 'steps': enriched_steps})
        enriched_units.append({**unit, 'lessons': enriched_lessons})

    enriched_data = {**original_data, 'units': enriched_units}
    os.makedirs(os.path.dirname(enriched_path), exist_ok=True)
    with open(enriched_path, 'w') as f:
        json.dump(enriched_data, f, indent=2, ensure_ascii=False)
    print(f"  Saved enriched: {enriched_path}")

    # Step 2: Merge and seed to DB
    print(f"\n=== Merging and seeding ===")
    from motor.motor_asyncio import AsyncIOMotorClient
    from datetime import datetime, timezone

    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'ielts_ace')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    STEP_TO_ACTIVITY = {
        "warm_up": "retrieval_warmup", "vocabulary": "vocabulary",
        "vocabulary_review": "vocabulary", "vocab_games": "micro_game_vocab",
        "micro_game_vocab": "micro_game_vocab", "micro_reading": "micro_reading",
        "grammar_focus": "grammar_focus", "grammar_review": "grammar_focus",
        "grammar_games": "micro_game_grammar", "grammar_game": "micro_game_grammar",
        "listening": "listening_task", "production": "production", "exit_ticket": "exit_ticket",
    }

    def build_data(step):
        st = step.get('type')
        if st == 'warm_up':
            if step.get('questions') and len(step['questions']) > 0:
                qs = step['questions']
                for qi, q in enumerate(qs):
                    if not q.get('question_id'): q['question_id'] = f"warmup_q{qi+1}"
                return {"video_url": "", "instruction": "", "questions": qs}
            return {"video_url": "", "instruction": "", "questions": [{"question_id": "warmup_q1", "question_text": step.get("question_text", ""), "correct_answer": step.get("correct_answer", ""), "options": step.get("options", []), "image_emoji": step.get("image_emoji", ""), "hint": step.get("hint", "")}]}
        if st == 'vocabulary': return {"words": step.get("items", [])}
        if st == 'vocabulary_review':
            items = step.get("items", [])
            if items and isinstance(items[0], str):
                return {"words": [{"word": w, "ipa": "", "definition": "", "example": "", "image_emoji": ""} for w in items], "is_review": True}
            return {"words": items, "is_review": True}
        if st in ('vocab_games', 'micro_game_vocab'):
            if step.get("games"): return {"games": step.get("games", [])}
            return {"games": [], "question_text": step.get("question_text", ""), "correct_answer": step.get("correct_answer", ""), "options": step.get("options", [])}
        if st == 'micro_reading':
            p = step.get("text", "") or step.get("passage", "")
            return {"passage": p, "passage_text": p, "questions": step.get("questions", [])}
        if st == 'grammar_focus': return {"rule": step.get("rule_pattern", ""), "explanation": step.get("explanation", ""), "examples": step.get("examples", [])}
        if st == 'grammar_review': return {"rules": [{"pattern": p, "rule_text": p} for p in step.get("patterns", [])], "is_review": True}
        if st in ('grammar_games', 'grammar_game'):
            if step.get("games"): return {"games": step.get("games", [])}
            return {"games": [], "mode": step.get("mode", ""), "words": step.get("words", []), "correct_sentence": step.get("correct_sentence", "")}
        if st == 'listening': return {"audio_text": step.get("audio_text", ""), "transcript": step.get("audio_text", ""), "questions": step.get("questions", [])}
        if st == 'production': return {"prompt": step.get("prompt", ""), "expected_text": step.get("expected_text", ""), "example_response": step.get("expected_text", ""), "production_type": step.get("production_type", step.get("mode", "speaking")), "prompts": step.get("prompts", [])}
        if st == 'exit_ticket':
            if step.get('questions') and len(step['questions']) > 0:
                qs = step['questions']
                for qi, q in enumerate(qs):
                    if not q.get('question_id'): q['question_id'] = f"exit_q{qi+1}"
                return {"questions": qs}
            return {"questions": [{"question_id": "exit_q1", "question_text": step.get("question_text", ""), "correct_answer": step.get("correct_answer", ""), "options": step.get("options", [])}]}
        return {k: v for k, v in step.items() if k not in ('step', 'type')}

    TS = datetime.now(timezone.utc).isoformat()

    for enrich_unit in enriched_data.get('units', []):
        for orig_lesson in original_data['units'][0]['lessons']:
            lid = orig_lesson['lesson_id']
            enrich_lesson = next((l for l in enrich_unit['lessons'] if l['lesson_id'] == lid), None)
            if enrich_lesson:
                merged = merger.merge_lesson(orig_lesson, enrich_lesson)
            else:
                merged = orig_lesson

            activity_flow = []
            for i, step in enumerate(merged.get('steps', [])):
                st = step.get('type')
                at = STEP_TO_ACTIVITY.get(st, st)
                activity_flow.append({"order": i+1, "type": at, "activity_id": f"step_{i+1}", "data": build_data(step)})
            activity_flow.append({"order": len(activity_flow)+1, "type": "auto_review", "activity_id": "auto_review", "data": {}})

            await db.unified_lessons.update_one(
                {"lesson_id": lid},
                {"$set": {"activity_flow": activity_flow, "merged": True, "merged_at": TS}}
            )
            print(f"  Seeded: {lid} ({len(activity_flow)} activities)")

    client.close()
    print("Done!")


async def main():
    stage = sys.argv[1] if len(sys.argv) > 1 else "stage2"
    unit_num = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    await enrich_and_seed_unit(stage, unit_num)

if __name__ == "__main__":
    asyncio.run(main())
