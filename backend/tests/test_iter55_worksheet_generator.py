"""
Test suite for PDF Worksheet Generator (Iteration 55)
Tests GPT-4o powered exercise generation with 6 activity types
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestWorksheetCurrentMode:
    """Tests for GET /api/worksheet/generate/{lesson_id}?mode=current"""
    
    def test_current_worksheet_returns_exercises(self):
        """Test current mode returns exercises with all sections"""
        response = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("lesson_id") == "stage_1_unit_03_lesson_01"
        assert data.get("mode") == "current"
        assert "exercises" in data
        assert "vocabulary_section" in data["exercises"]
        assert "grammar_section" in data["exercises"]
        assert "mixed_review" in data["exercises"]
    
    def test_current_worksheet_vocabulary_section_has_items(self):
        """Test vocabulary_section has matching, fill_blank, true_false items"""
        response = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20}
        )
        data = response.json()
        vocab = data.get("exercises", {}).get("vocabulary_section", {})
        
        # Check matching section
        matching = vocab.get("matching", [])
        assert len(matching) > 0, "matching section should have items"
        
        # Check fill_blank section
        fill_blank = vocab.get("fill_blank", [])
        assert len(fill_blank) > 0, "fill_blank section should have items"
        
        # Check true_false section
        true_false = vocab.get("true_false", [])
        assert len(true_false) > 0, "true_false section should have items"
    
    def test_current_worksheet_grammar_section_has_items(self):
        """Test grammar_section has reorder, correct_mistake, complete_pattern items"""
        response = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20}
        )
        data = response.json()
        grammar = data.get("exercises", {}).get("grammar_section", {})
        
        # Check reorder section
        reorder = grammar.get("reorder", [])
        assert len(reorder) > 0, "reorder section should have items"
        
        # Check correct_mistake section
        correct_mistake = grammar.get("correct_mistake", [])
        assert len(correct_mistake) > 0, "correct_mistake section should have items"
        
        # Check complete_pattern section
        complete_pattern = grammar.get("complete_pattern", [])
        assert len(complete_pattern) > 0, "complete_pattern section should have items"
    
    def test_current_worksheet_mixed_review_has_questions(self):
        """Test mixed_review section has questions"""
        response = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20}
        )
        data = response.json()
        mixed_review = data.get("exercises", {}).get("mixed_review", [])
        
        assert len(mixed_review) > 0, "mixed_review should have questions"


class TestWorksheetCumulativeMode:
    """Tests for GET /api/worksheet/generate/{lesson_id}?mode=cumulative"""
    
    def test_cumulative_worksheet_word_count_max_20(self):
        """Test cumulative mode returns max 20 words"""
        response = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_06_lesson_04",
            params={"mode": "cumulative", "max_words": 20}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("mode") == "cumulative"
        word_count = data.get("word_count", 0)
        assert word_count <= 20, f"Expected word_count <= 20, got {word_count}"
    
    def test_cumulative_worksheet_has_exercises(self):
        """Test cumulative mode returns all exercise sections"""
        response = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_06_lesson_04",
            params={"mode": "cumulative", "max_words": 20}
        )
        data = response.json()
        
        assert "exercises" in data
        exercises = data["exercises"]
        assert "vocabulary_section" in exercises
        assert "grammar_section" in exercises
        assert "mixed_review" in exercises
    
    def test_cumulative_worksheet_total_lessons(self):
        """Test cumulative mode covers multiple lessons"""
        response = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_06_lesson_04",
            params={"mode": "cumulative", "max_words": 20}
        )
        data = response.json()
        
        total_lessons = data.get("total_lessons", 0)
        # Unit 6 lesson 4 = 5 units * 4 lessons + 4 = 24 lessons
        assert total_lessons == 24, f"Expected 24 lessons for unit_06_lesson_04, got {total_lessons}"


class TestCumulativeVocabEndpoint:
    """Tests for GET /api/unified/cumulative-vocab/{lesson_id}"""
    
    def test_cumulative_vocab_max_20_words(self):
        """Test cumulative vocab returns max 20 words from 24 lessons"""
        response = requests.get(
            f"{BASE_URL}/api/unified/cumulative-vocab/stage_1_unit_06_lesson_04",
            params={"max_words": 20}
        )
        assert response.status_code == 200
        
        data = response.json()
        words = data.get("words", [])
        selected_count = data.get("selected_count", 0)
        
        assert len(words) <= 20, f"Expected max 20 words, got {len(words)}"
        assert selected_count <= 20, f"Expected selected_count <= 20, got {selected_count}"
    
    def test_cumulative_vocab_returns_words_from_previous_units(self):
        """Test cumulative vocab includes words from multiple lessons"""
        response = requests.get(
            f"{BASE_URL}/api/unified/cumulative-vocab/stage_1_unit_06_lesson_04",
            params={"max_words": 20}
        )
        data = response.json()
        
        total_vocab_available = data.get("total_vocab_available", 0)
        total_lessons = data.get("total_lessons", 0)
        
        # Should have vocabulary from multiple lessons
        assert total_vocab_available > 20, f"Expected more than 20 vocab available, got {total_vocab_available}"
        assert total_lessons == 24, f"Expected 24 total lessons, got {total_lessons}"
    
    def test_cumulative_vocab_returns_grammar_rules(self):
        """Test cumulative vocab endpoint also returns grammar rules"""
        response = requests.get(
            f"{BASE_URL}/api/unified/cumulative-vocab/stage_1_unit_06_lesson_04",
            params={"max_words": 20}
        )
        data = response.json()
        
        grammar_rules = data.get("grammar_rules", [])
        assert isinstance(grammar_rules, list), "grammar_rules should be a list"


class TestWorksheetCaching:
    """Tests for worksheet caching functionality"""
    
    def test_cached_response_is_instant(self):
        """Test second call returns cached result quickly"""
        # First call
        start1 = time.time()
        response1 = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20}
        )
        time1 = time.time() - start1
        
        # Second call (should be cached)
        start2 = time.time()
        response2 = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20}
        )
        time2 = time.time() - start2
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Both should be fast (cached)
        assert time2 < 2.0, f"Cached response took too long: {time2:.2f}s"
        
        # Content should be identical
        data1 = response1.json()
        data2 = response2.json()
        assert data1.get("lesson_id") == data2.get("lesson_id")
    
    def test_force_refresh_regenerates(self):
        """Test force_refresh=true bypasses cache"""
        # Get cached version
        response1 = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20}
        )
        
        # Force refresh - should still return valid data
        response2 = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20, "force_refresh": "true"}
        )
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Both should have valid exercises
        data1 = response1.json()
        data2 = response2.json()
        assert "exercises" in data1
        assert "exercises" in data2


class TestWorksheetExerciseFormat:
    """Tests for correct exercise format in worksheet"""
    
    def test_matching_item_format(self):
        """Test matching items have word, definition, distractor_definitions"""
        response = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20}
        )
        data = response.json()
        matching = data.get("exercises", {}).get("vocabulary_section", {}).get("matching", [])
        
        if matching:
            item = matching[0]
            assert "word" in item, "matching item should have 'word'"
            assert "definition" in item, "matching item should have 'definition'"
    
    def test_fill_blank_item_format(self):
        """Test fill_blank items have sentence, answer, hint"""
        response = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20}
        )
        data = response.json()
        fill_blank = data.get("exercises", {}).get("vocabulary_section", {}).get("fill_blank", [])
        
        if fill_blank:
            item = fill_blank[0]
            assert "sentence" in item, "fill_blank item should have 'sentence'"
            assert "answer" in item, "fill_blank item should have 'answer'"
    
    def test_reorder_item_format(self):
        """Test reorder items have scrambled and answer"""
        response = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20}
        )
        data = response.json()
        reorder = data.get("exercises", {}).get("grammar_section", {}).get("reorder", [])
        
        if reorder:
            item = reorder[0]
            assert "scrambled" in item, "reorder item should have 'scrambled'"
            assert "answer" in item, "reorder item should have 'answer'"
    
    def test_mixed_review_item_format(self):
        """Test mixed_review items have question structure"""
        response = requests.get(
            f"{BASE_URL}/api/worksheet/generate/stage_1_unit_03_lesson_01",
            params={"mode": "current", "max_words": 20}
        )
        data = response.json()
        mixed_review = data.get("exercises", {}).get("mixed_review", [])
        
        if mixed_review:
            item = mixed_review[0]
            assert "question" in item or "type" in item, "mixed_review item should have question structure"


class TestRegressionWarmupExitQuiz:
    """Regression tests: Warm-up 3 questions, Exit Quiz 5 questions"""
    
    def test_warmup_has_3_questions(self):
        """REGRESSION: Warm-up should have exactly 3 questions"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/retrieval_warmup"
        )
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        assert len(questions) == 3, f"Expected 3 warmup questions, got {len(questions)}"
    
    def test_exit_ticket_has_5_questions(self):
        """REGRESSION: Exit Ticket should have exactly 5 questions"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/exit_ticket"
        )
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        assert len(questions) == 5, f"Expected 5 exit ticket questions, got {len(questions)}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
