# IELTS Ace - AI-Powered English Learning Platform

## Original Problem Statement
A full-stack English learning platform (IELTS focused) with React frontend, FastAPI backend, and MongoDB. The platform provides structured learning stages with vocabulary, grammar, games, and AI-powered features.

## Architecture
- **Frontend:** React (port 3000)
- **Backend:** FastAPI (port 8001)
- **Database:** MongoDB (ielts_database)
- **Key Integrations:** PayPal, Claude Sonnet 4.5, OpenAI GPT Image 1, ElevenLabs, Whisper

## What's Been Implemented

### Core Features
- Multi-stage learning platform (8 stages, 24 units, 96 lessons)
- Vocabulary with images, definitions, examples
- Games: Crossword (rewritten), and others
- Admin Panel at /admin with Vocabulary Image Manager and User Management
- Auto-seeding system (idempotent, preserves data)
- Data persistence via source JSON files

### Completed (This Session - March 8, 2026)
- P0: 100% vocabulary image coverage achieved (617/617 words)
  - 14 new images generated (always, can't, dancing, dirty, drawing, drinking, floor, funny, game, grey, guitar, knees, listening to music, never, new)
  - 5 existing images linked (big, big ears, clean, long neck, grey)
  - Updated: mapping files, enriched JSON source files, database
- White Screen Fix: 3-layer protection for lesson page stability
  - Global ErrorBoundary: Catches any unhandled crash, shows friendly reload UI (English)
  - ActivityErrorBoundary: Catches activity-level crashes without losing lesson progress, offers "Retry" and "Skip" (English)
  - localStorage progress persistence: Lesson progress (completed activities, scores) saved locally, survives page reload (24h expiry)
  - fetchRetry: All API calls in lesson page retry 2x on network failure with exponential backoff
  - ROOT CAUSE FIX: Added null/empty array guards to ALL 14+ game components (vocab, grammar, review) preventing crashes from missing data
  - Verified: Board game items use question/answer format (not word/sentence) - all games now handle both formats safely
- Mastery Course Interactive Vocabulary Engine integration (31/31 tests passed)
  - Vocabulary engine (Learn, Practice, Quiz, Production modes) now works for Mastery Course
  - Backend: vocabulary-engine endpoints check both advanced_mastery_modules and mastery_course_modules
  - Mastery vocab data (nouns/verbs/adjectives/adverbs/collocations/idiom) transformed to slide format
  - Practice: fill_blank + matching exercises auto-generated from mastery vocab data
  - Frontend: MasteryCourse.js has "Interactive Vocabulary Practice" buttons
  - No regression: Advanced Mastery vocabulary engine still works
- Word Search game REWRITTEN: Drag-select mechanism replacing buggy click-toggle
  - Pointer events (pointerDown/Move/Up) for natural swipe selection
  - Straight line validation (horizontal, vertical, diagonal)
  - Full word names displayed (truncation removed)
- Crossword game direction fix: isAutoAdvancing ref prevents direction switching at intersections during auto-advance
- Audio loop fix: All listening/TTS audio now stops on activity change and component unmount
  - ListeningActivity: audioRef with pause/cancel cleanup
  - VocabularyLearning: vocabAudioRef with playback tracking
  - Main component: speechSynthesis.cancel() on every activity switch
  - Game components (ListenWrite, ListenChooseWord, ListenChoosePicture, AnimalSounds): useEffect cleanup + dependency fix
- Mastery Course listening topic mismatch fixed: 9 modules had wrong listening content
  - 16/17 modules now correctly matched (6↔7, 8↔11, 9↔16, 13↔14, 17↔9)
  - Module 13 (Transportation) still has "Language Learning" - no transportation listening exists in DB, needs new content

### Completed (March 22, 2026)
- Word Order Grammar Game Bug Fix: User's correct answers were marked wrong when punctuation (. , ? !) was stored as separate word tokens
  - Root cause: `normalize()` function didn't remove spaces before punctuation when joining word tokens
  - Fix: Added regex `.replace(/\s+([.!?,;:'""])/g, '$1')` to normalize in BOTH locations
  - Fixed in: `WordOrder.js` (standalone component) AND `UnifiedLessonPage.js` (inline GrammarGame)
  - Verified: 10/10 backend tests passed

- **5-Stage Grammar Practice Engine (COMPLETE)** - PhD-level grammar learning system
  - **Stage 1: Learn** - 7 slide types: Context Discovery, Form, Meaning, Examples, Common Mistakes, IELTS Tips, Concept Check (CCQ)
  - **Stage 2: Controlled Practice** - 4 exercise types: Recognition (spot the grammar), Gap Fill, Transformation, Error Correction
  - **Stage 3: Checkpoint Quiz** - 10 mixed questions with timer, difficulty levels, mastery scoring + diagnostic report
  - **Stage 4: Guided Production** - 5 scaffolded writing prompts with word bank + AI evaluation (GPT-4o)
  - **Stage 5: Free Production** - 3 open-ended prompts for real communication + AI evaluation
  - **Multi-language Translation Toggle** - Globe icon allows switching explanations to Vietnamese, Turkish, Korean, etc.
  - **AI Content Generation** - All content generated from minimal grammar data via GPT-4o, cached in MongoDB
  - **AI Evaluation** - Student writing evaluated with 1-5 star score, grammar check, feedback, corrections
  - **Backend:** `/app/backend/routes/grammar_engine.py` - 8 endpoints (learn, practice, quiz, guided-prompts, free-prompts, evaluate, translate, progress)
  - **Frontend:** 4 new pages (GrammarLearnMode, GrammarPracticeMode, GrammarQuizMode, GrammarProductionMode)
  - **MasteryCourse Integration:** 5 buttons (Learn, Practice, Quiz, Guided, Free) in Grammar section
  - Verified: 25/25 backend tests passed, all 5 frontend pages tested

### Previously Completed
- Critical Bug Fix: Persistent Data Loss (data now written to source JSON files)
- Critical Bug Fix: Missing & Unenriched Content for all stages
- Critical Bug Fix: Crossword Game rewritten
- Admin Panel: Plan dropdown fixed, admin auto-access on startup
- ~80+ vocabulary images generated

## Prioritized Backlog

### P0 - Upcoming
1. **Grammar Engine -> Advanced Course:** Port grammar engine to Advanced Mastery Course
2. **Vocabulary Engine -> Beginner Course:** Port vocabulary engine to Beginner course

### P1 - Upcoming
1. **"Liz" Bilingual Lesson Teacher:** AI tutor explains lesson topic in user's language before 10-step activity flow
2. **"Map Generator" Status Report:** Inform user - no existing feature found
3. **Vocabulary Word Completion Bug:** Regression test - completing one word incorrectly marks all complete

### P2 - Future
- Generate ElevenLabs Audio for All Mastery Modules
- Automatic Visual Generation Pipeline for new lessons
- Bank Transfer Expiry Reminders (3 days before)
- "Daily Habit" Spaced Repetition System (SRS)
- "Booster Mode" for remedial lessons
- Teacher Control Panel
- Investigate user database ("not real users" comment)

## Key Files
- `/app/backend/server.py` - Core backend
- `/app/backend/routes/grammar_engine.py` - Grammar Practice Engine (8 API endpoints)
- `/app/frontend/src/pages/GrammarLearnMode.js` - Grammar Learn (7 slide types + translation)
- `/app/frontend/src/pages/GrammarPracticeMode.js` - Controlled Practice (4 exercise types)
- `/app/frontend/src/pages/GrammarQuizMode.js` - Checkpoint Quiz (timer + diagnostics)
- `/app/frontend/src/pages/GrammarProductionMode.js` - Guided + Free Production (AI evaluation)
- `/app/backend/content/enriched/*.json` - Source of truth for enriched content
- `/app/tools/image_mapping.json` - Word-to-image mapping (301 entries)
- `/app/tools/gpt_image_mapping.json` - GPT generated images mapping (79 entries)
- `/app/backend/static/vocab_images/` - Physical image files (~540 files)

## Admin Accounts
- aga.durdy@gmail.com
- admin@ieltsace.com
- stemhousebenluc@gmail.com

## Critical Notes
- DATA PERSISTENCE: All content changes must be written to enriched JSON source files, not just DB
- User communicates in Turkish
- DB_NAME = ielts_database
