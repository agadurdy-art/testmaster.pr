#!/usr/bin/env python3
"""
Regenerate Beginner Course listening audio with slower speed (0.85-0.88).
Uses ElevenLabs and applies speed adjustment via pydub.
"""

import asyncio
import os
import io
from motor.motor_asyncio import AsyncIOMotorClient
from pydub import AudioSegment
from elevenlabs import ElevenLabs
from elevenlabs import VoiceSettings
from typing import List, Dict, Tuple

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "ielts_database"
OUTPUT_DIR = "/app/frontend/public/audio/listening"

# Target speed for beginners
BEGINNER_SPEED = 0.87  # Slow but not too slow

# Voice Pool
VOICE_POOL = {
    "british_male": "JBFqnCBsd6RMkjVDRZzb",      # George
    "british_female": "Xb7hH8MSUJpSbSDYk0k2",    # Alice
    "british_male_2": "onwK4e9ZLuTAKqWW03F9",    # Daniel
    "british_female_2": "pFZP5JQG7iQjIQuC4Bku",  # Lily
    "young_female": "cgSgspJ2msm6clMCkdW9",      # Jessica
    "young_male": "bIHbv24MWmeRgasZH58o",        # Will
    "young_female_2": "FGY2WhTYpPnrIDTdsKH5",    # Laura
    "young_male_2": "TX3LPaxmHKxFdv7VOQHJ",      # Liam
    "american_female": "EXAVITQu4vr4xnSDxMaL",   # Sarah
    "american_male": "cjVigY5qzO86Huf0OWal",     # Eric
}

# Speaker assignments
SPEAKER_VOICES = {
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
    "Sophie": "young_female",
    "David": "young_male",
    "Lisa": "young_female_2",
    "Tom": "young_male_2",
    "Sarah": "british_female",
}

PAUSE_SHORT = 180
PAUSE_MEDIUM = 350


def get_voice_id(speaker: str) -> str:
    voice_key = SPEAKER_VOICES.get(speaker, "british_female")
    return VOICE_POOL.get(voice_key, VOICE_POOL["british_female"])


def parse_dialogue(transcript: str) -> List[Dict]:
    turns = []
    for line in transcript.strip().split('\n'):
        line = line.strip()
        if not line or ':' not in line:
            continue
        parts = line.split(':', 1)
        if len(parts) == 2:
            speaker, text = parts[0].strip(), parts[1].strip()
            if speaker and text:
                turns.append({"speaker": speaker, "text": text})
    return turns


def synthesize_turn(client: ElevenLabs, text: str, voice_id: str) -> bytes:
    voice_settings = VoiceSettings(
        stability=0.6,           # More stable for slower speech
        similarity_boost=0.75,
        style=0.2,               # Less expressive for clarity
        use_speaker_boost=True
    )
    
    audio_generator = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id="eleven_multilingual_v2",
        voice_settings=voice_settings
    )
    
    audio_data = b""
    for chunk in audio_generator:
        audio_data += chunk
    return audio_data


def slow_down_audio(audio_data: bytes, speed: float) -> bytes:
    """Slow down audio by adjusting frame rate."""
    audio_io = io.BytesIO(audio_data)
    audio = AudioSegment.from_mp3(audio_io)
    
    if speed < 1.0:
        # Slow down by reducing frame rate, then resampling back
        new_frame_rate = int(audio.frame_rate * speed)
        slowed = audio._spawn(audio.raw_data, overrides={'frame_rate': new_frame_rate})
        audio = slowed.set_frame_rate(audio.frame_rate)
    
    output = io.BytesIO()
    audio.export(output, format="mp3", bitrate="128k")
    return output.getvalue()


def generate_multi_speaker_slow(transcript: str, speed: float = 0.87) -> bytes:
    """Generate multi-speaker audio with speed adjustment."""
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    turns = parse_dialogue(transcript)
    
    if not turns:
        raise ValueError("No valid dialogue turns")
    
    audio_segments = []
    
    for i, turn in enumerate(turns):
        speaker = turn["speaker"]
        text = turn["text"]
        voice_id = get_voice_id(speaker)
        
        print(f"    {speaker}: {text[:35]}...")
        
        # Generate audio
        audio_bytes = synthesize_turn(client, text, voice_id)
        
        # Slow down
        slowed_audio = slow_down_audio(audio_bytes, speed)
        
        # Determine pause
        next_text = turns[i + 1]["text"] if i < len(turns) - 1 else None
        pause_ms = PAUSE_MEDIUM if text.endswith('?') else PAUSE_SHORT
        if not next_text:
            pause_ms = 0
        
        audio_segments.append((slowed_audio, pause_ms))
    
    # Stitch together
    combined = AudioSegment.empty()
    for audio_bytes, pause_ms in audio_segments:
        audio_io = io.BytesIO(audio_bytes)
        segment = AudioSegment.from_mp3(audio_io)
        combined += segment
        if pause_ms > 0:
            combined += AudioSegment.silent(duration=pause_ms)
    
    output = io.BytesIO()
    combined.export(output, format="mp3", bitrate="128k")
    return output.getvalue()


async def regenerate_all():
    """Regenerate all beginner lesson audio with slower speed."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    lessons = await db.beginner_english_lessons.find({}, {"_id": 0}).to_list(100)
    lessons = sorted(lessons, key=lambda x: x.get('lesson_number', 0))
    
    print(f"Regenerating {len(lessons)} lessons with speed={BEGINNER_SPEED}...")
    print(f"Output: {OUTPUT_DIR}\n")
    
    for lesson in lessons:
        lesson_num = lesson.get('lesson_number')
        listening = lesson.get('listening', {})
        
        if not listening or not listening.get('transcript'):
            print(f"⚠️ Lesson {lesson_num}: No listening content")
            continue
        
        output_file = f"{OUTPUT_DIR}/lesson-{lesson_num}.mp3"
        
        print(f"\n📝 Lesson {lesson_num}: {listening.get('title', 'Unknown')}")
        
        try:
            audio_bytes = generate_multi_speaker_slow(
                listening['transcript'],
                speed=BEGINNER_SPEED
            )
            
            with open(output_file, 'wb') as f:
                f.write(audio_bytes)
            
            size_kb = len(audio_bytes) / 1024
            print(f"  ✅ Saved ({size_kb:.1f} KB)")
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    client.close()
    print("\n" + "="*50)
    print("Done!")


if __name__ == "__main__":
    asyncio.run(regenerate_all())
