# Testmaster - Product Requirements Document

## Original Problem Statement
A "Mastery-Based" and "Retention-Driven" English learning platform. Single unified learning path from Stage 1 to Stage 8. Spiral curriculum with 10-step lesson structure.

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn/UI + canvas-confetti
- **Backend**: FastAPI + MongoDB
- **Content System**: User-authored JSON -> `/app/backend/content/` -> `seed_content_v4.py` -> MongoDB

## Stage 1 - Foundations (COMPLETE!)
All 12 units, 48 lessons successfully implemented.

## Features Implemented
- [x] 10-step lesson flow with all activity types
- [x] YouTube video embed, Grammar games, Vocabulary/Grammar Review
- [x] Lesson Roadmap, PDF Worksheets, Hints, Extra Links
- [x] **Stage Certificate**: Confetti animation + Graduate certificate + Stage 2 unlock screen -- Feb 17, 2026
- [x] **Vocabulary Review grid**: Review words displayed in clickable grid for review lessons
- [x] **Certification Gate**: >=80% shows certificate, <80% shows retry screen

## Prioritized Backlog
### P0
- Stage 2 (Starters - A1) content from user
- Daily Habit SRS (all 150+ Stage 1 words)

### P1
- TTS audio for listening activities
- Badge system (Alphabet Master at Unit 5)
- Booster Mode (<80% triggers remedial)
- UnifiedLessonPage.js refactor

### P2
- Stage 2-8 UI theme transitions
- Teacher Control Panel

## Test Credentials
- Email: tester@test.com / Password: tester123
