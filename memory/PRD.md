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

## P1 - High Priority (Next)
- Integrate image generation for vocabulary (OpenAI GPT-4o)
- Build first Micro-Game components
- Add more review items to Daily Habit via spaced repetition queue

## P2 - Medium Priority
- Build Stages 2-8 content
- Adaptive UI that changes with user level
- Certification Gate between stages
- Booster Mode for weak areas

## P3 - Future
- Teacher Control Panel with analytics
- Migration of old course content
- Multi-language support for UI
