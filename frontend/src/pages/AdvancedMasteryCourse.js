import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  BookOpen, ChevronLeft, ChevronRight, Home, Trophy, Star, Mic, 
  PenTool, HelpCircle, GraduationCap, Target, Sparkles, Volume2,
  Brain, Award, TrendingUp, CheckCircle, XCircle, Lightbulb, Zap, AlertCircle,
  Headphones, Play, Pause, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import SideBySideReader from '../components/test/SideBySideReader';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdvancedMasteryCourse({ user }) {
  const navigate = useNavigate();
  
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
  const [strategicReading, setStrategicReading] = useState(null); // Module-Specific Strategic Reading
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
    try {
      const res = await fetch(`${API_URL}/api/advanced-mastery/modules/${module.id}`);
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
      const titleToStrategicModule = {
        'digital frontier': 'digital_frontier',
        'digital': 'digital_frontier',
        'technology': 'digital_frontier',
        'green imperative': 'green_imperative',
        'environment': 'green_imperative',
        'ecological': 'environment_ecological',
        'educational paradigm': 'educational_paradigm',
        'education': 'educational_paradigm',
        'pedagogical': 'education_philosophy',
        'globalisation': 'globalisation_cultural',
        'globalization': 'globalisation_cultural',
        'cultural identity': 'globalisation_cultural',
        'homogenisation': 'globalisation_homogenisation',
        'health': 'health_public_policy',
        'public policy': 'health_public_policy',
        'medical resource': 'public_health_allocation',
        'crime': 'crime_justice',
        'justice': 'crime_justice',
        'penal': 'crime_justice',
        'reintegration': 'crime_reintegration',
        'media': 'media_integrity',
        'information': 'media_integrity',
        'journalism': 'media_journalism',
        'economy': 'economy_wealth',
        'wealth': 'economy_wealth',
        'government': 'economy_wealth',
        'urbanisation': 'urbanisation',
        'urbanization': 'urbanisation',
        'modern society': 'urbanisation',
        'science': 'science_bioethics',
        'bioethics': 'science_bioethics',
        'biomedical': 'science_bioethics',
        'transport': 'public_transport',
        'sustainable infrastructure': 'public_transport',
        'work': 'work_employment',
        'employment': 'work_employment',
        'labor': 'work_employment',
        'labour': 'work_employment',
        'social': 'social_demographics',
        'demographics': 'social_demographics',
        'generational': 'social_demographics',
        'tourism': 'tourism_heritage',
        'heritage': 'tourism_heritage',
        'mobility': 'tourism_heritage',
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
      
      // Fetch strategic reading content for Advanced
      try {
        const strategicReadingResponse = await fetch(`${API_URL}/api/courses/advanced-strategic-reading/${strategicModuleId}`);
        if (strategicReadingResponse.ok) {
          const strategicReadingData = await strategicReadingResponse.json();
          if (strategicReadingData.success) {
            setStrategicReading(strategicReadingData.strategic_reading);
          }
        }
      } catch (e) {
        console.error('Error fetching strategic reading:', e);
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
      
      const res = await fetch(`${API_URL}/api/advanced-mastery/evaluate-speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          model_answer: modelAnswer,
          user_response: speakingResponse,
          module_title: selectedModule.title,
          part: speaking?.part3 ? 'part3' : 'part2'
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
      const writing = selectedModule.writing;
      const res = await fetch(`${API_URL}/api/advanced-mastery/evaluate-writing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: writing?.prompt || '',
          model_essay: writing?.band75_excerpt || '',
          user_response: writingResponse,
          module_title: selectedModule.title,
          examiner_analysis: writing?.examiner_analysis
        })
      });
      if (res.ok) {
        const feedback = await res.json();
        setWritingFeedback(feedback);
        toast.success('Essay evaluated!');
      }
    } catch (e) {
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
  };

  // Render modules list
  const renderModulesList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced IELTS Mastery</h1>
            <p className="text-gray-500">Band 6.0-9.0 • Cambridge-Aligned</p>
          </div>
        </div>
      </div>

      {/* Course Description */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-0 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Master Band 7-9 Skills</h2>
            <p className="text-gray-600 text-sm">
              This comprehensive curriculum is designed for learners at Band 6.0-6.5 targeting Band 7.0-9.0. 
              Master sophisticated vocabulary, complex grammar structures, and examiner-level execution across all IELTS themes.
            </p>
          </div>
        </div>
      </Card>

      {/* Modules Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((module) => (
          <Card 
            key={module.id}
            className="p-5 bg-white border-0 shadow-lg hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 rounded-2xl"
            onClick={() => selectModule(module)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                {module.module_number}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{module.title}</h3>
                <p className="text-xs text-gray-500 truncate">{module.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <Zap className="w-3 h-3" />
              <span>Band 7-9 Focus</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render section tabs
  const renderSectionTabs = () => {
    const sections = [
      { id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' },
      { id: 'grammar', icon: Brain, label: 'Grammar' },
      { id: 'listening', icon: Headphones, label: 'Listening' },
      { id: 'reading', icon: Target, label: 'Reading' },
      { id: 'speaking', icon: Mic, label: 'Speaking' },
      { id: 'writing', icon: PenTool, label: 'Writing' },
      { id: 'quiz', icon: HelpCircle, label: 'Quiz' }
    ];

    return (
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {sections.map(s => (
          <Button
            key={s.id}
            variant={currentSection === s.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentSection(s.id)}
            className={currentSection === s.id ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-0' : ''}
          >
            <s.icon className="w-4 h-4 mr-2" />
            {s.label}
          </Button>
        ))}
      </div>
    );
  };

  // Render vocabulary section - Updated to handle nouns/verbs/adjectives/adverbs structure
  const renderVocabulary = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-amber-600" /> Advanced Vocabulary
      </h3>
      
      {/* Learning Goals */}
      {selectedModule.learning_goals && (
        <div className="mb-6 p-4 bg-amber-50 rounded-xl">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> Learning Goals
          </h4>
          <ul className="space-y-1">
            {selectedModule.learning_goals.map((goal, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                {goal}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vocabulary by Category */}
      {['nouns', 'verbs', 'adjectives', 'adverbs'].map(category => (
        selectedModule.vocabulary?.[category]?.length > 0 && (
          <div key={category} className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 capitalize flex items-center gap-2">
              {category === 'nouns' && '📚'}
              {category === 'verbs' && '⚡'}
              {category === 'adjectives' && '🎨'}
              {category === 'adverbs' && '💫'}
              {category}
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              {selectedModule.vocabulary[category].map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border-l-4 border-amber-500">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-bold text-gray-900">{item.word}</h5>
                    <Button variant="ghost" size="sm" onClick={() => speakText(item.word)}>
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{item.meaning}</p>
                  <div className="p-2 bg-white rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-800 italic">&ldquo;{item.example}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {/* Advanced Terms (if exists) */}
      {selectedModule.vocabulary?.advanced_terms?.map((term, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-xl border-l-4 border-amber-500 mb-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-900">{term.term}</h4>
              <p className="text-sm text-gray-500 italic">{term.usage}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => speakText(term.term)}>
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-700 mb-2">{term.meaning}</p>
          <div className="p-3 bg-white rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800 italic">&ldquo;{term.example}&rdquo;</p>
          </div>
        </div>
      ))}

      {/* Synonym Groups for Paraphrasing */}
      {selectedModule.vocabulary?.synonym_groups && selectedModule.vocabulary.synonym_groups.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Synonym Groups for Paraphrasing
          </h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedModule.vocabulary.synonym_groups.map((group, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-700 mb-1">{group.base}:</p>
                <p className="text-sm text-gray-600">{group.synonyms.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examiner Tips */}
      {selectedModule.examiner_tips && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Examiner Tips for Band 7+
          </h4>
          <ul className="space-y-2">
            {selectedModule.examiner_tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* IDIOMS SECTION */}
      {selectedModule.vocabulary?.idioms?.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
          <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
            💬 Idioms for Band 7+
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {selectedModule.vocabulary.idioms.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-indigo-200">
                <div className="flex items-start justify-between">
                  <h5 className="font-bold text-indigo-700">{item.idiom}</h5>
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">{item.usage_context}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.meaning}</p>
                <p className="text-xs text-indigo-600 italic mt-2">&ldquo;{item.example}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COLLOCATIONS SECTION */}
      {selectedModule.vocabulary?.collocations?.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            🔗 Collocations
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {selectedModule.vocabulary.collocations.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-bold text-green-700">{item.collocation}</h5>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">{item.type}</span>
                </div>
                <p className="text-xs text-gray-600 italic">&ldquo;{item.example}&rdquo;</p>
                {item.alternatives && (
                  <p className="text-xs text-green-600 mt-2">Also: {item.alternatives.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHRASAL VERBS SECTION */}
      {selectedModule.vocabulary?.phrasal_verbs?.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
          <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            ⚡ Phrasal Verbs
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {selectedModule.vocabulary.phrasal_verbs.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-orange-200">
                <h5 className="font-bold text-orange-700">{item.phrasal_verb}</h5>
                <p className="text-sm text-gray-600 mt-1">{item.meaning}</p>
                <p className="text-xs text-orange-600 italic mt-2">&ldquo;{item.example}&rdquo;</p>
                <p className="text-xs text-gray-500 mt-1">📝 Formal: {item.formal_alternative}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRONUNCIATION GUIDE */}
      {selectedModule.vocabulary?.pronunciation_guide?.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
          <h4 className="font-semibold text-pink-800 mb-3 flex items-center gap-2">
            🎯 Pronunciation Guide
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {selectedModule.vocabulary.pronunciation_guide.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-pink-200">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-pink-700">{item.word}</h5>
                  <Button variant="ghost" size="sm" onClick={() => speakText(item.word)} className="h-6 w-6 p-0">
                    <Volume2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs font-mono text-gray-600">{item.ipa}</p>
                <p className="text-xs text-pink-600 mt-1">{item.stress}</p>
                <p className="text-xs text-gray-500 mt-1">⚠️ {item.common_mistake}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORD FORMATION */}
      {selectedModule.vocabulary?.word_formation?.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl">
          <h4 className="font-semibold text-cyan-800 mb-3 flex items-center gap-2">
            🔄 Word Formation
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="px-3 py-2 text-left text-cyan-800">Root</th>
                  <th className="px-3 py-2 text-left text-cyan-800">Noun</th>
                  <th className="px-3 py-2 text-left text-cyan-800">Verb</th>
                  <th className="px-3 py-2 text-left text-cyan-800">Adjective</th>
                  <th className="px-3 py-2 text-left text-cyan-800">Adverb</th>
                </tr>
              </thead>
              <tbody>
                {selectedModule.vocabulary.word_formation.map((item, idx) => (
                  <tr key={idx} className="border-b border-cyan-100">
                    <td className="px-3 py-2 font-semibold text-cyan-700">{item.root}</td>
                    <td className="px-3 py-2 text-gray-600">{item.noun}</td>
                    <td className="px-3 py-2 text-gray-600">{item.verb}</td>
                    <td className="px-3 py-2 text-gray-600">{item.adjective}</td>
                    <td className="px-3 py-2 text-gray-600">{item.adverb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={() => setCurrentSection('grammar')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Grammar <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render grammar section
  const renderGrammar = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600" /> {selectedModule.grammar?.title}
      </h3>
      
      {/* Visual Grammar Structure - Mastery Style */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
        {/* Mind Map Style Visualization */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
            {selectedModule.grammar?.title || 'Advanced Grammar'}
          </div>
          <div className="w-1 h-8 bg-purple-300"></div>
          <div className="flex flex-wrap justify-center gap-4 relative">
            <div className="absolute top-0 left-1/2 w-3/4 h-0.5 bg-purple-300 -translate-x-1/2"></div>
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-purple-200 text-center min-w-[120px] mt-4">
              <p className="text-purple-600 font-bold text-sm">📐 Form</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.form || 'Complex structures'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-blue-200 text-center min-w-[120px] mt-4">
              <p className="text-blue-600 font-bold text-sm">🎯 Use</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.use || 'Band 7+ writing/speaking'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-green-200 text-center min-w-[120px] mt-4">
              <p className="text-green-600 font-bold text-sm">⭐ Effect</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.effect || 'Sophistication'}</p>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-gray-700 mb-4 text-center">{selectedModule.grammar?.explanation}</p>

        {selectedModule.grammar?.benefit && (
          <div className="flex items-center justify-center gap-2 text-sm text-purple-700 bg-purple-100 p-3 rounded-lg mb-4">
            <Lightbulb className="w-4 h-4" />
            <span><strong>IELTS Band 7+ Tip:</strong> {selectedModule.grammar.benefit}</span>
          </div>
        )}

        {/* Examples with Visual Flow */}
        {selectedModule.grammar?.examples && selectedModule.grammar.examples.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" /> Advanced Examples
            </h4>
            {selectedModule.grammar.examples.map((ex, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                  <p className="text-purple-700 font-medium">{ex}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Band Level Comparison - Same idea at different levels */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-3 text-center">📊 Same Idea - Different Band Levels</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-400">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                📝 Band 6.5 Example
              </h4>
              <p className="text-gray-600 text-xs mb-2">Simple structure, basic vocabulary:</p>
              <p className="text-gray-700 italic text-sm bg-white p-2 rounded">
                {selectedModule.grammar?.band_65_example || 
                 '"Technology is very important for education today. Many students use computers to study."'}
              </p>
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                ⚠️ Correct but repetitive - lacks complexity
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                ⭐ Band 8.0+ Example
              </h4>
              <p className="text-gray-600 text-xs mb-2">Same idea with sophisticated structure:</p>
              <p className="text-gray-700 italic text-sm bg-white p-2 rounded">
                {selectedModule.grammar?.band_80_example || 
                 '"The integration of technology into educational settings has fundamentally transformed how students engage with learning materials, enabling unprecedented access to information."'}
              </p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                ✓ Complex sentence structure + advanced vocabulary
              </p>
            </div>
          </div>
          <p className="text-xs text-center text-gray-500 mt-3">💡 Notice: Same concept expressed differently - Band 8+ uses complex structures and precise vocabulary</p>
        </div>
      </div>

      {/* Why it works explanation */}
      {selectedModule.grammar?.why_it_works && (
        <div className="p-4 bg-amber-50 rounded-xl mb-4">
          <h4 className="font-semibold text-amber-800 mb-2">💡 Why This Works</h4>
          <p className="text-gray-700">{selectedModule.grammar.why_it_works}</p>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('vocabulary')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Vocabulary
        </Button>
        <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render reading section
  const renderReading = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" /> {selectedModule.reading?.title}
        </h3>
        <span className="text-sm text-gray-500">
          ~{selectedModule.reading?.passage?.split(' ').length || 0} words
        </span>
      </div>

      {/* Reading passage with Side-by-Side */}
      <SideBySideReader
        passage={selectedModule.reading?.passage || selectedModule.reading?.text || ''}
        passageTitle="Academic Reading Passage"
        defaultRatio={70}
      >
        {/* Practice Questions */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 text-sm">Comprehension Questions</h4>
          {selectedModule.reading?.questions?.map((q, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 mb-2 text-sm">
                {idx + 1}. {q.question}
                {q.type === 'true_false_ng' && <span className="text-xs text-gray-500 ml-2">(T/F/NG)</span>}
                {q.type === 'multiple_choice' && <span className="text-xs text-gray-500 ml-2">(MC)</span>}
              </p>
              {q.options ? (
                <div className="space-y-1">
                  {q.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-xs text-gray-700">
                      <input type="radio" name={`reading_q_${idx}`} value={opt} />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : q.type === 'true_false_ng' ? (
                <div className="flex gap-3 flex-wrap">
                  {['True', 'False', 'Not Given'].map(opt => (
                    <label key={opt} className="flex items-center gap-1 text-xs">
                      <input type="radio" name={`reading_q_${idx}`} value={opt} />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <input type="text" placeholder="Your answer..." className="w-full p-2 border rounded text-sm" />
              )}
              <details className="mt-2">
                <summary className="text-xs text-blue-600 cursor-pointer">Show Answer</summary>
                <div className="mt-1 p-2 bg-green-50 rounded text-xs">
                  <p className="text-green-700 font-medium">✓ {q.answer || q.correct}</p>
                  {q.explanation && <p className="text-gray-600 mt-1">{q.explanation}</p>}
                </div>
              </details>
            </div>
          ))}
        </div>
      </SideBySideReader>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
        </Button>
        <Button onClick={() => setCurrentSection('speaking')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Speaking <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // Render speaking section
  const renderSpeaking = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5 text-emerald-600" /> Speaking Practice
      </h3>

      <div className="space-y-6">
        {/* Part 2 Cue Card */}
        {selectedModule.speaking?.part2 && (
          <div className="p-4 bg-emerald-50 rounded-xl">
            <h4 className="font-semibold text-emerald-800 mb-2">Part 2: Cue Card</h4>
            <div className="bg-white p-4 rounded-lg border border-emerald-200 mb-3">
              <p className="text-gray-700 whitespace-pre-line">{selectedModule.speaking.part2.cue_card}</p>
            </div>
            {selectedModule.speaking.part2.tips && selectedModule.speaking.part2.tips.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-emerald-700 mb-1">💡 Tips:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedModule.speaking.part2.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-500 mt-1 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedModule.speaking.part2.model_answer && (
              <details className="text-sm">
                <summary className="text-emerald-600 cursor-pointer font-medium hover:underline">View Model Answer</summary>
                <div className="mt-2 p-3 bg-white rounded-lg text-gray-600 border border-emerald-100">
                  <p>{selectedModule.speaking.part2.model_answer}</p>
                </div>
              </details>
            )}
          </div>
        )}

        {/* Part 3 Discussion Questions */}
        {selectedModule.speaking?.part3?.questions && selectedModule.speaking.part3.questions.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-3">Part 3: Discussion Questions</h4>
            <div className="space-y-4">
              {selectedModule.speaking.part3.questions.map((q, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="font-medium text-gray-900 mb-2">Q{idx + 1}: {q.question}</p>
                  {q.model_answer && (
                    <details className="text-sm">
                      <summary className="text-blue-600 cursor-pointer font-medium hover:underline">View Model Answer</summary>
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg text-gray-600">
                        <p>{q.model_answer}</p>
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legacy Part 3 format support */}
        {selectedModule.speaking?.part3 && !selectedModule.speaking.part3.questions && selectedModule.speaking.part3.question && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">Part 3: Abstract Discussion</h4>
            <p className="text-gray-700 mb-3">{selectedModule.speaking.part3.question}</p>
            {selectedModule.speaking.part3.band8_sample && (
              <details className="text-sm">
                <summary className="text-blue-600 cursor-pointer font-medium">View Band 8 Sample</summary>
                <p className="mt-2 p-3 bg-white rounded-lg text-gray-600 italic">
                  {selectedModule.speaking.part3.band8_sample}
                </p>
              </details>
            )}
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex gap-3">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}
          >
            <Mic className="w-4 h-4 mr-2" />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </div>

        {/* Response Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Response (type or speak)</label>
          <Textarea
            value={speakingResponse}
            onChange={(e) => setSpeakingResponse(e.target.value)}
            placeholder="Type your speaking response here for AI evaluation..."
            rows={5}
            className="w-full"
          />
        </div>

        <Button 
          onClick={evaluateSpeaking} 
          disabled={speakingLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
        >
          {speakingLoading ? 'Evaluating...' : 'Get AI Evaluation'}
        </Button>

        {/* Feedback Display */}
        {speakingFeedback && (
          <div className={`p-5 rounded-xl ${speakingFeedback.band_score >= 7 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-4 py-2 rounded-xl font-bold text-lg ${speakingFeedback.band_score >= 7 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                Band {speakingFeedback.band_score}
              </div>
            </div>

            {/* Criteria Scores */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {speakingFeedback.fluency_coherence && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Fluency: {speakingFeedback.fluency_coherence.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.fluency_coherence.feedback}</p>
                </div>
              )}
              {speakingFeedback.lexical_resource && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-purple-600">Vocabulary: {speakingFeedback.lexical_resource.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.lexical_resource.feedback}</p>
                </div>
              )}
              {speakingFeedback.grammatical_range && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-green-600">Grammar: {speakingFeedback.grammatical_range.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.grammatical_range.feedback}</p>
                </div>
              )}
              {speakingFeedback.pronunciation && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-amber-600">Pronunciation: {speakingFeedback.pronunciation.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.pronunciation.feedback}</p>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-3">{speakingFeedback.overall_feedback}</p>

            {speakingFeedback.suggested_improvements && (
              <div className="mt-3 p-3 bg-white rounded-lg">
                <p className="text-sm font-medium text-gray-800 mb-1">Suggestions:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {speakingFeedback.suggested_improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {speakingFeedback.model_phrase_to_learn && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-800">📝 Phrase to Learn:</p>
                <p className="text-sm text-gray-700 italic">{speakingFeedback.model_phrase_to_learn}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('reading')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Reading
        </Button>
        <Button onClick={() => setCurrentSection('writing')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Writing <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render writing section
  const renderWriting = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-orange-600" /> Advanced Writing
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
            <Target className="w-4 h-4 mr-1" /> General Training
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {writingTrack === 'academic' 
            ? '📝 Academic: Band 7-9 Advanced Essay Techniques'
            : '✉️ General: Band 7-9 Letter Writing Mastery & Nuanced Tone Control'}
        </p>
      </div>

      {/* Academic Writing Content */}
      {writingTrack === 'academic' && (
        <div className="space-y-6">
          {/* Task Prompt */}
          <div className="p-4 bg-orange-50 rounded-xl">
            <h4 className="font-semibold text-orange-800 mb-2">ACADEMIC TASK</h4>
            <p className="text-gray-700">{selectedModule.writing?.question || selectedModule.writing?.prompt}</p>
          </div>

          {/* Tips */}
          {selectedModule.writing?.tips && selectedModule.writing.tips.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-xl">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Writing Tips</h4>
              <ul className="space-y-1">
                {selectedModule.writing.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Useful Phrases */}
          {selectedModule.writing?.useful_phrases && selectedModule.writing.useful_phrases.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-2">📝 Useful Phrases</h4>
              <div className="flex flex-wrap gap-2">
                {selectedModule.writing.useful_phrases.map((phrase, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{phrase}</span>
                ))}
              </div>
            </div>
          )}

          {/* Model Essay */}
          {(selectedModule.writing?.model_essay || selectedModule.writing?.band75_excerpt) && (
            <details className="p-4 bg-gray-50 rounded-xl">
              <summary className="font-semibold text-gray-800 cursor-pointer hover:text-orange-600">View Band 7.5+ Model Essay</summary>
              <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedModule.writing?.model_essay || selectedModule.writing?.band75_excerpt}
                </p>
              </div>
            </details>
          )}

          {/* Writing Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Essay (minimum 250 words)
            </label>
            <Textarea
              value={writingResponse}
              onChange={(e) => setWritingResponse(e.target.value)}
              placeholder="Write your essay here..."
              rows={12}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Word count: {writingResponse.trim().split(/\s+/).filter(w => w).length}
            </p>
          </div>

          <Button 
            onClick={evaluateWriting} 
            disabled={writingLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600"
          >
            {writingLoading ? 'Evaluating...' : 'Get AI Evaluation'}
          </Button>
        </div>
      )}

      {/* General Training Writing Content - STRATEGIC + MODULE-SPECIFIC for Advanced */}
      {writingTrack === 'general' && (
        <div className="space-y-6">
          {strategicWriting ? (
            <>
              {/* Strategic Writing Header */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge className="bg-purple-600 text-white">ADVANCED</Badge>
                  <Badge className="bg-pink-600 text-white">STRATEGIC</Badge>
                  <span className="text-xs text-purple-600 font-semibold">{strategicWriting.module_title}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{strategicWriting.strategic_focus}</h3>
                <p className="text-sm text-gray-600 mb-4">{strategicWriting.learning_outcome}</p>
                
                {/* Strategic Elements */}
                {strategicWriting.writing_scenario?.strategic_elements && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-white rounded-lg border border-purple-100">
                      <p className="text-xs font-bold text-purple-700 mb-1">🎭 TONE</p>
                      <p className="text-sm text-gray-700">{strategicWriting.writing_scenario.strategic_elements.tone}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <p className="text-xs font-bold text-blue-700 mb-1">🎯 PURPOSE</p>
                      <p className="text-sm text-gray-700">{strategicWriting.writing_scenario.strategic_elements.purpose}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-green-100">
                      <p className="text-xs font-bold text-green-700 mb-1">💡 ARGUMENT</p>
                      <p className="text-sm text-gray-700">{strategicWriting.writing_scenario.strategic_elements.argument}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Writing Scenario & Task */}
              {strategicWriting.writing_scenario && (
                <>
                  <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-orange-600 text-white">{strategicWriting.band_target}</Badge>
                      <span className="text-sm font-semibold text-orange-700">{strategicWriting.writing_scenario.title}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 italic mb-4">{strategicWriting.writing_scenario.context}</p>
                    
                    <p className="text-gray-900 whitespace-pre-line">{strategicWriting.writing_scenario.prompt}</p>
                  </div>
                  
                  {/* Key Phrases */}
                  {strategicWriting.writing_scenario.key_phrases && (
                    <details className="cursor-pointer">
                      <summary className="font-bold text-purple-700 flex items-center gap-2">
                        🔑 Key Strategic Phrases
                      </summary>
                      <div className="mt-2 p-4 bg-white rounded-lg border border-purple-100 space-y-2">
                        {strategicWriting.writing_scenario.key_phrases.map((phrase, i) => (
                          <p key={i} className="text-sm text-gray-700 italic pl-4 border-l-2 border-purple-300">
                            &ldquo;{phrase}&rdquo;
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                  
                  {/* Writing Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Response (Band 7-9 Target, 150+ words)
                    </label>
                    <Textarea 
                      value={writingResponse} 
                      onChange={(e) => setWritingResponse(e.target.value)} 
                      placeholder="Write your strategic response here..." 
                      rows={12}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">Words: {writingResponse.trim().split(/\s+/).filter(w => w).length}</p>
                  </div>

                  <Button 
                    onClick={evaluateWriting} 
                    disabled={writingLoading} 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                  >
                    {writingLoading ? 'Evaluating...' : 'Get AI Evaluation'}
                  </Button>
                  
                  {/* Band 8 Model Answer */}
                  {strategicWriting.writing_scenario.model_answer && (
                    <div className="space-y-3">
                      <details className="cursor-pointer">
                        <summary className="font-bold text-green-700 flex items-center gap-2">
                          🏆 Band 8 Model Answer
                        </summary>
                        <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-gray-700 whitespace-pre-line font-mono text-sm">
                            {strategicWriting.writing_scenario.model_answer.band_8}
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
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Loading strategic writing content...</p>
            </div>
          )}
        </div>
      )}

      {/* Feedback Display - Shared */}
      {writingFeedback && (
        <div className={`mt-6 p-5 rounded-xl ${writingFeedback.band_score >= 7 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-4 py-2 rounded-xl font-bold text-lg ${writingFeedback.band_score >= 7 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              Band {writingFeedback.band_score}
            </div>
            <span className="text-sm text-gray-500">Track: {writingTrack === 'academic' ? 'Academic' : 'General Training'}</span>
          </div>

          {/* Criteria Scores */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {writingFeedback.task_achievement && (
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm font-medium text-blue-600">Task Achievement: {typeof writingFeedback.task_achievement === 'object' ? writingFeedback.task_achievement.score : writingFeedback.task_achievement}</p>
                {typeof writingFeedback.task_achievement === 'object' && <p className="text-xs text-gray-600">{writingFeedback.task_achievement.feedback}</p>}
              </div>
            )}
            {(writingFeedback.coherence_cohesion || writingFeedback.coherence) && (
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm font-medium text-purple-600">Coherence: {typeof (writingFeedback.coherence_cohesion || writingFeedback.coherence) === 'object' ? (writingFeedback.coherence_cohesion || writingFeedback.coherence).score : (writingFeedback.coherence_cohesion || writingFeedback.coherence)}</p>
              </div>
            )}
            {writingFeedback.lexical_resource && (
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm font-medium text-green-600">Vocabulary: {writingFeedback.lexical_resource.score}</p>
              </div>
            )}
            {writingFeedback.grammatical_range && (
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm font-medium text-amber-600">Grammar: {writingFeedback.grammatical_range.score}</p>
              </div>
            )}
          </div>

          <p className="text-gray-700 mb-3">{writingFeedback.overall_feedback}</p>

          {writingFeedback.strengths && (
            <div className="mt-3 p-3 bg-green-100 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">✅ Strengths:</p>
              <ul className="text-sm text-gray-700 list-disc list-inside">
                {writingFeedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {writingFeedback.areas_to_improve && (
            <div className="mt-3 p-3 bg-amber-100 rounded-lg">
              <p className="text-sm font-medium text-amber-800 mb-1">📈 Areas to Improve:</p>
              <ul className="text-sm text-gray-700 list-disc list-inside">
                {writingFeedback.areas_to_improve.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('speaking')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Speaking
        </Button>
        <Button onClick={() => setCurrentSection('quiz')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Quiz <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render listening section
  const renderListening = () => {
    const listening = selectedModule?.listening;
    const moduleNum = selectedModule?.module_number;
    const audioPath = `/audio/advanced_mastery/module_${moduleNum}_listening.mp3`;
    
    const handlePlayPause = () => {
      if (listeningAudioRef.current) {
        if (isPlayingListening) {
          listeningAudioRef.current.pause();
        } else {
          listeningAudioRef.current.play();
        }
        setIsPlayingListening(!isPlayingListening);
      }
    };
    
    const handleRestart = () => {
      if (listeningAudioRef.current) {
        listeningAudioRef.current.currentTime = 0;
        setListeningProgress(0);
        setIsPlayingListening(false);
      }
    };
    
    const handleTimeUpdate = () => {
      if (listeningAudioRef.current) {
        const progress = (listeningAudioRef.current.currentTime / listeningAudioRef.current.duration) * 100;
        setListeningProgress(progress || 0);
      }
    };
    
    const handleEnded = () => {
      setIsPlayingListening(false);
      setListeningProgress(100);
    };
    
    // Check if audio exists for this module (only first 5 modules have audio)
    const hasAudio = moduleNum >= 1 && moduleNum <= 20;
    
    if (!listening) {
      return (
        <Card className={`p-6 ${bgCard} border-0 shadow-lg`}>
          <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Headphones className="w-5 h-5 text-purple-600" /> Academic Listening
          </h3>
          <div className="text-center py-8">
            <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className={textSecondary}>Listening content is coming soon for this module.</p>
            {hasAudio && (
              <div className="mt-4">
                <p className={`text-sm ${textSecondary}`}>Audio file is available. Content will be added shortly.</p>
                <audio 
                  ref={listeningAudioRef}
                  src={audioPath}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  className="hidden"
                />
                <Button 
                  onClick={handlePlayPause}
                  className="mt-3 bg-purple-600 hover:bg-purple-700"
                >
                  {isPlayingListening ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlayingListening ? 'Pause' : 'Play Audio Preview'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      );
    }
    
    return (
      <Card className={`p-6 ${bgCard} border-0 shadow-lg`}>
        <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
          <Headphones className="w-5 h-5 text-purple-600" /> {listening.title || 'Academic Listening'}
        </h3>
        
        {/* Audio Player */}
        {hasAudio && (
          <div className="mb-6 p-4 bg-purple-50 rounded-xl">
            <audio 
              ref={listeningAudioRef}
              src={audioPath}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              className="hidden"
            />
            
            <div className="flex items-center gap-4 mb-3">
              <Button 
                onClick={handlePlayPause}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                size="sm"
              >
                {isPlayingListening ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isPlayingListening ? 'Pause' : 'Play'}
              </Button>
              <Button 
                onClick={handleRestart}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Restart
              </Button>
              <div className="flex-1">
                <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${listeningProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-purple-700 font-medium">
                {listening.duration || '~3 min'}
              </span>
            </div>
            
            <p className="text-sm text-purple-700">
              🎧 {listening.introduction || 'Listen to the academic lecture and answer the questions below.'}
            </p>
          </div>
        )}
        
        {!hasAudio && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Audio for this module is being generated. Read the transcript below and answer the questions.
            </p>
          </div>
        )}
        
        {/* Transcript Toggle */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowTranscript(!showTranscript)}
            className="mb-3"
          >
            {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
          </Button>
          
          {showTranscript && listening.transcript && (
            <div className={`p-4 ${bgSubtle} rounded-xl text-sm ${textSecondary} leading-relaxed max-h-64 overflow-y-auto`}>
              {listening.transcript}
            </div>
          )}
        </div>
        
        {/* Comprehension Questions */}
        {listening.questions && listening.questions.length > 0 && (
          <div className="space-y-4 mb-6">
            <h4 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
              <HelpCircle className="w-4 h-4 text-purple-600" /> Comprehension Questions
            </h4>
            {listening.questions.map((q, idx) => (
              <div key={idx} className={`p-4 ${bgSubtle} rounded-xl`}>
                <p className={`font-medium ${textPrimary} mb-2`}>
                  {q.number || idx + 1}. {q.question}
                </p>
                
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2 mb-3">
                    {q.options.map((opt, optIdx) => (
                      <label key={optIdx} className={`flex items-center gap-2 text-sm ${textSecondary} cursor-pointer`}>
                        <input type="radio" name={`listening_q_${idx}`} value={opt} className="accent-purple-600" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                
                {(q.type === 'completion' || q.type === 'fill_blank') && (
                  <div className="mb-3">
                    <input 
                      type="text" 
                      placeholder={q.word_limit ? `Max ${q.word_limit} words` : "Your answer..."}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                )}
                
                {q.type === 'true_false' && (
                  <div className="space-y-2 mb-3">
                    {['True', 'False'].map((opt) => (
                      <label key={opt} className={`flex items-center gap-2 text-sm ${textSecondary} cursor-pointer`}>
                        <input type="radio" name={`listening_q_${idx}`} value={opt} className="accent-purple-600" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                
                <details className="mt-2">
                  <summary className="text-xs text-purple-600 cursor-pointer hover:underline">Show Answer</summary>
                  <div className="mt-1 p-2 bg-green-50 rounded text-xs">
                    <p className="text-green-700 font-medium">✓ {q.answer}</p>
                    {q.explanation && <p className="text-gray-600 mt-1">{q.explanation}</p>}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
        
        {/* Vocabulary Focus */}
        {listening.vocabulary_focus && listening.vocabulary_focus.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Key Vocabulary from Lecture
            </h4>
            <div className="grid gap-2">
              {listening.vocabulary_focus.map((v, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-blue-900">{v.word}</span>
                  <span className="text-gray-600 text-sm ml-2">- {v.definition}</span>
                  {v.context && <p className="text-xs text-gray-500 mt-1 italic">{v.context}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Listening Tips */}
        {listening.listening_tips && listening.listening_tips.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Listening Tips
            </h4>
            <ul className="space-y-1">
              {listening.listening_tips.map((tip, idx) => (
                <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
          </Button>
          <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-amber-500 to-orange-600">
            Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
  };

  // Render quiz section
  const renderQuiz = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-cyan-600" /> Module Quiz
      </h3>

      {!quizSubmitted ? (
        <>
          <div className="space-y-4 mb-6">
            {(selectedModule.quiz?.questions || selectedModule.reading?.questions || []).map((q, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900 mb-2">
                  {idx + 1}. {q.question}
                </p>
                {q.type && <p className="text-xs text-gray-500 mb-2 capitalize">Type: {q.type?.replace('_', ' ')}</p>}
                
                {q.options ? (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                        <input 
                          type="radio" 
                          name={`quiz_${idx}`} 
                          value={opt}
                          checked={quizAnswers[idx] === opt}
                          onChange={() => handleQuizAnswer(idx, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : q.type === 'true_false_ng' ? (
                  <div className="flex gap-3">
                    {['True', 'False', 'Not Given'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer">
                        <input 
                          type="radio" 
                          name={`quiz_${idx}`} 
                          value={opt}
                          checked={quizAnswers[idx] === opt}
                          onChange={() => handleQuizAnswer(idx, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <Input
                    placeholder="Your answer..."
                    value={quizAnswers[idx] || ''}
                    onChange={(e) => handleQuizAnswer(idx, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <Button onClick={submitQuiz} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
            Submit Quiz
          </Button>
        </>
      ) : (
        <div className="py-6">
          <div className="text-center mb-6">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${(quizResults?.score || 0) >= 70 ? 'text-yellow-500' : 'text-gray-400'}`} />
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h4>
            <p className="text-4xl font-bold text-cyan-600 mb-2">{quizResults?.score?.toFixed(0) || 0}%</p>
            <p className="text-gray-600">{quizResults?.score >= 90 ? '🌟 Outstanding!' : quizResults?.score >= 70 ? '🎉 Great job!' : quizResults?.score >= 50 ? '👍 Good effort!' : '📚 Keep studying!'}</p>
            {quizResults?.estimated_band && <p className="text-lg text-gray-600 mt-2">Estimated Band: {quizResults.estimated_band}</p>}
          </div>
          
          {/* Detailed Results */}
          <div className="space-y-3 mb-6">
            <h5 className="font-semibold text-gray-900">📋 Detailed Results:</h5>
            {(selectedModule.quiz?.questions || selectedModule.reading?.questions || []).map((q, idx) => {
              const userAnswer = quizAnswers[idx];
              const correctAnswer = q.correct || q.answer;
              const isAnswered = userAnswer && userAnswer.trim() !== '';
              const isCorrect = isAnswered && (
                userAnswer?.toLowerCase()?.trim() === correctAnswer?.toLowerCase()?.trim() ||
                userAnswer?.toLowerCase()?.includes(correctAnswer?.toLowerCase()) ||
                correctAnswer?.toLowerCase()?.includes(userAnswer?.toLowerCase()?.replace(/^[a-d]\)\s*/i, ''))
              );
              
              // Determine color: unanswered=gray, correct=green, incorrect=red
              const bgColor = !isAnswered ? 'bg-gray-100 border-gray-300' : isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
              const iconColor = !isAnswered ? 'text-gray-400' : isCorrect ? 'text-green-600' : 'text-red-600';
              
              return (
                <div key={idx} className={`p-4 rounded-lg border ${bgColor}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {!isAnswered ? (
                      <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    ) : isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{idx + 1}. {q.question}</p>
                      {!isAnswered && (
                        <>
                          <p className="text-gray-500 text-sm mt-1 italic">⚠️ Not answered (skipped)</p>
                          <p className="text-green-600 text-sm font-medium">Correct answer: {correctAnswer}</p>
                        </>
                      )}
                      {isAnswered && !isCorrect && (
                        <>
                          <p className="text-red-600 text-sm mt-1">Your answer: {userAnswer}</p>
                          <p className="text-green-600 text-sm font-medium">Correct: {correctAnswer}</p>
                        </>
                      )}
                      {isAnswered && isCorrect && <p className="text-green-600 text-sm mt-1">✓ Correct!</p>}
                      {q.explanation && (
                        <div className="mt-2 p-2 bg-white rounded text-sm">
                          <p className="text-gray-600"><strong>💡 Explanation:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Skill Breakdown */}
          {quizResults?.skill_breakdown && Object.keys(quizResults.skill_breakdown).length > 0 && (
            <div className="my-6 p-4 bg-gray-50 rounded-xl">
              <h5 className="font-semibold text-gray-800 mb-3">📊 Performance by Question Type</h5>
              <div className="space-y-2">
                {Object.entries(quizResults.skill_breakdown).map(([type, data]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-700 capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                      (data.correct / data.total) >= 0.7 ? 'bg-green-100 text-green-700' :
                      (data.correct / data.total) >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {data.correct}/{data.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Results breakdown */}
          <div className="text-left space-y-3 mb-6 mt-6">
            <h5 className="font-semibold text-gray-800 mb-3">📝 Detailed Results</h5>
            {quizResults?.results?.map((r, i) => (
              <div key={i} className={`p-3 rounded-lg ${r.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-start gap-2">
                  {r.is_correct ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                  <div>
                    <p className="font-medium text-gray-800">{r.question}</p>
                    <p className="text-sm text-gray-600">Your answer: {r.user_answer || '(empty)'}</p>
                    {!r.is_correct && <p className="text-sm text-green-600">Correct: {r.correct_answer}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); setQuizResults(null); }}>
              Try Again
            </Button>
            <Button onClick={() => { setView('modules'); setSelectedModule(null); }} className="bg-gradient-to-r from-amber-500 to-orange-600">
              <Home className="w-4 h-4 mr-2" /> Back to Modules
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

  // Render module detail view
  const renderModuleDetail = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => { setView('modules'); setSelectedModule(null); }} className="p-2">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {selectedModule.module_number}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{selectedModule.title}</h1>
          <p className="text-gray-500 text-sm">{selectedModule.subtitle}</p>
        </div>
      </div>

      {/* Section Tabs */}
      {renderSectionTabs()}

      {/* Section Content */}
      {currentSection === 'vocabulary' && renderVocabulary()}
      {currentSection === 'grammar' && renderGrammar()}
      {currentSection === 'listening' && renderListening()}
      {currentSection === 'reading' && renderReading()}
      {currentSection === 'speaking' && renderSpeaking()}
      {currentSection === 'writing' && renderWriting()}
      {currentSection === 'quiz' && renderQuiz()}
    </div>
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
    </div>
  );
}
