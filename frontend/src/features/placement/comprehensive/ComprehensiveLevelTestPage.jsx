import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useI18n } from '../../../lib/i18n';
import {
  API_URL, speakingPrompts, FALLBACK_LISTENING_QUESTIONS, DEFAULT_WRITING_TASKS,
} from './constants';
import { runEvaluation } from './evaluation';
import SelectScreen from './components/SelectScreen';
import IntroScreen from './components/IntroScreen';
import ReadingSection from './components/ReadingSection';
import ListeningSection from './components/ListeningSection';
import WritingSection from './components/WritingSection';
import SpeakingSection from './components/SpeakingSection';
import EvaluatingScreen from './components/EvaluatingScreen';
import ResultsScreen from './components/ResultsScreen';
import NotReadyFallback from './components/NotReadyFallback';

// Orchestrator for the comprehensive placement test. Routed at both
// /comprehensive-level-test and /ge/placement-test (mode="ge") — see App.js.
// Split from pages/ComprehensiveLevelTest.js: stage screens moved verbatim
// into ./components, module-level constants into ./constants and the
// evaluation pipeline into ./evaluation. All state, handlers and effect
// ORDER (reading-questions load → audio cleanup → speaking timer) are
// unchanged from the original file.

export default function ComprehensiveLevelTest({ user, mode = 'ielts' }) {
  const navigate = useNavigate();
  const { t, language } = useI18n();  // Get language from i18n context
  // GE placement reuses the same component (questions are CEFR-shaped, not
  // IELTS-grade). isGE swaps headings + band → CEFR labels so a GE student
  // doesn't see "IELTS Band 3.9" framing on what is effectively a general
  // English placement.
  const isGE = mode === 'ge';
  
  // Reading questions loaded from server
  const [readingQuestions, setReadingQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  
  // Test mode selection: "full" | "reading" | "listening" | "writing" | "speaking"
  const [testMode, setTestMode] = useState(null);
  
  // Stage management - supports both full and individual tests
  const [stage, setStage] = useState('select'); // select, intro, reading, listening, writing, speaking, evaluating, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set()); // For question navigation
  const [currentSpeakingPrompt, setCurrentSpeakingPrompt] = useState(0);
  const [speakingResponses, setSpeakingResponses] = useState([]);
  
  // Listening state
  const [listeningQuestions, setListeningQuestions] = useState([]);
  const [currentListeningSection, setCurrentListeningSection] = useState(0);
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [flaggedListeningQuestions, setFlaggedListeningQuestions] = useState(new Set()); // For listening navigation
  const [audioPlayed, setAudioPlayed] = useState({});
  
  // Writing state
  const [writingTasks, setWritingTasks] = useState([]);
  const [currentWritingTask, setCurrentWritingTask] = useState(0);
  const [writingResponses, setWritingResponses] = useState({});
  
  // Recording state
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  // Results
  const [results, setResults] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  
  // Timer for speaking
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // Toggle flag for a question
  const toggleFlagQuestion = (questionId) => {
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

  // Toggle flag for listening question
  const toggleFlagListeningQuestion = (questionId) => {
    setFlaggedListeningQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Load reading questions from server (without answer keys)
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch(`${API_URL}/api/comprehensive-level-test/reading-questions`);
        if (res.ok) {
          const data = await res.json();
          setReadingQuestions(data.questions || []);
        }
      } catch (e) {
        console.error('Failed to load reading questions:', e);
      } finally {
        setQuestionsLoading(false);
      }
    }
    loadQuestions();
  }, []);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  // Speaking timer
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && timerActive) {
      if (recording) {
        stopRecording();
      }
    }
  }, [timerActive, timeRemaining, recording]);

  const handleReadingAnswer = (questionId, answer) => {
    setReadingAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Handle test mode selection
  const selectTestMode = (mode) => {
    setTestMode(mode);
    setStage('intro');
  };

  // Start the selected test
  const startTest = () => {
    if (testMode === 'full') {
      // Full test starts with reading
      setStage('reading');
      setCurrentQuestion(0);
    } else if (testMode === 'reading') {
      setStage('reading');
      setCurrentQuestion(0);
    } else if (testMode === 'listening') {
      loadListeningQuestions();
      setStage('listening');
      setCurrentListeningSection(0);
    } else if (testMode === 'writing') {
      loadWritingTasks();
      setStage('writing');
      setCurrentWritingTask(0);
    } else if (testMode === 'speaking') {
      setStage('speaking');
      setCurrentSpeakingPrompt(0);
    }
  };

  // Get next stage based on test mode
  const getNextStage = (currentStage) => {
    if (testMode === 'full') {
      const fullOrder = ['reading', 'listening', 'writing', 'speaking', 'evaluating'];
      const currentIdx = fullOrder.indexOf(currentStage);
      return currentIdx < fullOrder.length - 1 ? fullOrder[currentIdx + 1] : 'results';
    }
    // Single skill tests go directly to evaluating after completion
    return 'evaluating';
  };

  const nextReadingQuestion = () => {
    if (!readingAnswers[readingQuestions[currentQuestion].id]) {
      toast.error('Please select an answer before continuing');
      return;
    }
    
    if (currentQuestion < readingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Check test mode for next stage
      if (testMode === 'full') {
        loadListeningQuestions();
        setStage('listening');
        setCurrentListeningSection(0);
      } else {
        // Single reading test - go to evaluation
        evaluateTest();
      }
    }
  };
  
  // Load listening questions from API
  const loadListeningQuestions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/level-test/listening-questions`);
      if (response.ok) {
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          setListeningQuestions(data.questions);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load listening questions:', error);
    }
    
    // Fallback static questions if API fails
    setListeningQuestions(FALLBACK_LISTENING_QUESTIONS);
  };
  
  // Load writing tasks from API
  const loadWritingTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/level-test/writing-tasks`);
      if (response.ok) {
        const data = await response.json();
        setWritingTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to load writing tasks:', error);
      // Use default tasks
      setWritingTasks(DEFAULT_WRITING_TASKS);
    }
  };
  
  // Audio is owned by AudioPlayer (which uses useAudio under the hood). All
  // we track here is whether the user has finished the section's clip at
  // least once — the existing "Audio played" badge depends on it.
  const markSectionAudioPlayed = (sectionId) => {
    setAudioPlayed((prev) => ({ ...prev, [sectionId]: true }));
  };


  // Handle listening answer selection
  const handleListeningAnswer = (questionId, answer) => {
    setListeningAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  // Get unique sections from listening questions
  const getListeningSections = () => {
    const sectionsMap = {};
    listeningQuestions.forEach(q => {
      if (!sectionsMap[q.section_id]) {
        sectionsMap[q.section_id] = {
          id: q.section_id,
          title: q.section_title,
          audio_url: q.audio_url,
          level: q.level,
          band_range: q.band_range,
          questions: []
        };
      }
      sectionsMap[q.section_id].questions.push(q);
    });
    return Object.values(sectionsMap);
  };
  
  // Navigate to next listening section
  const nextListeningSection = () => {
    const sections = getListeningSections();
    
    // Safety check - if no sections, move to writing
    if (!sections || sections.length === 0) {
      loadWritingTasks();
      setStage('writing');
      setCurrentWritingTask(0);
      return;
    }
    
    const currentSection = sections[currentListeningSection];
    
    // Safety check for current section
    if (!currentSection || !currentSection.questions) {
      // Skip to writing if section data is invalid
      loadWritingTasks();
      setStage('writing');
      setCurrentWritingTask(0);
      return;
    }
    
    // Check if all questions in current section are answered
    const unanswered = currentSection.questions.find(q => !listeningAnswers[q.id]);
    if (unanswered) {
      toast.error('Please answer all questions before continuing');
      return;
    }
    
    if (currentListeningSection < sections.length - 1) {
      setCurrentListeningSection(currentListeningSection + 1);
    } else {
      // Check test mode for next stage
      if (testMode === 'full') {
        loadWritingTasks();
        setStage('writing');
        setCurrentWritingTask(0);
      } else {
        // Single listening test - go to evaluation
        evaluateTest();
      }
    }
  };
  
  // Handle writing response change
  const handleWritingChange = (taskId, text) => {
    setWritingResponses(prev => ({ ...prev, [taskId]: text }));
  };
  
  // Get word count for writing response
  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w).length;
  };
  
  // Navigate to next writing task
  const nextWritingTask = () => {
    const currentTask = writingTasks[currentWritingTask];
    const response = writingResponses[currentTask.id] || '';
    const wordCount = getWordCount(response);
    
    if (wordCount < 5) {
      toast.error('Please write at least a few words before continuing');
      return;
    }
    
    if (currentWritingTask < writingTasks.length - 1) {
      setCurrentWritingTask(currentWritingTask + 1);
    } else {
      // Check test mode for next stage
      if (testMode === 'full') {
        setStage('speaking');
        setCurrentSpeakingPrompt(0);
      } else {
        // Single writing test - go to evaluation
        evaluateTest();
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Try to use high-quality audio format
      const options = { mimeType: 'audio/webm;codecs=opus' };
      let mediaRecorder;
      
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback to default if opus not supported
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        
        console.log('Audio recorded:', {
          size: blob.size,
          type: blob.type,
          chunks: audioChunksRef.current.length
        });
        
        setAudioBlob(blob);
        await transcribeAudio(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Request data every 1 second to ensure we capture everything
      mediaRecorder.start(1000);
      setRecording(true);
      setTimerActive(true);
      setTimeRemaining(speakingPrompts[currentSpeakingPrompt].duration);
      toast.success('Recording started...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setTimerActive(false);
    }
  };

  const transcribeAudio = async (blob) => {
    setTranscribing(true);
    
    // Show size for debugging
    console.log('Transcribing audio blob:', {
      size: blob.size,
      type: blob.type,
      sizeMB: (blob.size / 1024 / 1024).toFixed(2) + ' MB'
    });
    
    if (blob.size < 1000) {
      toast.error('Recording too short. Please try again and speak for longer.');
      setTranscribing(false);
      return;
    }
    
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');

    try {
      const response = await fetch(`${API_URL}/api/transcribe-audio`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Transcription failed';
        
        // Check if it's a language detection error
        if (errorMessage.includes('speak in English') || errorMessage.includes('Detected language')) {
          toast.error('🌐 Please speak in English only. This is an English proficiency test.', {
            duration: 5000
          });
          setTranscribing(false);
          return;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      console.log('Transcription result:', {
        text: data.text,
        length: data.text?.length,
        language: data.language
      });
      
      if (!data.text || data.text.trim().length < 10) {
        toast.error('Could not transcribe audio clearly. Please speak louder and try again.');
        setTranscribing(false);
        return;
      }
      
      setCurrentTranscript(data.text);
      
      // Save response
      const updatedResponses = [...speakingResponses];
      updatedResponses[currentSpeakingPrompt] = {
        prompt: speakingPrompts[currentSpeakingPrompt].prompt,
        transcript: data.text,
        audio: blob,
        level: speakingPrompts[currentSpeakingPrompt].level
      };
      setSpeakingResponses(updatedResponses);
      
      toast.success(`Transcribed: ${data.text.split(' ').length} words`);
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio. Please try again.');
    } finally {
      setTranscribing(false);
    }
  };

  const nextSpeakingPrompt = () => {
    if (!speakingResponses[currentSpeakingPrompt]) {
      toast.error('Please record your response before continuing');
      return;
    }
    
    if (currentSpeakingPrompt < speakingPrompts.length - 1) {
      setCurrentSpeakingPrompt(currentSpeakingPrompt + 1);
      setAudioBlob(null);
      setCurrentTranscript('');
    } else {
      evaluateTest();
    }
  };

  // evaluateTest body lives in ./evaluation (runEvaluation) — state and
  // setters are handed over explicitly; behaviour is unchanged.
  const evaluateTest = () =>
    runEvaluation({
      testMode,
      language,
      readingAnswers,
      listeningAnswers,
      writingTasks,
      writingResponses,
      speakingResponses,
      readingQuestions,
      setReadingQuestions,
      setResults,
      setStage,
      setEvaluating,
    });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    // For single skill tests, progress is 0-100% for that skill only
    if (testMode !== 'full') {
      if (stage === 'reading') {
        return ((currentQuestion + 1) / readingQuestions.length) * 100;
      } else if (stage === 'listening') {
        const sections = getListeningSections();
        return ((currentListeningSection + 1) / Math.max(sections.length, 1)) * 100;
      } else if (stage === 'writing') {
        return ((currentWritingTask + 1) / Math.max(writingTasks.length, 1)) * 100;
      } else if (stage === 'speaking') {
        return ((currentSpeakingPrompt + 1) / speakingPrompts.length) * 100;
      }
      return 0;
    }
    
    // Full test: reading (25%) → listening (25%) → writing (25%) → speaking (25%)
    if (stage === 'reading') {
      return ((currentQuestion + 1) / readingQuestions.length) * 25;
    } else if (stage === 'listening') {
      const sections = getListeningSections();
      return 25 + ((currentListeningSection + 1) / Math.max(sections.length, 1)) * 25;
    } else if (stage === 'writing') {
      return 50 + ((currentWritingTask + 1) / Math.max(writingTasks.length, 1)) * 25;
    } else if (stage === 'speaking') {
      return 75 + ((currentSpeakingPrompt + 1) / speakingPrompts.length) * 25;
    }
    return 0;
  };

  // TEST MODE SELECTION SCREEN
  if (stage === 'select') {
    return (
      <SelectScreen
        language={language}
        navigate={navigate}
        selectTestMode={selectTestMode}
      />
    );
  }

  // INTRO SCREEN (after test mode is selected)
  if (stage === 'intro') {
    return (
      <IntroScreen
        language={language}
        testMode={testMode}
        setStage={setStage}
        startTest={startTest}
      />
    );
  }

  // READING SECTION
  if (stage === 'reading') {
    return (
      <ReadingSection
        language={language}
        readingQuestions={readingQuestions}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        readingAnswers={readingAnswers}
        flaggedQuestions={flaggedQuestions}
        toggleFlagQuestion={toggleFlagQuestion}
        handleReadingAnswer={handleReadingAnswer}
        nextReadingQuestion={nextReadingQuestion}
        getProgressPercentage={getProgressPercentage}
      />
    );
  }

  // LISTENING SECTION
  if (stage === 'listening') {
    return (
      <ListeningSection
        language={language}
        getListeningSections={getListeningSections}
        currentListeningSection={currentListeningSection}
        listeningAnswers={listeningAnswers}
        audioPlayed={audioPlayed}
        handleListeningAnswer={handleListeningAnswer}
        markSectionAudioPlayed={markSectionAudioPlayed}
        nextListeningSection={nextListeningSection}
        getProgressPercentage={getProgressPercentage}
      />
    );
  }

  // WRITING SECTION
  if (stage === 'writing') {
    return (
      <WritingSection
        language={language}
        writingTasks={writingTasks}
        currentWritingTask={currentWritingTask}
        writingResponses={writingResponses}
        handleWritingChange={handleWritingChange}
        getWordCount={getWordCount}
        nextWritingTask={nextWritingTask}
        getProgressPercentage={getProgressPercentage}
      />
    );
  }

  // SPEAKING SECTION
  if (stage === 'speaking') {
    return (
      <SpeakingSection
        language={language}
        currentSpeakingPrompt={currentSpeakingPrompt}
        speakingResponses={speakingResponses}
        setSpeakingResponses={setSpeakingResponses}
        recording={recording}
        transcribing={transcribing}
        currentTranscript={currentTranscript}
        setCurrentTranscript={setCurrentTranscript}
        setAudioBlob={setAudioBlob}
        timeRemaining={timeRemaining}
        formatTime={formatTime}
        startRecording={startRecording}
        stopRecording={stopRecording}
        nextSpeakingPrompt={nextSpeakingPrompt}
        getProgressPercentage={getProgressPercentage}
      />
    );
  }

  // EVALUATING SCREEN
  if (stage === 'evaluating') {
    return <EvaluatingScreen language={language} />;
  }

  // RESULTS SCREEN
  if (stage === 'results' && results) {
    return (
      <ResultsScreen
        results={results}
        evaluating={evaluating}
        testMode={testMode}
        isGE={isGE}
        language={language}
        user={user}
        navigate={navigate}
        readingQuestions={readingQuestions}
        readingAnswers={readingAnswers}
        setTestMode={setTestMode}
        setStage={setStage}
        setCurrentQuestion={setCurrentQuestion}
        setReadingAnswers={setReadingAnswers}
        setListeningAnswers={setListeningAnswers}
        setWritingResponses={setWritingResponses}
        setSpeakingResponses={setSpeakingResponses}
        setCurrentListeningSection={setCurrentListeningSection}
        setCurrentWritingTask={setCurrentWritingTask}
        setCurrentSpeakingPrompt={setCurrentSpeakingPrompt}
        setResults={setResults}
      />
    );
  }

  // Defensive fallback. If somehow we end up at stage=results without a
  // results object (e.g. evaluation timed out, hot-reload), show a
  // recoverable surface instead of a blank screen so the user can either
  // retry or sign up / head back to the dashboard. This is the surface
  // Aga reported as "blank page → terk etti gitti" on 2026-05-23.
  return <NotReadyFallback language={language} user={user} navigate={navigate} />;
}
