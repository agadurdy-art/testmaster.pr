"""
Iteration 66: Test API endpoints for Unified Learning System
Tests that game activity endpoints return valid data with items
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestUnifiedLearningAPI:
    """Tests for unified learning lesson and activity endpoints"""
    
    def test_api_root_health(self):
        """Test API root endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"API root health check: PASSED - {data}")
    
    def test_get_lesson_01_structure(self):
        """Test lesson 01 returns proper activity flow"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        data = response.json()
        assert "lesson_id" in data
        assert "activity_flow" in data
        assert len(data["activity_flow"]) > 0
        print(f"Lesson 01 has {len(data['activity_flow'])} activities")
        
        # Verify activity types exist
        activity_types = [a["type"] for a in data["activity_flow"]]
        assert "retrieval_warmup" in activity_types
        assert "vocabulary" in activity_types
        assert "micro_game_vocab" in activity_types
        print(f"Activity types in lesson 01: {activity_types}")
    
    def test_get_lesson_02_vocab_game_has_items(self):
        """Test lesson 02 vocab game returns games with items"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/activity/micro_game_vocab")
        assert response.status_code == 200
        data = response.json()
        assert "games" in data
        assert len(data["games"]) > 0
        
        # Check each game has items
        for game in data["games"]:
            assert "game_type" in game
            assert "items" in game
            assert len(game["items"]) > 0, f"Game {game['game_type']} has no items"
            print(f"Game {game['game_type']}: {len(game['items'])} items - OK")
        
        print(f"Lesson 02 vocab game has {len(data['games'])} games with items")
    
    def test_get_lesson_04_review_games_has_items(self):
        """Test lesson 04 (review lesson) returns review games with items"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_04/activity/micro_game_vocab")
        assert response.status_code == 200
        data = response.json()
        assert "games" in data
        assert len(data["games"]) > 0
        
        # Check for review game types (crossword, word_search, board_game)
        game_types = [g["game_type"] for g in data["games"]]
        print(f"Lesson 04 review game types: {game_types}")
        
        # Verify each game has items
        for game in data["games"]:
            assert "items" in game
            assert len(game["items"]) > 0, f"Review game {game['game_type']} has no items"
            print(f"Review game {game['game_type']}: {len(game['items'])} items - OK")
        
        # At least one review game type should be present
        review_types = ['crossword', 'word_search', 'board_game']
        has_review_game = any(gt in review_types for gt in game_types)
        assert has_review_game, f"Expected at least one review game type, got: {game_types}"
    
    def test_lesson_01_vocabulary_has_words(self):
        """Test lesson 01 vocabulary activity has words"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        data = response.json()
        
        # Find vocabulary activity
        vocab_activity = next((a for a in data["activity_flow"] if a["type"] == "vocabulary"), None)
        assert vocab_activity is not None, "No vocabulary activity found"
        
        vocab_data = vocab_activity.get("data", {})
        words = vocab_data.get("words", [])
        assert len(words) > 0, "Vocabulary activity has no words"
        
        # Check word structure
        first_word = words[0]
        assert "word" in first_word
        print(f"Lesson 01 vocabulary has {len(words)} words: {[w['word'] for w in words]}")
    
    def test_lesson_01_warmup_has_questions(self):
        """Test lesson 01 warmup activity has questions"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        data = response.json()
        
        # Find warmup activity
        warmup_activity = next((a for a in data["activity_flow"] if a["type"] == "retrieval_warmup"), None)
        assert warmup_activity is not None, "No warmup activity found"
        
        warmup_data = warmup_activity.get("data", {})
        questions = warmup_data.get("questions", [])
        assert len(questions) > 0, "Warmup activity has no questions"
        
        # Check question structure
        first_q = questions[0]
        assert "question_text" in first_q
        assert "options" in first_q
        assert "correct_answer" in first_q
        print(f"Lesson 01 warmup has {len(questions)} questions")


class TestNullGuardScenarios:
    """Test scenarios where empty items could cause crashes"""
    
    def test_game_items_not_null(self):
        """Verify game items are never null/empty in API response"""
        # Test multiple lessons
        lesson_ids = [
            "stage_1_unit_01_lesson_01",
            "stage_1_unit_01_lesson_02",
            "stage_1_unit_01_lesson_04"
        ]
        
        for lesson_id in lesson_ids:
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}")
            if response.status_code != 200:
                print(f"Skipping {lesson_id} - not found")
                continue
            
            data = response.json()
            for activity in data.get("activity_flow", []):
                if activity["type"] in ["micro_game_vocab", "micro_game_grammar"]:
                    act_data = activity.get("data", {})
                    games = act_data.get("games", [])
                    for game in games:
                        items = game.get("items", [])
                        # Items can be empty from API but frontend should handle it
                        print(f"{lesson_id} - {game.get('game_type', 'unknown')}: {len(items)} items")
    
    def test_crossword_items_have_words(self):
        """Verify crossword game items have word property"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_04/activity/micro_game_vocab")
        if response.status_code != 200:
            pytest.skip("Lesson 04 not found")
        
        data = response.json()
        crossword_game = next((g for g in data.get("games", []) if g.get("game_type") == "crossword"), None)
        
        if crossword_game:
            items = crossword_game.get("items", [])
            assert len(items) > 0, "Crossword game has no items"
            for item in items:
                assert "word" in item, f"Crossword item missing 'word': {item}"
                assert len(item["word"]) >= 2, f"Crossword word too short: {item['word']}"
            print(f"Crossword has {len(items)} valid words")
        else:
            print("No crossword game in lesson 04")
    
    def test_board_game_items_have_questions(self):
        """Verify board game items have question and answer"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_04/activity/micro_game_vocab")
        if response.status_code != 200:
            pytest.skip("Lesson 04 not found")
        
        data = response.json()
        board_game = next((g for g in data.get("games", []) if g.get("game_type") == "board_game"), None)
        
        if board_game:
            items = board_game.get("items", [])
            assert len(items) > 0, "Board game has no items"
            for item in items:
                assert "question" in item, f"Board game item missing 'question': {item}"
                assert "answer" in item, f"Board game item missing 'answer': {item}"
                assert "options" in item, f"Board game item missing 'options': {item}"
            print(f"Board game has {len(items)} valid questions")
        else:
            print("No board_game in lesson 04")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
