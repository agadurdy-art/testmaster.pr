import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Textarea } from '../../../../components/ui/textarea';
import { Badge } from '../../../../components/ui/badge';
import {
  PenTool, BookOpen, Target, CheckCircle, Lightbulb, ChevronLeft, ChevronRight
} from 'lucide-react';
import { WritingEvaluationResult } from '../../../../components/EvaluationResult';

export default function WritingSection({
  writingTrack,
  setWritingTrack,
  writingResponse,
  setWritingResponse,
  setWritingFeedback,
  evaluateWriting,
  writingLoading,
  writingFeedback,
  strategicWriting,
  selectedModule,
  navigate,
  setCurrentSection,
}) {
  return (
    <Card id="writing-section" className="p-6 bg-white border-0 shadow-lg scroll-mt-24">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-orange-600" /> Advanced Writing
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
            <Target className="w-4 h-4 mr-1" /> General Training
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {writingTrack === 'academic' 
            ? '📝 Academic: Band 7-9 Advanced Essay Techniques'
            : '✉️ General: Band 7-9 Letter Writing Mastery & Nuanced Tone Control'}
        </p>
      </div>

      {/* Academic Writing Content */}
      {writingTrack === 'academic' && (
        <div className="space-y-6">
          {/* Task Prompt */}
          <div className="p-4 bg-orange-50 rounded-xl">
            <h4 className="font-semibold text-orange-800 mb-2">ACADEMIC TASK</h4>
            <p className="text-gray-700">{selectedModule.writing?.question || selectedModule.writing?.prompt}</p>
          </div>

          {/* Tips */}
          {selectedModule.writing?.tips && selectedModule.writing.tips.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-xl">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Writing Tips</h4>
              <ul className="space-y-1">
                {selectedModule.writing.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Useful Phrases */}
          {selectedModule.writing?.useful_phrases && selectedModule.writing.useful_phrases.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-2">📝 Useful Phrases</h4>
              <div className="flex flex-wrap gap-2">
                {selectedModule.writing.useful_phrases.map((phrase, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{phrase}</span>
                ))}
              </div>
            </div>
          )}

          {/* Model Essay */}
          {(selectedModule.writing?.model_essay || selectedModule.writing?.band75_excerpt) && (
            <details className="p-4 bg-gray-50 rounded-xl">
              <summary className="font-semibold text-gray-800 cursor-pointer hover:text-orange-600">View Band 7.5+ Model Essay</summary>
              <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedModule.writing?.model_essay || selectedModule.writing?.band75_excerpt}
                </p>
              </div>
            </details>
          )}

          {/* Writing Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Essay (minimum 250 words)
            </label>
            <Textarea
              value={writingResponse}
              onChange={(e) => setWritingResponse(e.target.value)}
              placeholder="Write your essay here..."
              rows={12}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Word count: {writingResponse.trim().split(/\s+/).filter(w => w).length}
            </p>
          </div>

          <Button 
            onClick={evaluateWriting} 
            disabled={writingLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600"
          >
            {writingLoading ? 'Evaluating...' : 'Get AI Evaluation'}
          </Button>
        </div>
      )}

      {/* General Training Writing Content - STRATEGIC + MODULE-SPECIFIC for Advanced */}
      {writingTrack === 'general' && (
        <div className="space-y-6">
          {strategicWriting ? (
            <>
              {/* Strategic Writing Header */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge className="bg-purple-600 text-white">ADVANCED</Badge>
                  <Badge className="bg-pink-600 text-white">STRATEGIC</Badge>
                  <span className="text-xs text-purple-600 font-semibold">{strategicWriting.module_title}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{strategicWriting.strategic_focus}</h3>
                <p className="text-sm text-gray-600 mb-4">{strategicWriting.learning_outcome}</p>
                
                {/* Strategic Elements */}
                {strategicWriting.writing_scenario?.strategic_elements && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-white rounded-lg border border-purple-100">
                      <p className="text-xs font-bold text-purple-700 mb-1">🎭 TONE</p>
                      <p className="text-sm text-gray-700">{strategicWriting.writing_scenario.strategic_elements.tone}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <p className="text-xs font-bold text-blue-700 mb-1">🎯 PURPOSE</p>
                      <p className="text-sm text-gray-700">{strategicWriting.writing_scenario.strategic_elements.purpose}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-green-100">
                      <p className="text-xs font-bold text-green-700 mb-1">💡 ARGUMENT</p>
                      <p className="text-sm text-gray-700">{strategicWriting.writing_scenario.strategic_elements.argument}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Writing Scenario & Task */}
              {strategicWriting.writing_scenario && (
                <>
                  <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-orange-600 text-white">{strategicWriting.band_target}</Badge>
                      <span className="text-sm font-semibold text-orange-700">{strategicWriting.writing_scenario.title}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 italic mb-4">{strategicWriting.writing_scenario.context}</p>
                    
                    <p className="text-gray-900 whitespace-pre-line">{strategicWriting.writing_scenario.prompt}</p>
                  </div>
                  
                  {/* Key Phrases */}
                  {strategicWriting.writing_scenario.key_phrases && (
                    <details className="cursor-pointer">
                      <summary className="font-bold text-purple-700 flex items-center gap-2">
                        🔑 Key Strategic Phrases
                      </summary>
                      <div className="mt-2 p-4 bg-white rounded-lg border border-purple-100 space-y-2">
                        {strategicWriting.writing_scenario.key_phrases.map((phrase, i) => (
                          <p key={i} className="text-sm text-gray-700 italic pl-4 border-l-2 border-purple-300">
                            &ldquo;{phrase}&rdquo;
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                  
                  {/* Writing Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Response (Band 7-9 Target, 150+ words)
                    </label>
                    <Textarea 
                      value={writingResponse} 
                      onChange={(e) => setWritingResponse(e.target.value)} 
                      placeholder="Write your strategic response here..." 
                      rows={12}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">Words: {writingResponse.trim().split(/\s+/).filter(w => w).length}</p>
                  </div>

                  <Button 
                    onClick={evaluateWriting} 
                    disabled={writingLoading} 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                  >
                    {writingLoading ? 'Evaluating...' : 'Get AI Evaluation'}
                  </Button>
                  
                  {/* Band 8 Model Answer */}
                  {strategicWriting.writing_scenario.model_answer && (
                    <div className="space-y-3">
                      <details className="cursor-pointer">
                        <summary className="font-bold text-green-700 flex items-center gap-2">
                          🏆 Band 8 Model Answer
                        </summary>
                        <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-gray-700 whitespace-pre-line font-mono text-sm">
                            {strategicWriting.writing_scenario.model_answer.band_8}
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
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Loading strategic writing content...</p>
            </div>
          )}
        </div>
      )}

      {/* Track-Specific Feedback Display - NEW Evaluation UI */}
      {writingFeedback && (
        <div className="mt-6">
          <WritingEvaluationResult 
            evaluation={writingFeedback}
            expectedTrack={writingTrack}
            onLessonClick={(lesson) => {
              if (lesson.path) {
                navigate(lesson.path);
              }
            }}
          />
          
          {/* Improvement Suggestions */}
          {writingFeedback.improvement_suggestions && writingFeedback.improvement_suggestions.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Improvement Tips</p>
              <ul className="space-y-2">
                {writingFeedback.improvement_suggestions.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {writingFeedback.line_by_line_corrections && writingFeedback.line_by_line_corrections.length > 0 && (
            <div className="mt-4 p-4 bg-rose-50 rounded-lg border border-rose-200">
              <p className="text-sm font-semibold text-rose-700 uppercase tracking-wide mb-3">Line-by-Line Corrections</p>
              <div className="space-y-3">
                {writingFeedback.line_by_line_corrections.map((item, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-rose-100">
                    <p className="text-sm text-red-600 line-through mb-1">{item.original}</p>
                    <p className="text-sm text-green-700 font-medium mb-1">→ {item.corrected}</p>
                    {item.issue && <p className="text-xs font-semibold text-rose-600 mb-1">{item.issue}</p>}
                    {item.explanation && <p className="text-xs text-gray-600">{item.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {writingFeedback.grammar_upgrade_examples && writingFeedback.grammar_upgrade_examples.length > 0 && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-3">Sentence Upgrades</p>
              <div className="space-y-3">
                {writingFeedback.grammar_upgrade_examples.map((item, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-purple-100">
                    <p className="text-sm text-red-600 line-through mb-1">{item.original}</p>
                    <p className="text-sm text-green-700 font-medium mb-1">→ {item.upgraded}</p>
                    {item.explanation && <p className="text-xs text-gray-600">{item.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {writingFeedback.band_justification && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">Band Justification</p>
              <p className="text-sm text-gray-700">{writingFeedback.band_justification}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('speaking')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Speaking
        </Button>
        <Button onClick={() => setCurrentSection('quiz')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Quiz <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
