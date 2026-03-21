/**
 * Listen & Choose Picture Game
 * Player hears a word and selects the correct emoji/picture
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Headphones } from 'lucide-react';
import { 
  GameWrapper, 
  AudioButton, 
  EmojiCard, 
  GameComplete,
  speak,
  shuffleArray 
} from '../shared';

const ListenChoosePicture = ({ 
  items, // Array of { word, emoji, distractors: [{ word, emoji }] }
  onComplete,
  onSkip
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  if (!items?.length) return null;
  const currentItem = items[currentIdx];

  // Generate options for current word
  useEffect(() => {
    if (currentItem) {
      const correctOption = { word: currentItem.word, emoji: currentItem.emoji, image_url: currentItem.image_url };
      const distractorOptions = (currentItem.distractors || []).map(d => ({
        word: d.word || d,
        emoji: d.emoji || '❓',
        image_url: d.image_url || null
      }));
      const sliced = shuffleArray([correctOption, ...distractorOptions]).slice(0, 4);
      // Only use images if ALL options have image_url
      const allHaveImages = sliced.every(o => o.image_url);
      if (!allHaveImages) {
        sliced.forEach(o => { o.image_url = null; });
      }
      setOptions(sliced);
      // Auto-play audio
      const timer = setTimeout(() => speak(currentItem.word), 500);
      return () => { clearTimeout(timer); window.speechSynthesis.cancel(); };
    }
  }, [currentIdx]);

  const handleSelect = (option) => {
    if (showFeedback) return;
    
    setSelectedAnswer(option.word);
    setShowFeedback(true);
    
    const isCorrect = option.word.toLowerCase() === currentItem.word.toLowerCase();
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
        title="Great Listening!"
      />
    );
  }

  if (!currentItem) return null;

  return (
    <GameWrapper
      title="Listen & Choose Picture"
      subtitle="Listen and tap the correct picture"
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

        {/* Picture Options Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {options.map((option) => (
            <EmojiCard
              key={option.word}
              emoji={option.emoji}
              imageUrl={option.image_url}
              onClick={() => handleSelect(option)}
              isSelected={selectedAnswer === option.word}
              isCorrect={option.word.toLowerCase() === currentItem.word.toLowerCase()}
              showFeedback={showFeedback}
              size="lg"
            />
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

export default ListenChoosePicture;
