/**
 * Error Hunter Game
 * Find and fix grammar errors in sentences
 */

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Search, CheckCircle, X } from 'lucide-react';
import { 
  GameWrapper, 
  GameComplete 
} from '../shared';

const ErrorHunter = ({ 
  items, // Array of { sentence: "He have a cat.", errorWord: "have", correctWord: "has" }
  onComplete,
  onSkip
}) => {
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
    
    const isCorrect = word.toLowerCase().replace(/[.,!?]/g, '') === currentItem.errorWord.toLowerCase();
    if (isCorrect) {
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

  const handleRetry = () => {
    setCurrentIdx(0);
    setScore(0);
    setIsComplete(false);
    setSelectedWord(null);
    setShowFeedback(false);
  };

  if (isComplete) {
    return (
      <GameComplete
        score={score}
        totalQuestions={items.length}
        onContinue={() => onComplete(Math.round((score / items.length) * 100))}
        onRetry={handleRetry}
        title="Error Hunter!"
      />
    );
  }

  if (!currentItem) return null;

  const words = currentItem.sentence.split(' ');
  const isCorrectSelection = selectedWord?.word.toLowerCase().replace(/[.,!?]/g, '') === currentItem.errorWord.toLowerCase();

  return (
    <GameWrapper
      title="Error Hunter"
      subtitle="Find the wrong word in the sentence"
      icon={Search}
      iconColor="orange"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-8 text-center">
        <div className="mb-6">
          <Search className="w-12 h-12 mx-auto text-orange-400 mb-2" />
          <p className="text-gray-600">Tap the word with the mistake</p>
        </div>

        {/* Sentence with clickable words */}
        <div className="mb-8 p-6 bg-gray-50 rounded-xl">
          <div className="flex flex-wrap justify-center gap-2">
            {words.map((word, idx) => {
              const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
              const isError = cleanWord === currentItem.errorWord.toLowerCase();
              const isSelected = selectedWord?.index === idx;
              
              let wordClass = 'px-3 py-2 rounded-lg font-medium text-lg transition-all cursor-pointer ';
              
              if (showFeedback) {
                if (isError) {
                  wordClass += 'bg-red-500 text-white line-through';
                } else if (isSelected && !isError) {
                  wordClass += 'bg-orange-200 text-orange-800';
                } else {
                  wordClass += 'bg-white text-gray-700';
                }
              } else {
                wordClass += 'bg-white border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50';
              }
              
              return (
                <button
                  key={idx}
                  onClick={() => handleWordClick(word, idx)}
                  disabled={showFeedback}
                  className={wordClass}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mb-4 p-4 rounded-xl ${isCorrectSelection ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {isCorrectSelection ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-semibold">You found it!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-semibold">Not that one!</span>
                </>
              )}
            </div>
            <p className="text-gray-700">
              <span className="line-through text-red-600">{currentItem.errorWord}</span>
              {' → '}
              <span className="text-green-600 font-bold">{currentItem.correctWord}</span>
            </p>
          </div>
        )}

        {/* Next Button */}
        {showFeedback && (
          <Button onClick={handleNext}>
            {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
          </Button>
        )}
      </Card>
    </GameWrapper>
  );
};

export default ErrorHunter;
