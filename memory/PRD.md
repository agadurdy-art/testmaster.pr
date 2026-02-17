# Testmaster - Product Requirements Document

## Original Problem Statement
A "Mastery-Based" and "Retention-Driven" English learning platform. Single unified learning path from Stage 1 (Beginner) to Stage 8 (Advanced). 10-step lesson structure per lesson.

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Content System**: User-authored JSON files in `/app/backend/content/` → seed via `seed_content_v4.py`
- **3rd Party**: OpenAI Whisper (pronunciation), Browser TTS (listening - MOCKED), jsPDF (PDF worksheets)

## Content Workflow
1. User authors content in notebook (JSON format per unit)
2. JSON saved to `/app/backend/content/stage1_unitXX.json`
3. Run `python seed_content_v4.py` to populate MongoDB
4. Frontend reads from MongoDB APIs

## What's Been Implemented
- [x] Auth system (login/register)
- [x] **Authored Content System (Feb 17)**: Hand-crafted content replaces AI-generated
- [x] Unit 1 complete (4 lessons, 9 steps each + auto_review)
- [x] YouTube video embed in Warm-up
- [x] Spiral recall (L2 warmup tests L1 vocab)
- [x] Single-mode grammar games (word_order, fill_blank, error_hunter)
- [x] Extra Fun links (YouTube/ISLCollective) at lesson summary
- [x] Vocabulary Review + Grammar Review types (Lesson 4 mastery check)
- [x] Hints in warmup, fill-blank, and exit quiz
- [x] Lesson Roadmap (winding path)
- [x] PDF Worksheet (current + cumulative)
- [x] Acceptable answers for fill-blank questions

## Key Files
- `/app/backend/content/stage1_unit01.json` - Unit 1 authored content
- `/app/backend/seed_content_v4.py` - Content-driven seed script
- `/app/frontend/src/pages/UnifiedLessonPage.js` - All activity components
- `/app/backend/unified_learning_routes.py` - API endpoints

## Prioritized Backlog
### P0 (Next)
- User to provide Unit 2-12 content in same format
- Implement Daily Habit mode (spaced repetition pool)

### P1 (Upcoming)
- TTS integration for listening activities
- Refactor UnifiedLessonPage.js monolith
- Teacher mode vs Student mode (skip control)

### P2 (Future)
- Booster Mode, Certification Gate
- Stage 2-8 curriculum
- Teacher Control Panel

## Test Credentials
- Email: tester@test.com / Password: tester123

## Content Format Reference
Each unit JSON: `/app/backend/content/stage1_unitXX.json`
Step types: warm_up, vocabulary, micro_game_vocab, micro_reading, grammar_focus, grammar_game, listening, production, exit_ticket
Special types: vocabulary_review, grammar_review (for mastery check lessons)
