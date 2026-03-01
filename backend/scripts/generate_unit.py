"""
Unit Content Generator for Stage 2
Generates the initial JSON content file for any unit based on master data.
Then enriches it with AI and seeds to the database.

Usage: python3 generate_unit.py <unit_num>
Example: python3 generate_unit.py 2
"""

import os
import json
import sys
import asyncio
from dotenv import load_dotenv
load_dotenv()
sys.path.insert(0, '/app/backend')


# Master data for all 12 units
STAGE_2_UNITS = {
    1: {
        "title": "Say Hello!",
        "subtitle": "Greetings and introductions",
        "grammar_focus": ["Subject Pronouns (He/She/They)", "Who is...?", "Alphabet names"],
        "phonics_focus": ["Letter names", "Initial sounds"],
        "lessons": [
            {"num": 1, "title": "Greetings", "topic": "Meeting the teacher on the first day",
             "vocab": ["hello", "hi", "answer", "listen"],
             "context": "Meeting the teacher on the first day of school."},
            {"num": 2, "title": "Friends", "topic": "Introducing new students",
             "vocab": ["they", "name", "new", "old"],
             "context": "Introducing two new students, Ben and Kim."},
            {"num": 3, "title": "Alphabet", "topic": "A spelling game in the classroom",
             "vocab": ["alphabet", "spell", "letter", "word"],
             "context": "A spelling game in the classroom."},
            {"num": 4, "title": "Unit Review", "topic": "Review of all Unit 1 items",
             "vocab": ["hello", "hi", "answer", "listen", "they", "name", "new", "old", "alphabet", "spell", "letter", "word"],
             "context": "Spiral check of all Unit 1 items.", "is_review": True}
        ]
    },
    2: {
        "title": "Numbers & Colors",
        "subtitle": "Counting and describing colors",
        "grammar_focus": ["How many are there?", "There are [Number] [Color] [Objects]."],
        "phonics_focus": ["Number sounds", "Color words"],
        "lessons": [
            {"num": 1, "title": "Numbers 11-15", "topic": "Counting colorful balloons at a party",
             "vocab": ["eleven", "twelve", "thirteen", "fourteen", "fifteen"],
             "context": "Counting colorful balloons at a party."},
            {"num": 2, "title": "Numbers 16-20", "topic": "Counting books on a library shelf",
             "vocab": ["sixteen", "seventeen", "eighteen", "nineteen", "twenty"],
             "context": "Counting books on a library shelf."},
            {"num": 3, "title": "New Colors", "topic": "Describing the colors of a classroom rainbow",
             "vocab": ["purple", "grey", "brown", "white", "black", "rainbow"],
             "context": "Describing the colors of a classroom rainbow."},
            {"num": 4, "title": "Unit Review", "topic": "Counting colored objects and identifying higher numbers",
             "vocab": ["eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "purple", "grey", "brown", "white", "black", "rainbow"],
             "context": "Counting colored objects and identifying higher numbers.", "is_review": True}
        ]
    },
    3: {
        "title": "What's in Your Classroom?",
        "subtitle": "Classroom objects and positions",
        "grammar_focus": ["Prepositions of Place (in, on, under, next to, behind)"],
        "phonics_focus": ["Object words", "Position words"],
        "lessons": [
            {"num": 1, "title": "Objects", "topic": "A tour of the school computer room",
             "vocab": ["desk", "chair", "board", "computer"],
             "context": "A tour of the school computer room."},
            {"num": 2, "title": "Positions 1", "topic": "Finding a lost pencil in the classroom",
             "vocab": ["in", "on", "under"],
             "context": "Finding a lost pencil in the classroom."},
            {"num": 3, "title": "Positions 2", "topic": "Describing where pictures are hanging",
             "vocab": ["behind", "next to", "wall", "floor"],
             "context": "Describing where pictures are hanging in the room."},
            {"num": 4, "title": "Unit Review", "topic": "Find the object challenge using prepositions",
             "vocab": ["desk", "chair", "board", "computer", "in", "on", "under", "behind", "next to", "wall", "floor"],
             "context": "Find the object challenge using prepositions.", "is_review": True}
        ]
    },
    4: {
        "title": "Body & Action",
        "subtitle": "Body parts and what we can do",
        "grammar_focus": ["Modal Can/Can't", "Can you...?", "Action verbs"],
        "phonics_focus": ["Body words", "Action sounds"],
        "lessons": [
            {"num": 1, "title": "Body Review", "topic": "A morning exercise routine",
             "vocab": ["shoulders", "knees", "toes", "arm", "leg"],
             "context": "A morning exercise routine."},
            {"num": 2, "title": "Actions", "topic": "A talent show where kids show what they can do",
             "vocab": ["jump", "run", "sing", "dance"],
             "context": "A talent show where kids show what they can do."},
            {"num": 3, "title": "Abilities", "topic": "Describing a robot's functions",
             "vocab": ["can", "can't", "swim", "climb"],
             "context": "Describing a robot's functions."},
            {"num": 4, "title": "Unit Review", "topic": "Combining body parts and actions",
             "vocab": ["shoulders", "knees", "toes", "arm", "leg", "jump", "run", "sing", "dance", "can", "can't", "swim", "climb"],
             "context": "Combining body parts and actions (e.g., I can jump with my legs).", "is_review": True}
        ]
    },
    5: {
        "title": "Animals Everywhere",
        "subtitle": "Zoo and garden animals",
        "grammar_focus": ["Present Simple (it lives, it eats)", "Has it got...?", "Physical descriptions"],
        "phonics_focus": ["Animal sounds", "Description words"],
        "lessons": [
            {"num": 1, "title": "Zoo Animals", "topic": "A virtual trip to the zoo",
             "vocab": ["giraffe", "hippo", "zebra", "snake"],
             "context": "A virtual trip to the zoo."},
            {"num": 2, "title": "Small Animals", "topic": "Looking for tiny animals in a garden",
             "vocab": ["spider", "frog", "lizard", "tail"],
             "context": "Looking for tiny animals in a garden."},
            {"num": 3, "title": "Descriptions", "topic": "Guessing an animal based on physical clues",
             "vocab": ["long neck", "big ears", "scary", "funny"],
             "context": "Guessing an animal based on physical clues."},
            {"num": 4, "title": "Unit Review", "topic": "Sorting animals by size and habitat",
             "vocab": ["giraffe", "hippo", "zebra", "snake", "spider", "frog", "lizard", "tail", "long neck", "big ears", "scary", "funny"],
             "context": "Sorting animals by size and habitat.", "is_review": True}
        ]
    },
    6: {
        "title": "My Family & Friends",
        "subtitle": "Family members and people",
        "grammar_focus": ["Possessive 's (Ben's father)", "Who are they?", "Plural nouns"],
        "phonics_focus": ["Family words", "People words"],
        "lessons": [
            {"num": 1, "title": "Family Tree", "topic": "Looking at a family photo album",
             "vocab": ["son", "daughter", "baby", "parent"],
             "context": "Looking at a family photo album."},
            {"num": 2, "title": "Relatives", "topic": "Talking about visitors coming for dinner",
             "vocab": ["uncle", "aunt", "cousin"],
             "context": "Talking about visitors coming for dinner."},
            {"num": 3, "title": "People", "topic": "Describing people at a park",
             "vocab": ["man", "woman", "children", "person"],
             "context": "Describing people at a park."},
            {"num": 4, "title": "Unit Review", "topic": "Identifying family members and using possessive 's",
             "vocab": ["son", "daughter", "baby", "parent", "uncle", "aunt", "cousin", "man", "woman", "children", "person"],
             "context": "Identifying family members and using possessive 's.", "is_review": True}
        ]
    },
    7: {
        "title": "Food I Like!",
        "subtitle": "Food preferences and meals",
        "grammar_focus": ["Do you like...?", "Yes, I do / No, I don't", "Conjunction and"],
        "phonics_focus": ["Food words", "Question intonation"],
        "lessons": [
            {"num": 1, "title": "Lunch Time", "topic": "Choosing food in the school canteen",
             "vocab": ["chicken", "rice", "beans", "bread"],
             "context": "Choosing food in the school canteen."},
            {"num": 2, "title": "Drinks", "topic": "Ordering drinks at a cafe",
             "vocab": ["water", "juice", "milk", "hot", "cold"],
             "context": "Ordering drinks at a cafe."},
            {"num": 3, "title": "Preferences", "topic": "A survey about favorite snacks",
             "vocab": ["like", "don't like", "favorite", "fruit"],
             "context": "A survey about favorite snacks."},
            {"num": 4, "title": "Unit Review", "topic": "Creating a healthy meal plan",
             "vocab": ["chicken", "rice", "beans", "bread", "water", "juice", "milk", "hot", "cold", "like", "don't like", "favorite", "fruit"],
             "context": "Creating a healthy meal plan.", "is_review": True}
        ]
    },
    8: {
        "title": "My House",
        "subtitle": "Rooms and objects at home",
        "grammar_focus": ["Is there a...?", "Are there any...?", "There is / There are"],
        "phonics_focus": ["House words", "Question forms"],
        "lessons": [
            {"num": 1, "title": "Rooms", "topic": "Describing the different parts of a house",
             "vocab": ["kitchen", "bathroom", "bedroom", "living room"],
             "context": "Describing the different parts of a house."},
            {"num": 2, "title": "Furniture", "topic": "Finding objects while cleaning a room",
             "vocab": ["mirror", "clock", "phone", "stairs"],
             "context": "Finding objects while cleaning a room."},
            {"num": 3, "title": "Existence", "topic": "Describing what is inside a dream house",
             "vocab": ["there is", "there are", "many", "some"],
             "context": "Describing what is inside a dream house."},
            {"num": 4, "title": "Unit Review", "topic": "Matching furniture to the correct rooms",
             "vocab": ["kitchen", "bathroom", "bedroom", "living room", "mirror", "clock", "phone", "stairs", "there is", "there are", "many", "some"],
             "context": "Matching furniture to the correct rooms.", "is_review": True}
        ]
    },
    9: {
        "title": "What are we doing?",
        "subtitle": "Actions happening right now",
        "grammar_focus": ["Present Continuous (am/is/are + verb-ing)"],
        "phonics_focus": ["-ing endings", "Verb sounds"],
        "lessons": [
            {"num": 1, "title": "Current Actions", "topic": "Describing a busy scene in a playground",
             "vocab": ["eating", "drinking", "playing", "wearing"],
             "context": "Describing a busy scene in a playground."},
            {"num": 2, "title": "At Home Actions", "topic": "A phone call asking family members what they are doing",
             "vocab": ["sleeping", "drawing", "watching TV", "listening to music"],
             "context": "A phone call asking family members what they are doing."},
            {"num": 3, "title": "Grammar Focus", "topic": "A Mime the action game",
             "vocab": ["running", "singing", "dancing", "reading"],
             "context": "Focus on -ing endings and subject-verb agreement."},
            {"num": 4, "title": "Unit Review", "topic": "Describing a picture of people doing various activities",
             "vocab": ["eating", "drinking", "playing", "wearing", "sleeping", "drawing", "watching TV", "listening to music", "running", "singing", "dancing", "reading"],
             "context": "Describing a picture of people doing various activities.", "is_review": True}
        ]
    },
    10: {
        "title": "Clothes",
        "subtitle": "What we wear",
        "grammar_focus": ["He/She is wearing...", "Adjective + Noun order (e.g., blue skirt)"],
        "phonics_focus": ["Clothing words", "Color + noun patterns"],
        "lessons": [
            {"num": 1, "title": "Basic Clothes", "topic": "Getting dressed for school in the morning",
             "vocab": ["shirt", "skirt", "dress", "trousers"],
             "context": "Getting dressed for school in the morning."},
            {"num": 2, "title": "Accessories", "topic": "Packing a bag for a cold trip",
             "vocab": ["shoes", "socks", "jacket", "hat"],
             "context": "Packing a bag for a cold trip."},
            {"num": 3, "title": "Descriptions", "topic": "Identifying people at a party by their clothes",
             "vocab": ["glasses", "handbag", "clean", "dirty"],
             "context": "Identifying people at a party by their clothes."},
            {"num": 4, "title": "Unit Review", "topic": "Dressing an avatar with specific colors and items",
             "vocab": ["shirt", "skirt", "dress", "trousers", "shoes", "socks", "jacket", "hat", "glasses", "handbag", "clean", "dirty"],
             "context": "Dressing an avatar with specific colors and items.", "is_review": True}
        ]
    },
    11: {
        "title": "Play & Hobbies",
        "subtitle": "Sports and free-time activities",
        "grammar_focus": ["Verbs Play, Go, Do", "Adverbs of frequency (always, never)"],
        "phonics_focus": ["Sport words", "Hobby sounds"],
        "lessons": [
            {"num": 1, "title": "Sports", "topic": "Choosing a sport to play at the weekend",
             "vocab": ["basketball", "football", "tennis", "game"],
             "context": "Choosing a sport to play at the weekend."},
            {"num": 2, "title": "Arts & Music", "topic": "An after-school hobby club",
             "vocab": ["guitar", "piano", "paint", "photo"],
             "context": "An after-school hobby club."},
            {"num": 3, "title": "Frequency", "topic": "Describing daily hobby routines",
             "vocab": ["always", "never", "sometimes", "radio"],
             "context": "Describing daily hobby routines."},
            {"num": 4, "title": "Unit Review", "topic": "Creating a weekly hobby schedule",
             "vocab": ["basketball", "football", "tennis", "game", "guitar", "piano", "paint", "photo", "always", "never", "sometimes", "radio"],
             "context": "Creating a weekly hobby schedule.", "is_review": True}
        ]
    },
    12: {
        "title": "Review & Final Gate",
        "subtitle": "Cumulative review of all Stage 2",
        "grammar_focus": ["All Stage 2 grammar patterns"],
        "phonics_focus": ["All Stage 2 phonics"],
        "lessons": [
            {"num": 1, "title": "Basics Review", "topic": "A welcome back party",
             "vocab": ["hello", "twelve", "purple", "desk"],
             "context": "Grammar: Greetings, Numbers 1-20, Colors. A welcome back party."},
            {"num": 2, "title": "Description Review", "topic": "Describing a Mystery Person",
             "vocab": ["arm", "shirt", "giraffe", "daughter"],
             "context": "Grammar: Body, Clothes, Animals, Family. Describing a Mystery Person."},
            {"num": 3, "title": "Usage Review", "topic": "A weekend trip story",
             "vocab": ["eating", "can", "like", "kitchen"],
             "context": "Grammar: Present Continuous, Can/Can't, Likes/Dislikes. A weekend trip story."},
            {"num": 4, "title": "Starters Mock Exam", "topic": "The Island Adventure - Full Mastery Check",
             "vocab": ["hello", "can", "eating", "shirt", "giraffe", "kitchen", "twelve", "desk"],
             "context": "The Island Adventure where students use all skills to find a treasure and earn their Stage 2 Certificate.", "is_review": True}
        ]
    }
}


def generate_unit_json(unit_num: int) -> dict:
    """Generate the initial JSON content for a unit."""
    unit_data = STAGE_2_UNITS.get(unit_num)
    if not unit_data:
        raise ValueError(f"Unit {unit_num} not found in master data")

    unit_str = str(unit_num).zfill(2)
    lessons = []

    for lesson_info in unit_data["lessons"]:
        lnum = lesson_info["num"]
        lid = f"stage_2_unit_{unit_str}_lesson_{str(lnum).zfill(2)}"
        is_review = lesson_info.get("is_review", False)

        # Build vocab items
        if is_review:
            vocab_step = {
                "step": 2, "type": "vocabulary_review",
                "items": lesson_info["vocab"]
            }
        else:
            vocab_step = {
                "step": 2, "type": "vocabulary",
                "items": [{"word": w, "ipa": "", "definition": "", "example": "", "image_emoji": ""} for w in lesson_info["vocab"]]
            }

        steps = [
            {"step": 1, "type": "warm_up",
             "question_text": f"What do you know about {lesson_info['topic'].lower()}?",
             "correct_answer": "", "options": [], "image_emoji": "", "hint": ""},
            vocab_step,
            {"step": 3, "type": "micro_game_vocab",
             "question_text": "", "correct_answer": "", "options": []},
            {"step": 4, "type": "micro_reading",
             "title": lesson_info["title"],
             "text": f"A short story about {lesson_info['topic'].lower()}.",
             "questions": [{"question": "What happens in the story?", "answer": "", "options": []}]},
            {"step": 5, "type": "grammar_review" if is_review else "grammar_focus",
             "rule_pattern": " / ".join(unit_data["grammar_focus"]),
             "explanation": "", "examples": [],
             **({"patterns": unit_data["grammar_focus"]} if is_review else {})},
            {"step": 6, "type": "grammar_game",
             "mode": "word_order", "words": [], "correct_sentence": ""},
            {"step": 7, "type": "listening",
             "audio_text": f"Listen to the story about {lesson_info['topic'].lower()}.",
             "questions": [{"question": "What did you hear?", "answer": "", "options": []}]},
            {"step": 8, "type": "production",
             "prompt": f"Say something about {lesson_info['topic'].lower()}.",
             "expected_text": "", "mode": "speaking"},
            {"step": 9, "type": "exit_ticket",
             "question_text": f"What did you learn about {lesson_info['topic'].lower()}?",
             "correct_answer": "", "options": []}
        ]

        lessons.append({
            "lesson_num": lnum,
            "lesson_id": lid,
            "title": lesson_info["title"],
            "topic": lesson_info["topic"],
            "context": lesson_info.get("context", ""),
            "extra_links": [],
            "steps": steps
        })

    return {
        "stage": "stage_2",
        "stage_id": "stage_2_starters",
        "stage_title": "Starters (A1)",
        "units": [{
            "unit_id": f"stage_2_unit_{unit_str}",
            "unit_num": unit_num,
            "title": unit_data["title"],
            "subtitle": unit_data["subtitle"],
            "phonics_focus": unit_data["phonics_focus"],
            "grammar_focus": unit_data["grammar_focus"],
            "lessons": lessons
        }]
    }


async def generate_enrich_and_seed(unit_num: int):
    """Full pipeline: generate JSON -> enrich with AI -> seed to DB"""
    unit_str = str(unit_num).zfill(2)
    content_dir = "/app/backend/content"
    original_path = f"{content_dir}/stage2_unit{unit_str}.json"

    # Step 1: Generate initial content JSON
    print(f"\n{'='*60}")
    print(f"  GENERATING UNIT {unit_num}: {STAGE_2_UNITS[unit_num]['title']}")
    print(f"{'='*60}")

    content = generate_unit_json(unit_num)
    os.makedirs(content_dir, exist_ok=True)
    with open(original_path, 'w') as f:
        json.dump(content, f, indent=2, ensure_ascii=False)
    print(f"  Generated: {original_path}")

    # Step 2: Enrich with AI and seed to DB
    from scripts.enrich_and_seed_stage import enrich_and_seed_unit
    await enrich_and_seed_unit("stage2", unit_num)

    print(f"\n  Unit {unit_num} complete!")


async def main():
    if len(sys.argv) < 2:
        print("Usage: python3 generate_unit.py <unit_num> [end_unit_num]")
        print("Example: python3 generate_unit.py 2       # Generate unit 2")
        print("Example: python3 generate_unit.py 2 12    # Generate units 2-12")
        sys.exit(1)

    start = int(sys.argv[1])
    end = int(sys.argv[2]) if len(sys.argv) > 2 else start

    for unit_num in range(start, end + 1):
        await generate_enrich_and_seed(unit_num)


if __name__ == "__main__":
    asyncio.run(main())
