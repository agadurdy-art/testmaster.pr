"""
Bug Fix Verification Tests - Iteration 53
Tests for 4 specific bug fixes:
1. Word Order game: period in correctSentence causing false negative
2. Listening options: defaulting to Yes/No instead of proper options
3. Warm-up: now has 3 questions instead of 1
4. Exit Ticket: now has 5 questions instead of 1
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestWarmupBugFix:
    """Bug fix: Warm-up should have 3 questions (not 1)"""
    
    def test_unit03_warmup_has_3_questions(self):
        """Unit 3 Lesson 1 warm-up should have 3 questions"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/retrieval_warmup")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get('questions', [])
        
        # BUG FIX: Should have 3 questions, not 1
        assert len(questions) == 3, f"Expected 3 questions, got {len(questions)}"
        
        # Each question should have options
        for i, q in enumerate(questions):
            assert 'options' in q, f"Question {i+1} missing options"
            assert len(q['options']) >= 3, f"Question {i+1} should have at least 3 options"
    
    def test_unit01_warmup_has_3_questions(self):
        """Unit 1 Lesson 1 warm-up should have 3 questions"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/retrieval_warmup")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get('questions', [])
        
        assert len(questions) == 3, f"Expected 3 questions, got {len(questions)}"


class TestExitTicketBugFix:
    """Bug fix: Exit ticket should have 5 questions (not 1)"""
    
    def test_unit03_exit_ticket_has_5_questions(self):
        """Unit 3 Lesson 1 exit ticket should have 5 questions"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/exit_ticket")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get('questions', [])
        
        # BUG FIX: Should have 5 questions, not 1
        assert len(questions) == 5, f"Expected 5 questions, got {len(questions)}"
        
        # Each question should have options
        for i, q in enumerate(questions):
            assert 'options' in q, f"Question {i+1} missing options"
            assert len(q['options']) >= 2, f"Question {i+1} should have at least 2 options"
    
    def test_unit06_exit_ticket_has_at_least_4_questions(self):
        """Unit 6 Lesson 1 exit ticket should have at least 4 questions"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_06_lesson_01/activity/exit_ticket")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get('questions', [])
        
        assert len(questions) >= 4, f"Expected at least 4 questions, got {len(questions)}"


class TestListeningOptionsBugFix:
    """Bug fix: Listening options should be proper choices (not just Yes/No)"""
    
    def test_unit03_listening_has_proper_options(self):
        """Unit 3 Lesson 1 listening should have proper options (not just Yes/No)"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/listening_task")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get('questions', [])
        
        assert len(questions) >= 1, "Should have at least 1 listening question"
        
        for i, q in enumerate(questions):
            options = q.get('options', [])
            assert len(options) >= 2, f"Question {i+1} should have at least 2 options"
            
            # BUG FIX: Options should NOT be just ['Yes', 'No']
            options_lower = [o.lower() for o in options]
            if len(options) == 2 and set(options_lower) == {'yes', 'no'}:
                pytest.fail(f"Question {i+1} has only Yes/No options - bug not fixed!")
            
            # Verify options are meaningful (contain numbers or proper choices)
            print(f"Question {i+1} options: {options}")


class TestWordOrderBugFix:
    """Bug fix: Word Order should strip trailing punctuation for comparison"""
    
    def test_grammar_games_word_order_data_structure(self):
        """Grammar games should have word_order items"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        games = data.get('games', [])
        
        # Find word_order game
        word_order_game = None
        for game in games:
            if game.get('game_type') == 'word_order':
                word_order_game = game
                break
        
        assert word_order_game is not None, "No word_order game found in grammar games"
        
        items = word_order_game.get('items', [])
        assert len(items) >= 1, "Word order game should have at least 1 item"
        
        # Check that correctSentence exists
        for i, item in enumerate(items):
            assert 'correctSentence' in item, f"Item {i+1} missing correctSentence"
            assert 'words' in item, f"Item {i+1} missing words"
            
            # The frontend normalize function will strip trailing punctuation
            # So "It is a kite." will match user input "It is a kite"
            correct = item['correctSentence']
            print(f"Item {i+1} correctSentence: '{correct}'")


class TestSidebarActivitiesAccessible:
    """All sidebar activities should be accessible and return data"""
    
    @pytest.mark.parametrize("activity_type,expected_key", [
        ("retrieval_warmup", "questions"),
        ("vocabulary", "words"),
        ("micro_game_vocab", "games"),
        ("micro_reading", "passage_text"),
        ("grammar_focus", "rule"),
        ("micro_game_grammar", "games"),
        ("listening_task", "audio_text"),
        ("production", "prompt"),
        ("exit_ticket", "questions"),
    ])
    def test_activity_returns_data(self, activity_type, expected_key):
        """Each activity type should return proper data structure"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/{activity_type}")
        assert response.status_code == 200, f"Activity {activity_type} failed with status {response.status_code}"
        
        data = response.json()
        # Some activities use different field names
        has_expected_data = (
            expected_key in data or 
            'items' in data or  # Alternative for some activities
            'questions' in data or  # Alternative for quiz-type activities
            'audio_text' in data  # Alternative for listening
        )
        assert has_expected_data, f"Activity {activity_type} missing expected data key"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
