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
import MapLabelling from '../components/listening/MapLabelling';
import OpinionMatching, { MatchingFeatures } from '../components/listening/OpinionMatching';

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
  const [screenHidden, setScreenHidden] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Settings state
  const [textSize, setTextSize] = useState('standard');
  const [colorTheme, setColorTheme] = useState('standard');
  const [screenResolution, setScreenResolution] = useState('1280x1024');
  
  // Help modal tab
  const [helpTab, setHelpTab] = useState('information');

  // Highlighting & Notes state
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, text: '', range: null });
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState({ text: '', note: '' });
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Listening specific
  const [listeningPart, setListeningPart] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioEndedParts, setAudioEndedParts] = useState({}); // Track per-part audio status
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
      // Calculate section times (total time - remaining time for each section)
      const sectionTimes = {};
      activeSections.forEach(section => {
        const totalTime = SECTION_CONFIG[section]?.totalTime || 0;
        sectionTimes[section] = totalTime; // Default to full time if section was completed
      });
      
      const res = await fetch(`${API_URL}/api/full-test/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          test_id: testId,
          mode: mode,
          all_answers: sectionAnswers,
          section_times: sectionTimes
        })
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/full-test/results/${sessionId}`, { state: { results: data.results } });
      } else {
        toast.error('Error completing test. Please try again.');
      }
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error('Error completing test. Please try again.');
    }
  };

  // ============ HIGHLIGHTING & NOTES HANDLERS ============
  const handleTextSelection = (e) => {
    // Only show context menu on right-click
    if (e.type === 'contextmenu') {
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
    }
  };

  const handleHighlight = () => {
    if (contextMenu.text) {
      const newHighlight = {
        id: Date.now(),
        text: contextMenu.text,
        section: currentSection,
        createdAt: new Date().toISOString()
      };
      setHighlights(prev => [...prev, newHighlight]);
      setContextMenu({ show: false, x: 0, y: 0, text: '', range: null });
    }
  };

  const handleAddNote = () => {
    if (contextMenu.text) {
      setCurrentNote({ text: contextMenu.text, note: '' });
      setShowNoteModal(true);
      setContextMenu({ show: false, x: 0, y: 0, text: '', range: null });
    }
  };

  const saveNote = () => {
    if (currentNote.text && currentNote.note) {
      if (editingNoteId) {
        setNotes(prev => prev.map(n => 
          n.id === editingNoteId ? { ...n, note: currentNote.note } : n
        ));
      } else {
        const newNote = {
          id: Date.now(),
          text: currentNote.text,
          note: currentNote.note,
          section: currentSection,
          createdAt: new Date().toISOString()
        };
        setNotes(prev => [...prev, newNote]);
        // Also add to highlights
        setHighlights(prev => [...prev, { id: newNote.id, text: currentNote.text, section: currentSection, hasNote: true }]);
      }
      setShowNoteModal(false);
      setCurrentNote({ text: '', note: '' });
      setEditingNoteId(null);
    }
  };

  const removeHighlight = (id) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, text: '', range: null });
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Function to render text with highlights
  const renderTextWithHighlights = (text, sectionType) => {
    if (!text) return text;
    
    const sectionHighlights = highlights.filter(h => h.section === sectionType);
    if (sectionHighlights.length === 0) return text;

    let result = text;
    sectionHighlights.forEach(highlight => {
      const hasNote = notes.some(n => n.id === highlight.id);
      const highlightClass = hasNote 
        ? 'bg-blue-200 cursor-pointer border-b-2 border-blue-400' 
        : 'bg-yellow-200 cursor-pointer';
      
      result = result.replace(
        new RegExp(highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        `<mark class="${highlightClass}" data-highlight-id="${highlight.id}">${highlight.text}</mark>`
      );
    });
    
    return result;
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
    // Mark this specific part as ended
    setAudioEndedParts(prev => ({ ...prev, [listeningPart]: true }));
    if (listeningPart < 4) {
      setTimeout(() => {
        setListeningPart(prev => prev + 1);
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
        <button 
          onClick={() => setScreenHidden(true)}
          className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm flex items-center gap-1"
        >
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
          
          {/* Next/Previous arrows and Submit Button */}
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
            
            {/* Submit Section Button */}
            <button 
              onClick={() => setShowConfirmSubmit(true)}
              className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              Submit {currentSection} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============ HELPER: RENDER LISTENING QUESTIONS BASED ON TYPE ============
  const renderListeningQuestions = (partData) => {
    if (!partData) return null;
    
    const questionStartNum = (listeningPart - 1) * 10 + 1;
    const hasMapLabelling = partData.question_types?.includes('map_labelling') || 
                            partData.questions?.some(q => q.type === 'map_labelling');
    const hasMatching = partData.question_types?.includes('matching') ||
                        partData.questions?.some(q => q.type === 'matching' || q.type === 'opinion_matching');
    
    // Check for visual data
    const visual = partData.visual || partData.visual_data;
    
    // If has map labelling questions with visual
    if (hasMapLabelling && visual) {
      return (
        <div className="space-y-6">
          {/* Map Component */}
          <MapLabelling
            visual={visual}
            questions={partData.questions}
            answers={sectionAnswers.listening}
            onAnswerChange={(qId, value) => updateAnswer('listening', qId, value)}
            questionStartNum={questionStartNum}
          />
          
          {/* Non-map questions */}
          {partData.questions?.filter(q => q.type !== 'map_labelling').length > 0 && (
            <div className="bg-white border-2 border-slate-200 rounded-lg">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-lg text-slate-900">
                  Other Questions
                </h3>
                <p className="text-slate-600 mt-1">
                  Complete the notes. Write <strong>ONE WORD ONLY</strong> in each gap.
                </p>
              </div>
              <div className="p-6 space-y-4">
                {partData.questions?.filter(q => q.type !== 'map_labelling').map((q, idx) => {
                  const qNum = questionStartNum + partData.questions.indexOf(q);
                  const questionParts = q.question?.split('______') || [q.question];
                  
                  return (
                    <div key={q.id} className="flex items-start gap-2 py-2 text-slate-700 text-lg leading-relaxed">
                      <span className="text-slate-400 min-w-[20px]">•</span>
                      <div className="flex-1 flex flex-wrap items-center gap-1">
                        <span>{questionParts[0]}</span>
                        <input
                          type="text"
                          value={sectionAnswers.listening[q.id] || ''}
                          onChange={(e) => updateAnswer('listening', q.id, e.target.value)}
                          className="w-36 px-3 py-2 border-2 border-blue-400 rounded-md text-center font-medium 
                                   bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none
                                   placeholder:text-blue-300 placeholder:font-bold"
                          placeholder={String(qNum)}
                        />
                        {questionParts[1] && <span>{questionParts[1]}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // If has matching/opinion questions with options box
    if (hasMatching && partData.matching_options) {
      const matchingQuestions = partData.questions?.filter(q => 
        q.type === 'matching' || q.type === 'opinion_matching'
      ) || [];
      const otherQuestions = partData.questions?.filter(q => 
        q.type !== 'matching' && q.type !== 'opinion_matching'
      ) || [];
      
      return (
        <div className="space-y-6">
          {/* Section Title */}
          <h4 className="font-bold text-xl text-slate-800 pb-3 border-b border-slate-200">
            {partData.title}
          </h4>
          
          {/* Opinion/Matching Box */}
          <OpinionMatching
            title={partData.matching_title || "Options"}
            options={partData.matching_options}
            questions={matchingQuestions}
            answers={sectionAnswers.listening}
            onAnswerChange={(qId, value) => updateAnswer('listening', qId, value)}
            questionStartNum={questionStartNum}
          />
          
          {/* Other questions if any */}
          {otherQuestions.length > 0 && renderDefaultQuestions(otherQuestions, questionStartNum + matchingQuestions.length)}
        </div>
      );
    }
    
    // Default: Note completion style
    return (
      <div 
        className="bg-white border-2 border-slate-200 rounded-lg"
        onContextMenu={handleTextSelection}
      >
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-900">
            Questions {questionStartNum} - {questionStartNum + (partData.questions?.length || 10) - 1}
          </h3>
          <p className="text-slate-600 mt-1">
            Complete the notes. Write <strong>ONE WORD ONLY</strong> in each gap.
          </p>
        </div>
        
        <div className="p-6">
          {/* Section Title */}
          <h4 className="font-bold text-xl text-slate-800 mb-6 pb-3 border-b border-slate-200">
            {partData.title}
          </h4>
          
          {/* Questions in note completion format */}
          <div className="space-y-4 select-text">
            {partData.questions?.map((q, idx) => {
              const qNum = questionStartNum + idx;
              const questionParts = q.question?.split('______') || [q.question];
              
              return (
                <div key={q.id} className="flex items-start gap-2 py-2 text-slate-700 text-lg leading-relaxed">
                  <span className="text-slate-400 min-w-[20px]">•</span>
                  <div className="flex-1 flex flex-wrap items-center gap-1">
                    <span>{questionParts[0]}</span>
                    <input
                      type="text"
                      value={sectionAnswers.listening[q.id] || ''}
                      onChange={(e) => updateAnswer('listening', q.id, e.target.value)}
                      className="w-36 px-3 py-2 border-2 border-blue-400 rounded-md text-center font-medium 
                               bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none
                               placeholder:text-blue-300 placeholder:font-bold"
                      placeholder={String(qNum)}
                    />
                    {questionParts[1] && <span>{questionParts[1]}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Tip for highlighting */}
          <div className="mt-4 p-2 bg-slate-100 rounded text-xs text-slate-500">
            💡 Tip: Select text and right-click to highlight or add notes
          </div>
        </div>
      </div>
    );
  };
  
  // Helper for rendering default questions
  const renderDefaultQuestions = (questions, startNum) => (
    <div className="bg-white border-2 border-slate-200 rounded-lg p-6 space-y-4">
      {questions.map((q, idx) => {
        const qNum = startNum + idx;
        const questionParts = q.question?.split('______') || [q.question];
        return (
          <div key={q.id} className="flex items-start gap-2 py-2 text-slate-700 text-lg">
            <span className="text-slate-400 min-w-[20px]">•</span>
            <div className="flex-1 flex flex-wrap items-center gap-1">
              <span>{questionParts[0]}</span>
              <input
                type="text"
                value={sectionAnswers.listening[q.id] || ''}
                onChange={(e) => updateAnswer('listening', q.id, e.target.value)}
                className="w-36 px-3 py-2 border-2 border-blue-400 rounded-md text-center font-medium bg-blue-50"
                placeholder={String(qNum)}
              />
              {questionParts[1] && <span>{questionParts[1]}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );

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
                  disabled={audioEndedParts[listeningPart]}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg
                    ${audioPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}
                    ${audioEndedParts[listeningPart] ? 'bg-slate-400 cursor-not-allowed' : ''}
                    text-white`}
                >
                  {audioPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <div>
                  <p className="font-semibold text-slate-900 text-lg">
                    {audioPlaying ? 'Playing...' : audioEndedParts[listeningPart] ? 'Audio Completed' : 'Click to Play Audio'}
                  </p>
                  <p className="text-sm text-slate-500">Audio plays once only - Part {listeningPart}</p>
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
              key={listeningPart} // Force new audio element when part changes
              src={`${API_URL}/api/full-test/audio/stream/${testId}/listening/${listeningPart}`}
              onEnded={handleAudioEnded}
              onPlay={() => setAudioPlaying(true)}
              onPause={() => setAudioPlaying(false)}
              style={{ display: 'none' }}
            />
          </div>

          {/* Questions Section - Conditional based on question type */}
          {renderListeningQuestions(currentPartData)}
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
        <div 
          className="w-1/2 border-r border-slate-300 overflow-auto bg-white p-6"
          onContextMenu={handleTextSelection}
        >
          <h2 className="text-xl font-bold text-slate-900 mb-2">Part {currentPassage + 1}</h2>
          <p className="text-slate-600 mb-4">Read the text below and answer the questions.</p>
          
          <h3 className="text-lg font-bold text-slate-800 mb-4">{passage?.title}</h3>
          
          {/* Highlights & Notes Panel */}
          {(highlights.filter(h => h.section === 'reading').length > 0 || notes.filter(n => n.section === 'reading').length > 0) && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-800">Your Highlights & Notes</span>
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
              <div className="space-y-1 max-h-32 overflow-auto">
                {highlights.filter(h => h.section === 'reading').map(h => {
                  const relatedNote = notes.find(n => n.id === h.id);
                  return (
                    <div key={h.id} className="flex items-start gap-2 text-xs">
                      <span className={`px-1 rounded ${relatedNote ? 'bg-blue-200' : 'bg-yellow-200'}`}>
                        {h.text.substring(0, 30)}...
                      </span>
                      {relatedNote && (
                        <span className="text-slate-600 italic">&quot;{relatedNote.note}&quot;</span>
                      )}
                      <button 
                        onClick={() => removeHighlight(h.id)}
                        className="text-red-500 hover:text-red-700 ml-auto"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed select-text">
            {passage?.text?.split('\n\n').map((para, idx) => {
              const highlightedPara = renderTextWithHighlights(para, 'reading');
              return (
                <p 
                  key={idx} 
                  className="mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: /^[A-Z]\s/.test(highlightedPara) 
                      ? `<strong class="text-slate-900">${highlightedPara.charAt(0)}</strong>${highlightedPara.slice(1)}`
                      : highlightedPara 
                  }}
                />
              );
            })}
          </div>
          
          {/* Tip for highlighting */}
          <div className="mt-4 p-2 bg-slate-100 rounded text-xs text-slate-500">
            💡 Tip: Select text and right-click to highlight or add notes
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
    
    // Comprehensive visual renderer for all chart types
    const renderVisual = (visualData) => {
      if (!visualData) return null;
      
      // Before/After comparison - two images side by side
      if (visualData.image_url && visualData.image_url_after) {
        return (
          <div className="mt-4 p-4 bg-white border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {visualData.before?.label && (
                  <p className="text-center text-sm font-semibold text-slate-700 mb-2">{visualData.before.label}</p>
                )}
                <img 
                  src={`${API_URL}/api/visuals/image/${visualData.image_url.replace('.png', '')}`}
                  alt={visualData.before?.label || 'Before'}
                  className="w-full rounded border"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div>
                {visualData.after?.label && (
                  <p className="text-center text-sm font-semibold text-slate-700 mb-2">{visualData.after.label}</p>
                )}
                <img 
                  src={`${API_URL}/api/visuals/image/${visualData.image_url_after.replace('.png', '')}`}
                  alt={visualData.after?.label || 'After'}
                  className="w-full rounded border"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
            {visualData.title && (
              <p className="text-center text-sm text-slate-600 mt-2">{visualData.title}</p>
            )}
          </div>
        );
      }
      
      // If image URL is provided, render the PNG directly
      if (visualData.image_url) {
        return (
          <div className="mt-4 p-4 bg-white border rounded-lg">
            <img 
              src={`${API_URL}/api/visuals/image/${visualData.image_url.replace('.png', '')}`}
              alt={visualData.title || 'Visual'}
              className="w-full max-w-2xl mx-auto rounded"
              onError={(e) => {
                e.target.style.display = 'none';
                console.error('Failed to load visual:', visualData.image_url);
              }}
            />
            {visualData.title && (
              <p className="text-center text-sm text-slate-600 mt-2">{visualData.title}</p>
            )}
          </div>
        );
      }
      
      // Bar Chart
      if (visualData.type === 'bar_chart') {
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
      }
      
      // Line Graph
      if (visualData.type === 'line_graph') {
        const { title, datasets, x_labels } = visualData;
        return (
          <div className="mt-4 p-4 bg-white border rounded-lg">
            <h4 className="font-semibold text-center text-slate-900 mb-4">{title}</h4>
            <div className="flex justify-center gap-4 mb-4 flex-wrap">
              {datasets?.map((ds) => (
                <div key={ds.country} className="flex items-center gap-2">
                  <div className="w-4 h-1" style={{ backgroundColor: ds.color }}></div>
                  <span className="text-sm text-slate-600">{ds.country}</span>
                </div>
              ))}
            </div>
            <div className="relative h-64 border-l border-b border-slate-300 ml-8">
              {/* Y-axis labels */}
              <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-xs text-slate-500">
                <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
              </div>
              {/* Data lines visualization */}
              <div className="absolute inset-0 flex items-end justify-around px-2 pb-6">
                {x_labels?.map((year, idx) => (
                  <div key={year} className="flex flex-col items-center">
                    {datasets?.map((ds) => (
                      <div 
                        key={ds.country}
                        className="w-2 h-2 rounded-full mb-1"
                        style={{ 
                          backgroundColor: ds.color,
                          marginBottom: `${ds.data[idx] * 2}px`
                        }}
                        title={`${ds.country}: ${ds.data[idx]}%`}
                      />
                    ))}
                    <span className="text-xs text-slate-500 mt-2">{year}</span>
                  </div>
                ))}
              </div>
            </div>
            {visualData.visual_description && (
              <p className="text-xs text-slate-500 mt-3 whitespace-pre-wrap">{visualData.visual_description}</p>
            )}
          </div>
        );
      }
      
      // Process Diagram
      if (visualData.type === 'process') {
        const { title, stages } = visualData;
        return (
          <div className="mt-4 p-4 bg-white border rounded-lg">
            <h4 className="font-semibold text-center text-slate-900 mb-4">{title}</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {stages?.map((stage, idx) => (
                <div key={stage.number} className="flex items-center">
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-center min-w-[120px]">
                    <div className="text-xs text-blue-600 font-medium">Stage {stage.number}</div>
                    <div className="text-sm font-semibold text-slate-800">{stage.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{stage.description}</div>
                  </div>
                  {idx < stages.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-slate-400 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      // Pie Chart Comparison
      if (visualData.type === 'pie_chart_comparison') {
        const { title, charts } = visualData;
        const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        return (
          <div className="mt-4 p-4 bg-white border rounded-lg">
            <h4 className="font-semibold text-center text-slate-900 mb-4">{title}</h4>
            <div className="grid grid-cols-2 gap-6">
              {charts?.map((chart) => (
                <div key={chart.year} className="text-center">
                  <h5 className="font-medium text-slate-700 mb-3">{chart.year}</h5>
                  <div className="space-y-2">
                    {chart.data?.map((item, idx) => (
                      <div key={item.reason} className="flex items-center gap-2">
                        <div 
                          className="h-4 rounded"
                          style={{ 
                            width: `${item.percentage * 2}px`, 
                            backgroundColor: pieColors[idx % pieColors.length] 
                          }}
                        />
                        <span className="text-xs text-slate-600">{item.reason}: {item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      // Combined charts (bar + table)
      if (visualData.type === 'combined') {
        return (
          <div className="mt-4 p-4 bg-white border rounded-lg space-y-4">
            {visualData.charts?.map((chart, idx) => {
              if (chart.chart_type === 'bar') {
                return (
                  <div key={idx}>
                    <h4 className="font-semibold text-center text-slate-900 mb-3">{chart.title}</h4>
                    <div className="space-y-2">
                      {chart.data?.map((row) => (
                        <div key={row.city} className="flex items-center gap-3">
                          <div className="w-24 text-sm text-slate-600 text-right">{row.city}</div>
                          <div className="flex gap-1 flex-1">
                            <div className="h-5 bg-blue-400 rounded" style={{ width: `${row['2010'] * 2}%` }}>
                              <span className="text-xs text-white px-1">{row['2010']}%</span>
                            </div>
                            <div className="h-5 bg-green-400 rounded" style={{ width: `${row['2020'] * 2}%` }}>
                              <span className="text-xs text-white px-1">{row['2020']}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400 rounded"></div> 2010</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded"></div> 2020</span>
                    </div>
                  </div>
                );
              }
              if (chart.chart_type === 'table') {
                return (
                  <div key={idx}>
                    <h4 className="font-semibold text-center text-slate-900 mb-3">{chart.title}</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {chart.headers?.map((h) => (
                            <th key={h} className="text-left py-2 px-3 text-slate-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chart.data?.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-2 px-3">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return null;
            })}
          </div>
        );
      }
      
      // Fallback: show visual_description if available
      if (visualData.visual_description) {
        return (
          <div className="mt-4 p-4 bg-slate-100 border rounded-lg">
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
              {visualData.visual_description}
            </pre>
          </div>
        );
      }
      
      // Dual Map (for IELTS Writing Task 1 - map comparison)
      if (visualData.type === 'dual_map') {
        const { title, maps } = visualData;
        return (
          <div className="mt-4 p-4 bg-white border rounded-lg">
            {title && <h4 className="font-semibold text-center text-slate-900 mb-4">{title}</h4>}
            <div className="grid grid-cols-2 gap-4">
              {maps?.map((map, mapIdx) => (
                <div key={mapIdx} className="border rounded-lg p-4 bg-slate-50">
                  <h5 className="font-medium text-center text-slate-800 mb-3 text-sm">{map.title}</h5>
                  <div className="relative bg-white rounded border aspect-[4/3] p-3">
                    {/* River */}
                    <div className="absolute top-2 left-0 right-0 h-6 bg-blue-200 flex items-center justify-center">
                      <span className="text-xs text-blue-700 font-medium">River</span>
                    </div>
                    
                    {/* Farmland */}
                    <div className="absolute top-8 left-0 right-0 h-8 bg-green-100 flex items-center justify-center border-b border-green-300">
                      <span className="text-xs text-green-700">Farmland</span>
                    </div>
                    
                    {/* Main area */}
                    <div className="absolute top-16 bottom-8 left-2 right-2">
                      {/* Road to Town - left */}
                      <div className="absolute left-0 top-1/2 w-8 h-4 bg-gray-300 flex items-center justify-center transform -translate-y-1/2">
                        <span className="text-[8px] text-gray-600">Town</span>
                      </div>
                      
                      {/* Roundabout - center */}
                      <div className="absolute left-1/2 top-1/2 w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-400 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      </div>
                      
                      {/* Buildings/Facilities based on map type */}
                      {mapIdx === 0 ? (
                        // Current map - Factories
                        <>
                          <div className="absolute left-12 top-2 w-12 h-8 bg-red-200 border border-red-300 flex items-center justify-center">
                            <span className="text-[8px]">Factory</span>
                          </div>
                          <div className="absolute right-12 top-2 w-12 h-8 bg-red-200 border border-red-300 flex items-center justify-center">
                            <span className="text-[8px]">Factory</span>
                          </div>
                          <div className="absolute left-12 bottom-2 w-12 h-8 bg-red-200 border border-red-300 flex items-center justify-center">
                            <span className="text-[8px]">Factory</span>
                          </div>
                          <div className="absolute right-12 bottom-2 w-12 h-8 bg-red-200 border border-red-300 flex items-center justify-center">
                            <span className="text-[8px]">Factory</span>
                          </div>
                        </>
                      ) : (
                        // Planned development - Housing and facilities
                        <>
                          {/* Housing */}
                          <div className="absolute left-10 top-1 w-10 h-6 bg-yellow-100 border border-yellow-300 flex items-center justify-center">
                            <span className="text-[7px]">Housing</span>
                          </div>
                          <div className="absolute right-10 top-1 w-10 h-6 bg-yellow-100 border border-yellow-300 flex items-center justify-center">
                            <span className="text-[7px]">Housing</span>
                          </div>
                          <div className="absolute left-10 bottom-1 w-10 h-6 bg-yellow-100 border border-yellow-300 flex items-center justify-center">
                            <span className="text-[7px]">Housing</span>
                          </div>
                          
                          {/* Medical Centre - south of roundabout */}
                          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-14 h-5 bg-red-100 border border-red-300 flex items-center justify-center">
                            <span className="text-[6px]">Medical</span>
                          </div>
                          
                          {/* Shops - east of roundabout */}
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-6 bg-purple-100 border border-purple-300 flex items-center justify-center">
                            <span className="text-[7px]">Shops</span>
                          </div>
                          
                          {/* School - far east */}
                          <div className="absolute right-0 top-2 w-8 h-5 bg-blue-100 border border-blue-300 flex items-center justify-center">
                            <span className="text-[6px]">School</span>
                          </div>
                          
                          {/* Playground */}
                          <div className="absolute right-1 bottom-8 w-8 h-5 bg-green-200 border border-green-400 flex items-center justify-center">
                            <span className="text-[6px]">Play</span>
                          </div>
                          
                          {/* New Bridge */}
                          <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 w-6 h-3 bg-gray-400 flex items-center justify-center">
                            <span className="text-[5px] text-white">Bridge</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Main Road - bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">Main Road</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      return null;
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
          {task?.visual_data && renderVisual(task.visual_data)}
          
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
              <p className="text-lg text-slate-700 mb-2">Listen to the examiner&apos;s question</p>
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

  // ============ RENDER IELTS-STYLE INSTRUCTIONS PAGE ============
  const renderInstructionsPage = () => {
    const config = SECTION_CONFIG[currentSection];
    const sectionTitle = currentSection.charAt(0).toUpperCase() + currentSection.slice(1);
    
    return (
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Header bar with battery/volume indicators */}
        <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back to Question Bank button */}
            <button 
              onClick={() => navigate('/question-bank')}
              className="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Question Bank
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">ID</span>
              </div>
              <span className="text-sm text-slate-300">XXXX.XXXXXXX - 123456</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <div className="w-8 h-3 bg-green-500 rounded-sm"></div>
          </div>
        </div>
        
        {/* Main Instructions Content */}
        <div className="max-w-3xl mx-auto py-12 px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">IELTS {sectionTitle}</h1>
          <p className="text-slate-600 text-lg mb-8">Time: Approximately {config.totalTime / 60} minutes</p>
          
          {/* Instructions to Candidates */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wide">
              Instructions to Candidates
            </h2>
            <ul className="text-slate-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>Answer <strong className="underline">all</strong> the questions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>You can change your answers at any time during the test.</span>
              </li>
            </ul>
          </div>
          
          {/* Information for Candidates */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wide">
              Information for Candidates
            </h2>
            <ul className="text-slate-700 space-y-2">
              {currentSection === 'listening' && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>There are 40 questions in this test.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Each question carries one mark.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>There are four parts to the test.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>You will hear each part once.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>For each part of the test there will be time for you to look through the questions and time for you to check your answers.</span>
                  </li>
                </>
              )}
              {currentSection === 'reading' && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>There are 40 questions in this test.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Each question carries one mark.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>There are three passages in this test.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Passages are of increasing difficulty.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>You should spend approximately 20 minutes on each passage.</span>
                  </li>
                </>
              )}
              {currentSection === 'writing' && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>There are two tasks in this test.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Task 1 requires a minimum of 150 words.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Task 2 requires a minimum of 250 words.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Task 2 contributes twice as much to your Writing score as Task 1.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>You should spend approximately 20 minutes on Task 1 and 40 minutes on Task 2.</span>
                  </li>
                </>
              )}
              {currentSection === 'speaking' && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>There are three parts to this test.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Part 1: Introduction and general questions (4-5 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Part 2: Individual long turn with cue card (3-4 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Part 3: Two-way discussion on abstract topics (4-5 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Speak clearly and naturally. Your responses will be recorded.</span>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          {/* Warning Message */}
          <div className="flex items-center justify-center gap-2 text-blue-600 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>Do not click &apos;Start test&apos; until you are told to do so.</span>
          </div>
          
          {/* Start Button */}
          <div className="flex justify-center">
            <button 
              onClick={() => {
                setShowInstructions(false);
                startSection();
              }}
              className="px-8 py-3 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors shadow-sm"
            >
              Start test
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============ RENDER SECTION START (Legacy) ============
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
    <div className={`min-h-screen flex flex-col 
      ${colorTheme === 'yellow-on-black' ? 'bg-black text-yellow-300' : 
        colorTheme === 'blue-on-white' ? 'bg-white text-blue-900' : 
        colorTheme === 'blue-on-cream' ? 'bg-amber-50 text-blue-900' : 'bg-slate-100'}
      ${textSize === 'large' ? 'text-lg' : textSize === 'extra-large' ? 'text-xl' : 'text-base'}
    `}>
      {/* Show instructions page before starting */}
      {!timerActive && !completedSections.includes(currentSection) && showInstructions ? (
        renderInstructionsPage()
      ) : (
        <>
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
        </>
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

      {/* Settings Modal - IELTS Style */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Settings</span>
              <button 
                onClick={() => setShowSettings(false)} 
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
                        checked={screenResolution === '800x600'}
                        onChange={() => setScreenResolution('800x600')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">800 x 600</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="screenRes" 
                        checked={screenResolution === '1024x768'}
                        onChange={() => setScreenResolution('1024x768')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">1024 x 768</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="screenRes" 
                        checked={screenResolution === '1280x1024'}
                        onChange={() => setScreenResolution('1280x1024')}
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
                  onClick={() => setShowSettings(false)}
                  className="px-12 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal - IELTS Style with Tabs */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Help</span>
              <button 
                onClick={() => setShowHelp(false)} 
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
                          <li>• Read each passage carefully before answering</li>
                          <li>• You can scroll through the passage on the left</li>
                          <li>• Questions appear on the right side</li>
                          <li>• Use the navigation bar to jump between questions</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {currentSection === 'writing' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <h5 className="font-medium text-amber-900 mb-2">Writing Section</h5>
                        <ul className="text-amber-800 text-sm space-y-1">
                          <li>• Read the task carefully before you start writing</li>
                          <li>• Plan your answer before writing</li>
                          <li>• The word count is shown at the top of your answer</li>
                          <li>• You can copy, cut and paste text within your answer</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {currentSection === 'speaking' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-900 mb-2">Speaking Section</h5>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Listen to each question carefully</li>
                          <li>• Click the microphone button to start recording</li>
                          <li>• Speak clearly into your microphone</li>
                          <li>• Your response will be automatically saved</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* OK Button */}
            <div className="p-4 bg-slate-50 border-t flex justify-center">
              <button 
                onClick={() => setShowHelp(false)}
                className="px-12 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Screen Hidden Overlay */}
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
      
      {/* Context Menu for Highlighting/Notes */}
      {contextMenu.show && (
        <div 
          className="fixed bg-white border border-slate-300 rounded-lg shadow-xl z-50 overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={handleHighlight}
            className="w-full px-4 py-2 text-left text-sm hover:bg-yellow-100 flex items-center gap-2 border-b border-slate-200"
          >
            <span className="w-4 h-4 bg-yellow-300 rounded"></span>
            Highlight
          </button>
          <button
            onClick={handleAddNote}
            className="w-full px-4 py-2 text-left text-sm hover:bg-blue-100 flex items-center gap-2"
          >
            <span className="w-4 h-4 bg-blue-300 rounded"></span>
            Notes
          </button>
        </div>
      )}
      
      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-semibold">Add Note</span>
              <button 
                onClick={() => {
                  setShowNoteModal(false);
                  setCurrentNote({ text: '', note: '' });
                  setEditingNoteId(null);
                }} 
                className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Selected Text</label>
                <div className="p-3 bg-yellow-100 rounded border border-yellow-300 text-sm text-slate-700">
                  &quot;{currentNote.text}&quot;
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Note</label>
                <textarea
                  value={currentNote.note}
                  onChange={(e) => setCurrentNote(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  placeholder="Write your note here..."
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => {
                    setShowNoteModal(false);
                    setCurrentNote({ text: '', note: '' });
                    setEditingNoteId(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveNote}
                  disabled={!currentNote.note.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
