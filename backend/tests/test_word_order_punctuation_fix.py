r"""
Test Word Order Grammar Game - Punctuation Token Fix
Verifies that the grammar game API returns word_order items with punctuation tokens
and that the normalize function logic correctly handles them.

Bug: When punctuation marks (commas, periods, question marks) are stored as separate
word tokens in the data, joining them with spaces creates 'Yes , I do .' instead of
'Yes, I do.' - causing correct answers to be marked wrong.

Fix: The normalize function removes spaces before punctuation using regex:
.replace(/\s+([.!?,;:'""])/g, '$1')
"""

import pytest
import requests
import os
import re

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestWordOrderPunctuationFix:
    """Test the Word Order grammar game punctuation handling"""
    
    def test_grammar_game_api_returns_word_order_items(self):
        """Verify API returns word_order game with items containing punctuation tokens"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_07_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'games' in data, "Response should have 'games' array"
        
        # Find word_order game
        word_order_game = None
        for game in data['games']:
            if game.get('game_type') == 'word_order':
                word_order_game = game
                break
        
        assert word_order_game is not None, "Should have a word_order game"
        assert 'items' in word_order_game, "word_order game should have items"
        assert len(word_order_game['items']) > 0, "word_order game should have at least one item"
    
    def test_word_order_item_has_punctuation_tokens(self):
        """Verify word_order items have punctuation as separate tokens"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_07_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        word_order_game = next((g for g in data['games'] if g.get('game_type') == 'word_order'), None)
        assert word_order_game is not None
        
        # Find item with 'Yes, I do.' - should have comma and period as separate tokens
        yes_item = None
        for item in word_order_game['items']:
            if item.get('correctSentence') == 'Yes, I do.':
                yes_item = item
                break
        
        assert yes_item is not None, "Should have 'Yes, I do.' item"
        assert 'words' in yes_item, "Item should have 'words' array"
        
        # Verify punctuation is separate token
        words = yes_item['words']
        assert ',' in words, f"Comma should be separate token. Words: {words}"
        assert '.' in words, f"Period should be separate token. Words: {words}"
        
        # Verify the structure: ['Yes', ',', 'I', 'do', '.']
        assert words == ['Yes', ',', 'I', 'do', '.'], f"Expected ['Yes', ',', 'I', 'do', '.'], got {words}"
    
    def test_normalize_function_logic(self):
        """Test the normalize function logic that fixes the punctuation spacing issue"""
        # Simulate the normalize function from WordOrder.js
        def normalize(s):
            # Remove spaces before punctuation
            s = re.sub(r'\s+([.!?,;:\'""])', r'\1', s)
            # Remove spaces after opening quotes
            s = re.sub(r'([\'""])\s+', r'\1', s)
            # Normalize multiple spaces to single space
            s = re.sub(r'\s+', ' ', s)
            # Remove trailing punctuation for comparison
            s = re.sub(r'[.!?,;:]+$', '', s)
            return s.strip().lower()
        
        # Test case 1: 'Yes , I do .' should match 'Yes, I do.'
        user_answer = normalize('Yes , I do .')
        correct_answer = normalize('Yes, I do.')
        assert user_answer == correct_answer, f"'{user_answer}' should equal '{correct_answer}'"
        
        # Test case 2: 'Do you like chicken ?' should match 'Do you like chicken?'
        user_answer = normalize('Do you like chicken ?')
        correct_answer = normalize('Do you like chicken?')
        assert user_answer == correct_answer, f"'{user_answer}' should equal '{correct_answer}'"
        
        # Test case 3: 'No , I don\'t .' should match 'No, I don\'t.'
        user_answer = normalize("No , I don't .")
        correct_answer = normalize("No, I don't.")
        assert user_answer == correct_answer, f"'{user_answer}' should equal '{correct_answer}'"
        
        # Test case 4: Standard sentence without separate punctuation tokens
        user_answer = normalize('I am a teacher')
        correct_answer = normalize('I am a teacher.')
        assert user_answer == correct_answer, f"'{user_answer}' should equal '{correct_answer}'"
        
        # Test case 5: 'I like rice and beans .' should match 'I like rice and beans.'
        user_answer = normalize('I like rice and beans .')
        correct_answer = normalize('I like rice and beans.')
        assert user_answer == correct_answer, f"'{user_answer}' should equal '{correct_answer}'"
    
    def test_word_order_items_structure(self):
        """Verify all word_order items have correct structure"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_07_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        word_order_game = next((g for g in data['games'] if g.get('game_type') == 'word_order'), None)
        assert word_order_game is not None
        
        for item in word_order_game['items']:
            assert 'words' in item, f"Item should have 'words': {item}"
            assert 'correctSentence' in item, f"Item should have 'correctSentence': {item}"
            assert isinstance(item['words'], list), f"'words' should be a list: {item}"
            assert len(item['words']) > 0, f"'words' should not be empty: {item}"
            assert isinstance(item['correctSentence'], str), f"'correctSentence' should be string: {item}"
    
    def test_question_mark_token(self):
        """Verify question mark tokens are handled correctly"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_07_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        word_order_game = next((g for g in data['games'] if g.get('game_type') == 'word_order'), None)
        assert word_order_game is not None
        
        # Find item with question mark
        question_item = None
        for item in word_order_game['items']:
            if '?' in item.get('correctSentence', ''):
                question_item = item
                break
        
        assert question_item is not None, "Should have an item with question mark"
        
        # Verify question mark is separate token
        words = question_item['words']
        assert '?' in words, f"Question mark should be separate token. Words: {words}"


class TestOtherGrammarGames:
    """Test other grammar game types in the same API response"""
    
    def test_fill_blank_game_exists(self):
        """Verify fill_blank game is returned"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_07_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        fill_blank = next((g for g in data['games'] if g.get('game_type') == 'fill_blank'), None)
        assert fill_blank is not None, "Should have fill_blank game"
        assert len(fill_blank.get('items', [])) > 0, "fill_blank should have items"
    
    def test_error_hunter_game_exists(self):
        """Verify error_hunter game is returned"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_07_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        error_hunter = next((g for g in data['games'] if g.get('game_type') == 'error_hunter'), None)
        assert error_hunter is not None, "Should have error_hunter game"
        assert len(error_hunter.get('items', [])) > 0, "error_hunter should have items"
    
    def test_true_false_game_exists(self):
        """Verify true_false game is returned"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_07_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        true_false = next((g for g in data['games'] if g.get('game_type') == 'true_false'), None)
        assert true_false is not None, "Should have true_false game"
        assert len(true_false.get('items', [])) > 0, "true_false should have items"


class TestGrammarGamesPlayerComponent:
    """Test GrammarGamesPlayer component data requirements"""
    
    def test_games_array_structure(self):
        """Verify games array has correct structure for GrammarGamesPlayer"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_07_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        assert 'games' in data, "Response should have 'games' array"
        
        for game in data['games']:
            assert 'game_type' in game, f"Game should have 'game_type': {game}"
            assert 'items' in game, f"Game should have 'items': {game}"
            assert isinstance(game['items'], list), f"'items' should be a list: {game}"
    
    def test_badge_shows_game_count(self):
        """Verify games count for 'Grammar Game X of Y' badge"""
        response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_07_lesson_01/activity/micro_game_grammar")
        assert response.status_code == 200
        
        data = response.json()
        games = data.get('games', [])
        
        # Should have multiple games for the badge to show "Game X of Y"
        assert len(games) >= 1, f"Should have at least 1 game, got {len(games)}"
        print(f"Total grammar games: {len(games)}")
        for i, game in enumerate(games):
            print(f"  Game {i+1}: {game.get('game_type')} with {len(game.get('items', []))} items")
