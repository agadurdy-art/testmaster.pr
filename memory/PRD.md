# IELTS Ace - Product Requirements Document

## Original Problem Statement
An IELTS exam preparation platform with AI-powered evaluation, Cambridge-aligned test content, and comprehensive practice modes for Reading, Listening, Writing, and Speaking skills.

## Core Architecture
- **Frontend**: React with Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python) on port 8001
- **Database**: MongoDB
- **TTS**: OpenAI TTS via Emergent Integrations
- **LLM**: OpenAI GPT-4o via Emergent LLM Key

## What's Been Implemented

### Emily AI Teacher (NEW - Feb 12, 2026)
- Personal AI English teacher powered by GPT-4o
- Full-page chat interface at `/emily` with warm amber/cream theme
- Floating chat button on all pages (bottom-right corner)
- Multi-turn conversation with MongoDB-persisted chat history
- Session management: create new, load previous, view history
- TTS voice responses using OpenAI nova voice
- Quick prompt buttons: grammar quiz, study recommendations, vocabulary help
- Personalized guidance based on user's test history and progress
- Interactive quiz generation within chat
- Files: `routes/emily_teacher.py`, `EmilyTeacher.js`, `EmilyFloatingButton.js`

### Question Bank (QB) Page
- Dynamic statistics showing real-time test/question counts
- Test Completion Rate feature with MongoDB tracking
- Clickable progress breakdown by test type

### Quick Practice Mode (Shorts-style)
- 3-question sets with instant feedback and summary screen
- Reading: MC/TFNG/fill-in-the-blank with multi-answer support
- Listening: 51 pre-generated questions (17 sets) with local MP3 audio files
- Writing/Speaking: redirects to dedicated pages
- Light warm UI theme (amber, cream, orange tones)

### Full Test System
- Cambridge IELTS 17-18 + AI-generated tests (Academic A-H, General A-D)
- Audio player with progress bar, time elapsed/remaining display
- All 4 listening parts audio working for all test sets

### Writing Practice
- Task 1 + Task 2 with AI evaluation
- Model answer generation
- Dual-track support (Academic/General)

### Other Features
- Adaptive Level Test, Vocabulary & Grammar lessons
- Speaking practice with pronunciation evaluation
- Learning platform with beginner/advanced/mastery courses

## Key API Endpoints
- `POST /api/emily/chat` - Chat with Emily (GPT-4o)
- `GET /api/emily/sessions/{user_id}` - List chat sessions
- `GET /api/emily/history/{session_id}` - Get chat messages
- `POST /api/emily/tts` - Emily voice responses
- `GET /api/question-bank/practice/listening-sets` - Practice listening questions
- `GET /api/question-bank/practice/random` - Practice reading questions
- `GET /api/full-test/audio/stream/{test_id}/listening/{part}` - Full test audio

## Bug Fixes Applied (Feb 12, 2026)
1. Reading feedback logic - option extraction + case-insensitive comparison
2. Listening audio - base64 JSON response handling
3. Writing crash - redirect fix
4. Dark UI → light warm theme
5. Backend filter - empty correct answers excluded
6. Listening audio state reset on question change
7. Full Test Audio Part 2+ - file matching for hash/non-hash filenames
8. Practice Reading multi-answer support (fire/flame, A and B)
9. Practice Listening dedicated pool with 51 pre-generated questions+audio

## Backlog / Future Tasks
- **Spaced Repetition System**: Track wrong answers and re-serve them
- Generate more listening practice questions (expand beyond 51)
- Refactor PracticeMode.js into smaller components
- Enrich Cambridge test data with more correct answers

## Test Credentials
- Email: test@test.com / Password: test1234
- localStorage: `{"id":"6565a865-dbf9-4596-b756-eaf6c29295c8","email":"test@test.com","name":"Test User","plan":"free"}`
