/**
 * Fill the Gap Game
 * Complete sentences with the correct vocabulary word
 */

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Edit3 } from 'lucide-react';
import { 
  GameWrapper, 
  OptionButton,
  GameComplete,
  shuffleArray 
} from '../shared';

const FillTheGap = ({ 
  items, // Array of { word, sentence (with ___ for blank), distractors }
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

  // Generate options when item changes
  React.useEffect(() => {
    if (currentItem) {
      const allOptions = [currentItem.word, ...(currentItem.distractors || [])];
      setOptions(shuffleArray(allOptions).slice(0, 4));
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
        title="Gap Filler Pro!"
      />
    );
  }

  if (!currentItem) return null;

  // Render sentence with blank highlighted
  const renderSentence = () => {
    const sentence = currentItem.sentence || `I see a ___.`;
    const parts = sentence.split('___');
    
    return (
      <p className="text-xl text-gray-800 leading-relaxed">
        {parts[0]}
        <span className={`inline-block min-w-16 mx-1 px-3 py-1 rounded-lg border-2 border-dashed ${
          showFeedback
            ? selectedAnswer?.toLowerCase() === currentItem.word.toLowerCase()
              ? 'bg-green-100 border-green-400 text-green-700'
              : 'bg-red-100 border-red-400 text-red-700'
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          {showFeedback ? currentItem.word : selectedAnswer || '______'}
        </span>
        {parts[1]}
      </p>
    );
  };

  return (
    <GameWrapper
      title="Fill the Gap"
      subtitle="Choose the correct word for the blank"
      icon={Edit3}
      iconColor="green"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-8">
        {/* Emoji hint if available */}
        {currentItem.emoji && (
          <div className="text-center mb-4">
            <span className="text-4xl">{currentItem.emoji}</span>
          </div>
        )}

        {/* Sentence with blank */}
        <div className="text-center mb-8 px-4">
          {renderSentence()}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {options.map((option) => (
            <OptionButton
              key={option}
              onClick={() => handleSelect(option)}
              isSelected={selectedAnswer === option}
              isCorrect={option.toLowerCase() === currentItem.word.toLowerCase()}
              showFeedback={showFeedback}
              size="md"
            >
              {option}
            </OptionButton>
          ))}
        </div>

        {/* Next Button */}
        {showFeedback && (
          <div className="mt-6 text-center">
            <Button onClick={handleNext} data-testid="next-button">
              {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
            </Button>
          </div>
        )}
      </Card>
    </GameWrapper>
  );
};

export default FillTheGap;
