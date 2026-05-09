import React, { useState } from 'react';
import {
  GraduationCap,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  BookOpen,
} from 'lucide-react';
import { WRITING_LESSONS } from './lessons';

const LS_KEY = 'writing_learn_completed_v1';

/**
 * WritingLearnPanel — kademeli (graduated) micro-lessons surfaced INSIDE the
 * writing practice flow.
 *
 * Why it lives here and not in /tips (Strategies):
 *   The student is mid-task. Sending them away to read a tutorial is the
 *   easiest way to lose them. A collapsible "Learn before you write" card
 *   directly above the writing area makes the lesson and the practice the
 *   same screen — read 60–90 seconds, then write.
 *
 * Two states:
 *   - Index: list of all 8 lessons with completion ticks (localStorage).
 *   - Reader: one lesson open, with Prev / Next inside the panel.
 *
 * Storage:
 *   localStorage key 'writing_learn_completed_v1' — Set serialised as
 *   JSON array. Persisting only the lesson IDs keeps it small.
 */
export default function WritingLearnPanel({ defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState(null);
  const [completed, setCompleted] = useState(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(LS_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const persist = (set) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...set]));
    } catch {
      /* localStorage may be disabled — silently ignore */
    }
  };

  const markCompleted = (id) => {
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persist(next);
      return next;
    });
  };

  const activeIndex = activeId ? WRITING_LESSONS.findIndex((l) => l.id === activeId) : -1;
  const activeLesson = activeIndex >= 0 ? WRITING_LESSONS[activeIndex] : null;

  const goPrev = () => {
    if (activeIndex > 0) setActiveId(WRITING_LESSONS[activeIndex - 1].id);
  };
  const goNext = () => {
    if (activeIndex >= 0 && activeIndex < WRITING_LESSONS.length - 1) {
      markCompleted(activeId);
      setActiveId(WRITING_LESSONS[activeIndex + 1].id);
    }
  };
  const finishLesson = () => {
    if (activeId) markCompleted(activeId);
    setActiveId(null);
  };

  const completedCount = completed.size;
  const totalCount = WRITING_LESSONS.length;

  return (
    <div className="bg-white border border-violet-200 rounded-xl overflow-hidden shadow-sm">
      {/* Trigger header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-gray-900">Learn before you write</div>
            <div className="text-[11px] text-gray-600">
              {completedCount} of {totalCount} chapters read · ~1 min each
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {open && (
        <div className="border-t border-violet-100">
          {!activeLesson ? (
            <LessonIndex
              lessons={WRITING_LESSONS}
              completed={completed}
              onPick={(id) => setActiveId(id)}
            />
          ) : (
            <LessonReader
              lesson={activeLesson}
              index={activeIndex}
              total={WRITING_LESSONS.length}
              completed={completed.has(activeLesson.id)}
              onPrev={goPrev}
              onNext={goNext}
              onFinish={finishLesson}
              onClose={() => setActiveId(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function LessonIndex({ lessons, completed, onPick }) {
  return (
    <div className="p-3 space-y-1.5">
      {lessons.map((lesson) => {
        const isDone = completed.has(lesson.id);
        return (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onPick(lesson.id)}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-violet-400 hover:bg-violet-50/50 transition-colors flex items-center gap-3"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">
              {lesson.chapter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{lesson.title}</div>
              <div className="text-[11px] text-gray-500 truncate">{lesson.summary}</div>
            </div>
            {isDone ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function LessonReader({ lesson, index, total, completed, onPrev, onNext, onFinish, onClose }) {
  return (
    <div className="p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] uppercase tracking-wide font-semibold text-violet-700">
          Chapter {lesson.chapter} of {total}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-gray-400 hover:text-gray-700"
          aria-label="Close lesson"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-2 flex items-start gap-2">
        <BookOpen className="w-4 h-4 text-violet-600 flex-shrink-0 mt-1" />
        <span>{lesson.title}</span>
      </h3>
      <p className="text-xs leading-relaxed text-gray-700 mb-3">{lesson.summary}</p>

      <div className="rounded-lg bg-violet-50/60 border border-violet-100 p-3 mb-3">
        <p className="text-xs leading-relaxed text-gray-800">{lesson.body}</p>
      </div>

      {lesson.example && (
        <div className="space-y-2 mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide font-semibold text-rose-600 mb-1">Before</div>
            <p className="text-xs text-gray-700 leading-relaxed pl-2 border-l-2 border-rose-200">
              {lesson.example.before}
            </p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide font-semibold text-emerald-600 mb-1">After</div>
            <p className="text-xs text-gray-700 leading-relaxed pl-2 border-l-2 border-emerald-300">
              {lesson.example.after}
            </p>
          </div>
        </div>
      )}

      {lesson.selfCheck && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4">
          <div className="text-[10px] uppercase tracking-wide font-semibold text-amber-700 mb-1">Self-check</div>
          <p className="text-xs leading-relaxed text-gray-800">{lesson.selfCheck}</p>
        </div>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={index === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Prev
        </button>
        {index < total - 1 ? (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white"
          >
            Mark read &amp; continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onFinish}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Finish &amp; start writing <CheckCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
