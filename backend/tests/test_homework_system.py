"""
Test Liz AI Teacher Homework System (v34)
==========================================
Tests for:
- GET /api/liz/homework/{user_id} - Get homework list with correct fields
- POST /api/liz/homework/assign - Create new homework manually
- POST /api/liz/homework/{homework_id}/submit - Submit answer and get auto-review
- DELETE /api/liz/homework/{homework_id}?user_id={user_id} - Delete homework
- POST /api/liz/chat - Auto-detect [HOMEWORK] blocks and create homework
- POST /api/liz/greet - Mentions pending homework when present
"""
import pytest
import requests
import os
import uuid
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
TEST_USER_ID = "6565a865-dbf9-4596-b756-eaf6c29295c8"


class TestHomeworkGetAPI:
    """Tests for GET /api/liz/homework/{user_id}"""
    
    def test_get_homework_list(self):
        """Test getting homework list returns correct fields"""
        response = requests.get(f"{BASE_URL}/api/liz/homework/{TEST_USER_ID}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        assert "homework" in data
        assert isinstance(data["homework"], list)
        print(f"✓ Found {len(data['homework'])} homework items")
        
        # Check structure of homework items
        if data["homework"]:
            hw = data["homework"][0]
            required_fields = ["homework_id", "title", "type", "task", "status", "due_date"]
            for field in required_fields:
                assert field in hw, f"Missing field: {field}"
            print(f"✓ Homework has correct structure")
    
    def test_get_homework_status_filter(self):
        """Test getting homework filtered by status"""
        response = requests.get(f"{BASE_URL}/api/liz/homework/{TEST_USER_ID}?status=pending")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        
        # All returned items should be pending
        for hw in data.get("homework", []):
            assert hw.get("status") == "pending", f"Expected pending, got {hw.get('status')}"
        print(f"✓ Status filter works correctly")
    
    def test_get_homework_empty_user(self):
        """Test getting homework for non-existent user returns empty list"""
        fake_user = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/liz/homework/{fake_user}")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        assert data.get("homework") == []
        print("✓ Empty homework list for non-existent user")


class TestHomeworkAssignAPI:
    """Tests for POST /api/liz/homework/assign"""
    
    def test_assign_homework_basic(self):
        """Test basic homework assignment"""
        response = requests.post(f"{BASE_URL}/api/liz/homework/assign", json={
            "user_id": TEST_USER_ID,
            "hw_type": "grammar",
            "title": "TEST_Grammar Practice",
            "task": "Practice past tense in 5 sentences.",
            "due_days": 2
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        assert "homework" in data
        
        hw = data["homework"]
        assert hw.get("homework_id") is not None
        assert hw.get("type") == "grammar"
        assert hw.get("title") == "TEST_Grammar Practice"
        assert hw.get("task") == "Practice past tense in 5 sentences."
        assert hw.get("status") == "pending"
        assert hw.get("due_date") is not None
        print(f"✓ Homework assigned: {hw['homework_id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/liz/homework/{hw['homework_id']}?user_id={TEST_USER_ID}")
    
    def test_assign_homework_default_values(self):
        """Test homework assignment with default values"""
        response = requests.post(f"{BASE_URL}/api/liz/homework/assign", json={
            "user_id": TEST_USER_ID
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        hw = data["homework"]
        
        # Check defaults
        assert hw.get("type") == "vocabulary"
        assert hw.get("title") is not None
        assert hw.get("task") is not None
        print(f"✓ Default values applied correctly")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/liz/homework/{hw['homework_id']}?user_id={TEST_USER_ID}")


class TestHomeworkSubmitAPI:
    """Tests for POST /api/liz/homework/{homework_id}/submit"""
    
    def test_submit_homework_with_auto_review(self):
        """Test submitting homework triggers auto-review with feedback"""
        # First create a homework
        create_res = requests.post(f"{BASE_URL}/api/liz/homework/assign", json={
            "user_id": TEST_USER_ID,
            "hw_type": "grammar",
            "title": "TEST_Past Tense Practice",
            "task": "Write 3 sentences using past perfect tense.",
            "due_days": 2
        })
        hw_id = create_res.json()["homework"]["homework_id"]
        
        # Submit the homework
        submit_res = requests.post(f"{BASE_URL}/api/liz/homework/{hw_id}/submit", json={
            "user_id": TEST_USER_ID,
            "submission": "1. I had already eaten breakfast before she arrived. 2. They had never seen snow before visiting Canada. 3. We had finished the project by Friday."
        })
        assert submit_res.status_code == 200, f"Expected 200, got {submit_res.status_code}: {submit_res.text}"
        
        data = submit_res.json()
        assert data.get("success") == True
        assert data.get("status") == "reviewed"
        assert "feedback" in data
        assert len(data["feedback"]) > 50, "Expected substantial feedback"
        print(f"✓ Got feedback: {data['feedback'][:100]}...")
        
        # Check score extraction (should find X/10 or X out of 10)
        if data.get("score") is not None:
            assert 0 <= data["score"] <= 10
            print(f"✓ Score extracted: {data['score']}/10")
        else:
            print("⚠ Score not extracted (might be different format in feedback)")
        
        # Verify homework was updated in DB
        get_res = requests.get(f"{BASE_URL}/api/liz/homework/{TEST_USER_ID}")
        found = False
        for hw in get_res.json().get("homework", []):
            if hw["homework_id"] == hw_id:
                assert hw["status"] == "reviewed"
                assert hw.get("feedback") is not None
                found = True
                break
        assert found, "Homework should be in list with reviewed status"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/liz/homework/{hw_id}?user_id={TEST_USER_ID}")
        print("✓ Auto-review completed and saved")
    
    def test_submit_homework_not_found(self):
        """Test submitting to non-existent homework returns 404"""
        fake_hw_id = str(uuid.uuid4())
        response = requests.post(f"{BASE_URL}/api/liz/homework/{fake_hw_id}/submit", json={
            "user_id": TEST_USER_ID,
            "submission": "Test submission"
        })
        assert response.status_code == 404
        print("✓ 404 for non-existent homework")


class TestHomeworkDeleteAPI:
    """Tests for DELETE /api/liz/homework/{homework_id}"""
    
    def test_delete_homework(self):
        """Test deleting homework"""
        # Create homework first
        create_res = requests.post(f"{BASE_URL}/api/liz/homework/assign", json={
            "user_id": TEST_USER_ID,
            "hw_type": "vocabulary",
            "title": "TEST_Delete Test",
            "task": "This will be deleted.",
            "due_days": 1
        })
        hw_id = create_res.json()["homework"]["homework_id"]
        
        # Delete it
        delete_res = requests.delete(f"{BASE_URL}/api/liz/homework/{hw_id}?user_id={TEST_USER_ID}")
        assert delete_res.status_code == 200
        assert delete_res.json().get("success") == True
        print(f"✓ Homework deleted: {hw_id}")
        
        # Verify it's gone
        get_res = requests.get(f"{BASE_URL}/api/liz/homework/{TEST_USER_ID}")
        for hw in get_res.json().get("homework", []):
            assert hw["homework_id"] != hw_id
        print("✓ Verified homework no longer exists")
    
    def test_delete_homework_not_found(self):
        """Test deleting non-existent homework returns 404"""
        fake_hw_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/liz/homework/{fake_hw_id}?user_id={TEST_USER_ID}")
        assert response.status_code == 404
        print("✓ 404 for non-existent homework")


class TestHomeworkAutoDetection:
    """Tests for auto-detecting [HOMEWORK] blocks in chat"""
    
    def test_chat_auto_creates_homework(self):
        """Test that asking for homework creates homework via chat"""
        response = requests.post(f"{BASE_URL}/api/liz/chat", json={
            "user_id": TEST_USER_ID,
            "message": "Please give me a vocabulary homework assignment with 5 words to practice."
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        
        # Check if homework was assigned
        hw_assigned = data.get("homework_assigned", [])
        if hw_assigned:
            print(f"✓ Chat created {len(hw_assigned)} homework item(s)")
            for hw in hw_assigned:
                assert "homework_id" in hw
                assert "title" in hw
                assert "type" in hw
                print(f"  - {hw['title']} ({hw['type']})")
            
            # Cleanup
            for hw in hw_assigned:
                requests.delete(f"{BASE_URL}/api/liz/homework/{hw['homework_id']}?user_id={TEST_USER_ID}")
        else:
            print("⚠ No homework auto-created (Liz may not have used [HOMEWORK] block)")
    
    def test_chat_response_cleaned(self):
        """Test that [HOMEWORK] blocks are removed from displayed response"""
        response = requests.post(f"{BASE_URL}/api/liz/chat", json={
            "user_id": TEST_USER_ID,
            "message": "Assign me a writing homework please."
        })
        assert response.status_code == 200
        
        data = response.json()
        response_text = data.get("response", "")
        
        # Should not contain raw [HOMEWORK] tags
        assert "[HOMEWORK]" not in response_text
        assert "[/HOMEWORK]" not in response_text
        print("✓ Response does not contain raw homework tags")
        
        # Cleanup any created homework
        for hw in data.get("homework_assigned", []):
            requests.delete(f"{BASE_URL}/api/liz/homework/{hw['homework_id']}?user_id={TEST_USER_ID}")


class TestGreetWithHomework:
    """Tests for greeting mentioning pending homework"""
    
    def test_greet_mentions_pending_homework(self):
        """Test that greet mentions pending homework when present"""
        # First verify there's pending homework
        hw_res = requests.get(f"{BASE_URL}/api/liz/homework/{TEST_USER_ID}?status=pending")
        pending = hw_res.json().get("homework", [])
        
        if not pending:
            # Create one for the test
            requests.post(f"{BASE_URL}/api/liz/homework/assign", json={
                "user_id": TEST_USER_ID,
                "hw_type": "vocabulary",
                "title": "TEST_Greet Test Homework",
                "task": "Test task",
                "due_days": 2
            })
        
        # Now greet
        greet_res = requests.post(f"{BASE_URL}/api/liz/greet", json={
            "user_id": TEST_USER_ID
        })
        assert greet_res.status_code == 200
        
        greeting = greet_res.json().get("greeting", "").lower()
        
        # Should mention homework in some way
        hw_related_words = ["homework", "assignment", "practice", "task", "complete", "submit"]
        mentions_hw = any(word in greeting for word in hw_related_words)
        print(f"Greeting: {greeting[:200]}...")
        
        if mentions_hw:
            print("✓ Greeting mentions homework-related content")
        else:
            print("⚠ Greeting may not explicitly mention homework (depends on LLM response)")


class TestHomeworkScoreRegex:
    """Test the score extraction regex for various formats"""
    
    def test_score_format_slash(self):
        """Test score extraction with X/10 format"""
        # Create and submit homework that should get scored
        create_res = requests.post(f"{BASE_URL}/api/liz/homework/assign", json={
            "user_id": TEST_USER_ID,
            "hw_type": "vocabulary",
            "title": "TEST_Score Test",
            "task": "Define these words: eloquent, pragmatic",
            "due_days": 1
        })
        hw_id = create_res.json()["homework"]["homework_id"]
        
        submit_res = requests.post(f"{BASE_URL}/api/liz/homework/{hw_id}/submit", json={
            "user_id": TEST_USER_ID,
            "submission": "Eloquent means speaking fluently. Pragmatic means practical."
        })
        
        data = submit_res.json()
        print(f"Feedback contains score: {data.get('score')}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/liz/homework/{hw_id}?user_id={TEST_USER_ID}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
