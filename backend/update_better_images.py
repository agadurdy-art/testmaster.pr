"""Update vocabulary images with better, cleaner clip art"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Better clip art images - more child-friendly and clear
BETTER_IMAGES = {
    "head": "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",  # Clear cartoon head
    "face": "https://cdn-icons-png.flaticon.com/512/4139/4139980.png",  # Smiling face  
    "hair": "https://cdn-icons-png.flaticon.com/512/4723/4723907.png",  # Hair style
    "eye": "https://cdn-icons-png.flaticon.com/512/6134/6134106.png",   # Single eye clear
    "ear": "https://cdn-icons-png.flaticon.com/512/4723/4723903.png",   # Ear clear
    "nose": "https://cdn-icons-png.flaticon.com/512/4723/4723918.png",  # Nose clear
    "mouth": "https://cdn-icons-png.flaticon.com/512/4139/4139923.png", # Mouth/smile
    "hand": "https://cdn-icons-png.flaticon.com/512/3588/3588214.png",  # Open hand
    "arm": "https://cdn-icons-png.flaticon.com/512/5074/5074155.png",   # Strong arm
    "leg": "https://cdn-icons-png.flaticon.com/512/4723/4723922.png",   # Leg
    "foot": "https://cdn-icons-png.flaticon.com/512/5074/5074152.png",  # Foot
    "finger": "https://cdn-icons-png.flaticon.com/512/4690/4690871.png", # Pointing finger
    "toe": "https://cdn-icons-png.flaticon.com/512/5074/5074152.png",   
    "body": "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",  
    "thumb": "https://cdn-icons-png.flaticon.com/512/1356/1356479.png", # Thumbs up
    "teeth": "https://cdn-icons-png.flaticon.com/512/4781/4781419.png", # Teeth/smile
}

async def update_images():
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME", "ielts_database")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    levels = await db.learning_levels.find({}).to_list(None)
    print(f"Found {len(levels)} levels")
    
    updated = 0
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
                        if word in BETTER_IMAGES:
                            vocab["visual_url"] = BETTER_IMAGES[word]
                            changed = True
                            print(f"Updated: {word}")
        
        if changed:
            await db.learning_levels.update_one(
                {"id": level["id"]},
                {"$set": {"units": units}}
            )
            updated += 1
    
    print(f"\nUpdated {updated} levels")
    client.close()

asyncio.run(update_images())
