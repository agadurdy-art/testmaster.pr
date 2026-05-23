"""
Stage 2 difficulty routing based on Stage 1 anchor score.

Anchor scoring out of 4 (2 reading + 2 listening, all B1-B2 register).
"""
from .content.reading_passages import passage_for_difficulty as _reading_for
from .content.listening_clips import clip_for_difficulty as _listening_for
from .content.writing_prompts import prompt_for_combined_score as _writing_for
from .content.speaking_prompts import prompts_for_combined_score as _speaking_for


def pick_stage2_difficulty(stage1_correct: int) -> dict:
    """
    Given Stage 1 anchor result (0-4 correct), return the Stage 2 content
    selection.

    Returns: { "passage_id": str, "clip_id": str, "level_label": str }
    """
    if stage1_correct >= 4:
        level = "C1"
        label = "Advanced — testing band 7+"
    elif stage1_correct >= 3:
        level = "B2"
        label = "Upper-intermediate — testing band 6-7"
    elif stage1_correct >= 2:
        level = "B2"
        label = "Intermediate — testing band 5.5-6.5"
    else:
        level = "B1"
        label = "Foundation — testing band 4-5.5"

    passage = _reading_for(level)
    clip = _listening_for(level)

    return {
        "level": level,
        "level_label": label,
        "passage_id": passage["id"] if passage else None,
        "clip_id": clip["id"] if clip else None,
    }


def pick_writing_prompt(combined_correct: int, total: int = 8) -> dict:
    return _writing_for(combined_correct, total)


def pick_speaking_prompts(combined_correct: int, total: int = 8) -> list[str]:
    """Returns ordered list of prompt IDs."""
    return _speaking_for(combined_correct, total)
