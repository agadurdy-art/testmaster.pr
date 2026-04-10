"""
Unit 4 'Colors Everywhere' Content Verification Tests
Stage 1 - Phonics P-T - 4 Lessons covering colors: red, blue, pink, green, yellow, black, orange
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://prod-security-flows.preview.emergentagent.com')


class TestUnit4Existence:
    """Verify Unit 4 exists and is correctly positioned"""
    
    def test_unit4_in_stage_units_list(self):
        """GET /api/unified/stages/stage_1/units should include Unit 4 'Colors Everywhere'"""
        response = requests.get(f"{BASE_URL}/api/unified/stages/stage_1/units")
        assert response.status_code == 200
        
        data = response.json()
        units = data.get("units", [])
        
        # Find Unit 4
        unit4 = next((u for u in units if u.get("unit_id") == "stage_1_unit_04"), None)
        assert unit4 is not None, "Unit 4 not found in stage units"
        assert unit4.get("title") == "Colors Everywhere", f"Wrong title: {unit4.get('title')}"
        assert unit4.get("unit_number") == 4, f"Wrong unit_number: {unit4.get('unit_number')}"
        print(f"✓ Unit 4 found: '{unit4['title']}' with unit_number={unit4['unit_number']}")
    
    def test_unit4_has_4_lessons(self):
        """GET /api/unified/units/stage_1_unit_04 should return 4 lessons"""
        response = requests.get(f"{BASE_URL}/api/unified/units/stage_1_unit_04")
        assert response.status_code == 200
        
        data = response.json()
        lessons = data.get("lessons", [])
        assert len(lessons) == 4, f"Expected 4 lessons, got {len(lessons)}"
        
        # Verify lesson titles
        expected_titles = [
            "Red, Blue and Pink",
            "Green and Yellow", 
            "Black and Orange",
            "Unit 4 Mastery Check"
        ]
        actual_titles = [l["title"] for l in lessons]
        for expected in expected_titles:
            assert expected in actual_titles, f"Missing lesson: {expected}"
        print(f"✓ All 4 lessons present: {actual_titles}")


class TestLesson1RedBluePink:
    """Verify Lesson 1 content: red, blue, pink, pig, queen"""
    
    def test_warmup_has_video_and_color_question(self):
        """L1 warmup should have YouTube video_url and color question"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_04_lesson_01/activity/retrieval_warmup")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        assert len(questions) >= 1, "No warmup questions"
        
        q = questions[0]
        assert "video_url" in q, "Missing video_url in warmup"
        assert "youtube.com" in q["video_url"], f"Invalid video URL: {q['video_url']}"
        assert q.get("question_text") == "Which one is a color?", f"Wrong question: {q.get('question_text')}"
        assert q.get("correct_answer") == "blue", f"Wrong answer: {q.get('correct_answer')}"
        assert q.get("hint") == "Look at the sky!", f"Wrong hint: {q.get('hint')}"
        print(f"✓ L1 warmup: video_url={q['video_url'][:50]}..., hint='{q['hint']}'")
    
    def test_vocabulary_has_5_words(self):
        """L1 vocabulary should have 5 words: red, blue, pink, pig, queen"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_04_lesson_01/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        words = data.get("words", [])
        assert len(words) == 5, f"Expected 5 words, got {len(words)}"
        
        word_list = [w["word"] for w in words]
        expected = ["red", "blue", "pink", "pig", "queen"]
        for exp in expected:
            assert exp in word_list, f"Missing word: {exp}"
        print(f"✓ L1 vocabulary: {word_list}")
    
    def test_grammar_game_is_word_order(self):
        """L1 grammar game should be word_order mode"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_04_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("game_type") == "word_order", f"Expected word_order, got {data.get('game_type')}"
        assert len(data.get("word_order_items", [])) >= 1, "No word_order_items"
        print(f"✓ L1 grammar game: mode=word_order")


class TestLesson2GreenYellow:
    """Verify Lesson 2 content: green, yellow, rabbit, run"""
    
    def test_vocabulary_has_4_words(self):
        """L2 vocabulary should have 4 words: green, yellow, rabbit, run"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_04_lesson_02/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        words = data.get("words", [])
        assert len(words) == 4, f"Expected 4 words, got {len(words)}"
        
        word_list = [w["word"] for w in words]
        expected = ["green", "yellow", "rabbit", "run"]
        for exp in expected:
            assert exp in word_list, f"Missing word: {exp}"
        print(f"✓ L2 vocabulary: {word_list}")
    
    def test_grammar_game_is_fill_blank(self):
        """L2 grammar game should be fill_blank mode"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_04_lesson_02/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("game_type") == "fill_blank", f"Expected fill_blank, got {data.get('game_type')}"
        assert len(data.get("fill_blank_items", [])) >= 1, "No fill_blank_items"
        print(f"✓ L2 grammar game: mode=fill_blank")


class TestLesson3BlackOrange:
    """Verify Lesson 3 content: black, orange, sun, tiger, ten"""
    
    def test_vocabulary_has_5_words(self):
        """L3 vocabulary should have 5 words: black, orange, sun, tiger, ten"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_04_lesson_03/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        words = data.get("words", [])
        assert len(words) == 5, f"Expected 5 words, got {len(words)}"
        
        word_list = [w["word"] for w in words]
        expected = ["black", "orange", "sun", "tiger", "ten"]
        for exp in expected:
            assert exp in word_list, f"Missing word: {exp}"
        print(f"✓ L3 vocabulary: {word_list}")
    
    def test_grammar_game_is_error_hunter(self):
        """L3 grammar game should be error_hunter mode"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_04_lesson_03/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("game_type") == "error_hunter", f"Expected error_hunter, got {data.get('game_type')}"
        assert len(data.get("items", [])) >= 1, "No error_hunter items"
        print(f"✓ L3 grammar game: mode=error_hunter")


class TestLesson4MasteryReview:
    """Verify Lesson 4 is a review lesson with cumulative content"""
    
    def test_lesson4_is_review(self):
        """L4 should have is_review=true"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_04_lesson_04")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("is_review") == True, f"Expected is_review=True, got {data.get('is_review')}"
        assert data.get("title") == "Unit 4 Mastery Check", f"Wrong title: {data.get('title')}"
        print(f"✓ L4 is review lesson: is_review={data.get('is_review')}")
    
    def test_vocabulary_is_review_with_12_words(self):
        """L4 vocabulary should be is_review=true with 12 review words"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_04_lesson_04/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("is_review") == True, f"Expected is_review=True, got {data.get('is_review')}"
        review_words = data.get("review_words", [])
        assert len(review_words) == 12, f"Expected 12 review words, got {len(review_words)}"
        
        # Verify all colors are included
        colors = ["red", "blue", "pink", "green", "yellow", "black", "orange"]
        for color in colors:
            assert color in review_words, f"Missing color in review: {color}"
        print(f"✓ L4 vocabulary review: {len(review_words)} words including all colors")
    
    def test_grammar_game_is_word_order(self):
        """L4 grammar game should be word_order mode"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_04_lesson_04/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("game_type") == "word_order", f"Expected word_order, got {data.get('game_type')}"
        print(f"✓ L4 grammar game: mode=word_order")


class TestGrammarGameModes:
    """Verify all grammar game modes are correct: L1=word_order, L2=fill_blank, L3=error_hunter, L4=word_order"""
    
    def test_all_grammar_modes_correct(self):
        """Verify all 4 lessons have correct grammar game modes"""
        expected_modes = {
            "stage_1_unit_04_lesson_01": "word_order",
            "stage_1_unit_04_lesson_02": "fill_blank",
            "stage_1_unit_04_lesson_03": "error_hunter",
            "stage_1_unit_04_lesson_04": "word_order"
        }
        
        for lesson_id, expected_mode in expected_modes.items():
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/micro_game_grammar")
            assert response.status_code == 200, f"Failed to get grammar game for {lesson_id}"
            
            data = response.json()
            actual_mode = data.get("game_type")
            assert actual_mode == expected_mode, f"{lesson_id}: expected {expected_mode}, got {actual_mode}"
            print(f"✓ {lesson_id[-2:]}: {actual_mode}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
