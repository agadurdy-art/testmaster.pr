import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  BookOpen, Volume2, Mic, Square, ChevronLeft, ChevronRight, 
  CheckCircle, XCircle, ArrowLeft, Loader2, GraduationCap,
  MessageSquare, PenTool, AlertCircle, Trophy, Star, Home,
  Languages, FileText, HelpCircle, Lightbulb, Award, Target
} from 'lucide-react';
import { toast } from 'sonner';
import SideBySideReader from '../components/test/SideBySideReader';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Module icons and colors
const MODULE_CONFIG = {
  'Education': { icon: '🎓', color: 'from-purple-500 to-violet-600' },
  'Health': { icon: '💪', color: 'from-green-500 to-emerald-600' },
  'Technology': { icon: '💻', color: 'from-blue-500 to-cyan-600' },
  'The Environment': { icon: '🌿', color: 'from-emerald-500 to-teal-600' },
  'Work and Employment': { icon: '💼', color: 'from-amber-500 to-orange-600' },
  'Family and Society': { icon: '👨‍👩‍👧', color: 'from-pink-500 to-rose-600' },
  'Travel and Tourism': { icon: '✈️', color: 'from-sky-500 to-blue-600' },
  'Money and Finance': { icon: '💰', color: 'from-yellow-500 to-amber-600' },
  'Culture and Tradition': { icon: '🎭', color: 'from-indigo-500 to-purple-600' },
  'Media and Advertising': { icon: '📺', color: 'from-red-500 to-pink-600' },
  'Food and Nutrition': { icon: '🍎', color: 'from-orange-500 to-red-600' },
  'Housing and Urbanization': { icon: '🏠', color: 'from-slate-500 to-gray-600' },
  'Transportation': { icon: '🚌', color: 'from-cyan-500 to-blue-600' },
  'Crime and Law': { icon: '⚖️', color: 'from-gray-600 to-slate-700' },
  'Science and Research': { icon: '🔬', color: 'from-violet-500 to-purple-600' },
  'Hobbies and Leisure': { icon: '🎨', color: 'from-rose-500 to-pink-600' },
  'Sports and Competition': { icon: '🏆', color: 'from-yellow-500 to-orange-600' }
};

export default function MasteryCourse({ user }) {
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
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Writing states
  const [writingResponse, setWritingResponse] = useState('');
  const [writingFeedback, setWritingFeedback] = useState(null);
  const [evaluatingWriting, setEvaluatingWriting] = useState(false);
  
  // Listening states
  const [showTranscript, setShowTranscript] = useState(false);
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [showListeningResults, setShowListeningResults] = useState(false);

  useEffect(() => {
    fetchModules();
    
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

  const selectModule = (module) => {
    setSelectedModule(module);
    setView('module-detail');
    setCurrentSection('vocabulary');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setSpeakingResponse('');
    setSpeakingFeedback(null);
    setWritingResponse('');
    setWritingFeedback(null);
  };

  // Text-to-Speech
  const playPronunciation = async (text) => {
    setPlayingAudio(text);
    try {
      const response = await fetch(`${API_URL}/api/vocab-grammar/tts`, {
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
      const formData = new FormData();
      formData.append('file', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));
      const response = await fetch(`${API_URL}/api/speaking/transcribe`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Transcription failed');
      const data = await response.json();
      setSpeakingResponse(data.text || '');
      toast.success('Speech transcribed!');
    } catch (error) {
      toast.error('Failed to transcribe');
    }
  };

  // Evaluate speaking
  const evaluateSpeaking = async (question, modelAnswer) => {
    if (!speakingResponse.trim()) {
      toast.error('Please record or type your answer first');
      return;
    }
    setEvaluatingSpeaking(true);
    try {
      const response = await fetch(`${API_URL}/api/mastery-course/evaluate-speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, model_answer: modelAnswer, user_response: speakingResponse, module_title: selectedModule.title })
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
      const response = await fetch(`${API_URL}/api/mastery-course/evaluate-writing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: selectedModule.writing.question,
          model_essay: selectedModule.writing.model_essay,
          user_response: writingResponse,
          module_title: selectedModule.title
        })
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
  };

  // Render modules list
  const renderModulesList = () => (
    <div className="max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className={`mb-4 ${textSecondary}`}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>
      
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Award className="w-10 h-10 text-white" />
        </div>
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>IELTS Mastery Blueprint</h1>
        <p className={textSecondary}>Band 4.5-6.5 Full Course • 17 Comprehensive Modules</p>
        <p className={`text-sm ${textSecondary} mt-2 max-w-2xl mx-auto`}>
          Master vocabulary, grammar, reading, speaking, and writing skills across all core IELTS topics.
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-500" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => {
            const config = MODULE_CONFIG[module.title] || { icon: '📚', color: 'from-gray-500 to-gray-600' };
            return (
              <Card 
                key={module.id}
                className={`p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border shadow-md ${bgCard}`}
                onClick={() => selectModule(module)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-medium text-violet-600 ${isDark ? 'bg-violet-900/30' : 'bg-violet-50'} px-2 py-0.5 rounded-full`}>
                      Module {module.module_number}
                    </span>
                    <h3 className={`font-bold ${textPrimary} mt-1`}>{module.title}</h3>
                    <p className={`text-xs ${textSecondary} mt-1 line-clamp-2`}>
                      {module.learning_goals?.[0]}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${textSecondary} flex-shrink-0`} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render module detail
  const renderModuleDetail = () => {
    if (!selectedModule) return null;
    const config = MODULE_CONFIG[selectedModule.title] || { icon: '📚', color: 'from-gray-500 to-gray-600' };
    
    const sections = [
      { id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' },
      { id: 'grammar', icon: Languages, label: 'Grammar' },
      { id: 'listening', icon: Volume2, label: 'Listening' },
      { id: 'reading', icon: FileText, label: 'Reading' },
      { id: 'speaking', icon: Mic, label: 'Speaking' },
      { id: 'writing', icon: PenTool, label: 'Writing' },
      { id: 'quiz', icon: HelpCircle, label: 'Quiz' }
    ];

    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => { setView('modules'); setSelectedModule(null); }} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Modules
        </Button>
        
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl shadow-lg`}>
              {config.icon}
            </div>
            <div>
              <span className="text-sm text-violet-600 font-medium">Module {selectedModule.module_number}</span>
              <h2 className="text-2xl font-bold text-gray-900">{selectedModule.title}</h2>
            </div>
          </div>
          
          {/* Learning Goals */}
          <div className="mb-4 p-4 bg-violet-50 rounded-xl">
            <h4 className="font-bold text-violet-800 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Learning Goals
            </h4>
            <ul className="text-sm text-violet-700 space-y-1">
              {selectedModule.learning_goals?.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={currentSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentSection(section.id)}
                className={currentSection === section.id ? 'bg-gradient-to-r from-violet-500 to-purple-600' : ''}
              >
                <section.icon className="w-4 h-4 mr-1" />
                {section.label}
              </Button>
            ))}
          </div>
        </Card>
        
        {renderSectionContent()}
      </div>
    );
  };

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
  const renderVocabulary = () => {
    const vocab = selectedModule.vocabulary;
    const categories = ['nouns', 'verbs', 'adjectives', 'adverbs'];
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-violet-600" /> Vocabulary
        </h3>
        
        {categories.map(cat => vocab[cat] && (
          <div key={cat} className="mb-6">
            <h4 className="font-bold text-gray-700 capitalize mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span> {cat}
            </h4>
            <div className="grid gap-3">
              {vocab[cat].map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{item.word}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => playPronunciation(item.word)} disabled={playingAudio === item.word}>
                        {playingAudio === item.word ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{item.meaning}</p>
                    <p className="text-sm text-gray-500 italic mt-1">&ldquo;{item.example}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Collocations & Idiom */}
        {selectedModule.collocations && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-bold text-blue-800 mb-3">📚 Collocations</h4>
            {selectedModule.collocations.map((col, idx) => (
              <div key={idx} className="mb-3 last:mb-0">
                <p className="font-medium text-blue-900">{col.phrase}</p>
                <p className="text-sm text-blue-700">{col.meaning}</p>
                <p className="text-sm text-blue-600 italic">&ldquo;{col.example}&rdquo;</p>
              </div>
            ))}
          </div>
        )}
        
        {selectedModule.idiom && (
          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-bold text-amber-800 mb-2">💡 IELTS Idiom</h4>
            <p className="font-medium text-amber-900">{selectedModule.idiom.phrase}</p>
            <p className="text-sm text-amber-700">{selectedModule.idiom.meaning}</p>
            <p className="text-sm text-amber-600 italic">&ldquo;{selectedModule.idiom.example}&rdquo;</p>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setCurrentSection('grammar')} className="bg-gradient-to-r from-violet-500 to-purple-600">
            Next: Grammar <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
  };

  // Grammar Section
  const renderGrammar = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Languages className="w-5 h-5 text-purple-600" /> {selectedModule.grammar?.title}
      </h3>
      
      {/* Visual Grammar Structure */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
        {/* Mind Map Style Visualization */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
            {selectedModule.grammar?.title || 'Grammar Point'}
          </div>
          <div className="w-1 h-8 bg-purple-300"></div>
          <div className="flex flex-wrap justify-center gap-4 relative">
            <div className="absolute top-0 left-1/2 w-3/4 h-0.5 bg-purple-300 -translate-x-1/2"></div>
            {/* Structure branches */}
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-purple-200 text-center min-w-[120px] mt-4">
              <p className="text-purple-600 font-bold text-sm">📐 Form</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.form || 'Subject + Verb + Object'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-blue-200 text-center min-w-[120px] mt-4">
              <p className="text-blue-600 font-bold text-sm">🎯 Use</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.use || 'Express actions/states'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-green-200 text-center min-w-[120px] mt-4">
              <p className="text-green-600 font-bold text-sm">⏰ Time</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.time_reference || 'Past / Present / Future'}</p>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 text-center">{selectedModule.grammar?.explanation}</p>
        
        {selectedModule.grammar?.benefit && (
          <div className="flex items-center justify-center gap-2 text-sm text-purple-700 bg-purple-100 p-3 rounded-lg mb-4">
            <Lightbulb className="w-4 h-4" />
            <span><strong>IELTS Tip:</strong> {selectedModule.grammar.benefit}</span>
          </div>
        )}
        
        {/* Examples with Visual Flow */}
        <div className="space-y-3 mt-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" /> Examples
          </h4>
          {selectedModule.grammar?.examples?.map((ex, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                <p className="text-purple-700 font-medium">{ex}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Band Level Comparison - Same idea at different levels */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-3 text-center">📊 Same Idea - Different Band Levels</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-400">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                📝 Band 5.5-6.0 Example
              </h4>
              <p className="text-gray-600 text-xs mb-2">Simple structure, basic vocabulary:</p>
              <p className="text-gray-700 italic text-sm bg-white p-2 rounded">
                {selectedModule.grammar?.band_55_example || 
                 '"Many people think education is very important. It helps people get good jobs."'}
              </p>
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                ⚠️ Correct but simple - short sentences, basic words
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                ⭐ Band 7.0+ Example
              </h4>
              <p className="text-gray-600 text-xs mb-2">Same idea with complex structure:</p>
              <p className="text-gray-700 italic text-sm bg-white p-2 rounded">
                {selectedModule.grammar?.band_70_example || 
                 '"It is widely acknowledged that education plays a pivotal role in society, as it not only equips individuals with essential skills but also enhances their employment prospects."'}
              </p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                ✓ Complex sentence + advanced vocabulary + linking
              </p>
            </div>
          </div>
          <p className="text-xs text-center text-gray-500 mt-3">💡 Notice: Same concept expressed differently - Band 7+ uses complex structures and academic vocabulary</p>
        </div>
      </div>
      
      {/* Signal Words Visual */}
      {selectedModule.grammar?.signal_words && (
        <div className="bg-blue-50 rounded-xl p-5 mb-4">
          <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
            🔑 Signal Words & Phrases
          </h4>
          <div className="flex flex-wrap gap-2">
            {(selectedModule.grammar.signal_words || '').split(',').map((word, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                {word.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Common Mistake with Visual Comparison */}
      {selectedModule.common_mistake && (
        <div className="bg-red-50 rounded-xl p-5 mb-4">
          <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Common Mistake
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-100 p-4 rounded-lg border-2 border-red-300">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-bold text-red-700">❌ Incorrect</span>
              </div>
              <p className="text-red-700 line-through">{selectedModule.common_mistake.wrong}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-bold text-green-700">✓ Correct</span>
              </div>
              <p className="text-green-700 font-medium">{selectedModule.common_mistake.correct}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3 bg-white p-3 rounded-lg">
            💡 <strong>Remember:</strong> {selectedModule.common_mistake.explanation}
          </p>
        </div>
      )}
      
      {selectedModule.tip && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-amber-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            <span><strong>Pro Tip:</strong> {selectedModule.tip}</span>
          </p>
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('vocabulary')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Vocabulary
        </Button>
        <Button onClick={() => setCurrentSection('listening')} className="bg-gradient-to-r from-violet-500 to-purple-600">
          Next: Listening <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Listening Section
  const renderListening = () => {
    const listening = selectedModule?.listening;
    const moduleNum = selectedModule?.module_number || 1;
    const hasAudio = moduleNum >= 1 && moduleNum <= 17;
    const audioPath = `/audio/mastery_course/module_${moduleNum}_listening.mp3`;
    
    const [showTranscript, setShowTranscript] = useState(false);
    const [listeningAnswers, setListeningAnswers] = useState({});
    const [showListeningResults, setShowListeningResults] = useState(false);
    
    const handleListeningAnswer = (qIdx, answer) => {
      setListeningAnswers(prev => ({ ...prev, [qIdx]: answer }));
    };
    
    const checkListeningAnswers = () => {
      setShowListeningResults(true);
      const questions = listening?.comprehension_questions || [];
      let correct = 0;
      questions.forEach((q, idx) => {
        const userAns = (listeningAnswers[idx] || '').toLowerCase().trim();
        const correctAns = (q.answer || '').toLowerCase().trim();
        if (q.type === 'true_false_ng') {
          if (userAns === correctAns) correct++;
        } else if (userAns && (correctAns.includes(userAns) || userAns.includes(correctAns.split('/')[0].trim()))) {
          correct++;
        }
      });
      toast.success(`Listening Quiz: ${correct}/${questions.length} correct!`);
    };
    
    if (!listening) {
      return (
        <Card className="p-6 bg-white border-0 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-600" /> Listening Practice
          </h3>
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Volume2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Listening content coming soon for this module!</p>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
            </Button>
            <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-violet-500 to-purple-600">
              Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      );
    }
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-cyan-600" /> {listening.title || 'Listening Practice'}
        </h3>
        
        {/* Audio Player */}
        {hasAudio ? (
          <div className="mb-6 p-5 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Module {moduleNum} Listening</p>
                <p className="text-sm text-gray-600">Band 4.5-6.5 Level</p>
              </div>
            </div>
            <audio controls className="w-full" preload="metadata">
              <source src={audioPath} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-xs text-gray-500 mt-2">💡 Tip: Listen at least twice before answering questions</p>
          </div>
        ) : (
          <div className="mb-6 p-5 bg-gray-100 rounded-xl text-center">
            <Volume2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Audio coming soon!</p>
          </div>
        )}
        
        {/* Transcript Toggle */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className="mb-3"
          >
            {showTranscript ? '🔒 Hide Transcript' : '📜 Show Transcript'}
          </Button>
          {showTranscript && listening.audio_script && (
            <div className="p-4 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {listening.audio_script}
              </p>
            </div>
          )}
        </div>
        
        {/* Comprehension Questions */}
        {listening.comprehension_questions && listening.comprehension_questions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-600" /> Comprehension Questions
            </h4>
            <div className="space-y-4">
              {listening.comprehension_questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">
                    {idx + 1}. {q.question}
                    {q.type === 'true_false_ng' && <span className="text-xs text-gray-500 ml-2">(T/F/NG)</span>}
                  </p>
                  {q.type === 'true_false_ng' ? (
                    <div className="flex gap-3 flex-wrap">
                      {['True', 'False', 'Not Given'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`listening_q_${idx}`}
                            value={opt}
                            checked={listeningAnswers[idx] === opt}
                            onChange={() => handleListeningAnswer(idx, opt)}
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <Input
                      placeholder="Type your answer..."
                      value={listeningAnswers[idx] || ''}
                      onChange={(e) => handleListeningAnswer(idx, e.target.value)}
                      className="text-sm"
                    />
                  )}
                  {showListeningResults && (
                    <div className={`mt-2 p-2 rounded text-sm ${
                      (listeningAnswers[idx] || '').toLowerCase().trim() === q.answer.toLowerCase().trim() ||
                      q.answer.toLowerCase().includes((listeningAnswers[idx] || '').toLowerCase().trim())
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <strong>Answer:</strong> {q.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={checkListeningAnswers}
              className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              Check Answers
            </Button>
          </div>
        )}
        
        {/* Vocabulary Focus */}
        {listening.vocab_focus && listening.vocab_focus.length > 0 && (
          <div className="mb-6 p-4 bg-purple-50 rounded-xl">
            <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Key Vocabulary from Audio
            </h4>
            <div className="flex flex-wrap gap-2">
              {listening.vocab_focus.map((word, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 transition-colors"
                  onClick={() => playPronunciation(word)}
                >
                  {word}
                  <Volume2 className="w-3 h-3 inline ml-1" />
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Listening Tips */}
        {listening.listening_tips && listening.listening_tips.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> IELTS Listening Tips
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              {listening.listening_tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
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
          <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-violet-500 to-purple-600">
            Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
  };

  // Reading Section
  const renderReading = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> {selectedModule.reading?.title}
        </h3>
        <Button variant="outline" size="sm" onClick={() => playPronunciation(selectedModule.reading.passage || selectedModule.reading.text)} disabled={playingAudio === (selectedModule.reading.passage || selectedModule.reading.text)}>
          {playingAudio === (selectedModule.reading.passage || selectedModule.reading.text) ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
          Listen
        </Button>
      </div>
      
      <SideBySideReader
        passage={selectedModule.reading?.passage || selectedModule.reading?.text || ''}
        passageTitle="Reading Passage"
        defaultRatio={65}
      >
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
                      <input type="radio" name={`q_${idx}`} value={opt} onChange={() => handleQuizAnswer(`q_${idx}`, opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : q.type === 'true_false_ng' ? (
                <div className="flex gap-3 flex-wrap">
                  {['True', 'False', 'Not Given'].map(opt => (
                    <label key={opt} className="flex items-center gap-1 text-xs">
                      <input type="radio" name={`q_${idx}`} value={opt} onChange={() => handleQuizAnswer(`q_${idx}`, opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <Input placeholder="Your answer..." className="text-sm h-8" onChange={(e) => handleQuizAnswer(`q_${idx}`, e.target.value)} />
              )}
              <details className="mt-2 cursor-pointer">
                <summary className="text-xs text-green-600">Show Answer</summary>
                <p className="mt-1 text-xs text-gray-700 bg-green-50 p-2 rounded">{q.answer}</p>
              </details>
            </div>
          ))}
        </div>
      </SideBySideReader>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('listening')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Listening
        </Button>
        <Button onClick={() => setCurrentSection('speaking')} className="bg-gradient-to-r from-violet-500 to-purple-600">
          Next: Speaking <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // Speaking Section
  const renderSpeaking = () => {
    const speaking = selectedModule.speaking;
    const currentQ = speaking?.part1 || speaking?.part2 || speaking?.part3;
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5 text-violet-600" /> Speaking Practice
        </h3>
        
        {speaking?.part1 && speaking.part1.question && (
          <div className="mb-6 p-4 bg-violet-50 rounded-xl">
            <h4 className="font-bold text-violet-800 mb-2">Part 1</h4>
            <p className="text-lg text-gray-900 mb-2">{speaking.part1.question}</p>
            {speaking.part1.model_answer && (
              <details className="cursor-pointer">
                <summary className="text-sm text-violet-600 font-medium">View Model Answer</summary>
                <p className="mt-2 text-gray-700 bg-white p-3 rounded-lg italic text-sm">&ldquo;{speaking.part1.model_answer}&rdquo;</p>
              </details>
            )}
          </div>
        )}
        
        {speaking?.part2 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-bold text-blue-800 mb-2">Part 2 (Cue Card)</h4>
            <div className="bg-white p-4 rounded-lg border border-blue-200 mb-3 whitespace-pre-line">
              {speaking.part2.cue_card}
            </div>
            {speaking.part2.tips && speaking.part2.tips.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-blue-700 mb-1">💡 Tips:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {speaking.part2.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {speaking.part2.model_answer && (
              <details className="cursor-pointer">
                <summary className="text-sm text-blue-600 font-medium">View Model Answer</summary>
                <p className="mt-2 text-gray-700 bg-white p-3 rounded-lg italic text-sm">&ldquo;{speaking.part2.model_answer}&rdquo;</p>
              </details>
            )}
            {speaking.part2.follow_up_questions && speaking.part2.follow_up_questions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm font-medium text-blue-700 mb-2">Follow-up Questions:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {speaking.part2.follow_up_questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {speaking?.part3 && (
          <div className="mb-6 p-4 bg-green-50 rounded-xl">
            <h4 className="font-bold text-green-800 mb-2">Part 3 (Discussion)</h4>
            {/* Check if part3 has questions array */}
            {speaking.part3.questions && speaking.part3.questions.length > 0 ? (
              <div className="space-y-4">
                {speaking.part3.questions.map((q, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="font-medium text-gray-900 mb-2">Q{idx + 1}: {q.question}</p>
                    {q.model_answer && (
                      <details className="cursor-pointer">
                        <summary className="text-sm text-green-600 font-medium">View Model Answer</summary>
                        <p className="mt-2 text-gray-700 bg-green-50 p-3 rounded-lg italic text-sm">&ldquo;{q.model_answer}&rdquo;</p>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback for old format with single question/model_answer */
              <>
                <p className="text-lg text-gray-900 mb-2">{speaking.part3.question}</p>
                {speaking.part3.model_answer && (
                  <details className="cursor-pointer">
                    <summary className="text-sm text-green-600">Model Answer</summary>
                    <p className="mt-2 text-gray-700 bg-white p-3 rounded-lg italic">&ldquo;{speaking.part3.model_answer}&rdquo;</p>
                  </details>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Recording */}
        <div className="p-4 bg-gray-50 rounded-xl mb-4">
          <p className="text-sm text-gray-600 mb-3">Practice your answer:</p>
          <div className="flex gap-3 mb-3">
            {!recording ? (
              <Button onClick={startRecording} className="bg-violet-600 hover:bg-violet-700">
                <Mic className="w-4 h-4 mr-2" /> Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} className="bg-red-500 hover:bg-red-600">
                <Square className="w-4 h-4 mr-2" /> Stop
              </Button>
            )}
          </div>
          <Textarea value={speakingResponse} onChange={(e) => setSpeakingResponse(e.target.value)} placeholder="Or type your answer..." className="min-h-[100px]" />
          <Button onClick={() => evaluateSpeaking(currentQ?.question || currentQ?.cue_card, currentQ?.model_answer)} disabled={!speakingResponse.trim() || evaluatingSpeaking} className="mt-3 bg-gradient-to-r from-violet-500 to-purple-600">
            {evaluatingSpeaking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Get Feedback
          </Button>
        </div>
        
        {speakingFeedback && (
          <div className={`p-5 rounded-xl ${speakingFeedback.band_score >= 6 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-6 h-6 text-amber-600" />
              <span className="font-bold text-xl">Band {speakingFeedback.band_score}</span>
            </div>
            
            {/* Criteria Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {speakingFeedback.fluency && (
                <div className="p-2 bg-white rounded-lg text-center">
                  <p className="text-xs text-gray-500">Fluency</p>
                  <p className="font-bold">{typeof speakingFeedback.fluency === 'object' ? speakingFeedback.fluency.score : speakingFeedback.fluency}</p>
                </div>
              )}
              {speakingFeedback.vocabulary && (
                <div className="p-2 bg-white rounded-lg text-center">
                  <p className="text-xs text-gray-500">Vocabulary</p>
                  <p className="font-bold">{typeof speakingFeedback.vocabulary === 'object' ? speakingFeedback.vocabulary.score : speakingFeedback.vocabulary}</p>
                </div>
              )}
              {speakingFeedback.grammar && (
                <div className="p-2 bg-white rounded-lg text-center">
                  <p className="text-xs text-gray-500">Grammar</p>
                  <p className="font-bold">{typeof speakingFeedback.grammar === 'object' ? speakingFeedback.grammar.score : speakingFeedback.grammar}</p>
                </div>
              )}
              {speakingFeedback.pronunciation && (
                <div className="p-2 bg-white rounded-lg text-center">
                  <p className="text-xs text-gray-500">Pronunciation</p>
                  <p className="font-bold">{typeof speakingFeedback.pronunciation === 'object' ? speakingFeedback.pronunciation.score : speakingFeedback.pronunciation}</p>
                </div>
              )}
            </div>
            
            <p className="text-gray-700 mb-4">{speakingFeedback.overall_feedback || speakingFeedback.feedback}</p>
            
            {/* Mistakes with Corrections */}
            {speakingFeedback.mistakes && speakingFeedback.mistakes.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Mistakes to Correct
                </h5>
                {speakingFeedback.mistakes.map((mistake, idx) => (
                  <div key={idx} className="mb-2 text-sm">
                    <p className="text-red-600 line-through">{mistake.original}</p>
                    <p className="text-green-600 font-medium">✓ {mistake.corrected}</p>
                    <p className="text-gray-600 text-xs italic">{mistake.explanation}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Vocabulary to Use */}
            {speakingFeedback.vocabulary_to_use && speakingFeedback.vocabulary_to_use.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-700 mb-2">📚 Vocabulary from Lesson to Use</h5>
                <div className="flex flex-wrap gap-2">
                  {speakingFeedback.vocabulary_to_use.map((word, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{word}</span>
                  ))}
                </div>
              </div>
            )}
            
            {speakingFeedback.improvement_tip && (
              <div className="p-3 bg-yellow-50 rounded-lg mb-3">
                <p className="text-sm text-yellow-800">💡 <strong>Tip:</strong> {speakingFeedback.improvement_tip}</p>
              </div>
            )}
            
            {speakingFeedback.lesson_reference && (
              <p className="text-sm text-purple-600 mt-2">📖 <strong>Review:</strong> {speakingFeedback.lesson_reference}</p>
            )}
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('reading')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Reading
          </Button>
          <Button onClick={() => setCurrentSection('writing')} className="bg-gradient-to-r from-violet-500 to-purple-600">
            Next: Writing <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
  };

  // Writing Section
  const renderWriting = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-orange-600" /> Writing Task 2
      </h3>
      
      <div className="bg-orange-50 rounded-xl p-5 mb-6">
        <p className="text-lg text-gray-900 font-medium">{selectedModule.writing?.question}</p>
      </div>
      
      <div className="mb-6">
        <Textarea value={writingResponse} onChange={(e) => setWritingResponse(e.target.value)} placeholder="Write your essay here (aim for 250+ words)..." className="min-h-[200px]" />
        <p className="text-sm text-gray-500 mt-2">Words: {writingResponse.trim().split(/\s+/).filter(w => w).length}</p>
        <Button onClick={evaluateWriting} disabled={!writingResponse.trim() || evaluatingWriting} className="mt-4 bg-gradient-to-r from-orange-500 to-amber-600">
          {evaluatingWriting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Get Feedback
        </Button>
      </div>
      
      <details className="cursor-pointer mb-4">
        <summary className="font-bold text-green-700">📝 Model Essay (Band 6)</summary>
        <div className="mt-2 p-4 bg-green-50 rounded-lg">
          <p className="text-gray-700 whitespace-pre-line">{selectedModule.writing?.model_essay}</p>
          {selectedModule.writing?.notes && <p className="text-sm text-green-600 mt-2 italic">{selectedModule.writing.notes}</p>}
        </div>
      </details>
      
      {writingFeedback && (
        <div className={`p-5 rounded-xl ${writingFeedback.band_score >= 6 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-6 h-6 text-orange-600" />
            <span className="font-bold text-xl">Band {writingFeedback.band_score}</span>
          </div>
          
          {/* Criteria Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {writingFeedback.task_achievement && (
              <div className="p-2 bg-white rounded-lg text-center">
                <p className="text-xs text-gray-500">Task</p>
                <p className="font-bold">{typeof writingFeedback.task_achievement === 'object' ? writingFeedback.task_achievement.score : writingFeedback.task_achievement}</p>
              </div>
            )}
            {writingFeedback.coherence && (
              <div className="p-2 bg-white rounded-lg text-center">
                <p className="text-xs text-gray-500">Coherence</p>
                <p className="font-bold">{typeof writingFeedback.coherence === 'object' ? writingFeedback.coherence.score : writingFeedback.coherence}</p>
              </div>
            )}
            {writingFeedback.lexical && (
              <div className="p-2 bg-white rounded-lg text-center">
                <p className="text-xs text-gray-500">Lexical</p>
                <p className="font-bold">{typeof writingFeedback.lexical === 'object' ? writingFeedback.lexical.score : writingFeedback.lexical}</p>
              </div>
            )}
            {writingFeedback.grammar && (
              <div className="p-2 bg-white rounded-lg text-center">
                <p className="text-xs text-gray-500">Grammar</p>
                <p className="font-bold">{typeof writingFeedback.grammar === 'object' ? writingFeedback.grammar.score : writingFeedback.grammar}</p>
              </div>
            )}
          </div>
          
          <p className="text-gray-700 mb-4">{writingFeedback.overall_feedback || writingFeedback.feedback}</p>
          
          {/* Good Points */}
          {writingFeedback.good_points && writingFeedback.good_points.length > 0 && (
            <div className="mb-4 p-3 bg-green-100 rounded-lg">
              <h5 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> What You Did Well
              </h5>
              <ul className="text-sm text-green-800 space-y-1">
                {writingFeedback.good_points.map((point, idx) => (
                  <li key={idx}>✓ {point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Mistakes with Corrections */}
          {writingFeedback.mistakes && writingFeedback.mistakes.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <h5 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Mistakes to Correct
              </h5>
              {writingFeedback.mistakes.map((mistake, idx) => (
                <div key={idx} className="mb-3 p-2 bg-white rounded">
                  <p className="text-red-600 line-through text-sm">{mistake.original}</p>
                  <p className="text-green-600 font-medium text-sm">✓ {mistake.corrected}</p>
                  <p className="text-gray-600 text-xs italic mt-1">
                    <span className="bg-gray-100 px-1 rounded">{mistake.type}</span> - {mistake.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {/* Vocabulary Suggestions */}
          {writingFeedback.vocabulary_suggestions && writingFeedback.vocabulary_suggestions.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-700 mb-2">📚 Upgrade Your Vocabulary</h5>
              {writingFeedback.vocabulary_suggestions.map((sug, idx) => (
                <div key={idx} className="mb-2 text-sm">
                  <span className="text-gray-500">{sug.basic}</span> → <span className="text-blue-600 font-medium">{sug.advanced}</span>
                  <p className="text-xs text-gray-600 italic">"{sug.example}"</p>
                </div>
              ))}
            </div>
          )}
          
          {writingFeedback.structure_tip && (
            <div className="p-3 bg-yellow-50 rounded-lg mb-3">
              <p className="text-sm text-yellow-800">📝 <strong>Structure Tip:</strong> {writingFeedback.structure_tip}</p>
            </div>
          )}
          
          {writingFeedback.lesson_reference && (
            <p className="text-sm text-purple-600 mb-2">📖 <strong>Review:</strong> {writingFeedback.lesson_reference}</p>
          )}
          
          {/* Next Steps */}
          {writingFeedback.next_steps && writingFeedback.next_steps.length > 0 && (
            <div className="p-3 bg-indigo-50 rounded-lg mt-3">
              <h5 className="font-semibold text-indigo-700 mb-2">🎯 Next Steps</h5>
              <ol className="text-sm text-indigo-800 space-y-1 list-decimal list-inside">
                {writingFeedback.next_steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('speaking')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Speaking
        </Button>
        <Button onClick={() => setCurrentSection('quiz')} className="bg-gradient-to-r from-violet-500 to-purple-600">
          Next: Quiz <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Quiz Section
  const renderQuiz = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-cyan-600" /> Module Quiz
      </h3>
      
      {!quizSubmitted ? (
        <>
          <div className="space-y-4 mb-6">
            {(selectedModule.quiz?.questions || []).map((q, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900 mb-2">{idx + 1}. {q.question}</p>
                {q.options ? (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name={`quiz_${idx}`} value={opt} checked={quizAnswers[`q_${idx}`] === opt} onChange={() => handleQuizAnswer(`q_${idx}`, opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : q.type === 'true_false_ng' ? (
                  <div className="flex gap-4">
                    {['True', 'False', 'Not Given'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer">
                        <input type="radio" name={`quiz_${idx}`} value={opt} checked={quizAnswers[`q_${idx}`] === opt} onChange={() => handleQuizAnswer(`q_${idx}`, opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <Input placeholder="Your answer..." value={quizAnswers[`q_${idx}`] || ''} onChange={(e) => handleQuizAnswer(`q_${idx}`, e.target.value)} />
                )}
              </div>
            ))}
          </div>
          <Button onClick={submitQuiz} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">Submit Quiz</Button>
        </>
      ) : (
        <div className="py-6">
          <div className="text-center mb-6">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${quizScore >= 70 ? 'text-yellow-500' : 'text-gray-400'}`} />
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h4>
            <p className="text-4xl font-bold text-cyan-600 mb-2">{quizScore}%</p>
            <p className="text-gray-600">{quizScore >= 90 ? '🌟 Outstanding!' : quizScore >= 70 ? '🎉 Great job!' : quizScore >= 50 ? '👍 Good effort!' : '📚 Keep studying!'}</p>
          </div>
          
          {/* Detailed Results */}
          <div className="space-y-3 mb-6">
            <h5 className="font-semibold text-gray-900">📋 Detailed Results:</h5>
            {(selectedModule.quiz?.questions || []).map((q, idx) => {
              const userAnswer = quizAnswers[`q_${idx}`];
              const correctAnswer = q.correct || q.answer;
              const isAnswered = userAnswer && userAnswer.trim() !== '';
              const isCorrect = isAnswered && (
                userAnswer?.toLowerCase()?.includes(correctAnswer?.toLowerCase()) || 
                userAnswer?.toLowerCase() === correctAnswer?.toLowerCase() ||
                correctAnswer?.toLowerCase()?.includes(userAnswer?.toLowerCase()?.replace(/^[a-d]\)\s*/i, ''))
              );
              
              // Determine color: unanswered=gray, correct=green, incorrect=red
              const bgColor = !isAnswered ? 'bg-gray-100 border-gray-300' : isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
              
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
                    <div>
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
          
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>Try Again</Button>
            <Button onClick={() => { setView('modules'); setSelectedModule(null); }} className="bg-gradient-to-r from-violet-500 to-purple-600">
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

  return (
    <div className={`min-h-screen ${bgMain} pb-24 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'modules' && renderModulesList()}
        {view === 'module-detail' && renderModuleDetail()}
      </div>
    </div>
  );
}
