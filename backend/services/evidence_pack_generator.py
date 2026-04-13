"""
Evidence Pack Generator Service
================================
Generates QA Evidence Packs for human review.
Implements PDF vs UI comparison evidence.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import os

from schemas.visual_asset import (
    TestStatus, VisualValidator, get_required_visual_slots
)
from schemas.qa_workflow import (
    EvidencePack, ReadingEvidence, WritingEvidence, SpeakingEvidence,
    ListeningEvidence, PassageEvidence, QuestionGroupEvidence,
    WritingTask1Evidence, WritingTask2Evidence,
    SpeakingPart1Evidence, SpeakingPart2Evidence, SpeakingPart3Evidence,
    CueCardEvidence, ListeningSectionEvidence, PDFTraceability
)


class EvidencePackGenerator:
    """
    Generates complete QA Evidence Packs for tests.
    Evidence packs enable PDF vs UI comparison.
    """
    
    def __init__(self, base_path: str = "/app/backend/static"):
        self.base_path = base_path
    
    def generate(self, test_data: Dict[str, Any], book_id: str, test_num: str) -> EvidencePack:
        """
        Generate complete evidence pack for a test.
        """
        test_id = f"{book_id}_{test_num}"
        
        # Generate evidence for each section
        reading_evidence = self._generate_reading_evidence(test_data)
        writing_evidence = self._generate_writing_evidence(test_data)
        speaking_evidence = self._generate_speaking_evidence(test_data)
        listening_evidence = self._generate_listening_evidence(test_data)
        
        # PDF traceability
        pdf_traceability = self._generate_pdf_traceability(test_data, test_id)
        
        # Validation
        validation_errors, validation_warnings = self._validate_test(test_data)
        
        # Check visuals
        visual_slots = get_required_visual_slots(test_data)
        all_visuals_filled = all(slot.get('filled', False) for slot in visual_slots)
        
        # Check cue card
        cue_card_complete = speaking_evidence.part2.has_cue_card and \
                          speaking_evidence.part2.cue_card and \
                          speaking_evidence.part2.cue_card.is_complete
        
        # Determine status
        if validation_errors:
            status = TestStatus.FAILED_VALIDATION
        elif not all_visuals_filled:
            status = TestStatus.FAILED_VALIDATION
            validation_errors.append("FAILED_VALIDATION: Missing required visuals")
        elif not cue_card_complete:
            status = TestStatus.FAILED_VALIDATION
            validation_errors.append("FAILED_VALIDATION: Speaking Part 2 cue card incomplete")
        else:
            status = TestStatus.PENDING_QA
        
        return EvidencePack(
            test_id=test_id,
            book_id=book_id,
            test_number=test_num,
            reading=reading_evidence,
            writing=writing_evidence,
            speaking=speaking_evidence,
            listening=listening_evidence,
            pdf_traceability=pdf_traceability,
            validation_errors=validation_errors,
            validation_warnings=validation_warnings,
            all_visuals_filled=all_visuals_filled,
            cue_card_complete=cue_card_complete,
            status=status
        )
    
    def _generate_reading_evidence(self, test_data: Dict) -> ReadingEvidence:
        """Generate reading section evidence"""
        reading = test_data.get('sections', {}).get('reading', {})
        if not reading:
            reading = test_data.get('reading', {})
        
        passages = []
        passages_data = reading.get('passages', [])
        
        for p in passages_data:
            text = p.get('passage_text', p.get('text', ''))
            pid = p.get('passage_number', p.get('pid', 'P?'))
            passages.append(PassageEvidence(
                pid=str(pid),
                title=p.get('title', 'Unknown'),
                first_300_chars=text[:300] if text else '',
                last_300_chars=text[-300:] if text else '',
                total_char_count=len(text),
                has_headings=bool(p.get('headings') or p.get('paragraph_labels')),
                heading_count=len(p.get('headings', p.get('paragraph_labels', [])))
            ))
        
        # Question groups
        question_groups = []
        questions = reading.get('questions', [])
        
        # Group by type/range from passages
        for p in passages_data:
            p_questions = p.get('questions', [])
            for q_group in p_questions:
                q_range = q_group.get('number', '')
                q_type = q_group.get('type', 'unknown')
                
                # Get sample questions
                samples = []
                items = q_group.get('items', q_group.get('questions', q_group.get('statements', []))[:2])
                for item in items[:2]:
                    if isinstance(item, dict):
                        samples.append({
                            'number': item.get('number', '?'),
                            'text': item.get('text', item.get('statement', item.get('item', '')))[:100]
                        })
                
                question_groups.append(QuestionGroupEvidence(
                    question_range=str(q_range),
                    question_type=q_type,
                    sample_questions=samples,
                    count=len(items) if isinstance(items, list) else 0
                ))
        
        # Count total questions
        total_q = 0
        for p in passages_data:
            for q_group in p.get('questions', []):
                items = q_group.get('items', q_group.get('questions', q_group.get('statements', [])))
                if isinstance(items, list):
                    total_q += len(items)
        
        # Contiguous check (1-40)
        contiguous = total_q == 40
        
        return ReadingEvidence(
            total_questions=total_q,
            contiguous_check=contiguous,
            passages=passages,
            question_groups=question_groups
        )
    
    def _generate_writing_evidence(self, test_data: Dict) -> WritingEvidence:
        """Generate writing section evidence"""
        writing = test_data.get('sections', {}).get('writing', {})
        if not writing:
            writing = test_data.get('writing', {})
        
        tasks = writing.get('tasks', [])
        task1_data = tasks[0] if tasks else writing.get('task1', {})
        task2_data = tasks[1] if len(tasks) > 1 else writing.get('task2', {})
        
        # Task 1
        visual = task1_data.get('visual', {})
        task1 = WritingTask1Evidence(
            prompt_text=task1_data.get('prompt', '')[:500],
            prompt_length=len(task1_data.get('prompt', '')),
            has_visual=bool(visual.get('image_src') or visual.get('image_url')),
            visual_source=visual.get('source', 'unknown'),
            visual_kind=visual.get('type', task1_data.get('task_type', 'unknown')),
            visual_thumbnail_url=visual.get('image_src', visual.get('image_url')),
            visual_page_num=visual.get('page_num'),
            visual_bbox=visual.get('bbox')
        )
        
        # Task 2
        task2 = WritingTask2Evidence(
            prompt_text=task2_data.get('prompt', ''),
            prompt_length=len(task2_data.get('prompt', ''))
        )
        
        return WritingEvidence(task1=task1, task2=task2)
    
    def _generate_speaking_evidence(self, test_data: Dict) -> SpeakingEvidence:
        """Generate speaking section evidence"""
        speaking = test_data.get('sections', {}).get('speaking', {})
        if not speaking:
            speaking = test_data.get('speaking', {})
        
        parts = speaking.get('parts', [])
        
        # Part 1
        part1_data = next((p for p in parts if p.get('part_number') == 1), {})
        part1_questions = part1_data.get('questions', [])
        part1 = SpeakingPart1Evidence(
            question_count=len(part1_questions),
            audio_only=part1_data.get('audio_only', True),
            topic=part1_data.get('topic', part1_data.get('title')),
            sample_questions=[q if isinstance(q, str) else q.get('text', str(q)) for q in part1_questions[:3]],
            tts_status='pending'
        )
        
        # Part 2
        part2_data = next((p for p in parts if p.get('part_number') == 2), {})
        task_card = part2_data.get('task_card', part2_data.get('topic_card', {}))
        
        cue_card = None
        has_cue_card = bool(task_card)
        
        if task_card:
            topic = task_card.get('instruction', task_card.get('topic', ''))
            bullets = task_card.get('bullets', task_card.get('points', []))
            timing = task_card.get('timing_note', '')
            
            cue_card = CueCardEvidence(
                topic=topic,
                bullets=bullets,
                bullet_count=len(bullets),
                timing_note=timing or "You will have to talk about this topic for one to two minutes.",
                is_complete=bool(topic and len(bullets) >= 2)
            )
        
        part2 = SpeakingPart2Evidence(
            has_cue_card=has_cue_card,
            cue_card=cue_card
        )
        
        # Part 3
        part3_data = next((p for p in parts if p.get('part_number') == 3), {})
        part3_topics = part3_data.get('topics', [])
        part3_questions = []
        
        for topic in part3_topics:
            if isinstance(topic, dict):
                part3_questions.extend(topic.get('questions', []))
        
        if not part3_questions:
            part3_questions = part3_data.get('questions', [])
        
        part3 = SpeakingPart3Evidence(
            question_count=len(part3_questions),
            audio_only=part3_data.get('audio_only', True),
            topics=[t.get('topic', str(t)) if isinstance(t, dict) else str(t) for t in part3_topics[:3]],
            sample_questions=[q if isinstance(q, str) else q.get('text', str(q)) for q in part3_questions[:3]],
            tts_status='pending'
        )
        
        return SpeakingEvidence(part1=part1, part2=part2, part3=part3)
    
    def _generate_listening_evidence(self, test_data: Dict) -> ListeningEvidence:
        """Generate listening section evidence"""
        listening = test_data.get('sections', {}).get('listening', {})
        if not listening:
            listening = test_data.get('listening', {})
        
        sections = []
        parts = listening.get('parts', listening.get('sections', []))
        
        total_q = 0
        for idx, part in enumerate(parts):
            audio = part.get('audio_file', part.get('audio', {}).get('src', ''))
            questions = part.get('questions', [])
            
            # Check for maps
            has_map = any(q.get('type') == 'map_labeling' for q in questions)
            map_source = None
            if has_map:
                for q in questions:
                    if q.get('type') == 'map_labeling':
                        visual = q.get('visual', q.get('media', {}))
                        map_source = visual.get('source', 'unknown') if visual else None
                        break
            
            # Sample questions
            samples = []
            for q in questions[:2]:
                if isinstance(q, dict):
                    samples.append({
                        'number': q.get('number', '?'),
                        'type': q.get('type', 'unknown'),
                        'text': str(q.get('prompt', q.get('text', '')))[:100]
                    })
            
            sections.append(ListeningSectionEvidence(
                section_id=f"S{idx+1}",
                audio_src=audio,
                audio_exists=self._check_audio_exists(audio),
                question_count=len(questions),
                sample_questions=samples,
                has_answer_spans=any(q.get('answer_span') for q in questions),
                has_map=has_map,
                map_source=map_source
            ))
            
            total_q += len(questions)
        
        return ListeningEvidence(
            total_questions=total_q,
            sections=sections
        )
    
    def _generate_pdf_traceability(self, test_data: Dict, test_id: str) -> PDFTraceability:
        """Generate PDF traceability info"""
        visual_sources = []
        
        # Get required visual slots and their sources
        slots = get_required_visual_slots(test_data)
        for slot in slots:
            visual_sources.append({
                'slot_name': slot['slot_name'],
                'source': slot.get('source', 'unknown'),
                'filled': slot.get('filled', False),
                'image_src': slot.get('image_src', '')
            })
        
        return PDFTraceability(
            pdf_file_ref=test_data.get('pdf_source'),
            visual_sources=visual_sources
        )
    
    def _validate_test(self, test_data: Dict) -> tuple[List[str], List[str]]:
        """Run validation and return errors/warnings"""
        errors = []
        warnings = []
        
        # Visual validation
        visual_valid, visual_errors = VisualValidator.validate_test_visuals(test_data)
        errors.extend(visual_errors)
        
        # Speaking Part 2 cue card validation
        speaking = test_data.get('sections', {}).get('speaking', {})
        if not speaking:
            speaking = test_data.get('speaking', {})
        
        parts = speaking.get('parts', [])
        part2 = next((p for p in parts if p.get('part_number') == 2), {})
        task_card = part2.get('task_card', part2.get('topic_card', {}))
        
        if not task_card:
            errors.append("FAILED_VALIDATION: Speaking Part 2 missing cue card")
        else:
            topic = task_card.get('instruction', task_card.get('topic', ''))
            bullets = task_card.get('bullets', task_card.get('points', []))
            
            if not topic:
                errors.append("FAILED_VALIDATION: Speaking Part 2 cue card missing topic")
            if len(bullets) < 2:
                errors.append(f"FAILED_VALIDATION: Speaking Part 2 cue card must have at least 2 bullets (found {len(bullets)})")
        
        return errors, warnings
    
    def _check_audio_exists(self, audio_src: str) -> bool:
        """Check if audio file exists"""
        if not audio_src:
            return False
        
        if audio_src.startswith('http'):
            return True  # Assume external URLs exist
        
        # Convert API path to file path
        if audio_src.startswith('/api/audio/'):
            file_path = audio_src.replace('/api/audio/', f'{self.base_path}/audio/')
        else:
            file_path = os.path.join(self.base_path, audio_src.lstrip('/'))
        
        return os.path.exists(file_path)


# ============ EXPORTS ============

__all__ = ["EvidencePackGenerator"]
