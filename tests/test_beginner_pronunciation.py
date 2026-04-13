"""
Test Beginner Pronunciation API Endpoints
==========================================
Tests for:
- GET /api/beginner/pronunciation/words/{topic} - Get practice words for a topic
- POST /api/beginner/pronunciation/assess - Assess pronunciation with audio
"""

import pytest
import requests
import os
import wave
import struct
import tempfile

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPronunciationWordsEndpoint:
    """Tests for GET /api/beginner/pronunciation/words/{topic}"""
    
    def test_get_family_words(self):
        """Test getting pronunciation words for family topic"""
        response = requests.get(f"{BASE_URL}/api/beginner/pronunciation/words/family")
        assert response.status_code == 200
        
        data = response.json()
        assert "topic" in data
        assert data["topic"] == "family"
        assert "words" in data
        assert len(data["words"]) > 0
        
        # Verify word structure
        word = data["words"][0]
        assert "word" in word
        assert "phonetic" in word
        assert "simple" in word
        
        # Verify expected words
        words = [w["word"] for w in data["words"]]
        assert "mother" in words
        assert "father" in words
    
    def test_get_food_words(self):
        """Test getting pronunciation words for food topic"""
        response = requests.get(f"{BASE_URL}/api/beginner/pronunciation/words/food")
        assert response.status_code == 200
        
        data = response.json()
        assert data["topic"] == "food"
        assert len(data["words"]) > 0
        
        words = [w["word"] for w in data["words"]]
        assert "apple" in words
        assert "water" in words
    
    def test_get_daily_life_words(self):
        """Test getting pronunciation words for daily_life topic"""
        response = requests.get(f"{BASE_URL}/api/beginner/pronunciation/words/daily_life")
        assert response.status_code == 200
        
        data = response.json()
        assert data["topic"] == "daily_life"
        assert len(data["words"]) > 0
        
        words = [w["word"] for w in data["words"]]
        assert "morning" in words
        assert "school" in words
    
    def test_get_greetings_words(self):
        """Test getting pronunciation words for greetings topic"""
        response = requests.get(f"{BASE_URL}/api/beginner/pronunciation/words/greetings")
        assert response.status_code == 200
        
        data = response.json()
        assert data["topic"] == "greetings"
        assert len(data["words"]) > 0
        
        words = [w["word"] for w in data["words"]]
        assert "hello" in words
        assert "goodbye" in words
        assert "thank you" in words
    
    def test_unknown_topic_returns_default(self):
        """Test that unknown topic returns default greetings words"""
        response = requests.get(f"{BASE_URL}/api/beginner/pronunciation/words/unknown_topic")
        assert response.status_code == 200
        
        data = response.json()
        assert data["topic"] == "unknown_topic"
        # Should return greetings as default
        assert len(data["words"]) > 0
    
    def test_word_phonetic_format(self):
        """Test that phonetic guides are properly formatted"""
        response = requests.get(f"{BASE_URL}/api/beginner/pronunciation/words/family")
        assert response.status_code == 200
        
        data = response.json()
        for word in data["words"]:
            # Phonetic should start with / and end with /
            assert word["phonetic"].startswith("/")
            assert word["phonetic"].endswith("/")
            # Simple pronunciation should be uppercase
            assert word["simple"].isupper() or "-" in word["simple"]


class TestPronunciationAssessEndpoint:
    """Tests for POST /api/beginner/pronunciation/assess"""
    
    @pytest.fixture
    def silent_audio_file(self):
        """Create a silent WAV file for testing"""
        temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        sample_rate = 16000
        duration = 1  # seconds
        num_samples = sample_rate * duration
        
        with wave.open(temp_file.name, 'w') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            for _ in range(num_samples):
                wav_file.writeframes(struct.pack('h', 0))
        
        yield temp_file.name
        
        # Cleanup
        os.unlink(temp_file.name)
    
    def test_assess_pronunciation_with_silent_audio(self, silent_audio_file):
        """Test pronunciation assessment with silent audio returns expected response"""
        with open(silent_audio_file, 'rb') as f:
            files = {'audio': ('test.wav', f, 'audio/wav')}
            data = {'reference_text': 'hello', 'language': 'en-US'}
            
            response = requests.post(
                f"{BASE_URL}/api/beginner/pronunciation/assess",
                files=files,
                data=data
            )
        
        assert response.status_code == 200
        
        result = response.json()
        assert "success" in result
        assert "feedback" in result
        
        feedback = result["feedback"]
        # Silent audio should return low scores
        assert "overall_score" in feedback
        assert "stars" in feedback
        assert "main_feedback" in feedback
        assert "encouragement" in feedback
        assert "tips" in feedback
        
        # Stars should be 1-5 range
        assert 1 <= feedback["stars"] <= 5
    
    def test_assess_pronunciation_response_structure(self, silent_audio_file):
        """Test that pronunciation assessment returns proper structure"""
        with open(silent_audio_file, 'rb') as f:
            files = {'audio': ('test.wav', f, 'audio/wav')}
            data = {'reference_text': 'mother', 'language': 'en-US'}
            
            response = requests.post(
                f"{BASE_URL}/api/beginner/pronunciation/assess",
                files=files,
                data=data
            )
        
        assert response.status_code == 200
        
        result = response.json()
        feedback = result["feedback"]
        
        # Check detailed scores structure
        assert "detailed_scores" in feedback
        detailed = feedback["detailed_scores"]
        assert "accuracy" in detailed
        assert "fluency" in detailed
        assert "rhythm" in detailed
        assert "pronunciation" in detailed
        
        # Check word feedback structure
        assert "word_feedback" in feedback
        if len(feedback["word_feedback"]) > 0:
            word_fb = feedback["word_feedback"][0]
            assert "word" in word_fb
            assert "score" in word_fb
            assert "status" in word_fb
            assert "tip" in word_fb
    
    def test_assess_pronunciation_with_different_words(self, silent_audio_file):
        """Test pronunciation assessment with different reference words"""
        test_words = ["apple", "school", "goodbye"]
        
        for word in test_words:
            with open(silent_audio_file, 'rb') as f:
                files = {'audio': ('test.wav', f, 'audio/wav')}
                data = {'reference_text': word, 'language': 'en-US'}
                
                response = requests.post(
                    f"{BASE_URL}/api/beginner/pronunciation/assess",
                    files=files,
                    data=data
                )
            
            assert response.status_code == 200, f"Failed for word: {word}"
            result = response.json()
            assert "feedback" in result
            assert result["feedback"]["target_text"] == word
    
    def test_assess_pronunciation_missing_audio(self):
        """Test that missing audio returns error"""
        data = {'reference_text': 'hello', 'language': 'en-US'}
        
        response = requests.post(
            f"{BASE_URL}/api/beginner/pronunciation/assess",
            data=data
        )
        
        # Should return 422 for missing required field
        assert response.status_code == 422
    
    def test_assess_pronunciation_missing_reference_text(self, silent_audio_file):
        """Test that missing reference_text returns error"""
        with open(silent_audio_file, 'rb') as f:
            files = {'audio': ('test.wav', f, 'audio/wav')}
            
            response = requests.post(
                f"{BASE_URL}/api/beginner/pronunciation/assess",
                files=files
            )
        
        # Should return 422 for missing required field
        assert response.status_code == 422


class TestBeginnerEnglishLessons:
    """Tests for beginner English lessons that include vocabulary"""
    
    def test_get_beginner_lessons(self):
        """Test getting all beginner English lessons"""
        response = requests.get(f"{BASE_URL}/api/beginner-english/lessons")
        assert response.status_code == 200
        
        lessons = response.json()
        assert isinstance(lessons, list)
        
        if len(lessons) > 0:
            lesson = lessons[0]
            assert "id" in lesson
            assert "title" in lesson
    
    def test_beginner_lesson_has_vocabulary(self):
        """Test that beginner lessons include vocabulary section"""
        response = requests.get(f"{BASE_URL}/api/beginner-english/lessons")
        assert response.status_code == 200
        
        lessons = response.json()
        
        if len(lessons) > 0:
            # Get first lesson details
            lesson_id = lessons[0]["id"]
            detail_response = requests.get(f"{BASE_URL}/api/beginner-english/lessons/{lesson_id}")
            
            if detail_response.status_code == 200:
                lesson = detail_response.json()
                # Check for vocabulary section
                assert "vocabulary" in lesson or "vocab" in lesson or "words" in lesson


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
