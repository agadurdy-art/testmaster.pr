import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Sparkles, MessageCircle, Lock, ArrowRight } from 'lucide-react';
import { SpeakingPractice } from '../features/speaking';
import { isSpeakingPremiumUser, getPlanLabel } from '../lib/planAccess';
import '../features/speaking/speaking.css';

/**
 * Speaking Premium — Liz live full AI tutor (gated route).
 *
 * Gate: only `monthly` and `exam` tiers (admins bypass). Free / weekly users
 * see a locked card with a short conversion blurb → /pricing/v2.
 *
 * On unlock, mounts the D7 SpeakingPractice flow which:
 *   - 2026-04-29: Part 1 / Part 3 are migrating from Gemini Live to ElevenLabs
 *     Conversational AI. Until Phase B lands, those parts show a placeholder
 *     that routes the candidate to Part 2.
 *   - keeps Part 2 on the monologue cue-card flow with Sonnet eval
 *
 * Mounted at /speaking-premium. The `/liz` route mounts a different surface
 * (LizTeacher avatar + chat); these are intentionally separate per Aga
 * 2026-04-28 — premium speaking IS Liz live conversation; the Liz button
 * (e.g. on the Dashboard) routes to LizTeacher.
 */
export default function SpeakingPremium({ user }) {
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

  if (isSpeakingPremiumUser(user)) {
    return (
      <div className="speaking-scope">
        <SpeakingPractice
          user={user}
          onExit={() => navigate('/dashboard/v2')}
        />
      </div>
    );
  }

  return <SpeakingPremiumLocked user={user} onUpgrade={() => navigate('/pricing/v2')} />;
}

function SpeakingPremiumLocked({ user, onUpgrade }) {
  const planLabel = getPlanLabel(user?.plan);

  return (
    <div className="min-h-screen bg-slate-50 px-5 sm:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-[13px] text-slate-500 hover:text-slate-700 mb-6"
        >
          ← Back
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_24px_48px_-32px_rgba(15,23,42,0.25)] overflow-hidden">
          {/* Locked banner */}
          <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 px-6 sm:px-10 py-10 text-white">
            <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              Premium
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[12px] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Liz Live · ElevenLabs
            </div>
            <h1
              className="mt-4 text-[28px] sm:text-[34px] leading-tight font-semibold tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Speak with Liz, like a real examiner.
            </h1>
            <p className="mt-3 max-w-xl text-white/85 text-[15px] leading-relaxed">
              Real-time voice conversation for Part 1 & Part 3, plus a
              calibrated Part 2 monologue with pronunciation feedback. The
              closest thing to a 1-on-1 IELTS speaking tutor.
            </p>
          </div>

          {/* Premium feature blurb — short, conversion-focused */}
          <div className="px-6 sm:px-10 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Feature
                icon={<MessageCircle className="w-4 h-4" />}
                title="Live conversation"
                desc="Liz asks, you answer — natural turn-taking on Part 1 & 3."
              />
              <Feature
                icon={<Mic className="w-4 h-4" />}
                title="Pronunciation map"
                desc="Per-word coaching on stress, vowels and clarity."
              />
              <Feature
                icon={<Sparkles className="w-4 h-4" />}
                title="Examiner-calibrated"
                desc="Sonnet eval anchored to Cambridge band descriptors."
              />
            </div>

            <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[12px] uppercase tracking-wider text-slate-500 font-medium">
                    Your plan
                  </div>
                  <div className="text-[15px] font-medium text-slate-800">
                    {planLabel} — Speaking Premium not included
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-[14px] px-5 py-2.5 rounded-xl"
                >
                  Upgrade to unlock
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 text-[12px] text-slate-500">
                Available on Monthly and Exam Pack tiers. Standard speaking
                practice stays free on your current plan.
              </div>
            </div>
          </div>
        </div>

        {/* Secondary path for users who want to keep practising right now */}
        <div className="mt-6 text-center text-[13px] text-slate-500">
          Not ready to upgrade?{' '}
          <a
            href="/speaking-practice"
            className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
          >
            Continue standard speaking practice →
          </a>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div>
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 text-violet-700 mb-2">
        {icon}
      </div>
      <div className="text-[14px] font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-[13px] text-slate-600 leading-relaxed">
        {desc}
      </div>
    </div>
  );
}
