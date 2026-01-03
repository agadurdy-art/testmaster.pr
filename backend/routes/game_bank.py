"""
Game Bank API
=============
Mini-games for vocabulary, listening, and speaking practice.
Inspired by Wordwall and hoclieu.vn style educational games.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import random

router = APIRouter(prefix="/api/games", tags=["Game Bank"])


# ============ GAME DATA MODELS ============

class GameQuestion(BaseModel):
    id: str
    type: str
    question: str
    options: Optional[List[str]] = None
    correct_answer: str
    hint: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None


class GameConfig(BaseModel):
    game_id: str
    game_type: str
    title: str
    description: str
    difficulty: str
    time_limit: Optional[int] = None
    questions: List[Dict[str, Any]]


# ============ GAME CONTENT ============

# Vocabulary for games - organized by topic
VOCABULARY_DATA = {
    "family": [
        {"word": "mother", "meaning": "anne", "image": "👩", "example": "My mother is kind."},
        {"word": "father", "meaning": "baba", "image": "👨", "example": "My father works hard."},
        {"word": "sister", "meaning": "kız kardeş", "image": "👧", "example": "I have one sister."},
        {"word": "brother", "meaning": "erkek kardeş", "image": "👦", "example": "My brother is tall."},
        {"word": "grandmother", "meaning": "büyükanne", "image": "👵", "example": "Grandmother bakes cookies."},
        {"word": "grandfather", "meaning": "büyükbaba", "image": "👴", "example": "Grandfather tells stories."},
        {"word": "aunt", "meaning": "teyze/hala", "image": "👩", "example": "My aunt lives nearby."},
        {"word": "uncle", "meaning": "amca/dayı", "image": "👨", "example": "Uncle visits on weekends."},
    ],
    "food": [
        {"word": "apple", "meaning": "elma", "image": "🍎", "example": "I eat an apple every day."},
        {"word": "banana", "meaning": "muz", "image": "🍌", "example": "Bananas are yellow."},
        {"word": "bread", "meaning": "ekmek", "image": "🍞", "example": "I need bread for breakfast."},
        {"word": "cheese", "meaning": "peynir", "image": "🧀", "example": "Cheese is delicious."},
        {"word": "chicken", "meaning": "tavuk", "image": "🍗", "example": "We had chicken for dinner."},
        {"word": "orange", "meaning": "portakal", "image": "🍊", "example": "Orange juice is healthy."},
        {"word": "rice", "meaning": "pirinç", "image": "🍚", "example": "Rice is a staple food."},
        {"word": "water", "meaning": "su", "image": "💧", "example": "Drink more water."},
    ],
    "animals": [
        {"word": "cat", "meaning": "kedi", "image": "🐱", "example": "The cat is sleeping."},
        {"word": "dog", "meaning": "köpek", "image": "🐕", "example": "My dog is friendly."},
        {"word": "bird", "meaning": "kuş", "image": "🐦", "example": "Birds can fly."},
        {"word": "fish", "meaning": "balık", "image": "🐟", "example": "Fish live in water."},
        {"word": "rabbit", "meaning": "tavşan", "image": "🐰", "example": "Rabbits hop fast."},
        {"word": "elephant", "meaning": "fil", "image": "🐘", "example": "Elephants are big."},
        {"word": "lion", "meaning": "aslan", "image": "🦁", "example": "The lion is king."},
        {"word": "monkey", "meaning": "maymun", "image": "🐵", "example": "Monkeys like bananas."},
    ],
    "colors": [
        {"word": "red", "meaning": "kırmızı", "image": "🔴", "example": "Apples are red."},
        {"word": "blue", "meaning": "mavi", "image": "🔵", "example": "The sky is blue."},
        {"word": "green", "meaning": "yeşil", "image": "🟢", "example": "Grass is green."},
        {"word": "yellow", "meaning": "sarı", "image": "🟡", "example": "Bananas are yellow."},
        {"word": "orange", "meaning": "turuncu", "image": "🟠", "example": "Oranges are orange."},
        {"word": "purple", "meaning": "mor", "image": "🟣", "example": "Grapes can be purple."},
        {"word": "black", "meaning": "siyah", "image": "⚫", "example": "Night is black."},
        {"word": "white", "meaning": "beyaz", "image": "⚪", "example": "Snow is white."},
    ],
    "numbers": [
        {"word": "one", "meaning": "bir", "image": "1️⃣", "example": "I have one nose."},
        {"word": "two", "meaning": "iki", "image": "2️⃣", "example": "I have two eyes."},
        {"word": "three", "meaning": "üç", "image": "3️⃣", "example": "A triangle has three sides."},
        {"word": "four", "meaning": "dört", "image": "4️⃣", "example": "A dog has four legs."},
        {"word": "five", "meaning": "beş", "image": "5️⃣", "example": "I have five fingers."},
        {"word": "ten", "meaning": "on", "image": "🔟", "example": "I have ten toes."},
        {"word": "twenty", "meaning": "yirmi", "image": "2️⃣0️⃣", "example": "Twenty students in class."},
        {"word": "hundred", "meaning": "yüz", "image": "💯", "example": "One hundred percent!"},
    ],
    "school": [
        {"word": "book", "meaning": "kitap", "image": "📚", "example": "I read a book."},
        {"word": "pencil", "meaning": "kalem", "image": "✏️", "example": "Write with a pencil."},
        {"word": "teacher", "meaning": "öğretmen", "image": "👩‍🏫", "example": "The teacher is kind."},
        {"word": "student", "meaning": "öğrenci", "image": "👨‍🎓", "example": "I am a student."},
        {"word": "classroom", "meaning": "sınıf", "image": "🏫", "example": "The classroom is big."},
        {"word": "homework", "meaning": "ödev", "image": "📝", "example": "Do your homework."},
        {"word": "desk", "meaning": "sıra", "image": "🪑", "example": "Sit at your desk."},
        {"word": "board", "meaning": "tahta", "image": "📋", "example": "Look at the board."},
    ],
}

# True/False questions
TRUE_FALSE_QUESTIONS = [
    {"statement": "Cats can fly.", "answer": False, "topic": "animals"},
    {"statement": "The sun rises in the east.", "answer": True, "topic": "nature"},
    {"statement": "Fish live in water.", "answer": True, "topic": "animals"},
    {"statement": "Apples are blue.", "answer": False, "topic": "colors"},
    {"statement": "Elephants are big animals.", "answer": True, "topic": "animals"},
    {"statement": "Ice is hot.", "answer": False, "topic": "science"},
    {"statement": "We use pencils to write.", "answer": True, "topic": "school"},
    {"statement": "Birds have four legs.", "answer": False, "topic": "animals"},
    {"statement": "The moon shines at night.", "answer": True, "topic": "nature"},
    {"statement": "Dogs say 'meow'.", "answer": False, "topic": "animals"},
    {"statement": "Water is a liquid.", "answer": True, "topic": "science"},
    {"statement": "Bananas are purple.", "answer": False, "topic": "food"},
]


# ============ GAME GENERATORS ============

def generate_matching_game(topic: str, count: int = 6) -> GameConfig:
    """Generate a memory/matching pairs game"""
    vocab = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    selected = random.sample(vocab, min(count, len(vocab)))
    
    pairs = []
    for item in selected:
        pairs.append({
            "id": f"word_{item['word']}",
            "content": item["word"],
            "type": "word",
            "match_id": f"meaning_{item['word']}"
        })
        pairs.append({
            "id": f"meaning_{item['word']}",
            "content": f"{item['image']} {item['meaning']}",
            "type": "meaning",
            "match_id": f"word_{item['word']}"
        })
    
    random.shuffle(pairs)
    
    return GameConfig(
        game_id=f"matching_{topic}_{random.randint(1000,9999)}",
        game_type="matching_pairs",
        title=f"Match the Words: {topic.title()}",
        description="Find matching pairs! Click two cards to flip them.",
        difficulty="easy",
        time_limit=120,
        questions=pairs
    )


def generate_spelling_bee(topic: str, count: int = 5) -> GameConfig:
    """Generate a spelling bee game"""
    vocab = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    selected = random.sample(vocab, min(count, len(vocab)))
    
    questions = []
    for item in selected:
        word = item["word"]
        # Scramble the word
        letters = list(word)
        random.shuffle(letters)
        scrambled = "".join(letters)
        
        # Make sure it's actually scrambled
        while scrambled == word and len(word) > 2:
            random.shuffle(letters)
            scrambled = "".join(letters)
        
        questions.append({
            "id": f"spell_{word}",
            "scrambled": scrambled.upper(),
            "correct_answer": word,
            "hint": item["meaning"],
            "image": item["image"],
            "letters": list(word.upper())
        })
    
    return GameConfig(
        game_id=f"spelling_{topic}_{random.randint(1000,9999)}",
        game_type="spelling_bee",
        title=f"Spelling Bee: {topic.title()}",
        description="Unscramble the letters to spell the word!",
        difficulty="medium",
        time_limit=180,
        questions=questions
    )


def generate_true_false(count: int = 8) -> GameConfig:
    """Generate a true/false quiz game"""
    selected = random.sample(TRUE_FALSE_QUESTIONS, min(count, len(TRUE_FALSE_QUESTIONS)))
    
    questions = []
    for idx, item in enumerate(selected):
        questions.append({
            "id": f"tf_{idx}",
            "statement": item["statement"],
            "correct_answer": item["answer"],
            "topic": item["topic"]
        })
    
    return GameConfig(
        game_id=f"truefalse_{random.randint(1000,9999)}",
        game_type="true_false",
        title="True or False?",
        description="Is the statement true or false? Choose wisely!",
        difficulty="easy",
        time_limit=90,
        questions=questions
    )


def generate_word_race(topic: str, count: int = 8) -> GameConfig:
    """Generate a word race game - match word to meaning quickly"""
    vocab = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    selected = random.sample(vocab, min(count, len(vocab)))
    
    questions = []
    for item in selected:
        # Generate wrong options
        other_words = [v for v in vocab if v["word"] != item["word"]]
        wrong_options = random.sample(other_words, min(3, len(other_words)))
        
        options = [item["meaning"]] + [w["meaning"] for w in wrong_options]
        random.shuffle(options)
        
        questions.append({
            "id": f"race_{item['word']}",
            "word": item["word"],
            "image": item["image"],
            "options": options,
            "correct_answer": item["meaning"]
        })
    
    return GameConfig(
        game_id=f"wordrace_{topic}_{random.randint(1000,9999)}",
        game_type="word_race",
        title=f"Word Race: {topic.title()}",
        description="Choose the correct meaning as fast as you can!",
        difficulty="medium",
        time_limit=60,
        questions=questions
    )


def generate_lucky_wheel(topics: List[str] = None) -> GameConfig:
    """Generate a lucky wheel game with random questions from all topics"""
    if not topics:
        topics = list(VOCABULARY_DATA.keys())
    
    questions = []
    for topic in topics:
        vocab = VOCABULARY_DATA.get(topic, [])
        for item in random.sample(vocab, min(2, len(vocab))):
            other_words = [v for v in vocab if v["word"] != item["word"]]
            wrong_options = random.sample(other_words, min(3, len(other_words)))
            
            options = [item["meaning"]] + [w["meaning"] for w in wrong_options]
            random.shuffle(options)
            
            questions.append({
                "id": f"wheel_{item['word']}",
                "word": item["word"],
                "image": item["image"],
                "topic": topic,
                "options": options,
                "correct_answer": item["meaning"],
                "points": random.choice([10, 20, 30, 50])
            })
    
    random.shuffle(questions)
    
    return GameConfig(
        game_id=f"luckywheel_{random.randint(1000,9999)}",
        game_type="lucky_wheel",
        title="Lucky Wheel!",
        description="Spin the wheel and answer to win points!",
        difficulty="mixed",
        time_limit=None,
        questions=questions[:12]  # Max 12 questions
    )


def generate_fishing_game(topic: str, count: int = 10) -> GameConfig:
    """Generate a fishing game - catch the right word"""
    vocab = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    selected = random.sample(vocab, min(count, len(vocab)))
    
    questions = []
    for item in selected:
        # Include some wrong words as distractors
        other_words = [v["word"] for v in vocab if v["word"] != item["word"]]
        distractors = random.sample(other_words, min(3, len(other_words)))
        
        all_fish = [item["word"]] + distractors
        random.shuffle(all_fish)
        
        questions.append({
            "id": f"fish_{item['word']}",
            "target_meaning": item["meaning"],
            "target_image": item["image"],
            "fish": all_fish,
            "correct_fish": item["word"]
        })
    
    return GameConfig(
        game_id=f"fishing_{topic}_{random.randint(1000,9999)}",
        game_type="fishing",
        title=f"Fishing Trip: {topic.title()}",
        description="Catch the fish with the correct word!",
        difficulty="easy",
        time_limit=120,
        questions=questions
    )


# ============ API ENDPOINTS ============

@router.get("/list")
async def list_available_games():
    """List all available game types and topics"""
    return {
        "games": [
            {
                "type": "matching_pairs",
                "title": "Matching Pairs",
                "description": "Find matching word-meaning pairs",
                "icon": "🎴",
                "color": "from-pink-500 to-rose-500"
            },
            {
                "type": "spelling_bee",
                "title": "Spelling Bee",
                "description": "Unscramble letters to spell words",
                "icon": "🐝",
                "color": "from-amber-500 to-yellow-500"
            },
            {
                "type": "true_false",
                "title": "True or False",
                "description": "Decide if statements are true or false",
                "icon": "✅",
                "color": "from-green-500 to-emerald-500"
            },
            {
                "type": "word_race",
                "title": "Word Race",
                "description": "Match words to meanings quickly",
                "icon": "🏃",
                "color": "from-blue-500 to-indigo-500"
            },
            {
                "type": "lucky_wheel",
                "title": "Lucky Wheel",
                "description": "Spin and answer random questions",
                "icon": "🎡",
                "color": "from-purple-500 to-violet-500"
            },
            {
                "type": "fishing",
                "title": "Fishing Trip",
                "description": "Catch fish with correct words",
                "icon": "🎣",
                "color": "from-cyan-500 to-teal-500"
            }
        ],
        "topics": list(VOCABULARY_DATA.keys())
    }


@router.get("/play/{game_type}")
async def get_game(
    game_type: str,
    topic: str = "family",
    count: int = 6
):
    """Generate and return a specific game"""
    
    generators = {
        "matching_pairs": lambda: generate_matching_game(topic, count),
        "spelling_bee": lambda: generate_spelling_bee(topic, count),
        "true_false": lambda: generate_true_false(count),
        "word_race": lambda: generate_word_race(topic, count),
        "lucky_wheel": lambda: generate_lucky_wheel(),
        "fishing": lambda: generate_fishing_game(topic, count)
    }
    
    if game_type not in generators:
        raise HTTPException(status_code=400, detail=f"Unknown game type: {game_type}")
    
    game = generators[game_type]()
    
    return {
        "success": True,
        "game": game.dict()
    }


@router.post("/submit/{game_id}")
async def submit_game_score(
    game_id: str,
    score: int,
    total: int,
    time_taken: int = 0
):
    """Submit game score (for leaderboard in future)"""
    percentage = (score / total * 100) if total > 0 else 0
    
    # Determine stars based on percentage
    if percentage >= 90:
        stars = 3
        message = "Amazing! Perfect score! 🌟🌟🌟"
    elif percentage >= 70:
        stars = 2
        message = "Great job! Keep it up! 🌟🌟"
    elif percentage >= 50:
        stars = 1
        message = "Good effort! Try again! 🌟"
    else:
        stars = 0
        message = "Keep practicing! You can do it! 💪"
    
    return {
        "success": True,
        "game_id": game_id,
        "score": score,
        "total": total,
        "percentage": round(percentage, 1),
        "stars": stars,
        "message": message,
        "time_taken": time_taken
    }


@router.get("/vocabulary/{topic}")
async def get_vocabulary_list(topic: str):
    """Get vocabulary list for a specific topic"""
    if topic not in VOCABULARY_DATA:
        raise HTTPException(status_code=404, detail=f"Topic not found: {topic}")
    
    return {
        "topic": topic,
        "vocabulary": VOCABULARY_DATA[topic]
    }


print("✅ Game Bank routes loaded")
