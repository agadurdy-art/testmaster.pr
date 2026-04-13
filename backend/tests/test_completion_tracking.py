"""
Test Completion Tracking Feature
================================
Tests for the 5th stat box completion tracking on Question Bank page.
- POST /api/user/track-completion
- GET /api/user/{user_id}/completion-stats
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials from seed data
TEST_USER_ID = "552afdf8-b1e6-4e1c-9a0d-49725faebcfb"
TEST_EMAIL = "test@qbstats.com"
TEST_PASSWORD = "Test1234!"


class TestTrackCompletion:
    """Tests for POST /api/user/track-completion endpoint"""
    
    def test_track_cambridge_completion(self):
        """Track a Cambridge test completion"""
        response = requests.post(
            f"{BASE_URL}/api/user/track-completion",
            json={
                "user_id": TEST_USER_ID,
                "test_id": "ielts18_test1",
                "category": "cambridge",
                "band_score": 7.0
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") is True
        assert "message" in data
        print(f"✓ Cambridge completion tracked successfully")
    
    def test_track_ai_academic_completion(self):
        """Track an AI Academic test completion"""
        response = requests.post(
            f"{BASE_URL}/api/user/track-completion",
            json={
                "user_id": TEST_USER_ID,
                "test_id": "academic_set_b_01",
                "category": "ai_academic",
                "band_score": 6.5
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") is True
        print(f"✓ AI Academic completion tracked successfully")
    
    def test_track_ai_general_completion(self):
        """Track an AI General test completion"""
        response = requests.post(
            f"{BASE_URL}/api/user/track-completion",
            json={
                "user_id": TEST_USER_ID,
                "test_id": "general_set_a_01",
                "category": "ai_general",
                "band_score": 6.0
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") is True
        print(f"✓ AI General completion tracked successfully")
    
    def test_reject_invalid_category(self):
        """Reject invalid category values"""
        response = requests.post(
            f"{BASE_URL}/api/user/track-completion",
            json={
                "user_id": TEST_USER_ID,
                "test_id": "some_test",
                "category": "invalid_category",
                "band_score": 5.0
            }
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "Invalid category" in data.get("detail", "")
        print(f"✓ Invalid category correctly rejected")
    
    def test_update_existing_completion(self):
        """Update (not duplicate) when same test is submitted twice"""
        # First submission
        first_response = requests.post(
            f"{BASE_URL}/api/user/track-completion",
            json={
                "user_id": TEST_USER_ID,
                "test_id": "ielts17_test2",
                "category": "cambridge",
                "band_score": 5.5
            }
        )
        assert first_response.status_code == 200
        
        # Second submission with different band_score
        second_response = requests.post(
            f"{BASE_URL}/api/user/track-completion",
            json={
                "user_id": TEST_USER_ID,
                "test_id": "ielts17_test2",
                "category": "cambridge",
                "band_score": 7.0
            }
        )
        assert second_response.status_code == 200
        
        # Verify it's updated not duplicated
        stats_response = requests.get(
            f"{BASE_URL}/api/user/{TEST_USER_ID}/completion-stats"
        )
        assert stats_response.status_code == 200
        stats = stats_response.json()
        
        # Count occurrences of ielts17_test2
        cambridge_tests = stats["cambridge"]["tests"]
        count = cambridge_tests.count("ielts17_test2")
        assert count == 1, f"Expected 1 occurrence, got {count}"
        print(f"✓ Duplicate completion correctly updated (not duplicated)")


class TestCompletionStats:
    """Tests for GET /api/user/{user_id}/completion-stats endpoint"""
    
    def test_get_completion_stats_structure(self):
        """Verify completion stats response structure"""
        response = requests.get(
            f"{BASE_URL}/api/user/{TEST_USER_ID}/completion-stats"
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify required fields exist
        assert "cambridge" in data
        assert "ai_academic" in data
        assert "ai_general" in data
        assert "practice" in data
        assert "total_full_completed" in data
        assert "total_full_available" in data
        
        # Verify structure of each category
        for category in ["cambridge", "ai_academic", "ai_general"]:
            assert "completed" in data[category], f"Missing 'completed' in {category}"
            assert "total" in data[category], f"Missing 'total' in {category}"
            assert "tests" in data[category], f"Missing 'tests' in {category}"
        
        print(f"✓ Completion stats structure is correct")
    
    def test_completion_stats_totals(self):
        """Verify completion stats have correct totals"""
        response = requests.get(
            f"{BASE_URL}/api/user/{TEST_USER_ID}/completion-stats"
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify totals
        assert data["cambridge"]["total"] == 8, f"Expected 8 Cambridge tests, got {data['cambridge']['total']}"
        assert data["ai_academic"]["total"] == 8, f"Expected 8 AI Academic tests, got {data['ai_academic']['total']}"
        assert data["ai_general"]["total"] == 4, f"Expected 4 AI General tests, got {data['ai_general']['total']}"
        assert data["total_full_available"] == 20, f"Expected 20 total available, got {data['total_full_available']}"
        
        print(f"✓ Completion stats totals are correct (8+8+4=20)")
    
    def test_completion_stats_counts_match(self):
        """Verify completed counts match sum of categories"""
        response = requests.get(
            f"{BASE_URL}/api/user/{TEST_USER_ID}/completion-stats"
        )
        assert response.status_code == 200
        data = response.json()
        
        cambridge_completed = data["cambridge"]["completed"]
        ai_academic_completed = data["ai_academic"]["completed"]
        ai_general_completed = data["ai_general"]["completed"]
        total_completed = data["total_full_completed"]
        
        expected_total = cambridge_completed + ai_academic_completed + ai_general_completed
        assert total_completed == expected_total, f"Total mismatch: {total_completed} != {expected_total}"
        
        print(f"✓ Completion counts match: Cambridge({cambridge_completed}) + AI Academic({ai_academic_completed}) + AI General({ai_general_completed}) = {total_completed}")
    
    def test_completion_stats_seeded_data(self):
        """Verify seeded completion data is present"""
        response = requests.get(
            f"{BASE_URL}/api/user/{TEST_USER_ID}/completion-stats"
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify seeded data exists (at least 1 Cambridge and 1 AI Academic)
        assert data["cambridge"]["completed"] >= 1, "Expected at least 1 Cambridge completion from seed"
        assert data["ai_academic"]["completed"] >= 1, "Expected at least 1 AI Academic completion from seed"
        
        # Verify ielts17_test1 is in Cambridge tests
        cambridge_tests = data["cambridge"]["tests"]
        assert "ielts17_test1" in cambridge_tests, f"Expected ielts17_test1 in Cambridge tests, got {cambridge_tests}"
        
        print(f"✓ Seeded completion data verified (Cambridge: {data['cambridge']['tests']}, AI Academic: {data['ai_academic']['tests']})")


class TestUserAuthentication:
    """Tests for authentication flow to access QB page"""
    
    def test_login_test_user(self):
        """Verify test user can login"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert data.get("id") == TEST_USER_ID
        print(f"✓ Test user login successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
