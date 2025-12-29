import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Clock, AlertCircle, ChevronRight, ChevronLeft, Volume2, VolumeX,
  Loader2, CheckCircle, Play, Pause, ArrowRight, Send, Flag
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SECTION_ORDER = ['listening', 'reading', 'writing', 'speaking'];

export default function FullTestInterface({ user }) {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const sessionId = searchParams.get('session');
  const mode = searchParams.get('mode') || 'full';
  
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [currentSection, setCurrentSection] = useState('listening');
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);
  
  // Audio for listening
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const audioRef = useRef(null);
  
  // Section completion
  const [completedSections, setCompletedSections] = useState([]);
  const [showSectionEnd, setShowSectionEnd] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  // Load test data
  useEffect(() => {
    loadTest();
  }, [testId]);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const loadTest = async () => {
    try {
      const res = await fetch(`${API_URL}/api/full-test/set/${testId}`);
      const data = await res.json();
      if (data.success) {
        setTest(data.test);
        // Set initial timer based on first section
        const firstSectionTime = getSectionTime('listening');
        setTimeLeft(firstSectionTime);
      }
    } catch (error) {
      console.error('Error loading test:', error);
      toast.error('Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const getSectionTime = (section) => {
    const times = {
      listening: 40 * 60,  // 40 min
      reading: 60 * 60,    // 60 min
      writing: 60 * 60,    // 60 min
      speaking: 14 * 60    // 14 min
    };
    return times[section] || 60 * 60;
  };

  const handleTimeUp = () => {
    setTimerActive(false);
    toast.error('Time is up for this section!');
    submitSection();
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startSection = () => {
    setTimerActive(true);
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentSection]: {
        ...prev[currentSection],
        [questionId]: answer
      }
    }));
  };

  const toggleFlag = (questionId) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getCurrentSectionData = () => {
    if (!test) return null;
    return test.sections[currentSection];
  };

  const getCurrentQuestions = () => {
    const sectionData = getCurrentSectionData();
    if (!sectionData) return [];
    
    if (currentSection === 'listening') {
      return sectionData.parts?.[currentPartIndex]?.questions || [];
    } else if (currentSection === 'reading') {
      return sectionData.passages?.[currentPartIndex]?.questions || [];
    } else if (currentSection === 'writing') {
      return sectionData.tasks || [];
    } else if (currentSection === 'speaking') {
      return sectionData.parts?.[currentPartIndex]?.questions || [];
    }
    return [];
  };

  const getTotalParts = () => {
    const sectionData = getCurrentSectionData();
    if (!sectionData) return 1;
    
    if (currentSection === 'listening') return sectionData.parts?.length || 4;
    if (currentSection === 'reading') return sectionData.passages?.length || 3;
    if (currentSection === 'writing') return 1; // Tasks shown together
    if (currentSection === 'speaking') return sectionData.parts?.length || 3;
    return 1;
  };

  const goToNextPart = () => {
    const totalParts = getTotalParts();
    if (currentPartIndex < totalParts - 1) {
      setCurrentPartIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      setShowSectionEnd(true);
    }
  };

  const goToPrevPart = () => {
    if (currentPartIndex > 0) {
      setCurrentPartIndex(prev => prev - 1);
      setCurrentQuestionIndex(0);
    }
  };

  const submitSection = async () => {
    // Stop timer
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      await fetch(`${API_URL}/api/full-test/submit-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          section: currentSection,
          answers: answers[currentSection] || {},
          time_taken: getSectionTime(currentSection) - timeLeft
        })
      });
      
      setCompletedSections(prev => [...prev, currentSection]);
      
      // Move to next section or complete test
      const currentIndex = SECTION_ORDER.indexOf(currentSection);
      if (currentIndex < SECTION_ORDER.length - 1) {
        const nextSection = SECTION_ORDER[currentIndex + 1];
        setCurrentSection(nextSection);
        setCurrentPartIndex(0);
        setCurrentQuestionIndex(0);
        setTimeLeft(getSectionTime(nextSection));
        setShowSectionEnd(false);
      } else {
        setTestComplete(true);
      }
      
    } catch (error) {
      console.error('Error submitting section:', error);
      toast.error('Failed to submit section');
    }
  };

  const completeTest = async () => {
    try {
      const res = await fetch(`${API_URL}/api/full-test/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          test_id: testId,
          all_answers: answers,
          section_times: {} // Would track actual times
        })
      });
      
      const data = await res.json();
      if (data.success) {
        navigate(`/full-test/results/${sessionId}`, { state: { results: data.results } });
      }
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error('Failed to complete test');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Test not found</p>
      </div>
    );
  }

  // Test Complete Screen
  if (testComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Test Complete</h2>
          <p className="text-slate-600 mb-6">
            You have completed all sections of the test. Click below to view your results.
          </p>
          <Button 
            className="bg-slate-900 hover:bg-slate-800"
            onClick={completeTest}
          >
            View Results <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  // Section End Confirmation
  if (showSectionEnd) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-amber-600 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            End of {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} Section
          </h2>
          <p className="text-slate-600 mb-4">
            Are you sure you want to submit this section? You cannot return to it once submitted.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Time remaining: {formatTime(timeLeft)}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowSectionEnd(false)}>
              Go Back
            </Button>
            <Button 
              className="bg-slate-900 hover:bg-slate-800"
              onClick={submitSection}
            >
              Submit Section <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const sectionData = getCurrentSectionData();
  const questions = getCurrentQuestions();
  const totalParts = getTotalParts();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Fixed Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-slate-900">
              {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
            </h1>
            <Badge variant="outline">
              Part {currentPartIndex + 1} of {totalParts}
            </Badge>
          </div>
          
          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-6xl mx-auto mt-2">
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${((currentPartIndex + 1) / totalParts) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Section Instructions (show before starting) */}
      {!timerActive && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} Section
            </h2>
            <p className="text-slate-600 mb-6">{sectionData?.instructions}</p>
            
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Total Questions:</span>
                  <span className="ml-2 font-medium">{sectionData?.total_questions || '40'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Time Allowed:</span>
                  <span className="ml-2 font-medium">{formatTime(getSectionTime(currentSection))}</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800"
              onClick={startSection}
            >
              <Play className="w-4 h-4 mr-2" /> Start {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} Section
            </Button>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {timerActive && (
        <main className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Listening Section */}
            {currentSection === 'listening' && (
              <ListeningSection
                part={sectionData.parts[currentPartIndex]}
                answers={answers.listening || {}}
                onAnswer={(qId, ans) => handleAnswer(qId, ans)}
                flagged={flaggedQuestions}
                onToggleFlag={toggleFlag}
              />
            )}

            {/* Reading Section */}
            {currentSection === 'reading' && (
              <ReadingSection
                passage={sectionData.passages[currentPartIndex]}
                answers={answers.reading || {}}
                onAnswer={(qId, ans) => handleAnswer(qId, ans)}
                flagged={flaggedQuestions}
                onToggleFlag={toggleFlag}
              />
            )}

            {/* Writing Section */}
            {currentSection === 'writing' && (
              <WritingSection
                tasks={sectionData.tasks}
                answers={answers.writing || {}}
                onAnswer={(taskId, text) => handleAnswer(taskId, text)}
              />
            )}

            {/* Speaking Section */}
            {currentSection === 'speaking' && (
              <SpeakingSection
                part={sectionData.parts[currentPartIndex]}
                answers={answers.speaking || {}}
                onAnswer={(qId, ans) => handleAnswer(qId, ans)}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={goToPrevPart}
                disabled={currentPartIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous Part
              </Button>
              
              {currentPartIndex < totalParts - 1 ? (
                <Button onClick={goToNextPart}>
                  Next Part <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  className="bg-slate-900 hover:bg-slate-800"
                  onClick={() => setShowSectionEnd(true)}
                >
                  Submit Section <Send className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

// ============ SECTION COMPONENTS ============

function ListeningSection({ part, answers, onAnswer, flagged, onToggleFlag }) {
  return (
    <div className="space-y-6">
      {/* Part Info */}
      <Card className="p-4 bg-slate-50">
        <h3 className="font-semibold text-slate-900 mb-1">Part {part.part_number}: {part.title}</h3>
        <p className="text-sm text-slate-600">{part.context}</p>
      </Card>

      {/* Audio Script (for now, shown as text - in production would be audio player) */}
      <Card className="p-4 border-blue-200 bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <Volume2 className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-900">Audio Transcript</span>
        </div>
        <div className="text-sm text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap">
          {part.audio_script}
        </div>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {part.questions.map((q, idx) => (
          <Card key={q.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <Badge variant="outline" className="text-xs">
                Question {q.id.replace(/\D/g, '') || idx + 1}
              </Badge>
              <button
                onClick={() => onToggleFlag(q.id)}
                className={`p-1 rounded ${flagged.has(q.id) ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-slate-800 mb-3">{q.question}</p>
            {q.instruction && (
              <p className="text-xs text-slate-500 mb-2 italic">{q.instruction}</p>
            )}
            
            {q.options ? (
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => onAnswer(q.id, opt.charAt(0))}
                    className={`w-full p-3 text-left rounded border transition-all ${
                      answers[q.id] === opt.charAt(0)
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={(e) => onAnswer(q.id, e.target.value)}
                placeholder="Type your answer..."
                className="w-full p-3 border border-slate-200 rounded focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
              />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ReadingSection({ passage, answers, onAnswer, flagged, onToggleFlag }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Passage */}
      <div className="space-y-4">
        <Card className="p-4 sticky top-24">
          <h3 className="font-semibold text-slate-900 mb-2">Passage {passage.passage_number}: {passage.title}</h3>
          <div className="prose prose-sm max-h-[60vh] overflow-y-auto text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {passage.text}
          </div>
        </Card>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {passage.questions.map((q, idx) => (
          <Card key={q.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Badge variant="outline" className="text-xs mb-1">
                  Q{q.id.replace(/\D/g, '') || idx + 1}
                </Badge>
                <Badge className="ml-2 bg-slate-100 text-slate-600 text-xs">
                  {q.type?.replace(/_/g, ' ')}
                </Badge>
              </div>
              <button
                onClick={() => onToggleFlag(q.id)}
                className={`p-1 rounded ${flagged.has(q.id) ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-slate-800 mb-3 text-sm">{q.question}</p>
            {q.instruction && (
              <p className="text-xs text-slate-500 mb-2 italic">{q.instruction}</p>
            )}
            
            {q.options ? (
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => onAnswer(q.id, opt.charAt(0) !== 'i' ? opt.charAt(0) : opt)}
                    className={`w-full p-2 text-left rounded border text-sm transition-all ${
                      answers[q.id] === (opt.charAt(0) !== 'i' ? opt.charAt(0) : opt)
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={(e) => onAnswer(q.id, e.target.value)}
                placeholder="Type your answer..."
                className="w-full p-2 border border-slate-200 rounded focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none text-sm"
              />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function WritingSection({ tasks, answers, onAnswer }) {
  const [activeTask, setActiveTask] = useState(1);
  
  return (
    <div className="space-y-6">
      {/* Task Tabs */}
      <div className="flex gap-2">
        {tasks.map((task) => (
          <button
            key={task.task_number}
            onClick={() => setActiveTask(task.task_number)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTask === task.task_number
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Task {task.task_number}
          </button>
        ))}
      </div>

      {tasks.filter(t => t.task_number === activeTask).map((task) => (
        <div key={task.task_number} className="space-y-4">
          {/* Task Info */}
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-amber-900">Task {task.task_number}</span>
              <Badge className="bg-amber-100 text-amber-700">
                Minimum {task.word_limit.min} words
              </Badge>
            </div>
            <p className="text-sm text-amber-800">
              Suggested time: {task.task_number === 1 ? '20 minutes' : '40 minutes'}
            </p>
          </Card>

          {/* Prompt */}
          <Card className="p-4">
            <p className="text-slate-800 whitespace-pre-wrap">{task.prompt}</p>
            
            {task.visual_data && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-2">{task.visual_data.title}</p>
                <p className="text-xs text-slate-500">[Chart data would be displayed here]</p>
              </div>
            )}
          </Card>

          {/* Text Area */}
          <Card className="p-4">
            <textarea
              value={answers[`task${task.task_number}`] || ''}
              onChange={(e) => onAnswer(`task${task.task_number}`, e.target.value)}
              placeholder="Write your response here..."
              className="w-full h-64 p-4 border border-slate-200 rounded-lg resize-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
            />
            <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
              <span>
                Word count: {(answers[`task${task.task_number}`] || '').split(/\s+/).filter(Boolean).length}
              </span>
              <span>
                Minimum: {task.word_limit.min} words
              </span>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}

function SpeakingSection({ part, answers, onAnswer }) {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-slate-50">
        <h3 className="font-semibold text-slate-900 mb-1">Part {part.part_number}: {part.title}</h3>
        <p className="text-sm text-slate-600">{part.description}</p>
      </Card>

      {/* Cue Card for Part 2 */}
      {part.cue_card && (
        <Card className="p-6 border-2 border-amber-200 bg-amber-50">
          <h4 className="font-semibold text-amber-900 mb-3">{part.cue_card.topic}</h4>
          <p className="text-sm text-amber-800 mb-2">You should say:</p>
          <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
            {part.cue_card.points.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {part.questions?.map((q, idx) => (
          <Card key={q.id} className="p-4">
            <p className="text-slate-800 mb-3">{q.text}</p>
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              placeholder="Record your thoughts or type your response..."
              rows={3}
              className="w-full p-3 border border-slate-200 rounded focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
