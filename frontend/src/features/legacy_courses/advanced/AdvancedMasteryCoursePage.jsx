import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoBack } from '../../../hooks/useGoBack';
import { toast } from 'sonner';
import { useTheme, THEME_MODES } from '../../../contexts/ThemeContext';
import { WritingEvaluationResult, ReadingEvaluationResult } from '../../../components/EvaluationResult';
import { useI18n } from '../../../lib/i18n';
import { getEnglishOnlyNotice } from '../../../lib/languageLock';
import { canAccessCourse, canAccessCourseLesson } from '../../../lib/planAccess';
import { 
  markSectionComplete, 
  getLessonProgress, 
  isLessonCompleted, 
  getCourseProgress,
  isSectionCompleted,
  markLessonComplete
} from '../../../lib/progressTracker';
import SignUpCTA from '../../../components/SignUpCTA';
import ModulesListView from './components/ModulesListView';
import SectionTabs from './components/SectionTabs';
import ModuleDetailView from './components/ModuleDetailView';
import VocabularySection from './components/VocabularySection';
import GrammarSection from './components/GrammarSection';
import ListeningSection from './components/ListeningSection';
import ReadingSection from './components/ReadingSection';
import SpeakingSection from './components/SpeakingSection';
import WritingSection from './components/WritingSection';
import QuizSection from './components/QuizSection';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdvancedMasteryCourse({ user }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [searchParams] = useSearchParams();
  const { language } = useI18n();
  
  // Check for preview mode and lesson from URL
  const isPreviewMode = searchParams.get('preview') === 'true';
  const lessonIdFromUrl = searchParams.get('lesson');
  const focusFromUrl = searchParams.get('focus'); // e.g., 'vocabulary' (from /vocabulary browse deep-link)
  
  // English-only notice for this IELTS-level module
  const englishNotice = getEnglishOnlyNotice(language);
  
  // Theme support
  const { activeTheme } = useTheme();
  const isDark = activeTheme === THEME_MODES.DARK;
  const isNightShift = activeTheme === THEME_MODES.NIGHT_SHIFT;
  
  // Theme-aware classes
  const bgMain = isDark ? 'bg-gray-900' : isNightShift ? 'bg-amber-50' : 'bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-100';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : isNightShift ? 'bg-amber-100/50 border-amber-200' : 'bg-white border-gray-200';
  const bgHeader = isDark ? 'bg-gray-800/95 border-gray-700' : isNightShift ? 'bg-amber-100/95 border-amber-200' : 'bg-white/80 border-gray-100';
  const textPrimary = isDark ? 'text-gray-100' : isNightShift ? 'text-amber-900' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : isNightShift ? 'text-amber-700' : 'text-gray-600';
  const bgSubtle = isDark ? 'bg-gray-700/50' : isNightShift ? 'bg-amber-100/30' : 'bg-gray-50';
  
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentSection, setCurrentSection] = useState('vocabulary');
  const [view, setView] = useState('modules');
  const [loading, setLoading] = useState(true);
  
  // Speaking state
  const [isRecording, setIsRecording] = useState(false);
  const [speakingResponse, setSpeakingResponse] = useState('');
  const [speakingFeedback, setSpeakingFeedback] = useState(null);
  const [speakingLoading, setSpeakingLoading] = useState(false);
  const [speakingAudioBlob, setSpeakingAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Writing state
  const [writingResponse, setWritingResponse] = useState('');
  const [writingFeedback, setWritingFeedback] = useState(null);
  const [writingLoading, setWritingLoading] = useState(false);
  const [writingTrack, setWritingTrack] = useState('academic'); // Dual-Track support
  const [generalLessons, setGeneralLessons] = useState([]);
  const [selectedGeneralLesson, setSelectedGeneralLesson] = useState(null);
  const [languageBooster, setLanguageBooster] = useState(null); // Module-Specific Language Booster
  const [strategicWriting, setStrategicWriting] = useState(null); // Module-Specific Strategic Writing
  const [strategicReading, setStrategicReading] = useState(null); // Module-Specific Strategic Reading (Academic)
  const [generalReading, setGeneralReading] = useState(null); // Module-Specific Reading (General Training)
  const [readingTrack, setReadingTrack] = useState('academic'); // Dual-Track support for Reading
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
  // Listening state
  const [isPlayingListening, setIsPlayingListening] = useState(false);
  const [listeningProgress, setListeningProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const listeningAudioRef = useRef(null);
  const hasFullCourseAccess = canAccessCourse(user, 'achiever');
  const canAccessModule = (module) => canAccessCourseLesson(user, 'achiever', module?.module_number);

  useEffect(() => { 
    loadModules();
    fetchGeneralLessons();
    
    // Cleanup audio when component unmounts
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

  // Auto-select module from URL parameter (for preview mode from landing page)
  useEffect(() => {
    if (lessonIdFromUrl && modules.length > 0) {
      const targetModule = modules.find(m => 
        String(m.id) === lessonIdFromUrl || 
        String(m.module_number) === lessonIdFromUrl
      );
      if (targetModule) {
        if (!canAccessModule(targetModule)) {
          toast.info('Free preview includes only Lesson 1 of this course.');
          navigate('/pricing?from=Advanced%20Mastery');
          return;
        }
        setSelectedModule(targetModule);
        setView('module-detail');
        // Deep-link focus: vocabulary | writing | reading | listening | speaking | grammar
        const validFocus = ['vocabulary', 'writing', 'reading', 'listening', 'speaking', 'grammar'];
        if (validFocus.includes(focusFromUrl)) {
          setCurrentSection(focusFromUrl);
          // Scroll after render so the section card is centred without the header overlap.
          // Two scrolls — first at 250ms (fast renders), second at 700ms (slower
          // hydration when section data resolves from network). Section ID
          // convention: `${focus}-section` (only `vocabulary-section` exists today;
          // others will scroll-to-top fallback if missing, which is fine since
          // setCurrentSection already swaps the rendered card).
          const scrollToSection = () => {
            const el = document.getElementById(`${focusFromUrl}-section`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          };
          setTimeout(scrollToSection, 250);
          setTimeout(scrollToSection, 700);
        }
      } else {
        // Theme N from /vocabulary deep-linked here but no matching module came
        // back from /api/advanced-mastery/modules — usually means the local
        // backend hasn't seeded that theme. Tell the user instead of silently
        // landing them on the module list with no explanation.
        toast.info(`Lesson ${lessonIdFromUrl} isn't available yet — pick a theme from the list below.`);
      }
    }
  }, [lessonIdFromUrl, focusFromUrl, modules]);

  const loadModules = async () => {
    try {
      const res = await fetch(`${API_URL}/api/advanced-mastery/modules`);
      if (res.ok) {
        const data = await res.json();
        setModules(data.sort((a, b) => a.module_number - b.module_number));
      }
    } catch (e) {
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  // Fetch General Training lessons for Writing
  const fetchGeneralLessons = async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/advanced/general`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.success && data.lessons) {
        // Filter writing-related lessons
        const writingLessons = data.lessons.filter(l => 
          l.writing || l.topic?.toLowerCase().includes('letter') || l.topic?.toLowerCase().includes('tone')
        );
        setGeneralLessons(writingLessons);
        if (writingLessons.length > 0) {
          setSelectedGeneralLesson(writingLessons[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching general lessons:', error);
    }
  };

  const selectModule = async (module) => {
    if (!canAccessModule(module)) {
      toast.info('Free preview includes only Lesson 1 of this course.');
      navigate('/pricing?from=Advanced%20Mastery');
      return;
    }
    try {
      const params = new URLSearchParams({ user_plan: user?.plan || 'free' });
      const res = await fetch(`${API_URL}/api/advanced-mastery/modules/${module.id}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedModule(data);
        setView('module-detail');
        setCurrentSection('vocabulary');
        // Reset states
        setSpeakingResponse('');
        setSpeakingFeedback(null);
        setWritingResponse('');
        setWritingFeedback(null);
        setQuizAnswers({});
        setQuizResults(null);
        setQuizSubmitted(false);
        setStrategicReading(null);
        setGeneralReading(null);
        setReadingTrack('academic');
        // Fetch module-specific language booster
        fetchModuleLanguageBooster(data.title || module.title);
      }
    } catch (e) {
      toast.error('Failed to load module');
    }
  };

  // Fetch Module-Specific Language Booster AND Strategic Writing/Reading for Advanced
  const fetchModuleLanguageBooster = async (moduleTitle) => {
    try {
      // Map module titles to strategic writing module IDs
      // Must match backend content file module IDs
      const titleToStrategicModule = {
        'digital frontier': 'digital_frontier',
        'digital': 'digital_frontier',
        'technology': 'digital_frontier',
        'ai': 'digital_frontier',
        'automation': 'digital_frontier',
        'green imperative': 'green_imperative',
        'environment': 'green_imperative',
        'ecological': 'green_imperative',
        'climate': 'green_imperative',
        'sustainable': 'green_imperative',
        'educational paradigm': 'work_employment', // map to closest available
        'education': 'work_employment',
        'pedagogical': 'work_employment',
        'globalisation': 'digital_frontier',
        'globalization': 'digital_frontier',
        'cultural identity': 'digital_frontier',
        'health': 'health_public_policy',
        'public policy': 'health_public_policy',
        'medical': 'health_public_policy',
        'healthcare': 'health_public_policy',
        'crime': 'crime_justice',
        'justice': 'crime_justice',
        'penal': 'crime_justice',
        'reintegration': 'crime_justice',
        'law': 'crime_justice',
        'media': 'digital_frontier', // map to digital_frontier (closest topic)
        'information': 'digital_frontier',
        'journalism': 'digital_frontier',
        'economy': 'work_employment',
        'wealth': 'work_employment',
        'government': 'health_public_policy',
        'urbanisation': 'green_imperative',
        'urbanization': 'green_imperative',
        'modern society': 'work_employment',
        'science': 'health_public_policy',
        'bioethics': 'health_public_policy',
        'biomedical': 'health_public_policy',
        'transport': 'green_imperative',
        'work': 'work_employment',
        'employment': 'work_employment',
        'labor': 'work_employment',
        'labour': 'work_employment',
        'social': 'work_employment',
        'demographics': 'work_employment',
        'generational': 'work_employment',
        'tourism': 'green_imperative',
        'heritage': 'green_imperative',
        'mobility': 'green_imperative',
      };
      
      const normalizedTitle = moduleTitle?.toLowerCase() || '';
      let strategicModuleId = 'digital_frontier'; // default
      
      // Find matching strategic module
      for (const [key, value] of Object.entries(titleToStrategicModule)) {
        if (normalizedTitle.includes(key)) {
          strategicModuleId = value;
          break;
        }
      }
      
      // Fetch strategic writing content for Advanced
      try {
        const strategicResponse = await fetch(`${API_URL}/api/courses/advanced-strategic-writing/${strategicModuleId}`);
        if (strategicResponse.ok) {
          const strategicData = await strategicResponse.json();
          if (strategicData.success) {
            setStrategicWriting(strategicData.strategic_writing);
          }
        }
      } catch (e) {
        console.error('Error fetching strategic writing:', e);
      }
      
      // Fetch Academic strategic reading content for Advanced (NEW API)
      try {
        const academicReadingResponse = await fetch(`${API_URL}/api/courses/reading/academic/advanced/${strategicModuleId}`);
        if (academicReadingResponse.ok) {
          const academicData = await academicReadingResponse.json();
          if (academicData.success && academicData.module) {
            setStrategicReading(academicData.module);
          }
        }
      } catch (e) {
        console.error('Error fetching academic reading:', e);
      }
      
      // Fetch General Training Reading content for Advanced
      // First try new API, then fallback to old strategic reading API
      try {
        const generalReadingResponse = await fetch(`${API_URL}/api/courses/reading/general/advanced/${strategicModuleId}`);
        if (generalReadingResponse.ok) {
          const generalData = await generalReadingResponse.json();
          if (generalData.success && generalData.module) {
            setGeneralReading(generalData.module);
          }
        }
      } catch (e) {
        console.error('Error fetching general reading from new API:', e);
        // Fallback to old strategic reading API (which has GT content)
        try {
          const oldApiResponse = await fetch(`${API_URL}/api/courses/advanced-strategic-reading/${strategicModuleId}`);
          if (oldApiResponse.ok) {
            const oldData = await oldApiResponse.json();
            if (oldData.success && oldData.strategic_reading) {
              setGeneralReading(oldData.strategic_reading);
            }
          }
        } catch (fallbackError) {
          console.error('Fallback general reading also failed:', fallbackError);
        }
      }
      
      // Also fetch language booster as fallback
      const topicToBooster = {
        'technology': 'technology',
        'environment': 'environment',
        'health': 'health',
        'education': 'education',
        'culture': 'culture',
        'science': 'science',
        'media': 'media',
        'transport': 'transport',
        'crime': 'crime',
        'work': 'work',
        'travel': 'travel',
        'housing': 'housing',
        'finance': 'finance',
        'family': 'family',
        'food': 'food',
        'sports': 'sports',
        'leisure': 'leisure',
      };
      
      let boosterModule = 'education';
      for (const [key, value] of Object.entries(topicToBooster)) {
        if (normalizedTitle.includes(key)) {
          boosterModule = value;
          break;
        }
      }
      
      const response = await fetch(`${API_URL}/api/courses/language-booster/${boosterModule}`);
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.success) {
        setLanguageBooster(data.language_booster);
      }
    } catch (error) {
      console.error('Error fetching language booster:', error);
    }
  };

  // TTS function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setSpeakingAudioBlob(audioBlob);
        // For now, we'll use text input - transcription can be added later
        toast.info('Recording saved! Please type your response below for evaluation.');
        stream.getTracks().forEach(t => t.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) {
      toast.error('Microphone access denied');
    }
  };

  const blobToBase64 = async (blob) => {
    if (!blob) return null;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result || '';
        const base64 = typeof result === 'string' ? result.split(',')[1] : null;
        resolve(base64 || null);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Evaluation functions
  const evaluateSpeaking = async () => {
    if (!speakingResponse.trim()) {
      toast.error('Please provide your response');
      return;
    }
    setSpeakingLoading(true);
    try {
      const speaking = selectedModule.speaking;
      const question = speaking?.part3?.question || speaking?.part2?.cue_card || '';
      const modelAnswer = speaking?.part3?.band8_sample || speaking?.part2?.model_answer || '';
      const audioData = await blobToBase64(speakingAudioBlob);
      
      const res = await fetch(`${API_URL}/api/advanced-mastery/evaluate-speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          model_answer: modelAnswer,
          user_response: speakingResponse,
          module_title: selectedModule.title,
          module_number: selectedModule.module_number,
          user_plan: user?.plan || 'free',
          part: speaking?.part3 ? 'part3' : 'part2',
          audio_data: audioData,
        })
      });
      if (res.ok) {
        const feedback = await res.json();
        setSpeakingFeedback(feedback);
        toast.success('Speaking evaluated!');
      }
    } catch (e) {
      toast.error('Evaluation failed');
    } finally {
      setSpeakingLoading(false);
    }
  };

  const evaluateWriting = async () => {
    if (!writingResponse.trim()) {
      toast.error('Please write your essay');
      return;
    }
    if (writingResponse.trim().split(/\s+/).length < 50) {
      toast.error('Essay too short. Write at least 250 words for Task 2.');
      return;
    }
    setWritingLoading(true);
    try {
      const academicTask = selectedModule?.writing?.question || selectedModule?.writing?.prompt || '';
      const academicModel = selectedModule?.writing?.model_essay || selectedModule?.writing?.band75_excerpt || '';
      const generalTask = strategicWriting?.writing_scenario?.prompt || '';
      const generalModel = strategicWriting?.writing_scenario?.model_answer?.band_8 || '';
      const payload = writingTrack === 'general'
        ? {
            task: generalTask,
            model_essay: generalModel,
            user_response: writingResponse,
            module_title: selectedModule.title,
            module_number: selectedModule.module_number,
            user_plan: user?.plan || 'free',
            track: 'general',
            task_type: 'task1_letter',
          }
        : {
            task: academicTask,
            model_essay: academicModel,
            user_response: writingResponse,
            module_title: selectedModule.title,
            module_number: selectedModule.module_number,
            user_plan: user?.plan || 'free',
            track: 'academic',
            task_type: 'task2_essay',
          };

      const res = await fetch(`${API_URL}/api/advanced-mastery/evaluate-writing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const evaluation = await res.json();
        setWritingFeedback({
          ...evaluation,
          skill: 'writing',
          track: evaluation.track || writingTrack,
          overall_band: evaluation.overall_band || evaluation.band_score || 0,
          criteria_scores: evaluation.criteria_scores || {
            task_achievement: evaluation.task_achievement || {},
            coherence_cohesion: evaluation.coherence_cohesion || {},
            lexical_resource: evaluation.lexical_resource || {},
            grammatical_range: evaluation.grammatical_range || {},
          },
          strengths: evaluation.strengths || [],
          weaknesses: evaluation.areas_to_improve || evaluation.weaknesses || [],
          mistakes: evaluation.mistakes || [],
          corrections: evaluation.corrections || [],
          recommended_lessons: evaluation.recommended_lessons || [],
          improvement_suggestions: evaluation.improvement_suggestions || evaluation.areas_to_improve || [],
          line_by_line_corrections: evaluation.line_by_line_corrections || [],
          grammar_upgrade_examples: evaluation.grammar_upgrade_examples || [],
          advanced_vocabulary_suggestions: evaluation.advanced_vocabulary_suggestions || [],
          band_justification: evaluation.band_justification || '',
          overall_feedback: evaluation.overall_feedback || '',
        });
        toast.success('Essay evaluated!');
      } else {
        toast.error('Evaluation failed');
      }
    } catch (e) {
      console.error('Evaluation error:', e);
      toast.error('Evaluation failed');
    } finally {
      setWritingLoading(false);
    }
  };

  const handleQuizAnswer = (idx, answer) => {
    setQuizAnswers(prev => ({ ...prev, [idx]: answer }));
  };

  const submitQuiz = async () => {
    // Calculate score locally first
    const questions = selectedModule.quiz?.questions || selectedModule.reading?.questions || [];
    let correct = 0;
    let answered = 0;
    
    questions.forEach((q, idx) => {
      const userAns = (quizAnswers[idx] || '').toLowerCase().trim();
      
      // Skip unanswered questions
      if (!userAns) return;
      
      answered++;
      const correctAns = (q.correct || q.answer || '').toLowerCase().trim();
      
      // Compare answers
      const cleanUser = userAns.replace(/^[a-d]\)\s*/i, '');
      const cleanCorrect = correctAns.replace(/^[a-d]\)\s*/i, '');
      
      if (cleanUser === cleanCorrect || userAns === correctAns || 
          correctAns.includes(cleanUser) || cleanUser.includes(cleanCorrect.split('/')[0].trim())) {
        correct++;
      }
    });
    
    const total = questions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const estimatedBand = score >= 90 ? 8.5 : score >= 80 ? 8.0 : score >= 70 ? 7.5 : score >= 60 ? 7.0 : score >= 50 ? 6.5 : 6.0;
    
    setQuizResults({
      score: score,
      estimated_band: estimatedBand,
      correct: correct,
      total: total,
      answered: answered,
      skipped: total - answered
    });
    setQuizSubmitted(true);
    toast.success(`Quiz complete! ${correct}/${total} correct (${answered} answered, ${total - answered} skipped)`);
    
    // Mark quiz section as complete for progress tracking
    if (selectedModule) {
      markSectionComplete('advanced', selectedModule.module_number, 'quiz');
    }
  };

  // Render modules list
  const renderModulesList = () => (
    <ModulesListView
      goBack={goBack}
      language={language}
      englishNotice={englishNotice}
      hasFullCourseAccess={hasFullCourseAccess}
      modules={modules}
      canAccessModule={canAccessModule}
      selectModule={selectModule}
    />
  );

  // Render section tabs
  const renderSectionTabs = () => (
    <SectionTabs
      selectedModule={selectedModule}
      currentSection={currentSection}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render vocabulary section - Updated to handle nouns/verbs/adjectives/adverbs structure
  const renderVocabulary = () => (
    <VocabularySection
      selectedModule={selectedModule}
      speakText={speakText}
      navigate={navigate}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render grammar section
  const renderGrammar = () => (
    <GrammarSection
      selectedModule={selectedModule}
      user={user}
      navigate={navigate}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render reading section with Dual-Track Support
  const renderReading = () => (
    <ReadingSection
      readingTrack={readingTrack}
      setReadingTrack={setReadingTrack}
      strategicReading={strategicReading}
      generalReading={generalReading}
      selectedModule={selectedModule}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render speaking section
  const renderSpeaking = () => (
    <SpeakingSection
      selectedModule={selectedModule}
      isRecording={isRecording}
      startRecording={startRecording}
      stopRecording={stopRecording}
      speakingResponse={speakingResponse}
      setSpeakingResponse={setSpeakingResponse}
      evaluateSpeaking={evaluateSpeaking}
      speakingLoading={speakingLoading}
      speakingFeedback={speakingFeedback}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render writing section
  const renderWriting = () => (
    <WritingSection
      writingTrack={writingTrack}
      setWritingTrack={setWritingTrack}
      writingResponse={writingResponse}
      setWritingResponse={setWritingResponse}
      setWritingFeedback={setWritingFeedback}
      evaluateWriting={evaluateWriting}
      writingLoading={writingLoading}
      writingFeedback={writingFeedback}
      strategicWriting={strategicWriting}
      selectedModule={selectedModule}
      navigate={navigate}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render listening section
  const renderListening = () => (
    <ListeningSection
      selectedModule={selectedModule}
      listeningAudioRef={listeningAudioRef}
      isPlayingListening={isPlayingListening}
      setIsPlayingListening={setIsPlayingListening}
      listeningProgress={listeningProgress}
      setListeningProgress={setListeningProgress}
      showTranscript={showTranscript}
      setShowTranscript={setShowTranscript}
      bgCard={bgCard}
      bgSubtle={bgSubtle}
      textPrimary={textPrimary}
      textSecondary={textSecondary}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render quiz section
  const renderQuiz = () => (
    <QuizSection
      selectedModule={selectedModule}
      quizAnswers={quizAnswers}
      handleQuizAnswer={handleQuizAnswer}
      quizSubmitted={quizSubmitted}
      setQuizSubmitted={setQuizSubmitted}
      setQuizAnswers={setQuizAnswers}
      quizResults={quizResults}
      setQuizResults={setQuizResults}
      submitQuiz={submitQuiz}
      setView={setView}
      setSelectedModule={setSelectedModule}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render module detail view
  const renderModuleDetail = () => (
    <ModuleDetailView
      selectedModule={selectedModule}
      setView={setView}
      setSelectedModule={setSelectedModule}
      currentSection={currentSection}
      renderSectionTabs={renderSectionTabs}
      renderVocabulary={renderVocabulary}
      renderGrammar={renderGrammar}
      renderListening={renderListening}
      renderReading={renderReading}
      renderSpeaking={renderSpeaking}
      renderWriting={renderWriting}
      renderQuiz={renderQuiz}
    />
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={textSecondary}>Loading Advanced Mastery Course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgMain} pb-24 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'modules' && renderModulesList()}
        {view === 'module-detail' && selectedModule && renderModuleDetail()}
      </div>
      
      {/* CTA Banner for visitors - only show on quiz section or after completing */}
      {!user && (currentSection === 'quiz' || currentSection === 'writing') && <SignUpCTA variant="banner" />}
    </div>
  );
}
