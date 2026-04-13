import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_lessons():
    mongo_url = os.getenv("MONGO_URL")
    client = AsyncIOMotorClient(mongo_url)
    db = client.ielts_pathway
    
    # List all collections
    collections = await db.list_collection_names()
    print("Collections:", collections)
    
    # Check for lessons
    for coll_name in collections:
        if 'lesson' in coll_name.lower() or 'unit' in coll_name.lower():
            count = await db[coll_name].count_documents({})
            print(f"{coll_name}: {count} documents")
            
            # Get a sample
            sample = await db[coll_name].find_one({})
            if sample:
                print(f"  Sample keys: {list(sample.keys())[:10]}")
    
    client.close()

asyncio.run(check_lessons())
