import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Trophy,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  BookOpen,
  Mic,
  Volume2,
  PenSquare,
  Check,
  X,
} from 'lucide-react';
import { getUserProgress } from '../lib/api';

const COURSES = [
  {
    id: 'beginner',
    route: '/beginner-course',
    title: 'Beginner Foundations',
    range: [4.0, 5.5],
    rangeLabel: 'Band 4.0 – 5.5',
    tagline: 'Build the fundamentals — grammar, vocabulary, everyday fluency.',
    accent: 'from-sky-500 to-cyan-500',
    accentBorder: 'border-sky-200',
    accentText: 'text-sky-700',
    accentBg: 'bg-sky-50',
  },
  {
    id: 'mastery',
    route: '/mastery-course',
    title: 'IELTS Mastery',
    range: [5.0, 7.0],
    rangeLabel: 'Band 5.0 – 7.0',
    tagline: 'Bridge to target band — task strategies, coherence, lexical range.',
    accent: 'from-emerald-500 to-teal-500',
    accentBorder: 'border-emerald-200',
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-50',
  },
  {
    id: 'advanced',
    route: '/advanced-mastery',
    title: 'Advanced Mastery',
    range: [6.5, 8.5],
    rangeLabel: 'Band 6.5 – 8.5',
    tagline: 'Polish for 7+ — sophisticated syntax, nuance, exam timing.',
    accent: 'from-violet-500 to-purple-500',
    accentBorder: 'border-violet-200',
    accentText: 'text-violet-700',
    accentBg: 'bg-violet-50',
  },
];

const LEARNING_TOOLS = [
  { id: 'vocab', title: 'Vocabulary', desc: 'Topic-based word banks', icon: BookOpen, route: '/vocab-grammar', ready: true },
  { id: 'grammar', title: 'Grammar', desc: 'Drills + explanations', icon: PenSquare, route: '/vocab-grammar', ready: true },
  { id: 'speaking', title: 'Speaking topics', desc: 'Part 1/2/3 cue cards', icon: Mic, route: '/speaking-practice', ready: true },
  { id: 'pron', title: 'Pronunciation', desc: 'Sound-by-sound trainer', icon: Volume2, route: null, ready: false },
];

// 3-question quiz → band estimate
const QUIZ = [
  {
    q: 'When you read an English news article, how much do you understand?',
    options: [
      { label: 'Most of it, including nuance', band: 7 },
      { label: 'The main ideas, some detail', band: 6 },
      { label: 'General topic, many unknown words', band: 5 },
      { label: 'Only a few words here and there', band: 4 },
    ],
  },
  {
    q: 'Can you talk about a familiar topic for 2 minutes without stopping?',
    options: [
      { label: 'Yes, with natural linking and vocabulary', band: 7 },
      { label: 'Yes, with occasional pauses', band: 6 },
      { label: 'Short sentences, lots of hesitation', band: 5 },
      { label: 'Just a few sentences', band: 4 },
    ],
  },
  {
    q: 'How comfortable are you with Writing Task 2 (250-word essay)?',
    options: [
      { label: 'Confident with structure and argument', band: 7 },
      { label: 'Can write one, unsure about band', band: 6 },
      { label: 'Struggle with paragraph structure', band: 5 },
      { label: 'Never tried a full essay', band: 4 },
    ],
  },
];

function recommendedForBand(band) {
  if (band == null) return 'mastery';
  if (band <= 5.0) return 'beginner';
  if (band >= 6.5) return 'advanced';
  return 'mastery';
}

export default function CoursesPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [baselineBand, setBaselineBand] = useState(null);
  const [courseProgress, setCourseProgress] = useState({});
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizPicks, setQuizPicks] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.id) return;
      try {
        const progress = await getUserProgress(user.id);
        if (cancelled) return;
        const avg = progress?.average_band_score ?? null;
        setBaselineBand(avg);
      } catch (_) {
        // no baseline yet — banner stays minimal
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  const recommendedId = recommendedForBand(baselineBand);

  const handleQuizPick = (band) => {
    const next = [...quizPicks, band];
    setQuizPicks(next);
    if (quizStep + 1 < QUIZ.length) {
      setQuizStep(quizStep + 1);
    } else {
      // finalize
      const avg = next.reduce((a, b) => a + b, 0) / next.length;
      const rec = recommendedForBand(avg);
      const target = COURSES.find((c) => c.id === rec);
      setQuizOpen(false);
      if (target) navigate(target.route);
    }
  };

  const resetQuiz = () => { setQuizStep(0); setQuizPicks([]); };
  const openQuiz = () => { resetQuiz(); setQuizOpen(true); };
  const closeQuiz = () => { setQuizOpen(false); resetQuiz(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">IELTS Ace</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Courses</div>
          <h2 className="text-4xl font-bold text-gray-900 mt-1">Pick your track</h2>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl">
            Structured courses that adapt to your current level. Liz will guide you through the right one.
          </p>
        </div>

        {/* Liz recommends banner */}
        <div className="mb-4 flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-200">
          <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 grid place-items-center text-white font-serif text-lg font-bold shadow-md">
            L
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Liz recommends</div>
            <p className="text-gray-800 mt-0.5">
              {baselineBand
                ? <>Based on your current band <b>{baselineBand.toFixed(1)}</b>, I suggest starting with <b>{COURSES.find(c=>c.id===recommendedId)?.title}</b>.</>
                : <>Take a quick baseline or the 3-question check so I can point you to the right track.</>}
            </p>
          </div>
        </div>

        {/* Not sure strip */}
        <div className="mb-8 flex items-center justify-between gap-3 p-4 rounded-xl bg-white border border-dashed border-gray-300">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-gray-900 font-medium">Not sure where to start?</p>
              <p className="text-sm text-gray-500">3 quick questions, we'll pick your course.</p>
            </div>
          </div>
          <Button onClick={openQuiz} variant="outline" className="border-gray-300">
            Take level check
          </Button>
        </div>

        {/* Course cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {COURSES.map((course) => {
            const isRecommended = course.id === recommendedId && baselineBand != null;
            const progress = courseProgress[course.id] ?? 0;
            return (
              <Card
                key={course.id}
                className={`p-6 flex flex-col relative transition hover:-translate-y-0.5 hover:shadow-lg ${
                  isRecommended ? `ring-2 ring-emerald-500 ${course.accentBorder}` : ''
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-2 left-5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-semibold tracking-wide uppercase shadow">
                    Liz recommends for your level
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.accent} flex items-center justify-center mb-4 shadow`}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className={`inline-block self-start px-2 py-0.5 rounded-md text-[11px] font-semibold ${course.accentBg} ${course.accentText} mb-2`}>
                  {course.rangeLabel}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1.5">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-1">{course.tagline}</p>

                {progress > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>In progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${course.accent}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  className={`w-full ${isRecommended ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                  variant={isRecommended ? 'default' : 'outline'}
                  onClick={() => navigate(course.route)}
                >
                  {progress > 0 ? 'Continue' : 'Start course'}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Learning tools */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Learning tools</h3>
          <p className="text-gray-500 mb-5">Quick-access drills to sharpen specific skills between course lessons.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LEARNING_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  disabled={!tool.ready}
                  onClick={() => tool.ready && tool.route && navigate(tool.route)}
                  className={`text-left p-5 rounded-xl bg-white border border-gray-200 transition ${
                    tool.ready
                      ? 'hover:border-emerald-300 hover:shadow-md cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 grid place-items-center mb-3">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900">{tool.title}</p>
                    {!tool.ready && (
                      <span className="text-[10px] uppercase font-semibold tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Soon</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{tool.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Level quiz modal */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={closeQuiz}>
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeQuiz}
              className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 mb-1">
              Level check · {quizStep + 1} of {QUIZ.length}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{QUIZ[quizStep].q}</h3>
            <div className="space-y-2">
              {QUIZ[quizStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuizPick(opt.band)}
                  className="w-full text-left p-3.5 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition flex items-center justify-between group"
                >
                  <span className="text-gray-800">{opt.label}</span>
                  <Check className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${((quizStep + 1) / QUIZ.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
