/**
 * Zod schemas for the Writing Evaluator v2 client-side validation.
 *
 * Source of truth: backend/schemas/writing_evaluator.py (Pydantic).
 * If you change one, change the other.
 *
 * The prompt at backend/prompts/writing-evaluator-v2.md is the third leg — it
 * instructs Claude Sonnet to emit exactly this shape.
 */

import { z } from "zod";

// ---------- Enums ----------

export const TaskType = z.enum([
  "task1_academic_chart",
  "task1_academic_map",
  "task1_academic_process",
  "task1_academic_diagram",
  "task1_general_formal",
  "task1_general_semiformal",
  "task1_general_informal",
  "task2_opinion",
  "task2_discussion",
  "task2_problem_solution",
  "task2_advantages_disadvantages",
  "task2_direct_question",
]);

export const Category = z.enum(["TA", "CC", "LR", "GRA"]);
export const Severity = z.enum(["major", "minor"]);

// ---------- Utility: band value ----------

/**
 * IELTS band must be in [0, 9] with 0.5 increments.
 */
export const BandScore = z
  .number()
  .min(0)
  .max(9)
  .refine((v) => Math.abs(v * 2 - Math.round(v * 2)) < 1e-6, {
    message: "Band must be a 0.5 increment",
  });

// ---------- Criterion score ----------

export const CriterionScore = z.object({
  band: BandScore,
  explanation: z.string().min(1).max(500),
  // Allow empty arrays; see backend/schemas/writing_evaluator.py for the rationale.
  strengths: z.array(z.string().min(1)).max(5).default([]),
  weaknesses: z.array(z.string().min(1)).max(5).default([]),
});

export const Criteria = z.object({
  task_achievement: CriterionScore,
  coherence_cohesion: CriterionScore,
  lexical_resource: CriterionScore,
  grammatical_range_accuracy: CriterionScore,
});

// ---------- Inline annotation ----------

export const InlineAnnotation = z
  .object({
    id: z.string().regex(/^ann_\d+$/),
    start_offset: z.number().int().min(0),
    end_offset: z.number().int().min(0),
    original_text: z.string().min(1),
    suggested_text: z.string(),
    category: Category,
    severity: Severity,
    explanation: z.string().min(1).max(300),
  })
  .refine((a) => a.end_offset > a.start_offset, {
    message: "end_offset must be strictly greater than start_offset",
    path: ["end_offset"],
  });
  // NOTE: we deliberately do NOT enforce
  //   original_text.length === end_offset - start_offset
  // here. The backend realigns offsets (see services/writing_evaluator_v2.py
  // `_realign_annotations`) before returning; by the time the client sees the
  // payload, offsets should line up. The verifyAnnotationOffsets() helper
  // below logs any residual mismatches instead of hard-failing validation.

// ---------- Top-level result ----------

const baseResultShape = z.object({
  overall_band: BandScore,
  word_count: z.number().int().min(0),
  word_count_target: z.number().int().min(0),
  task_type: TaskType,
  criteria: Criteria,
  inline_annotations: z.array(InlineAnnotation).default([]),
  improved_version: z.string(),
  feedback_language: z.string().min(2).max(5),
});

export const WritingEvaluationResult = baseResultShape.refine(
  (r) => {
    if (r.word_count < 50) return true; // stub path
    const avg =
      (r.criteria.task_achievement.band +
        r.criteria.coherence_cohesion.band +
        r.criteria.lexical_resource.band +
        r.criteria.grammatical_range_accuracy.band) /
      4;
    const expected = Math.round(avg * 2) / 2;
    return Math.abs(r.overall_band - expected) <= 0.5;
  },
  {
    message: "overall_band too far from criteria average (tolerance 0.5)",
    path: ["overall_band"],
  }
);

// ---------- Request payload ----------

export const WritingEvaluationRequest = z.object({
  essay_text: z.string().min(1).max(10000),
  task_type_hint: TaskType.optional(),
  task_prompt: z.string().min(1).max(2000),
  user_language: z
    .string()
    .min(2)
    .max(5)
    .default("en")
    .transform((v) => v.toLowerCase().split("-")[0]),
});

// ---------- Client-side offset verification ----------

/**
 * Verify each annotation's offsets against the source essay.
 * Returns an array of error messages (empty if all valid).
 *
 * Uses JavaScript string indexing directly — String.prototype.slice already
 * operates on UTF-16 code units, matching the backend's Python UTF-16 check.
 *
 * @param {z.infer<typeof WritingEvaluationResult>} result
 * @param {string} essayText
 * @returns {string[]}
 */
export function verifyAnnotationOffsets(result, essayText) {
  const errors = [];
  const essayLen = essayText.length;

  for (const ann of result.inline_annotations) {
    if (ann.end_offset > essayLen) {
      errors.push(
        `${ann.id}: end_offset ${ann.end_offset} exceeds essay length ${essayLen}`
      );
      continue;
    }
    const sliced = essayText.slice(ann.start_offset, ann.end_offset);
    if (sliced !== ann.original_text) {
      errors.push(
        `${ann.id}: original_text mismatch (expected "${ann.original_text}", got "${sliced}")`
      );
    }
  }
  return errors;
}

// ---------- Color tokens for each category ----------

/**
 * Category → Tailwind class pair (underline color + background on hover/active).
 * Used by the AnnotatedText component. Adjust when design tokens finalize.
 */
export const CATEGORY_TOKENS = {
  TA: {
    label: "Task Achievement",
    underline: "decoration-sky-500",
    bg: "bg-sky-100",
    text: "text-sky-900",
    swatchHex: "#0EA5E9",
  },
  CC: {
    label: "Coherence & Cohesion",
    underline: "decoration-purple-500",
    bg: "bg-purple-100",
    text: "text-purple-900",
    swatchHex: "#A855F7",
  },
  LR: {
    label: "Lexical Resource",
    underline: "decoration-orange-500",
    bg: "bg-orange-100",
    text: "text-orange-900",
    swatchHex: "#F97316",
  },
  GRA: {
    label: "Grammatical Range & Accuracy",
    underline: "decoration-red-500",
    bg: "bg-red-100",
    text: "text-red-900",
    swatchHex: "#EF4444",
  },
};
