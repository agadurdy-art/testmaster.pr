# testmaster.pro — Complete Project Documentation

## Overview
**testmaster.pro** is a full-stack AI-powered IELTS & Cambridge exam preparation platform. It provides structured courses (Beginner → Mastery → Advanced), AI evaluation, question banks, practice tests, and an AI teacher (Liz).

**Tech Stack:** React 18 + FastAPI + MongoDB + Emergent LLM (OpenAI/Claude) + ElevenLabs + PayPal

**URL:** `https://testmaster.pro`

---

## Architecture

```
Frontend (React, port 3000)
    ↕ HTTPS via Kubernetes Ingress (/api → backend)
Backend (FastAPI, port 8001)
    ↕ PyMongo
MongoDB (ielts_database)
    ↕
External APIs: OpenAI GPT-4o/4o-mini, Claude Sonnet 4.5, ElevenLabs, PayPal, Azure Speech
```

---

## Directory Structure

```
/app
├── backend/
│   ├── server.py                          # Core app (~6260 lines) - startup, DB, remaining routes
│   ├── plan_access.py                     # Plan tiers, features, legacy aliases, normalization
│   ├── security_utils.py                  # Admin validation, upload safety, URL sanitization
│   ├── writing_evaluator.py               # Level test writing evaluation (band clamping)
│   ├── level_test_reading_data.py         # Server-side answer keys (never sent to frontend)
│   ├── comprehensive_questions.py         # Comprehensive level test question data
│   ├── comprehensive_test_data.py         # Writing/speaking prompts for comprehensive test
│   ├── adaptive_level_test_data.py        # Adaptive test question pool
│   ├── seed_mastery_course.py             # Mastery course seed data (17 modules)
│   ├── seed_advanced_mastery.py           # Advanced course seed data (20 modules)
│   ├── seed_beginner_english.py           # Beginner course seed data (14 lessons)
│   │
│   ├── routes/                            # Modular API routers
│   │   ├── auth.py                        # Auth: register, login, verify, reset, Google/Facebook OAuth
│   │   ├── admin.py                       # Admin: user CRUD, seeding, DB status, vocab image mgmt
│   │   ├── payments.py                    # PayPal orders/subscriptions, bank upload, plan info
│   │   ├── liz_teacher.py                 # Liz AI Teacher: chat, greet, homework, TTS/STT
│   │   ├── grammar_engine.py              # 5-stage grammar engine with validation
│   │   ├── question_bank.py               # QB: writing tasks, evaluation, model answers, reading, stats
│   │   ├── cambridge.py                   # Cambridge IELTS tests: evaluation, diagnostics, study plan
│   │   ├── full_test.py                   # Full mock tests: academic & general sets
│   │   ├── listening_qb.py                # Listening question bank & evaluation
│   │   ├── speaking_qb.py                 # Speaking practice & Azure pronunciation
│   │   ├── game_bank.py                   # Word games: crossword, word search, etc.
│   │   ├── tts.py                         # Text-to-Speech (ElevenLabs)
│   │   ├── audio.py                       # Audio file serving
│   │   ├── dual_track.py                  # Academic vs General training track
│   │   ├── visuals.py                     # Visual/chart generation for Task 1
│   │   ├── recordings.py                  # User recordings management
│   │   └── ... (28 route files total)
│   │
│   ├── services/                          # Business logic services
│   │   ├── model_answer_generator.py      # 3-layer model answers (Band 8 + Band 6 + Notes)
│   │   ├── lesson_registry.py             # Course recommendation engine
│   │   ├── authentic_task_generator.py    # Authentic IELTS task generation
│   │   ├── chart_generator.py             # SVG chart generation (line, bar, pie, table)
│   │   ├── ielts_evaluator.py             # Core IELTS evaluation logic
│   │   ├── tts_service.py                 # TTS service wrapper
│   │   ├── audio_generator.py             # ElevenLabs audio generation
│   │   └── ... (18 service files total)
│   │
│   ├── content/                           # Static test content
│   │   ├── cambridge_tests/               # IELTS 17 & 18 (4 tests each)
│   │   ├── full_tests/                    # Academic (8 sets) + General (4 sets)
│   │   ├── listening/                     # Listening test data
│   │   ├── reading/                       # Academic + General reading passages
│   │   └── speaking/                      # Speaking test prompts
│   │
│   ├── static/
│   │   ├── visuals/                       # 28 curated process/map images + generated charts
│   │   ├── audio/                         # Generated TTS audio files
│   │   └── vocab_images/                  # Vocabulary word images (617+)
│   │
│   └── tests/                             # 50+ test files
│
├── frontend/
│   ├── src/
│   │   ├── App.js                         # Main router (74 pages, React.lazy code-splitting)
│   │   │
│   │   ├── pages/                         # 74 page components
│   │   │   ├── LandingPage.js             # Marketing landing page
│   │   │   ├── Dashboard.js               # User dashboard
│   │   │   ├── BeginnerCourse.js          # Beginner course (14 lessons, A1-A2)
│   │   │   ├── MasteryCourse.js           # Mastery course (17 modules, B1-B2)
│   │   │   ├── AdvancedMasteryCourse.js   # Advanced course (20 modules, C1-C2)
│   │   │   ├── VocabularyLearnMode.js     # Vocabulary: Learn stage
│   │   │   ├── VocabularyPracticeMode.js  # Vocabulary: Practice stage
│   │   │   ├── VocabularyQuizMode.js      # Vocabulary: Quiz stage
│   │   │   ├── VocabularyProductionMode.js# Vocabulary: Production stage
│   │   │   ├── GrammarLearnMode.js        # Grammar: Learn slides
│   │   │   ├── GrammarPracticeMode.js     # Grammar: Practice exercises
│   │   │   ├── GrammarQuizMode.js         # Grammar: 10-question quiz
│   │   │   ├── GrammarProductionMode.js   # Grammar: Guided + Free production
│   │   │   ├── GrammarSmartReview.js      # Grammar: AI-powered weak area review
│   │   │   ├── WritingTask1Practice.js    # Academic Writing Task 1 (charts/maps/process)
│   │   │   ├── WritingTask2Practice.js    # Academic Writing Task 2 (essay)
│   │   │   ├── GeneralTask1Practice.js    # General Writing Task 1 (letter)
│   │   │   ├── GeneralTask2Practice.js    # General Writing Task 2 (essay)
│   │   │   ├── ReadingPracticeAcademic.js # Academic reading practice
│   │   │   ├── ReadingPracticeGeneral.js  # General reading practice
│   │   │   ├── ListeningPractice.js       # Listening practice with audio
│   │   │   ├── SpeakingPracticeQB.js      # Speaking practice with recording
│   │   │   ├── QuestionBank.js            # Question bank hub
│   │   │   ├── LevelTest.js               # Quick level test
│   │   │   ├── ComprehensiveLevelTest.js  # Full 4-skill level test
│   │   │   ├── AdaptiveLevelTest.js       # AI-adaptive level test
│   │   │   ├── CambridgeTestInterface.js  # Cambridge IELTS test interface
│   │   │   ├── CambridgeTestResults.js    # Cambridge results with diagnostics
│   │   │   ├── FullTestInterface.js       # Full mock test interface
│   │   │   ├── FullTestResults.js         # Full test results
│   │   │   ├── LizTeacher.js              # AI Teacher Liz chat interface
│   │   │   ├── PricingPage.js             # Subscription plans
│   │   │   ├── AdminPanel.js              # Admin dashboard
│   │   │   ├── Profile.js                 # User profile
│   │   │   └── ... (74 total)
│   │   │
│   │   ├── components/                    # Shared components
│   │   │   ├── ErrorBoundary.js           # Global error handler
│   │   │   ├── LizFloatingButton.js       # Floating Liz chat button
│   │   │   ├── MobileBottomNav.js         # Mobile navigation
│   │   │   ├── EvaluationResult.js        # Writing evaluation display
│   │   │   ├── PronunciationRecorder.js   # Audio recorder for speaking
│   │   │   └── ui/                        # Shadcn/UI components
│   │   │
│   │   ├── lib/                           # Utility libraries
│   │   │   ├── api.js                     # API client + Emergent OAuth
│   │   │   ├── planAccess.js              # Plan tier checking (frontend)
│   │   │   ├── lizAccess.js               # Liz Teacher access control
│   │   │   ├── recommendationRouting.js   # Lesson recommendation paths
│   │   │   ├── i18n.js                    # Internationalization
│   │   │   ├── languageLock.js            # English-only route enforcement
│   │   │   └── progressTracker.js         # Learning progress tracking
│   │   │
│   │   └── contexts/
│   │       └── ThemeContext.js             # Dark/light theme
│   │
│   └── public/                            # Static assets
│
└── memory/
    ├── PRD.md                             # Product requirements (this file's source)
    └── test_credentials.md                # Test account credentials
```

---

## Features

### 1. Three-Tier Course System
| Course | Level | Modules | Target Band |
|--------|-------|---------|-------------|
| Beginner English | A1-A2 | 14 lessons | 4.0-5.0 |
| IELTS Mastery | B1-B2 | 17 modules | 5.5-6.5 |
| Advanced Mastery | C1-C2 | 20 modules | 7.0-9.0 |

Each module contains: Vocabulary, Grammar, Reading, Writing, Speaking, Listening, Collocations, Idioms, Common Mistakes

### 2. Vocabulary Engine (4 stages per module)
- **Learn**: Flashcard slides with images, definitions, examples, audio
- **Practice**: Multiple choice, fill-in-the-blank, matching
- **Quiz**: 10-question assessment with A/B/C/D options
- **Production**: AI-evaluated open-ended responses

### 3. Grammar Engine (5 stages per module)
- **Learn**: Interactive slides explaining grammar rules
- **Practice**: Recognition, gap-fill, transformation, error correction
- **Quiz**: 10-question mixed-type quiz
- **Guided Production**: AI-guided structured writing prompts
- **Free Production**: Open-ended essay/response evaluated by AI
- **Smart Review**: AI identifies weak areas and generates targeted review

### 4. Writing Practice (Academic + General)
- **Task 1 Academic**: Line/bar/pie charts, tables, process diagrams, map comparisons
  - 28 curated static images for process/map (AI-generated visuals for others)
  - 3-layer model answers: Band 8 + Band 6 + Academic Notes
- **Task 2 Academic**: Opinion, discussion, problem/solution essays
- **Task 1 General**: Letter writing (formal/informal/semi-formal)
- **Task 2 General**: Essay writing
- **AI Evaluation**: Cambridge-aligned IELTS examiner criteria with:
  - 4-criteria scoring (TA/CC/LR/GRA)
  - Line-by-line corrections (original → corrected → explanation)
  - High priority fixes
  - Rewrite guidance (weakest paragraph, suggested opening)
  - Response diagnosis (main issue, band ceiling, quick win)
  - Server-side band enforcement (word count caps)
  - Off-topic detection

### 5. Reading Practice
- Academic: Advanced + Mastery level passages
- General: Advanced + Mastery level passages
- By question type: Matching headings, T/F/NG, MCQ, sentence completion, etc.

### 6. Listening Practice
- Audio-based questions with playback controls
- Multiple question types per section

### 7. Speaking Practice
- Part 1, 2, 3 practice with recording
- Azure Speech pronunciation assessment
- AI evaluation with fluency/pronunciation scores

### 8. Question Bank
- Organized by skill (Reading/Writing/Listening/Speaking)
- Band-calibrated questions
- Stats dashboard showing progress

### 9. Cambridge IELTS Tests
- IELTS 17 & 18 (4 tests each = 8 Cambridge tests)
- Full test simulation with timer
- Detailed results with:
  - Root cause analysis (error pattern categorization)
  - Study plan (3-day plan, retest strategy, target band)
  - Recommended lessons from courses

### 10. Full Mock Tests
- 8 Academic sets + 4 General sets
- 4-skill assessment (Reading, Writing, Listening, Speaking)
- Timed test environment
- Comprehensive results with recommendations

### 11. Level Tests
- **Quick Level Test**: Fast 15-minute assessment
- **Comprehensive Level Test**: Full 4-skill test with reading, writing, listening, speaking
- **Adaptive Level Test**: AI-driven difficulty adjustment

### 12. Liz AI Teacher
- Personal IELTS tutor chatbot
- Plan-gated access (Learner+ plans)
- Monthly message limits per plan
- Features: chat, homework assignment, greetings, voice input
- Models: gpt-4o-mini (default), gpt-4o (deep tasks)
- Azure pronunciation feedback for voice mode
- TTS/STT integration

### 13. Games
- Crossword puzzles
- Word search (drag-select)
- Vocabulary matching games

### 14. Plan System
| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | First lesson of each course, basic QB |
| Explorer | $4.99/mo | All beginner lessons, limited QB |
| Learner | $9/mo | All courses, Liz Teacher, full QB |
| Achiever | $19/mo | Everything + more Liz messages |
| Master | $29/mo | Everything unlimited |

### 15. Authentication
- Email/password (bcrypt) with email verification
- Google OAuth (Emergent-managed)
- Facebook OAuth
- Password reset via email (Resend)
- Transparent SHA-256 → bcrypt migration on login

### 16. Admin Panel
- User management (CRUD, plan changes, credit management)
- Course seeding controls
- DB status dashboard
- Vocabulary image manager
- Learning activity tracking per user

---

## Key API Endpoints

### Auth (`/api/auth/*`)
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login (bcrypt + SHA-256 migration)
- `GET  /api/auth/google/start`     — Begin Google OAuth (own client)
- `GET  /api/auth/google/callback`  — Google OAuth callback
- `POST /api/auth/google/session`   — Exchange single-use ticket for User
- `POST /api/auth/facebook-login` — Facebook OAuth
- `POST /api/auth/verify-email` — Email verification
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Reset with token

### Courses
- `GET /api/beginner-english/lessons` — All beginner lessons
- `GET /api/mastery-course/modules` — All mastery modules
- `GET /api/advanced-mastery/modules` — All advanced modules

### Vocabulary Engine
- `GET /api/vocabulary-engine/{module_id}/slides` — Learn mode data
- `GET /api/vocabulary-engine/{module_id}/practice` — Practice exercises
- `GET /api/vocabulary-engine/{module_id}/quiz` — Quiz questions
- `GET /api/vocabulary-engine/{module_id}/production` — Production prompts
- `POST /api/vocabulary-engine/{module_id}/evaluate` — AI evaluation

### Grammar Engine (`/api/grammar-engine/*`)
- `GET /{module_id}/learn` — Learn slides
- `GET /{module_id}/practice` — Practice exercises
- `GET /{module_id}/quiz` — Quiz questions
- `GET /{module_id}/guided-production` — Guided prompts
- `GET /{module_id}/free-production` — Free prompts
- `POST /{module_id}/evaluate` — AI evaluation
- `POST /{module_id}/smart-review` — Weak area review

### Writing Practice (`/api/question-bank/writing/*`)
- `GET /task1/generate-authentic` — Generate Task 1 visual + task
- `GET /task1/model-answer/{task_id}` — Get 3-layer model answer
- `POST /evaluate` — AI evaluation (Task 1 or Task 2)
- `GET /task2/prompts` — Task 2 essay prompts
- `GET /task2/model-answers/{essay_type}` — Task 2 model answers

### Liz Teacher (`/api/liz/*`)
- `POST /chat` — Send message to Liz
- `POST /greet` — Get personalized greeting
- `GET /status/{user_id}` — Plan status, usage, model info
- `POST /tts` — Text to speech
- `POST /stt` — Speech to text
- `GET /homework/{user_id}` — Homework list

### Cambridge & Full Tests
- `GET /api/cambridge/books` — Available Cambridge test books
- `POST /api/cambridge/evaluate/full-test` — Evaluate with diagnostics
- `GET /api/full-test/sets` — Available mock test sets
- `POST /api/full-test/evaluate` — Evaluate mock test

### Payments (`/api/payments/*`)
- `POST /paypal/create-order` — Create PayPal order
- `POST /paypal/capture-order` — Capture payment
- `POST /paypal/activate-subscription` — Activate subscription
- `POST /bank/upload` — Bank transfer screenshot
- `GET /plan/features` — All plan features & prices

---

## Database Collections (MongoDB)

| Collection | Purpose |
|------------|---------|
| `users` | User accounts, plans, credits |
| `beginner_english_lessons` | 14 beginner lessons |
| `mastery_course_modules` | 17 mastery modules |
| `advanced_mastery_modules` | 20 advanced modules |
| `test_attempts` | All test results/scores |
| `liz_sessions` | Liz Teacher chat history |
| `liz_homework` | Homework assignments |
| `grammar_engine_cache` | Cached grammar content |
| `kofi_events` | Payment audit log |
| `password_resets` | Password reset tokens |
| `email_verifications` | Email verification tokens |
| `unified_stages/units/lessons` | Learning platform structure |
| `liz_lesson_intros` | Cached lesson introductions |

---

## Environment Variables

### Backend (`/app/backend/.env`)
- `MONGO_URL` — MongoDB connection string
- `DB_NAME` — Database name (ielts_database)
- `EMERGENT_LLM_KEY` — Universal LLM key (OpenAI/Claude/Gemini)
- `ELEVENLABS_API_KEY` — Text-to-speech
- `AZURE_SPEECH_KEY` — Pronunciation assessment
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` — PayPal Live
- `RESEND_API_KEY` — Email sending
- `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` — Facebook OAuth

### Frontend (`/app/frontend/.env`)
- `REACT_APP_BACKEND_URL` — Backend API base URL

---

## Security
- Passwords: bcrypt (auto-migrated from SHA-256)
- Level test answers: server-side only (never sent to frontend)
- Admin routes: email-based access control via `security_utils.py`
- File uploads: extension validation (blocks .exe, .sh, etc.)
- CORS: tightened to specific origins
- `password_hash` excluded from all API responses

---

## Performance
- React.lazy() code-splitting: 74 pages loaded on demand
- Grammar engine cache: DB-backed with validation
- Model answer cache: per-task caching
- Static file serving: `/api/static/visuals/`, `/api/static/audio/`
- gpt-4o-mini for cost-sensitive operations, gpt-4o for deep evaluation

---

## Admin Accounts
- `aga.durdy@gmail.com`
- `admin@ieltsace.com`
- `stemhousebenluc@gmail.com`

## Test Account
- Email: `tester@test.com` / Password: `tester123`
