"""
Test IELTS 17 Test 4 Fixes:
1. Writing Task 1 image accessibility
2. Speaking Part 2 task_card bullets
3. Reading Q37-40 summary_completion type
4. Reading answer keys Q37-40
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestWritingTask1Image:
    """Test Writing Task 1 image is accessible"""
    
    def test_writing_task1_image_returns_200(self):
        """GET /api/cambridge/images/ielts17/test4/test4_writing_task1.png should return 200"""
        response = requests.get(f"{BASE_URL}/api/cambridge/images/ielts17/test4/test4_writing_task1.png")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
    def test_writing_task1_image_is_png(self):
        """Image should be a valid PNG file"""
        response = requests.get(f"{BASE_URL}/api/cambridge/images/ielts17/test4/test4_writing_task1.png")
        assert response.status_code == 200
        # PNG files start with specific magic bytes
        assert response.content[:8] == b'\x89PNG\r\n\x1a\n', "File is not a valid PNG"
        
    def test_writing_task1_image_has_reasonable_size(self):
        """Image should have reasonable file size (>10KB)"""
        response = requests.get(f"{BASE_URL}/api/cambridge/images/ielts17/test4/test4_writing_task1.png")
        assert response.status_code == 200
        assert len(response.content) > 10000, f"Image too small: {len(response.content)} bytes"


class TestSpeakingPart2TaskCard:
    """Test Speaking Part 2 task_card has bullets"""
    
    def test_speaking_part2_has_task_card(self):
        """Speaking Part 2 should have task_card"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test4")
        assert response.status_code == 200
        data = response.json()
        test = data.get('test', {})
        speaking = test.get('sections', {}).get('speaking', {})
        parts = speaking.get('parts', [])
        part2 = next((p for p in parts if p.get('part_number') == 2), None)
        assert part2 is not None, "Speaking Part 2 not found"
        assert 'task_card' in part2, "task_card not found in Part 2"
        
    def test_speaking_part2_task_card_has_bullets(self):
        """Speaking Part 2 task_card should have bullets array"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test4")
        assert response.status_code == 200
        data = response.json()
        test = data.get('test', {})
        speaking = test.get('sections', {}).get('speaking', {})
        parts = speaking.get('parts', [])
        part2 = next((p for p in parts if p.get('part_number') == 2), None)
        task_card = part2.get('task_card', {})
        assert 'bullets' in task_card, "bullets not found in task_card"
        
    def test_speaking_part2_has_4_bullets(self):
        """Speaking Part 2 task_card should have 4 bullet points"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test4")
        assert response.status_code == 200
        data = response.json()
        test = data.get('test', {})
        speaking = test.get('sections', {}).get('speaking', {})
        parts = speaking.get('parts', [])
        part2 = next((p for p in parts if p.get('part_number') == 2), None)
        task_card = part2.get('task_card', {})
        bullets = task_card.get('bullets', [])
        assert len(bullets) == 4, f"Expected 4 bullets, got {len(bullets)}"
        
    def test_speaking_part2_bullets_content(self):
        """Speaking Part 2 bullets should contain expected content"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test4")
        assert response.status_code == 200
        data = response.json()
        test = data.get('test', {})
        speaking = test.get('sections', {}).get('speaking', {})
        parts = speaking.get('parts', [])
        part2 = next((p for p in parts if p.get('part_number') == 2), None)
        task_card = part2.get('task_card', {})
        bullets = task_card.get('bullets', [])
        
        # Check expected bullet content
        assert any('what you had to do' in b for b in bullets), "Missing 'what you had to do' bullet"
        assert any('why you had to do this in a hurry' in b for b in bullets), "Missing 'why' bullet"
        assert any('how well you did this' in b for b in bullets), "Missing 'how well' bullet"
        assert any('how you felt' in b for b in bullets), "Missing 'how you felt' bullet"


class TestReadingQ37_40SummaryCompletion:
    """Test Reading Q37-40 is summary_completion type"""
    
    def test_reading_q37_40_type_is_summary_completion(self):
        """Reading Q37-40 should be summary_completion type"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test4")
        assert response.status_code == 200
        data = response.json()
        test = data.get('test', {})
        reading = test.get('sections', {}).get('reading', {})
        passages = reading.get('passages', [])
        passage3 = next((p for p in passages if p.get('passage_number') == 3), None)
        assert passage3 is not None, "Passage 3 not found"
        
        questions = passage3.get('questions', [])
        q37_40 = next((q for q in questions if q.get('number') == '37-40'), None)
        assert q37_40 is not None, "Q37-40 not found"
        assert q37_40.get('type') == 'summary_completion', f"Expected summary_completion, got {q37_40.get('type')}"
        
    def test_reading_q37_40_has_summary_text(self):
        """Reading Q37-40 should have summary_text field"""
        response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test4")
        assert response.status_code == 200
        data = response.json()
        test = data.get('test', {})
        reading = test.get('sections', {}).get('reading', {})
        passages = reading.get('passages', [])
        passage3 = next((p for p in passages if p.get('passage_number') == 3), None)
        questions = passage3.get('questions', [])
        q37_40 = next((q for q in questions if q.get('number') == '37-40'), None)
        
        assert 'summary_text' in q37_40, "summary_text not found in Q37-40"
        summary_text = q37_40.get('summary_text', '')
        assert '___37___' in summary_text, "Gap 37 not found in summary_text"
        assert '___38___' in summary_text, "Gap 38 not found in summary_text"
        assert '___39___' in summary_text, "Gap 39 not found in summary_text"
        assert '___40___' in summary_text, "Gap 40 not found in summary_text"


class TestReadingAnswerKeys:
    """Test Reading answer keys for Q37-40"""
    
    def test_reading_answer_q37_is_memory(self):
        """Reading Q37 answer should be 'memory'"""
        response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test4")
        assert response.status_code == 200
        data = response.json()
        answers = data.get('answers', {})
        reading = answers.get('reading', {})
        assert reading.get('37') == 'memory', f"Expected 'memory', got '{reading.get('37')}'"
        
    def test_reading_answer_q38_is_numbers(self):
        """Reading Q38 answer should be 'numbers'"""
        response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test4")
        assert response.status_code == 200
        data = response.json()
        answers = data.get('answers', {})
        reading = answers.get('reading', {})
        assert reading.get('38') == 'numbers', f"Expected 'numbers', got '{reading.get('38')}'"
        
    def test_reading_answer_q39_is_communication(self):
        """Reading Q39 answer should be 'communication'"""
        response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test4")
        assert response.status_code == 200
        data = response.json()
        answers = data.get('answers', {})
        reading = answers.get('reading', {})
        assert reading.get('39') == 'communication', f"Expected 'communication', got '{reading.get('39')}'"
        
    def test_reading_answer_q40_is_visual(self):
        """Reading Q40 answer should be 'visual'"""
        response = requests.get(f"{BASE_URL}/api/cambridge/answers/ielts17/test4")
        assert response.status_code == 200
        data = response.json()
        answers = data.get('answers', {})
        reading = answers.get('reading', {})
        assert reading.get('40') == 'visual', f"Expected 'visual', got '{reading.get('40')}'"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
