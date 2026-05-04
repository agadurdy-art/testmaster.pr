# Strategies Guide — Content Schema (v3)

## Source
Faithfully ported from "The Complete IELTS Preparation Guide" PDF (237 pages).
**Critical rule:** Strategies, examples, and explanations from the PDF are transcribed VERBATIM in `narrative`, `comparison`, `strategy_steps`, etc. The v3 enhancement layer (`worked_example`, `quiz`, `common_mistakes`) is OUR pedagogical addition and is allowed to be original — but it must use PDF-grounded examples (real Cambridge/IELTS-style questions, real student errors), NOT fabricated content. Liz framing remains confined to lesson intro/outro wrappers.

## v3 changelog (enhancement layer — student-mode pedagogy)
- New slide types: `worked_example`, `quiz`, `common_mistakes`. These turn each lesson from "teacher monologue" into "student studies".
- Authoring contract: enhancement slides are placed AFTER the verbatim PDF strategy slides, BEFORE the `practice_link` CTA.
- Each lesson should ideally include: 1 `worked_example` (PDF question walked step-by-step), 1 `quiz` (3 self-check Qs), 1 `common_mistakes` (anti-pattern + correction pairs from teacher experience).
- Backwards compatible — chapters without v3 slides still render; v3 slides simply add to the lesson body.

## v2 changelog
- Photographic imagery is now first-class. Most slide types accept an optional `image` field. Path convention below.
- New slide types: `split_visual`, `photo_hero`, `analogy_3up`, `big_typography`, `timeline_zigzag`.
- `hero` gains `image` + `image_layout`.
- `comparison` columns gain optional per-column `image`.
- `strategy_steps` gains `variant` (chevron / icon_circle / numbered_card).
- `icon_grid` gains `variant` (outline / circular_badge / topline_icon).
- `factboard` gains `variant` (label_value / big_number).
- `eyebrow` field standardised across types with `eyebrow_tone`.

## File layout
```
content/strategies_guide/
  index.json                    # All chapters and lessons map
  listening/
    a_to_z.json                 # Chapter 02 — A-to-Z Listening (pp 26-65)
    segment_slides.json         # Chapter 01 — Listening Segment Slides (pp 3-25)
  reading/
    a_to_z.json                 # Chapter 04 — A-to-Z Reading (pp 110-151)
    segment_slides.json         # Chapter 03 — Reading Segment Slides (pp 66-109)
  speaking/
    segment_slides.json         # Chapter 05 — Speaking Segment Slides (pp 152-175)
  writing/
    segment_slides.json         # Chapter 06 — Task 2 Segment Slides (pp 176-202)
    task2_structures.json       # Chapter 07 — Task 2 Structures Guide (pp 203-229)
  vocabulary/
    improvement_plan.json       # Chapter 08 — Vocabulary Improvement Plan (pp 230-237)
```

## Image asset path convention
```
backend/static/strategies/{skill}/{chapter_slug}/p{page}_{slot}.jpg
```
Examples:
- `static/strategies/listening/intro/p03_top.jpg`
- `static/strategies/listening/intro/p08_left.jpg`
- `static/strategies/listening/intro/p08_right.jpg`
- `static/strategies/listening/intro/p11_circle1.jpg`

Slots: `top | bottom | left | right | full | circle1 | circle2 | circle3`.
Frontend resolves with `${REACT_APP_BACKEND_URL}/static/strategies/...`.

## Skill color palette (our system, not PDF orange)
| Skill      | Accent  |
|------------|---------|
| listening  | emerald |
| reading    | sky     |
| speaking   | violet  |
| writing    | amber   |
| vocabulary | rose    |

All accent uses (eyebrow filled bg, vertical bar quote, callout tint, outlined card border, circular icon bg, timeline node) inherit the active skill color.

## Eyebrow badges
Reusable across `hero`, `photo_hero`, `split_visual`, `big_typography`, and any slide that opens a section.
```json
{ "eyebrow": "TEST FORMAT", "eyebrow_tone": "default" }
```
Tones:
- `default` — skill-color filled rounded badge (TEST FORMAT, ANALYSIS, FREE RESOURCES, STRATEGY DEMO)
- `outlined` — skill-color outline only (#1, #2, #3, GAME CHANGERS)
- `warning` — amber filled (WARNING)
- `critical` — rose filled (CRITICAL, IMPORTANT)
- `numbered` — outline with `#N` style

## Chapter JSON shape
```json
{
  "chapter_id": "listening_segment_slides",
  "chapter_number": 1,
  "skill": "listening",
  "title": "IELTS Listening: What Successful Students Do Differently",
  "subtitle": "Based on 10+ years working with thousands of Band 7, 8 & 9 students",
  "source_pages": [3, 25],
  "lessons": [
    {
      "lesson_id": "intro",
      "lesson_number": 0,
      "title": "Introduction",
      "source_pages": [3, 11],
      "slides": [ ...Slide ]
    }
  ]
}
```

## Slide types (verbatim content; renderer chooses layout)

### `hero`
Cover slide (chapter or lesson opener). Optional photo support.
```json
{
  "type": "hero",
  "eyebrow": "INTRODUCTION",          // optional
  "eyebrow_tone": "default",          // optional, see palette above
  "title": "IELTS Listening: What Successful Students Do Differently",
  "subtitle": "Based on 10+ years...",
  "image": "/static/strategies/listening/intro/p03_top.jpg",   // optional
  "image_layout": "stacked",          // stacked | fullbleed_top | split_left | split_right | none
  "images": [                         // optional, used when image_layout=stacked (multiple stacked photos)
    "/static/strategies/listening/intro/p03_top.jpg",
    "/static/strategies/listening/intro/p03_bottom.jpg"
  ],
  "page": 3
}
```

### `photo_hero`
Full-bleed photo header followed by titled body. Used when the page is dominated by a wide photo (p6, p18).
```json
{
  "type": "photo_hero",
  "image": "/static/strategies/listening/intro/p06_top.jpg",
  "eyebrow": "IMPORTANT",             // optional
  "eyebrow_tone": "default",
  "title": "What Successful Students Know",
  "intro": "Focus on getting **100% in Sections 1, 2 & 3** first. Section 4's harder questions are designed to separate Band 8s from Band 9s.",  // optional accent-bar intro
  "body": [                           // optional sub-content
    { "type": "icon_grid_inline", "cards": [ ... ] }
  ],
  "page": 6
}
```

### `split_visual`
Photo + content side-by-side. The most common layout in the intro chapter.
```json
{
  "type": "split_visual",
  "image": "/static/strategies/listening/intro/p04_left.jpg",
  "image_position": "left",           // left | right
  "eyebrow": "TEST FORMAT",           // optional
  "eyebrow_tone": "default",
  "title": "IELTS Listening Test Format",
  "subtitle": "...",                  // optional
  "blocks": [                         // mixed content stack on the non-photo side
    { "kind": "card_list", "cards": [
      { "title": "30 Minutes", "body": "Plus 10 minutes to transfer answers" },
      { "title": "4 Sections", "body": "40 questions total, progressively harder" }
    ]}
  ],
  "page": 4
}
```
Block kinds inside `split_visual.blocks`:
- `card_list` — outlined card stack
- `bullets` — bulleted list
- `paragraph` — single paragraph
- `chevron_steps` — chevron-numbered list
- `accent_quote` — vertical-bar quoted line
- `callout` — tinted callout box

### `narrative`
Body copy paragraphs.
```json
{
  "type": "narrative",
  "title": "What's covered in this guide",   // optional
  "paragraphs": ["...", "..."],
  "page": 27
}
```

### `checklist`
Bulleted list — "what you'll learn", "what to do", "key points".
```json
{
  "type": "checklist",
  "eyebrow": "FREE RESOURCES",        // optional
  "eyebrow_tone": "default",
  "title": "Everything You Need to Practise Correctly",
  "variant": "outline_box",           // simple | outline_box (rounded square checkbox) — default simple
  "items": [
    { "title": "All Reliable Free Practice Tests", "body": "Curated list of authentic sources you can trust" }
  ],
  "footer": "**Completely FREE** — Link in description",   // optional accent-bar emphasis
  "page": 25
}
```
Items can also be plain strings for backward compatibility.

### `factboard`
Stat / fact tiles.
```json
{
  "type": "factboard",
  "variant": "label_value",           // label_value | big_number — default label_value
  "title": "IELTS Listening at a glance",
  "facts": [
    { "label": "Sections", "value": "4" },
    { "label": "Questions", "value": "40" }
  ],
  "page": 29
}
```
For `big_number` variant (p18 — "10+ Question Types / 10+ Strategies / 100% Coverage"):
```json
{
  "type": "factboard",
  "variant": "big_number",
  "facts": [
    { "value": "10+", "label": "Question Types", "body": "Each with unique characteristics" }
  ],
  "footer": "We've covered multiple choice in detail, but...",   // optional
  "page": 18
}
```

### `icon_grid`
Tip cards.
```json
{
  "type": "icon_grid",
  "variant": "outline",               // outline | circular_badge | topline_icon — default outline
  "title": "Why Students Struggle",
  "intro": "You must do all of these AT THE SAME TIME:",   // optional
  "columns": 3,                       // optional layout hint, default auto
  "cards": [
    { "icon": "Eye", "title": "Read Questions", "body": "Quickly scan..." }
  ],
  "page": 5
}
```
Variants:
- `outline` — outlined icon, no background (p5)
- `circular_badge` — filled circular icon badge above card (p6, p22)
- `topline_icon` — small icon over a horizontal accent line above each card (p17, p24)

### `strategy_steps`
Numbered procedure.
```json
{
  "type": "strategy_steps",
  "variant": "chevron",               // chevron | icon_circle | numbered_card — default chevron
  "title": "How to tackle Multiple Choice",
  "intro": "Understanding the relationships between...",   // optional
  "steps": [
    { "number": 1, "icon": "FileText", "title": "Read Instructions Carefully", "body": "Check how many answers..." }
  ],
  "page": 15
}
```
Variants:
- `chevron` — chevron-numbered cards (p10, p13)
- `icon_circle` — circular icon badge per step (p15, p22)
- `numbered_card` — outlined card with big leading number (p20)

### `example`
Worked example.
```json
{
  "type": "example",
  "title": "Example: Multiple Choice",
  "intro": "Here's an authentic IELTS multiple choice question...",   // optional
  "questions": [                      // 1-N parallel question boxes
    { "prompt": "Type of insurance chosen:", "options": ["A. Economy", "B. Standard", "C. Premium"] }
  ],
  "answer": "B",                      // optional
  "explanation": "...",               // optional
  "transcript": "...",                // optional listening
  "passage": "...",                   // optional reading
  "callout": { "tone": "info", "body": "Notice how each question has three options..." },   // optional bottom callout
  "page": 14
}
```

### `comparison`
Side-by-side compare. Optional per-column image (p8 photo-comparison).
```json
{
  "type": "comparison",
  "eyebrow": "#1",
  "eyebrow_tone": "outlined",
  "title": "Listen Actively, Not Passively",
  "columns": [
    {
      "label": "Passive Listening",
      "tone": "negative",             // negative | positive | neutral
      "marker": "x",                  // x | check | none — header marker icon
      "items": ["Watching Netflix for entertainment", "..."],
      "image": "/static/strategies/listening/intro/p08_left.jpg"   // optional
    },
    {
      "label": "Active Listening",
      "tone": "positive",
      "marker": "check",
      "items": ["Predicting answers before you hear them", "..."],
      "image": "/static/strategies/listening/intro/p08_right.jpg"
    }
  ],
  "callout": { "tone": "info", "body": "..." },   // optional bottom callout
  "page": 8
}
```

### `analogy_3up`
3 circular cropped photos with caption — used for analogies (p11 sports analogy).
```json
{
  "type": "analogy_3up",
  "title": "You Wouldn't Use the Same Strategy for Every Sport",
  "items": [
    { "image": "/static/strategies/listening/intro/p11_circle1.jpg", "title": "Football", "body": "Team coordination, positioning, passing strategies" },
    { "image": "/static/strategies/listening/intro/p11_circle2.jpg", "title": "Basketball", "body": "Fast breaks, zone defence, individual plays" },
    { "image": "/static/strategies/listening/intro/p11_circle3.jpg", "title": "Tennis",     "body": "Serve and volley, baseline rallies, court coverage" }
  ],
  "footer": "Different games = Different strategies\nSame principle applies to IELTS question types",   // optional accent-bar closing
  "page": 11
}
```

### `big_typography`
Eyebrow badge + huge headline + numbered short columns. Pure typographic statement (p7).
```json
{
  "type": "big_typography",
  "eyebrow": "GAME CHANGERS",
  "eyebrow_tone": "default",
  "title": "3 Things Successful Students Do Differently",
  "items": [
    { "number": "01", "title": "Listen Actively, Not Passively" },
    { "number": "02", "title": "Use Different Strategy for Each Question Type" },
    { "number": "03", "title": "Listen Just Once in Practice" }
  ],
  "page": 7
}
```

### `timeline_zigzag`
Vertical line + alternating left/right numbered nodes (p23).
```json
{
  "type": "timeline_zigzag",
  "title": "Practise Under REAL Exam Conditions",
  "intro": "Make practice harder than the test, and exam day becomes manageable.",   // optional accent-bar
  "nodes": [
    { "number": 1, "title": "No Notes",     "body": "Work from memory",      "side": "left" },
    { "number": 2, "title": "No Internet",  "body": "Offline only",          "side": "right" },
    { "number": 3, "title": "No Breaks",    "body": "30 minutes straight",   "side": "left" },
    { "number": 4, "title": "Listen Once",  "body": "No second chances",     "side": "right" },
    { "number": 5, "title": "Complete Test","body": "All 40 questions",      "side": "left" }
  ],
  "footer": "Simulate the pressure, time constraints...",   // optional concluding paragraph
  "page": 23
}
```

### `callout`
Highlighted note. Often standalone, but also embeddable inside `split_visual.blocks`, `example.callout`, `comparison.callout`.
```json
{
  "type": "callout",
  "tone": "warning",                  // info | warning | success | tip | critical
  "title": "Watch out",               // optional
  "body": "Verbatim copy from PDF",
  "page": 40
}
```

### `quote_block`
Direct quote / examiner-band quote.
```json
{
  "type": "quote_block",
  "quote": "...",
  "attribution": "IELTS Band 9 descriptor",
  "page": 50
}
```

## Renderer contract
- Renderer is dumb: receives slide array, switches on `type`, lays out per design system.
- All copy fields are rendered verbatim — no markdown processing other than `**bold**` and `*italic*` if found.
- `page` is preserved for "Source: PDF p.NN" footer (debug/credit, hidden in prod).
- Liz framing lives in lesson `intro` and `outro` wrappers (separate from `slides[]`), never injected into slide bodies.
- Renderer respects skill color via `chapter.skill` — accent color is computed once at chapter level and passed down to every slide.
- Image fields are optional everywhere; slides without `image` fall back to text-only layout.

## Wrapper shape
```json
{
  "lesson_id": "mc_questions",
  "title": "Multiple Choice Questions",
  "source_pages": [35, 38],
  "liz_intro": "Multiple choice trips up most students because...",   // OUR copy, not PDF
  "liz_outro": "Try a fresh MC question now in Question Bank →",      // OUR copy
  "practice_link": {
    "label": "Practice MC questions",
    "href": "/question-bank/listening/practice?type=multiple_choice"
  },
  "slides": [ ...verbatim PDF content... ]
}
```

## v3 slide types — enhancement layer

### `worked_example`
A PDF question walked through one micro-step at a time. The student sees what an expert is *thinking* as they read.

```json
{
  "type": "worked_example",
  "eyebrow": "WORKED EXAMPLE",
  "title": "Let's solve one together",
  "stimulus": {
    "label": "Passage extract",
    "body": "<verbatim short passage chunk OR fill-in-the-blank summary text>"
  },
  "question": {
    "prompt": "Question 1 — Choose ONE word from the passage.",
    "blank_text": "The team's primary concern was ____ in the data."
  },
  "thinking_steps": [
    { "step": 1, "title": "Locate the keyword", "body": "Skim for 'team's primary concern' or paraphrase ('main worry', 'biggest issue')." },
    { "step": 2, "title": "Read the surrounding sentence", "body": "Quote: '... the team's biggest worry was the inconsistency they saw...'" },
    { "step": 3, "title": "Match the gap grammar", "body": "Gap is a noun → 'inconsistency' fits both meaning and grammar." }
  ],
  "answer": { "value": "inconsistency", "rationale": "Direct synonym for 'primary concern' + matches the noun slot." }
}
```

### `quiz`
A short self-check (1–5 items) inline with the lesson. MCQ + fill-in supported.

```json
{
  "type": "quiz",
  "eyebrow": "CHECK YOURSELF",
  "title": "Quick self-test",
  "intro": "Three short questions — answer before scrolling.",
  "items": [
    {
      "id": "q1",
      "kind": "mcq",
      "prompt": "In summary completion, the answers in the summary appear in the same order as the passage. True or false?",
      "choices": [
        { "key": "A", "text": "True" },
        { "key": "B", "text": "False — order can change" }
      ],
      "answer_key": "B",
      "explanation": "If the summary draws from a list-style answer-key, the order may not be sequential."
    },
    {
      "id": "q2",
      "kind": "fill_in",
      "prompt": "Maximum word limit you should always check first:",
      "answer_key": "the instruction (NO MORE THAN ___ WORDS)",
      "accepts": ["the instruction", "instruction", "word limit"],
      "explanation": "Word limits change between question sets — never assume."
    }
  ]
}
```

### `common_mistakes`
Anti-pattern → correction pairs. Comes from teacher experience, framed as "what most students do wrong".

```json
{
  "type": "common_mistakes",
  "eyebrow": "WATCH OUT",
  "title": "Common mistakes to avoid",
  "intro": "Three errors I see most often when students try this question type.",
  "mistakes": [
    {
      "wrong": "Copying the EXACT word from the passage when paraphrased word is required.",
      "right": "If the gap sits inside a paraphrase of the passage sentence, the answer is usually paraphrased too — match meaning, not letters.",
      "tag": "paraphrase"
    },
    {
      "wrong": "Writing 4 words when instruction says 'NO MORE THAN THREE WORDS'.",
      "right": "Re-read instructions before each section. Even one extra word = zero marks.",
      "tag": "word_limit"
    }
  ]
}
```
