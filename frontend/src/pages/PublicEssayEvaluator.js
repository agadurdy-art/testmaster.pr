import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Mail, Loader2, PenLine, ShieldCheck } from "lucide-react";
import PublicNav from "../features/samples/components/PublicNav";
import SampleBanner from "../features/samples/components/SampleBanner";
import PublicFooter from "../features/samples/components/PublicFooter";
import MobileStickyCTA from "../features/samples/components/MobileStickyCTA";
import SampleReportHero from "../features/samples/components/SampleReportHero";
import AnnotatedEssayPanel from "../features/samples/components/AnnotatedEssayPanel";
import PublicScoreCard from "../features/samples/components/PublicScoreCard";
import {
  WritingEvaluationResult,
  verifyAnnotationOffsets,
} from "../features/evaluator/schemas/writingResult";
import { useI18n } from "../lib/i18n";
import { mintClientRequestId } from "../lib/clientRequestId";

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Public anonymous essay evaluator — `/score-my-essay`.
 *
 * Visitor enters email + task prompt + essay → backend runs the same v2
 * evaluator we use for logged-in users, but gates on a unique email so
 * each visitor can claim exactly one free report. No download, no PDF —
 * result is viewable in-browser only. sessionStorage keeps the report
 * alive for ~10 minutes so an accidental refresh or navigation doesn't
 * discard what they just earned.
 *
 * See project memory: project_anonymous_essay_evaluation.md
 */

const CACHE_KEY = "publicEvalResult_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Matches the backend regex in server.py. Intentionally loose — we're
// validating shape, not deliverability.
const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

const TASK_OPTIONS = [
  { value: "task2", label: "Task 2 · Essay (most common)" },
  { value: "task1_academic", label: "Task 1 Academic · Chart / Graph / Map" },
  { value: "task1_general", label: "Task 1 General · Letter" },
];

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
    /* sessionStorage may be disabled — that's fine, we just lose the cache */
  }
}

function countWords(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

export default function PublicEssayEvaluator() {
  const { languageWireCode } = useI18n();
  const [email, setEmail] = useState("");
  // Marketing opt-in — defaults to off (GDPR/CAN-SPAM friendly: never
  // pre-check). Backend records the flag on the eval document and, if a
  // Resend audience is configured, adds the contact to the broadcast list.
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [taskType, setTaskType] = useState("task2");
  const [prompt, setPrompt] = useState("");
  const [essay, setEssay] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [submittedEssay, setSubmittedEssay] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  // Async-mode success state — set after the backend has accepted the
  // submission and queued the eval for email delivery. Carries the user's
  // email back so we can echo it in the confirmation copy.
  const [queued, setQueued] = useState(null); // { email, estimatedMinutes }
  const reportRef = useRef(null);
  // Stable id across retries — backend dedups same-id submissions for
  // 10 minutes to avoid double-billing Sonnet. See lib/clientRequestId.js.
  const clientRequestIdRef = useRef(null);

  // Restore cached result on mount so accidental reloads don't nuke the report.
  useEffect(() => {
    const cached = loadCache();
    if (cached && cached.result) {
      setResult(cached.result);
      setSubmittedEssay(cached.essay || "");
      setSubmittedPrompt(cached.prompt || "");
    }
  }, []);

  // Document head
  useEffect(() => {
    const prev = document.title;
    document.title = "Score my own essay — free IELTS writing evaluation · IELTS Ace";
    return () => {
      document.title = prev;
    };
  }, []);

  // Auto-scroll to the report when it arrives.
  useEffect(() => {
    if (result && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const essayWordCount = useMemo(() => countWords(essay), [essay]);
  const minWords = taskType === "task2" ? 200 : 120;

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!prompt.trim()) {
      setErrorMsg("Paste the task prompt you were answering.");
      return;
    }
    if (essayWordCount < minWords) {
      setErrorMsg(
        `Your essay is too short (${essayWordCount} words). Minimum for scoring is ${minWords}.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      if (!clientRequestIdRef.current) clientRequestIdRef.current = mintClientRequestId();
      // Async endpoint: accepts payload, returns 202 with a token, runs the
      // eval in a background task, and emails the user when it's ready. No
      // more ~3-minute spinning UI — they close the tab and read the email.
      const res = await fetch(`${API_URL}/api/public/evaluate-essay/async`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          task_type: taskType,
          prompt: prompt.trim(),
          essay: essay.trim(),
          user_language: languageWireCode || "en",
          client_request_id: clientRequestIdRef.current,
          marketing_consent: marketingConsent,
        }),
      });

      if (!res.ok) {
        let detail = "Evaluation failed. Please try again in a moment.";
        try {
          const body = await res.json();
          if (typeof body?.detail === "string") detail = body.detail;
          else if (body?.detail?.message) detail = body.detail.message;
        } catch {
          /* keep default message */
        }
        if (res.status === 409) {
          detail =
            detail ||
            "This email has already used its free evaluation. Create an account to keep practising.";
        }
        setErrorMsg(detail);
        return;
      }

      const data = await res.json();
      // Three queue states from the backend: queued / pending / complete.
      // For complete (idempotent retry that already finished) we still send
      // the user to the success screen — the email + token URL are the
      // primary delivery channel, not an inline result render.
      setQueued({
        email: cleanEmail,
        estimatedMinutes: data?.estimated_minutes ?? 3,
        token: data?.token || null,
        alreadyComplete: data?.status === "complete",
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[PublicEssayEvaluator] network error", err);
      setErrorMsg(
        "We couldn't reach the evaluator. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const heroConfig = result && {
    crumbs: [
      { label: "Home", href: "/" },
      { label: "Score my essay" },
    ],
    title: (
      <>
        Your essay, graded as{" "}
        <span className="text-emerald-800">Cambridge would</span>.
      </>
    ),
    description:
      "Every highlight is a live piece of feedback. Click any annotation to read Liz's note inline, then act on the top weakness before your next attempt.",
    meta: [
      { label: "Question type", value: TASK_OPTIONS.find((t) => t.value === taskType)?.label || "Task 2" },
      { label: "Your length", value: `${result.word_count} words` },
      { label: "Evaluated in", value: "seconds", live: true },
    ],
    activeBand: result.overall_band.toFixed(1),
    tabs: [],
    pitch: "One evaluation per email · view-only, no download.",
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <PublicNav />
      {!result && !queued && <SampleBanner ctaLabel="Jump to evaluator" />}
      {result && (
        <div
          className="print:hidden border-b border-emerald-200/70"
          style={{
            background:
              "linear-gradient(90deg, hsl(160 60% 96%) 0%, hsl(160 60% 97%) 40%, hsl(199 90% 97%) 100%)",
          }}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-2.5 flex items-center gap-3 text-[13.5px]">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800">
              Your evaluation
            </span>
            <span className="text-slate-600">
              — view-only. Result stays in this browser for 10 minutes; we also
              emailed you a copy.
            </span>
          </div>
        </div>
      )}

      {/* ===== Success state (email sent) ===== */}
      {queued && !result && (
        <section className="mx-auto max-w-2xl px-5 sm:px-8 pt-16 pb-20 scroll-mt-24">
          <div className="rounded-2xl border border-emerald-200 bg-white p-8 sm:p-10 shadow-sm text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Mail className="w-7 h-7 text-emerald-700" />
            </div>
            <h1
              className="mt-5 text-[28px] sm:text-[32px] font-semibold tracking-tight text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {queued.alreadyComplete
                ? "We already emailed you this report."
                : "Your evaluation is on the way."}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              {queued.alreadyComplete ? (
                <>
                  This email has already claimed its free evaluation. Check
                  your inbox at <b>{queued.email}</b> — the link inside opens
                  the full interactive report.
                </>
              ) : (
                <>
                  We're grading your essay against Cambridge band descriptors
                  right now. You'll get an email at <b>{queued.email}</b> in
                  about {queued.estimatedMinutes}–{queued.estimatedMinutes + 2}{" "}
                  minutes — band, top fixes, and a link to the full
                  interactive report.
                </>
              )}
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              {queued.token && (
                <a
                  href={`/r/${queued.token}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[15px]"
                >
                  Open my report
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
              <a
                href="/signup?intent=writing&path=ielts"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 font-medium text-[15px]"
              >
                Create an account to keep practising
              </a>
            </div>

            <p className="mt-6 text-[12px] text-slate-500">
              Didn't get the email? Check spam, or{" "}
              <a href="/contact" className="text-emerald-700 hover:underline">
                contact support
              </a>
              .
            </p>
          </div>
        </section>
      )}

      {/* ===== Input form ===== */}
      {!result && !queued && (
        <section id="cta" className="mx-auto max-w-3xl px-5 sm:px-8 pt-10 pb-14 scroll-mt-24">
          <nav className="text-[12px] text-slate-500 mb-3">
            <a href="/" className="hover:text-slate-700">Home</a>
            <span className="mx-1.5">/</span>
            <span className="text-slate-700">Score my essay</span>
          </nav>
          <h1
            className="text-[32px] sm:text-[40px] leading-tight font-semibold tracking-tight text-slate-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Score my own essay — free, one per email.
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600 text-[15px] leading-relaxed">
            Paste your IELTS writing task below. You'll get the same inline
            feedback a logged-in student gets — Task Achievement, Coherence,
            Vocabulary, Grammar — read in-browser. No PDF, no download, no
            credit card.
          </p>

          <form
            onSubmit={submit}
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="pe-email"
                className="block text-[13px] font-medium text-slate-700 mb-1.5"
              >
                Your email
                <span className="text-rose-600 ml-0.5">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="pe-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={submitting}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 disabled:bg-slate-50"
                />
              </div>
              <p className="mt-1.5 text-[12px] text-slate-500">
                One evaluation per email, ever. No spam — unsubscribe in one
                click.
              </p>

              {/* Marketing opt-in — never pre-checked. */}
              <label
                htmlFor="pe-marketing"
                className="mt-3 flex items-start gap-2.5 cursor-pointer select-none"
              >
                <input
                  id="pe-marketing"
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  disabled={submitting}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
                />
                <span className="text-[12.5px] text-slate-600 leading-snug">
                  <b className="text-slate-800">Send me Liz's weekly IELTS
                  tips</b>{" "}
                  — band 5 → 7 in 8 weeks, with real lessons. Unsubscribe
                  anytime.
                </span>
              </label>
            </div>

            {/* Task type */}
            <div>
              <label
                htmlFor="pe-task"
                className="block text-[13px] font-medium text-slate-700 mb-1.5"
              >
                Task type
              </label>
              <select
                id="pe-task"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 disabled:bg-slate-50"
              >
                {TASK_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt */}
            <div>
              <label
                htmlFor="pe-prompt"
                className="block text-[13px] font-medium text-slate-700 mb-1.5"
              >
                Task prompt you were answering
                <span className="text-rose-600 ml-0.5">*</span>
              </label>
              <textarea
                id="pe-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                maxLength={4000}
                placeholder="Paste the exact question — e.g. Some people think modern technology has made our lives more convenient; others say it has created new problems…"
                disabled={submitting}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 disabled:bg-slate-50 resize-y"
              />
            </div>

            {/* Essay */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="pe-essay"
                  className="block text-[13px] font-medium text-slate-700"
                >
                  Your essay
                  <span className="text-rose-600 ml-0.5">*</span>
                </label>
                <span
                  className={`text-[12px] ${
                    essayWordCount >= minWords
                      ? "text-emerald-700"
                      : "text-slate-500"
                  }`}
                >
                  {essayWordCount} / {minWords}+ words
                </span>
              </div>
              <textarea
                id="pe-essay"
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                rows={14}
                maxLength={20000}
                placeholder="Paste your full essay here…"
                disabled={submitting}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 disabled:bg-slate-50 resize-y font-sans"
              />
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800">
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-[12px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Result stays in your browser for 10 minutes.
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[14px] px-5 py-2.5 rounded-xl shadow-[0_6px_22px_-8px_hsl(160_84%_39%/_0.55)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Evaluating your essay…
                  </>
                ) : (
                  <>
                    <PenLine className="w-4 h-4" />
                    Submit essay for scoring
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-[12px] text-slate-500">
            Already used your free evaluation?{" "}
            <a
              href="/signup?intent=writing&path=ielts"
              className="text-emerald-700 hover:underline font-medium"
            >
              Create an account
            </a>{" "}
            to keep practising.
          </p>
        </section>
      )}

      {/* ===== Result view (reuses the sample report layout) ===== */}
      {result && (
        <div ref={reportRef}>
          <SampleReportHero {...heroConfig} />

          <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-14">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
              <AnnotatedEssayPanel
                essayText={submittedEssay}
                annotations={result.inline_annotations}
                taskBadge={
                  TASK_OPTIONS.find((t) => t.value === taskType)?.label ||
                  "Task 2"
                }
                topicLabel="Your essay"
                timeTarget={taskType === "task2" ? "40 min target" : "20 min target"}
                prompt={submittedPrompt}
                wordCount={result.word_count}
                wordCountTarget={result.word_count_target}
                readTimeMinutes={Math.max(1, Math.round(result.word_count / 220))}
              />
              <PublicScoreCard
                result={result}
                targetBand={7.0}
                onScoreMyEssay={() => {
                  window.location.href =
                    "/signup?intent=writing&path=ielts";
                }}
              />
            </div>
          </section>

          {/* View-only reminder + signup nudge */}
          <section className="mx-auto max-w-3xl px-5 sm:px-8 pb-14">
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8 text-center">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700">
                View-only report
              </div>
              <h2
                className="mt-2 text-[22px] sm:text-[28px] leading-tight font-semibold tracking-tight text-slate-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Want to save this and try again?
              </h2>
              <p className="mt-2 max-w-xl mx-auto text-slate-600 text-[14px] leading-relaxed">
                This report will fade from your browser in about 10 minutes —
                there's no download. Create a free account to keep your
                reports, rewrite with Liz, and practise unlimited prompts.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <a
                  href="/signup?intent=writing&path=ielts"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[14px] px-5 py-2.5 rounded-xl shadow-[0_6px_22px_-8px_hsl(160_84%_39%/_0.55)]"
                >
                  Create free account
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>
        </div>
      )}

      <PublicFooter />
      <MobileStickyCTA />
    </div>
  );
}
