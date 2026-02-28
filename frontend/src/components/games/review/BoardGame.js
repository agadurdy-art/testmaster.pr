/**
 * Board Game (Lesson 4 Review)
 * Roll dice, answer questions, move along the board to reach the finish
 */

import React, { useState, useCallback } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Trophy, Star, ChevronRight } from 'lucide-react';
import { GameWrapper, GameComplete, shuffleArray } from '../shared';

const DiceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const BOARD_COLORS = [
  'bg-blue-100 border-blue-300',
  'bg-green-100 border-green-300',
  'bg-yellow-100 border-yellow-300',
  'bg-purple-100 border-purple-300',
  'bg-pink-100 border-pink-300',
  'bg-cyan-100 border-cyan-300',
  'bg-orange-100 border-orange-300',
  'bg-indigo-100 border-indigo-300',
];

const BoardGame = ({ items, onComplete, onSkip }) => {
  const questions = items || [];
  const boardSize = Math.min(questions.length + 2, 12);
  const [position, setPosition] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [shuffledOpts, setShuffledOpts] = useState([]);

  const rollDice = useCallback(() => {
    if (rolling || currentQuestion) return;
    setRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 8) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * 3) + 1; // 1-3 only
        setDiceValue(final);
        setRolling(false);

        const newPos = Math.min(position + final, boardSize - 1);
        setPosition(newPos);

        if (newPos >= boardSize - 1) {
          setTimeout(() => setIsComplete(true), 500);
          return;
        }

        // Pick a question
        const qIdx = (position + final) % questions.length;
        const q = questions[qIdx];
        setCurrentQuestion(q);
        if (q.options) setShuffledOpts(shuffleArray([...q.options]));
      }
    }, 100);
  }, [rolling, currentQuestion, position, boardSize, questions]);

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    setAnsweredCount(c => c + 1);
    const correct = answer.toLowerCase() === (currentQuestion.answer || currentQuestion.correct_answer || '').toLowerCase();
    if (correct) setScore(s => s + 1);
  };

  const handleNextTurn = () => {
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setDiceValue(null);
  };

  if (isComplete) {
    return (
      <GameComplete
        score={score}
        totalQuestions={answeredCount || 1}
        onContinue={() => onComplete(Math.round((score / Math.max(answeredCount, 1)) * 100))}
        onRetry={() => { setPosition(0); setScore(0); setAnsweredCount(0); setIsComplete(false); setCurrentQuestion(null); setSelectedAnswer(null); setShowFeedback(false); setDiceValue(null); }}
        title="Board Game Champion!"
      />
    );
  }

  const DiceIcon = diceValue ? DiceIcons[diceValue - 1] : Dice1;

  return (
    <GameWrapper title="Board Game" subtitle="Roll, answer, and reach the finish!" icon={Trophy} iconColor="amber" currentQuestion={answeredCount + 1} totalQuestions={questions.length} onSkip={onSkip}>
      <Card className="p-6">
        {/* Board */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {Array.from({ length: boardSize }, (_, i) => (
            <div
              key={i}
              data-testid={`board-cell-${i}`}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all ${
                i === 0 ? 'bg-green-200 border-green-500' :
                i === boardSize - 1 ? 'bg-yellow-200 border-yellow-500' :
                BOARD_COLORS[i % BOARD_COLORS.length]
              } ${position === i ? 'ring-4 ring-blue-500 ring-offset-2 scale-110' : ''}`}
            >
              {i === 0 ? 'GO' : i === boardSize - 1 ? <Star className="w-6 h-6 text-yellow-600" /> :
                position === i ? '🧑' : i}
            </div>
          ))}
        </div>

        {/* Dice area */}
        {!currentQuestion && (
          <div className="text-center">
            <button
              onClick={rollDice}
              disabled={rolling}
              data-testid="roll-dice-btn"
              className={`p-6 rounded-2xl transition-all ${rolling ? 'animate-bounce bg-blue-100' : 'bg-blue-50 hover:bg-blue-100 cursor-pointer border-2 border-blue-200'}`}
            >
              <DiceIcon className={`w-16 h-16 text-blue-600 ${rolling ? 'animate-spin' : ''}`} />
            </button>
            <p className="mt-3 text-lg text-gray-600 font-medium">
              {rolling ? 'Rolling...' : 'Tap the dice to roll!'}
            </p>
          </div>
        )}

        {/* Question */}
        {currentQuestion && (
          <div className="mt-4 space-y-4">
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <p className="text-xl font-bold text-gray-800 text-center">
                {currentQuestion.question || currentQuestion.sentence || currentQuestion.question_text}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {shuffledOpts.map(opt => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt.toLowerCase() === (currentQuestion.answer || currentQuestion.correct_answer || '').toLowerCase();
                let cls = 'bg-white border-2 border-gray-200 hover:border-blue-400 cursor-pointer';
                if (showFeedback) {
                  if (isCorrect) cls = 'bg-green-100 border-2 border-green-500 font-bold';
                  else if (isSelected) cls = 'bg-red-100 border-2 border-red-500';
                  else cls = 'bg-gray-50 border-2 border-gray-200 opacity-50';
                }
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={showFeedback}
                    data-testid={`board-option-${opt}`}
                    className={`p-4 rounded-xl text-lg font-medium transition-all ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="text-center mt-4">
                <Button onClick={handleNextTurn} data-testid="board-next-btn">
                  Next Turn <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </GameWrapper>
  );
};

export default BoardGame;
