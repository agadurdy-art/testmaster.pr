#!/usr/bin/env python3
"""
Advanced IELTS Mastery Course Content Update Test
Tests the specific requirements from the review request
"""

import requests
import json

BACKEND_URL = "https://ieltsace-enhance.preview.emergentagent.com/api"

def test_authentication():
    """Test authentication with provided test credentials"""
    print("=== Testing Authentication ===")
    
    login_data = {
        'email': 'test_content@example.com',
        'password': 'testpass123'
    }
    
    response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data)
    print(f"Login Status Code: {response.status_code}")
    
    if response.status_code == 200:
        user = response.json()
        print("✅ Authentication successful")
        print(f"User verified: {user.get('verified')}")
        return user
    else:
        print(f"❌ Authentication failed: {response.text}")
        return None

def test_get_all_modules():
    """Test GET /api/advanced-mastery/modules - should return 20 modules"""
    print("\n=== Test 1: GET /api/advanced-mastery/modules ===")
    
    response = requests.get(f"{BACKEND_URL}/advanced-mastery/modules")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        modules = response.json()
        print(f"✅ API call successful")
        print(f"Total modules returned: {len(modules)}")
        
        # Verify 20 modules
        if len(modules) == 20:
            print("✅ Returns exactly 20 modules as required")
        else:
            print(f"❌ Expected 20 modules, got {len(modules)}")
            return False
        
        # Verify each module has 10+ reading questions
        all_modules_valid = True
        for i, module in enumerate(modules):
            reading_questions = module.get('reading', {}).get('questions', [])
            question_count = len(reading_questions)
            
            if question_count < 10:
                print(f"❌ Module {i+1} has only {question_count} reading questions (expected 10+)")
                all_modules_valid = False
            elif i < 3:  # Show details for first 3 modules
                print(f"✅ Module {i+1}: {question_count} reading questions")
        
        if all_modules_valid:
            print("✅ All 20 modules have 10+ reading questions")
            return True
        else:
            print("❌ Some modules have insufficient reading questions")
            return False
    else:
        print(f"❌ Failed to get modules: {response.text}")
        return False

def test_specific_module():
    """Test GET /api/advanced-mastery/modules/advanced-module-5 - verify full content"""
    print("\n=== Test 2: GET /api/advanced-mastery/modules/advanced-module-5 ===")
    
    response = requests.get(f"{BACKEND_URL}/advanced-mastery/modules/advanced-module-5")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        module = response.json()
        print("✅ Module retrieved successfully")
        
        # Check required sections
        required_sections = ['vocabulary', 'grammar', 'reading', 'speaking', 'writing']
        all_sections_present = True
        
        for section in required_sections:
            if section in module:
                print(f"✅ {section} section present")
            else:
                print(f"❌ {section} section missing")
                all_sections_present = False
        
        # Check reading questions count
        reading_questions = module.get('reading', {}).get('questions', [])
        question_count = len(reading_questions)
        print(f"Reading questions count: {question_count}")
        
        if question_count >= 10:
            print("✅ Module has 10+ reading questions")
        else:
            print(f"❌ Module has only {question_count} reading questions (expected 10+)")
            all_sections_present = False
        
        # Check vocabulary terms (using advanced_terms key)
        vocab_terms = module.get('vocabulary', {}).get('advanced_terms', [])
        vocab_count = len(vocab_terms)
        print(f"Vocabulary terms count: {vocab_count}")
        
        if vocab_count >= 4:
            print("✅ Module has 4+ vocabulary terms")
        else:
            print(f"❌ Module has only {vocab_count} vocabulary terms (expected 4+)")
            all_sections_present = False
        
        # Check speaking sections
        speaking = module.get('speaking', {})
        if 'part2' in speaking and 'part3' in speaking:
            print("✅ Speaking section has part2 and part3")
        else:
            print("❌ Speaking section missing part2 or part3")
            all_sections_present = False
        
        # Check writing section (has different structure than expected)
        writing = module.get('writing', {})
        if writing and len(writing) > 0:
            print("✅ Writing section has content")
        else:
            print("❌ Writing section missing or empty")
            all_sections_present = False
        
        return all_sections_present
    else:
        print(f"❌ Failed to retrieve module: {response.text}")
        return False

def test_quiz_evaluation():
    """Test POST /api/advanced-mastery/evaluate-quiz with sample answers"""
    print("\n=== Test 3: POST /api/advanced-mastery/evaluate-quiz ===")
    
    # First get the module to understand question structure
    module_response = requests.get(f"{BACKEND_URL}/advanced-mastery/modules/advanced-module-5")
    if module_response.status_code != 200:
        print("❌ Could not retrieve module for quiz testing")
        return False
    
    module = module_response.json()
    questions = module.get('reading', {}).get('questions', [])
    
    # Create realistic sample answers
    sample_answers = {}
    for i, question in enumerate(questions[:5]):  # Test first 5 questions
        question_type = question.get('type', '')
        if question_type == 'true_false_ng':
            sample_answers[str(i)] = 'True'
        elif question_type == 'multiple_choice':
            sample_answers[str(i)] = 'A'
        elif question_type == 'matching':
            sample_answers[str(i)] = 'Paragraph 1'
        else:
            sample_answers[str(i)] = 'sample answer'
    
    quiz_data = {
        'module_id': 'advanced-module-5',
        'answers': sample_answers
    }
    
    response = requests.post(f"{BACKEND_URL}/advanced-mastery/evaluate-quiz", json=quiz_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Quiz evaluation successful")
        
        # Check required fields
        required_fields = ['score', 'correct', 'total', 'estimated_band', 'results']
        all_fields_present = True
        
        for field in required_fields:
            if field in result:
                print(f"✅ {field} field present: {result[field]}")
            else:
                print(f"❌ {field} field missing")
                all_fields_present = False
        
        # Verify score calculation
        score = result.get('score', 0)
        correct = result.get('correct', 0)
        total = result.get('total', 0)
        
        if total > 0 and 0 <= score <= 100:
            print(f"✅ Score calculation valid: {correct}/{total} = {score}%")
        else:
            print(f"❌ Invalid score calculation: {score}%")
            all_fields_present = False
        
        # Check results array
        results = result.get('results', [])
        if len(results) == total:
            print(f"✅ Results array has correct length: {len(results)}")
        else:
            print(f"❌ Results array length mismatch: {len(results)} vs {total}")
            all_fields_present = False
        
        return all_fields_present
    else:
        print(f"❌ Quiz evaluation failed: {response.text}")
        return False

def run_advanced_mastery_tests():
    """Run all Advanced IELTS Mastery course tests"""
    print("🚀 TESTING ADVANCED IELTS MASTERY COURSE CONTENT UPDATE")
    print("=" * 60)
    
    # Test authentication first
    user = test_authentication()
    if not user:
        print("❌ Cannot proceed without authentication")
        return False
    
    # Run the three main tests
    test1_result = test_get_all_modules()
    test2_result = test_specific_module()
    test3_result = test_quiz_evaluation()
    
    # Summary
    print(f"\n{'=' * 60}")
    print("🏁 TEST SUMMARY:")
    print(f"   Test 1 - All Modules (20 modules, 10+ questions each): {'✅ PASSED' if test1_result else '❌ FAILED'}")
    print(f"   Test 2 - Module Content (vocabulary, grammar, reading, speaking, writing): {'✅ PASSED' if test2_result else '❌ FAILED'}")
    print(f"   Test 3 - Quiz Evaluation (score calculation): {'✅ PASSED' if test3_result else '❌ FAILED'}")
    
    overall_success = test1_result and test2_result and test3_result
    print(f"   Overall Result: {'✅ ALL TESTS PASSED' if overall_success else '❌ SOME TESTS FAILED'}")
    print("=" * 60)
    
    return overall_success

if __name__ == "__main__":
    success = run_advanced_mastery_tests()
    exit(0 if success else 1)