import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Mail,
  Loader2,
  Mic,
  Square,
  ShieldCheck,
  Lock,
  RotateCcw,
} from "lucide-react";
import PublicNav from "../features/samples/components/PublicNav";
import SampleBanner from "../features/samples/components/SampleBanner";
import PublicFooter from "../features/samples/components/PublicFooter";
import MobileStickyCTA from "../features/samples/components/MobileStickyCTA";
import {
  ResultsState,
  useSpeakingRecorder,
  adaptSpeakingResult,
} from "../features/speaking";
import { useI18n } from "../lib/i18n";

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Public anonymous speaking evaluator — `/score-my-speaking`.
 *
 * Mirror of `/score-my-essay`: visitor enters email, picks a Part, records
 * once, sees the same D7 ResultsState a logged-in student gets. Backend
 * gates on (email, ip, week_key); 402 surfaces `part_used` so the upsell
 * CTA can read "You already tried Part 2 — sign in to try Part 1 too".
 *
 * sessionStorage cache (10 min) keeps the report alive across accidental
 * refreshes. No download, no PDF — view-only.
 *
 * See project memory: project_speaking_unified_impl_state.md
 */

const CACHE_KEY = "publicSpeakingResult_v1";
const CACHE_TTL_MS = 10 * 60 * 1000;
const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

const PART_OPTIONS = [
  {
    id: "part1",
    label: "Part 1",
    title: "Familiar questions",
    blurb: "Short answer · ~1 minute",
    maxSec: 75,
    prompt: "Tell me about your hometown. Where is it, and what's it like to live there?",
    bullets: [],
  },
  {
    id: "part2",
    label: "Part 2",
    title: "Cue card · long turn",
    blurb: "1 min prep · 2 min monologue",
    maxSec: 130,
    prompt: "Describe a person who has influenced you.",
    bullets: ["who this person is", "how you know them", "what they are like"],
    andExplain: "and explain why they have influenced you.",
    recommended: true,
  },
  {
    id: "part3",
    label: "Part 3",
    title: "Abstract discussion",
    blurb: "Opinion + speculation · ~1.5 min",
    maxSec: 120,
    prompt:
      "Why do you think role models matter in modern society? Do they have more or less influence than they used to?",
    bullets: [],
  },
];

const PART_BY_ID = Object.fromEntries(PART_OPTIONS.map((p) => [p.id, p]));

function loadCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(payload) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...payload, savedAt: Date.now() }),
    );
  } catch {
    /* sessionStorage may be disabled — ignore */
  }
}

function fmtMMSS(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function genRequestId() {
  // Stable enough for idempotency; backend stores the value, not its source.
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function PublicSpeakingTrial() {
  const { languageWireCode } = useI18n();

  // Stages: "intro" (email+part), "prep" (Part 2 only), "record",
  // "submit", "result", "quota", "error"
  const [stage, setStage] = useState("intro");
  const [email, setEmail] = useState("");
  // Honor `?part=part1|part2|part3` so the Samples page can deep-link
  // visitors into the picker with their chosen part already highlighted.
  const [partId, setPartId] = useState(() => {
    if (typeof window === "undefined") return "part2";
    const q = new URLSearchParams(window.location.search).get("part");
    return q === "part1" || q === "part2" || q === "part3" ? q : "part2";
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [submittedPart, setSubmittedPart] = useState(null);
  const [partUsed, setPartUsed] = useState(null);
  const [prepRemaining, setPrepRemaining] = useState(60);

  const reportRef = useRef(null);

  const part = PART_BY_ID[partId] || PART_BY_ID.part2;

  // Cap recording at the part's natural max so we don't over-charge ElevenLabs/Azure.
  const recorder = useSpeakingRecorder({ maxDurationSec: part.maxSec });

  // Restore cached result on mount.
  useEffect(() => {
    const cached = loadCache();
    if (cached?.result) {
      setResult(cached.result);
      setSubmittedPart(cached.partId || "part2");
      setStage("result");
    }
  }, []);

  // Document title.
  useEffect(() => {
    const prev = document.title;
    document.title =
      "Score my speaking — free IELTS speaking evaluation · IELTS Ace";
    return () => {
      document.title = prev;
    };
  }, []);

  // Auto-scroll to report when it lands.
  useEffect(() => {
    if (stage === "result" && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [stage]);

  // Prep countdown for Part 2.
  useEffect(() => {
    if (stage !== "prep") return undefined;
    if (prepRemaining <= 0) {
      setStage("record");
      // Kick off mic the moment the prep timer ends.
      recorder.start();
      return undefined;
    }
    const t = setTimeout(() => setPrepRemaining((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, prepRemaining, recorder]);

  // Once the recorder lands a blob, submit it.
  useEffect(() => {
    if (stage !== "record") return;
    if (recorder.state === "stopped" && recorder.blob) {
      submitRecording(recorder.blob, recorder.durationSec);
    }
    if (recorder.state === "error" && recorder.error) {
      setErrorMsg(recorder.error);
      setStage("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.state, recorder.blob]);

  const startTrial = () => {
    setErrorMsg("");
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (part.id === "part2") {
      setPrepRemaining(60);
      setStage("prep");
    } else {
      setStage("record");
      recorder.start();
    }
  };

  const stopRecordingNow = () => {
    recorder.stop();
  };

  const submitRecording = async (blob, durationSec) => {
    setStage("submit");
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("audio", blob, `trial-${part.id}.webm`);
      fd.append("email", email.trim().toLowerCase());
      fd.append("part", part.id);
      fd.append("cue_card_prompt", part.prompt);
      fd.append("cue_card_bullets", (part.bullets || []).join("\n"));
      fd.append("user_language", languageWireCode || "en");
      fd.append("target_band", "7.0");
      fd.append("duration_seconds", String(durationSec || 0));
      fd.append("client_request_id", genRequestId());

      const res = await fetch(`${API_URL}/api/speaking/evaluate-anonymous`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        let detail = null;
        try {
          const body = await res.json();
          detail = body?.detail;
        } catch {
          /* keep null */
        }

        if (res.status === 402 && detail?.code === "anon_quota_exhausted") {
          setPartUsed(detail.part_used || null);
          setStage("quota");
          return;
        }

        // Map common Azure / pipeline failures to actionable mic-permission
        // guidance. Anything else falls through to the raw detail message.
        const detailCode = detail?.code || "";
        const detailMsg = (typeof detail === "string" && detail) || detail?.message || "";
        const combined = `${detailCode} ${detailMsg}`;
        const isNoMatch = /NoMatch|no\s*match|no_speech|no\s*speech/i.test(combined);
        const isTooShort = /audio_too_short|audio_too_small|too\s*short|too_short|min_seconds|min_bytes/i.test(combined);

        let message;
        if (isTooShort) {
          message = "Your reply was shorter than 5 seconds. When the question appears, take a breath and answer in full sentences for at least 5–10 seconds before stopping.";
        } else if (isNoMatch) {
          message = "We couldn't hear your response. Check your browser's microphone permission (the lock icon in the URL bar → Microphone = Allow), confirm the right input device is selected, and speak in full sentences for at least 5–10 seconds.";
        } else {
          message = detailMsg || "Evaluation failed. Please try again in a moment.";
        }
        setErrorMsg(message);
        setStage("error");
        return;
      }

      const data = await res.json();
      setResult(data);
      setSubmittedPart(part.id);
      saveCache({ result: data, partId: part.id });
      setStage("result");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[PublicSpeakingTrial] network error", err);
      setErrorMsg(
        "We couldn't reach the evaluator. Check your connection and try again.",
      );
      setStage("error");
    }
  };

  const tryAgain = () => {
    recorder.reset();
    setErrorMsg("");
    setStage("intro");
  };

  const adapted = useMemo(
    () => (result ? adaptSpeakingResult(result) : null),
    [result],
  );

  // -------- Render branches --------

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <PublicNav />
      <SampleBanner />

      {stage === "intro" && (
        <IntroForm
          email={email}
          setEmail={setEmail}
          partId={partId}
          setPartId={setPartId}
          errorMsg={errorMsg}
          onStart={startTrial}
        />
      )}

      {stage === "prep" && (
        <PrepStage
          part={part}
          remaining={prepRemaining}
          onSkip={() => setPrepRemaining(0)}
        />
      )}

      {stage === "record" && (
        <RecordStage
          part={part}
          elapsed={recorder.elapsedSec}
          isRecording={recorder.isRecording}
          onStop={stopRecordingNow}
        />
      )}

      {stage === "submit" && <SubmitStage />}

      {stage === "quota" && <QuotaStage partUsed={partUsed} />}

      {stage === "error" && (
        <ErrorStage message={errorMsg} onRetry={tryAgain} />
      )}

      {stage === "result" && adapted && (
        <div ref={reportRef}>
          <ResultMeta
            partId={submittedPart || "part2"}
            email={email}
          />
          <ResultsState data={adapted} />
          <ResultUpsell />
        </div>
      )}

      <PublicFooter />
      <MobileStickyCTA />
    </div>
  );
}

/* =========================================================
   Sub-views
   ========================================================= */

function IntroForm({ email, setEmail, partId, setPartId, errorMsg, onStart }) {
  return (
    <section className="mx-auto max-w-3xl px-5 sm:px-8 pt-10 pb-14">
      <nav className="text-[12px] text-slate-500 mb-3">
        <a href="/" className="hover:text-slate-700">
          Home
        </a>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700">Score my speaking</span>
      </nav>
      <h1
        className="text-[32px] sm:text-[40px] leading-tight font-semibold tracking-tight text-slate-900"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Score my speaking — free, one per email.
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600 text-[15px] leading-relaxed">
        Pick a Part. Record once. You'll get the same band score and
        word‑level pronunciation feedback a logged‑in student gets — Fluency,
        Lexical Resource, Grammar, Pronunciation. Read in‑browser. No PDF.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onStart();
        }}
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Email */}
        <div>
          <label
            htmlFor="ps-email"
            className="block text-[13px] font-medium text-slate-700 mb-1.5"
          >
            Your email
            <span className="text-rose-600 ml-0.5">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="ps-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
          <p className="mt-1.5 text-[12px] text-slate-500">
            One evaluation per email, ever. We won't spam you.
          </p>
        </div>

        {/* Part picker */}
        <div>
          <div className="block text-[13px] font-medium text-slate-700 mb-2">
            Pick a Part
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PART_OPTIONS.map((p) => {
              const on = partId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPartId(p.id)}
                  className={
                    "text-left rounded-xl border p-4 transition " +
                    (on
                      ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300")
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-slate-500">
                      {p.label}
                    </span>
                    {p.recommended && (
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[15px] font-semibold text-slate-900">
                    {p.title}
                  </div>
                  <div className="mt-1 text-[12.5px] text-slate-500">
                    {p.blurb}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt preview */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-[11px] font-mono tracking-widest uppercase text-slate-500">
            What you'll answer
          </div>
          <div className="mt-1 text-[14.5px] text-slate-800 leading-relaxed">
            {PART_BY_ID[partId].prompt}
          </div>
          {PART_BY_ID[partId].bullets?.length > 0 && (
            <ul className="mt-2 text-[13px] text-slate-600 list-disc pl-5 space-y-0.5">
              {PART_BY_ID[partId].bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
              {PART_BY_ID[partId].andExplain && (
                <li className="italic">{PART_BY_ID[partId].andExplain}</li>
              )}
            </ul>
          )}
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Result stays in your browser for 10 minutes.
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[14px] px-5 py-2.5 rounded-xl shadow-[0_6px_22px_-8px_hsl(160_84%_39%/_0.55)]"
          >
            <Mic className="w-4 h-4" />
            {partId === "part2" ? "Start (60 s prep, then record)" : "Start recording"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-[12px] text-slate-500">
        Already used your free evaluation?{" "}
        <a
          href="/signup?intent=speaking&path=ielts"
          className="text-emerald-700 hover:underline font-medium"
        >
          Create an account
        </a>{" "}
        to keep practising.
      </p>
    </section>
  );
}

function PrepStage({ part, remaining, onSkip }) {
  return (
    <section className="mx-auto max-w-3xl px-5 sm:px-8 pt-10 pb-14">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-mono tracking-widest uppercase text-amber-800">
            {part.label} · prep
          </div>
          <div
            className="font-mono font-semibold text-2xl text-amber-900 tabular-nums"
            aria-live="polite"
          >
            {fmtMMSS(remaining)}
          </div>
        </div>
        <h2
          className="mt-3 text-[24px] sm:text-[28px] leading-tight font-semibold tracking-tight text-slate-900"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {part.prompt}
        </h2>
        {part.bullets?.length > 0 && (
          <ul className="mt-3 text-[14px] text-slate-700 list-disc pl-5 space-y-1">
            {part.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
            {part.andExplain && <li className="italic">{part.andExplain}</li>}
          </ul>
        )}
        <p className="mt-4 text-[13px] text-slate-600">
          You have one minute to think. Recording starts automatically when the
          timer hits zero — or skip ahead if you're ready.
        </p>
        <div className="mt-5">
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[13px] px-4 py-2 rounded-xl"
          >
            <Mic className="w-3.5 h-3.5" />
            Skip prep — start recording now
          </button>
        </div>
      </div>
    </section>
  );
}

function RecordStage({ part, elapsed, isRecording, onStop }) {
  const remaining = Math.max(0, part.maxSec - elapsed);
  const pct = Math.min(100, Math.round((elapsed / part.maxSec) * 100));

  return (
    <section className="mx-auto max-w-3xl px-5 sm:px-8 pt-10 pb-14">
      <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 sm:p-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-white/70">
            <span className="relative inline-flex">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {isRecording && (
                <span
                  className="absolute inset-0 w-2 h-2 rounded-full bg-rose-500 opacity-75 animate-ping"
                  style={{ animationDuration: "1.2s" }}
                />
              )}
            </span>
            {isRecording ? "Recording" : "Starting…"} · {part.label}
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono tracking-widest uppercase text-white/50">
              Remaining
            </div>
            <div
              className="font-mono font-semibold text-2xl text-white tabular-nums"
              aria-live="polite"
            >
              {fmtMMSS(remaining)}
            </div>
          </div>
        </div>

        <h2
          className="mt-6 text-[20px] sm:text-[22px] leading-snug font-medium text-white/90"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {part.prompt}
        </h2>
        {part.bullets?.length > 0 && (
          <ul className="mt-2 text-[13px] text-white/70 list-disc pl-5 space-y-0.5">
            {part.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
            {part.andExplain && <li className="italic">{part.andExplain}</li>}
          </ul>
        )}

        {/* Progress bar */}
        <div className="mt-8 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-rose-500 transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-[12px] text-white/50">
            We auto‑stop at {fmtMMSS(part.maxSec)}. Speak naturally.
          </div>
          <button
            type="button"
            onClick={onStop}
            className="inline-flex items-center gap-1.5 bg-white text-slate-900 font-medium text-[14px] px-5 py-2.5 rounded-xl hover:bg-white/90"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop & evaluate
          </button>
        </div>
      </div>
    </section>
  );
}

function SubmitStage() {
  return (
    <section className="mx-auto max-w-3xl px-5 sm:px-8 pt-16 pb-20 text-center">
      <Loader2 className="w-7 h-7 mx-auto text-emerald-600 animate-spin" />
      <h2
        className="mt-4 text-[22px] sm:text-[26px] leading-tight font-semibold tracking-tight text-slate-900"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Liz is grading your answer…
      </h2>
      <p className="mt-2 text-slate-600 text-[14px]">
        Transcribing, scoring against the four criteria, and flagging
        word‑level pronunciation. About 20–40 seconds.
      </p>
    </section>
  );
}

function QuotaStage({ partUsed }) {
  const partLabel = partUsed && PART_BY_ID[partUsed]?.label;
  return (
    <section className="mx-auto max-w-2xl px-5 sm:px-8 pt-14 pb-20 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-800">
        <Lock className="w-5 h-5" />
      </div>
      <h2
        className="mt-4 text-[24px] sm:text-[28px] leading-tight font-semibold tracking-tight text-slate-900"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        You've already used this email's free evaluation
      </h2>
      <p className="mt-2 text-slate-600 text-[14.5px] leading-relaxed">
        {partLabel
          ? `You tried ${partLabel} this week. `
          : "Free trial used this week. "}
        Sign in to a paid plan to keep practising every Part — unlimited cards,
        full pronunciation, Liz's notes saved to your journal.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href="/signup?intent=speaking&path=ielts"
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[14px] px-5 py-2.5 rounded-xl shadow-[0_6px_22px_-8px_hsl(160_84%_39%/_0.55)]"
        >
          Create free account
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
        <a
          href="/pricing/v2"
          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium text-[14px] px-5 py-2.5 rounded-xl border border-slate-200 bg-white"
        >
          See pricing
        </a>
      </div>
    </section>
  );
}

function ErrorStage({ message, onRetry }) {
  return (
    <section className="mx-auto max-w-2xl px-5 sm:px-8 pt-14 pb-20 text-center">
      <h2
        className="text-[22px] sm:text-[26px] leading-tight font-semibold tracking-tight text-slate-900"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Something went wrong
      </h2>
      <p className="mt-2 text-slate-600 text-[14.5px] leading-relaxed">
        {message || "We couldn't finish the evaluation. Please try again."}
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[14px] px-5 py-2.5 rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Try again
        </button>
      </div>
    </section>
  );
}

function ResultMeta({ partId, email }) {
  const part = PART_BY_ID[partId] || PART_BY_ID.part2;
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-10 pb-2">
      <nav className="text-[12px] text-slate-500 mb-3">
        <a href="/" className="hover:text-slate-700">
          Home
        </a>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700">Score my speaking</span>
      </nav>
      <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-slate-500">
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          {part.label} · {part.title}
        </span>
        {email && <span>· {email}</span>}
        <span>· View‑only · 10 min</span>
      </div>
    </section>
  );
}

function ResultUpsell() {
  return (
    <section className="mx-auto max-w-3xl px-5 sm:px-8 pb-14">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8 text-center">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700">
          View-only report
        </div>
        <h2
          className="mt-2 text-[22px] sm:text-[28px] leading-tight font-semibold tracking-tight text-slate-900"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Want to try the other Parts?
        </h2>
        <p className="mt-2 max-w-xl mx-auto text-slate-600 text-[14px] leading-relaxed">
          This report fades from your browser in about 10 minutes — no
          download. Create a free account to keep your transcripts, get
          Liz's drills, and practise unlimited cue cards.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href="/signup?intent=speaking&path=ielts"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[14px] px-5 py-2.5 rounded-xl shadow-[0_6px_22px_-8px_hsl(160_84%_39%/_0.55)]"
          >
            Create free account
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
