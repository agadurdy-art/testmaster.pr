"""
QA Workflow & Evidence Pack Schema
===================================
Human QA mechanism for PDF vs UI comparison.
No approval → test cannot be published.
"""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from schemas.visual_asset import TestStatus


# ============ EVIDENCE PACK COMPONENTS ============

class PassageEvidence(BaseModel):
    """Evidence for a single reading passage"""
    pid: str
    title: str
    first_300_chars: str
    last_300_chars: str
    total_char_count: int
    has_headings: bool
    heading_count: int = 0


class QuestionGroupEvidence(BaseModel):
    """Evidence for a question group"""
    question_range: str  # e.g., "1-6"
    question_type: str
    sample_questions: List[dict]  # 2 sample questions with answers
    count: int


class ReadingEvidence(BaseModel):
    """Complete reading evidence"""
    total_questions: int
    contiguous_check: bool  # 1-40 without gaps
    passages: List[PassageEvidence]
    question_groups: List[QuestionGroupEvidence]


class WritingTask1Evidence(BaseModel):
    """Evidence for Writing Task 1"""
    prompt_text: str
    prompt_length: int
    has_visual: bool
    visual_source: Optional[str] = None  # user_upload or pdf_crop
    visual_kind: Optional[str] = None
    visual_thumbnail_url: Optional[str] = None
    visual_page_num: Optional[int] = None
    visual_bbox: Optional[dict] = None


class WritingTask2Evidence(BaseModel):
    """Evidence for Writing Task 2"""
    prompt_text: str
    prompt_length: int


class WritingEvidence(BaseModel):
    """Complete writing evidence"""
    task1: WritingTask1Evidence
    task2: WritingTask2Evidence


class SpeakingPart1Evidence(BaseModel):
    """Evidence for Speaking Part 1"""
    question_count: int
    audio_only: bool
    topic: Optional[str] = None
    sample_questions: List[str]
    tts_status: str  # pending/ready/not_required


class CueCardEvidence(BaseModel):
    """Evidence for Speaking Part 2 cue card"""
    topic: str
    bullets: List[str]
    bullet_count: int
    timing_note: str
    is_complete: bool


class SpeakingPart2Evidence(BaseModel):
    """Evidence for Speaking Part 2"""
    has_cue_card: bool
    cue_card: Optional[CueCardEvidence] = None


class SpeakingPart3Evidence(BaseModel):
    """Evidence for Speaking Part 3"""
    question_count: int
    audio_only: bool
    topics: List[str]
    sample_questions: List[str]
    tts_status: str


class SpeakingEvidence(BaseModel):
    """Complete speaking evidence"""
    part1: SpeakingPart1Evidence
    part2: SpeakingPart2Evidence
    part3: SpeakingPart3Evidence


class ListeningSectionEvidence(BaseModel):
    """Evidence for a single listening section"""
    section_id: str
    audio_src: str
    audio_exists: bool
    question_count: int
    sample_questions: List[dict]  # 2 samples with answers
    has_answer_spans: bool
    has_map: bool
    map_source: Optional[str] = None


class ListeningEvidence(BaseModel):
    """Complete listening evidence"""
    total_questions: int
    sections: List[ListeningSectionEvidence]


class PDFTraceability(BaseModel):
    """PDF source traceability"""
    pdf_file_ref: Optional[str] = None
    visual_sources: List[dict] = []  # [{slot_name, source, page_num, bbox}]


# ============ EVIDENCE PACK ============

class EvidencePack(BaseModel):
    """
    Complete QA Evidence Pack
    =========================
    Generated automatically for each test.
    Contains all evidence needed for PDF vs UI comparison.
    """
    test_id: str
    book_id: str
    test_number: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Evidence sections
    reading: ReadingEvidence
    writing: WritingEvidence
    speaking: SpeakingEvidence
    listening: ListeningEvidence
    
    # Traceability
    pdf_traceability: PDFTraceability
    
    # Validation summary
    validation_errors: List[str] = []
    validation_warnings: List[str] = []
    all_visuals_filled: bool = False
    cue_card_complete: bool = False
    
    # Status
    status: TestStatus = TestStatus.DRAFT
    
    # Approval
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    approval_notes: Optional[str] = None


# ============ QA APPROVAL ============

class QAApprovalRequest(BaseModel):
    """Request to approve a test"""
    test_id: str
    approved_by: str
    notes: Optional[str] = None


class QAApprovalResponse(BaseModel):
    """Response from approval action"""
    success: bool
    test_id: str
    new_status: TestStatus
    message: str
    approved_at: Optional[datetime] = None


# ============ TEST STATUS CHANGE ============

class StatusChangeLog(BaseModel):
    """Log entry for status changes"""
    test_id: str
    old_status: TestStatus
    new_status: TestStatus
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    changed_by: Optional[str] = None
    reason: Optional[str] = None


# ============ VISUAL ATTACHMENT ============

class VisualAttachmentRequest(BaseModel):
    """Request to attach a visual to a test"""
    test_id: str
    slot_name: str  # e.g., 'writing_task1_visual'
    source: Literal["user_upload", "pdf_crop"]
    image_data: Optional[str] = None  # base64 for upload
    image_url: Optional[str] = None  # URL for pdf_crop
    page_num: Optional[int] = None
    bbox: Optional[dict] = None
    uploaded_by: Optional[str] = None


class VisualAttachmentResponse(BaseModel):
    """Response from visual attachment"""
    success: bool
    test_id: str
    slot_name: str
    image_src: str
    message: str


# ============ CUE CARD EDIT ============

class CueCardEditRequest(BaseModel):
    """Request to edit a cue card (for fixing extraction errors only)"""
    test_id: str
    topic: str = Field(..., min_length=10)
    bullets: List[str] = Field(..., min_items=3)
    timing_note: Optional[str] = None
    edited_by: Optional[str] = None


class CueCardEditResponse(BaseModel):
    """Response from cue card edit"""
    success: bool
    test_id: str
    message: str
    cue_card: Optional[CueCardEvidence] = None


# ============ EXPORTS ============

__all__ = [
    "PassageEvidence",
    "QuestionGroupEvidence",
    "ReadingEvidence",
    "WritingTask1Evidence",
    "WritingTask2Evidence",
    "WritingEvidence",
    "SpeakingPart1Evidence",
    "CueCardEvidence",
    "SpeakingPart2Evidence",
    "SpeakingPart3Evidence",
    "SpeakingEvidence",
    "ListeningSectionEvidence",
    "ListeningEvidence",
    "PDFTraceability",
    "EvidencePack",
    "QAApprovalRequest",
    "QAApprovalResponse",
    "StatusChangeLog",
    "VisualAttachmentRequest",
    "VisualAttachmentResponse",
    "CueCardEditRequest",
    "CueCardEditResponse"
]
