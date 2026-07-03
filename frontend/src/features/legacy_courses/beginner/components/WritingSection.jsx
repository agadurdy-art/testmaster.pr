import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Textarea } from '../../../../components/ui/textarea';
import { Badge } from '../../../../components/ui/badge';
import {
  PenTool, BookOpen, FileText, Loader2, CheckCircle, Star, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function WritingSection({
  writingTrack,
  setWritingTrack,
  writingResponse,
  setWritingResponse,
  writingFeedback,
  setWritingFeedback,
  evaluateWriting,
  evaluatingWriting,
  selectedLesson,
  generalLessons,
  selectedGeneralLesson,
  setSelectedGeneralLesson,
  setCurrentSection,
}) {
    if (!selectedLesson?.writing && writingTrack === 'academic') return <Card className="p-6"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></Card>;
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-orange-600" />
          Writing Practice
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
              ? '📝 Academic: Basic essay and paragraph writing'
              : '✉️ General: Letter writing basics (Formal, Informal, Semi-formal)'}
          </p>
        </div>
        
        {/* Academic Writing Content */}
        {writingTrack === 'academic' && selectedLesson?.writing && (
          <>
            <div className="bg-orange-50 rounded-xl p-5 mb-6">
              <p className="text-sm text-orange-600 font-medium mb-2">ACADEMIC WRITING TASK:</p>
              <p className="text-xl text-gray-900 font-medium">{selectedLesson.writing.task}</p>
            </div>
          
            <div className="mb-6">
              <Textarea
                value={writingResponse}
                onChange={(e) => setWritingResponse(e.target.value)}
                placeholder="Write your answer here..."
                className="min-h-[150px]"
              />
              <p className="text-sm text-gray-500 mt-2">Words: {writingResponse.trim().split(/\s+/).filter(w => w).length}</p>
              
              <Button 
                onClick={evaluateWriting} 
                disabled={!writingResponse.trim() || evaluatingWriting}
                className="mt-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
              >
                {evaluatingWriting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Get Feedback
              </Button>
            </div>
            
            {/* Model Answer */}
            <details className="cursor-pointer mb-4">
              <summary className="font-bold text-green-700">📝 Model Answer</summary>
              <div className="mt-2 p-4 bg-green-50 rounded-lg">
                <p className="text-gray-800 italic">&ldquo;{selectedLesson.writing.model_answer}&rdquo;</p>
              </div>
            </details>
          </>
        )}
        
        {/* General Training Writing Content - GLOBAL FOUNDATION LESSONS for Beginner */}
        {writingTrack === 'general' && (
          <>
            {generalLessons.length > 0 ? (
              <>
                {/* Lesson Selector */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Select a Foundation Lesson:</p>
                  <div className="flex flex-wrap gap-2">
                    {generalLessons.map((lesson, idx) => (
                      <Button
                        key={idx}
                        variant={selectedGeneralLesson?.id === lesson.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setSelectedGeneralLesson(lesson); setWritingResponse(''); setWritingFeedback(null); }}
                        className={selectedGeneralLesson?.id === lesson.id ? 'bg-purple-600' : ''}
                      >
                        {lesson.topic || lesson.title}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {selectedGeneralLesson && (
                  <>
                    {/* Lesson Content */}
                    <div className="bg-purple-50 rounded-xl p-5 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-purple-600 text-white">FOUNDATION</Badge>
                        <span className="text-xs text-purple-600 font-semibold">GENERAL TRAINING - {selectedGeneralLesson.topic}</span>
                      </div>
                      
                      {/* Learning Goals */}
                      {selectedGeneralLesson.learning_goals && (
                        <div className="mb-4 p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-2">🎯 Learning Goals:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedGeneralLesson.learning_goals.map((goal, i) => (
                              <li key={i}>• {goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Key Concepts */}
                      {selectedGeneralLesson.writing?.key_concepts && (
                        <div className="mb-4 p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-blue-700 mb-2">📚 Key Concepts:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedGeneralLesson.writing.key_concepts.map((concept, i) => (
                              <li key={i}>• {concept}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Formal Phrases (if available) */}
                      {selectedGeneralLesson.writing?.formal_phrases && (
                        <details className="mb-4 cursor-pointer">
                          <summary className="font-bold text-blue-700 flex items-center gap-2">
                            🧩 Useful Phrases
                          </summary>
                          <div className="mt-2 p-3 bg-white rounded-lg space-y-3">
                            {selectedGeneralLesson.writing.formal_phrases.opening_reason && (
                              <div>
                                <p className="text-xs font-semibold text-blue-600 mb-1">Opening (Reason for writing):</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {selectedGeneralLesson.writing.formal_phrases.opening_reason.map((phrase, i) => (
                                    <li key={i} className="italic">• {phrase}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedGeneralLesson.writing.formal_phrases.requests && (
                              <div>
                                <p className="text-xs font-semibold text-green-600 mb-1">Making Requests:</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {selectedGeneralLesson.writing.formal_phrases.requests.map((phrase, i) => (
                                    <li key={i} className="italic">• {phrase}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedGeneralLesson.writing.formal_phrases.closing && (
                              <div>
                                <p className="text-xs font-semibold text-purple-600 mb-1">Closing:</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {selectedGeneralLesson.writing.formal_phrases.closing.map((phrase, i) => (
                                    <li key={i} className="italic">• {phrase}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                      
                      {/* Informal Phrases (if available) */}
                      {selectedGeneralLesson.writing?.informal_phrases && (
                        <details className="mb-4 cursor-pointer">
                          <summary className="font-bold text-pink-700 flex items-center gap-2">
                            💬 Informal Phrases
                          </summary>
                          <div className="mt-2 p-3 bg-white rounded-lg space-y-3">
                            {selectedGeneralLesson.writing.informal_phrases.opening && (
                              <div>
                                <p className="text-xs font-semibold text-pink-600 mb-1">Opening:</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {selectedGeneralLesson.writing.informal_phrases.opening.map((phrase, i) => (
                                    <li key={i} className="italic">• {phrase}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedGeneralLesson.writing.informal_phrases.news && (
                              <div>
                                <p className="text-xs font-semibold text-pink-600 mb-1">Sharing News:</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {selectedGeneralLesson.writing.informal_phrases.news.map((phrase, i) => (
                                    <li key={i} className="italic">• {phrase}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                      
                      {/* Common Mistakes */}
                      {selectedGeneralLesson.common_mistakes && (
                        <details className="cursor-pointer">
                          <summary className="font-bold text-red-700 flex items-center gap-2">
                            ⚠️ Common Mistakes
                          </summary>
                          <div className="mt-2 p-3 bg-white rounded-lg space-y-2">
                            {selectedGeneralLesson.common_mistakes.map((mistake, i) => (
                              <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                                <p className="text-red-600 line-through">{mistake.wrong}</p>
                                <p className="text-green-600 font-medium">✓ {mistake.correct}</p>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                    
                    {/* Writing Practice Task */}
                    <div className="bg-orange-50 rounded-xl p-5 mb-6">
                      <p className="text-xs text-orange-600 font-semibold mb-2">PRACTICE TASK</p>
                      <p className="text-gray-900">{selectedGeneralLesson.writing?.example_task || selectedGeneralLesson.writing?.title}</p>
                    </div>
                    
                    <div className="mb-6">
                      <Textarea 
                        value={writingResponse} 
                        onChange={(e) => setWritingResponse(e.target.value)} 
                        placeholder="Write your letter here (aim for 150+ words)..." 
                        className="min-h-[150px]" 
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
                    {selectedGeneralLesson.writing?.model_answer && (
                      <div className="space-y-3 mb-4">
                        <details className="cursor-pointer">
                          <summary className="font-bold text-amber-700">📝 Model Answer (Band 6)</summary>
                          <div className="mt-2 p-4 bg-amber-50 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-line font-mono text-sm">
                              {selectedGeneralLesson.writing.model_answer.band_6}
                            </p>
                          </div>
                        </details>
                        
                        <details className="cursor-pointer">
                          <summary className="font-bold text-green-700">🏆 Model Answer (Band 8)</summary>
                          <div className="mt-2 p-4 bg-green-50 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-line font-mono text-sm">
                              {selectedGeneralLesson.writing.model_answer.band_8}
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
                <p className="text-gray-500">Loading General Training lessons...</p>
              </div>
            )}
          </>
        )}
      
      {/* Feedback */}
      {writingFeedback && (
        <div className={`p-4 rounded-xl ${writingFeedback.score >= 70 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {writingFeedback.score >= 70 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Star className="w-5 h-5 text-yellow-600" />
            )}
            <span className="font-bold">Score: {writingFeedback.score}%</span>
          </div>
          <p className="text-gray-700">{writingFeedback.feedback}</p>
          {writingFeedback.grammar_tips && writingFeedback.grammar_tips.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Grammar Tips:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                {writingFeedback.grammar_tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('speaking')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Speaking
        </Button>
        <Button onClick={() => setCurrentSection('quiz')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          Next: Quiz <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
    );
}
