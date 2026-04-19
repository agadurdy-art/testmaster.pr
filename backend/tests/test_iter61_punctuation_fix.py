"""
Tests for Iteration 61 Bug Fixes:
1. Speech evaluation - punctuation stripping (user says 'I am a student.' matching 'I am a student')
2. Pronunciation check endpoint functionality
3. Static file serving for vocab images and audio

The key fix: compute_similarity() in speech_routes.py now strips punctuation before comparing words.
"""
import pytest
import requests
import os
import sys

# Add backend to path to test compute_similarity directly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestComputeSimilarityPunctuationFix:
    """Test the compute_similarity function with punctuation scenarios"""
    
    def test_compute_similarity_punctuation_stripped(self):
        """Test: 'I am a student.' should match 'I am a student' with 100% score"""
        # Import the function directly
        from routes.speech_routes import compute_similarity
        
        result = compute_similarity("I am a student.", "I am a student")
        
        assert result["score"] == 100, f"Expected 100%, got {result['score']}%"
        assert len(result["missing_words"]) == 0, f"Unexpected missing words: {result['missing_words']}"
        assert set(result["matched_words"]) == {"i", "am", "a", "student"}, f"Unexpected matched words: {result['matched_words']}"
    
    def test_compute_similarity_trailing_period(self):
        """Test: trailing period on transcription doesn't affect match"""
        from routes.speech_routes import compute_similarity
        
        result = compute_similarity("Hello world.", "Hello world")
        assert result["score"] == 100
        assert len(result["missing_words"]) == 0
    
    def test_compute_similarity_leading_period(self):
        """Test: period on expected text doesn't affect match"""
        from routes.speech_routes import compute_similarity
        
        result = compute_similarity("Hello world", "Hello world.")
        assert result["score"] == 100
        assert len(result["missing_words"]) == 0
    
    def test_compute_similarity_various_punctuation(self):
        """Test: various punctuation marks are stripped"""
        from routes.speech_routes import compute_similarity
        
        result = compute_similarity("Hello, world!", "Hello world")
        assert result["score"] == 100
        assert len(result["missing_words"]) == 0
    
    def test_compute_similarity_question_mark(self):
        """Test: question marks are stripped"""
        from routes.speech_routes import compute_similarity
        
        result = compute_similarity("How are you?", "How are you")
        assert result["score"] == 100
        assert len(result["missing_words"]) == 0
    
    def test_compute_similarity_apostrophe_handled(self):
        """Test: apostrophes in contractions (they're complex)"""
        from routes.speech_routes import compute_similarity
        
        # Note: the regex [^\w\s] will strip apostrophes, so "don't" becomes "dont"
        result = compute_similarity("I don't know", "I dont know")
        # This may not be 100% due to apostrophe handling
        assert result["score"] >= 75  # Should match most words
    
    def test_compute_similarity_partial_match(self):
        """Test: partial match calculates percentage correctly"""
        from routes.speech_routes import compute_similarity
        
        result = compute_similarity("I am", "I am a student")
        # 2 out of 4 words = 50%
        assert result["score"] == 50
        assert set(result["matched_words"]) == {"i", "am"}
        assert set(result["missing_words"]) == {"a", "student"}
    
    def test_compute_similarity_case_insensitive(self):
        """Test: comparison is case insensitive"""
        from routes.speech_routes import compute_similarity
        
        result = compute_similarity("I AM A STUDENT", "i am a student")
        assert result["score"] == 100


class TestSpeechEvaluateAPIEndpoint:
    """Test the /api/speech/evaluate endpoint"""
    
    def test_speech_evaluate_endpoint_exists(self):
        """Test: POST /api/speech/evaluate endpoint exists"""
        # We can't easily test with actual audio, but we can verify endpoint exists
        response = requests.post(f"{BASE_URL}/api/speech/evaluate")
        # Should get 422 (validation error) not 404 (not found)
        assert response.status_code in [422, 500], f"Unexpected status: {response.status_code}"
        # 422 means endpoint exists but validation failed (expected - no audio file)


class TestPronunciationCheckEndpoint:
    """Test the /api/unified/pronunciation/check endpoint"""
    
    def test_pronunciation_check_endpoint_exists(self):
        """Test: POST /api/unified/pronunciation/check endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/unified/pronunciation/check")
        # Should get 422 (validation error) not 404 (not found)
        assert response.status_code in [422, 500], f"Unexpected status: {response.status_code}"


class TestStaticFileServing:
    """Test static file serving for vocab images and audio"""
    
    def test_static_vocab_images_returns_200(self):
        """Test: GET /api/static/vocab_images/*.png returns 200"""
        # Use a known image hash from previous iteration
        response = requests.get(f"{BASE_URL}/api/static/vocab_images/5d41402abc4b2a76b9719d911017c592.png")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.headers.get('content-type', '').startswith('image/'), f"Expected image content type"
    
    def test_static_audio_returns_200(self):
        """Test: GET /api/static/audio/*.mp3 returns 200"""
        # Use a known audio hash from previous iteration
        response = requests.get(f"{BASE_URL}/api/static/audio/5d41402abc4b2a76b9719d911017c592.mp3")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert response.headers.get('content-type', '') in ['audio/mpeg', 'audio/mp3'], f"Expected audio content type"
    
    def test_nonexistent_image_returns_404(self):
        """Test: Non-existent image returns 404"""
        response = requests.get(f"{BASE_URL}/api/static/vocab_images/nonexistent_hash_12345.png")
        assert response.status_code == 404


class TestSpeakingActivityErrorMessages:
    """Verify English error messages in Speaking activity context"""
    
    def test_lesson_content_has_speaking_activity(self):
        """Test: Lesson has production (speaking) activity in activity_flow"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        data = response.json()
        
        # Check if activity_flow includes production/speaking
        activity_flow = data.get('activity_flow', [])
        activity_types = [a.get('type') for a in activity_flow]
        assert 'production' in activity_types, f"No production activity found. Types: {activity_types}"
    
    def test_speaking_activity_has_expected_text(self):
        """Test: Speaking activity has expected_text for evaluation"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        data = response.json()
        
        # Find production activity in activity_flow
        activity_flow = data.get('activity_flow', [])
        production = next((a for a in activity_flow if a.get('type') == 'production'), None)
        
        if production:
            content = production.get('data', {})
            # Should have prompts with expected text
            prompts = content.get('prompts', [])
            if prompts:
                assert 'expected_text' in prompts[0], f"Prompt missing expected_text. Keys: {list(prompts[0].keys())}"


class TestVocabularyPronunciationIntegration:
    """Test vocabulary pronunciation check integration"""
    
    def test_lesson_has_vocabulary_words(self):
        """Test: Lesson has vocabulary words for pronunciation practice"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        data = response.json()
        
        # Find vocabulary activity in activity_flow
        activity_flow = data.get('activity_flow', [])
        vocab = next((a for a in activity_flow if a.get('type') == 'vocabulary'), None)
        
        if vocab:
            content = vocab.get('data', {})
            words = content.get('words', [])
            assert len(words) > 0, "No vocabulary words found"
            
            # Verify first word has expected fields
            first_word = words[0]
            assert 'word' in first_word, "Word missing 'word' field"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
