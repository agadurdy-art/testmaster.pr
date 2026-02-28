# TESTMASTER - Mastery-Based English Learning Platform

## Original Problem Statement
Build a "Mastery-Based" and "Retention-Driven" English learning platform. The user (pedagogy expert) provides curriculum content, and the AI enhances it with pedagogically sound, native ESL teacher quality content.

## Current State (February 28, 2026)

### Implemented Features
- [x] Stage 1: 12 units, 48 lessons - ALL MERGED & SEEDED
- [x] Stage 2: Unit 1 (4 lessons) - GENERATED, ENRICHED & SEEDED (pilot)
- [x] AI Content Enrichment (GPT-4o) 
- [x] Data merge pipeline: original + enriched -> unified activity_flow
- [x] 10 Vocabulary Games + 3 Grammar Games
- [x] iOS 26 Glassmorphism UI
- [x] Speaking: Record & Evaluate (Whisper + Browser SpeechRecognition)
- [x] PDF Worksheet: GPT-4o teacher-quality (6 exercise types + mixed review, max 20 words)
- [x] All bug fixes: Word Order, Listening options, Warm-up 3 qs, Exit Ticket 5 qs
- [x] Stage 2 content generation pipeline (GPT-4o from vocab+grammar → full lessons)

### Stage 2 Progress
- [x] Unit 1: Say Hello! (4 lessons) ✅
- [ ] Unit 2: Numbers & Colors
- [ ] Unit 3: What's in Your Classroom?
- [ ] Unit 4: Body & Action
- [ ] Unit 5: Animals Everywhere
- [ ] Unit 6: My Family & Friends
- [ ] Unit 7: Food I Like! (was incorrectly labeled Unit 4)
- [ ] Unit 8: My House
- [ ] Unit 9: What are we doing?
- [ ] Unit 10: Clothes
- [ ] Unit 11: Play & Hobbies
- [ ] Unit 12: Review & Final Gate

### Key Scripts
- `scripts/generate_stage_content.py` - GPT-4o content generator (takes unit num)
- `scripts/enrich_and_seed_stage.py` - Enriches + seeds to DB (takes stage, unit num)
- `scripts/re_enrich_targeted.py` - Targeted re-enrichment

### Priority Backlog
- [ ] Stage 2 Units 2-12 generation
- [ ] Achievement System
- [ ] Daily Habit SRS
- [ ] Booster Mode

## Test Credentials
- Email: tester@test.com, Password: tester123
