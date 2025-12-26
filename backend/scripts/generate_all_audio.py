#!/usr/bin/env python3
"""
Pre-generate all listening audio files and save to frontend public folder.
"""

import asyncio
import os
import base64
from motor.motor_asyncio import AsyncIOMotorClient
import sys
sys.path.insert(0, '/app/backend')

# Set env vars
os.environ['AZURE_SPEECH_KEY'] = '1hY5f5IAc41MMosSc3hi2sivkeocOOkJgvoCS1qPGzX5kqSgc3fgJQQJ99BLACqBBLyXJ3w3AAAYACOGa5YK'
os.environ['AZURE_SPEECH_REGION'] = 'southeastasia'

from utils.multi_speaker_tts import generate_multi_speaker_audio

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = 'ielts_database'
OUTPUT_DIR = '/app/frontend/public/audio/listening'

async def generate_all_audio():
    """Generate audio for all 14 lessons and save to files."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get all lessons
    lessons = await db.beginner_english_lessons.find({}, {"_id": 0}).to_list(100)
    lessons = sorted(lessons, key=lambda x: x.get('lesson_number', 0))
    
    print(f"Generating audio for {len(lessons)} lessons...")
    print(f"Output directory: {OUTPUT_DIR}\n")
    
    for lesson in lessons:
        lesson_id = lesson.get('id')
        lesson_num = lesson.get('lesson_number')
        listening = lesson.get('listening', {})
        
        if not listening or not listening.get('transcript'):
            print(f"  ⚠️ Lesson {lesson_num}: No listening content, skipping")
            continue
        
        output_file = f"{OUTPUT_DIR}/lesson-{lesson_num}.mp3"
        
        # Check if already exists
        if os.path.exists(output_file):
            print(f"  ⏭️ Lesson {lesson_num}: Already exists, skipping")
            continue
        
        try:
            print(f"  🔄 Lesson {lesson_num}: Generating audio...", end=" ", flush=True)
            
            audio_base64 = await generate_multi_speaker_audio(
                transcript=listening['transcript'],
                level="beginner"
            )
            
            # Decode and save
            audio_bytes = base64.b64decode(audio_base64)
            with open(output_file, 'wb') as f:
                f.write(audio_bytes)
            
            size_kb = len(audio_bytes) / 1024
            print(f"✅ Saved ({size_kb:.1f} KB)")
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    client.close()
    print("\nDone! Audio files saved to:", OUTPUT_DIR)

if __name__ == "__main__":
    asyncio.run(generate_all_audio())
