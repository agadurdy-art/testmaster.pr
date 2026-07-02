"""
Level test — speaking evaluation
================================
Single job: evaluate comprehensive-level-test speaking transcripts (fast
gpt-4o-mini pass with a 15s timeout and a length-based quick-band fallback
in en/vi/tr). Stateless.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import asyncio
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


class LevelTestSpeakingEvaluation(BaseModel):
    responses: List[Dict[str, Any]]  # [{"level": "A1-A2", "transcript": "..."}]
    language: Optional[str] = "en"  # en, vi, tr

@router.post("/level-test/evaluate-speaking")
async def evaluate_level_test_speaking(request: LevelTestSpeakingEvaluation):
    """
    Evaluate speaking responses from comprehensive level test.
    Returns detailed band score, weaknesses, and specific improvement areas.
    OPTIMIZED: Uses simpler, faster evaluation for better user experience.
    """
    try:
        # First, provide quick estimation based on transcript length and content
        responses = request.responses
        total_words = 0
        total_responses = len(responses)
        
        for r in responses:
            transcript = r.get('transcript', '')
            words = len(transcript.split())
            total_words += words
        
        avg_words = total_words / max(total_responses, 1)
        
        # Quick band estimation based on response length and complexity
        # This gives immediate feedback while AI processes
        quick_band = 4.0
        if avg_words > 100:
            quick_band = 6.5
        elif avg_words > 70:
            quick_band = 6.0
        elif avg_words > 50:
            quick_band = 5.5
        elif avg_words > 30:
            quick_band = 5.0
        elif avg_words > 15:
            quick_band = 4.5
        
        # Use a simpler, faster prompt
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an IELTS speaking examiner. Evaluate quickly and return only JSON."
        ).with_model("openai", "gpt-4o-mini")  # Faster model
        
        # Format responses concisely
        responses_text = ""
        for idx, r in enumerate(request.responses, 1):
            transcript = r.get('transcript', '')[:200]  # Limit length for speed
            responses_text += f"Q{idx}: {transcript}\n"
        
        # Shorter, faster prompt
        evaluation_prompt = f"""Evaluate this IELTS speaking test. Return ONLY JSON:

{responses_text}

Return this JSON (fill in values):
{{"overall_band": 5.5, "criteria_scores": {{"fluency_coherence": 5.5, "lexical_resource": 5.0, "grammatical_range_accuracy": 5.5, "pronunciation": 5.5}}, "cefr_level": "B1", "strengths": ["strength1", "strength2"], "weaknesses": ["weakness1", "weakness2"], "improvement_recommendations": ["tip1", "tip2"], "detailed_feedback": "2-3 sentence feedback"}}"""

        try:
            response = await asyncio.wait_for(
                chat.send_message(UserMessage(text=evaluation_prompt)),
                timeout=15.0  # 15 second timeout
            )
            
            response_text = str(response)
            
            import re
            response_text = re.sub(r'```json\s*', '', response_text)
            response_text = re.sub(r'```\s*', '', response_text)
            
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                result = json.loads(json_match.group())
                # Add missing fields with defaults
                result.setdefault("pronunciation_issues", [])
                result.setdefault("vocabulary_gaps", [])
                return result
                
        except asyncio.TimeoutError:
            logger.warning("Speaking evaluation timed out, using quick estimation")
        except Exception as e:
            logger.warning(f"AI evaluation failed: {e}, using quick estimation")
        
        # Fallback: Return quick estimation if AI is slow/fails
        language = request.language
        
        if language == "vi":
            strengths = ["Phát âm cơ bản rõ ràng", "Có thể diễn đạt ý tưởng đơn giản"]
            weaknesses = ["Cần mở rộng vốn từ vựng", "Cần cải thiện ngữ pháp phức tạp"]
            recommendations = ["Luyện nói 15-20 phút mỗi ngày", "Học thêm từ vựng học thuật"]
            feedback = f"Trình độ nói của bạn ước tính khoảng Band {quick_band}. Tiếp tục luyện tập để cải thiện!"
        elif language == "tr":
            strengths = ["Temel telaffuz anlaşılır", "Basit fikirler ifade edilebilir"]
            weaknesses = ["Kelime dağarcığı genişletilmeli", "Karmaşık dilbilgisi geliştirilmeli"]
            recommendations = ["Günde 15-20 dakika konuşma pratiği yapın", "Akademik kelimeler öğrenin"]
            feedback = f"Konuşma seviyeniz yaklaşık Band {quick_band} olarak tahmin edilmektedir. Pratik yapmaya devam edin!"
        else:
            strengths = ["Basic pronunciation is clear", "Able to express simple ideas"]
            weaknesses = ["Vocabulary range needs expansion", "Complex grammar needs practice"]
            recommendations = ["Practice speaking 15-20 minutes daily", "Learn academic vocabulary"]
            feedback = f"Your speaking level is estimated at Band {quick_band}. Keep practicing to improve!"
        
        return {
            "overall_band": quick_band,
            "criteria_scores": {
                "fluency_coherence": quick_band,
                "lexical_resource": quick_band - 0.5,
                "grammatical_range_accuracy": quick_band,
                "pronunciation": quick_band + 0.5
            },
            "cefr_level": "A2" if quick_band < 4.5 else "B1" if quick_band < 5.5 else "B2" if quick_band < 7.0 else "C1",
            "strengths": strengths,
            "weaknesses": weaknesses,
            "pronunciation_issues": [],
            "improvement_recommendations": recommendations,
            "vocabulary_gaps": [],
            "detailed_feedback": feedback
        }
        
    except Exception as e:
        logger.error(f"Speaking evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

