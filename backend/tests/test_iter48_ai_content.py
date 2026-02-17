"""
Test Iteration 48: AI-Powered Content Generation Verification
Tests the pedagogically correct fill-in-the-blank questions with:
- Proper blanks (______)
- Correct plural answers (eyes not eye)
- Distractors from DIFFERENT categories (not body parts for body parts unit)
- Hints
- acceptable_answers for exit quiz fill_blank
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestUnit2Lesson1Grammar:
    """Unit 2 is about 'Making Friends' - What is your name?"""
    
    def test_micro_game_grammar_what_is_your_name(self):
        """Verify 'What is your ______?' has correct_answer='name' NOT 'boy' or 'friend'"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_02_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        fill_blank_items = data.get('fill_blank_items', [])
        
        # Find the "What is your ____?" question
        what_is_your_question = None
        for item in fill_blank_items:
            sentence = item.get('sentence', '').lower()
            if 'what is your' in sentence:
                what_is_your_question = item
                break
        
        assert what_is_your_question is not None, f"Expected 'What is your ______?' question, found: {[i.get('sentence') for i in fill_blank_items]}"
        
        correct_answer = what_is_your_question.get('correct_answer', '').lower()
        assert correct_answer == 'name', f"Expected correct_answer='name' for 'What is your ______?', got '{correct_answer}'"
        
        # Verify it has options and hint
        assert 'options' in what_is_your_question, "Missing options"
        assert len(what_is_your_question['options']) >= 3, "Should have at least 3 options"
        assert 'hint' in what_is_your_question, "Missing hint"
        
        print(f"✓ 'What is your ______?' has correct_answer='name'")
        print(f"  Options: {what_is_your_question.get('options')}")
        print(f"  Hint: {what_is_your_question.get('hint')}")


class TestUnit2ExitTicket:
    """Unit 2 Exit Ticket grammar question"""
    
    def test_exit_ticket_uses_name_not_boy(self):
        """Verify exit ticket grammar question uses 'name' not random word"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_02_lesson_01/activity/exit_ticket")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        questions = data.get('questions', [])
        
        # Find the grammar completion question (typically Q3)
        grammar_question = None
        for q in questions:
            qtext = q.get('question_text', '').lower()
            if 'what is your' in qtext or ('complete' in qtext and 'your' in qtext):
                grammar_question = q
                break
        
        assert grammar_question is not None, f"Expected grammar completion question, found: {[q.get('question_text') for q in questions]}"
        
        correct = grammar_question.get('correct_answer', '').lower()
        # Acceptable answers: 'name' is the primary one
        assert correct == 'name', f"Expected correct_answer='name' for grammar question, got '{correct}'"
        
        print(f"✓ Exit ticket grammar question correct_answer='name'")
        print(f"  Question: {grammar_question.get('question_text')}")


class TestUnit6Lesson1GrammarGame:
    """Unit 6 is about 'My Face' - Body Parts"""
    
    def test_fill_blank_has_proper_blanks(self):
        """Verify fill_blank sentences have ______ blanks"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_06_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        fill_blank_items = data.get('fill_blank_items', [])
        
        assert len(fill_blank_items) > 0, "Expected fill_blank_items"
        
        for item in fill_blank_items:
            sentence = item.get('sentence', '')
            assert '______' in sentence or '____' in sentence, f"Missing blank in sentence: '{sentence}'"
            print(f"✓ Sentence has blank: '{sentence}'")
    
    def test_fill_blank_has_plural_answers(self):
        """Verify answers use correct plural forms (eyes, ears NOT eye, ear)"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_06_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        fill_blank_items = data.get('fill_blank_items', [])
        
        # Check for plural forms in "I have two ______" sentences
        for item in fill_blank_items:
            sentence = item.get('sentence', '').lower()
            correct = item.get('correct_answer', '').lower()
            
            if 'two' in sentence or 'have two' in sentence:
                # Should use plural form
                assert correct in ['eyes', 'ears'], f"Expected plural form for 'I have two ______', got '{correct}' (sentence: {sentence})"
                print(f"✓ Plural form used: '{correct}' for sentence '{sentence}'")
    
    def test_fill_blank_distractors_different_categories(self):
        """Verify distractors are from DIFFERENT categories, not all body parts"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_06_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        fill_blank_items = data.get('fill_blank_items', [])
        
        body_parts = {'eye', 'eyes', 'ear', 'ears', 'nose', 'mouth', 'face', 'hair'}
        
        for item in fill_blank_items:
            options = [o.lower() for o in item.get('options', [])]
            correct = item.get('correct_answer', '').lower()
            
            # Remove the correct answer from options to check distractors
            distractors = [o for o in options if o.lower() != correct.lower()]
            
            # Count how many distractors are body parts
            body_part_distractors = [d for d in distractors if d in body_parts]
            non_body_part_distractors = [d for d in distractors if d not in body_parts]
            
            # At least some distractors should NOT be body parts
            assert len(non_body_part_distractors) >= 2, \
                f"Distractors should be from different categories. For '{item.get('sentence')}': " \
                f"body_part_distractors={body_part_distractors}, non_body_part={non_body_part_distractors}"
            
            print(f"✓ Good distractors for '{item.get('sentence')}': {non_body_part_distractors}")
    
    def test_fill_blank_has_hints(self):
        """Verify all fill_blank items have hints"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_06_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        fill_blank_items = data.get('fill_blank_items', [])
        
        for item in fill_blank_items:
            assert 'hint' in item, f"Missing hint for: '{item.get('sentence')}'"
            assert item['hint'], f"Empty hint for: '{item.get('sentence')}'"
            print(f"✓ Hint present: '{item.get('hint')}' for sentence '{item.get('sentence')}'")


class TestUnit6ExitTicket:
    """Unit 6 Exit Ticket acceptable_answers"""
    
    def test_exit_ticket_has_acceptable_answers(self):
        """Verify fill_blank questions have acceptable_answers field"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_06_lesson_01/activity/exit_ticket")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        questions = data.get('questions', [])
        
        # Find fill_blank type questions
        fill_blank_questions = [q for q in questions if q.get('question_type') == 'fill_blank']
        
        assert len(fill_blank_questions) > 0, "Expected at least one fill_blank question in exit ticket"
        
        for q in fill_blank_questions:
            # acceptable_answers should exist for fill_blank questions
            assert 'acceptable_answers' in q, f"Missing acceptable_answers for fill_blank question: '{q.get('question_text')}'"
            assert isinstance(q['acceptable_answers'], list), "acceptable_answers should be a list"
            print(f"✓ acceptable_answers present for: '{q.get('question_text')}' = {q.get('acceptable_answers')}")


class TestWarmupHints:
    """Verify warmup questions have hints"""
    
    def test_warmup_has_hints(self):
        """Verify warmup questions show hint text"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_06_lesson_01/activity/retrieval_warmup")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        questions = data.get('questions', [])
        
        assert len(questions) > 0, "Expected warmup questions"
        
        for q in questions:
            assert 'hint' in q, f"Missing hint for warmup question: '{q.get('question_text')}'"
            assert q['hint'], f"Empty hint for: '{q.get('question_text')}'"
            print(f"✓ Warmup hint: '{q.get('hint')}' for '{q.get('question_text')}'")


class TestLessonRoadmapAPI:
    """Verify lesson API returns data properly for roadmap display"""
    
    def test_lesson_activities_structure(self):
        """Verify lesson has all required activities for roadmap"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_06_lesson_01")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # activities are in activity_flow field
        activities = data.get('activity_flow', [])
        
        required_activity_types = [
            'retrieval_warmup', 'vocabulary', 'micro_game_vocab',
            'micro_reading', 'grammar_focus', 'micro_game_grammar',
            'listening', 'production', 'exit_ticket', 'auto_review'
        ]
        
        found_types = [a.get('type') for a in activities]
        
        for activity_type in required_activity_types:
            assert activity_type in found_types, f"Missing activity type: {activity_type}. Found: {found_types}"
        
        print(f"✓ All required activities present: {found_types}")


if __name__ == "__main__":
    pytest.main([__file__, '-v'])
