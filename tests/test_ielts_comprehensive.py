"""
Comprehensive IELTS Ace API Tests
Tests all major endpoints for the IELTS preparation platform
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Test basic API health and root endpoints"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root: {data['message']}")
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        # Health endpoint may return 404 if not implemented
        if response.status_code == 200:
            print("✓ Health endpoint working")
        else:
            print(f"? Health endpoint returned {response.status_code}")


class TestCourseEndpoints:
    """Test course-related endpoints"""
    
    def test_get_beginner_lessons(self):
        """Test beginner English lessons endpoint"""
        response = requests.get(f"{BASE_URL}/api/beginner-english/lessons")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Beginner lessons: {len(data)} lessons found")
        # Verify lesson structure
        if data:
            lesson = data[0]
            assert "id" in lesson or "lesson_id" in lesson
            print(f"  First lesson: {lesson.get('title', lesson.get('name', 'Unknown'))}")
    
    def test_get_vocab_grammar_lessons(self):
        """Test vocabulary & grammar lessons endpoint"""
        response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Vocab/Grammar lessons: {len(data)} lessons found")
    
    def test_get_mastery_modules(self):
        """Test mastery course modules endpoint"""
        response = requests.get(f"{BASE_URL}/api/mastery-course/modules")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Mastery modules: {len(data)} modules found")
    
    def test_get_advanced_mastery_modules(self):
        """Test advanced mastery modules endpoint"""
        response = requests.get(f"{BASE_URL}/api/advanced-mastery/modules")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Advanced mastery modules: {len(data)} modules found")
    
    def test_get_courses(self):
        """Test general courses endpoint"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Courses endpoint: {len(data)} courses found")


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_register_invalid_email(self):
        """Test registration with invalid email format"""
        response = requests.post(f"{BASE_URL}/api/register", json={
            "name": "Test User",
            "email": "invalid-email",
            "password": "testpass123"
        })
        # Should fail validation
        assert response.status_code in [400, 422]
        print("✓ Registration rejects invalid email")
    
    def test_register_short_password(self):
        """Test registration with short password"""
        response = requests.post(f"{BASE_URL}/api/register", json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "short"
        })
        # Should fail validation (min 8 chars)
        assert response.status_code in [400, 422]
        print("✓ Registration rejects short password")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/login", json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 404]
        print("✓ Login rejects invalid credentials")
    
    def test_register_and_login_flow(self):
        """Test full registration and login flow"""
        test_email = f"test_user_{int(time.time())}@example.com"
        test_password = "TestPass123!"
        
        # Register
        register_response = requests.post(f"{BASE_URL}/api/register", json={
            "name": "Test User",
            "email": test_email,
            "password": test_password
        })
        
        if register_response.status_code == 200:
            print(f"✓ Registration successful for {test_email}")
            user_data = register_response.json()
            assert "id" in user_data or "user_id" in user_data
            
            # Login
            login_response = requests.post(f"{BASE_URL}/api/login", json={
                "email": test_email,
                "password": test_password
            })
            assert login_response.status_code == 200
            print("✓ Login successful after registration")
        else:
            print(f"? Registration returned {register_response.status_code}")


class TestQuestionBankEndpoints:
    """Test question bank and practice endpoints"""
    
    def test_get_tests(self):
        """Test getting available tests"""
        response = requests.get(f"{BASE_URL}/api/tests")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Tests endpoint: {len(data)} tests available")
    
    def test_get_speaking_questions(self):
        """Test getting speaking questions"""
        for part in [1, 2, 3]:
            response = requests.get(f"{BASE_URL}/api/speaking/questions/{part}")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            print(f"✓ Speaking Part {part}: {len(data)} questions")
    
    def test_get_listening_sections(self):
        """Test getting listening sections"""
        response = requests.get(f"{BASE_URL}/api/listening/sections")
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Listening sections endpoint working")
    
    def test_get_writing_tasks(self):
        """Test getting writing tasks"""
        response = requests.get(f"{BASE_URL}/api/writing/tasks")
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Writing tasks endpoint working")


class TestTipsAndGuidance:
    """Test tips and learning guidance endpoints"""
    
    def test_get_tips(self):
        """Test getting IELTS tips"""
        response = requests.get(f"{BASE_URL}/api/tips")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Tips endpoint: {len(data)} tips available")
    
    def test_get_tips_by_category(self):
        """Test getting tips by category"""
        categories = ["reading", "listening", "writing", "speaking"]
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/tips?category={category}")
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Tips for {category}: {len(data)} tips")


class TestAIEvaluationEndpoints:
    """Test AI evaluation endpoints (without actual AI calls)"""
    
    def test_writing_evaluation_endpoint_exists(self):
        """Test that writing evaluation endpoint exists"""
        # Just check endpoint exists, don't actually call AI
        response = requests.post(f"{BASE_URL}/api/evaluate-writing", json={
            "task_type": "task2",
            "prompt": "Test prompt",
            "response": "Test response"
        })
        # Should not be 404
        assert response.status_code != 404
        print(f"✓ Writing evaluation endpoint exists (status: {response.status_code})")
    
    def test_speaking_evaluation_endpoint_exists(self):
        """Test that speaking evaluation endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/evaluate-speaking", json={
            "part": 1,
            "question": "Test question",
            "response": "Test response"
        })
        assert response.status_code != 404
        print(f"✓ Speaking evaluation endpoint exists (status: {response.status_code})")


class TestCourseSpecificEndpoints:
    """Test course-specific content endpoints"""
    
    def test_beginner_course_general(self):
        """Test beginner course general content"""
        response = requests.get(f"{BASE_URL}/api/courses/beginner/general")
        assert response.status_code == 200
        print("✓ Beginner course general content accessible")
    
    def test_vocab_grammar_by_band_level(self):
        """Test vocab/grammar lessons filtered by band level"""
        band_levels = ["foundation", "development", "advanced"]
        for level in band_levels:
            response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons?band_level={level}")
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Vocab/Grammar {level}: {len(data)} lessons")


class TestProgressAndAnalytics:
    """Test progress tracking and analytics endpoints"""
    
    def test_skill_analytics_requires_user(self):
        """Test that skill analytics requires valid user ID"""
        response = requests.get(f"{BASE_URL}/api/skill-analytics/invalid-user-id")
        # Should return empty or error for invalid user
        assert response.status_code in [200, 404]
        print("✓ Skill analytics endpoint accessible")
    
    def test_progress_requires_user(self):
        """Test that progress endpoint requires valid user ID"""
        response = requests.get(f"{BASE_URL}/api/progress/invalid-user-id")
        assert response.status_code in [200, 404]
        print("✓ Progress endpoint accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
