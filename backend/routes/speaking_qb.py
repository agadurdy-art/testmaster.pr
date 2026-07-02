"""
Speaking Question Bank API Routes
==================================
Provides endpoints for Speaking practice in the Question Bank.
Features:
- IELTS-style speaking tests (Part 1, 2, 3)
- Two tracks: Academic and General
- Audio question playback (pre-generated)
- User answer recording + transcription

Note (Faz 0, 2026-07-02): the legacy evaluation endpoints (/score,
/evaluation-tiers, /submit) were removed — they were unauthenticated and
unmetered. Evaluation now lives in routes/speaking_unified.py and
routes/speaking_practice_structured.py (auth + quota + idempotency).
azure_pronunciation_assessment stays: routes/liz_teacher.py imports it.
"""

from fastapi import APIRouter, Query, HTTPException, UploadFile, File, Form, Depends

import auth_session  # Faz 0 (2026-07-02): Whisper spend must not be anonymousfrom fastapi.responses import FileResponse
from typing import Optional, List, Dict, Any
import os
import uuid
import json
from pathlib import Path

router = APIRouter(prefix="/api/speaking", tags=["Speaking Question Bank"])

# API Keys
OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
AZURE_SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION", "southeastasia")

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

# Pre-recorded examiner audio is served as a static asset:
#   - production: /api/static/audio/speaking/<file> is 307-redirected to the
#     Cloudflare R2 CDN (see server.py static CDN swap). The .mp3 files are
#     excluded from the deploy image (backend/.dockerignore) by design — they
#     live on R2, not on the pod.
#   - local dev: the same path is served by the StaticFiles mount from the
#     committed files under backend/static/audio/speaking/.
# Either way the bytes already exist; nothing is synthesized at request time.
SPEAKING_AUDIO_URL_BASE = "/api/static/audio/speaking"

# Manifest of pre-recorded question audio that exists on R2 (basenames like
# "spk_ac_b45_001_p1q1.mp3"). Committed under backend/content/ so it ships in
# the image even though the .mp3 files themselves do not. Used to decide
# whether a question has audio, without an HTTP round-trip per question.
_AUDIO_MANIFEST_PATH = _BACKEND_DIR / "content" / "speaking" / "audio_manifest.json"
try:
    _AVAILABLE_AUDIO = set(json.loads(_AUDIO_MANIFEST_PATH.read_text()))
    print(f"✅ Speaking audio manifest loaded: {len(_AVAILABLE_AUDIO)} files")
except Exception as e:
    _AVAILABLE_AUDIO = set()
    print(f"⚠️  Speaking audio manifest missing ({e}); falling back to disk check")


def get_cached_audio_path(question_id: str, set_id: str) -> Path:
    """Get path for cached question audio."""
    return AUDIO_CACHE_DIR / f"{set_id}_{question_id}.mp3"


def is_audio_cached(question_id: str, set_id: str) -> bool:
    """True if pre-recorded audio for this question exists (on R2 per the
    manifest, or on local disk in dev)."""
    fname = f"{set_id}_{question_id}.mp3"
    if fname in _AVAILABLE_AUDIO:
        return True
    path = get_cached_audio_path(question_id, set_id)
    return path.exists() and path.stat().st_size > 100


async def generate_examiner_audio(text: str, voice_key: str, question_id: str, set_id: str) -> Optional[str]:
    """Resolve the URL of the pre-recorded examiner audio for a question.

    All speaking question audio was generated once and stored on Cloudflare R2
    (see backend/static/audio/speaking + audio_manifest.json). This function
    NEVER synthesizes audio at request time — it just returns the static URL
    when the recording exists, or None when it doesn't (the player then skips
    playback gracefully). `text`/`voice_key` are kept in the signature for
    backwards-compatibility with the batch pre-gen tooling.
    """
    if is_audio_cached(question_id, set_id):
        return f"{SPEAKING_AUDIO_URL_BASE}/{set_id}_{question_id}.mp3"
    return None


async def transcribe_audio(audio_data: bytes, language: str = "en") -> Optional[str]:
    """Transcribe audio using OpenAI Whisper (native openai SDK)."""
    if not OPENAI_KEY:
        print("OPENAI_API_KEY not configured")
        return None

    try:
        from services.openai_compat import OpenAISpeechToText

        stt = OpenAISpeechToText(api_key=OPENAI_KEY)

        # Save audio temporarily (unlink in finally — the old success-path-only
        # cleanup leaked a temp file on every failed transcription)
        temp_path = RECORDINGS_DIR / f"temp_{uuid.uuid4()}.webm"
        try:
            with open(temp_path, 'wb') as f:
                f.write(audio_data)

            with open(temp_path, 'rb') as audio_file:
                response = await stt.transcribe(
                    file=audio_file,
                    model="whisper-1",
                    language=language,
                    response_format="json"
                )
            return response.text
        finally:
            temp_path.unlink(missing_ok=True)

    except Exception as e:
        print(f"Error transcribing audio: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


async def azure_pronunciation_assessment(
    audio_data: bytes,
    reference_text: Optional[str] = None,
    language: str = "en-US",
) -> Dict[str, Any]:
    """Word/phoneme-level pronunciation assessment (legacy-shaped adapter).

    Faz 1 (2026-07-02): this used to own its own Azure pipeline built on
    `recognize_once()`, which stops at the first ~0.5s end-silence — any
    multi-sentence recording (e.g. a Liz chat voice message) was truncated to
    its first utterance and mis-scored. It also ran ffmpeg + the sync Azure
    SDK directly on the event loop. Both problems are already solved in
    services.speaking_evaluator (continuous recognition, word-weighted merge,
    asyncio.to_thread), so this is now a thin adapter that delegates there and
    re-shapes the result to the contract routes/liz_teacher.py depends on:

        {success, recognized_text, pronunciation_score, accuracy_score,
         fluency_score, completeness_score, prosody_score,
         word_results: [{word, accuracy_score, error_type,
                         problem_phonemes: [{phoneme, score} < 60]}]}
    """
    if not AZURE_SPEECH_KEY:
        print("AZURE_SPEECH_KEY not configured")
        return {"error": "Azure Speech not configured"}

    from services.speaking_evaluator import (
        run_azure_pronunciation,
        transcode_to_wav,
    )

    try:
        wav_bytes = await transcode_to_wav(audio_data)
    except Exception as e:
        return {"error": f"Audio conversion failed: {e}"}

    result = await run_azure_pronunciation(wav_bytes, reference_text or "")

    if result.get("error"):
        # Preserve the legacy NoMatch shape callers may branch on.
        if "NoMatch" in str(result["error"]):
            return {
                "success": False,
                "error": "No speech detected in audio",
                "reason": "NoMatch",
            }
        return {"success": False, "error": str(result["error"])}

    word_results = []
    for w in result.get("word_results", []) or []:
        problem_phonemes = [
            {"phoneme": ph.get("phoneme", ""), "score": ph.get("score", 100)}
            for ph in (w.get("phonemes") or [])
            if (ph.get("score") or 100) < 60
        ]
        word_results.append({
            "word": w.get("word", ""),
            "accuracy_score": w.get("accuracy", 0),
            "error_type": w.get("error_type", "None"),
            "problem_phonemes": problem_phonemes,
        })

    return {
        "success": True,
        "recognized_text": result.get("recognized_text", ""),
        "pronunciation_score": result.get("pron_score", 0),
        "accuracy_score": result.get("accuracy_score", 0),
        "fluency_score": result.get("fluency_score", 0),
        "completeness_score": result.get("completeness_score", 0),
        "prosody_score": result.get("prosody_score", 0),
        "word_results": word_results,
    }


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
    part: str = Form(...),
    _caller: dict = Depends(auth_session.current_user),
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
