from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

from services.openai_compat import OpenAISpeechToText

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


try:
    from routes import admin_ops, dashboard_summary, feedback, user_progress
    for _mod in (user_progress, dashboard_summary, feedback, admin_ops):
        _mod.set_db(db)
    api_router.include_router(user_progress.router)
    api_router.include_router(dashboard_summary.router)
    # feedback + admin_ops carry explicit /api-prefixed paths (legacy @app routes)
    app.include_router(feedback.router)
    app.include_router(admin_ops.router)
    print("✅ Progress/dashboard/feedback/admin-ops routes loaded")
except Exception as e:
    print(f"⚠️  Could not load progress/dashboard/feedback/admin-ops routes: {e}")
    import traceback
    traceback.print_exc()


# ============ Models ============

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

# ---------------------------------------------------------------------------
# App-level wiring — MUST stay at the very end of this module: api_router is
# included only after every route above has registered on it.
# ---------------------------------------------------------------------------

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

# ---------------------------------------------------------------------------
# Startup/shutdown — index creation + auto-seed pipeline live in bootstrap.py
# ---------------------------------------------------------------------------
import bootstrap as _bootstrap
_bootstrap.install(app, db, client)
