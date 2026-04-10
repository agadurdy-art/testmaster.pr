"""
Deploy Readiness Tests - Iteration 73
=====================================
Tests for deploy-readiness changes from branch:
1. Plan system normalization with legacy alias support
2. Liz Teacher plan-based access control
3. Grammar Engine validation layer
4. Cambridge test diagnostics (root_cause_analysis, study_plan)
5. Curated static visual bank for Writing Task 1
6. Lesson Registry enhanced recommendation builder
7. Emily Teacher removal verification
"""

import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test credentials
TEST_EMAIL = "tester@test.com"
TEST_PASSWORD = "tester123"
TEST_USER_ID = "fc113759-b707-47a1-8705-b010368e0555"


class TestHealthCheck:
    """Verify backend is running"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root: {data}")


class TestPlanAccessNormalization:
    """Test plan system normalization with legacy aliases"""
    
    def test_get_plan_features_endpoint(self):
        """GET /api/plan/features should return plan data for all tiers"""
        response = requests.get(f"{BASE_URL}/api/plan/features")
        assert response.status_code == 200
        data = response.json()
        
        # Verify plans structure
        assert "plans" in data
        assert "prices" in data
        
        plans = data["plans"]
        # Check all expected plan tiers exist
        expected_plans = ["free", "explorer", "learner", "achiever", "master"]
        for plan in expected_plans:
            assert plan in plans, f"Missing plan: {plan}"
            print(f"✓ Plan '{plan}' exists with features: {list(plans[plan].keys())}")
        
        # Verify prices
        prices = data["prices"]
        assert "learner" in prices
        assert "achiever" in prices
        assert "master" in prices
        print(f"✓ Prices: {prices}")
    
    def test_legacy_plan_aliases_in_plan_access_module(self):
        """Verify LEGACY_PLAN_ALIASES mapping exists in plan_access.py"""
        # Import the module directly to test the function
        import sys
        sys.path.insert(0, "/app/backend")
        from plan_access import normalize_plan_name, LEGACY_PLAN_ALIASES
        
        # Test legacy aliases
        assert normalize_plan_name("starter") == "learner", "starter should map to learner"
        assert normalize_plan_name("booster") == "achiever", "booster should map to achiever"
        assert normalize_plan_name("pro") == "master", "pro should map to master"
        
        # Test normal plans pass through
        assert normalize_plan_name("free") == "free"
        assert normalize_plan_name("explorer") == "explorer"
        assert normalize_plan_name("learner") == "learner"
        assert normalize_plan_name("achiever") == "achiever"
        assert normalize_plan_name("master") == "master"
        
        # Test edge cases
        assert normalize_plan_name(None) == "free"
        assert normalize_plan_name("") == "free"
        assert normalize_plan_name("  STARTER  ") == "learner"  # Case insensitive + trim
        
        print(f"✓ Legacy aliases verified: {LEGACY_PLAN_ALIASES}")


class TestLizTeacherAccessControl:
    """Test Liz Teacher plan-based access control"""
    
    def test_liz_status_endpoint(self):
        """GET /api/liz/status/{user_id} returns plan info, has_access, usage stats"""
        response = requests.get(f"{BASE_URL}/api/liz/status/{TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "success" in data
        assert "plan" in data
        assert "has_access" in data
        assert "max_messages" in data
        assert "used_messages" in data
        assert "remaining_messages" in data
        assert "default_model" in data
        assert "deep_model" in data
        
        print(f"✓ Liz status for user: plan={data['plan']}, has_access={data['has_access']}")
        print(f"  Messages: {data['used_messages']}/{data['max_messages']}, remaining={data['remaining_messages']}")
        print(f"  Models: default={data['default_model']}, deep={data['deep_model']}")
    
    def test_liz_chat_access_control_free_user(self):
        """POST /api/liz/chat should return 403 for free plan users"""
        # Create a test request with a non-existent user (will default to free plan)
        response = requests.post(
            f"{BASE_URL}/api/liz/chat",
            json={
                "message": "Hello Liz",
                "user_id": "nonexistent-free-user-12345"
            }
        )
        
        # Should return 403 Forbidden for free users
        assert response.status_code == 403, f"Expected 403 for free user, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        assert "Learner" in data["detail"] or "learner" in data["detail"].lower()
        print(f"✓ Liz chat correctly blocked for free user: {data['detail']}")
    
    def test_liz_model_selection(self):
        """Verify model selection logic in liz_teacher.py"""
        import sys
        sys.path.insert(0, "/app/backend")
        from routes.liz_teacher import select_chat_model, LIZ_DEFAULT_MODEL, LIZ_DEEP_MODEL
        
        # Default model for simple chat
        assert select_chat_model("Hello, how are you?") == LIZ_DEFAULT_MODEL
        
        # Deep model for complex tasks
        assert select_chat_model("Create a study plan for me") == LIZ_DEEP_MODEL
        assert select_chat_model("Analyze my progress") == LIZ_DEEP_MODEL
        assert select_chat_model("Evaluate my writing essay") == LIZ_DEEP_MODEL
        
        # Voice messages use deep model
        assert select_chat_model("Hello", is_voice=True) == LIZ_DEEP_MODEL
        
        print(f"✓ Model selection: default={LIZ_DEFAULT_MODEL}, deep={LIZ_DEEP_MODEL}")


class TestQuestionBankStats:
    """Test Question Bank statistics endpoint"""
    
    def test_question_bank_stats(self):
        """GET /api/question-bank/stats returns valid question counts"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "total_questions" in data
        assert "by_skill" in data
        assert "full_tests" in data
        
        # Verify counts are reasonable
        assert data["total_questions"] >= 0
        assert data["full_tests"] >= 0
        
        by_skill = data["by_skill"]
        assert "reading" in by_skill
        assert "listening" in by_skill
        assert "writing" in by_skill
        assert "speaking" in by_skill
        
        print(f"✓ Question Bank stats: total={data['total_questions']}, full_tests={data['full_tests']}")
        print(f"  By skill: {by_skill}")


class TestWritingTask1CuratedVisuals:
    """Test curated static visual bank for Writing Task 1"""
    
    def test_generate_authentic_process_type(self):
        """Writing Task 1 generate-authentic for process type returns curated image_url"""
        response = requests.get(
            f"{BASE_URL}/api/question-bank/writing/task1/generate-authentic",
            params={"visual_type": "process", "topic": "manufacturing", "band_level": "5.5-6.5"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert data["visual_type"] == "process"
        
        # Process type should return image_url (curated), not SVG
        assert "image_url" in data, "Process type should return image_url for curated visual"
        assert data["image_url"] is not None
        assert data["image_url"].startswith("/static/visuals/")
        
        # Should NOT have SVG for process type
        assert data.get("svg") is None, "Process type should not return SVG"
        
        print(f"✓ Process visual: image_url={data['image_url']}")
        print(f"  Task description preview: {data['task_description'][:100]}...")
    
    def test_generate_authentic_map_type(self):
        """Writing Task 1 generate-authentic for map type returns curated image_url"""
        response = requests.get(
            f"{BASE_URL}/api/question-bank/writing/task1/generate-authentic",
            params={"visual_type": "map", "topic": "urban", "band_level": "5.5-6.5"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert data["visual_type"] == "map"
        
        # Map type should return image_url (curated), not SVG
        assert "image_url" in data, "Map type should return image_url for curated visual"
        assert data["image_url"] is not None
        assert data["image_url"].startswith("/static/visuals/")
        
        # Should NOT have SVG for map type
        assert data.get("svg") is None, "Map type should not return SVG"
        
        print(f"✓ Map visual: image_url={data['image_url']}")
        print(f"  Task description preview: {data['task_description'][:100]}...")
    
    def test_generate_authentic_line_graph_returns_svg(self):
        """Line graph type should still return SVG (not curated)"""
        response = requests.get(
            f"{BASE_URL}/api/question-bank/writing/task1/generate-authentic",
            params={"visual_type": "line_graph", "topic": "education", "band_level": "5.5-6.5"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert data["visual_type"] == "line_graph"
        
        # Line graph should return SVG
        assert "svg" in data
        assert data["svg"] is not None
        assert "<svg" in data["svg"]
        
        print(f"✓ Line graph returns SVG (length={len(data['svg'])} chars)")


class TestCambridgeTestDiagnostics:
    """Test Cambridge full-test evaluate endpoint diagnostics"""
    
    def test_cambridge_full_test_evaluate_returns_diagnostics(self):
        """Cambridge full-test evaluate endpoint returns root_cause_analysis and study_plan"""
        # First get a test to know the answer structure
        test_response = requests.get(f"{BASE_URL}/api/cambridge/test/ielts17/test1")
        if test_response.status_code != 200:
            pytest.skip("Cambridge test not available")
        
        # Submit a minimal evaluation request
        eval_response = requests.post(
            f"{BASE_URL}/api/cambridge/evaluate/full-test",
            json={
                "book_id": "ielts17",
                "test_id": "test1",
                "answers": {
                    "listening_1": "wrong answer",
                    "listening_2": "wrong answer",
                    "reading_1": "wrong answer",
                    "reading_2": "wrong answer"
                },
                "user_plan": "free"
            }
        )
        
        assert eval_response.status_code == 200
        data = eval_response.json()
        
        assert data["success"] is True
        
        # Verify root_cause_analysis field exists
        assert "root_cause_analysis" in data, "Missing root_cause_analysis field"
        rca = data["root_cause_analysis"]
        assert isinstance(rca, list), "root_cause_analysis should be a list"
        
        # Verify study_plan field exists
        assert "study_plan" in data, "Missing study_plan field"
        study_plan = data["study_plan"]
        assert isinstance(study_plan, dict), "study_plan should be a dict"
        
        # Verify study_plan structure
        expected_study_plan_keys = ["target_band", "roadmap_steps", "three_day_plan"]
        for key in expected_study_plan_keys:
            assert key in study_plan, f"study_plan missing key: {key}"
        
        print(f"✓ Cambridge diagnostics present:")
        print(f"  root_cause_analysis: {len(rca)} items")
        print(f"  study_plan keys: {list(study_plan.keys())}")
        print(f"  target_band: {study_plan.get('target_band')}")


class TestGrammarEngineValidation:
    """Test Grammar Engine cache validation layer"""
    
    def test_grammar_engine_learn_endpoint(self):
        """GET /api/grammar-engine/{module_id}/learn returns data with validated slides"""
        # Try with a known module ID pattern
        response = requests.get(f"{BASE_URL}/api/grammar-engine/mastery-module-1/learn")
        
        # May return 404 if module doesn't exist, which is acceptable
        if response.status_code == 404:
            print("⚠ Module mastery-module-1 not found, trying alternative...")
            response = requests.get(f"{BASE_URL}/api/grammar-engine/module-1/learn")
        
        if response.status_code == 404:
            pytest.skip("No grammar modules available for testing")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify slides structure
        assert "slides" in data, "Response should contain slides"
        slides = data["slides"]
        assert isinstance(slides, list), "slides should be a list"
        assert len(slides) >= 2, "Should have at least 2 slides"
        
        # Verify each slide has a title (validation check)
        for slide in slides:
            assert "title" in slide, "Each slide should have a title"
            assert len(slide["title"]) > 0, "Slide title should not be empty"
        
        print(f"✓ Grammar engine learn: {len(slides)} slides returned")
        print(f"  Slide types: {[s.get('type', 'unknown') for s in slides]}")
    
    def test_grammar_validation_patterns(self):
        """Verify PLACEHOLDER_PATTERNS exist in grammar_engine.py"""
        import sys
        sys.path.insert(0, "/app/backend")
        from routes.grammar_engine import PLACEHOLDER_PATTERNS, _is_meaningful_text
        
        # Verify patterns exist
        assert isinstance(PLACEHOLDER_PATTERNS, list)
        assert len(PLACEHOLDER_PATTERNS) > 0
        
        # Test validation function
        assert _is_meaningful_text("This is a real sentence.") is True
        assert _is_meaningful_text("option a") is False
        assert _is_meaningful_text("word1") is False
        assert _is_meaningful_text("") is False
        
        print(f"✓ Grammar validation patterns: {len(PLACEHOLDER_PATTERNS)} patterns")
        print(f"  Sample patterns: {PLACEHOLDER_PATTERNS[:3]}")


class TestEmilyTeacherRemoval:
    """Verify Emily Teacher has been removed"""
    
    def test_emily_endpoints_return_404(self):
        """Emily Teacher endpoints should return 404"""
        emily_endpoints = [
            "/api/emily/chat",
            "/api/emily/status",
            "/api/emily/session"
        ]
        
        for endpoint in emily_endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}")
            # Should return 404 (Not Found) since Emily is removed
            assert response.status_code == 404, f"Expected 404 for {endpoint}, got {response.status_code}"
            print(f"✓ {endpoint} returns 404 (Emily removed)")
    
    def test_emily_post_endpoints_return_404(self):
        """Emily Teacher POST endpoints should return 404"""
        response = requests.post(
            f"{BASE_URL}/api/emily/chat",
            json={"message": "test", "user_id": "test"}
        )
        assert response.status_code == 404, f"Expected 404 for POST /api/emily/chat, got {response.status_code}"
        print("✓ POST /api/emily/chat returns 404 (Emily removed)")


class TestAuthFlow:
    """Test authentication flow"""
    
    def test_login_with_test_credentials(self):
        """Login with test credentials works correctly"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # API returns user object directly (not wrapped in "user" key)
        user = data.get("user", data)  # Handle both formats
        assert user["email"] == TEST_EMAIL
        assert "id" in user
        assert "plan" in user
        
        print(f"✓ Login successful: user_id={user['id']}, plan={user['plan']}")


class TestLessonRegistryRecommendations:
    """Test Lesson Registry enhanced recommendation builder"""
    
    def test_lesson_registry_stage_meta(self):
        """Verify STAGE_META exists in lesson_registry.py"""
        import sys
        sys.path.insert(0, "/app/backend")
        from services.lesson_registry import LessonRegistry
        
        # Verify STAGE_META structure
        assert hasattr(LessonRegistry, "STAGE_META")
        stage_meta = LessonRegistry.STAGE_META
        
        expected_stages = ["beginner", "mastery", "advanced"]
        for stage in expected_stages:
            assert stage in stage_meta, f"Missing stage: {stage}"
            assert "course_name" in stage_meta[stage]
            assert "course_path" in stage_meta[stage]
            assert "label" in stage_meta[stage]
        
        print(f"✓ STAGE_META verified: {list(stage_meta.keys())}")
        for stage, meta in stage_meta.items():
            print(f"  {stage}: {meta['course_name']} -> {meta['course_path']}")


class TestFrontendLibHelpers:
    """Test frontend lib helpers exist and have correct exports"""
    
    def test_plan_access_js_exists(self):
        """Verify planAccess.js exists with correct exports"""
        import os
        path = "/app/frontend/src/lib/planAccess.js"
        assert os.path.exists(path), f"Missing file: {path}"
        
        with open(path, "r") as f:
            content = f.read()
        
        # Check for expected exports
        expected_exports = [
            "PLAN_TIERS",
            "LEGACY_PLAN_ALIASES",
            "normalizePlanName",
            "getPlanTier",
            "planMeetsMinimum"
        ]
        
        for export in expected_exports:
            assert export in content, f"Missing export: {export}"
        
        print(f"✓ planAccess.js verified with exports: {expected_exports}")
    
    def test_recommendation_routing_js_exists(self):
        """Verify recommendationRouting.js exists"""
        import os
        path = "/app/frontend/src/lib/recommendationRouting.js"
        assert os.path.exists(path), f"Missing file: {path}"
        
        with open(path, "r") as f:
            content = f.read()
        
        assert "getRecommendedLessonPath" in content
        print("✓ recommendationRouting.js verified")
    
    def test_liz_access_js_exists(self):
        """Verify lizAccess.js exists"""
        import os
        path = "/app/frontend/src/lib/lizAccess.js"
        assert os.path.exists(path), f"Missing file: {path}"
        
        with open(path, "r") as f:
            content = f.read()
        
        assert "canAccessLiz" in content
        assert "planMeetsMinimum" in content
        print("✓ lizAccess.js verified")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
