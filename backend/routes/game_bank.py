"""
Game Bank API - Multi-Language Support
======================================
Mini-games for vocabulary, listening, and speaking practice.
Fully supports EN/VI/TR language modes with strict purity.
"""

from fastapi import APIRouter, HTTPException, Header
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


# ============ MULTI-LANGUAGE VOCABULARY DATA ============
# Data extracted to content/game_bank_vocab.py (Faz 1 refactor, 2026-07-02).
from content.game_bank_vocab import (
    VOCABULARY_DATA,
    GAME_UI_STRINGS,
    TRUE_FALSE_QUESTIONS,
)


# ============ LANGUAGE HELPER ============

def get_localized(obj: dict, lang: str, fallback: str = "") -> str:
    """Get localized text from a multi-language object"""
    if not obj or not isinstance(obj, dict):
        return fallback
    return obj.get(lang, obj.get("en", fallback))


def filter_items_by_language(items: list, lang: str) -> list:
    """Filter items that have content in the specified language"""
    return [
        item for item in items 
        if item.get("word", {}).get(lang) and item.get("meaning", {}).get(lang)
    ]


# ============ GAME GENERATORS ============

def generate_matching_game(topic: str, count: int = 6, lang: str = "en") -> GameConfig:
    """Generate a memory/matching pairs game"""
    topic_data = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    items = filter_items_by_language(topic_data["items"], lang)
    
    if len(items) < 2:
        raise HTTPException(status_code=404, detail=f"Not enough content for topic '{topic}' in language '{lang}'")
    
    selected = random.sample(items, min(count, len(items)))
    
    pairs = []
    for item in selected:
        word = get_localized(item["word"], lang)
        meaning = get_localized(item["meaning"], lang)
        
        pairs.append({
            "id": f"word_{word}",
            "content": word,
            "type": "word",
            "match_id": f"meaning_{word}"
        })
        pairs.append({
            "id": f"meaning_{word}",
            "content": f"{item['image']} {meaning}",
            "type": "meaning",
            "match_id": f"word_{word}"
        })
    
    random.shuffle(pairs)
    
    ui = GAME_UI_STRINGS["matching_pairs"]
    topic_title = get_localized(topic_data["title"], lang, topic)
    
    return GameConfig(
        game_id=f"matching_{topic}_{random.randint(1000,9999)}",
        game_type="matching_pairs",
        title=f"{get_localized(ui['title'], lang)}: {topic_title}",
        description=get_localized(ui["description"], lang),
        difficulty="easy",
        time_limit=120,
        questions=pairs
    )


def generate_spelling_bee(topic: str, count: int = 5, lang: str = "en") -> GameConfig:
    """Generate a spelling bee game"""
    topic_data = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    items = filter_items_by_language(topic_data["items"], lang)
    
    if len(items) < 2:
        raise HTTPException(status_code=404, detail=f"Not enough content for topic '{topic}' in language '{lang}'")
    
    selected = random.sample(items, min(count, len(items)))
    
    questions = []
    for item in selected:
        word = get_localized(item["word"], lang)
        meaning = get_localized(item["meaning"], lang)
        
        # Scramble the word
        letters = list(word)
        random.shuffle(letters)
        scrambled = "".join(letters)
        
        # Make sure it's actually scrambled
        attempts = 0
        while scrambled == word and len(word) > 2 and attempts < 10:
            random.shuffle(letters)
            scrambled = "".join(letters)
            attempts += 1
        
        questions.append({
            "id": f"spell_{word}",
            "scrambled": scrambled.upper(),
            "correct_answer": word,
            "hint": meaning,
            "image": item["image"],
            "example": get_localized(item.get("example", {}), lang, "")
        })
    
    ui = GAME_UI_STRINGS["spelling_bee"]
    topic_title = get_localized(topic_data["title"], lang, topic)
    
    return GameConfig(
        game_id=f"spelling_{topic}_{random.randint(1000,9999)}",
        game_type="spelling_bee",
        title=f"{get_localized(ui['title'], lang)}: {topic_title}",
        description=get_localized(ui["description"], lang),
        difficulty="medium",
        time_limit=180,
        questions=questions
    )


def generate_true_false(count: int = 8, lang: str = "en") -> GameConfig:
    """Generate a true/false quiz"""
    # Filter questions that have translation for the language
    available = [q for q in TRUE_FALSE_QUESTIONS if q["statement"].get(lang)]
    
    if len(available) < 2:
        raise HTTPException(status_code=404, detail=f"Not enough true/false content in language '{lang}'")
    
    selected = random.sample(available, min(count, len(available)))
    
    questions = []
    for idx, q in enumerate(selected):
        questions.append({
            "id": f"tf_{idx}",
            "statement": get_localized(q["statement"], lang),
            "correct_answer": q["answer"],
            "topic": q["topic"]
        })
    
    ui = GAME_UI_STRINGS["true_false"]
    
    return GameConfig(
        game_id=f"truefalse_{random.randint(1000,9999)}",
        game_type="true_false",
        title=get_localized(ui["title"], lang),
        description=get_localized(ui["description"], lang),
        difficulty="easy",
        time_limit=90,
        questions=questions
    )


def generate_word_race(topic: str, count: int = 8, lang: str = "en") -> GameConfig:
    """Generate a word race (multiple choice) game"""
    topic_data = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    items = filter_items_by_language(topic_data["items"], lang)
    
    if len(items) < 4:
        raise HTTPException(status_code=404, detail=f"Not enough content for topic '{topic}' in language '{lang}'")
    
    selected = random.sample(items, min(count, len(items)))
    all_meanings = [get_localized(item["meaning"], lang) for item in items]
    
    questions = []
    for item in selected:
        word = get_localized(item["word"], lang)
        correct = get_localized(item["meaning"], lang)
        
        # Get wrong options
        wrong = [m for m in all_meanings if m != correct]
        wrong_options = random.sample(wrong, min(3, len(wrong)))
        
        options = [correct] + wrong_options
        random.shuffle(options)
        
        questions.append({
            "id": f"race_{word}",
            "word": word,
            "image": item["image"],
            "options": options,
            "correct_answer": correct
        })
    
    ui = GAME_UI_STRINGS["word_race"]
    topic_title = get_localized(topic_data["title"], lang, topic)
    
    return GameConfig(
        game_id=f"race_{topic}_{random.randint(1000,9999)}",
        game_type="word_race",
        title=f"{get_localized(ui['title'], lang)}: {topic_title}",
        description=get_localized(ui["description"], lang),
        difficulty="medium",
        time_limit=60,
        questions=questions
    )


def generate_lucky_wheel(topics: List[str] = None, lang: str = "en") -> GameConfig:
    """Generate a lucky wheel game with random topics"""
    if not topics:
        topics = list(VOCABULARY_DATA.keys())
    
    questions = []
    points_options = [10, 20, 30, 40, 50]
    
    for topic in topics:
        topic_data = VOCABULARY_DATA.get(topic)
        if not topic_data:
            continue
            
        items = filter_items_by_language(topic_data["items"], lang)
        if not items:
            continue
            
        item = random.choice(items)
        word = get_localized(item["word"], lang)
        meaning = get_localized(item["meaning"], lang)
        
        questions.append({
            "id": f"wheel_{topic}_{word}",
            "topic": get_localized(topic_data["title"], lang, topic),
            "word": word,
            "meaning": meaning,
            "image": item["image"],
            "points": random.choice(points_options)
        })
    
    if not questions:
        raise HTTPException(status_code=404, detail=f"No content available in language '{lang}'")
    
    random.shuffle(questions)
    
    ui = GAME_UI_STRINGS["lucky_wheel"]
    
    return GameConfig(
        game_id=f"wheel_{random.randint(1000,9999)}",
        game_type="lucky_wheel",
        title=get_localized(ui["title"], lang),
        description=get_localized(ui["description"], lang),
        difficulty="medium",
        time_limit=None,
        questions=questions[:12]
    )


def generate_fishing_game(topic: str, count: int = 8, lang: str = "en") -> GameConfig:
    """Generate a fishing game"""
    topic_data = VOCABULARY_DATA.get(topic, VOCABULARY_DATA["family"])
    items = filter_items_by_language(topic_data["items"], lang)
    
    if len(items) < 4:
        raise HTTPException(status_code=404, detail=f"Not enough content for topic '{topic}' in language '{lang}'")
    
    selected = random.sample(items, min(count, len(items)))
    all_words = [get_localized(item["word"], lang) for item in items]
    
    questions = []
    fish_colors = ["🐟", "🐠", "🐡", "🦈", "🐳", "🐋", "🦑", "🐙"]
    
    for idx, item in enumerate(selected):
        word = get_localized(item["word"], lang)
        meaning = get_localized(item["meaning"], lang)
        
        # Get wrong options
        wrong = [w for w in all_words if w != word]
        wrong_options = random.sample(wrong, min(3, len(wrong)))
        
        fish = [
            {"word": word, "fish": fish_colors[idx % len(fish_colors)], "correct": True}
        ]
        for w in wrong_options:
            fish.append({"word": w, "fish": random.choice(fish_colors), "correct": False})
        
        random.shuffle(fish)
        
        questions.append({
            "id": f"fish_{idx}",
            "clue": meaning,
            "image": item["image"],
            "fish": fish,
            "correct_answer": word
        })
    
    ui = GAME_UI_STRINGS["fishing"]
    topic_title = get_localized(topic_data["title"], lang, topic)
    
    return GameConfig(
        game_id=f"fish_{topic}_{random.randint(1000,9999)}",
        game_type="fishing",
        title=f"{get_localized(ui['title'], lang)}: {topic_title}",
        description=get_localized(ui["description"], lang),
        difficulty="easy",
        time_limit=120,
        questions=questions
    )


# ============ API ENDPOINTS ============

@router.get("/list")
async def list_available_games(
    lang: str = "en",
    x_system_language: Optional[str] = Header(None, alias="X-System-Language")
):
    """List all available game types and topics"""
    # Use header if provided, otherwise query param
    system_lang = x_system_language or lang
    if system_lang not in ["en", "vi", "tr"]:
        system_lang = "en"
    
    games = []
    for game_type, ui in GAME_UI_STRINGS.items():
        games.append({
            "type": game_type,
            "title": get_localized(ui["title"], system_lang),
            "description": get_localized(ui["description"], system_lang),
            "icon": {"matching_pairs": "🎴", "spelling_bee": "🐝", "true_false": "✅", 
                     "word_race": "🏃", "lucky_wheel": "🎡", "fishing": "🎣"}[game_type],
            "color": {"matching_pairs": "from-pink-500 to-rose-500", "spelling_bee": "from-amber-500 to-yellow-500",
                      "true_false": "from-green-500 to-emerald-500", "word_race": "from-blue-500 to-indigo-500",
                      "lucky_wheel": "from-purple-500 to-violet-500", "fishing": "from-cyan-500 to-teal-500"}[game_type]
        })
    
    # Filter topics that have content in current language
    available_topics = []
    for topic_id, topic_data in VOCABULARY_DATA.items():
        items = filter_items_by_language(topic_data["items"], system_lang)
        if items:
            available_topics.append({
                "id": topic_id,
                "title": get_localized(topic_data["title"], system_lang, topic_id),
                "item_count": len(items)
            })
    
    return {
        "games": games,
        "topics": available_topics,
        "language": system_lang
    }


@router.get("/play/{game_type}")
async def get_game(
    game_type: str,
    topic: str = "family",
    count: int = 6,
    lang: str = "en",
    x_system_language: Optional[str] = Header(None, alias="X-System-Language")
):
    """Generate and return a specific game"""
    # Use header if provided, otherwise query param
    system_lang = x_system_language or lang
    if system_lang not in ["en", "vi", "tr"]:
        system_lang = "en"
    
    generators = {
        "matching_pairs": lambda: generate_matching_game(topic, count, system_lang),
        "spelling_bee": lambda: generate_spelling_bee(topic, count, system_lang),
        "true_false": lambda: generate_true_false(count, system_lang),
        "word_race": lambda: generate_word_race(topic, count, system_lang),
        "lucky_wheel": lambda: generate_lucky_wheel(lang=system_lang),
        "fishing": lambda: generate_fishing_game(topic, count, system_lang)
    }
    
    if game_type not in generators:
        raise HTTPException(status_code=400, detail=f"Unknown game type: {game_type}")
    
    game = generators[game_type]()
    
    return {
        "success": True,
        "game": game.dict(),
        "language": system_lang
    }


@router.post("/submit/{game_id}")
async def submit_game_score(
    game_id: str,
    score: int,
    total: int,
    time_taken: Optional[int] = None,
    lang: str = "en",
    x_system_language: Optional[str] = Header(None, alias="X-System-Language")
):
    """Submit game score and get results"""
    system_lang = x_system_language or lang
    if system_lang not in ["en", "vi", "tr"]:
        system_lang = "en"
    
    percentage = (score / total * 100) if total > 0 else 0
    
    # Determine stars
    if percentage >= 90:
        stars = 3
    elif percentage >= 70:
        stars = 2
    elif percentage >= 50:
        stars = 1
    else:
        stars = 0
    
    # Multi-language messages
    messages = {
        3: {"en": "Perfect! Amazing job!", "vi": "Hoàn hảo! Tuyệt vời!", "tr": "Mükemmel! Harika iş!"},
        2: {"en": "Great work! Keep it up!", "vi": "Tốt lắm! Tiếp tục nhé!", "tr": "Harika! Devam et!"},
        1: {"en": "Good try! Practice more!", "vi": "Cố gắng tốt! Luyện tập thêm!", "tr": "İyi deneme! Daha çok çalış!"},
        0: {"en": "Keep learning!", "vi": "Tiếp tục học nhé!", "tr": "Öğrenmeye devam et!"}
    }
    
    return {
        "success": True,
        "game_id": game_id,
        "score": score,
        "total": total,
        "percentage": round(percentage, 1),
        "stars": stars,
        "message": messages[stars].get(system_lang, messages[stars]["en"]),
        "time_taken": time_taken,
        "language": system_lang
    }


print("✅ Multi-Language Game Bank routes loaded")
