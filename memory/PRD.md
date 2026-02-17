# Testmaster - Product Requirements Document

## Original Problem Statement
A "Mastery-Based" and "Retention-Driven" English learning platform. Single unified learning path from Stage 1 to Stage 8. Spiral curriculum with 10-step lesson structure.

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Content System**: User-authored JSON -> `/app/backend/content/` -> `seed_content_v4.py` -> MongoDB
- **3rd Party**: OpenAI Whisper (pronunciation), Browser TTS (listening - MOCKED), jsPDF (PDF worksheets)

## Content Workflow
1. User authors content per unit (JSON)
2. Save as `/app/backend/content/stage1_unitXX.json`
3. Run `python seed_content_v4.py`
4. Frontend reads from MongoDB APIs

## Implemented Content
- [x] **Unit 1**: Hello & My Sounds (4 lessons, phonics A-E)
- [x] **Unit 2**: My Name & Friends (4 lessons, phonics F-J)
- [x] **Unit 3**: Numbers 1-10 (4 lessons, phonics K-O)
- [x] **Unit 4**: Colors Everywhere (4 lessons, phonics P-T) -- ADDED Feb 17, 2026
- [ ] Units 5-12: Awaiting user content

## Features Implemented
- [x] 10-step lesson flow (warm_up -> vocabulary -> vocab_game -> reading -> grammar -> grammar_game -> listening -> production -> exit_ticket -> auto_review)
- [x] YouTube video embed in warm-up
- [x] Spiral recall (hints reference previous lessons)
- [x] Single-mode grammar games (word_order, fill_blank, error_hunter)
- [x] Extra Fun links (YouTube/ISLCollective)
- [x] Vocabulary Review + Grammar Review (mastery check lessons)
- [x] Hints throughout all quiz activities
- [x] Lesson Roadmap (winding path)
- [x] PDF Worksheet (current + cumulative)
- [x] Acceptable answers for fill-blank

## Prioritized Backlog
### P0 (Next)
- Units 5-12 content from user
- Daily Habit Mode (spaced repetition)

### P1
- TTS for listening activities (ElevenLabs or OpenAI TTS)
- Refactor UnifiedLessonPage.js into smaller components
- Teacher vs Student mode

### P2
- Booster Mode (remedial for <80% scores)
- Certification Gate
- Stage 2-8 themes, Teacher Control Panel

## Test Credentials
- Email: tester@test.com / Password: tester123
