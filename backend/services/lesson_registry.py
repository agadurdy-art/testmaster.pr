"""
Lesson Registry Service
========================
ULTRA MASTER PROMPT Implementation

This service provides a unified interface to all course lessons,
enabling course-driven Question Bank functionality with band-based topic gating.

Courses:
- BeginnerCourse (Band 4.0-5.0): beginner_english_lessons
- MasteryCourse (Band 5.5-6.5): mastery_course_modules  
- AdvancedMasteryCourse (Band 7.0-9.0): advanced_mastery_modules
"""

from typing import List, Dict, Optional, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import re


class LessonRegistry:
    """
    Lesson Registry - Single source of truth for course-driven Question Bank.
    
    Provides:
    - Band-based topic gating
    - Lesson-anchored task generation
    - Course-driven recommendations
    """
    
    # Band to Course Stage mapping
    BAND_TO_STAGES = {
        "4.0-5.0": ["beginner"],
        "5.5-6.5": ["beginner", "mastery"],
        "7.0-9.0": ["beginner", "mastery", "advanced"]
    }
    
    # Stage to collection mapping
    STAGE_TO_COLLECTION = {
        "beginner": "beginner_english_lessons",
        "mastery": "mastery_course_modules",
        "advanced": "advanced_mastery_modules"
    }
    
    # Stage to band mapping (for recommendations)
    STAGE_TO_BAND = {
        "beginner": "4.0-5.0",
        "mastery": "5.5-6.5",
        "advanced": "7.0-9.0"
    }

    STAGE_META = {
        "beginner": {
            "course_name": "Beginner English Course",
            "course_path": "/beginner-course",
            "label": "Beginner"
        },
        "mastery": {
            "course_name": "IELTS Mastery Course",
            "course_path": "/mastery-course",
            "label": "Mastery"
        },
        "advanced": {
            "course_name": "Advanced Mastery Course",
            "course_path": "/advanced-mastery",
            "label": "Advanced"
        }
    }
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    async def get_all_topics(self) -> List[Dict[str, Any]]:
        """
        Get all unique topics from all courses.
        Returns combined list with course stage info.
        """
        topics = {}
        
        # Fetch from all three collections
        for stage, collection_name in self.STAGE_TO_COLLECTION.items():
            collection = self.db[collection_name]
            lessons = await collection.find({}, {"_id": 0, "topic": 1, "title": 1, "id": 1}).to_list(100)
            
            for lesson in lessons:
                topic_name = lesson.get("topic") or lesson.get("title")
                if topic_name:
                    # Normalize topic name
                    normalized = topic_name.strip()
                    if normalized not in topics:
                        topics[normalized] = {
                            "id": normalized.lower().replace(" ", "_").replace("&", "and"),
                            "name": normalized,
                            "stages": [stage],
                            "lesson_count": 1,
                            "icon": self._get_topic_icon(normalized)
                        }
                    else:
                        if stage not in topics[normalized]["stages"]:
                            topics[normalized]["stages"].append(stage)
                        topics[normalized]["lesson_count"] += 1
        
        return list(topics.values())
    
    async def get_topics_by_band(self, band_level: str) -> List[Dict[str, Any]]:
        """
        Get topics filtered by band level (Topic Gating).
        
        Band 4.0-5.0: Topics from Beginner only
        Band 5.5-6.5: Topics from Beginner + Mastery
        Band 7.0-9.0: Topics from all courses
        """
        allowed_stages = self.BAND_TO_STAGES.get(band_level, ["beginner", "mastery", "advanced"])
        topics = {}
        
        for stage in allowed_stages:
            collection_name = self.STAGE_TO_COLLECTION.get(stage)
            if not collection_name:
                continue
                
            collection = self.db[collection_name]
            lessons = await collection.find({}, {"_id": 0}).to_list(100)
            
            for lesson in lessons:
                topic_name = lesson.get("topic") or lesson.get("title")
                if topic_name:
                    normalized = topic_name.strip()
                    topic_id = normalized.lower().replace(" ", "_").replace("&", "and")
                    
                    if topic_id not in topics:
                        topics[topic_id] = {
                            "id": topic_id,
                            "name": normalized,
                            "stages": [stage],
                            "icon": self._get_topic_icon(normalized),
                            "band_level": self.STAGE_TO_BAND[stage]
                        }
                    else:
                        if stage not in topics[topic_id]["stages"]:
                            topics[topic_id]["stages"].append(stage)
        
        return list(topics.values())
    
    async def get_lessons_by_topic(
        self, 
        topic: str, 
        band_level: Optional[str] = None,
        skill: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all lessons for a specific topic, optionally filtered by band and skill.
        """
        results = []
        allowed_stages = self.BAND_TO_STAGES.get(band_level, ["beginner", "mastery", "advanced"]) if band_level else ["beginner", "mastery", "advanced"]
        
        for stage in allowed_stages:
            collection_name = self.STAGE_TO_COLLECTION.get(stage)
            if not collection_name:
                continue
            
            collection = self.db[collection_name]
            
            # Search by topic (case-insensitive partial match)
            query = {
                "$or": [
                    {"topic": {"$regex": topic, "$options": "i"}},
                    {"title": {"$regex": topic, "$options": "i"}}
                ]
            }
            
            lessons = await collection.find(query, {"_id": 0}).to_list(100)
            
            for lesson in lessons:
                # Add stage and band info
                lesson["stage"] = stage
                lesson["band_level"] = self.STAGE_TO_BAND[stage]
                lesson["collection"] = collection_name
                
                # Extract learning objectives
                lesson["learning_objectives"] = self._extract_learning_objectives(lesson, skill)
                
                results.append(lesson)
        
        return results
    
    async def get_lesson_by_id(self, lesson_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific lesson by ID from any course.
        """
        for stage, collection_name in self.STAGE_TO_COLLECTION.items():
            collection = self.db[collection_name]
            lesson = await collection.find_one({"id": lesson_id}, {"_id": 0})
            
            if lesson:
                lesson["stage"] = stage
                lesson["band_level"] = self.STAGE_TO_BAND[stage]
                lesson["collection"] = collection_name
                return lesson
        
        return None
    
    async def get_recommended_lessons(
        self,
        weaknesses: List[str],
        current_band: float,
        skill: Optional[str] = None,
        topic: Optional[str] = None,
        context: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Get recommended lessons based on identified weaknesses.
        """
        recommendations = []
        target_stages = self._get_target_stages(current_band)
        target_stage_weights = {stage: len(target_stages) - index for index, stage in enumerate(target_stages)}

        weakness_keywords = {
            "vocabulary": ["vocabulary", "vocab", "lexical", "words", "collocation"],
            "grammar": ["grammar", "grammatical", "structure", "tense", "syntax"],
            "coherence": ["coherence", "cohesion", "linking", "paragraph", "organization"],
            "task_achievement": ["task", "achievement", "response", "content"],
            "pronunciation": ["pronunciation", "phonetic", "speaking", "accent"],
            "fluency": ["fluency", "speaking", "conversation", "discussion"],
            "reading": ["reading", "comprehension", "passage", "skimming", "scanning"],
            "writing": ["writing", "essay", "task", "academic"],
            "listening": ["listening", "audio", "comprehension", "note"]
        }

        normalized_context = " ".join(text for text in [topic or "", context or ""] if text).strip().lower()
        context_terms = self._extract_search_terms(normalized_context)

        for stage in target_stages:
            collection_name = self.STAGE_TO_COLLECTION.get(stage)
            if not collection_name:
                continue
            collection = self.db[collection_name]
            lessons = await collection.find({}, {"_id": 0}).to_list(100)

            for lesson in lessons:
                relevance_score = target_stage_weights.get(stage, 1) * 2
                matched_weaknesses = []
                matched_context_terms = []
                lesson_text = str(lesson).lower()
                lesson_title = str(lesson.get("topic") or lesson.get("title") or "").lower()

                for weakness in weaknesses:
                    keywords = weakness_keywords.get(weakness.lower(), [weakness.lower()])
                    for keyword in keywords:
                        if keyword in lesson_text:
                            relevance_score += 3 if keyword in lesson_title else 2
                            if weakness not in matched_weaknesses:
                                matched_weaknesses.append(weakness)
                            break

                if skill:
                    skill_key = skill.lower()
                    if lesson.get(skill_key):
                        relevance_score += 4
                    elif skill_key in lesson_text:
                        relevance_score += 2

                for term in context_terms:
                    if term in lesson_title:
                        relevance_score += 3
                        matched_context_terms.append(term)
                    elif term in lesson_text:
                        relevance_score += 1
                        matched_context_terms.append(term)

                if relevance_score > 0:
                    recommendations.append(
                        self._build_recommendation(
                            lesson=lesson, stage=stage, relevance_score=relevance_score,
                            matched_weaknesses=matched_weaknesses, matched_context_terms=matched_context_terms,
                            skill=skill, topic=topic, current_band=current_band
                        )
                    )

        recommendations.sort(
            key=lambda x: (x["relevance_score"], 1 if x.get("context_matches") else 0, 1 if x.get("addresses_weaknesses") else 0),
            reverse=True
        )
        unique_recommendations = []
        seen_lesson_ids = set()
        for rec in recommendations:
            lid = rec.get("lesson_id")
            if not lid or lid in seen_lesson_ids:
                continue
            seen_lesson_ids.add(lid)
            unique_recommendations.append(rec)
        return unique_recommendations[:limit]

    def _get_target_stages(self, current_band: float) -> List[str]:
        if current_band < 5.0:
            return ["beginner"]
        if current_band < 6.5:
            return ["mastery", "beginner"]
        return ["advanced", "mastery"]

    def _extract_search_terms(self, text: str) -> List[str]:
        if not text:
            return []
        terms = re.findall(r"[a-zA-Z][a-zA-Z\-]+", text.lower())
        return [term for term in terms if len(term) >= 4]

    def _build_recommendation(self, lesson, stage, relevance_score, matched_weaknesses, matched_context_terms, skill, topic, current_band):
        stage_meta = self.STAGE_META[stage]
        lesson_identifier = lesson.get("id")
        lesson_number = lesson.get("lesson_number")
        module_number = lesson.get("module_number")
        entry_number = lesson_number or module_number
        lesson_path = self._build_lesson_path(stage, lesson_identifier, entry_number)
        reason_parts = []
        if matched_weaknesses:
            reason_parts.append(f"Targets {', '.join(matched_weaknesses[:2])}")
        if matched_context_terms:
            reason_parts.append(f"Matches topic: {', '.join(matched_context_terms[:2])}")
        if skill:
            reason_parts.append(f"Best next {skill} lesson")
        if not reason_parts:
            reason_parts.append("Matches your current band range")
        unit_label = f"Lesson {entry_number}" if stage == "beginner" else f"Module {entry_number}"
        return {
            "lesson_id": lesson_identifier,
            "title": lesson.get("topic") or lesson.get("title"),
            "stage": stage,
            "course_stage": stage,
            "course": stage_meta["course_name"],
            "course_name": stage_meta["course_name"],
            "course_path": stage_meta["course_path"],
            "route": lesson_path,
            "url": lesson_path,
            "lesson_path": lesson_path,
            "band_level": self.STAGE_TO_BAND[stage],
            "recommended_for_band": self._band_label_for_score(current_band),
            "relevance_score": relevance_score,
            "addresses_weaknesses": matched_weaknesses,
            "context_matches": matched_context_terms,
            "learning_goals": lesson.get("learning_goals", []),
            "lesson_number": lesson_number,
            "module_number": module_number,
            "unit_label": unit_label,
            "reason": " • ".join(reason_parts),
            "why_now": f"{stage_meta['label']} course is the best fit for your current band and weaknesses.",
            "skill_focus": skill,
            "topic_focus": topic,
        }

    def _build_lesson_path(self, stage, lesson_id, entry_number):
        base_path = self.STAGE_META[stage]["course_path"]
        if stage == "beginner":
            target = lesson_id or entry_number or 1
        else:
            target = entry_number or lesson_id or 1
        return f"{base_path}?lesson={target}"

    def _band_label_for_score(self, score: float) -> str:
        if score < 5.0:
            return "4.0-5.0"
        if score < 6.5:
            return "5.5-6.5"
        return "7.0-9.0"
    
    async def get_skill_objectives(
        self,
        skill: str,
        band_level: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get learning objectives for a specific skill across courses.
        """
        objectives = []
        allowed_stages = self.BAND_TO_STAGES.get(band_level, ["beginner", "mastery", "advanced"]) if band_level else ["beginner", "mastery", "advanced"]
        
        for stage in allowed_stages:
            collection_name = self.STAGE_TO_COLLECTION.get(stage)
            if not collection_name:
                continue
            
            collection = self.db[collection_name]
            lessons = await collection.find({}, {"_id": 0}).to_list(100)
            
            for lesson in lessons:
                skill_content = lesson.get(skill, {})
                if skill_content:
                    objectives.append({
                        "lesson_id": lesson.get("id"),
                        "lesson_title": lesson.get("topic") or lesson.get("title"),
                        "stage": stage,
                        "band_level": self.STAGE_TO_BAND[stage],
                        "skill": skill,
                        "content": self._summarize_skill_content(skill_content, skill)
                    })
        
        return objectives
    
    def _get_topic_icon(self, topic: str) -> str:
        """Get emoji icon for a topic."""
        topic_icons = {
            "education": "🎓",
            "health": "💪",
            "technology": "💻",
            "environment": "🌍",
            "work": "💼",
            "employment": "💼",
            "travel": "✈️",
            "tourism": "✈️",
            "family": "👨‍👩‍👧",
            "society": "🏛️",
            "money": "💰",
            "finance": "💰",
            "culture": "🎭",
            "tradition": "🎭",
            "media": "📺",
            "advertising": "📺",
            "food": "🍎",
            "nutrition": "🍎",
            "housing": "🏠",
            "urbanization": "🏙️",
            "transportation": "🚌",
            "crime": "⚖️",
            "law": "⚖️",
            "science": "🔬",
            "research": "🔬",
            "hobbies": "🎨",
            "leisure": "🎨",
            "sports": "🏆",
            "competition": "🏆",
            "daily life": "☀️",
            "weather": "🌤️",
            "language": "💬",
            "communication": "💬",
            "art": "🎨"
        }
        
        topic_lower = topic.lower()
        for key, icon in topic_icons.items():
            if key in topic_lower:
                return icon
        return "📚"
    
    def _extract_learning_objectives(
        self, 
        lesson: Dict[str, Any], 
        skill: Optional[str] = None
    ) -> List[str]:
        """Extract learning objectives from a lesson."""
        objectives = []
        
        # Get explicit learning goals
        if "learning_goals" in lesson:
            goals = lesson["learning_goals"]
            if isinstance(goals, list):
                objectives.extend(goals)
            elif isinstance(goals, str):
                objectives.append(goals)
        
        # If skill specified, get skill-specific objectives
        if skill and skill in lesson:
            skill_content = lesson[skill]
            if isinstance(skill_content, dict):
                if "title" in skill_content:
                    objectives.append(f"Master: {skill_content['title']}")
                if "tips" in skill_content and isinstance(skill_content["tips"], list):
                    objectives.extend([f"Practice: {tip}" for tip in skill_content["tips"][:3]])
        
        return objectives[:5]  # Limit to 5 objectives
    
    def _summarize_skill_content(
        self, 
        skill_content: Any, 
        skill: str
    ) -> Dict[str, Any]:
        """Summarize skill-specific content."""
        if not skill_content:
            return {}
        
        if isinstance(skill_content, dict):
            summary = {
                "has_content": True,
                "title": skill_content.get("title", ""),
                "has_questions": "questions" in skill_content,
                "has_model_answer": "model_answer" in skill_content or "model_essay" in skill_content
            }
            
            if skill == "writing":
                summary["task_type"] = skill_content.get("task_type", "essay")
                summary["prompt_preview"] = str(skill_content.get("task") or skill_content.get("question", ""))[:100]
            elif skill == "speaking":
                summary["parts"] = []
                for part in ["part1", "part2", "part3"]:
                    if part in skill_content:
                        summary["parts"].append(part)
            elif skill == "reading":
                summary["question_count"] = len(skill_content.get("questions", []))
            elif skill == "listening":
                summary["has_audio"] = "audio_script" in skill_content or "transcript" in skill_content
            
            return summary
        
        return {"has_content": True}


# Singleton instance factory
_registry_instance = None

async def get_lesson_registry(db: AsyncIOMotorDatabase) -> LessonRegistry:
    """Get or create a LessonRegistry instance."""
    global _registry_instance
    if _registry_instance is None:
        _registry_instance = LessonRegistry(db)
    return _registry_instance
