import React from 'react';
import { Volume2, Play, Pause } from 'lucide-react';
import MapLabelling from '../../../components/listening/MapLabelling';
import OpinionMatching from '../../../components/listening/OpinionMatching';
import { API_URL } from '../constants';
import { formatTimeShort } from '../lib/format';

// ============ LISTENING SECTION (IELTS STYLE) ============
export default function ListeningSection({
  testData,
  testId,
  listeningPart,
  sectionAnswers,
  updateAnswer,
  handleTextSelection,
  audioRef,
  audioPlaying,
  setAudioPlaying,
  audioEndedParts,
  audioDuration,
  setAudioDuration,
  audioCurrentTime,
  setAudioCurrentTime,
  handlePlayAudio,
  handleAudioEnded,
}) {
  // Helper for rendering default questions
  const renderDefaultQuestions = (questions, startNum) => (
    <div className="bg-white border-2 border-slate-200 rounded-lg p-6 space-y-4">
      {questions.map((q, idx) => {
        const qNum = startNum + idx;
        const questionParts = q.question?.split('______') || [q.question];
        return (
          <div key={q.id} className="flex items-start gap-2 py-2 text-slate-700 text-lg">
            <span className="text-slate-400 min-w-[20px]">•</span>
            <div className="flex-1 flex flex-wrap items-center gap-1">
              <span>{questionParts[0]}</span>
              <input
                type="text"
                value={sectionAnswers.listening[q.id] || ''}
                onChange={(e) => updateAnswer('listening', q.id, e.target.value)}
                className="w-36 px-3 py-2 border-2 border-blue-400 rounded-md text-center font-medium bg-blue-50"
                placeholder={String(qNum)}
              />
              {questionParts[1] && <span>{questionParts[1]}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ============ HELPER: RENDER LISTENING QUESTIONS BASED ON TYPE ============
  const renderListeningQuestions = (partData) => {
    if (!partData) return null;

    const questionStartNum = (listeningPart - 1) * 10 + 1;
    const hasMapLabelling = partData.question_types?.includes('map_labelling') ||
                            partData.questions?.some(q => q.type === 'map_labelling');
    const hasMatching = partData.question_types?.includes('matching') ||
                        partData.questions?.some(q => q.type === 'matching' || q.type === 'opinion_matching');

    // Check for visual data
    const visual = partData.visual || partData.visual_data;

    // If has map labelling questions with visual
    if (hasMapLabelling && visual) {
      return (
        <div className="space-y-6">
          {/* Map Component */}
          <MapLabelling
            visual={visual}
            questions={partData.questions}
            answers={sectionAnswers.listening}
            onAnswerChange={(qId, value) => updateAnswer('listening', qId, value)}
            questionStartNum={questionStartNum}
          />

          {/* Non-map questions */}
          {partData.questions?.filter(q => q.type !== 'map_labelling').length > 0 && (
            <div className="bg-white border-2 border-slate-200 rounded-lg">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-lg text-slate-900">
                  Other Questions
                </h3>
                <p className="text-slate-600 mt-1">
                  Complete the notes. Write <strong>ONE WORD ONLY</strong> in each gap.
                </p>
              </div>
              <div className="p-6 space-y-4">
                {partData.questions?.filter(q => q.type !== 'map_labelling').map((q, idx) => {
                  const qNum = questionStartNum + partData.questions.indexOf(q);
                  const questionParts = q.question?.split('______') || [q.question];

                  return (
                    <div key={q.id} className="flex items-start gap-2 py-2 text-slate-700 text-lg leading-relaxed">
                      <span className="text-slate-400 min-w-[20px]">•</span>
                      <div className="flex-1 flex flex-wrap items-center gap-1">
                        <span>{questionParts[0]}</span>
                        <input
                          type="text"
                          value={sectionAnswers.listening[q.id] || ''}
                          onChange={(e) => updateAnswer('listening', q.id, e.target.value)}
                          className="w-36 px-3 py-2 border-2 border-blue-400 rounded-md text-center font-medium
                                   bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none
                                   placeholder:text-blue-300 placeholder:font-bold"
                          placeholder={String(qNum)}
                        />
                        {questionParts[1] && <span>{questionParts[1]}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // If has matching/opinion questions with options box
    if (hasMatching && partData.matching_options) {
      const matchingQuestions = partData.questions?.filter(q =>
        q.type === 'matching' || q.type === 'opinion_matching'
      ) || [];
      const otherQuestions = partData.questions?.filter(q =>
        q.type !== 'matching' && q.type !== 'opinion_matching'
      ) || [];

      return (
        <div className="space-y-6">
          {/* Section Title */}
          <h4 className="font-bold text-xl text-slate-800 pb-3 border-b border-slate-200">
            {partData.title}
          </h4>

          {/* Opinion/Matching Box */}
          <OpinionMatching
            title={partData.matching_title || "Options"}
            options={partData.matching_options}
            questions={matchingQuestions}
            answers={sectionAnswers.listening}
            onAnswerChange={(qId, value) => updateAnswer('listening', qId, value)}
            questionStartNum={questionStartNum}
          />

          {/* Other questions if any */}
          {otherQuestions.length > 0 && renderDefaultQuestions(otherQuestions, questionStartNum + matchingQuestions.length)}
        </div>
      );
    }

    // Default: Note completion style
    return (
      <div
        className="bg-white border-2 border-slate-200 rounded-lg"
        onContextMenu={handleTextSelection}
      >
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900">
            Questions {questionStartNum} - {questionStartNum + (partData.questions?.length || 10) - 1}
          </h3>
          <p className="text-slate-600 mt-1">
            Complete the notes. Write <strong>ONE WORD ONLY</strong> in each gap.
          </p>
        </div>

        <div className="p-6">
          {/* Section Title */}
          <h4 className="font-bold text-xl text-slate-800 mb-6 pb-3 border-b border-slate-200">
            {partData.title}
          </h4>

          {/* Questions in note completion format */}
          <div className="space-y-4 select-text">
            {partData.questions?.map((q, idx) => {
              const qNum = questionStartNum + idx;
              const questionParts = q.question?.split('______') || [q.question];

              return (
                <div key={q.id} className="flex items-start gap-2 py-2 text-slate-700 text-lg leading-relaxed">
                  <span className="text-slate-400 min-w-[20px]">•</span>
                  <div className="flex-1 flex flex-wrap items-center gap-1">
                    <span>{questionParts[0]}</span>
                    <input
                      type="text"
                      value={sectionAnswers.listening[q.id] || ''}
                      onChange={(e) => updateAnswer('listening', q.id, e.target.value)}
                      className="w-36 px-3 py-2 border-2 border-blue-400 rounded-md text-center font-medium
                               bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none
                               placeholder:text-blue-300 placeholder:font-bold"
                      placeholder={String(qNum)}
                    />
                    {questionParts[1] && <span>{questionParts[1]}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip for highlighting */}
          <div className="mt-4 p-2 bg-slate-100 rounded text-xs text-slate-500">
            💡 Tip: Select text and right-click to highlight or add notes
          </div>
        </div>
      </div>
    );
  };

  const listening = testData?.sections?.listening;
  const currentPartData = listening?.parts?.[listeningPart - 1];

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Part Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-1">Part {listeningPart}</h2>
          <p className="text-slate-600 text-lg">Listen and answer questions {(listeningPart-1)*10 + 1} - {listeningPart * 10}</p>
        </div>

        {/* Audio Player with Progress Bar & Time */}
        <div className="mb-6 p-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={handlePlayAudio}
              disabled={audioEndedParts[listeningPart]}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg shrink-0
                ${audioPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}
                ${audioEndedParts[listeningPart] ? 'bg-slate-400 cursor-not-allowed' : ''}
                text-white`}
              data-testid="full-test-play-btn"
            >
              {audioPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-slate-900">
                  {audioPlaying ? 'Playing...' : audioEndedParts[listeningPart] ? 'Audio Completed' : 'Click to Play Audio'}
                </p>
                <p className="text-sm text-slate-500">Part {listeningPart} of 4</p>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: audioDuration > 0 ? `${(audioCurrentTime / audioDuration) * 100}%` : '0%' }}
                />
              </div>
              {/* Time Display */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{formatTimeShort(Math.floor(audioCurrentTime))}</span>
                <span>
                  {audioDuration > 0
                    ? `-${formatTimeShort(Math.floor(audioDuration - audioCurrentTime))} remaining`
                    : 'Audio plays once only'}
                </span>
              </div>
            </div>
            {/* Volume Control */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="80"
                onChange={(e) => {
                  if (audioRef.current) {
                    audioRef.current.volume = e.target.value / 100;
                  }
                }}
                className="w-20 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          <audio
            ref={audioRef}
            key={listeningPart}
            src={`${API_URL}/api/full-test/audio/stream/${testId}/listening/${listeningPart}`}
            onEnded={handleAudioEnded}
            onPlay={() => setAudioPlaying(true)}
            onPause={() => setAudioPlaying(false)}
            onLoadedMetadata={(e) => setAudioDuration(e.target.duration || 0)}
            onTimeUpdate={(e) => setAudioCurrentTime(e.target.currentTime || 0)}
            style={{ display: 'none' }}
            data-testid="full-test-audio-element"
          />
        </div>

        {/* Questions Section - Conditional based on question type */}
        {renderListeningQuestions(currentPartData)}
      </div>
    </div>
  );
}
