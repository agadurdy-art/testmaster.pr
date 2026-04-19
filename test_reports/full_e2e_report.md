# IELTS Ace Platform — Full E2E Test Report
**Date**: 2026-02-11
**Total Tests**: 74 passed, 4 skipped, 0 failed
**Runtime**: ~3 minutes

---

## Test Coverage Summary

| Category | Tests | Status |
|----------|-------|--------|
| Infrastructure & Books | 3 | PASS |
| IELTS 18 Data Integrity (4 tests x 5 checks) | 20 | PASS |
| Answer Key Completeness | 4 | SKIPPED (endpoint not exposed) |
| Evaluation Engine (reason codes, evidence, bands) | 11 | PASS |
| Speaking Drills + Model Answers | 13 | PASS |
| Question Type Coverage (Listening + Reading) | 8 | PASS |
| Retry by Type/Reason | 2 | PASS |
| Auth Flow (Register + Login) | 1 | PASS |
| Phase 2 Features (reason codes, evidence, retry) | 16 | PASS |

---

## Feature Status

### Core Platform
- Books API: ielts17 (4 tests), ielts18 (4 tests)
- Auth: Register + Login working
- Test Data: All 4 IELTS 18 tests load correctly

### IELTS 18 Data Integrity
- Listening: 4 parts per test, 30+ questions each — PASS
- Reading: 3 passages per test, 30+ questions each — PASS
- Writing: 2 tasks per test — PASS
- Speaking: 3+ parts per test — PASS

### Evaluation Engine
- Band scoring — PASS
- Reason codes (UNANSWERED, TFNG_CONFUSION, SPELLING_ERROR, DISTRACTOR_TRAP, NEAR_MISS, WRONG_ANSWER) — PASS
- Reason summary aggregation — PASS
- Evidence text extraction from reading passages — PASS
- Fastest score gain — PASS
- Integrity warnings — PASS

### Speaking P2
- Drill generation (template + LLM personalization) — PASS
- Model answer generation (Band 7 + Band 8) — PASS
- Model answer caching (MongoDB) — PASS
- Drill templates (fluency, lexical, grammar, pronunciation) — PASS

### One Next Step CTA
- Decision engine (client-side, tested via frontend) — PASS
- Focus Plan page — PASS

---

## How to Re-run These Tests (No tokens needed!)

```bash
cd /app && python3 -m pytest backend/tests/ -v --tb=short --ignore=backend/tests/test_pronunciation_azure.py
```

Individual suites:
```bash
# Full E2E (infrastructure, data integrity, evaluation, speaking, auth)
python3 -m pytest backend/tests/test_e2e_full.py -v

# Phase 2 features only (reason codes, evidence, retry)
python3 -m pytest backend/tests/test_mistake_analysis.py -v

# Speaking P2 only (drills, model answers)
python3 -m pytest backend/tests/test_speaking_p2.py -v
```
