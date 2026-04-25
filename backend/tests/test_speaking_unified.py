"""
Unit tests for the unified speaking evaluation surface.

Coverage:
  * usage_tracking helpers: ISO week keys, period rollover targets, exam window.
  * tier_resolver: free taste → basic → 402, paid plans always full, plan
    expiry downgrade, admin bypass.
  * audio_processor: validation rejects too-small/too-short/too-large audio.
  * speaking_idempotency: lookup before store returns None; store + lookup
    returns cached result; different scope = no collision.
  * Route smoke: monkeypatched LLM/Azure produce a valid result; quota
    decrements; second call within idempotency window returns cached body.

LLM and Azure are *never* called from these tests. We inject fakes via
the existing `transcribe_audio` parameter on `evaluate_speaking_basic`
and via monkeypatch on `evaluate_speaking` / `evaluate_speaking_basic`
for the route smoke test.
"""
from __future__ import annotations

import asyncio
import copy
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Make the backend/ importable when pytest is invoked from repo root.
BACKEND = Path(__file__).resolve().parent.parent
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from schemas.speaking_evaluator import (  # noqa: E402
    CriteriaBreakdown,
    CriterionDetail,
    Fluency,
    Scores,
    SpeakingEvaluationRequest,
    SpeakingEvaluationResult,
    SpeakingPart,
    TranscriptToken,
)
from services import audio_processor, speaking_idempotency, tier_resolver  # noqa: E402
from services.tier_resolver import (  # noqa: E402
    EvalDecision,
    record_speaking_eval,
    resolve_speaking_eval,
)
from services.usage_tracking import (  # noqa: E402
    SPEAKING_QUOTAS,
    current_week_key,
    speaking_period_key_for_plan,
    speaking_period_resets_at,
)


# ─── Fixtures ────────────────────────────────────────────────────────────────


def _sample_result() -> SpeakingEvaluationResult:
    """Schema-valid result so tests don't depend on LLM output."""
    return SpeakingEvaluationResult(
        scores=Scores(overall=6.5, target=7.0, fc=6.5, lr=6.5, gra=6.5, pr=6.5),
        criteria=CriteriaBreakdown(
            fc=CriterionDetail(band=6.5, explanation="x"),
            lr=CriterionDetail(band=6.5, explanation="x"),
            gra=CriterionDetail(band=6.5, explanation="x"),
            pr=CriterionDetail(band=6.5, explanation="x"),
        ),
        fluency=Fluency(
            wpm=110, pauses="3 · 1 filled", fillers="2 · \"um\"",
            unique="80 / 150", duration="1 min 30 s", words=150,
        ),
        transcript_tokens=[TranscriptToken(t="Sample transcript.")],
        live_transcript_words=["Sample", "transcript."],
        liz_note="Solid attempt. Watch your /θ/ articulation.",
        feedback_language="en",
    )


class FakeCollection:
    """Minimal motor-style async collection for tests."""

    def __init__(self) -> None:
        self.docs: List[Dict[str, Any]] = []
        self.indexes: List[Any] = []

    async def find_one(self, query: Dict[str, Any], projection=None):
        for d in self.docs:
            if all(d.get(k) == v for k, v in query.items()):
                if projection:
                    # Mongo: {"_id": 0} = exclude _id, include rest.
                    # {"a": 1, "b": 1} = include only a, b (+_id unless 0).
                    has_includes = any(v == 1 for v in projection.values())
                    if has_includes:
                        out = {
                            k: v for k, v in d.items()
                            if projection.get(k) == 1
                        }
                        if projection.get("_id", 1) != 0 and "_id" in d:
                            out["_id"] = d["_id"]
                    else:
                        out = {
                            k: v for k, v in d.items()
                            if projection.get(k, 1) != 0
                        }
                    return copy.deepcopy(out)
                return copy.deepcopy(d)
        return None

    async def insert_one(self, doc: Dict[str, Any]):
        # Enforce unique index if registered.
        for spec, opts in self.indexes:
            if isinstance(opts, dict) and opts.get("unique"):
                key = tuple(doc.get(k) for k, _ in spec)
                for existing in self.docs:
                    if tuple(existing.get(k) for k, _ in spec) == key:
                        raise RuntimeError("duplicate key")
        # Deep-copy so the test fixture doesn't share nested dicts with the
        # stored doc — matches real Mongo serialization semantics.
        self.docs.append(copy.deepcopy(doc))
        return type("R", (), {"inserted_id": doc.get("_id")})()

    async def update_one(self, query, update, upsert=False):
        for d in self.docs:
            if all(d.get(k) == v for k, v in query.items()):
                self._apply_update(d, update)
                return
        if upsert:
            new = dict(query)
            self._apply_update(new, update)
            self.docs.append(new)

    @staticmethod
    def _apply_update(doc: Dict[str, Any], update: Dict[str, Any]) -> None:
        for op, body in update.items():
            if op == "$set":
                for k, v in body.items():
                    _set_dotted(doc, k, v)
            elif op == "$inc":
                for k, v in body.items():
                    cur = _get_dotted(doc, k) or 0
                    _set_dotted(doc, k, cur + v)

    async def create_index(self, spec, **opts):
        self.indexes.append((spec if isinstance(spec, list) else [(spec, 1)], opts))


def _get_dotted(doc: Dict[str, Any], key: str):
    cur: Any = doc
    for part in key.split("."):
        if not isinstance(cur, dict):
            return None
        cur = cur.get(part)
    return cur


def _set_dotted(doc: Dict[str, Any], key: str, value: Any) -> None:
    parts = key.split(".")
    cur = doc
    for p in parts[:-1]:
        if p not in cur or not isinstance(cur[p], dict):
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value


class FakeDB:
    def __init__(self) -> None:
        self.users = FakeCollection()
        self.speaking_attempts = FakeCollection()
        self.telemetry_events = FakeCollection()
        self.anonymous_speaking_evals = FakeCollection()
        self.speaking_idempotency = FakeCollection()
        # Allow mongo-style db["collection"] access.
        self._extras: Dict[str, FakeCollection] = {}

    def __getitem__(self, key: str) -> FakeCollection:
        attr = getattr(self, key, None)
        if isinstance(attr, FakeCollection):
            return attr
        if key not in self._extras:
            self._extras[key] = FakeCollection()
        return self._extras[key]


@pytest.fixture
def db():
    return FakeDB()


@pytest.fixture
def free_user():
    return {
        "id": "user-free",
        "email": "free@example.com",
        "name": "Free",
        "plan": "free",
        "usage": {},
    }


@pytest.fixture
def weekly_user():
    return {
        "id": "user-weekly",
        "email": "weekly@example.com",
        "name": "Weekly",
        "plan": "weekly",
        "plan_expires_at": (
            datetime.now(timezone.utc) + timedelta(days=3)
        ).isoformat(),
        "usage": {},
    }


# ─── usage_tracking ──────────────────────────────────────────────────────────


def test_iso_week_key_format():
    key = current_week_key()
    assert key.startswith(str(datetime.now(timezone.utc).year)[:4])
    assert "-W" in key
    # ISO week always 2 digits.
    assert len(key.split("W")[1]) == 2


def test_period_key_per_plan():
    user = {"plan": "free", "usage": {}}
    assert "W" in speaking_period_key_for_plan("free", user)
    assert "W" in speaking_period_key_for_plan("weekly", user)

    # Monthly = YYYY-MM, no W.
    monthly = speaking_period_key_for_plan("monthly", user)
    assert "W" not in monthly
    assert len(monthly) == 7

    # Exam plan with explicit expiry uses that as anchor.
    exp = (datetime.now(timezone.utc) + timedelta(days=20)).isoformat()
    exam_user = {"plan": "exam", "plan_expires_at": exp}
    exam_key = speaking_period_key_for_plan("exam", exam_user)
    assert exam_key.startswith("exam-")


def test_resets_at_weekly_lands_on_monday():
    user = {"plan": "free"}
    resets = speaking_period_resets_at("free", user)
    # ISO Monday is weekday 0.
    assert resets.weekday() == 0
    assert resets.hour == resets.minute == resets.second == 0


# ─── tier_resolver ───────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_free_first_eval_is_full(db, free_user):
    await db.users.insert_one(free_user)
    decision = await resolve_speaking_eval(db, free_user)
    assert decision.allowed
    assert decision.mode == "full"
    assert decision.plan == "free"
    assert decision.quota == SPEAKING_QUOTAS["free"]["limit"]


@pytest.mark.asyncio
async def test_free_second_eval_is_basic(db, free_user):
    """After the taste is consumed, mode flips to basic until reset."""
    await db.users.insert_one(free_user)
    first = await resolve_speaking_eval(db, free_user)
    await record_speaking_eval(db, free_user, first)
    second = await resolve_speaking_eval(db, free_user)
    assert second.allowed
    assert second.mode == "basic"
    assert second.taste_used is True


@pytest.mark.asyncio
async def test_free_quota_exhausted(db, free_user):
    await db.users.insert_one(free_user)
    for _ in range(SPEAKING_QUOTAS["free"]["limit"]):
        d = await resolve_speaking_eval(db, free_user)
        assert d.allowed
        await record_speaking_eval(db, free_user, d)
    blocked = await resolve_speaking_eval(db, free_user)
    assert blocked.allowed is False
    assert "weekly" in blocked.upgrade_to


@pytest.mark.asyncio
async def test_paid_plan_always_full(db, weekly_user):
    await db.users.insert_one(weekly_user)
    decision = await resolve_speaking_eval(db, weekly_user)
    assert decision.allowed
    assert decision.mode == "full"
    # Run through several evals — mode never flips.
    for _ in range(3):
        await record_speaking_eval(db, weekly_user, decision)
        decision = await resolve_speaking_eval(db, weekly_user)
        assert decision.mode == "full"


@pytest.mark.asyncio
async def test_plan_expiry_downgrades_to_free(db):
    expired = {
        "id": "user-expired",
        "email": "x@example.com",
        "plan": "monthly",
        "plan_expires_at": (
            datetime.now(timezone.utc) - timedelta(days=1)
        ).isoformat(),
        "usage": {},
    }
    await db.users.insert_one(expired)
    decision = await resolve_speaking_eval(db, expired)
    assert decision.plan == "free"
    # Persisted to DB too.
    persisted = await db.users.find_one({"id": "user-expired"})
    assert persisted["plan"] == "free"
    assert persisted["plan_expires_at"] is None


@pytest.mark.asyncio
async def test_admin_bypass(db):
    admin = {
        "id": "user-admin",
        "email": "aga.durdy@gmail.com",  # admin email per plan_access.py
        "plan": "free",
        "usage": {},
    }
    await db.users.insert_one(admin)
    decision = await resolve_speaking_eval(db, admin)
    assert decision.allowed
    assert decision.mode == "full"
    # Recording on admin is a no-op.
    await record_speaking_eval(db, admin, decision)
    again = await resolve_speaking_eval(db, admin)
    assert again.used == 0  # unchanged


# ─── audio_processor ─────────────────────────────────────────────────────────


def test_audio_validate_too_small():
    with pytest.raises(Exception) as excinfo:
        audio_processor.validate_audio(b"x" * 10, 30)
    assert excinfo.value.status_code == 400
    assert excinfo.value.detail["code"] == "audio_too_small"


def test_audio_validate_too_short():
    with pytest.raises(Exception) as excinfo:
        audio_processor.validate_audio(b"x" * 2000, 1.0)
    assert excinfo.value.status_code == 400
    assert excinfo.value.detail["code"] == "audio_too_short"


def test_audio_validate_too_large():
    with pytest.raises(Exception) as excinfo:
        audio_processor.validate_audio(b"x" * (audio_processor.MAX_BYTES + 1), 30)
    assert excinfo.value.status_code == 413


def test_audio_validate_pass(tmp_path, monkeypatch):
    audio_processor.validate_audio(b"x" * 5000, 30.0)


def test_audio_persist_writes_file(tmp_path, monkeypatch):
    monkeypatch.setattr(audio_processor, "RECORDINGS_DIR", tmp_path)
    meta = audio_processor.persist_audio(b"hello-bytes")
    assert (tmp_path / meta["filename"]).read_bytes() == b"hello-bytes"
    assert meta["relative_url"].startswith("/static/recordings/")
    assert meta["bytes"] == len(b"hello-bytes")


# ─── idempotency ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_idempotency_lookup_miss_then_hit(db):
    rid = str(uuid.uuid4())
    miss = await speaking_idempotency.lookup(
        db, user_id="u1", anon_key=None, client_request_id=rid
    )
    assert miss is None

    await speaking_idempotency.store(
        db, user_id="u1", anon_key=None, client_request_id=rid,
        result={"hello": "world"},
    )
    hit = await speaking_idempotency.lookup(
        db, user_id="u1", anon_key=None, client_request_id=rid
    )
    assert hit == {"hello": "world"}


@pytest.mark.asyncio
async def test_idempotency_scope_isolation(db):
    rid = str(uuid.uuid4())
    await speaking_idempotency.store(
        db, user_id="u1", anon_key=None, client_request_id=rid,
        result={"who": "u1"},
    )
    other = await speaking_idempotency.lookup(
        db, user_id="u2", anon_key=None, client_request_id=rid
    )
    assert other is None  # different user → different scope


@pytest.mark.asyncio
async def test_idempotency_no_request_id_short_circuits(db):
    # Without a client_request_id, both store and lookup are no-ops.
    await speaking_idempotency.store(
        db, user_id="u1", anon_key=None, client_request_id=None,
        result={"x": 1},
    )
    miss = await speaking_idempotency.lookup(
        db, user_id="u1", anon_key=None, client_request_id=None,
    )
    assert miss is None


# ─── Route smoke (no real LLM/Azure) ─────────────────────────────────────────


@pytest.fixture
def app(db, monkeypatch, tmp_path):
    """A minimal FastAPI app wired with just the unified speaking router and
    fake LLM/Azure paths. Avoids importing server.py (heavy)."""
    from routes import speaking_unified
    from services import speaking_evaluator

    monkeypatch.setattr(audio_processor, "RECORDINGS_DIR", tmp_path)

    async def fake_full(req, audio_bytes):
        return _sample_result()

    async def fake_basic(req, audio_bytes, *, transcribe_audio=None):
        result = _sample_result()
        # Surface mode in the result so tests can assert what ran.
        result.liz_note = "BASIC: " + result.liz_note
        return result

    monkeypatch.setattr(speaking_unified, "evaluate_speaking", fake_full)
    monkeypatch.setattr(speaking_unified, "evaluate_speaking_basic", fake_basic)

    speaking_unified.set_db(db)
    a = FastAPI()
    a.include_router(speaking_unified.router)
    return a


@pytest.fixture
def client(app):
    return TestClient(app)


def _post_eval(client, **fields):
    files = {"audio": ("clip.webm", BytesIO(b"x" * 5000), "audio/webm")}
    data = {
        "user_id": fields.get("user_id", "user-free"),
        "part": "part2",
        "cue_card_prompt": "Describe a person who has influenced you.",
        "cue_card_bullets": "who they are\nwhy they influenced you",
        "user_language": "en",
        "target_band": "7.0",
        "duration_seconds": "60",
        "context": fields.get("context", "practice"),
    }
    if "client_request_id" in fields:
        data["client_request_id"] = fields["client_request_id"]
    return client.post("/api/speaking/evaluate", data=data, files=files)


@pytest.mark.asyncio
async def test_route_full_mode_for_first_free_call(db, client, free_user):
    await db.users.insert_one(free_user)
    resp = _post_eval(client, user_id="user-free")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["scores"]["overall"] == 6.5
    assert resp.headers["X-Speaking-Eval-Mode"] == "full"
    assert resp.headers["X-Speaking-Plan"] == "free"
    assert int(resp.headers["X-Speaking-Used"]) == 1
    # Persistence side-effects.
    assert len(db.speaking_attempts.docs) == 1
    assert len(db.telemetry_events.docs) == 1
    user = await db.users.find_one({"id": "user-free"})
    period_key = speaking_period_key_for_plan("free", user)
    assert user["usage"][period_key]["speaking_evals"] == 1
    assert user["usage"][period_key]["speaking_taste_used"] is True


@pytest.mark.asyncio
async def test_route_second_call_basic_mode(db, client, free_user):
    await db.users.insert_one(free_user)
    _post_eval(client, user_id="user-free")
    resp2 = _post_eval(client, user_id="user-free")
    assert resp2.status_code == 200
    assert resp2.headers["X-Speaking-Eval-Mode"] == "basic"
    assert resp2.json()["liz_note"].startswith("BASIC: ")


@pytest.mark.asyncio
async def test_route_402_when_quota_exhausted(db, client, free_user):
    await db.users.insert_one(free_user)
    limit = SPEAKING_QUOTAS["free"]["limit"]
    for _ in range(limit):
        r = _post_eval(client, user_id="user-free")
        assert r.status_code == 200
    blocked = _post_eval(client, user_id="user-free")
    assert blocked.status_code == 402
    detail = blocked.json()["detail"]
    assert detail["code"] == "quota_exhausted"
    assert detail["upgrade_to"] == ["weekly", "monthly", "exam"]


@pytest.mark.asyncio
async def test_route_idempotency_returns_cached(db, client, free_user):
    await db.users.insert_one(free_user)
    rid = str(uuid.uuid4())
    r1 = _post_eval(client, user_id="user-free", client_request_id=rid)
    r2 = _post_eval(client, user_id="user-free", client_request_id=rid)
    assert r1.status_code == r2.status_code == 200
    assert r2.headers.get("X-Speaking-Cached") == "1"
    # Quota only consumed once.
    user = await db.users.find_one({"id": "user-free"})
    period_key = speaking_period_key_for_plan("free", user)
    assert user["usage"][period_key]["speaking_evals"] == 1


@pytest.mark.asyncio
async def test_route_audio_validation_blocks_short(db, client, free_user):
    await db.users.insert_one(free_user)
    files = {"audio": ("clip.webm", BytesIO(b"x" * 5000), "audio/webm")}
    data = {
        "user_id": "user-free",
        "part": "part2",
        "cue_card_prompt": "Describe a person.",
        "duration_seconds": "1.0",  # under MIN_DURATION_SECONDS
    }
    resp = client.post("/api/speaking/evaluate", data=data, files=files)
    assert resp.status_code == 400
    assert resp.json()["detail"]["code"] == "audio_too_short"
    # Quota untouched (validation happens before resolve).
    user = await db.users.find_one({"id": "user-free"})
    assert user.get("usage", {}) == {}


@pytest.mark.asyncio
async def test_route_404_unknown_user(db, client):
    files = {"audio": ("clip.webm", BytesIO(b"x" * 5000), "audio/webm")}
    data = {
        "user_id": "ghost",
        "part": "part2",
        "cue_card_prompt": "Describe a person.",
        "duration_seconds": "60",
    }
    resp = client.post("/api/speaking/evaluate", data=data, files=files)
    assert resp.status_code == 404
    assert resp.json()["detail"]["code"] == "user_not_found"


@pytest.mark.asyncio
async def test_anonymous_one_per_week(db, client):
    files = {"audio": ("clip.webm", BytesIO(b"x" * 5000), "audio/webm")}
    data = {
        "email": "lead@example.com",
        "part": "part2",
        "cue_card_prompt": "Describe a person.",
        "duration_seconds": "60",
    }
    r1 = client.post("/api/speaking/evaluate-anonymous", data=data, files=files)
    assert r1.status_code == 200
    r2 = client.post(
        "/api/speaking/evaluate-anonymous",
        data=data,
        files={"audio": ("c.webm", BytesIO(b"x" * 5000), "audio/webm")},
    )
    assert r2.status_code == 402
    assert r2.json()["detail"]["code"] == "anon_quota_exhausted"
