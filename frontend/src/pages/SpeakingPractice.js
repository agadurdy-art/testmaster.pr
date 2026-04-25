import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Mic, MicOff, ArrowLeft, Clock, CheckCircle, XCircle, Loader2, ChevronRight, Play, Pause, RotateCcw, Volume2, MessageSquare, Target, AlertCircle, Lightbulb, Award, Square, User, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { useGoBack } from '../hooks/useGoBack';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SPEAKING_PARTS = [
  { id: 'part1', title: 'Part 1: Introduction', description: 'Answer questions about familiar topics', duration: '4-5 minutes', icon: MessageSquare, color: 'bg-green-500', lightBg: 'bg-green-50', tips: 'Give extended answers (2-3 sentences)' },
  { id: 'part2', title: 'Part 2: Cue Card', description: 'Speak for 2 minutes on a given topic', duration: '3-4 minutes', icon: Target, color: 'bg-blue-500', lightBg: 'bg-blue-50', tips: '1 min prep, 2 mins speaking' },
  { id: 'part3', title: 'Part 3: Discussion', description: 'Discuss abstract ideas related to Part 2', duration: '4-5 minutes', icon: Bot, color: 'bg-purple-500', lightBg: 'bg-purple-50', tips: 'Give opinions with reasons' },
  { id: 'full_test', title: 'Full Mock Test', description: 'Complete all 3 parts in one session', duration: '11-14 minutes', icon: Award, color: 'bg-orange-500', lightBg: 'bg-orange-50', tips: 'Simulate real exam conditions' }
];

const SPEAKING_QUESTIONS = {
  part1: [
    { topic: 'Home & Accommodation', questions: ["Let's talk about where you live. Do you live in a house or an apartment?", "What do you like most about your home?", "Is there anything you would like to change about your home?", "Do you plan to live there for a long time?"] },
    { topic: 'Work & Studies', questions: ["Do you work or are you a student?", "What do you like about your work/studies?", "Is there anything you would like to change about your job/course?", "What are your future career plans?"] },
    { topic: 'Daily Routine', questions: ["What time do you usually wake up?", "What do you usually do in the morning?", "Is your routine the same on weekdays and weekends?", "Would you like to change your daily routine?"] },
    { topic: 'Hobbies & Free Time', questions: ["What do you enjoy doing in your free time?", "How did you become interested in this hobby?", "Do you think you'll continue this hobby in the future?", "Would you recommend this hobby to others?"] }
  ],
  part2: [
    { id: 'cue1', topic: 'Describe a person who has influenced you', card: "Describe a person who has had a significant influence on your life.\n\nYou should say:\n• who this person is\n• how you know this person\n• what qualities this person has\n\nAnd explain why this person has influenced you.", followUp: "Is it easy to influence others?" },
    { id: 'cue2', topic: 'Describe a place you would like to visit', card: "Describe a place you would like to visit in the future.\n\nYou should say:\n• where this place is\n• how you know about it\n• what you would do there\n\nAnd explain why you want to visit this place.", followUp: "Do you prefer traveling alone or with others?" },
    { id: 'cue3', topic: 'Describe a skill you learned', card: "Describe a skill you learned that you are proud of.\n\nYou should say:\n• what the skill is\n• how you learned it\n• how long it took to learn\n\nAnd explain why you are proud of learning this skill.", followUp: "Do you think everyone should learn this skill?" },
    { id: 'cue4', topic: 'Describe a memorable event', card: "Describe a memorable event from your childhood.\n\nYou should say:\n• what the event was\n• when and where it happened\n• who was involved\n\nAnd explain why this event is memorable to you.", followUp: "Do you think childhood memories are important?" }
  ],
  part3: [
    { topic: 'Influence & Role Models', questions: ["Why do you think some people become role models?", "Do celebrities have too much influence on young people?", "How has the way people influence others changed with social media?", "Should parents be the main influence on children?"] },
    { topic: 'Travel & Tourism', questions: ["What are the benefits of international travel?", "How has tourism affected local cultures?", "Do you think people will travel more or less in the future?", "Should governments limit tourism to protect the environment?"] },
    { topic: 'Skills & Education', questions: ["What skills will be most important in the future?", "Should schools focus more on practical skills or academic knowledge?", "How has technology changed the way people learn new skills?", "Is it better to be a specialist or have knowledge in many areas?"] }
  ]
};

export default function SpeakingPractice({ user }) {
  const navigate = useNavigate();
  const [view, setView] = useState('parts');
  const [selectedPart, setSelectedPart] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [prepTime, setPrepTime] = useState(0);
  const [speakTime, setSpeakTime] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isPreparing && prepTime > 0) {
      timerRef.current = setInterval(() => { setPrepTime(prev => { if (prev <= 1) { setIsPreparing(false); toast.info('Prep time over!'); return 0; } return prev - 1; }); }, 1000);
    } else if (isSpeaking && speakTime > 0) {
      timerRef.current = setInterval(() => { setSpeakTime(prev => { if (prev <= 1) { stopRecording(); toast.info('Time is over.'); return 0; } return prev - 1; }); }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPreparing, prepTime, isSpeaking, speakTime]);

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        setAudioBlob(blob);
        setRecording(false);
        setIsSpeaking(false);
        await transcribeAudio(blob);
      };
      mediaRecorder.start();
      setRecording(true);
      setIsSpeaking(true);
      setSpeakTime(selectedPart === 'part2' ? 120 : 60);
      toast.info('Recording... Speak now!');
    } catch (error) { toast.error('Microphone access denied.'); }
  };

  const stopRecording = () => { if (mediaRecorderRef.current && recording) mediaRecorderRef.current.stop(); };

  const transcribeAudio = async (blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', new File([blob], 'recording.webm', { type: 'audio/webm' }));
      const response = await fetch(`${API_URL}/api/transcribe-audio`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Transcription failed');
      const data = await response.json();
      const currentQuestion = getCurrentQuestion();
      setRecordings(prev => [...prev, { question: currentQuestion, audioBlob: blob, transcript: data.text || '', timestamp: new Date().toISOString() }]);
      setTranscripts(prev => [...prev, { question: currentQuestion, answer: data.text || '' }]);
      toast.success('Recording saved!');
    } catch (error) { toast.error('Failed to transcribe.'); }
    finally { setLoading(false); }
  };

  const getCurrentQuestion = () => selectedPart === 'part2' ? selectedTopic?.card || '' : selectedTopic?.questions?.[currentQuestionIndex] || '';
  const getTotalQuestions = () => selectedPart === 'part2' ? 1 : selectedTopic?.questions?.length || 0;

  const nextQuestion = () => {
    const total = getTotalQuestions();
    if (currentQuestionIndex < total - 1) { setCurrentQuestionIndex(prev => prev + 1); setAudioBlob(null); }
    else submitForFeedback();
  };

  const submitForFeedback = async () => {
    if (transcripts.length === 0) { toast.error('Record at least one response.'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/speaking-practice/evaluate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ part: selectedPart, topic: selectedTopic?.topic || selectedTopic?.card, responses: transcripts }) });
      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      setFeedback(data); setView('feedback');
      toast.success('Speaking evaluated!');
    } catch (error) { toast.error('Failed to evaluate.'); }
    finally { setLoading(false); }
  };

  const startPractice = (part, topic) => {
    setSelectedPart(part); setSelectedTopic(topic); setCurrentQuestionIndex(0); setRecordings([]); setTranscripts([]); setAudioBlob(null); setFeedback(null);
    if (part === 'part2') { setPrepTime(60); setIsPreparing(true); }
    setView('practice');
  };

  const resetPractice = () => { setView('parts'); setSelectedPart(null); setSelectedTopic(null); setCurrentQuestionIndex(0); setRecordings([]); setTranscripts([]); setAudioBlob(null); setFeedback(null); setIsPreparing(false); setIsSpeaking(false); setPrepTime(0); setSpeakTime(0); };

  // Auto-record mode state
  const [autoRecordEnabled, setAutoRecordEnabled] = useState(true);
  
  const playQuestion = (text, autoStartRecord = false) => { 
    if ('speechSynthesis' in window) { 
      window.speechSynthesis.cancel(); 
      const u = new SpeechSynthesisUtterance(text); 
      u.lang = 'en-US'; 
      u.rate = 0.9; 
      setPlayingAudio(text); 
      u.onend = () => { 
        setPlayingAudio(null);
        // Auto-start recording after prompt plays (if enabled and not Part 2 which has prep time)
        if (autoStartRecord && autoRecordEnabled && selectedPart !== 'part2' && !recording) {
          setTimeout(() => {
            toast.info('🎤 Recording starting...');
            startRecording();
          }, 500);
        }
      }; 
      window.speechSynthesis.speak(u); 
    } 
  };

  const getBandColor = (band) => band >= 7 ? 'bg-green-100 text-green-700' : band >= 6 ? 'bg-blue-100 text-blue-700' : band >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  // Parts Selection
  if (view === 'parts') return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-green-50/30 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 text-gray-600 hover:text-violet-600"><ArrowLeft className="w-4 h-4 mr-2" /> Dashboard</Button>
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-200">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Speaking Practice</h1>
          <p className="text-gray-500">Improve your IELTS Speaking with AI evaluation</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {SPEAKING_PARTS.map((part) => (
            <Card key={part.id} className={`p-6 bg-white border-0 shadow-lg hover:shadow-xl cursor-pointer group transition-all hover:-translate-y-1 rounded-2xl`} onClick={() => { if (part.id === 'full_test') { toast.info('Coming soon!'); return; } setSelectedPart(part.id); }}>
              <div className={`w-14 h-14 rounded-2xl ${part.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <part.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{part.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{part.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2"><Clock className="w-4 h-4" /> {part.duration}</div>
              <p className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">💡 {part.tips}</p>
            </Card>
          ))}
        </div>
        {selectedPart && selectedPart !== 'full_test' && (
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a topic for {SPEAKING_PARTS.find(p => p.id === selectedPart)?.title}</h3>
            <div className="grid gap-3">
              {SPEAKING_QUESTIONS[selectedPart]?.map((topic, idx) => (
                <Button key={idx} variant="outline" className="justify-start h-auto py-3 px-4 text-left hover:bg-violet-50 hover:border-violet-300" onClick={() => startPractice(selectedPart, topic)}>
                  <span className="font-medium">{topic.topic}</span><ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              ))}
            </div>
            <Button variant="ghost" className="mt-4 text-gray-500" onClick={() => setSelectedPart(null)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </Card>
        )}
      </div>
    </div>
  );

  // Practice Interface
  if (view === 'practice') {
    const part = SPEAKING_PARTS.find(p => p.id === selectedPart);
    const currentQuestion = getCurrentQuestion();
    const totalQuestions = getTotalQuestions();
    const hasRecordedCurrent = transcripts.length > currentQuestionIndex;
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-green-50/30 to-gray-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => { if (window.confirm('Exit? Progress lost.')) resetPractice(); }} className="text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Exit</Button>
            {(isPreparing || isSpeaking) && <div className={`px-4 py-2 rounded-xl font-mono text-lg ${(isPreparing ? prepTime : speakTime) < 30 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}><Clock className="w-4 h-4 inline mr-2" />{isPreparing ? `Prep: ${formatTime(prepTime)}` : `${formatTime(speakTime)}`}</div>}
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-lg ${part?.color} flex items-center justify-center shadow-lg`}>{part?.icon && <part.icon className="w-5 h-5 text-white" />}</div>
            <div><h2 className="text-lg font-bold text-gray-900">{part?.title}</h2><p className="text-sm text-gray-500">Topic: {selectedTopic?.topic}</p></div>
          </div>
          {totalQuestions > 1 && <div className="mb-6"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {totalQuestions}</span><span className="text-sm text-gray-500">{transcripts.length} recorded</span></div><Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-2" /></div>}
          <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2"><Bot className="w-5 h-5 text-blue-600" /><span className="text-sm font-medium text-blue-600">Examiner</span></div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => playQuestion(currentQuestion, true)} 
                  disabled={playingAudio === currentQuestion || recording}
                  className="text-blue-600"
                >
                  <Play className="w-4 h-4 mr-1" />
                  {autoRecordEnabled ? 'Play & Record' : 'Play'}
                </Button>
              </div>
            </div>
            <p className="text-lg text-gray-800 whitespace-pre-line leading-relaxed">{currentQuestion}</p>
            {selectedPart === 'part2' && isPreparing && <div className="mt-4 p-3 bg-amber-50 rounded-xl"><p className="text-sm text-amber-800">⏱️ {formatTime(prepTime)} to prepare. Click &quot;Start Speaking&quot; when ready.</p></div>}
          </Card>
          <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><User className="w-5 h-5 text-green-600" /><span className="text-sm font-medium text-green-600">Your Response</span></div>
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoRecordEnabled} 
                  onChange={(e) => setAutoRecordEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Auto-record after play
              </label>
            </div>
            <div className="flex flex-col items-center gap-4">
              {!recording ? (
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <Button 
                    size="lg" 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white" 
                    onClick={() => playQuestion(currentQuestion, true)} 
                    disabled={loading || isPreparing || playingAudio === currentQuestion || recording}
                  >
                    <Play className="w-5 h-5 mr-2" />Play & Record
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className={`flex-1 ${hasRecordedCurrent ? 'border-amber-400 text-amber-600' : ''}`} 
                    onClick={startRecording} 
                    disabled={loading || isPreparing}
                  >
                    <Mic className="w-5 h-5 mr-2" />{hasRecordedCurrent ? 'Re-record' : 'Record Only'}
                  </Button>
                </div>
              ) : (
                <Button size="lg" className="w-full max-w-xs bg-red-500 hover:bg-red-600 text-white" onClick={stopRecording}><Square className="w-5 h-5 mr-2" />Stop ({formatTime(speakTime)})</Button>
              )}
              {loading && <div className="flex items-center gap-2 text-gray-500"><Loader2 className="w-4 h-4 animate-spin" />Transcribing...</div>}
              {hasRecordedCurrent && transcripts[currentQuestionIndex] && <div className="w-full p-4 bg-green-50 rounded-xl"><p className="text-sm text-gray-500 mb-1">Your response:</p><p className="text-gray-800">{transcripts[currentQuestionIndex].answer}</p></div>}
            </div>
          </Card>
          <div className="flex gap-3">
            {currentQuestionIndex > 0 && <Button variant="outline" onClick={() => setCurrentQuestionIndex(prev => prev - 1)}><ArrowLeft className="w-4 h-4 mr-2" /> Previous</Button>}
            <div className="flex-1" />
            {hasRecordedCurrent && (currentQuestionIndex < totalQuestions - 1 ? <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={nextQuestion}>Next <ChevronRight className="w-4 h-4 ml-2" /></Button> : <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={submitForFeedback} disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Evaluating...</> : <><Award className="w-4 h-4 mr-2" />Get Feedback</>}</Button>)}
          </div>
        </div>
      </div>
    );
  }

  // Feedback View
  if (view === 'feedback' && feedback) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-green-50/30 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={resetPractice} className="mb-4 text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <Card className="p-6 mb-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg rounded-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Award className="w-8 h-8 text-white" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Estimated Band Score</h2>
          <div className={`inline-block px-6 py-3 rounded-full text-4xl font-bold ${getBandColor(feedback.overall_band)}`}>{feedback.overall_band}</div>
        </Card>
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Scores</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[{ key: 'fluency_coherence', label: 'Fluency & Coherence' }, { key: 'lexical_resource', label: 'Lexical Resource' }, { key: 'grammar', label: 'Grammar' }, { key: 'pronunciation', label: 'Pronunciation' }].map((c) => (
              <div key={c.key} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <span className="font-medium text-gray-900">{c.label}</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getBandColor(feedback.scores?.[c.key] || feedback.overall_band)}`}>{feedback.scores?.[c.key] || feedback.overall_band}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback</h3>
          <div className="mb-6"><h4 className="font-medium text-green-700 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Strengths</h4><ul className="space-y-2">{(feedback.strengths || []).map((s, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-green-500">•</span>{s}</li>)}</ul></div>
          <div className="mb-6"><h4 className="font-medium text-amber-700 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Improvements</h4><ul className="space-y-2">{(feedback.improvements || []).map((s, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-amber-500">•</span>{s}</li>)}</ul></div>
          {feedback.pronunciation_tips && <div><h4 className="font-medium text-purple-700 mb-2 flex items-center gap-2"><Mic className="w-4 h-4" /> Pronunciation Tips</h4><p className="text-sm text-gray-700">{feedback.pronunciation_tips}</p></div>}
        </Card>
        {feedback.model_answer && <Card className="p-6 mb-6 bg-blue-50 border-blue-200 rounded-2xl"><h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Model Answer</h3><p className="text-gray-700 whitespace-pre-line">{feedback.model_answer}</p></Card>}
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetPractice} className="flex-1"><RotateCcw className="w-4 h-4 mr-2" /> Practice Another</Button>
          <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => { setView('practice'); setFeedback(null); setCurrentQuestionIndex(0); setTranscripts([]); setRecordings([]); }}><Mic className="w-4 h-4 mr-2" /> Try Again</Button>
        </div>
      </div>
    </div>
  );

  return null;
}
