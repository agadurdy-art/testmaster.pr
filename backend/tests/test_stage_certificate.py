"""
Test Stage Certificate Feature - Final Gate Lesson (stage_1_unit_12_lesson_04)
Tests for the Stage 1 Final Gate lesson that triggers the certificate celebration screen.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestStageCertificateBackend:
    """Backend API tests for Stage Certificate / Final Gate feature"""

    def test_final_gate_lesson_exists(self):
        """GET /api/unified/lessons/stage_1_unit_12_lesson_04 returns valid lesson"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_12_lesson_04")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data['lesson_id'] == 'stage_1_unit_12_lesson_04'
        assert data['title'] == 'Stage 1 Final Gate', f"Expected 'Stage 1 Final Gate', got {data['title']}"
        print(f"✅ Final Gate lesson exists: {data['title']}")

    def test_final_gate_is_review_lesson(self):
        """Final Gate lesson has is_review=true flag"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_12_lesson_04")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('is_review') == True, f"Expected is_review=true, got {data.get('is_review')}"
        print(f"✅ Final Gate has is_review=true")

    def test_final_gate_has_9_activity_steps(self):
        """Final Gate lesson has 9 core activity steps (plus auto_review)"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_12_lesson_04")
        assert response.status_code == 200
        
        data = response.json()
        activity_flow = data.get('activity_flow', [])
        # The lesson has 9 core steps + auto_review = 10 total
        assert len(activity_flow) >= 9, f"Expected at least 9 activities, got {len(activity_flow)}"
        
        # Verify activity types
        activity_types = [a['type'] for a in activity_flow]
        expected_types = ['retrieval_warmup', 'vocabulary', 'micro_game_vocab', 'micro_reading', 
                         'grammar_focus', 'micro_game_grammar', 'listening_task', 'production', 'exit_ticket']
        
        for exp_type in expected_types:
            assert exp_type in activity_types, f"Missing activity type: {exp_type}"
        
        print(f"✅ Final Gate has {len(activity_flow)} activities: {activity_types}")

    def test_final_gate_warmup_activity(self):
        """Final Gate warmup asks 'Are you ready for the final test?'"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_12_lesson_04/activity/retrieval_warmup")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get('questions', [])
        assert len(questions) >= 1, "Expected at least 1 warmup question"
        
        q = questions[0]
        assert 'ready' in q.get('question_text', '').lower() or 'final' in q.get('question_text', '').lower(), \
            f"Expected 'ready' or 'final' in question, got {q.get('question_text')}"
        assert 'yes' in q.get('options', []), "Expected 'yes' as an option"
        print(f"✅ Warmup question: {q.get('question_text')}")

    def test_final_gate_vocabulary_review(self):
        """Final Gate vocabulary has comprehensive review words (review_words field for review lessons)"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_12_lesson_04/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        # For review lessons, words are in review_words field (strings) not words field (objects)
        review_words = data.get('review_words', [])
        assert data.get('is_review') == True, "Expected is_review=true for Final Gate vocabulary"
        assert len(review_words) >= 10, f"Expected at least 10 review_words, got {len(review_words)}"
        
        # Check for some expected review words (they are strings, not objects)
        expected_words = ['hello', 'mother', 'father', 'eye', 'hand']
        for exp_word in expected_words[:3]:  # Check at least 3
            assert exp_word in review_words, f"Expected '{exp_word}' in review_words"
        
        print(f"✅ Final Gate vocabulary has {len(review_words)} review words: {review_words[:5]}...")

    def test_final_gate_exit_ticket(self):
        """Final Gate exit ticket has 'good morning' question"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_12_lesson_04/activity/exit_ticket")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get('questions', [])
        assert len(questions) >= 1, "Expected at least 1 exit ticket question"
        
        # Check for the morning greeting question
        q = questions[0]
        assert 'morning' in q.get('question_text', '').lower(), f"Expected 'morning' in question: {q.get('question_text')}"
        assert 'good morning' in str(q.get('correct_answer', '')).lower() or 'good morning' in str(q.get('options', [])).lower()
        
        print(f"✅ Exit ticket question: {q.get('question_text')}")

    def test_final_gate_stage_and_unit_info(self):
        """Final Gate lesson has correct stage and unit references"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_12_lesson_04")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('stage_id') == 'stage_1', f"Expected stage_id='stage_1', got {data.get('stage_id')}"
        assert data.get('unit_id') == 'stage_1_unit_12', f"Expected unit_id='stage_1_unit_12', got {data.get('unit_id')}"
        
        print(f"✅ Stage: {data.get('stage_id')}, Unit: {data.get('unit_id')}")

    def test_unit_12_contains_final_gate(self):
        """Unit 12 list includes the Final Gate lesson"""
        response = requests.get(f"{BASE_URL}/api/unified/units/stage_1_unit_12")
        assert response.status_code == 200
        
        data = response.json()
        lessons = data.get('lessons', [])
        assert len(lessons) >= 4, f"Expected at least 4 lessons in Unit 12, got {len(lessons)}"
        
        # Find the Final Gate lesson (lesson 4)
        final_gate = next((l for l in lessons if 'final gate' in l.get('title', '').lower()), None)
        assert final_gate is not None, "Final Gate lesson not found in Unit 12 lessons list"
        
        print(f"✅ Unit 12 has {len(lessons)} lessons, including Final Gate")


class TestStageCertificateAuth:
    """Test authenticated endpoints for progress tracking"""
    
    @pytest.fixture
    def auth_token(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "tester@test.com",
            "password": "tester123"
        })
        if response.status_code != 200:
            pytest.skip("Auth not available for testing")
        data = response.json()
        return data.get('token'), data.get('user', {}).get('id')
    
    def test_lesson_progress_endpoint(self, auth_token):
        """POST /api/unified/progress/lesson works for Final Gate"""
        token, user_id = auth_token
        if not token or not user_id:
            pytest.skip("Auth token not available")
        
        response = requests.post(
            f"{BASE_URL}/api/unified/progress/lesson",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"user_id": user_id, "lesson_id": "stage_1_unit_12_lesson_04"}
        )
        # Should succeed or already completed
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"
        print(f"✅ Lesson progress endpoint works")

    def test_activity_progress_endpoint(self, auth_token):
        """POST /api/unified/progress/activity works"""
        token, user_id = auth_token
        if not token or not user_id:
            pytest.skip("Auth token not available")
        
        response = requests.post(
            f"{BASE_URL}/api/unified/progress/activity",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={
                "user_id": user_id,
                "lesson_id": "stage_1_unit_12_lesson_04",
                "activity_type": "retrieval_warmup",
                "score": 100,
                "crowns": 3,
                "time_spent_seconds": 60
            }
        )
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"
        print(f"✅ Activity progress endpoint works")


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
