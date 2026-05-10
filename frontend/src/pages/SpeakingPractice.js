import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Mic, MicOff, ArrowLeft, Clock, CheckCircle, XCircle, Loader2, ChevronRight, Play, Pause, RotateCcw, Volume2, MessageSquare, Target, AlertCircle, Lightbulb, Award, Square, User, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { useGoBack } from '../hooks/useGoBack';
import { speakOnce } from '../hooks/useLizVoice';
import StructuredResultsLayout from '../features/speaking/components/StructuredResultsLayout';

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
  // Tracks Date.now() at MediaRecorder.start() so we can compute the actual
  // recorded duration on stop — backend uses this for fluency (WPM, etc.).
  const recordStartRef = useRef(null);

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
        // Capture actual recording duration before clearing the start marker.
        const startedAt = recordStartRef.current;
        recordStartRef.current = null;
        const recordedSeconds = startedAt ? (Date.now() - startedAt) / 1000 : 0;
        setAudioBlob(blob);
        setRecording(false);
        setIsSpeaking(false);
        await transcribeAudio(blob, recordedSeconds);
      };
      mediaRecorder.start();
      recordStartRef.current = Date.now();
      setRecording(true);
      setIsSpeaking(true);
      setSpeakTime(selectedPart === 'part2' ? 120 : 60);
      toast.info('Recording... Speak now!');
    } catch (error) { toast.error('Microphone access denied.'); }
  };

  const stopRecording = () => { if (mediaRecorderRef.current && recording) mediaRecorderRef.current.stop(); };

  const transcribeAudio = async (blob, durationSeconds = 0) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', new File([blob], 'recording.webm', { type: 'audio/webm' }));
      const response = await fetch(`${API_URL}/api/transcribe-audio`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Transcription failed');
      const data = await response.json();
      const currentQuestion = getCurrentQuestion();
      // Keep the raw audio blob + duration so submitForFeedback can multipart it
      // up to /api/speaking-practice/evaluate-structured (per-question pipeline).
      // Previously the blob was discarded and only the transcript was POSTed,
      // which is what blocked the per-question audio playback in results.
      setRecordings(prev => [...prev, {
        question: currentQuestion,
        audioBlob: blob,
        durationSeconds,
        transcript: data.text || '',
        timestamp: new Date().toISOString(),
      }]);
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
    if (recordings.length === 0) { toast.error('Record at least one response.'); return; }
    if (!user?.id) { toast.error('Please sign in to evaluate.'); return; }
    setLoading(true);
    try {
      // Multipart POST to the structured per-question evaluator. Each question
      // gets its own audio_q{i} + question_q{i} + duration_q{i}, so the backend
      // can run Whisper×N (basic tier) or Azure×N (full tier) in parallel and
      // a single Sonnet call returns per-question + overall scoring.
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('part', selectedPart);
      formData.append('topic', selectedTopic?.topic || selectedTopic?.card || '');
      formData.append('user_language', (user.preferred_language || 'en'));
      formData.append('target_band', String(user.target_band ?? 7.0));
      formData.append('client_request_id', `${user.id}:${Date.now()}`);
      recordings.forEach((rec, i) => {
        const idx = i + 1;
        formData.append(`question_q${idx}`, rec.question || '');
        formData.append(
          `audio_q${idx}`,
          new File([rec.audioBlob], `q${idx}.webm`, { type: 'audio/webm' }),
        );
        formData.append(`duration_q${idx}`, String(rec.durationSeconds || 0));
      });
      const response = await fetch(
        `${API_URL}/api/speaking-practice/evaluate-structured`,
        { method: 'POST', body: formData },
      );
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail?.detail?.message || 'Evaluation failed');
      }
      const data = await response.json();
      setFeedback(data);
      setView('feedback');
      toast.success('Speaking evaluated!');
    } catch (error) {
      toast.error(error?.message || 'Failed to evaluate.');
    } finally {
      setLoading(false);
    }
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
    // Liz voice via ElevenLabs (cached server-side in /api/tts/generate).
    // Falls back to Web Speech automatically when the key isn't configured.
    setPlayingAudio(text);
    speakOnce(text, {
      lang: 'en-GB',
      rate: 0.95,
      onEnd: () => {
        setPlayingAudio(null);
        // Auto-start recording after prompt plays (if enabled and not Part 2 which has prep time)
        if (autoStartRecord && autoRecordEnabled && selectedPart !== 'part2' && !recording) {
          setTimeout(() => {
            toast.info('🎤 Recording starting...');
            startRecording();
          }, 500);
        }
      },
      onError: () => setPlayingAudio(null),
    });
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

  // Practice Interface — listen & record screen.
  // Faz E: emerald accenting (gradient bg + accent timer + 4-px accent border on
  // the question card + emerald CTA emphasis) so the page reads as part of the
  // emerald-led web identity instead of plain slate.
  if (view === 'practice') {
    const part = SPEAKING_PARTS.find(p => p.id === selectedPart);
    const currentQuestion = getCurrentQuestion();
    const totalQuestions = getTotalQuestions();
    const hasRecordedCurrent = transcripts.length > currentQuestionIndex;
    const timerActive = isPreparing || isSpeaking;
    const remaining = isPreparing ? prepTime : speakTime;
    const timerLow = remaining < 30;
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => { if (window.confirm('Exit? Progress lost.')) resetPractice(); }} className="text-slate-600 hover:text-emerald-700"><ArrowLeft className="w-4 h-4 mr-2" /> Exit</Button>
            {timerActive && (
              <div
                className={`px-4 py-2 rounded-xl font-mono text-lg shadow-sm border ${
                  timerLow
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                {isPreparing ? `Prep: ${formatTime(prepTime)}` : `${formatTime(speakTime)}`}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              {part?.icon && <part.icon className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{part?.title}</h2>
              <p className="text-sm text-slate-500">Topic: {selectedTopic?.topic}</p>
            </div>
          </div>
          {totalQuestions > 1 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <span className="text-sm text-emerald-700 font-medium">{transcripts.length} recorded</span>
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          )}
          <Card className="relative p-6 mb-6 bg-white border-0 shadow-lg shadow-emerald-100/40 rounded-2xl overflow-hidden">
            <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
            <div className="flex items-start justify-between mb-4 pl-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider">
                <Bot className="w-3.5 h-3.5" /> Examiner
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playQuestion(currentQuestion, true)}
                  disabled={playingAudio === currentQuestion || recording}
                  className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                >
                  <Play className="w-4 h-4 mr-1" />
                  {autoRecordEnabled ? 'Play & Record' : 'Play'}
                </Button>
              </div>
            </div>
            <p className="text-lg text-slate-800 whitespace-pre-line leading-relaxed pl-2">{currentQuestion}</p>
            {selectedPart === 'part2' && isPreparing && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 ml-2">
                <p className="text-sm text-amber-800">⏱️ {formatTime(prepTime)} to prepare. Click &quot;Start Speaking&quot; when ready.</p>
              </div>
            )}
          </Card>
          <Card className="p-6 mb-6 bg-white border-0 shadow-lg shadow-emerald-100/40 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 text-teal-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider">
                <User className="w-3.5 h-3.5" /> Your Response
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRecordEnabled}
                  onChange={(e) => setAutoRecordEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Auto-record after play
              </label>
            </div>
            <div className="flex flex-col items-center gap-4">
              {!recording ? (
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200"
                    onClick={() => playQuestion(currentQuestion, true)}
                    disabled={loading || isPreparing || playingAudio === currentQuestion || recording}
                  >
                    <Play className="w-5 h-5 mr-2" />Play & Record
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className={`flex-1 ${hasRecordedCurrent ? 'border-amber-400 text-amber-600' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}
                    onClick={startRecording}
                    disabled={loading || isPreparing}
                  >
                    <Mic className="w-5 h-5 mr-2" />{hasRecordedCurrent ? 'Re-record' : 'Record Only'}
                  </Button>
                </div>
              ) : (
                <Button size="lg" className="w-full max-w-xs bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200 animate-pulse" onClick={stopRecording}>
                  <Square className="w-5 h-5 mr-2" />Stop ({formatTime(speakTime)})
                </Button>
              )}
              {loading && (
                <div className="flex items-center gap-2 text-emerald-700">
                  <Loader2 className="w-4 h-4 animate-spin" />Transcribing...
                </div>
              )}
              {hasRecordedCurrent && transcripts[currentQuestionIndex] && (
                <div className="w-full p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs uppercase tracking-wider text-emerald-700 mb-1 font-semibold">Your response</p>
                  <p className="text-slate-800">{transcripts[currentQuestionIndex].answer}</p>
                </div>
              )}
            </div>
          </Card>
          <div className="flex gap-3">
            {currentQuestionIndex > 0 && <Button variant="outline" onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="border-slate-300 text-slate-700"><ArrowLeft className="w-4 h-4 mr-2" /> Previous</Button>}
            <div className="flex-1" />
            {hasRecordedCurrent && (
              currentQuestionIndex < totalQuestions - 1 ? (
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200" onClick={nextQuestion}>
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200" onClick={submitForFeedback} disabled={loading}>
                  {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Evaluating...</>) : (<><Award className="w-4 h-4 mr-2" />Get Feedback</>)}
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // Feedback View — per-question switcher + overall band (Cathoven-style).
  // Feeds on the structured response shape from
  // /api/speaking-practice/evaluate-structured.
  if (view === 'feedback' && feedback) {
    return (
      <StructuredResultsLayout
        feedback={feedback}
        onPracticeAnother={resetPractice}
        onTryAgain={() => {
          setView('practice');
          setFeedback(null);
          setCurrentQuestionIndex(0);
          setTranscripts([]);
          setRecordings([]);
        }}
      />
    );
  }

  return null;
}
