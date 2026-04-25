import React from "react";
import WritingEvaluatorResult from "../features/evaluator/components/WritingEvaluatorResult";
import {
  SAMPLE_ESSAY,
  SAMPLE_PROMPT,
  SAMPLE_RESULT,
  SAMPLE_LIZ_MESSAGE,
} from "../features/evaluator/fixtures/sampleEssay";
import {
  WritingEvaluationResult,
  verifyAnnotationOffsets,
} from "../features/evaluator/schemas/writingResult";

/**
 * Developer-facing preview route for the Writing Evaluator V4 result screen.
 * Mount at /dev/evaluator-result to eyeball the layout during design review.
 * Remove or gate behind an admin flag before shipping to production.
 */
export default function EvaluatorResultPreview() {
  // Validate the fixture on mount so we catch schema drift early.
  const parsed = React.useMemo(() => {
    const r = WritingEvaluationResult.safeParse(SAMPLE_RESULT);
    if (!r.success) {
      // eslint-disable-next-line no-console
      console.error("[EvaluatorResultPreview] fixture failed schema", r.error);
      return SAMPLE_RESULT;
    }
    const offsetErrors = verifyAnnotationOffsets(r.data, SAMPLE_ESSAY);
    if (offsetErrors.length) {
      // eslint-disable-next-line no-console
      console.error(
        "[EvaluatorResultPreview] annotation offset mismatch",
        offsetErrors
      );
    }
    return r.data;
  }, []);

  return (
    <WritingEvaluatorResult
      result={parsed}
      essayText={SAMPLE_ESSAY}
      prompt={SAMPLE_PROMPT}
      lizMessage={SAMPLE_LIZ_MESSAGE}
      onRewrite={() => alert("Band 7+ rewrite — coming next")}
      onPracticeMore={() => alert("Practice more like this")}
      onViewRewrite={() => alert("See Band 7+ rewrite")}
    />
  );
}
