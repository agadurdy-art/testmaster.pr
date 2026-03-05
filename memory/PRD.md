# TESTMASTER - Mastery-Based English Learning Platform

## Product Requirements Document (PRD)

### Vision
A mastery-based English learning platform following Cambridge Young Learners methodology.

### Core Architecture
- **Frontend:** React (CRA) with Shadcn/UI components
- **Backend:** FastAPI (Python) with MongoDB
- **AI Content:** Claude Sonnet 4.5 (via Emergent LLM Key)
- **AI Images:** GPT Image 1 (60 words) + Nano Banana 2 (90 words) + bestflashcard.com scraped (93 words)
- **TTS:** ElevenLabs - ALL vocab + listening audio (478 files, 0 fail)
- **Speech:** OpenAI Whisper for pronunciation evaluation

### What's Implemented (as of Mar 5, 2026)
- [x] Stage 1: Foundations (Pre-A1) - 12 units, 48 lessons + ElevenLabs audio
- [x] Stage 2: Starters (A1) - 12 units, 48 lessons - fully enriched
- [x] **243/243 vocabulary images complete (100% coverage)**
  - 93 scraped from bestflashcard.com (high quality flashcards)
  - 90 Nano Banana 2 AI-generated (pre-existing)
  - 60 GPT Image 1 AI-generated (new, child-friendly illustrations)
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
- `GET /api/static/vocab_images/{filename}` - Vocabulary images

### Image Pipeline
```
scrape_flashcard_images.py → /backend/static/vocab_images/ (93 scraped)
generate_gpt_images.py → /backend/static/vocab_images/gpt_*.png (60 GPT)
Nano Banana (pre-existing) → /backend/static/vocab_images/{md5hash}.png (90)
update_db_images.py → MongoDB unified_lessons image_url update
```

### Content Pipeline
```
generate_unit.py → enrich_and_seed_stage.py → MongoDB
generate_vocab_images.py → /static/vocab_images/
generate_tts_audio.py → /static/audio/
```

### Pending / Backlog
- [ ] Daily Habit SRS system
- [ ] Booster Mode / Certification Gate
- [ ] Teacher Control Panel
- [ ] Stages 3-8 content
- [ ] Stage 1 content re-enrichment (on hold - cost)
- [ ] Vocabulary completion bug verification (one word marks all complete)

### Test Credentials
- Email: tester@test.com / Password: tester123

### Key Files
- `/app/tools/scrape_flashcard_images.py` - bestflashcard.com scraper
- `/app/tools/generate_gpt_images.py` - GPT Image 1 generator
- `/app/tools/update_db_images.py` - DB updater with image URLs
- `/app/tools/image_mapping.json` - Scraped image word-to-path mapping
- `/app/tools/gpt_image_mapping.json` - GPT image word-to-path mapping
- `/app/backend/static/vocab_images/` - All vocabulary images (419 files)
