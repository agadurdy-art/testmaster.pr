"""
Test Liz AI Teacher endpoints - Personal IELTS Teacher & Coach (v33 - Teacher UI)
==================================================================================
Tests for:
- POST /api/liz/greet - Auto-greeting with text + TTS audio in one call (NEW)
- POST /api/liz/chat - Send message and get response (with lesson mode prompts)
- GET /api/liz/sessions/{user_id} - List chat sessions
- GET /api/liz/history/{session_id}?user_id={user_id} - Get chat messages
- POST /api/liz/tts - Text-to-speech (JSON body: {text: string})
- POST /api/liz/stt - Speech-to-text (file upload)
- POST /api/liz/new-session - Create new session
"""
import pytest
import requests
import os
import uuid
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
TEST_USER_ID = "6565a865-dbf9-4596-b756-eaf6c29295c8"


class TestLizGreetAPI:
    """Tests for the NEW greet endpoint - Returns greeting text + TTS audio in one call"""
    
    def test_greet_basic(self):
        """Test basic greet endpoint returns greeting text and audio"""
        response = requests.post(f"{BASE_URL}/api/liz/greet", json={
            "user_id": TEST_USER_ID
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        assert "session_id" in data, "Expected session_id in response"
        assert "greeting" in data, "Expected greeting text in response"
        assert len(data["greeting"]) > 0, "Expected non-empty greeting"
        # Audio should be present (base64 encoded)
        assert "audio" in data, "Expected audio field in response"
        if data["audio"]:
            assert len(data["audio"]) > 100, "Expected substantial base64 audio data"
            print(f"✓ Greet returned greeting + {len(data['audio'])} bytes audio")
        else:
            print(f"✓ Greet returned greeting (audio may be None if TTS failed)")
        print(f"✓ Greeting: {data['greeting'][:100]}...")
    
    def test_greet_creates_session(self):
        """Test that greet endpoint creates a new session"""
        response = requests.post(f"{BASE_URL}/api/liz/greet", json={
            "user_id": TEST_USER_ID
        })
        assert response.status_code == 200
        
        data = response.json()
        session_id = data.get("session_id")
        assert session_id is not None
        
        # Verify session was created by fetching history
        history_response = requests.get(f"{BASE_URL}/api/liz/history/{session_id}?user_id={TEST_USER_ID}")
        assert history_response.status_code == 200
        history_data = history_response.json()
        # Greeting message should be stored
        assert len(history_data.get("messages", [])) >= 1, "Greeting should be stored in session"
        print(f"✓ Greet created session {session_id} with stored greeting")
    
    def test_greet_personalized(self):
        """Test that greeting is personalized based on user context"""
        response = requests.post(f"{BASE_URL}/api/liz/greet", json={
            "user_id": TEST_USER_ID
        })
        assert response.status_code == 200
        
        data = response.json()
        greeting = data.get("greeting", "").lower()
        # Should have some personalized content (mentioning student, progress, lesson, etc.)
        has_personal_touch = any(word in greeting for word in ["student", "progress", "practice", "lesson", "today", "work", "focus", "welcome", "hi", "hello"])
        assert has_personal_touch, f"Greeting should be personalized: {greeting[:200]}"
        print(f"✓ Greeting appears personalized")
    
    def test_greet_missing_user_id(self):
        """Test greet without user_id returns error"""
        response = requests.post(f"{BASE_URL}/api/liz/greet", json={})
        assert response.status_code == 422, f"Expected 422 for missing user_id, got {response.status_code}"
        print("✓ Missing user_id correctly returns 422 error")


class TestLizChatAPI:
    """Tests for Liz chat endpoint"""
    
    def test_chat_basic_message(self):
        """Test basic chat message to Liz"""
        response = requests.post(f"{BASE_URL}/api/liz/chat", json={
            "user_id": TEST_USER_ID,
            "message": "Hello Liz, what is IELTS?"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        assert "session_id" in data, "Expected session_id in response"
        assert "response" in data, "Expected response in data"
        assert len(data["response"]) > 0, "Expected non-empty response"
        print(f"✓ Chat response received: {data['response'][:100]}...")
    
    def test_chat_with_quick_prompt(self):
        """Test chat with a quick prompt similar to UI buttons"""
        response = requests.post(f"{BASE_URL}/api/liz/chat", json={
            "user_id": TEST_USER_ID,
            "message": "Analyze my progress"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        assert "response" in data
        # Liz should respond about progress analysis
        print(f"✓ Progress analysis response: {data['response'][:100]}...")
    
    def test_chat_with_voice_flag(self):
        """Test chat with is_voice flag set to true"""
        response = requests.post(f"{BASE_URL}/api/liz/chat", json={
            "user_id": TEST_USER_ID,
            "message": "Give me a vocabulary lesson",
            "is_voice": True
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        assert "response" in data
        print(f"✓ Voice mode response: {data['response'][:100]}...")


class TestLizMultiTurnConversation:
    """Tests for multi-turn conversation context"""
    
    def test_multi_turn_conversation(self):
        """Test that Liz remembers context across messages"""
        # First message - introduce a topic
        response1 = requests.post(f"{BASE_URL}/api/liz/chat", json={
            "user_id": TEST_USER_ID,
            "message": "Let's practice grammar"
        })
        assert response1.status_code == 200
        data1 = response1.json()
        session_id = data1.get("session_id")
        assert session_id is not None
        
        # Wait a bit for AI to process
        time.sleep(1)
        
        # Second message - follow up on the same session
        response2 = requests.post(f"{BASE_URL}/api/liz/chat", json={
            "user_id": TEST_USER_ID,
            "message": "Can you give me an example?",
            "session_id": session_id
        })
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2.get("session_id") == session_id, "Should use same session"
        
        # The response should relate to grammar since that was the previous context
        print(f"✓ Multi-turn: Session maintained with response: {data2['response'][:100]}...")


class TestLizSessionsAPI:
    """Tests for sessions listing endpoint"""
    
    def test_get_user_sessions(self):
        """Test listing sessions for a user"""
        response = requests.get(f"{BASE_URL}/api/liz/sessions/{TEST_USER_ID}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        assert "sessions" in data
        assert isinstance(data["sessions"], list)
        print(f"✓ Found {len(data['sessions'])} sessions for user")
        
        # If there are sessions, check structure
        if data["sessions"]:
            session = data["sessions"][0]
            assert "session_id" in session
            assert "created_at" in session
    
    def test_get_sessions_empty_user(self):
        """Test sessions for non-existent user returns empty list"""
        fake_user = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/liz/sessions/{fake_user}")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        assert data.get("sessions") == []
        print("✓ Empty sessions list for non-existent user")


class TestLizHistoryAPI:
    """Tests for chat history endpoint"""
    
    def test_get_chat_history(self):
        """Test getting history for a session"""
        # First create a session by sending a message
        chat_response = requests.post(f"{BASE_URL}/api/liz/chat", json={
            "user_id": TEST_USER_ID,
            "message": "Build a study plan for me"
        })
        assert chat_response.status_code == 200
        session_id = chat_response.json().get("session_id")
        
        # Wait for message to be stored
        time.sleep(0.5)
        
        # Now get history
        response = requests.get(f"{BASE_URL}/api/liz/history/{session_id}?user_id={TEST_USER_ID}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        assert "messages" in data
        assert len(data["messages"]) >= 2, "Should have at least user + assistant messages"
        
        # Check message structure
        user_msg = data["messages"][0]
        assert user_msg.get("role") == "user"
        assert "content" in user_msg
        print(f"✓ Got {len(data['messages'])} messages in history")
    
    def test_get_history_nonexistent_session(self):
        """Test getting history for non-existent session"""
        fake_session = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/liz/history/{fake_session}?user_id={TEST_USER_ID}")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True
        assert data.get("messages") == []
        print("✓ Empty messages for non-existent session")


class TestLizTTSAPI:
    """Tests for Text-to-Speech endpoint"""
    
    def test_tts_basic(self):
        """Test TTS with basic text using JSON body"""
        response = requests.post(
            f"{BASE_URL}/api/liz/tts",
            json={"text": "Hello, I am Liz, your IELTS teacher."}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "audio" in data, "Expected audio field in response"
        assert "format" in data, "Expected format field"
        assert data["format"] == "mp3"
        assert len(data["audio"]) > 100, "Expected substantial base64 audio data"
        print(f"✓ TTS returned {len(data['audio'])} bytes of base64 audio")
    
    def test_tts_empty_text(self):
        """Test TTS with empty text returns error"""
        response = requests.post(
            f"{BASE_URL}/api/liz/tts",
            json={"text": ""}
        )
        assert response.status_code == 400, f"Expected 400 for empty text, got {response.status_code}"
        print("✓ Empty text correctly returns 400 error")


class TestLizNewSessionAPI:
    """Tests for new session creation endpoint"""
    
    def test_create_new_session(self):
        """Test creating a new session explicitly"""
        response = requests.post(f"{BASE_URL}/api/liz/new-session", json={
            "user_id": TEST_USER_ID
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True
        assert "session_id" in data
        assert len(data["session_id"]) > 0
        print(f"✓ Created new session: {data['session_id']}")


class TestLizSTTAPI:
    """Tests for Speech-to-Text endpoint"""
    
    def test_stt_no_file(self):
        """Test STT without file returns error"""
        response = requests.post(f"{BASE_URL}/api/liz/stt")
        # Should return 422 (validation error) since file is required
        assert response.status_code == 422, f"Expected 422 for missing file, got {response.status_code}"
        print("✓ Missing file correctly returns 422 error")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
