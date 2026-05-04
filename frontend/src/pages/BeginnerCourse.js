import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  BookOpen, Volume2, Mic, Square, ChevronLeft, ChevronRight, 
  CheckCircle, XCircle, ArrowLeft, Loader2, GraduationCap,
  MessageSquare, PenTool, AlertCircle, Trophy, Star, Home,
  Languages, FileText, HelpCircle, Headphones, Play, Pause, Lightbulb, RotateCcw,
  Target, Award, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import SideBySideReader from '../components/test/SideBySideReader';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { useI18n } from '../lib/i18n';
import { 
  markSectionComplete, 
  getLessonProgress, 
  isLessonCompleted, 
  getCourseProgress,
  isSectionCompleted,
  markLessonComplete
} from '../lib/progressTracker';
import SignUpCTA from '../components/SignUpCTA';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Topic icons and colors
const TOPIC_CONFIG = {
  'Family': { icon: '👨‍👩‍👧', color: 'from-pink-500 to-rose-600', lightBg: 'bg-pink-50' },
  'Daily Life': { icon: '☀️', color: 'from-yellow-500 to-orange-500', lightBg: 'bg-yellow-50' },
  'Food': { icon: '🍎', color: 'from-red-500 to-pink-500', lightBg: 'bg-red-50' },
  'Work': { icon: '💼', color: 'from-blue-500 to-indigo-600', lightBg: 'bg-blue-50' },
  'Education': { icon: '📚', color: 'from-purple-500 to-violet-600', lightBg: 'bg-purple-50' },
  'Travel': { icon: '✈️', color: 'from-cyan-500 to-blue-600', lightBg: 'bg-cyan-50' },
  'Health': { icon: '💪', color: 'from-green-500 to-emerald-600', lightBg: 'bg-green-50' },
  'Hobbies': { icon: '🎨', color: 'from-amber-500 to-orange-500', lightBg: 'bg-amber-50' },
  'Technology': { icon: '💻', color: 'from-slate-500 to-gray-600', lightBg: 'bg-slate-50' },
  'Environment': { icon: '🌿', color: 'from-emerald-500 to-teal-600', lightBg: 'bg-emerald-50' },
  'Money': { icon: '💰', color: 'from-yellow-500 to-amber-600', lightBg: 'bg-yellow-50' },
  'Housing': { icon: '🏠', color: 'from-orange-500 to-red-500', lightBg: 'bg-orange-50' },
  'Transportation': { icon: '🚌', color: 'from-indigo-500 to-blue-600', lightBg: 'bg-indigo-50' },
  'Weather': { icon: '🌤️', color: 'from-sky-500 to-blue-500', lightBg: 'bg-sky-50' }
};

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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {getText('backToDashboard')}
        </Button>
        <ThemeToggle />
      </div>
      
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200 animate-bounce">
          <span className="text-5xl">🌟</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getText('title')}</h1>
        <p className="text-gray-600 text-lg">{getText('subtitle')}</p>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mt-4 max-w-xl mx-auto border border-green-100">
          <p className="text-sm text-green-800">
            {getText('welcomeMsg')}
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-500" />
          <p className="mt-2 text-green-600">{getText('loading')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {lessons.map((lesson) => {
            const config = TOPIC_CONFIG[lesson.topic] || { icon: '📖', color: 'from-gray-500 to-gray-600', lightBg: 'bg-gray-50' };
            const lessonProgress = getLessonProgress('beginner', lesson.lesson_number);
            const isComplete = isLessonCompleted('beginner', lesson.lesson_number);
            
            return (
              <Card 
                key={lesson.id}
                className={`p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md ${config.lightBg} ${isComplete ? 'ring-2 ring-green-400' : ''}`}
                onClick={() => selectLesson(lesson)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0 relative`}>
                    {config.icon}
                    {isComplete && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 bg-white/80 px-2 py-0.5 rounded-full">
                        {getText('lesson')} {lesson.lesson_number}
                      </span>
                      {lessonProgress > 0 && !isComplete && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {lessonProgress}%
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{lesson.topic}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{lesson.learning_goals}</p>
                    {/* Progress Bar */}
                    {lessonProgress > 0 && (
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isComplete ? 'bg-green-500' : 'bg-green-400'} transition-all`}
                          style={{ width: `${lessonProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render lesson detail
  const renderLessonDetail = () => {
    if (!selectedLesson) return null;
    const config = TOPIC_CONFIG[selectedLesson.topic] || { icon: '📖', color: 'from-gray-500 to-gray-600' };
    
    const sections = [
      { id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' },
      { id: 'grammar', icon: Languages, label: 'Grammar' },
      { id: 'listening', icon: Headphones, label: 'Listening' },
      { id: 'reading', icon: FileText, label: 'Reading' },
      { id: 'speaking', icon: Mic, label: 'Speaking' },
      { id: 'writing', icon: PenTool, label: 'Writing' },
      { id: 'quiz', icon: HelpCircle, label: 'Quiz' }
    ];

    return (
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => { setView('lessons'); setSelectedLesson(null); }}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lessons
        </Button>
        
        {/* Lesson Header */}
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl shadow-lg`}>
              {config.icon}
            </div>
            <div>
              <span className="text-sm text-gray-500">Lesson {selectedLesson.lesson_number}</span>
              <h2 className="text-2xl font-bold text-gray-900">{selectedLesson.topic}</h2>
              <p className="text-gray-600">{selectedLesson.learning_goals}</p>
            </div>
          </div>
          
          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const sectionComplete = isSectionCompleted('beginner', selectedLesson.lesson_number, section.id);
              return (
                <Button
                  key={section.id}
                  variant={currentSection === section.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentSection(section.id)}
                  className={`relative ${currentSection === section.id ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : ''} ${sectionComplete ? 'border-green-400' : ''}`}
                >
                  {sectionComplete ? (
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  ) : (
                    <section.icon className="w-4 h-4 mr-1" />
                  )}
                  {section.label}
                </Button>
              );
            })}
          </div>
        </Card>
        
        {/* Section Content */}
        {renderSectionContent()}
      </div>
    );
  };

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
    <Card className="p-6 bg-white border-0 shadow-lg">
      <div className="text-center mb-6 pb-4 border-b border-green-100">
        <div className="text-4xl mb-2">📚</div>
        <h3 className="text-xl font-bold text-gray-900">{getText('newWords')}</h3>
        <p className="text-sm text-gray-500">{getText('clickToListen')}</p>
      </div>
      
      <div className="space-y-4">
        {selectedLesson.vocabulary.map((item, idx) => (
          <div key={idx} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-bold text-gray-900">{item.word}</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playPronunciation(item.word)}
                  disabled={playingAudio === item.word}
                  className="text-blue-600 gap-1"
                >
                  {playingAudio === item.word ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>🔊 {getText('listen')}</>
                  )}
                </Button>
                <Button
                  variant={pronunciationRecording && pronunciationWord === item.word ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (pronunciationRecording && pronunciationWord === item.word) {
                      stopPronunciationRecording();
                    } else {
                      startPronunciationRecording(item.word);
                    }
                  }}
                  disabled={evaluatingPronunciation || (pronunciationRecording && pronunciationWord !== item.word)}
                  className={pronunciationRecording && pronunciationWord === item.word ? "gap-1" : "text-green-600 gap-1"}
                >
                  {evaluatingPronunciation && pronunciationWord === item.word ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : pronunciationRecording && pronunciationWord === item.word ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Pronunciation Feedback */}
            {pronunciationFeedback && pronunciationWord === item.word && (
              <div className={`mt-3 p-3 rounded-lg ${pronunciationFeedback.stars >= 4 ? 'bg-green-50 border border-green-200' : pronunciationFeedback.stars >= 2 ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= pronunciationFeedback.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-sm">{pronunciationFeedback.main_feedback}</span>
                </div>
                <p className="text-sm text-gray-600">{pronunciationFeedback.encouragement}</p>
                {pronunciationFeedback.tips && pronunciationFeedback.tips.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-500">
                    {pronunciationFeedback.tips.map((tip, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            <p className="text-gray-600 mb-2">
              <span className="font-medium text-gray-700">Meaning:</span> {item.meaning}
            </p>
            <p className="text-gray-600 italic">
              <span className="font-medium text-gray-700 not-italic">Example:</span> &ldquo;{item.example}&rdquo;
            </p>
          </div>
        ))}
      </div>
      
      {/* Interactive Vocabulary Engine */}
      {user && selectedLesson && (
        <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <h4 className="font-bold text-green-900 mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Interactive Vocabulary Practice
          </h4>
          <p className="text-sm text-green-600 mb-4">Master these words through interactive exercises</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              data-testid="vocab-engine-learn-btn"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => navigate(`/vocabulary/learn/${selectedLesson.id}`)}
            >
              <BookOpen className="w-4 h-4 mr-1" /> Learn
            </Button>
            <Button
              data-testid="vocab-engine-practice-btn"
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              onClick={() => navigate(`/vocabulary/practice/${selectedLesson.id}`)}
            >
              <PenTool className="w-4 h-4 mr-1" /> Practice
            </Button>
            <Button
              data-testid="vocab-engine-quiz-btn"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={() => navigate(`/vocabulary/quiz/${selectedLesson.id}`)}
            >
              <HelpCircle className="w-4 h-4 mr-1" /> Quiz
            </Button>
            <Button
              data-testid="vocab-engine-production-btn"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => navigate(`/vocabulary/production/${selectedLesson.id}`)}
            >
              <Award className="w-4 h-4 mr-1" /> Production
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <Button onClick={() => setCurrentSection('grammar')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          Next: Grammar <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render Grammar Section - Enhanced with examples and practice
  const renderGrammar = () => {
    // Generate additional examples based on lesson topic
    const getAdditionalExamples = () => {
      const topic = selectedLesson?.topic?.toLowerCase() || '';
      const grammarTitle = selectedLesson?.grammar?.title?.toLowerCase() || '';
      
      // Topic-specific grammar examples
      const exampleSets = {
        family: {
          'present simple': [
            { correct: "My mother is a teacher.", wrong: "My mother are a teacher." },
            { correct: "My parents are from Turkey.", wrong: "My parents is from Turkey." },
            { correct: "He has two sisters.", wrong: "He have two sisters." },
            { correct: "She works at a hospital.", wrong: "She work at a hospital." }
          ],
          'to be': [
            { correct: "I am the youngest in my family.", wrong: "I is the youngest." },
            { correct: "My brother is 25 years old.", wrong: "My brother have 25 years." },
            { correct: "They are my cousins.", wrong: "They is my cousins." }
          ]
        },
        'daily life': {
          'present simple': [
            { correct: "I wake up at 7 AM.", wrong: "I am wake up at 7 AM." },
            { correct: "She goes to work by bus.", wrong: "She go to work by bus." },
            { correct: "We eat dinner at 8 PM.", wrong: "We eats dinner at 8 PM." },
            { correct: "He doesn't like coffee.", wrong: "He don't like coffee." }
          ]
        },
        food: {
          'countable': [
            { correct: "I would like some water.", wrong: "I would like a water." },
            { correct: "There is some rice on the plate.", wrong: "There are some rice." },
            { correct: "How much sugar do you want?", wrong: "How many sugar do you want?" },
            { correct: "I bought two loaves of bread.", wrong: "I bought two breads." }
          ],
          'present simple': [
            { correct: "I usually eat breakfast at 8.", wrong: "I usually eating breakfast." },
            { correct: "She likes Italian food.", wrong: "She like Italian food." }
          ]
        },
        work: {
          'present simple': [
            { correct: "He works in an office.", wrong: "He work in an office." },
            { correct: "They don't work on Sundays.", wrong: "They doesn't work on Sundays." },
            { correct: "Does she work here?", wrong: "Do she works here?" }
          ]
        },
        default: [
          { correct: "I am a student.", wrong: "I is a student." },
          { correct: "She has a car.", wrong: "She have a car." },
          { correct: "They are happy.", wrong: "They is happy." },
          { correct: "He doesn't speak French.", wrong: "He don't speaks French." }
        ]
      };
      
      // Find matching examples
      for (const [key, examples] of Object.entries(exampleSets)) {
        if (topic.includes(key)) {
          for (const [grammarType, sentences] of Object.entries(examples)) {
            if (grammarTitle.includes(grammarType)) {
              return sentences;
            }
          }
          return Object.values(examples)[0] || exampleSets.default;
        }
      }
      return exampleSets.default;
    };
    
    // Generate practice exercises
    const getPracticeExercises = () => {
      const topic = selectedLesson?.topic?.toLowerCase() || '';
      
      const exercises = {
        family: [
          { sentence: "My sister ___ a doctor.", options: ["is", "are", "am"], correct: "is" },
          { sentence: "I ___ two brothers.", options: ["has", "have", "am"], correct: "have" },
          { sentence: "They ___ from Istanbul.", options: ["is", "are", "am"], correct: "are" },
          { sentence: "She ___ married.", options: ["is", "are", "have"], correct: "is" }
        ],
        'daily life': [
          { sentence: "He ___ up at 6 AM every day.", options: ["wake", "wakes", "waking"], correct: "wakes" },
          { sentence: "I ___ to work by car.", options: ["goes", "go", "going"], correct: "go" },
          { sentence: "She ___ TV in the evening.", options: ["watch", "watches", "watching"], correct: "watches" },
          { sentence: "We ___ breakfast together.", options: ["has", "have", "having"], correct: "have" }
        ],
        food: [
          { sentence: "I would like ___ coffee.", options: ["a", "some", "many"], correct: "some" },
          { sentence: "How ___ apples do you want?", options: ["much", "many", "some"], correct: "many" },
          { sentence: "There ___ milk in the fridge.", options: ["is", "are", "have"], correct: "is" },
          { sentence: "She ___ pizza very much.", options: ["like", "likes", "liking"], correct: "likes" }
        ],
        work: [
          { sentence: "He ___ in a bank.", options: ["work", "works", "working"], correct: "works" },
          { sentence: "They ___ work on weekends.", options: ["doesn't", "don't", "isn't"], correct: "don't" },
          { sentence: "___ she work here?", options: ["Do", "Does", "Is"], correct: "Does" },
          { sentence: "I ___ a teacher.", options: ["am", "is", "are"], correct: "am" }
        ],
        default: [
          { sentence: "She ___ a student.", options: ["is", "are", "am"], correct: "is" },
          { sentence: "They ___ happy today.", options: ["is", "are", "am"], correct: "are" },
          { sentence: "I ___ from Turkey.", options: ["is", "are", "am"], correct: "am" },
          { sentence: "He ___ a car.", options: ["have", "has", "is"], correct: "has" }
        ]
      };
      
      for (const [key, exs] of Object.entries(exercises)) {
        if (topic.includes(key)) return exs;
      }
      return exercises.default;
    };
    
    const additionalExamples = getAdditionalExamples();
    const practiceExercises = getPracticeExercises();
    
    const handlePracticeAnswer = (index, answer) => {
      setGrammarPracticeAnswers(prev => ({ ...prev, [index]: answer }));
    };
    
    const submitPractice = () => {
      let score = 0;
      practiceExercises.forEach((ex, idx) => {
        if (grammarPracticeAnswers[idx] === ex.correct) score++;
      });
      setGrammarPracticeScore(score);
      setGrammarPracticeSubmitted(true);
    };
    
    const resetPractice = () => {
      setGrammarPracticeAnswers({});
      setGrammarPracticeSubmitted(false);
      setGrammarPracticeScore(0);
    };
    
    return (
      <div className="space-y-6" id="grammar-section">
        {/* Main Grammar Card */}
        <Card className="p-6 bg-white border-0 shadow-lg scroll-mt-24">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Languages className="w-5 h-5 text-purple-600" />
            {selectedLesson.grammar.title}
          </h3>
          
          {/* Rule Explanation */}
          <div className="bg-purple-50 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-purple-900 mb-2">{t('grammarRule') || 'Grammar Rule'}</h4>
                <p className="text-gray-700">{selectedLesson.grammar.explanation}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
              <p className="font-medium text-gray-600 text-sm mb-1">{t('example') || 'Example'}:</p>
              <p className="text-purple-700 text-lg font-medium">&ldquo;{selectedLesson.grammar.example}&rdquo;</p>
            </div>
          </div>
          
          {/* More Examples Section */}
          <div className="bg-blue-50 rounded-xl p-5 mb-6">
            <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('moreExamples') || 'More Examples'}
            </h4>
            <div className="grid gap-3">
              {additionalExamples.slice(0, 4).map((ex, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-green-700 font-medium">{ex.correct}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-500 text-sm line-through">{ex.wrong}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Common Mistake */}
          <div className="bg-red-50 rounded-xl p-5">
            <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t('commonMistake') || 'Common Mistake'}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 line-through">{selectedLesson.common_mistake.wrong}</p>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 font-medium">{selectedLesson.common_mistake.correct}</p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Grammar Practice Card */}
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-indigo-600" />
            {t('grammarPractice') || 'Grammar Practice'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {t('fillInBlanks') || 'Fill in the blanks with the correct word:'}
          </p>
          
          <div className="space-y-4">
            {practiceExercises.map((exercise, idx) => (
              <div key={idx} className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-colors ${
                grammarPracticeSubmitted
                  ? grammarPracticeAnswers[idx] === exercise.correct
                    ? 'border-green-400 bg-green-50'
                    : 'border-red-400 bg-red-50'
                  : 'border-transparent'
              }`}>
                <p className="font-medium text-gray-800 mb-3">
                  {idx + 1}. {exercise.sentence}
                </p>
                <div className="flex flex-wrap gap-2">
                  {exercise.options.map((option) => (
                    <Button
                      key={option}
                      variant={grammarPracticeAnswers[idx] === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => !grammarPracticeSubmitted && handlePracticeAnswer(idx, option)}
                      disabled={grammarPracticeSubmitted}
                      className={`${
                        grammarPracticeSubmitted && option === exercise.correct
                          ? 'bg-green-500 hover:bg-green-500 text-white border-green-500'
                          : grammarPracticeSubmitted && grammarPracticeAnswers[idx] === option && option !== exercise.correct
                            ? 'bg-red-500 hover:bg-red-500 text-white border-red-500'
                            : grammarPracticeAnswers[idx] === option
                              ? 'bg-indigo-600 text-white'
                              : ''
                      }`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                {grammarPracticeSubmitted && grammarPracticeAnswers[idx] !== exercise.correct && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {t('correctAnswer') || 'Correct answer'}: <span className="font-bold">{exercise.correct}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {/* Submit/Results */}
          <div className="mt-6">
            {!grammarPracticeSubmitted ? (
              <Button 
                onClick={submitPractice}
                disabled={Object.keys(grammarPracticeAnswers).length < practiceExercises.length}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('checkAnswers') || 'Check Answers'}
              </Button>
            ) : (
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full mb-4 ${
                  grammarPracticeScore === practiceExercises.length
                    ? 'bg-green-100 text-green-700'
                    : grammarPracticeScore >= practiceExercises.length / 2
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}>
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold text-lg">
                    {grammarPracticeScore} / {practiceExercises.length} {t('correct') || 'correct'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  {grammarPracticeScore === practiceExercises.length
                    ? (t('perfectScore') || '🎉 Perfect! You mastered this grammar!')
                    : grammarPracticeScore >= practiceExercises.length / 2
                      ? (t('goodJob') || '👍 Good job! Review the mistakes above.')
                      : (t('keepPracticing') || '📚 Keep practicing! Review the examples above.')}
                </p>
                <Button onClick={resetPractice} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('tryAgain') || 'Try Again'}
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('vocabulary')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> {t('vocabulary') || 'Vocabulary'}
          </Button>
          <Button onClick={() => setCurrentSection('listening')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            {t('next') || 'Next'}: {t('listening') || 'Listening'} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  // Render Listening Section
  const renderListening = () => {
    const listening = selectedLesson?.listening;
    if (!listening) return (
      <Card className="p-6 text-center">
        <Headphones className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No listening content available for this lesson.</p>
        <Button onClick={() => setCurrentSection('reading')} className="mt-4">
          Continue to Reading <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Card>
    );

    const handleListeningAnswer = (qIndex, answer) => {
      if (listeningSubmitted) return;
      setListeningAnswers({ ...listeningAnswers, [qIndex]: answer });
    };

    const submitListeningQuiz = () => {
      let correct = 0;
      listening.questions.forEach((q, idx) => {
        if (listeningAnswers[idx] === q.answer) {
          correct++;
        }
      });
      setListeningScore(correct);
      setListeningSubmitted(true);
      toast.success(`You got ${correct}/${listening.questions.length} correct!`);
    };

    const playListeningAudio = async () => {
      if (isPlayingListening) {
        // Stop currently playing audio
        if (window.currentListeningAudio) {
          window.currentListeningAudio.pause();
          window.currentListeningAudio = null;
        }
        setIsPlayingListening(false);
        return;
      }
      
      setIsPlayingListening(true);
      
      try {
        // Use pre-generated local audio files (much faster!)
        const lessonNum = selectedLesson.lesson_number;
        const audioUrl = `/audio/listening/lesson-${lessonNum}.mp3`;
        
        const audio = new Audio(audioUrl);
        window.currentListeningAudio = audio;
        
        audio.onloadeddata = () => {
          toast.success('Playing audio', { duration: 1500 });
        };
        
        audio.onended = () => {
          setIsPlayingListening(false);
          window.currentListeningAudio = null;
        };
        
        audio.onerror = async () => {
          // Fallback to API if local file not found
          console.log('Local audio not found, fetching from API...');
          try {
            const response = await fetch(`${API_URL}/api/beginner-english/listening-audio/${selectedLesson.id}`);
            const data = await response.json();
            
            if (data.success && data.audio_base64) {
              const audioBlob = new Blob(
                [Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))],
                { type: 'audio/mp3' }
              );
              const blobUrl = URL.createObjectURL(audioBlob);
              const fallbackAudio = new Audio(blobUrl);
              
              window.currentListeningAudio = fallbackAudio;
              fallbackAudio.onended = () => {
                setIsPlayingListening(false);
                URL.revokeObjectURL(blobUrl);
                window.currentListeningAudio = null;
              };
              
              await fallbackAudio.play();
              toast.success('Playing audio');
            } else {
              throw new Error('API fallback failed');
            }
          } catch (apiError) {
            setIsPlayingListening(false);
            toast.error('Audio not available');
            window.currentListeningAudio = null;
          }
        };
        
        await audio.play();
      } catch (error) {
        console.error('Audio error:', error);
        setIsPlayingListening(false);
        toast.error('Failed to play audio');
        window.currentListeningAudio = null;
      }
    };

    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Headphones className="w-5 h-5 text-purple-600" />
          Listening Practice: {listening.title}
        </h3>

        {/* Tips */}
        {listening.tips && listening.tips.length > 0 && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-purple-700 mb-1">💡 Listening Tips:</p>
            <ul className="text-sm text-purple-600 space-y-1">
              {listening.tips.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Audio Player */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-700">
              🎧 Listen to the conversation carefully, then answer the questions below.
            </p>
            <Button
              onClick={playListeningAudio}
              className={`${isPlayingListening ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
            >
              {isPlayingListening ? (
                <>
                  <Pause className="w-4 h-4 mr-2" /> Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Play Audio
                </>
              )}
            </Button>
          </div>
          
          {/* Show Transcript Toggle */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-xs"
          >
            {showTranscript ? 'Hide Transcript' : 'Show Transcript (after listening)'}
          </Button>
          
          {showTranscript && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-line">{listening.transcript}</p>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Questions</h4>
          {listening.questions.map((q, qIdx) => (
            <div key={qIdx} className={`p-4 rounded-lg border ${
              listeningSubmitted 
                ? listeningAnswers[qIdx] === q.answer 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className="font-medium text-gray-800 mb-3">
                {qIdx + 1}. {q.question}
              </p>
              
              <div className="space-y-2">
                {q.options.map((option, oIdx) => (
                  <label 
                    key={oIdx} 
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                      listeningSubmitted
                        ? option === q.answer
                          ? 'bg-green-100 text-green-800'
                          : listeningAnswers[qIdx] === option
                            ? 'bg-red-100 text-red-800'
                            : 'bg-white'
                        : listeningAnswers[qIdx] === option
                          ? 'bg-purple-100'
                          : 'hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`listening-q-${qIdx}`}
                      checked={listeningAnswers[qIdx] === option}
                      onChange={() => handleListeningAnswer(qIdx, option)}
                      disabled={listeningSubmitted}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm">{option}</span>
                    {listeningSubmitted && option === q.answer && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                    {listeningSubmitted && listeningAnswers[qIdx] === option && option !== q.answer && (
                      <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
              
              {listeningSubmitted && (
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Correct answer:</span> {q.answer}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Submit / Results */}
        {!listeningSubmitted ? (
          <Button 
            onClick={submitListeningQuiz}
            disabled={Object.keys(listeningAnswers).length < listening.questions.length}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Submit Answers
          </Button>
        ) : (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl text-center">
            <div className="text-4xl mb-2">
              {listeningScore === listening.questions.length ? '🎧🏆' : 
               listeningScore >= listening.questions.length / 2 ? '🎧⭐' : '🎧💪'}
            </div>
            <p className="text-lg font-bold text-gray-800">
              You got {listeningScore} out of {listening.questions.length}!
            </p>
            <p className="text-sm text-gray-600">
              {listeningScore === listening.questions.length 
                ? 'WOW! Perfect score! Your ears are amazing! 🎉' 
                : listeningScore >= listening.questions.length / 2
                  ? 'Nice listening! You heard a lot of the words! 👍'
                  : 'Good try! Listen again and you\'ll hear more! 💪'}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
          </Button>
          <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
  };

  // Render Reading Section
  const renderReading = () => {
    // For Academic track, check if lesson has reading content
    if (readingTrack === 'academic' && !selectedLesson?.reading) {
      return <Card className="p-6"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></Card>;
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Reading Practice
          </h3>
          
          {/* Track Toggle - Academic vs General Training */}
          <div className="flex items-center gap-2">
            <Button
              variant={readingTrack === 'academic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setReadingTrack('academic')}
              className={readingTrack === 'academic' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <BookOpen className="w-4 h-4 mr-1" /> Academic IELTS
            </Button>
            <Button
              variant={readingTrack === 'general' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setReadingTrack('general')}
              className={readingTrack === 'general' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              <FileText className="w-4 h-4 mr-1" /> General Training
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          {readingTrack === 'academic' 
            ? '📘 Academic: Longer texts from books, journals - university/professional focus' 
            : '📋 General Training: Everyday texts - notices, emails, instructions'}
        </p>
        
        {/* Academic Reading */}
        {readingTrack === 'academic' && selectedLesson?.reading && (
          <>
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => playPronunciation(selectedLesson.reading.text)}
                disabled={playingAudio === selectedLesson.reading.text}
              >
                {playingAudio === selectedLesson.reading.text ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Volume2 className="w-4 h-4 mr-1" />
                )}
                Listen
              </Button>
            </div>
            
            <SideBySideReader
              passage={selectedLesson.reading.text}
              passageTitle="Reading Passage"
              defaultRatio={60}
            >
              {/* Comprehension Questions */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">Comprehension Questions</h4>
                {selectedLesson.reading.questions?.map((q, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm mb-2">{idx + 1}. {q.question}</p>
                    <details className="cursor-pointer">
                      <summary className="text-xs text-green-600 hover:text-green-700">Click to see answer</summary>
                      <p className="mt-2 text-gray-700 text-sm bg-green-50 p-2 rounded">{q.answer}</p>
                    </details>
                  </div>
                ))}
              </div>
            </SideBySideReader>
          </>
        )}
        
        {/* General Training Reading - GLOBAL FOUNDATION for Beginner */}
        {readingTrack === 'general' && (
          <>
            {generalReadingLessons.length > 0 ? (
              <>
                {/* Lesson Selector */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Select a Foundation Reading Lesson:</p>
                  <div className="flex flex-wrap gap-2">
                    {generalReadingLessons.map((lesson, idx) => (
                      <Button
                        key={idx}
                        variant={selectedReadingLesson?.id === lesson.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedReadingLesson(lesson)}
                        className={selectedReadingLesson?.id === lesson.id ? 'bg-purple-600' : ''}
                      >
                        {lesson.topic || lesson.title}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {selectedReadingLesson && (
                  <>
                    <div className="bg-purple-50 rounded-xl p-5 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-purple-600 text-white">FOUNDATION</Badge>
                        <span className="text-xs text-purple-600 font-semibold">GENERAL TRAINING READING</span>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 mb-2">{selectedReadingLesson.reading?.title || selectedReadingLesson.title}</h4>
                      
                      {/* Learning Goals */}
                      {selectedReadingLesson.learning_goals && (
                        <div className="mb-4 p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-2">🎯 Learning Goals:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedReadingLesson.learning_goals.map((goal, i) => (
                              <li key={i}>• {goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Text Types Info */}
                      {selectedReadingLesson.reading?.text_types && (
                        <div className="mb-4 p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-blue-700 mb-2">📚 Text Types You Will Learn:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedReadingLesson.reading.text_types.map((type, i) => (
                              <li key={i}>• {type}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Tips */}
                      {selectedReadingLesson.tips && (
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs font-semibold text-amber-700 mb-2">💡 Reading Tips:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedReadingLesson.tips.map((tip, i) => (
                              <li key={i}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Practice Text */}
                    {selectedReadingLesson.reading?.practice_text && (
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-5 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-gray-100 text-gray-700">{selectedReadingLesson.reading.practice_text.type}</Badge>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-line">
                          {selectedReadingLesson.reading.practice_text.content}
                        </div>
                      </div>
                    )}
                    
                    {/* Questions */}
                    {selectedReadingLesson.reading?.questions && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-900">Practice Questions</h4>
                        {selectedReadingLesson.reading.questions.map((q, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-900 text-sm mb-2">{idx + 1}. {q.question}</p>
                            <details className="cursor-pointer">
                              <summary className="text-xs text-green-600 hover:text-green-700">Click to see answer</summary>
                              <p className="mt-2 text-gray-700 text-sm bg-green-50 p-2 rounded">{q.answer}</p>
                            </details>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Loading General Training reading lessons...</p>
              </div>
            )}
          </>
        )}
      
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('listening')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Listening
          </Button>
          <Button onClick={() => setCurrentSection('speaking')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            Next: Speaking <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  // Render Speaking Section
  const renderSpeaking = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5 text-violet-600" />
        Speaking Practice
      </h3>
      
      <div className="bg-violet-50 rounded-xl p-5 mb-6">
        <p className="text-sm text-violet-600 font-medium mb-2">Question:</p>
        <p className="text-xl text-gray-900 font-medium">{selectedLesson.speaking.question}</p>
      </div>
      
      {/* Recording Controls */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">Record your answer or type it below:</p>
        <div className="flex gap-3 mb-4">
          {!recording ? (
            <Button onClick={startRecording} className="bg-violet-600 hover:bg-violet-700 text-white">
              <Mic className="w-4 h-4 mr-2" /> Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white">
              <Square className="w-4 h-4 mr-2" /> Stop Recording
            </Button>
          )}
        </div>
        
        <Textarea
          value={speakingResponse}
          onChange={(e) => setSpeakingResponse(e.target.value)}
          placeholder="Or type your answer here..."
          className="min-h-[100px]"
        />
        
        <Button 
          onClick={evaluateSpeaking} 
          disabled={!speakingResponse.trim()}
          className="mt-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white"
        >
          Get Feedback
        </Button>
      </div>
      
      {/* Model Answer */}
      <div className="bg-green-50 rounded-xl p-4 mb-4">
        <p className="text-sm text-green-600 font-medium mb-2">Model Answer:</p>
        <p className="text-gray-800 italic">&ldquo;{selectedLesson.speaking.model_answer}&rdquo;</p>
      </div>
      
      {/* Feedback */}
      {speakingFeedback && (
        <div className={`p-4 rounded-xl ${speakingFeedback.score >= 70 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {speakingFeedback.score >= 70 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Star className="w-5 h-5 text-yellow-600" />
            )}
            <span className="font-bold">{speakingFeedback.score}% Match</span>
          </div>
          <p className="text-gray-700">{speakingFeedback.feedback}</p>
          {speakingFeedback.tip && (
            <p className="text-sm text-gray-600 mt-2">💡 Tip: {speakingFeedback.tip}</p>
          )}
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('reading')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Reading
        </Button>
        <Button onClick={() => setCurrentSection('writing')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          Next: Writing <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render Writing Section
  const renderWriting = () => {
    if (!selectedLesson?.writing && writingTrack === 'academic') return <Card className="p-6"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></Card>;
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-orange-600" />
          Writing Practice
        </h3>
        
        {/* Track Toggle - Academic vs General Training */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-medium text-gray-600 mb-3">Select IELTS Track:</p>
          <div className="flex gap-2">
            <Button
              variant={writingTrack === 'academic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setWritingTrack('academic'); setWritingResponse(''); setWritingFeedback(null); }}
              className={writingTrack === 'academic' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <BookOpen className="w-4 h-4 mr-1" /> Academic IELTS
            </Button>
            <Button
              variant={writingTrack === 'general' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setWritingTrack('general'); setWritingResponse(''); setWritingFeedback(null); }}
              className={writingTrack === 'general' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              <FileText className="w-4 h-4 mr-1" /> General Training
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {writingTrack === 'academic' 
              ? '📝 Academic: Basic essay and paragraph writing'
              : '✉️ General: Letter writing basics (Formal, Informal, Semi-formal)'}
          </p>
        </div>
        
        {/* Academic Writing Content */}
        {writingTrack === 'academic' && selectedLesson?.writing && (
          <>
            <div className="bg-orange-50 rounded-xl p-5 mb-6">
              <p className="text-sm text-orange-600 font-medium mb-2">ACADEMIC WRITING TASK:</p>
              <p className="text-xl text-gray-900 font-medium">{selectedLesson.writing.task}</p>
            </div>
          
            <div className="mb-6">
              <Textarea
                value={writingResponse}
                onChange={(e) => setWritingResponse(e.target.value)}
                placeholder="Write your answer here..."
                className="min-h-[150px]"
              />
              <p className="text-sm text-gray-500 mt-2">Words: {writingResponse.trim().split(/\s+/).filter(w => w).length}</p>
              
              <Button 
                onClick={evaluateWriting} 
                disabled={!writingResponse.trim() || evaluatingWriting}
                className="mt-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
              >
                {evaluatingWriting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Get Feedback
              </Button>
            </div>
            
            {/* Model Answer */}
            <details className="cursor-pointer mb-4">
              <summary className="font-bold text-green-700">📝 Model Answer</summary>
              <div className="mt-2 p-4 bg-green-50 rounded-lg">
                <p className="text-gray-800 italic">&ldquo;{selectedLesson.writing.model_answer}&rdquo;</p>
              </div>
            </details>
          </>
        )}
        
        {/* General Training Writing Content - GLOBAL FOUNDATION LESSONS for Beginner */}
        {writingTrack === 'general' && (
          <>
            {generalLessons.length > 0 ? (
              <>
                {/* Lesson Selector */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Select a Foundation Lesson:</p>
                  <div className="flex flex-wrap gap-2">
                    {generalLessons.map((lesson, idx) => (
                      <Button
                        key={idx}
                        variant={selectedGeneralLesson?.id === lesson.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setSelectedGeneralLesson(lesson); setWritingResponse(''); setWritingFeedback(null); }}
                        className={selectedGeneralLesson?.id === lesson.id ? 'bg-purple-600' : ''}
                      >
                        {lesson.topic || lesson.title}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {selectedGeneralLesson && (
                  <>
                    {/* Lesson Content */}
                    <div className="bg-purple-50 rounded-xl p-5 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-purple-600 text-white">FOUNDATION</Badge>
                        <span className="text-xs text-purple-600 font-semibold">GENERAL TRAINING - {selectedGeneralLesson.topic}</span>
                      </div>
                      
                      {/* Learning Goals */}
                      {selectedGeneralLesson.learning_goals && (
                        <div className="mb-4 p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-2">🎯 Learning Goals:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedGeneralLesson.learning_goals.map((goal, i) => (
                              <li key={i}>• {goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Key Concepts */}
                      {selectedGeneralLesson.writing?.key_concepts && (
                        <div className="mb-4 p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-blue-700 mb-2">📚 Key Concepts:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedGeneralLesson.writing.key_concepts.map((concept, i) => (
                              <li key={i}>• {concept}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Formal Phrases (if available) */}
                      {selectedGeneralLesson.writing?.formal_phrases && (
                        <details className="mb-4 cursor-pointer">
                          <summary className="font-bold text-blue-700 flex items-center gap-2">
                            🧩 Useful Phrases
                          </summary>
                          <div className="mt-2 p-3 bg-white rounded-lg space-y-3">
                            {selectedGeneralLesson.writing.formal_phrases.opening_reason && (
                              <div>
                                <p className="text-xs font-semibold text-blue-600 mb-1">Opening (Reason for writing):</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {selectedGeneralLesson.writing.formal_phrases.opening_reason.map((phrase, i) => (
                                    <li key={i} className="italic">• {phrase}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedGeneralLesson.writing.formal_phrases.requests && (
                              <div>
                                <p className="text-xs font-semibold text-green-600 mb-1">Making Requests:</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {selectedGeneralLesson.writing.formal_phrases.requests.map((phrase, i) => (
                                    <li key={i} className="italic">• {phrase}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedGeneralLesson.writing.formal_phrases.closing && (
                              <div>
                                <p className="text-xs font-semibold text-purple-600 mb-1">Closing:</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {selectedGeneralLesson.writing.formal_phrases.closing.map((phrase, i) => (
                                    <li key={i} className="italic">• {phrase}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                      
                      {/* Informal Phrases (if available) */}
                      {selectedGeneralLesson.writing?.informal_phrases && (
                        <details className="mb-4 cursor-pointer">
                          <summary className="font-bold text-pink-700 flex items-center gap-2">
                            💬 Informal Phrases
                          </summary>
                          <div className="mt-2 p-3 bg-white rounded-lg space-y-3">
                            {selectedGeneralLesson.writing.informal_phrases.opening && (
                              <div>
                                <p className="text-xs font-semibold text-pink-600 mb-1">Opening:</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {selectedGeneralLesson.writing.informal_phrases.opening.map((phrase, i) => (
                                    <li key={i} className="italic">• {phrase}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedGeneralLesson.writing.informal_phrases.news && (
                              <div>
                                <p className="text-xs font-semibold text-pink-600 mb-1">Sharing News:</p>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {selectedGeneralLesson.writing.informal_phrases.news.map((phrase, i) => (
                                    <li key={i} className="italic">• {phrase}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                      
                      {/* Common Mistakes */}
                      {selectedGeneralLesson.common_mistakes && (
                        <details className="cursor-pointer">
                          <summary className="font-bold text-red-700 flex items-center gap-2">
                            ⚠️ Common Mistakes
                          </summary>
                          <div className="mt-2 p-3 bg-white rounded-lg space-y-2">
                            {selectedGeneralLesson.common_mistakes.map((mistake, i) => (
                              <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                                <p className="text-red-600 line-through">{mistake.wrong}</p>
                                <p className="text-green-600 font-medium">✓ {mistake.correct}</p>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                    
                    {/* Writing Practice Task */}
                    <div className="bg-orange-50 rounded-xl p-5 mb-6">
                      <p className="text-xs text-orange-600 font-semibold mb-2">PRACTICE TASK</p>
                      <p className="text-gray-900">{selectedGeneralLesson.writing?.example_task || selectedGeneralLesson.writing?.title}</p>
                    </div>
                    
                    <div className="mb-6">
                      <Textarea 
                        value={writingResponse} 
                        onChange={(e) => setWritingResponse(e.target.value)} 
                        placeholder="Write your letter here (aim for 150+ words)..." 
                        className="min-h-[150px]" 
                      />
                      <p className="text-sm text-gray-500 mt-2">Words: {writingResponse.trim().split(/\s+/).filter(w => w).length}</p>
                      <Button 
                        onClick={evaluateWriting} 
                        disabled={!writingResponse.trim() || evaluatingWriting} 
                        className="mt-4 bg-gradient-to-r from-purple-500 to-pink-600"
                      >
                        {evaluatingWriting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Get Feedback
                      </Button>
                    </div>
                    
                    {/* Model Answers */}
                    {selectedGeneralLesson.writing?.model_answer && (
                      <div className="space-y-3 mb-4">
                        <details className="cursor-pointer">
                          <summary className="font-bold text-amber-700">📝 Model Answer (Band 6)</summary>
                          <div className="mt-2 p-4 bg-amber-50 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-line font-mono text-sm">
                              {selectedGeneralLesson.writing.model_answer.band_6}
                            </p>
                          </div>
                        </details>
                        
                        <details className="cursor-pointer">
                          <summary className="font-bold text-green-700">🏆 Model Answer (Band 8)</summary>
                          <div className="mt-2 p-4 bg-green-50 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-line font-mono text-sm">
                              {selectedGeneralLesson.writing.model_answer.band_8}
                            </p>
                          </div>
                        </details>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Loading General Training lessons...</p>
              </div>
            )}
          </>
        )}
      
      {/* Feedback */}
      {writingFeedback && (
        <div className={`p-4 rounded-xl ${writingFeedback.score >= 70 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {writingFeedback.score >= 70 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Star className="w-5 h-5 text-yellow-600" />
            )}
            <span className="font-bold">Score: {writingFeedback.score}%</span>
          </div>
          <p className="text-gray-700">{writingFeedback.feedback}</p>
          {writingFeedback.grammar_tips && writingFeedback.grammar_tips.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Grammar Tips:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                {writingFeedback.grammar_tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('speaking')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Speaking
        </Button>
        <Button onClick={() => setCurrentSection('quiz')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          Next: Quiz <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
    );
  };

  // Render Quiz Section
  const renderQuiz = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-cyan-600" />
        Lesson Quiz
      </h3>
      
      {!quizSubmitted ? (
        <>
          {/* Reading Questions */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-700">Reading Comprehension</h4>
            {selectedLesson.reading.questions.map((q, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900 mb-2">{idx + 1}. {q.question}</p>
                <Input
                  value={quizAnswers[`reading_${idx}`] || ''}
                  onChange={(e) => handleQuizAnswer(`reading_${idx}`, e.target.value)}
                  placeholder="Type your answer..."
                />
              </div>
            ))}
          </div>
          
          {/* Grammar Question */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Grammar Check</h4>
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="font-medium text-gray-900 mb-3">Which sentence is correct?</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="grammar"
                    value="wrong"
                    checked={quizAnswers['grammar'] === 'wrong'}
                    onChange={() => handleQuizAnswer('grammar', 'wrong')}
                  />
                  <span className="text-gray-700">{selectedLesson.common_mistake.wrong}</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="grammar"
                    value="correct"
                    checked={quizAnswers['grammar'] === 'correct'}
                    onChange={() => handleQuizAnswer('grammar', 'correct')}
                  />
                  <span className="text-gray-700">{selectedLesson.common_mistake.correct}</span>
                </label>
              </div>
            </div>
          </div>
          
          <Button onClick={submitQuiz} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            {getText('submitQuiz')}
          </Button>
        </>
      ) : (
        <div className="text-center py-8">
          {quizScore >= 90 ? (
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
          ) : quizScore >= 70 ? (
            <div className="text-6xl mb-4">⭐</div>
          ) : quizScore >= 50 ? (
            <div className="text-6xl mb-4">💪</div>
          ) : (
            <div className="text-6xl mb-4">📚</div>
          )}
          <h4 className="text-2xl font-bold text-gray-900 mb-2">
            {quizScore >= 90 ? getText('wow') : 
             quizScore >= 70 ? getText('superJob') : 
             quizScore >= 50 ? getText('goodTry') : getText('niceEffort')}
          </h4>
          <p className="text-4xl font-bold text-cyan-600 mb-4">{quizScore}%</p>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {quizScore >= 90 ? `🎉 ${getText('wowMsg')}` : 
             quizScore >= 70 ? `🌟 ${getText('superJobMsg')}` : 
             quizScore >= 50 ? `👍 ${getText('goodTryMsg')}` : 
             `💡 ${getText('niceEffortMsg')}`}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }} className="gap-2">
              🔄 {getText('tryAgain')}
            </Button>
            <Button 
              onClick={() => { setView('lessons'); setSelectedLesson(null); }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white gap-2"
            >
              🏠 {getText('backToLessons')}
            </Button>
          </div>
        </div>
      )}
      
      {!quizSubmitted && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setCurrentSection('writing')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Writing
          </Button>
        </div>
      )}
    </Card>
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
