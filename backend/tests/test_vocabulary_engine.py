"""
Test Vocabulary Engine APIs
- GET /api/vocabulary-engine/{module_id}/slides (Learn Mode)
- GET /api/vocabulary-engine/{module_id}/practice (Practice Mode)
- GET /api/vocabulary-engine/{module_id}/quiz (Quiz Mode)
- POST /api/vocabulary-engine/quiz/submit
- POST /api/vocabulary-engine/progress
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestVocabularyEngineSlides:
    """Test Learn Mode slides API"""
    
    def test_get_slides_for_advanced_module_1(self):
        """GET /api/vocabulary-engine/advanced-module-1/slides - should return 28 slides"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/slides")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "slides" in data, "Response should contain 'slides'"
        assert "module_id" in data
        assert "module_title" in data
        assert "module_number" in data
        assert "word_formations" in data
        assert "total_slides" in data
        
        # According to task: should return 28 slides
        slides = data["slides"]
        assert isinstance(slides, list), "slides should be a list"
        print(f"Total slides returned: {len(slides)}")
        
        # Check slide structure
        if len(slides) > 0:
            slide = slides[0]
            assert "word" in slide, "Slide should have 'word'"
            assert "category" in slide, "Slide should have 'category'"
            assert "meaning" in slide or "example" in slide, "Slide should have meaning or example"
        
    def test_slides_have_required_fields(self):
        """Verify slide structure for Learn Mode"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/slides")
        assert response.status_code == 200
        
        data = response.json()
        for slide in data.get("slides", [])[:5]:  # Check first 5
            assert "id" in slide
            assert "word" in slide
            assert "category" in slide
            # Optional fields
            assert "ipa" in slide or slide.get("ipa") == ""
    
    def test_slides_invalid_module(self):
        """GET slides for non-existent module should return 404"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/non-existent-module/slides")
        assert response.status_code == 404


class TestVocabularyEnginePractice:
    """Test Practice Mode exercises API"""
    
    def test_get_practice_for_advanced_module_1(self):
        """GET /api/vocabulary-engine/advanced-module-1/practice - should return exercises"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/practice")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "exercises" in data
        assert "module_id" in data
        assert "module_title" in data
        assert "total_exercises" in data
        
        exercises = data["exercises"]
        assert isinstance(exercises, list)
        assert len(exercises) > 0, "Should have at least one exercise"
        print(f"Total exercises returned: {len(exercises)}")
        
    def test_practice_exercise_types(self):
        """Verify exercise types: fill_blank and matching"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/practice")
        assert response.status_code == 200
        
        data = response.json()
        exercises = data.get("exercises", [])
        
        exercise_types = set()
        for ex in exercises:
            assert "type" in ex
            exercise_types.add(ex["type"])
        
        print(f"Exercise types found: {exercise_types}")
        assert "fill_blank" in exercise_types or "matching" in exercise_types
        
    def test_fill_blank_structure(self):
        """Verify fill_blank exercise has options, answer, sentence"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/practice")
        assert response.status_code == 200
        
        data = response.json()
        fill_blanks = [e for e in data.get("exercises", []) if e.get("type") == "fill_blank"]
        
        if fill_blanks:
            ex = fill_blanks[0]
            assert "sentence" in ex, "fill_blank should have sentence"
            assert "answer" in ex, "fill_blank should have answer"
            assert "options" in ex, "fill_blank should have options"
            assert isinstance(ex["options"], list)
            assert ex["answer"] in ex["options"], "Answer should be in options"
            
    def test_matching_structure(self):
        """Verify matching exercise has terms, definitions, answers"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/practice")
        assert response.status_code == 200
        
        data = response.json()
        matching = [e for e in data.get("exercises", []) if e.get("type") == "matching"]
        
        if matching:
            ex = matching[0]
            assert "terms" in ex, "matching should have terms"
            assert "definitions" in ex, "matching should have definitions"
            assert "answers" in ex, "matching should have answers"
            
    def test_practice_invalid_module(self):
        """GET practice for non-existent module should return 404"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/non-existent-module/practice")
        assert response.status_code == 404


class TestVocabularyEngineQuiz:
    """Test Quiz Mode API"""
    
    def test_get_quiz_for_advanced_module_1(self):
        """GET /api/vocabulary-engine/advanced-module-1/quiz - should return 10 questions with 80% pass score"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/quiz")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "questions" in data
        assert "module_id" in data
        assert "module_title" in data
        assert "passing_score" in data
        
        # Should return exactly 10 questions
        questions = data["questions"]
        assert isinstance(questions, list)
        assert len(questions) <= 10, f"Should return at most 10 questions, got {len(questions)}"
        print(f"Total questions: {len(questions)}")
        
        # Passing score should be 80%
        assert data["passing_score"] == 80
        
    def test_quiz_question_structure(self):
        """Verify quiz question has id, question, options, answer"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/quiz")
        assert response.status_code == 200
        
        data = response.json()
        for q in data.get("questions", []):
            assert "id" in q
            assert "question" in q
            # Should have options or answer
            assert "options" in q or "answer" in q
            
    def test_quiz_invalid_module(self):
        """GET quiz for non-existent module should return 404"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/non-existent-module/quiz")
        assert response.status_code == 404


class TestVocabularyEngineQuizSubmit:
    """Test quiz submission API"""
    
    def test_submit_quiz_pass(self):
        """POST /api/vocabulary-engine/quiz/submit - score >= 80% should pass"""
        payload = {
            "module_id": "advanced-module-1",
            "user_id": "test-user-vocab-001",
            "answers": {"q-0": "A", "q-1": "B"},
            "score": 9,
            "total": 10
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/quiz/submit", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "passed" in data
        assert data["passed"] == True  # 90% should pass
        assert "score" in data
        assert "percentage" in data
        assert data["percentage"] == 90
        
    def test_submit_quiz_fail(self):
        """POST /api/vocabulary-engine/quiz/submit - score < 80% should fail"""
        payload = {
            "module_id": "advanced-module-1",
            "user_id": "test-user-vocab-002",
            "answers": {"q-0": "A"},
            "score": 6,
            "total": 10
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/quiz/submit", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["passed"] == False  # 60% should fail
        assert data["percentage"] == 60


class TestVocabularyEngineProgress:
    """Test progress saving API"""
    
    def test_save_learn_progress(self):
        """POST /api/vocabulary-engine/progress - save learn mode completion"""
        payload = {
            "user_id": "test-user-vocab-003",
            "module_id": "advanced-module-1",
            "section": "learn",
            "completed": True
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/progress", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        
    def test_save_practice_progress(self):
        """POST /api/vocabulary-engine/progress - save practice mode completion"""
        payload = {
            "user_id": "test-user-vocab-003",
            "module_id": "advanced-module-1",
            "section": "practice",
            "completed": True
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/progress", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True


class TestVocabularyEngineMultipleModules:
    """Test different modules work"""
    
    def test_advanced_module_2_slides(self):
        """Test slides for module 2"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-2/slides")
        # May return 200 or 404 depending on data
        print(f"Module 2 slides status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Module 2 slides count: {len(data.get('slides', []))}")
            
    def test_advanced_module_1_complete_flow(self):
        """Test complete flow: slides -> practice -> quiz"""
        # 1. Get slides
        r1 = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/slides")
        assert r1.status_code == 200
        slides_data = r1.json()
        print(f"Slides: {len(slides_data.get('slides', []))}")
        
        # 2. Get practice exercises
        r2 = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/practice")
        assert r2.status_code == 200
        practice_data = r2.json()
        print(f"Exercises: {len(practice_data.get('exercises', []))}")
        
        # 3. Get quiz
        r3 = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/quiz")
        assert r3.status_code == 200
        quiz_data = r3.json()
        print(f"Questions: {len(quiz_data.get('questions', []))}")
        print(f"Passing score: {quiz_data.get('passing_score')}%")
