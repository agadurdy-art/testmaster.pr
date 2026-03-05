# TESTMASTER - Mastery-Based English Learning Platform

## Product Requirements Document (PRD)

### Vision
A mastery-based English learning platform following Cambridge Young Learners methodology.

### Core Architecture
- **Frontend:** React (CRA) with Shadcn/UI components
- **Backend:** FastAPI (Python) with MongoDB
- **AI Content:** Claude Sonnet 4.5 (via Emergent LLM Key)
- **AI Images:** GPT Image 1 (60 words) + Nano Banana 2 (90 words) + bestflashcard.com scraped (93 words)
- **TTS:** ElevenLabs - ALL vocab + listening audio pre-generated
- **Speech:** OpenAI Whisper for pronunciation evaluation
- **Payments:** PayPal Orders API + Bank Transfer

### Pricing Structure (Implemented Mar 5, 2026)

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | Stage 1 only |
| **Explorer** | $4.99/mo | All 8 stages, games, audio |
| **Learner** | $9/mo | + Liz AI Teacher, Mastery Course |
| **Achiever** | $19/mo | + Advanced Mastery, Speaking eval, Unlimited Liz |
| **Master** | $29/mo | + AI Speaking Agent, Full mock exams |

### What's Implemented
- [x] Stage 1 & Stage 2 content (24 units, 96 lessons)
- [x] 243/243 vocabulary images (100% coverage)
- [x] ElevenLabs TTS: all audio pre-generated
- [x] Speaking evaluation with punctuation-safe scoring
- [x] **4-tier pricing system** (Explorer/Learner/Achiever/Master)
- [x] **Plan-based access control** (backend + frontend)
- [x] **Stage locking** for free users (Stage 2-8 locked)
- [x] **Feature locking** (Liz, Mastery, Advanced, Speaking)
- [x] **New pricing page** with PayPal + Bank Transfer
- [x] PayPal Subscriptions setup guide (`/app/docs/PAYPAL_SUBSCRIPTIONS_GUIDE.md`)

### Key Endpoints
- `GET /api/plan/features` - All plan features and prices (public)
- `GET /api/user/plan-info/{email}` - User plan info
- `POST /api/payments/paypal/create-order` - PayPal order
- `POST /api/payments/paypal/capture-order` - PayPal capture
- `GET /api/unified/stages` / `GET /api/unified/lessons/:lessonId`
- `POST /api/speech/evaluate` / `POST /api/unified/pronunciation/check`

### Key Files
- `/app/backend/plan_access.py` - Plan tier definitions, feature access logic
- `/app/frontend/src/pages/PricingPage.js` - 4-tier pricing page
- `/app/frontend/src/pages/UnifiedCoursePage.js` - Stage locking
- `/app/frontend/src/pages/Dashboard.js` - Feature locking
- `/app/frontend/src/components/LizFloatingButton.js` - Liz access control
- `/app/docs/PAYPAL_SUBSCRIPTIONS_GUIDE.md` - PayPal recurring setup guide

### Pending / Backlog
- [ ] PayPal Subscriptions API (otomatik aylık yenileme) - rehber hazır
- [ ] Own AI Speaking Agent (Whisper + GPT-4o + OpenAI TTS) - Master plan için
- [ ] Monthly usage tracking (soft limits per plan)
- [ ] Daily Habit SRS system
- [ ] Teacher Control Panel
- [ ] Stages 3-8 content generation
- [ ] Stage 1 content re-enrichment
- [ ] Vocabulary completion bug verification
