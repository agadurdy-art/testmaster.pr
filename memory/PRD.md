# Testmaster - Product Requirements Document

## Original Problem Statement
A "Mastery-Based" and "Retention-Driven" English learning platform. Single unified learning path from Stage 1 to Stage 8. Spiral curriculum with 10-step lesson structure.

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Content System**: User-authored JSON -> `/app/backend/content/` -> `seed_content_v4.py` -> MongoDB

## Stage 1 - Foundations (COMPLETE!)
All 12 units, 48 lessons successfully implemented:
- [x] Unit 1: Hello & My Sounds (phonics A-E)
- [x] Unit 2: My Name & Friends (phonics F-J)
- [x] Unit 3: Numbers 1-10 (phonics K-O)
- [x] Unit 4: Colors Everywhere (phonics P-T)
- [x] Unit 5: My Family (phonics U-Z)
- [x] Unit 6: My Body Part 1 (face/head)
- [x] Unit 7: My Body Part 2 (arms/legs, imperatives)
- [x] Unit 8: Animals - Farm
- [x] Unit 9: Animals - Pets
- [x] Unit 10: My School Bag
- [x] Unit 11: Feelings & Emotions
- [x] Unit 12: Review & Final Gate (Stage 1 Certification) -- Feb 17, 2026

## Prioritized Backlog
### P0
- Stage 2 (Starters - A1) content from user
- Daily Habit SRS (all 150+ Stage 1 words)
- Certification Gate logic (>=80% on Unit 12 L4 unlocks Stage 2)

### P1
- TTS audio for listening activities
- Badge system (Alphabet Master, Stage 1 Graduate)
- Booster Mode (<80% triggers remedial)
- UnifiedLessonPage.js refactor

### P2
- Stage 2-8 UI theme transitions
- Teacher Control Panel
- Animal sound effects, Imperative visual cues

## Test Credentials
- Email: tester@test.com / Password: tester123
