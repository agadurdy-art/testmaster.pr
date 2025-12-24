"""Update vocabulary images to use illustrated clip art style"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Clip art style images for body parts - using reliable image sources
BODY_PARTS_IMAGES = {
    "head": "https://cdn-icons-png.flaticon.com/512/3048/3048127.png",  # Cartoon head icon
    "face": "https://cdn-icons-png.flaticon.com/512/2922/2922561.png",  # Cartoon face with features
    "hair": "https://cdn-icons-png.flaticon.com/512/1245/1245876.png",  # Hair style icon
    "eye": "https://cdn-icons-png.flaticon.com/512/2807/2807510.png",   # Eye icon
    "eyes": "https://cdn-icons-png.flaticon.com/512/2807/2807510.png",  # Eyes icon
    "ear": "https://cdn-icons-png.flaticon.com/512/2933/2933245.png",   # Ear icon
    "nose": "https://cdn-icons-png.flaticon.com/512/3588/3588435.png",  # Nose icon
    "mouth": "https://cdn-icons-png.flaticon.com/512/3588/3588419.png", # Mouth/lips icon
    "hand": "https://cdn-icons-png.flaticon.com/512/3588/3588244.png",  # Hand icon
    "arm": "https://cdn-icons-png.flaticon.com/512/4348/4348083.png",   # Arm icon
    "leg": "https://cdn-icons-png.flaticon.com/512/3048/3048394.png",   # Leg icon
    "foot": "https://cdn-icons-png.flaticon.com/512/3588/3588287.png",  # Foot icon
    "finger": "https://cdn-icons-png.flaticon.com/512/3588/3588263.png", # Finger pointing
    "toe": "https://cdn-icons-png.flaticon.com/512/3588/3588287.png",   # Toes/foot
    "body": "https://cdn-icons-png.flaticon.com/512/3048/3048122.png",  # Full body icon
}

# Alternative: Use OpenMoji style illustrations
BODY_PARTS_OPENMOJI = {
    "head": "https://openmoji.org/data/color/svg/1F9D2.svg",
    "face": "https://openmoji.org/data/color/svg/1F642.svg",
    "hair": "https://openmoji.org/data/color/svg/1F9D4.svg", 
    "eye": "https://openmoji.org/data/color/svg/1F441.svg",
    "ear": "https://openmoji.org/data/color/svg/1F442.svg",
    "nose": "https://openmoji.org/data/color/svg/1F443.svg",
    "mouth": "https://openmoji.org/data/color/svg/1F444.svg",
    "hand": "https://openmoji.org/data/color/svg/1F91A.svg",
    "arm": "https://openmoji.org/data/color/svg/1F4AA.svg",
    "leg": "https://openmoji.org/data/color/svg/1F9B5.svg",
    "foot": "https://openmoji.org/data/color/svg/1F9B6.svg",
}

async def update_vocabulary_images():
    mongo_url = os.getenv("MONGO_URL")
    client = AsyncIOMotorClient(mongo_url)
    db = client.ielts_pathway
    
    # Get all lessons
    lessons = await db.learning_lessons.find({}).to_list(None)
    
    updated_count = 0
    for lesson in lessons:
        content = lesson.get("content", {})
        vocabulary = content.get("vocabulary", [])
        
        changed = False
        for vocab in vocabulary:
            word = vocab.get("word", "").lower()
            if word in BODY_PARTS_IMAGES:
                vocab["visual_url"] = BODY_PARTS_IMAGES[word]
                changed = True
                print(f"Updated image for: {word}")
        
        if changed:
            await db.learning_lessons.update_one(
                {"id": lesson["id"]},
                {"$set": {"content.vocabulary": vocabulary}}
            )
            updated_count += 1
    
    print(f"\nUpdated {updated_count} lessons with new vocabulary images")
    client.close()

if __name__ == "__main__":
    asyncio.run(update_vocabulary_images())
