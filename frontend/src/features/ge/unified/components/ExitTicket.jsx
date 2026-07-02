import React, { useState } from 'react';
import { CheckCircle, AlertCircle, X, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import { stripMeta } from '../lib/normalize';
import FormattedQuestion from './FormattedQuestion';
import SkipButton from './SkipButton';

// ═══════ EXIT TICKET ═══════
function ExitTicket({ activity, onComplete, onSkip }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fillBlankValue, setFillBlankValue] = useState('');
  // Normalize Sonnet/legacy data shape so the renderer can rely on stable
  // fields: question_text, question_type, options. Question writer sometimes
  // emits `question` instead of `question_text` and omits `question_type`.
  // Also strips author meta-comments leaking from the prompt template.
  const questions = (activity?.questions || []).map((raw, qi) => {
    if (!raw || typeof raw !== 'object') return raw;
    const out = { ...raw };
    if (!out.question_text && out.question) out.question_text = out.question;
    out.question_text = stripMeta(out.question_text);
    out.question = stripMeta(out.question);
    if (Array.isArray(out.options)) out.options = out.options.map(stripMeta);
    if (!out.question_id) out.question_id = `exit_q${qi + 1}`;
    if (!out.question_type) {
      const opts = Array.isArray(out.options) ? out.options.map(o => String(o).toLowerCase()) : [];
      const isTF = opts.length === 2 && opts.includes('true') && opts.includes('false');
      out.question_type = isTF ? 'true_false' : (opts.length > 0 ? 'multiple_choice' : 'fill_blank');
    }
    return out;
  });
  const q = questions[idx];

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    const newAnswers = { ...answers, [q.question_id]: answer };
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setFillBlankValue('');
    if (idx < questions.length - 1) setIdx(i => i + 1);
    else setShowResults(true);
  };

  const calcScore = () => {
    let c = 0;
    questions.forEach(q => {
      const userAns = String(answers[q.question_id] || '').toLowerCase().trim();
      if (!userAns) return;
      let correct = false;
      if (Array.isArray(q.correct_answer)) {
        correct = q.correct_answer.some(a => String(a).toLowerCase().trim() === userAns);
      } else {
        correct = userAns === String(q.correct_answer || '').toLowerCase().trim();
      }
      if (!correct && q.acceptable_answers && Array.isArray(q.acceptable_answers)) {
        correct = q.acceptable_answers.some(a => String(a).toLowerCase().trim() === userAns);
      }
      if (correct) c++;
    });
    return Math.round((c / questions.length) * 100);
  };

  const handleRetry = () => {
    setIdx(0);
    setAnswers({});
    setShowResults(false);
    setShowFeedback(false);
    setFillBlankValue('');
  };

  if (showResults) {
    const score = calcScore();
    const passed = score >= (activity?.pass_threshold || 70);
    return (
      <Card className="p-8 text-center max-w-lg mx-auto" data-testid="exit-ticket-results">
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
          {passed ? <CheckCircle className="w-10 h-10 text-green-600" /> : <AlertCircle className="w-10 h-10 text-red-600" />}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{passed ? 'Great Job!' : 'Keep Practicing'}</h3>
        <p className="text-4xl font-bold mb-4" style={{ color: passed ? '#16a34a' : '#dc2626' }}>{score}%</p>

        {/* Show answer review */}
        <div className="text-left mb-6 space-y-2">
          {questions.map((q, i) => {
            const userAnswer = answers[q.question_id] || '';
            const isCorrect = Array.isArray(q.correct_answer)
              ? q.correct_answer.some(a => String(a).toLowerCase().trim() === String(userAnswer).toLowerCase().trim())
              : String(userAnswer).toLowerCase().trim() === String(q.correct_answer || '').toLowerCase().trim();
            const displayCorrect = Array.isArray(q.correct_answer) ? q.correct_answer.join(' / ') : q.correct_answer;
            return (
              <div key={q.question_id} className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="font-medium text-gray-800">{i + 1}. {q.question_text}</p>
                <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                  Your answer: {userAnswer} {isCorrect ? <CheckCircle className="inline w-4 h-4" /> : <span> (Correct: {displayCorrect})</span>}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          {passed ? 'You passed! Moving to the next step.' : `You need ${activity?.pass_threshold || 70}% to pass. Try again!`}
        </p>
        {passed ? (
          <Button onClick={() => onComplete(score)} data-testid="exit-ticket-continue-btn">Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
        ) : (
          <Button onClick={handleRetry} data-testid="exit-ticket-retry-btn">Try Again <RefreshCw className="w-4 h-4 ml-1" /></Button>
        )}
      </Card>
    );
  }

  if (!q) return null;

  const currentAnswer = answers[q.question_id];
  const checkCorrect = (ans, correctAns) => {
    if (!ans) return false;
    const ansLower = String(ans).toLowerCase().trim();
    // Check main correct answer(s)
    if (Array.isArray(correctAns)) {
      if (correctAns.some(a => String(a).toLowerCase().trim() === ansLower)) return true;
    } else {
      if (ansLower === String(correctAns || '').toLowerCase().trim()) return true;
    }
    // Check acceptable_answers for fill-blank
    if (q.acceptable_answers && Array.isArray(q.acceptable_answers)) {
      if (q.acceptable_answers.some(a => String(a).toLowerCase().trim() === ansLower)) return true;
    }
    return false;
  };
  const isCurrentCorrect = checkCorrect(currentAnswer, q.correct_answer);

  return (
    <div className="max-w-2xl mx-auto" data-testid="exit-ticket">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-amber-100 text-amber-700 border-0"><CheckCircle className="w-3 h-3 mr-1" /> Exit Quiz</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{idx + 1} / {questions.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={(idx / questions.length) * 100} className="mb-6" />
      <Card className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-5"><FormattedQuestion text={q.question_text || q.question} /></h3>
        {q.question_type === 'multiple_choice' && (
          <div className="space-y-3">
            {q.options?.map(option => {
              const isSelected = currentAnswer === option;
              const isCorrectOption = Array.isArray(q.correct_answer) ? q.correct_answer.includes(option) : option === q.correct_answer;
              let cls = 'border-gray-200 hover:border-blue-300';
              if (showFeedback) {
                if (isCorrectOption) cls = 'border-green-500 bg-green-50 text-green-800';
                else if (isSelected && !isCorrectOption) cls = 'border-red-500 bg-red-50 text-red-800';
                else cls = 'border-gray-200 opacity-50';
              } else if (isSelected) cls = 'border-blue-500 bg-blue-50';
              return (
                <button key={option} className={`w-full p-5 rounded-xl text-left border-2 transition-all text-lg font-medium ${cls}`}
                  onClick={() => handleAnswer(option)} disabled={showFeedback}
                  data-testid={`exit-option-${option.substring(0,15).replace(/\s/g,'-')}`}>
                  {option}
                  {showFeedback && isCorrectOption && <CheckCircle className="inline w-4 h-4 ml-2 text-green-600" />}
                  {showFeedback && isSelected && !isCorrectOption && <X className="inline w-4 h-4 ml-2 text-red-600" />}
                </button>
              );
            })}
          </div>
        )}
        {q.question_type === 'fill_blank' && (
          <div className="space-y-3">
            {q.hint && !showFeedback && (
              <p className="text-sm text-amber-600 italic">Hint: {q.hint}</p>
            )}
            <input type="text" value={fillBlankValue}
              onChange={e => setFillBlankValue(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-sm ${showFeedback ? (isCurrentCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'focus:border-blue-500 border-gray-200'}`}
              placeholder="Type your answer..."
              onKeyDown={e => { if (e.key === 'Enter' && fillBlankValue.trim() && !showFeedback) handleAnswer(fillBlankValue.trim()); }}
              disabled={showFeedback} autoFocus data-testid="exit-fill-blank-input" />
            {!showFeedback && <p className="text-xs text-gray-400">Press Enter to submit</p>}
            {!showFeedback && fillBlankValue.trim() && (
              <Button onClick={() => handleAnswer(fillBlankValue.trim())} size="sm" data-testid="exit-fill-blank-submit">Submit</Button>
            )}
            {showFeedback && !isCurrentCorrect && (
              <p className="text-sm text-red-600">Correct answer: <strong>{Array.isArray(q.correct_answer) ? q.correct_answer.join(' / ') : q.correct_answer}</strong></p>
            )}
          </div>
        )}
        {q.question_type === 'true_false' && (
          <div className="flex justify-center gap-4">
            <Button className="px-8" variant={currentAnswer === 'true' ? 'default' : 'outline'} onClick={() => handleAnswer('true')} disabled={showFeedback}>True</Button>
            <Button className="px-8" variant={currentAnswer === 'false' ? 'default' : 'outline'} onClick={() => handleAnswer('false')} disabled={showFeedback}>False</Button>
          </div>
        )}
        {showFeedback && (
          <div className="mt-5 flex items-center justify-between">
            <span className={`text-sm font-semibold ${isCurrentCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCurrentCorrect ? 'Correct!' : 'Incorrect'}
            </span>
            <Button onClick={handleNext} data-testid="exit-next-btn">
              {idx < questions.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ExitTicket;
