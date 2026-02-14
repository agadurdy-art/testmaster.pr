import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ChevronRight, CheckCircle, Clock, Zap, X,
  RefreshCw, BookOpen, Gamepad2, FileText, Edit3, Headphones, 
  Mic, Repeat, Play, Star, Lock, Volume2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Activity icons mapping
const ACTIVITY_ICONS = {
  'retrieval_warmup': RefreshCw,
  'vocabulary': BookOpen,
  'micro_game_vocab': Gamepad2,
  'micro_reading': FileText,
  'grammar_focus': Edit3,
  'micro_game_grammar': Gamepad2,
  'listening': Headphones,
  'production': Mic,
  'exit_ticket': CheckCircle,
  'auto_review': Repeat
};

// Activity labels
const ACTIVITY_LABELS = {
  'retrieval_warmup': 'Warm-up',
  'vocabulary': 'Vocabulary',
  'micro_game_vocab': 'Vocab Game',
  'micro_reading': 'Reading',
  'grammar_focus': 'Grammar',
  'micro_game_grammar': 'Grammar Game',
  'listening': 'Listening',
  'production': 'Speaking',
  'exit_ticket': 'Exit Quiz',
  'auto_review': 'Review'
};

// Lesson path visualization (iSmart-inspired)
function LessonPath({ activities, currentActivity, completedActivities, onActivityClick }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Lesson Progress</h3>
      
      {/* Path visualization */}
      <div className="relative">
        {activities.map((activity, index) => {
          const Icon = ACTIVITY_ICONS[activity.type] || Play;
          const isCompleted = completedActivities.includes(activity.type);
          const isCurrent = currentActivity === activity.type;
          const isSkippable = activity.is_skippable;
          const isAccessible = index === 0 || completedActivities.includes(activities[index - 1]?.type);
          
          // Skip activities with 0 duration (skippable in this stage)
          if (activity.duration_minutes === 0 && activity.is_skippable) {
            return null;
          }
          
          return (
            <div key={activity.activity_id} className="relative">
              {/* Connection line */}
              {index > 0 && (
                <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gray-200" />
              )}
              
              <div 
                className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer ${
                  isCurrent ? 'bg-blue-50 border-2 border-blue-500' :
                  isCompleted ? 'bg-green-50' :
                  isAccessible ? 'hover:bg-gray-50' : 'opacity-50'
                }`}
                onClick={() => isAccessible && onActivityClick(activity)}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-blue-500 text-white' :
                  isAccessible ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : !isAccessible ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {ACTIVITY_LABELS[activity.type] || activity.label}
                    </span>
                    {isSkippable && (
                      <Badge variant="outline" className="text-xs">Optional</Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {activity.duration_minutes} min
                  </span>
                </div>
                
                {/* Status */}
                {isCompleted && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
                {isCurrent && !isCompleted && (
                  <ChevronRight className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Vocabulary Module Component
function VocabularyModule({ activity, onComplete }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const words = activity?.words || [];
  const currentWord = words[currentWordIndex];
  
  const handleCheckWord = () => {
    const correct = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct && !completedWords.includes(currentWord.word_id)) {
      setCompletedWords([...completedWords, currentWord.word_id]);
    }
  };
  
  const handleNextWord = () => {
    setShowFeedback(false);
    setUserInput('');
    
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // All words done
      const score = Math.round((completedWords.length / words.length) * 100);
      onComplete(score);
    }
  };
  
  const speakWord = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };
  
  if (!currentWord) {
    return <div>No vocabulary data</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Word {currentWordIndex + 1} of {words.length}
        </span>
        <Progress value={(currentWordIndex / words.length) * 100} className="w-32" />
      </div>
      
      {/* Word list sidebar */}
      <div className="flex gap-6">
        {/* Word list */}
        <div className="w-48 bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Words</h4>
          {words.map((word, index) => (
            <div 
              key={word.word_id}
              className={`flex items-center gap-2 py-2 text-sm ${
                index === currentWordIndex ? 'text-blue-600 font-medium' :
                completedWords.includes(word.word_id) ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              {completedWords.includes(word.word_id) ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : index === currentWordIndex ? (
                <div className="w-4 h-4 rounded-full bg-blue-500" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              )}
              {word.word}
            </div>
          ))}
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <Card className="p-8 text-center">
            {/* Image placeholder */}
            <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <span className="text-6xl">📚</span>
            </div>
            
            {/* Word */}
            <div className="mb-4">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{currentWord.word}</h2>
              <button 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                onClick={() => speakWord(currentWord.word)}
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-lg">{currentWord.ipa}</span>
              </button>
            </div>
            
            {/* Definition */}
            <p className="text-gray-600 mb-4">{currentWord.definition}</p>
            
            {/* Example sentence */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700 italic">"{currentWord.example_sentence}"</p>
              <button 
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                onClick={() => speakWord(currentWord.example_sentence)}
              >
                <Volume2 className="w-4 h-4" />
                Listen
              </button>
            </div>
            
            {/* Input */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 block">
                Type the word:
              </label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckWord()}
                className={`w-full max-w-xs mx-auto px-4 py-3 text-center text-xl border-2 rounded-xl focus:outline-none focus:ring-2 ${
                  showFeedback ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="Type here..."
                disabled={showFeedback}
                autoFocus
              />
              
              {showFeedback && (
                <div className={`text-lg font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '✓ Correct!' : `✗ The answer is: ${currentWord.word}`}
                </div>
              )}
              
              <div className="flex justify-center gap-4">
                {!showFeedback ? (
                  <Button onClick={handleCheckWord} disabled={!userInput.trim()}>
                    Check
                  </Button>
                ) : (
                  <Button onClick={handleNextWord}>
                    {currentWordIndex < words.length - 1 ? 'Next Word' : 'Complete'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Matching Game Component
function MatchingGame({ activity, onComplete }) {
  const [items, setItems] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  
  useEffect(() => {
    if (activity?.items) {
      // Shuffle items
      const shuffledItems = [...activity.items].sort(() => Math.random() - 0.5);
      setItems(shuffledItems);
    }
  }, [activity]);
  
  useEffect(() => {
    if (selectedWord && selectedMatch) {
      const item = items.find(i => i.word === selectedWord);
      if (item && item.match === selectedMatch) {
        // Correct match
        setMatchedPairs([...matchedPairs, selectedWord]);
        setSelectedWord(null);
        setSelectedMatch(null);
        
        // Check if complete
        if (matchedPairs.length + 1 === items.length) {
          const score = 100; // Perfect score for completing
          onComplete(score, 3); // 3 crowns for perfect
        }
      } else {
        // Wrong match
        setWrongAttempt(true);
        setTimeout(() => {
          setWrongAttempt(false);
          setSelectedWord(null);
          setSelectedMatch(null);
        }, 500);
      }
    }
  }, [selectedWord, selectedMatch]);
  
  const shuffledMatches = [...items].sort(() => Math.random() - 0.5);
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Match the Words</h3>
        <p className="text-gray-600">Connect words with their definitions</p>
      </div>
      
      <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Words column */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Words</h4>
          {items.map((item) => (
            <button
              key={item.word}
              className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                matchedPairs.includes(item.word) ? 'bg-green-100 text-green-700 cursor-default' :
                selectedWord === item.word ? 'bg-blue-500 text-white ring-2 ring-blue-300' :
                'bg-white border-2 border-gray-200 hover:border-blue-300'
              } ${wrongAttempt && selectedWord === item.word ? 'animate-shake bg-red-100' : ''}`}
              onClick={() => !matchedPairs.includes(item.word) && setSelectedWord(item.word)}
              disabled={matchedPairs.includes(item.word)}
            >
              {item.word}
              {matchedPairs.includes(item.word) && (
                <CheckCircle className="inline w-5 h-5 ml-2" />
              )}
            </button>
          ))}
        </div>
        
        {/* Definitions column */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Definitions</h4>
          {shuffledMatches.map((item) => (
            <button
              key={item.match}
              className={`w-full p-4 rounded-xl text-left text-sm transition-all ${
                matchedPairs.includes(item.word) ? 'bg-green-100 text-green-700 cursor-default' :
                selectedMatch === item.match ? 'bg-blue-500 text-white ring-2 ring-blue-300' :
                'bg-white border-2 border-gray-200 hover:border-blue-300'
              } ${wrongAttempt && selectedMatch === item.match ? 'animate-shake bg-red-100' : ''}`}
              onClick={() => !matchedPairs.includes(item.word) && setSelectedMatch(item.match)}
              disabled={matchedPairs.includes(item.word)}
            >
              {item.match}
              {matchedPairs.includes(item.word) && (
                <CheckCircle className="inline w-5 h-5 ml-2" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Progress */}
      <div className="text-center">
        <span className="text-sm text-gray-600">
          {matchedPairs.length} / {items.length} matched
        </span>
      </div>
    </div>
  );
}

// Exit Ticket Component
function ExitTicket({ activity, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  const questions = activity?.questions || [];
  const currentQuestion = questions[currentIndex];
  
  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestion.question_id]: answer });
    
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    } else {
      setShowResults(true);
    }
  };
  
  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.question_id]?.toLowerCase() === q.correct_answer.toLowerCase()) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };
  
  if (showResults) {
    const score = calculateScore();
    const passed = score >= (activity?.pass_threshold || 70);
    
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
          passed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {passed ? (
            <CheckCircle className="w-10 h-10 text-green-600" />
          ) : (
            <X className="w-10 h-10 text-red-600" />
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {passed ? 'Great Job!' : 'Keep Practicing'}
        </h3>
        
        <p className="text-4xl font-bold mb-4" style={{ color: passed ? '#16a34a' : '#dc2626' }}>
          {score}%
        </p>
        
        <p className="text-gray-600 mb-6">
          {passed 
            ? 'You passed the exit quiz! Moving on...' 
            : `You need ${activity?.pass_threshold || 70}% to pass. Review the lesson and try again.`
          }
        </p>
        
        <Button onClick={() => onComplete(score, passed)}>
          {passed ? 'Continue' : 'Try Again'}
        </Button>
      </Card>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(((currentIndex) / questions.length) * 100)}%</span>
        </div>
        <Progress value={(currentIndex / questions.length) * 100} />
      </div>
      
      <Card className="p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          {currentQuestion?.question_text}
        </h3>
        
        {currentQuestion?.question_type === 'multiple_choice' && (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                className={`w-full p-4 rounded-xl text-left border-2 transition-all ${
                  answers[currentQuestion.question_id] === option 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        
        {currentQuestion?.question_type === 'fill_blank' && (
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-blue-500"
              placeholder="Type your answer..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleAnswer(e.target.value.trim());
                }
              }}
              autoFocus
            />
            <p className="text-sm text-gray-500">Press Enter to submit</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// Placeholder Activity Component
function PlaceholderActivity({ type, onComplete, onSkip, isSkippable }) {
  return (
    <Card className="p-12 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
        {React.createElement(ACTIVITY_ICONS[type] || Play, { className: 'w-8 h-8 text-gray-400' })}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {ACTIVITY_LABELS[type] || type}
      </h3>
      <p className="text-gray-600 mb-6">
        This activity module is coming soon.
      </p>
      <div className="flex justify-center gap-4">
        {isSkippable && (
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
        )}
        <Button onClick={() => onComplete(100)}>
          Mark Complete
        </Button>
      </div>
    </Card>
  );
}

// Main Lesson Page Component
export default function UnifiedLessonPage({ user }) {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [currentActivityType, setCurrentActivityType] = useState(null);
  const [currentActivityData, setCurrentActivityData] = useState(null);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPath, setShowPath] = useState(true);
  
  useEffect(() => {
    loadLesson();
  }, [lessonId]);
  
  const loadLesson = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/unified/lessons/${lessonId}`);
      const data = await res.json();
      setLesson(data);
      
      // Find first non-skippable activity
      const firstActivity = data.activity_flow?.find(a => !a.is_skippable || a.duration_minutes > 0);
      if (firstActivity) {
        setCurrentActivityType(firstActivity.type);
        await loadActivityData(firstActivity.type);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadActivityData = async (activityType) => {
    try {
      const res = await fetch(`${API_URL}/api/unified/lessons/${lessonId}/activity/${activityType}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentActivityData(data);
      } else {
        setCurrentActivityData(null);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
      setCurrentActivityData(null);
    }
  };
  
  const handleActivityComplete = async (score, crownsOrPassed) => {
    // Mark activity as complete
    if (!completedActivities.includes(currentActivityType)) {
      setCompletedActivities([...completedActivities, currentActivityType]);
    }
    
    // Save progress to backend
    if (user?.id) {
      try {
        await fetch(`${API_URL}/api/unified/progress/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            lesson_id: lessonId,
            activity_type: currentActivityType,
            score: score,
            crowns: typeof crownsOrPassed === 'number' ? crownsOrPassed : null,
            time_spent_seconds: 0
          })
        });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
    
    // Move to next activity
    moveToNextActivity();
  };
  
  const handleActivitySkip = () => {
    if (!completedActivities.includes(currentActivityType)) {
      setCompletedActivities([...completedActivities, currentActivityType]);
    }
    moveToNextActivity();
  };
  
  const moveToNextActivity = () => {
    const activities = lesson?.activity_flow || [];
    const currentIndex = activities.findIndex(a => a.type === currentActivityType);
    
    // Find next non-skippable activity
    let nextActivity = null;
    for (let i = currentIndex + 1; i < activities.length; i++) {
      const a = activities[i];
      if (!a.is_skippable || a.duration_minutes > 0) {
        nextActivity = a;
        break;
      } else {
        // Auto-skip zero-duration activities
        if (!completedActivities.includes(a.type)) {
          setCompletedActivities(prev => [...prev, a.type]);
        }
      }
    }
    
    if (nextActivity) {
      setCurrentActivityType(nextActivity.type);
      loadActivityData(nextActivity.type);
    } else {
      // Lesson complete
      handleLessonComplete();
    }
  };
  
  const handleLessonComplete = async () => {
    if (user?.id) {
      try {
        await fetch(`${API_URL}/api/unified/progress/lesson`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            lesson_id: lessonId
          })
        });
      } catch (error) {
        console.error('Error completing lesson:', error);
      }
    }
    
    // Navigate back to stage page
    navigate(`/unified/stage/${lesson?.stage_id}`);
  };
  
  const handleActivityClick = (activity) => {
    setCurrentActivityType(activity.type);
    loadActivityData(activity.type);
  };
  
  const renderActivity = () => {
    const activity = lesson?.activity_flow?.find(a => a.type === currentActivityType);
    
    switch (currentActivityType) {
      case 'vocabulary':
        return currentActivityData ? (
          <VocabularyModule 
            activity={currentActivityData} 
            onComplete={handleActivityComplete}
          />
        ) : (
          <PlaceholderActivity 
            type={currentActivityType} 
            onComplete={handleActivityComplete}
            onSkip={handleActivitySkip}
            isSkippable={activity?.is_skippable}
          />
        );
        
      case 'micro_game_vocab':
        return currentActivityData ? (
          <MatchingGame 
            activity={currentActivityData} 
            onComplete={handleActivityComplete}
          />
        ) : (
          <PlaceholderActivity 
            type={currentActivityType} 
            onComplete={handleActivityComplete}
            onSkip={handleActivitySkip}
            isSkippable={activity?.is_skippable}
          />
        );
        
      case 'exit_ticket':
        return currentActivityData ? (
          <ExitTicket 
            activity={currentActivityData} 
            onComplete={(score, passed) => {
              if (passed) {
                handleActivityComplete(score);
              }
            }}
          />
        ) : (
          <PlaceholderActivity 
            type={currentActivityType} 
            onComplete={handleActivityComplete}
            onSkip={handleActivitySkip}
            isSkippable={activity?.is_skippable}
          />
        );
        
      default:
        return (
          <PlaceholderActivity 
            type={currentActivityType} 
            onComplete={handleActivityComplete}
            onSkip={handleActivitySkip}
            isSkippable={activity?.is_skippable}
          />
        );
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Lesson not found</p>
      </div>
    );
  }
  
  const totalActivities = lesson.activity_flow?.filter(a => !a.is_skippable || a.duration_minutes > 0).length || 0;
  const completedCount = completedActivities.length;
  const progressPercent = Math.round((completedCount / totalActivities) * 100);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/unified/stage/${lesson.stage_id}`)}
              >
                <X className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-gray-900">{lesson.title}</h1>
                <p className="text-xs text-gray-500">Lesson {lesson.number}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {lesson.estimated_duration_minutes} min
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4" />
                {lesson.points_reward} pts
              </div>
              <div className="w-32">
                <Progress value={progressPercent} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Lesson path sidebar */}
          <div className="lg:col-span-1">
            <LessonPath
              activities={lesson.activity_flow || []}
              currentActivity={currentActivityType}
              completedActivities={completedActivities}
              onActivityClick={handleActivityClick}
            />
          </div>
          
          {/* Activity content */}
          <div className="lg:col-span-3">
            {renderActivity()}
          </div>
        </div>
      </div>
    </div>
  );
}
