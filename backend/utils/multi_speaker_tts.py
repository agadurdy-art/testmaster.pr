#!/usr/bin/env python3
"""
Multi-Speaker Azure TTS Audio Generator for IELTS Listening
Following the MASTER AUDIO & LISTENING GENERATION PROTOCOL

Features:
- Multi-speaker dialogues (2-5 speakers)
- Azure Neural TTS with natural voices
- Level-appropriate speed control
- Turn-by-turn generation with natural pauses
- British/American/Neutral accent mix
"""

import azure.cognitiveservices.speech as speechsdk
import os
import io
import base64
import asyncio
from typing import List, Dict, Tuple
from pydub import AudioSegment
import tempfile
import logging

logger = logging.getLogger(__name__)

# Azure Speech Configuration
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "southeastasia")

# Voice Pool - British/American/Neutral mix (60% British, 30% American, 10% Other)
VOICE_POOL = {
    # British Voices (Primary - 60%)
    "british_male_1": "en-GB-RyanNeural",       # Primary male, warm
    "british_male_2": "en-GB-ThomasNeural",     # Secondary male, professional
    "british_female_1": "en-GB-SoniaNeural",    # Primary female, friendly
    "british_female_2": "en-GB-LibbyNeural",    # Secondary female, young
    "british_female_3": "en-GB-MaisieNeural",   # Teenage female
    
    # American Voices (30%)
    "american_male_1": "en-US-GuyNeural",       # Male, casual
    "american_male_2": "en-US-DavisNeural",     # Male, professional
    "american_female_1": "en-US-JennyNeural",   # Female, friendly
    "american_female_2": "en-US-AriaNeural",    # Female, natural
    
    # Australian/Irish (10% - for variety)
    "australian_male": "en-AU-WilliamNeural",
    "australian_female": "en-AU-NatashaNeural",
    "irish_male": "en-IE-ConnorNeural",
}

# Speaker Role Assignments (consistent across course)
SPEAKER_VOICES = {
    "A": "british_female_1",    # Primary speaker - Sonia (British female)
    "B": "british_male_1",      # Secondary speaker - Ryan (British male)
    "C": "american_female_1",   # Interrupter - Jenny (American female)
    "D": "british_male_2",      # Authority figure - Thomas (British male)
    "E": "american_male_1",     # Cameo speaker - Guy (American male)
    "Man": "british_male_1",
    "Woman": "british_female_1",
    "Customer": "british_female_1",
    "Waiter": "british_male_1",
    "Shop assistant": "american_female_1",
    "Doctor": "british_male_2",
    "Patient": "british_female_1",
    "Teacher": "british_male_2",
    "Student": "british_female_2",
    "Student 1": "british_female_2",
    "Student 2": "american_male_1",
    "Student 3": "british_male_1",
    "Agent": "american_female_1",
    "Visitor": "british_female_1",
    "Bank clerk": "british_male_1",
    "Staff": "british_male_2",
    "Passenger": "british_female_1",
    "Interviewer": "british_male_2",
    "Maria": "american_female_2",
    "John": "british_male_1",
    "Presenter": "british_male_2",
}

# Level-based speed settings
LEVEL_SPEEDS = {
    "A1": 0.85,
    "A2": 0.90,
    "beginner": 0.88,
    "B1": 0.95,
    "B2": 1.0,
    "IELTS": 1.05,
    "advanced": 1.08
}

# Pause durations (milliseconds)
PAUSE_SHORT = 200      # Same topic continuation
PAUSE_MEDIUM = 400     # New response
PAUSE_LONG = 600       # Topic shift or question


def get_voice_name(speaker: str) -> str:
    """Get Azure voice name for a speaker role."""
    voice_key = SPEAKER_VOICES.get(speaker, "british_female_1")
    return VOICE_POOL.get(voice_key, "en-GB-SoniaNeural")


def get_speed_rate(level: str) -> float:
    """Get speaking rate based on level."""
    return LEVEL_SPEEDS.get(level, 0.90)


def parse_dialogue(transcript: str) -> List[Dict]:
    """Parse transcript into speaker turns.
    
    Expected format:
    Speaker: Text
    Speaker: Text
    """
    turns = []
    lines = transcript.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Try to split by colon to get speaker and text
        if ':' in line:
            parts = line.split(':', 1)
            if len(parts) == 2:
                speaker = parts[0].strip()
                text = parts[1].strip()
                if speaker and text:
                    turns.append({
                        "speaker": speaker,
                        "text": text
                    })
    
    return turns


def generate_ssml(text: str, voice: str, rate: float = 1.0) -> str:
    """Generate SSML for natural speech with prosody control."""
    # Convert rate to percentage string
    rate_str = f"{int((rate - 1) * 100):+d}%" if rate != 1.0 else "0%"
    
    ssml = f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
           xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-GB">
        <voice name="{voice}">
            <prosody rate="{rate_str}" pitch="0%">
                <mstts:express-as style="chat">
                    {text}
                </mstts:express-as>
            </prosody>
        </voice>
    </speak>"""
    
    return ssml


def synthesize_turn(text: str, voice: str, rate: float = 1.0) -> bytes:
    """Synthesize a single turn using Azure TTS."""
    if not AZURE_SPEECH_KEY:
        raise ValueError("AZURE_SPEECH_KEY not configured")
    
    speech_config = speechsdk.SpeechConfig(
        subscription=AZURE_SPEECH_KEY,
        region=AZURE_SPEECH_REGION
    )
    
    # Use high quality audio format
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    )
    
    # Create synthesizer without audio output (we want raw bytes)
    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config,
        audio_config=None
    )
    
    # Generate SSML
    ssml = generate_ssml(text, voice, rate)
    
    # Synthesize
    result = synthesizer.speak_ssml_async(ssml).get()
    
    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        return result.audio_data
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation = result.cancellation_details
        logger.error(f"Speech synthesis canceled: {cancellation.reason}")
        if cancellation.error_details:
            logger.error(f"Error details: {cancellation.error_details}")
        raise Exception(f"Speech synthesis failed: {cancellation.reason}")
    else:
        raise Exception(f"Speech synthesis failed with reason: {result.reason}")


def create_silence(duration_ms: int) -> AudioSegment:
    """Create a silent audio segment."""
    return AudioSegment.silent(duration=duration_ms)


def stitch_audio_turns(audio_segments: List[Tuple[bytes, int]]) -> bytes:
    """Stitch multiple audio turns with pauses between them.
    
    Args:
        audio_segments: List of (audio_bytes, pause_after_ms)
    
    Returns:
        Combined audio as MP3 bytes
    """
    combined = AudioSegment.empty()
    
    for i, (audio_bytes, pause_ms) in enumerate(audio_segments):
        # Convert bytes to AudioSegment
        audio_io = io.BytesIO(audio_bytes)
        segment = AudioSegment.from_mp3(audio_io)
        
        # Add the audio
        combined += segment
        
        # Add pause after (except for last segment)
        if i < len(audio_segments) - 1 and pause_ms > 0:
            combined += create_silence(pause_ms)
    
    # Export to MP3
    output = io.BytesIO()
    combined.export(output, format="mp3", bitrate="64k")
    return output.getvalue()


def determine_pause(current_text: str, next_text: str = None) -> int:
    """Determine pause duration based on context."""
    if next_text is None:
        return 0
    
    # Question -> longer pause for response
    if current_text.rstrip().endswith('?'):
        return PAUSE_MEDIUM
    
    # Short response indicators
    short_starters = ['yes', 'no', 'okay', 'sure', 'right', 'oh']
    if next_text and any(next_text.lower().startswith(s) for s in short_starters):
        return PAUSE_SHORT
    
    return PAUSE_MEDIUM


async def generate_multi_speaker_audio(
    transcript: str,
    level: str = "beginner"
) -> str:
    """Generate multi-speaker audio from transcript.
    
    Args:
        transcript: Dialogue transcript with speaker labels
        level: Course level for speed adjustment
    
    Returns:
        Base64 encoded MP3 audio
    """
    # Parse the transcript into turns
    turns = parse_dialogue(transcript)
    
    if not turns:
        raise ValueError("No valid dialogue turns found in transcript")
    
    # Get base speaking rate for level
    base_rate = get_speed_rate(level)
    
    # Generate audio for each turn
    audio_segments = []
    
    for i, turn in enumerate(turns):
        speaker = turn["speaker"]
        text = turn["text"]
        
        # Get voice for speaker
        voice = get_voice_name(speaker)
        
        # Slight speed variation per speaker for naturalness
        # Primary speakers slightly slower, others at base rate
        if speaker in ["A", "Customer", "Patient", "Visitor", "Passenger", "Student"]:
            rate = base_rate * 0.95
        else:
            rate = base_rate
        
        try:
            # Synthesize this turn
            audio_bytes = await asyncio.to_thread(
                synthesize_turn, text, voice, rate
            )
            
            # Determine pause after this turn
            next_text = turns[i + 1]["text"] if i < len(turns) - 1 else None
            pause_ms = determine_pause(text, next_text)
            
            audio_segments.append((audio_bytes, pause_ms))
            
        except Exception as e:
            logger.error(f"Failed to synthesize turn for {speaker}: {e}")
            raise
    
    # Stitch all turns together
    combined_audio = await asyncio.to_thread(stitch_audio_turns, audio_segments)
    
    # Convert to base64
    return base64.b64encode(combined_audio).decode('utf-8')


async def generate_listening_audio_for_lesson(lesson_id: str, transcript: str, level: str = "beginner") -> dict:
    """Generate and return audio data for a lesson's listening section."""
    try:
        audio_base64 = await generate_multi_speaker_audio(transcript, level)
        return {
            "lesson_id": lesson_id,
            "audio_base64": audio_base64,
            "format": "mp3",
            "level": level,
            "success": True
        }
    except Exception as e:
        logger.error(f"Failed to generate audio for lesson {lesson_id}: {e}")
        return {
            "lesson_id": lesson_id,
            "error": str(e),
            "success": False
        }


# Test function
async def test_audio_generation():
    """Test the audio generation with a sample dialogue."""
    test_transcript = """
Woman: Hello! My name is Sarah. What is your name?
Man: Hi Sarah. I am Tom. Nice to meet you.
Woman: Nice to meet you too. Do you have a big family?
Man: No, my family is small. I live with my parents. I have one sister.
Woman: Oh, that's nice. Is your sister older or younger?
Man: She is younger. She is 15 years old.
    """
    
    print("Testing multi-speaker audio generation...")
    try:
        audio_b64 = await generate_multi_speaker_audio(test_transcript, "beginner")
        print(f"✅ Generated audio: {len(audio_b64)} bytes (base64)")
        
        # Save to file for testing
        audio_bytes = base64.b64decode(audio_b64)
        with open("/tmp/test_listening.mp3", "wb") as f:
            f.write(audio_bytes)
        print("✅ Saved to /tmp/test_listening.mp3")
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    asyncio.run(test_audio_generation())
