/**
 * Audio Match - Listen and choose the written form
 * Player hears a sentence (browser TTS) and picks the matching written option.
 * Item shape: { audio_text, options: [string, ...], correct }
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Headphones, CheckCircle, X } from 'lucide-react';
import { GameWrapper, GameComplete, AudioButton } from '../shared';

const AudioMatch = ({ items, onComplete, onSkip }) => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!items?.length) return null;
  const item = items[idx];

  // Auto-play on first render of each item
  useEffect(() => {
    const t = setTimeout(() => {
      if ('speechSynthesis' in window && item?.audio_text) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(item.audio_text);
        u.rate = 0.85;
        u.lang = 'en-US';
        window.speechSynthesis.speak(u);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [idx, item]);

  const handlePick = (option) => {
    if (feedback) return;
    setPicked(option);
    const correct = option === item.correct;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx >= items.length - 1) {
        setIsComplete(true);
      } else {
        setIdx((i) => i + 1);
        setPicked(null);
        setFeedback(null);
      }
    }, 1100);
  };

  if (isComplete) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <GameComplete
        score={pct}
        correctCount={score}
        totalCount={items.length}
        message={`You heard right ${score} of ${items.length} times!`}
        onContinue={() => onComplete(pct)}
      />
    );
  }

  return (
    <GameWrapper
      title="Listen & Match"
      subtitle={`Question ${idx + 1} of ${items.length}`}
      icon={Headphones}
      iconColor="blue"
      showProgress
      currentQuestion={idx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-sky-200">
        <div className="flex flex-col items-center gap-3 mb-5">
          <AudioButton text={item.audio_text} size="lg" />
          <p className="text-sm text-slate-500">Tap the sentence you hear</p>
        </div>
        <div className="space-y-2">
          {(item.options || []).map((opt) => {
            const isPicked = picked === opt;
            const isCorrect = opt === item.correct;
            return (
              <button
                key={opt}
                onClick={() => handlePick(opt)}
                disabled={!!feedback}
                className={`w-full p-4 rounded-xl text-left text-base font-medium border-2 transition-all ${
                  feedback && isPicked && isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : feedback && isPicked && !isCorrect
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : feedback && !isPicked && isCorrect
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700'
                    : 'border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/40'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {feedback && isPicked && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                  {feedback && isPicked && !isCorrect && <X className="w-4 h-4 text-rose-600" />}
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

export default AudioMatch;
