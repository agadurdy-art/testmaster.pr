"""
Backend tests for Admin Vocabulary Management endpoints - Iteration 65
Tests:
- GET /api/admin/vocabulary-groups with valid admin_email
- GET /api/admin/vocabulary-groups without/invalid admin_email (403)
- POST /api/admin/vocabulary/update-image with valid admin
- POST /api/admin/vocabulary/update-image for non-admin (403)
- POST /api/admin/vocabulary/update-image for non-existent lesson (404)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin email that should work based on server.py ADMIN_EMAILS list
VALID_ADMIN_EMAIL = "aga.durdy@gmail.com"
NON_ADMIN_EMAIL = "regular_user@example.com"

class TestAdminVocabularyGroups:
    """Test GET /api/admin/vocabulary-groups endpoint"""
    
    def test_vocabulary_groups_with_valid_admin(self):
        """GET /api/admin/vocabulary-groups returns vocabulary data when called with valid admin_email"""
        response = requests.get(
            f"{BASE_URL}/api/admin/vocabulary-groups",
            params={"admin_email": VALID_ADMIN_EMAIL}
        )
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "groups" in data, "Response should have 'groups' key"
        groups = data["groups"]
        assert isinstance(groups, list), "Groups should be a list"
        
        # If there are groups, verify structure
        if len(groups) > 0:
            stage = groups[0]
            assert "stage_id" in stage, "Stage should have 'stage_id'"
            assert "name" in stage, "Stage should have 'name'"
            assert "units" in stage, "Stage should have 'units'"
            assert isinstance(stage["units"], list), "Units should be a list"
            
            if len(stage["units"]) > 0:
                unit = stage["units"][0]
                assert "unit_id" in unit, "Unit should have 'unit_id'"
                assert "title" in unit, "Unit should have 'title'"
                assert "lessons" in unit, "Unit should have 'lessons'"
                
                if len(unit["lessons"]) > 0:
                    lesson = unit["lessons"][0]
                    assert "lesson_id" in lesson, "Lesson should have 'lesson_id'"
                    assert "words" in lesson, "Lesson should have 'words'"
                    assert "word_count" in lesson, "Lesson should have 'word_count'"
                    assert "image_count" in lesson, "Lesson should have 'image_count'"
        
        print(f"✓ Retrieved {len(groups)} stages with vocabulary data")
    
    def test_vocabulary_groups_without_admin_email_returns_403(self):
        """GET /api/admin/vocabulary-groups without admin_email returns 403"""
        response = requests.get(f"{BASE_URL}/api/admin/vocabulary-groups")
        
        # Status assertion
        assert response.status_code == 403, f"Expected 403 without admin_email, got {response.status_code}"
        
        # Data assertion
        data = response.json()
        assert "detail" in data, "Error response should have 'detail'"
        print("✓ Correctly returned 403 when no admin_email provided")
    
    def test_vocabulary_groups_with_invalid_admin_returns_403(self):
        """GET /api/admin/vocabulary-groups with non-admin email returns 403"""
        response = requests.get(
            f"{BASE_URL}/api/admin/vocabulary-groups",
            params={"admin_email": NON_ADMIN_EMAIL}
        )
        
        # Status assertion
        assert response.status_code == 403, f"Expected 403 for non-admin, got {response.status_code}"
        
        # Data assertion
        data = response.json()
        assert "detail" in data, "Error response should have 'detail'"
        assert "admin" in data["detail"].lower() or "access" in data["detail"].lower(), \
            "Error should mention admin access"
        print("✓ Correctly returned 403 for non-admin email")


class TestAdminUpdateVocabImage:
    """Test POST /api/admin/vocabulary/update-image endpoint"""
    
    def test_update_image_with_non_admin_returns_403(self):
        """POST /api/admin/vocabulary/update-image with non-admin returns 403"""
        response = requests.post(
            f"{BASE_URL}/api/admin/vocabulary/update-image",
            data={
                "admin_email": NON_ADMIN_EMAIL,
                "lesson_id": "stage_1_unit_01_lesson_01",
                "word": "test_word",
                "image_url": "https://example.com/image.png"
            }
        )
        
        # Status assertion
        assert response.status_code == 403, f"Expected 403 for non-admin, got {response.status_code}"
        print("✓ Correctly returned 403 for non-admin update attempt")
    
    def test_update_image_for_nonexistent_lesson_returns_404(self):
        """POST /api/admin/vocabulary/update-image for non-existent lesson returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/admin/vocabulary/update-image",
            data={
                "admin_email": VALID_ADMIN_EMAIL,
                "lesson_id": "nonexistent_lesson_id_xyz",
                "word": "test_word",
                "image_url": "https://example.com/image.png"
            }
        )
        
        # Status assertion - should be 404 for lesson not found
        assert response.status_code == 404, f"Expected 404 for non-existent lesson, got {response.status_code}"
        
        # Data assertion
        data = response.json()
        assert "detail" in data, "Error response should have 'detail'"
        print("✓ Correctly returned 404 for non-existent lesson")
    
    def test_update_image_with_url_success(self):
        """POST /api/admin/vocabulary/update-image can update a word's image URL"""
        # First, get the vocabulary groups to find a real lesson_id and word
        groups_response = requests.get(
            f"{BASE_URL}/api/admin/vocabulary-groups",
            params={"admin_email": VALID_ADMIN_EMAIL}
        )
        
        if groups_response.status_code != 200:
            pytest.skip("Could not fetch vocabulary groups to get real lesson data")
        
        groups = groups_response.json().get("groups", [])
        if not groups:
            pytest.skip("No vocabulary groups available for testing")
        
        # Find a lesson with words
        target_lesson_id = None
        target_word = None
        
        for stage in groups:
            for unit in stage.get("units", []):
                for lesson in unit.get("lessons", []):
                    if lesson.get("words") and len(lesson["words"]) > 0:
                        target_lesson_id = lesson["lesson_id"]
                        target_word = lesson["words"][0]["word"]
                        break
                if target_lesson_id:
                    break
            if target_lesson_id:
                break
        
        if not target_lesson_id or not target_word:
            pytest.skip("No lessons with vocabulary words found")
        
        # Now try to update the image URL
        test_image_url = "https://images.unsplash.com/photo-test-admin-vocab-update.jpg"
        response = requests.post(
            f"{BASE_URL}/api/admin/vocabulary/update-image",
            data={
                "admin_email": VALID_ADMIN_EMAIL,
                "lesson_id": target_lesson_id,
                "word": target_word,
                "image_url": test_image_url
            }
        )
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "status" in data, "Response should have 'status'"
        assert data["status"] == "success", f"Expected status 'success', got {data['status']}"
        assert "word" in data, "Response should have 'word'"
        assert "image_url" in data, "Response should have 'image_url'"
        
        print(f"✓ Successfully updated image URL for word '{target_word}' in lesson '{target_lesson_id}'")
    
    def test_update_image_for_nonexistent_word_returns_404(self):
        """POST /api/admin/vocabulary/update-image for non-existent word returns 404"""
        # First, get the vocabulary groups to find a real lesson_id
        groups_response = requests.get(
            f"{BASE_URL}/api/admin/vocabulary-groups",
            params={"admin_email": VALID_ADMIN_EMAIL}
        )
        
        if groups_response.status_code != 200:
            pytest.skip("Could not fetch vocabulary groups")
        
        groups = groups_response.json().get("groups", [])
        if not groups:
            pytest.skip("No vocabulary groups available")
        
        # Get first lesson with words
        target_lesson_id = None
        for stage in groups:
            for unit in stage.get("units", []):
                for lesson in unit.get("lessons", []):
                    if lesson.get("words"):
                        target_lesson_id = lesson["lesson_id"]
                        break
                if target_lesson_id:
                    break
            if target_lesson_id:
                break
        
        if not target_lesson_id:
            pytest.skip("No lessons found for testing")
        
        # Try to update a word that doesn't exist
        response = requests.post(
            f"{BASE_URL}/api/admin/vocabulary/update-image",
            data={
                "admin_email": VALID_ADMIN_EMAIL,
                "lesson_id": target_lesson_id,
                "word": "completely_nonexistent_word_xyz_123",
                "image_url": "https://example.com/image.png"
            }
        )
        
        # Should return 404 because word not found in lesson
        assert response.status_code == 404, f"Expected 404 for non-existent word, got {response.status_code}"
        print("✓ Correctly returned 404 for non-existent word in lesson")


class TestAdminEmailValidation:
    """Test different admin email scenarios"""
    
    def test_exact_admin_email_match(self):
        """Test exact admin email works"""
        response = requests.get(
            f"{BASE_URL}/api/admin/vocabulary-groups",
            params={"admin_email": "aga.durdy@gmail.com"}
        )
        assert response.status_code == 200, f"Exact admin email should work, got {response.status_code}"
        print("✓ Exact admin email match works")
    
    def test_case_insensitive_admin_check(self):
        """Test that admin email check is case-insensitive"""
        response = requests.get(
            f"{BASE_URL}/api/admin/vocabulary-groups",
            params={"admin_email": "AGA.DURDY@GMAIL.COM"}
        )
        assert response.status_code == 200, f"Case-insensitive admin check should work, got {response.status_code}"
        print("✓ Case-insensitive admin email check works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
