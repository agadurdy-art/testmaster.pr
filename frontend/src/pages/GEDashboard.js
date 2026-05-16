import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Award, BookOpen, Flame, Gamepad2, Lock, LogOut,
  MessageSquare, Play, Sparkles, Star, Trophy, Zap, ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../lib/i18n';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import FeedbackModal from '../components/FeedbackModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SUPPORT_EMAIL = 'support@testmaster.pro';
const RAY_AVATAR = '/static/images/ray/ray.png';
const RAY_LOGO = '/brand/ray-english-logo.png';

// Stage icon emoji per stage_id, falls back to 📘
const STAGE_ICON = {
  stage_1_foundations: '🚀',
  stage_2_starters: '⭐',
  stage_3_movers: '📈',
  stage_4_flyers: '✈️',
  stage_5_b1: '🎯',
  stage_6_b2: '🏔️',
  stage_7_ielts_foundation: '📝',
  stage_8_ielts_mastery: '🏆',
};

function StatCard({ icon, value, label, accent = 'violet' }) {
  const accents = {
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <Card className="p-4 border-0 shadow-sm">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${accents[accent]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
    </Card>
  );
}

function StageRow({ stage, isActive, isUnlocked, progressPct, onClick }) {
  const lessonsLabel = stage.total_lessons
    ? `${stage.total_units} units · ${stage.total_lessons} lessons`
    : `${stage.total_units} units · Coming soon`;

  return (
    <button
      type="button"
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isUnlocked
          ? 'bg-white border-violet-100 hover:border-violet-300 hover:shadow-md cursor-pointer'
          : 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-70'
      } ${isActive ? 'ring-2 ring-violet-400' : ''}`}
      data-testid={`stage-row-${stage.stage_id}`}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: isUnlocked ? `${stage.color}22` : '#f3f4f6' }}
        >
          {STAGE_ICON[stage.stage_id] || '📘'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stage {stage.number} · {stage.cefr_level}
            </span>
            {isActive && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-violet-100 text-violet-700">
                ACTIVE
              </span>
            )}
          </div>
          <div className="font-bold text-gray-900 mb-1">{stage.name}</div>
          <div className="text-xs text-gray-500">{lessonsLabel}</div>
          {isUnlocked && progressPct > 0 && (
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, progressPct)}%` }}
              />
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          {isUnlocked ? (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          ) : (
            <Lock className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
    </button>
  );
}

function VocabGameCard({ icon, title, gradient, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group p-5 rounded-xl bg-white border border-gray-100 hover:border-violet-300 hover:shadow-md transition-all"
      data-testid={`vocab-game-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div className="font-semibold text-sm text-gray-900 text-center">{title}</div>
    </button>
  );
}

export default function GEDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const { language } = useI18n();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === THEME_MODES.DARK;

  const [stages, setStages] = useState([]);
  const [progress, setProgress] = useState(null);
  const [resumeLesson, setResumeLesson] = useState(null);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [unitLessons, setUnitLessons] = useState([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Data fetch ---
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [stagesRes, progRes] = await Promise.all([
          fetch(`${API_URL}/api/unified/stages`).then(r => r.json()).catch(() => null),
          user?.id
            ? fetch(`${API_URL}/api/unified/progress/${user.id}`).then(r => r.json()).catch(() => null)
            : Promise.resolve(null),
        ]);
        if (!alive) return;

        const allStages = stagesRes?.stages || [];
        setStages(allStages.sort((a, b) => (a.number || 0) - (b.number || 0)));
        setProgress(progRes);

        // Pick the active stage = highest stage with progress, else stage_1
        const lessonProg = progRes?.lesson_progress || {};
        const completedLessonIds = Object.keys(lessonProg).filter(
          k => lessonProg[k]?.completed
        );

        // Most recently touched lesson (for Resume CTA)
        const sortedTouched = Object.values(lessonProg)
          .filter(lp => lp && lp.lesson_id)
          .sort((a, b) => {
            const ta = a.updated_at || a.completed_at || '';
            const tb = b.updated_at || b.completed_at || '';
            return tb.localeCompare(ta);
          });

        // Resume = most recent in-progress lesson, else first unstarted
        const inProgress = sortedTouched.find(lp => !lp.completed);
        let resumeId = inProgress?.lesson_id;
        if (!resumeId) {
          // Find first lesson not yet completed in stage order
          // Stage 1 lesson 1 by default
          resumeId = 'stage_1_unit_01_lesson_01';
        }
        // Parse lesson_id to find stage + unit
        const parsed = parseLessonId(resumeId);
        setResumeLesson({
          lesson_id: resumeId,
          stage_id: parsed.stage_id,
          stage_number: parsed.stage_number,
          unit_id: parsed.unit_id,
          unit_number: parsed.unit_number,
          lesson_number: parsed.lesson_number,
          status: inProgress ? 'resume' : 'start',
        });

        // Fetch current unit's 4 lessons
        if (parsed.unit_id) {
          try {
            const unitRes = await fetch(
              `${API_URL}/api/unified/units/${parsed.unit_id}`
            ).then(r => r.json());
            if (alive) {
              setCurrentUnit(unitRes);
              setUnitLessons(unitRes?.lessons || []);
            }
          } catch (_) {
            /* unit fetch optional */
          }
        }
      } catch (e) {
        if (alive) toast.error('Could not load dashboard data');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  // --- Derived stats ---
  const stats = useMemo(() => {
    const lp = progress?.lesson_progress || {};
    const completedLessons = Object.values(lp).filter(x => x?.completed).length;
    const totalLessons = stages.reduce((s, st) => s + (st.total_lessons || 0), 0);
    const pathPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const badges = (progress?.badges || []).length || 0;
    const streak = progress?.daily_streak || 0;
    const xp = progress?.total_points || 0;
    return { completedLessons, totalLessons, pathPct, badges, streak, xp };
  }, [progress, stages]);

  // --- Per-stage progress percentages ---
  const stageProgress = useMemo(() => {
    const lp = progress?.lesson_progress || {};
    const completedIds = Object.keys(lp).filter(k => lp[k]?.completed);
    const map = {};
    for (const st of stages) {
      const stageLessons = completedIds.filter(id => id.startsWith(st.stage_id));
      const total = st.total_lessons || 0;
      map[st.stage_id] = total > 0 ? Math.round((stageLessons.length / total) * 100) : 0;
    }
    return map;
  }, [progress, stages]);

  const activeStageId = resumeLesson?.stage_id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/40 via-white to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <a href="/ge/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <img
              src={RAY_LOGO}
              alt="Ray English"
              className="h-8 md:h-9 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-100 text-violet-700 hidden md:inline">
              BETA
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <LanguageSwitcher />
            <button
              onClick={() => navigate('/pricing')}
              className="text-gray-600 hover:text-violet-600 transition-colors"
              data-testid="ge-nav-pricing"
            >
              Pricing
            </button>
            <button
              onClick={() => (window.location.href = `mailto:${SUPPORT_EMAIL}`)}
              className="text-gray-600 hover:text-violet-600 transition-colors"
            >
              Contact
            </button>
            <span className="flex items-center gap-1.5 text-gray-700">
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-violet-700">
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{user?.name || 'Aga'}</span>
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium"
              data-testid="ge-nav-logout"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </nav>
          {/* Mobile logout */}
          <button
            onClick={onLogout}
            className="md:hidden text-rose-600 p-2"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
        {/* Welcome + Stats */}
        <section>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600 mb-5">
            Continue your English learning journey
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              icon={<BookOpen className="w-4 h-4" />}
              value={stats.completedLessons}
              label="Lessons done"
              accent="violet"
            />
            <StatCard
              icon={<Trophy className="w-4 h-4" />}
              value={stats.badges}
              label="Badges"
              accent="amber"
            />
            <StatCard
              icon={<Flame className="w-4 h-4" />}
              value={stats.streak}
              label="Day streak"
              accent="rose"
            />
            <StatCard
              icon={<Zap className="w-4 h-4" />}
              value={`${stats.pathPct}%`}
              label="Path complete"
              accent="emerald"
            />
          </div>
        </section>

        {/* Continue Learning Hero */}
        {resumeLesson && (
          <section>
            <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={RAY_AVATAR}
                    alt="Ray"
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-white/30 object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider opacity-90 mb-1">
                      <Play className="w-3 h-3" />
                      {resumeLesson.status === 'resume' ? 'Continue learning' : 'Start your journey'}
                    </div>
                    <div className="text-lg md:text-xl font-bold mb-1 truncate">
                      Stage {resumeLesson.stage_number} · Unit {resumeLesson.unit_number} · Lesson {resumeLesson.lesson_number}
                    </div>
                    <div className="text-sm opacity-90 truncate">
                      {currentUnit?.title || 'Pick up where you left off'}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/unified/lesson/${resumeLesson.lesson_id}`)}
                  className="bg-white text-violet-700 hover:bg-violet-50 font-semibold flex-shrink-0"
                  data-testid="ge-resume-cta"
                >
                  {resumeLesson.status === 'resume' ? 'Resume' : 'Start'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </Card>
          </section>
        )}

        {/* Current Unit Lessons */}
        {unitLessons.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Current Unit
                </h2>
                <p className="text-lg font-bold text-gray-900">
                  {currentUnit?.title || 'Unit'}
                </p>
              </div>
              {currentUnit?.subtitle && (
                <span className="text-sm text-gray-500 hidden md:block">
                  {currentUnit.subtitle}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {unitLessons.slice(0, 4).map((lesson, idx) => {
                const lid = lesson.lesson_id || `${currentUnit?.unit_id}_lesson_${String(idx + 1).padStart(2, '0')}`;
                const lp = progress?.lesson_progress?.[lid];
                const isComplete = !!lp?.completed;
                const isActive = lid === resumeLesson?.lesson_id;
                return (
                  <button
                    key={lid}
                    type="button"
                    onClick={() => navigate(`/unified/lesson/${lid}`)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-violet-50 border-violet-300 ring-2 ring-violet-300'
                        : isComplete
                          ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                          : 'bg-white border-gray-200 hover:border-violet-200 hover:shadow-sm'
                    }`}
                    data-testid={`ge-unit-lesson-${idx + 1}`}
                  >
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      Lesson {lesson.lesson_num || idx + 1}
                    </div>
                    <div className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
                      {lesson.title || `Lesson ${idx + 1}`}
                    </div>
                    {isComplete ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <Star className="w-3 h-3" /> Completed
                      </span>
                    ) : isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700">
                        <Play className="w-3 h-3" /> In progress
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400">Not started</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Stage Map */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Learning Path
              </h2>
              <p className="text-lg font-bold text-gray-900">
                Pre-A1 → C1 · Your full English roadmap
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-violet-700">{stats.pathPct}%</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Complete</div>
            </div>
          </div>
          <div className="space-y-3">
            {stages.map((stage) => {
              const isUnlocked = (stage.total_lessons || 0) > 0;
              const isActive = stage.stage_id === activeStageId;
              return (
                <StageRow
                  key={stage.stage_id}
                  stage={stage}
                  isActive={isActive}
                  isUnlocked={isUnlocked}
                  progressPct={stageProgress[stage.stage_id] || 0}
                  onClick={() => navigate(`/unified/stage/${stage.stage_id}`)}
                />
              );
            })}
          </div>
        </section>

        {/* Vocab Games (kept from GE) */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Gamepad2 className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-bold text-gray-900">Practice your words</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Quick games to lock in vocabulary from your lessons
          </p>
          <div className="grid grid-cols-3 gap-3">
            <VocabGameCard
              icon="🎯"
              title="Matching"
              gradient="from-blue-500 to-cyan-500"
              onClick={() => navigate('/games/matching_pairs/family')}
            />
            <VocabGameCard
              icon="🐝"
              title="Spelling"
              gradient="from-amber-500 to-yellow-500"
              onClick={() => navigate('/games/spelling_bee/animals')}
            />
            <VocabGameCard
              icon="🏎️"
              title="Word Race"
              gradient="from-emerald-500 to-green-500"
              onClick={() => navigate('/games/word_race/food')}
            />
          </div>
          <Card className="mt-3 p-4 flex items-center justify-between border-0 bg-violet-50/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl">
                🎮
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">Daily Challenge</div>
                <div className="text-xs text-gray-600">Complete 3 games to earn bonus XP!</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <Star className="w-4 h-4 text-gray-300" />
            </div>
          </Card>
        </section>

        {/* Achievements + Progress */}
        <section className="grid md:grid-cols-2 gap-4">
          <Card className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-gray-900">Your Achievements</span>
              </div>
              <span className="text-xs font-semibold text-amber-700">
                {stats.badges} {stats.badges === 1 ? 'badge' : 'badges'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(progress?.badges || []).slice(0, 6).map((b, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-white border border-amber-200 text-amber-800"
                >
                  🎯 {typeof b === 'string' ? b : b.title || 'Badge'}
                </span>
              ))}
              {(!progress?.badges || progress.badges.length === 0) && (
                <span className="text-xs text-gray-500 italic">
                  Complete your first lesson to earn a badge!
                </span>
              )}
            </div>
          </Card>
          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="text-left p-5 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-all"
            data-testid="ge-view-progress"
          >
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-5 h-5" />
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="font-bold text-lg mb-1">View Full Progress</div>
            <div className="text-sm opacity-90">Detailed analytics &amp; learning history</div>
          </button>
        </section>

        {/* Help footer */}
        <section className="pb-10">
          <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-0 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                ✏️
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">Help us improve!</div>
                <div className="text-xs text-gray-600">
                  This platform is in beta. Your feedback matters.
                </div>
              </div>
            </div>
            <Button
              onClick={() => setFeedbackOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white"
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" /> Give Feedback
            </Button>
          </Card>
        </section>
      </main>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}

// Parse a unified lesson_id like "stage_2_unit_01_lesson_03"
// into structured pieces. Returns null fields if parsing fails.
function parseLessonId(lessonId) {
  if (!lessonId || typeof lessonId !== 'string') {
    return { stage_id: null, stage_number: null, unit_id: null, unit_number: null, lesson_number: null };
  }
  const m = lessonId.match(/^(stage_(\d+)_[a-z_]+?)_unit_(\d+)_lesson_(\d+)$/);
  if (!m) {
    // Fallback: at least extract stage_id from the prefix
    const sm = lessonId.match(/^(stage_(\d+)_[a-z_]+?)_unit/);
    if (sm) {
      return {
        stage_id: sm[1],
        stage_number: parseInt(sm[2], 10),
        unit_id: null,
        unit_number: null,
        lesson_number: null,
      };
    }
    return { stage_id: null, stage_number: null, unit_id: null, unit_number: null, lesson_number: null };
  }
  return {
    stage_id: m[1],
    stage_number: parseInt(m[2], 10),
    unit_id: `${m[1]}_unit_${m[3]}`,
    unit_number: parseInt(m[3], 10),
    lesson_number: parseInt(m[4], 10),
  };
}
