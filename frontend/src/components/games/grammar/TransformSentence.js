/**
 * Transform Sentence
 * Player rewrites a sentence according to a task instruction
 * (e.g., "Make it a question" or "Make it negative").
 * Item shape: { sentence, task?, answer }
 */

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { ArrowRightLeft, CheckCircle, X } from 'lucide-react';
import { GameWrapper, GameComplete } from '../shared';

const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[.?!,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const TransformSentence = ({ items, onComplete, onSkip }) => {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!items?.length) return null;
  const item = items[idx];

  const handleCheck = () => {
    if (feedback) return;
    const ok = normalize(input) === normalize(item.answer);
    setFeedback(ok ? 'correct' : 'wrong');
    if (ok) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (idx >= items.length - 1) {
      setIsComplete(true);
    } else {
      setIdx((i) => i + 1);
      setInput('');
      setFeedback(null);
    }
  };

  if (isComplete) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <GameComplete
        score={pct}
        correctCount={score}
        totalCount={items.length}
        message={`You transformed ${score} of ${items.length} sentences!`}
        onContinue={() => onComplete(pct)}
      />
    );
  }

  return (
    <GameWrapper
      title="Transform the Sentence"
      subtitle={`Question ${idx + 1} of ${items.length}`}
      icon={ArrowRightLeft}
      iconColor="purple"
      showProgress
      currentQuestion={idx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-violet-200">
        <p className="text-sm text-violet-700 font-semibold mb-1">{item.task || 'Change the sentence:'}</p>
        <p className="text-xl text-slate-900 mb-4 italic">"{item.sentence}"</p>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!!feedback}
          placeholder="Type your answer..."
          className="text-lg"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (feedback) handleNext();
              else handleCheck();
            }
          }}
        />
        {feedback && (
          <div
            className={`mt-3 p-3 rounded-lg text-sm ${
              feedback === 'correct' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {feedback === 'correct' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {feedback === 'correct' ? 'Correct!' : 'Not quite.'}
            </div>
            <div className="mt-1">
              Answer: <span className="font-semibold">{item.answer}</span>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          {!feedback ? (
            <Button onClick={handleCheck} disabled={!input.trim()}>
              Check
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {idx >= items.length - 1 ? 'Finish' : 'Next'}
            </Button>
          )}
        </div>
      </Card>
    </GameWrapper>
  );
};

export default TransformSentence;
