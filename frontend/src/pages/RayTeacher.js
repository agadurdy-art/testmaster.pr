import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, Sparkles, Mic, Repeat, ChevronRight, Map, Volume2 } from 'lucide-react';
import { RAY_AVATAR_URL } from '../lib/brand';
import { useLizVoice } from '../hooks/useLizVoice';
import { homePath } from '../lib/learningMode';

/**
 * Ray Hub — kid-friendly coach landing for GE (General English) learners.
 *
 * Design call (Aga, 2026-05-19): Ray needs his own home, not a redirect to
 * the marketing landing page. Mirrors LizTeacher in surface (hero greeting
 * + quick-action grid) but tonally playful for the 8-15 audience and free
 * for all GE tiers (Liz's chat is paid; Ray's hub is open).
 *
 * Architecture:
 *   /ray            → this hub (free, all tiers)
 *   /ray/story      → Ray-narrated stories (future, GE Premium)
 *   /ray/chat       → conversational Ray (future, GE Premium)
 *
 * The hub itself doesn't gate anything — it routes kids to existing
 * surfaces they already have access to (/game-bank, /daily-practice,
 * /unified). The "Talk to Ray" card opens a coming-soon toast for now.
 */

const HUB_CSS = `
.ray-hub {
  min-height: calc(100dvh - 80px);
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(ellipse at 12% 8%,  #FFE9B6 0%, transparent 55%),
    radial-gradient(ellipse at 88% 12%, #FFDBC7 0%, transparent 55%),
    radial-gradient(ellipse at 50% 95%, #FFCFE8 0%, transparent 55%),
    linear-gradient(180deg, #FFF7E8 0%, #FFEEDB 100%);
  padding: 24px 16px 96px;
}
.ray-hub .display { font-family: 'Baloo 2', 'Fredoka', sans-serif; }

.ray-hero {
  max-width: 720px;
  margin: 0 auto 24px;
  text-align: center;
  position: relative;
}
.ray-avatar-wrap {
  position: relative;
  width: 132px;
  height: 132px;
  margin: 0 auto 14px;
  animation: rayFloat 4s ease-in-out infinite;
}
.ray-avatar-wrap img {
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 4px solid #ffffff;
  box-shadow: 0 12px 30px rgba(234, 88, 12, 0.25);
  object-fit: cover;
}
.ray-avatar-ring {
  position: absolute; inset: -10px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #FFB75E, #FF6B9D, #8B73FF, #FFB75E);
  z-index: -1;
  filter: blur(8px);
  opacity: 0.45;
  animation: raySpin 9s linear infinite;
}
@keyframes rayFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes raySpin { to { transform: rotate(360deg); } }

.ray-name-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(8px);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #c2410c;
  margin-bottom: 8px;
}

.ray-heading {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.2;
}
.ray-heading .ital { font-style: italic; color: #ea580c; }

.ray-bubble {
  background: white;
  border-radius: 18px;
  padding: 12px 18px;
  margin: 14px auto 0;
  max-width: 480px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  font-size: 14px;
  color: #475569;
  position: relative;
}
.ray-bubble button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  color: #ea580c;
  font-weight: 600;
  font-size: 13px;
}

.ray-grid {
  max-width: 720px;
  margin: 0 auto 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.ray-card {
  background: white;
  border-radius: 20px;
  padding: 18px 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.04);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;
}
.ray-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.10); }
.ray-card:active { transform: translateY(-1px); }
.ray-card-emoji { font-size: 32px; line-height: 1; }
.ray-card-title { font-size: 16px; font-weight: 700; color: #1e293b; }
.ray-card-sub { font-size: 12px; color: #64748b; line-height: 1.4; }
.ray-card-soon {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ray-card.tone-play   { background: linear-gradient(135deg, #FFF7E8, #FFE0BC); }
.ray-card.tone-story  { background: linear-gradient(135deg, #FFF1F8, #FFD0E4); }
.ray-card.tone-daily  { background: linear-gradient(135deg, #FFE9D6, #FFC79E); }
.ray-card.tone-talk   { background: linear-gradient(135deg, #F0E9FF, #D6C5FF); }

.ray-section {
  max-width: 720px;
  margin: 24px auto 0;
}
.ray-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ray-library-link {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 18px;
  padding: 14px 16px;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.ray-library-link:hover { transform: translateY(-1px); }
.ray-library-link .lbl { flex: 1; }
.ray-library-link .ttl { font-size: 14px; font-weight: 700; color: #1e293b; }
.ray-library-link .sub { font-size: 12px; color: #64748b; margin-top: 1px; }

@media (max-width: 480px) {
  .ray-grid { grid-template-columns: 1fr; }
  .ray-heading { font-size: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .ray-avatar-wrap, .ray-avatar-ring { animation: none !important; }
}
`;

function firstNameFrom(user) {
  const raw = user?.name || user?.email || '';
  if (!raw) return 'friend';
  const word = String(raw).split(/[ @._-]/)[0];
  return word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : 'friend';
}

export default function RayTeacher({ user }) {
  const navigate = useNavigate();
  const [comingSoonCard, setComingSoonCard] = useState(null);

  const firstName = firstNameFrom(user);
  const greetingText = useMemo(
    () => `Hi ${firstName}! Ready for a fun English adventure today?`,
    [firstName],
  );
  // Ray voice (ElevenLabs via useLizVoice). The hook accepts a voice_id;
  // when RAY_VOICE_ID is configured backend-side, swap. For now uses the
  // platform default; Ray's voice still differs perceptually from Liz
  // because the prompt + cadence + intonation are male-default.
  const ray = useLizVoice(greetingText, { lang: 'en-US', rate: 0.95 });

  // Stop any audio when leaving the page
  useEffect(() => () => ray.stop && ray.stop(), [ray]);

  const handleCardClick = (card) => {
    if (card.route) {
      navigate(card.route);
      return;
    }
    if (card.comingSoon) {
      setComingSoonCard(card.key);
      setTimeout(() => setComingSoonCard(null), 2400);
    }
  };

  const cards = [
    {
      key: 'play',
      emoji: '🎮',
      title: "Let's play!",
      sub: 'Vocabulary games + word race',
      tone: 'play',
      route: '/game-bank',
    },
    {
      key: 'story',
      emoji: '📖',
      title: 'Tell me a story',
      sub: "I'll read; you listen and answer",
      tone: 'story',
      comingSoon: true,
    },
    {
      key: 'daily',
      emoji: '☀️',
      title: 'Daily challenge',
      sub: 'Review words you learned',
      tone: 'daily',
      route: '/daily-practice',
    },
    {
      key: 'talk',
      emoji: '🎙️',
      title: 'Practice talking',
      sub: 'Speak with me about today',
      tone: 'talk',
      comingSoon: true,
    },
  ];

  return (
    <div className="ray-hub" data-testid="ray-hub">
      <style>{HUB_CSS}</style>

      <section className="ray-hero">
        <div className="ray-name-chip">
          <Sparkles className="w-3 h-3" /> Ray · Your English friend
        </div>
        <div className="ray-avatar-wrap">
          <div className="ray-avatar-ring" />
          <img src={RAY_AVATAR_URL} alt="Ray" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
        <h1 className="display ray-heading">
          Hi {firstName}! <span className="ital">Let's learn together.</span>
        </h1>
        <div className="ray-bubble">
          "{greetingText}"
          <button type="button" onClick={() => ray.toggle()} aria-label="Listen to Ray">
            <Volume2 className="w-3.5 h-3.5" /> {ray.isPlaying && !ray.isPaused ? 'Pause' : 'Listen'}
          </button>
        </div>
      </section>

      <div className="ray-grid">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            className={`ray-card tone-${card.tone}`}
            onClick={() => handleCardClick(card)}
            data-testid={`ray-card-${card.key}`}
          >
            {card.comingSoon && <span className="ray-card-soon">Soon</span>}
            <span className="ray-card-emoji">{card.emoji}</span>
            <span className="ray-card-title">{card.title}</span>
            <span className="ray-card-sub">{card.sub}</span>
            {comingSoonCard === card.key && (
              <span className="ray-card-sub" style={{ color: '#ea580c', fontWeight: 600 }}>
                I'm getting ready! Check back soon.
              </span>
            )}
          </button>
        ))}
      </div>

      <section className="ray-section">
        <div className="ray-section-title">
          <BookOpen className="w-4 h-4" /> Your library
        </div>
        <button
          type="button"
          className="ray-library-link"
          onClick={() => navigate(homePath(user))}
          data-testid="ray-library-link"
        >
          <span className="text-2xl">📚</span>
          <span className="lbl">
            <span className="ttl">Back to your magical library</span>
            <span className="sub">Pick up where you left off</span>
          </span>
          <ChevronRight className="w-5 h-5 text-amber-600" />
        </button>
      </section>

      <section className="ray-section">
        <div className="ray-section-title">
          <Map className="w-4 h-4" /> Quick links
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="ray-library-link"
            onClick={() => navigate('/unified')}
            type="button"
            data-testid="ray-quick-stages"
          >
            <Play className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="lbl">
              <span className="ttl">All stages</span>
              <span className="sub">Choose your book</span>
            </span>
          </button>
          <button
            className="ray-library-link"
            onClick={() => navigate('/daily-practice')}
            type="button"
            data-testid="ray-quick-review"
          >
            <Repeat className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="lbl">
              <span className="ttl">Daily review</span>
              <span className="sub">Words to revisit</span>
            </span>
          </button>
        </div>
      </section>
      {/* Mic icon kept on import for future /ray/chat surface */}
      <span aria-hidden="true" style={{ display: 'none' }}><Mic /></span>
    </div>
  );
}
