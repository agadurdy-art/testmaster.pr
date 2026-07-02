"""
Level test — writing module
===========================
Single job: serve level-test writing tasks and evaluate submissions via the
shared writing_evaluator rubric module. Stateless.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

logger = logging.getLogger(__name__)

from writing_evaluator import get_writing_tasks, evaluate_all_writing_tasks

@router.get("/level-test/writing-tasks")
async def get_writing_tasks_endpoint():
    """Get all writing tasks for the level test."""
    tasks = get_writing_tasks()
    return {"tasks": tasks, "total": len(tasks)}


class WritingSubmission(BaseModel):
    task_id: str
    response_text: str


class WritingEvaluationRequest(BaseModel):
    responses: List[WritingSubmission]
    language: Optional[str] = "en"


@router.post("/level-test/evaluate-writing")
async def evaluate_writing(request: WritingEvaluationRequest):
    """Evaluate writing responses and return band score with feedback."""
    try:
        responses = [
            {"task_id": r.task_id, "response_text": r.response_text}
            for r in request.responses
        ]
        
        result = await evaluate_all_writing_tasks(responses, request.language)
        return result
        
    except Exception as e:
        logger.error(f"Writing evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


