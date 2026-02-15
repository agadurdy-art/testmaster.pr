"""
Iteration 46 Testing - Bug Fixes and Feature Verification
- P0: Grammar Game 'Build the Sentence' evaluation fix (period mismatch)
- P0: Grammar Game 'Fill in the Blank' case-insensitive fix
- P1: Lesson Roadmap feature
- P1: Warm-up images (image_emoji)
- P2: PDF Worksheet download button (frontend-only, client-side jsPDF)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestGrammarGameDataPattern:
    """Verify the Grammar Game data pattern that caused the Build the Sentence bug"""
    
    def test_grammar_game_word_order_data_pattern(self):
        """
        P0 BUG ROOT CAUSE: Verify word_order_items have words WITHOUT period
        but correct_sentence WITH period.
        The frontend fix normalizes both strings to compare correctly.
        """
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        word_order_items = data.get('word_order_items', [])
        
        assert len(word_order_items) > 0, "Should have word_order_items"
        
        for item in word_order_items:
            words = item.get('words', [])
            correct_sentence = item.get('correct_sentence', '')
            
            # Verify the data pattern: words have no period, correct_sentence has period
            for word in words:
                assert not word.endswith('.'), f"Word '{word}' should not end with period"
                assert not word.endswith('!'), f"Word '{word}' should not end with !"
                assert not word.endswith('?'), f"Word '{word}' should not end with ?"
            
            # correct_sentence typically has ending punctuation
            assert correct_sentence.endswith('.') or correct_sentence.endswith('!') or correct_sentence.endswith('?') or not any(c in correct_sentence for c in '.!?'), \
                f"correct_sentence '{correct_sentence}' pattern verified"
            
            # The key insight: joining words creates 'It is one' but correct is 'It is one.'
            joined = ' '.join(words)
            print(f"Words joined: '{joined}' vs correct: '{correct_sentence}'")
            
            # The fix normalizes both:
            def normalize(s):
                import re
                return re.sub(r'[.!?,;:]+$', '', s).strip().lower()
            
            assert normalize(joined) == normalize(correct_sentence), \
                f"After normalization, '{normalize(joined)}' should equal '{normalize(correct_sentence)}'"
    
    def test_fill_blank_items_exist(self):
        """Verify fill_blank_items have options and correct_answer"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        fill_blank_items = data.get('fill_blank_items', [])
        
        assert len(fill_blank_items) > 0, "Should have fill_blank_items"
        
        for item in fill_blank_items:
            assert 'sentence' in item, "fill_blank_item should have sentence"
            assert 'options' in item, "fill_blank_item should have options"
            assert 'correct_answer' in item, "fill_blank_item should have correct_answer"
            assert item['correct_answer'].lower() in [o.lower() for o in item['options']], \
                "correct_answer should be in options (case-insensitive)"


class TestWarmupImageEmoji:
    """Verify warmup questions have image_emoji field (P1 Feature)"""
    
    def test_warmup_has_image_emoji(self):
        """P1 FEATURE: Verify retrieval_warmup questions have image_emoji"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/retrieval_warmup")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get('questions', [])
        
        assert len(questions) > 0, "Should have warmup questions"
        
        # At least some questions should have image_emoji
        questions_with_emoji = [q for q in questions if q.get('image_emoji')]
        assert len(questions_with_emoji) > 0, "At least one warmup question should have image_emoji"
        
        for q in questions_with_emoji:
            emoji = q.get('image_emoji')
            print(f"Question has emoji: {emoji}")
            assert emoji, f"image_emoji should not be empty"


class TestLessonRoadmapData:
    """Verify lesson data supports roadmap feature (P1 Feature)"""
    
    def test_lesson_has_activity_flow(self):
        """P1 FEATURE: Lesson should have activity_flow for roadmap"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01")
        assert response.status_code == 200
        
        data = response.json()
        activity_flow = data.get('activity_flow', [])
        
        assert len(activity_flow) > 0, "Lesson should have activity_flow"
        
        # Verify activities that map to roadmap steps
        activity_types = [a.get('type') for a in activity_flow]
        
        # Roadmap steps: Vocabulary, Practice (vocab game), Lesson (reading/grammar), 
        # Practice (grammar game), Skills (listening/speaking), Review
        expected_activities = ['retrieval_warmup', 'vocabulary', 'micro_game_vocab', 
                              'micro_reading', 'grammar_focus', 'micro_game_grammar',
                              'listening', 'production', 'exit_ticket', 'auto_review']
        
        for expected in ['vocabulary', 'micro_game_grammar', 'listening', 'auto_review']:
            assert expected in activity_types, f"Expected {expected} in activity_flow"
        
        print(f"Activity types in flow: {activity_types}")


class TestMultipleUnits:
    """Test multiple units to ensure data consistency"""
    
    @pytest.mark.parametrize("unit_num,lesson_num", [
        (1, 1), (1, 2), (3, 1), (5, 1)
    ])
    def test_lesson_loads_correctly(self, unit_num, lesson_num):
        """Verify multiple lessons load with correct structure"""
        lesson_id = f"stage_1_unit_{unit_num:02d}_lesson_{lesson_num:02d}"
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}")
        
        assert response.status_code == 200, f"Lesson {lesson_id} should load"
        
        data = response.json()
        assert 'title' in data, "Lesson should have title"
        assert 'activity_flow' in data, "Lesson should have activity_flow"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
