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

### Completed (April 10, 2026) — Deploy Readiness Pass
- **Plan System Normalization:**
  - Legacy plan aliases: starter→learner, booster→achiever, pro→master
  - `normalize_plan_name()` and `get_plan_label()` added to plan_access.py
  - Frontend helpers: `planAccess.js`, `lizAccess.js`, `recommendationRouting.js`
  - Active hierarchy: free < explorer < learner < achiever < master

- **Liz Teacher Hardening:**
  - Plan-based access control (`ensure_liz_access`, 403 for free users)
  - Monthly usage tracking (`get_liz_usage_stats`)
  - Model cost optimization: gpt-4o-mini default, gpt-4o for deep tasks
  - Azure pronunciation integration for voice turns
  - `/api/liz/status/{user_id}` endpoint added
  - Emily Teacher removed (single teacher surface: Liz)

- **Grammar Engine Validation Layer:**
  - `PLACEHOLDER_PATTERNS` + `_is_meaningful_text()` for content validation
  - `_validate_learn_payload`, `_validate_practice_payload`, `_validate_quiz_payload`, `_validate_prompt_payload`
  - Cache reads now validate before returning (reject bogus cached content)

- **Cambridge Test Diagnostics:**
  - `build_root_cause_analysis()` — categorizes wrong answers by pattern (spelling, distractor, near-miss, unanswered)
  - `build_study_plan()` — prescriptive roadmap with target band, 3-day plan, retest strategy
  - Both included in `/api/cambridge/evaluate/full-test` response

- **Writing Task 1 Curated Visuals:**
  - Process and Map types now use static curated image bank instead of generated SVG
  - 5 process visuals + 5 map visuals with authentic IELTS task descriptions
  - `image_url` field added to generate-authentic response

- **Lesson Registry Enhanced:**
  - `STAGE_META` with course_name, course_path, label for each stage
  - `_build_recommendation()` with full lesson path, unit label, reason, context matching
  - `_build_lesson_path()` for course-driven URL generation
  - Context-aware search terms for better recommendation relevance

### Completed (April 6, 2026)
- **Beginner Course Vocabulary Engine Fix**
- **Security Hardening (PR #2):** bcrypt, server-side level test, upload validation, CORS, admin protection

### Previously Completed
- 100% vocabulary image coverage (617/617 words)
- White Screen crash fix (ErrorBoundary + null guards)
- Mastery Course Vocabulary Engine integration
- Word Search drag-select rewrite
- Crossword direction fix, Audio loop fix
- Grammar Engine for Mastery & Advanced courses
- ElevenLabs audio for Module 13

## Prioritized Backlog

### P0 - Next
1. **Grammar Practice Engine (Plan B):** 4-stage grammar engine for Beginner course
2. **Vocabulary Word Completion Bug:** Regression test pending

### P1 - Upcoming
3. **"Map Generator" Status Report:** Inform user - no existing feature found
4. **"Liz" Bilingual Lesson Teacher:** AI tutor explains lesson topic in user's language

### P2 - Future
- Generate ElevenLabs Audio for All Mastery Modules
- Automatic Visual Generation Pipeline
- Bank Transfer Expiry Reminders
- "Daily Habit" Spaced Repetition System (SRS)
- "Booster Mode" for remedial lessons
- Teacher Control Panel
- Investigate user database

## Key Files
- `/app/backend/server.py` - Core backend (~8000 lines)
- `/app/backend/plan_access.py` - Plan tiers, features, legacy aliases, normalization
- `/app/backend/security_utils.py` - Security utilities
- `/app/backend/level_test_reading_data.py` - Server-side answer keys
- `/app/backend/routes/liz_teacher.py` - Liz AI Teacher (plan-gated, model-optimized)
- `/app/backend/routes/grammar_engine.py` - Grammar Engine with validation layer
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
- DATA PERSISTENCE: All content changes must be written to enriched JSON source files
- User communicates in Turkish
- DB_NAME = ielts_database
- Passwords: bcrypt preferred, SHA-256 legacy supported with auto-migration
- Level test answer keys are SERVER-SIDE only
- Plan normalization: starter→learner, booster→achiever, pro→master
- Liz Teacher: gpt-4o-mini default, gpt-4o for deep tasks only
- Emily Teacher REMOVED — only Liz remains
- Grammar cache validates content before returning (rejects placeholders)
- Process/Map visuals use curated static bank, other charts use SVG generation
