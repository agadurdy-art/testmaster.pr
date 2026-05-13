"""
Admin Cost Telemetry Routes — Faz 5.

Exposes the cost roll-ups recorded by `services/cost_telemetry.py` so an admin
can answer "where did the LLM spend go this week, and is anything alerting?"
without grepping logs.

Auth: same pattern as routes/admin.py — `admin_email` query param checked
against `security_utils.is_admin_email`. Not a high-security surface (we only
expose aggregates, no user PII beyond user_id strings) but admin-gated anyway
so it doesn't leak our cost structure publicly.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from security_utils import is_admin_email
from services import cost_telemetry

router = APIRouter(prefix="/api/admin/cost", tags=["admin-cost"])


def _require_admin(admin_email: Optional[str]) -> None:
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/summary")
async def cost_summary(
    days: int = Query(7, ge=1, le=90),
    admin_email: Optional[str] = None,
):
    """Daily + per-scope + per-model cost roll-up for the last N days."""
    _require_admin(admin_email)
    return await cost_telemetry.summarize(days=days)


@router.get("/alerts")
async def recent_alerts(
    limit: int = Query(20, ge=1, le=200),
    admin_email: Optional[str] = None,
):
    """Latest threshold-crossing alerts (rolling 24h spend over LLM_DAILY_COST_ALERT_USD)."""
    _require_admin(admin_email)
    if cost_telemetry._db is None:
        return {"available": False, "alerts": []}
    docs = await cost_telemetry._db.llm_cost_alerts.find(
        {}, {"_id": 0}
    ).sort("ts", -1).to_list(length=limit)
    return {"available": True, "alerts": docs}
