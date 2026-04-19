import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Flame, CheckCircle, Star, Zap, Trophy, 
  Volume2, ChevronRight, RefreshCw, ThumbsUp, ThumbsDown, X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Streak display
function StreakBanner({ streak, longestStreak }) {
  const milestones = [7, 30, 100];
  const nextMilestone = milestones.find(m => m > streak) || streak + 10;
  const progressToNext = Math.min((streak / nextMilestone) * 100, 100);

  return (
    <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 mb-6" data-testid="streak-banner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Flame className="w-10 h-10" />
          </div>
          <div>
            <div className="text-4xl font-bold">{streak}</div>
            <div className="text-white/80 text-sm">day streak</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Trophy className="w-4 h-4" /> Best: {longestStreak} days
          </div>
          <div className="mt-2">
            <div className="text-xs text-white/60 mb-1">Next milestone: {nextMilestone} days</div>
            <div className="h-1.5 bg-white/20 rounded-full w-32 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${progressToNext}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Review card for vocabulary
function VocabReviewCard({ item, onRecall }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const speakWord = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.8;
    speechSynthesis.speak(u);
  };

  const handleCheck = () => {
    const correct = userInput.toLowerCase().trim() === item.word.toLowerCase();
    setIsCorrect(correct);
    setChecked(true);
    setShowAnswer(true);
  };

  return (
    <Card className="p-6 max-w-xl mx-auto" data-testid="vocab-review-card">
      {!showAnswer ? (
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-500 mb-6">Do you remember this word?</h3>
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl font-bold text-blue-500">{item.word?.[0]?.toUpperCase() || '?'}</span>
          </div>
          <p className="text-gray-700 mb-6 text-sm italic">Hint: {item.word ? `${item.word.length} letters` : ''}</p>
          
          <div className="space-y-4">
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && userInput.trim() && handleCheck()}
              className="w-full max-w-xs mx-auto px-4 py-3 text-center text-lg border-2 rounded-xl focus:outline-none focus:border-blue-500"
              placeholder="Type the word..." autoFocus data-testid="review-input" />
            <div className="flex justify-center gap-3">
              <Button onClick={handleCheck} disabled={!userInput.trim()} data-testid="review-check-btn">Check</Button>
              <Button variant="outline" onClick={() => setShowAnswer(true)} data-testid="review-show-btn">Show Answer</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{item.word}</h2>
          <button className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 mb-4" onClick={() => speakWord(item.word)}>
            <Volume2 className="w-4 h-4" /> Listen
          </button>
          
          {checked && (
            <div className={`p-3 rounded-xl mb-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? 'Correct!' : `Your answer: "${userInput}"`}
              </p>
            </div>
          )}
          
          <p className="text-gray-600 mb-6 text-sm">Did you remember it correctly?</p>
          
          <div className="flex justify-center gap-4">
            <Button className="bg-green-600 hover:bg-green-700 px-8" onClick={() => onRecall(true)} data-testid="review-yes-btn">
              <ThumbsUp className="w-5 h-5 mr-2" /> Yes
            </Button>
            <Button variant="destructive" className="px-8" onClick={() => onRecall(false)} data-testid="review-no-btn">
              <ThumbsDown className="w-5 h-5 mr-2" /> No
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function DailyHabitPage({ user }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsRes, streakRes] = await Promise.all([
        fetch(`${API_URL}/api/unified/daily-habit/${user.id}/today`),
        fetch(`${API_URL}/api/unified/daily-habit/${user.id}/streak`)
      ]);
      const habits = await habitsRes.json();
      const streakData = await streakRes.json();
      
      setItems(habits.items || []);
      setAlreadyCompleted(habits.already_completed || false);
      setStreak(streakData.daily_streak || 0);
      setLongestStreak(streakData.longest_streak || 0);
    } catch (error) {
      console.error('Error loading daily habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecall = async (recalled) => {
    const item = items[currentIdx];
    if (!item) return;
    
    // Update review in backend
    try {
      await fetch(`${API_URL}/api/unified/review-queue/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, item_id: item.item_id, recalled_correctly: recalled })
      });
    } catch (e) { console.error('Error updating review:', e); }
    
    setReviewed(r => r + 1);
    
    if (currentIdx < items.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      // Complete daily habit
      await completeDailyHabit();
    }
  };

  const completeDailyHabit = async () => {
    try {
      const res = await fetch(`${API_URL}/api/unified/daily-habit/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, items_reviewed: reviewed + 1 })
      });
      const data = await res.json();
      setStreak(data.streak || 0);
      setLongestStreak(data.longest_streak || 0);
      setCompleted(true);
      if (data.bonus_points > 0) toast.success(`Streak bonus: +${data.bonus_points} points!`);
      else toast.success('Daily practice complete!');
    } catch (e) { console.error('Error completing daily habit:', e); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="daily-habit-page">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/unified')} data-testid="daily-habit-back-btn">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">Daily Practice</h1>
              <p className="text-xs text-gray-500">Spaced Repetition Review</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-gray-900">{streak}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <StreakBanner streak={streak} longestStreak={longestStreak} />

        {/* Already completed */}
        {alreadyCompleted && !completed && (
          <Card className="p-8 text-center" data-testid="daily-habit-completed">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">All Done for Today!</h3>
            <p className="text-gray-600 mb-6 text-sm">Great job! You've completed your daily practice. Come back tomorrow to keep your streak alive.</p>
            <Button onClick={() => navigate('/unified')} data-testid="daily-habit-back-course-btn">
              Back to Course <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Card>
        )}

        {/* No items to review */}
        {!alreadyCompleted && items.length === 0 && !completed && (
          <Card className="p-8 text-center" data-testid="daily-habit-no-items">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Star className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-6 text-sm">Complete some lessons first to build your review queue. Words you learn will appear here for daily practice.</p>
            <Button onClick={() => navigate('/unified/stage/stage_1_foundations')} data-testid="daily-habit-start-learning-btn">
              Start Learning <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Card>
        )}

        {/* Review cards */}
        {!alreadyCompleted && items.length > 0 && !completed && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">{currentIdx + 1} of {items.length} items</span>
              <Badge variant="outline">{reviewed} reviewed</Badge>
            </div>
            <Progress value={((currentIdx) / items.length) * 100} className="mb-6" />
            <VocabReviewCard item={items[currentIdx]} onRecall={handleRecall} />
          </div>
        )}

        {/* Completion screen */}
        {completed && (
          <Card className="p-8 text-center" data-testid="daily-habit-session-complete">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Flame className="w-14 h-14 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{streak} Day Streak!</h3>
            <p className="text-gray-600 mb-2 text-sm">You reviewed {reviewed + 1} items today.</p>
            <p className="text-gray-500 mb-6 text-xs">Keep coming back daily to strengthen your memory.</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate('/unified')} data-testid="daily-habit-finish-btn">
                Back to Course
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
