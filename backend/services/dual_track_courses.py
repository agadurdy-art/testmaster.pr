"""
IELTS Dual-Track Course System
==============================
Implements Academic and General Training tracks within each course level.

Structure:
- BeginnerCourse: Academic Track + General Track
- MasteryCourse: Academic Track + General Track  
- AdvancedCourse: Academic Track + General Track

Speaking & Listening remain shared across both tracks.
"""

from typing import Dict, List, Any, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from content.dual_track import general_lessons as _general_lessons
from content.dual_track import boosters as _boosters
from content.dual_track import strategic_modules as _strategic_modules


class DualTrackCourseManager:
    """
    Manages dual-track course structure for IELTS Academic and General Training.
    """

    # Course content data extracted to content/dual_track/ (Faz 1 refactor, 2026-07-02)
    TRACKS = _general_lessons.TRACKS
    BEGINNER_GENERAL_LESSONS = _general_lessons.BEGINNER_GENERAL_LESSONS
    MASTERY_GENERAL_LESSONS = _general_lessons.MASTERY_GENERAL_LESSONS
    ADVANCED_GENERAL_LESSONS = _general_lessons.ADVANCED_GENERAL_LESSONS
    MODULE_LANGUAGE_BOOSTERS = _boosters.MODULE_LANGUAGE_BOOSTERS
    ADVANCED_MODULE_STRATEGIC_WRITING = _strategic_modules.ADVANCED_MODULE_STRATEGIC_WRITING
    ADVANCED_MODULE_STRATEGIC_READING = _strategic_modules.ADVANCED_MODULE_STRATEGIC_READING

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    async def get_course_with_tracks(self, course_level: str) -> Dict[str, Any]:
        """
        Get course structure with both Academic and General tracks.
        """
        # Map to collection names
        collections = {
            "beginner": "beginner_english_lessons",
            "mastery": "mastery_course_modules",
            "advanced": "advanced_mastery_modules"
        }
        
        collection_name = collections.get(course_level)
        if not collection_name:
            return {"error": "Invalid course level"}
        
        # Get Academic track lessons (existing)
        academic_lessons = await self.db[collection_name].find(
            {}, {"_id": 0}
        ).to_list(100)
        
        # Add track info to academic lessons
        for lesson in academic_lessons:
            lesson["track"] = "academic"
        
        # Get General track lessons
        general_lessons = self._get_general_lessons(course_level)
        
        return {
            "course_level": course_level,
            "tracks": {
                "academic": {
                    "name": self.TRACKS["academic"]["name"],
                    "description": self.TRACKS["academic"]["description"],
                    "lesson_count": len(academic_lessons),
                    "lessons": academic_lessons
                },
                "general": {
                    "name": self.TRACKS["general"]["name"],
                    "description": self.TRACKS["general"]["description"],
                    "lesson_count": len(general_lessons),
                    "lessons": general_lessons
                }
            },
            "shared_skills": ["speaking", "listening"]
        }
    
    def _get_general_lessons(self, course_level: str) -> List[Dict[str, Any]]:
        """Get General Training lessons for a course level."""
        lessons_map = {
            "beginner": self.BEGINNER_GENERAL_LESSONS,
            "mastery": self.MASTERY_GENERAL_LESSONS,
            "advanced": self.ADVANCED_GENERAL_LESSONS
        }
        return lessons_map.get(course_level, [])
    
    async def get_lessons_by_track(
        self, 
        course_level: str, 
        track: str
    ) -> List[Dict[str, Any]]:
        """Get lessons for a specific track."""
        if track == "general":
            return self._get_general_lessons(course_level)
        
        # Academic track - from database
        collections = {
            "beginner": "beginner_english_lessons",
            "mastery": "mastery_course_modules",
            "advanced": "advanced_mastery_modules"
        }
        
        collection_name = collections.get(course_level)
        if not collection_name:
            return []
        
        lessons = await self.db[collection_name].find({}, {"_id": 0}).to_list(100)
        for lesson in lessons:
            lesson["track"] = "academic"
        
        return lessons
    
    async def get_lesson_by_id(
        self, 
        lesson_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a specific lesson by ID from any track."""
        # Check General Track lessons first
        for lessons in [
            self.BEGINNER_GENERAL_LESSONS,
            self.MASTERY_GENERAL_LESSONS,
            self.ADVANCED_GENERAL_LESSONS
        ]:
            for lesson in lessons:
                if lesson.get("id") == lesson_id:
                    return lesson
        
        # Check Academic Track in database
        for collection_name in [
            "beginner_english_lessons",
            "mastery_course_modules",
            "advanced_mastery_modules"
        ]:
            lesson = await self.db[collection_name].find_one(
                {"id": lesson_id}, {"_id": 0}
            )
            if lesson:
                lesson["track"] = "academic"
                return lesson
        
        return None
    
    async def get_recommended_lessons_by_track(
        self,
        track: str,
        weaknesses: List[str],
        band_level: str
    ) -> List[Dict[str, Any]]:
        """Get lesson recommendations for a specific track based on weaknesses."""
        recommendations = []
        
        # Determine course levels based on band
        if band_level in ["4.0-5.0"]:
            course_levels = ["beginner"]
        elif band_level in ["5.5-6.5"]:
            course_levels = ["beginner", "mastery"]
        else:
            course_levels = ["beginner", "mastery", "advanced"]
        
        # Get lessons for the track
        for level in course_levels:
            lessons = await self.get_lessons_by_track(level, track)
            
            for lesson in lessons:
                relevance_score = 0
                matched_weaknesses = []
                
                # Check lesson content against weaknesses
                lesson_text = str(lesson).lower()
                
                weakness_keywords = {
                    "letter_format": ["letter", "formal", "informal", "opening", "closing"],
                    "tone": ["tone", "polite", "formal", "register", "softening"],
                    "vocabulary": ["vocabulary", "words", "expressions", "phrases"],
                    "grammar": ["grammar", "structure", "sentence"],
                    "task_achievement": ["task", "bullet", "points", "address"]
                }
                
                for weakness in weaknesses:
                    keywords = weakness_keywords.get(weakness.lower(), [weakness.lower()])
                    for keyword in keywords:
                        if keyword in lesson_text:
                            relevance_score += 1
                            if weakness not in matched_weaknesses:
                                matched_weaknesses.append(weakness)
                            break
                
                if relevance_score > 0:
                    recommendations.append({
                        "lesson_id": lesson.get("id"),
                        "title": lesson.get("topic") or lesson.get("title"),
                        "level": level,
                        "track": track,
                        "band_target": lesson.get("band_target"),
                        "relevance_score": relevance_score,
                        "addresses_weaknesses": matched_weaknesses
                    })
        
        # Sort by relevance
        recommendations.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return recommendations[:5]


# Factory function
def get_dual_track_manager(db: AsyncIOMotorDatabase) -> DualTrackCourseManager:
    return DualTrackCourseManager(db)
