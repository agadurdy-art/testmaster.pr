import React, { useState, useEffect } from 'react';
import { Gamepad2, AlertCircle, ThumbsUp, ThumbsDown, ChevronRight, Repeat, Edit3, CheckCircle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import {
  WordOrder,
  TransformSentence,
  AudioMatch,
  SentenceBuilderTimed
} from '../../../../components/games/grammar';
import SkipButton from './SkipButton';

// ═══════ GRAMMAR GAME (Multi-type) ═══════
function GrammarGame({ activity, onComplete, onSkip }) {
  // Mode-based routing: when activity.mode is set (Stage 3+ schema), delegate to dedicated renderer.
  const mode = activity?.mode;
  const items = activity?.items || [];
  if (mode === 'transform_sentence' && items.length) {
    return <TransformSentence items={items} onComplete={onComplete} onSkip={onSkip} />;
  }
  if (mode === 'audio_match' && items.length) {
    return <AudioMatch items={items} onComplete={onComplete} onSkip={onSkip} />;
  }
  if (mode === 'sentence_builder_timed' && items.length) {
    return <SentenceBuilderTimed items={items} onComplete={onComplete} onSkip={onSkip} timeLimit={activity?.time_limit_seconds} />;
  }
  if (mode === 'word_order' && items.length && items[0]?.words) {
    // Adapt items: existing WordOrder renderer accepts {words, correct_sentence}
    return <WordOrder items={items} onComplete={onComplete} onSkip={onSkip} />;
  }

  const allItems = React.useMemo(() => {
    const errorHunterItems = (activity?.items || []).map(item => ({ ...item, gameType: 'error_hunter' }));
    const wordOrderItems = (activity?.word_order_items || []).map(item => ({ ...item, gameType: 'word_order' }));
    const fillBlankItems = (activity?.fill_blank_items || []).map(item => ({ ...item, gameType: 'fill_blank' }));
    const combined = [...errorHunterItems, ...wordOrderItems, ...fillBlankItems];
    return combined.length > 0 ? combined.sort(() => Math.random() - 0.5) : errorHunterItems;
  }, [activity]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  // Word order state
  const [selectedWords, setSelectedWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  // Fill blank state
  const [selectedOption, setSelectedOption] = useState(null);
  // Error hunter state
  const [userChoice, setUserChoice] = useState(null);

  const item = allItems[idx];

  useEffect(() => {
    if (item?.gameType === 'word_order') {
      setShuffledWords([...(item.words || item.correct_sentence?.split(' ') || [])].sort(() => Math.random() - 0.5));
    }
  }, [idx, item]);

  const resetForNext = () => {
    setShowFeedback(false);
    setIsCorrect(false);
    setSelectedWords([]);
    setSelectedOption(null);
    setUserChoice(null);
  };

  const handleNext = () => {
    resetForNext();
    if (idx < allItems.length - 1) setIdx(i => i + 1);
    else {
      const pct = Math.round((score / allItems.length) * 100);
      const crowns = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
      onComplete(pct, crowns);
    }
  };

  // Error Hunter
  const handleErrorHunter = (hasError) => {
    if (showFeedback) return;
    setUserChoice(hasError);
    const correct = hasError === item.has_error;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setShowFeedback(true);
  };

  // Word Order
  const handleWordSelect = (word, fromIdx) => {
    if (showFeedback) return;
    setSelectedWords(prev => [...prev, word]);
    setShuffledWords(prev => prev.filter((_, i) => i !== fromIdx));
  };

  const handleWordRemove = (word, fromIdx) => {
    if (showFeedback) return;
    setShuffledWords(prev => [...prev, word]);
    setSelectedWords(prev => prev.filter((_, i) => i !== fromIdx));
  };

  const checkWordOrder = () => {
    const normalize = (s) => s.replace(/\s+([.!?,;:'""])/g, '$1').replace(/(['""])\s+/g, '$1').replace(/\s+/g, ' ').replace(/[.!?,;:]+$/g, '').trim().toLowerCase();
    const userSentence = normalize(selectedWords.join(' '));
    const correctSentence = normalize(item.correct_sentence || '');
    const correct = userSentence === correctSentence;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setShowFeedback(true);
  };

  // Fill Blank
  const handleFillBlank = (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
    const optLower = String(option).toLowerCase().trim();
    const correct = Array.isArray(item.correct_answer)
      ? item.correct_answer.some(a => String(a).toLowerCase().trim() === optLower)
      : optLower === String(item.correct_answer || '').toLowerCase().trim();
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setShowFeedback(true);
  };

  if (!item) return null;

  return (
    <div data-testid="grammar-game">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-pink-100 text-pink-700 border-0"><Gamepad2 className="w-3 h-3 mr-1" /> Grammar Game</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{idx + 1} / {allItems.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={(idx / allItems.length) * 100} className="mb-6" />

      {/* ── Error Hunter ── */}
      {item.gameType === 'error_hunter' && (
        <Card className="p-8 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <AlertCircle className="w-3 h-3" /> Find the Error
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <p className="text-xl font-bold text-gray-900">{item.sentence}</p>
          </div>
          {!showFeedback ? (
            <div className="flex justify-center gap-4">
              <Button className="bg-green-600 hover:bg-green-700 px-8" onClick={() => handleErrorHunter(false)} data-testid="error-correct-btn">
                <ThumbsUp className="w-5 h-5 mr-2" /> Correct
              </Button>
              <Button variant="destructive" className="px-8" onClick={() => handleErrorHunter(true)} data-testid="error-wrong-btn">
                <ThumbsDown className="w-5 h-5 mr-2" /> Has Error
              </Button>
            </div>
          ) : (
            <div>
              <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-semibold mb-1">{isCorrect ? 'You got it right!' : 'Not quite!'}</p>
                {item.has_error ? <p className="text-sm">Correct: <strong>{item.correct_sentence}</strong></p> : <p className="text-sm">This sentence is correct!</p>}
              </div>
              <Button onClick={handleNext} data-testid="game-next-btn">{idx < allItems.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      )}

      {/* ── Word Order ── */}
      {item.gameType === 'word_order' && (
        <Card className="p-8 max-w-xl mx-auto">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Repeat className="w-3 h-3" /> Build the Sentence
            </div>
            {item.hint && <p className="text-sm text-gray-500">{item.hint}</p>}
          </div>

          {/* Answer area */}
          <div className="min-h-[56px] bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-3 mb-4 flex flex-wrap gap-2" data-testid="word-order-answer">
            {selectedWords.map((word, i) => (
              <button key={`sel-${i}`} onClick={() => handleWordRemove(word, i)} disabled={showFeedback}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${showFeedback ? (isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800') : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                data-testid={`selected-word-${i}`}>
                {word}
              </button>
            ))}
            {selectedWords.length === 0 && <span className="text-sm text-blue-300">Tap words below to build the sentence</span>}
          </div>

          {/* Word bank */}
          <div className="flex flex-wrap gap-2 justify-center mb-5" data-testid="word-bank">
            {shuffledWords.map((word, i) => (
              <button key={`bank-${i}`} onClick={() => handleWordSelect(word, i)} disabled={showFeedback}
                className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-all"
                data-testid={`bank-word-${i}`}>
                {word}
              </button>
            ))}
          </div>

          {!showFeedback ? (
            <div className="flex justify-center">
              <Button onClick={checkWordOrder} disabled={shuffledWords.length > 0} data-testid="word-order-check-btn">
                Check Answer
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className={`p-3 rounded-xl mb-4 text-sm ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-semibold">{isCorrect ? 'Perfect!' : 'Not quite!'}</p>
                {!isCorrect && <p>Correct: <strong>{item.correct_sentence}</strong></p>}
              </div>
              <Button onClick={handleNext} data-testid="game-next-btn">{idx < allItems.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      )}

      {/* ── Fill in the Blank ── */}
      {item.gameType === 'fill_blank' && (
        <Card className="p-8 max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            <Edit3 className="w-3 h-3" /> Fill in the Blank
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <p className="text-xl font-bold text-gray-900">{item.sentence}</p>
            {item.hint && !showFeedback && (
              <p className="text-sm text-amber-600 mt-2 italic">Hint: {item.hint}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {(item.options || []).map(option => {
              const isSelected = selectedOption === option;
              const optLower = String(option).toLowerCase().trim();
              const isCorrectOption = Array.isArray(item.correct_answer)
                ? item.correct_answer.some(a => String(a).toLowerCase().trim() === optLower)
                : optLower === String(item.correct_answer || '').toLowerCase().trim();
              let cls = 'border-gray-200 hover:border-amber-400 hover:bg-amber-50';
              if (showFeedback) {
                if (isCorrectOption) cls = 'border-green-500 bg-green-50 text-green-800';
                else if (isSelected) cls = 'border-red-500 bg-red-50 text-red-800';
                else cls = 'border-gray-200 opacity-40';
              }
              return (
                <button key={option} onClick={() => handleFillBlank(option)} disabled={showFeedback}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${cls}`}
                  data-testid={`fill-option-${option}`}>
                  {option}
                  {showFeedback && isCorrectOption && <CheckCircle className="inline w-4 h-4 ml-1 text-green-600" />}
                </button>
              );
            })}
          </div>
          {showFeedback && (
            <div className="mt-5">
              <p className={`text-sm font-semibold mb-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{isCorrect ? 'Correct!' : 'Incorrect!'}</p>
              <Button onClick={handleNext} data-testid="game-next-btn">{idx < allItems.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default GrammarGame;
