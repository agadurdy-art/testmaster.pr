"""
Bug Fixes Verification Tests - Iteration 29
============================================
Tests for 4 bug fixes in Quick Practice mode:
1. Reading answer comparison logic (extractOptionValue + normalizeAnswer)
2. Listening audio TTS endpoint returns base64 JSON
3. Writing redirect to /writing-practice
4. Backend filter for non-empty correct field
"""

import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestBugFix1ReadingAnswerComparison:
    """Bug Fix 1: Reading answer comparison - correct answer should be marked as correct"""
    
    def test_reading_questions_have_correct_field(self):
        """All reading questions should have non-empty correct field"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=10")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('success') is True
        assert len(data.get('questions', [])) > 0
        
        # All questions should have non-empty 'correct' field
        empty_correct = [q['id'] for q in data['questions'] if not q.get('correct')]
        assert len(empty_correct) == 0, f"Questions with empty correct: {empty_correct}"
        
    def test_reading_questions_correct_formats(self):
        """Verify correct field contains valid answer formats"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=20")
        data = response.json()
        
        for q in data.get('questions', []):
            correct = q.get('correct', '')
            assert correct, f"Empty correct for {q['id']}"
            
            # Check question types with letter options
            q_type = q.get('type', '')
            if q_type in ['true-false-ng', 'true_false_ng']:
                assert correct.lower() in ['true', 'false', 'not given', 'not_given'], \
                    f"Invalid T/F/NG answer: {correct}"
            elif q_type in ['yes-no-ng', 'yes_no_ng']:
                assert correct.lower() in ['yes', 'no', 'not given', 'not_given'], \
                    f"Invalid Y/N/NG answer: {correct}"


class TestBugFix2ListeningAudio:
    """Bug Fix 2: Listening audio TTS endpoint returns JSON with base64 audio"""
    
    def test_tts_endpoint_returns_json(self):
        """TTS endpoint should return JSON with audio field"""
        response = requests.post(
            f"{BASE_URL}/api/vocab-grammar/tts",
            json={"text": "Hello world test", "voice": "alloy", "speed": 0.9}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert 'audio' in data, "Response should have 'audio' field"
        
        # Audio should be base64 encoded
        audio_b64 = data['audio']
        assert len(audio_b64) > 100, "Audio data too short"
        
        # Verify it's valid base64
        import base64
        try:
            decoded = base64.b64decode(audio_b64)
            assert len(decoded) > 0, "Decoded audio is empty"
        except Exception as e:
            pytest.fail(f"Invalid base64: {e}")
    
    def test_listening_questions_have_audio_transcript(self):
        """Listening questions should have audio_transcript field"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=listening&count=5")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get('questions', [])
        assert len(questions) > 0
        
        # At least some questions should have audio_transcript
        with_transcript = [q for q in questions if q.get('audio_transcript')]
        assert len(with_transcript) > 0, "No listening questions have audio_transcript"


class TestBugFix3WritingRedirect:
    """Bug Fix 3: Writing redirect should go to /writing-practice (frontend test)"""
    
    def test_writing_endpoints_exist(self):
        """Writing practice endpoints should exist"""
        # This tests the backend routes are set up
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=writing&count=3")
        assert response.status_code == 200


class TestBugFix4BackendFilter:
    """Bug Fix 4: Backend should filter out questions with empty correct field"""
    
    def test_all_questions_have_correct_field_reading(self):
        """Reading: All returned questions should have non-empty correct"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=30")
        data = response.json()
        
        questions = data.get('questions', [])
        empty = [q['id'] for q in questions if not q.get('correct')]
        
        assert len(empty) == 0, f"Found {len(empty)} questions with empty correct: {empty[:5]}"
    
    def test_all_questions_have_correct_field_listening(self):
        """Listening: All returned questions should have non-empty correct"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=listening&count=30")
        data = response.json()
        
        questions = data.get('questions', [])
        empty = [q['id'] for q in questions if not q.get('correct')]
        
        assert len(empty) == 0, f"Found {len(empty)} questions with empty correct: {empty[:5]}"
    
    def test_questions_random_each_request(self):
        """Questions should be randomized each request"""
        response1 = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=5")
        response2 = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=5")
        
        ids1 = set(q['id'] for q in response1.json().get('questions', []))
        ids2 = set(q['id'] for q in response2.json().get('questions', []))
        
        # Should have some different questions (not all same)
        # Note: could rarely be same, but very unlikely with 1200+ pool
        assert ids1 != ids2 or len(ids1) < 3, "Questions should be randomized"


class TestQuickPracticeFlow:
    """Test full Quick Practice flow: 3 questions, answer, feedback, summary"""
    
    def test_get_3_questions(self):
        """Should get exactly 3 questions for practice set"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=3")
        data = response.json()
        
        assert data.get('success') is True
        assert len(data.get('questions', [])) == 3
        
    def test_questions_have_required_fields(self):
        """Questions should have all required fields for frontend"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=3")
        data = response.json()
        
        for q in data.get('questions', []):
            assert 'id' in q
            assert 'text' in q
            assert 'correct' in q and q['correct'], f"Missing correct for {q['id']}"
            assert 'type' in q
            assert 'skill' in q
            
            # Reading should have passage
            if q.get('skill') == 'reading':
                assert 'passage' in q or 'passage_title' in q


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
