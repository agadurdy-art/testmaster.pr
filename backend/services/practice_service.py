"""
Practice Service
================
Micro-based practice mode that pulls from canonical test data.
Single source of truth - no duplicate content.

HARD RULE: Only APPROVED/PUBLISHED tests feed into practice pools.
"""

from typing import Dict, Any, List, Optional
import random
import re


class PracticeService:
    """
    PRACTICE MODE SERVICE
    =====================
    Provides micro-based practice questions from ingested tests.
    - Reading: Shows only relevant paragraph for each question
    - Listening: Uses answer_span for short audio clips
    - Speaking: Part 1 & 3 audio-only, Part 2 visible cue card
    
    HARD RULE: Only draws from APPROVED/PUBLISHED tests.
    Never uses DRAFT/PENDING_QA/FAILED_VALIDATION tests.
    """
    
    # Import here to avoid circular imports
    _qa_service = None
    
    @classmethod
    def get_qa_service(cls):
        if cls._qa_service is None:
            try:
                from services.qa_workflow_service import QAWorkflowService
                cls._qa_service = QAWorkflowService()
            except ImportError:
                cls._qa_service = None
        return cls._qa_service
    
    def __init__(self, test_registry: Dict[str, Any]):
        """
        Initialize with test registry (CAMBRIDGE_TESTS or similar).
        """
        self.test_registry = test_registry
        self._practice_pool = None
        self._rebuild_pool()
    
    def _is_test_publishable(self, test_id: str) -> bool:
        """
        Check if a test is publishable (APPROVED or PUBLISHED).
        If QA service is not available, defaults to True for backwards compatibility.
        """
        qa_service = self.get_qa_service()
        if qa_service:
            return qa_service.is_publishable(test_id)
        # Fallback: allow all tests if QA service not available
        return True
    
    def _rebuild_pool(self):
        """Build practice pool from all valid AND PUBLISHABLE tests only"""
        self._practice_pool = {
            "listening": [],
            "reading": [],
            "writing": {"task1": [], "task2": []},
            "speaking": {"part1": [], "part2": [], "part3": []}
        }
        
        for book_id, book_data in self.test_registry.items():
            for test_id, test_data in book_data.get("tests", {}).items():
                if test_data is None:
                    continue
                
                source = f"{book_id}_{test_id}"
                
                # HARD RULE: Only include publishable tests
                if not self._is_test_publishable(source):
                    continue
                
                self._index_test(test_data, source)
    
    def _index_test(self, test_data: Dict, source: str):
        """Index a single test into the practice pool"""
        sections = test_data.get("sections", {})
        
        # Index listening
        listening = sections.get("listening", {})
        for part in listening.get("parts", []):
            part_num = part.get("part_number", 1)
            audio_file = part.get("audio_file", "")
            
            for q in self._extract_listening_questions(part):
                self._practice_pool["listening"].append({
                    "source": source,
                    "part": part_num,
                    "audio_file": audio_file,
                    "context": part.get("title", ""),
                    **q
                })
        
        # Index reading
        reading = sections.get("reading", {})
        passages = {p.get("passage_number", i+1): p for i, p in enumerate(reading.get("passages", []))}
        
        for q in self._extract_reading_questions(reading, passages):
            self._practice_pool["reading"].append({
                "source": source,
                **q
            })
        
        # Index writing
        writing = sections.get("writing", {})
        for task in writing.get("tasks", []):
            task_num = task.get("task_number", 0)
            if task_num == 1:
                self._practice_pool["writing"]["task1"].append({
                    "source": source,
                    "prompt": task.get("prompt", ""),
                    "visual": task.get("visual", {}),
                    "minimum_words": task.get("minimum_words", 150)
                })
            elif task_num == 2:
                self._practice_pool["writing"]["task2"].append({
                    "source": source,
                    "prompt": task.get("prompt", ""),
                    "minimum_words": task.get("minimum_words", 250)
                })
        
        # Index speaking
        speaking = sections.get("speaking", {})
        for part in speaking.get("parts", []):
            part_num = part.get("part_number", 0)
            
            if part_num == 1:
                for q in part.get("questions", []):
                    q_text = q if isinstance(q, str) else q.get("text", q.get("question", ""))
                    self._practice_pool["speaking"]["part1"].append({
                        "source": source,
                        "text": q_text,
                        "topic": part.get("topic", ""),
                        "audio_only": True
                    })
            
            elif part_num == 2:
                cue_card = part.get("cue_card", part.get("task_card", part.get("topic_card", {})))
                self._practice_pool["speaking"]["part2"].append({
                    "source": source,
                    "topic": cue_card.get("topic", cue_card.get("instruction", "")),
                    "bullets": cue_card.get("bullets", cue_card.get("points", [])),
                    "timing_note": cue_card.get("timing_note", cue_card.get("final_prompt", ""))
                })
            
            elif part_num == 3:
                # Handle topics array format
                if part.get("topics"):
                    for topic_group in part.get("topics", []):
                        for q in topic_group.get("questions", []):
                            q_text = q if isinstance(q, str) else q.get("text", "")
                            self._practice_pool["speaking"]["part3"].append({
                                "source": source,
                                "text": q_text,
                                "topic": topic_group.get("topic", ""),
                                "audio_only": True
                            })
                else:
                    for q in part.get("questions", []):
                        q_text = q if isinstance(q, str) else q.get("text", "")
                        self._practice_pool["speaking"]["part3"].append({
                            "source": source,
                            "text": q_text,
                            "audio_only": True
                        })
    
    def _extract_listening_questions(self, part: Dict) -> List[Dict]:
        """Extract listening questions from a part"""
        questions = []
        raw_questions = part.get("questions", [])
        
        for q in raw_questions:
            if isinstance(q, dict):
                q_type = q.get("type", "note_completion")
                
                # Handle question groups with items
                if "items" in q:
                    for item in q["items"]:
                        questions.append({
                            "qid": f"L_{item.get('number', len(questions)+1)}",
                            "number": item.get("number", len(questions)+1),
                            "type": q_type,
                            "prompt": item.get("item", ""),
                            "options": q.get("options_box", {}).get("options", q.get("options", [])),
                            "answer_span": None
                        })
                
                # Handle multiple selection
                elif q.get("select_count") or q_type == "multiple_selection":
                    questions.append({
                        "qid": f"L_{q.get('number', len(questions)+1)}",
                        "number": q.get("number", len(questions)+1),
                        "type": "multiple_selection",
                        "prompt": q.get("question", ""),
                        "options": q.get("options", []),
                        "select_count": q.get("select_count", 2),
                        "answer_span": None
                    })
                
                # Handle single question
                else:
                    questions.append({
                        "qid": f"L_{q.get('number', len(questions)+1)}",
                        "number": q.get("number", len(questions)+1),
                        "type": q_type,
                        "prompt": q.get("question", q.get("text", "")),
                        "options": q.get("options", []),
                        "answer_span": None
                    })
        
        return questions
    
    def _extract_reading_questions(self, reading: Dict, passages: Dict) -> List[Dict]:
        """Extract reading questions with micro context"""
        questions = []
        
        for passage in reading.get("passages", []):
            passage_num = passage.get("passage_number", 1)
            passage_text = passage.get("passage_text", passage.get("text", ""))
            passage_title = passage.get("title", "")
            
            for q_group in passage.get("questions", []):
                q_type = q_group.get("type", "unknown")
                
                if q_type in ["true_false_not_given", "tfng", "yes_no_not_given"]:
                    for stmt in q_group.get("statements", []):
                        micro_context = self._extract_micro_context(
                            passage_text, stmt.get("statement", "")
                        )
                        questions.append({
                            "qid": f"R_P{passage_num}_{stmt.get('number')}",
                            "number": stmt.get("number"),
                            "passage_num": passage_num,
                            "passage_title": passage_title,
                            "type": q_type,
                            "prompt": stmt.get("statement", ""),
                            "micro_context": micro_context,
                            "instruction": q_group.get("instruction", "")
                        })
                
                elif q_type == "section_matching":
                    for item in q_group.get("items", []):
                        # For section matching, show multiple paragraphs
                        micro_context = self._extract_section_matching_context(
                            passage_text, item.get("item", "")
                        )
                        questions.append({
                            "qid": f"R_P{passage_num}_{item.get('number')}",
                            "number": item.get("number"),
                            "passage_num": passage_num,
                            "passage_title": passage_title,
                            "type": q_type,
                            "prompt": item.get("item", ""),
                            "micro_context": micro_context,
                            "instruction": q_group.get("instruction", "")
                        })
                
                elif q_type == "matching_features":
                    for item in q_group.get("items", q_group.get("statements", [])):
                        micro_context = self._extract_micro_context(
                            passage_text, item.get("item", item.get("statement", ""))
                        )
                        questions.append({
                            "qid": f"R_P{passage_num}_{item.get('number')}",
                            "number": item.get("number"),
                            "passage_num": passage_num,
                            "passage_title": passage_title,
                            "type": q_type,
                            "prompt": item.get("item", item.get("statement", "")),
                            "options": q_group.get("features", []),
                            "micro_context": micro_context,
                            "instruction": q_group.get("instruction", "")
                        })
                
                elif q_type in ["sentence_completion", "summary_completion"]:
                    for item in q_group.get("items", []):
                        micro_context = self._extract_micro_context(
                            passage_text, item.get("sentence", "")
                        )
                        questions.append({
                            "qid": f"R_P{passage_num}_{item.get('number')}",
                            "number": item.get("number"),
                            "passage_num": passage_num,
                            "passage_title": passage_title,
                            "type": q_type,
                            "prompt": item.get("sentence", item.get("text", "")),
                            "micro_context": micro_context,
                            "instruction": q_group.get("instruction", "")
                        })
                
                elif q_type in ["multiple_choice", "multiple_selection"]:
                    items = q_group.get("items", [q_group])
                    for item in items:
                        micro_context = self._extract_micro_context(
                            passage_text, item.get("question", "")
                        )
                        questions.append({
                            "qid": f"R_P{passage_num}_{item.get('number')}",
                            "number": item.get("number"),
                            "passage_num": passage_num,
                            "passage_title": passage_title,
                            "type": q_type,
                            "prompt": item.get("question", ""),
                            "options": item.get("options", q_group.get("options", [])),
                            "micro_context": micro_context,
                            "instruction": q_group.get("instruction", "")
                        })
        
        return questions
    
    def _extract_micro_context(self, full_text: str, search_term: str, max_length: int = 600) -> str:
        """
        MICRO-BASED: Extract only the relevant paragraph for a question.
        Shows minimal text needed to answer the question.
        """
        if not full_text or not search_term:
            return full_text[:max_length] if full_text else ""
        
        paragraphs = full_text.split('\n\n')
        search_words = set(re.findall(r'\b\w+\b', search_term.lower()))
        
        # Remove common words
        common_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 
                       'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
                       'would', 'could', 'should', 'may', 'might', 'must', 'shall',
                       'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in',
                       'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
                       'through', 'during', 'before', 'after', 'above', 'below',
                       'between', 'under', 'again', 'further', 'then', 'once',
                       'that', 'this', 'these', 'those', 'and', 'but', 'or', 'nor',
                       'so', 'yet', 'both', 'either', 'neither', 'not', 'only',
                       'own', 'same', 'than', 'too', 'very', 'just'}
        
        search_words = search_words - common_words
        
        if not search_words:
            return paragraphs[0][:max_length] if paragraphs else ""
        
        best_para = ""
        best_score = 0
        
        for para in paragraphs:
            para_lower = para.lower()
            para_words = set(re.findall(r'\b\w+\b', para_lower))
            score = len(search_words & para_words)
            
            if score > best_score:
                best_score = score
                best_para = para
        
        if best_para:
            # Truncate if too long
            if len(best_para) > max_length:
                # Find sentence boundary
                sentences = re.split(r'(?<=[.!?])\s+', best_para)
                result = ""
                for sent in sentences:
                    if len(result) + len(sent) < max_length:
                        result += sent + " "
                    else:
                        break
                return result.strip() or best_para[:max_length]
            return best_para
        
        # Fallback: return first paragraph
        return paragraphs[0][:max_length] if paragraphs else ""
    
    def _extract_section_matching_context(self, full_text: str, question_text: str) -> List[Dict]:
        """
        For HEADING/SECTION MATCHING practice:
        Return exactly 3 paragraphs: 1 correct + 2 distractors
        """
        paragraphs = full_text.split('\n\n')
        
        # Find the most relevant paragraph
        search_words = set(re.findall(r'\b\w+\b', question_text.lower()))
        
        scored_paras = []
        for i, para in enumerate(paragraphs):
            para_lower = para.lower()
            para_words = set(re.findall(r'\b\w+\b', para_lower))
            score = len(search_words & para_words)
            
            # Extract heading if present
            heading_match = re.match(r'^([A-Z])\n', para)
            heading = heading_match.group(1) if heading_match else f"Para {i+1}"
            text = para[2:] if heading_match else para
            
            scored_paras.append({
                "heading": heading,
                "text": text[:400],  # Truncate
                "score": score,
                "is_correct": False
            })
        
        # Sort by score descending
        scored_paras.sort(key=lambda x: x["score"], reverse=True)
        
        if len(scored_paras) >= 3:
            # Mark best match as correct
            scored_paras[0]["is_correct"] = True
            # Take 2 random distractors from remaining
            distractors = random.sample(scored_paras[1:], min(2, len(scored_paras)-1))
            result = [scored_paras[0]] + distractors
            random.shuffle(result)
            return result
        
        return scored_paras[:3]
    
    # ============ PUBLIC API ============
    
    def get_random_practice(
        self,
        skill: str,
        count: int = 10,
        question_type: Optional[str] = None,
        exclude_qids: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Get random practice questions.
        Returns micro-based content (minimal context for each question).
        """
        exclude_qids = exclude_qids or []
        
        if skill == "listening":
            pool = self._practice_pool["listening"]
            if question_type:
                pool = [q for q in pool if q.get("type") == question_type]
            pool = [q for q in pool if q.get("qid") not in exclude_qids]
            
            selected = random.sample(pool, min(count, len(pool)))
            return {
                "success": True,
                "skill": skill,
                "count": len(selected),
                "questions": selected,
                "micro_based": True,
                "note": "Use answer_span for 5-15 second audio clips when available"
            }
        
        elif skill == "reading":
            pool = self._practice_pool["reading"]
            if question_type:
                pool = [q for q in pool if q.get("type") == question_type]
            pool = [q for q in pool if q.get("qid") not in exclude_qids]
            
            selected = random.sample(pool, min(count, len(pool)))
            return {
                "success": True,
                "skill": skill,
                "count": len(selected),
                "questions": selected,
                "micro_based": True,
                "note": "micro_context contains only the relevant paragraph"
            }
        
        elif skill == "writing":
            result = {
                "success": True,
                "skill": skill,
                "task1": None,
                "task2": None
            }
            
            if self._practice_pool["writing"]["task1"]:
                result["task1"] = random.choice(self._practice_pool["writing"]["task1"])
            if self._practice_pool["writing"]["task2"]:
                result["task2"] = random.choice(self._practice_pool["writing"]["task2"])
            
            return result
        
        elif skill == "speaking":
            return {
                "success": True,
                "skill": skill,
                "part1": {
                    "audio_only": True,
                    "questions": random.sample(
                        self._practice_pool["speaking"]["part1"],
                        min(count, len(self._practice_pool["speaking"]["part1"]))
                    ),
                    "note": "DO NOT show question text - audio only"
                },
                "part2": random.choice(self._practice_pool["speaking"]["part2"]) if self._practice_pool["speaking"]["part2"] else None,
                "part3": {
                    "audio_only": True,
                    "questions": random.sample(
                        self._practice_pool["speaking"]["part3"],
                        min(count, len(self._practice_pool["speaking"]["part3"]))
                    ),
                    "note": "DO NOT show question text - audio only"
                }
            }
        
        return {"success": False, "error": f"Unknown skill: {skill}"}
    
    def get_pool_stats(self) -> Dict[str, Any]:
        """Get practice pool statistics"""
        return {
            "listening": len(self._practice_pool["listening"]),
            "reading": len(self._practice_pool["reading"]),
            "writing": {
                "task1": len(self._practice_pool["writing"]["task1"]),
                "task2": len(self._practice_pool["writing"]["task2"])
            },
            "speaking": {
                "part1": len(self._practice_pool["speaking"]["part1"]),
                "part2": len(self._practice_pool["speaking"]["part2"]),
                "part3": len(self._practice_pool["speaking"]["part3"])
            }
        }
    
    def refresh_pool(self):
        """Rebuild practice pool (call after adding/removing tests)"""
        self._rebuild_pool()


# ============ EXPORTS ============

__all__ = ["PracticeService"]
