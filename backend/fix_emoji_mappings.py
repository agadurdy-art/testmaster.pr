"""
Fix incorrect emoji-word mappings in unified lesson game data.
Corrects the worst mismatches where emojis show completely wrong objects.
"""
import os
import json
from pymongo import MongoClient

client = MongoClient(os.environ.get('MONGO_URL'))
db = client['ielts_database']

# Correction map: word -> better emoji
# Only correcting clearly WRONG mappings
EMOJI_CORRECTIONS = {
    # Furniture/Objects - MOST CRITICAL (Read & Choose game)
    'desk': '🗂️',         # was 🪑 (chair!) - file dividers represent a desk better
    'table': '🍽️',        # was 🪵 (wood log) - plate setting represents table
    'bench': '🪑',         # keep as is, but chair/stool need to differ
    'stool': '🔵',         # was 🪑 (same as chair/bench!) - use circle for distinction
    'board': '📝',         # was 📋/⬛ - memo pad better represents a writing board
    'shelf': '🗄️',        # was 📚 - file cabinet/shelf
    'bookshelf': '📚',    # keep - books on shelf is fine
    'floor': '🟫',         # was ⬜ - brown square (floor is usually brown)
    'ceiling': '⬜',       # was 💡 - white square for ceiling
    'closet': '🗄️',       # was 🚪 - cabinet
    'carpet': '🟥',        # keep red square
    'mat': '🟩',           # was 🧼 (soap!) - green mat
    'cushion': '🛋️',      # keep sofa
    
    # Stationery
    'eraser': '🧽',        # was 🧼 (soap!) - sponge is closer
    'ruler': '📏',         # keep
    'paper': '📄',         # keep
    'notebook': '📓',      # keep
    
    # Actions/Greetings - confusing ones
    'goodbye': '👋',       # was 👎 (thumbs DOWN!) - wave is correct
    'bye': '👋',           # was 🙋 - wave
    
    # Body/People
    'building': '🏢',      # was 🧱 (brick)
    'farm': '🌾',          # was 🚜 - wheat/farm
    'hallway': '🚶',       # keep
    'attic': '🏠',         # was 📦 - house
    'basement': '⬇️',      # was 🔦
    'driveway': '🅿️',      # was 🚙
    'garage': '🏗️',        # was 🚗
    
    # Abstract concepts - make more intuitive
    'answer': '💬',         # was ✋
    'some': '🔢',          # was ✋
    'few': '🔢',           # was 👌  
    'always': '♾️',        # was 💯
    'never': '🚫',         # keep
    'mud': '🟤',           # was 💩 (inappropriate for kids!)
}

# Track changes
total_fixed = 0
lessons_fixed = 0

lessons = list(db['unified_lessons'].find({}, {'_id': 1, 'lesson_id': 1, 'activity_flow': 1}))
print(f"Scanning {len(lessons)} lessons...")

for lesson in lessons:
    changed = False
    activity_flow = lesson.get('activity_flow', [])
    
    for act in activity_flow:
        data = act.get('data', {})
        
        # Fix games
        for game in data.get('games', []):
            for item in game.get('items', []):
                word = item.get('word', '').lower().strip()
                if word in EMOJI_CORRECTIONS and item.get('emoji') != EMOJI_CORRECTIONS[word]:
                    old = item.get('emoji', '')
                    item['emoji'] = EMOJI_CORRECTIONS[word]
                    changed = True
                    total_fixed += 1
                
                # Fix distractors too
                for d in item.get('distractors', []):
                    if isinstance(d, dict):
                        dword = d.get('word', '').lower().strip()
                        if dword in EMOJI_CORRECTIONS and d.get('emoji') != EMOJI_CORRECTIONS[dword]:
                            d['emoji'] = EMOJI_CORRECTIONS[dword]
                            changed = True
                            total_fixed += 1
        
        # Fix vocabulary words
        for w in data.get('words', []):
            if isinstance(w, dict):
                word = w.get('word', '').lower().strip()
                if word in EMOJI_CORRECTIONS and w.get('emoji') != EMOJI_CORRECTIONS[word]:
                    w['emoji'] = EMOJI_CORRECTIONS[word]
                    changed = True
                    total_fixed += 1
    
    if changed:
        db['unified_lessons'].update_one(
            {'_id': lesson['_id']},
            {'$set': {'activity_flow': activity_flow}}
        )
        lessons_fixed += 1
        print(f"  Fixed: {lesson['lesson_id']}")

print(f"\n✅ Done! Fixed {total_fixed} emoji mappings across {lessons_fixed} lessons")
