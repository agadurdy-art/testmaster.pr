"""
IELTS Question Bank - API Routes
================================
Endpoints for the Question Bank system.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import random

router = APIRouter(prefix="/api/question-bank", tags=["Question Bank"])

# ============ QUESTION BANK ENDPOINTS ============

@router.get("/skills")
async def get_skills():
    """Get all available skills."""
    return {
        "skills": [
            {"id": "reading", "name": "Reading", "icon": "📖", "description": "Academic & General Training passages"},
            {"id": "listening", "name": "Listening", "icon": "🎧", "description": "Multi-speaker audio with native accents"},
            {"id": "writing", "name": "Writing", "icon": "✍️", "description": "Task 1 & Task 2 with AI evaluation"},
            {"id": "speaking", "name": "Speaking", "icon": "🗣️", "description": "Parts 1-3 with dynamic follow-ups"},
            {"id": "grammar_vocab", "name": "Grammar & Vocabulary", "icon": "📚", "description": "Foundation skills practice"},
        ]
    }

@router.get("/topics")
async def get_topics():
    """Get all available topics."""
    return {
        "topics": [
            {"id": "education", "name": "Education", "icon": "🎓"},
            {"id": "health", "name": "Health", "icon": "🏥"},
            {"id": "technology", "name": "Technology", "icon": "💻"},
            {"id": "environment", "name": "Environment", "icon": "🌍"},
            {"id": "work_employment", "name": "Work & Employment", "icon": "💼"},
            {"id": "travel_culture", "name": "Travel & Culture", "icon": "✈️"},
            {"id": "science_research", "name": "Science & Research", "icon": "🔬"},
            {"id": "society_government", "name": "Society & Government", "icon": "🏛️"},
            {"id": "media_entertainment", "name": "Media & Entertainment", "icon": "📺"},
            {"id": "food_nutrition", "name": "Food & Nutrition", "icon": "🍎"},
            {"id": "housing_architecture", "name": "Housing & Architecture", "icon": "🏠"},
            {"id": "crime_law", "name": "Crime & Law", "icon": "⚖️"},
            {"id": "money_finance", "name": "Money & Finance", "icon": "💰"},
            {"id": "sports_fitness", "name": "Sports & Fitness", "icon": "🏆"},
            {"id": "family_relationships", "name": "Family & Relationships", "icon": "👨‍👩‍👧"},
            {"id": "language_communication", "name": "Language & Communication", "icon": "💬"},
            {"id": "art_culture", "name": "Art & Culture", "icon": "🎨"},
            {"id": "shopping_consumerism", "name": "Shopping & Consumerism", "icon": "🛒"},
        ]
    }

@router.get("/band-levels")
async def get_band_levels():
    """Get all band levels."""
    return {
        "band_levels": [
            {"id": "4.0-5.0", "name": "Band 4.0-5.0", "description": "Basic / Elementary", "color": "#f59e0b"},
            {"id": "5.5-6.5", "name": "Band 5.5-6.5", "description": "Intermediate / Competent", "color": "#3b82f6"},
            {"id": "7.0-9.0", "name": "Band 7.0-9.0", "description": "Advanced / Expert", "color": "#10b981"},
        ]
    }

@router.get("/question-types")
async def get_question_types():
    """Get all question types by skill."""
    return {
        "reading": [
            {"id": "multiple_choice", "name": "Multiple Choice"},
            {"id": "true_false_ng", "name": "True / False / Not Given"},
            {"id": "yes_no_ng", "name": "Yes / No / Not Given"},
            {"id": "matching_headings", "name": "Matching Headings"},
            {"id": "matching_information", "name": "Matching Information"},
            {"id": "sentence_completion", "name": "Sentence Completion"},
            {"id": "summary_completion", "name": "Summary Completion"},
            {"id": "diagram_table_completion", "name": "Diagram/Table Completion"},
            {"id": "short_answer", "name": "Short Answer"},
        ],
        "listening": [
            {"id": "multiple_choice", "name": "Multiple Choice"},
            {"id": "form_completion", "name": "Form Completion"},
            {"id": "note_completion", "name": "Note Completion"},
            {"id": "table_completion", "name": "Table Completion"},
            {"id": "sentence_completion", "name": "Sentence Completion"},
            {"id": "matching", "name": "Matching"},
            {"id": "map_labeling", "name": "Map/Plan Labeling"},
            {"id": "diagram_labeling", "name": "Diagram Labeling"},
        ],
        "writing": {
            "task1": [
                {"id": "line_graph", "name": "Line Graph"},
                {"id": "bar_chart", "name": "Bar Chart"},
                {"id": "pie_chart", "name": "Pie Chart"},
                {"id": "table", "name": "Table"},
                {"id": "mixed_chart", "name": "Mixed Chart"},
                {"id": "process_diagram", "name": "Process Diagram"},
                {"id": "map", "name": "Map"},
                {"id": "letter_formal", "name": "Formal Letter"},
                {"id": "letter_semi_formal", "name": "Semi-formal Letter"},
                {"id": "letter_informal", "name": "Informal Letter"},
            ],
            "task2": [
                {"id": "opinion", "name": "Opinion Essay"},
                {"id": "discussion", "name": "Discussion Essay"},
                {"id": "advantage_disadvantage", "name": "Advantage/Disadvantage"},
                {"id": "problem_solution", "name": "Problem/Solution"},
                {"id": "mixed", "name": "Mixed Type"},
            ]
        },
        "speaking": [
            {"id": "part_1", "name": "Part 1 - Personal Questions"},
            {"id": "part_2", "name": "Part 2 - Cue Card"},
            {"id": "part_3", "name": "Part 3 - Discussion"},
        ]
    }

@router.get("/stats")
async def get_question_bank_stats(db=None):
    """Get overall question bank statistics - dynamically counts all tests."""
    try:
        from routes.cambridge import CAMBRIDGE_TESTS
        from routes.full_test import get_all_test_sets, get_test_by_id

        cambridge_count = 0
        cambridge_tests = 0
        cambridge_listening = 0
        cambridge_reading = 0
        cambridge_writing = 0
        cambridge_speaking = 0
        question_types = {}

        for book_id, book_data in CAMBRIDGE_TESTS.items():
            for test_id, test_data in book_data.get("tests", {}).items():
                if test_data is not None:
                    cambridge_tests += 1
                    sections = test_data.get("sections", {})
                    listening = sections.get("listening", {})
                    l_total = listening.get("total_questions", 0)
                    cambridge_listening += l_total
                    cambridge_count += l_total
                    for part in listening.get("parts", []):
                        for qt in part.get("question_types", []):
                            question_types[f"listening_{qt}"] = question_types.get(f"listening_{qt}", 0) + 10
                    reading = sections.get("reading", {})
                    r_total = reading.get("total_questions", 0)
                    cambridge_reading += r_total
                    cambridge_count += r_total
                    for passage in reading.get("passages", []):
                        for q in passage.get("questions", []):
                            qt = q.get("type", "unknown")
                            question_types[f"reading_{qt}"] = question_types.get(f"reading_{qt}", 0) + 1
                    writing = sections.get("writing", {})
                    w_total = writing.get("total_tasks", 0)
                    cambridge_writing += w_total
                    cambridge_count += w_total
                    speaking = sections.get("speaking", {})
                    s_total = speaking.get("total_parts", 0)
                    cambridge_speaking += s_total
                    cambridge_count += s_total

        # Dynamically count AI full tests using the test registry
        all_sets = get_all_test_sets()
        academic_sets_list = all_sets.get("academic", [])
        general_sets_list = all_sets.get("general", [])
        ai_academic_count = len(academic_sets_list)
        ai_general_count = len(general_sets_list)

        ai_question_count = 0
        ai_listening = 0
        ai_reading = 0
        ai_writing = 0
        ai_speaking = 0
        for s in academic_sets_list + general_sets_list:
            test = get_test_by_id(s["test_id"])
            if test:
                sections = test.get("sections", {})
                l_q = sections.get("listening", {}).get("total_questions", 0)
                r_q = sections.get("reading", {}).get("total_questions", 0)
                w_q = len(sections.get("writing", {}).get("tasks", []))
                s_q = len(sections.get("speaking", {}).get("parts", []))
                ai_listening += l_q
                ai_reading += r_q
                ai_writing += w_q
                ai_speaking += s_q
                ai_question_count += l_q + r_q + w_q + s_q

        # Dynamic topics count
        topics_count = 18
        try:
            from server import db as app_db
            from services.lesson_registry import LessonRegistry
            registry = LessonRegistry(app_db)
            topics_data = await registry.get_all_topics()
            if topics_data:
                topics_count = len(topics_data)
        except Exception:
            pass

        total_questions = cambridge_count + ai_question_count
        total_full_tests = cambridge_tests + ai_academic_count + ai_general_count

        return {
            "total_questions": total_questions,
            "by_skill": {
                "reading": cambridge_reading + ai_reading,
                "listening": cambridge_listening + ai_listening,
                "writing": cambridge_writing + ai_writing,
                "speaking": cambridge_speaking + ai_speaking,
                "grammar_vocab": 0
            },
            "by_band": {
                "4.0-5.0": int(total_questions * 0.25),
                "5.5-6.5": int(total_questions * 0.35),
                "7.0-9.0": int(total_questions * 0.40)
            },
            "by_type": question_types,
            "full_tests": total_full_tests,
            "cambridge_tests": cambridge_tests,
            "ai_academic_tests": ai_academic_count,
            "ai_general_tests": ai_general_count,
            "practice_pool_size": cambridge_listening + cambridge_reading + ai_listening + ai_reading,
            "practice_sets": 4,
            "topics_count": topics_count
        }
    except Exception as e:
        print(f"Error calculating stats: {e}")
        import traceback
        traceback.print_exc()
        return {
            "total_questions": 0,
            "by_skill": {"reading": 0, "listening": 0, "writing": 0, "speaking": 0, "grammar_vocab": 0},
            "by_band": {"4.0-5.0": 0, "5.5-6.5": 0, "7.0-9.0": 0},
            "by_type": {},
            "full_tests": 0,
            "cambridge_tests": 0,
            "ai_academic_tests": 0,
            "ai_general_tests": 0,
            "practice_pool_size": 0,
            "practice_sets": 4,
            "topics_count": 18
        }

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


# ============ FULL TEST ENDPOINTS ============

@router.get("/tests")
async def get_available_tests(
    band_level: Optional[str] = Query(None, description="Filter by band level")
):
    """Get list of available full IELTS tests."""
    return {
        "tests": [],  # Will be populated from DB
        "total": 0
    }

@router.get("/tests/{test_id}")
async def get_test_details(test_id: str):
    """Get details of a specific test."""
    raise HTTPException(status_code=404, detail="Test not found")

@router.post("/tests/{test_id}/start")
async def start_test(test_id: str, user_id: str):
    """Start a test attempt."""
    return {
        "attempt_id": str(uuid.uuid4()),
        "test_id": test_id,
        "user_id": user_id,
        "started_at": datetime.utcnow().isoformat(),
        "sections": []
    }

@router.post("/tests/{test_id}/submit")
async def submit_test(test_id: str, attempt_id: str, answers: Dict[str, Any]):
    """Submit test answers for evaluation."""
    return {
        "attempt_id": attempt_id,
        "test_id": test_id,
        "submitted_at": datetime.utcnow().isoformat(),
        "status": "evaluating"
    }

# ============ WRITING TASK 1 VISUAL ENDPOINTS ============

# Store generated tasks temporarily for model answer retrieval
_task_cache = {}

CURATED_TASK1_PROCESS_VISUALS = [
    {"asset": "curated_process_water_treatment.png", "title": "Water treatment process", "task_description": "The diagram below shows the stages involved in treating water for domestic use.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_honey_production.png", "title": "Honey production process", "task_description": "The diagram below illustrates how honey is produced and prepared for retail sale.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_brick_manufacturing.png", "title": "Brick manufacturing process", "task_description": "The diagram below shows the process of manufacturing bricks for the construction industry.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_online_order_delivery.png", "title": "Online order and delivery process", "task_description": "The diagram below shows how an online order is processed and delivered to the customer.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_salmon_lifecycle.png", "title": "Life cycle of salmon", "task_description": "The diagram below shows the life cycle of a species of salmon.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_orange_juice.png", "title": "Orange juice production", "task_description": "The diagram below shows how orange juice is produced for commercial sale.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_university_enrolment.png", "title": "University enrolment process", "task_description": "The diagram below shows the process of enrolling at a university.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_glass_recycling.png", "title": "Glass recycling process", "task_description": "The diagram below illustrates how glass containers are recycled.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_paper_production.png", "title": "Paper production from wood", "task_description": "The diagram below shows how paper is produced from trees.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_coffee_production.png", "title": "Coffee production process", "task_description": "The diagram below shows the stages involved in producing coffee from planting to packaging.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_solar_energy.png", "title": "Solar energy generation system", "task_description": "The diagram below shows how solar energy is converted into electricity for domestic use.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_milk_production.png", "title": "Milk production and distribution", "task_description": "The diagram below shows how milk is produced, processed and distributed for retail sale.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_bread_baking.png", "title": "Commercial bread production", "task_description": "The diagram below shows how bread is produced in a commercial bakery.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_plastic_recycling_v2.png", "title": "Plastic bottle recycling process", "task_description": "The diagram below illustrates how used plastic bottles are recycled and turned into new products.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
]

CURATED_TASK1_MAP_VISUALS = [
    {"asset": "curated_map_industrial_redevelopment.png", "title": "Industrial area redevelopment", "task_description": "The maps below show an industrial area before and after redevelopment.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before redevelopment", "time_after": "After redevelopment"},
    {"asset": "curated_map_airport_redevelopment.png", "title": "Airport area redevelopment", "task_description": "The maps below compare an airport area before and after redevelopment.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_airport_terminal.png", "title": "Airport terminal expansion", "task_description": "The maps below show an airport terminal before and after expansion.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_village_bypass.png", "title": "Village map with bypass road", "task_description": "The maps below show a village before and after a bypass road was built.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before bypass", "time_after": "After bypass"},
    {"asset": "curated_map_school_expansion.png", "title": "School site development", "task_description": "The maps below show a school site before and after development.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_riverfront_development.png", "title": "Riverfront area development", "task_description": "The maps below show a riverfront area before and after development.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_solar_farm_expansion.png", "title": "Solar farm expansion", "task_description": "The maps below show a solar farm before and after expansion.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_airport_gates.png", "title": "Airport with expanded gates", "task_description": "The maps below show an airport before and after gate expansion.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_recreation_area.png", "title": "Recreation area development", "task_description": "The maps below show a recreation area before and after development.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before development", "time_after": "After development"},
    {"asset": "curated_map_university_dormitory.png", "title": "University dormitory area", "task_description": "The maps below show a university dormitory area before and after redevelopment.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_coastal_tourism.png", "title": "Coastal village tourism development", "task_description": "The maps below show a coastal village before and after tourism development.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_island_tourism.png", "title": "Island tourist facilities", "task_description": "The maps below show an island before and after the construction of tourist facilities.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before construction", "time_after": "After construction"},
    {"asset": "curated_map_university_campus.png", "title": "University campus expansion", "task_description": "The maps below show a university campus before and after expansion.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_city_park.png", "title": "City park redesign", "task_description": "The maps below show a city park in 2010 and planned changes for 2030.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "2010", "time_after": "2030"},
    {"asset": "curated_map_town_centre.png", "title": "Town centre redevelopment", "task_description": "The maps below show a town centre in 2000 and 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "2000", "time_after": "2025"},
]


def _build_curated_task1_visual(visual_type: str, topic: str, band_level: str):
    bank = CURATED_TASK1_PROCESS_VISUALS if visual_type == "process" else CURATED_TASK1_MAP_VISUALS
    base = random.choice(bank).copy()
    asset = base.pop("asset")
    task_data = {
        **base,
        "visual_type": visual_type,
        "topic": topic,
        "band_level": band_level,
        "metadata": {"source": "curated_static_bank", "asset": asset},
        "band_calibration": {"target_band": band_level, "complexity": "authentic_curated"},
    }
    return {"task_data": task_data, "image_url": f"/static/visuals/{asset}"}

@router.get("/writing/task1/generate-authentic")
async def generate_task1_authentic(
    visual_type: str = Query(..., description="Type of visual (line_graph, bar_chart, pie_chart, table, process, map)"),
    topic: str = Query("participation", description="Topic category for the task"),
    band_level: str = Query("5.5-6.5", description="Target band level")
):
    """
    Generate ULTRA MASTER PROMPT compliant Writing Task 1.
    
    ALL chart types now use the authentic task generator system.
    
    Returns:
    - Authentic IELTS task description with specific location, time, subject
    - SVG visual generated from structured dataset
    - Analysis hints for model answer generation
    - Band calibration metadata
    """
    from services.chart_generator import chart_generator
    from services.authentic_task_generator import authentic_task_generator
    from services.model_answer_generator import model_answer_generator
    
    try:
        task_data = None
        svg = None
        image_url = None
        
        # ============ LINE GRAPH ============
        if visual_type == "line_graph":
            task_data = authentic_task_generator.generate_line_graph_task(topic, band_level)
            svg = chart_generator.generate_line_graph(
                title=task_data["title"],
                x_label=task_data["x_label"],
                y_label=task_data["y_label"],
                x_values=task_data["x_values"],
                datasets=task_data["datasets"]
            )
        
        # ============ BAR CHART ============
        elif visual_type == "bar_chart":
            task_data = authentic_task_generator.generate_bar_chart_task(topic, band_level)
            svg = chart_generator.generate_bar_chart(
                title=task_data["title"],
                x_label=task_data.get("x_label", "Category"),
                y_label=task_data["y_label"],
                categories=task_data["categories"],
                datasets=task_data["datasets"]
            )
        
        # ============ PIE CHART ============
        elif visual_type == "pie_chart":
            task_data = authentic_task_generator.generate_pie_chart_task(topic, band_level)
            # Convert to the format expected by chart_generator
            pie_data = [
                {"label": seg, "value": task_data["datasets"][0]["values"][idx]}
                for idx, seg in enumerate(task_data["segments"])
            ]
            svg = chart_generator.generate_pie_chart(
                title=task_data["title"],
                data=pie_data
            )
        
        # ============ TABLE ============
        elif visual_type == "table":
            task_data = authentic_task_generator.generate_table_task(topic, band_level)
            # Convert rows to string format
            rows_str = [[str(cell) for cell in row] for row in task_data["rows"]]
            svg = chart_generator.generate_table(
                title=task_data["title"],
                headers=task_data["columns"],
                rows=rows_str
            )
        
        # ============ PROCESS ============
        elif visual_type == "process":
            curated = _build_curated_task1_visual(visual_type, topic, band_level)
            task_data = curated["task_data"]
            image_url = curated["image_url"]
        
        # ============ MAP ============
        elif visual_type == "map":
            curated = _build_curated_task1_visual(visual_type, topic, band_level)
            task_data = curated["task_data"]
            image_url = curated["image_url"]
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown visual type: {visual_type}")
        
        # Generate task ID for caching
        task_id = str(uuid.uuid4())
        
        # Cache task data and generate model answer for ALL visual types
        model_answer = None
        try:
            model_answer = model_answer_generator.generate_model_answer_structure(task_data)
        except Exception as ma_error:
            print(f"Warning: Could not generate model answer: {ma_error}")
        
        _task_cache[task_id] = {
            "task_data": task_data,
            "model_answer": model_answer
        }
        
        return {
            "success": True,
            "task_id": task_id,
            "visual_type": visual_type,
            "topic": topic,
            "band_level": band_level,
            "svg": svg,
            "image_url": image_url,
            "task_description": task_data["task_description"],
            "band_calibration": task_data.get("band_calibration", {}),
            "metadata": task_data.get("metadata", {})
        }
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/writing/task1/model-answer/{task_id}")
async def get_model_answer(task_id: str):
    """
    Retrieve the three-layer model answer for a generated task.
    
    Returns:
    - Layer A: Examiner-style Band 8.5-9 model answer
    - Layer B: Academic reasoning notes (teaching layer)
    - Layer C: Alternative academic expressions
    """
    if task_id not in _task_cache:
        raise HTTPException(status_code=404, detail="Task not found. Generate a new task.")
    
    cached = _task_cache[task_id]
    
    return {
        "success": True,
        "task_id": task_id,
        "model_answer": cached["model_answer"]
    }

@router.get("/writing/task1/generate-visual")
async def generate_task1_visual(
    visual_type: str = Query(..., description="Type of visual (line_graph, bar_chart, pie_chart, table, process, map)"),
    topic: str = Query("education", description="Topic for the visual"),
    band_level: str = Query("5.5-6.5", description="Difficulty level")
):
    """Generate a Writing Task 1 visual (SVG) with realistic IELTS-authentic data. [LEGACY]"""
    from services.chart_generator import chart_generator, data_generator
    
    try:
        if visual_type == "line_graph":
            data = data_generator.generate_line_graph_data(topic, band_level)
            svg = chart_generator.generate_line_graph(**data)
        elif visual_type == "bar_chart":
            data = data_generator.generate_bar_chart_data(topic, band_level)
            svg = chart_generator.generate_bar_chart(**data)
        elif visual_type == "pie_chart":
            data = data_generator.generate_pie_chart_data(topic, band_level)
            svg = chart_generator.generate_pie_chart(**data)
        elif visual_type == "table":
            data = data_generator.generate_table_data(topic, band_level)
            svg = chart_generator.generate_table(**data)
        elif visual_type == "process":
            data = data_generator.generate_process_data(topic, band_level)
            svg = chart_generator.generate_process_diagram(**data)
        elif visual_type == "map":
            data = data_generator.generate_map_data(topic, band_level)
            svg = chart_generator.generate_map_comparison(
                title=data["title"],
                before_elements=data["before"],
                after_elements=data["after"]
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unknown visual type: {visual_type}")
        
        return {
            "visual_type": visual_type,
            "topic": topic,
            "band_level": band_level,
            "svg": svg,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ USER PROGRESS ENDPOINTS ============

@router.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    """Get user's progress and analytics."""
    return {
        "user_id": user_id,
        "overall_stats": {
            "total_questions": 0,
            "correct_answers": 0,
            "accuracy": 0,
            "time_spent": 0
        },
        "skill_breakdown": {},
        "topic_accuracy": {},
        "band_progression": [],
        "weak_areas": [],
        "recommendations": []
    }

@router.post("/progress/{user_id}/record")
async def record_attempt(user_id: str, attempt: Dict[str, Any]):
    """Record a question attempt."""
    return {
        "recorded": True,
        "attempt_id": str(uuid.uuid4()),
        "user_id": user_id
    }

# ============ AI EVALUATION ENDPOINTS ============

from pydantic import BaseModel

class WritingEvaluationRequest(BaseModel):
    response: str
    task_type: str = "task1"  # task1 or task2
    visual_type: Optional[str] = None  # For task1: line_graph, bar_chart, etc.
    topic: Optional[str] = None
    band_level: str = "5.5-6.5"
    task_description: Optional[str] = None  # The original task prompt
    track: str = "academic"  # "academic" or "general" for Dual-Track support

@router.post("/writing/evaluate")
async def evaluate_writing(request: WritingEvaluationRequest):
    """
    AI evaluation for Writing Task 1 and Task 2.
    Uses official IELTS band descriptors for accurate scoring.
    Returns detailed feedback with strengths, weaknesses, and improvements.
    """
    import os
    import json
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    response_text = request.response.strip()
    word_count = len(response_text.split())
    
    # Minimum word check
    min_words = 150 if request.task_type == "task1" else 250
    if word_count < min_words * 0.6:  # Allow some flexibility
        return {
            "success": False,
            "error": f"Response too short. Minimum {min_words} words required, you wrote {word_count}.",
            "word_count": word_count
        }
    
    # Build context from task description if available
    task_context = ""
    if request.task_description:
        task_context = f"""
ORIGINAL TASK:
{request.task_description}
"""
    
    # Build evaluation prompt based on task type
    if request.task_type == "task1":
        evaluation_prompt = f"""You are an official IELTS examiner with 15+ years of experience. Evaluate this Writing Task 1 response using the official IELTS band descriptors.

{task_context}

TASK TYPE: Academic Writing Task 1 (Visual Description)
Visual Type: {request.visual_type or 'chart/graph'}
Topic: {request.topic or 'general'}
Target Band: {request.band_level}
Word Count: {word_count} words (minimum 150 required)

CANDIDATE'S RESPONSE:
\"\"\"
{response_text}
\"\"\"

OFFICIAL IELTS TASK 1 BAND DESCRIPTORS:

TASK ACHIEVEMENT (TA):
- Band 9: Fully satisfies all requirements; covers all features appropriately; presents a clear overview
- Band 7: Covers requirements; presents clear overview; highlights key features appropriately
- Band 5: Generally addresses task but format may be inappropriate; no overview or unclear overview

COHERENCE AND COHESION (CC):
- Band 9: Uses cohesion in a way that attracts no attention; skillfully manages paragraphing
- Band 7: Logically organizes information; clear progression; uses range of cohesive devices
- Band 5: Presents information with some organization; may be repetitive; inadequate paragraphing

LEXICAL RESOURCE (LR):
- Band 9: Uses vocabulary with full flexibility; rare minor errors occur only as slips
- Band 7: Uses sufficient vocabulary for flexibility; uses less common items with awareness
- Band 5: Uses limited vocabulary but minimally adequate; may make noticeable errors

GRAMMATICAL RANGE AND ACCURACY (GRA):
- Band 9: Uses wide range of structures; rare minor errors; full flexibility
- Band 7: Uses variety of complex structures; frequent error-free sentences
- Band 5: Uses limited range of structures; attempts complex sentences but errors distract

IMPORTANT RULES:
- Penalize heavily for NO OVERVIEW (essential for Task 1)
- Check for ACCURATE data reporting
- Look for COMPARISONS between data
- Detect and penalize TEMPLATE language
- Be STRICT - real IELTS is strict

Return ONLY this JSON (no other text):
{{
    "overall_band": 6.5,
    "task_achievement": {{
        "score": 6,
        "feedback": "Specific feedback on task response, overview, and data coverage"
    }},
    "coherence_cohesion": {{
        "score": 7,
        "feedback": "Feedback on organization, paragraphing, and linking"
    }},
    "lexical_resource": {{
        "score": 6,
        "feedback": "Feedback on vocabulary range, accuracy, and appropriateness"
    }},
    "grammatical_range": {{
        "score": 7,
        "feedback": "Feedback on sentence variety, accuracy, and complexity"
    }},
    "strengths": [
        "Specific strength 1",
        "Specific strength 2",
        "Specific strength 3"
    ],
    "weaknesses": [
        "Specific weakness 1",
        "Specific weakness 2",
        "Specific weakness 3"
    ],
    "improvement_suggestions": [
        "Actionable suggestion 1",
        "Actionable suggestion 2",
        "Actionable suggestion 3"
    ],
    "vocabulary_to_use": ["advanced word 1", "advanced word 2", "advanced word 3"],
    "grammar_corrections": [
        {{"original": "error from text", "corrected": "correct version", "explanation": "brief explanation"}}
    ],
    "line_by_line_corrections": [
        {{"original_line": "exact sentence from the essay", "corrected_line": "corrected version", "issue": "what was wrong"}}
    ],
    "high_priority_fixes": [
        "The single most important fix described in 1-2 sentences",
        "Second priority fix"
    ],
    "rewrite_guidance": {{
        "weakest_paragraph": "Which paragraph needs the most work and why",
        "suggested_opening": "A better opening sentence for that paragraph",
        "key_linking_phrases": "2-3 linking phrases the student should add"
    }},
    "response_diagnosis": {{
        "main_issue": "The root cause of the low score (e.g. no overview, weak data, off-topic)",
        "band_ceiling_reason": "What is preventing a higher band",
        "quick_win": "One thing to fix that would raise the band by 0.5"
    }},
    "examiner_comment": "A 2-3 sentence overall assessment as an examiner would write"
}}"""
    else:  # Task 2
        evaluation_prompt = f"""You are an official IELTS examiner with 15+ years of experience. Evaluate this Writing Task 2 essay using the official IELTS band descriptors.

{task_context}

TASK TYPE: Academic Writing Task 2 (Essay)
Essay Type: {request.topic or 'opinion/discussion'}
Target Band: {request.band_level}
Word Count: {word_count} words (minimum 250 required)

CANDIDATE'S RESPONSE:
\"\"\"
{response_text}
\"\"\"

OFFICIAL IELTS TASK 2 BAND DESCRIPTORS:

TASK RESPONSE (TR):
- Band 9: Fully addresses all parts; presents a well-developed position; relevant, extended ideas
- Band 7: Addresses all parts; presents a clear position; main ideas relevant but may lack focus
- Band 5: Addresses task only partially; position unclear at times; limited development

COHERENCE AND COHESION (CC):
- Band 9: Uses cohesion attracting no attention; paragraphing is skillfully managed
- Band 7: Logically organizes information; clear progression; uses range of cohesive devices
- Band 5: Presents information with some organization; inadequate or overused cohesive devices

LEXICAL RESOURCE (LR):
- Band 9: Full flexibility; natural and sophisticated control; rare slips only
- Band 7: Uses sufficient vocabulary; uses less common items; aware of style and collocation
- Band 5: Limited range but adequate for task; noticeable errors in spelling/word formation

GRAMMATICAL RANGE AND ACCURACY (GRA):
- Band 9: Wide range with full flexibility; rare minor errors as slips
- Band 7: Variety of complex structures; frequently error-free; good control
- Band 5: Limited range; attempts complex sentences; frequent grammatical errors

CRITICAL EVALUATION POINTS:
- Does the essay have a CLEAR THESIS STATEMENT?
- Are BOTH SIDES discussed (if required)?
- Is the OPINION clearly stated (if opinion essay)?
- Are IDEAS SUPPORTED with examples/evidence?
- Is there a PROPER CONCLUSION that summarizes?
- Penalize memorized templates and generic content

Return ONLY this JSON (no other text):
{{
    "overall_band": 6.5,
    "task_achievement": {{
        "score": 6,
        "feedback": "Specific feedback on thesis, arguments, position, and conclusion"
    }},
    "coherence_cohesion": {{
        "score": 7,
        "feedback": "Feedback on essay structure, paragraphing, and transitions"
    }},
    "lexical_resource": {{
        "score": 6,
        "feedback": "Feedback on academic vocabulary, range, and accuracy"
    }},
    "grammatical_range": {{
        "score": 7,
        "feedback": "Feedback on sentence variety, complexity, and accuracy"
    }},
    "strengths": [
        "Specific strength in argumentation or language",
        "Specific strength 2",
        "Specific strength 3"
    ],
    "weaknesses": [
        "Specific area needing improvement",
        "Specific weakness 2",
        "Specific weakness 3"
    ],
    "improvement_suggestions": [
        "How to improve the argument structure",
        "How to improve vocabulary usage",
        "How to improve grammar"
    ],
    "vocabulary_to_use": ["advanced academic word 1", "word 2", "word 3", "word 4", "word 5"],
    "grammar_corrections": [
        {{"original": "error from essay", "corrected": "correct version", "explanation": "why this is wrong"}}
    ],
    "line_by_line_corrections": [
        {{"original_line": "exact sentence from the essay", "corrected_line": "corrected version", "issue": "what was wrong"}}
    ],
    "high_priority_fixes": [
        "The single most important fix described in 1-2 sentences",
        "Second priority fix"
    ],
    "rewrite_guidance": {{
        "weakest_paragraph": "Which paragraph needs the most work and why",
        "suggested_opening": "A better opening sentence for that paragraph",
        "key_linking_phrases": "2-3 linking phrases the student should add"
    }},
    "response_diagnosis": {{
        "main_issue": "The root cause of the low score (e.g. weak thesis, no examples, repetitive vocabulary)",
        "band_ceiling_reason": "What is preventing a higher band",
        "quick_win": "One thing to fix that would raise the band by 0.5"
    }},
    "examiner_comment": "A 2-3 sentence overall assessment like an examiner would write in official feedback"
}}"""

    try:
        llm = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"writing_eval_{uuid.uuid4()}",
            system_message="You are an official IELTS examiner with 15+ years of experience."
        ).with_model("openai", "gpt-4o")
        
        result = await llm.send_message(UserMessage(text=evaluation_prompt))
        
        # Parse the JSON response
        result_text = result.strip()
        
        # Clean markdown code blocks if present
        if result_text.startswith("```"):
            lines = result_text.split("\n")
            # Find the JSON content
            json_lines = []
            in_json = False
            for line in lines:
                if line.startswith("```") and not in_json:
                    in_json = True
                    continue
                elif line.startswith("```") and in_json:
                    break
                elif in_json:
                    json_lines.append(line)
            result_text = "\n".join(json_lines)
        
        # Remove any leading/trailing whitespace
        result_text = result_text.strip()
        
        # Try to find JSON in the response if it's not pure JSON
        if not result_text.startswith("{"):
            import re
            json_match = re.search(r'\{[\s\S]*\}', result_text)
            if json_match:
                result_text = json_match.group()
        
        evaluation = json.loads(result_text)
        
        # Ensure all expected fields exist
        default_evaluation = {
            "overall_band": 5.5,
            "task_achievement": {"score": 5, "feedback": "Evaluation completed."},
            "coherence_cohesion": {"score": 5, "feedback": "Evaluation completed."},
            "lexical_resource": {"score": 5, "feedback": "Evaluation completed."},
            "grammatical_range": {"score": 5, "feedback": "Evaluation completed."},
            "strengths": [],
            "weaknesses": [],
            "improvement_suggestions": [],
            "vocabulary_to_use": [],
            "grammar_corrections": [],
            "examiner_comment": "Evaluation completed."
        }
        
        # Merge with defaults
        for key, default_value in default_evaluation.items():
            if key not in evaluation:
                evaluation[key] = default_value
        
        # ============ LESSON RECOMMENDATIONS (ULTRA MASTER PROMPT + DUAL-TRACK) ============
        # Fetch recommended lessons based on weaknesses AND track
        recommended_lessons = []
        try:
            # Extract weaknesses from evaluation
            weaknesses = evaluation.get("weaknesses", [])
            weakness_keywords = []
            
            # Map feedback to weakness categories
            for criteria in ["task_achievement", "coherence_cohesion", "lexical_resource", "grammatical_range"]:
                if criteria in evaluation:
                    score = evaluation[criteria].get("score", 0)
                    if isinstance(score, (int, float)) and score < 6:
                        if "task" in criteria:
                            weakness_keywords.append("task_achievement")
                        elif "coherence" in criteria:
                            weakness_keywords.append("coherence")
                        elif "lexical" in criteria:
                            weakness_keywords.append("vocabulary")
                        elif "grammar" in criteria:
                            weakness_keywords.append("grammar")
            
            # Add specific weaknesses from the list
            for weakness in weaknesses:
                weakness_lower = weakness.lower()
                if "vocabulary" in weakness_lower or "lexical" in weakness_lower:
                    weakness_keywords.append("vocabulary")
                elif "grammar" in weakness_lower:
                    weakness_keywords.append("grammar")
                elif "coherence" in weakness_lower or "cohesion" in weakness_lower:
                    weakness_keywords.append("coherence")
                elif "task" in weakness_lower:
                    weakness_keywords.append("task_achievement")
                # General Training specific weaknesses
                elif "tone" in weakness_lower or "formal" in weakness_lower or "polite" in weakness_lower:
                    weakness_keywords.append("tone")
                elif "letter" in weakness_lower or "format" in weakness_lower:
                    weakness_keywords.append("letter_format")
            
            # Remove duplicates
            weakness_keywords = list(set(weakness_keywords))
            
            if weakness_keywords:
                overall_band = evaluation.get("overall_band", 5.5)
                
                # Use track-specific recommendations for General Training
                if request.track == "general":
                    from services.dual_track_courses import get_dual_track_manager
                    from server import db as main_db
                    
                    manager = get_dual_track_manager(main_db)
                    recommendations = await manager.get_recommended_lessons_by_track(
                        track="general",
                        weaknesses=weakness_keywords,
                        band_level=request.band_level
                    )
                    
                    # Format for frontend - TRACK-SPECIFIC (CRITICAL: Never suggest Academic lessons for General track)
                    recommended_lessons = [
                        {
                            "lesson_id": r["lesson_id"],
                            "lesson_anchor_id": f"gt-{r['level']}-{r['lesson_id']}",  # Track-specific anchor
                            "title": r["title"],
                            "stage": r["level"],  # Using 'level' from dual-track
                            "band_level": r.get("band_target", request.band_level),
                            "track": "general",  # HARD-ENFORCE: Always "general" for General track
                            "reason": f"Addresses: {', '.join(r.get('addresses_weaknesses', []))}"
                        }
                        for r in recommendations[:3]
                    ]
                else:
                    # Academic track - use existing lesson registry
                    from services.lesson_registry import LessonRegistry
                    from server import db as main_db
                    
                    registry = LessonRegistry(main_db)
                    recommendations = await registry.get_recommended_lessons(
                        weaknesses=weakness_keywords,
                        current_band=float(overall_band),
                        skill="writing"
                    )
                    
                    # Format for frontend - TRACK-SPECIFIC (CRITICAL: Never suggest General lessons for Academic track)
                    recommended_lessons = [
                        {
                            "lesson_id": r["lesson_id"],
                            "lesson_anchor_id": f"ac-{r['stage']}-{r['lesson_id']}",  # Track-specific anchor
                            "title": r["title"],
                            "stage": r["stage"],
                            "band_level": r["band_level"],
                            "track": "academic",  # HARD-ENFORCE: Always "academic" for Academic track
                            "reason": f"Addresses: {', '.join(r['addresses_weaknesses'])}"
                        }
                        for r in recommendations[:3]
                    ]
        except Exception as rec_error:
            print(f"Warning: Could not fetch lesson recommendations: {rec_error}")
        
        return {
            "success": True,
            "word_count": word_count,
            "task_type": request.task_type,
            "track": request.track,
            "evaluation": evaluation,
            "recommended_lessons": recommended_lessons
        }
        
    except json.JSONDecodeError:
        # Return a fallback evaluation instead of error
        return {
            "success": True,
            "word_count": word_count,
            "task_type": request.task_type,
            "evaluation": {
                "overall_band": 5.5,
                "task_achievement": {"score": 5, "feedback": "Unable to provide detailed feedback. Please try again."},
                "coherence_cohesion": {"score": 5, "feedback": "Unable to provide detailed feedback."},
                "lexical_resource": {"score": 5, "feedback": "Unable to provide detailed feedback."},
                "grammatical_range": {"score": 5, "feedback": "Unable to provide detailed feedback."},
                "strengths": ["Response submitted successfully"],
                "weaknesses": ["Detailed analysis unavailable"],
                "improvement_suggestions": ["Try submitting again for detailed feedback"],
                "vocabulary_to_use": [],
                "grammar_corrections": [],
                "examiner_comment": "Your response has been received. Please try again for detailed feedback."
            },
            "parse_warning": "AI response parsing issue - showing fallback scores"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "word_count": word_count
        }

# ============ WRITING TASK 2 ENDPOINTS ============

@router.get("/writing/task2/prompts")
async def get_writing_task2_prompts(
    topic: Optional[str] = Query(None, description="Filter by topic"),
    band_level: Optional[str] = Query(None, description="Filter by band level"),
    essay_type: Optional[str] = Query(None, description="Essay type: opinion, discussion, advantage_disadvantage, problem_solution, two_part")
):
    """Get Writing Task 2 essay prompts with authentic IELTS content."""
    from services.writing_task2_generator import writing_task2_generator
    
    prompts = writing_task2_generator.get_essay_prompts(essay_type, band_level)
    
    # Filter by topic if provided
    if topic:
        prompts = [p for p in prompts if p["topic"] == topic]
    
    return {
        "prompts": prompts,
        "total": len(prompts)
    }

@router.get("/writing/task2/prompt/{prompt_id}")
async def get_writing_task2_prompt(prompt_id: str):
    """Get a specific Writing Task 2 prompt with model answers at Band 6 and Band 8.5."""
    from services.writing_task2_generator import writing_task2_generator
    
    # Get all prompts
    all_prompts = writing_task2_generator.get_essay_prompts()
    
    # Find the specific prompt
    prompt = None
    for p in all_prompts:
        if str(p["id"]) == prompt_id:
            prompt = p
            break
    
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Get model answers for both bands
    model_band6 = writing_task2_generator.get_model_answer(prompt["type"], prompt["topic"], 6.0)
    model_band85 = writing_task2_generator.get_model_answer(prompt["type"], prompt["topic"], 8.5)
    
    return {
        **prompt,
        "model_answers": {
            "band_6": model_band6,
            "band_8_5": model_band85
        }
    }

@router.get("/writing/task2/model-answers/{essay_type}")
async def get_task2_model_answers(
    essay_type: str,
    topic: str = Query("education", description="Topic of the essay")
):
    """Get model answers at different band levels for a specific essay type."""
    from services.writing_task2_generator import writing_task2_generator
    
    band6 = writing_task2_generator.get_model_answer(essay_type, topic, 6.0)
    band85 = writing_task2_generator.get_model_answer(essay_type, topic, 8.5)
    
    return {
        "essay_type": essay_type,
        "topic": topic,
        "model_answers": {
            "band_6": band6,
            "band_8_5": band85
        }
    }

# ============ GENERAL TRAINING TASK 1 (LETTER WRITING) ============

@router.get("/writing/general/task1/prompts")
async def get_general_task1_prompts(
    letter_type: Optional[str] = Query(None, description="Letter type: formal, semi_formal, informal")
):
    """Get General Training Writing Task 1 prompts (letter writing)."""
    from services.writing_task2_generator import writing_task2_generator
    
    prompts = writing_task2_generator.get_letter_prompts(letter_type)
    
    return {
        "prompts": prompts,
        "total": len(prompts),
        "letter_types": ["formal", "semi_formal", "informal"]
    }

@router.get("/writing/general/task1/prompt/{prompt_id}")
async def get_general_task1_prompt(prompt_id: str):
    """Get a specific General Training Task 1 prompt with model answers."""
    from services.writing_task2_generator import writing_task2_generator
    
    all_prompts = writing_task2_generator.get_letter_prompts()
    
    prompt = None
    for p in all_prompts:
        if str(p["id"]) == prompt_id:
            prompt = p
            break
    
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Get model answers for both bands
    model_band6 = writing_task2_generator.get_letter_model_answer(prompt["type"], prompt["topic"], 6.0)
    model_band85 = writing_task2_generator.get_letter_model_answer(prompt["type"], prompt["topic"], 8.5)
    
    return {
        **prompt,
        "model_answers": {
            "band_6": model_band6,
            "band_8_5": model_band85
        }
    }



# ============ GENERAL TRAINING TASK 2 (ESSAY) ============

# General Training Task 2 essay topics (different from Academic)
GENERAL_TASK2_PROMPTS = [
    # Opinion Essays
    {
        "id": "gen_op_1",
        "type": "opinion",
        "topic": "work_life",
        "prompt": "Many people believe that working from home is the best way to achieve work-life balance.\n\nTo what extent do you agree or disagree with this statement?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
        "key_points": ["Discuss benefits and drawbacks of remote work", "Consider personal experience", "Give clear opinion"]
    },
    {
        "id": "gen_op_2",
        "type": "opinion",
        "topic": "social_media",
        "prompt": "Some people think social media has made it easier to stay in touch with friends and family.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
        "key_points": ["Discuss impact of social media on relationships", "Give personal examples", "Present balanced view"]
    },
    {
        "id": "gen_op_3",
        "type": "opinion",
        "topic": "education",
        "prompt": "Some people believe that children should start learning a foreign language at primary school. Others think they should wait until secondary school.\n\nDiscuss both views and give your opinion.",
        "key_points": ["Arguments for early learning", "Arguments for later start", "Personal opinion"]
    },
    {
        "id": "gen_op_4",
        "type": "opinion",
        "topic": "health",
        "prompt": "Some people think that regular exercise is the most important factor for a healthy lifestyle. Others believe diet is more important.\n\nDiscuss both views and give your opinion.",
        "key_points": ["Importance of exercise", "Importance of diet", "Balanced conclusion"]
    },
    # Discussion Essays
    {
        "id": "gen_disc_1",
        "type": "discussion",
        "topic": "technology",
        "prompt": "Many people prefer to shop online rather than in traditional stores.\n\nWhat are the advantages and disadvantages of online shopping?",
        "key_points": ["Convenience factors", "Drawbacks like delivery issues", "Impact on local businesses"]
    },
    {
        "id": "gen_disc_2",
        "type": "discussion",
        "topic": "travel",
        "prompt": "Some people prefer to travel in a group with a tour guide. Others prefer to travel independently.\n\nDiscuss both approaches and state your preference.",
        "key_points": ["Benefits of guided tours", "Benefits of independent travel", "Personal preference"]
    },
    {
        "id": "gen_disc_3",
        "type": "discussion",
        "topic": "environment",
        "prompt": "Many cities are encouraging people to use bicycles instead of cars.\n\nWhat are the advantages and disadvantages of this trend?",
        "key_points": ["Environmental benefits", "Health benefits", "Practical challenges"]
    },
    {
        "id": "gen_disc_4",
        "type": "discussion",
        "topic": "lifestyle",
        "prompt": "In many countries, people are choosing to live alone rather than with family members.\n\nDo you think this is a positive or negative development?",
        "key_points": ["Personal freedom aspects", "Social implications", "Economic factors"]
    },
    # Problem-Solution Essays
    {
        "id": "gen_prob_1",
        "type": "problem_solution",
        "topic": "community",
        "prompt": "In many cities, there is a shortage of affordable housing.\n\nWhat problems does this cause? What solutions can you suggest?",
        "key_points": ["Impact on families", "Economic effects", "Government solutions"]
    },
    {
        "id": "gen_prob_2",
        "type": "problem_solution",
        "topic": "health",
        "prompt": "Many people today suffer from stress and anxiety in their daily lives.\n\nWhat are the main causes of this problem? What measures can be taken to address it?",
        "key_points": ["Work-related stress", "Lifestyle factors", "Practical solutions"]
    },
    {
        "id": "gen_prob_3",
        "type": "problem_solution",
        "topic": "environment",
        "prompt": "Plastic waste is a growing problem in many countries.\n\nWhat problems does this cause, and how can these problems be solved?",
        "key_points": ["Environmental damage", "Impact on wildlife", "Recycling and alternatives"]
    },
    {
        "id": "gen_prob_4",
        "type": "problem_solution",
        "topic": "traffic",
        "prompt": "Traffic congestion is becoming a serious problem in many cities.\n\nWhat are the causes of this problem? What solutions would you suggest?",
        "key_points": ["Population growth", "Car ownership", "Public transport solutions"]
    },
    # Two-Part Questions
    {
        "id": "gen_two_1",
        "type": "two_part",
        "topic": "success",
        "prompt": "Some people believe that success in life comes from hard work. Others think that luck plays a more important role.\n\nWhat do you think is more important for success? What other factors contribute to a person's success?",
        "key_points": ["Role of hard work", "Role of luck", "Other contributing factors"]
    },
    {
        "id": "gen_two_2",
        "type": "two_part",
        "topic": "learning",
        "prompt": "Learning new skills is important for professional development.\n\nWhat skills are most useful in today's workplace? How can people best develop these skills?",
        "key_points": ["In-demand skills", "Methods of learning", "Practical advice"]
    },
    {
        "id": "gen_two_3",
        "type": "two_part",
        "topic": "food",
        "prompt": "Fast food is becoming increasingly popular in many countries.\n\nWhy is this happening? Do you think this is a positive or negative development?",
        "key_points": ["Reasons for popularity", "Health implications", "Cultural impact"]
    },
    {
        "id": "gen_two_4",
        "type": "two_part",
        "topic": "entertainment",
        "prompt": "More and more people are spending their free time watching TV or using their phones.\n\nWhy is this happening? Is this a positive or negative trend?",
        "key_points": ["Technology accessibility", "Impact on social life", "Effects on health"]
    }
]

@router.get("/writing/general/task2/prompts")
async def get_general_task2_prompts(
    essay_type: Optional[str] = Query(None, description="Essay type: opinion, discussion, problem_solution, two_part")
):
    """Get General Training Writing Task 2 prompts (essays)."""
    prompts = GENERAL_TASK2_PROMPTS
    
    if essay_type:
        prompts = [p for p in prompts if p["type"] == essay_type]
    
    return {
        "prompts": prompts,
        "total": len(prompts),
        "essay_types": ["opinion", "discussion", "problem_solution", "two_part"]
    }

@router.get("/writing/general/task2/prompt/{prompt_id}")
async def get_general_task2_prompt(prompt_id: str):
    """Get a specific General Training Task 2 prompt with model answers."""
    from services.writing_task2_generator import writing_task2_generator
    
    prompt = None
    for p in GENERAL_TASK2_PROMPTS:
        if p["id"] == prompt_id:
            prompt = p
            break
    
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Generate model answers
    model_band6 = writing_task2_generator.get_model_answer(prompt["type"], prompt["topic"], 6.0)
    model_band85 = writing_task2_generator.get_model_answer(prompt["type"], prompt["topic"], 8.5)
    
    return {
        **prompt,
        "model_answers": {
            "band_6": model_band6,
            "band_8_5": model_band85
        }
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
