import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MONTHS, DAY_SHORT } from '../constants';
import LizAvatar from '../../landing/components/LizAvatar';
import { useLizVoice } from '../../../hooks/useLizVoice';

// Short, natural Liz greeting per supported language. The placeholder
// {name}/{current}/{target} tokens are filled in buildGreeting below.
// Keeping this data-only (no grammar logic) so translators can tweak
// without touching component code.
const GREETINGS = {
  en: { lang: 'en-GB', text: "Hi {name}! I've prepared a forty-five-day plan. We'll go from Band {current} to {target}, together. Ready?" },
  tr: { lang: 'tr-TR', text: 'Merhaba {name}! Senin için 45 günlük bir plan hazırladım. {current} bandından {target} hedefine birlikte gideceğiz. Hazır mısın?' },
  vi: { lang: 'vi-VN', text: 'Chào {name}! Mình đã chuẩn bị một kế hoạch 45 ngày. Chúng ta sẽ đi từ band {current} đến band {target}. Sẵn sàng chưa?' },
  zh: { lang: 'zh-CN', text: '你好 {name}！我为你准备了一个 45 天的计划。我们将从 {current} 分一起提升到 {target} 分。准备好了吗？' },
  ar: { lang: 'ar-SA', text: 'مرحباً {name}! لقد أعددت لك خطة مدتها خمسة وأربعون يوماً. سننتقل معاً من {current} إلى {target}. هل أنت مستعد؟' },
  ko: { lang: 'ko-KR', text: '안녕하세요 {name}님! 45일 계획을 준비했어요. {current}에서 {target}까지 함께 가요. 준비되셨나요?' },
  th: { lang: 'th-TH', text: 'สวัสดี {name}! ฉันได้เตรียมแผน 45 วันให้คุณแล้ว เราจะไปจากแบนด์ {current} ถึง {target} ด้วยกัน พร้อมหรือยัง?' },
  ja: { lang: 'ja-JP', text: 'こんにちは{name}さん！45日間のプランを用意しました。バンド{current}から{target}まで一緒に目指しましょう。準備はいいですか？' },
  es: { lang: 'es-ES', text: '¡Hola {name}! He preparado un plan de 45 días. Iremos del Band {current} al {target}, juntos. ¿Listo?' },
  pt: { lang: 'pt-PT', text: 'Olá {name}! Preparei um plano de 45 dias. Vamos do Band {current} ao {target}, juntos. Pronto?' },
  ru: { lang: 'ru-RU', text: 'Привет, {name}! Я подготовила для тебя план на 45 дней. Вместе пройдём путь с уровня {current} до {target}. Готов?' },
  id: { lang: 'id-ID', text: 'Halo {name}! Saya sudah menyiapkan rencana 45 hari. Kita akan naik dari band {current} ke band {target}, bersama. Siap?' },
};

function buildGreeting(code, name, current, target) {
  const entry = GREETINGS[code] || GREETINGS.en;
  const text = entry.text
    .replaceAll('{name}', name)
    .replaceAll('{current}', current.toFixed(1))
    .replaceAll('{target}', target.toFixed(1));
  return { lang: entry.lang, text };
}

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

export default function Step5LizIntro({ direction, state, onMotivationChange }) {
  const confettiShown = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!confettiShown.current) {
      confettiShown.current = true;
      setShowConfetti(true);
    }
  }, []);

  const name = state.name || 'there';
  const target = state.targetBand || 7.0;
  const current = state.currentBand || 6.0;
  const langCode = state.language?.code || 'en';
  const lang = state.language?.name || 'English';
  const track = state.path === 'general' ? 'General English' : 'IELTS Ace';

  // Liz voice via ElevenLabs (multilingual model handles all 12 supported
  // greeting languages with a single consistent female voice). Hook
  // registers with AudioProvider so it stops on route change automatically;
  // falls back to Web Speech if the backend key isn't configured.
  const greeting = useMemo(
    () => buildGreeting(langCode, name, current, target),
    [langCode, name, current, target],
  );
  const liz = useLizVoice(greeting.text, {
    lang: greeting.lang,
    rate: 0.97,
  });

  const handleTogglePlay = () => liz.toggle();
  const playing = liz.isPlaying && !liz.isPaused;

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
        <LizAvatar size={120} ring className="liz-avatar-lg" />
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

        {liz.isSupported && (
          <div className="wave-row">
            <button
              type="button"
              className="play-btn"
              aria-label={playing ? 'Pause greeting' : 'Play greeting'}
              onClick={handleTogglePlay}
            >
              {playIcon}
            </button>
            <Wave playing={playing} />
            <div className="wave-lang">Greeting · {lang}</div>
          </div>
        )}

        {onMotivationChange && (
          <div className="motivation-block">
            <label className="motivation-label" htmlFor="liz-motivation">
              In one line — why are you doing this?
            </label>
            <div className="motivation-hint">
              "I need 7.0 for med school in Australia." Liz uses it to keep
              you focused. Optional.
            </div>
            <input
              id="liz-motivation"
              type="text"
              className="motivation-input"
              maxLength={140}
              value={state.motivation || ''}
              onChange={(e) => onMotivationChange(e.target.value)}
              placeholder="What's pushing you toward this band?"
            />
          </div>
        )}

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
