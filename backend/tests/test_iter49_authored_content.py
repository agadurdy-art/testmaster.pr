"""
ITERATION 49: Authored Content System Verification Tests
Tests for the new content system where user provides hand-crafted content for Unit 1.
Key features:
- YouTube video embed in warmup
- Single-mode grammar games (not mixed)
- Extra Fun links at lesson end
- Spiral recall (retrieval warmup from previous lessons)
- vocabulary_review and grammar_review types for Lesson 4
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestLesson1AuthoredContent:
    """Tests for Lesson 1: Hello & ABC with YouTube warmup"""

    def test_lesson1_activity_flow_has_10_steps(self):
        """Verify L1 has 10 steps (9 authored + auto_review)"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Check activity flow count
        assert len(data['activity_flow']) == 10, f"Expected 10 steps, got {len(data['activity_flow'])}"
        
        # Verify lesson title
        assert data.get('title') == 'Hello & ABC', f"Expected 'Hello & ABC', got {data.get('title')}"
        
        # Verify extra_links array exists
        assert 'extra_links' in data, "extra_links not found"
        assert len(data['extra_links']) >= 1, "Expected at least 1 extra link"

    def test_lesson1_warmup_has_video_url(self):
        """Verify L1 warmup has YouTube video_url"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/retrieval_warmup")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Check questions exist
        assert len(data['questions']) > 0, "No questions in warmup"
        q = data['questions'][0]
        
        # Verify video_url is present and is YouTube
        assert 'video_url' in q, "video_url not found in warmup question"
        assert 'youtube.com' in q['video_url'], f"Expected YouTube URL, got {q['video_url']}"
        
        # Verify hint is present
        assert q.get('hint') == 'You say this when you see someone.', f"Wrong hint: {q.get('hint')}"
        
        # Verify image_emoji
        assert q.get('image_emoji') == '👋', f"Wrong emoji: {q.get('image_emoji')}"
        
        # Verify correct_answer
        assert q.get('correct_answer') == 'hello', f"Wrong answer: {q.get('correct_answer')}"
        
        # Verify options
        assert set(q.get('options', [])) == {'hello', 'apple', 'cat', 'dog'}, f"Wrong options: {q.get('options')}"

    def test_lesson1_grammar_game_is_word_order(self):
        """Verify L1 grammar game is word_order mode"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/micro_game_grammar")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Verify game_type is word_order
        assert data.get('game_type') == 'word_order', f"Expected 'word_order', got {data.get('game_type')}"
        
        # Verify word_order_items exist (not fill_blank_items or mixed items)
        assert len(data.get('word_order_items', [])) > 0, "No word_order_items found"
        
        # Verify correct sentence
        item = data['word_order_items'][0]
        assert item.get('correct_sentence') == 'I am a teacher.', f"Wrong sentence: {item.get('correct_sentence')}"
        assert set(item.get('words', [])) == {'I', 'am', 'a', 'teacher'}, f"Wrong words: {item.get('words')}"


class TestLesson2AuthoredContent:
    """Tests for Lesson 2: Morning & Pets with fill_blank grammar game"""

    def test_lesson2_warmup_spiral_recall(self):
        """Verify L2 warmup recalls vocabulary from L1 (spiral recall)"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/activity/retrieval_warmup")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        q = data['questions'][0]
        
        # Verify hint matches exactly
        assert q.get('hint') == 'The person who learns.', f"Wrong hint: {q.get('hint')}"
        
        # Verify correct_answer is 'student' (from L1)
        assert q.get('correct_answer') == 'student', f"Wrong answer: {q.get('correct_answer')}"

    def test_lesson2_grammar_game_is_fill_blank(self):
        """Verify L2 grammar game is fill_blank mode (single mode, not mixed)"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/activity/micro_game_grammar")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Verify game_type is fill_blank
        assert data.get('game_type') == 'fill_blank', f"Expected 'fill_blank', got {data.get('game_type')}"
        
        # Verify fill_blank_items exist
        assert len(data.get('fill_blank_items', [])) > 0, "No fill_blank_items found"
        
        # Verify NO word_order_items (single mode)
        assert len(data.get('word_order_items', [])) == 0, "Should not have word_order_items in fill_blank mode"
        
        item = data['fill_blank_items'][0]
        
        # Verify hint
        assert item.get('hint') == 'It says meow.', f"Wrong hint: {item.get('hint')}"
        
        # Verify correct answer
        assert item.get('correct_answer') == 'cat', f"Wrong answer: {item.get('correct_answer')}"


class TestLesson3AuthoredContent:
    """Tests for Lesson 3: My Friend with error_hunter grammar game"""

    def test_lesson3_grammar_game_is_error_hunter(self):
        """Verify L3 grammar game is error_hunter mode"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_03/activity/micro_game_grammar")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Verify game_type is error_hunter
        assert data.get('game_type') == 'error_hunter', f"Expected 'error_hunter', got {data.get('game_type')}"
        
        # Verify items exist (error_hunter uses 'items' not specific arrays)
        assert len(data.get('items', [])) > 0, "No error_hunter items found"
        
        item = data['items'][0]
        
        # Verify error sentence
        assert item.get('sentence') == 'This are my friend.', f"Wrong sentence: {item.get('sentence')}"
        assert item.get('has_error') == True, "Expected has_error=True"
        assert item.get('correct_sentence') == 'This is my friend.', f"Wrong correction: {item.get('correct_sentence')}"


class TestLesson4MasteryCheck:
    """Tests for Lesson 4: Unit 1 Mastery Check with vocabulary_review and grammar_review"""

    def test_lesson4_is_review_lesson(self):
        """Verify L4 has is_review=True flag"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_04")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        assert data.get('is_review') == True, f"Expected is_review=True, got {data.get('is_review')}"
        assert data.get('title') == 'Unit 1 Mastery Check', f"Wrong title: {data.get('title')}"

    def test_lesson4_vocabulary_review_exists(self):
        """Verify L4 has vocabulary activity with review words"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_04/activity/vocabulary")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Should have is_review flag or review_words
        assert data.get('is_review') == True or len(data.get('review_words', [])) > 0, "Expected vocabulary_review data"
        
        # Verify all unit words are in review list
        expected_words = ['hello', 'teacher', 'student', 'morning', 'fine', 'boy', 'girl', 'friend', 'apple', 'ball', 'cat', 'dog', 'egg']
        review_words = data.get('review_words', [])
        for word in expected_words:
            assert word in review_words, f"Missing word '{word}' in review"

    def test_lesson4_grammar_review_exists(self):
        """Verify L4 has grammar activity with review patterns"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_04/activity/grammar_focus")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        # Should have is_review flag or review_patterns
        assert data.get('is_review') == True or len(data.get('review_patterns', [])) > 0, "Expected grammar_review data"
        
        # Verify patterns
        expected_patterns = ['I am...', 'I have...', 'This is my...']
        review_patterns = data.get('review_patterns', [])
        for pattern in expected_patterns:
            assert pattern in review_patterns, f"Missing pattern '{pattern}' in review"


class TestUnitsOrdering:
    """Test that units are returned in correct order"""

    def test_units_sorted_by_unit_number(self):
        """Verify units are sorted by unit_number (Unit 1 first)"""
        res = requests.get(f"{BASE_URL}/api/unified/stages/stage_1/units")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        units = data.get('units', [])
        assert len(units) > 0, "No units returned"
        
        # First unit should be Unit 1
        first_unit = units[0]
        assert first_unit.get('unit_number') == 1, f"First unit should be unit_number=1, got {first_unit.get('unit_number')}"
        assert first_unit.get('unit_id') == 'stage_1_unit_01', f"Wrong unit_id: {first_unit.get('unit_id')}"
        
        # Verify ordering
        for i in range(1, len(units)):
            prev_num = units[i-1].get('unit_number', 0)
            curr_num = units[i].get('unit_number', 0)
            assert curr_num >= prev_num, f"Units not sorted: unit {i-1} has num={prev_num}, unit {i} has num={curr_num}"


class TestExtraLinks:
    """Test Extra Fun links at lesson end"""

    def test_lesson1_has_extra_links(self):
        """Verify L1 has extra_links for Extra Fun section"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        extra_links = data.get('extra_links', [])
        assert len(extra_links) >= 2, f"Expected at least 2 extra links, got {len(extra_links)}"
        
        # Verify Hello Song link
        hello_song = next((l for l in extra_links if 'Hello Song' in l.get('label', '')), None)
        assert hello_song is not None, "Hello Song link not found"
        assert 'youtube.com' in hello_song.get('url', ''), "Hello Song should be YouTube link"
        
        # Verify Phonics A link
        phonics_a = next((l for l in extra_links if 'Phonics A' in l.get('label', '')), None)
        assert phonics_a is not None, "Phonics A link not found"

    def test_all_unit1_lessons_have_extra_links(self):
        """Verify all 4 Unit 1 lessons have extra_links"""
        for lesson_num in range(1, 5):
            lesson_id = f"stage_1_unit_01_lesson_0{lesson_num}"
            res = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}")
            assert res.status_code == 200, f"Failed for {lesson_id}: {res.text}"
            data = res.json()
            
            extra_links = data.get('extra_links', [])
            assert len(extra_links) >= 1, f"Lesson {lesson_num} should have extra_links, got {len(extra_links)}"


class TestSummaryData:
    """Test pre-computed summary_data in lesson document"""

    def test_lesson1_summary_data_contains_words(self):
        """Verify L1 summary_data has vocabulary words"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        summary = data.get('summary_data', {})
        words = summary.get('words', [])
        
        assert len(words) == 4, f"Expected 4 words in summary, got {len(words)}"
        
        # Verify word structure
        word_names = [w.get('word') for w in words]
        assert 'hello' in word_names, "hello not in summary words"
        assert 'teacher' in word_names, "teacher not in summary words"
        assert 'student' in word_names, "student not in summary words"
        assert 'apple' in word_names, "apple not in summary words"

    def test_lesson1_summary_data_contains_grammar_rules(self):
        """Verify L1 summary_data has grammar rules"""
        res = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01")
        assert res.status_code == 200, f"Failed: {res.text}"
        data = res.json()
        
        summary = data.get('summary_data', {})
        rules = summary.get('grammar_rules', [])
        
        assert len(rules) >= 1, f"Expected at least 1 grammar rule in summary, got {len(rules)}"
        
        # Verify pattern
        patterns = [r.get('pattern') for r in rules]
        assert 'I am a ___.' in patterns, f"'I am a ___.' not in grammar rules: {patterns}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
