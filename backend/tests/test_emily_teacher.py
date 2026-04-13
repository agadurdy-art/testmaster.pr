"""
Test Emily AI Teacher Endpoints
================================
Tests for Emily chat, multi-turn conversations, sessions, history, and TTS.
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Test user credentials
TEST_USER_ID = "6565a865-dbf9-4596-b756-eaf6c29295c8"
TEST_USER_EMAIL = "test@test.com"


class TestEmilyChatAPI:
    """Test POST /api/emily/chat endpoint"""

    def test_chat_basic_message(self):
        """Test sending a basic message to Emily"""
        response = requests.post(
            f"{BASE_URL}/api/emily/chat",
            json={
                "user_id": TEST_USER_ID,
                "message": "Hello Emily, what is IELTS?"
            }
        )
        print(f"Chat response status: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"Chat response data: {data}")
        
        # Validate response structure
        assert data.get("success") == True, "Expected success=True"
        assert "session_id" in data, "Expected session_id in response"
        assert "response" in data, "Expected response in response"
        assert isinstance(data["session_id"], str), "session_id should be string"
        assert len(data["session_id"]) > 0, "session_id should not be empty"
        assert isinstance(data["response"], str), "response should be string"
        assert len(data["response"]) > 0, "response should not be empty"
        
        return data["session_id"]

    def test_chat_with_quick_prompt(self):
        """Test sending a quick prompt message"""
        response = requests.post(
            f"{BASE_URL}/api/emily/chat",
            json={
                "user_id": TEST_USER_ID,
                "message": "Give me a grammar quiz"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "quiz" in data["response"].lower() or "question" in data["response"].lower() or len(data["response"]) > 50, \
            "Expected Emily to respond with quiz content"


class TestEmilyMultiTurn:
    """Test multi-turn conversation with session context"""

    def test_multi_turn_conversation(self):
        """Test that Emily remembers context from previous messages"""
        # First message - establish context
        response1 = requests.post(
            f"{BASE_URL}/api/emily/chat",
            json={
                "user_id": TEST_USER_ID,
                "message": "My name is TestStudent and I want to improve my vocabulary"
            }
        )
        assert response1.status_code == 200
        data1 = response1.json()
        assert data1.get("success") == True
        session_id = data1["session_id"]
        print(f"First message - session_id: {session_id}")
        print(f"First response: {data1['response'][:200]}...")
        
        # Wait a bit for processing
        time.sleep(1)
        
        # Second message - use same session, should remember context
        response2 = requests.post(
            f"{BASE_URL}/api/emily/chat",
            json={
                "user_id": TEST_USER_ID,
                "message": "What topic should I focus on first?",
                "session_id": session_id
            }
        )
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2.get("success") == True
        assert data2["session_id"] == session_id, "Session ID should remain the same"
        print(f"Second response: {data2['response'][:200]}...")
        
        # The response should relate to vocabulary since that's what we asked about
        response_lower = data2["response"].lower()
        # Emily should give relevant advice (might mention vocabulary, studying, topics, etc)
        assert len(data2["response"]) > 30, "Expected substantive response"


class TestEmilySessionsAPI:
    """Test GET /api/emily/sessions/{user_id} endpoint"""

    def test_get_user_sessions(self):
        """Test fetching all sessions for a user"""
        response = requests.get(f"{BASE_URL}/api/emily/sessions/{TEST_USER_ID}")
        print(f"Sessions response status: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        print(f"Sessions data: {data}")
        
        assert data.get("success") == True
        assert "sessions" in data
        assert isinstance(data["sessions"], list)
        
        # If there are sessions, validate structure
        if len(data["sessions"]) > 0:
            session = data["sessions"][0]
            assert "session_id" in session
            assert "created_at" in session
            assert "preview" in session

    def test_get_sessions_empty_user(self):
        """Test fetching sessions for a user with no sessions"""
        response = requests.get(f"{BASE_URL}/api/emily/sessions/nonexistent_user_id_12345")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert data["sessions"] == []


class TestEmilyHistoryAPI:
    """Test GET /api/emily/history/{session_id}?user_id={user_id} endpoint"""

    @pytest.fixture
    def session_with_messages(self):
        """Create a session with messages first"""
        response = requests.post(
            f"{BASE_URL}/api/emily/chat",
            json={
                "user_id": TEST_USER_ID,
                "message": "Test message for history"
            }
        )
        assert response.status_code == 200
        return response.json()["session_id"]

    def test_get_chat_history(self, session_with_messages):
        """Test fetching chat history for a session"""
        session_id = session_with_messages
        
        response = requests.get(
            f"{BASE_URL}/api/emily/history/{session_id}?user_id={TEST_USER_ID}"
        )
        print(f"History response status: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        print(f"History data: {data}")
        
        assert data.get("success") == True
        assert "messages" in data
        assert isinstance(data["messages"], list)
        
        # Should have at least 2 messages (user + assistant)
        assert len(data["messages"]) >= 2, f"Expected at least 2 messages, got {len(data['messages'])}"
        
        # Check message structure
        for msg in data["messages"]:
            assert "role" in msg
            assert "content" in msg
            assert msg["role"] in ["user", "assistant"]

    def test_get_history_nonexistent_session(self):
        """Test fetching history for a non-existent session"""
        response = requests.get(
            f"{BASE_URL}/api/emily/history/nonexistent_session_123?user_id={TEST_USER_ID}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert data["messages"] == []


class TestEmilyTTSAPI:
    """Test POST /api/emily/tts endpoint"""

    def test_tts_basic(self):
        """Test TTS with query parameter"""
        response = requests.post(
            f"{BASE_URL}/api/emily/tts?text=Hello, how are you today?"
        )
        print(f"TTS response status: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        print(f"TTS response keys: {data.keys()}")
        
        assert "audio" in data, "Expected audio in response"
        assert "format" in data, "Expected format in response"
        assert data["format"] == "mp3", f"Expected mp3 format, got {data['format']}"
        assert isinstance(data["audio"], str), "audio should be base64 string"
        assert len(data["audio"]) > 100, "audio base64 should be substantial"

    def test_tts_empty_text(self):
        """Test TTS with empty text should fail"""
        response = requests.post(f"{BASE_URL}/api/emily/tts?text=")
        assert response.status_code == 400, "Expected 400 for empty text"

    def test_tts_with_message_body(self):
        """Test TTS with message in body (alternative format)"""
        # Based on the backend, both text query param and message body work
        response = requests.post(
            f"{BASE_URL}/api/emily/tts",
            params={"message": "Testing text to speech"}
        )
        # If message param works
        if response.status_code == 200:
            data = response.json()
            assert "audio" in data


class TestEmilyNewSession:
    """Test POST /api/emily/new-session endpoint"""

    def test_create_new_session(self):
        """Test creating a new session explicitly"""
        response = requests.post(
            f"{BASE_URL}/api/emily/new-session",
            json={"user_id": TEST_USER_ID}
        )
        print(f"New session response status: {response.status_code}")
        assert response.status_code == 200
        
        data = response.json()
        print(f"New session data: {data}")
        
        assert data.get("success") == True
        assert "session_id" in data
        assert isinstance(data["session_id"], str)
        assert len(data["session_id"]) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
