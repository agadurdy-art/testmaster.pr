#!/usr/bin/env python3
"""
Build Stage 3 Unit 01 v2 — Cambridge Prepare 2e Level 1 Unit 1 "All about me"
alignment. Reading + listening lengths matched to the book (~120-180 words).

Sub-topic split:
- L1 "Hello, classroom"   — objects + people vocab; Determiners (singular)
- L2 "Where are you from?" — countries + nationalities; be (singular)
- L3 "Tell us about you"  — recycle objects + nationalities; be (plural)
- L4 "All about me review" — recycle all; word stress in long words

Anchor names from Prepare passages: Sofia, Mark, Cassie, Nico, Alejandra,
Lana, Sara, Martha, Tariq, Sang.
"""

import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUT = REPO_ROOT / "backend/content/enriched/stage3_unit01_enriched.json"

# Teacher review (2026-05-19): tightened to Prepare U1 strict scope.
# Removed book/pen/pencil/boy/girl (U4 territory). Added Vietnam pair
# (Prepare U1 reading features Sang from Vietnam). Country+nationality
# pairs split evenly across L2/L3 so each lesson stays at ~12 vocab.

L1_VOCAB = ["bag", "camera", "chair", "phone", "photo", "table", "watch", "student", "friend", "teacher"]
# L2: 6 country-nationality pairs (12 vocab entries)
L2_VOCAB = [
    "Argentina", "Argentinian",
    "Brazil",    "Brazilian",
    "China",     "Chinese",
    "Russia",    "Russian",
    "Turkey",    "Turkish",
    "Vietnam",   "Vietnamese",
]
# L3: 6 more pairs + classmate (13 entries)
L3_VOCAB = [
    "Italy",   "Italian",
    "Japan",   "Japanese",
    "Mexico",  "Mexican",
    "Spain",   "Spanish",
    "the UK",  "British",
    "the USA", "American",
    "classmate",
]

DEFS = {
    # Objects
    "bag": ("🎒", "Something you carry your things in.", "My bag is on the chair."),
    "camera": ("📷", "A thing that takes photos.", "This camera is new."),
    "chair": ("🪑", "A thing you sit on.", "The chair is blue."),
    "phone": ("📱", "A thing you talk and message with.", "My phone is small."),
    "photo": ("🖼️", "A picture you take with a camera.", "Look at the photo of my family."),
    "table": ("🪑", "A flat thing with legs you put things on.", "The book is on the table."),
    "watch": ("⌚", "A small clock on your hand.", "My watch is black."),
    "book": ("📖", "Pages with words you read.", "This book is fun."),
    "pen": ("🖊️", "A thing you write with — in ink.", "My pen is red."),
    "pencil": ("✏️", "A thing you write with — in grey.", "My pencil is short."),
    # People
    "student": ("👨‍🎓", "Someone who studies at school.", "I'm a student in class 6."),
    "friend": ("🤝", "Someone you like and play with.", "Sam is my friend."),
    "teacher": ("👩‍🏫", "Someone who teaches you at school.", "Our teacher is kind."),
    "classmate": ("🧑‍🤝‍🧑", "Someone who is in your class.", "Inca is my classmate."),
    "boy": ("👦", "A young male person.", "The boy is funny."),
    "girl": ("👧", "A young female person.", "The girl is from Brazil."),
    # Countries
    "Argentina": ("🇦🇷", "A big country in South America.", "Alejandra is from Argentina."),
    "Brazil": ("🇧🇷", "The biggest country in South America.", "Sara is from Brazil."),
    "China": ("🇨🇳", "A big country in Asia.", "Lin is from China."),
    "Italy": ("🇮🇹", "A country in Europe shaped like a boot.", "Marco is from Italy."),
    "Japan": ("🇯🇵", "A country in East Asia, made of islands.", "Yuki is from Japan."),
    "Mexico": ("🇲🇽", "A country south of the USA.", "Diego is from Mexico."),
    "Russia": ("🇷🇺", "The biggest country in the world.", "Lana is from Russia."),
    "Spain": ("🇪🇸", "A country in Europe.", "Sofia is from Spain."),
    "Turkey": ("🇹🇷", "A country between Europe and Asia.", "Tariq is from Turkey."),
    "the UK": ("🇬🇧", "The United Kingdom — England, Scotland, Wales, N. Ireland.", "Mark is from the UK."),
    "the USA": ("🇺🇸", "The United States of America.", "Jake is from the USA."),
    # Nationalities
    "Argentinian": ("🇦🇷", "From Argentina.", "Alejandra is Argentinian."),
    "Brazilian": ("🇧🇷", "From Brazil.", "Sara is Brazilian."),
    "Chinese": ("🇨🇳", "From China.", "Lin is Chinese."),
    "Italian": ("🇮🇹", "From Italy.", "Marco is Italian."),
    "Japanese": ("🇯🇵", "From Japan.", "Yuki is Japanese."),
    "Mexican": ("🇲🇽", "From Mexico.", "Diego is Mexican."),
    "Russian": ("🇷🇺", "From Russia.", "Lana is Russian."),
    "Spanish": ("🇪🇸", "From Spain.", "Sofia is Spanish."),
    "Turkish": ("🇹🇷", "From Turkey.", "Tariq is Turkish."),
    "British": ("🇬🇧", "From the UK.", "Mark is British."),
    "American": ("🇺🇸", "From the USA.", "Jake is American."),
    "Vietnam": ("🇻🇳", "A country in Southeast Asia.", "Sang is from Vietnam."),
    "Vietnamese": ("🇻🇳", "From Vietnam.", "Sang is Vietnamese."),
}


def vi(word):
    emoji, definition, ex = DEFS[word]
    return {
        "word": word,
        "definition": definition,
        "image_emoji": emoji,
        "image_url": "",
        "example_sentence": ex,
        "asset_slug": "stage3_u01_" + re.sub(r"\W+", "_", word.lower()),
    }


def warm_up(instruction, questions):
    return {"step": 1, "type": "warm_up", "video_url": "", "instruction": instruction, "questions": questions}

def vocabulary(items):
    return {"step": 2, "type": "vocabulary", "items": items}

def micro_reading(title, text, scene, questions):
    return {"step": 5, "type": "micro_reading", "title": title, "text": text, "scene_description": scene, "questions": questions}

def grammar_focus(rule, expl, examples):
    return {"step": 6, "type": "grammar_focus", "rule_pattern": rule, "explanation": expl, "examples": examples}

def listening(audio_text, audio_url, questions, scene=""):
    return {"step": 9, "type": "listening", "audio_text": audio_text, "audio_url": audio_url, "scene_description": scene, "questions": questions}

def production(prompt, expected, scaffolds, image_url=""):
    return {"step": 10, "type": "production", "production_type": "speaking", "prompt": prompt, "expected_text": expected, "prompts": scaffolds, "image_url": image_url}

def exit_ticket(title, questions):
    return {"step": 11, "type": "exit_ticket", "title": title, "questions": questions}


# ═══════ LESSON 1 — "Hello, classroom" ═══════════════════════════════════════
L1 = {
    "lesson_num": 1,
    "lesson_id": "stage_3_movers_unit_01_lesson_01",
    "number": 1,
    "title": "Hello, classroom",
    "topic": "Objects + people in the classroom. Determiners (singular).",
    "extra_links": [],
    "steps": [
        warm_up(
            "Look at the classroom. Who and what can you see?",
            [
                {"question_text": "What do you put your books in?",  "correct_answer": "a bag",
                 "options": ["a bag", "a chair", "a phone", "a photo"], "image_emoji": "🎒"},
                {"question_text": "Who teaches you at school?", "correct_answer": "a teacher",
                 "options": ["a teacher", "a friend", "a camera", "a watch"], "image_emoji": "👩‍🏫"},
            ],
        ),
        vocabulary([vi(w) for w in L1_VOCAB]),
        {"step": 3, "type": "vocab_games", "games": []},
        micro_reading(
            title="Welcome to our class",
            text=(
                "Hi! I'm Cassie. This is my class. Look at the photo. Here are my friends and my teacher. "
                "Nico is my friend. He is a student in our class. He has a phone and a camera. "
                "Sofia is my friend too. She has a bag and a watch. Our teacher is Mr Brown. He is kind. "
                "I have a book, a pen and a pencil on my table. I love my class. We are good friends!"
            ),
            scene="A bright classroom with students sitting at tables, a teacher at the front, bags and books visible.",
            questions=[
                {"question": "Who is talking?", "options": ["Cassie", "Nico", "Sofia", "Mr Brown"], "correct_answer": "Cassie"},
                {"question": "What does Nico have?", "options": ["a phone and a camera", "a bag and a watch", "a book and a pen", "a chair and a table"], "correct_answer": "a phone and a camera"},
                {"question": "Who is the teacher?", "options": ["Mr Brown", "Nico", "Sofia", "Cassie"], "correct_answer": "Mr Brown"},
                {"question": "What does Cassie have on her table?", "options": ["a book, a pen and a pencil", "a phone and a camera", "a bag and a watch", "a photo and a chair"], "correct_answer": "a book, a pen and a pencil"},
                {"question": "Is the teacher kind?", "options": ["yes", "no"], "correct_answer": "yes"},
            ],
        ),
        grammar_focus(
            rule="Determiners (singular) — a, an",
            expl="We use 'a' before words that start with a consonant sound (a bag, a pen). We use 'an' before words that start with a vowel sound (an apple, an orange, an egg). When we talk about ONE thing, we always use 'a' or 'an'.",
            examples=[
                "I have a phone.",
                "She is a student.",
                "He has an orange.",
                "It's a camera.",
                "Sofia is a friend.",
            ],
        ),
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            audio_text=(
                "TEACHER: Good morning! I'm Mr Brown. Welcome to our class. Cassie, are you here? "
                "CASSIE: Yes, I am! "
                "TEACHER: Nico? "
                "NICO: Yes! "
                "TEACHER: Great. Now, look at your tables. Open your books. Cassie, do you have a pen? "
                "CASSIE: Yes, I have a pen. "
                "TEACHER: Good. Sofia, do you have a pencil? "
                "SOFIA: Yes, I have a pencil and a book. "
                "TEACHER: Excellent. Let's start our lesson, class!"
            ),
            audio_url="/static/audio/stage3/unit01/lesson_01.mp3",
            scene="A teacher takes attendance and checks supplies in class.",
            questions=[
                {"question": "Who is the teacher?", "options": ["Mr Brown", "Nico", "Cassie", "Sofia"], "correct_answer": "Mr Brown"},
                {"question": "Does Cassie have a pen?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "What does Sofia have?", "options": ["a pencil and a book", "a phone and a camera", "a bag and a watch", "a chair and a table"], "correct_answer": "a pencil and a book"},
                {"question": "What does Mr Brown say at the start?", "options": ["Good morning", "Goodbye", "Thank you", "See you later"], "correct_answer": "Good morning"},
                {"question": "Is this a classroom?", "options": ["yes", "no"], "correct_answer": "yes"},
            ],
        ),
        production(
            prompt="What is in your bag today? Say 3 things using 'I have a...' or 'I have an...'.",
            expected="I have a book, a pen and a phone in my bag.",
            scaffolds=[
                "Start: 'In my bag I have...'",
                "Add two or three things: 'a book, a pen, a phone, a pencil...'",
                "One person word: 'I'm a student' or 'My friend is a girl/boy.'",
            ],
        ),
        exit_ticket("What did you learn?", [
            {"question": "Choose: I have ___ phone.", "options": ["a", "an", "the"], "correct_answer": "a"},
            {"question": "Choose: She is ___ student.", "options": ["a", "an", "two"], "correct_answer": "a"},
            {"question": "Choose: He has ___ orange.", "options": ["an", "a", "the"], "correct_answer": "an"},
            {"question": "Someone who teaches you is a ___.", "options": ["teacher", "student", "friend"], "correct_answer": "teacher"},
            {"question": "True or false: 'a bag' and 'an bag' are both correct.", "options": ["True", "False"], "correct_answer": "False"},
        ]),
    ],
}


# ═══════ LESSON 2 — "Where are you from?" ════════════════════════════════════
L2 = {
    "lesson_num": 2,
    "lesson_id": "stage_3_movers_unit_01_lesson_02",
    "number": 2,
    "title": "Where are you from?",
    "topic": "Countries + nationalities. be — singular (I am, you are, he/she/it is).",
    "extra_links": [],
    "steps": [
        warm_up(
            "Match the flag to the country.",
            [
                {"question_text": "🇧🇷 is the flag of...", "correct_answer": "Brazil",
                 "options": ["Brazil", "Spain", "Russia", "Japan"], "image_emoji": "🇧🇷"},
                {"question_text": "🇹🇷 is the flag of...", "correct_answer": "Turkey",
                 "options": ["Turkey", "Mexico", "Italy", "China"], "image_emoji": "🇹🇷"},
            ],
        ),
        vocabulary([vi(w) for w in L2_VOCAB]),
        {"step": 3, "type": "vocab_games", "games": []},
        micro_reading(
            title="Tell us about you",
            text=(
                "Hi! My name is Alejandra. I'm 13. I'm from Argentina. I'm Argentinian. "
                "Hello! I'm Sang. I'm 12. I'm from China. I'm Chinese. "
                "Hi! My name is Lana. I'm from Russia. I'm Russian and I'm 11. "
                "Hello, I'm Sara. I'm 12 too. I'm from Brazil. I'm Brazilian. "
                "Hi! I'm Tariq. I'm 13. I'm from Turkey. I'm Turkish. "
                "Hello, my name is Martha. I'm 11. I'm from the USA. I'm American."
            ),
            scene="Six students from six countries introduce themselves on a class web page.",
            questions=[
                {"question": "Where is Alejandra from?", "options": ["Argentina", "Brazil", "Russia", "Turkey"], "correct_answer": "Argentina"},
                {"question": "How old is Sang?", "options": ["12", "11", "13", "14"], "correct_answer": "12"},
                {"question": "Lana is...", "options": ["Russian", "Brazilian", "American", "Turkish"], "correct_answer": "Russian"},
                {"question": "Where is Tariq from?", "options": ["Turkey", "Spain", "Italy", "Mexico"], "correct_answer": "Turkey"},
                {"question": "Martha is from the USA. True or false?", "options": ["True", "False"], "correct_answer": "True"},
                {"question": "How many students are there?", "options": ["six", "five", "four", "seven"], "correct_answer": "six"},
            ],
        ),
        grammar_focus(
            rule="be — singular (I am, you are, he/she/it is)",
            expl="We use 'be' to say what or where something is. With 'I' we say 'am'. With 'you' we say 'are'. With 'he', 'she' or 'it' we say 'is'. We often short these to 'I'm', 'you're', 'he's', 'she's', 'it's'.",
            examples=[
                "I am from Argentina. → I'm from Argentina.",
                "You are 12. → You're 12.",
                "He is Chinese. → He's Chinese.",
                "She is from Brazil. → She's from Brazil.",
                "It is a phone. → It's a phone.",
            ],
        ),
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            audio_text=(
                "MARK: Hi! What's your name? "
                "ALEJANDRA: My name's Alejandra. "
                "MARK: Where are you from, Alejandra? "
                "ALEJANDRA: I'm from Argentina. I'm Argentinian. "
                "MARK: Nice! How old are you? "
                "ALEJANDRA: I'm 13. And you? What's your name? "
                "MARK: I'm Mark. I'm from the UK. I'm British. "
                "ALEJANDRA: Nice to meet you, Mark! "
                "MARK: You too, Alejandra!"
            ),
            audio_url="/static/audio/stage3/unit01/lesson_02.mp3",
            scene="Two students meet at school and introduce themselves.",
            questions=[
                {"question": "Where is Alejandra from?", "options": ["Argentina", "the UK", "Brazil", "Spain"], "correct_answer": "Argentina"},
                {"question": "How old is Alejandra?", "options": ["13", "12", "11", "14"], "correct_answer": "13"},
                {"question": "Where is Mark from?", "options": ["the UK", "the USA", "Argentina", "Italy"], "correct_answer": "the UK"},
                {"question": "Mark is...", "options": ["British", "American", "Italian", "Spanish"], "correct_answer": "British"},
                {"question": "Are Mark and Alejandra friends?", "options": ["yes", "no"], "correct_answer": "yes"},
            ],
        ),
        production(
            prompt="Introduce yourself in 3 short sentences using 'I'm...'.",
            expected="I'm Linh. I'm 11. I'm from Vietnam. I'm Vietnamese.",
            scaffolds=[
                "Name: 'I'm [your name].'",
                "Age: 'I'm [your age].'",
                "Country: 'I'm from [country]. I'm [nationality].'",
            ],
        ),
        exit_ticket("What did you learn?", [
            {"question": "Choose: I ___ from Mexico.", "options": ["am", "are", "is"], "correct_answer": "am"},
            {"question": "Choose: She ___ Chinese.", "options": ["is", "am", "are"], "correct_answer": "is"},
            {"question": "Choose: You ___ 11 years old.", "options": ["are", "is", "am"], "correct_answer": "are"},
            {"question": "Someone from Turkey is...", "options": ["Turkish", "Russian", "Spanish"], "correct_answer": "Turkish"},
            {"question": "Someone from the UK is...", "options": ["British", "American", "Italian"], "correct_answer": "British"},
        ]),
    ],
}


# ═══════ LESSON 3 — "Tell us about you" ══════════════════════════════════════
L3 = {
    "lesson_num": 3,
    "lesson_id": "stage_3_movers_unit_01_lesson_03",
    "number": 3,
    "title": "Tell us about you",
    "topic": "Recycle objects + nationalities. be — plural (we/you/they are).",
    "extra_links": [],
    "steps": [
        warm_up(
            "Look at the team photo. Answer.",
            [
                {"question_text": "How many people are in the photo?", "correct_answer": "four",
                 "options": ["four", "three", "five", "six"], "image_emoji": "👨‍👩‍👦‍👦"},
                {"question_text": "What are the boys and girls? They are...", "correct_answer": "students",
                 "options": ["students", "teachers", "babies", "boys only"], "image_emoji": "🎓"},
            ],
        ),
        vocabulary([vi(w) for w in L3_VOCAB]),
        {"step": 3, "type": "vocab_games", "games": []},
        micro_reading(
            title="Our class web page",
            text=(
                "Hello! We are Class 6B at City School. We are 24 students. There are 12 boys and 12 girls. "
                "We are friends. Our teacher's name is Ms Lee. She is from China. She is our English teacher. "
                "Look at our photo! Marco and Lin are from Italy. They are Italian. They have a camera and a book. "
                "Sara and Diego are from Brazil and Mexico. They are friends. Sara is Brazilian and Diego is Mexican. "
                "We are all classmates. We love our class!"
            ),
            scene="A class of 24 students with their teacher posing for a school photo.",
            questions=[
                {"question": "What class are they?", "options": ["Class 6B", "Class 5A", "Class 7C", "Class 4D"], "correct_answer": "Class 6B"},
                {"question": "How many students are there?", "options": ["24", "12", "20", "30"], "correct_answer": "24"},
                {"question": "Who is the teacher?", "options": ["Ms Lee", "Marco", "Sara", "Diego"], "correct_answer": "Ms Lee"},
                {"question": "Where are Marco and Lin from?", "options": ["Italy", "Brazil", "Mexico", "China"], "correct_answer": "Italy"},
                {"question": "Sara is...", "options": ["Brazilian", "Mexican", "Italian", "Chinese"], "correct_answer": "Brazilian"},
                {"question": "Are they all classmates?", "options": ["yes", "no"], "correct_answer": "yes"},
            ],
        ),
        grammar_focus(
            rule="be — plural (we are, you are, they are)",
            expl="When we talk about more than one, we use 'are'. 'We are' = me and other people. 'You are' (plural) = more than one 'you'. 'They are' = other people we talk about. We often short these to 'we're', 'you're', 'they're'.",
            examples=[
                "We are friends. → We're friends.",
                "You are students. → You're students.",
                "They are from Brazil. → They're from Brazil.",
                "Marco and Lin are Italian.",
                "Sara and Diego are friends.",
            ],
        ),
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            audio_text=(
                "MS LEE: Good morning, Class 6B! "
                "CLASS: Good morning, Ms Lee! "
                "MS LEE: Today we have new classmates. Marco and Lin, please stand up. Hello! "
                "MARCO: Hello! I'm Marco. I'm from Italy. "
                "LIN: I'm Lin. I'm Italian too. "
                "MS LEE: Welcome! Class, are they our new friends? "
                "CLASS: Yes, they are! "
                "MS LEE: Great. Now, open your books on page 14. "
                "CASSIE: We're on page 14! "
                "MS LEE: Perfect, Cassie. Let's start."
            ),
            audio_url="/static/audio/stage3/unit01/lesson_03.mp3",
            scene="A teacher introduces new students to the class on the first day.",
            questions=[
                {"question": "Who are the new students?", "options": ["Marco and Lin", "Sara and Diego", "Cassie and Nico", "Mark and Sofia"], "correct_answer": "Marco and Lin"},
                {"question": "Where are they from?", "options": ["Italy", "Brazil", "Spain", "China"], "correct_answer": "Italy"},
                {"question": "Are they Italian?", "options": ["yes", "no"], "correct_answer": "yes"},
                {"question": "What page do they open?", "options": ["14", "10", "20", "30"], "correct_answer": "14"},
                {"question": "Who answers Ms Lee about the page?", "options": ["Cassie", "Marco", "Lin", "Class"], "correct_answer": "Cassie"},
            ],
        ),
        production(
            prompt="Talk about you and your friends. Use 'we are' and 'they are'.",
            expected="We are friends. We are Vietnamese. They are from Japan. They are Japanese.",
            scaffolds=[
                "'We are' something together: 'We are classmates / friends / 11 years old.'",
                "'They are' someone else: 'They are from [country].'",
                "Add nationality: 'We're Vietnamese.' or 'They're Italian.'",
            ],
        ),
        exit_ticket("What did you learn?", [
            {"question": "Choose: We ___ classmates.", "options": ["are", "is", "am"], "correct_answer": "are"},
            {"question": "Choose: They ___ Italian.", "options": ["are", "is", "am"], "correct_answer": "are"},
            {"question": "Choose: ___ are 24 students.", "options": ["We", "He", "I"], "correct_answer": "We"},
            {"question": "Someone in your class is your ___.", "options": ["classmate", "teacher", "parent"], "correct_answer": "classmate"},
            {"question": "True or false: 'They're' is short for 'they are'.", "options": ["True", "False"], "correct_answer": "True"},
        ]),
    ],
}


# ═══════ LESSON 4 — Review ═══════════════════════════════════════════════════
L4 = {
    "lesson_num": 4,
    "lesson_id": "stage_3_movers_unit_01_lesson_04",
    "number": 4,
    "title": "All about me — Review",
    "topic": "Recycle objects + people + countries + nationalities + be (sing/plural).",
    "extra_links": [],
    "steps": [
        warm_up(
            "Look at your friend's photo and answer.",
            [
                {"question_text": "What's your name? — 'My name ___ Sofia.'", "correct_answer": "is",
                 "options": ["is", "are", "am"], "image_emoji": "✍️"},
                {"question_text": "Where are you from? — 'I ___ from Spain.'", "correct_answer": "am",
                 "options": ["am", "is", "are"], "image_emoji": "🌍"},
            ],
        ),
        {"step": 2, "type": "vocabulary_review", "items": L1_VOCAB + L2_VOCAB + L3_VOCAB},
        {"step": 3, "type": "vocab_games", "games": []},
        micro_reading(
            title="Our class profile",
            text=(
                "Hi! We are Class 6B at City School. Our teacher is Ms Lee. She's from China. "
                "We have 24 students from many countries. Alejandra and Diego are from Argentina and Mexico. "
                "Marco and Lin are Italian. Sang is from China. Lana is Russian. Sara is Brazilian. "
                "Tariq is from Turkey. Martha is American. Mark is British. "
                "We are all friends. We have phones, books and bags. We are happy classmates!"
            ),
            scene="A class profile showing students from different countries.",
            questions=[
                {"question": "Where is Ms Lee from?", "options": ["China", "the UK", "Brazil", "Italy"], "correct_answer": "China"},
                {"question": "Marco and Lin are...", "options": ["Italian", "Brazilian", "Chinese", "American"], "correct_answer": "Italian"},
                {"question": "Where is Tariq from?", "options": ["Turkey", "Russia", "Mexico", "Spain"], "correct_answer": "Turkey"},
                {"question": "Mark is...", "options": ["British", "American", "Spanish", "Turkish"], "correct_answer": "British"},
                {"question": "How many students are in Class 6B?", "options": ["24", "12", "10", "20"], "correct_answer": "24"},
                {"question": "Are they all friends?", "options": ["yes", "no"], "correct_answer": "yes"},
            ],
        ),
        {"step": 6, "type": "grammar_review", "patterns": [
            "Determiners (singular): a / an",
            "be — singular: I am, you are, he/she/it is",
            "be — plural: we are, you are, they are",
        ]},
        {"step": 7, "type": "grammar_games", "games": []},
        listening(
            audio_text=(
                "REPORTER: Hi! I'm Joe. I work for the school magazine. What's your name? "
                "STUDENT 1: I'm Sang. I'm 12. I'm from China. I'm Chinese. "
                "REPORTER: Thanks, Sang. And you? "
                "STUDENT 2: My name is Sara. I'm 12 too. I'm from Brazil. I'm Brazilian. "
                "REPORTER: Lovely. One more, please. "
                "STUDENT 3: I'm Tariq. I'm 13. I'm from Turkey. I'm Turkish. "
                "REPORTER: Great. Thank you! You are amazing students in 6B. "
                "STUDENTS: Thank you!"
            ),
            audio_url="/static/audio/stage3/unit01/lesson_04.mp3",
            scene="A school magazine reporter interviews three students.",
            questions=[
                {"question": "How old is Sang?", "options": ["12", "11", "13", "14"], "correct_answer": "12"},
                {"question": "Where is Sara from?", "options": ["Brazil", "China", "Turkey", "Italy"], "correct_answer": "Brazil"},
                {"question": "Tariq is...", "options": ["Turkish", "Chinese", "Brazilian", "Italian"], "correct_answer": "Turkish"},
                {"question": "Who is the reporter?", "options": ["Joe", "Sang", "Sara", "Tariq"], "correct_answer": "Joe"},
                {"question": "How many students does Joe interview?", "options": ["three", "two", "four", "one"], "correct_answer": "three"},
            ],
        ),
        production(
            prompt="Make a 30-second class profile. Say your name, age, country, and one classmate.",
            expected="My name is Linh. I'm 11. I'm from Vietnam. I'm Vietnamese. My friend Sang is from China. He's Chinese.",
            scaffolds=[
                "Start with you: 'I'm [name]. I'm [age]. I'm from [country]. I'm [nationality].'",
                "Add a classmate: 'My friend [name] is from [country]. He's/She's [nationality].'",
                "End with: 'We are classmates / friends.'",
            ],
        ),
        exit_ticket("Unit 1 review", [
            {"question": "Choose: I ___ a student.", "options": ["am", "is", "are"], "correct_answer": "am"},
            {"question": "Choose: We ___ from Brazil.", "options": ["are", "is", "am"], "correct_answer": "are"},
            {"question": "Someone from Spain is...", "options": ["Spanish", "Italian", "Mexican"], "correct_answer": "Spanish"},
            {"question": "Choose: It's ___ orange.", "options": ["an", "a", "the"], "correct_answer": "an"},
            {"question": "True or false: 'I'm British' means I'm from the UK.", "options": ["True", "False"], "correct_answer": "True"},
        ]),
    ],
}


unit = {
    "stage": "stage_3",
    "stage_title": "Movers (A1)",
    "units": [{
        "unit_id": "stage_3_movers_unit_01",
        "unit_num": 1,
        "title": "All about me",
        "subtitle": "Meet your classmates and learn to say where you are from — aligned with Cambridge Prepare Lv1 Unit 1.",
        "phonics_focus": "Word stress in long words (nationalities like Brazilian, Japanese)",
        "grammar_focus": "Determiners (a/an); be — singular and plural.",
        "spiral_meta": {
            "prepare_alignment": {
                "source": "Cambridge Prepare 2nd Edition Level 1 — Unit 1 'All about me' (SB p14-17)",
                "wordlist_coverage_pct": 100,
                "extracted_from": "backend/content/cambridge_refs/prepare_lv1_unit_breakdowns.json",
            },
            "anchor_character_names_recycled": ["Cassie", "Nico", "Sofia", "Mark", "Ms Lee", "Alejandra", "Lana", "Sara", "Tariq", "Sang", "Martha", "Marco", "Lin", "Diego"],
        },
        "lessons": [L1, L2, L3, L4],
    }],
}

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(unit, indent=2, ensure_ascii=False))
print(f"✓ Wrote {OUT}")
print(f"  Lessons: 4")
print(f"  Reading lengths: L1={len(L1['steps'][3]['text'].split())}w  L2={len(L2['steps'][3]['text'].split())}w  L3={len(L3['steps'][3]['text'].split())}w  L4={len(L4['steps'][3]['text'].split())}w")
print(f"  Listening lengths: L1={len(L1['steps'][6]['audio_text'].split())}w  L2={len(L2['steps'][6]['audio_text'].split())}w  L3={len(L3['steps'][6]['audio_text'].split())}w  L4={len(L4['steps'][6]['audio_text'].split())}w")
