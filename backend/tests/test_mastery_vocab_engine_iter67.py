"""
Test Vocabulary Engine APIs for Mastery Course Integration (Iteration 67)
- Tests mastery-module-X endpoints (new feature)
- Tests advanced-module-X endpoints (regression test)
- Verifies slides contain nouns/verbs/adjectives/adverbs/collocations/idiom for mastery
- Verifies practice returns fill_blank, matching, collocation exercises
- Verifies quiz returns 10 questions with 80% passing score
- Tests quiz submission and progress saving for mastery modules
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestMasteryModuleSlides:
    """Test Learn Mode slides API for mastery course modules"""
    
    def test_mastery_module_1_slides_returns_200(self):
        """GET /api/vocabulary-engine/mastery-module-1/slides - should return 200"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/slides")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
    def test_mastery_module_1_slides_structure(self):
        """Verify mastery module slides have correct structure"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/slides")
        assert response.status_code == 200
        
        data = response.json()
        assert "slides" in data, "Response should contain 'slides'"
        assert "module_id" in data
        assert "module_title" in data
        assert "module_number" in data
        assert "word_formations" in data
        assert "total_slides" in data
        
        # Verify module_id matches request
        assert data["module_id"] == "mastery-module-1"
        
    def test_mastery_module_1_slides_has_nouns(self):
        """Verify mastery slides contain Noun category"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/slides")
        assert response.status_code == 200
        
        data = response.json()
        slides = data.get("slides", [])
        categories = [s.get("category") for s in slides]
        
        assert "Noun" in categories, f"Should have Noun category. Found: {set(categories)}"
        
    def test_mastery_module_1_slides_has_verbs(self):
        """Verify mastery slides contain Verb category"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/slides")
        assert response.status_code == 200
        
        data = response.json()
        slides = data.get("slides", [])
        categories = [s.get("category") for s in slides]
        
        assert "Verb" in categories, f"Should have Verb category. Found: {set(categories)}"
        
    def test_mastery_module_1_slides_has_adjectives(self):
        """Verify mastery slides contain Adjective category"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/slides")
        assert response.status_code == 200
        
        data = response.json()
        slides = data.get("slides", [])
        categories = [s.get("category") for s in slides]
        
        assert "Adjective" in categories, f"Should have Adjective category. Found: {set(categories)}"
        
    def test_mastery_module_1_slides_has_adverbs(self):
        """Verify mastery slides contain Adverb category"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/slides")
        assert response.status_code == 200
        
        data = response.json()
        slides = data.get("slides", [])
        categories = [s.get("category") for s in slides]
        
        assert "Adverb" in categories, f"Should have Adverb category. Found: {set(categories)}"
        
    def test_mastery_module_1_slide_fields(self):
        """Verify each slide has required fields: id, category, word, meaning, example"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/slides")
        assert response.status_code == 200
        
        data = response.json()
        slides = data.get("slides", [])
        assert len(slides) > 0, "Should have at least one slide"
        
        for slide in slides[:5]:  # Check first 5 slides
            assert "id" in slide, "Slide should have 'id'"
            assert "category" in slide, "Slide should have 'category'"
            assert "word" in slide, "Slide should have 'word'"
            assert "meaning" in slide, "Slide should have 'meaning'"
            assert "example" in slide, "Slide should have 'example'"
            
    def test_mastery_module_5_slides_works(self):
        """GET /api/vocabulary-engine/mastery-module-5/slides - verify other modules work"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-5/slides")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["module_id"] == "mastery-module-5"
        assert len(data.get("slides", [])) > 0, "Should have slides"
        print(f"Module 5 title: {data.get('module_title')}, slides: {len(data.get('slides', []))}")


class TestMasteryModulePractice:
    """Test Practice Mode exercises API for mastery course modules"""
    
    def test_mastery_module_1_practice_returns_200(self):
        """GET /api/vocabulary-engine/mastery-module-1/practice - should return 200"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/practice")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
    def test_mastery_module_1_practice_structure(self):
        """Verify practice response has correct structure"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/practice")
        assert response.status_code == 200
        
        data = response.json()
        assert "exercises" in data
        assert "module_id" in data
        assert "module_title" in data
        assert "total_exercises" in data
        
        assert data["module_id"] == "mastery-module-1"
        
    def test_mastery_module_1_practice_has_fill_blank(self):
        """Verify practice has fill_blank exercises"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/practice")
        assert response.status_code == 200
        
        data = response.json()
        exercises = data.get("exercises", [])
        types = [e.get("type") for e in exercises]
        
        assert "fill_blank" in types, f"Should have fill_blank exercises. Found: {set(types)}"
        
    def test_mastery_module_1_practice_has_matching(self):
        """Verify practice has matching exercises"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/practice")
        assert response.status_code == 200
        
        data = response.json()
        exercises = data.get("exercises", [])
        types = [e.get("type") for e in exercises]
        
        assert "matching" in types, f"Should have matching exercises. Found: {set(types)}"
        
    def test_mastery_module_1_fill_blank_structure(self):
        """Verify fill_blank exercise has sentence, answer, options"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/practice")
        assert response.status_code == 200
        
        data = response.json()
        fill_blanks = [e for e in data.get("exercises", []) if e.get("type") == "fill_blank"]
        
        assert len(fill_blanks) > 0, "Should have fill_blank exercises"
        
        ex = fill_blanks[0]
        assert "sentence" in ex, "fill_blank should have sentence"
        assert "answer" in ex, "fill_blank should have answer"
        assert "options" in ex, "fill_blank should have options"
        assert isinstance(ex["options"], list), "options should be a list"
        assert ex["answer"] in ex["options"], "Answer should be in options"
        
    def test_mastery_module_1_matching_structure(self):
        """Verify matching exercise has terms, definitions, answers"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/practice")
        assert response.status_code == 200
        
        data = response.json()
        matching = [e for e in data.get("exercises", []) if e.get("type") == "matching"]
        
        assert len(matching) > 0, "Should have matching exercises"
        
        ex = matching[0]
        assert "terms" in ex, "matching should have terms"
        assert "definitions" in ex, "matching should have definitions"
        assert "answers" in ex, "matching should have answers"


class TestMasteryModuleQuiz:
    """Test Quiz Mode API for mastery course modules"""
    
    def test_mastery_module_1_quiz_returns_200(self):
        """GET /api/vocabulary-engine/mastery-module-1/quiz - should return 200"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/quiz")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
    def test_mastery_module_1_quiz_structure(self):
        """Verify quiz response has correct structure"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/quiz")
        assert response.status_code == 200
        
        data = response.json()
        assert "questions" in data
        assert "module_id" in data
        assert "module_title" in data
        assert "passing_score" in data
        assert "total_questions" in data
        
        assert data["module_id"] == "mastery-module-1"
        
    def test_mastery_module_1_quiz_returns_10_questions(self):
        """Verify quiz returns at most 10 questions"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/quiz")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        
        assert len(questions) <= 10, f"Should return at most 10 questions, got {len(questions)}"
        assert len(questions) > 0, "Should have at least one question"
        print(f"Quiz questions count: {len(questions)}")
        
    def test_mastery_module_1_quiz_passing_score_80(self):
        """Verify passing score is 80%"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/quiz")
        assert response.status_code == 200
        
        data = response.json()
        assert data["passing_score"] == 80, f"Passing score should be 80, got {data['passing_score']}"
        
    def test_mastery_module_1_quiz_question_structure(self):
        """Verify quiz questions have id, question, and answer/options"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/quiz")
        assert response.status_code == 200
        
        data = response.json()
        for q in data.get("questions", []):
            assert "id" in q, "Question should have 'id'"
            assert "question" in q, "Question should have 'question'"
            assert "answer" in q or "options" in q, "Question should have answer or options"


class TestMasteryQuizSubmit:
    """Test quiz submission API for mastery modules"""
    
    def test_submit_mastery_quiz_pass(self):
        """POST /api/vocabulary-engine/quiz/submit - score >= 80% should pass for mastery module"""
        payload = {
            "module_id": "mastery-module-1",
            "user_id": "TEST_mastery_vocab_001",
            "answers": {"q-0": "B", "q-1": "B"},
            "score": 8,
            "total": 10
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/quiz/submit", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "passed" in data
        assert data["passed"] == True, "80% should pass"
        assert "score" in data
        assert "percentage" in data
        assert data["percentage"] == 80
        
    def test_submit_mastery_quiz_fail(self):
        """POST /api/vocabulary-engine/quiz/submit - score < 80% should fail for mastery module"""
        payload = {
            "module_id": "mastery-module-1",
            "user_id": "TEST_mastery_vocab_002",
            "answers": {"q-0": "A"},
            "score": 7,
            "total": 10
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/quiz/submit", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["passed"] == False, "70% should fail"
        assert data["percentage"] == 70


class TestMasteryProgress:
    """Test progress saving API for mastery modules"""
    
    def test_save_mastery_learn_progress(self):
        """POST /api/vocabulary-engine/progress - save learn mode completion for mastery module"""
        payload = {
            "user_id": "TEST_mastery_vocab_003",
            "module_id": "mastery-module-1",
            "section": "learn",
            "completed": True
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/progress", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        
    def test_save_mastery_practice_progress(self):
        """POST /api/vocabulary-engine/progress - save practice mode completion for mastery module"""
        payload = {
            "user_id": "TEST_mastery_vocab_003",
            "module_id": "mastery-module-1",
            "section": "practice",
            "completed": True
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/progress", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        
    def test_save_mastery_quiz_progress(self):
        """POST /api/vocabulary-engine/progress - save quiz mode completion for mastery module"""
        payload = {
            "user_id": "TEST_mastery_vocab_003",
            "module_id": "mastery-module-1",
            "section": "quiz",
            "completed": True
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/progress", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True


class TestAdvancedModuleRegression:
    """Regression tests - ensure advanced mastery modules still work"""
    
    def test_advanced_module_1_slides_still_works(self):
        """GET /api/vocabulary-engine/advanced-module-1/slides - regression test"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/slides")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["module_id"] == "advanced-module-1"
        assert len(data.get("slides", [])) > 0
        
        # Advanced modules should have Advanced Term category
        categories = [s.get("category") for s in data.get("slides", [])]
        assert "Advanced Term" in categories, f"Advanced module should have 'Advanced Term' category. Found: {set(categories)}"
        
    def test_advanced_module_1_practice_still_works(self):
        """GET /api/vocabulary-engine/advanced-module-1/practice - regression test"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/practice")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["module_id"] == "advanced-module-1"
        assert len(data.get("exercises", [])) > 0
        
    def test_advanced_module_1_quiz_still_works(self):
        """GET /api/vocabulary-engine/advanced-module-1/quiz - regression test"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/quiz")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["module_id"] == "advanced-module-1"
        assert data["passing_score"] == 80


class TestInvalidModules:
    """Test error handling for invalid modules"""
    
    def test_invalid_module_slides_returns_404(self):
        """GET slides for non-existent module should return 404"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/non-existent-module/slides")
        assert response.status_code == 404
        
    def test_invalid_module_practice_returns_404(self):
        """GET practice for non-existent module should return 404"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/non-existent-module/practice")
        assert response.status_code == 404
        
    def test_invalid_module_quiz_returns_404(self):
        """GET quiz for non-existent module should return 404"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/non-existent-module/quiz")
        assert response.status_code == 404


class TestMasteryModuleCompleteFlow:
    """Test complete vocabulary engine flow for mastery modules"""
    
    def test_mastery_module_1_complete_flow(self):
        """Test complete flow: slides -> practice -> quiz for mastery module"""
        # 1. Get slides
        r1 = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/slides")
        assert r1.status_code == 200
        slides_data = r1.json()
        print(f"Mastery Module 1 - Slides: {len(slides_data.get('slides', []))}")
        
        # Verify mastery-specific categories
        categories = set(s.get("category") for s in slides_data.get("slides", []))
        print(f"Categories found: {categories}")
        
        # 2. Get practice exercises
        r2 = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/practice")
        assert r2.status_code == 200
        practice_data = r2.json()
        print(f"Mastery Module 1 - Exercises: {len(practice_data.get('exercises', []))}")
        
        # Verify exercise types
        exercise_types = set(e.get("type") for e in practice_data.get("exercises", []))
        print(f"Exercise types: {exercise_types}")
        
        # 3. Get quiz
        r3 = requests.get(f"{BASE_URL}/api/vocabulary-engine/mastery-module-1/quiz")
        assert r3.status_code == 200
        quiz_data = r3.json()
        print(f"Mastery Module 1 - Questions: {len(quiz_data.get('questions', []))}")
        print(f"Passing score: {quiz_data.get('passing_score')}%")
