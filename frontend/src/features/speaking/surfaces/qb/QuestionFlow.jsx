import React from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import {
  ArrowLeft, Clock, Mic, Play, Square, SkipForward,
  Volume2, Loader2, FileText, MessageSquare
} from 'lucide-react';
import { STATES } from './qbConstants';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Per-question record loop for Parts 1 & 3 (and the non-D7 phases of
 * Part 2): status card, question/cue card, the Start → Stop → Play/Next
 * controls, and the part footer. Fully controlled — the page owns the
 * state machine and passes state + handlers down.
 */
export default function QuestionFlow({
  recordingState,
  isPrepPhase,
  timeLeft,
  prepTime,
  currentPart,
  currentQuestionIndex,
  moduleContent,
  showText,
  question,
  progress,
  lastRecordingUrl,
  isPlayingBack,
  onStart,
  onStop,
  onTogglePlayback,
  onNext,
  onStartSpeaking,
  onBackToParts,
}) {
  return (
    <div className="space-y-6">
      <Card className={`p-4 ${recordingState === STATES.RECORDING ? 'bg-red-50 border-red-200' : isPrepPhase ? 'bg-yellow-50 border-yellow-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {recordingState === STATES.RECORDING && <><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /><span className="text-red-700 font-medium">Recording</span></>}
            {isPrepPhase && <><Clock className="w-5 h-5 text-yellow-600" /><span className="text-yellow-700 font-medium">Preparation</span></>}
            {recordingState === STATES.PROMPT_PLAYING && <><Volume2 className="w-5 h-5 text-blue-600 animate-pulse" /><span className="text-blue-700 font-medium">Listening...</span></>}
            {recordingState === STATES.PROCESSING && <><Loader2 className="w-5 h-5 text-indigo-600 animate-spin" /><span className="text-indigo-700 font-medium">Processing...</span></>}
          </div>
          <div className={`text-2xl font-mono font-bold ${timeLeft < 10 && recordingState === STATES.RECORDING ? 'text-red-600' : ''}`}>
            {isPrepPhase ? formatTime(prepTime) : formatTime(timeLeft)}
          </div>
        </div>
      </Card>

      <Card className="p-6 relative overflow-hidden border-emerald-100">
        <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
        {currentPart === 2 ? (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Cue Card
            </h2>
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <p className="font-semibold text-emerald-900 mb-3">{moduleContent.part2?.cue_card?.topic}</p>
              <p className="text-sm text-emerald-700 mb-2">You should say:</p>
              <ul className="list-disc list-inside text-sm text-emerald-800 space-y-1">
                {moduleContent.part2?.cue_card?.bullets?.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> Question {currentQuestionIndex + 1}
            </h2>
            {(showText || moduleContent.show_text) && question?.text && <p className="text-lg text-gray-800 mb-4">{question.text}</p>}
            {!showText && !moduleContent.show_text && (
              <div className="text-center py-4 text-gray-500">
                <Volume2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm">Listen to the question</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex gap-3 justify-center">
        {recordingState === STATES.IDLE && <Button onClick={onStart} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200 px-8"><Play className="w-5 h-5 mr-2" /> Start</Button>}
        {recordingState === STATES.RECORDING && <Button onClick={onStop} className="bg-red-600 hover:bg-red-700 px-8"><Square className="w-5 h-5 mr-2" /> Stop</Button>}
        {recordingState === STATES.READY_NEXT && lastRecordingUrl && (
          <Button onClick={onTogglePlayback} variant="outline" className="px-6 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
            {isPlayingBack ? (
              <><Square className="w-4 h-4 mr-2" /> Stop playback</>
            ) : (
              <><Volume2 className="w-4 h-4 mr-2" /> Play my recording</>
            )}
          </Button>
        )}
        {recordingState === STATES.READY_NEXT && <Button onClick={onNext} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200 px-8"><SkipForward className="w-5 h-5 mr-2" /> Next</Button>}
        {isPrepPhase && <Button onClick={onStartSpeaking} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200 px-8"><Mic className="w-5 h-5 mr-2" /> Start Speaking</Button>}
      </div>

      {/* Footer: confirm which part the user is on + escape hatch back
          to the picker. We don't allow live mid-recording part swaps —
          the back button only acts when not actively recording. */}
      <Card className="p-4 bg-emerald-50/40 border-emerald-100 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-semibold text-gray-900">
            {currentPart === 1 ? 'Part 1 — Introduction' : currentPart === 2 ? 'Part 2 — Long Turn' : 'Part 3 — Discussion'}
          </span>
          <span className="text-gray-500 ml-2">
            ({progress.current}/{progress.total})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToParts}
          disabled={recordingState === STATES.RECORDING || recordingState === STATES.PROCESSING}
          title={recordingState === STATES.RECORDING ? 'Stop recording first' : 'Choose another part'}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Choose another part
        </Button>
      </Card>
    </div>
  );
}
