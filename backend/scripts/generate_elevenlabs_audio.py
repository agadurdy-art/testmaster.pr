#!/usr/bin/env python3
"""
Generate all 14 Beginner English listening audio files using ElevenLabs.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
import sys
sys.path.insert(0, '/app/backend')

from utils.elevenlabs_tts import generate_and_save

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = 'ielts_database'
OUTPUT_DIR = '/app/frontend/public/audio/listening'

async def generate_all_elevenlabs_audio():
    """Generate ElevenLabs audio for all 14 lessons."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get all lessons
    lessons = await db.beginner_english_lessons.find({}, {"_id": 0}).to_list(100)
    lessons = sorted(lessons, key=lambda x: x.get('lesson_number', 0))
    
    print(f"Generating ElevenLabs audio for {len(lessons)} lessons...")
    print(f"Output directory: {OUTPUT_DIR}\n")
    
    success_count = 0
    fail_count = 0
    
    for lesson in lessons:
        lesson_num = lesson.get('lesson_number')
        listening = lesson.get('listening', {})
        
        if not listening or not listening.get('transcript'):
            print(f"⚠️ Lesson {lesson_num}: No listening content, skipping")
            continue
        
        output_file = f"{OUTPUT_DIR}/lesson-{lesson_num}.mp3"
        
        print(f"\n📝 Lesson {lesson_num}: {listening.get('title', 'Unknown')}")
        
        try:
            success = generate_and_save(
                transcript=listening['transcript'],
                output_path=output_file
            )
            
            if success:
                success_count += 1
            else:
                fail_count += 1
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
            fail_count += 1
    
    client.close()
    
    print(f"\n{'='*50}")
    print(f"DONE! Success: {success_count}, Failed: {fail_count}")
    print(f"Audio files saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    asyncio.run(generate_all_elevenlabs_audio())
