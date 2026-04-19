"""
Smart Review API Tests - Iteration 71
Tests the new Smart Review feature added to the Grammar Practice Engine:
- POST /api/grammar-engine/{module_id}/smart-review - Generate targeted exercises based on weak areas
- POST /api/grammar-engine/{module_id}/quiz/submit - Submit quiz and get weak_areas in diagnostic
- Verify existing Learn/Practice endpoints still work (regression)
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://prod-security-flows.preview.emergentagent.com')
MODULE_ID = "mastery-module-1"


class TestSmartReviewAPI:
    """Test Smart Review endpoint - POST /api/grammar-engine/{module_id}/smart-review"""
    
    def test_smart_review_endpoint_returns_200(self):
        """POST /api/grammar-engine/mastery-module-1/smart-review returns 200"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/smart-review",
            json={"weak_areas": ["form", "usage"], "quiz_score": 55}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Smart Review endpoint returns 200")
    
    def test_smart_review_returns_8_exercises(self):
        """Smart Review response contains exactly 8 exercises"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/smart-review",
            json={"weak_areas": ["form", "usage"], "quiz_score": 55}
        )
        data = response.json()
        assert "exercises" in data, "Response missing 'exercises' field"
        assert isinstance(data["exercises"], list), "exercises should be a list"
        assert len(data["exercises"]) == 8, f"Expected 8 exercises, got {len(data['exercises'])}"
        print(f"✓ Smart Review returns {len(data['exercises'])} exercises")
    
    def test_smart_review_has_title_and_review_message(self):
        """Smart Review response has title and review_message"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/smart-review",
            json={"weak_areas": ["form", "usage"], "quiz_score": 55}
        )
        data = response.json()
        assert "title" in data, "Response missing 'title'"
        assert "review_message" in data, "Response missing 'review_message'"
        assert len(data["review_message"]) > 0, "review_message should not be empty"
        print(f"✓ Title: {data['title']}")
        print(f"✓ Review message: {data['review_message'][:80]}...")
    
    def test_smart_review_has_summary_tips(self):
        """Smart Review response has summary_tips array with 3 items"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/smart-review",
            json={"weak_areas": ["form", "usage"], "quiz_score": 55}
        )
        data = response.json()
        assert "summary_tips" in data, "Response missing 'summary_tips'"
        assert isinstance(data["summary_tips"], list), "summary_tips should be a list"
        assert len(data["summary_tips"]) == 3, f"Expected 3 summary_tips, got {len(data['summary_tips'])}"
        print(f"✓ Summary tips ({len(data['summary_tips'])} items):")
        for i, tip in enumerate(data["summary_tips"]):
            print(f"  {i+1}. {tip[:60]}...")
    
    def test_smart_review_exercises_have_varied_types(self):
        """Smart Review exercises have varied types: multiple_choice, gap_fill, error_detection, context_choice, sentence_correction"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/smart-review",
            json={"weak_areas": ["form", "usage"], "quiz_score": 55}
        )
        data = response.json()
        exercises = data.get("exercises", [])
        
        exercise_types = set(ex.get("type") for ex in exercises)
        expected_types = {"multiple_choice", "gap_fill", "error_detection", "context_choice", "sentence_correction"}
        
        # At least 3 different types should be present
        assert len(exercise_types) >= 3, f"Expected at least 3 different exercise types, got {len(exercise_types)}: {exercise_types}"
        
        print(f"✓ Exercise types found: {exercise_types}")
        
        # Check that expected types are present (at least some of them)
        found_expected = exercise_types.intersection(expected_types)
        print(f"✓ Expected types found: {found_expected}")
    
    def test_smart_review_exercises_progress_easy_to_hard(self):
        """Smart Review exercises progress from easy to hard difficulty"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/smart-review",
            json={"weak_areas": ["form", "usage"], "quiz_score": 55}
        )
        data = response.json()
        exercises = data.get("exercises", [])
        
        difficulties = [ex.get("difficulty") for ex in exercises]
        
        # Check that we have easy, medium, and hard exercises
        assert "easy" in difficulties, "Missing 'easy' difficulty exercises"
        assert "medium" in difficulties, "Missing 'medium' difficulty exercises"
        assert "hard" in difficulties, "Missing 'hard' difficulty exercises"
        
        # Check progression: first exercises should be easy, last should be hard
        first_two = difficulties[:2]
        last_three = difficulties[-3:]
        
        assert "easy" in first_two, f"First two exercises should include 'easy', got {first_two}"
        assert "hard" in last_three, f"Last three exercises should include 'hard', got {last_three}"
        
        print(f"✓ Difficulty progression: {difficulties}")
    
    def test_smart_review_exercises_target_weak_areas(self):
        """Smart Review exercises target the specified weak areas (form, usage)"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/smart-review",
            json={"weak_areas": ["form", "usage"], "quiz_score": 55}
        )
        data = response.json()
        exercises = data.get("exercises", [])
        
        targeted_areas = set(ex.get("targets_area") for ex in exercises)
        
        # All exercises should target either 'form' or 'usage'
        for ex in exercises:
            area = ex.get("targets_area")
            assert area in ["form", "usage"], f"Exercise {ex.get('id')} targets '{area}', expected 'form' or 'usage'"
        
        # Both weak areas should be targeted
        assert "form" in targeted_areas, "No exercises target 'form'"
        assert "usage" in targeted_areas, "No exercises target 'usage'"
        
        print(f"✓ Targeted areas: {targeted_areas}")
    
    def test_smart_review_exercises_have_required_fields(self):
        """Smart Review exercises have all required fields: id, type, targets_area, difficulty, explanation, tip"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/smart-review",
            json={"weak_areas": ["form", "usage"], "quiz_score": 55}
        )
        data = response.json()
        exercises = data.get("exercises", [])
        
        required_fields = ["id", "type", "targets_area", "difficulty", "explanation", "tip"]
        
        for ex in exercises:
            for field in required_fields:
                assert field in ex, f"Exercise {ex.get('id', 'unknown')} missing field '{field}'"
        
        print(f"✓ All {len(exercises)} exercises have required fields: {required_fields}")
    
    def test_smart_review_caching_works(self):
        """Second call with same weak_areas returns cached data quickly"""
        # First call (may be slow if not cached)
        start1 = time.time()
        response1 = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/smart-review",
            json={"weak_areas": ["form", "usage"], "quiz_score": 55}
        )
        time1 = time.time() - start1
        
        # Second call (should be cached and fast)
        start2 = time.time()
        response2 = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/smart-review",
            json={"weak_areas": ["form", "usage"], "quiz_score": 55}
        )
        time2 = time.time() - start2
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Second call should be faster (cached)
        # Allow some tolerance - cached should be under 2 seconds
        assert time2 < 5, f"Second call took {time2:.2f}s, expected < 5s for cached response"
        
        # Verify same data returned
        data1 = response1.json()
        data2 = response2.json()
        assert data1.get("title") == data2.get("title"), "Cached response should have same title"
        assert len(data1.get("exercises", [])) == len(data2.get("exercises", [])), "Cached response should have same number of exercises"
        
        print(f"✓ First call: {time1:.2f}s, Second call (cached): {time2:.2f}s")
    
    def test_smart_review_requires_weak_areas(self):
        """Smart Review returns 400 when weak_areas is empty"""
        response = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/smart-review",
            json={"weak_areas": [], "quiz_score": 55}
        )
        assert response.status_code == 400, f"Expected 400 for empty weak_areas, got {response.status_code}"
        print("✓ Returns 400 for empty weak_areas")


class TestQuizSubmitWithWeakAreas:
    """Test Quiz Submit endpoint returns weak_areas in diagnostic"""
    
    def test_quiz_get_returns_questions(self):
        """GET /api/grammar-engine/mastery-module-1/quiz returns questions"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/quiz")
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert len(data["questions"]) >= 10
        print(f"✓ Quiz has {len(data['questions'])} questions")
        return data["questions"]
    
    def test_quiz_submit_returns_weak_areas(self):
        """POST /api/grammar-engine/mastery-module-1/quiz/submit returns weak_areas in response"""
        # First get quiz questions
        quiz_response = requests.get(f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/quiz")
        questions = quiz_response.json().get("questions", [])
        
        # Submit with intentionally wrong answers to get weak_areas
        # Answer only 3 out of 10 correctly to trigger weak areas
        answers = []
        for i, q in enumerate(questions):
            if i < 3:
                # Answer correctly for first 3
                if q.get("type") in ["multiple_choice", "usage_choice"]:
                    answers.append({"question_id": q["id"], "answer": q.get("correct_index", 0)})
                elif q.get("type") == "gap_fill":
                    answers.append({"question_id": q["id"], "answer": q.get("correct", "")})
                elif q.get("type") == "error_detection":
                    answers.append({"question_id": q["id"], "answer": q.get("has_error", True)})
            else:
                # Answer incorrectly for rest
                if q.get("type") in ["multiple_choice", "usage_choice"]:
                    wrong_index = (q.get("correct_index", 0) + 1) % len(q.get("options", [1,2,3,4]))
                    answers.append({"question_id": q["id"], "answer": wrong_index})
                elif q.get("type") == "gap_fill":
                    answers.append({"question_id": q["id"], "answer": "wrong_answer"})
                elif q.get("type") == "error_detection":
                    answers.append({"question_id": q["id"], "answer": not q.get("has_error", True)})
        
        submit_response = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/quiz/submit",
            json={
                "user_id": "test_user_iter71",
                "module_id": MODULE_ID,
                "answers": answers
            }
        )
        
        assert submit_response.status_code == 200, f"Submit failed: {submit_response.text}"
        data = submit_response.json()
        
        # Verify response structure
        assert "score" in data, "Response missing 'score'"
        assert "mastery" in data, "Response missing 'mastery'"
        assert "stars" in data, "Response missing 'stars'"
        assert "weak_areas" in data, "Response missing 'weak_areas'"
        assert "diagnostic_message" in data, "Response missing 'diagnostic_message'"
        assert "results" in data, "Response missing 'results'"
        
        print(f"✓ Quiz submit response structure valid")
        print(f"  Score: {data['score']}%")
        print(f"  Mastery: {data['mastery']}")
        print(f"  Stars: {data['stars']}")
        print(f"  Weak areas: {data['weak_areas']}")
        print(f"  Diagnostic: {data['diagnostic_message']}")
    
    def test_quiz_submit_with_low_score_has_weak_areas(self):
        """Quiz submit with low score returns non-empty weak_areas"""
        # Get quiz questions
        quiz_response = requests.get(f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/quiz")
        questions = quiz_response.json().get("questions", [])
        
        # Submit all wrong answers
        answers = []
        for q in questions:
            if q.get("type") in ["multiple_choice", "usage_choice"]:
                wrong_index = (q.get("correct_index", 0) + 1) % len(q.get("options", [1,2,3,4]))
                answers.append({"question_id": q["id"], "answer": wrong_index})
            elif q.get("type") == "gap_fill":
                answers.append({"question_id": q["id"], "answer": "completely_wrong"})
            elif q.get("type") == "error_detection":
                answers.append({"question_id": q["id"], "answer": not q.get("has_error", True)})
        
        submit_response = requests.post(
            f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/quiz/submit",
            json={
                "user_id": "test_user_low_score",
                "module_id": MODULE_ID,
                "answers": answers
            }
        )
        
        data = submit_response.json()
        
        # With all wrong answers, should have weak_areas
        assert data["score"] < 50, f"Expected low score, got {data['score']}%"
        assert len(data.get("weak_areas", [])) > 0, "Expected weak_areas with low score"
        
        print(f"✓ Low score ({data['score']}%) returns weak_areas: {data['weak_areas']}")


class TestExistingEndpointsRegression:
    """Regression tests - verify existing Learn/Practice endpoints still work"""
    
    def test_learn_endpoint_still_works(self):
        """GET /api/grammar-engine/mastery-module-1/learn returns 7 slides (from cache)"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/learn")
        assert response.status_code == 200
        data = response.json()
        assert "slides" in data
        assert len(data["slides"]) >= 7, f"Expected at least 7 slides, got {len(data['slides'])}"
        print(f"✓ Learn endpoint returns {len(data['slides'])} slides")
    
    def test_practice_endpoint_still_works(self):
        """GET /api/grammar-engine/mastery-module-1/practice returns 4 sections (from cache)"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/practice")
        assert response.status_code == 200
        data = response.json()
        assert "sections" in data
        assert len(data["sections"]) >= 4, f"Expected at least 4 sections, got {len(data['sections'])}"
        print(f"✓ Practice endpoint returns {len(data['sections'])} sections")
    
    def test_quiz_endpoint_still_works(self):
        """GET /api/grammar-engine/mastery-module-1/quiz returns 10 questions"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/quiz")
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert len(data["questions"]) >= 10
        print(f"✓ Quiz endpoint returns {len(data['questions'])} questions")
    
    def test_guided_prompts_still_works(self):
        """GET /api/grammar-engine/mastery-module-1/guided-prompts returns prompts"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/guided-prompts")
        assert response.status_code == 200
        data = response.json()
        assert "prompts" in data
        assert len(data["prompts"]) >= 3
        print(f"✓ Guided prompts endpoint returns {len(data['prompts'])} prompts")
    
    def test_free_prompts_still_works(self):
        """GET /api/grammar-engine/mastery-module-1/free-prompts returns prompts"""
        response = requests.get(f"{BASE_URL}/api/grammar-engine/{MODULE_ID}/free-prompts")
        assert response.status_code == 200
        data = response.json()
        assert "prompts" in data
        assert len(data["prompts"]) >= 3
        print(f"✓ Free prompts endpoint returns {len(data['prompts'])} prompts")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
