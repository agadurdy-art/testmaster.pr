import React, { useState } from 'react';
import { Gamepad2, Sparkles, Star } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import {
  ListenChooseWord,
  ListenChoosePicture,
  ReadChoosePicture,
  LookWrite,
  ListenWrite,
  UnscrambleLetters,
  FlashcardMatch,
  MemoryGame,
  FillTheGap,
  AnimalSounds,
  WordRace,
  WordLadder,
  CumulativeRace,
  ImageWordMatch
} from '../../../../components/games/vocab';
import {
  Crossword,
  WordSearch,
  BoardGame
} from '../../../../components/games/review';
import { normalizeItemsForGame, MAX_GAMES_PER_STEP } from '../lib/normalize';
import { GameSlotBoundary } from './ErrorBoundaries';
import MatchingGame from './MatchingGame';

// ═══════ VOCAB GAMES PLAYER (Multiple Games in Sequence) ═══════
function VocabGamesPlayer({ activity, onComplete, onSkip }) {
  // Cap pack length per pedagogy call — max 3-4 mini-games per step keeps
  // 8-12yo learners engaged without burnout. See MAX_GAMES_PER_STEP above.
  const games = (activity?.games || []).slice(0, MAX_GAMES_PER_STEP);
  const [currentGameIdx, setCurrentGameIdx] = useState(0);
  const [gameScores, setGameScores] = useState([]);
  const [isAllComplete, setIsAllComplete] = useState(false);

  // Fallback to old format if no games array
  if (!games.length && activity?.items) {
    return <MatchingGame activity={activity} onComplete={onComplete} onSkip={onSkip} />;
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No games available</p>
        <Button className="mt-4" onClick={() => onComplete(100)}>Continue</Button>
      </div>
    );
  }

  const currentGame = games[currentGameIdx];

  const handleGameComplete = (score) => {
    const newScores = [...gameScores, score];
    setGameScores(newScores);
    
    if (currentGameIdx < games.length - 1) {
      setCurrentGameIdx(i => i + 1);
    } else {
      // All games complete
      const avgScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
      setIsAllComplete(true);
      setTimeout(() => onComplete(avgScore), 1500);
    }
  };

  const handleSkip = () => {
    if (currentGameIdx < games.length - 1) {
      setCurrentGameIdx(i => i + 1);
    } else {
      onSkip();
    }
  };

  if (isAllComplete) {
    const avgScore = Math.round(gameScores.reduce((a, b) => a + b, 0) / gameScores.length);
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <Sparkles className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Games Complete!</h2>
        <p className="text-gray-600">Average Score: {avgScore}%</p>
        <div className="flex justify-center gap-1 mt-4">
          {[1, 2, 3].map(i => (
            <Star key={i} className={`w-8 h-8 ${avgScore >= i * 30 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>
      </Card>
    );
  }

  // Render game based on type
  const renderGame = () => {
    const gameType = currentGame?.game_type;
    const rawItems = currentGame?.items || [];
    const items = normalizeItemsForGame(rawItems, gameType);

    // Guard: skip games with no items
    if (!items.length) {
      return (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">This game has no items available.</p>
          <Button onClick={handleSkip}>Skip to Next</Button>
        </Card>
      );
    }

    switch (gameType) {
      case 'listen_choose_word':
        return <ListenChooseWord items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'listen_choose_picture':
        return <ListenChoosePicture items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'read_choose_picture':
        return <ReadChoosePicture items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'look_write':
        return <LookWrite items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'listen_write':
        return <ListenWrite items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'unscramble':
        return <UnscrambleLetters items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'flashcard_match':
        return <FlashcardMatch items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'memory_game':
        return <MemoryGame items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'fill_gap':
        return <FillTheGap items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'animal_sounds':
        return <AnimalSounds items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'crossword':
        return <Crossword items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'word_search':
        return <WordSearch items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'board_game':
        return <BoardGame items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'image_word_match':
        return <ImageWordMatch items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'word_race':
        return <WordRace items={items} onComplete={handleGameComplete} onSkip={handleSkip} timeLimit={currentGame?.time_limit_seconds} />;
      case 'cumulative_race':
        return <CumulativeRace items={items} onComplete={handleGameComplete} onSkip={handleSkip} timeLimit={currentGame?.time_limit_seconds} />;
      case 'word_ladder':
        // word_ladder uses `rungs` or `items`
        return <WordLadder items={currentGame?.rungs || items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      default:
        // Fallback to MCQ game
        return <MatchingGame activity={{ items }} onComplete={handleGameComplete} onSkip={handleSkip} />;
    }
  };

  return (
    <div data-testid="vocab-games-player">
      {/* Game Progress Header */}
      <div className="mb-4 text-center">
        <Badge className="bg-purple-100 text-purple-700 border-0">
          <Gamepad2 className="w-3 h-3 mr-1" /> Game {currentGameIdx + 1} of {games.length}
        </Badge>
      </div>
      <GameSlotBoundary resetKey={currentGameIdx} onSkip={handleSkip}>
        {renderGame()}
      </GameSlotBoundary>
    </div>
  );
}

export default VocabGamesPlayer;
