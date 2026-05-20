import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Zap, Trophy, LogOut, ArrowRight, Play,
  MessageSquare, Gamepad2, Lock,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useI18n } from '../lib/i18n';
import { isAdminUser } from '../lib/planAccess';
import FeedbackModal from '../components/FeedbackModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SUPPORT_EMAIL = 'support@testmaster.pro';
const RAY_AVATAR = '/static/images/ray/ray.png';
const RAY_LOGO = '/brand/ray-english-logo.png';

// ───── Per-stage cover styling for the magical bookshelf ─────
const STAGE_COVER = {
  stage_1_foundations:    { emblem: '🌱', gradient: 'linear-gradient(135deg, #FFB997 0%, #F67E7D 100%)', short: 'Foundation',       cefr: 'Pre-A1' },
  stage_2_starters:       { emblem: '🐣', gradient: 'linear-gradient(135deg, #FFD56B 0%, #F39C2E 100%)', short: 'Starters',         cefr: 'A0'     },
  stage_3_movers:         { emblem: '🦋', gradient: 'linear-gradient(135deg, #8FE3CF 0%, #2EBCA0 100%)', short: 'Movers',           cefr: 'A1'     },
  stage_4_flyers:         { emblem: '🦅', gradient: 'linear-gradient(135deg, #A8B4FF 0%, #6478FF 100%)', short: 'Flyers',           cefr: 'A2'     },
  stage_5_b1:             { emblem: '🎓', gradient: 'linear-gradient(135deg, #FFA5C5 0%, #E04E89 100%)', short: 'Preliminary',      cefr: 'B1'     },
  stage_6_b2:             { emblem: '🧠', gradient: 'linear-gradient(135deg, #C9A6FF 0%, #8B5CF6 100%)', short: 'First',            cefr: 'B2'     },
  stage_7_ielts_foundation:{ emblem: '🎯', gradient: 'linear-gradient(135deg, #FFC371 0%, #FF8C42 100%)', short: 'IELTS Foundation', cefr: 'IELTS'  },
  stage_8_ielts_mastery:  { emblem: '👑', gradient: 'linear-gradient(135deg, #9DDBFF 0%, #4A9EFF 100%)', short: 'IELTS Mastery',    cefr: 'IELTS+' },
};
const STAGE_TILTS = ['-2deg', '2deg', '-1deg', '3deg', '-3deg', '1deg', '-2deg', '2deg'];

// ───── CSS injected once at component mount ─────
const LIBRARY_CSS = `
.glib { font-family: 'Fredoka', 'Inter', system-ui, sans-serif; color: #2d1a3e; }
.glib .display { font-family: 'Baloo 2', 'Fredoka', sans-serif; }
.glib-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 700px 500px at 80% 0%, rgba(255, 220, 140, 0.55) 0%, transparent 65%),
    radial-gradient(ellipse 600px 400px at 10% 50%, rgba(190, 160, 255, 0.30) 0%, transparent 60%),
    radial-gradient(ellipse 500px 350px at 90% 90%, rgba(255, 180, 200, 0.30) 0%, transparent 60%),
    radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255, 240, 200, 0.40) 0%, transparent 70%),
    linear-gradient(180deg, #FFF7E1 0%, #FBE8D3 40%, #F4DAE8 100%);
}
.glib-paper {
  position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.3;
  background-image:
    repeating-radial-gradient(circle at 30% 20%, rgba(180,130,80,0.04) 0px, rgba(180,130,80,0.04) 1px, transparent 1px, transparent 4px),
    repeating-radial-gradient(circle at 70% 80%, rgba(150,100,180,0.04) 0px, rgba(150,100,180,0.04) 1px, transparent 1px, transparent 5px);
  mix-blend-mode: multiply;
}

.glib-ray {
  position: fixed; top: -100px; left: 72%;
  width: 4px; height: 600px;
  background: linear-gradient(180deg, rgba(255,220,120,0.5) 0%, transparent 100%);
  transform-origin: top center;
  pointer-events: none; z-index: 2;
  animation: glibRayShimmer 6s ease-in-out infinite;
}
.glib-ray.r2 { left: 80%; transform: rotate(8deg); animation-delay: -2s; opacity: 0.7; }
.glib-ray.r3 { left: 88%; transform: rotate(15deg); animation-delay: -4s; opacity: 0.5; }
@keyframes glibRayShimmer { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.9; } }

.glib-dust {
  position: fixed; width: 6px; height: 6px; border-radius: 50%;
  pointer-events: none; z-index: 3;
  animation: glibDust linear infinite;
}
@keyframes glibDust {
  0% { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 0.8; }
  100% { transform: translateY(-100vh) translateX(40px) scale(1.2); opacity: 0; }
}

.glib-topbar {
  position: sticky; top: 0; z-index: 40;
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.50);
}
.glib-pill {
  background: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.6);
  display: inline-flex; align-items: center; gap: 6px;
  color: #2d1a3e; font-weight: 700;
  transition: all 0.2s;
}
.glib-pill:hover { background: rgba(255, 255, 255, 0.95); }

.glib-hero {
  border-radius: 28px;
  padding: 22px 24px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 36px -8px rgba(80, 50, 100, 0.35);
}
.glib-hero-resume { background: linear-gradient(135deg, rgba(168, 85, 247, 0.95) 0%, rgba(99, 102, 241, 0.95) 100%); }
.glib-hero-daily  { background: linear-gradient(135deg, rgba(249, 115, 22, 0.95) 0%, rgba(239, 68, 68, 0.95) 100%); }
.glib-hero::after {
  content: '✨'; position: absolute; top: 12px; right: 16px;
  font-size: 24px; opacity: 0.3;
  animation: glibTwinkle 3s ease-in-out infinite;
}

.glib-cta {
  background: white;
  color: #6d28d9;
  padding: 8px 18px;
  border-radius: 999px;
  font-weight: 700;
  box-shadow: 0 6px 16px rgba(0,0,0,0.18);
  display: inline-flex; align-items: center; gap: 8px;
  transition: all 0.2s;
  font-size: 14px;
}
.glib-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0,0,0,0.22); }
.glib-cta-orange { color: #c2410c; }

.glib-shelf-zone { position: relative; padding-top: 14px; padding-bottom: 30px; }
.glib-row {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  padding: 0 16px;
  z-index: 10;
}
@media (min-width: 768px) {
  .glib-row { grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 0 20px; }
}
.glib-plank {
  margin: 0 16px;
  height: 18px;
  background: linear-gradient(180deg, #d8a87a 0%, #b07a4a 50%, #8a5a30 100%);
  border-radius: 5px;
  box-shadow:
    0 10px 24px -4px rgba(120, 70, 30, 0.35),
    inset 0 -4px 8px rgba(60, 30, 10, 0.4),
    inset 0 2px 3px rgba(255, 220, 180, 0.5);
  position: relative;
  z-index: 6;
}
@media (min-width: 768px) { .glib-plank { margin: 0 20px; } }
.glib-plank::after {
  content: '';
  position: absolute; inset: 3px 14px;
  border-top: 1px solid rgba(255, 220, 150, 0.6);
  border-bottom: 1px solid rgba(100, 50, 20, 0.4);
}

.glib-book {
  border-radius: 8px 22px 22px 8px;
  cursor: pointer;
  transform-origin: bottom center;
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s, box-shadow 0.3s;
  box-shadow:
    -4px 8px 22px -4px rgba(60, 30, 80, 0.35),
    inset 5px 0 10px rgba(255, 255, 255, 0.18),
    inset -5px 0 14px rgba(0, 0, 0, 0.22);
  display: flex; flex-direction: column; align-items: center;
  padding: 16px 12px 14px;
  color: white;
  border: 2px solid rgba(255,255,255,0.25);
  position: relative;
  height: 240px;
  text-align: center;
  overflow: visible;
  width: 100%;
  background: #888;
}
.glib-book::before {
  content: ''; position: absolute;
  left: 8px; top: 8%; bottom: 8%;
  width: 4px;
  background: linear-gradient(180deg, transparent, rgba(255,220,150,0.6), transparent);
  border-radius: 2px;
}
.glib-book::after {
  content: ''; position: absolute;
  top: 4px; left: 14px; right: 14px;
  height: 4px;
  background: rgba(255, 250, 220, 0.5);
  border-radius: 1px;
}
.glib-book:not(.locked):hover {
  transform: translateY(-14px) rotate(0deg) scale(1.04) !important;
  filter: brightness(1.08) drop-shadow(0 0 18px rgba(255,200,120,0.65));
  z-index: 50;
}

.glib-cefr {
  font-family: 'Baloo 2', sans-serif;
  font-size: 12px; font-weight: 800;
  background: rgba(255,255,255,0.95);
  color: #1f2937;
  padding: 3px 10px; border-radius: 999px;
  letter-spacing: 0.06em;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.glib-stage-num { font-size: 10px; opacity: 0.85; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 8px; }
.glib-emblem { font-size: 54px; line-height: 1; margin: 8px 0 4px; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.4)); }
.glib-stage-name { font-family: 'Baloo 2', sans-serif; font-size: 19px; font-weight: 800; line-height: 1.05; text-shadow: 0 2px 4px rgba(0,0,0,0.4); }
.glib-stage-meta { font-size: 11px; opacity: 0.85; margin-top: 4px; font-weight: 500; }
.glib-prog { width: 100%; margin-top: 8px; }
.glib-prog-bar { height: 6px; background: rgba(0,0,0,0.25); border-radius: 999px; overflow: hidden; }
.glib-prog-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #FFE066, #FFA500); box-shadow: 0 0 8px rgba(255,200,80,0.7); }
.glib-prog-row { display: flex; justify-content: space-between; align-items: center; font-size: 10px; opacity: 0.9; margin-top: 4px; font-weight: 600; }
.glib-action { margin-top: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; opacity: 0.95; }

.glib-book.locked { filter: grayscale(0.5) brightness(0.85); opacity: 0.85; cursor: not-allowed; }
.glib-lock-overlay {
  position: absolute; inset: 0;
  background: rgba(15, 15, 25, 0.55);
  border-radius: inherit;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; backdrop-filter: blur(2px);
}
.glib-lock-chip {
  width: 50px; height: 50px;
  background: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  box-shadow: 0 6px 14px rgba(0,0,0,0.25);
  border: 3px solid rgba(255,255,255,0.85);
  color: #64748b;
}
.glib-lock-text { font-size: 11px; font-weight: 700; color: white; letter-spacing: 0.06em; text-transform: uppercase; }

.glib-book.current {
  box-shadow:
    -4px 8px 28px -4px rgba(60, 30, 80, 0.35),
    0 0 0 4px rgba(255, 215, 80, 0.55),
    0 0 28px 10px rgba(255, 215, 80, 0.45);
  animation: glibCurrentGlow 2s ease-in-out infinite;
}
@keyframes glibCurrentGlow {
  0%, 100% { box-shadow: -4px 8px 28px -4px rgba(60, 30, 80, 0.35), 0 0 0 4px rgba(255, 215, 80, 0.55), 0 0 28px 10px rgba(255, 215, 80, 0.45); }
  50%      { box-shadow: -4px 8px 32px -4px rgba(60, 30, 80, 0.45), 0 0 0 6px rgba(255, 215, 80, 0.7),  0 0 40px 16px rgba(255, 215, 80, 0.6); }
}
.glib-now-chip {
  position: absolute; top: -14px; right: -10px;
  background: linear-gradient(135deg, #FFE066, #FFA500);
  color: #1f2937;
  font-family: 'Baloo 2', sans-serif; font-weight: 800;
  font-size: 11px; padding: 4px 11px; border-radius: 999px;
  box-shadow: 0 4px 12px rgba(255,165,0,0.5);
  transform: rotate(8deg); z-index: 20;
}

.glib-deco { position: absolute; filter: drop-shadow(0 6px 10px rgba(100, 60, 30, 0.18)); pointer-events: none; z-index: 4; }
@keyframes glibFloat { 0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-10px) rotate(calc(var(--rot, 0deg) + 3deg)); } }
@keyframes glibSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes glibFlicker { 0% { transform: scale(1, 1) rotate(-1deg); filter: brightness(1); } 50% { transform: scale(1.04, 0.96) rotate(2deg); filter: brightness(1.15); } 100% { transform: scale(0.96, 1.04) rotate(-2deg); filter: brightness(0.95); } }
.glib-float { animation: glibFloat 5s ease-in-out infinite; }
.glib-spin { animation: glibSpin 20s linear infinite; }
.glib-flicker { animation: glibFlicker 0.8s ease-in-out infinite alternate; transform-origin: bottom center; }

.glib-sparkle { position: absolute; font-size: 22px; animation: glibTwinkle 2.6s ease-in-out infinite; pointer-events: none; z-index: 5; }
@keyframes glibTwinkle { 0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; } 50% { transform: scale(1) rotate(180deg); opacity: 1; } }

.glib-game {
  background: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 20px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.glib-game:hover { background: rgba(255, 255, 255, 0.95); transform: translateY(-3px); box-shadow: 0 12px 28px -6px rgba(60, 30, 80, 0.25); }
`;

// ───── Book card ─────
function BookCard({ stage, isUnlocked, isCurrent, progressPct, tilt, onClick }) {
  const cover = STAGE_COVER[stage.stage_id] || { emblem: '📚', gradient: 'linear-gradient(135deg, #ddd, #bbb)', short: stage.name, cefr: stage.cefr_level };
  const actionLabel = isUnlocked ? (progressPct > 0 ? 'CONTINUE →' : 'START →') : '';
  const units = stage.total_units || 0;
  const lessons = stage.total_lessons || (units * (stage.lessons_per_unit || 4)) || 0;
  return (
    <button
      type="button"
      disabled={!isUnlocked}
      onClick={() => isUnlocked && onClick(stage)}
      className={`glib-book ${!isUnlocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`}
      style={{ background: cover.gradient, transform: `rotate(${tilt})` }}
      data-testid={`stage-card-${stage.number}`}
    >
      {isCurrent && <span className="glib-now-chip">📖 Now</span>}
      <span className="glib-cefr">{cover.cefr || stage.cefr_level}</span>
      <span className="glib-stage-num">Stage {stage.number}</span>
      <div className="glib-emblem">{cover.emblem}</div>
      <div className="glib-stage-name">{cover.short || stage.name}</div>
      <div className="glib-stage-meta">{units} units · {lessons} lessons</div>
      <div className="glib-prog">
        <div className="glib-prog-bar">
          <div className="glib-prog-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="glib-prog-row">
          <span>Progress</span>
          <span>{progressPct}%</span>
        </div>
      </div>
      <div className="glib-action">{actionLabel}</div>
      {!isUnlocked && (
        <div className="glib-lock-overlay">
          <div className="glib-lock-chip">🔒</div>
          <div className="glib-lock-text">Coming Soon</div>
        </div>
      )}
    </button>
  );
}

// ───── Top bar ─────
function LibraryHeader({ user, userProgress, onLogout, navigate }) {
  return (
    <header className="glib-topbar px-4 md:px-6 py-3 flex items-center justify-between gap-3">
      <a href="/ge/dashboard" className="flex items-center gap-2 flex-shrink-0">
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

      <div className="flex items-center gap-2 md:gap-3">
        <div className="glib-pill px-3 py-1.5" title="Daily streak">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm">{userProgress?.daily_streak || 0}</span>
        </div>
        <div className="glib-pill px-3 py-1.5" title="XP">
          <Zap className="w-4 h-4 text-violet-600" />
          <span className="text-sm">{(userProgress?.total_points || 0).toLocaleString()}</span>
        </div>
        <div className="glib-pill px-3 py-1.5 hidden md:inline-flex" title="Global rank">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-sm">#{userProgress?.global_rank || '—'}</span>
        </div>

        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-300/50">
          <button
            onClick={() => navigate('/pricing/ge')}
            className="text-sm text-slate-600 hover:text-violet-600 font-medium"
            data-testid="ge-nav-pricing"
          >
            Pricing
          </button>
          <button
            onClick={() => (window.location.href = `mailto:${SUPPORT_EMAIL}`)}
            className="text-sm text-slate-600 hover:text-violet-600 font-medium"
          >
            Contact
          </button>
          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-sm font-semibold text-violet-700">
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
    </header>
  );
}

// ───── Main page ─────
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

        const lp = progRes?.lesson_progress || {};
        const inProgress = Object.values(lp)
          .filter(x => x && x.lesson_id && !x.completed)
          .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))[0];
        const resumeId = inProgress?.lesson_id || 'stage_1_foundations_unit_01_lesson_01';
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

  const firstName = user?.name?.split(' ')[0] || 'friend';
  const topRow = stages.slice(0, 4);
  const bottomRow = stages.slice(4, 8);

  return (
    <div className="glib min-h-screen">
      <style>{LIBRARY_CSS}</style>

      {/* Atmosphere layers */}
      <div className="glib-bg" />
      <div className="glib-paper" />
      <div className="glib-ray" />
      <div className="glib-ray r2" />
      <div className="glib-ray r3" />
      {/* Drifting dust particles */}
      <div className="glib-dust" style={{ left: '12%', bottom: 0, background: 'radial-gradient(circle, #FFE066 30%, transparent 70%)', animationDuration: '16s' }} />
      <div className="glib-dust" style={{ left: '32%', bottom: 0, background: 'radial-gradient(circle, #C9A6FF 30%, transparent 70%)', animationDuration: '19s', animationDelay: '-5s' }} />
      <div className="glib-dust" style={{ left: '55%', bottom: 0, background: 'radial-gradient(circle, #FFB997 30%, transparent 70%)', animationDuration: '17s', animationDelay: '-10s' }} />
      <div className="glib-dust" style={{ left: '78%', bottom: 0, background: 'radial-gradient(circle, #8FE3CF 30%, transparent 70%)', animationDuration: '20s', animationDelay: '-3s' }} />

      <LibraryHeader
        user={user}
        userProgress={progress}
        onLogout={onLogout}
        navigate={navigate}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5">

        {/* Welcome */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-violet-700 bg-white/70 backdrop-blur px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              📚 Your Magical Library
            </span>
          </div>
          <h1 className="display text-3xl md:text-4xl font-bold text-slate-800 mb-1">
            Welcome back, <span className="text-amber-600">{firstName}!</span> 👋
          </h1>
          <p className="text-slate-600">
            Your full English roadmap, from Pre-A1 to IELTS mastery.
          </p>
        </section>

        {/* Resume + Daily Practice side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {resumeLesson && (
            <div className="glib-hero glib-hero-resume">
              <div className="flex items-start gap-4">
                <img
                  src={RAY_AVATAR}
                  alt="Ray"
                  className="w-14 h-14 rounded-full border-2 border-white/40 object-cover flex-shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider opacity-90 mb-1">
                    <Play className="w-3 h-3" />
                    {resumeLesson.status === 'resume' ? 'Continue with Ray' : 'Start your journey'}
                  </div>
                  <div className="display text-xl font-bold leading-tight">
                    Stage {resumeLesson.stage_number} · Unit {resumeLesson.unit_number} · Lesson {resumeLesson.lesson_number}
                  </div>
                  <div className="text-sm opacity-90 mt-1 line-clamp-2">
                    {resumeLesson.status === 'resume' ? 'Pick up right where you left off' : "Let's start with a friendly warm-up"}
                  </div>
                  <button
                    onClick={() => navigate(`/unified/lesson/${resumeLesson.lesson_id}`)}
                    className="glib-cta mt-3"
                    data-testid="ge-resume-cta"
                  >
                    {resumeLesson.status === 'resume' ? 'Resume' : 'Start'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="glib-hero glib-hero-daily">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Flame className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider opacity-90 mb-1">
                  <span>✦</span> Daily Habit
                </div>
                <div className="display text-xl font-bold leading-tight">Daily Practice</div>
                <div className="text-sm opacity-90 mt-1 line-clamp-2">
                  Keep your {progress?.daily_streak || 0}-day streak! 5–10 min of review.
                </div>
                <button
                  onClick={() => navigate('/unified/daily-habit')}
                  className="glib-cta glib-cta-orange mt-3"
                  data-testid="ge-daily-practice"
                >
                  Start Daily Practice
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Path bookshelf */}
        <section className="pt-2">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Learning Path</h2>
              <p className="display text-lg font-bold text-slate-800">8 stages · Pre-A1 → C1 / IELTS</p>
            </div>
            <div className="text-xs text-slate-500 hidden md:flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>Unlocked
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Coming soon
              </span>
            </div>
          </div>

          <div className="glib-shelf-zone">
            {/* Library decorations on the sides of the shelf zone */}
            <span className="glib-deco" style={{ top: '0%', right: -14, fontSize: 52 }}>☀️</span>
            <span className="glib-deco glib-float" style={{ top: '32%', left: -10, fontSize: 44, '--rot': '-5deg' }}>🦉</span>
            <span className="glib-deco glib-flicker" style={{ top: '38%', right: -8, fontSize: 38 }}>🕯️</span>
            <span className="glib-deco glib-spin" style={{ bottom: '30%', left: -6, fontSize: 40 }}>🔮</span>
            <span className="glib-sparkle" style={{ top: '18%', left: '38%', color: '#FFD700' }}>✨</span>
            <span className="glib-sparkle" style={{ top: '60%', right: '32%', color: '#C9A6FF', animationDelay: '0.6s' }}>⭐</span>

            {loading ? (
              <div className="glib-row">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-3xl bg-white/60 animate-pulse" style={{ height: 240 }} />
                ))}
              </div>
            ) : (
              <>
                <div className="glib-row">
                  {topRow.map((stage, i) => {
                    // Foundation (Stage 1) doc lives in DB without total_lessons populated; fall
// back to total_units so the kid sees the kart unlocked instead of greyed-out.
const isUnlocked = isAdmin || (stage.total_lessons || stage.total_units || 0) > 0;
                    const isCurrent = stage.stage_id === resumeLesson?.stage_id;
                    return (
                      <BookCard
                        key={stage.stage_id}
                        stage={stage}
                        isUnlocked={isUnlocked}
                        isCurrent={isCurrent}
                        progressPct={stageProgress[stage.stage_id] || 0}
                        tilt={STAGE_TILTS[i] || '0deg'}
                        onClick={onStageClick}
                      />
                    );
                  })}
                </div>
                <div className="glib-plank" />

                {bottomRow.length > 0 && (
                  <>
                    <div className="glib-row mt-6">
                      {bottomRow.map((stage, i) => {
                        // Foundation (Stage 1) doc lives in DB without total_lessons populated; fall
// back to total_units so the kid sees the kart unlocked instead of greyed-out.
const isUnlocked = isAdmin || (stage.total_lessons || stage.total_units || 0) > 0;
                        const isCurrent = stage.stage_id === resumeLesson?.stage_id;
                        return (
                          <BookCard
                            key={stage.stage_id}
                            stage={stage}
                            isUnlocked={isUnlocked}
                            isCurrent={isCurrent}
                            progressPct={stageProgress[stage.stage_id] || 0}
                            tilt={STAGE_TILTS[i + 4] || '0deg'}
                            onClick={onStageClick}
                          />
                        );
                      })}
                    </div>
                    <div className="glib-plank" />
                  </>
                )}
              </>
            )}
          </div>
        </section>

        {/* Quick vocab games */}
        <section className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Gamepad2 className="w-5 h-5 text-violet-600" />
            <h2 className="display text-base font-bold text-slate-800">Practice your words</h2>
            <span className="text-xs text-slate-500">· Quick vocabulary games</span>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[
              { emoji: '🎯', title: 'Matching',  path: '/game-bank?game=matching_pairs&topic=family',  gradient: 'from-blue-500 to-cyan-500' },
              { emoji: '🐝', title: 'Spelling',  path: '/game-bank?game=spelling_bee&topic=animals',   gradient: 'from-amber-500 to-yellow-500' },
              { emoji: '🏎️', title: 'Word Race', path: '/game-bank?game=word_race&topic=food',         gradient: 'from-emerald-500 to-green-500' },
            ].map((g) => (
              <button
                key={g.title}
                type="button"
                onClick={() => navigate(g.path)}
                className="glib-game text-center group"
                data-testid={`vocab-game-${g.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.gradient} flex items-center justify-center text-2xl mx-auto mb-2 group-hover:scale-105 transition-transform shadow`}>
                  {g.emoji}
                </div>
                <div className="font-semibold text-sm text-slate-800">{g.title}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Feedback footer */}
        <section className="pt-2 pb-10">
          <div
            className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{ background: 'rgba(255, 255, 255, 0.70)', backdropFilter: 'blur(12px)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">✏️</div>
              <div>
                <div className="font-semibold text-sm text-slate-800">Help us improve!</div>
                <div className="text-xs text-slate-600">This platform is in beta. Your feedback matters.</div>
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

// Parse a unified lesson_id "stage_2_starters_unit_01_lesson_03" → structured fields.
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
