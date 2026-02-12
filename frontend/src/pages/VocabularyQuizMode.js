import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, ArrowRight, CheckCircle, XCircle, 
  Award, RotateCcw, Trophy, BookOpen, Target
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const PASSING_SCORE = 80;

export default function VocabularyQuizMode({ user }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [moduleId]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vocabulary-engine/${moduleId}/quiz`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      } else {
        toast.error('Failed to load quiz');
        navigate('/advanced-mastery');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, answer) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    if (!data) return;
    
    let correctCount = 0;
    data.questions.forEach(q => {
      if (answers[q.id] === q.answer) correctCount++;
    });

    const total = data.questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const passed = percentage >= PASSING_SCORE;

    setResult({ score: correctCount, total, percentage, passed });
    setSubmitted(true);

    // Save to backend
    if (user) {
      try {
        await fetch(`${API_URL}/api/vocabulary-engine/quiz/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module_id: moduleId,
            user_id: user.id,
            answers,
            score: correctCount,
            total,
          }),
        });
      } catch {
        console.error('Failed to save quiz result');
      }
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    fetchQuiz();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center" data-testid="quiz-mode-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.questions?.length) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p>No quiz questions available.</p>
      </div>
    );
  }

  // Results screen
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col" data-testid="quiz-results-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80">
          <button 
            onClick={() => navigate('/advanced-mastery')} 
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            data-testid="back-from-quiz-results"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Course
          </button>
          <p className="text-sm font-medium text-slate-300">Mastery Quiz Results</p>
          <div />
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            {/* Score card */}
            <div className="text-center mb-8">
              <div className={`w-28 h-28 mx-auto mb-4 rounded-full flex items-center justify-center ${
                result.passed ? 'bg-emerald-500/20' : 'bg-red-500/20'
              }`}>
                {result.passed 
                  ? <Trophy className="w-14 h-14 text-emerald-400" />
                  : <Target className="w-14 h-14 text-red-400" />
                }
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {result.passed ? 'Mastery Achieved!' : 'Keep Practicing'}
              </h2>
              <p className="text-slate-400">
                {result.passed 
                  ? 'You have mastered this vocabulary module.' 
                  : `You need ${PASSING_SCORE}% to pass. Review and try again.`
                }
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl border border-white/10 p-6 mb-6 text-center">
              <div className="text-6xl font-bold mb-2" data-testid="quiz-final-score">
                <span className={result.passed ? 'text-emerald-400' : 'text-red-400'}>
                  {result.percentage}%
                </span>
              </div>
              <p className="text-slate-400">{result.score} / {result.total} correct</p>
              <Badge className={`mt-3 ${result.passed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                {result.passed ? 'PASSED' : 'NOT PASSED'}
              </Badge>
            </div>

            {/* Question review */}
            <div className="bg-slate-900 rounded-xl border border-white/10 p-4 mb-6 max-h-72 overflow-y-auto">
              <p className="text-sm text-slate-400 mb-3">Question Review</p>
              {data.questions.map((q, i) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.answer;
                return (
                  <div key={i} className={`p-3 rounded-lg mb-2 ${isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    <div className="flex items-start gap-2">
                      {isCorrect 
                        ? <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 leading-snug">{q.question}</p>
                        {!isCorrect && (
                          <p className="text-xs text-emerald-400 mt-1">Correct: {q.answer}) {q.options?.find(o => o.startsWith(q.answer))?.slice(3) || ''}</p>
                        )}
                        {q.explanation && (
                          <p className="text-xs text-slate-500 mt-1">{q.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              {!result.passed && (
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="flex-1 border-white/10 text-slate-300 hover:bg-white/10"
                  data-testid="retry-quiz-btn"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Try Again
                </Button>
              )}
              <Button
                onClick={() => navigate('/advanced-mastery')}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                data-testid="back-to-modules-btn"
              >
                <BookOpen className="w-4 h-4 mr-2" /> {result.passed ? 'Next Module' : 'Back to Course'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = data.questions[currentIdx];
  const progress = ((currentIdx + 1) / data.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col" data-testid="vocabulary-quiz-mode">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/advanced-mastery')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          data-testid="back-from-quiz"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-sm font-medium text-slate-300">Mastery Quiz</p>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            {answeredCount}/{data.questions.length}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
          data-testid="quiz-progress-bar"
        />
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Question number */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-slate-500">Question {currentIdx + 1} of {data.questions.length}</span>
          </div>

          {/* Question */}
          <div className="bg-slate-900 rounded-xl border border-white/10 p-6 mb-6">
            <p className="text-lg text-slate-200 leading-relaxed" data-testid="quiz-question-text">
              {question.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3" data-testid="quiz-options">
            {question.options?.map((option, i) => {
              const letter = option.charAt(0);
              const isSelected = answers[question.id] === letter;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(question.id, letter)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200' 
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20'
                  }`}
                  data-testid={`quiz-option-${letter}`}
                >
                  <span className="text-sm">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-30"
              data-testid="quiz-prev-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Previous
            </Button>

            {/* Question dots */}
            <div className="flex gap-1">
              {data.questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentIdx 
                      ? 'bg-purple-400 scale-125' 
                      : answers[q.id] 
                        ? 'bg-purple-400/40' 
                        : 'bg-slate-700'
                  }`}
                  data-testid={`quiz-dot-${i}`}
                />
              ))}
            </div>

            {currentIdx === data.questions.length - 1 ? (
              <Button
                onClick={submitQuiz}
                disabled={answeredCount < data.questions.length}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white disabled:opacity-40"
                data-testid="submit-quiz-btn"
              >
                Submit Quiz <Award className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setCurrentIdx(prev => Math.min(data.questions.length - 1, prev + 1))}
                className="border-white/10 text-slate-300 hover:bg-white/10"
                data-testid="quiz-next-btn"
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
