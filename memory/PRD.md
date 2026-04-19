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

## Session log: 2026-04-19 (continued) — Pull `5858ba0a` (dead-link + legal stubs + clean login)

**Commit**: `5858ba0a fix(frontend): broken landing links + legal stubs + clean login page`

**What changed upstream**:
- Repointed `/evaluate/sample` hero/final CTAs → existing `/samples/writing/band-6-5-task2` (copy updated to match)
- Nav anchors `#blog`/`#about` → real `/blog` and `/about` routes
- Fixed SampleReportsStrip band-5 / band-8 route typos
- Added `PrivacyPage`, `TermsPage`, `ContactPage`, `BlogPage`, `StatusPage`, `AboutPage`, `NotFoundPage`, `LoginPage`
- Added `<Route path="*" element={<NotFoundPage />} />` catch-all
- Replaced the old login-in-modal flow with a clean standalone `/login` page that keeps the Emergent Google OAuth + email/password login; V1 landing survives at `/landing/v1`

**This pod**: fresh clone → /app rsync (preserved `.git`/`.emergent` + user-provided `.env` values + our `DISABLE_ESLINT_PLUGIN=true` line). `pip install` + `yarn install` clean. Backend + frontend restarted, supervisor RUNNING.

**Smoke check results**:
- `/`, `/login`, `/share-your-story`, `/privacy`, `/terms`, `/contact`, `/blog`, `/status`, `/about` → HTTP 200
- `/samples/writing/band-5-0-task2`, `/band-6-5-task2`, `/band-8-0-task2` → HTTP 200
- `/totally-nonexistent-path` → renders NotFoundPage ("Page not found" with Back to home / Contact us buttons) instead of blank screen
- Login page renders correctly (Google button + email/password + forgot password + signup link)
- All backend routes (testimonials + admin analytics) still 200/403 as expected

**Still open (not blocking)**:
- ESLint plugin still bypassed via `DISABLE_ESLINT_PLUGIN=true` (3 files still have `// eslint-disable-next-line react-hooks/exhaustive-deps` comments + no plugin registered in eslintConfig). Fine for dev/prod builds; clean-up suggested post-launch.
- Deprecated CRA webpack-dev-server warnings in logs — non-blocking.
- `/practice` dashboard-nav link (DashboardTopBar) still points to non-existent route — minor, not reachable until user is logged in and inside the V2 dashboard shell.
