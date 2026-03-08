# IELTS Ace - AI-Powered English Learning Platform

## Original Problem Statement
A full-stack English learning platform (IELTS focused) with React frontend, FastAPI backend, and MongoDB. The platform provides structured learning stages with vocabulary, grammar, games, and AI-powered features.

## Architecture
- **Frontend:** React (port 3000)
- **Backend:** FastAPI (port 8001)
- **Database:** MongoDB (ielts_database)
- **Key Integrations:** PayPal, Claude Sonnet 4.5, OpenAI GPT Image 1, ElevenLabs, Whisper

## What's Been Implemented

### Core Features
- Multi-stage learning platform (8 stages, 24 units, 96 lessons)
- Vocabulary with images, definitions, examples
- Games: Crossword (rewritten), and others
- Admin Panel at /admin with Vocabulary Image Manager and User Management
- Auto-seeding system (idempotent, preserves data)
- Data persistence via source JSON files

### Completed (This Session - March 8, 2026)
- P0: 100% vocabulary image coverage achieved (617/617 words)
  - 14 new images generated (always, can't, dancing, dirty, drawing, drinking, floor, funny, game, grey, guitar, knees, listening to music, never, new)
  - 5 existing images linked (big, big ears, clean, long neck, grey)
  - Updated: mapping files, enriched JSON source files, database

### Previously Completed
- Critical Bug Fix: Persistent Data Loss (data now written to source JSON files)
- Critical Bug Fix: Missing & Unenriched Content for all stages
- Critical Bug Fix: Crossword Game rewritten
- Admin Panel: Plan dropdown fixed, admin auto-access on startup
- ~80+ vocabulary images generated

## Prioritized Backlog

### P1 - Upcoming
1. **"Liz" Bilingual Lesson Teacher:** AI tutor explains lesson topic in Turkish before 10-step activity flow
2. **"Map Generator" Status Report:** Inform user - no existing feature found
3. **Vocabulary Word Completion Bug:** Regression test - completing one word incorrectly marks all complete

### P2 - Future
- Automatic Visual Generation Pipeline for new lessons
- Bank Transfer Expiry Reminders (3 days before)
- "Daily Habit" Spaced Repetition System (SRS)
- "Booster Mode" for remedial lessons
- Teacher Control Panel
- Investigate user database ("not real users" comment)

## Key Files
- `/app/backend/server.py` - Core backend
- `/app/backend/content/enriched/*.json` - Source of truth for enriched content
- `/app/tools/image_mapping.json` - Word-to-image mapping (301 entries)
- `/app/tools/gpt_image_mapping.json` - GPT generated images mapping (79 entries)
- `/app/backend/static/vocab_images/` - Physical image files (~540 files)

## Admin Accounts
- aga.durdy@gmail.com
- admin@ieltsace.com
- stemhousebenluc@gmail.com

## Critical Notes
- DATA PERSISTENCE: All content changes must be written to enriched JSON source files, not just DB
- User communicates in Turkish
- DB_NAME = ielts_database
