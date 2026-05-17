/**
 * Word Ladder - Sequential rungs
 * Player climbs the ladder by choosing the correct word for each rung.
 * Item shape: { prompt, options: [string, ...], correct }
 */

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { ArrowUp, CheckCircle, X } from 'lucide-react';
import { GameWrapper, GameComplete } from '../shared';

const WordLadder = ({ items, onComplete, onSkip }) => {
  const [rung, setRung] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [picked, setPicked] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  if (!items?.length) return null;
  const item = items[rung];

  const handlePick = (option) => {
    if (feedback) return;
    setPicked(option);
    const correct = option === item.correct;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (rung >= items.length - 1) {
        setIsComplete(true);
      } else {
        setRung((r) => r + 1);
        setFeedback(null);
        setPicked(null);
      }
    }, 900);
  };

  if (isComplete) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <GameComplete
        score={pct}
        correctCount={score}
        totalCount={items.length}
        message={`You climbed to the top with ${score} of ${items.length}!`}
        onContinue={() => onComplete(pct)}
      />
    );
  }

  return (
    <GameWrapper
      title="Word Ladder"
      subtitle={`Rung ${rung + 1} of ${items.length}`}
      icon={ArrowUp}
      iconColor="cyan"
      showProgress
      currentQuestion={rung + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <div className="space-y-2 mb-5">
        {items.map((it, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i < rung ? 'bg-emerald-500' : i === rung ? 'bg-cyan-400 animate-pulse' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-cyan-200">
        <p className="text-base text-slate-700 mb-4">{item.prompt}</p>
        <div className="space-y-2">
          {(item.options || []).map((opt) => {
            const isPicked = picked === opt;
            const isCorrect = opt === item.correct;
            return (
              <button
                key={opt}
                onClick={() => handlePick(opt)}
                disabled={!!feedback}
                className={`w-full p-4 rounded-xl text-left text-lg font-medium border-2 transition-all ${
                  feedback && isPicked && isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : feedback && isPicked && !isCorrect
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : feedback && !isPicked && isCorrect
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700'
                    : 'border-slate-200 bg-white hover:border-cyan-400 hover:bg-cyan-50/40'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {feedback && isPicked && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                  {feedback && isPicked && !isCorrect && <X className="w-5 h-5 text-rose-600" />}
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
    </GameWrapper>
  );
};

export default WordLadder;
