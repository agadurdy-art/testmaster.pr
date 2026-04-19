#!/usr/bin/env python3
"""
Database Sync Script - Comprehensive sync for all course data
This script ensures all course data is properly seeded including listening sections.

Usage:
    python3 sync_database.py

This script will:
1. Seed Advanced Mastery (20 modules)
2. Seed Mastery (17 modules) 
3. Seed Beginner (14 lessons with listening)
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ielts_database')

async def sync_all_courses():
    """Sync all course data to database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=" * 60)
    print("DATABASE SYNC - Starting...")
    print(f"Database: {DB_NAME}")
    print("=" * 60)
    
    results = {}
    
    # 1. Sync Advanced Mastery (20 modules)
    print("\n📚 Syncing Advanced Mastery (20 modules)...")
    try:
        from seed_advanced_mastery import ADVANCED_MODULES
        await db.advanced_mastery_modules.delete_many({})
        for module in ADVANCED_MODULES:
            await db.advanced_mastery_modules.update_one(
                {"id": module["id"]}, {"$set": module}, upsert=True
            )
        count = await db.advanced_mastery_modules.count_documents({})
        print(f"   ✅ Advanced Mastery: {count} modules")
        results["advanced_mastery"] = count
    except Exception as e:
        print(f"   ❌ Error: {e}")
        results["advanced_mastery_error"] = str(e)
    
    # 2. Sync Mastery (17 modules)
    print("\n📖 Syncing Mastery (17 modules)...")
    try:
        from seed_mastery_course import MASTERY_MODULES
        await db.mastery_course_modules.delete_many({})
        for module in MASTERY_MODULES:
            await db.mastery_course_modules.update_one(
                {"id": module["id"]}, {"$set": module}, upsert=True
            )
        count = await db.mastery_course_modules.count_documents({})
        print(f"   ✅ Mastery: {count} modules")
        results["mastery"] = count
    except Exception as e:
        print(f"   ❌ Error: {e}")
        results["mastery_error"] = str(e)
    
    # 3. Sync Beginner WITH LISTENING (14 lessons)
    print("\n🎯 Syncing Beginner with Listening (14 lessons)...")
    try:
        from seed_beginner_english import BEGINNER_LESSONS
        await db.beginner_english_lessons.delete_many({})
        for lesson in BEGINNER_LESSONS:
            await db.beginner_english_lessons.update_one(
                {"id": lesson["id"]}, {"$set": lesson}, upsert=True
            )
        count = await db.beginner_english_lessons.count_documents({})
        
        # Verify listening data
        with_listening = 0
        async for lesson in db.beginner_english_lessons.find({"listening": {"$exists": True}}):
            with_listening += 1
        
        print(f"   ✅ Beginner: {count} lessons ({with_listening} with listening)")
        results["beginner"] = count
        results["beginner_with_listening"] = with_listening
    except Exception as e:
        print(f"   ❌ Error: {e}")
        results["beginner_error"] = str(e)
    
    client.close()
    
    print("\n" + "=" * 60)
    print("DATABASE SYNC - Complete!")
    print("=" * 60)
    print(f"\nResults: {results}")
    
    # Summary
    print("\n📊 Summary:")
    print(f"   Advanced Mastery: {results.get('advanced_mastery', 'ERROR')} modules")
    print(f"   Mastery: {results.get('mastery', 'ERROR')} modules")
    print(f"   Beginner: {results.get('beginner', 'ERROR')} lessons")
    print(f"   Beginner with Listening: {results.get('beginner_with_listening', 'ERROR')}")
    
    return results

if __name__ == "__main__":
    asyncio.run(sync_all_courses())
