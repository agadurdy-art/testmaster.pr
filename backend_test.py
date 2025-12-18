#!/usr/bin/env python3
"""
Backend API Testing for IELTS Ace Application
Tests the complete flow for reading and listening test submissions
"""

import requests
import json
import os
from datetime import datetime

# Get backend URL from frontend env
BACKEND_URL = "https://ielts-ace-4.preview.emergentagent.com/api"

def test_user_creation():
    """Test creating a user via POST /api/users"""
    print("=== Testing User Creation ===")
    
    user_data = {
        "email": "testuser@example.com",
        "name": "Test User"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/users", json=user_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            user = response.json()
            print(f"✅ User created successfully with ID: {user['id']}")
            return user['id']
        else:
            print(f"❌ Failed to create user: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return None

def test_get_tests(test_type):
    """Test fetching tests by type"""
    print(f"\n=== Testing Get Tests ({test_type}) ===")
    
    try:
        response = requests.get(f"{BACKEND_URL}/tests?test_type={test_type}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            tests = response.json()
            if tests:
                print(f"✅ Found {len(tests)} {test_type} tests")
                return tests[0]  # Return first test
            else:
                print(f"⚠️ No {test_type} tests found")
                return None
        else:
            print(f"❌ Failed to get tests: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting tests: {e}")
        return None

def create_sample_submission(user_id, test_id, test_type, test_data):
    """Create a sample submission with minimal valid answers"""
    print(f"\n=== Creating Sample Submission for {test_type} ===")
    
    # Get first 3 questions from answer key for testing
    answer_key = test_data.get('answer_key', [])
    if not answer_key:
        print("❌ No answer key found in test data")
        return None
    
    # Create answers - mix of correct and incorrect for testing
    answers = []
    for i, key_item in enumerate(answer_key[:3]):  # Take first 3 questions
        question_id = key_item.get('question_id')
        correct_answer = key_item.get('answer')
        
        if i == 0:  # First answer correct
            user_answer = correct_answer
        elif i == 1:  # Second answer correct  
            user_answer = correct_answer
        else:  # Third answer incorrect
            user_answer = "wrong_answer"
            
        answers.append({
            "question_id": question_id,
            "answer": user_answer
        })
    
    submission = {
        "user_id": user_id,
        "test_id": test_id,
        "test_type": test_type,
        "answers": answers,
        "time_taken": 1800  # 30 minutes
    }
    
    print(f"Sample submission created with {len(answers)} answers")
    print(f"Expected score: 2/3 = 66.67%")
    return submission

def test_submit_test(submission):
    """Test submitting a test via POST /api/tests/submit"""
    print(f"\n=== Testing Test Submission ===")
    
    try:
        response = requests.post(f"{BACKEND_URL}/tests/submit", json=submission)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            attempt = response.json()
            print(f"✅ Test submitted successfully")
            print(f"Attempt ID: {attempt.get('id')}")
            print(f"Score: {attempt.get('score')}%")
            print(f"Band Score: {attempt.get('band_score')}")
            print(f"Feedback: {attempt.get('feedback')}")
            return attempt
        else:
            print(f"❌ Failed to submit test: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error submitting test: {e}")
        return None

def test_get_test_attempt(attempt_id):
    """Test retrieving a test attempt via GET /api/test_attempts/{attempt_id}"""
    print(f"\n=== Testing Get Test Attempt ===")
    
    try:
        response = requests.get(f"{BACKEND_URL}/test_attempts/{attempt_id}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            attempt = response.json()
            print(f"✅ Test attempt retrieved successfully")
            print(f"Attempt ID: {attempt.get('id')}")
            print(f"Score: {attempt.get('score')}%")
            print(f"Band Score: {attempt.get('band_score')}")
            return attempt
        else:
            print(f"❌ Failed to get test attempt: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting test attempt: {e}")
        return None

def run_complete_test_flow():
    """Run the complete test flow for reading and listening tests"""
    print("🚀 Starting Complete Backend Test Flow")
    print("=" * 50)
    
    # Step 1: Create user
    user_id = test_user_creation()
    if not user_id:
        print("❌ Cannot proceed without user ID")
        return False
    
    success_count = 0
    total_tests = 0
    
    # Step 2 & 3: Test both reading and listening
    for test_type in ["reading", "listening"]:
        total_tests += 1
        print(f"\n{'='*20} Testing {test_type.upper()} {'='*20}")
        
        # Get tests of this type
        test_data = test_get_tests(test_type)
        if not test_data:
            print(f"❌ Skipping {test_type} - no test data available")
            continue
            
        # Create submission
        submission = create_sample_submission(user_id, test_data['id'], test_type, test_data)
        if not submission:
            print(f"❌ Skipping {test_type} - could not create submission")
            continue
            
        # Submit test
        attempt = test_submit_test(submission)
        if not attempt:
            print(f"❌ {test_type} test submission failed")
            continue
            
        # Verify attempt retrieval
        retrieved_attempt = test_get_test_attempt(attempt['id'])
        if not retrieved_attempt:
            print(f"❌ {test_type} test attempt retrieval failed")
            continue
            
        # Verify data consistency
        if (attempt['id'] == retrieved_attempt['id'] and 
            attempt['score'] == retrieved_attempt['score'] and
            attempt['band_score'] == retrieved_attempt['band_score']):
            print(f"✅ {test_type} test flow completed successfully")
            success_count += 1
        else:
            print(f"❌ {test_type} data mismatch between submit and retrieve")
    
    print(f"\n{'='*50}")
    print(f"🏁 Test Summary: {success_count}/{total_tests} test types passed")
    
    if success_count == total_tests and total_tests > 0:
        print("✅ All backend tests passed!")
        return True
    else:
        print("❌ Some backend tests failed!")
        return False

if __name__ == "__main__":
    success = run_complete_test_flow()
    exit(0 if success else 1)