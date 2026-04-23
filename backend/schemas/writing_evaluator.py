"""
Pydantic schemas for the Writing Evaluator v2 API.

These models are the source of truth for the evaluator's JSON output shape.
The Claude Sonnet prompt (backend/prompts/writing-evaluator-v2.md) is
constrained to match this schema. Client-side validation uses the equivalent
Zod schema at frontend/src/features/evaluator/schemas/writingResult.js.

If you change these models, update both the prompt and the Zod schema.
"""

from __future__ import annotations

from enum import Enum
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


# ---------- Enums ----------


class TaskType(str, Enum):
    task1_academic_chart = "task1_academic_chart"
    task1_academic_map = "task1_academic_map"
    task1_academic_process = "task1_academic_process"
    task1_academic_diagram = "task1_academic_diagram"
    task1_general_formal = "task1_general_formal"
    task1_general_semiformal = "task1_general_semiformal"
    task1_general_informal = "task1_general_informal"
    task2_opinion = "task2_opinion"
    task2_discussion = "task2_discussion"
    task2_problem_solution = "task2_problem_solution"
    task2_advantages_disadvantages = "task2_advantages_disadvantages"
    task2_direct_question = "task2_direct_question"


Category = Literal["TA", "CC", "LR", "GRA"]
Severity = Literal["major", "minor"]

# ISO 639-1 codes we explicitly support. Others are accepted but flagged.
SUPPORTED_LANGUAGES = {
    "en", "vi", "tr", "zh", "ar", "ko", "th", "ja", "es", "pt", "ru", "id",
}


# ---------- Utility: band value validator ----------


def _validate_band(value: float) -> float:
    """
    Enforce IELTS 0.5 band increments in [0, 9].
    Accepts int or float; returns float rounded to nearest 0.5.
    """
    if value < 0 or value > 9:
        raise ValueError("band must be between 0 and 9")
    rounded = round(value * 2) / 2
    if abs(rounded - value) > 1e-6:
        raise ValueError(f"band {value} is not a valid 0.5 increment")
    return rounded


# ---------- Criterion score ----------


class CriterionScore(BaseModel):
    band: float = Field(..., ge=0, le=9, description="IELTS band 0-9, 0.5 increments")
    explanation: str = Field(..., min_length=1, max_length=500)
    # Allow empty arrays: Sonnet sometimes returns [] for a criterion with no
    # clear strengths or weaknesses at the candidate's band. Forcing min_length=1
    # just pushes the model to hallucinate filler — better to let it be honest
    # and let the UI render "None observed" on an empty list.
    strengths: List[str] = Field(default_factory=list, max_length=5)
    weaknesses: List[str] = Field(default_factory=list, max_length=5)

    @field_validator("band")
    @classmethod
    def band_is_half_increment(cls, v: float) -> float:
        return _validate_band(v)


class Criteria(BaseModel):
    task_achievement: CriterionScore
    coherence_cohesion: CriterionScore
    lexical_resource: CriterionScore
    grammatical_range_accuracy: CriterionScore


# ---------- Inline annotation ----------


class InlineAnnotation(BaseModel):
    id: str = Field(..., pattern=r"^ann_\d+$")
    start_offset: int = Field(..., ge=0)
    end_offset: int = Field(..., ge=0)
    original_text: str = Field(..., min_length=1)
    suggested_text: str = Field(..., min_length=0)
    category: Category
    severity: Severity
    explanation: str = Field(..., min_length=1, max_length=300)

    @model_validator(mode="after")
    def end_after_start(self) -> "InlineAnnotation":
        if self.end_offset <= self.start_offset:
            raise ValueError("end_offset must be strictly greater than start_offset")
        # NOTE: we deliberately do NOT require
        #   len(original_text) == end_offset - start_offset
        # here. Models count characters in grapheme clusters while the
        # frontend uses UTF-16 code units — smart quotes, em dashes, CRLF and
        # the occasional emoji all produce off-by-one/two drift. The service
        # layer (writing_evaluator_v2._realign_annotations) repositions these
        # against the source essay before returning the result, so a slightly
        # wrong span here is recoverable instead of fatal.
        return self


# ---------- Extended coaching fields (optional) ----------


class ResponseDiagnosis(BaseModel):
    """
    High-level "what's holding this essay back" summary. Exists in the legacy
    evaluator; carried over so the UI can show a one-glance diagnosis.
    """

    main_issue: str = Field(..., min_length=1, max_length=300)
    band_ceiling_reason: str = Field(..., min_length=1, max_length=300)
    quick_win: str = Field(..., min_length=1, max_length=300)


class RewriteGuidance(BaseModel):
    """
    Paragraph-level rewrite coaching — names the weakest paragraph and offers
    a concrete opening + linking phrases the student can lift.
    """

    weakest_paragraph: str = Field(..., min_length=1, max_length=400)
    suggested_opening: str = Field(..., min_length=1, max_length=400)
    key_linking_phrases: str = Field(..., min_length=1, max_length=400)


class RecommendedLesson(BaseModel):
    """
    One targeted lesson recommendation based on the essay's weakest criterion.
    `lesson_id` / `stage` stay optional so the model can recommend a lesson it
    knows about without needing the routing table.
    """

    title: str = Field(..., min_length=1, max_length=200)
    reason: str = Field(..., min_length=1, max_length=300)
    lesson_id: Optional[str] = Field(default=None, max_length=100)
    stage: Optional[str] = Field(default=None, max_length=50)


# ---------- Top-level result ----------


class WritingEvaluationResult(BaseModel):
    overall_band: float = Field(..., ge=0, le=9)
    word_count: int = Field(..., ge=0)
    word_count_target: int = Field(..., ge=0)
    task_type: TaskType
    criteria: Criteria
    inline_annotations: List[InlineAnnotation] = Field(default_factory=list)
    improved_version: str = Field(..., min_length=0)
    feedback_language: str = Field(..., min_length=2, max_length=5)
    # --- Legacy coaching fields, restored 2026-04-23 ---
    # These were present in the v1 evaluator, dropped in the v2 rewrite, and
    # re-added because the UI used to surface them and teachers rely on them.
    # All four are optional: if Sonnet omits them, the UI simply skips the
    # corresponding panel rather than erroring out.
    response_diagnosis: Optional[ResponseDiagnosis] = None
    highest_priority_fixes: List[str] = Field(default_factory=list, max_length=5)
    rewrite_guidance: Optional[RewriteGuidance] = None
    recommended_lesson: Optional[RecommendedLesson] = None

    @field_validator("overall_band")
    @classmethod
    def overall_is_half_increment(cls, v: float) -> float:
        return _validate_band(v)

    @model_validator(mode="after")
    def overall_matches_criteria_average(self) -> "WritingEvaluationResult":
        """
        Overall band should be the average of 4 criteria rounded to nearest 0.5.
        Allow ±0.5 tolerance since the model may apply expert judgment.
        """
        if self.word_count < 50:
            # Stub result path — skip consistency check
            return self

        avg = (
            self.criteria.task_achievement.band
            + self.criteria.coherence_cohesion.band
            + self.criteria.lexical_resource.band
            + self.criteria.grammatical_range_accuracy.band
        ) / 4.0
        expected = round(avg * 2) / 2
        if abs(self.overall_band - expected) > 0.5:
            raise ValueError(
                f"overall_band {self.overall_band} too far from criteria average "
                f"{expected} (tolerance 0.5)"
            )
        return self

    @model_validator(mode="after")
    def annotations_within_essay(self) -> "WritingEvaluationResult":
        """
        This check needs the original essay to verify offsets. It runs in the
        service layer (not in the schema alone), because the essay text is not
        part of the evaluation result payload. Keep this as a hook / documentation.
        """
        return self


# ---------- Request payload ----------


class WritingEvaluationRequest(BaseModel):
    essay_text: str = Field(..., min_length=1, max_length=10000)
    task_type_hint: Optional[TaskType] = None
    task_prompt: str = Field(..., min_length=1, max_length=2000)
    user_language: str = Field("en", min_length=2, max_length=5)

    @field_validator("user_language")
    @classmethod
    def normalize_language(cls, v: str) -> str:
        lang = v.lower().split("-")[0]
        return lang if lang in SUPPORTED_LANGUAGES else "en"


# ---------- External helper: verify offsets against source essay ----------


def verify_annotation_offsets(
    result: WritingEvaluationResult, essay_text: str
) -> List[str]:
    """
    Check each annotation's offsets against the source essay. Returns a list of
    error messages (empty if all valid). Call this in the service layer after
    schema validation.

    Uses UTF-16 code units to match JavaScript string indexing (which is what
    the frontend AnnotatedText component uses).
    """
    errors: List[str] = []
    utf16 = essay_text.encode("utf-16-le")
    # UTF-16 code units = bytes / 2
    max_code_units = len(utf16) // 2

    for ann in result.inline_annotations:
        if ann.end_offset > max_code_units:
            errors.append(
                f"{ann.id}: end_offset {ann.end_offset} exceeds essay length "
                f"{max_code_units}"
            )
            continue
        # Slice via UTF-16 then decode
        sliced_bytes = utf16[ann.start_offset * 2 : ann.end_offset * 2]
        try:
            sliced = sliced_bytes.decode("utf-16-le")
        except UnicodeDecodeError:
            errors.append(f"{ann.id}: offsets break a surrogate pair")
            continue
        if sliced != ann.original_text:
            errors.append(
                f"{ann.id}: original_text mismatch (expected '{ann.original_text}', "
                f"got '{sliced}')"
            )
    return errors
