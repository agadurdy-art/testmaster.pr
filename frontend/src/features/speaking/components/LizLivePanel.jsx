import React, { useEffect, useState } from 'react';
import { useLizLive } from '../hooks/useLizLive';

const API_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || '';

/**
 * LizLivePanel — Smart Practice Part 1 / Part 3 conversational mode.
 *
 * Replaces the monologue prep→record flow for the parts where IELTS
 * actually has examiner Q&A: Part 1 (warm-up) and Part 3 (discussion).
 * Part 2 keeps the existing cue-card monologue path because there's
 * nothing for Liz to respond to during a 2-minute long-turn.
 *
 * Lifecycle:
 *   topic input → Start → connecting → ready → conversation → End → recap
 *
 * The recap shows the full transcript so the candidate can review what
 * was actually said. We don't run scoring here yet — Faz 3.5 will hand
 * the candidate audio (collected server-side, count surfaced via the
 * `closed` payload) to the unified evaluator.
 */
export default function LizLivePanel({ part, onExit, user }) {
  // `topic` is the free-text seed; `selectedTopic` is the course-catalogue
  // chip the user picked. We send whichever is non-empty (chip wins) so the
  // examiner prompt is anchored to a real lesson topic instead of "anything".
  const [topic, setTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicsError, setTopicsError] = useState(null);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const live = useLizLive();

  const partLabel = part === 'part3' ? 'Part 3 — Discussion' : 'Part 1 — Warm-up';

  // Pull the 47-topic catalogue from the backend on mount. We optionally
  // filter by the user's target band so a B1 candidate isn't served
  // advanced-only topics (registry handles the gating).
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (typeof user?.target_band === 'number') {
      const tb = user.target_band;
      const band =
        tb >= 7 ? '7.0-9.0' : tb >= 5.5 ? '5.5-6.5' : '4.0-5.0';
      params.set('band_level', band);
    }
    const qs = params.toString() ? `?${params.toString()}` : '';
    fetch(`${API_BASE}/api/speaking/topics${qs}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTopics(Array.isArray(data?.topics) ? data.topics : []);
        setTopicsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setTopicsError(err?.message || 'Could not load topics');
        setTopicsLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.target_band]);

  const effectiveTopic = (selectedTopic?.name || topic.trim() || '').trim();

  const handleStart = async () => {
    setStarted(true);
    await live.start({
      part,
      topic: effectiveTopic || null,
      // Faz 3.5: pass user identity so the server runs the evaluator on the
      // candidate audio after the session ends. Anonymous sessions skip this.
      userId: user?.id || null,
      userLanguage: user?.feedback_language || 'en',
      targetBand: typeof user?.target_band === 'number' ? user.target_band : 7.0,
    });
  };

  const handleEnd = () => {
    live.stop();
  };

  const handleReset = () => {
    live.stop();
    setStarted(false);
  };

  // ---- pre-start screen ------------------------------------------------
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {partLabel}
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mt-1">
            Practice Live with Liz
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Liz will ask you questions like a real IELTS examiner. Speak naturally —
            she will follow up, just like in the test. There's no feedback during the
            conversation; you'll see your transcript at the end.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              Pick a topic
            </label>
            {selectedTopic && (
              <button
                type="button"
                onClick={() => setSelectedTopic(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Clear
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Liz will run the conversation on the topic you choose, using
            questions drawn from the relevant course lessons.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {topicsLoading && (
              <span className="text-xs text-slate-400">Loading topics…</span>
            )}
            {topicsError && !topicsLoading && (
              <span className="text-xs text-rose-600">
                Couldn't load topics ({topicsError}). Type one below instead.
              </span>
            )}
            {!topicsLoading && !topicsError && topics.length === 0 && (
              <span className="text-xs text-slate-500">
                No topics yet — type one below.
              </span>
            )}
            {topics.map((t) => {
              const on = selectedTopic?.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedTopic(on ? null : t);
                    if (!on) setTopic(''); // chip wins; clear free-text
                  }}
                  className={
                    'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
                    (on
                      ? 'border-violet-600 bg-violet-600 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-violet-400 hover:bg-violet-50')
                  }
                >
                  {t.name}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <label htmlFor="liz-topic" className="block text-xs font-medium text-slate-600">
              Or type your own topic
            </label>
            <input
              id="liz-topic"
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (e.target.value.trim()) setSelectedTopic(null);
              }}
              placeholder={part === 'part3' ? 'e.g. The role of technology in education' : 'e.g. Hometown, Hobbies, Work'}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onExit}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleStart}
            disabled={!effectiveTopic}
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm"
          >
            {effectiveTopic ? `Start: ${effectiveTopic}` : 'Pick a topic to start'}
          </button>
        </div>
      </div>
    );
  }

  // ---- conversation / recap -------------------------------------------
  const isConnecting = live.state === 'connecting';
  const isLive = live.state === 'ready';
  const isEvaluating = live.state === 'evaluating';
  const hasEnded = live.state === 'ended' || live.state === 'error';

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {partLabel}
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mt-1">
            {hasEnded ? 'Conversation transcript' : 'Live with Liz'}
          </h2>
        </div>
        <StatusBadge
          isConnecting={isConnecting}
          isLive={isLive}
          isExaminer={live.isExaminerSpeaking}
          isCandidate={live.isCandidateSpeaking}
          isEvaluating={isEvaluating}
          hasEnded={hasEnded}
        />
      </div>

      {live.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {live.error}
        </div>
      )}

      <div className="space-y-4">
        <TranscriptBlock
          label="Liz"
          text={live.examinerTranscript}
          accent="violet"
        />
        <TranscriptBlock
          label="You"
          text={live.candidateTranscript}
          accent="slate"
        />
      </div>

      {(isEvaluating || live.evaluationResult || live.evaluationError) && (
        <EvaluationCard
          isEvaluating={isEvaluating}
          result={live.evaluationResult}
          error={live.evaluationError}
        />
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onExit}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back
        </button>
        {hasEnded ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Try another topic
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleEnd}
            disabled={isConnecting || isEvaluating}
            className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm"
          >
            {isEvaluating ? 'Scoring…' : 'End conversation'}
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ isConnecting, isLive, isExaminer, isCandidate, isEvaluating, hasEnded }) {
  if (hasEnded) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1">
        Ended
      </span>
    );
  }
  if (isEvaluating) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
        Scoring…
      </span>
    );
  }
  if (isConnecting) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Connecting…
      </span>
    );
  }
  if (isLive && isExaminer) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-medium px-3 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
        Liz speaking
      </span>
    );
  }
  if (isLive && isCandidate) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Listening to you
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Live
    </span>
  );
}

function EvaluationCard({ isEvaluating, result, error }) {
  if (isEvaluating && !result && !error) {
    return (
      <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4 text-sm text-indigo-900">
        <div className="font-semibold">Scoring your conversation…</div>
        <div className="opacity-70 mt-0.5">
          Liz is reviewing what you said. This usually takes 10–20 seconds.
        </div>
      </div>
    );
  }
  if (error) {
    // Most-common Azure / pipeline failures map to actionable user guidance.
    // Anything else falls through to the raw error string.
    const raw = String(error || '');
    const isNoMatch = /NoMatch|no\s*match|no_speech|no\s*speech/i.test(raw);
    const isTooShort = /audio_too_short|too\s*short|too_short|min_seconds/i.test(raw);
    const isMicLikely = isNoMatch || isTooShort
      || /audio_too_small|empty|silen[ct]e|no\s*audio/i.test(raw);

    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-semibold">
          {isMicLikely
            ? "We couldn't hear your response"
            : "Couldn't score this session"}
        </div>
        {isMicLikely ? (
          <div className="opacity-80 mt-1 leading-relaxed">
            {isTooShort
              ? "Your reply was shorter than 5 seconds. When Liz asks a question, take a breath and answer in full sentences for at least 5–10 seconds before tapping End conversation."
              : "Liz heard the question but couldn't pick up a clear answer from your microphone. Try this:"}
            <ul className="mt-2 list-disc pl-5 space-y-0.5">
              <li>Check your browser's microphone permission (the lock icon in the URL bar → Microphone = Allow).</li>
              <li>Confirm the right input device is selected in your system audio settings (not a Bluetooth headset that's powered off).</li>
              <li>Speak in full sentences for at least 5–10 seconds when Liz asks a question.</li>
              <li>Close other apps that might be holding the microphone (Zoom, FaceTime, Discord).</li>
            </ul>
          </div>
        ) : (
          <div className="opacity-80 mt-0.5">{raw}</div>
        )}
      </div>
    );
  }
  if (!result) return null;
  // Result follows the SpeakingEvaluationResult contract — same shape the
  // monologue ResultsState consumes. Surface the four-criterion overview
  // here; full results UI hookup is a follow-up task.
  const scores = result.scores || {};
  const items = [
    { key: 'overall', label: 'Overall' },
    { key: 'fc', label: 'Fluency & Coherence' },
    { key: 'lr', label: 'Lexical Resource' },
    { key: 'gra', label: 'Grammar' },
    { key: 'pr', label: 'Pronunciation' },
  ];
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
        Estimated band
      </div>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map(({ key, label }) => (
          <div key={key} className="bg-white rounded-md border border-emerald-100 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">
              {label}
            </div>
            <div className="text-xl font-semibold text-slate-900">
              {typeof scores[key] === 'number' ? scores[key].toFixed(1) : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TranscriptBlock({ label, text, accent }) {
  const accentClasses = accent === 'violet'
    ? 'border-violet-200 bg-violet-50/50 text-violet-900'
    : 'border-slate-200 bg-slate-50 text-slate-900';
  return (
    <div className={`rounded-lg border ${accentClasses} p-4`}>
      <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
        {label}
      </div>
      <div className="mt-1 text-sm leading-relaxed whitespace-pre-wrap min-h-[1.5rem]">
        {text || <span className="opacity-40">…</span>}
      </div>
    </div>
  );
}
