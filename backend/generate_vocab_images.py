"""
Generate AI vocabulary images for body parts using OpenAI gpt-image-1
Saves images and updates database with URLs
"""
import asyncio
import os
import base64
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

load_dotenv()

# Body parts vocabulary to generate images for
BODY_PARTS = [
    {"word": "head", "prompt": "Simple colorful cartoon illustration of a human head from side view, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
    {"word": "face", "prompt": "Simple colorful cartoon illustration of a smiling human face showing eyes nose mouth, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
    {"word": "hair", "prompt": "Simple colorful cartoon illustration of wavy hair on a head, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
    {"word": "eye", "prompt": "Simple colorful cartoon illustration of a single human eye with eyelashes, child-friendly clip art style, bright blue eye, white background, educational vocabulary image"},
    {"word": "ear", "prompt": "Simple colorful cartoon illustration of a human ear, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
    {"word": "nose", "prompt": "Simple colorful cartoon illustration of a human nose from front view, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
    {"word": "mouth", "prompt": "Simple colorful cartoon illustration of a smiling human mouth with lips, child-friendly clip art style, bright red lips, white background, educational vocabulary image"},
    {"word": "hand", "prompt": "Simple colorful cartoon illustration of an open human hand showing five fingers, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
    {"word": "arm", "prompt": "Simple colorful cartoon illustration of a human arm with muscles, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
    {"word": "finger", "prompt": "Simple colorful cartoon illustration of a pointing finger, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
    {"word": "thumb", "prompt": "Simple colorful cartoon illustration of a thumbs up hand gesture, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
    {"word": "leg", "prompt": "Simple colorful cartoon illustration of a human leg, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
    {"word": "foot", "prompt": "Simple colorful cartoon illustration of a human foot showing toes, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
    {"word": "toe", "prompt": "Simple colorful cartoon illustration of human toes on a foot, child-friendly clip art style, bright colors, white background, educational vocabulary image"},
]

# Directory to save images
IMAGES_DIR = "/app/frontend/public/vocab-images"

async def generate_and_save_images():
    """Generate images using AI and save them"""
    
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY not found in environment")
        return
    
    # Create images directory
    os.makedirs(IMAGES_DIR, exist_ok=True)
    
    # Initialize image generator
    image_gen = OpenAIImageGeneration(api_key=api_key)
    
    generated_images = {}
    
    for item in BODY_PARTS:
        word = item["word"]
        prompt = item["prompt"]
        
        print(f"\nGenerating image for: {word}")
        print(f"Prompt: {prompt[:50]}...")
        
        try:
            # Generate image
            images = await image_gen.generate_images(
                prompt=prompt,
                model="gpt-image-1",
                number_of_images=1
            )
            
            if images and len(images) > 0:
                # Save image to file
                image_path = f"{IMAGES_DIR}/{word}.png"
                with open(image_path, "wb") as f:
                    f.write(images[0])
                
                # Store the URL (relative path for frontend)
                generated_images[word] = f"/vocab-images/{word}.png"
                print(f"✓ Saved: {image_path}")
            else:
                print(f"✗ No image generated for {word}")
                
        except Exception as e:
            print(f"✗ Error generating {word}: {e}")
    
    return generated_images

async def update_database(images_map):
    """Update vocabulary images in database"""
    
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME", "ielts_database")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    levels = await db.learning_levels.find({}).to_list(None)
    print(f"\nUpdating database ({len(levels)} levels)...")
    
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
                        if word in images_map:
                            vocab["visual_url"] = images_map[word]
                            changed = True
                            print(f"  Updated: {word}")
        
        if changed:
            await db.learning_levels.update_one(
                {"id": level["id"]},
                {"$set": {"units": units}}
            )
            updated += 1
    
    print(f"\n✓ Updated {updated} levels in database")
    client.close()

async def main():
    print("=" * 50)
    print("AI Vocabulary Image Generator")
    print("=" * 50)
    
    # Generate images
    images_map = await generate_and_save_images()
    
    if images_map:
        # Update database
        await update_database(images_map)
        print("\n✓ All done!")
    else:
        print("\n✗ No images were generated")

if __name__ == "__main__":
    asyncio.run(main())
