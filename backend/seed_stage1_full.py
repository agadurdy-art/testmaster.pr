"""
TESTMASTER: STAGE 1 COMPLETE CURRICULUM SEED
12 Units × 4 Lessons = 48 Lessons with full activity data
"""
import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

TS = datetime.now(timezone.utc).isoformat()

# ══════════════════════════════════════════
# UNIT DEFINITIONS - 12 Units for Stage 1
# ══════════════════════════════════════════

UNITS = [
    {
        "num": 1, "substage": "A", "title": "Hello!", "theme": "Greetings & Introductions",
        "phonics": "Letters A, B, C, D, E", "color": "#FF6B6B",
        "grammar": "I am... / Hello!",
        "words": [
            {"word": "hello", "ipa": "/həˈləʊ/", "definition": "A greeting when you meet someone", "example": "Hello! How are you?", "emoji": "👋"},
            {"word": "teacher", "ipa": "/ˈtiːtʃər/", "definition": "A person who teaches students", "example": "The teacher is kind.", "emoji": "👨‍🏫"},
            {"word": "student", "ipa": "/ˈstjuːdənt/", "definition": "A person who learns at school", "example": "I am a student.", "emoji": "🎒"},
            {"word": "apple", "ipa": "/ˈæpəl/", "definition": "A round red or green fruit", "example": "I have an apple.", "emoji": "🍎"},
            {"word": "ball", "ipa": "/bɔːl/", "definition": "A round object used in games", "example": "The ball is red.", "emoji": "⚽"},
            {"word": "cat", "ipa": "/kæt/", "definition": "A small furry pet animal", "example": "The cat is sleeping.", "emoji": "🐱"},
        ],
        "grammar_rules": [
            {"rule": "I am + name", "explanation": "Use 'I am' to introduce yourself.", "examples": ["I am Tom.", "I am a student."], "pattern": "I am ___"},
            {"rule": "Hello! / Hi!", "explanation": "Use 'Hello' or 'Hi' to greet someone.", "examples": ["Hello, teacher!", "Hi, friend!"], "pattern": "Hello, ___!"},
        ],
        "reading": "Hello! My name is Tom. I am a student. I have a red apple and a ball. My teacher is kind. I have a cat. The cat is cute!",
        "reading_questions": [
            {"q": "What is the student's name?", "options": ["Tom", "Sam", "Ben", "Ali"], "answer": "Tom"},
            {"q": "What color is the apple?", "options": ["Green", "Yellow", "Red", "Blue"], "answer": "Red"},
        ],
    },
    {
        "num": 2, "substage": "A", "title": "Friends", "theme": "Making Friends",
        "phonics": "Letters F, G, H, I, J", "color": "#4ECDC4",
        "grammar": "What is your name?",
        "words": [
            {"word": "name", "ipa": "/neɪm/", "definition": "What someone is called", "example": "My name is Sara.", "emoji": "📛"},
            {"word": "friend", "ipa": "/frend/", "definition": "A person you like and trust", "example": "She is my friend.", "emoji": "🤝"},
            {"word": "boy", "ipa": "/bɔɪ/", "definition": "A male child", "example": "The boy is happy.", "emoji": "👦"},
            {"word": "girl", "ipa": "/ɡɜːrl/", "definition": "A female child", "example": "The girl is my friend.", "emoji": "👧"},
            {"word": "fish", "ipa": "/fɪʃ/", "definition": "An animal that lives in water", "example": "I like fish.", "emoji": "🐟"},
            {"word": "hat", "ipa": "/hæt/", "definition": "Something you wear on your head", "example": "The hat is blue.", "emoji": "🎩"},
        ],
        "grammar_rules": [
            {"rule": "What is your name?", "explanation": "Ask someone's name with this question.", "examples": ["What is your name?", "My name is Sara."], "pattern": "What is your ___?"},
            {"rule": "My name is...", "explanation": "Use 'My name is' to tell your name.", "examples": ["My name is Tom.", "My name is Ali."], "pattern": "My name is ___"},
        ],
        "reading": "Hi! My name is Sara. I am a girl. Tom is a boy. Tom is my friend. I have a fish. Tom has a hat. The hat is blue.",
        "reading_questions": [
            {"q": "Who is Sara's friend?", "options": ["Ali", "Tom", "Ben", "Sam"], "answer": "Tom"},
            {"q": "What color is the hat?", "options": ["Red", "Green", "Blue", "Yellow"], "answer": "Blue"},
        ],
    },
    {
        "num": 3, "substage": "A", "title": "Numbers", "theme": "Counting 1-10",
        "phonics": "Letters K, L, M, N, O", "color": "#45B7D1",
        "grammar": "It is (number).",
        "words": [
            {"word": "one", "ipa": "/wʌn/", "definition": "The number 1", "example": "I have one apple.", "emoji": "1️⃣"},
            {"word": "two", "ipa": "/tuː/", "definition": "The number 2", "example": "I have two hands.", "emoji": "2️⃣"},
            {"word": "three", "ipa": "/θriː/", "definition": "The number 3", "example": "Three cats are playing.", "emoji": "3️⃣"},
            {"word": "four", "ipa": "/fɔːr/", "definition": "The number 4", "example": "I have four books.", "emoji": "4️⃣"},
            {"word": "five", "ipa": "/faɪv/", "definition": "The number 5", "example": "I have five fingers.", "emoji": "5️⃣"},
            {"word": "ten", "ipa": "/ten/", "definition": "The number 10", "example": "I count to ten.", "emoji": "🔟"},
        ],
        "grammar_rules": [
            {"rule": "It is + number", "explanation": "Use 'It is' to tell a number.", "examples": ["It is one.", "It is five."], "pattern": "It is ___"},
            {"rule": "I have + number + noun", "explanation": "Use to tell how many things you have.", "examples": ["I have two hands.", "I have five fingers."], "pattern": "I have ___ ___"},
        ],
        "reading": "Look! I have one apple. I have two bananas. My friend has three oranges. We have five fruits! Let us count: one, two, three, four, five!",
        "reading_questions": [
            {"q": "How many apples does the speaker have?", "options": ["Two", "One", "Three", "Five"], "answer": "One"},
            {"q": "How many fruits do they have together?", "options": ["Three", "Four", "Five", "Ten"], "answer": "Five"},
        ],
    },
    {
        "num": 4, "substage": "A", "title": "Colors", "theme": "Learning Colors",
        "phonics": "Letters P, Q, R, S, T", "color": "#F7DC6F",
        "grammar": "The (noun) is (color).",
        "words": [
            {"word": "red", "ipa": "/red/", "definition": "The color of an apple or fire", "example": "The apple is red.", "emoji": "🔴"},
            {"word": "blue", "ipa": "/bluː/", "definition": "The color of the sky", "example": "The sky is blue.", "emoji": "🔵"},
            {"word": "green", "ipa": "/ɡriːn/", "definition": "The color of grass and trees", "example": "The tree is green.", "emoji": "🟢"},
            {"word": "yellow", "ipa": "/ˈjeləʊ/", "definition": "The color of the sun", "example": "The sun is yellow.", "emoji": "🟡"},
            {"word": "orange", "ipa": "/ˈɒrɪndʒ/", "definition": "A color between red and yellow", "example": "The orange is orange.", "emoji": "🟠"},
            {"word": "white", "ipa": "/waɪt/", "definition": "The color of snow", "example": "The cloud is white.", "emoji": "⚪"},
        ],
        "grammar_rules": [
            {"rule": "The noun is color", "explanation": "Describe the color of something.", "examples": ["The apple is red.", "The sky is blue."], "pattern": "The ___ is ___"},
            {"rule": "What color is it?", "explanation": "Ask about a color.", "examples": ["What color is it?", "It is green."], "pattern": "What color is ___?"},
        ],
        "reading": "Look at the picture! The apple is red. The sky is blue. The tree is green. The sun is yellow. What color is the flower? The flower is orange!",
        "reading_questions": [
            {"q": "What color is the sky?", "options": ["Red", "Blue", "Green", "Yellow"], "answer": "Blue"},
            {"q": "What color is the flower?", "options": ["White", "Green", "Orange", "Red"], "answer": "Orange"},
        ],
    },
    {
        "num": 5, "substage": "A", "title": "My Family", "theme": "Family Members",
        "phonics": "Letters U, V, W, X, Y, Z", "color": "#AF7AC5",
        "grammar": "This is my...",
        "words": [
            {"word": "mother", "ipa": "/ˈmʌðər/", "definition": "Your female parent", "example": "This is my mother.", "emoji": "👩"},
            {"word": "father", "ipa": "/ˈfɑːðər/", "definition": "Your male parent", "example": "This is my father.", "emoji": "👨"},
            {"word": "brother", "ipa": "/ˈbrʌðər/", "definition": "A boy with the same parents as you", "example": "My brother is tall.", "emoji": "👦"},
            {"word": "sister", "ipa": "/ˈsɪstər/", "definition": "A girl with the same parents as you", "example": "My sister is kind.", "emoji": "👧"},
            {"word": "baby", "ipa": "/ˈbeɪbi/", "definition": "A very young child", "example": "The baby is sleeping.", "emoji": "👶"},
            {"word": "family", "ipa": "/ˈfæməli/", "definition": "A group of related people", "example": "I love my family.", "emoji": "👨‍👩‍👧‍👦"},
        ],
        "grammar_rules": [
            {"rule": "This is my + family member", "explanation": "Introduce your family members.", "examples": ["This is my mother.", "This is my brother."], "pattern": "This is my ___"},
            {"rule": "He/She is my...", "explanation": "Talk about family members.", "examples": ["He is my father.", "She is my sister."], "pattern": "He/She is my ___"},
        ],
        "reading": "This is my family. My mother is kind. My father is strong. I have one brother and one sister. My sister likes cats. My brother likes balls. I love my family!",
        "reading_questions": [
            {"q": "How many brothers does the speaker have?", "options": ["Two", "One", "Three", "None"], "answer": "One"},
            {"q": "What does the sister like?", "options": ["Dogs", "Cats", "Fish", "Birds"], "answer": "Cats"},
        ],
    },
    {
        "num": 6, "substage": "A", "title": "My Face", "theme": "Body Parts - Face",
        "phonics": "Vowel Sounds: a, e, i, o, u", "color": "#F1948A",
        "grammar": "I have...",
        "words": [
            {"word": "eye", "ipa": "/aɪ/", "definition": "The part of your body used for seeing", "example": "I have two eyes.", "emoji": "👁️"},
            {"word": "ear", "ipa": "/ɪər/", "definition": "The part of your body used for hearing", "example": "I have two ears.", "emoji": "👂"},
            {"word": "nose", "ipa": "/nəʊz/", "definition": "The part of your face used for smelling", "example": "I have one nose.", "emoji": "👃"},
            {"word": "mouth", "ipa": "/maʊθ/", "definition": "The part of your face used for eating and talking", "example": "Open your mouth.", "emoji": "👄"},
            {"word": "face", "ipa": "/feɪs/", "definition": "The front part of your head", "example": "Wash your face.", "emoji": "😊"},
            {"word": "hair", "ipa": "/heər/", "definition": "The thin strands that grow on your head", "example": "My hair is brown.", "emoji": "💇"},
        ],
        "grammar_rules": [
            {"rule": "I have + number + body part", "explanation": "Tell about your body parts.", "examples": ["I have two eyes.", "I have one nose."], "pattern": "I have ___ ___"},
            {"rule": "My + body part + is/are", "explanation": "Describe your body parts.", "examples": ["My eyes are brown.", "My hair is long."], "pattern": "My ___ is/are ___"},
        ],
        "reading": "Look at my face! I have two eyes. My eyes are big. I have two ears. I have one nose and one mouth. My hair is brown. I can see, hear, and talk!",
        "reading_questions": [
            {"q": "How many eyes does the speaker have?", "options": ["One", "Two", "Three", "Four"], "answer": "Two"},
            {"q": "What color is the speaker's hair?", "options": ["Black", "Brown", "Red", "Yellow"], "answer": "Brown"},
        ],
    },
    {
        "num": 7, "substage": "B", "title": "My Body", "theme": "Body Parts - Body",
        "phonics": "Consonant Blends: bl, cl, fl", "color": "#85C1E9",
        "grammar": "Touch your...",
        "words": [
            {"word": "arm", "ipa": "/ɑːrm/", "definition": "The long part of your body between shoulder and hand", "example": "Raise your arm.", "emoji": "💪"},
            {"word": "leg", "ipa": "/leɡ/", "definition": "The long part of your body used for walking", "example": "I have two legs.", "emoji": "🦵"},
            {"word": "hand", "ipa": "/hænd/", "definition": "The part at the end of your arm", "example": "Clap your hands.", "emoji": "✋"},
            {"word": "foot", "ipa": "/fʊt/", "definition": "The part at the end of your leg", "example": "My foot is small.", "emoji": "🦶"},
            {"word": "finger", "ipa": "/ˈfɪŋɡər/", "definition": "The thin parts at the end of your hand", "example": "I have ten fingers.", "emoji": "☝️"},
            {"word": "shoulder", "ipa": "/ˈʃəʊldər/", "definition": "The top part of your arm where it connects to your body", "example": "Touch your shoulder.", "emoji": "🤷"},
        ],
        "grammar_rules": [
            {"rule": "Touch your + body part", "explanation": "Give commands about body parts.", "examples": ["Touch your nose.", "Touch your arm."], "pattern": "Touch your ___"},
            {"rule": "Can you + action?", "explanation": "Ask about ability.", "examples": ["Can you clap your hands?", "Can you jump?"], "pattern": "Can you ___?"},
        ],
        "reading": "Let us play a game! Touch your head. Touch your arm. Clap your hands. Now jump with your legs! Can you touch your foot? I have two arms, two legs, two hands, and two feet. I have ten fingers!",
        "reading_questions": [
            {"q": "How many fingers does the speaker have?", "options": ["Five", "Eight", "Ten", "Two"], "answer": "Ten"},
            {"q": "What does the speaker ask you to do with your hands?", "options": ["Wave", "Clap", "Touch", "Raise"], "answer": "Clap"},
        ],
    },
    {
        "num": 8, "substage": "B", "title": "The Farm", "theme": "Farm Animals",
        "phonics": "Animal Sounds", "color": "#82E0AA",
        "grammar": "That is a...",
        "words": [
            {"word": "cow", "ipa": "/kaʊ/", "definition": "A large farm animal that gives milk", "example": "The cow says moo.", "emoji": "🐄"},
            {"word": "horse", "ipa": "/hɔːrs/", "definition": "A large animal you can ride", "example": "The horse is fast.", "emoji": "🐴"},
            {"word": "sheep", "ipa": "/ʃiːp/", "definition": "A farm animal with soft wool", "example": "The sheep is white.", "emoji": "🐑"},
            {"word": "duck", "ipa": "/dʌk/", "definition": "A bird that swims in water", "example": "The duck is in the pond.", "emoji": "🦆"},
            {"word": "pig", "ipa": "/pɪɡ/", "definition": "A pink farm animal", "example": "The pig is big.", "emoji": "🐷"},
            {"word": "chicken", "ipa": "/ˈtʃɪkɪn/", "definition": "A bird kept on farms for eggs", "example": "The chicken has eggs.", "emoji": "🐔"},
        ],
        "grammar_rules": [
            {"rule": "That is a + animal", "explanation": "Point to something and name it.", "examples": ["That is a cow.", "That is a horse."], "pattern": "That is a ___"},
            {"rule": "The animal + action", "explanation": "Describe what an animal does.", "examples": ["The cow says moo.", "The duck swims."], "pattern": "The ___ ___s"},
        ],
        "reading": "Welcome to the farm! That is a cow. The cow says moo. That is a horse. The horse is fast. Look! A duck is in the pond. The sheep has white wool. The pig is big and pink.",
        "reading_questions": [
            {"q": "What does the cow say?", "options": ["Baa", "Moo", "Quack", "Neigh"], "answer": "Moo"},
            {"q": "Where is the duck?", "options": ["In the barn", "In the pond", "On the hill", "In the house"], "answer": "In the pond"},
        ],
    },
    {
        "num": 9, "substage": "B", "title": "My Pets", "theme": "Pet Animals",
        "phonics": "Short Vowels: a, e, i, o, u", "color": "#F0B27A",
        "grammar": "I like...",
        "words": [
            {"word": "dog", "ipa": "/dɒɡ/", "definition": "A common pet animal that barks", "example": "I like dogs.", "emoji": "🐕"},
            {"word": "rabbit", "ipa": "/ˈræbɪt/", "definition": "A small animal with long ears", "example": "The rabbit is soft.", "emoji": "🐰"},
            {"word": "bird", "ipa": "/bɜːrd/", "definition": "An animal with wings that can fly", "example": "The bird sings.", "emoji": "🐦"},
            {"word": "mouse", "ipa": "/maʊs/", "definition": "A very small animal with a long tail", "example": "The mouse is tiny.", "emoji": "🐭"},
            {"word": "turtle", "ipa": "/ˈtɜːrtəl/", "definition": "A slow animal with a hard shell", "example": "The turtle is slow.", "emoji": "🐢"},
            {"word": "goldfish", "ipa": "/ˈɡəʊldfɪʃ/", "definition": "A small orange fish kept as a pet", "example": "I have a goldfish.", "emoji": "🐠"},
        ],
        "grammar_rules": [
            {"rule": "I like + animal", "explanation": "Tell about animals you enjoy.", "examples": ["I like dogs.", "I like cats."], "pattern": "I like ___"},
            {"rule": "I do not like + animal", "explanation": "Tell about animals you do not enjoy.", "examples": ["I do not like mice.", "I do not like spiders."], "pattern": "I do not like ___"},
        ],
        "reading": "I have many pets! I like dogs. My dog is big and happy. I also have a rabbit. The rabbit is soft. My bird sings every morning. I do not have a mouse, but my friend does!",
        "reading_questions": [
            {"q": "What pet sings every morning?", "options": ["The dog", "The bird", "The rabbit", "The mouse"], "answer": "The bird"},
            {"q": "What is the rabbit like?", "options": ["Big", "Soft", "Loud", "Fast"], "answer": "Soft"},
        ],
    },
    {
        "num": 10, "substage": "B", "title": "At School", "theme": "School Objects",
        "phonics": "High Frequency Words", "color": "#A3E4D7",
        "grammar": "I have a...",
        "words": [
            {"word": "bag", "ipa": "/bæɡ/", "definition": "Something you carry your things in", "example": "My bag is heavy.", "emoji": "🎒"},
            {"word": "pen", "ipa": "/pen/", "definition": "A tool used for writing with ink", "example": "I write with a pen.", "emoji": "🖊️"},
            {"word": "pencil", "ipa": "/ˈpensəl/", "definition": "A tool used for writing and drawing", "example": "I draw with a pencil.", "emoji": "✏️"},
            {"word": "book", "ipa": "/bʊk/", "definition": "Pages with words to read", "example": "I read a book.", "emoji": "📖"},
            {"word": "eraser", "ipa": "/ɪˈreɪzər/", "definition": "A tool used to remove pencil marks", "example": "I need an eraser.", "emoji": "🧹"},
            {"word": "ruler", "ipa": "/ˈruːlər/", "definition": "A tool used to draw straight lines", "example": "I use a ruler.", "emoji": "📏"},
        ],
        "grammar_rules": [
            {"rule": "I have a + school object", "explanation": "Tell about things you own.", "examples": ["I have a pen.", "I have a book."], "pattern": "I have a ___"},
            {"rule": "Do you have a...?", "explanation": "Ask if someone has something.", "examples": ["Do you have a pen?", "Do you have a ruler?"], "pattern": "Do you have a ___?"},
        ],
        "reading": "I am at school. I have a bag. In my bag, I have a pen, a pencil, a book, and an eraser. My friend does not have a ruler. I give my ruler to my friend. Sharing is good!",
        "reading_questions": [
            {"q": "Where is the speaker?", "options": ["At home", "At school", "At the park", "At the farm"], "answer": "At school"},
            {"q": "What does the speaker give to the friend?", "options": ["A pen", "A book", "A ruler", "An eraser"], "answer": "A ruler"},
        ],
    },
    {
        "num": 11, "substage": "B", "title": "Feelings", "theme": "Emotions",
        "phonics": "Intonation and Pitch", "color": "#F9E79F",
        "grammar": "I am (feeling).",
        "words": [
            {"word": "happy", "ipa": "/ˈhæpi/", "definition": "Feeling good and pleased", "example": "I am happy today!", "emoji": "😊"},
            {"word": "sad", "ipa": "/sæd/", "definition": "Feeling unhappy or upset", "example": "She is sad.", "emoji": "😢"},
            {"word": "angry", "ipa": "/ˈæŋɡri/", "definition": "Feeling very upset or mad", "example": "He is angry.", "emoji": "😠"},
            {"word": "sleepy", "ipa": "/ˈsliːpi/", "definition": "Feeling like you want to sleep", "example": "I am sleepy.", "emoji": "😴"},
            {"word": "hungry", "ipa": "/ˈhʌŋɡri/", "definition": "Feeling like you want to eat", "example": "I am hungry.", "emoji": "🤤"},
            {"word": "scared", "ipa": "/skeərd/", "definition": "Feeling afraid", "example": "The cat is scared.", "emoji": "😨"},
        ],
        "grammar_rules": [
            {"rule": "I am + feeling", "explanation": "Tell about how you feel.", "examples": ["I am happy.", "I am sad."], "pattern": "I am ___"},
            {"rule": "Are you + feeling?", "explanation": "Ask someone how they feel.", "examples": ["Are you happy?", "Are you hungry?"], "pattern": "Are you ___?"},
        ],
        "reading": "How are you today? I am happy! My friend Tom is sad because he lost his ball. Sara is hungry. She wants an apple. Are you sleepy? It is time for bed! Good night!",
        "reading_questions": [
            {"q": "Why is Tom sad?", "options": ["He is hungry", "He lost his ball", "He is sleepy", "He is scared"], "answer": "He lost his ball"},
            {"q": "What does Sara want?", "options": ["A ball", "A book", "An apple", "A cat"], "answer": "An apple"},
        ],
    },
    {
        "num": 12, "substage": "B", "title": "Big Review!", "theme": "Cumulative Review",
        "phonics": "Cumulative Mastery Check", "color": "#D7BDE2",
        "grammar": "Mixed Patterns (Review)",
        "words": [
            {"word": "hello", "ipa": "/həˈləʊ/", "definition": "A greeting when you meet someone", "example": "Hello! How are you?", "emoji": "👋"},
            {"word": "family", "ipa": "/ˈfæməli/", "definition": "A group of related people", "example": "I love my family.", "emoji": "👨‍👩‍👧‍👦"},
            {"word": "red", "ipa": "/red/", "definition": "The color of an apple or fire", "example": "The apple is red.", "emoji": "🔴"},
            {"word": "dog", "ipa": "/dɒɡ/", "definition": "A common pet animal that barks", "example": "I like dogs.", "emoji": "🐕"},
            {"word": "happy", "ipa": "/ˈhæpi/", "definition": "Feeling good and pleased", "example": "I am happy today!", "emoji": "😊"},
            {"word": "book", "ipa": "/bʊk/", "definition": "Pages with words to read", "example": "I read a book.", "emoji": "📖"},
        ],
        "grammar_rules": [
            {"rule": "I am + name/feeling", "explanation": "Introduce yourself or tell how you feel.", "examples": ["I am Tom.", "I am happy."], "pattern": "I am ___"},
            {"rule": "This is my + noun", "explanation": "Show something that belongs to you.", "examples": ["This is my dog.", "This is my family."], "pattern": "This is my ___"},
        ],
        "reading": "My name is Tom. I am a student. I have a big family: a mother, a father, a brother, and a sister. I like my dog. My dog is brown. I am happy at school. I have a red bag, a pen, and many books!",
        "reading_questions": [
            {"q": "What color is Tom's bag?", "options": ["Blue", "Green", "Red", "Yellow"], "answer": "Red"},
            {"q": "What animal does Tom have?", "options": ["A cat", "A dog", "A fish", "A bird"], "answer": "A dog"},
        ],
    },
]


def make_activity_flow(unit_num, lesson_num):
    """Generate the 10-step activity flow for a lesson"""
    pfx = f"s1u{unit_num:02d}l{lesson_num:02d}"
    return [
        {"order": 1, "type": "retrieval_warmup", "activity_id": f"warmup_{pfx}", "icon": "refresh-cw", "label": "Warm-up", "duration_minutes": 2, "is_skippable": True},
        {"order": 2, "type": "vocabulary", "activity_id": f"vocab_{pfx}", "icon": "book-open", "label": "Vocabulary", "duration_minutes": 6, "is_skippable": False},
        {"order": 3, "type": "micro_game_vocab", "activity_id": f"game_vocab_{pfx}", "icon": "gamepad-2", "label": "Vocab Game", "duration_minutes": 4, "is_skippable": False},
        {"order": 4, "type": "micro_reading", "activity_id": f"reading_{pfx}", "icon": "file-text", "label": "Reading", "duration_minutes": 3, "is_skippable": True},
        {"order": 5, "type": "grammar_focus", "activity_id": f"grammar_{pfx}", "icon": "edit-3", "label": "Grammar", "duration_minutes": 4, "is_skippable": False},
        {"order": 6, "type": "micro_game_grammar", "activity_id": f"game_grammar_{pfx}", "icon": "gamepad-2", "label": "Grammar Game", "duration_minutes": 3, "is_skippable": False},
        {"order": 7, "type": "listening", "activity_id": f"listening_{pfx}", "icon": "headphones", "label": "Listening", "duration_minutes": 4, "is_skippable": False},
        {"order": 8, "type": "production", "activity_id": f"production_{pfx}", "icon": "mic", "label": "Speaking", "duration_minutes": 4, "is_skippable": False},
        {"order": 9, "type": "exit_ticket", "activity_id": f"exit_{pfx}", "icon": "check-circle", "label": "Exit Quiz", "duration_minutes": 2, "is_skippable": False},
        {"order": 10, "type": "auto_review", "activity_id": f"review_{pfx}", "icon": "repeat", "label": "Review", "duration_minutes": 0, "is_skippable": False},
    ]


def make_lessons(unit):
    """Generate 4 lessons per unit"""
    un = unit["num"]
    words = unit["words"]
    half = len(words) // 2
    titles = [
        f"Meet the Words",
        f"Practice Time",
        f"Read and Learn",
        f"Review and Speak",
    ]
    descs = [
        f"Learn the first {unit['theme'].lower()} vocabulary",
        f"Practice {unit['theme'].lower()} words and patterns",
        f"Read about {unit['theme'].lower()} in context",
        f"Review everything and practice speaking",
    ]
    lessons = []
    for ln in range(1, 5):
        lessons.append({
            "lesson_id": f"stage_1_unit_{un:02d}_lesson_{ln:02d}",
            "unit_id": f"stage_1_unit_{un:02d}",
            "stage_id": "stage_1",
            "number": ln,
            "title": titles[ln - 1],
            "description": descs[ln - 1],
            "estimated_duration_minutes": 25,
            "points_reward": 50,
            "activity_flow": make_activity_flow(un, ln),
            "created_at": TS
        })
    return lessons


def make_vocab_activity(unit, lesson_num):
    """Generate vocabulary activity for a lesson"""
    un = unit["num"]
    words = unit["words"]
    # Lesson 1-2: first half, Lesson 3-4: all words (spiral review)
    half = len(words) // 2
    if lesson_num <= 2:
        selected = words[:half] if lesson_num == 1 else words[half:]
    else:
        selected = words
    return {
        "activity_id": f"vocab_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "unit_number": un,
        "words": [
            {
                "word_id": f"w_{un}_{i}",
                "word": w["word"],
                "ipa": w["ipa"],
                "definition": w["definition"],
                "example_sentence": w["example"],
                "image_emoji": w["emoji"],
                "audio_url": None,
                "sentence_audio_url": None,
            } for i, w in enumerate(selected)
        ],
        "created_at": TS
    }


def make_warmup_activity(unit, lesson_num):
    """Generate warmup questions"""
    un = unit["num"]
    words = unit["words"]
    questions = []
    for i, w in enumerate(words[:3]):
        options = [w["word"]] + [x["word"] for x in words if x != w][:3]
        import random
        random.shuffle(options)
        questions.append({
            "question_id": f"wq_{un}_{lesson_num}_{i}",
            "question_text": f"What does '{w['definition'].lower()}' mean?",
            "correct_answer": w["word"],
            "options": options[:4],
            "question_type": "multiple_choice"
        })
    return {
        "activity_id": f"warmup_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "questions": questions,
        "created_at": TS
    }


def make_vocab_game(unit, lesson_num):
    """Generate vocabulary matching game"""
    un = unit["num"]
    words = unit["words"]
    half = len(words) // 2
    selected = words[:half] if lesson_num <= 2 else words[half:]
    return {
        "activity_id": f"game_vocab_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "type": "micro_game_vocab",
        "game_type": "matching",
        "items": [{"word": w["word"], "match": w["definition"]} for w in selected],
        "time_limit_seconds": 180,
        "scoring": {"perfect": 90, "good": 70, "pass": 50},
        "created_at": TS
    }


def make_grammar_activity(unit, lesson_num):
    """Generate grammar focus activity"""
    un = unit["num"]
    rules = unit["grammar_rules"]
    rule = rules[min(lesson_num - 1, len(rules) - 1)]
    return {
        "activity_id": f"grammar_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "rules": [{
            "rule_id": f"gr_{un}_{lesson_num}",
            "title": rule["rule"],
            "explanation": rule["explanation"],
            "examples": rule["examples"],
            "pattern": rule["pattern"],
        }],
        "created_at": TS
    }


def make_grammar_game(unit, lesson_num):
    """Generate grammar game with 3 types"""
    un = unit["num"]
    rules = unit["grammar_rules"]
    words = unit["words"]
    r = rules[min(lesson_num - 1, len(rules) - 1)]

    # Error hunter items
    error_items = []
    for ex in r["examples"]:
        error_items.append({"sentence": ex, "has_error": False, "correct_sentence": ex})
    # Add an error version
    if words:
        error_items.append({
            "sentence": f"I is a {words[0]['word']}.",
            "has_error": True,
            "correct_sentence": f"I am a {words[0]['word']}." if "am" in r.get("pattern", "") else f"It is a {words[0]['word']}."
        })

    # Word order items
    word_order = []
    for ex in r["examples"][:2]:
        w_list = ex.rstrip('.!?').split()
        punct = ex[-1] if ex[-1] in '.!?' else '.'
        word_order.append({
            "words": w_list,
            "correct_sentence": ' '.join(w_list) + punct if not ex.endswith(punct) else ' '.join(w_list),
            "hint": r["explanation"]
        })
        # Fix: include punctuation properly
        word_order[-1]["correct_sentence"] = ex

    # Fill blank items
    fill_blank = []
    for w in words[:3]:
        pattern = r["pattern"]
        if "___" in pattern:
            sentence = pattern.replace("___", "______", 1)
            others = [x["word"] for x in words if x != w][:3]
            fill_blank.append({
                "sentence": sentence.replace("______", "______"),
                "options": [w["word"]] + others,
                "correct_answer": w["word"]
            })

    return {
        "activity_id": f"game_grammar_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "type": "micro_game_grammar",
        "game_type": "mixed",
        "items": error_items,
        "word_order_items": word_order,
        "fill_blank_items": fill_blank,
        "time_limit_seconds": 300,
        "scoring": {"perfect": 90, "good": 70, "pass": 50},
        "created_at": TS
    }


def make_reading_activity(unit, lesson_num):
    """Generate reading activity"""
    un = unit["num"]
    qs = unit["reading_questions"]
    return {
        "activity_id": f"reading_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "passage": unit["reading"],
        "title": f"Reading: {unit['title']}",
        "questions": [{
            "question_id": f"rq_{un}_{lesson_num}_{i}",
            "question_text": q["q"],
            "options": q["options"],
            "correct_answer": q["answer"],
            "question_type": "multiple_choice"
        } for i, q in enumerate(qs)],
        "created_at": TS
    }


def make_listening_activity(unit, lesson_num):
    """Generate listening activity"""
    un = unit["num"]
    words = unit["words"]
    return {
        "activity_id": f"listening_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "audio_script": unit["reading"],
        "audio_url": None,
        "speakers": [{"name": "Teacher", "role": "narrator"}],
        "questions": [{
            "question_id": f"lq_{un}_{lesson_num}_{i}",
            "question_text": f"Which word did you hear? Listen for '{w['word']}'.",
            "options": [w["word"]] + [x["word"] for x in words if x != w][:3],
            "correct_answer": w["word"],
            "question_type": "multiple_choice"
        } for i, w in enumerate(words[:2])],
        "created_at": TS
    }


def make_production_activity(unit, lesson_num):
    """Generate production activity"""
    un = unit["num"]
    rules = unit["grammar_rules"]
    r = rules[0]
    return {
        "activity_id": f"production_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "production_type": "speaking" if lesson_num % 2 == 0 else "writing",
        "prompt": f"Use the pattern '{r['pattern']}' to make a sentence about {unit['theme'].lower()}.",
        "example_answer": r["examples"][0],
        "rubric": ["Uses the correct pattern", "Uses vocabulary from this unit", "Clear pronunciation or spelling"],
        "created_at": TS
    }


def make_exit_ticket(unit, lesson_num):
    """Generate exit quiz"""
    un = unit["num"]
    words = unit["words"]
    rules = unit["grammar_rules"]
    questions = []

    # Vocab questions
    for i, w in enumerate(words[:2]):
        others = [x["word"] for x in words if x != w][:3]
        questions.append({
            "question_id": f"eq_{un}_{lesson_num}_{i}",
            "question_text": f"What is '{w['definition'].lower()}'?",
            "correct_answer": w["word"],
            "options": [w["word"]] + others,
            "question_type": "multiple_choice"
        })

    # Grammar question
    r = rules[0]
    questions.append({
        "question_id": f"eq_{un}_{lesson_num}_g1",
        "question_text": f"Complete: {r['pattern']}",
        "correct_answer": words[0]["word"],
        "options": [words[0]["word"], words[1]["word"], words[2]["word"] if len(words) > 2 else "none", "the"],
        "question_type": "multiple_choice"
    })

    # Fill blank
    questions.append({
        "question_id": f"eq_{un}_{lesson_num}_fb",
        "question_text": f"Write the missing word: {r['examples'][0].replace(r['examples'][0].split()[-1], '______')}",
        "correct_answer": r["examples"][0].split()[-1].rstrip('.!?'),
        "question_type": "fill_blank"
    })

    return {
        "activity_id": f"exit_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "questions": questions,
        "pass_threshold": 70,
        "created_at": TS
    }


async def seed_full_stage_1():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'ielts_ace')]

    print("=" * 60)
    print("SEEDING FULL STAGE 1 CURRICULUM (12 Units, 48 Lessons)")
    print("=" * 60)

    # Clear existing Stage 1 data
    collections_to_clear = [
        "unified_units", "unified_lessons",
        "unified_vocabulary_activities", "unified_warmup_activities",
        "unified_game_activities", "unified_grammar_activities",
        "unified_reading_activities", "unified_listening_activities",
        "unified_production_activities", "unified_exit_activities"
    ]
    for col in collections_to_clear:
        r = await db[col].delete_many({"$or": [
            {"stage_id": "stage_1"},
            {"stage_id": "stage_1_foundations"},
            {"lesson_id": {"$regex": "^stage_1_"}},
            {"unit_id": {"$regex": "^stage_1_"}}
        ]})
        if r.deleted_count > 0:
            print(f"  Cleared {col}: {r.deleted_count} docs")

    # Update stage
    await db.unified_stages.update_one(
        {"number": 1},
        {"$set": {"stage_id": "stage_1", "name": "Foundations", "cefr_level": "Pre-A1",
                  "total_units": 12, "description": "Build your English foundation from scratch!",
                  "color": "#F59E0B", "visual_strategy": "heavy", "tone": "playful"}},
        upsert=True
    )

    # Seed units
    unit_docs = []
    for u in UNITS:
        unit_docs.append({
            "unit_id": f"stage_1_unit_{u['num']:02d}",
            "stage_id": "stage_1",
            "number": u["num"],
            "substage": u["substage"],
            "title": u["title"],
            "description": u["theme"],
            "theme": u["theme"],
            "phonics_focus": u["phonics"],
            "grammar_pattern": u["grammar"],
            "total_lessons": 4,
            "order": u["num"],
            "theme_color": u["color"],
            "created_at": TS
        })
    await db.unified_units.insert_many(unit_docs)
    print(f"Inserted {len(unit_docs)} units")

    # Seed lessons and activities
    all_lessons = []
    all_vocab = []
    all_warmup = []
    all_vocab_games = []
    all_grammar = []
    all_grammar_games = []
    all_reading = []
    all_listening = []
    all_production = []
    all_exit = []

    for u in UNITS:
        lessons = make_lessons(u)
        all_lessons.extend(lessons)
        for ln in range(1, 5):
            all_vocab.append(make_vocab_activity(u, ln))
            all_warmup.append(make_warmup_activity(u, ln))
            all_vocab_games.append(make_vocab_game(u, ln))
            all_grammar.append(make_grammar_activity(u, ln))
            all_grammar_games.append(make_grammar_game(u, ln))
            all_reading.append(make_reading_activity(u, ln))
            all_listening.append(make_listening_activity(u, ln))
            all_production.append(make_production_activity(u, ln))
            all_exit.append(make_exit_ticket(u, ln))

    await db.unified_lessons.insert_many(all_lessons)
    print(f"Inserted {len(all_lessons)} lessons")

    await db.unified_vocabulary_activities.insert_many(all_vocab)
    print(f"Inserted {len(all_vocab)} vocabulary activities")

    await db.unified_warmup_activities.insert_many(all_warmup)
    print(f"Inserted {len(all_warmup)} warmup activities")

    await db.unified_game_activities.insert_many(all_vocab_games + all_grammar_games)
    print(f"Inserted {len(all_vocab_games)} vocab games + {len(all_grammar_games)} grammar games")

    await db.unified_grammar_activities.insert_many(all_grammar)
    print(f"Inserted {len(all_grammar)} grammar activities")

    await db.unified_reading_activities.insert_many(all_reading)
    print(f"Inserted {len(all_reading)} reading activities")

    await db.unified_listening_activities.insert_many(all_listening)
    print(f"Inserted {len(all_listening)} listening activities")

    await db.unified_production_activities.insert_many(all_production)
    print(f"Inserted {len(all_production)} production activities")

    await db.unified_exit_activities.insert_many(all_exit)
    print(f"Inserted {len(all_exit)} exit activities")

    print("=" * 60)
    print("STAGE 1 CURRICULUM SEED COMPLETE!")
    total = len(all_lessons) + len(all_vocab) + len(all_warmup) + len(all_vocab_games) + len(all_grammar) + len(all_grammar_games) + len(all_reading) + len(all_listening) + len(all_production) + len(all_exit)
    print(f"Total records: {total}")
    print("=" * 60)

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_full_stage_1())
