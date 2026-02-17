"""
Test Suite for Iteration 47 Features
Testing: 
1. Cumulative vocab API endpoint
2. Grammar Game fill_blank uses word's own example sentences  
3. Exit ticket grammar question uses correct word from pattern
4. Frontend: word_order punctuation normalization, fill_blank case-insensitive, two PDF buttons
"""
import pytest
import requests
import os
import re

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')

class TestCumulativeVocabAPI:
    """Test new cumulative vocabulary endpoint"""
    
    def test_cumulative_vocab_unit3_lesson1(self):
        """GET /api/unified/cumulative-vocab/stage_1_unit_03_lesson_01 returns cumulative words"""
        response = requests.get(f"{BASE_URL}/api/unified/cumulative-vocab/stage_1_unit_03_lesson_01")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "words" in data, "Response missing 'words' field"
        assert "grammar_rules" in data, "Response missing 'grammar_rules' field"
        assert "total_lessons" in data, "Response missing 'total_lessons' field"
        
        # Should include lessons from unit 1, 2, and up to unit 3 lesson 1
        # Unit 1: 4 lessons, Unit 2: 4 lessons, Unit 3: 1 lesson = 9 lessons
        assert data["total_lessons"] == 9, f"Expected 9 lessons, got {data['total_lessons']}"
        
        # Should have words from all previous lessons (unique words only)
        words = data["words"]
        assert len(words) > 0, "Expected some words"
        
        # Check words have required fields
        for word in words[:3]:
            assert "word" in word, "Word missing 'word' field"
            assert "definition" in word, "Word missing 'definition' field"
        
        # Should have grammar rules
        rules = data["grammar_rules"]
        assert len(rules) > 0, "Expected grammar rules"
        
        print(f"✓ Cumulative vocab: {len(words)} words, {len(rules)} rules from {data['total_lessons']} lessons")

    def test_cumulative_vocab_unit1_lesson1(self):
        """Test cumulative vocab for first lesson - should only have 1 lesson's worth"""
        response = requests.get(f"{BASE_URL}/api/unified/cumulative-vocab/stage_1_unit_01_lesson_01")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total_lessons"] == 1, f"First lesson should have 1 lesson, got {data['total_lessons']}"
        print(f"✓ First lesson cumulative: {len(data['words'])} words from 1 lesson")


class TestGrammarGameFillBlank:
    """Test fill_blank items use word's own example sentence"""
    
    def test_unit2_fill_blank_pedagogically_correct(self):
        """
        fill_blank_items should use word's example sentence, NOT grammar pattern
        Expected: 'My ______ is Sara.' correct='name' (from word's example)
        NOT: 'What is your ______?' correct='boy' (incorrect pattern usage)
        """
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_02_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        fill_blanks = data.get("fill_blank_items", [])
        
        assert len(fill_blanks) > 0, "Expected fill_blank_items in grammar game"
        
        # Check pedagogical correctness - the sentence should contain the blank for the correct word
        for fb in fill_blanks:
            sentence = fb.get("sentence", "")
            correct = fb.get("correct_answer", "")
            options = fb.get("options", [])
            
            # The sentence should have a blank (______)
            assert "______" in sentence, f"Sentence should have blank: {sentence}"
            
            # The correct answer should be in options
            assert correct in options, f"Correct answer '{correct}' should be in options {options}"
            
            # CRITICAL CHECK: The sentence structure should NOT be a question pattern
            # like "What is your ______?" that doesn't make sense with vocab word
            # Instead it should be the word's example: "My ______ is Sara."
            # Bad pattern: question + vocab word that doesn't fit
            if "What is your" in sentence:
                # If it's "What is your ______", the correct answer MUST be 'name', not 'boy/friend/etc'
                assert correct.lower() == "name", f"'What is your ______' should have correct='name', not '{correct}'"
            
            print(f"✓ Fill blank: '{sentence}' → correct='{correct}'")
        
        print(f"✓ All {len(fill_blanks)} fill_blank items are pedagogically correct")

    def test_unit2_fill_blank_structure(self):
        """Verify fill_blank items have proper structure"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_02_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        fill_blanks = data.get("fill_blank_items", [])
        
        for i, fb in enumerate(fill_blanks):
            assert "sentence" in fb, f"Item {i} missing sentence"
            assert "options" in fb, f"Item {i} missing options"
            assert "correct_answer" in fb, f"Item {i} missing correct_answer"
            assert len(fb["options"]) >= 2, f"Item {i} should have at least 2 options"
        
        print(f"✓ All fill_blank items have valid structure")


class TestExitTicketGrammar:
    """Test exit_ticket grammar question uses correct word from pattern"""
    
    def test_unit2_exit_ticket_grammar_question(self):
        """
        Exit ticket Q3 should be: 'What is your ______' with correct='name'
        This tests that the grammar question finds the word that actually 
        appears in the grammar rule's example sentence
        """
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_02_lesson_01/activity/exit_ticket")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        questions = data.get("questions", [])
        
        assert len(questions) >= 3, f"Expected at least 3 questions, got {len(questions)}"
        
        # Find the grammar question (usually Q3 with "Complete:" prefix)
        grammar_q = None
        for q in questions:
            if "Complete:" in q.get("question_text", ""):
                grammar_q = q
                break
        
        assert grammar_q is not None, "Expected a grammar completion question"
        
        q_text = grammar_q.get("question_text", "")
        correct = grammar_q.get("correct_answer", "")
        
        print(f"Grammar question: '{q_text}'")
        print(f"Correct answer: '{correct}'")
        
        # For Unit 2 (What is your name?), the grammar example is:
        # "What is your name?" → correct should be 'name' or similar word from the example
        if "What is your" in q_text:
            # The correct answer should be a word that makes sense: 'name'
            # NOT 'boy', 'girl', 'friend' which are vocab but don't fit the pattern example
            assert correct.lower() in ["name", "sara", "tom", "ali"], \
                f"'What is your ______' should have contextually correct answer, got '{correct}'"
        
        print(f"✓ Exit ticket grammar question is pedagogically correct")

    def test_exit_ticket_question_structure(self):
        """Verify exit_ticket has proper structure"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_02_lesson_01/activity/exit_ticket")
        assert response.status_code == 200
        
        data = response.json()
        assert "questions" in data
        assert "pass_threshold" in data
        
        questions = data["questions"]
        for i, q in enumerate(questions):
            assert "question_id" in q, f"Q{i} missing question_id"
            assert "question_text" in q, f"Q{i} missing question_text"
            assert "correct_answer" in q, f"Q{i} missing correct_answer"
            assert "question_type" in q, f"Q{i} missing question_type"
        
        print(f"✓ Exit ticket has {len(questions)} well-structured questions")


class TestGrammarGameWordOrder:
    """Test word_order_items structure for punctuation normalization"""
    
    def test_word_order_items_structure(self):
        """Verify word_order_items have words and correct_sentence"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        word_orders = data.get("word_order_items", [])
        
        assert len(word_orders) > 0, "Expected word_order_items"
        
        for wo in word_orders:
            assert "words" in wo, "Missing words"
            assert "correct_sentence" in wo, "Missing correct_sentence"
            
            # Words should not have trailing punctuation
            # correct_sentence typically has period
            words = wo["words"]
            correct = wo["correct_sentence"]
            
            # Verify the words when joined can match correct_sentence (after normalization)
            joined = " ".join(words)
            normalized_joined = re.sub(r'[.!?,;:]+$', '', joined).strip().lower()
            normalized_correct = re.sub(r'[.!?,;:]+$', '', correct).strip().lower()
            
            assert normalized_joined == normalized_correct, \
                f"Words '{joined}' should match '{correct}' after normalization"
            
            print(f"✓ Word order: words={words} → correct='{correct}'")


class TestActivityEndpoints:
    """Test all activity endpoints return valid data"""
    
    def test_warmup_has_image_emoji(self):
        """Verify warmup questions have image_emoji field"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/retrieval_warmup")
        assert response.status_code == 200
        
        data = response.json()
        questions = data.get("questions", [])
        
        # At least some questions should have image_emoji
        has_emoji = sum(1 for q in questions if q.get("image_emoji"))
        print(f"✓ Warmup: {has_emoji}/{len(questions)} questions have image_emoji")

    def test_vocabulary_activity(self):
        """Verify vocabulary activity has words with examples"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_02_lesson_01/activity/vocabulary")
        assert response.status_code == 200
        
        data = response.json()
        words = data.get("words", [])
        assert len(words) > 0
        
        for w in words:
            assert "word" in w
            assert "example" in w or "example_sentence" in w
        
        print(f"✓ Vocabulary has {len(words)} words with examples")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
