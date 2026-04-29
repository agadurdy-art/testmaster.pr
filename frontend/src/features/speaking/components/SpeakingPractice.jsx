import React, { useEffect, useMemo, useState } from 'react';
import { ConversationProvider } from '@elevenlabs/react';
import SpeakingHeader from './SpeakingHeader';
import PartSelector from './PartSelector';
import PreparationState from './PreparationState';
import RecordingState from './RecordingState';
import ResultsState from './ResultsState';
import ProcessingState from './ProcessingState';
import ErrorState from './ErrorState';
import { useSpeakingFlow } from '../hooks/useSpeakingFlow';
import { pickRandomCueCard } from '../lib/pickCueCard';
import useElevenLabsLiz from '../../liz/hooks/useElevenLabsLiz';
import VoiceOverlay from '../../liz/components/VoiceOverlay';
import '../../liz/liz.css';

// 2026-04-29: Part 1 + Part 3 are conversational, driven by ElevenLabs Liz
// (replaces Gemini Live). Part 2 remains the cue-card monologue flow.
const CONVERSATIONAL_PARTS = new Set(['part1', 'part3']);

// Live conversation gate for Part 1/3 — auto-starts a Liz session inside the
// ConversationProvider, renders VoiceOverlay, and surfaces a quota-locked
// upgrade prompt if the plan blocks it.
function LiveConversation({ part, user, onExit }) {
  const liz = useElevenLabsLiz({ userId: user?.id });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started || !user?.id) return;
    setStarted(true);
    liz.start({ part });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, user?.id, part]);

  useEffect(() => {
    if (!liz.isEnded) return;
    onExit?.();
    liz.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liz.isEnded]);

  const showUpgrade = liz.isError && liz.errorCode === 'liz_live_locked';

  return (
    <>
      <SpeakingHeader />
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
              <button className="sp-btn-ghost" onClick={onExit} style={{ height: 44, padding: '0 18px' }}>Back</button>
            </div>
          </div>
        ) : (
          <div className="liz-scope">
            <VoiceOverlay liz={liz} onClose={onExit} />
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
  // Pick a fresh Part 2 cue card per session. Memoised so re-renders during
  // prep/recording don't swap the prompt under the candidate. handleExit /
  // "New card" reset bumps `cueCardKey` to draw a different one.
  const [cueCardKey, setCueCardKey] = useState(0);
  const cueCard = useMemo(
    () => pickRandomCueCard({ excludeId: undefined }),
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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.state, flow.audioReady]);

  const handleExit = () => {
    flow.reset();
    setPendingLivePart(null);
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
    if (CONVERSATIONAL_PARTS.has(part)) {
      setPendingLivePart(part);
    } else {
      flow.startPrep();
    }
  };

  // Part 1 / Part 3 — live conversation with Liz via ElevenLabs.
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
      <SpeakingHeader />

      {flow.state === 'select' && (
        <PartSelector
          selectedPart={flow.selectedPart}
          onSelectPart={flow.setSelectedPart}
          onStart={handleStart}
          topics={flow.topics}
          onToggleTopic={flow.toggleTopic}
          onClearTopics={flow.clearTopics}
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
