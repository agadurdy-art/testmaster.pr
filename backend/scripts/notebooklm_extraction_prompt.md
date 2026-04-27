# NotebookLM Extraction Prompt — Cambridge IELTS 17-20 Speaking Calibration

Use this prompt with NotebookLM after uploading Cambridge IELTS 17, 18, 19, and 20 PDFs (each book has 4 tests). Run once per book or once across all four. The output is a JSON array that drops directly into `backend/data/speaking_calibration/cambridge_17_20/`.

---

## Prompt to paste into NotebookLM

```
You are a careful research assistant extracting calibration data from
Cambridge IELTS 17, 18, 19, and 20 for an internal AI scoring system.
Output STRICT JSON only — no prose, no commentary, no markdown fences.

For EVERY Speaking sample answer transcript in the provided books,
produce ONE JSON object. Books contain 4 tests each = 16 tests total
across 4 books, each with Part 1 + Part 2 + Part 3 sample materials.
Some sample answers are full transcripts; others are key extracts —
include every transcript you can find.

For each entry produce:

{
  "id": "cambridge<book>_test<n>_<part>",       // e.g. "cambridge18_test2_part2"
  "source_book": "Cambridge IELTS <17|18|19|20>",
  "source_test": <1|2|3|4>,
  "part": "part1" | "part2" | "part3",
  "cue_card_prompt": "<verbatim cue card prompt or Part 1/3 question theme>",
  "cue_card_bullets": ["<bullet 1>", "<bullet 2>", ...],   // [] for Part 1/3
  "transcript": "<full verbatim sample answer transcript>",
  "examiner_notes": "<verbatim examiner comments from the book — do NOT paraphrase>",
  "expected_band_overall": <number 0-9 in 0.5 increments, or null if not given>,
  "expected_per_criterion": {
    "fc":  <number or null>,    // Fluency & Coherence
    "lr":  <number or null>,    // Lexical Resource
    "gra": <number or null>,    // Grammatical Range & Accuracy
    "pr":  <number or null>     // Pronunciation
  },
  "duration_estimate_seconds": <integer estimate based on transcript length>,
  "key_features": [
    "<short observed feature, e.g. 'Self-corrects mid-sentence twice'>",
    "<another observed feature, e.g. 'Uses conditional structures in Part 3'>"
  ],
  "internal_use_only": true
}

Rules:
1. Output a JSON ARRAY of these objects. Nothing else.
2. If the book gives a band as a range (e.g., "Band 6.5-7"), use the lower
   end and add a note in key_features.
3. If per-criterion bands are not given but an overall band is, leave
   expected_per_criterion fields null and only set expected_band_overall.
4. If neither is given, leave both null but still extract the transcript +
   examiner_notes (we'll use these as anchor reference, not as test set).
5. Preserve the transcript verbatim including hesitations ("erm...",
   "well...", incomplete sentences). Do NOT clean it up.
6. examiner_notes must be the book's actual examiner commentary about
   that sample, copied as-is. If the book provides examiner notes only
   per criterion (FC/LR/GRA/PR), concatenate them with a clear separator.
7. Skip non-Speaking content entirely (Reading, Writing, Listening tests).
8. If a sample has multiple speakers (e.g., interview format), include
   only the candidate's speech, dropping the examiner's questions but
   note in key_features which question was being answered.

Output only the JSON array.
```

---

## After NotebookLM responds

1. Save the array to `backend/data/speaking_calibration/cambridge_17_20/all.json`.
2. Run the splitter (`scripts/split_calibration_extracts.py` — to be written) which:
   - Splits the array into one file per `id`
   - Validates schema (transcript non-empty, part in enum, bands in 0.5 increments if present)
   - Reports any entries with missing `expected_*` so you can decide whether to use them as test set or anchor only.
3. Entries with `expected_band_overall != null` go into the **test set** (used by `calibrate_speaking_eval.py` for drift testing).
4. Entries with bands missing but transcript+examiner_notes present go into the **reference pool** (used to draft anchor exemplars in the system prompt).

---

## What we use these for

- **Test set**: the calibration script feeds each transcript through our
  evaluator (transcript-only mode, no audio re-eval), checks predicted
  band vs expected band. Drift > ±0.5 band on >10% of samples = re-tune
  prompt.
- **Anchor exemplars**: 4-5 paraphrased summaries (NOT verbatim copies)
  go into the system prompt as "examples of how examiners distinguish
  band X from band Y". This grounds the LLM in real-test calibration
  without bloating prompt size.
- **Internal playbook**: examiner_notes corpus used to extract general
  principles (e.g., "B7 candidates extend Part 2 to ~1:45-2:00"), which
  are paraphrased into prompt rules — never verbatim quoted.

The `cambridge_17_20/` folder stays **gitignored**. Production prompt
references the principles + paraphrased anchors, not the verbatim
transcripts. This keeps deployment artifacts clean.
