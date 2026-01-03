"""
Test Normalizer Service
=======================
Converts raw test data (from PDF extraction or legacy format) 
into the canonical TestPackage schema.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import re


class TestNormalizer:
    """
    NORMALIZATION LAYER
    ===================
    Transforms raw/legacy test data into canonical TestPackage format.
    Handles various input formats and key mismatches.
    """
    
    @staticmethod
    def normalize(raw: Dict[str, Any], book_id: str, test_id: str) -> Dict[str, Any]:
        """
        Main normalization entry point.
        Takes raw test data and returns canonical TestPackage dict.
        """
        normalized = {
            "test_id": f"{book_id}_{test_id}",
            "meta": TestNormalizer._normalize_meta(raw, book_id, test_id),
            "listening": TestNormalizer._normalize_listening(raw),
            "reading": TestNormalizer._normalize_reading(raw),
            "writing": TestNormalizer._normalize_writing(raw),
            "speaking": TestNormalizer._normalize_speaking(raw),
            "practice_index": {},
            "stats_snapshot": {}
        }
        
        # Generate practice index
        normalized["practice_index"] = TestNormalizer._generate_practice_index(normalized)
        
        return normalized
    
    @staticmethod
    def _normalize_meta(raw: Dict, book_id: str, test_id: str) -> Dict:
        """Normalize metadata"""
        book_map = {
            "ielts17": "Cambridge IELTS 17",
            "ielts18": "Cambridge IELTS 18",
            "ielts19": "Cambridge IELTS 19",
        }
        
        return {
            "book": raw.get("book", book_map.get(book_id, f"Cambridge {book_id.upper()}")),
            "test_number": raw.get("test_number", test_id.replace("test", "Test ")),
            "skill_set": "full",
            "created_at": datetime.utcnow().isoformat(),
            "status": "PENDING",
            "validation_errors": []
        }
    
    @staticmethod
    def _normalize_listening(raw: Dict) -> Dict:
        """Normalize listening section"""
        sections_data = raw.get("sections", {}).get("listening", {})
        parts = sections_data.get("parts", [])
        
        normalized_sections = []
        
        for i, part in enumerate(parts):
            section_id = f"S{i + 1}"
            
            # Normalize audio path
            audio_src = part.get("audio_file", "")
            if not audio_src:
                audio_src = f"/api/audio/cambridge/{raw.get('book_id', 'ielts17')}/{raw.get('test_id', 'test1')}_part{i+1}.mp3"
            
            # Normalize questions
            questions = []
            raw_questions = part.get("questions", [])
            
            # Handle different question formats
            if isinstance(raw_questions, list) and raw_questions:
                first_q = raw_questions[0]
                
                # Format 1: Direct question list
                if isinstance(first_q, dict) and "number" in first_q:
                    for q in raw_questions:
                        questions.append(TestNormalizer._normalize_listening_question(q, section_id))
                
                # Format 2: Question groups
                elif isinstance(first_q, dict) and "type" in first_q:
                    for q_group in raw_questions:
                        q_type = q_group.get("type", "note_completion")
                        
                        # Handle matching type with items
                        if "items" in q_group:
                            for item in q_group["items"]:
                                questions.append({
                                    "qid": f"L_{section_id}_{item.get('number', len(questions)+1)}",
                                    "number": item.get("number", len(questions)+1),
                                    "type": q_type,
                                    "prompt": item.get("item", item.get("text", "")),
                                    "options": q_group.get("options_box", {}).get("options", []),
                                    "answer": item.get("answer", ""),
                                    "answer_span": None
                                })
                        
                        # Handle multiple selection
                        elif q_group.get("select_count"):
                            q_range = q_group.get("number", "")
                            questions.append({
                                "qid": f"L_{section_id}_{q_range}",
                                "number": int(q_range.split("-")[0]) if "-" in str(q_range) else int(q_range) if q_range else len(questions)+1,
                                "type": "multiple_selection",
                                "prompt": q_group.get("question", ""),
                                "options": q_group.get("options", []),
                                "answer": q_group.get("answer", []),
                                "answer_span": None
                            })
                        
                        # Handle single multiple choice
                        elif q_group.get("options"):
                            questions.append({
                                "qid": f"L_{section_id}_{q_group.get('number', len(questions)+1)}",
                                "number": q_group.get("number", len(questions)+1),
                                "type": "multiple_choice",
                                "prompt": q_group.get("question", ""),
                                "options": q_group.get("options", []),
                                "answer": q_group.get("answer", ""),
                                "answer_span": None
                            })
            
            # If no questions parsed, check for visual/notes format
            if not questions and part.get("visual"):
                visual = part.get("visual", {})
                for section_data in visual.get("sections", []):
                    for item in section_data.get("items", []):
                        # Extract question number from item text
                        match = re.search(r'___(\d+)___', item)
                        if match:
                            q_num = int(match.group(1))
                            questions.append({
                                "qid": f"L_{section_id}_{q_num}",
                                "number": q_num,
                                "type": "note_completion",
                                "prompt": item,
                                "answer": "",
                                "answer_span": None
                            })
            
            normalized_sections.append({
                "section_id": section_id,
                "title": part.get("title", f"Part {i+1}"),
                "transcript": part.get("transcript"),
                "audio": {"src": audio_src},
                "questions": questions
            })
        
        return {
            "sections": normalized_sections,
            "total_questions": 40
        }
    
    @staticmethod
    def _normalize_listening_question(q: Dict, section_id: str) -> Dict:
        """Normalize a single listening question"""
        return {
            "qid": f"L_{section_id}_{q.get('number', 0)}",
            "number": q.get("number", 0),
            "type": q.get("type", "note_completion"),
            "prompt": q.get("question", q.get("prompt", q.get("text", ""))),
            "options": q.get("options", []),
            "answer": q.get("answer", q.get("correct_answer", "")),
            "explanation": q.get("explanation"),
            "media": {"image_src": q.get("image")} if q.get("image") else None,
            "answer_span": None
        }
    
    @staticmethod
    def _normalize_reading(raw: Dict) -> Dict:
        """Normalize reading section"""
        reading_data = raw.get("sections", {}).get("reading", {})
        passages_raw = reading_data.get("passages", [])
        
        normalized_passages = []
        all_questions = []
        
        for i, passage in enumerate(passages_raw):
            pid = f"P{i + 1}"
            
            # Get passage text - handle various field names
            text = passage.get("passage_text", 
                   passage.get("text", 
                   passage.get("content", "")))
            
            # Handle paragraphs array format
            if not text and passage.get("paragraphs"):
                paragraphs = passage.get("paragraphs", [])
                text_parts = []
                for para in paragraphs:
                    letter = para.get("letter", "")
                    para_text = para.get("text", "")
                    if letter:
                        text_parts.append(f"{letter}\n{para_text}")
                    else:
                        text_parts.append(para_text)
                text = "\n\n".join(text_parts)
            
            # Extract headings if present
            headings = []
            if passage.get("paragraphs"):
                for para in passage.get("paragraphs", []):
                    if para.get("letter"):
                        headings.append(para.get("letter"))
            
            normalized_passages.append({
                "pid": pid,
                "title": passage.get("title", f"Passage {i+1}"),
                "text": text,
                "subtitle": passage.get("passage_intro", passage.get("subtitle")),
                "headings": headings if headings else None
            })
            
            # Normalize questions
            questions_raw = passage.get("questions", [])
            for q_group in questions_raw:
                q_type = q_group.get("type", "unknown")
                
                # Handle different question group formats
                if q_type in ["true_false_not_given", "tfng", "yes_no_not_given"]:
                    for stmt in q_group.get("statements", []):
                        all_questions.append({
                            "qid": f"R_{pid}_{stmt.get('number')}",
                            "number": stmt.get("number"),
                            "pid": pid,
                            "type": q_type,
                            "prompt": stmt.get("statement", ""),
                            "answer": stmt.get("answer", ""),
                            "passage_span": None
                        })
                
                elif q_type == "section_matching":
                    for item in q_group.get("items", []):
                        all_questions.append({
                            "qid": f"R_{pid}_{item.get('number')}",
                            "number": item.get("number"),
                            "pid": pid,
                            "type": q_type,
                            "prompt": item.get("item", ""),
                            "answer": item.get("answer", ""),
                            "passage_span": None
                        })
                
                elif q_type == "matching_features":
                    for item in q_group.get("items", q_group.get("statements", [])):
                        all_questions.append({
                            "qid": f"R_{pid}_{item.get('number')}",
                            "number": item.get("number"),
                            "pid": pid,
                            "type": q_type,
                            "prompt": item.get("item", item.get("statement", "")),
                            "options": q_group.get("features", []),
                            "answer": item.get("answer", ""),
                            "passage_span": None
                        })
                
                elif q_type in ["sentence_completion", "summary_completion"]:
                    for item in q_group.get("items", []):
                        all_questions.append({
                            "qid": f"R_{pid}_{item.get('number')}",
                            "number": item.get("number"),
                            "pid": pid,
                            "type": q_type,
                            "prompt": item.get("sentence", item.get("text", "")),
                            "answer": item.get("answer", ""),
                            "passage_span": None
                        })
                
                elif q_type in ["multiple_choice", "multiple_selection"]:
                    # Handle both single questions and items array
                    items = q_group.get("items", [q_group])
                    for item in items:
                        all_questions.append({
                            "qid": f"R_{pid}_{item.get('number')}",
                            "number": item.get("number"),
                            "pid": pid,
                            "type": q_type,
                            "prompt": item.get("question", ""),
                            "options": item.get("options", q_group.get("options", [])),
                            "answer": item.get("answer", ""),
                            "passage_span": None
                        })
                
                elif q_type == "note_completion":
                    # Handle visual-based note completion
                    visual = q_group.get("visual", {})
                    for section_data in visual.get("sections", []):
                        for item in section_data.get("items", []):
                            match = re.search(r'(\d+)________', item)
                            if match:
                                q_num = int(match.group(1))
                                all_questions.append({
                                    "qid": f"R_{pid}_{q_num}",
                                    "number": q_num,
                                    "pid": pid,
                                    "type": q_type,
                                    "prompt": item,
                                    "answer": "",
                                    "passage_span": None
                                })
        
        # Sort questions by number
        all_questions.sort(key=lambda x: x.get("number", 0))
        
        return {
            "passages": normalized_passages,
            "questions": all_questions,
            "total_questions": 40
        }
    
    @staticmethod
    def _normalize_writing(raw: Dict) -> Dict:
        """Normalize writing section"""
        writing_data = raw.get("sections", {}).get("writing", {})
        tasks = writing_data.get("tasks", [])
        
        task1 = {}
        task2 = {}
        
        for task in tasks:
            task_num = task.get("task_number", 0)
            
            if task_num == 1:
                visual = task.get("visual", {})
                task1 = {
                    "prompt": task.get("prompt", ""),
                    "visual": {
                        "type": visual.get("type", task.get("task_type", "unknown")),
                        "image_src": visual.get("image_url", visual.get("image_src", "")),
                        "description": visual.get("description", ""),
                        "data": visual.get("data")
                    },
                    "minimum_words": task.get("minimum_words", 150),
                    "time_recommendation": task.get("time_recommendation", "20 minutes")
                }
            
            elif task_num == 2:
                task2 = {
                    "prompt": task.get("prompt", ""),
                    "minimum_words": task.get("minimum_words", 250),
                    "time_recommendation": task.get("time_recommendation", "40 minutes")
                }
        
        return {
            "task1": task1,
            "task2": task2,
            "total_tasks": 2
        }
    
    @staticmethod
    def _normalize_speaking(raw: Dict) -> Dict:
        """Normalize speaking section"""
        speaking_data = raw.get("sections", {}).get("speaking", {})
        parts = speaking_data.get("parts", [])
        
        part1 = {"audio_only": True, "questions": []}
        part2 = {"cue_card": {"topic": "", "bullets": [], "timing_note": ""}}
        part3 = {"audio_only": True, "questions": []}
        
        for part in parts:
            part_num = part.get("part_number", 0)
            
            if part_num == 1:
                questions = []
                for i, q in enumerate(part.get("questions", [])):
                    q_text = q if isinstance(q, str) else q.get("text", q.get("question", ""))
                    questions.append({
                        "qid": f"S1_{i+1}",
                        "text": q_text,
                        "audio_url": None
                    })
                
                part1 = {
                    "audio_only": True,
                    "topic": part.get("topic"),
                    "questions": questions
                }
            
            elif part_num == 2:
                # Handle various cue card formats
                cue_card = part.get("cue_card", part.get("task_card", part.get("topic_card", {})))
                
                topic = cue_card.get("topic", cue_card.get("instruction", ""))
                bullets = cue_card.get("bullets", cue_card.get("points", []))
                timing = cue_card.get("timing_note", cue_card.get("final_prompt", 
                    "You will have to talk about this topic for one to two minutes."))
                
                part2 = {
                    "cue_card": {
                        "topic": topic,
                        "bullets": bullets,
                        "timing_note": timing
                    }
                }
            
            elif part_num == 3:
                questions = []
                
                # Handle topics array format
                if part.get("topics"):
                    for topic_group in part.get("topics", []):
                        for i, q in enumerate(topic_group.get("questions", [])):
                            q_text = q if isinstance(q, str) else q.get("text", q.get("question", ""))
                            questions.append({
                                "qid": f"S3_{len(questions)+1}",
                                "text": q_text,
                                "audio_url": None
                            })
                else:
                    for i, q in enumerate(part.get("questions", [])):
                        q_text = q if isinstance(q, str) else q.get("text", q.get("question", ""))
                        questions.append({
                            "qid": f"S3_{i+1}",
                            "text": q_text,
                            "audio_url": None
                        })
                
                part3 = {
                    "audio_only": True,
                    "topics": [t.get("topic") for t in part.get("topics", [])],
                    "questions": questions
                }
        
        return {
            "part1": part1,
            "part2": part2,
            "part3": part3,
            "total_parts": 3
        }
    
    @staticmethod
    def _generate_practice_index(normalized: Dict) -> Dict:
        """Generate practice index from normalized test"""
        listening_qids = []
        for section in normalized.get("listening", {}).get("sections", []):
            for q in section.get("questions", []):
                listening_qids.append(q.get("qid", ""))
        
        reading_qids = []
        for q in normalized.get("reading", {}).get("questions", []):
            reading_qids.append(q.get("qid", ""))
        
        writing = normalized.get("writing", {})
        speaking = normalized.get("speaking", {})
        
        return {
            "listening": listening_qids,
            "reading": reading_qids,
            "writing": {
                "task1": bool(writing.get("task1", {}).get("prompt")),
                "task2": bool(writing.get("task2", {}).get("prompt"))
            },
            "speaking": {
                "part1_count": len(speaking.get("part1", {}).get("questions", [])),
                "part2": bool(speaking.get("part2", {}).get("cue_card", {}).get("topic")),
                "part3_count": len(speaking.get("part3", {}).get("questions", []))
            }
        }


# ============ EXPORTS ============

__all__ = ["TestNormalizer"]
