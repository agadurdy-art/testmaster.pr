/**
 * Look & Write Game
 * Player sees an emoji/picture and types the word
 */

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Eye, CheckCircle, X } from 'lucide-react';
import { 
  GameWrapper, 
  LetterInput,
  GameComplete 
} from '../shared';

const LookWrite = ({ 
  items, // Array of { word, emoji, hint? }
  onComplete,
  onSkip
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = items[currentIdx];

  const handleCheck = () => {
    const correct = input.toLowerCase().trim() === currentItem.word.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);
    setAttempts(a => a + 1);
    
    if (correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setInput('');
    setShowFeedback(false);
    setIsCorrect(false);
    setAttempts(0);
    
    if (currentIdx < items.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      if (showFeedback) {
        handleNext();
      } else {
        handleCheck();
      }
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setScore(0);
    setIsComplete(false);
    setInput('');
    setShowFeedback(false);
    setAttempts(0);
  };

  if (isComplete) {
    return (
      <GameComplete
        score={score}
        totalQuestions={items.length}
        onContinue={() => onComplete(Math.round((score / items.length) * 100))}
        onRetry={handleRetry}
        title="Spelling Star!"
      />
    );
  }

  if (!currentItem) return null;

  // Generate hint (first letter + blanks)
  const getHint = () => {
    if (currentItem.hint) return currentItem.hint;
    const word = currentItem.word;
    return word[0] + ' _ '.repeat(word.length - 1).trim();
  };

  return (
    <GameWrapper
      title="Look & Write"
      subtitle="Look at the picture and type the word"
      icon={Eye}
      iconColor="green"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-8 text-center">
        {/* Picture Display */}
        <div className="mb-6">
          <div className="w-32 h-32 mx-auto bg-yellow-50 rounded-3xl flex items-center justify-center shadow-inner overflow-hidden">
            {currentItem.image_url ? (
              <img src={currentItem.image_url.startsWith('http') ? currentItem.image_url : `${process.env.REACT_APP_BACKEND_URL}/api${currentItem.image_url}`} alt="" className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-7xl">{currentItem.emoji}</span>
            )}
          </div>
        </div>

        {/* Hint */}
        {attempts === 0 && !showFeedback && (
          <p className="text-gray-400 text-sm mb-4">
            Hint: <span className="font-mono tracking-widest">{getHint()}</span>
          </p>
        )}

        {/* Input */}
        <div className="max-w-xs mx-auto mb-4">
          <LetterInput
            value={input}
            onChange={setInput}
            maxLength={currentItem.word.length + 5}
            disabled={showFeedback && isCorrect}
            placeholder="Type the word..."
          />
          <div onKeyDown={handleKeyPress} className="hidden" />
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mb-4 p-3 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="flex items-center justify-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-semibold">Correct!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">
                    The answer is: <strong>{currentItem.word}</strong>
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          {!showFeedback ? (
            <Button 
              onClick={handleCheck} 
              disabled={!input.trim()}
              data-testid="check-button"
            >
              Check
            </Button>
          ) : (
            <Button onClick={handleNext} data-testid="next-button">
              {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
            </Button>
          )}
        </div>
      </Card>
    </GameWrapper>
  );
};

export default LookWrite;
