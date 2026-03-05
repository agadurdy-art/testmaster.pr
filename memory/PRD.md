# TESTMASTER - Mastery-Based English Learning Platform

## Product Requirements Document (PRD)

### Vision
A mastery-based English learning platform following Cambridge Young Learners methodology.

### Core Architecture
- **Frontend:** React (CRA) with Shadcn/UI components
- **Backend:** FastAPI (Python) with MongoDB
- **AI Content:** Claude Sonnet 4.5 (via Emergent LLM Key)
- **AI Images:** Nano Banana 2 (Gemini 3.1 Flash Image) - 148/243 words
- **TTS:** ElevenLabs - ALL vocab + listening audio (478 files, 0 fail)
- **Speech:** OpenAI Whisper for pronunciation evaluation

### What's Implemented (as of Mar 5, 2026)
- [x] Stage 1: Foundations (Pre-A1) - 12 units, 48 lessons + ElevenLabs audio
- [x] Stage 2: Starters (A1) - 12 units, 48 lessons - fully enriched
- [x] 148 AI vocabulary illustrations (Nano Banana 2)
- [x] ElevenLabs TTS: all vocab words + example sentences + listening passages
- [x] Speaking evaluation: punctuation-safe scoring (100% for exact match)
- [x] All UI text in English (no Turkish)
- [x] 5 grammar game types, 4 vocab game types per lesson
- [x] 3 reading questions, 3 grammar examples per lesson
- [x] Pronunciation check via Whisper
- [x] Static serving for AI images + audio files

### Key Endpoints
- `GET /api/unified/stages` / `GET /api/unified/stages/:stageId/units`
- `GET /api/unified/units/:unitId` / `GET /api/unified/lessons/:lessonId`
- `POST /api/unified/tts/generate` / `POST /api/speech/evaluate`
- `POST /api/unified/pronunciation/check`

### Pipeline
```
generate_unit.py → enrich_and_seed_stage.py → MongoDB
generate_vocab_images.py → /static/vocab_images/
generate_tts_audio.py → /static/audio/
```

### Pending / Backlog
- [ ] Complete remaining 95 AI vocabulary images
- [ ] Daily Habit SRS system
- [ ] Booster Mode / Certification Gate
- [ ] Teacher Control Panel
- [ ] Stages 3-8 content

### Test Credentials
- Email: tester@test.com / Password: tester123

### Database
- DB: ielts_database
- Stage 2 stage_id: stage_2_starters
- 12 units × 4 lessons = 48 lessons per stage
