"""Update vocabulary images to use illustrated clip art style"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Clip art style images for body parts - using reliable Flaticon icons
BODY_PARTS_IMAGES = {
    "head": "https://cdn-icons-png.flaticon.com/512/3048/3048127.png",
    "face": "https://cdn-icons-png.flaticon.com/512/1326/1326405.png",
    "hair": "https://cdn-icons-png.flaticon.com/512/1245/1245876.png",
    "eye": "https://cdn-icons-png.flaticon.com/512/2807/2807510.png",
    "eyes": "https://cdn-icons-png.flaticon.com/512/2807/2807510.png",
    "ear": "https://cdn-icons-png.flaticon.com/512/2933/2933245.png",
    "nose": "https://cdn-icons-png.flaticon.com/512/3588/3588435.png",
    "mouth": "https://cdn-icons-png.flaticon.com/512/3588/3588419.png",
    "hand": "https://cdn-icons-png.flaticon.com/512/3588/3588244.png",
    "arm": "https://cdn-icons-png.flaticon.com/512/4348/4348083.png",
    "leg": "https://cdn-icons-png.flaticon.com/512/3048/3048394.png",
    "foot": "https://cdn-icons-png.flaticon.com/512/3588/3588287.png",
    "finger": "https://cdn-icons-png.flaticon.com/512/3588/3588263.png",
    "toe": "https://cdn-icons-png.flaticon.com/512/3588/3588287.png",
    "body": "https://cdn-icons-png.flaticon.com/512/3048/3048122.png",
    "neck": "https://cdn-icons-png.flaticon.com/512/3588/3588258.png",
    "shoulder": "https://cdn-icons-png.flaticon.com/512/4348/4348083.png",
    "thumb": "https://cdn-icons-png.flaticon.com/512/1176/1176315.png",
    "teeth": "https://cdn-icons-png.flaticon.com/512/2933/2933258.png",
    "tongue": "https://cdn-icons-png.flaticon.com/512/3588/3588419.png",
    "lips": "https://cdn-icons-png.flaticon.com/512/3588/3588419.png",
}

async def update_vocabulary_images():
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME", "ielts_database")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Get all learning levels
    levels = await db.learning_levels.find({}).to_list(None)
    print(f"Found {len(levels)} learning levels")
    
    updated_count = 0
    for level in levels:
        units = level.get("units", [])
        level_changed = False
        
        for unit in units:
            lessons = unit.get("lessons", [])
            
            for lesson in lessons:
                content = lesson.get("content", {})
                vocabulary = content.get("vocabulary", [])
                
                for i, vocab in enumerate(vocabulary):
                    # Handle both string and dict formats
                    if isinstance(vocab, str):
                        word = vocab.lower().strip()
                        if word in BODY_PARTS_IMAGES:
                            vocabulary[i] = {
                                "word": vocab,
                                "visual_url": BODY_PARTS_IMAGES[word]
                            }
                            print(f"Converted string to dict and updated: {word}")
                            level_changed = True
                    elif isinstance(vocab, dict):
                        word = vocab.get("word", "").lower().strip()
                        if word in BODY_PARTS_IMAGES:
                            old_url = vocab.get("visual_url", "")
                            vocab["visual_url"] = BODY_PARTS_IMAGES[word]
                            if old_url != vocab["visual_url"]:
                                print(f"Updated: {word}")
                                level_changed = True
        
        if level_changed:
            await db.learning_levels.update_one(
                {"id": level["id"]},
                {"$set": {"units": units}}
            )
            updated_count += 1
            print(f"Saved updates for level: {level.get('title', level.get('id'))}")
    
    print(f"\nUpdated {updated_count} levels with new vocabulary images")
    client.close()

if __name__ == "__main__":
    asyncio.run(update_vocabulary_images())
