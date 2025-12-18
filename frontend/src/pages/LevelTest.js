import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Mic, Square, Play, ChevronRight, CheckCircle, Award, BookOpen, MessageSquare, ArrowLeft, Target, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../lib/i18n';

// Reading questions of varying difficulty
const readingQuestions = [
  {
    id: 1,
    level: 'elementary',
    passage: "The weather today is sunny and warm. Many people are going to the park to enjoy the day. Children are playing on the grass while their parents sit on benches.",
    question: "What are the children doing in the park?",
    options: ["A) Sitting on benches", "B) Playing on the grass", "C) Going home", "D) Reading books"],
    correct: "B"
  },
  {
    id: 2,
    level: 'pre-intermediate',
    passage: "Scientists have discovered that regular exercise not only improves physical health but also has significant benefits for mental well-being. Studies show that just 30 minutes of moderate exercise can reduce stress and improve mood.",
    question: "According to the passage, what is one benefit of regular exercise?",
    options: ["A) It makes you taller", "B) It reduces stress", "C) It helps you sleep longer", "D) It increases appetite"],
    correct: "B"
  },
  {
    id: 3,
    level: 'intermediate',
    passage: "The proliferation of smartphones has fundamentally altered the way humans communicate and access information. While these devices offer unprecedented connectivity, critics argue that excessive screen time may be detrimental to interpersonal relationships and cognitive development, particularly among younger users.",
    question: "What concern do critics have about smartphones?",
    options: ["A) They are too expensive", "B) They may harm relationships and brain development", "C) They don't have enough features", "D) They are difficult to use"],
    correct: "B"
  },
  {
    id: 4,
    level: 'upper-intermediate',
    passage: "The phenomenon of confirmation bias—the tendency to seek out information that supports one's existing beliefs while dismissing contradictory evidence—poses a significant challenge to objective decision-making. This cognitive bias is particularly pronounced in politically charged discussions, where individuals often interpret ambiguous information in ways that reinforce their preconceptions.",
    question: "What does confirmation bias cause people to do?",
    options: ["A) Accept all information equally", "B) Favor information that supports their existing beliefs", "C) Avoid making any decisions", "D) Change their opinions frequently"],
    correct: "B"
  },
  {
    id: 5,
    level: 'advanced',
    passage: "The epistemological implications of artificial intelligence have sparked considerable debate among philosophers and technologists alike. As machine learning algorithms demonstrate increasingly sophisticated pattern recognition capabilities, questions arise regarding the nature of understanding itself—whether computational processes can be said to 'comprehend' in any meaningful sense, or whether they merely simulate comprehension through statistical correlation.",
    question: "What philosophical question does AI raise according to the passage?",
    options: ["A) Whether computers will replace humans", "B) Whether machines can truly understand or just imitate understanding", "C) How to make AI more affordable", "D) When AI was first invented"],
    correct: "B"
  }
];

// Speaking prompts
const speakingPrompts = [
  { id: 1, level: 'general', prompt: "Please introduce yourself briefly. Tell me your name, where you're from, and what you do (work or study).", duration: 60, tip: "Speak naturally for about 30-60 seconds" },
  { id: 2, level: 'ielts', prompt: "Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how this skill would benefit you.", duration: 120, tip: "Try to speak for 1-2 minutes, covering all points" }
];

export default function LevelTest({ user }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  
  const [stage, setStage] = useState('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState({});
  const [currentSpeakingPrompt, setCurrentSpeakingPrompt] = useState(0);
  const [speakingResponses, setSpeakingResponses] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [results, setResults] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const handleReadingAnswer = (questionId, answer) => {
    setReadingAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextReadingQuestion = () => {
    if (currentQuestion < readingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStage('speaking');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        await transcribeAudio(blob);
      };
      mediaRecorder.start();
      setRecording(true);
      toast.info('Recording started... Speak now!');
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Failed to access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      toast.success('Recording stopped');
    }
  };

  const transcribeAudio = async (blob) => {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', new File([blob], 'recording.webm', { type: 'audio/webm' }));
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/speaking/transcribe`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Transcription failed');
      const data = await response.json();
      setCurrentTranscript(data.text || '');
      toast.success('Audio transcribed!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe. You can type your response instead.');
    } finally {
      setTranscribing(false);
    }
  };

  const saveSpeakingResponse = () => {
    if (!currentTranscript.trim()) { toast.error('Please record or type your response first'); return; }
    setSpeakingResponses(prev => [...prev, { promptId: speakingPrompts[currentSpeakingPrompt].id, prompt: speakingPrompts[currentSpeakingPrompt].prompt, response: currentTranscript }]);
    if (currentSpeakingPrompt < speakingPrompts.length - 1) {
      setCurrentSpeakingPrompt(currentSpeakingPrompt + 1);
      setCurrentTranscript('');
      setAudioBlob(null);
    } else {
      evaluateLevel();
    }
  };

  const evaluateLevel = async () => {
    setStage('evaluating');
    setEvaluating(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/level-test/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          reading_answers: readingAnswers,
          reading_questions: readingQuestions.map(q => ({ id: q.id, level: q.level, correct: q.correct })),
          speaking_responses: [...speakingResponses, { promptId: speakingPrompts[currentSpeakingPrompt].id, prompt: speakingPrompts[currentSpeakingPrompt].prompt, response: currentTranscript }]
        })
      });
      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      setResults(data);
      setStage('results');
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Failed to evaluate. Please try again.');
      setStage('speaking');
    } finally {
      setEvaluating(false);
    }
  };

  const getLevelGradient = (level) => {
    const gradients = {
      'Beginner': 'from-gray-500 to-gray-600',
      'Elementary': 'from-blue-500 to-indigo-600',
      'Pre-Intermediate': 'from-cyan-500 to-blue-600',
      'Intermediate': 'from-green-500 to-emerald-600',
      'Upper-Intermediate': 'from-yellow-500 to-orange-600',
      'Advanced': 'from-orange-500 to-red-600',
      'IELTS Ready': 'from-purple-500 to-pink-600'
    };
    return gradients[level] || 'from-cyan-500 to-purple-600';
  };

  const getLevelBand = (level) => {
    const bands = { 'Beginner': '3.0-3.5', 'Elementary': '4.0-4.5', 'Pre-Intermediate': '5.0-5.5', 'Intermediate': '5.5-6.0', 'Upper-Intermediate': '6.0-6.5', 'Advanced': '7.0-7.5', 'IELTS Ready': '7.5+' };
    return bands[level] || '5.0-6.0';
  };

  // INTRO STAGE
  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-cyan-50/30 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 text-gray-600 hover:text-violet-600">
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Card className="p-8 bg-white border-0 shadow-lg rounded-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-cyan-200">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">English Level Test</h1>
              <p className="text-gray-500">Discover your English proficiency in 5-7 minutes</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Reading Section</h3>
                  <p className="text-sm text-gray-500">5 questions of increasing difficulty</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Speaking Section</h3>
                  <p className="text-sm text-gray-500">2 speaking prompts to assess fluency</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Evaluation</h3>
                  <p className="text-sm text-gray-500">Get personalized recommendations</p>
                </div>
              </div>
            </div>
            
            <Button onClick={() => setStage('reading')} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 py-6 text-lg shadow-lg shadow-purple-200">
              Start Test <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // READING STAGE
  if (stage === 'reading') {
    const question = readingQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / readingQuestions.length) * 50;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50/30 to-gray-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-600">Reading Section</span>
              <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {readingQuestions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-4 capitalize">
              {question.level} Level
            </span>
            <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200">
              <p className="text-gray-700 leading-relaxed">{question.passage}</p>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.question}</h3>
            
            <div className="space-y-3 mb-6">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReadingAnswer(question.id, option.charAt(0))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    readingAnswers[question.id] === option.charAt(0)
                      ? 'border-violet-500 bg-violet-50 text-gray-900'
                      : 'border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)} disabled={currentQuestion === 0} className="text-gray-500">
                Previous
              </Button>
              <Button onClick={nextReadingQuestion} disabled={!readingAnswers[question.id]} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
                {currentQuestion === readingQuestions.length - 1 ? 'Continue to Speaking' : 'Next Question'} <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // SPEAKING STAGE
  if (stage === 'speaking') {
    const prompt = speakingPrompts[currentSpeakingPrompt];
    const progress = 50 + ((currentSpeakingPrompt + 1) / speakingPrompts.length) * 50;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-green-400">Speaking Section</span>
              <span className="text-sm text-gray-400">Prompt {currentSpeakingPrompt + 1} of {speakingPrompts.length}</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10" />
          </div>
          
          <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-xl mb-6 border border-green-500/20">
              <h3 className="text-lg font-semibold text-white mb-3">{prompt.prompt}</h3>
              <p className="text-sm text-green-300">💡 Tip: {prompt.tip}</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-3 justify-center">
                {!recording ? (
                  <Button onClick={startRecording} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0" disabled={transcribing}>
                    <Mic className="w-4 h-4 mr-2" /> Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} className="bg-red-500 text-white hover:bg-red-600">
                    <Square className="w-4 h-4 mr-2" /> Stop Recording
                  </Button>
                )}
                {audioBlob && (
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => { if (audioRef.current) { audioRef.current.src = URL.createObjectURL(audioBlob); audioRef.current.play(); } }}>
                    <Play className="w-4 h-4 mr-2" /> Play Back
                  </Button>
                )}
              </div>
              <audio ref={audioRef} className="hidden" />
              {transcribing && (
                <div className="text-center text-gray-400">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Transcribing...
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your response:</label>
                <textarea
                  value={currentTranscript}
                  onChange={(e) => setCurrentTranscript(e.target.value)}
                  className="w-full h-32 p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Your spoken response will appear here..."
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={saveSpeakingResponse} disabled={!currentTranscript.trim() || transcribing} className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0">
                {currentSpeakingPrompt === speakingPrompts.length - 1 ? 'Finish & Get Results' : 'Next Prompt'} <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // EVALUATING STAGE
  if (stage === 'evaluating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md bg-white/5 backdrop-blur-xl border-white/10">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Analyzing Your Responses</h2>
          <p className="text-gray-400">Our AI is evaluating your skills...</p>
        </Card>
      </div>
    );
  }

  // RESULTS STAGE
  if (stage === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10">
            <div className="text-center mb-8">
              <div className={`w-24 h-24 bg-gradient-to-br ${getLevelGradient(results.level)} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                <Award className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Your English Level</h1>
              <div className={`inline-block px-6 py-2 bg-gradient-to-r ${getLevelGradient(results.level)} text-white text-xl font-bold rounded-full mb-2`}>
                {results.level}
              </div>
              <p className="text-gray-400">Estimated IELTS Band: {getLevelBand(results.level)}</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                <h3 className="font-semibold text-blue-400 mb-2">📖 Reading Score</h3>
                <p className="text-white">{results.reading_score}/5 correct</p>
                <p className="text-sm text-gray-400 mt-1">{results.reading_feedback}</p>
              </div>
              <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                <h3 className="font-semibold text-green-400 mb-2">🎤 Speaking Assessment</h3>
                <p className="text-sm text-gray-300 whitespace-pre-line">{results.speaking_feedback}</p>
              </div>
              <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                <h3 className="font-semibold text-purple-400 mb-2">📚 Recommended Next Steps</h3>
                <ul className="space-y-2">
                  {results.recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => { setStage('intro'); setCurrentQuestion(0); setReadingAnswers({}); setCurrentSpeakingPrompt(0); setSpeakingResponses([]); setCurrentTranscript(''); setResults(null); }} className="flex-1 border-white/20 text-white hover:bg-white/10">
                Take Test Again
              </Button>
              <Button onClick={() => navigate('/dashboard')} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0">
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
