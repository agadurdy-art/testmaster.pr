import React, { useEffect, useMemo } from "react";
import SampleReportPage from "../features/samples/components/SampleReportPage";
import {
  SAMPLE_ESSAY,
  SAMPLE_PROMPT,
  SAMPLE_RESULT,
  SAMPLE_LIZ_MESSAGE,
  SAMPLE_OG_QUOTE,
} from "../features/samples/fixtures/band65Task2Technology";
import {
  WritingEvaluationResult,
  verifyAnnotationOffsets,
} from "../features/evaluator/schemas/writingResult";

/**
 * Public page: /samples/writing/band-6-5-task2
 * Band 6.5 Task 2 sample on "technology easier vs. more problems" prompt.
 *
 * SEO note: client-rendered today; when we move to SSR (Next.js migration
 * per the roadmap), the <title>, <meta description>, and OG tags below
 * should be lifted into server-side head metadata.
 */
export default function SampleReportBand65Task2() {
  // Validate the fixture once on mount so schema drift fails loudly.
  const parsed = useMemo(() => {
    const r = WritingEvaluationResult.safeParse(SAMPLE_RESULT);
    if (!r.success) {
      // eslint-disable-next-line no-console
      console.error("[SampleReportBand65Task2] fixture failed schema", r.error);
      return SAMPLE_RESULT;
    }
    const offsetErrors = verifyAnnotationOffsets(r.data, SAMPLE_ESSAY);
    if (offsetErrors.length) {
      // eslint-disable-next-line no-console
      console.error("[SampleReportBand65Task2] offset mismatch", offsetErrors);
    }
    return r.data;
  }, []);

  // Document head — placeholder client-side solution until SSR lands.
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Sample Band 6.5 Writing Task 2 Evaluation · IELTS Ace";
    const descMeta = upsertMeta("name", "description");
    const prevDesc = descMeta.getAttribute("content");
    descMeta.setAttribute(
      "content",
      "See exactly how IELTS Ace scores a real Band 6.5 Task 2 essay — inline feedback on Task Achievement, Coherence, Vocabulary, and Grammar."
    );
    return () => {
      document.title = prevTitle;
      if (prevDesc) descMeta.setAttribute("content", prevDesc);
    };
  }, []);

  const hero = {
    crumbs: [
      { label: "Home", href: "/" },
      { label: "Samples", href: "/samples" },
      { label: "Writing", href: "/samples/writing" },
      { label: "Band 6.5 · Task 2" },
    ],
    title: (
      <>
        A real <span className="text-emerald-800">Band 6.5</span> Writing Task
        2, graded as Cambridge would.
      </>
    ),
    description:
      "Every highlight is a live piece of feedback. Hover the essay, read Liz's notes, then compare the scoring against the Band 5.0 and 8.0 samples to see what moves the needle.",
    meta: [
      { label: "Question type", value: "Task 2 · Opinion" },
      { label: "Original length", value: `${parsed.word_count} words` },
      { label: "Evaluated in", value: "12 seconds", live: true },
    ],
    activeBand: "6.5",
    tabs: [
      { band: "5.0", label: "Modest", href: "/samples/writing/band-5-0-task2" },
      { band: "6.5", label: "Competent", href: "/samples/writing/band-6-5-task2" },
      { band: "8.0", label: "Very Good", href: "/samples/writing/band-8-0-task2" },
    ],
    pitch: "Same prompt · three writers · see how a 1.5-band jump actually reads.",
  };

  const essay = {
    text: SAMPLE_ESSAY,
    taskBadge: "Task 2 · Opinion",
    topicLabel: "Technology & society",
    timeTarget: "40 min target",
    prompt: SAMPLE_PROMPT,
    readTimeMinutes: 2,
  };

  const og = {
    url: "testmaster.pro/samples/writing/band-6-5-task2",
    imagePath: "/og/writing-band-6-5-task2.png",
    taskTag: "Task 2 · Opinion",
    quote: SAMPLE_OG_QUOTE,
  };

  return (
    <SampleReportPage
      hero={hero}
      essay={essay}
      result={parsed}
      lizMessage={SAMPLE_LIZ_MESSAGE}
      og={og}
      footerSlug="band-6-5-task2"
    />
  );
}

function upsertMeta(attr, value) {
  let el = document.querySelector(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  return el;
}
