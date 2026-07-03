import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import {
  HelpCircle, Trophy, AlertCircle, CheckCircle, XCircle, Home, ChevronLeft
} from 'lucide-react';

export default function QuizSection({
  selectedModule,
  quizAnswers,
  handleQuizAnswer,
  quizSubmitted,
  setQuizSubmitted,
  setQuizAnswers,
  quizResults,
  setQuizResults,
  submitQuiz,
  setView,
  setSelectedModule,
  setCurrentSection,
}) {
  return (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-cyan-600" /> Module Quiz
      </h3>

      {!quizSubmitted ? (
        <>
          <div className="space-y-4 mb-6">
            {(selectedModule.quiz?.questions || selectedModule.reading?.questions || []).map((q, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900 mb-2">
                  {idx + 1}. {q.question}
                </p>
                {q.type && <p className="text-xs text-gray-500 mb-2 capitalize">Type: {q.type?.replace('_', ' ')}</p>}
                
                {q.options ? (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                        <input 
                          type="radio" 
                          name={`quiz_${idx}`} 
                          value={opt}
                          checked={quizAnswers[idx] === opt}
                          onChange={() => handleQuizAnswer(idx, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : q.type === 'true_false_ng' ? (
                  <div className="flex gap-3">
                    {['True', 'False', 'Not Given'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer">
                        <input 
                          type="radio" 
                          name={`quiz_${idx}`} 
                          value={opt}
                          checked={quizAnswers[idx] === opt}
                          onChange={() => handleQuizAnswer(idx, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <Input
                    placeholder="Your answer..."
                    value={quizAnswers[idx] || ''}
                    onChange={(e) => handleQuizAnswer(idx, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <Button onClick={submitQuiz} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
            Submit Quiz
          </Button>
        </>
      ) : (
        <div className="py-6">
          <div className="text-center mb-6">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${(quizResults?.score || 0) >= 70 ? 'text-yellow-500' : 'text-gray-400'}`} />
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h4>
            <p className="text-4xl font-bold text-cyan-600 mb-2">{quizResults?.score?.toFixed(0) || 0}%</p>
            <p className="text-gray-600">{quizResults?.score >= 90 ? '🌟 Outstanding!' : quizResults?.score >= 70 ? '🎉 Great job!' : quizResults?.score >= 50 ? '👍 Good effort!' : '📚 Keep studying!'}</p>
            {quizResults?.estimated_band && <p className="text-lg text-gray-600 mt-2">Estimated Band: {quizResults.estimated_band}</p>}
          </div>
          
          {/* Detailed Results */}
          <div className="space-y-3 mb-6">
            <h5 className="font-semibold text-gray-900">📋 Detailed Results:</h5>
            {(selectedModule.quiz?.questions || selectedModule.reading?.questions || []).map((q, idx) => {
              const userAnswer = quizAnswers[idx];
              const correctAnswer = q.correct || q.answer;
              const isAnswered = userAnswer && userAnswer.trim() !== '';
              const isCorrect = isAnswered && (
                userAnswer?.toLowerCase()?.trim() === correctAnswer?.toLowerCase()?.trim() ||
                userAnswer?.toLowerCase()?.includes(correctAnswer?.toLowerCase()) ||
                correctAnswer?.toLowerCase()?.includes(userAnswer?.toLowerCase()?.replace(/^[a-d]\)\s*/i, ''))
              );
              
              // Determine color: unanswered=gray, correct=green, incorrect=red
              const bgColor = !isAnswered ? 'bg-gray-100 border-gray-300' : isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
              const iconColor = !isAnswered ? 'text-gray-400' : isCorrect ? 'text-green-600' : 'text-red-600';
              
              return (
                <div key={idx} className={`p-4 rounded-lg border ${bgColor}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {!isAnswered ? (
                      <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    ) : isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{idx + 1}. {q.question}</p>
                      {!isAnswered && (
                        <>
                          <p className="text-gray-500 text-sm mt-1 italic">⚠️ Not answered (skipped)</p>
                          <p className="text-green-600 text-sm font-medium">Correct answer: {correctAnswer}</p>
                        </>
                      )}
                      {isAnswered && !isCorrect && (
                        <>
                          <p className="text-red-600 text-sm mt-1">Your answer: {userAnswer}</p>
                          <p className="text-green-600 text-sm font-medium">Correct: {correctAnswer}</p>
                        </>
                      )}
                      {isAnswered && isCorrect && <p className="text-green-600 text-sm mt-1">✓ Correct!</p>}
                      {q.explanation && (
                        <div className="mt-2 p-2 bg-white rounded text-sm">
                          <p className="text-gray-600"><strong>💡 Explanation:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Skill Breakdown */}
          {quizResults?.skill_breakdown && Object.keys(quizResults.skill_breakdown).length > 0 && (
            <div className="my-6 p-4 bg-gray-50 rounded-xl">
              <h5 className="font-semibold text-gray-800 mb-3">📊 Performance by Question Type</h5>
              <div className="space-y-2">
                {Object.entries(quizResults.skill_breakdown).map(([type, data]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-700 capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                      (data.correct / data.total) >= 0.7 ? 'bg-green-100 text-green-700' :
                      (data.correct / data.total) >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {data.correct}/{data.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Results breakdown */}
          <div className="text-left space-y-3 mb-6 mt-6">
            <h5 className="font-semibold text-gray-800 mb-3">📝 Detailed Results</h5>
            {quizResults?.results?.map((r, i) => (
              <div key={i} className={`p-3 rounded-lg ${r.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-start gap-2">
                  {r.is_correct ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                  <div>
                    <p className="font-medium text-gray-800">{r.question}</p>
                    <p className="text-sm text-gray-600">Your answer: {r.user_answer || '(empty)'}</p>
                    {!r.is_correct && <p className="text-sm text-green-600">Correct: {r.correct_answer}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); setQuizResults(null); }}>
              Try Again
            </Button>
            <Button onClick={() => { setView('modules'); setSelectedModule(null); }} className="bg-gradient-to-r from-amber-500 to-orange-600">
              <Home className="w-4 h-4 mr-2" /> Back to Modules
            </Button>
          </div>
        </div>
      )}

      {!quizSubmitted && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setCurrentSection('writing')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Writing
          </Button>
        </div>
      )}
    </Card>
  );
}
