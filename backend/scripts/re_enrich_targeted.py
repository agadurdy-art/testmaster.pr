"""
Targeted Re-Enrichment Script
Only enriches: warm_up (3-5 questions), exit_ticket (3-5 questions), 
listening (add options), reading (add more questions)
Preserves existing vocab_games and grammar_games enrichments.
"""

import os
import json
import asyncio
import sys
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, '/app/backend')

from services.ai_content_enricher import AIContentEnricher, extract_json_from_response


async def re_enrich_unit(unit_num: int, enricher: AIContentEnricher):
    """Re-enrich specific steps for a single unit"""
    unit_str = str(unit_num).zfill(2)
    original_path = f"/app/backend/content/stage1_unit{unit_str}.json"
    enriched_path = f"/app/backend/content/enriched/stage1_unit{unit_str}_enriched.json"
    
    with open(original_path, 'r') as f:
        original_data = json.load(f)
    
    with open(enriched_path, 'r') as f:
        enriched_data = json.load(f)
    
    updated = 0
    
    for orig_unit in original_data.get('units', []):
        unit_id = orig_unit.get('unit_id')
        unit_context = {
            'title': orig_unit.get('title'),
            'subtitle': orig_unit.get('subtitle'),
            'grammar_focus': orig_unit.get('grammar_focus', []),
            'phonics_focus': orig_unit.get('phonics_focus', [])
        }
        
        # Find matching enriched unit
        enrich_unit = next(
            (u for u in enriched_data.get('units', []) if u.get('unit_id') == unit_id),
            None
        )
        if not enrich_unit:
            continue
        
        for orig_lesson in orig_unit.get('lessons', []):
            lesson_id = orig_lesson.get('lesson_id')
            
            # Find matching enriched lesson
            enrich_lesson = next(
                (l for l in enrich_unit.get('lessons', []) if l.get('lesson_id') == lesson_id),
                None
            )
            if not enrich_lesson:
                continue
            
            print(f"  Re-enriching: {lesson_id} - {orig_lesson.get('title')}")
            
            chat = enricher._create_chat(f"reenrich_{lesson_id}")
            
            new_steps = []
            for i, step in enumerate(enrich_lesson.get('steps', [])):
                step_type = step.get('type')
                
                if step_type == 'warm_up':
                    try:
                        enriched = await enricher._enrich_warmup(chat, step, orig_lesson, unit_context)
                        if enriched.get('questions') and len(enriched['questions']) >= 2:
                            new_steps.append(enriched)
                            updated += 1
                            print(f"    warm_up: {len(enriched['questions'])} questions")
                        else:
                            new_steps.append(step)
                            print(f"    warm_up: FALLBACK (enrichment returned insufficient questions)")
                    except Exception as e:
                        print(f"    warm_up FAILED: {e}")
                        new_steps.append(step)
                    await asyncio.sleep(0.5)
                
                elif step_type == 'exit_ticket':
                    try:
                        enriched = await enricher._enrich_exit_ticket(chat, step, orig_lesson, unit_context)
                        if enriched.get('questions') and len(enriched['questions']) >= 2:
                            new_steps.append(enriched)
                            updated += 1
                            print(f"    exit_ticket: {len(enriched['questions'])} questions")
                        else:
                            new_steps.append(step)
                            print(f"    exit_ticket: FALLBACK (enrichment returned insufficient questions)")
                    except Exception as e:
                        print(f"    exit_ticket FAILED: {e}")
                        new_steps.append(step)
                    await asyncio.sleep(0.5)
                
                elif step_type == 'listening':
                    try:
                        enriched = await enricher._enrich_listening(chat, step, orig_lesson, unit_context)
                        # Verify questions have options
                        ok = True
                        for q in enriched.get('questions', []):
                            if not q.get('options') or len(q['options']) < 2:
                                ok = False
                        if ok and enriched.get('questions'):
                            new_steps.append(enriched)
                            updated += 1
                            print(f"    listening: {len(enriched['questions'])} questions with options")
                        else:
                            new_steps.append(step)
                            print(f"    listening: FALLBACK")
                    except Exception as e:
                        print(f"    listening FAILED: {e}")
                        new_steps.append(step)
                    await asyncio.sleep(0.5)
                
                elif step_type == 'micro_reading':
                    # Check if reading has enough questions
                    orig_step = next(
                        (s for s in orig_lesson.get('steps', []) if s.get('type') == 'micro_reading'),
                        step
                    )
                    if len(step.get('questions', [])) < 2:
                        try:
                            enriched = await enricher._enrich_reading(chat, orig_step, orig_lesson, unit_context)
                            if enriched.get('questions') and len(enriched['questions']) >= 2:
                                # Keep ORIGINAL text, only use enriched questions
                                enriched['text'] = orig_step.get('text', step.get('text', ''))
                                new_steps.append(enriched)
                                updated += 1
                                print(f"    micro_reading: {len(enriched['questions'])} questions (text preserved)")
                            else:
                                new_steps.append(step)
                                print(f"    micro_reading: FALLBACK")
                        except Exception as e:
                            print(f"    micro_reading FAILED: {e}")
                            new_steps.append(step)
                        await asyncio.sleep(0.5)
                    else:
                        new_steps.append(step)
                
                else:
                    # Keep existing enrichment (vocab_games, grammar_games, etc.)
                    new_steps.append(step)
            
            enrich_lesson['steps'] = new_steps
    
    # Save updated enriched data
    with open(enriched_path, 'w') as f:
        json.dump(enriched_data, f, indent=2, ensure_ascii=False)
    
    return updated


async def main():
    enricher = AIContentEnricher()
    total_updated = 0
    
    for unit_num in range(1, 13):
        print(f"\n=== Unit {unit_num} ===")
        try:
            count = await re_enrich_unit(unit_num, enricher)
            total_updated += count
            print(f"  Updated {count} steps")
        except Exception as e:
            print(f"  Unit {unit_num} FAILED: {e}")
    
    print(f"\n=== TOTAL: {total_updated} steps re-enriched ===")


if __name__ == "__main__":
    asyncio.run(main())
