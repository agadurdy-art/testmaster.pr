# IELTS Practice Platform - Product Requirements Document

## Original Problem Statement
Build a comprehensive IELTS practice application using authentic Cambridge IELTS materials (Books 16, 17, 18, 19) with a computer-delivered test interface that includes all standard IELTS test features.

## Core Requirements
1. **Authentic Content**: All test content extracted directly from Cambridge IELTS PDFs
2. **Full Test Experience**: Computer-delivered interface with timers, audio, and all question types
3. **Visual Integration**: PDF-extracted images for Writing Task 1 (maps, charts, diagrams)
4. **UI Language**: English

## User Personas
- IELTS test takers preparing for Academic or General Training exams
- Students practicing individual skills (Listening, Reading, Writing, Speaking)

## Architecture

### Frontend (React + Tailwind)
```
/app/frontend/src/pages/
├── CambridgeTestInterface.js  # Main test interface (Full + Skill modes)
├── QuestionBank.js            # Test selection with mode picker modal
├── Dashboard.js               # User dashboard
└── Login.js                   # Authentication
```

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── content/cambridge_tests/ielts17/test1.py  # Test content
├── routes/
│   ├── cambridge.py           # Cambridge test API
│   ├── cambridge_speaking.py  # Speaking evaluation (GPT-4o + Azure)
│   ├── audio.py               # Audio streaming
│   ├── recordings.py          # User recordings
│   ├── tts.py                 # Text-to-Speech (ElevenLabs)
│   └── full_test.py           # Test session management
└── static/
    ├── audio/cambridge/       # IELTS audio files
    └── visuals/               # PDF-extracted images
```

## Key Features Implemented (Jan 2, 2025)

### ✅ Completed
- Cambridge IELTS 17 Test 1 content (all 4 sections)
- **Full Test / Skill Practice mode selection**
- **Writing Task 1 & 2 - Cambridge rubric format**
  - Task 1: Simple rubric with side-by-side maps
  - Task 2: "Write about the following topic:" + italic rubric box + "Give reasons..."
- **Speaking Part 1 & 3 - Audio-only questions**
  - Questions HIDDEN - only topic shown
  - "Listen to Question" (2 plays max)
  - "Record Answer" per question
  - "Get AI Feedback" - GPT-4o evaluation with band scores
- **Listening audio** - Working via `/api/audio/cambridge/` endpoint
- **Recording system** - MediaRecorder with error handling

### In Progress
- Answer keys integration (PDF extraction needed)
- Writing evaluation with model answers
- Results/Summary page

### Pending
- IELTS 16, 18, 19 integration
- Premium Azure pronunciation assessment

## API Endpoints
- `GET /api/cambridge/test/{book}/{test}` - Fetch test data
- `GET /api/audio/cambridge/{book}/{filename}` - Stream audio
- `GET /api/visuals/image/{name}` - Serve images
- `POST /api/tts/generate` - Generate TTS for speaking questions
- `POST /api/recordings/save` - Save user recordings
- `POST /api/cambridge/speaking/evaluate` - Evaluate speaking responses

## Test Selection Flow
1. User goes to Question Bank → Full Tests tab
2. Clicks on Cambridge IELTS 17 Test 1
3. Modal appears with two options:
   - **Full Test Mode**: Complete all 4 sections (~2h 45m)
   - **Skill Practice**: Individual section (Listening/Reading/Writing/Speaking)

## Speaking Evaluation
- **Free tier**: Whisper transcription + GPT-4o feedback
- **Premium tier**: Azure Pronunciation Assessment + detailed analysis

## Credentials
- Test account: test@ielts.com / admin123

## Technical Notes
- PDF visual extraction uses PyMuPDF (fitz)
- Audio served via `/api/audio/` endpoint (not /static/)
- Skill mode uses URL query parameter: `?skill=writing`
- Section times: Listening 40min, Reading 60min, Writing 60min, Speaking 14min
- Recording: WebM format via MediaRecorder API
