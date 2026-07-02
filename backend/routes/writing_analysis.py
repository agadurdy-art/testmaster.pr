"""
Inline writing error analysis
=============================
Single job: /writing/analyze-errors — AI grammar/spelling/style error spans
for the writing practice editor.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import json
import logging
import os

from fastapi import APIRouter, Request

from services.llm_compat import LlmChat, UserMessage

router = APIRouter()


@router.post("/writing/analyze-errors")
async def analyze_writing_errors(request: Request):
    """Analyze writing text for grammar/spelling errors using AI"""
    try:
        data = await request.json()
        text = data.get("text", "")
        
        if not text:
            return {"grammar_errors": []}
        
        chat = LlmChat(api_key=os.getenv("EMERGENT_LLM_KEY"))
        prompt = f"""Analyze this IELTS writing text for grammar, spelling, and style errors.

TEXT:
{text}

Return a JSON object with:
{{
  "grammar_errors": [
    {{
      "start": <start index in text>,
      "end": <end index in text>,
      "type": "grammar" | "spelling" | "style",
      "original": "<the error text>",
      "suggestion": "<correction or suggestion>"
    }}
  ],
  "criteria_scores": {{
    "task_response": <score 1-9>,
    "coherence": <score 1-9>,
    "lexical_resource": <score 1-9>,
    "grammatical_range": <score 1-9>
  }},
  "overall_feedback": "<brief overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "areas_to_improve": ["<area 1>", "<area 2>"],
  "grammar_upgrade_examples": [
    {{
      "original": "<basic sentence from text>",
      "upgraded": "<Band 8+ version>",
      "explanation": "<why it's better>"
    }}
  ]
}}

Be precise with start/end indices. Only flag real errors. Return valid JSON only."""

        response = await chat.send_async([UserMessage(text=prompt)])
        response_text = response.text.strip()
        
        # Parse JSON from response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"grammar_errors": [], "overall_feedback": "Analysis complete."}
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Writing analysis error: {e}")
        return {"grammar_errors": [], "overall_feedback": "Could not analyze text."}

