#!/usr/bin/env python3
"""Stage 3 Unit 03 v2 — Prepare Lv1 Unit 3 "My home" alignment.
4 lessons: rooms → things → prepositions → review. Anchor names: Lucia, Tom,
Alex from Prepare reading "Your Rooms!"."""
import json, re
from pathlib import Path
OUT = Path(__file__).resolve().parent.parent / "content/enriched/stage3_unit03_enriched.json"

L1_VOCAB = ["bathroom", "bedroom", "dining room", "garden", "hall", "kitchen", "living room"]
L2_VOCAB = ["bed", "chair", "computer", "cupboard", "desk", "lamp", "mirror", "shelf"]
L3_VOCAB = ["sofa", "table", "TV", "wardrobe", "poster", "in", "on", "under", "behind", "next to"]

DEFS = {
    "bathroom":    ("🛁", "The room with a bath, shower and toilet.",        "I brush my teeth in the bathroom."),
    "bedroom":     ("🛏️", "The room where you sleep.",                       "My bedroom is small."),
    "dining room": ("🍽️", "The room where you eat at a table.",              "We eat dinner in the dining room."),
    "garden":      ("🌳", "The space outside with plants and grass.",        "The cat is in the garden."),
    "hall":        ("🚪", "The room you enter from the front door.",         "Hang your coat in the hall."),
    "kitchen":     ("🍳", "The room where you cook food.",                   "Mum is in the kitchen."),
    "living room": ("🛋️", "The room with a sofa where you watch TV.",        "We watch TV in the living room."),
    "bed":         ("🛏️", "A thing in your bedroom where you sleep.",        "My bed is big and soft."),
    "chair":       ("🪑", "A thing with four legs you sit on.",              "The chair is at the desk."),
    "computer":    ("💻", "An electronic thing you work and play on.",       "My computer is on the desk."),
    "cupboard":    ("🗄️", "A wooden box with doors for storing things.",     "The plates are in the cupboard."),
    "desk":        ("📋", "A table where you do homework.",                  "My desk is near the window."),
    "lamp":        ("💡", "A small light on a table or wall.",               "Turn on the lamp, please."),
    "mirror":      ("🪞", "A flat thing that shows your face.",              "I look in the mirror in the morning."),
    "shelf":       ("📚", "A flat board on a wall for books or things.",     "There are books on the shelf."),
    "sofa":        ("🛋️", "A long soft seat for two or three people.",       "The sofa is in the living room."),
    "table":       ("🪑", "A flat thing with legs you put things on.",       "The book is on the table."),
    "TV":          ("📺", "A screen for watching shows.",                    "The TV is in the living room."),
    "wardrobe":    ("👕", "A big cupboard for your clothes.",                "My clothes are in the wardrobe."),
    "poster":      ("🖼️", "A big paper picture you put on the wall.",        "I have a poster of a footballer."),
    "in":          ("📦", "Inside something.",                               "The cat is in the box."),
    "on":          ("📍", "On top of something.",                            "The book is on the table."),
    "under":       ("⬇️", "Below something.",                                "My shoes are under the bed."),
    "behind":      ("🚪", "At the back of something.",                       "The ball is behind the door."),
    "next to":     ("↔️", "Beside something.",                               "My chair is next to the desk."),
}

def vi(w):
    e, d, ex = DEFS[w]
    return {"word": w, "definition": d, "image_emoji": e, "image_url": "",
            "example_sentence": ex, "asset_slug": "stage3_u03_" + re.sub(r"\W+", "_", w.lower())}

def warm_up(i, q): return {"step": 1, "type": "warm_up", "video_url": "", "instruction": i, "questions": q}
def vocab(items): return {"step": 2, "type": "vocabulary", "items": items}
def reading(t, txt, sc, q): return {"step": 5, "type": "micro_reading", "title": t, "text": txt, "scene_description": sc, "questions": q}
def grammar(r, e, ex): return {"step": 6, "type": "grammar_focus", "rule_pattern": r, "explanation": e, "examples": ex}
def listening(at, url, q, sc=""): return {"step": 9, "type": "listening", "audio_text": at, "audio_url": url, "scene_description": sc, "questions": q}
def production(p, e, s, img=""): return {"step": 10, "type": "production", "production_type": "speaking", "prompt": p, "expected_text": e, "prompts": s, "image_url": img}
def exit_t(t, q): return {"step": 11, "type": "exit_ticket", "title": t, "questions": q}

L1 = {
    "lesson_num": 1, "lesson_id": "stage_3_movers_unit_03_lesson_01", "number": 1,
    "title": "Rooms in a house", "topic": "7 rooms + 'there is/are' singular", "extra_links": [],
    "steps": [
        warm_up("Look at Lucia's house. Match the room.", [
            {"question_text": "Where do you sleep?", "correct_answer": "bedroom",
             "options": ["bedroom", "kitchen", "garden", "hall"], "image_emoji": "🛏️"},
            {"question_text": "Where do you cook?", "correct_answer": "kitchen",
             "options": ["kitchen", "bathroom", "living room", "garden"], "image_emoji": "🍳"},
        ]),
        vocab([vi(w) for w in L1_VOCAB]),
        {"step": 3, "type": "vocab_games", "games": []},
        reading("Lucia's house",
            "Hi! I'm Lucia. This is my house. We have seven rooms. There is a kitchen. We cook in the kitchen. "
            "There is a living room with a big sofa. There is a dining room with a long table. We have two bathrooms — "
            "one upstairs and one downstairs. There is a bedroom for me and a bedroom for my brother. "
            "We have a small garden too. I love my home!",
            "A two-storey house with seven rooms labeled.",
            [
                {"question": "How many rooms does Lucia's house have?", "options": ["seven", "five", "ten", "three"], "correct_answer": "seven"},
                {"question": "Where do they cook?", "options": ["in the kitchen", "in the bedroom", "in the garden", "in the hall"], "correct_answer": "in the kitchen"},
                {"question": "How many bathrooms?", "options": ["two", "one", "three", "four"], "correct_answer": "two"},
                {"question": "Is there a garden?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "Whose house is this?", "options": ["Lucia's", "Tom's", "Alex's", "Sara's"], "correct_answer": "Lucia's"},
            ]),
        grammar("there is / there are — singular",
            "We use 'there is' (or short 'there's') to talk about ONE thing in a place. 'There is a kitchen' = a kitchen exists in this place. For more than one we use 'there are' (next lesson).",
            ["There is a sofa in the living room.", "There's a bed in my bedroom.", "There is a garden.", "There's a mirror on the wall.", "There is a cat in the kitchen."]),
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            "TOM: Hi Lucia! Welcome to my new house. "
            "LUCIA: Wow, Tom! It's big. How many rooms? "
            "TOM: There are five. Look — there's a kitchen here. "
            "LUCIA: It's nice. Is there a garden? "
            "TOM: Yes, there's a small garden at the back. "
            "LUCIA: And a dining room? "
            "TOM: No, we eat in the kitchen. But there is a living room. Come and see!",
            "/static/audio/stage3/unit03/lesson_01.mp3",
            [
                {"question": "Whose house is it?", "options": ["Tom's", "Lucia's", "Alex's", "Mum's"], "correct_answer": "Tom's"},
                {"question": "How many rooms?", "options": ["five", "seven", "three", "ten"], "correct_answer": "five"},
                {"question": "Is there a garden?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "Where do they eat?", "options": ["in the kitchen", "in the dining room", "in the garden", "in the living room"], "correct_answer": "in the kitchen"},
                {"question": "Is there a living room?", "options": ["yes", "no"], "correct_answer": "yes"},
            ],
            "Tom shows Lucia his new house."),
        production(
            "Describe your house. Use 'There is...' for 3 rooms.",
            "There is a kitchen. There is a living room. There is a bedroom for me.",
            ["Pick 3 rooms: kitchen / bedroom / bathroom / living room / garden.",
             "Use 'There is a...' for each.",
             "Add one detail: 'It's big.' or 'It's small.'"]),
        exit_t("What did you learn?", [
            {"question": "Choose: ___ is a kitchen in my house.", "options": ["There", "It", "He"], "correct_answer": "There"},
            {"question": "Where do you sleep?", "options": ["bedroom", "kitchen", "bathroom"], "correct_answer": "bedroom"},
            {"question": "Where do you eat at a table?", "options": ["dining room", "garden", "hall"], "correct_answer": "dining room"},
            {"question": "Choose: There ___ a garden.", "options": ["is", "are", "am"], "correct_answer": "is"},
            {"question": "True or false: 'living room' is where you watch TV.", "options": ["True", "False"], "correct_answer": "True"},
        ]),
    ],
}

L2 = {
    "lesson_num": 2, "lesson_id": "stage_3_movers_unit_03_lesson_02", "number": 2,
    "title": "Things in my bedroom", "topic": "Furniture + 'there are' plural", "extra_links": [],
    "steps": [
        warm_up("Look in Tom's bedroom. What can you see?", [
            {"question_text": "What is the thing you sleep on?", "correct_answer": "a bed",
             "options": ["a bed", "a chair", "a desk", "a lamp"], "image_emoji": "🛏️"},
            {"question_text": "Where do you put your books?", "correct_answer": "on a shelf",
             "options": ["on a shelf", "in the garden", "on the bed", "under the chair"], "image_emoji": "📚"},
        ]),
        vocab([vi(w) for w in L2_VOCAB]),
        {"step": 3, "type": "vocab_games", "games": []},
        reading("Your Rooms! — Tom's bedroom",
            "Hi! I'm Tom. This is my bedroom. There is a bed and there is a desk for my homework. "
            "There is a computer on my desk. There are two chairs — one at the desk and one near the window. "
            "There are three shelves with my books. There is a small lamp on the desk. "
            "There are two mirrors and a big cupboard for my clothes. My room is busy but I love it!",
            "A teenager's bedroom with desk, computer, shelves of books, and two chairs.",
            [
                {"question": "Whose bedroom is this?", "options": ["Tom's", "Lucia's", "Alex's", "Sam's"], "correct_answer": "Tom's"},
                {"question": "What is on Tom's desk?", "options": ["a computer", "a bed", "a sofa", "a TV"], "correct_answer": "a computer"},
                {"question": "How many chairs are there?", "options": ["two", "one", "three", "four"], "correct_answer": "two"},
                {"question": "How many shelves are there?", "options": ["three", "two", "one", "five"], "correct_answer": "three"},
                {"question": "Where is the lamp?", "options": ["on the desk", "on the bed", "on the shelf", "on the chair"], "correct_answer": "on the desk"},
                {"question": "Does Tom like his room?", "options": ["yes", "no"], "correct_answer": "yes"},
            ]),
        grammar("there are — plural",
            "When there is MORE THAN ONE thing in a place, we use 'there are'. 'There are two chairs' = two chairs exist here. The thing after 'there are' is always plural — add -s (chairs, shelves, books).",
            ["There are two chairs.", "There are three shelves.", "There are five books on the desk.", "There are four students in the room.", "There are two mirrors on the wall."]),
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            "MUM: Tom, where are you? "
            "TOM: I'm in my bedroom, Mum. "
            "MUM: What are you doing? "
            "TOM: I'm doing my homework. "
            "MUM: Are there books on your desk? "
            "TOM: Yes, there are five books. And there's a computer. "
            "MUM: Is there a lamp on? "
            "TOM: Yes, there is. The lamp is on my desk. "
            "MUM: Good. Dinner is in ten minutes!",
            "/static/audio/stage3/unit03/lesson_02.mp3",
            [
                {"question": "Where is Tom?", "options": ["in his bedroom", "in the kitchen", "in the garden", "at school"], "correct_answer": "in his bedroom"},
                {"question": "What is Tom doing?", "options": ["homework", "watching TV", "sleeping", "eating"], "correct_answer": "homework"},
                {"question": "How many books?", "options": ["five", "three", "two", "ten"], "correct_answer": "five"},
                {"question": "Is the lamp on?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "When is dinner?", "options": ["in ten minutes", "now", "in one hour", "tomorrow"], "correct_answer": "in ten minutes"},
            ],
            "A mum and son talk through the door."),
        production(
            "Describe your bedroom. Use 'There is...' and 'There are...'.",
            "There is a bed and a desk. There are two chairs and a computer.",
            ["One thing: 'There is a bed.'",
             "More than one: 'There are two chairs.'",
             "Where it is: 'on the desk', 'next to the bed'."]),
        exit_t("What did you learn?", [
            {"question": "Choose: There ___ three books.", "options": ["are", "is", "am"], "correct_answer": "are"},
            {"question": "Choose: There ___ a lamp.", "options": ["is", "are", "am"], "correct_answer": "is"},
            {"question": "What do you sleep on?", "options": ["a bed", "a sofa", "a chair"], "correct_answer": "a bed"},
            {"question": "Where do you put clothes?", "options": ["cupboard", "shelf", "desk"], "correct_answer": "cupboard"},
            {"question": "True or false: 'shelves' is the plural of 'shelf'.", "options": ["True", "False"], "correct_answer": "True"},
        ]),
    ],
}

L3 = {
    "lesson_num": 3, "lesson_id": "stage_3_movers_unit_03_lesson_03", "number": 3,
    "title": "Where are my things?", "topic": "More furniture + prepositions (in/on/under/behind/next to)", "extra_links": [],
    "steps": [
        warm_up("Look at Alex's messy room. Where are the things?", [
            {"question_text": "The book is on the desk. The cat is ___ the bed.", "correct_answer": "under",
             "options": ["under", "in", "next to", "behind"], "image_emoji": "🐱"},
            {"question_text": "The lamp is ___ the desk.", "correct_answer": "on",
             "options": ["on", "under", "behind", "next to"], "image_emoji": "💡"},
        ]),
        vocab([vi(w) for w in L3_VOCAB]),
        {"step": 3, "type": "vocab_games", "games": []},
        reading("Alex's busy room",
            "Hi! I'm Alex. My room is small but it has lots of things! There is a bed in the corner. "
            "There is a wardrobe next to the bed. The wardrobe is big — my clothes are in it. "
            "There is a sofa under the window. There is a TV on a small table. "
            "My football poster is on the wall behind the bed. My school bag is under the desk. "
            "And my cat? She is on the sofa! She loves my room too.",
            "A small bedroom with bed, wardrobe, sofa, TV, poster, and a cat on the sofa.",
            [
                {"question": "Is Alex's room big?", "options": ["no, it's small", "yes, very big", "yes, medium", "no, very big"], "correct_answer": "no, it's small"},
                {"question": "Where is the wardrobe?", "options": ["next to the bed", "under the bed", "in the kitchen", "behind the sofa"], "correct_answer": "next to the bed"},
                {"question": "Where is the sofa?", "options": ["under the window", "on the bed", "in the wardrobe", "next to the TV"], "correct_answer": "under the window"},
                {"question": "What is on the wall?", "options": ["a football poster", "a TV", "a mirror", "a shelf"], "correct_answer": "a football poster"},
                {"question": "Where is the cat?", "options": ["on the sofa", "under the bed", "in the wardrobe", "on the desk"], "correct_answer": "on the sofa"},
                {"question": "Where is the school bag?", "options": ["under the desk", "on the bed", "behind the door", "in the wardrobe"], "correct_answer": "under the desk"},
            ]),
        grammar("Prepositions — in, on, under, behind, next to",
            "Prepositions tell us WHERE something is. 'in' = inside. 'on' = on top of. 'under' = below. 'behind' = at the back of. 'next to' = beside. We put the preposition before the place: 'The cat is on the sofa.'",
            ["The cat is on the sofa.", "My books are in the bag.", "The ball is under the chair.", "The poster is behind the bed.", "The lamp is next to the bed."]),
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            "ALEX: Where is my phone? "
            "MUM: Is it on your desk? "
            "ALEX: No, it isn't. "
            "MUM: Is it in your bag? "
            "ALEX: No, my bag is under the desk and the phone is not in it. "
            "MUM: Look behind the sofa. "
            "ALEX: Yes! It's here, behind the sofa. Thanks, Mum! "
            "MUM: Always behind something! Look next time.",
            "/static/audio/stage3/unit03/lesson_03.mp3",
            [
                {"question": "What is Alex looking for?", "options": ["his phone", "his book", "his cat", "his bag"], "correct_answer": "his phone"},
                {"question": "Is the phone on the desk?", "options": ["no", "yes"], "correct_answer": "no"},
                {"question": "Where is Alex's bag?", "options": ["under the desk", "on the bed", "in the wardrobe", "next to the sofa"], "correct_answer": "under the desk"},
                {"question": "Where is the phone?", "options": ["behind the sofa", "on the desk", "in the bag", "under the bed"], "correct_answer": "behind the sofa"},
                {"question": "Who helps Alex?", "options": ["Mum", "Dad", "Lucia", "Tom"], "correct_answer": "Mum"},
            ],
            "Alex can't find his phone and Mum helps."),
        production(
            "Hide something in your room (real or imagined). Tell a friend where it is using 3 prepositions.",
            "My bag is under the desk. My phone is on the chair. My book is next to the lamp.",
            ["Pick a thing: 'My ___'",
             "Pick a preposition: in / on / under / behind / next to",
             "Say it: 'My ___ is ___ the ___.'"]),
        exit_t("What did you learn?", [
            {"question": "The book is ___ the table.", "options": ["on", "in", "under"], "correct_answer": "on"},
            {"question": "The cat is ___ the bed (below it).", "options": ["under", "on", "behind"], "correct_answer": "under"},
            {"question": "The chair is ___ the desk (beside).", "options": ["next to", "in", "behind"], "correct_answer": "next to"},
            {"question": "A long soft seat in the living room is a ___.", "options": ["sofa", "bed", "shelf"], "correct_answer": "sofa"},
            {"question": "True or false: 'My clothes are in the wardrobe' means inside the wardrobe.", "options": ["True", "False"], "correct_answer": "True"},
        ]),
    ],
}

L4 = {
    "lesson_num": 4, "lesson_id": "stage_3_movers_unit_03_lesson_04", "number": 4,
    "title": "My home — Review", "topic": "Recycle rooms + things + prepositions. have got introduction.", "extra_links": [],
    "steps": [
        warm_up("Look at three different rooms. Whose is whose?", [
            {"question_text": "It has a sofa, a TV and a small table. It's a...", "correct_answer": "living room",
             "options": ["living room", "bedroom", "kitchen", "garden"], "image_emoji": "🛋️"},
            {"question_text": "It has a bed, a wardrobe and a desk. It's a...", "correct_answer": "bedroom",
             "options": ["bedroom", "living room", "bathroom", "hall"], "image_emoji": "🛏️"},
        ]),
        {"step": 2, "type": "vocabulary_review", "items": L1_VOCAB + L2_VOCAB + L3_VOCAB},
        {"step": 3, "type": "vocab_games", "games": []},
        reading("Three rooms",
            "Look at three friends' rooms. Lucia's room is big. There is a bed and a wardrobe. There are two posters on the wall. "
            "Tom's room is busy. There is a desk with a computer. There are three shelves with books. There are two chairs. "
            "Alex's room is small. There is a bed in the corner. The cat is on the sofa under the window. "
            "Three friends, three different rooms — but they are all happy with their rooms.",
            "Three teenagers' bedrooms side by side.",
            [
                {"question": "Whose room is big?", "options": ["Lucia's", "Tom's", "Alex's", "Mum's"], "correct_answer": "Lucia's"},
                {"question": "Whose room has a computer?", "options": ["Tom's", "Lucia's", "Alex's", "Mum's"], "correct_answer": "Tom's"},
                {"question": "Where is Alex's cat?", "options": ["on the sofa", "under the bed", "in the wardrobe", "on the desk"], "correct_answer": "on the sofa"},
                {"question": "How many friends?", "options": ["three", "two", "four", "five"], "correct_answer": "three"},
                {"question": "Are they all happy?", "options": ["yes", "no"], "correct_answer": "yes"},
            ]),
        {"step": 6, "type": "grammar_review", "patterns": [
            "there is + singular (a kitchen, a bed)",
            "there are + plural (two chairs, three books)",
            "Prepositions: in, on, under, behind, next to",
            "have got — introduction (I have a desk. She has a computer.)",
        ]},
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            "GUIDE: Welcome to our house! Let me show you. This is the hall. "
            "VISITOR: Lovely. "
            "GUIDE: There's the kitchen on the right. We cook there. There are three windows. "
            "VISITOR: And the living room? "
            "GUIDE: It's here, next to the kitchen. There is a big sofa and a TV. "
            "VISITOR: Are there bedrooms upstairs? "
            "GUIDE: Yes, there are four bedrooms and two bathrooms. And we have a small garden at the back. "
            "VISITOR: It's a beautiful home!",
            "/static/audio/stage3/unit03/lesson_04.mp3",
            [
                {"question": "What is the first room?", "options": ["the hall", "the kitchen", "the garden", "the bedroom"], "correct_answer": "the hall"},
                {"question": "How many windows in the kitchen?", "options": ["three", "two", "one", "four"], "correct_answer": "three"},
                {"question": "Where is the living room?", "options": ["next to the kitchen", "upstairs", "in the garden", "near the bathroom"], "correct_answer": "next to the kitchen"},
                {"question": "How many bedrooms?", "options": ["four", "three", "two", "five"], "correct_answer": "four"},
                {"question": "Is there a garden?", "options": ["yes, a small one", "no", "yes, a big one", "only a kitchen garden"], "correct_answer": "yes, a small one"},
            ],
            "A guide shows a visitor around a house."),
        production(
            "Welcome a friend to your home. Describe 2 rooms in 30 seconds.",
            "This is the kitchen. There is a fridge and a table. This is the living room. There is a sofa and a TV.",
            ["Pick room 1: 'This is the [room].'",
             "Add 1-2 things: 'There is a [thing].'",
             "Move to room 2: 'And this is the [room].'"]),
        exit_t("Unit 3 review", [
            {"question": "There ___ five rooms in my house.", "options": ["are", "is", "am"], "correct_answer": "are"},
            {"question": "Where do you sleep?", "options": ["bedroom", "kitchen", "garden"], "correct_answer": "bedroom"},
            {"question": "The cat is ___ the sofa (on top of).", "options": ["on", "under", "behind"], "correct_answer": "on"},
            {"question": "A long seat for 2-3 people is a ___.", "options": ["sofa", "shelf", "chair"], "correct_answer": "sofa"},
            {"question": "True or false: 'There is a TV.' is about ONE TV.", "options": ["True", "False"], "correct_answer": "True"},
        ]),
    ],
}

unit = {"stage": "stage_3", "stage_title": "Movers (A1)", "units": [{
    "unit_id": "stage_3_movers_unit_03", "unit_num": 3, "title": "My home",
    "subtitle": "Rooms, things in your room, and where they are — aligned with Cambridge Prepare Lv1 Unit 3.",
    "phonics_focus": "/ð/ vs /θ/ in 'this' / 'three' / 'bathroom'",
    "grammar_focus": "there is / there are; prepositions (in/on/under/behind/next to); have got (intro).",
    "spiral_meta": {"prepare_alignment": {"source": "Cambridge Prepare 2nd Edition Level 1 — Unit 3 'My home' (SB p24-27)",
                                          "wordlist_coverage_pct": 100,
                                          "extracted_from": "backend/content/cambridge_refs/prepare_lv1_unit_breakdowns.json"},
                   "anchor_character_names_recycled": ["Lucia", "Tom", "Alex"]},
    "lessons": [L1, L2, L3, L4],
}]}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(unit, indent=2, ensure_ascii=False))
print(f"✓ Wrote {OUT}")
for i, l in enumerate(unit["units"][0]["lessons"]):
    r = next(s for s in l["steps"] if s["type"] == "micro_reading")
    li = next(s for s in l["steps"] if s["type"] == "listening")
    print(f"  L{i+1} {l['title']!r}: reading={len(r['text'].split())}w listening={len(li['audio_text'].split())}w")
