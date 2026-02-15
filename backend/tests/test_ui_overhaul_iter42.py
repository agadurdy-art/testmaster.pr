"""
Test Suite for UI/UX Overhaul - Iteration 42
Testing: Stage theming, VocabularyModule with Record & Check, Lesson Path sidebar
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLessonAndActivityAPIs:
    """Test lesson and activity endpoints for UI overhaul"""
    
    def test_lesson_01_exists_with_10_activities(self):
        """Verify lesson has 10 activity steps in activity_flow"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        
        data = response.json()
        assert "activity_flow" in data
        assert len(data["activity_flow"]) == 10, f"Expected 10 activities, got {len(data['activity_flow'])}"
        
        # Verify activity types in order
        expected_types = [
            "retrieval_warmup", "vocabulary", "micro_game_vocab", "micro_reading",
            "grammar_focus", "micro_game_grammar", "listening", "production",
            "exit_ticket", "auto_review"
        ]
        actual_types = [a["type"] for a in data["activity_flow"]]
        assert actual_types == expected_types, f"Activity types mismatch: {actual_types}"
        
    def test_lesson_stage_id_is_stage_1(self):
        """Verify lesson belongs to Stage 1 for amber/orange theme"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("stage_id") == "stage_1_foundations", f"Expected stage_1_foundations, got {data.get('stage_id')}"


class TestVocabularyActivity:
    """Test vocabulary activity endpoint for new iSmart-style UI"""
    
    def test_vocabulary_activity_returns_words(self):
        """Verify vocabulary activity returns words with required fields"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        assert "words" in data
        assert len(data["words"]) >= 8, f"Expected at least 8 words, got {len(data['words'])}"
        
    def test_vocabulary_words_have_image_emoji(self):
        """Verify words have image_emoji field for card display"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        words = data.get("words", [])
        
        # Check first word (hello) has emoji
        hello_word = next((w for w in words if w["word"] == "hello"), None)
        assert hello_word is not None, "Word 'hello' not found"
        assert hello_word.get("image_emoji") == "👋", f"Expected 👋 emoji for hello, got {hello_word.get('image_emoji')}"
        
    def test_vocabulary_words_have_ipa(self):
        """Verify words have IPA pronunciation"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        words = data.get("words", [])
        
        for word in words[:3]:  # Check first 3 words
            assert "ipa" in word, f"Word {word['word']} missing IPA"
            assert word["ipa"].startswith("/"), f"IPA should start with /, got {word['ipa']}"
            
    def test_vocabulary_words_have_definition_and_example(self):
        """Verify words have definition and example sentence"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        words = data.get("words", [])
        
        for word in words[:3]:
            assert "definition" in word, f"Word {word['word']} missing definition"
            assert "example_sentence" in word, f"Word {word['word']} missing example_sentence"
            assert len(word["definition"]) > 0, f"Word {word['word']} has empty definition"
            assert len(word["example_sentence"]) > 0, f"Word {word['word']} has empty example_sentence"
            

class TestPronunciationEndpoint:
    """Test pronunciation check endpoint"""
    
    def test_pronunciation_endpoint_exists(self):
        """Verify endpoint exists and returns 422 for missing params (not 404)"""
        response = requests.post(f"{BASE_URL}/api/unified/pronunciation/check")
        # Should return 422 (validation error) not 404 (not found)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        
    def test_pronunciation_endpoint_requires_audio_and_word(self):
        """Verify endpoint requires audio file and target_word"""
        response = requests.post(f"{BASE_URL}/api/unified/pronunciation/check")
        assert response.status_code == 422
        
        data = response.json()
        assert "detail" in data
        
        # Check for required fields
        error_fields = [err["loc"][-1] for err in data["detail"] if err["type"] == "missing"]
        assert "audio" in error_fields, "Should require 'audio' field"
        assert "target_word" in error_fields, "Should require 'target_word' field"


class TestAuthLogin:
    """Test login with provided credentials"""
    
    def test_login_with_test_credentials(self):
        """Verify login works with provided credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "geldiaga67@gmail.com",
            "password": "geldiaga67"
        })
        assert response.status_code == 200, f"Login failed with status {response.status_code}"
        
        data = response.json()
        assert "user" in data or "id" in data, "Response should contain user data"


class TestActivityFlowHasSkipInfo:
    """Test that activity flow includes skip information"""
    
    def test_warmup_is_skippable(self):
        """Verify warmup activity is marked as skippable"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        
        data = response.json()
        warmup = next((a for a in data["activity_flow"] if a["type"] == "retrieval_warmup"), None)
        assert warmup is not None
        assert warmup.get("is_skippable") == True, "Warmup should be skippable"


class TestVocabularyWordsList:
    """Test vocabulary words match expected list"""
    
    def test_lesson_1_has_greeting_words(self):
        """Verify lesson 1 vocabulary includes greeting words"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        words = [w["word"] for w in data.get("words", [])]
        
        expected_words = ["hello", "hi", "goodbye", "bye", "good morning", "good night", "good afternoon", "see you"]
        
        for expected in expected_words:
            assert expected in words, f"Expected word '{expected}' not found in vocabulary"
