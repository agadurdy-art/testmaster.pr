"""
Test cases for Speaking P2 Features:
- POST /api/cambridge/speaking/generate-drills: Personalized speaking drills
- POST /api/cambridge/speaking/model-answers: Band 7/8 model answers with MongoDB caching
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL') or os.environ.get('API_URL') or 'http://localhost:8001'


class TestGenerateDrillsEndpoint:
    """Test POST /api/cambridge/speaking/generate-drills"""
    
    def test_generate_drills_basic(self):
        """Test basic drill generation with criteria below band 6"""
        response = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/generate-drills",
            json={
                "criteria": {
                    "fluency_coherence": 5,
                    "lexical_resource": 5,
                    "grammatical_range": 6,
                    "pronunciation": 6
                },
                "weaknesses": ["hesitation", "limited vocabulary"],
                "transcript": "Um, well, I think that studying is important."
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "drills" in data
        assert len(data["drills"]) > 0
        print(f"✓ Generated {len(data['drills'])} drills")
    
    def test_drill_structure(self):
        """Verify each drill has required fields: title, steps, personalized_tip"""
        response = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/generate-drills",
            json={
                "criteria": {"fluency_coherence": 4, "lexical_resource": 5},
                "weaknesses": ["pausing too much"],
                "transcript": "I... um... like to read books."
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        for drill in data["drills"]:
            assert "title" in drill, "Drill missing 'title'"
            assert "steps" in drill, "Drill missing 'steps'"
            assert isinstance(drill["steps"], list), "Steps should be a list"
            assert len(drill["steps"]) > 0, "Steps list should not be empty"
            # personalized_tip can be None if LLM fails
            assert "personalized_tip" in drill, "Drill missing 'personalized_tip' key"
            print(f"✓ Drill '{drill['title']}' has all required fields")
    
    def test_drills_target_weak_criteria(self):
        """Verify drills are generated for criteria below band 6"""
        response = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/generate-drills",
            json={
                "criteria": {
                    "fluency_coherence": 7,  # Strong
                    "lexical_resource": 7,   # Strong  
                    "grammatical_range": 4,  # Weak - should get drill
                    "pronunciation": 5       # Weak - should get drill
                },
                "weaknesses": [],
                "transcript": ""
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        drill_criteria = [d.get("criterion") for d in data["drills"]]
        print(f"✓ Drills generated for criteria: {drill_criteria}")
        
        # Should have drills for weak areas
        assert "grammatical_range" in drill_criteria or "pronunciation" in drill_criteria
    
    def test_drills_with_empty_criteria(self):
        """Test API handles empty criteria gracefully"""
        response = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/generate-drills",
            json={
                "criteria": {},
                "weaknesses": [],
                "transcript": ""
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✓ Empty criteria handled, drills: {len(data.get('drills', []))}")


class TestModelAnswersEndpoint:
    """Test POST /api/cambridge/speaking/model-answers"""
    
    def test_model_answers_basic(self):
        """Test basic model answer generation"""
        # Use unique question to avoid cache
        import time
        unique_question = f"Describe a memorable trip you took {int(time.time())}."
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/model-answers",
            json={
                "question": unique_question,
                "part": 2,
                "book_id": "test_book",
                "test_id": "test_1"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert "band7" in data
        assert "band8" in data
        print(f"✓ Model answers generated, cached: {data.get('cached')}")
    
    def test_model_answers_structure(self):
        """Verify band7 and band8 have answer and key_features"""
        import time
        unique_question = f"What do you do in your free time {int(time.time())}?"
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/model-answers",
            json={
                "question": unique_question,
                "part": 1,
                "book_id": "struct_test",
                "test_id": "test_1"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Check band7 structure
        band7 = data.get("band7", {})
        assert "answer" in band7 or "structure" in band7, "band7 missing answer/structure"
        band7_text = band7.get('answer', band7.get('structure', ''))
        print(f"✓ Band 7 answer present: {band7_text[:50] if band7_text else 'N/A'}...")
        
        # Check band8 structure
        band8 = data.get("band8", {})
        assert "answer" in band8 or "structure" in band8, "band8 missing answer/structure"
        band8_text = band8.get('answer', band8.get('structure', ''))
        print(f"✓ Band 8 answer present: {band8_text[:50] if band8_text else 'N/A'}...")
        
        # Check key_features
        if band7.get("key_features"):
            assert isinstance(band7["key_features"], list)
            print(f"✓ Band 7 key_features: {band7['key_features']}")
        
        if band8.get("key_features"):
            assert isinstance(band8["key_features"], list)
            print(f"✓ Band 8 key_features: {band8['key_features']}")
    
    def test_model_answers_differences(self):
        """Verify differences array is returned"""
        import time
        unique_question = f"Tell me about your hometown {int(time.time())}."
        
        response = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/model-answers",
            json={
                "question": unique_question,
                "part": 1,
                "book_id": "diff_test",
                "test_id": "test_1"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        assert "differences" in data
        differences = data["differences"]
        assert isinstance(differences, list)
        print(f"✓ Differences returned: {len(differences)} items")
        
        if differences:
            for i, diff in enumerate(differences[:3]):
                print(f"  - Diff {i+1}: {diff[:60]}...")
    
    def test_model_answers_caching(self):
        """Verify second call returns cached=true"""
        # First call - should generate new
        fixed_question = "What are your hobbies for caching test?"
        
        response1 = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/model-answers",
            json={
                "question": fixed_question,
                "part": 1,
                "book_id": "cache_test_book",
                "test_id": "cache_test_1"
            }
        )
        
        assert response1.status_code == 200
        data1 = response1.json()
        assert data1.get("success") == True
        first_cached = data1.get("cached", False)
        
        # Second call - should return cached
        response2 = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/model-answers",
            json={
                "question": fixed_question,
                "part": 1,
                "book_id": "cache_test_book",
                "test_id": "cache_test_1"
            }
        )
        
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2.get("success") == True
        second_cached = data2.get("cached", False)
        
        print(f"✓ First call cached: {first_cached}, Second call cached: {second_cached}")
        assert second_cached == True, "Second call should return cached=true"
    
    def test_model_answers_parts(self):
        """Test model answers for different speaking parts"""
        import time
        
        for part in [1, 2, 3]:
            unique_q = f"Test question for part {part} at {int(time.time())}"
            
            response = requests.post(
                f"{BASE_URL}/api/cambridge/speaking/model-answers",
                json={
                    "question": unique_q,
                    "part": part,
                    "book_id": "parts_test",
                    "test_id": f"part_{part}"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data.get("success") == True
            print(f"✓ Part {part} model answers generated successfully")


class TestDrillTemplates:
    """Verify DRILL_TEMPLATES are correctly used"""
    
    def test_fluency_coherence_drill(self):
        """Test fluency_coherence template is returned"""
        response = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/generate-drills",
            json={
                "criteria": {"fluency_coherence": 4},
                "weaknesses": [],
                "transcript": ""
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        fc_drill = next((d for d in data["drills"] if d.get("criterion") == "fluency_coherence"), None)
        if fc_drill:
            assert "Fluency" in fc_drill["title"] or "Shadowing" in fc_drill["title"]
            assert fc_drill.get("skill_target") == "Fluency & Coherence"
            print(f"✓ Fluency drill: {fc_drill['title']}")
    
    def test_lexical_resource_drill(self):
        """Test lexical_resource template is returned"""
        response = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/generate-drills",
            json={
                "criteria": {"lexical_resource": 4, "fluency_coherence": 8},
                "weaknesses": [],
                "transcript": ""
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        lr_drill = next((d for d in data["drills"] if d.get("criterion") == "lexical_resource"), None)
        if lr_drill:
            assert "Vocabulary" in lr_drill["title"] or "Collocations" in lr_drill["title"]
            assert lr_drill.get("skill_target") == "Lexical Resource"
            print(f"✓ Lexical drill: {lr_drill['title']}")
    
    def test_grammatical_range_drill(self):
        """Test grammatical_range template is returned"""
        response = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/generate-drills",
            json={
                "criteria": {"grammatical_range": 4, "fluency_coherence": 8, "lexical_resource": 8},
                "weaknesses": [],
                "transcript": ""
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        gr_drill = next((d for d in data["drills"] if d.get("criterion") == "grammatical_range"), None)
        if gr_drill:
            assert "Grammar" in gr_drill["title"] or "Error" in gr_drill["title"]
            assert gr_drill.get("skill_target") == "Grammatical Range & Accuracy"
            print(f"✓ Grammar drill: {gr_drill['title']}")
    
    def test_pronunciation_drill(self):
        """Test pronunciation template is returned"""
        response = requests.post(
            f"{BASE_URL}/api/cambridge/speaking/generate-drills",
            json={
                "criteria": {"pronunciation": 4, "fluency_coherence": 8, "lexical_resource": 8, "grammatical_range": 8},
                "weaknesses": [],
                "transcript": ""
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        pron_drill = next((d for d in data["drills"] if d.get("criterion") == "pronunciation"), None)
        if pron_drill:
            assert "Sound" in pron_drill["title"] or "Pronunciation" in pron_drill["title"] or "Minimal" in pron_drill["title"]
            assert pron_drill.get("skill_target") == "Pronunciation"
            print(f"✓ Pronunciation drill: {pron_drill['title']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
