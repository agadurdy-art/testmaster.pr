/**
 * Crossword Game (Lesson 4 Review) - REWRITTEN
 * - Direction-aware auto-advance (across=right, down=below)
 * - Robust grid building with proper word intersections
 * - Click cell to select word direction
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Grid3X3, ChevronRight } from 'lucide-react';
import { GameWrapper, GameComplete } from '../shared';

const CELL_COLORS = [
  'bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-pink-50',
  'bg-cyan-50', 'bg-amber-50', 'bg-rose-50', 'bg-indigo-50'
];

/**
 * Build a crossword grid from a list of word items.
 * Returns { grid, placements, rows, cols }
 */
function buildCrossword(items) {
  const words = items
    .filter(it => it.word && it.word.length >= 2)
    .map(it => ({
      ...it,
      upper: it.word.toUpperCase().replace(/[^A-Z]/g, ''),
    }))
    .filter(it => it.upper.length >= 2)
    .sort((a, b) => b.upper.length - a.upper.length)
    .slice(0, 8);

  if (words.length === 0) return { grid: [], placements: [], rows: 0, cols: 0 };

  // Use a sparse map for building, then convert to dense grid
  const cells = {}; // "r,c" -> { letter, wordIndices: [] }
  const placements = [];

  const getCell = (r, c) => cells[`${r},${c}`] || null;
  const setCell = (r, c, letter, wordIdx) => {
    const key = `${r},${c}`;
    if (cells[key]) {
      cells[key].wordIndices.push(wordIdx);
    } else {
      cells[key] = { letter, wordIndices: [wordIdx] };
    }
  };

  // Check if we can place a word at (startR, startC) in given direction
  const canPlace = (word, startR, startC, dir, skipIntersect) => {
    for (let i = 0; i < word.length; i++) {
      const r = dir === 'down' ? startR + i : startR;
      const c = dir === 'across' ? startC + i : startC;
      const existing = getCell(r, c);

      if (existing) {
        if (existing.letter !== word[i]) return false;
        // This is an intersection point - OK
      } else {
        // Check adjacent cells perpendicular to direction
        if (dir === 'across') {
          const above = getCell(r - 1, c);
          const below = getCell(r + 1, c);
          if (above || below) return false; // Would create unintended adjacency
        } else {
          const left = getCell(r, c - 1);
          const right = getCell(r, c + 1);
          if (left || right) return false;
        }
      }
    }

    // Check cell before start and after end are empty
    if (dir === 'across') {
      if (getCell(startR, startC - 1)) return false;
      if (getCell(startR, startC + word.length)) return false;
    } else {
      if (getCell(startR - 1, startC)) return false;
      if (getCell(startR + word.length, startC)) return false;
    }

    return true;
  };

  // Place the first word across at origin
  const first = words[0];
  for (let i = 0; i < first.upper.length; i++) {
    setCell(0, i, first.upper[i], 0);
  }
  placements.push({
    ...first,
    row: 0, col: 0, direction: 'across',
    number: 1
  });

  // Place remaining words by finding intersections
  let clueNum = 2;
  for (let wi = 1; wi < words.length; wi++) {
    const w = words[wi];
    let placed = false;

    // Try to intersect with each placed word
    for (const p of placements) {
      if (placed) break;
      const newDir = p.direction === 'across' ? 'down' : 'across';

      for (let pi = 0; pi < p.upper.length && !placed; pi++) {
        for (let li = 0; li < w.upper.length && !placed; li++) {
          if (p.upper[pi] !== w.upper[li]) continue;

          let startR, startC;
          if (newDir === 'down') {
            // p is across, intersect at p's column pi
            startR = p.row - li;
            startC = p.col + pi;
          } else {
            // p is down, intersect at p's row pi
            startR = p.row + pi;
            startC = p.col - li;
          }

          if (!canPlace(w.upper, startR, startC, newDir)) continue;

          // Place the word
          for (let i = 0; i < w.upper.length; i++) {
            const r = newDir === 'down' ? startR + i : startR;
            const c = newDir === 'across' ? startC + i : startC;
            setCell(r, c, w.upper[i], placements.length);
          }
          placements.push({
            ...w,
            row: startR, col: startC, direction: newDir,
            number: clueNum++
          });
          placed = true;
        }
      }
    }
  }

  // Convert sparse map to dense grid
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const key of Object.keys(cells)) {
    const [r, c] = key.split(',').map(Number);
    minR = Math.min(minR, r);
    maxR = Math.max(maxR, r);
    minC = Math.min(minC, c);
    maxC = Math.max(maxC, c);
  }

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (const [key, val] of Object.entries(cells)) {
    const [r, c] = key.split(',').map(Number);
    grid[r - minR][c - minC] = val;
  }

  // Normalize placement coordinates
  for (const p of placements) {
    p.row -= minR;
    p.col -= minC;
  }

  // Re-number placements by position (top-to-bottom, left-to-right)
  const starts = placements.map((p, i) => ({ idx: i, r: p.row, c: p.col }));
  starts.sort((a, b) => a.r !== b.r ? a.r - b.r : a.c - b.c);
  const numberMap = {};
  let num = 1;
  for (const s of starts) {
    const posKey = `${s.r},${s.c}`;
    if (!numberMap[posKey]) numberMap[posKey] = num++;
  }
  for (const p of placements) {
    p.number = numberMap[`${p.row},${p.col}`];
  }

  return { grid, placements, rows, cols };
}

const Crossword = ({ items, onComplete, onSkip }) => {
  const { grid, placements, rows, cols } = useMemo(() => buildCrossword(items), [items]);

  const [userInputs, setUserInputs] = useState(() =>
    Array.from({ length: rows }, () => Array(cols).fill(''))
  );
  const [checked, setChecked] = useState(false);
  const [activeWord, setActiveWord] = useState(null); // placement index
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const inputRefs = useRef({});

  // Get cells for a specific word placement
  const getWordCells = useCallback((pIdx) => {
    if (pIdx == null || !placements[pIdx]) return [];
    const p = placements[pIdx];
    const cells = [];
    for (let i = 0; i < p.upper.length; i++) {
      const r = p.direction === 'down' ? p.row + i : p.row;
      const c = p.direction === 'across' ? p.col + i : p.col;
      cells.push({ r, c });
    }
    return cells;
  }, [placements]);

  // When clicking a cell, select the word it belongs to
  const handleCellClick = useCallback((r, c) => {
    const cell = grid[r]?.[c];
    if (!cell) return;

    // If the cell belongs to multiple words, toggle between them
    const wordIndices = cell.wordIndices;
    if (wordIndices.length === 1) {
      setActiveWord(wordIndices[0]);
    } else {
      // Toggle: if currently on one of these words, switch to the other
      const nextIdx = wordIndices.find(wi => wi !== activeWord) ?? wordIndices[0];
      setActiveWord(nextIdx);
    }
  }, [grid, activeWord]);

  const handleInput = useCallback((r, c, value) => {
    const v = value.toUpperCase().slice(-1);
    setUserInputs(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = v;
      return next;
    });

    // Auto-advance within the active word's direction
    if (v && activeWord != null) {
      const wordCells = getWordCells(activeWord);
      const idx = wordCells.findIndex(cell => cell.r === r && cell.c === c);
      // Find next empty cell in this word
      for (let i = idx + 1; i < wordCells.length; i++) {
        const next = wordCells[i];
        const key = `${next.r}-${next.c}`;
        setTimeout(() => inputRefs.current[key]?.focus(), 10);
        return;
      }
    }
  }, [activeWord, getWordCells]);

  const handleKeyDown = useCallback((e, r, c) => {
    if (e.key === 'Backspace' && !userInputs[r]?.[c]) {
      // Go back within active word
      if (activeWord != null) {
        const wordCells = getWordCells(activeWord);
        const idx = wordCells.findIndex(cell => cell.r === r && cell.c === c);
        if (idx > 0) {
          const prev = wordCells[idx - 1];
          const key = `${prev.r}-${prev.c}`;
          inputRefs.current[key]?.focus();
        }
      }
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      let nr = r, nc = c;
      if (e.key === 'ArrowRight') nc++;
      if (e.key === 'ArrowLeft') nc--;
      if (e.key === 'ArrowDown') nr++;
      if (e.key === 'ArrowUp') nr--;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr]?.[nc]) {
        inputRefs.current[`${nr}-${nc}`]?.focus();
      }
    }
  }, [activeWord, getWordCells, userInputs, grid, rows, cols]);

  const handleCheck = () => {
    let correct = 0, total = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c]) {
          total++;
          if (userInputs[r][c] === grid[r][c].letter) correct++;
        }
      }
    }
    setScore(total > 0 ? Math.round((correct / total) * 100) : 0);
    setChecked(true);
  };

  const handleReveal = () => {
    setUserInputs(prev => {
      const next = prev.map(row => [...row]);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
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
        onRetry={() => {
          setUserInputs(Array.from({ length: rows }, () => Array(cols).fill('')));
          setChecked(false);
          setIsComplete(false);
          setActiveWord(null);
        }}
        title="Crossword Master!"
      />
    );
  }

  if (placements.length === 0) {
    return (
      <GameWrapper title="Crossword Puzzle" subtitle="Fill in the words" icon={Grid3X3} iconColor="purple" currentQuestion={1} totalQuestions={1} onSkip={onSkip}>
        <div className="text-center py-8 text-gray-500">No words available for crossword</div>
      </GameWrapper>
    );
  }

  const acrossClues = placements.filter(p => p.direction === 'across').sort((a, b) => a.number - b.number);
  const downClues = placements.filter(p => p.direction === 'down').sort((a, b) => a.number - b.number);

  // Determine highlighted cells for the active word
  const highlightedCells = new Set();
  if (activeWord != null) {
    for (const cell of getWordCells(activeWord)) {
      highlightedCells.add(`${cell.r}-${cell.c}`);
    }
  }

  const cellSize = cols > 8 ? 36 : 42;

  return (
    <GameWrapper title="Crossword Puzzle" subtitle="Fill in the words" icon={Grid3X3} iconColor="purple" currentQuestion={1} totalQuestions={1} onSkip={onSkip}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="p-5 lg:col-span-3 overflow-auto flex items-center justify-center">
          <div
            className="inline-grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
            data-testid="crossword-grid"
          >
            {Array.from({ length: rows }, (_, ri) =>
              Array.from({ length: cols }, (_, ci) => {
                const cell = grid[ri]?.[ci];
                if (!cell) return <div key={`${ri}-${ci}`} style={{ width: cellSize, height: cellSize }} />;

                const num = placements.find(p => p.row === ri && p.col === ci)?.number;
                const isCorrect = checked && userInputs[ri][ci] === cell.letter;
                const isWrong = checked && userInputs[ri][ci] && userInputs[ri][ci] !== cell.letter;
                const isEmpty = checked && !userInputs[ri][ci];
                const isHighlighted = highlightedCells.has(`${ri}-${ci}`);
                const colorIdx = cell.wordIndices[0] % CELL_COLORS.length;

                return (
                  <div
                    key={`${ri}-${ci}`}
                    className={`relative border-2 rounded-md transition-all cursor-pointer ${
                      isCorrect ? 'border-green-500 bg-green-100' :
                      isWrong ? 'border-red-500 bg-red-100' :
                      isEmpty ? 'border-orange-400 bg-orange-50' :
                      isHighlighted ? 'border-blue-500 bg-blue-100' :
                      `border-gray-300 ${CELL_COLORS[colorIdx]} hover:border-blue-400`
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                    onClick={() => handleCellClick(ri, ci)}
                  >
                    {num && (
                      <span className="absolute -top-0.5 left-0.5 text-[9px] text-blue-600 font-bold z-10 select-none">
                        {num}
                      </span>
                    )}
                    <input
                      ref={el => inputRefs.current[`${ri}-${ci}`] = el}
                      className="w-full h-full text-center font-bold text-lg uppercase bg-transparent outline-none cursor-pointer"
                      maxLength={1}
                      value={userInputs[ri]?.[ci] || ''}
                      onChange={(e) => handleInput(ri, ci, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                      onFocus={() => handleCellClick(ri, ci)}
                      disabled={checked}
                      data-testid={`crossword-cell-${ri}-${ci}`}
                    />
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="space-y-5">
            {acrossClues.length > 0 && (
              <div>
                <h4 className="font-bold text-lg text-blue-700 mb-2 flex items-center gap-2">
                  <span className="bg-blue-100 px-2 py-0.5 rounded text-sm">→</span> Across
                </h4>
                {acrossClues.map(cl => {
                  const pIdx = placements.indexOf(cl);
                  return (
                    <p
                      key={cl.number}
                      className={`text-base cursor-pointer p-2.5 rounded-lg transition-all hover:bg-blue-50 ${
                        activeWord === pIdx ? 'bg-blue-100 font-semibold border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => {
                        setActiveWord(pIdx);
                        const cells = getWordCells(pIdx);
                        if (cells.length > 0) {
                          const first = cells.find(c => !userInputs[c.r]?.[c.c]) || cells[0];
                          setTimeout(() => inputRefs.current[`${first.r}-${first.c}`]?.focus(), 10);
                        }
                      }}
                      data-testid={`clue-across-${cl.number}`}
                    >
                      <strong className="text-blue-600">{cl.number}.</strong>{' '}
                      {cl.definition || cl.clue || `Means: ${cl.word.toLowerCase()}`}
                    </p>
                  );
                })}
              </div>
            )}
            {downClues.length > 0 && (
              <div>
                <h4 className="font-bold text-lg text-purple-700 mb-2 flex items-center gap-2">
                  <span className="bg-purple-100 px-2 py-0.5 rounded text-sm">↓</span> Down
                </h4>
                {downClues.map(cl => {
                  const pIdx = placements.indexOf(cl);
                  return (
                    <p
                      key={cl.number}
                      className={`text-base cursor-pointer p-2.5 rounded-lg transition-all hover:bg-purple-50 ${
                        activeWord === pIdx ? 'bg-purple-100 font-semibold border-l-4 border-purple-500' : ''
                      }`}
                      onClick={() => {
                        setActiveWord(pIdx);
                        const cells = getWordCells(pIdx);
                        if (cells.length > 0) {
                          const first = cells.find(c => !userInputs[c.r]?.[c.c]) || cells[0];
                          setTimeout(() => inputRefs.current[`${first.r}-${first.c}`]?.focus(), 10);
                        }
                      }}
                      data-testid={`clue-down-${cl.number}`}
                    >
                      <strong className="text-purple-600">{cl.number}.</strong>{' '}
                      {cl.definition || cl.clue || `Means: ${cl.word.toLowerCase()}`}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            {!checked ? (
              <>
                <Button onClick={handleCheck} className="bg-green-600 hover:bg-green-700" data-testid="crossword-check-btn">
                  Check
                </Button>
                <Button variant="outline" onClick={handleReveal} data-testid="crossword-reveal-btn">
                  Show Answers
                </Button>
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
