"""
Grammar Engine payload validators — per-stage LLM output sanity checks.
Extracted from routes/grammar_engine.py (Faz 1 refactor, 2026-07-02).
"""

PLACEHOLDER_PATTERNS = [
    "option a",
    "option b",
    "word1",
    "word2",
    "opt1",
    "opt2",
    "sentence 1",
    "another sentence",
    "correct sentence",
    "incorrect sentence",
    "model response",
]


def _is_meaningful_text(value: str) -> bool:
    text = str(value or "").strip()
    if len(text) < 2:
        return False
    lowered = text.lower()
    return not any(pattern in lowered for pattern in PLACEHOLDER_PATTERNS)


def _validate_options(options, min_count=2):
    if not isinstance(options, list) or len(options) < min_count:
        return False
    normalized = [str(option or "").strip() for option in options]
    if any(not _is_meaningful_text(option) for option in normalized):
        return False
    return len(set(normalized)) == len(normalized)


def _validate_learn_payload(data: dict) -> bool:
    slides = data.get("slides")
    return isinstance(slides, list) and len(slides) >= 2 and all(_is_meaningful_text(slide.get("title", "")) for slide in slides)


def _validate_practice_payload(data: dict) -> bool:
    sections = data.get("sections")
    if not isinstance(sections, list) or len(sections) < 3:
        return False
    for section in sections:
        if not _is_meaningful_text(section.get("title", "")):
            return False
        items = section.get("items")
        if not isinstance(items, list) or not items:
            return False
        for item in items:
            section_type = section.get("type")
            if section_type == "recognition":
                if not _validate_options(item.get("options"), 2) or not isinstance(item.get("correct_index"), int):
                    return False
            elif section_type == "gap_fill":
                if not _is_meaningful_text(item.get("sentence", "")) or not _validate_options(item.get("options"), 4):
                    return False
                if str(item.get("correct", "")).strip() not in item.get("options", []):
                    return False
            elif section_type == "transformation":
                answers = [str(answer or "").strip() for answer in item.get("acceptable_answers", []) if str(answer or "").strip()]
                model_answer = str(item.get("model_answer", "")).strip()
                if not _is_meaningful_text(item.get("original", "")) or not _is_meaningful_text(model_answer):
                    return False
                if not answers or model_answer in answers:
                    return False
            elif section_type == "error_correction":
                if not all(_is_meaningful_text(item.get(key, "")) for key in ["sentence", "error_word", "correct_word", "corrected_sentence"]):
                    return False
    return True


def _validate_quiz_payload(data: dict) -> bool:
    questions = data.get("questions")
    if not isinstance(questions, list) or len(questions) != 10:
        return False
    for question in questions:
        q_type = question.get("type")
        if q_type == "multiple_choice":
            if not _is_meaningful_text(question.get("question", "")) or not _validate_options(question.get("options"), 3):
                return False
            if not isinstance(question.get("correct_index"), int):
                return False
        elif q_type == "gap_fill":
            if not _is_meaningful_text(question.get("sentence", "")) or not _validate_options(question.get("options"), 4):
                return False
            if str(question.get("correct", "")).strip() not in question.get("options", []):
                return False
        elif q_type == "error_detection":
            if not _is_meaningful_text(question.get("sentence", "")) or not isinstance(question.get("has_error"), bool):
                return False
        else:
            return False
    return True


def _validate_prompt_payload(data: dict) -> bool:
    prompts = data.get("prompts")
    return isinstance(prompts, list) and len(prompts) >= 3 and all(
        _is_meaningful_text(prompt.get("prompt", "") or prompt.get("question", ""))
        for prompt in prompts
    )


def _payload_is_valid(stage: str, data: dict) -> bool:
    validators = {
        "learn": _validate_learn_payload,
        "practice": _validate_practice_payload,
        "quiz": _validate_quiz_payload,
        "guided": _validate_prompt_payload,
        "free": _validate_prompt_payload,
    }
    validator = validators.get(stage)
    return validator(data) if validator else True
