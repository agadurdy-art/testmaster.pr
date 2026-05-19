#!/usr/bin/env python3
"""Stage 3 Unit 04 v2 — Prepare Lv1 Unit 4 "My things" alignment.
4 lessons: schoolbag items → adjectives → have got positive → review +
have got negative. Anchor names: Ben, Emma, Pablo."""
import json, re
from pathlib import Path
OUT = Path(__file__).resolve().parent.parent / "content/enriched/stage3_unit04_enriched.json"

L1_VOCAB = ["schoolbag", "book", "notebook", "pen", "pencil", "rubber", "ruler", "pencil case"]
L2_VOCAB = ["dictionary", "calculator", "tablet", "water bottle", "big", "small", "new", "old"]
L3_VOCAB = ["beautiful", "good", "nice", "ugly", "long", "short", "favourite"]

DEFS = {
    "schoolbag":   ("🎒", "A bag you take to school for books and pens.",       "My schoolbag is heavy today."),
    "book":        ("📖", "Pages with words you read.",                          "I read a book about animals."),
    "notebook":    ("📓", "A small book with empty pages for writing.",          "My notebook is blue."),
    "pen":         ("🖊️", "A thing you write with — in ink.",                   "Can I use your pen?"),
    "pencil":      ("✏️", "A thing you write or draw with — in grey.",          "I have two pencils."),
    "rubber":      ("✏️", "A small thing that removes pencil marks.",            "Where is my rubber? I made a mistake."),
    "ruler":       ("📏", "A flat thing for measuring or drawing straight lines.","Use a ruler to draw a line."),
    "pencil case": ("👝", "A small bag for your pens and pencils.",             "My pencil case is full."),
    "dictionary":  ("📚", "A book that explains the meaning of words.",          "Look up the word in the dictionary."),
    "calculator":  ("🔢", "A small machine for doing maths.",                    "I need a calculator for this question."),
    "tablet":      ("📱", "A flat computer with a touch screen.",                "I read books on my tablet."),
    "water bottle":("💧", "A bottle for drinking water.",                        "My water bottle is empty."),
    "big":         ("🦒", "Not small. Large in size.",                           "My schoolbag is big."),
    "small":       ("🐭", "Not big. Little in size.",                            "I have a small calculator."),
    "new":         ("✨", "Just bought. Not used yet.",                          "Ben has a new pen."),
    "old":         ("🕰️", "Not new. Used for a long time.",                     "Emma's notebook is old."),
    "beautiful":   ("🌸", "Very nice to look at.",                               "She has a beautiful pencil case."),
    "good":        ("👍", "Useful or nice.",                                     "It's a good book."),
    "nice":        ("😊", "Pleasant. You like it.",                              "What a nice pencil!"),
    "ugly":        ("👎", "Not nice to look at.",                                "My old bag is a bit ugly."),
    "long":        ("📏", "Not short. From end to end is far.",                  "I have a long ruler."),
    "short":       ("📐", "Not long. From end to end is small.",                 "My pencil is short now."),
    "favourite":   ("⭐", "The one you like most.",                              "Red is my favourite colour."),
}

def vi(w):
    e, d, ex = DEFS[w]
    return {"word": w, "definition": d, "image_emoji": e, "image_url": "",
            "example_sentence": ex, "asset_slug": "stage3_u04_" + re.sub(r"\W+", "_", w.lower())}

def warm_up(i, q): return {"step": 1, "type": "warm_up", "video_url": "", "instruction": i, "questions": q}
def vocab(items): return {"step": 2, "type": "vocabulary", "items": items}
def reading(t, txt, sc, q): return {"step": 5, "type": "micro_reading", "title": t, "text": txt, "scene_description": sc, "questions": q}
def grammar(r, e, ex): return {"step": 6, "type": "grammar_focus", "rule_pattern": r, "explanation": e, "examples": ex}
def listening(at, url, q, sc=""): return {"step": 9, "type": "listening", "audio_text": at, "audio_url": url, "scene_description": sc, "questions": q}
def production(p, e, s, img=""): return {"step": 10, "type": "production", "production_type": "speaking", "prompt": p, "expected_text": e, "prompts": s, "image_url": img}
def exit_t(t, q): return {"step": 11, "type": "exit_ticket", "title": t, "questions": q}

# ═══════ L1 — "Inside my schoolbag" ═══════════════════════════════════════════
L1 = {
    "lesson_num": 1, "lesson_id": "stage_3_movers_unit_04_lesson_01", "number": 1,
    "title": "Inside my schoolbag", "topic": "8 school-bag things + simple 'I have' / 'I've got' intro",
    "extra_links": [],
    "steps": [
        warm_up("Look at Ben's schoolbag. What can you see?", [
            {"question_text": "Something you write with in ink:", "correct_answer": "a pen",
             "options": ["a pen", "a rubber", "a ruler", "a notebook"], "image_emoji": "🖊️"},
            {"question_text": "Something you use to remove pencil marks:", "correct_answer": "a rubber",
             "options": ["a rubber", "a book", "a ruler", "a pencil"], "image_emoji": "🧽"},
        ]),
        vocab([vi(w) for w in L1_VOCAB]),
        {"step": 3, "type": "vocab_games", "games": []},
        reading("Ben's schoolbag",
            "Hi! I'm Ben. This is my schoolbag. It's blue and very big. Look inside! "
            "I've got a book — it's my English book. I've got a notebook. It's small and red. "
            "I've got two pens and three pencils in my pencil case. "
            "I've got a rubber and a ruler too. My schoolbag is heavy today, but it's ready for school. "
            "What have you got in your schoolbag?",
            "A teenager's blue schoolbag with the contents spread out on a desk.",
            [
                {"question": "What colour is Ben's schoolbag?", "options": ["blue", "red", "black", "green"], "correct_answer": "blue"},
                {"question": "Is Ben's schoolbag big or small?", "options": ["big", "small", "medium", "tiny"], "correct_answer": "big"},
                {"question": "How many pencils has Ben got?", "options": ["three", "two", "one", "four"], "correct_answer": "three"},
                {"question": "What colour is the notebook?", "options": ["red", "blue", "green", "white"], "correct_answer": "red"},
                {"question": "Has Ben got a rubber?", "options": ["yes", "no"], "correct_answer": "yes"},
            ]),
        grammar("have got — introduction (positive)",
            "We use 'have got' to talk about things that are ours. With I, you, we, they we say 'have got'. We often shorten 'I have got' to 'I've got'. We use 'have got' for things, family, or pets.",
            ["I've got a pen.", "I have got two books.", "You've got a nice schoolbag.", "We've got pencils.", "They have got rulers."]),
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            "TEACHER: Open your bags, please. Ben, what have you got? "
            "BEN: I've got a book, a notebook and three pencils. "
            "TEACHER: Have you got a pen? "
            "BEN: Yes, I have. I've got two pens. "
            "TEACHER: Good. And a ruler? "
            "BEN: Yes, I've got a ruler and a rubber. "
            "TEACHER: Excellent! You're ready for the lesson, Ben.",
            "/static/audio/stage3/unit04/lesson_01.mp3",
            [
                {"question": "What does the teacher say first?", "options": ["Open your bags", "Close your books", "Sit down", "Stand up"], "correct_answer": "Open your bags"},
                {"question": "How many pens has Ben got?", "options": ["two", "one", "three", "none"], "correct_answer": "two"},
                {"question": "Has Ben got a ruler?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "Is Ben ready for the lesson?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "What does Ben have apart from pens and pencils?", "options": ["a notebook and a rubber", "a phone", "a sandwich", "a poster"], "correct_answer": "a notebook and a rubber"},
            ],
            "A teacher checks Ben's bag at the start of class."),
        production(
            "What have YOU got in your schoolbag? Tell us 3 things using 'I've got...'",
            "I've got a pen and two pencils. I've got a notebook and a book.",
            ["Pick 3 things: pen / pencil / book / notebook / rubber / ruler",
             "Use: 'I've got a ___ and a ___.'",
             "Add a number: 'I've got two pencils.'"]),
        exit_t("What did you learn?", [
            {"question": "Something you write with in ink is a ___.", "options": ["pen", "rubber", "ruler"], "correct_answer": "pen"},
            {"question": "Choose: I ___ got a book.", "options": ["have", "is", "are"], "correct_answer": "have"},
            {"question": "Choose: She ___ got a pencil.", "options": ["has", "have", "is"], "correct_answer": "has"},
            {"question": "A small bag for pens is a ___.", "options": ["pencil case", "schoolbag", "notebook"], "correct_answer": "pencil case"},
            {"question": "True or false: 'I've got' means 'I have'.", "options": ["True", "False"], "correct_answer": "True"},
        ]),
    ],
}

# ═══════ L2 — "Big or small?" ═════════════════════════════════════════════════
L2 = {
    "lesson_num": 2, "lesson_id": "stage_3_movers_unit_04_lesson_02", "number": 2,
    "title": "Big or small?", "topic": "4 more things + adjectives big/small/new/old + have got (he/she/it)",
    "extra_links": [],
    "steps": [
        warm_up("Look at Emma's old tablet and new tablet. Match the adjective.", [
            {"question_text": "Not new — used for a long time:", "correct_answer": "old",
             "options": ["old", "new", "big", "small"], "image_emoji": "🕰️"},
            {"question_text": "Just bought — never used:", "correct_answer": "new",
             "options": ["new", "old", "big", "small"], "image_emoji": "✨"},
        ]),
        vocab([vi(w) for w in L2_VOCAB]),
        {"step": 3, "type": "vocab_games", "games": []},
        reading("Emma's school things",
            "Hi! I'm Emma. I'm 11. My friend Ben has got a small schoolbag. "
            "Mine is big — much bigger! In my big bag, I've got a new tablet for English lessons. "
            "I've got a small dictionary too. It's old but I love it. It's from my dad. "
            "I've got a calculator for maths. It's small and new. I've also got a water bottle. "
            "It's pink. My favourite thing? My new tablet, of course!",
            "A girl holding a big schoolbag with new and old items on a table.",
            [
                {"question": "Whose schoolbag is bigger — Ben's or Emma's?", "options": ["Emma's", "Ben's", "the same size", "we don't know"], "correct_answer": "Emma's"},
                {"question": "Emma's tablet is...", "options": ["new", "old", "big", "small"], "correct_answer": "new"},
                {"question": "Who gave Emma the dictionary?", "options": ["her dad", "her mum", "her teacher", "her brother"], "correct_answer": "her dad"},
                {"question": "What colour is Emma's water bottle?", "options": ["pink", "blue", "red", "green"], "correct_answer": "pink"},
                {"question": "What is Emma's favourite thing?", "options": ["her new tablet", "her dictionary", "her calculator", "her water bottle"], "correct_answer": "her new tablet"},
            ]),
        grammar("have got — he / she / it",
            "When we talk about ONE other person (he or she) or a thing (it), we use 'has got' (not 'have got'). We often shorten 'he has got' to 'he's got'. Note: 'he's got' = he HAS got, not 'he is'.",
            ["He has got a small bag.", "She's got a new tablet.", "It has got two pockets.", "My dad has got an old dictionary.", "Emma's got a pink water bottle."]),
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            "EMMA: Look at my new tablet, Pablo! "
            "PABLO: Wow! It's nice and big. "
            "EMMA: Yes, it's new. Have you got a tablet? "
            "PABLO: No, I haven't. But I've got a small calculator. "
            "EMMA: My calculator is small too. Look. "
            "PABLO: Nice. And what about a dictionary? "
            "EMMA: Yes, I've got one. It's old, but it's good. My dad has got the same one. "
            "PABLO: Cool! My sister has got a dictionary too.",
            "/static/audio/stage3/unit04/lesson_02.mp3",
            [
                {"question": "Whose tablet is new?", "options": ["Emma's", "Pablo's", "Pablo's sister's", "Emma's dad's"], "correct_answer": "Emma's"},
                {"question": "Has Pablo got a tablet?", "options": ["no", "yes"], "correct_answer": "no"},
                {"question": "What has Pablo got for maths?", "options": ["a small calculator", "a big calculator", "a phone", "nothing"], "correct_answer": "a small calculator"},
                {"question": "Is Emma's dictionary new?", "options": ["no, it's old", "yes, it's new", "very new", "we don't know"], "correct_answer": "no, it's old"},
                {"question": "Who has got the same dictionary as Emma?", "options": ["her dad", "Pablo", "her mum", "Pablo's sister"], "correct_answer": "her dad"},
            ],
            "Two friends compare what they have got."),
        production(
            "Tell us about a friend's school things. Use 'He/She has got...'",
            "She's got a new tablet. He's got an old book. She's got a small pencil case.",
            ["Pick a friend: 'My friend ___'",
             "Use 'He's got' or 'She's got' + thing.",
             "Add an adjective: 'small / big / new / old'."]),
        exit_t("What did you learn?", [
            {"question": "Choose: He ___ got a calculator.", "options": ["has", "have", "is"], "correct_answer": "has"},
            {"question": "Choose: She ___ a new pen.", "options": ["has got", "have got", "is got"], "correct_answer": "has got"},
            {"question": "Just bought, never used =", "options": ["new", "old", "big"], "correct_answer": "new"},
            {"question": "A small machine for maths is a ___.", "options": ["calculator", "dictionary", "tablet"], "correct_answer": "calculator"},
            {"question": "True or false: 'She's got' can mean 'she has got'.", "options": ["True", "False"], "correct_answer": "True"},
        ]),
    ],
}

# ═══════ L3 — "What's it like?" ═══════════════════════════════════════════════
L3 = {
    "lesson_num": 3, "lesson_id": "stage_3_movers_unit_04_lesson_03", "number": 3,
    "title": "What's it like?", "topic": "More adjectives (beautiful, good, nice, ugly, long, short, favourite) + have got — negative",
    "extra_links": [],
    "steps": [
        warm_up("Look at Pablo's two rulers. Which is which?", [
            {"question_text": "30 cm = ___", "correct_answer": "long",
             "options": ["long", "short", "small", "ugly"], "image_emoji": "📏"},
            {"question_text": "10 cm = ___", "correct_answer": "short",
             "options": ["short", "long", "big", "beautiful"], "image_emoji": "📐"},
        ]),
        vocab([vi(w) for w in L3_VOCAB]),
        {"step": 3, "type": "vocab_games", "games": []},
        reading("Pablo's favourite things",
            "Hi! I'm Pablo. I'm from Spain. I've got some favourite things in my schoolbag. "
            "My favourite pencil case is small and beautiful. It's green with stars on it. "
            "I've got a new pen — it's long and nice. I haven't got an old pen — only this new one. "
            "My ruler is short, only 15 centimetres. My friend Ben has got a long ruler. "
            "I've got a good dictionary, but I haven't got a calculator. Mum says, "
            "'You don't need one, Pablo!' But I want one!",
            "A schoolboy showing his favourite school items with pride.",
            [
                {"question": "Where is Pablo from?", "options": ["Spain", "Brazil", "Italy", "Russia"], "correct_answer": "Spain"},
                {"question": "What is Pablo's pencil case like?", "options": ["small and beautiful", "big and ugly", "long and old", "new but small"], "correct_answer": "small and beautiful"},
                {"question": "Has Pablo got an old pen?", "options": ["no", "yes"], "correct_answer": "no"},
                {"question": "How long is Pablo's ruler?", "options": ["15 cm", "30 cm", "10 cm", "20 cm"], "correct_answer": "15 cm"},
                {"question": "Has Pablo got a calculator?", "options": ["no", "yes"], "correct_answer": "no"},
                {"question": "Who has got a long ruler?", "options": ["Ben", "Pablo", "Mum", "Emma"], "correct_answer": "Ben"},
            ]),
        grammar("have got — negative",
            "To say 'no, I don't have something', we use 'haven't got' (I/you/we/they) or 'hasn't got' (he/she/it). 'Haven't' is short for 'have not'; 'hasn't' is short for 'has not'.",
            ["I haven't got a calculator.", "You haven't got a tablet.", "She hasn't got an old dictionary.", "He hasn't got a long ruler.", "We haven't got a pencil case."]),
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            "BEN: Pablo, have you got a calculator? I need one for maths. "
            "PABLO: No, I haven't. Sorry. "
            "BEN: Emma, have you got one? "
            "EMMA: Yes, I have. Here you are. "
            "BEN: Thanks, Emma! It's new. "
            "EMMA: Yes, it is. It's small and new. "
            "BEN: My calculator is at home. I haven't got it today. "
            "EMMA: No problem. You can use mine.",
            "/static/audio/stage3/unit04/lesson_03.mp3",
            [
                {"question": "What does Ben need?", "options": ["a calculator", "a pen", "a ruler", "a dictionary"], "correct_answer": "a calculator"},
                {"question": "Has Pablo got a calculator?", "options": ["no", "yes"], "correct_answer": "no"},
                {"question": "Who lends Ben a calculator?", "options": ["Emma", "Pablo", "the teacher", "Mum"], "correct_answer": "Emma"},
                {"question": "What is Emma's calculator like?", "options": ["small and new", "big and old", "long and new", "small and ugly"], "correct_answer": "small and new"},
                {"question": "Why hasn't Ben got his calculator?", "options": ["it's at home", "it's broken", "he lost it", "he doesn't have one"], "correct_answer": "it's at home"},
            ],
            "Three classmates help each other with school things."),
        production(
            "Tell us TWO things you've got and ONE thing you haven't got.",
            "I've got a new pen and a small calculator. I haven't got a tablet.",
            ["Two things you have: 'I've got a ___ and a ___'",
             "One thing you don't: 'I haven't got a ___'",
             "Add an adjective: 'small / new / beautiful / good'."]),
        exit_t("What did you learn?", [
            {"question": "Choose: I ___ got a tablet.", "options": ["haven't", "hasn't", "isn't"], "correct_answer": "haven't"},
            {"question": "Choose: He ___ got a ruler.", "options": ["hasn't", "haven't", "isn't"], "correct_answer": "hasn't"},
            {"question": "Very nice to look at =", "options": ["beautiful", "ugly", "old"], "correct_answer": "beautiful"},
            {"question": "The one you like most =", "options": ["favourite", "new", "short"], "correct_answer": "favourite"},
            {"question": "True or false: 'haven't got' means 'don't have'.", "options": ["True", "False"], "correct_answer": "True"},
        ]),
    ],
}

# ═══════ L4 — Review ═════════════════════════════════════════════════════════
L4 = {
    "lesson_num": 4, "lesson_id": "stage_3_movers_unit_04_lesson_04", "number": 4,
    "title": "My things — Review", "topic": "Recycle all schoolbag vocab + have got pos/neg.",
    "extra_links": [],
    "steps": [
        warm_up("Look at three schoolbags. Whose is whose?", [
            {"question_text": "A small green bag with a beautiful pencil case = ___", "correct_answer": "Pablo's",
             "options": ["Pablo's", "Ben's", "Emma's", "Mum's"], "image_emoji": "🟢"},
            {"question_text": "A big bag with a new tablet = ___", "correct_answer": "Emma's",
             "options": ["Emma's", "Ben's", "Pablo's", "Dad's"], "image_emoji": "📱"},
        ]),
        {"step": 2, "type": "vocabulary_review", "items": L1_VOCAB + L2_VOCAB + L3_VOCAB},
        {"step": 3, "type": "vocab_games", "games": []},
        reading("Whose schoolbag?",
            "Three schoolbags, three friends. Ben's bag is blue and big. He's got two pens, three pencils, a ruler and a rubber. "
            "Emma's bag is big and red. She's got a new tablet, a small calculator and a pink water bottle. Her dictionary is old but good. "
            "Pablo's bag is green and small. He's got a beautiful pencil case but he hasn't got a calculator. His ruler is short. "
            "All three friends are happy with their things!",
            "Three schoolbags side by side with the owners' names labelled.",
            [
                {"question": "Whose bag is blue?", "options": ["Ben's", "Emma's", "Pablo's", "Dad's"], "correct_answer": "Ben's"},
                {"question": "Who has got a new tablet?", "options": ["Emma", "Ben", "Pablo", "Mum"], "correct_answer": "Emma"},
                {"question": "Whose ruler is short?", "options": ["Pablo's", "Ben's", "Emma's", "the teacher's"], "correct_answer": "Pablo's"},
                {"question": "Who hasn't got a calculator?", "options": ["Pablo", "Ben", "Emma", "everyone"], "correct_answer": "Pablo"},
                {"question": "Are the friends happy?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "How many friends?", "options": ["three", "two", "four", "one"], "correct_answer": "three"},
            ]),
        {"step": 6, "type": "grammar_review", "patterns": [
            "have got — positive (I/you/we/they 've got; he/she/it 's got)",
            "have got — negative (haven't got / hasn't got)",
            "Adjectives: big, small, new, old, beautiful, nice, ugly, long, short, favourite",
        ]},
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            "TEACHER: OK, class. Let's check your bags. Emma? "
            "EMMA: I've got a tablet, a calculator and a dictionary. "
            "TEACHER: Have you got a pen? "
            "EMMA: Yes, two pens. "
            "TEACHER: Pablo? "
            "PABLO: I've got a notebook and three pencils. I haven't got a calculator. "
            "TEACHER: That's OK. Ben? "
            "BEN: I've got everything! Books, pens, a ruler, a rubber. My bag is heavy. "
            "TEACHER: Excellent. You're all ready for the lesson!",
            "/static/audio/stage3/unit04/lesson_04.mp3",
            [
                {"question": "How many pens has Emma got?", "options": ["two", "one", "three", "none"], "correct_answer": "two"},
                {"question": "Has Pablo got a calculator?", "options": ["no", "yes"], "correct_answer": "no"},
                {"question": "Whose bag is heavy?", "options": ["Ben's", "Emma's", "Pablo's", "the teacher's"], "correct_answer": "Ben's"},
                {"question": "Are the class ready?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "What does Pablo have?", "options": ["a notebook and three pencils", "two pens", "a tablet", "a long ruler"], "correct_answer": "a notebook and three pencils"},
            ],
            "A teacher checks the class's school things."),
        production(
            "Describe your schoolbag in 30 seconds. Use have got + 2 adjectives + 1 negative.",
            "I've got a big blue schoolbag. I've got two new pens. I haven't got a tablet.",
            ["Bag: 'I've got a [colour] schoolbag.'",
             "Two things + adjective: 'I've got a [adj] [thing].'",
             "Negative: 'I haven't got a [thing].'"]),
        exit_t("Unit 4 review", [
            {"question": "Choose: She ___ got a calculator.", "options": ["has", "have", "is"], "correct_answer": "has"},
            {"question": "Choose: I ___ got a tablet.", "options": ["haven't", "hasn't", "isn't"], "correct_answer": "haven't"},
            {"question": "30 cm is ___.", "options": ["long", "short", "ugly"], "correct_answer": "long"},
            {"question": "The one you like most is your ___ thing.", "options": ["favourite", "old", "new"], "correct_answer": "favourite"},
            {"question": "True or false: 'He's got a pen' = 'He has got a pen'.", "options": ["True", "False"], "correct_answer": "True"},
        ]),
    ],
}

unit = {"stage": "stage_3", "stage_title": "Movers (A1)", "units": [{
    "unit_id": "stage_3_movers_unit_04", "unit_num": 4, "title": "My things",
    "subtitle": "What's in your schoolbag? Things and adjectives — aligned with Cambridge Prepare Lv1 Unit 4.",
    "phonics_focus": "/v/ sound in 'have got' (not /f/)",
    "grammar_focus": "have got — positive and negative; descriptive adjectives.",
    "spiral_meta": {"prepare_alignment": {"source": "Cambridge Prepare 2nd Edition Level 1 — Unit 4 'My things' (SB p30-33)",
                                          "wordlist_coverage_pct": 100,
                                          "extracted_from": "backend/content/cambridge_refs/prepare_lv1_unit_breakdowns.json"},
                   "anchor_character_names_recycled": ["Ben", "Emma", "Pablo"]},
    "lessons": [L1, L2, L3, L4],
}]}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(unit, indent=2, ensure_ascii=False))
print(f"✓ Wrote {OUT}")
for i, l in enumerate(unit["units"][0]["lessons"]):
    r = next(s for s in l["steps"] if s["type"] == "micro_reading")
    li = next(s for s in l["steps"] if s["type"] == "listening")
    print(f"  L{i+1} {l['title']!r}: reading={len(r['text'].split())}w listening={len(li['audio_text'].split())}w")
