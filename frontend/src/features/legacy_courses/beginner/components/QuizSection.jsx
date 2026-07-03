import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import {
  HelpCircle, ChevronLeft
} from 'lucide-react';

export default function QuizSection({
  selectedLesson,
  quizAnswers,
  handleQuizAnswer,
  quizSubmitted,
  setQuizSubmitted,
  setQuizAnswers,
  quizScore,
  submitQuiz,
  getText,
  setView,
  setSelectedLesson,
  setCurrentSection,
}) {
  return (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-cyan-600" />
        Lesson Quiz
      </h3>
      
      {!quizSubmitted ? (
        <>
          {/* Reading Questions */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-700">Reading Comprehension</h4>
            {selectedLesson.reading.questions.map((q, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900 mb-2">{idx + 1}. {q.question}</p>
                <Input
                  value={quizAnswers[`reading_${idx}`] || ''}
                  onChange={(e) => handleQuizAnswer(`reading_${idx}`, e.target.value)}
                  placeholder="Type your answer..."
                />
              </div>
            ))}
          </div>
          
          {/* Grammar Question */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Grammar Check</h4>
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="font-medium text-gray-900 mb-3">Which sentence is correct?</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="grammar"
                    value="wrong"
                    checked={quizAnswers['grammar'] === 'wrong'}
                    onChange={() => handleQuizAnswer('grammar', 'wrong')}
                  />
                  <span className="text-gray-700">{selectedLesson.common_mistake.wrong}</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="grammar"
                    value="correct"
                    checked={quizAnswers['grammar'] === 'correct'}
                    onChange={() => handleQuizAnswer('grammar', 'correct')}
                  />
                  <span className="text-gray-700">{selectedLesson.common_mistake.correct}</span>
                </label>
              </div>
            </div>
          </div>
          
          <Button onClick={submitQuiz} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            {getText('submitQuiz')}
          </Button>
        </>
      ) : (
        <div className="text-center py-8">
          {quizScore >= 90 ? (
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
          ) : quizScore >= 70 ? (
            <div className="text-6xl mb-4">⭐</div>
          ) : quizScore >= 50 ? (
            <div className="text-6xl mb-4">💪</div>
          ) : (
            <div className="text-6xl mb-4">📚</div>
          )}
          <h4 className="text-2xl font-bold text-gray-900 mb-2">
            {quizScore >= 90 ? getText('wow') : 
             quizScore >= 70 ? getText('superJob') : 
             quizScore >= 50 ? getText('goodTry') : getText('niceEffort')}
          </h4>
          <p className="text-4xl font-bold text-cyan-600 mb-4">{quizScore}%</p>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {quizScore >= 90 ? `🎉 ${getText('wowMsg')}` : 
             quizScore >= 70 ? `🌟 ${getText('superJobMsg')}` : 
             quizScore >= 50 ? `👍 ${getText('goodTryMsg')}` : 
             `💡 ${getText('niceEffortMsg')}`}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }} className="gap-2">
              🔄 {getText('tryAgain')}
            </Button>
            <Button 
              onClick={() => { setView('lessons'); setSelectedLesson(null); }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white gap-2"
            >
              🏠 {getText('backToLessons')}
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
