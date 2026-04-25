/**
 * Helpers that turn a WritingEvaluationResult into the shapes the V4
 * "Liz's Margin" view needs: numbered annotations aligned to the essay
 * text, and a mapping from criterion key → short code (TA/CC/LR/GRA).
 */

export const CRITERION_CODE = {
  task_achievement: "TA",
  coherence_cohesion: "CC",
  lexical_resource: "LR",
  grammatical_range_accuracy: "GRA",
};

export const CRITERION_LABEL = {
  TA: "Task Achievement",
  CC: "Coherence & Cohesion",
  LR: "Lexical Resource",
  GRA: "Grammatical Range & Accuracy",
};

/**
 * Build numbered annotations sorted by position in the essay.
 * Each item: { n, id, start, end, original, suggested, category, severity, explanation }
 */
export function buildNumberedAnnotations(annotations) {
  const sorted = [...annotations].sort(
    (a, b) => a.start_offset - b.start_offset
  );
  return sorted.map((ann, i) => ({
    n: i + 1,
    id: ann.id,
    start: ann.start_offset,
    end: ann.end_offset,
    original: ann.original_text,
    suggested: ann.suggested_text,
    category: ann.category,
    severity: ann.severity,
    explanation: ann.explanation,
  }));
}

/**
 * Slice the essay text into an array of tokens in reading order:
 * { kind: "text", text } | { kind: "annotation", annotation }
 * Overlapping annotations are resolved by first-start-wins; later overlaps
 * are dropped (the backend validator should have rejected them).
 */
export function sliceEssayByAnnotations(essay, numbered) {
  const tokens = [];
  let cursor = 0;
  for (const ann of numbered) {
    if (ann.start < cursor) continue; // skip overlaps
    if (ann.start > cursor) {
      tokens.push({ kind: "text", text: essay.slice(cursor, ann.start) });
    }
    tokens.push({ kind: "annotation", annotation: ann });
    cursor = ann.end;
  }
  if (cursor < essay.length) {
    tokens.push({ kind: "text", text: essay.slice(cursor) });
  }
  return tokens;
}

/**
 * Compute how close a word count is to the target. Returns { pct, status }.
 * status: "under" (<95%), "on_target" (95-115%), "over" (>115%).
 */
export function wordCountStatus(count, target) {
  const pct = Math.round((count / target) * 100);
  let status = "on_target";
  if (count < target * 0.95) status = "under";
  else if (count > target * 1.15) status = "over";
  return { pct, status };
}

/**
 * Rounded IELTS average across the four criteria (0.5 increments).
 */
export function averageBand(criteria) {
  const vals = [
    criteria.task_achievement.band,
    criteria.coherence_cohesion.band,
    criteria.lexical_resource.band,
    criteria.grammatical_range_accuracy.band,
  ];
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg * 2) / 2;
}

export const BAND_LABEL = {
  9: "Expert",
  8.5: "Very Good",
  8: "Very Good",
  7.5: "Good",
  7: "Good",
  6.5: "Competent",
  6: "Competent",
  5.5: "Modest",
  5: "Modest",
  4.5: "Limited",
  4: "Limited",
  3.5: "Extremely Limited",
  3: "Extremely Limited",
};

export function bandLabel(band) {
  return BAND_LABEL[band] || "";
}
