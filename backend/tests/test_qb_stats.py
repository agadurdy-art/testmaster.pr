"""
Question Bank Stats API Tests
=============================
Tests for /api/question-bank/stats and /api/full-test/sets endpoints.
Verifies that the bug fix correctly counts Cambridge + AI tests dynamically.
"""

import pytest
import requests
import os

# Get BASE_URL from environment (same as frontend uses)
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestQuestionBankStats:
    """Tests for /api/question-bank/stats endpoint - Bug Fix Verification"""
    
    def test_stats_endpoint_returns_200(self):
        """Test that stats endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Stats endpoint returns 200")
    
    def test_stats_has_required_fields(self):
        """Test that stats response contains all required fields"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = [
            'total_questions', 'full_tests', 'cambridge_tests',
            'ai_academic_tests', 'ai_general_tests', 'topics_count',
            'by_skill', 'by_band', 'practice_pool_size'
        ]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        print(f"✓ All required fields present: {required_fields}")
    
    def test_total_questions_greater_than_680(self):
        """Test that total_questions > 680 (bug fix: was showing static 680)"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        data = response.json()
        
        total = data['total_questions']
        assert total > 680, f"Expected total_questions > 680, got {total}"
        print(f"✓ Total questions = {total} (> 680)")
    
    def test_full_tests_equals_20(self):
        """Test that full_tests = 20 (8 Cambridge + 8 AI Academic + 4 AI General)"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        data = response.json()
        
        full_tests = data['full_tests']
        assert full_tests == 20, f"Expected full_tests = 20, got {full_tests}"
        print(f"✓ Full tests = {full_tests} (expected 20)")
    
    def test_cambridge_tests_equals_8(self):
        """Test that cambridge_tests = 8 (4 from IELTS 17 + 4 from IELTS 18)"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        data = response.json()
        
        cambridge = data['cambridge_tests']
        assert cambridge == 8, f"Expected cambridge_tests = 8, got {cambridge}"
        print(f"✓ Cambridge tests = {cambridge} (expected 8)")
    
    def test_ai_academic_tests_equals_8(self):
        """Test that ai_academic_tests = 8 (Sets A through H)"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        data = response.json()
        
        ai_academic = data['ai_academic_tests']
        assert ai_academic == 8, f"Expected ai_academic_tests = 8, got {ai_academic}"
        print(f"✓ AI Academic tests = {ai_academic} (expected 8)")
    
    def test_ai_general_tests_equals_4(self):
        """Test that ai_general_tests = 4 (Sets A through D)"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        data = response.json()
        
        ai_general = data['ai_general_tests']
        assert ai_general == 4, f"Expected ai_general_tests = 4, got {ai_general}"
        print(f"✓ AI General tests = {ai_general} (expected 4)")
    
    def test_topics_count_equals_47(self):
        """Test that topics_count = 47 (dynamic from lesson registry)"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        data = response.json()
        
        topics = data['topics_count']
        # Allow some flexibility for dynamic topics (may change)
        assert topics >= 40, f"Expected topics_count >= 40, got {topics}"
        print(f"✓ Topics count = {topics} (expected ~47)")
    
    def test_by_skill_breakdown_has_all_skills(self):
        """Test that by_skill breakdown contains all IELTS skills"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        data = response.json()
        
        by_skill = data['by_skill']
        expected_skills = ['reading', 'listening', 'writing', 'speaking']
        
        for skill in expected_skills:
            assert skill in by_skill, f"Missing skill: {skill}"
            assert isinstance(by_skill[skill], (int, float)), f"Skill {skill} value is not a number"
        print(f"✓ By skill breakdown: {by_skill}")
    
    def test_full_tests_math_is_correct(self):
        """Test that full_tests = cambridge + ai_academic + ai_general"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        data = response.json()
        
        expected_total = data['cambridge_tests'] + data['ai_academic_tests'] + data['ai_general_tests']
        actual_total = data['full_tests']
        
        assert actual_total == expected_total, f"Math error: {actual_total} != {data['cambridge_tests']} + {data['ai_academic_tests']} + {data['ai_general_tests']}"
        print(f"✓ Full tests math correct: {data['cambridge_tests']} + {data['ai_academic_tests']} + {data['ai_general_tests']} = {actual_total}")


class TestFullTestSets:
    """Tests for /api/full-test/sets endpoint"""
    
    def test_full_test_sets_endpoint_returns_200(self):
        """Test that full-test sets endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/full-test/sets")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Full test sets endpoint returns 200")
    
    def test_full_test_sets_has_academic_and_general(self):
        """Test that sets response has academic_sets and general_sets"""
        response = requests.get(f"{BASE_URL}/api/full-test/sets")
        data = response.json()
        
        assert 'academic_sets' in data, "Missing academic_sets"
        assert 'general_sets' in data, "Missing general_sets"
        print(f"✓ Has academic_sets ({len(data['academic_sets'])}) and general_sets ({len(data['general_sets'])})")
    
    def test_academic_sets_count_is_8(self):
        """Test that there are 8 academic sets (A through H)"""
        response = requests.get(f"{BASE_URL}/api/full-test/sets")
        data = response.json()
        
        academic_count = len(data.get('academic_sets', []))
        assert academic_count == 8, f"Expected 8 academic sets, got {academic_count}"
        print(f"✓ Academic sets count = {academic_count}")
    
    def test_general_sets_count_is_4(self):
        """Test that there are 4 general sets (A through D)"""
        response = requests.get(f"{BASE_URL}/api/full-test/sets")
        data = response.json()
        
        general_count = len(data.get('general_sets', []))
        assert general_count == 4, f"Expected 4 general sets, got {general_count}"
        print(f"✓ General sets count = {general_count}")
    
    def test_academic_set_has_required_fields(self):
        """Test that each academic set has required fields"""
        response = requests.get(f"{BASE_URL}/api/full-test/sets")
        data = response.json()
        
        required_fields = ['test_id', 'title', 'description']
        
        for i, test_set in enumerate(data.get('academic_sets', [])):
            for field in required_fields:
                assert field in test_set, f"Academic set {i} missing field: {field}"
        print(f"✓ All academic sets have required fields")
    
    def test_general_set_has_required_fields(self):
        """Test that each general set has required fields"""
        response = requests.get(f"{BASE_URL}/api/full-test/sets")
        data = response.json()
        
        required_fields = ['test_id', 'title', 'description']
        
        for i, test_set in enumerate(data.get('general_sets', [])):
            for field in required_fields:
                assert field in test_set, f"General set {i} missing field: {field}"
        print(f"✓ All general sets have required fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
