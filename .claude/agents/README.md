# testmaster.pro agent team

A 31-agent team for always building, verifying, **marketing, and localizing**
testmaster.pro ("IELTS Ace") + its GE sibling. Invoke an agent with the Agent tool (e.g.
`subagent_type: "release-captain"`), or just describe the task — the main loop dispatches
by each agent's `description`. Squads: **product** (build + QA), **marketing**, and a
**localization** sub-squad (native-speaker transcreation + i18n QA, all 11 shipped languages).

## Roster

### Orchestrator
- **release-captain** — plans the release, dispatches build/QA agents, enforces the
  mandatory gates, declares "deployed" only after verification.

### Build
- **frontend-builder** — React/`frontend/src`: routes, pages, i18n, design, client auth.
- **backend-builder** — FastAPI routes/services, Mongo, R2, auth gating, scoring, payments.
- **content-author** — exam-valid, non-guessable passages/clips/questions/lessons.
- **audio-producer** — ElevenLabs persona audio + STT verification + R2 versioned upload.
- **media-pipeline** — vocab/lesson images via local Apache-2.0 mflux only (no paid APIs).

### Test / QA (gates)
- **pedagogy-reviewer** — MANDATORY: teacher's eye on pedagogy + data shape.
- **student-walkthrough** — MANDATORY: learner's eye on runtime (buttons, leaks, races).
- **content-auditor** — objective metrics: 0 guessable tells, key spread, STT-clean.
- **security-auditor** — IDOR / admin-spoof / hardcoded secrets / dep vulns.
- **cost-guardian** — right model per path (Sonnet/Haiku, no Gemini), idempotency, leaks.
- **deploy-verifier** — proves it's actually live (bundle hash + probes + login walkthrough).

## Marketing squad

### Orchestrator
- **marketing-lead** — plans campaigns, dispatches specialists, holds brand voice, gates
  every public asset through brand-compliance.

### Specialists
- **copywriter** — landing/ad/blog/lead-magnet copy, product-accurate.
- **seo-strategist** — keyword/intent research, on-page + i18n (12-lang) content plan.
- **social-media-manager** — short-form scripts, posts, calendar (Vietnam/Zalo + global).
- **email-marketer** — Resend lifecycle: lead magnet → nurture → reactivation → upgrade.
- **growth-analyst** — funnel, A/B, pricing-page conversion, analytics.

### Gate
- **brand-compliance** — MANDATORY: fact-checks every claim vs shipped product + enforces
  the hard brand rules. The marketing counterpart to pedagogy/security gates.

### Localization squad (under marketing)
- **localization-lead** — coordinates native-speaker transcreation + live i18n/UI QA across
  the app's shipped languages; dedupes, keeps a glossary; everything still passes
  brand-compliance.
- **loc-vi / loc-zh / loc-ar / loc-es / loc-pt / loc-tr / loc-ko / loc-th / loc-ja /
  loc-ru / loc-id** — native specialists for all 11 shipped non-English languages
  (Vietnamese, Mandarin-Simplified, Arabic+RTL, Spanish, Portuguese, Turkish, Korean,
  Thai, Japanese, Russian, Indonesian). Each: native register (slang/idioms known but
  applied with care), market + cultural knowledge, real `LANGUAGES` codes, language-specific
  i18n traps (RTL, CJK/Thai line-breaking, Turkish İ/ı casing, Russian pluralization,
  text-expansion), dual role = marketing transcreation + per-language UI/i18n QA.

## Marketing flow (enforced by marketing-lead)

```
goal → specialists draft to /marketing/ (parallel)
     → [MANDATORY GATE] brand-compliance  ← every public asset
     → site copy via frontend-builder · emails via email-marketer (Resend)
     → growth-analyst measures + iterates
```

### Marketing brand rules baked into every marketing agent
- Name "Aga" NEVER in public/marketing/email copy.
- Founder = "10+ yrs English teacher + active IELTS student"; NEVER "IELTS instructor".
- No solo-teacher commitments (no 1-on-1 review / DM / live grading / video lessons).
- No competitor names or "Cambridge" on the landing/public pitch.
- Only shipped features + locked prices (Free/$2.99/$9.99/$19.99); no unbacked promises.
- Honest, opt-in, no dark patterns. Free tools (`/quick-assessment`, `/score-my-essay`)
  are the top of funnel. IELTS (Liz) and GE (Ray) stay separate; Stemhouse is a separate site.

## Release flow (enforced by release-captain)

```
request
  → build agents (parallel)
  → [MANDATORY GATE] pedagogy-reviewer + student-walkthrough   ← any learner-facing change
  → automated audits (parallel): content-auditor / security-auditor / cost-guardian
  → push
  → deploy-verifier  (live evidence)
  → only now: "deployed / live"
```

## Standing constraints baked into the agents
- No paid image APIs — Apache-2.0 local weights only (FLUX.2 klein 4B / FLUX.1-schnell).
- No paid LLM/STT calls from scripts — audit/content/review is in-session. Audio QA = Scribe.
- Product evals = Sonnet; helpers = Haiku; Gemini is dead in live paths.
- Strict IELTS (`/dashboard`) vs GE (`/ge/dashboard`) separation; switcher admin-only.
- Name "Aga" never in public/marketing/email copy.
- Deploy message only after push is verified (commit + push + ls-remote + live probe).
- Live branch: `conflict_280426_1612`.
