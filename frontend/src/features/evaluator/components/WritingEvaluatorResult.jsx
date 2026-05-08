import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "../../../lib/utils";
import { AnnotationSyncProvider } from "./AnnotationSyncContext";
import ScoreStrip from "./ScoreStrip";
import AnnotatedEssayWithNumbers from "./AnnotatedEssayWithNumbers";
import MarginNotesList from "./MarginNotesList";
import LizTakeCard from "./LizTakeCard";
import CoachingPanel from "./CoachingPanel";

/**
 * V4 "Liz's Margin" — the full Writing Evaluator Result screen.
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
  onBack,
  onRewrite,
  onPracticeMore,
  onViewRewrite,
  title = "Writing Evaluation",
  className,
}) {
  const navigate = useNavigate();
  const handleOpenLesson = (lesson) => {
    // Route by stage when provided; fall back to the mastery course surface.
    // If lesson_id is missing, still navigate to the relevant course landing
    // so the click is never a no-op.
    const stage = (lesson?.stage || "").toLowerCase();
    const lessonId = lesson?.lesson_id;
    const qs = lessonId ? `?lesson=${lessonId}` : "";
    if (stage === "beginner") {
      navigate(`/beginner-course${qs}`);
    } else if (stage === "advanced") {
      navigate(`/advanced-mastery${qs}`);
    } else {
      navigate(`/mastery-course${qs}`);
    }
  };
  return (
    <AnnotationSyncProvider>
      <div
        className={cn(
          "min-h-screen bg-slate-50",
          // Extra bottom padding on mobile so the final card isn't
          // hidden behind MobileBottomNav (the raised Liz tab).
          "pb-24 lg:pb-8",
          className
        )}
      >
        {/* Sticky header with back button + title */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <h1 className="text-sm font-semibold text-slate-900 ml-auto mr-auto">
              {title}
            </h1>
            {onPracticeMore ? (
              <button
                type="button"
                onClick={onPracticeMore}
                className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                Practice more
              </button>
            ) : (
              <span className="w-16" aria-hidden />
            )}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto space-y-5 px-4 pt-6 lg:px-8 lg:pt-8">
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
