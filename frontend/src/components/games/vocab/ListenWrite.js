/**
 * Listen & Write Game
 * Player hears a word and types it
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Headphones, CheckCircle, X } from 'lucide-react';
import { 
  GameWrapper, 
  AudioButton,
  LetterInput,
  GameComplete,
  speak 
} from '../shared';

const ListenWrite = ({ 
  items, // Array of { word, hint? }
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

  if (!items?.length) return null;
  const currentItem = items[currentIdx];

  // Auto-play audio on new word (once per word)
  useEffect(() => {
    if (currentItem && !showFeedback) {
      const timer = setTimeout(() => speak(currentItem.word), 500);
      return () => { clearTimeout(timer); window.speechSynthesis.cancel(); };
    }
  }, [currentIdx]); // Only trigger on word change, not on feedback toggle

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
        title="Listening Expert!"
      />
    );
  }

  if (!currentItem) return null;

  // Show hint after first wrong attempt
  const showHint = attempts > 0 && !isCorrect;
  const getHint = () => {
    const word = currentItem.word;
    return word[0] + ' _ '.repeat(word.length - 1).trim();
  };

  return (
    <GameWrapper
      title="Listen & Write"
      subtitle="Listen carefully and type what you hear"
      icon={Headphones}
      iconColor="blue"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-8 text-center">
        {/* Audio Button */}
        <div className="mb-8">
          <AudioButton 
            text={currentItem.word} 
            size="lg" 
            className="mx-auto"
          />
          <p className="text-sm text-gray-500 mt-3">Tap to listen again</p>
        </div>

        {/* Hint after wrong attempt */}
        {showHint && (
          <p className="text-orange-500 text-sm mb-4 animate-pulse">
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
            placeholder="Type what you hear..."
          />
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mb-4 p-3 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="flex items-center justify-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-semibold">Perfect!</span>
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

export default ListenWrite;
