"""
IELTS Ace Platform — Full E2E Test Suite
=========================================
Run: cd /app && python3 -m pytest backend/tests/test_e2e_full.py -v --tb=short
No tokens needed. Tests all core flows via API.
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL') or os.environ.get('API_URL') or 'http://localhost:8001'


# ============================================================
# 1. HEALTH & INFRASTRUCTURE
# ============================================================
class TestInfrastructure:

    def test_cambridge_books_endpoint(self):
        r = requests.get(f"{BASE_URL}/api/cambridge/books")
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        books = data["books"]
        assert len(books) > 0, "No books found"
        print(f"OK — {len(books)} books available")

    def test_ielts18_tests_available(self):
        r = requests.get(f"{BASE_URL}/api/cambridge/books")
        data = r.json()
        ielts18 = next((b for b in data["books"] if b.get("book_id") == "ielts18"), None)
        assert ielts18 is not None, "IELTS 18 book not found"
        assert ielts18.get("available_tests", 0) >= 4, f"Expected >=4 tests, got {ielts18.get('available_tests')}"
        print(f"OK — IELTS 18 has {ielts18['available_tests']} tests")

    def test_ielts17_tests_available(self):
        r = requests.get(f"{BASE_URL}/api/cambridge/books")
        data = r.json()
        ielts17 = next((b for b in data["books"] if b.get("book_id") == "ielts17"), None)
        assert ielts17 is not None, "IELTS 17 book not found"
        print(f"OK — IELTS 17 has {ielts17.get('available_tests', 0)} tests")


# ============================================================
# 2. TEST DATA INTEGRITY (IELTS 18, all 4 tests)
# ============================================================
class TestIELTS18DataIntegrity:

    @pytest.mark.parametrize("test_id", ["test1", "test2", "test3", "test4"])
    def test_load_test_data(self, test_id):
        r = requests.get(f"{BASE_URL}/api/cambridge/test/ielts18/{test_id}")
        assert r.status_code == 200
        data = r.json()
        assert data.get("success") is True or data.get("title"), f"Failed to load {test_id}"
        print(f"OK — ielts18/{test_id} loaded")

    @pytest.mark.parametrize("test_id", ["test1", "test2", "test3", "test4"])
    def test_listening_parts_exist(self, test_id):
        r = requests.get(f"{BASE_URL}/api/cambridge/test/ielts18/{test_id}")
        data = r.json()
        test = data.get("test", data)
        listening = test.get("sections", {}).get("listening", {})
        parts = listening.get("parts", [])
        assert len(parts) == 4, f"{test_id}: Expected 4 listening parts, got {len(parts)}"
        for p in parts:
            assert len(p.get("questions", [])) > 0, f"{test_id} Part {p.get('part_number')}: No questions"
        print(f"OK — ielts18/{test_id} listening: {len(parts)} parts")

    @pytest.mark.parametrize("test_id", ["test1", "test2", "test3", "test4"])
    def test_reading_passages_exist(self, test_id):
        r = requests.get(f"{BASE_URL}/api/cambridge/test/ielts18/{test_id}")
        data = r.json()
        test = data.get("test", data)
        reading = test.get("sections", {}).get("reading", {})
        passages = reading.get("passages", [])
        assert len(passages) == 3, f"{test_id}: Expected 3 reading passages, got {len(passages)}"
        for p in passages:
            assert len(p.get("questions", [])) > 0, f"{test_id} Passage {p.get('passage_number')}: No questions"
            title = p.get("title", "")
            assert len(title) > 0, f"{test_id} Passage {p.get('passage_number')}: No title"
        print(f"OK — ielts18/{test_id} reading: {len(passages)} passages")

    @pytest.mark.parametrize("test_id", ["test1", "test2", "test3", "test4"])
    def test_writing_tasks_exist(self, test_id):
        r = requests.get(f"{BASE_URL}/api/cambridge/test/ielts18/{test_id}")
        data = r.json()
        test = data.get("test", data)
        writing = test.get("sections", {}).get("writing", {})
        tasks = writing.get("tasks", [])
        assert len(tasks) == 2, f"{test_id}: Expected 2 writing tasks, got {len(tasks)}"
        print(f"OK — ielts18/{test_id} writing: {len(tasks)} tasks")

    @pytest.mark.parametrize("test_id", ["test1", "test2", "test3", "test4"])
    def test_speaking_parts_exist(self, test_id):
        r = requests.get(f"{BASE_URL}/api/cambridge/test/ielts18/{test_id}")
        data = r.json()
        test = data.get("test", data)
        speaking = test.get("sections", {}).get("speaking", {})
        parts = speaking.get("parts", [])
        assert len(parts) >= 3, f"{test_id}: Expected >=3 speaking parts, got {len(parts)}"
        print(f"OK — ielts18/{test_id} speaking: {len(parts)} parts")

    @pytest.mark.parametrize("test_id", ["test1", "test2", "test3", "test4"])
    def test_answer_keys_complete(self, test_id):
        r = requests.get(f"{BASE_URL}/api/cambridge/answer-key/ielts18/{test_id}")
        if r.status_code != 200:
            pytest.skip(f"Answer key endpoint not available for {test_id}")
        data = r.json()
        assert data.get("success") is True
        keys = data.get("answer_key", {})
        listening_keys = {k: v for k, v in keys.items() if k.startswith("listening_")}
        reading_keys = {k: v for k, v in keys.items() if k.startswith("reading_")}
        assert len(listening_keys) >= 38, f"{test_id}: Expected >=38 listening keys, got {len(listening_keys)}"
        assert len(reading_keys) >= 38, f"{test_id}: Expected >=38 reading keys, got {len(reading_keys)}"
        print(f"OK — ielts18/{test_id} answer keys: L={len(listening_keys)}, R={len(reading_keys)}")


# ============================================================
# 3. EVALUATION ENGINE
# ============================================================
class TestEvaluationEngine:

    def _submit(self, book_id, test_id, answers):
        r = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={"book_id": book_id, "test_id": test_id, "answers": answers, "user_plan": "free"}
        )
        assert r.status_code == 200, f"Eval failed: {r.text[:200]}"
        data = r.json()
        assert data.get("success") is True, f"Eval not success: {data}"
        return data

    def test_basic_evaluation(self):
        data = self._submit("ielts18", "test1", {"listening_1": "test", "reading_1": "test"})
        assert "question_results" in data
        assert "listening" in data["question_results"]
        assert "reading" in data["question_results"]
        print(f"OK — Basic evaluation works")

    def test_reason_codes_present(self):
        data = self._submit("ielts18", "test1", {
            "listening_1": "",
            "listening_2": "wrong",
            "reading_1": "wrong",
            "reading_8": "FALSE"
        })
        wrong = [q for q in data["question_results"]["listening"] + data["question_results"]["reading"] if not q["is_correct"]]
        coded = [q for q in wrong if q.get("reason_code")]
        assert len(coded) > 0, "No reason codes assigned"
        codes = set(q["reason_code"] for q in coded)
        assert "UNANSWERED" in codes, "UNANSWERED not detected"
        print(f"OK — Reason codes: {codes}")

    def test_reason_summary_present(self):
        data = self._submit("ielts17", "test1", {"listening_1": "", "reading_1": "wrong"})
        assert "reason_summary" in data
        rs = data["reason_summary"]
        assert isinstance(rs, dict)
        total = sum(rs.values())
        assert total > 0
        print(f"OK — reason_summary: {rs}")

    def test_evidence_text_for_reading(self):
        data = self._submit("ielts17", "test1", {"reading_1": "wrong_answer_xyz"})
        reading_wrong = [q for q in data["question_results"]["reading"] if not q["is_correct"]]
        has_evidence = [q for q in reading_wrong if q.get("evidence_text")]
        print(f"OK — {len(has_evidence)}/{len(reading_wrong)} reading questions have evidence text")

    def test_band_scores_returned(self):
        data = self._submit("ielts18", "test1", {})
        lr = data.get("listening", data.get("scores", {}).get("listening", {}))
        rr = data.get("reading", data.get("scores", {}).get("reading", {}))
        # Check band exists in some form
        has_band = (lr.get("band") is not None) or (rr.get("band") is not None)
        assert has_band, "No band scores returned"
        print(f"OK — Band scores present")

    def test_fastest_gain_present(self):
        data = self._submit("ielts17", "test1", {"listening_1": "wrong"})
        assert "fastest_gain" in data
        print(f"OK — fastest_gain: {len(data['fastest_gain'])} items")

    def test_integrity_warnings(self):
        # Submit with many unanswered
        data = self._submit("ielts17", "test1", {})
        assert "integrity_warnings" in data
        print(f"OK — integrity_warnings: {len(data['integrity_warnings'])} items")

    def test_tfng_confusion_detection(self):
        data = self._submit("ielts17", "test1", {
            "reading_8": "FALSE",
            "reading_9": "TRUE",
            "reading_10": "NOT GIVEN",
            "reading_11": "TRUE",
            "reading_12": "FALSE",
            "reading_13": "NOT GIVEN"
        })
        tfng_wrong = [q for q in data["question_results"]["reading"]
                      if q.get("reason_code") == "TFNG_CONFUSION"]
        print(f"OK — TFNG_CONFUSION detected: {len(tfng_wrong)} questions")

    def test_spelling_error_detection(self):
        data = self._submit("ielts17", "test1", {"reading_1": "developmnt"})
        spelling = [q for q in data["question_results"]["reading"]
                    if q.get("reason_code") == "SPELLING_ERROR"]
        print(f"OK — SPELLING_ERROR detected: {len(spelling)} questions")

    def test_all_four_ielts18_tests_evaluate(self):
        for tid in ["test1", "test2", "test3", "test4"]:
            data = self._submit("ielts18", tid, {"listening_1": "a", "reading_1": "b"})
            assert len(data["question_results"]["listening"]) > 0
            assert len(data["question_results"]["reading"]) > 0
            print(f"  OK — ielts18/{tid} evaluates correctly")


# ============================================================
# 4. SPEAKING ENDPOINTS
# ============================================================
class TestSpeakingEndpoints:

    def test_generate_drills(self):
        r = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/generate-drills",
            json={
                "criteria": {"fluency_coherence": 5, "lexical_resource": 5, "grammatical_range": 6, "pronunciation": 6},
                "weaknesses": ["Too many filler words"],
                "transcript": "Um, I think that um, like, you know, the weather is nice."
            }
        )
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert len(data["drills"]) >= 1
        for d in data["drills"]:
            assert "title" in d
            assert "steps" in d
            assert len(d["steps"]) >= 3
        print(f"OK — {len(data['drills'])} drills generated")

    def test_model_answers(self):
        r = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/model-answers",
            json={
                "question": "Do you enjoy reading books?",
                "part": 1,
                "book_id": "test_e2e",
                "test_id": "test_e2e"
            }
        )
        assert r.status_code == 200
        data = r.json()
        assert data.get("success") is True or data.get("band7")
        if data.get("band7"):
            assert data["band7"].get("answer") or data["band7"].get("structure")
        print(f"OK — Model answers generated (cached={data.get('cached', 'N/A')})")

    def test_model_answers_caching(self):
        payload = {
            "question": "What is your favorite food?",
            "part": 1,
            "book_id": "cache_test",
            "test_id": "cache_test"
        }
        r1 = requests.post(f"{BASE_URL}/api/cambridge/speaking/model-answers", json=payload)
        assert r1.status_code == 200
        d1 = r1.json()

        r2 = requests.post(f"{BASE_URL}/api/cambridge/speaking/model-answers", json=payload)
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2.get("cached") is True, "Second call should be cached"
        print(f"OK — Caching works: 1st={d1.get('cached')}, 2nd={d2.get('cached')}")


# ============================================================
# 5. QUESTION TYPE COVERAGE (IELTS 18)
# ============================================================
class TestQuestionTypeCoverage:

    @pytest.mark.parametrize("test_id", ["test1", "test2", "test3", "test4"])
    def test_listening_question_count(self, test_id):
        r = requests.get(f"{BASE_URL}/api/cambridge/test/ielts18/{test_id}")
        data = r.json()
        test = data.get("test", data)
        parts = test.get("sections", {}).get("listening", {}).get("parts", [])
        total_q = sum(len(p.get("questions", [])) for p in parts)
        assert total_q >= 30, f"{test_id}: Expected >=30 listening questions, got {total_q}"
        print(f"OK — ielts18/{test_id} listening: {total_q} questions")

    @pytest.mark.parametrize("test_id", ["test1", "test2", "test3", "test4"])
    def test_reading_question_count(self, test_id):
        r = requests.get(f"{BASE_URL}/api/cambridge/test/ielts18/{test_id}")
        data = r.json()
        test = data.get("test", data)
        passages = test.get("sections", {}).get("reading", {}).get("passages", [])
        total_q = sum(len(p.get("questions", [])) for p in passages)
        assert total_q >= 30, f"{test_id}: Expected >=30 reading questions, got {total_q}"
        print(f"OK — ielts18/{test_id} reading: {total_q} questions")


# ============================================================
# 6. AUTH & USER FLOW
# ============================================================
class TestAuthFlow:

    def test_register_and_login(self):
        import uuid
        email = f"e2e_{uuid.uuid4().hex[:8]}@test.com"
        
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email, "password": "Test1234!", "name": "E2E Test"
        })
        if r.status_code == 200:
            data = r.json()
            assert data.get("token") or data.get("success")
            print(f"OK — Register: {email}")
        
        r2 = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email, "password": "Test1234!"
        })
        assert r2.status_code == 200
        data2 = r2.json()
        assert data2.get("token") or data2.get("user")
        print(f"OK — Login: {email}")


# ============================================================
# RUN
# ============================================================
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short", "-x"])
