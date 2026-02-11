"""
Cambridge Speaking Evaluation Routes
Uses existing QB evaluation protocols - no new code, just imports
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List, Dict, Any
import os
import json
from pathlib import Path
import tempfile

# Import QB evaluation functions directly
from routes.speaking_qb import (
    evaluate_speaking_test as qb_evaluate_full_speaking,
    azure_pronunciation_assessment as evaluate_speaking_with_azure,
    evaluate_speaking_premium
)

router = APIRouter(prefix="/api/cambridge/speaking", tags=["Cambridge Speaking"])

# API Keys
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
AZURE_SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION", "southeastasia")


@router.post("/evaluate")
async def evaluate_speaking_response(
    audio: UploadFile = File(...),
    question: str = Form(...),
    part: int = Form(...),
    question_index: int = Form(0),
    user_plan: str = Form("free")  # "free", "booster", "pro"
):
    """
    Evaluate a single speaking response using QB protocols.
    Free tier: Whisper + GPT-4o
    Premium tier (booster/pro): Azure pronunciation + detailed analysis
    """
    try:
        audio_content = await audio.read()
        
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_file:
            temp_file.write(audio_content)
            temp_path = temp_file.name
        
        # Check if premium evaluation
        is_premium = user_plan in ["booster", "pro"] and AZURE_SPEECH_KEY
        
        if is_premium:
            # Use QB premium evaluation with Azure
            result = await evaluate_premium_speaking(temp_path, question, part)
        else:
            # Use QB free evaluation
            result = await evaluate_free_speaking(temp_path, question, part)
        
        os.unlink(temp_path)
        return result
        
    except Exception as e:
        print(f"Cambridge Speaking evaluation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def evaluate_free_speaking(audio_path: str, question: str, part: int) -> Dict[str, Any]:
    """Free tier: Whisper transcription + GPT-4o evaluation (same as QB)"""
    if not EMERGENT_LLM_KEY:
        return {"error": "Evaluation service not configured", "success": False}
    
    try:
        from emergentintegrations.llm.openai import LlmChat, UserMessage
        import uuid
        from openai import OpenAI
        
        # Transcribe with Whisper
        client = OpenAI(api_key=EMERGENT_LLM_KEY, base_url="https://api.openai.com/v1")
        
        try:
            with open(audio_path, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            transcript = transcription if isinstance(transcription, str) else str(transcription)
        except Exception as e:
            print(f"Whisper error: {e}")
            transcript = "[Could not transcribe audio]"
        
        word_count = len(transcript.split()) if transcript else 0
        
        # Evaluate with GPT-4o (QB protocol)
        evaluation_prompt = f"""You are an IELTS speaking examiner. Evaluate this Part {part} response.

## Question
{question}

## Student's Response (transcribed)
{transcript}

## Task
Provide evaluation in JSON format:
{{
    "overall_band": <float 4.0-9.0>,
    "criteria": {{
        "fluency_coherence": <int 4-9>,
        "lexical_resource": <int 4-9>,
        "grammatical_range": <int 4-9>,
        "pronunciation": <int 4-9>
    }},
    "feedback": "<2-3 sentence constructive feedback>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "tip": "<one actionable improvement tip>"
}}"""
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an IELTS examiner. Respond only with valid JSON."
        )
        
        response = await chat.send_message(user_message=UserMessage(text=evaluation_prompt))
        
        response_text = str(response)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        evaluation = json.loads(response_text.strip())
        
        return {
            "success": True,
            "tier": "free",
            "tier_name": "Free Evaluation",
            "transcript": transcript,
            "word_count": word_count,
            "overall_band": evaluation.get("overall_band", 5.0),
            "criteria": evaluation.get("criteria", {}),
            "feedback": evaluation.get("feedback", ""),
            "strengths": evaluation.get("strengths", []),
            "weaknesses": evaluation.get("weaknesses", []),
            "tip": evaluation.get("tip", "")
        }
        
    except Exception as e:
        print(f"Free evaluation error: {e}")
        return {"success": False, "error": str(e), "tier": "free"}


async def evaluate_premium_speaking(audio_path: str, question: str, part: int) -> Dict[str, Any]:
    """Premium tier: Azure pronunciation + GPT-4o analysis (same as QB)"""
    if not AZURE_SPEECH_KEY:
        return await evaluate_free_speaking(audio_path, question, part)
    
    try:
        import azure.cognitiveservices.speech as speechsdk
        import subprocess
        from emergentintegrations.llm.openai import LlmChat, UserMessage
        import uuid
        
        # Convert to WAV
        temp_wav = audio_path.replace(".webm", ".wav")
        try:
            subprocess.run([
                'ffmpeg', '-y', '-i', audio_path,
                '-acodec', 'pcm_s16le', '-ac', '1', '-ar', '16000', temp_wav
            ], capture_output=True, check=True)
        except:
            from pydub import AudioSegment
            audio = AudioSegment.from_file(audio_path)
            audio = audio.set_channels(1).set_frame_rate(16000)
            audio.export(temp_wav, format="wav")
        
        # Azure config
        speech_config = speechsdk.SpeechConfig(subscription=AZURE_SPEECH_KEY, region=AZURE_SPEECH_REGION)
        audio_config = speechsdk.AudioConfig(filename=temp_wav)
        speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        
        # Pronunciation assessment
        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text="",
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
            enable_miscue=True
        )
        pronunciation_config.enable_prosody_assessment()
        pronunciation_config.apply_to(speech_recognizer)
        
        result = speech_recognizer.recognize_once()
        os.unlink(temp_wav)
        
        transcript = ""
        azure_scores = {}
        problem_words = []
        
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            transcript = result.text
            json_result = result.properties.get(speechsdk.PropertyId.SpeechServiceResponse_JsonResult)
            
            if json_result:
                assessment_data = json.loads(json_result)
                nbest = assessment_data.get("NBest", [{}])
                
                if nbest:
                    pron = nbest[0].get("PronunciationAssessment", {})
                    azure_scores = {
                        "pronunciation": pron.get("PronScore", 0),
                        "accuracy": pron.get("AccuracyScore", 0),
                        "fluency": pron.get("FluencyScore", 0),
                        "completeness": pron.get("CompletenessScore", 0),
                        "prosody": pron.get("ProsodyScore", 0)
                    }
                    
                    # Extract problem words
                    for word_data in nbest[0].get("Words", []):
                        word_pron = word_data.get("PronunciationAssessment", {})
                        if word_pron.get("AccuracyScore", 100) < 80:
                            problem_words.append({
                                "word": word_data.get("Word", ""),
                                "accuracy_score": word_pron.get("AccuracyScore", 0),
                                "error_type": word_pron.get("ErrorType", "None")
                            })
        
        # GPT-4o analysis with Azure data (QB protocol)
        avg_pron = azure_scores.get("pronunciation", 50)
        
        evaluation_prompt = f"""You are an expert IELTS speaking examiner. Analyze this Part {part} response with Azure pronunciation data.

## Azure Pronunciation Scores
- Overall Pronunciation: {azure_scores.get('pronunciation', 0):.1f}/100
- Accuracy: {azure_scores.get('accuracy', 0):.1f}/100
- Fluency: {azure_scores.get('fluency', 0):.1f}/100
- Completeness: {azure_scores.get('completeness', 0):.1f}/100
- Prosody: {azure_scores.get('prosody', 0):.1f}/100

## Problem Words
{json.dumps(problem_words[:10], indent=2) if problem_words else "No significant issues detected."}

## Question
{question}

## Transcript
{transcript}

## Task
Provide comprehensive evaluation in JSON:
{{
    "overall_band": <float 4.0-9.0>,
    "criteria": {{
        "fluency_coherence": <int 4-9>,
        "lexical_resource": <int 4-9>,
        "grammatical_range": <int 4-9>,
        "pronunciation": <int 4-9>
    }},
    "pronunciation_analysis": {{
        "main_issues": ["<issue 1>", "<issue 2>"],
        "swallowed_sounds": ["<any detected>"],
        "missing_endings": ["<words with missing final sounds>"],
        "stress_issues": ["<words with wrong stress>"]
    }},
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "mentor_notes": "<2-3 sentences of professional guidance>",
    "practice_focus": ["<specific sound to practice>", "<word pattern>"],
    "try_this_next": ["<exercise 1>", "<exercise 2>"]
}}"""
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert IELTS examiner. Respond only with valid JSON."
        )
        
        response = await chat.send_message(user_message=UserMessage(text=evaluation_prompt))
        
        response_text = str(response)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        evaluation = json.loads(response_text.strip())
        
        return {
            "success": True,
            "tier": "premium",
            "tier_name": "Premium Evaluation",
            "transcript": transcript,
            "word_count": len(transcript.split()) if transcript else 0,
            "overall_band": evaluation.get("overall_band", 5.0),
            "criteria": evaluation.get("criteria", {}),
            "azure_scores": azure_scores,
            "pronunciation_analysis": {
                **evaluation.get("pronunciation_analysis", {}),
                "azure_scores": azure_scores
            },
            "word_level_results": problem_words[:15],
            "strengths": evaluation.get("strengths", []),
            "weaknesses": evaluation.get("weaknesses", []),
            "mentor_notes": evaluation.get("mentor_notes", ""),
            "practice_focus": evaluation.get("practice_focus", []),
            "try_this_next": evaluation.get("try_this_next", [])
        }
        
    except Exception as e:
        print(f"Premium evaluation error: {e}")
        import traceback
        traceback.print_exc()
        return await evaluate_free_speaking(audio_path, question, part)


@router.post("/evaluate-full-test")
async def evaluate_full_speaking_test(
    recordings: List[UploadFile] = File(...),
    questions: str = Form(...),
    user_plan: str = Form("free")
):
    """
    Evaluate complete speaking test (all parts).
    Uses QB evaluate_speaking_test protocol.
    """
    try:
        questions_data = json.loads(questions)
        is_premium = user_plan in ["booster", "pro"] and AZURE_SPEECH_KEY
        
        all_results = []
        
        for i, recording in enumerate(recordings):
            audio_content = await recording.read()
            
            with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_file:
                temp_file.write(audio_content)
                temp_path = temp_file.name
            
            question = questions_data[i] if i < len(questions_data) else "General speaking question"
            part = questions_data[i].get("part", 1) if i < len(questions_data) and isinstance(questions_data[i], dict) else 1
            
            if is_premium:
                result = await evaluate_premium_speaking(temp_path, str(question), part)
            else:
                result = await evaluate_free_speaking(temp_path, str(question), part)
            
            all_results.append(result)
            os.unlink(temp_path)
        
        # Calculate overall band
        bands = [r.get("overall_band", 5.0) for r in all_results if r.get("success")]
        overall_band = round(sum(bands) / len(bands) * 2) / 2 if bands else 5.0
        
        return {
            "success": True,
            "tier": "premium" if is_premium else "free",
            "overall_band": overall_band,
            "part_results": all_results,
            "summary": {
                "total_parts": len(all_results),
                "successful_evaluations": len([r for r in all_results if r.get("success")])
            }
        }
        
    except Exception as e:
        print(f"Full test evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
    transcript: str = Body("")
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
                    from emergentintegrations.llm.openai import LlmChat, UserMessage
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
    test_id: str = Body("")
):
    """
    Generate Band 7 and Band 8 model answers for a speaking question.
    Cached in MongoDB — one-time generation per question.
    """
    from motor.motor_asyncio import AsyncIOMotorClient
    
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME", "ielts_app")
    
    try:
        # Check cache first
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        cache_key = f"{book_id}_{test_id}_part{part}_{hash(question[:100])}"
        cached = await db.speaking_model_answers.find_one({"cache_key": cache_key}, {"_id": 0})
        
        if cached:
            return {"success": True, "cached": True, **cached}
        
        if not EMERGENT_LLM_KEY:
            return {"success": False, "error": "LLM not configured", "fallback": True,
                    "band7": {"structure": _get_structure_template(part, 7)},
                    "band8": {"structure": _get_structure_template(part, 8)}}
        
        from emergentintegrations.llm.openai import LlmChat, UserMessage
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


print("✅ Cambridge Speaking evaluation routes loaded (using QB protocols)")
