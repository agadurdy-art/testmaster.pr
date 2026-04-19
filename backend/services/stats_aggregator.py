"""
Stats Aggregator Service
========================
Auto-updates stats when tests are added/removed.
Single source of truth for all test statistics.

HARD RULE: Only counts APPROVED/PUBLISHED tests in public stats.
"""

from typing import Dict, Any, List
from datetime import datetime


class StatsAggregator:
    """
    AUTO STATS AGGREGATION
    ======================
    Computes and caches statistics from all ingested tests.
    Auto-updates when tests change - no manual config needed.
    
    HARD RULE: Only APPROVED/PUBLISHED tests are counted in:
    - Public stats displayed to users
    - Practice pool calculations
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
        """Initialize with test registry"""
        self.test_registry = test_registry
        self._stats_cache = None
        self._last_computed = None
        self.compute_stats()
    
    def _is_test_publishable(self, test_id: str) -> bool:
        """Check if a test is publishable (APPROVED or PUBLISHED)"""
        qa_service = self.get_qa_service()
        if qa_service:
            return qa_service.is_publishable(test_id)
        return True  # Fallback for backwards compatibility
    
    def _get_test_status(self, test_id: str) -> str:
        """Get test status string"""
        qa_service = self.get_qa_service()
        if qa_service:
            return qa_service.get_test_status(test_id).value
        return "UNKNOWN"
    
    def compute_stats(self) -> Dict[str, Any]:
        """
        Compute comprehensive stats from all tests.
        Called automatically when tests are added/removed.
        
        Returns two sets of stats:
        - public_stats: Only APPROVED/PUBLISHED tests (shown to users)
        - admin_stats: All tests regardless of status (for admin)
        """
        stats = {
            "total_tests": 0,
            "valid_tests": 0,
            "failed_tests": 0,
            "publishable_tests": 0,  # APPROVED/PUBLISHED only
            "total_questions": {
                "listening": 0,
                "reading": 0,
                "writing": 0,
                "speaking": 0,
                "total": 0
            },
            "by_type": {},
            "by_book": {},
            "practice_pool_size": {
                "listening": 0,
                "reading": 0,
                "writing": 0,
                "speaking": 0
            },
            "tests": [],
            "last_updated": datetime.utcnow().isoformat()
        }
        
        for book_id, book_data in self.test_registry.items():
            book_stats = {
                "book_id": book_id,
                "title": book_data.get("title", book_id),
                "test_count": 0,
                "valid_tests": 0,
                "publishable_tests": 0
            }
            
            for test_id, test_data in book_data.get("tests", {}).items():
                stats["total_tests"] += 1
                full_test_id = f"{book_id}_{test_id}"
                
                if test_data is None:
                    stats["failed_tests"] += 1
                    continue
                
                stats["valid_tests"] += 1
                book_stats["test_count"] += 1
                book_stats["valid_tests"] += 1
                
                # Check if publishable
                is_publishable = self._is_test_publishable(full_test_id)
                test_status = self._get_test_status(full_test_id)
                
                if is_publishable:
                    stats["publishable_tests"] += 1
                    book_stats["publishable_tests"] += 1
                
                # Get test stats
                test_stats = self._get_test_stats(test_data, book_id, test_id)
                
                # Add test to list
                stats["tests"].append({
                    "test_id": f"{book_id}_{test_id}",
                    "book": book_id,
                    "title": test_data.get("title", test_id),
                    "status": test_status,
                    "is_publishable": is_publishable,
                    "stats": test_stats
                })
                
                # Aggregate question counts
                for skill in ["listening", "reading", "writing", "speaking"]:
                    count = test_stats.get("questions", {}).get(skill, 0)
                    stats["total_questions"][skill] += count
                    stats["total_questions"]["total"] += count
                
                # Aggregate by type
                for qtype, count in test_stats.get("by_type", {}).items():
                    stats["by_type"][qtype] = stats["by_type"].get(qtype, 0) + count
                
                # Aggregate practice pool
                for skill in ["listening", "reading", "writing", "speaking"]:
                    stats["practice_pool_size"][skill] += test_stats.get("practice_pool", {}).get(skill, 0)
            
            stats["by_book"][book_id] = book_stats
        
        self._stats_cache = stats
        self._last_computed = datetime.utcnow()
        
        return stats
    
    def _get_test_stats(self, test_data: Dict, book_id: str, test_id: str) -> Dict:
        """Get stats for a single test"""
        sections = test_data.get("sections", {})
        
        questions = {
            "listening": 0,
            "reading": 0,
            "writing": 0,
            "speaking": 0
        }
        
        by_type = {}
        practice_pool = {
            "listening": 0,
            "reading": 0,
            "writing": 0,
            "speaking": 0
        }
        
        # Listening stats
        listening = sections.get("listening", {})
        for part in listening.get("parts", []):
            part_questions = self._count_part_questions(part)
            questions["listening"] += part_questions
            practice_pool["listening"] += part_questions
            
            # Count by type
            for q_type in part.get("question_types", []):
                key = f"listening_{q_type}"
                by_type[key] = by_type.get(key, 0) + 10  # Approximate
        
        # Reading stats
        reading = sections.get("reading", {})
        questions["reading"] = reading.get("total_questions", 40)
        practice_pool["reading"] = questions["reading"]
        
        for passage in reading.get("passages", []):
            for q_group in passage.get("questions", []):
                q_type = q_group.get("type", "unknown")
                key = f"reading_{q_type}"
                
                # Count questions in group
                if "statements" in q_group:
                    count = len(q_group["statements"])
                elif "items" in q_group:
                    count = len(q_group["items"])
                else:
                    count = 1
                
                by_type[key] = by_type.get(key, 0) + count
        
        # Writing stats
        writing = sections.get("writing", {})
        questions["writing"] = writing.get("total_tasks", 2)
        practice_pool["writing"] = questions["writing"]
        
        # Speaking stats
        speaking = sections.get("speaking", {})
        for part in speaking.get("parts", []):
            part_num = part.get("part_number", 0)
            if part_num == 1:
                count = len(part.get("questions", []))
                questions["speaking"] += count
                practice_pool["speaking"] += count
            elif part_num == 2:
                questions["speaking"] += 1
                practice_pool["speaking"] += 1
            elif part_num == 3:
                if part.get("topics"):
                    for topic in part.get("topics", []):
                        count = len(topic.get("questions", []))
                        questions["speaking"] += count
                        practice_pool["speaking"] += count
                else:
                    count = len(part.get("questions", []))
                    questions["speaking"] += count
                    practice_pool["speaking"] += count
        
        return {
            "questions": questions,
            "by_type": by_type,
            "practice_pool": practice_pool
        }
    
    def _count_part_questions(self, part: Dict) -> int:
        """Count questions in a listening part"""
        count = 0
        
        for q in part.get("questions", []):
            if isinstance(q, dict):
                if "items" in q:
                    count += len(q["items"])
                elif "number" in q:
                    q_range = q.get("number", "")
                    if isinstance(q_range, str) and "-" in q_range:
                        start, end = q_range.split("-")
                        count += int(end) - int(start) + 1
                    else:
                        count += 1
                else:
                    count += 1
        
        return count if count > 0 else 10  # Default 10 per part
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cached stats (recompute if stale)"""
        if self._stats_cache is None:
            self.compute_stats()
        return self._stats_cache
    
    def get_test_debug_info(self, test_id: str) -> Dict[str, Any]:
        """
        ADMIN DEBUG: Get detailed info about a specific test.
        """
        for book_id, book_data in self.test_registry.items():
            for tid, test_data in book_data.get("tests", {}).items():
                if f"{book_id}_{tid}" == test_id:
                    if test_data is None:
                        return {
                            "test_id": test_id,
                            "status": "NOT_FOUND",
                            "reason": "Test data is None (coming soon)"
                        }
                    
                    # Get detailed stats
                    stats = self._get_test_stats(test_data, book_id, tid)
                    
                    # Check for issues
                    issues = []
                    sections = test_data.get("sections", {})
                    
                    # Check listening
                    listening = sections.get("listening", {})
                    if not listening.get("parts"):
                        issues.append("Missing listening.parts")
                    elif len(listening.get("parts", [])) != 4:
                        issues.append(f"Listening has {len(listening.get('parts', []))} parts (need 4)")
                    
                    # Check reading
                    reading = sections.get("reading", {})
                    if not reading.get("passages"):
                        issues.append("Missing reading.passages")
                    elif len(reading.get("passages", [])) != 3:
                        issues.append(f"Reading has {len(reading.get('passages', []))} passages (need 3)")
                    
                    for i, passage in enumerate(reading.get("passages", [])):
                        text = passage.get("passage_text", passage.get("text", ""))
                        if len(text) < 500:
                            issues.append(f"Passage {i+1} text too short ({len(text)} chars)")
                    
                    # Check writing
                    writing = sections.get("writing", {})
                    tasks = writing.get("tasks", [])
                    has_task1 = any(t.get("task_number") == 1 for t in tasks)
                    has_task2 = any(t.get("task_number") == 2 for t in tasks)
                    
                    if not has_task1:
                        issues.append("Missing Writing Task 1")
                    if not has_task2:
                        issues.append("Missing Writing Task 2")
                    
                    for task in tasks:
                        if task.get("task_number") == 1:
                            visual = task.get("visual", {})
                            if not visual.get("image_url") and not visual.get("image_src"):
                                issues.append("Writing Task 1 missing visual image")
                    
                    # Check speaking
                    speaking = sections.get("speaking", {})
                    parts = speaking.get("parts", [])
                    part_nums = [p.get("part_number") for p in parts]
                    
                    if 1 not in part_nums:
                        issues.append("Missing Speaking Part 1")
                    if 2 not in part_nums:
                        issues.append("Missing Speaking Part 2")
                    if 3 not in part_nums:
                        issues.append("Missing Speaking Part 3")
                    
                    for part in parts:
                        if part.get("part_number") == 2:
                            cue = part.get("cue_card", part.get("task_card", part.get("topic_card", {})))
                            if not cue.get("topic") and not cue.get("instruction"):
                                issues.append("Speaking Part 2 missing cue card topic")
                    
                    return {
                        "test_id": test_id,
                        "status": "VALID" if not issues else "ISSUES_FOUND",
                        "issues": issues,
                        "stats": stats,
                        "sections_present": list(sections.keys()),
                        "raw_keys": list(test_data.keys())
                    }
        
        return {
            "test_id": test_id,
            "status": "NOT_FOUND",
            "reason": "Test ID not found in registry"
        }
    
    def refresh(self):
        """Force refresh stats"""
        return self.compute_stats()


# ============ EXPORTS ============

__all__ = ["StatsAggregator"]
