import React, { useEffect } from 'react';
import { ArrowRight, MessageCircle, Mic, PenLine, Sparkles } from 'lucide-react';

// V1 GE plan ladder. Prices mirror backend/plan_access.py PLAN_PRICES_USD/VND
// so this page never drifts from what the checkout actually charges. VND
// values are rounded to friendly thousands and rendered with a thin dot.
const GE_PLANS = [
  {
    id: 'explorer',
    eyebrow: 'Dip your toe',
    name: 'Explorer',
    priceUSD: '4.99',
    priceVND: '119,000',
    features: [
      '30 days of Ray',
      'Daily vocab cards + games',
      'Limited writing feedback',
    ],
  },
  {
    id: 'learner',
    eyebrow: 'Build the habit',
    name: 'Learner',
    priceUSD: '9.00',
    priceVND: '219,000',
    features: [
      '30 days of Ray',
      'Unlimited writing feedback',
      'Conversation drills',
      'Full vocab game library',
    ],
    popular: true,
  },
  {
    id: 'achiever',
    eyebrow: 'Stretch yourself',
    name: 'Achiever',
    priceUSD: '19.00',
    priceVND: '459,000',
    features: [
      '30 days of Ray',
      'Speaking practice with pronunciation feedback',
      'Mock conversations + scenarios',
      'Priority email support',
    ],
  },
  {
    id: 'master',
    eyebrow: 'Go all in',
    name: 'Master',
    priceUSD: '29.00',
    priceVND: '699,000',
    features: [
      '30 days of Ray',
      'Everything in Achiever',
      'Unlimited everything',
      '1-on-1 lesson planning with Ray',
    ],
  },
];

// ───── Motion CSS (no framer-motion to keep bundle light) ─────
const GE_MOTION_CSS = `
@keyframes geFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes geFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes geFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@keyframes geCardFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-6px) rotate(0.4deg); }
}
@keyframes geShine {
  0%   { transform: translateX(-130%) skewX(-18deg); }
  100% { transform: translateX(230%)  skewX(-18deg); }
}
@keyframes geBlob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(30px, -20px) scale(1.08); }
  66%      { transform: translate(-20px, 30px) scale(0.95); }
}
@keyframes geSparkle {
  0%, 100% { transform: scale(0) rotate(0deg);   opacity: 0; }
  50%      { transform: scale(1) rotate(180deg); opacity: 1; }
}
@keyframes gePulse {
  0%, 100% { transform: scale(1);    box-shadow: 0 8px 28px -8px rgba(124, 58, 237, 0.55); }
  50%      { transform: scale(1.03); box-shadow: 0 14px 40px -8px rgba(124, 58, 237, 0.75); }
}

.ge-reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--ge-delay, 0s);
}
.ge-reveal.is-in {
  opacity: 1;
  transform: translateY(0);
}

.ge-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
  z-index: 0;
  animation: geBlob 18s ease-in-out infinite;
}
.ge-blob.b1 { background: rgba(168, 85, 247, 0.35); width: 340px; height: 340px; top: -80px; left: -60px; }
.ge-blob.b2 { background: rgba(99, 102, 241, 0.30); width: 280px; height: 280px; top: 120px; right: -40px; animation-delay: -6s; }
.ge-blob.b3 { background: rgba(236, 72, 153, 0.25); width: 260px; height: 260px; bottom: -80px; left: 30%; animation-delay: -12s; }

.ge-sparkle {
  position: absolute;
  pointer-events: none;
  z-index: 2;
  font-size: 18px;
  animation: geSparkle 2.6s ease-in-out infinite;
}

.ge-vocab-card { animation: geCardFloat 6s ease-in-out infinite; }
.ge-vocab-card .ge-shine {
  position: absolute;
  top: 0; left: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
  pointer-events: none;
  animation: geShine 5.5s ease-in-out infinite;
  animation-delay: 2s;
  border-radius: inherit;
}

.ge-feature-icon-wrap {
  display: inline-flex;
  width: 44px; height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f3eeff, #e0d4ff);
  align-items: center; justify-content: center;
  box-shadow: 0 6px 16px -6px rgba(124, 58, 237, 0.35), inset 0 1px 1px rgba(255,255,255,0.6);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ge-feature-card:hover .ge-feature-icon-wrap { transform: scale(1.08) rotate(-4deg); }
.ge-feature-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -16px rgba(80, 30, 120, 0.18); }
.ge-feature-card { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s; }

.ge-plan-card { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s; position: relative; overflow: hidden; }
.ge-plan-card:hover { transform: translateY(-6px); box-shadow: 0 24px 50px -18px rgba(80, 30, 120, 0.22); }
.ge-plan-card.popular .ge-popular-pulse { animation: gePulse 2.2s ease-in-out infinite; }

.ge-cta-final { position: relative; overflow: hidden; }
.ge-cta-final::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
  transform: translateX(-100%) skewX(-18deg);
  animation: geShine 6s ease-in-out infinite;
  pointer-events: none;
}

.ge-cta-btn {
  position: relative;
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s;
}
.ge-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px -8px rgba(124, 58, 237, 0.6); }
.ge-cta-btn::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
  transform: translateX(-130%) skewX(-18deg);
  transition: transform 0.65s;
  pointer-events: none;
}
.ge-cta-btn:hover::after { transform: translateX(230%) skewX(-18deg); }

@media (prefers-reduced-motion: reduce) {
  .ge-reveal, .ge-vocab-card, .ge-blob, .ge-sparkle, .ge-vocab-card .ge-shine, .ge-cta-final::after, .ge-cta-btn::after, .ge-plan-card.popular .ge-popular-pulse {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

/**
 * Landing page for the General English track.
 *
 * Sister to LandingPageDemo (the IELTS-flavoured front door), but with
 * its own brand and copy so visitors who pick "General English" in the
 * path-picker land somewhere that feels different from the IELTS surface.
 *
 * Brand: violet (V1 testmaster.pro identity, before the IELTS Ace
 * emerald rebrand). Tutor persona: Ray (memory: project_ge_tutor_name —
 * Liz is IELTS-only; Ray fronts the GE product).
 *
 * Motion: pure CSS keyframes + IntersectionObserver scroll reveals.
 * Respects prefers-reduced-motion. No framer-motion dependency.
 */
export default function LandingPageGE() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'General English with Ray · testmaster.pro';
    return () => {
      document.title = prev;
    };
  }, []);

  // Reveal-on-scroll: add .is-in to every .ge-reveal element as it enters
  // the viewport. Falls back to immediate reveal if IO is unavailable.
  useEffect(() => {
    const els = document.querySelectorAll('.ge-reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-sky-50 relative overflow-hidden">
      <style>{GE_MOTION_CSS}</style>

      {/* Floating blobs for depth */}
      <div className="ge-blob b1" />
      <div className="ge-blob b2" />
      <div className="ge-blob b3" />

      {/* Top bar — minimal, no shared PublicNav (different brand on purpose) */}
      <header className="relative z-20 max-w-7xl mx-auto px-5 sm:px-8 pt-6 pb-2 flex items-center justify-between ge-reveal">
        <a href="/" className="inline-flex items-center" aria-label="Ray English home">
          <img
            src="/brand/ray-english-logo.png"
            alt="Ray English — Everyday English by testmaster.pro"
            className="h-10 sm:h-12 w-auto"
          />
        </a>
        <div className="flex items-center gap-2">
          <a
            href="/login?path=general"
            className="hidden sm:inline-flex text-sm text-slate-700 hover:text-slate-900 px-3 py-2"
          >
            Log in
          </a>
          <a
            href="/signup?path=general"
            className="ge-cta-btn inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-sm"
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div
              className="ge-reveal inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-violet-700 mb-4"
              style={{ '--ge-delay': '0.05s' }}
            >
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              Everyday English · Powered by Ray
            </div>
            <h1
              className="ge-reveal text-[40px] sm:text-[52px] leading-[1.05] font-bold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", '--ge-delay': '0.15s' }}
            >
              Speak naturally.{' '}
              <span className="text-violet-700 italic">Write confidently.</span>
              <br />
              Play to fluency.
            </h1>
            <p
              className="ge-reveal mt-5 text-[16px] leading-relaxed text-slate-600 max-w-xl"
              style={{ '--ge-delay': '0.30s' }}
            >
              Meet <b className="text-slate-900">Ray</b> — your everyday English
              coach. Vocabulary games, real conversations, writing feedback in
              your own language. Built for travellers, professionals, and
              learners who don't need an exam date — just confidence.
            </p>
            <div
              className="ge-reveal mt-7 flex flex-wrap gap-3"
              style={{ '--ge-delay': '0.45s' }}
            >
              <a
                href="/signup?path=general"
                className="ge-cta-btn inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold text-[15px] px-6 py-3.5 rounded-xl shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)]"
              >
                Start free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/login?path=general"
                className="inline-flex items-center px-5 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-medium text-[15px] transition-all hover:bg-white"
              >
                Log in
              </a>
            </div>
            <p
              className="ge-reveal mt-4 text-[12.5px] text-slate-500"
              style={{ '--ge-delay': '0.55s' }}
            >
              Free to start · No credit card · Ray remembers your level.
            </p>
          </div>

          <div className="relative ge-reveal" style={{ '--ge-delay': '0.30s' }}>
            <div className="ge-vocab-card relative rounded-2xl border border-violet-100 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(124,58,237,0.25)] overflow-hidden">
              <div className="ge-shine" />
              <div className="flex items-start gap-3 relative z-10">
                <img
                  src="/static/images/ray/ray.png"
                  alt="Ray"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-200 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-[11px] font-semibold tracking-wider uppercase text-violet-700">
                    Ray · Vocab card
                  </div>
                  <h3 className="mt-1 text-[20px] font-semibold text-slate-900">
                    "to call it a day"
                  </h3>
                  <p className="mt-1 text-[14px] text-slate-600 leading-relaxed">
                    To stop working for the rest of the day, usually because
                    you're tired or you've finished what you needed to do.
                  </p>
                  <div className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-[13px] text-violet-900">
                    "It's 9 pm — let's <b>call it a day</b> and grab dinner."
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    Ray will quiz you on this in 2 days, then 5 days.
                  </div>
                </div>
              </div>
            </div>
            {/* Floating sparkles around the card */}
            <span className="ge-sparkle" style={{ top: '-8px', right: '24px', color: '#FFD700' }}>✨</span>
            <span className="ge-sparkle" style={{ bottom: '-6px', left: '20%', color: '#A78BFA', animationDelay: '0.6s' }}>⭐</span>
            <span className="ge-sparkle" style={{ top: '40%', right: '-12px', color: '#F472B6', animationDelay: '1.2s' }}>✨</span>
          </div>
        </div>
      </section>

      {/* What Ray does */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-14 border-t border-slate-100">
        <div className="ge-reveal text-[11px] font-semibold tracking-wider uppercase text-violet-700">
          What Ray does with you
        </div>
        <h2
          className="ge-reveal mt-2 text-[28px] sm:text-[36px] font-semibold text-slate-900 tracking-tight max-w-3xl"
          style={{ fontFamily: "'Playfair Display', serif", '--ge-delay': '0.08s' }}
        >
          Conversation-first English, not grammar drills.
        </h2>
        <div className="mt-8 grid sm:grid-cols-3 gap-5">
          <div
            className="ge-feature-card ge-reveal rounded-2xl border border-slate-200 bg-white p-6"
            style={{ '--ge-delay': '0.10s' }}
          >
            <span className="ge-feature-icon-wrap">
              <Mic className="w-5 h-5 text-violet-600" />
            </span>
            <h3 className="mt-3 font-semibold text-slate-900">Real conversations</h3>
            <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">
              Talk to Ray about your day, your job, your travels. He corrects
              what matters and lets the rest flow.
            </p>
          </div>
          <div
            className="ge-feature-card ge-reveal rounded-2xl border border-slate-200 bg-white p-6"
            style={{ '--ge-delay': '0.22s' }}
          >
            <span className="ge-feature-icon-wrap">
              <PenLine className="w-5 h-5 text-violet-600" />
            </span>
            <h3 className="mt-3 font-semibold text-slate-900">Write anything</h3>
            <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">
              Emails, social posts, a letter to a friend — Ray rewrites it in
              natural English and explains the changes in your language.
            </p>
          </div>
          <div
            className="ge-feature-card ge-reveal rounded-2xl border border-slate-200 bg-white p-6"
            style={{ '--ge-delay': '0.34s' }}
          >
            <span className="ge-feature-icon-wrap">
              <MessageCircle className="w-5 h-5 text-violet-600" />
            </span>
            <h3 className="mt-3 font-semibold text-slate-900">Vocab that sticks</h3>
            <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">
              Spaced-repetition cards, idioms, phrasal verbs. Learn five words
              today, see them again exactly when you'd forget.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing — V1 GE tiers, NOT the IELTS Ace plans (those live at /pricing) */}
      <section
        id="pricing"
        className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-14 border-t border-slate-100"
      >
        <div className="ge-reveal text-[11px] font-semibold tracking-wider uppercase text-violet-700">
          Pricing
        </div>
        <h2
          className="ge-reveal mt-2 text-[28px] sm:text-[36px] font-semibold text-slate-900 tracking-tight max-w-3xl"
          style={{ fontFamily: "'Playfair Display', serif", '--ge-delay': '0.08s' }}
        >
          Pay for the time you actually study.
        </h2>
        <p
          className="ge-reveal mt-3 text-[15px] text-slate-600 max-w-2xl"
          style={{ '--ge-delay': '0.16s' }}
        >
          Every paid plan unlocks Ray for 30 days. Cancel any time — your
          progress and vocab cards stay yours.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GE_PLANS.map((plan, i) => (
            <div
              key={plan.id}
              className={`ge-plan-card ge-reveal rounded-2xl border bg-white p-6 ${
                plan.popular
                  ? 'popular border-violet-300 shadow-[0_20px_60px_-25px_rgba(124,58,237,0.45)]'
                  : 'border-slate-200'
              }`}
              style={{ '--ge-delay': `${0.10 + i * 0.10}s` }}
            >
              {plan.popular && (
                <span className="ge-popular-pulse absolute -top-2.5 left-6 px-2.5 py-1 rounded-md bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-bold tracking-wider uppercase">
                  Most popular
                </span>
              )}
              <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                {plan.eyebrow}
              </div>
              <h3 className="mt-1 text-xl font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">${plan.priceUSD}</span>
                <span className="text-[13px] text-slate-500">/ 30 days</span>
              </div>
              <div className="text-[12px] text-slate-500 mt-0.5">
                or ₫{plan.priceVND} via VietQR
              </div>
              <ul className="mt-5 space-y-2 text-[14px] text-slate-700">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-violet-600 mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`/signup?path=general&plan=${plan.id}`}
                className={`ge-cta-btn mt-5 inline-flex w-full items-center justify-center gap-1.5 font-semibold text-[14px] px-4 py-2.5 rounded-xl ${
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white'
                    : 'border border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {plan.id === 'explorer' ? 'Start small' : `Choose ${plan.name}`}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Path nudge */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 py-14">
        <div className="ge-cta-final ge-reveal rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white p-8 sm:p-10 text-center shadow-[0_30px_80px_-30px_rgba(124,58,237,0.6)]">
          <h2
            className="relative z-10 text-[26px] sm:text-[32px] font-semibold tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ready when you are.
          </h2>
          <p className="relative z-10 mt-3 text-[15px] text-violet-100 max-w-xl mx-auto leading-relaxed">
            Start free with Ray. Upgrade when you want unlimited chat, writing
            feedback, and the full game library.
          </p>
          <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/signup?path=general"
              className="ge-cta-btn inline-flex items-center gap-2 bg-white text-violet-700 hover:bg-violet-50 font-semibold text-[15px] px-6 py-3 rounded-xl"
            >
              Start free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 border border-white/40 hover:border-white/70 text-white font-medium text-[15px] px-5 py-3 rounded-xl transition-all"
            >
              See pricing
            </a>
          </div>
          <p className="relative z-10 mt-4 text-[12px] text-violet-200">
            Preparing for IELTS instead?{' '}
            <a href="/" className="underline hover:text-white">
              Switch to the IELTS path
            </a>
            .
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-10 border-t border-slate-100 text-[13px] text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-slate-700">testmaster.pro</span>
          <span>· Made by a teacher.</span>
          <span className="ml-auto flex gap-4">
            <a href="/privacy" className="hover:text-slate-700">Privacy</a>
            <a href="/terms" className="hover:text-slate-700">Terms</a>
            <a href="/contact" className="hover:text-slate-700">Contact</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
