"""
Grammar Engine API Tests - Iteration 70
Tests the 5-stage Grammar Practice Engine:
1. Learn - 7 slide types
2. Practice - 4 sections (Recognition, Gap Fill, Transformation, Error Correction)
3. Quiz - 10 questions with timer
4. Guided Production - Scaffolded prompts with word bank
5. Free Production - Open-ended prompts
Plus: Translation and Evaluation endpoints
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://prod-security-flows.preview.emergentagent.com')

class TestGrammarEngineLearn:
    """Test Grammar Engine Learn Stage (Stage 1)"""
    
    def test_learn_endpoint_returns_200(self):
        """GET /api/grammar-engine/mastery-module-1/learn returns 200"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/learn")
        assert response.status_code == 200
        print("✓ Learn endpoint returns 200")
    
    def test_learn_has_slides_array(self):
        """Learn response contains slides array"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/learn")
        data = response.json()
        assert "slides" in data
        assert isinstance(data["slides"], list)
        assert len(data["slides"]) >= 7, f"Expected at least 7 slides, got {len(data['slides'])}"
        print(f"✓ Learn has {len(data['slides'])} slides")
    
    def test_learn_has_all_7_slide_types(self):
        """Learn response contains all 7 required slide types"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/learn")
        data = response.json()
        slides = data.get("slides", [])
        
        required_types = [
            "context_discovery", "form", "meaning", "examples",
            "common_mistakes", "ielts_tip", "concept_check"
        ]
        
        found_types = [s.get("type") for s in slides]
        
        for req_type in required_types:
            assert req_type in found_types, f"Missing slide type: {req_type}"
            print(f"  ✓ Found slide type: {req_type}")
        
        print("✓ All 7 slide types present")
    
    def test_learn_has_title_and_module_topic(self):
        """Learn response has title and module_topic"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/learn")
        data = response.json()
        assert "title" in data
        assert "module_topic" in data
        print(f"✓ Title: {data['title']}, Topic: {data['module_topic']}")


class TestGrammarEnginePractice:
    """Test Grammar Engine Practice Stage (Stage 2)"""
    
    def test_practice_endpoint_returns_200(self):
        """GET /api/grammar-engine/mastery-module-1/practice returns 200"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/practice")
        assert response.status_code == 200
        print("✓ Practice endpoint returns 200")
    
    def test_practice_has_sections_array(self):
        """Practice response contains sections array"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/practice")
        data = response.json()
        assert "sections" in data
        assert isinstance(data["sections"], list)
        assert len(data["sections"]) >= 4, f"Expected at least 4 sections, got {len(data['sections'])}"
        print(f"✓ Practice has {len(data['sections'])} sections")
    
    def test_practice_has_all_4_section_types(self):
        """Practice response contains all 4 required section types"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/practice")
        data = response.json()
        sections = data.get("sections", [])
        
        required_types = ["recognition", "gap_fill", "transformation", "error_correction"]
        found_types = [s.get("type") for s in sections]
        
        for req_type in required_types:
            assert req_type in found_types, f"Missing section type: {req_type}"
            print(f"  ✓ Found section type: {req_type}")
        
        print("✓ All 4 section types present")
    
    def test_practice_sections_have_items(self):
        """Each practice section has items array"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/practice")
        data = response.json()
        sections = data.get("sections", [])
        
        for section in sections:
            assert "items" in section, f"Section {section.get('type')} missing items"
            assert len(section["items"]) > 0, f"Section {section.get('type')} has no items"
        
        print("✓ All sections have items")


class TestGrammarEngineQuiz:
    """Test Grammar Engine Quiz Stage (Stage 3)"""
    
    def test_quiz_endpoint_returns_200(self):
        """GET /api/grammar-engine/mastery-module-1/quiz returns 200"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/quiz")
        assert response.status_code == 200
        print("✓ Quiz endpoint returns 200")
    
    def test_quiz_has_questions_array(self):
        """Quiz response contains questions array"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/quiz")
        data = response.json()
        assert "questions" in data
        assert isinstance(data["questions"], list)
        assert len(data["questions"]) >= 10, f"Expected at least 10 questions, got {len(data['questions'])}"
        print(f"✓ Quiz has {len(data['questions'])} questions")
    
    def test_quiz_has_timer_settings(self):
        """Quiz response has time_limit_seconds and pass_threshold"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/quiz")
        data = response.json()
        assert "time_limit_seconds" in data
        assert "pass_threshold" in data
        assert data["time_limit_seconds"] > 0
        print(f"✓ Quiz timer: {data['time_limit_seconds']}s, pass: {data['pass_threshold']}%")
    
    def test_quiz_questions_have_required_fields(self):
        """Quiz questions have id, type, and difficulty"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/quiz")
        data = response.json()
        questions = data.get("questions", [])
        
        for q in questions:
            assert "id" in q, "Question missing id"
            assert "type" in q, "Question missing type"
            assert "difficulty" in q, "Question missing difficulty"
        
        print("✓ All questions have required fields")


class TestGrammarEngineGuidedProduction:
    """Test Grammar Engine Guided Production Stage (Stage 4)"""
    
    def test_guided_prompts_endpoint_returns_200(self):
        """GET /api/grammar-engine/mastery-module-1/guided-prompts returns 200"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/guided-prompts")
        assert response.status_code == 200
        print("✓ Guided prompts endpoint returns 200")
    
    def test_guided_prompts_has_prompts_array(self):
        """Guided prompts response contains prompts array"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/guided-prompts")
        data = response.json()
        assert "prompts" in data
        assert isinstance(data["prompts"], list)
        assert len(data["prompts"]) >= 3, f"Expected at least 3 prompts, got {len(data['prompts'])}"
        print(f"✓ Guided has {len(data['prompts'])} prompts")
    
    def test_guided_prompts_have_word_bank(self):
        """Guided prompts have word_bank arrays"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/guided-prompts")
        data = response.json()
        prompts = data.get("prompts", [])
        
        for prompt in prompts:
            assert "word_bank" in prompt, f"Prompt {prompt.get('id')} missing word_bank"
            assert isinstance(prompt["word_bank"], list)
        
        print("✓ All prompts have word_bank")


class TestGrammarEngineFreeProduction:
    """Test Grammar Engine Free Production Stage (Stage 5)"""
    
    def test_free_prompts_endpoint_returns_200(self):
        """GET /api/grammar-engine/mastery-module-1/free-prompts returns 200"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/free-prompts")
        assert response.status_code == 200
        print("✓ Free prompts endpoint returns 200")
    
    def test_free_prompts_has_prompts_array(self):
        """Free prompts response contains prompts array"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/free-prompts")
        data = response.json()
        assert "prompts" in data
        assert isinstance(data["prompts"], list)
        assert len(data["prompts"]) >= 3, f"Expected at least 3 prompts, got {len(data['prompts'])}"
        print(f"✓ Free has {len(data['prompts'])} prompts")
    
    def test_free_prompts_have_min_sentences(self):
        """Free prompts have min_sentences requirement"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/free-prompts")
        data = response.json()
        prompts = data.get("prompts", [])
        
        for prompt in prompts:
            assert "min_sentences" in prompt, f"Prompt {prompt.get('id')} missing min_sentences"
            assert prompt["min_sentences"] >= 3
        
        print("✓ All prompts have min_sentences")


class TestGrammarEngineTranslation:
    """Test Grammar Engine Translation endpoint"""
    
    def test_translate_endpoint_returns_200(self):
        """POST /api/grammar-engine/translate returns 200"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/translate",
            json={"text": "Hello world", "target_language": "vi"}
        )
        assert response.status_code == 200
        print("✓ Translate endpoint returns 200")
    
    def test_translate_returns_translation(self):
        """Translate response contains translation field"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/translate",
            json={"text": "The passive voice is used in formal writing.", "target_language": "vi"}
        )
        data = response.json()
        assert "translation" in data
        assert len(data["translation"]) > 0
        print(f"✓ Translation: {data['translation'][:50]}...")
    
    def test_translate_multiple_languages(self):
        """Translate works for multiple languages"""
        languages = ["vi", "tr", "ko", "zh"]
        text = "Education is important."
        
        for lang in languages:
            response = requests.post(
                f"{BASE_URL}/api/grammar-engine/translate",
                json={"text": text, "target_language": lang}
            )
            assert response.status_code == 200
            data = response.json()
            assert "translation" in data
            print(f"  ✓ {lang}: {data['translation'][:30]}...")
        
        print("✓ Multiple languages work")


class TestGrammarEngineEvaluation:
    """Test Grammar Engine Evaluation endpoint"""
    
    def test_evaluate_endpoint_returns_200(self):
        """POST /api/grammar-engine/mastery-module-1/evaluate returns 200"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/mastery-module-1/evaluate",
            json={
                "sentence": "The homework is completed by students.",
                "grammar_title": "The Passive Voice",
                "grammar_focus": "present simple passive"
            }
        )
        assert response.status_code == 200
        print("✓ Evaluate endpoint returns 200")
    
    def test_evaluate_returns_score(self):
        """Evaluate response contains score 1-5"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/mastery-module-1/evaluate",
            json={
                "sentence": "The homework is completed by students.",
                "grammar_title": "The Passive Voice",
                "grammar_focus": "present simple passive"
            }
        )
        data = response.json()
        assert "score" in data
        assert 1 <= data["score"] <= 5
        print(f"✓ Score: {data['score']}/5")
    
    def test_evaluate_returns_feedback(self):
        """Evaluate response contains feedback and corrected_sentence"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/mastery-module-1/evaluate",
            json={
                "sentence": "The homework is completed by students.",
                "grammar_title": "The Passive Voice",
                "grammar_focus": "present simple passive"
            }
        )
        data = response.json()
        assert "feedback" in data
        assert "corrected_sentence" in data
        assert "grammar_correct" in data
        assert "target_grammar_used" in data
        print(f"✓ Feedback: {data['feedback'][:50]}...")


class TestWordOrderNormalizeFix:
    """Test Word Order normalize function fix for punctuation tokens"""
    
    def test_normalize_function_logic(self):
        """Test the normalize function handles punctuation correctly"""
        # Simulate the normalize function from WordOrder.js
        def normalize(s):
            import re
            s = re.sub(r'\s+([.!?,;:\'""])', r'\1', s)  # Remove space before punctuation
            s = re.sub(r'([\'"""])\s+', r'\1', s)  # Remove space after quotes
            s = re.sub(r'\s+', ' ', s)  # Normalize spaces
            s = re.sub(r'[.!?,;:]+$', '', s)  # Remove trailing punctuation
            return s.strip().lower()
        
        # Test cases from the bug fix
        test_cases = [
            ("Yes , I do .", "Yes, I do."),
            ("Do you like chicken ?", "Do you like chicken?"),
            ("No , I don't .", "No, I don't."),
            ("I like rice and beans .", "I like rice and beans."),
        ]
        
        for user_input, expected in test_cases:
            normalized_input = normalize(user_input)
            normalized_expected = normalize(expected)
            assert normalized_input == normalized_expected, f"'{user_input}' should match '{expected}'"
            print(f"  ✓ '{user_input}' matches '{expected}'")
        
        print("✓ Normalize function handles punctuation correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
