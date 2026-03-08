"""
Smart Lock System Tests - Iteration 64
Testing lesson progression lock mechanism for the Testmaster platform

Features tested:
1. Lock-status endpoint returns correct lock state based on user progress
2. First lesson of first unit is always unlocked
3. Admin emails bypass all locks
4. Sequential lesson completion required within units
5. All lessons in a unit must be completed before next unit unlocks
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://vocab-coverage-check.preview.emergentagent.com').rstrip('/')

# Admin emails that bypass all locks
ADMIN_EMAILS = ['aga.durdy@gmail.com', 'stemhousebenluc@gmail.com']

# Test user credentials
TEST_USER_EMAIL = f"smartlock_test_{uuid.uuid4().hex[:8]}@test.com"
TEST_USER_PASSWORD = "testpass123"


class TestSmartLockBasic:
    """Basic lock-status endpoint tests"""
    
    def test_first_lesson_always_unlocked(self):
        """First lesson of first unit should always be unlocked"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/lock-status",
            params={"user_id": "test_user_123", "email": "random@test.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == True, "First lesson of first unit should be unlocked"
    
    def test_second_lesson_locked_without_progress(self):
        """Second lesson should be locked if first lesson not completed"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/lock-status",
            params={"user_id": "test_user_no_progress", "email": "noprogress@test.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == False, "Second lesson should be locked without prior completion"
    
    def test_third_lesson_locked(self):
        """Third lesson should be locked if second not completed"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_03/lock-status",
            params={"user_id": "test_user_no_progress", "email": "noprogress@test.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == False
    
    def test_fourth_lesson_locked(self):
        """Fourth lesson should be locked if prior lessons not completed"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_04/lock-status",
            params={"user_id": "test_user_no_progress", "email": "noprogress@test.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == False


class TestAdminBypass:
    """Admin email bypass tests"""
    
    def test_admin_email_1_bypasses_first_unit(self):
        """Admin email aga.durdy@gmail.com should bypass all locks"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/lock-status",
            params={"user_id": "admin_test_123", "email": "aga.durdy@gmail.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == True, "Admin should bypass lesson 2 lock"
    
    def test_admin_email_1_bypasses_unit_2(self):
        """Admin email should unlock unit 2 even without completing unit 1"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_02_lesson_01/lock-status",
            params={"user_id": "admin_test_123", "email": "aga.durdy@gmail.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == True, "Admin should bypass unit 2 lock"
    
    def test_admin_email_2_bypasses_locks(self):
        """Admin email stemhousebenluc@gmail.com should bypass all locks"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_05_lesson_04/lock-status",
            params={"user_id": "admin_test_456", "email": "stemhousebenluc@gmail.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == True, "Second admin email should bypass locks"
    
    def test_admin_email_case_insensitive(self):
        """Admin email check should be case-insensitive"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_02/lock-status",
            params={"user_id": "admin_test_789", "email": "AGA.DURDY@GMAIL.COM"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == True, "Admin check should be case-insensitive"


class TestUnitLocking:
    """Cross-unit locking tests"""
    
    def test_unit_2_first_lesson_locked(self):
        """First lesson of unit 2 should be locked if unit 1 not complete"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_02_lesson_01/lock-status",
            params={"user_id": "new_user_abc", "email": "newuser@test.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == False, "Unit 2 should be locked without completing unit 1"
    
    def test_unit_3_locked(self):
        """First lesson of unit 3 should be locked for new users"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/lock-status",
            params={"user_id": "new_user_def", "email": "newuser2@test.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == False
    
    def test_later_units_locked(self):
        """Later units should be locked for users with no progress"""
        for unit_num in [4, 5, 6, 7, 8, 9, 10]:
            response = requests.get(
                f"{BASE_URL}/api/unified/lessons/stage_1_unit_{unit_num:02d}_lesson_01/lock-status",
                params={"user_id": "new_user_xyz", "email": "newuser3@test.com"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["unlocked"] == False, f"Unit {unit_num} should be locked"


class TestEdgeCases:
    """Edge case tests"""
    
    def test_no_user_id_returns_locked(self):
        """Missing user_id should return unlocked: false"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/lock-status"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == False, "Missing user_id should return locked"
    
    def test_invalid_lesson_id(self):
        """Invalid lesson ID should return unlocked: false"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/invalid_lesson_xyz/lock-status",
            params={"user_id": "test123", "email": "test@test.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == False, "Invalid lesson should return locked"
    
    def test_empty_email_parameter(self):
        """Empty email should not grant admin access"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/lock-status",
            params={"user_id": "test123", "email": ""}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == False, "Empty email should not bypass lock"
    
    def test_non_admin_email_locked(self):
        """Non-admin email should not bypass locks"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_02_lesson_01/lock-status",
            params={"user_id": "test123", "email": "notadmin@test.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["unlocked"] == False, "Non-admin email should not bypass locks"


class TestLockStatusResponseFormat:
    """Test API response format"""
    
    def test_response_has_unlocked_field(self):
        """Response should have 'unlocked' boolean field"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/lock-status",
            params={"user_id": "test123", "email": "test@test.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "unlocked" in data, "Response should have 'unlocked' field"
        assert isinstance(data["unlocked"], bool), "'unlocked' should be a boolean"
    
    def test_response_content_type_json(self):
        """Response should be JSON"""
        response = requests.get(
            f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/lock-status",
            params={"user_id": "test123", "email": "test@test.com"}
        )
        assert "application/json" in response.headers.get("content-type", "")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
