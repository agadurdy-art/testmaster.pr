# TESTMASTER - Mastery-Based English Learning Platform

## Product Requirements Document (PRD)

### Vision
A mastery-based English learning platform following Cambridge Young Learners methodology.

### Core Architecture
- **Frontend:** React (CRA) with Shadcn/UI components
- **Backend:** FastAPI (Python) with MongoDB
- **Payments:** PayPal Subscriptions API (recurring) + Bank Transfer

### Pricing Structure

| Plan | Price | Stages | Speaking | Liz AI | Mastery | Advanced |
|------|-------|--------|----------|--------|---------|----------|
| **Free** | $0 | Stage 1 | - | - | - | - |
| **Explorer** | $4.99/mo | All 8 | 1 test/mo | - | - | - |
| **Learner** | $9/mo | All 8 | 5 tests/mo | 50 msg | Yes | - |
| **Achiever** | $19/mo | All 8 | Unlimited | 150 msg | Yes | Yes |
| **Master** | $29/mo | All 8 | Unlimited | Unlimited | Yes | Yes + Agent |

### PayPal Subscription Plan IDs
- Explorer: P-01067231X8887700NNGUZXZI
- Learner: P-8PA72532LU348322JNGUZYWY
- Achiever: P-0BT993836S704213PNGUZZJQ
- Master: P-06T688388Y238120JNGUZZ4I
- Client ID: AbYQyH9_NcTZlPDBtWpTha07Wn-VMTTmDEnP4XC_QlxJXiXnXn0r3Tb5yp8vFJAMoa_p-p87kfWp1mXD

### What's Implemented
- [x] Stage 1 & Stage 2 content (24 units, 96 lessons)
- [x] 243/243 vocabulary images (100% coverage)
- [x] 4-tier pricing (Explorer/Learner/Achiever/Master)
- [x] Plan-based access control (backend + frontend)
- [x] **PayPal Subscriptions API** (monthly recurring)
- [x] Subscription activation endpoint
- [x] Subscription webhook for renewals/cancellations
- [x] Landing page pricing section
- [x] Bank transfer payment option

### Key Endpoints
- `POST /api/payments/paypal/activate-subscription` - Activate subscription
- `POST /api/payments/paypal/subscription-webhook` - Webhook for renewals
- `GET /api/plan/features` - All plan features (public)
- `GET /api/user/plan-info/{email}` - User plan info

### Pending / Backlog
- [ ] Own AI Speaking Agent (Master plan) - Whisper + GPT-4o + TTS
- [ ] Monthly usage tracking enforcement
- [ ] Stages 3-8 content generation
- [ ] Daily Habit SRS system
- [ ] Teacher Control Panel
- [ ] PayPal webhook configuration (user needs to add webhook URL in PayPal Dashboard)
