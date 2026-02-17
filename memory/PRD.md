# Testmaster - Product Requirements Document

## Original Problem Statement
A "Mastery-Based" and "Retention-Driven" English learning platform. Single unified learning path from Stage 1 (Beginner) to Stage 8 (Advanced). 10-step lesson structure per lesson.

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **AI Content Generation**: GPT (via Emergent LLM Key) - generates exercises ONCE during seed, cached in `ai_content_cache.json`
- **3rd Party**: OpenAI Whisper (pronunciation), Browser TTS (listening - MOCKED), jsPDF (PDF worksheets)

## What's Been Implemented
- [x] Auth system (login/register)
- [x] Stage 1 full curriculum (12 units x 4 lessons = 48 lessons)
- [x] 10-step lesson activity flow
- [x] Stage-specific theming
- [x] Vocabulary module with Record & Check (Whisper)
- [x] Grammar Game (error hunter, word order, fill blank)
- [x] All units/lessons unlocked for testing
- [x] Lesson Summary card
- [x] Lesson Roadmap (winding path)
- [x] Warm-up images + hints
- [x] PDF Worksheet (current lesson + cumulative)
- [x] **AI-Powered Content Generation (Feb 17)**: GPT generates pedagogically correct fill-blank, word-order, exit quiz, and warmup questions with proper distractors, hints, plural forms, and acceptable answers. Cached in `ai_content_cache.json` - zero per-user LLM cost.

## AI Content System
- `ai_content_generator.py` - GPT prompt templates for exercises
- `ai_generate_cache.py` - Batch generator (run per 3 units): `python ai_generate_cache.py 1 3`
- `ai_content_cache.json` - Cached output (48 lessons)
- `seed_stage1_full.py` - Reads from cache, seeds MongoDB
- **For new stages**: Define curriculum words/grammar → run cache generator → run seed

## Key Files
- `/app/frontend/src/pages/UnifiedLessonPage.js` - All activity components + Roadmap + PDF
- `/app/backend/seed_stage1_full.py` - Seed script (reads AI cache)
- `/app/backend/ai_content_cache.json` - AI-generated exercises cache
- `/app/backend/ai_content_generator.py` - GPT prompt templates
- `/app/backend/ai_generate_cache.py` - Batch cache generator

## Prioritized Backlog
### P1 (Upcoming)
- Listening audio via TTS integration
- Daily Habit Mode
- Refactor UnifiedLessonPage.js monolith

### P2 (Future)
- Booster Mode, Certification Gate
- Stage 2-8 curriculum (now easy with AI system!)
- Teacher Control Panel

## Test Credentials
- Email: tester@test.com / Password: tester123
