"""
Question Bank - static metadata + stats endpoints (skills, topics, band
levels, question types, question-bank statistics).

Extracted from routes/question_bank.py (Faz 1 refactor, 2026-07-02).
"""

from fastapi import APIRouter

router = APIRouter()

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
            "by_skill": {"reading": 0, "listening": 0, "writing": 0, "speaking": 0},
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
