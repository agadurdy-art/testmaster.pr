"""
Test AI-generated media (images + audio) for Testmaster iteration 60
Tests: Nano Banana 2 AI images, ElevenLabs TTS audio, static file serving
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestStaticFilesServing:
    """Test static file mounts for vocab images and audio"""
    
    def test_static_vocab_image_returns_200(self):
        """GET /api/static/vocab_images/{hash}.png should return 200"""
        # Using a known hash from stage_2_unit_01_lesson_01 vocabulary
        resp = requests.get(f"{BASE_URL}/api/static/vocab_images/5d41402abc4b2a76b9719d911017c592.png", timeout=10)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        assert resp.headers.get('content-type') == 'image/png'
    
    def test_static_audio_returns_200(self):
        """GET /api/static/audio/{hash}.mp3 should return 200"""
        # Using a known hash from stage_2_unit_01_lesson_01 vocabulary
        resp = requests.get(f"{BASE_URL}/api/static/audio/5d41402abc4b2a76b9719d911017c592.mp3", timeout=10)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        assert resp.headers.get('content-type') == 'audio/mpeg'
    
    def test_nonexistent_image_returns_404(self):
        """GET /api/static/vocab_images/nonexistent.png should return 404"""
        resp = requests.get(f"{BASE_URL}/api/static/vocab_images/nonexistent12345.png", timeout=10)
        assert resp.status_code == 404


class TestStage2VocabularyMedia:
    """Test Stage 2 vocabulary has AI images and ElevenLabs audio"""
    
    def test_stage2_unit01_lesson01_vocab_has_image_url(self):
        """Vocabulary in stage_2_unit_01_lesson_01 should have image_url"""
        resp = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_01_lesson_01", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        
        vocab_activity = next((a for a in data.get('activity_flow', []) if a.get('type') == 'vocabulary'), None)
        assert vocab_activity is not None, "Vocabulary activity not found"
        
        words = vocab_activity.get('data', {}).get('words', [])
        assert len(words) > 0, "No words in vocabulary"
        
        # Check that at least some words have image_url (148/243 words have images per spec)
        words_with_images = [w for w in words if w.get('image_url')]
        print(f"Words with image_url: {len(words_with_images)}/{len(words)}")
        assert len(words_with_images) > 0, "No words have image_url"
        
        # Verify the first word with image_url has proper format
        sample = words_with_images[0]
        assert sample['image_url'].startswith('/static/vocab_images/'), f"Unexpected image_url format: {sample['image_url']}"
    
    def test_stage2_unit01_lesson01_vocab_has_audio_url(self):
        """Vocabulary in stage_2_unit_01_lesson_01 should have audio_url"""
        resp = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_01_lesson_01", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        
        vocab_activity = next((a for a in data.get('activity_flow', []) if a.get('type') == 'vocabulary'), None)
        assert vocab_activity is not None
        
        words = vocab_activity.get('data', {}).get('words', [])
        assert len(words) > 0
        
        # All words should have audio_url (478 generated, 0 failed per spec)
        words_with_audio = [w for w in words if w.get('audio_url')]
        print(f"Words with audio_url: {len(words_with_audio)}/{len(words)}")
        assert len(words_with_audio) == len(words), f"Not all words have audio_url: {len(words_with_audio)}/{len(words)}"
        
        # Verify audio_url format
        sample = words_with_audio[0]
        assert sample['audio_url'].startswith('/static/audio/'), f"Unexpected audio_url format: {sample['audio_url']}"
    
    def test_stage2_unit01_lesson01_vocab_has_example_audio_url(self):
        """Vocabulary example sentences should have audio_url"""
        resp = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_01_lesson_01", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        
        vocab_activity = next((a for a in data.get('activity_flow', []) if a.get('type') == 'vocabulary'), None)
        assert vocab_activity is not None
        
        words = vocab_activity.get('data', {}).get('words', [])
        words_with_example_audio = [w for w in words if w.get('example_audio_url')]
        print(f"Words with example_audio_url: {len(words_with_example_audio)}/{len(words)}")
        
        # All words should have example_audio_url
        assert len(words_with_example_audio) == len(words)


class TestStage1VocabularyMedia:
    """Test Stage 1 vocabulary also has audio_url"""
    
    def test_stage1_unit01_lesson01_vocab_has_audio_url(self):
        """Stage 1 vocabulary should have audio_url"""
        resp = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_01_lesson_01", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        
        vocab_activity = next((a for a in data.get('activity_flow', []) if a.get('type') == 'vocabulary'), None)
        assert vocab_activity is not None, "Vocabulary activity not found in Stage 1"
        
        words = vocab_activity.get('data', {}).get('words', [])
        assert len(words) > 0
        
        words_with_audio = [w for w in words if w.get('audio_url')]
        print(f"Stage 1 words with audio_url: {len(words_with_audio)}/{len(words)}")
        assert len(words_with_audio) > 0, "No Stage 1 words have audio_url"


class TestListeningActivityAudio:
    """Test listening activities have ElevenLabs audio_url"""
    
    def test_stage1_listening_has_audio_url(self):
        """Stage 1 listening activity should have audio_url"""
        resp = requests.get(f"{BASE_URL}/api/unified/lessons/stage_1_unit_03_lesson_01", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        
        listening = next((a for a in data.get('activity_flow', []) if a.get('type') == 'listening_task'), None)
        assert listening is not None, "listening_task activity not found"
        
        listening_data = listening.get('data', {})
        audio_url = listening_data.get('audio_url')
        print(f"Stage 1 listening audio_url: {audio_url}")
        assert audio_url is not None, "audio_url missing in listening_task"
        assert audio_url.startswith('/static/audio/'), f"Unexpected audio_url format: {audio_url}"
    
    def test_stage2_listening_has_audio_url(self):
        """Stage 2 listening activity should have audio_url (ElevenLabs, not browser TTS)"""
        resp = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_01_lesson_01", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        
        listening = next((a for a in data.get('activity_flow', []) if a.get('type') == 'listening_task'), None)
        assert listening is not None, "listening_task activity not found"
        
        listening_data = listening.get('data', {})
        audio_url = listening_data.get('audio_url')
        print(f"Stage 2 listening audio_url: {audio_url}")
        assert audio_url is not None, "audio_url missing in listening_task"
        assert audio_url.startswith('/static/audio/'), f"Unexpected audio_url format: {audio_url}"
        
        # Verify the audio file actually exists
        full_audio_url = f"{BASE_URL}/api{audio_url}"
        audio_resp = requests.head(full_audio_url, timeout=10)
        assert audio_resp.status_code == 200, f"Audio file not accessible: {full_audio_url}"


class TestStage2DataIntegrity:
    """Test Stage 2 all 12 units still accessible and have proper data"""
    
    @pytest.mark.parametrize("unit_num", range(1, 13))
    def test_stage2_unit_accessible(self, unit_num):
        """Each of 12 Stage 2 units should be accessible"""
        unit_id = f"stage_2_unit_{unit_num:02d}"
        resp = requests.get(f"{BASE_URL}/api/unified/units/{unit_id}", timeout=15)
        assert resp.status_code == 200, f"Unit {unit_id} not accessible"
        
        data = resp.json()
        lessons = data.get('lessons', [])
        assert len(lessons) >= 4, f"Unit {unit_id} should have at least 4 lessons, got {len(lessons)}"
    
    def test_reading_section_has_3_questions(self):
        """Reading section should show 3 questions per lesson"""
        resp = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_03_lesson_01", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        
        reading = next((a for a in data.get('activity_flow', []) if a.get('type') == 'micro_reading'), None)
        assert reading is not None, "micro_reading activity not found"
        
        reading_data = reading.get('data', {})
        questions = reading_data.get('questions', []) or reading_data.get('comprehension_questions', [])
        print(f"Reading questions count: {len(questions)}")
        assert len(questions) == 3, f"Expected 3 reading questions, got {len(questions)}"


class TestAudioAccessibility:
    """Test that audio files are accessible via full URLs"""
    
    def test_vocab_audio_file_accessible(self):
        """Vocab word audio file should be downloadable"""
        resp = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_01_lesson_01", timeout=15)
        data = resp.json()
        
        vocab = next((a for a in data.get('activity_flow', []) if a.get('type') == 'vocabulary'), None)
        words = vocab.get('data', {}).get('words', [])
        
        for w in words[:2]:  # Test first 2 words
            if w.get('audio_url'):
                full_url = f"{BASE_URL}/api{w['audio_url']}"
                audio_resp = requests.head(full_url, timeout=10)
                assert audio_resp.status_code == 200, f"Audio not accessible: {full_url}"
                assert audio_resp.headers.get('content-type') == 'audio/mpeg'
                print(f"✓ Audio accessible: {w['word']} - {full_url}")
    
    def test_vocab_image_file_accessible(self):
        """Vocab word image file should be downloadable"""
        resp = requests.get(f"{BASE_URL}/api/unified/lessons/stage_2_unit_01_lesson_01", timeout=15)
        data = resp.json()
        
        vocab = next((a for a in data.get('activity_flow', []) if a.get('type') == 'vocabulary'), None)
        words = vocab.get('data', {}).get('words', [])
        
        for w in words[:2]:  # Test first 2 words
            if w.get('image_url'):
                full_url = f"{BASE_URL}/api{w['image_url']}"
                img_resp = requests.head(full_url, timeout=10)
                assert img_resp.status_code == 200, f"Image not accessible: {full_url}"
                assert img_resp.headers.get('content-type') == 'image/png'
                print(f"✓ Image accessible: {w['word']} - {full_url}")
