# Spiral-Aware Content Writer Template (Stage 3-8)

**Purpose:** Reusable prompt + workflow to produce 4-lesson enriched JSON for any unit, using wordlist-sequence-aware spiral curriculum design.

**Inputs required per unit:**
1. Unit row from `stage3_unit_mapping.json` (target_vocab + anticipation_pool + recycled_pool + grammar_target + grammar_anticipation + skills_focus)
2. Relevant rows from `stage3_grammar_progression.json` (this unit's primary structures + reinforce items)
3. Aga's classroom note — 2-3 lines about what kids struggle with, Vietnam-specific context, examples that "click"
4. Existing enriched JSON schema (see `backend/content/enriched/stage3_unit01_enriched.json` for reference)

**Output:** `backend/content/enriched/stage3_unit{NN}_enriched.json` with 4 lessons × 11 steps each, all original content.

---

## IP boundary (non-negotiable)

The Cambridge Prepare textbook is copyrighted. We use:
- Cambridge Movers Wordlist 2025 (free public PDF) — as **vocabulary scope reference** only. Words themselves are factual data; their curation as A1-level is reference info.
- Cambridge Movers Grammar List (free public PDF) — as **grammar coverage reference** only.
- Cambridge Movers Sample Papers Vol 2 (free public PDF) — as **exam-format reference** only.

We do NOT:
- Reproduce, paraphrase, or "rewrite with minor changes" any passage, exercise, or listening script from the Prepare textbook or any other Cambridge course material.
- Copy specific example sentences from the grammar list (they're given as illustrations, not for reproduction).

We DO:
- Write entirely original passages, dialogues, exercises, and exit ticket questions.
- Design our own characters, scenarios, and cultural touchstones (Ho Chi Minh City context, Vietnamese kid characters, multicultural online classroom).
- Use the target wordlist as scope constraints when writing — i.e., "this passage must use word X, Y, Z and stay within A1 grammar."

This is "skill clone, not content clone" — same pedagogical effect, original content.

---

## Sub-topic split decision (Lesson 1-3)

Each unit's 3 content lessons cover the unit's theme via 3 sub-topics. Standard split patterns:

- **Personal info / family / home units:** L1 self + immediate / L2 extended group / L3 questions & answers
- **Action / verb units:** L1 the action / L2 frequency or time / L3 negotiation (Wh-Q + reasons)
- **Topic-discovery units (places, weather, animals):** L1 core list / L2 descriptions or comparisons / L3 stories / scenarios

Lesson 4 is **always cumulative review** of L1-3 vocab + grammar.

---

## 11-step structure per lesson (immutable)

```
1. warm_up               (15s video placeholder + 2 retrieval Q)
2. vocabulary            (8-10 target words: word, ipa, def, example, image_emoji, image_url)
3. vocab_games           (1-2 games, see game variant table below)
4. micro_game_vocab      (1 game, different variant from step 3)
5. micro_reading         (80-130 word original passage + 3 comprehension Q + scene_description for image)
6. grammar_focus         (rule pattern + 1-line explanation + 4-6 example sentences)
7. grammar_games         (1 game from grammar variant table)
8. grammar_game          (1 game, different variant from step 7)
9. listening             (50-90s original audio_text + 3 Q)
10. production           (speaking or writing task with scaffold)
11. exit_ticket          (5-7 quick check Q — 1 vocab + 2 grammar + 1 listening + 1 build/transform)
```

Lesson 4 review variants:
- Step 2 → `vocabulary_review` (items = list of strings; review pool auto-resolves from earlier lessons' vocab)
- Step 6 → `grammar_review` (patterns = list of structure descriptions; auto-resolves from grammar_pool)

---

## Game variant rotation (per unit)

A unit has 4 × 4 = 16 game slots (4 lessons × 4 game steps). Goal: **no repeat within a unit**, varied across the stage.

Available `game_type` slugs (some map to existing Stage 1+2 renderers, some need new components):

**Vocab games (vocab_games + micro_game_vocab steps):**
| Slug | Renderer | Notes |
|---|---|---|
| `image_word_match` | existing (read_choose_picture) | 6 pairs, image ↔ word |
| `listen_choose_picture` | existing | Audio plays, choose image |
| `listen_choose_word` | existing | Audio plays, choose word text |
| `unscramble` | existing | "ELLOH" → "HELLO" |
| `memory_game` | existing | Card flip pair match |
| `flashcard_match` | existing | Front emoji → back word |
| `listen_write` | existing | Type the word you hear |
| `look_write` | existing | See image, type word |
| `fill_gap` | existing | Sentence with blank |
| `word_race` | NEW | Timed quiz, score → XP |
| `word_ladder` | NEW | Sequential choices, advance rungs |
| `cumulative_race` | reuse word_race | Bigger pool, longer timer (review) |

**Grammar games (grammar_games + grammar_game steps):**
| Slug | Renderer | Notes |
|---|---|---|
| `word_order` | existing | Drag-and-drop sentence build |
| `fill_blank` | existing | Choose word for gap |
| `error_hunter` | existing | Tap the wrong word |
| `true_false` | existing | T/F questions |
| `multiple_choice_grammar` | existing | MCQ on grammar rule |
| `transform_sentence` | NEW | Affirmative → negative / Question → statement |
| `audio_match` | NEW | Hear sentence, choose written form |
| `sentence_builder_timed` | reuse word_order + timer | Review lesson speed round |

Rotation pattern (default 16-slot template):
- **L1:** image_word_match, unscramble, multiple_choice_grammar, word_order
- **L2:** word_race, memory_game, error_hunter, audio_match
- **L3:** listen_write, flashcard_match, fill_blank, transform_sentence
- **L4 review:** word_ladder, cumulative_race, true_false, sentence_builder_timed

---

## Spiral content requirements

For each unit's content (especially passages + listening + grammar examples):

### Target vocab (explicit teach)
- Must appear in step 2 (vocabulary cards)
- Must appear in step 3-4 games as the main word pool
- Must appear in step 5 reading passage at least once each
- Must appear in step 9 listening at least 50% of items
- Must appear in step 11 exit ticket vocab question
- Total density: ~6-10 target words per lesson; ~25-30 unique across 4 lessons per unit

### Anticipation pool (passive exposure for next unit)
- Appears in step 5 reading passage at least 1-2 of the pool words **without definition or focus**
- Appears in step 9 listening at least 1 of the pool words **naturally**
- Does NOT appear in step 2 vocab cards
- Does NOT appear in any game items
- Does NOT appear in exit ticket
- Reader/listener encounters it but doesn't have to learn it yet — primes recognition for next unit's explicit teach

### Recycled pool (retention from earlier units)
- Sprinkled throughout passages and listening
- Can appear in game items as background distractor or solution
- Can appear in exit ticket as cross-skill check ("which word from a past lesson means X")
- Reinforces retention without re-teaching

### Grammar spiral
- Step 6 grammar_focus teaches the explicit `grammar_target`
- Step 7-8 grammar games drill explicit target
- BUT step 5 reading + step 9 listening + step 10 production can include 1-2 sentences using `grammar_anticipation` structures naturally (e.g., Unit 1's reading has 1 sentence with `have got` even though Unit 4 explicit teaches it)
- This creates priming effect — when next unit explicitly teaches that structure, student has already seen it

---

## Per-unit Sonnet prompt template

```
You are writing TestMaster Stage 3 Unit {N}: "{UNIT_TITLE}" — a 4-lesson A1 module for 8-15 year-old students in Vietnam learning English with the Cambridge Movers exam as the end goal.

CHARACTER CAST (reused across the unit, but no visual continuity needed):
- Linh: 9-year-old Vietnamese girl, lives in Ho Chi Minh City
- Mai: 9-year-old, Linh's best friend, also Vietnamese
- Minh: 7-year-old, Linh's younger brother
- Ray: young male English teacher (the tutor brand)
- Tom (American), Sophie (British), Lucas (Brazilian): online classroom friends (multicultural cohort)

UNIT TARGETS (must teach explicitly):
- Vocab: {target_vocab list}
- Grammar: {grammar_target}

ANTICIPATION POOL (use 1-2 of these naturally in passages/listening only; DO NOT define, drill, or include in vocab cards):
- Vocab: {anticipation_pool}
- Grammar: {grammar_anticipation} — include 1-2 example sentences using this structure in step 5 or 9 passages

RECYCLED POOL (sprinkle in passages and games):
- {recycled_pool}

CLASSROOM NOTE FROM TEACHER (Aga):
- {aga_classroom_note}

SUB-TOPIC SPLIT for L1-L3:
- L1: {sub_topic_1}
- L2: {sub_topic_2}
- L3: {sub_topic_3}

GAME VARIANT ROTATION:
- L1: {l1_games}
- L2: {l2_games}
- L3: {l3_games}
- L4 review: {l4_games}

OUTPUT: Single JSON file matching schema of stage3_unit01_enriched.json. 4 lessons. 11 steps per lesson. All content original — never quote, paraphrase, or rewrite-with-minor-changes any Cambridge Prepare textbook material. All passages are your own writing at A1 level.

QUALITY BAR:
- Reading passages: 80-130 words (lessons 1-3), 150-180 words (lesson 4 cumulative)
- Listening scripts: 50-90s spoken at A1 pace (lessons 1-3), 90-120s (lesson 4 cumulative)
- Exit ticket: 5 Q (lessons 1-3), 7 Q (lesson 4)
- Each game: minimum 5 items, target 6-8 items
- Production task: include clear scaffold ("Hi Ray! I am ___. I am ___ years old. I am from ___.")
- All comprehension Q have 3 options + 1 correct answer
- All Q text uses only target vocab, recycled pool, or function words at A1 level
```

---

## Validation checklist (run after generation)

For each unit before commit:
- [ ] JSON parses cleanly (`python3 -c "import json; json.load(open('...'))"`)
- [ ] 4 lessons, 11 steps each
- [ ] Lesson 4 uses vocabulary_review + grammar_review step types
- [ ] All target_vocab words appear in step 2 vocab cards across L1-L3
- [ ] All anticipation_pool words appear in passages but NOT in step 2 cards / not in exit tickets
- [ ] Game variants don't repeat within the unit (16 different `game_type` slugs)
- [ ] All passages are original (run plagiarism quick check: paste into Google with quotes — should yield zero hits on Cambridge sites)
- [ ] Grammar anticipation: at least 1 sentence in L1-L3 passages uses next unit's grammar structure passively
- [ ] Aga's classroom note influences are visible (Vietnam context, specific tricky points addressed)

---

## Reuse for Stages 4-8

This template works identically for:
- Stage 4 (Flyers / A2): substitute Movers wordlist → Flyers wordlist, A1 grammar → A2 grammar
- Stage 5 (Key for Schools / A2): A2 KET wordlist, KET grammar
- Stage 6 (Preliminary / B1): PET wordlist, PET grammar
- Stage 7 (First / B2): FCE wordlist, FCE grammar
- Stage 8 (Advanced / C1): CAE wordlist, CAE grammar

The skeleton is universal; only the level-specific reference inputs swap.
