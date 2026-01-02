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
│   └── full_test.py           # Test session management
└── static/visuals/            # PDF-extracted images
```

### Key Features Implemented
- ✅ Cambridge IELTS 17 Test 1 content extraction
- ✅ Full test interface with section timers
- ✅ Writing Task 1 authentic PDF visual
- ✅ **Full Test / Skill Practice mode selection** (NEW)
- ✅ Audio player for Listening section
- ✅ Question types: note_completion, multiple_choice, matching, etc.
- ✅ Old AI-generated tests locked as "Coming Soon"

## Test Selection Flow
1. User goes to Question Bank → Full Tests tab
2. Clicks on Cambridge IELTS 17 Test 1
3. Modal appears with two options:
   - **Full Test Mode**: Complete all 4 sections (~2h 45m)
   - **Skill Practice**: Individual section (Listening/Reading/Writing/Speaking)

## API Endpoints
- `GET /api/cambridge/test/{book}/{test}` - Fetch test data
- `GET /api/visuals/image/{name}` - Serve PDF-extracted images
- `GET /api/full-test/sets` - List available tests

## Current Status (Jan 2, 2025)

### Completed
- Cambridge IELTS 17 Test 1 content (all 4 sections)
- Writing Task 1 authentic PDF map visual
- Full Test / Skill Practice mode selection modal
- Test interface with timers and section navigation

### In Progress
- Reading section may have gaps (Q23-26 reported missing)
- Test evaluation/results page not connected to Cambridge tests

### Pending
- IELTS 16, 18, 19 integration
- Session persistence fix
- Progress tracking dashboard

## Technical Notes
- PDF visual extraction uses PyMuPDF (fitz)
- Images served via `/api/visuals/image/{name}` endpoint
- Skill mode uses URL query parameter: `?skill=writing`
- Section times: Listening 40min, Reading 60min, Writing 60min, Speaking 14min

## Credentials
- Test account: test@ielts.com / admin123
