# Testmaster - Product Requirements Document

## Original Problem Statement
A "Mastery-Based" and "Retention-Driven" English learning platform named "Testmaster." The core is a single, unified learning path from Stage 1 (Beginner) to Stage 8 (Advanced). Features a 10-step lesson structure, special modes like "Daily Habit" and "Booster Mode," and full curriculum data for Stage 1 (12 units).

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Auth**: Email/password with SHA256 hashing
- **3rd Party**: OpenAI Whisper (pronunciation), Browser TTS (listening - MOCKED), jsPDF (PDF worksheets - client-side)

## What's Been Implemented
- [x] Authentication system (login/register)
- [x] Stage 1 full curriculum seeded (12 units x 4 lessons = 48 lessons)
- [x] 10-step lesson activity flow
- [x] Stage-specific theming (Stage 1 = amber/orange)
- [x] Vocabulary module with Record & Check (Whisper)
- [x] Grammar Game (multi-format: error hunter, word order, fill blank)
- [x] All units/lessons unlocked for testing
- [x] Unique content per lesson
- [x] Lesson Summary card with vocab, grammar, scores
- [x] **FIXED (Feb 16)**: Grammar Game word_order evaluation - punctuation normalization
- [x] **FIXED (Feb 16)**: Grammar Game fill_blank - case-insensitive comparison
- [x] **FIXED (Feb 17)**: Seed data pedagogical correctness - fill_blank uses word's OWN example sentence (not pattern blindly filled)
- [x] **FIXED (Feb 17)**: Exit quiz grammar question uses correct word from rule example
- [x] **NEW (Feb 16)**: Lesson Roadmap - winding path before lesson starts
- [x] **NEW (Feb 16)**: Warm-up images - emoji above questions
- [x] **NEW (Feb 16)**: PDF Worksheet (jsPDF) - vocabulary, matching, fill-blank, grammar
- [x] **NEW (Feb 17)**: Cumulative PDF option - "This Lesson" vs "All Lessons" download
- [x] **NEW (Feb 17)**: Backend API: GET /api/unified/cumulative-vocab/{lesson_id}

## Key Files
- `/app/frontend/src/pages/UnifiedLessonPage.js` - All 10 activity components + Roadmap + PDF
- `/app/frontend/src/pages/UnifiedStagePage.js` - Stage/unit/lesson navigation
- `/app/backend/unified_learning_routes.py` - API endpoints (incl. cumulative-vocab)
- `/app/backend/seed_stage1_full.py` - Stage 1 curriculum data (V3 with pedagogical fix)

## Prioritized Backlog
### P1 (Upcoming)
- Listening audio via TTS integration (ElevenLabs/OpenAI TTS)
- Daily Habit Mode
- Refactor UnifiedLessonPage.js monolith into separate component files

### P2 (Future)
- Booster Mode
- Certification Gate
- Stage 2-8 curriculum
- Teacher Control Panel
- ISLCollective/YouTube Extra Practice

## Test Credentials
- Email: tester@test.com / Password: tester123
