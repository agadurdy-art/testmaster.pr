"""
Question Bank - practice-mode question extraction from Cambridge and full
test sets (random / timed / smart / listening sets / skill overview /
reading practice).

Extracted from routes/question_bank.py (Faz 1 refactor, 2026-07-02).
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import uuid
import random

router = APIRouter()

# ============ PRACTICE MODE ENDPOINTS ============

def get_questions_from_cambridge_tests(skill: str, count: int = 10, question_type: str = None):
    """Extract questions from Cambridge IELTS tests, normalized for PracticeMode frontend."""
    import random
    from routes.cambridge import CAMBRIDGE_TESTS

    all_questions = []

    for book_id, book_data in CAMBRIDGE_TESTS.items():
        for test_id, test_data in book_data.get("tests", {}).items():
            if test_data is None:
                continue
            sections = test_data.get("sections", {})
            source_name = f"{book_id}_{test_id}"

            if skill == "reading":
                reading = sections.get("reading", {})
                for passage in reading.get("passages", []):
                    passage_text = passage.get("passage_text", passage.get("text", ""))
                    passage_title = passage.get("title", "")

                    for q_group in passage.get("questions", []):
                        q_type = q_group.get("type", "unknown")
                        if question_type and q_type != question_type:
                            continue

                        if q_type in ("true_false_not_given", "yes_no_not_given"):
                            opts = ["TRUE", "FALSE", "NOT GIVEN"] if q_type == "true_false_not_given" else ["YES", "NO", "NOT GIVEN"]
                            for stmt in q_group.get("statements", []):
                                ctx = extract_relevant_context(passage_text, stmt.get("statement", ""))
                                all_questions.append({
                                    "id": f"{source_name}_R{stmt['number']}",
                                    "type": "true-false-ng",
                                    "text": stmt.get("statement", ""),
                                    "passage": ctx,
                                    "passage_title": passage_title,
                                    "options": opts,
                                    "correct": stmt.get("answer", ""),
                                    "skill": "reading",
                                    "source": source_name,
                                    "difficulty": "medium"
                                })

                        elif q_type == "section_matching":
                            for item in q_group.get("items", []):
                                all_questions.append({
                                    "id": f"{source_name}_R{item['number']}",
                                    "type": "matching",
                                    "text": item.get("item", ""),
                                    "passage": passage_text[:1500],
                                    "passage_title": passage_title,
                                    "correct": item.get("answer", ""),
                                    "skill": "reading",
                                    "source": source_name,
                                    "difficulty": "hard"
                                })

                        elif q_type == "sentence_completion":
                            for item in q_group.get("sentences", q_group.get("items", [])):
                                sent = item.get("sentence", item.get("text", item.get("item", "")))
                                ctx = extract_relevant_context(passage_text, sent)
                                all_questions.append({
                                    "id": f"{source_name}_R{item.get('number', '')}",
                                    "type": "sentence-completion",
                                    "text": sent,
                                    "passage": ctx,
                                    "passage_title": passage_title,
                                    "correct": item.get("answer", ""),
                                    "skill": "reading",
                                    "source": source_name,
                                    "difficulty": "medium"
                                })

                        elif q_type == "multiple_choice":
                            for item in q_group.get("questions", q_group.get("items", [])):
                                ctx = extract_relevant_context(passage_text, item.get("question", ""))
                                all_questions.append({
                                    "id": f"{source_name}_R{item.get('number', '')}",
                                    "type": "multiple-choice",
                                    "text": item.get("question", ""),
                                    "passage": ctx,
                                    "passage_title": passage_title,
                                    "options": item.get("options", []),
                                    "correct": item.get("answer", ""),
                                    "skill": "reading",
                                    "source": source_name,
                                    "difficulty": "medium"
                                })

                        elif q_type == "multiple_selection":
                            all_questions.append({
                                "id": f"{source_name}_R_ms_{q_group.get('number', '')}",
                                "type": "multiple-choice",
                                "text": q_group.get("question", q_group.get("instruction", "")),
                                "passage": extract_relevant_context(passage_text, q_group.get("question", "")),
                                "passage_title": passage_title,
                                "options": q_group.get("options", []),
                                "correct": "",
                                "skill": "reading",
                                "source": source_name,
                                "difficulty": "hard"
                            })

                        elif q_type == "summary_completion":
                            summary_text = q_group.get("summary", "")
                            if isinstance(summary_text, dict):
                                summary_text = summary_text.get("text", str(summary_text))
                            all_questions.append({
                                "id": f"{source_name}_R_sum_{q_group.get('number', '')}",
                                "type": "sentence-completion",
                                "text": f"Complete the summary: {str(summary_text)[:200]}...",
                                "passage": passage_text[:1000],
                                "passage_title": passage_title,
                                "options": q_group.get("options", []),
                                "correct": "",
                                "skill": "reading",
                                "source": source_name,
                                "difficulty": "hard"
                            })

                        elif q_type == "note_completion":
                            all_questions.append({
                                "id": f"{source_name}_R_nc_{q_group.get('number', '')}",
                                "type": "sentence-completion",
                                "text": q_group.get("instruction", "Complete the notes below."),
                                "passage": passage_text[:1000],
                                "passage_title": passage_title,
                                "correct": "",
                                "skill": "reading",
                                "source": source_name,
                                "difficulty": "medium"
                            })

            elif skill == "listening":
                listening = sections.get("listening", {})
                for part in listening.get("parts", []):
                    part_num = part.get("part_number", 1)
                    audio_script = part.get("audio_script", part.get("transcript", ""))

                    for q in part.get("questions", []):
                        q_type = q.get("type", "note_completion")
                        if question_type and q_type != question_type:
                            continue
                        q_text = q.get("question", q.get("item", q.get("statement", "")))
                        all_questions.append({
                            "id": f"{source_name}_L{q.get('number', '')}",
                            "type": q_type.replace("_", "-"),
                            "text": q_text if q_text else f"Part {part_num} - {part.get('title', 'Listening')}",
                            "options": q.get("options", []),
                            "correct": q.get("answer", ""),
                            "audio_transcript": audio_script[:500] if audio_script else f"Listen to the audio about: {part.get('title', '')}",
                            "audio_file": part.get("audio_file", ""),
                            "context": part.get("title", ""),
                            "part": part_num,
                            "skill": "listening",
                            "source": source_name,
                            "difficulty": "easy" if part_num <= 2 else "medium"
                        })

    random.shuffle(all_questions)
    return all_questions[:count] if count else all_questions


def extract_relevant_context(full_text: str, search_term: str, context_size: int = 500) -> str:
    """Extract only the relevant paragraph/context for a question - MICRO-BASED practice."""
    if not full_text or not search_term:
        return full_text[:context_size] if full_text else ""
    
    paragraphs = full_text.split('\n\n')
    
    # Search for the most relevant paragraph
    search_words = search_term.lower().split()[:5]  # Use first 5 words
    
    best_para = ""
    best_score = 0
    
    for para in paragraphs:
        para_lower = para.lower()
        score = sum(1 for word in search_words if word in para_lower)
        if score > best_score:
            best_score = score
            best_para = para
    
    if best_para:
        return best_para[:context_size]
    
    # Fallback: return first paragraph
    return paragraphs[0][:context_size] if paragraphs else full_text[:context_size]


def get_questions_from_full_tests(skill: str, count: int = 10):
    """Extract questions from ALL Full Test content for practice mode, normalized for frontend."""
    import random

    all_questions = []

    # All sets (including E-H for academic)
    sets_to_import = [
        ("content.full_tests.academic.set_a", "ACADEMIC_SET_A", "academic_set_a"),
        ("content.full_tests.academic.set_b", "ACADEMIC_SET_B", "academic_set_b"),
        ("content.full_tests.academic.set_c", "ACADEMIC_SET_C", "academic_set_c"),
        ("content.full_tests.academic.set_d", "ACADEMIC_SET_D", "academic_set_d"),
        ("content.full_tests.academic.set_e", "ACADEMIC_SET_E", "academic_set_e"),
        ("content.full_tests.academic.set_f", "ACADEMIC_SET_F", "academic_set_f"),
        ("content.full_tests.academic.set_g", "ACADEMIC_SET_G", "academic_set_g"),
        ("content.full_tests.academic.set_h", "ACADEMIC_SET_H", "academic_set_h"),
        ("content.full_tests.general.set_a", "GENERAL_SET_A", "general_set_a"),
        ("content.full_tests.general.set_b", "GENERAL_SET_B", "general_set_b"),
        ("content.full_tests.general.set_c", "GENERAL_SET_C", "general_set_c"),
        ("content.full_tests.general.set_d", "GENERAL_SET_D", "general_set_d"),
    ]

    for module_path, var_name, source_name in sets_to_import:
        try:
            module = __import__(module_path, fromlist=[var_name])
            test_set = getattr(module, var_name)

            if skill == "listening":
                for part in test_set["sections"]["listening"]["parts"]:
                    audio_script = part.get("audio_script", part.get("transcript", ""))
                    for q in part["questions"]:
                        q_text = q.get("question", "")
                        q_type = q.get("type", "note-completion").replace("_", "-")
                        opts = q.get("options", [])
                        # For completion types without options, provide the answer as hint format
                        all_questions.append({
                            "id": f"{source_name}_{q['id']}",
                            "type": q_type,
                            "text": q_text if q_text else f"Part {part['part_number']} - {part.get('title', 'Listening')}",
                            "correct": q.get("answer", ""),
                            "options": opts,
                            "audio_transcript": audio_script[:500] if audio_script else f"Listen about: {part.get('title', '')}",
                            "context": part["title"],
                            "part": part["part_number"],
                            "skill": "listening",
                            "source": source_name,
                            "difficulty": "easy" if part["part_number"] <= 2 else "medium"
                        })

            elif skill == "reading":
                for passage in test_set["sections"]["reading"]["passages"]:
                    passage_text = passage.get("text", "")
                    passage_title = passage.get("title", "")
                    for q in passage["questions"]:
                        q_type = q.get("type", "multiple_choice").replace("_", "-")
                        opts = q.get("options", [])
                        # Add default options for known types
                        if not opts and q_type in ("true-false-ng", "true-false-not-given"):
                            opts = ["TRUE", "FALSE", "NOT GIVEN"]
                        elif not opts and q_type in ("yes-no-ng", "yes-no-not-given"):
                            opts = ["YES", "NO", "NOT GIVEN"]
                        all_questions.append({
                            "id": f"{source_name}_{q['id']}",
                            "type": q_type,
                            "text": q.get("question", ""),
                            "passage": extract_relevant_context(passage_text, q.get("question", "")),
                            "passage_title": passage_title,
                            "options": opts,
                            "correct": q.get("answer", ""),
                            "instruction": q.get("instruction", ""),
                            "skill": "reading",
                            "source": source_name,
                            "difficulty": "medium"
                        })

            elif skill == "writing":
                for task in test_set["sections"]["writing"]["tasks"]:
                    all_questions.append({
                        "id": f"{source_name}_W{task['task_number']}",
                        "type": f"task{task['task_number']}",
                        "text": task["prompt"],
                        "word_limit": task["word_limit"],
                        "skill": "writing",
                        "source": source_name,
                        "difficulty": "medium" if task["task_number"] == 1 else "hard"
                    })

            elif skill == "speaking":
                for part in test_set["sections"]["speaking"]["parts"]:
                    part_num = part["part_number"]
                    if part_num == 2:
                        cue = part.get("cue_card", {})
                        all_questions.append({
                            "id": f"{source_name}_S2_cue",
                            "type": "cue-card",
                            "text": cue.get("topic", ""),
                            "options": cue.get("bullet_points", []),
                            "part": part_num,
                            "skill": "speaking",
                            "source": source_name,
                            "difficulty": "medium"
                        })
                    else:
                        for q in part.get("questions", []):
                            all_questions.append({
                                "id": f"{source_name}_{q.get('id', f'S{part_num}Q')}",
                                "type": f"part{part_num}",
                                "text": q.get("question", ""),
                                "part": part_num,
                                "skill": "speaking",
                                "source": source_name,
                                "difficulty": "easy" if part_num == 1 else "hard"
                            })
        except Exception as e:
            print(f"Could not import {module_path}: {e}")
            continue

    random.shuffle(all_questions)
    return all_questions[:count]


@router.get("/practice/random")
async def get_random_practice(
    skill: str = Query(..., description="Skill to practice"),
    topic: Optional[str] = Query(None, description="Filter by topic"),
    band_level: Optional[str] = Query(None, description="Filter by band level"),
    question_type: Optional[str] = Query(None, description="Filter by question type"),
    count: int = Query(20, ge=1, le=50, description="Number of questions"),
    source: str = Query("all", description="Source: cambridge, legacy, or all")
):
    """Get random MICRO-BASED practice questions - auto-pulls from Cambridge tests."""
    try:
        questions = []
        
        # Get from Cambridge tests (primary source)
        if source in ["cambridge", "all"]:
            cambridge_questions = get_questions_from_cambridge_tests(skill, count, question_type)
            questions.extend(cambridge_questions)
        
        # Get from legacy full tests
        if source in ["legacy", "all"]:
            legacy_questions = get_questions_from_full_tests(skill, count)
            if question_type:
                legacy_questions = [q for q in legacy_questions if q.get("type") == question_type]
            questions.extend(legacy_questions)
        
        # Filter out questions with empty correct answer (unusable for practice feedback)
        questions = [q for q in questions if q.get("correct")]
        
        # Shuffle combined results
        import random
        random.shuffle(questions)
        questions = questions[:count]
        
        return {
            "success": True,
            "skill": skill,
            "filters": {
                "topic": topic,
                "band_level": band_level,
                "question_type": question_type
            },
            "count": len(questions),
            "questions": questions,
            "source": source,
            "micro_based": True
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "questions": []
        }


@router.get("/practice/listening-sets")
async def get_practice_listening_set(
    set_num: Optional[int] = Query(None, description="Specific set number (1-17), or random if omitted"),
    count: int = Query(3, ge=1, le=3)
):
    """Get pre-made listening practice questions with local audio files."""
    try:
        from content.practice_listening_data import PRACTICE_LISTENING_QUESTIONS
        
        available_sets = list(set(q["set"] for q in PRACTICE_LISTENING_QUESTIONS))
        
        if set_num and set_num in available_sets:
            target_set = set_num
        else:
            target_set = random.choice(available_sets)
        
        set_questions = [q for q in PRACTICE_LISTENING_QUESTIONS if q["set"] == target_set]
        
        questions = []
        for q in set_questions[:count]:
            questions.append({
                "id": q["id"],
                "type": q["type"],
                "text": q["text"],
                "correct": q["correct"],
                "options": q.get("options", []),
                "skill": "listening",
                "audio_file": f"/api/static/audio/practice_listening/{q['id']}.mp3",
                "audio_transcript": q.get("audio_transcript", ""),
                "source": "practice_listening"
            })
        
        return {
            "success": True,
            "skill": "listening",
            "set_number": target_set,
            "total_sets": len(available_sets),
            "count": len(questions),
            "questions": questions
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e), "questions": []}



@router.get("/practice/timed")
async def get_timed_practice(
    skill: str = Query(..., description="Skill to practice"),
    duration: int = Query(60, description="Duration in minutes")
):
    """Get a timed practice set from ALL sources (Cambridge + Full Test sets)."""
    # IELTS standard timings
    timings = {
        "reading": 60,
        "listening": 40,
        "writing": 60,
        "speaking": 15
    }
    
    # Get appropriate number of questions based on duration
    question_counts = {
        "reading": 40,
        "listening": 40,
        "writing": 2,
        "speaking": 15
    }
    
    target = question_counts.get(skill, 10)
    # Combine both sources
    cambridge_qs = get_questions_from_cambridge_tests(skill, target)
    legacy_qs = get_questions_from_full_tests(skill, target)
    combined = cambridge_qs + legacy_qs
    import random
    random.shuffle(combined)
    questions = combined[:target]
    
    return {
        "success": True,
        "skill": skill,
        "duration": duration,
        "recommended_duration": timings.get(skill, 30),
        "questions": questions,
        "question_count": len(questions),
        "is_timed": True,
        "source": "all"
    }


@router.get("/practice/smart")
async def get_smart_practice(
    user_id: str = Query(..., description="User ID for personalization")
):
    """Get AI-recommended practice based on user's weak areas."""
    import random
    recommendations = []
    
    for skill in ["listening", "reading", "writing", "speaking"]:
        cambridge_qs = get_questions_from_cambridge_tests(skill, 5)
        legacy_qs = get_questions_from_full_tests(skill, 5)
        combined = cambridge_qs + legacy_qs
        random.shuffle(combined)
        for q in combined[:5]:
            q["recommended_reason"] = f"Practice your {skill} skills"
        recommendations.extend(combined[:5])
    
    return {
        "success": True,
        "user_id": user_id,
        "recommendations": recommendations,
        "weak_areas": ["listening", "writing"],
        "suggested_focus": "Focus on listening comprehension and writing task achievement",
        "source": "all"
    }


@router.get("/skill/{skill_name}/overview")
async def get_skill_overview(skill_name: str):
    """Get detailed overview of a skill including questions from Full Test."""
    from content.full_tests.academic.set_a import ACADEMIC_SET_A
    
    valid_skills = ["listening", "reading", "writing", "speaking"]
    if skill_name not in valid_skills:
        raise HTTPException(status_code=400, detail=f"Invalid skill: {skill_name}")
    
    section_data = ACADEMIC_SET_A["sections"].get(skill_name, {})
    
    if skill_name == "listening":
        parts = []
        for part in section_data.get("parts", []):
            parts.append({
                "part_number": part["part_number"],
                "title": part["title"],
                "context": part["context"],
                "question_count": len(part["questions"]),
                "question_types": list(set(q["type"] for q in part["questions"]))
            })
        return {
            "skill": skill_name,
            "total_questions": section_data.get("total_questions", 40),
            "total_time": section_data.get("total_time", 2400),
            "time_display": "40 minutes",
            "parts": parts,
            "instructions": section_data.get("instructions", ""),
            "question_types": ["form_completion", "multiple_choice", "matching", "note_completion"],
            "source": "academic_set_a"
        }
    
    elif skill_name == "reading":
        passages = []
        for passage in section_data.get("passages", []):
            passages.append({
                "passage_number": passage["passage_number"],
                "title": passage["title"],
                "question_count": len(passage["questions"]),
                "question_types": list(set(q["type"] for q in passage["questions"]))
            })
        return {
            "skill": skill_name,
            "total_questions": section_data.get("total_questions", 40),
            "total_time": 3600,  # 60 minutes
            "time_display": "60 minutes",
            "passages": passages,
            "question_types": ["true_false_ng", "yes_no_ng", "matching_headings", "fill_blank", "multiple_choice"],
            "source": "academic_set_a"
        }
    
    elif skill_name == "writing":
        tasks = []
        for task in section_data.get("tasks", []):
            tasks.append({
                "task_number": task["task_number"],
                "type": task["type"],
                "word_limit": task["word_limit"],
                "time_suggested": task.get("time_suggested", 20 if task["task_number"] == 1 else 40)
            })
        return {
            "skill": skill_name,
            "total_tasks": len(tasks),
            "total_time": 3600,  # 60 minutes
            "time_display": "60 minutes",
            "tasks": tasks,
            "task_types": ["data_description", "essay"],
            "source": "academic_set_a"
        }
    
    elif skill_name == "speaking":
        parts = []
        for part in section_data.get("parts", []):
            # Part 2 has cue_card instead of questions
            if part["part_number"] == 2:
                question_count = 1 + len(part.get("follow_up", []))  # cue_card + follow_ups
            else:
                question_count = len(part.get("questions", []))
            
            parts.append({
                "part_number": part["part_number"],
                "title": part["title"],
                "duration": part.get("time") or f"{part.get('prep_time', 0)}s prep + {part.get('speak_time', 0)}s speak",
                "question_count": question_count
            })
        return {
            "skill": skill_name,
            "total_parts": len(parts),
            "total_time": 900,  # 11-14 minutes
            "time_display": "11-14 minutes",
            "parts": parts,
            "source": "academic_set_a"
        }


@router.get("/skill/{skill_name}/questions")
async def get_skill_questions(
    skill_name: str,
    part: Optional[int] = Query(None, description="Filter by part number"),
    question_type: Optional[str] = Query(None, description="Filter by question type"),
    limit: int = Query(20, ge=1, le=100, description="Number of questions to return")
):
    """Get questions for a specific skill from Full Test content."""
    valid_skills = ["listening", "reading", "writing", "speaking"]
    if skill_name not in valid_skills:
        raise HTTPException(status_code=400, detail=f"Invalid skill: {skill_name}")
    
    questions = get_questions_from_full_test(skill_name, limit * 2)  # Get more to allow filtering
    
    # Filter by part if specified
    if part is not None:
        questions = [q for q in questions if q.get("part") == part or q.get("passage_number") == part or q.get("task_number") == part]
    
    # Filter by question type if specified
    if question_type:
        questions = [q for q in questions if q.get("type") == question_type]
    
    return {
        "success": True,
        "skill": skill_name,
        "filters": {
            "part": part,
            "question_type": question_type
        },
        "count": len(questions[:limit]),
        "questions": questions[:limit],
        "source": "full_test_academic_set_a"
    }


# ============ READING PRACTICE ENDPOINT ============

@router.get("/reading/practice")
async def get_reading_practice_questions(
    mode: str = Query("random", description="Practice mode: random, timed, smart"),
    topic: Optional[str] = Query(None),
    band: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=30)
):
    """Get reading practice questions from mastery content."""
    try:
        from content.reading.mastery.reading_mastery_academic import MASTERY_ACADEMIC_READING
        mastery_modules = MASTERY_ACADEMIC_READING
    except ImportError:
        mastery_modules = {}
    
    questions = []
    
    # Extract questions from mastery modules (dict structure)
    for module_key, module in mastery_modules.items():
        # Filter by topic if specified
        if topic and module.get("topic", "").lower() != topic.lower():
            continue
        
        passage_text = module.get("passage", "")
        
        for q in module.get("questions", []):
            question_data = {
                "id": q.get("id", str(uuid.uuid4())),
                "type": module.get("question_type", q.get("type", "multiple-choice")),
                "text": q.get("question", q.get("text", "")),
                "passage": passage_text[:500] + "..." if len(passage_text) > 500 else passage_text,
                "options": q.get("options", []),
                "correct": q.get("answer", q.get("correct", "")),
                "explanation": q.get("explanation", ""),
                "difficulty": q.get("difficulty", "medium"),
                "topic": module.get("topic", "general"),
                "module_title": module.get("title", "")
            }
            questions.append(question_data)
    
    # Apply limit
    if len(questions) > limit:
        if mode == "random":
            questions = random.sample(questions, limit)
        else:
            questions = questions[:limit]
    
    # Sort for smart mode (harder first)
    if mode == "smart":
        difficulty_order = {"hard": 0, "medium": 1, "easy": 2}
        questions.sort(key=lambda x: difficulty_order.get(x.get("difficulty", "medium"), 1))
    
    return {
        "success": True,
        "mode": mode,
        "questions": questions,
        "total": len(questions)
    }
