import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ChevronLeft, ChevronRight, CheckCircle, XCircle, 
  Award, RotateCcw, Trophy, BookOpen, Target
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const PASSING_SCORE = 80;

function normalizeOptionLabel(option) {
  if (typeof option !== 'string') return '';
  return option.replace(/^[A-D]\)\s*/i, '').trim();
}

function getCorrectMeta(question) {
  const rawAnswer = question.answer ?? question.correct_answer ?? question.correct;

  if (question.type === 'fill_blank') {
    return {
      type: 'fill_blank',
      rawAnswer: String(rawAnswer || ''),
      normalizedText: String(rawAnswer || '').trim().toLowerCase(),
    };
  }

  if (typeof question.correct_index === 'number') {
    return {
      type: 'multiple_choice',
      rawAnswer,
      normalizedIndex: question.correct_index,
      normalizedText: normalizeOptionLabel(question.options?.[question.correct_index] || '').toLowerCase(),
    };
  }

  if (typeof rawAnswer === 'number') {
    return {
      type: 'multiple_choice',
      rawAnswer,
      normalizedIndex: rawAnswer,
      normalizedText: normalizeOptionLabel(question.options?.[rawAnswer] || '').toLowerCase(),
    };
  }

  const rawText = String(rawAnswer || '').trim();
  const labelMatch = rawText.match(/^([A-D])(?:\)|\.)?$/i);
  if (labelMatch) {
    const normalizedIndex = labelMatch[1].toUpperCase().charCodeAt(0) - 65;
    return {
      type: 'multiple_choice',
      rawAnswer,
      normalizedIndex,
      normalizedText: normalizeOptionLabel(question.options?.[normalizedIndex] || '').toLowerCase(),
    };
  }

  const normalizedText = normalizeOptionLabel(rawText).toLowerCase();
  const optionIndex = Array.isArray(question.options)
    ? question.options.findIndex((option) => normalizeOptionLabel(option).toLowerCase() === normalizedText)
    : -1;

  return {
    type: 'multiple_choice',
    rawAnswer,
    normalizedIndex: optionIndex >= 0 ? optionIndex : undefined,
    normalizedText,
  };
}

function isCorrectAnswer(question, userAnswer) {
  const meta = getCorrectMeta(question);

  if (meta.type === 'fill_blank') {
    return String(userAnswer || '').trim().toLowerCase() === meta.normalizedText;
  }

  if (typeof userAnswer === 'number' && meta.normalizedIndex !== undefined) {
    return userAnswer === meta.normalizedIndex;
  }

  return normalizeOptionLabel(String(userAnswer || '')).toLowerCase() === meta.normalizedText;
}

function getDisplayCorrectAnswer(question) {
  const meta = getCorrectMeta(question);

  if (meta.type === 'fill_blank') return meta.rawAnswer || '';
  if (meta.normalizedIndex !== undefined && question.options?.[meta.normalizedIndex] !== undefined) {
    return question.options[meta.normalizedIndex];
  }
  return meta.rawAnswer || '';
}

export default function VocabularyQuizMode({ user }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [passage, setPassage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fillInputs, setFillInputs] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const backPath = moduleId?.startsWith('beginner-') ? '/beginner-course' : moduleId?.startsWith('mastery-') ? '/mastery-course' : '/advanced-mastery';

  useEffect(() => { fetchQuiz(); }, [moduleId]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vocabulary-engine/${moduleId}/quiz`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        if (d.reading_passage) setPassage(d.reading_passage);
      }
      else { toast.error('Failed to load quiz'); navigate(backPath); }
    } catch { toast.error('Connection error'); }
    finally { setLoading(false); }
  };

  const selectAnswer = (qid, ans) => { if (!submitted) setAnswers(p => ({ ...p, [qid]: ans })); };
  const updateFillInput = (qid, val) => { if (!submitted) setFillInputs(p => ({ ...p, [qid]: val })); };

  const submitQuiz = async () => {
    if (!data) return;
    let correct = 0;
    // Merge fill inputs into answers
    const mergedAnswers = { ...answers };
    data.questions.forEach(q => {
      if (q.type === 'fill_blank' && fillInputs[q.id]) {
        mergedAnswers[q.id] = fillInputs[q.id];
      }
      // Check correctness
      const userAns = mergedAnswers[q.id] || '';
      if (isCorrectAnswer(q, userAns)) correct++;
    });

    const total = data.questions.length;
    const pct = Math.round((correct / total) * 100);
    setResult({ score: correct, total, percentage: pct, passed: pct >= PASSING_SCORE });
    setSubmitted(true);
    setAnswers(mergedAnswers);

    if (user) {
      try { await fetch(`${API_URL}/api/vocabulary-engine/quiz/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module_id: moduleId, user_id: user.id, answers: mergedAnswers, score: correct, total }) }); } catch {}
    }
  };

  const handleRetry = () => { setCurrentIdx(0); setAnswers({}); setFillInputs({}); setSubmitted(false); setResult(null); fetchQuiz(); };

  const isQuestionAnswered = (q) => {
    if (q.type === 'fill_blank') return !!fillInputs[q.id]?.trim();
    return answers[q.id] !== undefined;
  };
  const answeredCount = data ? data.questions.filter(isQuestionAnswered).length : 0;

  if (loading) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center" data-testid="quiz-mode-loading"><div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-violet-500" /></div>;
  if (!data || !data.questions?.length) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center"><p className="text-[#86868B]">No quiz questions available.</p></div>;

  // Results
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col" data-testid="quiz-results-screen">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-black/[0.04]">
          <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
            <button onClick={() => navigate(backPath)} className="flex items-center gap-1.5 text-sm text-orange-500 font-medium" data-testid="back-from-quiz-results"><ChevronLeft className="w-4 h-4" /> Course</button>
            <p className="text-[15px] font-semibold text-[#1D1D1F]">Quiz Results</p>
            <div />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                {result.passed ? <Trophy className="w-12 h-12 text-green-500" /> : <Target className="w-12 h-12 text-red-400" />}
              </div>
              <h2 className="text-[24px] font-bold text-[#1D1D1F] mb-1">{result.passed ? 'Mastery Achieved!' : 'Keep Practicing'}</h2>
              <p className="text-[14px] text-[#86868B]">{result.passed ? 'You\'ve mastered this vocabulary.' : `You need ${PASSING_SCORE}% to pass.`}</p>
            </div>

            <div className="bg-white rounded-[20px] p-6 mb-5 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <p className="text-[56px] font-bold tabular-nums" data-testid="quiz-final-score"><span className={result.passed ? 'text-green-500' : 'text-red-400'}>{result.percentage}%</span></p>
              <p className="text-[14px] text-[#86868B]">{result.score} / {result.total} correct</p>
              <Badge className={`mt-3 text-[12px] font-semibold ${result.passed ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>{result.passed ? 'PASSED' : 'NOT PASSED'}</Badge>
            </div>

            <div className="bg-white rounded-[20px] p-4 mb-5 max-h-64 overflow-y-auto shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <p className="text-[12px] text-[#AEAEB2] uppercase tracking-wider font-semibold mb-3">Review</p>
              {data.questions.map((q, i) => {
                const userAns = answers[q.id] || '';
                const isCorrect = isCorrectAnswer(q, userAns);
                const displayCorrectAnswer = getDisplayCorrectAnswer(q);
                const displayUserAnswer = typeof userAns === 'number' ? (q.options?.[userAns] || userAns) : userAns;
                return (
                  <div key={i} className={`p-3 rounded-2xl mb-2 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-start gap-2">
                      {isCorrect ? <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-[13px] text-[#1D1D1F] leading-snug">{q.question}</p>
                        {!isCorrect && <p className="text-[12px] text-green-600 mt-1">Correct: {displayCorrectAnswer}</p>}
                        {!isCorrect && displayUserAnswer !== '' && <p className="text-[12px] text-red-400 mt-0.5">Your answer: {displayUserAnswer}</p>}
                        {q.explanation && <p className="text-[12px] text-[#AEAEB2] mt-1">{q.explanation}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              {!result.passed && <button onClick={handleRetry} className="flex-1 h-12 rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)] text-[14px] font-semibold text-[#3A3A3C] flex items-center justify-center gap-2" data-testid="retry-quiz-btn"><RotateCcw className="w-4 h-4" /> Retry</button>}
              <button onClick={() => navigate(backPath)} className="flex-1 h-12 rounded-full bg-orange-500 shadow-[0_2px_10px_rgba(234,88,12,0.3)] text-[14px] font-semibold text-white flex items-center justify-center gap-2" data-testid="back-to-modules-btn"><BookOpen className="w-4 h-4" /> {result.passed ? 'Next Module' : 'Back to Course'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = data.questions[currentIdx];
  const prog = ((currentIdx + 1) / data.questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col" data-testid="vocabulary-quiz-mode">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
          <button onClick={() => navigate(backPath)} className="flex items-center gap-1.5 text-sm text-orange-500 font-medium" data-testid="back-from-quiz"><ChevronLeft className="w-4 h-4" /> Back</button>
          <p className="text-[15px] font-semibold text-[#1D1D1F]">Mastery Quiz</p>
          <Badge className="bg-violet-50 text-violet-600 border-violet-200 text-[12px] font-semibold">{answeredCount}/{data.questions.length}</Badge>
        </div>
        <div className="h-[3px] bg-black/[0.04]"><div className="h-full bg-violet-500 transition-all duration-300" style={{ width: `${prog}%` }} data-testid="quiz-progress-bar" /></div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6 overflow-y-auto">
        <div className="w-full max-w-xl">
          <p className="text-[12px] text-[#AEAEB2] uppercase tracking-wider font-semibold mb-3">
            Question {currentIdx + 1} of {data.questions.length}
            {question.type === 'fill_blank' && <span className="ml-2 text-orange-500">Fill in the Blank</span>}
            {question.type === 'true_false_ng' && <span className="ml-2 text-sky-500">True / False / Not Given</span>}
          </p>

          {/* TFNG: Show reading passage */}
          {question.type === 'true_false_ng' && passage && (
            <div className="bg-white rounded-[20px] p-5 mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] max-h-48 overflow-y-auto" data-testid="tfng-passage">
              <p className="text-[11px] text-[#AEAEB2] uppercase tracking-wider font-semibold mb-2">Reference Passage</p>
              <p className="text-[13px] text-[#3A3A3C] leading-relaxed">{passage}</p>
            </div>
          )}

          {/* Question text */}
          <div className="bg-white rounded-[20px] p-6 mb-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="text-[16px] text-[#1D1D1F] leading-relaxed" data-testid="quiz-question-text">{question.question}</p>
          </div>

          {/* Multiple choice options - default for questions without type or with type='multiple_choice' */}
          {(!question.type || question.type === 'multiple_choice') && question.options && (
            <div className="space-y-2.5" data-testid="quiz-options-mc">
              {question.options.map((option, i) => {
                const sel = answers[question.id] === i;
                return (
                  <button key={i} onClick={() => selectAnswer(question.id, i)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${sel ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white border-black/[0.06] text-[#3A3A3C] hover:bg-violet-50/40 hover:border-violet-200'}`}
                    data-testid={`quiz-option-${i}`}>
                    <span className="text-[14px] font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* True/False/Not Given options */}
          {question.type === 'true_false_ng' && (
            <div className="space-y-2.5" data-testid="quiz-options-tfng">
              {['True', 'False', 'Not Given'].map((option) => {
                const sel = answers[question.id] === option;
                return (
                  <button key={option} onClick={() => selectAnswer(question.id, option)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${sel ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white border-black/[0.06] text-[#3A3A3C] hover:bg-violet-50/40 hover:border-violet-200'}`}
                    data-testid={`quiz-option-tfng-${option.toLowerCase().replace(' ', '-')}`}>
                    <span className="text-[14px] font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill in the blank input */}
          {question.type === 'fill_blank' && (
            <div data-testid="quiz-fill-blank">
              <input
                type="text"
                value={fillInputs[question.id] || ''}
                onChange={(e) => updateFillInput(question.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 rounded-2xl border border-black/[0.06] bg-white text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] shadow-[0_1px_4px_rgba(0,0,0,0.04)] focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                data-testid="quiz-fill-input"
              />
              {fillInputs[question.id] && (
                <p className="text-[12px] text-[#86868B] mt-2 px-1">Your answer: <span className="font-medium text-violet-600">{fillInputs[question.id]}</span></p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 px-2">
            <button onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} disabled={currentIdx === 0} className="w-11 h-11 rounded-full bg-white shadow-[0_1px_8px_rgba(0,0,0,0.08)] flex items-center justify-center disabled:opacity-25" data-testid="quiz-prev-btn"><ChevronLeft className="w-5 h-5 text-[#3A3A3C]" /></button>
            <div className="flex gap-[5px]">
              {data.questions.map((q, i) => (
                <button key={i} onClick={() => setCurrentIdx(i)} className={`rounded-full transition-all duration-200 ${i === currentIdx ? 'w-6 h-2 bg-violet-500' : isQuestionAnswered(q) ? 'w-2 h-2 bg-violet-300' : 'w-2 h-2 bg-[#D1D1D6]'}`} data-testid={`quiz-dot-${i}`} />
              ))}
            </div>
            {currentIdx === data.questions.length - 1 ? (
              <button onClick={submitQuiz} disabled={answeredCount < data.questions.length} className="h-11 rounded-full bg-violet-500 hover:bg-violet-600 text-white text-[14px] font-semibold px-5 shadow-[0_2px_10px_rgba(139,92,246,0.3)] disabled:opacity-30 flex items-center gap-2 transition-colors" data-testid="submit-quiz-btn">Submit <Award className="w-4 h-4" /></button>
            ) : (
              <button onClick={() => setCurrentIdx(p => Math.min(data.questions.length - 1, p + 1))} className="w-11 h-11 rounded-full bg-white shadow-[0_1px_8px_rgba(0,0,0,0.08)] flex items-center justify-center" data-testid="quiz-next-btn"><ChevronRight className="w-5 h-5 text-[#3A3A3C]" /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
