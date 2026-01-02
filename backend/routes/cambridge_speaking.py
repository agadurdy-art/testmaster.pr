"""
Cambridge Speaking Evaluation Routes
Integrates with existing Speaking QB evaluation system
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List, Dict, Any
import os
import json
from pathlib import Path
import tempfile

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
    question_index: int = Form(...),
    evaluation_type: str = Form("free")  # "free" or "premium"
):
    """
    Evaluate a single speaking response.
    Free tier: Basic transcription + GPT-4o feedback
    Premium tier: Azure pronunciation assessment + detailed analysis
    """
    try:
        # Save audio temporarily
        audio_content = await audio.read()
        
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_file:
            temp_file.write(audio_content)
            temp_path = temp_file.name
        
        result = {}
        
        if evaluation_type == "premium" and AZURE_SPEECH_KEY:
            # Premium evaluation with Azure
            result = await evaluate_with_azure(temp_path, question)
        else:
            # Free evaluation with Whisper + GPT-4o
            result = await evaluate_with_gpt(temp_path, question, part)
        
        # Cleanup
        os.unlink(temp_path)
        
        return result
        
    except Exception as e:
        print(f"Evaluation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def evaluate_with_gpt(audio_path: str, question: str, part: int) -> Dict[str, Any]:
    """Free tier evaluation using GPT-4o"""
    if not EMERGENT_LLM_KEY:
        return {"error": "Evaluation service not configured", "success": False}
    
    try:
        from emergentintegrations.llm.openai import LlmChat, UserMessage
        import uuid
        
        # Transcribe using Whisper via emergentintegrations
        from openai import OpenAI
        
        # Create client with emergent key
        client = OpenAI(
            api_key=EMERGENT_LLM_KEY,
            base_url="https://api.openai.com/v1"  # Use OpenAI endpoint with Emergent key
        )
        
        try:
            with open(audio_path, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            
            transcript = transcription if isinstance(transcription, str) else transcription
        except Exception as whisper_error:
            print(f"Whisper transcription error: {whisper_error}")
            transcript = "[Could not transcribe audio]"
        
        word_count = len(transcript.split()) if transcript else 0
        
        # Evaluate with GPT-4o via emergentintegrations
        evaluation_prompt = f"""You are an IELTS speaking examiner. Evaluate this Part {part} response.

## Question
{question}

## Student's Response (transcribed)
{transcript}

## Task
Provide evaluation in JSON format:
{{
    "fluency": <float 1.0-9.0>,
    "vocabulary": <float 1.0-9.0>,
    "grammar": <float 1.0-9.0>,
    "pronunciation_estimate": <float 1.0-9.0>,
    "overall_band": <float 1.0-9.0>,
    "feedback": "<2-3 sentence constructive feedback>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<improvement 1>", "<improvement 2>"],
    "sample_response": "<brief model response excerpt>"
}}

Be fair and encouraging. Focus on IELTS criteria."""
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an IELTS examiner. Respond only with valid JSON."
        )
        
        response = await chat.send_message(
            user_message=UserMessage(text=evaluation_prompt)
        )
        
        # Parse JSON
        response_text = response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        evaluation = json.loads(response_text.strip())
        
        return {
            "success": True,
            "tier": "free",
            "transcript": transcript,
            "word_count": word_count,
            "evaluation": evaluation,
            "overall_band": evaluation.get("overall_band", 5.0),
            "feedback": evaluation.get("feedback", ""),
            "strengths": evaluation.get("strengths", []),
            "improvements": evaluation.get("improvements", []),
            "scores": {
                "fluency": evaluation.get("fluency", 5.0),
                "vocabulary": evaluation.get("vocabulary", 5.0),
                "grammar": evaluation.get("grammar", 5.0),
                "pronunciation_estimate": evaluation.get("pronunciation_estimate", 5.0)
            }
        }
        
    except Exception as e:
        print(f"GPT evaluation error: {str(e)}")
        return {"success": False, "error": str(e)}


async def evaluate_with_azure(audio_path: str, reference_text: str) -> Dict[str, Any]:
    """Premium tier evaluation using Azure Pronunciation Assessment"""
    if not AZURE_SPEECH_KEY:
        return {"error": "Azure Speech not configured", "success": False}
    
    try:
        import azure.cognitiveservices.speech as speechsdk
        import subprocess
        
        # Convert to WAV for Azure
        temp_wav = audio_path.replace(".webm", ".wav")
        
        try:
            subprocess.run([
                'ffmpeg', '-y', '-i', audio_path,
                '-acodec', 'pcm_s16le', '-ac', '1', '-ar', '16000',
                temp_wav
            ], capture_output=True, check=True)
        except Exception as e:
            # Try pydub as fallback
            from pydub import AudioSegment
            audio = AudioSegment.from_file(audio_path)
            audio = audio.set_channels(1).set_frame_rate(16000)
            audio.export(temp_wav, format="wav")
        
        # Azure configuration
        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SPEECH_KEY,
            region=AZURE_SPEECH_REGION
        )
        
        audio_config = speechsdk.AudioConfig(filename=temp_wav)
        speech_recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config,
            audio_config=audio_config
        )
        
        # Pronunciation assessment
        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=reference_text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
            enable_miscue=True
        )
        pronunciation_config.enable_prosody_assessment()
        pronunciation_config.apply_to(speech_recognizer)
        
        result = speech_recognizer.recognize_once()
        
        # Cleanup
        os.unlink(temp_wav)
        
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            json_result = result.properties.get(
                speechsdk.PropertyId.SpeechServiceResponse_JsonResult
            )
            
            if json_result:
                assessment_data = json.loads(json_result)
                nbest = assessment_data.get("NBest", [{}])
                
                if nbest:
                    pron = nbest[0].get("PronunciationAssessment", {})
                    
                    # Convert 100-point scale to IELTS band
                    def to_band(score):
                        if score >= 90: return 9.0
                        if score >= 80: return 8.0
                        if score >= 70: return 7.0
                        if score >= 60: return 6.0
                        if score >= 50: return 5.0
                        if score >= 40: return 4.0
                        return 3.0
                    
                    return {
                        "success": True,
                        "tier": "premium",
                        "transcript": nbest[0].get("Display", result.text),
                        "scores": {
                            "pronunciation": pron.get("PronScore", 0),
                            "accuracy": pron.get("AccuracyScore", 0),
                            "fluency": pron.get("FluencyScore", 0),
                            "completeness": pron.get("CompletenessScore", 0),
                            "prosody": pron.get("ProsodyScore", 0)
                        },
                        "overall_band": to_band(pron.get("PronScore", 50)),
                        "word_results": nbest[0].get("Words", [])
                    }
        
        return {
            "success": False,
            "error": "Speech not recognized",
            "tier": "premium"
        }
        
    except Exception as e:
        print(f"Azure evaluation error: {str(e)}")
        return {"success": False, "error": str(e)}


@router.post("/evaluate-full-test")
async def evaluate_full_speaking_test(
    recordings: List[Dict[str, Any]],
    test_id: str,
    evaluation_type: str = "free"
):
    """
    Evaluate all speaking parts of a test.
    Returns overall band score and detailed feedback.
    """
    try:
        results = []
        total_band = 0
        
        for recording in recordings:
            # Each recording has: part, question, audio_url
            result = await evaluate_with_gpt(
                recording.get("audio_path", ""),
                recording.get("question", ""),
                recording.get("part", 1)
            )
            results.append(result)
            if result.get("success"):
                total_band += result.get("overall_band", 5.0)
        
        avg_band = total_band / len(results) if results else 5.0
        
        return {
            "success": True,
            "test_id": test_id,
            "overall_band": round(avg_band * 2) / 2,  # Round to nearest 0.5
            "part_results": results,
            "summary": f"Your estimated speaking band is {round(avg_band * 2) / 2}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


print("✅ Cambridge Speaking evaluation routes loaded")
