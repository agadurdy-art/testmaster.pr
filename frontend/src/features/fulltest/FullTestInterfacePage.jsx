import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FullTestSpeakingSection from '../speaking/surfaces/fulltest/FullTestSpeakingSection';
import { Button } from '../../components/ui/button';
import { Loader2, ChevronRight } from 'lucide-react';
import { API_URL, SECTION_CONFIG } from './constants';
import useHighlightsNotes from './hooks/useHighlightsNotes';
import TestHeader from './components/TestHeader';
import NavigationBar from './components/NavigationBar';
import ListeningSection from './components/ListeningSection';
import ReadingSection from './components/ReadingSection';
import WritingSection from './components/WritingSection';
import InstructionsPage from './components/InstructionsPage';
import SectionStartCard from './components/SectionStartCard';
import ConfirmSubmitModal from './components/ConfirmSubmitModal';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import ScreenHiddenOverlay from './components/ScreenHiddenOverlay';
import HighlightContextMenu from './components/HighlightContextMenu';
import NoteModal from './components/NoteModal';

export default function FullTestInterfacePage({ user }) {
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

  // Highlighting & Notes state + handlers (features/fulltest/hooks)
  const {
    highlights,
    setHighlights,
    notes,
    setNotes,
    contextMenu,
    showNoteModal,
    setShowNoteModal,
    currentNote,
    setCurrentNote,
    setEditingNoteId,
    handleTextSelection,
    handleHighlight,
    handleAddNote,
    saveNote,
    removeHighlight,
    renderTextWithHighlights,
  } = useHighlightsNotes(currentSection);

  // Listening specific
  const [listeningPart, setListeningPart] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioEndedParts, setAudioEndedParts] = useState({}); // Track per-part audio status
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = useRef(null);

  // Reading specific
  const [currentPassage, setCurrentPassage] = useState(0);

  // Writing specific
  const [writingTask, setWritingTask] = useState(1);
  const [wordCount, setWordCount] = useState({ task1: 0, task2: 0 });

  // Speaking specific — page-owned cross-section state only. The state
  // machine, timers, MediaRecorder plumbing and the evaluate-fulltest POST
  // all live in features/speaking/surfaces/fulltest/FullTestSpeakingSection.
  //   - recordings: read by the bottom submit bar (speakingReady check).
  //   - speakingState: read to disable submit while EVALUATING.
  //   - speakingSubmitRef: filled by the section component with its
  //     submitFullTestSpeaking so submitCurrentSection can trigger it.
  const [speakingState, setSpeakingState] = useState('IDLE');
  const [recordings, setRecordings] = useState({}); // { part1: {blob,url,duration}, part2, part3 }
  const [fulltestSpeakingResult, setFulltestSpeakingResult] = useState(null); // eslint-disable-line no-unused-vars
  const speakingSubmitRef = useRef(null);

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
    // Speaking goes through the holistic /api/speaking/evaluate-fulltest path
    // (multipart with 3 audio blobs); skip the legacy JSON submit-section.
    // The submit lives in FullTestSpeakingSection, which fills this ref.
    if (currentSection === 'speaking') {
      await speakingSubmitRef.current?.();
      return;
    }

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
          section_times: sectionTimes,
          user_id: (() => { try { return JSON.parse(localStorage.getItem('user'))?.id; } catch { return null; } })()
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
        audioRef.current.play().catch(e => console.error('Audio play failed:', e));
      }
    }
  };

  const handleAudioEnded = () => {
    setAudioPlaying(false);
    setAudioCurrentTime(0);
    // Mark this specific part as ended
    setAudioEndedParts(prev => ({ ...prev, [listeningPart]: true }));
    if (listeningPart < 4) {
      setTimeout(() => {
        setAudioDuration(0);
        setAudioCurrentTime(0);
        setListeningPart(prev => prev + 1);
      }, 2000);
    }
  };

  // Receives the holistic fulltest evaluation from FullTestSpeakingSection
  // after a successful /api/speaking/evaluate-fulltest POST, and threads it
  // into sectionAnswers so completeTest forwards it to the backend (which
  // short-circuits the legacy speaking evaluator when fulltest_eval is
  // present).
  const handleSpeakingResult = (data) => {
    setFulltestSpeakingResult(data);
    setSectionAnswers(prev => ({
      ...prev,
      speaking: { fulltest_eval: data },
    }));
    setCompletedSections(prev => prev.includes('speaking') ? prev : [...prev, 'speaking']);

    if (isSingleSectionMode) {
      navigate(`/full-test/results/${sessionId}`, {
        state: { results: { sections: { speaking: data } } },
      });
      return;
    }
    // Continue normal flow — completeTest aggregates all sections
    completeTest();
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
        <InstructionsPage
          currentSection={currentSection}
          onStart={() => {
            setShowInstructions(false);
            startSection();
          }}
        />
      ) : (
        <>
          <TestHeader
            timeRemaining={timeRemaining}
            setShowSettings={setShowSettings}
            setShowHelp={setShowHelp}
            setScreenHidden={setScreenHidden}
          />

          {!timerActive && !completedSections.includes(currentSection) ? (
            <SectionStartCard currentSection={currentSection} startSection={startSection} />
          ) : (
            <>
              {currentSection === 'listening' && (
                <ListeningSection
                  testData={testData}
                  testId={testId}
                  listeningPart={listeningPart}
                  sectionAnswers={sectionAnswers}
                  updateAnswer={updateAnswer}
                  handleTextSelection={handleTextSelection}
                  audioRef={audioRef}
                  audioPlaying={audioPlaying}
                  setAudioPlaying={setAudioPlaying}
                  audioEndedParts={audioEndedParts}
                  audioDuration={audioDuration}
                  setAudioDuration={setAudioDuration}
                  audioCurrentTime={audioCurrentTime}
                  setAudioCurrentTime={setAudioCurrentTime}
                  handlePlayAudio={handlePlayAudio}
                  handleAudioEnded={handleAudioEnded}
                />
              )}
              {currentSection === 'reading' && (
                <ReadingSection
                  testData={testData}
                  currentPassage={currentPassage}
                  highlights={highlights}
                  notes={notes}
                  setHighlights={setHighlights}
                  setNotes={setNotes}
                  removeHighlight={removeHighlight}
                  renderTextWithHighlights={renderTextWithHighlights}
                  handleTextSelection={handleTextSelection}
                  sectionAnswers={sectionAnswers}
                  updateAnswer={updateAnswer}
                />
              )}
              {currentSection === 'writing' && (
                <WritingSection
                  testData={testData}
                  writingTask={writingTask}
                  setWritingTask={setWritingTask}
                  wordCount={wordCount}
                  setWordCount={setWordCount}
                  sectionAnswers={sectionAnswers}
                  setSectionAnswers={setSectionAnswers}
                />
              )}
              {currentSection === 'speaking' && (
                <FullTestSpeakingSection
                  sectionData={testData?.sections?.speaking}
                  testId={testId}
                  sessionId={sessionId}
                  recordings={recordings}
                  setRecordings={setRecordings}
                  speakingState={speakingState}
                  setSpeakingState={setSpeakingState}
                  setSubmitting={setSubmitting}
                  setShowConfirmSubmit={setShowConfirmSubmit}
                  onSpeakingResult={handleSpeakingResult}
                  submitRef={speakingSubmitRef}
                />
              )}
            </>
          )}

          {timerActive && (currentSection === 'listening' || currentSection === 'reading') && (
            <NavigationBar
              currentSection={currentSection}
              currentQuestion={currentQuestion}
              setCurrentQuestion={setCurrentQuestion}
              sectionAnswers={sectionAnswers}
              reviewedQuestions={reviewedQuestions}
              toggleReview={toggleReview}
              setListeningPart={setListeningPart}
              setCurrentPassage={setCurrentPassage}
              setShowConfirmSubmit={setShowConfirmSubmit}
            />
          )}

          {/* Submit button for writing/speaking */}
          {timerActive && (currentSection === 'writing' || currentSection === 'speaking') && (() => {
            const speakingReady =
              currentSection !== 'speaking' ||
              ['part1', 'part2', 'part3'].every(k => recordings[k]?.blob);
            return (
              <div className="bg-slate-100 border-t p-4 flex justify-end">
                <Button
                  onClick={() => setShowConfirmSubmit(true)}
                  disabled={!speakingReady || speakingState === 'EVALUATING'}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  title={!speakingReady ? 'Record all 3 parts first' : ''}
                >
                  Submit {currentSection} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            );
          })()}
        </>
      )}

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <ConfirmSubmitModal
          currentSection={currentSection}
          submitting={submitting}
          setShowConfirmSubmit={setShowConfirmSubmit}
          submitCurrentSection={submitCurrentSection}
        />
      )}

      {/* Settings Modal - IELTS Style */}
      {showSettings && (
        <SettingsModal
          textSize={textSize}
          setTextSize={setTextSize}
          colorTheme={colorTheme}
          setColorTheme={setColorTheme}
          screenResolution={screenResolution}
          setScreenResolution={setScreenResolution}
          setShowSettings={setShowSettings}
        />
      )}

      {/* Help Modal - IELTS Style with Tabs */}
      {showHelp && (
        <HelpModal
          helpTab={helpTab}
          setHelpTab={setHelpTab}
          currentSection={currentSection}
          setShowHelp={setShowHelp}
        />
      )}

      {/* Screen Hidden Overlay */}
      {screenHidden && <ScreenHiddenOverlay setScreenHidden={setScreenHidden} />}

      {/* Context Menu for Highlighting/Notes */}
      {contextMenu.show && (
        <HighlightContextMenu
          contextMenu={contextMenu}
          handleHighlight={handleHighlight}
          handleAddNote={handleAddNote}
        />
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <NoteModal
          currentNote={currentNote}
          setCurrentNote={setCurrentNote}
          saveNote={saveNote}
          setShowNoteModal={setShowNoteModal}
          setEditingNoteId={setEditingNoteId}
        />
      )}
    </div>
  );
}
