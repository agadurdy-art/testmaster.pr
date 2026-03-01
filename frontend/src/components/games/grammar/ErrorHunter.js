/**
 * Error Hunter Grammar Game - FIXED
 * Find the grammar mistake in a sentence
 * Now handles sentences with multiple errors by accepting ANY valid error
 */

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Search } from 'lucide-react';
import { GameWrapper, GameComplete } from '../shared';

const ErrorHunter = ({ items, onComplete, onSkip }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = items[currentIdx];

  const handleWordClick = (word, index) => {
    if (showFeedback) return;
    
    setSelectedWord({ word, index });
    setShowFeedback(true);
    
    // PRIMARY: Check against the designated errorWord
    const cleanClicked = word.toLowerCase().replace(/[.,!?;:'"]/g, '');
    const cleanError = currentItem.errorWord.toLowerCase().replace(/[.,!?;:'"]/g, '');
    
    const isPrimaryError = 
      word.toLowerCase() === currentItem.errorWord.toLowerCase() ||
      (cleanError.length > 0 && cleanClicked === cleanError) ||
      (currentItem.errorWord.length <= 2 && word.includes(currentItem.errorWord));
    
    // SECONDARY: Also accept if user clicked a word that IS actually wrong
    // (for sentences with multiple errors like "She have two friend.")
    const alternateErrors = currentItem.alternateErrors || [];
    const isAlternateError = alternateErrors.some(alt => 
      cleanClicked === alt.toLowerCase().replace(/[.,!?;:'"]/g, '')
    );
    
    if (isPrimaryError || isAlternateError) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedWord(null);
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
        onRetry={() => { setCurrentIdx(0); setScore(0); setIsComplete(false); setSelectedWord(null); setShowFeedback(false); }}
        title="Error Detective!"
      />
    );
  }

  if (!currentItem) return null;

  const words = currentItem.sentence.split(/\s+/);
  const cleanClicked = selectedWord?.word.toLowerCase().replace(/[.,!?;:'"]/g, '') || '';
  const cleanError = currentItem.errorWord.toLowerCase().replace(/[.,!?;:'"]/g, '');
  const alternateErrors = (currentItem.alternateErrors || []).map(e => e.toLowerCase().replace(/[.,!?;:'"]/g, ''));
  
  const isCorrectSelection = (() => {
    if (!selectedWord) return false;
    const w = selectedWord.word;
    const cw = w.toLowerCase().replace(/[.,!?;:'"]/g, '');
    return (
      w.toLowerCase() === currentItem.errorWord.toLowerCase() ||
      (cleanError.length > 0 && cw === cleanError) ||
      (currentItem.errorWord.length <= 2 && w.includes(currentItem.errorWord)) ||
      alternateErrors.includes(cw)
    );
  })();

  return (
    <GameWrapper
      title="Find the Mistake"
      subtitle="Tap the wrong word in the sentence"
      icon={Search}
      iconColor="orange"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-8 text-center">
        <div className="bg-orange-50 rounded-2xl p-6 mb-6 border border-orange-100">
          <p className="text-gray-500 text-base mb-4">Tap the word with the mistake</p>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {words.map((word, idx) => {
              const cw = word.toLowerCase().replace(/[.,!?;:'"]/g, '');
              const isError = cw === cleanError ||
                word.toLowerCase() === currentItem.errorWord.toLowerCase() ||
                (currentItem.errorWord.length <= 2 && word.includes(currentItem.errorWord)) ||
                alternateErrors.includes(cw);
              const isSelected = selectedWord?.index === idx;
              
              let wordClass = 'px-4 py-3 rounded-lg font-medium text-xl transition-all cursor-pointer ';
              if (showFeedback) {
                if (isSelected && isCorrectSelection) {
                  wordClass += 'bg-red-200 text-red-800 border-2 border-red-400 line-through';
                } else if (isSelected && !isCorrectSelection) {
                  wordClass += 'bg-yellow-200 text-yellow-800 border-2 border-yellow-400';
                } else if (isError) {
                  wordClass += 'bg-red-100 text-red-600 border-2 border-red-300';
                } else {
                  wordClass += 'bg-gray-100 text-gray-400';
                }
              } else {
                wordClass += 'bg-white border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-800';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleWordClick(word, idx)}
                  disabled={showFeedback}
                  data-testid={`error-word-${idx}`}
                  className={wordClass}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback && (
          <div className={`p-5 rounded-xl ${isCorrectSelection ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="text-lg font-bold mb-1">
              {isCorrectSelection ? 'Great catch!' : 'Not that one!'}
            </p>
            <p className="text-base">
              <span className="text-red-600 line-through font-medium">{currentItem.errorWord}</span>
              <span className="mx-2">→</span>
              <span className="text-green-600 font-bold">{currentItem.correctWord}</span>
            </p>
            {currentItem.explanation && (
              <p className="text-sm text-gray-500 mt-2">{currentItem.explanation}</p>
            )}
          </div>
        )}

        {showFeedback && (
          <div className="mt-5">
            <Button onClick={handleNext} data-testid="error-next-btn">
              {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
            </Button>
          </div>
        )}
      </Card>
    </GameWrapper>
  );
};

export default ErrorHunter;
