/**
 * Memory Game
 * Classic memory card matching game with word-picture pairs
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Brain, RotateCcw } from 'lucide-react';
import { 
  GameWrapper, 
  GameComplete,
  shuffleArray 
} from '../shared';

const MemoryGame = ({ 
  items, // Array of { word, emoji }
  onComplete,
  onSkip
}) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [canFlip, setCanFlip] = useState(true);

  // Initialize cards (use only first 6 items to keep grid manageable)
  useEffect(() => {
    const gameItems = items.slice(0, 6);
    let cardPairs = [];
    
    gameItems.forEach((item, idx) => {
      cardPairs.push(
        { id: `word-${idx}`, type: 'word', content: item.word, pairId: idx },
        { id: `emoji-${idx}`, type: 'emoji', content: item.emoji, pairId: idx }
      );
    });
    
    setCards(shuffleArray(cardPairs));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }, [items]);

  // Check for match when two cards are flipped
  useEffect(() => {
    if (flipped.length === 2) {
      setCanFlip(false);
      const [first, second] = flipped;
      const card1 = cards.find(c => c.id === first);
      const card2 = cards.find(c => c.id === second);
      
      setMoves(m => m + 1);
      
      if (card1.pairId === card2.pairId) {
        // Match found!
        setTimeout(() => {
          setMatched(prev => [...prev, card1.pairId]);
          setFlipped([]);
          setCanFlip(true);
        }, 500);
      } else {
        // No match, flip back
        setTimeout(() => {
          setFlipped([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  }, [flipped, cards]);

  // Check completion
  useEffect(() => {
    const gameItems = items.slice(0, 6);
    if (matched.length > 0 && matched.length === gameItems.length) {
      setTimeout(() => setIsComplete(true), 500);
    }
  }, [matched, items]);

  const handleCardClick = useCallback((card) => {
    if (!canFlip) return;
    if (matched.includes(card.pairId)) return;
    if (flipped.includes(card.id)) return;
    if (flipped.length >= 2) return;
    
    setFlipped(prev => [...prev, card.id]);
  }, [flipped, matched, canFlip]);

  const handleRestart = () => {
    setCards(shuffleArray([...cards]));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsComplete(false);
    setCanFlip(true);
  };

  const calculateScore = () => {
    const gameItems = items.slice(0, 6);
    const minMoves = gameItems.length;
    const efficiency = Math.max(0, 100 - ((moves - minMoves) * 8));
    return Math.max(50, Math.min(100, efficiency));
  };

  if (isComplete) {
    return (
      <GameComplete
        score={calculateScore()}
        totalQuestions={100}
        onContinue={() => onComplete(calculateScore())}
        onRetry={handleRestart}
        title="Memory Champion!"
      />
    );
  }

  const gameItems = items.slice(0, 6);

  return (
    <GameWrapper
      title="Memory Game"
      subtitle="Find the matching pairs"
      icon={Brain}
      iconColor="purple"
      currentQuestion={matched.length}
      totalQuestions={gameItems.length}
      onSkip={onSkip}
    >
      <Card className="p-6">
        {/* Stats */}
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <span>Pairs: {matched.length}/{gameItems.length}</span>
          <span>Moves: {moves}</span>
          <Button variant="ghost" size="sm" onClick={handleRestart}>
            <RotateCcw className="w-4 h-4 mr-1" /> Restart
          </Button>
        </div>

        {/* Card Grid - 3x4 for 6 pairs */}
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id);
            const isMatched = matched.includes(card.pairId);
            
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                disabled={isMatched || !canFlip}
                className={`aspect-square rounded-xl transition-all duration-300 transform ${
                  isFlipped || isMatched
                    ? 'bg-white border-2'
                    : 'bg-gradient-to-br from-purple-400 to-pink-500 hover:scale-105'
                } ${
                  isMatched 
                    ? 'border-green-400 bg-green-50 scale-95' 
                    : isFlipped 
                      ? 'border-purple-400 scale-105' 
                      : 'border-transparent cursor-pointer'
                }`}
                data-testid={`memory-card-${card.id}`}
              >
                {(isFlipped || isMatched) ? (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    {card.type === 'emoji' ? (
                      <span className="text-4xl">{card.content}</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-700 text-center break-words">
                        {card.content}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white/70" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </GameWrapper>
  );
};

export default MemoryGame;
