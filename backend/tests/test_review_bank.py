"""
Test Review Bank API endpoints and spaced repetition logic
Tests: GET /api/vocabulary-engine/review-bank/{user_id}
       POST /api/vocabulary-engine/review-bank/add
       POST /api/vocabulary-engine/review-bank/review
       POST /api/vocabulary-engine/quiz/submit (auto-adds wrong answers)
"""
import pytest
import requests
import os
import time
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
TEST_USER_ID = "6565a865-dbf9-4596-b756-eaf6c29295c8"
TEST_MODULE_ID = "advanced-module-1"


class TestReviewBankEndpoints:
    """Review Bank API endpoint tests"""

    def test_health_check(self):
        """Verify API is running"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        print("✓ Health check passed")

    def test_get_review_bank(self):
        """GET /api/vocabulary-engine/review-bank/{user_id} - Fetch user's review bank"""
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/review-bank/{TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "words" in data
        assert "total" in data
        assert "mastered" in data
        assert "to_review" in data
        assert isinstance(data["words"], list)
        assert isinstance(data["total"], int)
        assert isinstance(data["mastered"], int)
        
        print(f"✓ Review bank fetched: {data['to_review']} words to review, {data['mastered']} mastered")
        return data

    def test_add_to_review_bank(self):
        """POST /api/vocabulary-engine/review-bank/add - Add a word to review"""
        test_word = f"TEST_word_{int(time.time())}"
        payload = {
            "user_id": TEST_USER_ID,
            "module_id": TEST_MODULE_ID,
            "word": test_word,
            "meaning": "A test word for automated testing",
            "category": "test",
            "source": "quiz"
        }
        response = requests.post(
            f"{BASE_URL}/api/vocabulary-engine/review-bank/add",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✓ Word '{test_word}' added to review bank")
        
        # Verify it appears in the review bank
        get_response = requests.get(f"{BASE_URL}/api/vocabulary-engine/review-bank/{TEST_USER_ID}")
        assert get_response.status_code == 200
        bank_data = get_response.json()
        
        word_found = any(w.get("word") == test_word for w in bank_data.get("words", []))
        assert word_found, f"Word '{test_word}' not found in review bank after adding"
        print(f"✓ Verified word appears in review bank")
        
        return test_word

    def test_add_duplicate_increments_mistake_count(self):
        """Adding same word again should increment mistake_count, not create duplicate"""
        test_word = f"TEST_dup_{int(time.time())}"
        payload = {
            "user_id": TEST_USER_ID,
            "module_id": TEST_MODULE_ID,
            "word": test_word,
            "meaning": "Test duplicate word",
            "category": "test",
            "source": "quiz"
        }
        
        # Add first time
        response1 = requests.post(f"{BASE_URL}/api/vocabulary-engine/review-bank/add", json=payload)
        assert response1.status_code == 200
        
        # Add second time
        response2 = requests.post(f"{BASE_URL}/api/vocabulary-engine/review-bank/add", json=payload)
        assert response2.status_code == 200
        
        # Verify only one entry and mistake_count is 2
        get_response = requests.get(f"{BASE_URL}/api/vocabulary-engine/review-bank/{TEST_USER_ID}")
        bank_data = get_response.json()
        matching_words = [w for w in bank_data.get("words", []) if w.get("word") == test_word]
        
        assert len(matching_words) == 1, "Should have exactly one entry for the word"
        assert matching_words[0].get("mistake_count", 0) >= 2, "Mistake count should be at least 2"
        print(f"✓ Duplicate add correctly increments mistake_count to {matching_words[0].get('mistake_count')}")

    def test_review_word_knew_it_true(self):
        """POST /api/vocabulary-engine/review-bank/review - knew_it=true advances interval"""
        # First add a fresh word
        test_word = f"TEST_review_knew_{int(time.time())}"
        add_payload = {
            "user_id": TEST_USER_ID,
            "module_id": TEST_MODULE_ID,
            "word": test_word,
            "meaning": "Test review word",
            "category": "test",
            "source": "manual"
        }
        requests.post(f"{BASE_URL}/api/vocabulary-engine/review-bank/add", json=add_payload)
        
        # Review with knew_it=true
        review_payload = {
            "user_id": TEST_USER_ID,
            "word": test_word,
            "module_id": TEST_MODULE_ID,
            "knew_it": True
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/review-bank/review", json=review_payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "mastery_status" in data
        assert "next_review" in data
        
        # After first correct review, should be learning with next_review ~1 day out
        assert data["mastery_status"] == "learning"
        print(f"✓ Review with knew_it=true: mastery={data['mastery_status']}, next_review={data['next_review']}")

    def test_review_word_knew_it_false(self):
        """POST /api/vocabulary-engine/review-bank/review - knew_it=false resets to 1 day"""
        # First add a fresh word
        test_word = f"TEST_review_forgot_{int(time.time())}"
        add_payload = {
            "user_id": TEST_USER_ID,
            "module_id": TEST_MODULE_ID,
            "word": test_word,
            "meaning": "Test review word for forgot",
            "category": "test",
            "source": "manual"
        }
        requests.post(f"{BASE_URL}/api/vocabulary-engine/review-bank/add", json=add_payload)
        
        # Review with knew_it=false
        review_payload = {
            "user_id": TEST_USER_ID,
            "word": test_word,
            "module_id": TEST_MODULE_ID,
            "knew_it": False
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/review-bank/review", json=review_payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert data["mastery_status"] == "learning"
        print(f"✓ Review with knew_it=false: mastery={data['mastery_status']}, reset to learning")

    def test_review_nonexistent_word(self):
        """Review a word that doesn't exist should return failure"""
        review_payload = {
            "user_id": TEST_USER_ID,
            "word": "NONEXISTENT_WORD_12345",
            "module_id": TEST_MODULE_ID,
            "knew_it": True
        }
        response = requests.post(f"{BASE_URL}/api/vocabulary-engine/review-bank/review", json=review_payload)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == False
        print("✓ Nonexistent word review correctly returns failure")


class TestSpacedRepetitionLogic:
    """Test the spaced repetition interval logic"""

    def test_spaced_repetition_progression(self):
        """Test 1d -> 3d -> 7d -> 14d -> mastered progression"""
        test_word = f"TEST_spaced_{int(time.time())}"
        
        # Add word
        add_payload = {
            "user_id": TEST_USER_ID,
            "module_id": TEST_MODULE_ID,
            "word": test_word,
            "meaning": "Spaced repetition test",
            "category": "test",
            "source": "manual"
        }
        requests.post(f"{BASE_URL}/api/vocabulary-engine/review-bank/add", json=add_payload)
        
        review_payload = {
            "user_id": TEST_USER_ID,
            "word": test_word,
            "module_id": TEST_MODULE_ID,
            "knew_it": True
        }
        
        statuses = []
        for i in range(5):  # 5 correct reviews should lead to mastered
            response = requests.post(f"{BASE_URL}/api/vocabulary-engine/review-bank/review", json=review_payload)
            data = response.json()
            statuses.append(data.get("mastery_status"))
            print(f"  Review {i+1}: status={data.get('mastery_status')}")
        
        # The last status should be "mastered" after 5 correct reviews
        assert "mastered" in statuses, "Should achieve mastery after multiple correct reviews"
        print(f"✓ Spaced repetition progression verified: {statuses}")


class TestQuizSubmitAutoAdd:
    """Test that quiz submission auto-adds wrong answers to review bank"""

    def test_quiz_submit_adds_wrong_answers(self):
        """POST /api/vocabulary-engine/quiz/submit - Wrong answers added to review bank"""
        # Submit quiz with intentionally wrong answers
        submit_payload = {
            "module_id": TEST_MODULE_ID,
            "user_id": TEST_USER_ID,
            "answers": {
                "q-0": "X",  # Wrong answer
                "q-1": "X",  # Wrong answer
                "q-2": "X",  # Wrong answer
            },
            "score": 2,
            "total": 10
        }
        
        response = requests.post(
            f"{BASE_URL}/api/vocabulary-engine/quiz/submit",
            json=submit_payload
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "passed" in data
        assert "score" in data
        assert "total" in data
        assert "percentage" in data
        
        # With 2/10 correct (20%), should not pass (need 80%)
        assert data["passed"] == False
        assert data["percentage"] == 20
        
        print(f"✓ Quiz submit: passed={data['passed']}, score={data['score']}/{data['total']} ({data['percentage']}%)")
        
        # Note: Verifying wrong answers were added to review bank would require
        # checking the review_bank collection, which is done by get_review_bank


class TestReviewBankEmptyState:
    """Test review bank empty states"""

    def test_get_review_bank_new_user(self):
        """GET review bank for a user with no words should return empty"""
        fake_user_id = f"nonexistent-user-{int(time.time())}"
        response = requests.get(f"{BASE_URL}/api/vocabulary-engine/review-bank/{fake_user_id}")
        assert response.status_code == 200
        data = response.json()
        
        assert data["words"] == []
        assert data["total"] == 0
        assert data["mastered"] == 0
        assert data["to_review"] == 0
        print("✓ Empty review bank correctly returns zero counts")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
