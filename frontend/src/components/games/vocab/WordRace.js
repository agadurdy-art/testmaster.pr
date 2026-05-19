/**
 * Word Race - Timed vocab quiz
 * Player taps the right option for as many prompts as possible before the timer ends.
 * Item shape: { prompt, correct_emoji, options: [emoji, ...] }
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Timer, Zap, Trophy, X, CheckCircle } from 'lucide-react';
import { GameWrapper, GameComplete } from '../shared';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const resolveImg = (u) => (u && u.startsWith('/') ? `${API_URL}/api${u}` : u || '');

const WordRace = ({ items, onComplete, onSkip, timeLimit }) => {
  const totalTime = timeLimit || 60;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(totalTime);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [isComplete, setIsComplete] = useState(false);
  const tickRef = useRef(null);

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
  const item = items[currentIdx % items.length];
  // Prefer options_full (objects with image_url) over options (legacy emoji
  // strings) so games reuse the same artwork as the vocabulary cards.
  const optionObjs = (item.options_full && item.options_full.length)
    ? item.options_full
    : (item.options || []).map((emoji) => ({ emoji, image_url: '' }));
  const correctImg = item.correct_image_url || '';

  // Robust correctness: try image, then emoji, then word match against prompt.
  // Pack scripts don't always populate `correct_image_url`, so the old
  // image-only check silently marked every answer wrong (Aga 2026-05-19).
  const promptWord = String(item.prompt || '').trim().toLowerCase();
  const isOptionCorrect = (opt) => {
    if (correctImg && opt.image_url && opt.image_url === correctImg) return true;
    if (item.correct_emoji && opt.emoji && opt.emoji === item.correct_emoji) return true;
    if (promptWord && opt.word && opt.word.toLowerCase() === promptWord) return true;
    return false;
  };

  const handlePick = (opt) => {
    if (feedback || isComplete) return;
    const isCorrect = isOptionCorrect(opt);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore((s) => s + 1);
    else setWrongCount((w) => w + 1);
    setTimeout(() => {
      setFeedback(null);
      setCurrentIdx((i) => i + 1);
    }, 350);
  };

  if (isComplete) {
    const total = score + wrongCount;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <GameComplete
        score={pct}
        correctCount={score}
        totalCount={total}
        message={`You raced through ${score} word${score === 1 ? '' : 's'}!`}
        onContinue={() => onComplete(pct)}
      />
    );
  }

  return (
    <GameWrapper
      title="Word Race"
      subtitle={`${secondsLeft}s left · Score ${score}`}
      icon={Zap}
      iconColor="orange"
      showProgress={false}
      onSkip={onSkip}
    >
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Timer className="w-5 h-5" />
            <span className="text-xl font-bold tabular-nums">{secondsLeft}s</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <Trophy className="w-5 h-5" />
            <span className="text-xl font-bold">{score}</span>
          </div>
        </div>
        <div className="text-center mb-5">
          <p className="text-sm text-slate-500 mb-2">Tap the right picture for:</p>
          <h3 className="text-3xl font-bold text-slate-900">{item.prompt}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {optionObjs.map((opt, idx) => {
            const isCorrect = isOptionCorrect(opt);
            const highlight = (feedback === 'correct' || feedback === 'wrong') && isCorrect;
            return (
              <button
                key={idx}
                onClick={() => handlePick(opt)}
                disabled={!!feedback}
                className={`p-3 rounded-2xl bg-white border-2 transition-all active:scale-95 ${
                  highlight ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-amber-400'
                }`}
              >
                {opt.image_url ? (
                  <img
                    src={resolveImg(opt.image_url)}
                    alt={opt.word || ''}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-5xl">{opt.emoji}</span>
                )}
              </button>
            );
          })}
        </div>
        {feedback === 'correct' && (
          <div className="mt-3 text-center text-emerald-700 font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" /> +1
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="mt-3 text-center text-rose-700 font-semibold flex items-center justify-center gap-2">
            <X className="w-5 h-5" /> Keep going!
          </div>
        )}
      </Card>
    </GameWrapper>
  );
};

export default WordRace;
