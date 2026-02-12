import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, CheckCircle, XCircle, ArrowRight,
  Award, Lightbulb, RotateCcw, Zap
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function VocabularyPracticeMode({ user }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [matchState, setMatchState] = useState({ selected: null, matches: {} });
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, [moduleId]);

  const fetchExercises = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vocabulary-engine/${moduleId}/practice`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      } else {
        toast.error('Failed to load exercises');
        navigate('/advanced-mastery');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const currentExercise = data?.exercises?.[currentIdx];
  const progress = data ? ((currentIdx + 1) / data.exercises.length) * 100 : 0;

  const checkFillBlank = (option) => {
    if (isChecked) return;
    setSelectedAnswer(option);
    setIsChecked(true);
    setTotalAnswered(prev => prev + 1);
    if (option === currentExercise.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleMatchSelect = (termId) => {
    if (matchState.selected === null) {
      setMatchState(prev => ({ ...prev, selected: termId }));
    } else {
      setMatchState(prev => ({
        selected: null,
        matches: { ...prev.matches, [prev.selected]: termId, [termId]: prev.selected }
      }));
    }
  };

  const checkMatching = () => {
    if (!currentExercise) return;
    const answers = currentExercise.answers;
    const terms = currentExercise.terms;
    let correct = 0;
    terms.forEach(term => {
      const userMatch = matchState.matches[term.id];
      if (userMatch && answers[term.id] === userMatch) correct++;
    });
    setIsChecked(true);
    setTotalAnswered(prev => prev + 1);
    if (correct === terms.length) setScore(prev => prev + 1);
  };

  const goNext = () => {
    if (currentIdx < data.exercises.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsChecked(false);
      setShowHint(false);
      setMatchState({ selected: null, matches: {} });
    } else {
      setCompleted(true);
    }
  };

  const handleFinishPractice = async () => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/api/vocabulary-engine/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, module_id: moduleId, section: 'practice', completed: true }),
      });
      toast.success('Practice completed!');
      navigate(`/vocabulary/quiz/${moduleId}`);
    } catch {
      toast.error('Failed to save progress');
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsChecked(false);
    setScore(0);
    setTotalAnswered(0);
    setShowHint(false);
    setMatchState({ selected: null, matches: {} });
    setCompleted(false);
    fetchExercises();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50/30 flex items-center justify-center" data-testid="practice-mode-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.exercises?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50/30 flex items-center justify-center text-gray-700">
        <p>No exercises available.</p>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / totalAnswered) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50/30 flex items-center justify-center p-4" data-testid="practice-complete-screen">
        <div className="w-full max-w-md text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
            percentage >= 70 ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            {percentage >= 70 
              ? <Award className="w-12 h-12 text-emerald-600" />
              : <RotateCcw className="w-12 h-12 text-amber-600" />
            }
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice Complete!</h2>
          <p className="text-gray-500 mb-6">{data.module_title}</p>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="text-5xl font-bold mb-2" data-testid="practice-score">
              <span className={percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'}>{score}</span>
              <span className="text-gray-300">/{totalAnswered}</span>
            </div>
            <p className="text-gray-400 text-sm">{percentage}% accuracy</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
              data-testid="retry-practice-btn"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
            <Button
              onClick={handleFinishPractice}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              data-testid="go-to-quiz-btn"
            >
              Mastery Quiz <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50/30 text-gray-900 flex flex-col" data-testid="vocabulary-practice-mode">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-200/60 bg-white/80 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/advanced-mastery')} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          data-testid="back-to-course-practice-btn"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-sm font-medium text-gray-700">Controlled Practice</p>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200" data-testid="practice-score-badge">
            <Zap className="w-3 h-3 mr-1" />{score}/{totalAnswered}
          </Badge>
          <span className="text-sm text-gray-400" data-testid="exercise-counter">
            {currentIdx + 1}/{data.exercises.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-emerald-100">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300 rounded-r-full"
          style={{ width: `${progress}%` }}
          data-testid="practice-progress-bar"
        />
      </div>

      {/* Exercise area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {currentExercise.type === 'fill_blank' && (
            <FillBlankExercise
              exercise={currentExercise}
              selectedAnswer={selectedAnswer}
              isChecked={isChecked}
              showHint={showHint}
              onSelect={checkFillBlank}
              onShowHint={() => setShowHint(true)}
            />
          )}

          {currentExercise.type === 'matching' && (
            <MatchingExercise
              exercise={currentExercise}
              matchState={matchState}
              isChecked={isChecked}
              onSelect={handleMatchSelect}
              onCheck={checkMatching}
            />
          )}

          {isChecked && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={goNext}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                data-testid="next-exercise-btn"
              >
                {currentIdx === data.exercises.length - 1 ? 'See Results' : 'Next'} 
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FillBlankExercise({ exercise, selectedAnswer, isChecked, showHint, onSelect, onShowHint }) {
  return (
    <div data-testid="fill-blank-exercise">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{exercise.instruction}</p>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <p className="text-lg text-gray-700 leading-relaxed">{exercise.sentence}</p>
      </div>

      {!showHint && !isChecked && exercise.hint && (
        <button 
          onClick={onShowHint}
          className="text-xs text-amber-600 hover:text-amber-700 mb-4 flex items-center gap-1"
          data-testid="show-hint-btn"
        >
          <Lightbulb className="w-3 h-3" /> Show hint
        </button>
      )}

      {showHint && exercise.hint && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4" data-testid="hint-display">
          <p className="text-sm text-amber-700"><Lightbulb className="w-3 h-3 inline mr-1" />{exercise.hint}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3" data-testid="fill-blank-options">
        {exercise.options.map((opt, i) => {
          let cls = 'bg-white border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-300';
          if (isChecked) {
            if (opt === exercise.answer) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800';
            else if (opt === selectedAnswer) cls = 'bg-red-50 border-red-400 text-red-700';
            else cls = 'bg-gray-50 border-gray-100 text-gray-400';
          }
          return (
            <button
              key={i}
              onClick={() => onSelect(opt)}
              disabled={isChecked}
              className={`p-4 rounded-xl border text-left transition-all shadow-sm ${cls} disabled:cursor-default`}
              data-testid={`option-${i}`}
            >
              <span className="text-sm">{opt}</span>
              {isChecked && opt === exercise.answer && (
                <CheckCircle className="w-4 h-4 inline ml-2 text-emerald-500" />
              )}
              {isChecked && opt === selectedAnswer && opt !== exercise.answer && (
                <XCircle className="w-4 h-4 inline ml-2 text-red-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchingExercise({ exercise, matchState, isChecked, onSelect, onCheck }) {
  const allMatched = exercise.terms.every(t => matchState.matches[t.id]);

  return (
    <div data-testid="matching-exercise">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{exercise.instruction}</p>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-xs text-gray-400 mb-2">Terms</p>
          {exercise.terms.map((term) => {
            const isSelected = matchState.selected === term.id;
            const isMatched = !!matchState.matches[term.id];
            let correct = false;
            if (isChecked && isMatched) correct = exercise.answers[term.id] === matchState.matches[term.id];
            let cls = 'bg-white border-gray-200 text-gray-700';
            if (isSelected) cls = 'bg-amber-50 border-amber-400 text-amber-800';
            else if (isChecked && correct) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800';
            else if (isChecked && isMatched && !correct) cls = 'bg-red-50 border-red-400 text-red-700';
            else if (isMatched) cls = 'bg-blue-50 border-blue-300 text-blue-700';
            
            return (
              <button
                key={term.id}
                onClick={() => !isChecked && onSelect(term.id)}
                disabled={isChecked}
                className={`w-full p-3 rounded-lg border text-left text-sm transition-all shadow-sm ${cls}`}
                data-testid={`match-term-${term.id}`}
              >
                {term.text}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="text-xs text-gray-400 mb-2">Meanings</p>
          {exercise.definitions.map((def) => {
            const isSelected = matchState.selected === def.id;
            const matchedBy = Object.entries(matchState.matches).find(([k, v]) => v === def.id)?.[0];
            const isMatched = !!matchedBy;
            let correct = false;
            if (isChecked && isMatched) correct = exercise.answers[matchedBy] === def.id;
            let cls = 'bg-white border-gray-200 text-gray-700';
            if (isSelected) cls = 'bg-amber-50 border-amber-400 text-amber-800';
            else if (isChecked && correct) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800';
            else if (isChecked && isMatched && !correct) cls = 'bg-red-50 border-red-400 text-red-700';
            else if (isMatched) cls = 'bg-blue-50 border-blue-300 text-blue-700';

            return (
              <button
                key={def.id}
                onClick={() => !isChecked && onSelect(def.id)}
                disabled={isChecked}
                className={`w-full p-3 rounded-lg border text-left text-sm transition-all shadow-sm ${cls}`}
                data-testid={`match-def-${def.id}`}
              >
                {def.text}
              </button>
            );
          })}
        </div>
      </div>

      {!isChecked && allMatched && (
        <div className="mt-4 flex justify-center">
          <Button
            onClick={onCheck}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
            data-testid="check-matching-btn"
          >
            Check Answers
          </Button>
        </div>
      )}
    </div>
  );
}
