#!/usr/bin/env python3
"""
Build Stage 3 Unit 02 v2 — strictly aligned to Cambridge Prepare 2e Level 1
Unit 2 "My family" wordlist + grammar.

Old Unit 02 used Movers wordlist freely (extended family words, look like,
beard, moustache, curly, fair...) which DON'T appear in Prepare Lv1 Unit 2
(that's Prepare Lv2 / Unit 3+ territory). Aga's call 2026-05-19:
"icerik prepare book olmali ki ogrenci sorun yasamasin" — student uses
Prepare in class, practices on testmaster at home, scopes must match.

Source: backend/content/cambridge_refs/prepare_lv1_unit_breakdowns.json
Target: backend/content/enriched/stage3_unit02_enriched.json

Sub-topic split (Prepare U2 has 2 vocab sections + 3 grammar items):
- L1: "Meet the family"        — Families vocab pt1, Determiners (my/your/...)
- L2: "More about families"    — Families vocab pt2, Possessive 's
- L3: "How do you feel?"       — Feelings adjectives, be: short answers
- L4: "My family review"       — Recycle + Pronunciation /ə/ + writing

Anchor character names from Prepare passages: David, Helena, Isabel, Inca,
Eva, Ruby. Reusing these names so the student recognises them from class;
all passage text + dialogue is ORIGINAL (IP boundary).

After writing, run:
  python backend/scripts/pack_unit_games.py --unit 02
to attach the 3-game packs.
"""

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
REFS = REPO_ROOT / "backend/content/cambridge_refs/prepare_lv1_unit_breakdowns.json"
OUT  = REPO_ROOT / "backend/content/enriched/stage3_unit02_enriched.json"

# ─── Load Prepare breakdown ──────────────────────────────────────────────────
prep = json.loads(REFS.read_text())
u2 = next(u for u in prep["units"] if u["unit_num"] == 2)

FAMILIES = u2["vocab_sections"]["families"]
FEELINGS = u2["vocab_sections"]["adjectives_feelings"]

# Sub-topic split: distribute Families across L1+L2 so each lesson has a
# manageable group; Feelings go to L3.
L1_FAMILIES = ["mum", "dad", "brother", "sister", "baby", "parents"]
L2_FAMILIES = ["mother", "father", "husband", "wife", "son", "daughter", "children", "family"]
assert set(L1_FAMILIES + L2_FAMILIES) == set(FAMILIES), \
    f"Coverage mismatch: {set(L1_FAMILIES + L2_FAMILIES) ^ set(FAMILIES)}"

L3_FEELINGS = FEELINGS

# ─── Vocab item shape ────────────────────────────────────────────────────────
# Frontend renderer expects: {word, definition, image_emoji, image_url?,
# example_sentence}. The image_url is filled by the pollinations script
# later; we leave it empty here and ship emoji fallback.

VOCAB_DEFS = {
    "mum":      ("👩",   "Your female parent. Same as 'mother', friendly word.",      "My mum is from Brazil."),
    "dad":      ("👨",   "Your male parent. Same as 'father', friendly word.",        "My dad is a teacher."),
    "mother":   ("👩‍🦱", "Your female parent.",                                       "Helena is the mother of three children."),
    "father":   ("👨‍🦱", "Your male parent.",                                         "David is Isabel's father."),
    "brother":  ("👦",   "A boy with the same parents as you.",                       "I have one brother, his name is Sam."),
    "sister":   ("👧",   "A girl with the same parents as you.",                      "Inca's sister is Eva."),
    "husband":  ("🤵",   "A woman's male partner in marriage.",                        "Helena's husband is David."),
    "wife":     ("👰",   "A man's female partner in marriage.",                        "David's wife is Helena."),
    "son":      ("🧒",   "A male child of a parent.",                                  "They have one son."),
    "daughter": ("👧",   "A female child of a parent.",                                "Inca is David's daughter."),
    "baby":     ("👶",   "A very young child.",                                        "Helena's baby is six months old."),
    "parents":  ("👨‍👩‍👧","Your mother and father together.",                          "Inca's parents are Helena and David."),
    "children": ("👨‍👩‍👧‍👦","More than one boy or girl.",                               "Helena has four children."),
    "family":   ("👪",   "A group of people related to you.",                          "We are a big family — six of us."),
    # Feelings
    "bored":    ("😑",   "Not interested. Nothing fun to do.",                         "I'm bored in this lesson."),
    "clever":   ("🧠",   "Quick at learning. Smart.",                                  "She's a clever student."),
    "funny":    ("😂",   "Makes you laugh.",                                           "Dad is funny."),
    "happy":    ("😊",   "You feel good. You smile.",                                  "The baby is happy today."),
    "hot":      ("🥵",   "Too warm — you feel uncomfortable.",                         "I'm hot — open the window!"),
    "hungry":   ("🍽️",   "You want to eat food.",                                      "Are you hungry? Let's eat."),
    "sad":      ("😢",   "You don't feel good. You cry.",                              "Inca is sad — her cat is sick."),
    "thirsty":  ("💧",   "You want to drink water.",                                   "I'm thirsty — water, please."),
    "tired":    ("😴",   "You want to sleep or rest.",                                 "It's late — I'm tired."),
}

def vocab_item(word):
    emoji, definition, example = VOCAB_DEFS[word]
    safe = re.sub(r"\W+", "_", word)
    return {
        "word": word,
        "definition": definition,
        "image_emoji": emoji,
        "image_url": "",  # populated by generate_images_pollinations.py
        "example_sentence": example,
        "asset_slug": f"stage3_u02_{safe}",
    }

# ─── Lesson builders ─────────────────────────────────────────────────────────

def warm_up(instruction, questions):
    return {
        "step": 1,
        "type": "warm_up",
        "video_url": "",
        "instruction": instruction,
        "questions": questions,
    }

def vocabulary(items):
    return {"step": 2, "type": "vocabulary", "items": items}

def micro_reading(title, text, scene_description, questions):
    # step 5 — placed AFTER the vocab_games slot (3) and the pack-reserved
    # drop slot (4). pack_unit_games drops step 4 + step 8, so we use 5/6/9/10
    # for the prose/grammar/listening/production steps.
    return {
        "step": 5,
        "type": "micro_reading",
        "title": title,
        "text": text,
        "scene_description": scene_description,
        "questions": questions,
    }

def grammar_focus(rule_pattern, explanation, examples):
    return {
        "step": 6,
        "type": "grammar_focus",
        "rule_pattern": rule_pattern,
        "explanation": explanation,
        "examples": examples,
    }

def listening(audio_text, audio_url, questions, scene_description=""):
    return {
        "step": 9,
        "type": "listening",
        "audio_text": audio_text,
        "audio_url": audio_url,
        "scene_description": scene_description,
        "questions": questions,
    }

def production(prompt, expected_text, scaffold_prompts, image_url=""):
    return {
        "step": 10,
        "type": "production",
        "production_type": "speaking",
        "prompt": prompt,
        "expected_text": expected_text,
        "prompts": scaffold_prompts,
        "image_url": image_url,
    }

def exit_ticket(title, questions):
    return {
        "step": 11,
        "type": "exit_ticket",
        "title": title,
        "questions": questions,
    }


# ═══════════ LESSON 1 — "Meet the family" ═══════════════════════════════════
L1 = {
    "lesson_num": 1,
    "lesson_id": "stage_3_movers_unit_02_lesson_01",
    "number": 1,
    "title": "Meet the family",
    "topic": "Family relations — mum, dad, brother, sister, baby, parents. Determiners (my, your).",
    "extra_links": [],
    "steps": [
        warm_up(
            "Look at Ruby's family photo. Answer.",
            [
                {"question_text": "Who is in Ruby's family?", "correct_answer": "her mum, her dad and her brother",
                 "options": ["her mum, her dad and her brother", "her cousins", "her teacher", "her friends"],
                 "image_emoji": "👨‍👩‍👦"},
                {"question_text": "How old is Ruby?", "correct_answer": "11",
                 "options": ["11", "5", "15", "20"], "image_emoji": "🎂"},
            ],
        ),
        vocabulary([vocab_item(w) for w in L1_FAMILIES]),
        # Step 3 vocab_games will be packed by pack_unit_games.py
        {"step": 3, "type": "vocab_games", "games": []},  # populated by pack_unit_games.py
        micro_reading(
            title="My family",
            text=(
                "Hi! I'm Ruby. I'm 11. This is my family. My mum is from Spain — her name is Sofia. "
                "My dad is from the UK — his name is Mark. I have one brother — his name is Sam. "
                "Sam is 9. We have a baby in our family too — her name is Lily. Lily is one. "
                "My parents are kind and my brother is funny. I love my family."
            ),
            scene_description="A family photo on a sofa: mother, father, an 11-year-old girl, a 9-year-old boy, and a baby.",
            questions=[
                {"question": "How old is Ruby?", "options": ["11", "9", "1", "20"], "correct_answer": "11"},
                {"question": "Where is Ruby's mum from?", "options": ["Spain", "the UK", "Brazil", "Italy"], "correct_answer": "Spain"},
                {"question": "What is the name of Ruby's brother?", "options": ["Sam", "Mark", "Lily", "Sofia"], "correct_answer": "Sam"},
                {"question": "Who is the baby in the family?", "options": ["Lily", "Sam", "Ruby", "Sofia"], "correct_answer": "Lily"},
                {"question": "Ruby's dad is from the UK. True or false?", "options": ["True", "False"], "correct_answer": "True"},
            ],
        ),
        grammar_focus(
            rule_pattern="Determiners — my, your",
            explanation="We use my and your to say who something belongs to. 'My mum' = the mum of me. 'Your brother' = the brother of you. We say 'my mum is from Spain' — not 'I mum'.",
            examples=[
                "My mum is from Spain.",
                "Your brother is funny.",
                "My dad is at home.",
                "Your sister is clever.",
                "My parents are kind.",
            ],
        ),
        {"step": 7, "type": "grammar_games", "games": []},  # populated by pack_unit_games.py
        listening(
            audio_text=(
                "Hi! I'm Mark. I'm Ruby's dad. This is my family. My wife is Sofia. We have two children — "
                "Ruby and Sam. Ruby is 11 and Sam is 9. We have a baby — her name is Lily. We are a happy family!"
            ),
            audio_url="/static/audio/stage3/unit02/lesson_01.mp3",
            scene_description="A father introduces his family at home.",
            questions=[
                {"question": "Who is talking?", "options": ["Mark", "Sofia", "Ruby", "Lily"], "correct_answer": "Mark"},
                {"question": "How many children does Mark have?", "options": ["two", "three", "one", "four"], "correct_answer": "two"},
                {"question": "Is Lily a baby?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "How old is Sam?", "options": ["9", "11", "1", "5"], "correct_answer": "9"},
                {"question": "Is the family happy?", "options": ["yes", "no"], "correct_answer": "yes"},
            ],
        ),
        production(
            prompt="Tell us about your family. Say 2-3 sentences with 'My mum...', 'My dad...', 'My brother/sister/baby...'.",
            expected_text="My mum is from [country]. My dad is [job/from]. My brother is [age/name].",
            scaffold_prompts=[
                "Start: 'My mum is...' or 'My dad is...'",
                "Add one more person: 'My brother is...' or 'My sister is...'",
                "Say one feeling: 'My family is happy/funny/kind.'",
            ],
            image_url="",
        ),
        exit_ticket(
            title="What did you learn?",
            questions=[
                {"question": "Choose: ___ mum is from Spain.", "options": ["My", "I", "Me"], "correct_answer": "My"},
                {"question": "Choose: ___ dad is funny.", "options": ["Your", "You", "I"], "correct_answer": "Your"},
                {"question": "A very young child is a ___.", "options": ["baby", "brother", "parent"], "correct_answer": "baby"},
                {"question": "Your mother and father together are your ___.", "options": ["parents", "children", "babies"], "correct_answer": "parents"},
                {"question": "True or false: 'My brother' means the brother of me.", "options": ["True", "False"], "correct_answer": "True"},
            ],
        ),
    ],
}


# ═══════════ LESSON 2 — "More about families" ═══════════════════════════════
L2 = {
    "lesson_num": 2,
    "lesson_id": "stage_3_movers_unit_02_lesson_02",
    "number": 2,
    "title": "More about families",
    "topic": "Family relations — mother, father, husband, wife, son, daughter, children, family. Possessive 's.",
    "extra_links": [],
    "steps": [
        warm_up(
            "Look at David's family photo. Answer.",
            [
                {"question_text": "Who is David's wife?", "correct_answer": "Helena",
                 "options": ["Helena", "Isabel", "Ruby", "Inca"], "image_emoji": "👰"},
                {"question_text": "How many daughters do David and Helena have?", "correct_answer": "three",
                 "options": ["three", "two", "one", "four"], "image_emoji": "👨‍👩‍👧‍👧"},
            ],
        ),
        vocabulary([vocab_item(w) for w in L2_FAMILIES]),
        {"step": 3, "type": "vocab_games", "games": []},  # populated by pack_unit_games.py
        micro_reading(
            title="Helena's family",
            text=(
                "My name is Helena. I'm a mother. My husband is David. We have three children — "
                "three daughters. Their names are Isabel, Inca and Eva. Isabel is 14. Inca and Eva are twins — "
                "they are 11. We are a big family. We're happy together."
            ),
            scene_description="A mother stands with her husband and three daughters in a garden.",
            questions=[
                {"question": "Who is Helena's husband?", "options": ["David", "Sam", "Mark", "Ruby"], "correct_answer": "David"},
                {"question": "How many daughters does Helena have?", "options": ["three", "two", "four", "one"], "correct_answer": "three"},
                {"question": "How old is Isabel?", "options": ["14", "11", "1", "9"], "correct_answer": "14"},
                {"question": "Who are the twins?", "options": ["Inca and Eva", "Isabel and Inca", "Helena and David", "Ruby and Sam"], "correct_answer": "Inca and Eva"},
                {"question": "Helena and David have a son. True or false?", "options": ["True", "False"], "correct_answer": "False"},
            ],
        ),
        grammar_focus(
            rule_pattern="Possessive 's",
            explanation="We add 's after a person's name (or after a noun like 'mum') to say something belongs to that person. 'David's wife' = the wife of David. 'Helena's daughter' = the daughter of Helena. For names ending in 's' we still add 's.",
            examples=[
                "David's wife is Helena.",
                "Helena's daughter is Isabel.",
                "Inca's sister is Eva.",
                "My mum's name is Sofia.",
                "Ruby's brother is Sam.",
            ],
        ),
        {"step": 7, "type": "grammar_games", "games": []},  # populated by pack_unit_games.py
        listening(
            audio_text=(
                "Hello! I'm Isabel. I'm 14. I have two sisters — Inca and Eva. They are twins. They are 11. "
                "My mother's name is Helena. My father's name is David. I'm Helena's daughter and David's daughter. "
                "We have a big family — five of us!"
            ),
            audio_url="/static/audio/stage3/unit02/lesson_02.mp3",
            scene_description="A teenage girl introduces her family.",
            questions=[
                {"question": "How old is Isabel?", "options": ["14", "11", "9", "5"], "correct_answer": "14"},
                {"question": "How many sisters does Isabel have?", "options": ["two", "three", "one", "four"], "correct_answer": "two"},
                {"question": "What is Isabel's mother's name?", "options": ["Helena", "Ruby", "Sofia", "Eva"], "correct_answer": "Helena"},
                {"question": "Are Inca and Eva twins?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "How many people are in the family?", "options": ["five", "four", "three", "six"], "correct_answer": "five"},
            ],
        ),
        production(
            prompt="Talk about a family you know. Use 'X's wife', 'X's daughter', 'X's son' to describe two people.",
            expected_text="David's wife is Helena. Helena's daughter is Isabel.",
            scaffold_prompts=[
                "Start with one person's name + 's: 'David's wife is...'",
                "Add another: 'Helena's daughter is...'",
                "Say one more thing about them: 'She is 14.' or 'They are happy.'",
            ],
        ),
        exit_ticket(
            title="What did you learn?",
            questions=[
                {"question": "Choose: David ___ wife is Helena.", "options": ["'s", "s'", "is"], "correct_answer": "'s"},
                {"question": "A man's female partner in marriage is his ___.", "options": ["wife", "husband", "daughter"], "correct_answer": "wife"},
                {"question": "More than one boy or girl are ___.", "options": ["children", "babies", "parents"], "correct_answer": "children"},
                {"question": "Choose: Helena's ___ is Isabel.", "options": ["daughter", "son", "father"], "correct_answer": "daughter"},
                {"question": "True or false: 'Inca's sister' means the sister of Inca.", "options": ["True", "False"], "correct_answer": "True"},
            ],
        ),
    ],
}


# ═══════════ LESSON 3 — "How do you feel?" ═══════════════════════════════════
L3 = {
    "lesson_num": 3,
    "lesson_id": "stage_3_movers_unit_02_lesson_03",
    "number": 3,
    "title": "How do you feel?",
    "topic": "Feelings adjectives — happy, sad, tired, bored, hungry, thirsty, hot, clever, funny. be: short answers.",
    "extra_links": [],
    "steps": [
        warm_up(
            "Watch Inca and Eva. How do they feel today?",
            [
                {"question_text": "Inca is smiling. How does she feel?", "correct_answer": "happy",
                 "options": ["happy", "sad", "tired", "hungry"], "image_emoji": "😊"},
                {"question_text": "Eva wants water. She is...", "correct_answer": "thirsty",
                 "options": ["thirsty", "hungry", "hot", "bored"], "image_emoji": "💧"},
            ],
        ),
        vocabulary([vocab_item(w) for w in L3_FEELINGS]),
        {"step": 3, "type": "vocab_games", "games": []},  # populated by pack_unit_games.py
        micro_reading(
            title="A long day",
            text=(
                "It's Sunday afternoon. Helena and her three daughters are at home. Isabel is in her room. "
                "She is tired — it's a hot day. Inca is in the kitchen. She is hungry. She wants a sandwich. "
                "Eva is in the garden. She is bored — she wants to play. Helena is in the living room. "
                "She is happy — she has tea and a book. It's a long day, but a good day."
            ),
            scene_description="Helena and her daughters in different rooms of the house on a hot afternoon.",
            questions=[
                {"question": "How does Isabel feel?", "options": ["tired", "happy", "hungry", "bored"], "correct_answer": "tired"},
                {"question": "Where is Inca?", "options": ["in the kitchen", "in her room", "in the garden", "in the living room"], "correct_answer": "in the kitchen"},
                {"question": "Why is Eva bored?", "options": ["she wants to play", "she is hungry", "she is hot", "she is tired"], "correct_answer": "she wants to play"},
                {"question": "Is Helena happy?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "What does Inca want?", "options": ["a sandwich", "a book", "tea", "water"], "correct_answer": "a sandwich"},
            ],
        ),
        grammar_focus(
            rule_pattern="be — short answers",
            explanation="When someone asks a 'be' question (Are you...? Is he...?), we answer with a short answer. Yes + subject + be. No + subject + be + not. We don't say just 'yes' — we say 'Yes, I am.' or 'No, I'm not.'",
            examples=[
                "Are you tired? — Yes, I am.",
                "Is Inca hungry? — Yes, she is.",
                "Is Eva sad? — No, she isn't. She's bored.",
                "Are you happy? — No, I'm not.",
                "Are Inca and Eva twins? — Yes, they are.",
            ],
        ),
        {"step": 7, "type": "grammar_games", "games": []},  # populated by pack_unit_games.py
        listening(
            audio_text=(
                "MUM: Isabel! Are you OK? "
                "ISABEL: I'm tired, Mum. "
                "MUM: Are you hungry? "
                "ISABEL: No, I'm not hungry. I'm thirsty. "
                "MUM: OK. Here's some water. Is Inca in her room? "
                "ISABEL: No, she isn't. She's in the kitchen. She's hungry! "
                "MUM: Funny girl! "
                "ISABEL: Yes, she is."
            ),
            audio_url="/static/audio/stage3/unit02/lesson_03.mp3",
            scene_description="A mother and daughter conversation at home.",
            questions=[
                {"question": "How does Isabel feel?", "options": ["tired", "happy", "bored", "hot"], "correct_answer": "tired"},
                {"question": "Is Isabel hungry?", "options": ["no", "yes"], "correct_answer": "no"},
                {"question": "What does Isabel want?", "options": ["water", "a sandwich", "a book", "to sleep"], "correct_answer": "water"},
                {"question": "Where is Inca?", "options": ["in the kitchen", "in her room", "outside", "at school"], "correct_answer": "in the kitchen"},
                {"question": "Is Inca hungry?", "options": ["yes", "no"], "correct_answer": "yes"},
            ],
        ),
        production(
            prompt="How do you feel today? Say two sentences. 'I'm ___' and 'I'm not ___'.",
            expected_text="I'm happy today. I'm not tired.",
            scaffold_prompts=[
                "Pick one feeling: happy, tired, hungry, thirsty, sad, bored, hot.",
                "Say it with 'I'm': 'I'm happy.'",
                "Now say one feeling you don't have: 'I'm not...'",
            ],
        ),
        exit_ticket(
            title="What did you learn?",
            questions=[
                {"question": "You want to drink water. You are ___.", "options": ["thirsty", "hungry", "tired", "bored"], "correct_answer": "thirsty"},
                {"question": "You feel good and you smile. You are ___.", "options": ["happy", "sad", "tired", "hot"], "correct_answer": "happy"},
                {"question": "Are you tired? — Yes, I ___.", "options": ["am", "is", "are"], "correct_answer": "am"},
                {"question": "Is Inca hungry? — No, she ___.", "options": ["isn't", "aren't", "amn't"], "correct_answer": "isn't"},
                {"question": "True or false: 'I'm not hot' means I don't feel hot.", "options": ["True", "False"], "correct_answer": "True"},
            ],
        ),
    ],
}


# ═══════════ LESSON 4 — "My family review" ══════════════════════════════════
L4 = {
    "lesson_num": 4,
    "lesson_id": "stage_3_movers_unit_02_lesson_04",
    "number": 4,
    "title": "My family — Review",
    "topic": "Recycle Unit 2 family + feelings vocab + all three grammar points. Pronunciation /ə/.",
    "extra_links": [],
    "steps": [
        warm_up(
            "Look at three families. Match each person to a feeling.",
            [
                {"question_text": "Helena's baby is one. The baby is happy. True or false?", "correct_answer": "True",
                 "options": ["True", "False"], "image_emoji": "👶"},
                {"question_text": "Sam is hungry. Sam is Ruby's ___.", "correct_answer": "brother",
                 "options": ["brother", "sister", "dad", "mum"], "image_emoji": "👦"},
            ],
        ),
        {
            "step": 2,
            "type": "vocabulary_review",
            "items": L1_FAMILIES + L2_FAMILIES + L3_FEELINGS,
        },
        {"step": 3, "type": "vocab_games", "games": []},  # populated by pack_unit_games.py (review pack)
        micro_reading(
            title="A photo on the wall",
            text=(
                "On the wall in Ruby's room there is a photo. It's a family photo. Ruby is in the photo with her family. "
                "Her mum, Sofia, is happy. Her dad, Mark, is funny. Her brother, Sam, is clever — he's 9. "
                "Lily, the baby, is in Sofia's arms. Lily is happy too. Ruby loves the photo. It's her family."
            ),
            scene_description="A family photo on a bedroom wall.",
            questions=[
                {"question": "Where is the family photo?", "options": ["on the wall in Ruby's room", "in the kitchen", "in the garden", "at school"], "correct_answer": "on the wall in Ruby's room"},
                {"question": "Who is Ruby's brother?", "options": ["Sam", "Mark", "Lily", "Sofia"], "correct_answer": "Sam"},
                {"question": "How does Ruby's dad feel?", "options": ["funny", "tired", "sad", "bored"], "correct_answer": "funny"},
                {"question": "Who is the baby?", "options": ["Lily", "Sam", "Ruby", "Sofia"], "correct_answer": "Lily"},
                {"question": "Does Ruby love the photo?", "options": ["yes", "no"], "correct_answer": "yes"},
            ],
        ),
        {
            "step": 6,
            "type": "grammar_review",
            "patterns": [
                "Determiners: my / your / his / her",
                "Possessive 's: David's wife, Helena's daughter",
                "be: short answers — Yes, I am. / No, I'm not.",
            ],
        },
        {"step": 7, "type": "grammar_games", "games": []},  # populated by pack_unit_games.py
        listening(
            audio_text=(
                "Hi! My name is Eva. I'm 11. My twin sister's name is Inca. We are Helena's daughters. Our father is David. "
                "Today I'm happy — it's my birthday! Inca is hungry, but I'm not. I'm thirsty — I want water. "
                "We are a funny family."
            ),
            audio_url="/static/audio/stage3/unit02/lesson_04.mp3",
            scene_description="Eva talks about her family on her birthday.",
            questions=[
                {"question": "How old is Eva?", "options": ["11", "14", "9", "1"], "correct_answer": "11"},
                {"question": "Who is Eva's twin sister?", "options": ["Inca", "Isabel", "Helena", "Ruby"], "correct_answer": "Inca"},
                {"question": "Is Eva happy?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "Is Eva hungry?", "options": ["no", "yes"], "correct_answer": "no"},
                {"question": "What does Eva want?", "options": ["water", "a sandwich", "a book", "a friend"], "correct_answer": "water"},
            ],
        ),
        production(
            prompt="Talk about your family for 30 seconds. Use family words, possessive 's, and one feeling.",
            expected_text="My mum's name is Sofia. My dad is funny. I'm happy with my family.",
            scaffold_prompts=[
                "Person 1: 'My mum/dad/brother/sister is...'",
                "Possessive: 'My ___'s name is...'",
                "Feeling: 'I'm happy / tired / hungry today.'",
            ],
        ),
        exit_ticket(
            title="Unit 2 review",
            questions=[
                {"question": "Choose: Helena's ___ is David.", "options": ["husband", "wife", "son"], "correct_answer": "husband"},
                {"question": "Helena and David have three ___.", "options": ["daughters", "sons", "brothers"], "correct_answer": "daughters"},
                {"question": "You feel good and you smile — you are ___.", "options": ["happy", "tired", "hungry"], "correct_answer": "happy"},
                {"question": "Are you hungry? — No, I ___.", "options": ["'m not", "isn't", "am"], "correct_answer": "'m not"},
                {"question": "True or false: 'My dad's brother' is your uncle.", "options": ["True", "False"], "correct_answer": "True"},
            ],
        ),
    ],
}


# ─── Final unit assembly ────────────────────────────────────────────────────
unit = {
    "stage": "stage_3",
    "stage_title": "Movers (A1)",
    "units": [
        {
            "unit_id": "stage_3_movers_unit_02",
            "unit_num": 2,
            "title": "My family",
            "subtitle": "Meet the family and learn how to talk about feelings — aligned with Cambridge Prepare Lv1 Unit 2.",
            "phonics_focus": "/ə/ schwa (mum, brother, son, father, mother, parents)",
            "grammar_focus": "Determiners (my/your/...); Possessive 's; be — short answers.",
            "spiral_meta": {
                "prepare_alignment": {
                    "source": "Cambridge Prepare 2nd Edition Level 1 — Unit 2 'My family' (SB p18-21)",
                    "wordlist_coverage_pct": 100,
                    "extracted_from": "backend/content/cambridge_refs/prepare_lv1_unit_breakdowns.json",
                },
                "target_vocab_count": len(FAMILIES) + len(FEELINGS),
                "anchor_character_names_recycled": ["David", "Helena", "Isabel", "Inca", "Eva", "Ruby", "Sam", "Sofia", "Mark", "Lily"],
                "grammar_anticipation_next_unit": "there is / there are (Unit 3 — passive exposure only)",
            },
            "lessons": [L1, L2, L3, L4],
        }
    ],
}

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(unit, indent=2, ensure_ascii=False))
print(f"✓ Wrote {OUT}")
print(f"  Lessons: {len(unit['units'][0]['lessons'])}")
total_vocab = sum(
    len(s.get("items", [])) for l in unit["units"][0]["lessons"] for s in l["steps"]
    if s.get("type") in ("vocabulary", "vocabulary_review")
)
print(f"  Total vocab items across lessons: {total_vocab}")
print(f"  Prepare wordlist coverage: 100% ({len(FAMILIES)} family + {len(FEELINGS)} feelings)")
print("Next: run `python backend/scripts/pack_unit_games.py --unit 02` to attach 3-game packs")
