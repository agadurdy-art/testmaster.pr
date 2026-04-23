import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { AnnotationSyncProvider } from "./AnnotationSyncContext";
import ScoreStrip from "./ScoreStrip";
import AnnotatedEssayWithNumbers from "./AnnotatedEssayWithNumbers";
import MarginNotesList from "./MarginNotesList";
import LizTakeCard from "./LizTakeCard";
import CoachingPanel from "./CoachingPanel";

/**
 * V4 "Teacher's Margin" — the full Writing Evaluator Result screen.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │ ScoreStrip (overall + radar + criteria + CTA) │
 *   ├────────────────────────────┬─────────────────┤
 *   │                            │ MarginNotesList │
 *   │ AnnotatedEssayWithNumbers  │                 │
 *   │                            │                 │
 *   ├────────────────────────────┴─────────────────┤
 *   │ LizTakeCard                                  │
 *   └──────────────────────────────────────────────┘
 *
 * Props:
 *   result: validated WritingEvaluationResult
 *   essayText: the original submitted essay
 *   prompt: the task prompt the user wrote about
 *   lizMessage: string (Liz's short take)
 *   onRewrite / onPracticeMore / onViewRewrite: handlers
 */
export default function WritingEvaluatorResult({
  result,
  essayText,
  prompt,
  lizMessage,
  onRewrite,
  onPracticeMore,
  onViewRewrite,
  className,
}) {
  const navigate = useNavigate();
  const handleOpenLesson = (lesson) => {
    if (!lesson?.lesson_id) return;
    // Route by stage when provided; fall back to the mastery course surface.
    const stage = (lesson.stage || "").toLowerCase();
    if (stage === "beginner") {
      navigate(`/beginner-course?lesson=${lesson.lesson_id}`);
    } else if (stage === "advanced") {
      navigate(`/advanced-mastery?lesson=${lesson.lesson_id}`);
    } else {
      navigate(`/mastery-course?lesson=${lesson.lesson_id}`);
    }
  };
  return (
    <AnnotationSyncProvider>
      <div
        className={cn(
          "min-h-screen bg-slate-50",
          // Extra bottom padding on mobile so the final card isn't
          // hidden behind MobileBottomNav (the raised Liz tab).
          "px-4 pt-6 pb-24 lg:px-8 lg:py-8",
          className
        )}
      >
        <div className="max-w-[1400px] mx-auto space-y-5">
          <ScoreStrip result={result} onRewrite={onRewrite} />

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
            <AnnotatedEssayWithNumbers
              essayText={essayText}
              annotations={result.inline_annotations}
              prompt={prompt}
            />
            <MarginNotesList annotations={result.inline_annotations} />
          </div>

          <CoachingPanel result={result} onOpenLesson={handleOpenLesson} />

          {lizMessage && (
            <LizTakeCard
              message={lizMessage}
              onPrimary={onPracticeMore}
              onSecondary={onViewRewrite}
            />
          )}
        </div>
      </div>
    </AnnotationSyncProvider>
  );
}
