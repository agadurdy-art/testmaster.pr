/**
 * Listen & Choose Word Game
 * Player hears a word and selects the correct text option
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Headphones } from 'lucide-react';
import { 
  GameWrapper, 
  AudioButton, 
  OptionButton, 
  GameComplete,
  speak,
  shuffleArray 
} from '../shared';

const ListenChooseWord = ({ 
  items, // Array of { word, distractors: [...] }
  onComplete,
  onSkip
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = items[currentIdx];

  // Generate options for current word
  useEffect(() => {
    if (currentItem) {
      const allOptions = [currentItem.word, ...(currentItem.distractors || [])];
      setOptions(shuffleArray(allOptions).slice(0, 4));
      // Auto-play audio
      setTimeout(() => speak(currentItem.word), 500);
    }
  }, [currentIdx, currentItem]);

  const handleSelect = (option) => {
    if (showFeedback) return;
    
    setSelectedAnswer(option);
    setShowFeedback(true);
    
    const isCorrect = option.toLowerCase() === currentItem.word.toLowerCase();
    if (isCorrect) {
      setScore(s => s + 1);
    }
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

  const handleRetry = () => {
    setCurrentIdx(0);
    setScore(0);
    setIsComplete(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  if (isComplete) {
    return (
      <GameComplete
        score={score}
        totalQuestions={items.length}
        onContinue={() => onComplete(Math.round((score / items.length) * 100))}
        onRetry={handleRetry}
        title="Listening Complete!"
      />
    );
  }

  if (!currentItem) return null;

  return (
    <GameWrapper
      title="Listen & Choose"
      subtitle="Listen to the word and choose the correct spelling"
      icon={Headphones}
      iconColor="cyan"
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

        {/* Options */}
        <div className="space-y-3 max-w-sm mx-auto">
          {options.map((option) => (
            <OptionButton
              key={option}
              onClick={() => handleSelect(option)}
              isSelected={selectedAnswer === option}
              isCorrect={option.toLowerCase() === currentItem.word.toLowerCase()}
              showFeedback={showFeedback}
            >
              {option}
            </OptionButton>
          ))}
        </div>

        {/* Next Button */}
        {showFeedback && (
          <div className="mt-6">
            <Button onClick={handleNext} data-testid="next-button">
              {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
            </Button>
          </div>
        )}
      </Card>
    </GameWrapper>
  );
};

export default ListenChooseWord;
