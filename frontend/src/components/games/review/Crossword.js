/**
 * Crossword Game (Lesson 4 Review) - IMPROVED
 * - Auto-advance to next cell on input
 * - No word concatenation (proper spacing)
 * - Colorful design
 */

import React, { useState, useCallback, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Grid3X3, ChevronRight } from 'lucide-react';
import { GameWrapper, GameComplete } from '../shared';

const GRID_SIZE = 12;
const CELL_COLORS = ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-pink-50', 'bg-cyan-50', 'bg-amber-50', 'bg-rose-50', 'bg-indigo-50'];

const buildGrid = (words) => {
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  const placements = [];
  const sorted = [...words].sort((a, b) => b.word.length - a.word.length).slice(0, 8);

  for (let i = 0; i < sorted.length; i++) {
    const w = sorted[i].word.toUpperCase().replace(/[^A-Z]/g, '');
    if (w.length > GRID_SIZE || w.length < 2) continue;

    if (placements.length === 0) {
      const row = Math.floor(GRID_SIZE / 2);
      const col = Math.floor((GRID_SIZE - w.length) / 2);
      for (let c = 0; c < w.length; c++) {
        grid[row][col + c] = { letter: w[c], wordIndices: [0] };
      }
      placements.push({ ...sorted[i], word: w, row, col, direction: 'across', number: 1 });
      continue;
    }

    let placed = false;
    // Try to intersect with existing words
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

          // Check ALL cells for the new word - must not conflict
          let canPlace = true;
          for (let k = 0; k < w.length; k++) {
            const r = dir === 'down' ? startRow + k : startRow;
            const c = dir === 'across' ? startCol + k : startCol;
            const cell = grid[r][c];
            
            if (cell) {
              // Cell already has a letter - must match
              if (cell.letter !== w[k]) { canPlace = false; break; }
            } else {
              // Empty cell - check neighbors don't create unwanted words
              // For across word: check above and below
              // For down word: check left and right
              if (dir === 'across') {
                const above = r > 0 ? grid[r-1][c] : null;
                const below = r < GRID_SIZE - 1 ? grid[r+1][c] : null;
                if (above && !above.wordIndices.some(wi2 => {
                  const pp = placements[wi2];
                  return pp && pp.direction === 'down' && pp.col === c;
                })) { canPlace = false; break; }
                if (below && !below.wordIndices.some(wi2 => {
                  const pp = placements[wi2];
                  return pp && pp.direction === 'down' && pp.col === c;
                })) { canPlace = false; break; }
              } else {
                const left = c > 0 ? grid[r][c-1] : null;
                const right = c < GRID_SIZE - 1 ? grid[r][c+1] : null;
                if (left && !left.wordIndices.some(wi2 => {
                  const pp = placements[wi2];
                  return pp && pp.direction === 'across' && pp.row === r;
                })) { canPlace = false; break; }
                if (right && !right.wordIndices.some(wi2 => {
                  const pp = placements[wi2];
                  return pp && pp.direction === 'across' && pp.row === r;
                })) { canPlace = false; break; }
              }
            }
          }
          
          // Also check the cells BEFORE and AFTER the new word are empty
          if (canPlace && dir === 'across') {
            if (startCol > 0 && grid[startRow][startCol - 1]) canPlace = false;
            if (startCol + w.length < GRID_SIZE && grid[startRow][startCol + w.length]) canPlace = false;
          }
          if (canPlace && dir === 'down') {
            if (startRow > 0 && grid[startRow - 1][startCol]) canPlace = false;
            if (startRow + w.length < GRID_SIZE && grid[startRow + w.length]?.[startCol]) canPlace = false;
          }

          if (!canPlace) continue;

          const num = placements.length + 1;
          for (let k = 0; k < w.length; k++) {
            const r = dir === 'down' ? startRow + k : startRow;
            const c = dir === 'across' ? startCol + k : startCol;
            if (grid[r][c]) {
              grid[r][c].wordIndices.push(placements.length);
            } else {
              grid[r][c] = { letter: w[k], wordIndices: [placements.length] };
            }
          }
          placements.push({ ...sorted[i], word: w, row: startRow, col: startCol, direction: dir, number: num });
          placed = true;
        }
      }
    }
  }
  
  // Trim the grid to minimum bounding box
  let minR = GRID_SIZE, maxR = 0, minC = GRID_SIZE, maxC = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c]) {
        minR = Math.min(minR, r); maxR = Math.max(maxR, r);
        minC = Math.min(minC, c); maxC = Math.max(maxC, c);
      }
    }
  }
  
  return { grid, placements, bounds: { minR, maxR, minC, maxC } };
};

const Crossword = ({ items, onComplete, onSkip }) => {
  const [{ grid, placements, bounds }] = useState(() => buildGrid(items));
  const [userInputs, setUserInputs] = useState(() => 
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''))
  );
  const [checked, setChecked] = useState(false);
  const [selectedClue, setSelectedClue] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const inputRefs = useRef({});

  const getCellsInOrder = useCallback(() => {
    const cells = [];
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        if (grid[r][c]) cells.push({ r, c });
      }
    }
    return cells;
  }, [grid, bounds]);

  const handleInput = useCallback((row, col, value) => {
    const v = value.toUpperCase().slice(-1);
    setUserInputs(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = v;
      return next;
    });
    
    // Auto-advance to next empty cell
    if (v) {
      const cells = getCellsInOrder();
      const currentIdx = cells.findIndex(c => c.r === row && c.c === col);
      for (let i = currentIdx + 1; i < cells.length; i++) {
        const next = cells[i];
        if (!userInputs[next.r][next.c] || (next.r === row && next.c === col)) {
          const key = `${next.r}-${next.c}`;
          setTimeout(() => inputRefs.current[key]?.focus(), 10);
          break;
        }
      }
    }
  }, [getCellsInOrder, userInputs]);

  const handleCheck = () => {
    let correct = 0, total = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
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
  const cols = bounds.maxC - bounds.minC + 1;

  return (
    <GameWrapper title="Crossword Puzzle" subtitle="Fill in the words" icon={Grid3X3} iconColor="purple" currentQuestion={1} totalQuestions={1} onSkip={onSkip}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="p-5 lg:col-span-3 overflow-auto">
          <div className="inline-grid gap-0.5 mx-auto" style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}>
            {Array.from({ length: bounds.maxR - bounds.minR + 1 }, (_, ri) => 
              Array.from({ length: cols }, (_, ci) => {
                const r = bounds.minR + ri;
                const c = bounds.minC + ci;
                const cell = grid[r]?.[c];
                if (!cell) return <div key={`${r}-${c}`} className="w-10 h-10" />;
                
                const num = placements.find(p => p.row === r && p.col === c)?.number;
                const isCorrect = checked && userInputs[r][c] === cell.letter;
                const isWrong = checked && userInputs[r][c] && userInputs[r][c] !== cell.letter;
                const isEmpty = checked && !userInputs[r][c];
                const colorIdx = cell.wordIndices[0] % CELL_COLORS.length;
                
                return (
                  <div key={`${r}-${c}`} className={`relative w-10 h-10 border-2 rounded-md transition-all ${
                    isCorrect ? 'border-green-500 bg-green-100' : 
                    isWrong ? 'border-red-500 bg-red-100' : 
                    isEmpty ? 'border-orange-400 bg-orange-50' :
                    `border-gray-300 ${CELL_COLORS[colorIdx]} hover:border-blue-400`
                  }`}>
                    {num && <span className="absolute -top-0.5 left-0.5 text-[9px] text-blue-600 font-bold z-10">{num}</span>}
                    <input
                      ref={el => inputRefs.current[`${r}-${c}`] = el}
                      className="w-full h-full text-center font-bold text-lg uppercase bg-transparent outline-none"
                      maxLength={1}
                      value={userInputs[r][c]}
                      onChange={(e) => handleInput(r, c, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !userInputs[r][c]) {
                          const cells = getCellsInOrder();
                          const idx = cells.findIndex(ce => ce.r === r && ce.c === c);
                          if (idx > 0) {
                            const prev = cells[idx - 1];
                            inputRefs.current[`${prev.r}-${prev.c}`]?.focus();
                          }
                        }
                      }}
                      disabled={checked}
                      data-testid={`crossword-cell-${r}-${c}`}
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
                {acrossClues.map(c => (
                  <p key={c.number} className={`text-base cursor-pointer p-2.5 rounded-lg transition-all hover:bg-blue-50 ${selectedClue === c.number ? 'bg-blue-100 font-semibold border-l-4 border-blue-500' : ''}`}
                    onClick={() => setSelectedClue(c.number)} data-testid={`clue-across-${c.number}`}>
                    <strong className="text-blue-600">{c.number}.</strong> {c.definition || c.clue || `Means: ${c.word.toLowerCase()}`}
                  </p>
                ))}
              </div>
            )}
            {downClues.length > 0 && (
              <div>
                <h4 className="font-bold text-lg text-purple-700 mb-2 flex items-center gap-2">
                  <span className="bg-purple-100 px-2 py-0.5 rounded text-sm">↓</span> Down
                </h4>
                {downClues.map(c => (
                  <p key={c.number} className={`text-base cursor-pointer p-2.5 rounded-lg transition-all hover:bg-purple-50 ${selectedClue === c.number ? 'bg-purple-100 font-semibold border-l-4 border-purple-500' : ''}`}
                    onClick={() => setSelectedClue(c.number)} data-testid={`clue-down-${c.number}`}>
                    <strong className="text-purple-600">{c.number}.</strong> {c.definition || c.clue || `Means: ${c.word.toLowerCase()}`}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            {!checked ? (
              <>
                <Button onClick={handleCheck} className="bg-green-600 hover:bg-green-700" data-testid="crossword-check-btn">Check</Button>
                <Button variant="outline" onClick={handleReveal} data-testid="crossword-reveal-btn">Show Answers</Button>
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
