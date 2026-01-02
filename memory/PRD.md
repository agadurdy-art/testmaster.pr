# IELTS Practice Platform - Product Requirements Document

## Original Problem Statement
Build a comprehensive IELTS practice application using authentic Cambridge IELTS materials (Books 16, 17, 18, 19) with a computer-delivered test interface that includes all standard IELTS test features.

## Core Requirements
1. **Authentic Content**: All test content extracted directly from Cambridge IELTS PDFs
2. **Full Test Experience**: Computer-delivered interface with timers, audio, and all question types
3. **Visual Integration**: PDF-extracted images for Writing Task 1 (maps, charts, diagrams)
4. **UI Language**: English

## Architecture

### Frontend (React + Tailwind)
```
/app/frontend/src/pages/
├── CambridgeTestInterface.js  # Main test interface (Full + Skill modes)
├── CambridgeTestResults.js    # Test results with scores & recommendations
├── QuestionBank.js            # Test selection with mode picker modal
└── Login.js                   # Authentication
```

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── content/cambridge_tests/ielts17/test1.py  # Test content
├── routes/
│   ├── cambridge.py           # Cambridge test API + Answer Keys
│   ├── cambridge_speaking.py  # Speaking evaluation (GPT-4o)
│   ├── audio.py               # Audio streaming
│   ├── recordings.py          # User recordings
│   └── tts.py                 # Text-to-Speech (ElevenLabs)
└── static/
    ├── audio/cambridge/       # IELTS audio files
    └── visuals/               # PDF-extracted images
```

## Key Features Implemented (Jan 2, 2025)

### ✅ Completed
- Cambridge IELTS 17 Test 1 content (all 4 sections)
- **Full Test / Skill Practice mode selection**
- **Writing Tasks - Cambridge rubric format**
  - Task 1: "You should spend 20 minutes..." + italic rubric + visuals
  - Task 2: "Write about the following topic:" + italic rubric + "Give reasons..."
- **Speaking Section - Fully Functional State Machine**
  - Part 1: Topic display, per-question Listen/Record with proper state reset
  - Part 2: Task Card visible, 1-minute preparation timer, recording controls
  - Part 3: "Themes" display (not Topic), 6 questions from 2 themes
  - State machine: IDLE → LOADING_AUDIO → PLAYING_PROMPT → READY_TO_RECORD → RECORDING → RECORDED
  - Part-based keys for recordings and play counts (no cross-part conflicts)
- **Listening audio** - Working via `/api/audio/cambridge/` endpoint
- **Test Results Page** - Full evaluation with scores and recommendations

### In Progress
- Answer keys (need to extract from PDF - placeholders currently)
- Writing AI evaluation endpoint for Cambridge tests

### Pending
- IELTS 16, 18, 19 integration

## API Endpoints
- `GET /api/cambridge/test/{book}/{test}` - Fetch test data
- `GET /api/cambridge/answers/{book}/{test}` - Get answer key
- `GET /api/audio/cambridge/{book}/{filename}` - Stream audio
- `POST /api/tts/generate` - Generate TTS for speaking questions
- `POST /api/recordings/save` - Save user recordings
- `POST /api/cambridge/speaking/evaluate` - Evaluate speaking responses

## Test Flow
1. Question Bank → Full Tests → Select test → Modal (Full/Skill mode)
2. Take test with timers, audio, recording
3. Submit → Results page with scores and recommendations

## Credentials
- Test account: test@ielts.com / admin123

## Bug Fixes (Jan 2, 2025 - Session 2)
- ✅ Fixed: Q2+ missing Record button - State now resets on Next Question
- ✅ Fixed: Same question audio playing - Part-based keys for TTS tracking
- ✅ Fixed: Part 3 showing Part 1 questions - Proper topics.flatMap extraction
- ✅ Fixed: Part 3 showing "Topic" instead of "Themes" - Added conditional display
- ✅ Fixed: Part 2 recording error - Using consistent recording function
