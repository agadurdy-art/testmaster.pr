"""
QA Admin Routes
===============
Admin endpoints for QA workflow, evidence packs, and test approval.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Depends
from typing import Optional, List
from datetime import datetime
import os
import sys
import base64

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from security_utils import require_admin_email
import auth_session  # audit F01: real admin-session gate (not just spoofable admin_email)


def _admin_gate(admin_email: str = Query(..., description="Admin email for gating")):
    """Router-level admin gate. Every /api/admin/qa/* endpoint now requires
    ?admin_email=<allowlisted>. Pre-launch audit (2026-05-16) flagged that
    require_admin_email was imported here but never called by any handler,
    so anonymous callers could approve/publish/revoke/attach tests.
    """
    require_admin_email(admin_email)


router = APIRouter(
    prefix="/api/admin/qa",
    tags=["QA Workflow"],
    dependencies=[Depends(_admin_gate), Depends(auth_session.require_admin)],
)

# Import services and schemas
from schemas.visual_asset import TestStatus, VisualValidator, get_required_visual_slots
from schemas.qa_workflow import (
    QAApprovalRequest, VisualAttachmentRequest,
    CueCardEditRequest
)
from services.qa_workflow_service import (
    QAWorkflowService, VisualAttachmentService, CueCardEditorService
)
from services.evidence_pack_generator import EvidencePackGenerator

# Service instances
_qa_service = QAWorkflowService()
_visual_service = VisualAttachmentService()
_cue_card_service = CueCardEditorService()
_evidence_generator = EvidencePackGenerator()


def get_test_data(test_id: str):
    """Get test data from CAMBRIDGE_TESTS"""
    from routes.cambridge import CAMBRIDGE_TESTS
    
    for book_id, book_data in CAMBRIDGE_TESTS.items():
        for tid, test_data in book_data.get("tests", {}).items():
            if f"{book_id}_{tid}" == test_id:
                return test_data, book_id, tid
    
    return None, None, None


# ============ EVIDENCE PACK ENDPOINTS ============

@router.get("/evidence/{test_id}")
async def get_evidence_pack(test_id: str):
    """
    Generate/retrieve QA Evidence Pack for a test.
    Contains all evidence needed for PDF vs UI comparison.
    """
    test_data, book_id, test_num = get_test_data(test_id)
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")
    
    evidence = _qa_service.generate_evidence_pack(test_data, book_id, test_num)
    
    return {
        "success": True,
        "evidence_pack": evidence.dict()
    }


@router.get("/evidence/{test_id}/summary")
async def get_evidence_summary(test_id: str):
    """Get summary of evidence pack (for list views)"""
    test_data, book_id, test_num = get_test_data(test_id)
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")
    
    evidence = _qa_service.generate_evidence_pack(test_data, book_id, test_num)
    
    return {
        "test_id": test_id,
        "status": evidence.status.value,
        "all_visuals_filled": evidence.all_visuals_filled,
        "cue_card_complete": evidence.cue_card_complete,
        "validation_errors_count": len(evidence.validation_errors),
        "validation_warnings_count": len(evidence.validation_warnings),
        "approved_by": evidence.approved_by,
        "approved_at": evidence.approved_at.isoformat() if evidence.approved_at else None
    }


# ============ STATUS ENDPOINTS ============

@router.get("/status/all")
async def get_all_test_statuses():
    """Get status of all tests"""
    from routes.cambridge import CAMBRIDGE_TESTS
    
    results = []
    for book_id, book_data in CAMBRIDGE_TESTS.items():
        for tid, test_data in book_data.get("tests", {}).items():
            if test_data is None:
                continue
            
            test_id = f"{book_id}_{tid}"
            status = _qa_service.get_test_status(test_id)
            
            results.append({
                "test_id": test_id,
                "book": book_id,
                "test": tid,
                "status": status.value,
                "is_publishable": _qa_service.is_publishable(test_id)
            })
    
    return {
        "total": len(results),
        "publishable_count": len([r for r in results if r["is_publishable"]]),
        "tests": results
    }


@router.get("/status/{test_id}")
async def get_test_status(test_id: str):
    """Get current status of a test"""
    test_data, _, _ = get_test_data(test_id)
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")
    
    status = _qa_service.get_test_status(test_id)
    
    return {
        "test_id": test_id,
        "status": status.value,
        "is_publishable": _qa_service.is_publishable(test_id)
    }


@router.get("/publishable")
async def get_publishable_tests():
    """Get list of only publishable tests (APPROVED/PUBLISHED)"""
    from routes.cambridge import CAMBRIDGE_TESTS
    
    publishable = []
    for book_id, book_data in CAMBRIDGE_TESTS.items():
        for tid, test_data in book_data.get("tests", {}).items():
            if test_data is None:
                continue
            
            test_id = f"{book_id}_{tid}"
            if _qa_service.is_publishable(test_id):
                publishable.append({
                    "test_id": test_id,
                    "book": book_id,
                    "test": tid,
                    "status": _qa_service.get_test_status(test_id).value
                })
    
    return {
        "count": len(publishable),
        "tests": publishable
    }


# ============ APPROVAL ENDPOINTS ============

@router.post("/approve")
async def approve_test(
    test_id: str = Form(...),
    approved_by: str = Form(...),
    notes: Optional[str] = Form(None)
):
    """
    Approve a test for publication.
    
    PREREQUISITES:
    - Test must pass validation
    - All visuals must be filled
    - Cue card must be complete
    """
    test_data, book_id, test_num = get_test_data(test_id)
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")
    
    # Generate evidence first to validate
    evidence = _qa_service.generate_evidence_pack(test_data, book_id, test_num)
    
    # Attempt approval
    request = QAApprovalRequest(
        test_id=test_id,
        approved_by=approved_by,
        notes=notes
    )
    
    response = _qa_service.approve_test(request)
    
    return {
        "success": response.success,
        "test_id": response.test_id,
        "new_status": response.new_status.value,
        "message": response.message,
        "approved_at": response.approved_at.isoformat() if response.approved_at else None
    }


@router.post("/publish/{test_id}")
async def publish_test(test_id: str, published_by: str = Form(...)):
    """Publish an approved test to users"""
    test_data, _, _ = get_test_data(test_id)
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")
    
    response = _qa_service.publish_test(test_id, published_by)
    
    return {
        "success": response.success,
        "test_id": response.test_id,
        "new_status": response.new_status.value,
        "message": response.message
    }


@router.post("/revoke/{test_id}")
async def revoke_approval(
    test_id: str,
    reason: str = Form(...),
    revoked_by: str = Form(...)
):
    """Revoke approval (e.g., content changed after approval)"""
    response = _qa_service.revoke_approval(test_id, reason, revoked_by)
    
    return {
        "success": response.success,
        "test_id": response.test_id,
        "new_status": response.new_status.value,
        "message": response.message
    }


# ============ VISUAL ATTACHMENT ENDPOINTS ============

@router.get("/visuals/{test_id}/slots")
async def get_visual_slots(test_id: str):
    """
    Get required visual slots for a test.
    Shows which slots are filled and which are missing.
    """
    test_data, _, _ = get_test_data(test_id)
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")
    
    slots = get_required_visual_slots(test_data)
    
    return {
        "test_id": test_id,
        "total_slots": len(slots),
        "filled_slots": len([s for s in slots if s.get('filled')]),
        "missing_slots": len([s for s in slots if not s.get('filled')]),
        "slots": slots
    }


@router.post("/visuals/attach")
async def attach_visual(
    test_id: str = Form(...),
    slot_name: str = Form(...),
    source: str = Form(...),
    image: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    page_num: Optional[int] = Form(None)
):
    """
    Attach a visual to a test slot.
    
    SOURCES ALLOWED:
    - user_upload: Upload an image file
    - pdf_crop: Provide URL to cropped PDF image
    
    AI VISUALS ARE BLOCKED.
    """
    # Validate source
    if source not in ['user_upload', 'pdf_crop']:
        raise HTTPException(
            status_code=400,
            detail=f"BLOCKED: Invalid source '{source}'. Only 'user_upload' or 'pdf_crop' allowed."
        )
    
    # Handle upload
    image_data = None
    if source == 'user_upload' and image:
        contents = await image.read()
        image_data = base64.b64encode(contents).decode('utf-8')
    
    request = VisualAttachmentRequest(
        test_id=test_id,
        slot_name=slot_name,
        source=source,
        image_data=image_data,
        image_url=image_url,
        page_num=page_num
    )
    
    response = _visual_service.attach_visual(request)
    
    if not response.success:
        raise HTTPException(status_code=400, detail=response.message)
    
    # Invalidate approval if test was approved
    _qa_service.on_content_changed(test_id)
    
    return {
        "success": response.success,
        "test_id": response.test_id,
        "slot_name": response.slot_name,
        "image_src": response.image_src,
        "message": response.message
    }


# ============ CUE CARD EDITOR ENDPOINTS ============

@router.get("/cuecard/{test_id}")
async def get_cue_card(test_id: str):
    """Get current cue card for a test"""
    test_data, _, _ = get_test_data(test_id)
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")
    
    # Extract cue card
    speaking = test_data.get('sections', {}).get('speaking', {})
    if not speaking:
        speaking = test_data.get('speaking', {})
    
    parts = speaking.get('parts', [])
    part2 = next((p for p in parts if p.get('part_number') == 2), {})
    task_card = part2.get('task_card', part2.get('topic_card', {}))
    
    if not task_card:
        return {
            "test_id": test_id,
            "has_cue_card": False,
            "cue_card": None,
            "is_complete": False,
            "error": "MISSING: Speaking Part 2 cue card not found"
        }
    
    topic = task_card.get('instruction', task_card.get('topic', ''))
    bullets = task_card.get('bullets', task_card.get('points', []))
    timing_note = task_card.get('timing_note', '')
    
    return {
        "test_id": test_id,
        "has_cue_card": True,
        "cue_card": {
            "topic": topic,
            "bullets": bullets,
            "bullet_count": len(bullets),
            "timing_note": timing_note
        },
        "is_complete": bool(topic and len(bullets) >= 2)
    }


@router.post("/cuecard/edit")
async def edit_cue_card(
    test_id: str = Form(...),
    topic: str = Form(...),
    bullets: str = Form(...),  # JSON array string
    timing_note: Optional[str] = Form(None),
    edited_by: Optional[str] = Form(None)
):
    """
    Edit cue card for a test.
    For fixing extraction errors only - not for rewriting content.
    """
    import json
    
    try:
        bullets_list = json.loads(bullets)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid bullets format. Must be JSON array.")
    
    request = CueCardEditRequest(
        test_id=test_id,
        topic=topic,
        bullets=bullets_list,
        timing_note=timing_note,
        edited_by=edited_by
    )
    
    response = _cue_card_service.edit_cue_card(request)
    
    if not response.success:
        raise HTTPException(status_code=400, detail=response.message)
    
    # Invalidate approval if test was approved
    _qa_service.on_content_changed(test_id)
    
    return {
        "success": response.success,
        "test_id": response.test_id,
        "message": response.message,
        "cue_card": response.cue_card.dict() if response.cue_card else None
    }


# ============ VALIDATION ENDPOINTS ============

@router.get("/validate/{test_id}")
async def validate_test(test_id: str):
    """
    Run full validation on a test.
    Checks visuals, cue card, and all content.
    """
    test_data, book_id, test_num = get_test_data(test_id)
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")
    
    # Visual validation
    visual_valid, visual_errors = VisualValidator.validate_test_visuals(test_data)
    
    # Generate evidence pack (includes all validation)
    evidence = _qa_service.generate_evidence_pack(test_data, book_id, test_num)
    
    return {
        "test_id": test_id,
        "status": evidence.status.value,
        "valid": evidence.status != TestStatus.FAILED_VALIDATION,
        "visual_valid": visual_valid,
        "visual_errors": visual_errors,
        "all_visuals_filled": evidence.all_visuals_filled,
        "cue_card_complete": evidence.cue_card_complete,
        "validation_errors": evidence.validation_errors,
        "validation_warnings": evidence.validation_warnings
    }


@router.post("/validate/visual")
async def validate_visual_source(
    source: str = Form(...),
    image_url: Optional[str] = Form(None)
):
    """
    Validate a visual source before attachment.
    BLOCKS AI-generated visuals.
    """
    # Check source type
    if source not in ['user_upload', 'pdf_crop']:
        return {
            "valid": False,
            "blocked": True,
            "reason": f"BLOCKED: Source '{source}' not allowed. Only 'user_upload' or 'pdf_crop' permitted."
        }
    
    # Check URL for AI markers
    if image_url:
        for marker in VisualValidator.FORBIDDEN_AI_INDICATORS:
            if marker in image_url.lower():
                return {
                    "valid": False,
                    "blocked": True,
                    "reason": f"BLOCKED: URL contains forbidden AI marker '{marker}'"
                }
    
    return {
        "valid": True,
        "blocked": False,
        "source": source
    }


print("✅ QA Admin routes loaded")
