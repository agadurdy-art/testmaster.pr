/**
 * Sentence Builder Timed
 * Word_order with a countdown timer. Player drags words into order before time runs out.
 * Item shape: { words: [string, ...], correct_sentence }
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Timer, RotateCcw, CheckCircle, X } from 'lucide-react';
import { GameWrapper, GameComplete } from '../shared';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const SentenceBuilderTimed = ({ items, onComplete, onSkip, timeLimit }) => {
  const totalTime = timeLimit || 45;
  const [idx, setIdx] = useState(0);
  const [pool, setPool] = useState([]);
  const [picked, setPicked] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(totalTime);
  const [isComplete, setIsComplete] = useState(false);
  const tickRef = useRef(null);

  // Reset pool on item change
  useEffect(() => {
    if (!items?.[idx]) return;
    setPool(shuffle(items[idx].words.map((w, i) => ({ id: i, word: w }))));
    setPicked([]);
    setFeedback(null);
  }, [idx, items]);

  // Global countdown
  useEffect(() => {
    if (isComplete) return;
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tickRef.current);
          setIsComplete(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [isComplete]);

  if (!items?.length) return null;
  const item = items[idx];

  const pickWord = (w) => {
    if (feedback) return;
    setPicked((p) => [...p, w]);
    setPool((pl) => pl.filter((x) => x.id !== w.id));
  };
  const returnWord = (w, position) => {
    if (feedback) return;
    setPicked((p) => p.filter((_, i) => i !== position));
    setPool((pl) => [...pl, w]);
  };
  const handleCheck = () => {
    const built = picked.map((p) => p.word).join(' ').replace(/\s+([.?!,])/g, '$1');
    const norm = (s) => s.toLowerCase().replace(/[.?!]/g, '').replace(/\s+/g, ' ').trim();
    const ok = norm(built) === norm(item.correct_sentence);
    setFeedback(ok ? 'correct' : 'wrong');
    if (ok) setScore((s) => s + 1);
  };
  const handleNext = () => {
    if (idx >= items.length - 1) setIsComplete(true);
    else setIdx((i) => i + 1);
  };
  const handleReset = () => {
    setPool((prev) => [...prev, ...picked]);
    setPicked([]);
  };

  if (isComplete) {
    const total = items.length;
    const pct = Math.round((score / total) * 100);
    return (
      <GameComplete
        score={pct}
        correctCount={score}
        totalCount={total}
        message={`You built ${score} of ${total} before the timer ran out!`}
        onContinue={() => onComplete(pct)}
      />
    );
  }

  return (
    <GameWrapper
      title="Sentence Builder · Speed Round"
      subtitle={`${secondsLeft}s left · Score ${score}`}
      icon={Timer}
      iconColor="orange"
      showProgress={false}
      onSkip={onSkip}
    >
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-amber-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-amber-700 font-bold tabular-nums">
            <Timer className="w-5 h-5" /> {secondsLeft}s
          </div>
          <div className="text-emerald-700 font-bold">Score {score} / {items.length}</div>
        </div>
        <div className="min-h-[64px] p-3 mb-3 border-2 border-dashed border-slate-300 rounded-xl flex flex-wrap gap-2">
          {picked.length === 0 && <span className="text-slate-400 text-sm">Tap words below to build the sentence...</span>}
          {picked.map((w, i) => (
            <button
              key={`p-${w.id}`}
              onClick={() => returnWord(w, i)}
              className="px-3 py-2 rounded-lg bg-violet-100 text-violet-800 font-medium border border-violet-200 hover:bg-violet-200"
            >
              {w.word}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {pool.map((w) => (
            <button
              key={`pool-${w.id}`}
              onClick={() => pickWord(w)}
              className="px-3 py-2 rounded-lg bg-white text-slate-800 font-medium border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50"
            >
              {w.word}
            </button>
          ))}
        </div>
        {feedback && (
          <div className={`p-3 rounded-lg mb-3 text-sm ${feedback === 'correct' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
            <div className="flex items-center gap-2 font-semibold">
              {feedback === 'correct' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {feedback === 'correct' ? 'Correct!' : 'Try again.'}
            </div>
            <div className="mt-1">Answer: <span className="font-semibold">{item.correct_sentence}</span></div>
          </div>
        )}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={!!feedback}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
          {!feedback ? (
            <Button onClick={handleCheck} disabled={picked.length === 0}>Check</Button>
          ) : (
            <Button onClick={handleNext}>{idx >= items.length - 1 ? 'Finish' : 'Next'}</Button>
          )}
        </div>
      </Card>
    </GameWrapper>
  );
};

export default SentenceBuilderTimed;
