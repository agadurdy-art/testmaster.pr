"""
AI strategy advisor endpoint
============================
Single job: /ai/strategy — Core Mindset + STRATEGY_MODE_PROMPT band-gap
diagnosis for the legacy course surfaces.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import json
import logging
import os
import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from services.llm_compat import LlmChat, UserMessage
from services.ielts_prompts import IELTS_CORE_MINDSET, STRATEGY_MODE_PROMPT

router = APIRouter()


class StrategyRequest(BaseModel):
    user_id: str
    current_band: float = 5.5
    target_band: float = 7.0
    recent_scores: Dict[str, Any] = {}  # e.g., {"writing": 5.5, "speaking": 6.0, "reading": 6.5}
    weak_areas: List[str] = []
    test_history_summary: str = ""

@router.post("/ai/strategy")
async def get_learning_strategy(request: StrategyRequest):
    """Get AI-powered learning strategy using IELTS Core Mindset in Strategy Mode"""
    try:
        system_message = f"""{IELTS_CORE_MINDSET}

{STRATEGY_MODE_PROMPT}"""
        
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Analyze this learner's profile and provide a strategic learning plan.

LEARNER PROFILE:
- Current Band: {request.current_band}
- Target Band: {request.target_band}
- Recent Skill Scores: {json.dumps(request.recent_scores)}
- Identified Weak Areas: {', '.join(request.weak_areas) if request.weak_areas else 'Not specified'}
- Test History: {request.test_history_summary or 'No history provided'}

Your task:
1. Diagnose the PRIMARY blockers preventing this learner from reaching their target band
2. Identify which skills need immediate attention
3. Recommend specific actions for the next 2-4 weeks
4. Suggest which course modules to focus on

Return JSON only:
{{
    "diagnosis": {{
        "primary_blockers": ["<blocker 1>", "<blocker 2>"],
        "skill_priority_order": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>"],
        "band_gap_analysis": "<explanation of what separates current from target band>"
    }},
    "action_plan": {{
        "immediate_focus": "<what to work on this week>",
        "secondary_focus": "<what to work on next>",
        "avoid": "<what to stop doing>",
        "practice_ratio": {{"reading": <percentage>, "writing": <percentage>, "speaking": <percentage>, "listening": <percentage>}}
    }},
    "recommended_modules": ["<module name 1>", "<module name 2>"],
    "weekly_goals": ["<goal 1>", "<goal 2>", "<goal 3>"],
    "realistic_timeline": "<estimated weeks to reach target band with consistent practice>",
    "motivation_reality_check": "<honest assessment - not encouraging fluff, just facts>"
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = str(response).strip()
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {
            "diagnosis": {"primary_blockers": ["Unable to analyze"], "skill_priority_order": ["writing", "speaking", "reading", "listening"]},
            "action_plan": {"immediate_focus": "Practice consistently", "secondary_focus": "Review weak areas"},
            "recommended_modules": ["Module 1: Language and Communication"],
            "weekly_goals": ["Complete 2 practice tests", "Review vocabulary daily"],
            "realistic_timeline": "4-8 weeks",
            "motivation_reality_check": "Consistent practice is key to improvement."
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Strategy generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate strategy")


