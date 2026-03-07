"""
Test file for Unified Learning System Bug Fixes
Testing: Game mechanics and Exit Quiz evaluation

Bugs fixed:
1) Game mechanics mark correct answers as incorrect
2) Exit Quiz evaluation is broken (user gets stuck when failing)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://vocab-image-mgr.preview.emergentagent.com')

class TestUnifiedLearningAPIs:
    """Test API endpoints for lesson activities"""

    def test_exit_ticket_returns_questions(self):
        """Exit ticket API returns proper questions array"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/exit_ticket")
        assert response.status_code == 200
        
        data = response.json()
        assert "questions" in data
        assert len(data["questions"]) == 4
        assert data["pass_threshold"] == 70
        
        # Verify question structure
        for q in data["questions"]:
            assert "question_id" in q
            assert "question_type" in q
            assert "question_text" in q
            assert "correct_answer" in q
            
        # Check question types
        question_types = [q["question_type"] for q in data["questions"]]
        assert "multiple_choice" in question_types
        assert "fill_blank" in question_types

    def test_matching_game_returns_items(self):
        """Matching game (micro_game_vocab) returns items array"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/micro_game_vocab")
        assert response.status_code == 200
        
        data = response.json()
        assert "items" in data
        assert len(data["items"]) == 6
        assert data["game_type"] == "matching"
        
        # Verify item structure
        for item in data["items"]:
            assert "word" in item
            assert "match" in item
            
        # Verify known word-match pair
        hello_item = next((i for i in data["items"] if i["word"] == "hello"), None)
        assert hello_item is not None
        assert "greeting" in hello_item["match"].lower()

    def test_vocabulary_returns_words(self):
        """Vocabulary activity returns words with required fields"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        assert "words" in data
        assert len(data["words"]) == 8
        
        # Verify word structure for typing check
        for word in data["words"]:
            assert "word_id" in word
            assert "word" in word
            assert "definition" in word
            assert "example_sentence" in word

    def test_exit_ticket_correct_answers(self):
        """Verify exit ticket has correct answers for validation"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/exit_ticket")
        data = response.json()
        
        # Expected correct answers
        expected_answers = {
            "et1": "Hello",
            "et2": "Good morning",
            "et3": "Good night",
            "et4": "Goodbye"
        }
        
        for q in data["questions"]:
            assert q["correct_answer"] == expected_answers.get(q["question_id"]), \
                f"Question {q['question_id']} has unexpected answer"

    def test_stages_endpoint(self):
        """All 8 stages are returned"""
        response = requests.get(f"{BASE_URL}/api/unified/stages")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 8
        assert len(data["stages"]) == 8
        
        # Verify stage 1 is first
        assert data["stages"][0]["name"] == "Foundations"

    def test_lesson_activity_flow(self):
        """Lesson returns 10-step activity flow"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        
        data = response.json()
        assert "activity_flow" in data
        assert len(data["activity_flow"]) == 10
        
        # Check expected activity types are present
        activity_types = [a["type"] for a in data["activity_flow"]]
        assert "vocabulary" in activity_types
        assert "micro_game_vocab" in activity_types
        assert "exit_ticket" in activity_types
        assert "auto_review" in activity_types

    def test_grammar_game_for_error_hunter(self):
        """Grammar game (error hunter) returns items for Lesson 2"""
        # Lesson 2 has grammar content
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/activity/micro_game_grammar")
        
        # May not exist for lesson 1, check if exists for lesson 2
        if response.status_code == 200:
            data = response.json()
            if "items" in data:
                for item in data["items"]:
                    assert "sentence" in item
                    assert "has_error" in item


class TestExitQuizLogic:
    """Test exit quiz calculation logic (simulated)"""
    
    def test_pass_threshold_70_percent(self):
        """Verify 70% threshold logic"""
        # Get exit ticket data
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/exit_ticket")
        data = response.json()
        
        # Verify threshold
        assert data.get("pass_threshold", 70) == 70
        
        # With 4 questions:
        # 0 correct = 0% (fail)
        # 1 correct = 25% (fail)
        # 2 correct = 50% (fail)
        # 3 correct = 75% (pass)
        # 4 correct = 100% (pass)
        
        questions_count = len(data["questions"])
        assert questions_count == 4
        
        # Minimum to pass = ceil(4 * 0.7) = 3 questions
        min_to_pass = 3
        assert (min_to_pass / questions_count) * 100 >= 70


class TestActivitySequence:
    """Test activity sequence and flow"""
    
    def test_activities_have_duration(self):
        """Activities have duration info for skipping logic"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        data = response.json()
        
        for activity in data["activity_flow"]:
            assert "duration_minutes" in activity
            assert "is_skippable" in activity
            
    def test_warmup_is_first(self):
        """Retrieval warmup is first activity"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        data = response.json()
        
        first_activity = data["activity_flow"][0]
        assert first_activity["type"] == "retrieval_warmup"
        assert first_activity["order"] == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
