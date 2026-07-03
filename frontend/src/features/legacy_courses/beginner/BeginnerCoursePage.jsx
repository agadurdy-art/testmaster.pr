import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme, THEME_MODES } from '../../../contexts/ThemeContext';
import { useI18n } from '../../../lib/i18n';
import { 
  markSectionComplete, 
  getLessonProgress, 
  isLessonCompleted, 
  getCourseProgress,
  isSectionCompleted,
  markLessonComplete
} from '../../../lib/progressTracker';
import SignUpCTA from '../../../components/SignUpCTA';
import LessonsListView from './components/LessonsListView';
import LessonDetailView from './components/LessonDetailView';
import VocabularySection from './components/VocabularySection';
import GrammarSection from './components/GrammarSection';
import ListeningSection from './components/ListeningSection';
import ReadingSection from './components/ReadingSection';
import SpeakingSection from './components/SpeakingSection';
import WritingSection from './components/WritingSection';
import QuizSection from './components/QuizSection';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function BeginnerCourse({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useI18n();
  
  // Check for preview mode and lesson from URL
  const isPreviewMode = searchParams.get('preview') === 'true';
  const lessonIdFromUrl = searchParams.get('lesson');
  const focusFromUrl = searchParams.get('focus');
  
  // Theme support
  const { activeTheme } = useTheme();
  const isDark = activeTheme === THEME_MODES.DARK;
  const isNightShift = activeTheme === THEME_MODES.NIGHT_SHIFT;
  
  // Multi-language UI strings
  const UI = {
    title: { en: "Let's Learn English!", vi: "Hãy học tiếng Anh!", tr: "Hadi İngilizce Öğrenelim!" },
    subtitle: { en: "Your Adventure Starts Here! 🚀", vi: "Cuộc phiêu lưu của bạn bắt đầu! 🚀", tr: "Maceran Burada Başlıyor! 🚀" },
    welcomeMsg: { 
      en: "Hey there! 👋 Ready to become an English superstar? Pick a lesson below and let's have fun learning together!",
      vi: "Xin chào! 👋 Sẵn sàng trở thành ngôi sao tiếng Anh chưa? Chọn bài học bên dưới và cùng vui học nhé!",
      tr: "Merhaba! 👋 İngilizce süperstarı olmaya hazır mısın? Aşağıdan bir ders seç ve birlikte eğlenerek öğrenelim!"
    },
    backToDashboard: { en: "Back to Dashboard", vi: "Về trang chính", tr: "Ana Sayfaya Dön" },
    loading: { en: "Loading your lessons...", vi: "Đang tải bài học...", tr: "Dersler yükleniyor..." },
    lesson: { en: "Lesson", vi: "Bài", tr: "Ders" },
    newWords: { en: "New Words to Learn!", vi: "Từ mới để học!", tr: "Öğrenilecek Yeni Kelimeler!" },
    clickToListen: { en: "Click the speaker to hear how to say each word", vi: "Nhấp vào loa để nghe cách phát âm", tr: "Her kelimenin nasıl söylendiğini duymak için hoparlöre tıkla" },
    listen: { en: "Listen", vi: "Nghe", tr: "Dinle" },
    recording: { en: "Recording...", vi: "Đang ghi...", tr: "Kayıt yapılıyor..." },
    record: { en: "Record", vi: "Ghi âm", tr: "Kaydet" },
    vocabulary: { en: "Vocabulary", vi: "Từ vựng", tr: "Kelime" },
    grammar: { en: "Grammar", vi: "Ngữ pháp", tr: "Dilbilgisi" },
    listening: { en: "Listening", vi: "Nghe", tr: "Dinleme" },
    reading: { en: "Reading", vi: "Đọc", tr: "Okuma" },
    speaking: { en: "Speaking", vi: "Nói", tr: "Konuşma" },
    writing: { en: "Writing", vi: "Viết", tr: "Yazma" },
    quiz: { en: "Quiz", vi: "Kiểm tra", tr: "Quiz" },
    submitQuiz: { en: "Submit Quiz", vi: "Nộp bài", tr: "Quiz'i Gönder" },
    tryAgain: { en: "Try Again", vi: "Thử lại", tr: "Tekrar Dene" },
    backToLessons: { en: "Back to Lessons", vi: "Quay lại bài học", tr: "Derslere Dön" },
    quizComplete: { en: "Quiz Complete!", vi: "Hoàn thành!", tr: "Quiz Bitti!" },
    wow: { en: "WOW! You're Amazing!", vi: "TUYỆT VỜI! Bạn thật tuyệt!", tr: "VAAAY! Harikasın!" },
    superJob: { en: "Super Job!", vi: "Làm tốt lắm!", tr: "Süper İş!" },
    goodTry: { en: "Good Try!", vi: "Cố gắng tốt!", tr: "İyi Deneme!" },
    niceEffort: { en: "Nice Effort!", vi: "Nỗ lực tốt!", tr: "Güzel Çaba!" },
    wowMsg: { en: "You're a superstar! You know this lesson really well!", vi: "Bạn là ngôi sao! Bạn hiểu bài học này rất tốt!", tr: "Sen bir süperstarsın! Bu dersi çok iyi biliyorsun!" },
    superJobMsg: { en: "Great work! You learned a lot from this lesson!", vi: "Làm tốt lắm! Bạn đã học được nhiều từ bài này!", tr: "Harika iş! Bu dersten çok şey öğrendin!" },
    goodTryMsg: { en: "You're getting better! Try again to get an even higher score!", vi: "Bạn đang tiến bộ! Thử lại để đạt điểm cao hơn!", tr: "Gelişiyorsun! Daha yüksek puan için tekrar dene!" },
    niceEffortMsg: { en: "Learning takes practice! Go back and review the lesson, then try again. You can do it!", vi: "Học cần luyện tập! Quay lại xem bài học rồi thử lại. Bạn làm được!", tr: "Öğrenmek pratik ister! Geri dön ve dersi tekrar et, sonra tekrar dene. Yapabilirsin!" }
  };
  
  const getText = (key) => UI[key]?.[language] || UI[key]?.en || key;
  
  // Theme-aware classes
  const bgMain = isDark ? 'bg-gray-900' : isNightShift ? 'bg-amber-50' : 'bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-100';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : isNightShift ? 'bg-amber-100/50 border-amber-200' : 'bg-white border-gray-200';
  const bgHeader = isDark ? 'bg-gray-800/95 border-gray-700' : isNightShift ? 'bg-amber-100/95 border-amber-200' : 'bg-white/80 border-gray-100';
  const textPrimary = isDark ? 'text-gray-100' : isNightShift ? 'text-amber-900' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : isNightShift ? 'text-amber-700' : 'text-gray-600';
  const bgSubtle = isDark ? 'bg-gray-700/50' : isNightShift ? 'bg-amber-100/30' : 'bg-gray-50';
  
  // States
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lessons'); // lessons, lesson-detail, section
  const [currentSection, setCurrentSection] = useState('vocabulary'); // vocabulary, grammar, listening, reading, speaking, writing, quiz
  const [playingAudio, setPlayingAudio] = useState(null);
  
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // Speaking states
  const [recording, setRecording] = useState(false);
  const [speakingResponse, setSpeakingResponse] = useState('');
  const [speakingFeedback, setSpeakingFeedback] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Writing states
  const [writingResponse, setWritingResponse] = useState('');
  const [writingFeedback, setWritingFeedback] = useState(null);
  const [evaluatingWriting, setEvaluatingWriting] = useState(false);
  const [writingTrack, setWritingTrack] = useState('academic'); // Dual-Track support
  const [generalLessons, setGeneralLessons] = useState([]);
  const [selectedGeneralLesson, setSelectedGeneralLesson] = useState(null);
  const [languageBooster, setLanguageBooster] = useState(null); // Module-Specific Language Booster
  
  // Reading Track states (Beginner uses GLOBAL General Reading)
  const [readingTrack, setReadingTrack] = useState('academic');
  const [generalReadingLessons, setGeneralReadingLessons] = useState([]);
  const [selectedReadingLesson, setSelectedReadingLesson] = useState(null);
  
  // Listening states
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [listeningSubmitted, setListeningSubmitted] = useState(false);
  const [listeningScore, setListeningScore] = useState(0);
  const [isPlayingListening, setIsPlayingListening] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  
  // Grammar Practice states
  const [grammarPracticeAnswers, setGrammarPracticeAnswers] = useState({});
  const [grammarPracticeSubmitted, setGrammarPracticeSubmitted] = useState(false);
  const [grammarPracticeScore, setGrammarPracticeScore] = useState(0);
  
  // Pronunciation Practice states
  const [pronunciationRecording, setPronunciationRecording] = useState(false);
  const [pronunciationWord, setPronunciationWord] = useState(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState(null);
  const [evaluatingPronunciation, setEvaluatingPronunciation] = useState(false);
  const pronunciationRecorderRef = useRef(null);
  const pronunciationChunksRef = useRef([]);

  // Fetch lessons on mount
  useEffect(() => {
    fetchLessons();
    fetchGeneralLessons();
    
    // Cleanup audio when component unmounts
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      // Stop Azure TTS audio if playing
      if (window.currentListeningAudio) {
        window.currentListeningAudio.pause();
        window.currentListeningAudio = null;
      }
      document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  // Auto-select lesson from URL parameter (for preview mode from landing page)
  useEffect(() => {
    if (lessonIdFromUrl && lessons.length > 0) {
      const targetLesson = lessons.find(l =>
        String(l.id) === lessonIdFromUrl ||
        String(l.lesson_number) === lessonIdFromUrl
      );
      if (targetLesson) {
        setSelectedLesson(targetLesson);
        setView('lesson-detail');
        if (focusFromUrl && ['vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing', 'quiz'].includes(focusFromUrl)) {
          setCurrentSection(focusFromUrl);
          const scrollToSection = () => {
            const el = document.getElementById(`${focusFromUrl}-section`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          };
          setTimeout(scrollToSection, 250);
          setTimeout(scrollToSection, 700);
        }
      }
    }
  }, [lessonIdFromUrl, focusFromUrl, lessons]);

  const fetchLessons = async () => {
    try {
      const response = await fetch(`${API_URL}/api/beginner-english/lessons`);
      if (!response.ok) throw new Error('Failed to fetch lessons');
      const data = await response.json();
      setLessons(data.sort((a, b) => a.lesson_number - b.lesson_number));
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  // Fetch General Training lessons for Writing AND Reading (GLOBAL - not module-specific for Beginner)
  const fetchGeneralLessons = async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/beginner/general`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.success && data.lessons) {
        // Filter writing-related lessons (Letter Basics, Formal, Informal, Semi-formal)
        const writingLessons = data.lessons.filter(l => 
          l.writing || l.topic?.toLowerCase().includes('letter') || l.topic?.toLowerCase().includes('formal')
        );
        setGeneralLessons(writingLessons);
        if (writingLessons.length > 0) {
          setSelectedGeneralLesson(writingLessons[0]);
        }
        
        // Filter reading-related lessons
        const readingLessons = data.lessons.filter(l => 
          l.reading || l.topic?.toLowerCase().includes('reading')
        );
        setGeneralReadingLessons(readingLessons);
        if (readingLessons.length > 0) {
          setSelectedReadingLesson(readingLessons[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching general lessons:', error);
    }
  };

  const selectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setView('lesson-detail');
    setCurrentSection('vocabulary');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setSpeakingResponse('');
    setSpeakingFeedback(null);
    setWritingResponse('');
    setWritingFeedback(null);
    // Reset listening states
    setListeningAnswers({});
    setListeningSubmitted(false);
    setListeningScore(0);
    setShowTranscript(false);
    
    // Fetch module-specific language booster
    fetchModuleLanguageBooster(lesson.title || lesson.topic);
  };

  // Fetch Module-Specific Language Booster
  const fetchModuleLanguageBooster = async (lessonTitle) => {
    try {
      const topicToBooster = {
        'family': 'family',
        'food': 'food',
        'daily': 'work',
        'routine': 'work',
        'home': 'housing',
        'hobbies': 'leisure',
        'leisure': 'leisure',
        'health': 'health',
        'education': 'education',
        'work': 'work',
        'travel': 'travel',
        'shopping': 'finance',
        'weather': 'environment',
        'environment': 'environment',
        'technology': 'technology',
        'culture': 'culture',
        'sports': 'sports',
        'media': 'media',
        'transport': 'transport',
        'crime': 'crime',
        'science': 'science',
        'money': 'finance',
        'finance': 'finance',
      };
      
      const normalizedTitle = lessonTitle?.toLowerCase() || '';
      let boosterModule = 'education'; // default
      
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
        audio.onerror = () => {
          setPlayingAudio(null);
          fallbackToBrowserTTS(text);
        };
        await audio.play();
        return;
      }
    } catch (error) {
      console.error('API TTS error:', error);
    }
    
    fallbackToBrowserTTS(text);
  };
  
  // Pronunciation Recording Functions
  const startPronunciationRecording = async (word) => {
    try {
      setPronunciationWord(word);
      setPronunciationFeedback(null);
      pronunciationChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          pronunciationChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(pronunciationChunksRef.current, { type: 'audio/webm' });
        await assessPronunciation(audioBlob, word);
      };
      
      pronunciationRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setPronunciationRecording(true);
      
      // Auto-stop after 3 seconds for single words
      setTimeout(() => {
        if (pronunciationRecorderRef.current?.state === 'recording') {
          stopPronunciationRecording();
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error starting pronunciation recording:', error);
      toast.error('Could not access microphone');
    }
  };
  
  const stopPronunciationRecording = () => {
    if (pronunciationRecorderRef.current?.state === 'recording') {
      pronunciationRecorderRef.current.stop();
      setPronunciationRecording(false);
    }
  };
  
  const assessPronunciation = async (audioBlob, word) => {
    setEvaluatingPronunciation(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('reference_text', word);
      const _email = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null')?.email || null; } catch { return null; } })();
      if (_email) formData.append('email', _email);

      const response = await fetch(`${API_URL}/api/beginner/pronunciation/assess`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setPronunciationFeedback(data.feedback);
        
        if (data.feedback.stars >= 4) {
          toast.success(data.feedback.main_feedback);
        }
      } else {
        throw new Error('Assessment failed');
      }
    } catch (error) {
      console.error('Pronunciation assessment error:', error);
      toast.error('Could not assess pronunciation. Try again!');
    } finally {
      setEvaluatingPronunciation(false);
    }
  };

  const fallbackToBrowserTTS = (text) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.onend = () => setPlayingAudio(null);
        utterance.onerror = () => setPlayingAudio(null);
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        setPlayingAudio(null);
      }
    } else {
      setPlayingAudio(null);
    }
  };

  // Recording for speaking practice
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await transcribeRecording(blob);
      };

      mediaRecorder.start();
      setRecording(true);
      toast.info('Recording... Speak now!');
    } catch (error) {
      console.error('Microphone error:', error);
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
    toast.info('Transcribing your speech...');
    
    try {
      const formData = new FormData();
      formData.append('file', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));
      
      const response = await fetch(`${API_URL}/api/transcribe-audio`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Transcription failed');
      const data = await response.json();
      
      setSpeakingResponse(data.text || '');
      toast.success('Speech transcribed!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe speech');
    }
  };

  // Evaluate speaking response
  const evaluateSpeaking = async () => {
    if (!speakingResponse.trim()) {
      toast.error('Please record or type your answer first');
      return;
    }

    toast.info('Evaluating your response...');
    
    try {
      const response = await fetch(`${API_URL}/api/beginner-english/evaluate-speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: selectedLesson.speaking.question,
          model_answer: selectedLesson.speaking.model_answer,
          user_response: speakingResponse
        })
      });
      
      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      setSpeakingFeedback(data);
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Failed to evaluate response');
    }
  };

  // Evaluate writing response
  const evaluateWriting = async () => {
    if (!writingResponse.trim()) {
      toast.error('Please write your answer first');
      return;
    }

    setEvaluatingWriting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/beginner-english/evaluate-writing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: selectedLesson.writing.task,
          model_answer: selectedLesson.writing.model_answer,
          user_response: writingResponse
        })
      });
      
      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      setWritingFeedback(data);
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Failed to evaluate writing');
    } finally {
      setEvaluatingWriting(false);
    }
  };

  // Quiz handlers
  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = () => {
    if (!selectedLesson) return;
    
    let correct = 0;
    const total = selectedLesson.reading.questions.length + 1; // reading questions + grammar
    
    // Check reading answers
    selectedLesson.reading.questions.forEach((q, idx) => {
      const userAnswer = (quizAnswers[`reading_${idx}`] || '').toLowerCase().trim();
      const correctAnswer = q.answer.toLowerCase().trim();
      if (userAnswer && correctAnswer.includes(userAnswer.substring(0, 10))) {
        correct++;
      }
    });
    
    // Check grammar (common mistake)
    const grammarAnswer = quizAnswers['grammar'];
    if (grammarAnswer === 'correct') {
      correct++;
    }
    
    setQuizScore(Math.round((correct / total) * 100));
    setQuizSubmitted(true);
    toast.success(`Quiz completed! Score: ${Math.round((correct / total) * 100)}%`);
    
    // Mark quiz section as complete for progress tracking
    if (selectedLesson) {
      markSectionComplete('beginner', selectedLesson.lesson_number, 'quiz');
    }
  };

  // Render lessons list
  const renderLessonsList = () => (
    <LessonsListView
      navigate={navigate}
      getText={getText}
      loading={loading}
      lessons={lessons}
      selectLesson={selectLesson}
    />
  );

  // Render lesson detail
  const renderLessonDetail = () => (
    <LessonDetailView
      selectedLesson={selectedLesson}
      setView={setView}
      setSelectedLesson={setSelectedLesson}
      currentSection={currentSection}
      setCurrentSection={setCurrentSection}
      renderSectionContent={renderSectionContent}
    />
  );

  // Render section content
  const renderSectionContent = () => {
    if (!selectedLesson) return null;

    switch (currentSection) {
      case 'vocabulary':
        return renderVocabulary();
      case 'grammar':
        return renderGrammar();
      case 'listening':
        return renderListening();
      case 'reading':
        return renderReading();
      case 'speaking':
        return renderSpeaking();
      case 'writing':
        return renderWriting();
      case 'quiz':
        return renderQuiz();
      default:
        return renderVocabulary();
    }
  };

  // Render Vocabulary Section
  const renderVocabulary = () => (
    <VocabularySection
      selectedLesson={selectedLesson}
      user={user}
      navigate={navigate}
      getText={getText}
      playPronunciation={playPronunciation}
      playingAudio={playingAudio}
      pronunciationRecording={pronunciationRecording}
      pronunciationWord={pronunciationWord}
      startPronunciationRecording={startPronunciationRecording}
      stopPronunciationRecording={stopPronunciationRecording}
      evaluatingPronunciation={evaluatingPronunciation}
      pronunciationFeedback={pronunciationFeedback}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render Grammar Section - Enhanced with examples and practice
  const renderGrammar = () => (
    <GrammarSection
      selectedLesson={selectedLesson}
      t={t}
      grammarPracticeAnswers={grammarPracticeAnswers}
      setGrammarPracticeAnswers={setGrammarPracticeAnswers}
      grammarPracticeSubmitted={grammarPracticeSubmitted}
      setGrammarPracticeSubmitted={setGrammarPracticeSubmitted}
      grammarPracticeScore={grammarPracticeScore}
      setGrammarPracticeScore={setGrammarPracticeScore}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render Listening Section
  const renderListening = () => (
    <ListeningSection
      selectedLesson={selectedLesson}
      listeningAnswers={listeningAnswers}
      setListeningAnswers={setListeningAnswers}
      listeningSubmitted={listeningSubmitted}
      setListeningSubmitted={setListeningSubmitted}
      listeningScore={listeningScore}
      setListeningScore={setListeningScore}
      isPlayingListening={isPlayingListening}
      setIsPlayingListening={setIsPlayingListening}
      showTranscript={showTranscript}
      setShowTranscript={setShowTranscript}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render Reading Section
  const renderReading = () => (
    <ReadingSection
      readingTrack={readingTrack}
      setReadingTrack={setReadingTrack}
      selectedLesson={selectedLesson}
      generalReadingLessons={generalReadingLessons}
      selectedReadingLesson={selectedReadingLesson}
      setSelectedReadingLesson={setSelectedReadingLesson}
      playPronunciation={playPronunciation}
      playingAudio={playingAudio}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render Speaking Section
  const renderSpeaking = () => (
    <SpeakingSection
      selectedLesson={selectedLesson}
      recording={recording}
      startRecording={startRecording}
      stopRecording={stopRecording}
      speakingResponse={speakingResponse}
      setSpeakingResponse={setSpeakingResponse}
      evaluateSpeaking={evaluateSpeaking}
      speakingFeedback={speakingFeedback}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render Writing Section
  const renderWriting = () => (
    <WritingSection
      writingTrack={writingTrack}
      setWritingTrack={setWritingTrack}
      writingResponse={writingResponse}
      setWritingResponse={setWritingResponse}
      writingFeedback={writingFeedback}
      setWritingFeedback={setWritingFeedback}
      evaluateWriting={evaluateWriting}
      evaluatingWriting={evaluatingWriting}
      selectedLesson={selectedLesson}
      generalLessons={generalLessons}
      selectedGeneralLesson={selectedGeneralLesson}
      setSelectedGeneralLesson={setSelectedGeneralLesson}
      setCurrentSection={setCurrentSection}
    />
  );

  // Render Quiz Section
  const renderQuiz = () => (
    <QuizSection
      selectedLesson={selectedLesson}
      quizAnswers={quizAnswers}
      handleQuizAnswer={handleQuizAnswer}
      quizSubmitted={quizSubmitted}
      setQuizSubmitted={setQuizSubmitted}
      setQuizAnswers={setQuizAnswers}
      quizScore={quizScore}
      submitQuiz={submitQuiz}
      getText={getText}
      setView={setView}
      setSelectedLesson={setSelectedLesson}
      setCurrentSection={setCurrentSection}
    />
  );

  return (
    <div className={`min-h-screen ${bgMain} pb-24 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'lessons' && renderLessonsList()}
        {view === 'lesson-detail' && renderLessonDetail()}
      </div>
      
      {/* CTA Banner for visitors - only show on quiz section or after completing quiz */}
      {!user && (currentSection === 'quiz' || quizSubmitted) && <SignUpCTA variant="banner" />}
    </div>
  );
}
