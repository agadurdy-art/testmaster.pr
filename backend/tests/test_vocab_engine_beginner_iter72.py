"""
Test Vocabulary Engine Beginner Course Integration - Iteration 72
Tests the fixed vocabulary engine endpoints for beginner lessons.
Beginner vocabulary is a list [{word, meaning, example}] unlike mastery/advanced (dict).
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestVocabularyEngineBeginnerSlides:
    """Test GET /api/vocabulary-engine/{module_id}/slides for beginner lessons"""
    
    def test_beginner_lesson_1_slides_returns_200(self):
        """Beginner lesson 1 slides endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/beginner-lesson-1/slides")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "slides" in data, "Response should contain 'slides' array"
        assert "module_id" in data, "Response should contain 'module_id'"
        assert "module_title" in data, "Response should contain 'module_title'"
        assert "total_slides" in data, "Response should contain 'total_slides'"
        
        # Validate slides array is not empty
        assert len(data["slides"]) > 0, "Slides array should not be empty"
        
        # Validate slide structure
        slide = data["slides"][0]
        assert "id" in slide, "Slide should have 'id'"
        assert "word" in slide, "Slide should have 'word'"
        assert "meaning" in slide, "Slide should have 'meaning'"
        assert "example" in slide, "Slide should have 'example'"
        assert "category" in slide, "Slide should have 'category'"
        
        print(f"✓ Beginner lesson 1 slides: {len(data['slides'])} slides returned")
    
    def test_beginner_lesson_14_slides_returns_200(self):
        """Last beginner lesson (14) slides endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/beginner-lesson-14/slides")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "slides" in data, "Response should contain 'slides' array"
        assert len(data["slides"]) > 0, "Slides array should not be empty"
        
        print(f"✓ Beginner lesson 14 slides: {len(data['slides'])} slides returned")
    
    def test_beginner_slides_word_formation_guard(self):
        """Slides endpoint should handle word_formation safely (isinstance check)"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/beginner-lesson-1/slides")
        assert response.status_code == 200
        data = response.json()
        
        # word_formations should be empty or a list for beginner (no word formation data)
        assert "word_formations" in data, "Response should contain 'word_formations'"
        assert isinstance(data["word_formations"], list), "word_formations should be a list"
        
        print(f"✓ word_formations guard working: {len(data.get('word_formations', []))} formations")


class TestVocabularyEngineBeginnerPractice:
    """Test GET /api/vocabulary-engine/{module_id}/practice for beginner lessons"""
    
    def test_beginner_lesson_1_practice_returns_200(self):
        """Beginner lesson 1 practice endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/beginner-lesson-1/practice")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "exercises" in data, "Response should contain 'exercises' array"
        assert "module_id" in data, "Response should contain 'module_id'"
        assert "total_exercises" in data, "Response should contain 'total_exercises'"
        
        # Validate exercises array is not empty
        assert len(data["exercises"]) > 0, "Exercises array should not be empty"
        
        print(f"✓ Beginner lesson 1 practice: {len(data['exercises'])} exercises returned")
    
    def test_beginner_practice_exercise_schema(self):
        """Practice exercises should have correct schema: answer, id, instruction"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/beginner-lesson-1/practice")
        assert response.status_code == 200
        data = response.json()
        
        exercises = data["exercises"]
        assert len(exercises) > 0, "Should have exercises"
        
        # Check each exercise has required fields
        for i, ex in enumerate(exercises):
            assert "id" in ex, f"Exercise {i} should have 'id'"
            assert "type" in ex, f"Exercise {i} should have 'type'"
            assert "instruction" in ex, f"Exercise {i} should have 'instruction'"
            assert "answer" in ex, f"Exercise {i} should have 'answer' (not 'correct')"
            
            # Validate exercise types
            assert ex["type"] in ["fill_blank", "meaning_match"], f"Exercise {i} has unexpected type: {ex['type']}"
        
        print(f"✓ All {len(exercises)} exercises have correct schema (id, type, instruction, answer)")
    
    def test_beginner_practice_fill_blank_type(self):
        """Fill blank exercises should have sentence and options"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/beginner-lesson-1/practice")
        assert response.status_code == 200
        data = response.json()
        
        fill_blank_exercises = [ex for ex in data["exercises"] if ex["type"] == "fill_blank"]
        
        if fill_blank_exercises:
            ex = fill_blank_exercises[0]
            assert "sentence" in ex, "Fill blank should have 'sentence'"
            assert "options" in ex, "Fill blank should have 'options'"
            assert "answer" in ex, "Fill blank should have 'answer'"
            assert len(ex["options"]) >= 2, "Fill blank should have at least 2 options"
            print(f"✓ Fill blank exercises: {len(fill_blank_exercises)} found with correct structure")
        else:
            print("⚠ No fill_blank exercises found")
    
    def test_beginner_practice_meaning_match_type(self):
        """Meaning match exercises should have word and options"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/beginner-lesson-1/practice")
        assert response.status_code == 200
        data = response.json()
        
        meaning_match_exercises = [ex for ex in data["exercises"] if ex["type"] == "meaning_match"]
        
        if meaning_match_exercises:
            ex = meaning_match_exercises[0]
            assert "word" in ex, "Meaning match should have 'word'"
            assert "options" in ex, "Meaning match should have 'options'"
            assert "answer" in ex, "Meaning match should have 'answer'"
            print(f"✓ Meaning match exercises: {len(meaning_match_exercises)} found with correct structure")
        else:
            print("⚠ No meaning_match exercises found")


class TestVocabularyEngineBeginnerQuiz:
    """Test GET /api/vocabulary-engine/{module_id}/quiz for beginner lessons"""
    
    def test_beginner_lesson_1_quiz_returns_200(self):
        """Beginner lesson 1 quiz endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/beginner-lesson-1/quiz")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "questions" in data, "Response should contain 'questions' array"
        assert "module_id" in data, "Response should contain 'module_id'"
        assert "total_questions" in data, "Response should contain 'total_questions'"
        
        # Validate questions array
        assert len(data["questions"]) > 0, "Questions array should not be empty"
        
        print(f"✓ Beginner lesson 1 quiz: {len(data['questions'])} questions returned")
    
    def test_beginner_quiz_question_schema(self):
        """Quiz questions should have correct schema"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/beginner-lesson-1/quiz")
        assert response.status_code == 200
        data = response.json()
        
        questions = data["questions"]
        assert len(questions) > 0, "Should have questions"
        
        for i, q in enumerate(questions):
            assert "id" in q, f"Question {i} should have 'id'"
            assert "question" in q, f"Question {i} should have 'question'"
            assert "options" in q, f"Question {i} should have 'options'"
            assert "correct_answer" in q, f"Question {i} should have 'correct_answer'"
            assert len(q["options"]) >= 2, f"Question {i} should have at least 2 options"
        
        print(f"✓ All {len(questions)} quiz questions have correct schema")


class TestVocabularyEngineRegressionMastery:
    """Regression tests for mastery course vocabulary engine"""
    
    def test_mastery_module_1_slides_returns_200(self):
        """Mastery module 1 slides should still work"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/slides")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "slides" in data, "Response should contain 'slides'"
        print(f"✓ Mastery module 1 slides: {len(data.get('slides', []))} slides returned")
    
    def test_mastery_module_1_practice_returns_200(self):
        """Mastery module 1 practice should still work"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/practice")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "exercises" in data, "Response should contain 'exercises'"
        print(f"✓ Mastery module 1 practice: {len(data.get('exercises', []))} exercises returned")


class TestVocabularyEngineRegressionAdvanced:
    """Regression tests for advanced course vocabulary engine"""
    
    def test_advanced_module_1_slides_returns_200(self):
        """Advanced module 1 slides should still work"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/slides")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "slides" in data, "Response should contain 'slides'"
        print(f"✓ Advanced module 1 slides: {len(data.get('slides', []))} slides returned")
    
    def test_advanced_module_1_practice_returns_200(self):
        """Advanced module 1 practice should still work"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/practice")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "exercises" in data, "Response should contain 'exercises'"
        print(f"✓ Advanced module 1 practice: {len(data.get('exercises', []))} exercises returned")


class TestVocabularyEngineNotFound:
    """Test 404 handling for non-existent modules"""
    
    def test_nonexistent_module_returns_404(self):
        """Non-existent module should return 404"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/nonexistent-module-999/slides")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent module returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
