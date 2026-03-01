/**
 * Word Search Game (Lesson 4 Review)
 * Students find hidden vocabulary words in a letter grid
 */

import React, { useState, useMemo } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Search, ChevronRight } from 'lucide-react';
import { GameWrapper, GameComplete } from '../shared';

const GRID_SIZE = 10;
const DIRECTIONS = [
  [0, 1],   // right
  [1, 0],   // down
  [1, 1],   // diagonal down-right
  [0, -1],  // left
  [-1, 0],  // up
];

const buildWordSearch = (words) => {
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  const placed = [];
  const sorted = [...words].sort((a, b) => b.word.length - a.word.length);

  for (const item of sorted) {
    const w = item.word.toUpperCase();
    if (w.length > GRID_SIZE || placed.length >= 8) continue;
    let didPlace = false;

    for (let attempt = 0; attempt < 100 && !didPlace; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const maxR = dir[0] > 0 ? GRID_SIZE - w.length : dir[0] < 0 ? w.length - 1 : 0;
      const maxC = dir[1] > 0 ? GRID_SIZE - w.length : dir[1] < 0 ? w.length - 1 : 0;
      const r = Math.floor(Math.random() * (GRID_SIZE - Math.abs(maxR))) + (dir[0] < 0 ? w.length - 1 : 0);
      const c = Math.floor(Math.random() * (GRID_SIZE - Math.abs(maxC))) + (dir[1] < 0 ? w.length - 1 : 0);

      let canPlace = true;
      for (let i = 0; i < w.length; i++) {
        const nr = r + dir[0] * i;
        const nc = c + dir[1] * i;
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) { canPlace = false; break; }
        if (grid[nr][nc] !== '' && grid[nr][nc] !== w[i]) { canPlace = false; break; }
      }

      if (canPlace) {
        const cells = [];
        for (let i = 0; i < w.length; i++) {
          const nr = r + dir[0] * i;
          const nc = c + dir[1] * i;
          grid[nr][nc] = w[i];
          cells.push(`${nr}-${nc}`);
        }
        placed.push({ ...item, word: w, cells });
        didPlace = true;
      }
    }
  }

  // Fill empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * 26)];
    }
  }
  return { grid, placed };
};

const WordSearch = ({ items, onComplete, onSkip }) => {
  const { grid, placed } = useMemo(() => buildWordSearch(items), [items]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleCellClick = (r, c) => {
    const key = `${r}-${c}`;
    const newSelected = new Set(selectedCells);
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    setSelectedCells(newSelected);

    // Check if any word is fully selected
    for (const w of placed) {
      if (foundWords.has(w.word)) continue;
      const allSelected = w.cells.every(cell => newSelected.has(cell));
      if (allSelected) {
        setFoundWords(prev => new Set([...prev, w.word]));
        setSelectedCells(new Set());
        if (foundWords.size + 1 >= placed.length) {
          setTimeout(() => setIsComplete(true), 500);
        }
        break;
      }
    }
  };

  const isCellFound = (r, c) => {
    const key = `${r}-${c}`;
    return placed.some(w => foundWords.has(w.word) && w.cells.includes(key));
  };

  if (isComplete) {
    return (
      <GameComplete
        score={foundWords.size}
        totalQuestions={placed.length}
        onContinue={() => onComplete(Math.round((foundWords.size / placed.length) * 100))}
        onRetry={() => { setFoundWords(new Set()); setSelectedCells(new Set()); setIsComplete(false); }}
        title="Word Hunter!"
      />
    );
  }

  return (
    <GameWrapper title="Word Search" subtitle={`Find ${placed.length} hidden words`} icon={Search} iconColor="emerald" currentQuestion={foundWords.size + 1} totalQuestions={placed.length} onSkip={onSkip}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-2">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 40px)` }}>
            {grid.map((row, ri) => row.map((letter, ci) => {
              const key = `${ri}-${ci}`;
              const found = isCellFound(ri, ci);
              const selected = selectedCells.has(key);
              return (
                <button
                  key={key}
                  onClick={() => handleCellClick(ri, ci)}
                  data-testid={`ws-cell-${ri}-${ci}`}
                  className={`w-10 h-10 flex items-center justify-center font-bold text-lg rounded-lg transition-all ${
                    found ? 'bg-green-200 text-green-800 border-2 border-green-400' :
                    selected ? 'bg-blue-200 text-blue-800 border-2 border-blue-400' :
                    'bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                  }`}
                >
                  {letter}
                </button>
              );
            }))}
          </div>
        </Card>

        <Card className="p-5">
          <h4 className="font-bold text-lg mb-3">Words to Find:</h4>
          <div className="grid grid-cols-2 gap-2">
            {placed.map(w => (
              <div key={w.word} className={`flex items-center gap-2 p-2.5 rounded-lg transition-all ${
                foundWords.has(w.word) ? 'bg-green-50 line-through text-green-600' : 'bg-gray-50'
              }`}>
                <span className="text-xl">{w.image_emoji || w.emoji || '?'}</span>
                <div className="min-w-0">
                  <p className={`font-medium text-sm truncate ${foundWords.has(w.word) ? 'text-green-600' : 'text-gray-800'}`}>{w.word.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>

          {foundWords.size >= placed.length && (
            <Button onClick={() => setIsComplete(true)} className="w-full mt-4" data-testid="ws-continue-btn">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </Card>
      </div>
    </GameWrapper>
  );
};

export default WordSearch;
