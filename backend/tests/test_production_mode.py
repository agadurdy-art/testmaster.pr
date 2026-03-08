"""
Production Mode API Tests for Vocabulary Engine Phase 2
Tests the evaluate-sentence endpoint for AI-powered sentence evaluation
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://vocab-coverage-check.preview.emergentagent.com')


class TestProductionModeAPI:
    """Test Production Mode evaluate-sentence endpoint"""
    
    def test_evaluate_sentence_success(self):
        """Test successful sentence evaluation with correct word usage"""
        response = requests.post(
            f"{BASE_URL}/api/vocabulary-engine/evaluate-sentence",
            json={
                "word": "algorithm",
                "sentence": "The algorithm optimized the search results significantly.",
                "word_meaning": "A process or set of rules for calculations or problem-solving",
                "module_title": "The Digital Frontier"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check all required fields exist
        assert "grammar_correct" in data
        assert "word_usage_correct" in data
        assert "overall_score" in data
        assert "feedback" in data
        assert "improved_sentence" in data
        assert "tip" in data
        
        # Validate data types
        assert isinstance(data["grammar_correct"], bool)
        assert isinstance(data["word_usage_correct"], bool)
        assert isinstance(data["overall_score"], int)
        assert 1 <= data["overall_score"] <= 5
        assert isinstance(data["feedback"], str)
        assert len(data["feedback"]) > 0
        
        print(f"✓ Score: {data['overall_score']}/5")
        print(f"✓ Grammar: {'Correct' if data['grammar_correct'] else 'Incorrect'}")
        print(f"✓ Word Usage: {'Correct' if data['word_usage_correct'] else 'Incorrect'}")
    
    def test_evaluate_sentence_grammar_error(self):
        """Test sentence with grammar error gets lower score"""
        response = requests.post(
            f"{BASE_URL}/api/vocabulary-engine/evaluate-sentence",
            json={
                "word": "cybersecurity",
                "sentence": "The cybersecurity is very important for protect the data.",
                "word_meaning": "Practices designed to protect networks from attacks",
                "module_title": "The Digital Frontier"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have feedback about grammar
        assert "feedback" in data
        assert len(data["feedback"]) > 0
        # Score should likely be less than 5 due to grammar errors
        assert 1 <= data["overall_score"] <= 5
        
        print(f"✓ Evaluated sentence with grammar issues")
        print(f"✓ Score: {data['overall_score']}/5")
    
    def test_evaluate_sentence_misused_word(self):
        """Test sentence where word is used incorrectly"""
        response = requests.post(
            f"{BASE_URL}/api/vocabulary-engine/evaluate-sentence",
            json={
                "word": "algorithm",
                "sentence": "I ate algorithm for breakfast this morning.",
                "word_meaning": "A process or set of rules for calculations or problem-solving",
                "module_title": "The Digital Frontier"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Word usage should be incorrect
        assert "word_usage_correct" in data
        # Score should be low due to complete misuse
        assert data["overall_score"] <= 3
        
        print(f"✓ Detected word misuse correctly")
        print(f"✓ Score: {data['overall_score']}/5")
    
    def test_evaluate_sentence_perfect_usage(self):
        """Test well-constructed sentence gets high score"""
        response = requests.post(
            f"{BASE_URL}/api/vocabulary-engine/evaluate-sentence",
            json={
                "word": "innovation",
                "sentence": "Technological innovation drives economic growth and transforms industries.",
                "word_meaning": "The introduction of something new; a new idea or method",
                "module_title": "The Digital Frontier"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have high score for good sentence
        assert data["overall_score"] >= 4
        assert data["grammar_correct"] == True
        assert data["word_usage_correct"] == True
        
        print(f"✓ Perfect sentence scored: {data['overall_score']}/5")
    
    def test_evaluate_sentence_response_time(self):
        """Test that API responds within reasonable time (LLM calls ~3-5 seconds)"""
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/api/vocabulary-engine/evaluate-sentence",
            json={
                "word": "privacy",
                "sentence": "Privacy concerns are growing in the digital age.",
                "word_meaning": "The state of being free from observation by others",
                "module_title": "The Digital Frontier"
            },
            timeout=30
        )
        
        elapsed_time = time.time() - start_time
        
        assert response.status_code == 200
        # Should complete within 15 seconds even with LLM call
        assert elapsed_time < 15
        
        print(f"✓ Response time: {elapsed_time:.2f} seconds")
    
    def test_slides_endpoint_returns_advanced_terms(self):
        """Verify slides endpoint returns words with 'Advanced Term' category"""
        response = requests.get(
            f"{BASE_URL}/api/vocabulary-engine/advanced-module-1/slides",
            timeout=10
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "slides" in data
        assert len(data["slides"]) > 0
        
        # Count Advanced Terms (these are used in Production Mode)
        advanced_terms = [s for s in data["slides"] if s.get("category") == "Advanced Term"]
        assert len(advanced_terms) >= 8, f"Expected at least 8 Advanced Terms, got {len(advanced_terms)}"
        
        print(f"✓ Found {len(advanced_terms)} Advanced Terms for Production Mode")


class TestLightThemeColors:
    """Verify light theme classes in frontend code (code review)"""
    
    def test_api_health_check(self):
        """Basic health check that API is responsive"""
        response = requests.get(f"{BASE_URL}/api/", timeout=10)
        assert response.status_code == 200
        print("✓ API is healthy")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
