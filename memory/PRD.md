# Testmaster - Product Requirements Document

## Original Problem Statement
A "Mastery-Based" and "Retention-Driven" English learning platform. Single unified learning path from Stage 1 to Stage 8. Spiral curriculum with 10-step lesson structure.

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Content System**: User-authored JSON -> `/app/backend/content/` -> `seed_content_v4.py` -> MongoDB
- **3rd Party**: OpenAI Whisper (pronunciation), Browser TTS (listening - MOCKED), jsPDF (PDF worksheets)

## Implemented Content (Stage 1 - Foundations)
- [x] Unit 1: Hello & My Sounds (phonics A-E)
- [x] Unit 2: My Name & Friends (phonics F-J)
- [x] Unit 3: Numbers 1-10 (phonics K-O)
- [x] Unit 4: Colors Everywhere (phonics P-T)
- [x] Unit 5: My Family (phonics U-Z) -- ALPHABET COMPLETE
- [x] Unit 6: My Body Part 1 (face/head, big/small)
- [x] Unit 7: My Body Part 2 (arms/legs, imperatives)
- [x] Unit 8: Animals - Farm (cow/horse/sheep/duck/pig/chicken)
- [x] Unit 9: Animals - Pets (cat/dog/bird/rabbit/mouse/turtle/fish) -- Feb 17, 2026
- [ ] Units 10-12: Awaiting user content

## Prioritized Backlog
### P0: Units 10-12 content, Daily Habit SRS
### P1: TTS audio, Badge system, UnifiedLessonPage refactor
### P2: Booster Mode, Certification Gate, Stage 2-8 themes

## Test Credentials
- Email: tester@test.com / Password: tester123
