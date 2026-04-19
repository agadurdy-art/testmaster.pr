import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  ArrowLeft, ChevronRight, CheckCircle, XCircle,
  Target, Lightbulb, Star, Award, Zap, RotateCcw, Brain
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AREA_LABELS = { form: 'Form & Structure', meaning: 'Meaning', usage: 'Usage & Context', recognition: 'Recognition' };
const AREA_COLORS = { form: 'purple', meaning: 'blue', usage: 'amber', recognition: 'teal' };

export default function GrammarSmartReview({ user }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const weakAreas = location.state?.weak_areas || ['form'];
  const quizScore = location.state?.quiz_score || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/grammar-engine/${moduleId}/smart-review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weak_areas: weakAreas, quiz_score: quizScore }),
        });
        if (res.ok) setData(await res.json());
        else toast.error('Failed to load review exercises');
      } catch { toast.error('Connection error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [moduleId]);

  const exercises = data?.exercises || [];
  const exercise = exercises[idx];

  const checkAnswer = (answer) => {
    if (showFeedback) return;
    setAnswers(prev => ({ ...prev, [exercise.id]: answer }));
    setShowFeedback(true);

    let isCorrect = false;
    const type = exercise.type;
    if (type === 'multiple_choice' || type === 'context_choice') {
      isCorrect = answer === exercise.correct_index;
    } else if (type === 'gap_fill') {
      isCorrect = String(answer).toLowerCase().trim() === String(exercise.correct).toLowerCase().trim();
    } else if (type === 'error_detection') {
      isCorrect = answer === exercise.has_error;
    } else if (type === 'sentence_correction') {
      isCorrect = answer === true; // They chose the correct sentence
    }

    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (idx < exercises.length - 1) setIdx(i => i + 1);
    else setDone(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid="smart-review-loading">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-orange-500 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Generating targeted exercises...</p>
      </div>
    </div>
  );

  // Done screen
  if (done) {
    const pct = exercises.length ? Math.round((score / exercises.length) * 100) : 0;
    const improved = pct >= 70;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" data-testid="smart-review-results">
        <Card className="p-8 text-center max-w-lg w-full shadow-lg border-0">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${improved ? 'bg-green-100' : 'bg-amber-100'}`}>
            {improved ? <Award className="w-10 h-10 text-green-600" /> : <Brain className="w-10 h-10 text-amber-600" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{improved ? 'Great Improvement!' : 'Keep Going!'}</h2>
          <div className="flex items-center justify-center gap-4 my-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase">Quiz</p>
              <p className="text-2xl font-black text-red-400">{quizScore}%</p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-300" />
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase">Review</p>
              <p className={`text-2xl font-black ${improved ? 'text-green-600' : 'text-amber-600'}`}>{pct}%</p>
            </div>
          </div>
          <p className="text-gray-500 mb-2">{score}/{exercises.length} correct</p>

          {/* Weak areas progress */}
          <div className="space-y-2 mb-4 text-left">
            {weakAreas.map(area => {
              const areaExercises = exercises.filter(e => e.targets_area === area);
              const areaCorrect = areaExercises.filter((e) => {
                const ans = answers[e.id];
                if (e.type === 'multiple_choice' || e.type === 'context_choice') return ans === e.correct_index;
                if (e.type === 'gap_fill') return String(ans).toLowerCase().trim() === String(e.correct).toLowerCase().trim();
                if (e.type === 'error_detection') return ans === e.has_error;
                if (e.type === 'sentence_correction') return ans === true;
                return false;
              }).length;
              const areaPct = areaExercises.length ? Math.round((areaCorrect / areaExercises.length) * 100) : 0;
              const color = AREA_COLORS[area] || 'gray';
              return (
                <div key={area} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{AREA_LABELS[area] || area}</span>
                    <Badge className={`bg-${color}-100 text-${color}-700 border-0`}>{areaPct}%</Badge>
                  </div>
                  <Progress value={areaPct} className="h-2" />
                </div>
              );
            })}
          </div>

          {/* Summary tips */}
          {data?.summary_tips?.length > 0 && (
            <div className="bg-indigo-50 rounded-xl p-4 mb-4 text-left border border-indigo-200">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-2">Key Takeaways</p>
              {data.summary_tips.map((tip, i) => (
                <p key={i} className="text-sm text-indigo-800 flex items-start gap-2 mb-1">
                  <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-indigo-500" />{tip}
                </p>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            {!improved && (
              <Button variant="outline" onClick={() => navigate(`/grammar/practice/${moduleId}`)} className="flex-1" data-testid="sr-back-practice">
                <RotateCcw className="w-4 h-4 mr-1" /> More Practice
              </Button>
            )}
            <Button onClick={() => navigate(`/grammar/guided/${moduleId}`)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
              data-testid="sr-to-guided">
              Guided Production <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!exercise) return null;

  const userAnswer = answers[exercise.id];
  const areaColor = AREA_COLORS[exercise.targets_area] || 'gray';

  const renderExercise = () => {
    const type = exercise.type;

    if (type === 'multiple_choice' || type === 'context_choice') {
      return (
        <div className="space-y-3">
          {exercise.context && <div className="bg-gray-50 rounded-xl p-4 text-gray-700 italic mb-3">{exercise.context}</div>}
          <p className="text-lg font-medium text-gray-800 mb-4">{exercise.question}</p>
          {exercise.options?.map((opt, oi) => {
            const isCorrect = oi === exercise.correct_index;
            let cls = 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50';
            if (showFeedback) {
              if (isCorrect) cls = 'border-green-500 bg-green-50';
              else if (oi === userAnswer) cls = 'border-red-500 bg-red-50';
              else cls = 'border-gray-200 opacity-40';
            }
            return (
              <button key={oi} onClick={() => checkAnswer(oi)} disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${cls}`}
                data-testid={`sr-option-${oi}`}>
                <span>{opt}</span>
                {showFeedback && isCorrect && <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />}
                {showFeedback && oi === userAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-500 inline ml-2" />}
              </button>
            );
          })}
        </div>
      );
    }

    if (type === 'gap_fill') {
      const parts = (exercise.sentence || '').split('___');
      return (
        <div>
          <div className="bg-gray-50 rounded-xl p-6 mb-4">
            <p className="text-xl text-gray-800">
              {parts[0]}
              <span className={`inline-block min-w-[80px] mx-1 px-3 py-1 rounded-lg border-2 font-bold ${
                showFeedback
                  ? userAnswer === exercise.correct ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
                  : 'bg-indigo-50 border-indigo-300 border-dashed'
              }`}>
                {showFeedback ? exercise.correct : (userAnswer || '______')}
              </span>
              {parts[1]}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {exercise.options?.map((opt) => {
              const isCorrect = opt.toLowerCase().trim() === exercise.correct?.toLowerCase().trim();
              let cls = 'border-gray-200 hover:border-indigo-400';
              if (showFeedback) {
                if (isCorrect) cls = 'border-green-500 bg-green-50 font-bold';
                else if (opt === userAnswer) cls = 'border-red-500 bg-red-50';
                else cls = 'border-gray-200 opacity-40';
              }
              return (
                <button key={opt} onClick={() => checkAnswer(opt)} disabled={showFeedback}
                  className={`p-3 rounded-xl border-2 text-center text-lg transition-all ${cls}`}
                  data-testid={`sr-gap-${opt}`}>{opt}</button>
              );
            })}
          </div>
        </div>
      );
    }

    if (type === 'error_detection') {
      return (
        <div>
          <div className="bg-gray-50 rounded-xl p-6 mb-4">
            <p className="text-xl text-gray-800 text-center">&ldquo;{exercise.sentence}&rdquo;</p>
          </div>
          <p className="text-gray-600 mb-4 text-center">Does this sentence have a grammar error?</p>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {[{ val: true, label: 'Has Error', icon: XCircle }, { val: false, label: 'Correct', icon: CheckCircle }].map(({ val, label, icon: Ic }) => {
              let cls = 'border-gray-200 hover:border-indigo-400';
              if (showFeedback) {
                const isRight = val === exercise.has_error;
                if (val === userAnswer && isRight) cls = 'border-green-500 bg-green-100';
                else if (val === userAnswer && !isRight) cls = 'border-red-500 bg-red-100';
                else if (isRight) cls = 'border-green-400 bg-green-50';
                else cls = 'border-gray-200 opacity-40';
              }
              return (
                <button key={String(val)} onClick={() => checkAnswer(val)} disabled={showFeedback}
                  className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${cls}`}
                  data-testid={`sr-error-${val}`}>
                  <Ic className="w-8 h-8" /><span className="font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (type === 'sentence_correction') {
      return (
        <div>
          <p className="text-gray-600 mb-4 font-medium">Which sentence is correct?</p>
          <div className="space-y-3">
            {[
              { text: exercise.wrong_sentence, isCorrectAnswer: false },
              { text: exercise.correct_sentence, isCorrectAnswer: true },
            ].sort(() => Math.random() - 0.5).map((item, oi) => {
              let cls = 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50';
              if (showFeedback) {
                if (item.isCorrectAnswer) cls = 'border-green-500 bg-green-50';
                else if (userAnswer === item.isCorrectAnswer) cls = 'border-red-500 bg-red-50';
                else cls = 'border-gray-200 opacity-50';
              }
              return (
                <button key={oi} onClick={() => checkAnswer(item.isCorrectAnswer)} disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${cls}`}
                  data-testid={`sr-correction-${oi}`}>
                  <p className="text-lg">{item.text}</p>
                  {showFeedback && item.isCorrectAnswer && <CheckCircle className="w-4 h-4 text-green-500 inline mt-1" />}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return <p>Unknown exercise type: {type}</p>;
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="smart-review-page">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900" data-testid="smart-review-back">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
              <Zap className="w-4 h-4 text-orange-500" /> Smart Review
            </p>
            <p className="text-xs text-gray-500">{data?.title || 'Targeted Practice'}</p>
          </div>
          <Badge className="bg-orange-100 text-orange-700 border-0">{idx + 1}/{exercises.length}</Badge>
        </div>
        <Progress value={((idx + 1) / exercises.length) * 100} className="h-1" />
      </div>

      {/* Review intro message */}
      {idx === 0 && !showFeedback && data?.review_message && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <Target className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-orange-800 text-sm">Targeted Review</p>
              <p className="text-sm text-orange-700 mt-1">{data.review_message}</p>
              <div className="flex gap-2 mt-2">
                {weakAreas.map(a => (
                  <Badge key={a} className={`bg-${AREA_COLORS[a] || 'gray'}-100 text-${AREA_COLORS[a] || 'gray'}-700 border-0 text-xs`}>
                    {AREA_LABELS[a] || a}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge className={`bg-${areaColor}-100 text-${areaColor}-700 border-0 text-xs`}>
            {AREA_LABELS[exercise.targets_area] || exercise.targets_area}
          </Badge>
          <Badge className={`border-0 text-xs ${exercise.difficulty === 'easy' ? 'bg-green-100 text-green-700' : exercise.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
            {exercise.difficulty}
          </Badge>
        </div>

        <Card className="p-6 shadow-lg border-0">
          {renderExercise()}

          {showFeedback && (
            <div className="mt-4 space-y-3">
              <div className={`p-3 rounded-lg text-sm ${
                (() => {
                  const type = exercise.type;
                  if (type === 'multiple_choice' || type === 'context_choice') return userAnswer === exercise.correct_index;
                  if (type === 'gap_fill') return String(userAnswer).toLowerCase().trim() === String(exercise.correct).toLowerCase().trim();
                  if (type === 'error_detection') return userAnswer === exercise.has_error;
                  if (type === 'sentence_correction') return userAnswer === true;
                  return false;
                })() ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {exercise.explanation}
              </div>
              {exercise.tip && (
                <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-indigo-700">{exercise.tip}</p>
                </div>
              )}
              <div className="text-center pt-2">
                <Button onClick={handleNext} data-testid="sr-next-btn">
                  {idx < exercises.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
