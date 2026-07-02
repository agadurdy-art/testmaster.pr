import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import {
  Clock, CheckCircle, Loader2, Mic, Square, SkipForward,
} from 'lucide-react';
import { toast } from 'sonner';
import { mintClientRequestId } from '../../../../lib/clientRequestId';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SPEAKING_TIMING = {
  part1: { questionTime: 25, questions: 9 },
  part2: { prepTime: 60, speakTime: 120 },
  part3: { questionTime: 75, questions: 5 }
};

// Speaking handlers — continuous-per-part recording
// Each part records as ONE continuous take. Sub-questions display on screen
// and the candidate paces themselves; mic stays open across sub-questions.
// Auto-stop ceilings keep parts within real-IELTS bounds (server schema also
// clamps duration_seconds ≤ 600).
const PART_KEYS = { 1: 'part1', 2: 'part2', 3: 'part3' };
const PART_MAX_DURATION = {
  1: 5 * 60 + 30, // ~5–6 min (9 short Q&As)
  2: SPEAKING_TIMING.part2.speakTime, // 120s monologue
  3: 5 * 60, // ~5 min discussion
};

// Full Test speaking section, extracted whole from pages/FullTestInterface.js
// (zero behavior change intended). Same ownership split as the Cambridge
// extraction (surfaces/cambridge/CambridgeSpeakingSection.jsx):
//
// These stay in the PAGE and arrive as props because they are shared with the
// rest of the test flow:
//   - recordings / setRecordings: read by the page's bottom submit bar
//     (speakingReady = all 3 part blobs present).
//   - speakingState / setSpeakingState: the page disables its submit button
//     while EVALUATING, so the state machine position must be page-visible.
//   - setSubmitting / setShowConfirmSubmit: the page owns the confirm-submit
//     modal (shared with writing); the submit path here drives its spinner
//     and closes it in `finally`, exactly as before.
//   - onSpeakingResult(fulltestEval): the holistic result threads into the
//     page's sectionAnswers/completedSections and continues the flow
//     (navigate in single-section mode, completeTest otherwise).
//   - submitRef: page-owned ref this component fills with its
//     submitFullTestSpeaking, because the page's submitCurrentSection (confirm
//     modal Submit + section time-up) is what triggers the speaking submit.
// Everything else (part cursor, prep/auto-stop timers, MediaRecorder
// plumbing, the idempotent client_request_id) is speaking-only and lives here.
export default function FullTestSpeakingSection({
  sectionData,
  testId,
  sessionId,
  recordings,
  setRecordings,
  speakingState,
  setSpeakingState,
  setSubmitting,
  setShowConfirmSubmit,
  onSpeakingResult,
  submitRef,
}) {
  // Speaking specific (continuous-per-part — one Blob per part for /api/speaking/evaluate-fulltest)
  // speakingState lifecycle:
  //   IDLE → (Part 2 only: PREP 60s) → RECORDING → PROCESSING → PART_DONE
  //   PART_DONE → IDLE (next part) | ALL_DONE (after Part 3)
  //   ALL_DONE → EVALUATING (multipart POST) → submit complete
  const [speakingPart, setSpeakingPart] = useState(1);
  const [speakingQuestion, setSpeakingQuestion] = useState(0); // eslint-disable-line no-unused-vars
  const [partTimeRemaining, setPartTimeRemaining] = useState(0);
  const [prepTimeRemaining, setPrepTimeRemaining] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const questionAudioRef = useRef(null); // eslint-disable-line no-unused-vars
  const recordingStartRef = useRef(null);
  // True while startSpeakingRecording's async getUserMedia is in flight —
  // blocks a second concurrent start (double mic stream). See Faz 1 note.
  const speakingStartingRef = useRef(false);
  // Stable across retries of the same Full Test speaking submission. Minted on
  // the first submit, reused on retries (so backend idempotency cache hits),
  // rotated to null only after a successful response.
  const speakingClientRequestIdRef = useRef(null);

  const formatTimeShort = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSpeakingRecording = async () => {
    // Re-entrancy guard (Faz 1): the prep-timer watcher can only fire this
    // once, but getUserMedia is async — a second call during that gap would
    // open two mic streams and orphan one recorder.
    if (speakingStartingRef.current) return;
    speakingStartingRef.current = true;
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      recordingStartRef.current = Date.now();
      const partAtStart = speakingPart;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const partKey = PART_KEYS[partAtStart];
        const duration = (Date.now() - recordingStartRef.current) / 1000;
        setRecordings(prev => ({
          ...prev,
          [partKey]: { blob: audioBlob, url: URL.createObjectURL(audioBlob), duration },
        }));
        stream.getTracks().forEach(track => track.stop());
        setSpeakingState('PART_DONE');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setSpeakingState('RECORDING');
      setSpeakingQuestion(0);
      setPartTimeRemaining(PART_MAX_DURATION[partAtStart]);
    } catch (error) {
      toast.error('Could not access microphone');
    } finally {
      speakingStartingRef.current = false;
    }
  };

  const stopSpeakingRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setSpeakingState('PROCESSING');
    }
  };

  const advanceToNextPart = () => {
    if (speakingPart < 3) {
      setSpeakingPart(prev => prev + 1);
      setSpeakingQuestion(0);
      setSpeakingState('IDLE');
    } else {
      setSpeakingState('ALL_DONE');
    }
  };

  // Timers are state-driven with separate zero-watchers (Faz 1, 2026-07-02):
  // the old versions called stopSpeakingRecording()/startSpeakingRecording()
  // INSIDE the setState updater — updaters can run twice under StrictMode/
  // concurrent rendering, which risks a double mic-stop or double getUserMedia.

  // Auto-stop timer for active recording (caps part duration)
  useEffect(() => {
    let interval;
    if (speakingState === 'RECORDING' && partTimeRemaining > 0) {
      interval = setInterval(() => {
        setPartTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [speakingState, partTimeRemaining]);

  useEffect(() => {
    if (speakingState === 'RECORDING' && partTimeRemaining === 0) {
      stopSpeakingRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakingState, partTimeRemaining]);

  // Part 2 prep timer: counts down 60s before speaking
  useEffect(() => {
    let interval;
    if (speakingState === 'PREP' && prepTimeRemaining > 0) {
      interval = setInterval(() => {
        setPrepTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [speakingState, prepTimeRemaining]);

  useEffect(() => {
    if (speakingState === 'PREP' && prepTimeRemaining === 0) {
      // Auto-start recording when prep ends (re-entrancy guarded).
      startSpeakingRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakingState, prepTimeRemaining]);

  const startPart2Prep = () => {
    setSpeakingState('PREP');
    setPrepTimeRemaining(SPEAKING_TIMING.part2.prepTime);
  };

  // Build multipart FormData and POST to /api/speaking/evaluate-fulltest.
  // Stores the holistic result on state and threads it into sectionAnswers
  // so completeTest forwards it to the backend (which short-circuits the
  // legacy speaking evaluator when fulltest_eval is present).
  const submitFullTestSpeaking = async () => {
    setSubmitting(true);
    setSpeakingState('EVALUATING');
    try {
      const speaking = sectionData;
      const partsMeta = [1, 2, 3].map(p => speaking?.parts?.[p - 1] || {});

      // Validate all 3 parts have recordings
      for (let p = 1; p <= 3; p++) {
        if (!recordings[`part${p}`]?.blob) {
          throw new Error(`Part ${p} recording missing`);
        }
      }

      const formData = new FormData();
      const userId = (() => {
        try { return JSON.parse(localStorage.getItem('user'))?.id; } catch { return null; }
      })();
      if (userId) formData.append('user_id', userId);
      formData.append('user_language', 'en');
      formData.append('target_band', '7.0');
      // Mint once and reuse on retry so the backend idempotency cache can
      // de-dupe repeat POSTs (e.g., user double-clicks submit, or a transient
      // network error retries). sessionId is stable per attempt but absent in
      // some entry paths; fall back to a minted UUID rather than Date.now().
      if (!speakingClientRequestIdRef.current) {
        speakingClientRequestIdRef.current =
          sessionId || `fulltest_${testId}_${mintClientRequestId()}`;
      }
      formData.append('client_request_id', speakingClientRequestIdRef.current);
      formData.append('test_id', testId);

      [1, 2, 3].forEach((p, idx) => {
        const partKey = `part${p}`;
        const rec = recordings[partKey];
        const meta = partsMeta[idx];
        formData.append(`${partKey}_audio`, rec.blob, `${partKey}.webm`);

        let cuePrompt = '';
        let cueBullets = [];
        if (p === 2 && meta.cue_card) {
          cuePrompt = meta.cue_card.topic || meta.description || `Part ${p}`;
          cueBullets = meta.cue_card.points || [];
        } else {
          const qTexts = (meta.questions || [])
            .map(q => q.text || q.question || '')
            .filter(Boolean);
          cuePrompt = qTexts.length
            ? qTexts.join('\n')
            : (meta.description || `Part ${p}`);
        }
        formData.append(`${partKey}_cue_card_prompt`, cuePrompt.slice(0, 1000));
        // Backend expects newline-separated bullets (see _split_bullets in
        // routes/speaking_unified.py). Sending JSON here used to produce an
        // unsplit `["a","b"]` literal that broke Sonnet's structured prompt.
        formData.append(
          `${partKey}_cue_card_bullets`,
          cueBullets.slice(0, 6).filter(Boolean).join('\n'),
        );
        formData.append(
          `${partKey}_duration_seconds`,
          String(Math.min(600, Math.round(rec.duration || 0))),
        );
      });

      const res = await fetch(`${API_URL}/api/speaking/evaluate-fulltest`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Backend raises HTTPException(detail={code, message, attempts, last_error}).
        // Old code stringified the object as "[object Object]" which hid the
        // real failure. Pull the message out so the toast is actionable.
        const detail = data?.detail;
        let msg;
        if (typeof detail === 'string') {
          msg = detail;
        } else if (detail && typeof detail === 'object') {
          msg = detail.message || detail.code || JSON.stringify(detail);
        } else {
          msg = `HTTP ${res.status}`;
        }
        const err = new Error(msg);
        err.detail = detail;
        err.status = res.status;
        throw err;
      }
      // Rotate the request id so a subsequent retake (rare but possible)
      // doesn't collide with the now-stored idempotency entry.
      speakingClientRequestIdRef.current = null;
      // Threads the result into sectionAnswers/completedSections and
      // continues the flow (navigate in single-section mode, completeTest
      // otherwise) — that cross-section state lives in the page.
      onSpeakingResult(data);
    } catch (err) {
      console.error('Speaking submit error:', err);
      toast.error(`Speaking evaluation failed: ${err.message || 'Please try again'}`);
      setSpeakingState('ALL_DONE');
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  // Expose the submit path to the page: submitCurrentSection (confirm modal
  // Submit + section time-up) routes speaking through this ref while the
  // POST itself and its state machine live here.
  submitRef.current = submitFullTestSpeaking;

  // ============ RENDER SPEAKING SECTION ============
  const speaking = sectionData;
  const currentPartData = speaking?.parts?.[speakingPart - 1];
  const partKey = `part${speakingPart}`;
  const partRecording = recordings[partKey];
  const allPartsRecorded = ['part1', 'part2', 'part3'].every(k => recordings[k]?.blob);

  // Per-part progress strip (top of section)
  const progressStrip = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map(p => {
        const k = `part${p}`;
        const done = !!recordings[k];
        const active = p === speakingPart;
        return (
          <div
            key={p}
            className={`px-3 py-1 rounded-full text-sm border ${
              done
                ? 'bg-green-50 border-green-300 text-green-700'
                : active
                  ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            Part {p}{done ? ' ✓' : ''}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="max-w-3xl mx-auto p-6">
        {progressStrip}

        <h2 className="text-2xl font-bold text-slate-900 mb-2">Part {speakingPart}</h2>
        <p className="text-slate-600 mb-6">{currentPartData?.description}</p>

        {/* Part 2: Cue card */}
        {speakingPart === 2 && currentPartData?.cue_card && (
          <Card className="p-6 bg-amber-50 border-2 border-amber-300 mb-6">
            <h3 className="font-bold text-amber-900 mb-3">Cue Card</h3>
            <p className="text-lg text-slate-800 mb-3">{currentPartData.cue_card.topic}</p>
            <p className="text-sm text-slate-600 mb-2">You should say:</p>
            <ul className="list-disc list-inside space-y-1">
              {currentPartData.cue_card.points?.map((point, idx) => (
                <li key={idx} className="text-slate-700">{point}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Parts 1 & 3: question list (shown on screen for self-paced answering) */}
        {(speakingPart === 1 || speakingPart === 3) && (
          <Card className="p-6 bg-slate-50 mb-6">
            <p className="text-sm text-slate-500 mb-3">
              Recording will run continuously across all questions in Part {speakingPart}.
              Read each question and answer naturally; click <strong>End Part</strong> when done.
            </p>
            <ol className="list-decimal list-inside space-y-2">
              {(currentPartData?.questions || []).map((q, idx) => (
                <li key={q.id || idx} className="text-slate-800">
                  {q.text || q.question || ''}
                </li>
              ))}
            </ol>
          </Card>
        )}

        {/* Recording controls */}
        <Card className="p-6 mt-6">
          {speakingState === 'RECORDING' && (
            <div className="text-3xl font-mono font-bold text-red-600 text-center mb-4">
              {formatTimeShort(partTimeRemaining)}
            </div>
          )}
          {speakingState === 'PREP' && (
            <div className="text-center mb-4">
              <div className="text-3xl font-mono font-bold text-amber-600 mb-1">
                {formatTimeShort(prepTimeRemaining)}
              </div>
              <p className="text-sm text-slate-600">Preparation time — make notes if you wish</p>
            </div>
          )}

          <div className="flex justify-center gap-4">
            {speakingState === 'IDLE' && !partRecording && speakingPart === 2 && (
              <Button onClick={startPart2Prep} className="bg-amber-500 hover:bg-amber-600">
                <Clock className="w-5 h-5 mr-2" /> Start 60s Preparation
              </Button>
            )}
            {speakingState === 'IDLE' && !partRecording && speakingPart !== 2 && (
              <Button onClick={startSpeakingRecording} className="bg-red-500 hover:bg-red-600">
                <Mic className="w-5 h-5 mr-2" /> Start Part {speakingPart} Recording
              </Button>
            )}
            {speakingState === 'PREP' && (
              <Button onClick={startSpeakingRecording} className="bg-red-500 hover:bg-red-600">
                <Mic className="w-5 h-5 mr-2" /> Start Speaking Now
              </Button>
            )}
            {speakingState === 'RECORDING' && (
              <Button onClick={stopSpeakingRecording} variant="destructive">
                <Square className="w-5 h-5 mr-2" /> End Part {speakingPart}
              </Button>
            )}
            {(speakingState === 'PART_DONE' || (speakingState === 'IDLE' && partRecording)) && (
              <Button
                onClick={advanceToNextPart}
                disabled={!partRecording}
                className="bg-slate-900 hover:bg-slate-800"
              >
                {speakingPart < 3
                  ? <><SkipForward className="w-5 h-5 mr-2" /> Continue to Part {speakingPart + 1}</>
                  : <><CheckCircle className="w-5 h-5 mr-2" /> All parts recorded</>}
              </Button>
            )}
            {speakingState === 'EVALUATING' && (
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                Evaluating your full test…
              </div>
            )}
          </div>

          {/* Playback for the just-recorded part */}
          {partRecording?.url && speakingState !== 'EVALUATING' && (
            <div className="mt-4 flex justify-center">
              <audio src={partRecording.url} controls className="w-full max-w-md" />
            </div>
          )}
        </Card>

        {/* Final submit hint when all 3 parts recorded */}
        {allPartsRecorded && speakingState !== 'EVALUATING' && (
          <Card className="p-4 mt-4 bg-green-50 border-green-200 text-center">
            <p className="text-sm text-green-800">
              All three parts recorded. Click <strong>Submit speaking</strong> below to receive
              your holistic IELTS evaluation.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
