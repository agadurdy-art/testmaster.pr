"""
Cambridge IELTS Test Results API Tests
Tests for the CambridgeTestResults page backend endpoints:
- /api/cambridge/books - List available Cambridge books
- /api/cambridge/test/{book_id}/{test_id} - Get test content
- /api/cambridge/answers/{book_id}/{test_id} - Get answer keys
- /api/cambridge/evaluate/full-test - Full test evaluation with AI feedback
- /api/cambridge/evaluate/writing - Writing evaluation
"""

import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCambridgeBooks:
    """Test Cambridge books listing endpoints"""
    
    def test_list_cambridge_books(self):
        """Test listing all available Cambridge books"""
        response = requests.get(f"{BASE_URL}/api/cambridge/books")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "books" in data
        assert len(data["books"]) > 0
        
        # Verify book structure
        book = data["books"][0]
        assert "book_id" in book
        assert "title" in book
        assert "available_tests" in book
        print(f"✓ Found {len(data['books'])} Cambridge books")
    
    def test_get_cambridge_book_details(self):
        """Test getting details of a specific Cambridge book"""
        response = requests.get(f"{BASE_URL}/api/cambridge/books/ielts17")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "book" in data
        assert data["book"]["book_id"] == "ielts17"
        assert "tests" in data["book"]
        print(f"✓ Book ielts17 has {len(data['book']['tests'])} tests")
    
    def test_get_nonexistent_book(self):
        """Test getting a book that doesn't exist"""
        response = requests.get(f"{BASE_URL}/api/cambridge/books/nonexistent")
        assert response.status_code == 404
        print("✓ Correctly returns 404 for nonexistent book")


class TestCambridgeTestContent:
    """Test Cambridge test content endpoints"""
    
    def test_get_test_content(self):
        """Test getting full test content"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test1")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "test" in data
        
        test = data["test"]
        assert test["test_id"] == "ielts17_test1"
        assert "sections" in test
        assert "listening" in test["sections"]
        assert "reading" in test["sections"]
        assert "writing" in test["sections"]
        assert "speaking" in test["sections"]
        print("✓ Test content includes all 4 sections")
    
    def test_get_test_section(self):
        """Test getting a specific section of a test"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test1/section/listening")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["section"] == "listening"
        assert "data" in data
        print("✓ Listening section retrieved successfully")
    
    def test_get_nonexistent_test(self):
        """Test getting a test that doesn't exist"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test99")
        assert response.status_code == 404
        print("✓ Correctly returns 404 for nonexistent test")


class TestCambridgeAnswerKeys:
    """Test Cambridge answer key endpoints"""
    
    def test_get_answer_keys(self):
        """Test getting answer keys for a test"""
        response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test1")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "answers" in data
        
        answers = data["answers"]
        assert "listening" in answers
        assert "reading" in answers
        
        # Verify listening has 40 answers
        assert len(answers["listening"]) == 40
        # Verify reading has 40 answers
        assert len(answers["reading"]) == 40
        print(f"✓ Answer keys: {len(answers['listening'])} listening, {len(answers['reading'])} reading")
    
    def test_answer_key_format(self):
        """Test that answer keys have correct format"""
        response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test1")
        data = response.json()
        
        # Check some specific answers
        listening = data["answers"]["listening"]
        assert listening["1"] == "litter"
        assert listening["11"] == "A"
        
        reading = data["answers"]["reading"]
        assert reading["1"] == "population"
        assert reading["7"] == "FALSE"
        print("✓ Answer key format is correct")


class TestCambridgeFullTestEvaluation:
    """Test the comprehensive full test evaluation endpoint"""
    
    def test_full_test_evaluation_with_sample_answers(self):
        """Test full test evaluation with sample answers"""
        # Create sample answers (mix of correct and incorrect)
        sample_answers = {
            # Listening answers (some correct, some wrong)
            "listening_1": "litter",  # correct
            "listening_2": "dogs",    # correct
            "listening_3": "birds",   # wrong (should be insects)
            "listening_4": "butterflies",  # correct
            "listening_5": "fence",   # wrong (should be wall)
            "listening_11": "A",      # correct
            "listening_12": "A",      # wrong (should be C)
            # Reading answers
            "reading_1": "population",  # correct
            "reading_2": "suburbs",     # correct
            "reading_3": "businessmen", # correct
            "reading_7": "FALSE",       # correct
            "reading_8": "TRUE",        # wrong (should be NOT GIVEN)
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": sample_answers,
                "user_plan": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
        # Verify scores structure
        assert "scores" in data
        scores = data["scores"]
        assert "listening" in scores
        assert "reading" in scores
        assert "overall" in scores
        
        # Verify listening scores
        assert "correct" in scores["listening"]
        assert "total" in scores["listening"]
        assert "band" in scores["listening"]
        assert "percentage" in scores["listening"]
        
        print(f"✓ Listening: {scores['listening']['correct']}/{scores['listening']['total']} (Band {scores['listening']['band']})")
        print(f"✓ Reading: {scores['reading']['correct']}/{scores['reading']['total']} (Band {scores['reading']['band']})")
        print(f"✓ Overall Band: {scores['overall']['band']}")
    
    def test_full_test_evaluation_skill_breakdown(self):
        """Test that skill breakdown is returned"""
        sample_answers = {
            "listening_1": "litter",
            "listening_2": "dogs",
            "reading_1": "population",
            "reading_7": "FALSE",
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": sample_answers,
                "user_plan": "free"
            }
        )
        
        data = response.json()
        assert "skill_breakdown" in data
        
        skill_breakdown = data["skill_breakdown"]
        assert len(skill_breakdown) > 0
        
        # Verify skill breakdown structure
        for skill in skill_breakdown:
            assert "skill_id" in skill
            assert "label" in skill
            assert "correct" in skill
            assert "total" in skill
            assert "tip" in skill
        
        print(f"✓ Skill breakdown has {len(skill_breakdown)} categories")
    
    def test_full_test_evaluation_teacher_feedback(self):
        """Test that AI teacher feedback is returned"""
        sample_answers = {
            "listening_1": "litter",
            "listening_2": "dogs",
            "reading_1": "population",
            "reading_7": "FALSE",
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": sample_answers,
                "user_plan": "free"
            },
            timeout=60  # AI feedback may take time
        )
        
        data = response.json()
        assert "teacher_feedback" in data
        
        feedback = data["teacher_feedback"]
        assert "short" in feedback
        assert "detailed" in feedback
        assert len(feedback["short"]) > 0
        assert len(feedback["detailed"]) > 0
        
        print(f"✓ Teacher feedback short: {feedback['short'][:100]}...")
    
    def test_full_test_evaluation_recommended_lessons(self):
        """Test that recommended lessons are returned"""
        # Use answers that will create weak areas
        sample_answers = {
            "listening_1": "wrong",
            "listening_2": "wrong",
            "reading_7": "TRUE",  # wrong
            "reading_8": "TRUE",  # wrong
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": sample_answers,
                "user_plan": "free"
            },
            timeout=60
        )
        
        data = response.json()
        assert "recommended_lessons" in data
        
        # If there are weak areas, lessons should be recommended
        lessons = data["recommended_lessons"]
        if len(lessons) > 0:
            lesson = lessons[0]
            assert "lesson_id" in lesson
            assert "title" in lesson
            assert "course" in lesson
            assert "route" in lesson
            assert "reason" in lesson
            print(f"✓ Recommended {len(lessons)} lessons based on weak areas")
        else:
            print("✓ No lessons recommended (no weak areas detected)")
    
    def test_full_test_evaluation_question_results(self):
        """Test that detailed question results are returned"""
        sample_answers = {
            "listening_1": "litter",
            "listening_2": "wrong",
            "reading_1": "population",
            "reading_7": "TRUE",
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": sample_answers,
                "user_plan": "free"
            },
            timeout=60
        )
        
        data = response.json()
        assert "question_results" in data
        
        results = data["question_results"]
        assert "listening" in results
        assert "reading" in results
        
        # Verify question result structure
        if len(results["listening"]) > 0:
            q = results["listening"][0]
            assert "question_id" in q
            assert "question_type" in q
            assert "user_answer" in q
            assert "correct_answer" in q
            assert "is_correct" in q
            assert "explanation" in q
            print(f"✓ Question results: {len(results['listening'])} listening, {len(results['reading'])} reading")


class TestCambridgeWritingEvaluation:
    """Test Cambridge writing evaluation endpoint"""
    
    def test_writing_evaluation_task1(self):
        """Test writing evaluation for Task 1"""
        sample_response = """
        The two maps illustrate the current layout of Norbiton industrial area and the planned 
        future development of the site. Overall, the area is set to undergo significant transformation, 
        with the industrial zone being replaced by residential and community facilities.
        
        Currently, the industrial area occupies the centre of the map, bordered by farmland to the 
        north (separated by a river), and the main road to the south. The existing infrastructure 
        consists of several factory buildings connected by a network of roads.
        
        According to the planned development, the factories will be demolished to make way for 
        housing estates. A new roundabout will be constructed at the centre, around which various 
        facilities will be built: shops and a medical centre to the west, and a school with an 
        adjacent playground to the east.
        """
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/writing",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "task_number": 1,
                "response": sample_response
            },
            timeout=60
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
        # Verify evaluation structure
        assert "overall_band" in data
        assert "word_count" in data
        assert "criteria" in data
        assert "feedback" in data
        
        criteria = data["criteria"]
        assert "task_achievement" in criteria
        assert "coherence_cohesion" in criteria
        assert "lexical_resource" in criteria
        assert "grammatical_range" in criteria
        
        print(f"✓ Writing Task 1 evaluated: Band {data['overall_band']}")
        print(f"  - Task Achievement: {criteria['task_achievement']}")
        print(f"  - Coherence: {criteria['coherence_cohesion']}")
        print(f"  - Lexical: {criteria['lexical_resource']}")
        print(f"  - Grammar: {criteria['grammatical_range']}")
    
    def test_writing_evaluation_task2(self):
        """Test writing evaluation for Task 2"""
        sample_response = """
        Risk-taking is an inherent part of human progress, and while it can lead to failure, 
        I firmly believe that the potential benefits far outweigh the drawbacks. This essay 
        will explore why taking calculated risks is essential for both personal and professional 
        development.
        
        Admittedly, taking risks can result in failure, financial loss, or damaged relationships. 
        Those who invest in new business ventures may lose their savings, while individuals who 
        change careers might find themselves starting from scratch. However, these potential 
        negative outcomes should not deter us from taking chances.
        
        The most successful individuals throughout history have been those willing to step outside 
        their comfort zones. Consider entrepreneurs like Steve Jobs or Elon Musk, whose willingness 
        to take substantial risks led to revolutionary innovations. On a personal level, taking 
        risks builds resilience and self-confidence.
        
        In conclusion, while risk-taking certainly involves the possibility of failure, the personal 
        growth, innovation, and opportunities it enables make it an essential component of a 
        fulfilling life.
        """
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/writing",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "task_number": 2,
                "response": sample_response
            },
            timeout=60
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "overall_band" in data
        assert "feedback" in data
        
        feedback = data["feedback"]
        assert "examiner_comment" in feedback
        assert "strengths" in feedback
        assert "improvements" in feedback
        
        print(f"✓ Writing Task 2 evaluated: Band {data['overall_band']}")
        print(f"  - Examiner comment: {feedback['examiner_comment'][:100]}...")


class TestCambridgeSampleAnswers:
    """Test Cambridge sample answers endpoint"""
    
    def test_get_sample_answers(self):
        """Test getting sample writing answers"""
        response = requests.get(f"{BASE_URL}/api/cambridge/sample-answers/ielts17/test1")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "samples" in data
        
        samples = data["samples"]
        if "writing" in samples:
            writing = samples["writing"]
            if "task1" in writing:
                assert "band_6" in writing["task1"] or "band_8" in writing["task1"]
                print("✓ Sample writing answers available")
        else:
            print("✓ Sample answers endpoint works (no samples in this test)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
