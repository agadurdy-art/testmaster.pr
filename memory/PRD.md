# IELTS Practice Platform - Product Requirements Document

## Original Problem Statement
Build a comprehensive IELTS practice application using authentic Cambridge IELTS materials (Books 16, 17, 18, 19) with a computer-delivered test interface that includes all standard IELTS test features.

## Core Requirements
1. **Authentic Content**: All test content extracted directly from Cambridge IELTS PDFs
2. **Full Test Experience**: Computer-delivered interface with timers, audio, and all question types
3. **Visual Integration**: PDF-extracted images for Writing Task 1 (maps, charts, diagrams)
4. **Deep Evaluation**: AI-powered evaluation matching existing platform protocols
5. **Premium Features**: Azure pronunciation analysis for Booster/Pro users
6. **Real IELTS UI**: Official IELTS Computer-Delivered Test interface

## Architecture

### Frontend (React + Tailwind)
```
/app/frontend/src/pages/
├── CambridgeTestInterface.js  # Full IELTS Computer-Delivered interface
├── CambridgeTestResults.js    # Test results with deep AI evaluation
├── QuestionBank.js            # Test selection
└── Results.js                 # Reference for correct results UI
```

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── content/cambridge_tests/ielts17/test1.py
├── routes/
│   ├── cambridge.py           # Cambridge test API + Writing evaluation
│   ├── cambridge_speaking.py  # Speaking evaluation (Free + Premium)
│   └── speaking_qb.py         # Core speaking evaluation protocols
└── writing_evaluator.py       # Core writing evaluation protocols
```

## Completed Features (January 2, 2025)

### ✅ P0: Cambridge Test Results Page - FIXED
- **Listening Results**: Expandable section with Your Answer, Correct Answer, Explanation
- **Reading Results**: Locate in Passage (yellow), Explanation (blue), Skill Tip (purple)
- **Writing Evaluation**: 
  - 4 criteria scores (Task Achievement, Coherence, Lexical, Grammar)
  - Teacher's Feedback, Strengths, Areas to Improve
  - Vocabulary Notes, Grammar Notes
  - Your Text / Sample Answers tabs
- **Overall Band Score**: Card with all 4 skills displayed

### ✅ P1: Premium Speaking Evaluation (Azure Integration)
- Frontend sends `user_plan` to speaking evaluation endpoint
- Backend checks user plan (free/booster/pro)
- Free tier: Whisper + GPT-4o evaluation
- Premium tier (booster/pro): Azure pronunciation analysis with:
  - Detailed Azure scores (Pronunciation, Accuracy, Fluency, Completeness, Prosody)
  - Word-level problem detection
  - Mentor notes and practice focus
- Speaking evaluations passed to results page via navigation state
- Results page displays premium badge and Azure scores when available

### ✅ Test Interface Features
- Dark header bar with timer
- Settings modal (text size, colors)
- Help modal (3 tabs)
- Split-screen Reading
- Text Highlighter + Notes
- Question navigation bar

## Pending Tasks

### P2: Content Library Expansion
- IELTS 16, 18, 19 content (waiting for user to provide PDFs/audio)

### P3: Session Persistence Bug
- Frontend localStorage session restoration issue

## Test Credentials (PERMANENT)
```
Email: test@ieltsace.com
Password: TestPassword123!
Plan: Pro (Premium features enabled)
```

## API Endpoints

### Cambridge Test API
- `GET /api/cambridge/books` - List all Cambridge books
- `GET /api/cambridge/test/{book_id}/{test_id}` - Get full test content
- `GET /api/cambridge/answers/{book_id}/{test_id}` - Get answer key
- `POST /api/cambridge/evaluate/writing` - Evaluate writing response

### Cambridge Speaking API
- `POST /api/cambridge/speaking/evaluate` - Evaluate speaking (free/premium based on user_plan)
- `POST /api/cambridge/speaking/evaluate-full-test` - Evaluate complete speaking test

## Key Files Reference
- `/app/frontend/src/pages/CambridgeTestResults.js` - Results page (FIXED)
- `/app/frontend/src/pages/CambridgeTestInterface.js` - Test interface
- `/app/frontend/src/pages/Results.js` - Reference for correct UI implementation
- `/app/backend/routes/cambridge.py` - Backend routes
- `/app/backend/routes/cambridge_speaking.py` - Speaking evaluation
- `/app/memory/TEST_CREDENTIALS.md` - Permanent test account info
