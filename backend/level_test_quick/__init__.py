"""
Quick onboarding assessment — 15-18 min adaptive IELTS estimator.

Architecture (Aga 2026-05-23 LOCKED):
- Stage 1 (4 Q): anchor band by 2 reading + 2 listening @ B1-B2
- Stage 2 (4 Q): lock to ±0.5 with calibrated-difficulty 2 reading + 2 listening
- Stage 3: 1 writing micro (100w) + 2 speaking 45s prompts

All evaluation is ZERO marginal cost:
- Reading/Listening: Cambridge raw→band table lookup
- Writing: deterministic heuristic (word count, vocab, cohesion, accuracy)
- Speaking: client-side Web Speech API transcript → server heuristic
- Cohort WOW: static Cambridge English Profile research benchmarks

Paid LLM (Sonnet) and Azure Pronunciation Assessment ONLY fire on the
Weekly+ subscription path, never on this onboarding test.
"""
from .scoring import (
    score_reading_raw,
    score_listening_raw,
    score_writing_heuristic,
    score_speaking_heuristic,
    aggregate_band,
)
from .adaptive import pick_stage2_difficulty, pick_speaking_prompts
from .benchmarks import compare_to_cambridge

__all__ = [
    "score_reading_raw",
    "score_listening_raw",
    "score_writing_heuristic",
    "score_speaking_heuristic",
    "aggregate_band",
    "pick_stage2_difficulty",
    "pick_speaking_prompts",
    "compare_to_cambridge",
]
