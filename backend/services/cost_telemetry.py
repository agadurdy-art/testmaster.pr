"""
LLM cost telemetry — Faz 5.

Records every paid LLM call into Mongo (`llm_cost_events`) so admins can see
exactly where the spend is going (which scope, which model, which user).
Non-fatal by design: if Mongo is down or the recorder is unset, calls become
no-ops — telemetry must never break an evaluation.

Wired from `services/liz_llm.complete()` (single chokepoint for Sonnet/OpenAI
traffic). Each call site passes a `scope` string ("writing_eval_v2",
"speaking_eval_part1", etc.) so the admin summary can roll up by feature.

Threshold alerts: when the rolling 24h spend crosses `LLM_DAILY_COST_ALERT_USD`
(env var, default 50) we log a WARNING and write an `llm_cost_alert` doc so the
admin dashboard can surface it. Email/Slack delivery is intentionally deferred
to a follow-up — the priority here is *visibility*, not paging.
"""
from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

# Module-level handles; populated by `init_telemetry(db)` at app startup.
_db = None
_alert_threshold_usd: float = float(os.environ.get("LLM_DAILY_COST_ALERT_USD", "50"))
_last_alert_at: Optional[datetime] = None
_ALERT_COOLDOWN_MINUTES = 60  # don't spam logs if we cross the threshold


# Per-million-token pricing (USD). Numbers as of 2026-05 from each vendor's
# public pricing page. Cached input on Anthropic is 10% of standard input.
#
# Keep this table conservative — if a new model shows up we fall back to the
# closest match and tag the event with `pricing_source="fallback"` so the
# admin can spot it and update the table.
PRICING_USD_PER_M = {
    # Anthropic
    "claude-opus-4-7":      {"input": 15.00, "output": 75.00, "cached_input": 1.50},
    "claude-opus-4-6":      {"input": 15.00, "output": 75.00, "cached_input": 1.50},
    "claude-sonnet-4-6":    {"input": 3.00,  "output": 15.00, "cached_input": 0.30},
    "claude-sonnet-4-5":    {"input": 3.00,  "output": 15.00, "cached_input": 0.30},
    "claude-haiku-4-5":     {"input": 1.00,  "output": 5.00,  "cached_input": 0.10},
    "claude-haiku-4-5-20251001": {"input": 1.00, "output": 5.00, "cached_input": 0.10},
    # OpenAI (legacy GPT-4o path)
    "gpt-4o":     {"input": 2.50,  "output": 10.00, "cached_input": 1.25},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60,  "cached_input": 0.075},
}


def init_telemetry(db) -> None:
    """Inject the Mongo handle at app startup."""
    global _db
    _db = db


def _resolve_pricing(model: str) -> tuple[Dict[str, float], str]:
    """Return (pricing_row, source). Falls back to sonnet pricing if unknown."""
    if model in PRICING_USD_PER_M:
        return PRICING_USD_PER_M[model], "table"
    # Heuristic fallback by family substring
    for key, row in PRICING_USD_PER_M.items():
        if key.split("-")[0] in model and key.split("-")[1] in model:
            return row, f"fallback:{key}"
    return PRICING_USD_PER_M["claude-sonnet-4-6"], "fallback:sonnet-default"


def estimate_cost_usd(
    model: str,
    *,
    input_tokens: int,
    output_tokens: int,
    cached_input_tokens: int = 0,
) -> tuple[float, str]:
    """Return (cost_usd, pricing_source).

    Anthropic reports cached input tokens separately; we charge them at the
    cached rate and the remaining (non-cached) input at the standard rate.
    """
    row, source = _resolve_pricing(model)
    non_cached_input = max(0, input_tokens - cached_input_tokens)
    cost = (
        non_cached_input * row["input"]
        + cached_input_tokens * row["cached_input"]
        + output_tokens * row["output"]
    ) / 1_000_000
    return round(cost, 6), source


async def record_llm_call(
    *,
    provider: str,
    model: str,
    scope: str,
    input_tokens: int,
    output_tokens: int,
    cached_input_tokens: int = 0,
    duration_ms: Optional[int] = None,
    user_id: Optional[str] = None,
    request_id: Optional[str] = None,
    success: bool = True,
    error: Optional[str] = None,
) -> None:
    """Persist one telemetry event. Safe to call even if db is unset.

    Caller should `asyncio.create_task(...)` this to keep the LLM hot-path
    non-blocking.
    """
    if _db is None:
        return
    try:
        cost_usd, pricing_source = estimate_cost_usd(
            model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cached_input_tokens=cached_input_tokens,
        )
        doc: Dict[str, Any] = {
            "ts": datetime.now(timezone.utc),
            "provider": provider,
            "model": model,
            "scope": scope,
            "input_tokens": int(input_tokens),
            "output_tokens": int(output_tokens),
            "cached_input_tokens": int(cached_input_tokens),
            "cost_usd": cost_usd,
            "pricing_source": pricing_source,
            "success": bool(success),
        }
        if duration_ms is not None:
            doc["duration_ms"] = int(duration_ms)
        if user_id:
            doc["user_id"] = user_id
        if request_id:
            doc["request_id"] = request_id
        if error:
            doc["error"] = str(error)[:500]

        await _db.llm_cost_events.insert_one(doc)

        # Threshold check runs after every insert but is rate-limited so a
        # spike doesn't flood the logs. Cheap aggregation (24h window).
        await _maybe_alert_on_threshold()
    except Exception as e:
        # Telemetry must never break the caller. Log and move on.
        logger.warning("cost_telemetry insert failed: %s", e)


async def _maybe_alert_on_threshold() -> None:
    global _last_alert_at
    now = datetime.now(timezone.utc)
    if _last_alert_at and (now - _last_alert_at) < timedelta(minutes=_ALERT_COOLDOWN_MINUTES):
        return
    try:
        since = now - timedelta(hours=24)
        cursor = _db.llm_cost_events.aggregate([
            {"$match": {"ts": {"$gte": since}}},
            {"$group": {"_id": None, "total": {"$sum": "$cost_usd"}}},
        ])
        agg = await cursor.to_list(length=1)
        total = float(agg[0]["total"]) if agg else 0.0
        if total >= _alert_threshold_usd:
            _last_alert_at = now
            logger.warning(
                "LLM cost alert: rolling 24h spend $%.2f >= threshold $%.2f",
                total, _alert_threshold_usd,
            )
            await _db.llm_cost_alerts.insert_one({
                "ts": now,
                "rolling_24h_usd": total,
                "threshold_usd": _alert_threshold_usd,
            })
    except Exception as e:
        logger.debug("cost_telemetry threshold check failed: %s", e)


async def summarize(days: int = 7) -> Dict[str, Any]:
    """Roll-up for the admin dashboard. Returns daily + per-scope + per-model
    breakdowns over the last N days.
    """
    if _db is None:
        return {"available": False, "reason": "telemetry not initialized"}
    since = datetime.now(timezone.utc) - timedelta(days=days)
    match = {"$match": {"ts": {"$gte": since}}}

    daily = await _db.llm_cost_events.aggregate([
        match,
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$ts"}},
            "cost_usd": {"$sum": "$cost_usd"},
            "calls": {"$sum": 1},
            "input_tokens": {"$sum": "$input_tokens"},
            "output_tokens": {"$sum": "$output_tokens"},
        }},
        {"$sort": {"_id": 1}},
    ]).to_list(length=days + 1)

    by_scope = await _db.llm_cost_events.aggregate([
        match,
        {"$group": {
            "_id": "$scope",
            "cost_usd": {"$sum": "$cost_usd"},
            "calls": {"$sum": 1},
        }},
        {"$sort": {"cost_usd": -1}},
    ]).to_list(length=100)

    by_model = await _db.llm_cost_events.aggregate([
        match,
        {"$group": {
            "_id": "$model",
            "cost_usd": {"$sum": "$cost_usd"},
            "calls": {"$sum": 1},
        }},
        {"$sort": {"cost_usd": -1}},
    ]).to_list(length=50)

    total = sum(d.get("cost_usd", 0) for d in daily)

    return {
        "available": True,
        "days": days,
        "total_usd": round(total, 4),
        "threshold_usd": _alert_threshold_usd,
        "daily": [{"date": d["_id"], **{k: v for k, v in d.items() if k != "_id"}} for d in daily],
        "by_scope": [{"scope": d["_id"], **{k: v for k, v in d.items() if k != "_id"}} for d in by_scope],
        "by_model": [{"model": d["_id"], **{k: v for k, v in d.items() if k != "_id"}} for d in by_model],
    }


async def ensure_indexes() -> None:
    """Create indexes used by the summary aggregations. Idempotent."""
    if _db is None:
        return
    try:
        await _db.llm_cost_events.create_index([("ts", -1)])
        await _db.llm_cost_events.create_index([("scope", 1), ("ts", -1)])
        await _db.llm_cost_events.create_index([("model", 1), ("ts", -1)])
        await _db.llm_cost_events.create_index([("user_id", 1), ("ts", -1)], sparse=True)
        # 180-day retention so the collection stays bounded.
        await _db.llm_cost_events.create_index(
            "ts", expireAfterSeconds=180 * 24 * 3600
        )
    except Exception as e:
        logger.warning("cost_telemetry index init failed: %s", e)
