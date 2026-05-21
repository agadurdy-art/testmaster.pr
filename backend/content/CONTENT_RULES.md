# Content Writing Rules — testmaster.pro Movers+

These are the rules every lesson author follows when adding or editing
enriched-JSON content for Stage 3 (Movers) and above. They exist
because the production app surfaced specific pedagogical failures Aga
caught in 2026-05-21 user testing — they're not theoretical.

`backend/scripts/content_validator.py` enforces every rule on this
page. CI / pre-push should run it on changed lessons; a failure means
the lesson cannot ship.

The rules are grouped by lesson step type. Field names match the
`build_stage3_unit*_v2.py` factories.

---

## Listening step (`type: "listening"`)

- **`audio_text` MUST be present and non-empty.** It is the
  authoritative transcript of the MP3 in `audio_url`. If you change
  one, you regenerate the other.
- **Every listening question must be answerable verbatim from
  `audio_text`.** Don't write "Who is Sofia's brother?" if the audio
  never names him. Source the correct answer from a literal phrase in
  the script.
- **4–6 questions per listening step.** Three is too few for a kid
  to settle into the audio; seven drags.
- **Yes/No questions: never all-yes or all-no.** A 5-Q binary set
  must contain at least one of each. A 4-Q binary set at minimum 1/3.
- **Multiple-choice questions: distractor categories.** All four
  options share a category — "Mr Brown / Nico / Cassie / Sofia" not
  "Mr Brown / dog / table / 7am". Distractors are valid same-class
  candidates the child should rule out via the audio, not noise.

## Reading step (`type: "micro_reading"`)

- **`locate_text` field is mandatory on every question.** It's the
  verbatim sentence (or two consecutive sentences) from the passage
  that proves the answer. The frontend highlights it on a wrong answer
  (`UnifiedLessonPage.findLocateSentence` will fall back to a
  heuristic if missing, but the heuristic is worse than the author's).
- If the proof spans two sentences (e.g. "Our teacher is Mr Brown.
  He is kind."), `locate_text` MUST include both.
- **4–6 questions.** Same logic as listening.
- **Question types: mix MC and T/F.** Don't write 5 T/F in a row.
- **Passage length 50–120 words** for Movers level.

## Vocabulary step (`type: "vocabulary"`)

- Every item has either `image_url` (preferred) **or** `image_emoji`
  as fallback. Never both empty.
- Images come from the Pixar+GPT pipeline
  (`backend/scripts/dt_gen_unit_images.py`) — see
  `memory/project_vocab_image_style.md` for the locked style + render
  settings.

## Vocab games step (`type: "vocab_games"`)

- Games reuse the `image_url` from the vocabulary step — don't pick a
  new image for the game card.
- **Distractor diversity:** distractors are the other words from the
  same lesson, not random off-topic words. Color words distract with
  other color words, family words with other family words, etc.
- **Answer-slot distribution:** runtime shuffle handles position, but
  the data-level `correct_index` must rotate across items too. If you
  emit 6 items all with correct_index=0, you've made the bug we just
  fixed reappear (Aga 2026-05-21: "cevaplar hep slot A").

## Grammar games step (`type: "grammar_games"`)

This is the section that bit us hardest in production. Read carefully.

### `true_false`
- **At most 60% of the items can share a single answer.** A 5-item
  set is 3T+2F or 2T+3F, not 4T+1F. Aga 2026-05-21: "5'in 4'ü true,
  çocuk hep true derse 80% alır."
- Each `false` item provides a `corrected` field with the right
  version, e.g. `{"sentence": "She are happy.", "correct": false,
  "corrected": "She is happy."}`.

### `multiple_choice_grammar`
- **No two consecutive items share the same correct answer.** Don't
  emit `[have, is, has, is]` — that's an h-i-h-i alternation pattern
  a child cracks in two rounds.
- **3–4 options per item.** Distractors are plausible same-tense /
  same-class forms (is/are/am, not is/dog/seven).

### `fill_blank`
- Same as `multiple_choice_grammar`: no consecutive answer repeats,
  3–4 options, distractor category matches target.
- The blank position should vary — don't always put it at word 3.

## Speaking step (`type: "production"` or `"speaking"`)

- **`production_type` field is REQUIRED on every prompt.** Values:
  - `self_introduction` — open intro task ("Tell us about yourself")
  - `say_n_structural` — patterned production ("Say 3 things using
    'I have a ...'")
  - `echo` — repeat / read aloud
  The frontend evaluator dispatches on this field. Missing it means
  the frontend reverse-engineers intent every render (Aga 2026-05-21
  audit flagged this on 3 prompts).
- For `say_n_structural`, the prompt MUST contain the count (digit
  or word) and the quoted pattern: `Say three things using "I have
  a..."` — that's how the evaluator extracts N and the anchor.
- `model_answer` / `expected_text` is a model answer, NOT a target
  string for token overlap. The label is rendered as "Model answer ·
  yours can be different" for structural modes.

## Exit ticket step (`type: "exit_ticket"`)

- 3–5 quick recap questions.
- Pulls from vocab + grammar + reading + listening content of the
  same lesson — no fresh material.

---

## How to use this document

When you (Aga, or me in this conversation) writes new lesson content:
1. Pick the rules section for the step type.
2. Write the content.
3. Run `backend/.venv/bin/python3 backend/scripts/content_validator.py
   --stage 3 --unit N --lesson M` before pushing.
4. If it exits non-zero, fix the listed issue and re-run.

`lesson_audit.py` is the lighter-touch advisory pass and gives
warnings; `content_validator.py` is the production gate and gives
errors.
