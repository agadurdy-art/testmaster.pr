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
- [x] 10-step lesson activity flow (Warm-up -> Vocabulary -> Vocab Game -> Reading -> Grammar -> Grammar Game -> Listening -> Speaking -> Exit Quiz -> Review)
- [x] Stage-specific theming (Stage 1 = amber/orange)
- [x] Vocabulary module with Record & Check (Whisper)
- [x] Grammar Game (multi-format: error hunter, word order, fill blank)
- [x] Skip buttons on all activities
- [x] Multi-answer evaluation support (Array correct_answer)
- [x] All units/lessons/activities unlocked for testing
- [x] Unique content per lesson (V3 seed)
- [x] Lesson Summary card with vocab, grammar, scores
- [x] **FIXED (Feb 16)**: Grammar Game "Build the Sentence" evaluation - punctuation normalization fix
- [x] **FIXED (Feb 16)**: Grammar Game "Fill in the Blank" - case-insensitive comparison
- [x] **NEW (Feb 16)**: Lesson Roadmap - visual winding path on lesson entry
- [x] **NEW (Feb 16)**: Warm-up images - emoji displayed above questions
- [x] **NEW (Feb 16)**: PDF Worksheet download (jsPDF) - vocabulary, matching, fill-blank, grammar practice

## Key Files
- `/app/frontend/src/pages/UnifiedLessonPage.js` - All 10 activity components + Roadmap + PDF
- `/app/frontend/src/pages/UnifiedStagePage.js` - Stage/unit/lesson navigation
- `/app/backend/unified_learning_routes.py` - API endpoints
- `/app/backend/seed_stage1_full.py` - Stage 1 curriculum data

## Prioritized Backlog
### P0 (Completed)
- ~~Flawed evaluation logic~~ (FIXED - punctuation normalization)
- ~~Empty content sections~~ 
- ~~Unlock all courses~~

### P1 (Upcoming)
- Listening audio via TTS integration (ElevenLabs/OpenAI TTS)
- Daily Habit Mode
- Refactor UnifiedLessonPage.js monolith into separate component files

### P2 (Future)
- Booster Mode
- Certification Gate at end of each Stage
- Stage-dependent theme (Stages 5-8 = serious/academic)
- Teacher Control Panel
- ISLCollective/YouTube integration for Extra Practice
- Curriculum for Stages 2-8

## Test Credentials
- Email: tester@test.com / Password: tester123
