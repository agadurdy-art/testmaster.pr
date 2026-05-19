/**
 * True/False Grammar Game
 * Students decide if a sentence is grammatically correct or incorrect
 */

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { CheckCircle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { GameWrapper, GameComplete } from '../shared';

const TrueFalseGrammar = ({ 
  items, // Array of { sentence: "She are happy.", is_correct: false, corrected: "She is happy.", explanation: "..." }
  onComplete,
  onSkip
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!items?.length) return null;
  const rawItem = items[currentIdx];

  // Defensive normalisation — pack_unit_games emits `correct: "true"|"false"`
  // (string), authored content sometimes uses `is_correct: boolean`. Accept
  // both. Without this the component compared `selectedAnswer (boolean) ===
  // undefined` and "always wrong" — visible to Aga 2026-05-19.
  const correctAsBool = (() => {
    if (rawItem == null) return null;
    if (typeof rawItem.is_correct === 'boolean') return rawItem.is_correct;
    if (typeof rawItem.correct === 'boolean') return rawItem.correct;
    const s = String(rawItem.correct ?? rawItem.is_correct ?? '').toLowerCase().trim();
    if (s === 'true' || s === '1' || s === 'yes') return true;
    if (s === 'false' || s === '0' || s === 'no') return false;
    return null;
  })();
  const currentItem = rawItem ? { ...rawItem, is_correct: correctAsBool } : rawItem;

  const handleSelect = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    const isCorrect = answer === currentItem.is_correct;
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentIdx < items.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <GameComplete
        score={score}
        totalQuestions={items.length}
        onContinue={() => onComplete(Math.round((score / items.length) * 100))}
        onRetry={() => { setCurrentIdx(0); setScore(0); setIsComplete(false); setSelectedAnswer(null); setShowFeedback(false); }}
        title="Grammar Detective!"
      />
    );
  }

  if (!currentItem) return null;

  const userIsRight = selectedAnswer === currentItem.is_correct;

  return (
    <GameWrapper
      title="True or False?"
      subtitle="Is this sentence correct?"
      icon={CheckCircle}
      iconColor="teal"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-8">
        <div className="bg-slate-50 rounded-2xl p-8 mb-8 border-2 border-slate-200">
          <p className="text-2xl text-center font-medium text-gray-800 leading-relaxed" data-testid="tf-sentence">
            "{currentItem.sentence}"
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
          <button
            onClick={() => handleSelect(true)}
            disabled={showFeedback}
            data-testid="tf-true-btn"
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-3 transition-all text-xl font-bold ${
              showFeedback
                ? selectedAnswer === true
                  ? userIsRight
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-red-100 border-red-500 text-red-700'
                  : currentItem.is_correct === true
                    ? 'bg-green-50 border-green-400 text-green-600'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                : 'bg-green-50 border-green-200 hover:border-green-400 hover:bg-green-100 text-green-700 cursor-pointer'
            }`}
          >
            <ThumbsUp className="w-10 h-10" />
            Correct
          </button>

          <button
            onClick={() => handleSelect(false)}
            disabled={showFeedback}
            data-testid="tf-false-btn"
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-3 transition-all text-xl font-bold ${
              showFeedback
                ? selectedAnswer === false
                  ? userIsRight
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-red-100 border-red-500 text-red-700'
                  : currentItem.is_correct === false
                    ? 'bg-green-50 border-green-400 text-green-600'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                : 'bg-red-50 border-red-200 hover:border-red-400 hover:bg-red-100 text-red-700 cursor-pointer'
            }`}
          >
            <ThumbsDown className="w-10 h-10" />
            Incorrect
          </button>
        </div>

        {showFeedback && (
          <div className={`p-5 rounded-xl text-center ${userIsRight ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <p className="text-lg font-bold mb-1">{userIsRight ? 'Well done!' : 'Not quite!'}</p>
            {!currentItem.is_correct && currentItem.corrected && (
              <p className="text-base text-gray-700">Correct version: <strong className="text-green-700">{currentItem.corrected}</strong></p>
            )}
            {currentItem.explanation && <p className="text-sm text-gray-500 mt-1">{currentItem.explanation}</p>}
          </div>
        )}

        {showFeedback && (
          <div className="mt-6 text-center">
            <Button onClick={handleNext} data-testid="tf-next-btn">
              {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
            </Button>
          </div>
        )}
      </Card>
    </GameWrapper>
  );
};

export default TrueFalseGrammar;
