# TESTMASTER - Mastery-Based English Learning Platform

## Product Requirements Document (PRD)

### Vision
A mastery-based English learning platform following Cambridge Young Learners methodology.

### Core Architecture
- **Frontend:** React (CRA) with Shadcn/UI components
- **Backend:** FastAPI (Python) with MongoDB
- **Payments:** PayPal Orders API + Bank Transfer

### Pricing Structure (Updated Mar 5, 2026)

| Plan | Price | Stages | Speaking | Liz AI | Mastery | Advanced |
|------|-------|--------|----------|--------|---------|----------|
| **Free** | $0 | Stage 1 | - | - | - | - |
| **Explorer** | $4.99/mo | All 8 | 1 test/mo | - | - | - |
| **Learner** | $9/mo | All 8 | 5 tests/mo | 50 msg | Yes | - |
| **Achiever** | $19/mo | All 8 | Unlimited | 150 msg | Yes | Yes |
| **Master** | $29/mo | All 8 | Unlimited | Unlimited | Yes | Yes + Agent |

### What's Implemented
- [x] Stage 1 & Stage 2 content (24 units, 96 lessons)
- [x] 243/243 vocabulary images (100% coverage)
- [x] ElevenLabs TTS pre-generated audio
- [x] Speaking evaluation with punctuation-safe scoring
- [x] 4-tier pricing (Explorer/Learner/Achiever/Master)
- [x] Plan-based access control (backend + frontend)
- [x] Stage locking for free users
- [x] Feature locking (Liz, Mastery, Advanced, Speaking)
- [x] Pricing page with PayPal + Bank Transfer
- [x] Landing page pricing section
- [x] Speaking credits per plan (Explorer:1, Learner:5, Achiever+:unlimited)

### Key Files
- `/app/backend/plan_access.py` - Plan definitions
- `/app/frontend/src/pages/PricingPage.js` - Pricing page
- `/app/frontend/src/pages/LandingPage.js` - Landing with pricing section
- `/app/frontend/src/pages/UnifiedCoursePage.js` - Stage locking
- `/app/frontend/src/pages/Dashboard.js` - Feature locking

### Pending / Backlog
- [ ] PayPal Subscriptions API (otomatik aylık yenileme)
- [ ] Own AI Speaking Agent (Master plan)
- [ ] Monthly usage tracking (soft limits)
- [ ] Daily Habit SRS system
- [ ] Teacher Control Panel
- [ ] Stages 3-8 content generation
