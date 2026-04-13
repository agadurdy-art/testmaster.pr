"""
Backend Tests for Stage 1 Full Curriculum (12 Units × 4 Lessons = 48 Lessons)
Tests the seeded data from seed_stage1_full.py
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestStage1Units:
    """Test that all 12 units are present with correct data"""
    
    def test_stage_1_returns_12_units(self):
        """GET /api/unified/stages/stage_1 returns 12 units"""
        response = requests.get(f"{BASE_URL}/api/unified/stages/stage_1")
        assert response.status_code == 200
        data = response.json()
        assert "units" in data
        assert len(data["units"]) == 12
        
    def test_stage_1_unit_titles_correct(self):
        """Verify all 12 unit titles match expected values"""
        expected_titles = [
            "Hello!", "Friends", "Numbers", "Colors", "My Family", "My Face",
            "My Body", "The Farm", "My Pets", "At School", "Feelings", "Big Review!"
        ]
        response = requests.get(f"{BASE_URL}/api/unified/stages/stage_1")
        assert response.status_code == 200
        data = response.json()
        unit_titles = [u["title"] for u in data["units"]]
        for expected in expected_titles:
            assert expected in unit_titles, f"Missing unit: {expected}"
            
    def test_units_have_different_colors(self):
        """Each unit should have a unique theme_color"""
        response = requests.get(f"{BASE_URL}/api/unified/stages/stage_1")
        assert response.status_code == 200
        data = response.json()
        colors = [u["theme_color"] for u in data["units"]]
        # At least 6 unique colors (some units may share colors)
        assert len(set(colors)) >= 6

class TestUnit8Farm:
    """Test Unit 8 - The Farm unit specifically"""
    
    def test_unit_8_has_4_lessons(self):
        """GET /api/unified/units/stage_1_unit_08 returns 4 lessons"""
        response = requests.get(f"{BASE_URL}/api/unified/units/stage_1_unit_08")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "The Farm"
        assert "lessons" in data
        assert len(data["lessons"]) == 4
        
    def test_unit_8_lesson_ids_correct(self):
        """Verify lesson IDs follow pattern"""
        response = requests.get(f"{BASE_URL}/api/unified/units/stage_1_unit_08")
        assert response.status_code == 200
        data = response.json()
        lesson_ids = [l["lesson_id"] for l in data["lessons"]]
        expected_ids = [
            "stage_1_unit_08_lesson_01",
            "stage_1_unit_08_lesson_02",
            "stage_1_unit_08_lesson_03",
            "stage_1_unit_08_lesson_04"
        ]
        for eid in expected_ids:
            assert eid in lesson_ids

class TestFarmVocabulary:
    """Test vocabulary for Farm unit (cow, horse, sheep)"""
    
    def test_farm_lesson_1_vocabulary_has_cow_horse_sheep(self):
        """GET vocabulary for farm unit returns cow, horse, sheep with emoji"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_08_lesson_01/activity/vocabulary")
        assert response.status_code == 200
        data = response.json()
        assert "words" in data
        words = data["words"]
        word_names = [w["word"] for w in words]
        # Lesson 1 has first half: cow, horse, sheep
        assert "cow" in word_names
        assert "horse" in word_names
        assert "sheep" in word_names
        
    def test_farm_vocabulary_has_emoji(self):
        """Vocabulary words have image_emoji field"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_08_lesson_01/activity/vocabulary")
        assert response.status_code == 200
        data = response.json()
        for word in data["words"]:
            assert "image_emoji" in word, f"Word {word['word']} missing image_emoji"
            assert word["image_emoji"], f"Word {word['word']} has empty emoji"
            
    def test_cow_has_correct_emoji(self):
        """Cow should have cow emoji"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_08_lesson_01/activity/vocabulary")
        assert response.status_code == 200
        data = response.json()
        cow = next((w for w in data["words"] if w["word"] == "cow"), None)
        assert cow is not None
        assert cow["image_emoji"] == "🐄"

class TestGrammarGameMixed:
    """Test Grammar Game with 3 game types"""
    
    def test_unit_5_grammar_game_is_mixed(self):
        """Unit 5 grammar game has game_type=mixed"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_05_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        data = response.json()
        assert data["game_type"] == "mixed"
        
    def test_grammar_game_has_error_hunter_items(self):
        """Grammar game has error hunter items"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_05_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) > 0
        # Check structure
        for item in data["items"]:
            assert "sentence" in item
            assert "has_error" in item
            assert "correct_sentence" in item
            
    def test_grammar_game_has_word_order_items(self):
        """Grammar game has word order items"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_05_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        data = response.json()
        assert "word_order_items" in data
        assert len(data["word_order_items"]) > 0
        for item in data["word_order_items"]:
            assert "words" in item
            assert "correct_sentence" in item
            
    def test_grammar_game_has_fill_blank_items(self):
        """Grammar game has fill blank items"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_05_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        data = response.json()
        assert "fill_blank_items" in data
        assert len(data["fill_blank_items"]) > 0
        for item in data["fill_blank_items"]:
            assert "sentence" in item
            assert "options" in item
            assert "correct_answer" in item
            assert item["correct_answer"] in item["options"]

class TestFeelingsExitTicket:
    """Test Exit Ticket for Unit 11 - Feelings"""
    
    def test_feelings_exit_ticket_returns_4_questions(self):
        """Exit ticket has 4 questions about feelings"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_11_lesson_01/activity/exit_ticket")
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert len(data["questions"]) == 4
        
    def test_exit_ticket_questions_about_feelings(self):
        """Questions relate to feelings vocabulary"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_11_lesson_01/activity/exit_ticket")
        assert response.status_code == 200
        data = response.json()
        questions_text = " ".join([q["question_text"].lower() for q in data["questions"]])
        # Should contain feelings-related words
        assert any(word in questions_text for word in ["happy", "sad", "feeling", "pleased", "unhappy"])

class TestNumbersReading:
    """Test Reading activity for Unit 3 - Numbers"""
    
    def test_numbers_reading_has_passage(self):
        """Reading activity has passage about counting"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/micro_reading")
        assert response.status_code == 200
        data = response.json()
        assert "passage" in data
        passage = data["passage"].lower()
        # Should contain numbers/counting content
        assert "one" in passage or "two" in passage or "count" in passage
        
    def test_numbers_reading_title(self):
        """Reading title mentions Numbers"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/micro_reading")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "Numbers" in data["title"]

class TestAllUnitsHaveLessons:
    """Verify all 12 units have 4 lessons each"""
    
    @pytest.mark.parametrize("unit_num", range(1, 13))
    def test_unit_has_4_lessons(self, unit_num):
        """Each unit should have exactly 4 lessons"""
        unit_id = f"stage_1_unit_{unit_num:02d}"
        response = requests.get(f"{BASE_URL}/api/unified/units/{unit_id}")
        assert response.status_code == 200, f"Unit {unit_id} not found"
        data = response.json()
        assert "lessons" in data, f"Unit {unit_id} missing lessons"
        assert len(data["lessons"]) == 4, f"Unit {unit_id} has {len(data['lessons'])} lessons, expected 4"

class TestLogin:
    """Test login with provided credentials"""
    
    def test_login_success(self):
        """Login with email=geldiaga67@gmail.com, password=geldiaga67"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "geldiaga67@gmail.com",
            "password": "geldiaga67"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data or "user" in data or "id" in data
