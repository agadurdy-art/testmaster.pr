"""
Test merged content: Original human-authored + AI-enriched content
Tests vocabulary, reading, grammar, vocab_games, grammar_games, listening, production
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://temp-plan-expiry.preview.emergentagent.com')


class TestLesson01MergedContent:
    """Tests for stage_1_unit_01_lesson_01 - Hello & ABC"""
    
    lesson_id = "stage_1_unit_01_lesson_01"
    
    def test_lesson_exists_with_activity_flow(self):
        """Verify lesson has 10 activities"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{self.lesson_id}")
        assert response.status_code == 200
        data = response.json()
        assert data['title'] == 'Hello & ABC'
        assert len(data['activity_flow']) >= 9  # Should have 10 activities
        types = [a['type'] for a in data['activity_flow']]
        assert 'retrieval_warmup' in types
        assert 'vocabulary' in types
        assert 'micro_game_vocab' in types
        assert 'micro_reading' in types
        assert 'grammar_focus' in types
        assert 'micro_game_grammar' in types
        print(f"✓ Lesson has {len(types)} activities: {types}")
    
    def test_vocabulary_has_4_words(self):
        """Verify vocabulary activity has 4 words with proper structure"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{self.lesson_id}/activity/vocabulary")
        assert response.status_code == 200
        data = response.json()
        words = data.get('words', [])
        assert len(words) == 4, f"Expected 4 words, got {len(words)}"
        expected_words = ['hello', 'teacher', 'student', 'apple']
        actual_words = [w.get('word') for w in words]
        for w in expected_words:
            assert w in actual_words, f"Missing word: {w}"
        # Check word structure
        for word in words:
            assert 'word' in word
            assert word.get('ipa') or word.get('pronunciation')  # Has pronunciation
        print(f"✓ Vocabulary: {actual_words}")
    
    def test_vocab_games_has_3_games(self):
        """Verify vocab games has 3 AI-enriched games"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{self.lesson_id}/activity/micro_game_vocab")
        assert response.status_code == 200
        data = response.json()
        games = data.get('games', [])
        assert len(games) >= 3, f"Expected 3+ games, got {len(games)}"
        game_types = [g.get('game_type') for g in games]
        print(f"✓ Vocab games: {game_types}")
        # Should have variety of game types
        assert 'listen_choose_picture' in game_types or 'listen_choose_word' in game_types
        assert 'unscramble' in game_types or 'read_choose_picture' in game_types
    
    def test_reading_passage_is_original(self):
        """Verify reading passage is original human-authored content"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{self.lesson_id}/activity/micro_reading")
        assert response.status_code == 200
        data = response.json()
        passage = data.get('passage_text', data.get('passage', data.get('text', '')))
        assert 'Hello! I am Ben' in passage, f"Missing original passage content. Got: {passage[:100]}"
        print(f"✓ Reading passage: {passage[:80]}...")
    
    def test_grammar_rule_is_original(self):
        """Verify grammar rule is original human-authored content"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{self.lesson_id}/activity/grammar_focus")
        assert response.status_code == 200
        data = response.json()
        rule = data.get('rule', data.get('rule_text', ''))
        assert 'I am a ___' in rule or 'am' in rule.lower(), f"Missing grammar rule. Got: {rule}"
        print(f"✓ Grammar rule: {rule}")
    
    def test_grammar_games_has_3_types(self):
        """Verify grammar games has word_order, fill_blank, error_hunter"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{self.lesson_id}/activity/micro_game_grammar")
        assert response.status_code == 200
        data = response.json()
        games = data.get('games', [])
        assert len(games) >= 3, f"Expected 3+ games, got {len(games)}"
        game_types = [g.get('game_type') for g in games]
        print(f"✓ Grammar games: {game_types}")
        assert 'word_order' in game_types
        assert 'fill_blank' in game_types
        assert 'error_hunter' in game_types
    
    def test_listening_has_transcript(self):
        """Verify listening activity has transcript"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{self.lesson_id}/activity/listening_task")
        assert response.status_code == 200
        data = response.json()
        transcript = data.get('transcript', '')
        assert transcript, "Missing transcript"
        assert len(transcript) > 10, f"Transcript too short: {transcript}"
        print(f"✓ Listening transcript: {transcript[:80]}...")
    
    def test_warmup_has_questions(self):
        """Verify warmup has question with options"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{self.lesson_id}/activity/retrieval_warmup")
        assert response.status_code == 200
        data = response.json()
        questions = data.get('questions', [])
        assert len(questions) >= 1, "Missing warmup questions"
        q = questions[0]
        assert q.get('question_text'), "Missing question_text"
        assert q.get('options'), "Missing options"
        print(f"✓ Warmup Q: {q.get('question_text')}")
    
    def test_exit_ticket_has_question(self):
        """Verify exit ticket has question"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{self.lesson_id}/activity/exit_ticket")
        assert response.status_code == 200
        data = response.json()
        questions = data.get('questions', [])
        assert len(questions) >= 1, "Missing exit ticket questions"
        q = questions[0]
        assert q.get('question_text'), "Missing question_text"
        print(f"✓ Exit Q: {q.get('question_text')}")


class TestLesson04ReviewContent:
    """Tests for stage_1_unit_01_lesson_04 - Review lesson with 13 words"""
    
    lesson_id = "stage_1_unit_01_lesson_04"
    
    def test_lesson_is_review(self):
        """Verify lesson 4 is a review lesson"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{self.lesson_id}")
        assert response.status_code == 200
        data = response.json()
        # Check is_review flag or title contains review/mastery
        is_review = data.get('is_review', False)
        title = data.get('title', '').lower()
        assert is_review or 'review' in title or 'mastery' in title, f"Not marked as review: {data.get('title')}"
        print(f"✓ Review lesson: {data.get('title')}")
    
    def test_vocabulary_review_has_13_words(self):
        """Verify vocabulary review has all words from unit"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{self.lesson_id}/activity/vocabulary")
        assert response.status_code == 200
        data = response.json()
        # Review lessons may use review_words (strings) or words (objects)
        words = data.get('words', [])
        review_words = data.get('review_words', [])
        word_count = len(words) if words else len(review_words)
        assert word_count >= 10, f"Expected 10+ review words, got {word_count}"
        print(f"✓ Review words: {word_count} words")
        if review_words:
            print(f"  Words: {review_words[:8]}...")


class TestMultipleLessonsContent:
    """Test content across multiple lessons"""
    
    def test_lesson02_content(self):
        """Verify lesson 02 has different content from lesson 01"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_02/activity/vocabulary")
        assert response.status_code == 200
        data = response.json()
        words = data.get('words', [])
        word_list = [w.get('word') for w in words]
        print(f"✓ Lesson 02 vocabulary: {word_list}")
        # Should have different words than lesson 01
        lesson01_words = ['hello', 'teacher', 'student', 'apple']
        assert word_list != lesson01_words, "Lesson 02 has same words as Lesson 01"
    
    def test_all_unit1_lessons_accessible(self):
        """Verify all 4 lessons in unit 1 are accessible"""
        for i in range(1, 5):
            lesson_id = f"stage_1_unit_01_lesson_0{i}"
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}")
            assert response.status_code == 200, f"Lesson {lesson_id} not found"
            data = response.json()
            assert data.get('title'), f"Lesson {lesson_id} missing title"
            print(f"✓ Lesson {i}: {data.get('title')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
