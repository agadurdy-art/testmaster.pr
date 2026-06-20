from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Request, Form, Body, Query, BackgroundTasks, Depends
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Union
import uuid
from datetime import datetime, timezone, timedelta, time
import hashlib
import bcrypt
import hmac
import urllib.parse
from services.llm_compat import LlmChat, UserMessage
import json
from services.openai_compat import OpenAISpeechToText
import resend
import re
import io
import httpx

import auth_session  # audit F01/F03: admin-session gate for @app admin routes

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# PayPal configuration (Smart Buttons + Orders API)
# PayPal env vars -> Moved to routes/payments.py

# Facebook Login configuration
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")

# Initialize OpenAI Speech-to-Text
stt = OpenAISpeechToText(api_key=os.getenv("OPENAI_API_KEY") or os.getenv("EMERGENT_LLM_KEY"))

# ============ IELTS CORE AI MINDSET ============
# Complete & Expanded Full Mindset Prompt - Cambridge IELTS Examiner & Teacher

IELTS_CORE_MINDSET = """# 🧠 IELTS AI — COMPLETED & EXPANDED FULL MINDSET PROMPT

## 🔒 SYSTEM IDENTITY

You are an **IELTS AI Examiner & Teacher** trained to think, judge, and explain **exactly like a real Cambridge IELTS examiner**.

You are **NOT** a generic language model.
You are **NOT** a motivational tutor.
You are **NOT** allowed to inflate scores.

Your core mission is to:
* Apply IELTS band descriptors accurately
* Enforce strict examiner logic
* Diagnose weaknesses
* Teach candidates how to improve
* Guide them through a structured IELTS preparation pathway

You value **fairness, evidence, relevance, and transparency**.

---

## 🎯 CORE IELTS PHILOSOPHY (NON-NEGOTIABLE)

IELTS performance is determined by:

> **Language × Task Fulfilment × Thinking**

If **any one** of these is missing, **high band scores are impossible**.

Fluent English alone does NOT equal a high IELTS band.

---

## 🧠 ROLES YOU MUST ALWAYS PERFORM (SIMULTANEOUSLY)

You operate as **four roles at once**:

### 1️⃣ Cambridge IELTS Examiner
* Apply band descriptors strictly
* Look for band evidence, not impressions
* Never reward irrelevant or memorised responses

### 2️⃣ IELTS Teacher
* Explain *why* a band was awarded
* Clarify what blocked a higher band
* Use examiner-style professional language

### 3️⃣ Diagnostic Analyst
* Identify the **main limiting factors**
* Prioritise problems (maximum two key issues)
* Ignore minor or cosmetic errors

### 4️⃣ Course Director
* Assign targeted study areas
* Link weaknesses to specific skills
* Create a clear Test → Study → Retry pathway

---

## 🚫 ABSOLUTE HARD RULES (MUST BE ENFORCED)

### 🔒 RULE 1 — RELEVANCE GATE (CRITICAL)

If the candidate does **NOT directly answer the question**:
* Fluency score must NOT exceed Band 5
* Lexical Resource must NOT exceed Band 5
* Overall band must NOT exceed **Band 5.0**

Fluent but irrelevant speech **MUST be capped**.

---

### 🔒 RULE 2 — BAND CEILING PRINCIPLE

Higher bands require **clear evidence**.

Apply these **maximum limits** strictly:
* No clear topic development → max Band 6.0
* No complex grammatical structures → max Band 5.5
* No abstract thinking in Part 3 → max Band 6.0
* Memorised or generic answers → max Band 5.5

You are NOT allowed to bypass these ceilings.

---

### 🔒 RULE 3 — PART-SPECIFIC EXPECTATIONS

#### IELTS Speaking Part 1
* Natural, short, direct responses
* Overdeveloped answers do NOT raise band
* Memorised answers → max Band 5.5

#### IELTS Speaking Part 2
* Logical structure and progression
* Relevant content throughout
* Off-topic content → max Band 5.5

#### IELTS Speaking Part 3
* Abstract ideas are mandatory
* Opinions must be supported
* No abstract thinking → max Band 6.0

---

## 🗣️ PRONUNCIATION & ACCENT POLICY (LOCKED)

### Core Rule:
> **IELTS judges intelligibility, NOT accent.**

* Accent alone must NEVER reduce a band score
* British, American, or non-native accents are equally valid

Pronunciation affects score ONLY if:
* Examiner must make effort to understand
* Incorrect stress or intonation reduces clarity

### Pronunciation ceilings:
* Difficult to understand → max Band 5.5
* Frequent stress errors → max Band 6.0
* Monotonous but clear speech → max Band 7.0

Pronunciation can lower the band, but NEVER raise it alone.

---

## 📊 SCORING LOGIC (MANDATORY THINKING ORDER)

You MUST evaluate responses in this exact order:
1. Question relevance
2. Task fulfilment
3. Language control
4. Band evidence availability

Before assigning a band, you must ask internally:
> "What is the **highest band this response is ALLOWED to reach**?"

---

## 🧪 INTERNAL RELEVANCE SCORING (DO NOT DISPLAY)

* Relevance = 0 → overall band ≤ 5.0
* Relevance = 1 → overall band ≤ 5.5
* Relevance = 2 → normal scoring allowed

---

## 🗣️ FEEDBACK LANGUAGE STANDARD (STRICT)

You MUST use examiner-style language only.

### ✔️ Approved language:
* "At this band level, an examiner expects…"
* "This response meets Band X because…"
* "The main limiting factor is…"
* "To move to Band X+0.5, the candidate needs to…"

### ❌ Forbidden language:
* "Try to improve…"
* "You should practice more…"
* "Good job"

---

## 🧠 DIAGNOSIS RULES

* Identify **maximum two** main weaknesses
* Rank them by impact on band score
* Do NOT list minor or surface-level mistakes

---

## 📚 TEACHING OUTPUT (MANDATORY)

Every evaluation MUST include:
1. **Band scores** (all four criteria + overall)
2. **Examiner explanation** (why this band)
3. **Main limiting factors**
4. **Exact improvement direction**
5. **Clear next-step study focus**

---

## 🔁 TEST → STUDY → RETRY LOOP (REQUIRED)

Your role is incomplete unless you guide the candidate through:

Test → Diagnosis → Targeted study → Focused retry

Scoring without guidance is considered a failure.

---

## ❌ WHAT YOU MUST NEVER DO

* Inflate band scores
* Ignore relevance
* Reward memorised language
* Penalise accent
* Use generic or motivational feedback
* Replace examiner logic with AI intuition

---

## 🎯 FINAL IDENTITY STATEMENT (INTERNAL)

> **We do not train candidates to sound fluent.
> We train them to think, respond, and perform like IELTS candidates.**

This principle overrides all other considerations."""

# ============ AI MODE CONFIGURATIONS ============

EVALUATION_MODE_PROMPT = """You are in EVALUATION MODE.

RULES:
- Strict band scoring only
- Criterion-by-criterion reasoning required
- No teaching, no encouragement
- Apply band caps FIRST before scoring
- Every band must be justified with evidence from the response"""

TEACHING_MODE_PROMPT = """You are in TEACHING MODE.

RULES:
- Explain clearly and concisely
- Use minimal but powerful examples
- Focus on WHY errors happen
- Adjust to learner's current band level
- No scoring in this mode"""

STRATEGY_MODE_PROMPT = """You are in STRATEGY MODE.

Your task:
- Diagnose what is blocking the learner from the next band
- Identify: grammar ceilings, vocabulary gaps, task misunderstanding, strategy misuse
- Prescribe: what to study next, what to repeat, what to stop doing
- Recommend specific course content or practice type"""

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ─── Security backlog A: in-memory IP rate limiting ───────────────────────────
# Brute-force / email-bomb / costly-eval / heartbeat-flood protection on the
# abuse-prone endpoints. Fail-open, no new deps. See backend/ratelimit.py.
try:
    from ratelimit import rate_limit_middleware as _rate_limit_mw
    app.middleware("http")(_rate_limit_mw)
    print("✅ IP rate-limit middleware installed")
except Exception as _e:  # noqa: BLE001
    print(f"⚠️  Could not install rate-limit middleware: {_e}")

# ─── Static asset CDN swap (Cloudflare R2) ────────────────────────────────────
# When STATIC_BASE_URL is set (production: Railway behind R2), incoming requests
# for /api/static/* and /static/* are 307-redirected to the CDN. The exclusion
# list below stays on the Railway pod because those files are written
# just-in-time and never uploaded to R2:
#   * /static/recordings — speaking eval recordings (live-written, read in same pod)
#   * /static/audio/tts_cache — ElevenLabs Liz greetings cached on demand
#                               (without this, the 307 lands on R2 → 404 →
#                                useLizVoice falls back to Web Speech, so Liz
#                                ends up sounding like the browser's default
#                                male voice on macOS/Safari).
# When STATIC_BASE_URL is unset (local dev), the StaticFiles mounts below
# serve the bytes directly.
STATIC_BASE_URL = (os.getenv("STATIC_BASE_URL") or "").rstrip("/")

# Path prefixes that must be served from the local pod even in production.
# Speaking recordings used to live here too, but they are now mirrored to R2 on
# write (services/audio_processor.persist_audio) so they survive pod restarts and
# stay playable on the results page — so they go through the CDN redirect below.
_LOCAL_STATIC_PREFIXES = (
    "/api/static/audio/tts_cache/",
    "/static/audio/tts_cache/",
)

if STATIC_BASE_URL:
    from starlette.responses import RedirectResponse

    @app.middleware("http")
    async def _static_cdn_redirect(request, call_next):
        path = request.url.path
        if path.startswith(_LOCAL_STATIC_PREFIXES):
            return await call_next(request)
        for prefix in ("/api/static/", "/static/"):
            if path.startswith(prefix):
                rel = path[len(prefix):]
                target = f"{STATIC_BASE_URL}/{rel}"
                if request.url.query:
                    target = f"{target}?{request.url.query}"
                return RedirectResponse(url=target, status_code=307)
        return await call_next(request)

# ─── Health check (Railway readiness probe) ───────────────────────────────────
@app.get("/api/health")
async def _health_check():
    """Lightweight readiness probe. Verifies process is up; does NOT ping Mongo
    (Railway healthcheck runs every few seconds — keep it cheap)."""
    return {"status": "ok", "static_cdn": bool(STATIC_BASE_URL)}

# Mount static files for audio
static_audio_path = ROOT_DIR / "static" / "audio"
if static_audio_path.exists():
    app.mount("/api/static/audio", StaticFiles(directory=str(static_audio_path)), name="audio_api")
    app.mount("/static/audio", StaticFiles(directory=str(static_audio_path)), name="audio")
    print("✅ Static audio files mounted at /api/static/audio and /static/audio")

# Mount static files for speaking eval recordings (unified endpoint stores
# the raw webm here and the results UI plays it back via <audio src=...>).
static_recordings_path = ROOT_DIR / "static" / "recordings"
static_recordings_path.mkdir(parents=True, exist_ok=True)
app.mount(
    "/api/static/recordings",
    StaticFiles(directory=str(static_recordings_path)),
    name="recordings_api",
)
app.mount(
    "/static/recordings",
    StaticFiles(directory=str(static_recordings_path)),
    name="recordings_static",
)
print("✅ Static recordings mounted at /api/static/recordings and /static/recordings")

# Mount static files for vocabulary images
static_vocab_path = ROOT_DIR / "static" / "vocab_images"
if not static_vocab_path.exists():
    os.makedirs(static_vocab_path, exist_ok=True)
app.mount("/api/static/vocab_images", StaticFiles(directory=str(static_vocab_path)), name="vocab_images_api")
app.mount("/static/vocab_images", StaticFiles(directory=str(static_vocab_path)), name="vocab_images")
print("✅ Static vocab images mounted at /api/static/vocab_images")

# Mount static files for images (Cambridge test visuals)
static_images_path = ROOT_DIR / "static" / "images"
if static_images_path.exists():
    app.mount("/static/images", StaticFiles(directory=str(static_images_path)), name="images")
    print("✅ Static image files mounted at /static/images")
else:
    os.makedirs(static_images_path, exist_ok=True)
    app.mount("/static/images", StaticFiles(directory=str(static_images_path)), name="images")
    print("✅ Static images directory created and mounted")

# Mount static files for visuals (maps, diagrams, charts)
static_visuals_path = ROOT_DIR / "static" / "visuals"
if static_visuals_path.exists():
    app.mount("/api/static/visuals", StaticFiles(directory=str(static_visuals_path)), name="visuals_api")
    app.mount("/static/visuals", StaticFiles(directory=str(static_visuals_path)), name="visuals")
    print("✅ Static visual files mounted at /api/static/visuals and /static/visuals")
else:
    os.makedirs(static_visuals_path, exist_ok=True)
    app.mount("/api/static/visuals", StaticFiles(directory=str(static_visuals_path)), name="visuals_api")
    app.mount("/static/visuals", StaticFiles(directory=str(static_visuals_path)), name="visuals")
    print("✅ Static visual files directory created and mounted")

# Mount static files for strategies guide (ported PDF imagery)
static_strategies_path = ROOT_DIR / "static" / "strategies"
os.makedirs(static_strategies_path, exist_ok=True)
app.mount("/api/static/strategies", StaticFiles(directory=str(static_strategies_path)), name="strategies_api")
app.mount("/static/strategies", StaticFiles(directory=str(static_strategies_path)), name="strategies")
print("✅ Static strategies images mounted at /api/static/strategies and /static/strategies")

# Mount static files for Cambridge writing-task imagery (migrated off Emergent
# CDN 2026-05-14 — see /tmp/emergent_url_map.json).
static_cambridge_path = ROOT_DIR / "static" / "cambridge"
os.makedirs(static_cambridge_path, exist_ok=True)
app.mount("/api/static/cambridge", StaticFiles(directory=str(static_cambridge_path)), name="cambridge_api")
app.mount("/static/cambridge", StaticFiles(directory=str(static_cambridge_path)), name="cambridge_static")
print("✅ Static cambridge images mounted at /api/static/cambridge and /static/cambridge")

# Cost telemetry — Faz 5. Initialize before any eval route loads so the very
# first LLM call already records into Mongo. Index init happens on startup.
try:
    from services import cost_telemetry
    cost_telemetry.init_telemetry(db)

    from routes.admin_cost import router as admin_cost_router
    app.include_router(admin_cost_router)

    @app.on_event("startup")
    async def _bootstrap_cost_telemetry_indexes():
        await cost_telemetry.ensure_indexes()

    print("✅ Cost telemetry initialized + admin cost routes loaded")
except Exception as e:
    print(f"⚠️  Could not initialize cost telemetry: {e}")
    import traceback
    traceback.print_exc()

# Route lifecycle — Faz 6. Per-prefix timeouts + client-disconnect cancellation.
# Registered here (before CORS) so CORS stays outermost and can attach headers
# to any 504 we emit on timeout — without this the browser would see a CORS
# error instead of the structured timeout payload.
try:
    from services.route_lifecycle import RouteLifecycleMiddleware
    app.add_middleware(RouteLifecycleMiddleware)
    print("✅ Route lifecycle middleware (timeout + disconnect) installed")
except Exception as e:
    print(f"⚠️  Could not install route lifecycle middleware: {e}")

# Import learning platform routes
try:
    from learning_platform_routes import router as learning_platform_router
    app.include_router(learning_platform_router)
    print("✅ Learning platform routes loaded")
except Exception as e:
    print(f"⚠️  Could not load learning platform routes: {e}")

# Import pronunciation routes
try:
    from pronunciation_routes import router as pronunciation_router
    app.include_router(pronunciation_router)
    print("✅ Pronunciation routes loaded")
except Exception as e:
    print(f"⚠️  Could not load pronunciation routes: {e}")

# Import question bank routes
try:
    from routes.question_bank import router as question_bank_router
    app.include_router(question_bank_router)
    print("✅ Question Bank routes loaded")
except Exception as e:
    print(f"⚠️  Could not load question bank routes: {e}")

# Import lesson registry routes (ULTRA MASTER PROMPT)
try:
    from routes.lesson_registry import router as lesson_registry_router
    app.include_router(lesson_registry_router)
    print("✅ Lesson Registry routes loaded")
except Exception as e:
    print(f"⚠️  Could not load lesson registry routes: {e}")

# Strategies Guide (faithful port of the Complete IELTS Preparation Guide)
try:
    from routes.strategies import router as strategies_router
    app.include_router(strategies_router)
    print("✅ Strategies Guide routes loaded")
except Exception as e:
    print(f"⚠️  Could not load strategies routes: {e}")

# Import dual-track course routes
try:
    from routes.dual_track import router as dual_track_router
    app.include_router(dual_track_router)
    print("✅ Dual-Track routes loaded")
except Exception as e:
    print(f"⚠️  Could not load dual-track routes: {e}")

# Import listening question bank routes
try:
    from routes.listening_qb import router as listening_qb_router
    app.include_router(listening_qb_router)
    print("✅ Listening QB routes loaded")
except Exception as e:
    print(f"⚠️  Could not load listening QB routes: {e}")

# Import reading question bank routes (parity with listening — task #139).
try:
    from routes.reading_qb import router as reading_qb_router
    app.include_router(reading_qb_router)
    print("✅ Reading QB routes loaded")
except Exception as e:
    print(f"⚠️  Could not load reading QB routes: {e}")

# Quick onboarding assessment — 15-18 min adaptive level test for guests.
# Zero LLM calls (see project_quick_assessment_spec.md). Reading/listening
# scored via Cambridge raw→band tables; writing/speaking heuristically.
try:
    from level_test_quick.routes import router as quick_assessment_router
    app.include_router(quick_assessment_router)
    print("✅ Quick assessment routes loaded")
except Exception as e:
    print(f"⚠️  Could not load quick assessment routes: {e}")

# Import unified speaking evaluation route FIRST so its /evaluate, /topics,
# and other endpoints take precedence over the legacy ones in
# routes/speaking_qb.py (FastAPI resolves the first-registered match). Both
# routers share prefix /api/speaking and define overlapping paths like
# /topics — without this ordering, the QB router shadows the unified 47-topic
# endpoint and LizLivePanel's chip selector goes empty.
# Set UNIFIED_SPEAKING_EVAL_ENABLED=0 to disable in an emergency.
if os.environ.get("UNIFIED_SPEAKING_EVAL_ENABLED", "1").lower() not in {"0", "false", "off"}:
    try:
        from routes.speaking_unified import (
            router as speaking_unified_router,
            set_db as set_speaking_unified_db,
            init_indexes as init_speaking_unified_indexes,
        )
        set_speaking_unified_db(db)
        app.include_router(speaking_unified_router)

        @app.on_event("startup")
        async def _bootstrap_speaking_unified_indexes():
            await init_speaking_unified_indexes()

        print("✅ Speaking Unified routes loaded")
    except Exception as e:
        print(f"⚠️  Could not load speaking unified routes: {e}")
        import traceback
        traceback.print_exc()

# Smart Practice — structured per-question speaking eval. Distinct surface from
# /api/speaking (Liz Examiner / single-audio-per-part). Mounted under
# /api/speaking-practice/* to avoid collision with the legacy JSON-only
# /api/speaking-practice/evaluate at server.py:4779 — both coexist for now;
# the legacy route is scheduled for removal once the frontend is migrated.
try:
    from routes.speaking_practice_structured import (
        router as speaking_practice_structured_router,
        set_db as set_speaking_practice_structured_db,
        ensure_job_indexes as ensure_speaking_job_indexes,
        sweep_pending_jobs as sweep_speaking_jobs,
    )
    set_speaking_practice_structured_db(db)
    app.include_router(speaking_practice_structured_router)

    @app.on_event("startup")
    async def _bootstrap_speaking_jobs():
        # Index the durable job queue, then re-run anything a previous pod left
        # mid-flight (restart recovery for the leave-safe evaluation). Never let
        # a hiccup here block server startup.
        try:
            await ensure_speaking_job_indexes()
            await sweep_speaking_jobs()
        except Exception as _e:  # noqa: BLE001
            print(f"⚠️  speaking job bootstrap skipped: {_e}")

    print("✅ Speaking Practice (structured) routes loaded")
except Exception as e:
    print(f"⚠️  Could not load speaking practice structured routes: {e}")
    import traceback
    traceback.print_exc()

# Import speaking question bank routes (registered AFTER unified so its
# legacy /score, /submit, /transcribe endpoints stay reachable for
# SpeakingPracticeQB.js until Task #64 migrates that flow).
try:
    from routes.speaking_qb import router as speaking_qb_router
    app.include_router(speaking_qb_router)
    print("✅ Speaking QB routes loaded")
except Exception as e:
    print(f"⚠️  Could not load speaking QB routes: {e}")

# Liz Live (Gemini) was removed 2026-04-29. The replacement is ElevenLabs
# Conversational AI mounted below. The route handles both signed-URL minting
# (xi-api-key never reaches the browser) and post-fetch transcript pulls.
try:
    from routes.liz_eleven import (
        router as liz_eleven_router,
        set_db as set_liz_eleven_db,
        init_indexes as init_liz_eleven_indexes,
    )
    set_liz_eleven_db(db)
    app.include_router(liz_eleven_router)

    @app.on_event("startup")
    async def _bootstrap_liz_eleven_indexes():
        await init_liz_eleven_indexes()

    print("✅ Liz ElevenLabs Conversational routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Liz ElevenLabs routes: {e}")
    import traceback
    traceback.print_exc()

# Import full test mode routes
try:
    from routes.full_test import router as full_test_router
    app.include_router(full_test_router)
    print("✅ Full Test Mode routes loaded")
except Exception as e:
    print(f"⚠️  Could not load full test routes: {e}")

# Import full test audio routes
try:
    from routes.full_test_audio import router as full_test_audio_router
    app.include_router(full_test_audio_router)
    print("✅ Full Test Audio routes loaded")
except Exception as e:
    print(f"⚠️  Could not load full test audio routes: {e}")

# Import visual generator routes
try:
    from routes.visuals import router as visuals_router
    app.include_router(visuals_router)
    print("✅ Visual Generator routes loaded")
except Exception as e:
    print(f"⚠️  Could not load visual generator routes: {e}")

# Cambridge IELTS tests routes
try:
    from routes.cambridge import router as cambridge_router
    app.include_router(cambridge_router)
    print("✅ Cambridge IELTS routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Cambridge routes: {e}")

# TTS routes for Speaking section
try:
    from routes.tts import router as tts_router
    app.include_router(tts_router)
    print("✅ TTS routes loaded")
except Exception as e:
    print(f"⚠️  Could not load TTS routes: {e}")

# User recordings routes
try:
    from routes.recordings import router as recordings_router
    app.include_router(recordings_router)
    print("✅ Recordings routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Recordings routes: {e}")

# Study-time tracking (heartbeat + summary for the dashboard StreakDial)
try:
    from routes.study_time import router as study_time_router
    app.include_router(study_time_router)
except Exception as e:
    print(f"⚠️  Could not load Study Time routes: {e}")

# Writing helper — Liz floating coaching panel (4 dynamic Haiku-backed kinds:
# unpack / ideas / phrases / polish). Static structure + pitfall buttons live
# entirely in the frontend; this endpoint is only hit for dynamic guidance.
try:
    from routes.writing_helper import router as writing_helper_router
    app.include_router(writing_helper_router)
    print("✅ Writing helper routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Writing helper routes: {e}")

# Speaking helper — Liz floating coaching panel during speaking practice.
# 4 dynamic Haiku-backed kinds (unpack / ideas / phrases / opener);
# static structure + pitfall buttons live entirely in the frontend.
try:
    from routes.speaking_helper import router as speaking_helper_router
    app.include_router(speaking_helper_router)
    print("✅ Speaking helper routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Speaking helper routes: {e}")

# Audio streaming routes
try:
    from routes.audio import router as audio_router
    app.include_router(audio_router)
    print("✅ Audio routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Audio routes: {e}")

# Cambridge Speaking evaluation routes
try:
    from routes.cambridge_speaking import router as cambridge_speaking_router
    app.include_router(cambridge_speaking_router)
    print("✅ Cambridge Speaking routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Cambridge Speaking routes: {e}")

# Beginner Pronunciation routes
try:
    from routes.beginner_pronunciation import router as beginner_pronunciation_router
    app.include_router(beginner_pronunciation_router)
    print("✅ Beginner Pronunciation routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Beginner Pronunciation routes: {e}")

# Game Bank routes
try:
    from routes.game_bank import router as game_bank_router
    app.include_router(game_bank_router)
    print("✅ Game Bank routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Game Bank routes: {e}")

# Test Admin routes (debug, validation, practice)
try:
    from routes.test_admin import router as test_admin_router
    app.include_router(test_admin_router)
    print("✅ Test Admin routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Test Admin routes: {e}")
    import traceback
    traceback.print_exc()

# QA Admin routes (evidence packs, approval workflow)
try:
    from routes.qa_admin import router as qa_admin_router
    app.include_router(qa_admin_router)
    print("✅ QA Admin routes loaded")
except Exception as e:
    print(f"⚠️  Could not load QA Admin routes: {e}")
    import traceback
    traceback.print_exc()

try:
    from routes.liz_teacher import router as liz_router
    from routes import liz_teacher
    liz_teacher.db = db
    app.include_router(liz_router)
    print("✅ Liz AI Teacher routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Liz Teacher routes: {e}")
    import traceback
    traceback.print_exc()

# Unified Learning System routes
try:
    from unified_learning_routes import router as unified_learning_router
    app.include_router(unified_learning_router)
    print("✅ Unified Learning System routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Unified Learning routes: {e}")
    import traceback
    traceback.print_exc()

# AI Content Enrichment routes
try:
    from routes.content_enrichment import router as content_enrichment_router
    app.include_router(content_enrichment_router)
    print("✅ Content Enrichment routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Content Enrichment routes: {e}")
    import traceback
    traceback.print_exc()

# Speech evaluation routes
try:
    from routes.speech_routes import router as speech_router
    app.include_router(speech_router)
    print("✅ Speech evaluation routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Speech routes: {e}")
    import traceback
    traceback.print_exc()

# Worksheet generation routes
try:
    from routes.worksheet_routes import router as worksheet_router
    app.include_router(worksheet_router)
    print("✅ Worksheet routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Worksheet routes: {e}")
    import traceback
    traceback.print_exc()

# Grammar Engine routes
try:
    from routes.grammar_engine import router as grammar_engine_router, set_db as set_grammar_db
    set_grammar_db(db)
    app.include_router(grammar_engine_router)
    print("✅ Grammar Engine routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Grammar Engine routes: {e}")
    import traceback
    traceback.print_exc()

# Grammar Blueprint routes (static JSON content — no DB needed)
try:
    from routes.grammar_blueprint import router as grammar_blueprint_router
    app.include_router(grammar_blueprint_router)
    print("✅ Grammar Blueprint routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Grammar Blueprint routes: {e}")
    import traceback
    traceback.print_exc()

try:
    from routes.auth import router as auth_router, set_db as set_auth_db
    set_auth_db(db)
    import auth_session
    auth_session.set_db(db)
    app.include_router(auth_router)
    print("✅ Auth routes loaded (modular)")
except Exception as e:
    print(f"⚠️  Could not load Auth routes: {e}")
    import traceback
    traceback.print_exc()

try:
    from routes.admin import router as admin_router, set_db as set_admin_db
    set_admin_db(db)
    app.include_router(admin_router)
    print("✅ Admin routes loaded (modular)")
except Exception as e:
    print(f"⚠️  Could not load Admin routes: {e}")
    import traceback
    traceback.print_exc()

try:
    from routes.payments import router as payments_router, set_db as set_payments_db
    set_payments_db(db)
    app.include_router(payments_router)
    print("✅ Payment routes loaded (modular)")
except Exception as e:
    print(f"⚠️  Could not load Payment routes: {e}")
    import traceback
    traceback.print_exc()

try:
    from routes.admin_analytics import router as admin_analytics_router
    app.include_router(admin_analytics_router)
    print("✅ Admin analytics routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Admin analytics routes: {e}")
    import traceback
    traceback.print_exc()

try:
    from routes.testimonials import router as testimonials_router
    app.include_router(testimonials_router)
    print("✅ Testimonials routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Testimonials routes: {e}")
    import traceback
    traceback.print_exc()



# ============ Models ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    password_hash: Optional[str] = Field(default=None, exclude=True)
    verified: bool = False  # Changed default to False for new users
    email_verified: bool = False  # New field for clarity
    google_id: Optional[str] = None
    facebook_id: Optional[str] = None
    plan: str = Field(default="free", description="Subscription plan: free or pro")
    examCredits: int = Field(default=0, description="Number of AI speaking exam credits")
    ai_interview_free_seconds_used: int = Field(default=0, description="Total free AI interviewer seconds used")
    ai_mentor_messages_used: int = Field(default=0, description="AI mentor messages used (limit 3 for unverified)")
    verification_sent_at: Optional[str] = None
    last_resend_at: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    test_history: List[str] = Field(default_factory=list)
    # Onboarding + personalization (set via /api/users/{id}/onboarding)
    learning_mode: Optional[str] = None  # "ielts" | "general_english"
    onboarding_complete: bool = False
    onboarding_completed_at: Optional[str] = None
    target_band: Optional[float] = None
    current_band: Optional[float] = None
    exam_date: Optional[str] = None  # ISO date string (YYYY-MM-DD)
    feedback_language: Optional[str] = None  # ISO 639-1, e.g. "en", "tr", "vi"

class UserCreate(BaseModel):
    email: str
    name: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


class UpgradeUserPlanRequest(BaseModel):
    email: str
    plan: str
    admin_token: str

class Test(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    test_type: str  # listening, reading, writing, speaking
    duration: int  # in minutes
    questions: List[Dict[str, Any]]
    passages: Optional[List[Dict[str, Any]]] = None
    audio_url: Optional[str] = None
    answer_key: List[Dict[str, Any]]
    
class TestAttempt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    test_id: str
    test_type: str
    answers: List[Dict[str, Any]]
    score: float
    band_score: float
    feedback: Dict[str, Any]
    time_taken: int  # in seconds
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubmitAnswers(BaseModel):
    user_id: str
    test_id: str
    test_type: str
    answers: List[Dict[str, Any]]
    time_taken: int
    language: str = "en"  # "en" or "vi" for localized feedback
    writing_feedback: Optional[Dict[str, Any]] = None  # AI feedback for writing tests
    speaking_feedback: Optional[Dict[str, Any]] = None  # AI feedback for speaking tests


# ---------------------------------------------------------------------------
# persist_attempt — single writer for db.test_attempts
#
# All evaluate endpoints (cambridge, reading_qb, listening_qb, speaking_qb,
# speaking_unified, full_test, cambridge_speaking) call this after computing
# scores so the Progress page + Liz can read every practice/test attempt from
# a single collection. Returns the inserted attempt id, or None if skipped.
# Skips silently when user_id is missing/empty (anonymous practice).
# ---------------------------------------------------------------------------
async def persist_attempt(
    *,
    user_id: Optional[str],
    test_id: str,
    test_type: str,
    band_score: float = 0.0,
    score: float = 0.0,
    answers: Optional[List[Dict[str, Any]]] = None,
    feedback: Optional[Dict[str, Any]] = None,
    time_taken: int = 0,
) -> Optional[str]:
    if not user_id:
        return None
    try:
        attempt = TestAttempt(
            user_id=str(user_id),
            test_id=str(test_id or "unknown"),
            test_type=str(test_type or "mixed"),
            answers=answers or [],
            score=float(score or 0.0),
            band_score=float(band_score or 0.0),
            feedback=feedback or {},
            time_taken=int(time_taken or 0),
        )
        doc = attempt.model_dump()
        doc["completed_at"] = doc["completed_at"].isoformat()
        await db.test_attempts.insert_one(doc)
        try:
            await db.users.update_one(
                {"id": str(user_id)},
                {"$push": {"test_history": attempt.id}},
            )
        except Exception:
            pass  # user history mirror is best-effort
        return attempt.id
    except Exception as e:
        logger.warning(f"persist_attempt failed for user={user_id} type={test_type}: {e}")
        return None

class EvaluateWriting(BaseModel):
    user_id: str
    task_type: str  # task1 or task2
    question: str
    answer: str

class TranscribeAudio(BaseModel):
    user_id: str

class SpeakingTest(BaseModel):
    user_id: str
    part: int  # 1, 2, or 3
    question: str
    user_response: str

class TipArticle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    modules: List[Dict[str, Any]]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ForgotPasswordRequest(BaseModel):
    email: str


class DirectResetRequest(BaseModel):
    email: str
    new_password: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str

class PaymentOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_id: str
    amount_vnd: int
    currency: str = "VND"
    status: str = Field(default="pending", description="pending | completed | failed")
    sepay_transaction_id: Optional[str] = None
    sepay_reference_code: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


class CreatePaymentRequest(BaseModel):
    plan_id: str
    amount_vnd: int


class ManualCreditRequest(BaseModel):
    email: str
    plan: Optional[str] = None
    exam_credits: Optional[int] = None
    admin_token: str


# Feedback Models
class FeedbackCreate(BaseModel):
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    type: str = "general"  # general, bug, feature, content, ui
    message: str
    rating: Optional[int] = None
    page_url: Optional[str] = None
    user_agent: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    type: str
    message: str
    rating: Optional[int] = None
    page_url: Optional[str] = None
    resolved: bool = False
    created_at: datetime


# Password hashing helpers

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    if not isinstance(password, str):
        password = str(password)
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _hash_password_sha256(password: str) -> str:
    """Legacy SHA-256 hash for migration check only."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against stored hash. Supports bcrypt and legacy SHA-256."""
    if not password_hash:
        return False
    # Try bcrypt first
    if password_hash.startswith("$2"):
        try:
            return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
        except Exception:
            return False
    # Fallback to legacy SHA-256
    computed = _hash_password_sha256(password)
    return hmac.compare_digest(computed, password_hash)

# ============ Helper Functions ============

def _resolve_listening_transcripts(test: Dict[str, Any]) -> Dict[int, str]:
    """Return a {part_number: transcript_text} map for a listening test.

    Sources, in order:
      1. test["transcripts"] / test["sections"]["listening"]["transcripts"] —
         used when the test data itself carries audioscripts (e.g. Cambridge
         book content modules).
      2. Title-based fallback for tests seeded into db.tests before transcripts
         existed (Cambridge IELTS 19 Test 1 / Test 2 dashboard listening tests).
    """
    direct = test.get("transcripts")
    if not direct:
        try:
            direct = (test.get("sections") or {}).get("listening", {}).get("transcripts")
        except (AttributeError, TypeError):
            direct = None
    if direct:
        out: Dict[int, str] = {}
        for k, v in direct.items():
            try:
                out[int(k)] = str(v or "")
            except (TypeError, ValueError):
                continue
        if out:
            return out

    title = (test.get("title") or "").lower()
    if "cambridge ielts 19" in title or "ielts 19" in title:
        try:
            from content.cambridge_tests.ielts19.audioscripts import IELTS19_AUDIOSCRIPTS
            if "test 1" in title:
                return dict(IELTS19_AUDIOSCRIPTS.get(1, {}))
            if "test 2" in title:
                return dict(IELTS19_AUDIOSCRIPTS.get(2, {}))
        except ImportError:
            pass
    return {}


def calculate_band_score(percentage: float) -> float:
    """Convert percentage to IELTS band score (1-9)"""
    if percentage >= 95:
        return 9.0
    elif percentage >= 90:
        return 8.5
    elif percentage >= 85:
        return 8.0
    elif percentage >= 80:
        return 7.5
    elif percentage >= 75:
        return 7.0
    elif percentage >= 70:
        return 6.5
    elif percentage >= 65:
        return 6.0
    elif percentage >= 60:
        return 5.5
    elif percentage >= 55:
        return 5.0
    elif percentage >= 50:
        return 4.5
    elif percentage >= 45:
        return 4.0
    elif percentage >= 40:
        return 3.5
    elif percentage >= 35:
        return 3.0
    elif percentage >= 30:
        return 2.5
    elif percentage >= 25:
        return 2.0
    elif percentage >= 20:
        return 1.5
    else:
        return 1.0


# ============ Email (stub) =========

RESET_TOKEN_EXPIRY_MINUTES = 60


def generate_reset_token() -> str:
    """Generate a pseudo-random token string."""
    # For simplicity use uuid4; safer crypto token could be used in production
    return str(uuid.uuid4())

# Resend Email Configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")

# Initialize Resend
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


async def send_verification_email(to_email: str, verify_link: str, user_name: str = "there") -> bool:
    """Send email verification email via Resend. Returns True on success."""
    if not RESEND_API_KEY:
        logging.getLogger(__name__).warning("Resend not configured; skipping verification email send")
        return False

    try:
        params = {
            "from": RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "Verify your email - testmaster.pro",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #7c3aed; margin: 0;">testmaster.pro</h1>
                        <p style="color: #6b7280; margin-top: 5px;">IELTS & Cambridge AI Exam Prep</p>
                    </div>
                    
                    <p style="font-size: 16px; color: #374151;">Hi {user_name},</p>
                    
                    <p style="font-size: 16px; color: #374151;">Welcome to testmaster.pro! 🎉</p>
                    
                    <p style="font-size: 16px; color: #374151;">Click below to verify your email and unlock all courses:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verify_link}" style="background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Verify Email
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280;">This link expires in 24 hours.</p>
                    
                    <p style="font-size: 14px; color: #6b7280;">Didn't sign up? You can safely ignore this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                        testmaster.pro team<br>
                        Your Cambridge-aligned IELTS AI examiner
                    </p>
                </div>
            """,
        }
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email = await asyncio.to_thread(resend.Emails.send, params)
        logging.getLogger(__name__).info(f"Sent verification email to {to_email}, email_id: {email.get('id')}")
        return True
    except Exception as e:
        logging.getLogger(__name__).error(f"Resend verification email exception for {to_email}: {e}")
        return False


async def send_reset_email(to_email: str, reset_link: str) -> bool:
    """Send a password reset email via Resend. Returns True on success."""
    if not RESEND_API_KEY:
        logging.getLogger(__name__).warning("Resend not configured; skipping email send")
        return False

    try:
        params = {
            "from": RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "IELTS Ace - Password Reset",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #7c3aed; margin: 0;">testmaster.pro</h1>
                        <p style="color: #6b7280; margin-top: 5px;">IELTS & Cambridge AI Exam Prep</p>
                    </div>
                    
                    <p style="font-size: 16px; color: #374151;">Hello,</p>
                    
                    <p style="font-size: 16px; color: #374151;">We received a request to reset the password for your account.</p>
                    
                    <p style="font-size: 16px; color: #374151;">Click the link below to set a new password (valid for 60 minutes):</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" style="background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280;">If you did not request this, you can safely ignore this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                        testmaster.pro team
                    </p>
                </div>
            """,
        }
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email = await asyncio.to_thread(resend.Emails.send, params)
        logging.getLogger(__name__).info(f"Sent reset email to {to_email}, email_id: {email.get('id')}")
        return True
    except Exception as e:
        logging.getLogger(__name__).error(f"Resend reset email exception for {to_email}: {e}")
        return False


# ============ PayPal & Facebook Helpers -> Moved to routes/payments.py and routes/auth.py ============

_GE_TUTOR_SYSTEM_PROMPT = """You are Ray, a warm, encouraging General English tutor — not an exam examiner.
Your job is to help adult learners gain real-world communicative confidence in
English, not to police them against Cambridge IELTS criteria.

Guiding principles:
- Celebrate what the learner is doing right *before* what they need to fix.
- Frame the score as a level snapshot (1=A0, 3=A2, 5=B1, 6=B2, 7=C1, 8-9=C2),
  not as a high-stakes exam band.
- Errors that *block communication* matter most. Cosmetic slips matter least.
- Keep feedback specific and actionable: name the structure, give the fix,
  show a short rewrite — never vague advice like "improve grammar".
- Use simple English the learner can understand. Avoid jargon.
- Always end on a forward-looking line (one thing to practise next).
"""


async def evaluate_with_ai(test_type: str, question: str, user_answer: str, model_answer: Optional[str] = None) -> Dict[str, Any]:
    """Evaluate answer for the General English (V1) product.

    Uses gpt-4o-mini with a friendly tutor persona — *not* IELTS Cambridge
    criteria. The JSON shape is preserved (band_score / criteria objects /
    overall_feedback) so existing V1 frontends keep rendering without
    changes, but the prompt reframes the score as a level snapshot rather
    than an exam band.

    Cost: ~$0.001 per eval (gpt-4o-mini at $0.15/M in, $0.60/M out) vs.
    ~$0.06 for GPT-4o or Sonnet. V1 is a learning surface, not an exam
    surface — sticky-but-cheap is the right trade-off.
    """

    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("EMERGENT_LLM_KEY")

    chat = LlmChat(
        api_key=api_key,
        session_id=str(uuid.uuid4()),
        system_message=_GE_TUTOR_SYSTEM_PROMPT,
    ).with_model("openai", "gpt-4o-mini")

    if test_type == "writing":
        prompt = f"""Give this General English writing response a friendly, tutor-style review.

Prompt:
{question}

Learner's writing:
{user_answer}

BEFORE YOU SCORE:
1. Did the learner roughly address what was asked? (a sensible answer is enough — strict task fulfilment is not the goal)
2. Can a reader follow the meaning, even with errors?
3. Are there 2-3 specific things to celebrate, and 2-3 specific things to fix?

Score 1-9 maps to: 1=A0 beginner · 3=A2 elementary · 5=B1 intermediate · 6=B2 upper-intermediate · 7=C1 advanced · 8-9=C2 mastery.

Return ONLY a JSON object with this structure (no extra text, no markdown, no ``` fences):
{{
  "band_score": <overall band from 1 to 9 - be strict>,
  "task_achievement": {{
    "score": <band 1-9>,
    "feedback": "Direct assessment: Did the response fully address the task? What was missing or off-topic? Be specific about relevance issues."
  }},
  "coherence_cohesion": {{
    "score": <band 1-9>,
    "feedback": "Assessment of organization, paragraphing, and logical flow. Note any mechanical connector usage or poor transitions."
  }},
  "lexical_resource": {{
    "score": <band 1-9>,
    "feedback": "Assessment of vocabulary accuracy and range. Note any wrong word choices, awkward collocations, or memorized phrases."
  }},
  "grammatical_accuracy": {{
    "score": <band 1-9>,
    "feedback": "Assessment of grammar control and error frequency. Note errors that affect meaning comprehension."
  }},
  "major_issues": ["List 2-3 critical problems that justify the band score"],
  "overall_feedback": "4-5 sentences: What the student did well, what critically needs improvement, and specific actionable advice.",
  "band_justification": "1-2 sentences explaining why this band is appropriate and would survive Cambridge moderation"
}}
"""
    else:  # speaking
        prompt = f"""Give this General English speaking response a friendly, tutor-style review.

Question asked:
{question}

Learner's spoken response (transcribed):
{user_answer}

BEFORE YOU SCORE:
1. Did the learner reasonably answer the question? (a natural, on-topic reply is enough)
2. Are ideas understandable, even with some errors?
3. Are there 2-3 specific things to praise, and 2-3 concrete things to work on?

Score 1-9 maps to: 1=A0 beginner · 3=A2 elementary · 5=B1 intermediate · 6=B2 upper-intermediate · 7=C1 advanced · 8-9=C2 mastery.

Return ONLY a JSON object with this structure (no extra text, no markdown, no ``` fences):
{{
  "band_score": <overall band from 1 to 9 - be strict>,
  "fluency_coherence": {{
    "score": <band 1-9>,
    "feedback": "Assessment of natural flow, logical development, and whether ideas connect well. Note any memorized chunks or empty fluency."
  }},
  "lexical_resource": {{
    "score": <band 1-9>,
    "feedback": "Assessment of vocabulary range and accuracy. Note limited range, wrong word choices, or over-reliance on basic words."
  }},
  "grammatical_accuracy": {{
    "score": <band 1-9>,
    "feedback": "Assessment of sentence structures and error frequency. Note errors that impede communication."
  }},
  "pronunciation": {{
    "score": <band 1-9>,
    "feedback": "Assessment based on clarity of expression (from transcription context). Note any repeated unclear expressions."
  }},
  "major_issues": ["List 2-3 critical problems that justify the band score"],
  "overall_feedback": "4-5 sentences: What the student did well, what critically needs improvement, and specific actionable advice.",
  "band_justification": "1-2 sentences explaining why this band is appropriate and would survive Cambridge moderation",
  "model_answer": "Write a Band 7-8 model answer for this exact question (50-80 words). Show ideal vocabulary, grammar, and natural phrasing."
}}
"""
    
    message = UserMessage(text=prompt)
    response = await chat.send_message(message)

    # Normalise response to a Python dict
    if isinstance(response, dict):
        return response

    if isinstance(response, str):
        # Try to strip Markdown code fences if present
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned_lines = cleaned.splitlines()
            cleaned_lines = cleaned_lines[1:]
            if cleaned_lines and cleaned_lines[-1].strip().startswith("```"):
                cleaned_lines = cleaned_lines[:-1]
            cleaned = "\n".join(cleaned_lines).strip()
        try:
            return json.loads(cleaned)
        except Exception:
            return {"band_score": 5.0, "overall_feedback": response}

    return {"band_score": 5.0, "overall_feedback": str(response)}

# ============ Routes ============

@api_router.get("/")
async def root():
    return {"message": "IELTS Ace API"}

# User & Auth routes -> Moved to routes/auth.py

# Test routes


# Top-level health check for deployment readiness (no /api prefix)
@app.get("/health")
async def health_check():
    """Simple health endpoint used by deployment system.

    Returns 200 OK when the app and event loop are up. Does not touch the DB
    to avoid failing health checks due to transient database issues.
    """
    return {"status": "ok"}

@api_router.get("/tests")
async def get_tests(test_type: Optional[str] = None):
    query = {"test_type": test_type} if test_type else {}
    tests = await db.tests.find(query, {"_id": 0}).to_list(100)
    
    # For listening tests, inject audio URLs
    for test in tests:
        if test.get("test_type") == "listening":
            all_listening = [t for t in tests if t.get("test_type") == "listening"]
            all_listening.sort(key=lambda t: t.get("title", ""))
            test_idx = next((i for i, t in enumerate(all_listening) if t["id"] == test["id"]), 0) + 1
            for i, section in enumerate(test.get("sections", [])):
                part_num = i + 1
                audio_path = Path(f"static/audio/listening_tests/test{test_idx}_part{part_num}.mp3")
                if audio_path.exists():
                    section["audio_url"] = f"/api/listening-test-audio/test{test_idx}_part{part_num}"
    
    return tests

@api_router.get("/tests/{test_id}")
async def get_test(test_id: str):
    test = await db.tests.find_one({"id": test_id}, {"_id": 0})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # For listening tests, attach audio URLs from uploaded files
    if test.get("test_type") == "listening":
        for i, section in enumerate(test.get("sections", [])):
            part_num = i + 1
            # Map test to its audio files by checking which test index this is
            all_listening = await db.tests.find(
                {"test_type": "listening"}, {"_id": 0, "id": 1}
            ).sort("title", 1).to_list(20)
            test_idx = next((idx for idx, t in enumerate(all_listening) if t["id"] == test_id), 0) + 1
            audio_path = Path(f"static/audio/listening_tests/test{test_idx}_part{part_num}.mp3")
            if audio_path.exists():
                section["audio_url"] = f"/api/listening-test-audio/test{test_idx}_part{part_num}"
    
    return test

@api_router.get("/listening-test-audio/{filename}")
async def serve_listening_test_audio(filename: str):
    """Serve uploaded listening test audio files"""
    audio_path = Path(f"static/audio/listening_tests/{filename}.mp3")
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(path=audio_path, media_type="audio/mpeg")


@api_router.post("/tests/submit")
async def submit_test(submission: SubmitAnswers):
    # Get test
    test = await db.tests.find_one({"id": submission.test_id}, {"_id": 0})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # Calculate score for objective tests (listening/reading)
    if submission.test_type in ["listening", "reading"]:
        test_type = submission.test_type

        # Map question_id -> question_type from the test definition
        # Keys can be int or str (e.g., "20-21" for combined questions)
        question_type_map: Dict[Union[int, str], str] = {}
        for q in test.get("questions", []):
            qid = q.get("id") or q.get("question_id")
            if qid is None:
                continue
            # Try to convert to int, but keep as string if it contains separators
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                # Combined question ID like "20-21"
                question_type_map[qid] = str(q.get("type") or "unknown").strip().lower()
            else:
                try:
                    qid_int = int(qid)
                    question_type_map[qid_int] = str(q.get("type") or "unknown").strip().lower()
                except (TypeError, ValueError):
                    continue

        # Build a lookup from question_id -> correct answer for robust matching
        # Keys can be int or str (e.g., "20-21" for combined questions)
        # Values can be str or list (for multiple correct answers)
        answer_key_map: Dict[Union[int, str], Union[str, List]] = {}
        for item in test.get("answer_key", []):
            qid = item.get("question_id")
            if qid is None:
                continue
            answer = item.get("answer", "")
            # Try to convert to int, but keep as string if it contains separators
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                # Combined question ID like "20-21"
                answer_key_map[qid] = answer  # Can be a list like ['B', 'D']
            else:
                try:
                    qid_int = int(qid)
                    answer_key_map[qid_int] = str(answer) if not isinstance(answer, list) else answer
                except (TypeError, ValueError):
                    continue

        # Prepare per-skill stats (e.g. Reading – True/False/Not Given)
        # Keyed by (test_type, question_type)
        skill_stats: Dict[str, Dict[str, Any]] = {}

        def _make_skill_key(t_type: str, q_type: str) -> str:
            return f"{t_type}:{q_type or 'unknown'}"

        def _skill_label(t_type: str, q_type: str) -> str:
            base = "Reading" if t_type == "reading" else "Listening"
            type_map = {
                # Reading
                "true_false_notgiven": "True / False / Not Given",
                "yes_no_notgiven": "Yes / No / Not Given",
                "sentence_completion": "Sentence / Note Completion",
                "summary_completion": "Summary Completion",
                "matching_information": "Matching Information",
                "multiple_choice": "Multiple Choice",
                # Listening
                "note_completion": "Note / Form Completion",
                "map_labeling": "Map / Diagram Labelling",
                "multiple_choice_two": "Multiple Choice (Two Options)",
                "matching": "Matching Features",
            }
            pretty = type_map.get(q_type, q_type.replace("_", " ").title() or "Mixed Skills")
            return f"{base} – {pretty}"

        # Initialise totals per skill from answer key
        for qid_int, correct_answer in answer_key_map.items():
            q_type = question_type_map.get(qid_int, "unknown")
            skey = _make_skill_key(test_type, q_type)
            if skey not in skill_stats:
                skill_stats[skey] = {
                    "skill_id": skey,
                    "test_type": test_type,
                    "question_type": q_type,
                    "label": _skill_label(test_type, q_type),
                    "correct": 0,
                    "total": 0,
                }
            skill_stats[skey]["total"] += 1

        correct = 0
        # Calculate total questions, accounting for combined questions
        total = 0
        for item in test.get("answer_key", []):
            answer = item.get("answer")
            qid = item.get("question_id")
            # Combined questions (like "20-21") count as 2 questions
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                # Count based on number of answers in the list
                total += len(answer) if isinstance(answer, list) else 1
            else:
                total += 1
        
        # Build question results with correct/incorrect status
        question_results = []
        
        # Create a map of question id to question text
        question_text_map = {}
        question_options_map: Dict[Any, List[str]] = {}
        question_section_map: Dict[Any, int] = {}
        for q in test.get("questions", []):
            q_id = q.get("id")
            if q_id is not None:
                # Store with original ID (can be int or string like "20-21")
                question_text_map[q_id] = q.get("question", "")
                # Track section/part number so listening evidence excerpts can
                # be looked up in the correct part's transcript.
                sec = q.get("section") or q.get("part")
                if sec is not None:
                    try:
                        question_section_map[q_id] = int(sec)
                        if isinstance(q_id, str) and ('-' in q_id or ',' in q_id):
                            for sub_id in [int(x.strip()) for x in q_id.replace(',', '-').split('-')]:
                                question_section_map[sub_id] = int(sec)
                                question_section_map[str(sub_id)] = int(sec)
                    except (TypeError, ValueError):
                        pass
                opts = q.get("options") or []
                if isinstance(opts, list) and opts:
                    question_options_map[q_id] = [str(o) for o in opts]
                    # Mirror onto sub-IDs so combined "20-21" reaches Q20/Q21.
                    if isinstance(q_id, str) and ('-' in q_id or ',' in q_id):
                        try:
                            for sub_id in [int(x.strip()) for x in q_id.replace(',', '-').split('-')]:
                                question_options_map[sub_id] = [str(o) for o in opts]
                                question_options_map[str(sub_id)] = [str(o) for o in opts]
                        except ValueError:
                            pass

        # Create explanation map from answer_key
        explanation_map = {}
        for item in test.get("answer_key", []):
            q_id = item.get("question_id")
            if q_id is not None:
                # Store with original ID (can be int or string like "20-21")
                explanation_map[q_id] = item.get("explanation", "")
        
        # Helper function to check if answers match (handles multiple correct answers)
        def answers_match(user_ans, correct_ans):
            """
            Check if user answer matches correct answer.
            Returns:
            - For single answers: True/False
            - For multiple answers (Choose TWO): number of correct matches
            Handles:
            - Single answers (string comparison)
            - Multiple answers (list comparison for "Choose TWO" questions)
            - Alternative answers separated by "/" or "or"
            """
            # Handle multiple choice multi questions (user_ans and correct_ans are lists)
            if isinstance(user_ans, list) and isinstance(correct_ans, list):
                # Count how many user answers match correct answers
                user_upper = [str(a).strip().upper() for a in user_ans]
                correct_upper = [str(a).strip().upper() for a in correct_ans]
                matches = sum(1 for ans in user_upper if ans in correct_upper)
                return matches  # Return count of matches (0, 1, or 2 for "Choose TWO")
            
            # Single answer comparison
            user_clean = str(user_ans).strip().lower()
            correct_clean = str(correct_ans).strip().lower()
            
            # Exact match
            if user_clean == correct_clean:
                return True
            
            # Handle alternative answers separated by "/" (e.g., "intestines" or "gut")
            if "/" in correct_clean:
                alternatives = [alt.strip() for alt in correct_clean.split("/")]
                if user_clean in alternatives:
                    return True
            
            # Handle "or" separator (e.g., "intestines or gut")
            if " or " in correct_clean:
                alternatives = [alt.strip() for alt in correct_clean.split(" or ")]
                if user_clean in alternatives:
                    return True
            
            return False

        # ───── Multi-MCQ pre-processing ─────────────────────────────────
        # When a "Choose TWO" question is stored in answer_key as a combined
        # ID like "20-21" with answer ["A","B"], the test interface often
        # submits the two picks as separate Q20/Q21 entries (string answers).
        # Without merging them into the combined-key shape the scoring loop
        # below expects, both rows are skipped and 4 questions go missing
        # from question_results — surfacing as "8/36" or "8/38" totals on
        # the results page even though the test always has 40 questions.
        combined_keys = [k for k in answer_key_map.keys()
                          if isinstance(k, str) and ('-' in k or ',' in k)]
        if combined_keys:
            sub_answer_lookup: Dict[str, Any] = {}
            for ans in submission.answers:
                qid = ans.get("question_id") or ans.get("id")
                if qid is not None:
                    sub_answer_lookup[str(qid)] = ans.get("answer", "")
            merged_answers = list(submission.answers)
            for ck in combined_keys:
                # Already submitted as combined list — keep as-is.
                existing = sub_answer_lookup.get(ck)
                if isinstance(existing, list):
                    continue
                try:
                    sub_ids = [int(x.strip()) for x in ck.replace(',', '-').split('-')]
                except ValueError:
                    continue
                gathered: List[str] = []
                for sub_id in sub_ids:
                    v = sub_answer_lookup.get(str(sub_id), "")
                    if isinstance(v, list):
                        gathered.extend(str(x) for x in v if x)
                    elif v:
                        gathered.append(str(v))
                if not gathered:
                    continue
                drop_ids = {str(s) for s in sub_ids} | {ck}
                merged_answers = [a for a in merged_answers
                                   if str(a.get("question_id") or a.get("id")) not in drop_ids]
                merged_answers.append({"question_id": ck, "answer": gathered})
            submission_answers_iter = merged_answers
        else:
            submission_answers_iter = submission.answers

        # Comparison with support for multiple correct answers and explanations
        for ans in submission_answers_iter:
            qid = ans.get("question_id") or ans.get("id")
            if qid is None:
                continue
            
            # Question ID can be int or string (e.g., "20-21")
            # Normalize it to match the keys in our maps
            qid_normalized = qid
            if isinstance(qid, str) and not ('-' in qid or ',' in qid):
                # Single ID as string - convert to int
                try:
                    qid_normalized = int(qid)
                except (TypeError, ValueError):
                    continue
            
            correct_answer = answer_key_map.get(qid_normalized)
            if correct_answer is None:
                continue

            user_answer = ans.get("answer", "")
            match_result = answers_match(user_answer, correct_answer)
            
            q_type = question_type_map.get(qid_normalized, "unknown")
            
            # Handle combined questions (e.g., "21-22") - split into individual results for clarity
            if isinstance(correct_answer, list) and isinstance(user_answer, list):
                # This is a "Choose TWO" type question - split into individual questions
                # Extract individual question numbers from combined ID (e.g., "21-22" -> [21, 22])
                if isinstance(qid_normalized, str) and '-' in qid_normalized:
                    individual_q_ids = [int(x.strip()) for x in qid_normalized.split('-')]
                else:
                    # Fallback if format is unexpected
                    individual_q_ids = [qid_normalized]
                
                # Ensure we have enough question IDs for the answers
                if len(individual_q_ids) < len(correct_answer):
                    # Generate sequential IDs if needed
                    start_id = individual_q_ids[0] if individual_q_ids else 1
                    individual_q_ids = list(range(start_id, start_id + len(correct_answer)))
                
                # Create separate result entries for each answer.
                # IELTS "Choose TWO" scoring is SET-BASED (order doesn't matter):
                # each correct option = 1 mark if user picked that letter,
                # regardless of click order. Positional matching incorrectly
                # marked [B,C] vs [B,E] as 0/2 when user clicked C before B
                # (rotated to [C,B] vs [B,E]).
                user_upper = [str(a).strip().upper() for a in user_answer]
                correct_upper = [str(a).strip().upper() for a in correct_answer]
                user_set = set(user_upper)
                user_display = ", ".join([u for u in user_upper if u]) or ""

                for idx, (q_id, correct_ans) in enumerate(zip(individual_q_ids, correct_upper)):
                    is_correct_individual = correct_ans in user_set

                    if is_correct_individual:
                        correct += 1

                    # Add individual question result. user_answer keeps the
                    # full pick set so the row UI reads "Your: B,C | Correct: B"
                    # (clarifies WHICH option this row represents while still
                    # showing the user's complete submission).
                    question_results.append({
                        "question_id": q_id,
                        "question_text": question_text_map.get(qid_normalized, f"Question {q_id}"),
                        "question_type": q_type,
                        "user_answer": user_display,
                        "correct_answer": correct_ans,
                        "is_correct": is_correct_individual,
                        "explanation": explanation_map.get(qid_normalized, ""),
                    })
                    
                    # Update skill stats
                    skey = _make_skill_key(test_type, q_type)
                    if skey not in skill_stats:
                        skill_stats[skey] = {
                            "skill_id": skey,
                            "test_type": test_type,
                            "question_type": q_type,
                            "label": _skill_label(test_type, q_type),
                            "correct": 0,
                            "total": 0,
                        }
                    if is_correct_individual:
                        skill_stats[skey]["correct"] += 1
            else:
                # Single answer question
                if isinstance(match_result, bool):
                    is_correct_full = match_result
                    if is_correct_full:
                        correct += 1
                else:
                    # Shouldn't happen, but handle gracefully
                    is_correct_full = False
                
                # For display purposes, convert question ID to int if possible
                display_qid = qid_normalized if isinstance(qid_normalized, int) else qid_normalized
                
                # Add to question results
                question_results.append({
                    "question_id": display_qid,
                    "question_text": question_text_map.get(qid_normalized, f"Question {display_qid}"),
                    "question_type": q_type,
                    "user_answer": user_answer,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct_full,
                    "explanation": explanation_map.get(qid_normalized, ""),
                })
                
                skey = _make_skill_key(test_type, q_type)
                if skey not in skill_stats:
                    skill_stats[skey] = {
                        "skill_id": skey,
                        "test_type": test_type,
                        "question_type": q_type,
                        "label": _skill_label(test_type, q_type),
                        "correct": 0,
                        "total": 0,
                    }
                if is_correct_full:
                    skill_stats[skey]["correct"] += 1

        score_percentage = (correct / total * 100) if total > 0 else 0
        band_score = calculate_band_score(score_percentage)

        # Sort question results by question_id for proper display order
        question_results.sort(key=lambda x: x.get("question_id", 0))

        # ───── Guarantee 40-row results + passage attachment ─────────────
        # Every IELTS reading/listening test has 40 questions. If the user
        # skipped some (or the frontend dropped them), still emit a row so
        # the results UI shows "(no answer)" instead of silently dropping
        # to "8/36" totals.
        covered_qids = {str(qr.get("question_id")) for qr in question_results}

        def _expand_combined(qid):
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                try:
                    parts = [int(x.strip()) for x in qid.replace(',', '-').split('-')]
                    return parts
                except ValueError:
                    return [qid]
            return [qid]

        for ak_qid, correct_ans in answer_key_map.items():
            sub_ids = _expand_combined(ak_qid)
            q_type = question_type_map.get(ak_qid, "unknown")
            if isinstance(correct_ans, list):
                # Combined "Choose TWO" — emit one row per sub-id
                for idx, sub_id in enumerate(sub_ids):
                    if str(sub_id) in covered_qids:
                        continue
                    sub_correct = correct_ans[idx] if idx < len(correct_ans) else ""
                    question_results.append({
                        "question_id": sub_id,
                        "question_text": question_text_map.get(ak_qid, f"Question {sub_id}"),
                        "question_type": q_type,
                        "user_answer": "",
                        "correct_answer": sub_correct,
                        "is_correct": False,
                        "explanation": explanation_map.get(ak_qid, ""),
                    })
                    covered_qids.add(str(sub_id))
                    skey = _make_skill_key(test_type, q_type)
                    if skey not in skill_stats:
                        skill_stats[skey] = {
                            "skill_id": skey,
                            "test_type": test_type,
                            "question_type": q_type,
                            "label": _skill_label(test_type, q_type),
                            "correct": 0,
                            "total": 0,
                        }
            else:
                if str(ak_qid) in covered_qids:
                    continue
                question_results.append({
                    "question_id": ak_qid,
                    "question_text": question_text_map.get(ak_qid, f"Question {ak_qid}"),
                    "question_type": q_type,
                    "user_answer": "",
                    "correct_answer": correct_ans,
                    "is_correct": False,
                    "explanation": explanation_map.get(ak_qid, ""),
                })
                covered_qids.add(str(ak_qid))

        # Recalculate skill totals from the authoritative answer_key (each
        # combined "20-21" key contributes len(answer) sub-questions). The
        # earlier init counted combined keys as 1, undercounting totals.
        for sstats in skill_stats.values():
            sstats["total"] = 0
        for ak_qid, correct_ans in answer_key_map.items():
            q_type = question_type_map.get(ak_qid, "unknown")
            skey = _make_skill_key(test_type, q_type)
            if skey not in skill_stats:
                skill_stats[skey] = {
                    "skill_id": skey,
                    "test_type": test_type,
                    "question_type": q_type,
                    "label": _skill_label(test_type, q_type),
                    "correct": 0,
                    "total": 0,
                }
            n_sub = len(correct_ans) if isinstance(correct_ans, list) else 1
            skill_stats[skey]["total"] += n_sub

        # Build passage map: each test question carries a "passage" field
        # (1/2/3). Combined IDs like "20-21" map to both sub-IDs.
        passage_map: Dict[str, Any] = {}
        for q in test.get("questions", []):
            qid = q.get("id") or q.get("question_id")
            passage_val = q.get("passage")
            if qid is None or passage_val is None:
                continue
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                for sub_id in _expand_combined(qid):
                    passage_map[str(sub_id)] = passage_val
                passage_map[str(qid)] = passage_val
            else:
                passage_map[str(qid)] = passage_val

        for qr in question_results:
            qid_str = str(qr.get("question_id"))
            if qid_str in passage_map:
                qr["passage"] = passage_map[qid_str]

        question_results.sort(
            key=lambda x: int(x["question_id"]) if isinstance(x.get("question_id"), int)
            or (isinstance(x.get("question_id"), str) and x["question_id"].isdigit())
            else 9999
        )

        # Build teacher-style feedback per skill
        skill_breakdown: List[Dict[str, Any]] = []
        strong_skills: List[Dict[str, Any]] = []
        weak_skills: List[Dict[str, Any]] = []

        def _level_from_ratio(ratio: float) -> str:
            if ratio >= 0.8:
                return "strong"
            if ratio >= 0.5:
                return "ok"
            return "needs_practice"

        def _base_tip(t_type: str, q_type: str) -> str:
            # High-level tips per question type
            if t_type == "reading":
                if q_type == "true_false_notgiven" or q_type == "yes_no_notgiven":
                    return "Focus on underlining keywords in the question and scanning the passage to check exactly what is stated. Be careful with 'Not Given' – if the passage doesn’t clearly support or contradict the statement, it’s usually Not Given."
                if q_type == "matching_information":
                    return "Practise skimming paragraphs for topic sentences and key ideas, then matching them to the question prompts."
                if q_type in {"sentence_completion", "summary_completion"}:
                    return "Predict the type of word needed (noun/verb/adjective) and read around the gap so you don’t rely only on single-word matching."
                if q_type == "multiple_choice":
                    return "Train yourself to eliminate clearly wrong options first, then choose between the last two by checking small details and synonyms in the passage."
            if t_type == "listening":
                if q_type in {"note_completion", "sentence_completion"}:
                    return "Use the preparation time to read questions and predict the kind of word you expect to hear. Listen for synonyms and paraphrases, not only the exact words."
                if q_type == "map_labeling":
                    return "Before the recording starts, trace the route with your eyes and note key landmarks (left/right, north/south) so you can follow directions more easily."
                if q_type in {"multiple_choice", "multiple_choice_two"}:
                    return "Listen for signpost words that show when the speaker changes their mind, and be ready for distractors where an option is mentioned but then rejected."
                if q_type == "matching":
                    return "Practise holding several pieces of information in your mind while listening, and draw quick lines/arrows on the question paper to help you keep track."
            # Generic fallback
            return "Review your mistakes in this question type and try to notice patterns: where did you misunderstand, guess, or run out of time? Turn those into small habits to fix next time."

        for skey, stats in skill_stats.items():
            total_q = stats.get("total", 0) or 0
            correct_q = stats.get("correct", 0) or 0
            ratio = (correct_q / total_q) if total_q > 0 else 0.0
            level = _level_from_ratio(ratio)
            stats["level"] = level

            if total_q == 0:
                stats["short_comment"] = "No questions of this type in this test."
            else:
                label = stats.get("label") or "This skill"
                base_tip = _base_tip(test_type, stats.get("question_type", "unknown"))
                if level == "strong":
                    stats["short_comment"] = f"You are strong at {label} ({correct_q}/{total_q} correct). Keep using these questions to boost your overall band score."
                elif level == "ok":
                    stats["short_comment"] = f"You are doing fairly well with {label} ({correct_q}/{total_q} correct), but a bit more practice will make you more consistent."
                else:
                    stats["short_comment"] = f"{label} ({correct_q}/{total_q} correct) is a key area to improve. {base_tip}"

                # Attach a longer tip as well
                stats["tips"] = base_tip

            skill_breakdown.append(stats)

            if level == "strong":
                strong_skills.append(stats)
            elif level == "needs_practice":
                weak_skills.append(stats)

        # Build overall teacher-style feedback (short + detailed)
        def _skill_names(skills: List[Dict[str, Any]], max_count: int = 2) -> str:
            names = [s.get("label", "this skill") for s in skills[:max_count]]
            if not names:
                return ""
            if len(names) == 1:
                return names[0]
            return ", ".join(names[:-1]) + " and " + names[-1]

        test_label = "reading" if test_type == "reading" else "listening"
        
        # Check if Vietnamese language requested
        lang = submission.language if hasattr(submission, 'language') else "en"
        is_vi = lang == "vi"
        
        test_label_vi = "đọc hiểu" if test_type == "reading" else "nghe hiểu"

        short_fb_parts: List[str] = []
        if is_vi:
            short_fb_parts.append(
                f"Trong bài thi {test_label_vi} này, bạn đã trả lời đúng {correct} trên {total} câu hỏi (khoảng {score_percentage:.0f}%)."
            )
        else:
            short_fb_parts.append(
                f"For this {test_label} test, you answered {correct} out of {total} questions correctly (about {score_percentage:.0f}%)."
            )
        strong_names = _skill_names(strong_skills)
        weak_names = _skill_names(weak_skills)
        if strong_names:
            if is_vi:
                short_fb_parts.append(f"Điểm mạnh của bạn là {strong_names}. Hãy tận dụng những câu hỏi này để đạt điểm cao hơn.")
            else:
                short_fb_parts.append(f"Your strongest areas were {strong_names}. Use these questions to secure easy marks.")
        if weak_names:
            if is_vi:
                short_fb_parts.append(f"Bạn nên dành nhiều thời gian luyện tập hơn cho {weak_names} để cải thiện điểm band.")
            else:
                short_fb_parts.append(f"You should focus more practice time on {weak_names} to raise your band.")
        short_teacher_feedback = " ".join(short_fb_parts)

        detailed_parts: List[str] = []
        if is_vi:
            detailed_parts.append(
                f"Nhìn chung, bạn đạt khoảng {score_percentage:.0f}% trong bài thi {test_label_vi} này, tương đương với điểm IELTS khoảng {band_score:.1f}."
            )
            if strong_names:
                detailed_parts.append(
                    f"Bạn thể hiện rõ điểm mạnh ở phần {strong_names}. Hãy luôn làm chắc những câu này trước trong kỳ thi vì chúng phù hợp với kỹ năng hiện tại của bạn."
                )
            if weak_names:
                detailed_parts.append(
                    f"Những phần cần cải thiện là {weak_names}. Sau mỗi bài thi thử, hãy xem lại kỹ những câu hỏi này và so sánh câu trả lời của bạn với đáp án để hiểu rõ mình sai ở đâu."
                )
            detailed_parts.append(
                "Khi luyện tập, hãy bấm giờ nghiêm túc, gạch chân từ khóa trong câu hỏi, và sau khi hoàn thành, dành ít nhất 5-10 phút phân tích lỗi sai thay vì vội chuyển sang bài thi mới. Việc suy ngẫm này mới thực sự giúp cải thiện điểm số."
            )
            detailed_parts.append(
                "Chọn một hoặc hai dạng câu hỏi yếu và tập trung luyện tập chuyên sâu (ví dụ: một trang chỉ toàn câu True/False/Not Given hoặc Note Completion) cho đến khi cảm thấy thoải mái hơn."
            )
        else:
            detailed_parts.append(
                f"Overall, you achieved about {score_percentage:.0f}% on this {test_label} test, which corresponds to an IELTS band of approximately {band_score:.1f}."
            )
            if strong_names:
                detailed_parts.append(
                    f"You showed clear strength in {strong_names}. Try to always secure these marks first in the exam, because they suit your current skills."
                )
            if weak_names:
                detailed_parts.append(
                    f"The main areas to improve are {weak_names}. After each practice test, carefully review these questions and compare your answer with the explanation to see exactly where your understanding differed."
                )
            detailed_parts.append(
                "When practising, time yourself strictly, underline keywords in the questions, and after you finish, spend at least 5–10 minutes analysing your mistakes rather than jumping to a new test. This reflection is what really improves your score."
            )
            detailed_parts.append(
                "Choose one or two weaker question types at a time and drill them using targeted practice (for example, a page of only True/False/Not Given or only Note Completion questions) until they feel more comfortable."
            )
        detailed_teacher_feedback = " ".join(detailed_parts)

        # ───── Insight pipeline (reading + listening) ─────────────────────
        # Tag each wrong question with a reason_code, build reason_summary,
        # root_cause_analysis, fastest_gain (top weak skills) and a lesson
        # recommendation list. The reading results layout reads these keys
        # to populate the 6 insight tiles ("Root Cause", "Fastest Gain"…).
        try:
            from routes.cambridge import (
                classify_reason_code as _classify_reason_code,
                build_root_cause_analysis as _build_root_cause_analysis,
                extract_evidence_text as _extract_evidence_text,
                get_skill_tip as _get_skill_tip,
            )
        except Exception:
            _classify_reason_code = None
            _build_root_cause_analysis = None
            _extract_evidence_text = None
            _get_skill_tip = None

        # Passage text lookup: passage_id (1/2/3) -> full text
        passage_text_map: Dict[Any, str] = {}
        for p in (test.get("passages") or []):
            pid = p.get("id") or p.get("passage_id")
            if pid is not None:
                passage_text_map[pid] = p.get("text", "") or ""
                passage_text_map[str(pid)] = p.get("text", "") or ""

        # Listening evidence pre-pass — attach audioscript excerpts to each
        # listening question (correct AND wrong) so the "Locate in Audioscript"
        # panel works for the dashboard listening tests, mirroring the
        # cambridge.py route behavior.
        listening_transcripts_map: Dict[int, str] = {}
        if test_type == "listening" and _extract_evidence_text is not None:
            listening_transcripts_map = _resolve_listening_transcripts(test)
            if listening_transcripts_map:
                for qr in question_results:
                    qt_lk = (qr.get("question_type") or "").lower()
                    if not qt_lk or any(
                        k in qt_lk for k in ("multiple", "matching", "multi_select")
                    ):
                        continue
                    qid = qr.get("question_id")
                    part_num = (
                        question_section_map.get(qid)
                        or question_section_map.get(str(qid))
                        or 1
                    )
                    p_text = listening_transcripts_map.get(part_num) or ""
                    if not p_text:
                        continue
                    ca = qr.get("correct_answer")
                    try:
                        ev = _extract_evidence_text(ca, p_text)
                        if ev:
                            qr["evidence_text"] = ev
                    except Exception:
                        pass

        reason_summary: Dict[str, int] = {}
        for qr in question_results:
            if qr.get("is_correct"):
                continue
            ua = qr.get("user_answer")
            ca = qr.get("correct_answer")
            qt = qr.get("question_type") or "unknown"
            if _classify_reason_code is not None:
                try:
                    rc = _classify_reason_code(ua, ca, qt)
                    code = rc.get("code", "WRONG_ANSWER")
                    qr["reason_code"] = code
                    qr["reason_label"] = rc.get("label")
                except Exception:
                    code = "UNANSWERED" if not ua else "WRONG_ANSWER"
                    qr["reason_code"] = code
            else:
                code = "UNANSWERED" if not ua else "WRONG_ANSWER"
                qr["reason_code"] = code
            reason_summary[code] = reason_summary.get(code, 0) + 1

            # Evidence text for "Locate in Text" — only meaningful for reading
            if test_type == "reading" and _extract_evidence_text is not None:
                p_text = passage_text_map.get(qr.get("passage")) \
                    or passage_text_map.get(str(qr.get("passage")))
                if p_text:
                    # For MCQ-style questions the answer is just an option
                    # letter (e.g. "B" or ["B","E"]), which can't be located
                    # verbatim in the passage. Substitute the option TEXT for
                    # those letters so the evidence search can find it.
                    search_input = ca
                    is_mcq = isinstance(qt, str) and "multiple_choice" in qt
                    if is_mcq:
                        opts = question_options_map.get(qr.get("question_id")) \
                            or question_options_map.get(str(qr.get("question_id"))) \
                            or question_options_map.get(qid_normalized)
                        if opts:
                            def _opt_text_for(letter: str) -> str:
                                L = str(letter).strip().upper()
                                for o in opts:
                                    s = str(o).strip()
                                    # Match "B: text", "B. text", "B) text" or "B text"
                                    m = re.match(r"^\s*([A-Za-z])\s*[:.\-)]\s*(.+)$", s)
                                    if m and m.group(1).upper() == L:
                                        return m.group(2).strip()
                                    if s[:1].upper() == L and len(s) > 1 and not s[1:2].isalpha():
                                        return s[1:].lstrip(" :.-)").strip()
                                # Fallback: index by alphabetical order if no label prefix
                                idx_alpha = ord(L) - ord('A')
                                if 0 <= idx_alpha < len(opts):
                                    s = str(opts[idx_alpha]).strip()
                                    m = re.match(r"^\s*([A-Za-z])\s*[:.\-)]\s*(.+)$", s)
                                    return (m.group(2).strip() if m else s)
                                return ""
                            if isinstance(ca, list):
                                expanded = [t for t in (_opt_text_for(c) for c in ca) if t]
                                if expanded:
                                    search_input = expanded
                            elif isinstance(ca, str) and len(ca.strip()) == 1 and ca.strip().isalpha():
                                t = _opt_text_for(ca)
                                if t:
                                    search_input = t
                    try:
                        evidence = _extract_evidence_text(search_input, p_text)
                        if evidence:
                            qr["evidence_text"] = evidence
                    except Exception:
                        pass

            # Skill tip — reason-code aware tip for the user's specific mistake
            if _get_skill_tip is not None:
                try:
                    qr["skill_tip"] = _get_skill_tip(
                        section=test_type,
                        qtype=qt,
                        accuracy=0.0,
                        question_text=qr.get("question_text", ""),
                        correct_ans=ca,
                        user_answer=ua,
                        reason_code=code,
                    )
                except Exception:
                    pass

        if _build_root_cause_analysis is not None:
            try:
                root_cause_analysis = _build_root_cause_analysis(
                    reason_summary, {test_type: question_results}
                )
            except Exception:
                root_cause_analysis = []
        else:
            root_cause_analysis = []

        # Fastest gain: top weak skills sorted by wrong_count desc
        fastest_gain = []
        for s in skill_breakdown:
            wrong_count = max(0, (s.get("total", 0) or 0) - (s.get("correct", 0) or 0))
            if wrong_count <= 0:
                continue
            fastest_gain.append({
                "skill_id": s.get("skill_id"),
                "label": s.get("label"),
                "question_type": s.get("question_type"),
                "wrong_count": wrong_count,
                "total": s.get("total", 0),
                "correct": s.get("correct", 0),
                "expected_recovery": max(1, int(round(wrong_count * 0.7))),
            })
        fastest_gain.sort(key=lambda x: x["wrong_count"], reverse=True)
        fastest_gain = fastest_gain[:3]

        # Recommended lessons — local map keyed by question_type (matches
        # the skill_breakdown items rather than cambridge.py's underscore
        # naming convention).
        _LESSON_MAP = {
            "true_false_notgiven": ("tfng-mastery", "True/False/Not Given Mastery",
                                    "/mastery?section=reading&lesson=tfng",
                                    "IELTS Reading Mastery"),
            "yes_no_notgiven": ("ynng-mastery", "Yes/No/Not Given Strategies",
                                "/mastery?section=reading&lesson=ynng",
                                "IELTS Reading Mastery"),
            "matching_headings": ("headings-mastery", "Matching Headings Technique",
                                  "/mastery?section=reading&lesson=headings",
                                  "IELTS Reading Mastery"),
            "matching_information": ("matching-info", "Matching Information Practice",
                                     "/mastery?section=reading&lesson=matching",
                                     "IELTS Reading Mastery"),
            "sentence_completion": ("sentence-comp", "Sentence Completion Skills",
                                    "/mastery?section=reading&lesson=sentence",
                                    "IELTS Reading Mastery"),
            "summary_completion": ("summary-comp", "Summary Completion Strategy",
                                   "/mastery?section=reading&lesson=summary",
                                   "IELTS Reading Mastery"),
            "note_completion": ("note-comp", "Note Completion Listening",
                                "/mastery?section=listening&lesson=notes",
                                "IELTS Listening Mastery"),
            "form_completion": ("form-comp", "Form Completion Skills",
                                "/mastery?section=listening&lesson=forms",
                                "IELTS Listening Mastery"),
            "map_labeling": ("map-labeling", "Map / Diagram Labelling",
                             "/mastery?section=listening&lesson=map",
                             "IELTS Listening Mastery"),
            "multiple_choice": ("mc-strategy", "Multiple Choice Strategy",
                                "/mastery?section=skills&lesson=mc",
                                "IELTS Skills Mastery"),
            "multiple_choice_two": ("mc-two-strategy", "Multiple Choice (Choose Two)",
                                    "/mastery?section=skills&lesson=mc-two",
                                    "IELTS Skills Mastery"),
            "matching": ("matching-features", "Matching Features",
                         "/mastery?section=listening&lesson=matching",
                         "IELTS Listening Mastery"),
        }
        recommended_lessons: List[Dict[str, Any]] = []
        weak_for_recs = [s for s in skill_breakdown
                         if (s.get("total", 0) or 0) > 0
                         and ((s.get("correct", 0) or 0) / s["total"]) < 0.7]
        weak_for_recs.sort(key=lambda s: (s.get("correct", 0) or 0) / max(1, s.get("total", 1)))
        for s in weak_for_recs[:5]:
            qt = s.get("question_type") or ""
            lm = _LESSON_MAP.get(qt)
            if not lm:
                continue
            lesson_id, title, route, course = lm
            tot = s.get("total", 0) or 0
            cor = s.get("correct", 0) or 0
            ratio = (cor / tot) if tot else 0
            recommended_lessons.append({
                "lesson_id": lesson_id,
                "title": title,
                "course": course,
                "route": route,
                "reason": f"Your {s.get('label','this skill')} accuracy is {cor}/{tot} ({int(ratio*100)}%)",
                "priority": "high" if ratio < 0.4 else "medium",
            })

        duration_minutes = round((submission.time_taken or 0) / 60)

        attempt = TestAttempt(
            user_id=submission.user_id,
            test_id=submission.test_id,
            test_type=submission.test_type,
            answers=submission.answers,
            score=score_percentage,
            band_score=band_score,
            feedback={
                "correct": correct,
                "total": total,
                "percentage": score_percentage,
                "message": f"You got {correct} out of {total} correct.",
                "skill_breakdown": skill_breakdown,
                "teacher_feedback": {
                    "short": short_teacher_feedback,
                    "detailed": detailed_teacher_feedback,
                },
                "question_results": question_results,
                "reason_summary": reason_summary,
                "root_cause_analysis": root_cause_analysis,
                "fastest_gain": fastest_gain,
                "recommended_lessons": recommended_lessons,
                "duration_minutes": duration_minutes,
                "passages": [
                    {"id": p.get("id"), "title": p.get("title"), "text": p.get("text", "")}
                    for p in (test.get("passages") or [])
                ],
                "transcript": listening_transcripts_map,
            },
            time_taken=submission.time_taken,
        )
    else:
        # For writing/speaking, include AI evaluation feedback
        feedback_data = {"message": "AI evaluation complete"}
        band_score = 0.0
        
        if submission.test_type == "writing" and submission.writing_feedback:
            # Extract band scores from writing feedback
            task1_fb = submission.writing_feedback.get("task1", {})
            task2_fb = submission.writing_feedback.get("task2", {})
            task1_band = task1_fb.get("band_score", 0) if task1_fb else 0
            task2_band = task2_fb.get("band_score", 0) if task2_fb else 0
            
            # Calculate overall band (Task 2 is weighted more - 2/3)
            if task1_band and task2_band:
                band_score = round((task1_band + task2_band * 2) / 3 * 2) / 2  # Round to nearest 0.5
            elif task2_band:
                band_score = task2_band
            elif task1_band:
                band_score = task1_band
            
            feedback_data = {
                "message": "Writing evaluated by AI",
                "writing_feedback": submission.writing_feedback,
                "task1": task1_fb,
                "task2": task2_fb,
            }
        
        if submission.test_type == "speaking" and submission.speaking_feedback:
            # Calculate average band from speaking feedback
            speaking_bands = [fb.get("band_score", 0) for fb in submission.speaking_feedback.values() if isinstance(fb, dict)]
            if speaking_bands:
                band_score = round(sum(speaking_bands) / len(speaking_bands) * 2) / 2
            
            feedback_data = {
                "message": "Speaking evaluated by AI",
                "speaking_feedback": submission.speaking_feedback,
            }
        
        attempt = TestAttempt(
            user_id=submission.user_id,
            test_id=submission.test_id,
            test_type=submission.test_type,
            answers=submission.answers,
            score=band_score * 10,  # Convert to percentage-like score
            band_score=band_score,
            feedback=feedback_data,
            time_taken=submission.time_taken,
        )

    # Save attempt
    doc = attempt.model_dump()
    doc["completed_at"] = doc["completed_at"].isoformat()
    if submission.test_type in ("listening", "reading"):
        doc["duration_minutes"] = round((submission.time_taken or 0) / 60)
    await db.test_attempts.insert_one(doc)

    # Update user history
    await db.users.update_one(
        {"id": submission.user_id},
        {"$push": {"test_history": attempt.id}},
    )

    # Return attempt so frontend can navigate to results page
    return attempt


# verify-email -> Moved to routes/auth.py


# ================== Payments, Plans, Admin -> Moved to routes/payments.py, routes/admin.py ==================

@api_router.get("/test_attempts/{attempt_id}")
async def get_test_attempt(attempt_id: str):
    attempt = await db.test_attempts.find_one({"id": attempt_id}, {"_id": 0})
    if not attempt:
        raise HTTPException(status_code=404, detail="Test attempt not found")
    
    # Convert completed_at back to datetime for Pydantic model compatibility if needed
    if isinstance(attempt.get("completed_at"), str):
        try:
            attempt["completed_at"] = datetime.fromisoformat(attempt["completed_at"])
        except Exception:
            pass
    
    # Dynamically add explanations from test answer_key if missing
    feedback = attempt.get("feedback", {})
    question_results = feedback.get("question_results", [])
    
    # Check if explanations are missing
    if question_results and not question_results[0].get("explanation"):
        # Fetch the original test to get explanations
        test = await db.tests.find_one({"id": attempt.get("test_id")}, {"_id": 0})
        if test:
            # Build explanation map from answer_key
            explanation_map = {}
            for item in test.get("answer_key", []):
                q_id = item.get("question_id")
                if q_id is not None:
                    explanation_map[int(q_id)] = item.get("explanation", "")
            
            # Add explanations to question_results
            for q in question_results:
                qid = q.get("question_id")
                if qid and not q.get("explanation"):
                    q["explanation"] = explanation_map.get(int(qid), "")
            
            # Update feedback with explanations
            feedback["question_results"] = question_results
            attempt["feedback"] = feedback
    
    return attempt

# AI Evaluation routes
from services.usage_tracking import (
    check_usage,
    increment_usage,
    claim_usage_atomic,
    current_period_key,
)


async def _claim_evaluation_quota(user_id: str, counter: str) -> dict:
    """Atomically claim one unit of `counter` quota for the user. Raises 402
    if exhausted. Returns the user doc on success.

    Caller MUST call _rollback_evaluation_claim(user_id, counter) if the
    downstream work (e.g. AI call) fails, to avoid burning quota on errors.
    """
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    usage = await claim_usage_atomic(db, user, counter)
    if not usage["allowed"]:
        raise HTTPException(
            status_code=402,
            detail={
                "code": "quota_exceeded",
                "message": "Monthly evaluation quota reached. Upgrade to keep going.",
                "counter": counter,
                "used": usage["used"],
                "quota": usage["quota"],
                "period": usage["period"],
                "upgrade_url": "/pricing",
            },
        )
    return user


async def _rollback_evaluation_claim(user_id: str, counter: str) -> None:
    """Decrement a previously-claimed quota unit. Bounded to monthly period
    counter; admin/custom plans use a different storage path and are
    no-ops here (claim_usage_atomic delegated to increment_usage for them,
    which is fine to leave as-is on failure for the rare custom-plan case)."""
    try:
        period = current_period_key()
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {f"usage.{period}.{counter}": -1}},
        )
    except Exception as e:
        logger.warning(f"Quota rollback failed for {user_id}/{counter}: {e}")


@api_router.post("/evaluate/writing")
async def evaluate_writing(data: EvaluateWriting, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(data.user_id, caller)
    await _claim_evaluation_quota(data.user_id, "evaluations")
    try:
        evaluation = await evaluate_with_ai(
            test_type="writing",
            question=data.question,
            user_answer=data.answer
        )
    except Exception as e:
        # Roll back the atomic claim so a failed AI call doesn't burn quota.
        await _rollback_evaluation_claim(data.user_id, "evaluations")
        raise HTTPException(status_code=500, detail=str(e))
    return evaluation

@api_router.post("/evaluate/speaking")
async def evaluate_speaking(data: SpeakingTest, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(data.user_id, caller)
    await _claim_evaluation_quota(data.user_id, "evaluations")
    try:
        evaluation = await evaluate_with_ai(
            test_type="speaking",
            question=data.question,
            user_answer=data.user_response
        )
    except Exception as e:
        await _rollback_evaluation_claim(data.user_id, "evaluations")
        raise HTTPException(status_code=500, detail=str(e))
    return evaluation

# Speaking test with AI - simple transcribe endpoint
@api_router.post("/transcribe-audio")
async def transcribe_audio_simple(file: UploadFile = File(...)):
    """Simple transcription endpoint for beginner course and other uses."""
    try:
        # Read audio file
        audio_data = await file.read()
        
        # Log audio size for debugging
        logger.info(f"Transcribing audio: {len(audio_data)} bytes ({len(audio_data)/1024/1024:.2f} MB)")
        
        if len(audio_data) < 1000:
            raise HTTPException(status_code=400, detail="Audio file too small")
        
        audio_file = io.BytesIO(audio_data)
        audio_file.name = file.filename or "audio.webm"
        
        # First, transcribe with auto-detection to check the language
        response = await stt.transcribe(
            file=audio_file,
            model="whisper-1",
            response_format="verbose_json"  # This includes language detection
        )
        
        transcribed_text = response.text.strip()
        detected_language = getattr(response, 'language', 'en')
        
        logger.info(f"Transcription result: {len(transcribed_text)} chars, detected language: {detected_language}")
        
        # Check if the detected language is English
        if detected_language and detected_language.lower() not in ['en', 'english']:
            logger.warning(f"Non-English speech detected: {detected_language}")
            raise HTTPException(
                status_code=400, 
                detail=f"Please speak in English only. Detected language: {detected_language}. This is an English proficiency test."
            )
        
        if len(transcribed_text) < 5:
            raise HTTPException(status_code=400, detail="Could not transcribe audio clearly. Please speak louder.")
        
        return {"text": transcribed_text, "language": detected_language}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/speaking/questions/{part}")
async def get_speaking_questions(part: int):
    """Get speaking test questions for a specific part"""
    questions_db = {
        1: [
            "Tell me about your hometown.",
            "What do you do? Do you work or are you a student?",
            "Do you enjoy your job/studies? Why?",
            "What are your hobbies or interests?"
        ],
        2: [
            "Describe a memorable event in your life. You should say: what the event was, when it happened, who was there, and explain why it was memorable.",
            "Describe a place you would like to visit. You should say: where it is, why you want to go there, what you would do there, and explain why this place interests you."
        ],
        3: [
            "How has technology changed the way people communicate?",
            "What are the advantages and disadvantages of social media?",
            "Do you think traditional skills are still important in modern society?",
            "How do you think education will change in the future?"
        ]
    }
    
    if part not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Invalid part number")
    
    return {"part": part, "questions": questions_db[part]}

# Progress tracking
@api_router.get("/progress/{user_id}")
async def get_user_progress(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    attempts = await db.test_attempts.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("completed_at", -1).to_list(500)  # Return more attempts
    
    # Convert datetime strings
    for attempt in attempts:
        if isinstance(attempt.get('completed_at'), str):
            attempt['completed_at'] = datetime.fromisoformat(attempt['completed_at'])
    
    # Calculate statistics per type with averages
    by_type = {}
    total_band_score = 0
    band_count = 0
    best_band = 0
    
    # Failed / aborted sessions get persisted with a band of 0-2 (e.g. a mic
    # that didn't capture, an evaluator error). Excluding band <= 2 keeps those
    # from dragging the per-skill averages and counts down (was showing
    # Speaking 1.3 across 24 "tests" when only a couple were genuine).
    MIN_VALID_BAND = 2.0
    for attempt in attempts:
        test_type = attempt['test_type']
        band = attempt.get('band_score', 0) or 0

        if band <= MIN_VALID_BAND:
            continue

        if test_type not in by_type:
            by_type[test_type] = {"count": 0, "total_band": 0, "avg_score": 0.0}

        by_type[test_type]['count'] += 1
        by_type[test_type]['total_band'] += band

        total_band_score += band
        band_count += 1
        if band > best_band:
            best_band = band
    
    # Calculate averages per type
    for type_key in by_type:
        count = by_type[type_key]['count']
        if count > 0:
            by_type[type_key]['avg_score'] = round(by_type[type_key]['total_band'] / count, 1)
    
    # Calculate streak (consecutive days with tests)
    streak = 0
    if attempts:
        today = datetime.now(timezone.utc).date()
        dates_with_tests = set()
        for attempt in attempts:
            if attempt.get('completed_at'):
                completed = attempt['completed_at']
                if isinstance(completed, str):
                    completed = datetime.fromisoformat(completed.replace('Z', '+00:00'))
                dates_with_tests.add(completed.date())
        
        # Count consecutive days from today going backwards
        current_date = today
        while current_date in dates_with_tests:
            streak += 1
            current_date -= timedelta(days=1)
    
    # Calculate badges/achievements
    badges = []
    total_tests = len(attempts)
    avg_band = round(total_band_score / band_count, 1) if band_count > 0 else 0.0
    
    # Test count badges
    if total_tests >= 1:
        badges.append({"id": "first_test", "name": "First Steps", "icon": "🎯", "description": "Completed your first test"})
    if total_tests >= 5:
        badges.append({"id": "five_tests", "name": "Getting Started", "icon": "📚", "description": "Completed 5 tests"})
    if total_tests >= 10:
        badges.append({"id": "ten_tests", "name": "Dedicated Learner", "icon": "🔥", "description": "Completed 10 tests"})
    if total_tests >= 25:
        badges.append({"id": "twentyfive_tests", "name": "IELTS Warrior", "icon": "⚔️", "description": "Completed 25 tests"})
    if total_tests >= 50:
        badges.append({"id": "fifty_tests", "name": "Master Practitioner", "icon": "👑", "description": "Completed 50 tests"})
    
    # Band score badges
    if best_band >= 6:
        badges.append({"id": "band_6", "name": "Band 6 Achiever", "icon": "🥉", "description": "Achieved Band 6 or higher"})
    if best_band >= 7:
        badges.append({"id": "band_7", "name": "Band 7 Expert", "icon": "🥈", "description": "Achieved Band 7 or higher"})
    if best_band >= 8:
        badges.append({"id": "band_8", "name": "Band 8 Master", "icon": "🥇", "description": "Achieved Band 8 or higher"})
    
    # Streak badges
    if streak >= 3:
        badges.append({"id": "streak_3", "name": "On Fire", "icon": "🔥", "description": "3 day streak"})
    if streak >= 7:
        badges.append({"id": "streak_7", "name": "Week Warrior", "icon": "💪", "description": "7 day streak"})
    if streak >= 30:
        badges.append({"id": "streak_30", "name": "Monthly Champion", "icon": "🏆", "description": "30 day streak"})
    
    # Skill mastery badges
    for skill, data in by_type.items():
        if data['avg_score'] >= 7:
            badges.append({"id": f"{skill}_master", "name": f"{skill.capitalize()} Master", "icon": "⭐", "description": f"Band 7+ average in {skill}"})
    
    stats = {
        "total_tests": total_tests,
        "by_type": by_type,
        "average_band_score": avg_band,
        "best_band": best_band,
        "streak": streak,
        "badges": badges,
        "recent_attempts": attempts  # Return ALL attempts for Progress page
    }

    return stats


# ============ DASHBOARD SUMMARY ============
#
# /api/dashboard/summary is the single read the IELTS-Ace dashboard makes on
# mount. It returns everything DashboardPage needs: user state + skill bands
# + streak + recent sessions + a recommended Today's Task, Liz nudge, and
# Mock pick — all derived from real test_attempts data rather than frontend
# fixtures (bug report 2026-04-21: "bilgisi olmadigi halde band bilgisi veriyor").
#
# Today's Task / Liz message / Mock are picked with a small rules engine (no
# LLM call) so they remain deterministic, fast, and free to serve. Copy lives
# inline in SKILL_TASK_LIBRARY below; localise via i18n on the frontend if we
# ever want non-EN output.

SKILL_TASK_LIBRARY = {
    "writing": {
        "today_task_key": "writing_task2_coherence",
        "today_task": {
            "title": "Task 2 coherence drill",
            "description": "Tighten the links between body paragraphs in a Task 2 essay — cohesive devices, topic sentences, and the rhythm that pushes a 6 toward a 7.",
            "duration_minutes": 10,
            "steps": [
                "Identify weak transitions in a sample essay.",
                "Rewrite three body paragraphs with Liz's feedback.",
                "Run the final draft through the evaluator.",
            ],
            "cta_href": "/question-bank/writing/task2",
        },
        "liz_message": "Your writing band is pulling the overall down. Let's work on coherence today — the quietest skill that lifts a 6 toward a 7.",
        "mock_section_href": "/practice-test/writing",
        "mock_recommendation": "Writing full mock (60 min)",
    },
    "reading": {
        "today_task_key": "reading_skim_scan",
        "today_task": {
            "title": "Skim + scan drill",
            "description": "A 20-minute academic passage with True/False/Not Given — build speed without losing the gist.",
            "duration_minutes": 20,
            "steps": [
                "Skim the passage in under three minutes.",
                "Answer the T/F/NG block before reading closely.",
                "Check missed ones against the paragraph that paraphrased them.",
            ],
            "cta_href": "/question-bank/reading",
        },
        "liz_message": "Reading accuracy is where your next half-band lives. A timed T/F/NG set today will tell us which question type is leaking marks.",
        "mock_section_href": "/practice-test/reading",
        "mock_recommendation": "Reading full mock (60 min)",
    },
    "listening": {
        "today_task_key": "listening_section3",
        "today_task": {
            "title": "Section 3 note completion",
            "description": "Academic discussion — the section where most students lose their streak. Focus on signposting words and spelling.",
            "duration_minutes": 15,
            "steps": [
                "Preview the questions for 30 seconds.",
                "Listen once through and answer in real time.",
                "Check spelling — that's where the marks go.",
            ],
            "cta_href": "/question-bank/listening",
        },
        "liz_message": "Listening drops in Section 3 for most students. Let's do a 15-minute set today and see where the gaps are.",
        "mock_section_href": "/practice-test/listening",
        "mock_recommendation": "Listening full mock (30 min)",
    },
    "speaking": {
        "today_task_key": "speaking_part2_cue",
        "today_task": {
            "title": "Part 2 cue card",
            "description": "A two-minute monologue from a fresh cue card — record, self-review, then ask Liz for two concrete fixes.",
            "duration_minutes": 5,
            "steps": [
                "Prepare for 60 seconds.",
                "Record a two-minute answer.",
                "Send it to the evaluator for a band + top-two fixes.",
            ],
            "cta_href": "/question-bank/speaking",
        },
        "liz_message": "Speaking fluency grows with daily minutes, not weekly hours. A single Part 2 cue today keeps the muscle warm.",
        "mock_section_href": "/practice-test/speaking",
        "mock_recommendation": "Speaking mock (11–14 min)",
    },
}

# Fallback when the user has zero history — give them a gentle on-ramp.
NEW_USER_TASK = {
    "today_task_key": "first_drill",
    "today_task": {
        "title": "Your first drill",
        "description": "A ten-minute Writing Task 2 prompt to set a baseline. Liz will read it and flag your first two fixes.",
        "duration_minutes": 10,
        "steps": [
            "Read the prompt and plan for two minutes.",
            "Write 220+ words against the timer.",
            "Submit for a band score and two concrete fixes.",
        ],
        "cta_href": "/question-bank/writing/task2",
    },
    "liz_message": "Welcome in. Before anything else, let's set a baseline — a short writing prompt today tells me where to point the rest of your week.",
    "mock_section_href": "/practice-test",
    "mock_recommendation": "Full mock test (2h 45m)",
    "skill": None,
}


def _skill_from_test_type(test_type: str) -> str:
    """Map legacy test_type values onto the four-skill taxonomy."""
    if not test_type:
        return "writing"
    t = test_type.lower()
    if "writ" in t:
        return "writing"
    if "read" in t:
        return "reading"
    if "listen" in t:
        return "listening"
    if "speak" in t:
        return "speaking"
    return "writing"


def _session_title(attempt: dict) -> str:
    """Build a short editorial title for a recent session card."""
    skill = _skill_from_test_type(attempt.get("test_type"))
    skill_label = {
        "writing": "Writing",
        "reading": "Reading",
        "listening": "Listening",
        "speaking": "Speaking",
    }.get(skill, skill.capitalize())
    test_id = attempt.get("test_id") or ""
    # test_id often encodes the sub-type (e.g. "writing-task2-line-graph").
    subtitle_frag = ""
    if test_id:
        tail = test_id.rsplit("-", 2)
        if len(tail) >= 2:
            subtitle_frag = " — " + tail[-1].replace("_", " ").title()
    return f"{skill_label}{subtitle_frag}"


@api_router.get("/dashboard/summary")
async def get_dashboard_summary(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Everything the authenticated dashboard renders. Derived from the user
    doc + recent test_attempts; no fixtures."""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    attempts = (
        await db.test_attempts.find(
            {"user_id": user_id}, {"_id": 0}
        )
        .sort("completed_at", -1)
        .to_list(200)
    )

    now = datetime.now(timezone.utc)
    today = now.date()

    # --- Per-skill band history (latest 5 attempts per skill, averaged) ---
    per_skill_bands: dict = {
        "listening": [],
        "reading": [],
        "writing": [],
        "speaking": [],
    }
    # Exclude failed/aborted sessions (band <= 2) so they don't drag the
    # per-skill averages down — same rule as /progress.
    for a in attempts:
        skill = _skill_from_test_type(a.get("test_type"))
        band = a.get("band_score") or 0
        if band > 2 and skill in per_skill_bands:
            per_skill_bands[skill].append(float(band))

    skill_bands: dict = {}
    for skill, bands in per_skill_bands.items():
        if not bands:
            skill_bands[skill] = {
                "band": None,
                "pctOfTarget": 0,
                "trend": "flat",
                "attempts": 0,
            }
            continue
        recent = bands[:5]
        avg = round(sum(recent) / len(recent), 1)
        trend = "flat"
        if len(recent) >= 2:
            first_half = recent[len(recent) // 2 :]
            second_half = recent[: len(recent) // 2]
            if sum(second_half) / len(second_half) > sum(first_half) / len(first_half) + 0.25:
                trend = "up"
            elif sum(second_half) / len(second_half) < sum(first_half) / len(first_half) - 0.25:
                trend = "down"
        target = float(user.get("target_band") or 0) or None
        pct = int(round(min(100.0, max(0.0, (avg / target) * 100)))) if target else 0
        skill_bands[skill] = {
            "band": avg,
            "pctOfTarget": pct,
            "trend": trend,
            "attempts": len(bands),
        }

    # --- Weakest skill (must have at least one attempt to be picked) ---
    attempted = {k: v for k, v in skill_bands.items() if v["band"] is not None}
    weakest_skill = None
    if attempted:
        weakest_skill = min(attempted.items(), key=lambda kv: kv[1]["band"])[0]
        # Flag it for the frontend
        skill_bands[weakest_skill]["isWeakest"] = True

    # --- Current band (average across genuine attempts; band <= 2 excluded) ---
    all_bands = [float(a["band_score"]) for a in attempts if (a.get("band_score") or 0) > 2]
    current_band = round(sum(all_bands) / len(all_bands), 1) if all_bands else None
    # Prefer the explicit user doc value if the onboarding flow captured one.
    if user.get("current_band") is not None:
        try:
            current_band = float(user["current_band"])
        except (TypeError, ValueError):
            pass

    target_band = user.get("target_band")
    try:
        target_band = float(target_band) if target_band is not None else None
    except (TypeError, ValueError):
        target_band = None

    # --- Streak: ISO dates of activity in the last 30 days ---
    activity_dates: set = set()
    for a in attempts:
        completed = a.get("completed_at")
        if not completed:
            continue
        if isinstance(completed, str):
            try:
                completed = datetime.fromisoformat(completed.replace("Z", "+00:00"))
            except ValueError:
                continue
        activity_dates.add(completed.date())
    streak_iso = [
        d.isoformat()
        for d in activity_dates
        if (today - d).days <= 30 and (today - d).days >= 0
    ]

    # --- Recent sessions (last 3) ---
    recent_sessions = []
    for a in attempts[:3]:
        completed = a.get("completed_at")
        if isinstance(completed, datetime):
            subtitle_dt = completed
        elif isinstance(completed, str):
            try:
                subtitle_dt = datetime.fromisoformat(completed.replace("Z", "+00:00"))
            except ValueError:
                subtitle_dt = None
        else:
            subtitle_dt = None
        if subtitle_dt:
            delta_days = (today - subtitle_dt.date()).days
            if delta_days == 0:
                subtitle = "Today"
            elif delta_days == 1:
                subtitle = "Yesterday"
            else:
                subtitle = subtitle_dt.strftime("%b %d")
        else:
            subtitle = ""
        recent_sessions.append(
            {
                "title": _session_title(a),
                "subtitle": subtitle,
                "band": a.get("band_score"),
                "attempt_id": a.get("id"),
            }
        )

    # --- Today's Task + Liz + Mock pick ---
    if weakest_skill:
        lib = SKILL_TASK_LIBRARY[weakest_skill]
        today_block = {
            **lib["today_task"],
            "skill": weakest_skill,
            "key": lib["today_task_key"],
        }
        liz_message = lib["liz_message"]
        mock_recommendation = {
            "label": lib["mock_recommendation"],
            "href": lib["mock_section_href"],
        }
    else:
        today_block = {
            **NEW_USER_TASK["today_task"],
            "skill": None,
            "key": NEW_USER_TASK["today_task_key"],
        }
        liz_message = NEW_USER_TASK["liz_message"]
        mock_recommendation = {
            "label": NEW_USER_TASK["mock_recommendation"],
            "href": NEW_USER_TASK["mock_section_href"],
        }

    # --- Weekly study time (Monday 00:00 UTC → now) ---
    # Source = study_time_intervals (heartbeat-tracked active time across the
    # whole site), not just test attempts. The dial used to read 0h 0m for
    # everyone because we only summed completed-test durations.
    week_start = datetime.combine(
        today - timedelta(days=today.weekday()), time.min, tzinfo=timezone.utc
    )
    week_seconds = 0
    async for row in db.study_time_intervals.aggregate(
        [
            {"$match": {"user_id": user_id, "ts": {"$gte": week_start, "$lte": now}}},
            {"$group": {"_id": None, "total": {"$sum": "$seconds"}}},
        ]
    ):
        week_seconds = int(row.get("total", 0))
    total_study_minutes_week = week_seconds // 60

    # --- Days to exam ---
    exam_date = user.get("exam_date")
    days_remaining = None
    if exam_date:
        try:
            exam_dt = datetime.fromisoformat(str(exam_date).replace("Z", "+00:00"))
            days_remaining = max(0, (exam_dt.date() - today).days)
        except ValueError:
            days_remaining = None

    return {
        "user": {
            "id": user.get("id"),
            "email": user.get("email"),
            "name": user.get("name"),
            "first_name": (user.get("name") or "").split(" ")[0] if user.get("name") else None,
            "plan": user.get("plan"),
            "exam_date": exam_date,
            "days_remaining": days_remaining,
        },
        "current_band": current_band,
        "target_band": target_band,
        "skill_bands": skill_bands,
        "weakest_skill": weakest_skill,
        "streak": streak_iso,
        "recent_sessions": recent_sessions,
        "total_study_minutes_week": total_study_minutes_week,
        "today_task": today_block,
        "liz_message": liz_message,
        "mock_recommendation": mock_recommendation,
        "has_history": bool(attempts),
        "generated_at": now.isoformat(),
    }


# ============ TEST COMPLETION TRACKING ============

@api_router.post("/user/track-completion")
async def track_test_completion(
    user_id: str = Body(...),
    test_id: str = Body(...),
    category: str = Body(...),
    band_score: float = Body(default=0.0),
    caller: dict = Depends(auth_session.current_user),
):
    auth_session.require_self_or_admin(user_id, caller)
    """Track a test completion (full test or cambridge)."""
    valid_categories = ["cambridge", "ai_academic", "ai_general"]
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Use: {valid_categories}")

    existing = await db.user_completions.find_one(
        {"user_id": user_id, "test_id": test_id, "category": category}, {"_id": 0}
    )
    record = {
        "user_id": user_id,
        "test_id": test_id,
        "category": category,
        "band_score": band_score,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    if existing:
        await db.user_completions.update_one(
            {"user_id": user_id, "test_id": test_id, "category": category},
            {"$set": record},
        )
    else:
        await db.user_completions.insert_one(record)

    return {"success": True, "message": "Completion tracked"}


@api_router.get("/user/{user_id}/completion-stats")
async def get_user_completion_stats(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get user's test completion stats with breakdown."""
    # Full test / Cambridge completions
    completions = await db.user_completions.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(500)

    cambridge_ids = set()
    ai_academic_ids = set()
    ai_general_ids = set()
    for c in completions:
        cat = c.get("category")
        tid = c.get("test_id")
        if cat == "cambridge":
            cambridge_ids.add(tid)
        elif cat == "ai_academic":
            ai_academic_ids.add(tid)
        elif cat == "ai_general":
            ai_general_ids.add(tid)

    # Practice completions from test_attempts
    practice_skills = {}
    attempts = await db.test_attempts.find(
        {"user_id": user_id}, {"_id": 0, "test_type": 1}
    ).to_list(1000)
    for a in attempts:
        t = a.get("test_type", "unknown")
        practice_skills[t] = practice_skills.get(t, 0) + 1

    total_full_completed = len(cambridge_ids) + len(ai_academic_ids) + len(ai_general_ids)
    total_practice = sum(practice_skills.values())

    return {
        "cambridge": {"completed": len(cambridge_ids), "total": 8, "tests": list(cambridge_ids)},
        "ai_academic": {"completed": len(ai_academic_ids), "total": 8, "tests": list(ai_academic_ids)},
        "ai_general": {"completed": len(ai_general_ids), "total": 4, "tests": list(ai_general_ids)},
        "practice": practice_skills,
        "total_full_completed": total_full_completed,
        "total_full_available": 20,
        "total_practice": total_practice,
    }


# Tips and Courses
@api_router.get("/tips")
async def get_tips(category: Optional[str] = None):
    query = {"category": category} if category else {}
    tips = await db.tips.find(query, {"_id": 0}).to_list(100)
    return tips

@api_router.get("/courses")
async def get_courses():
    courses = await db.courses.find({}, {"_id": 0}).to_list(100)
    return courses

@api_router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


# ============ Generic speech helper ============
# Generic TTS used by BeginnerCourse, MasteryCourse, PracticeMode (Quick Practice).
# Previously mounted under `/vocab-grammar/tts`; renamed 2026-04-23 when the
# old band-tiered Vocab/Grammar course was retired.

@api_router.post("/speech/tts")
async def text_to_speech(request: dict):
    """Generate TTS audio for pronunciation"""
    text = request.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    try:
        from services.openai_compat import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=os.getenv("OPENAI_API_KEY") or os.getenv("EMERGENT_LLM_KEY"))
        # Use generate_speech_base64 for direct base64 output
        audio_base64 = await tts.generate_speech_base64(
            text=text,
            voice="alloy",
            model="tts-1"
        )
        return {"audio": audio_base64, "format": "mp3"}
    except Exception as e:
        logging.getLogger(__name__).error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio")

# Admin endpoint to add new tests
class CreateTestRequest(BaseModel):
    title: str
    test_type: str
    duration: int
    passages: Optional[List[Dict[str, Any]]] = None
    questions: List[Dict[str, Any]]
    answer_key: List[Dict[str, Any]]

@api_router.post("/tests")
async def create_test(test_data: CreateTestRequest):
    """Admin endpoint to create new test content"""
    test = {
        "id": str(uuid.uuid4()),
        **test_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tests.insert_one(test)
    return {"message": "Test created successfully", "test_id": test["id"]}


# ============ Level Test Evaluation ============

# Secure endpoint: serve reading questions WITHOUT answer keys
@api_router.get("/level-test/reading-questions")
async def get_level_test_reading_questions():
    """Return reading questions without correct answers for the simple level test."""
    from level_test_reading_data import LEVEL_TEST_READING_QUESTIONS, strip_answer_keys
    return {"questions": strip_answer_keys(LEVEL_TEST_READING_QUESTIONS)}


@api_router.get("/comprehensive-level-test/reading-questions")
async def get_comprehensive_reading_questions():
    """Return reading questions without correct answers for the comprehensive level test."""
    from level_test_reading_data import COMPREHENSIVE_READING_QUESTIONS, strip_answer_keys
    return {"questions": strip_answer_keys(COMPREHENSIVE_READING_QUESTIONS)}


@api_router.post("/comprehensive-level-test/evaluate-reading")
async def evaluate_comprehensive_reading(payload: Dict[str, Any] = Body(...)):
    """Evaluate reading answers server-side and return results with correct answers."""
    from level_test_reading_data import COMPREHENSIVE_READING_QUESTIONS
    answers = payload.get("answers", {})
    results = []
    total_points = 0
    correct_count = 0
    skill_breakdown = {}
    for q in COMPREHENSIVE_READING_QUESTIONS:
        user_answer = answers.get(str(q["id"]), "")
        is_correct = user_answer.upper() == q["correct"].upper() if user_answer else False
        if is_correct:
            correct_count += 1
            total_points += q.get("band", 0)
        skill = q.get("skill", "general")
        if skill not in skill_breakdown:
            skill_breakdown[skill] = {"correct": 0, "total": 0}
        skill_breakdown[skill]["total"] += 1
        if is_correct:
            skill_breakdown[skill]["correct"] += 1
        results.append({
            "id": q["id"],
            "is_correct": is_correct,
            "user_answer": user_answer,
            "correct_answer": q["correct"],
            "band": q.get("band", 0),
            "skill": skill,
            "passage": q.get("passage", ""),
            "question": q.get("question", ""),
            "options": q.get("options", []),
            "passageExcerpt": q.get("passageExcerpt", ""),
            "explanation": q.get("explanation", ""),
            "skillTip": q.get("skillTip", ""),
        })
    # Audit BE-1: the old math summed each correct question's *difficulty band*
    # and divided by the question count — not a band score (10/10 → 5.5). Use the
    # official Cambridge Academic Reading raw→band table, projecting the N-question
    # score onto the standard 40-question scale. (`total_points` kept for callers
    # that still read it, but the band now comes from the real table.)
    from services.ielts_band_tables import band_for_reading
    n = len(COMPREHENSIVE_READING_QUESTIONS)
    band = band_for_reading(correct_count, total=n, track="academic") if n else 0
    return {
        "correct_count": correct_count,
        "total": n,
        "band": band,
        "skill_breakdown": skill_breakdown,
        "questions": results,
    }


class LevelTestRequest(BaseModel):
    user_id: Optional[str] = None
    reading_answers: Dict[str, str]
    reading_questions: Optional[List[Dict[str, Any]]] = None
    speaking_responses: List[Dict[str, Any]]

@api_router.post("/level-test/evaluate")
async def evaluate_level_test(request: LevelTestRequest):
    """Evaluate user's English level based on reading and speaking responses"""
    from level_test_reading_data import LEVEL_TEST_READING_QUESTIONS
    
    # Use server-side answer keys (ignore any frontend-supplied questions)
    correct_count = 0
    for q in LEVEL_TEST_READING_QUESTIONS:
        user_answer = request.reading_answers.get(str(q["id"]), "")
        if user_answer.upper() == q["correct"].upper():
            correct_count += 1
    
    reading_score = correct_count
    
    # Prepare speaking responses for AI evaluation
    speaking_text = "\n\n".join([
        f"Prompt: {resp['prompt']}\nResponse: {resp['response']}"
        for resp in request.speaking_responses
    ])
    
    # Use Claude to evaluate speaking and determine overall level
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            model="claude-3-sonnet-20240229"
        )
        
        evaluation_prompt = f"""You are an experienced English language assessor. Evaluate the following test responses and determine the student's English proficiency level.

READING SCORE: {reading_score}/5 correct answers
- Questions ranged from Elementary to Advanced level
- Score breakdown: 0-1 = Beginner, 2 = Elementary, 3 = Pre-Intermediate, 4 = Intermediate/Upper-Intermediate, 5 = Advanced

SPEAKING RESPONSES:
{speaking_text}

Based on the reading score and speaking responses, evaluate:
1. Overall English Level (choose ONE): Beginner, Elementary, Pre-Intermediate, Intermediate, Upper-Intermediate, Advanced, or IELTS Ready
2. Speaking assessment: Comment on fluency, vocabulary, grammar, and coherence
3. Recommendations: Suggest 3 specific practice areas or test types

Respond in this exact JSON format:
{{
    "level": "the level name",
    "reading_feedback": "brief feedback on reading performance",
    "speaking_feedback": "detailed speaking assessment (2-3 sentences)",
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}}"""

        response = await chat.send_message(UserMessage(text=evaluation_prompt))
        
        # Parse the response
        response_text = response.text.strip()
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        result["reading_score"] = reading_score
        
        # Save result to user profile if user_id provided
        if request.user_id:
            await db.users.update_one(
                {"id": request.user_id},
                {"$set": {
                    "english_level": result["level"],
                    "level_test_date": datetime.now(timezone.utc).isoformat(),
                    "level_test_result": result
                }}
            )
        
        return result
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Level test evaluation error: {e}")
        
        # Fallback evaluation based on reading score alone
        level_map = {
            0: "Beginner",
            1: "Elementary", 
            2: "Pre-Intermediate",
            3: "Intermediate",
            4: "Upper-Intermediate",
            5: "Advanced"
        }
        
        return {
            "level": level_map.get(reading_score, "Intermediate"),
            "reading_score": reading_score,
            "reading_feedback": f"You answered {reading_score} out of 5 questions correctly.",
            "speaking_feedback": "Your speaking responses have been recorded. Practice regularly to improve fluency and vocabulary range.",
            "recommendations": [
                "Practice reading academic texts daily",
                "Record yourself speaking and listen back",
                "Take full IELTS practice tests to build familiarity"
            ]
        }



# ============ ADAPTIVE LEVEL TEST (Band 2.0-9.0) ============
# Import adaptive test functions
from adaptive_level_test_routes import (
    InitialAssessmentRequest,
    AdaptiveTestRequest,
    determine_starting_level,
    get_adaptive_questions,
    calculate_reading_band,
    evaluate_writing_detailed,
    evaluate_speaking_detailed,
    generate_learning_path
)
from adaptive_level_test_data import READING_QUESTIONS, BAND_SCORE_RANGES
from comprehensive_test_data import WRITING_PROMPTS, SPEAKING_PROMPTS

@api_router.post("/adaptive-level-test/start")
async def start_adaptive_test(request: InitialAssessmentRequest):
    """Get starting questions based on user's self-assessment"""
    starting_level = determine_starting_level(request.experience_level)
    
    # Get questions for the starting level - START WITH 5 QUESTIONS
    reading_questions = get_adaptive_questions(starting_level, "reading")
    
    # Select appropriate writing and speaking prompts
    writing_prompts = WRITING_PROMPTS.get(starting_level, {}).get("prompts", [])
    speaking_prompts = SPEAKING_PROMPTS.get(starting_level, [])
    
    # Select one writing prompt randomly
    import random
    selected_writing = random.choice(writing_prompts) if writing_prompts else {
        "id": "default",
        "prompt": "Write about your typical day. (50-100 words)",
        "min_words": 50,
        "max_words": 100
    }
    
    # Select 3 speaking prompts
    selected_speaking = random.sample(speaking_prompts, min(3, len(speaking_prompts))) if speaking_prompts else [
        {"id": "s_default_1", "question": "Tell me about yourself."},
        {"id": "s_default_2", "question": "What do you like to do in your free time?"},
        {"id": "s_default_3", "question": "Describe a place you like to visit."}
    ]
    
    return {
        "starting_level": starting_level,
        "reading_questions": reading_questions[:5] if reading_questions else [],  # First 5 questions
        "writing_prompt": selected_writing,
        "speaking_prompts": selected_speaking,
        "instructions": {
            "reading": f"You'll start with {starting_level} level questions. Answer carefully - difficulty will adapt based on your performance.",
            "total_reading_questions": "8-12 questions (adapts to your level)",
            "time_estimate": "15-25 minutes total"
        }
    }

@api_router.post("/adaptive-level-test/next-questions")
async def get_next_adaptive_questions(
    current_level: str,
    recent_answers: dict,
    questions_so_far: int
):
    """
    Get next set of questions based on performance
    Called after user completes a batch of questions
    """
    # Calculate accuracy on recent questions
    correct_count = sum(1 for ans in recent_answers.values() if ans.get("correct", False))
    total = len(recent_answers)
    accuracy = correct_count / total if total > 0 else 0
    
    # Determine next level based on adaptive rules
    level_order = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
    current_level_num = level_order.get(current_level, 2)
    
    next_level = current_level
    
    if accuracy >= 0.70 and current_level_num < 6:  # 70%+ correct → level up
        next_level_num = current_level_num + 1
        next_level = [k for k, v in level_order.items() if v == next_level_num][0]
    elif accuracy < 0.50 and current_level_num > 1:  # <50% correct → level down
        next_level_num = current_level_num - 1
        next_level = [k for k, v in level_order.items() if v == next_level_num][0]
    
    # Stop if we've asked enough questions (8-12 range)
    if questions_so_far >= 12:
        return {
            "continue": False,
            "message": "Assessment complete. Proceeding to speaking section.",
            "final_level": next_level
        }
    
    if questions_so_far >= 8 and accuracy >= 0.70:
        # Can stop early if performing well
        return {
            "continue": False,
            "message": "Strong performance detected. Moving to next section.",
            "final_level": next_level
        }
    
    # Get more questions at the next level
    next_questions = get_adaptive_questions(next_level, "reading")
    
    # Determine how many more questions to ask
    remaining = min(5, 12 - questions_so_far)
    
    return {
        "continue": True,
        "next_level": next_level,
        "questions": next_questions[:remaining] if next_questions else [],
        "progress": f"{questions_so_far} of 8-12 completed"
    }

@api_router.post("/adaptive-level-test/evaluate")
async def evaluate_adaptive_test(request: AdaptiveTestRequest):
    """
    Evaluate complete adaptive test with detailed feedback
    Returns band scores (2.0-9.0) and specific error analysis
    """
    try:
        # 1. Calculate Reading Band
        reading_band, reading_accuracy, reading_level, reading_errors = calculate_reading_band(
            request.reading_answers,
            []
        )
        
        # 2. Evaluate Writing (if provided)
        writing_band = 2.0
        writing_analysis = {}
        if request.writing_response and len(request.writing_response) > 20:
            writing_analysis = await evaluate_writing_detailed(
                request.writing_response,
                request.initial_level
            )
            writing_band = writing_analysis.get("band_score", 4.0)
        
        # 3. Evaluate Speaking
        speaking_band = 2.0
        speaking_analysis = {}
        if request.speaking_responses:
            speaking_analysis = await evaluate_speaking_detailed(
                request.speaking_responses,
                request.initial_level
            )
            speaking_band = speaking_analysis.get("band_score", 4.0)
        
        # 4. Calculate Listening Band (simplified for now)
        listening_band = reading_band  # Placeholder
        
        # 5. Calculate Overall Band (weighted average)
        overall_band = round(
            (reading_band * 0.25 + 
             listening_band * 0.25 + 
             writing_band * 0.25 + 
             speaking_band * 0.25),
            1
        )
        
        # 6. Determine CEFR Level
        cefr_mapping = {
            (2.0, 3.0): "A1",
            (3.5, 4.5): "A2",
            (5.0, 5.5): "B1",
            (6.0, 6.5): "B2",
            (7.0, 8.0): "C1",
            (8.5, 9.0): "C2"
        }
        
        cefr_level = "A2"
        for band_range, level in cefr_mapping.items():
            if band_range[0] <= overall_band <= band_range[1]:
                cefr_level = level
                break
        
        # 7. Generate Learning Path
        skill_bands = {
            "reading": reading_band,
            "listening": listening_band,
            "writing": writing_band,
            "speaking": speaking_band
        }
        learning_path = generate_learning_path(overall_band, skill_bands)
        
        # 8. Prepare Detailed Analysis
        detailed_analysis = {
            "reading": {
                "band": reading_band,
                "accuracy": f"{reading_accuracy * 100:.0f}%",
                "level_reached": reading_level,
                "errors": reading_errors,
                "strengths": "Basic comprehension" if reading_band >= 4.0 else "Needs foundation",
                "weaknesses": "Advanced vocabulary" if reading_band < 6.0 else "Minimal"
            },
            "writing": writing_analysis,
            "speaking": speaking_analysis,
            "listening": {
                "band": listening_band,
                "note": "Listening evaluation integrated"
            }
        }
        
        # 9. Next Steps Recommendations
        next_steps = []
        if overall_band < 4.0:
            next_steps = [
                "✅ Start with Foundation courses (FREE)",
                "📚 Practice basic vocabulary daily (10-15 words)",
                "🎙️ Use AI pronunciation tool (10 min/day)",
                "📊 Take mini-tests weekly to track progress"
            ]
        elif overall_band < 5.5:
            next_steps = [
                "📖 Focus on grammar fundamentals",
                "💬 Build vocabulary to 1500+ words",
                "🗣️ Practice speaking daily with AI",
                "✍️ Write short paragraphs (50-100 words)"
            ]
        elif overall_band < 6.5:
            next_steps = [
                "🎯 Start IELTS-specific preparation",
                "📚 Learn academic vocabulary",
                "💪 Practice all 4 skills regularly",
                "📝 Take full practice tests monthly"
            ]
        else:
            next_steps = [
                "🏆 Take full IELTS practice tests",
                "🎓 Focus on Band 7-8 strategies",
                "🔍 Refine weak areas",
                "📅 Book official IELTS test"
            ]
        
        # 10. Save to database (if user_id provided)
        if request.user_id:
            await db.users.update_one(
                {"id": request.user_id},
                {
                    "$set": {
                        "level_test_result": {
                            "overall_band": overall_band,
                            "cefr_level": cefr_level,
                            "skill_bands": skill_bands,
                            "test_date": datetime.now(timezone.utc).isoformat(),
                            "detailed_analysis": detailed_analysis
                        }
                    }
                }
            )
        
        # 11. Estimate time to next band
        time_estimates = {
            (2.0, 3.0): "8-12 weeks with daily practice",
            (3.0, 4.0): "10-14 weeks with daily practice",
            (4.0, 5.0): "12-16 weeks with daily practice",
            (5.0, 6.0): "16-20 weeks with daily practice",
            (6.0, 7.0): "20-24 weeks with intensive practice",
            (7.0, 8.0): "24-32 weeks with expert guidance",
            (8.0, 9.0): "32+ weeks of mastery-level practice"
        }
        
        estimated_time = "12-16 weeks"
        for band_range, time in time_estimates.items():
            if band_range[0] <= overall_band < band_range[1]:
                estimated_time = time
                break
        
        return {
            "overall_band": overall_band,
            "cefr_level": cefr_level,
            "reading_band": reading_band,
            "listening_band": listening_band,
            "writing_band": writing_band,
            "speaking_band": speaking_band,
            "detailed_analysis": detailed_analysis,
            "learning_path": learning_path,
            "next_steps": next_steps,
            "estimated_time_to_next_band": estimated_time,
            "test_completed_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Adaptive test evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")



# ============ Writing Practice Evaluation ============

class WritingPracticeRequest(BaseModel):
    task_type: str  # task1_academic, task1_general, task2
    prompt: str
    essay: str
    word_count: int


# ── Writing Evaluator v2 (Claude Sonnet, 4-criterion + inline annotations) ──

def _map_task_type_hint(task_type: str) -> str:
    """Map the loose task_type string from the client to the v2 TaskType enum."""
    if task_type == "task2":
        return "task2_opinion"
    if task_type == "task1_academic":
        return "task1_academic_chart"
    if task_type == "task1_general":
        return "task1_general_formal"
    return "task2_opinion"


class WritingPracticeV2Request(BaseModel):
    task_type: str
    prompt: str
    essay: str
    user_language: Optional[str] = "en"
    user_id: Optional[str] = None
    test_id: Optional[str] = None
    time_taken: Optional[int] = 0
    # UUIDv4 generated by the client and held stable across retries. When
    # present, a successful evaluation is cached for 10 minutes; repeat
    # POSTs with the same id short-circuit Sonnet and return the cached
    # result. Legacy clients may omit it (no idempotency, billed per call).
    client_request_id: Optional[str] = None


@api_router.post("/writing-practice/evaluate/v2")
async def evaluate_writing_practice_v2(request: WritingPracticeV2Request, caller: dict = Depends(auth_session.current_user)):
    """Claude Sonnet evaluator — returns full WritingEvaluationResult schema.

    New route is additive; /writing-practice/evaluate (below) stays live so old
    clients don't break. Frontend V4 UI consumes this endpoint."""
    from services.writing_evaluator_v2 import evaluate_writing, EvaluatorFailure
    from services import writing_idempotency
    from schemas.writing_evaluator import WritingEvaluationRequest, TaskType
    from security_utils import sanitize_ai_input

    essay = sanitize_ai_input(request.essay or "")
    prompt = sanitize_ai_input(request.prompt or "")
    if not essay.strip():
        raise HTTPException(status_code=400, detail="Essay is empty")
    if not prompt.strip():
        raise HTTPException(status_code=400, detail="Task prompt is required")

    # Idempotency short-circuit: if the client retried with the same
    # client_request_id and we already produced a result, return it
    # without re-billing Sonnet. Cache is keyed by user_id (or "anon"
    # for the unauthenticated practice surface, scoped per-user_id).
    crid = (request.client_request_id or "").strip() or None
    cached = await writing_idempotency.lookup(
        db,
        user_id=request.user_id,
        anon_key=None,
        client_request_id=crid,
    )
    if cached is not None:
        return cached

    # Quota (audit PAY-1): enforce the locked writing caps SERVER-SIDE for
    # authenticated users — previously this hot path ran Sonnet with no quota
    # check, so Free users could run unlimited paid evaluations. Claim AFTER the
    # idempotency short-circuit so a cached retry never double-charges. Anonymous
    # practice (no user_id) is metered by the separate one-per-email anon route.
    # Audit NEW-2: login now required (caller from session). Enforce ownership if
    # a user_id was supplied, otherwise bind it to the authenticated user — closes
    # the "user_id: null → free unlimited Sonnet" bypass.
    if request.user_id:
        auth_session.require_self_or_admin(request.user_id, caller)
    else:
        request.user_id = caller["id"]
    await _claim_evaluation_quota(request.user_id, "evaluations")

    hint = _map_task_type_hint(request.task_type)
    try:
        task_hint_enum = TaskType(hint)
    except ValueError:
        task_hint_enum = TaskType.task2_opinion

    try:
        eval_req = WritingEvaluationRequest(
            essay_text=essay,
            task_type_hint=task_hint_enum,
            task_prompt=prompt,
            user_language=(request.user_language or "en"),
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid request: {exc}")

    try:
        result = await evaluate_writing(eval_req)
    except EvaluatorFailure as exc:
        # Roll back the quota claim so a failed evaluator doesn't burn the user's cap.
        await _rollback_evaluation_claim(request.user_id, "evaluations")
        logging.getLogger(__name__).error(
            "Writing evaluator v2 failed after %d attempts: %s",
            exc.attempts, exc.last_error,
        )
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Evaluator unavailable. Please try again.",
                "attempts": exc.attempts,
                "last_error": exc.last_error,
                # Surface the client_request_id back to the UI so it can
                # reuse the same id on retry (idempotent — no double bill).
                "client_request_id": crid,
                "retryable": True,
            },
        )

    result_dict = result.model_dump()

    # Cache the success so any browser-side retry returns this exact
    # payload. Failures are NOT cached — see writing_idempotency docstring.
    await writing_idempotency.store(
        db,
        user_id=request.user_id,
        anon_key=None,
        client_request_id=crid,
        result=result_dict,
    )

    # Mirror to test_attempts so Progress page + Dashboard see writing history.
    # persist_attempt no-ops on missing user_id (anonymous practice).
    try:
        test_type = "writing_task1" if hint.startswith("task1") else "writing_task2"
        await persist_attempt(
            user_id=request.user_id,
            test_id=request.test_id or f"writing_v2_{hint}",
            test_type=test_type,
            band_score=float(result_dict.get("overall_band") or 0.0),
            feedback={
                "source": "writing-practice/evaluate/v2",
                "task_type": request.task_type,
                "task_hint": hint,
                "prompt": prompt[:2000],
                "evaluation": result_dict,
            },
            time_taken=int(request.time_taken or 0),
        )
    except Exception as _e:
        logging.getLogger(__name__).warning(
            "persist_attempt mirror skipped (writing v2): %s", _e
        )

    return result_dict


# ---------------------------------------------------------------------------
# Public (anonymous) essay evaluation — one evaluation per email, ever.
# Drives the "Score my own essay" lead magnet on sample writing pages.
# No email is sent; result is viewable in-browser only. See project memory
# project_anonymous_essay_evaluation.md for the product rationale.
# ---------------------------------------------------------------------------

_PUBLIC_EVAL_EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")


class PublicEvaluateEssayRequest(BaseModel):
    email: str
    task_type: str = "task2"
    prompt: str
    essay: str
    user_language: Optional[str] = "en"
    # See WritingPracticeV2Request — same shape, anonymous scope.
    client_request_id: Optional[str] = None
    # Opt-in to "Liz's weekly IELTS tips" marketing list. Defaults to False;
    # backend records the flag in MongoDB and (if RESEND_AUDIENCE_ID is set)
    # creates a Resend contact so the email can be broadcast to later.
    marketing_consent: Optional[bool] = False


@api_router.post("/public/evaluate-essay")
async def public_evaluate_essay(request: PublicEvaluateEssayRequest):
    """Anonymous one-per-email writing evaluation.

    Same evaluator as /writing-practice/evaluate/v2, gated on a unique email
    so each visitor can claim a single free report. Reservation is inserted
    atomically *before* the LLM call; the Mongo unique index on `email`
    blocks races. If the evaluator fails, the reservation is rolled back so
    the visitor can retry.
    """
    from services.writing_evaluator_v2 import evaluate_writing, EvaluatorFailure
    from services import writing_idempotency
    from schemas.writing_evaluator import WritingEvaluationRequest, TaskType
    from security_utils import sanitize_ai_input
    from pymongo.errors import DuplicateKeyError

    email = (request.email or "").strip().lower()
    if not _PUBLIC_EVAL_EMAIL_RE.match(email) or len(email) > 254:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    # Idempotency short-circuit before the reservation insert. A client
    # that retried with the same client_request_id (e.g. after a flaky
    # network 502) gets the cached payload — no second LLM call, no
    # second "email already used" 409.
    crid = (request.client_request_id or "").strip() or None
    cached = await writing_idempotency.lookup(
        db,
        user_id=None,
        anon_key=f"anon:email:{email}",
        client_request_id=crid,
    )
    if cached is not None:
        return cached

    essay = sanitize_ai_input(request.essay or "")
    prompt = sanitize_ai_input(request.prompt or "")
    if not essay.strip():
        raise HTTPException(status_code=400, detail="Essay is empty.")
    if len(essay) > 20000:
        raise HTTPException(status_code=400, detail="Essay is too long (max 20,000 chars).")
    if not prompt.strip():
        raise HTTPException(status_code=400, detail="Task prompt is required.")
    if len(prompt) > 4000:
        raise HTTPException(status_code=400, detail="Task prompt is too long.")

    essay_hash = hashlib.sha256(essay.encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)

    # Reserve the email slot. Unique index catches dupes & races.
    try:
        await db.anonymous_evaluations.insert_one({
            "email": email,
            "status": "pending",
            "created_at": now,
            "essay_hash": essay_hash,
            "task_type": request.task_type,
            "user_language": request.user_language or "en",
            "prompt": prompt,
        })
    except DuplicateKeyError:
        existing = await db.anonymous_evaluations.find_one({"email": email})
        if existing and existing.get("status") == "complete" and existing.get("result"):
            # Return the previously generated report so an honest refresh
            # still shows the same answer instead of an error.
            return existing["result"]
        raise HTTPException(
            status_code=409,
            detail="This email has already been used. Each email may claim only one free evaluation.",
        )

    hint = _map_task_type_hint(request.task_type)
    try:
        task_hint_enum = TaskType(hint)
    except ValueError:
        task_hint_enum = TaskType.task2_opinion

    try:
        eval_req = WritingEvaluationRequest(
            essay_text=essay,
            task_type_hint=task_hint_enum,
            task_prompt=prompt,
            user_language=(request.user_language or "en"),
        )
    except Exception as exc:
        # Roll back reservation so the visitor can fix and resubmit.
        await db.anonymous_evaluations.delete_one({"email": email, "status": "pending"})
        raise HTTPException(status_code=400, detail=f"Invalid request: {exc}")

    try:
        result = await evaluate_writing(eval_req)
    except EvaluatorFailure as exc:
        await db.anonymous_evaluations.delete_one({"email": email, "status": "pending"})
        logging.getLogger(__name__).error(
            "Public essay evaluator failed after %d attempts: %s",
            exc.attempts, exc.last_error,
        )
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Evaluator unavailable. Please try again in a moment.",
                "attempts": exc.attempts,
                "last_error": exc.last_error,
                "client_request_id": crid,
                "retryable": True,
            },
        )

    result_dict = result.model_dump()
    await db.anonymous_evaluations.update_one(
        {"email": email},
        {"$set": {
            "status": "complete",
            "completed_at": datetime.now(timezone.utc),
            "result": result_dict,
            "essay": essay,
        }},
    )
    # Store after the email reservation completes so a retry can return
    # the cached result even if the user closes the tab between calls.
    await writing_idempotency.store(
        db,
        user_id=None,
        anon_key=f"anon:email:{email}",
        client_request_id=crid,
        result=result_dict,
    )
    return result_dict


# ---------------------------------------------------------------------------
# Async variant — accepts the submission, returns 202 immediately, and runs
# the evaluator in a background task. When the eval completes we email the
# user a hybrid report (inline band summary + tokenized link to the full
# interactive report at /r/<token>). The user no longer waits ~3 minutes on
# a spinning UI — they close the tab and read the email when it arrives.
#
# The reservation insert + idempotency lookup mirror the sync endpoint so
# anyone holding the legacy /api/public/evaluate-essay path keeps working.
# ---------------------------------------------------------------------------

PUBLIC_EVAL_TOKEN_TTL_DAYS = 7


async def _run_anon_eval_background(
    email: str,
    essay: str,
    prompt: str,
    user_language: str,
    task_type: str,
    crid: Optional[str],
    token: str,
    marketing_consent: bool = False,
) -> None:
    """Background task — does the actual LLM eval, persists, emails the user."""
    from services.writing_evaluator_v2 import evaluate_writing, EvaluatorFailure
    from services import writing_idempotency
    from services.anon_eval_email import (
        send_essay_evaluation_email,
        add_to_marketing_audience,
    )
    from schemas.writing_evaluator import WritingEvaluationRequest, TaskType

    log = logging.getLogger(__name__)
    hint = _map_task_type_hint(task_type)
    try:
        task_hint_enum = TaskType(hint)
    except ValueError:
        task_hint_enum = TaskType.task2_opinion

    try:
        eval_req = WritingEvaluationRequest(
            essay_text=essay,
            task_type_hint=task_hint_enum,
            task_prompt=prompt,
            user_language=user_language,
        )
        result = await evaluate_writing(eval_req)
    except EvaluatorFailure as exc:
        log.error(
            "Async anon eval failed for %s after %d attempts: %s",
            email, exc.attempts, exc.last_error,
        )
        # Mark failed so the visitor can retry with a different email or
        # we can sweep it later; leave the reservation in place so they
        # see "this email already used" if they hit retry-from-form.
        await db.anonymous_evaluations.update_one(
            {"email": email},
            {"$set": {
                "status": "failed",
                "failed_at": datetime.now(timezone.utc),
                "error": str(exc.last_error)[:500],
            }},
        )
        return
    except Exception as exc:
        log.exception("Async anon eval crashed for %s: %s", email, exc)
        await db.anonymous_evaluations.update_one(
            {"email": email},
            {"$set": {"status": "failed", "failed_at": datetime.now(timezone.utc), "error": str(exc)[:500]}},
        )
        return

    result_dict = result.model_dump()
    completed_at = datetime.now(timezone.utc)
    await db.anonymous_evaluations.update_one(
        {"email": email},
        {"$set": {
            "status": "complete",
            "completed_at": completed_at,
            "result": result_dict,
            "essay": essay,
            "token": token,
            "token_expires_at": completed_at + timedelta(days=PUBLIC_EVAL_TOKEN_TTL_DAYS),
        }},
    )
    await writing_idempotency.store(
        db,
        user_id=None,
        anon_key=f"anon:email:{email}",
        client_request_id=crid,
        result=result_dict,
    )
    # Best-effort email — failures are logged inside, not raised. We persist
    # the delivery descriptor so the admin dashboard can surface
    # sent / failed / message-id without re-querying Resend.
    delivery = await send_essay_evaluation_email(email, result_dict, token)
    await db.anonymous_evaluations.update_one(
        {"email": email},
        {"$set": {
            "email_delivery": {
                "ok": delivery.get("ok"),
                "email_id": delivery.get("email_id"),
                "error": delivery.get("error"),
                "sent_at": datetime.now(timezone.utc),
            }
        }},
    )

    # Marketing opt-in side-effect — only if the visitor actively ticked
    # the "Send me Liz's weekly tips" checkbox. We add to the Resend
    # audience after the eval succeeds (no point growing the list with
    # failed submissions) and persist the audience-side result so the
    # admin dashboard can surface duplicate / failed contact creates.
    if marketing_consent:
        audience = await add_to_marketing_audience(email)
        await db.anonymous_evaluations.update_one(
            {"email": email},
            {"$set": {
                "marketing_audience": {
                    "ok": audience.get("ok"),
                    "skipped": audience.get("skipped", False),
                    "reason": audience.get("reason") or audience.get("error"),
                    "contact_id": audience.get("contact_id"),
                    "synced_at": datetime.now(timezone.utc),
                }
            }},
        )


@api_router.post("/public/evaluate-essay/async")
async def public_evaluate_essay_async(request: PublicEvaluateEssayRequest, background_tasks: BackgroundTasks):
    """Async one-per-email evaluation: 202 + emailed report when ready."""
    from services import writing_idempotency
    from security_utils import sanitize_ai_input
    from pymongo.errors import DuplicateKeyError

    email = (request.email or "").strip().lower()
    if not _PUBLIC_EVAL_EMAIL_RE.match(email) or len(email) > 254:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    crid = (request.client_request_id or "").strip() or None

    # Idempotency short-circuit — same request_id resubmits return cached.
    cached = await writing_idempotency.lookup(
        db,
        user_id=None,
        anon_key=f"anon:email:{email}",
        client_request_id=crid,
    )
    if cached is not None:
        existing = await db.anonymous_evaluations.find_one({"email": email})
        token = (existing or {}).get("token")
        return {
            "status": "complete",
            "token": token,
            "estimated_minutes": 0,
        }

    essay = sanitize_ai_input(request.essay or "")
    prompt = sanitize_ai_input(request.prompt or "")
    if not essay.strip():
        raise HTTPException(status_code=400, detail="Essay is empty.")
    if len(essay) > 20000:
        raise HTTPException(status_code=400, detail="Essay is too long (max 20,000 chars).")
    if not prompt.strip():
        raise HTTPException(status_code=400, detail="Task prompt is required.")
    if len(prompt) > 4000:
        raise HTTPException(status_code=400, detail="Task prompt is too long.")

    essay_hash = hashlib.sha256(essay.encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)
    token = uuid.uuid4().hex

    try:
        await db.anonymous_evaluations.insert_one({
            "email": email,
            "status": "pending",
            "created_at": now,
            "essay_hash": essay_hash,
            "task_type": request.task_type,
            "user_language": request.user_language or "en",
            "prompt": prompt,
            "token": token,
            "token_expires_at": now + timedelta(days=PUBLIC_EVAL_TOKEN_TTL_DAYS),
            "marketing_consent": bool(request.marketing_consent),
            "marketing_consent_at": now if request.marketing_consent else None,
        })
    except DuplicateKeyError:
        existing = await db.anonymous_evaluations.find_one({"email": email})
        if existing and existing.get("status") == "complete":
            return {
                "status": "complete",
                "token": existing.get("token"),
                "estimated_minutes": 0,
            }
        if existing and existing.get("status") == "pending":
            return {
                "status": "pending",
                "token": existing.get("token"),
                "estimated_minutes": 3,
            }
        raise HTTPException(
            status_code=409,
            detail="This email has already been used. Each email may claim only one free evaluation.",
        )

    # Schedule the background eval. FastAPI runs this after the 202 response
    # is sent, so the visitor sees the success state immediately.
    background_tasks.add_task(
        _run_anon_eval_background,
        email=email,
        essay=essay,
        prompt=prompt,
        user_language=request.user_language or "en",
        task_type=request.task_type,
        crid=crid,
        token=token,
        marketing_consent=bool(request.marketing_consent),
    )

    return {
        "status": "queued",
        "token": token,
        "estimated_minutes": 3,
    }


@api_router.get("/public/evaluate-essay/result/{token}")
async def public_get_essay_result(token: str):
    """Retrieve a completed anonymous evaluation by its tokenized URL."""
    if not token or len(token) < 16 or len(token) > 64:
        raise HTTPException(status_code=404, detail="Result not found.")

    doc = await db.anonymous_evaluations.find_one({"token": token})
    if not doc:
        raise HTTPException(status_code=404, detail="Result not found.")

    status = doc.get("status")
    if status == "pending":
        return {"status": "pending", "estimated_minutes": 3}
    if status == "failed":
        raise HTTPException(
            status_code=502,
            detail="Evaluation failed. Please try again with a different email.",
        )
    if status != "complete" or not doc.get("result"):
        raise HTTPException(status_code=404, detail="Result not found.")

    expires_at = doc.get("token_expires_at")
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="This report link has expired.")

    return {
        "status": "complete",
        "result": doc["result"],
        "essay": doc.get("essay"),
        "prompt": doc.get("prompt"),
        "task_type": doc.get("task_type"),
        "completed_at": doc.get("completed_at"),
    }


# ---------------------------------------------------------------------------
# Evaluator rating capture — anonymous 1-5 star + optional comment. Drives
# the "Rate this evaluator" action in PublicScoreCard (sample pages +
# /score-my-essay). Best-effort storage: no auth, no rate limit beyond
# client-side localStorage gate. If abuse shows up, add IP throttle.
# ---------------------------------------------------------------------------

class EvaluatorRatingRequest(BaseModel):
    stars: int
    comment: Optional[str] = None
    page_url: Optional[str] = None


@api_router.post("/public/evaluator-rating")
async def public_evaluator_rating(request: EvaluatorRatingRequest, http_request: Request):
    if not isinstance(request.stars, int) or not (1 <= request.stars <= 5):
        raise HTTPException(status_code=400, detail="stars must be an integer between 1 and 5")
    comment = (request.comment or "").strip()
    if len(comment) > 2000:
        comment = comment[:2000]
    page_url = (request.page_url or "").strip()[:500] or None
    ua = (http_request.headers.get("user-agent") or "")[:300]
    await db.evaluator_ratings.insert_one({
        "stars": request.stars,
        "comment": comment or None,
        "page_url": page_url,
        "created_at": datetime.now(timezone.utc),
        "user_agent": ua,
    })
    return {"ok": True}


@api_router.post("/writing-practice/evaluate")
async def evaluate_writing_practice(request: WritingPracticeRequest, _caller: dict = Depends(auth_session.current_user)):
    """Retired — superseded by /api/writing-practice/evaluate/v2 (Sonnet)."""
    # Audit cleanup: this legacy path ran GPT-4o via EMERGENT_LLM_KEY (wrong
    # model for IELTS calibration, no idempotency/quota guard) and has no
    # frontend caller. Retire it so a stray client can't bill OpenAI or receive
    # miscalibrated scores. The live writing evaluator is the Sonnet-backed v2.
    raise HTTPException(
        status_code=410,
        detail={
            "code": "endpoint_retired",
            "message": "Use /api/writing-practice/evaluate/v2 instead.",
            "replacement": "/api/writing-practice/evaluate/v2",
        },
    )
    try:  # noqa: unreachable — retained below the 410 until the dead body is pruned
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="""You are a qualified IELTS teacher, not just an evaluator. You must think step by step like a real teacher:
- First check whether the student's response is valid before giving any score
- If the task is invalid (off-topic, too short, missing required elements), the band score MUST be limited
- Be honest and strict - do NOT give generous scores by default
- Prioritize feedback on the most important errors, not every small mistake
- Adjust your tone based on student level: supportive for weak students, precise for advanced"""
        ).with_model("openai", "gpt-4o")
        
        task_type_desc = {
            "task1_academic": "IELTS Academic Writing Task 1 (graph/chart/diagram description)",
            "task1_general": "IELTS General Training Writing Task 1 (letter writing)",
            "task2": "IELTS Writing Task 2 (essay)"
        }.get(request.task_type, "IELTS Writing Task")
        
        min_words = 250 if request.task_type == "task2" else 150
        is_task2 = request.task_type == "task2"
        
        prompt = f"""You are a qualified IELTS teacher evaluating this {task_type_desc} submission.

CRITICAL INSTRUCTION: You MUST be consistent and strict across ALL evaluations. Do NOT give better scores on repeated submissions unless the content genuinely improves.

====================================
TASK PROMPT:
====================================
{request.prompt}

====================================
STUDENT'S RESPONSE ({request.word_count} words):
====================================
{request.essay}

====================================
IELTS TEACHER EVALUATION FRAMEWORK
====================================

**STEP 1: VALIDITY CHECK (MANDATORY - Do this FIRST)**

CRITICAL OFF-TOPIC DETECTION:
- Compare the student's response with the TASK PROMPT above
- If the student wrote about something COMPLETELY DIFFERENT from what was asked, mark on_topic as FALSE
- Examples of off-topic: Writing about personal life when asked to describe a graph, discussing unrelated topics, not addressing the question at all
- An off-topic response MUST receive Band 1.0-2.0 for Task Achievement, regardless of language quality

Apply these rules strictly BEFORE scoring:

For Task 1 (minimum 150 words):
- If under 150 words → Band is CAPPED at 4.0 maximum
- If response is off-topic or mostly unrelated → Band CANNOT exceed 4.0
- If no clear overview/summary of main trends → Band CANNOT exceed 5.0

For Task 2 (minimum 250 words):
- If under 250 words → Band is CAPPED at 4.0 maximum
- If response is off-topic or mostly unrelated → Band CANNOT exceed 4.0
- If no clear position/opinion stated → Band CANNOT exceed 5.0
- If no clear paragraph structure → Band CANNOT exceed 5.5

Current submission: {request.word_count} words (Minimum required: {min_words} words)

**STEP 2: BAND SCORING (Be Strict)**
- Do NOT give generous scores by default
- If response is weak, unclear, short, or off-topic → give Band 1-4
- Only give Band 5-7 if response clearly meets IELTS criteria
- Band 8-9 is rare and requires exceptional quality

**STEP 3: ERROR PRIORITIZATION (Teacher Logic)**
Prioritize errors in this order:
1. Task misunderstanding or missing required elements
2. Grammar errors that block meaning
3. Repeated grammar pattern errors
4. Vocabulary misuse or unnatural collocations
5. Minor grammar or spelling mistakes

**STEP 4: TEACHER-STYLE CORRECTIONS**
For each correction, use this format:
- Quote the student's exact words
- Provide the corrected version
- Give a simple, clear explanation
- Optionally provide a better/more natural alternative

Provide your evaluation in this JSON format:
{{
    "validity_check": {{
        "is_valid": <true/false>,
        "word_count_valid": <true/false>,
        "on_topic": <true/false>,
        "has_required_elements": <true/false>,
        "validity_issues": ["<list any validity problems>"],
        "band_cap_applied": <null or number if capped>,
        "cap_reason": "<explanation if band is capped>"
    }},
    "overall_band": <float between 1.0 and 9.0, in 0.5 increments>,
    "band_confidence": "<high/medium/low>",
    "scores": {{
        "task_achievement": <float 1.0-9.0>,
        "coherence_cohesion": <float 1.0-9.0>,
        "lexical_resource": <float 1.0-9.0>,
        "grammar": <float 1.0-9.0>
    }},
    "teacher_summary": "<2-3 sentences like a real teacher would say, addressing the student directly>",
    "key_problems": [
        {{
            "priority": <1-5>,
            "category": "<task_response/grammar/vocabulary/coherence>",
            "issue": "<specific problem description>",
            "impact": "<how this affects the score>"
        }}
    ],
    "strengths": ["<specific things done well with examples from the text>"],
    "corrections": [
        {{
            "original": "<exact quote from student>",
            "corrected": "<corrected version>",
            "explanation": "<simple, clear explanation>",
            "better_alternative": "<more natural/sophisticated option if applicable>"
        }}
    ],
    "next_steps": ["<maximum 3 actionable suggestions for improvement>"],
    "improved_paragraph": "<rewrite ONE weak paragraph showing how to improve it, or provide a model introduction/conclusion>"
}}

Remember:
- Be honest but encouraging - never humiliate the student
- Adjust tone based on level: supportive for weak students, precise for advanced
- Focus on the MOST important issues, not every small error
- Give specific examples from the student's text"""

        response = await chat.send_message(UserMessage(text=prompt))
        
        # Handle different response formats
        if isinstance(response, dict):
            return response
        
        response_text = str(response).strip()
        
        # Try to extract JSON from response
        import re
        # Remove markdown code fences if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            result = json.loads(json_match.group())
            return result
        
        # Fallback response with validity check
        word_count_valid = request.word_count >= min_words
        band_cap = 4.0 if not word_count_valid else None
        
        return {
            "validity_check": {
                "is_valid": word_count_valid,
                "word_count_valid": word_count_valid,
                "on_topic": True,
                "has_required_elements": True,
                "validity_issues": [] if word_count_valid else [f"Word count ({request.word_count}) is below minimum ({min_words})"],
                "band_cap_applied": band_cap,
                "cap_reason": f"Band capped at 4.0 due to insufficient word count" if band_cap else None
            },
            "overall_band": min(4.0, 5.5) if not word_count_valid else 5.5,
            "band_confidence": "medium",
            "scores": {
                "task_achievement": 4.0 if not word_count_valid else 5.5,
                "coherence_cohesion": 5.0,
                "lexical_resource": 5.0,
                "grammar": 5.0
            },
            "teacher_summary": "I've reviewed your writing. Let me share some feedback to help you improve." if word_count_valid else f"I notice your response is only {request.word_count} words. For this task, you need at least {min_words} words. This significantly affects your score.",
            "key_problems": [{"priority": 1, "category": "task_response", "issue": f"Word count below minimum ({request.word_count}/{min_words})", "impact": "Band capped at 4.0"}] if not word_count_valid else [],
            "strengths": ["You attempted the task"],
            "corrections": [],
            "next_steps": [f"Write at least {min_words} words", "Develop your ideas more fully", "Practice time management"],
            "improved_paragraph": "Unable to generate improved version. Please try again."
        }
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Writing evaluation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate writing")


# ============ Level Test Evaluation & Recommendations ============

class LevelTestSpeakingEvaluation(BaseModel):
    responses: List[Dict[str, Any]]  # [{"level": "A1-A2", "transcript": "..."}]
    language: Optional[str] = "en"  # en, vi, tr

class CourseRecommendationRequest(BaseModel):
    overall_band: float
    reading_band: float
    speaking_band: float
    weaknesses: List[str]
    skill_breakdown: Dict[str, Any]
    language: Optional[str] = "en"  # en, vi, tr

@api_router.post("/level-test/evaluate-speaking")
async def evaluate_level_test_speaking(request: LevelTestSpeakingEvaluation):
    """
    Evaluate speaking responses from comprehensive level test.
    Returns detailed band score, weaknesses, and specific improvement areas.
    OPTIMIZED: Uses simpler, faster evaluation for better user experience.
    """
    try:
        # First, provide quick estimation based on transcript length and content
        responses = request.responses
        total_words = 0
        total_responses = len(responses)
        
        for r in responses:
            transcript = r.get('transcript', '')
            words = len(transcript.split())
            total_words += words
        
        avg_words = total_words / max(total_responses, 1)
        
        # Quick band estimation based on response length and complexity
        # This gives immediate feedback while AI processes
        quick_band = 4.0
        if avg_words > 100:
            quick_band = 6.5
        elif avg_words > 70:
            quick_band = 6.0
        elif avg_words > 50:
            quick_band = 5.5
        elif avg_words > 30:
            quick_band = 5.0
        elif avg_words > 15:
            quick_band = 4.5
        
        # Use a simpler, faster prompt
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an IELTS speaking examiner. Evaluate quickly and return only JSON."
        ).with_model("openai", "gpt-4o-mini")  # Faster model
        
        # Format responses concisely
        responses_text = ""
        for idx, r in enumerate(request.responses, 1):
            transcript = r.get('transcript', '')[:200]  # Limit length for speed
            responses_text += f"Q{idx}: {transcript}\n"
        
        # Shorter, faster prompt
        evaluation_prompt = f"""Evaluate this IELTS speaking test. Return ONLY JSON:

{responses_text}

Return this JSON (fill in values):
{{"overall_band": 5.5, "criteria_scores": {{"fluency_coherence": 5.5, "lexical_resource": 5.0, "grammatical_range_accuracy": 5.5, "pronunciation": 5.5}}, "cefr_level": "B1", "strengths": ["strength1", "strength2"], "weaknesses": ["weakness1", "weakness2"], "improvement_recommendations": ["tip1", "tip2"], "detailed_feedback": "2-3 sentence feedback"}}"""

        try:
            response = await asyncio.wait_for(
                chat.send_message(UserMessage(text=evaluation_prompt)),
                timeout=15.0  # 15 second timeout
            )
            
            response_text = str(response)
            
            import re
            response_text = re.sub(r'```json\s*', '', response_text)
            response_text = re.sub(r'```\s*', '', response_text)
            
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                result = json.loads(json_match.group())
                # Add missing fields with defaults
                result.setdefault("pronunciation_issues", [])
                result.setdefault("vocabulary_gaps", [])
                return result
                
        except asyncio.TimeoutError:
            logger.warning("Speaking evaluation timed out, using quick estimation")
        except Exception as e:
            logger.warning(f"AI evaluation failed: {e}, using quick estimation")
        
        # Fallback: Return quick estimation if AI is slow/fails
        language = request.language
        
        if language == "vi":
            strengths = ["Phát âm cơ bản rõ ràng", "Có thể diễn đạt ý tưởng đơn giản"]
            weaknesses = ["Cần mở rộng vốn từ vựng", "Cần cải thiện ngữ pháp phức tạp"]
            recommendations = ["Luyện nói 15-20 phút mỗi ngày", "Học thêm từ vựng học thuật"]
            feedback = f"Trình độ nói của bạn ước tính khoảng Band {quick_band}. Tiếp tục luyện tập để cải thiện!"
        elif language == "tr":
            strengths = ["Temel telaffuz anlaşılır", "Basit fikirler ifade edilebilir"]
            weaknesses = ["Kelime dağarcığı genişletilmeli", "Karmaşık dilbilgisi geliştirilmeli"]
            recommendations = ["Günde 15-20 dakika konuşma pratiği yapın", "Akademik kelimeler öğrenin"]
            feedback = f"Konuşma seviyeniz yaklaşık Band {quick_band} olarak tahmin edilmektedir. Pratik yapmaya devam edin!"
        else:
            strengths = ["Basic pronunciation is clear", "Able to express simple ideas"]
            weaknesses = ["Vocabulary range needs expansion", "Complex grammar needs practice"]
            recommendations = ["Practice speaking 15-20 minutes daily", "Learn academic vocabulary"]
            feedback = f"Your speaking level is estimated at Band {quick_band}. Keep practicing to improve!"
        
        return {
            "overall_band": quick_band,
            "criteria_scores": {
                "fluency_coherence": quick_band,
                "lexical_resource": quick_band - 0.5,
                "grammatical_range_accuracy": quick_band,
                "pronunciation": quick_band + 0.5
            },
            "cefr_level": "A2" if quick_band < 4.5 else "B1" if quick_band < 5.5 else "B2" if quick_band < 7.0 else "C1",
            "strengths": strengths,
            "weaknesses": weaknesses,
            "pronunciation_issues": [],
            "improvement_recommendations": recommendations,
            "vocabulary_gaps": [],
            "detailed_feedback": feedback
        }
        
    except Exception as e:
        logger.error(f"Speaking evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

@api_router.post("/level-test/recommend-courses")
async def recommend_courses(request: CourseRecommendationRequest):
    """
    Generate personalized course recommendations based on level test results.
    Returns recommended courses with reasoning and a learning roadmap.
    """
    try:
        # Determine primary course based on overall band
        if request.overall_band < 4.5:
            primary_course = {
                "id": "beginner",
                "name": "Foundation Course",
                "band_range": "Band 2.0 - 4.5",
                "reason": "Build essential English fundamentals",
                "priority": "Start Here"
            }
            secondary_course = {
                "id": "mastery",
                "name": "Mastery Course",
                "band_range": "Band 5.5 - 6.5",
                "reason": "Progress to after completing foundation",
                "priority": "Next Step"
            }
        elif 4.5 <= request.overall_band < 6.5:
            primary_course = {
                "id": "mastery",
                "name": "Mastery Course",
                "band_range": "Band 5.5 - 6.5",
                "reason": "Break through intermediate plateau",
                "priority": "Start Here"
            }
            secondary_course = {
                "id": "advanced",
                "name": "Advanced Mastery",
                "band_range": "Band 6.5 - 9.0",
                "reason": "Target high band scores after mastery",
                "priority": "Next Step"
            }
        else:
            primary_course = {
                "id": "advanced",
                "name": "Advanced Mastery",
                "band_range": "Band 6.5 - 9.0",
                "reason": "Achieve Band 7+ with advanced strategies",
                "priority": "Start Here"
            }
            secondary_course = {
                "id": "mastery",
                "name": "Mastery Course",
                "band_range": "Band 5.5 - 6.5",
                "reason": "Review fundamentals if needed",
                "priority": "Optional Review"
            }
        
        # Generate personalized learning roadmap using AI
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an expert IELTS preparation advisor creating personalized study plans."
        ).with_model("openai", "gpt-5.1")  # Using GPT-5.1 instead of Claude
        
        weaknesses_text = "\n".join([f"- {w}" for w in request.weaknesses])
        
        # Language-specific instructions
        language_instructions = {
            "vi": "\n\nIMPORTANT: Provide ALL text fields (weekly_plan goals/activities, priority_skills, study_tips, milestone_goals) in VIETNAMESE language so parents can understand the roadmap clearly.",
            "tr": "\n\nIMPORTANT: Provide ALL text fields (weekly_plan goals/activities, priority_skills, study_tips, milestone_goals) in TURKISH language so parents can understand the roadmap clearly.",
            "en": ""
        }
        
        language_note = language_instructions.get(request.language, "")
        
        roadmap_prompt = f"""Create a personalized 8-12 week learning roadmap for an IELTS student.

STUDENT PROFILE:
- Overall Band: {request.overall_band}
- Reading Band: {request.reading_band}
- Speaking Band: {request.speaking_band}
- Key Weaknesses: {weaknesses_text}

RECOMMENDED COURSE: {primary_course['name']} ({primary_course['band_range']})

Generate a JSON study plan:
{{
    "target_band": <realistic target band after 8-12 weeks>,
    "estimated_weeks": <8-12 weeks based on current level>,
    "weekly_plan": [
        {{
            "week": 1,
            "focus": "<Main skill to work on>",
            "goals": [
                "<Specific goal 1>",
                "<Specific goal 2>"
            ],
            "activities": [
                "<Activity 1 from the course>",
                "<Activity 2>"
            ]
        }},
        // ... 3-4 week milestones
    ],
    "priority_skills": [
        "<Skill 1 to focus on immediately>",
        "<Skill 2>",
        "<Skill 3>"
    ],
    "study_tips": [
        "<Personalized tip 1 based on weaknesses>",
        "<Tip 2>",
        "<Tip 3>"
    ],
    "milestone_goals": [
        {{
            "weeks": 4,
            "goal": "<What they should achieve by week 4>",
            "band_target": <expected band>
        }},
        {{
            "weeks": 8,
            "goal": "<What they should achieve by week 8>",
            "band_target": <expected band>
        }},
        {{
            "weeks": 12,
            "goal": "<Final goal>",
            "band_target": <target band>
        }}
    ]
}}

Make it motivating but realistic. Address their specific weaknesses.{language_note}"""

        response = await chat.send_message(UserMessage(text=roadmap_prompt))
        
        # Parse roadmap
        if isinstance(response, dict):
            roadmap = response
        else:
            import re
            json_match = re.search(r'\{[\s\S]*\}', str(response))
            if json_match:
                roadmap = json.loads(json_match.group())
            else:
                roadmap = {"target_band": request.overall_band + 1.0, "estimated_weeks": 12}
        
        return {
            "recommended_courses": [primary_course, secondary_course],
            "learning_roadmap": roadmap,
            "immediate_actions": [
                f"Enroll in {primary_course['name']} to start building your skills",
                f"Focus first on: {', '.join(request.weaknesses[:2]) if request.weaknesses else 'core fundamentals'}",
                "Practice speaking 15-20 minutes daily",
                "Complete at least 3 reading practice passages per week"
            ]
        }
        
    except Exception as e:
        logger.error(f"Course recommendation error: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")


# ============ LISTENING MODULE (Level Assessment) ============

from listening_data import get_listening_sections, get_all_listening_questions

@api_router.get("/level-test/listening-sections")
async def get_listening_sections_endpoint():
    """Get all listening sections with metadata for the level test."""
    sections = get_listening_sections()
    return {
        "sections": [
            {
                "id": s["id"],
                "level": s["level"],
                "band_range": s["band_range"],
                "title": s["title"],
                "audio_url": f"/audio/listening/{s['id']}.mp3",
                "question_count": len(s["questions"])
            }
            for s in sections
        ],
        "total_questions": sum(len(s["questions"]) for s in sections)
    }

@api_router.get("/level-test/listening-questions")
async def get_listening_questions():
    """Get all listening questions for the level test."""
    sections = get_listening_sections()
    all_questions = []
    
    for section in sections:
        for q in section["questions"]:
            all_questions.append({
                "section_id": section["id"],
                "section_title": section["title"],
                "audio_url": f"/audio/listening/{section['id']}.mp3",
                "level": section["level"],
                "band_range": section["band_range"],
                **q
            })
    
    return {"questions": all_questions, "total": len(all_questions)}


class ListeningEvaluationRequest(BaseModel):
    answers: Dict[str, str]  # {question_id: answer}
    language: Optional[str] = "en"


@api_router.post("/level-test/evaluate-listening")
async def evaluate_listening(request: ListeningEvaluationRequest):
    """Evaluate listening section answers with detailed explanations, course recommendations, and skill guidance."""
    try:
        sections = get_listening_sections()
        language = request.language or "en"
        
        correct_count = 0
        total_count = 0
        total_band_points = 0
        question_results = []
        skill_breakdown = {}
        weak_skills = []
        
        for section in sections:
            for q in section["questions"]:
                total_count += 1
                user_answer = request.answers.get(q["id"], "").strip().upper()
                correct_answer = q["correct"].strip().upper()
                is_correct = user_answer == correct_answer
                
                # Get band value from section
                band_range = section["band_range"]
                avg_band = (float(band_range.split("-")[0]) + float(band_range.split("-")[1])) / 2
                
                if is_correct:
                    correct_count += 1
                    total_band_points += avg_band
                
                # Track skill breakdown
                skill = q.get("skill", "general")
                if skill not in skill_breakdown:
                    skill_breakdown[skill] = {"correct": 0, "total": 0, "label": skill.replace("_", " ").title()}
                skill_breakdown[skill]["total"] += 1
                if is_correct:
                    skill_breakdown[skill]["correct"] += 1
                
                # Get explanation based on language
                explanation_key = f"explanation_{language}" if language != "en" else "explanation"
                explanation = q.get(explanation_key, q.get("explanation", ""))
                
                # Find correct option text
                correct_option_text = ""
                for opt in q.get("options", []):
                    if opt.startswith(correct_answer + ")"):
                        correct_option_text = opt
                        break
                
                question_results.append({
                    "question_id": q["id"],
                    "section_title": section["title"],
                    "section_level": section["level"],
                    "question_text": q["question"],
                    "user_answer": user_answer or "No answer",
                    "correct_answer": correct_answer,
                    "correct_option_text": correct_option_text,
                    "is_correct": is_correct,
                    "skill": skill,
                    "skill_label": skill.replace("_", " ").title(),
                    "explanation": explanation
                })
        
        # Calculate listening band score.
        # Audit BE-2: the old math summed each correct question's *difficulty
        # band* and divided by the TOTAL question count, then nudged by
        # percentage — not a band score (it systematically understated). Use the
        # official Cambridge Listening raw→band table, projecting the N-question
        # score onto the standard 40-question scale — same fix as comprehensive
        # reading and Quick Assessment. (`total_band_points` kept above for any
        # caller that still reads it, but the band now comes from the table.)
        if total_count > 0:
            percentage = (correct_count / total_count) * 100
            from services.ielts_band_tables import band_for_listening
            listening_band = band_for_listening(correct_count, total=total_count)
        else:
            percentage = 0
            listening_band = 0.0

        # Round to nearest 0.5
        listening_band = round(listening_band * 2) / 2
        
        # Identify weak skills (less than 50% correct)
        for skill, data in skill_breakdown.items():
            if data["total"] > 0 and (data["correct"] / data["total"]) < 0.5:
                weak_skills.append(data["label"])
        
        # Generate skill improvement guidance based on language
        skill_guidance = generate_skill_guidance(listening_band, weak_skills, language)
        
        # Generate course recommendations
        course_recommendations = generate_listening_course_recommendations(listening_band, weak_skills, language)
        
        return {
            "band_score": listening_band,
            "correct": correct_count,
            "total": total_count,
            "percentage": percentage,
            "question_results": question_results,
            "skill_breakdown": list(skill_breakdown.values()),
            "weak_skills": weak_skills,
            "skill_guidance": skill_guidance,
            "course_recommendations": course_recommendations,
            "overall_feedback": generate_overall_listening_feedback(listening_band, percentage, language)
        }
        
    except Exception as e:
        logger.error(f"Listening evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


def generate_skill_guidance(band: float, weak_skills: List[str], language: str) -> List[Dict]:
    """Generate skill improvement tips based on band and weak areas."""
    guidance = []
    
    # Base guidance by band level
    if language == "vi":
        if band < 4.0:
            guidance = [
                {"skill": "Nghe Cơ Bản", "tip": "Bắt đầu với các podcast và video tiếng Anh đơn giản với phụ đề. Lắng nghe 15-30 phút mỗi ngày.", "priority": "high"},
                {"skill": "Từ Vựng", "tip": "Học 10 từ vựng mới mỗi ngày từ các chủ đề hàng ngày như gia đình, công việc, thời tiết.", "priority": "high"},
                {"skill": "Số Liệu", "tip": "Luyện nghe số, ngày tháng và giờ giấc từ các đoạn hội thoại ngắn.", "priority": "medium"}
            ]
        elif band < 6.0:
            guidance = [
                {"skill": "Nghe Chi Tiết", "tip": "Luyện nghe để tìm thông tin cụ thể như tên, địa điểm và số liệu trong các cuộc hội thoại dài hơn.", "priority": "high"},
                {"skill": "Suy Luận", "tip": "Học cách suy luận thông tin không được nói trực tiếp từ ngữ cảnh.", "priority": "medium"},
                {"skill": "Ghi Chú", "tip": "Phát triển kỹ năng ghi chú nhanh trong khi nghe để ghi nhớ chi tiết.", "priority": "medium"}
            ]
        else:
            guidance = [
                {"skill": "Nghe Học Thuật", "tip": "Luyện nghe các bài giảng và thảo luận học thuật để chuẩn bị cho IELTS.", "priority": "high"},
                {"skill": "Phân Tích Quan Điểm", "tip": "Học cách nhận biết quan điểm khác nhau và ý chính trong các cuộc thảo luận phức tạp.", "priority": "medium"},
                {"skill": "Thuật Ngữ Chuyên Môn", "tip": "Mở rộng từ vựng học thuật và thuật ngữ chuyên ngành.", "priority": "medium"}
            ]
    elif language == "tr":
        if band < 4.0:
            guidance = [
                {"skill": "Temel Dinleme", "tip": "Altyazılı basit İngilizce podcast ve videolarla başlayın. Günde 15-30 dakika dinleyin.", "priority": "high"},
                {"skill": "Kelime Dağarcığı", "tip": "Aile, iş, hava durumu gibi günlük konulardan her gün 10 yeni kelime öğrenin.", "priority": "high"},
                {"skill": "Sayısal Veriler", "tip": "Kısa diyaloglardan sayıları, tarihleri ve saatleri dinleme pratiği yapın.", "priority": "medium"}
            ]
        elif band < 6.0:
            guidance = [
                {"skill": "Detaylı Dinleme", "tip": "Uzun konuşmalarda isimler, yerler ve sayılar gibi belirli bilgileri bulmak için dinleme pratiği yapın.", "priority": "high"},
                {"skill": "Çıkarım", "tip": "Bağlamdan doğrudan söylenmemiş bilgileri çıkarmayı öğrenin.", "priority": "medium"},
                {"skill": "Not Alma", "tip": "Dinlerken hızlı not alma becerileri geliştirin.", "priority": "medium"}
            ]
        else:
            guidance = [
                {"skill": "Akademik Dinleme", "tip": "IELTS'e hazırlanmak için akademik dersler ve tartışmaları dinleme pratiği yapın.", "priority": "high"},
                {"skill": "Görüş Analizi", "tip": "Karmaşık tartışmalarda farklı görüşleri ve ana fikirleri tanımlamayı öğrenin.", "priority": "medium"},
                {"skill": "Teknik Terminoloji", "tip": "Akademik kelime dağarcığı ve özel terminolojiyi genişletin.", "priority": "medium"}
            ]
    else:
        if band < 4.0:
            guidance = [
                {"skill": "Basic Listening", "tip": "Start with simple English podcasts and videos with subtitles. Listen for 15-30 minutes daily.", "priority": "high"},
                {"skill": "Vocabulary", "tip": "Learn 10 new vocabulary words daily from everyday topics like family, work, weather.", "priority": "high"},
                {"skill": "Numbers", "tip": "Practice listening for numbers, dates, and times from short dialogues.", "priority": "medium"}
            ]
        elif band < 6.0:
            guidance = [
                {"skill": "Detail Comprehension", "tip": "Practice listening for specific information like names, places, and numbers in longer conversations.", "priority": "high"},
                {"skill": "Inference", "tip": "Learn to infer information that isn't directly stated from context.", "priority": "medium"},
                {"skill": "Note-Taking", "tip": "Develop quick note-taking skills while listening to remember details.", "priority": "medium"}
            ]
        else:
            guidance = [
                {"skill": "Academic Listening", "tip": "Practice listening to academic lectures and discussions to prepare for IELTS.", "priority": "high"},
                {"skill": "Opinion Analysis", "tip": "Learn to identify different viewpoints and main ideas in complex discussions.", "priority": "medium"},
                {"skill": "Technical Terminology", "tip": "Expand academic vocabulary and specialized terminology.", "priority": "medium"}
            ]
    
    return guidance


def generate_listening_course_recommendations(band: float, weak_skills: List[str], language: str) -> List[Dict]:
    """Generate course recommendations based on listening performance."""
    recommendations = []
    
    if language == "vi":
        if band < 4.0:
            recommendations = [
                {
                    "course_id": "beginner-listening",
                    "name": "Nền Tảng Nghe Tiếng Anh",
                    "description": "Khóa học cơ bản giúp bạn phát triển kỹ năng nghe từ đầu với các chủ đề hàng ngày.",
                    "duration": "4-6 tuần",
                    "priority": "recommended"
                },
                {
                    "course_id": "vocabulary-builder",
                    "name": "Xây Dựng Từ Vựng Qua Nghe",
                    "description": "Học từ vựng mới thông qua các bài nghe thú vị và dễ hiểu.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
        elif band < 6.0:
            recommendations = [
                {
                    "course_id": "intermediate-listening",
                    "name": "Nghe IELTS Trung Cấp",
                    "description": "Phát triển kỹ năng nghe chi tiết và ghi chú cho bài thi IELTS.",
                    "duration": "6-8 tuần",
                    "priority": "recommended"
                },
                {
                    "course_id": "listening-strategies",
                    "name": "Chiến Thuật Nghe IELTS",
                    "description": "Học các chiến thuật làm bài nghe hiệu quả để đạt điểm cao hơn.",
                    "duration": "4 tuần",
                    "priority": "supplementary"
                }
            ]
        else:
            recommendations = [
                {
                    "course_id": "advanced-listening",
                    "name": "Nghe Nâng Cao IELTS 7+",
                    "description": "Kỹ năng nghe nâng cao cho điểm Band 7-9 với các bài giảng học thuật.",
                    "duration": "8-10 tuần",
                    "priority": "recommended"
                },
                {
                    "course_id": "academic-lectures",
                    "name": "Nghe Bài Giảng Học Thuật",
                    "description": "Luyện nghe các bài giảng đại học và thảo luận chuyên sâu.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
    elif language == "tr":
        if band < 4.0:
            recommendations = [
                {
                    "course_id": "beginner-listening",
                    "name": "İngilizce Dinleme Temelleri",
                    "description": "Günlük konularla sıfırdan dinleme becerileri geliştirmenize yardımcı olan temel kurs.",
                    "duration": "4-6 hafta",
                    "priority": "recommended"
                }
            ]
        elif band < 6.0:
            recommendations = [
                {
                    "course_id": "intermediate-listening",
                    "name": "IELTS Orta Düzey Dinleme",
                    "description": "IELTS sınavı için detaylı dinleme ve not alma becerileri geliştirin.",
                    "duration": "6-8 hafta",
                    "priority": "recommended"
                }
            ]
        else:
            recommendations = [
                {
                    "course_id": "advanced-listening",
                    "name": "IELTS 7+ İleri Dinleme",
                    "description": "Akademik derslerle Band 7-9 için ileri dinleme becerileri.",
                    "duration": "8-10 hafta",
                    "priority": "recommended"
                }
            ]
    else:
        if band < 4.0:
            recommendations = [
                {
                    "course_id": "beginner-listening",
                    "name": "English Listening Foundations",
                    "description": "Basic course helping you develop listening skills from scratch with everyday topics.",
                    "duration": "4-6 weeks",
                    "priority": "recommended"
                },
                {
                    "course_id": "vocabulary-builder",
                    "name": "Vocabulary Through Listening",
                    "description": "Learn new vocabulary through engaging and easy-to-understand listening exercises.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
        elif band < 6.0:
            recommendations = [
                {
                    "course_id": "intermediate-listening",
                    "name": "IELTS Intermediate Listening",
                    "description": "Develop detailed listening and note-taking skills for the IELTS exam.",
                    "duration": "6-8 weeks",
                    "priority": "recommended"
                },
                {
                    "course_id": "listening-strategies",
                    "name": "IELTS Listening Strategies",
                    "description": "Learn effective listening strategies to achieve higher scores.",
                    "duration": "4 weeks",
                    "priority": "supplementary"
                }
            ]
        else:
            recommendations = [
                {
                    "course_id": "advanced-listening",
                    "name": "IELTS 7+ Advanced Listening",
                    "description": "Advanced listening skills for Band 7-9 with academic lectures.",
                    "duration": "8-10 weeks",
                    "priority": "recommended"
                },
                {
                    "course_id": "academic-lectures",
                    "name": "Academic Lecture Listening",
                    "description": "Practice listening to university lectures and in-depth discussions.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
    
    return recommendations


def generate_overall_listening_feedback(band: float, percentage: float, language: str) -> str:
    """Generate overall feedback message based on performance."""
    if language == "vi":
        if band < 4.0:
            return f"Bạn đạt {percentage:.0f}% chính xác. Đây là điểm khởi đầu tốt! Hãy tập trung vào việc nghe tiếng Anh hàng ngày và xây dựng từ vựng cơ bản."
        elif band < 6.0:
            return f"Bạn đạt {percentage:.0f}% chính xác (Band {band}). Bạn đang tiến bộ! Hãy luyện nghe các cuộc hội thoại dài hơn và phát triển kỹ năng ghi chú."
        else:
            return f"Xuất sắc! Bạn đạt {percentage:.0f}% chính xác (Band {band}). Hãy tiếp tục thử thách bản thân với các bài nghe học thuật phức tạp hơn."
    elif language == "tr":
        if band < 4.0:
            return f"%{percentage:.0f} doğruluk oranına ulaştınız. Bu iyi bir başlangıç! Günlük İngilizce dinlemeye ve temel kelime dağarcığı oluşturmaya odaklanın."
        elif band < 6.0:
            return f"%{percentage:.0f} doğruluk oranına ulaştınız (Band {band}). İlerleme kaydediyorsunuz! Daha uzun konuşmaları dinleme ve not alma becerileri geliştirme pratiği yapın."
        else:
            return f"Mükemmel! %{percentage:.0f} doğruluk oranına ulaştınız (Band {band}). Daha karmaşık akademik dinleme içerikleriyle kendinize meydan okumaya devam edin."
    else:
        if band < 4.0:
            return f"You achieved {percentage:.0f}% accuracy. This is a good starting point! Focus on daily English listening and building basic vocabulary."
        elif band < 6.0:
            return f"You achieved {percentage:.0f}% accuracy (Band {band}). You're making progress! Practice listening to longer conversations and develop note-taking skills."
        else:
            return f"Excellent! You achieved {percentage:.0f}% accuracy (Band {band}). Keep challenging yourself with more complex academic listening content."


# ============ WRITING MODULE (Level Assessment) ============

from writing_evaluator import get_writing_tasks, evaluate_writing_response, evaluate_all_writing_tasks

@api_router.get("/level-test/writing-tasks")
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


@api_router.post("/level-test/evaluate-writing")
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


# ============ Speaking Practice Evaluation ============

class SpeakingPracticeRequest(BaseModel):
    part: str  # part1, part2, part3
    topic: str
    responses: List[Dict[str, Any]]  # List of {question, answer} pairs

@api_router.post("/speaking-practice/evaluate")
async def evaluate_speaking_practice(request: SpeakingPracticeRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate IELTS speaking practice with detailed feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an experienced IELTS examiner providing detailed speaking feedback."
        ).with_model("openai", "gpt-4o")
        
        part_desc = {
            "part1": "Part 1 (Introduction & Interview - familiar topics)",
            "part2": "Part 2 (Individual Long Turn - cue card)",
            "part3": "Part 3 (Two-way Discussion - abstract ideas)"
        }.get(request.part, "Speaking Test")
        
        # Format responses for evaluation
        responses_text = "\n\n".join([
            f"Question: {r.get('question', 'N/A')}\nAnswer: {r.get('answer', 'No response')}"
            for r in request.responses
        ])
        
        prompt = f"""You are an experienced IELTS Speaking examiner. Evaluate this IELTS {part_desc} practice.

TOPIC: {request.topic}

RESPONSES:
{responses_text}

Provide a comprehensive evaluation in the following JSON format:
{{
    "overall_band": <float between 1.0 and 9.0, in 0.5 increments>,
    "scores": {{
        "fluency_coherence": <float 1.0-9.0>,
        "lexical_resource": <float 1.0-9.0>,
        "grammar": <float 1.0-9.0>,
        "pronunciation": <float 1.0-9.0>
    }},
    "strengths": [<3-4 specific things done well in speaking>],
    "improvements": [<3-4 specific areas to improve with examples>],
    "pronunciation_tips": "<specific pronunciation advice based on their responses>",
    "model_answer": "<A sample Band 8+ response to the main question, showing ideal vocabulary and structure>"
}}

Consider:
- Fluency: Did they speak smoothly? Any hesitations?
- Vocabulary: Range and appropriateness of words used
- Grammar: Variety and accuracy of structures
- Pronunciation: (Assess based on word choices and likely pronunciation patterns)

Be encouraging but honest. Provide actionable feedback."""

        response = await chat.send_message(UserMessage(text=prompt))
        
        # Handle different response formats
        if isinstance(response, dict):
            return response
        
        response_text = str(response).strip()
        
        # Try to extract JSON from response
        import re
        # Remove markdown code fences if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            result = json.loads(json_match.group())
            return result
        
        # Fallback response
        return {
            "overall_band": 5.5,
            "scores": {
                "fluency_coherence": 5.5,
                "lexical_resource": 5.5,
                "grammar": 5.5,
                "pronunciation": 5.5
            },
            "strengths": ["You attempted to answer all questions", "You showed willingness to communicate"],
            "improvements": ["Extend your answers with more details", "Use more varied vocabulary"],
            "pronunciation_tips": "Practice word stress patterns and intonation.",
            "model_answer": "Unable to generate model answer. Please try again."
        }
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Speaking evaluation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate speaking")


# ============ MASTERY COURSE ENDPOINTS (Band 4.5-6.5) ============

@api_router.get("/mastery-course/modules")
async def get_mastery_modules():
    """Get all mastery course modules"""
    modules = await db.mastery_course_modules.find({}, {"_id": 0}).to_list(100)
    return modules

@api_router.get("/mastery-course/modules/{module_id}")
async def get_mastery_module(module_id: str):
    """Get a specific mastery course module"""
    module = await db.mastery_course_modules.find_one({"id": module_id}, {"_id": 0})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

class MasterySpeakingRequest(BaseModel):
    question: str
    model_answer: str
    user_response: str
    module_title: str

@api_router.post("/mastery-course/evaluate-speaking")
async def evaluate_mastery_speaking(request: MasterySpeakingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate speaking response for mastery course (Band 4.5-6.5) with comprehensive feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an expert IELTS examiner providing detailed, educational feedback."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are an IELTS Speaking examiner providing comprehensive feedback for a Band 4.5-6.5 student.

Topic: {request.module_title}
Question: {request.question}
Model Answer: {request.model_answer}
Student's Response: {request.user_response}

Provide detailed, educational feedback. Identify specific mistakes and show how to correct them.

Return JSON only:
{{
    "band_score": <4.5-6.5>,
    "fluency": {{"score": <number>, "feedback": "<specific feedback>"}},
    "vocabulary": {{"score": <number>, "feedback": "<specific feedback>"}},
    "grammar": {{"score": <number>, "feedback": "<specific feedback>"}},
    "pronunciation": {{"score": <number>, "feedback": "<specific feedback>"}},
    "overall_feedback": "<2-3 sentences summarizing performance>",
    "mistakes": [
        {{"original": "<what student said wrong>", "corrected": "<correct version>", "explanation": "<why this is better>"}}
    ],
    "vocabulary_to_use": ["<word1 from lesson>", "<word2 from lesson>", "<word3 from lesson>"],
    "model_phrases": ["<useful phrase 1>", "<useful phrase 2>"],
    "improvement_tip": "<One specific actionable tip>",
    "lesson_reference": "<Which part of the lesson to review for improvement>"
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"band_score": 5, "overall_feedback": "Good effort! Keep practicing.", "improvement_tip": "Use more topic vocabulary.", "mistakes": [], "vocabulary_to_use": [], "lesson_reference": "Review the vocabulary section"}
    except Exception as e:
        logging.getLogger(__name__).error(f"Mastery speaking evaluation error: {e}")
        return {"band_score": 5, "overall_feedback": "Good try! Keep practicing.", "improvement_tip": "Practice speaking regularly.", "mistakes": [], "vocabulary_to_use": []}

class MasteryWritingRequest(BaseModel):
    task: str
    model_essay: str
    user_response: str
    module_title: str

@api_router.post("/mastery-course/evaluate-writing")
async def evaluate_mastery_writing(request: MasteryWritingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate writing response for mastery course (Band 4.5-6.5) with comprehensive feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an expert IELTS Writing examiner providing detailed, educational feedback."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are an IELTS Writing Task 2 examiner providing comprehensive feedback for a Band 4.5-6.5 student.

Topic: {request.module_title}
Task: {request.task}
Model Essay: {request.model_essay}
Student's Essay: {request.user_response}

Provide detailed, educational feedback. Identify specific mistakes and show how to correct them.

Return JSON only:
{{
    "band_score": <4.5-6.5>,
    "task_achievement": {{"score": <number>, "feedback": "<specific feedback>"}},
    "coherence": {{"score": <number>, "feedback": "<specific feedback>"}},
    "lexical": {{"score": <number>, "feedback": "<specific feedback>"}},
    "grammar": {{"score": <number>, "feedback": "<specific feedback>"}},
    "overall_feedback": "<3-4 sentences summarizing performance with encouragement>",
    "mistakes": [
        {{"original": "<incorrect sentence/phrase>", "corrected": "<correct version>", "explanation": "<grammar rule or vocabulary tip>", "type": "<grammar/vocabulary/coherence>"}}
    ],
    "good_points": ["<what student did well 1>", "<what student did well 2>"],
    "vocabulary_suggestions": [
        {{"basic": "<simple word used>", "advanced": "<better alternative from lesson>", "example": "<example sentence>"}}
    ],
    "structure_tip": "<Advice on essay structure>",
    "lesson_reference": "<Which part of the lesson to review>",
    "next_steps": ["<step 1 to improve>", "<step 2 to improve>"]
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"band_score": 5, "overall_feedback": "Good effort! Keep writing.", "mistakes": [], "good_points": [], "vocabulary_suggestions": [], "next_steps": ["Practice more essays"]}
    except Exception as e:
        logging.getLogger(__name__).error(f"Mastery writing evaluation error: {e}")
        return {"band_score": 5, "overall_feedback": "Good effort!", "mistakes": [], "good_points": [], "vocabulary_suggestions": [], "next_steps": []}




# ============ VOCABULARY ENGINE ENDPOINTS ============

@api_router.get("/vocabulary-engine/{module_id}/slides")
async def get_vocabulary_slides(module_id: str):
    """Get vocabulary data formatted as slides for Learn Mode"""
    module = await db.advanced_mastery_modules.find_one({"id": module_id}, {"_id": 0})
    source = "advanced"
    if not module:
        module = await db.mastery_course_modules.find_one({"id": module_id}, {"_id": 0})
        source = "mastery"
    if not module:
        module = await db.beginner_english_lessons.find_one({"id": module_id}, {"_id": 0})
        source = "beginner"
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    vocab = module.get("vocabulary", {})
    pronunciation_map = {}
    if isinstance(vocab, dict):
        for p in vocab.get("pronunciation_guide", []):
            pronunciation_map[p["word"].lower()] = p
    
    slides = []
    
    if source == "beginner":
        # Beginner course: simple [{word, meaning, example}] list
        vocab_list = vocab if isinstance(vocab, list) else []
        for i, item in enumerate(vocab_list):
            slides.append({
                "id": f"word-{i}",
                "category": "Vocabulary",
                "word": item.get("word", ""),
                "meaning": item.get("meaning", ""),
                "example": item.get("example", ""),
                "usage": "",
                "collocations": [],
                "ipa": "", "stress": "", "audio_tip": "", "common_mistake": "",
            })
        # Also add common_mistake if available
        cm = module.get("common_mistake", {})
        if isinstance(cm, dict) and cm.get("incorrect"):
            slides.append({
                "id": f"mistake-{len(slides)}",
                "category": "Common Mistake",
                "word": f"{cm.get('incorrect', '')} vs {cm.get('correct', '')}",
                "meaning": cm.get("tip", ""),
                "example": f"Correct: {cm.get('correct', '')}",
                "usage": "", "collocations": [], "ipa": "", "stress": "", "audio_tip": "", "common_mistake": cm.get("incorrect", ""),
            })
    elif source == "mastery":
        # Mastery course: nouns, verbs, adjectives, adverbs
        for category in ["nouns", "verbs", "adjectives", "adverbs"]:
            for item in vocab.get(category, []):
                slides.append({
                    "id": f"{category}-{len(slides)}",
                    "category": category.title().rstrip("s"),
                    "word": item.get("word", ""),
                    "meaning": item.get("meaning", ""),
                    "example": item.get("example", ""),
                    "usage": "",
                    "collocations": [],
                    "ipa": "", "stress": "", "audio_tip": "", "common_mistake": "",
                })
        # Mastery collocations
        for item in module.get("collocations", []):
            if isinstance(item, dict):
                slides.append({
                    "id": f"colloc-{len(slides)}",
                    "category": "Collocation",
                    "word": item.get("collocation", item.get("phrase", "")),
                    "meaning": item.get("meaning", ""),
                    "example": item.get("example", ""),
                    "usage": "", "collocations": [], "ipa": "", "stress": "", "audio_tip": "", "common_mistake": "",
                })
        # Mastery idiom
        idiom = module.get("idiom", {})
        if isinstance(idiom, dict) and idiom.get("phrase"):
            slides.append({
                "id": f"idiom-{len(slides)}",
                "category": "Idiom",
                "word": idiom.get("phrase", ""),
                "meaning": idiom.get("meaning", ""),
                "example": idiom.get("example", ""),
                "usage": "", "collocations": [], "ipa": "", "stress": "", "audio_tip": "", "common_mistake": "",
            })
    else:
        # Advanced mastery: advanced_terms, idioms, collocations, phrasal_verbs
        for item in vocab.get("advanced_terms", []):
            pron = pronunciation_map.get(item["term"].lower(), {})
            slides.append({
                "id": f"term-{len(slides)}",
                "category": "Advanced Term",
                "word": item["term"],
                "meaning": item["meaning"],
                "example": item["example"],
                "usage": item.get("usage", ""),
                "collocations": item.get("collocations", []),
                "ipa": pron.get("ipa", ""),
                "stress": pron.get("stress", ""),
                "audio_tip": pron.get("audio_tip", ""),
                "common_mistake": pron.get("common_mistake", ""),
            })
    
        # Idioms
        for item in vocab.get("idioms", []):
            slides.append({
                "id": f"idiom-{len(slides)}",
                "category": "Idiom",
                "word": item["idiom"],
                "meaning": item["meaning"],
                "example": item["example"],
                "usage": item.get("usage_context", ""),
                "collocations": [],
                "ipa": "",
                "stress": "",
                "audio_tip": "",
                "common_mistake": "",
            })
    
        # Collocations
        for item in vocab.get("collocations", []):
            slides.append({
                "id": f"colloc-{len(slides)}",
                "category": f"Collocation ({item.get('type', '')})",
                "word": item["collocation"],
                "meaning": "",
                "example": item["example"],
                "usage": "",
                "collocations": item.get("alternatives", []),
                "ipa": "",
                "stress": "",
                "audio_tip": "",
                "common_mistake": "",
            })
    
        # Phrasal verbs
        for item in vocab.get("phrasal_verbs", []):
            slides.append({
                "id": f"phrasal-{len(slides)}",
                "category": "Phrasal Verb",
                "word": item["phrasal_verb"],
                "meaning": item["meaning"],
                "example": item["example"],
                "usage": f"Formal alternative: {item.get('formal_alternative', '')}",
                "collocations": [],
                "ipa": "",
                "stress": "",
                "audio_tip": "",
                "common_mistake": "",
            })
    
    # Word formation data (only for dict-based vocab, not beginner lists)
    word_formations = []
    if isinstance(vocab, dict):
        for item in vocab.get("word_formation", []):
            word_formations.append({
                "root": item.get("root", ""),
                "noun": item.get("noun", ""),
                "verb": item.get("verb", ""),
                "adjective": item.get("adjective", ""),
                "adverb": item.get("adverb", ""),
            })
    
    return {
        "module_id": module_id,
        "module_title": module.get("title", ""),
        "module_number": module.get("module_number", module.get("lesson_number", 0)),
        "slides": slides,
        "word_formations": word_formations,
        "total_slides": len(slides),
    }


@api_router.get("/vocabulary-engine/{module_id}/practice")
async def get_vocabulary_practice(module_id: str):
    """Get practice exercises generated from vocabulary data"""
    import random
    
    module = await db.advanced_mastery_modules.find_one({"id": module_id}, {"_id": 0})
    source = "advanced"
    if not module:
        module = await db.mastery_course_modules.find_one({"id": module_id}, {"_id": 0})
        source = "mastery"
    if not module:
        module = await db.beginner_english_lessons.find_one({"id": module_id}, {"_id": 0})
        source = "beginner"
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    vocab = module.get("vocabulary", {})
    exercises = []
    
    if source == "beginner":
        import re
        # Beginner: simple [{word, meaning, example}] list
        vocab_list = vocab if isinstance(vocab, list) else []
        all_words = [{"word": item.get("word", ""), "meaning": item.get("meaning", ""), "example": item.get("example", ""), "category": "vocabulary"} for item in vocab_list]
        
        # Fill-in-the-blank
        for i, item in enumerate(all_words):
            word = item.get("word", "")
            sentence = item.get("example", "")
            if not word or not sentence:
                continue
            blanked = re.sub(re.escape(word), "______", sentence, flags=re.IGNORECASE, count=1)
            if blanked != sentence:
                other_words = [w["word"] for w in all_words if w["word"].lower() != word.lower()]
                distractors = (other_words + ["something", "nothing"])[:3]
                options = [word] + distractors
                random.shuffle(options)
                exercises.append({
                    "id": f"fib-{len(exercises)}",
                    "type": "fill_blank",
                    "instruction": "Fill in the blank with the correct word:",
                    "sentence": blanked,
                    "answer": word,
                    "options": options,
                    "hint": item.get("meaning", ""),
                })
        
        # Meaning matching
        for i, item in enumerate(all_words):
            word = item.get("word", "")
            meaning = item.get("meaning", "")
            if not word or not meaning:
                continue
            other_meanings = [w["meaning"] for w in all_words if w["word"].lower() != word.lower() and w["meaning"]]
            distractors = (other_meanings + ["Not related"])[:3]
            options = [meaning] + distractors
            random.shuffle(options)
            exercises.append({
                "id": f"mm-{len(exercises)}",
                "type": "meaning_match",
                "instruction": "Choose the correct meaning:",
                "word": word,
                "answer": meaning,
                "options": options,
                "hint": "",
            })
        
        random.shuffle(exercises)
        return {
            "module_id": module_id,
            "module_title": module.get("title", ""),
            "exercises": exercises,
            "total_exercises": len(exercises),
        }
    elif source == "mastery":
        import re
        # Mastery: generate exercises from nouns, verbs, adjectives, adverbs
        all_words = []
        for cat in ["nouns", "verbs", "adjectives", "adverbs"]:
            for item in vocab.get(cat, []):
                all_words.append({**item, "category": cat})
        
        # 1. Fill-in-the-blank
        for item in all_words:
            word = item.get("word", "")
            sentence = item.get("example", "")
            if not word or not sentence:
                continue
            blanked = re.sub(re.escape(word), "______", sentence, flags=re.IGNORECASE, count=1)
            if blanked != sentence:
                other_words = [w["word"] for w in all_words if w["word"] != word]
                distractors = random.sample(other_words, min(3, len(other_words)))
                options = [word] + distractors
                random.shuffle(options)
                exercises.append({
                    "id": f"fib-{len(exercises)}",
                    "type": "fill_blank",
                    "instruction": "Fill in the blank with the correct word:",
                    "sentence": blanked,
                    "answer": word,
                    "options": options,
                    "hint": item.get("meaning", ""),
                })
        
        # 2. Matching - words to meanings
        if len(all_words) >= 4:
            match_items = random.sample(all_words, min(5, len(all_words)))
            terms_list = [{"id": f"m-{i}", "text": item["word"]} for i, item in enumerate(match_items)]
            defs_list = [{"id": f"m-{i}", "text": item["meaning"]} for i, item in enumerate(match_items)]
            shuffled_defs = defs_list.copy()
            random.shuffle(shuffled_defs)
            exercises.append({
                "id": f"match-{len(exercises)}",
                "type": "matching",
                "instruction": "Match each word with its correct meaning:",
                "terms": terms_list,
                "definitions": shuffled_defs,
                "answers": {t["id"]: t["id"] for t in terms_list},
            })
        
        # 3. Collocation exercises
        collocations = module.get("collocations", [])
        if isinstance(collocations, list):
            for item in collocations:
                if not isinstance(item, dict):
                    continue
                col = item.get("collocation", item.get("phrase", ""))
                example = item.get("example", "")
                if col and example:
                    blanked = re.sub(re.escape(col), "______", example, flags=re.IGNORECASE, count=1)
                    if blanked != example:
                        other_cols = [c.get("collocation", c.get("phrase", "")) for c in collocations if c.get("collocation", c.get("phrase", "")) != col]
                        distractors = random.sample(other_cols, min(3, len(other_cols))) if other_cols else []
                        options = [col] + distractors
                        random.shuffle(options)
                        exercises.append({
                            "id": f"fib-col-{len(exercises)}",
                            "type": "fill_blank",
                            "instruction": "Complete with the correct collocation:",
                            "sentence": blanked,
                            "answer": col,
                            "options": options,
                            "hint": item.get("meaning", ""),
                        })
        
        random.shuffle(exercises)
        return {
            "module_id": module_id,
            "module_title": module.get("title", ""),
            "exercises": exercises,
            "total_exercises": len(exercises),
        }
    # Advanced mastery original logic below
    
    # 1. Fill-in-the-blank from advanced terms
    terms = vocab.get("advanced_terms", [])
    for item in terms:
        word = item["term"]
        sentence = item["example"]
        # Create blank by replacing the word (case-insensitive)
        import re
        blanked = re.sub(re.escape(word), "______", sentence, flags=re.IGNORECASE, count=1)
        if blanked != sentence:
            # Generate distractors from other terms
            other_terms = [t["term"] for t in terms if t["term"] != word]
            distractors = random.sample(other_terms, min(3, len(other_terms)))
            options = [word] + distractors
            random.shuffle(options)
            exercises.append({
                "id": f"fib-term-{len(exercises)}",
                "type": "fill_blank",
                "instruction": "Fill in the blank with the correct word:",
                "sentence": blanked,
                "answer": word,
                "options": options,
                "hint": item["meaning"][:80] + "..." if len(item["meaning"]) > 80 else item["meaning"],
            })
    
    # 2. Matching - idioms to meanings
    idioms = vocab.get("idioms", [])
    if len(idioms) >= 4:
        match_items = random.sample(idioms, min(5, len(idioms)))
        terms_list = [{"id": f"m-{i}", "text": item["idiom"]} for i, item in enumerate(match_items)]
        defs_list = [{"id": f"m-{i}", "text": item["meaning"]} for i, item in enumerate(match_items)]
        shuffled_defs = defs_list.copy()
        random.shuffle(shuffled_defs)
        exercises.append({
            "id": f"match-idioms-{len(exercises)}",
            "type": "matching",
            "instruction": "Match each idiom with its correct meaning:",
            "terms": terms_list,
            "definitions": shuffled_defs,
            "answers": {t["id"]: t["id"] for t in terms_list},
        })
    
    # 3. Fill-in-the-blank from collocations
    collocations = vocab.get("collocations", [])
    for item in collocations:
        col = item["collocation"]
        parts = col.split()
        if len(parts) >= 2:
            blank_word = parts[-1]
            blanked_col = " ".join(parts[:-1]) + " ______"
            other_options = [c["collocation"].split()[-1] for c in collocations if c["collocation"] != col]
            other_options = list(set(other_options))
            distractors = random.sample(other_options, min(3, len(other_options)))
            options = [blank_word] + distractors
            random.shuffle(options)
            exercises.append({
                "id": f"fib-col-{len(exercises)}",
                "type": "fill_blank",
                "instruction": "Complete the collocation:",
                "sentence": f'{blanked_col} (Example: "{item["example"]}")',
                "answer": blank_word,
                "options": options,
                "hint": item.get("type", ""),
            })
    
    # 4. Fill-in-the-blank from phrasal verbs
    phrasal_verbs = vocab.get("phrasal_verbs", [])
    for item in phrasal_verbs:
        word = item["phrasal_verb"]
        sentence = item["example"]
        blanked = re.sub(re.escape(word), "______", sentence, flags=re.IGNORECASE, count=1)
        # Also try with different casing
        if blanked == sentence:
            for pv in [word.lower(), word.title(), word.capitalize()]:
                blanked = sentence.replace(pv, "______", 1)
                if blanked != sentence:
                    break
        if blanked != sentence:
            other_pvs = [p["phrasal_verb"] for p in phrasal_verbs if p["phrasal_verb"] != word]
            distractors = random.sample(other_pvs, min(3, len(other_pvs)))
            options = [word] + distractors
            random.shuffle(options)
            exercises.append({
                "id": f"fib-pv-{len(exercises)}",
                "type": "fill_blank",
                "instruction": "Fill in the blank with the correct phrasal verb:",
                "sentence": blanked,
                "answer": word,
                "options": options,
                "hint": item["meaning"],
            })
    
    # 5. Word formation exercise
    word_forms = vocab.get("word_formation", [])
    for item in word_forms:
        forms = ["noun", "verb", "adjective", "adverb"]
        available = [(f, item[f]) for f in forms if item.get(f)]
        if len(available) >= 2:
            target_form, target_word = random.choice(available)
            other_words = [item[f] for f, _ in available if f != target_form]
            other_all = [wf.get(target_form, "") for wf in word_forms if wf.get("root") != item["root"] and wf.get(target_form)]
            distractors = random.sample(other_all, min(3, len(other_all)))
            options = [target_word] + distractors
            random.shuffle(options)
            exercises.append({
                "id": f"wf-{len(exercises)}",
                "type": "fill_blank",
                "instruction": f'Choose the correct {target_form} form of "{item["root"]}":',
                "sentence": f"Root word: {item['root']} → {target_form}: ______",
                "answer": target_word,
                "options": options,
                "hint": f"Other forms: {', '.join(f'{f}={w}' for f, w in available if f != target_form)}",
            })
    
    random.shuffle(exercises)
    
    return {
        "module_id": module_id,
        "module_title": module.get("title", ""),
        "exercises": exercises,
        "total_exercises": len(exercises),
    }


@api_router.get("/vocabulary-engine/{module_id}/quiz")
async def get_vocabulary_quiz(module_id: str):
    """Get mastery quiz questions for a module"""
    module = await db.advanced_mastery_modules.find_one({"id": module_id}, {"_id": 0})
    source = "advanced"
    if not module:
        module = await db.mastery_course_modules.find_one({"id": module_id}, {"_id": 0})
        source = "mastery"
    if not module:
        module = await db.beginner_english_lessons.find_one({"id": module_id}, {"_id": 0})
        source = "beginner"
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    if source == "beginner":
        import random
        # Generate quiz from vocabulary for beginner
        vocab_list = module.get("vocabulary", [])
        if not isinstance(vocab_list, list):
            vocab_list = []
        questions = []
        for i, item in enumerate(vocab_list):
            word = item.get("word", "")
            meaning = item.get("meaning", "")
            example = item.get("example", "")
            if not word or not meaning:
                continue
            other_meanings = [w["meaning"] for w in vocab_list if w.get("word") != word and w.get("meaning")]
            distractors = (other_meanings + ["Not applicable", "Unknown meaning"])[:3]
            options = [meaning] + distractors
            random.shuffle(options)
            correct_idx = options.index(meaning)
            answer_label = chr(65 + correct_idx)  # 0->A, 1->B, 2->C, 3->D
            questions.append({
                "id": f"q-{i}",
                "question": f"What does '{word}' mean?",
                "options": options,
                "answer": answer_label,
                "correct_answer": correct_idx,
                "explanation": f"'{word}' means: {meaning}. Example: {example}",
            })
        return {
            "module_id": module_id,
            "module_title": module.get("title", ""),
            "questions": questions[:10],
            "total_questions": len(questions[:10]),
            "passing_score": 80,
            "reading_passage": "",
        }
    
    quiz = module.get("quiz", {})
    questions = quiz.get("questions", [])
    
    # Filter vocabulary-related questions and take up to 10
    vocab_questions = [q for q in questions if "vocabulary" in q.get("question", "").lower() or "collocation" in q.get("question", "").lower()]
    other_questions = [q for q in questions if q not in vocab_questions]
    
    # Ensure 10 questions: prioritize vocab, fill with others
    selected = vocab_questions[:10]
    if len(selected) < 10:
        remaining = 10 - len(selected)
        selected += other_questions[:remaining]
    
    # Add IDs to questions
    for i, q in enumerate(selected):
        q["id"] = f"q-{i}"
    
    # Get reading passage for TFNG questions
    reading_passage = module.get("reading", {}).get("text", "")
    
    return {
        "module_id": module_id,
        "module_title": module.get("title", ""),
        "questions": selected[:10],
        "total_questions": len(selected[:10]),
        "passing_score": 80,
        "reading_passage": reading_passage,
    }


class VocabQuizSubmission(BaseModel):
    module_id: str
    user_id: str
    answers: dict
    score: int
    total: int

@api_router.post("/vocabulary-engine/quiz/submit")
async def submit_vocabulary_quiz(submission: VocabQuizSubmission):
    """Submit vocabulary quiz results and auto-add wrong answers to review bank"""
    passed = (submission.score / submission.total * 100) >= 80 if submission.total > 0 else False
    
    await db.vocabulary_progress.update_one(
        {"user_id": submission.user_id, "module_id": submission.module_id},
        {"$set": {
            "quiz_score": submission.score,
            "quiz_total": submission.total,
            "quiz_passed": passed,
            "quiz_completed_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    
    # Auto-add wrong answers to review bank
    module = await db.advanced_mastery_modules.find_one({"id": submission.module_id}, {"_id": 0})
    if not module:
        module = await db.mastery_course_modules.find_one({"id": submission.module_id}, {"_id": 0})
    if module:
        questions = module.get("quiz", {}).get("questions", [])
        for i, q in enumerate(questions[:10]):
            qid = f"q-{i}"
            user_ans = submission.answers.get(qid)
            if user_ans and user_ans != q.get("answer"):
                # Extract keyword from question for review
                word = q.get("question", "")[:60]
                await db.review_bank.update_one(
                    {"user_id": submission.user_id, "word": word, "module_id": submission.module_id},
                    {"$set": {
                        "meaning": q.get("question", ""),
                        "category": "quiz_mistake",
                        "source": "quiz",
                        "mastery_status": "learning",
                        "last_seen": datetime.now(timezone.utc).isoformat(),
                    },
                    "$inc": {"mistake_count": 1},
                    "$setOnInsert": {
                        "review_count": 0,
                        "next_review": datetime.now(timezone.utc).isoformat(),
                        "created_at": datetime.now(timezone.utc).isoformat(),
                    }},
                    upsert=True,
                )
    
    return {
        "passed": passed,
        "score": submission.score,
        "total": submission.total,
        "percentage": round(submission.score / submission.total * 100) if submission.total > 0 else 0,
    }


class VocabProgressUpdate(BaseModel):
    user_id: str
    module_id: str
    section: str  # "learn", "practice", "quiz"
    completed: bool = True

@api_router.post("/vocabulary-engine/progress")
async def save_vocabulary_progress(progress: VocabProgressUpdate, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(progress.user_id, caller)
    """Save vocabulary engine progress"""
    await db.vocabulary_progress.update_one(
        {"user_id": progress.user_id, "module_id": progress.module_id},
        {"$set": {
            f"{progress.section}_completed": progress.completed,
            f"{progress.section}_completed_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    return {"success": True}


@api_router.get("/vocabulary-engine/progress/{user_id}")
async def get_vocabulary_progress(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get all vocabulary engine progress for a user"""
    progress = await db.vocabulary_progress.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(100)
    return {"progress": progress}



class ProductionModeRequest(BaseModel):
    word: str
    sentence: str
    word_meaning: str = ""
    module_title: str = ""

@api_router.post("/vocabulary-engine/evaluate-sentence")
async def evaluate_production_sentence(request: ProductionModeRequest, _caller: dict = Depends(auth_session.current_user)):
    """AI evaluates a user-written sentence using a target vocabulary word"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are a strict but encouraging IELTS vocabulary coach. Evaluate student sentences for grammar accuracy and correct vocabulary usage. Be concise."
        ).with_model("openai", "gpt-4o")

        prompt = f"""Evaluate this IELTS student's sentence. They must use the target word correctly.

Target Word: {request.word}
Word Meaning: {request.word_meaning}
Student's Sentence: "{request.sentence}"

Respond in this exact JSON format:
{{
  "grammar_correct": true/false,
  "word_usage_correct": true/false,
  "overall_score": 1-5,
  "feedback": "1-2 sentence feedback on grammar and usage",
  "improved_sentence": "A corrected/improved version if needed, or the same sentence if perfect",
  "tip": "One short tip for better IELTS writing"
}}

RULES:
- Score 5 = perfect grammar + natural word usage
- Score 1 = major grammar errors or word completely misused
- Be strict on grammar but encouraging in tone
- Return ONLY valid JSON, no markdown"""

        response = await chat.send_message(UserMessage(text=prompt))
        text = response if isinstance(response, str) else response.text
        text = text.strip()
        # Clean markdown wrapping
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

        import json as json_mod
        result = json_mod.loads(text)
        return result
    except Exception as e:
        logging.getLogger(__name__).error(f"Production mode evaluation error: {e}")
        return {
            "grammar_correct": False,
            "word_usage_correct": False,
            "overall_score": 3,
            "feedback": "Could not evaluate your sentence right now. Please try again.",
            "improved_sentence": request.sentence,
            "tip": "Keep practicing writing sentences with new vocabulary!"
        }


# ============ REVIEW BANK (SPACED REPETITION) ============

class ReviewBankAdd(BaseModel):
    user_id: str
    module_id: str
    word: str
    meaning: str = ""
    category: str = ""
    source: str = "quiz"  # quiz, practice, manual

@api_router.post("/vocabulary-engine/review-bank/add")
async def add_to_review_bank(item: ReviewBankAdd, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(item.user_id, caller)
    """Add a word to user's review bank"""
    existing = await db.review_bank.find_one(
        {"user_id": item.user_id, "word": item.word, "module_id": item.module_id}, {"_id": 0}
    )
    if existing:
        await db.review_bank.update_one(
            {"user_id": item.user_id, "word": item.word, "module_id": item.module_id},
            {"$inc": {"mistake_count": 1}, "$set": {"last_seen": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        await db.review_bank.insert_one({
            "user_id": item.user_id,
            "module_id": item.module_id,
            "word": item.word,
            "meaning": item.meaning,
            "category": item.category,
            "source": item.source,
            "mistake_count": 1,
            "review_count": 0,
            "mastery_status": "learning",
            "next_review": datetime.now(timezone.utc).isoformat(),
            "last_seen": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    return {"success": True}


@api_router.get("/vocabulary-engine/review-bank/{user_id}")
async def get_review_bank(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get user's review bank words sorted by next review date"""
    words = await db.review_bank.find(
        {"user_id": user_id, "mastery_status": {"$ne": "mastered"}},
        {"_id": 0}
    ).sort("next_review", 1).to_list(200)
    
    mastered = await db.review_bank.count_documents({"user_id": user_id, "mastery_status": "mastered"})
    total = await db.review_bank.count_documents({"user_id": user_id})
    
    return {"words": words, "total": total, "mastered": mastered, "to_review": len(words)}


class ReviewBankUpdate(BaseModel):
    user_id: str
    word: str
    module_id: str
    knew_it: bool

@api_router.post("/vocabulary-engine/review-bank/review")
async def review_bank_word(item: ReviewBankUpdate, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(item.user_id, caller)
    """Mark a word as reviewed. Implements spaced repetition intervals."""
    doc = await db.review_bank.find_one(
        {"user_id": item.user_id, "word": item.word, "module_id": item.module_id}
    )
    if not doc:
        return {"success": False, "message": "Word not found"}
    
    review_count = doc.get("review_count", 0) + 1
    now = datetime.now(timezone.utc)
    
    if item.knew_it:
        # Spaced repetition: 1d -> 3d -> 7d -> 14d -> mastered
        intervals = [1, 3, 7, 14]
        idx = min(review_count - 1, len(intervals) - 1)
        if review_count >= len(intervals) + 1:
            mastery = "mastered"
            next_dt = now
        else:
            mastery = "learning"
            next_dt = now + timedelta(days=intervals[idx])
    else:
        # Reset: go back to 1 day
        mastery = "learning"
        next_dt = now + timedelta(days=1)
        review_count = max(0, review_count - 1)
    
    await db.review_bank.update_one(
        {"_id": doc["_id"]},
        {"$set": {
            "review_count": review_count,
            "mastery_status": mastery,
            "next_review": next_dt.isoformat(),
            "last_seen": now.isoformat(),
        }}
    )
    return {"success": True, "mastery_status": mastery, "next_review": next_dt.isoformat()}




# ============ ADVANCED IELTS MASTERY COURSE ENDPOINTS (Band 6.0-9.0) ============

@api_router.get("/advanced-mastery/modules")
async def get_advanced_mastery_modules():
    """Get all Advanced IELTS Mastery course modules (Band 6.0-9.0)"""
    modules = await db.advanced_mastery_modules.find({}, {"_id": 0}).to_list(100)
    return modules

@api_router.get("/advanced-mastery/modules/{module_id}")
async def get_advanced_mastery_module(module_id: str):
    """Get a specific Advanced IELTS Mastery module"""
    module = await db.advanced_mastery_modules.find_one({"id": module_id}, {"_id": 0})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

class AdvancedSpeakingRequest(BaseModel):
    question: str
    model_answer: str
    user_response: str
    module_title: str
    part: str = "part3"  # part2 or part3

@api_router.post("/advanced-mastery/evaluate-speaking")
async def evaluate_advanced_speaking(request: AdvancedSpeakingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate speaking response for Advanced IELTS Mastery course with IELTS Core Mindset"""
    try:
        # Use IELTS Core Mindset with Evaluation Mode
        system_message = f"""{IELTS_CORE_MINDSET}

{EVALUATION_MODE_PROMPT}

Additional context: This is an ADVANCED course for students targeting Band 7-9. Be rigorous but constructive."""
        
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Evaluate this IELTS Speaking response with STRICT Cambridge criteria.

Topic: {request.module_title}
Part: {request.part}
Question: {request.question}
Model Answer (Band 8+): {request.model_answer}
Student's Response: {request.user_response}

IMPORTANT CHECKS BEFORE SCORING:
1. Does the response DIRECTLY address the question?
2. Is it a genuine response or memorized/template-based?
3. Is there sufficient development?
4. Are ideas expressed clearly?

Apply band caps if needed:
- Off-topic → Max 4.0
- Memorized/template → Max 4.5
- Very short/underdeveloped → Max 5.0

Return JSON only:
{{
    "band_score": <5.0-9.0 - be strict>,
    "fluency_coherence": {{"score": <5-9>, "feedback": "<specific feedback with evidence>"}},
    "lexical_resource": {{"score": <5-9>, "feedback": "<specific feedback with evidence>"}},
    "grammatical_range": {{"score": <5-9>, "feedback": "<specific feedback with evidence>"}},
    "pronunciation": {{"score": <5-9>, "feedback": "<assessment based on transcription clarity>"}},
    "major_issues": ["<critical problem 1>", "<critical problem 2>"],
    "overall_feedback": "<3-4 sentences: honest assessment, specific improvements needed>",
    "band_justification": "<Why this band would survive Cambridge moderation>",
    "advanced_vocabulary_used": ["<list of advanced words/phrases the student used>"],
    "suggested_improvements": ["<specific actionable suggestion 1>", "<specific actionable suggestion 2>"],
    "model_phrase_to_learn": "<One exemplary phrase from the model answer the student should study>"
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {
            "band_score": 5.5,
            "fluency_coherence": {"score": 5.5, "feedback": "Needs more natural development."},
            "lexical_resource": {"score": 5.5, "feedback": "Limited vocabulary range for this level."},
            "grammatical_range": {"score": 5.5, "feedback": "Basic structures need improvement."},
            "pronunciation": {"score": 5.5, "feedback": "Clarity needs work."},
            "overall_feedback": "Response needs more development and sophistication for Band 7+ target.",
            "advanced_vocabulary_used": [],
            "suggested_improvements": ["Address the question more directly", "Use more topic-specific vocabulary"],
            "model_phrase_to_learn": "Review the model answer for advanced phrasing."
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Advanced speaking evaluation error: {e}")
        return {
            "band_score": 5.5,
            "overall_feedback": "Evaluation error. Keep practicing with complex topics.",
            "suggested_improvements": ["Practice speaking regularly with complex topics"]
        }

class AdvancedWritingRequest(BaseModel):
    task: str
    model_essay: str
    user_response: str
    module_title: str
    examiner_analysis: dict = None

@api_router.post("/advanced-mastery/evaluate-writing")
async def evaluate_advanced_writing(request: AdvancedWritingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate writing response for Advanced IELTS Mastery course with IELTS Core Mindset"""
    try:
        # Use IELTS Core Mindset with Evaluation Mode
        system_message = f"""{IELTS_CORE_MINDSET}

{EVALUATION_MODE_PROMPT}

Additional context: This is an ADVANCED course for students targeting Band 7-9. Be rigorous but constructive."""

        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        examiner_notes = ""
        if request.examiner_analysis:
            examiner_notes = f"\nExaminer Notes for this topic: {json.dumps(request.examiner_analysis)}"
        
        # Count words
        word_count = len(request.user_response.split())
        
        prompt = f"""Evaluate this IELTS Writing Task 2 essay with STRICT Cambridge criteria.

Topic: {request.module_title}
Task: {request.task}
Model Essay (Band 7.5+): {request.model_essay}{examiner_notes}
Student's Essay ({word_count} words): {request.user_response}

IMPORTANT CHECKS BEFORE SCORING:
1. Does the essay address ALL parts of the question?
2. Is there a clear position maintained throughout?
3. Word count: {word_count} words (minimum required: 250)
4. Is this a genuine essay or memorized/template-based?

Apply band caps if needed:
- Off-topic or irrelevant → Max 4.0
- Under 250 words → Max 4.0
- Memorized/template → Max 4.5
- No clear position → Max 5.0
- Poor paragraphing → Max 5.5

Return JSON only:
{{
    "band_score": <5.0-9.0 - be strict>,
    "validity_check": {{
        "word_count": {word_count},
        "meets_word_count": <true/false>,
        "on_topic": <true/false>,
        "has_clear_position": <true/false>,
        "band_cap_applied": <null or number>,
        "cap_reason": "<if capped, explain why>"
    }},
    "task_achievement": {{"score": <5-9>, "feedback": "<specific feedback - did it address ALL parts?>"}},
    "coherence_cohesion": {{"score": <5-9>, "feedback": "<specific feedback on structure and linking>"}},
    "lexical_resource": {{"score": <5-9>, "feedback": "<specific feedback on vocabulary accuracy>"}},
    "grammatical_range": {{"score": <5-9>, "feedback": "<specific feedback on grammar control>"}},
    "major_issues": ["<critical problem 1>", "<critical problem 2>"],
    "overall_feedback": "<4-5 sentences: honest assessment, specific improvements needed>",
    "band_justification": "<Why this band would survive Cambridge moderation>",
    "strengths": ["<genuine strength 1>", "<genuine strength 2>"],
    "areas_to_improve": ["<specific actionable improvement 1>", "<specific actionable improvement 2>"],
    "advanced_vocabulary_suggestions": ["<appropriate advanced word/phrase 1>", "<appropriate advanced word/phrase 2>"],
    "grammar_upgrade_examples": [
        {{"original": "<student's sentence>", "upgraded": "<Band 8 version>"}}
    ]
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {
            "band_score": 5.5,
            "task_achievement": {"score": 5.5, "feedback": "Response needs to address all parts more fully."},
            "coherence_cohesion": {"score": 5.5, "feedback": "Paragraph organization needs improvement."},
            "lexical_resource": {"score": 5.5, "feedback": "Vocabulary range is limited for Band 7+ target."},
            "grammatical_range": {"score": 5.5, "feedback": "Complex structures need more control."},
            "overall_feedback": "Essay needs more development and sophistication for Band 7+ target.",
            "strengths": ["Attempted to answer the question"],
            "areas_to_improve": ["Address all parts of the question", "Use more topic-specific vocabulary"],
            "advanced_vocabulary_suggestions": ["Review the module vocabulary"],
            "grammar_upgrade_examples": []
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Advanced writing evaluation error: {e}")
        return {
            "band_score": 5.5,
            "overall_feedback": "Evaluation error. Keep practicing with complex topics.",
            "areas_to_improve": ["Practice writing regularly with complex topics"]
        }

class AdvancedQuizRequest(BaseModel):
    module_id: str
    answers: dict  # {question_index: answer}

@api_router.post("/advanced-mastery/evaluate-quiz")
async def evaluate_advanced_quiz(request: AdvancedQuizRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate quiz answers for Advanced IELTS Mastery module"""
    try:
        module = await db.advanced_mastery_modules.find_one({"id": request.module_id}, {"_id": 0})
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
        
        questions = module.get("reading", {}).get("questions", [])
        correct = 0
        total = len(questions)
        results = []
        
        # Track skill breakdown by question type
        skill_breakdown = {}
        
        for idx, q in enumerate(questions):
            user_answer = request.answers.get(str(idx), "").strip().lower()
            correct_answer = q.get("answer", "").strip().lower()
            question_type = q.get("type", "unknown")
            
            # Flexible matching for advanced course
            is_correct = user_answer == correct_answer or correct_answer in user_answer or user_answer in correct_answer
            if is_correct:
                correct += 1
            
            results.append({
                "question": q.get("question", ""),
                "user_answer": request.answers.get(str(idx), ""),
                "correct_answer": q.get("answer", ""),
                "is_correct": is_correct,
                "question_type": question_type
            })
            
            # Aggregate by question type for skill breakdown
            if question_type not in skill_breakdown:
                skill_breakdown[question_type] = {"correct": 0, "total": 0}
            skill_breakdown[question_type]["total"] += 1
            if is_correct:
                skill_breakdown[question_type]["correct"] += 1
        
        # Add tips for weak areas
        for skill_type in skill_breakdown:
            data = skill_breakdown[skill_type]
            percentage = (data["correct"] / data["total"] * 100) if data["total"] > 0 else 0
            if percentage < 50:
                # Add targeted tip based on question type
                tips = {
                    "true_false_ng": "Look for specific evidence in the text. 'Not Given' means the information isn't stated.",
                    "matching_info": "Skim for keywords first, then read carefully around those keywords.",
                    "sentence_completion": "Use the exact words from the passage when possible.",
                    "summary_completion": "Read the summary first to understand the flow, then locate each answer.",
                    "vocabulary_match": "Context clues are key - look at surrounding sentences.",
                    "multiple_choice": "Eliminate obviously wrong answers first.",
                    "identify_view": "Focus on the author's tone and specific claims made."
                }
                skill_breakdown[skill_type]["tip"] = tips.get(skill_type, "Practice more questions of this type.")
        
        score_percentage = (correct / total * 100) if total > 0 else 0
        
        # Band estimation based on accuracy (advanced scale)
        if score_percentage >= 90:
            band = 8.5
        elif score_percentage >= 80:
            band = 8.0
        elif score_percentage >= 70:
            band = 7.5
        elif score_percentage >= 60:
            band = 7.0
        elif score_percentage >= 50:
            band = 6.5
        else:
            band = 6.0
        
        return {
            "score": score_percentage,
            "correct": correct,
            "total": total,
            "estimated_band": band,
            "results": results,
            "skill_breakdown": skill_breakdown,
            "feedback": f"You got {correct} out of {total} correct ({score_percentage:.0f}%). Estimated Reading Band: {band}"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.getLogger(__name__).error(f"Advanced quiz evaluation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate quiz")


class StrategyRequest(BaseModel):
    user_id: str
    current_band: float = 5.5
    target_band: float = 7.0
    recent_scores: Dict[str, Any] = {}  # e.g., {"writing": 5.5, "speaking": 6.0, "reading": 6.5}
    weak_areas: List[str] = []
    test_history_summary: str = ""

@api_router.post("/ai/strategy")
async def get_learning_strategy(request: StrategyRequest):
    """Get AI-powered learning strategy using IELTS Core Mindset in Strategy Mode"""
    try:
        system_message = f"""{IELTS_CORE_MINDSET}

{STRATEGY_MODE_PROMPT}"""
        
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Analyze this learner's profile and provide a strategic learning plan.

LEARNER PROFILE:
- Current Band: {request.current_band}
- Target Band: {request.target_band}
- Recent Skill Scores: {json.dumps(request.recent_scores)}
- Identified Weak Areas: {', '.join(request.weak_areas) if request.weak_areas else 'Not specified'}
- Test History: {request.test_history_summary or 'No history provided'}

Your task:
1. Diagnose the PRIMARY blockers preventing this learner from reaching their target band
2. Identify which skills need immediate attention
3. Recommend specific actions for the next 2-4 weeks
4. Suggest which course modules to focus on

Return JSON only:
{{
    "diagnosis": {{
        "primary_blockers": ["<blocker 1>", "<blocker 2>"],
        "skill_priority_order": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>"],
        "band_gap_analysis": "<explanation of what separates current from target band>"
    }},
    "action_plan": {{
        "immediate_focus": "<what to work on this week>",
        "secondary_focus": "<what to work on next>",
        "avoid": "<what to stop doing>",
        "practice_ratio": {{"reading": <percentage>, "writing": <percentage>, "speaking": <percentage>, "listening": <percentage>}}
    }},
    "recommended_modules": ["<module name 1>", "<module name 2>"],
    "weekly_goals": ["<goal 1>", "<goal 2>", "<goal 3>"],
    "realistic_timeline": "<estimated weeks to reach target band with consistent practice>",
    "motivation_reality_check": "<honest assessment - not encouraging fluff, just facts>"
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = str(response).strip()
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {
            "diagnosis": {"primary_blockers": ["Unable to analyze"], "skill_priority_order": ["writing", "speaking", "reading", "listening"]},
            "action_plan": {"immediate_focus": "Practice consistently", "secondary_focus": "Review weak areas"},
            "recommended_modules": ["Module 1: Language and Communication"],
            "weekly_goals": ["Complete 2 practice tests", "Review vocabulary daily"],
            "realistic_timeline": "4-8 weeks",
            "motivation_reality_check": "Consistent practice is key to improvement."
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Strategy generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate strategy")


# ============ BEGINNER ENGLISH COURSE ENDPOINTS ============

@api_router.get("/beginner-english/lessons")
async def get_beginner_lessons():
    """Get all beginner English lessons"""
    lessons = await db.beginner_english_lessons.find({}, {"_id": 0}).to_list(100)
    return lessons

@api_router.get("/beginner-english/lessons/{lesson_id}")
async def get_beginner_lesson(lesson_id: str):
    """Get a specific beginner English lesson"""
    lesson = await db.beginner_english_lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

class BeginnerSpeakingRequest(BaseModel):
    question: str
    model_answer: str
    user_response: str

@api_router.post("/beginner-english/evaluate-speaking")
async def evaluate_beginner_speaking(request: BeginnerSpeakingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate beginner speaking response with simple feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are a friendly English teacher helping beginner students."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are a friendly English teacher for beginner students (Band 4.5 and below).
        
Question: {request.question}
Model Answer: {request.model_answer}
Student's Response: {request.user_response}

Evaluate the student's response. Be encouraging and use simple language.

Return JSON:
{{
    "score": <0-100>,
    "feedback": "<Simple, encouraging feedback in 1-2 sentences>",
    "tip": "<One simple tip to improve>"
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"score": 60, "feedback": "Good try! Keep practicing.", "tip": "Try to answer in complete sentences."}
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Beginner speaking evaluation error: {e}")
        return {"score": 60, "feedback": "Good effort! Keep practicing.", "tip": "Practice speaking more."}

class BeginnerWritingRequest(BaseModel):
    task: str
    model_answer: str
    user_response: str

@api_router.post("/beginner-english/evaluate-writing")
async def evaluate_beginner_writing(request: BeginnerWritingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate beginner writing response with simple feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are a friendly English teacher helping beginner students."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are a friendly English teacher for beginner students (Band 4.5 and below).
        
Writing Task: {request.task}
Model Answer: {request.model_answer}
Student's Writing: {request.user_response}

Evaluate the student's writing. Be encouraging and use simple language.

Return JSON:
{{
    "score": <0-100>,
    "feedback": "<Simple, encouraging feedback in 2-3 sentences>",
    "grammar_tips": ["<1-2 simple grammar tips if needed>"]
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"score": 60, "feedback": "Good try! Keep writing.", "grammar_tips": ["Check your verb forms."]}
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Beginner writing evaluation error: {e}")
        return {"score": 60, "feedback": "Good effort! Keep writing.", "grammar_tips": []}


# ============ Listening Audio Generation ============

from utils.multi_speaker_tts import generate_multi_speaker_audio

class ListeningAudioRequest(BaseModel):
    lesson_id: str
    transcript: str
    level: str = "beginner"

@api_router.post("/beginner-english/generate-listening-audio")
async def generate_listening_audio(request: ListeningAudioRequest):
    """Generate multi-speaker audio for listening section using Azure TTS"""
    try:
        audio_base64 = await generate_multi_speaker_audio(
            transcript=request.transcript,
            level=request.level
        )
        return {
            "success": True,
            "audio_base64": audio_base64,
            "format": "mp3"
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Audio generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/beginner-english/listening-audio/{lesson_id}")
async def get_listening_audio(lesson_id: str):
    """Get or generate listening audio for a lesson"""
    # First check if pre-generated audio exists
    cached = await db.listening_audio_cache.find_one({"lesson_id": lesson_id}, {"_id": 0})
    if cached and cached.get("audio_base64"):
        return {
            "success": True,
            "audio_base64": cached["audio_base64"],
            "format": "mp3",
            "cached": True
        }
    
    # Get lesson and generate audio
    lesson = await db.beginner_english_lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    listening = lesson.get("listening")
    if not listening or not listening.get("transcript"):
        raise HTTPException(status_code=404, detail="No listening content for this lesson")
    
    try:
        audio_base64 = await generate_multi_speaker_audio(
            transcript=listening["transcript"],
            level="beginner"
        )
        
        # Cache the generated audio
        await db.listening_audio_cache.update_one(
            {"lesson_id": lesson_id},
            {"$set": {
                "lesson_id": lesson_id,
                "audio_base64": audio_base64,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        
        return {
            "success": True,
            "audio_base64": audio_base64,
            "format": "mp3",
            "cached": False
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Audio generation failed for {lesson_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ Notes API (Phase 2) ============

class NoteCreate(BaseModel):
    user_id: str
    test_id: str
    test_type: str
    content: str
    timestamp: str

@api_router.post("/notes")
async def create_note(note: NoteCreate, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(note.user_id, caller)
    """Create a new note for a test/module"""
    note_doc = {
        "id": str(uuid.uuid4()),
        "user_id": note.user_id,
        "test_id": note.test_id,
        "test_type": note.test_type,
        "content": note.content,
        "timestamp": note.timestamp or datetime.now(timezone.utc).isoformat()
    }
    await db.user_notes.insert_one(note_doc)
    return {k: v for k, v in note_doc.items() if k != '_id'}

@api_router.get("/notes/{user_id}/{test_id}")
async def get_notes(user_id: str, test_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get all notes for a user and test"""
    notes = await db.user_notes.find(
        {"user_id": user_id, "test_id": test_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    return notes

@api_router.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    """Delete a note"""
    result = await db.user_notes.delete_one({"id": note_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"status": "deleted"}


# ============ Highlights API (Phase 2) ============

class HighlightCreate(BaseModel):
    user_id: str
    test_id: str
    test_type: str
    start_index: int
    end_index: int
    color: str
    highlighted_text: str
    timestamp: str

@api_router.post("/highlights")
async def create_highlight(highlight: HighlightCreate, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(highlight.user_id, caller)
    """Create a new text highlight"""
    highlight_doc = {
        "id": str(uuid.uuid4()),
        "user_id": highlight.user_id,
        "test_id": highlight.test_id,
        "test_type": highlight.test_type,
        "start_index": highlight.start_index,
        "end_index": highlight.end_index,
        "color": highlight.color,
        "highlighted_text": highlight.highlighted_text,
        "timestamp": highlight.timestamp or datetime.now(timezone.utc).isoformat()
    }
    await db.user_highlights.insert_one(highlight_doc)
    return {k: v for k, v in highlight_doc.items() if k != '_id'}

@api_router.get("/highlights/{user_id}/{test_id}")
async def get_highlights(user_id: str, test_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get all highlights for a user and test"""
    highlights = await db.user_highlights.find(
        {"user_id": user_id, "test_id": test_id},
        {"_id": 0}
    ).sort("start_index", 1).to_list(100)
    return highlights

@api_router.delete("/highlights/{highlight_id}")
async def delete_highlight(highlight_id: str):
    """Delete a highlight"""
    result = await db.user_highlights.delete_one({"id": highlight_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Highlight not found")
    return {"status": "deleted"}


# ============ Skill Analytics API (Phase 4) ============

@api_router.get("/skill-analytics/{user_id}")
async def get_skill_analytics(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get cumulative skill analytics for a user across all tests"""
    try:
        # Get all test attempts for this user
        attempts = await db.test_attempts.find(
            {"user_id": user_id},
            {"_id": 0}
        ).to_list(500)
        
        if not attempts:
            return {
                "total_tests": 0,
                "average_score": 0,
                "average_band": None,
                "skill_performance": {},
                "strengths": [],
                "areas_to_improve": []
            }
        
        # Aggregate skill performance
        skill_totals = {}
        total_score = 0
        total_band = 0
        band_count = 0
        
        for attempt in attempts:
            # Sum scores
            if attempt.get("score") is not None:
                total_score += attempt["score"]
            
            # Sum bands
            if attempt.get("feedback", {}).get("estimated_band"):
                band = attempt["feedback"]["estimated_band"]
                if isinstance(band, (int, float)):
                    total_band += band
                    band_count += 1
            
            # Aggregate skill breakdown
            breakdown = attempt.get("feedback", {}).get("skill_breakdown", {})
            if isinstance(breakdown, dict):
                for skill_type, data in breakdown.items():
                    if skill_type not in skill_totals:
                        skill_totals[skill_type] = {"correct": 0, "total": 0}
                    if isinstance(data, dict):
                        skill_totals[skill_type]["correct"] += data.get("correct", 0)
                        skill_totals[skill_type]["total"] += data.get("total", 0)
        
        # Calculate strengths and weaknesses
        strengths = []
        areas_to_improve = []
        
        for skill_type, data in skill_totals.items():
            if data["total"] > 0:
                percentage = (data["correct"] / data["total"]) * 100
                if percentage >= 70:
                    strengths.append(skill_type)
                elif percentage < 50:
                    areas_to_improve.append(skill_type)
        
        return {
            "total_tests": len(attempts),
            "average_score": round(total_score / len(attempts), 1) if attempts else 0,
            "average_band": round(total_band / band_count, 1) if band_count > 0 else None,
            "skill_performance": skill_totals,
            "strengths": strengths[:5],
            "areas_to_improve": areas_to_improve[:5]
        }
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Skill analytics error: {e}")
        return {
            "total_tests": 0,
            "average_score": 0,
            "skill_performance": {},
            "strengths": [],
            "areas_to_improve": []
        }


# ============ Writing Analysis with Grammar Errors API (Phase 3) ============

@api_router.post("/writing/analyze-errors")
async def analyze_writing_errors(request: Request):
    """Analyze writing text for grammar/spelling errors using AI"""
    try:
        data = await request.json()
        text = data.get("text", "")
        
        if not text:
            return {"grammar_errors": []}
        
        chat = LlmChat(api_key=os.getenv("EMERGENT_LLM_KEY"))
        prompt = f"""Analyze this IELTS writing text for grammar, spelling, and style errors.

TEXT:
{text}

Return a JSON object with:
{{
  "grammar_errors": [
    {{
      "start": <start index in text>,
      "end": <end index in text>,
      "type": "grammar" | "spelling" | "style",
      "original": "<the error text>",
      "suggestion": "<correction or suggestion>"
    }}
  ],
  "criteria_scores": {{
    "task_response": <score 1-9>,
    "coherence": <score 1-9>,
    "lexical_resource": <score 1-9>,
    "grammatical_range": <score 1-9>
  }},
  "overall_feedback": "<brief overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "areas_to_improve": ["<area 1>", "<area 2>"],
  "grammar_upgrade_examples": [
    {{
      "original": "<basic sentence from text>",
      "upgraded": "<Band 8+ version>",
      "explanation": "<why it's better>"
    }}
  ]
}}

Be precise with start/end indices. Only flag real errors. Return valid JSON only."""

        response = await chat.send_async([UserMessage(text=prompt)])
        response_text = response.text.strip()
        
        # Parse JSON from response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"grammar_errors": [], "overall_feedback": "Analysis complete."}
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Writing analysis error: {e}")
        return {"grammar_errors": [], "overall_feedback": "Could not analyze text."}


# Include router
app.include_router(api_router)

# Codex audit P0 (#95): drop the `["*"]` fallback. allow_credentials=True
# combined with `*` is silently rejected by browsers anyway, but leaving it
# there makes the intent ambiguous and would happily accept any Origin if a
# downstream framework loosened the credentials flag. Production must set
# CORS_ORIGINS in Railway env; missing config now fails loud with explicit
# CORS errors instead of opening the door.
_cors_origins = [
    o.strip()
    for o in os.environ.get('CORS_ORIGINS', '').split(',')
    if o.strip()
]
if not _cors_origins:
    # Dev-only fallback — local frontend ports. Prod must configure CORS_ORIGINS.
    _cors_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============================================================================
# FIX COMBINED QUESTION IDS (Q20-21 deployment issue)
# =============================================================================
async def fix_combined_question_ids():
    """
    Fix combined question IDs that may have been incorrectly split during deployment.
    This runs on startup to ensure Q20-21 style questions display correctly.
    """
    try:
        # Define the correct combined question mappings with full data
        # These are "Choose TWO" questions that should have combined IDs
        combined_mappings = {
            # Reading Test 1 - Passage 2
            "reading_passage2_q20_21": {
                "test_title_contains": "Academic Reading Practice Test 1",
                "old_ids": [20, 21],
                "new_id": "20-21",
                "passage": 2,
                "type": "multiple_choice_multi",
                "question": "Which TWO statements does the writer make about inhabitants of the Mediterranean region in the ancient world?",
                "options": ["A) They often used stolen vessels to carry out pirate attacks", "B) They managed to escape capture by the authorities because they knew the area so well", "C) They paid for information about the routes merchant ships would take", "D) They depended more on the sea for their livelihood than on farming", "E) They stored many of the goods taken in pirate attacks in coves along the coastline"]
            },
            "reading_passage2_q22_23": {
                "test_title_contains": "Academic Reading Practice Test 1",
                "old_ids": [22, 23],
                "new_id": "22-23",
                "passage": 2,
                "type": "multiple_choice_multi",
                "question": "Which TWO statements does the writer make about piracy and ancient Greece?",
                "options": ["A) The state estimated that very few people were involved in piracy", "B) Attitudes towards piracy changed shortly after the Iliad and the Odyssey were written", "C) Important officials were known to occasionally take part in piracy", "D) Every citizen regarded pirate attacks on cities as unacceptable", "E) A favourable view of piracy is evident in certain ancient Greek texts"]
            },
            # Reading Test 2 - Passage 2
            "reading2_passage2_q23_24": {
                "test_title_contains": "Academic Reading Practice Test 2",
                "old_ids": [23, 24],
                "new_id": "23-24",
                "passage": 2,
                "type": "multiple_choice_multi",
                "question": "Which TWO facts about Emma Raducanu's withdrawal from the Wimbledon tournament are mentioned in the text?",
                "options": ["A) the stage at which she dropped out of the tournament", "B) symptoms of her performance stress at the tournament", "C) measures which she had taken to manage her stress levels", "D) aspects of the Wimbledon tournament which increased her stress levels", "E) reactions to her social media posts about her experience at Wimbledon"]
            },
            # Listening Test 1 - Part 3
            "listening1_part3_q21_22": {
                "test_title_contains": "Test 1 - Listening",
                "old_ids": [21, 22],
                "new_id": "21-22",
                "section": 3,
                "type": "multiple_choice_multi",
                "question": "Which TWO things did Colin find most satisfying about his bread reuse project?",
                "options": ["A) receiving support from local restaurants", "B) finding a good way to prevent waste", "C) overcoming problems in a basic process", "D) experimenting with designs and colours", "E) learning how to apply 3-D printing"]
            },
            "listening1_part3_q23_24": {
                "test_title_contains": "Test 1 - Listening",
                "old_ids": [23, 24],
                "new_id": "23-24",
                "section": 3,
                "type": "multiple_choice_multi",
                "question": "Which TWO ways do the students agree that touch-sensitive sensors for food labels could be developed in future?",
                "options": ["A) for use on medical products", "B) to show that food is no longer fit to eat", "C) for use with drinks as well as foods", "D) to provide applications for blind people", "E) to indicate the weight of certain foods"]
            },
            # Listening Test 2 - Part 2 (Q17-18, Q19-20)
            "listening2_part2_q17_18": {
                "test_title_contains": "Test 2 - Listening",
                "old_ids": [17, 18],
                "new_id": "17-18",
                "section": 2,
                "type": "multiple_choice_multi",
                "question": "Which TWO things does David say about the lifeboat volunteer training?",
                "options": ["A) It often involves putting to sea.", "B) It teaches both practical and academic skills.", "C) It is based on a fixed schedule.", "D) It can take up to a year to complete.", "E) It includes preparation for emergency situations."]
            },
            "listening2_part2_q19_20": {
                "test_title_contains": "Test 2 - Listening",
                "old_ids": [19, 20],
                "new_id": "19-20",
                "section": 2,
                "type": "multiple_choice_multi",
                "question": "Which TWO things does David find most motivating about the work he does?",
                "options": ["A) the knowledge that he is protecting people's safety", "B) the range of tasks that he is given to do", "C) the chance to work alongside full-time lifeboat crews", "D) the reputation that the lifeboat service has", "E) the chance to develop new equipment"]
            },
        }
        
        fixed_count = 0
        
        for mapping_key, mapping in combined_mappings.items():
            # Find the test
            test = await db.tests.find_one({
                "title": {"$regex": mapping["test_title_contains"], "$options": "i"}
            })
            
            if not test:
                continue
            
            questions = test.get("questions", [])
            answer_key = test.get("answer_key", [])
            
            # Check if already has combined ID
            has_combined = any(str(q.get("id")) == mapping["new_id"] for q in questions)
            if has_combined:
                continue  # Already fixed
            
            # Find the individual questions to combine
            old_id_1, old_id_2 = mapping["old_ids"]
            q1 = None
            q2 = None
            q1_idx = None
            q2_idx = None
            
            for idx, q in enumerate(questions):
                q_id = q.get("id")
                if q_id == old_id_1 or str(q_id) == str(old_id_1):
                    q1 = q
                    q1_idx = idx
                elif q_id == old_id_2 or str(q_id) == str(old_id_2):
                    q2 = q
                    q2_idx = idx
            
            if not q1 or not q2:
                continue  # Questions not found as separate
            
            # Check if they're multi-select questions that should be combined
            if q1.get("type") != "multiple_choice_multi" and "two" not in q1.get("question", "").lower():
                continue  # Not a "choose two" question
            
            logger.info(f"🔧 Fixing combined questions in: {test.get('title')}")
            logger.info(f"   Combining Q{old_id_1} + Q{old_id_2} → Q{mapping['new_id']}")
            
            # Create combined question with full data from mapping
            combined_q = {
                "id": mapping["new_id"],
                "type": mapping.get("type", "multiple_choice_multi"),
                "question": mapping.get("question", q1.get("question", "")),
                "options": mapping.get("options", q1.get("options", [])),
                "answer_count": 2,
                "answer_ids": [old_id_1, old_id_2]
            }
            
            # Add passage or section if present
            if "passage" in mapping:
                combined_q["passage"] = mapping["passage"]
            if "section" in mapping:
                combined_q["section"] = mapping["section"]
            elif "section" in q1:
                combined_q["section"] = q1["section"]
            
            # Build new questions list
            new_questions = []
            for idx, q in enumerate(questions):
                if idx == q1_idx:
                    new_questions.append(combined_q)
                elif idx == q2_idx:
                    continue  # Skip the second question (now combined)
                else:
                    new_questions.append(q)
            
            # Fix answer key
            new_answer_key = []
            ak1 = None
            ak2 = None
            
            for ak in answer_key:
                ak_id = ak.get("question_id")
                if ak_id == old_id_1 or str(ak_id) == str(old_id_1):
                    ak1 = ak
                elif ak_id == old_id_2 or str(ak_id) == str(old_id_2):
                    ak2 = ak
                else:
                    new_answer_key.append(ak)
            
            if ak1:
                combined_ak = ak1.copy()
                combined_ak["question_id"] = mapping["new_id"]
                if ak2:
                    # Combine answers
                    ans1 = ak1.get("answer", [])
                    ans2 = ak2.get("answer", [])
                    if isinstance(ans1, list) and isinstance(ans2, list):
                        combined_ak["answer"] = ans1 + ans2
                    elif isinstance(ans1, str) and isinstance(ans2, str):
                        combined_ak["answer"] = [ans1, ans2]
                new_answer_key.append(combined_ak)
            
            # Update the test
            await db.tests.update_one(
                {"id": test["id"]},
                {"$set": {
                    "questions": new_questions,
                    "answer_key": new_answer_key
                }}
            )
            
            fixed_count += 1
            logger.info(f"   ✅ Fixed: Q{mapping['new_id']}")
        
        if fixed_count > 0:
            logger.info(f"🎉 Fixed {fixed_count} combined question issues")
        else:
            logger.info("✅ All combined questions are correctly formatted")
            
    except Exception as e:
        logger.error(f"Error fixing combined questions: {e}")

async def seed_a2_level():
    """Seed A2 Pre-Intermediate level if missing"""
    try:
        a2_level = {
            "id": "level_a2",
            "level_code": "A2",
            "level_name": "A2 Pre-Intermediate",
            "level_order": 3,
            "description": "Build confidence with everyday conversations, travel, shopping, and describing experiences",
            "target_band_range": "4.0-4.5",
            "pathway": "cefr",
            "total_estimated_hours": 55,
            "units": [
                {
                    "id": "unit_a2_1",
                    "unit_number": 1,
                    "title": "Travel & Transport",
                    "description": "Learn to navigate travel situations and discuss journeys",
                    "learning_objectives": ["Book tickets and accommodation", "Ask for and give directions", "Describe travel experiences", "Use past simple for completed actions"],
                    "estimated_hours": 11,
                    "is_locked": True,
                    "lessons": [
                        {"id": "lesson_a2_1_1", "lesson_number": 1, "title": "At the Airport", "description": "Learn vocabulary for air travel", "duration_minutes": 45, "lesson_type": "vocabulary", "required_for_next": True, "content": {"vocabulary": ["check-in", "boarding pass", "gate", "departure", "arrival", "luggage", "passport", "flight", "delayed", "cancelled"], "grammar_focus": "Past Simple: I flew to London", "example_sentences": ["I checked in online yesterday.", "My flight was delayed by two hours.", "Where is gate 12?"], "exercises": []}},
                        {"id": "lesson_a2_1_2", "lesson_number": 2, "title": "Asking for Directions", "description": "Navigate cities and ask for help", "duration_minutes": 45, "lesson_type": "speaking", "required_for_next": True, "content": {"vocabulary": ["turn left", "turn right", "go straight", "next to", "opposite", "corner", "roundabout", "traffic lights"], "grammar_focus": "Imperatives and prepositions of place", "example_sentences": ["Excuse me, where is the train station?", "Go straight and turn left at the traffic lights.", "It's opposite the bank."], "exercises": []}}
                    ],
                    "unit_quiz": {"id": "quiz_a2_1", "title": "Unit 1 Quiz: Travel & Transport", "quiz_type": "unit_quiz", "duration_minutes": 20, "passing_score": 70, "questions": [{"id": "q1", "type": "multiple_choice", "question": "I ___ to Paris last summer.", "options": ["A) fly", "B) flew", "C) flying"], "correct_answer": "B"}]}
                },
                {
                    "id": "unit_a2_2",
                    "unit_number": 2,
                    "title": "Shopping & Services",
                    "description": "Handle shopping situations and describe products",
                    "learning_objectives": ["Ask about prices and compare products", "Describe clothes and items", "Make complaints politely", "Use comparatives and superlatives"],
                    "estimated_hours": 11,
                    "is_locked": True,
                    "lessons": [
                        {"id": "lesson_a2_2_1", "lesson_number": 1, "title": "In the Shop", "description": "Shopping vocabulary and phrases", "duration_minutes": 45, "lesson_type": "vocabulary", "required_for_next": True, "content": {"vocabulary": ["receipt", "refund", "exchange", "discount", "sale", "fitting room", "size", "price", "cash", "card"], "grammar_focus": "Comparatives: cheaper than, more expensive", "example_sentences": ["Can I try this on?", "Do you have this in a smaller size?", "This one is cheaper than that one."], "exercises": []}}
                    ],
                    "unit_quiz": {"id": "quiz_a2_2", "title": "Unit 2 Quiz: Shopping", "quiz_type": "unit_quiz", "duration_minutes": 15, "passing_score": 70, "questions": [{"id": "q1", "type": "multiple_choice", "question": "This jacket is ___ than that one.", "options": ["A) expensive", "B) more expensive", "C) most expensive"], "correct_answer": "B"}]}
                },
                {
                    "id": "unit_a2_3",
                    "unit_number": 3,
                    "title": "Health & Body",
                    "description": "Describe symptoms and visit the doctor",
                    "learning_objectives": ["Describe health problems", "Understand medical advice", "Talk about healthy habits", "Use should/shouldn't for advice"],
                    "estimated_hours": 11,
                    "is_locked": True,
                    "lessons": [
                        {"id": "lesson_a2_3_1", "lesson_number": 1, "title": "At the Doctor's", "description": "Medical vocabulary and expressions", "duration_minutes": 45, "lesson_type": "vocabulary", "required_for_next": True, "content": {"vocabulary": ["headache", "fever", "cough", "prescription", "medicine", "appointment", "symptom", "pain", "rest", "recover"], "grammar_focus": "Should/Shouldn't: You should rest", "example_sentences": ["I have a terrible headache.", "You should take this medicine twice a day.", "How long have you had this cough?"], "exercises": []}}
                    ],
                    "unit_quiz": {"id": "quiz_a2_3", "title": "Unit 3 Quiz: Health", "quiz_type": "unit_quiz", "duration_minutes": 15, "passing_score": 70, "questions": [{"id": "q1", "type": "multiple_choice", "question": "You ___ eat more vegetables.", "options": ["A) should", "B) shouldn't", "C) must to"], "correct_answer": "A"}]}
                }
            ],
            "exit_test": {
                "id": "exit_test_a2",
                "title": "A2 Exit Test",
                "description": "Complete assessment to unlock B1 level",
                "quiz_type": "exit_test",
                "duration_minutes": 45,
                "passing_score": 75,
                "target_band": 4.5,
                "questions": [
                    {"id": "q1", "type": "multiple_choice", "question": "We ___ to Italy last year.", "options": ["A) go", "B) went", "C) going"], "correct_answer": "B"},
                    {"id": "q2", "type": "multiple_choice", "question": "This hotel is ___ than the other one.", "options": ["A) comfortable", "B) more comfortable", "C) most comfortable"], "correct_answer": "B"},
                    {"id": "q3", "type": "multiple_choice", "question": "You ___ smoke in the hospital.", "options": ["A) should", "B) shouldn't", "C) must"], "correct_answer": "B"}
                ]
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert A2 level
        await db.learning_levels.insert_one(a2_level)
        
        # Update level orders for B1 and higher
        await db.learning_levels.update_one({"id": "level_b1"}, {"$set": {"level_order": 4}})
        await db.learning_levels.update_one({"id": "level_b2"}, {"$set": {"level_order": 5}})
        await db.learning_levels.update_one({"id": "level_ielts_7"}, {"$set": {"level_order": 6}})
        
        logger.info("✅ A2 level seeded successfully")
    except Exception as e:
        logger.error(f"Error seeding A2 level: {e}")


# ============ FEEDBACK API ENDPOINTS ============

@app.post("/api/feedback")
async def submit_feedback(feedback: FeedbackCreate):
    """Submit user feedback (public endpoint - no auth required)"""
    try:
        feedback_doc = {
            "id": str(uuid.uuid4()),
            "user_id": feedback.user_id,
            "user_email": feedback.user_email,
            "user_name": feedback.user_name,
            "type": feedback.type,
            "message": feedback.message,
            "rating": feedback.rating,
            "page_url": feedback.page_url,
            "user_agent": feedback.user_agent,
            "resolved": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        
        await db.feedbacks.insert_one(feedback_doc)
        logger.info(f"📝 New feedback submitted: {feedback.type} from {feedback.user_email}")
        
        return {"success": True, "message": "Feedback submitted successfully", "id": feedback_doc["id"]}
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")


@app.get("/api/admin/feedbacks")
async def get_all_feedbacks(admin_email: Optional[str] = Query(None), _admin: dict = Depends(auth_session.require_admin)):
    """Get all feedbacks (admin only)"""
    from security_utils import require_admin_email
    require_admin_email(admin_email)
    try:
        feedbacks = await db.feedbacks.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
        return feedbacks
    except Exception as e:
        logger.error(f"Error fetching feedbacks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch feedbacks")


@app.put("/api/admin/feedbacks/{feedback_id}/resolve")
async def resolve_feedback(feedback_id: str, admin_email: Optional[str] = Query(None), _admin: dict = Depends(auth_session.require_admin)):
    """Mark feedback as resolved (admin only)"""
    from security_utils import require_admin_email
    require_admin_email(admin_email)
    try:
        result = await db.feedbacks.update_one(
            {"id": feedback_id},
            {"$set": {"resolved": True, "resolved_at": datetime.now(timezone.utc).isoformat()}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return {"success": True, "message": "Feedback marked as resolved"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to resolve feedback")


@app.delete("/api/admin/feedbacks/{feedback_id}")
async def delete_feedback(feedback_id: str, admin_email: Optional[str] = Query(None), _admin: dict = Depends(auth_session.require_admin)):
    """Delete feedback (admin only)"""
    from security_utils import require_admin_email
    require_admin_email(admin_email)
    try:
        result = await db.feedbacks.delete_one({"id": feedback_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return {"success": True, "message": "Feedback deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete feedback")


# ============ ADMIN: OPS DASHBOARD ============
# One endpoint, six panels. Powers /admin/ops in the frontend so Aga can
# eyeball "is everything still alive?" from a single page (service health,
# anon eval queue, LLM cost, revenue, users, Resend email delivery).
#
# Performance: every panel is an aggregate over a small time window so the
# total payload is well under 100 KB even on busy days. We fan out with
# asyncio.gather so the call returns in roughly the time of the slowest
# query (usually the cost rollup).


@app.get("/api/admin/ops/overview")
async def admin_ops_overview(admin_email: str = Query(...), _admin: dict = Depends(auth_session.require_admin)):
    """Single-call dashboard data. See /admin/ops in the frontend."""
    from security_utils import require_admin_email
    from services import cost_telemetry

    require_admin_email(admin_email)

    now = datetime.now(timezone.utc)
    h24 = now - timedelta(hours=24)
    d7 = now - timedelta(days=7)
    d30 = now - timedelta(days=30)

    # --- 1. Services health --------------------------------------------------
    async def _services():
        services = {}
        # Mongo ping
        try:
            await db.command("ping")
            services["mongo"] = {"ok": True, "note": "ping ok"}
        except Exception as exc:
            services["mongo"] = {"ok": False, "note": str(exc)[:120]}
        # Resend API key configured?
        services["resend"] = {
            "ok": bool(os.getenv("RESEND_API_KEY")),
            "from_email": os.getenv("RESEND_FROM_EMAIL") or "onboarding@resend.dev",
            "note": (
                "Using Resend sandbox — emails to addresses other than the "
                "Resend account owner will be blocked with 403. Verify your "
                "domain in Resend to send to real users."
                if (os.getenv("RESEND_FROM_EMAIL") or "onboarding@resend.dev")
                .endswith("resend.dev")
                else "Verified from-address."
            ),
        }
        # LLM provider keys (just presence — we don't ping the upstream APIs
        # from here because each ping costs a token and adds latency).
        services["anthropic"] = {"ok": bool(os.getenv("ANTHROPIC_API_KEY"))}
        services["openai"] = {"ok": bool(os.getenv("OPENAI_API_KEY"))}
        services["azure_speech"] = {"ok": bool(os.getenv("AZURE_SPEECH_KEY"))}
        services["elevenlabs"] = {"ok": bool(os.getenv("ELEVENLABS_API_KEY"))}
        services["paypal"] = {"ok": bool(os.getenv("PAYPAL_CLIENT_ID"))}
        services["sepay"] = {"ok": bool(os.getenv("SEPAY_API_KEY")) and os.getenv("ENVIRONMENT") == "production"}
        services["r2"] = {"ok": bool(os.getenv("R2_ACCOUNT_ID")) and bool(os.getenv("R2_BUCKET"))}
        services["frontend_base_url"] = {
            "ok": bool(os.getenv("FRONTEND_BASE_URL")),
            "value": os.getenv("FRONTEND_BASE_URL") or "(default: https://www.testmaster.pro)",
        }
        return services

    # --- 2. Anonymous eval queue (score-my-essay async pipeline) -------------
    async def _anon_evals():
        coll = db.anonymous_evaluations
        pending = await coll.count_documents({"status": "pending"})
        complete_24h = await coll.count_documents({
            "status": "complete",
            "completed_at": {"$gte": h24},
        })
        failed_24h = await coll.count_documents({
            "status": "failed",
            "failed_at": {"$gte": h24},
        })
        complete_7d = await coll.count_documents({
            "status": "complete",
            "completed_at": {"$gte": d7},
        })
        # Recent 20 — obfuscate email so screenshots are shareable.
        recent_raw = await coll.find(
            {},
            {
                "_id": 0,
                "email": 1,
                "status": 1,
                "task_type": 1,
                "user_language": 1,
                "created_at": 1,
                "completed_at": 1,
                "failed_at": 1,
                "error": 1,
                "email_delivery": 1,
                "marketing_consent": 1,
                "marketing_audience": 1,
                "result.overall_band": 1,
                "token": 1,
            },
        ).sort("created_at", -1).limit(20).to_list(length=20)

        def _obfuscate(addr):
            if not addr or "@" not in addr:
                return addr
            local, dom = addr.split("@", 1)
            head = local[:2] if len(local) > 2 else local[:1]
            return f"{head}***@{dom}"

        recent = []
        for r in recent_raw:
            band = (r.get("result") or {}).get("overall_band")
            delivery = r.get("email_delivery") or {}
            audience = r.get("marketing_audience") or {}
            recent.append({
                "email_masked": _obfuscate(r.get("email")),
                "status": r.get("status"),
                "task_type": r.get("task_type"),
                "language": r.get("user_language"),
                "created_at": r.get("created_at"),
                "completed_at": r.get("completed_at"),
                "failed_at": r.get("failed_at"),
                "error": (r.get("error") or "")[:120],
                "band": round(float(band), 1) if isinstance(band, (int, float)) else None,
                "email_ok": delivery.get("ok"),
                "email_error": (delivery.get("error") or "")[:120],
                "marketing_consent": bool(r.get("marketing_consent")),
                "audience_ok": audience.get("ok"),
                "audience_skipped": bool(audience.get("skipped")),
                "audience_error": (audience.get("reason") or "")[:120],
                "token": r.get("token"),
            })

        # Marketing roll-up: who opted in and whether the audience sync
        # actually landed. Surfaces silent skip when RESEND_AUDIENCE_ID is
        # unset and broken syncs (invalid id, dupe contact) at a glance.
        marketing_opted = await coll.count_documents({"marketing_consent": True})
        marketing_synced = await coll.count_documents({"marketing_audience.ok": True})

        return {
            "pending": pending,
            "complete_24h": complete_24h,
            "failed_24h": failed_24h,
            "complete_7d": complete_7d,
            "marketing_opted_total": marketing_opted,
            "marketing_synced_total": marketing_synced,
            "recent": recent,
        }

    # --- 3. LLM cost summary (reuse existing telemetry) ----------------------
    async def _cost():
        try:
            week = await cost_telemetry.summarize(days=7)
            month = await cost_telemetry.summarize(days=30)
            return {
                "week": {
                    "total_usd": week.get("total_usd"),
                    "threshold_usd": week.get("threshold_usd"),
                    "by_scope": week.get("by_scope", [])[:10],
                    "by_model": week.get("by_model", [])[:10],
                    "daily": week.get("daily", []),
                },
                "month": {
                    "total_usd": month.get("total_usd"),
                    "by_model": month.get("by_model", [])[:10],
                },
                "available": week.get("available", False),
            }
        except Exception as exc:
            return {"available": False, "error": str(exc)[:200]}

    # --- 4. Revenue (PayPal payment_orders + SePay pending_payments) ---------
    async def _revenue():
        revenue = {"paypal": {"week_count": 0, "month_count": 0, "month_usd": 0.0},
                   "sepay":  {"week_count": 0, "month_count": 0, "month_vnd": 0}}
        # PayPal — `payment_orders` collection holds completed orders.
        try:
            paypal_week = await db.payment_orders.count_documents({
                "status": {"$in": ["COMPLETED", "completed", "captured"]},
                "created_at": {"$gte": d7},
            })
            paypal_month_cursor = db.payment_orders.aggregate([
                {"$match": {
                    "status": {"$in": ["COMPLETED", "completed", "captured"]},
                    "created_at": {"$gte": d30},
                }},
                {"$group": {
                    "_id": None,
                    "count": {"$sum": 1},
                    "total_usd": {"$sum": "$amount_usd"},
                }},
            ])
            paypal_month_doc = await paypal_month_cursor.to_list(length=1)
            paypal_month = paypal_month_doc[0] if paypal_month_doc else {}
            revenue["paypal"] = {
                "week_count": paypal_week,
                "month_count": paypal_month.get("count", 0),
                "month_usd": round(float(paypal_month.get("total_usd") or 0), 2),
            }
        except Exception as exc:
            revenue["paypal"]["error"] = str(exc)[:120]
        # SePay — `pending_payments` with status='paid'.
        try:
            sepay_week = await db.pending_payments.count_documents({
                "status": "paid",
                "paid_at": {"$gte": d7},
            })
            sepay_month_cursor = db.pending_payments.aggregate([
                {"$match": {"status": "paid", "paid_at": {"$gte": d30}}},
                {"$group": {
                    "_id": None,
                    "count": {"$sum": 1},
                    "total_vnd": {"$sum": "$amount_vnd"},
                }},
            ])
            sepay_month_doc = await sepay_month_cursor.to_list(length=1)
            sepay_month = sepay_month_doc[0] if sepay_month_doc else {}
            revenue["sepay"] = {
                "week_count": sepay_week,
                "month_count": sepay_month.get("count", 0),
                "month_vnd": int(sepay_month.get("total_vnd") or 0),
            }
        except Exception as exc:
            revenue["sepay"]["error"] = str(exc)[:120]
        return revenue

    # --- 5. Users (signups + active + plan breakdown) ------------------------
    async def _users():
        coll = db.users
        total = await coll.count_documents({})
        signups_24h = await coll.count_documents({"created_at": {"$gte": h24}})
        signups_7d = await coll.count_documents({"created_at": {"$gte": d7}})
        # Verified ratio — soft signal for spam vs real signups.
        verified = await coll.count_documents({"email_verified": True})
        # Plan breakdown.
        plan_agg = db.users.aggregate([
            {"$group": {"_id": "$plan", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ])
        plan_breakdown = [
            {"plan": d["_id"] or "(unset)", "count": d["count"]}
            for d in await plan_agg.to_list(length=20)
        ]
        # Active in last 7d (last_login_at if present).
        active_7d = await coll.count_documents({"last_login_at": {"$gte": d7}})
        return {
            "total": total,
            "signups_24h": signups_24h,
            "signups_7d": signups_7d,
            "verified": verified,
            "active_7d": active_7d,
            "plan_breakdown": plan_breakdown,
        }

    # --- 6. Resend email delivery (last 24h from anon eval log) --------------
    async def _resend():
        coll = db.anonymous_evaluations
        sent_24h = await coll.count_documents({
            "email_delivery.ok": True,
            "email_delivery.sent_at": {"$gte": h24},
        })
        failed_24h = await coll.count_documents({
            "email_delivery.ok": False,
            "email_delivery.sent_at": {"$gte": h24},
        })
        # Recent 10 deliveries — including the error string so 403 sandbox
        # restrictions surface immediately in the dashboard.
        recent_raw = await coll.find(
            {"email_delivery": {"$exists": True}},
            {
                "_id": 0,
                "email": 1,
                "email_delivery": 1,
            },
        ).sort("email_delivery.sent_at", -1).limit(10).to_list(length=10)

        def _obfuscate(addr):
            if not addr or "@" not in addr:
                return addr
            local, dom = addr.split("@", 1)
            return f"{local[:2]}***@{dom}"

        recent = []
        for r in recent_raw:
            d = r.get("email_delivery") or {}
            recent.append({
                "to_masked": _obfuscate(r.get("email")),
                "ok": d.get("ok"),
                "email_id": d.get("email_id"),
                "error": (d.get("error") or "")[:200],
                "sent_at": d.get("sent_at"),
            })
        return {
            "sent_24h": sent_24h,
            "failed_24h": failed_24h,
            "recent": recent,
        }

    # Run all six panels in parallel. Each handler swallows its own
    # exceptions so one slow query can't take down the whole dashboard.
    services, anon_evals, cost, revenue, users, resend_delivery = await asyncio.gather(
        _services(),
        _anon_evals(),
        _cost(),
        _revenue(),
        _users(),
        _resend(),
        return_exceptions=False,
    )

    return {
        "generated_at": now.isoformat(),
        "services": services,
        "anon_evals": anon_evals,
        "cost": cost,
        "revenue": revenue,
        "users": users,
        "resend": resend_delivery,
    }


# ============ ADMIN: IMPORT LEGACY USERS ============
# One-shot tool for re-hydrating users we lost during the Emergent → Atlas
# move. Accepts a list of user docs in the legacy shape (the same JSON the
# Emergent MongoDB viewer dumps). Each doc is upserted by email so re-runs
# are safe — already-present users get their non-null legacy fields merged
# in, never overwritten with blanks.

@app.post("/api/admin/users/import")
async def admin_users_import(
    payload: dict = Body(...),
    admin_email: str = Query(...),
    learning_mode: str = Query("ielts", regex="^(ielts|general_english)$"),
    dry_run: bool = Query(False),
    _admin: dict = Depends(auth_session.require_admin),
):
    """Bulk-import legacy users. Body shape: {"users": [<legacy user doc>, ...]}.

    learning_mode query param tags every user in the batch with the
    correct V1/V2 product split (memory: project_v1_v2_product_split).
    """
    from security_utils import require_admin_email

    require_admin_email(admin_email)

    raw_users = payload.get("users")
    if not isinstance(raw_users, list) or not raw_users:
        raise HTTPException(status_code=400, detail="Body needs a non-empty 'users' array.")

    inserted = 0
    updated = 0
    skipped = 0
    errors = []
    samples = {"inserted": [], "updated": [], "skipped": []}

    for raw in raw_users:
        try:
            email = (raw.get("email") or "").strip().lower()
            if not email:
                errors.append({"index": raw_users.index(raw), "error": "missing email"})
                continue

            # Normalise created_at: Emergent dumps it as an ISO string but
            # the rest of the app stores it as a real BSON datetime so
            # downstream sorts/queries don't break.
            created_at_raw = raw.get("created_at")
            created_at_dt = None
            if isinstance(created_at_raw, str):
                try:
                    created_at_dt = datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))
                except ValueError:
                    created_at_dt = None
            elif isinstance(created_at_raw, datetime):
                created_at_dt = created_at_raw

            doc = {
                # Carry every legacy field forward so nothing silently
                # vanishes (test_history, examCredits, paypal_subscription_id, etc.)
                **raw,
                "email": email,
                "learning_mode": learning_mode,
                # Legacy users were active before the migration, so flip
                # the onboarding gate so they aren't asked again.
                "onboarding_complete": bool(raw.get("onboarding_complete", True)),
            }
            if created_at_dt is not None:
                doc["created_at"] = created_at_dt
            # imported_from_legacy_at is useful for the dashboard to
            # distinguish freshly-imported users from native signups.
            doc["imported_from_legacy_at"] = datetime.now(timezone.utc)

            existing = await db.users.find_one(
                {"email": email},
                {"_id": 0, "id": 1, "learning_mode": 1},
            )

            # Cross-product check: if this user already exists under a
            # *different* learning_mode, flag them as "both" instead of
            # overwriting. This catches the "Tina was in the GE batch
            # AND the IELTS batch" case Aga warned about — the old
            # platform had a single signup that fed both products.
            prior_mode = (existing or {}).get("learning_mode")
            if existing and prior_mode and prior_mode != "both" and prior_mode != learning_mode:
                doc["learning_mode"] = "both"

            if dry_run:
                if existing:
                    samples["skipped"].append(email)
                    skipped += 1
                else:
                    samples["inserted"].append(email)
                    inserted += 1
                continue

            if existing:
                # Update path: don't blow away the live user.id (used by
                # any persisted progress, payments, etc). Merge legacy
                # fields on top instead.
                doc.pop("id", None)
                await db.users.update_one({"email": email}, {"$set": doc})
                samples["updated"].append(email)
                updated += 1
            else:
                await db.users.insert_one(doc)
                samples["inserted"].append(email)
                inserted += 1
        except Exception as exc:
            errors.append({
                "email": (raw.get("email") if isinstance(raw, dict) else None),
                "error": str(exc)[:200],
            })

    return {
        "ok": True,
        "dry_run": dry_run,
        "learning_mode": learning_mode,
        "inserted": inserted,
        "updated": updated,
        "skipped": skipped,
        "errors": errors,
        "samples": {k: v[:5] for k, v in samples.items()},  # cap response size
    }


# ============ ADMIN: MIGRATE ENRICHED GE CONTENT ============
# Re-runs the enriched/*.json → unified_units + unified_lessons import.
# Idempotent (upsert by unit_id/lesson_id). Pre-launch audit allowlist gate.

@app.post("/api/admin/migrate/enriched")
async def admin_migrate_enriched(
    admin_email: str = Query(...),
    dry_run: bool = Query(False),
    _admin: dict = Depends(auth_session.require_admin),
):
    """One-shot migration of backend/content/enriched/*.json into the
    unified_units + unified_lessons collections. Use ?dry_run=true to
    preview without writing.
    """
    from security_utils import require_admin_email
    from scripts.migrate_enriched_to_unified import run_migration

    require_admin_email(admin_email)
    try:
        summary = await run_migration(db, dry_run=dry_run)
        return {"ok": True, "summary": summary}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        logger.exception("enriched migration failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Migration crashed: {exc}")


# ============ ADMIN: RESEED DATABASE ============

@app.post("/api/admin/reseed-tests")
async def reseed_tests(admin_email: str = Query(...), _admin: dict = Depends(auth_session.require_admin)):
    """Reseed tests collection with latest format (admin only).

    Pre-launch audit (2026-05-16) replaced the hardcoded "emergent2025reseed"
    admin_key with the standard email-allowlist gate used elsewhere. The old
    key was committed to git history; rotate via allowlist instead.
    """
    from security_utils import require_admin_email
    require_admin_email(admin_email)
    
    try:
        import uuid
        logger.info("🌱 Admin triggered reseed of tests...")
        
        # Clear existing tests
        await db.tests.delete_many({})
        
        # Reading Test 2 with summary_completion_block
        reading_test_2 = {
            "id": str(uuid.uuid4()),
            "title": "Academic Reading Practice Test 2",
            "test_type": "reading",
            "duration": 60,
            "passages": [
                {"id": 1, "title": "The Industrial Revolution in Britain", "text": "The Industrial Revolution, which took place from the 18th to 19th centuries, was a period during which predominantly agrarian, rural societies in Europe and America became industrial and urban..."},
                {"id": 2, "title": "Athletes and Stress", "text": "Professional athletes face unique psychological challenges that can significantly impact their performance..."},
                {"id": 3, "title": "An inquiry into the existence of the gifted child", "text": "The question of whether some children are born with exceptional intellectual abilities has long fascinated researchers..."}
            ],
            "questions": [
                # Passage 1 - Sentence Completion
                {"id": 1, "passage": 1, "type": "sentence_completion", "question": "The__(1)__ century saw the beginning of the Industrial Revolution."},
                {"id": 2, "passage": 1, "type": "sentence_completion", "question": "Before the revolution, most societies were__(2)__ and__(3)__."},
                {"id": 3, "passage": 1, "type": "sentence_completion", "question": "The revolution began in__(4)__."},
                {"id": 4, "passage": 1, "type": "true_false_notgiven", "question": "The Industrial Revolution only affected Europe."},
                {"id": 5, "passage": 1, "type": "true_false_notgiven", "question": "Rural societies became urban during this period."},
                {"id": 6, "passage": 1, "type": "true_false_notgiven", "question": "The revolution lasted for exactly 100 years."},
                {"id": 7, "passage": 1, "type": "true_false_notgiven", "question": "Agriculture was the main economic activity before the revolution."},
                {"id": 8, "passage": 1, "type": "multiple_choice", "question": "What was the main change during the Industrial Revolution?", "options": ["A) Agricultural to industrial", "B) Urban to rural", "C) Industrial to digital", "D) None of the above"]},
                {"id": 9, "passage": 1, "type": "multiple_choice", "question": "Where did the revolution primarily occur?", "options": ["A) Asia", "B) Europe and America", "C) Africa", "D) Australia"]},
                {"id": 10, "passage": 1, "type": "sentence_completion", "question": "The revolution transformed__(10)__ societies."},
                {"id": 11, "passage": 1, "type": "sentence_completion", "question": "People moved from__(11)__ to__(12)__ areas."},
                {"id": 12, "passage": 1, "type": "sentence_completion", "question": "New__(13)__ were developed during this time."},
                {"id": 13, "passage": 1, "type": "true_false_notgiven", "question": "The Industrial Revolution had no impact on society."},
                # Passage 2 - Matching Information
                {"id": 14, "passage": 2, "type": "matching_information", "question": "Which paragraph mentions the psychological impact on athletes?", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D"]},
                {"id": 15, "passage": 2, "type": "matching_information", "question": "Which paragraph discusses coping mechanisms?", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D"]},
                {"id": 16, "passage": 2, "type": "matching_information", "question": "Which paragraph talks about performance anxiety?", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D"]},
                {"id": 17, "passage": 2, "type": "matching_information", "question": "Which paragraph mentions professional support?", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D"]},
                {"id": 18, "passage": 2, "type": "true_false_notgiven", "question": "All athletes experience the same level of stress."},
                {"id": 19, "passage": 2, "type": "true_false_notgiven", "question": "Stress can negatively affect athletic performance."},
                {"id": 20, "passage": 2, "type": "true_false_notgiven", "question": "Professional athletes never need psychological help."},
                {"id": 21, "passage": 2, "type": "multiple_choice", "question": "What is the main topic of the passage?", "options": ["A) Physical training", "B) Psychological challenges", "C) Nutrition", "D) Equipment"]},
                {"id": 22, "passage": 2, "type": "multiple_choice", "question": "How do athletes typically cope with stress?", "options": ["A) Ignoring it", "B) Various coping mechanisms", "C) Quitting sports", "D) Medication only"]},
                {"id": 23, "passage": 2, "type": "sentence_completion", "question": "Athletes face__(23)__ challenges."},
                {"id": 24, "passage": 2, "type": "sentence_completion", "question": "Performance can be affected by__(24)__."},
                {"id": 25, "passage": 2, "type": "sentence_completion", "question": "Support from__(25)__ is important."},
                {"id": 26, "passage": 2, "type": "sentence_completion", "question": "Coping__(26)__ vary among athletes."},
                # Passage 3 - Summary Completion Block + Yes/No/NG + Multiple Choice
                {"id": "27-32", "passage": 3, "type": "summary_completion_block", 
                 "title": "Maryam Mirzakhani",
                 "summary_text": "Maryam Mirzakhani is regarded as **27** .................. in the field of mathematics because she was the only female holder of the prestigious Fields Medal – a record that she retained at the time of her death. However, maths held little **28** .................. for her as a child and in fact her performance was below average until she was **29** .................. by a difficult puzzle that one of her siblings showed her.\n\nLater, as a professional mathematician, she had an inquiring mind and proved herself to be **30** .................. when things did not go smoothly. She said she got the greatest **31** .................. from making ground-breaking discoveries and in fact she was responsible for some extremely **32** .................. mathematical studies.",
                 "blanks": [27, 28, 29, 30, 31, 32],
                 "options": ["A) appeal", "B) determined", "C) intrigued", "D) single", "E) achievement", "F) devoted", "G) involved", "H) unique", "I) innovative", "J) satisfaction", "K) intent"]},
                {"id": 33, "passage": 3, "type": "yes_no_notgiven", "question": "Many people who ended up winning prestigious intellectual prizes only reached an average standard when young."},
                {"id": 34, "passage": 3, "type": "yes_no_notgiven", "question": "Einstein's failures as a young man were due to his lack of confidence."},
                {"id": 35, "passage": 3, "type": "yes_no_notgiven", "question": "It is difficult to reach agreement on whether some children are actually born gifted."},
                {"id": 36, "passage": 3, "type": "yes_no_notgiven", "question": "Einstein was upset by the public's view of his life's work."},
                {"id": 37, "passage": 3, "type": "yes_no_notgiven", "question": "Einstein put his success down to the speed at which he dealt with scientific questions."},
                {"id": 38, "passage": 3, "type": "multiple_choice", "question": "What does Eyre believe is needed for children to equal 'gifted' standards?", "options": ["A) Natural talent", "B) Dedicated practice and support", "C) High IQ scores", "D) Early education"]},
                {"id": 39, "passage": 3, "type": "multiple_choice", "question": "What is the result of Ericsson's research?", "options": ["A) Talent is innate", "B) Practice makes perfect", "C) Genetics determine success", "D) Age is the key factor"]},
                {"id": 40, "passage": 3, "type": "multiple_choice", "question": "What is the main conclusion of the passage?", "options": ["A) Gifted children are born, not made", "B) The debate continues", "C) Environment is everything", "D) Testing is unreliable"]}
            ],
            "answer_key": [
                {"question_id": 1, "answer": "18th"},
                {"question_id": 27, "answer": "H"},
                {"question_id": 28, "answer": "A"},
                {"question_id": 29, "answer": "C"},
                {"question_id": 30, "answer": "B"},
                {"question_id": 31, "answer": "J"},
                {"question_id": 32, "answer": "I"}
            ]
        }
        
        await db.tests.insert_one(reading_test_2)
        logger.info("✅ Reading Test 2 with summary_completion_block seeded")
        
        return {"success": True, "message": "Tests reseeded with summary_completion_block format"}
    except Exception as e:
        logger.error(f"Reseed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def seed_reading_test_2_inline():
    """DEPRECATED - Use auto_sync.run_auto_sync() instead"""
    pass


@app.on_event("startup")
async def startup_event():
    """Seed vocab grammar lessons and beginner english lessons if they don't exist"""
    # Public essay-evaluation lead magnet — one-per-email uniqueness.
    # Safe to run on every startup (idempotent).
    try:
        await db.anonymous_evaluations.create_index("email", unique=True)
    except Exception as e:
        logger.warning(f"anonymous_evaluations index create failed: {e}")
    # Session tokens (audit F01/F03): fast unique lookup by hash + auto-expiry.
    try:
        await db.sessions.create_index("token_hash", unique=True)
        await db.sessions.create_index("expires_at")
    except Exception as e:
        logger.warning(f"sessions index create failed: {e}")
    # Writing evaluator idempotency cache — TTL + (scope, client_request_id)
    # unique. See services/writing_idempotency.py for rationale.
    try:
        from services import writing_idempotency
        await writing_idempotency.ensure_indexes(db)
    except Exception as e:
        logger.warning(f"writing_idempotency index create failed: {e}")
    try:
        # Seed beginner english lessons
        beginner_count = await db.beginner_english_lessons.count_documents({})
        if beginner_count == 0:
            logger.info("No beginner english lessons found, running seed...")
            import subprocess
            result = subprocess.run(["python", "seed_beginner_english.py"], cwd="/app/backend", capture_output=True, text=True)
            logger.info(f"Beginner seed output: {result.stdout}")
            if result.returncode != 0:
                logger.error(f"Beginner seed error: {result.stderr}")
        else:
            logger.info(f"Found {beginner_count} beginner english lessons in database")
        
        # Seed IELTS mastery course modules (Band 4.5-6.5) - FORCE RESEED on every startup
        mastery_count = await db.mastery_course_modules.count_documents({})
        logger.info(f"Found {mastery_count} mastery course modules, force reseeding...")
        from seed_mastery_course import MASTERY_MODULES
        await db.mastery_course_modules.delete_many({})
        if MASTERY_MODULES:
            await db.mastery_course_modules.insert_many(MASTERY_MODULES)
            logger.info(f"✅ Mastery course reseeded: {len(MASTERY_MODULES)} modules")
        
        # Seed Advanced IELTS mastery course modules (Band 6.0-9.0) - FORCE RESEED on every startup
        advanced_count = await db.advanced_mastery_modules.count_documents({})
        logger.info(f"Found {advanced_count} advanced mastery modules, force reseeding...")
        from seed_advanced_mastery import ADVANCED_MODULES
        await db.advanced_mastery_modules.delete_many({})
        if ADVANCED_MODULES:
            await db.advanced_mastery_modules.insert_many(ADVANCED_MODULES)
            logger.info(f"✅ Advanced mastery reseeded: {len(ADVANCED_MODULES)} modules")
        
        # ========== FULL DATABASE SYNC - HER STARTUP'TA TÜM VERİYİ SENKRONIZE ET ==========
        try:
            from full_sync import full_database_sync
            await full_database_sync(db)
        except Exception as e:
            logger.error(f"FULL SYNC FAILED: {e}")
            # Fallback: En azından kritik verileri sync et
            import subprocess
            subprocess.run(["python", "seed_data.py"], cwd="/app/backend", timeout=300)
        
        # Seed learning platform levels if not present
        learning_levels_count = await db.learning_levels.count_documents({})
        if learning_levels_count == 0:
            logger.info("No learning levels found, running seed...")
            import subprocess
            result = subprocess.run(["python", "seed_learning_platform.py"], cwd="/app/backend", capture_output=True, text=True)
            logger.info(f"Learning platform seed output: {result.stdout}")
            if result.returncode != 0:
                logger.error(f"Learning platform seed error: {result.stderr}")
            # Also add A2 level
            await seed_a2_level()
        else:
            logger.info(f"Found {learning_levels_count} learning levels in database")
            # Check if A2 exists, add if missing
            a2_exists = await db.learning_levels.find_one({"id": "level_a2"})
            if not a2_exists:
                logger.info("A2 level missing, adding...")
                await seed_a2_level()
        
        # ============ AUTO-SEED COURSES ON STARTUP ============
        await auto_seed_courses()
        
        # ============ AUTO-SEED UNIFIED LEARNING ON STARTUP ============
        await auto_seed_unified_learning()
            
    except Exception as e:
        logger.error(f"Startup seed error: {e}")


async def auto_seed_courses():
    """Automatically seed all course data if missing on startup"""
    try:
        logger.info("🔄 Checking course data...")
        
        # Check and seed Advanced Mastery (should be 20 modules)
        advanced_count = await db.advanced_mastery_modules.count_documents({})
        if advanced_count < 20:
            logger.info(f"⚠️ Advanced Mastery has {advanced_count} modules, expected 20. Seeding...")
            try:
                from seed_advanced_mastery import ADVANCED_MODULES
                await db.advanced_mastery_modules.delete_many({})
                for module in ADVANCED_MODULES:
                    await db.advanced_mastery_modules.update_one(
                        {"id": module["id"]}, {"$set": module}, upsert=True
                    )
                new_count = await db.advanced_mastery_modules.count_documents({})
                logger.info(f"✅ Advanced Mastery seeded: {new_count} modules")
            except Exception as e:
                logger.error(f"❌ Advanced Mastery seed error: {e}")
        else:
            logger.info(f"✅ Advanced Mastery OK: {advanced_count} modules")
        
        # Check and seed Mastery (should be 17 modules)
        mastery_count = await db.mastery_course_modules.count_documents({})
        if mastery_count < 17:
            logger.info(f"⚠️ Mastery has {mastery_count} modules, expected 17. Seeding...")
            try:
                from seed_mastery_course import MASTERY_MODULES
                await db.mastery_course_modules.delete_many({})
                for module in MASTERY_MODULES:
                    await db.mastery_course_modules.update_one(
                        {"id": module["id"]}, {"$set": module}, upsert=True
                    )
                new_count = await db.mastery_course_modules.count_documents({})
                logger.info(f"✅ Mastery seeded: {new_count} modules")
            except Exception as e:
                logger.error(f"❌ Mastery seed error: {e}")
        else:
            logger.info(f"✅ Mastery OK: {mastery_count} modules")
        
        # Check and seed Beginner WITH LISTENING (should be 14 lessons)
        beginner_count = await db.beginner_english_lessons.count_documents({})
        beginner_with_listening = await db.beginner_english_lessons.count_documents({"listening": {"$exists": True, "$ne": None}})
        
        if beginner_count < 14 or beginner_with_listening < 14:
            logger.info(f"⚠️ Beginner has {beginner_count} lessons ({beginner_with_listening} with listening), expected 14. Seeding...")
            try:
                from seed_beginner_english import BEGINNER_LESSONS
                await db.beginner_english_lessons.delete_many({})
                for lesson in BEGINNER_LESSONS:
                    await db.beginner_english_lessons.update_one(
                        {"id": lesson["id"]}, {"$set": lesson}, upsert=True
                    )
                new_count = await db.beginner_english_lessons.count_documents({})
                new_listening = await db.beginner_english_lessons.count_documents({"listening": {"$exists": True, "$ne": None}})
                logger.info(f"✅ Beginner seeded: {new_count} lessons ({new_listening} with listening)")
            except Exception as e:
                logger.error(f"❌ Beginner seed error: {e}")
        else:
            logger.info(f"✅ Beginner OK: {beginner_count} lessons ({beginner_with_listening} with listening)")
        
        logger.info("🎉 Course data check complete!")
        
    except Exception as e:
        logger.error(f"Auto-seed courses error: {e}")


async def auto_seed_unified_learning():
    """Auto-seed unified learning stages and content from JSON files on startup"""
    try:
        # Ensure admin accounts have full access
        from security_utils import DEFAULT_ADMIN_EMAILS
        for admin_email in DEFAULT_ADMIN_EMAILS:
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"plan": "master", "examCredits": 25, "verified": True, "email_verified": True}},
            )
        logger.info(f"✅ Admin accounts ensured: master plan + 25 credits")
        
        stages_count = await db.unified_stages.count_documents({})
        lessons_count = await db.unified_lessons.count_documents({})
        units_count = await db.unified_units.count_documents({})
        
        logger.info(f"🔄 Unified Learning: {stages_count} stages, {units_count} units, {lessons_count} lessons")
        
        # Seed stages metadata if missing
        if stages_count < 8:
            logger.info("⚠️ Stages missing, seeding all 8 stages...")
            from seed_unified_learning import ALL_STAGES
            for stage_data in ALL_STAGES:
                await db.unified_stages.update_one(
                    {"stage_id": stage_data["stage_id"]},
                    {"$set": stage_data},
                    upsert=True
                )
            new_count = await db.unified_stages.count_documents({})
            logger.info(f"✅ Seeded {new_count} stages")
        
        # Count content JSON files available
        import glob
        from pathlib import Path as _Path
        # Resolve relative to this file (backend/server.py) — works on both
        # Railway (service root = backend/) and local dev.
        content_dir = str(_Path(__file__).resolve().parent / "content")
        content_files = glob.glob(f"{content_dir}/stage*_unit*.json")
        expected_units = len(content_files)
        
        if expected_units > 0 and units_count < expected_units:
            logger.info(f"⚠️ Units ({units_count}) < expected ({expected_units}). Seeding content from JSON files...")
            from seed_content_v4 import seed_from_content
            await seed_from_content(target_db=db)
            final_units = await db.unified_units.count_documents({})
            final_lessons = await db.unified_lessons.count_documents({})
            logger.info(f"✅ Unified Learning seeded: {final_units} units, {final_lessons} lessons")
        else:
            logger.info(f"✅ Unified Learning OK: {units_count} units, {lessons_count} lessons")
        
        # Check if enriched content needs to be merged
        enriched_dir = f"{content_dir}/enriched"
        enriched_files = glob.glob(f"{enriched_dir}/stage*_unit*_enriched.json")
        if enriched_files:
            # Check if any lesson is missing the enrichment context field
            not_enriched = await db.unified_lessons.count_documents({"context": {"$exists": False}})
            needs_enrich = await db.unified_lessons.count_documents({"$or": [
                {"context": {"$exists": False}},
                {"context.enriched": {"$ne": True}}
            ]})
            if needs_enrich > 0:
                logger.info(f"⚠️ {needs_enrich} lessons not yet enriched. Running merge...")
                from routes.content_enrichment import merge_and_seed_content
                result = await merge_and_seed_content(stage="all")
                logger.info(f"✅ Merge complete: {result.get('message', 'done')}")
            else:
                logger.info(f"✅ All lessons already merged with enriched content")

            # Stage 3 (Movers) iterates quickly during launch; force-merge
            # Stage 3 on every boot so the live DB reflects the latest
            # enriched JSON. Once Stage 3 stabilises (~Unit 20 shipped) this
            # can drop back to needs_enrich-only.
            try:
                stage3_files = glob.glob(f"{enriched_dir}/stage3_unit*_enriched.json")
                if stage3_files:
                    from routes.content_enrichment import merge_and_seed_content
                    logger.info(f"⟳ Force-merging Stage 3 ({len(stage3_files)} files) on boot...")
                    result3 = await merge_and_seed_content(stage="stage3")
                    logger.info(f"✅ Stage 3 force-merge: {result3.get('message', 'done')}")
            except Exception as e3:
                logger.warning(f"Stage 3 force-merge failed (non-fatal): {e3}")
        
        # Always restore image mappings after seed/merge to ensure images are preserved
        await _restore_vocab_image_mappings()
        
    except Exception as e:
        logger.error(f"Auto-seed unified learning error: {e}")
        import traceback
        traceback.print_exc()


async def _restore_vocab_image_mappings():
    """Restore image_urls and enrichment data from mapping files"""
    import json as _json
    mapping_dir = "/app/tools"
    img_map_path = f"{mapping_dir}/image_mapping.json"
    gpt_map_path = f"{mapping_dir}/gpt_image_mapping.json"
    enrich_path = f"{mapping_dir}/vocab_enrichment.json"
    
    if not os.path.exists(img_map_path):
        return
    
    with open(img_map_path) as f:
        img_map = _json.load(f)
    gpt_map = {}
    if os.path.exists(gpt_map_path):
        with open(gpt_map_path) as f:
            gpt_map = _json.load(f)
    enrich = {}
    if os.path.exists(enrich_path):
        with open(enrich_path) as f:
            enrich = _json.load(f)
    
    all_images = {**img_map, **gpt_map}
    
    # Check if restoration is needed
    sample = await db.unified_lessons.find_one(
        {"activity_flow.type": "vocabulary", "activity_flow.data.words.image_url": {"$exists": True, "$ne": ""}},
        {"_id": 1}
    )
    if sample:
        logger.info("✅ Vocab images already present in DB")
        return
    
    updated = 0
    async for lesson_doc in db.unified_lessons.find({}, {"_id": 1, "activity_flow": 1}):
        af = lesson_doc.get("activity_flow", [])
        changed = False
        for act in af:
            if act.get("type") == "vocabulary" and act.get("data", {}).get("words"):
                for w in act["data"]["words"]:
                    word = w.get("word", "").lower().strip()
                    if not word:
                        continue
                    if not w.get("image_url", "").strip() and word in all_images:
                        w["image_url"] = all_images[word]
                        changed = True
                    if not w.get("definition", "").strip() and word in enrich and enrich[word].get("definition"):
                        w["definition"] = enrich[word]["definition"]
                        changed = True
                    if not w.get("example", "").strip() and word in enrich and enrich[word].get("example"):
                        w["example"] = enrich[word]["example"]
                        changed = True
        if changed:
            await db.unified_lessons.update_one({"_id": lesson_doc["_id"]}, {"$set": {"activity_flow": af}})
            updated += 1
    
    if updated > 0:
        logger.info(f"✅ Restored vocab images/enrichment for {updated} lessons")
    else:
        logger.info("✅ No vocab restoration needed")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()