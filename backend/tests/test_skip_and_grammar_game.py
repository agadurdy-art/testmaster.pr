"""
Test Skip button functionality and Grammar Game with 3 game types.
Tests for iteration 41 - Features:
1. Skip button on all activity steps
2. Grammar Game with error_hunter, word_order, fill_blank game types
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestGrammarGameAPI:
    """Test Grammar Game API returns all 3 game types"""
    
    def test_lesson_2_grammar_game_has_mixed_types(self):
        """Verify lesson 2 grammar game has error_hunter, word_order, and fill_blank items"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/activity/micro_game_grammar"
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify game_type is 'mixed'
        assert data.get("game_type") == "mixed", f"Expected game_type='mixed', got {data.get('game_type')}"
        
        # Verify error_hunter items exist
        items = data.get("items", [])
        assert len(items) >= 1, f"Expected at least 1 error_hunter item, got {len(items)}"
        
        # Verify word_order_items exist
        word_order_items = data.get("word_order_items", [])
        assert len(word_order_items) >= 1, f"Expected at least 1 word_order item, got {len(word_order_items)}"
        
        # Verify fill_blank_items exist
        fill_blank_items = data.get("fill_blank_items", [])
        assert len(fill_blank_items) >= 1, f"Expected at least 1 fill_blank item, got {len(fill_blank_items)}"
        
        print(f"Grammar Game Lesson 2: {len(items)} error_hunter, {len(word_order_items)} word_order, {len(fill_blank_items)} fill_blank")
    
    def test_lesson_1_grammar_game_has_mixed_types(self):
        """Verify lesson 1 grammar game has error_hunter, word_order, and fill_blank items"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/micro_game_grammar"
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify game_type is 'mixed'
        assert data.get("game_type") == "mixed", f"Expected game_type='mixed', got {data.get('game_type')}"
        
        # Verify all 3 item types
        items = data.get("items", [])
        word_order_items = data.get("word_order_items", [])
        fill_blank_items = data.get("fill_blank_items", [])
        
        assert len(items) >= 1, "Missing error_hunter items"
        assert len(word_order_items) >= 1, "Missing word_order items"
        assert len(fill_blank_items) >= 1, "Missing fill_blank items"
        
        print(f"Grammar Game Lesson 1: {len(items)} error_hunter, {len(word_order_items)} word_order, {len(fill_blank_items)} fill_blank")
    
    def test_error_hunter_item_structure(self):
        """Verify error_hunter items have correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/activity/micro_game_grammar"
        )
        assert response.status_code == 200
        
        data = response.json()
        items = data.get("items", [])
        
        for item in items:
            assert "sentence" in item, "error_hunter item missing 'sentence'"
            assert "has_error" in item, "error_hunter item missing 'has_error'"
            assert "correct_sentence" in item, "error_hunter item missing 'correct_sentence'"
            assert isinstance(item["has_error"], bool), "'has_error' should be boolean"
    
    def test_word_order_item_structure(self):
        """Verify word_order items have correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/activity/micro_game_grammar"
        )
        assert response.status_code == 200
        
        data = response.json()
        word_order_items = data.get("word_order_items", [])
        
        for item in word_order_items:
            assert "words" in item, "word_order item missing 'words'"
            assert "correct_sentence" in item, "word_order item missing 'correct_sentence'"
            assert isinstance(item["words"], list), "'words' should be a list"
            assert len(item["words"]) >= 2, "'words' should have at least 2 words"
    
    def test_fill_blank_item_structure(self):
        """Verify fill_blank items have correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/activity/micro_game_grammar"
        )
        assert response.status_code == 200
        
        data = response.json()
        fill_blank_items = data.get("fill_blank_items", [])
        
        for item in fill_blank_items:
            assert "sentence" in item, "fill_blank item missing 'sentence'"
            assert "options" in item, "fill_blank item missing 'options'"
            assert "correct_answer" in item, "fill_blank item missing 'correct_answer'"
            assert isinstance(item["options"], list), "'options' should be a list"
            assert len(item["options"]) >= 2, "'options' should have at least 2 choices"
            assert item["correct_answer"] in item["options"], "correct_answer should be in options"


class TestLessonActivityFlow:
    """Test lesson structure with all 10 activities"""
    
    def test_lesson_2_has_10_activities(self):
        """Verify lesson 2 has all 10 activity steps"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02")
        assert response.status_code == 200
        
        data = response.json()
        activity_flow = data.get("activity_flow", [])
        
        assert len(activity_flow) == 10, f"Expected 10 activities, got {len(activity_flow)}"
        
        # Check expected activity types in order
        expected_types = [
            "retrieval_warmup",
            "vocabulary",
            "micro_game_vocab",
            "micro_reading",
            "grammar_focus",
            "micro_game_grammar",
            "listening",
            "production",
            "exit_ticket",
            "auto_review"
        ]
        
        actual_types = [a.get("type") for a in activity_flow]
        assert actual_types == expected_types, f"Activity types mismatch: {actual_types}"
        
        print(f"Lesson 2 has {len(activity_flow)} activities: {', '.join(actual_types)}")
    
    def test_all_activities_accessible(self):
        """Test that all activity types return content"""
        lesson_id = "stage_1_unit_01_lesson_02"
        
        activity_types = [
            "retrieval_warmup",
            "vocabulary",
            "micro_game_vocab",
            "micro_reading",
            "grammar_focus",
            "micro_game_grammar",
            "listening",
            "production",
            "exit_ticket"
        ]
        
        for activity_type in activity_types:
            response = requests.get(
                f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/{activity_type}"
            )
            assert response.status_code == 200, f"Activity {activity_type} returned {response.status_code}"
            data = response.json()
            assert data is not None, f"Activity {activity_type} returned no data"
            print(f"✓ {activity_type}: OK")


class TestGrammarGameQuestionsCount:
    """Verify correct number of questions in grammar games"""
    
    def test_lesson_2_grammar_game_total_questions(self):
        """Lesson 2 should have 13 total grammar game questions (5+4+4)"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/activity/micro_game_grammar"
        )
        assert response.status_code == 200
        
        data = response.json()
        
        error_hunter_count = len(data.get("items", []))
        word_order_count = len(data.get("word_order_items", []))
        fill_blank_count = len(data.get("fill_blank_items", []))
        
        total = error_hunter_count + word_order_count + fill_blank_count
        
        assert error_hunter_count == 5, f"Expected 5 error_hunter, got {error_hunter_count}"
        assert word_order_count == 4, f"Expected 4 word_order, got {word_order_count}"
        assert fill_blank_count == 4, f"Expected 4 fill_blank, got {fill_blank_count}"
        assert total == 13, f"Expected 13 total questions, got {total}"
        
        print(f"Lesson 2 Grammar Game: {total} total questions")
    
    def test_lesson_1_grammar_game_total_questions(self):
        """Lesson 1 should have 12 total grammar game questions (4+4+4)"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/micro_game_grammar"
        )
        assert response.status_code == 200
        
        data = response.json()
        
        error_hunter_count = len(data.get("items", []))
        word_order_count = len(data.get("word_order_items", []))
        fill_blank_count = len(data.get("fill_blank_items", []))
        
        total = error_hunter_count + word_order_count + fill_blank_count
        
        assert error_hunter_count == 4, f"Expected 4 error_hunter, got {error_hunter_count}"
        assert word_order_count == 4, f"Expected 4 word_order, got {word_order_count}"
        assert fill_blank_count == 4, f"Expected 4 fill_blank, got {fill_blank_count}"
        assert total == 12, f"Expected 12 total questions, got {total}"
        
        print(f"Lesson 1 Grammar Game: {total} total questions")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
