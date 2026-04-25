import React from "react";
import { ArrowRight, Star, Lock, ShieldCheck } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * Bottom-of-page conversion block: headline + social proof on the left,
 * mini "your report" mock card on the right. The email capture that used
 * to sit here was dead wiring — no parent passed `onSubmitEmail`, so the
 * typed address was dropped and the user had to re-enter it on /signup.
 * Replaced with a single "Start free" CTA that carries the writing intent
 * into the signup flow (App.js's SignupBridge + handleLogin consume it).
 */
export default function ConversionBlock({ className }) {
  return (
    <section id="cta" className={cn("print:hidden relative mx-auto max-w-7xl px-5 sm:px-8 pb-14", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-emerald-200/70",
          "p-8 sm:p-12"
        )}
        style={{
          background:
            "linear-gradient(135deg, hsl(160 60% 96%) 0%, hsl(210 40% 98%) 50%, hsl(199 90% 96%) 100%)",
        }}
      >
        {/* decorative blurs */}
        <div
          aria-hidden
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl"
        />

        <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.12em] text-emerald-800 bg-white/70 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span
                className="w-1.5 h-1.5 rounded-full bg-emerald-600"
                style={{ animation: "pulseDot 1.8s ease-in-out infinite" }}
                aria-hidden
              />
              Free · no credit card
            </span>
            <h2
              className="mt-4 font-bold text-[34px] sm:text-[44px] leading-[1.05] tracking-tight text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Try this with your own essay.
            </h2>
            <p className="mt-3 text-[17px] text-slate-700 leading-relaxed max-w-xl">
              Get inline feedback on Task Achievement, Coherence, Vocabulary, and
              Grammar — in your native language. Your first evaluation is free,
              and you'll see your report in under a minute.
            </p>

            {/* Single CTA — the global "Try free" button already appears in
                the top nav + hero, so there's no reason to demand an email
                here before the real signup form. */}
            <div className="mt-6">
              <a
                href="/signup?intent=writing&path=ielts"
                className={cn(
                  "inline-flex items-center justify-center gap-1.5",
                  "bg-emerald-600 hover:bg-emerald-700 text-white",
                  "font-semibold text-[15px] px-6 py-3.5 rounded-xl",
                  "shadow-[0_6px_22px_-8px_hsl(160_84%_39%/_0.55)]",
                  "transition-colors whitespace-nowrap"
                )}
              >
                Start free <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-slate-700">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
                  ))}
                </div>
                <span className="font-semibold">4.8</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {[
                    { l: "MT", from: "hsl(14 90% 75%)", to: "hsl(14 90% 55%)" },
                    { l: "NH", from: "hsl(199 90% 75%)", to: "hsl(199 90% 50%)" },
                    { l: "PL", from: "hsl(160 70% 70%)", to: "hsl(160 84% 35%)" },
                    { l: "AT", from: "hsl(262 60% 75%)", to: "hsl(262 60% 50%)" },
                  ].map((a, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full ring-2 ring-slate-50 grid place-items-center text-[10px] font-semibold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
                      }}
                    >
                      {a.l}
                    </div>
                  ))}
                </div>
                <span>
                  Trusted by <strong className="text-slate-900">500+</strong>{" "}
                  students
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>Backed by a real IELTS teacher</span>
              </div>
            </div>
          </div>

          {/* Mini report preview */}
          <div className="hidden lg:block">
            <MiniReportPreview />
          </div>
        </div>

        <style>{`
          @keyframes pulseDot {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.4); opacity: 0.4; }
          }
        `}</style>
      </div>
    </section>
  );
}

function MiniReportPreview() {
  const bars = [
    { label: "Task Achievement", pct: 62 },
    { label: "Coherence", pct: 78 },
    { label: "Vocabulary", pct: 70 },
    { label: "Grammar", pct: 68 },
  ];
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-white/60 border border-slate-200"
      />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-[0_4px_14px_rgba(15,23,42,0.06),0_16px_40px_-12px_rgba(15,23,42,0.12)] p-5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
            Your report
          </div>
          <div className="text-[11px] text-slate-500">~47 sec</div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <div
            className="font-bold text-emerald-800 tracking-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "56px",
              lineHeight: "0.85",
            }}
          >
            ?.?
          </div>
          <div className="text-[12px] text-slate-500">/ 9.0</div>
        </div>
        <div className="mt-3 space-y-2">
          {bars.map((b, i) => (
            <div key={i}>
              <div className="flex justify-between text-[12px] text-slate-500">
                <span>{b.label}</span>
                <span>—</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-600/30"
                  style={{ width: `${b.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-[12px] text-slate-500 flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          Paste your essay — your result generates here.
        </div>
      </div>
    </div>
  );
}
