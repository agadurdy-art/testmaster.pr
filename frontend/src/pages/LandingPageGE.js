import React, { useEffect } from 'react';
import { ArrowRight, MessageCircle, Mic, PenLine, Sparkles } from 'lucide-react';

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
 * The page is intentionally compact — most visitors will sign up after
 * the hero / "what you get" pair. Pricing/CTA mirrors the same plans
 * that already work for GE (?path=general carries the cohort flag
 * through to the signup form).
 */
export default function LandingPageGE() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'General English with Ray · testmaster.pro';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-sky-50">
      {/* Top bar — minimal, no shared PublicNav (different brand on purpose) */}
      <header className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 pb-2 flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white items-center justify-center font-bold">
            R
          </span>
          <div className="leading-tight">
            <div className="font-bold text-slate-900">testmaster.pro</div>
            <div className="text-[11px] text-slate-500 tracking-wide">General English with Ray</div>
          </div>
        </a>
        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="hidden sm:inline-flex text-sm text-slate-700 hover:text-slate-900 px-3 py-2"
          >
            Log in
          </a>
          <a
            href="/signup?path=general"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-sm"
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-violet-700 mb-4">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              Everyday English · Powered by Ray
            </div>
            <h1
              className="text-[40px] sm:text-[52px] leading-[1.05] font-bold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Speak naturally.{' '}
              <span className="text-violet-700 italic">Write confidently.</span>
              <br />
              Play to fluency.
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-slate-600 max-w-xl">
              Meet <b className="text-slate-900">Ray</b> — your everyday English
              coach. Vocabulary games, real conversations, writing feedback in
              your own language. Built for travellers, professionals, and
              learners who don't need an exam date — just confidence.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/signup?path=general"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold text-[15px] px-6 py-3.5 rounded-xl shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)]"
              >
                Start free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/login"
                className="inline-flex items-center px-5 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-medium text-[15px]"
              >
                Log in
              </a>
            </div>
            <p className="mt-4 text-[12.5px] text-slate-500">
              Free to start · No credit card · Ray remembers your level.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(124,58,237,0.25)]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white inline-flex items-center justify-center font-bold flex-shrink-0">
                  R
                </div>
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
          </div>
        </div>
      </section>

      {/* What Ray does */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 border-t border-slate-100">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-violet-700">
          What Ray does with you
        </div>
        <h2
          className="mt-2 text-[28px] sm:text-[36px] font-semibold text-slate-900 tracking-tight max-w-3xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Conversation-first English, not grammar drills.
        </h2>
        <div className="mt-8 grid sm:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Mic className="w-5 h-5 text-violet-600" />
            <h3 className="mt-3 font-semibold text-slate-900">Real conversations</h3>
            <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">
              Talk to Ray about your day, your job, your travels. He corrects
              what matters and lets the rest flow.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <PenLine className="w-5 h-5 text-violet-600" />
            <h3 className="mt-3 font-semibold text-slate-900">Write anything</h3>
            <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">
              Emails, social posts, a letter to a friend — Ray rewrites it in
              natural English and explains the changes in your language.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <MessageCircle className="w-5 h-5 text-violet-600" />
            <h3 className="mt-3 font-semibold text-slate-900">Vocab that sticks</h3>
            <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">
              Spaced-repetition cards, idioms, phrasal verbs. Learn five words
              today, see them again exactly when you'd forget.
            </p>
          </div>
        </div>
      </section>

      {/* Path nudge */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-14">
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white p-8 sm:p-10 text-center shadow-[0_30px_80px_-30px_rgba(124,58,237,0.6)]">
          <h2
            className="text-[26px] sm:text-[32px] font-semibold tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ready when you are.
          </h2>
          <p className="mt-3 text-[15px] text-violet-100 max-w-xl mx-auto leading-relaxed">
            Free forever for a few lessons a week. Upgrade when you want
            unlimited chat, writing feedback, and the full game library.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/signup?path=general"
              className="inline-flex items-center gap-2 bg-white text-violet-700 hover:bg-violet-50 font-semibold text-[15px] px-6 py-3 rounded-xl"
            >
              Start free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 border border-white/40 hover:border-white/70 text-white font-medium text-[15px] px-5 py-3 rounded-xl"
            >
              See pricing
            </a>
          </div>
          <p className="mt-4 text-[12px] text-violet-200">
            Preparing for IELTS instead?{' '}
            <a href="/" className="underline hover:text-white">
              Switch to the IELTS path
            </a>
            .
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-5 sm:px-8 py-10 border-t border-slate-100 text-[13px] text-slate-500">
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
