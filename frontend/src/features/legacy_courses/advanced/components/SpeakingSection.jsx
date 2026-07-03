import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Textarea } from '../../../../components/ui/textarea';
import {
  Mic, CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function SpeakingSection({
  selectedModule,
  isRecording,
  startRecording,
  stopRecording,
  speakingResponse,
  setSpeakingResponse,
  evaluateSpeaking,
  speakingLoading,
  speakingFeedback,
  setCurrentSection,
}) {
  return (
    <Card id="speaking-section" className="p-6 bg-white border-0 shadow-lg scroll-mt-24">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5 text-emerald-600" /> Speaking Practice
      </h3>

      <div className="space-y-6">
        {/* Part 2 Cue Card */}
        {selectedModule.speaking?.part2 && (
          <div className="p-4 bg-emerald-50 rounded-xl">
            <h4 className="font-semibold text-emerald-800 mb-2">Part 2: Cue Card</h4>
            <div className="bg-white p-4 rounded-lg border border-emerald-200 mb-3">
              <p className="text-gray-700 whitespace-pre-line">{selectedModule.speaking.part2.cue_card}</p>
            </div>
            {selectedModule.speaking.part2.tips && selectedModule.speaking.part2.tips.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-emerald-700 mb-1">💡 Tips:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedModule.speaking.part2.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-500 mt-1 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedModule.speaking.part2.model_answer && (
              <details className="text-sm">
                <summary className="text-emerald-600 cursor-pointer font-medium hover:underline">View Model Answer</summary>
                <div className="mt-2 p-3 bg-white rounded-lg text-gray-600 border border-emerald-100">
                  <p>{selectedModule.speaking.part2.model_answer}</p>
                </div>
              </details>
            )}
          </div>
        )}

        {/* Part 3 Discussion Questions */}
        {selectedModule.speaking?.part3?.questions && selectedModule.speaking.part3.questions.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-3">Part 3: Discussion Questions</h4>
            <div className="space-y-4">
              {selectedModule.speaking.part3.questions.map((q, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="font-medium text-gray-900 mb-2">Q{idx + 1}: {q.question}</p>
                  {q.model_answer && (
                    <details className="text-sm">
                      <summary className="text-blue-600 cursor-pointer font-medium hover:underline">View Model Answer</summary>
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg text-gray-600">
                        <p>{q.model_answer}</p>
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legacy Part 3 format support */}
        {selectedModule.speaking?.part3 && !selectedModule.speaking.part3.questions && selectedModule.speaking.part3.question && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">Part 3: Abstract Discussion</h4>
            <p className="text-gray-700 mb-3">{selectedModule.speaking.part3.question}</p>
            {selectedModule.speaking.part3.band8_sample && (
              <details className="text-sm">
                <summary className="text-blue-600 cursor-pointer font-medium">View Band 8 Sample</summary>
                <p className="mt-2 p-3 bg-white rounded-lg text-gray-600 italic">
                  {selectedModule.speaking.part3.band8_sample}
                </p>
              </details>
            )}
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex gap-3">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}
          >
            <Mic className="w-4 h-4 mr-2" />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </div>

        {/* Response Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Response (type or speak)</label>
          <Textarea
            value={speakingResponse}
            onChange={(e) => setSpeakingResponse(e.target.value)}
            placeholder="Type your speaking response here for AI evaluation..."
            rows={5}
            className="w-full"
          />
        </div>

        <Button 
          onClick={evaluateSpeaking} 
          disabled={speakingLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
        >
          {speakingLoading ? 'Evaluating...' : 'Get AI Evaluation'}
        </Button>

        {/* Feedback Display */}
        {speakingFeedback && (
          <div className={`p-5 rounded-xl ${speakingFeedback.band_score >= 7 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-4 py-2 rounded-xl font-bold text-lg ${speakingFeedback.band_score >= 7 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                Band {speakingFeedback.band_score}
              </div>
            </div>

            {/* Criteria Scores */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {speakingFeedback.fluency_coherence && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Fluency: {speakingFeedback.fluency_coherence.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.fluency_coherence.feedback}</p>
                </div>
              )}
              {speakingFeedback.lexical_resource && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-purple-600">Vocabulary: {speakingFeedback.lexical_resource.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.lexical_resource.feedback}</p>
                </div>
              )}
              {speakingFeedback.grammatical_range && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-green-600">Grammar: {speakingFeedback.grammatical_range.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.grammatical_range.feedback}</p>
                </div>
              )}
              {speakingFeedback.pronunciation && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-amber-600">Pronunciation: {speakingFeedback.pronunciation.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.pronunciation.feedback}</p>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-3">{speakingFeedback.overall_feedback}</p>

            {speakingFeedback.response_diagnosis && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-500">Relevance</p>
                  <p className="font-semibold capitalize">{speakingFeedback.response_diagnosis.relevance}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-500">Development</p>
                  <p className="font-semibold capitalize">{speakingFeedback.response_diagnosis.development}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-500">Template Risk</p>
                  <p className="font-semibold capitalize">{speakingFeedback.response_diagnosis.template_risk}</p>
                </div>
              </div>
            )}

            {speakingFeedback.response_metrics && (
              <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase mb-2">Response Metrics</p>
                <div className="grid grid-cols-3 gap-3 text-sm text-gray-700">
                  <div>Words: <span className="font-semibold">{speakingFeedback.response_metrics.word_count}</span></div>
                  <div>Sentences: <span className="font-semibold">{speakingFeedback.response_metrics.sentence_count}</span></div>
                  <div>Template risk: <span className="font-semibold">{speakingFeedback.response_metrics.template_risk}</span></div>
                </div>
              </div>
            )}

            {speakingFeedback.pronunciation_estimated !== undefined && (
              <div className={`mb-4 p-3 rounded-lg ${speakingFeedback.pronunciation_estimated ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                <p className="text-sm text-gray-800">
                  {speakingFeedback.pronunciation_estimated
                    ? 'Pronunciation is estimated mainly from transcript evidence.'
                    : 'Pronunciation includes Azure acoustic analysis.'}
                </p>
              </div>
            )}

            {speakingFeedback.azure_scores && (
              <div className="mb-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                <p className="text-sm font-semibold text-cyan-700 mb-2">Azure Pronunciation Snapshot</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-700">
                  <div>Pron: <span className="font-semibold">{speakingFeedback.azure_scores.pronunciation}</span></div>
                  <div>Accuracy: <span className="font-semibold">{speakingFeedback.azure_scores.accuracy}</span></div>
                  <div>Fluency: <span className="font-semibold">{speakingFeedback.azure_scores.fluency}</span></div>
                  <div>Complete: <span className="font-semibold">{speakingFeedback.azure_scores.completeness}</span></div>
                  <div>Prosody: <span className="font-semibold">{speakingFeedback.azure_scores.prosody}</span></div>
                </div>
              </div>
            )}

            {speakingFeedback.suggested_improvements && (
              <div className="mt-3 p-3 bg-white rounded-lg">
                <p className="text-sm font-medium text-gray-800 mb-1">Suggestions:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {speakingFeedback.suggested_improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {speakingFeedback.high_priority_fixes && speakingFeedback.high_priority_fixes.length > 0 && (
              <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-800 mb-1">High-Priority Fixes</p>
                <ul className="text-sm text-orange-700 list-disc list-inside">
                  {speakingFeedback.high_priority_fixes.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {speakingFeedback.line_by_line_corrections && speakingFeedback.line_by_line_corrections.length > 0 && (
              <div className="mt-3 p-3 bg-rose-50 rounded-lg">
                <p className="text-sm font-medium text-rose-800 mb-2">Line-by-Line Coaching</p>
                <div className="space-y-2">
                  {speakingFeedback.line_by_line_corrections.map((item, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-rose-100">
                      <p className="text-sm text-red-600 line-through">{item.original}</p>
                      <p className="text-sm text-green-700 font-medium">✓ {item.corrected}</p>
                      {item.issue && <p className="text-xs font-semibold text-rose-600 mt-1">{item.issue}</p>}
                      {item.explanation && <p className="text-xs text-gray-600 mt-1">{item.explanation}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {speakingFeedback.next_answer_blueprint && speakingFeedback.next_answer_blueprint.length > 0 && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm font-medium text-indigo-800 mb-1">Next Answer Blueprint</p>
                <ol className="text-sm text-indigo-700 list-decimal list-inside space-y-1">
                  {speakingFeedback.next_answer_blueprint.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            )}

            {speakingFeedback.band_justification && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800"><strong>Band Justification:</strong> {speakingFeedback.band_justification}</p>
              </div>
            )}

            {speakingFeedback.cap_reasons && speakingFeedback.cap_reasons.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800 mb-1">Band Cap Reasons</p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {speakingFeedback.cap_reasons.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {speakingFeedback.model_phrase_to_learn && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-800">📝 Phrase to Learn:</p>
                <p className="text-sm text-gray-700 italic">{speakingFeedback.model_phrase_to_learn}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('reading')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Reading
        </Button>
        <Button onClick={() => setCurrentSection('writing')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Writing <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
