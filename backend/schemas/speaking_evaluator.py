"""
Pydantic schemas for the Speaking Evaluator v2 API.

Mirrors the D7 Speaking Practice UI contract (see
frontend/src/features/speaking/constants.js). The Claude Sonnet prompt at
backend/prompts/speaking-evaluator-v2.md is constrained to match this
schema. If you change this file, update the prompt and the frontend
fixtures together.

Pipeline shape:
  Azure pronunciation assessment ->
    local fluency metrics (WPM, pauses, fillers, unique/total) ->
    Claude Sonnet post-analysis (4 criteria + Liz coach notes +
    per-token pron tier refinement) ->
    SpeakingEvaluationResult
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


SUPPORTED_LANGUAGES = {
    "en", "vi", "tr", "zh", "ar", "ko", "th", "ja", "es", "pt", "ru", "id",
}


class SpeakingPart(str, Enum):
    part1 = "part1"
    part2 = "part2"
    part3 = "part3"


PronTier = Literal["good", "ok", "bad"]
# FC = Fluency/Coherence, LR = Lexical Resource,
# GRA = Grammatical Range/Accuracy, PR = Pronunciation
CriterionKey = Literal["fc", "lr", "gra", "pr"]


def _validate_band(value: float) -> float:
    """Enforce IELTS 0.5-increment bands in [0, 9]."""
    if value < 0 or value > 9:
        raise ValueError("band must be between 0 and 9")
    rounded = round(value * 2) / 2
    if abs(rounded - value) > 1e-6:
        raise ValueError(f"band {value} is not a valid 0.5 increment")
    return rounded


# ---------- Scores ----------


class Scores(BaseModel):
    """Matches SCORES fixture in constants.js."""
    overall: float = Field(..., ge=0, le=9)
    target: float = Field(..., ge=0, le=9)
    fc: float = Field(..., ge=0, le=9)
    lr: float = Field(..., ge=0, le=9)
    gra: float = Field(..., ge=0, le=9)
    pr: float = Field(..., ge=0, le=9)

    @field_validator("overall", "target", "fc", "lr", "gra", "pr")
    @classmethod
    def half_increment(cls, v: float) -> float:
        return _validate_band(v)


# ---------- Criterion detail ----------


class CriterionDetail(BaseModel):
    band: float = Field(..., ge=0, le=9)
    explanation: str = Field(..., min_length=1, max_length=600)
    strengths: List[str] = Field(default_factory=list, max_length=4)
    weaknesses: List[str] = Field(default_factory=list, max_length=4)

    @field_validator("band")
    @classmethod
    def half_increment(cls, v: float) -> float:
        return _validate_band(v)


class CriteriaBreakdown(BaseModel):
    fc: CriterionDetail
    lr: CriterionDetail
    gra: CriterionDetail
    pr: CriterionDetail


# ---------- Fluency ----------


class Fluency(BaseModel):
    """Matches FLUENCY fixture in constants.js. Values are display strings."""
    wpm: int = Field(..., ge=0, le=400)
    pauses: str = Field(..., min_length=1, max_length=60)
    fillers: str = Field(..., min_length=1, max_length=120)
    unique: str = Field(..., min_length=1, max_length=60)
    duration: str = Field(..., min_length=1, max_length=20)
    words: int = Field(..., ge=0)

    @field_validator("wpm", mode="before")
    @classmethod
    def clamp_wpm(cls, v: Any) -> int:
        # Sonnet occasionally hallucinates absurd WPM values (e.g. 1200) when
        # the audio is short or noisy. Clamp into the valid range instead of
        # 422-failing the whole evaluation. 400 WPM is well above any human
        # ceiling (~300); anything higher is a model artefact.
        try:
            n = int(round(float(v)))
        except (TypeError, ValueError):
            return 0
        if n < 0:
            return 0
        if n > 400:
            return 400
        return n


# ---------- Vocabulary profile (CEFR distribution) ----------


class VocabularyProfile(BaseModel):
    """CEFR (A1-C2) vocabulary distribution as percentages of distinct
    content words in the candidate's transcript. Optional — present only
    when the evaluator LLM returns it, since per-word CEFR lookup is
    estimated, not measured. Percentages should sum to ~100 (±2 for
    rounding); the frontend tolerates small drift.

    `c1_c2_examples` and `b2_examples` carry up to 4 verbatim words
    apiece so the UI can show *which* words push the candidate's range
    higher — task #137.
    """
    a1: float = Field(..., ge=0, le=100)
    a2: float = Field(..., ge=0, le=100)
    b1: float = Field(..., ge=0, le=100)
    b2: float = Field(..., ge=0, le=100)
    c1: float = Field(..., ge=0, le=100)
    c2: float = Field(..., ge=0, le=100)
    b2_examples: List[str] = Field(default_factory=list, max_length=4)
    c1_c2_examples: List[str] = Field(default_factory=list, max_length=4)


# ---------- Transcript tokens ----------


class TranscriptToken(BaseModel):
    """
    A run of transcript text. If `pron` is set, the token is a single
    scored word and may include IPA plus a short coach note. Runs of
    non-scored text carry no `pron` field.
    """
    t: str = Field(..., min_length=1)
    pron: Optional[PronTier] = None
    ipa: Optional[str] = Field(None, max_length=40)
    note: Optional[str] = Field(None, max_length=240)


# ---------- Result ----------


class SpeakingEvaluationResult(BaseModel):
    scores: Scores
    criteria: CriteriaBreakdown
    fluency: Fluency
    transcript_tokens: List[TranscriptToken] = Field(..., min_length=1)
    live_transcript_words: List[str] = Field(default_factory=list)
    liz_note: str = Field(..., min_length=1, max_length=1000)
    feedback_language: str = Field(..., min_length=2, max_length=5)
    # Optional Azure-only deep-feedback bundle. Populated post-validation by
    # evaluate_speaking() in full mode; null in basic/Whisper mode. The
    # frontend's PremiumPronunciationDrawer reads these directly — keep the
    # field names aligned with that contract (azure_scores, accuracy_score,
    # problem_phonemes).
    pronunciation_analysis: Optional[Dict[str, Any]] = None
    word_level_results: Optional[List[Dict[str, Any]]] = None
    # Optional CEFR vocabulary distribution (task #137). The evaluator LLM
    # estimates per-level percentages from distinct content words; the UI
    # renders a stacked bar with B2/C1+ example chips. Optional because old
    # cached results pre-#137 won't have it.
    vocabulary_profile: Optional[VocabularyProfile] = None


# ---------- Request ----------


class SpeakingEvaluationRequest(BaseModel):
    """
    Free-form request metadata (audio is sent out-of-band as multipart).
    """
    part: SpeakingPart = SpeakingPart.part2
    cue_card_prompt: str = Field(..., min_length=1, max_length=1000)
    cue_card_bullets: List[str] = Field(default_factory=list, max_length=6)
    user_language: str = Field("en", min_length=2, max_length=5)
    target_band: Optional[float] = Field(7.0, ge=0, le=9)
    duration_seconds: Optional[float] = Field(None, ge=0, le=600)

    @field_validator("user_language")
    @classmethod
    def normalize_language(cls, v: str) -> str:
        lang = v.lower().split("-")[0]
        return lang if lang in SUPPORTED_LANGUAGES else "en"

    @field_validator("target_band")
    @classmethod
    def band_if_given(cls, v: Optional[float]) -> Optional[float]:
        return None if v is None else _validate_band(v)


# ---------- Full Test (holistic) ----------


class FullTestPartInput(BaseModel):
    """One of the three parts in a Full Test submission. Audio is uploaded
    out-of-band as multipart; this object is the per-part metadata."""
    part: SpeakingPart
    cue_card_prompt: str = Field(..., min_length=1, max_length=1000)
    cue_card_bullets: List[str] = Field(default_factory=list, max_length=6)
    duration_seconds: float = Field(0.0, ge=0, le=600)


class FullTestPartInsight(BaseModel):
    """Per-part informational insight — NOT a separately scored band.
    IELTS examiner methodology: a single holistic band is awarded across
    the whole test, not per-part. This carries a transcript snippet, the
    examiner's qualitative observation for that part, and an indicative
    band only for student informational use (clearly labeled in UI)."""
    part: SpeakingPart
    transcript: str = Field(..., min_length=1)
    duration_seconds: float = Field(..., ge=0, le=600)
    indicative_band: float = Field(..., ge=0, le=9)
    observation: str = Field(..., min_length=1, max_length=600)

    @field_validator("indicative_band")
    @classmethod
    def half_increment(cls, v: float) -> float:
        return _validate_band(v)


class SpeakingFullTestEvaluationResult(BaseModel):
    """Holistic Full Test result. Single FC/LR/GRA/PR pass over the whole
    test (concatenated transcripts), with per-part insights as
    informational metadata only."""
    scores: Scores
    criteria: CriteriaBreakdown
    parts: List[FullTestPartInsight] = Field(..., min_length=3, max_length=3)
    liz_note: str = Field(..., min_length=1, max_length=1500)
    feedback_language: str = Field(..., min_length=2, max_length=5)


class SpeakingFullTestEvaluationRequest(BaseModel):
    """Top-level Full Test request envelope (audio per part is multipart)."""
    parts: List[FullTestPartInput] = Field(..., min_length=3, max_length=3)
    user_language: str = Field("en", min_length=2, max_length=5)
    target_band: Optional[float] = Field(7.0, ge=0, le=9)

    @field_validator("user_language")
    @classmethod
    def normalize_language(cls, v: str) -> str:
        lang = v.lower().split("-")[0]
        return lang if lang in SUPPORTED_LANGUAGES else "en"

    @field_validator("target_band")
    @classmethod
    def band_if_given(cls, v: Optional[float]) -> Optional[float]:
        return None if v is None else _validate_band(v)

    @field_validator("parts")
    @classmethod
    def parts_in_order(cls, v: List[FullTestPartInput]) -> List[FullTestPartInput]:
        expected = [SpeakingPart.part1, SpeakingPart.part2, SpeakingPart.part3]
        actual = [p.part for p in v]
        if actual != expected:
            raise ValueError(f"parts must be ordered [part1, part2, part3]; got {actual}")
        return v
