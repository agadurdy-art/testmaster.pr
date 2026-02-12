"""
Test Set E Audio and Question Bank UI Redesign
============================================
Tests for:
1. Set E listening audio endpoints (all 4 parts)
2. All 8 academic set audio endpoints
3. Backend test data availability
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSetEAudio:
    """Test Set E listening audio files"""
    
    def test_set_e_listening_part1(self):
        """Test Set E listening part 1 returns 200"""
        response = requests.get(f"{BASE_URL}/api/full-test/audio/stream/academic_set_e_01/listening/1", timeout=10)
        assert response.status_code == 200, f"Part 1 failed: {response.status_code}"
        assert 'audio' in response.headers.get('content-type', ''), "Should return audio content"
        
    def test_set_e_listening_part2(self):
        """Test Set E listening part 2 returns 200"""
        response = requests.get(f"{BASE_URL}/api/full-test/audio/stream/academic_set_e_01/listening/2", timeout=10)
        assert response.status_code == 200, f"Part 2 failed: {response.status_code}"
        assert 'audio' in response.headers.get('content-type', ''), "Should return audio content"
        
    def test_set_e_listening_part3(self):
        """Test Set E listening part 3 returns 200"""
        response = requests.get(f"{BASE_URL}/api/full-test/audio/stream/academic_set_e_01/listening/3", timeout=10)
        assert response.status_code == 200, f"Part 3 failed: {response.status_code}"
        assert 'audio' in response.headers.get('content-type', ''), "Should return audio content"
        
    def test_set_e_listening_part4(self):
        """Test Set E listening part 4 returns 200"""
        response = requests.get(f"{BASE_URL}/api/full-test/audio/stream/academic_set_e_01/listening/4", timeout=10)
        assert response.status_code == 200, f"Part 4 failed: {response.status_code}"
        assert 'audio' in response.headers.get('content-type', ''), "Should return audio content"


class TestAllAcademicSetAudio:
    """Test all 8 academic set audio endpoints (Part 1)"""
    
    @pytest.mark.parametrize("set_letter", ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])
    def test_academic_set_audio(self, set_letter):
        """Test academic set audio part 1 returns 200"""
        test_id = f"academic_set_{set_letter}_01"
        response = requests.get(f"{BASE_URL}/api/full-test/audio/stream/{test_id}/listening/1", timeout=10)
        assert response.status_code == 200, f"Set {set_letter.upper()} part 1 failed: {response.status_code}"


class TestAudioStatus:
    """Test audio status endpoint"""
    
    def test_set_e_audio_status(self):
        """Test Set E audio status shows 4 listening files"""
        response = requests.get(f"{BASE_URL}/api/full-test/audio/status/academic_set_e_01", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        assert data['listening']['files_count'] >= 4, f"Expected at least 4 listening files, got {data['listening']['files_count']}"


class TestFullTestSetsAPI:
    """Test the full test sets endpoint"""
    
    def test_full_test_sets_returns_8_academic(self):
        """Test that /api/full-test/sets returns 8 academic sets"""
        response = requests.get(f"{BASE_URL}/api/full-test/sets", timeout=10)
        assert response.status_code == 200
        data = response.json()
        academic_sets = data.get('academic_sets', [])
        assert len(academic_sets) == 8, f"Expected 8 academic sets, got {len(academic_sets)}"
        
        # Verify all set IDs
        set_ids = [s['test_id'] for s in academic_sets]
        for letter in ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']:
            expected_id = f"academic_set_{letter}_01"
            assert expected_id in set_ids, f"Missing {expected_id}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
