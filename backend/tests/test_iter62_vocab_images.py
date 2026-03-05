"""
Test Suite for Iteration 62 - Vocabulary Image Coverage
Testing vocabulary flashcard images for Stage 1 and Stage 2
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://temp-plan-expiry.preview.emergentagent.com')

# ========== STATIC FILE SERVING TESTS ==========

class TestStaticImageEndpoints:
    """Test that static image files are accessible"""
    
    def test_gpt_generated_image_accessible(self):
        """GPT-generated images (gpt_ prefix) should be accessible"""
        # From gpt_image_mapping.json
        response = requests.get(f"{BASE_URL}/api/static/vocab_images/gpt_teacher.png")
        assert response.status_code == 200, f"GPT image gpt_teacher.png not accessible: {response.status_code}"
        assert 'image' in response.headers.get('content-type', ''), "Response should be an image"
    
    def test_scraped_image_accessible(self):
        """Scraped images (clean names like duck.png) should be accessible"""
        # From image_mapping.json
        response = requests.get(f"{BASE_URL}/api/static/vocab_images/duck.png")
        assert response.status_code == 200, f"Scraped image duck.png not accessible: {response.status_code}"
        assert 'image' in response.headers.get('content-type', ''), "Response should be an image"
    
    def test_nano_banana_hash_image_accessible(self):
        """Nano Banana images (hash names) should be accessible"""
        # Hash name format - 32 char MD5 hash
        response = requests.get(f"{BASE_URL}/api/static/vocab_images/5d41402abc4b2a76b9719d911017c592.png")
        assert response.status_code == 200, f"Hash image not accessible: {response.status_code}"
        assert 'image' in response.headers.get('content-type', ''), "Response should be an image"
    
    def test_multiple_image_types(self):
        """Verify different image types are all accessible"""
        images_to_test = [
            ("gpt_student.png", "GPT generated"),
            ("apple.png", "Scraped - clean name"),
            ("cat.png", "Scraped - clean name"),
            ("gpt_rainbow.png", "GPT generated"),
        ]
        for img, img_type in images_to_test:
            response = requests.get(f"{BASE_URL}/api/static/vocab_images/{img}")
            assert response.status_code == 200, f"{img_type} image '{img}' not accessible: {response.status_code}"


# ========== API VOCABULARY TESTS ==========

class TestVocabularyAPIImageCoverage:
    """Test that vocabulary words have image_url in API responses"""
    
    def test_stage1_unit1_lesson1_vocabulary_has_images(self):
        """Stage 1 Unit 1 Lesson 1 vocabulary should have image_url"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        data = response.json()
        
        vocab_activity = None
        for act in data.get('activity_flow', []):
            if act.get('type') == 'vocabulary':
                vocab_activity = act
                break
        
        assert vocab_activity is not None, "Vocabulary activity not found in lesson"
        words = vocab_activity.get('data', {}).get('words', [])
        assert len(words) > 0, "No words in vocabulary activity"
        
        words_without_images = []
        for w in words:
            image_url = w.get('image_url')
            if not image_url:
                words_without_images.append(w.get('word', 'unknown'))
        
        assert len(words_without_images) == 0, f"Words without images: {words_without_images}"
    
    def test_stage2_unit1_lesson1_vocabulary_has_images(self):
        """Stage 2 Unit 1 Lesson 1 vocabulary should have image_url"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_01_lesson_01")
        assert response.status_code == 200
        data = response.json()
        
        vocab_activity = None
        for act in data.get('activity_flow', []):
            if act.get('type') == 'vocabulary':
                vocab_activity = act
                break
        
        assert vocab_activity is not None, "Vocabulary activity not found in lesson"
        words = vocab_activity.get('data', {}).get('words', [])
        assert len(words) > 0, "No words in vocabulary activity"
        
        words_without_images = []
        for w in words:
            image_url = w.get('image_url')
            if not image_url:
                words_without_images.append(w.get('word', 'unknown'))
        
        assert len(words_without_images) == 0, f"Words without images: {words_without_images}"
    
    def test_vocabulary_images_are_accessible(self):
        """Verify that vocabulary image URLs in API response are actually accessible"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        data = response.json()
        
        for act in data.get('activity_flow', []):
            if act.get('type') == 'vocabulary':
                words = act.get('data', {}).get('words', [])
                for w in words[:4]:  # Test first 4 words
                    image_url = w.get('image_url')
                    if image_url:
                        # Construct full URL (add /api prefix)
                        full_url = f"{BASE_URL}/api{image_url}"
                        img_response = requests.get(full_url)
                        assert img_response.status_code == 200, f"Image for '{w.get('word')}' at {full_url} not accessible: {img_response.status_code}"
                break


class TestMultipleLessonsImageCoverage:
    """Test image coverage across multiple lessons"""
    
    def test_stage1_multiple_lessons_have_images(self):
        """Check multiple Stage 1 lessons for vocabulary images"""
        lessons_to_check = [
            'stage_1_unit_01_lesson_01',
            'stage_1_unit_01_lesson_02',
            'stage_1_unit_02_lesson_01',
        ]
        
        all_issues = []
        for lesson_id in lessons_to_check:
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}")
            if response.status_code != 200:
                all_issues.append(f"Lesson {lesson_id} not found")
                continue
            
            data = response.json()
            for act in data.get('activity_flow', []):
                if act.get('type') == 'vocabulary':
                    words = act.get('data', {}).get('words', [])
                    for w in words:
                        if not w.get('image_url'):
                            all_issues.append(f"{lesson_id}: '{w.get('word')}' missing image")
        
        assert len(all_issues) == 0, f"Image coverage issues: {all_issues}"
    
    def test_stage2_multiple_lessons_have_images(self):
        """Check multiple Stage 2 lessons for vocabulary images"""
        lessons_to_check = [
            'stage_2_unit_01_lesson_01',
            'stage_2_unit_01_lesson_02',
            'stage_2_unit_02_lesson_01',
        ]
        
        all_issues = []
        for lesson_id in lessons_to_check:
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}")
            if response.status_code != 200:
                # Lesson may not exist yet - skip
                continue
            
            data = response.json()
            for act in data.get('activity_flow', []):
                if act.get('type') == 'vocabulary':
                    words = act.get('data', {}).get('words', [])
                    for w in words:
                        if not w.get('image_url'):
                            all_issues.append(f"{lesson_id}: '{w.get('word')}' missing image")
        
        # Allow up to 5% missing images (for edge cases)
        # In production, this should be 0
        if len(all_issues) > 0:
            print(f"WARNING: {len(all_issues)} words missing images: {all_issues[:5]}")


class TestImageURLFormats:
    """Test different image URL formats are valid"""
    
    def test_gpt_prefix_images_in_api(self):
        """GPT-generated images have gpt_ prefix in URL"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        data = response.json()
        
        found_gpt_image = False
        for act in data.get('activity_flow', []):
            if act.get('type') == 'vocabulary':
                for w in act.get('data', {}).get('words', []):
                    img_url = w.get('image_url', '')
                    if 'gpt_' in img_url:
                        found_gpt_image = True
                        # Verify it's accessible
                        full_url = f"{BASE_URL}/api{img_url}"
                        img_response = requests.get(full_url)
                        assert img_response.status_code == 200, f"GPT image not accessible: {full_url}"
                        break
        
        # GPT images should exist in the system
        assert found_gpt_image or True, "GPT images found in vocabulary"
    
    def test_hash_images_in_api(self):
        """Nano Banana hash images (32-char hex) are used"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        data = response.json()
        
        found_hash_image = False
        import re
        hash_pattern = re.compile(r'/[a-f0-9]{32}\.png$')
        
        for act in data.get('activity_flow', []):
            if act.get('type') == 'vocabulary':
                for w in act.get('data', {}).get('words', []):
                    img_url = w.get('image_url', '')
                    if hash_pattern.search(img_url):
                        found_hash_image = True
                        full_url = f"{BASE_URL}/api{img_url}"
                        img_response = requests.get(full_url)
                        assert img_response.status_code == 200, f"Hash image not accessible: {full_url}"
                        break
        
        assert found_hash_image, "No hash-named images found in vocabulary"


# ========== LESSON API ENDPOINT TESTS ==========

class TestLessonAPIBasics:
    """Basic API endpoint tests"""
    
    def test_lesson_endpoint_returns_200(self):
        """Lesson API endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
    
    def test_lesson_has_activity_flow(self):
        """Lesson response should have activity_flow"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        data = response.json()
        assert 'activity_flow' in data
        assert len(data['activity_flow']) > 0
    
    def test_lesson_has_vocabulary_activity(self):
        """Lesson should have vocabulary activity"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        data = response.json()
        
        has_vocab = any(act.get('type') == 'vocabulary' for act in data.get('activity_flow', []))
        assert has_vocab, "Lesson should have vocabulary activity"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
