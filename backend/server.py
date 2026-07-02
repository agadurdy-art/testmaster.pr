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
from services.evaluation_quota import claim_evaluation_quota, rollback_evaluation_claim

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# persist_attempt/TestAttempt live in services/attempt_store (Faz 1 refactor);
# re-exported here because 14 route modules do `from server import persist_attempt`.
from services import attempt_store as _attempt_store
_attempt_store.set_db(db)
persist_attempt = _attempt_store.persist_attempt
TestAttempt = _attempt_store.TestAttempt

# PayPal configuration (Smart Buttons + Orders API)
# PayPal env vars -> Moved to routes/payments.py

# Facebook Login configuration
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")

# Initialize OpenAI Speech-to-Text
stt = OpenAISpeechToText(api_key=os.getenv("OPENAI_API_KEY") or os.getenv("EMERGENT_LLM_KEY"))

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

# Speaking misc routes — simple Whisper transcription + static question bank.
# Moved out of server.py inline endpoints (2026-07-02 refactor). The router
# declares full /api/... paths itself (no prefix), so the public paths stay
# exactly /api/transcribe-audio and /api/speaking/questions/{part}.
try:
    from routes.speaking_misc import (
        router as speaking_misc_router,
        set_db as set_speaking_misc_db,
        set_stt as set_speaking_misc_stt,
    )
    set_speaking_misc_db(db)
    set_speaking_misc_stt(stt)
    app.include_router(speaking_misc_router)
    print("✅ Speaking misc routes loaded")
except Exception as e:
    print(f"⚠️  Could not load speaking misc routes: {e}")
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
    import routes.cambridge_speaking as cambridge_speaking_module
    cambridge_speaking_module.set_db(db)
    app.include_router(cambridge_speaking_module.router)
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



# --- Faz 1 refactor (2026-07-02): leaf domains extracted from this file ---
# Each module owns exactly one job; they mount onto api_router so paths are
# byte-identical to the pre-refactor /api/* routes.
try:
    from routes import notes_highlights, skill_analytics, speech_tts, tips_courses, user_completions
    for _mod in (notes_highlights, skill_analytics, tips_courses, user_completions):
        _mod.set_db(db)
    for _mod in (notes_highlights, skill_analytics, speech_tts, tips_courses, user_completions):
        api_router.include_router(_mod.router)
    print("✅ Leaf domain routes loaded (notes/analytics/tts/tips/completions)")
except Exception as e:
    print(f"⚠️  Could not load leaf domain routes: {e}")
    import traceback
    traceback.print_exc()


try:
    from routes import level_test
    level_test.set_db(db)
    api_router.include_router(level_test.router)
    print("✅ Level-test routes loaded (reading/adaptive/speaking/listening/writing/recommendations)")
except Exception as e:
    print(f"⚠️  Could not load level-test routes: {e}")
    import traceback
    traceback.print_exc()


try:
    from routes import writing_eval
    writing_eval.set_db(db)
    api_router.include_router(writing_eval.router)
    print("✅ Writing-eval routes loaded (v2 + public essay + rating)")
except Exception as e:
    print(f"⚠️  Could not load writing-eval routes: {e}")
    import traceback
    traceback.print_exc()


try:
    from routes import legacy_courses, writing_analysis
    from routes import ge as ge_routes
    legacy_courses.set_db(db)
    ge_routes.set_db(db)
    api_router.include_router(legacy_courses.router)
    api_router.include_router(ge_routes.router)
    api_router.include_router(writing_analysis.router)
    print("✅ Legacy course + GE + writing-analysis routes loaded")
except Exception as e:
    print(f"⚠️  Could not load legacy course routes: {e}")
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

# ================== Payments, Plans, Admin -> Moved to routes/payments.py, routes/admin.py ==================

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


# ---------------------------------------------------------------------------
# App-level wiring — keep LAST among route definitions: api_router must be
# included only after every @api_router route above has registered.
# ---------------------------------------------------------------------------

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