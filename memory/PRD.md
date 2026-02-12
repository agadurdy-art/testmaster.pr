# IELTS Ace - Product Requirements Document

## Original Problem Statement
IELTS exam preparation platform being transformed into a "Hybrid Learning Platform" controlled by teachers. Phase 1 focus: Vocabulary Engine for Advanced Course.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI on port 8001
- **Database**: MongoDB
- **LLM**: OpenAI GPT-4o via Emergent LLM Key
- **TTS/STT**: OpenAI TTS (nova) + Whisper via Emergent Integrations

## What's Been Implemented

### Vocabulary Engine - Phase 1 COMPLETE (Feb 12, 2026)
iOS-inspired design (`#F5F5F7`, white cards, `rounded-[20px]`, subtle shadows):

1. **Learn Mode** (`/vocabulary/learn/:moduleId`): Full-screen flip-card slides (28/module), IPA, TTS, word formation table
2. **Controlled Practice** (`/vocabulary/practice/:moduleId`): Fill-in-blank + matching exercises (25/module), hints, score tracking. Fixed: matching now uses separate term/def selection
3. **Mastery Quiz** (`/vocabulary/quiz/:moduleId`): 10 questions (MC + fill_blank + TFNG), 80% pass, reading passage for TFNG, text input for fill_blank. Auto-adds wrong answers to Review Bank
4. **Production Mode AI** (`/vocabulary/production/:moduleId`): GPT-4o evaluates user sentences (grammar + usage, 1-5 stars)
5. **Review Bank** (`/review-bank`): Spaced repetition flashcards (1d->3d->7d->14d->mastered)

### Bug Fixes (Feb 12, 2026)
- Fill-in-blank quiz questions now have text input field
- TFNG questions show reference reading passage
- Matching exercise click handler fixed (separate term/def selection)

### Other Features (Previously Implemented)
- Dashboard, Question Bank, Liz AI Teacher (homework, paywall, TTS/STT)
- Quick Practice, Full Test, Writing Practice, Level Test, Speaking Practice

## Backlog / Upcoming Tasks

### P1 - Future Phases
- **Phase 2**: Grammar Engine (Concept, Drill, Production, Quiz)
- **Phase 3**: Teacher Control Layer
- **Phase 4**: Learning Pathway restructuring
- **Phase 5**: AI Content Expansion

## Test Credentials
- Email: test@test.com / Password: test1234
- User ID: 6565a865-dbf9-4596-b756-eaf6c29295c8
