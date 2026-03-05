# TESTMASTER - Mastery-Based English Learning Platform

## Product Requirements Document (PRD)

### Pricing Structure

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
- [x] 243/243 vocabulary example sentences + definitions (AI-generated)
- [x] ElevenLabs TTS pre-generated audio
- [x] Speaking evaluation with Whisper prompt hint
- [x] 4-tier pricing with PayPal Subscriptions (Live)
- [x] Plan-based access control + stage/feature locking
- [x] Pricing page with 3-language support (EN/VI/TR)
- [x] Landing page pricing section
- [x] PayPal webhook for renewals/cancellations
- [x] Bank transfer 30-day temporary plan activation (auto-downgrade to free after expiry)
- [x] **Smart Lock system** - sequential lesson/unit progression with admin bypass

### Key Fixes (Mar 5, 2026)
- Fixed empty example sentences for all 243 vocabulary words
- Fixed Whisper pronunciation detection by adding target word prompt hint
- Updated pricing page with full i18n support
- Implemented 30-day expiry for bank transfer payments with auto-downgrade
- Implemented Smart Lock: lessons unlock sequentially within units, units unlock after completing all lessons in previous unit
- Admin emails (aga.durdy@gmail.com, stemhousebenluc@gmail.com) bypass all locks

### Pending / Backlog
- [ ] Bank transfer expiry email reminder (3 days before expiry)
- [ ] Own AI Speaking Agent (Master plan)
- [ ] Monthly usage tracking enforcement
- [ ] Stages 3-8 content generation
- [ ] Daily Habit SRS system
- [ ] Teacher Control Panel
- [ ] Booster Mode (remedial lessons)
- [ ] Investigate user database ("not real users")
- [ ] Stage 1 content re-enrichment
- [ ] Re-enable Certification Gate
