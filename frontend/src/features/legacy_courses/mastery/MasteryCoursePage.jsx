import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme, THEME_MODES } from '../../../contexts/ThemeContext';
import { useI18n } from '../../../lib/i18n';
import { getEnglishOnlyNotice } from '../../../lib/languageLock';
import { canAccessCourse, canAccessCourseLesson } from '../../../lib/planAccess';
import { 
  markSectionComplete, 
  getLessonProgress, 
  isLessonCompleted, 
  getCourseProgress,
  isSectionCompleted 
} from '../../../lib/progressTracker';
import SignUpCTA from '../../../components/SignUpCTA';
import ModulesListView from './components/ModulesListView';
import ModuleDetailView from './components/ModuleDetailView';
import VocabularySection from './components/VocabularySection';
import GrammarSection from './components/GrammarSection';
import ListeningSection from './components/ListeningSection';
import ReadingSection from './components/ReadingSection';
import SpeakingSection from './components/SpeakingSection';
import WritingSection from './components/WritingSection';
import QuizSection from './components/QuizSection';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function MasteryCourse({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useI18n();
  
  // Check for preview mode and lesson from URL
  const isPreviewMode = searchParams.get('preview') === 'true';
  const lessonIdFromUrl = searchParams.get('lesson');
  const focusFromUrl = searchParams.get('focus'); // e.g., 'grammar' (from GrammarBlueprint deep-link)
  
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
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('modules');
  const [currentSection, setCurrentSection] = useState('vocabulary');
  const [playingAudio, setPlayingAudio] = useState(null);
  
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // Speaking states
  const [recording, setRecording] = useState(false);
  const [speakingResponse, setSpeakingResponse] = useState('');
  const [speakingFeedback, setSpeakingFeedback] = useState(null);
  const [evaluatingSpeaking, setEvaluatingSpeaking] = useState(false);
  const [speakingAudioBlob, setSpeakingAudioBlob] = useState(null);
  const [selectedSpeakingPrompt, setSelectedSpeakingPrompt] = useState('part1');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Writing states
  const [writingResponse, setWritingResponse] = useState('');
  const [writingFeedback, setWritingFeedback] = useState(null);
  const [evaluatingWriting, setEvaluatingWriting] = useState(false);
  const [writingTrack, setWritingTrack] = useState('academic'); // 'academic' or 'general'
  const [generalLessons, setGeneralLessons] = useState([]);
  const [selectedGeneralLesson, setSelectedGeneralLesson] = useState(null);
  
  // Reading states (Dual-Track)
  const [readingTrack, setReadingTrack] = useState('academic');
  const [generalReadingLessons, setGeneralReadingLessons] = useState([]);
  const [selectedReadingLesson, setSelectedReadingLesson] = useState(null);
  const [readingAnswers, setReadingAnswers] = useState({});
  const [showReadingResults, setShowReadingResults] = useState(false);
  
  // Module-Specific Language Booster
  const [languageBooster, setLanguageBooster] = useState(null);
  
  // Listening states
  const [showTranscript, setShowTranscript] = useState(false);
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [showListeningResults, setShowListeningResults] = useState(false);
  const hasFullCourseAccess = canAccessCourse(user, 'learner');

  const canAccessModule = (module) => canAccessCourseLesson(user, 'learner', module?.module_number);

  useEffect(() => {
    fetchModules();
    fetchGeneralLessons();
    
    // Cleanup audio when component unmounts or page changes
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      // Stop all audio elements
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
          toast.info('Free plan can preview only Lesson 1 of this course.');
          navigate('/pricing?from=Mastery%20Course');
          return;
        }
        setSelectedModule(targetModule);
        setView('module-detail');
        // Deep-link focus: jump to a specific section (grammar | vocabulary | reading | listening | speaking | writing | quiz)
        const validFocus = ['grammar', 'vocabulary', 'reading', 'listening', 'speaking', 'writing', 'quiz'];
        if (validFocus.includes(focusFromUrl)) {
          setCurrentSection(focusFromUrl);
          const scrollToSection = () => {
            document.getElementById(`${focusFromUrl}-section`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          };
          setTimeout(scrollToSection, 250);
          setTimeout(scrollToSection, 700);
        }
      }
    }
  }, [lessonIdFromUrl, focusFromUrl, modules]);

  const fetchModules = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mastery-course/modules`);
      if (!response.ok) throw new Error('Failed to fetch modules');
      const data = await response.json();
      setModules(data.sort((a, b) => a.module_number - b.module_number));
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load course modules');
    } finally {
      setLoading(false);
    }
  };

  // Fetch General Training lessons for Writing AND Reading
  const fetchGeneralLessons = async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/mastery/general`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.success && data.lessons) {
        console.log('All lessons:', data.lessons.map(l => ({ id: l.id, topic: l.topic, skill: l.skill, hasReading: !!l.reading, hasWriting: !!l.writing })));
        
        // Filter writing-related lessons (must have writing content)
        const writingLessons = data.lessons.filter(l => 
          l.writing && !l.skill?.includes('reading')
        );
        setGeneralLessons(writingLessons);
        if (writingLessons.length > 0) {
          setSelectedGeneralLesson(writingLessons[0]);
        }
        
        // Filter reading-related lessons (must have reading content OR skill='reading')
        const readingLessons = data.lessons.filter(l => 
          l.reading || l.skill === 'reading'
        );
        console.log('Reading lessons:', readingLessons.map(l => l.topic));
        setGeneralReadingLessons(readingLessons);
        if (readingLessons.length > 0) {
          setSelectedReadingLesson(readingLessons[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching general lessons:', error);
    }
  };

  // Fetch Module-Specific Language Booster based on module topic
  const fetchModuleLanguageBooster = async (moduleTopic) => {
    try {
      console.log('Fetching language booster for topic:', moduleTopic);
      
      // Map module topics to booster modules
      const topicToBooster = {
        'education': 'education',
        'health': 'health',
        'work': 'work',
        'employment': 'work',
        'travel': 'travel',
        'tourism': 'travel',
        'housing': 'housing',
        'urbanization': 'housing',
        'accommodation': 'housing',
        'environment': 'environment',
        'technology': 'technology',
        'society': 'family',
        'family': 'family',
        'culture': 'culture',
        'tradition': 'culture',
        'media': 'media',
        'advertising': 'media',
        'food': 'food',
        'nutrition': 'food',
        'transport': 'transport',
        'transportation': 'transport',
        'crime': 'crime',
        'law': 'crime',
        'science': 'science',
        'research': 'science',
        'hobby': 'leisure',
        'hobbies': 'leisure',
        'leisure': 'leisure',
        'sports': 'sports',
        'competition': 'sports',
        'money': 'finance',
        'finance': 'finance',
      };
      
      const normalizedTopic = moduleTopic?.toLowerCase() || '';
      let boosterModule = null;
      
      // Find matching booster
      for (const [key, value] of Object.entries(topicToBooster)) {
        if (normalizedTopic.includes(key)) {
          boosterModule = value;
          break;
        }
      }
      
      if (!boosterModule) {
        // Default to education if no match
        boosterModule = 'education';
        console.log('No match found, using default:', boosterModule);
      }
      
      console.log('Fetching booster module:', boosterModule);
      const response = await fetch(`${API_URL}/api/courses/language-booster/${boosterModule}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Failed to fetch language booster');
        return;
      }
      
      const data = await response.json();
      console.log('Language booster data:', data.success, data.language_booster?.module);
      
      if (data.success) {
        setLanguageBooster(data.language_booster);
        console.log(`Loaded ${boosterModule} language booster for ${moduleTopic}`);
      }
    } catch (error) {
      console.error('Error fetching language booster:', error);
    }
  };

  const selectModule = (module) => {
    if (!canAccessModule(module)) {
      toast.info('Free plan can preview only Lesson 1 of this course.');
      navigate('/pricing?from=Mastery%20Course');
      return;
    }
    setSelectedModule(module);
    setView('module-detail');
    setCurrentSection('vocabulary');
    setSelectedSpeakingPrompt(module?.speaking?.part1?.question ? 'part1' : module?.speaking?.part2?.cue_card ? 'part2' : module?.speaking?.part3?.question ? 'part3' : module?.speaking?.part3?.questions?.length ? 'part3-0' : 'part1');
    
    // Fetch module-specific language booster (use title as topic)
    fetchModuleLanguageBooster(module.title || module.topic);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setSpeakingResponse('');
    setSpeakingFeedback(null);
    setSpeakingAudioBlob(null);
    setWritingResponse('');
    setWritingFeedback(null);
  };

  // Text-to-Speech
  const playPronunciation = async (text) => {
    setPlayingAudio(text);
    try {
      const response = await fetch(`${API_URL}/api/speech/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (response.ok) {
        const data = await response.json();
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.onended = () => setPlayingAudio(null);
        audio.onerror = () => { setPlayingAudio(null); fallbackTTS(text); };
        await audio.play();
        return;
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
    fallbackTTS(text);
  };

  const fallbackTTS = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.onend = () => setPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingAudio(null);
    }
  };

  // Recording for speaking
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        await transcribeRecording(blob);
      };
      mediaRecorder.start();
      setRecording(true);
      toast.info('Recording... Speak now!');
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const transcribeRecording = async (audioBlob) => {
    toast.info('Transcribing...');
    try {
      setSpeakingAudioBlob(audioBlob);
      const formData = new FormData();
      formData.append('file', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));
      const response = await fetch(`${API_URL}/api/transcribe-audio`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Transcription failed');
      const data = await response.json();
      setSpeakingResponse(data.text || '');
      toast.success('Speech transcribed!');
    } catch (error) {
      toast.error('Failed to transcribe');
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

  const getSpeakingPrompts = () => {
    if (!selectedModule?.speaking) return [];
    const prompts = [];

    if (selectedModule.speaking.part1?.question) {
      prompts.push({
        id: 'part1',
        label: 'Part 1',
        question: selectedModule.speaking.part1.question,
        modelAnswer: selectedModule.speaking.part1.model_answer || '',
      });
    }
    if (selectedModule.speaking.part2?.cue_card) {
      prompts.push({
        id: 'part2',
        label: 'Part 2',
        question: selectedModule.speaking.part2.cue_card,
        modelAnswer: selectedModule.speaking.part2.model_answer || '',
      });
    }
    if (selectedModule.speaking.part3?.question) {
      prompts.push({
        id: 'part3',
        label: 'Part 3',
        question: selectedModule.speaking.part3.question,
        modelAnswer: selectedModule.speaking.part3.model_answer || '',
      });
    }
    if (selectedModule.speaking.part3?.questions?.length) {
      selectedModule.speaking.part3.questions.forEach((item, index) => {
        prompts.push({
          id: `part3-${index}`,
          label: `Part 3.${index + 1}`,
          question: item.question,
          modelAnswer: item.model_answer || '',
        });
      });
    }

    return prompts;
  };

  // Evaluate speaking
  const evaluateSpeaking = async () => {
    if (!speakingResponse.trim()) {
      toast.error('Please record or type your answer first');
      return;
    }
    const speakingPrompts = getSpeakingPrompts();
    const activePrompt = speakingPrompts.find((item) => item.id === selectedSpeakingPrompt) || speakingPrompts[0];
    if (!activePrompt) {
      toast.error('No speaking prompt available');
      return;
    }
    setEvaluatingSpeaking(true);
    try {
      const audioData = await blobToBase64(speakingAudioBlob);
      const response = await fetch(`${API_URL}/api/mastery-course/evaluate-speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activePrompt.question,
          model_answer: activePrompt.modelAnswer,
          user_response: speakingResponse,
          module_title: selectedModule.title,
          module_number: selectedModule.module_number,
          user_plan: user?.plan || 'free',
          prompt_type: activePrompt.label,
          audio_data: audioData,
        })
      });
      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      setSpeakingFeedback(data);
    } catch (error) {
      toast.error('Failed to evaluate');
    } finally {
      setEvaluatingSpeaking(false);
    }
  };

  // Evaluate writing
  const evaluateWriting = async () => {
    if (!writingResponse.trim()) {
      toast.error('Please write your essay first');
      return;
    }
    setEvaluatingWriting(true);
    try {
      const academicTask = selectedModule?.writing?.question || '';
      const academicModel = selectedModule?.writing?.model_essay || '';
      const generalTask = languageBooster?.writing_task?.prompt || '';
      const generalModel =
        languageBooster?.writing_task?.model_answer?.band_8 ||
        languageBooster?.writing_task?.model_answer?.band_6 ||
        '';
      const payload = writingTrack === 'general'
        ? {
            task: generalTask,
            model_essay: generalModel,
            user_response: writingResponse,
            module_title: selectedModule.title,
            module_number: selectedModule.module_number,
            user_plan: user?.plan || 'free',
            task_type: 'general_task_1',
          }
        : {
            task: academicTask,
            model_essay: academicModel,
            user_response: writingResponse,
            module_title: selectedModule.title,
            module_number: selectedModule.module_number,
            user_plan: user?.plan || 'free',
            task_type: 'academic_task_2',
          };
      const response = await fetch(`${API_URL}/api/mastery-course/evaluate-writing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      setWritingFeedback(data);
    } catch (error) {
      toast.error('Failed to evaluate');
    } finally {
      setEvaluatingWriting(false);
    }
  };

  // Quiz handlers
  const handleQuizAnswer = (qId, answer) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const submitQuiz = () => {
    if (!selectedModule) return;
    const questions = selectedModule.quiz?.questions || [];
    
    // Count only answered questions
    let correct = 0;
    let answered = 0;
    
    questions.forEach((q, idx) => {
      const userAns = (quizAnswers[`q_${idx}`] || '').toLowerCase().trim();
      
      // Skip unanswered questions
      if (!userAns) return;
      
      answered++;
      const correctAns = (q.correct || q.answer || '').toLowerCase().trim();
      
      if (q.type === 'true_false_ng') {
        if (userAns === correctAns.toLowerCase()) correct++;
      } else if (q.options) {
        // Multiple choice - compare option letter or full text
        const cleanUser = userAns.replace(/^[a-d]\)\s*/i, '');
        const cleanCorrect = correctAns.replace(/^[a-d]\)\s*/i, '');
        if (cleanUser === cleanCorrect || userAns === correctAns || userAns.startsWith(correctAns.charAt(0))) correct++;
      } else {
        if (correctAns.includes(userAns) || userAns.includes(correctAns.split('/')[0].trim())) correct++;
      }
    });
    
    // Calculate score based on answered questions only (unanswered = 0 points)
    const total = questions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    setQuizScore(score);
    setQuizSubmitted(true);
    toast.success(`Quiz completed! ${correct}/${total} correct (${answered} answered, ${total - answered} skipped)`);
    
    // Mark quiz section as complete
    if (selectedModule) {
      markSectionComplete('mastery', selectedModule.module_number, 'quiz');
    }
  };

  // Render modules list
  const renderModulesList = () => (
    <ModulesListView
      navigate={navigate}
      language={language}
      englishNotice={englishNotice}
      textPrimary={textPrimary}
      textSecondary={textSecondary}
      bgCard={bgCard}
      isDark={isDark}
      hasFullCourseAccess={hasFullCourseAccess}
      loading={loading}
      modules={modules}
      canAccessModule={canAccessModule}
      selectModule={selectModule}
    />
  );

  // Render module detail
  const renderModuleDetail = () => (
    <ModuleDetailView
      selectedModule={selectedModule}
      setView={setView}
      setSelectedModule={setSelectedModule}
      currentSection={currentSection}
      setCurrentSection={setCurrentSection}
      renderSectionContent={renderSectionContent}
    />
  );

  const renderSectionContent = () => {
    if (!selectedModule) return null;
    switch (currentSection) {
      case 'vocabulary': return renderVocabulary();
      case 'grammar': return renderGrammar();
      case 'listening': return renderListening();
      case 'reading': return renderReading();
      case 'speaking': return renderSpeaking();
      case 'writing': return renderWriting();
      case 'quiz': return renderQuiz();
      default: return renderVocabulary();
    }
  };

  // Vocabulary Section
  const renderVocabulary = () => (
    <VocabularySection
      selectedModule={selectedModule}
      user={user}
      navigate={navigate}
      playPronunciation={playPronunciation}
      playingAudio={playingAudio}
      setCurrentSection={setCurrentSection}
    />
  );

  // Grammar Section
  const renderGrammar = () => (
    <GrammarSection
      selectedModule={selectedModule}
      user={user}
      navigate={navigate}
      setCurrentSection={setCurrentSection}
    />
  );

  // Listening Section
  const renderListening = () => (
    <ListeningSection
      selectedModule={selectedModule}
      listeningAnswers={listeningAnswers}
      setListeningAnswers={setListeningAnswers}
      showListeningResults={showListeningResults}
      setShowListeningResults={setShowListeningResults}
      showTranscript={showTranscript}
      setShowTranscript={setShowTranscript}
      playPronunciation={playPronunciation}
      setCurrentSection={setCurrentSection}
    />
  );

  // Reading Section
  const renderReading = () => (
    <ReadingSection
      readingTrack={readingTrack}
      setReadingTrack={setReadingTrack}
      readingAnswers={readingAnswers}
      setReadingAnswers={setReadingAnswers}
      showReadingResults={showReadingResults}
      setShowReadingResults={setShowReadingResults}
      selectedModule={selectedModule}
      languageBooster={languageBooster}
      playingAudio={playingAudio}
      playPronunciation={playPronunciation}
      handleQuizAnswer={handleQuizAnswer}
      setCurrentSection={setCurrentSection}
    />
  );

  // Speaking Section
  const renderSpeaking = () => (
    <SpeakingSection
      selectedModule={selectedModule}
      getSpeakingPrompts={getSpeakingPrompts}
      selectedSpeakingPrompt={selectedSpeakingPrompt}
      setSelectedSpeakingPrompt={setSelectedSpeakingPrompt}
      recording={recording}
      startRecording={startRecording}
      stopRecording={stopRecording}
      speakingResponse={speakingResponse}
      setSpeakingResponse={setSpeakingResponse}
      evaluatingSpeaking={evaluatingSpeaking}
      evaluateSpeaking={evaluateSpeaking}
      speakingFeedback={speakingFeedback}
      setCurrentSection={setCurrentSection}
    />
  );

  // Writing Section
  const renderWriting = () => (
    <WritingSection
      writingTrack={writingTrack}
      setWritingTrack={setWritingTrack}
      writingResponse={writingResponse}
      setWritingResponse={setWritingResponse}
      setWritingFeedback={setWritingFeedback}
      evaluateWriting={evaluateWriting}
      evaluatingWriting={evaluatingWriting}
      writingFeedback={writingFeedback}
      selectedModule={selectedModule}
      languageBooster={languageBooster}
      setCurrentSection={setCurrentSection}
    />
  );

  // Quiz Section
  const renderQuiz = () => (
    <QuizSection
      selectedModule={selectedModule}
      quizAnswers={quizAnswers}
      handleQuizAnswer={handleQuizAnswer}
      quizSubmitted={quizSubmitted}
      setQuizSubmitted={setQuizSubmitted}
      setQuizAnswers={setQuizAnswers}
      quizScore={quizScore}
      submitQuiz={submitQuiz}
      setView={setView}
      setSelectedModule={setSelectedModule}
      setCurrentSection={setCurrentSection}
    />
  );

  return (
    <div className={`min-h-screen ${bgMain} pb-24 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'modules' && renderModulesList()}
        {view === 'module-detail' && renderModuleDetail()}
      </div>
      
      {/* CTA Banner for visitors - only show on quiz section or after completing quiz */}
      {!user && (currentSection === 'quiz' || quizSubmitted) && <SignUpCTA variant="banner" />}
    </div>
  );
}
