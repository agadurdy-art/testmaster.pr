/**
 * Crossword Game (Lesson 4 Review)
 * Students fill in a crossword puzzle using vocabulary clues
 */

import React, { useState, useCallback } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Grid3X3, ChevronRight } from 'lucide-react';
import { GameWrapper, GameComplete } from '../shared';

const GRID_SIZE = 10;

const buildGrid = (words) => {
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  const placements = [];
  const sorted = [...words].sort((a, b) => b.word.length - a.word.length);

  for (let i = 0; i < sorted.length && placements.length < 8; i++) {
    const w = sorted[i].word.toUpperCase();
    if (w.length > GRID_SIZE) continue;

    if (placements.length === 0) {
      const row = Math.floor(GRID_SIZE / 2);
      const col = Math.floor((GRID_SIZE - w.length) / 2);
      for (let c = 0; c < w.length; c++) grid[row][col + c] = { letter: w[c], wordIdx: [0] };
      placements.push({ ...sorted[i], word: w, row, col, direction: 'across', number: 1 });
      continue;
    }

    let placed = false;
    for (const p of placements) {
      if (placed) break;
      for (let pi = 0; pi < p.word.length && !placed; pi++) {
        for (let wi = 0; wi < w.length && !placed; wi++) {
          if (p.word[pi] !== w[wi]) continue;
          const dir = p.direction === 'across' ? 'down' : 'across';
          let startRow, startCol;
          if (dir === 'down') {
            startRow = p.row - wi;
            startCol = p.col + pi;
          } else {
            startRow = p.row + pi;
            startCol = p.col - wi;
          }
          if (startRow < 0 || startCol < 0) continue;
          if (dir === 'down' && startRow + w.length > GRID_SIZE) continue;
          if (dir === 'across' && startCol + w.length > GRID_SIZE) continue;

          let canPlace = true;
          for (let k = 0; k < w.length; k++) {
            const r = dir === 'down' ? startRow + k : startRow;
            const c = dir === 'across' ? startCol + k : startCol;
            const cell = grid[r][c];
            if (cell && cell.letter !== w[k]) { canPlace = false; break; }
          }
          if (!canPlace) continue;

          const num = placements.length + 1;
          for (let k = 0; k < w.length; k++) {
            const r = dir === 'down' ? startRow + k : startRow;
            const c = dir === 'across' ? startCol + k : startCol;
            if (grid[r][c]) grid[r][c].wordIdx.push(placements.length);
            else grid[r][c] = { letter: w[k], wordIdx: [placements.length] };
          }
          placements.push({ ...sorted[i], word: w, row: startRow, col: startCol, direction: dir, number: num });
          placed = true;
        }
      }
    }
  }
  return { grid, placements };
};

const Crossword = ({ items, onComplete, onSkip }) => {
  const [{ grid, placements }] = useState(() => buildGrid(items));
  const [userInputs, setUserInputs] = useState(() => {
    const g = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    return g;
  });
  const [checked, setChecked] = useState(false);
  const [selectedClue, setSelectedClue] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  const handleInput = useCallback((row, col, value) => {
    const v = value.toUpperCase().slice(-1);
    setUserInputs(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = v;
      return next;
    });
  }, []);

  const handleCheck = () => {
    let correct = 0;
    let total = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c]) {
          total++;
          if (userInputs[r][c] === grid[r][c].letter) correct++;
        }
      }
    }
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    setScore(pct);
    setChecked(true);
  };

  const handleReveal = () => {
    setUserInputs(prev => {
      const next = prev.map(r => [...r]);
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (grid[r][c]) next[r][c] = grid[r][c].letter;
        }
      }
      return next;
    });
    setChecked(true);
    setScore(100);
  };

  if (isComplete) {
    return (
      <GameComplete
        score={Math.round(score / 100 * placements.length)}
        totalQuestions={placements.length}
        onContinue={() => onComplete(score)}
        onRetry={() => { setUserInputs(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''))); setChecked(false); setIsComplete(false); }}
        title="Crossword Master!"
      />
    );
  }

  const acrossClues = placements.filter(p => p.direction === 'across');
  const downClues = placements.filter(p => p.direction === 'down');

  return (
    <GameWrapper title="Crossword" subtitle="Fill in the puzzle" icon={Grid3X3} iconColor="purple" currentQuestion={1} totalQuestions={1} onSkip={onSkip}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 overflow-auto">
          <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 36px)` }}>
            {grid.map((row, ri) => row.map((cell, ci) => {
              if (!cell) return <div key={`${ri}-${ci}`} className="w-9 h-9" />;
              const num = placements.find(p => p.row === ri && p.col === ci)?.number;
              const isCorrect = checked && userInputs[ri][ci] === cell.letter;
              const isWrong = checked && userInputs[ri][ci] && userInputs[ri][ci] !== cell.letter;
              return (
                <div key={`${ri}-${ci}`} className={`relative w-9 h-9 border ${isCorrect ? 'border-green-500 bg-green-50' : isWrong ? 'border-red-500 bg-red-50' : 'border-gray-400 bg-white'}`}>
                  {num && <span className="absolute top-0 left-0.5 text-[8px] text-gray-500 font-bold">{num}</span>}
                  <input
                    className="w-full h-full text-center font-bold text-lg uppercase bg-transparent outline-none"
                    maxLength={1}
                    value={userInputs[ri][ci]}
                    onChange={(e) => handleInput(ri, ci, e.target.value)}
                    disabled={checked}
                    data-testid={`crossword-cell-${ri}-${ci}`}
                  />
                </div>
              );
            }))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="space-y-4">
            {acrossClues.length > 0 && (
              <div>
                <h4 className="font-bold text-lg text-gray-800 mb-2">Across</h4>
                {acrossClues.map(c => (
                  <p key={c.number} className={`text-base cursor-pointer p-2 rounded-lg hover:bg-blue-50 ${selectedClue === c.number ? 'bg-blue-100 font-semibold' : ''}`}
                    onClick={() => setSelectedClue(c.number)} data-testid={`clue-across-${c.number}`}>
                    <strong>{c.number}.</strong> {c.definition || c.clue || `Means: ${c.word.toLowerCase()}`}
                  </p>
                ))}
              </div>
            )}
            {downClues.length > 0 && (
              <div>
                <h4 className="font-bold text-lg text-gray-800 mb-2">Down</h4>
                {downClues.map(c => (
                  <p key={c.number} className={`text-base cursor-pointer p-2 rounded-lg hover:bg-blue-50 ${selectedClue === c.number ? 'bg-blue-100 font-semibold' : ''}`}
                    onClick={() => setSelectedClue(c.number)} data-testid={`clue-down-${c.number}`}>
                    <strong>{c.number}.</strong> {c.definition || c.clue || `Means: ${c.word.toLowerCase()}`}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            {!checked ? (
              <>
                <Button onClick={handleCheck} data-testid="crossword-check-btn">Check Answers</Button>
                <Button variant="outline" onClick={handleReveal} data-testid="crossword-reveal-btn">Reveal All</Button>
              </>
            ) : (
              <Button onClick={() => setIsComplete(true)} data-testid="crossword-continue-btn">
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </GameWrapper>
  );
};

export default Crossword;
