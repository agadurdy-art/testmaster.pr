"""
Test Bug Fixes for IELTS Vocabulary Engine - Iteration 38
Bug 1: Fill-in-blank quiz questions have no input field
Bug 2: TFNG questions have no reference paragraph  
Bug 3: Matching exercise auto-clicks wrong items (frontend fix verified via code review)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestVocabularyQuizAPI:
    """Test quiz API returns correct data structure for bug fixes"""
    
    def test_quiz_endpoint_returns_reading_passage(self):
        """BUG FIX 2: Quiz API should return reading_passage for TFNG questions"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/quiz")
        
        assert response.status_code == 200, f"Quiz API failed: {response.status_code}"
        
        data = response.json()
        
        # Must have reading_passage field
        assert "reading_passage" in data, "reading_passage field missing from quiz response"
        assert data["reading_passage"], "reading_passage is empty"
        assert len(data["reading_passage"]) > 50, f"reading_passage too short: {len(data['reading_passage'])}"
        
        print(f"✓ reading_passage returned with {len(data['reading_passage'])} characters")
    
    def test_quiz_has_fill_blank_question(self):
        """BUG FIX 1: Quiz should have fill_blank type questions"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/quiz")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        
        # Find fill_blank questions
        fill_blank_questions = [q for q in questions if q.get("type") == "fill_blank"]
        
        assert len(fill_blank_questions) > 0, "No fill_blank questions in quiz"
        
        # Q5 should be fill_blank (index 4)
        q5 = questions[4] if len(questions) > 4 else None
        assert q5 is not None, "Question 5 not found"
        assert q5.get("type") == "fill_blank", f"Q5 type is {q5.get('type')}, expected fill_blank"
        
        print(f"✓ fill_blank question found at Q5: {q5.get('question', '')[:50]}...")
    
    def test_quiz_has_tfng_question(self):
        """BUG FIX 2: Quiz should have true_false_ng type questions"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/quiz")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        
        # Find TFNG questions
        tfng_questions = [q for q in questions if q.get("type") == "true_false_ng"]
        
        assert len(tfng_questions) > 0, "No true_false_ng questions in quiz"
        
        # Q7 should be TFNG (index 6)
        q7 = questions[6] if len(questions) > 6 else None
        assert q7 is not None, "Question 7 not found"
        assert q7.get("type") == "true_false_ng", f"Q7 type is {q7.get('type')}, expected true_false_ng"
        
        print(f"✓ true_false_ng question found at Q7: {q7.get('question', '')[:50]}...")
    
    def test_quiz_question_structure(self):
        """Verify all questions have required fields"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/quiz")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        
        assert len(questions) == 10, f"Expected 10 questions, got {len(questions)}"
        
        for i, q in enumerate(questions):
            assert "id" in q, f"Q{i+1} missing id"
            assert "question" in q, f"Q{i+1} missing question"
            assert "type" in q, f"Q{i+1} missing type"
            assert "answer" in q, f"Q{i+1} missing answer"
            
            q_type = q.get("type")
            if q_type == "multiple_choice":
                assert "options" in q, f"Q{i+1} (MC) missing options"
        
        print("✓ All questions have required structure")


class TestVocabularyPracticeAPI:
    """Test practice API for matching exercise"""
    
    def test_practice_returns_matching_exercise(self):
        """BUG FIX 3 (related): Practice API should return matching exercises"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/practice")
        assert response.status_code == 200
        
        data = response.json()
        exercises = data.get("exercises", [])
        
        # Find matching exercises
        matching_exercises = [e for e in exercises if e.get("type") == "matching"]
        
        assert len(matching_exercises) > 0, "No matching exercises found"
        
        # Check matching exercise structure
        match_ex = matching_exercises[0]
        assert "terms" in match_ex, "Matching exercise missing terms"
        assert "definitions" in match_ex, "Matching exercise missing definitions"
        assert "answers" in match_ex, "Matching exercise missing answers"
        
        # Check terms and definitions have IDs
        for term in match_ex.get("terms", []):
            assert "id" in term, "Term missing id"
            assert "text" in term, "Term missing text"
        
        for defn in match_ex.get("definitions", []):
            assert "id" in defn, "Definition missing id"
            assert "text" in defn, "Definition missing text"
        
        print(f"✓ Matching exercise found with {len(match_ex['terms'])} terms")


class TestQuizSubmission:
    """Test quiz submission with fill_blank answers"""
    
    def test_submit_quiz_with_fill_blank(self):
        """Quiz submission should accept fill_blank answers"""
        # First get quiz to get question IDs
        quiz_response = requests.get(f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/quiz")
        assert quiz_response.status_code == 200
        
        quiz_data = quiz_response.json()
        questions = quiz_data.get("questions", [])
        
        # Build answers dict with fill_blank answer for Q5
        answers = {}
        for i, q in enumerate(questions):
            if q.get("type") == "fill_blank":
                answers[q["id"]] = "have become"  # Test fill_blank answer
            elif q.get("type") == "true_false_ng":
                answers[q["id"]] = "False"
            elif q.get("type") == "multiple_choice" and q.get("options"):
                # Pick first option letter
                answers[q["id"]] = q["options"][0][0] if q["options"] else "A"
        
        # Submit quiz
        submit_data = {
            "module_id": "advanced-module-1",
            "user_id": "6565a865-dbf9-4596-b756-eaf6c29295c8",  # Test user
            "answers": answers,
            "score": 5,
            "total": 10
        }
        
        submit_response = requests.post(
            f"{BASE_URL}/api/vocabulary-engine/quiz/submit",
            json=submit_data
        )
        
        assert submit_response.status_code == 200, f"Quiz submit failed: {submit_response.text}"
        
        result = submit_response.json()
        assert "passed" in result or "quiz_passed" in result, "Submit response missing pass status"
        
        print("✓ Quiz submission with fill_blank answer succeeded")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
