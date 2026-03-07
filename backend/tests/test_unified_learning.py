"""
Test file for Unified Learning System APIs
Tests all 8 stages, lesson flow, activities, progress tracking and daily habit features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://vocab-image-mgr.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "geldiaga67@gmail.com"
TEST_PASSWORD = "geldiaga67"


class TestUnifiedLearningAuth:
    """Test authentication for unified learning system"""
    
    def test_login_with_valid_credentials(self):
        """Login with test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "id" in data, "User ID not returned"
        assert data["email"] == TEST_EMAIL
        print(f"✓ Login successful, user_id: {data['id']}")


class TestUnifiedStages:
    """Test unified learning stages endpoints"""
    
    def test_get_all_stages(self):
        """GET /api/unified/stages - returns 8 stages"""
        response = requests.get(f"{BASE_URL}/api/unified/stages")
        assert response.status_code == 200, f"Failed to get stages: {response.text}"
        data = response.json()
        
        # Should have stages array
        assert "stages" in data, "No stages key in response"
        stages = data["stages"]
        assert len(stages) == 8, f"Expected 8 stages, got {len(stages)}"
        
        # Verify first stage is Foundations
        first_stage = stages[0]
        assert first_stage["stage_id"] == "stage_1_foundations"
        assert first_stage["number"] == 1
        assert first_stage["cefr_level"] == "Pre-A1"
        
        # Verify last stage is IELTS Mastery
        last_stage = stages[-1]
        assert last_stage["number"] == 8
        assert "IELTS" in last_stage["name"]
        
        print(f"✓ All 8 stages returned correctly")
        for s in stages:
            print(f"  - Stage {s['number']}: {s['name']} ({s['cefr_level']})")
    
    def test_get_stage_1_foundations(self):
        """GET /api/unified/stages/stage_1_foundations - returns stage with units"""
        response = requests.get(f"{BASE_URL}/api/unified/stages/stage_1_foundations")
        assert response.status_code == 200, f"Failed to get stage: {response.text}"
        data = response.json()
        
        # Verify stage data
        assert data["stage_id"] == "stage_1_foundations"
        assert data["number"] == 1
        assert data["name"] == "Foundations"
        assert data["cefr_level"] == "Pre-A1"
        
        # Should have units
        assert "units" in data, "No units in stage response"
        assert len(data["units"]) >= 1, "No units found"
        
        # Verify Unit 1
        unit1 = data["units"][0]
        assert unit1["unit_id"] == "stage_1_unit_01"
        assert unit1["title"] == "Hello!"
        assert unit1["total_lessons"] == 4
        
        print(f"✓ Stage 1 Foundations has {len(data['units'])} units")


class TestUnifiedUnits:
    """Test unified learning units endpoints"""
    
    def test_get_unit_with_lessons(self):
        """GET /api/unified/units/stage_1_unit_01 - returns unit with 4 lessons"""
        response = requests.get(f"{BASE_URL}/api/unified/units/stage_1_unit_01")
        assert response.status_code == 200, f"Failed to get unit: {response.text}"
        data = response.json()
        
        # Verify unit data
        assert data["unit_id"] == "stage_1_unit_01"
        assert data["title"] == "Hello!"
        
        # Should have lessons
        assert "lessons" in data, "No lessons in unit response"
        assert len(data["lessons"]) == 4, f"Expected 4 lessons, got {len(data['lessons'])}"
        
        # Verify lesson structure
        lesson1 = data["lessons"][0]
        assert lesson1["lesson_id"] == "stage_1_unit_01_lesson_01"
        assert lesson1["number"] == 1
        assert "points_reward" in lesson1
        
        print(f"✓ Unit 1 has 4 lessons")
        for l in data["lessons"]:
            print(f"  - Lesson {l['number']}: {l['title']}")


class TestUnifiedLessons:
    """Test unified learning lesson endpoints"""
    
    def test_get_lesson_with_10_step_flow(self):
        """GET /api/unified/lessons/stage_1_unit_01_lesson_01 - returns 10-step activity flow"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert response.status_code == 200, f"Failed to get lesson: {response.text}"
        data = response.json()
        
        # Verify lesson data
        assert data["lesson_id"] == "stage_1_unit_01_lesson_01"
        assert data["title"] == "Say Hello"
        assert data["estimated_duration_minutes"] > 0
        assert data["points_reward"] == 50
        
        # Should have 10-step activity flow
        assert "activity_flow" in data, "No activity_flow in lesson"
        flow = data["activity_flow"]
        assert len(flow) == 10, f"Expected 10 activities, got {len(flow)}"
        
        # Verify activity order
        expected_types = [
            "retrieval_warmup", "vocabulary", "micro_game_vocab", 
            "micro_reading", "grammar_focus", "micro_game_grammar",
            "listening", "production", "exit_ticket", "auto_review"
        ]
        
        for i, activity in enumerate(flow):
            assert activity["type"] == expected_types[i], f"Activity {i+1} should be {expected_types[i]}, got {activity['type']}"
            assert activity["order"] == i + 1
        
        print(f"✓ Lesson has 10-step activity flow:")
        for a in flow:
            print(f"  {a['order']}. {a['label']} ({a['type']}) - {a['duration_minutes']}min")


class TestUnifiedActivities:
    """Test unified learning activity content endpoints"""
    
    def test_get_warmup_activity(self):
        """GET /api/unified/lessons/.../activity/retrieval_warmup"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/retrieval_warmup")
        assert response.status_code == 200, f"Failed to get warmup: {response.text}"
        data = response.json()
        
        assert data["type"] == "retrieval_warmup"
        assert "questions" in data
        assert len(data["questions"]) >= 2, "Should have at least 2 warmup questions"
        
        # Verify question structure
        q1 = data["questions"][0]
        assert "question_text" in q1
        assert "options" in q1
        assert "correct_answer" in q1
        
        print(f"✓ Warmup has {len(data['questions'])} questions")
    
    def test_get_vocabulary_activity(self):
        """GET /api/unified/lessons/.../activity/vocabulary"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/vocabulary")
        assert response.status_code == 200, f"Failed to get vocabulary: {response.text}"
        data = response.json()
        
        assert data["type"] == "vocabulary"
        assert "words" in data
        assert len(data["words"]) >= 4, "Should have at least 4 vocabulary words"
        
        # Verify word structure
        word = data["words"][0]
        assert "word" in word
        assert "definition" in word
        assert "example_sentence" in word
        assert "ipa" in word
        
        print(f"✓ Vocabulary has {len(data['words'])} words: {[w['word'] for w in data['words'][:4]]}...")
    
    def test_get_vocab_game_activity(self):
        """GET /api/unified/lessons/.../activity/micro_game_vocab"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/micro_game_vocab")
        assert response.status_code == 200, f"Failed to get vocab game: {response.text}"
        data = response.json()
        
        assert data["type"] == "micro_game_vocab"
        assert data["game_type"] == "matching"
        assert "items" in data
        assert len(data["items"]) >= 4, "Should have at least 4 matching items"
        
        # Verify item structure
        item = data["items"][0]
        assert "word" in item
        assert "match" in item
        
        print(f"✓ Vocab game (matching) has {len(data['items'])} items")
    
    def test_get_grammar_activity(self):
        """GET /api/unified/lessons/.../activity/grammar_focus"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/grammar_focus")
        assert response.status_code == 200, f"Failed to get grammar: {response.text}"
        data = response.json()
        
        assert data["type"] == "grammar_focus"
        assert "rules" in data
        assert len(data["rules"]) >= 1, "Should have at least 1 grammar rule"
        
        # Verify rule structure
        rule = data["rules"][0]
        assert "rule_text" in rule
        assert "pattern" in rule
        assert "examples" in rule
        
        print(f"✓ Grammar has {len(data['rules'])} rules, pattern: {data.get('pattern_highlight', 'N/A')}")
    
    def test_get_grammar_game_activity(self):
        """GET /api/unified/lessons/.../activity/micro_game_grammar"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200, f"Failed to get grammar game: {response.text}"
        data = response.json()
        
        assert data["type"] == "micro_game_grammar"
        assert data["game_type"] == "error_hunter"
        assert "items" in data
        assert len(data["items"]) >= 4, "Should have at least 4 error hunter items"
        
        # Verify item structure
        item = data["items"][0]
        assert "sentence" in item
        assert "has_error" in item
        assert "correct_sentence" in item
        
        print(f"✓ Grammar game (error_hunter) has {len(data['items'])} sentences")
    
    def test_get_listening_activity(self):
        """GET /api/unified/lessons/.../activity/listening"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/listening")
        assert response.status_code == 200, f"Failed to get listening: {response.text}"
        data = response.json()
        
        assert data["type"] == "listening"
        assert "transcript" in data
        assert len(data["transcript"]) > 20, "Transcript should have content"
        assert "questions" in data
        assert len(data["questions"]) >= 1, "Should have at least 1 listening question"
        
        print(f"✓ Listening has transcript ({len(data['transcript'])} chars) and {len(data['questions'])} questions")
    
    def test_get_production_activity(self):
        """GET /api/unified/lessons/.../activity/production"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/production")
        assert response.status_code == 200, f"Failed to get production: {response.text}"
        data = response.json()
        
        assert data["type"] == "production"
        assert "prompt" in data
        assert "production_type" in data
        
        print(f"✓ Production activity: {data['production_type']} - '{data['prompt'][:50]}...'")
    
    def test_get_exit_ticket_activity(self):
        """GET /api/unified/lessons/.../activity/exit_ticket"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/exit_ticket")
        assert response.status_code == 200, f"Failed to get exit ticket: {response.text}"
        data = response.json()
        
        assert data["type"] == "exit_ticket"
        assert "questions" in data
        assert len(data["questions"]) >= 3, "Should have at least 3 exit quiz questions"
        assert data["pass_threshold"] == 70
        
        # Verify question structure
        q = data["questions"][0]
        assert "question_text" in q
        assert "correct_answer" in q
        
        print(f"✓ Exit quiz has {len(data['questions'])} questions, pass threshold: {data['pass_threshold']}%")


class TestUnifiedProgress:
    """Test unified learning progress tracking endpoints"""
    
    @pytest.fixture
    def user_id(self):
        """Get user ID via login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["id"]
    
    def test_get_user_progress(self, user_id):
        """GET /api/unified/progress/{user_id}"""
        response = requests.get(f"{BASE_URL}/api/unified/progress/{user_id}")
        assert response.status_code == 200, f"Failed to get progress: {response.text}"
        data = response.json()
        
        # Should have progress fields
        assert data["user_id"] == user_id
        assert "total_points" in data
        assert "daily_streak" in data
        assert "current_stage" in data
        
        print(f"✓ User progress: Stage {data['current_stage']}, Points: {data['total_points']}, Streak: {data['daily_streak']}")
    
    def test_complete_activity_progress(self, user_id):
        """POST /api/unified/progress/activity"""
        response = requests.post(f"{BASE_URL}/api/unified/progress/activity", json={
            "user_id": user_id,
            "lesson_id": "stage_1_unit_01_lesson_01",
            "activity_type": "retrieval_warmup",
            "score": 100,
            "time_spent_seconds": 60,
            "skipped": False
        })
        assert response.status_code == 200, f"Failed to complete activity: {response.text}"
        data = response.json()
        
        assert data["success"] == True
        assert "lesson_progress" in data
        
        print(f"✓ Activity progress saved successfully")


class TestUnifiedDailyHabit:
    """Test daily habit mode endpoints"""
    
    @pytest.fixture
    def user_id(self):
        """Get user ID via login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["id"]
    
    def test_get_daily_habit_items(self, user_id):
        """GET /api/unified/daily-habit/{user_id}/today"""
        response = requests.get(f"{BASE_URL}/api/unified/daily-habit/{user_id}/today")
        assert response.status_code == 200, f"Failed to get daily habit: {response.text}"
        data = response.json()
        
        # Should have items or already_completed
        assert "items" in data or "already_completed" in data
        
        if data.get("already_completed"):
            print(f"✓ Daily habit already completed today")
        else:
            print(f"✓ Daily habit has {len(data.get('items', []))} items to review")
    
    def test_get_streak_info(self, user_id):
        """GET /api/unified/daily-habit/{user_id}/streak"""
        response = requests.get(f"{BASE_URL}/api/unified/daily-habit/{user_id}/streak")
        assert response.status_code == 200, f"Failed to get streak: {response.text}"
        data = response.json()
        
        # Should have streak info
        assert "daily_streak" in data
        assert "longest_streak" in data
        
        print(f"✓ Streak info: Current {data['daily_streak']}, Best {data['longest_streak']}")


class TestUnifiedMicroReading:
    """Test micro reading activity"""
    
    def test_get_reading_activity(self):
        """GET /api/unified/lessons/.../activity/micro_reading"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/micro_reading")
        assert response.status_code == 200, f"Failed to get reading: {response.text}"
        data = response.json()
        
        assert data["type"] == "micro_reading"
        assert "passage_text" in data
        assert len(data["passage_text"]) > 20, "Passage should have content"
        assert "highlighted_words" in data
        assert "comprehension_questions" in data
        
        print(f"✓ Reading has passage ({len(data['passage_text'])} chars), {len(data['highlighted_words'])} highlighted words, {len(data['comprehension_questions'])} questions")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
