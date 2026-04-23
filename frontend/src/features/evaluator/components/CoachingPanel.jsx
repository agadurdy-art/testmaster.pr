import React from "react";
import { AlertTriangle, Target, Edit3, BookOpen, ChevronRight } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

/**
 * Teacher-grade coaching panels restored 2026-04-23.
 *
 * Renders four optional sections from the v2 writing evaluation:
 *   - response_diagnosis (one-glance "what's holding this back")
 *   - highest_priority_fixes (ordered bullet list)
 *   - rewrite_guidance (paragraph-level coaching)
 *   - recommended_lesson (next-step study pointer)
 *
 * Any section whose data is missing is silently skipped, so older evaluation
 * payloads still render cleanly.
 */
export default function CoachingPanel({ result, onOpenLesson }) {
  const diag = result?.response_diagnosis;
  const fixes = result?.highest_priority_fixes || [];
  const rewrite = result?.rewrite_guidance;
  const lesson = result?.recommended_lesson;

  const hasAnything =
    !!diag || fixes.length > 0 || !!rewrite || !!lesson;
  if (!hasAnything) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {diag && (
        <Card className="p-4 border-blue-100 bg-blue-50/40">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" /> Response Diagnosis
          </h3>
          <div className="space-y-1.5 text-xs text-blue-900/90">
            <p>
              <strong>Main Issue:</strong> {diag.main_issue}
            </p>
            <p>
              <strong>Band Ceiling:</strong> {diag.band_ceiling_reason}
            </p>
            <p>
              <strong>Quick Win:</strong> {diag.quick_win}
            </p>
          </div>
        </Card>
      )}

      {fixes.length > 0 && (
        <Card className="p-4 border-red-100 bg-red-50/40">
          <h3 className="font-semibold text-red-900 mb-2 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" /> Highest-Priority Fixes
          </h3>
          <ol className="space-y-1 text-xs text-red-900/90 list-decimal list-inside">
            {fixes.map((f, idx) => (
              <li key={idx}>{f}</li>
            ))}
          </ol>
        </Card>
      )}

      {rewrite && (
        <Card className="p-4 border-violet-100 bg-violet-50/40 md:col-span-2">
          <h3 className="font-semibold text-violet-900 mb-2 text-sm flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-violet-600" /> Rewrite Guidance
          </h3>
          <div className="space-y-1.5 text-xs text-violet-900/90">
            <p>
              <strong>Weakest Paragraph:</strong> {rewrite.weakest_paragraph}
            </p>
            <p>
              <strong>Suggested Opening:</strong>{" "}
              <em>{rewrite.suggested_opening}</em>
            </p>
            <p>
              <strong>Key Linking Phrases:</strong> {rewrite.key_linking_phrases}
            </p>
          </div>
        </Card>
      )}

      {lesson && (
        <Card
          className={`p-4 border-indigo-100 bg-indigo-50/40 md:col-span-2 ${
            onOpenLesson ? "cursor-pointer hover:bg-indigo-50" : ""
          }`}
          onClick={
            onOpenLesson && lesson.lesson_id
              ? () => onOpenLesson(lesson)
              : undefined
          }
        >
          <h3 className="font-semibold text-indigo-900 mb-2 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Recommended Lesson
          </h3>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-indigo-900 truncate">
                {lesson.title}
              </p>
              <p className="text-xs text-indigo-800/80 mt-0.5">
                {lesson.reason}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              {lesson.stage && (
                <Badge className="bg-indigo-100 text-indigo-700 text-[10px] uppercase">
                  {lesson.stage}
                </Badge>
              )}
              {onOpenLesson && lesson.lesson_id && (
                <ChevronRight className="w-4 h-4 text-indigo-500" />
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
