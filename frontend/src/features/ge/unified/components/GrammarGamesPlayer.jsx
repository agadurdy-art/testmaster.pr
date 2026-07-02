import React, { useState } from 'react';
import { Edit3, Trophy } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import {
  WordOrder,
  FillTheBlank,
  ErrorHunter,
  TrueFalseGrammar,
  MultipleChoiceGrammar,
  TransformSentence,
  AudioMatch,
  SentenceBuilderTimed
} from '../../../../components/games/grammar';
import { normalizeItemsForGame, MAX_GAMES_PER_STEP } from '../lib/normalize';
import { GameSlotBoundary } from './ErrorBoundaries';
import GrammarGame from './GrammarGame';

// ═══════ GRAMMAR GAMES PLAYER ═══════
function GrammarGamesPlayer({ activity, onComplete, onSkip }) {
  // Same per-step cap as vocab pack — pedagogy call 2026-05-19.
  const games = (activity?.games || []).slice(0, MAX_GAMES_PER_STEP);
  const [currentGameIdx, setCurrentGameIdx] = useState(0);
  const [gameScores, setGameScores] = useState([]);
  const [isAllComplete, setIsAllComplete] = useState(false);

  // Fallback to old format
  if (!games.length) {
    return <GrammarGame activity={activity} onComplete={onComplete} onSkip={onSkip} />;
  }

  const currentGame = games[currentGameIdx];

  const handleGameComplete = (score) => {
    const newScores = [...gameScores, score];
    setGameScores(newScores);
    
    if (currentGameIdx < games.length - 1) {
      setCurrentGameIdx(i => i + 1);
    } else {
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
        <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Grammar Games Complete!</h2>
        <p className="text-gray-600">Average Score: {avgScore}%</p>
      </Card>
    );
  }

  const renderGame = () => {
    const gameType = currentGame?.game_type;
    const rawItems = currentGame?.items || [];
    const items = normalizeItemsForGame(rawItems, gameType);

    if (!items.length) {
      return (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">This game has no items available.</p>
          <Button onClick={handleSkip}>Skip to Next</Button>
        </Card>
      );
    }

    switch (gameType) {
      case 'word_order':
        return <WordOrder items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'fill_blank':
        return <FillTheBlank items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'error_hunter':
        return <ErrorHunter items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'true_false':
        return <TrueFalseGrammar items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'multiple_choice_grammar':
        return <MultipleChoiceGrammar items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'transform_sentence':
        return <TransformSentence items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'audio_match':
        return <AudioMatch items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'sentence_builder_timed':
        return <SentenceBuilderTimed items={items} onComplete={handleGameComplete} onSkip={handleSkip} timeLimit={currentGame?.time_limit_seconds} />;
      default:
        return <FillTheBlank items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
    }
  };

  return (
    <div data-testid="grammar-games-player">
      <div className="mb-4 text-center">
        <Badge className="bg-orange-100 text-orange-700 border-0">
          <Edit3 className="w-3 h-3 mr-1" /> Grammar Game {currentGameIdx + 1} of {games.length}
        </Badge>
      </div>
      <GameSlotBoundary resetKey={currentGameIdx} onSkip={handleSkip}>
        {renderGame()}
      </GameSlotBoundary>
    </div>
  );
}

export default GrammarGamesPlayer;
