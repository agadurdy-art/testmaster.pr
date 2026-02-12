import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, CheckCircle, XCircle, ChevronLeft, ChevronRight,
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
  const [matchState, setMatchState] = useState({ selectedTerm: null, selectedDef: null, matches: {} });
  const [completed, setCompleted] = useState(false);

  useEffect(() => { fetchExercises(); }, [moduleId]);

  const fetchExercises = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vocabulary-engine/${moduleId}/practice`);
      if (res.ok) setData(await res.json());
      else { toast.error('Failed to load exercises'); navigate('/advanced-mastery'); }
    } catch { toast.error('Connection error'); }
    finally { setLoading(false); }
  };

  const currentExercise = data?.exercises?.[currentIdx];
  const progress = data ? ((currentIdx + 1) / data.exercises.length) * 100 : 0;

  const checkFillBlank = (option) => {
    if (isChecked) return;
    setSelectedAnswer(option);
    setIsChecked(true);
    setTotalAnswered(p => p + 1);
    if (option === currentExercise.answer) setScore(p => p + 1);
  };

  const handleMatchSelect = (type, id) => {
    if (type === 'term') {
      // Always select a term first
      setMatchState(prev => ({ ...prev, selectedTerm: id, selectedDef: null }));
    } else {
      // Definition clicked
      if (matchState.selectedTerm !== null) {
        // We have a term selected - make the match
        setMatchState(prev => ({
          selectedTerm: null,
          selectedDef: null,
          matches: { ...prev.matches, [prev.selectedTerm]: id }
        }));
      } else {
        setMatchState(prev => ({ ...prev, selectedDef: id, selectedTerm: null }));
      }
    }
  };

  const checkMatching = () => {
    if (!currentExercise) return;
    let correct = 0;
    currentExercise.terms.forEach(t => {
      if (matchState.matches[t.id] && currentExercise.answers[t.id] === matchState.matches[t.id]) correct++;
    });
    setIsChecked(true);
    setTotalAnswered(p => p + 1);
    if (correct === currentExercise.terms.length) setScore(p => p + 1);
  };

  const goNext = () => {
    if (currentIdx < data.exercises.length - 1) {
      setCurrentIdx(p => p + 1); setSelectedAnswer(null); setIsChecked(false); setShowHint(false);
      setMatchState({ selectedTerm: null, selectedDef: null, matches: {} });
    } else setCompleted(true);
  };

  const handleFinishPractice = async () => {
    if (user) {
      try { await fetch(`${API_URL}/api/vocabulary-engine/progress`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, module_id: moduleId, section: 'practice', completed: true }) }); } catch {}
    }
    toast.success('Practice completed!');
    navigate(`/vocabulary/quiz/${moduleId}`);
  };

  const handleRetry = () => {
    setCurrentIdx(0); setSelectedAnswer(null); setIsChecked(false); setScore(0); setTotalAnswered(0);
    setShowHint(false); setMatchState({ selectedTerm: null, selectedDef: null, matches: {} }); setCompleted(false); fetchExercises();
  };

  if (loading) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center" data-testid="practice-mode-loading"><div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-teal-500" /></div>;
  if (!data || !data.exercises?.length) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center"><p className="text-[#86868B]">No exercises available.</p></div>;

  if (completed) {
    const pct = Math.round((score / totalAnswered) * 100);
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4" data-testid="practice-complete-screen">
        <div className="w-full max-w-sm text-center">
          <div className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center ${pct >= 70 ? 'bg-green-50' : 'bg-orange-50'}`}>
            {pct >= 70 ? <Award className="w-10 h-10 text-green-500" /> : <RotateCcw className="w-10 h-10 text-orange-500" />}
          </div>
          <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-1">Practice Complete!</h2>
          <p className="text-[14px] text-[#86868B] mb-6">{data.module_title}</p>
          <div className="bg-white rounded-[20px] p-6 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-[48px] font-bold tabular-nums" data-testid="practice-score">
              <span className={pct >= 70 ? 'text-green-500' : 'text-orange-500'}>{score}</span>
              <span className="text-[#D1D1D6]">/{totalAnswered}</span>
            </p>
            <p className="text-[14px] text-[#86868B]">{pct}% accuracy</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRetry} className="flex-1 h-12 rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)] text-[14px] font-semibold text-[#3A3A3C] flex items-center justify-center gap-2" data-testid="retry-practice-btn"><RotateCcw className="w-4 h-4" /> Retry</button>
            <button onClick={handleFinishPractice} className="flex-1 h-12 rounded-full bg-orange-500 shadow-[0_2px_10px_rgba(234,88,12,0.3)] text-[14px] font-semibold text-white flex items-center justify-center gap-2" data-testid="go-to-quiz-btn">Mastery Quiz <ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col" data-testid="vocabulary-practice-mode">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
          <button onClick={() => navigate('/advanced-mastery')} className="flex items-center gap-1.5 text-sm text-orange-500 font-medium" data-testid="back-to-course-practice-btn"><ChevronLeft className="w-4 h-4" /> Back</button>
          <p className="text-[15px] font-semibold text-[#1D1D1F]">Practice</p>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-50 text-green-600 border-green-200 text-[12px] font-semibold" data-testid="practice-score-badge"><Zap className="w-3 h-3 mr-1" />{score}/{totalAnswered}</Badge>
            <span className="text-[13px] text-[#86868B] tabular-nums" data-testid="exercise-counter">{currentIdx + 1}/{data.exercises.length}</span>
          </div>
        </div>
        <div className="h-[3px] bg-black/[0.04]"><div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} data-testid="practice-progress-bar" /></div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {currentExercise.type === 'fill_blank' && <FillBlankExercise exercise={currentExercise} selectedAnswer={selectedAnswer} isChecked={isChecked} showHint={showHint} onSelect={checkFillBlank} onShowHint={() => setShowHint(true)} />}
          {currentExercise.type === 'matching' && <MatchingExercise exercise={currentExercise} matchState={matchState} isChecked={isChecked} onSelect={handleMatchSelect} onCheck={checkMatching} />}
          {isChecked && (
            <div className="mt-6 flex justify-end">
              <button onClick={goNext} className="h-11 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[14px] font-semibold px-6 shadow-[0_2px_10px_rgba(234,88,12,0.3)] flex items-center gap-2 transition-colors" data-testid="next-exercise-btn">
                {currentIdx === data.exercises.length - 1 ? 'See Results' : 'Next'} <ChevronRight className="w-4 h-4" />
              </button>
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
      <p className="text-[12px] text-[#AEAEB2] uppercase tracking-wider font-semibold mb-3">{exercise.instruction}</p>
      <div className="bg-white rounded-[20px] p-6 mb-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <p className="text-[16px] text-[#1D1D1F] leading-relaxed">{exercise.sentence}</p>
      </div>
      {!showHint && !isChecked && exercise.hint && (
        <button onClick={onShowHint} className="text-[13px] text-orange-500 font-medium mb-4 flex items-center gap-1" data-testid="show-hint-btn"><Lightbulb className="w-3.5 h-3.5" /> Show hint</button>
      )}
      {showHint && exercise.hint && (
        <div className="bg-orange-50 rounded-2xl p-3.5 mb-4" data-testid="hint-display"><p className="text-[13px] text-orange-600"><Lightbulb className="w-3.5 h-3.5 inline mr-1" />{exercise.hint}</p></div>
      )}
      <div className="grid grid-cols-2 gap-3" data-testid="fill-blank-options">
        {exercise.options.map((opt, i) => {
          let cls = 'bg-white border-black/[0.06] text-[#1D1D1F] hover:border-orange-300 hover:bg-orange-50/40';
          if (isChecked) {
            if (opt === exercise.answer) cls = 'bg-green-50 border-green-300 text-green-700';
            else if (opt === selectedAnswer) cls = 'bg-red-50 border-red-300 text-red-600';
            else cls = 'bg-white border-black/[0.04] text-[#AEAEB2]';
          }
          return (
            <button key={i} onClick={() => onSelect(opt)} disabled={isChecked}
              className={`p-4 rounded-2xl border text-left transition-all shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${cls} disabled:cursor-default`} data-testid={`option-${i}`}>
              <span className="text-[14px] font-medium">{opt}</span>
              {isChecked && opt === exercise.answer && <CheckCircle className="w-4 h-4 inline ml-2 text-green-500" />}
              {isChecked && opt === selectedAnswer && opt !== exercise.answer && <XCircle className="w-4 h-4 inline ml-2 text-red-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchingExercise({ exercise, matchState, isChecked, onSelect, onCheck }) {
  const allMatched = exercise.terms.every(t => matchState.matches[t.id]);
  // Reverse map: which term is matched to which definition
  const defToTerm = {};
  Object.entries(matchState.matches).forEach(([termId, defId]) => { defToTerm[defId] = termId; });

  return (
    <div data-testid="matching-exercise">
      <p className="text-[12px] text-[#AEAEB2] uppercase tracking-wider font-semibold mb-2">{exercise.instruction}</p>
      <p className="text-[12px] text-[#AEAEB2] mb-4">Select a term on the left, then select its meaning on the right.</p>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <p className="text-[12px] text-[#AEAEB2] font-semibold mb-1">Terms</p>
          {exercise.terms.map((term) => {
            const isSel = matchState.selectedTerm === term.id;
            const isMatched = !!matchState.matches[term.id];
            let cor = false; if (isChecked && isMatched) cor = exercise.answers[term.id] === matchState.matches[term.id];
            let cls = 'bg-white border-black/[0.06] text-[#1D1D1F]';
            if (isSel) cls = 'bg-orange-50 border-orange-400 text-orange-700 ring-2 ring-orange-200';
            else if (isChecked && cor) cls = 'bg-green-50 border-green-300 text-green-700';
            else if (isChecked && isMatched && !cor) cls = 'bg-red-50 border-red-300 text-red-600';
            else if (isMatched) cls = 'bg-sky-50 border-sky-300 text-sky-700';
            return <button key={term.id} onClick={() => !isChecked && onSelect('term', term.id)} disabled={isChecked} className={`w-full p-3 rounded-2xl border text-left text-[14px] font-medium transition-all shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${cls}`} data-testid={`match-term-${term.id}`}>{term.text}</button>;
          })}
        </div>
        <div className="space-y-2.5">
          <p className="text-[12px] text-[#AEAEB2] font-semibold mb-1">Meanings</p>
          {exercise.definitions.map((def) => {
            const isSel = matchState.selectedDef === def.id;
            const matchedByTerm = defToTerm[def.id];
            const isMatched = !!matchedByTerm;
            let cor = false; if (isChecked && isMatched) cor = exercise.answers[matchedByTerm] === def.id;
            let cls = 'bg-white border-black/[0.06] text-[#3A3A3C]';
            if (isSel) cls = 'bg-orange-50 border-orange-400 text-orange-700 ring-2 ring-orange-200';
            else if (isChecked && cor) cls = 'bg-green-50 border-green-300 text-green-700';
            else if (isChecked && isMatched && !cor) cls = 'bg-red-50 border-red-300 text-red-600';
            else if (isMatched) cls = 'bg-sky-50 border-sky-300 text-sky-700';
            return <button key={def.id} onClick={() => !isChecked && onSelect('def', def.id)} disabled={isChecked} className={`w-full p-3 rounded-2xl border text-left text-[13px] transition-all shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${cls}`} data-testid={`match-def-${def.id}`}>{def.text}</button>;
          })}
        </div>
      </div>
      {!isChecked && allMatched && (
        <div className="mt-5 flex justify-center"><button onClick={onCheck} className="h-11 rounded-full bg-orange-500 text-white text-[14px] font-semibold px-6 shadow-[0_2px_10px_rgba(234,88,12,0.3)]" data-testid="check-matching-btn">Check Answers</button></div>
      )}
    </div>
  );
}
