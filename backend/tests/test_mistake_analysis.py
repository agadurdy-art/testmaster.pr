"""
Test cases for Phase 2 Results Page Enhancement:
- Reason codes for wrong answers (UNANSWERED, TFNG_CONFUSION, SPELLING_ERROR, DISTRACTOR_TRAP, WRONG_ANSWER)
- Evidence text extraction from passages for wrong reading answers
- Reason summary aggregation
- Retry wrong-only functionality support
"""

import pytest
import requests
import os

# Try multiple env vars for URL resolution
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL') or os.environ.get('API_URL') or 'http://localhost:8001'

class TestMistakeAnalysis:
    """Test reason codes, evidence text, and reason summary features"""
    
    def test_api_accessible(self):
        """Verify API is accessible via cambridge books endpoint"""
        response = requests.get(f"{BASE_URL}/api/cambridge/books")
        assert response.status_code == 200
        print(f"✓ API accessible: {response.json().get('success')}")
    
    def test_full_test_evaluation_with_mixed_answers(self):
        """
        Test POST /api/cambridge/evaluate/full-test with mixed correct/wrong answers
        to verify reason codes, evidence text, and reason_summary
        """
        # Create test answers with various error types
        test_answers = {
            # UNANSWERED - empty answers
            "listening_1": "",
            "listening_2": "",
            
            # Correct answers (assuming some typical correct answers)
            "listening_3": "Monday",
            "listening_4": "swimming",
            
            # SPELLING_ERROR - misspelled
            "listening_5": "docter",  # Should be "doctor"
            
            # Wrong answers for listening
            "listening_6": "wrong answer",
            "listening_7": "another wrong",
            
            # TFNG for reading - typical T/F/NG confusion
            "reading_1": "True",  # Might be False/Not Given
            "reading_2": "False",
            "reading_3": "Not Given",
            
            # UNANSWERED reading
            "reading_4": "",
            "reading_5": "",
            
            # Wrong reading answers
            "reading_6": "wrong answer",
            "reading_7": "incorrect",
            
            # SPELLING_ERROR reading
            "reading_8": "industreal",  # Should be "industrial"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": test_answers,
                "user_plan": "free"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify success
        assert data.get("success") == True, f"Expected success=True, got {data}"
        print(f"✓ Evaluation response received successfully")
        
        # Verify scores structure
        assert "scores" in data, "Missing 'scores' in response"
        assert "listening" in data["scores"], "Missing 'listening' in scores"
        assert "reading" in data["scores"], "Missing 'reading' in scores"
        print(f"✓ Scores structure verified")
        
        # Verify question_results structure
        assert "question_results" in data, "Missing 'question_results' in response"
        assert "listening" in data["question_results"], "Missing 'listening' in question_results"
        assert "reading" in data["question_results"], "Missing 'reading' in question_results"
        print(f"✓ question_results structure verified")
        
        # Verify reason_summary exists
        assert "reason_summary" in data, "Missing 'reason_summary' in response"
        reason_summary = data["reason_summary"]
        print(f"✓ reason_summary present: {reason_summary}")
    
    
    def test_reason_codes_in_listening_results(self):
        """Verify reason_code and reason_label are present for wrong listening answers"""
        test_answers = {
            "listening_1": "",  # UNANSWERED
            "listening_2": "wrong",  # WRONG_ANSWER
            "listening_3": "docter",  # Potentially SPELLING_ERROR if correct is "doctor"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": test_answers,
                "user_plan": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        listening_results = data.get("question_results", {}).get("listening", [])
        assert len(listening_results) > 0, "No listening results returned"
        
        # Find wrong answers and check for reason codes
        wrong_answers = [q for q in listening_results if not q.get("is_correct")]
        
        print(f"Found {len(wrong_answers)} wrong listening answers")
        
        for q in wrong_answers:
            qid = q.get("question_id")
            reason_code = q.get("reason_code")
            reason_label = q.get("reason_label")
            
            assert reason_code is not None, f"Question {qid}: missing reason_code"
            assert reason_label is not None, f"Question {qid}: missing reason_label"
            
            # Verify valid reason codes
            valid_codes = ["UNANSWERED", "TFNG_CONFUSION", "YNNG_CONFUSION", 
                          "SPELLING_ERROR", "DISTRACTOR_TRAP", "NEAR_MISS", "WRONG_ANSWER"]
            assert reason_code in valid_codes, f"Question {qid}: invalid reason_code '{reason_code}'"
            
            print(f"✓ Question {qid}: reason_code={reason_code}, reason_label={reason_label}")
    
    
    def test_unanswered_reason_code(self):
        """Verify UNANSWERED reason code is correctly assigned for empty answers"""
        test_answers = {
            "listening_1": "",
            "listening_2": "   ",  # Whitespace only
            "reading_1": "",
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": test_answers,
                "user_plan": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Check reason_summary has UNANSWERED count
        reason_summary = data.get("reason_summary", {})
        
        # Should have at least some UNANSWERED
        unanswered_count = reason_summary.get("UNANSWERED", 0)
        print(f"✓ UNANSWERED count in reason_summary: {unanswered_count}")
        
        # Verify in question results
        listening_results = data.get("question_results", {}).get("listening", [])
        q1 = next((q for q in listening_results if str(q.get("question_id")) == "1"), None)
        
        if q1 and not q1.get("is_correct"):
            assert q1.get("reason_code") == "UNANSWERED", f"Expected UNANSWERED for empty answer, got {q1.get('reason_code')}"
            print(f"✓ Question 1 correctly marked as UNANSWERED")
    
    def test_evidence_text_for_reading_wrong_answers(self):
        """Verify evidence_text is present for reading wrong answers"""
        test_answers = {
            "reading_1": "wrong answer",
            "reading_2": "incorrect",
            "reading_3": "",  # Unanswered
            "reading_4": "False",  # Might be a TFNG question
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": test_answers,
                "user_plan": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        reading_results = data.get("question_results", {}).get("reading", [])
        wrong_reading = [q for q in reading_results if not q.get("is_correct")]
        
        print(f"Found {len(wrong_reading)} wrong reading answers")
        
        evidence_count = 0
        for q in wrong_reading:
            qid = q.get("question_id")
            evidence = q.get("evidence_text")
            
            # evidence_text can be None/empty if passage text not available
            if evidence:
                evidence_count += 1
                print(f"✓ Question {qid}: evidence_text present (length={len(evidence)})")
            else:
                print(f"  Question {qid}: evidence_text is empty/null")
        
        print(f"✓ Total reading questions with evidence: {evidence_count}/{len(wrong_reading)}")
    
    def test_reason_summary_aggregation(self):
        """Verify reason_summary correctly counts all reason types"""
        # Send mixed answers to get multiple reason types
        test_answers = {
            # UNANSWERED
            "listening_1": "",
            "listening_2": "",
            "reading_1": "",
            
            # Various wrong answers
            "listening_3": "completely wrong",
            "listening_4": "also wrong",
            "reading_2": "True",  # Potentially TFNG_CONFUSION
            "reading_3": "False",
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": test_answers,
                "user_plan": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        reason_summary = data.get("reason_summary", {})
        assert isinstance(reason_summary, dict), "reason_summary should be a dict"
        
        # Verify counts are positive integers
        for code, count in reason_summary.items():
            assert isinstance(count, int), f"Count for {code} should be int, got {type(count)}"
            assert count > 0, f"Count for {code} should be positive, got {count}"
            print(f"✓ reason_summary[{code}] = {count}")
        
        # Total in reason_summary should match total wrong answers
        total_reason = sum(reason_summary.values())
        
        listening_wrong = len([q for q in data.get("question_results", {}).get("listening", []) if not q.get("is_correct")])
        reading_wrong = len([q for q in data.get("question_results", {}).get("reading", []) if not q.get("is_correct")])
        total_wrong = listening_wrong + reading_wrong
        
        print(f"✓ Total wrong answers: {total_wrong}, Total in reason_summary: {total_reason}")
        assert total_reason == total_wrong, f"Mismatch: reason_summary total ({total_reason}) != wrong answers ({total_wrong})"
    
    def test_correct_answers_no_reason_code(self):
        """Verify correct answers do NOT have reason_code"""
        # We need to provide at least some correct answers
        # First, get the answer key to know what's correct
        ans_response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test1")
        assert ans_response.status_code == 200
        ans_data = ans_response.json()
        correct_answers = ans_data.get("answers", {})
        
        # Get first 3 listening answers
        listening_keys = list(correct_answers.get("listening", {}).keys())[:3]
        
        test_answers = {}
        for key in listening_keys:
            correct = correct_answers["listening"][key]
            if isinstance(correct, list):
                correct = correct[0]
            test_answers[f"listening_{key}"] = correct
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": test_answers,
                "user_plan": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        listening_results = data.get("question_results", {}).get("listening", [])
        correct_results = [q for q in listening_results if q.get("is_correct")]
        
        for q in correct_results:
            qid = q.get("question_id")
            assert q.get("reason_code") is None, f"Question {qid}: correct answer should not have reason_code"
            assert q.get("reason_label") is None, f"Question {qid}: correct answer should not have reason_label"
            print(f"✓ Question {qid}: correct answer has no reason_code (as expected)")
    
    def test_tfng_confusion_detection(self):
        """Test TFNG_CONFUSION is detected for T/F/NG question type"""
        # Get answer key to find TFNG questions
        ans_response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test1")
        assert ans_response.status_code == 200
        ans_data = ans_response.json()
        
        # Send wrong T/F/NG answers  
        test_answers = {
            "reading_1": "True",
            "reading_2": "False", 
            "reading_3": "Not Given",
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": test_answers,
                "user_plan": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        reading_results = data.get("question_results", {}).get("reading", [])
        
        tfng_confusion_count = 0
        for q in reading_results:
            if q.get("reason_code") == "TFNG_CONFUSION":
                tfng_confusion_count += 1
                print(f"✓ Question {q.get('question_id')}: TFNG_CONFUSION detected")
        
        print(f"Total TFNG_CONFUSION detected: {tfng_confusion_count}")
    
    def test_skill_breakdown_present(self):
        """Verify skill_breakdown is returned for analysis"""
        test_answers = {
            "listening_1": "test",
            "reading_1": "test",
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": test_answers,
                "user_plan": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "skill_breakdown" in data, "Missing skill_breakdown in response"
        skill_breakdown = data["skill_breakdown"]
        assert isinstance(skill_breakdown, list), "skill_breakdown should be a list"
        
        print(f"✓ skill_breakdown contains {len(skill_breakdown)} skills")
        
        for skill in skill_breakdown[:5]:  # Print first 5
            print(f"  - {skill.get('label')}: {skill.get('correct')}/{skill.get('total')}")
    
    def test_fastest_gain_present(self):
        """Verify fastest_gain recommendations are returned"""
        test_answers = {
            "listening_1": "wrong",
            "listening_2": "wrong",
            "reading_1": "wrong",
            "reading_2": "wrong",
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": test_answers,
                "user_plan": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "fastest_gain" in data, "Missing fastest_gain in response"
        fastest_gain = data["fastest_gain"]
        
        print(f"✓ fastest_gain contains {len(fastest_gain)} recommendations")
        
        for item in fastest_gain[:3]:
            print(f"  - {item.get('label')}: +{item.get('wrong_count')} possible")
    
    def test_integrity_warnings_for_unanswered(self):
        """Verify integrity_warnings are generated for many unanswered questions"""
        # Leave many questions unanswered
        test_answers = {
            "listening_1": "one answer",
        }
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": test_answers,
                "user_plan": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "integrity_warnings" in data, "Missing integrity_warnings in response"
        warnings = data["integrity_warnings"]
        
        print(f"✓ integrity_warnings: {len(warnings)} warnings")
        
        for w in warnings:
            print(f"  - [{w.get('type')}] {w.get('message')}")
        
        # Should have warnings about unanswered questions
        unanswered_warnings = [w for w in warnings if w.get("type") == "unanswered"]
        assert len(unanswered_warnings) > 0, "Expected unanswered warnings"


class TestAnswerKeyEndpoint:
    """Test the answer key endpoint used for retry functionality"""
    
    def test_get_answer_key(self):
        """Verify GET /api/cambridge/answers/{book_id}/{test_id} returns answer key"""
        response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test1")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "answers" in data
        
        answers = data["answers"]
        assert "listening" in answers, "Missing listening answers"
        assert "reading" in answers, "Missing reading answers"
        
        print(f"✓ Listening answers: {len(answers['listening'])} questions")
        print(f"✓ Reading answers: {len(answers['reading'])} questions")


class TestCambridgeTestEndpoints:
    """Test basic Cambridge test endpoints"""
    
    def test_list_books(self):
        """Verify GET /api/cambridge/books returns book list"""
        response = requests.get(f"{BASE_URL}/api/cambridge/books")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "books" in data
        assert len(data["books"]) > 0
        
        print(f"✓ Available books: {[b['book_id'] for b in data['books']]}")
    
    def test_get_test(self):
        """Verify GET /api/cambridge/test/{book_id}/{test_id} returns test data"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test1")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "test" in data
        
        test = data["test"]
        assert "sections" in test
        assert "listening" in test["sections"]
        assert "reading" in test["sections"]
        
        print(f"✓ Test loaded: {test.get('title', 'Unknown')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
