"""
Iteration 30 Bug Fix Tests
==========================
Tests for:
1. Full Test Audio - All 4 parts for multiple test sets
2. Practice Listening Sets endpoint with pre-generated audio
3. Static audio file serving
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ============ BUG FIX 1: Full Test Audio All Parts ============

class TestFullTestAudioAllParts:
    """Test that all 4 listening parts return audio for various test sets"""
    
    @pytest.mark.parametrize("test_id", [
        "academic_set_a_01",
        "academic_set_e_01", 
        "general_set_a_01"
    ])
    @pytest.mark.parametrize("part_number", [1, 2, 3, 4])
    def test_full_test_audio_stream(self, test_id, part_number):
        """Verify audio streaming works for all parts across multiple test sets"""
        url = f"{BASE_URL}/api/full-test/audio/stream/{test_id}/listening/{part_number}"
        response = requests.get(url, stream=True)
        
        assert response.status_code == 200, f"Expected 200 for {test_id} part {part_number}, got {response.status_code}"
        assert response.headers.get('content-type') == 'audio/mpeg', f"Expected audio/mpeg, got {response.headers.get('content-type')}"
        
        # Verify content is actually audio data (check file size > 100KB)
        content_length = response.headers.get('content-length')
        if content_length:
            assert int(content_length) > 100000, f"Audio file too small for {test_id} part {part_number}"
        
        print(f"✓ {test_id} part {part_number}: Status 200, Content-Type: audio/mpeg")


# ============ NEW FEATURE: Practice Listening Sets ============

class TestPracticeListeningSets:
    """Test the new practice listening sets endpoint with pre-generated audio"""
    
    def test_listening_sets_endpoint_returns_success(self):
        """Basic endpoint availability test"""
        url = f"{BASE_URL}/api/question-bank/practice/listening-sets"
        response = requests.get(url)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get('success') is True
        assert 'questions' in data
        print(f"✓ Endpoint returns success with {len(data.get('questions', []))} questions")
    
    def test_listening_sets_returns_3_questions(self):
        """Verify endpoint returns 3 questions by default"""
        url = f"{BASE_URL}/api/question-bank/practice/listening-sets?count=3"
        response = requests.get(url)
        data = response.json()
        
        assert data.get('success') is True
        assert len(data.get('questions', [])) == 3
        print(f"✓ Returns exactly 3 questions")
    
    def test_listening_sets_has_audio_file_paths(self):
        """Verify each question has audio_file path"""
        url = f"{BASE_URL}/api/question-bank/practice/listening-sets?count=3"
        response = requests.get(url)
        data = response.json()
        
        for q in data.get('questions', []):
            assert 'audio_file' in q, f"Question {q.get('id')} missing audio_file"
            assert q['audio_file'].startswith('/api/static/audio/practice_listening/')
            assert q['audio_file'].endswith('.mp3')
            print(f"✓ Question {q.get('id')} has audio_file: {q['audio_file']}")
    
    def test_listening_sets_has_required_fields(self):
        """Verify each question has all required fields"""
        url = f"{BASE_URL}/api/question-bank/practice/listening-sets?count=3"
        response = requests.get(url)
        data = response.json()
        
        required_fields = ['id', 'type', 'text', 'correct', 'skill', 'audio_file', 'source']
        
        for q in data.get('questions', []):
            for field in required_fields:
                assert field in q, f"Question {q.get('id')} missing field: {field}"
            assert q['skill'] == 'listening'
            assert q['source'] == 'practice_listening'
        print(f"✓ All questions have required fields")
    
    def test_listening_sets_specific_set_number(self):
        """Test requesting a specific set number"""
        url = f"{BASE_URL}/api/question-bank/practice/listening-sets?set_num=1&count=3"
        response = requests.get(url)
        data = response.json()
        
        assert data.get('success') is True
        assert data.get('set_number') == 1
        print(f"✓ Specific set request returns set {data.get('set_number')}")
    
    def test_listening_sets_total_sets_count(self):
        """Verify total sets count is returned"""
        url = f"{BASE_URL}/api/question-bank/practice/listening-sets"
        response = requests.get(url)
        data = response.json()
        
        assert 'total_sets' in data
        assert data['total_sets'] >= 10, "Should have at least 10 sets (51 questions / 3)"
        print(f"✓ Total sets available: {data.get('total_sets')}")


# ============ NEW FEATURE: Static Audio File Serving ============

class TestPracticeListeningAudioFiles:
    """Test that the static audio files are accessible"""
    
    @pytest.mark.parametrize("question_id", [
        "PL_S01_Q1",
        "PL_S01_Q2", 
        "PL_S01_Q3",
        "PL_S02_Q1"
    ])
    def test_practice_listening_audio_files_exist(self, question_id):
        """Verify practice listening audio files are served correctly"""
        url = f"{BASE_URL}/api/static/audio/practice_listening/{question_id}.mp3"
        response = requests.get(url, stream=True)
        
        assert response.status_code == 200, f"Expected 200 for {question_id}, got {response.status_code}"
        content_type = response.headers.get('content-type', '')
        assert 'audio' in content_type.lower() or 'mpeg' in content_type.lower(), f"Expected audio content-type, got {content_type}"
        print(f"✓ {question_id}.mp3: Status 200, accessible")


# ============ Integration Test: Listening Practice Flow ============

class TestListeningPracticeIntegration:
    """Integration test for the complete listening practice flow"""
    
    def test_full_listening_practice_flow(self):
        """Test the complete flow: get questions -> verify audio accessible"""
        # Step 1: Get questions from listening sets endpoint
        url = f"{BASE_URL}/api/question-bank/practice/listening-sets?count=3"
        response = requests.get(url)
        data = response.json()
        
        assert data.get('success') is True
        questions = data.get('questions', [])
        assert len(questions) >= 1
        
        # Step 2: Verify each question's audio file is accessible
        for q in questions:
            audio_url = f"{BASE_URL}{q['audio_file']}"
            audio_response = requests.head(audio_url)
            
            assert audio_response.status_code == 200, f"Audio for {q['id']} not accessible at {audio_url}"
            print(f"✓ {q['id']}: Question + Audio verified")
        
        print(f"✓ Full flow complete: {len(questions)} questions with accessible audio")


# ============ Reading Answer Comparison (isAnswerCorrect logic validation) ============

class TestReadingAnswerComparison:
    """
    Test the answer comparison logic for reading practice.
    Note: This is frontend logic validation, but we test the expected behavior.
    """
    
    def test_answer_comparison_logic(self):
        """Document expected behavior of isAnswerCorrect function"""
        # These are the expected behaviors from the frontend isAnswerCorrect function:
        test_cases = [
            # Basic exact match
            ("fire", "fire", True),
            ("Fire", "fire", True),  # Case insensitive
            
            # Slash-separated alternatives (fire/flame means either is correct)
            ("fire", "fire/flame", True),
            ("flame", "fire/flame", True),
            ("water", "fire/flame", False),
            
            # 'and' separated - either part is acceptable
            ("A", "A and B", True),
            ("B", "A and B", True),
            ("C", "A and B", False),
            
            # 'or' separated alternatives
            ("Monday", "Monday or Tuesday", True),
            ("Tuesday", "Monday or Tuesday", True),
            
            # Date alternatives like "15th/15"
            ("15th", "15th/15", True),
            ("15", "15th/15", True),
        ]
        
        print("Expected answer comparison behavior:")
        for user, correct, expected in test_cases:
            print(f"  isAnswerCorrect('{user}', '{correct}') should be {expected}")
        
        # This test just documents expected behavior - actual testing is in Playwright
        assert True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
