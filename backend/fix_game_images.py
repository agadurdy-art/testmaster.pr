"""
Copy image_url from vocabulary sections to game items across all lessons.
This ensures games use the same images as the vocabulary section.
"""
import os
from pymongo import MongoClient

client = MongoClient(os.environ.get('MONGO_URL'))
db = client['ielts_database']

# Step 1: Build global word -> image_url mapping from ALL vocabulary sections
word_images = {}
lessons = list(db['unified_lessons'].find({}, {'_id': 1, 'lesson_id': 1, 'activity_flow': 1}))

for lesson in lessons:
    for act in lesson.get('activity_flow', []):
        if act.get('type') == 'vocabulary':
            for w in act.get('data', {}).get('words', []):
                if isinstance(w, dict):
                    word = w.get('word', '').lower().strip()
                    img = w.get('image_url', '')
                    if word and img:
                        word_images[word] = img

print(f"Found {len(word_images)} words with images")

# Step 2: Apply image_urls to game items
total_fixed = 0
lessons_fixed = 0

for lesson in lessons:
    changed = False
    for act in lesson.get('activity_flow', []):
        data = act.get('data', {})
        for game in data.get('games', []):
            for item in game.get('items', []):
                word = item.get('word', '').lower().strip()
                if word in word_images and not item.get('image_url'):
                    item['image_url'] = word_images[word]
                    changed = True
                    total_fixed += 1
                # Also fix distractors
                for d in item.get('distractors', []):
                    if isinstance(d, dict):
                        dw = d.get('word', '').lower().strip()
                        if dw in word_images and not d.get('image_url'):
                            d['image_url'] = word_images[dw]
                            changed = True
                            total_fixed += 1

    if changed:
        db['unified_lessons'].update_one(
            {'_id': lesson['_id']},
            {'$set': {'activity_flow': lesson['activity_flow']}}
        )
        lessons_fixed += 1
        print(f"  Fixed: {lesson['lesson_id']}")

print(f"\n✅ Done! Added {total_fixed} image_urls across {lessons_fixed} lessons")
