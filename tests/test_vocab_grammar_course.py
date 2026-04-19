"""
Test Vocabulary & Grammar Course APIs
Tests for:
- GET /api/vocab-grammar/lessons - Course lessons (30 units, 255 items)
- GET /api/question-bank/grammar-vocab/quizzes - Quiz questions (90 total)
- GET /api/question-bank/grammar-vocab/units - Units grouped by band level
- POST /api/question-bank/grammar-vocab/evaluate - Quiz evaluation
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestVocabGrammarLessons:
    """Test /api/vocab-grammar/lessons endpoint"""
    
    def test_get_all_lessons_returns_30_units(self):
        """Verify total units = 30"""
        response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons")
        assert response.status_code == 200
        lessons = response.json()
        assert isinstance(lessons, list)
        assert len(lessons) == 30, f"Expected 30 units, got {len(lessons)}"
    
    def test_total_items_is_255(self):
        """Verify total items = 255"""
        response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons")
        assert response.status_code == 200
        lessons = response.json()
        total_items = sum(len(l.get('items', [])) for l in lessons)
        assert total_items == 255, f"Expected 255 items, got {total_items}"
    
    def test_foundation_band_has_14_units(self):
        """Verify foundation band has 14 units"""
        response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons?band_level=foundation")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) == 14, f"Expected 14 foundation units, got {len(lessons)}"
    
    def test_development_band_has_8_units(self):
        """Verify development band has 8 units"""
        response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons?band_level=development")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) == 8, f"Expected 8 development units, got {len(lessons)}"
    
    def test_advanced_band_has_8_units(self):
        """Verify advanced band has 8 units"""
        response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons?band_level=advanced")
        assert response.status_code == 200
        lessons = response.json()
        assert len(lessons) == 8, f"Expected 8 advanced units, got {len(lessons)}"
    
    def test_lesson_structure_has_required_fields(self):
        """Verify lesson structure has all required fields"""
        response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons")
        assert response.status_code == 200
        lessons = response.json()
        
        required_fields = ['id', 'title', 'band_level', 'type', 'unit_number', 'items']
        for lesson in lessons[:5]:  # Check first 5 lessons
            for field in required_fields:
                assert field in lesson, f"Missing field '{field}' in lesson {lesson.get('id')}"
    
    def test_lesson_items_have_required_fields(self):
        """Verify lesson items have required fields"""
        response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons")
        assert response.status_code == 200
        lessons = response.json()
        
        # Check vocabulary items
        vocab_lesson = next((l for l in lessons if l.get('type') == 'vocabulary'), None)
        assert vocab_lesson is not None
        
        item = vocab_lesson['items'][0]
        vocab_fields = ['id', 'word', 'definition', 'examples']
        for field in vocab_fields:
            assert field in item, f"Missing field '{field}' in vocab item"
    
    def test_get_single_lesson_by_id(self):
        """Test getting a single lesson by ID"""
        response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons/f-u1-vocab")
        assert response.status_code == 200
        lesson = response.json()
        assert lesson['id'] == 'f-u1-vocab'
        assert lesson['title'] == 'Unit 1: Daily Life & Routines'
        assert len(lesson['items']) == 10


class TestQuestionBankQuizzes:
    """Test /api/question-bank/grammar-vocab/quizzes endpoint"""
    
    def test_get_all_quizzes_returns_90_total(self):
        """Verify total quizzes = 90"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/quizzes?limit=200")
        assert response.status_code == 200
        data = response.json()
        assert data['total'] == 90, f"Expected 90 quizzes, got {data['total']}"
    
    def test_quiz_structure_has_required_fields(self):
        """Verify quiz structure has all required fields"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/quizzes?limit=5")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ['id', 'question', 'options', 'answer', 'explanation', 'band_level']
        for quiz in data['quizzes']:
            for field in required_fields:
                assert field in quiz, f"Missing field '{field}' in quiz {quiz.get('id')}"
    
    def test_filter_by_foundation_band(self):
        """Test filtering quizzes by foundation band"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/quizzes?band_level=foundation&limit=100")
        assert response.status_code == 200
        data = response.json()
        
        # All returned quizzes should be foundation level
        for quiz in data['quizzes']:
            assert quiz['band_level'] == 'foundation'
    
    def test_filter_by_development_band(self):
        """Test filtering quizzes by development band"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/quizzes?band_level=development&limit=100")
        assert response.status_code == 200
        data = response.json()
        
        for quiz in data['quizzes']:
            assert quiz['band_level'] == 'development'
    
    def test_filter_by_advanced_band(self):
        """Test filtering quizzes by advanced band"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/quizzes?band_level=advanced&limit=100")
        assert response.status_code == 200
        data = response.json()
        
        for quiz in data['quizzes']:
            assert quiz['band_level'] == 'advanced'
    
    def test_quiz_options_are_list(self):
        """Verify quiz options are a list with at least 2 options"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/quizzes?limit=10")
        assert response.status_code == 200
        data = response.json()
        
        for quiz in data['quizzes']:
            assert isinstance(quiz['options'], list)
            assert len(quiz['options']) >= 2, f"Quiz {quiz['id']} has less than 2 options"
    
    def test_quiz_answer_is_in_options(self):
        """Verify quiz answer is one of the options"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/quizzes?limit=20")
        assert response.status_code == 200
        data = response.json()
        
        for quiz in data['quizzes']:
            assert quiz['answer'] in quiz['options'], f"Answer '{quiz['answer']}' not in options for quiz {quiz['id']}"


class TestQuestionBankUnits:
    """Test /api/question-bank/grammar-vocab/units endpoint"""
    
    def test_get_units_grouped_by_band(self):
        """Verify units are grouped by band level"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/units")
        assert response.status_code == 200
        data = response.json()
        
        assert 'units' in data
        assert 'foundation' in data['units']
        assert 'development' in data['units']
        assert 'advanced' in data['units']
    
    def test_foundation_units_count(self):
        """Verify foundation has 14 units"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/units")
        assert response.status_code == 200
        data = response.json()
        
        foundation_units = data['units']['foundation']
        assert len(foundation_units) == 14, f"Expected 14 foundation units, got {len(foundation_units)}"
    
    def test_development_units_count(self):
        """Verify development has 8 units"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/units")
        assert response.status_code == 200
        data = response.json()
        
        development_units = data['units']['development']
        assert len(development_units) == 8, f"Expected 8 development units, got {len(development_units)}"
    
    def test_advanced_units_count(self):
        """Verify advanced has 8 units"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/units")
        assert response.status_code == 200
        data = response.json()
        
        advanced_units = data['units']['advanced']
        assert len(advanced_units) == 8, f"Expected 8 advanced units, got {len(advanced_units)}"
    
    def test_unit_structure_has_required_fields(self):
        """Verify unit structure has required fields"""
        response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/units")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ['id', 'title', 'band_level', 'type', 'unit_number']
        for band in ['foundation', 'development', 'advanced']:
            for unit in data['units'][band][:3]:
                for field in required_fields:
                    assert field in unit, f"Missing field '{field}' in unit {unit.get('id')}"


class TestQuizEvaluation:
    """Test /api/question-bank/grammar-vocab/evaluate endpoint"""
    
    def test_evaluate_correct_answers(self):
        """Test evaluation with correct answers"""
        response = requests.post(
            f"{BASE_URL}/api/question-bank/grammar-vocab/evaluate",
            json={
                "answers": {
                    "f-u1-vocab-q1": "usually",
                    "f-u1-vocab-q2": "schedule",
                    "f-u1-vocab-q3": "convenient"
                },
                "user_id": "test-user-pytest"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data['score'] == 100.0
        assert data['correct'] == 3
        assert data['total'] == 3
        assert len(data['results']) == 3
        assert data['weak_units'] == []
    
    def test_evaluate_incorrect_answers(self):
        """Test evaluation with incorrect answers"""
        response = requests.post(
            f"{BASE_URL}/api/question-bank/grammar-vocab/evaluate",
            json={
                "answers": {
                    "f-u1-vocab-q1": "wrong_answer",
                    "f-u1-vocab-q2": "wrong_answer"
                },
                "user_id": "test-user-pytest"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data['score'] == 0.0
        assert data['correct'] == 0
        assert data['total'] == 2
        assert len(data['weak_units']) > 0
    
    def test_evaluate_mixed_answers(self):
        """Test evaluation with mixed correct/incorrect answers"""
        response = requests.post(
            f"{BASE_URL}/api/question-bank/grammar-vocab/evaluate",
            json={
                "answers": {
                    "f-u1-vocab-q1": "usually",  # correct
                    "f-u1-vocab-q2": "wrong"     # incorrect
                },
                "user_id": "test-user-pytest"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data['score'] == 50.0
        assert data['correct'] == 1
        assert data['total'] == 2
    
    def test_evaluate_returns_explanations(self):
        """Test that evaluation returns explanations for each answer"""
        response = requests.post(
            f"{BASE_URL}/api/question-bank/grammar-vocab/evaluate",
            json={
                "answers": {
                    "f-u1-vocab-q1": "usually"
                },
                "user_id": "test-user-pytest"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        result = data['results'][0]
        assert 'explanation' in result
        assert result['explanation'] is not None
        assert len(result['explanation']) > 0
    
    def test_evaluate_without_user_id(self):
        """Test evaluation works without user_id"""
        response = requests.post(
            f"{BASE_URL}/api/question-bank/grammar-vocab/evaluate",
            json={
                "answers": {
                    "f-u1-vocab-q1": "usually"
                }
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data['total'] == 1


class TestBandLevelContent:
    """Test that all 3 band levels have proper content"""
    
    def test_all_bands_have_vocabulary_units(self):
        """Verify all bands have vocabulary units"""
        response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons")
        assert response.status_code == 200
        lessons = response.json()
        
        for band in ['foundation', 'development', 'advanced']:
            vocab_units = [l for l in lessons if l['band_level'] == band and l['type'] == 'vocabulary']
            assert len(vocab_units) > 0, f"No vocabulary units found for {band} band"
    
    def test_all_bands_have_grammar_units(self):
        """Verify all bands have grammar units"""
        response = requests.get(f"{BASE_URL}/api/vocab-grammar/lessons")
        assert response.status_code == 200
        lessons = response.json()
        
        for band in ['foundation', 'development', 'advanced']:
            grammar_units = [l for l in lessons if l['band_level'] == band and l['type'] == 'grammar']
            assert len(grammar_units) > 0, f"No grammar units found for {band} band"
    
    def test_all_bands_have_quiz_questions(self):
        """Verify all bands have quiz questions"""
        for band in ['foundation', 'development', 'advanced']:
            response = requests.get(f"{BASE_URL}/api/question-bank/grammar-vocab/quizzes?band_level={band}&limit=100")
            assert response.status_code == 200
            data = response.json()
            assert len(data['quizzes']) > 0, f"No quizzes found for {band} band"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
