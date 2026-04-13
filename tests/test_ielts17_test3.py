"""
Backend API tests for Cambridge IELTS 17 Test 3
Tests all 4 skills: Listening, Reading, Writing, Speaking
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestIELTS17Test3API:
    """Test Cambridge IELTS 17 Test 3 API endpoints"""
    
    def test_test3_appears_in_book_list(self):
        """Test 3 should appear in the IELTS 17 book test list"""
        response = requests.get(f"{BASE_URL}/api/cambridge/books/ielts17")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        tests = data["book"]["tests"]
        test3 = next((t for t in tests if t["test_id"] == "ielts17_test3"), None)
        
        assert test3 is not None, "Test 3 not found in book list"
        assert test3["test_number"] == 3
        assert test3["available"] == True
        assert "listening" in test3["sections"]
        assert "reading" in test3["sections"]
        assert "writing" in test3["sections"]
        assert "speaking" in test3["sections"]
        print("✓ Test 3 appears in IELTS 17 book list with all 4 sections")
    
    def test_get_full_test3_content(self):
        """Get full Test 3 content"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        test = data["test"]
        assert test["test_id"] == "ielts17_test3"
        assert test["test_number"] == 3
        assert test["title"] == "IELTS 17 - Test 3"
        
        sections = test["sections"]
        assert "listening" in sections
        assert "reading" in sections
        assert "writing" in sections
        assert "speaking" in sections
        print("✓ Full Test 3 content retrieved with all sections")


class TestListeningSection:
    """Test Listening section: 4 parts, 40 questions"""
    
    def test_listening_structure(self):
        """Listening should have 4 parts with 40 total questions"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/listening")
        assert response.status_code == 200
        
        data = response.json()
        listening = data["data"]
        
        assert listening["total_questions"] == 40
        assert len(listening["parts"]) == 4
        print("✓ Listening has 4 parts with 40 questions")
    
    def test_listening_part1(self):
        """Part 1: Advice on surfing holidays (Q1-10)"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/listening")
        data = response.json()
        part1 = data["data"]["parts"][0]
        
        assert part1["part_number"] == 1
        assert part1["title"] == "Advice on surfing holidays"
        assert part1["question_range"] == "1-10"
        assert part1["question_count"] == 10
        assert part1["audio_file"] == "/api/audio/cambridge/ielts17/test3_part1.mp3"
        assert "note_completion" in part1["question_types"]
        print("✓ Part 1: Advice on surfing holidays (Q1-10) - correct")
    
    def test_listening_part2(self):
        """Part 2: Extended hours childcare service (Q11-20)"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/listening")
        data = response.json()
        part2 = data["data"]["parts"][1]
        
        assert part2["part_number"] == 2
        assert part2["title"] == "Extended hours childcare service"
        assert part2["question_range"] == "11-20"
        assert part2["question_count"] == 10
        assert part2["audio_file"] == "/api/audio/cambridge/ielts17/test3_part2.mp3"
        print("✓ Part 2: Extended hours childcare service (Q11-20) - correct")
    
    def test_listening_part3(self):
        """Part 3: Holly's Work Placement Tutorial (Q21-30)"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/listening")
        data = response.json()
        part3 = data["data"]["parts"][2]
        
        assert part3["part_number"] == 3
        assert part3["title"] == "Holly's Work Placement Tutorial"
        assert part3["question_range"] == "21-30"
        assert part3["question_count"] == 10
        assert part3["audio_file"] == "/api/audio/cambridge/ielts17/test3_part3.mp3"
        print("✓ Part 3: Holly's Work Placement Tutorial (Q21-30) - correct")
    
    def test_listening_part4(self):
        """Part 4: Bird Migration Theory (Q31-40)"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/listening")
        data = response.json()
        part4 = data["data"]["parts"][3]
        
        assert part4["part_number"] == 4
        assert part4["title"] == "Bird Migration Theory"
        assert part4["question_range"] == "31-40"
        assert part4["question_count"] == 10
        assert part4["audio_file"] == "/api/audio/cambridge/ielts17/test3_part4.mp3"
        print("✓ Part 4: Bird Migration Theory (Q31-40) - correct")


class TestReadingSection:
    """Test Reading section: 3 passages, 40 questions"""
    
    def test_reading_structure(self):
        """Reading should have 3 passages with 40 total questions"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/reading")
        assert response.status_code == 200
        
        data = response.json()
        reading = data["data"]
        
        assert reading["total_questions"] == 40
        assert len(reading["passages"]) == 3
        print("✓ Reading has 3 passages with 40 questions")
    
    def test_reading_passage1_thylacine(self):
        """Passage 1: The thylacine (Q1-13)"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/reading")
        data = response.json()
        passage1 = data["data"]["passages"][0]
        
        assert passage1["passage_number"] == 1
        assert passage1["title"] == "The thylacine"
        assert passage1["question_range"] == "1-13"
        assert passage1["question_count"] == 13
        assert "text" in passage1 or "passage_text" in passage1
        print("✓ Passage 1: The thylacine (Q1-13) - correct")
    
    def test_reading_passage2_palm_oil(self):
        """Passage 2: Palm oil (Q14-26)"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/reading")
        data = response.json()
        passage2 = data["data"]["passages"][1]
        
        assert passage2["passage_number"] == 2
        assert passage2["title"] == "Palm oil"
        assert passage2["question_range"] == "14-26"
        assert passage2["question_count"] == 13
        print("✓ Passage 2: Palm oil (Q14-26) - correct")
    
    def test_reading_passage3_building_skyline(self):
        """Passage 3: Building the Skyline (Q27-40)"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/reading")
        data = response.json()
        passage3 = data["data"]["passages"][2]
        
        assert passage3["passage_number"] == 3
        assert "Building the Skyline" in passage3["title"]
        assert passage3["question_range"] == "27-40"
        assert passage3["question_count"] == 14
        print("✓ Passage 3: Building the Skyline (Q27-40) - correct")


class TestWritingSection:
    """Test Writing section: 2 tasks, Task 1 has bar chart"""
    
    def test_writing_structure(self):
        """Writing should have 2 tasks"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/writing")
        assert response.status_code == 200
        
        data = response.json()
        writing = data["data"]
        
        assert writing["total_tasks"] == 2
        assert len(writing["tasks"]) == 2
        print("✓ Writing has 2 tasks")
    
    def test_writing_task1_bar_chart(self):
        """Task 1 should have bar chart comparing 1968 vs 2018 spending"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/writing")
        data = response.json()
        task1 = data["data"]["tasks"][0]
        
        assert task1["task_number"] == 1
        assert task1["task_type"] == "bar_chart"
        assert task1["minimum_words"] == 150
        
        # Check visual/chart data
        visual = task1.get("visual", {})
        assert visual["type"] == "bar_chart"
        assert "1968" in visual.get("title", "") or "2018" in visual.get("title", "")
        assert visual.get("image_url") == "/api/cambridge/images/ielts17/test3/test3_writing_task1.png"
        
        # Check chart data
        chart_data = visual.get("data", {})
        assert "1968" in chart_data
        assert "2018" in chart_data
        assert len(chart_data.get("categories", [])) == 8
        print("✓ Task 1: Bar chart comparing family spending 1968 vs 2018 - correct")
    
    def test_writing_task1_image_accessible(self):
        """Task 1 bar chart image should be accessible"""
        response = requests.get(f"{BASE_URL}/api/cambridge/images/ielts17/test3/test3_writing_task1.png")
        assert response.status_code == 200
        assert "image" in response.headers.get("content-type", "")
        print("✓ Task 1 bar chart image is accessible")
    
    def test_writing_task2(self):
        """Task 2 should be a discussion essay"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/writing")
        data = response.json()
        task2 = data["data"]["tasks"][1]
        
        assert task2["task_number"] == 2
        assert task2["minimum_words"] == 250
        assert "prompt" in task2
        assert "professionals" in task2["prompt"].lower() or "doctors" in task2["prompt"].lower()
        print("✓ Task 2: Discussion essay about professionals working abroad - correct")


class TestSpeakingSection:
    """Test Speaking section: 3 parts with correct topics"""
    
    def test_speaking_structure(self):
        """Speaking should have 3 parts"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/speaking")
        assert response.status_code == 200
        
        data = response.json()
        speaking = data["data"]
        
        assert speaking["total_parts"] == 3
        assert len(speaking["parts"]) == 3
        print("✓ Speaking has 3 parts")
    
    def test_speaking_part1_drinks(self):
        """Part 1: Topic should be Drinks"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/speaking")
        data = response.json()
        part1 = data["data"]["parts"][0]
        
        assert part1["part_number"] == 1
        assert part1["title"] == "Introduction and Interview"
        assert part1["topic"] == "Drinks"
        assert len(part1.get("questions", [])) >= 3
        print("✓ Part 1: Topic is Drinks - correct")
    
    def test_speaking_part2_monument(self):
        """Part 2: Cue card about a monument"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/speaking")
        data = response.json()
        part2 = data["data"]["parts"][1]
        
        assert part2["part_number"] == 2
        assert part2["title"] == "Individual Long Turn"
        
        cue_card = part2.get("cue_card", {})
        assert "monument" in cue_card.get("topic", "").lower()
        assert len(cue_card.get("points", [])) >= 3
        print("✓ Part 2: Cue card about a monument - correct")
    
    def test_speaking_part3_public_monuments_architecture(self):
        """Part 3: Topics should be Public monuments and Architecture"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test3/section/speaking")
        data = response.json()
        part3 = data["data"]["parts"][2]
        
        assert part3["part_number"] == 3
        assert part3["title"] == "Two-way Discussion"
        
        topics = part3.get("topics", [])
        topic_names = [t.get("topic", "").lower() for t in topics]
        
        assert any("monument" in t for t in topic_names), "Public monuments topic not found"
        assert any("architecture" in t for t in topic_names), "Architecture topic not found"
        print("✓ Part 3: Topics are Public monuments and Architecture - correct")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
