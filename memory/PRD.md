# IELTS Ace - AI-Powered English Learning Platform

## Original Problem Statement
A full-stack English learning platform (IELTS focused) with React frontend, FastAPI backend, and MongoDB. The platform provides structured learning stages with vocabulary, grammar, games, and AI-powered features.

## Architecture
- **Frontend:** React (port 3000)
- **Backend:** FastAPI (port 8001)
- **Database:** MongoDB (ielts_database)
- **Key Integrations:** PayPal, Claude Sonnet 4.5, OpenAI GPT Image 1, ElevenLabs, Whisper

## What's Been Implemented

### Core Features
- Multi-stage learning platform (8 stages, 24 units, 96 lessons)
- Vocabulary with images, definitions, examples
- Games: Crossword, Word Search (drag-select), and others
- Admin Panel at /admin with Vocabulary Image Manager and User Management
- Auto-seeding system (idempotent, preserves data)
- 5-Stage Grammar Practice Engine (Learn, Practice, Quiz, Guided & Free Production)
- Smart Review System for grammar weak areas
- Interactive Vocabulary Engine (Learn, Practice, Quiz, Production) for all 3 courses
- Global ErrorBoundary + activity-level error boundaries
- Centralized audio management

### Completed (April 10, 2026) — Deploy Readiness Pass + Refactoring
- **Plan System Normalization:** Legacy aliases (starter→learner, booster→achiever, pro→master), `normalize_plan_name()`, frontend helpers (planAccess.js, lizAccess.js, recommendationRouting.js)
- **Liz Teacher Hardening:** Plan-based access (403 for free), monthly usage tracking, gpt-4o-mini default, Azure pronunciation, `/status` endpoint
- **Grammar Engine Validation:** PLACEHOLDER_PATTERNS, `_validate_*` functions, cache validation
- **Cambridge Test Diagnostics:** `build_root_cause_analysis()`, `build_study_plan()` in full-test evaluation
- **Writing Task 1 Curated Visuals:** 5 process + 5 map static images with IELTS descriptions
- **Lesson Registry Enhanced:** STAGE_META, context-aware recommendations, lesson path builder
- **Emily Teacher Removed** — only Liz remains
- **server.py Refactoring (7968→6261 lines, -21%):**
  - `routes/auth.py` — register, login, verify-email, forgot/reset-password, Google/Facebook OAuth
  - `routes/admin.py` — user CRUD, course seeding, DB status, vocabulary image management
  - `routes/payments.py` — PayPal orders/subscriptions, Ko-fi IPN, bank upload, manual credits, plan info, speaking credits

### Previously Completed
- Security Hardening: bcrypt, server-side level test, upload validation, CORS, admin protection
- Beginner Course Vocabulary Engine Fix
- 100% vocabulary image coverage (617/617 words)
- White Screen crash fix
- Mastery Course Vocabulary Engine
- Word Search, Crossword fixes
- ElevenLabs audio for Module 13

## Prioritized Backlog

### P0
1. Grammar Practice Engine (Plan B) for Beginner course
2. Vocabulary Word Completion Bug regression test

### P1
3. "Map Generator" Status Report — inform user no existing feature found
4. "Liz" Bilingual Lesson Teacher — AI explains topic in user's language

### P2
- ElevenLabs Audio for All Mastery Modules
- Automatic Visual Generation Pipeline
- Bank Transfer Expiry Reminders
- "Daily Habit" SRS
- "Booster Mode" for remedial lessons
- Teacher Control Panel
- User database investigation

## Key Files
- `/app/backend/server.py` - Core backend (~6260 lines, refactored)
- `/app/backend/routes/auth.py` - Auth routes (modular)
- `/app/backend/routes/admin.py` - Admin routes (modular)
- `/app/backend/routes/payments.py` - Payment routes (modular)
- `/app/backend/plan_access.py` - Plan tiers, features, legacy aliases
- `/app/backend/security_utils.py` - Security utilities
- `/app/backend/routes/liz_teacher.py` - Liz AI Teacher
- `/app/backend/routes/grammar_engine.py` - Grammar Engine with validation
- `/app/backend/routes/cambridge.py` - Cambridge tests with diagnostics
- `/app/backend/routes/question_bank.py` - QB with curated visual bank
- `/app/backend/services/lesson_registry.py` - Enhanced lesson recommendations
- `/app/frontend/src/lib/planAccess.js` - Frontend plan tier helpers
- `/app/frontend/src/lib/lizAccess.js` - Liz access control
- `/app/frontend/src/lib/recommendationRouting.js` - Lesson path builder

## Admin Accounts
- aga.durdy@gmail.com
- admin@ieltsace.com
- stemhousebenluc@gmail.com

## Critical Notes
- User communicates in Turkish
- DB_NAME = ielts_database
- Passwords: bcrypt preferred, SHA-256 legacy auto-migrated
- Level test answer keys are SERVER-SIDE only
- Plan normalization: starter→learner, booster→achiever, pro→master
- Liz Teacher: gpt-4o-mini default, gpt-4o for deep tasks
- Emily Teacher REMOVED
- Grammar cache validates content before returning
- Process/Map visuals use curated static bank
- password_hash excluded from all API responses via Pydantic Field(exclude=True)

---

## Session log: 2026-04-19 — Emergent pull `feat/ielts-ace-pre-deploy-2026-04-19`

**Action**: Pulled branch from `agadurdy-art/testmaster.pr` into `/app` per `EMERGENT_HANDOFF_2026-04-19.md`. Existing `.env` files were overwritten with user-provided production values (listed variables below). `REACT_APP_BACKEND_URL` was re-pointed to this dev pod's preview URL so frontend can reach local backend for testing (must be reverted to prod URL before deploy).

**Env files (canonical values supplied by Aga)**:
- Backend: MONGO_URL, DB_NAME=ielts_database, CORS_ORIGINS=*, EMERGENT_LLM_KEY, RESEND (API + from), FRONTEND_BASE_URL=https://prod-security-flows..., PAYPAL_* (live), KOFI_VERIFICATION_TOKEN, FACEBOOK_APP_ID/SECRET, AZURE_SPEECH_KEY/REGION (southeastasia), ELEVENLABS_API_KEY.
- Frontend: REACT_APP_BACKEND_URL (dev pod for now; flip to prod-security-flows for deploy), WDS_SOCKET_PORT=443, REACT_APP_ENABLE_VISUAL_EDITS=false, ENABLE_HEALTH_CHECK=false, REACT_APP_PAYPAL_CLIENT_ID, REACT_APP_FACEBOOK_APP_ID.

**Services**: backend + frontend restarted via supervisor, both RUNNING. MongoDB auto-seeded 8 stages, 24 units, 96 lessons, admin accounts, Beginner course.

**Smoke check results** (all 200 / 403 as expected):
- GET /api/testimonials → `{"testimonials": []}`
- POST /api/testimonials → creates pending row, returns `{ok, id, status:"pending"}`
- GET /api/admin/testimonials (no header) → 403 `Admin access required`
- GET /api/admin/testimonials (x-admin-email: admin@ieltsace.com) → returns pending row
- GET /api/admin/liz-analytics → stats payload
- GET /api/admin/onboarding-analytics → funnel + path distribution
- GET /api/admin/learning-mode-stats → breakdown + flat
- Frontend `/`, `/share-your-story`, `/admin` → HTTP 200

**Notes**:
- Dev-mode overlay shows two ESLint `react-hooks/exhaustive-deps` "rule definition not found" warnings on `OnboardingQuiz.jsx:30` and `SpeakingPractice.jsx:36`. Non-blocking for runtime; revisit before prod build if CRA treats them as errors.
- Pre-existing `motor` ModuleNotFoundError from subprocess-run `seed_learning_platform.py` on startup (it still seeds via the in-process path). Unchanged from prior sessions, not introduced by this pull.

**Deferred (per handoff §7)**: P1.11 course-embedded evaluator upgrade, FAZ 7 GE.1–GE.6, seed 3–5 approved testimonials, mobile QA, band accuracy regression.

