import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
  ArrowLeft, Headphones, BookOpen, PenTool, Mic,
  Clock, Play, Pause, Volume2, Settings, HelpCircle, EyeOff,
  ChevronRight, Timer, AlertTriangle, Target, CheckCircle, RefreshCw,
  Highlighter, StickyNote, X, Edit3, Trash2, ChevronLeft, Send,
  ListChecks, Eye, FileText, MessageSquare, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import CambridgeSpeakingSection from '../../../speaking/surfaces/cambridge/CambridgeSpeakingSection';
import { evaluateAllSpeakingParts } from '../../../speaking/surfaces/cambridge/evaluateAllSpeakingParts';
import { API_URL, SECTION_TIMES, SECTIONS } from './constants';
import { useCambridgeTestData } from './hooks/useCambridgeTestData';
import InstructionsScreen from './components/InstructionsScreen';
import ListeningSection from './components/ListeningSection';
import ReadingSection from './components/ReadingSection';
import WritingSection from './components/WritingSection';
import QuestionNavigationBar from './components/QuestionNavigationBar';
import ReviewPanel from './components/ReviewPanel';
import {
  SubmitModal, NoteModal, SettingsModal, HelpModal, ScreenHiddenOverlay,
} from './components/InterfaceModals';

// Orchestrator for the Cambridge computer-delivered test interface.
// Section renderers / nav bar / modals were extracted verbatim into
// ./components; test loading into ./hooks/useCambridgeTestData. All state,
// handlers and effect ORDER are unchanged from pages/CambridgeTestInterface.js.

export default function CambridgeTestInterface() {
  const { bookId, testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retry wrong-only mode from results page
  const retryWrongOnly = location.state?.retryWrongOnly || false;
  const wrongQuestions = location.state?.wrongQuestions || {};
  const retryLabel = location.state?.retryLabel || null;
  
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
  

  // Test state (fetch + loading flag live in useCambridgeTestData)
  const { testData, loading } = useCambridgeTestData(bookId, testId);
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

  // Per-section elapsed minutes captured on submit. Powers the
  // Time Management card on the results page (e.g. "42 / 60 min").
  const [sectionDurations, setSectionDurations] = useState({});
  
  // UI state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [completedSections, setCompletedSections] = useState([]);
  
  // Speaking section state that must live at PAGE level. The speaking UI +
  // flow logic itself moved to
  // features/speaking/surfaces/cambridge/CambridgeSpeakingSection.jsx, but
  // these pieces stay here because they are read by page-level code
  // (getAnsweredCount header counter, handleSubmitSection's evaluation) and
  // must survive the speaking component unmounting when the candidate tabs
  // to another section:
  const [questionPlayCounts, setQuestionPlayCounts] = useState({});  // Track plays per question (2-play TTS limit must persist across section switches)
  const [questionRecordings, setQuestionRecordings] = useState({});  // Store recordings per question
  // Retain each answer's actual audio blob + spoken duration so the speaking
  // section can be evaluated per-question at submit time. questionRecordings
  // only stores object URLs (for playback); these are what we POST.
  // Key = same `part${currentPart}_q${questionIndex}` recording key.
  const speakingBlobsRef = useRef({}); // recordingKey -> { blob, duration, mimeType }

  // Evaluation state (page-level: drives the submit modal spinner and the
  // payload handed to the results page)
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [questionEvaluations, setQuestionEvaluations] = useState({});

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

  const handleSubmitSection = async () => {
    setCompletedSections(prev => [...prev, currentSection]);

    // Speaking is evaluated at submit: one structured (per-question) call per
    // part. Done before navigation so the results page receives real data
    // instead of the empty map it used to get. `speakingEvals` is passed
    // directly (setState is async and wouldn't be visible to navigate()).
    let speakingEvals = questionEvaluations;
    if (currentSection === 'speaking') {
      setIsEvaluating(true);
      try {
        speakingEvals = await evaluateAllSpeakingParts({
          parts: testData?.sections?.speaking?.parts || [],
          blobs: speakingBlobsRef.current,
          user,
          bookId,
          testId,
        });
        setQuestionEvaluations(speakingEvals);
      } catch (e) {
        console.error('Speaking evaluation failed:', e);
        speakingEvals = questionEvaluations;
      } finally {
        setIsEvaluating(false);
      }
    }

    // Capture elapsed minutes for THIS section before we move on. The
    // timer counts down from SECTION_TIMES[section]; elapsed = budget − left.
    const budgetSec = SECTION_TIMES[currentSection] || 0;
    const elapsedMin = Math.max(0, Math.round((budgetSec - sectionTimeLeft) / 60));
    const updatedDurations = { ...sectionDurations, [currentSection]: elapsedMin };
    setSectionDurations(updatedDurations);

    // In skill mode, go directly to results after submitting the single section
    if (isSkillMode) {
      navigate(`/cambridge-test/${bookId}/${testId}/results`, {
        state: {
          answers,
          testData,
          mode: 'skill',
          skill: skillParam,
          speakingEvaluations: speakingEvals,
          sectionDurations: updatedDurations,
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
      // Track Cambridge test completion
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData?.id) {
          fetch(`${API_URL}/api/user/track-completion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userData.id,
              test_id: `${bookId}_${testId}`,
              category: 'cambridge',
              band_score: 0,
            })
          }).catch(() => {});
        }
      } catch {}
      navigate(`/cambridge-test/${bookId}/${testId}/results`, {
        state: {
          answers,
          testData,
          mode: 'full',
          speakingEvaluations: speakingEvals,
          sectionDurations: updatedDurations,
        }
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
    if (section === 'speaking') {
      // Speaking responses live in questionRecordings, not answers{}.
      // Part 1 = currentPart 0 → keys part0_q*; Part 2 = part1_qpart2 (legacy);
      // Part 3 = currentPart 2 → keys part2_q*. Count parts with ≥1 recording.
      const recKeys = Object.keys(questionRecordings || {});
      const part1Done = recKeys.some(k => /^part0_q\d+$/.test(k));
      const part2Done = !!questionRecordings?.part1_qpart2;
      const part3Done = recKeys.some(k => /^part2_q\d+$/.test(k));
      return [part1Done, part2Done, part3Done].filter(Boolean).length;
    }
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

  // Toggle review for a question
  const toggleReview = (questionNum) => {
    setReviewedQuestions(prev => ({
      ...prev,
      [questionNum]: !prev[questionNum]
    }));
  };

  const sections = SECTIONS;

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
    return (
      <InstructionsScreen
        sections={sections}
        currentSection={currentSection}
        testData={testData}
        sectionData={sectionData}
        isSkillMode={isSkillMode}
        handleStartTest={handleStartTest}
      />
    );
  }

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

      {/* Retry Wrong-Only Mode Banner */}
      {retryWrongOnly && (
        <div data-testid="retry-wrong-banner" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium text-sm">
                Retry Mode{retryLabel ? `: ${retryLabel}` : ''} ({Object.keys(wrongQuestions).length} questions)
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/cambridge-test/${bookId}/${testId}`)}
              className="text-white hover:bg-white/20 text-xs"
            >
              Full Test
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {currentSection === 'listening' && (
          <ListeningSection
            sectionData={sectionData}
            currentPart={currentPart}
            setCurrentPart={setCurrentPart}
            answers={answers}
            setAnswers={setAnswers}
            handleAnswerChange={handleAnswerChange}
            renderGapFill={renderGapFill}
            audioRef={audioRef}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            toggleAudio={toggleAudio}
            audioProgress={audioProgress}
            audioDuration={audioDuration}
            audioCurrentTime={audioCurrentTime}
            handleAudioTimeUpdate={handleAudioTimeUpdate}
            handleAudioLoaded={handleAudioLoaded}
            formatTime={formatTime}
          />
        )}
        {currentSection === 'reading' && (
          <ReadingSection
            sectionData={sectionData}
            currentPart={currentPart}
            setCurrentPart={setCurrentPart}
            answers={answers}
            setAnswers={setAnswers}
            handleAnswerChange={handleAnswerChange}
            renderGapFill={renderGapFill}
            highlights={highlights}
            setHighlights={setHighlights}
            notes={notes}
            setNotes={setNotes}
            deleteHighlight={deleteHighlight}
            handleTextSelection={handleTextSelection}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            addHighlight={addHighlight}
            addNoteToHighlight={addNoteToHighlight}
            getAnsweredCount={getAnsweredCount}
            setShowReviewPanel={setShowReviewPanel}
          />
        )}
        {currentSection === 'writing' && (
          <WritingSection
            sectionData={sectionData}
            currentPart={currentPart}
            setCurrentPart={setCurrentPart}
            answers={answers}
            setAnswers={setAnswers}
          />
        )}
        {currentSection === 'speaking' && (
          <CambridgeSpeakingSection
            sectionData={sectionData}
            currentSection={currentSection}
            currentPart={currentPart}
            setCurrentPart={setCurrentPart}
            user={user}
            questionRecordings={questionRecordings}
            setQuestionRecordings={setQuestionRecordings}
            questionPlayCounts={questionPlayCounts}
            setQuestionPlayCounts={setQuestionPlayCounts}
            speakingBlobsRef={speakingBlobsRef}
            setIsEvaluating={setIsEvaluating}
            setQuestionEvaluations={setQuestionEvaluations}
          />
        )}
      </div>

      {/* IELTS-Style Question Navigation Bar */}
      <QuestionNavigationBar
        currentSection={currentSection}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        reviewedQuestions={reviewedQuestions}
        toggleReview={toggleReview}
        answers={answers}
        retryWrongOnly={retryWrongOnly}
        wrongQuestions={wrongQuestions}
        setCurrentPart={setCurrentPart}
        setShowSubmitModal={setShowSubmitModal}
      />
      
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
      <SubmitModal
        show={showSubmitModal}
        isEvaluating={isEvaluating}
        currentSection={currentSection}
        setShowSubmitModal={setShowSubmitModal}
        handleSubmitSection={handleSubmitSection}
      />

      {/* Note Modal */}
      <NoteModal
        show={showNoteModal}
        currentNote={currentNote}
        setCurrentNote={setCurrentNote}
        setShowNoteModal={setShowNoteModal}
        saveNote={saveNote}
      />

      {/* Review Panel */}
      <ReviewPanel
        showReviewPanel={showReviewPanel}
        setShowReviewPanel={setShowReviewPanel}
        answers={answers}
        currentSection={currentSection}
        getTotalQuestions={getTotalQuestions}
        getAnsweredCount={getAnsweredCount}
        highlights={highlights}
        notes={notes}
        deleteHighlight={deleteHighlight}
        setCurrentPart={setCurrentPart}
        setShowSubmitModal={setShowSubmitModal}
      />

      {/* Settings Modal - IELTS Style (from FullTestInterface) */}
      <SettingsModal
        show={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        textSize={textSize}
        setTextSize={setTextSize}
        colorTheme={colorTheme}
        setColorTheme={setColorTheme}
      />

      {/* Help Modal - IELTS Style with Tabs (from FullTestInterface) */}
      <HelpModal
        show={showHelpModal}
        setShowHelpModal={setShowHelpModal}
        helpTab={helpTab}
        setHelpTab={setHelpTab}
        currentSection={currentSection}
      />

      {/* Screen Hidden Overlay - from FullTestInterface */}
      <ScreenHiddenOverlay show={screenHidden} setScreenHidden={setScreenHidden} />


    </div>
  );
}
