import React, { useCallback, useEffect, useRef, useState } from 'react';
import StructuredResultsLayout from './StructuredResultsLayout';
import { mintClientRequestId } from '../../../lib/clientRequestId';

/**
 * Structured per-question Smart Practice flow for IELTS Part 1 and Part 3.
 *
 * Replaces the Liz conversational flow (LiveConversation) for Part 1/3 on
 * /speaking-practice. Each question is presented one at a time:
 *   1. Liz reads the question (TTS audio fetched from the speaking set).
 *   2. The user can replay the question.
 *   3. The user records their answer (per-question audio blob).
 *   4. After all questions are answered, the whole batch is submitted to
 *      POST /api/speaking-practice/evaluate-structured which returns
 *      per-question observations + audio_urls. StructuredResultsLayout
 *      renders the Q1/Q2/.../Qn tab switcher.
 *
 * See memory: project_speaking_practice_v2_refactor.md
 */

const API_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || '';

// Each speaking set has a `part1` / `part2` / `part3` block. We pull the
// right one based on what the candidate picked.
const PART_KEY = {
  part1: 'part1',
  part3: 'part3',
};

// IELTS Part 1 is typically 4–5 question chunks, Part 3 is open-ended
// follow-ups (4 is a sensible default for both — keeps each session under
// ~5 min total).
const MAX_QUESTIONS_PER_PART = 4;

// Hard cap on each per-question recording. Real IELTS Part 1 answers run
// ~15–30s; we allow up to 60s before auto-stopping so the candidate has
// room to expand without losing the recording.
const MAX_RECORD_SECONDS = 60;

// Speaking sets store Part 1/3 questions in a few shapes depending on vintage:
// a flat `questions` array, `sample_questions`, or grouped under `topics` /
// `discussion_topics`. Pull from whichever is present so a set isn't reported
// as empty just because of its shape.
function extractQuestions(block) {
  if (!block || typeof block !== 'object') return [];
  if (Array.isArray(block.questions) && block.questions.length) return block.questions;
  if (Array.isArray(block.sample_questions) && block.sample_questions.length) return block.sample_questions;
  if (Array.isArray(block.topics)) {
    const qs = block.topics.flatMap((t) => (t && Array.isArray(t.questions) ? t.questions : []));
    if (qs.length) return qs;
  }
  if (Array.isArray(block.discussion_topics)) {
    const qs = block.discussion_topics.flatMap((dt) => (dt && Array.isArray(dt.questions) ? dt.questions : []));
    if (qs.length) return qs;
  }
  return [];
}

async function fetchRandomSet(part) {
  const modulesRes = await fetch(`${API_BASE}/api/speaking/modules`);
  if (!modulesRes.ok) {
    throw new Error(`Module list failed: ${modulesRes.status}`);
  }
  const modulesBody = await modulesRes.json();
  const sets = modulesBody.modules || modulesBody.sets || [];
  if (!sets.length) throw new Error('No speaking sets available');

  // Shuffle and try sets until one actually has questions for this part — a
  // single malformed/empty set no longer dead-ends the whole flow.
  const order = sets.map((_, i) => i).sort(() => Math.random() - 0.5);
  let lastErr = null;
  for (const idx of order) {
    const pick = sets[idx];
    const setId = pick.set_id || pick.id;
    if (!setId) continue;
    try {
      const setRes = await fetch(
        `${API_BASE}/api/speaking/set/${encodeURIComponent(setId)}?include_audio=true&mode=practice`,
      );
      if (!setRes.ok) { lastErr = new Error(`Set fetch failed: ${setRes.status}`); continue; }
      const setBody = await setRes.json();
      const block = setBody[PART_KEY[part]] || {};
      const raw = extractQuestions(block);
      if (!raw.length) continue; // try the next set
      const trimmed = raw.slice(0, MAX_QUESTIONS_PER_PART).map((q, i) => ({
        index: i + 1,
        id: q.id || `${setId}_${part}_q${i + 1}`,
        text: (typeof q === 'string' ? q : (q.text || q.question)) || `Question ${i + 1}`,
        audioUrl: (typeof q === 'object' && q.audio_url) || null,
        targetTime: (typeof q === 'object' && q.target_time) || 15,
        maxTime: (typeof q === 'object' && q.max_time) || 25,
      }));
      return {
        setId,
        title: setBody.title || pick.title || 'Speaking practice',
        topic: setBody.topic || null,
        questions: trimmed,
        intro: block.intro || null,
      };
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) throw lastErr;
  throw new Error('No speaking set has questions for this part yet.');
}

function pickRecordingMime() {
  if (typeof window === 'undefined' || !('MediaRecorder' in window)) return '';
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
  return candidates.find((m) => window.MediaRecorder.isTypeSupported?.(m)) || '';
}

function fileExtFromMime(mime) {
  if (!mime) return 'webm';
  if (mime.includes('wav')) return 'wav';
  if (mime.includes('ogg')) return 'ogg';
  return 'webm';
}

/**
 * QuestionAudio — Liz reads the question. Single <audio> element so replay
 * is gapless and the file doesn't redownload.
 */
function QuestionAudio({ audioUrl, autoplayKey }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!audioUrl) return;
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    const p = el.play();
    if (p?.catch) p.catch(() => {});
  }, [audioUrl, autoplayKey]);

  if (!audioUrl) {
    return (
      <div className="text-[12px] text-slate-500">
        (No examiner audio — read the question and answer.)
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
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[12px] font-medium hover:bg-slate-800"
      >
        {playing ? '⏸ Pause' : '🔁 Replay question'}
      </button>
    </div>
  );
}

/**
 * UserAudioReview — small preview player for the candidate's recording.
 */
function UserAudioReview({ blobUrl }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  if (!blobUrl) return null;
  const toggle = () => {
    const el = ref.current;
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
        ref={ref}
        src={blobUrl}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[12px] font-medium hover:bg-emerald-200"
      >
        {playing ? '⏸ Pause' : '▶ Hear my answer'}
      </button>
    </div>
  );
}

export default function StructuredQuestionFlow({ part, user, onExit }) {
  // phases: loading | question | recording | reviewing | submitting | results | error
  const [phase, setPhase] = useState('loading');
  const [error, setError] = useState(null);
  const [setMeta, setSetMeta] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  // recordings[i] = { index, question, blob, blobUrl, mime, durationSeconds }
  const [recordings, setRecordings] = useState([]);
  const [recordRemaining, setRecordRemaining] = useState(MAX_RECORD_SECONDS);
  const [scoreResult, setScoreResult] = useState(null);

  // MediaRecorder refs
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const recordStartedAtRef = useRef(null);
  const clientRequestIdRef = useRef(null);

  // 1. Fetch questions on mount.
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
        setRecordings([]);
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

  // Cleanup MediaRecorder on unmount
  useEffect(() => () => stopAndReleaseMic(true), []);

  const stopAndReleaseMic = useCallback((silent = false) => {
    try {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    } catch (_) {
      if (!silent) {
        // swallow — releasing mic must never throw
      }
    }
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
  }, []);

  // 2. Start recording — invoked when the user hits "Record".
  const startRecording = useCallback(async () => {
    if (phase === 'recording') return;
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone unavailable in this browser');
      }
      if (typeof window === 'undefined' || !('MediaRecorder' in window)) {
        throw new Error('MediaRecorder unavailable in this browser');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mime = pickRecordingMime();
      const rec = mime
        ? new window.MediaRecorder(stream, { mimeType: mime })
        : new window.MediaRecorder(stream);
      mediaRecorderRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        const finalMime = rec.mimeType || mime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: finalMime });
        chunksRef.current = [];
        const durationSeconds = recordStartedAtRef.current
          ? Math.max(1, Math.round((Date.now() - recordStartedAtRef.current) / 1000))
          : MAX_RECORD_SECONDS - recordRemaining;
        const blobUrl = blob.size > 0 ? URL.createObjectURL(blob) : null;
        setRecordings((prev) => {
          const copy = [...prev];
          copy[activeIdx] = {
            index: activeIdx + 1,
            question: setMeta?.questions?.[activeIdx]?.text,
            blob,
            blobUrl,
            mime: finalMime,
            durationSeconds,
          };
          return copy;
        });
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        setPhase('reviewing');
      };

      rec.start();
      recordStartedAtRef.current = Date.now();
      setRecordRemaining(MAX_RECORD_SECONDS);
      setPhase('recording');

      // Auto-stop countdown
      recordTimerRef.current = setInterval(() => {
        setRecordRemaining((r) => {
          if (r <= 1) {
            clearInterval(recordTimerRef.current);
            recordTimerRef.current = null;
            // Defer to next tick so onstop fires with the final chunk.
            setTimeout(() => {
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
              }
            }, 0);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[StructuredQuestionFlow] mic error', err);
      const msg = err?.name === 'NotAllowedError'
        ? 'Microphone access denied. Enable it in your browser to record an answer.'
        : (err?.message || 'Could not start recording.');
      setError(msg);
      setPhase('error');
    }
  }, [phase, activeIdx, recordRemaining, setMeta]);

  const stopRecording = useCallback(() => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const retakeCurrent = useCallback(() => {
    // Drop the recording for the active index and re-enter the question state.
    setRecordings((prev) => {
      const copy = [...prev];
      if (copy[activeIdx]?.blobUrl) {
        try { URL.revokeObjectURL(copy[activeIdx].blobUrl); } catch (_) {}
      }
      copy[activeIdx] = undefined;
      return copy;
    });
    setPhase('question');
  }, [activeIdx]);

  const advance = useCallback(() => {
    const total = setMeta?.questions?.length || 0;
    if (activeIdx + 1 < total) {
      setActiveIdx(activeIdx + 1);
      setPhase('question');
    } else {
      submitAllAnswers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, setMeta]);

  // 3. Submit — multipart with question_qN / audio_qN per question.
  const submitAllAnswers = useCallback(async () => {
    if (!user?.id) {
      setError('You need to be logged in to submit. Please refresh and try again.');
      setPhase('error');
      return;
    }
    if (!recordings.some((r) => r?.blob)) {
      setError('No recordings to submit yet.');
      setPhase('error');
      return;
    }

    setPhase('submitting');
    if (!clientRequestIdRef.current) {
      clientRequestIdRef.current = mintClientRequestId();
    }

    const form = new FormData();
    form.append('user_id', user.id);
    form.append('part', part);
    form.append('user_language', user.feedback_language || 'en');
    form.append('target_band', String(user.target_band || 7.0));
    form.append('client_request_id', clientRequestIdRef.current);
    if (setMeta?.setId) form.append('set_id', setMeta.setId);
    if (setMeta?.topic) form.append('topic', setMeta.topic);

    let attached = 0;
    recordings.forEach((rec, idx) => {
      if (!rec?.blob) return; // skip empty slots
      const qNumber = idx + 1;
      const filename = `q${qNumber}-${Date.now()}.${fileExtFromMime(rec.mime)}`;
      form.append(`question_q${qNumber}`, rec.question || setMeta?.questions?.[idx]?.text || `Question ${qNumber}`);
      form.append(`audio_q${qNumber}`, rec.blob, filename);
      form.append(`duration_q${qNumber}`, String(rec.durationSeconds || 0));
      attached += 1;
    });

    if (attached === 0) {
      setError('No recordings to submit yet.');
      setPhase('error');
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/speaking-practice/evaluate-structured`,
        { method: 'POST', body: form },
      );
      if (!res.ok) {
        let detail;
        try {
          const body = await res.json();
          detail = body?.detail?.message || body?.detail || `HTTP ${res.status}`;
        } catch {
          detail = `HTTP ${res.status}`;
        }
        throw new Error(typeof detail === 'string' ? detail : 'Evaluation failed');
      }
      const result = await res.json();
      setScoreResult(result);
      setPhase('results');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[StructuredQuestionFlow] submit failed', err);
      setError(err.message || 'We couldn\'t reach the evaluator. Please try again.');
      setPhase('error');
    }
  }, [user, part, recordings, setMeta]);

  // ─── Render ───────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
          Loading speaking set…
        </div>
        <p className="mt-3 text-slate-600">
          Picking a fresh {part === 'part1' ? 'Part 1' : 'Part 3'} prompt set with Liz.
        </p>
      </section>
    );
  }

  if (phase === 'error') {
    return (
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Something went wrong</h2>
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

  if (phase === 'submitting') {
    return (
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        <p className="mt-4 text-slate-600">
          Liz is listening to every answer and writing per-question feedback…
        </p>
        <p className="mt-1 text-[12px] text-slate-400">
          This usually takes 20–40 seconds.
        </p>
      </section>
    );
  }

  if (phase === 'results' && scoreResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700">
              {part === 'part1' ? 'Part 1' : 'Part 3'} · per-question feedback
            </div>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              {setMeta?.title || 'Speaking practice results'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="text-[13px] text-slate-600 hover:text-slate-900"
          >
            Back to part selector
          </button>
        </div>
        <StructuredResultsLayout feedback={scoreResult} />
      </div>
    );
  }

  const totalQuestions = setMeta?.questions?.length || 0;
  const question = setMeta?.questions?.[activeIdx];
  const progress = `${activeIdx + 1} / ${totalQuestions}`;
  const currentRecording = recordings[activeIdx];

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

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <QuestionAudio audioUrl={question?.audioUrl} autoplayKey={activeIdx} />
          {question?.targetTime && (
            <span className="text-[11px] text-slate-500">
              Target ~{question.targetTime}s · max {question.maxTime}s
            </span>
          )}
        </div>

        {/* Recording controls */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          {phase === 'question' && (
            <>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-3">
                Your answer
              </div>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">
                Listen to the question (you can replay it any time), then hit
                Record. We'll capture your answer per question — up to {MAX_RECORD_SECONDS}s each.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-[14px]"
                >
                  ● Record answer
                </button>
                {totalQuestions > 0 && activeIdx > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 font-medium text-[14px]"
                  >
                    ← Previous
                  </button>
                )}
              </div>
            </>
          )}

          {phase === 'recording' && (
            <>
              <div className="flex items-center gap-3">
                <span className="inline-block w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <div className="text-[13px] text-rose-700 font-medium">
                  Recording… {recordRemaining}s left
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[14px]"
                >
                  ■ Stop & review
                </button>
              </div>
              <p className="mt-3 text-[12px] text-slate-500">
                Hit stop when you're done — or wait for the timer to end.
              </p>
            </>
          )}

          {phase === 'reviewing' && currentRecording?.blob && (
            <>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700 mb-3">
                Answer captured · {currentRecording.durationSeconds}s
              </div>
              <UserAudioReview blobUrl={currentRecording.blobUrl} />
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={advance}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[14px]"
                >
                  {activeIdx + 1 < totalQuestions ? 'Next question →' : 'Submit all answers →'}
                </button>
                <button
                  type="button"
                  onClick={retakeCurrent}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 font-medium text-[14px]"
                >
                  ↺ Retake this answer
                </button>
              </div>
              <p className="mt-3 text-[12px] text-slate-500">
                You can replay yourself before moving on. Liz scores all
                answers together once you submit the final one.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Per-Q progress dots */}
      {totalQuestions > 0 && (
        <div className="mt-6 flex items-center gap-1.5 justify-center">
          {setMeta.questions.map((q, idx) => {
            const isActive = idx === activeIdx;
            const isAnswered = !!recordings[idx]?.blob;
            return (
              <span
                key={q.id || idx}
                title={`Question ${idx + 1}`}
                className={`w-2.5 h-2.5 rounded-full ${
                  isAnswered
                    ? 'bg-emerald-500'
                    : isActive
                    ? 'bg-slate-900'
                    : 'bg-slate-300'
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
