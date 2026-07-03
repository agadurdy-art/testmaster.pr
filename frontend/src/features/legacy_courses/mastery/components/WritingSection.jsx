import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Textarea } from '../../../../components/ui/textarea';
import { Badge } from '../../../../components/ui/badge';
import {
  PenTool, BookOpen, FileText, Loader2, Award, CheckCircle, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function WritingSection({
  writingTrack,
  setWritingTrack,
  writingResponse,
  setWritingResponse,
  setWritingFeedback,
  evaluateWriting,
  evaluatingWriting,
  writingFeedback,
  selectedModule,
  languageBooster,
  setCurrentSection,
}) {
  return (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-orange-600" /> Writing
      </h3>
      
      {/* Track Toggle - Academic vs General Training */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm font-medium text-gray-600 mb-3">Select IELTS Track:</p>
        <div className="flex gap-2">
          <Button
            variant={writingTrack === 'academic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setWritingTrack('academic'); setWritingResponse(''); setWritingFeedback(null); }}
            className={writingTrack === 'academic' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <BookOpen className="w-4 h-4 mr-1" /> Academic IELTS
          </Button>
          <Button
            variant={writingTrack === 'general' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setWritingTrack('general'); setWritingResponse(''); setWritingFeedback(null); }}
            className={writingTrack === 'general' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <FileText className="w-4 h-4 mr-1" /> General Training
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {writingTrack === 'academic' 
            ? '📝 Task 2: Academic Essay - Opinion, Discussion, Problem-Solution'
            : '✉️ Task 1: Letter Writing - Formal, Semi-formal, Informal'}
        </p>
      </div>
      
      {/* Academic Writing Content */}
      {writingTrack === 'academic' && (
        <>
          <div className="bg-orange-50 rounded-xl p-5 mb-6">
            <p className="text-xs text-orange-600 font-semibold mb-2">ACADEMIC TASK 2 - ESSAY</p>
            <p className="text-lg text-gray-900 font-medium">{selectedModule.writing?.question}</p>
          </div>
          
          <div className="mb-6">
            <Textarea value={writingResponse} onChange={(e) => setWritingResponse(e.target.value)} placeholder="Write your essay here (aim for 250+ words)..." className="min-h-[200px]" />
            <p className="text-sm text-gray-500 mt-2">Words: {writingResponse.trim().split(/\s+/).filter(w => w).length}</p>
            <Button onClick={evaluateWriting} disabled={!writingResponse.trim() || evaluatingWriting} className="mt-4 bg-gradient-to-r from-orange-500 to-amber-600">
              {evaluatingWriting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Get Feedback
            </Button>
          </div>
          
          <details className="cursor-pointer mb-4">
            <summary className="font-bold text-green-700">📝 Model Essay (Band 6)</summary>
            <div className="mt-2 p-4 bg-green-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-line">{selectedModule.writing?.model_essay}</p>
              {selectedModule.writing?.notes && <p className="text-sm text-green-600 mt-2 italic">{selectedModule.writing.notes}</p>}
            </div>
          </details>
        </>
      )}
      
      {/* General Training Writing Content */}
      {writingTrack === 'general' && (
        <>
          {languageBooster ? (
            <>
              {/* Module-Specific Language Booster Content */}
              <div className="bg-purple-50 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-purple-600 text-white">{languageBooster.module.toUpperCase()}</Badge>
                  <span className="text-xs text-purple-600 font-semibold">GENERAL TRAINING - Module-Specific</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{languageBooster.learning_outcome}</p>
                
                {/* Key Vocabulary */}
                <details className="mb-4 cursor-pointer">
                  <summary className="font-bold text-purple-700 flex items-center gap-2">
                    📘 Key Vocabulary ({languageBooster.key_vocabulary?.length || 0} words)
                  </summary>
                  <div className="mt-2 p-3 bg-white rounded-lg max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {languageBooster.key_vocabulary?.map((vocab, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium text-purple-700">{vocab.word}</span>
                          <span className="text-gray-500"> - {vocab.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
                
                {/* Functional Phrases */}
                <details className="mb-4 cursor-pointer">
                  <summary className="font-bold text-blue-700 flex items-center gap-2">
                    🧩 Functional Phrases
                  </summary>
                  <div className="mt-2 p-3 bg-white rounded-lg space-y-3">
                    {languageBooster.functional_phrases?.requests && (
                      <div>
                        <p className="text-xs font-semibold text-blue-600 mb-1">For Requests:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {languageBooster.functional_phrases.requests.map((phrase, i) => (
                            <li key={i} className="italic">• {phrase}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {languageBooster.functional_phrases?.complaints && (
                      <div>
                        <p className="text-xs font-semibold text-red-600 mb-1">For Complaints:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {languageBooster.functional_phrases.complaints.map((phrase, i) => (
                            <li key={i} className="italic">• {phrase}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {languageBooster.functional_phrases?.explanations && (
                      <div>
                        <p className="text-xs font-semibold text-green-600 mb-1">For Explanations:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {languageBooster.functional_phrases.explanations.map((phrase, i) => (
                            <li key={i} className="italic">• {phrase}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </details>
                
                {/* Common Mistakes */}
                {languageBooster.common_mistakes && (
                  <details className="mb-4 cursor-pointer">
                    <summary className="font-bold text-red-700 flex items-center gap-2">
                      ⚠️ Common Mistakes
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded-lg space-y-2">
                      {languageBooster.common_mistakes.map((mistake, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                          <p className="text-red-600 line-through">{mistake.wrong}</p>
                          <p className="text-green-600 font-medium">✓ {mistake.correct}</p>
                          <p className="text-gray-500 text-xs italic">{mistake.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
              
              {/* Writing Task from Language Booster */}
              {languageBooster.writing_task && (
                <>
                  <div className="bg-orange-50 rounded-xl p-5 mb-6">
                    <p className="text-xs text-orange-600 font-semibold mb-2">WRITING TASK - {languageBooster.writing_task.title}</p>
                    <p className="text-gray-900 whitespace-pre-line">{languageBooster.writing_task.prompt}</p>
                  </div>
                  
                  <div className="mb-6">
                    <Textarea 
                      value={writingResponse} 
                      onChange={(e) => setWritingResponse(e.target.value)} 
                      placeholder="Write your letter here (aim for 150+ words)..." 
                      className="min-h-[200px]" 
                    />
                    <p className="text-sm text-gray-500 mt-2">Words: {writingResponse.trim().split(/\s+/).filter(w => w).length}</p>
                    <Button 
                      onClick={evaluateWriting} 
                      disabled={!writingResponse.trim() || evaluatingWriting} 
                      className="mt-4 bg-gradient-to-r from-purple-500 to-pink-600"
                    >
                      {evaluatingWriting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Get Feedback
                    </Button>
                  </div>
                  
                  {/* Model Answers */}
                  {languageBooster.writing_task.model_answer && (
                    <div className="space-y-3 mb-4">
                      <details className="cursor-pointer">
                        <summary className="font-bold text-amber-700">📝 Model Letter (Band 6)</summary>
                        <div className="mt-2 p-4 bg-amber-50 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-line font-mono text-sm">
                            {languageBooster.writing_task.model_answer.band_6}
                          </p>
                        </div>
                      </details>
                      
                      <details className="cursor-pointer">
                        <summary className="font-bold text-green-700">🏆 Model Letter (Band 8)</summary>
                        <div className="mt-2 p-4 bg-green-50 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-line font-mono text-sm">
                            {languageBooster.writing_task.model_answer.band_8}
                          </p>
                        </div>
                      </details>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Module-specific content loading...</p>
            </div>
          )}
        </>
      )}
      
      {writingFeedback && (
        <div className={`p-5 rounded-xl ${writingFeedback.band_score >= 6 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-6 h-6 text-orange-600" />
            <span className="font-bold text-xl">Band {writingFeedback.band_score}</span>
          </div>
          
          {/* Criteria Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {writingFeedback.task_achievement && (
              <div className="p-2 bg-white rounded-lg text-center">
                <p className="text-xs text-gray-500">Task</p>
                <p className="font-bold">{typeof writingFeedback.task_achievement === 'object' ? writingFeedback.task_achievement.score : writingFeedback.task_achievement}</p>
              </div>
            )}
            {writingFeedback.coherence && (
              <div className="p-2 bg-white rounded-lg text-center">
                <p className="text-xs text-gray-500">Coherence</p>
                <p className="font-bold">{typeof writingFeedback.coherence === 'object' ? writingFeedback.coherence.score : writingFeedback.coherence}</p>
              </div>
            )}
            {writingFeedback.lexical && (
              <div className="p-2 bg-white rounded-lg text-center">
                <p className="text-xs text-gray-500">Lexical</p>
                <p className="font-bold">{typeof writingFeedback.lexical === 'object' ? writingFeedback.lexical.score : writingFeedback.lexical}</p>
              </div>
            )}
            {writingFeedback.grammar && (
              <div className="p-2 bg-white rounded-lg text-center">
                <p className="text-xs text-gray-500">Grammar</p>
                <p className="font-bold">{typeof writingFeedback.grammar === 'object' ? writingFeedback.grammar.score : writingFeedback.grammar}</p>
              </div>
            )}
          </div>
          
          <p className="text-gray-700 mb-4">{writingFeedback.overall_feedback || writingFeedback.feedback}</p>
          
          {/* Good Points */}
          {writingFeedback.good_points && writingFeedback.good_points.length > 0 && (
            <div className="mb-4 p-3 bg-green-100 rounded-lg">
              <h5 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> What You Did Well
              </h5>
              <ul className="text-sm text-green-800 space-y-1">
                {writingFeedback.good_points.map((point, idx) => (
                  <li key={idx}>✓ {point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Mistakes with Corrections */}
          {writingFeedback.mistakes && writingFeedback.mistakes.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <h5 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Mistakes to Correct
              </h5>
              {writingFeedback.mistakes.map((mistake, idx) => (
                <div key={idx} className="mb-3 p-2 bg-white rounded">
                  <p className="text-red-600 line-through text-sm">{mistake.original}</p>
                  <p className="text-green-600 font-medium text-sm">✓ {mistake.corrected}</p>
                  <p className="text-gray-600 text-xs italic mt-1">
                    <span className="bg-gray-100 px-1 rounded">{mistake.type}</span> - {mistake.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {/* Vocabulary Suggestions */}
          {writingFeedback.vocabulary_suggestions && writingFeedback.vocabulary_suggestions.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-700 mb-2">📚 Upgrade Your Vocabulary</h5>
              {writingFeedback.vocabulary_suggestions.map((sug, idx) => (
                <div key={idx} className="mb-2 text-sm">
                  <span className="text-gray-500">{sug.basic}</span> → <span className="text-blue-600 font-medium">{sug.advanced}</span>
                  <p className="text-xs text-gray-600 italic">&ldquo;{sug.example}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
          
          {writingFeedback.structure_tip && (
            <div className="p-3 bg-yellow-50 rounded-lg mb-3">
              <p className="text-sm text-yellow-800">📝 <strong>Structure Tip:</strong> {writingFeedback.structure_tip}</p>
            </div>
          )}
          
          {writingFeedback.lesson_reference && (
            <p className="text-sm text-purple-600 mb-2">📖 <strong>Review:</strong> {writingFeedback.lesson_reference}</p>
          )}
          
          {/* Next Steps */}
          {writingFeedback.next_steps && writingFeedback.next_steps.length > 0 && (
            <div className="p-3 bg-indigo-50 rounded-lg mt-3">
              <h5 className="font-semibold text-indigo-700 mb-2">🎯 Next Steps</h5>
              <ol className="text-sm text-indigo-800 space-y-1 list-decimal list-inside">
                {writingFeedback.next_steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {writingFeedback.line_by_line_corrections && writingFeedback.line_by_line_corrections.length > 0 && (
            <div className="p-3 bg-rose-50 rounded-lg mt-3">
              <h5 className="font-semibold text-rose-700 mb-3">✍️ Line-by-Line Corrections</h5>
              <div className="space-y-3">
                {writingFeedback.line_by_line_corrections.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-rose-100">
                    <p className="text-sm text-red-600 line-through mb-1">{item.original}</p>
                    <p className="text-sm text-green-700 font-medium mb-1">✓ {item.corrected}</p>
                    {item.issue && <p className="text-xs font-semibold text-rose-600 mb-1">{item.issue}</p>}
                    {item.explanation && <p className="text-xs text-gray-600">{item.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {writingFeedback.grammar_upgrade_examples && writingFeedback.grammar_upgrade_examples.length > 0 && (
            <div className="p-3 bg-purple-50 rounded-lg mt-3">
              <h5 className="font-semibold text-purple-700 mb-3">✨ Sentence Upgrades</h5>
              <div className="space-y-3">
                {writingFeedback.grammar_upgrade_examples.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-purple-100">
                    <p className="text-sm text-red-600 line-through mb-1">{item.original}</p>
                    <p className="text-sm text-green-700 font-medium mb-1">✓ {item.upgraded}</p>
                    {item.explanation && <p className="text-xs text-gray-600">{item.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {writingFeedback.band_justification && (
            <div className="p-3 bg-blue-50 rounded-lg mt-3">
              <h5 className="font-semibold text-blue-700 mb-2">📏 Band Justification</h5>
              <p className="text-sm text-gray-700">{writingFeedback.band_justification}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('speaking')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Speaking
        </Button>
        <Button onClick={() => setCurrentSection('quiz')} className="bg-gradient-to-r from-violet-500 to-purple-600">
          Next: Quiz <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
