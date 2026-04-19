import React, { useEffect } from 'react';
import SpeakingHeader from './SpeakingHeader';
import PartSelector from './PartSelector';
import PreparationState from './PreparationState';
import RecordingState from './RecordingState';
import ResultsState from './ResultsState';
import ProcessingState from './ProcessingState';
import ErrorState from './ErrorState';
import { useSpeakingFlow } from '../hooks/useSpeakingFlow';
import { CUE_CARD } from '../constants';

/**
 * D7 Speaking Practice — full flow orchestrator.
 *
 * State machine: select → prep → recording → processing → results
 * (plus error for low-audio / mic issues).
 *
 * Real-backend wiring:
 *   - useSpeakingFlow captures mic audio during `recording`
 *   - When state transitions to `processing`, we POST audio + cue-card
 *     metadata to /api/speaking/score
 *   - The resulting SpeakingEvaluationResult is passed to ResultsState
 */
export default function SpeakingPractice({ onExit, user }) {
  const flow = useSpeakingFlow({ prepSeconds: 60, recordSeconds: 120 });

  // Kick off scoring request once recording finishes and we enter `processing`.
  useEffect(() => {
    if (flow.state !== 'processing') return;
    flow.submitScoring({
      cueCard: CUE_CARD,
      part: flow.selectedPart,
      userLanguage: user?.feedback_language || 'en',
      targetBand: user?.target_band || 7.0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.state]);

  const handleExit = () => {
    flow.reset();
    if (onExit) onExit();
  };

  return (
    <>
      <SpeakingHeader />

      {flow.state === 'select' && (
        <PartSelector
          selectedPart={flow.selectedPart}
          onSelectPart={flow.setSelectedPart}
          onStart={flow.startPrep}
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
