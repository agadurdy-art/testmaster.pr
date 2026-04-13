"""
Update database with new context-aware vocabulary images.
1. Fix 'mouse' image (computer mouse → animal mouse)
2. Add new distractor images for missing words
"""
import os
from pymongo import MongoClient

client = MongoClient(os.environ.get('MONGO_URL'))
db = client['ielts_database']

# Map of word -> image file path (relative to static dir)
NEW_IMAGES = {
    # Fix context-wrong images
    'mouse': '/static/vocab_images/mouse_animal.png',
    
    # New distractor images
    'banana': '/static/vocab_images/banana.png',
    'bed': '/static/vocab_images/bed.png',
    'table': '/static/vocab_images/table.png',
    'pear': '/static/vocab_images/pear.png',
    'cloud': '/static/vocab_images/cloud.png',
    'cookie': '/static/vocab_images/cookie.png',
    'pizza': '/static/vocab_images/pizza.png',
    'cup': '/static/vocab_images/cup.png',
    'airplane': '/static/vocab_images/airplane.png',
    'plane': '/static/vocab_images/airplane.png',
    'window': '/static/vocab_images/window.png',
    'heart': '/static/vocab_images/heart.png',
    'train': '/static/vocab_images/train.png',
    'star': '/static/vocab_images/star.png',
    'grape': '/static/vocab_images/grape.png',
    'grapes': '/static/vocab_images/grape.png',
    'car': '/static/vocab_images/car.png',
    'moon': '/static/vocab_images/moon.png',
    'tree': '/static/vocab_images/tree.png',
    'flower': '/static/vocab_images/flower.png',
    'door': '/static/vocab_images/door.png',
    'bike': '/static/vocab_images/bike.png',
    'bicycle': '/static/vocab_images/bicycle.png',
    'house': '/static/vocab_images/house.png',
    'cake': '/static/vocab_images/cake.png',
    'bus': '/static/vocab_images/bus.png',
    'bear': '/static/vocab_images/bear.png',
    'bench': '/static/vocab_images/bench.png',
    'plate': '/static/vocab_images/plate.png',
    'butterfly': '/static/vocab_images/butterfly.png',
    'shelf': '/static/vocab_images/shelf.png',
    'bookshelf': '/static/vocab_images/bookshelf.png',
    'lamp': '/static/vocab_images/lamp.png',
    'sofa': '/static/vocab_images/sofa.png',
    'couch': '/static/vocab_images/couch.png',
    'frog': '/static/vocab_images/frog.png',
}

total_fixed = 0
lessons_fixed = 0
lessons = list(db['unified_lessons'].find({}, {'_id': 1, 'lesson_id': 1, 'activity_flow': 1}))
print(f"Scanning {len(lessons)} lessons...")

for lesson in lessons:
    changed = False
    for act in lesson.get('activity_flow', []):
        data = act.get('data', {})
        
        # Fix vocabulary words
        for w in data.get('words', []):
            if isinstance(w, dict):
                word = w.get('word', '').lower().strip()
                if word in NEW_IMAGES:
                    w['image_url'] = NEW_IMAGES[word]
                    changed = True
                    total_fixed += 1
        
        # Fix game items and distractors
        for game in data.get('games', []):
            for item in game.get('items', []):
                word = item.get('word', '').lower().strip()
                if word in NEW_IMAGES:
                    item['image_url'] = NEW_IMAGES[word]
                    changed = True
                    total_fixed += 1
                for d in item.get('distractors', []):
                    if isinstance(d, dict):
                        dw = d.get('word', '').lower().strip()
                        if dw in NEW_IMAGES:
                            d['image_url'] = NEW_IMAGES[dw]
                            changed = True
                            total_fixed += 1
    
    if changed:
        db['unified_lessons'].update_one(
            {'_id': lesson['_id']},
            {'$set': {'activity_flow': lesson['activity_flow']}}
        )
        lessons_fixed += 1
        print(f"  Updated: {lesson['lesson_id']}")

print(f"\n✅ Done! Updated {total_fixed} image references across {lessons_fixed} lessons")
