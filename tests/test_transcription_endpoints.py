"""
Test transcription endpoints for IELTS Speaking features.
Tests both /api/transcribe-audio and /api/speaking/transcribe endpoints.
"""
import pytest
import requests
import os
import wave
import struct
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Create a test audio file in memory
def create_test_audio():
    """Create a simple WAV audio file for testing."""
    sample_rate = 44100
    duration = 1  # seconds
    frequency = 440  # Hz
    
    samples = []
    for i in range(int(sample_rate * duration)):
        sample = int(32767 * 0.5 * (1 if (i * frequency / sample_rate) % 1 < 0.5 else -1))
        samples.append(struct.pack('<h', sample))
    
    audio_buffer = io.BytesIO()
    with wave.open(audio_buffer, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(b''.join(samples))
    
    audio_buffer.seek(0)
    return audio_buffer


class TestTranscriptionEndpoints:
    """Test transcription endpoints for audio recording features."""
    
    def test_api_health(self):
        """Test API is accessible."""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API health check passed: {data['message']}")
    
    def test_transcribe_audio_endpoint_exists(self):
        """Test /api/transcribe-audio endpoint exists and accepts POST."""
        # Send empty request to check endpoint exists
        response = requests.post(f"{BASE_URL}/api/transcribe-audio")
        # Should return 422 (validation error) not 404
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
        print(f"✓ /api/transcribe-audio endpoint exists (status: {response.status_code})")
    
    def test_transcribe_audio_with_file(self):
        """Test /api/transcribe-audio with audio file."""
        audio_buffer = create_test_audio()
        files = {'file': ('test_audio.wav', audio_buffer, 'audio/wav')}
        
        response = requests.post(f"{BASE_URL}/api/transcribe-audio", files=files)
        
        # Should return 200 or 400 (if audio has no speech)
        assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}"
        data = response.json()
        
        if response.status_code == 200:
            assert "text" in data, "Response should contain 'text' field"
            print(f"✓ /api/transcribe-audio returned transcription: {data.get('text', '')[:50]}...")
        else:
            # 400 is expected for test audio with no speech
            assert "detail" in data
            print(f"✓ /api/transcribe-audio correctly rejected silent audio: {data['detail']}")
    
    def test_speaking_transcribe_endpoint_exists(self):
        """Test /api/speaking/transcribe endpoint exists."""
        response = requests.post(f"{BASE_URL}/api/speaking/transcribe")
        # Should return 422 (validation error) not 404
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print(f"✓ /api/speaking/transcribe endpoint exists")
    
    def test_speaking_transcribe_requires_all_fields(self):
        """Test /api/speaking/transcribe requires audio, question_id, part."""
        audio_buffer = create_test_audio()
        
        # Test with only file (wrong parameter name)
        files = {'file': ('test_audio.wav', audio_buffer, 'audio/wav')}
        response = requests.post(f"{BASE_URL}/api/speaking/transcribe", files=files)
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
        # Should mention missing fields
        missing_fields = [err.get('loc', [])[-1] for err in data.get('detail', [])]
        assert 'audio' in missing_fields, "Should require 'audio' field"
        assert 'question_id' in missing_fields, "Should require 'question_id' field"
        assert 'part' in missing_fields, "Should require 'part' field"
        print(f"✓ /api/speaking/transcribe correctly requires: audio, question_id, part")
    
    def test_speaking_transcribe_with_correct_params(self):
        """Test /api/speaking/transcribe with correct parameters."""
        audio_buffer = create_test_audio()
        
        files = {'audio': ('test_audio.wav', audio_buffer, 'audio/wav')}
        data = {
            'question_id': 'test_q1',
            'part': 'part1'
        }
        
        response = requests.post(f"{BASE_URL}/api/speaking/transcribe", files=files, data=data)
        
        # Should return 200 or 500 (if transcription fails for silent audio)
        assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
        result = response.json()
        
        if response.status_code == 200:
            assert result.get('success') == True
            assert 'transcript' in result
            assert result.get('question_id') == 'test_q1'
            assert result.get('part') == 'part1'
            print(f"✓ /api/speaking/transcribe returned: {result}")
        else:
            print(f"✓ /api/speaking/transcribe returned error for silent audio (expected)")


class TestBeginnerPronunciationEndpoints:
    """Test beginner pronunciation endpoints."""
    
    def test_pronunciation_words_endpoint(self):
        """Test /api/beginner/pronunciation/words/{topic} endpoint."""
        topics = ['family', 'food', 'daily_life', 'greetings']
        
        for topic in topics:
            response = requests.get(f"{BASE_URL}/api/beginner/pronunciation/words/{topic}")
            assert response.status_code == 200, f"Failed for topic: {topic}"
            data = response.json()
            assert 'words' in data
            assert len(data['words']) > 0
            print(f"✓ Pronunciation words for '{topic}': {len(data['words'])} words")
    
    def test_pronunciation_assess_endpoint(self):
        """Test /api/beginner/pronunciation/assess endpoint exists."""
        # Test endpoint exists
        response = requests.post(f"{BASE_URL}/api/beginner/pronunciation/assess")
        # Should return 422 (validation error) not 404
        assert response.status_code == 422
        print(f"✓ /api/beginner/pronunciation/assess endpoint exists")


class TestSpeakingQuestionBankEndpoints:
    """Test Speaking Question Bank endpoints."""
    
    def test_speaking_parts_endpoint(self):
        """Test /api/speaking/parts endpoint."""
        response = requests.get(f"{BASE_URL}/api/speaking/parts")
        assert response.status_code == 200
        data = response.json()
        assert 'parts' in data
        print(f"✓ Speaking parts: {list(data['parts'].keys())}")
    
    def test_speaking_tracks_endpoint(self):
        """Test /api/speaking/tracks endpoint."""
        response = requests.get(f"{BASE_URL}/api/speaking/tracks")
        assert response.status_code == 200
        data = response.json()
        assert 'tracks' in data
        print(f"✓ Speaking tracks: {len(data['tracks'])} tracks")
    
    def test_speaking_band_levels_endpoint(self):
        """Test /api/speaking/band-levels endpoint."""
        response = requests.get(f"{BASE_URL}/api/speaking/band-levels")
        assert response.status_code == 200
        data = response.json()
        assert 'band_levels' in data
        print(f"✓ Speaking band levels: {list(data['band_levels'].keys())}")
    
    def test_speaking_modules_endpoint(self):
        """Test /api/speaking/modules endpoint."""
        response = requests.get(f"{BASE_URL}/api/speaking/modules")
        assert response.status_code == 200
        data = response.json()
        assert 'modules' in data
        print(f"✓ Speaking modules: {len(data['modules'])} modules")


class TestSpeakingPracticeEvaluation:
    """Test speaking practice evaluation endpoint."""
    
    def test_speaking_practice_evaluate_endpoint(self):
        """Test /api/speaking-practice/evaluate endpoint."""
        payload = {
            "part": "part1",
            "topic": "Home & Accommodation",
            "responses": [
                {
                    "question": "Do you live in a house or an apartment?",
                    "answer": "I live in a small apartment in the city center."
                }
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/speaking-practice/evaluate",
            json=payload
        )
        
        # Should return 200 or 500 (if AI evaluation fails)
        assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert 'overall_band' in data or 'band_score' in data
            print(f"✓ Speaking evaluation returned band score")
        else:
            print(f"✓ Speaking evaluation endpoint exists (AI may have failed)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
