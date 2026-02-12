# IELTS Ace - Product Requirements Document

## Original Problem Statement
IELTS preparation platform with Cambridge-aligned AI examiner. Features include level checking, question bank, full tests, practice modes, and AI feedback.

## Core Requirements
- Full test feedback system for AI-generated and Cambridge tests
- Question Bank with Cambridge + AI practice tests
- English-only UI and AI feedback
- Dynamic statistics reflecting actual content
- Test Completion Rate tracking with breakdown
- Quick Practice mode (YouTube Shorts style)

## Architecture
- **Frontend:** React (CRA) on port 3000
- **Backend:** FastAPI (Python) on port 8001
- **Database:** MongoDB via MONGO_URL (DB: ielts_database)
- **AI:** Emergent LLM Key for AI Teacher feedback
- **TTS:** ElevenLabs / Browser TTS for listening audio

## What's Been Implemented
- Full Test feedback system (skill analysis, AI Teacher advice)
- QB Full Tests UX redesign (Cambridge vs AI selection)
- Language standardization to English
- Missing audio files generated for Set E
- **QB Stats bug fix (Feb 12, 2026):** Dynamic counts - 1420 questions, 20 full tests, 47 topics
- **Test Completion Rate (Feb 12, 2026):** 5th stat box with breakdown (Cambridge/AI Academic/AI General)
- **Quick Practice (Feb 12, 2026):** YouTube Shorts style - 3 questions per set, instant feedback, "Next Set" for infinite fresh questions from 1200+ pool. Dark theme, card-based UI. Supports Reading + Listening.

## Key Files
- `/app/backend/routes/question_bank.py` - QB stats + practice endpoints (fixed pool: all 12 AI sets + 8 Cambridge)
- `/app/backend/routes/full_test.py` - Full test API + completion tracking
- `/app/backend/server.py` - Completion tracking endpoints
- `/app/frontend/src/pages/PracticeMode.js` - Quick Practice (Shorts-style, rewritten)
- `/app/frontend/src/pages/QuestionBank.js` - QB page with stats + completion

## DB Collections
- `user_completions` - Tracks test completions
- `test_attempts` - Practice test attempts

## Backlog
- P2: QuestionBank.js refactoring into smaller components
- P2: Progress tab implementation
- P3: Writing and Speaking practice modes
