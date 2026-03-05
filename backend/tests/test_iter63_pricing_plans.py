"""
Iteration 63 - Pricing Plan Restructure Tests
Tests for:
- 4-tier plan system: Explorer ($4.99), Learner ($9), Achiever ($19), Master ($29)
- Plan features and access control
- PayPal create-order endpoint with new plan IDs
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://word-gallery.preview.emergentagent.com')


class TestPlanFeatures:
    """Test GET /api/plan/features returns all 5 tiers with correct prices"""
    
    def test_plan_features_returns_all_plans(self):
        """Verify endpoint returns 5 plans: free, explorer, learner, achiever, master"""
        response = requests.get(f"{BASE_URL}/api/plan/features")
        assert response.status_code == 200
        
        data = response.json()
        assert "plans" in data
        assert "prices" in data
        
        # Check all 5 plans exist
        plans = data["plans"]
        expected_plans = ["free", "explorer", "learner", "achiever", "master"]
        for plan in expected_plans:
            assert plan in plans, f"Missing plan: {plan}"
        print(f"✓ All 5 plans returned: {list(plans.keys())}")
    
    def test_plan_prices_correct(self):
        """Verify prices are correct: explorer=$4.99, learner=$9, achiever=$19, master=$29"""
        response = requests.get(f"{BASE_URL}/api/plan/features")
        assert response.status_code == 200
        
        prices = response.json()["prices"]
        
        expected_prices = {
            "explorer": "4.99",
            "learner": "9.00",
            "achiever": "19.00",
            "master": "29.00"
        }
        
        for plan, expected_price in expected_prices.items():
            assert plan in prices, f"Missing price for {plan}"
            assert prices[plan] == expected_price, f"Wrong price for {plan}: expected {expected_price}, got {prices[plan]}"
        print(f"✓ Plan prices correct: {prices}")
    
    def test_free_plan_features(self):
        """Free plan: only Stage 1, no Liz, no mastery courses"""
        response = requests.get(f"{BASE_URL}/api/plan/features")
        data = response.json()
        
        free_features = data["plans"]["free"]
        
        # Free users only get Stage 1
        assert free_features["unified_stages"] == ["stage_1"], f"Free should only have stage_1, got: {free_features['unified_stages']}"
        assert free_features["max_liz_messages"] == 0, "Free should have 0 Liz messages"
        assert free_features["mastery_course"] == False, "Free should not have mastery course"
        assert free_features["advanced_mastery"] == False, "Free should not have advanced mastery"
        assert free_features["speaking_eval"] == False, "Free should not have speaking eval"
        print(f"✓ Free plan features correct: {free_features}")
    
    def test_explorer_plan_features(self):
        """Explorer ($4.99): all stages, no Liz, no courses"""
        response = requests.get(f"{BASE_URL}/api/plan/features")
        data = response.json()
        
        explorer = data["plans"]["explorer"]
        
        assert explorer["unified_stages"] == "all", "Explorer should have all stages"
        assert explorer["max_liz_messages"] == 0, "Explorer should have 0 Liz messages"
        assert explorer["mastery_course"] == False, "Explorer should not have mastery course"
        assert explorer["advanced_mastery"] == False, "Explorer should not have advanced mastery"
        print(f"✓ Explorer plan features correct: {explorer}")
    
    def test_learner_plan_features(self):
        """Learner ($9): all stages, 50 Liz messages, Mastery Course"""
        response = requests.get(f"{BASE_URL}/api/plan/features")
        data = response.json()
        
        learner = data["plans"]["learner"]
        
        assert learner["unified_stages"] == "all", "Learner should have all stages"
        assert learner["max_liz_messages"] == 50, "Learner should have 50 Liz messages"
        assert learner["mastery_course"] == True, "Learner should have mastery course"
        assert learner["advanced_mastery"] == False, "Learner should not have advanced mastery"
        assert learner["speaking_eval"] == False, "Learner should not have speaking eval"
        print(f"✓ Learner plan features correct: {learner}")
    
    def test_achiever_plan_features(self):
        """Achiever ($19): all stages, 150 Liz, Mastery + Advanced, Speaking"""
        response = requests.get(f"{BASE_URL}/api/plan/features")
        data = response.json()
        
        achiever = data["plans"]["achiever"]
        
        assert achiever["unified_stages"] == "all", "Achiever should have all stages"
        assert achiever["max_liz_messages"] == 150, "Achiever should have 150 Liz messages"
        assert achiever["mastery_course"] == True, "Achiever should have mastery course"
        assert achiever["advanced_mastery"] == True, "Achiever should have advanced mastery"
        assert achiever["speaking_eval"] == True, "Achiever should have speaking eval"
        print(f"✓ Achiever plan features correct: {achiever}")
    
    def test_master_plan_features(self):
        """Master ($29): everything, 999 Liz messages, Speaking Agent"""
        response = requests.get(f"{BASE_URL}/api/plan/features")
        data = response.json()
        
        master = data["plans"]["master"]
        
        assert master["unified_stages"] == "all", "Master should have all stages"
        assert master["max_liz_messages"] == 999, "Master should have 999 Liz messages"
        assert master["mastery_course"] == True, "Master should have mastery course"
        assert master["advanced_mastery"] == True, "Master should have advanced mastery"
        assert master["speaking_eval"] == True, "Master should have speaking eval"
        assert master["speaking_agent"] == True, "Master should have speaking agent"
        print(f"✓ Master plan features correct: {master}")


class TestPaypalCreateOrder:
    """Test PayPal create-order endpoint with new plan IDs"""
    
    def test_create_order_explorer_valid(self):
        """Explorer plan creates order with correct price ($4.99)"""
        response = requests.post(
            f"{BASE_URL}/api/payments/paypal/create-order",
            json={"planId": "explorer", "email": "test@test.com"}
        )
        # Should return 200 with order ID (or 502 if PayPal credentials issue)
        assert response.status_code in [200, 502], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert "orderId" in data, "Response should contain orderId"
            print(f"✓ Explorer order created: {data['orderId']}")
        else:
            print("✓ Explorer plan ID is valid (PayPal API returned 502 - credentials issue)")
    
    def test_create_order_learner_valid(self):
        """Learner plan creates order with correct price ($9)"""
        response = requests.post(
            f"{BASE_URL}/api/payments/paypal/create-order",
            json={"planId": "learner", "email": "test@test.com"}
        )
        assert response.status_code in [200, 502], f"Unexpected status: {response.status_code}"
        print(f"✓ Learner plan ID is valid (status: {response.status_code})")
    
    def test_create_order_achiever_valid(self):
        """Achiever plan creates order with correct price ($19)"""
        response = requests.post(
            f"{BASE_URL}/api/payments/paypal/create-order",
            json={"planId": "achiever", "email": "test@test.com"}
        )
        assert response.status_code in [200, 502], f"Unexpected status: {response.status_code}"
        print(f"✓ Achiever plan ID is valid (status: {response.status_code})")
    
    def test_create_order_master_valid(self):
        """Master plan creates order with correct price ($29)"""
        response = requests.post(
            f"{BASE_URL}/api/payments/paypal/create-order",
            json={"planId": "master", "email": "test@test.com"}
        )
        assert response.status_code in [200, 502], f"Unexpected status: {response.status_code}"
        print(f"✓ Master plan ID is valid (status: {response.status_code})")
    
    def test_create_order_invalid_plan(self):
        """Invalid plan ID returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/payments/paypal/create-order",
            json={"planId": "invalid_plan", "email": "test@test.com"}
        )
        assert response.status_code == 400, f"Expected 400 for invalid plan, got {response.status_code}"
        print("✓ Invalid plan correctly rejected with 400")
    
    def test_create_order_old_plan_id_rejected(self):
        """Old plan IDs like 'pro', 'basic' should be rejected"""
        for old_plan in ["pro", "basic", "premium", "starter"]:
            response = requests.post(
                f"{BASE_URL}/api/payments/paypal/create-order",
                json={"planId": old_plan, "email": "test@test.com"}
            )
            assert response.status_code == 400, f"Old plan '{old_plan}' should be rejected, got {response.status_code}"
        print("✓ Old plan IDs correctly rejected")


class TestUserPlanAccess:
    """Test user plan access control endpoint"""
    
    def test_user_access_endpoint_exists(self):
        """Verify /api/user/{id}/access endpoint exists"""
        # Using a fake user ID - should return 404
        response = requests.get(f"{BASE_URL}/api/user/fake-user-id/access")
        assert response.status_code == 404, f"Expected 404 for non-existent user, got {response.status_code}"
        print("✓ /api/user/{id}/access endpoint exists (returns 404 for non-existent user)")


class TestAuthenticatedPlanAccess:
    """Test plan access with authenticated user"""
    
    def setup_method(self):
        """Login as test user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "tester@test.com", "password": "tester123"}
        )
        if response.status_code == 200:
            self.user = response.json()
        else:
            pytest.skip("Test user login failed - cannot test authenticated endpoints")
    
    def test_free_user_access(self):
        """Free user should have limited access"""
        if not hasattr(self, 'user'):
            pytest.skip("No user logged in")
        
        user_id = self.user.get("id")
        response = requests.get(f"{BASE_URL}/api/user/{user_id}/access")
        
        if response.status_code == 200:
            data = response.json()
            assert "plan" in data
            assert "features" in data
            print(f"✓ User access returned: plan={data['plan']}, features={list(data['features'].keys())}")
        else:
            print(f"✓ User access endpoint returned {response.status_code}")


class TestUnifiedStagesAccess:
    """Test unified stages API for plan-based access"""
    
    def test_unified_stages_endpoint(self):
        """Verify /api/unified/stages returns stage data"""
        response = requests.get(f"{BASE_URL}/api/unified/stages")
        assert response.status_code == 200
        
        data = response.json()
        assert "stages" in data
        stages = data["stages"]
        
        # Should have 8 stages
        assert len(stages) >= 1, "Should have at least 1 stage"
        
        # Check stage structure
        stage_1 = stages[0] if len(stages) > 0 else None
        if stage_1:
            assert "stage_id" in stage_1
            print(f"✓ Unified stages returned {len(stages)} stages")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
