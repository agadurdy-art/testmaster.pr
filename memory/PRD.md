# TESTMASTER - Mastery-Based English Learning Platform

## Original Problem Statement
Build a "Mastery-Based" and "Retention-Driven" English learning platform. The user (pedagogy expert) provides curriculum content, and the AI enhances it with pedagogically sound, native ESL teacher quality content.

## Architecture
```
/app/backend/
├── content/                          # Original human-authored content (SOURCE OF TRUTH)
│   ├── stage1_unit01.json ... stage1_unit12.json
│   └── enriched/                     # AI-enriched content (games, quizzes)
│       └── stage1_unit01_enriched.json ... stage1_unit12_enriched.json
├── services/
│   ├── ai_content_enricher.py        # GPT-4o enrichment service
│   └── content_merger.py             # Merges original + enriched content
├── routes/
│   └── content_enrichment.py         # /api/admin/content/* endpoints
├── unified_learning_routes.py        # /api/unified/* endpoints (lessons, activities)
└── server.py

/app/frontend/src/
├── pages/
│   ├── UnifiedCoursePage.js          # iOS 26 glass design
│   ├── UnifiedStagePage.js           # iOS 26 glass design
│   └── UnifiedLessonPage.js          # Main lesson page with all 14 game components
└── components/games/
    ├── vocab/ (10 games)
    ├── grammar/ (3 games)
    └── shared/index.js
```

## Hybrid Content Model
- **Original (human-authored)**: vocabulary, micro_reading, grammar_focus, listening, production
- **Enriched (AI-generated)**: vocab_games (3 game types), grammar_games (3 game types)
- **Merge logic**: Original lesson structure preserved, only game/quiz sections swapped with enriched

## Current State (February 18, 2026)

### Implemented Features
- [x] Stage 1 complete content (12 units, 48 lessons) - MERGED & SEEDED
- [x] AI Content Enrichment (GPT-4o) for all 12 units
- [x] Data merge pipeline: original + enriched -> unified activity_flow
- [x] 10 Vocabulary Games + 3 Grammar Games (all functional)
- [x] iOS 26 Glassmorphism UI
- [x] Browser TTS (SpeechSynthesis API)
- [x] Stage 1 Certificate with confetti
- [x] Embedded activity data in lesson documents (no separate collections needed)
- [x] Review lessons with vocabulary_review + grammar_review support

### Key API Endpoints
- `POST /api/admin/content/merge-and-seed` - Merge original + enriched and seed DB
- `POST /api/admin/content/enrich` - Run AI enrichment
- `GET /api/unified/lessons/{lesson_id}` - Get lesson with activity_flow
- `GET /api/unified/lessons/{lesson_id}/activity/{type}` - Get activity data (reads from embedded activity_flow first)

## Priority Backlog

### P0 (Critical) - COMPLETED
- [x] Data merge pipeline (original + enriched content)
- [x] 14 Game components with full logic
- [x] AI content enrichment for all 12 units
- [x] Browser TTS integration
- [x] iOS 26 design for learning path

### P1 (High Priority)
- [ ] Vocabulary Word Completion bug verification
- [ ] Achievement System (badges: "Alphabet Master", "First Half Complete")
- [ ] Daily Habit SRS Integration

### P2 (Medium Priority)
- [ ] Booster Mode (<80% remedial)
- [ ] More game types (Word Search, Crossword)
- [ ] Teacher Control Panel
- [ ] Animal sounds for Unit 9 games
- [ ] Blinking visual cues for imperative commands

### P3 (Future)
- [ ] Stage 2-4 curriculum
- [ ] Certification Gate system
- [ ] Spaced Repetition System (SRS)

## Test Credentials
- Email: tester@test.com
- Password: tester123
- User ID: fc113759-b707-47a1-8705-b010368e0555

## Third Party Integrations
- OpenAI GPT-4o (content enrichment) - Emergent LLM Key
- Browser SpeechSynthesis API (TTS) - No key needed
- jsPDF (worksheet generation)
- canvas-confetti (celebrations)
