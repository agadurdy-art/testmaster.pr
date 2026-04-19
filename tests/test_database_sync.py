"""
Test Database Sync - Verify full_sync.py is working correctly
Tests:
1. All 8 tests are loaded (2 reading, 2 writing, 2 listening, 2 speaking)
2. Writing Test 2 has side_by_side_images visual type with 2 images
3. Reading Test 2 has summary_completion_block question type
4. Tests API returns correct data structure
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDatabaseSync:
    """Test that full_sync.py correctly syncs all test data"""
    
    def test_api_health(self):
        """Test API is accessible"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✅ API health check passed")
    
    def test_all_tests_count(self):
        """Verify all 8 tests are loaded"""
        response = requests.get(f"{BASE_URL}/api/tests")
        assert response.status_code == 200
        tests = response.json()
        assert len(tests) == 8, f"Expected 8 tests, got {len(tests)}"
        print(f"✅ Found {len(tests)} tests")
        
        # Verify test types distribution
        test_types = {}
        for test in tests:
            t_type = test.get("test_type")
            test_types[t_type] = test_types.get(t_type, 0) + 1
        
        assert test_types.get("reading") == 2, f"Expected 2 reading tests, got {test_types.get('reading', 0)}"
        assert test_types.get("writing") == 2, f"Expected 2 writing tests, got {test_types.get('writing', 0)}"
        assert test_types.get("listening") == 2, f"Expected 2 listening tests, got {test_types.get('listening', 0)}"
        assert test_types.get("speaking") == 2, f"Expected 2 speaking tests, got {test_types.get('speaking', 0)}"
        
        print(f"✅ Test distribution correct: {test_types}")
    
    def test_reading_tests(self):
        """Verify 2 reading tests are loaded"""
        response = requests.get(f"{BASE_URL}/api/tests", params={"test_type": "reading"})
        assert response.status_code == 200
        tests = response.json()
        assert len(tests) == 2, f"Expected 2 reading tests, got {len(tests)}"
        
        titles = [t.get("title") for t in tests]
        print(f"✅ Reading tests: {titles}")
    
    def test_writing_tests(self):
        """Verify 2 writing tests are loaded"""
        response = requests.get(f"{BASE_URL}/api/tests", params={"test_type": "writing"})
        assert response.status_code == 200
        tests = response.json()
        assert len(tests) == 2, f"Expected 2 writing tests, got {len(tests)}"
        
        titles = [t.get("title") for t in tests]
        print(f"✅ Writing tests: {titles}")
    
    def test_listening_tests(self):
        """Verify 2 listening tests are loaded"""
        response = requests.get(f"{BASE_URL}/api/tests", params={"test_type": "listening"})
        assert response.status_code == 200
        tests = response.json()
        assert len(tests) == 2, f"Expected 2 listening tests, got {len(tests)}"
        
        titles = [t.get("title") for t in tests]
        print(f"✅ Listening tests: {titles}")
    
    def test_speaking_tests(self):
        """Verify 2 speaking tests are loaded"""
        response = requests.get(f"{BASE_URL}/api/tests", params={"test_type": "speaking"})
        assert response.status_code == 200
        tests = response.json()
        assert len(tests) == 2, f"Expected 2 speaking tests, got {len(tests)}"
        
        titles = [t.get("title") for t in tests]
        print(f"✅ Speaking tests: {titles}")
    
    def test_writing_test_2_side_by_side_images(self):
        """CRITICAL: Verify Writing Test 2 has side_by_side_images visual type with 2 images"""
        response = requests.get(f"{BASE_URL}/api/tests", params={"test_type": "writing"})
        assert response.status_code == 200
        tests = response.json()
        
        # Find Writing Test 2
        writing_test_2 = None
        for test in tests:
            if "Test 2" in test.get("title", "") or "2" in test.get("title", ""):
                writing_test_2 = test
                break
        
        assert writing_test_2 is not None, "Writing Test 2 not found"
        print(f"✅ Found Writing Test 2: {writing_test_2.get('title')}")
        
        # Check questions for side_by_side_images
        questions = writing_test_2.get("questions", [])
        assert len(questions) > 0, "Writing Test 2 has no questions"
        
        # Task 1 should have visual_data with side_by_side_images
        task1 = questions[0]
        visual_data = task1.get("visual_data", {})
        
        assert visual_data.get("type") == "side_by_side_images", \
            f"Expected visual_data.type='side_by_side_images', got '{visual_data.get('type')}'"
        
        images = visual_data.get("images", [])
        assert len(images) == 2, f"Expected 2 images in side_by_side_images, got {len(images)}"
        
        print(f"✅ Writing Test 2 has side_by_side_images with {len(images)} images")
        print(f"   Image 1: {images[0].get('url', 'N/A')[:50]}...")
        print(f"   Image 2: {images[1].get('url', 'N/A')[:50]}...")
    
    def test_reading_test_2_summary_completion_block(self):
        """CRITICAL: Verify Reading Test 2 has summary_completion_block question type"""
        response = requests.get(f"{BASE_URL}/api/tests", params={"test_type": "reading"})
        assert response.status_code == 200
        tests = response.json()
        
        # Find Reading Test 2
        reading_test_2 = None
        for test in tests:
            if "Test 2" in test.get("title", "") or "Practice Test 2" in test.get("title", ""):
                reading_test_2 = test
                break
        
        assert reading_test_2 is not None, "Reading Test 2 not found"
        print(f"✅ Found Reading Test 2: {reading_test_2.get('title')}")
        
        # Check for summary_completion_block question type
        questions = reading_test_2.get("questions", [])
        assert len(questions) > 0, "Reading Test 2 has no questions"
        
        has_summary_completion_block = False
        summary_block_question = None
        for q in questions:
            if q.get("type") == "summary_completion_block":
                has_summary_completion_block = True
                summary_block_question = q
                break
        
        assert has_summary_completion_block, \
            f"Reading Test 2 does not have summary_completion_block question type. Found types: {set(q.get('type') for q in questions)}"
        
        # Verify summary_completion_block structure
        assert "summary_text" in summary_block_question, "summary_completion_block missing summary_text"
        assert "blanks" in summary_block_question, "summary_completion_block missing blanks"
        assert "options" in summary_block_question, "summary_completion_block missing options"
        
        blanks = summary_block_question.get("blanks", [])
        options = summary_block_question.get("options", [])
        
        print(f"✅ Reading Test 2 has summary_completion_block question")
        print(f"   Blanks: {blanks}")
        print(f"   Options count: {len(options)}")
    
    def test_reading_test_2_has_3_passages(self):
        """Verify Reading Test 2 has 3 passages with substantial text"""
        response = requests.get(f"{BASE_URL}/api/tests", params={"test_type": "reading"})
        assert response.status_code == 200
        tests = response.json()
        
        # Find Reading Test 2
        reading_test_2 = None
        for test in tests:
            if "Test 2" in test.get("title", "") or "Practice Test 2" in test.get("title", ""):
                reading_test_2 = test
                break
        
        assert reading_test_2 is not None, "Reading Test 2 not found"
        
        passages = reading_test_2.get("passages", [])
        assert len(passages) == 3, f"Expected 3 passages, got {len(passages)}"
        
        # Verify each passage has substantial text (>500 chars)
        for i, passage in enumerate(passages):
            text = passage.get("text", "")
            assert len(text) > 500, f"Passage {i+1} text too short: {len(text)} chars"
            print(f"✅ Passage {i+1}: '{passage.get('title', 'N/A')[:50]}...' ({len(text)} chars)")
    
    def test_tests_api_structure(self):
        """Verify Tests API returns correct data structure"""
        response = requests.get(f"{BASE_URL}/api/tests")
        assert response.status_code == 200
        tests = response.json()
        
        assert isinstance(tests, list), "Tests API should return a list"
        
        for test in tests:
            # Required fields
            assert "id" in test, "Test missing 'id' field"
            assert "title" in test, "Test missing 'title' field"
            assert "test_type" in test, "Test missing 'test_type' field"
            assert "duration" in test, "Test missing 'duration' field"
            assert "questions" in test, "Test missing 'questions' field"
            
            # Validate test_type
            assert test["test_type"] in ["reading", "writing", "listening", "speaking"], \
                f"Invalid test_type: {test['test_type']}"
        
        print(f"✅ All {len(tests)} tests have correct structure")


class TestIndividualTestEndpoint:
    """Test individual test retrieval endpoint"""
    
    def test_get_individual_test(self):
        """Test getting a single test by ID"""
        # First get all tests
        response = requests.get(f"{BASE_URL}/api/tests")
        assert response.status_code == 200
        tests = response.json()
        
        if len(tests) > 0:
            test_id = tests[0].get("id")
            
            # Get individual test
            response = requests.get(f"{BASE_URL}/api/tests/{test_id}")
            assert response.status_code == 200
            test = response.json()
            
            assert test.get("id") == test_id
            print(f"✅ Individual test retrieval works: {test.get('title')}")
    
    def test_get_nonexistent_test(self):
        """Test 404 for non-existent test"""
        response = requests.get(f"{BASE_URL}/api/tests/nonexistent-id-12345")
        assert response.status_code == 404
        print("✅ 404 returned for non-existent test")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
