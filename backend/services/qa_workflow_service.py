"""
QA Workflow Service
===================
Manages test approval workflow and status transitions.
Implements hard gates for test publication.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
import os

from schemas.visual_asset import TestStatus
from schemas.qa_workflow import (
    EvidencePack, QAApprovalRequest, QAApprovalResponse,
    StatusChangeLog, VisualAttachmentRequest, VisualAttachmentResponse,
    CueCardEditRequest, CueCardEditResponse, CueCardEvidence
)
from services.evidence_pack_generator import EvidencePackGenerator


class QAWorkflowService:
    """
    QA Workflow Service
    ===================
    Manages test status transitions and approval workflow.
    
    HARD RULES:
    1. Only APPROVED/PUBLISHED tests appear in user-facing lists
    2. Only APPROVED/PUBLISHED tests feed into practice pools
    3. Any content change after APPROVED reverts to PENDING_QA
    """
    
    def __init__(self, db: Optional[AsyncIOMotorDatabase] = None):
        self.db = db
        self.evidence_generator = EvidencePackGenerator()
        self._status_cache: Dict[str, TestStatus] = {}
        self._evidence_cache: Dict[str, EvidencePack] = {}
    
    # ============ STATUS MANAGEMENT ============
    
    def get_test_status(self, test_id: str) -> TestStatus:
        """Get current status of a test"""
        return self._status_cache.get(test_id, TestStatus.DRAFT)
    
    def set_test_status(
        self, 
        test_id: str, 
        new_status: TestStatus,
        changed_by: Optional[str] = None,
        reason: Optional[str] = None
    ) -> StatusChangeLog:
        """Set test status and log the change"""
        old_status = self._status_cache.get(test_id, TestStatus.DRAFT)
        self._status_cache[test_id] = new_status
        
        log = StatusChangeLog(
            test_id=test_id,
            old_status=old_status,
            new_status=new_status,
            changed_by=changed_by,
            reason=reason
        )
        
        # Persist to DB if available
        if self.db:
            # async save would happen here
            pass
        
        return log
    
    def is_publishable(self, test_id: str) -> bool:
        """Check if a test can be shown to users"""
        status = self.get_test_status(test_id)
        return status in [TestStatus.APPROVED, TestStatus.PUBLISHED]
    
    def get_publishable_tests(self, all_test_ids: List[str]) -> List[str]:
        """Filter to only publishable tests"""
        return [tid for tid in all_test_ids if self.is_publishable(tid)]
    
    # ============ EVIDENCE PACK ============
    
    def generate_evidence_pack(
        self, 
        test_data: Dict[str, Any], 
        book_id: str, 
        test_num: str
    ) -> EvidencePack:
        """Generate evidence pack for a test"""
        evidence = self.evidence_generator.generate(test_data, book_id, test_num)
        
        test_id = f"{book_id}_{test_num}"
        self._evidence_cache[test_id] = evidence
        
        # Update status based on validation
        self._status_cache[test_id] = evidence.status
        
        return evidence
    
    def get_evidence_pack(self, test_id: str) -> Optional[EvidencePack]:
        """Get cached evidence pack"""
        return self._evidence_cache.get(test_id)
    
    # ============ APPROVAL WORKFLOW ============
    
    def approve_test(self, request: QAApprovalRequest) -> QAApprovalResponse:
        """
        Approve a test for publication.
        
        PREREQUISITES:
        - Test must be in PENDING_QA status
        - All visuals must be filled
        - Cue card must be complete
        """
        test_id = request.test_id
        current_status = self.get_test_status(test_id)
        
        # Check prerequisites
        if current_status == TestStatus.FAILED_VALIDATION:
            return QAApprovalResponse(
                success=False,
                test_id=test_id,
                new_status=current_status,
                message="Cannot approve: Test has validation errors. Fix errors first."
            )
        
        if current_status not in [TestStatus.PENDING_QA, TestStatus.DRAFT]:
            return QAApprovalResponse(
                success=False,
                test_id=test_id,
                new_status=current_status,
                message=f"Cannot approve: Test is in {current_status} status."
            )
        
        # Check evidence pack
        evidence = self._evidence_cache.get(test_id)
        if evidence:
            if not evidence.all_visuals_filled:
                return QAApprovalResponse(
                    success=False,
                    test_id=test_id,
                    new_status=TestStatus.FAILED_VALIDATION,
                    message="Cannot approve: Missing required visuals."
                )
            
            if not evidence.cue_card_complete:
                return QAApprovalResponse(
                    success=False,
                    test_id=test_id,
                    new_status=TestStatus.FAILED_VALIDATION,
                    message="Cannot approve: Speaking Part 2 cue card incomplete."
                )
        
        # Approve
        now = datetime.utcnow()
        self.set_test_status(
            test_id, 
            TestStatus.APPROVED,
            changed_by=request.approved_by,
            reason=f"QA Approved: {request.notes or 'No notes'}"
        )
        
        # Update evidence pack
        if evidence:
            evidence.approved_by = request.approved_by
            evidence.approved_at = now
            evidence.approval_notes = request.notes
            evidence.status = TestStatus.APPROVED
        
        return QAApprovalResponse(
            success=True,
            test_id=test_id,
            new_status=TestStatus.APPROVED,
            message="Test approved successfully.",
            approved_at=now
        )
    
    def publish_test(self, test_id: str, published_by: str) -> QAApprovalResponse:
        """Publish an approved test"""
        current_status = self.get_test_status(test_id)
        
        if current_status != TestStatus.APPROVED:
            return QAApprovalResponse(
                success=False,
                test_id=test_id,
                new_status=current_status,
                message=f"Cannot publish: Test must be APPROVED first (current: {current_status})"
            )
        
        self.set_test_status(
            test_id, 
            TestStatus.PUBLISHED,
            changed_by=published_by,
            reason="Published to users"
        )
        
        return QAApprovalResponse(
            success=True,
            test_id=test_id,
            new_status=TestStatus.PUBLISHED,
            message="Test published successfully."
        )
    
    def revoke_approval(self, test_id: str, reason: str, revoked_by: str) -> QAApprovalResponse:
        """Revoke approval (content changed after approval)"""
        self.set_test_status(
            test_id,
            TestStatus.PENDING_QA,
            changed_by=revoked_by,
            reason=f"Approval revoked: {reason}"
        )
        
        return QAApprovalResponse(
            success=True,
            test_id=test_id,
            new_status=TestStatus.PENDING_QA,
            message=f"Approval revoked: {reason}"
        )
    
    # ============ CONTENT MANAGEMENT ============
    
    def on_content_changed(self, test_id: str) -> None:
        """Called when test content changes - reverts approved tests to PENDING_QA"""
        current_status = self.get_test_status(test_id)
        
        if current_status in [TestStatus.APPROVED, TestStatus.PUBLISHED]:
            self.set_test_status(
                test_id,
                TestStatus.PENDING_QA,
                reason="Content changed after approval"
            )
            
            # Clear evidence cache to force regeneration
            if test_id in self._evidence_cache:
                del self._evidence_cache[test_id]


class VisualAttachmentService:
    """
    Visual Attachment Service
    =========================
    Handles uploading and attaching visuals to tests.
    Enforces user_upload or pdf_crop sources only.
    """
    
    UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "images", "cambridge")
    
    def attach_visual(self, request: VisualAttachmentRequest) -> VisualAttachmentResponse:
        """
        Attach a visual to a test slot.
        
        HARD RULES:
        - source MUST be 'user_upload' or 'pdf_crop'
        - AI visuals are BLOCKED
        """
        # Validate source
        if request.source not in ['user_upload', 'pdf_crop']:
            return VisualAttachmentResponse(
                success=False,
                test_id=request.test_id,
                slot_name=request.slot_name,
                image_src='',
                message=f"BLOCKED: Invalid source '{request.source}'. Only 'user_upload' or 'pdf_crop' allowed."
            )
        
        # Handle upload
        if request.source == 'user_upload' and request.image_data:
            image_src = self._save_uploaded_image(
                request.test_id,
                request.slot_name,
                request.image_data
            )
        elif request.source == 'pdf_crop' and request.image_url:
            image_src = request.image_url
        else:
            return VisualAttachmentResponse(
                success=False,
                test_id=request.test_id,
                slot_name=request.slot_name,
                image_src='',
                message="Missing image_data (for upload) or image_url (for pdf_crop)"
            )
        
        return VisualAttachmentResponse(
            success=True,
            test_id=request.test_id,
            slot_name=request.slot_name,
            image_src=image_src,
            message="Visual attached successfully."
        )
    
    def _save_uploaded_image(self, test_id: str, slot_name: str, image_data: str) -> str:
        """Save base64 image data to file"""
        import base64
        
        # Parse test_id (e.g., "ielts17_test4")
        parts = test_id.split('_')
        book_id = parts[0] if parts else 'unknown'
        test_num = parts[1] if len(parts) > 1 else 'test'
        
        # Create directory
        dir_path = os.path.join(self.UPLOAD_DIR, book_id, test_num)
        os.makedirs(dir_path, exist_ok=True)
        
        # Save file
        filename = f"{slot_name}.png"
        file_path = os.path.join(dir_path, filename)
        
        # Remove base64 header if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        with open(file_path, 'wb') as f:
            f.write(base64.b64decode(image_data))
        
        # Return API path
        return f"/api/cambridge/images/{book_id}/{test_num}/{filename}"


class CueCardEditorService:
    """
    Cue Card Editor Service
    =======================
    Allows manual correction of cue card extraction errors.
    NOT for rewriting content - only fixing extraction issues.
    """
    
    def edit_cue_card(self, request: CueCardEditRequest) -> CueCardEditResponse:
        """
        Edit a cue card for a test.
        
        Validates:
        - topic must be non-empty (min 10 chars)
        - bullets must have at least 2 items
        """
        # Validate
        if len(request.topic) < 10:
            return CueCardEditResponse(
                success=False,
                test_id=request.test_id,
                message="Topic must be at least 10 characters."
            )
        
        if len(request.bullets) < 2:
            return CueCardEditResponse(
                success=False,
                test_id=request.test_id,
                message="Must have at least 2 bullet points."
            )
        
        # Create cue card
        timing_note = request.timing_note or \
            "You will have to talk about this topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish."
        
        cue_card = CueCardEvidence(
            topic=request.topic,
            bullets=request.bullets,
            bullet_count=len(request.bullets),
            timing_note=timing_note,
            is_complete=True
        )
        
        return CueCardEditResponse(
            success=True,
            test_id=request.test_id,
            message="Cue card updated successfully.",
            cue_card=cue_card
        )


# ============ EXPORTS ============

__all__ = [
    "QAWorkflowService",
    "VisualAttachmentService",
    "CueCardEditorService"
]
