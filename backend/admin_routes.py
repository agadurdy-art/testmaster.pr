"""Admin routes for managing test content"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timezone

admin_router = APIRouter(prefix="/admin")

class CreateTest(BaseModel):
    title: str
    test_type: str
    duration: int
    passages: Optional[List[Dict[str, Any]]] = None
    questions: List[Dict[str, Any]]
    answer_key: List[Dict[str, Any]]

@admin_router.post("/tests")
async def create_test(test_data: CreateTest, db):
    """Create a new test with your content"""
    test = {
        "id": str(uuid.uuid4()),
        **test_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tests.insert_one(test)
    return {"message": "Test created successfully", "test_id": test["id"]}

@admin_router.put("/tests/{test_id}")
async def update_test(test_id: str, test_data: CreateTest, db):
    """Update existing test"""
    result = await db.tests.update_one(
        {"id": test_id},
        {"$set": test_data.model_dump()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"message": "Test updated successfully"}

@admin_router.delete("/tests/{test_id}")
async def delete_test(test_id: str, db):
    """Delete a test"""
    result = await db.tests.delete_one({"id": test_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"message": "Test deleted successfully"}
