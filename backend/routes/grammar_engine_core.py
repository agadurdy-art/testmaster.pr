"""
Grammar Engine core plumbing — shared router, DB handle, Mongo cache
helpers, module grammar lookup, and the LLM call wrapper.
Extracted from routes/grammar_engine.py (Faz 1 refactor, 2026-07-02).
"""

import os
import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from services.llm_compat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/grammar-engine", tags=["Grammar Engine"])

# Will be set from server.py
db = None

def set_db(database):
    global db
    db = database
    # Propagate to sibling modules that use the `db` handle directly.
    from routes import grammar_engine_progress
    grammar_engine_progress.db = database


CACHE_COLLECTION = "grammar_engine_cache"


async def get_cached(module_id: str, stage: str):
    """Get cached grammar engine content"""
    doc = await db[CACHE_COLLECTION].find_one(
        {"module_id": module_id, "stage": stage}, {"_id": 0}
    )
    return doc.get("data") if doc else None


async def set_cached(module_id: str, stage: str, data: dict):
    """Cache grammar engine content"""
    await db[CACHE_COLLECTION].update_one(
        {"module_id": module_id, "stage": stage},
        {"$set": {"module_id": module_id, "stage": stage, "data": data, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )


async def get_module_grammar(module_id: str):
    """Fetch grammar data from mastery or advanced module"""
    module = await db.mastery_course_modules.find_one({"id": module_id}, {"_id": 0})
    source = "mastery"
    if not module:
        module = await db.advanced_mastery_modules.find_one({"id": module_id}, {"_id": 0})
        source = "advanced"
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    grammar = module.get("grammar", {})
    if not grammar:
        raise HTTPException(status_code=404, detail="No grammar content for this module")
    return grammar, module.get("title", ""), source


async def call_llm(system_message: str, prompt: str) -> str:
    """Call LLM and return response text"""
    chat = LlmChat(
        api_key=os.getenv("OPENAI_API_KEY"),
        session_id=str(uuid.uuid4()),
        system_message=system_message,
    ).with_model("openai", "gpt-4o")
    response = await chat.send_message(UserMessage(text=prompt))
    return response.text if hasattr(response, 'text') else str(response)
