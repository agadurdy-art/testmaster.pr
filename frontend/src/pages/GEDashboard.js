import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rocket, Sparkles, TrendingUp, Plane, GraduationCap, Brain,
  Target, Crown, ChevronRight, Lock, Flame, Trophy, Zap,
  ArrowLeft, ArrowRight, Play, LogOut, MessageSquare, Gamepad2,
  Star,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { useI18n } from '../lib/i18n';
import { isAdminUser } from '../lib/planAccess';
import FeedbackModal from '../components/FeedbackModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SUPPORT_EMAIL = 'support@testmaster.pro';
const RAY_AVATAR = '/static/images/ray/ray.png';
const RAY_LOGO = '/brand/ray-english-logo.png';

// Override backend icon keys with a fresher Lucide set tuned for each
// stage's spirit (kindergarten → IELTS mastery).
const STAGE_ICON_MAP = {
  stage_1_foundations: Rocket,        // launch / first words
  stage_2_starters: Sparkles,         // bright early wins
  stage_3_movers: TrendingUp,         // visible growth
  stage_4_flyers: Plane,              // taking off, fluency
  stage_5_b1: GraduationCap,          // academic register kicks in
  stage_6_b2: Brain,                  // deeper reasoning
  stage_7_ielts_foundation: Target,   // exam laser focus
  stage_8_ielts_mastery: Crown,       // top tier
};

// Glass stage card — iOS 26 style, ported from UnifiedCoursePage.
function StageCard({ stage, isUnlocked, progressPct, isActive, onClick }) {
  const Icon = STAGE_ICON_MAP[stage.stage_id] || Rocket;
  return (
    <button
      type="button"
      onClick={() => onClick(stage)}
      disabled={!isUnlocked}
      className={`relative overflow-hidden text-left rounded-3xl transition-all duration-300 ${
        isUnlocked ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer' : 'opacity-60 cursor-not-allowed'
      } ${isActive ? 'ring-2 ring-violet-400 ring-offset-2' : ''}`}
      style={{
        background: 'rgba(255, 255, 255, 0.70)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `2px solid ${stage.color}40`,
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.07)',
      }}
      data-testid={`stage-card-${stage.number}`}
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${stage.color} 0%, transparent 60%)` }}
      />
      <div className="relative p-6">
        {!isUnlocked && (
          <div className="absolute inset-0 bg-gray-900/60 flex flex-col items-center justify-center z-10 rounded-3xl backdrop-blur-sm gap-2">
            <Lock className="w-10 h-10 text-white" />
            <span className="text-white text-sm font-medium px-3 text-center">
              Coming soon
            </span>
          </div>
        )}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: stage.color }}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          <Badge
            variant="outline"
            className="text-xs font-medium rounded-full px-3"
            style={{ borderColor: stage.color, color: stage.color, background: `${stage.color}10` }}
          >
            {stage.cefr_level}
          </Badge>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          Stage {stage.number}: {stage.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {stage.description}
        </p>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <span>{stage.total_units || 0} Units</span>
          <span>•</span>
          <span>{stage.total_lessons || stage.total_units * (stage.lessons_per_unit || 4)} Lessons</span>
        </div>
        {isUnlocked && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold" style={{ color: stage.color }}>{progressPct}%</span>
            </div>
            <div className="h-2 bg-gray-100/80 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, backgroundColor: stage.color }}
              />
            </div>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: stage.color }}>
            {isUnlocked ? (progressPct > 0 ? 'Continue' : 'Start') : 'Locked'}
          </span>
          <ChevronRight className="w-5 h-5" style={{ color: stage.color }} />
        </div>
      </div>
    </button>
  );
}

// Sticky glass header — Ray brand + gamification chips + nav
function RayHeader({ user, userProgress, onLogout, navigate }) {
  return (
    <div
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(255, 255, 255, 0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.50)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
        <a href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <img
            src={RAY_LOGO}
            alt="Ray English"
            className="h-9 md:h-10 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-100 text-violet-700 hidden md:inline">
            BETA
          </span>
        </a>

        <div className="flex items-center gap-3 md:gap-5">
          {/* Streak */}
          <div className="flex items-center gap-1.5" title="Daily streak">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251, 146, 60, 0.15)' }}>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <span className="font-bold text-gray-900 text-sm">{userProgress?.daily_streak || 0}</span>
          </div>
          {/* Points */}
          <div className="flex items-center gap-1.5" title="XP">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
              <Zap className="w-4 h-4 text-violet-600" />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              {(userProgress?.total_points || 0).toLocaleString()}
            </span>
          </div>
          {/* Rank */}
          <div className="hidden md:flex items-center gap-1.5" title="Global rank">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(250, 204, 21, 0.15)' }}>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              #{userProgress?.global_rank || '—'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200">
            <button
              onClick={() => navigate('/pricing')}
              className="text-sm text-gray-600 hover:text-violet-600"
              data-testid="ge-nav-pricing"
            >
              Pricing
            </button>
            <button
              onClick={() => (window.location.href = `mailto:${SUPPORT_EMAIL}`)}
              className="text-sm text-gray-600 hover:text-violet-600"
            >
              Contact
            </button>
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-violet-700">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-700 text-sm font-medium"
              data-testid="ge-nav-logout"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
          <button
            onClick={onLogout}
            className="md:hidden text-rose-600 p-1.5 ml-1"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GEDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const { language } = useI18n();
  const [stages, setStages] = useState([]);
  const [progress, setProgress] = useState(null);
  const [resumeLesson, setResumeLesson] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

        const allStages = (stagesRes?.stages || []).sort(
          (a, b) => (a.number || 0) - (b.number || 0)
        );
        setStages(allStages);
        setProgress(progRes);

        // Resume = most recent in-progress lesson; fallback to stage_1 lesson 1
        const lp = progRes?.lesson_progress || {};
        const inProgress = Object.values(lp)
          .filter(x => x && x.lesson_id && !x.completed)
          .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))[0];
        const resumeId = inProgress?.lesson_id || 'stage_1_unit_01_lesson_01';
        const parsed = parseLessonId(resumeId);
        setResumeLesson({
          lesson_id: resumeId,
          stage_id: parsed.stage_id,
          stage_number: parsed.stage_number,
          unit_number: parsed.unit_number,
          lesson_number: parsed.lesson_number,
          status: inProgress ? 'resume' : 'start',
        });
      } catch (_) {
        if (alive) toast.error('Could not load dashboard');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const stageProgress = useMemo(() => {
    const lp = progress?.lesson_progress || {};
    const completedIds = Object.keys(lp).filter(k => lp[k]?.completed);
    const m = {};
    for (const st of stages) {
      const matched = completedIds.filter(id => id.startsWith(st.stage_id));
      const total = st.total_lessons || 0;
      m[st.stage_id] = total > 0 ? Math.round((matched.length / total) * 100) : 0;
    }
    return m;
  }, [progress, stages]);

  const isAdmin = isAdminUser(user);

  const onStageClick = (stage) => {
    if (!isAdmin && (stage.total_lessons || 0) === 0) {
      toast.message('Coming soon!', {
        description: 'This stage is being built. Keep learning to unlock it first.',
      });
      return;
    }
    navigate(`/unified/stage/${stage.stage_id}`);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(at 0% 0%, hsla(152,100%,90%,1) 0, transparent 50%), ' +
          'radial-gradient(at 100% 0%, hsla(190,100%,92%,1) 0, transparent 50%), ' +
          'radial-gradient(at 100% 100%, hsla(37,100%,91%,1) 0, transparent 50%), ' +
          '#F8FAFC',
      }}
    >
      <RayHeader
        user={user}
        userProgress={progress}
        onLogout={onLogout}
        navigate={navigate}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Welcome */}
        <section className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600">
            Your full English roadmap, from Pre-A1 all the way to IELTS mastery.
          </p>
        </section>

        {/* Continue Learning hero — Ray-branded resume CTA */}
        {resumeLesson && (
          <div
            className="rounded-3xl text-white overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(124, 58, 237, 0.95) 0%, rgba(79, 70, 229, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 40px rgba(124, 58, 237, 0.30)',
            }}
          >
            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
              <img
                src={RAY_AVATAR}
                alt="Ray"
                className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-white/30 object-cover flex-shrink-0 self-start md:self-auto"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider opacity-90 mb-1">
                  <Play className="w-3 h-3" />
                  {resumeLesson.status === 'resume' ? 'Continue with Ray' : 'Start your journey'}
                </div>
                <div className="text-lg md:text-xl font-bold leading-tight">
                  Stage {resumeLesson.stage_number} · Unit {resumeLesson.unit_number} · Lesson {resumeLesson.lesson_number}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  {resumeLesson.status === 'resume'
                    ? 'Pick up right where you left off'
                    : "Let's start with a friendly warm-up"}
                </div>
              </div>
              <Button
                onClick={() => navigate(`/unified/lesson/${resumeLesson.lesson_id}`)}
                className="bg-white text-violet-700 hover:bg-violet-50 font-semibold rounded-full shadow-lg flex-shrink-0"
                data-testid="ge-resume-cta"
              >
                {resumeLesson.status === 'resume' ? 'Resume' : 'Start'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Daily Practice — orange CTA */}
        <div
          className="rounded-3xl text-white overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(249, 115, 22, 0.95) 0%, rgba(239, 68, 68, 0.95) 100%)',
            boxShadow: '0 10px 40px rgba(249, 115, 22, 0.30)',
          }}
        >
          <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <Flame className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Daily Practice</h3>
                <p className="text-white/90 text-sm">
                  Keep your streak! 5–10 minutes of review.
                </p>
              </div>
            </div>
            <Button
              className="bg-white text-orange-600 hover:bg-white/90 rounded-full shadow-lg flex-shrink-0"
              onClick={() => navigate('/unified/daily-habit')}
              data-testid="ge-daily-practice"
            >
              Start Daily Practice
            </Button>
          </div>
        </div>

        {/* Stage grid — primary surface */}
        <section>
          <div className="flex items-end justify-between mb-4 mt-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Learning Path
              </h2>
              <p className="text-lg font-bold text-gray-900">
                8 stages · Pre-A1 → C1-C2
              </p>
            </div>
            <div className="text-xs text-gray-500 hidden md:flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                Unlocked
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Coming soon
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-white/60 h-72 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {stages.map((stage) => {
                const isUnlocked = isAdmin || (stage.total_lessons || 0) > 0;
                const isActive = stage.stage_id === resumeLesson?.stage_id;
                return (
                  <StageCard
                    key={stage.stage_id}
                    stage={stage}
                    isUnlocked={isUnlocked}
                    isActive={isActive}
                    progressPct={stageProgress[stage.stage_id] || 0}
                    onClick={onStageClick}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Vocab games — compact row */}
        <section className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Gamepad2 className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-bold text-gray-900">Practice your words</h2>
            <span className="text-xs text-gray-500">· Quick vocabulary games</span>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[
              { emoji: '🎯', title: 'Matching', path: '/games/matching_pairs/family', gradient: 'from-blue-500 to-cyan-500' },
              { emoji: '🐝', title: 'Spelling', path: '/games/spelling_bee/animals', gradient: 'from-amber-500 to-yellow-500' },
              { emoji: '🏎️', title: 'Word Race', path: '/games/word_race/food', gradient: 'from-emerald-500 to-green-500' },
            ].map((g) => (
              <button
                key={g.title}
                type="button"
                onClick={() => navigate(g.path)}
                className="group p-4 rounded-2xl bg-white/70 backdrop-blur border border-white/50 hover:border-violet-300 hover:shadow-md transition-all"
                style={{ backdropFilter: 'blur(12px)' }}
                data-testid={`vocab-game-${g.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.gradient} flex items-center justify-center text-2xl mx-auto mb-2 group-hover:scale-105 transition-transform`}>
                  {g.emoji}
                </div>
                <div className="font-semibold text-sm text-gray-900 text-center">{g.title}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Feedback footer */}
        <section className="pb-10">
          <div
            className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{ background: 'rgba(255, 255, 255, 0.70)', backdropFilter: 'blur(12px)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">✏️</div>
              <div>
                <div className="font-semibold text-sm text-gray-900">Help us improve!</div>
                <div className="text-xs text-gray-600">This platform is in beta. Your feedback matters.</div>
              </div>
            </div>
            <Button
              onClick={() => setFeedbackOpen(true)}
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-full"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" /> Give Feedback
            </Button>
          </div>
        </section>
      </main>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}

// Parse a unified lesson_id "stage_2_unit_01_lesson_03" → structured fields.
function parseLessonId(lessonId) {
  if (!lessonId || typeof lessonId !== 'string') {
    return { stage_id: null, stage_number: null, unit_number: null, lesson_number: null };
  }
  const m = lessonId.match(/^(stage_(\d+)_[a-z_]+?)_unit_(\d+)_lesson_(\d+)$/);
  if (!m) {
    const sm = lessonId.match(/^(stage_(\d+)_[a-z_]+?)_unit/);
    if (sm) {
      return {
        stage_id: sm[1],
        stage_number: parseInt(sm[2], 10),
        unit_number: null,
        lesson_number: null,
      };
    }
    return { stage_id: null, stage_number: null, unit_number: null, lesson_number: null };
  }
  return {
    stage_id: m[1],
    stage_number: parseInt(m[2], 10),
    unit_number: parseInt(m[3], 10),
    lesson_number: parseInt(m[4], 10),
  };
}
