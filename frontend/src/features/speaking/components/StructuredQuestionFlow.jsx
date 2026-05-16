import React, { useEffect, useRef, useState } from 'react';

/**
 * Structured per-question Smart Practice flow for IELTS Part 1 and Part 3.
 *
 * Replaces the Liz conversational flow (LiveConversation) for Part 1/3 on
 * /speaking-practice. Each question is presented one at a time:
 *   1. Liz reads the question (TTS audio fetched from the speaking set).
 *   2. The user can replay the question audio.
 *   3. The user records their answer (per-question audio blob).
 *   4. After all questions are answered, the whole batch is submitted to
 *      POST /api/speaking-practice/evaluate-structured which returns
 *      per-question observations + audio_urls. StructuredResultsLayout
 *      renders the Q1/Q2/.../Qn tab switcher with playback.
 *
 * This file ships the Stage-1+2 shell:
 *   - State machine + question fetch wiring
 *   - Liz audio playback with a replay button
 *   - MediaRecorder shell (record state UI only — submit happens in Stage 3+)
 *
 * Stage 3 will wire MediaRecorder → per-question audio blob, Stage 4 will
 * fire the multipart submit, Stage 5 will mount StructuredResultsLayout
 * inside the V2 chrome. See memory: project_speaking_practice_v2_refactor.
 */

const API_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || '';

// Map Part 1 / Part 3 to the speaking-set field that holds their questions.
// Each set in content/speaking/speaking_sets.py has `part1`, `part2`, `part3`
// blocks; we pull the right one based on what the candidate picked.
const PART_KEY = {
  part1: 'part1',
  part3: 'part3',
};

const MAX_QUESTIONS_PER_PART = 4;

async function fetchRandomSet(part) {
  // 1. List available modules (sets) filtered by speaking track.
  const modulesRes = await fetch(`${API_BASE}/api/speaking/modules`);
  if (!modulesRes.ok) {
    throw new Error(`Module list failed: ${modulesRes.status}`);
  }
  const modulesBody = await modulesRes.json();
  const sets = modulesBody.modules || modulesBody.sets || [];
  if (!sets.length) {
    throw new Error('No speaking sets available');
  }
  // Pick a random set so consecutive sessions don't repeat the same prompts.
  const pick = sets[Math.floor(Math.random() * sets.length)];
  const setId = pick.set_id || pick.id;

  // 2. Fetch the set detail in practice mode so we get question text + audio
  // url for every Part 1 / Part 3 question.
  const setRes = await fetch(
    `${API_BASE}/api/speaking/set/${encodeURIComponent(setId)}?include_audio=true&mode=practice`,
  );
  if (!setRes.ok) {
    throw new Error(`Set fetch failed: ${setRes.status}`);
  }
  const setBody = await setRes.json();

  const block = setBody[PART_KEY[part]] || {};
  const raw = Array.isArray(block.questions) ? block.questions : [];
  const trimmed = raw.slice(0, MAX_QUESTIONS_PER_PART).map((q, idx) => ({
    index: idx + 1,
    id: q.id,
    text: q.text || `Question ${idx + 1}`,
    audioUrl: q.audio_url || null,
    targetTime: q.target_time || 15,
    maxTime: q.max_time || 25,
  }));

  return {
    setId,
    title: setBody.title || pick.title || 'Speaking practice',
    questions: trimmed,
    intro: block.intro || null,
  };
}

/**
 * MiniPlayer — Liz reads the question. The replay button reuses the same
 * audio element so it's gapless and doesn't redownload.
 */
function QuestionAudio({ audioUrl, onEnded }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // Auto-play once when the audio source appears. Browsers may block this if
  // the page hasn't had a user gesture yet; that's fine — we show a play
  // button as the visible affordance.
  useEffect(() => {
    if (!audioUrl) return;
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    const promise = el.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        // Autoplay blocked — user can hit the play/replay button manually.
      });
    }
  }, [audioUrl]);

  if (!audioUrl) {
    return (
      <div className="text-[12px] text-slate-500">
        (No examiner audio available for this question — read it and answer.)
      </div>
    );
  }

  const handleToggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.currentTime = 0;
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          if (onEnded) onEnded();
        }}
      />
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[12px] font-medium hover:bg-slate-800"
        aria-label={playing ? 'Pause question' : 'Replay question'}
      >
        {playing ? '⏸ Pause' : '🔁 Replay question'}
      </button>
    </div>
  );
}

/**
 * Public component — wired into SpeakingPractice.jsx for part1/part3.
 *
 * onComplete is called with `{ questions: [{question, audioBlob, transcript, durationSeconds}], setId }`
 * once every question has a recorded answer. Stage 3 will wire that handler
 * to the multipart submit. Stage 5 will swap the trivial in-component
 * results placeholder for StructuredResultsLayout.
 */
export default function StructuredQuestionFlow({ part, user, onExit }) {
  const [phase, setPhase] = useState('loading'); // loading | question | record | review | submitting | error
  const [error, setError] = useState(null);
  const [setMeta, setSetMeta] = useState(null); // { setId, title, intro, questions: [...] }
  const [activeIdx, setActiveIdx] = useState(0); // index into setMeta.questions
  const [recordings, setRecordings] = useState([]); // [{ index, blob, transcript, durationSeconds }, ...]

  // 1. Fetch questions on mount. Bail out cleanly if the API is unreachable.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const meta = await fetchRandomSet(part);
        if (cancelled) return;
        if (!meta.questions.length) {
          setError('This part has no questions in the selected set.');
          setPhase('error');
          return;
        }
        setSetMeta(meta);
        setActiveIdx(0);
        setPhase('question');
      } catch (err) {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error('[StructuredQuestionFlow] fetch failed', err);
        setError(err.message || 'Failed to load questions');
        setPhase('error');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [part]);

  const question = setMeta?.questions?.[activeIdx];
  const totalQuestions = setMeta?.questions?.length || 0;
  const progress = totalQuestions ? `${activeIdx + 1} / ${totalQuestions}` : '—';

  // Stage-2 placeholder: clicking "Next" simulates moving to the next question.
  // Stage 3 will replace this with the actual MediaRecorder flow.
  const handleSkipToNext = () => {
    setRecordings((prev) => [
      ...prev,
      {
        index: activeIdx + 1,
        question: question?.text,
        blob: null,
        transcript: null,
        durationSeconds: 0,
      },
    ]);
    if (activeIdx + 1 < totalQuestions) {
      setActiveIdx(activeIdx + 1);
    } else {
      setPhase('review');
    }
  };

  if (phase === 'loading') {
    return (
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
          Loading speaking set…
        </div>
        <p className="mt-3 text-slate-600">Picking a fresh {part === 'part1' ? 'Part 1' : 'Part 3'} prompt set with Liz.</p>
      </section>
    );
  }

  if (phase === 'error') {
    return (
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Couldn't load questions</h2>
        <p className="mt-3 text-slate-600">{error}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[14px]"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={onExit}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 font-medium text-[14px]"
          >
            Back
          </button>
        </div>
      </section>
    );
  }

  if (phase === 'review') {
    return (
      <section className="max-w-3xl mx-auto px-6 py-14">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700">
          All {totalQuestions} questions answered
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Ready to submit your answers for grading?
        </h2>
        <p className="mt-3 text-slate-600 text-[14px] leading-relaxed">
          Liz will score every question individually — fluency, vocabulary,
          grammar, and pronunciation. You'll see a tab per question with the
          recording and her notes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-[14px] opacity-60 cursor-not-allowed"
          >
            Submit for grading (Stage 4 will wire this)
          </button>
          <button
            type="button"
            onClick={onExit}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 font-medium text-[14px]"
          >
            Discard & exit
          </button>
        </div>
        <p className="mt-4 text-[12px] text-slate-500">
          {recordings.filter((r) => r.blob).length} of {totalQuestions} answers
          recorded · the rest are placeholders from Stage-1/2 shell.
        </p>
      </section>
    );
  }

  // phase === 'question'
  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700">
          {part === 'part1' ? 'Part 1 · Familiar topics' : 'Part 3 · Abstract discussion'} · {progress}
        </div>
        <button
          type="button"
          onClick={onExit}
          className="text-[12px] text-slate-500 hover:text-slate-800"
        >
          Exit
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {setMeta?.title && (
          <div className="text-[12px] text-slate-500 mb-2">
            Topic: <span className="font-medium text-slate-700">{setMeta.title}</span>
          </div>
        )}

        <h2 className="text-[24px] sm:text-[28px] font-semibold text-slate-900 leading-snug">
          {question?.text}
        </h2>

        <div className="mt-4 flex items-center gap-2">
          <QuestionAudio audioUrl={question?.audioUrl} />
          {question?.targetTime && (
            <span className="text-[11px] text-slate-500">
              Target ~{question.targetTime}s · max {question.maxTime}s
            </span>
          )}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-3">
            Your answer
          </div>
          <p className="text-[14px] text-slate-600">
            Stage-2 shell: the record button + transcript live here. Stage 3
            will wire MediaRecorder so each answer becomes a per-question
            audio blob.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 text-white font-semibold text-[14px] opacity-60 cursor-not-allowed"
            >
              ● Record (Stage 3)
            </button>
            <button
              type="button"
              onClick={handleSkipToNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 font-medium text-[14px]"
            >
              {activeIdx + 1 < totalQuestions ? 'Skip → next question' : 'Skip → review'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
