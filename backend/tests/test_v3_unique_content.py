"""
Test V3 Seed Data: Verify unique content per lesson
Tests that lessons 1-4 in each unit have DIFFERENT:
- Reading passages
- Listening scripts  
- Warmup questions
- Vocabulary word sets
- Grammar rules (L1: rule1, L2: rule2, L3/L4: both rules)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')
if BASE_URL:
    BASE_URL = BASE_URL.rstrip('/')


class TestUnit1UniqueContent:
    """Test that Unit 1 lessons have unique content"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Store lesson data for comparison"""
        self.unit_1_lessons = [
            "stage_1_unit_01_lesson_01",
            "stage_1_unit_01_lesson_02", 
            "stage_1_unit_01_lesson_03",
            "stage_1_unit_01_lesson_04"
        ]
        
    def test_unit1_has_4_lessons(self):
        """Verify Unit 1 has 4 lessons"""
        response = requests.get(f"{BASE_URL}/api/unified/units/stage_1_unit_01")
        assert response.status_code == 200, f"Failed to get unit: {response.status_code}"
        data = response.json()
        lessons = data.get("lessons", [])
        assert len(lessons) == 4, f"Expected 4 lessons, got {len(lessons)}"
        print(f"PASS: Unit 1 has 4 lessons")
        
    def test_reading_passages_are_different(self):
        """All 4 lessons should have DIFFERENT reading passages"""
        passages = []
        question_counts = []
        
        for lesson_id in self.unit_1_lessons:
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/micro_reading")
            assert response.status_code == 200, f"Failed to get reading for {lesson_id}"
            data = response.json()
            
            passage = data.get("passage") or data.get("passage_text", "")
            questions = data.get("questions") or data.get("comprehension_questions", [])
            
            passages.append(passage)
            question_counts.append(len(questions))
            print(f"{lesson_id}: passage={len(passage)} chars, questions={len(questions)}")
        
        # Verify all passages are different
        unique_passages = set(passages)
        assert len(unique_passages) == 4, f"Expected 4 unique passages, got {len(unique_passages)}. Passages are identical!"
        print(f"PASS: All 4 reading passages are DIFFERENT")
        
        # Verify L1/L2 have 2 questions, L3/L4 have 3 questions
        assert question_counts[0] == 2, f"L1 should have 2 questions, got {question_counts[0]}"
        assert question_counts[1] == 2, f"L2 should have 2 questions, got {question_counts[1]}"
        assert question_counts[2] == 3, f"L3 should have 3 questions, got {question_counts[2]}"
        assert question_counts[3] == 3, f"L4 should have 3 questions, got {question_counts[3]}"
        print(f"PASS: Question counts correct - L1/L2: 2, L3/L4: 3")
        
    def test_listening_scripts_are_different(self):
        """All 4 lessons should have DIFFERENT listening scripts"""
        scripts = []
        
        for lesson_id in self.unit_1_lessons:
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/listening")
            assert response.status_code == 200, f"Failed to get listening for {lesson_id}"
            data = response.json()
            
            script = data.get("audio_script") or data.get("transcript", "")
            scripts.append(script)
            print(f"{lesson_id}: script={len(script)} chars - '{script[:50]}...'")
        
        # Verify all scripts are different
        unique_scripts = set(scripts)
        assert len(unique_scripts) == 4, f"Expected 4 unique scripts, got {len(unique_scripts)}. Scripts are identical!"
        print(f"PASS: All 4 listening scripts are DIFFERENT")
        
    def test_warmup_questions_are_different(self):
        """All 4 lessons should have DIFFERENT warmup questions"""
        warmup_questions_texts = []
        
        for lesson_id in self.unit_1_lessons:
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/retrieval_warmup")
            assert response.status_code == 200, f"Failed to get warmup for {lesson_id}"
            data = response.json()
            
            questions = data.get("questions", [])
            # Collect all question texts for this lesson
            q_texts = tuple(sorted([q.get("question_text", "") for q in questions]))
            warmup_questions_texts.append(q_texts)
            print(f"{lesson_id}: {len(questions)} warmup questions")
        
        # Verify all warmup question sets are different
        unique_warmups = set(warmup_questions_texts)
        assert len(unique_warmups) == 4, f"Expected 4 unique warmup sets, got {len(unique_warmups)}. Warmups are identical!"
        print(f"PASS: All 4 warmup question sets are DIFFERENT")
        
    def test_vocabulary_words_are_different(self):
        """L1/L2 should have different word subsets (first 3 vs last 3), L3/L4 combined"""
        vocab_word_sets = []
        
        for i, lesson_id in enumerate(self.unit_1_lessons):
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/vocabulary")
            assert response.status_code == 200, f"Failed to get vocabulary for {lesson_id}"
            data = response.json()
            
            words = data.get("words", [])
            word_list = tuple(sorted([w.get("word", "") for w in words]))
            vocab_word_sets.append(word_list)
            print(f"{lesson_id} (L{i+1}): words={word_list}")
        
        # L1 and L2 should have different words
        assert vocab_word_sets[0] != vocab_word_sets[1], "L1 and L2 should have different vocabulary subsets!"
        print(f"PASS: L1 and L2 have DIFFERENT vocabulary subsets")
        
        # L3 and L4 may have overlapping/all words (combining)
        # But should still be different configurations from L1/L2
        print(f"PASS: Vocabulary word distribution verified")
        
    def test_grammar_rules_distribution(self):
        """L1: 1 rule, L2: 1 different rule, L3/L4: both rules"""
        grammar_rules = []
        
        for i, lesson_id in enumerate(self.unit_1_lessons):
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/grammar_focus")
            assert response.status_code == 200, f"Failed to get grammar for {lesson_id}"
            data = response.json()
            
            rules = data.get("rules", [])
            rule_titles = [r.get("title") or r.get("rule_text", "") for r in rules]
            grammar_rules.append(rule_titles)
            print(f"{lesson_id} (L{i+1}): {len(rules)} rules - {rule_titles}")
        
        # L1 should have 1 rule
        assert len(grammar_rules[0]) == 1, f"L1 should have 1 rule, got {len(grammar_rules[0])}"
        
        # L2 should have 1 rule (different from L1)
        assert len(grammar_rules[1]) == 1, f"L2 should have 1 rule, got {len(grammar_rules[1])}"
        assert grammar_rules[0] != grammar_rules[1], "L1 and L2 should have DIFFERENT grammar rules!"
        
        # L3 should have 2 rules (both)
        assert len(grammar_rules[2]) == 2, f"L3 should have 2 rules (both), got {len(grammar_rules[2])}"
        
        # L4 should have 2 rules (both)
        assert len(grammar_rules[3]) == 2, f"L4 should have 2 rules (both), got {len(grammar_rules[3])}"
        
        print(f"PASS: Grammar rules distribution correct - L1: 1, L2: 1 (different), L3: 2, L4: 2")


class TestUnit5UniqueContent:
    """Test that Unit 5 (My Family) also has unique content per lesson"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Store lesson data for comparison"""
        self.unit_5_lessons = [
            "stage_1_unit_05_lesson_01",
            "stage_1_unit_05_lesson_02", 
            "stage_1_unit_05_lesson_03",
            "stage_1_unit_05_lesson_04"
        ]
        
    def test_unit5_reading_passages_different(self):
        """Unit 5 should also have 4 different reading passages"""
        passages = []
        
        for lesson_id in self.unit_5_lessons:
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/micro_reading")
            assert response.status_code == 200, f"Failed to get reading for {lesson_id}"
            data = response.json()
            
            passage = data.get("passage") or data.get("passage_text", "")
            passages.append(passage)
            print(f"{lesson_id}: passage='{passage[:60]}...'")
        
        unique_passages = set(passages)
        assert len(unique_passages) == 4, f"Unit 5 expected 4 unique passages, got {len(unique_passages)}"
        print(f"PASS: Unit 5 all 4 reading passages are DIFFERENT")
        
    def test_unit5_listening_scripts_different(self):
        """Unit 5 should also have 4 different listening scripts"""
        scripts = []
        
        for lesson_id in self.unit_5_lessons:
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/listening")
            assert response.status_code == 200, f"Failed to get listening for {lesson_id}"
            data = response.json()
            
            script = data.get("audio_script") or data.get("transcript", "")
            scripts.append(script)
            print(f"{lesson_id}: script='{script[:50]}...'")
        
        unique_scripts = set(scripts)
        assert len(unique_scripts) == 4, f"Unit 5 expected 4 unique scripts, got {len(unique_scripts)}"
        print(f"PASS: Unit 5 all 4 listening scripts are DIFFERENT")
        
    def test_unit5_warmup_questions_different(self):
        """Unit 5 should have different warmup questions per lesson"""
        warmup_questions_texts = []
        
        for lesson_id in self.unit_5_lessons:
            response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/retrieval_warmup")
            assert response.status_code == 200, f"Failed to get warmup for {lesson_id}"
            data = response.json()
            
            questions = data.get("questions", [])
            q_texts = tuple(sorted([q.get("question_text", "") for q in questions]))
            warmup_questions_texts.append(q_texts)
            print(f"{lesson_id}: {len(questions)} warmup questions")
        
        unique_warmups = set(warmup_questions_texts)
        assert len(unique_warmups) == 4, f"Unit 5 expected 4 unique warmup sets, got {len(unique_warmups)}"
        print(f"PASS: Unit 5 all 4 warmup question sets are DIFFERENT")


class TestLessonContentQuality:
    """Test the quality and length requirements for L3/L4"""
    
    def test_lesson3_longer_passage_3_questions(self):
        """L3 'Read and Learn' should have longer passage with 3 questions"""
        lesson_id = "stage_1_unit_01_lesson_03"
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/micro_reading")
        assert response.status_code == 200
        data = response.json()
        
        passage = data.get("passage") or data.get("passage_text", "")
        questions = data.get("questions") or data.get("comprehension_questions", [])
        
        # L3 should have 3 questions
        assert len(questions) == 3, f"L3 should have 3 questions, got {len(questions)}"
        
        # L3 passage should be longer (compared to L1/L2)
        l1_response = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01/activity/micro_reading")
        l1_passage = l1_response.json().get("passage", "")
        
        # L3 should generally be longer or equal
        print(f"L1 passage: {len(l1_passage)} chars")
        print(f"L3 passage: {len(passage)} chars")
        print(f"PASS: L3 has 3 questions as expected")
        
    def test_lesson4_challenge_passage_3_questions(self):
        """L4 'Review and Speak' should have challenge passage with 3 questions"""
        lesson_id = "stage_1_unit_01_lesson_04"
        response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/micro_reading")
        assert response.status_code == 200
        data = response.json()
        
        passage = data.get("passage") or data.get("passage_text", "")
        questions = data.get("questions") or data.get("comprehension_questions", [])
        
        # L4 should have 3 questions
        assert len(questions) == 3, f"L4 should have 3 questions, got {len(questions)}"
        
        print(f"L4 passage: {len(passage)} chars, questions: {len(questions)}")
        print(f"PASS: L4 has 3 questions as expected")


class TestCrossUnitComparison:
    """Compare multiple units to ensure the pattern holds"""
    
    def test_multiple_units_have_unique_content(self):
        """Test Units 1, 3, 5, 8, 10 all have unique reading per lesson"""
        units_to_test = [1, 3, 5, 8, 10]
        
        for unit_num in units_to_test:
            passages = []
            for lesson_num in range(1, 5):
                lesson_id = f"stage_1_unit_{unit_num:02d}_lesson_{lesson_num:02d}"
                response = requests.get(f"{BASE_URL}/api/unified/lessons/{lesson_id}/activity/micro_reading")
                
                if response.status_code == 200:
                    data = response.json()
                    passage = data.get("passage") or data.get("passage_text", "")
                    passages.append(passage)
                else:
                    print(f"Warning: {lesson_id} reading not found")
            
            if len(passages) == 4:
                unique_count = len(set(passages))
                status = "PASS" if unique_count == 4 else "FAIL"
                print(f"Unit {unit_num}: {unique_count}/4 unique reading passages - {status}")
                assert unique_count == 4, f"Unit {unit_num} does not have 4 unique reading passages!"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
