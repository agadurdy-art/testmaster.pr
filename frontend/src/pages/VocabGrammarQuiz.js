import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  BookMarked, ArrowLeft, CheckCircle, XCircle, 
  RefreshCw, Trophy, Target, BookOpen, AlertCircle,
  ChevronRight, Loader2, Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function VocabGrammarQuiz({ user }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [searchParams] = useSearchParams();
  const initialBand = searchParams.get('band');
  
  // Quiz state
  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  
  // Filter state
  const [bandLevel, setBandLevel] = useState(initialBand || null);
  const [units, setUnits] = useState({ foundation: [], development: [], advanced: [] });
  
  const bandLevelNames = {
    foundation: 'Foundation (Band 4.5-)',
    development: 'Development (Band 5.0-6.5)',
    advanced: 'Advanced (Band 7.0+)'
  };
  
  const bandLevelColors = {
    foundation: 'from-green-500 to-emerald-500',
    development: 'from-blue-500 to-indigo-500',
    advanced: 'from-purple-500 to-violet-500'
  };

  // Fetch units for filter
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch(`${API_URL}/api/question-bank/grammar-vocab/units`);
        const data = await res.json();
        setUnits(data.units || { foundation: [], development: [], advanced: [] });
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };
    fetchUnits();
  }, []);

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/api/question-bank/grammar-vocab/quizzes?limit=15&random_order=true`;
        if (bandLevel) {
          url += `&band_level=${bandLevel}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setQuizzes(data.quizzes || []);
        setCurrentIndex(0);
        setAnswers({});
        setQuizComplete(false);
        setResults(null);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [bandLevel]);

  const currentQuiz = quizzes[currentIndex];
  const progress = quizzes.length > 0 ? ((currentIndex) / quizzes.length) * 100 : 0;

  const handleAnswer = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !currentQuiz) return;
    
    setShowResult(true);
    setAnswers(prev => ({
      ...prev,
      [currentQuiz.id]: selectedAnswer
    }));
  };

  const nextQuestion = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz complete - evaluate
      evaluateQuiz();
    }
  };

  const evaluateQuiz = async () => {
    setEvaluating(true);
    try {
      // Include current answer
      const finalAnswers = {
        ...answers,
        [currentQuiz.id]: selectedAnswer
      };
      
      const res = await fetch(`${API_URL}/api/question-bank/grammar-vocab/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: finalAnswers,
          user_id: user?.id
        })
      });
      const data = await res.json();
      setResults(data);
      setQuizComplete(true);
    } catch (error) {
      console.error('Error evaluating quiz:', error);
      toast.error('Failed to evaluate quiz');
    } finally {
      setEvaluating(false);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers({});
    setQuizComplete(false);
    setResults(null);
    // Trigger refetch
    setBandLevel(prev => prev);
  };

  const goToLesson = (unitId) => {
    // Extract band level and redirect to vocab-grammar course
    navigate('/vocab-grammar');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  // Quiz Complete Screen
  if (quizComplete && results) {
    const scoreColor = results.score >= 80 ? 'text-green-500' : results.score >= 60 ? 'text-yellow-500' : 'text-red-500';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={goBack}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
          </Button>

          <Card className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
            <p className="text-gray-600 mb-6">Here's how you did:</p>
            
            <div className={`text-6xl font-bold ${scoreColor} mb-2`}>
              {results.score}%
            </div>
            <p className="text-gray-600 mb-8">
              {results.correct} out of {results.total} correct
            </p>

            {/* Recommended Lessons - Smart suggestions based on weak areas */}
            {results.recommended_lessons && results.recommended_lessons.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6 text-left">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-3">
                  <Target className="w-5 h-5" />
                  Recommended for You
                </div>
                <p className="text-sm text-blue-600 mb-4">
                  Based on your results, we recommend reviewing these lessons:
                </p>
                <div className="space-y-2">
                  {results.recommended_lessons.map((lesson, i) => (
                    <div 
                      key={i}
                      className="bg-white rounded-lg p-3 border border-blue-100 hover:border-blue-300 cursor-pointer transition-all group"
                      onClick={() => navigate(`/vocab-grammar?lesson=${lesson.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 group-hover:text-blue-600">
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {lesson.band_level}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {lesson.type}
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-blue-600">
                          Review <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Areas - Fallback if no recommended_lessons */}
            {(!results.recommended_lessons || results.recommended_lessons.length === 0) && 
             results.weak_units && results.weak_units.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                  <AlertCircle className="w-5 h-5" />
                  Areas to Review
                </div>
                <p className="text-sm text-amber-600 mb-3">
                  You struggled with these topics. Click to review:
                </p>
                <div className="flex flex-wrap gap-2">
                  {results.weak_units.slice(0, 3).map((unit, i) => (
                    <Badge 
                      key={i} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-amber-100"
                      onClick={() => navigate(`/vocab-grammar?lesson=${unit}`)}
                    >
                      {unit.replace(/-/g, ' ')} →
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Results Breakdown */}
            <div className="space-y-3 mb-8 text-left">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Question Details
              </h3>
              {results.results?.map((r, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-lg ${r.is_correct ? 'bg-green-50' : 'bg-red-50'}`}
                >
                  <div className="flex items-start gap-2">
                    {r.is_correct ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.question}</p>
                      {!r.is_correct && (
                        <>
                          <p className="text-xs text-gray-600 mt-1">
                            Your answer: <span className="text-red-600">{r.user_answer}</span> | 
                            Correct: <span className="text-green-600">{r.correct_answer}</span>
                          </p>
                          {r.unit_id && (
                            <button 
                              className="text-xs text-blue-500 hover:underline mt-1 flex items-center gap-1"
                              onClick={() => navigate(`/vocab-grammar?lesson=${r.unit_id}`)}
                            >
                              <RefreshCw className="w-3 h-3" /> Review this topic
                            </button>
                          )}
                        </>
                      )}
                      <p className="text-xs text-gray-500 mt-1 italic">{r.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate('/vocab-grammar')}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" /> Review Lessons
              </Button>
              <Button
                onClick={restartQuiz}
                className="gap-2 bg-gradient-to-r from-pink-500 to-purple-500"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={goBack}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <BookMarked className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Vocabulary & Grammar Quiz</h1>
              <p className="text-white/80">Test your knowledge and track your progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Band Level Filter */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Filter by Level:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={bandLevel === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBandLevel(null)}
            >
              All Levels
            </Button>
            {Object.entries(bandLevelNames).map(([key, name]) => (
              <Button
                key={key}
                variant={bandLevel === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBandLevel(key)}
                className={bandLevel === key ? `bg-gradient-to-r ${bandLevelColors[key]} border-0` : ''}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentIndex + 1} of {quizzes.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Quiz Card */}
        {currentQuiz ? (
          <Card className="p-6 md:p-8">
            {/* Question Badge */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary">
                {currentQuiz.type === 'vocabulary' ? 'Vocabulary' : 'Grammar'}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {currentQuiz.band_level}
              </Badge>
            </div>

            {/* Question */}
            <h2 className="text-xl md:text-2xl font-semibold mb-6">
              {currentQuiz.question}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuiz.options.map((option, i) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuiz.answer;
                
                let optionClass = 'border-2 p-4 rounded-xl cursor-pointer transition-all ';
                
                if (showResult) {
                  if (isCorrect) {
                    optionClass += 'border-green-500 bg-green-50';
                  } else if (isSelected && !isCorrect) {
                    optionClass += 'border-red-500 bg-red-50';
                  } else {
                    optionClass += 'border-gray-200 opacity-50';
                  }
                } else {
                  optionClass += isSelected 
                    ? 'border-pink-500 bg-pink-50' 
                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50';
                }

                return (
                  <div
                    key={i}
                    className={optionClass}
                    onClick={() => handleAnswer(option)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                        showResult && isCorrect 
                          ? 'bg-green-500 text-white' 
                          : showResult && isSelected && !isCorrect
                            ? 'bg-red-500 text-white'
                            : isSelected 
                              ? 'bg-pink-500 text-white' 
                              : 'bg-gray-100 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="font-medium">{option}</span>
                      {showResult && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation (shown after answer) */}
            {showResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-700">Explanation</p>
                    <p className="text-sm text-blue-600">{currentQuiz.explanation}</p>
                    {currentQuiz.unit_title && (
                      <button 
                        className="text-xs text-blue-500 hover:underline mt-2 flex items-center gap-1"
                        onClick={() => navigate('/vocab-grammar')}
                      >
                        Review: {currentQuiz.unit_title} <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {!showResult ? (
                <Button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer}
                  className="bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  Check Answer
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  className="bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  {currentIndex < quizzes.length - 1 ? (
                    <>Next Question <ChevronRight className="w-4 h-4 ml-1" /></>
                  ) : evaluating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</>
                  ) : (
                    <>Finish Quiz <Trophy className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Quizzes Available</h3>
            <p className="text-gray-500 mb-4">
              {bandLevel 
                ? `No quizzes found for ${bandLevelNames[bandLevel]}. Try selecting a different level.`
                : 'No quiz questions available. Please try again later.'}
            </p>
            <Button onClick={() => navigate('/vocab-grammar')}>
              <BookOpen className="w-4 h-4 mr-2" /> Go to Lessons
            </Button>
          </Card>
        )}

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Need to review?</p>
          <Button variant="link" onClick={() => navigate('/vocab-grammar')}>
            <BookOpen className="w-4 h-4 mr-2" /> Open Vocabulary & Grammar Course
          </Button>
        </div>
      </div>
    </div>
  );
}
