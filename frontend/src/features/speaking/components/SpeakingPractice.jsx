import React, { useEffect, useState } from 'react';
import SpeakingHeader from './SpeakingHeader';
import PartSelector from './PartSelector';
import PreparationState from './PreparationState';
import RecordingState from './RecordingState';
import ResultsState from './ResultsState';
import ProcessingState from './ProcessingState';
import ErrorState from './ErrorState';
import LizLivePanel from './LizLivePanel';
import { useSpeakingFlow } from '../hooks/useSpeakingFlow';
import { CUE_CARD } from '../constants';

// Parts where IELTS uses examiner Q&A — these get the Liz Live conversational
// flow. Part 2 stays on the monologue cue-card path.
const LIVE_PARTS = new Set(['part1', 'part3']);

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
export default function SpeakingPractice({ onExit, user }) {
  const flow = useSpeakingFlow({ prepSeconds: 60, recordSeconds: 120 });
  // When the user picks Part 1 / Part 3 and starts, we leave the standard
  // flow alone (it stays in `select`) and mount LizLivePanel instead. This
  // keeps useSpeakingFlow scoped to monologue scoring and avoids forking
  // its state machine for a fundamentally different (streaming) flow.
  const [livePart, setLivePart] = useState(null);

  // Kick off scoring request once recording finishes and we enter `processing`.
  useEffect(() => {
    if (flow.state !== 'processing') return;
    flow.submitScoring({
      cueCard: CUE_CARD,
      part: flow.selectedPart,
      userLanguage: user?.feedback_language || 'en',
      targetBand: user?.target_band || 7.0,
      // Task #64: unified /api/speaking/evaluate requires user_id + context.
      // Smart Practice = `practice` per backend's _VALID_CONTEXTS allow-list.
      userId: user?.id,
      context: 'practice',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.state]);

  const handleExit = () => {
    flow.reset();
    setLivePart(null);
    if (onExit) onExit();
  };

  const handleStart = (partOverride) => {
    // PartSelector passes the clicked part id explicitly so we don't read a
    // stale `flow.selectedPart` from before React flushed setSelectedPart.
    const part = partOverride || flow.selectedPart;
    if (LIVE_PARTS.has(part)) {
      setLivePart(part);
    } else {
      flow.startPrep();
    }
  };

  if (livePart) {
    return (
      <>
        <SpeakingHeader />
        <LizLivePanel
          part={livePart}
          user={user}
          onExit={() => setLivePart(null)}
        />
      </>
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
        />
      )}

      {flow.state === 'recording' && (
        <RecordingState
          recordRemaining={flow.recordRemaining}
          spokenWordCount={flow.spokenWordCount}
          onStopEarly={flow.startProcessing}
        />
      )}

      {flow.state === 'processing' && <ProcessingState />}

      {flow.state === 'results' && (
        <ResultsState
          data={flow.scoreResult}
          onRetryCard={flow.startPrep}
          onNewCard={flow.reset}
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
