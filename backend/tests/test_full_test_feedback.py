"""
Test Full Test Feedback System
==============================
Tests the enhanced feedback mechanism for Full Test sets (A-H).
Tests: skill_breakdown, fastest_gain, teacher_feedback, integrity_warnings,
reason_summary, question_results with reason_code, explanation, skill_tip.
"""

import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

class TestFullTestSets:
    """Test GET /api/full-test/sets returns all 8 academic sets"""
    
    def test_get_all_sets_returns_8_academic(self):
        """Verify 8 academic sets are returned"""
        response = requests.get(f"{BASE_URL}/api/full-test/sets")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["success"] is True
        assert "academic_sets" in data
        assert data["total_academic"] == 8, f"Expected 8 academic sets, got {data['total_academic']}"
        
        # Verify all set IDs
        set_ids = [s["test_id"] for s in data["academic_sets"]]
        expected_ids = [
            "academic_set_a_01", "academic_set_b_01", "academic_set_c_01", "academic_set_d_01",
            "academic_set_e_01", "academic_set_f_01", "academic_set_g_01", "academic_set_h_01"
        ]
        for expected_id in expected_ids:
            assert expected_id in set_ids, f"Missing set: {expected_id}"
    
    def test_get_academic_sets_filtered(self):
        """Test filtering by test_type=academic"""
        response = requests.get(f"{BASE_URL}/api/full-test/sets?test_type=academic")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["test_type"] == "academic"
        assert data["total"] == 8


class TestFullTestComplete:
    """Test POST /api/full-test/complete endpoint with rich feedback"""
    
    @pytest.fixture
    def sample_listening_answers_mixed(self):
        """
        Generate mixed answers: some correct, some wrong, some blank, some spelling errors
        Based on academic_set_e_01 listening questions (L1Q1-L4Q40)
        """
        return {
            # Correct answers
            "L1Q1": "Henshaw",  # Correct
            "L1Q2": "1987",  # Correct
            "L1Q3": "Greenfield",  # Correct
            "L1Q4": "47",  # Correct
            "L1Q5": "Maple",  # Correct
            # Wrong answers
            "L1Q6": "9PQ",  # Wrong (should be 8PQ)
            "L1Q7": "936822",  # Wrong (should be 936821)
            # Blank/Unanswered
            "L1Q8": "",  # Blank
            "L1Q9": "",  # Blank
            # Spelling error
            "L1Q10": "penicilln",  # Spelling error (should be penicillin)
            
            # Part 2
            "L2Q11": "1856",  # Correct
            "L2Q12": "11000",  # Correct
            "L2Q13": "350",  # Correct
            "L2Q14": "8",  # Correct
            "L2Q15": "painter",  # Correct
            "L2Q16": "1527",  # Correct
            "L2Q17": "6",  # Correct
            "L2Q18": "10",  # Wrong (should be 9)
            "L2Q19": "",  # Blank
            "L2Q20": "8",  # Correct
            
            # Part 3 (Flowchart)
            "L3Q21": "Questions",  # Correct
            "L3Q22": "Survey",  # Correct
            "L3Q23": "Pilote",  # Spelling error (should be Pilot)
            "L3Q24": "Collection",  # Correct
            "L3Q25": "Writting",  # Spelling error (should be Writing)
            "L3Q26": "40",  # Correct
            "L3Q27": "150",  # Correct
            "L3Q28": "15",  # Correct
            "L3Q29": "4",  # Wrong (should be 3)
            "L3Q30": "4",  # Correct
            
            # Part 4
            "L4Q31": "1968",  # Correct
            "L4Q32": "0.5",  # Correct
            "L4Q33": "7",  # Correct
            "L4Q34": "20",  # Correct
            "L4Q35": "Seven",  # Correct
            "L4Q36": "events",  # Correct
            "L4Q37": "",  # Blank
            "L4Q38": "Loftis",  # Spelling error (should be Loftus)
            "L4Q39": "massed",  # Correct
            "L4Q40": "sleep",  # Correct
        }
    
    def test_complete_test_with_listening_only(self, sample_listening_answers_mixed):
        """Test /api/full-test/complete with only listening answers"""
        payload = {
            "session_id": "test-session-123",
            "test_id": "academic_set_e_01",
            "all_answers": {
                "listening": sample_listening_answers_mixed
            },
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/full-test/complete",
            json=payload
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["success"] is True
        assert "results" in data
        results = data["results"]
        
        # Check overall structure
        assert "sections" in results
        assert "listening" in results["sections"]
        
    def test_complete_returns_skill_breakdown(self, sample_listening_answers_mixed):
        """Test that skill_breakdown is returned with correct structure"""
        payload = {
            "session_id": "test-session-skill-breakdown",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": sample_listening_answers_mixed},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        results = data["results"]
        
        # skill_breakdown should exist
        assert "skill_breakdown" in results, "Missing skill_breakdown in results"
        skill_breakdown = results["skill_breakdown"]
        
        # Should be a list
        assert isinstance(skill_breakdown, list), "skill_breakdown should be a list"
        
        # Each skill should have required fields
        if len(skill_breakdown) > 0:
            skill = skill_breakdown[0]
            assert "skill_id" in skill
            assert "label" in skill
            assert "correct" in skill
            assert "total" in skill
            # tip is optional but should exist
            assert "tip" in skill or skill.get("tip") is None
    
    def test_complete_returns_fastest_gain(self, sample_listening_answers_mixed):
        """Test that fastest_gain analysis is returned"""
        payload = {
            "session_id": "test-session-fastest-gain",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": sample_listening_answers_mixed},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        
        assert "fastest_gain" in results, "Missing fastest_gain in results"
        fastest_gain = results["fastest_gain"]
        
        # Should be a list (max 3 items)
        assert isinstance(fastest_gain, list)
        assert len(fastest_gain) <= 3, "fastest_gain should have at most 3 items"
        
        # Each item should have required fields
        if len(fastest_gain) > 0:
            item = fastest_gain[0]
            assert "label" in item
            assert "wrong_count" in item
            assert "potential_gain" in item
    
    def test_complete_returns_integrity_warnings(self, sample_listening_answers_mixed):
        """Test that integrity_warnings are returned for unanswered questions"""
        payload = {
            "session_id": "test-session-integrity",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": sample_listening_answers_mixed},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        
        assert "integrity_warnings" in results, "Missing integrity_warnings"
        integrity_warnings = results["integrity_warnings"]
        
        # Should be a list
        assert isinstance(integrity_warnings, list)
        
        # We have blank answers, so we should have at least one warning
        assert len(integrity_warnings) > 0, "Expected integrity warnings for unanswered questions"
        
        # Check structure
        warning = integrity_warnings[0]
        assert "type" in warning
        assert "section" in warning
        assert "message" in warning
    
    def test_complete_returns_reason_summary(self, sample_listening_answers_mixed):
        """Test that reason_summary counts are returned"""
        payload = {
            "session_id": "test-session-reason-summary",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": sample_listening_answers_mixed},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        
        assert "reason_summary" in results, "Missing reason_summary"
        reason_summary = results["reason_summary"]
        
        # Should be a dict with reason codes
        assert isinstance(reason_summary, dict)
        
        # We have blank, wrong, and spelling errors - should have multiple reason types
        # UNANSWERED should exist (we left some blank)
        assert "UNANSWERED" in reason_summary, "Expected UNANSWERED in reason_summary"
        assert reason_summary["UNANSWERED"] >= 4, f"Expected at least 4 UNANSWERED, got {reason_summary.get('UNANSWERED', 0)}"
    
    def test_complete_returns_question_results_with_reason_codes(self, sample_listening_answers_mixed):
        """Test that question_results contains per-question details with reason_code"""
        payload = {
            "session_id": "test-session-qr",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": sample_listening_answers_mixed},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        
        assert "question_results" in results, "Missing question_results"
        question_results = results["question_results"]
        
        # Should have listening section
        assert "listening" in question_results
        listening_results = question_results["listening"]
        
        # Should be a list of per-question details
        assert isinstance(listening_results, list)
        assert len(listening_results) > 0, "Expected question details"
        
        # Check structure of a question result
        q = listening_results[0]
        assert "question_id" in q
        assert "question_type" in q
        assert "user_answer" in q
        assert "correct_answer" in q
        assert "is_correct" in q
        
        # Check for reason_code on wrong answers
        wrong_questions = [q for q in listening_results if not q["is_correct"]]
        if len(wrong_questions) > 0:
            wrong_q = wrong_questions[0]
            assert "reason_code" in wrong_q, "Wrong answer should have reason_code"
            assert wrong_q["reason_code"] is not None
    
    def test_spelling_error_classification(self, sample_listening_answers_mixed):
        """Test that spelling errors are classified correctly"""
        payload = {
            "session_id": "test-session-spelling",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": sample_listening_answers_mixed},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        question_results = results["question_results"]["listening"]
        
        # Find L1Q10 (penicilln vs penicillin)
        l1q10 = next((q for q in question_results if q["question_id"] == "L1Q10"), None)
        if l1q10 and not l1q10["is_correct"]:
            # Should be classified as SPELLING_ERROR
            assert l1q10["reason_code"] == "SPELLING_ERROR", \
                f"Expected SPELLING_ERROR for 'penicilln', got {l1q10.get('reason_code')}"
    
    def test_unanswered_classification(self, sample_listening_answers_mixed):
        """Test that blank answers are classified as UNANSWERED"""
        payload = {
            "session_id": "test-session-unanswered",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": sample_listening_answers_mixed},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        question_results = results["question_results"]["listening"]
        
        # Find L1Q8 (blank answer)
        l1q8 = next((q for q in question_results if q["question_id"] == "L1Q8"), None)
        if l1q8:
            assert l1q8["reason_code"] == "UNANSWERED", \
                f"Expected UNANSWERED for blank answer, got {l1q8.get('reason_code')}"
    
    def test_wrong_answer_classification(self, sample_listening_answers_mixed):
        """Test that wrong answers are classified as WRONG_ANSWER"""
        payload = {
            "session_id": "test-session-wrong",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": sample_listening_answers_mixed},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        question_results = results["question_results"]["listening"]
        
        # Find L1Q6 (9PQ vs 8PQ - wrong answer, not spelling error)
        l1q6 = next((q for q in question_results if q["question_id"] == "L1Q6"), None)
        if l1q6 and not l1q6["is_correct"]:
            # Should be WRONG_ANSWER or NEAR_MISS
            assert l1q6["reason_code"] in ["WRONG_ANSWER", "NEAR_MISS"], \
                f"Expected WRONG_ANSWER/NEAR_MISS, got {l1q6.get('reason_code')}"
    
    def test_question_results_have_explanation(self, sample_listening_answers_mixed):
        """Test that question results include explanation"""
        payload = {
            "session_id": "test-session-explanation",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": sample_listening_answers_mixed},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        question_results = results["question_results"]["listening"]
        
        # Check that at least some questions have explanations
        questions_with_explanation = [q for q in question_results if q.get("explanation")]
        assert len(questions_with_explanation) > 0, "Expected some questions to have explanations"
    
    def test_question_results_have_skill_tip(self, sample_listening_answers_mixed):
        """Test that question results include skill_tip"""
        payload = {
            "session_id": "test-session-skill-tip",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": sample_listening_answers_mixed},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        question_results = results["question_results"]["listening"]
        
        # Check that at least some questions have skill tips
        questions_with_tip = [q for q in question_results if q.get("skill_tip")]
        assert len(questions_with_tip) > 0, "Expected some questions to have skill tips"


class TestFullTestCompleteMissingSections:
    """Test handling of missing sections gracefully"""
    
    def test_no_listening_answers_submitted(self):
        """Test completion with no listening answers"""
        payload = {
            "session_id": "test-session-no-listening",
            "test_id": "academic_set_e_01",
            "all_answers": {},  # Empty
            "section_times": {},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        results = data["results"]
        
        # Should have empty/default results
        assert "sections" in results
        # No listening section should be present or empty
        assert results["sections"].get("listening") is None or results["sections"].get("listening") == {}
    
    def test_empty_answers_dict(self):
        """Test with explicitly empty listening answers"""
        payload = {
            "session_id": "test-session-empty-listening",
            "test_id": "academic_set_e_01",
            "all_answers": {
                "listening": {}  # Empty dict
            },
            "section_times": {"listening": 0},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True


class TestBandScoreCalculation:
    """Test band score calculations"""
    
    def test_perfect_score_band(self):
        """Test band calculation for perfect score"""
        # All correct answers for listening
        perfect_answers = {
            "L1Q1": "Henshaw", "L1Q2": "1987", "L1Q3": "Greenfield", "L1Q4": "47",
            "L1Q5": "Maple", "L1Q6": "8PQ", "L1Q7": "936821", "L1Q8": "headaches",
            "L1Q9": "Thursday", "L1Q10": "penicillin",
            "L2Q11": "1856", "L2Q12": "11000", "L2Q13": "350", "L2Q14": "8",
            "L2Q15": "painter", "L2Q16": "1527", "L2Q17": "6", "L2Q18": "9",
            "L2Q19": "12", "L2Q20": "8",
            "L3Q21": "Questions", "L3Q22": "Survey", "L3Q23": "Pilot", "L3Q24": "Collection",
            "L3Q25": "Writing", "L3Q26": "40", "L3Q27": "150", "L3Q28": "15",
            "L3Q29": "3", "L3Q30": "4",
            "L4Q31": "1968", "L4Q32": "0.5", "L4Q33": "7", "L4Q34": "20",
            "L4Q35": "Seven", "L4Q36": "events", "L4Q37": "habits", "L4Q38": "Loftus",
            "L4Q39": "massed", "L4Q40": "sleep",
        }
        
        payload = {
            "session_id": "test-session-perfect",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": perfect_answers},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        listening = results["sections"]["listening"]
        
        # With 40/40 correct, should be Band 9.0
        assert listening["band"] == 9.0, f"Expected Band 9.0 for 40/40, got {listening['band']}"
        assert listening["correct"] == 40
        assert listening["total"] == 40
        assert listening["percentage"] == 100.0
    
    def test_partial_score_band(self):
        """Test band calculation for partial score (~60% = Band 6-7 based on IELTS scale)"""
        # ~24/40 correct = 60% = Band 6.0-7.0 depending on exact scale
        partial_answers = {}
        # Fill first 24 with correct answers
        correct_map = {
            "L1Q1": "Henshaw", "L1Q2": "1987", "L1Q3": "Greenfield", "L1Q4": "47",
            "L1Q5": "Maple", "L1Q6": "8PQ", "L1Q7": "936821", "L1Q8": "headaches",
            "L1Q9": "Thursday", "L1Q10": "penicillin",
            "L2Q11": "1856", "L2Q12": "11000", "L2Q13": "350", "L2Q14": "8",
            "L2Q15": "painter", "L2Q16": "1527", "L2Q17": "6", "L2Q18": "9",
            "L2Q19": "12", "L2Q20": "8",
            "L3Q21": "Questions", "L3Q22": "Survey", "L3Q23": "Pilot", "L3Q24": "Collection",
        }
        
        for qid, ans in correct_map.items():
            partial_answers[qid] = ans
        
        # Leave rest blank
        for i in range(25, 41):
            partial_answers[f"L3Q{i}"] = "" if i <= 30 else ""
            partial_answers[f"L4Q{i}"] = ""
        
        payload = {
            "session_id": "test-session-partial",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": partial_answers},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        listening = results["sections"]["listening"]
        
        # 24/40 = 60% maps to Band 6.0 in this system
        assert listening["band"] >= 6.0, f"Expected Band >= 6.0 for 60%, got {listening['band']}"
        assert listening["band"] <= 7.0, f"Expected Band <= 7.0 for 60%, got {listening['band']}"
        assert listening["correct"] == 24, f"Expected 24 correct, got {listening['correct']}"


class TestTeacherFeedback:
    """Test AI teacher feedback generation"""
    
    def test_teacher_feedback_returned(self):
        """Test that teacher_feedback is returned (may be None if LLM key not set)"""
        answers = {
            "L1Q1": "Henshaw", "L1Q2": "1987", "L1Q3": "wrong", "L1Q4": "47",
            "L1Q5": "", "L1Q6": "8PQ", "L1Q7": "936821", "L1Q8": "",
            "L1Q9": "Thursday", "L1Q10": "penicillin",
        }
        
        payload = {
            "session_id": "test-session-teacher",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": answers},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        
        # teacher_feedback should exist (may be None if LLM not configured)
        assert "teacher_feedback" in results
        
        # If configured, should have short and detailed fields
        if results["teacher_feedback"] is not None:
            tf = results["teacher_feedback"]
            assert "short" in tf or "detailed" in tf, "Teacher feedback should have short/detailed"


class TestRecommendedLessons:
    """Test recommended lessons generation"""
    
    def test_recommended_lessons_returned(self):
        """Test that recommended_lessons is returned"""
        answers = {
            "L1Q1": "wrong", "L1Q2": "wrong", "L1Q3": "wrong", "L1Q4": "wrong",
            "L1Q5": "wrong", "L1Q6": "wrong", "L1Q7": "wrong", "L1Q8": "wrong",
        }
        
        payload = {
            "session_id": "test-session-lessons",
            "test_id": "academic_set_e_01",
            "all_answers": {"listening": answers},
            "section_times": {"listening": 2400},
            "mode": "full"
        }
        
        response = requests.post(f"{BASE_URL}/api/full-test/complete", json=payload)
        assert response.status_code == 200
        
        results = response.json()["results"]
        
        assert "recommended_lessons" in results, "Missing recommended_lessons"
        recommended = results["recommended_lessons"]
        
        # Should be a list
        assert isinstance(recommended, list)
        
        # With many wrong answers, should have some recommendations
        if len(recommended) > 0:
            lesson = recommended[0]
            assert "title" in lesson or "lesson_id" in lesson


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
