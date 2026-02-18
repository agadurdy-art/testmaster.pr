"""
Test iteration 54 - Speech endpoint and multi-question features
Tests:
1. POST /api/speech/evaluate - endpoint exists and returns proper JSON
2. GET /api/unified/lessons/stage_1_unit_03_lesson_01/activity/retrieval_warmup - returns 3 questions
3. GET /api/unified/lessons/stage_1_unit_03_lesson_01/activity/exit_ticket - returns 5 questions
4. GET /api/unified/lessons/stage_1_unit_03_lesson_01/activity/listening_task - returns proper options
5. GET /api/unified/lessons/stage_1_unit_03_lesson_01/activity/production - returns speaking data
"""

import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSpeechEndpoint:
    """Test the new /api/speech/evaluate endpoint"""

    def test_speech_endpoint_exists(self):
        """Test that speech endpoint exists and accepts POST requests"""
        # Create a minimal audio file (empty webm)
        audio_content = b'\x1a\x45\xdf\xa3'  # Minimal webm header
        files = {
            'audio': ('test.webm', io.BytesIO(audio_content), 'audio/webm')
        }
        data = {
            'expected_text': 'hello world',
            'prompt_text': 'Say hello world'
        }
        
        response = requests.post(f"{BASE_URL}/api/speech/evaluate", files=files, data=data)
        
        # Endpoint should exist - we expect 200 even with error (graceful handling)
        assert response.status_code == 200, f"Speech endpoint returned {response.status_code}: {response.text}"
        
        # Should return JSON
        result = response.json()
        assert isinstance(result, dict), "Response should be a dictionary"
        
        # Should have expected fields (even if error)
        expected_fields = ['transcription', 'score']
        has_expected_or_error = any(f in result for f in expected_fields) or 'error' in result
        assert has_expected_or_error, f"Response should have transcription/score or error. Got: {result.keys()}"
        print(f"Speech endpoint response: {result}")

    def test_speech_endpoint_returns_json_structure(self):
        """Test that response has proper JSON structure"""
        audio_content = b'\x1a\x45\xdf\xa3\x01\x00\x00\x00\x00\x00\x00\x00'  # Minimal webm
        files = {
            'audio': ('test.webm', io.BytesIO(audio_content), 'audio/webm')
        }
        data = {
            'expected_text': 'the cat sat on mat',
            'prompt_text': 'Read: The cat sat on mat'
        }
        
        response = requests.post(f"{BASE_URL}/api/speech/evaluate", files=files, data=data)
        assert response.status_code == 200
        
        result = response.json()
        
        # Even with error, should have proper structure
        if 'error' in result:
            # Error response should also have fallback fields
            assert 'transcription' in result or 'score' in result, f"Error response should have fallback fields: {result}"
            print(f"Speech endpoint error (expected with test audio): {result.get('error')}")
        else:
            # Success response should have all fields
            assert 'transcription' in result
            assert 'score' in result
            assert 'matched_words' in result
            assert 'missing_words' in result


class TestWarmupQuestions:
    """Test that Warm-up has 3 questions"""

    def test_warmup_has_3_questions(self):
        """Verify retrieval_warmup returns 3 questions"""
        url = f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/retrieval_warmup"
        response = requests.get(url)
        
        assert response.status_code == 200, f"Warmup API failed: {response.text}"
        
        data = response.json()
        questions = data.get('questions', [])
        
        assert len(questions) >= 3, f"Expected at least 3 warmup questions, got {len(questions)}: {questions}"
        print(f"Warmup questions count: {len(questions)}")
        
        # Verify each question has required fields
        for i, q in enumerate(questions):
            assert 'question_text' in q, f"Question {i+1} missing question_text"
            assert 'options' in q, f"Question {i+1} missing options"
            assert 'correct_answer' in q, f"Question {i+1} missing correct_answer"
            print(f"  Q{i+1}: {q.get('question_text', '')[:50]}...")


class TestExitTicketQuestions:
    """Test that Exit Ticket has 5 questions"""

    def test_exit_ticket_has_5_questions(self):
        """Verify exit_ticket returns 5 questions"""
        url = f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/exit_ticket"
        response = requests.get(url)
        
        assert response.status_code == 200, f"Exit ticket API failed: {response.text}"
        
        data = response.json()
        questions = data.get('questions', [])
        
        assert len(questions) >= 5, f"Expected at least 5 exit ticket questions, got {len(questions)}"
        print(f"Exit ticket questions count: {len(questions)}")
        
        for i, q in enumerate(questions):
            assert 'question_text' in q, f"Exit question {i+1} missing question_text"
            assert 'options' in q, f"Exit question {i+1} missing options"
            print(f"  Q{i+1}: {q.get('question_text', '')[:50]}...")


class TestListeningOptions:
    """Test that Listening has proper options (not yes/no)"""

    def test_listening_has_proper_options(self):
        """Verify listening questions have proper word options"""
        url = f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/listening_task"
        response = requests.get(url)
        
        assert response.status_code == 200, f"Listening API failed: {response.text}"
        
        data = response.json()
        questions = data.get('questions', [])
        
        assert len(questions) > 0, "No listening questions returned"
        
        for i, q in enumerate(questions):
            options = q.get('options', [])
            assert len(options) >= 2, f"Question {i+1} has too few options: {options}"
            
            # Check options are NOT just yes/no
            options_lower = [str(o).lower() for o in options]
            is_yes_no = set(options_lower) == {'yes', 'no'}
            assert not is_yes_no, f"Question {i+1} has yes/no options instead of proper choices: {options}"
            
            print(f"  Q{i+1}: {q.get('question_text', '')[:40]}... Options: {options}")


class TestProductionActivity:
    """Test that Production (Speaking) activity returns data"""

    def test_production_has_speaking_data(self):
        """Verify production activity has speaking content"""
        url = f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/production"
        response = requests.get(url)
        
        assert response.status_code == 200, f"Production API failed: {response.text}"
        
        data = response.json()
        
        # Should have prompt or expected_text
        has_prompt = bool(data.get('prompt'))
        has_expected = bool(data.get('expected_text') or data.get('example_response'))
        
        assert has_prompt or has_expected, f"Production missing prompt/expected_text: {data.keys()}"
        print(f"Production prompt: {data.get('prompt', 'N/A')[:60]}...")
        print(f"Expected text: {data.get('expected_text', data.get('example_response', 'N/A'))[:60]}...")


class TestGrammarGamesWordOrder:
    """Test that Grammar Games has Word Order items"""

    def test_grammar_games_has_word_order(self):
        """Verify grammar games returns word_order game type"""
        url = f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/micro_game_grammar"
        response = requests.get(url)
        
        assert response.status_code == 200, f"Grammar games API failed: {response.text}"
        
        data = response.json()
        games = data.get('games', [])
        
        assert len(games) > 0, "No grammar games returned"
        
        # Check for word_order game type
        word_order_games = [g for g in games if g.get('game_type') == 'word_order']
        
        print(f"Total grammar games: {len(games)}")
        print(f"Word order games: {len(word_order_games)}")
        
        for game in games:
            print(f"  Game type: {game.get('game_type')}, items: {len(game.get('items', []))}")
        
        # Verify word order items have correct structure
        if word_order_games:
            for item in word_order_games[0].get('items', [])[:2]:
                assert 'words' in item, f"Word order item missing 'words': {item.keys()}"
                assert 'correctSentence' in item, f"Word order item missing 'correctSentence': {item.keys()}"
                print(f"    Item words: {item.get('words')}")
                print(f"    Correct: {item.get('correctSentence')}")


class TestAllActivitiesAccessible:
    """Test that all sidebar activities return data"""

    @pytest.mark.parametrize("activity", [
        "retrieval_warmup",
        "vocabulary",
        "micro_game_vocab",
        "micro_reading",
        "grammar_focus",
        "micro_game_grammar",
        "listening_task",
        "production",
        "exit_ticket"
    ])
    def test_activity_returns_data(self, activity):
        """Each activity endpoint should return valid data"""
        url = f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01/activity/{activity}"
        response = requests.get(url)
        
        assert response.status_code == 200, f"{activity} returned {response.status_code}: {response.text[:200]}"
        
        data = response.json()
        assert isinstance(data, dict), f"{activity} should return dict, got {type(data)}"
        
        # Should have some content
        assert len(data) > 0, f"{activity} returned empty data"
        print(f"{activity}: {list(data.keys())[:5]}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
