import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MONTHS, DAY_SHORT } from '../constants';

const CONFETTI_COLORS = [
  'hsl(160 84% 45%)',
  'hsl(199 89% 60%)',
  'hsl(43 96% 56%)',
  'hsl(260 55% 62%)',
];

function Confetti({ enabled }) {
  const pieces = useMemo(() => {
    if (!enabled) return [];
    return Array.from({ length: 60 }, (_, i) => ({
      key: i,
      left: `${Math.random() * 100}%`,
      bg: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: `${Math.random() * 0.8}s`,
      dur: `${(2.2 + Math.random() * 1.2).toFixed(2)}s`,
      width: `${(6 + Math.random() * 6).toFixed(1)}px`,
      height: `${(10 + Math.random() * 8).toFixed(1)}px`,
    }));
  }, [enabled]);

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <i
          key={p.key}
          style={{
            left: p.left,
            background: p.bg,
            animationDelay: p.delay,
            animationDuration: p.dur,
            width: p.width,
            height: p.height,
          }}
        />
      ))}
    </div>
  );
}

function Wave({ playing }) {
  const bars = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const delay = (Math.sin(i * 0.6) * 0.5 + (i % 3) * 0.1).toFixed(2);
        const dur = (1 + (i % 5) * 0.12).toFixed(2);
        return { key: i, delay: `${delay}s`, dur: `${dur}s` };
      }),
    [],
  );
  return (
    <div className={`wave${playing ? ' playing' : ' paused'}`}>
      {bars.map((b) => (
        <span
          key={b.key}
          style={{ animationDelay: b.delay, animationDuration: b.dur }}
        />
      ))}
    </div>
  );
}

export default function Step5LizIntro({ direction, state }) {
  const [playing, setPlaying] = useState(true);
  const confettiShown = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!confettiShown.current) {
      confettiShown.current = true;
      setShowConfetti(true);
    }
  }, []);

  const name = state.name || 'Aga';
  const target = state.targetBand || 7.0;
  const current = state.currentBand || 6.0;
  const lang = state.language?.name || 'English';
  const track = state.path === 'general' ? 'General English' : 'IELTS Ace';

  let examTxt = 'To be decided';
  if (state.examDate instanceof Date) {
    const d = state.examDate;
    examTxt = `${DAY_SHORT[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
  }

  const playIcon = playing ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  );

  return (
    <section className={`step${direction === 'rev' ? ' rev' : ''}`}>
      <div className="liz-screen">
        <Confetti enabled={showConfetti} />
        <div className="liz-avatar-lg">L</div>
        <div className="liz-name">Liz · Your AI IELTS guide</div>
        <h2 className="liz-heading">
          Hi {name}! I've prepared a{' '}
          <span className="ital">45-day plan</span> for you.
        </h2>
        <p className="liz-quote">
          From your current Band <b>{current.toFixed(1)}</b> to your target of{' '}
          <b>{target.toFixed(1)}</b>, we'll work in English — I'll translate
          every note into <b>{lang}</b>. Ready to see it?
        </p>

        <div className="wave-row">
          <button
            type="button"
            className="play-btn"
            aria-label={playing ? 'Pause greeting' : 'Play greeting'}
            onClick={() => setPlaying((p) => !p)}
          >
            {playIcon}
          </button>
          <Wave playing={playing} />
          <div className="wave-lang">Greeting · {lang}</div>
        </div>

        <div className="plan-summary">
          <div className="row">
            <span className="k">•</span>
            <span className="lbl">Track</span>
            <span className="val">{track}</span>
          </div>
          <div className="row">
            <span className="k">•</span>
            <span className="lbl">Start → target</span>
            <span className="val">
              {current.toFixed(1)} → {target.toFixed(1)}
            </span>
          </div>
          <div className="row">
            <span className="k">•</span>
            <span className="lbl">Exam</span>
            <span className="val">{examTxt}</span>
          </div>
          <div className="row">
            <span className="k">•</span>
            <span className="lbl">Explains in</span>
            <span className="val">{lang}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
