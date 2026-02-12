# IELTS Ace - Product Requirements Document

## Original Problem Statement
IELTS exam preparation platform being transformed into a "Hybrid Learning Platform" controlled by teachers.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI on port 8001
- **Database**: MongoDB
- **LLM**: OpenAI GPT-4o via Emergent LLM Key
- **TTS/STT**: OpenAI TTS + Whisper via Emergent Integrations, ElevenLabs for Listening QB

## What's Been Implemented

### Listening Test Audio Fix (Feb 12, 2026)
- User-provided MP3 files (Test 1 Part 1-4) stored at `/app/backend/static/audio/listening_tests/`
- Backend dynamically injects `audio_url` into test sections when serving data
- Frontend resolves relative `/api/` URLs to full backend URL for `<audio>` elements
- Listening QB audio fix: removed `Content-Disposition: attachment` header

### Vocabulary Engine - Phase 1 COMPLETE (Feb 12, 2026)
iOS-inspired design (`#F5F5F7`, white cards, `rounded-[20px]`, subtle shadows):
1. **Learn Mode** - Flip-card slides (28/module), IPA, TTS, word formation
2. **Controlled Practice** - Fill-in-blank + matching (25/module), fixed matching click logic
3. **Mastery Quiz** - 10Q (MC + fill_blank + TFNG with passage), 80% pass, auto-adds to Review Bank
4. **Production Mode AI** - GPT-4o evaluates sentences (1-5 stars)
5. **Review Bank** - Spaced repetition (1d->3d->7d->14d->mastered)

### Other Features
- Dashboard, Question Bank, Liz AI Teacher, Quick Practice, Full Test System

## Backlog
- **P1**: Grammar Engine, Teacher Control Layer
- **P2**: Learning Pathway restructuring, AI Content Expansion
- **P3**: Weekly reports, Speaking mock test, Exam readiness

## Test Credentials
- Email: test@test.com / Password: test1234
