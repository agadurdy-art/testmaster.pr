# IELTS Ace - AI-Powered IELTS Preparation Platform

## Original Problem Statement
Full-stack IELTS preparation platform with AI-powered features including vocabulary, grammar, reading, listening, writing evaluation, speaking practice, and a comprehensive question bank. The platform uses a subscription model with PayPal and bank transfer payment options.

## User Personas
- **IELTS Students**: Primary users preparing for IELTS exam (Vietnamese, Turkish, English speakers)
- **Admin Users**: aga.durdy@gmail.com, stemhousebenluc@gmail.com (bypass lesson lock)

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

## Completed (Latest Session - March 2026)
- [x] Downloaded and saved 4 VietQR code images for bank transfer plans
- [x] Verified QR code modal shows correct QR for each plan (Explorer, Learner, Achiever, Master)
- [x] Hardcoded Turkish text fix confirmed by user
- [x] Fixed `option.toLowerCase is not a function` crash in Listening, Reading, Grammar, Vocab activities
- [x] **Vocabulary Images in Games**: Games now use vocabulary section's real images instead of emojis
  - Updated EmojiCard, ReadChoosePicture, ListenChoosePicture, FlashcardMatch, MemoryGame, LookWrite, UnscrambleLetters
  - Consistency rule: all options must have images, otherwise all use emojis
- [x] **Context-Aware Image Generation**: Generated 55+ new cartoon illustrations for missing distractor words
  - Fixed "mouse" (computer mouse → animal mouse for pet lessons)
  - Coverage: 58% → 81% of game items now show real images
  - Images stored at /app/backend/static/vocab_images/
- [x] Fixed wrong emoji mappings (115 corrections across 21 lessons)

## P0 - Resolved
- [x] Bank Transfer QR Code Display - QR images were 0 bytes, now populated with real VietQR images
- [x] Hardcoded Turkish Text in Question Bank - User confirmed fix is working

## P1 - Pending
- [ ] Vocabulary Word Completion Bug - Regression test needed (completing one word may mark all as complete)
- [ ] Map Generator Status - Report to user (no code found, likely a new feature request)

## P2 - Backlog
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
- GET /api/v1/unified-learning/stages/{stage_id} - Stage units (sorted by unit_number)
- POST /api/auth/register - User registration
- POST /api/auth/login - User login

## Key Files
- /app/backend/server.py - Monolithic backend
- /app/frontend/src/pages/PricingPage.js - Pricing with QR modal
- /app/frontend/src/assets/payments/ - QR code images
- /app/frontend/src/lib/i18n.js - Translations
