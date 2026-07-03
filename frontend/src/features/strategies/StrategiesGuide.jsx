// StrategiesGuide — orchestrator for the /tips and /strategies surfaces.
// Slide/block renderers and shared constants were extracted verbatim into
// ./constants.js and ./components/* during the monolith split; this file keeps
// the chapter index, chapter view and top-level data fetching.
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Sparkles,
  ChevronRight, ChevronLeft, Award,
} from 'lucide-react';
import axios from 'axios';
import AppShellNav from '../../components/appshell/AppShellNav';
import { API, SKILL_META, ACCENTS } from './constants';
import { SlideRenderer } from './components/SlideRenderer';

// =============================================================================
// CHAPTER VIEW — sidebar + slide viewer
// =============================================================================

function LessonSidebar({ chapter, currentLessonIdx, onSelect, accent }) {
  const a = ACCENTS[accent];
  return (
    <aside className="w-full lg:w-72 lg:flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:sticky lg:top-24">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 px-2">Lessons</div>
        <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
          {chapter.lessons.map((lesson, idx) => {
            const isActive = idx === currentLessonIdx;
            return (
              <button
                key={lesson.lesson_id}
                onClick={() => onSelect(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-start gap-2 ${
                  isActive ? `${a.soft} ${a.softText} font-semibold` : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={`text-xs font-bold mt-0.5 ${isActive ? a.text : 'text-gray-400'}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 leading-snug">{lesson.title}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

// Where each chapter sends the student to actually practise after they finish reading.
const SKILL_PRACTICE_ROUTE = {
  reading: '/question-bank/reading/academic',
  listening: '/question-bank/listening',
  writing: '/question-bank/writing/task2',
  speaking: '/question-bank/speaking',
  vocabulary: '/vocabulary',
};

function ChapterView({ chapter, onBack, user }) {
  const accent = SKILL_META[chapter.skill]?.accent || 'emerald';
  const a = ACCENTS[accent];
  const SkillIcon = SKILL_META[chapter.skill]?.icon || BookOpen;
  const navigate = useNavigate();

  const [lessonIdx, setLessonIdx] = useState(0);
  const lesson = chapter.lessons[lessonIdx];
  const total = chapter.lessons.length;
  const isLastLesson = lessonIdx === total - 1;
  const practiceRoute = SKILL_PRACTICE_ROUTE[chapter.skill];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lessonIdx]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-white">
      {/* Decorative accent-tinted blur blobs — provides depth without distracting from content */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className={`absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full ${a.bg} opacity-60 blur-3xl`} />
        <div className={`absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full ${a.bg} opacity-50 blur-3xl`} />
        <div className={`absolute bottom-0 right-1/4 w-[380px] h-[380px] rounded-full ${a.bg} opacity-40 blur-3xl`} />
      </div>
      <AppShellNav currentPage="strategies" user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            All chapters
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <SkillIcon className="w-4 h-4" />
            <span className="font-medium">{SKILL_META[chapter.skill]?.name}</span>
            <span className="text-gray-300">·</span>
            <span>Lesson {lessonIdx + 1} of {total}</span>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <LessonSidebar chapter={chapter} currentLessonIdx={lessonIdx} onSelect={setLessonIdx} accent={accent} />

          <main className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2.5 py-1 rounded-full ${a.soft} ${a.softText} font-semibold text-xs uppercase tracking-wider`}>
                Lesson {lessonIdx + 1}
              </span>
              <span className="text-gray-500">{chapter.title}</span>
            </div>
            {/* Suppress outer H1 when the first slide already carries the same title —
                otherwise the lesson title renders twice (H1 here + slide title). */}
            {(() => {
              const first = (lesson.slides || [])[0];
              if (first && first.title && first.title === lesson.title) return null;
              return <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{lesson.title}</h1>;
            })()}

            {lesson.liz_intro && (
              <div className={`rounded-2xl ${a.bg} border ${a.border} p-5 flex gap-3`}>
                <Sparkles className={`w-5 h-5 ${a.text} flex-shrink-0 mt-0.5`} />
                <p className={`text-sm ${a.softText} leading-relaxed`}>{lesson.liz_intro}</p>
              </div>
            )}

            {(lesson.slides || []).map((slide, i) => (
              <SlideRenderer key={i} slide={slide} accent={accent} />
            ))}

            {lesson.practice_link && (
              <a
                href={lesson.practice_link.href}
                className={`inline-flex items-center gap-2 ${a.solid} text-white font-semibold px-6 py-3 rounded-xl transition-colors`}
              >
                {lesson.practice_link.label}
                <ArrowRight className="w-4 h-4" />
              </a>
            )}

            {lesson.liz_outro && (
              <div className={`rounded-2xl ${a.bg} border ${a.border} p-5 flex gap-3`}>
                <Sparkles className={`w-5 h-5 ${a.text} flex-shrink-0 mt-0.5`} />
                <p className={`text-sm ${a.softText} leading-relaxed`}>{lesson.liz_outro}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setLessonIdx((v) => Math.max(0, v - 1))}
                disabled={lessonIdx === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="text-sm text-gray-500">{lessonIdx + 1} / {total}</div>
              {isLastLesson ? (
                <button
                  onClick={() => practiceRoute ? navigate(practiceRoute) : onBack()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${a.solid} text-white text-sm font-medium`}
                >
                  {practiceRoute ? 'Practice in Question Bank' : 'Finish'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setLessonIdx((v) => Math.min(total - 1, v + 1))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${a.solid} text-white text-sm font-medium`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CHAPTER INDEX — landing view
// =============================================================================

// Skill tab order — matches Question Bank surface for muscle memory.
const SKILL_TAB_ORDER = ['listening', 'reading', 'writing', 'speaking', 'vocabulary'];

function ChapterIndex({ chapters, activeSkill, onSkillChange, onOpen, onBack, user }) {
  // Build per-skill chapter map and counts.
  const bySkill = SKILL_TAB_ORDER.reduce((acc, s) => {
    acc[s] = chapters.filter((c) => c.skill === s);
    return acc;
  }, {});
  const visibleChapters = bySkill[activeSkill] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white">
      <AppShellNav currentPage="strategies" user={user} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Complete A-to-Z Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Strategies Guide</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Step-by-step strategies for every IELTS question type. Faithfully ported chapters covering listening, reading, speaking, writing and vocabulary.
          </p>
        </div>

        {/* Skill tabs — QB-style centered iOS 26 segmented pill */}
        <div className="flex justify-center mb-8">
          <div
            role="tablist"
            aria-label="Filter strategies by skill"
            className="inline-flex gap-1 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200 shadow-sm backdrop-blur max-w-full overflow-x-auto"
          >
            {SKILL_TAB_ORDER.map((skill) => {
              const meta = SKILL_META[skill];
              if (!meta) return null;
              const Icon = meta.icon;
              const a = ACCENTS[meta.accent];
              const count = bySkill[skill]?.length || 0;
              const selected = skill === activeSkill;
              return (
                <button
                  key={skill}
                  role="tab"
                  aria-selected={selected}
                  data-testid={`strategies-skill-tab-${skill}`}
                  onClick={() => onSkillChange(skill)}
                  disabled={count === 0}
                  className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                    selected
                      ? 'bg-white text-gray-900 font-semibold border border-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.06)]'
                      : 'border border-transparent text-gray-500 hover:text-gray-700 font-medium'
                  } ${count === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Icon className={`w-4 h-4 ${selected ? a.text : ''}`} strokeWidth={selected ? 2.2 : 1.8} />
                  {meta.name}
                  {count > 0 && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        selected ? `${a.soft} ${a.softText}` : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No chapters available yet. Content extraction in progress.</p>
          </div>
        ) : visibleChapters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-600">
              No {SKILL_META[activeSkill]?.name.toLowerCase()} chapters yet — extraction in progress.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {visibleChapters.map((ch) => {
              const meta = SKILL_META[ch.skill] || SKILL_META.listening;
              const a = ACCENTS[meta.accent];
              const Icon = meta.icon;
              const ready = ch.extraction_status === 'complete';
              return (
                <button
                  key={ch.chapter_id}
                  onClick={() => ready && onOpen(ch.chapter_id)}
                  disabled={!ready}
                  className={`group text-left bg-white rounded-2xl border-2 ${a.border} p-6 transition-all ${
                    ready ? `hover:shadow-lg hover:-translate-y-0.5 cursor-pointer` : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${a.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold uppercase tracking-widest ${a.text} mb-1`}>
                        {meta.name}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 leading-snug mb-1">{ch.title}</h3>
                      {ch.subtitle && <p className="text-sm text-gray-600 leading-relaxed mb-3">{ch.subtitle}</p>}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{ch.lesson_count} lessons</span>
                        {!ready && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">Coming soon</span>
                        )}
                      </div>
                    </div>
                    {ready && <ChevronRight className={`w-5 h-5 ${a.text} group-hover:translate-x-1 transition-transform`} />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function StrategiesGuide({ user, onLogout }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const chapterParam = searchParams.get('chapter');
  const skillParam = searchParams.get('skill');

  const [chapters, setChapters] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active skill — URL ?skill= sync, default to first skill that has chapters once loaded.
  const activeSkill = SKILL_TAB_ORDER.includes(skillParam) ? skillParam : null;
  const resolvedSkill = activeSkill || (chapters.length
    ? (SKILL_TAB_ORDER.find((s) => chapters.some((c) => c.skill === s)) || 'listening')
    : 'listening');

  const handleSkillChange = (skill) => {
    const next = new URLSearchParams(searchParams);
    next.set('skill', skill);
    next.delete('chapter');
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/strategies/index`)
      .then((r) => setChapters(r.data?.chapters || []))
      .catch((e) => setError(e?.response?.data?.detail || 'Failed to load strategies'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!chapterParam) {
      setChapter(null);
      return;
    }
    setLoading(true);
    axios.get(`${API}/strategies/chapter/${chapterParam}`)
      .then((r) => setChapter(r.data))
      .catch((e) => setError(e?.response?.data?.detail || 'Failed to load chapter'))
      .finally(() => setLoading(false));
  }, [chapterParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading strategies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 max-w-md text-center">
          <p className="text-rose-700 font-semibold mb-2">Could not load strategies</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (chapter) {
    return (
      <ChapterView
        chapter={chapter}
        user={user}
        onBack={() => {
          // Preserve ?skill= so the user lands back on the tab they came from.
          const next = new URLSearchParams();
          if (resolvedSkill) next.set('skill', resolvedSkill);
          setSearchParams(next);
        }}
      />
    );
  }

  return (
    <ChapterIndex
      chapters={chapters}
      user={user}
      activeSkill={resolvedSkill}
      onSkillChange={handleSkillChange}
      onOpen={(id) => {
        const next = new URLSearchParams(searchParams);
        next.set('chapter', id);
        setSearchParams(next);
      }}
      onBack={() => navigate('/dashboard')}
    />
  );
}
