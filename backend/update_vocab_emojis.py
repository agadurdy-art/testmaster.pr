import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
load_dotenv()

EMOJI_MAP = {
    'hello': '👋', 'hi': '🙋', 'goodbye': '👋', 'good morning': '🌅',
    'good night': '🌙', 'thank you': '🙏', 'please': '🤲', 'yes': '✅',
    'name': '📛', 'friend': '🤝', 'teacher': '👨‍🏫', 'student': '🎒',
    'boy': '👦', 'girl': '👧', 'man': '👨', 'woman': '👩',
    'meet': '🤝', 'nice': '😊', 'happy': '😄', 'sad': '😢',
    'how are you': '❓', 'fine': '👍', 'sorry': '🙇', 'excuse me': '🙂',
}

async def update():
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME', 'ielts_ace')]
    vocabs = await db.unified_vocab_activities.find({}).to_list(20)
    for vocab in vocabs:
        for w in vocab.get('words', []):
            word_lower = w['word'].lower()
            w['image_emoji'] = EMOJI_MAP.get(word_lower, '📖')
        await db.unified_vocab_activities.update_one(
            {'_id': vocab['_id']},
            {'$set': {'words': vocab['words']}}
        )
        print(f'Updated: {vocab["activity_id"]}')
    client.close()

asyncio.run(update())
