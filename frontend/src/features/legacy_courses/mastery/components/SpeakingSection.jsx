import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Textarea } from '../../../../components/ui/textarea';
import {
  Mic, CheckCircle, Square, Loader2, Award, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function SpeakingSection({
  selectedModule,
  getSpeakingPrompts,
  selectedSpeakingPrompt,
  setSelectedSpeakingPrompt,
  recording,
  startRecording,
  stopRecording,
  speakingResponse,
  setSpeakingResponse,
  evaluatingSpeaking,
  evaluateSpeaking,
  speakingFeedback,
  setCurrentSection,
}) {
    const speaking = selectedModule.speaking;
    const speakingPrompts = getSpeakingPrompts();
    const activeSpeakingPrompt = speakingPrompts.find((item) => item.id === selectedSpeakingPrompt) || speakingPrompts[0];
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5 text-violet-600" /> Speaking Practice
        </h3>
        
        {speaking?.part1 && speaking.part1.question && (
          <div className="mb-6 p-4 bg-violet-50 rounded-xl">
            <h4 className="font-bold text-violet-800 mb-2">Part 1</h4>
            <p className="text-lg text-gray-900 mb-2">{speaking.part1.question}</p>
            {speaking.part1.model_answer && (
              <details className="cursor-pointer">
                <summary className="text-sm text-violet-600 font-medium">View Model Answer</summary>
                <p className="mt-2 text-gray-700 bg-white p-3 rounded-lg italic text-sm">&ldquo;{speaking.part1.model_answer}&rdquo;</p>
              </details>
            )}
          </div>
        )}
        
        {speaking?.part2 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-bold text-blue-800 mb-2">Part 2 (Cue Card)</h4>
            <div className="bg-white p-4 rounded-lg border border-blue-200 mb-3 whitespace-pre-line">
              {speaking.part2.cue_card}
            </div>
            {speaking.part2.tips && speaking.part2.tips.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-blue-700 mb-1">💡 Tips:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {speaking.part2.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {speaking.part2.model_answer && (
              <details className="cursor-pointer">
                <summary className="text-sm text-blue-600 font-medium">View Model Answer</summary>
                <p className="mt-2 text-gray-700 bg-white p-3 rounded-lg italic text-sm">&ldquo;{speaking.part2.model_answer}&rdquo;</p>
              </details>
            )}
            {speaking.part2.follow_up_questions && speaking.part2.follow_up_questions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm font-medium text-blue-700 mb-2">Follow-up Questions:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {speaking.part2.follow_up_questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {speaking?.part3 && (
          <div className="mb-6 p-4 bg-green-50 rounded-xl">
            <h4 className="font-bold text-green-800 mb-2">Part 3 (Discussion)</h4>
            {/* Check if part3 has questions array */}
            {speaking.part3.questions && speaking.part3.questions.length > 0 ? (
              <div className="space-y-4">
                {speaking.part3.questions.map((q, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="font-medium text-gray-900 mb-2">Q{idx + 1}: {q.question}</p>
                    {q.model_answer && (
                      <details className="cursor-pointer">
                        <summary className="text-sm text-green-600 font-medium">View Model Answer</summary>
                        <p className="mt-2 text-gray-700 bg-green-50 p-3 rounded-lg italic text-sm">&ldquo;{q.model_answer}&rdquo;</p>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback for old format with single question/model_answer */
              <>
                <p className="text-lg text-gray-900 mb-2">{speaking.part3.question}</p>
                {speaking.part3.model_answer && (
                  <details className="cursor-pointer">
                    <summary className="text-sm text-green-600">Model Answer</summary>
                    <p className="mt-2 text-gray-700 bg-white p-3 rounded-lg italic">&ldquo;{speaking.part3.model_answer}&rdquo;</p>
                  </details>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Recording */}
        <div className="p-4 bg-gray-50 rounded-xl mb-4">
          {speakingPrompts.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {speakingPrompts.map((prompt) => (
                <Button
                  key={prompt.id}
                  variant={selectedSpeakingPrompt === prompt.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSpeakingPrompt(prompt.id)}
                >
                  {prompt.label}
                </Button>
              ))}
            </div>
          )}
          {activeSpeakingPrompt && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-violet-200">
              <p className="text-xs font-semibold text-violet-600 uppercase mb-1">Selected Prompt</p>
              <p className="text-sm text-gray-800 whitespace-pre-line">{activeSpeakingPrompt.question}</p>
            </div>
          )}
          <p className="text-sm text-gray-600 mb-3">Practice your answer:</p>
          <div className="flex gap-3 mb-3">
            {!recording ? (
              <Button onClick={startRecording} className="bg-violet-600 hover:bg-violet-700">
                <Mic className="w-4 h-4 mr-2" /> Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} className="bg-red-500 hover:bg-red-600">
                <Square className="w-4 h-4 mr-2" /> Stop
              </Button>
            )}
          </div>
          <Textarea value={speakingResponse} onChange={(e) => setSpeakingResponse(e.target.value)} placeholder="Or type your answer..." className="min-h-[100px]" />
          <Button onClick={evaluateSpeaking} disabled={!speakingResponse.trim() || evaluatingSpeaking} className="mt-3 bg-gradient-to-r from-violet-500 to-purple-600">
            {evaluatingSpeaking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Get Feedback
          </Button>
        </div>
        
        {speakingFeedback && (
          <div className={`p-5 rounded-xl ${speakingFeedback.band_score >= 6 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-6 h-6 text-amber-600" />
              <span className="font-bold text-xl">Band {speakingFeedback.band_score}</span>
            </div>
            
            {/* Criteria Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {speakingFeedback.fluency && (
                <div className="p-2 bg-white rounded-lg text-center">
                  <p className="text-xs text-gray-500">Fluency</p>
                  <p className="font-bold">{typeof speakingFeedback.fluency === 'object' ? speakingFeedback.fluency.score : speakingFeedback.fluency}</p>
                </div>
              )}
              {speakingFeedback.vocabulary && (
                <div className="p-2 bg-white rounded-lg text-center">
                  <p className="text-xs text-gray-500">Vocabulary</p>
                  <p className="font-bold">{typeof speakingFeedback.vocabulary === 'object' ? speakingFeedback.vocabulary.score : speakingFeedback.vocabulary}</p>
                </div>
              )}
              {speakingFeedback.grammar && (
                <div className="p-2 bg-white rounded-lg text-center">
                  <p className="text-xs text-gray-500">Grammar</p>
                  <p className="font-bold">{typeof speakingFeedback.grammar === 'object' ? speakingFeedback.grammar.score : speakingFeedback.grammar}</p>
                </div>
              )}
              {speakingFeedback.pronunciation && (
                <div className="p-2 bg-white rounded-lg text-center">
                  <p className="text-xs text-gray-500">Pronunciation</p>
                  <p className="font-bold">{typeof speakingFeedback.pronunciation === 'object' ? speakingFeedback.pronunciation.score : speakingFeedback.pronunciation}</p>
                </div>
              )}
            </div>
            
            <p className="text-gray-700 mb-4">{speakingFeedback.overall_feedback || speakingFeedback.feedback}</p>

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
            
            {/* Mistakes with Corrections */}
            {speakingFeedback.mistakes && speakingFeedback.mistakes.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Mistakes to Correct
                </h5>
                {speakingFeedback.mistakes.map((mistake, idx) => (
                  <div key={idx} className="mb-2 text-sm">
                    <p className="text-red-600 line-through">{mistake.original}</p>
                    <p className="text-green-600 font-medium">✓ {mistake.corrected}</p>
                    <p className="text-gray-600 text-xs italic">{mistake.explanation}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Vocabulary to Use */}
            {speakingFeedback.vocabulary_to_use && speakingFeedback.vocabulary_to_use.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-700 mb-2">📚 Vocabulary from Lesson to Use</h5>
                <div className="flex flex-wrap gap-2">
                  {speakingFeedback.vocabulary_to_use.map((word, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{word}</span>
                  ))}
                </div>
              </div>
            )}
            
            {speakingFeedback.improvement_tip && (
              <div className="p-3 bg-yellow-50 rounded-lg mb-3">
                <p className="text-sm text-yellow-800">💡 <strong>Tip:</strong> {speakingFeedback.improvement_tip}</p>
              </div>
            )}

            {speakingFeedback.high_priority_fixes && speakingFeedback.high_priority_fixes.length > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg mb-3">
                <h5 className="font-semibold text-orange-700 mb-2">🎯 High-Priority Fixes</h5>
                <ul className="space-y-1 text-sm text-orange-800">
                  {speakingFeedback.high_priority_fixes.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {speakingFeedback.line_by_line_corrections && speakingFeedback.line_by_line_corrections.length > 0 && (
              <div className="p-3 bg-rose-50 rounded-lg mb-3">
                <h5 className="font-semibold text-rose-700 mb-2">✍️ Line-by-Line Coaching</h5>
                <div className="space-y-2">
                  {speakingFeedback.line_by_line_corrections.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-rose-100">
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
              <div className="p-3 bg-indigo-50 rounded-lg mb-3">
                <h5 className="font-semibold text-indigo-700 mb-2">🧭 Next Answer Blueprint</h5>
                <ol className="text-sm text-indigo-800 space-y-1 list-decimal list-inside">
                  {speakingFeedback.next_answer_blueprint.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {speakingFeedback.band_justification && (
              <div className="p-3 bg-blue-50 rounded-lg mb-3">
                <p className="text-sm text-blue-800">📏 <strong>Band Justification:</strong> {speakingFeedback.band_justification}</p>
              </div>
            )}

            {speakingFeedback.cap_reasons && speakingFeedback.cap_reasons.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-1">Band Cap Reasons</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {speakingFeedback.cap_reasons.map((reason, idx) => (
                    <li key={idx}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {speakingFeedback.lesson_reference && (
              <p className="text-sm text-purple-600 mt-2">📖 <strong>Review:</strong> {speakingFeedback.lesson_reference}</p>
            )}
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('reading')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Reading
          </Button>
          <Button onClick={() => setCurrentSection('writing')} className="bg-gradient-to-r from-violet-500 to-purple-600">
            Next: Writing <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
}
