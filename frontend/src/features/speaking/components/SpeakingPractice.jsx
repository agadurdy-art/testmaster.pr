import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ConversationProvider } from '@elevenlabs/react';
import SpeakingHeader from './SpeakingHeader';
import PartSelector from './PartSelector';
import PreparationState from './PreparationState';
import RecordingState from './RecordingState';
import ResultsState from './ResultsState';
import ProcessingState from './ProcessingState';
import ErrorState from './ErrorState';
import StructuredQuestionFlow from './StructuredQuestionFlow';
import { useSpeakingFlow } from '../hooks/useSpeakingFlow';
import { pickRandomCueCard } from '../lib/pickCueCard';
import { adaptSpeakingResult } from '../lib/adaptSpeakingResult';
import useElevenLabsLiz from '../../liz/hooks/useElevenLabsLiz';
import VoiceOverlay from '../../liz/components/VoiceOverlay';
import FullTestFlow from './FullTestFlow';
import { mintClientRequestId } from '../../../lib/clientRequestId';
import '../../liz/liz.css';

// 2026-04-29: Part 1 + Part 3 are conversational, driven by ElevenLabs Liz
// (replaces Gemini Live). Part 2 remains the cue-card monologue flow.
const CONVERSATIONAL_PARTS = new Set(['part1', 'part3']);

// Full Test is gated to Monthly + Exam Pack (matches FULL_TEST_PLANS in
// backend/services/tier_resolver.py). Free / Weekly users see a locked card
// in PartSelector and a clean upgrade panel inside FullTestFlow if they
// somehow bypass the gate.
const FULL_TEST_PLANS = new Set(['monthly', 'exam', 'master']);

// /api/speaking/evaluate requires a non-empty cue_card_prompt, but Part 1/3
// don't have one — the meaningful prompts came from Liz at runtime. Send a
// stable label so the evaluator at least knows which part it's scoring.
const CONVERSATIONAL_CUE_LABEL = {
  part1: 'IELTS Speaking — Part 1 (familiar topics conversation with Liz)',
  part3: 'IELTS Speaking — Part 3 (abstract discussion connected to Part 2)',
};

async function submitLizSpeakingEval({ user, part, audioBlob, transcript, durationSecs, clientRequestId }) {
  const base = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || '';
  const ext = audioBlob.type.includes('wav') ? 'wav'
    : audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
  const form = new FormData();
  form.append('audio', audioBlob, `liz-${part}-${Date.now()}.${ext}`);
  form.append('user_id', user.id);
  form.append('part', part);
  form.append('cue_card_prompt', CONVERSATIONAL_CUE_LABEL[part] || `IELTS Speaking — ${part}`);
  // Pass the user-only transcript as a single bullet so Sonnet has the
  // candidate's verbatim speech as evidence even when Azure STT is conservative
  // on conversational utterances.
  form.append('cue_card_bullets', transcript || '');
  form.append('user_language', user.feedback_language || 'en');
  form.append('target_band', String(user.target_band || 7.0));
  form.append('duration_seconds', String(durationSecs || 0));
  form.append('context', 'practice');
  if (clientRequestId) form.append('client_request_id', clientRequestId);
  const resp = await fetch(`${base}/api/speaking/evaluate`, {
    method: 'POST',
    body: form,
  });
  if (!resp.ok) {
    let detail;
    try { detail = await resp.json(); } catch (_e) { detail = await resp.text(); }
    const msg = typeof detail === 'string'
      ? detail
      : (detail?.detail?.message || detail?.detail || `HTTP ${resp.status}`);
    throw new Error(msg);
  }
  return resp.json();
}

// Transcript-only grading for Liz Live when the parallel mic recording didn't
// capture usable audio. ElevenLabs still gives us a reliable user transcript,
// so the candidate gets a band + FC/LR/GRA (no pronunciation detail). Keeps the
// Liz Live flow from dead-ending on the part selector with no result.
async function submitLizTranscriptEval({ user, part, transcript, durationSecs, clientRequestId }) {
  const base = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || '';
  const form = new FormData();
  form.append('user_id', user.id);
  form.append('part', part);
  form.append('transcript', transcript || '');
  form.append('cue_card_prompt', CONVERSATIONAL_CUE_LABEL[part] || `IELTS Speaking — ${part}`);
  form.append('user_language', user.feedback_language || 'en');
  form.append('target_band', String(user.target_band || 7.0));
  form.append('duration_seconds', String(durationSecs || 0));
  form.append('context', 'practice');
  if (clientRequestId) form.append('client_request_id', clientRequestId);
  const resp = await fetch(`${base}/api/speaking/evaluate-transcript`, {
    method: 'POST',
    body: form,
  });
  if (!resp.ok) {
    let detail;
    try { detail = await resp.json(); } catch (_e) { detail = await resp.text(); }
    const msg = typeof detail === 'string'
      ? detail
      : (detail?.detail?.message || detail?.detail || `HTTP ${resp.status}`);
    throw new Error(msg);
  }
  return resp.json();
}

// Live conversation gate for Part 1/3 — auto-starts a Liz session inside the
// ConversationProvider, renders VoiceOverlay, and on session end posts the
// user-only audio + transcript to /api/speaking/evaluate so the candidate
// gets word-level pronunciation feedback (same surface as Part 2).
function LiveConversation({ part, user, onExit }) {
  const liz = useElevenLabsLiz({ userId: user?.id });
  const [started, setStarted] = useState(false);
  // 'live' → 'submitting' → 'results' | 'error'
  const [phase, setPhase] = useState('live');
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState(null);
  const submittedRef = useRef(false);
  const clientRequestIdRef = useRef(null);

  useEffect(() => {
    if (started || !user?.id) return;
    setStarted(true);
    liz.start({ part });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, user?.id, part]);

  // Liz session ended → flush user-only audio to /evaluate. Without captured
  // audio (mic denied, no user turns), fall back to the old "exit straight to
  // selector" behaviour so the user isn't stuck on a spinner.
  useEffect(() => {
    if (!liz.isEnded || submittedRef.current) return;
    submittedRef.current = true;

    const blob = liz.userAudioBlob;
    const transcript = liz.userTranscript;
    const durationSecs = liz.elapsedSeconds;

    // No usable audio AND no transcript → nothing to grade, exit cleanly.
    if (!blob && !(transcript && transcript.trim())) {
      onExit?.();
      liz.reset();
      return;
    }

    setPhase('submitting');
    if (!clientRequestIdRef.current) {
      clientRequestIdRef.current = mintClientRequestId();
    }
    // Prefer audio (gives pronunciation), but if the parallel recording failed
    // and we have the ElevenLabs transcript, grade from that so the candidate
    // ALWAYS reaches a results screen instead of being dumped back to the picker.
    const submitPromise = blob
      ? submitLizSpeakingEval({ user, part, audioBlob: blob, transcript, durationSecs, clientRequestId: clientRequestIdRef.current })
      : submitLizTranscriptEval({ user, part, transcript, durationSecs, clientRequestId: clientRequestIdRef.current });
    submitPromise
      .then((data) => {
        setScoreResult(data);
        clientRequestIdRef.current = null;
        setPhase('results');
      })
      .catch((err) => {
        setScoreError(err?.message || String(err));
        setPhase('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liz.isEnded]);

  const handleClose = () => {
    onExit?.();
    liz.reset();
  };

  if (phase === 'submitting') {
    return (
      <>
        <SpeakingHeader user={user} />
        <ProcessingState audioBlob={liz.userAudioBlob} />
      </>
    );
  }

  if (phase === 'results') {
    // Route Liz Live's response through the same adapter the rest of the
    // surfaces use (Results.js, useSpeakingFlow). Without this the Azure
    // deep bundle and CEFR vocabulary_profile flow through, but the
    // defensive copy + legacy-shape fallback are skipped — easy way to
    // get parity drift between Liz Live and the cue-card flow (task #138).
    const adapted = adaptSpeakingResult(scoreResult, {
      targetBand: user?.target_band,
      durationSeconds: liz.elapsedSeconds,
    }) || scoreResult;
    return (
      <>
        <SpeakingHeader user={user} />
        <ResultsState
          data={adapted}
          onRetryCard={handleClose}
          onNewCard={handleClose}
        />
      </>
    );
  }

  if (phase === 'error') {
    return (
      <>
        <SpeakingHeader user={user} />
        <ErrorState
          errorMessage={scoreError}
          onRetry={handleClose}
          onBack={handleClose}
        />
      </>
    );
  }

  const showUpgrade = liz.isError && liz.errorCode === 'liz_live_locked';

  return (
    <>
      <SpeakingHeader user={user} />
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 32px 80px' }}>
        {showUpgrade ? (
          <div
            style={{
              background: 'var(--sp-card)',
              borderRadius: 'var(--sp-radius)',
              border: '1px solid var(--sp-border)',
              boxShadow: 'var(--sp-shadow-card)',
              padding: 48,
              textAlign: 'center',
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            <h2 className="sp-font-display" style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
              Live with Liz is a Premium feature
            </h2>
            <p style={{ color: 'var(--sp-muted-fg)', marginBottom: 24 }}>
              {liz.error || 'Upgrade your plan to talk live with Liz.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a className="sp-btn-primary" href="/pricing/v2" style={{ height: 44, padding: '0 22px', display: 'inline-flex', alignItems: 'center' }}>See plans</a>
              <button className="sp-btn-ghost" onClick={handleClose} style={{ height: 44, padding: '0 18px' }}>Back</button>
            </div>
          </div>
        ) : (
          <div className="liz-scope">
            <VoiceOverlay liz={liz} onClose={handleClose} />
          </div>
        )}
      </section>
    </>
  );
}

/**
 * D7 Speaking Practice — full flow orchestrator.
 *
 * State machine: select → prep → recording → processing → results
 * (plus error for low-audio / mic issues).
 *
 * Real-backend wiring:
 *   - useSpeakingFlow captures mic audio during `recording`
 *   - When state transitions to `processing`, we POST audio + cue-card
 *     metadata to /api/speaking/evaluate (unified Faz 2 endpoint)
 *   - The resulting SpeakingEvaluationResult is passed to ResultsState
 */
function SpeakingPracticeInner({ onExit, user }) {
  const flow = useSpeakingFlow({ prepSeconds: 60, recordSeconds: 120 });
  // Active part for the ElevenLabs Live conversation (Part 1 / Part 3).
  // null when in the standard cue-card flow.
  const [pendingLivePart, setPendingLivePart] = useState(null);
  // True when the user has opened the 3-part Full Test orchestrator. Mutually
  // exclusive with pendingLivePart and the per-part flow states.
  const [pendingFullTest, setPendingFullTest] = useState(false);

  // Lock the Full Test card for plans that aren't Monthly/Exam Pack. The
  // backend enforces the same rule, but locking in the UI gives a clearer
  // message before the candidate spends a click + a connection attempt.
  const lockedParts = useMemo(() => {
    const planRaw = (user?.plan || 'free').toLowerCase();
    return FULL_TEST_PLANS.has(planRaw) ? new Set() : new Set(['fulltest']);
  }, [user?.plan]);
  // Pick a fresh Part 2 cue card per session. Memoised so re-renders during
  // prep/recording don't swap the prompt under the candidate. handleExit /
  // "New card" reset bumps `cueCardKey` to draw a different one.
  const [cueCardKey, setCueCardKey] = useState(0);
  const cueCard = useMemo(
    () => pickRandomCueCard({ excludeId: undefined }),
    [cueCardKey],
  );
  // One stable id per cue-card attempt. Bumped when the candidate swaps the
  // card or starts fresh via handleExit / handleNewCard.
  const practiceClientRequestId = useMemo(
    () => mintClientRequestId(),
    [cueCardKey],
  );

  // Kick off scoring request once recording finishes AND the MediaRecorder
  // has finalised its blob (rec.onstop fires async after .stop(), so we must
  // wait for `audioReady` before reading audioBlob — otherwise submitScoring
  // sees null and falls through to the simulated/mock path → user sees the
  // Aunt-Mai fixture in ResultsState instead of a real evaluation.
  useEffect(() => {
    if (flow.state !== 'processing') return;
    if (!flow.audioReady) return;
    flow.submitScoring({
      cueCard,
      part: flow.selectedPart,
      userLanguage: user?.feedback_language || 'en',
      targetBand: user?.target_band || 7.0,
      // Task #64: unified /api/speaking/evaluate requires user_id + context.
      // Smart Practice = `practice` per backend's _VALID_CONTEXTS allow-list.
      userId: user?.id,
      context: 'practice',
      clientRequestId: practiceClientRequestId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.state, flow.audioReady]);

  const handleExit = () => {
    flow.reset();
    setPendingLivePart(null);
    setPendingFullTest(false);
    setCueCardKey((k) => k + 1);
    if (onExit) onExit();
  };

  const handleNewCard = () => {
    setCueCardKey((k) => k + 1);
    flow.reset();
  };

  // Card swap during prep — keep the candidate in `prep` state but draw a
  // different card from the 50-card pool and restart the 60-second timer.
  const handleSwapCard = () => {
    setCueCardKey((k) => k + 1);
    flow.startPrep();
  };

  const handleStart = (partOverride) => {
    // PartSelector passes the clicked part id explicitly so we don't read a
    // stale `flow.selectedPart` from before React flushed setSelectedPart.
    const part = partOverride || flow.selectedPart;
    // Locked parts (e.g. Full Test on Free/Weekly) route to upgrade rather
    // than into a session that the backend will 402 anyway.
    if (lockedParts.has(part)) {
      window.location.href = '/pricing/v2';
      return;
    }
    if (part === 'fulltest') {
      setPendingFullTest(true);
      return;
    }
    if (CONVERSATIONAL_PARTS.has(part)) {
      setPendingLivePart(part);
    } else {
      flow.startPrep();
    }
  };

  // Full Test — 3-part orchestrator with one shared theme.
  if (pendingFullTest) {
    return (
      <FullTestFlow
        user={user}
        onExit={() => setPendingFullTest(false)}
      />
    );
  }

  // Part 1 / Part 3 — LIVE conversation with Liz (premium). Liz connects and
  // asks the questions conversationally (no pre-synthesised per-question TTS,
  // which loaded slowly), then the user-only audio is graded and shown on the
  // detailed results screen. Aga 2026-06-05: premium Part 1/3 must be the Liz
  // Live experience, not the StructuredQuestionFlow "listen → record" flow.
  // (StructuredQuestionFlow is kept for non-live/lower-tier use.)
  if (pendingLivePart) {
    return (
      <LiveConversation
        part={pendingLivePart}
        user={user}
        onExit={() => setPendingLivePart(null)}
      />
    );
  }

  return (
    <>
      <SpeakingHeader user={user} />

      {flow.state === 'select' && (
        <PartSelector
          selectedPart={flow.selectedPart}
          onSelectPart={flow.setSelectedPart}
          onStart={handleStart}
          topics={flow.topics}
          onToggleTopic={flow.toggleTopic}
          onClearTopics={flow.clearTopics}
          lockedParts={lockedParts}
        />
      )}

      {flow.state === 'prep' && (
        <PreparationState
          prepRemaining={flow.prepRemaining}
          prepTotal={60}
          onAddThirty={() => flow.addPrepTime(30)}
          onSkipPrep={flow.startRecording}
          onStartRecording={flow.startRecording}
          onExit={handleExit}
          onChangeCard={handleSwapCard}
          cueCard={cueCard}
        />
      )}

      {flow.state === 'recording' && (
        <RecordingState
          recordRemaining={flow.recordRemaining}
          spokenWordCount={flow.spokenWordCount}
          onStopEarly={flow.startProcessing}
          cueCard={cueCard}
        />
      )}

      {flow.state === 'processing' && (
        <ProcessingState audioBlob={flow.audioBlob} />
      )}

      {flow.state === 'results' && (
        <ResultsState
          data={flow.scoreResult}
          onRetryCard={flow.startPrep}
          onNewCard={handleNewCard}
        />
      )}

      {flow.state === 'error' && (
        <ErrorState
          errorMessage={flow.scoreError || flow.audioError}
          onRetry={flow.startRecording}
          onBack={handleExit}
        />
      )}
    </>
  );
}

export default function SpeakingPractice(props) {
  return (
    <ConversationProvider>
      <SpeakingPracticeInner {...props} />
    </ConversationProvider>
  );
}
