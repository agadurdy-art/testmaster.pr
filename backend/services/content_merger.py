"""
Content Merger Service
Merges original curriculum content with AI-enriched game content.

STRATEGY:
- Preserve the original lesson's step ORDER and STRUCTURE
- Only swap in enriched content for game/quiz sections
- Never touch vocabulary, reading, grammar rules, listening, production from original

ENRICHABLE step mappings:
  original 'micro_game_vocab' / 'vocab_games' -> enriched 'vocab_games'
  original 'grammar_game' / 'grammar_games'   -> enriched 'grammar_games'
  original 'warm_up'                           -> enriched 'warm_up' (only if has questions array)
  original 'exit_ticket'                       -> enriched 'exit_ticket' (only if has questions array)
"""

import json
import os
from typing import Dict, Any
from datetime import datetime, timezone


# Mapping from original step type to enriched step type
ENRICH_MAP = {
    'micro_game_vocab': 'vocab_games',
    'vocab_games': 'vocab_games',
    'grammar_game': 'grammar_games',
    'grammar_games': 'grammar_games',
    'warm_up': 'warm_up',
    'exit_ticket': 'exit_ticket',
}


def _enriched_has_content(step: Dict, step_type: str) -> bool:
    """Check if enriched step has actual usable content"""
    if step_type in ('vocab_games', 'grammar_games'):
        games = step.get('games', [])
        total_items = sum(len(g.get('items', [])) for g in games)
        return total_items >= 4
    if step_type in ('warm_up', 'exit_ticket'):
        return len(step.get('questions', [])) >= 2
    return False


class ContentMerger:
    """Merges original content with enriched game content"""

    def merge_lesson(
        self,
        original_lesson: Dict[str, Any],
        enriched_lesson: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Merge by walking the ORIGINAL steps and selectively replacing with enriched data.
        """
        enriched_steps = {s.get('type'): s for s in enriched_lesson.get('steps', [])}
        merged_steps = []

        for i, orig_step in enumerate(original_lesson.get('steps', [])):
            step_type = orig_step.get('type')
            enriched_key = ENRICH_MAP.get(step_type)

            if enriched_key:
                enriched_step = enriched_steps.get(enriched_key)
                if enriched_step and _enriched_has_content(enriched_step, enriched_key):
                    # Use enriched version, keep type as the enriched key
                    merged_step = {**enriched_step, 'step': i + 1}
                    merged_steps.append(merged_step)
                    continue

            # Keep original
            merged_steps.append({**orig_step, 'step': i + 1})

        return {
            **original_lesson,
            'steps': merged_steps,
            'merged_at': datetime.now(timezone.utc).isoformat(),
        }

    def merge_unit(
        self,
        original_unit_path: str,
        enriched_unit_path: str
    ) -> Dict[str, Any]:
        """Merge an entire unit's content."""
        with open(original_unit_path, 'r') as f:
            original_data = json.load(f)

        if not os.path.exists(enriched_unit_path):
            return original_data

        with open(enriched_unit_path, 'r') as f:
            enriched_data = json.load(f)

        merged_units = []
        for orig_unit in original_data.get('units', []):
            unit_id = orig_unit.get('unit_id')
            enrich_unit = next(
                (u for u in enriched_data.get('units', []) if u.get('unit_id') == unit_id),
                None
            )
            if not enrich_unit:
                merged_units.append(orig_unit)
                continue

            merged_lessons = []
            for orig_lesson in orig_unit.get('lessons', []):
                lesson_id = orig_lesson.get('lesson_id')
                enrich_lesson = next(
                    (l for l in enrich_unit.get('lessons', []) if l.get('lesson_id') == lesson_id),
                    None
                )
                if enrich_lesson:
                    merged_lessons.append(self.merge_lesson(orig_lesson, enrich_lesson))
                else:
                    merged_lessons.append(orig_lesson)

            merged_units.append({**orig_unit, 'lessons': merged_lessons})

        return {
            **original_data,
            'units': merged_units,
            'merged_at': datetime.now(timezone.utc).isoformat()
        }
