"""
Level test — course recommendations
===================================
Single job: turn level-test results into a primary/secondary course pick
(Foundation / Mastery / Advanced) plus an LLM-generated weekly roadmap
(localized en/vi/tr). Stateless.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import json
import logging
import os
import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.llm_compat import LlmChat, UserMessage

router = APIRouter()

logger = logging.getLogger(__name__)


class CourseRecommendationRequest(BaseModel):
    overall_band: float
    reading_band: float
    speaking_band: float
    weaknesses: List[str]
    skill_breakdown: Dict[str, Any]
    language: Optional[str] = "en"  # en, vi, tr

@router.post("/level-test/recommend-courses")
async def recommend_courses(request: CourseRecommendationRequest):
    """
    Generate personalized course recommendations based on level test results.
    Returns recommended courses with reasoning and a learning roadmap.
    """
    try:
        # Determine primary course based on overall band
        if request.overall_band < 4.5:
            primary_course = {
                "id": "beginner",
                "name": "Foundation Course",
                "band_range": "Band 2.0 - 4.5",
                "reason": "Build essential English fundamentals",
                "priority": "Start Here"
            }
            secondary_course = {
                "id": "mastery",
                "name": "Mastery Course",
                "band_range": "Band 5.5 - 6.5",
                "reason": "Progress to after completing foundation",
                "priority": "Next Step"
            }
        elif 4.5 <= request.overall_band < 6.5:
            primary_course = {
                "id": "mastery",
                "name": "Mastery Course",
                "band_range": "Band 5.5 - 6.5",
                "reason": "Break through intermediate plateau",
                "priority": "Start Here"
            }
            secondary_course = {
                "id": "advanced",
                "name": "Advanced Mastery",
                "band_range": "Band 6.5 - 9.0",
                "reason": "Target high band scores after mastery",
                "priority": "Next Step"
            }
        else:
            primary_course = {
                "id": "advanced",
                "name": "Advanced Mastery",
                "band_range": "Band 6.5 - 9.0",
                "reason": "Achieve Band 7+ with advanced strategies",
                "priority": "Start Here"
            }
            secondary_course = {
                "id": "mastery",
                "name": "Mastery Course",
                "band_range": "Band 5.5 - 6.5",
                "reason": "Review fundamentals if needed",
                "priority": "Optional Review"
            }
        
        # Generate personalized learning roadmap using AI
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an expert IELTS preparation advisor creating personalized study plans."
        ).with_model("openai", "gpt-5.1")  # Using GPT-5.1 instead of Claude
        
        weaknesses_text = "\n".join([f"- {w}" for w in request.weaknesses])
        
        # Language-specific instructions
        language_instructions = {
            "vi": "\n\nIMPORTANT: Provide ALL text fields (weekly_plan goals/activities, priority_skills, study_tips, milestone_goals) in VIETNAMESE language so parents can understand the roadmap clearly.",
            "tr": "\n\nIMPORTANT: Provide ALL text fields (weekly_plan goals/activities, priority_skills, study_tips, milestone_goals) in TURKISH language so parents can understand the roadmap clearly.",
            "en": ""
        }
        
        language_note = language_instructions.get(request.language, "")
        
        roadmap_prompt = f"""Create a personalized 8-12 week learning roadmap for an IELTS student.

STUDENT PROFILE:
- Overall Band: {request.overall_band}
- Reading Band: {request.reading_band}
- Speaking Band: {request.speaking_band}
- Key Weaknesses: {weaknesses_text}

RECOMMENDED COURSE: {primary_course['name']} ({primary_course['band_range']})

Generate a JSON study plan:
{{
    "target_band": <realistic target band after 8-12 weeks>,
    "estimated_weeks": <8-12 weeks based on current level>,
    "weekly_plan": [
        {{
            "week": 1,
            "focus": "<Main skill to work on>",
            "goals": [
                "<Specific goal 1>",
                "<Specific goal 2>"
            ],
            "activities": [
                "<Activity 1 from the course>",
                "<Activity 2>"
            ]
        }},
        // ... 3-4 week milestones
    ],
    "priority_skills": [
        "<Skill 1 to focus on immediately>",
        "<Skill 2>",
        "<Skill 3>"
    ],
    "study_tips": [
        "<Personalized tip 1 based on weaknesses>",
        "<Tip 2>",
        "<Tip 3>"
    ],
    "milestone_goals": [
        {{
            "weeks": 4,
            "goal": "<What they should achieve by week 4>",
            "band_target": <expected band>
        }},
        {{
            "weeks": 8,
            "goal": "<What they should achieve by week 8>",
            "band_target": <expected band>
        }},
        {{
            "weeks": 12,
            "goal": "<Final goal>",
            "band_target": <target band>
        }}
    ]
}}

Make it motivating but realistic. Address their specific weaknesses.{language_note}"""

        response = await chat.send_message(UserMessage(text=roadmap_prompt))
        
        # Parse roadmap
        if isinstance(response, dict):
            roadmap = response
        else:
            import re
            json_match = re.search(r'\{[\s\S]*\}', str(response))
            if json_match:
                roadmap = json.loads(json_match.group())
            else:
                roadmap = {"target_band": request.overall_band + 1.0, "estimated_weeks": 12}
        
        return {
            "recommended_courses": [primary_course, secondary_course],
            "learning_roadmap": roadmap,
            "immediate_actions": [
                f"Enroll in {primary_course['name']} to start building your skills",
                f"Focus first on: {', '.join(request.weaknesses[:2]) if request.weaknesses else 'core fundamentals'}",
                "Practice speaking 15-20 minutes daily",
                "Complete at least 3 reading practice passages per week"
            ]
        }
        
    except Exception as e:
        logger.error(f"Course recommendation error: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")


