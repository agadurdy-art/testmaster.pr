"""
Test Game Bank API
==================
Tests for the Game Bank mini-games feature including:
- GET /api/games/list - List all game types and topics
- GET /api/games/play/{game_type} - Generate game content
- POST /api/games/submit/{game_id} - Submit game score
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestGameBankList:
    """Test /api/games/list endpoint"""
    
    def test_list_games_returns_200(self):
        """Test that list endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/games/list")
        assert response.status_code == 200
    
    def test_list_games_returns_6_game_types(self):
        """Test that list returns exactly 6 game types"""
        response = requests.get(f"{BASE_URL}/api/games/list")
        data = response.json()
        
        assert "games" in data
        assert len(data["games"]) == 6
        
        # Verify all expected game types
        game_types = [g["type"] for g in data["games"]]
        expected_types = ["matching_pairs", "spelling_bee", "true_false", "word_race", "lucky_wheel", "fishing"]
        for expected in expected_types:
            assert expected in game_types, f"Missing game type: {expected}"
    
    def test_list_games_returns_6_topics(self):
        """Test that list returns exactly 6 topics"""
        response = requests.get(f"{BASE_URL}/api/games/list")
        data = response.json()
        
        assert "topics" in data
        assert len(data["topics"]) == 6
        
        # Verify all expected topics
        expected_topics = ["family", "food", "animals", "colors", "numbers", "school"]
        for expected in expected_topics:
            assert expected in data["topics"], f"Missing topic: {expected}"
    
    def test_list_games_has_required_fields(self):
        """Test that each game has required fields"""
        response = requests.get(f"{BASE_URL}/api/games/list")
        data = response.json()
        
        for game in data["games"]:
            assert "type" in game
            assert "title" in game
            assert "description" in game
            assert "icon" in game
            assert "color" in game


class TestMatchingPairsGame:
    """Test /api/games/play/matching_pairs endpoint"""
    
    def test_matching_pairs_returns_200(self):
        """Test that matching pairs endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/games/play/matching_pairs?topic=family&count=6")
        assert response.status_code == 200
    
    def test_matching_pairs_returns_valid_game(self):
        """Test that matching pairs returns valid game structure"""
        response = requests.get(f"{BASE_URL}/api/games/play/matching_pairs?topic=family&count=6")
        data = response.json()
        
        assert data["success"] == True
        assert "game" in data
        
        game = data["game"]
        assert game["game_type"] == "matching_pairs"
        assert "game_id" in game
        assert "title" in game
        assert "questions" in game
        assert game["time_limit"] == 120
    
    def test_matching_pairs_has_word_meaning_pairs(self):
        """Test that matching pairs has both word and meaning cards"""
        response = requests.get(f"{BASE_URL}/api/games/play/matching_pairs?topic=family&count=6")
        data = response.json()
        
        questions = data["game"]["questions"]
        word_cards = [q for q in questions if q["type"] == "word"]
        meaning_cards = [q for q in questions if q["type"] == "meaning"]
        
        assert len(word_cards) == len(meaning_cards)
        assert len(word_cards) >= 6  # At least 6 pairs


class TestSpellingBeeGame:
    """Test /api/games/play/spelling_bee endpoint"""
    
    def test_spelling_bee_returns_200(self):
        """Test that spelling bee endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/games/play/spelling_bee?topic=animals&count=5")
        assert response.status_code == 200
    
    def test_spelling_bee_returns_valid_game(self):
        """Test that spelling bee returns valid game structure"""
        response = requests.get(f"{BASE_URL}/api/games/play/spelling_bee?topic=animals&count=5")
        data = response.json()
        
        assert data["success"] == True
        game = data["game"]
        assert game["game_type"] == "spelling_bee"
        assert game["time_limit"] == 180
    
    def test_spelling_bee_has_scrambled_words(self):
        """Test that spelling bee has scrambled words with hints"""
        response = requests.get(f"{BASE_URL}/api/games/play/spelling_bee?topic=animals&count=5")
        data = response.json()
        
        for question in data["game"]["questions"]:
            assert "scrambled" in question
            assert "correct_answer" in question
            assert "hint" in question
            assert "image" in question
            assert "letters" in question


class TestTrueFalseGame:
    """Test /api/games/play/true_false endpoint"""
    
    def test_true_false_returns_200(self):
        """Test that true/false endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/games/play/true_false?count=8")
        assert response.status_code == 200
    
    def test_true_false_returns_valid_game(self):
        """Test that true/false returns valid game structure"""
        response = requests.get(f"{BASE_URL}/api/games/play/true_false?count=8")
        data = response.json()
        
        assert data["success"] == True
        game = data["game"]
        assert game["game_type"] == "true_false"
        assert game["time_limit"] == 90
    
    def test_true_false_has_statements(self):
        """Test that true/false has statements with boolean answers"""
        response = requests.get(f"{BASE_URL}/api/games/play/true_false?count=8")
        data = response.json()
        
        for question in data["game"]["questions"]:
            assert "statement" in question
            assert "correct_answer" in question
            assert isinstance(question["correct_answer"], bool)


class TestWordRaceGame:
    """Test /api/games/play/word_race endpoint"""
    
    def test_word_race_returns_200(self):
        """Test that word race endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/games/play/word_race?topic=food&count=6")
        assert response.status_code == 200
    
    def test_word_race_returns_valid_game(self):
        """Test that word race returns valid game structure"""
        response = requests.get(f"{BASE_URL}/api/games/play/word_race?topic=food&count=6")
        data = response.json()
        
        assert data["success"] == True
        game = data["game"]
        assert game["game_type"] == "word_race"
        assert game["time_limit"] == 60
    
    def test_word_race_has_multiple_choice(self):
        """Test that word race has multiple choice options"""
        response = requests.get(f"{BASE_URL}/api/games/play/word_race?topic=food&count=6")
        data = response.json()
        
        for question in data["game"]["questions"]:
            assert "word" in question
            assert "options" in question
            assert "correct_answer" in question
            assert len(question["options"]) == 4  # 4 options per question


class TestLuckyWheelGame:
    """Test /api/games/play/lucky_wheel endpoint"""
    
    def test_lucky_wheel_returns_200(self):
        """Test that lucky wheel endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/games/play/lucky_wheel")
        assert response.status_code == 200
    
    def test_lucky_wheel_returns_valid_game(self):
        """Test that lucky wheel returns valid game structure"""
        response = requests.get(f"{BASE_URL}/api/games/play/lucky_wheel")
        data = response.json()
        
        assert data["success"] == True
        game = data["game"]
        assert game["game_type"] == "lucky_wheel"
        assert game["time_limit"] is None  # No time limit for lucky wheel
    
    def test_lucky_wheel_has_points(self):
        """Test that lucky wheel questions have point values"""
        response = requests.get(f"{BASE_URL}/api/games/play/lucky_wheel")
        data = response.json()
        
        for question in data["game"]["questions"]:
            assert "points" in question
            assert question["points"] in [10, 20, 30, 50]


class TestFishingGame:
    """Test /api/games/play/fishing endpoint"""
    
    def test_fishing_returns_200(self):
        """Test that fishing endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/games/play/fishing?topic=school&count=6")
        assert response.status_code == 200
    
    def test_fishing_returns_valid_game(self):
        """Test that fishing returns valid game structure"""
        response = requests.get(f"{BASE_URL}/api/games/play/fishing?topic=school&count=6")
        data = response.json()
        
        assert data["success"] == True
        game = data["game"]
        assert game["game_type"] == "fishing"
        assert game["time_limit"] == 120
    
    def test_fishing_has_fish_options(self):
        """Test that fishing has fish options to catch"""
        response = requests.get(f"{BASE_URL}/api/games/play/fishing?topic=school&count=6")
        data = response.json()
        
        for question in data["game"]["questions"]:
            assert "target_meaning" in question
            assert "fish" in question
            assert "correct_fish" in question
            assert len(question["fish"]) == 4  # 4 fish options


class TestGameScoreSubmission:
    """Test /api/games/submit/{game_id} endpoint"""
    
    def test_submit_score_returns_200(self):
        """Test that score submission returns 200"""
        response = requests.post(
            f"{BASE_URL}/api/games/submit/test_game_123?score=8&total=10&time_taken=45"
        )
        assert response.status_code == 200
    
    def test_submit_score_returns_stars(self):
        """Test that score submission returns star rating"""
        response = requests.post(
            f"{BASE_URL}/api/games/submit/test_game_123?score=9&total=10&time_taken=30"
        )
        data = response.json()
        
        assert data["success"] == True
        assert "stars" in data
        assert "message" in data
        assert "percentage" in data
    
    def test_submit_perfect_score_gets_3_stars(self):
        """Test that 90%+ score gets 3 stars"""
        response = requests.post(
            f"{BASE_URL}/api/games/submit/test_game_123?score=10&total=10&time_taken=30"
        )
        data = response.json()
        
        assert data["stars"] == 3
        assert data["percentage"] == 100.0
    
    def test_submit_good_score_gets_2_stars(self):
        """Test that 70-89% score gets 2 stars"""
        response = requests.post(
            f"{BASE_URL}/api/games/submit/test_game_123?score=8&total=10&time_taken=30"
        )
        data = response.json()
        
        assert data["stars"] == 2
        assert data["percentage"] == 80.0
    
    def test_submit_average_score_gets_1_star(self):
        """Test that 50-69% score gets 1 star"""
        response = requests.post(
            f"{BASE_URL}/api/games/submit/test_game_123?score=6&total=10&time_taken=30"
        )
        data = response.json()
        
        assert data["stars"] == 1
        assert data["percentage"] == 60.0


class TestInvalidGameType:
    """Test error handling for invalid game types"""
    
    def test_invalid_game_type_returns_400(self):
        """Test that invalid game type returns 400"""
        response = requests.get(f"{BASE_URL}/api/games/play/invalid_game_type")
        assert response.status_code == 400


class TestAllTopics:
    """Test that all topics work for applicable games"""
    
    @pytest.mark.parametrize("topic", ["family", "food", "animals", "colors", "numbers", "school"])
    def test_matching_pairs_all_topics(self, topic):
        """Test matching pairs works for all topics"""
        response = requests.get(f"{BASE_URL}/api/games/play/matching_pairs?topic={topic}&count=4")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
    
    @pytest.mark.parametrize("topic", ["family", "food", "animals", "colors", "numbers", "school"])
    def test_word_race_all_topics(self, topic):
        """Test word race works for all topics"""
        response = requests.get(f"{BASE_URL}/api/games/play/word_race?topic={topic}&count=4")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
