# IELTS Ace - Product Requirements Document

## Original Problem Statement
AI-powered IELTS practice platform with Cambridge-aligned examination simulation.

## User Personas
- **IELTS Candidates**: Students preparing for Academic or General Training IELTS exams
- **Admin**: Content manager who uploads visuals and manages test sets

## Core Architecture
- **Frontend**: React + Shadcn/UI + Tailwind CSS
- **Backend**: FastAPI + MongoDB
- **TTS**: ElevenLabs for listening audio generation
- **LLM**: Emergent LLM Key (currently mocked for speaking feedback)

## What's Been Implemented

### Phase 1 - Core Test Platform (Completed)
- Cambridge-style test interface (Reading, Listening, Writing, Speaking)
- Evaluation engine with band scoring
- Question Bank with multiple test types

### Phase 2 - Feedback Engine (Completed)
- Reason codes for mistakes (SPELLING_ERROR, TFNG_CONFUSION etc.)
- Evidence text from reading passages
- Advanced retry (Wrong-Only, By Type/Reason)
- Speaking feedback: Fluency insights, Drills, Model answers
- "One Next Step" CTA with Focus Plan page

### Phase 3 - Real Visual Test Sets (Completed - Feb 12, 2026)
- **26 real IELTS visuals** uploaded by user, classified and cataloged
- **5 existing sets (A-E)** Writing Task 1 replaced with real visuals:
  - Set A: Line Graph (urbanisation - 4 SE Asian countries)
  - Set B: Bar Chart (US households by income)
  - Set C: Process Diagram (plastic recycling) + Recreation Ground map (Listening)
  - Set D: Floor Plan Comparison (Central Library before/after)
  - Set E: Map Comparison (Southwest Airport before/after development)
- **3 new sets (F, G, H)** created with real visuals + full content:
  - Set F: Line Graph (metal prices) + Farley House map (Listening)
  - Set G: Paired Line Graphs (appliances + housework) + Stevenson's site (Listening)
  - Set H: Process Diagram (sugar production) + Bidcaster dig map (Listening)
- **TTS audio generated** for all new listening scripts (12 parts for F,G,H + 1 for Set C)
- **Frontend unlocked** - all 8 sets visible and clickable
- **Before/after visual rendering** added to FullTestInterface
- All visual images served via /api/visuals/image/ endpoint
- 30/30 backend tests passed

### Remaining Visuals (Saved for Future Sets)
11 unused visuals stored in /app/backend/content/user_visuals/:
- #3 Map: Housing estate, #7 Recreation with questions
- #8+#9 Qanat diagrams, #16 Norbiton before/after
- #17 Police budget table+pie, #18 Weekly spending bar
- #19 Shop closures line graph, #21 Participants line graph
- #22 Biofuel ethanol process, #23 Dance classes pie+bar
- #25 Library Chalfont mixed chart

## Prioritized Backlog

### P0 - Done
- [x] Test set visuals replaced with real ones
- [x] New test sets created (F, G, H)
- [x] Audio generated for new listening scripts
- [x] Frontend sets unlocked

### P1 - Upcoming
- [ ] Conversion Optimization (scope TBD)
- [ ] Create sets I-P from remaining 11 visuals

### P2 - Future
- [ ] Writing Rewrite (diff engine)
- [ ] Component Refactor (CambridgeTestInterface.js, ResultsPage.js)

### P3 - Backlog
- [ ] Analytics Phase (Heatmap)
- [ ] Real LLM integration (replace mocked speaking feedback)
