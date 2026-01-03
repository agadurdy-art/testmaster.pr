"""
Test Multi-Language Support and Language Purity
================================================
Tests for the IELTS Ace platform's strict multi-language control system.
Ensures 100% language purity - no language mixing.

Language Rules:
- EN mode: Only English (no TR/VI characters)
- VI mode: Vietnamese (with optional EN support, no TR characters)
- TR mode: Turkish (with optional EN support, no VI characters)

Tests all 12 topics: family, food, animals, colors, numbers, school, 
weather, travel, health, jobs, home, ielts_academic
"""

import pytest
import requests
import os
import re

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Character patterns for language leak detection
TR_CHARS_PATTERN = re.compile(r'[ğĞüÜşŞıİöÖçÇ]')
VI_CHARS_PATTERN = re.compile(r'[ăĂâÂêÊôÔơƠưƯđĐ]|[àáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹầấậẩẫềếệểễồốộổỗờớợởỡừứựửữ]')

# All 12 topics to test
ALL_TOPICS = [
    "family", "food", "animals", "colors", "numbers", "school",
    "weather", "travel", "health", "jobs", "home", "ielts_academic"
]

# All game types
ALL_GAME_TYPES = [
    "matching_pairs", "spelling_bee", "true_false", 
    "word_race", "lucky_wheel", "fishing"
]


def has_turkish_chars(text: str) -> bool:
    """Check if text contains Turkish-specific characters"""
    if not text:
        return False
    return bool(TR_CHARS_PATTERN.search(text))


def has_vietnamese_chars(text: str) -> bool:
    """Check if text contains Vietnamese-specific characters"""
    if not text:
        return False
    return bool(VI_CHARS_PATTERN.search(text))


def extract_all_text_from_response(data: dict) -> str:
    """Recursively extract all text content from API response"""
    texts = []
    
    def extract(obj):
        if isinstance(obj, str):
            texts.append(obj)
        elif isinstance(obj, dict):
            for value in obj.values():
                extract(value)
        elif isinstance(obj, list):
            for item in obj:
                extract(item)
    
    extract(data)
    return " ".join(texts)


class TestGameListMultiLanguage:
    """Test /api/games/list endpoint with different languages"""
    
    def test_list_games_english(self):
        """Test game list returns English content"""
        response = requests.get(f"{BASE_URL}/api/games/list?lang=en")
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "en"
        
        # Check game titles are in English
        for game in data["games"]:
            assert "title" in game
            # English titles should not have TR/VI chars
            assert not has_turkish_chars(game["title"]), f"Turkish chars in EN: {game['title']}"
            assert not has_vietnamese_chars(game["title"]), f"Vietnamese chars in EN: {game['title']}"
    
    def test_list_games_vietnamese(self):
        """Test game list returns Vietnamese content"""
        response = requests.get(f"{BASE_URL}/api/games/list?lang=vi")
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "vi"
        
        # Check that Vietnamese content is present and no Turkish chars
        all_text = extract_all_text_from_response(data)
        assert not has_turkish_chars(all_text), f"Turkish chars found in VI mode: {all_text[:200]}"
    
    def test_list_games_turkish(self):
        """Test game list returns Turkish content"""
        response = requests.get(f"{BASE_URL}/api/games/list?lang=tr")
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "tr"
        
        # Check that Turkish content is present and no Vietnamese chars
        all_text = extract_all_text_from_response(data)
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars found in TR mode: {all_text[:200]}"
    
    def test_list_games_turkish_has_turkish_chars(self):
        """Verify Turkish mode actually contains Turkish characters"""
        response = requests.get(f"{BASE_URL}/api/games/list?lang=tr")
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        # Turkish mode should have Turkish-specific characters
        assert has_turkish_chars(all_text), "Turkish mode should contain Turkish characters"
    
    def test_list_games_vietnamese_has_vietnamese_chars(self):
        """Verify Vietnamese mode actually contains Vietnamese characters"""
        response = requests.get(f"{BASE_URL}/api/games/list?lang=vi")
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        # Vietnamese mode should have Vietnamese-specific characters
        assert has_vietnamese_chars(all_text), "Vietnamese mode should contain Vietnamese characters"
    
    def test_list_returns_12_topics(self):
        """Test that list returns all 12 topics"""
        response = requests.get(f"{BASE_URL}/api/games/list?lang=en")
        data = response.json()
        
        assert "topics" in data
        topic_ids = [t["id"] for t in data["topics"]]
        
        for expected_topic in ALL_TOPICS:
            assert expected_topic in topic_ids, f"Missing topic: {expected_topic}"


class TestMatchingPairsMultiLanguage:
    """Test matching_pairs game with different languages"""
    
    @pytest.mark.parametrize("topic", ALL_TOPICS)
    def test_matching_pairs_english_purity(self, topic):
        """Test matching pairs in English has no TR/VI characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/matching_pairs?topic={topic}&lang=en&count=4")
        
        if response.status_code == 404:
            pytest.skip(f"Topic {topic} not available for matching_pairs")
        
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_turkish_chars(all_text), f"Turkish chars in EN matching_pairs ({topic}): {all_text[:200]}"
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in EN matching_pairs ({topic}): {all_text[:200]}"
    
    @pytest.mark.parametrize("topic", ALL_TOPICS)
    def test_matching_pairs_turkish_no_vietnamese(self, topic):
        """Test matching pairs in Turkish has no Vietnamese characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/matching_pairs?topic={topic}&lang=tr&count=4")
        
        if response.status_code == 404:
            pytest.skip(f"Topic {topic} not available for matching_pairs in TR")
        
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in TR matching_pairs ({topic}): {all_text[:200]}"
    
    @pytest.mark.parametrize("topic", ALL_TOPICS)
    def test_matching_pairs_vietnamese_no_turkish(self, topic):
        """Test matching pairs in Vietnamese has no Turkish characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/matching_pairs?topic={topic}&lang=vi&count=4")
        
        if response.status_code == 404:
            pytest.skip(f"Topic {topic} not available for matching_pairs in VI")
        
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_turkish_chars(all_text), f"Turkish chars in VI matching_pairs ({topic}): {all_text[:200]}"


class TestSpellingBeeMultiLanguage:
    """Test spelling_bee game with different languages"""
    
    @pytest.mark.parametrize("topic", ALL_TOPICS)
    def test_spelling_bee_english_purity(self, topic):
        """Test spelling bee in English has no TR/VI characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/spelling_bee?topic={topic}&lang=en&count=3")
        
        if response.status_code == 404:
            pytest.skip(f"Topic {topic} not available for spelling_bee")
        
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_turkish_chars(all_text), f"Turkish chars in EN spelling_bee ({topic})"
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in EN spelling_bee ({topic})"
    
    @pytest.mark.parametrize("topic", ALL_TOPICS)
    def test_spelling_bee_vietnamese_content(self, topic):
        """Test spelling bee in Vietnamese returns Vietnamese content"""
        response = requests.get(f"{BASE_URL}/api/games/play/spelling_bee?topic={topic}&lang=vi&count=3")
        
        if response.status_code == 404:
            pytest.skip(f"Topic {topic} not available for spelling_bee in VI")
        
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        # Should not have Turkish chars
        assert not has_turkish_chars(all_text), f"Turkish chars in VI spelling_bee ({topic})"
    
    @pytest.mark.parametrize("topic", ALL_TOPICS)
    def test_spelling_bee_turkish_content(self, topic):
        """Test spelling bee in Turkish returns Turkish content"""
        response = requests.get(f"{BASE_URL}/api/games/play/spelling_bee?topic={topic}&lang=tr&count=3")
        
        if response.status_code == 404:
            pytest.skip(f"Topic {topic} not available for spelling_bee in TR")
        
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        # Should not have Vietnamese chars
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in TR spelling_bee ({topic})"


class TestTrueFalseMultiLanguage:
    """Test true_false game with different languages"""
    
    def test_true_false_english_purity(self):
        """Test true/false in English has no TR/VI characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/true_false?lang=en&count=8")
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_turkish_chars(all_text), f"Turkish chars in EN true_false"
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in EN true_false"
    
    def test_true_false_vietnamese_no_turkish(self):
        """Test true/false in Vietnamese has no Turkish characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/true_false?lang=vi&count=8")
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_turkish_chars(all_text), f"Turkish chars in VI true_false"
    
    def test_true_false_turkish_no_vietnamese(self):
        """Test true/false in Turkish has no Vietnamese characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/true_false?lang=tr&count=8")
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in TR true_false"


class TestWordRaceMultiLanguage:
    """Test word_race game with different languages"""
    
    @pytest.mark.parametrize("topic", ALL_TOPICS)
    def test_word_race_english_purity(self, topic):
        """Test word race in English has no TR/VI characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/word_race?topic={topic}&lang=en&count=4")
        
        if response.status_code == 404:
            pytest.skip(f"Topic {topic} not available for word_race")
        
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_turkish_chars(all_text), f"Turkish chars in EN word_race ({topic})"
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in EN word_race ({topic})"
    
    @pytest.mark.parametrize("topic", ALL_TOPICS)
    def test_word_race_turkish_no_vietnamese(self, topic):
        """Test word race in Turkish has no Vietnamese characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/word_race?topic={topic}&lang=tr&count=4")
        
        if response.status_code == 404:
            pytest.skip(f"Topic {topic} not available for word_race in TR")
        
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in TR word_race ({topic})"


class TestLuckyWheelMultiLanguage:
    """Test lucky_wheel game with different languages"""
    
    def test_lucky_wheel_english_purity(self):
        """Test lucky wheel in English has no TR/VI characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/lucky_wheel?lang=en")
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_turkish_chars(all_text), f"Turkish chars in EN lucky_wheel"
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in EN lucky_wheel"
    
    def test_lucky_wheel_vietnamese_no_turkish(self):
        """Test lucky wheel in Vietnamese has no Turkish characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/lucky_wheel?lang=vi")
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_turkish_chars(all_text), f"Turkish chars in VI lucky_wheel"
    
    def test_lucky_wheel_turkish_no_vietnamese(self):
        """Test lucky wheel in Turkish has no Vietnamese characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/lucky_wheel?lang=tr")
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in TR lucky_wheel"


class TestFishingMultiLanguage:
    """Test fishing game with different languages"""
    
    @pytest.mark.parametrize("topic", ALL_TOPICS)
    def test_fishing_english_purity(self, topic):
        """Test fishing in English has no TR/VI characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/fishing?topic={topic}&lang=en&count=4")
        
        if response.status_code == 404:
            pytest.skip(f"Topic {topic} not available for fishing")
        
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_turkish_chars(all_text), f"Turkish chars in EN fishing ({topic})"
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in EN fishing ({topic})"
    
    @pytest.mark.parametrize("topic", ALL_TOPICS)
    def test_fishing_turkish_no_vietnamese(self, topic):
        """Test fishing in Turkish has no Vietnamese characters"""
        response = requests.get(f"{BASE_URL}/api/games/play/fishing?topic={topic}&lang=tr&count=4")
        
        if response.status_code == 404:
            pytest.skip(f"Topic {topic} not available for fishing in TR")
        
        assert response.status_code == 200
        data = response.json()
        
        all_text = extract_all_text_from_response(data)
        assert not has_vietnamese_chars(all_text), f"Vietnamese chars in TR fishing ({topic})"


class TestSubmitMultiLanguage:
    """Test /api/games/submit endpoint with different languages"""
    
    def test_submit_english_message(self):
        """Test submit returns English message"""
        response = requests.post(
            f"{BASE_URL}/api/games/submit/test_game_123?score=9&total=10&lang=en"
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "en"
        assert not has_turkish_chars(data["message"]), f"Turkish chars in EN submit message"
        assert not has_vietnamese_chars(data["message"]), f"Vietnamese chars in EN submit message"
    
    def test_submit_vietnamese_message(self):
        """Test submit returns Vietnamese message"""
        response = requests.post(
            f"{BASE_URL}/api/games/submit/test_game_123?score=9&total=10&lang=vi"
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "vi"
        # Vietnamese message should not have Turkish chars
        assert not has_turkish_chars(data["message"]), f"Turkish chars in VI submit message"
    
    def test_submit_turkish_message(self):
        """Test submit returns Turkish message"""
        response = requests.post(
            f"{BASE_URL}/api/games/submit/test_game_123?score=9&total=10&lang=tr"
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "tr"
        # Turkish message should not have Vietnamese chars
        assert not has_vietnamese_chars(data["message"]), f"Vietnamese chars in TR submit message"
    
    def test_submit_turkish_has_turkish_chars(self):
        """Verify Turkish submit message contains Turkish characters"""
        response = requests.post(
            f"{BASE_URL}/api/games/submit/test_game_123?score=9&total=10&lang=tr"
        )
        data = response.json()
        
        # Turkish message should have Turkish-specific characters
        assert has_turkish_chars(data["message"]), f"Turkish message should contain Turkish chars: {data['message']}"
    
    def test_submit_vietnamese_has_vietnamese_chars(self):
        """Verify Vietnamese submit message contains Vietnamese characters"""
        response = requests.post(
            f"{BASE_URL}/api/games/submit/test_game_123?score=9&total=10&lang=vi"
        )
        data = response.json()
        
        # Vietnamese message should have Vietnamese-specific characters
        assert has_vietnamese_chars(data["message"]), f"Vietnamese message should contain Vietnamese chars: {data['message']}"


class TestHeaderLanguageSupport:
    """Test X-System-Language header support"""
    
    def test_header_overrides_query_param(self):
        """Test that X-System-Language header overrides lang query param"""
        response = requests.get(
            f"{BASE_URL}/api/games/list?lang=en",
            headers={"X-System-Language": "tr"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Header should take precedence
        assert data["language"] == "tr"
    
    def test_header_turkish_returns_turkish(self):
        """Test X-System-Language: tr returns Turkish content"""
        response = requests.get(
            f"{BASE_URL}/api/games/list",
            headers={"X-System-Language": "tr"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "tr"
        all_text = extract_all_text_from_response(data)
        assert has_turkish_chars(all_text), "Turkish header should return Turkish content"
    
    def test_header_vietnamese_returns_vietnamese(self):
        """Test X-System-Language: vi returns Vietnamese content"""
        response = requests.get(
            f"{BASE_URL}/api/games/list",
            headers={"X-System-Language": "vi"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "vi"
        all_text = extract_all_text_from_response(data)
        assert has_vietnamese_chars(all_text), "Vietnamese header should return Vietnamese content"


class TestInvalidLanguageFallback:
    """Test fallback behavior for invalid language codes"""
    
    def test_invalid_lang_falls_back_to_english(self):
        """Test that invalid language code falls back to English"""
        response = requests.get(f"{BASE_URL}/api/games/list?lang=invalid")
        assert response.status_code == 200
        data = response.json()
        
        # Should fall back to English
        assert data["language"] == "en"
    
    def test_empty_lang_falls_back_to_english(self):
        """Test that empty language code falls back to English"""
        response = requests.get(f"{BASE_URL}/api/games/list?lang=")
        assert response.status_code == 200
        data = response.json()
        
        # Should fall back to English
        assert data["language"] == "en"


class TestGameTitlesLocalization:
    """Test that game titles are properly localized"""
    
    def test_matching_pairs_title_english(self):
        """Test matching pairs title in English"""
        response = requests.get(f"{BASE_URL}/api/games/play/matching_pairs?topic=family&lang=en")
        data = response.json()
        
        title = data["game"]["title"]
        assert "Matching Pairs" in title or "matching" in title.lower()
    
    def test_matching_pairs_title_vietnamese(self):
        """Test matching pairs title in Vietnamese"""
        response = requests.get(f"{BASE_URL}/api/games/play/matching_pairs?topic=family&lang=vi")
        data = response.json()
        
        title = data["game"]["title"]
        # Vietnamese title should contain "Ghép cặp"
        assert "Ghép cặp" in title or has_vietnamese_chars(title)
    
    def test_matching_pairs_title_turkish(self):
        """Test matching pairs title in Turkish"""
        response = requests.get(f"{BASE_URL}/api/games/play/matching_pairs?topic=family&lang=tr")
        data = response.json()
        
        title = data["game"]["title"]
        # Turkish title should contain "Eşleştirme"
        assert "Eşleştirme" in title or has_turkish_chars(title)
    
    def test_spelling_bee_title_vietnamese(self):
        """Test spelling bee title in Vietnamese"""
        response = requests.get(f"{BASE_URL}/api/games/play/spelling_bee?topic=family&lang=vi")
        data = response.json()
        
        title = data["game"]["title"]
        # Vietnamese title should contain "Đánh vần"
        assert "Đánh vần" in title or has_vietnamese_chars(title)
    
    def test_spelling_bee_title_turkish(self):
        """Test spelling bee title in Turkish"""
        response = requests.get(f"{BASE_URL}/api/games/play/spelling_bee?topic=family&lang=tr")
        data = response.json()
        
        title = data["game"]["title"]
        # Turkish title should contain "Heceleme"
        assert "Heceleme" in title or has_turkish_chars(title)


class TestTopicTitlesLocalization:
    """Test that topic titles are properly localized"""
    
    def test_family_topic_english(self):
        """Test family topic title in English"""
        response = requests.get(f"{BASE_URL}/api/games/list?lang=en")
        data = response.json()
        
        family_topic = next((t for t in data["topics"] if t["id"] == "family"), None)
        assert family_topic is not None
        assert family_topic["title"] == "Family"
    
    def test_family_topic_vietnamese(self):
        """Test family topic title in Vietnamese"""
        response = requests.get(f"{BASE_URL}/api/games/list?lang=vi")
        data = response.json()
        
        family_topic = next((t for t in data["topics"] if t["id"] == "family"), None)
        assert family_topic is not None
        assert "Gia đình" in family_topic["title"] or has_vietnamese_chars(family_topic["title"])
    
    def test_family_topic_turkish(self):
        """Test family topic title in Turkish"""
        response = requests.get(f"{BASE_URL}/api/games/list?lang=tr")
        data = response.json()
        
        family_topic = next((t for t in data["topics"] if t["id"] == "family"), None)
        assert family_topic is not None
        assert "Aile" in family_topic["title"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
