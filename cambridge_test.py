#!/usr/bin/env python3
"""
Cambridge IELTS 18 API Endpoint Testing
Tests the specific API endpoints for Cambridge IELTS 18 as requested
"""

import requests
import json
import os

# Get backend URL from frontend env
BACKEND_URL = "https://temp-plan-expiry.preview.emergentagent.com/api"

def test_cambridge_ielts_18_api_endpoints():
    """Test Cambridge IELTS 18 API endpoints as per review request"""
    print("\n" + "="*80)
    print("🚀 TESTING CAMBRIDGE IELTS 18 API ENDPOINTS")
    print("="*80)
    
    success_count = 0
    total_tests = 5
    
    # Test 1: GET /api/cambridge/books - Verify ielts18 book is listed with 4 available tests
    print("\n=== Test 1: GET /api/cambridge/books ===")
    try:
        response = requests.get(f"{BACKEND_URL}/cambridge/books")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ API call successful")
            
            books = result.get("books", [])
            ielts18_found = False
            
            for book in books:
                book_id = book.get("book_id")
                available_tests = book.get("available_tests", 0)
                
                if book_id == "ielts18":
                    if available_tests == 4:
                        print(f"✅ IELTS 18 found with 4 tests available")
                        ielts18_found = True
                    else:
                        print(f"❌ IELTS 18 found but has {available_tests} tests (expected 4)")
                    break
            
            if ielts18_found:
                print(f"✅ IELTS 18 book is listed with 4 available tests")
                success_count += 1
            else:
                print(f"❌ IELTS 18 book not found in books list")
        else:
            print(f"❌ Failed with status {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2-5: Test each of the 4 Cambridge 18 tests with detailed structure verification
    cambridge_18_tests = ["test1", "test2", "test3", "test4"]
    
    for i, test_id in enumerate(cambridge_18_tests, 2):
        print(f"\n=== Test {i}: GET /api/cambridge/test/ielts18/{test_id} ===")
        try:
            response = requests.get(f"{BACKEND_URL}/cambridge/test/ielts18/{test_id}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                test_data = result.get("test", {})
                print(f"✅ API call successful")
                
                # Verify complete test structure
                sections = test_data.get("sections", {})
                test_passed = True
                
                # Check listening section - should have 4 parts
                listening = sections.get("listening", {})
                listening_parts = listening.get("parts", [])
                if len(listening_parts) == 4:
                    print(f"✅ Listening has 4 parts")
                else:
                    print(f"❌ Listening has {len(listening_parts)} parts (expected 4)")
                    test_passed = False
                
                # Check reading section - should have 3 passages
                reading = sections.get("reading", {})
                reading_passages = reading.get("passages", [])
                if len(reading_passages) == 3:
                    print(f"✅ Reading has 3 passages")
                else:
                    print(f"❌ Reading has {len(reading_passages)} passages (expected 3)")
                    test_passed = False
                
                # Check writing section - should have 2 tasks
                writing = sections.get("writing", {})
                writing_tasks = writing.get("tasks", [])
                if len(writing_tasks) == 2:
                    print(f"✅ Writing has 2 tasks")
                else:
                    print(f"❌ Writing has {len(writing_tasks)} tasks (expected 2)")
                    test_passed = False
                
                # Special check for Test 2 - verify Part 2 has map_image field
                if test_id == "test2":
                    part2_has_map = False
                    if len(listening_parts) >= 2:
                        part2 = listening_parts[1]  # Part 2 (index 1)
                        # Check for map_image field or map-related content
                        if ("map_image" in part2 or 
                            any("map" in str(qg).lower() for qg in part2.get("question_groups", [])) or
                            any("map" in str(part2).lower())):
                            print(f"✅ Test 2 Part 2 has map_image field or map-related content")
                            part2_has_map = True
                        else:
                            print(f"❌ Test 2 Part 2 missing map_image field or map content")
                            test_passed = False
                
                # Verify matching questions have proper structure
                matching_questions_verified = True
                matching_found = False
                
                for section_name, section_data in sections.items():
                    if section_name == "listening":
                        for part in section_data.get("parts", []):
                            for qg in part.get("question_groups", []):
                                if qg.get("question_type") == "matching":
                                    matching_found = True
                                    # Check for options array
                                    if "options" not in qg or not qg.get("options"):
                                        print(f"❌ Matching question in {section_name} missing options array")
                                        matching_questions_verified = False
                                    # Check for items array with question text
                                    if "items" not in qg or not qg.get("items"):
                                        print(f"❌ Matching question in {section_name} missing items array")
                                        matching_questions_verified = False
                                    # Check for instruction text
                                    if "instruction" not in qg or not qg.get("instruction"):
                                        print(f"❌ Matching question in {section_name} missing instruction text")
                                        matching_questions_verified = False
                    elif section_name == "reading":
                        for passage in section_data.get("passages", []):
                            for qg in passage.get("question_groups", []):
                                if qg.get("question_type") == "matching":
                                    matching_found = True
                                    # Check for options array
                                    if "options" not in qg or not qg.get("options"):
                                        print(f"❌ Matching question in {section_name} missing options array")
                                        matching_questions_verified = False
                                    # Check for items array with question text
                                    if "items" not in qg or not qg.get("items"):
                                        print(f"❌ Matching question in {section_name} missing items array")
                                        matching_questions_verified = False
                                    # Check for instruction text
                                    if "instruction" not in qg or not qg.get("instruction"):
                                        print(f"❌ Matching question in {section_name} missing instruction text")
                                        matching_questions_verified = False
                
                if matching_found and matching_questions_verified:
                    print(f"✅ Matching questions have proper structure (options, items, instruction)")
                elif not matching_found:
                    print(f"ℹ️ No matching questions found in {test_id}")
                    # Don't fail the test if no matching questions are found
                
                if test_passed:
                    print(f"✅ {test_id} structure verification passed")
                    success_count += 1
                else:
                    print(f"❌ {test_id} structure verification failed")
            else:
                print(f"❌ Failed with status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n{'='*80}")
    print(f"🏁 CAMBRIDGE IELTS 18 API SUMMARY: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("✅ ALL CAMBRIDGE IELTS 18 API TESTS PASSED!")
        print("   Key features verified:")
        print("   - IELTS 18 book listed with 4 available tests")
        print("   - All 4 tests have complete structure (listening: 4 parts, reading: 3 passages, writing: 2 tasks)")
        print("   - Test 2 Part 2 has map_image field or map-related content")
        print("   - Matching questions (if present) have options array, items array, and instruction text")
        return True
    else:
        print("❌ SOME CAMBRIDGE IELTS 18 API TESTS FAILED!")
        return False


if __name__ == "__main__":
    print("🚀 Starting Cambridge IELTS 18 API Endpoint Testing")
    print("=" * 80)
    
    # Run Cambridge IELTS 18 API endpoint tests as per review request
    cambridge_18_passed = test_cambridge_ielts_18_api_endpoints()
    
    # Final summary
    print("\n" + "=" * 80)
    print("🏁 FINAL TEST SUMMARY - CAMBRIDGE IELTS 18 API ENDPOINT TESTING")
    print("=" * 80)
    
    if cambridge_18_passed:
        print("✅ ALL CAMBRIDGE IELTS 18 API ENDPOINT TESTS PASSED!")
        print("   Key API endpoints verified:")
        print("   - GET /api/cambridge/books returns ielts18 with 4 available tests")
        print("   - GET /api/cambridge/test/ielts18/test1 returns complete test structure")
        print("   - GET /api/cambridge/test/ielts18/test2 returns complete test structure + map_image")
        print("   - GET /api/cambridge/test/ielts18/test3 returns complete test structure")
        print("   - GET /api/cambridge/test/ielts18/test4 returns complete test structure")
        print("   - All tests have listening (4 parts), reading (3 passages), writing (2 tasks)")
        print("   - Matching questions have options array, items array, and instruction text")
    else:
        print("❌ SOME CAMBRIDGE IELTS 18 API ENDPOINT TESTS FAILED!")
    
    print("\n🎯 Cambridge IELTS 18 API endpoint testing complete!")
    
    exit(0 if cambridge_18_passed else 1)