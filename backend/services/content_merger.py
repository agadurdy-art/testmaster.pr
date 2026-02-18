"""
Content Merger Service
Merges original curriculum content with AI-enriched game content.

MERGE LOGIC:
- warm_up: FROM ENRICHER (3 questions)
- vocabulary: FROM ORIGINAL (4 words - don't change)
- vocab_games: FROM ENRICHER (3 game types × 10-12 items each)
- micro_reading: FROM ORIGINAL (keep author's text)
- grammar_focus: FROM ORIGINAL (keep author's rules)
- grammar_games: FROM ENRICHER (3 game types × 4-5 items each)
- listening: FROM ORIGINAL (keep author's audio)
- production: FROM ORIGINAL (keep author's prompt)
- exit_ticket: FROM ENRICHER (3-5 summary questions)
"""

import json
import os
from typing import Dict, List, Any
from datetime import datetime, timezone


class ContentMerger:
    """Merges original content with enriched game content"""
    
    # Fields to take from ENRICHER (AI-generated)
    ENRICHER_FIELDS = {'warm_up', 'vocab_games', 'grammar_games', 'exit_ticket'}
    
    # Fields to take from ORIGINAL (author-provided)
    ORIGINAL_FIELDS = {'vocabulary', 'micro_reading', 'grammar_focus', 'listening', 'production'}
    
    def merge_lesson(
        self, 
        original_lesson: Dict[str, Any], 
        enriched_lesson: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Merge original and enriched lesson content.
        
        Args:
            original_lesson: Author-provided lesson from /content/stage1_unitXX.json
            enriched_lesson: AI-enriched lesson from /content/enriched/stage1_unitXX_enriched.json
            
        Returns:
            Merged lesson with best of both sources
        """
        merged_steps = []
        
        # Get steps from both sources as dictionaries keyed by type
        original_steps = {s.get('type'): s for s in original_lesson.get('steps', [])}
        enriched_steps = {s.get('type'): s for s in enriched_lesson.get('steps', [])}
        
        # Define the step order
        STEP_ORDER = [
            'warm_up',
            'vocabulary', 
            'vocab_games',
            'micro_reading',
            'grammar_focus',
            'grammar_games', 
            'listening',
            'production',
            'exit_ticket'
        ]
        
        for i, step_type in enumerate(STEP_ORDER):
            step = None
            source = None
            
            if step_type in self.ENRICHER_FIELDS:
                # Take from enricher if available and has content
                enriched = enriched_steps.get(step_type)
                if enriched and self._has_content(enriched, step_type):
                    step = enriched
                    source = 'enricher'
                else:
                    # Fallback to original
                    step = original_steps.get(step_type)
                    source = 'original (fallback)'
            else:
                # Take from original
                step = original_steps.get(step_type)
                source = 'original'
            
            if step:
                step['step'] = i + 1
                merged_steps.append(step)
                print(f"  Step {i+1} ({step_type}): {source}")
        
        # Return merged lesson
        return {
            **original_lesson,
            'steps': merged_steps,
            'merged_at': datetime.now(timezone.utc).isoformat(),
            'merge_sources': {
                'original': list(self.ORIGINAL_FIELDS),
                'enricher': list(self.ENRICHER_FIELDS)
            }
        }
    
    def _has_content(self, step: Dict, step_type: str) -> bool:
        """Check if enriched step has actual content"""
        if step_type == 'warm_up':
            # Should have questions array with at least 2 items
            questions = step.get('questions', [])
            if not questions:
                # Check old format
                if step.get('question_text'):
                    return True
            return len(questions) >= 2
        
        elif step_type == 'vocab_games':
            # Should have games array with items
            games = step.get('games', [])
            if not games:
                return False
            total_items = sum(len(g.get('items', [])) for g in games)
            return total_items >= 6  # At least 6 exercises
        
        elif step_type == 'grammar_games':
            # Should have games array with items
            games = step.get('games', [])
            if not games:
                return False
            total_items = sum(len(g.get('items', [])) for g in games)
            return total_items >= 6  # At least 6 exercises
        
        elif step_type == 'exit_ticket':
            # Should have questions array with at least 2 items
            questions = step.get('questions', [])
            return len(questions) >= 2
        
        return True
    
    def merge_unit(
        self,
        original_unit_path: str,
        enriched_unit_path: str
    ) -> Dict[str, Any]:
        """
        Merge an entire unit's content.
        
        Args:
            original_unit_path: Path to original JSON (e.g., /app/backend/content/stage1_unit01.json)
            enriched_unit_path: Path to enriched JSON (e.g., /app/backend/content/enriched/stage1_unit01_enriched.json)
            
        Returns:
            Merged unit data
        """
        # Load original
        with open(original_unit_path, 'r') as f:
            original_data = json.load(f)
        
        # Load enriched
        if os.path.exists(enriched_unit_path):
            with open(enriched_unit_path, 'r') as f:
                enriched_data = json.load(f)
        else:
            print(f"Warning: Enriched file not found: {enriched_unit_path}")
            return original_data
        
        # Merge each unit's lessons
        merged_units = []
        for orig_unit in original_data.get('units', []):
            unit_id = orig_unit.get('unit_id')
            
            # Find matching enriched unit
            enrich_unit = next(
                (u for u in enriched_data.get('units', []) if u.get('unit_id') == unit_id),
                None
            )
            
            if not enrich_unit:
                print(f"Warning: No enriched data for unit {unit_id}")
                merged_units.append(orig_unit)
                continue
            
            # Merge lessons
            merged_lessons = []
            for orig_lesson in orig_unit.get('lessons', []):
                lesson_id = orig_lesson.get('lesson_id')
                
                # Find matching enriched lesson
                enrich_lesson = next(
                    (l for l in enrich_unit.get('lessons', []) if l.get('lesson_id') == lesson_id),
                    None
                )
                
                if enrich_lesson:
                    print(f"\nMerging lesson: {orig_lesson.get('title')}")
                    merged_lesson = self.merge_lesson(orig_lesson, enrich_lesson)
                    merged_lessons.append(merged_lesson)
                else:
                    print(f"Warning: No enriched data for lesson {lesson_id}")
                    merged_lessons.append(orig_lesson)
            
            merged_unit = {
                **orig_unit,
                'lessons': merged_lessons
            }
            merged_units.append(merged_unit)
        
        return {
            **original_data,
            'units': merged_units,
            'merged_at': datetime.now(timezone.utc).isoformat()
        }


def merge_all_units(output_dir: str = '/app/backend/content/merged'):
    """Merge all Stage 1 units and save to output directory"""
    
    merger = ContentMerger()
    
    os.makedirs(output_dir, exist_ok=True)
    
    for i in range(1, 13):  # Units 1-12
        unit_num = str(i).zfill(2)
        original_path = f'/app/backend/content/stage1_unit{unit_num}.json'
        enriched_path = f'/app/backend/content/enriched/stage1_unit{unit_num}_enriched.json'
        output_path = f'{output_dir}/stage1_unit{unit_num}_merged.json'
        
        if not os.path.exists(original_path):
            print(f"Skipping unit {i}: Original file not found")
            continue
        
        print(f"\n{'='*60}")
        print(f"Merging Unit {i}")
        print(f"{'='*60}")
        
        merged_data = merger.merge_unit(original_path, enriched_path)
        
        with open(output_path, 'w') as f:
            json.dump(merged_data, f, indent=2, ensure_ascii=False)
        
        print(f"Saved to: {output_path}")
    
    print(f"\n{'='*60}")
    print("MERGE COMPLETE")
    print(f"{'='*60}")


if __name__ == '__main__':
    merge_all_units()
