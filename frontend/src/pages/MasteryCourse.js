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

  useEffect(() => {
    fetchModules();
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
    let correct = 0;
    let total = selectedModule.reading.questions.length;
    
    selectedModule.reading.questions.forEach((q, idx) => {
      const userAns = (quizAnswers[`q_${idx}`] || '').toLowerCase().trim();
      const correctAns = q.answer.toLowerCase().trim();
      if (q.type === 'true_false_ng') {
        if (userAns === correctAns.toLowerCase()) correct++;
      } else if (q.type === 'multiple_choice') {
        if (userAns === correctAns.toLowerCase()) correct++;
      } else {
        if (correctAns.includes(userAns) || userAns.includes(correctAns.split('/')[0].trim())) correct++;
      }
    });
    
    setQuizScore(Math.round((correct / total) * 100));
    setQuizSubmitted(true);
    toast.success(`Quiz completed! Score: ${Math.round((correct / total) * 100)}%`);
  };

  // Render modules list
  const renderModulesList = () => (
    <div className="max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>
      
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Award className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">IELTS Mastery Blueprint</h1>
        <p className="text-gray-600">Band 4.5-6.5 Full Course • 17 Comprehensive Modules</p>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
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
                className="p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md bg-white"
                onClick={() => selectModule(module)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                      Module {module.module_number}
                    </span>
                    <h3 className="font-bold text-gray-900 mt-1">{module.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {module.learning_goals?.[0]}
                    </p>
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

  // Render module detail
  const renderModuleDetail = () => {
    if (!selectedModule) return null;
    const config = MODULE_CONFIG[selectedModule.title] || { icon: '📚', color: 'from-gray-500 to-gray-600' };
    
    const sections = [
      { id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' },
      { id: 'grammar', icon: Languages, label: 'Grammar' },
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
      
      <div className="bg-purple-50 rounded-xl p-5 mb-6">
        <p className="text-gray-700 mb-3">{selectedModule.grammar?.explanation}</p>
        {selectedModule.grammar?.benefit && (
          <p className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg mb-3">
            <strong>Why it helps:</strong> {selectedModule.grammar.benefit}
          </p>
        )}
        <div className="space-y-2">
          {selectedModule.grammar?.examples?.map((ex, idx) => (
            <div key={idx} className="bg-white p-3 rounded-lg border-l-4 border-purple-500">
              <p className="text-purple-700">{ex}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Common Mistake */}
      {selectedModule.common_mistake && (
        <div className="bg-red-50 rounded-xl p-5 mb-4">
          <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Common Mistake
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 line-through">{selectedModule.common_mistake.wrong}</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700 font-medium">{selectedModule.common_mistake.correct}</p>
            </div>
            <p className="text-sm text-gray-600 mt-2">{selectedModule.common_mistake.explanation}</p>
          </div>
        </div>
      )}
      
      {selectedModule.tip && (
        <div className="p-4 bg-amber-50 rounded-xl">
          <p className="text-amber-800"><strong>💡 Tip:</strong> {selectedModule.tip}</p>
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('vocabulary')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Vocabulary
        </Button>
        <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-violet-500 to-purple-600">
          Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

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
        <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
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
        
        {speaking?.part1 && (
          <div className="mb-6 p-4 bg-violet-50 rounded-xl">
            <h4 className="font-bold text-violet-800 mb-2">Part 1</h4>
            <p className="text-lg text-gray-900 mb-2">{speaking.part1.question}</p>
            <details className="cursor-pointer">
              <summary className="text-sm text-violet-600">Model Answer</summary>
              <p className="mt-2 text-gray-700 bg-white p-3 rounded-lg italic">&ldquo;{speaking.part1.model_answer}&rdquo;</p>
            </details>
          </div>
        )}
        
        {speaking?.part2 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-bold text-blue-800 mb-2">Part 2 (Cue Card)</h4>
            <p className="text-lg text-gray-900 mb-2">{speaking.part2.cue_card}</p>
            <details className="cursor-pointer">
              <summary className="text-sm text-blue-600">Model Answer</summary>
              <p className="mt-2 text-gray-700 bg-white p-3 rounded-lg italic">&ldquo;{speaking.part2.model_answer}&rdquo;</p>
            </details>
          </div>
        )}
        
        {speaking?.part3 && (
          <div className="mb-6 p-4 bg-green-50 rounded-xl">
            <h4 className="font-bold text-green-800 mb-2">Part 3</h4>
            <p className="text-lg text-gray-900 mb-2">{speaking.part3.question}</p>
            <details className="cursor-pointer">
              <summary className="text-sm text-green-600">Model Answer</summary>
              <p className="mt-2 text-gray-700 bg-white p-3 rounded-lg italic">&ldquo;{speaking.part3.model_answer}&rdquo;</p>
            </details>
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
          <div className={`p-4 rounded-xl ${speakingFeedback.band_score >= 6 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-lg">Band {speakingFeedback.band_score}</span>
            </div>
            <p className="text-gray-700 mb-2">{speakingFeedback.feedback}</p>
            {speakingFeedback.improvement_tip && <p className="text-sm text-gray-600">💡 {speakingFeedback.improvement_tip}</p>}
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
        <div className={`p-4 rounded-xl ${writingFeedback.band_score >= 6 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-lg">Band {writingFeedback.band_score}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            {writingFeedback.task_achievement && <div className="p-2 bg-white rounded">Task: {writingFeedback.task_achievement}</div>}
            {writingFeedback.coherence && <div className="p-2 bg-white rounded">Coherence: {writingFeedback.coherence}</div>}
            {writingFeedback.lexical && <div className="p-2 bg-white rounded">Lexical: {writingFeedback.lexical}</div>}
            {writingFeedback.grammar && <div className="p-2 bg-white rounded">Grammar: {writingFeedback.grammar}</div>}
          </div>
          <p className="text-gray-700">{writingFeedback.feedback}</p>
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
            {selectedModule.reading?.questions?.map((q, idx) => (
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
        <div className="text-center py-8">
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${quizScore >= 70 ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h4 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h4>
          <p className="text-4xl font-bold text-cyan-600 mb-4">{quizScore}%</p>
          <p className="text-gray-600 mb-6">{quizScore >= 70 ? '🎉 Excellent work!' : 'Keep practicing to improve.'}</p>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'modules' && renderModulesList()}
        {view === 'module-detail' && renderModuleDetail()}
      </div>
    </div>
  );
}
