import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  ArrowLeft, ChevronRight, CheckCircle, XCircle,
  Award, Star, AlertTriangle, Target, Clock,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function GrammarQuizMode({ user }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/grammar-engine/${moduleId}/quiz`);
        if (res.ok) {
          const d = await res.json();
          setData(d);
          if (d.time_limit_seconds) setTimeLeft(d.time_limit_seconds);
        } else toast.error('Failed to load quiz');
      } catch { toast.error('Connection error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [moduleId]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const questions = data?.questions || [];
  const question = questions[idx];

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    setAnswers(prev => ({ ...prev, [question.id]: answer }));
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (idx < questions.length - 1) setIdx(i => i + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const answerList = Object.entries(answers).map(([qid, answer]) => ({ question_id: qid, answer }));
      const res = await fetch(`${API_URL}/api/grammar-engine/${moduleId}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, module_id: moduleId, answers: answerList, time_taken_seconds: data?.time_limit_seconds ? data.time_limit_seconds - (timeLeft || 0) : null }),
      });
      if (res.ok) setResult(await res.json());
      else toast.error('Failed to submit quiz');
    } catch { toast.error('Connection error'); }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid="grammar-quiz-loading">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-amber-500 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading checkpoint quiz...</p>
      </div>
    </div>
  );

  // Results screen
  if (result) {
    const stars = result.stars || 0;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" data-testid="grammar-quiz-results">
        <Card className="p-8 text-center max-w-lg w-full shadow-lg border-0">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3].map(s => (
              <Star key={s} className={`w-10 h-10 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {result.mastery === 'mastered' ? 'Mastered!' : result.mastery === 'good' ? 'Good Job!' : result.mastery === 'needs_review' ? 'Almost There!' : 'Keep Practicing!'}
          </h2>
          <p className="text-5xl font-black text-indigo-600 my-4">{result.score}%</p>
          <p className="text-gray-500 mb-2">{result.correct}/{result.total} correct</p>

          {result.diagnostic_message && (
            <div className={`p-4 rounded-xl mb-4 ${result.weak_areas?.length ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
              <p className="text-sm font-medium">{result.diagnostic_message}</p>
              {result.weak_areas?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {result.weak_areas.map(area => (
                    <Badge key={area} className="bg-amber-200 text-amber-800 border-0">{area}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Question review */}
          <div className="text-left mb-6 max-h-60 overflow-y-auto">
            {result.results?.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded text-sm ${r.correct ? 'text-green-700' : 'text-red-700'}`}>
                {r.correct ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                <span className="truncate">Q{i + 1}: {r.explanation?.substring(0, 80)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {result.weak_areas?.length > 0 && (
              <Button variant="outline" 
                onClick={() => navigate(`/grammar/smart-review/${moduleId}`, { state: { weak_areas: result.weak_areas, quiz_score: result.score } })} 
                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50" 
                data-testid="smart-review-btn">
                <Target className="w-4 h-4 mr-1" /> Smart Review
              </Button>
            )}
            {result.score < 70 && !result.weak_areas?.length && (
              <Button variant="outline" onClick={() => navigate(`/grammar/practice/${moduleId}`)} className="flex-1" data-testid="back-to-practice-btn">
                <RotateCcw className="w-4 h-4 mr-1" /> Review Practice
              </Button>
            )}
            <Button onClick={() => navigate(`/grammar/guided/${moduleId}`)}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
              data-testid="go-to-guided-btn">
              Guided Production <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!question) return null;

  const renderQuestion = () => {
    const userAnswer = answers[question.id];
    const qType = question.type;

    if (qType === 'multiple_choice' || qType === 'usage_choice') {
      return (
        <div className="space-y-3">
          {question.context && <div className="bg-gray-50 rounded-xl p-4 mb-4 text-gray-700 italic">{question.context}</div>}
          <p className="text-lg font-medium text-gray-800 mb-4">{question.question}</p>
          {question.options?.map((opt, oi) => {
            const isCorrect = oi === question.correct_index;
            let cls = 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50';
            if (showFeedback) {
              if (isCorrect) cls = 'border-green-500 bg-green-50';
              else if (oi === userAnswer) cls = 'border-red-500 bg-red-50';
              else cls = 'border-gray-200 opacity-40';
            } else if (oi === userAnswer) cls = 'border-indigo-500 bg-indigo-50';
            return (
              <button key={oi} onClick={() => handleAnswer(oi)} disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${cls}`}
                data-testid={`quiz-option-${oi}`}>
                <span className="font-medium">{opt}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (qType === 'gap_fill') {
      const parts = (question.sentence || '').split('___');
      return (
        <div>
          <div className="bg-gray-50 rounded-xl p-6 mb-4">
            <p className="text-xl text-gray-800">
              {parts[0]}
              <span className={`inline-block min-w-[80px] mx-1 px-3 py-1 rounded-lg border-2 font-bold ${
                showFeedback
                  ? userAnswer === question.correct ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
                  : 'bg-indigo-50 border-indigo-300 border-dashed'
              }`}>
                {showFeedback ? question.correct : (userAnswer || '______')}
              </span>
              {parts[1]}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {question.options?.map((opt) => {
              const isCorrect = opt === question.correct;
              let cls = 'border-gray-200 hover:border-indigo-400';
              if (showFeedback) {
                if (isCorrect) cls = 'border-green-500 bg-green-50 font-bold';
                else if (opt === userAnswer) cls = 'border-red-500 bg-red-50';
                else cls = 'border-gray-200 opacity-40';
              }
              return (
                <button key={opt} onClick={() => handleAnswer(opt)} disabled={showFeedback}
                  className={`p-3 rounded-xl border-2 text-center text-lg transition-all ${cls}`}
                  data-testid={`quiz-gap-${opt}`}>{opt}</button>
              );
            })}
          </div>
        </div>
      );
    }

    if (qType === 'error_detection') {
      return (
        <div>
          <div className="bg-gray-50 rounded-xl p-6 mb-4">
            <p className="text-xl text-gray-800 text-center">&ldquo;{question.sentence}&rdquo;</p>
          </div>
          <p className="text-gray-600 mb-4 text-center">Does this sentence have a grammar error?</p>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {[{ val: true, label: 'Has Error', icon: XCircle, clr: 'red' }, { val: false, label: 'Correct', icon: CheckCircle, clr: 'green' }].map(({ val, label, icon: Ic, clr }) => {
              const isCorrect = val === question.has_error;
              let cls = `border-${clr}-200 hover:border-${clr}-400 hover:bg-${clr}-50`;
              if (showFeedback) {
                if (val === userAnswer && isCorrect) cls = 'border-green-500 bg-green-100';
                else if (val === userAnswer && !isCorrect) cls = 'border-red-500 bg-red-100';
                else if (isCorrect) cls = 'border-green-400 bg-green-50';
                else cls = 'border-gray-200 opacity-40';
              }
              return (
                <button key={String(val)} onClick={() => handleAnswer(val)} disabled={showFeedback}
                  className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${cls}`}
                  data-testid={`quiz-error-${val}`}>
                  <Ic className="w-8 h-8" />
                  <span className="font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return <p>Unknown question type</p>;
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="grammar-quiz-page">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900" data-testid="grammar-quiz-back">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{data?.title || 'Checkpoint Quiz'}</p>
            <p className="text-xs text-gray-500">Stage 3: Assessment</p>
          </div>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <Badge className={`${timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'} border-0`}>
                <Clock className="w-3 h-3 mr-1" /> {formatTime(timeLeft)}
              </Badge>
            )}
            <Badge className="bg-amber-100 text-amber-700 border-0">{idx + 1}/{questions.length}</Badge>
          </div>
        </div>
        <Progress value={((idx + 1) / questions.length) * 100} className="h-1" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge className={`border-0 ${question.difficulty === 'easy' ? 'bg-green-100 text-green-700' : question.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
            {question.difficulty}
          </Badge>
          <Badge className="bg-gray-100 text-gray-600 border-0">Tests: {question.tests}</Badge>
        </div>

        <Card className="p-6 shadow-lg border-0 mt-3">
          {renderQuestion()}
          {showFeedback && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${answers[question.id] === question.correct_index || answers[question.id] === question.correct || answers[question.id] === question.has_error ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {question.explanation}
            </div>
          )}
          {showFeedback && (
            <div className="mt-4 text-center">
              <Button onClick={handleNext} data-testid="quiz-next-btn">
                {idx < questions.length - 1 ? 'Next Question' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
