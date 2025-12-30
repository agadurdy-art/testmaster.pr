import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { 
  Clock, AlertCircle, Volume2, VolumeX, Settings, HelpCircle, EyeOff,
  Loader2, CheckCircle, Play, Pause, ArrowRight, ArrowLeft, 
  Mic, Square, SkipForward, Headphones, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ============ REAL IELTS-STYLE TEST CONFIGURATION ============
const SECTION_CONFIG = {
  listening: { totalTime: 40 * 60, questions: 40, parts: 4 },
  reading: { totalTime: 60 * 60, questions: 40, parts: 3 },
  writing: { totalTime: 60 * 60, tasks: 2 },
  speaking: { totalTime: 14 * 60, parts: 3 }
};

const SPEAKING_TIMING = {
  part1: { questionTime: 25, questions: 9 },
  part2: { prepTime: 60, speakTime: 120 },
  part3: { questionTime: 75, questions: 5 }
};

export default function FullTestInterface({ user }) {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const mode = searchParams.get('mode') || 'full';

  // ============ STATE ============
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [currentSection, setCurrentSection] = useState('listening');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [sectionAnswers, setSectionAnswers] = useState({
    listening: {},
    reading: {},
    writing: { task1: '', task2: '' },
    speaking: {}
  });
  const [completedSections, setCompletedSections] = useState([]);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewedQuestions, setReviewedQuestions] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Listening specific
  const [listeningPart, setListeningPart] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const audioRef = useRef(null);

  // Reading specific
  const [currentPassage, setCurrentPassage] = useState(0);

  // Writing specific
  const [writingTask, setWritingTask] = useState(1);
  const [wordCount, setWordCount] = useState({ task1: 0, task2: 0 });

  // Speaking specific
  const [speakingPart, setSpeakingPart] = useState(1);
  const [speakingQuestion, setSpeakingQuestion] = useState(0);
  const [speakingState, setSpeakingState] = useState('IDLE');
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(0);
  const [recordings, setRecordings] = useState({});
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const questionAudioRef = useRef(null);

  const sectionOrder = ['listening', 'reading', 'writing', 'speaking'];
  const isSingleSectionMode = ['listening', 'reading', 'writing', 'speaking'].includes(mode);
  const activeSections = isSingleSectionMode ? [mode] : sectionOrder;

  // ============ LOAD TEST DATA ============
  useEffect(() => {
    loadTestData();
  }, [testId]);

  useEffect(() => {
    if (isSingleSectionMode) {
      setCurrentSection(mode);
      setCurrentSectionIndex(0);
    }
  }, [mode, isSingleSectionMode]);

  const loadTestData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/full-test/set/${testId}`);
      const data = await res.json();
      if (data.success) {
        setTestData(data.test);
        const initialSection = isSingleSectionMode ? mode : 'listening';
        setCurrentSection(initialSection);
        setTimeRemaining(SECTION_CONFIG[initialSection].totalTime);
      } else {
        toast.error('Failed to load test');
        navigate('/full-test');
      }
    } catch (error) {
      console.error('Error loading test:', error);
      toast.error('Error loading test data');
    } finally {
      setLoading(false);
    }
  };

  // ============ TIMER ============
  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSectionTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} minutes left`;
  };

  const formatTimeShort = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSectionTimeUp = () => {
    setTimerActive(false);
    toast.warning(`Time's up!`);
    submitCurrentSection();
  };

  // ============ SECTION NAVIGATION ============
  const startSection = () => {
    setTimerActive(true);
    if (currentSection === 'listening') {
      // Auto-play audio after starting
    }
  };

  const submitCurrentSection = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/full-test/submit-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          section: currentSection,
          answers: sectionAnswers[currentSection],
          time_taken: SECTION_CONFIG[currentSection].totalTime - timeRemaining
        })
      });

      const data = await res.json();
      if (data.success) {
        setCompletedSections([...completedSections, currentSection]);
        if (isSingleSectionMode) {
          completeTest();
          return;
        }
        const nextIndex = currentSectionIndex + 1;
        if (nextIndex < activeSections.length) {
          const nextSection = activeSections[nextIndex];
          setCurrentSection(nextSection);
          setCurrentSectionIndex(nextIndex);
          setTimeRemaining(SECTION_CONFIG[nextSection].totalTime);
          setTimerActive(false);
          toast.success(`${currentSection} completed.`);
        } else {
          completeTest();
        }
      }
    } catch (error) {
      console.error('Error submitting section:', error);
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
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
          mode: mode,
          all_answers: sectionAnswers
        })
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/full-test/results/${sessionId}`, { state: { results: data.results } });
      }
    } catch (error) {
      console.error('Error completing test:', error);
    }
  };

  // ============ QUESTION HANDLERS ============
  const updateAnswer = (section, questionId, value) => {
    setSectionAnswers(prev => ({
      ...prev,
      [section]: { ...prev[section], [questionId]: value }
    }));
  };

  const toggleReview = (questionId) => {
    setReviewedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleAudioEnded = () => {
    setAudioPlaying(false);
    setAudioEnded(true);
    if (listeningPart < 4) {
      setTimeout(() => {
        setListeningPart(prev => prev + 1);
        setAudioEnded(false);
      }, 2000);
    }
  };

  // Speaking handlers
  const startSpeakingRecording = async () => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const answerId = `${speakingPart}_${speakingQuestion}`;
        setRecordings(prev => ({
          ...prev,
          [answerId]: { blob: audioBlob, url: URL.createObjectURL(audioBlob) }
        }));
        setSectionAnswers(prev => ({
          ...prev,
          speaking: { ...prev.speaking, [answerId]: { audioBlob } }
        }));
        stream.getTracks().forEach(track => track.stop());
        setSpeakingState('READY_NEXT');
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setSpeakingState('RECORDING');
      
      const maxTime = speakingPart === 1 ? SPEAKING_TIMING.part1.questionTime :
                     speakingPart === 2 ? SPEAKING_TIMING.part2.speakTime :
                     SPEAKING_TIMING.part3.questionTime;
      setQuestionTimeRemaining(maxTime);
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopSpeakingRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setSpeakingState('PROCESSING');
    }
  };

  // Speaking timer
  useEffect(() => {
    let interval;
    if (speakingState === 'RECORDING' && questionTimeRemaining > 0) {
      interval = setInterval(() => {
        setQuestionTimeRemaining(prev => {
          if (prev <= 1) {
            stopSpeakingRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [speakingState, questionTimeRemaining]);

  // ============ RENDER IELTS-STYLE HEADER ============
  const renderHeader = () => (
    <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">IELTS</span>
          </div>
          <span className="text-sm text-slate-300">Computer-Delivered Test</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Timer */}
        <div className="flex items-center gap-2 bg-slate-600/50 px-3 py-1 rounded">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{formatTime(timeRemaining)}</span>
        </div>
        
        {/* Control Buttons */}
        <button 
          onClick={() => setShowSettings(true)}
          className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm flex items-center gap-1"
        >
          <Settings className="w-4 h-4" /> Settings
        </button>
        <button 
          onClick={() => setShowHelp(true)}
          className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm flex items-center gap-1"
        >
          <HelpCircle className="w-4 h-4" /> Help
        </button>
        <button className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm flex items-center gap-1">
          <EyeOff className="w-4 h-4" /> Hide
        </button>
      </div>
    </header>
  );

  // ============ RENDER IELTS-STYLE NAVIGATION BAR ============
  const renderNavigationBar = () => {
    const getQuestionNumbers = () => {
      if (currentSection === 'listening') {
        return {
          parts: [
            { label: 'Part 1', questions: Array.from({length: 10}, (_, i) => i + 1) },
            { label: 'Part 2', questions: Array.from({length: 10}, (_, i) => i + 11) },
            { label: 'Part 3', questions: Array.from({length: 10}, (_, i) => i + 21) },
            { label: 'Part 4', questions: Array.from({length: 10}, (_, i) => i + 31) }
          ]
        };
      } else if (currentSection === 'reading') {
        return {
          parts: [
            { label: 'Part 1', questions: Array.from({length: 13}, (_, i) => i + 1) },
            { label: 'Part 2', questions: Array.from({length: 13}, (_, i) => i + 14) },
            { label: 'Part 3', questions: Array.from({length: 14}, (_, i) => i + 27) }
          ]
        };
      }
      return { parts: [] };
    };

    const navData = getQuestionNumbers();
    
    return (
      <div className="bg-slate-100 border-t-2 border-slate-300 px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Review checkbox */}
          <label className="flex items-center gap-1 text-sm text-slate-600 mr-2">
            <input 
              type="checkbox" 
              checked={reviewedQuestions[currentQuestion] || false}
              onChange={() => toggleReview(currentQuestion)}
              className="w-4 h-4"
            />
            Review
          </label>
          
          {navData.parts.map((part, partIdx) => (
            <div key={part.label} className="flex items-center gap-1">
              <span className="text-xs font-medium text-slate-700 bg-slate-300 px-2 py-1 rounded">
                {part.label}
              </span>
              {part.questions.map(qNum => {
                const isAnswered = currentSection === 'listening' 
                  ? !!sectionAnswers.listening[`L${Math.ceil(qNum/10)}Q${qNum}`]
                  : !!sectionAnswers.reading[`R${partIdx+1}Q${qNum}`];
                const isCurrent = currentQuestion === qNum;
                const isReviewed = reviewedQuestions[qNum];
                
                return (
                  <button
                    key={qNum}
                    onClick={() => {
                      setCurrentQuestion(qNum);
                      if (currentSection === 'listening') {
                        setListeningPart(Math.ceil(qNum / 10));
                      } else if (currentSection === 'reading') {
                        setCurrentPassage(partIdx);
                      }
                    }}
                    className={`w-7 h-7 text-xs font-medium rounded transition-all
                      ${isCurrent ? 'bg-blue-500 text-white' : 
                        isAnswered ? 'bg-slate-700 text-white' : 
                        'bg-slate-200 text-slate-700 hover:bg-slate-300'}
                      ${isReviewed ? 'ring-2 ring-yellow-400' : ''}
                    `}
                  >
                    {qNum}
                  </button>
                );
              })}
            </div>
          ))}
          
          {/* Next/Previous arrows */}
          <div className="ml-auto flex items-center gap-2">
            <button 
              onClick={() => setCurrentQuestion(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentQuestion(prev => Math.min(40, prev + 1))}
              className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-600"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============ RENDER LISTENING SECTION (IELTS STYLE) ============
  const renderListeningSection = () => {
    const listening = testData?.sections?.listening;
    const currentPartData = listening?.parts?.[listeningPart - 1];
    
    return (
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-4xl mx-auto p-6">
          {/* Part Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-1">Part {listeningPart}</h2>
            <p className="text-slate-600 text-lg">Listen and answer questions {(listeningPart-1)*10 + 1} - {listeningPart * 10}</p>
          </div>

          {/* Audio Player with Volume Control */}
          <div className="mb-6 p-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayAudio}
                  disabled={audioEnded}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg
                    ${audioPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}
                    ${audioEnded ? 'bg-slate-400 cursor-not-allowed' : ''}
                    text-white`}
                >
                  {audioPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <div>
                  <p className="font-semibold text-slate-900 text-lg">
                    {audioPlaying ? 'Playing...' : audioEnded ? 'Audio Completed' : 'Click to Play Audio'}
                  </p>
                  <p className="text-sm text-slate-500">Audio plays once only</p>
                </div>
              </div>
              
              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-slate-500" />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="80"
                  onChange={(e) => {
                    if (audioRef.current) {
                      audioRef.current.volume = e.target.value / 100;
                    }
                  }}
                  className="w-24 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            <audio
              ref={audioRef}
              src={`${API_URL}/api/full-test/audio/stream/${testId}/listening/${listeningPart}`}
              onEnded={handleAudioEnded}
              onPlay={() => setAudioPlaying(true)}
              onPause={() => setAudioPlaying(false)}
              style={{ display: 'none' }}
            />
          </div>

          {/* Questions Section - IELTS Note Completion Style */}
          <div className="bg-white border-2 border-slate-200 rounded-lg">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-900">
                Questions {(listeningPart-1)*10 + 1} - {listeningPart * 10}
              </h3>
              <p className="text-slate-600 mt-1">
                Complete the notes. Write <strong>ONE WORD ONLY</strong> in each gap.
              </p>
            </div>
            
            <div className="p-6">
              {/* Section Title */}
              <h4 className="font-bold text-xl text-slate-800 mb-6 pb-3 border-b border-slate-200">
                {currentPartData?.title}
              </h4>
              
              {/* Questions in note completion format */}
              <div className="space-y-4">
                {currentPartData?.questions?.map((q, idx) => {
                  const qNum = (listeningPart - 1) * 10 + idx + 1;
                  const questionParts = q.question?.split('______') || [q.question];
                  
                  return (
                    <div key={q.id} className="flex items-start gap-2 py-2 text-slate-700 text-lg leading-relaxed">
                      <span className="text-slate-400 min-w-[20px]">•</span>
                      <div className="flex-1 flex flex-wrap items-center gap-1">
                        <span>{questionParts[0]}</span>
                        <div className="relative inline-block">
                          <input
                            type="text"
                            value={sectionAnswers.listening[q.id] || ''}
                            onChange={(e) => updateAnswer('listening', q.id, e.target.value)}
                            className="w-36 px-3 py-2 border-2 border-blue-400 rounded-md text-center font-medium 
                                     bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none
                                     placeholder:text-blue-300 placeholder:font-bold"
                            placeholder={String(qNum)}
                          />
                        </div>
                        {questionParts[1] && <span>{questionParts[1]}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============ RENDER READING SECTION (IELTS STYLE - SPLIT SCREEN) ============
  const renderReadingSection = () => {
    const reading = testData?.sections?.reading;
    const passage = reading?.passages?.[currentPassage];
    
    return (
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Passage */}
        <div className="w-1/2 border-r border-slate-300 overflow-auto bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Part {currentPassage + 1}</h2>
          <p className="text-slate-600 mb-4">Read the text below and answer the questions.</p>
          
          <h3 className="text-lg font-bold text-slate-800 mb-4">{passage?.title}</h3>
          
          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
            {passage?.text?.split('\n\n').map((para, idx) => (
              <p key={idx} className="mb-4">
                {/^[A-Z]\s/.test(para) ? (
                  <><strong className="text-slate-900">{para.charAt(0)}</strong>{para.slice(1)}</>
                ) : para}
              </p>
            ))}
          </div>
        </div>

        {/* Right Pane - Questions */}
        <div className="w-1/2 overflow-auto bg-slate-50 p-6">
          <div className="space-y-6">
            {passage?.questions?.map((q, idx) => {
              const qNumMatch = q.id.match(/Q(\d+)/);
              const questionNum = qNumMatch ? qNumMatch[1] : idx + 1;
              
              return (
                <div key={q.id} className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="flex gap-3">
                    <span className="font-bold text-slate-900 min-w-[32px]">{questionNum}.</span>
                    <div className="flex-1">
                      <p className="text-slate-700 mb-3">{q.question}</p>
                      
                      {q.type === 'true_false_ng' || q.type === 'yes_no_ng' ? (
                        <div className="space-y-2">
                          {(q.type === 'true_false_ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN']).map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={q.id}
                                value={opt}
                                checked={sectionAnswers.reading[q.id] === opt}
                                onChange={(e) => updateAnswer('reading', q.id, e.target.value)}
                                className="w-4 h-4 text-blue-500"
                              />
                              <span className="text-sm">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : q.type === 'multiple_choice' ? (
                        <div className="space-y-2">
                          {q.options?.map((opt, optIdx) => (
                            <label key={optIdx} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={q.id}
                                value={opt.charAt(0)}
                                checked={sectionAnswers.reading[q.id] === opt.charAt(0)}
                                onChange={(e) => updateAnswer('reading', q.id, e.target.value)}
                                className="w-4 h-4 text-blue-500"
                              />
                              <span className="text-sm">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={sectionAnswers.reading[q.id] || ''}
                          onChange={(e) => updateAnswer('reading', q.id, e.target.value)}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded focus:border-blue-500 focus:outline-none"
                          placeholder="Type your answer..."
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ============ RENDER WRITING SECTION ============
  const renderWritingSection = () => {
    const writing = testData?.sections?.writing;
    const task = writing?.tasks?.[writingTask - 1];
    
    const renderBarChart = (visualData) => {
      if (!visualData || visualData.type !== 'bar_chart') return null;
      const { categories, data, title } = visualData;
      const colors = ['#3B82F6', '#10B981', '#F59E0B'];
      
      return (
        <div className="mt-4 p-4 bg-white border rounded-lg">
          <h4 className="font-semibold text-center text-slate-900 mb-4">{title}</h4>
          <div className="flex justify-center gap-6 mb-4">
            {data.map((item, idx) => (
              <div key={item.sector} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors[idx] }}></div>
                <span className="text-sm text-slate-600">{item.sector}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {categories.map((category, catIdx) => (
              <div key={category} className="flex items-center gap-3">
                <div className="w-28 text-sm text-slate-600 text-right">{category}</div>
                <div className="flex-1 flex gap-1">
                  {data.map((item, idx) => (
                    <div key={item.sector} className="h-6 rounded" style={{ width: `${item.values[catIdx]}%`, backgroundColor: colors[idx], minWidth: item.values[catIdx] > 0 ? '20px' : '0' }}>
                      {item.values[catIdx] > 10 && <span className="text-xs text-white px-1">{item.values[catIdx]}%</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
    
    return (
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Task */}
        <div className="w-1/2 border-r border-slate-300 overflow-auto bg-white p-6">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setWritingTask(1)} className={`px-4 py-2 rounded ${writingTask === 1 ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}>
              Task 1 (20 min)
            </button>
            <button onClick={() => setWritingTask(2)} className={`px-4 py-2 rounded ${writingTask === 2 ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}>
              Task 2 (40 min)
            </button>
          </div>
          
          <h2 className="text-xl font-bold mb-4">Task {writingTask}</h2>
          <p className="text-slate-700 whitespace-pre-wrap mb-4">{task?.prompt}</p>
          {task?.visual_data && renderBarChart(task.visual_data)}
          
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
            <strong>Word limit:</strong> Minimum {task?.word_limit?.min} words
          </div>
        </div>
        
        {/* Right - Writing Area */}
        <div className="w-1/2 overflow-auto bg-slate-50 p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">Your Response</span>
            <Badge className={wordCount[`task${writingTask}`] >= (task?.word_limit?.min || 150) ? 'bg-green-500' : 'bg-slate-400'}>
              {wordCount[`task${writingTask}`]} words
            </Badge>
          </div>
          <Textarea
            className="min-h-[500px] text-sm bg-white"
            placeholder="Write your response here..."
            value={sectionAnswers.writing[`task${writingTask}`]}
            onChange={(e) => {
              const text = e.target.value;
              setSectionAnswers(prev => ({
                ...prev,
                writing: { ...prev.writing, [`task${writingTask}`]: text }
              }));
              setWordCount(prev => ({
                ...prev,
                [`task${writingTask}`]: text.trim().split(/\s+/).filter(Boolean).length
              }));
            }}
          />
        </div>
      </div>
    );
  };

  // ============ RENDER SPEAKING SECTION ============
  const renderSpeakingSection = () => {
    const speaking = testData?.sections?.speaking;
    const currentPartData = speaking?.parts?.[speakingPart - 1];
    const currentQ = currentPartData?.questions?.[speakingQuestion];
    
    return (
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-3xl mx-auto p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Part {speakingPart}</h2>
          <p className="text-slate-600 mb-6">{currentPartData?.description}</p>

          {speakingPart === 2 && currentPartData?.cue_card && (
            <Card className="p-6 bg-amber-50 border-2 border-amber-300 mb-6">
              <h3 className="font-bold text-amber-900 mb-3">Cue Card</h3>
              <p className="text-lg text-slate-800 mb-3">{currentPartData.cue_card.topic}</p>
              <p className="text-sm text-slate-600 mb-2">You should say:</p>
              <ul className="list-disc list-inside space-y-1">
                {currentPartData.cue_card.points?.map((point, idx) => (
                  <li key={idx} className="text-slate-700">{point}</li>
                ))}
              </ul>
            </Card>
          )}

          {(speakingPart === 1 || speakingPart === 3) && (
            <Card className="p-8 text-center bg-slate-50">
              <Headphones className="w-16 h-16 mx-auto text-blue-500 mb-4" />
              <p className="text-lg text-slate-700 mb-2">Listen to the examiner's question</p>
              <p className="text-sm text-slate-500 mb-6">
                Question {speakingQuestion + 1} of {currentPartData?.questions?.length}
              </p>
              <Button
                onClick={() => {
                  if (questionAudioRef.current) {
                    questionAudioRef.current.play();
                    setSpeakingState('PROMPT_PLAYING');
                  }
                }}
                disabled={speakingState !== 'IDLE'}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Volume2 className="w-5 h-5 mr-2" />
                Play Question
              </Button>
              <audio
                ref={questionAudioRef}
                src={currentQ ? `${API_URL}/api/full-test/audio/stream/${testId}/speaking/speaking_p${speakingPart}_${currentQ.id}` : ''}
                onEnded={() => setSpeakingState('IDLE')}
                style={{ display: 'none' }}
              />
            </Card>
          )}

          <Card className="p-6 mt-6">
            {speakingState === 'RECORDING' && (
              <div className="text-3xl font-mono font-bold text-red-600 text-center mb-4">
                {formatTimeShort(questionTimeRemaining)}
              </div>
            )}
            <div className="flex justify-center gap-4">
              {speakingState === 'IDLE' && (
                <Button onClick={startSpeakingRecording} className="bg-red-500 hover:bg-red-600">
                  <Mic className="w-5 h-5 mr-2" /> Start Recording
                </Button>
              )}
              {speakingState === 'RECORDING' && (
                <Button onClick={stopSpeakingRecording} variant="destructive">
                  <Square className="w-5 h-5 mr-2" /> Stop
                </Button>
              )}
              {speakingState === 'READY_NEXT' && (
                <Button onClick={() => {
                  const questions = currentPartData?.questions || [];
                  if (speakingQuestion < questions.length - 1) {
                    setSpeakingQuestion(prev => prev + 1);
                    setSpeakingState('IDLE');
                  } else if (speakingPart < 3) {
                    setSpeakingPart(prev => prev + 1);
                    setSpeakingQuestion(0);
                    setSpeakingState('IDLE');
                  } else {
                    setShowConfirmSubmit(true);
                  }
                }}>
                  <SkipForward className="w-5 h-5 mr-2" /> Next
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // ============ RENDER SECTION START ============
  const renderSectionStart = () => {
    const config = SECTION_CONFIG[currentSection];
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <Card className="max-w-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 capitalize">{currentSection}</h2>
          <p className="text-slate-600 mb-6">Time: {config.totalTime / 60} minutes</p>
          
          <div className="text-left bg-amber-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Instructions
            </h3>
            <ul className="text-sm text-amber-800 space-y-1">
              {currentSection === 'listening' && (
                <>
                  <li>• Audio plays ONCE only - no rewinding</li>
                  <li>• Answer questions as you listen</li>
                  <li>• Transfer answers before time ends</li>
                </>
              )}
              {currentSection === 'reading' && (
                <>
                  <li>• You have 60 minutes for all passages</li>
                  <li>• Suggested: 20 minutes per passage</li>
                </>
              )}
              {currentSection === 'writing' && (
                <>
                  <li>• Task 1: minimum 150 words</li>
                  <li>• Task 2: minimum 250 words</li>
                </>
              )}
              {currentSection === 'speaking' && (
                <>
                  <li>• Listen to questions via audio</li>
                  <li>• Record your answers</li>
                </>
              )}
            </ul>
          </div>
          
          <Button onClick={startSection} size="lg" className="bg-slate-900 hover:bg-slate-800">
            <Play className="w-5 h-5 mr-2" /> Start {currentSection}
          </Button>
        </Card>
      </div>
    );
  };

  // ============ MAIN RENDER ============
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {renderHeader()}
      
      {!timerActive && !completedSections.includes(currentSection) ? (
        renderSectionStart()
      ) : (
        <>
          {currentSection === 'listening' && renderListeningSection()}
          {currentSection === 'reading' && renderReadingSection()}
          {currentSection === 'writing' && renderWritingSection()}
          {currentSection === 'speaking' && renderSpeakingSection()}
        </>
      )}
      
      {timerActive && (currentSection === 'listening' || currentSection === 'reading') && renderNavigationBar()}
      
      {/* Submit button for writing/speaking */}
      {timerActive && (currentSection === 'writing' || currentSection === 'speaking') && (
        <div className="bg-slate-100 border-t p-4 flex justify-end">
          <Button onClick={() => setShowConfirmSubmit(true)} className="bg-green-600 hover:bg-green-700">
            Submit {currentSection} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Submit {currentSection}?</h3>
            <p className="text-slate-600 mb-6">You cannot return to this section after submitting.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>Cancel</Button>
              <Button onClick={submitCurrentSection} disabled={submitting} className="bg-slate-900">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-white">
            <div className="bg-slate-700 text-white px-4 py-2 flex justify-between items-center">
              <span className="font-medium">Settings</span>
              <button onClick={() => setShowSettings(false)} className="text-white hover:text-red-300">✕</button>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-4">Adjust settings to make the test easier to read.</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Text Size</h4>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2"><input type="radio" name="textSize" defaultChecked /> Standard</label>
                    <label className="flex items-center gap-2"><input type="radio" name="textSize" /> Large</label>
                  </div>
                </div>
              </div>
              <Button onClick={() => setShowSettings(false)} className="mt-4 w-full">OK</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg bg-white">
            <div className="bg-slate-700 text-white px-4 py-2 flex justify-between items-center">
              <span className="font-medium">Help</span>
              <button onClick={() => setShowHelp(false)} className="text-white hover:text-red-300">✕</button>
            </div>
            <div className="p-6">
              <h4 className="font-medium mb-2">How to answer questions</h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Click on the answer you think is correct</li>
                <li>• Type your answer in the input boxes</li>
                <li>• Use the navigation bar to move between questions</li>
                <li>• Check "Review" to mark questions for later</li>
              </ul>
              <Button onClick={() => setShowHelp(false)} className="mt-4 w-full">OK</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
