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

### Unit List (Stage 2)
| Unit | Title | Topics |
|------|-------|--------|
| 1 | Say Hello! | Greetings, introductions, alphabet |
| 2 | Numbers & Colors | Numbers 11-20, new colors |
| 3 | What's in Your Classroom? | Classroom objects, prepositions |
| 4 | Body & Action | Body parts, can/can't |
| 5 | Animals Everywhere | Zoo/garden animals, descriptions |
| 6 | My Family & Friends | Family members, possessive 's |
| 7 | Food I Like! | Food, drinks, preferences |
| 8 | My House | Rooms, furniture, there is/are |
| 9 | What are we doing? | Present continuous |
| 10 | Clothes | Clothing, descriptions |
| 11 | Play & Hobbies | Sports, hobbies, frequency |
| 12 | Review & Final Gate | Cumulative review, mock exam |

### Key Routes
- `/unified` - Course overview with all stages
- `/unified/stage/:stageId` - Stage with units
- `/unified/lesson/:lessonId` - Full lesson experience

### Key API Endpoints
- `GET /api/unified/stages` - All stages
- `GET /api/unified/stages/:stageId/units` - Units in a stage
- `GET /api/unified/units/:unitId` - Unit with lessons
- `GET /api/unified/lessons/:lessonId` - Lesson with activity_flow
- `POST /api/unified/tts/generate` - ElevenLabs TTS generation

### Pipeline (Content Generation)
```
master_data (generate_unit.py) → stage2_unitXX.json → enrich_and_seed_stage.py → MongoDB
```
Usage: `cd /app/backend && python3 scripts/generate_unit.py <unit_num>`

### What's Implemented (as of Mar 2026)
- [x] Stage 1: Foundations (Pre-A1) - 12 units, 48 lessons
- [x] Stage 2: Starters (A1) - 12 units, 48 lessons - ALL COMPLETE
- [x] 5 Grammar game types per lesson (word_order, fill_blank, error_hunter, true_false, multiple_choice)
- [x] 4 Vocab game types per lesson (rotating between lessons)
- [x] 3 Reading questions per lesson (with retry validation)
- [x] 3 Grammar examples per lesson
- [x] ElevenLabs TTS service (API endpoint working)
- [x] Claude Sonnet 4.5 AI content generation
- [x] FormattedQuestion component (HTML escape fixed)
- [x] Scalable pipeline with upsert and stage_id mapping
- [x] All UI text in English (Turkish strings removed)
- [x] Error Hunter with single-error prompt improvements

### Pending / Backlog
- [ ] AI-generated vocabulary images (user prefers AI over stock photos)
- [ ] Daily Habit SRS system
- [ ] Booster Mode (remedial lessons)
- [ ] Certification Gate logic
- [ ] Teacher Control Panel
- [ ] Stages 3-8 content

### Test Credentials
- Email: tester@test.com
- Password: tester123

### Database
- DB Name: ielts_database
- Stage 2 stage_id: stage_2_starters
- Unit IDs: stage_2_unit_01 through stage_2_unit_12
- Lesson IDs: stage_2_unit_XX_lesson_YY (XX: 01-12, YY: 01-04)
