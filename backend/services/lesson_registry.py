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
        skill: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get recommended lessons based on identified weaknesses.
        Used by AI evaluation to suggest lessons for improvement.
        
        Args:
            weaknesses: List of weakness areas (e.g., ["vocabulary", "grammar"])
            current_band: User's current band score
            skill: Optional skill filter (reading, writing, speaking, listening)
        
        Returns:
            List of recommended lessons with relevance scores
        """
        recommendations = []
        
        # Determine target stages based on current band
        if current_band < 5.0:
            target_stages = ["beginner"]
        elif current_band < 6.5:
            target_stages = ["beginner", "mastery"]
        else:
            target_stages = ["mastery", "advanced"]
        
        # Search keywords based on weaknesses
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
        
        for stage in target_stages:
            collection_name = self.STAGE_TO_COLLECTION.get(stage)
            if not collection_name:
                continue
            
            collection = self.db[collection_name]
            lessons = await collection.find({}, {"_id": 0}).to_list(100)
            
            for lesson in lessons:
                relevance_score = 0
                matched_weaknesses = []
                
                # Check lesson content against weaknesses
                lesson_text = str(lesson).lower()
                
                for weakness in weaknesses:
                    keywords = weakness_keywords.get(weakness.lower(), [weakness.lower()])
                    for keyword in keywords:
                        if keyword in lesson_text:
                            relevance_score += 1
                            if weakness not in matched_weaknesses:
                                matched_weaknesses.append(weakness)
                            break
                
                # Check skill-specific content
                if skill:
                    if skill.lower() in lesson:
                        relevance_score += 2
                
                if relevance_score > 0:
                    recommendations.append({
                        "lesson_id": lesson.get("id"),
                        "title": lesson.get("topic") or lesson.get("title"),
                        "stage": stage,
                        "band_level": self.STAGE_TO_BAND[stage],
                        "relevance_score": relevance_score,
                        "addresses_weaknesses": matched_weaknesses,
                        "learning_goals": lesson.get("learning_goals", []),
                        "module_number": lesson.get("lesson_number") or lesson.get("module_number")
                    })
        
        # Sort by relevance score (highest first)
        recommendations.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        # Return top 5 recommendations
        return recommendations[:5]
    
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
