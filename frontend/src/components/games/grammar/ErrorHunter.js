/**
 * "Choose the right word" — kid-friendly redesign of the legacy
 * Find-the-Mistake game. Aga 2026-05-19: 8-10 year olds didn't parse the
 * "find the wrong word" concept. The new flow shows the sentence with the
 * error position blanked out, and two big option buttons (correct vs the
 * mistake) — concretely a fill-in-the-blank choice, not abstract error
 * spotting.
 *
 * Data shape unchanged: { sentence, errorWord, correctWord, explanation,
 * alternateErrors? } — same items as before, just rendered differently.
 */

import React, { useMemo, useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import { GameWrapper, GameComplete, shuffleArray } from '../shared';

const ErrorHunter = ({ items, onComplete, onSkip }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pickedIdx, setPickedIdx] = useState(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!items?.length) return null;
  const rawItem = items[currentIdx] || {};

  // Stage 3 build script emits sentence with the corrected version after a "→"
  // arrow, e.g. "I is from Argentina. → I'm from Argentina." That leaks the
  // answer to the kid and breaks our component's options array. Strip the
  // arrow suffix for display, and derive correctWord from the good half when
  // the backend didn't provide one explicitly. Aga 2026-05-20.
  const currentItem = useMemo(() => {
    const sentenceRaw = String(rawItem.sentence || '');
    const arrowIdx = sentenceRaw.search(/→|->/);
    const displaySentence = arrowIdx >= 0 ? sentenceRaw.substring(0, arrowIdx).trim() : sentenceRaw;
    const goodSentence = arrowIdx >= 0
      ? sentenceRaw.substring(arrowIdx + (sentenceRaw[arrowIdx] === '→' ? 1 : 2)).trim()
      : '';

    let correctWord = rawItem.correctWord;
    if (!correctWord && goodSentence) {
      // Diff bad vs good word-by-word; the first mismatch word in good is the
      // correction. Handles contractions like "is" → "I'm" (different index)
      // by falling back to the word that replaced errorWord by position.
      const stripPunc = (s) => s.toLowerCase().replace(/[.,!?;:'"]/g, '');
      const badTokens = displaySentence.split(/\s+/);
      const goodTokens = goodSentence.split(/\s+/);
      const err = stripPunc(rawItem.errorWord || '');
      const errIdx = badTokens.findIndex((w) => stripPunc(w) === err);
      if (errIdx >= 0 && errIdx < goodTokens.length) {
        correctWord = goodTokens[errIdx];
      } else {
        // Fallback: first token in good that differs from bad
        for (let i = 0; i < Math.min(badTokens.length, goodTokens.length); i++) {
          if (stripPunc(badTokens[i]) !== stripPunc(goodTokens[i])) {
            correctWord = goodTokens[i];
            break;
          }
        }
      }
    }
    return { ...rawItem, sentence: displaySentence, correctWord };
  }, [rawItem]);

  // Build the two option buttons (correct + mistake), shuffled per item.
  const options = useMemo(() => {
    const correct = String(currentItem.correctWord || '').trim().replace(/[.,!?;:'"]+$/g, '');
    const wrong = String(currentItem.errorWord || '').trim().replace(/[.,!?;:'"]+$/g, '');
    if (!correct || !wrong) return [];
    return shuffleArray([
      { word: correct, isCorrect: true },
      { word: wrong, isCorrect: false },
    ]);
  }, [currentItem.correctWord, currentItem.errorWord, currentIdx]);

  // Render the sentence with the error position replaced by a visible blank.
  // Match the first occurrence of errorWord (case-insensitive, punctuation-
  // tolerant) so "She are happy." → ["She", "___", "happy."].
  const sentenceWords = useMemo(() => {
    const raw = String(currentItem.sentence || '').split(/(\s+)/);
    const target = String(currentItem.errorWord || '').toLowerCase().replace(/[.,!?;:'"]/g, '');
    let replaced = false;
    return raw.map((tok) => {
      if (replaced) return { text: tok, blank: false };
      const clean = tok.toLowerCase().replace(/[.,!?;:'"]/g, '');
      if (clean && target && clean === target) {
        replaced = true;
        // Preserve trailing punctuation when blanking ("Isabel." → "___.")
        const trail = tok.match(/[.,!?;:'"]+$/)?.[0] || '';
        return { text: '___' + trail, blank: true };
      }
      return { text: tok, blank: false };
    });
  }, [currentItem.sentence, currentItem.errorWord]);

  const handlePick = (idx) => {
    if (pickedIdx !== null) return;
    setPickedIdx(idx);
    if (options[idx]?.isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    setPickedIdx(null);
    if (currentIdx < items.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <GameComplete
        score={score}
        totalQuestions={items.length}
        onContinue={() => onComplete(Math.round((score / items.length) * 100))}
        onRetry={() => {
          setCurrentIdx(0);
          setScore(0);
          setIsComplete(false);
          setPickedIdx(null);
        }}
        title="Grammar Detective!"
      />
    );
  }

  const showFeedback = pickedIdx !== null;
  const userIsRight = showFeedback && options[pickedIdx]?.isCorrect;

  return (
    <GameWrapper
      title="Choose the right word"
      subtitle="Tap the word that fits the sentence"
      icon={Search}
      iconColor="orange"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-6 md:p-8 text-center">
        {/* Sentence with the error position blanked. Kid sees the gap. */}
        <div className="bg-orange-50 rounded-2xl p-6 mb-6 border-2 border-orange-100">
          <p className="text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed">
            {sentenceWords.map((w, i) => (
              <span
                key={i}
                className={w.blank ? 'inline-block mx-1 px-3 py-0.5 rounded-md font-bold' : ''}
                style={
                  w.blank
                    ? { background: '#fffbeb', borderBottom: '3px solid #f59e0b', color: '#b45309' }
                    : undefined
                }
              >
                {w.text}
              </span>
            ))}
          </p>
        </div>

        {/* Two big buttons — the correct word and the mistake, shuffled */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-md mx-auto mb-6">
          {options.map((opt, idx) => {
            const isPickedHere = pickedIdx === idx;
            const correctHere = opt.isCorrect;
            let cls = 'p-5 md:p-6 rounded-2xl text-xl md:text-2xl font-bold border-2 transition-all bg-white text-slate-800 border-slate-300 ';
            if (showFeedback) {
              if (isPickedHere && correctHere) {
                cls += 'bg-green-100 border-green-500 text-green-700';
              } else if (isPickedHere && !correctHere) {
                cls += 'bg-red-100 border-red-500 text-red-700';
              } else if (correctHere) {
                // reveal the correct answer when the kid picked wrong
                cls += 'bg-green-50 border-green-400 text-green-600';
              } else {
                cls += 'bg-slate-50 border-slate-200 text-slate-400';
              }
            } else {
              cls += 'hover:border-orange-400 hover:bg-orange-50 cursor-pointer';
            }
            return (
              <button
                key={idx}
                onClick={() => handlePick(idx)}
                disabled={showFeedback}
                data-testid={`choose-word-${idx}`}
                className={cls}
              >
                {opt.word}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div
            className={`p-4 md:p-5 rounded-xl mb-4 flex items-start gap-3 text-left max-w-md mx-auto ${
              userIsRight ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
            }`}
          >
            {userIsRight ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-base md:text-lg font-bold mb-1">
                {userIsRight ? 'Well done!' : 'Not quite!'}
              </p>
              <p className="text-sm md:text-base text-gray-700">
                The right word is <strong className="text-green-700">{currentItem.correctWord}</strong>.
              </p>
              {currentItem.explanation && (
                <p className="text-xs md:text-sm text-gray-500 mt-1">{currentItem.explanation}</p>
              )}
            </div>
          </div>
        )}

        {showFeedback && (
          <div className="text-center">
            <Button onClick={handleNext} data-testid="error-next-btn">
              {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
            </Button>
          </div>
        )}
      </Card>
    </GameWrapper>
  );
};

export default ErrorHunter;
