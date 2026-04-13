"""
Test module for IELTS Full Test Visuals Feature
===============================================
Tests that:
- All 8 academic test sets are returned by the API
- Each set has correct visual_data with image_url in Writing Task 1
- Visual images are served correctly via GET /api/visuals/image/{name}
- Set D and Set G use before/after paired visuals
- Set C, F, G, H Listening sections have correct map visuals
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestFullTestSetsAPI:
    """Tests for GET /api/full-test/sets endpoint"""
    
    def test_get_all_academic_sets(self):
        """All 8 academic test sets should be returned"""
        response = requests.get(f"{BASE_URL}/api/full-test/sets?test_type=academic")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") is True
        assert data.get("total") == 8
        
        sets = data.get("sets", [])
        expected_ids = [
            "academic_set_a_01", "academic_set_b_01", "academic_set_c_01",
            "academic_set_d_01", "academic_set_e_01", "academic_set_f_01",
            "academic_set_g_01", "academic_set_h_01"
        ]
        actual_ids = [s.get("test_id") for s in sets]
        for expected_id in expected_ids:
            assert expected_id in actual_ids, f"Missing set: {expected_id}"
    
    def test_new_sets_f_g_h_metadata(self):
        """New sets F, G, H should have correct metadata"""
        response = requests.get(f"{BASE_URL}/api/full-test/sets?test_type=academic")
        assert response.status_code == 200
        
        data = response.json()
        sets = {s.get("test_id"): s for s in data.get("sets", [])}
        
        # Set F
        assert "academic_set_f_01" in sets
        assert "line graph" in sets["academic_set_f_01"]["description"].lower()
        
        # Set G
        assert "academic_set_g_01" in sets
        assert "paired" in sets["academic_set_g_01"]["description"].lower()
        
        # Set H
        assert "academic_set_h_01" in sets
        assert "process" in sets["academic_set_h_01"]["description"].lower()


class TestWritingVisualData:
    """Tests for Writing Task 1 visual_data structure"""
    
    @pytest.mark.parametrize("set_id,expected_image", [
        ("academic_set_a_01", "visual_002_line_graph_urbanization.png"),
        ("academic_set_b_01", "visual_004_bar_chart_us_households.png"),
        ("academic_set_f_01", "visual_001_line_graph_metals.png"),
    ])
    def test_single_image_visuals(self, set_id, expected_image):
        """Sets with single image visuals should have correct image_url"""
        response = requests.get(f"{BASE_URL}/api/full-test/set/{set_id}?include_answers=false")
        assert response.status_code == 200
        
        data = response.json()
        test = data.get("test", {})
        writing = test.get("sections", {}).get("writing", {})
        tasks = writing.get("tasks", [])
        
        assert len(tasks) >= 1, f"No writing tasks found for {set_id}"
        task1 = tasks[0]
        visual_data = task1.get("visual_data", {})
        
        assert "image_url" in visual_data, f"image_url missing for {set_id}"
        assert visual_data["image_url"] == expected_image
    
    def test_set_d_before_after_floor_plan(self):
        """Set D should have before/after floor plan comparison visuals"""
        response = requests.get(f"{BASE_URL}/api/full-test/set/academic_set_d_01?include_answers=false")
        assert response.status_code == 200
        
        data = response.json()
        test = data.get("test", {})
        writing = test.get("sections", {}).get("writing", {})
        tasks = writing.get("tasks", [])
        
        assert len(tasks) >= 1
        task1 = tasks[0]
        visual_data = task1.get("visual_data", {})
        
        # Should have both image_url and image_url_after
        assert "image_url" in visual_data, "Set D missing image_url"
        assert "image_url_after" in visual_data, "Set D missing image_url_after (required for floor plan comparison)"
        
        # Check specific values
        assert visual_data["image_url"] == "visual_005_floor_plan_library_before.png"
        assert visual_data["image_url_after"] == "visual_026_floor_plan_library_today.png"
        
        # Check type
        assert visual_data.get("type") == "floor_plan_comparison"
        
        # Check labels
        assert visual_data.get("before", {}).get("label") == "20 years ago"
        assert visual_data.get("after", {}).get("label") == "Today"
    
    def test_set_g_paired_line_graphs(self):
        """Set G should have paired line graphs for appliances and housework"""
        response = requests.get(f"{BASE_URL}/api/full-test/set/academic_set_g_01?include_answers=false")
        assert response.status_code == 200
        
        data = response.json()
        test = data.get("test", {})
        writing = test.get("sections", {}).get("writing", {})
        tasks = writing.get("tasks", [])
        
        assert len(tasks) >= 1
        task1 = tasks[0]
        visual_data = task1.get("visual_data", {})
        
        # Should have both images
        assert "image_url" in visual_data, "Set G missing image_url"
        assert "image_url_after" in visual_data, "Set G missing image_url_after (required for paired graphs)"
        
        # Check specific values
        assert visual_data["image_url"] == "visual_012_line_graph_appliances.png"
        assert visual_data["image_url_after"] == "visual_013_line_graph_housework.png"
        
        # Check type
        assert visual_data.get("type") == "paired_line_graphs"


class TestListeningMapVisuals:
    """Tests for Listening section map visuals"""
    
    def test_set_c_recreation_ground_map(self):
        """Set C Listening Part 1 should have recreation ground map"""
        response = requests.get(f"{BASE_URL}/api/full-test/set/academic_set_c_01?include_answers=false")
        assert response.status_code == 200
        
        data = response.json()
        test = data.get("test", {})
        listening = test.get("sections", {}).get("listening", {})
        parts = listening.get("parts", [])
        
        assert len(parts) >= 1, "No listening parts found"
        part1 = parts[0]
        
        # Check title
        assert "Recreation Ground" in part1.get("title", ""), "Part 1 title should mention Recreation Ground"
        
        # Check visual
        visual = part1.get("visual", {})
        assert visual.get("type") == "map"
        assert visual.get("image_url") == "visual_006_map_recreation_after.png"
    
    def test_set_f_farley_house_map(self):
        """Set F Listening Part 2 should have Farley House map"""
        response = requests.get(f"{BASE_URL}/api/full-test/set/academic_set_f_01?include_answers=false")
        assert response.status_code == 200
        
        data = response.json()
        test = data.get("test", {})
        listening = test.get("sections", {}).get("listening", {})
        parts = listening.get("parts", [])
        
        assert len(parts) >= 2, "Need at least 2 listening parts"
        part2 = parts[1]
        
        # Check title
        assert "Farley" in part2.get("title", ""), "Part 2 title should mention Farley"
        
        # Check visual
        visual = part2.get("visual", {})
        assert visual.get("type") == "map"
        assert visual.get("image_url") == "visual_020_map_farley_house.png"
    
    def test_set_g_stevenson_site_plan(self):
        """Set G Listening Part 2 should have Stevenson's site plan"""
        response = requests.get(f"{BASE_URL}/api/full-test/set/academic_set_g_01?include_answers=false")
        assert response.status_code == 200
        
        data = response.json()
        test = data.get("test", {})
        listening = test.get("sections", {}).get("listening", {})
        parts = listening.get("parts", [])
        
        assert len(parts) >= 2, "Need at least 2 listening parts"
        part2 = parts[1]
        
        # Check title
        assert "Stevenson" in part2.get("title", ""), "Part 2 title should mention Stevenson"
        
        # Check visual
        visual = part2.get("visual", {})
        assert visual.get("type") == "floor_plan"
        assert visual.get("image_url") == "visual_011_floor_plan_stevenson_site.png"
    
    def test_set_h_bidcaster_dig_map(self):
        """Set H Listening Part 2 should have Bidcaster dig map"""
        response = requests.get(f"{BASE_URL}/api/full-test/set/academic_set_h_01?include_answers=false")
        assert response.status_code == 200
        
        data = response.json()
        test = data.get("test", {})
        listening = test.get("sections", {}).get("listening", {})
        parts = listening.get("parts", [])
        
        assert len(parts) >= 2, "Need at least 2 listening parts"
        part2 = parts[1]
        
        # Check title
        assert "Bidcaster" in part2.get("title", ""), "Part 2 title should mention Bidcaster"
        
        # Check visual
        visual = part2.get("visual", {})
        assert visual.get("type") == "map"
        assert visual.get("image_url") == "visual_024_map_bidcaster_dig.png"


class TestVisualImageEndpoint:
    """Tests for GET /api/visuals/image/{name} endpoint"""
    
    @pytest.mark.parametrize("image_name", [
        "visual_001_line_graph_metals",
        "visual_002_line_graph_urbanization",
        "visual_004_bar_chart_us_households",
        "visual_005_floor_plan_library_before",
        "visual_006_map_recreation_after",
        "visual_011_floor_plan_stevenson_site",
        "visual_012_line_graph_appliances",
        "visual_013_line_graph_housework",
        "visual_014_process_sugar_production",
        "visual_020_map_farley_house",
        "visual_024_map_bidcaster_dig",
        "visual_026_floor_plan_library_today",
    ])
    def test_visual_image_served(self, image_name):
        """Visual images should be served correctly (200 status)"""
        response = requests.get(
            f"{BASE_URL}/api/visuals/image/{image_name}",
            timeout=10
        )
        assert response.status_code == 200, f"Visual {image_name} not served (status: {response.status_code})"
        assert len(response.content) > 1000, f"Visual {image_name} appears too small (likely broken)"
    
    def test_nonexistent_visual_returns_404(self):
        """Non-existent visual should return 404"""
        response = requests.get(f"{BASE_URL}/api/visuals/image/nonexistent_visual")
        assert response.status_code == 404


class TestAudioFilesExist:
    """Tests for audio files in new sets F, G, H"""
    
    @pytest.mark.parametrize("set_id", [
        "academic_set_f_01",
        "academic_set_g_01",
        "academic_set_h_01"
    ])
    def test_audio_directory_exists(self, set_id):
        """Audio directories should exist for new sets"""
        import os
        audio_path = f"/app/backend/static/audio/full_tests/{set_id}/listening"
        assert os.path.exists(audio_path), f"Audio directory missing for {set_id}"
        
        # Check that there are some audio files
        files = os.listdir(audio_path) if os.path.exists(audio_path) else []
        assert len(files) > 0, f"No audio files found for {set_id}"


class TestSetSpecificContent:
    """Tests for specific content in sets"""
    
    def test_set_a_writing_task1_urbanization(self):
        """Set A Writing Task 1 should be about urbanization in SE Asian countries"""
        response = requests.get(f"{BASE_URL}/api/full-test/set/academic_set_a_01?include_answers=false")
        assert response.status_code == 200
        
        data = response.json()
        test = data.get("test", {})
        writing = test.get("sections", {}).get("writing", {})
        task1 = writing.get("tasks", [])[0]
        
        assert "South East Asian" in task1.get("prompt", "") or "cities" in task1.get("prompt", "")
        visual_data = task1.get("visual_data", {})
        assert "urbanization" in visual_data.get("image_url", "").lower()
    
    def test_set_f_writing_task1_metal_prices(self):
        """Set F Writing Task 1 should be about metal prices"""
        response = requests.get(f"{BASE_URL}/api/full-test/set/academic_set_f_01?include_answers=false")
        assert response.status_code == 200
        
        data = response.json()
        test = data.get("test", {})
        writing = test.get("sections", {}).get("writing", {})
        task1 = writing.get("tasks", [])[0]
        
        prompt = task1.get("prompt", "").lower()
        assert "metal" in prompt or "prices" in prompt
        visual_data = task1.get("visual_data", {})
        assert "metal" in visual_data.get("image_url", "").lower()
    
    def test_set_h_writing_task1_sugar_process(self):
        """Set H Writing Task 1 should be about sugar production process"""
        response = requests.get(f"{BASE_URL}/api/full-test/set/academic_set_h_01?include_answers=false")
        assert response.status_code == 200
        
        data = response.json()
        test = data.get("test", {})
        writing = test.get("sections", {}).get("writing", {})
        tasks = writing.get("tasks", [])
        
        # Find task 1
        assert len(tasks) >= 1
        task1 = tasks[0]
        visual_data = task1.get("visual_data", {})
        
        # Should have sugar/process visual
        image_url = visual_data.get("image_url", "")
        assert "sugar" in image_url.lower() or "process" in image_url.lower()
