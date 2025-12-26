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

# Voice Pool - Natural, diverse voices (Optimized for realism)
VOICE_POOL = {
    # British Voices (Primary for IELTS) - Most natural sounding
    "british_male": "JBFqnCBsd6RMkjVDRZzb",       # George - Warm storyteller, very natural
    "british_female": "pFZP5JQG7iQjIQuC4Bku",     # Lily - Velvety actress, most feminine
    "british_male_2": "onwK4e9ZLuTAKqWW03F9",     # Daniel - Steady broadcaster
    "british_female_2": "Xb7hH8MSUJpSbSDYk0k2",   # Alice - Clear educator
    
    # American Voices (Natural, warm) 
    "american_female": "EXAVITQu4vr4xnSDxMaL",    # Sarah - Mature, reassuring, very natural
    "american_female_2": "XrExE9yKIg1WjnnlVkGX",  # Matilda - Professional, knowledgeable
    "american_male": "cjVigY5qzO86Huf0OWal",      # Eric - Smooth, trustworthy
    "american_male_2": "nPczCjzI2devNBz1zQrb",    # Brian - Deep, comforting
    
    # Young Voices (for students/children context) - Bright, energetic
    "young_female": "FGY2WhTYpPnrIDTdsKH5",       # Laura - Enthusiastic, quirky
    "young_female_2": "cgSgspJ2msm6clMCkdW9",     # Jessica - Playful, bright, warm
    "young_male": "bIHbv24MWmeRgasZH58o",         # Will - Relaxed optimist
    "young_male_2": "TX3LPaxmHKxFdv7VOQHJ",       # Liam - Energetic, social
    
    # Neutral/Conversational
    "conversational_male": "CwhRBWXzGAHq8TQ4Fs17", # Roger - Laid-back, casual
    "conversational_female": "SAz9YHcvj6GT2YYXdXww", # River - Relaxed, neutral
}

# Speaker Role Assignments - optimized for natural dialogue
SPEAKER_VOICES = {
    # Generic roles - using most natural voices
    "Woman": "british_female",         # Lily - most feminine
    "Man": "british_male",             # George - warm, natural
    "Female": "american_female",       # Sarah - mature, reassuring
    "Male": "american_male",           # Eric - smooth
    
    # Service roles
    "Customer": "american_female",     # Sarah
    "Waiter": "british_male",          # George
    "Shop assistant": "british_female_2", # Alice
    "Bank clerk": "british_male_2",    # Daniel
    "Staff": "british_male_2",         # Daniel - professional
    "Passenger": "american_female",    # Sarah - natural conversation
    "Agent": "american_female_2",      # Matilda
    "Visitor": "british_female",       # Lily
    
    # Medical
    "Doctor": "american_male_2",       # Brian - comforting
    "Patient": "british_female",       # Lily
    
    # Education - using warm, clear voices
    "Teacher": "british_male_2",       # Daniel - broadcaster style
    "Presenter": "british_male_2",     # Daniel
    "Guide": "british_female",         # Lily
    "Interviewer": "british_male",     # George
    
    # Students - young, energetic voices
    "Student": "young_female_2",       # Jessica - playful
    "Student 1": "young_female",       # Laura
    "Student 2": "young_male",         # Will
    "Student 3": "young_female_2",     # Jessica
    
    # Named characters
    "Maria": "young_female",           # Laura
    "John": "young_male",              # Will
    "Sophie": "young_female_2",        # Jessica
    "David": "young_male",             # Will
    "Lisa": "young_female",            # Laura
    "Tom": "young_male_2",             # Liam
    "Sarah": "american_female",        # Sarah
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


def synthesize_turn(client: ElevenLabs, text: str, voice_id: str, more_natural: bool = True) -> bytes:
    """Synthesize a single turn using ElevenLabs TTS.
    
    Args:
        client: ElevenLabs client
        text: Text to synthesize
        voice_id: Voice ID to use
        more_natural: If True, use settings optimized for natural speech
    """
    # More natural settings with slight variations
    if more_natural:
        voice_settings = VoiceSettings(
            stability=0.35,           # Lower = more expressive variation
            similarity_boost=0.85,    # Higher = closer to original voice
            style=0.45,               # More expressiveness
            use_speaker_boost=True    # Enhanced clarity
        )
    else:
        voice_settings = VoiceSettings(
            stability=0.5,
            similarity_boost=0.75,
            style=0.3,
            use_speaker_boost=True
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
