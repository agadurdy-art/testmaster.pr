import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Star, Trophy, Clock, Play, RefreshCw, 
  Check, X, Loader2, Volume2, Home, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../lib/i18n';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ============ GAME COMPONENTS ============

// Matching Pairs Game
const MatchingPairsGame = ({ game, onComplete }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  
  useEffect(() => {
    setCards(game.questions.map((q, idx) => ({ ...q, index: idx })));
  }, [game]);
  
  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      const card1 = cards[first];
      const card2 = cards[second];
      
      if (card1.match_id === card2.id || card2.match_id === card1.id) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        
        // Check if all matched
        if (matched.length + 2 === cards.length) {
          setTimeout(() => onComplete(cards.length / 2, cards.length / 2), 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Badge variant="outline">Moves: {moves}</Badge>
        <Badge className="bg-green-500">Matched: {matched.length / 2} / {cards.length / 2}</Badge>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => handleCardClick(idx)}
            className={`
              aspect-square rounded-xl cursor-pointer transition-all transform
              ${flipped.includes(idx) || matched.includes(idx) 
                ? 'bg-white border-2 border-violet-400 rotate-0' 
                : 'bg-gradient-to-br from-violet-500 to-purple-600 hover:scale-105'
              }
              ${matched.includes(idx) ? 'border-green-400 bg-green-50' : ''}
              flex items-center justify-center p-2 text-center
            `}
          >
            {flipped.includes(idx) || matched.includes(idx) ? (
              <span className={`font-medium ${card.type === 'word' ? 'text-lg' : 'text-sm'}`}>
                {card.content}
              </span>
            ) : (
              <span className="text-3xl text-white">?</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Spelling Bee Game
const SpellingBeeGame = ({ game, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const currentQ = game.questions[currentIndex];
  
  const checkAnswer = () => {
    const correct = userInput.toLowerCase().trim() === currentQ.correct_answer.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setScore(s => s + 1);
      toast.success('Correct! 🎉');
    } else {
      toast.error(`Wrong! The answer was: ${currentQ.correct_answer}`);
    }
    
    setTimeout(() => {
      if (currentIndex < game.questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setUserInput('');
        setShowResult(false);
      } else {
        onComplete(correct ? score + 1 : score, game.questions.length);
      }
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Badge variant="outline">Question {currentIndex + 1} / {game.questions.length}</Badge>
        <Badge className="bg-amber-500">Score: {score}</Badge>
      </div>
      
      <Card className="p-8 text-center bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="text-6xl mb-4">{currentQ.image}</div>
        <p className="text-gray-600 mb-4">Hint: {currentQ.hint}</p>
        
        <div className="flex justify-center gap-2 mb-6">
          {currentQ.scrambled.split('').map((letter, idx) => (
            <div 
              key={idx} 
              className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center text-xl font-bold text-white shadow"
            >
              {letter}
            </div>
          ))}
        </div>
        
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
          placeholder="Type your answer..."
          className="w-full max-w-xs mx-auto px-4 py-3 rounded-xl border-2 border-amber-300 text-center text-lg focus:outline-none focus:border-amber-500"
          disabled={showResult}
          autoFocus
        />
        
        {showResult && (
          <div className={`mt-4 p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isCorrect ? '✓ Correct!' : `✗ The answer was: ${currentQ.correct_answer}`}
          </div>
        )}
        
        {!showResult && (
          <Button onClick={checkAnswer} className="mt-4 bg-amber-500 hover:bg-amber-600">
            Check Answer
          </Button>
        )}
      </Card>
    </div>
  );
};

// True or False Game
const TrueFalseGame = ({ game, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  const currentQ = game.questions[currentIndex];
  const isCorrect = selectedAnswer === currentQ.correct_answer;
  
  const handleAnswer = (answer) => {
    if (answered) return;
    
    setSelectedAnswer(answer);
    setAnswered(true);
    
    if (answer === currentQ.correct_answer) {
      setScore(s => s + 1);
    }
    
    setTimeout(() => {
      if (currentIndex < game.questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        const finalScore = answer === currentQ.correct_answer ? score + 1 : score;
        onComplete(finalScore, game.questions.length);
      }
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Badge variant="outline">Question {currentIndex + 1} / {game.questions.length}</Badge>
        <Badge className="bg-green-500">Score: {score}</Badge>
      </div>
      
      <Card className="p-8 text-center">
        <p className="text-xl md:text-2xl font-medium text-gray-800 mb-8">
          "{currentQ.statement}"
        </p>
        
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={() => handleAnswer(true)}
            disabled={answered}
            className={`px-8 py-6 text-lg ${
              answered && currentQ.correct_answer === true 
                ? 'bg-green-500' 
                : answered && selectedAnswer === true && !isCorrect
                  ? 'bg-red-500'
                  : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            <Check className="w-6 h-6 mr-2" />
            TRUE
          </Button>
          
          <Button
            size="lg"
            onClick={() => handleAnswer(false)}
            disabled={answered}
            className={`px-8 py-6 text-lg ${
              answered && currentQ.correct_answer === false 
                ? 'bg-green-500' 
                : answered && selectedAnswer === false && !isCorrect
                  ? 'bg-red-500'
                  : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            <X className="w-6 h-6 mr-2" />
            FALSE
          </Button>
        </div>
        
        {answered && (
          <div className={`mt-6 p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isCorrect ? '✓ Correct!' : '✗ Wrong answer!'}
          </div>
        )}
      </Card>
    </div>
  );
};

// Word Race Game
const WordRaceGame = ({ game, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(game.time_limit || 60);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  const currentQ = game.questions[currentIndex];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          onComplete(score, game.questions.length);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleAnswer = (option) => {
    if (answered) return;
    
    setSelectedAnswer(option);
    setAnswered(true);
    
    const correct = option === currentQ.correct_answer;
    if (correct) {
      setScore(s => s + 1);
      toast.success('+1 Point!');
    }
    
    setTimeout(() => {
      if (currentIndex < game.questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        onComplete(correct ? score + 1 : score, game.questions.length);
      }
    }, 800);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="w-4 h-4" /> {timeLeft}s
        </Badge>
        <Badge className="bg-blue-500">Score: {score}</Badge>
      </div>
      
      <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-5xl mb-3">{currentQ.image}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">{currentQ.word}</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {currentQ.options.map((option, idx) => (
            <Button
              key={idx}
              onClick={() => handleAnswer(option)}
              disabled={answered}
              className={`py-4 text-sm ${
                answered && option === currentQ.correct_answer
                  ? 'bg-green-500'
                  : answered && option === selectedAnswer
                    ? 'bg-red-500'
                    : 'bg-white text-gray-800 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {option}
            </Button>
          ))}
        </div>
      </Card>
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${(currentIndex / game.questions.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

// Lucky Wheel Game
const LuckyWheelGame = ({ game, onComplete }) => {
  const [spinning, setSpinning] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [rotation, setRotation] = useState(0);
  
  const spinWheel = () => {
    if (spinning || questionIndex >= game.questions.length) return;
    
    setSpinning(true);
    const spins = 3 + Math.random() * 2;
    const newRotation = rotation + (spins * 360) + Math.random() * 360;
    setRotation(newRotation);
    
    setTimeout(() => {
      setSpinning(false);
      setCurrentQuestion(game.questions[questionIndex]);
      setQuestionIndex(i => i + 1);
    }, 3000);
  };
  
  const handleAnswer = (option) => {
    if (answered) return;
    
    setSelectedAnswer(option);
    setAnswered(true);
    
    if (option === currentQuestion.correct_answer) {
      setTotalScore(s => s + (currentQuestion.points || 10));
      toast.success(`+${currentQuestion.points || 10} Points! 🎉`);
    }
    
    setTimeout(() => {
      if (questionIndex >= game.questions.length) {
        onComplete(totalScore + (option === currentQuestion.correct_answer ? currentQuestion.points : 0), game.questions.length);
      } else {
        setCurrentQuestion(null);
        setAnswered(false);
        setSelectedAnswer(null);
      }
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Badge variant="outline">Questions: {questionIndex} / {game.questions.length}</Badge>
        <Badge className="bg-purple-500 flex items-center gap-1">
          <Trophy className="w-4 h-4" /> {totalScore} pts
        </Badge>
      </div>
      
      {!currentQuestion ? (
        <Card className="p-8 text-center">
          <div 
            className="w-48 h-48 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 relative overflow-hidden shadow-xl"
            style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-full"
                style={{ transform: `rotate(${i * 45}deg)` }}
              >
                <div className="w-1 h-24 bg-white/30 mx-auto" />
              </div>
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">🎡</span>
            </div>
          </div>
          
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-purple-600 mx-auto -mt-4 mb-4" />
          
          <Button 
            size="lg" 
            onClick={spinWheel}
            disabled={spinning || questionIndex >= game.questions.length}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8"
          >
            {spinning ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {spinning ? 'Spinning...' : questionIndex >= game.questions.length ? 'Game Over!' : 'SPIN!'}
          </Button>
        </Card>
      ) : (
        <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50">
          <Badge className="mb-4 bg-purple-500">+{currentQuestion.points} Points</Badge>
          <div className="text-4xl mb-2">{currentQuestion.image}</div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">{currentQuestion.word}</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option, idx) => (
              <Button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={answered}
                className={`py-3 ${
                  answered && option === currentQuestion.correct_answer
                    ? 'bg-green-500'
                    : answered && option === selectedAnswer
                      ? 'bg-red-500'
                      : 'bg-white text-gray-800 border hover:bg-purple-50'
                }`}
              >
                {option}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Fishing Game
const FishingGame = ({ game, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(null);
  
  const currentQ = game.questions[currentIndex];
  
  const catchFish = (fish) => {
    setCaught(fish);
    
    const correct = fish === currentQ.correct_fish;
    if (correct) {
      setScore(s => s + 1);
      toast.success('You caught the right fish! 🐟');
    } else {
      toast.error('Oops! Wrong fish!');
    }
    
    setTimeout(() => {
      if (currentIndex < game.questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setCaught(null);
      } else {
        onComplete(correct ? score + 1 : score, game.questions.length);
      }
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Badge variant="outline">Catch {currentIndex + 1} / {game.questions.length}</Badge>
        <Badge className="bg-cyan-500">Score: {score}</Badge>
      </div>
      
      <Card className="p-6 text-center bg-gradient-to-b from-cyan-100 to-blue-200">
        <div className="text-4xl mb-2">{currentQ.target_image}</div>
        <p className="text-lg font-medium text-gray-700 mb-4">
          Catch: <span className="font-bold text-cyan-700">{currentQ.target_meaning}</span>
        </p>
        
        <div className="relative h-40 bg-gradient-to-b from-blue-300 to-blue-500 rounded-xl overflow-hidden">
          {/* Water waves */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-8 bg-white/20"
                style={{ 
                  top: `${i * 30 + 10}px`,
                  animation: `wave ${2 + i * 0.5}s ease-in-out infinite`,
                  borderRadius: '50%'
                }}
              />
            ))}
          </div>
          
          {/* Fish */}
          <div className="absolute inset-0 flex items-center justify-around p-4">
            {currentQ.fish.map((fish, idx) => (
              <button
                key={idx}
                onClick={() => !caught && catchFish(fish)}
                disabled={caught !== null}
                className={`
                  p-3 rounded-xl transition-all transform hover:scale-110
                  ${caught === fish && fish === currentQ.correct_fish ? 'bg-green-400 scale-125' : ''}
                  ${caught === fish && fish !== currentQ.correct_fish ? 'bg-red-400' : ''}
                  ${!caught ? 'hover:-translate-y-2 cursor-pointer' : ''}
                `}
                style={{
                  animation: caught ? 'none' : `swim ${2 + idx * 0.3}s ease-in-out infinite`
                }}
              >
                <span className="text-2xl">🐟</span>
                <span className="block text-xs font-medium text-white mt-1">{fish}</span>
              </button>
            ))}
          </div>
        </div>
        
        <p className="mt-4 text-sm text-gray-500">Click on the fish with the correct word!</p>
      </Card>
      
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
        }
        @keyframes swim {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

// ============ MAIN COMPONENT ============

export default function GameBank() {
  const navigate = useNavigate();
  const { language } = useI18n();
  const [games, setGames] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('family');
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [finalScore, setFinalScore] = useState({ score: 0, total: 0, stars: 0 });
  
  // UI Strings based on language
  const UI = {
    title: { en: 'Game Bank', vi: 'Ngân hàng trò chơi', tr: 'Oyun Bankası' },
    subtitle: { en: 'Learn vocabulary while having fun!', vi: 'Học từ vựng vui vẻ!', tr: 'Eğlenerek kelime öğren!' },
    chooseTopic: { en: 'Choose a Topic:', vi: 'Chọn chủ đề:', tr: 'Konu Seç:' },
    loading: { en: 'Loading game...', vi: 'Đang tải trò chơi...', tr: 'Oyun yükleniyor...' },
    moves: { en: 'Moves', vi: 'Lượt', tr: 'Hamle' },
    matched: { en: 'Matched', vi: 'Đã ghép', tr: 'Eşleşen' },
    score: { en: 'Score', vi: 'Điểm', tr: 'Puan' },
    correct: { en: 'Correct', vi: 'Đúng', tr: 'Doğru' },
    question: { en: 'Question', vi: 'Câu hỏi', tr: 'Soru' },
    typeWord: { en: 'Type the word...', vi: 'Nhập từ...', tr: 'Kelimeyi yaz...' },
    submit: { en: 'Submit', vi: 'Gửi', tr: 'Gönder' },
    hint: { en: 'Hint', vi: 'Gợi ý', tr: 'İpucu' },
    catchFish: { en: 'Catch the correct fish!', vi: 'Bắt con cá đúng!', tr: 'Doğru balığı yakala!' },
    gameComplete: { en: 'Game Complete!', vi: 'Hoàn thành!', tr: 'Oyun Bitti!' },
    playAgain: { en: 'Play Again', vi: 'Chơi lại', tr: 'Tekrar Oyna' },
    backToGames: { en: 'Back to Games', vi: 'Quay lại', tr: 'Oyunlara Dön' },
    back: { en: 'Back', vi: 'Quay lại', tr: 'Geri' },
    backToDashboard: { en: 'Back to Dashboard', vi: 'Về trang chính', tr: 'Ana Sayfaya Dön' },
  };
  
  const getText = (key) => UI[key]?.[language] || UI[key]?.en || key;
  
  useEffect(() => {
    fetchGameList();
  }, [language]);
  
  const fetchGameList = async () => {
    try {
      const res = await fetch(`${API_URL}/api/games/list?lang=${language}`);
      const data = await res.json();
      setGames(data.games);
      setTopics(data.topics);
      // Set default topic from first available
      if (data.topics?.length > 0 && !data.topics.find(t => t.id === selectedTopic)) {
        setSelectedTopic(data.topics[0].id);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };
  
  const startGame = async (gameType) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/games/play/${gameType}?topic=${selectedTopic}&count=8&lang=${language}`);
      const data = await res.json();
      
      if (data.success) {
        setSelectedGame(gameType);
        setGameData(data.game);
        setGameComplete(false);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error(language === 'tr' ? 'Oyun başlatılamadı' : language === 'vi' ? 'Không thể bắt đầu trò chơi' : 'Could not start game');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGameComplete = async (score, total) => {
    try {
      const res = await fetch(`${API_URL}/api/games/submit/${gameData.game_id}?lang=${language}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, total, time_taken: 0 })
      });
      const data = await res.json();
      
      setFinalScore({
        score,
        total,
        stars: data.stars,
        message: data.message,
        percentage: data.percentage
      });
      setGameComplete(true);
    } catch (error) {
      console.error('Error submitting score:', error);
      setFinalScore({ score, total, stars: Math.ceil(score/total * 3), message: 'Great job!' });
      setGameComplete(true);
    }
  };
  
  const resetGame = () => {
    setSelectedGame(null);
    setGameData(null);
    setGameComplete(false);
    setFinalScore({ score: 0, total: 0, stars: 0 });
  };
  
  // Render game based on type
  const renderGame = () => {
    if (!gameData) return null;
    
    const props = { game: gameData, onComplete: handleGameComplete };
    
    switch (selectedGame) {
      case 'matching_pairs': return <MatchingPairsGame {...props} />;
      case 'spelling_bee': return <SpellingBeeGame {...props} />;
      case 'true_false': return <TrueFalseGame {...props} />;
      case 'word_race': return <WordRaceGame {...props} />;
      case 'lucky_wheel': return <LuckyWheelGame {...props} />;
      case 'fishing': return <FishingGame {...props} />;
      default: return null;
    }
  };
  
  // Game Complete Screen
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">
            {finalScore.stars >= 3 ? '🏆' : finalScore.stars >= 2 ? '🎉' : finalScore.stars >= 1 ? '👍' : '💪'}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{getText('gameComplete')}</h2>
          <p className="text-gray-600 mb-4">{finalScore.message}</p>
          
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3].map(star => (
              <Star
                key={star}
                className={`w-10 h-10 ${star <= finalScore.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          
          <div className="text-4xl font-bold text-violet-600 mb-2">
            {finalScore.score} / {finalScore.total}
          </div>
          <p className="text-sm text-gray-500 mb-6">{finalScore.percentage}% {getText('correct')}</p>
          
          <div className="flex gap-3">
            <Button onClick={resetGame} variant="outline" className="flex-1">
              <Home className="w-4 h-4 mr-2" /> {getText('backToGames')}
            </Button>
            <Button onClick={() => startGame(selectedGame)} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600">
              <RefreshCw className="w-4 h-4 mr-2" /> {getText('playAgain')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Game Playing Screen
  if (selectedGame && gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={resetGame}>
              <ArrowLeft className="w-5 h-5 mr-2" /> {getText('back')}
            </Button>
            <h1 className="font-bold text-gray-800">{gameData.title}</h1>
          </div>
          
          {renderGame()}
        </div>
      </div>
    );
  }
  
  // Game Selection Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500">
      {/* Header */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> Game Bank
          </h1>
          <div className="w-20" />
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Topic Selection */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">📚</span> Choose a Topic:
          </h3>
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => {
              const topicEmojis = {
                family: '👨‍👩‍👧', food: '🍎', animals: '🐾', colors: '🎨', 
                numbers: '🔢', school: '🏫', weather: '🌤️', travel: '✈️',
                health: '💪', jobs: '👷', home: '🏠', ielts_academic: '📖'
              };
              return (
                <Button
                  key={topic}
                  variant={selectedTopic === topic ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTopic(topic)}
                  className={`${selectedTopic === topic ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' : 'hover:bg-violet-50'} transition-all`}
                >
                  <span className="mr-1">{topicEmojis[topic] || '📝'}</span>
                  {topic === 'ielts_academic' ? 'IELTS Academic' : topic.charAt(0).toUpperCase() + topic.slice(1).replace('_', ' ')}
                </Button>
              );
            })}
          </div>
        </Card>
        
        {/* Game Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {games.map(game => (
            <Card
              key={game.type}
              className="p-4 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
              onClick={() => startGame(game.type)}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl mb-3 mx-auto shadow-lg`}>
                {game.icon}
              </div>
              <h3 className="font-bold text-center text-gray-800">{game.title}</h3>
              <p className="text-xs text-center text-gray-500 mt-1">{game.description}</p>
            </Card>
          ))}
        </div>
        
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-8">
              <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto" />
              <p className="mt-4 text-gray-600">Loading game...</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
