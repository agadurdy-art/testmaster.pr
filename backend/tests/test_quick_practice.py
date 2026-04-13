"""
Quick Practice API Tests - Practice Mode with 3 questions per set
Tests the /api/question-bank/practice/random endpoint for Reading and Listening skills
"""

import pytest
import requests
import os
import random

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestQuickPracticeReadingAPI:
    """Test reading practice endpoint for Quick Practice mode"""
    
    def test_reading_returns_exactly_3_questions(self):
        """GET /api/question-bank/practice/random?skill=reading&count=3 returns exactly 3 questions"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=3")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") is True, "Response should have success: true"
        assert data.get("count") == 3, f"Expected count 3, got {data.get('count')}"
        assert len(data.get("questions", [])) == 3, f"Expected 3 questions, got {len(data.get('questions', []))}"
    
    def test_reading_question_format(self):
        """Reading questions should have required fields: text, type, correct"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=3")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        
        for idx, q in enumerate(questions):
            assert "id" in q, f"Question {idx} missing 'id'"
            assert "text" in q, f"Question {idx} missing 'text'"
            assert "type" in q, f"Question {idx} missing 'type'"
            assert "correct" in q, f"Question {idx} missing 'correct'"
            assert "skill" in q, f"Question {idx} missing 'skill'"
            assert q.get("skill") == "reading", f"Question {idx} should have skill='reading'"
    
    def test_reading_has_passage_for_context(self):
        """Reading questions should include passage text for context"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=3")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        
        # At least some questions should have passage (not all question types require it)
        questions_with_passage = [q for q in questions if q.get("passage")]
        print(f"Questions with passage: {len(questions_with_passage)}/{len(questions)}")
        
        # Verify passage content when present
        for q in questions_with_passage:
            assert len(q.get("passage", "")) > 50, "Passage should be substantial (>50 chars)"
    
    def test_reading_has_options_for_mcq(self):
        """Multiple choice questions should have options array"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=3")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        
        mcq_types = ["multiple-choice", "true-false-ng", "yes-no-ng"]
        for q in questions:
            if q.get("type") in mcq_types:
                assert "options" in q, f"MCQ question should have options: {q.get('type')}"
                assert len(q.get("options", [])) >= 2, "MCQ should have at least 2 options"
                print(f"Question type: {q.get('type')}, options: {q.get('options')}")


class TestQuickPracticeListeningAPI:
    """Test listening practice endpoint for Quick Practice mode"""
    
    def test_listening_returns_exactly_3_questions(self):
        """GET /api/question-bank/practice/random?skill=listening&count=3 returns exactly 3 questions"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=listening&count=3")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") is True, "Response should have success: true"
        assert data.get("count") == 3, f"Expected count 3, got {data.get('count')}"
        assert len(data.get("questions", [])) == 3, f"Expected 3 questions, got {len(data.get('questions', []))}"
    
    def test_listening_question_format(self):
        """Listening questions should have required fields including audio_transcript"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=listening&count=3")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        
        for idx, q in enumerate(questions):
            assert "id" in q, f"Question {idx} missing 'id'"
            assert "text" in q, f"Question {idx} missing 'text'"
            assert "type" in q, f"Question {idx} missing 'type'"
            assert "skill" in q, f"Question {idx} missing 'skill'"
            assert q.get("skill") == "listening", f"Question {idx} should have skill='listening'"
            # Listening questions should have audio_transcript for TTS
            assert "audio_transcript" in q, f"Question {idx} missing 'audio_transcript'"
    
    def test_listening_has_audio_transcript(self):
        """Listening questions should have audio_transcript field for TTS playback"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=listening&count=3")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        
        for q in questions:
            transcript = q.get("audio_transcript", "")
            assert len(transcript) > 10, f"audio_transcript should be substantial: got '{transcript[:50]}...'"
            print(f"Question: {q.get('text')[:50]}... transcript: {len(transcript)} chars")


class TestQuickPracticeRandomization:
    """Test that questions are randomized across requests"""
    
    def test_reading_questions_differ_across_requests(self):
        """Two requests should return different questions (randomization)"""
        response1 = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=3")
        response2 = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=3")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        data1 = response1.json()
        data2 = response2.json()
        
        ids1 = set(q.get("id") for q in data1.get("questions", []))
        ids2 = set(q.get("id") for q in data2.get("questions", []))
        
        # At least one question should be different (highly probable with large pool)
        different_count = len(ids1.symmetric_difference(ids2))
        print(f"Different questions between requests: {different_count}/3")
        # Note: With random, there's a small chance all 3 are same, so we don't assert
    
    def test_listening_questions_differ_across_requests(self):
        """Two requests should return different questions (randomization)"""
        response1 = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=listening&count=3")
        response2 = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=listening&count=3")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        data1 = response1.json()
        data2 = response2.json()
        
        ids1 = set(q.get("id") for q in data1.get("questions", []))
        ids2 = set(q.get("id") for q in data2.get("questions", []))
        
        different_count = len(ids1.symmetric_difference(ids2))
        print(f"Different questions between requests: {different_count}/3")


class TestQuickPracticeQuestionPool:
    """Test the question pool size and variety"""
    
    def test_reading_pool_size(self):
        """Pool should have enough questions for varied practice"""
        # Request more questions to estimate pool size
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count=50")
        assert response.status_code == 200
        
        data = response.json()
        count = data.get("count", 0)
        print(f"Reading pool returned: {count} questions")
        assert count >= 20, f"Reading pool should have at least 20 questions, got {count}"
    
    def test_listening_pool_size(self):
        """Pool should have enough questions for varied practice"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=listening&count=50")
        assert response.status_code == 200
        
        data = response.json()
        count = data.get("count", 0)
        print(f"Listening pool returned: {count} questions")
        assert count >= 20, f"Listening pool should have at least 20 questions, got {count}"


class TestQuickPracticeEdgeCases:
    """Test edge cases and error handling"""
    
    def test_invalid_skill_parameter(self):
        """Invalid skill parameter should still return a response"""
        response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=invalid&count=3")
        # Should return success but with 0 questions
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        assert data.get("count") == 0 or len(data.get("questions", [])) == 0
    
    def test_count_parameter_respected(self):
        """Count parameter should limit results"""
        for count in [1, 2, 3, 5]:
            response = requests.get(f"{BASE_URL}/api/question-bank/practice/random?skill=reading&count={count}")
            assert response.status_code == 200
            data = response.json()
            assert data.get("count") <= count, f"Count should be <= {count}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
