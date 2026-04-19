"""Fix face and eye images to be clearer clip art"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Better images for face and eye
FIXED_IMAGES = {
    "face": "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",  # Clear happy face
    "eye": "https://cdn-icons-png.flaticon.com/512/3588/3588416.png",    # Clear single eye
}

async def fix_images():
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME", "ielts_database")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    levels = await db.learning_levels.find({}).to_list(None)
    
    for level in levels:
        units = level.get("units", [])
        changed = False
        
        for unit in units:
            for lesson in unit.get("lessons", []):
                content = lesson.get("content", {})
                vocabulary = content.get("vocabulary", [])
                
                for vocab in vocabulary:
                    if isinstance(vocab, dict):
                        word = vocab.get("word", "").lower().strip()
                        if word in FIXED_IMAGES:
                            vocab["visual_url"] = FIXED_IMAGES[word]
                            changed = True
                            print(f"Fixed: {word} -> {FIXED_IMAGES[word]}")
        
        if changed:
            await db.learning_levels.update_one(
                {"id": level["id"]},
                {"$set": {"units": units}}
            )
    
    print("Done!")
    client.close()

asyncio.run(fix_images())
