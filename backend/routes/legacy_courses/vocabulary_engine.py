"""
Vocabulary Engine endpoints
===========================
Single job: vocabulary slides/practice/quiz generation from course modules
(advanced → mastery → beginner fallback) + progress + sentence evaluation.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import logging
import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from pydantic import BaseModel

import auth_session
from services.llm_compat import LlmChat, UserMessage

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


@router.get("/vocabulary-engine/{module_id}/slides")
async def get_vocabulary_slides(module_id: str):
    """Get vocabulary data formatted as slides for Learn Mode"""
    module = await db.advanced_mastery_modules.find_one({"id": module_id}, {"_id": 0})
    source = "advanced"
    if not module:
        module = await db.mastery_course_modules.find_one({"id": module_id}, {"_id": 0})
        source = "mastery"
    if not module:
        module = await db.beginner_english_lessons.find_one({"id": module_id}, {"_id": 0})
        source = "beginner"
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    vocab = module.get("vocabulary", {})
    pronunciation_map = {}
    if isinstance(vocab, dict):
        for p in vocab.get("pronunciation_guide", []):
            pronunciation_map[p["word"].lower()] = p
    
    slides = []
    
    if source == "beginner":
        # Beginner course: simple [{word, meaning, example}] list
        vocab_list = vocab if isinstance(vocab, list) else []
        for i, item in enumerate(vocab_list):
            slides.append({
                "id": f"word-{i}",
                "category": "Vocabulary",
                "word": item.get("word", ""),
                "meaning": item.get("meaning", ""),
                "example": item.get("example", ""),
                "usage": "",
                "collocations": [],
                "ipa": "", "stress": "", "audio_tip": "", "common_mistake": "",
            })
        # Also add common_mistake if available
        cm = module.get("common_mistake", {})
        if isinstance(cm, dict) and cm.get("incorrect"):
            slides.append({
                "id": f"mistake-{len(slides)}",
                "category": "Common Mistake",
                "word": f"{cm.get('incorrect', '')} vs {cm.get('correct', '')}",
                "meaning": cm.get("tip", ""),
                "example": f"Correct: {cm.get('correct', '')}",
                "usage": "", "collocations": [], "ipa": "", "stress": "", "audio_tip": "", "common_mistake": cm.get("incorrect", ""),
            })
    elif source == "mastery":
        # Mastery course: nouns, verbs, adjectives, adverbs
        for category in ["nouns", "verbs", "adjectives", "adverbs"]:
            for item in vocab.get(category, []):
                slides.append({
                    "id": f"{category}-{len(slides)}",
                    "category": category.title().rstrip("s"),
                    "word": item.get("word", ""),
                    "meaning": item.get("meaning", ""),
                    "example": item.get("example", ""),
                    "usage": "",
                    "collocations": [],
                    "ipa": "", "stress": "", "audio_tip": "", "common_mistake": "",
                })
        # Mastery collocations
        for item in module.get("collocations", []):
            if isinstance(item, dict):
                slides.append({
                    "id": f"colloc-{len(slides)}",
                    "category": "Collocation",
                    "word": item.get("collocation", item.get("phrase", "")),
                    "meaning": item.get("meaning", ""),
                    "example": item.get("example", ""),
                    "usage": "", "collocations": [], "ipa": "", "stress": "", "audio_tip": "", "common_mistake": "",
                })
        # Mastery idiom
        idiom = module.get("idiom", {})
        if isinstance(idiom, dict) and idiom.get("phrase"):
            slides.append({
                "id": f"idiom-{len(slides)}",
                "category": "Idiom",
                "word": idiom.get("phrase", ""),
                "meaning": idiom.get("meaning", ""),
                "example": idiom.get("example", ""),
                "usage": "", "collocations": [], "ipa": "", "stress": "", "audio_tip": "", "common_mistake": "",
            })
    else:
        # Advanced mastery: advanced_terms, idioms, collocations, phrasal_verbs
        for item in vocab.get("advanced_terms", []):
            pron = pronunciation_map.get(item["term"].lower(), {})
            slides.append({
                "id": f"term-{len(slides)}",
                "category": "Advanced Term",
                "word": item["term"],
                "meaning": item["meaning"],
                "example": item["example"],
                "usage": item.get("usage", ""),
                "collocations": item.get("collocations", []),
                "ipa": pron.get("ipa", ""),
                "stress": pron.get("stress", ""),
                "audio_tip": pron.get("audio_tip", ""),
                "common_mistake": pron.get("common_mistake", ""),
            })
    
        # Idioms
        for item in vocab.get("idioms", []):
            slides.append({
                "id": f"idiom-{len(slides)}",
                "category": "Idiom",
                "word": item["idiom"],
                "meaning": item["meaning"],
                "example": item["example"],
                "usage": item.get("usage_context", ""),
                "collocations": [],
                "ipa": "",
                "stress": "",
                "audio_tip": "",
                "common_mistake": "",
            })
    
        # Collocations
        for item in vocab.get("collocations", []):
            slides.append({
                "id": f"colloc-{len(slides)}",
                "category": f"Collocation ({item.get('type', '')})",
                "word": item["collocation"],
                "meaning": "",
                "example": item["example"],
                "usage": "",
                "collocations": item.get("alternatives", []),
                "ipa": "",
                "stress": "",
                "audio_tip": "",
                "common_mistake": "",
            })
    
        # Phrasal verbs
        for item in vocab.get("phrasal_verbs", []):
            slides.append({
                "id": f"phrasal-{len(slides)}",
                "category": "Phrasal Verb",
                "word": item["phrasal_verb"],
                "meaning": item["meaning"],
                "example": item["example"],
                "usage": f"Formal alternative: {item.get('formal_alternative', '')}",
                "collocations": [],
                "ipa": "",
                "stress": "",
                "audio_tip": "",
                "common_mistake": "",
            })
    
    # Word formation data (only for dict-based vocab, not beginner lists)
    word_formations = []
    if isinstance(vocab, dict):
        for item in vocab.get("word_formation", []):
            word_formations.append({
                "root": item.get("root", ""),
                "noun": item.get("noun", ""),
                "verb": item.get("verb", ""),
                "adjective": item.get("adjective", ""),
                "adverb": item.get("adverb", ""),
            })
    
    return {
        "module_id": module_id,
        "module_title": module.get("title", ""),
        "module_number": module.get("module_number", module.get("lesson_number", 0)),
        "slides": slides,
        "word_formations": word_formations,
        "total_slides": len(slides),
    }


@router.get("/vocabulary-engine/{module_id}/practice")
async def get_vocabulary_practice(module_id: str):
    """Get practice exercises generated from vocabulary data"""
    import random
    
    module = await db.advanced_mastery_modules.find_one({"id": module_id}, {"_id": 0})
    source = "advanced"
    if not module:
        module = await db.mastery_course_modules.find_one({"id": module_id}, {"_id": 0})
        source = "mastery"
    if not module:
        module = await db.beginner_english_lessons.find_one({"id": module_id}, {"_id": 0})
        source = "beginner"
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    vocab = module.get("vocabulary", {})
    exercises = []
    
    if source == "beginner":
        import re
        # Beginner: simple [{word, meaning, example}] list
        vocab_list = vocab if isinstance(vocab, list) else []
        all_words = [{"word": item.get("word", ""), "meaning": item.get("meaning", ""), "example": item.get("example", ""), "category": "vocabulary"} for item in vocab_list]
        
        # Fill-in-the-blank
        for i, item in enumerate(all_words):
            word = item.get("word", "")
            sentence = item.get("example", "")
            if not word or not sentence:
                continue
            blanked = re.sub(re.escape(word), "______", sentence, flags=re.IGNORECASE, count=1)
            if blanked != sentence:
                other_words = [w["word"] for w in all_words if w["word"].lower() != word.lower()]
                distractors = (other_words + ["something", "nothing"])[:3]
                options = [word] + distractors
                random.shuffle(options)
                exercises.append({
                    "id": f"fib-{len(exercises)}",
                    "type": "fill_blank",
                    "instruction": "Fill in the blank with the correct word:",
                    "sentence": blanked,
                    "answer": word,
                    "options": options,
                    "hint": item.get("meaning", ""),
                })
        
        # Meaning matching
        for i, item in enumerate(all_words):
            word = item.get("word", "")
            meaning = item.get("meaning", "")
            if not word or not meaning:
                continue
            other_meanings = [w["meaning"] for w in all_words if w["word"].lower() != word.lower() and w["meaning"]]
            distractors = (other_meanings + ["Not related"])[:3]
            options = [meaning] + distractors
            random.shuffle(options)
            exercises.append({
                "id": f"mm-{len(exercises)}",
                "type": "meaning_match",
                "instruction": "Choose the correct meaning:",
                "word": word,
                "answer": meaning,
                "options": options,
                "hint": "",
            })
        
        random.shuffle(exercises)
        return {
            "module_id": module_id,
            "module_title": module.get("title", ""),
            "exercises": exercises,
            "total_exercises": len(exercises),
        }
    elif source == "mastery":
        import re
        # Mastery: generate exercises from nouns, verbs, adjectives, adverbs
        all_words = []
        for cat in ["nouns", "verbs", "adjectives", "adverbs"]:
            for item in vocab.get(cat, []):
                all_words.append({**item, "category": cat})
        
        # 1. Fill-in-the-blank
        for item in all_words:
            word = item.get("word", "")
            sentence = item.get("example", "")
            if not word or not sentence:
                continue
            blanked = re.sub(re.escape(word), "______", sentence, flags=re.IGNORECASE, count=1)
            if blanked != sentence:
                other_words = [w["word"] for w in all_words if w["word"] != word]
                distractors = random.sample(other_words, min(3, len(other_words)))
                options = [word] + distractors
                random.shuffle(options)
                exercises.append({
                    "id": f"fib-{len(exercises)}",
                    "type": "fill_blank",
                    "instruction": "Fill in the blank with the correct word:",
                    "sentence": blanked,
                    "answer": word,
                    "options": options,
                    "hint": item.get("meaning", ""),
                })
        
        # 2. Matching - words to meanings
        if len(all_words) >= 4:
            match_items = random.sample(all_words, min(5, len(all_words)))
            terms_list = [{"id": f"m-{i}", "text": item["word"]} for i, item in enumerate(match_items)]
            defs_list = [{"id": f"m-{i}", "text": item["meaning"]} for i, item in enumerate(match_items)]
            shuffled_defs = defs_list.copy()
            random.shuffle(shuffled_defs)
            exercises.append({
                "id": f"match-{len(exercises)}",
                "type": "matching",
                "instruction": "Match each word with its correct meaning:",
                "terms": terms_list,
                "definitions": shuffled_defs,
                "answers": {t["id"]: t["id"] for t in terms_list},
            })
        
        # 3. Collocation exercises
        collocations = module.get("collocations", [])
        if isinstance(collocations, list):
            for item in collocations:
                if not isinstance(item, dict):
                    continue
                col = item.get("collocation", item.get("phrase", ""))
                example = item.get("example", "")
                if col and example:
                    blanked = re.sub(re.escape(col), "______", example, flags=re.IGNORECASE, count=1)
                    if blanked != example:
                        other_cols = [c.get("collocation", c.get("phrase", "")) for c in collocations if c.get("collocation", c.get("phrase", "")) != col]
                        distractors = random.sample(other_cols, min(3, len(other_cols))) if other_cols else []
                        options = [col] + distractors
                        random.shuffle(options)
                        exercises.append({
                            "id": f"fib-col-{len(exercises)}",
                            "type": "fill_blank",
                            "instruction": "Complete with the correct collocation:",
                            "sentence": blanked,
                            "answer": col,
                            "options": options,
                            "hint": item.get("meaning", ""),
                        })
        
        random.shuffle(exercises)
        return {
            "module_id": module_id,
            "module_title": module.get("title", ""),
            "exercises": exercises,
            "total_exercises": len(exercises),
        }
    # Advanced mastery original logic below
    
    # 1. Fill-in-the-blank from advanced terms
    terms = vocab.get("advanced_terms", [])
    for item in terms:
        word = item["term"]
        sentence = item["example"]
        # Create blank by replacing the word (case-insensitive)
        import re
        blanked = re.sub(re.escape(word), "______", sentence, flags=re.IGNORECASE, count=1)
        if blanked != sentence:
            # Generate distractors from other terms
            other_terms = [t["term"] for t in terms if t["term"] != word]
            distractors = random.sample(other_terms, min(3, len(other_terms)))
            options = [word] + distractors
            random.shuffle(options)
            exercises.append({
                "id": f"fib-term-{len(exercises)}",
                "type": "fill_blank",
                "instruction": "Fill in the blank with the correct word:",
                "sentence": blanked,
                "answer": word,
                "options": options,
                "hint": item["meaning"][:80] + "..." if len(item["meaning"]) > 80 else item["meaning"],
            })
    
    # 2. Matching - idioms to meanings
    idioms = vocab.get("idioms", [])
    if len(idioms) >= 4:
        match_items = random.sample(idioms, min(5, len(idioms)))
        terms_list = [{"id": f"m-{i}", "text": item["idiom"]} for i, item in enumerate(match_items)]
        defs_list = [{"id": f"m-{i}", "text": item["meaning"]} for i, item in enumerate(match_items)]
        shuffled_defs = defs_list.copy()
        random.shuffle(shuffled_defs)
        exercises.append({
            "id": f"match-idioms-{len(exercises)}",
            "type": "matching",
            "instruction": "Match each idiom with its correct meaning:",
            "terms": terms_list,
            "definitions": shuffled_defs,
            "answers": {t["id"]: t["id"] for t in terms_list},
        })
    
    # 3. Fill-in-the-blank from collocations
    collocations = vocab.get("collocations", [])
    for item in collocations:
        col = item["collocation"]
        parts = col.split()
        if len(parts) >= 2:
            blank_word = parts[-1]
            blanked_col = " ".join(parts[:-1]) + " ______"
            other_options = [c["collocation"].split()[-1] for c in collocations if c["collocation"] != col]
            other_options = list(set(other_options))
            distractors = random.sample(other_options, min(3, len(other_options)))
            options = [blank_word] + distractors
            random.shuffle(options)
            exercises.append({
                "id": f"fib-col-{len(exercises)}",
                "type": "fill_blank",
                "instruction": "Complete the collocation:",
                "sentence": f'{blanked_col} (Example: "{item["example"]}")',
                "answer": blank_word,
                "options": options,
                "hint": item.get("type", ""),
            })
    
    # 4. Fill-in-the-blank from phrasal verbs
    phrasal_verbs = vocab.get("phrasal_verbs", [])
    for item in phrasal_verbs:
        word = item["phrasal_verb"]
        sentence = item["example"]
        blanked = re.sub(re.escape(word), "______", sentence, flags=re.IGNORECASE, count=1)
        # Also try with different casing
        if blanked == sentence:
            for pv in [word.lower(), word.title(), word.capitalize()]:
                blanked = sentence.replace(pv, "______", 1)
                if blanked != sentence:
                    break
        if blanked != sentence:
            other_pvs = [p["phrasal_verb"] for p in phrasal_verbs if p["phrasal_verb"] != word]
            distractors = random.sample(other_pvs, min(3, len(other_pvs)))
            options = [word] + distractors
            random.shuffle(options)
            exercises.append({
                "id": f"fib-pv-{len(exercises)}",
                "type": "fill_blank",
                "instruction": "Fill in the blank with the correct phrasal verb:",
                "sentence": blanked,
                "answer": word,
                "options": options,
                "hint": item["meaning"],
            })
    
    # 5. Word formation exercise
    word_forms = vocab.get("word_formation", [])
    for item in word_forms:
        forms = ["noun", "verb", "adjective", "adverb"]
        available = [(f, item[f]) for f in forms if item.get(f)]
        if len(available) >= 2:
            target_form, target_word = random.choice(available)
            other_words = [item[f] for f, _ in available if f != target_form]
            other_all = [wf.get(target_form, "") for wf in word_forms if wf.get("root") != item["root"] and wf.get(target_form)]
            distractors = random.sample(other_all, min(3, len(other_all)))
            options = [target_word] + distractors
            random.shuffle(options)
            exercises.append({
                "id": f"wf-{len(exercises)}",
                "type": "fill_blank",
                "instruction": f'Choose the correct {target_form} form of "{item["root"]}":',
                "sentence": f"Root word: {item['root']} → {target_form}: ______",
                "answer": target_word,
                "options": options,
                "hint": f"Other forms: {', '.join(f'{f}={w}' for f, w in available if f != target_form)}",
            })
    
    random.shuffle(exercises)
    
    return {
        "module_id": module_id,
        "module_title": module.get("title", ""),
        "exercises": exercises,
        "total_exercises": len(exercises),
    }


@router.get("/vocabulary-engine/{module_id}/quiz")
async def get_vocabulary_quiz(module_id: str):
    """Get mastery quiz questions for a module"""
    module = await db.advanced_mastery_modules.find_one({"id": module_id}, {"_id": 0})
    source = "advanced"
    if not module:
        module = await db.mastery_course_modules.find_one({"id": module_id}, {"_id": 0})
        source = "mastery"
    if not module:
        module = await db.beginner_english_lessons.find_one({"id": module_id}, {"_id": 0})
        source = "beginner"
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    if source == "beginner":
        import random
        # Generate quiz from vocabulary for beginner
        vocab_list = module.get("vocabulary", [])
        if not isinstance(vocab_list, list):
            vocab_list = []
        questions = []
        for i, item in enumerate(vocab_list):
            word = item.get("word", "")
            meaning = item.get("meaning", "")
            example = item.get("example", "")
            if not word or not meaning:
                continue
            other_meanings = [w["meaning"] for w in vocab_list if w.get("word") != word and w.get("meaning")]
            distractors = (other_meanings + ["Not applicable", "Unknown meaning"])[:3]
            options = [meaning] + distractors
            random.shuffle(options)
            correct_idx = options.index(meaning)
            answer_label = chr(65 + correct_idx)  # 0->A, 1->B, 2->C, 3->D
            questions.append({
                "id": f"q-{i}",
                "question": f"What does '{word}' mean?",
                "options": options,
                "answer": answer_label,
                "correct_answer": correct_idx,
                "explanation": f"'{word}' means: {meaning}. Example: {example}",
            })
        return {
            "module_id": module_id,
            "module_title": module.get("title", ""),
            "questions": questions[:10],
            "total_questions": len(questions[:10]),
            "passing_score": 80,
            "reading_passage": "",
        }
    
    quiz = module.get("quiz", {})
    questions = quiz.get("questions", [])
    
    # Filter vocabulary-related questions and take up to 10
    vocab_questions = [q for q in questions if "vocabulary" in q.get("question", "").lower() or "collocation" in q.get("question", "").lower()]
    other_questions = [q for q in questions if q not in vocab_questions]
    
    # Ensure 10 questions: prioritize vocab, fill with others
    selected = vocab_questions[:10]
    if len(selected) < 10:
        remaining = 10 - len(selected)
        selected += other_questions[:remaining]
    
    # Add IDs to questions
    for i, q in enumerate(selected):
        q["id"] = f"q-{i}"
    
    # Get reading passage for TFNG questions
    reading_passage = module.get("reading", {}).get("text", "")
    
    return {
        "module_id": module_id,
        "module_title": module.get("title", ""),
        "questions": selected[:10],
        "total_questions": len(selected[:10]),
        "passing_score": 80,
        "reading_passage": reading_passage,
    }


class VocabQuizSubmission(BaseModel):
    module_id: str
    user_id: str
    answers: dict
    score: int
    total: int

@router.post("/vocabulary-engine/quiz/submit")
async def submit_vocabulary_quiz(submission: VocabQuizSubmission):
    """Submit vocabulary quiz results and auto-add wrong answers to review bank"""
    passed = (submission.score / submission.total * 100) >= 80 if submission.total > 0 else False
    
    await db.vocabulary_progress.update_one(
        {"user_id": submission.user_id, "module_id": submission.module_id},
        {"$set": {
            "quiz_score": submission.score,
            "quiz_total": submission.total,
            "quiz_passed": passed,
            "quiz_completed_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    
    # Auto-add wrong answers to review bank
    module = await db.advanced_mastery_modules.find_one({"id": submission.module_id}, {"_id": 0})
    if not module:
        module = await db.mastery_course_modules.find_one({"id": submission.module_id}, {"_id": 0})
    if module:
        questions = module.get("quiz", {}).get("questions", [])
        for i, q in enumerate(questions[:10]):
            qid = f"q-{i}"
            user_ans = submission.answers.get(qid)
            if user_ans and user_ans != q.get("answer"):
                # Extract keyword from question for review
                word = q.get("question", "")[:60]
                await db.review_bank.update_one(
                    {"user_id": submission.user_id, "word": word, "module_id": submission.module_id},
                    {"$set": {
                        "meaning": q.get("question", ""),
                        "category": "quiz_mistake",
                        "source": "quiz",
                        "mastery_status": "learning",
                        "last_seen": datetime.now(timezone.utc).isoformat(),
                    },
                    "$inc": {"mistake_count": 1},
                    "$setOnInsert": {
                        "review_count": 0,
                        "next_review": datetime.now(timezone.utc).isoformat(),
                        "created_at": datetime.now(timezone.utc).isoformat(),
                    }},
                    upsert=True,
                )
    
    return {
        "passed": passed,
        "score": submission.score,
        "total": submission.total,
        "percentage": round(submission.score / submission.total * 100) if submission.total > 0 else 0,
    }


class VocabProgressUpdate(BaseModel):
    user_id: str
    module_id: str
    section: str  # "learn", "practice", "quiz"
    completed: bool = True

@router.post("/vocabulary-engine/progress")
async def save_vocabulary_progress(progress: VocabProgressUpdate, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(progress.user_id, caller)
    """Save vocabulary engine progress"""
    await db.vocabulary_progress.update_one(
        {"user_id": progress.user_id, "module_id": progress.module_id},
        {"$set": {
            f"{progress.section}_completed": progress.completed,
            f"{progress.section}_completed_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    return {"success": True}


@router.get("/vocabulary-engine/progress/{user_id}")
async def get_vocabulary_progress(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get all vocabulary engine progress for a user"""
    progress = await db.vocabulary_progress.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(100)
    return {"progress": progress}



class ProductionModeRequest(BaseModel):
    word: str
    sentence: str
    word_meaning: str = ""
    module_title: str = ""

@router.post("/vocabulary-engine/evaluate-sentence")
async def evaluate_production_sentence(request: ProductionModeRequest, _caller: dict = Depends(auth_session.current_user)):
    """AI evaluates a user-written sentence using a target vocabulary word"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are a strict but encouraging IELTS vocabulary coach. Evaluate student sentences for grammar accuracy and correct vocabulary usage. Be concise."
        ).with_model("openai", "gpt-4o")

        prompt = f"""Evaluate this IELTS student's sentence. They must use the target word correctly.

Target Word: {request.word}
Word Meaning: {request.word_meaning}
Student's Sentence: "{request.sentence}"

Respond in this exact JSON format:
{{
  "grammar_correct": true/false,
  "word_usage_correct": true/false,
  "overall_score": 1-5,
  "feedback": "1-2 sentence feedback on grammar and usage",
  "improved_sentence": "A corrected/improved version if needed, or the same sentence if perfect",
  "tip": "One short tip for better IELTS writing"
}}

RULES:
- Score 5 = perfect grammar + natural word usage
- Score 1 = major grammar errors or word completely misused
- Be strict on grammar but encouraging in tone
- Return ONLY valid JSON, no markdown"""

        response = await chat.send_message(UserMessage(text=prompt))
        text = response if isinstance(response, str) else response.text
        text = text.strip()
        # Clean markdown wrapping
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

        import json as json_mod
        result = json_mod.loads(text)
        return result
    except Exception as e:
        logging.getLogger(__name__).error(f"Production mode evaluation error: {e}")
        return {
            "grammar_correct": False,
            "word_usage_correct": False,
            "overall_score": 3,
            "feedback": "Could not evaluate your sentence right now. Please try again.",
            "improved_sentence": request.sentence,
            "tip": "Keep practicing writing sentences with new vocabulary!"
        }


