import React, { useState, useEffect } from 'react';
import { Gamepad2, CheckCircle, X, ChevronRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import SkipButton from './SkipButton';

// ═══════ VOCAB GAME (Multiple Choice or Matching) ═══════
function MatchingGame({ activity, onComplete, onSkip }) {
  const items = activity?.items || [];
  
  // Detect if items have matching format (word + match) or MCQ format (question_text + options)
  const isMatchingFormat = items.length > 0 && items[0]?.word && items[0]?.match;
  const isMCQFormat = items.length > 0 && items[0]?.question_text && items[0]?.options;
  
  // MCQ/Quiz Mode States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  
  // Matching Mode States
  const [matchingItems] = useState(() => isMatchingFormat ? [...items].sort(() => Math.random() - 0.5) : []);
  const [shuffledMatches] = useState(() => isMatchingFormat ? [...items].sort(() => Math.random() - 0.5) : []);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongPair, setWrongPair] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(null);

  // Matching game effect
  useEffect(() => {
    if (!isMatchingFormat || !selectedWord || !selectedMatch) return;
    const item = matchingItems.find(i => i.word === selectedWord);
    if (item && item.match === selectedMatch) {
      setLastCorrect(true);
      setMatchedPairs(prev => {
        const newMatched = [...prev, selectedWord];
        if (newMatched.length === matchingItems.length) {
          setTimeout(() => onComplete(100, 3), 400);
        }
        return newMatched;
      });
      setTimeout(() => { setSelectedWord(null); setSelectedMatch(null); setLastCorrect(null); }, 400);
    } else {
      setWrongPair(true);
      setLastCorrect(false);
      setTimeout(() => { setWrongPair(false); setSelectedWord(null); setSelectedMatch(null); setLastCorrect(null); }, 600);
    }
  }, [selectedWord, selectedMatch, matchingItems, isMatchingFormat, onComplete]);

  // MCQ handlers
  const handleMCQSelect = (option) => {
    if (showFeedback) return;
    setSelectedAnswer(option);
    setShowFeedback(true);
    const q = items[currentIdx];
    const opt = String(option).toLowerCase().trim();
    const isCorrect = Array.isArray(q.correct_answer)
      ? q.correct_answer.some(a => String(a).toLowerCase().trim() === opt)
      : opt === String(q.correct_answer || '').toLowerCase().trim();
    if (isCorrect) setScore(s => s + 1);
  };

  const handleMCQNext = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentIdx < items.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      const pct = Math.round((score / items.length) * 100);
      onComplete(pct, pct >= 80 ? 3 : pct >= 60 ? 2 : 1);
    }
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div data-testid="matching-game" className="text-center py-12">
        <p className="text-gray-500">No vocabulary game data available</p>
        <Button className="mt-4" onClick={() => onComplete(100)}>Skip</Button>
      </div>
    );
  }

  // MCQ/Quiz Format Rendering
  if (isMCQFormat) {
    const q = items[currentIdx];
    const isCorrectOption = (option) => {
      const opt = String(option).toLowerCase().trim();
      if (Array.isArray(q.correct_answer)) return q.correct_answer.some(a => String(a).toLowerCase().trim() === opt);
      return opt === String(q.correct_answer || '').toLowerCase().trim();
    };

    return (
      <div data-testid="matching-game">
        <div className="flex items-center justify-between mb-6">
          <Badge className="bg-purple-100 text-purple-700 border-0"><Gamepad2 className="w-3 h-3 mr-1" /> Vocab Game</Badge>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{currentIdx + 1} / {items.length}</span>
            <SkipButton onSkip={onSkip} />
          </div>
        </div>
        <Progress value={((currentIdx + 1) / items.length) * 100} className="mb-6" />
        
        <Card className="p-8 max-w-xl mx-auto text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-6">{q.question_text}</h3>
          <div className="space-y-3">
            {(q.options || []).map((option) => {
              const isSelected = selectedAnswer === option;
              const optionIsCorrect = isCorrectOption(option);
              let cls = 'border-gray-200 hover:border-purple-300 hover:bg-purple-50';
              if (showFeedback) {
                if (optionIsCorrect) cls = 'border-green-500 bg-green-50 text-green-800';
                else if (isSelected && !optionIsCorrect) cls = 'border-red-500 bg-red-50 text-red-800';
                else cls = 'border-gray-200 opacity-50';
              } else if (isSelected) {
                cls = 'border-purple-500 bg-purple-50';
              }
              return (
                <button
                  key={option}
                  className={`w-full p-4 rounded-xl text-left border-2 transition-all font-medium text-sm ${cls}`}
                  onClick={() => handleMCQSelect(option)}
                  disabled={showFeedback}
                  data-testid={`vocab-game-option-${option}`}
                >
                  {option}
                  {showFeedback && optionIsCorrect && <CheckCircle className="inline w-5 h-5 ml-2 text-green-600" />}
                  {showFeedback && isSelected && !optionIsCorrect && <X className="inline w-5 h-5 ml-2 text-red-600" />}
                </button>
              );
            })}
          </div>
          {showFeedback && (
            <div className="mt-6">
              <p className={`text-sm font-semibold mb-3 ${selectedAnswer && isCorrectOption(selectedAnswer) ? 'text-green-600' : 'text-red-600'}`}>
                {selectedAnswer && isCorrectOption(selectedAnswer) ? 'Correct!' : `The answer is: ${q.correct_answer}`}
              </p>
              <Button onClick={handleMCQNext} data-testid="vocab-game-next-btn">
                {currentIdx < items.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Matching Format Rendering (original logic)
  return (
    <div data-testid="matching-game">
      <div className="flex items-center justify-between mb-6">
        <Badge className="bg-purple-100 text-purple-700 border-0"><Gamepad2 className="w-3 h-3 mr-1" /> Vocab Game</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{matchedPairs.length} / {matchingItems.length} matched</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Match the Words</h3>
        <p className="text-sm text-gray-500">Connect words with their definitions</p>
        {lastCorrect === true && <p className="text-green-600 font-semibold text-sm mt-1">Correct match!</p>}
        {lastCorrect === false && <p className="text-red-600 font-semibold text-sm mt-1">Try again!</p>}
      </div>
      <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Words</h4>
          {matchingItems.map(item => (
            <button key={item.word} disabled={matchedPairs.includes(item.word)}
              className={`w-full p-3.5 rounded-xl text-left font-medium transition-all text-sm ${
                matchedPairs.includes(item.word) ? 'bg-green-100 text-green-700' :
                selectedWord === item.word ? (wrongPair ? 'bg-red-100 border-2 border-red-400' : 'bg-blue-500 text-white shadow-md') :
                'bg-white border-2 border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => !matchedPairs.includes(item.word) && setSelectedWord(item.word)}
              data-testid={`match-word-${item.word}`}>
              {item.word} {matchedPairs.includes(item.word) && <CheckCircle className="inline w-4 h-4 ml-1" />}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Definitions</h4>
          {shuffledMatches.map(item => (
            <button key={item.match} disabled={matchedPairs.includes(item.word)}
              className={`w-full p-3.5 rounded-xl text-left text-sm transition-all ${
                matchedPairs.includes(item.word) ? 'bg-green-100 text-green-700' :
                selectedMatch === item.match ? (wrongPair ? 'bg-red-100 border-2 border-red-400' : 'bg-blue-500 text-white shadow-md') :
                'bg-white border-2 border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => !matchedPairs.includes(item.word) && setSelectedMatch(item.match)}
              data-testid={`match-def-${item.word}`}>
              {item.match} {matchedPairs.includes(item.word) && <CheckCircle className="inline w-4 h-4 ml-1" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MatchingGame;
