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
│   - Dark header bar (IELTS logo + timer)
│   - Settings Modal (text size, colors)
│   - Help Modal (3 tabs: Information, Test help, Task help)
│   - Hide button (for Reading/Writing)
│   - Split Screen Reading
│   - Text Highlighter + Notes
│   - Review Panel
├── CambridgeTestResults.js    # Test results with deep AI evaluation
├── QuestionBank.js            # Test selection
└── Login.js                   # Authentication
```

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── content/cambridge_tests/ielts17/test1.py
├── routes/
│   ├── cambridge.py           # Cambridge test API
│   ├── cambridge_speaking.py  # Speaking evaluation
│   ├── audio.py               # Audio streaming
│   ├── recordings.py          # User recordings
│   └── tts.py                 # Text-to-Speech
└── static/
    ├── audio/cambridge/
    └── visuals/
```

## Key Features Implemented (Jan 2, 2025)

### ✅ Real IELTS Computer-Delivered Interface
- **Dark Header Bar**:
  - IELTS logo + "Computer-Delivered Test"
  - Timer: "XX minutes left"
  - Settings button → Modal with text size & color themes
  - Help button → 3-tab modal (Information, Test help, Task help)
  - Hide button (Reading/Writing)
- **Section Navigation Bar**:
  - Exit Test button
  - Section tabs (Listening/Reading/Writing/Speaking)
  - "X / 40 answered" counter

### ✅ Settings Modal
- Text size: Standard / Large / Extra Large
- Colours: Standard / Yellow on black / Blue on white / Blue on cream

### ✅ Help Modal (3 Tabs)
- **Information**: Question types explained (Multiple Choice, T/F/NG, Gap Fill)
- **Test help**: Highlighting instructions
- **Task help**: Section-specific tips (dynamic based on current section)

### ✅ Reading Section
- Split screen: Passage (left) + Questions (right)
- Text highlighter (Yellow/Blue)
- Notes system
- Context menu (right-click)
- P1/P2/P3 passage navigation
- Review panel

### ✅ Writing Evaluation
- 4 criteria scores
- Examiner Comment
- Band 6 & Band 8 reference samples

### ✅ Results Page
- Expandable answer cards
- Locate in Passage
- Explanation
- Skill Tip

### ⏳ Pending
- Premium Speaking (Azure) with plan check
- Audio files for Listening
- IELTS 16, 18, 19 integration

## Test Credentials
- Email: test@ielts.com
- Password: admin123

## Session Updates (Jan 2, 2025)
1. ✅ Dark IELTS header bar
2. ✅ Settings modal (text size, colors)
3. ✅ Help modal with 3 tabs
4. ✅ Hide button for Reading/Writing
5. ✅ Reading split screen + highlighter
6. ✅ Notes system
7. ✅ Review panel
8. ✅ Results with Locate/Explain/Skill Tip
9. ✅ Answer keys for IELTS 17 Test 1
10. ✅ General Training unlocked in AI-Generated Tests
