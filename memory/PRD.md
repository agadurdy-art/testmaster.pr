# IELTS Ace - Product Requirements Document

## Original Problem Statement
IELTS preparation platform with Cambridge-aligned AI examiner. Features include level checking, question bank, full tests, practice modes, and AI feedback.

## Core Requirements
- Full test feedback system for AI-generated and Cambridge tests
- Question Bank with Cambridge + AI practice tests
- English-only UI and AI feedback
- Dynamic statistics reflecting actual content
- Test Completion Rate tracking with breakdown

## Architecture
- **Frontend:** React (CRA) on port 3000
- **Backend:** FastAPI (Python) on port 8001
- **Database:** MongoDB via MONGO_URL (DB: ielts_database)
- **AI:** Emergent LLM Key for AI Teacher feedback
- **TTS:** ElevenLabs for listening test audio

## What's Been Implemented
- Full Test feedback system (skill analysis, AI Teacher advice)
- QB Full Tests UX redesign (Cambridge vs AI selection)
- Language standardization to English
- Missing audio files generated for Set E
- **QB Stats bug fix (Feb 12, 2026):** Backend dynamically counts all tests (Cambridge 8 + AI Academic 8 + AI General 4 = 20 total). Topics count from lesson registry (47). Frontend displays dynamic values.
- **Test Completion Rate (Feb 12, 2026):** 5th stat box in QB header showing X/20 Completed with progress bar. Click to expand breakdown: Cambridge X/8, AI Academic X/8, AI General X/4, plus practice session counts. Auto-tracks from Full Test and Cambridge test completions.

## Key Files
- `/app/backend/routes/question_bank.py` - QB stats endpoint
- `/app/backend/routes/full_test.py` - Full test API + completion tracking
- `/app/backend/server.py` - track-completion & completion-stats endpoints
- `/app/frontend/src/pages/QuestionBank.js` - QB page (stats + completion breakdown)
- `/app/frontend/src/pages/FullTestInterface.js` - Sends user_id on test complete
- `/app/frontend/src/pages/CambridgeTestInterface.js` - Calls track-completion on finish

## DB Collections
- `user_completions` - Tracks test completions (user_id, test_id, category, band_score, completed_at)
- `test_attempts` - Practice test attempts

## Backlog
- P2: QuestionBank.js refactoring into smaller components
- P2: Progress tab implementation (currently "Coming Soon")
