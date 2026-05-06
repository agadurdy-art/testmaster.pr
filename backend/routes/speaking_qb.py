"""
Speaking Question Bank API Routes
==================================
Provides endpoints for Speaking practice in the Question Bank.
Features:
- IELTS-style speaking tests (Part 1, 2, 3)
- Two tracks: Academic and General
- Audio question playback (pre-generated)
- User answer recording + transcription
- AI evaluation following Cambridge IELTS criteria
"""

from fastapi import APIRouter, Query, HTTPException, Body, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Optional, List, Dict, Any
import os
import base64
import uuid
import json
from datetime import datetime, timezone
from pathlib import Path
from elevenlabs import ElevenLabs, VoiceSettings

router = APIRouter(prefix="/api/speaking", tags=["Speaking Question Bank"])

# API Keys
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
OPENAI_KEY = os.environ.get("OPENAI_API_KEY") or EMERGENT_LLM_KEY
AZURE_SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION", "southeastasia")

# Evaluation tiers
EVALUATION_TIERS = {
    "free": {
        "name": "Basic Evaluation",
        "cost_tokens": 0,
        "model": "whisper",
        "features": ["transcription", "basic_band_estimate", "general_feedback"]
    },
    "premium": {
        "name": "Premium Evaluation", 
        "cost_tokens": 1,
        "model": "azure_pronunciation",
        "features": ["transcription", "word_level_accuracy", "phoneme_analysis", 
                    "pronunciation_score", "fluency_score", "completeness_score",
                    "prosody_score", "detailed_feedback", "mentor_notes"]
    }
}

# Audio + recordings directories. Resolve relative to this file so the router
# boots in any environment (Emergent pod = /app/backend, local dev =
# /private/tmp/.../backend) without import-time mkdir failures that silently
# 404 every QB endpoint.
_BACKEND_DIR = Path(__file__).resolve().parent.parent
AUDIO_CACHE_DIR = Path(os.environ.get(
    "SPEAKING_AUDIO_CACHE_DIR",
    str(_BACKEND_DIR / "static/audio/speaking"),
))
AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)

RECORDINGS_DIR = Path(os.environ.get(
    "SPEAKING_RECORDINGS_DIR",
    str(_BACKEND_DIR / "static/recordings"),
))
RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)

# Voice profiles for examiner (IELTS-neutral tone)
EXAMINER_VOICES = {
    "british_female_2": {
        "voice_id": "ThT5KcBeYPX3keUQqHPh",  # Dorothy - mature, professional
        "stability": 0.85,
        "similarity_boost": 0.70,
        "style": 0.0,  # Zero style = neutral
    },
    "british_male_2": {
        "voice_id": "VR6AewLTigWG4xSOukaG",  # Arnold - authoritative
        "stability": 0.85,
        "similarity_boost": 0.70,
        "style": 0.0,
    },
}


def get_cached_audio_path(question_id: str, set_id: str) -> Path:
    """Get path for cached question audio."""
    return AUDIO_CACHE_DIR / f"{set_id}_{question_id}.mp3"


def is_audio_cached(question_id: str, set_id: str) -> bool:
    """Check if question audio is cached."""
    path = get_cached_audio_path(question_id, set_id)
    return path.exists() and path.stat().st_size > 100


async def generate_examiner_audio(text: str, voice_key: str, question_id: str, set_id: str) -> Optional[str]:
    """Generate IELTS examiner-style audio for a question."""
    # Check cache first
    if is_audio_cached(question_id, set_id):
        return f"/api/speaking/audio/{set_id}/{question_id}"
    
    if not ELEVENLABS_API_KEY:
        return None
    
    try:
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        voice_profile = EXAMINER_VOICES.get(voice_key, EXAMINER_VOICES["british_female_2"])
        
        voice_settings = VoiceSettings(
            stability=voice_profile["stability"],
            similarity_boost=voice_profile["similarity_boost"],
            style=voice_profile["style"],
            use_speaker_boost=False
        )
        
        audio_generator = client.text_to_speech.convert(
            text=text,
            voice_id=voice_profile["voice_id"],
            model_id="eleven_multilingual_v2",
            voice_settings=voice_settings
        )
        
        audio_data = b""
        for chunk in audio_generator:
            audio_data += chunk
        
        # Save to cache
        cache_path = get_cached_audio_path(question_id, set_id)
        with open(cache_path, 'wb') as f:
            f.write(audio_data)
        
        print(f"✅ Speaking audio cached: {cache_path.name}")
        return f"/api/speaking/audio/{set_id}/{question_id}"
        
    except Exception as e:
        print(f"Error generating speaking audio: {str(e)}")
        return None


async def transcribe_audio(audio_data: bytes, language: str = "en") -> Optional[str]:
    """Transcribe audio using OpenAI Whisper (native openai SDK)."""
    if not OPENAI_KEY:
        print("OPENAI_API_KEY (or EMERGENT_LLM_KEY) not configured")
        return None

    try:
        from services.openai_compat import OpenAISpeechToText

        stt = OpenAISpeechToText(api_key=OPENAI_KEY)
        
        # Save audio temporarily
        temp_path = RECORDINGS_DIR / f"temp_{uuid.uuid4()}.webm"
        with open(temp_path, 'wb') as f:
            f.write(audio_data)
        
        # Transcribe
        with open(temp_path, 'rb') as audio_file:
            response = await stt.transcribe(
                file=audio_file,
                model="whisper-1",
                language=language,
                response_format="json"
            )
        
        # Cleanup
        temp_path.unlink(missing_ok=True)
        
        return response.text
        
    except Exception as e:
        print(f"Error transcribing audio: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


async def azure_pronunciation_assessment(
    audio_data: bytes,
    reference_text: str,
    language: str = "en-US"
) -> Dict[str, Any]:
    """
    Perform detailed pronunciation assessment using Azure Speech Services.
    Provides word-level accuracy, phoneme analysis, and prosody scores.
    
    Features:
    - Word-level accuracy scores
    - Phoneme-level analysis (detecting swallowed sounds, missing final consonants)
    - Fluency and prosody analysis
    - Detailed mispronunciation feedback
    """
    if not AZURE_SPEECH_KEY:
        print("AZURE_SPEECH_KEY not configured")
        return {"error": "Azure Speech not configured"}
    
    try:
        import azure.cognitiveservices.speech as speechsdk
        import subprocess
        
        # Save audio temporarily
        temp_input = RECORDINGS_DIR / f"temp_{uuid.uuid4()}.webm"
        temp_wav = RECORDINGS_DIR / f"temp_{uuid.uuid4()}.wav"
        
        with open(temp_input, 'wb') as f:
            f.write(audio_data)
        
        # Convert webm to WAV (16kHz, mono, 16-bit) using ffmpeg
        try:
            subprocess.run([
                'ffmpeg', '-y', '-i', str(temp_input),
                '-acodec', 'pcm_s16le', '-ac', '1', '-ar', '16000',
                str(temp_wav)
            ], capture_output=True, check=True)
        except Exception as e:
            print(f"FFmpeg conversion failed: {e}")
            # Try alternative: use pydub
            try:
                from pydub import AudioSegment
                audio = AudioSegment.from_file(str(temp_input))
                audio = audio.set_channels(1).set_frame_rate(16000)
                audio.export(str(temp_wav), format="wav")
            except Exception as e2:
                print(f"Pydub conversion also failed: {e2}")
                temp_input.unlink(missing_ok=True)
                return {"error": f"Audio conversion failed: {str(e)}"}
        
        # Configure Azure Speech
        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SPEECH_KEY,
            region=AZURE_SPEECH_REGION
        )
        
        # Configure audio input from file
        audio_config = speechsdk.AudioConfig(filename=str(temp_wav))
        
        # Create speech recognizer
        speech_recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config,
            audio_config=audio_config
        )
        
        # Configure pronunciation assessment
        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=reference_text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
            enable_miscue=True
        )
        
        # Enable prosody assessment for fluency and naturalness analysis
        pronunciation_config.enable_prosody_assessment()
        
        # Apply pronunciation assessment configuration to recognizer
        pronunciation_config.apply_to(speech_recognizer)
        
        # Perform speech recognition with pronunciation assessment
        result = speech_recognizer.recognize_once()
        
        # Cleanup temp files
        temp_input.unlink(missing_ok=True)
        temp_wav.unlink(missing_ok=True)
        
        # Extract and parse results
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            # Get JSON response containing detailed pronunciation assessment
            json_result = result.properties.get(
                speechsdk.PropertyId.SpeechServiceResponse_JsonResult
            )
            
            if json_result:
                assessment_data = json.loads(json_result)
                
                # Extract NBest results (pronunciation assessment is in NBest[0])
                nbest = assessment_data.get("NBest", [{}])
                if nbest:
                    pron_assessment = nbest[0].get("PronunciationAssessment", {})
                    words = nbest[0].get("Words", [])
                    
                    # Process word-level results
                    word_results = []
                    for word in words:
                        word_pron = word.get("PronunciationAssessment", {})
                        phonemes = word.get("Phonemes", [])
                        
                        # Find problematic phonemes
                        problem_phonemes = []
                        for phoneme in phonemes:
                            phoneme_score = phoneme.get("PronunciationAssessment", {}).get("AccuracyScore", 100)
                            if phoneme_score < 60:
                                problem_phonemes.append({
                                    "phoneme": phoneme.get("Phoneme", ""),
                                    "score": phoneme_score
                                })
                        
                        word_results.append({
                            "word": word.get("Word", ""),
                            "accuracy_score": word_pron.get("AccuracyScore", 0),
                            "error_type": word_pron.get("ErrorType", "None"),
                            "problem_phonemes": problem_phonemes
                        })
                    
                    return {
                        "success": True,
                        "recognized_text": nbest[0].get("Display", result.text),
                        "pronunciation_score": pron_assessment.get("PronScore", 0),
                        "accuracy_score": pron_assessment.get("AccuracyScore", 0),
                        "fluency_score": pron_assessment.get("FluencyScore", 0),
                        "completeness_score": pron_assessment.get("CompletenessScore", 0),
                        "prosody_score": pron_assessment.get("ProsodyScore", 0),
                        "word_results": word_results,
                        "raw_data": assessment_data
                    }
            
            return {
                "success": True,
                "recognized_text": result.text,
                "note": "Basic recognition only, detailed assessment unavailable"
            }
        
        elif result.reason == speechsdk.ResultReason.NoMatch:
            return {
                "success": False,
                "error": "No speech detected in audio",
                "reason": "NoMatch"
            }
        
        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation = result.cancellation_details
            return {
                "success": False,
                "error": f"Speech recognition canceled: {cancellation.reason}",
                "details": str(cancellation.error_details)
            }
        
        return {"success": False, "error": "Unknown error"}
        
    except Exception as e:
        print(f"Azure pronunciation assessment error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


async def evaluate_speaking_free(
    transcripts: List[Dict[str, Any]],
    set_data: Dict[str, Any],
    track: str,
    band_range: str
) -> Dict[str, Any]:
    """
    FREE tier evaluation using Whisper transcription + GPT-4o basic analysis.
    Provides general feedback without detailed pronunciation analysis.
    """
    if not EMERGENT_LLM_KEY:
        return {"error": "Evaluation service not configured"}
    
    try:
        from services.llm_compat import LlmChat, UserMessage
        import uuid
        
        # Calculate basic metrics
        total_words = sum(len(t.get("transcript", "").split()) for t in transcripts)
        total_duration = sum(t.get("duration", 0) for t in transcripts)
        words_per_minute = (total_words / total_duration * 60) if total_duration > 0 else 0
        
        # Build simple evaluation prompt
        evaluation_prompt = f"""You are an IELTS speaking examiner. Provide a BRIEF evaluation of this speaking test.

## Test Info
- Track: {track.upper()}
- Target Band: {band_range}
- Words spoken: {total_words}
- Speaking rate: {words_per_minute:.0f} words/minute

## Transcripts
{chr(10).join([f"Part {t.get('part')}: {t.get('transcript', '[No response]')}" for t in transcripts])}

## Task
Provide a brief evaluation in JSON format:
{{
    "estimated_band": <float 4.0-9.0>,
    "summary": "<2-3 sentence overall assessment>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "areas_to_improve": ["<area 1>", "<area 2>"],
    "tip": "<one practical tip for improvement>"
}}

Be fair and realistic. This is a basic evaluation without detailed pronunciation analysis."""
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an IELTS examiner. Respond only with valid JSON."
        )
        response = await chat.send_message(
            user_message=UserMessage(text=evaluation_prompt)
        )
        response_text = response
        
        # Parse JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        evaluation = json.loads(response_text.strip())
        
        return {
            "success": True,
            "tier": "free",
            "tier_name": "Basic Evaluation",
            "overall_band": evaluation.get("estimated_band", 5.0),
            "summary": evaluation.get("summary", ""),
            "strengths": evaluation.get("strengths", []),
            "weaknesses": evaluation.get("areas_to_improve", []),
            "tip": evaluation.get("tip", ""),
            "metrics": {
                "total_words": total_words,
                "words_per_minute": round(words_per_minute, 1),
                "total_duration": total_duration
            },
            "upgrade_prompt": "🔓 Upgrade to Premium for detailed pronunciation analysis, word-level accuracy, and phoneme feedback!"
        }
        
    except Exception as e:
        print(f"Free evaluation error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "tier": "free"
        }


async def evaluate_speaking_premium(
    transcripts: List[Dict[str, Any]],
    azure_results: List[Dict[str, Any]],
    set_data: Dict[str, Any],
    track: str,
    band_range: str
) -> Dict[str, Any]:
    """
    PREMIUM tier evaluation using Azure Pronunciation Assessment + GPT-4o detailed analysis.
    Provides word-level accuracy, phoneme analysis, and comprehensive feedback.
    """
    if not EMERGENT_LLM_KEY:
        return {"error": "Evaluation service not configured"}
    
    try:
        from services.llm_compat import LlmChat, UserMessage
        
        # Aggregate Azure scores
        total_pron_score = 0
        total_accuracy = 0
        total_fluency = 0
        total_completeness = 0
        total_prosody = 0
        valid_count = 0
        
        all_word_results = []
        problem_words = []
        
        for azure_result in azure_results:
            if azure_result.get("success"):
                total_pron_score += azure_result.get("pronunciation_score", 0)
                total_accuracy += azure_result.get("accuracy_score", 0)
                total_fluency += azure_result.get("fluency_score", 0)
                total_completeness += azure_result.get("completeness_score", 0)
                total_prosody += azure_result.get("prosody_score", 0)
                valid_count += 1
                
                for word in azure_result.get("word_results", []):
                    all_word_results.append(word)
                    if word.get("accuracy_score", 100) < 70 or word.get("error_type") != "None":
                        problem_words.append(word)
        
        # Calculate averages
        avg_pron = total_pron_score / valid_count if valid_count > 0 else 0
        avg_accuracy = total_accuracy / valid_count if valid_count > 0 else 0
        avg_fluency = total_fluency / valid_count if valid_count > 0 else 0
        avg_completeness = total_completeness / valid_count if valid_count > 0 else 0
        avg_prosody = total_prosody / valid_count if valid_count > 0 else 0
        
        # Map pronunciation score to IELTS band (rough mapping)
        def pron_to_band(score):
            if score >= 90: return 8.5
            if score >= 80: return 7.5
            if score >= 70: return 6.5
            if score >= 60: return 5.5
            if score >= 50: return 5.0
            return 4.5
        
        estimated_band = pron_to_band(avg_pron)
        
        # Build detailed evaluation prompt
        problem_words_text = "\n".join([
            f"- '{w['word']}': {w['accuracy_score']:.0f}% accuracy, Error: {w.get('error_type', 'None')}, "
            f"Problem sounds: {', '.join([p['phoneme'] for p in w.get('problem_phonemes', [])])}"
            for w in problem_words[:10]  # Limit to 10
        ])
        
        evaluation_prompt = f"""You are an expert IELTS speaking examiner with phonetics knowledge. Analyze this detailed pronunciation assessment.

## Azure Pronunciation Scores (Average)
- Overall Pronunciation: {avg_pron:.1f}/100
- Accuracy: {avg_accuracy:.1f}/100
- Fluency: {avg_fluency:.1f}/100
- Completeness: {avg_completeness:.1f}/100
- Prosody (rhythm/intonation): {avg_prosody:.1f}/100

## Problem Words Detected
{problem_words_text if problem_words else "No significant pronunciation issues detected."}

## Transcripts
{chr(10).join([f"Part {t.get('part')}: {t.get('transcript', '[No response]')}" for t in transcripts])}

## Task
Provide a comprehensive evaluation in JSON format:
{{
    "overall_band": <float 4.0-9.0>,
    "criteria": {{
        "fluency_coherence": <int 4-9>,
        "lexical_resource": <int 4-9>,
        "grammatical_range": <int 4-9>,
        "pronunciation": <int 4-9>
    }},
    "pronunciation_analysis": {{
        "score": {avg_pron:.1f},
        "main_issues": ["<issue 1>", "<issue 2>"],
        "swallowed_sounds": ["<list any detected>"],
        "missing_endings": ["<list words with missing final sounds>"],
        "stress_issues": ["<words with wrong stress>"]
    }},
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "mentor_notes": "<2-3 sentences of mentor-style guidance, calm and professional>",
    "practice_focus": ["<specific sound to practice>", "<specific word pattern>"],
    "try_this_next": ["<practical exercise 1>", "<practical exercise 2>"]
}}

Focus especially on pronunciation issues like:
- Swallowed sounds (not pronouncing all phonemes)
- Missing final consonants (common for non-native speakers)
- Word stress errors
- Intonation patterns"""
        
        from services.llm_compat import LlmChat, UserMessage
        import uuid
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert IELTS examiner with phonetics expertise. Respond only with valid JSON."
        )
        response = await chat.send_message(
            user_message=UserMessage(text=evaluation_prompt)
        )
        response_text = response
        
        # Parse JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        evaluation = json.loads(response_text.strip())
        
        return {
            "success": True,
            "tier": "premium",
            "tier_name": "Premium Evaluation",
            "tokens_used": 1,
            "overall_band": evaluation.get("overall_band", estimated_band),
            "criteria": evaluation.get("criteria", {}),
            "pronunciation_analysis": {
                **evaluation.get("pronunciation_analysis", {}),
                "azure_scores": {
                    "pronunciation": round(avg_pron, 1),
                    "accuracy": round(avg_accuracy, 1),
                    "fluency": round(avg_fluency, 1),
                    "completeness": round(avg_completeness, 1),
                    "prosody": round(avg_prosody, 1)
                }
            },
            "word_level_results": problem_words[:15],  # Top 15 problem words
            "strengths": evaluation.get("strengths", []),
            "weaknesses": evaluation.get("weaknesses", []),
            "mentor_notes": evaluation.get("mentor_notes", ""),
            "practice_focus": evaluation.get("practice_focus", []),
            "try_this_next": evaluation.get("try_this_next", [])
        }
        
    except Exception as e:
        print(f"Premium evaluation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "tier": "premium"
        }


async def evaluate_speaking_test(
    transcripts: List[Dict[str, Any]],
    set_data: Dict[str, Any],
    track: str,
    band_range: str
) -> Dict[str, Any]:
    """
    Evaluate speaking test using GPT-4o with Cambridge IELTS criteria.
    Hybrid approach: Rule-based scoring + GPT analysis.
    """
    if not EMERGENT_LLM_KEY:
        return {"error": "Evaluation service not configured"}
    
    try:
        from services.llm_compat import LlmChat, UserMessage
        
        # Organize transcripts by part
        part1_answers = [t for t in transcripts if t.get("part") == "1"]
        part2_answer = next((t for t in transcripts if t.get("part") == "2"), None)
        part3_answers = [t for t in transcripts if t.get("part") == "3"]
        
        # Build evaluation prompt
        evaluation_prompt = f"""You are an experienced IELTS speaking examiner. Evaluate the following speaking test responses using the official IELTS speaking assessment criteria.

## Test Information
- Track: {track.upper()}
- Target Band Range: {band_range}
- Topic: {set_data.get('title', 'General')}

## Assessment Criteria (Weight equally at 25% each)
1. Fluency and Coherence: Flow of speech, logical organization, use of cohesive devices
2. Lexical Resource: Vocabulary range, precision, idiomatic expressions
3. Grammatical Range and Accuracy: Variety of structures, accuracy
4. Pronunciation: Clear speech, natural rhythm, stress patterns

## Part 1 Responses (Introduction & Interview)
Questions asked: {len(part1_answers)}
{chr(10).join([f"Q: {a.get('question', 'N/A')}{chr(10)}A: {a.get('transcript', '[No response]')}" for a in part1_answers])}

## Part 2 Response (Long Turn)
Topic: {set_data.get('part2', {}).get('cue_card', {}).get('topic', 'N/A')}
Response: {part2_answer.get('transcript', '[No response]') if part2_answer else '[No response]'}

## Part 3 Responses (Discussion)
Questions asked: {len(part3_answers)}
{chr(10).join([f"Q: {a.get('question', 'N/A')}{chr(10)}A: {a.get('transcript', '[No response]')}" for a in part3_answers])}

## Evaluation Task
Provide a detailed evaluation in the following JSON format:
{{
    "overall_band": <float between 4.0-9.0>,
    "criteria": {{
        "fluency_coherence": <integer 4-9>,
        "lexical_resource": <integer 4-9>,
        "grammatical_range": <integer 4-9>,
        "pronunciation": <integer 4-9>
    }},
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "mistakes": [
        {{"snippet": "<problematic phrase>", "issue": "<what's wrong>", "fix": "<suggested correction>"}}
    ],
    "per_part_summary": {{
        "part1": "<brief assessment of Part 1 performance>",
        "part2": "<brief assessment of Part 2 performance>",
        "part3": "<brief assessment of Part 3 performance>"
    }},
    "mentor_notes": "<2-3 sentences of mentor-style insight, calm and professional, focused on patterns not single mistakes>",
    "try_this_next": ["<practical strategy 1>", "<practical strategy 2>"]
}}

Be fair, objective, and follow Cambridge IELTS standards strictly. Do not be overly generous or harsh.
"""
        
        from services.llm_compat import LlmChat, UserMessage
        import uuid
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an IELTS speaking examiner. Respond only with valid JSON."
        )
        response = await chat.send_message(
            user_message=UserMessage(text=evaluation_prompt)
        )
        
        # Parse JSON from response
        response_text = response
        # Extract JSON if wrapped in markdown
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        evaluation = json.loads(response_text.strip())
        
        # Add metadata
        evaluation["skill"] = "speaking"
        evaluation["track"] = track
        evaluation["band_range"] = band_range
        evaluation["set_id"] = set_data.get("set_id")
        evaluation["evaluated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Generate lesson recommendations
        evaluation["recommended_lessons"] = generate_speaking_recommendations(
            track, 
            band_range, 
            evaluation.get("weaknesses", []),
            set_data.get("topic")
        )
        
        return evaluation
        
    except Exception as e:
        print(f"Error evaluating speaking: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "error": str(e),
            "overall_band": 5.0,
            "criteria": {
                "fluency_coherence": 5,
                "lexical_resource": 5,
                "grammatical_range": 5,
                "pronunciation": 5
            },
            "strengths": ["Unable to fully evaluate"],
            "weaknesses": ["Evaluation service encountered an error"],
            "mistakes": [],
            "mentor_notes": "We couldn't complete the full evaluation. Please try again.",
            "try_this_next": []
        }


def generate_speaking_recommendations(
    track: str,
    band_range: str,
    weaknesses: List[str],
    topic: str
) -> List[Dict[str, Any]]:
    """Generate lesson recommendations based on evaluation."""
    recommendations = []
    
    # Map band ranges to course stages
    band_to_stage = {
        "4.0-5.0": "beginner",
        "5.5-6.5": "mastery",
        "7.0-9.0": "advanced"
    }
    stage = band_to_stage.get(band_range, "mastery")
    
    # Weakness-based recommendations
    weakness_lessons = {
        "fluency": {"title": "Speaking Fluency Strategies", "desc": "Practice smooth delivery"},
        "coherence": {"title": "Organizing Your Response", "desc": "Structure ideas logically"},
        "vocabulary": {"title": "Academic Vocabulary Building", "desc": "Expand word choice"},
        "lexical": {"title": "Lexical Resource Enhancement", "desc": "Use precise vocabulary"},
        "grammar": {"title": "Grammar for Speaking", "desc": "Complex structures practice"},
        "pronunciation": {"title": "Pronunciation Practice", "desc": "Clear articulation"},
        "hesitation": {"title": "Reducing Hesitation", "desc": "Speak with confidence"},
        "ideas": {"title": "Idea Development", "desc": "Expand your answers"}
    }
    
    for weakness in weaknesses[:3]:
        weakness_lower = weakness.lower()
        for key, lesson in weakness_lessons.items():
            if key in weakness_lower:
                recommendations.append({
                    "lesson_id": f"{stage}_speaking_{key}",
                    "title": lesson["title"],
                    "description": lesson["desc"],
                    "track": track,
                    "stage": stage,
                    "relevance": "weakness",
                    "url": f"/{stage}-course?section=speaking"
                })
                break
    
    # Topic-based recommendation
    if topic:
        recommendations.append({
            "lesson_id": f"{stage}_{topic}_speaking",
            "title": f"{topic.replace('_', ' ').title()} - Speaking Practice",
            "track": track,
            "stage": stage,
            "relevance": "topic",
            "url": f"/{stage}-course?module={topic}&section=speaking"
        })
    
    return recommendations[:5]


# ============ API ENDPOINTS ============

@router.get("/audio/{set_id}/{question_id}")
async def serve_question_audio(set_id: str, question_id: str):
    """Serve cached question audio."""
    cache_path = get_cached_audio_path(question_id, set_id)
    
    if not cache_path.exists():
        raise HTTPException(status_code=404, detail="Audio not found")
    
    return FileResponse(path=cache_path, media_type="audio/mpeg")


@router.get("/parts")
async def get_speaking_parts():
    """Get IELTS speaking parts information."""
    from content.speaking.speaking_sets import get_speaking_parts_info
    return {"success": True, "parts": get_speaking_parts_info()}


@router.get("/criteria")
async def get_assessment_criteria():
    """Get IELTS speaking assessment criteria."""
    from content.speaking.speaking_sets import get_assessment_criteria
    return {"success": True, "criteria": get_assessment_criteria()}


@router.get("/band-levels")
async def get_band_levels():
    """Get available band levels."""
    return {
        "success": True,
        "band_levels": [
            {"id": "4.0-5.0", "name": "Band 4.0-5.0", "description": "Foundation", "show_text": True},
            {"id": "5.5-6.5", "name": "Band 5.5-6.5", "description": "Intermediate", "show_text": False},
            {"id": "7.0-9.0", "name": "Band 7.0-9.0", "description": "Advanced", "show_text": False}
        ]
    }


@router.get("/tracks")
async def get_speaking_tracks():
    """Get available speaking tracks."""
    return {
        "success": True,
        "tracks": [
            {"id": "academic", "name": "Academic Speaking", "description": "Academic contexts and topics"},
            {"id": "general", "name": "General Training", "description": "Everyday topics and situations"}
        ]
    }


@router.get("/topics")
async def get_speaking_topics(track: Optional[str] = Query(None)):
    """Get available speaking topics."""
    from content.speaking.speaking_sets import get_speaking_topics
    topics = get_speaking_topics(track)
    return {"success": True, "topics": topics}


@router.get("/modules")
async def get_speaking_modules(
    track: Optional[str] = Query(None),
    band: Optional[str] = Query(None),
    topic: Optional[str] = Query(None)
):
    """Get available speaking modules/sets."""
    from content.speaking.speaking_sets import get_speaking_sets_filtered
    
    sets = get_speaking_sets_filtered(track=track, band_range=band, topic=topic)
    
    # Check audio cache status for each set
    modules = []
    for s in sets:
        # Count cached questions
        cached_count = 0
        total_questions = 0
        
        for q in s.get("part1", {}).get("questions", []):
            total_questions += 1
            if is_audio_cached(q["id"], s["set_id"]):
                cached_count += 1
        
        total_questions += 1  # Part 2 intro
        if is_audio_cached("part2_intro", s["set_id"]):
            cached_count += 1
            
        for q in s.get("part3", {}).get("questions", []):
            total_questions += 1
            if is_audio_cached(q["id"], s["set_id"]):
                cached_count += 1
        
        modules.append({
            "set_id": s["set_id"],
            "title": s["title"],
            "track": s["track"],
            "band_range": s["band_range"],
            "topic": s["topic"],
            "show_text": s.get("show_text", False),
            "audio_cached": cached_count,
            "total_questions": total_questions
        })
    
    return {
        "success": True,
        "total": len(modules),
        "modules": modules
    }


@router.get("/set/{set_id}")
async def get_speaking_set(
    set_id: str,
    include_audio: bool = Query(True),
    mode: str = Query("test", description="test or practice")
):
    """Get a speaking set with questions and optional audio URLs."""
    from content.speaking.speaking_sets import get_speaking_set_by_id, SPEAKING_PARTS
    
    speaking_set = get_speaking_set_by_id(set_id)
    
    if not speaking_set:
        raise HTTPException(status_code=404, detail=f"Speaking set '{set_id}' not found")
    
    examiner_voice = speaking_set.get("examiner_voice", "british_female_2")
    
    # Process Part 1
    part1_questions = []
    for q in speaking_set.get("part1", {}).get("questions", []):
        q_data = {
            "id": q["id"],
            "target_time": q.get("target_time", 15),
            "max_time": 25  # Hard cap for Part 1
        }
        
        # Only include text for Band 4-5 or if mode is practice
        if speaking_set.get("show_text", False) or mode == "practice":
            q_data["text"] = q["text"]
        
        # Generate/get audio URL
        if include_audio:
            audio_url = await generate_examiner_audio(q["text"], examiner_voice, q["id"], set_id)
            q_data["audio_url"] = audio_url
            q_data["audio_cached"] = is_audio_cached(q["id"], set_id)
        
        part1_questions.append(q_data)
    
    # Part 1 intro
    part1_intro = speaking_set.get("part1", {}).get("intro", "")
    if include_audio and part1_intro:
        part1_intro_audio = await generate_examiner_audio(part1_intro, examiner_voice, "part1_intro", set_id)
    else:
        part1_intro_audio = None
    
    # Process Part 2
    part2_data = speaking_set.get("part2", {})
    cue_card = part2_data.get("cue_card", {})
    
    # Part 2 always shows cue card text
    part2 = {
        "cue_card": cue_card,
        "follow_up": part2_data.get("follow_up", ""),
        "prep_time": SPEAKING_PARTS["part2"]["prep_time"],
        "speaking_time_max": SPEAKING_PARTS["part2"]["speaking_time_max"]
    }
    
    if include_audio:
        # Generate audio for Part 2 prompt
        part2_prompt = f"Now I'm going to give you a topic. You have one minute to prepare, and then you should speak for one to two minutes. {cue_card.get('topic', '')}"
        part2["audio_url"] = await generate_examiner_audio(part2_prompt, examiner_voice, "part2_intro", set_id)
        
        # Generate audio for follow-up
        if part2_data.get("follow_up"):
            part2["follow_up_audio_url"] = await generate_examiner_audio(
                part2_data["follow_up"], examiner_voice, "part2_followup", set_id
            )
    
    # Process Part 3
    part3_questions = []
    for q in speaking_set.get("part3", {}).get("questions", []):
        q_data = {
            "id": q["id"],
            "target_time": q.get("target_time", 45),
            "max_time": 75  # Hard cap for Part 3
        }
        
        if speaking_set.get("show_text", False) or mode == "practice":
            q_data["text"] = q["text"]
        
        if include_audio:
            audio_url = await generate_examiner_audio(q["text"], examiner_voice, q["id"], set_id)
            q_data["audio_url"] = audio_url
            q_data["audio_cached"] = is_audio_cached(q["id"], set_id)
        
        part3_questions.append(q_data)
    
    # Part 3 intro
    part3_intro = speaking_set.get("part3", {}).get("intro", "")
    if include_audio and part3_intro:
        part3_intro_audio = await generate_examiner_audio(part3_intro, examiner_voice, "part3_intro", set_id)
    else:
        part3_intro_audio = None
    
    return {
        "success": True,
        "set": {
            "set_id": set_id,
            "title": speaking_set["title"],
            "track": speaking_set["track"],
            "band_range": speaking_set["band_range"],
            "topic": speaking_set["topic"],
            "show_text": speaking_set.get("show_text", False),
            "mode": mode,
            "examiner_voice": examiner_voice,
            "part1": {
                "name": SPEAKING_PARTS["part1"]["name"],
                "intro": part1_intro,
                "intro_audio_url": part1_intro_audio,
                "questions": part1_questions,
                "answer_time_max": SPEAKING_PARTS["part1"]["answer_time_max"]
            },
            "part2": part2,
            "part3": {
                "name": SPEAKING_PARTS["part3"]["name"],
                "intro": part3_intro,
                "intro_audio_url": part3_intro_audio,
                "questions": part3_questions,
                "answer_time_max": SPEAKING_PARTS["part3"]["answer_time_max"]
            }
        }
    }


@router.post("/transcribe")
async def transcribe_user_audio(
    audio: UploadFile = File(...),
    question_id: str = Form(...),
    part: str = Form(...)
):
    """Transcribe a single user audio recording."""
    audio_data = await audio.read()
    
    if len(audio_data) < 100:
        raise HTTPException(status_code=400, detail="Audio file too small or empty")
    
    transcript = await transcribe_audio(audio_data)
    
    if transcript is None:
        raise HTTPException(status_code=500, detail="Transcription failed")
    
    return {
        "success": True,
        "question_id": question_id,
        "part": part,
        "transcript": transcript
    }


@router.post("/score")
async def score_speaking_response(
    audio: UploadFile = File(...),
    part: str = Form("part2"),
    cue_card_prompt: str = Form(...),
    cue_card_bullets: str = Form(""),
    user_language: str = Form("en"),
    target_band: float = Form(7.0),
    duration_seconds: float = Form(0.0),
):
    """D7 Speaking Practice scoring endpoint.

    Accepts a single monologue recording (Part 1/2/3) plus cue-card context.
    Runs Azure STT + pronunciation assessment, computes local fluency
    metrics, and calls Claude Sonnet to produce a SpeakingEvaluationResult
    shaped for the D7 UI.
    """
    from schemas.speaking_evaluator import (
        SpeakingEvaluationRequest,
        SpeakingPart,
    )
    from services.speaking_evaluator import (
        SpeakingEvaluatorFailure,
        evaluate_speaking,
    )

    audio_bytes = await audio.read()
    if len(audio_bytes) < 100:
        raise HTTPException(
            status_code=400, detail="Audio file too small or empty"
        )

    try:
        part_enum = SpeakingPart(part) if part else SpeakingPart.part2
    except ValueError:
        part_enum = SpeakingPart.part2

    bullets: List[str] = []
    if cue_card_bullets:
        bullets = [
            b.strip()
            for b in cue_card_bullets.replace("\r", "").split("\n")
            if b.strip()
        ]

    try:
        req = SpeakingEvaluationRequest(
            part=part_enum,
            cue_card_prompt=cue_card_prompt,
            cue_card_bullets=bullets,
            user_language=user_language,
            target_band=target_band,
            duration_seconds=duration_seconds if duration_seconds > 0 else None,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"invalid request: {exc}")

    try:
        result = await evaluate_speaking(req, audio_bytes)
    except SpeakingEvaluatorFailure as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "error": "speaking_evaluator_failed",
                "message": str(exc),
                "attempts": exc.attempts,
                "last_error": exc.last_error,
            },
        )

    return result.model_dump()


@router.get("/evaluation-tiers")
async def get_evaluation_tiers():
    """Get available evaluation tiers and their features."""
    return {
        "success": True,
        "tiers": EVALUATION_TIERS,
        "token_info": {
            "1_credit": "5 tokens",
            "premium_cost": "1 token per evaluation"
        }
    }


@router.post("/submit")
async def submit_speaking_test(
    set_id: str = Body(...),
    track: str = Body(...),
    band_range: str = Body(...),
    answers: List[Dict[str, Any]] = Body(...),
    evaluation_tier: str = Body("free"),
    user_id: Optional[str] = Body(None)
):
    """
    Submit completed speaking test for evaluation.
    
    Args:
        set_id: Speaking set ID
        track: academic or general
        band_range: Target band range
        answers: List of answers with transcripts
        evaluation_tier: "free" or "premium"
        user_id: User ID for token deduction (premium only)
    
    Expected answers format:
    [
        {"part": "1", "question_id": "p1q1", "transcript": "...", "question": "...", "audio_data": "base64..."},
        {"part": "2", "question_id": "part2", "transcript": "...", "audio_data": "base64..."},
        {"part": "3", "question_id": "p3q1", "transcript": "...", "question": "...", "audio_data": "base64..."},
        ...
    ]
    """
    from content.speaking.speaking_sets import get_speaking_set_by_id
    from motor.motor_asyncio import AsyncIOMotorClient
    import os
    
    speaking_set = get_speaking_set_by_id(set_id)
    
    if not speaking_set:
        raise HTTPException(status_code=404, detail=f"Speaking set '{set_id}' not found")
    
    # Validate evaluation tier
    if evaluation_tier not in ["free", "premium"]:
        evaluation_tier = "free"
    
    # FREE TIER: Basic evaluation with Whisper + GPT-4o
    if evaluation_tier == "free":
        evaluation = await evaluate_speaking_free(
            transcripts=answers,
            set_data=speaking_set,
            track=track,
            band_range=band_range
        )
        return {
            "success": True,
            **evaluation
        }
    
    # PREMIUM TIER: Azure Pronunciation Assessment + GPT-4o
    if evaluation_tier == "premium":
        # IELTS Ace plan model (2026-04-28): Monthly + Exam Pack (and admins)
        # are entitled to premium pronunciation eval as part of their plan, no
        # examCredits deduction. The legacy GE flow still falls back to the
        # examCredits counter so existing GE users aren't broken.
        from plan_access import normalize_plan_name, is_admin_user
        IELTS_ACE_PREMIUM_PLANS = {"monthly", "exam"}
        remaining_credits = None

        if user_id:
            try:
                mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
                db_name = os.environ.get("DB_NAME", "ielts_database")
                client = AsyncIOMotorClient(mongo_url)
                db = client[db_name]

                user_doc = await db.users.find_one(
                    {"id": user_id},
                    {"_id": 0, "examCredits": 1, "plan": 1, "email": 1}
                )
                user_plan = normalize_plan_name(user_doc.get("plan") if user_doc else None)
                user_email = (user_doc or {}).get("email", "")
                plan_entitled = user_plan in IELTS_ACE_PREMIUM_PLANS or is_admin_user(user_email)

                if plan_entitled:
                    # Plan-based access — no credit deduction. Surface remaining
                    # examCredits if any so the UI badge stays consistent.
                    remaining_credits = (user_doc or {}).get("examCredits", 0)
                    print(f"Premium evaluation: User {user_id} entitled via plan '{user_plan}'.")
                else:
                    # Fall back to examCredits deduction (legacy GE flow + any
                    # IELTS Ace user who topped up credits separately).
                    result = await db.users.find_one_and_update(
                        {"id": user_id, "examCredits": {"$gt": 0}},
                        {"$inc": {"examCredits": -1}},
                        return_document=True,
                        projection={"_id": 0, "examCredits": 1}
                    )

                    if result:
                        remaining_credits = result.get("examCredits", 0)
                        print(f"Premium evaluation: User {user_id} charged 1 credit. Remaining: {remaining_credits}")
                    elif user_doc:
                        return {
                            "success": False,
                            "error": "Insufficient credits for premium evaluation",
                            "tier": "premium",
                            "credits_needed": 1,
                            "current_credits": user_doc.get("examCredits", 0),
                            "message": "Upgrade to Monthly or Exam Pack for premium pronunciation eval, or use the free evaluation option."
                        }
                    else:
                        print(f"User {user_id} not found, allowing premium evaluation anyway")

                client.close()
            except Exception as e:
                print(f"Token check error: {e}")
                # Continue without token check on error
        
        # Process each answer with Azure Pronunciation Assessment
        azure_results = []
        
        for answer in answers:
            # Get reference text (question text)
            reference_text = answer.get("question", "")
            if not reference_text:
                # Try to get from set data
                part = answer.get("part", "1")
                q_id = answer.get("question_id", "")
                
                if part == "1":
                    for q in speaking_set.get("part1", {}).get("questions", []):
                        if q["id"] == q_id:
                            reference_text = q["text"]
                            break
                elif part == "2":
                    reference_text = speaking_set.get("part2", {}).get("cue_card", {}).get("topic", "")
                elif part == "3":
                    for q in speaking_set.get("part3", {}).get("questions", []):
                        if q["id"] == q_id:
                            reference_text = q["text"]
                            break
            
            # If audio_data is provided (base64), use Azure assessment
            audio_data_b64 = answer.get("audio_data")
            if audio_data_b64 and reference_text:
                try:
                    audio_bytes = base64.b64decode(audio_data_b64)
                    azure_result = await azure_pronunciation_assessment(
                        audio_data=audio_bytes,
                        reference_text=answer.get("transcript", reference_text),  # Use transcript as reference
                        language="en-US"
                    )
                    azure_results.append(azure_result)
                except Exception as e:
                    print(f"Azure assessment error for {answer.get('question_id')}: {e}")
                    azure_results.append({"success": False, "error": str(e)})
            else:
                # No audio data, create placeholder
                azure_results.append({
                    "success": False,
                    "error": "No audio data provided"
                })
        
        # Evaluate with premium features
        evaluation = await evaluate_speaking_premium(
            transcripts=answers,
            azure_results=azure_results,
            set_data=speaking_set,
            track=track,
            band_range=band_range
        )
        
        # Add remaining credits info if available
        if remaining_credits is not None:
            evaluation["remaining_credits"] = remaining_credits
        
        return {
            "success": True,
            **evaluation
        }
    
    # Fallback to old evaluation (should not reach here)
    evaluation = await evaluate_speaking_test(
        transcripts=answers,
        set_data=speaking_set,
        track=track,
        band_range=band_range
    )
    
    return {
        "success": True,
        **evaluation
    }


@router.post("/generate-all-audio")
async def generate_all_speaking_audio(
    force: bool = Query(False, description="Force regenerate even if cached")
):
    """Pre-generate audio for all speaking questions."""
    from content.speaking.speaking_sets import get_all_speaking_sets
    
    all_sets = get_all_speaking_sets()
    results = []
    generated_count = 0
    cached_count = 0
    
    for s in all_sets:
        set_id = s["set_id"]
        examiner_voice = s.get("examiner_voice", "british_female_2")
        set_results = {"set_id": set_id, "questions": []}
        
        # Part 1 intro
        intro = s.get("part1", {}).get("intro", "")
        if intro:
            if not force and is_audio_cached("part1_intro", set_id):
                cached_count += 1
                set_results["questions"].append({"id": "part1_intro", "status": "cached"})
            else:
                await generate_examiner_audio(intro, examiner_voice, "part1_intro", set_id)
                generated_count += 1
                set_results["questions"].append({"id": "part1_intro", "status": "generated"})
        
        # Part 1 questions
        for q in s.get("part1", {}).get("questions", []):
            if not force and is_audio_cached(q["id"], set_id):
                cached_count += 1
                set_results["questions"].append({"id": q["id"], "status": "cached"})
            else:
                await generate_examiner_audio(q["text"], examiner_voice, q["id"], set_id)
                generated_count += 1
                set_results["questions"].append({"id": q["id"], "status": "generated"})
        
        # Part 2
        cue_card = s.get("part2", {}).get("cue_card", {})
        part2_prompt = f"Now I'm going to give you a topic. You have one minute to prepare, and then you should speak for one to two minutes. {cue_card.get('topic', '')}"
        if not force and is_audio_cached("part2_intro", set_id):
            cached_count += 1
        else:
            await generate_examiner_audio(part2_prompt, examiner_voice, "part2_intro", set_id)
            generated_count += 1
        
        follow_up = s.get("part2", {}).get("follow_up", "")
        if follow_up:
            if not force and is_audio_cached("part2_followup", set_id):
                cached_count += 1
            else:
                await generate_examiner_audio(follow_up, examiner_voice, "part2_followup", set_id)
                generated_count += 1
        
        # Part 3 intro
        intro3 = s.get("part3", {}).get("intro", "")
        if intro3:
            if not force and is_audio_cached("part3_intro", set_id):
                cached_count += 1
            else:
                await generate_examiner_audio(intro3, examiner_voice, "part3_intro", set_id)
                generated_count += 1
        
        # Part 3 questions
        for q in s.get("part3", {}).get("questions", []):
            if not force and is_audio_cached(q["id"], set_id):
                cached_count += 1
            else:
                await generate_examiner_audio(q["text"], examiner_voice, q["id"], set_id)
                generated_count += 1
        
        results.append(set_results)
    
    return {
        "success": True,
        "total_sets": len(all_sets),
        "generated": generated_count,
        "cached": cached_count,
        "results": results
    }


@router.get("/cache-status")
async def get_cache_status():
    """Get speaking audio cache status."""
    from content.speaking.speaking_sets import get_all_speaking_sets
    
    all_sets = get_all_speaking_sets()
    total_questions = 0
    cached_questions = 0
    
    for s in all_sets:
        set_id = s["set_id"]
        
        # Count Part 1
        if s.get("part1", {}).get("intro"):
            total_questions += 1
            if is_audio_cached("part1_intro", set_id):
                cached_questions += 1
        
        for q in s.get("part1", {}).get("questions", []):
            total_questions += 1
            if is_audio_cached(q["id"], set_id):
                cached_questions += 1
        
        # Part 2
        total_questions += 2  # intro + follow-up
        if is_audio_cached("part2_intro", set_id):
            cached_questions += 1
        if is_audio_cached("part2_followup", set_id):
            cached_questions += 1
        
        # Part 3
        if s.get("part3", {}).get("intro"):
            total_questions += 1
            if is_audio_cached("part3_intro", set_id):
                cached_questions += 1
        
        for q in s.get("part3", {}).get("questions", []):
            total_questions += 1
            if is_audio_cached(q["id"], set_id):
                cached_questions += 1
    
    # Get cache directory size
    total_size = sum(f.stat().st_size for f in AUDIO_CACHE_DIR.glob("*.mp3") if f.is_file())
    
    return {
        "success": True,
        "total_sets": len(all_sets),
        "total_questions": total_questions,
        "cached_questions": cached_questions,
        "cache_percentage": round((cached_questions / total_questions) * 100, 1) if total_questions > 0 else 0,
        "cache_size_mb": round(total_size / (1024 * 1024), 2)
    }
