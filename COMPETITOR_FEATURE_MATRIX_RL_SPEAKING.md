# Feature Gap Matrix — Reading / Listening / Speaking

**Scope:** Targeted comparison of IELTS Ace vs. the 5 reference competitors
covered in `COMPETITOR_ANALYSIS_REPORT.md`, focused on the three skills the
recent backlog (#136–#146) hardened. Source for IELTS Ace columns is the
current code on branch `conflict_280426_1612` (2026-05-01).

Legend:
- `✓` = shipped and reachable from product UI
- `~` = partial / behind a flag / not on the primary surface
- `✗` = missing
- `n/a` = competitor does not offer the feature

---

## Reading

| Capability | IELTS Ace | Test Pro | IELTS Online Tests | Test Simulation | Test-English | IELTS.org |
|---|---|---|---|---|---|---|
| Cambridge-format passages (3-passage set, 40 Q) | ✓ | ✓ | ✓ | ✓ | ~ | ✓ |
| Multi-MCQ ("select TWO") with set-equality scoring | ✓ (#140) | ✓ | ✓ | ~ | ✗ | ✓ |
| Per-question evidence excerpt in result | ✓ (#142) | ~ | ✗ | ✗ | ✗ | ✗ |
| Reason-coded mistakes (skim/inference/lexical/etc.) | ✓ (#142) | ✓ | ✗ | ✗ | ✗ | ✗ |
| Passage-grouped review with per-group score | ✓ (#142) | ✗ | ✗ | ✗ | ✗ | ✗ |
| Auto-tagged weak sub-skills | ✓ | ✓ | ~ | ✗ | ✗ | ✗ |
| LLM-narrated root-cause + 3-day study plan | ✓ (#146, gated) | ~ | ✗ | ✗ | ✗ | ✗ |
| Lesson-registry deep-link from mistakes | ✓ | ~ | ✗ | ✗ | ✗ | ✗ |
| Backend `/api/reading/evaluate` (server-side scoring) | ✓ (#139) | ✓ | ✓ | ~ | ✗ | ✓ |
| General Training + Academic tracks | ✓ | ✓ | ✓ | ~ | ~ | ✓ |
| Content volume (passages) | ~ (mastery + Cambridge sets) | ✓ 267 tests | ✓ huge | ~ | ~ | ~ |

**Where we lead:** evidence excerpt, reason chips, passage-grouped review, LLM narrative.
**Where we trail:** raw content volume vs Test Pro / IELTS Online Tests.

---

## Listening

| Capability | IELTS Ace | Test Pro | IELTS Online Tests | Test Simulation | Test-English | IELTS.org |
|---|---|---|---|---|---|---|
| Part 1–4 question bank with audio | ✓ | ✓ | ✓ | ✓ | ~ | ✓ |
| ElevenLabs cached audio (multi-voice for dialogue) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Multi-MCQ scoring fix (set equality) | ✓ (#140) | ✓ | ✓ | ~ | ✗ | ✓ |
| Per-part grouped result review | ✓ (#143) | ✗ | ✗ | ✗ | ✗ | ✗ |
| Reveal full transcript after submission | ✓ (#143) | ~ | ~ | ✗ | ✗ | ✗ |
| Auto-tagged weak sub-skills (numbers, dates, inference, …) | ✓ | ✓ | ~ | ✗ | ✗ | ✗ |
| LLM-narrated root-cause + 3-day study plan | ✓ (#146, gated) | ~ | ✗ | ✗ | ✗ | ✗ |
| Lesson-registry deep-link from mistakes | ✓ | ~ | ✗ | ✗ | ✗ | ✗ |
| Backend evaluate endpoint | ✓ | ✓ | ✓ | ~ | ✗ | ✓ |
| Content volume (audio sets) | ~ | ✓ 270 tests | ✓ huge | ~ | ~ | ~ |

**Where we lead:** transcript reveal, per-part grouping, multi-voice audio.
**Where we trail:** content volume; no offline mode.

---

## Speaking

| Capability | IELTS Ace | Test Pro | IELTS Online Tests | Test Simulation | Test-English | IELTS.org |
|---|---|---|---|---|---|---|
| AI band scoring (FC/LR/GRA/PR) | ✓ Sonnet | ✓ | ~ | ✗ | ✗ | examiner |
| Cambridge-calibrated prompt + descriptor anchors | ✓ (#55–#59) | ~ | ✗ | ✗ | ✗ | n/a |
| Holistic Full Test scoring (one band, 3 parts) | ✓ (#60–#61) | ~ | ✗ | ✗ | ✗ | ✓ |
| Azure pronunciation: per-word accuracy + phonemes | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Premium pronunciation drawer (problem phonemes UI) | ✓ (#136) | ✗ | ✗ | ✗ | ✗ | ✗ |
| CEFR vocabulary distribution (A1–C2 stacked bar) | ✓ (#137) | ✗ | ✗ | ✗ | ✗ | ✗ |
| Fluency metrics (WPM, pauses, fillers, unique tokens) | ✓ | ~ | ✗ | ✗ | ✗ | ✗ |
| Liz coach token-level pronunciation notes | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Live conversational practice (real LLM voice agent) | ✓ ElevenLabs | ✗ | ✗ | ✗ | ✗ | ✗ |
| Live conversation → same evaluator schema as practice | ✓ (#138) | ✗ | ✗ | ✗ | ✗ | ✗ |
| Per-part picker (Part 1/2/3 standalone) | ✓ (#89–#90) | ✓ | ✓ | ~ | ✗ | ~ |
| Cue card pool (50+ Part 2 cards) | ✓ (#88) | ✓ | ✓ | ~ | ✗ | ~ |
| Tier-based quota (free vs premium) | ✓ | ✓ | ~ | ✗ | ✗ | n/a |

**Where we lead:** Azure phoneme analysis, CEFR profile, ElevenLabs Liz Live with full eval parity, calibration discipline against Cambridge anchors.
**Where we trail:** content depth (Test Pro: 114 speaking tests).

---

## Cross-cutting

| Capability | IELTS Ace | Test Pro | IELTS Online Tests | Test Simulation | Test-English | IELTS.org |
|---|---|---|---|---|---|---|
| Mobile app | ✗ | ✓ | ~ | ✗ | ✗ | ✗ |
| Offline mode | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Daily streak / study-time tracking | ✓ | ~ | ✗ | ✗ | ✗ | ✗ |
| Course library (47 topics) | ✓ | ✓ | ✓ | ~ | ~ | ~ |
| Personalised lesson recommendations from mistakes | ✓ | ~ | ✗ | ✗ | ✗ | ✗ |
| Anonymous trial (no signup) | ✓ score-my-essay / score-my-speaking | ~ | ~ | ✓ | ✓ | ✓ |
| Live human teacher review | ✗ (by design — solo founder) | ✗ | ✗ | ✗ | ✗ | n/a |

---

## Strategic implications

1. **Differentiation is qualitative, not volumetric.** Test Pro and IELTS Online Tests dominate on raw content count; IELTS Ace dominates on per-mistake explanation depth, calibration discipline, and live conversational practice. Marketing should lean into the qualitative axes — "we tell you *why* you got it wrong" — rather than competing on test count.

2. **The R/L narrative gap is now closeable.** Before #146, no competitor had per-mistake LLM narrative on R/L either. Flipping `SONNET_QB_ANALYSIS_ENABLED=true` after a sample-cost check turns this into a unique selling point with no peer parity.

3. **Speaking is the firmest moat.** Combination of Cambridge-calibrated Sonnet + Azure pronunciation + ElevenLabs Liz Live is unmatched in this comparison set. Speaking should anchor the premium-tier value story.

4. **Content backfill is the obvious gap.** Reading/Listening volume trails Test Pro by an order of magnitude. Either a content-generation push (using existing Cambridge-format generators) or a curated-quality pitch ("fewer tests, deeper feedback") is needed to neutralise this in marketing.

5. **No mobile / offline is acceptable for now.** Aga is solo; mobile apps are not on the roadmap. Web + PWA caching could close this partially without dedicated apps.
