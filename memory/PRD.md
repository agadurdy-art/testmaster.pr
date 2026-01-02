# IELTS Practice Platform - Product Requirements Document

## Original Problem Statement
Build a comprehensive IELTS practice application using authentic Cambridge IELTS materials (Books 16, 17, 18, 19) with a computer-delivered test interface that includes all standard IELTS test features. The results page must be the final link in the learning chain - user takes test → sees results → understands weaknesses → gets directed to relevant courses.

## Core Requirements
1. **Authentic Content**: All test content extracted directly from Cambridge IELTS PDFs
2. **Full Test Experience**: Computer-delivered interface with timers, audio, and all question types
3. **Deep Evaluation**: AI-powered evaluation matching existing platform protocols
4. **Learning Chain**: Results page connects to courses/lessons for weak areas
5. **Premium Features**: Azure pronunciation analysis for Booster/Pro users

## Architecture

### Frontend (React + Tailwind)
```
/app/frontend/src/pages/
├── CambridgeTestInterface.js  # Full IELTS Computer-Delivered interface
├── CambridgeTestResults.js    # Comprehensive results with AI feedback
├── QuestionBank.js            # Test selection
└── Results.js                 # Reference for correct results UI
```

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── content/cambridge_tests/ielts17/test1.py
├── routes/
│   ├── cambridge.py           # Cambridge test API + evaluations
│   ├── cambridge_speaking.py  # Speaking evaluation (Free + Premium)
│   └── speaking_qb.py         # Core speaking evaluation protocols
└── writing_evaluator.py       # Core writing evaluation protocols
```

## Completed Features (January 2, 2025)

### ✅ Cambridge Test Results Page - COMPLETE
**Backend API: `/api/cambridge/evaluate/full-test`**
Returns comprehensive evaluation data:
- `scores` - Listening, Reading, Overall with band scores
- `skill_breakdown` - Question type accuracy analysis
- `teacher_feedback` - AI-generated short and detailed feedback
- `recommended_lessons` - Courses based on weak areas
- `question_results` - Detailed per-question results with explanations

**Frontend Features:**
1. **Overall Band Score Card**: 4-skill breakdown (L/R/W/S)
2. **AI Teacher Feedback Section**:
   - Short summary paragraph
   - Strengths section (skills with ≥70% accuracy)
   - Areas to Improve section (skills with <50% accuracy)
   - Detailed tips and recommendations
   - Skill-specific practice recommendations
3. **Recommended Lessons Card**:
   - Lessons based on weak question types
   - Priority badges for critical weaknesses
   - Direct navigation to course content
4. **Listening Answer Review** (expandable):
   - Question type labels
   - Your Answer vs Correct Answer
   - Explanation for wrong answers
   - Skill Tips
5. **Reading Answer Review** (expandable):
   - Locate in Passage excerpts
   - Explanation
   - Skill Tips
6. **Skill Breakdown Chart**:
   - Accuracy percentage bars per question type
   - Color-coded (green ≥70%, yellow ≥50%, red <50%)
7. **Writing Evaluation**:
   - AI-powered evaluation button
   - 4 criteria scores
   - Teacher's Feedback
   - Strengths and Areas to Improve
8. **Speaking Section**: Premium Azure analysis display
9. **Action Buttons**: More Tests, Study Weak Areas, Retake Test

### ✅ Backend Test Results: 16/16 Tests Passed
- `/api/cambridge/books` - List available books
- `/api/cambridge/test/{book_id}/{test_id}` - Full test content
- `/api/cambridge/answers/{book_id}/{test_id}` - Answer keys
- `/api/cambridge/evaluate/full-test` - Comprehensive evaluation
- `/api/cambridge/evaluate/writing` - Writing evaluation

### ✅ Premium Speaking Integration
- Frontend sends `user_plan` to speaking endpoint
- Pro/Booster users get Azure pronunciation analysis
- Results page displays Azure scores when available

## Test Credentials (PERMANENT)
```
Email: test@ieltsace.com
Password: TestPassword123!
Plan: Pro (Premium features enabled)
```
Stored in: `/app/memory/TEST_CREDENTIALS.md`

## API Endpoints

### Cambridge Test API
- `GET /api/cambridge/books` - List all Cambridge books
- `GET /api/cambridge/test/{book_id}/{test_id}` - Get full test content
- `GET /api/cambridge/answers/{book_id}/{test_id}` - Get answer key
- `POST /api/cambridge/evaluate/full-test` - **NEW** Comprehensive evaluation
- `POST /api/cambridge/evaluate/writing` - Evaluate writing response

### Response Format for `/evaluate/full-test`
```json
{
  "success": true,
  "scores": {
    "listening": { "correct": 30, "total": 40, "band": 7.0, "percentage": 75 },
    "reading": { "correct": 28, "total": 40, "band": 6.5, "percentage": 70 },
    "overall": { "correct": 58, "total": 80, "band": 7.0, "percentage": 72.5 }
  },
  "skill_breakdown": [
    { "skill_id": "listening_note_completion", "label": "Listening - Note Completion", "correct": 8, "total": 10, "tip": "..." }
  ],
  "teacher_feedback": {
    "short": "Good performance overall...",
    "detailed": "Focus on True/False/Not Given questions..."
  },
  "recommended_lessons": [
    { "lesson_id": "tfng-mastery", "title": "T/F/NG Mastery", "route": "/mastery?section=reading&lesson=tfng", "reason": "...", "priority": "high" }
  ],
  "question_results": {
    "listening": [...],
    "reading": [...]
  }
}
```

## Pending Tasks

### P2: Content Library Expansion
- IELTS 16, 18, 19 content (waiting for user to provide PDFs/audio)

### P3: Session Persistence Bug
- Frontend localStorage session restoration issue

## Future Tasks
- Shorts-style practice mode on landing page
- Course lesson game elements
- YLE (Starters, Movers, Flyers) content

## Key Files Reference
- `/app/frontend/src/pages/CambridgeTestResults.js` - Results page (COMPLETE)
- `/app/frontend/src/pages/CambridgeTestInterface.js` - Test interface
- `/app/backend/routes/cambridge.py` - Backend routes with full-test evaluation
- `/app/backend/routes/cambridge_speaking.py` - Speaking evaluation
- `/app/tests/test_cambridge_results.py` - API tests (16 tests)
