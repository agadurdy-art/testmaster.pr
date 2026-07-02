import React from 'react';
import { PreparationState, RecordingState } from '../../index';
import { STATES } from './qbConstants';

/**
 * Part 2 "wow" UI — the polished D7 preparation + recording experience
 * (the landing-page promise), used during the prep and recording phases.
 * Grading is unchanged (leave-safe cue-card job queue). Other phases
 * (Start / processing / Next) keep the shared QuestionFlow controls.
 *
 * The page renders this only while
 * `currentPart === 2 && (isPrepPhase || RECORDING || IDLE)` — the same
 * condition the inline block used.
 */
export default function Part2Flow({
  moduleContent,
  recordingState,
  prepTime,
  timeLeft,
  onAddThirty,
  onStartSpeaking,
  onExit,
  onStopEarly,
}) {
  const cc = {
    topic: moduleContent.part2?.cue_card?.topic,
    prompt: moduleContent.part2?.cue_card?.topic,
    bullets: moduleContent.part2?.cue_card?.bullets || [],
  };
  return (
    <div className="speaking-scope rounded-2xl overflow-hidden border border-emerald-100 shadow-sm">
      {recordingState !== STATES.RECORDING ? (
        <PreparationState
          prepRemaining={prepTime}
          prepTotal={60}
          onAddThirty={onAddThirty}
          onSkipPrep={onStartSpeaking}
          onStartRecording={onStartSpeaking}
          onExit={onExit}
          cueCard={cc}
        />
      ) : (
        <RecordingState
          recordRemaining={timeLeft}
          onStopEarly={onStopEarly}
          cueCard={cc}
        />
      )}
    </div>
  );
}
