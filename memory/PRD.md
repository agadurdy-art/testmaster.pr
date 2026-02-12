# IELTS Ace - Product Requirements Document

## Original Problem Statement
An IELTS exam preparation platform with AI-powered evaluation, Cambridge-aligned test content, and comprehensive practice modes for Reading, Listening, Writing, and Speaking skills.

## Core Architecture
- **Frontend**: React (Vite) with Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python) on port 8001
- **Database**: MongoDB
- **TTS**: OpenAI TTS via Emergent Integrations (base64 audio response)
- **LLM**: OpenAI GPT-4o via Emergent LLM Key for writing evaluation

## What's Been Implemented

### Question Bank (QB) Page
- Dynamic statistics showing real-time test/question counts
- Test Completion Rate feature with MongoDB tracking (`user_completions` collection)
- Clickable progress breakdown by Cambridge, AI Academic, AI General tests
- Files: `QuestionBank.js`, `routes/question_bank.py`, `routes/full_test.py`

### Quick Practice Mode (Shorts-style)
- 3-question sets with instant feedback and summary screen
- Reading: passages + MC/TFNG/fill-in-the-blank questions
- Listening: TTS audio playback with base64 decoding
- Writing/Speaking: redirects to dedicated pages
- Light warm UI theme (amber, cream, orange tones)
- Files: `PracticeMode.js`, `routes/question_bank.py`

### Full Test System
- Cambridge IELTS 17-18 test data
- AI-generated Academic (Sets A-H) and General (Sets A-D) tests
- Complete IELTS exam simulation with timed sections
- Files: `routes/full_test.py`, `content/full_tests/`

### Writing Practice
- Task 1 (visual description) with SVG chart generation
- Task 2 (essay) with AI evaluation using IELTS band descriptors
- Model answer generation
- Dual-track support (Academic/General)
- Files: `WritingPractice.js`, `routes/question_bank.py`

### Other Features
- Adaptive Level Test
- Vocabulary & Grammar lessons
- Speaking practice with pronunciation evaluation
- Cambridge speaking practice
- Learning platform with beginner/advanced/mastery courses

## Key API Endpoints
- `GET /api/question-bank/practice/random?skill={skill}&count=3` - Quick Practice questions (filtered: only questions with correct answers)
- `GET /api/question-bank/stats` - Dynamic QB statistics
- `GET /api/user/{user_id}/completion-stats` - Test completion progress
- `POST /api/user/track-completion` - Log completed test
- `POST /api/vocab-grammar/tts` - TTS (returns JSON {audio: base64, format: mp3})
- `POST /api/question-bank/writing/evaluate` - AI writing evaluation

## Key Technical Decisions
- Questions without correct answers are filtered out from practice mode at the API level
- Answer comparison uses case-insensitive normalization (`normalizeAnswer()`)
- MC option value extraction handles multiple formats: `A)`, `A:`, `A.`, `A ` (`extractOptionValue()`)
- TTS returns base64 JSON, frontend decodes via `atob()` → `Uint8Array` → `Blob`
- Writing skill redirects from practice to `/writing-practice` page

## Bug Fixes Applied (Feb 12, 2026)
1. **P0 - Reading feedback logic**: Fixed option value extraction regex to handle `A text`, `A: text`, `A. text` formats + case-insensitive comparison
2. **P1 - Listening audio missing**: Fixed base64 JSON response handling in frontend (was treating JSON as blob)
3. **P1 - Writing crash**: Fixed redirect from `/writing-practice/task1` to `/writing-practice`
4. **P2 - Dark UI**: Replaced slate-900 dark theme with amber/cream/orange warm tones
5. **Backend filter**: Questions with empty `correct` field are now excluded from practice

## Backlog
- No pending tasks currently. All reported bugs are fixed and tested.

## Test Credentials
- Email: test@test.com / Password: test1234
- localStorage auth: `{"id":"6565a865-dbf9-4596-b756-eaf6c29295c8","email":"test@test.com","name":"Test User","plan":"free"}`
