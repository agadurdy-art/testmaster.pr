"""
Test Refactored Routes - Iteration 74
=====================================
Verifies that Auth, Admin, and Payment routes work correctly after
being extracted from server.py into modular router files:
- routes/auth.py: register, login, verify-email, forgot/reset password
- routes/admin.py: users CRUD, seeding, db-status
- routes/payments.py: PayPal, Ko-fi, bank upload, plan info
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "tester@test.com"
TEST_PASSWORD = "tester123"
ADMIN_EMAIL = "aga.durdy@gmail.com"
ADMIN_EMAIL_2 = "admin@ieltsace.com"


class TestAuthRoutes:
    """Test auth routes extracted to routes/auth.py"""
    
    def test_login_success(self):
        """POST /api/auth/login with valid credentials returns user data"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "id" in data, "Response should contain user id"
        assert "email" in data, "Response should contain email"
        assert data["email"] == TEST_EMAIL
        # Verify password_hash is NOT returned
        assert "password_hash" not in data, "password_hash should not be in response"
        print(f"✅ Auth login success: user_id={data.get('id')}")
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Auth login with invalid credentials returns 401")
    
    def test_register_duplicate_email(self):
        """POST /api/auth/register with existing email returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_EMAIL,
            "name": "Duplicate User",
            "password": "password123"
        })
        assert response.status_code == 400, f"Expected 400 for duplicate email, got {response.status_code}"
        data = response.json()
        assert "already registered" in data.get("detail", "").lower() or "already" in data.get("detail", "").lower()
        print("✅ Auth register duplicate email returns 400")
    
    def test_forgot_password(self):
        """POST /api/auth/forgot-password returns success message"""
        response = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": TEST_EMAIL
        })
        assert response.status_code == 200, f"Forgot password failed: {response.text}"
        data = response.json()
        assert "detail" in data
        # Should return generic message for security
        assert "reset link" in data["detail"].lower() or "email" in data["detail"].lower()
        print("✅ Auth forgot-password returns success message")
    
    def test_reset_password_invalid_token(self):
        """POST /api/auth/reset-password with invalid token returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "token": "invalid-token-12345",
            "new_password": "newpassword123"
        })
        assert response.status_code == 400, f"Expected 400 for invalid token, got {response.status_code}"
        print("✅ Auth reset-password with invalid token returns 400")
    
    def test_verify_email_invalid_token(self):
        """POST /api/auth/verify-email with invalid token returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/verify-email", json={
            "token": "invalid-verification-token"
        })
        assert response.status_code == 400, f"Expected 400 for invalid token, got {response.status_code}"
        print("✅ Auth verify-email with invalid token returns 400")
    
    def test_get_user_by_id(self):
        """GET /api/users/{user_id} returns user without password_hash"""
        # First login to get user_id
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200
        user_id = login_resp.json().get("id")
        
        # Now get user by ID
        response = requests.get(f"{BASE_URL}/api/users/{user_id}")
        assert response.status_code == 200, f"Get user failed: {response.text}"
        data = response.json()
        assert data["id"] == user_id
        assert "password_hash" not in data, "password_hash should not be in response"
        print(f"✅ GET /api/users/{user_id} returns user without password_hash")
    
    def test_get_user_not_found(self):
        """GET /api/users/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/users/nonexistent-user-id-12345")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✅ GET /api/users/invalid returns 404")


class TestAdminRoutes:
    """Test admin routes extracted to routes/admin.py"""
    
    def test_admin_users_list_with_auth(self):
        """GET /api/admin/users?admin_email=... returns users array"""
        response = requests.get(f"{BASE_URL}/api/admin/users", params={
            "admin_email": ADMIN_EMAIL
        })
        assert response.status_code == 200, f"Admin users list failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list of users"
        if len(data) > 0:
            # Verify user structure
            user = data[0]
            assert "id" in user or "email" in user
            # Verify password_hash is NOT returned
            assert "password_hash" not in user, "password_hash should not be in admin response"
        print(f"✅ Admin users list returns {len(data)} users")
    
    def test_admin_users_no_auth(self):
        """GET /api/admin/users without admin_email returns 403"""
        response = requests.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 403, f"Expected 403 without admin auth, got {response.status_code}"
        print("✅ Admin users without auth returns 403")
    
    def test_admin_users_invalid_admin(self):
        """GET /api/admin/users with non-admin email returns 403"""
        response = requests.get(f"{BASE_URL}/api/admin/users", params={
            "admin_email": "notanadmin@test.com"
        })
        assert response.status_code == 403, f"Expected 403 for non-admin, got {response.status_code}"
        print("✅ Admin users with non-admin email returns 403")
    
    def test_admin_db_status(self):
        """GET /api/admin/db-status?admin_email=... returns collection counts"""
        response = requests.get(f"{BASE_URL}/api/admin/db-status", params={
            "admin_email": ADMIN_EMAIL
        })
        assert response.status_code == 200, f"Admin db-status failed: {response.text}"
        data = response.json()
        # Should contain collection counts
        assert "users" in data, "Response should contain users count"
        assert isinstance(data["users"], int), "users count should be an integer"
        print(f"✅ Admin db-status returns collection counts: users={data.get('users')}")
    
    def test_admin_db_status_no_auth(self):
        """GET /api/admin/db-status without admin_email returns 403"""
        response = requests.get(f"{BASE_URL}/api/admin/db-status")
        assert response.status_code == 403, f"Expected 403 without admin auth, got {response.status_code}"
        print("✅ Admin db-status without auth returns 403")


class TestPaymentRoutes:
    """Test payment routes extracted to routes/payments.py"""
    
    def test_plan_features(self):
        """GET /api/plan/features returns 5 plans"""
        response = requests.get(f"{BASE_URL}/api/plan/features")
        assert response.status_code == 200, f"Plan features failed: {response.text}"
        data = response.json()
        assert "plans" in data, "Response should contain plans"
        assert "prices" in data, "Response should contain prices"
        plans = data["plans"]
        # Should have free, explorer, learner, achiever, master
        expected_plans = ["free", "explorer", "learner", "achiever", "master"]
        for plan in expected_plans:
            assert plan in plans, f"Missing plan: {plan}"
        print(f"✅ Plan features returns {len(plans)} plans: {list(plans.keys())}")
    
    def test_user_plan_info(self):
        """GET /api/user/plan-info/{email} returns plan info"""
        response = requests.get(f"{BASE_URL}/api/user/plan-info/{TEST_EMAIL}")
        assert response.status_code == 200, f"User plan info failed: {response.text}"
        data = response.json()
        assert "plan" in data, "Response should contain plan"
        assert "features" in data, "Response should contain features"
        print(f"✅ User plan info returns plan={data.get('plan')}")
    
    def test_user_plan_info_not_found(self):
        """GET /api/user/plan-info/{invalid_email} returns 404"""
        response = requests.get(f"{BASE_URL}/api/user/plan-info/nonexistent@test.com")
        assert response.status_code == 404, f"Expected 404 for nonexistent user, got {response.status_code}"
        print("✅ User plan info for nonexistent user returns 404")


class TestOtherRefactoredEndpoints:
    """Test other endpoints that depend on refactored routes"""
    
    def test_liz_status(self):
        """GET /api/liz/status/{user_id} returns access info"""
        # First login to get user_id
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_resp.status_code == 200
        user_id = login_resp.json().get("id")
        
        response = requests.get(f"{BASE_URL}/api/liz/status/{user_id}")
        assert response.status_code == 200, f"Liz status failed: {response.text}"
        data = response.json()
        assert "has_access" in data or "plan" in data, "Response should contain access info"
        print(f"✅ Liz status returns access info: {data.get('has_access', 'N/A')}")
    
    def test_cambridge_books(self):
        """GET /api/cambridge/books returns books"""
        response = requests.get(f"{BASE_URL}/api/cambridge/books")
        assert response.status_code == 200, f"Cambridge books failed: {response.text}"
        data = response.json()
        assert isinstance(data, list) or "books" in data, "Response should contain books"
        print(f"✅ Cambridge books endpoint works")
    
    def test_qb_stats(self):
        """GET /api/question-bank/stats returns question counts"""
        response = requests.get(f"{BASE_URL}/api/question-bank/stats")
        assert response.status_code == 200, f"QB stats failed: {response.text}"
        data = response.json()
        # Should contain question counts
        assert isinstance(data, dict), "Response should be a dict"
        print(f"✅ QB stats returns question counts")
    
    def test_task1_process_curated(self):
        """GET /api/question-bank/writing/task1/generate-authentic?visual_type=process returns image_url"""
        response = requests.get(f"{BASE_URL}/api/question-bank/writing/task1/generate-authentic", params={
            "visual_type": "process"
        })
        assert response.status_code == 200, f"Task1 process failed: {response.text}"
        data = response.json()
        # Should return image_url for curated visuals
        assert "image_url" in data or "question" in data, "Response should contain image_url or question"
        print(f"✅ Task1 process curated returns data")


class TestHealthAndRoot:
    """Test basic health endpoints"""
    
    def test_api_root(self):
        """GET /api/ returns API message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ API root returns: {data.get('message')}")
    
    def test_api_tests_endpoint(self):
        """GET /api/tests returns tests list (verifies backend is working)"""
        response = requests.get(f"{BASE_URL}/api/tests")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ API tests endpoint returns {len(data)} tests")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
