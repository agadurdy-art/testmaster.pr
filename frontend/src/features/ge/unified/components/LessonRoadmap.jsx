import React, { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Map, CheckCircle, Play } from 'lucide-react';

// ═══════ ADVENTURE ROADMAP — scattered treasure-map (GE / kids 8-15) ═══════
// 9 stops mapped 1:1 to real activity_flow types.
const ADVENTURE_STOPS = [
  { key: 'warmup',   num: '1 · Start',     title: 'Warm-up',        emoji: '👋', activities: ['retrieval_warmup', 'warm_up'],   meta: '⏱ 1m · ⭐ 10', badge: 'warmup',  pos: { left: '9.5%', top: '23%' }, tilt: 'l', float: 1, num_bg: 'bg-amber-100 text-amber-700' },
  { key: 'vocab',    num: '2',             title: 'Vocabulary',     emoji: '📖', activities: ['vocabulary'],                    meta: '⏱ 3m · ⭐ 40', badge: 'vocab',   pos: { left: '29%',  top: '12%' }, tilt: 'r', float: 2, num_bg: 'bg-orange-100 text-orange-700' },
  { key: 'vgames',   num: '3',             title: 'Word Games',     emoji: '🎮', activities: ['micro_game_vocab', 'vocab_games'], meta: '⏱ 3m · ⭐ 40', badge: 'vgames',  pos: { left: '53%',  top: '26%' }, tilt: 'l', float: 3, num_bg: 'bg-pink-100 text-pink-700' },
  { key: 'story',    num: '4 · Story',     title: 'Story Time',     emoji: '📜', activities: ['micro_reading'],                 meta: '⏱ 3m · ⭐ 30', badge: 'story',   pos: { left: '79%',  top: '18%' }, tilt: 'r', float: 4, num_bg: 'bg-rose-100 text-rose-700' },
  { key: 'grammar',  num: '5',             title: 'Grammar',        emoji: '🧩', activities: ['grammar_focus'],                 meta: '⏱ 2m · ⭐ 25', badge: 'grammar', pos: { left: '87%',  top: '57%' }, tilt: 'l', float: 5, num_bg: 'bg-violet-100 text-violet-700' },
  { key: 'ggames',   num: '6',             title: 'Gr. Games',      emoji: '🕹️', activities: ['micro_game_grammar', 'grammar_games'], meta: '⏱ 2m · ⭐ 30', badge: 'ggames',  pos: { left: '64%',  top: '62%' }, tilt: 'r', float: 6, num_bg: 'bg-teal-100 text-teal-700' },
  { key: 'listen',   num: '7',             title: 'Listening',      emoji: '🎧', activities: ['listening_task', 'listening'],   meta: '⏱ 2m · ⭐ 30', badge: 'listen',  pos: { left: '36%',  top: '57%' }, tilt: 'l', float: 7, num_bg: 'bg-blue-100 text-blue-700' },
  { key: 'speak',    num: '8 · Your turn', title: 'Speaking',       emoji: '🎤', activities: ['production'],                    meta: '⏱ 2m · ⭐ 30', badge: 'speak',   pos: { left: '17%',  top: '77%' }, tilt: 'r', float: 8, num_bg: 'bg-green-100 text-green-700' },
  { key: 'treasure', num: 'Final · 🏆',    title: 'Treasure',       emoji: '🏆', activities: ['exit_ticket', 'auto_review'],    meta: '⭐ 45 + Badge', badge: 'treasure', pos: { left: '50%',  top: '90%' }, tilt: 'l', float: 9, num_bg: 'bg-amber-100 text-amber-700' },
];

// Stop coords used by the SVG path (must mirror pos% in ADVENTURE_STOPS, in viewBox 1160×640 space)
const ADVENTURE_PATH_D =
  'M 110 147 ' +
  'C 200 100, 260 77, 336 77 ' +
  'S 540 156, 615 166 ' +
  'S 850 75, 916 115 ' +
  'S 1080 270, 1009 365 ' +
  'S 820 425, 742 397 ' +
  'S 530 333, 418 365 ' +
  'S 240 440, 197 493 ' +
  'S 460 600, 580 576';

const ADVENTURE_CSS = `
.adv-roadmap { font-family: 'Fredoka', 'Inter', system-ui, sans-serif; }
.adv-roadmap .display { font-family: 'Baloo 2', 'Fredoka', sans-serif; }
.adv-bg {
  background:
    radial-gradient(ellipse at 18% 8%,  #FFE9B6 0%, transparent 55%),
    radial-gradient(ellipse at 85% 18%, #C7EFFD 0%, transparent 55%),
    radial-gradient(ellipse at 20% 90%, #FFD8E8 0%, transparent 55%),
    radial-gradient(ellipse at 90% 95%, #D7F3E1 0%, transparent 55%),
    linear-gradient(180deg, #FFF5DB 0%, #FFE5D4 100%);
}
.adv-island { position: absolute; border-radius: 50% 50% 0 0 / 100% 100% 0 0; opacity: 0.28; pointer-events: none; }
.adv-cloud {
  position: absolute; width: 110px; height: 32px;
  background: white; border-radius: 40px;
  opacity: 0.8; animation: advDrift 30s linear infinite; pointer-events: none;
}
.adv-cloud::before, .adv-cloud::after { content: ''; position: absolute; background: white; border-radius: 50%; }
.adv-cloud::before { width: 44px; height: 44px; top: -20px; left: 10px; }
.adv-cloud::after  { width: 64px; height: 64px; top: -30px; right: 12px; }
@keyframes advDrift { 0% { transform: translateX(-200px); } 100% { transform: translateX(calc(100vw + 200px)); } }

.adv-mapwrap { position: relative; width: 100%; max-width: 1160px; margin: 0 auto; aspect-ratio: 1160 / 640; }
.adv-stop {
  position: absolute; display: flex; flex-direction: column; align-items: center; cursor: pointer;
  opacity: 0; transform: translate(-50%, -50%) scale(0.7);
  animation: advStopIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  z-index: 10;
}
@keyframes advStopIn { to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }

.adv-badge {
  width: 118px; height: 118px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 62px; position: relative;
  box-shadow: 0 22px 42px -10px rgba(0,0,0,0.30), inset 0 -12px 20px rgba(0,0,0,0.18), inset 0 12px 20px rgba(255,255,255,0.45);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: none; cursor: pointer;
}
.adv-badge::before {
  content: ''; position: absolute; top: 14px; left: 22px;
  width: 34px; height: 17px; background: rgba(255,255,255,0.55);
  border-radius: 50%; filter: blur(2px);
}
.adv-stop:hover .adv-badge { transform: scale(1.14) translateY(-4px); }
.adv-badge-warmup    { background: linear-gradient(135deg, #FFE066 0%, #FFB75E 100%); }
.adv-badge-vocab     { background: linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%); }
.adv-badge-vgames    { background: linear-gradient(135deg, #FF94BC 0%, #E04E89 100%); }
.adv-badge-story     { background: linear-gradient(135deg, #FF8DA1 0%, #C2185B 100%); }
.adv-badge-grammar   { background: linear-gradient(135deg, #A586FF 0%, #6A4BD9 100%); }
.adv-badge-ggames    { background: linear-gradient(135deg, #62E0CB 0%, #20A89F 100%); }
.adv-badge-listen    { background: linear-gradient(135deg, #6FBFFF 0%, #2C7BD9 100%); }
.adv-badge-speak     { background: linear-gradient(135deg, #84E184 0%, #2E9B3E 100%); }
.adv-badge-treasure  { background: linear-gradient(135deg, #FFE066 0%, #FFA500 100%); }

@keyframes advFloat { 0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-6px) rotate(calc(var(--rot, 0deg) + 1deg)); } }
.adv-float-1 { --rot: -3deg; animation: advFloat 4.2s ease-in-out 0.0s infinite; }
.adv-float-2 { --rot:  4deg; animation: advFloat 4.6s ease-in-out 0.3s infinite; }
.adv-float-3 { --rot: -2deg; animation: advFloat 4.0s ease-in-out 0.6s infinite; }
.adv-float-4 { --rot:  5deg; animation: advFloat 4.4s ease-in-out 0.9s infinite; }
.adv-float-5 { --rot: -4deg; animation: advFloat 4.3s ease-in-out 1.2s infinite; }
.adv-float-6 { --rot:  3deg; animation: advFloat 4.5s ease-in-out 1.5s infinite; }
.adv-float-7 { --rot: -5deg; animation: advFloat 4.1s ease-in-out 1.8s infinite; }
.adv-float-8 { --rot:  2deg; animation: advFloat 4.7s ease-in-out 2.1s infinite; }
.adv-float-9 { --rot: -3deg; animation: advFloat 4.2s ease-in-out 2.4s infinite; }

.adv-card {
  margin-top: 10px; background: rgba(255,255,255,0.95); backdrop-filter: blur(4px);
  border-radius: 14px; padding: 6px 14px; min-width: 130px; text-align: center;
  box-shadow: 0 8px 20px -6px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.9);
  transform: rotate(var(--card-rot, 0deg));
}
.adv-card.tilt-l { --card-rot: -2deg; }
.adv-card.tilt-r { --card-rot:  2deg; }
.adv-num {
  display: inline-block; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  padding: 2px 8px; border-radius: 999px;
}
.adv-title { font-family: 'Baloo 2', 'Fredoka', sans-serif; font-size: 16px; font-weight: 700; color: #1e293b; line-height: 1.1; margin-top: 3px; }
.adv-meta { font-size: 11px; color: #94a3b8; margin-top: 2px; }

.adv-locked .adv-badge { filter: grayscale(0.85) brightness(0.92); opacity: 0.7; }
.adv-lock-chip {
  position: absolute; bottom: -4px; right: -4px; width: 34px; height: 34px;
  background: white; color: #64748b; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); border: 3px solid #f8fafc;
}
.adv-check-chip {
  position: absolute; top: -4px; right: -4px; width: 32px; height: 32px;
  background: #10B981; color: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(16,185,129,0.4); border: 3px solid white;
}

.adv-pulse-ring {
  position: absolute; inset: -8px;
  border: 4px solid #FFB75E; border-radius: 50%;
  animation: advPulse 1.8s ease-out infinite; pointer-events: none;
}
@keyframes advPulse { 0% { transform: scale(0.95); opacity: 0.65; } 100% { transform: scale(1.55); opacity: 0; } }

.adv-path-line { stroke-dasharray: 3200; stroke-dashoffset: 3200; animation: advDrawPath 3.6s ease-out 0.3s forwards; }
@keyframes advDrawPath { to { stroke-dashoffset: 0; } }

.adv-deco { position: absolute; pointer-events: none; font-size: 28px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.12)); opacity: 0.9; z-index: 2; }
.adv-deco-small { font-size: 22px; opacity: 0.7; }
@keyframes advSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.adv-compass { animation: advSpin 30s linear infinite; }
@keyframes advSway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
.adv-palm { animation: advSway 4s ease-in-out infinite; transform-origin: bottom center; }

.adv-sparkle { position: absolute; font-size: 18px; animation: advTwinkle 2.4s ease-in-out infinite; pointer-events: none; z-index: 3; }
@keyframes advTwinkle { 0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; } 50% { transform: scale(1) rotate(180deg); opacity: 1; } }

@keyframes advBounce { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
.adv-mascot { animation: advBounce 2.5s ease-in-out infinite; }

@keyframes advStartPulse {
  0%, 100% { transform: scale(1);    box-shadow: 0 12px 30px rgba(237, 143, 3, 0.45); }
  50%      { transform: scale(1.04); box-shadow: 0 16px 40px rgba(237, 143, 3, 0.65); }
}
.adv-start-btn { animation: advStartPulse 2s ease-in-out infinite; }
.adv-start-btn:hover { animation-play-state: paused; transform: scale(1.07); }

.adv-bubble { position: relative; background: white; border-radius: 14px; padding: 7px 11px; box-shadow: 0 6px 18px rgba(0,0,0,0.12); font-size: 12px; font-weight: 500; color: #334155; white-space: nowrap; }
.adv-bubble::after { content: ''; position: absolute; bottom: -6px; left: 18px; width: 12px; height: 12px; background: white; transform: rotate(45deg); border-radius: 0 0 4px 0; }

/* ─── MOBILE: vertical timeline (treasure-map collapses on small screens) ─── */
@media (max-width: 768px) {
  .adv-roadmap .adv-deco,
  .adv-roadmap .adv-sparkle,
  .adv-roadmap .adv-island,
  .adv-roadmap .adv-cloud,
  .adv-roadmap svg.adv-path-svg,
  .adv-roadmap .adv-mapwrap > svg { display: none !important; }

  .adv-mapwrap {
    aspect-ratio: auto !important;
    max-width: 100% !important;
    padding: 8px 0 24px;
  }
  /* Vertical column with a connecting line down the middle of each badge */
  .adv-mapwrap::before {
    content: '';
    position: absolute;
    left: 51px; top: 30px; bottom: 30px;
    width: 3px;
    background: repeating-linear-gradient(to bottom, #FFB75E 0 8px, transparent 8px 14px);
    border-radius: 2px;
    z-index: 0;
  }
  .adv-stop {
    position: relative !important;
    left: 0 !important; top: 0 !important;
    transform: none !important;
    width: 100%;
    margin: 10px 0;
    padding: 0 16px;
    flex-direction: row !important;
    align-items: center !important;
    gap: 14px;
    animation: lessonFadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .adv-stop .adv-badge {
    width: 78px; height: 78px;
    font-size: 38px;
    flex-shrink: 0;
    z-index: 2;
  }
  .adv-stop .adv-card {
    flex: 1;
    transform: none !important;
    margin-top: 0 !important;
    padding: 10px 14px;
    background: white;
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    text-align: left;
  }
  .adv-stop .adv-num { font-size: 11px; padding: 2px 8px; }
  .adv-stop .adv-title { font-size: 16px; margin-top: 2px; }
  .adv-stop .adv-meta { font-size: 12px; }
  .adv-stop.adv-locked { opacity: 0.55; }
  .adv-stop.adv-locked .adv-card { filter: grayscale(0.4); }

  /* Mascot row + Start button: stack mascot above sticky CTA */
  .adv-roadmap .adv-mascot { margin-bottom: 12px; }
  .adv-roadmap .adv-start-btn {
    position: sticky;
    bottom: 16px;
    width: calc(100% - 32px);
    margin: 8px auto 0;
    justify-content: center;
  }
}
`;

// ═══════ LESSON ROADMAP (Adventure / Treasure-Map) ═══════
function LessonRoadmap({ lesson, completedActivities, onStartActivity, onStartLesson, theme }) {
  const isStopCompleted = (stop) => stop.activities.some(a => completedActivities.includes(a));
  // First not-yet-completed stop gets the active pulse ring
  const firstActiveIdx = ADVENTURE_STOPS.findIndex(s => !isStopCompleted(s));

  const handleConfetti = useCallback(() => {
    try {
      confetti({ particleCount: 80, spread: 75, origin: { y: 0.85 }, colors: ['#FFB75E','#FF6B9D','#8B73FF','#5BAEFA','#4ECDC4','#FFD700','#2E9B3E'] });
    } catch {}
  }, []);

  return (
    <div className="adv-roadmap adv-bg relative overflow-hidden" data-testid="lesson-roadmap" style={{ minHeight: '92vh' }}>
      <style>{ADVENTURE_CSS}</style>

      {/* Distant islands */}
      <div className="adv-island" style={{ width: 280, height: 70, bottom: 0, left: -30, background: '#f5b27a' }} />
      <div className="adv-island" style={{ width: 220, height: 60, bottom: 0, right: -20, background: '#f7c8a3' }} />

      {/* Drifting clouds */}
      <div className="adv-cloud" style={{ top: 50, animationDelay: '0s' }} />
      <div className="adv-cloud" style={{ top: 120, animationDelay: '-12s', transform: 'scale(0.65)' }} />
      <div className="adv-cloud" style={{ top: 80, animationDelay: '-22s', transform: 'scale(0.85)' }} />

      <div className="relative px-4 pt-4 pb-6">

        {/* Hero (compact) */}
        <div className="text-center mb-2 relative z-20">
          <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm mb-1.5">
            <Map className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-xs font-semibold text-amber-700">Your Adventure Map</span>
          </div>
          <h2 className="display text-3xl md:text-4xl font-bold text-slate-800 leading-tight">{lesson?.title}</h2>
          <p className="text-slate-600 text-sm mt-0.5">Lesson {lesson?.number} — follow the path, friend 🚀</p>
        </div>

        {/* Map */}
        <div className="adv-mapwrap">

          {/* Decorations */}
          <div className="adv-deco adv-compass" style={{ top: '6%', right: '4%', fontSize: 36 }}>🧭</div>
          <div className="adv-deco adv-palm" style={{ top: '20%', left: '50%' }}>🌴</div>
          <div className="adv-deco adv-deco-small" style={{ top: '12%', left: '25%' }}>⛰️</div>
          <div className="adv-deco adv-deco-small" style={{ top: '75%', left: '38%' }}>🌳</div>
          <div className="adv-deco adv-deco-small" style={{ top: '50%', left: '8%' }}>🪨</div>
          <div className="adv-deco adv-deco-small" style={{ top: '60%', right: '14%' }}>🌊</div>
          <div className="adv-deco adv-deco-small" style={{ top: '85%', right: '35%' }}>🐚</div>

          {/* Sparkles */}
          <div className="adv-sparkle" style={{ top: '30%', left: '4%', color: '#FFD700' }}>✨</div>
          <div className="adv-sparkle" style={{ top: '55%', right: '4%', color: '#F472B6', animationDelay: '0.5s' }}>⭐</div>
          <div className="adv-sparkle" style={{ top: '80%', left: '50%', color: '#60A5FA', animationDelay: '1s' }}>✨</div>

          {/* Path */}
          <svg viewBox="0 0 1160 640" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="advPathGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"  stopColor="#FFE066" />
                <stop offset="15%" stopColor="#FFB75E" />
                <stop offset="30%" stopColor="#FF6B9D" />
                <stop offset="50%" stopColor="#C2185B" />
                <stop offset="65%" stopColor="#8B73FF" />
                <stop offset="80%" stopColor="#2C7BD9" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>
            <path className="adv-path-line" d={ADVENTURE_PATH_D} stroke="url(#advPathGrad)" strokeWidth="6" fill="none" strokeDasharray="13 11" strokeLinecap="round" opacity="0.92" />
          </svg>

          {/* Stops */}
          {ADVENTURE_STOPS.map((stop, i) => {
            const completed = isStopCompleted(stop);
            const isActive = i === firstActiveIdx;
            const locked = !completed && !isActive;
            const firstActivity = stop.activities[0];
            return (
              <div
                key={stop.key}
                className={`adv-stop ${locked ? 'adv-locked' : ''}`}
                style={{ left: stop.pos.left, top: stop.pos.top, animationDelay: `${0.25 + i * 0.1}s` }}
                onClick={() => onStartActivity && onStartActivity(firstActivity)}
                data-testid={`roadmap-step-${stop.key}`}
              >
                <div className={`adv-badge adv-badge-${stop.badge} adv-float-${stop.float} relative`}>
                  {stop.emoji}
                  {completed && <div className="adv-check-chip"><CheckCircle className="w-4 h-4" /></div>}
                  {isActive && <div className="adv-pulse-ring" />}
                  {locked && <div className="adv-lock-chip">🔒</div>}
                </div>
                <div className={`adv-card tilt-${stop.tilt}`}>
                  <span className={`adv-num ${stop.num_bg}`}>{stop.num}</span>
                  <div className="adv-title">{stop.title}</div>
                  <div className="adv-meta">{stop.meta}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer row: mascot + Start + reward */}
        <div className="relative max-w-5xl mx-auto mt-3 flex items-end justify-between px-4 z-20">
          <div className="adv-mascot flex items-end gap-2">
            <img
              src="/static/images/ray/ray.png"
              alt="Ray"
              className="w-14 h-14 rounded-full shadow-lg border-[3px] border-white object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="adv-bubble mb-2">Let's go, friend! 🌟</div>
          </div>

          <button
            className="adv-start-btn bg-gradient-to-br from-amber-400 to-orange-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-2xl flex items-center gap-2 hover:from-amber-500 hover:to-orange-600 transition-colors"
            onClick={() => { handleConfetti(); onStartLesson && onStartLesson(); }}
            data-testid="roadmap-start-btn"
          >
            <Play className="w-5 h-5" /> Start Adventure!
          </button>

          <div className="hidden md:flex flex-col items-end text-right">
            <div className="text-xs text-slate-500">Earn up to</div>
            <div className="text-base font-bold text-amber-600">280 ⭐ + 🏆</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LessonRoadmap;
