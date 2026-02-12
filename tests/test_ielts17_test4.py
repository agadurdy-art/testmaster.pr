"""
Test Suite for Cambridge IELTS 17 Test 4
Tests all API endpoints and validates test content structure
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://interactive-lessons-6.preview.emergentagent.com')

class TestIELTS17Test4API:
    """Test Cambridge IELTS 17 Test 4 API endpoints"""
    
    def test_get_test4_endpoint(self):
        """Test GET /api/cambridge/test/ielts17/test4 returns test data"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test4")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "test" in data
        assert data["test"]["test_id"] == "ielts17_test4"
        assert data["test"]["test_number"] == 4
        assert data["test"]["book"] == "Cambridge IELTS 17"
    
    def test_get_test4_answers_endpoint(self):
        """Test GET /api/cambridge/answers/ielts17/test4 returns 80 answers (40 listening + 40 reading)"""
        response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test4")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "answers" in data
        
        # Verify listening answers (40)
        listening_answers = data["answers"]["listening"]
        assert len(listening_answers) == 40, f"Expected 40 listening answers, got {len(listening_answers)}"
        
        # Verify reading answers (40)
        reading_answers = data["answers"]["reading"]
        assert len(reading_answers) == 40, f"Expected 40 reading answers, got {len(reading_answers)}"
    
    def test_debug_endpoint_valid_status(self):
        """Test GET /api/admin/tests/debug/ielts17_test4 returns VALID status"""
        response = requests.get(f"{BASE_URL}/api/admin/tests/debug/ielts17_test4")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "VALID"
        assert data["test_id"] == "ielts17_test4"
        assert len(data.get("issues", [])) == 0, f"Test has issues: {data.get('issues')}"


class TestIELTS17Test4Listening:
    """Test Listening section structure and content"""
    
    @pytest.fixture
    def test_data(self):
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test4")
        return response.json()["test"]
    
    def test_listening_has_4_parts(self, test_data):
        """Listening section should have 4 parts"""
        listening = test_data["sections"]["listening"]
        assert listening["total_questions"] == 40
        assert len(listening["parts"]) == 4
    
    def test_listening_part1_structure(self, test_data):
        """Part 1: Easy Life Cleaning Services - note completion"""
        part1 = test_data["sections"]["listening"]["parts"][0]
        assert part1["part_number"] == 1
        assert part1["title"] == "Easy Life Cleaning Services"
        assert part1["question_range"] == "1-10"
        assert part1["question_count"] == 10
        assert "note_completion" in part1["question_types"]
        assert part1["audio_file"] == "/api/audio/cambridge/ielts17/test4_part1.mp3"
    
    def test_listening_part2_structure(self, test_data):
        """Part 2: Hotel Staff Turnover - multiple choice and matching"""
        part2 = test_data["sections"]["listening"]["parts"][1]
        assert part2["part_number"] == 2
        assert part2["title"] == "Hotel Staff Turnover"
        assert part2["question_range"] == "11-20"
        assert part2["question_count"] == 10
        assert part2["audio_file"] == "/api/audio/cambridge/ielts17/test4_part2.mp3"
    
    def test_listening_part3_structure(self, test_data):
        """Part 3: Sporting Activities Discussion - multiple selection and matching"""
        part3 = test_data["sections"]["listening"]["parts"][2]
        assert part3["part_number"] == 3
        assert part3["title"] == "Sporting Activities Discussion"
        assert part3["question_range"] == "21-30"
        assert part3["question_count"] == 10
        assert part3["audio_file"] == "/api/audio/cambridge/ielts17/test4_part3.mp3"
    
    def test_listening_part4_structure(self, test_data):
        """Part 4: Maple Syrup - note completion"""
        part4 = test_data["sections"]["listening"]["parts"][3]
        assert part4["part_number"] == 4
        assert part4["title"] == "Maple Syrup"
        assert part4["question_range"] == "31-40"
        assert part4["question_count"] == 10
        assert "note_completion" in part4["question_types"]
        assert part4["audio_file"] == "/api/audio/cambridge/ielts17/test4_part4.mp3"
    
    def test_audio_files_accessible(self):
        """All 4 audio files should be accessible"""
        for part in range(1, 5):
            response = requests.head(f"{BASE_URL}/api/audio/cambridge/ielts17/test4_part{part}.mp3")
            # Accept 200 or 405 (method not allowed but file exists)
            assert response.status_code in [200, 405, 302], f"Audio file test4_part{part}.mp3 not accessible"


class TestIELTS17Test4Reading:
    """Test Reading section structure and content"""
    
    @pytest.fixture
    def test_data(self):
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test4")
        return response.json()["test"]
    
    def test_reading_has_3_passages(self, test_data):
        """Reading section should have 3 passages"""
        reading = test_data["sections"]["reading"]
        assert reading["total_questions"] == 40
        assert len(reading["passages"]) == 3
    
    def test_passage1_bats_to_rescue(self, test_data):
        """Passage 1: Bats to the rescue - should have passage_text > 500 chars"""
        passage1 = test_data["sections"]["reading"]["passages"][0]
        assert passage1["passage_number"] == 1
        assert passage1["title"] == "Bats to the rescue"
        assert passage1["question_range"] == "1-13"
        assert passage1["question_count"] == 13
        assert "passage_text" in passage1
        assert len(passage1["passage_text"]) > 500, "Passage 1 text should be > 500 characters"
    
    def test_passage2_education_economic_growth(self, test_data):
        """Passage 2: Does education fuel economic growth? - should have passage_text > 500 chars"""
        passage2 = test_data["sections"]["reading"]["passages"][1]
        assert passage2["passage_number"] == 2
        assert passage2["title"] == "Does education fuel economic growth?"
        assert passage2["question_range"] == "14-26"
        assert passage2["question_count"] == 13
        assert "passage_text" in passage2
        assert len(passage2["passage_text"]) > 500, "Passage 2 text should be > 500 characters"
    
    def test_passage3_timur_gareyev(self, test_data):
        """Passage 3: Timur Gareyev – blindfold chess champion - should have passage_text > 500 chars"""
        passage3 = test_data["sections"]["reading"]["passages"][2]
        assert passage3["passage_number"] == 3
        assert passage3["title"] == "Timur Gareyev – blindfold chess champion"
        assert passage3["question_range"] == "27-40"
        assert passage3["question_count"] == 14
        assert "passage_text" in passage3
        assert len(passage3["passage_text"]) > 500, "Passage 3 text should be > 500 characters"


class TestIELTS17Test4Writing:
    """Test Writing section structure and content"""
    
    @pytest.fixture
    def test_data(self):
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test4")
        return response.json()["test"]
    
    def test_writing_has_2_tasks(self, test_data):
        """Writing section should have 2 tasks"""
        writing = test_data["sections"]["writing"]
        assert writing["total_tasks"] == 2
        assert len(writing["tasks"]) == 2
    
    def test_task1_line_graph(self, test_data):
        """Task 1: Line graph about shop closures and openings"""
        task1 = test_data["sections"]["writing"]["tasks"][0]
        assert task1["task_number"] == 1
        assert task1["task_type"] == "line_graph"
        assert task1["minimum_words"] == 150
        assert "prompt" in task1
        assert "visual" in task1
        assert task1["visual"]["type"] == "line_graph"
        # Check image URL
        assert "image_url" in task1["visual"]
        assert "test4_writing_task1.png" in task1["visual"]["image_url"]
    
    def test_task2_opinion_essay(self, test_data):
        """Task 2: Opinion essay about alternative medicines"""
        task2 = test_data["sections"]["writing"]["tasks"][1]
        assert task2["task_number"] == 2
        assert task2["task_type"] == "opinion_essay"
        assert task2["minimum_words"] == 250
        assert "prompt" in task2
        assert "alternative medicine" in task2["prompt"].lower() or "health" in task2["prompt"].lower()
    
    def test_writing_task1_image_accessible(self):
        """Writing Task 1 image should be accessible"""
        response = requests.get(f"{BASE_URL}/api/cambridge/images/ielts17/test4/test4_writing_task1.png")
        assert response.status_code == 200
        assert "image" in response.headers.get("content-type", "")


class TestIELTS17Test4Speaking:
    """Test Speaking section structure and content"""
    
    @pytest.fixture
    def test_data(self):
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test4")
        return response.json()["test"]
    
    def test_speaking_has_3_parts(self, test_data):
        """Speaking section should have 3 parts"""
        speaking = test_data["sections"]["speaking"]
        assert speaking["total_parts"] == 3
        assert len(speaking["parts"]) == 3
    
    def test_part1_maps_topic(self, test_data):
        """Part 1: Introduction and Interview - Topic: Maps"""
        part1 = test_data["sections"]["speaking"]["parts"][0]
        assert part1["part_number"] == 1
        assert part1["title"] == "Introduction and Interview"
        assert part1["topic"] == "Maps"
        assert "questions" in part1
        assert len(part1["questions"]) >= 4
    
    def test_part2_has_task_card(self, test_data):
        """Part 2: Individual Long Turn - should have task_card"""
        part2 = test_data["sections"]["speaking"]["parts"][1]
        assert part2["part_number"] == 2
        assert part2["title"] == "Individual Long Turn"
        assert "task_card" in part2
        assert "instruction" in part2["task_card"]
        assert "bullets" in part2["task_card"]
        # Check task card content
        assert "hurry" in part2["task_card"]["instruction"].lower()
    
    def test_part3_discussion_topics(self, test_data):
        """Part 3: Two-way Discussion - Topics: Arriving late, Managing study time"""
        part3 = test_data["sections"]["speaking"]["parts"][2]
        assert part3["part_number"] == 3
        assert part3["title"] == "Two-way Discussion"
        assert "topics" in part3
        assert len(part3["topics"]) >= 2
        
        topic_names = [t["topic"] for t in part3["topics"]]
        assert "Arriving late" in topic_names
        assert "Managing study time" in topic_names


class TestIELTS17Test4AnswerKeys:
    """Test answer keys are complete and correct format"""
    
    def test_listening_answers_format(self):
        """Listening answers should be in correct format"""
        response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test4")
        data = response.json()
        
        listening = data["answers"]["listening"]
        
        # Check specific answers
        assert listening["1"] == "floors"
        assert listening["10"] == "report"
        assert listening["31"] == "golden"
        assert listening["40"] == "litre"
    
    def test_reading_answers_format(self):
        """Reading answers should be in correct format"""
        response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test4")
        data = response.json()
        
        reading = data["answers"]["reading"]
        
        # Check specific answers
        assert reading["1"] == "FALSE"
        assert reading["7"] == "droppings"
        assert reading["14"] == "E"
        assert reading["40"] == "board"


class TestIELTS17Test4InBookList:
    """Test that Test 4 appears correctly in book listing"""
    
    def test_test4_in_ielts17_book(self):
        """Test 4 should appear in IELTS 17 book listing"""
        response = requests.get(f"{BASE_URL}/api/cambridge/books/ielts17")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        tests = data["book"]["tests"]
        test4 = next((t for t in tests if t["test_number"] == 4), None)
        
        assert test4 is not None, "Test 4 not found in IELTS 17 book"
        assert test4["available"] == True
        assert test4["test_id"] == "ielts17_test4"
        assert "listening" in test4["sections"]
        assert "reading" in test4["sections"]
        assert "writing" in test4["sections"]
        assert "speaking" in test4["sections"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
