import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Mic, Play, Square } from "lucide-react";
import PublicNav from "../features/samples/components/PublicNav";
import SampleBanner from "../features/samples/components/SampleBanner";
import PublicFooter from "../features/samples/components/PublicFooter";
import SampleFAQ, {
  DEFAULT_SAMPLE_FAQ,
} from "../features/samples/components/SampleFAQ";
import MobileStickyCTA from "../features/samples/components/MobileStickyCTA";
import {
  PartSelector,
  PreparationState,
  RecordingState,
  ResultsState,
} from "../features/speaking";
import { DEFAULT_TOPICS_ON } from "../features/speaking/constants";
import "../features/speaking/speaking.css";

/**
 * Public sample: /samples/speaking/band-6-5-part2
 *
 * Static walkthrough of the D7 Claude Design Speaking Practice flow. Anon
 * visitors scroll through all four states (Selector → Prep → Recording →
 * Results) as a design preview — no interactive recording, no state
 * machine. Click handlers are no-ops; the only live CTA is "Start free
 * speaking trial" at the bottom, which routes to the interactive page.
 */

const NOOP = () => {};

// Candidate's full Part 2 monologue — read aloud via browser TTS when the
// user taps "Listen to sample". No audio asset required; works offline.
const SAMPLE_SCRIPT =
  "The person who has influenced me the most is my aunt Mai. She lives in Ha Noi and I have known her since I was a child. My aunt is a primary school teacher and she used to take care of me every summer when my parents were working. She is thoughtful, patient, and a little bit stubborn — qualities I try to copy. What I admire most is how she listens. When I was fifteen, I failed a maths exam and I was too embarrassed to tell my parents. I called her first. She didn't judge me, she just asked, \"What do you want to do through this?\" That thought stayed with me. From that moment, I learned to face difficulty instead of hiding from it.";

function useSampleSpeech() {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const play = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(SAMPLE_SCRIPT);
    u.rate = 0.95;
    u.pitch = 1.0;
    u.lang = "en-GB";
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    utterRef.current = u;
    setPlaying(true);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setPlaying(false);
  };

  return { playing, supported, play, stop };
}

export default function SampleReportSpeakingPart2() {
  const speech = useSampleSpeech();

  useEffect(() => {
    const prev = document.title;
    document.title =
      "Sample Band 6.5 Speaking Part 2 — full walkthrough · IELTS Ace";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <PublicNav />
      <SampleBanner />

      {/* Hero + state-chip navigator */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-10 pb-6">
        <nav
          className="text-[12px] text-slate-500 mb-3"
          aria-label="Breadcrumbs"
        >
          <a href="/" className="hover:text-slate-700">
            Home
          </a>
          <span className="mx-1.5">/</span>
          <span className="text-slate-700">Speaking · Band 6.5 · Part 2</span>
        </nav>
        <h1
          className="text-[32px] sm:text-[40px] leading-tight font-semibold tracking-tight text-slate-900"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          The full Speaking Practice — four states, one scroll.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600 text-[15px] leading-relaxed">
          Pick a part, prepare for sixty seconds, record for two minutes,
          read the feedback. This is every screen you'd see as a student —
          previewed end to end. Scroll through, then start when you're
          ready.
        </p>
        {speech.supported && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={speech.playing ? speech.stop : speech.play}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-[14px] transition-colors ${
                speech.playing
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {speech.playing ? (
                <>
                  <Square className="w-4 h-4" fill="currentColor" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" fill="currentColor" />
                  Listen to the sample monologue
                </>
              )}
            </button>
            <span className="text-[12px] text-slate-500">
              Read aloud by your browser · ~45 s
            </span>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="#s1-selector"
            className="text-[13px] px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
          >
            1 · Selector
          </a>
          <a
            href="#s2-prep"
            className="text-[13px] px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
          >
            2 · Prep
          </a>
          <a
            href="#s3-recording"
            className="text-[13px] px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
          >
            3 · Recording
          </a>
          <a
            href="#s4-results"
            className="text-[13px] px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
          >
            4 · Results
          </a>
        </div>
      </section>

      {/* Scroll-through of all four states — static preview, no handlers wired */}
      <div className="speaking-scope">
        <div id="s1-selector" style={{ scrollMarginTop: 80 }}>
          <PartSelector
            selectedPart="part2"
            onSelectPart={NOOP}
            onStart={NOOP}
            topics={DEFAULT_TOPICS_ON}
            onToggleTopic={NOOP}
            onClearTopics={NOOP}
          />
        </div>

        <div id="s2-prep" style={{ scrollMarginTop: 80 }}>
          <PreparationState
            prepRemaining={45}
            prepTotal={60}
            onAddThirty={NOOP}
            onSkipPrep={NOOP}
            onStartRecording={NOOP}
            onExit={NOOP}
          />
        </div>

        <div id="s3-recording" style={{ scrollMarginTop: 80 }}>
          <RecordingState
            recordRemaining={83}
            spokenWordCount={16}
            onStopEarly={NOOP}
          />
        </div>

        <div id="s4-results" style={{ scrollMarginTop: 80 }}>
          <ResultsState />
        </div>
      </div>

      {/* Bottom CTA — Start free speaking trial */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 sm:p-10 text-center">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700">
            Ready to try it?
          </div>
          <h2
            className="mt-2 text-[26px] sm:text-[32px] leading-tight font-semibold tracking-tight text-slate-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your turn — free, no card needed.
          </h2>
          <p className="mt-2 max-w-xl mx-auto text-slate-600 text-[15px] leading-relaxed">
            Start a real Part 2 practice: 60 s prep, 2 min recording, full
            pronunciation + band feedback.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a
              href="/speaking/v2"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[14px] px-5 py-2.5 rounded-xl shadow-[0_6px_22px_-8px_hsl(160_84%_39%/_0.55)]"
            >
              <Mic className="w-4 h-4" />
              Start free speaking trial
            </a>
            <a
              href="/samples/writing/band-6-5-task2"
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium text-[14px] px-5 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              See the writing sample
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ConversionBlock removed — see project_discount_email_capture.md */}
      <SampleFAQ items={DEFAULT_SAMPLE_FAQ} />
      <PublicFooter />
      <MobileStickyCTA />
    </div>
  );
}
