import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Clock, Shuffle, Brain, Target, 
  CheckCircle, XCircle, ChevronRight, BookOpen, Headphones,
  Mic, PenTool, RotateCcw, Play, Timer, Award,
  Loader2, AlertCircle, Lightbulb, Pause, Volume2
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MODES = {
  timed: { 
    name: 'Timed Practice', 
    icon: Clock, 
    color: 'from-red-500 to-orange-500',
    description: 'Real exam conditions with time pressure'
  },
  random: { 
    name: 'Random Practice', 
    icon: Shuffle, 
    color: 'from-blue-500 to-cyan-500',
    description: 'Random questions for variety'
  },
  smart: { 
    name: 'Smart Practice', 
    icon: Brain, 
    color: 'from-purple-500 to-pink-500',
    description: 'AI-powered focus on weak areas'
  }
};

const SKILLS = {
  reading: { name: 'Reading', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  listening: { name: 'Listening', icon: Headphones, color: 'text-purple-600', bg: 'bg-purple-50' },
  writing: { name: 'Writing', icon: PenTool, color: 'text-green-600', bg: 'bg-green-50' },
  speaking: { name: 'Speaking', icon: Mic, color: 'text-orange-600', bg: 'bg-orange-50' }
};

// Time limits per question type (in seconds)
const TIME_LIMITS = {
  reading: {
    'multiple-choice': 90,
    'true-false-ng': 75,
    'matching-headings': 120,
    'sentence-completion': 90,
    'summary-completion': 120,
    'matching-info': 90,
    'default': 90
  },
  listening: {
    'default': 30 // Per question
  },
  writing: {
    'task1': 20 * 60, // 20 minutes
    'task2': 40 * 60  // 40 minutes
  },
  speaking: {
    'part1': 30,
    'part2': 120,
    'part3': 45
  }
};

export default function PracticeMode({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const mode = searchParams.get('mode') || 'random';
  const skill = searchParams.get('skill') || 'reading';
  const topic = searchParams.get('topic');
  const band = searchParams.get('band');
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });
  
  // Audio states for listening practice
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const ModeIcon = MODES[mode]?.icon || Shuffle;
  const SkillIcon = SKILLS[skill]?.icon || BookOpen;

  // Generate TTS audio for listening practice
  const generateAudio = async (text) => {
    if (!text) return;
    
    setAudioLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/vocab-grammar/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'alloy', speed: 0.9 })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        return url;
      }
    } catch (error) {
      console.error('TTS error:', error);
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setAudioLoading(false);
    }
  };

  const playAudio = async () => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion?.audio_transcript) return;
    
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }
    
    // Generate new audio if not already generated
    if (!audioUrl) {
      const url = await generateAudio(currentQuestion.audio_transcript);
      if (url && audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Reset audio when question changes
  useEffect(() => {
    setAudioUrl(null);
    setIsPlayingAudio(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex]);

  // Load questions based on skill and mode
  useEffect(() => {
    loadQuestions();
  }, [skill, mode, topic, band]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let params = new URLSearchParams();
      
      if (topic) params.set('topic', topic);
      if (band) params.set('band_level', band);
      params.set('count', mode === 'timed' ? '40' : '20');

      // Use question-bank practice endpoints that pull from Full Tests
      switch (mode) {
        case 'timed':
          endpoint = `/api/question-bank/practice/timed?skill=${skill}&${params.toString()}`;
          break;
        case 'smart':
          endpoint = `/api/question-bank/practice/smart?user_id=${user?.id || 'anonymous'}&skill=${skill}`;
          break;
        case 'random':
        default:
          endpoint = `/api/question-bank/practice/random?skill=${skill}&${params.toString()}`;
          break;
      }

      // Special handling for speaking and writing
      if (skill === 'speaking') {
        navigate(`/question-bank/speaking?${params.toString()}`);
        return;
      }
      
      if (skill === 'writing') {
        navigate(`/writing-practice/task1?${params.toString()}`);
        return;
      }

      const res = await fetch(`${API_URL}${endpoint}`);
      const data = await res.json();
      
      if (data.success && data.questions && data.questions.length > 0) {
        let loadedQuestions = data.questions;
        
        // For smart mode, already sorted by backend
        // For random mode, shuffle
        if (mode === 'random') {
          loadedQuestions = shuffleArray([...loadedQuestions]);
        }
        
        setQuestions(loadedQuestions);
        
        // Set initial time for timed mode
        if (mode === 'timed' && loadedQuestions.length > 0) {
          const firstQ = loadedQuestions[0];
          const timeLimit = TIME_LIMITS[skill]?.[firstQ.type] || TIME_LIMITS[skill]?.default || 90;
          setTimeLeft(timeLimit);
        }
      } else {
        // Fallback to sample questions if no data from backend
        const sampleQuestions = generateSampleQuestions(skill, mode);
        setQuestions(sampleQuestions);
        if (mode === 'timed') {
          setTimeLeft(TIME_LIMITS[skill]?.default || 90);
        }
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      // Fallback to sample questions
      const sampleQuestions = generateSampleQuestions(skill, mode);
      setQuestions(sampleQuestions);
      if (mode === 'timed') {
        setTimeLeft(TIME_LIMITS[skill]?.default || 90);
      }
    } finally {
      setLoading(false);
    }
  };

  // Timer effect for timed mode
  useEffect(() => {
    let timer;
    if (mode === 'timed' && timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft, mode]);

  const handleTimeUp = () => {
    setTimerActive(false);
    toast.error('Time\'s up!');
    // Auto-skip to next question
    handleNext(true);
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const prioritizeQuestions = (questions) => {
    // Smart mode: Sort by difficulty (harder first) or user's weak areas
    return questions.sort((a, b) => {
      const diffA = a.difficulty || 'medium';
      const diffB = b.difficulty || 'medium';
      const diffOrder = { hard: 0, medium: 1, easy: 2 };
      return (diffOrder[diffA] || 1) - (diffOrder[diffB] || 1);
    });
  };

  const generateSampleQuestions = (skill, mode) => {
    // Generate sample questions based on skill
    const baseQuestions = {
      reading: [
        {
          id: 'r1',
          type: 'true-false-ng',
          text: 'The passage states that climate change is primarily caused by human activities.',
          passage: 'Climate change refers to long-term shifts in global temperatures and weather patterns. While natural processes can contribute to these changes, scientific consensus holds that human activities have been the primary driver since the mid-20th century, particularly through the burning of fossil fuels.',
          options: ['TRUE', 'FALSE', 'NOT GIVEN'],
          correct: 'TRUE',
          explanation: 'The passage explicitly states that "human activities have been the primary driver since the mid-20th century."',
          difficulty: 'medium'
        },
        {
          id: 'r2',
          type: 'multiple-choice',
          text: 'What is the main idea of the passage?',
          passage: 'Renewable energy sources like solar, wind, and hydroelectric power are becoming increasingly important as the world seeks to reduce its dependence on fossil fuels. These clean energy alternatives produce little to no greenhouse gas emissions during operation.',
          options: [
            'A) Fossil fuels are the best energy source',
            'B) Renewable energy is becoming more important',
            'C) Solar power is the only clean energy',
            'D) Climate change is not a concern'
          ],
          correct: 'B',
          explanation: 'The passage focuses on how renewable energy sources are "becoming increasingly important."',
          difficulty: 'easy'
        },
        {
          id: 'r3',
          type: 'sentence-completion',
          text: 'Complete the sentence: The industrial revolution began in _______ during the 18th century.',
          options: ['France', 'Germany', 'Britain', 'Spain'],
          correct: 'Britain',
          passage: 'The industrial revolution, which began in Britain during the 18th century, transformed manufacturing processes and led to significant social and economic changes.',
          explanation: 'The passage clearly states "began in Britain during the 18th century."',
          difficulty: 'easy'
        }
      ],
      listening: [
        {
          id: 'l1',
          type: 'form-completion',
          text: 'What time does the train depart?',
          audio_transcript: 'The next train to London will depart from platform 3 at 14:30.',
          options: ['13:30', '14:30', '15:30', '16:30'],
          correct: '14:30',
          explanation: 'The announcement clearly states "14:30".',
          difficulty: 'easy'
        },
        {
          id: 'l2',
          type: 'multiple-choice',
          text: 'What is the speaker\'s main concern?',
          audio_transcript: 'I\'m really worried about the environmental impact of this new factory. The pollution levels could increase significantly.',
          options: [
            'A) Job opportunities',
            'B) Environmental impact',
            'C) Traffic congestion',
            'D) Noise pollution'
          ],
          correct: 'B',
          explanation: 'The speaker explicitly mentions being "worried about the environmental impact."',
          difficulty: 'medium'
        }
      ],
      writing: [
        {
          id: 'w1',
          type: 'task2',
          text: 'Some people believe that universities should focus on academic knowledge, while others think they should prepare students for employment. Discuss both views and give your own opinion.',
          word_limit: 250,
          time_limit: 40,
          difficulty: 'medium'
        }
      ],
      speaking: [
        {
          id: 's1',
          type: 'part1',
          text: 'What is your favorite type of music? Why do you enjoy it?',
          time_limit: 30,
          difficulty: 'easy'
        }
      ]
    };

    let questions = baseQuestions[skill] || baseQuestions.reading;
    
    // Add more questions for variety
    if (mode !== 'timed') {
      questions = [...questions, ...questions.map((q, i) => ({
        ...q,
        id: `${q.id}_copy_${i}`
      }))];
    }

    return questions;
  };

  const handleAnswer = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: answer
    }));
  };

  const handleNext = (skipped = false) => {
    const currentQ = questions[currentIndex];
    const userAnswer = answers[currentQ.id];
    
    // Update stats
    if (skipped || !userAnswer) {
      setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    } else if (userAnswer === currentQ.correct) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      
      // Reset timer for timed mode
      if (mode === 'timed') {
        const nextQ = questions[currentIndex + 1];
        const timeLimit = TIME_LIMITS[skill]?.[nextQ?.type] || TIME_LIMITS[skill]?.default || 90;
        setTimeLeft(timeLimit);
      }
    } else {
      // Practice complete
      setShowResults(true);
      setTimerActive(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const startPractice = () => {
    setPracticeStarted(true);
    if (mode === 'timed') {
      setTimerActive(true);
    }
  };

  const restartPractice = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
    setStats({ correct: 0, incorrect: 0, skipped: 0 });
    setPracticeStarted(false);
    
    // Reload questions for fresh practice
    if (mode === 'random') {
      setQuestions(shuffleArray([...questions]));
    }
    
    if (mode === 'timed') {
      const firstQ = questions[0];
      const timeLimit = TIME_LIMITS[skill]?.[firstQ?.type] || TIME_LIMITS[skill]?.default || 90;
      setTimeLeft(timeLimit);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/question-bank')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge className={`bg-gradient-to-r ${MODES[mode]?.color} text-white`}>
              <ModeIcon className="w-3 h-3 mr-1" />
              {MODES[mode]?.name}
            </Badge>
            <Badge className={SKILLS[skill]?.bg + ' ' + SKILLS[skill]?.color}>
              <SkillIcon className="w-3 h-3 mr-1" />
              {SKILLS[skill]?.name}
            </Badge>
          </div>
        </div>

        {/* Pre-Start Screen */}
        {!practiceStarted && !showResults && (
          <Card className="p-8 text-center">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${MODES[mode]?.color} flex items-center justify-center`}>
              <ModeIcon className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{MODES[mode]?.name}</h1>
            <p className="text-gray-500 mb-6">{MODES[mode]?.description}</p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Skill</p>
                  <p className="font-semibold text-gray-900">{SKILLS[skill]?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Questions</p>
                  <p className="font-semibold text-gray-900">{questions.length}</p>
                </div>
                {topic && (
                  <div>
                    <p className="text-gray-500">Topic</p>
                    <p className="font-semibold text-gray-900 capitalize">{topic.replace('_', ' ')}</p>
                  </div>
                )}
                {band && (
                  <div>
                    <p className="text-gray-500">Band</p>
                    <p className="font-semibold text-gray-900">{band}</p>
                  </div>
                )}
              </div>
            </div>

            {mode === 'timed' && (
              <div className="bg-red-50 rounded-lg p-3 mb-6 max-w-md mx-auto">
                <p className="text-sm text-red-600 flex items-center justify-center gap-2">
                  <Timer className="w-4 h-4" />
                  Timer will start immediately. Answer within time limit!
                </p>
              </div>
            )}

            {mode === 'smart' && (
              <div className="bg-purple-50 rounded-lg p-3 mb-6 max-w-md mx-auto">
                <p className="text-sm text-purple-600 flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4" />
                  Questions sorted by difficulty. Harder questions first!
                </p>
              </div>
            )}

            <Button 
              size="lg"
              className={`bg-gradient-to-r ${MODES[mode]?.color} hover:opacity-90`}
              onClick={startPractice}
            >
              <Play className="w-5 h-5 mr-2" /> Start Practice
            </Button>
          </Card>
        )}

        {/* Practice In Progress */}
        {practiceStarted && !showResults && currentQuestion && (
          <div className="space-y-4">
            {/* Progress & Timer Bar */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    Question {currentIndex + 1} of {questions.length}
                  </Badge>
                  <Badge className={currentQuestion.difficulty === 'hard' ? 'bg-red-100 text-red-700' : 
                                   currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' : 
                                   'bg-yellow-100 text-yellow-700'}>
                    {currentQuestion.difficulty || 'medium'}
                  </Badge>
                </div>
                
                {mode === 'timed' && (
                  <div className={`flex items-center gap-2 ${timeLeft < 30 ? 'text-red-600' : 'text-gray-600'}`}>
                    <Timer className="w-4 h-4" />
                    <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${MODES[mode]?.color} transition-all duration-300`}
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </Card>

            {/* Question Card */}
            <Card className="p-6">
              {/* Question Type Badge */}
              <Badge className="mb-4 bg-indigo-100 text-indigo-700">
                {currentQuestion.type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>

              {/* Passage (if exists) */}
              {currentQuestion.passage && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700 leading-relaxed">{currentQuestion.passage}</p>
                </div>
              )}

              {/* Audio Transcript (for listening practice) */}
              {currentQuestion.audio_transcript && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-xs text-purple-500 mb-2 flex items-center gap-1">
                    <Headphones className="w-3 h-3" /> Audio Transcript (for practice)
                  </p>
                  <p className="text-sm text-gray-700">{currentQuestion.audio_transcript}</p>
                </div>
              )}

              {/* Question Text */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentQuestion.text}</h3>

              {/* Options */}
              {currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option.startsWith('A)') || option.startsWith('B)') || option.startsWith('C)') || option.startsWith('D)') ? option.charAt(0) : option)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        answers[currentQuestion.id] === (option.startsWith('A)') || option.startsWith('B)') || option.startsWith('C)') || option.startsWith('D)') ? option.charAt(0) : option)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-gray-700">{option}</span>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleNext(true)}
                >
                  Skip
                </Button>
                <Button
                  onClick={() => handleNext(false)}
                  disabled={!answers[currentQuestion.id]}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {showResults && (
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice Complete!</h2>
              <p className="text-gray-500">{MODES[mode]?.name} - {SKILLS[skill]?.name}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
                <p className="text-sm text-gray-500">Correct</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{stats.incorrect}</p>
                <p className="text-sm text-gray-500">Incorrect</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <AlertCircle className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-500">{stats.skipped}</p>
                <p className="text-sm text-gray-500">Skipped</p>
              </div>
            </div>

            {/* Score */}
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 mb-2">Your Score</p>
              <p className="text-4xl font-bold text-indigo-600">
                {Math.round((stats.correct / questions.length) * 100)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.correct} out of {questions.length} correct
              </p>
            </div>

            {/* Review Answers */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" /> Review Answers
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {questions.map((q, idx) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = userAnswer === q.correct;
                  const wasSkipped = !userAnswer;

                  return (
                    <div 
                      key={q.id}
                      className={`p-3 rounded-lg border ${
                        wasSkipped ? 'bg-gray-50 border-gray-200' :
                        isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          wasSkipped ? 'bg-gray-200 text-gray-600' :
                          isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 mb-1">{q.text.substring(0, 80)}...</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-gray-500">Your answer: {userAnswer || 'Skipped'}</span>
                            {!isCorrect && !wasSkipped && (
                              <span className="text-green-600">Correct: {q.correct}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/question-bank')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
              </Button>
              <Button 
                onClick={restartPractice}
                className={`bg-gradient-to-r ${MODES[mode]?.color} hover:opacity-90`}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
