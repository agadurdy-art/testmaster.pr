import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Headphones, BookOpen, PenTool, Mic,
  Clock, Play, Pause, Volume2, Settings, HelpCircle, EyeOff,
  ChevronRight, Timer, AlertTriangle, Target, CheckCircle, RefreshCw,
  Highlighter, StickyNote, X, Edit3, Trash2, ChevronLeft, Send,
  ListChecks, Eye, FileText, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Section time limits in seconds
const SECTION_TIMES = {
  listening: 30 * 60 + 10 * 60, // 40 minutes (30 + 10 transfer)
  reading: 60 * 60, // 60 minutes
  writing: 60 * 60, // 60 minutes
  speaking: 14 * 60 // 14 minutes
};

// Check if user has premium plan
const isPremiumUser = (user) => {
  if (!user) return false;
  return user.plan === 'pro' || user.plan === 'booster' || (user.examCredits ?? 0) > 0;
};

export default function CambridgeTestInterface() {
  const { bookId, testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retry wrong-only mode from results page
  const retryWrongOnly = location.state?.retryWrongOnly || false;
  const wrongQuestions = location.state?.wrongQuestions || {};
  
  // Get user from localStorage for premium check
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch { return null; }
  });
  
  // Get skill from URL query params (for skill-specific practice)
  const searchParams = new URLSearchParams(window.location.search);
  const skillParam = searchParams.get('skill');
  const isSkillMode = !!skillParam;
  
  // Test state
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(skillParam || 'listening');
  const [currentPart, setCurrentPart] = useState(0);
  const [answers, setAnswers] = useState({});
  
  // Highlighter & Notes state (for Reading)
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, text: '', range: null });
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: null, text: '', note: '' });
  
  // Review panel state
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  
  // Settings & Help modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTab, setHelpTab] = useState('information');
  const [screenHidden, setScreenHidden] = useState(false);
  
  // Display settings
  const [textSize, setTextSize] = useState('standard'); // standard, large, extra-large
  const [colorTheme, setColorTheme] = useState('standard'); // standard, yellow-black, blue-white, blue-cream
  
  // Question navigation
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [reviewedQuestions, setReviewedQuestions] = useState({});
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = useRef(null);
  
  // Timer state - use skill-specific time if in skill mode
  const [sectionTimeLeft, setSectionTimeLeft] = useState(SECTION_TIMES[skillParam] || SECTION_TIMES.listening);
  const [testStarted, setTestStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // UI state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [completedSections, setCompletedSections] = useState([]);
  
  // Recording state (for Speaking)
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState({});
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Speaking state machine
  const SPEAKING_STATES = {
    IDLE: 'IDLE',
    LOADING_AUDIO: 'LOADING_AUDIO',
    PLAYING_PROMPT: 'PLAYING_PROMPT',
    READY_TO_RECORD: 'READY_TO_RECORD',
    RECORDING: 'RECORDING',
    RECORDED: 'RECORDED'
  };
  
  // Speaking state for TTS and questions
  const [speakingQuestionIndex, setSpeakingQuestionIndex] = useState(0);
  const [speakingState, setSpeakingState] = useState(SPEAKING_STATES.IDLE);
  const [ttsAudioUrl, setTtsAudioUrl] = useState(null);
  const [part2PrepTime, setPart2PrepTime] = useState(60);
  const [isPreparing, setIsPreparing] = useState(false);
  const [questionPlayCounts, setQuestionPlayCounts] = useState({});  // Track plays per question
  const [questionRecordings, setQuestionRecordings] = useState({});  // Store recordings per question
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef(null);
  const ttsAudioRef = useRef(null);
  
  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [questionEvaluations, setQuestionEvaluations] = useState({});
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showNextQuestion, setShowNextQuestion] = useState(false);

  useEffect(() => {
    loadTest();
  }, [bookId, testId]);

  // Update current section if skill param changes
  useEffect(() => {
    if (skillParam) {
      setCurrentSection(skillParam);
      setSectionTimeLeft(SECTION_TIMES[skillParam] || SECTION_TIMES.listening);
    }
  }, [skillParam]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (testStarted && !showInstructions && sectionTimeLeft > 0) {
      interval = setInterval(() => {
        setSectionTimeLeft(prev => {
          if (prev <= 1) {
            handleSectionTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testStarted, showInstructions, sectionTimeLeft]);

  // Part 2 prep timer effect
  useEffect(() => {
    let interval;
    if (isPreparing && part2PrepTime > 0) {
      interval = setInterval(() => {
        setPart2PrepTime(prev => prev - 1);
      }, 1000);
    } else if (isPreparing && part2PrepTime === 0) {
      setIsPreparing(false);
      toast.info('Preparation time is over. Please start speaking.');
    }
    return () => clearInterval(interval);
  }, [isPreparing, part2PrepTime]);

  const loadTest = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cambridge/test/${bookId}/${testId}`);
      const data = await res.json();
      
      if (data.success) {
        setTestData(data.test);
      } else {
        toast.error('Failed to load test');
      }
    } catch (error) {
      console.error('Error loading test:', error);
      toast.error('Error loading test data');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionTimeUp = () => {
    toast.warning(`Time's up for ${currentSection}!`);
    handleSubmitSection();
  };

  const handleAnswerChange = (questionNum, value) => {
    // Handle compound question numbers like "14-15", "27-28", "29-30"
    const qNumStr = String(questionNum);
    if (qNumStr.includes('-')) {
      const [start, end] = qNumStr.split('-').map(n => parseInt(n, 10));
      // Store value for each individual question in the range
      setAnswers(prev => {
        const newAnswers = { ...prev };
        for (let i = start; i <= end; i++) {
          newAnswers[`${currentSection}_${i}`] = value;
        }
        return newAnswers;
      });
    } else {
      setAnswers(prev => ({
        ...prev,
        [`${currentSection}_${questionNum}`]: value
      }));
    }
  };

  const handleStartTest = () => {
    setShowInstructions(false);
    setTestStarted(true);
    setSectionTimeLeft(SECTION_TIMES[currentSection]);
  };

  const handleSubmitSection = () => {
    setCompletedSections(prev => [...prev, currentSection]);
    
    // In skill mode, go directly to results after submitting the single section
    if (isSkillMode) {
      navigate(`/cambridge-test/${bookId}/${testId}/results`, { 
        state: { 
          answers, 
          testData,
          mode: 'skill',
          skill: skillParam,
          speakingEvaluations: questionEvaluations
        } 
      });
      return;
    }
    
    // Full test mode - continue to next section
    const sectionOrder = ['listening', 'reading', 'writing', 'speaking'];
    const currentIndex = sectionOrder.indexOf(currentSection);
    
    if (currentIndex < sectionOrder.length - 1) {
      const nextSection = sectionOrder[currentIndex + 1];
      setCurrentSection(nextSection);
      setCurrentPart(0);
      setSectionTimeLeft(SECTION_TIMES[nextSection]);
      setShowInstructions(true);
      setShowSubmitModal(false);
    } else {
      // All sections completed - show results
      navigate(`/cambridge-test/${bookId}/${testId}/results`, { 
        state: { answers, testData, mode: 'full', speakingEvaluations: questionEvaluations } 
      });
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
      setAudioCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoaded = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============ HIGHLIGHTER & NOTES FUNCTIONS ============
  const handleTextSelection = (e) => {
    e.preventDefault();
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      setContextMenu({
        show: true,
        x: e.clientX,
        y: e.clientY,
        text: selectedText,
        range: selection.getRangeAt(0).cloneRange()
      });
    }
  };

  const addHighlight = (color = 'yellow') => {
    if (!contextMenu.text) return;
    
    const newHighlight = {
      id: Date.now(),
      text: contextMenu.text,
      color,
      section: currentSection,
      part: currentPart
    };
    
    setHighlights(prev => [...prev, newHighlight]);
    setContextMenu({ show: false, x: 0, y: 0, text: '', range: null });
    window.getSelection().removeAllRanges();
    toast.success('Text highlighted');
  };

  const addNoteToHighlight = () => {
    if (!contextMenu.text) return;
    
    const newId = Date.now();
    const newHighlight = {
      id: newId,
      text: contextMenu.text,
      color: 'blue',
      section: currentSection,
      part: currentPart
    };
    
    setHighlights(prev => [...prev, newHighlight]);
    setCurrentNote({ id: newId, text: contextMenu.text, note: '' });
    setShowNoteModal(true);
    setContextMenu({ show: false, x: 0, y: 0, text: '', range: null });
    window.getSelection().removeAllRanges();
  };

  const saveNote = () => {
    if (!currentNote.note.trim()) {
      toast.error('Please enter a note');
      return;
    }
    
    const newNote = {
      id: currentNote.id,
      text: currentNote.text,
      note: currentNote.note,
      section: currentSection,
      part: currentPart,
      timestamp: new Date().toISOString()
    };
    
    setNotes(prev => [...prev.filter(n => n.id !== currentNote.id), newNote]);
    setShowNoteModal(false);
    setCurrentNote({ id: null, text: '', note: '' });
    toast.success('Note saved');
  };

  const deleteHighlight = (id) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const getAnsweredCount = (section) => {
    const prefix = `${section}_`;
    return Object.keys(answers).filter(k => k.startsWith(prefix) && answers[k]).length;
  };

  const getTotalQuestions = (section) => {
    if (!testData?.sections?.[section]) return 0;
    if (section === 'listening' || section === 'reading') return 40;
    if (section === 'writing') return 2;
    if (section === 'speaking') return 3; // 3 parts
    return 0;
  };

  // ============ REVIEW PANEL ============
  const renderReviewPanel = () => {
    const currentSectionAnswers = Object.entries(answers)
      .filter(([key]) => key.startsWith(`${currentSection}_`))
      .map(([key, value]) => ({
        question: key.replace(`${currentSection}_`, ''),
        answer: value,
        answered: !!value
      }));

    return (
      <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform z-50 ${showReviewPanel ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between bg-slate-100">
          <h3 className="font-bold text-lg">Review Answers</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowReviewPanel(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4 overflow-auto h-[calc(100%-120px)]">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: getTotalQuestions(currentSection) }, (_, i) => {
              const qKey = `${currentSection}_${i + 1}`;
              const isAnswered = !!answers[qKey];
              return (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all
                    ${isAnswered ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                  onClick={() => {
                    // Navigate to question
                    const partIndex = Math.floor(i / 10);
                    setCurrentPart(partIndex);
                  }}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          
          {/* Highlights & Notes Summary */}
          {(highlights.length > 0 || notes.length > 0) && (
            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Your Notes & Highlights</h4>
              <div className="space-y-2 max-h-48 overflow-auto">
                {highlights.filter(h => h.section === currentSection).map(h => {
                  const relatedNote = notes.find(n => n.id === h.id);
                  return (
                    <div key={h.id} className={`p-2 rounded text-xs ${h.color === 'blue' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                      <p className="font-medium truncate">{h.text.substring(0, 40)}...</p>
                      {relatedNote && <p className="text-gray-600 mt-1 italic">{relatedNote.note}</p>}
                      <button onClick={() => deleteHighlight(h.id)} className="text-red-500 text-xs mt-1 hover:underline">
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Answered:</span>
            <span className="font-bold">{getAnsweredCount(currentSection)} / {getTotalQuestions(currentSection)}</span>
          </div>
          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => setShowSubmitModal(true)}>
            Submit {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
          </Button>
        </div>
      </div>
    );
  };

  // Toggle review for a question
  const toggleReview = (questionNum) => {
    setReviewedQuestions(prev => ({
      ...prev,
      [questionNum]: !prev[questionNum]
    }));
  };

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
    
    // Only show for listening and reading
    if (currentSection !== 'listening' && currentSection !== 'reading') {
      return null;
    }
    
    return (
      <div className="bg-slate-100 border-t-2 border-slate-300 px-4 py-2 fixed bottom-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {/* Review checkbox */}
          <label className="flex items-center gap-1 text-sm text-slate-600 mr-2 shrink-0">
            <input 
              type="checkbox" 
              checked={reviewedQuestions[currentQuestion] || false}
              onChange={() => toggleReview(currentQuestion)}
              className="w-4 h-4"
            />
            Review
          </label>
          
          {navData.parts.map((part, partIdx) => (
            <div key={part.label} className="flex items-center gap-1 shrink-0">
              <span className="text-xs font-medium text-slate-700 bg-slate-300 px-2 py-1 rounded">
                {part.label}
              </span>
              {part.questions.map(qNum => {
                const answerKey = currentSection === 'listening' 
                  ? `listening_${qNum}`
                  : `reading_${qNum}`;
                const isAnswered = !!answers[answerKey];
                const isCurrent = currentQuestion === qNum;
                const isReviewed = reviewedQuestions[qNum];
                
                return (
                  <button
                    key={qNum}
                    onClick={() => {
                      setCurrentQuestion(qNum);
                      // Navigate to correct part
                      if (currentSection === 'listening') {
                        setCurrentPart(Math.ceil(qNum / 10) - 1);
                      } else if (currentSection === 'reading') {
                        if (qNum <= 13) setCurrentPart(0);
                        else if (qNum <= 26) setCurrentPart(1);
                        else setCurrentPart(2);
                      }
                      // Scroll to question after state update
                      setTimeout(() => {
                        // First try exact match
                        let el = document.getElementById(`question-${qNum}`);
                        // If not found, try to find group question (e.g., question-24-26 for Q24)
                        if (!el) {
                          const allQuestionDivs = document.querySelectorAll('[id^="question-"]');
                          for (const div of allQuestionDivs) {
                            const idParts = div.id.replace('question-', '').split('-');
                            if (idParts.length === 2) {
                              const start = parseInt(idParts[0]);
                              const end = parseInt(idParts[1]);
                              if (qNum >= start && qNum <= end) {
                                el = div;
                                break;
                              }
                            }
                          }
                        }
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 100);
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
          
          {/* Navigation arrows and Submit */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setCurrentQuestion(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentQuestion(prev => Math.min(40, prev + 1))}
              className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              Submit {currentSection} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Recording functions for Speaking
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(prev => ({
          ...prev,
          [`part${currentPart + 1}`]: url
        }));
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Recording functions for individual Speaking questions
  const startRecordingForQuestion = async (questionIndex) => {
    // Stop any playing audio first
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current.currentTime = 0;
    }
    setTtsAudioUrl(null);
    
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      // Check for supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          // Use part-based key to avoid conflicts between parts
          const recordingKey = `part${currentPart}_q${questionIndex}`;
          setQuestionRecordings(prev => ({
            ...prev,
            [recordingKey]: url
          }));
          // Save to server
          saveRecordingToServer(blob, questionIndex);
        }
        
        // Clear recording timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
        
        setSpeakingState(SPEAKING_STATES.RECORDED);
      };
      
      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        toast.error('Recording error occurred');
        setSpeakingState(SPEAKING_STATES.READY_TO_RECORD);
      };
      
      // Start recording with timeslice for continuous data
      mediaRecorder.start(1000);
      setIsRecording(true);
      setSpeakingState(SPEAKING_STATES.RECORDING);
      setRecordingTime(0);
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone.');
      } else {
        toast.error(`Could not start recording: ${error.message}`);
      }
      setSpeakingState(SPEAKING_STATES.READY_TO_RECORD);
    }
  };

  const stopRecordingForQuestion = (questionIndex) => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        toast.success('Recording stopped');
      } catch (error) {
        console.error('Stop recording error:', error);
        setIsRecording(false);
        setSpeakingState(SPEAKING_STATES.RECORDED);
      }
    }
  };

  const saveRecordingToServer = async (blob, questionIndex) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, `question_${questionIndex}.webm`);
      formData.append('user_id', 'test_user');
      formData.append('test_id', `${bookId}_${testId}`);
      formData.append('section', currentSection);
      formData.append('part', String(currentPart + 1));
      formData.append('question_index', String(questionIndex));
      
      const response = await fetch(`${API_URL}/api/recordings/save`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        console.log('Recording saved to server');
      } else {
        console.error('Failed to save recording to server');
      }
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  };

  // Go to next question in Speaking
  const goToNextSpeakingQuestion = (questions) => {
    if (speakingQuestionIndex < questions.length - 1) {
      setSpeakingQuestionIndex(speakingQuestionIndex + 1);
      setSpeakingState(SPEAKING_STATES.IDLE);
      setRecordingTime(0);
    }
  };

  // Evaluate a speaking response
  const evaluateSpeakingResponse = async (questionIndex, questionText) => {
    const recordingUrl = questionRecordings[questionIndex];
    if (!recordingUrl) {
      toast.error('No recording found. Please record your answer first.');
      return;
    }

    setIsEvaluating(true);

    try {
      // Fetch the blob from the object URL
      const response = await fetch(recordingUrl);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('question', questionText);
      formData.append('part', String(currentPart + 1));
      formData.append('question_index', String(questionIndex));
      // Send user plan for premium evaluation (Azure pronunciation analysis)
      formData.append('user_plan', user?.plan || 'free');

      const evalResponse = await fetch(`${API_URL}/api/cambridge/speaking/evaluate`, {
        method: 'POST',
        body: formData
      });

      const result = await evalResponse.json();

      if (result.success) {
        setQuestionEvaluations(prev => ({
          ...prev,
          [questionIndex]: result
        }));
        setCurrentEvaluation(result);
        setShowEvaluationModal(true);
        toast.success('Evaluation complete!');
      } else {
        toast.error(result.error || 'Evaluation failed');
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Could not evaluate response');
    } finally {
      setIsEvaluating(false);
    }
  };

  const sections = [
    { id: 'listening', label: 'Listening', icon: Headphones, color: 'blue', time: '40 min' },
    { id: 'reading', label: 'Reading', icon: BookOpen, color: 'green', time: '60 min' },
    { id: 'writing', label: 'Writing', icon: PenTool, color: 'purple', time: '60 min' },
    { id: 'speaking', label: 'Speaking', icon: Mic, color: 'orange', time: '14 min' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Test Not Found</h2>
          <p className="text-gray-500 mb-4">The requested test could not be loaded.</p>
          <Button onClick={() => navigate(`/question-bank?openTest=${bookId}_${testId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Test
          </Button>
        </Card>
      </div>
    );
  }

  const sectionData = testData.sections[currentSection];

  // Instructions Screen
  if (showInstructions) {
    const sectionInfo = sections.find(s => s.id === currentSection);
    const Icon = sectionInfo?.icon || Headphones;
    
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full bg-${sectionInfo?.color}-100 flex items-center justify-center mx-auto mb-4`}>
              <Icon className={`w-10 h-10 text-${sectionInfo?.color}-600`} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              IELTS {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
            </h1>
            <p className="text-gray-500">{testData.title}</p>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {sectionData?.total_questions || sectionData?.total_tasks || sectionData?.total_parts || '-'}
                </p>
                <p className="text-sm text-gray-500">
                  {currentSection === 'writing' ? 'Tasks' : currentSection === 'speaking' ? 'Parts' : 'Questions'}
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{sectionInfo?.time}</p>
                <p className="text-sm text-gray-500">Time Limit</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-gray-900">Instructions:</h3>
            {currentSection === 'listening' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• You will hear the recording ONCE only</li>
                <li>• Answer all questions as you listen</li>
                <li>• You will have 10 minutes to transfer your answers</li>
                <li>• Write your answers in the gaps provided</li>
              </ul>
            )}
            {currentSection === 'reading' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Read each passage carefully</li>
                <li>• Answer all 40 questions</li>
                <li>• You may write on the question paper</li>
                <li>• Manage your time - approximately 20 minutes per passage</li>
              </ul>
            )}
            {currentSection === 'writing' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Task 1: Write at least 150 words (20 minutes recommended)</li>
                <li>• Task 2: Write at least 250 words (40 minutes recommended)</li>
                <li>• Answer both tasks</li>
                <li>• Write in formal academic style</li>
              </ul>
            )}
            {currentSection === 'speaking' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Part 1: Introduction and interview (4-5 minutes)</li>
                <li>• Part 2: Individual long turn - speak for 1-2 minutes</li>
                <li>• Part 3: Two-way discussion (4-5 minutes)</li>
                <li>• Speak clearly and at a natural pace</li>
              </ul>
            )}
          </div>
          
          {/* Skill Mode Indicator */}
          {isSkillMode && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-indigo-700 flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span><strong>Skill Practice Mode:</strong> You are practicing only {currentSection}. After completing, you will see your results for this section.</span>
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleStartTest}
            className="w-full h-12 text-lg bg-red-600 hover:bg-red-700"
            data-testid="start-section-btn"
          >
            Start {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} {isSkillMode ? 'Practice' : 'Test'}
          </Button>
        </Card>
      </div>
    );
  }

  // Render Listening Section
  const renderListeningSection = () => {
    const parts = sectionData?.parts || [];
    const currentPartData = parts[currentPart];
    
    if (!currentPartData) return null;

    return (
      <div className="space-y-4">
        {/* Audio Player */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleAudio}
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Part {currentPartData.part_number}: {currentPartData.title}</span>
                <span className="text-xs text-gray-500">{formatTime(audioCurrentTime)} / {formatTime(audioDuration)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
            <Volume2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
          <audio
            ref={audioRef}
            src={currentPartData.audio_file?.startsWith('http') ? currentPartData.audio_file : `${API_URL}${currentPartData.audio_file}`}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoaded}
            onEnded={() => setIsPlaying(false)}
          />
        </Card>

        {/* Part Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {parts.map((part, idx) => (
            <Button
              key={idx}
              variant={currentPart === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPart(idx)}
              className={`flex-shrink-0 ${currentPart === idx ? 'bg-blue-600' : ''}`}
            >
              Part {part.part_number}
            </Button>
          ))}
        </div>

        {/* Questions Card */}
        <Card className="p-6">
          <div className="mb-4">
            <Badge className="bg-blue-100 text-blue-700 mb-2">Questions {currentPartData.question_range}</Badge>
            <h3 className="font-bold text-lg text-gray-900">{currentPartData.title}</h3>
            {currentPartData.instructions && (
              <p className="text-sm text-gray-600 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                {currentPartData.instructions}
              </p>
            )}
          </div>
          
          {/* Map Image - moved inline to render before map_labelling questions */}

          {/* Visual Notes */}
          {currentPartData.visual && currentPartData.visual.type === 'notes' && (
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">{currentPartData.visual.title}</h4>
              {currentPartData.visual.sections?.map((section, sIdx) => (
                <div key={sIdx} className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2 text-sm uppercase tracking-wide">{section.heading}</h5>
                  {section.subsections?.map((sub, subIdx) => (
                    <div key={subIdx} className="ml-4 mb-3">
                      <span className="font-medium text-sm text-blue-700">{sub.name}</span>
                      <ul className="mt-1 space-y-2">
                        {sub.items?.map((item, itemIdx) => (
                          <li key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span className="flex-1">
                              {item.includes('___') ? (
                                renderGapFill(item)
                              ) : item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {section.items && !section.subsections && (
                    <ul className="ml-4 space-y-2">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="flex-1">
                            {item.includes('___') ? renderGapFill(item) : item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Form and Table Visual (for forms with tables like Wayside Camera Club) */}
          {currentPartData.visual && currentPartData.visual.type === 'form_and_table' && (
            <div className="space-y-4 mb-4">
              {/* Form Section */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">{currentPartData.visual.form_title}</h4>
                <div className="space-y-2">
                  {currentPartData.visual.form_fields?.map((field, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2">
                      <span className="font-medium text-gray-700 min-w-[140px]">{field.label}</span>
                      <span className="text-gray-700 flex-1">
                        {field.value.includes('___') ? renderGapFill(field.value) : field.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Table Section */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <h4 className="font-semibold text-gray-800 p-3 bg-slate-100 border-b">{currentPartData.visual.table_title}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {currentPartData.visual.table_headers?.map((header, hIdx) => (
                          <th key={hIdx} className="px-3 py-2 text-left font-medium text-gray-700 border-b">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentPartData.visual.table_rows?.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b hover:bg-gray-50">
                          {row.cells?.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 text-gray-700 align-top whitespace-pre-line">
                              {cell.includes('___') ? renderGapFill(cell) : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Table Visual (for Part 1 Job tables, etc.) */}
          {currentPartData.table && (
            <div className="bg-white rounded-lg border mb-4 overflow-hidden">
              <h4 className="font-semibold text-gray-800 p-3 bg-slate-100 border-b">{currentPartData.table.title}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {currentPartData.table.headers?.map((header, hIdx) => (
                        <th key={hIdx} className="px-3 py-2 text-left font-medium text-gray-700 border-b">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentPartData.table.rows?.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b hover:bg-gray-50">
                        {row.cells?.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 text-gray-700 align-top whitespace-pre-line">
                            {cell.includes('___') ? renderGapFill(cell) : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Render questions in original order */}
          {currentPartData.questions?.map((q, qIdx) => {
            // Multiple Selection Questions (e.g., Q21-22)
            if (q.type === 'multiple_selection') {
              const questionKey = `listening_${q.number}`;
              const currentAnswers = Array.isArray(answers[questionKey]) ? answers[questionKey] : [];
              const maxSelections = q.select_count || q.answer_count || 2;
              
              return (
                <div key={qIdx} className="mb-6 p-4 bg-white border rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">{q.instruction}</p>
                  <p className="font-medium mb-3 text-gray-900">{q.number}. {q.question_text || q.question}</p>
                  <div className="space-y-2">
                    {q.options?.map((opt, optIdx) => {
                      const optValue = opt.charAt(0);
                      const isChecked = currentAnswers.includes(optValue);
                      
                      return (
                        <label key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${isChecked ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}>
                          <input
                            type="checkbox"
                            value={optValue}
                            checked={isChecked}
                            onChange={(e) => {
                              let newAnswers;
                              if (e.target.checked) {
                                if (currentAnswers.length < maxSelections) {
                                  newAnswers = [...currentAnswers, optValue];
                                } else {
                                  return; // Max selections reached
                                }
                              } else {
                                newAnswers = currentAnswers.filter(v => v !== optValue);
                              }
                              // Store as array directly without splitting
                              setAnswers(prev => ({
                                ...prev,
                                [questionKey]: newAnswers
                              }));
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select {maxSelections} options ({currentAnswers.length}/{maxSelections} selected)</p>
                </div>
              );
            }
            
            // Matching Questions (e.g., Q16-20)
            if (q.type === 'matching') {
              // Support both options_box and direct options array
              const optionsArray = q.options_box?.options || q.options || [];
              const optionsTitle = q.options_box?.title || q.options_title || 'Options';
              
              return (
                <div key={qIdx} className="mb-6 p-4 bg-white border rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-2">{q.instruction}</p>
                  
                  {/* Options Box - show available choices */}
                  {optionsArray.length > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-sm mb-3 text-blue-800">{optionsTitle}</h5>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {optionsArray.map((opt, oIdx) => (
                          <div key={oIdx} className="text-gray-700">{opt}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {q.items?.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <span className="font-bold text-blue-600 w-8">{item.number}.</span>
                        <span className="flex-1 text-sm font-medium">{item.item}</span>
                        <select
                          value={answers[`listening_${item.number}`] || ''}
                          onChange={(e) => handleAnswerChange(item.number, e.target.value)}
                          className="w-20 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          {optionsArray.map((opt, oIdx) => {
                            const letter = opt.charAt(0);
                            return <option key={letter} value={letter}>{letter}</option>;
                          })}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            // Multiple Choice Questions (e.g., Q28-30)
            if (q.type === 'multiple_choice' && (q.question || q.question_text)) {
              return (
                <div key={qIdx} className="mb-6 p-4 bg-white border rounded-lg">
                  <p className="font-medium mb-3 text-gray-900">{q.number}. {q.question_text || q.question}</p>
                  <div className="space-y-2">
                    {q.options?.map((opt, optIdx) => (
                      <label key={optIdx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border transition-colors">
                        <input
                          type="radio"
                          name={`listening_q${q.number}`}
                          value={opt.charAt(0)}
                          checked={answers[`listening_${q.number}`] === opt.charAt(0)}
                          onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            }

            // Map Labelling Questions (e.g., Q15-20)
            if (q.type === 'map_labelling') {
              // Show map image before the first map_labelling question
              const isFirstMapQ = qIdx === 0 || currentPartData.questions[qIdx - 1]?.type !== 'map_labelling';
              return (
                <React.Fragment key={qIdx}>
                  {isFirstMapQ && currentPartData.map_image && (
                    <div className="mb-4 bg-white rounded-lg border overflow-hidden">
                      <div className="bg-blue-50 px-4 py-2 border-b">
                        <h4 className="text-sm font-semibold text-blue-800">
                          {currentPartData.map_instruction || 'Label the map below'}
                        </h4>
                      </div>
                      <img 
                        src={currentPartData.map_image}
                        alt="Map for labelling"
                        className="w-full max-w-2xl mx-auto p-2"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="mb-4 p-3 bg-white border rounded-lg flex items-center gap-4">
                    <span className="font-bold text-blue-600 w-8">{q.number}.</span>
                    <span className="flex-1 text-sm">{q.question_text}</span>
                    <select
                      data-testid={`listening-q${q.number}-select`}
                      value={answers[`listening_${q.number}`] || ''}
                      onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-</option>
                      {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </React.Fragment>
              );
            }
            
            return null;
          })}
        </Card>
      </div>
    );
  };

  // Helper function for gap fill questions
  const renderGapFill = (text) => {
    const parts = text.split(/___(\d+)___/);
    return parts.map((part, idx) => {
      if (/^\d+$/.test(part)) {
        return (
          <input
            key={idx}
            type="text"
            value={answers[`${currentSection}_${part}`] || ''}
            onChange={(e) => handleAnswerChange(part, e.target.value)}
            className="w-32 mx-1 px-3 py-1 border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-center font-medium"
            placeholder={part}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // Render Reading Section
  const renderReadingSection = () => {
    const passages = sectionData?.passages || [];
    const currentPassage = passages[currentPart];
    
    if (!currentPassage) return null;

    return (
      <div className="flex h-[calc(100vh-200px)] relative">
        {/* Left Pane - Passage with Highlighter */}
        <div 
          className="w-1/2 border-r border-slate-300 overflow-auto bg-white p-6"
          onContextMenu={handleTextSelection}
        >
          {/* Passage Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-green-100 text-green-700">Passage {currentPassage.passage_number}</Badge>
            <div className="flex gap-1">
              {passages.map((_, idx) => (
                <Button
                  key={idx}
                  variant={currentPart === idx ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPart(idx)}
                  className={currentPart === idx ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  P{idx + 1}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Highlights & Notes Panel */}
          {highlights.filter(h => h.section === 'reading').length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-800 flex items-center gap-2">
                  <Highlighter className="w-4 h-4" /> Your Highlights
                </span>
                <button 
                  onClick={() => {
                    setHighlights(prev => prev.filter(h => h.section !== 'reading'));
                    setNotes(prev => prev.filter(n => n.section !== 'reading'));
                  }}
                  className="text-xs text-amber-600 hover:text-amber-800"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-1 max-h-24 overflow-auto">
                {highlights.filter(h => h.section === 'reading').map(h => {
                  const relatedNote = notes.find(n => n.id === h.id);
                  return (
                    <div key={h.id} className="flex items-start gap-2 text-xs">
                      <span className={`px-1 rounded flex-1 ${h.color === 'blue' ? 'bg-blue-200' : 'bg-yellow-200'}`}>
                        &ldquo;{h.text.substring(0, 50)}...&rdquo;
                      </span>
                      {relatedNote && (
                        <span className="text-gray-500 italic max-w-[100px] truncate">
                          📝 {relatedNote.note}
                        </span>
                      )}
                      <button onClick={() => deleteHighlight(h.id)} className="text-red-500 hover:text-red-700">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <h3 className="text-lg font-bold text-slate-800 mb-4">{currentPassage.title}</h3>
          {currentPassage.subtitle && (
            <p className="text-sm text-gray-500 italic mb-4">{currentPassage.subtitle}</p>
          )}
          
          {/* Passage Text - Selectable */}
          <div className="prose prose-sm max-w-none select-text">
            {(currentPassage.text || currentPassage.passage_text)?.split('\n\n').map((para, idx) => {
              // Check if paragraph starts with a section heading (A, B, C, etc.)
              const headingMatch = para.match(/^([A-Z])\n/);
              const isHeading = headingMatch !== null;
              const headingLetter = headingMatch ? headingMatch[1] : null;
              const paragraphText = isHeading ? para.substring(2) : para;
              
              // Check if any highlights exist in this paragraph
              const paraHighlights = highlights.filter(h => 
                h.section === 'reading' && para.includes(h.text)
              );
              
              let displayText = paragraphText;
              paraHighlights.forEach(h => {
                const color = h.color === 'blue' ? 'bg-blue-200' : 'bg-yellow-200';
                displayText = displayText.replace(
                  h.text,
                  `<mark class="${color} px-0.5 rounded">${h.text}</mark>`
                );
              });
              
              return (
                <div key={idx} className="mb-4">
                  {isHeading && (
                    <h3 className="font-bold text-lg text-green-700 mb-2">{headingLetter}</h3>
                  )}
                  <p 
                    className="text-gray-700 leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{ __html: displayText }}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Tip */}
          <div className="mt-4 p-2 bg-slate-100 rounded text-xs text-slate-500 flex items-center gap-2">
            <Highlighter className="w-4 h-4" />
            Tip: Select text and right-click to highlight or add notes
          </div>
        </div>

        {/* Right Pane - Questions */}
        <div className="w-1/2 overflow-auto bg-slate-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-green-100 text-green-700">Questions {currentPassage.question_range}</Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowReviewPanel(true)}
              className="flex items-center gap-2"
            >
              <ListChecks className="w-4 h-4" />
              Review ({getAnsweredCount('reading')}/40)
            </Button>
          </div>

          {currentPassage.questions?.map((q, qIdx) => (
            <div key={qIdx} id={`question-${q.number}`} className="mb-6">
              {/* Note Completion */}
              {q.type === 'note_completion' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  {q.instruction && <p className="text-sm text-green-700 font-medium mb-3">{q.instruction}</p>}
                  {q.visual ? (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800">{q.visual.title}</h5>
                      {q.visual.sections?.map((section, sIdx) => (
                        <div key={sIdx}>
                          <h6 className="font-medium text-gray-700 text-sm mb-2">{section.heading}</h6>
                          <ul className="space-y-2">
                            {section.items?.map((item, itemIdx) => (
                              <li key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                <span className="flex-1">
                                  {item.includes('___') ? renderGapFill(item) : item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Single question format - text input */
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-600">{q.number}.</span>
                      <span className="text-sm">{q.question_text}</span>
                      <input
                        type="text"
                        value={answers[`reading_${q.number}`] || ''}
                        onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                        className="flex-1 max-w-[200px] px-3 py-2 border rounded-lg text-sm"
                        placeholder="Your answer"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* True/False/Not Given */}
              {q.type === 'true_false_not_given' && (
                <div className="space-y-3">
                  {q.instruction && <p className="text-sm text-green-700 font-medium">{q.instruction}</p>}
                  {/* Handle grouped statements OR single question */}
                  {(q.statements || q.items) ? (
                    (q.statements || q.items).map((stmt, sIdx) => (
                      <div key={sIdx} className="p-4 bg-white border rounded-lg">
                        <p className="text-sm mb-3">{stmt.number}. {stmt.statement}</p>
                        <div className="flex gap-4">
                          {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`reading_q${stmt.number}`}
                                value={opt}
                                checked={answers[`reading_${stmt.number}`] === opt}
                                onChange={(e) => handleAnswerChange(stmt.number, e.target.value)}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-sm font-medium">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Single question format */
                    <div className="p-4 bg-white border rounded-lg">
                      <p className="text-sm mb-3">{q.number}. {q.statement}</p>
                      <div className="flex gap-4">
                        {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`reading_q${q.number}`}
                              value={opt}
                              checked={answers[`reading_${q.number}`] === opt}
                              onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Yes/No/Not Given */}
              {q.type === 'yes_no_not_given' && (
                <div className="space-y-3">
                  {q.instruction && <p className="text-sm text-green-700 font-medium">{q.instruction}</p>}
                  {/* Handle grouped statements OR single question */}
                  {(q.statements || q.items) ? (
                    (q.statements || q.items).map((stmt, sIdx) => (
                      <div key={sIdx} className="p-4 bg-white border rounded-lg">
                        <p className="text-sm mb-3">{stmt.number}. {stmt.statement}</p>
                        <div className="flex gap-4">
                          {['YES', 'NO', 'NOT GIVEN'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`reading_q${stmt.number}`}
                                value={opt}
                                checked={answers[`reading_${stmt.number}`] === opt}
                                onChange={(e) => handleAnswerChange(stmt.number, e.target.value)}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-sm font-medium">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Single question format */
                    <div className="p-4 bg-white border rounded-lg">
                      <p className="text-sm mb-3">{q.number}. {q.statement}</p>
                      <div className="flex gap-4">
                        {['YES', 'NO', 'NOT GIVEN'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`reading_q${q.number}`}
                              value={opt}
                              checked={answers[`reading_${q.number}`] === opt}
                              onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Section Matching */}
              {q.type === 'section_matching' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.items?.map((item, iIdx) => (
                    <div key={iIdx} className="p-3 bg-white border rounded-lg flex items-center gap-3">
                      <span className="font-bold text-green-600 w-8">{item.number}.</span>
                      <span className="text-sm flex-1">{item.item}</span>
                      <select
                        value={answers[`reading_${item.number}`] || ''}
                        onChange={(e) => handleAnswerChange(item.number, e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-sm"
                      >
                        <option value="">-</option>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Information */}
              {q.type === 'matching_information' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.items?.map((item, iIdx) => (
                    <div key={iIdx} className="p-3 bg-white border rounded-lg flex items-start gap-3">
                      <span className="font-bold text-green-600 w-8 flex-shrink-0">{item.number}.</span>
                      <span className="text-sm flex-1">{item.text || item.question_text}</span>
                      <select
                        value={answers[`reading_${item.number}`] || ''}
                        onChange={(e) => handleAnswerChange(item.number, e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-sm flex-shrink-0"
                      >
                        <option value="">-</option>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Features (Researcher/Person Matching) */}
              {q.type === 'matching_features' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {/* Options title and list if provided */}
                  {(q.options_title || q.researchers) && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-sm mb-2 text-green-800">{q.options_title || 'List of Researchers'}</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="text-gray-700">{opt}</div>
                        ))}
                        {q.researchers?.map((r, rIdx) => (
                          <div key={rIdx} className="text-gray-700">
                            <span className="font-bold">{r.letter}</span> - {r.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {q.items?.map((item, iIdx) => (
                    <div key={iIdx} className="p-3 bg-white border rounded-lg flex items-start gap-3">
                      <span className="font-bold text-green-600 w-8 flex-shrink-0">{item.number}.</span>
                      <span className="text-sm flex-1">{item.statement || item.text}</span>
                      <select
                        value={answers[`reading_${item.number}`] || ''}
                        onChange={(e) => handleAnswerChange(item.number, e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-sm flex-shrink-0"
                      >
                        <option value="">-</option>
                        {/* Support both researchers array and options array */}
                        {q.researchers?.map(r => (
                          <option key={r.letter} value={r.letter}>{r.letter}</option>
                        ))}
                        {!q.researchers && q.options?.map((opt, oIdx) => {
                          const letter = opt.charAt(0);
                          return <option key={letter} value={letter}>{letter}</option>;
                        })}
                        {!q.researchers && !q.options && ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Sentence Completion */}
              {q.type === 'sentence_completion' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.title && <h5 className="font-semibold text-gray-800">{q.title}</h5>}
                  {(q.sentences || q.items)?.map((sent, sIdx) => {
                    const sentText = sent.text || sent.sentence || '';
                    // Replace simple _____ with numbered format ___N___
                    const normalizedText = sentText.replace(/_____+/g, `___${sent.number}___`);
                    
                    return (
                      <div key={sIdx} className="p-3 bg-white border rounded-lg flex items-start gap-2">
                        <span className="font-bold text-green-600 shrink-0">{sent.number}.</span>
                        <span className="text-sm flex-1">
                          {normalizedText.includes('___') ? (
                            normalizedText.split(/___(\d+)___/).map((part, pIdx) => {
                              if (/^\d+$/.test(part)) {
                                return (
                                  <input
                                    key={pIdx}
                                    type="text"
                                    value={answers[`reading_${part}`] || ''}
                                    onChange={(e) => handleAnswerChange(part, e.target.value)}
                                    className="w-32 mx-1 px-3 py-1 border-2 border-green-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none bg-white text-center font-medium"
                                    placeholder={part}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                  />
                                );
                              }
                              return <span key={pIdx}>{part}</span>;
                            })
                          ) : (
                            <>
                              {sentText}
                              <input
                                type="text"
                                value={answers[`reading_${sent.number}`] || ''}
                                onChange={(e) => handleAnswerChange(sent.number, e.target.value)}
                                className="w-32 ml-2 px-2 py-1 border-b-2 border-green-300 focus:border-green-600 outline-none"
                                placeholder="answer"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                              />
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table Completion */}
              {q.type === 'table_completion' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.title && <h5 className="font-semibold text-gray-800 text-center">{q.title}</h5>}
                  {q.table && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-green-50">
                            {q.table.headers?.map((header, hIdx) => (
                              <th key={hIdx} className="border border-green-200 px-3 py-2 text-left font-semibold text-green-800">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {q.table.rows?.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="border border-green-200 px-3 py-2 font-medium text-gray-700">
                                {row.label}
                              </td>
                              {row.cells?.map((cell, cIdx) => (
                                <td key={cIdx} className="border border-green-200 px-3 py-2 text-gray-700">
                                  {cell.includes('___') ? (
                                    <span>
                                      {cell.split(/___(\d+)___/).map((part, pIdx) => {
                                        if (/^\d+$/.test(part)) {
                                          return (
                                            <input
                                              key={pIdx}
                                              type="text"
                                              value={answers[`reading_${part}`] || ''}
                                              onChange={(e) => handleAnswerChange(part, e.target.value)}
                                              className="mx-1 px-2 py-1 border-b-2 border-green-400 bg-green-50 text-center w-24 focus:outline-none focus:border-green-600"
                                              placeholder={part}
                                            />
                                          );
                                        }
                                        return <span key={pIdx}>{part}</span>;
                                      })}
                                    </span>
                                  ) : cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Completion */}
              {q.type === 'summary_completion' && (
                <div className="space-y-3">
                  {q.instruction && <p className="text-sm text-green-700 font-medium">{q.instruction}</p>}
                  {/* Word box - supports both formats */}
                  {(q.options || q.word_box) && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-sm mb-2 text-green-800">Word List</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx}>{opt}</div>
                        ))}
                        {q.word_box?.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="text-gray-700">
                            <span className="font-bold">{opt.letter}</span> - {opt.word}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Title if present */}
                  {q.title && (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <h5 className="font-bold text-center text-gray-900">{q.title}</h5>
                    </div>
                  )}
                  {/* Summary text - supports both formats */}
                  {(q.summary || q.summary_text) ? (
                    <div className="p-4 bg-white border rounded-lg">
                      {(q.summary?.title || q.title) && <h5 className="font-semibold mb-2">{q.summary?.title || q.title}</h5>}
                      <p className="text-sm leading-relaxed">
                        {(() => {
                          let text = q.summary?.text || q.summary_text;
                          // Normalize "31 _____" format to "___31___" format
                          text = text.replace(/(\d+)\s+_____/g, '___$1___');
                          // Also normalize "___6___" style (already correct) - no-op
                          return text.split(/___(\d+)___/).map((part, pIdx) => {
                          if (/^\d+$/.test(part)) {
                            const wordOptions = q.word_box?.options || q.options || [];
                            // If no word options, use text input (ONE WORD ONLY from passage)
                            if (wordOptions.length === 0) {
                              return (
                                <input
                                  key={pIdx}
                                  type="text"
                                  placeholder={part}
                                  value={answers[`reading_${part}`] || ''}
                                  onChange={(e) => handleAnswerChange(part, e.target.value)}
                                  className="mx-1 px-2 py-1 border-b-2 border-green-400 bg-green-50 text-center w-24 focus:outline-none focus:border-green-600"
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck="false"
                                />
                              );
                            }
                            // If word options provided, use dropdown
                            return (
                              <select
                                key={pIdx}
                                value={answers[`reading_${part}`] || ''}
                                onChange={(e) => handleAnswerChange(part, e.target.value)}
                                className="mx-1 px-2 py-1 border rounded text-sm"
                              >
                                <option value="">({part})</option>
                                {Array.isArray(wordOptions) && wordOptions[0]?.letter
                                  ? wordOptions.map(opt => (
                                      <option key={opt.letter} value={opt.letter}>{opt.letter}</option>
                                    ))
                                  : wordOptions.map((opt, idx) => (
                                      <option key={idx} value={opt}>{opt}</option>
                                    ))
                                }
                              </select>
                            );
                          }
                          return <span key={pIdx}>{part}</span>;
                        });
                        })()}
                      </p>
                    </div>
                  ) : (
                    /* Single question format - just text input */
                    <div className="p-4 bg-white border rounded-lg flex items-center gap-3">
                      <span className="font-bold text-green-600">{q.number}.</span>
                      <span className="text-sm flex-1">{q.question_text}</span>
                      <input
                        type="text"
                        value={answers[`reading_${q.number}`] || ''}
                        onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                        className="w-32 px-3 py-2 border rounded-lg text-sm"
                        placeholder="Your answer"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Choice - Reading */}
              {q.type === 'multiple_choice' && (
                <div className="space-y-4">
                  {q.instruction && <p className="text-sm text-green-700 font-medium">{q.instruction}</p>}
                  {/* Handle grouped questions OR single question */}
                  {(q.questions || q.items) ? (
                    (q.questions || q.items).map((mcq, mIdx) => (
                      <div key={mIdx} className="p-4 bg-white border rounded-lg">
                        <p className="text-sm font-medium mb-3">{mcq.number}. {mcq.question || mcq.question_text}</p>
                        <div className="space-y-2">
                          {mcq.options?.map((opt, oIdx) => (
                            <label key={oIdx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name={`reading_q${mcq.number}`}
                                value={opt.charAt(0)}
                                checked={answers[`reading_${mcq.number}`] === opt.charAt(0)}
                                onChange={(e) => handleAnswerChange(mcq.number, e.target.value)}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-sm">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Single question format */
                    <div className="p-4 bg-white border rounded-lg">
                      <p className="text-sm font-medium mb-3">{q.number}. {q.question || q.question_text}</p>
                      <div className="space-y-2">
                        {q.options?.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`reading_q${q.number}`}
                              value={opt.charAt(0)}
                              checked={answers[`reading_${q.number}`] === opt.charAt(0)}
                              onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Selection - Reading */}
              {q.type === 'multiple_selection' && (
                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-xs text-green-600 font-medium mb-1">{q.instruction}</p>
                  <p className="text-sm font-medium mb-3"><span className="text-green-700 font-bold">{q.number}.</span> {q.question_text || q.question}</p>
                  {/* Show which question numbers to fill */}
                  {q.items && (
                    <p className="text-xs text-gray-500 mb-2">
                      Questions {q.items.map(i => i.number).join(' and ')}: Select {q.select_count || 2} answers
                    </p>
                  )}
                  <div className="space-y-2">
                    {(() => {
                      const answerKey = q.items ? `reading_${q.items[0].number}` : `reading_${q.number}`;
                      const currentAnswers = Array.isArray(answers[answerKey]) ? answers[answerKey] : [];
                      const maxSelections = q.select_count || 2;
                      
                      return q.options?.map((opt, oIdx) => {
                        const optValue = opt.charAt(0);
                        const isChecked = currentAnswers.includes(optValue);
                        
                        return (
                          <label key={oIdx} className={`flex items-center gap-3 p-2 rounded cursor-pointer ${isChecked ? 'bg-green-50 border border-green-300' : 'hover:bg-gray-50'}`}>
                            <input
                              type="checkbox"
                              value={optValue}
                              checked={isChecked}
                              onChange={(e) => {
                                let newAnswers;
                                if (e.target.checked) {
                                  if (currentAnswers.length < maxSelections) {
                                    newAnswers = [...currentAnswers, optValue];
                                  } else {
                                    return; // Max reached
                                  }
                                } else {
                                  newAnswers = currentAnswers.filter(v => v !== optValue);
                                }
                                setAnswers(prev => ({
                                  ...prev,
                                  [answerKey]: newAnswers
                                }));
                              }}
                              className="w-4 h-4 text-green-600 rounded"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      });
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select {q.select_count || 2} options ({(Array.isArray(answers[q.items ? `reading_${q.items[0].number}` : `reading_${q.number}`]) ? answers[q.items ? `reading_${q.items[0].number}` : `reading_${q.number}`] : []).length}/{q.select_count || 2} selected)
                  </p>
                </div>
              )}

              {/* Generic Question Types - fallback for individual questions without items array */}
              {['true_false_notgiven', 'yes_no_notgiven'].includes(q.type) && !q.items && !q.statements && (
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-green-600 w-8">{q.number}.</span>
                    <div className="flex-1">
                      <p className="text-sm mb-3">{q.question_text || q.statement || q.item}</p>
                      <div className="flex gap-4">
                        {(q.type === 'true_false_notgiven' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN']).map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`reading_q${q.number}`}
                              value={opt}
                              checked={answers[`reading_${q.number}`] === opt}
                              onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Context Menu for Highlighting */}
        {contextMenu.show && (
          <div 
            className="fixed bg-white shadow-xl rounded-lg border p-2 z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => addHighlight('yellow')}
                className="flex items-center gap-2 px-3 py-2 hover:bg-yellow-100 rounded text-sm"
              >
                <Highlighter className="w-4 h-4 text-yellow-600" />
                Highlight Yellow
              </button>
              <button 
                onClick={() => addHighlight('blue')}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-100 rounded text-sm"
              >
                <Highlighter className="w-4 h-4 text-blue-600" />
                Highlight Blue
              </button>
              <button 
                onClick={addNoteToHighlight}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm"
              >
                <StickyNote className="w-4 h-4 text-gray-600" />
                Add Note
              </button>
              <button 
                onClick={() => setContextMenu({ show: false, x: 0, y: 0, text: '', range: null })}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm text-gray-500"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Writing Section
  const renderWritingSection = () => {
    const tasks = sectionData?.tasks || [];
    const currentTask = tasks[currentPart];
    
    if (!currentTask) return null;

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {tasks.map((task, idx) => (
            <Button
              key={idx}
              variant={currentPart === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPart(idx)}
              className={currentPart === idx ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Task {task.task_number}
            </Button>
          ))}
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="bg-purple-100 text-purple-700 mb-2">{currentTask.title}</Badge>
              <h3 className="font-bold text-lg text-gray-900">{currentTask.task_type === 'report' ? 'Report' : currentTask.type === 'map_comparison' ? 'Map Description' : 'Essay'}</h3>
            </div>
          </div>

          {/* Task 1 - Simple rubric with visuals */}
          {currentTask.task_number === 1 && (
            <>
              {/* Full instruction/prompt from PDF */}
              <div className="mb-4 p-5 border border-gray-800 bg-white">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                  {currentTask.prompt || currentTask.instruction}
                </p>
              </div>
              
              {/* Two maps/images side by side (for map comparison tasks) */}
              {currentTask.visual_url && currentTask.visual_url_2 && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b">
                      <h4 className="text-sm font-semibold text-gray-700 text-center">20 years ago</h4>
                    </div>
                    <img 
                      src={currentTask.visual_url}
                      alt="Map - 20 years ago" 
                      className="max-w-full mx-auto p-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b">
                      <h4 className="text-sm font-semibold text-gray-700 text-center">Now</h4>
                    </div>
                    <img 
                      src={currentTask.visual_url_2}
                      alt="Map - Now" 
                      className="max-w-full mx-auto p-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                </div>
              )}

              {/* Single visual + textarea side by side */}
              {currentTask.visual_url && !currentTask.visual_url_2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border shadow-sm overflow-hidden h-fit sticky top-4">
                    <div className="bg-gray-100 px-3 py-1.5 border-b">
                      <h4 className="text-xs font-semibold text-gray-600 text-center">Visual Reference</h4>
                    </div>
                    <img 
                      src={currentTask.visual_url.startsWith('http') ? currentTask.visual_url : `${API_URL}${currentTask.visual_url}`}
                      alt="Task 1 Visual" 
                      className="w-full h-auto p-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
                    <textarea
                      data-testid="writing-task1-textarea"
                      value={answers[`writing_task${currentTask.task_number}`] || ''}
                      onChange={(e) => setAnswers(prev => ({
                        ...prev,
                        [`writing_task${currentTask.task_number}`]: e.target.value
                      }))}
                      className="w-full h-80 p-4 border rounded-lg resize-vertical focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                      placeholder="Write your response here..."
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-500">
                        Word count: <span className="font-medium text-gray-700">
                          {(answers[`writing_task${currentTask.task_number}`] || '').split(/\s+/).filter(Boolean).length}
                        </span>
                      </span>
                      <span className="text-gray-500">Target: {currentTask.word_count}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Visual data - Image with improved presentation (only if no visual_url) */}
              {currentTask.visual && !currentTask.visual_url && (
                <div className="mb-4 bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b">
                    <h4 className="text-sm font-semibold text-gray-700 text-center">
                      {currentTask.visual.title || 'Visual Reference'}
                    </h4>
                  </div>
                  {currentTask.visual.image_url && (
                    <img 
                      src={currentTask.visual.image_url.startsWith('http') ? currentTask.visual.image_url : `${API_URL}${currentTask.visual.image_url}`} 
                      alt="Task 1 Visual" 
                      className="max-w-full mx-auto p-2"
                    />
                  )}
                </div>
              )}
              
              {/* External image URL (for tests with direct URLs) - legacy support */}
              {currentTask.image_url && !currentTask.visual && !currentTask.visual_url && (
                <div className="mb-4 bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b">
                    <h4 className="text-sm font-semibold text-gray-700 text-center">
                      Visual Reference
                    </h4>
                  </div>
                  <img 
                    src={currentTask.image_url} 
                    alt="Task 1 Visual" 
                    className="max-w-full mx-auto p-2"
                    onError={(e) => {
                      console.error('Failed to load image:', currentTask.image_url);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Task 2 - Essay format with separate sections */}
          {currentTask.task_number === 2 && (
            <>
              {/* Instruction */}
              <p className="text-gray-700 mb-4 whitespace-pre-line">
                {currentTask.instruction}
              </p>
              
              {/* Essay Prompt - Cambridge Style: thin black border */}
              <div className="mb-4 p-5 border border-gray-800 bg-white">
                <p className="font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
                  {currentTask.prompt}
                </p>
              </div>
              
              {/* Requirements */}
              <p className="text-gray-700 mb-4 whitespace-pre-line">
                {currentTask.requirements}
              </p>
            </>
          )}

          {/* Side by Side Images for Map Comparison (only for Task 2 or tasks without visual_url) */}
          {currentTask.task_number !== 1 && currentTask.visual_data?.type === 'side_by_side_images' && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTask.visual_data.images.map((img, idx) => (
                  <div key={idx} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 border-b">
                      <h4 className="text-sm font-semibold text-gray-700 text-center">{img.title}</h4>
                    </div>
                    <img 
                      src={`${API_URL}/api/visuals/image/${img.image_url.replace('.png', '')}`}
                      alt={img.title}
                      className="w-full h-auto"
                      onError={(e) => {
                        console.error('Failed to load image:', img.image_url);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single Image Visual - legacy (only for Task 2 or tasks without visual_url) */}
          {currentTask.task_number !== 1 && currentTask.visual_data?.type === 'image' && (
            <div className="mb-6">
              <img 
                src={`${API_URL}/api/visuals/image/${currentTask.visual_data.image_url.replace('.png', '')}`}
                alt={currentTask.visual_data.title || 'Visual'}
                className="w-full max-w-3xl mx-auto rounded-lg border shadow-sm"
                onError={(e) => {
                  console.error('Failed to load image:', currentTask.visual_data.image_url);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Generic textarea - skip for Task 1 with single visual (already has inline textarea) */}
          {!(currentTask.task_number === 1 && currentTask.visual_url && !currentTask.visual_url_2) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
            <textarea
              data-testid={`writing-task${currentTask.task_number}-textarea`}
              value={answers[`writing_task${currentTask.task_number}`] || ''}
              onChange={(e) => setAnswers(prev => ({
                ...prev,
                [`writing_task${currentTask.task_number}`]: e.target.value
              }))}
              className="w-full h-80 p-4 border rounded-lg resize-vertical focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="Write your response here..."
            />
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-500">
                Word count: <span className="font-medium text-gray-700">
                  {(answers[`writing_task${currentTask.task_number}`] || '').split(/\s+/).filter(Boolean).length}
                </span>
              </span>
              <span className="text-gray-500">Target: {currentTask.word_count}</span>
            </div>
          </div>
          )}
        </Card>
      </div>
    );
  };

  // Generate TTS for current question
  const playQuestionAudio = async (questionText, isFirst = false) => {
    const playKey = `part${currentPart}_q${speakingQuestionIndex}`;
    const playCount = questionPlayCounts[playKey] || 0;
    if (playCount >= 2) {
      toast.error('Maximum 2 plays reached for this question');
      return;
    }
    
    setSpeakingState(SPEAKING_STATES.LOADING_AUDIO);
    
    try {
      // Add transition phrase if not first question
      let textToSpeak = questionText;
      if (!isFirst && playCount === 0) {
        const transitions = [
          "Now, let me ask you... ",
          "Moving on... ",
          "And what about this... ",
          "I would like to ask you... ",
        ];
        textToSpeak = transitions[speakingQuestionIndex % transitions.length] + questionText;
      }
      
      const res = await fetch(`${API_URL}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak })
      });
      
      const data = await res.json();
      if (data.audio_url) {
        // Increment play count with part-based key
        setQuestionPlayCounts(prev => ({
          ...prev,
          [playKey]: playCount + 1
        }));
        
        setTtsAudioUrl(`${API_URL}${data.audio_url}`);
        setSpeakingState(SPEAKING_STATES.PLAYING_PROMPT);
      } else {
        throw new Error('No audio URL returned');
      }
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error('Could not play question audio');
      setSpeakingState(SPEAKING_STATES.IDLE);
    }
  };

  // Handle TTS audio ended - now ready to record
  const handleTTSEnded = () => {
    setSpeakingState(SPEAKING_STATES.READY_TO_RECORD);
    setTtsAudioUrl(null); // Clear URL to prevent re-play
  };

  // Start Part 2 preparation timer
  const startPart2Prep = () => {
    setIsPreparing(true);
    setPart2PrepTime(60);
  };

  // Render Speaking Section - Real IELTS style
  const renderSpeakingSection = () => {
    const parts = sectionData?.parts || [];
    const currentSpeakingPart = parts[currentPart];
    
    if (!currentSpeakingPart) return null;

    // Get questions for Part 1 or Part 3
    let questions = [];
    if (currentSpeakingPart.questions) {
      questions = currentSpeakingPart.questions;
    } else if (currentSpeakingPart.sample_questions) {
      // Support sample_questions field
      questions = currentSpeakingPart.sample_questions;
    } else if (currentSpeakingPart.topics) {
      // Part 1 - topics array with questions
      questions = currentSpeakingPart.topics.flatMap(t => t.questions || []);
    } else if (currentSpeakingPart.discussion_topics) {
      // Part 3 - discussion_topics array with questions
      questions = currentSpeakingPart.discussion_topics.flatMap(dt => dt.questions || []);
    }

    const isPart1or3 = currentSpeakingPart.part_number === 1 || currentSpeakingPart.part_number === 3;
    const isPart2 = currentSpeakingPart.part_number === 2;

    return (
      <div className="space-y-4">
        {/* Part Navigation */}
        <div className="flex gap-2">
          {parts.map((part, idx) => (
            <Button
              key={idx}
              variant={currentPart === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCurrentPart(idx);
                setSpeakingQuestionIndex(0);
                setSpeakingState(SPEAKING_STATES.IDLE);
                setTtsAudioUrl(null);
                setRecordingTime(0);
                setIsPreparing(false);
              }}
              className={currentPart === idx ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              Part {part.part_number}
            </Button>
          ))}
        </div>

        <Card className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Badge className="bg-orange-100 text-orange-700 mb-2">Part {currentSpeakingPart.part_number}</Badge>
              <h3 className="font-bold text-lg text-gray-900">{currentSpeakingPart.title}</h3>
            </div>
            <Badge className="bg-gray-100 text-gray-700">{currentSpeakingPart.duration}</Badge>
          </div>

          {/* Part 1 or Part 3 - Individual Question Interface */}
          {isPart1or3 && (
            <div className="space-y-6">
              {/* Topic hint - Part 1 shows topic, Part 3 shows discussion topics */}
              {currentSpeakingPart.topics && currentSpeakingPart.topics.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <span className="text-sm font-medium text-orange-700">
                    Topic: {currentSpeakingPart.topics.map(t => typeof t === 'string' ? t : t.topic).join(', ')}
                  </span>
                </div>
              )}
              {currentSpeakingPart.discussion_topics && currentSpeakingPart.discussion_topics.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <span className="text-sm font-medium text-orange-700">
                    Discussion: {currentSpeakingPart.discussion_topics.map(dt => dt.topic).join(', ')}
                  </span>
                </div>
              )}
              {currentSpeakingPart.topic && !currentSpeakingPart.topics && !currentSpeakingPart.discussion_topics && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <span className="text-sm font-medium text-orange-700">Topic: {currentSpeakingPart.topic}</span>
                </div>
              )}

              {/* Question Progress */}
              <div className="flex items-center justify-between px-2">
                <span className="text-sm text-gray-600">Question {speakingQuestionIndex + 1} of {questions.length}</span>
                <div className="flex gap-1">
                  {questions.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-3 h-3 rounded-full ${
                        idx < speakingQuestionIndex ? 'bg-green-500' : 
                        idx === speakingQuestionIndex ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Current Question Card */}
              <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    speakingState === SPEAKING_STATES.RECORDING ? 'bg-red-500 animate-pulse' :
                    speakingState === SPEAKING_STATES.PLAYING_PROMPT ? 'bg-blue-500' :
                    speakingState === SPEAKING_STATES.RECORDED ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                    {speakingState === SPEAKING_STATES.RECORDING ? (
                      <Mic className="w-8 h-8 text-white" />
                    ) : speakingState === SPEAKING_STATES.PLAYING_PROMPT ? (
                      <Volume2 className="w-8 h-8 text-white" />
                    ) : (
                      <Headphones className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h4 className="text-lg font-semibold">Question {speakingQuestionIndex + 1}</h4>
                  
                  {/* State indicator */}
                  <p className="text-sm text-gray-400 mt-1">
                    {speakingState === SPEAKING_STATES.IDLE && 'Click Listen to hear the question'}
                    {speakingState === SPEAKING_STATES.LOADING_AUDIO && 'Loading audio...'}
                    {speakingState === SPEAKING_STATES.PLAYING_PROMPT && 'Listen carefully...'}
                    {speakingState === SPEAKING_STATES.READY_TO_RECORD && 'Ready to record - click Record Answer'}
                    {speakingState === SPEAKING_STATES.RECORDING && `Recording... ${recordingTime}s`}
                    {speakingState === SPEAKING_STATES.RECORDED && 'Answer recorded!'}
                  </p>
                </div>

                {/* TTS Audio (hidden) */}
                {ttsAudioUrl && (
                  <audio
                    ref={ttsAudioRef}
                    src={ttsAudioUrl}
                    autoPlay
                    onEnded={handleTTSEnded}
                    onPlay={() => setSpeakingState(SPEAKING_STATES.PLAYING_PROMPT)}
                  />
                )}

                {/* Step 1: Listen Button */}
                {(speakingState === SPEAKING_STATES.IDLE || speakingState === SPEAKING_STATES.LOADING_AUDIO || speakingState === SPEAKING_STATES.PLAYING_PROMPT) && (
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <Button
                      onClick={() => playQuestionAudio(questions[speakingQuestionIndex], speakingQuestionIndex === 0)}
                      disabled={speakingState === SPEAKING_STATES.LOADING_AUDIO || speakingState === SPEAKING_STATES.PLAYING_PROMPT || (questionPlayCounts[`part${currentPart}_q${speakingQuestionIndex}`] || 0) >= 2}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 px-8"
                      size="lg"
                    >
                      {speakingState === SPEAKING_STATES.LOADING_AUDIO ? (
                        <>Loading...</>
                      ) : speakingState === SPEAKING_STATES.PLAYING_PROMPT ? (
                        <>
                          <div className="flex gap-1 mr-2">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-1 h-4 bg-white rounded animate-pulse" />
                            ))}
                          </div>
                          Playing...
                        </>
                      ) : (
                        <>
                          <Headphones className="w-5 h-5 mr-2" /> Listen to Question
                        </>
                      )}
                    </Button>
                    <span className="text-sm text-gray-400">
                      ({2 - (questionPlayCounts[`part${currentPart}_q${speakingQuestionIndex}`] || 0)} plays left)
                    </span>
                  </div>
                )}

                {/* Step 2: Record Button - Only after listening */}
                {(speakingState === SPEAKING_STATES.READY_TO_RECORD || speakingState === SPEAKING_STATES.RECORDING) && (
                  <div className="flex flex-col items-center gap-4 mb-6">
                    {speakingState === SPEAKING_STATES.READY_TO_RECORD ? (
                      <Button 
                        onClick={() => startRecordingForQuestion(speakingQuestionIndex)}
                        className="bg-red-600 hover:bg-red-700 px-8"
                        size="lg"
                      >
                        <Mic className="w-5 h-5 mr-2" /> Record Answer
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => stopRecordingForQuestion(speakingQuestionIndex)}
                        variant="destructive"
                        size="lg"
                        className="animate-pulse px-8"
                      >
                        <Pause className="w-5 h-5 mr-2" /> Stop ({recordingTime}s)
                      </Button>
                    )}
                    
                    {/* Re-listen option */}
                    {speakingState === SPEAKING_STATES.READY_TO_RECORD && (questionPlayCounts[`part${currentPart}_q${speakingQuestionIndex}`] || 0) < 2 && (
                      <Button
                        variant="ghost"
                        onClick={() => playQuestionAudio(questions[speakingQuestionIndex], false)}
                        className="text-gray-400 hover:text-white"
                        size="sm"
                      >
                        Listen again ({2 - (questionPlayCounts[`part${currentPart}_q${speakingQuestionIndex}`] || 0)} left)
                      </Button>
                    )}
                  </div>
                )}

                {/* Step 3: Recorded - Show playback */}
                {speakingState === SPEAKING_STATES.RECORDED && questionRecordings[`part${currentPart}_q${speakingQuestionIndex}`] && (
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <p className="text-sm text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Answer recorded
                    </p>
                    <audio 
                      src={questionRecordings[`part${currentPart}_q${speakingQuestionIndex}`]} 
                      controls 
                      className="mx-auto"
                    />
                    
                    {/* Re-record option */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSpeakingState(SPEAKING_STATES.READY_TO_RECORD);
                        setRecordingTime(0);
                      }}
                      className="text-white border-gray-600 hover:bg-gray-700"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" /> Re-record
                    </Button>
                  </div>
                )}
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  onClick={() => {
                    if (speakingQuestionIndex > 0) {
                      setSpeakingQuestionIndex(speakingQuestionIndex - 1);
                      setSpeakingState(SPEAKING_STATES.IDLE);
                      setTtsAudioUrl(null);
                      setRecordingTime(0);
                    }
                  }}
                  variant="outline"
                  disabled={speakingQuestionIndex === 0}
                >
                  Previous Question
                </Button>
                
                {speakingQuestionIndex < questions.length - 1 ? (
                  <Button
                    onClick={() => {
                      setSpeakingQuestionIndex(speakingQuestionIndex + 1);
                      setSpeakingState(SPEAKING_STATES.IDLE);
                      setTtsAudioUrl(null);
                      setRecordingTime(0);
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Next Question <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (currentPart < parts.length - 1) {
                        setCurrentPart(currentPart + 1);
                        setSpeakingQuestionIndex(0);
                        setSpeakingState(SPEAKING_STATES.IDLE);
                        setTtsAudioUrl(null);
                        setRecordingTime(0);
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={currentPart >= parts.length - 1}
                  >
                    {currentPart < parts.length - 1 ? 'Go to Next Part' : 'All Questions Done'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Part 2 - Task Card (Visible) */}
          {isPart2 && (currentSpeakingPart.cue_card || currentSpeakingPart.task_card || currentSpeakingPart.topic_card) && (
            <div className="space-y-6">
              {/* Task Card - Visible like real test */}
              <div className="p-6 bg-amber-50 border-2 border-amber-400 rounded-xl shadow-md">
                <div className="text-center mb-4">
                  <Badge className="bg-amber-200 text-amber-800 text-sm px-4 py-1">TASK CARD</Badge>
                </div>
                <h4 className="font-bold text-lg mb-4 text-amber-900">
                  {currentSpeakingPart.cue_card?.topic || 
                   (currentSpeakingPart.task_card || currentSpeakingPart.topic_card)?.instruction}
                </h4>
                <p className="text-sm text-gray-600 mb-4 font-medium">You should say:</p>
                <ul className="space-y-3 mb-6">
                  {(currentSpeakingPart.cue_card?.bullet_points ||
                    currentSpeakingPart.cue_card?.points ||
                    (currentSpeakingPart.task_card || currentSpeakingPart.topic_card)?.points || 
                    (currentSpeakingPart.task_card || currentSpeakingPart.topic_card)?.bullets)?.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-3 text-gray-700">
                      <span className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 text-amber-800 font-bold text-sm">
                        •
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                {(currentSpeakingPart.cue_card?.final_prompt ||
                  (currentSpeakingPart.task_card || currentSpeakingPart.topic_card)?.final_prompt) && (
                  <div className="pt-4 border-t border-amber-300">
                    <p className="text-sm text-amber-700 font-medium">
                      {currentSpeakingPart.cue_card?.final_prompt ||
                       (currentSpeakingPart.task_card || currentSpeakingPart.topic_card).final_prompt}
                    </p>
                  </div>
                )}
                {currentSpeakingPart.examiner_note && (
                  <div className="mt-4 pt-4 border-t border-amber-200 text-xs text-gray-500 italic">
                    {currentSpeakingPart.examiner_note}
                  </div>
                )}
              </div>

              {/* Preparation Timer */}
              {!isPreparing && part2PrepTime === 60 && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">You have 1 minute to prepare. Click when ready.</p>
                  <Button onClick={startPart2Prep} className="bg-blue-600 hover:bg-blue-700">
                    <Clock className="w-4 h-4 mr-2" /> Start 1 Minute Preparation
                  </Button>
                </div>
              )}

              {isPreparing && (
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 font-medium mb-2">Preparation Time</p>
                  <div className="text-4xl font-mono font-bold text-blue-600">
                    {Math.floor(part2PrepTime / 60)}:{(part2PrepTime % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-sm text-blue-500 mt-2">Think about what you want to say</p>
                </div>
              )}

              {/* Recording Controls */}
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {isPreparing ? 'Prepare your answer, then record' : 'Record your response (1-2 minutes)'}
                  </p>
                  <div className="flex justify-center gap-4">
                    {!isRecording ? (
                      <Button 
                        onClick={() => startRecordingForQuestion('part2')}
                        className="bg-red-600 hover:bg-red-700"
                        size="lg"
                        disabled={isPreparing}
                      >
                        <Mic className="w-5 h-5 mr-2" /> Start Recording
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => stopRecordingForQuestion('part2')}
                        variant="destructive"
                        size="lg"
                        className="animate-pulse"
                      >
                        <Pause className="w-5 h-5 mr-2" /> Stop Recording ({recordingTime}s)
                      </Button>
                    )}
                  </div>
                  
                  {questionRecordings['part1_qpart2'] && (
                    <div className="mt-4">
                      <p className="text-sm text-green-600 mb-2">Recording saved!</p>
                      <audio 
                        src={questionRecordings['part1_qpart2']} 
                        controls 
                        className="mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // Get mode label for header
  const getModeLabel = () => {
    if (isSkillMode) {
      return `${skillParam.charAt(0).toUpperCase() + skillParam.slice(1)} Practice`;
    }
    return 'Full Test';
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        {/* IELTS Computer-Delivered Test Header - Dark Style */}
        <div className="bg-slate-800 text-white px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left - Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-sm">
                  IELTS
                </div>
                <span className="font-medium text-sm hidden md:block">Computer-Delivered Test</span>
              </div>
              <div className="h-6 w-px bg-slate-600" />
              <div className="text-sm">
                <span className="text-slate-300">{testData.book}</span>
                <span className="mx-2 text-slate-500">•</span>
                <span className="text-white font-medium">{currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}</span>
              </div>
            </div>
            
            {/* Center - Timer */}
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded ${
              sectionTimeLeft < 300 ? 'bg-red-600' : 'bg-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{Math.floor(sectionTimeLeft / 60)} minutes left</span>
            </div>
            
            {/* Right - Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettingsModal(true)}
                className="text-white hover:bg-slate-700"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowHelpModal(true)}
                className="text-white hover:bg-slate-700"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setScreenHidden(true)}
                className="text-white hover:bg-slate-700"
              >
                <EyeOff className="w-4 h-4 mr-1" />
                Hide
              </Button>
            </div>
          </div>
        </div>
        
        {/* Section Navigation Bar */}
        <div className="bg-white border-b px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/question-bank?openTest=${bookId}_${testId}`)} className="text-gray-600">
                <ArrowLeft className="w-4 h-4 mr-1" /> Exit Test
              </Button>
            </div>
            
            {/* Section Tabs */}
            <div className="flex gap-1">
              {sections
                .filter(section => !isSkillMode || section.id === skillParam)
                .map(section => {
                const Icon = section.icon;
                const isActive = currentSection === section.id;
                const isCompleted = completedSections.includes(section.id);
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    data-testid={`section-tab-${section.id}`}
                    onClick={() => {
                      if (!isSkillMode) {
                        setCurrentSection(section.id);
                        setCurrentPart(0);
                        setShowInstructions(true);
                      }
                    }}
                    className={`${isActive ? `bg-${section.color}-600 hover:bg-${section.color}-700` : ''} ${isCompleted ? 'opacity-50' : ''} ${isSkillMode ? 'cursor-default' : ''}`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    <span className="hidden md:inline">{section.label}</span>
                  </Button>
                );
              })}
            </div>
            
            <div className="text-sm text-gray-500">
              {getAnsweredCount(currentSection)} / {getTotalQuestions(currentSection)} answered
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {currentSection === 'listening' && renderListeningSection()}
        {currentSection === 'reading' && renderReadingSection()}
        {currentSection === 'writing' && renderWritingSection()}
        {currentSection === 'speaking' && renderSpeakingSection()}
      </div>

      {/* IELTS-Style Question Navigation Bar */}
      {renderNavigationBar()}
      
      {/* Writing/Speaking Bottom Bar (when nav bar not shown) */}
      {(currentSection === 'writing' || currentSection === 'speaking') && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {currentSection === 'writing' ? (
                <>Word count: <span className="font-medium text-gray-700">
                  {(answers[`writing_task${currentPart + 1}`] || '').split(/\s+/).filter(Boolean).length}
                </span> / {currentPart === 0 ? 150 : 250} minimum</>
              ) : (
                <>Part {currentPart + 1} of 3</>
              )}
            </div>
            <Button 
              onClick={() => setShowSubmitModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Submit {currentSection}?</h3>
              <p className="text-gray-500 mb-6">
                You cannot return to this section after submitting. Make sure you have answered all questions.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowSubmitModal(false)}
                  data-testid="cancel-submit"
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleSubmitSection}
                  data-testid="confirm-submit"
                >
                  Submit
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-blue-600" />
                Add Note
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNoteModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Highlighted text:</p>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                &ldquo;{currentNote.text}&rdquo;
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Your note:</label>
              <textarea
                value={currentNote.note}
                onChange={(e) => setCurrentNote(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Write your note here..."
                className="w-full p-3 border rounded-lg text-sm resize-none h-24 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowNoteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={saveNote}
              >
                Save Note
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Review Panel */}
      {renderReviewPanel()}
      
      {/* Settings Modal - IELTS Style (from FullTestInterface) */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Settings</span>
              <button 
                onClick={() => setShowSettingsModal(false)} 
                className="ml-auto w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 bg-slate-50">
              <p className="text-slate-600 mb-6">
                If you wish, you can change these settings to make the test easier to read.
              </p>
              
              <div className="grid grid-cols-3 gap-8">
                {/* Text Size */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Text size</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="textSize" 
                        checked={textSize === 'standard'}
                        onChange={() => setTextSize('standard')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Standard</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="textSize" 
                        checked={textSize === 'large'}
                        onChange={() => setTextSize('large')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Large</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="textSize" 
                        checked={textSize === 'extra-large'}
                        onChange={() => setTextSize('extra-large')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Extra large</span>
                    </label>
                  </div>
                </div>
                
                {/* Colours */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Colours</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="colorTheme" 
                        checked={colorTheme === 'standard'}
                        onChange={() => setColorTheme('standard')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Standard</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="colorTheme" 
                        checked={colorTheme === 'yellow-on-black'}
                        onChange={() => setColorTheme('yellow-on-black')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Yellow on black</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="colorTheme" 
                        checked={colorTheme === 'blue-on-white'}
                        onChange={() => setColorTheme('blue-on-white')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Blue on white</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="colorTheme" 
                        checked={colorTheme === 'blue-on-cream'}
                        onChange={() => setColorTheme('blue-on-cream')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Blue on cream</span>
                    </label>
                  </div>
                </div>
                
                {/* Screen Resolution */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Screen Resolution</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="screenRes" 
                        checked={false}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">800 x 600</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="screenRes" 
                        checked={false}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">1024 x 768</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="screenRes" 
                        checked={true}
                        readOnly
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">1280 x 1024</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* OK Button */}
              <div className="flex justify-center mt-8">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="px-12 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Help Modal - IELTS Style with Tabs (from FullTestInterface) */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Help</span>
              <button 
                onClick={() => setShowHelpModal(false)} 
                className="ml-auto w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            {/* Tabs */}
            <div className="bg-slate-100 border-b border-slate-300">
              <div className="flex">
                <button 
                  onClick={() => setHelpTab('information')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors
                    ${helpTab === 'information' 
                      ? 'bg-white border-blue-500 text-blue-600' 
                      : 'border-transparent text-slate-600 hover:text-slate-800'}`}
                >
                  Information
                </button>
                <button 
                  onClick={() => setHelpTab('test-help')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors
                    ${helpTab === 'test-help' 
                      ? 'bg-white border-blue-500 text-blue-600' 
                      : 'border-transparent text-slate-600 hover:text-slate-800'}`}
                >
                  Test help
                </button>
                <button 
                  onClick={() => setHelpTab('task-help')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors
                    ${helpTab === 'task-help' 
                      ? 'bg-white border-blue-500 text-blue-600' 
                      : 'border-transparent text-slate-600 hover:text-slate-800'}`}
                >
                  Task help
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="p-6 bg-white max-h-96 overflow-auto">
              {helpTab === 'information' && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Multiple choice questions</h4>
                  <p className="text-slate-600 mb-4">Choose your question by clicking on it.</p>
                  
                  {/* Example Question Display */}
                  <div className="border border-slate-300 rounded-lg overflow-hidden mb-4">
                    <div className="bg-blue-500 text-white px-4 py-2 font-medium">
                      1 &nbsp; Marie Curie&apos;s husband was a joint winner of both Marie&apos;s Nobel Prizes.
                    </div>
                    <div className="p-4 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="example" className="w-4 h-4" />
                        <span className="text-slate-700">TRUE</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="example" className="w-4 h-4" />
                        <span className="text-slate-700">FALSE</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="example" className="w-4 h-4" />
                        <span className="text-slate-700">NOT GIVEN</span>
                      </label>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 border-t text-slate-600">
                      2 &nbsp; Marie became interested in science when she was a child.
                    </div>
                    <div className="px-4 py-2 bg-slate-50 border-t text-slate-600">
                      3 &nbsp; Marie&apos;s family in Poland had financial problems.
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm">Click on the answer you think is right.</p>
                </div>
              )}
              
              {helpTab === 'test-help' && (
                <div>
                  <div className="flex items-center gap-3 mb-6 p-3 bg-slate-100 rounded-lg">
                    <div className="w-8 h-8 bg-slate-800 text-white flex items-center justify-center rounded font-bold">
                      1
                    </div>
                    <p className="text-slate-700">The black highlighting shows that you have not answered the question</p>
                  </div>
                  
                  <h4 className="font-semibold text-slate-900 mb-3">Highlighting</h4>
                  <p className="text-slate-600 mb-3">To highlight something in the test:</p>
                  
                  <div className="bg-slate-50 p-4 rounded-lg mb-4">
                    <p className="text-slate-700 mb-2"><strong>Select the text you want to highlight using the mouse.</strong></p>
                    <p className="text-slate-700 mb-4">Right click over the text.</p>
                    
                    {/* Example Text Block */}
                    <div className="bg-white p-3 border rounded text-slate-700 mb-4">
                      <p>book we travel back in time and across the</p>
                      <p>
                        and been{' '}
                        <span className="bg-yellow-200 px-1">in our the</span>
                        <span className="text-slate-400">last two m</span>
                      </p>
                      <p>word in a w<span className="inline-flex gap-2 mx-1">
                        <button className="text-xs bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded">✏️ Highlight</button>
                        <button className="text-xs bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">📝 Notes</button>
                      </span>attempte</p>
                      <p>objects com<span className="text-slate-400">e – messa</span></p>
                      <p>rnments and interactions, about different m</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <button className="text-sm bg-yellow-100 border border-yellow-300 px-3 py-1 rounded">✏️ Highlight</button>
                      <span className="text-slate-600">Click to highlight the text you have selected</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-sm bg-blue-100 border border-blue-300 px-3 py-1 rounded">📝 Notes</button>
                      <span className="text-slate-600">Click to highlight the text you have selected and to add notes about what you have highlighted.</span>
                    </div>
                  </div>
                </div>
              )}
              
              {helpTab === 'task-help' && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Task-specific Help</h4>
                  
                  {currentSection === 'listening' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Listening Section</h5>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• The audio will play automatically for each part</li>
                          <li>• You can only hear each recording once</li>
                          <li>• Write your answers while you listen</li>
                          <li>• Use the volume slider to adjust the audio level</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {currentSection === 'reading' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-900 mb-2">Reading Section</h5>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Read the passage carefully before answering</li>
                          <li>• Use highlighting to mark key information</li>
                          <li>• Pay attention to word limits for gap-fill questions</li>
                          <li>• Use the navigation bar to jump between questions</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {currentSection === 'writing' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-900 mb-2">Writing Section</h5>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Task 1: Write at least 150 words in 20 minutes</li>
                          <li>• Task 2: Write at least 250 words in 40 minutes</li>
                          <li>• Task 2 counts double in your final score</li>
                          <li>• Use the word counter at the bottom of the screen</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {currentSection === 'speaking' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h5 className="font-medium text-orange-900 mb-2">Speaking Section</h5>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Listen to each question before answering</li>
                          <li>• You can listen to each question up to 2 times</li>
                          <li>• Click Record Answer when you are ready</li>
                          <li>• For Part 2, use the 1-minute preparation time</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* OK Button */}
            <div className="p-4 border-t bg-slate-50">
              <div className="flex justify-center">
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className="px-12 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Screen Hidden Overlay - from FullTestInterface */}
      {screenHidden && (
        <div className="fixed inset-0 bg-slate-600 flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Screen hidden</span>
              <button 
                onClick={() => setScreenHidden(false)} 
                className="ml-auto w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 bg-slate-50">
              <div className="space-y-4 text-slate-700">
                <p>Your answers have been stored.</p>
                <p>Please note that the clock is still running. The time has not been paused.</p>
                <p>If you wish to leave the room, please tell your invigilator.</p>
                <p>Click the button below to go back to your test.</p>
              </div>
              
              {/* Resume Button */}
              <div className="flex justify-center mt-8">
                <button 
                  onClick={() => setScreenHidden(false)}
                  className="px-8 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors"
                >
                  Resume test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
