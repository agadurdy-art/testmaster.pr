/**
 * Word Search Game (Lesson 4 Review) - REWRITTEN
 * Drag-select mechanism: press on first cell, drag to last cell, release
 * Only straight lines (horizontal, vertical, diagonal) accepted
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
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
  [-1, -1], // diagonal up-left
  [1, -1],  // diagonal down-left
  [-1, 1],  // diagonal up-right
];

const buildWordSearch = (words) => {
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  const placed = [];
  if (!words?.length) return { grid, placed };
  const sorted = [...words].filter(w => w.word).sort((a, b) => b.word.length - a.word.length);

  for (const item of sorted) {
    const w = item.word.toUpperCase();
    if (w.length > GRID_SIZE || placed.length >= 8) continue;
    let didPlace = false;

    for (let attempt = 0; attempt < 200 && !didPlace; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);

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
        placed.push({ ...item, word: w, cells, dir });
        didPlace = true;
      }
    }
  }

  // Fill empty cells
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * 26)];
    }
  }
  return { grid, placed };
};

// Get all cells in a straight line between two points
const getCellsBetween = (r1, c1, r2, c2) => {
  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);
  const lenR = Math.abs(r2 - r1);
  const lenC = Math.abs(c2 - c1);

  // Must be a straight line: horizontal, vertical, or perfect diagonal
  if (lenR !== 0 && lenC !== 0 && lenR !== lenC) return [];

  const steps = Math.max(lenR, lenC);
  const cells = [];
  for (let i = 0; i <= steps; i++) {
    cells.push(`${r1 + dr * i}-${c1 + dc * i}`);
  }
  return cells;
};

const WordSearch = ({ items, onComplete, onSkip }) => {
  const { grid, placed } = useMemo(() => buildWordSearch(items), [items]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [dragStart, setDragStart] = useState(null); // {r, c}
  const [dragEnd, setDragEnd] = useState(null); // {r, c}
  const [isDragging, setIsDragging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const gridRef = useRef(null);

  // Current drag selection cells
  const dragCells = useMemo(() => {
    if (!dragStart || !dragEnd) return new Set();
    return new Set(getCellsBetween(dragStart.r, dragStart.c, dragEnd.r, dragEnd.c));
  }, [dragStart, dragEnd]);

  const checkWord = useCallback((cells) => {
    const cellSet = new Set(cells);
    for (const w of placed) {
      if (foundWords.has(w.word)) continue;
      // Check forward and reverse match
      const forwardMatch = w.cells.every(cell => cellSet.has(cell)) && w.cells.length === cells.length;
      const reverseMatch = [...w.cells].reverse().every((cell, i) => cell === cells[i]) && w.cells.length === cells.length;
      if (forwardMatch || reverseMatch) {
        return w.word;
      }
    }
    return null;
  }, [placed, foundWords]);

  const handlePointerDown = (r, c) => {
    setIsDragging(true);
    setDragStart({ r, c });
    setDragEnd({ r, c });
  };

  const handlePointerMove = (r, c) => {
    if (!isDragging) return;
    setDragEnd({ r, c });
  };

  const handlePointerUp = () => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    const cells = getCellsBetween(dragStart.r, dragStart.c, dragEnd.r, dragEnd.c);
    const foundWord = checkWord(cells);

    if (foundWord) {
      const newFound = new Set([...foundWords, foundWord]);
      setFoundWords(newFound);
      if (newFound.size >= placed.length) {
        setTimeout(() => setIsComplete(true), 600);
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const isCellFound = (r, c) => {
    const key = `${r}-${c}`;
    return placed.some(w => foundWords.has(w.word) && w.cells.includes(key));
  };

  if (!items?.length) return null;

  if (isComplete) {
    return (
      <GameComplete
        score={foundWords.size}
        totalQuestions={placed.length}
        onContinue={() => onComplete(Math.round((foundWords.size / placed.length) * 100))}
        onRetry={() => { setFoundWords(new Set()); setIsComplete(false); }}
        title="Word Hunter!"
      />
    );
  }

  return (
    <GameWrapper title="Word Search" subtitle={`Find ${placed.length} hidden words — drag to select`} icon={Search} iconColor="emerald" currentQuestion={foundWords.size + 1} totalQuestions={placed.length} onSkip={onSkip}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-2">
          <div
            ref={gridRef}
            className="inline-grid gap-1 select-none"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 40px)`, touchAction: 'none' }}
            onPointerLeave={handlePointerUp}
            data-testid="wordsearch-grid"
          >
            {grid.map((row, ri) => row.map((letter, ci) => {
              const key = `${ri}-${ci}`;
              const found = isCellFound(ri, ci);
              const dragging = dragCells.has(key);
              return (
                <button
                  key={key}
                  onPointerDown={(e) => { e.preventDefault(); handlePointerDown(ri, ci); }}
                  onPointerEnter={() => handlePointerMove(ri, ci)}
                  onPointerUp={handlePointerUp}
                  data-testid={`ws-cell-${ri}-${ci}`}
                  className={`w-10 h-10 flex items-center justify-center font-bold text-lg rounded-lg transition-colors ${
                    found ? 'bg-green-200 text-green-800 border-2 border-green-400 scale-95' :
                    dragging ? 'bg-blue-300 text-blue-900 border-2 border-blue-500 scale-105' :
                    'bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  {letter}
                </button>
              );
            }))}
          </div>
        </Card>

        <Card className="p-5">
          <h4 className="font-bold text-lg mb-3">Words to Find ({foundWords.size}/{placed.length}):</h4>
          <div className="space-y-2">
            {placed.map(w => (
              <div key={w.word} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                foundWords.has(w.word) ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                <span className="text-xl flex-shrink-0">{w.image_emoji || w.emoji || '?'}</span>
                <div>
                  <p className={`font-medium text-sm ${foundWords.has(w.word) ? 'text-green-600 line-through' : 'text-gray-800'}`}>
                    {w.word.toLowerCase()}
                  </p>
                  {w.definition && (
                    <p className="text-xs text-gray-500">{w.definition}</p>
                  )}
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
