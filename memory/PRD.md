# TESTMASTER - Mastery-Based English Learning Platform

## Product Requirements Document (PRD)

### Vision
A mastery-based English learning platform following Cambridge Young Learners methodology. The platform takes learners from absolute beginner (Pre-A1) through IELTS mastery with structured, AI-enriched lessons.

### Core Architecture
- **Frontend:** React (CRA) with Shadcn/UI components
- **Backend:** FastAPI (Python) with MongoDB
- **AI:** Claude Sonnet 4.5 (via Emergent LLM Key) for content generation
- **TTS:** ElevenLabs for vocabulary and listening audio
- **Speech:** OpenAI Whisper for pronunciation evaluation

### Stage 2: Starters (A1) - 12 Units, 48 Lessons
Each lesson follows a 10-step flow:
1. Retrieval Warm-up (3 questions)
2. Vocabulary (4-6 words with emojis, IPA, definitions, examples)
3. Vocab Games (4 rotating game types per lesson)
4. Micro Reading (passage + 3 comprehension questions)
5. Grammar Focus (rule pattern + 3 examples)
6. Grammar Games (5 game types: word_order, fill_blank, error_hunter, true_false, multiple_choice)
7. Listening (audio text + 3 questions)
8. Production/Speaking (3 prompts with speech evaluation)
9. Exit Ticket (3-5 review questions)
10. Auto Review

### Key Routes
- `/unified` - Course overview with all stages
- `/unified/stage/:stageId` - Stage with units
- `/unified/lesson/:lessonId` - Full lesson experience

### Key API Endpoints
- `GET /api/unified/stages` - All stages
- `GET /api/unified/stages/:stageId/units` - Units in a stage
- `GET /api/unified/lessons/:lessonId` - Lesson with activity_flow
- `POST /api/unified/tts/generate` - ElevenLabs TTS generation

### Pipeline (Content Generation)
```
master_data.md → generate_unit.py → stage2_unitXX.json → enrich_and_seed_stage.py → MongoDB
```

### What's Implemented (as of Mar 2026)
- [x] Stage 1: Foundations (Pre-A1) - 12 units, 48 lessons
- [x] Stage 2 Unit 1: Say Hello! - Fully enriched with AI content
- [x] 5 Grammar game types per lesson
- [x] 4 Vocab game types per lesson (rotating)
- [x] 3 Reading questions per lesson
- [x] 3 Grammar examples per lesson
- [x] ElevenLabs TTS service (API endpoint working)
- [x] Claude Sonnet 4.5 AI content generation
- [x] FormattedQuestion component for rich text display
- [x] Scalable pipeline for generating remaining 11 units
- [x] Unit content generator with all 12 units master data
- [x] Fixed DB upsert for new unit seeding
- [x] Fixed stage_id mapping (stage_2_starters)

### Pending
- [ ] Stage 2 Units 2-12 content generation (pipeline ready)
- [ ] AI-generated vocabulary images (user prefers AI over stock photos)
- [ ] Daily Habit SRS system
- [ ] Booster Mode (remedial lessons)
- [ ] Certification Gate
- [ ] Teacher Control Panel

### Test Credentials
- Email: tester@test.com
- Password: tester123

### Database
- DB Name: ielts_database
- Stage 2 stage_id: stage_2_starters
- Lesson IDs: stage_2_unit_XX_lesson_YY
