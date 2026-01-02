# IELTS Practice Platform - Product Requirements Document

## Original Problem Statement
Build a comprehensive IELTS practice application using authentic Cambridge IELTS materials (Books 16, 17, 18, 19) with a computer-delivered test interface that includes all standard IELTS test features.

## Core Requirements
1. **Authentic Content**: All test content extracted directly from Cambridge IELTS PDFs
2. **Full Test Experience**: Computer-delivered interface with timers, audio, and all question types
3. **Visual Integration**: PDF-extracted images for Writing Task 1 (maps, charts, diagrams)
4. **Deep Evaluation**: AI-powered evaluation matching existing platform protocols
5. **Premium Features**: Azure pronunciation analysis for Booster/Pro users
6. **Real IELTS UI**: Split screen reading, highlighter, notes, review panel

## Architecture

### Frontend (React + Tailwind)
```
/app/frontend/src/pages/
├── CambridgeTestInterface.js  # Main test interface (Full + Skill modes)
│   - Split Screen Reading (Left: Passage, Right: Questions)
│   - Text Highlighter (Yellow/Blue)
│   - Notes System
│   - Context Menu (Right-click)
│   - Review Panel
├── CambridgeTestResults.js    # Test results with deep AI evaluation
│   - Expandable Answer Details
│   - Locate in Passage
│   - Explanation
│   - Skill Tip
├── QuestionBank.js            # Test selection with mode picker modal
└── Login.js                   # Authentication
```

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── content/cambridge_tests/ielts17/test1.py  # Test content + Answer Keys + Sample Answers
├── routes/
│   ├── cambridge.py           # Cambridge test API + Answer Keys + Writing Evaluation
│   ├── cambridge_speaking.py  # Speaking evaluation (FREE: GPT + Premium: Azure)
│   ├── audio.py               # Audio streaming
│   ├── recordings.py          # User recordings
│   └── tts.py                 # Text-to-Speech (ElevenLabs)
└── static/
    ├── audio/cambridge/       # IELTS audio files
    └── visuals/               # PDF-extracted images
```

## Key Features Implemented (Jan 2, 2025)

### ✅ Completed - IELTS 17 Test 1
- **Full Content**: All 4 sections (Listening, Reading, Writing, Speaking)
- **Answer Keys**: Complete keys for Listening (40 questions) and Reading (40 questions)
- **Sample Answers**: Band 6 and Band 8 samples for Writing Task 1 & 2 with examiner comments

### ✅ Reading Section - Real IELTS Interface
- **Split Screen Layout**: Left pane (Passage) + Right pane (Questions)
- **Text Highlighter**: Select text → Right-click → Highlight Yellow/Blue
- **Notes System**: Add notes to highlighted text
- **Passage Navigation**: P1, P2, P3 buttons
- **Review Panel**: Shows answered/unanswered questions, highlights, notes
- **Answer Progress**: "Answered: X / 40 questions"

### ✅ Speaking Section - State Machine
- Part 1: Topic display, per-question Listen/Record
- Part 2: Task Card + preparation timer
- Part 3: Themes display, 6 questions
- TTS via ElevenLabs

### ✅ Writing Evaluation Features
- 4 criteria scores (Task Achievement, Coherence, Lexical, Grammar)
- Examiner Comment (Cambridge style)
- Strengths and Areas for Improvement
- Vocabulary and Grammar notes
- Band 6 & Band 8 reference samples

### ✅ Results Page - Detailed Feedback
- **Expandable Answer Cards**: Click to see details
- **Locate in Passage**: Shows where answer is found
- **Explanation**: Why this is the correct answer
- **Skill Tip**: How to improve for this question type

### ⏳ Pending
- Premium Speaking (Azure) integration with plan check
- Audio files for Listening sections
- IELTS 16, 18, 19 integration (19 more tests)

## API Endpoints
- `GET /api/cambridge/test/{book}/{test}` - Fetch test data
- `GET /api/cambridge/answers/{book}/{test}` - Get answer key
- `GET /api/cambridge/sample-answers/{book}/{test}` - Get Band 6 & 8 writing samples
- `POST /api/cambridge/evaluate/writing` - Deep writing evaluation
- `GET /api/audio/cambridge/{book}/{filename}` - Stream audio
- `POST /api/tts/generate` - Generate TTS for speaking questions
- `POST /api/recordings/save` - Save user recordings

## Premium Features (Booster/Pro Plan)
- Azure Pronunciation Assessment
- Word-level accuracy analysis
- Prosody (rhythm/intonation) scores
- Detailed pronunciation feedback

## Test Credentials
- Email: test@ielts.com
- Password: admin123

## Session 2 Updates (Jan 2, 2025)
1. ✅ Reading Split Screen layout
2. ✅ Text Highlighter (Yellow/Blue)
3. ✅ Notes System
4. ✅ Context Menu for highlighting
5. ✅ Review Panel
6. ✅ Expandable Answer Details in Results
7. ✅ Locate in Passage feature
8. ✅ Explanation for each answer
9. ✅ Skill Tip for question types
10. ✅ Complete Listening/Reading answer keys
