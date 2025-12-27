#!/usr/bin/env python3
"""
Database Sync Script - Run this to seed all course data
Can be called via: python3 sync_database.py
Or via API: POST /api/admin/sync-database
"""
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ielts_database')

async def sync_all_courses():
    """Sync all course data to database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=" * 60)
    print("DATABASE SYNC - Starting...")
    print("=" * 60)
    
    results = {}
    
    # 1. Sync Advanced Mastery (20 modules)
    print("\n📚 Syncing Advanced Mastery...")
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
    print("\n📖 Syncing Mastery...")
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
    
    # 3. Sync Beginner (14 lessons)
    print("\n🎯 Syncing Beginner...")
    try:
        from seed_beginner_english import BEGINNER_LESSONS
        await db.beginner_english_lessons.delete_many({})
        for lesson in BEGINNER_LESSONS:
            await db.beginner_english_lessons.update_one(
                {"id": lesson["id"]}, {"$set": lesson}, upsert=True
            )
        count = await db.beginner_english_lessons.count_documents({})
        print(f"   ✅ Beginner: {count} lessons")
        results["beginner"] = count
    except Exception as e:
        print(f"   ❌ Error: {e}")
        results["beginner_error"] = str(e)
    
    client.close()
    
    print("\n" + "=" * 60)
    print("DATABASE SYNC - Complete!")
    print("=" * 60)
    print(f"\nResults: {results}")
    
    return results

if __name__ == "__main__":
    asyncio.run(sync_all_courses())
