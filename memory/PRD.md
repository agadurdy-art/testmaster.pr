# TESTMASTER - Mastery-Based English Learning Platform

## Original Problem Statement
Build a "Mastery-Based" and "Retention-Driven" English learning platform. The user (pedagogy expert) provides curriculum content, and the AI enhances it with pedagogically sound, native ESL teacher quality content.

## Architecture
```
/app/backend/
├── content/                          # Original human-authored content (SOURCE OF TRUTH)
│   ├── stage1_unit01.json ... stage1_unit12.json
│   └── enriched/                     # AI-enriched content
│       └── stage1_unit01_enriched.json ... stage1_unit12_enriched.json
├── services/
│   ├── ai_content_enricher.py        # GPT-4o enrichment (fixed JSON parser)
│   └── content_merger.py             # Merges original + enriched
├── routes/
│   ├── content_enrichment.py         # /api/admin/content/* endpoints
│   └── speech_routes.py              # /api/speech/evaluate (Whisper STT)
├── scripts/
│   └── re_enrich_targeted.py         # Targeted re-enrichment
├── unified_learning_routes.py        # /api/unified/* endpoints
└── server.py

/app/frontend/src/
├── pages/
│   └── UnifiedLessonPage.js          # 10 activity components + Speaking Record & Evaluate
└── components/games/
    ├── vocab/ (10 game types)
    └── grammar/ (WordOrder [fixed], FillTheBlank, ErrorHunter)
```

## Hybrid Content Model
- **Original (human-authored)**: vocabulary, micro_reading, grammar_focus, production
- **Enriched (AI-generated)**: vocab_games, grammar_games, warm_up (3 qs), exit_ticket (5 qs), listening (with options)
- **Merge logic**: Original structure preserved, specific sections swapped with enriched

## Current State (February 18, 2026)

### Implemented Features
- [x] Stage 1: 12 units, 48 lessons - ALL MERGED & SEEDED
- [x] AI Content Enrichment (GPT-4o) for all 12 units
- [x] Data merge pipeline: original + enriched -> unified activity_flow
- [x] 10 Vocabulary Games + 3 Grammar Games (all functional)
- [x] iOS 26 Glassmorphism UI
- [x] Browser TTS (SpeechSynthesis API)
- [x] Stage 1 Certificate with confetti
- [x] Embedded activity data in lesson documents
- [x] Review lessons support
- [x] Word Order game - punctuation-safe comparison (FIX)
- [x] Listening - proper options generation (FIX)
- [x] Warm-up - 3 questions per lesson (ENRICHED)
- [x] Exit Ticket - 5 questions per lesson (ENRICHED)
- [x] Speaking: Record & Evaluate with Whisper + Browser SpeechRecognition (NEW)
- [x] JSON parser infinite recursion fix

### Key API Endpoints
- `POST /api/admin/content/merge-and-seed` - Merge original + enriched and seed DB
- `GET /api/unified/lessons/{lesson_id}` - Get lesson with activity_flow
- `GET /api/unified/lessons/{lesson_id}/activity/{type}` - Get activity data
- `POST /api/speech/evaluate` - Speech evaluation (Whisper + word similarity)

## Priority Backlog

### P0 (Critical) - ALL COMPLETED
- [x] Data merge pipeline
- [x] Word Order game logic fix
- [x] Listening options fix
- [x] Warm-up multi-question enrichment
- [x] Exit Ticket multi-question enrichment
- [x] Speaking Record & Evaluate

### P1 (High Priority)
- [ ] Vocabulary Word Completion bug verification
- [ ] Achievement System (badges: "Alphabet Master", "First Half Complete")
- [ ] Daily Habit SRS Integration

### P2 (Medium Priority)
- [ ] Booster Mode (<80% remedial)
- [ ] More game items per game (10-15 instead of 2-5)
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

## Third Party Integrations
- OpenAI GPT-4o (content enrichment) - Emergent LLM Key
- OpenAI Whisper (speech-to-text) - Emergent LLM Key
- Browser SpeechRecognition API (fallback STT)
- Browser SpeechSynthesis API (TTS)
- jsPDF (worksheet generation)
- canvas-confetti (celebrations)
