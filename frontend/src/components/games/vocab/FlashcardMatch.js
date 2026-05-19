/**
 * Flashcard Match Game
 * Match pairs: audio-picture, text-picture, or picture-picture
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Layers, Volume2, RotateCcw } from 'lucide-react';
import { 
  GameWrapper, 
  GameComplete,
  shuffleArray,
  speak 
} from '../shared';

const FlashcardMatch = ({ 
  items, // Array of { word, emoji }
  matchType = 'text-picture', // 'audio-picture', 'text-picture', 'picture-picture'
  onComplete,
  onSkip
}) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize cards
  useEffect(() => {
    if (items && items.length > 0) {
      let cardPairs = [];
      
      items.forEach((item, idx) => {
        if (matchType === 'text-picture') {
          cardPairs.push(
            { id: `text-${idx}`, type: 'text', content: item.word, pairId: idx },
            { id: `picture-${idx}`, type: 'picture', content: item.emoji, imageUrl: item.image_url, pairId: idx }
          );
        } else if (matchType === 'audio-picture') {
          cardPairs.push(
            { id: `audio-${idx}`, type: 'audio', content: item.word, pairId: idx },
            { id: `picture-${idx}`, type: 'picture', content: item.emoji, imageUrl: item.image_url, pairId: idx }
          );
        } else { // picture-picture (same picture pairs)
          cardPairs.push(
            { id: `pic1-${idx}`, type: 'picture', content: item.emoji, imageUrl: item.image_url, pairId: idx },
            { id: `pic2-${idx}`, type: 'picture', content: item.emoji, imageUrl: item.image_url, pairId: idx }
          );
        }
      });
      
      setCards(shuffleArray(cardPairs));
      setFlipped([]);
      setMatched([]);
      setMoves(0);
    }
  }, [items, matchType]);

  // Check for match when two cards are flipped
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      const card1 = cards.find(c => c.id === first);
      const card2 = cards.find(c => c.id === second);
      
      setMoves(m => m + 1);
      
      if (card1.pairId === card2.pairId) {
        // Match found!
        setMatched(prev => [...prev, card1.pairId]);
        setFlipped([]);
      } else {
        // No match, flip back after delay
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  }, [flipped, cards]);

  // Check completion
  useEffect(() => {
    if (matched.length > 0 && matched.length === items.length) {
      setTimeout(() => setIsComplete(true), 500);
    }
  }, [matched, items]);

  const handleCardClick = useCallback((card) => {
    // Don't flip if already matched, already flipped, or 2 cards showing
    if (matched.includes(card.pairId)) return;
    if (flipped.includes(card.id)) return;
    if (flipped.length >= 2) return;
    
    // Play audio for audio cards
    if (card.type === 'audio') {
      speak(card.content);
    }
    
    setFlipped(prev => [...prev, card.id]);
  }, [flipped, matched]);

  const handleRestart = () => {
    setCards(shuffleArray([...cards]));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsComplete(false);
  };

  const calculateScore = () => {
    // Perfect score = number of items (minimum moves)
    // Score decreases with extra moves
    const minMoves = items.length;
    const efficiency = Math.max(0, 100 - ((moves - minMoves) * 10));
    return Math.max(50, Math.min(100, efficiency));
  };

  if (isComplete) {
    return (
      <GameComplete
        score={calculateScore()}
        totalQuestions={100}
        onContinue={() => onComplete(calculateScore())}
        onRetry={handleRestart}
        title="Perfect Match!"
      />
    );
  }

  const getMatchTypeLabel = () => {
    switch (matchType) {
      case 'audio-picture': return 'Match sounds to pictures';
      case 'text-picture': return 'Match words to pictures';
      case 'picture-picture': return 'Find matching pairs';
      default: return 'Match the pairs';
    }
  };

  return (
    <GameWrapper
      title="Flashcard Match"
      subtitle={getMatchTypeLabel()}
      icon={Layers}
      iconColor="pink"
      currentQuestion={matched.length}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-6">
        {/* Stats */}
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <span>Pairs: {matched.length}/{items.length}</span>
          <span>Moves: {moves}</span>
          <Button variant="ghost" size="sm" onClick={handleRestart}>
            <RotateCcw className="w-4 h-4 mr-1" /> Restart
          </Button>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id);
            const isMatched = matched.includes(card.pairId);
            
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                disabled={isMatched}
                className={`aspect-square rounded-xl transition-all duration-300 transform ${
                  isFlipped || isMatched
                    ? 'bg-white border-2 scale-100'
                    : 'bg-gradient-to-br from-blue-400 to-purple-500 hover:scale-105 cursor-pointer'
                } ${
                  isMatched 
                    ? 'border-green-400 bg-green-50 opacity-70' 
                    : isFlipped 
                      ? 'border-blue-400' 
                      : 'border-transparent'
                }`}
                data-testid={`match-card-${card.id}`}
              >
                {(isFlipped || isMatched) ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {card.type === 'picture' && (
                      card.imageUrl ? (
                        <>
                          <img
                            src={card.imageUrl.startsWith('http') ? card.imageUrl : `${process.env.REACT_APP_BACKEND_URL}/api${card.imageUrl}`}
                            alt=""
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const sib = e.currentTarget.nextElementSibling;
                              if (sib) sib.style.display = 'inline';
                            }}
                          />
                          <span className="text-3xl" style={{ display: 'none' }}>{card.content}</span>
                        </>
                      ) : (
                        <span className="text-3xl">{card.content}</span>
                      )
                    )}
                    {card.type === 'text' && (
                      <span className="text-sm font-bold text-gray-700 px-1">
                        {card.content}
                      </span>
                    )}
                    {card.type === 'audio' && (
                      <Volume2 className="w-8 h-8 text-blue-500" />
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    ?
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

export default FlashcardMatch;
