# IELTS Ace - Unified Learning Platform PRD

## Original Problem Statement
Transform the IELTS test preparation application from a fragmented multi-course structure into a **single, unified, step-by-step learning pathway** (Hybrid Learning Platform). Caters to all levels from absolute beginner (Pre-A1) to IELTS mastery (C1-C2), inspired by competitors like "iSmart" and designed for teachers using smart boards.

## Core Requirements
1. **Unified Learning Path**: Single course with 8 stages (Pre-A1 to C1-C2 IELTS Mastery)
2. **10-Step Lesson Flow**: Warm-up → Vocabulary → Vocab Game → Reading → Grammar → Grammar Game → Listening → Speaking → Exit Quiz → Review
3. **Adaptive UI**: Visual tone adapts to user's level
4. **Retention Features**: Daily Habit Mode, Spaced Repetition, Interleaving
5. **Hybrid Assessment**: AI + teacher feedback at Certification Gates
6. **Teacher Control Panel**: Monitor student retention and progress

## User Language
- User communicates in **Turkish**
- All code, UI text, and system-generated content in **English**

## Test Credentials (Persistent)
- Email: geldiaga67@gmail.com
- Password: geldiaga67
- User ID: 749c16e2-528f-4e8a-ab48-3e900fc11116

## Architecture
- **Frontend**: React + Shadcn UI + Tailwind CSS
- **Backend**: FastAPI + MongoDB
- **Key Routes**: /unified, /unified/stage/:stageId, /unified/lesson/:lessonId, /unified/daily-habit

## What's Implemented (Feb 14, 2026)

### Backend
- Unified learning data models (Stage, Unit, Lesson, Activity)
- 8 stages seeded in database
- Stage 1 fully seeded: 1 unit, 4 lessons, each with 10 activity types
- All activity content: warmup, vocabulary, matching games, reading, grammar, error hunter, listening, production, exit quizzes
- API endpoints for stages, units, lessons, activities, progress tracking, daily habit, spaced repetition
- User authentication (register/login)

### Frontend
- **Dashboard**: CTA navigates to `/unified` (new unified course)
- **UnifiedCoursePage**: 8-stage learning path overview
- **UnifiedStagePage**: Stage detail with units and lessons
- **UnifiedLessonPage**: Full 10-step interactive lesson flow
- **DailyHabitPage**: Streak tracking, review cards, spaced repetition
- **Mobile menu**: "Learning Path" link added

### Navigation Fix (Feb 14)
- Dashboard "Complete Learning Path" CTA now routes to `/unified` instead of old `/learning`
- Mobile menu includes "Learning Path" shortcut

### Bug Fixes (Feb 15, 2026)
- **ErrorHunterGame**: Fixed feedback display - now tracks `userChoice` instead of boolean `answered` for correct visual feedback
- **ExitTicket**: Fixed stuck-on-failure bug - added `handleRetry` to reset quiz state, shows per-question feedback with correct/incorrect markers, results page shows full answer review
- **MatchingGame**: Fixed stale closure - uses functional state updater for matchedPairs, added visual feedback (green/red) for match attempts
- **auto_review**: Added proper "Lesson Complete!" card instead of generic placeholder

### New Features (Feb 15, 2026)
- **Skip Button on All Steps**: Every activity step now has a Skip button (top-right). No more auto-skipping - all 10 steps visible in sidebar
- **Rich Grammar Game (3 game types)**: Replaced basic Error Hunter with multi-type grammar game:
  - Error Hunter: "Is this sentence correct?" (Correct/Has Error)
  - Word Order: Build sentence from shuffled words (drag-to-build)
  - Fill-in-the-Blank: Choose correct word for blank in sentence
  - Questions from all 3 types are shuffled and mixed
- **Grammar game data for all 4 lessons** (12-13 questions each)

### UI/UX Overhaul & Vocabulary Record (Feb 15, 2026)
- **Stage Theming**: Dynamic color themes per stage (Stage 1=amber/orange, Stage 2=emerald, Stage 3=blue, Stage 4=violet, Stage 5=rose). Applied to lesson background, sidebar, badges, buttons
- **Lesson Path redesign**: iSmart-inspired visual path with SVG lines, themed colors, animated current step indicator
- **Vocabulary module redesign**: iSmart-style layout with emoji word cards, IPA pronunciation, audio buttons, example sentences
- **Vocabulary Record & Check**: OpenAI Whisper integration for pronunciation checking. Record button, transcription comparison, similarity score, feedback
- **Backend endpoint**: POST /api/unified/pronunciation/check - accepts audio file + target word, returns transcription, similarity score, and feedback

### Stage 1 Full Curriculum (Feb 15, 2026)
- **12 Units seeded**: Hello!, Friends, Numbers, Colors, My Family, My Face, My Body, The Farm, My Pets, At School, Feelings, Big Review!
- **48 Lessons** (4 per unit) with 10-step activity flows
- **480 activity records**: vocabulary, warmup, vocab games, grammar, grammar games (3 types), reading, listening, production, exit quiz
- Each unit has unique theme color and emoji-based vocabulary
- Substage A (U1-U6) and Substage B (U7-U12) structure

## P1 - High Priority (Next)
- Listening section audio improvement (ElevenLabs v3 integration)
- Daily Habit Mode (spaced repetition, interleaving, daily mix)
- Refactor LessonPage.js into separate component files
- Mastery-based progression (%80 threshold gate)

## P2 - Medium Priority
- Build Stages 2-8 content
- Adaptive UI that changes with user level
- Certification Gate between stages
- Booster Mode for weak areas
- Daily Habit Mode backend logic

## P3 - Future
- Teacher Control Panel with analytics
- Migration of old course content
- Multi-language support for UI
