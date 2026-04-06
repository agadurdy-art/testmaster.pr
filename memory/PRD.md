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
- Games: Crossword (rewritten), Word Search (drag-select), and others
- Admin Panel at /admin with Vocabulary Image Manager and User Management
- Auto-seeding system (idempotent, preserves data)
- Data persistence via source JSON files
- 5-Stage Grammar Practice Engine (Learn, Practice, Quiz, Guided & Free Production)
- Smart Review System for grammar weak areas
- Interactive Vocabulary Engine (Learn, Practice, Quiz, Production) for all 3 courses
- Global ErrorBoundary + activity-level error boundaries
- Centralized audio management (prevent loops/leaking)

### Completed (April 6, 2026)
- **P0: Beginner Course Vocabulary Engine Fix:**
  - Seeded 14 beginner lessons into `beginner_english_lessons` collection
  - Fixed slides endpoint: guarded `word_formation` with `isinstance(vocab, dict)` check
  - Fixed practice endpoint: added `return` statement in beginner block (was falling through to advanced logic)
  - Normalized exercise schema: uses `answer`/`id`/`instruction` keys (frontend-compatible)
  - Fixed all 4 vocabulary mode components: smart `backPath` navigation (beginner→/beginner-course, mastery→/mastery-course, advanced→/advanced-mastery)
  - Fixed VocabularyProductionMode word filter: `s.word && s.meaning` instead of `s.category === 'Advanced Term'`
  - All 42 endpoints (14 lessons × 3 stages) return 200 OK

- **Security Hardening (PR #2 Applied):**
  - **Bcrypt Password Hashing:** Replaced SHA-256 with bcrypt. Added login-time migration (SHA-256 → bcrypt on successful login). Both hash types supported via `verify_password()`
  - **Direct-Reset Removed:** `/auth/direct-reset` endpoint deleted (insecure - no email verification)
  - **CORS Tightened:** `allow_origins` now filters empty strings; falls back to `["*"]` only if `CORS_ORIGINS` env is unset
  - **Upload Validation:** `validate_upload_filename()` in security_utils - only .jpg/.jpeg/.png/.pdf allowed
  - **AI Input Sanitization:** `sanitize_ai_input()` strips prompt injection patterns from user text before LLM calls
  - **Band Score Clamping:** `clamp_band_scores()` ensures all IELTS scores stay within 1.0-9.0 range
  - **Level-Test Answer Keys Server-Side:** Reading questions served WITHOUT `correct` field. Server-side evaluation at `/comprehensive-level-test/evaluate-reading`
  - **Atomic Speaking Session:** Free trial allocation uses atomic `update_one` with condition to prevent race conditions
  - **Centralized Admin Validation:** `security_utils.py` with `require_admin_email()` used across all admin routes
  - **User Model:** `password_hash` excluded from API responses via `Field(exclude=True)`
  - Tests: 15/15 passed

### Previously Completed
- 100% vocabulary image coverage (617/617 words)
- White Screen crash fix (ErrorBoundary + null guards on 14+ game components)
- Mastery Course Vocabulary Engine integration
- Word Search drag-select rewrite
- Crossword direction fix
- Audio loop fix
- Mastery Course listening topic mismatch fix
- Word Order grammar game bug fix
- Grammar Engine for Mastery & Advanced courses
- ElevenLabs audio for Module 13

## Prioritized Backlog

### P1 - Upcoming
1. **"Liz" Bilingual Lesson Teacher:** AI tutor explains lesson topic in user's language
2. **"Map Generator" Status Report:** Inform user - no existing feature found
3. **Vocabulary Word Completion Bug:** Regression test pending

### P2 - Future
- Generate ElevenLabs Audio for All Mastery Modules
- Automatic Visual Generation Pipeline for new lessons
- Bank Transfer Expiry Reminders
- "Daily Habit" Spaced Repetition System (SRS)
- "Booster Mode" for remedial lessons
- Teacher Control Panel
- Investigate user database

## Key Files
- `/app/backend/server.py` - Core backend
- `/app/backend/security_utils.py` - Security utilities (admin validation, upload validation, AI sanitization, band clamping, PayPal webhook verification)
- `/app/backend/level_test_reading_data.py` - Server-side reading question data with answer keys
- `/app/backend/routes/grammar_engine.py` - Grammar Practice Engine
- `/app/frontend/src/pages/Vocabulary*Mode.js` - Vocabulary engine (4 pages)
- `/app/frontend/src/pages/Grammar*Mode.js` - Grammar engine (4 pages)
- `/app/frontend/src/pages/LevelTest.js` - Level test (questions loaded from API)
- `/app/frontend/src/pages/ComprehensiveLevelTest.js` - Comprehensive level test (questions from API)

## Admin Accounts
- aga.durdy@gmail.com
- admin@ieltsace.com
- stemhousebenluc@gmail.com

## Critical Notes
- DATA PERSISTENCE: All content changes must be written to enriched JSON source files, not just DB
- User communicates in Turkish
- DB_NAME = ielts_database
- Passwords: bcrypt preferred, SHA-256 legacy supported with auto-migration
- Level test answer keys are SERVER-SIDE only (never sent to frontend)
