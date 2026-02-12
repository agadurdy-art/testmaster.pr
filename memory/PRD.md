# IELTS Test Preparation Platform - PRD

## Original Problem Statement
IELTS test preparation application with FastAPI backend, React frontend, and MongoDB. Users can take full IELTS-style practice tests (Academic Sets A-H) and Cambridge IELTS tests with comprehensive feedback.

## Core Requirements
- Complete IELTS-style tests with Listening, Reading, Writing, Speaking
- AI-powered evaluation for Writing and Speaking sections
- Rich feedback mechanism with detailed per-question analysis
- Visual assets for Writing Task 1
- TTS audio for Listening sections

## What's Been Implemented

### Test Content (Completed)
- 8 Academic test sets (Set A-H) with original content
- 4 General Training test sets (Set A-D)
- Cambridge IELTS 17 integration
- 26 user-provided visual assets integrated
- TTS audio files generated for all listening scripts

### Feedback Mechanism (Completed - Feb 2026)
Enhanced Full Test feedback to match Cambridge-level richness:

**Backend (`/api/full-test/complete`):**
- Per-question reason codes: UNANSWERED, SPELLING_ERROR, WRONG_ANSWER, NEAR_MISS, TFNG_CONFUSION, YNNG_CONFUSION, DISTRACTOR_TRAP
- Skill breakdown by question type (form_completion, flowchart, sentence_completion, etc.)
- AI Teacher Feedback in Turkish (system language) via Emergent LLM
- Fastest Score Gain analysis (top 3 improvement areas)
- Integrity warnings (unanswered question alerts)
- Recommended lessons based on weak areas
- Per-question explanations and skill tips
- Evidence text extraction from reading passages

**Frontend (`FullTestResults.js`):**
- Overall score card with band calculation transparency
- Integrity warnings display
- Mistake analysis with color-coded reason chips
- Fastest Score Gain card with progress bars
- AI Teacher Feedback card (strengths/weaknesses/tips)
- Recommended Lessons with navigation
- Expandable per-question details with explanations, evidence, and skill tips
- Writing and Speaking evaluation results

### Other Features (Previously Completed)
- Question Bank UI with all sets unlocked
- Writing Task Renderer with before/after image support
- Map Labelling component for Listening
- Adaptive Level Test
- Learning Platform with courses
- Pronunciation practice
- Game Bank

## Architecture
```
Backend: FastAPI (port 8001)
Frontend: React (port 3000)
Database: MongoDB
LLM: Emergent LLM Key (OpenAI)
TTS: ElevenLabs
```

## Key Files
- `/app/backend/routes/full_test.py` - Full test API with rich feedback
- `/app/backend/routes/cambridge.py` - Cambridge test API + shared helpers
- `/app/frontend/src/pages/FullTestResults.js` - Rich results page
- `/app/frontend/src/pages/CambridgeTestResults.js` - Cambridge results
- `/app/frontend/src/pages/QuestionBank.js` - Test selection UI
- `/app/backend/content/full_tests/academic/` - Test set definitions

## Prioritized Backlog

### P1 - Future Tasks
- Create additional Academic test sets (I, J) using remaining 12 visuals
- Migrate test set data from Python files to MongoDB for scalability

### P2 - Enhancements
- Speaking drills and model answers for Full Test sets
- Writing evaluation with reference samples
- Retry functionality for wrong questions in Full Tests
- Progress tracking across multiple test attempts
