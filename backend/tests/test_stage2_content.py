"""
Stage 2 Content Verification Tests
Tests for 12 units, 48 lessons in Stage 2 (Starters A1)
Verifies: unit count, lesson counts, activity_flow, reading questions, grammar examples
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://vocab-image-mgr.preview.emergentagent.com')


class TestStage2Units:
    """Test Stage 2 has all 12 units with correct data"""

    def test_stage2_has_12_units(self):
        """GET /api/unified/stages/stage_2_starters/units should return 12 units"""
        response = requests.get(f"{BASE_URL}/api/unified/stages/stage_2_starters/units")
        assert response.status_code == 200
        data = response.json()
        
        units = data.get('units', [])
        assert len(units) == 12, f"Expected 12 units, got {len(units)}"
        
        # Verify all 12 unit IDs exist
        unit_ids = [u.get('unit_id') for u in units]
        for i in range(1, 13):
            expected_id = f"stage_2_unit_{str(i).zfill(2)}"
            assert expected_id in unit_ids, f"Missing {expected_id}"

    def test_unit_02_has_4_lessons_with_number(self):
        """GET /api/unified/units/stage_2_unit_02 returns unit with 4 lessons, each with number field"""
        response = requests.get(f"{BASE_URL}/api/unified/units/stage_2_unit_02")
        assert response.status_code == 200
        data = response.json()
        
        lessons = data.get('lessons', [])
        assert len(lessons) == 4, f"Expected 4 lessons, got {len(lessons)}"
        
        # Verify each lesson has 'number' field
        for lesson in lessons:
            assert 'number' in lesson or 'lesson_number' in lesson, f"Lesson {lesson.get('lesson_id')} missing number field"
            num = lesson.get('number', lesson.get('lesson_number'))
            assert num in [1, 2, 3, 4], f"Invalid lesson number {num}"

    def test_unit_06_has_4_lessons(self):
        """GET /api/unified/units/stage_2_unit_06 returns unit with 4 lessons"""
        response = requests.get(f"{BASE_URL}/api/unified/units/stage_2_unit_06")
        assert response.status_code == 200
        data = response.json()
        
        lessons = data.get('lessons', [])
        assert len(lessons) == 4, f"Expected 4 lessons, got {len(lessons)}"
        
        # Verify unit title
        assert data.get('title') == "My Family & Friends"

    def test_unit_12_has_4_lessons(self):
        """GET /api/unified/units/stage_2_unit_12 returns unit with 4 lessons"""
        response = requests.get(f"{BASE_URL}/api/unified/units/stage_2_unit_12")
        assert response.status_code == 200
        data = response.json()
        
        lessons = data.get('lessons', [])
        assert len(lessons) == 4, f"Expected 4 lessons, got {len(lessons)}"
        
        # Verify unit title
        assert data.get('title') == "Review & Final Gate"


class TestLessonActivityFlow:
    """Test lessons have complete 10-activity flow"""

    def test_unit05_lesson01_has_10_activities(self):
        """GET /api/unified/lessons/stage_2_unit_05_lesson_01 has 10 activities in activity_flow"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_05_lesson_01")
        assert response.status_code == 200
        data = response.json()
        
        activity_flow = data.get('activity_flow', [])
        assert len(activity_flow) == 10, f"Expected 10 activities, got {len(activity_flow)}"
        
        # Verify expected activity types
        activity_types = [a.get('type') for a in activity_flow]
        required_types = ['retrieval_warmup', 'vocabulary', 'micro_game_vocab', 'micro_reading', 
                         'grammar_focus', 'micro_game_grammar', 'production', 'exit_ticket']
        for t in required_types:
            assert t in activity_types, f"Missing activity type: {t}"


class TestReadingQuestions:
    """Test reading activities have 3 questions"""

    def test_unit09_lesson03_reading_has_3_questions(self):
        """GET /api/unified/lessons/stage_2_unit_09_lesson_03 micro_reading has 3 questions"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_09_lesson_03")
        assert response.status_code == 200
        data = response.json()
        
        activity_flow = data.get('activity_flow', [])
        reading_activity = None
        for a in activity_flow:
            if a.get('type') == 'micro_reading':
                reading_activity = a
                break
        
        assert reading_activity is not None, "micro_reading activity not found"
        
        reading_data = reading_activity.get('data', {})
        questions = reading_data.get('comprehension_questions', reading_data.get('questions', []))
        assert len(questions) == 3, f"Expected 3 reading questions, got {len(questions)}"


class TestGrammarExamples:
    """Test grammar activities have examples"""

    def test_unit12_lesson04_grammar_has_examples(self):
        """GET /api/unified/lessons/stage_2_unit_12_lesson_04 grammar_focus has examples"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_12_lesson_04")
        assert response.status_code == 200
        data = response.json()
        
        activity_flow = data.get('activity_flow', [])
        grammar_activity = None
        for a in activity_flow:
            if a.get('type') == 'grammar_focus':
                grammar_activity = a
                break
        
        assert grammar_activity is not None, "grammar_focus activity not found"
        
        grammar_data = grammar_activity.get('data', {})
        examples = grammar_data.get('examples', [])
        assert len(examples) >= 3, f"Expected at least 3 grammar examples, got {len(examples)}"
        
        # Verify rule is present
        rule = grammar_data.get('rule', '')
        assert len(rule) > 0, "Grammar rule is empty"


class TestTTSEndpoint:
    """Test TTS generation endpoint"""

    def test_tts_generate_returns_audio_url(self):
        """POST /api/unified/tts/generate with text returns audio_url"""
        response = requests.post(
            f"{BASE_URL}/api/unified/tts/generate",
            json={"text": "Hello"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert 'audio_url' in data, "audio_url not in response"
        assert data.get('text') == "Hello", "text not echoed back"


class TestMultipleUnitsLessons:
    """Test lessons across multiple units to verify data integrity"""

    @pytest.mark.parametrize("unit_num,expected_lessons", [
        (1, 4), (2, 4), (3, 4), (4, 4), (5, 4), (6, 4),
        (7, 4), (8, 4), (9, 4), (10, 4), (11, 4), (12, 4)
    ])
    def test_all_units_have_4_lessons(self, unit_num, expected_lessons):
        """Each unit 1-12 should have exactly 4 lessons"""
        unit_id = f"stage_2_unit_{str(unit_num).zfill(2)}"
        response = requests.get(f"{BASE_URL}/api/unified/units/{unit_id}")
        assert response.status_code == 200, f"Failed to get {unit_id}"
        data = response.json()
        
        lessons = data.get('lessons', [])
        assert len(lessons) == expected_lessons, f"{unit_id} has {len(lessons)} lessons, expected {expected_lessons}"

    @pytest.mark.parametrize("lesson_id", [
        "stage_2_unit_01_lesson_01",
        "stage_2_unit_03_lesson_02",
        "stage_2_unit_07_lesson_03",
        "stage_2_unit_10_lesson_04",
    ])
    def test_random_lessons_have_activity_flow(self, lesson_id):
        """Random sample of lessons should have activity_flow with 10 activities"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}")
        assert response.status_code == 200, f"Failed to get {lesson_id}"
        data = response.json()
        
        activity_flow = data.get('activity_flow', [])
        assert len(activity_flow) == 10, f"{lesson_id} has {len(activity_flow)} activities, expected 10"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
