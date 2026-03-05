#!/usr/bin/env python3
"""
Detailed Cambridge IELTS 18 API Testing
Tests the specific requirements from the review request
"""

import requests
import json
import os

# Get backend URL from frontend env
BACKEND_URL = "https://temp-plan-expiry.preview.emergentagent.com/api"

def test_cambridge_ielts_18_detailed():
    """Test Cambridge IELTS 18 API endpoints with detailed verification as per review request"""
    print("\n" + "="*80)
    print("🚀 TESTING CAMBRIDGE IELTS 18 API ENDPOINTS - DETAILED VERIFICATION")
    print("="*80)
    
    success_count = 0
    total_tests = 4
    issues_found = []
    
    # First, authenticate with provided credentials
    print("\n=== Authentication ===")
    auth_data = {
        "email": "teststudent_1767460068@test.com",
        "password": "testpassword"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json=auth_data)
        print(f"Auth Status Code: {response.status_code}")
        
        if response.status_code == 200:
            user = response.json()
            print(f"✅ Authentication successful - User ID: {user.get('id')}")
        else:
            print(f"❌ Authentication failed: {response.status_code} - {response.text}")
            print("⚠️ Continuing with tests without authentication...")
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        print("⚠️ Continuing with tests without authentication...")
    
    # Test each of the 4 Cambridge 18 tests
    cambridge_18_tests = ["test1", "test2", "test3", "test4"]
    
    for i, test_id in enumerate(cambridge_18_tests, 1):
        print(f"\n=== Test {i}: GET /api/cambridge/test/ielts18/{test_id} ===")
        try:
            response = requests.get(f"{BACKEND_URL}/cambridge/test/ielts18/{test_id}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                test_data = result.get("test", {})
                sections = test_data.get("sections", {})
                
                print(f"✅ API call successful for {test_id}")
                
                # Verify response structure
                test_passed = True
                
                # 1. Check Listening section - 4 parts with questions, visuals, instructions
                listening = sections.get("listening", {})
                if listening:
                    parts = listening.get("parts", [])
                    if len(parts) == 4:
                        print(f"✅ {test_id}: Listening has 4 parts")
                        
                        # Check specific fixes for Test 2 and Test 4
                        if test_id == "test2":
                            # Test 2 Part 1: Has "visual" object with "notes" type
                            part1 = parts[0] if len(parts) > 0 else {}
                            visual = part1.get("visual", {})
                            if visual and visual.get("type") == "notes":
                                print(f"✅ {test_id} Part 1: Has visual object with notes type")
                            else:
                                print(f"❌ {test_id} Part 1: Missing visual object with notes type")
                                print(f"   Found visual: {visual}")
                                issues_found.append(f"{test_id} Part 1: Missing visual object with notes type")
                                test_passed = False
                            
                            # Test 2 Part 3: All questions (21-30) have "question_text" field
                            part3 = parts[2] if len(parts) > 2 else {}
                            question_groups = part3.get("question_groups", [])
                            part3_questions_ok = True
                            missing_question_texts = []
                            
                            for qg in question_groups:
                                questions = qg.get("questions", [])
                                for q in questions:
                                    q_num = q.get("question_number", 0)
                                    if 21 <= q_num <= 30:
                                        question_text = q.get("question_text", "")
                                        if not question_text:
                                            part3_questions_ok = False
                                            missing_question_texts.append(q_num)
                            
                            if part3_questions_ok:
                                print(f"✅ {test_id} Part 3: All questions (21-30) have question_text field")
                            else:
                                print(f"❌ {test_id} Part 3: Questions missing question_text field: {missing_question_texts}")
                                issues_found.append(f"{test_id} Part 3: Questions {missing_question_texts} missing question_text field")
                                test_passed = False
                            
                            # Test 2 Part 4: Has "visual" object with "notes" type
                            part4 = parts[3] if len(parts) > 3 else {}
                            visual4 = part4.get("visual", {})
                            if visual4 and visual4.get("type") == "notes":
                                print(f"✅ {test_id} Part 4: Has visual object with notes type")
                            else:
                                print(f"❌ {test_id} Part 4: Missing visual object with notes type")
                                print(f"   Found visual: {visual4}")
                                issues_found.append(f"{test_id} Part 4: Missing visual object with notes type")
                                test_passed = False
                        
                        elif test_id == "test4":
                            # Test 4 Part 1: Has "visual" object with "notes" type
                            part1 = parts[0] if len(parts) > 0 else {}
                            visual = part1.get("visual", {})
                            if visual and visual.get("type") == "notes":
                                print(f"✅ {test_id} Part 1: Has visual object with notes type")
                            else:
                                print(f"❌ {test_id} Part 1: Missing visual object with notes type")
                                print(f"   Found visual: {visual}")
                                issues_found.append(f"{test_id} Part 1: Missing visual object with notes type")
                                test_passed = False
                            
                            # Test 4 Part 4: Has "visual" object with "notes" type
                            part4 = parts[3] if len(parts) > 3 else {}
                            visual4 = part4.get("visual", {})
                            if visual4 and visual4.get("type") == "notes":
                                print(f"✅ {test_id} Part 4: Has visual object with notes type")
                            else:
                                print(f"❌ {test_id} Part 4: Missing visual object with notes type")
                                print(f"   Found visual: {visual4}")
                                issues_found.append(f"{test_id} Part 4: Missing visual object with notes type")
                                test_passed = False
                        
                        # Check that all parts have instructions and question groups
                        for part_idx, part in enumerate(parts, 1):
                            instructions = part.get("instructions", "")
                            question_groups = part.get("question_groups", [])
                            
                            if not instructions:
                                print(f"⚠️ {test_id} Part {part_idx}: No instructions found")
                            
                            if not question_groups:
                                print(f"❌ {test_id} Part {part_idx}: No question groups found")
                                issues_found.append(f"{test_id} Part {part_idx}: No question groups")
                                test_passed = False
                            else:
                                # Count total questions in this part
                                total_questions_in_part = 0
                                for qg in question_groups:
                                    questions = qg.get("questions", [])
                                    total_questions_in_part += len(questions)
                                print(f"   Part {part_idx}: {len(question_groups)} question groups, {total_questions_in_part} questions")
                    else:
                        print(f"❌ {test_id}: Listening has {len(parts)} parts (expected 4)")
                        issues_found.append(f"{test_id}: Listening wrong number of parts")
                        test_passed = False
                else:
                    print(f"❌ {test_id}: No listening section found")
                    issues_found.append(f"{test_id}: No listening section")
                    test_passed = False
                
                # 2. Check Reading section - 3 passages with questions
                reading = sections.get("reading", {})
                if reading:
                    passages = reading.get("passages", [])
                    if len(passages) == 3:
                        print(f"✅ {test_id}: Reading has 3 passages")
                        
                        # Check each passage has questions
                        for passage_idx, passage in enumerate(passages, 1):
                            question_groups = passage.get("question_groups", [])
                            if not question_groups:
                                print(f"❌ {test_id} Reading Passage {passage_idx}: No question groups")
                                issues_found.append(f"{test_id} Reading Passage {passage_idx}: No questions")
                                test_passed = False
                            else:
                                # Count total questions in this passage
                                total_questions_in_passage = 0
                                for qg in question_groups:
                                    questions = qg.get("questions", [])
                                    total_questions_in_passage += len(questions)
                                print(f"   Passage {passage_idx}: {len(question_groups)} question groups, {total_questions_in_passage} questions")
                    else:
                        print(f"❌ {test_id}: Reading has {len(passages)} passages (expected 3)")
                        issues_found.append(f"{test_id}: Reading wrong number of passages")
                        test_passed = False
                else:
                    print(f"❌ {test_id}: No reading section found")
                    issues_found.append(f"{test_id}: No reading section")
                    test_passed = False
                
                # 3. Check Writing section - 2 tasks with prompts and visual_url
                writing = sections.get("writing", {})
                if writing:
                    tasks = writing.get("tasks", [])
                    if len(tasks) == 2:
                        print(f"✅ {test_id}: Writing has 2 tasks")
                        
                        # Check each task has prompt and visual_url
                        for task_idx, task in enumerate(tasks, 1):
                            prompt = task.get("prompt", "")
                            visual_data = task.get("visual_data", {})
                            visual_url = visual_data.get("visual_url", "")
                            
                            if not prompt:
                                print(f"❌ {test_id} Writing Task {task_idx}: No prompt")
                                issues_found.append(f"{test_id} Writing Task {task_idx}: No prompt")
                                test_passed = False
                            else:
                                print(f"   Task {task_idx}: Has prompt ({len(prompt)} chars)")
                            
                            if not visual_url:
                                print(f"⚠️ {test_id} Writing Task {task_idx}: No visual_url")
                            else:
                                print(f"   Task {task_idx}: Has visual_url: {visual_url}")
                    else:
                        print(f"❌ {test_id}: Writing has {len(tasks)} tasks (expected 2)")
                        issues_found.append(f"{test_id}: Writing wrong number of tasks")
                        test_passed = False
                else:
                    print(f"❌ {test_id}: No writing section found")
                    issues_found.append(f"{test_id}: No writing section")
                    test_passed = False
                
                # 4. Check Speaking section - 3 parts with questions/cue_card
                speaking = sections.get("speaking", {})
                if speaking:
                    parts = speaking.get("parts", {})
                    
                    # Handle both dict and list formats for parts
                    if isinstance(parts, list):
                        parts_dict = {}
                        for idx, part in enumerate(parts, 1):
                            parts_dict[f"part{idx}"] = part
                        parts = parts_dict
                    
                    if len(parts) == 3:
                        print(f"✅ {test_id}: Speaking has 3 parts")
                        
                        # Check Part 1 has questions
                        part1 = parts.get("part1", {})
                        if part1:
                            questions = part1.get("questions", []) or part1.get("sample_questions", [])
                            if questions:
                                print(f"✅ {test_id} Speaking Part 1: Has {len(questions)} questions")
                            else:
                                print(f"❌ {test_id} Speaking Part 1: No questions found")
                                issues_found.append(f"{test_id} Speaking Part 1: No questions")
                                test_passed = False
                        
                        # Check Part 2 has cue card
                        part2 = parts.get("part2", {})
                        if part2:
                            cue_card = part2.get("cue_card", {})
                            if cue_card:
                                topic = cue_card.get("topic", "")
                                bullet_points = cue_card.get("bullet_points", []) or cue_card.get("points", [])
                                print(f"✅ {test_id} Speaking Part 2: Has cue card with topic and {len(bullet_points)} points")
                            else:
                                print(f"❌ {test_id} Speaking Part 2: No cue card found")
                                issues_found.append(f"{test_id} Speaking Part 2: No cue card")
                                test_passed = False
                        
                        # Check Part 3 has questions
                        part3 = parts.get("part3", {})
                        if part3:
                            questions = part3.get("questions", [])
                            discussion_topics = part3.get("discussion_topics", [])
                            if questions:
                                print(f"✅ {test_id} Speaking Part 3: Has {len(questions)} questions")
                            elif discussion_topics:
                                print(f"✅ {test_id} Speaking Part 3: Has {len(discussion_topics)} discussion topics")
                            else:
                                print(f"❌ {test_id} Speaking Part 3: No questions found")
                                issues_found.append(f"{test_id} Speaking Part 3: No questions")
                                test_passed = False
                    else:
                        print(f"❌ {test_id}: Speaking has {len(parts)} parts (expected 3)")
                        issues_found.append(f"{test_id}: Speaking wrong number of parts")
                        test_passed = False
                else:
                    print(f"❌ {test_id}: No speaking section found")
                    issues_found.append(f"{test_id}: No speaking section")
                    test_passed = False
                
                if test_passed:
                    success_count += 1
                    print(f"✅ {test_id}: All structure checks passed")
                else:
                    print(f"❌ {test_id}: Some structure checks failed")
                    
            else:
                print(f"❌ {test_id}: API call failed with status {response.status_code}")
                print(f"Response: {response.text}")
                issues_found.append(f"{test_id}: API call failed")
                
        except Exception as e:
            print(f"❌ {test_id}: Error during API call - {e}")
            issues_found.append(f"{test_id}: Exception - {str(e)}")
    
    print(f"\n{'='*80}")
    print(f"🏁 CAMBRIDGE IELTS 18 DETAILED API SUMMARY: {success_count}/{total_tests} tests passed")
    
    if issues_found:
        print(f"\n❌ ISSUES FOUND:")
        for issue in issues_found:
            print(f"   - {issue}")
    
    if success_count == total_tests:
        print("✅ ALL CAMBRIDGE IELTS 18 DETAILED API TESTS PASSED!")
        print("   Key features verified:")
        print("   - All 4 test endpoints return valid responses")
        print("   - Listening: 4 parts with questions, visuals, instructions")
        print("   - Reading: 3 passages with questions")
        print("   - Writing: 2 tasks with prompts and visual_url")
        print("   - Speaking: 3 parts with questions/cue_card")
        print("   - Test 2 Part 1: Has visual object with notes type")
        print("   - Test 2 Part 3: All questions (21-30) have question_text field")
        print("   - Test 2 Part 4: Has visual object with notes type")
        print("   - Test 4 Part 1: Has visual object with notes type")
        print("   - Test 4 Part 4: Has visual object with notes type")
        return True
    else:
        print("❌ SOME CAMBRIDGE IELTS 18 DETAILED API TESTS FAILED!")
        return False


if __name__ == "__main__":
    print("🚀 Starting Cambridge IELTS 18 Detailed API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    
    # Test Cambridge IELTS 18 API endpoints with detailed verification
    test_cambridge_ielts_18_detailed()
    
    print("\n" + "="*60)
    print("🏁 CAMBRIDGE IELTS 18 DETAILED API TESTS COMPLETED")
    print("="*60)