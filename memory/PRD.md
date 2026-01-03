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
├── content/cambridge_tests/ielts17/
│   ├── test1.py               # IELTS 17 Test 1 data
│   ├── test2.py               # IELTS 17 Test 2 data
│   ├── test3.py               # IELTS 17 Test 3 data
│   └── test4.py               # IELTS 17 Test 4 data
├── routes/
│   ├── cambridge.py           # Cambridge test API + evaluations
│   ├── cambridge_speaking.py  # Speaking evaluation (Free + Premium)
│   ├── qa_admin.py            # QA workflow & evidence pack routes (NEW)
│   └── test_admin.py          # Test debug & validation routes
├── services/
│   ├── test_normalizer.py     # Converts raw test data to canonical format
│   ├── practice_service.py    # MICRO-BASED practice mode (status-filtered)
│   ├── stats_aggregator.py    # Auto-computes stats (status-filtered)
│   ├── qa_workflow_service.py # QA approval workflow (NEW)
│   └── evidence_pack_generator.py # Evidence pack generator (NEW)
├── schemas/
│   ├── test_package.py        # Canonical test schema
│   ├── visual_asset.py        # Visual asset & AI blocker schema (NEW)
│   └── qa_workflow.py         # QA workflow schema (NEW)
└── writing_evaluator.py       # Core writing evaluation protocols
```

## QA Workflow System (NEW - January 3, 2025)

### HARD GUARANTEES IMPLEMENTED:

#### A) AI Visual Generation BANNED
- Runtime guard blocks any visual with `source=ai_generated`
- Forbidden markers: `dalle`, `midjourney`, `stable-diffusion`, `openai`, `gpt-image`, `nano-banana`
- Only `user_upload` or `pdf_crop` sources allowed
- Validation endpoint: `POST /api/admin/qa/validate/visual`

#### B) Test Status Workflow
```
DRAFT → FAILED_VALIDATION → PENDING_QA → APPROVED → PUBLISHED
```
- Only APPROVED/PUBLISHED tests appear in user-facing lists
- Only APPROVED/PUBLISHED tests feed into practice pools
- Content changes after APPROVED reverts to PENDING_QA

#### C) Speaking Part 2 Cue Card Hard Gate
- Must have: topic (min 10 chars), bullets (min 2), timing_note
- If missing → FAILED_VALIDATION
- Editor endpoint: `POST /api/admin/qa/cuecard/edit`

#### D) Evidence Pack for Human QA
- Auto-generated PDF vs UI comparison evidence
- Includes: Reading passages, Writing prompts/visuals, Speaking cue cards, Listening audio status
- Approval gate: `POST /api/admin/qa/approve`

### QA Admin API Endpoints:
- `GET /api/admin/qa/evidence/{test_id}` - Full evidence pack
- `GET /api/admin/qa/status/all` - All test statuses
- `GET /api/admin/qa/publishable` - Only publishable tests
- `POST /api/admin/qa/approve` - Approve test for publication
- `POST /api/admin/qa/publish/{test_id}` - Publish approved test
- `GET /api/admin/qa/visuals/{test_id}/slots` - Required visual slots
- `POST /api/admin/qa/visuals/attach` - Attach visual (user_upload/pdf_crop only)
- `GET /api/admin/qa/cuecard/{test_id}` - Get cue card
- `POST /api/admin/qa/cuecard/edit` - Edit cue card
- `GET /api/admin/qa/validate/{test_id}` - Full validation
- `POST /api/admin/qa/validate/visual` - Validate visual source

## Completed Features (January 3, 2025)

### ✅ IELTS 17 Test 4 - COMPLETE (Full Ingestion + Fixes)
- **All 4 skills fully functional with 37/37 tests passed (24 base + 13 fixes)**
- **Listening Section**: 4 parts, 40 questions, audio files working
  - Part 1: Easy Life Cleaning Services (Q1-10) - note_completion
  - Part 2: Hotel Staff Turnover (Q11-20) - multiple_choice, matching
  - Part 3: Sporting Activities Discussion (Q21-30) - multiple_selection, matching
  - Part 4: Maple Syrup (Q31-40) - note_completion
- **Reading Section**: 3 passages with full text (500+ chars each)
  - Passage 1: Bats to the rescue (Q1-13) - true_false_not_given, note_completion
  - Passage 2: Does education fuel economic growth? (Q14-26) - section_matching, sentence_completion, multiple_selection
  - Passage 3: Timur Gareyev – blindfold chess champion (Q27-40) - section_matching, true_false_not_given, **summary_completion** (Q37-40 fixed)
  - **Q37-40 FIX**: Changed to summary_completion type with unified paragraph and text inputs
  - **Answer Keys FIX**: Q37=memory, Q38=numbers, Q39=communication, Q40=visual
- **Writing Section**: 2 tasks
  - Task 1: Line graph - Shop closures and openings 2011-2018 (**original PDF visual - not AI generated**)
  - Task 2: Opinion essay - Alternative medicines
- **Speaking Section**: 3 parts with correct Task Card display
  - Part 1: Maps topic (4 questions)
  - Part 2: Describe an occasion when you had to do something in a hurry (**bullets fixed to display properly**)
  - Part 3: Arriving late, Managing study time (6 questions)
- **Answer Keys**: 40 listening + 40 reading answers complete
- **Debug Endpoint**: Returns VALID status with no issues

### ✅ IELTS 17 Test 3 - COMPLETE (Full Ingestion + Fixes)
- **All 4 skills fully functional with correct rendering**
- **Listening Section**: 4 parts, 40 questions, audio files working
- **Reading Section**: 3 passages with full text displayed correctly
  - Passage 1: The thylacine
  - Passage 2: Palm oil (with paragraph headings A-H)
  - Passage 3: Building the Skyline
- **Writing Section**: 2 tasks, Task 1 bar chart visual working
- **Speaking Section**: 3 parts with correct Task Card display for Part 2
- **Fixed**: `text` → `passage_text` field mapping
- **Fixed**: `cue_card` → `task_card` field mapping

### ✅ Test Data Contract System - COMPLETE
- `/app/backend/schemas/test_package.py`: Canonical schema with strict validation
- `/app/backend/services/test_normalizer.py`: Converts raw test data to canonical format
- `/app/backend/services/practice_service.py`: MICRO-BASED practice mode
- `/app/backend/services/stats_aggregator.py`: Auto-computes stats
- `/app/backend/routes/test_admin.py`: Debug/validation API endpoints

### Admin API Endpoints
- `GET /api/admin/tests/list` - List all tests with status
- `GET /api/admin/tests/debug/{test_id}` - Debug info for a test
- `GET /api/admin/tests/validate/{test_id}` - Validate a test against schema
- `GET /api/admin/tests/stats` - Auto-computed aggregate stats
- `GET /api/admin/tests/practice/pool-stats` - Practice pool statistics
- `GET /api/admin/tests/practice/random?skill=X` - Get micro-based practice questions

## Test Credentials (PERMANENT)
```
Email: test@ieltsace.com
Password: TestPassword123!
Plan: Pro (Premium features enabled)
```
Stored in: `/app/memory/TEST_CREDENTIALS.md`

## Cambridge IELTS 17 Content Status
| Test | Status | Tests Passed | Notes |
|------|--------|--------------|-------|
| Test 1 | ✅ Complete | - | All 4 skills |
| Test 2 | ✅ Complete | - | All 4 skills |
| Test 3 | ✅ Complete | - | All 4 skills, fixed data structure |
| Test 4 | ✅ Complete | 24/24 | All 4 skills, tested January 3, 2025 |

## Pending Tasks

### P0: Completed (January 3, 2025)
- ✅ **Game Bank & Practice Mode Expansion** - 6 mini-game types with 12 vocabulary topics
- ✅ **Lesson Progress Visibility** - Progress bars and checkmarks added to all courses
- ✅ **Kid-Friendly UX for Beginner Course** - Fun language, encouraging messages
- ✅ **Multi-Language System (Phase 1)** - Game Bank fully supports EN/VI/TR

### P0: In Progress - Multi-Language Control System
- ✅ **Phase 1**: Core helpers (getLocalizedText, langGuard, leakDetection) - DONE
- ✅ **Phase 2**: Game Bank fully multi-language - DONE
- ✅ **Phase 3**: Dashboard already multi-language - VERIFIED
- ✅ **Phase 4**: BeginnerCourse multi-language UI - DONE
- ✅ **Phase 5**: Language leak watcher in App.js - DONE
- ✅ **Phase 6**: Backend language_utils.py for AI prompts - DONE

### P1: Content Library Expansion (ON HOLD per user request)
- Cambridge IELTS 18 (all 4 tests) - waiting for user to provide PDF/audio
- Cambridge IELTS 16, 19 content - waiting for user to provide PDFs/audio

### P2: Session Persistence Bug
- Frontend localStorage session restoration issue (known bug)

## Bug Fixes (January 3, 2025)

### ✅ Listening Test Q31-32 Part Display Fix - COMPLETE
- **Issue**: Q31-32 were incorrectly showing under Part 3 instead of Part 4
- **Root Cause**: Frontend used array index slicing (`slice((currentPart-1)*10, currentPart*10)`) instead of filtering by `section` field
- **Fix Applied**: Changed to `filter(q => q.section === currentPart)` in `/app/frontend/src/pages/TestInterface.js`
- **Affected Lines**: 1286-1289 (Question Numbers Grid), 1364-1367 (Questions List)
- **Result**: Questions now correctly grouped by their `section` field from backend data

### ✅ Landing Page Turkish Translation - COMPLETE  
- All landing page sections fully translated to Turkish in `/app/frontend/src/lib/i18n.js`
- Verified sections: Hero, Methodology, Comparison, Practical Learning, Skills, Who For, Complete Prep, Honesty Promise, Footer, Auth modals

### ✅ Beginner Course Pronunciation Check - TESTED & WORKING (January 3, 2025)
- **Backend API Tests**: 13/13 passed (100%)
  - `GET /api/beginner/pronunciation/words/{topic}` - Returns words with phonetic guides (IPA + simplified)
  - `POST /api/beginner/pronunciation/assess` - Azure Speech SDK integration working
  - Topics supported: family, food, daily_life, greetings
- **Frontend UI Verified**:
  - Vocabulary section with Listen (speaker) and Mic (record) buttons
  - Star rating feedback UI (1-5 stars)
  - Feedback includes: main_feedback, encouragement, tips, word_feedback
  - Microphone permission handling with graceful error messages
- **Backend Fix Applied**: None score handling in `beginner_pronunciation.py`
- **Test Report**: `/app/test_reports/iteration_10.json`

### ✅ Vocabulary & Grammar Course - COMPLETE (January 3, 2025)
- **Course Structure**: 30 Units, 255 Items, 90 Quizzes
  - Foundation (Band 4.5-): 14 units, 105 items
  - Development (Band 5.0-6.5): 8 units, 75 items
  - Advanced (Band 7.0+): 8 units, 75 items
- **Backend APIs**: 28/28 tests passed (100%)
  - `GET /api/vocab-grammar/lessons` - Course lessons with vocabulary and grammar
  - `GET /api/question-bank/grammar-vocab/quizzes` - Quiz questions with filters
  - `GET /api/question-bank/grammar-vocab/units` - Units grouped by band level
  - `POST /api/question-bank/grammar-vocab/evaluate` - Quiz evaluation with explanations
- **Frontend Pages**:
  - `VocabGrammarCourse.js` - Band selection, lessons list, lesson detail (word, IPA, definition, examples, collocations, IELTS tips, pronunciation, flashcards, quiz)
  - `VocabGrammarQuiz.js` - Quiz interface with band filters, progress, questions, answer checking, explanations, weak areas
- **Integration**: Question Bank → Grammar & Vocab redirects to dedicated quiz page
- **Test Report**: `/app/test_reports/iteration_11.json`

## Completed Features (January 3, 2025)

### ✅ Multi-Language Control System - COMPLETE
- **150/150 backend tests passed** - Language purity verified
- **Language Lock System**: `/app/frontend/src/lib/languageLock.js`
  - `isEnglishLockedRoute(pathname)` - Check if route is English-only
  - `getEffectiveLanguage(pathname, systemLanguage)` - Get effective language for route
  - `getEnglishOnlyNotice(systemLanguage)` - Get localized notice for EN-only sections
  - English-locked routes: TestInterface, MasteryCourse, AdvancedMasteryCourse, practice pages
- **Language Helper**: `/app/frontend/src/lib/getLocalizedText.js`
  - `getLocalizedText(obj, lang, options)` - Main localization function
  - `getText(obj, lang)` - Simple text getter
  - `getContentWithSupport(obj, lang)` - Content with EN support for VI/TR
  - `hasLocalizedContent(obj, lang)` - Check if content exists
  - `filterByLanguage(items, lang, field)` - Filter arrays by language
- **Language Guard**: `/app/frontend/src/lib/langGuard.js`
  - `LocalizedBlock` - React component for localized content
  - `LocalizedText` - Simple text component
  - `LanguageEmptyState` - Empty state for missing translations
- **Leak Detection**: `/app/frontend/src/lib/leakDetection.js`
  - `detectLanguageLeak(text, lang)` - Detect forbidden characters
  - `scanDomForLanguageLeaks(lang)` - DOM scanner for dev mode
  - `LanguageLeakWatcher` component in App.js (route-aware)
- **Backend Utils**: `/app/backend/routes/language_utils.py`
  - `get_language_prompt_guard(lang)` - AI prompt language guards
  - `get_ai_system_message(lang, role)` - Localized system messages
  - `get_feedback_labels(lang)` - Localized feedback labels
- **Game Bank**: Fully multi-language (12 topics × 8 words × 3 languages)
- **Route-based Language Rules**:
  - **EN/VI/TR**: Dashboard, BeginnerCourse, GameBank, general site
  - **EN-only**: TestInterface, MasteryCourse, AdvancedMasteryCourse, practice pages
- **Language Purity Verified**:
  - EN: No Turkish (ğüşıöç) or Vietnamese (ăâêôơưđ) characters
  - TR: No Vietnamese characters allowed
  - VI: No Turkish characters allowed

### ✅ Game Bank Feature - COMPLETE
- **Backend API**: `/api/games/*` with 6 game types and 12 vocabulary topics
  - GET `/api/games/list?lang=X` - Lists games and topics in specified language
  - GET `/api/games/play/{game_type}?topic=X&count=N&lang=X` - Generates localized game
  - POST `/api/games/submit/{game_id}?lang=X` - Returns localized results
- **Game Types**: matching_pairs, spelling_bee, true_false, word_race, lucky_wheel, fishing
- **Topics (12)**: family, food, animals, colors, numbers, school, weather, travel, health, jobs, home, ielts_academic
- **Frontend**: `/game-bank` route with i18n integration
- **Dashboard Integration**: "Quick Games" section with featured games

### ✅ Lesson Progress Tracking - COMPLETE
- **Progress Tracker Library**: `/app/frontend/src/lib/progressTracker.js`
- **Features**: markSectionComplete, getLessonProgress, isLessonCompleted, getCourseProgress, isSectionCompleted
- **Implemented in**: BeginnerCourse.js, MasteryCourse.js, AdvancedMasteryCourse.js
- **UI Elements**: Progress bars on lesson cards, checkmarks for completed sections

### ✅ Kid-Friendly UX for Beginner Course - COMPLETE
- Fun title: "Let's Learn English!" with animated star icon
- Encouraging subtitle: "Your Adventure Starts Here! 🚀"
- Friendly welcome message with emojis
- Enhanced vocabulary section with "New Words to Learn!" header
- Quiz results with tiered feedback messages (WOW!/Super Job!/Good Try!/Nice Effort!)
- Listening results with kid-friendly language

## Future Tasks
- Shorts-style practice mode on landing page
- Course lesson game elements
- YLE (Starters, Movers, Flyers) content
- Speaking Practice auto-record flow refinement
- Beginner Course pronunciation check full testing

## Key Files Reference
- `/app/backend/routes/game_bank.py` - Game Bank API routes (NEW)
- `/app/frontend/src/pages/GameBank.js` - Game Bank UI with 6 game types (NEW)
- `/app/frontend/src/lib/progressTracker.js` - Progress tracking utility (NEW)
- `/app/frontend/src/pages/BeginnerCourse.js` - Kid-friendly UX + progress tracking
- `/app/frontend/src/pages/MasteryCourse.js` - Progress tracking
- `/app/frontend/src/pages/AdvancedMasteryCourse.js` - Progress tracking
- `/app/backend/content/cambridge_tests/ielts17/test4.py` - Test 4 data
- `/app/frontend/src/pages/CambridgeTestResults.js` - Results page
- `/app/frontend/src/pages/CambridgeTestInterface.js` - Test interface
- `/app/frontend/src/pages/QuestionBank.js` - Test selection
- `/app/backend/routes/cambridge.py` - Backend routes with full-test evaluation
- `/app/tests/test_ielts17_test4.py` - Test 4 API tests (24 tests)
- `/app/tests/test_game_bank.py` - Game Bank API tests (40 tests) (NEW)

## Test Reports
- `/app/test_reports/iteration_12.json` - Audio Transcription Fix (January 3, 2025) - 13/13 tests passed
- `/app/test_reports/iteration_11.json` - Vocabulary & Grammar Feature test results
- `/app/test_reports/iteration_10.json` - Beginner Pronunciation test results
- `/app/test_reports/iteration_8.json` - Game Bank comprehensive test results
- `/app/test_reports/iteration_6.json` - Test 4 comprehensive test results
- `/app/test_reports/pytest/transcription_results.xml` - Transcription endpoints pytest results (NEW)
- `/app/test_reports/pytest/game_bank_results.xml` - Game Bank pytest results
- `/app/test_reports/pytest/test4_results.xml` - Test 4 pytest results

## Bug Fixes (January 3, 2025 - Latest Session)

### ✅ Audio Transcription Route Conflict Fix - COMPLETE
- **Issue**: User reported ALL audio recording and evaluation features broken across the app
- **Root Cause**: Multiple frontend files were calling `/api/speaking/transcribe` with incorrect parameters. The speaking_qb.py endpoint expects `audio`, `question_id`, `part` but most pages were sending just `file`.
- **Fix Applied**: 
  - Main transcription endpoint renamed to `/api/transcribe-audio` in `server.py`
  - Updated 5 frontend files to use the correct endpoint:
    - `SpeakingPractice.js`
    - `ComprehensiveLevelTest.js`
    - `MasteryCourse.js`
    - `LevelTest.js`
    - `lib/api.js` (transcribeAudio function)
  - `BeginnerCourse.js` was already correct
  - `SpeakingPracticeQB.js` correctly uses `/api/speaking/transcribe` with proper params
- **Endpoint Mapping**:
  - `/api/transcribe-audio`: Simple transcription (file → {text, language})
  - `/api/speaking/transcribe`: QB-specific (audio, question_id, part → {success, transcript})
- **Test Results**: 13/13 backend tests passed (100%)
- **Test Report**: `/app/test_reports/iteration_12.json`

### ✅ Landing Page "Try our courses" Update - COMPLETE
- **Issue**: Landing page courses modal didn't show the new "Vocabulary & Grammar" course
- **Fix Applied**: Added Vocabulary & Grammar course to COURSES array in `LandingPage.js`
- **Verified**: Screenshot confirmed course appears in modal with correct details (Band 4.5 - 7.0+, 30 units, 250+ items)
