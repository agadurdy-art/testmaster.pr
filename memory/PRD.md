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
- **Speaking Part 1 & 3 - Audio-only questions**
  - Questions HIDDEN - only topic shown
  - "Listen to Question" (2 plays max via ElevenLabs TTS)
  - "Record Answer" per question
- **Listening audio** - Working via `/api/audio/cambridge/` endpoint
- **Test Results Page** - Full evaluation with:
  - Overall Band score
  - Section-by-section scores (L/R/W/S)
  - Answer Details (correct/incorrect)
  - Recommended Next Steps
  - "Get AI Feedback" for Writing

### In Progress
- Answer keys (need to extract from PDF)
- Writing AI evaluation via GPT-4o
- Speaking full-test evaluation

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
