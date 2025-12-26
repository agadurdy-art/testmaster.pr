#!/usr/bin/env python3
"""
ElevenLabs Multi-Speaker TTS Generator
High-quality, natural-sounding conversation audio for IELTS listening practice.
"""

import os
import io
import base64
from typing import List, Dict, Tuple
from pydub import AudioSegment
from elevenlabs import ElevenLabs
from elevenlabs import VoiceSettings

# API Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "sk_6d53acc086b064e9d104119ba83ff0dd4d85a7e5141420e7")

# Voice Pool - Natural, diverse voices
VOICE_POOL = {
    # British Voices (Primary for IELTS)
    "british_male": "JBFqnCBsd6RMkjVDRZzb",      # George - Warm storyteller
    "british_female": "Xb7hH8MSUJpSbSDYk0k2",    # Alice - Clear educator
    "british_male_2": "onwK4e9ZLuTAKqWW03F9",    # Daniel - Steady broadcaster
    "british_female_2": "pFZP5JQG7iQjIQuC4Bku",  # Lily - Velvety actress
    
    # Young Voices (for students/children context)
    "young_female": "cgSgspJ2msm6clMCkdW9",      # Jessica - Playful, bright
    "young_male": "bIHbv24MWmeRgasZH58o",        # Will - Relaxed optimist
    "young_female_2": "FGY2WhTYpPnrIDTdsKH5",    # Laura - Enthusiast
    "young_male_2": "TX3LPaxmHKxFdv7VOQHJ",      # Liam - Energetic
    
    # American Voices (variety)
    "american_female": "EXAVITQu4vr4xnSDxMaL",   # Sarah - Mature, reassuring
    "american_male": "cjVigY5qzO86Huf0OWal",     # Eric - Smooth, trustworthy
}

# Speaker Role Assignments - optimized for natural dialogue
SPEAKER_VOICES = {
    # Generic roles
    "Woman": "british_female",
    "Man": "british_male",
    "Customer": "british_female",
    "Waiter": "british_male",
    "Shop assistant": "american_female",
    "Doctor": "british_male_2",
    "Patient": "british_female",
    "Teacher": "british_male_2",
    "Student": "young_female",
    "Student 1": "young_female",
    "Student 2": "young_male",
    "Student 3": "young_female_2",
    "Agent": "american_female",
    "Visitor": "british_female",
    "Bank clerk": "british_male",
    "Staff": "british_male_2",
    "Passenger": "british_female",
    "Interviewer": "british_male_2",
    "Maria": "young_female",
    "John": "young_male",
    "Presenter": "british_male_2",
    
    # Education context - younger voices
    "Sophie": "young_female",
    "David": "young_male",
    "Lisa": "young_female_2",
    "Tom": "young_male_2",
    "Sarah": "british_female",
}

# Pause durations (milliseconds)
PAUSE_SHORT = 150
PAUSE_MEDIUM = 300
PAUSE_LONG = 450


def get_voice_id(speaker: str) -> str:
    """Get ElevenLabs voice ID for a speaker role."""
    voice_key = SPEAKER_VOICES.get(speaker, "british_female")
    return VOICE_POOL.get(voice_key, VOICE_POOL["british_female"])


def parse_dialogue(transcript: str) -> List[Dict]:
    """Parse transcript into speaker turns."""
    turns = []
    lines = transcript.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
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


def synthesize_turn(client: ElevenLabs, text: str, voice_id: str) -> bytes:
    """Synthesize a single turn using ElevenLabs TTS."""
    voice_settings = VoiceSettings(
        stability=0.5,           # Natural variation
        similarity_boost=0.75,   # Voice consistency
        style=0.3,               # Some expressiveness
        use_speaker_boost=True   # Clarity
    )
    
    audio_generator = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id="eleven_multilingual_v2",
        voice_settings=voice_settings
    )
    
    # Collect audio data
    audio_data = b""
    for chunk in audio_generator:
        audio_data += chunk
    
    return audio_data


def create_silence(duration_ms: int) -> AudioSegment:
    """Create a silent audio segment."""
    return AudioSegment.silent(duration=duration_ms)


def determine_pause(current_text: str, next_text: str = None) -> int:
    """Determine pause duration based on context."""
    if next_text is None:
        return 0
    
    # Question -> longer pause
    if current_text.rstrip().endswith('?'):
        return PAUSE_MEDIUM
    
    # Exclamation or greeting -> shorter pause
    if current_text.rstrip().endswith('!'):
        return PAUSE_SHORT
    
    # Short response indicators
    short_starters = ['yes', 'no', 'okay', 'sure', 'right', 'oh', 'hi', 'hello', 'thanks', 'thank']
    if next_text and any(next_text.lower().startswith(s) for s in short_starters):
        return PAUSE_SHORT
    
    return PAUSE_MEDIUM


def stitch_audio_turns(audio_segments: List[Tuple[bytes, int]]) -> bytes:
    """Stitch multiple audio turns with pauses between them."""
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
    combined.export(output, format="mp3", bitrate="128k")
    return output.getvalue()


def generate_elevenlabs_audio(transcript: str) -> bytes:
    """Generate multi-speaker audio from transcript using ElevenLabs."""
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    
    # Parse the transcript into turns
    turns = parse_dialogue(transcript)
    
    if not turns:
        raise ValueError("No valid dialogue turns found in transcript")
    
    # Generate audio for each turn
    audio_segments = []
    
    for i, turn in enumerate(turns):
        speaker = turn["speaker"]
        text = turn["text"]
        
        # Get voice ID for speaker
        voice_id = get_voice_id(speaker)
        
        print(f"  Generating: {speaker} ({text[:30]}...)")
        
        # Synthesize this turn
        audio_bytes = synthesize_turn(client, text, voice_id)
        
        # Determine pause after this turn
        next_text = turns[i + 1]["text"] if i < len(turns) - 1 else None
        pause_ms = determine_pause(text, next_text)
        
        audio_segments.append((audio_bytes, pause_ms))
    
    # Stitch all turns together
    combined_audio = stitch_audio_turns(audio_segments)
    
    return combined_audio


def generate_and_save(transcript: str, output_path: str) -> bool:
    """Generate audio and save to file."""
    try:
        audio_bytes = generate_elevenlabs_audio(transcript)
        with open(output_path, 'wb') as f:
            f.write(audio_bytes)
        print(f"  ✅ Saved: {output_path} ({len(audio_bytes)/1024:.1f} KB)")
        return True
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


# Test function
if __name__ == "__main__":
    test_transcript = """
Woman: Hello! My name is Sarah. What is your name?
Man: Hi Sarah. I am Tom. Nice to meet you.
Woman: Nice to meet you too. Tell me about your family, Tom.
Man: Well, my family has four people. My father, my mother, my sister, and me.
    """
    
    print("Testing ElevenLabs multi-speaker TTS...")
    audio_bytes = generate_elevenlabs_audio(test_transcript)
    
    with open("/tmp/elevenlabs_test.mp3", "wb") as f:
        f.write(audio_bytes)
    
    print(f"\n✅ Test audio saved: /tmp/elevenlabs_test.mp3 ({len(audio_bytes)/1024:.1f} KB)")
