"""
Language Control Utilities for AI Outputs
==========================================
Ensures AI responses match the system language with strict purity.
"""

import re
from typing import Optional, Tuple

# Character patterns for language leak detection
TR_CHARS_PATTERN = re.compile(r'[ğĞüÜşŞıİöÖçÇ]')
VI_CHARS_PATTERN = re.compile(r'[ăĂâÂêÊôÔơƠưƯđĐ]|[àáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹầấậẩẫềếệểễồốộổỗờớợởỡừứựửữ]')


def get_language_prompt_guard(lang: str) -> str:
    """
    Returns a prompt instruction that enforces language purity in AI outputs.
    
    Args:
        lang: 'en', 'vi', or 'tr'
    
    Returns:
        String to prepend to AI prompts
    """
    guards = {
        'en': """IMPORTANT LANGUAGE RULE: Output ONLY in English. 
Never use Turkish characters (ğüşıöç) or Vietnamese characters (ăâêôơưđ). 
Any non-English output is a critical error.""",
        
        'vi': """IMPORTANT LANGUAGE RULE: Output primarily in Vietnamese.
English may appear only as secondary support text where helpful.
Never use Turkish characters (ğüşıöç).
Primary content must be in Vietnamese.""",
        
        'tr': """ÖNEMLİ DİL KURALI: Çıktıyı yalnızca Türkçe olarak ver.
İngilizce sadece opsiyonel destek metni olarak kullanılabilir.
Asla Vietnamca karakterler (ăâêôơưđ) kullanma.
Ana içerik Türkçe olmalı."""
    }
    
    return guards.get(lang, guards['en'])


def detect_language_leak(text: str, lang: str) -> Optional[dict]:
    """
    Detects forbidden characters in text based on language mode.
    
    Args:
        text: Text to check
        lang: Current system language
    
    Returns:
        Dict with leak info if detected, None if clean
    """
    if not text:
        return None
    
    if lang == 'en':
        if TR_CHARS_PATTERN.search(text):
            return {'type': 'TR_LEAK_IN_EN', 'sample': text[:100]}
        if VI_CHARS_PATTERN.search(text):
            return {'type': 'VI_LEAK_IN_EN', 'sample': text[:100]}
    
    elif lang == 'vi':
        if TR_CHARS_PATTERN.search(text):
            return {'type': 'TR_LEAK_IN_VI', 'sample': text[:100]}
    
    elif lang == 'tr':
        if VI_CHARS_PATTERN.search(text):
            return {'type': 'VI_LEAK_IN_TR', 'sample': text[:100]}
    
    return None


def get_ai_system_message(lang: str, role: str = "examiner") -> str:
    """
    Returns a language-appropriate system message for AI.
    
    Args:
        lang: 'en', 'vi', or 'tr'
        role: Role description (examiner, tutor, etc.)
    
    Returns:
        System message string
    """
    roles = {
        'examiner': {
            'en': "You are an IELTS examiner. Respond only with valid JSON in English.",
            'vi': "Bạn là giám khảo IELTS. Trả lời bằng JSON hợp lệ bằng tiếng Việt.",
            'tr': "Sen bir IELTS sınav görevlisisin. Yalnızca geçerli JSON ile Türkçe yanıt ver."
        },
        'tutor': {
            'en': "You are an English tutor. Provide helpful feedback in English only.",
            'vi': "Bạn là gia sư tiếng Anh. Cung cấp phản hồi hữu ích bằng tiếng Việt.",
            'tr': "Sen bir İngilizce öğretmenisin. Türkçe olarak yararlı geri bildirim ver."
        },
        'pronunciation': {
            'en': "You are a pronunciation coach. Give feedback in English.",
            'vi': "Bạn là huấn luyện viên phát âm. Đưa ra phản hồi bằng tiếng Việt.",
            'tr': "Sen bir telaffuz koçusun. Türkçe geri bildirim ver."
        }
    }
    
    return roles.get(role, roles['examiner']).get(lang, roles[role]['en'])


def get_feedback_labels(lang: str) -> dict:
    """
    Returns localized labels for feedback categories.
    """
    labels = {
        'en': {
            'overall_band': 'Overall Band',
            'fluency_coherence': 'Fluency & Coherence',
            'lexical_resource': 'Lexical Resource',
            'grammatical_range': 'Grammatical Range & Accuracy',
            'pronunciation': 'Pronunciation',
            'feedback': 'Feedback',
            'strengths': 'Strengths',
            'weaknesses': 'Areas for Improvement',
            'tip': 'Tip for Improvement'
        },
        'vi': {
            'overall_band': 'Band điểm tổng',
            'fluency_coherence': 'Độ lưu loát & Mạch lạc',
            'lexical_resource': 'Vốn từ vựng',
            'grammatical_range': 'Phạm vi & Độ chính xác ngữ pháp',
            'pronunciation': 'Phát âm',
            'feedback': 'Nhận xét',
            'strengths': 'Điểm mạnh',
            'weaknesses': 'Điểm cần cải thiện',
            'tip': 'Mẹo cải thiện'
        },
        'tr': {
            'overall_band': 'Genel Bant',
            'fluency_coherence': 'Akıcılık & Tutarlılık',
            'lexical_resource': 'Kelime Bilgisi',
            'grammatical_range': 'Gramer Kapsamı & Doğruluğu',
            'pronunciation': 'Telaffuz',
            'feedback': 'Geri Bildirim',
            'strengths': 'Güçlü Yönler',
            'weaknesses': 'Geliştirilecek Alanlar',
            'tip': 'İyileştirme İpucu'
        }
    }
    
    return labels.get(lang, labels['en'])


def wrap_ai_prompt_with_language_guard(prompt: str, lang: str) -> str:
    """
    Wraps an AI prompt with language guard instructions.
    
    Args:
        prompt: Original prompt
        lang: Target language
    
    Returns:
        Prompt with language guard prepended
    """
    guard = get_language_prompt_guard(lang)
    return f"{guard}\n\n{prompt}"


print("✅ Language utilities loaded")
