/**
 * Image Word Match
 * Show an emoji/image and the player taps the right word among 4 options.
 * Item shape: { word, emoji, distractors: [{ word, emoji }, ...] }
 */

import React, { useState, useMemo } from 'react';
import { Card } from '../../ui/card';
import { Image as ImageIcon, CheckCircle, X } from 'lucide-react';
import { GameWrapper, GameComplete } from '../shared';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const resolveImg = (u) => (u && u.startsWith('/') ? `${API_URL}/api${u}` : u || '');

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const ImageWordMatch = ({ items, onComplete, onSkip }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const options = useMemo(() => {
    if (!items?.[idx]) return [];
    const item = items[idx];
    const all = [{ word: item.word, emoji: item.emoji }, ...(item.distractors || [])];
    return shuffle(all);
  }, [items, idx]);

  if (!items?.length) return null;
  const item = items[idx];

  const handlePick = (option) => {
    if (feedback) return;
    setPicked(option.word);
    const correct = option.word === item.word;
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
    }, 800);
  };

  if (isComplete) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <GameComplete
        score={pct}
        correctCount={score}
        totalCount={items.length}
        message={`You matched ${score} of ${items.length}!`}
        onContinue={() => onComplete(pct)}
      />
    );
  }

  return (
    <GameWrapper
      title="Image-Word Match"
      subtitle={`Question ${idx + 1} of ${items.length}`}
      icon={ImageIcon}
      iconColor="emerald"
      showProgress
      currentQuestion={idx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-emerald-200">
        <div className="text-center mb-6">
          {item.image_url ? (
            <img
              src={resolveImg(item.image_url)}
              alt={item.word}
              className="w-40 h-40 object-cover rounded-2xl mx-auto mb-2 border border-emerald-100"
            />
          ) : (
            <div className="text-7xl mb-2">{item.emoji}</div>
          )}
          <p className="text-sm text-slate-500">Choose the right word</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => {
            const isPicked = picked === opt.word;
            const isCorrect = opt.word === item.word;
            return (
              <button
                key={opt.word}
                onClick={() => handlePick(opt)}
                disabled={!!feedback}
                className={`p-4 rounded-xl text-lg font-medium border-2 transition-all ${
                  feedback && isPicked && isCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : feedback && isPicked && !isCorrect
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : feedback && !isPicked && isCorrect
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700'
                    : 'border-slate-200 bg-white hover:border-emerald-400'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {feedback && isPicked && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                  {feedback && isPicked && !isCorrect && <X className="w-5 h-5 text-rose-600" />}
                  {opt.word}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
    </GameWrapper>
  );
};

export default ImageWordMatch;
