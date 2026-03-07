# IELTS Ace - AI-Powered IELTS Preparation Platform

## Original Problem Statement
Full-stack IELTS preparation platform with AI-powered features including vocabulary, grammar, reading, listening, writing evaluation, speaking practice, and a comprehensive question bank. The platform uses a subscription model with PayPal and bank transfer payment options.

## User Personas
- **IELTS Students**: Primary users preparing for IELTS exam (Vietnamese, Turkish, English speakers)
- **Admin Users**: aga.durdy@gmail.com, stemhousebenluc@gmail.com, admin@ieltsace.com (bypass lesson lock)

## Core Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: Monolithic FastAPI (server.py)
- **Database**: MongoDB (ielts_database)
- **3rd Party**: PayPal Subscriptions, Anthropic Claude 4.5 (Emergent LLM Key), OpenAI GPT Image 1, ElevenLabs TTS, Azure Speech, Emergent Whisper

## Subscription Plans
| Plan | Price | Old Name | QR Code File |
|------|-------|----------|-------------|
| Explorer | $4.99/mo | Single exam | Single exam 120k.png |
| Learner | $9/mo | Starter | Starter plan 220k.png |
| Achiever | $19/mo | Booster | Booster plan 460k.png |
| Master | $29/mo | Pro | Pro plan 700k.png |

## What's Been Implemented
- Full lesson system with 8 learning stages (Pre-A1 to IELTS)
- Smart Lock lesson progression (sequential unlock, admin bypass)
- Bank transfer 30-day plan expiry system
- Bank transfer QR code modal with plan-specific VietQR codes
- PayPal recurring subscriptions
- Question Bank (1420+ questions)
- Writing Task evaluation with AI
- Speaking practice with AI
- Multi-language UI (EN, VI, TR)
- Vocabulary games, grammar exercises, listening/reading activities
- Liz AI Teacher, Emily AI Mentor
- Level test system

## Completed (March 7, 2026)
- [x] **Centralized Admin Panel** at /admin with 6 management modules
  - User Management, Vocabulary Images, Feedback, Credits, Content Admin, Visual Generator
  - Admin access control (aga.durdy@gmail.com, stemhousebenluc@gmail.com, admin@ieltsace.com)
- [x] **Vocabulary Image Manager** at /admin/vocabulary-images
  - Expandable Stage > Unit > Lesson > Word hierarchy
  - Shows all 617 vocabulary words with current images (100% coverage)
  - Upload new images (file upload) or paste image URLs
  - Search functionality across all words
  - Image preview modal
  - Progress bars showing image coverage per unit
- [x] **Auto-seed Unified Learning on Startup**
  - Seeds 8 stages metadata if missing
  - Loads all content from JSON files (stage1 + stage2, 24 unit files)
  - Ensures production deployments have all lesson content
  - Fixed: seed_content_v4.py now handles ALL stages (not just stage1)
- [x] **ADMIN_EMAILS consistency fix** - backend and frontend now match

## Completed (Previous Sessions)
- [x] Bank Transfer QR Code Display
- [x] Hardcoded Turkish Text in Question Bank
- [x] Listening Activity Crash fix (.toLowerCase on numbers)
- [x] Vocabulary Game Image Correction (58% -> 81% -> 100% coverage)
- [x] Context-Aware Image Generation (55+ new illustrations)
- [x] Admin Lesson Lock bypass verification

## P1 - Pending
- [ ] "Liz" AI as Bilingual Lesson Teacher (2-3 min intro in native language before lessons)
- [ ] Vocabulary Word Completion Bug - Regression test needed
- [ ] Map Generator Status - Report to user (no code found)

## P2 - Backlog
- [ ] Automatic Visual Generation Pipeline
- [ ] Bank Transfer Expiry Email Reminders (3 days before expiry)
- [ ] Daily Habit Spaced Repetition System (SRS)
- [ ] Booster Mode for remedial lessons
- [ ] Teacher Control Panel
- [ ] Custom Speaking Agent
- [ ] User database investigation ("not real users" concern)
- [ ] server.py refactoring into proper FastAPI project structure

## Key API Endpoints
- POST /api/v1/payments/upload-bank-transfer - Bank transfer approval
- GET /api/v1/users/me/plan - User plan with expiry check
- GET /api/v1/unified-learning/check-lesson-lock-status - Lesson access check
- GET /api/unified/stages/{stage_id} - Stage units
- GET /api/admin/vocabulary-groups - Vocabulary words grouped by lesson (admin)
- POST /api/admin/vocabulary/update-image - Upload/update vocabulary image (admin)
- POST /api/auth/register - User registration
- POST /api/auth/login - User login

## Key Files
- /app/backend/server.py - Monolithic backend (includes admin vocab endpoints)
- /app/backend/seed_content_v4.py - Content seeder (all stages)
- /app/frontend/src/pages/AdminDashboard.js - Central admin hub
- /app/frontend/src/pages/VocabularyImageManager.js - Image management tool
- /app/frontend/src/pages/AdminPanel.js - User management (at /admin/users)
- /app/frontend/src/pages/PricingPage.js - Pricing with QR modal
- /app/frontend/src/lib/i18n.js - Translations
- /app/backend/content/ - 24 JSON content files (stage1 + stage2)
