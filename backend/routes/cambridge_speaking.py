"""
Cambridge Speaking — drills + model answers.

Note (Faz 0, 2026-07-02): the legacy /evaluate and /evaluate-full-test
endpoints were removed. They were unauthenticated (evaluate-full-test even
trusted a client-supplied user_plan), unmetered, and no longer called by the
frontend — Cambridge speaking is scored via /api/speaking-practice/
evaluate-structured (see routes/speaking_practice_structured.py).
"""

from fastapi import APIRouter, Body, Depends
from typing import List, Dict, Any
import os
import json

import auth_session  # Faz 0 (2026-07-02): LLM spend must not be anonymous

router = APIRouter(prefix="/api/cambridge/speaking", tags=["Cambridge Speaking"])

# API Keys
EMERGENT_LLM_KEY = os.environ.get("OPENAI_API_KEY")  # legacy var name; reads own OpenAI key

# Module-level db handle; populated by server.py on startup via set_db().
# Faz 1 (2026-07-02): /model-answers used to open a NEW AsyncIOMotorClient per
# request (and never closed it) — connection churn for a cache lookup.
db = None


def set_db(database) -> None:
    global db
    db = database


# ============ SPEAKING P2: DRILLS + MODEL ANSWERS ============

DRILL_TEMPLATES = {
    "fluency_coherence": {
        "title": "Fluency Drill: 60-Second Shadowing",
        "description": "Listen and repeat immediately after the speaker. Focus on maintaining a smooth flow without pausing.",
        "steps": [
            "Pick any 1-minute English podcast clip (BBC, TED Talks)",
            "Play the audio and repeat each sentence immediately after hearing it",
            "Focus on rhythm and flow, not perfect pronunciation",
            "Record yourself and compare the smoothness to the original"
        ],
        "duration": "5 minutes",
        "skill_target": "Fluency & Coherence"
    },
    "lexical_resource": {
        "title": "Vocabulary Booster: Topic Collocations",
        "description": "Build topic-specific vocabulary with natural collocations instead of isolated words.",
        "steps": [
            "Choose the topic from your weakest speaking response",
            "Find 5 collocations for that topic (e.g., 'urban development' not just 'city')",
            "Write a short paragraph using all 5 collocations",
            "Say it aloud 3 times, each time trying to sound more natural"
        ],
        "duration": "10 minutes",
        "skill_target": "Lexical Resource"
    },
    "grammatical_range": {
        "title": "Grammar Fix: Error Transformation",
        "description": "Take your own mistakes and practice the correct versions until they become automatic.",
        "steps": [
            "Look at the grammatical errors from your evaluation",
            "Write the incorrect sentence, then rewrite it correctly",
            "Say the correct version 5 times aloud",
            "Create 2 new sentences using the same grammar structure",
            "Record yourself using these structures in a 30-second answer"
        ],
        "duration": "10 minutes",
        "skill_target": "Grammatical Range & Accuracy"
    },
    "pronunciation": {
        "title": "Sound Lab: Minimal Pairs",
        "description": "Train your ear and mouth on sounds that are commonly confused.",
        "steps": [
            "Identify 3 problem sounds from your evaluation feedback",
            "Find minimal pairs for each (e.g., 'ship/sheep', 'bat/bet')",
            "Record yourself saying each pair 5 times",
            "Listen back — can YOU hear the difference?",
            "Practice the problem sounds in full sentences"
        ],
        "duration": "8 minutes",
        "skill_target": "Pronunciation"
    }
}


@router.post("/generate-drills")
async def generate_speaking_drills(
    criteria: Dict[str, Any] = Body(...),
    weaknesses: List[str] = Body([]),
    transcript: str = Body(""),
    _caller: dict = Depends(auth_session.current_user),
):
    """
    Generate personalized speaking drills.
    Template-first + 1 small LLM personalization per weak area.
    """
    try:
        drills = []
        weak_criteria = []
        
        # Find weak criteria (below band 6)
        for key, value in criteria.items():
            if isinstance(value, (int, float)) and value < 6:
                weak_criteria.append(key)
        
        # If no criteria below 6, take the lowest 2
        if not weak_criteria and criteria:
            sorted_criteria = sorted(criteria.items(), key=lambda x: x[1] if isinstance(x[1], (int, float)) else 9)
            weak_criteria = [k for k, v in sorted_criteria[:2]]
        
        for crit_key in weak_criteria:
            template = DRILL_TEMPLATES.get(crit_key)
            if not template:
                continue
            
            drill = {**template, "criterion": crit_key, "band_score": criteria.get(crit_key, 5)}
            
            # LLM personalization: generate 1 short personalized tip (max ~100 tokens)
            if EMERGENT_LLM_KEY and (weaknesses or transcript):
                try:
                    from services.llm_compat import LlmChat, UserMessage
                    import uuid
                    
                    context = f"Weaknesses: {', '.join(weaknesses[:3])}" if weaknesses else ""
                    if transcript:
                        context += f"\nTranscript excerpt: {transcript[:200]}"
                    
                    chat = LlmChat(
                        api_key=EMERGENT_LLM_KEY,
                        session_id=str(uuid.uuid4()),
                        system_message="You are an IELTS speaking coach. Be concise."
                    )
                    
                    personalization_prompt = f"""Based on this student's {crit_key.replace('_', ' ')} weakness:
{context}

Give ONE specific 2-sentence practice instruction. No greetings, just the instruction."""
                    
                    resp = await chat.send_message(user_message=UserMessage(text=personalization_prompt))
                    drill["personalized_tip"] = str(resp).strip()[:300]
                except Exception as e:
                    print(f"Drill personalization failed: {e}")
                    drill["personalized_tip"] = None
            else:
                drill["personalized_tip"] = None
            
            drills.append(drill)
        
        return {"success": True, "drills": drills}
        
    except Exception as e:
        print(f"Drill generation error: {e}")
        return {"success": False, "error": str(e), "drills": []}


@router.post("/model-answers")
async def generate_model_answers(
    question: str = Body(...),
    part: int = Body(...),
    book_id: str = Body(""),
    test_id: str = Body(""),
    _caller: dict = Depends(auth_session.current_user),
):
    """
    Generate Band 7 and Band 8 model answers for a speaking question.
    Cached in MongoDB — one-time generation per question.
    """
    try:
        # Check cache first (module-level db, injected by server.py set_db)
        if db is None:
            return {"success": False, "error": "Database not initialised",
                    "band7": {"structure": _get_structure_template(part, 7)},
                    "band8": {"structure": _get_structure_template(part, 8)},
                    "differences": []}

        # hashlib (not built-in hash()) — str hash is randomized per process
        # (PYTHONHASHSEED), so hash()-based keys never matched after a restart
        # and the "one-time generation" cache silently regenerated every deploy.
        import hashlib
        q_digest = hashlib.md5(question[:100].encode("utf-8")).hexdigest()[:16]
        cache_key = f"{book_id}_{test_id}_part{part}_{q_digest}"
        cached = await db.speaking_model_answers.find_one({"cache_key": cache_key}, {"_id": 0})
        
        if cached:
            return {"success": True, "cached": True, **cached}
        
        if not EMERGENT_LLM_KEY:
            return {"success": False, "error": "LLM not configured", "fallback": True,
                    "band7": {"structure": _get_structure_template(part, 7)},
                    "band8": {"structure": _get_structure_template(part, 8)}}
        
        from services.llm_compat import LlmChat, UserMessage
        import uuid
        
        # Length guidelines per part
        length_guide = {
            1: "2-3 short sentences per answer (15-30 seconds each)",
            2: "A 1-2 minute monolog with clear structure (introduction, 2-3 main points, conclusion)",
            3: "3-4 analytical sentences showing depth of discussion (30-45 seconds)"
        }
        
        prompt = f"""Generate TWO model speaking answers for this IELTS Part {part} question.

QUESTION: {question}

REQUIREMENTS:
- Band 7 answer: Good vocabulary, some complex structures, clear communication, minor hesitations OK
- Band 8 answer: Wide vocabulary range, flexible grammar, fluent and coherent, sophisticated ideas
- Length: {length_guide.get(part, length_guide[1])}
- Sound natural and spoken (not written essay style)
- Include natural discourse markers ("Well,", "Actually,", "I'd say that...")

OUTPUT (JSON only):
{{
    "band7": {{
        "answer": "<full Band 7 model answer>",
        "key_features": ["<feature 1>", "<feature 2>", "<feature 3>"]
    }},
    "band8": {{
        "answer": "<full Band 8 model answer>",
        "key_features": ["<feature 1>", "<feature 2>", "<feature 3>"]
    }},
    "differences": ["<key difference 1>", "<key difference 2>", "<key difference 3>"]
}}"""

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an IELTS speaking examiner. Respond only with valid JSON."
        )
        
        response = await chat.send_message(user_message=UserMessage(text=prompt))
        
        response_text = str(response)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        result = json.loads(response_text.strip())
        
        # Cache in MongoDB
        cache_doc = {
            "cache_key": cache_key,
            "question": question,
            "part": part,
            "book_id": book_id,
            "test_id": test_id,
            "band7": result.get("band7", {}),
            "band8": result.get("band8", {}),
            "differences": result.get("differences", [])
        }
        await db.speaking_model_answers.insert_one(cache_doc)
        
        return {"success": True, "cached": False, **{k: v for k, v in cache_doc.items() if k != "_id"}}
        
    except Exception as e:
        print(f"Model answer generation error: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e),
                "band7": {"structure": _get_structure_template(part, 7)},
                "band8": {"structure": _get_structure_template(part, 8)},
                "differences": []}


def _get_structure_template(part: int, band: int) -> str:
    """Fallback structure template when LLM is unavailable"""
    templates = {
        (1, 7): "Start with a direct answer → Add 1-2 supporting details → Use a simple example",
        (1, 8): "Start with a nuanced answer → Expand with specific examples → Add a personal reflection",
        (2, 7): "Introduction (topic + feeling) → Main point 1 with detail → Main point 2 with example → Brief conclusion",
        (2, 8): "Hook opening → Structured narrative with vivid details → Analysis of why it matters → Reflective conclusion",
        (3, 7): "State your view clearly → Support with 1-2 reasons → Acknowledge other perspectives briefly",
        (3, 8): "Present a balanced view → Analyze with cause/effect reasoning → Use sophisticated hedging → Draw an insightful conclusion",
    }
    return templates.get((part, band), "Structure your answer with a clear introduction, body, and conclusion.")


print("✅ Cambridge Speaking drills/model-answers routes loaded")
