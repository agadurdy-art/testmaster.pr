import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  BookOpen, Volume2, Mic, Square, ChevronLeft, ChevronRight, 
  CheckCircle, XCircle, ArrowLeft, Loader2, GraduationCap,
  MessageSquare, PenTool, AlertCircle, Trophy, Star, Home,
  Languages, FileText, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

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
  
  // States
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('lessons'); // lessons, lesson-detail, section
  const [currentSection, setCurrentSection] = useState('vocabulary'); // vocabulary, grammar, reading, speaking, writing, quiz
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

  // Fetch lessons on mount
  useEffect(() => {
    fetchLessons();
  }, []);

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
      
      const response = await fetch(`${API_URL}/api/speaking/transcribe`, {
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
  };

  // Render lessons list
  const renderLessonsList = () => (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>
      
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Beginner English Course</h1>
        <p className="text-gray-600">For Band 4.5 and below • 14 Essential Lessons</p>
        <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
          This course is for students who want to start learning for the IELTS exam. 
          The language is simple and easy to understand.
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-500" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {lessons.map((lesson) => {
            const config = TOPIC_CONFIG[lesson.topic] || { icon: '📖', color: 'from-gray-500 to-gray-600', lightBg: 'bg-gray-50' };
            return (
              <Card 
                key={lesson.id}
                className={`p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md ${config.lightBg}`}
                onClick={() => selectLesson(lesson)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 bg-white/80 px-2 py-0.5 rounded-full">
                        Lesson {lesson.lesson_number}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{lesson.topic}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{lesson.learning_goals}</p>
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
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={currentSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentSection(section.id)}
                className={currentSection === section.id ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : ''}
              >
                <section.icon className="w-4 h-4 mr-1" />
                {section.label}
              </Button>
            ))}
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
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-green-600" />
        Vocabulary
      </h3>
      
      <div className="space-y-4">
        {selectedLesson.vocabulary.map((item, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-bold text-gray-900">{item.word}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => playPronunciation(item.word)}
                disabled={playingAudio === item.word}
              >
                {playingAudio === item.word ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-gray-600 mb-2">
              <span className="font-medium text-gray-700">Meaning:</span> {item.meaning}
            </p>
            <p className="text-gray-600 italic">
              <span className="font-medium text-gray-700 not-italic">Example:</span> &ldquo;{item.example}&rdquo;
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={() => setCurrentSection('grammar')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          Next: Grammar <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render Grammar Section
  const renderGrammar = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Languages className="w-5 h-5 text-purple-600" />
        {selectedLesson.grammar.title}
      </h3>
      
      <div className="bg-purple-50 rounded-xl p-5 mb-6">
        <p className="text-gray-700 mb-3">{selectedLesson.grammar.explanation}</p>
        <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
          <p className="font-medium text-gray-900">Example:</p>
          <p className="text-purple-700 text-lg">&ldquo;{selectedLesson.grammar.example}&rdquo;</p>
        </div>
      </div>
      
      {/* Common Mistake */}
      <div className="bg-red-50 rounded-xl p-5">
        <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Common Mistake
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
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('vocabulary')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Vocabulary
        </Button>
        <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render Reading Section
  const renderReading = () => {
    if (!selectedLesson?.reading) return <Card className="p-6"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></Card>;
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Reading Practice
        </h3>
        
        <div className="bg-blue-50 rounded-xl p-5 mb-6">
          <div className="flex justify-end mb-2">
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
          <p className="text-gray-800 leading-relaxed text-lg">{selectedLesson.reading.text}</p>
        </div>
        
        {/* Comprehension Questions */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900">Comprehension Questions</h4>
          {selectedLesson.reading.questions?.map((q, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-900 mb-2">{idx + 1}. {q.question}</p>
              <details className="cursor-pointer">
                <summary className="text-sm text-green-600 hover:text-green-700">Click to see answer</summary>
                <p className="mt-2 text-gray-700 bg-green-50 p-3 rounded-lg">{q.answer}</p>
              </details>
            </div>
          ))}
        </div>
      
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
          </Button>
          <Button onClick={() => setCurrentSection('speaking')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            Next: Speaking <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
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
    if (!selectedLesson?.writing) return <Card className="p-6"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></Card>;
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-orange-600" />
          Writing Practice
        </h3>
        
        <div className="bg-orange-50 rounded-xl p-5 mb-6">
          <p className="text-sm text-orange-600 font-medium mb-2">Task:</p>
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
      <div className="bg-green-50 rounded-xl p-4 mb-4">
        <p className="text-sm text-green-600 font-medium mb-2">Model Answer:</p>
        <p className="text-gray-800 italic">"{selectedLesson.writing.model_answer}"</p>
      </div>
      
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
            Submit Quiz
          </Button>
        </>
      ) : (
        <div className="text-center py-8">
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${quizScore >= 70 ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h4 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h4>
          <p className="text-4xl font-bold text-cyan-600 mb-4">{quizScore}%</p>
          <p className="text-gray-600 mb-6">
            {quizScore >= 70 ? '🎉 Great job! You\'ve mastered this lesson!' : 'Keep practicing to improve your score.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>
              Try Again
            </Button>
            <Button 
              onClick={() => { setView('lessons'); setSelectedLesson(null); }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            >
              <Home className="w-4 h-4 mr-2" /> Back to Lessons
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-green-50/30 to-gray-100 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'lessons' && renderLessonsList()}
        {view === 'lesson-detail' && renderLessonDetail()}
      </div>
    </div>
  );
}
