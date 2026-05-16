import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import PublicNav from "../features/samples/components/PublicNav";
import PublicFooter from "../features/samples/components/PublicFooter";
import MobileStickyCTA from "../features/samples/components/MobileStickyCTA";
import SampleReportHero from "../features/samples/components/SampleReportHero";
import AnnotatedEssayPanel from "../features/samples/components/AnnotatedEssayPanel";
import PublicScoreCard from "../features/samples/components/PublicScoreCard";
import {
  WritingEvaluationResult,
  verifyAnnotationOffsets,
} from "../features/evaluator/schemas/writingResult";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TASK_LABELS = {
  task2: "Task 2 · Essay",
  task1_academic: "Task 1 Academic · Chart / Graph / Map",
  task1_general: "Task 1 General · Letter",
};

/**
 * Tokenized anonymous evaluation report — `/r/:token`.
 *
 * Visitors land here from the email we sent after they submitted at
 * /score-my-essay. The token is opaque (UUID4 hex) and expires after 7
 * days. We GET the result from the backend and render the same full
 * interactive layout used in PublicEssayEvaluator's result view.
 *
 * Pending state (eval still running): show a polite "still cooking" panel
 * with a refresh button — the email will fire when it's actually done.
 */
export default function AnonEvalReportPage() {
  const { token } = useParams();
  const [state, setState] = useState({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/public/evaluate-essay/result/${encodeURIComponent(token)}`,
        );
        if (!res.ok) {
          let detail = "Report not found.";
          try {
            const body = await res.json();
            if (typeof body?.detail === "string") detail = body.detail;
          } catch {
            /* keep default */
          }
          if (cancelled) return;
          setState({ phase: "error", message: detail, status: res.status });
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        if (data?.status === "pending") {
          setState({ phase: "pending" });
          return;
        }
        const parsed = WritingEvaluationResult.safeParse(data.result);
        if (!parsed.success) {
          // eslint-disable-next-line no-console
          console.error("[AnonEvalReportPage] schema mismatch", parsed.error);
          setState({
            phase: "error",
            message: "Report data is malformed. Please contact support.",
            status: 500,
          });
          return;
        }
        const essayText = data.essay || "";
        const offsetErrors = verifyAnnotationOffsets(parsed.data, essayText);
        if (offsetErrors.length) {
          // eslint-disable-next-line no-console
          console.warn(
            "[AnonEvalReportPage] annotation offsets drifted",
            offsetErrors,
          );
        }
        setState({
          phase: "complete",
          result: parsed.data,
          essay: essayText,
          prompt: data.prompt || "",
          taskType: data.task_type || "task2",
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[AnonEvalReportPage] fetch failed", err);
        if (cancelled) return;
        setState({
          phase: "error",
          message: "We couldn't load this report. Check your connection.",
          status: 0,
        });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    const prev = document.title;
    document.title = "Your IELTS Ace evaluation · IELTS Ace";
    return () => {
      document.title = prev;
    };
  }, []);

  const heroConfig =
    state.phase === "complete" && state.result
      ? {
          crumbs: [
            { label: "Home", href: "/" },
            { label: "Your evaluation" },
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
            { label: "Question type", value: TASK_LABELS[state.taskType] || "Task 2" },
            { label: "Your length", value: `${state.result.word_count} words` },
            { label: "Evaluated by", value: "Liz (Sonnet 4.6)" },
          ],
          activeBand: state.result.overall_band.toFixed(1),
          tabs: [],
          pitch: "Tokenized report · valid for 7 days · view-only.",
        }
      : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <PublicNav />

      {state.phase === "loading" && (
        <section className="mx-auto max-w-2xl px-5 sm:px-8 pt-20 pb-20">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 mx-auto animate-spin" />
            <p className="mt-4 text-slate-600">Opening your report…</p>
          </div>
        </section>
      )}

      {state.phase === "pending" && (
        <section className="mx-auto max-w-2xl px-5 sm:px-8 pt-16 pb-20">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-8 sm:p-10 text-center">
            <h1
              className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Still grading your essay.
            </h1>
            <p className="mt-3 text-slate-600 text-[15px] leading-relaxed">
              This usually takes 2–4 minutes. We'll email you the moment it's
              ready — or you can refresh this page in a couple of minutes.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[14px]"
            >
              Refresh
            </button>
          </div>
        </section>
      )}

      {state.phase === "error" && (
        <section className="mx-auto max-w-2xl px-5 sm:px-8 pt-16 pb-20">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 text-center">
            <h1
              className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {state.status === 410 ? "This link has expired." : "Report not found."}
            </h1>
            <p className="mt-3 text-slate-600 text-[15px] leading-relaxed">
              {state.message ||
                "Tokenized links are valid for 7 days. Submit a new essay or create an account to keep your reports."}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/score-my-essay"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[15px]"
              >
                Score a new essay
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/signup?intent=writing&path=ielts"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 font-medium text-[15px]"
              >
                Create free account
              </a>
            </div>
          </div>
        </section>
      )}

      {state.phase === "complete" && heroConfig && (
        <>
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
                — view-only. Tokenized link valid for 7 days.
              </span>
            </div>
          </div>

          <SampleReportHero {...heroConfig} />

          <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-14">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
              <AnnotatedEssayPanel
                essayText={state.essay}
                annotations={state.result.inline_annotations}
                taskBadge={TASK_LABELS[state.taskType] || "Task 2"}
                topicLabel="Your essay"
                timeTarget={
                  state.taskType === "task2" ? "40 min target" : "20 min target"
                }
                prompt={state.prompt}
                wordCount={state.result.word_count}
                wordCountTarget={state.result.word_count_target}
                readTimeMinutes={Math.max(
                  1,
                  Math.round(state.result.word_count / 220),
                )}
              />
              <PublicScoreCard
                result={state.result}
                targetBand={7.0}
                onScoreMyEssay={() => {
                  window.location.href = "/signup?intent=writing&path=ielts";
                }}
              />
            </div>
          </section>

          <section className="mx-auto max-w-3xl px-5 sm:px-8 pb-14">
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8 text-center">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700">
                Tokenized report
              </div>
              <h2
                className="mt-2 text-[22px] sm:text-[28px] leading-tight font-semibold tracking-tight text-slate-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Want unlimited reports?
              </h2>
              <p className="mt-2 max-w-xl mx-auto text-slate-600 text-[14px] leading-relaxed">
                This link is valid for 7 days. Create a free account to keep
                your reports forever, rewrite with Liz, and practise unlimited
                prompts.
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
        </>
      )}

      <PublicFooter />
      <MobileStickyCTA />
    </div>
  );
}
