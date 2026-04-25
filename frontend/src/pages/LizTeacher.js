import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { Button } from '../components/ui/button';
import {
  ArrowLeft, Send, Volume2, VolumeX, Plus,
  Loader2, ChevronDown, Mic, MicOff,
  MessageSquare, BookOpen, PenTool, Target,
  GraduationCap, ChevronUp, ClipboardList,
  CheckCircle2, Clock, X, Star, FileText
} from 'lucide-react';
import { canAccessLiz } from '../lib/lizAccess';
import { parseLizSegments } from '../lib/lizNavigateParser';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const LIZ_AVATAR = 'https://static.prod-images.emergentagent.com/jobs/799d7d0f-0425-4acb-aa13-54128002d580/images/baeb03c8118b149f97024b78f7f053e092a9d4c22d6c09656fd3a17aacf6359b.png';

/* ── Status: idle | listening | transcribing | thinking | speaking ── */

function AudioBars({ active }) {
  if (!active) return null;
  const heights = [12, 20, 28, 20, 12, 24, 16, 28, 20, 12];
  return (
    <div className="flex items-end justify-center gap-[3px] h-8" data-testid="audio-bars">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-teal-400"
          style={{
            animation: `audioPulse 0.6s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.07}s`,
            height: `${h}px`,
          }}
        />
      ))}
    </div>
  );
}

function LizPresence({ status, onStop }) {
  const isSpeaking = status === 'speaking';
  const isThinking = status === 'thinking';

  return (
    <div className="flex flex-col items-center">
      <div className="relative cursor-pointer" onClick={isSpeaking ? onStop : undefined}>
        {/* Glow ring when speaking */}
        {isSpeaking && (
          <div className="absolute -inset-3 rounded-full bg-teal-400/20 animate-ping" style={{ animationDuration: '1.5s' }} />
        )}
        <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 transition-all duration-500 ${
          isSpeaking
            ? 'border-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.4)]'
            : isThinking
              ? 'border-teal-300/50 animate-pulse'
              : 'border-white/80 shadow-lg'
        }`}>
          <img src={LIZ_AVATAR} alt="Liz" className="w-full h-full object-cover" />
          {/* Stop overlay when speaking */}
          {isSpeaking && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <VolumeX className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          )}
        </div>
        {/* Status dot */}
        <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
          isSpeaking ? 'bg-teal-400' : isThinking ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
        }`} />
      </div>
      <AudioBars active={isSpeaking} />
      {isSpeaking ? (
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 text-xs font-medium transition-colors"
          data-testid="stop-speaking-btn"
        >
          <VolumeX className="w-3.5 h-3.5" /> Stop
        </button>
      ) : (
        <p className="text-xs text-slate-400 mt-1" data-testid="liz-status">
          {status === 'thinking' && 'Liz is preparing...'}
          {status === 'listening' && 'Listening to you...'}
          {status === 'transcribing' && 'Understanding...'}
          {status === 'idle' && ''}
        </p>
      )}
    </div>
  );
}

function SpeechDisplay({ text, status }) {
  if (!text) return null;
  return (
    <div className={`max-w-xl mx-auto px-5 py-4 rounded-2xl text-sm sm:text-base leading-relaxed text-center whitespace-pre-wrap transition-all ${
      status === 'speaking'
        ? 'bg-white/90 border border-teal-200 shadow-md text-slate-800'
        : 'bg-white/60 border border-slate-200 text-slate-700'
    }`} data-testid="liz-speech">
      <LizContent text={text} />
    </div>
  );
}

// Render Liz's message with any [NAVIGATE: /path | Label] directives turned
// into clickable buttons. Plain text segments keep whitespace-pre-wrap.
function LizContent({ text }) {
  const navigate = useNavigate();
  const segments = parseLizSegments(text);
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'nav') {
          return (
            <button
              key={i}
              type="button"
              onClick={() => navigate(seg.path)}
              className="inline-flex items-center gap-1 mx-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition-colors"
            >
              {seg.label} →
            </button>
          );
        }
        return <span key={i}>{seg.value}</span>;
      })}
    </>
  );
}

function TranscriptItem({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 text-xs py-1.5 ${isUser ? 'justify-end' : ''}`}>
      <span className={`font-semibold ${isUser ? 'text-slate-500' : 'text-teal-600'}`}>
        {isUser ? 'You' : 'Liz'}:
      </span>
      <span className="text-slate-600 max-w-[80%] truncate">{msg.content}</span>
    </div>
  );
}

const LESSON_MODES = [
  { icon: MessageSquare, label: 'Speaking Practice', prompt: 'Start a structured IELTS Speaking practice session. Begin with Part 1 warm-up questions, then move to Part 2 cue card, and finish with Part 3 discussion. Guide me step by step.', testId: 'lesson-speaking' },
  { icon: BookOpen, label: 'Vocabulary Builder', prompt: 'Start an interactive vocabulary lesson. Teach me useful IELTS vocabulary with examples, then quiz me on it. Use adaptive difficulty.', testId: 'lesson-vocab' },
  { icon: PenTool, label: 'Grammar Lesson', prompt: 'Start a structured grammar lesson focused on common IELTS grammar patterns. Explain a concept, give me a task, then provide feedback. Build up difficulty.', testId: 'lesson-grammar' },
  { icon: Target, label: 'Study Plan', prompt: 'Analyze my progress and create a detailed study plan for the next week. Be specific about what I should practice each day.', testId: 'lesson-plan' },
];

const HW_ICONS = { vocabulary: BookOpen, writing: PenTool, grammar: FileText, speaking: MessageSquare };

function HomeworkCard({ hw, onSubmit, onDelete, submitting }) {
  const [answer, setAnswer] = useState('');
  const [expanded, setExpanded] = useState(false);
  const Icon = HW_ICONS[hw.type] || ClipboardList;
  const isOverdue = hw.status === 'pending' && hw.due_date && new Date(hw.due_date) < new Date();
  const statusColors = {
    pending: isOverdue ? 'text-red-500' : 'text-amber-500',
    submitted: 'text-blue-500',
    reviewed: 'text-emerald-500'
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm" data-testid={`homework-${hw.homework_id}`}>
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          hw.status === 'reviewed' ? 'bg-emerald-50' : 'bg-teal-50'
        }`}>
          {hw.status === 'reviewed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Icon className="w-5 h-5 text-teal-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800 truncate">{hw.title}</span>
            <span className={`text-[10px] font-medium ${statusColors[hw.status]}`}>
              {hw.status === 'reviewed' ? 'Reviewed' : hw.status === 'submitted' ? 'Submitted' : isOverdue ? 'Overdue' : 'Due'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span className="capitalize">{hw.type}</span>
            {hw.due_date && <span>· {new Date(hw.due_date).toLocaleDateString()}</span>}
            {hw.score != null && (
              <span className="flex items-center gap-0.5 text-amber-500"><Star className="w-3 h-3" />{hw.score}/10</span>
            )}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(hw.homework_id); }} className="text-slate-300 hover:text-red-400 p-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <p className="text-xs text-slate-600">{hw.task}</p>
          {hw.feedback && (
            <div className="bg-teal-50 rounded-lg p-2.5 text-xs text-teal-800">
              <span className="font-semibold">Liz's Feedback:</span>
              <p className="mt-1 whitespace-pre-wrap">{hw.feedback}</p>
            </div>
          )}
          {hw.status === 'pending' && (
            <div className="space-y-2">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg resize-none focus:border-teal-400 outline-none"
                rows={3}
                data-testid="homework-answer-input"
              />
              <Button
                size="sm"
                onClick={() => { onSubmit(hw.homework_id, answer); setAnswer(''); }}
                disabled={!answer.trim() || submitting}
                className="bg-teal-500 hover:bg-teal-600 text-white text-xs h-8 w-full"
                data-testid="homework-submit-btn"
              >
                {submitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Submit to Liz
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LizTeacher({ user }) {
  const navigate = useNavigate();
  const goBack = useGoBack();

  // Plan gate - learner and above can access Liz
  if (!canAccessLiz(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-white flex flex-col items-center justify-center px-4" data-testid="liz-upgrade-gate">
        <div className="max-w-md text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center mx-auto shadow-lg">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Meet Liz, Your AI Teacher</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Liz is your personal IELTS teacher who speaks to you, tracks your progress,
            assigns homework, and builds structured study plans. Available for
            <span className="font-semibold text-violet-600"> Learner</span>,
            <span className="font-semibold text-fuchsia-600"> Achiever</span>, and
            <span className="font-semibold text-orange-500"> Master</span> members.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg"
              data-testid="upgrade-btn"
            >
              Upgrade to Unlock Liz
            </Button>
            <button
              onClick={goBack}
              className="text-sm text-slate-400 hover:text-slate-600"
              data-testid="go-back-btn"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  const [status, setStatus] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [latestLiz, setLatestLiz] = useState('');
  const [voiceInsight, setVoiceInsight] = useState(null);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [lizStatus, setLizStatus] = useState(null);
  const [showSessions, setShowSessions] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showHomework, setShowHomework] = useState(false);
  const [homework, setHomework] = useState([]);
  const [submittingHw, setSubmittingHw] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);
  const [hasGreeted, setHasGreeted] = useState(false);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const transcriptEndRef = useRef(null);

  const scrollTranscript = useCallback(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollTranscript(); }, [messages, scrollTranscript]);

  // Load sessions
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/liz/sessions/${user.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setSessions(d.sessions || []); })
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/liz/status/${user.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setLizStatus(d); })
      .catch(() => {});
  }, [user?.id]);

  // Load homework
  const fetchHomework = useCallback(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/liz/homework/${user.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setHomework(d.homework || []); })
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => { fetchHomework(); }, [fetchHomework]);

  // Auto-greet on first load
  const hasGreetedRef = useRef(false);
  useEffect(() => {
    if (!user?.id || hasGreetedRef.current || hasGreeted || sessionId) return;
    hasGreetedRef.current = true;
    greetStudent();
  }, [user?.id, hasGreeted, sessionId]); // greetStudent is stable enough

  const playAudio = useCallback((base64Audio) => {
    return new Promise((resolve) => {
      try {
        const byteChars = atob(base64Audio);
        const byteArray = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
        const blob = new Blob([byteArray], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(url);
        audioRef.current = audio;
        setStatus('speaking');
        audio.onended = () => { setStatus('idle'); URL.revokeObjectURL(url); resolve(); };
        audio.onerror = () => { setStatus('idle'); resolve(); };
        audio.play().catch(() => { setStatus('idle'); resolve(); });
      } catch { setStatus('idle'); resolve(); }
    });
  }, []);

  const speakText = useCallback(async (text) => {
    if (!autoVoice) return;
    try {
      const res = await fetch(`${API_URL}/api/liz/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 500) })
      });
      const data = await res.json();
      if (data.audio) await playAudio(data.audio);
    } catch {
      setStatus('idle');
    }
  }, [autoVoice, playAudio]);

  const blobToBase64 = useCallback((blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('Could not read audio blob'));
          return;
        }
        resolve(result.split(',')[1] || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  const greetStudent = async () => {
    setHasGreeted(true);
    setStatus('thinking');
    try {
      const res = await fetch(`${API_URL}/api/liz/greet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.session_id);
        setLatestLiz(data.greeting);
        setVoiceInsight(null);
        setMessages([{ role: 'assistant', content: data.greeting, timestamp: new Date().toISOString() }]);
        if (data.audio && autoVoice) {
          await playAudio(data.audio);
        } else {
          setStatus('idle');
        }
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  };

  const sendMessage = async (text, isVoice = false, audioData = null) => {
    if (!text?.trim() || status === 'thinking' || status === 'speaking') return;
    const trimmed = text.trim();
    setMessages(prev => [...prev, { role: 'user', content: trimmed, timestamp: new Date().toISOString() }]);
    setInput('');
    setStatus('thinking');

    try {
      const res = await fetch(`${API_URL}/api/liz/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, message: trimmed, session_id: sessionId, is_voice: isVoice, audio_data: audioData, feedback_language: user.feedback_language || undefined })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionId(data.session_id);
        setLatestLiz(data.response);
        if (data.usage) {
          setLizStatus(prev => ({
            ...(prev || {}),
            ...data.usage,
            has_access: true,
          }));
        }
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date().toISOString() }]);
        // Refresh homework if new one was assigned
        if (data.homework_assigned?.length > 0) fetchHomework();
        setVoiceInsight(data.voice_pronunciation || null);
        // Auto-TTS
        await speakText(data.response);
      } else {
        setLatestLiz(data.detail || "I couldn't process that right now.");
        setStatus('idle');
      }
    } catch {
      setLatestLiz("I couldn't process that. Please try again.");
      setStatus('idle');
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size > 0) await transcribeAudio(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setStatus('listening');
    } catch { /* mic denied */ }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setStatus('transcribing');
  };

  const transcribeAudio = async (blob) => {
    setStatus('transcribing');
    try {
      const audioData = await blobToBase64(blob);
      const formData = new FormData();
      formData.append('file', blob, 'recording.webm');
      const res = await fetch(`${API_URL}/api/liz/stt`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.text?.trim()) {
        await sendMessage(data.text, true, audioData);
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  };

  const handleMicClick = () => {
    if (status === 'listening') stopRecording();
    else if (status === 'idle') startRecording();
  };

  const toggleAutoVoice = () => {
    if (audioRef.current) audioRef.current.pause();
    setAutoVoice(v => !v);
    if (status === 'speaking') setStatus('idle');
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStatus('idle');
  };

  // Homework actions
  const submitHomework = async (hwId, answer) => {
    setSubmittingHw(true);
    try {
      const res = await fetch(`${API_URL}/api/liz/homework/${hwId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, submission: answer })
      });
      const data = await res.json();
      if (data.success) {
        fetchHomework();
        if (data.feedback) {
          setLatestLiz(data.feedback);
          setMessages(prev => [...prev, { role: 'assistant', content: `Homework Review:\n\n${data.feedback}`, timestamp: new Date().toISOString() }]);
          await speakText(data.feedback);
        }
      }
    } catch { /* ignore */ }
    setSubmittingHw(false);
  };

  const deleteHomework = async (hwId) => {
    try {
      await fetch(`${API_URL}/api/liz/homework/${hwId}?user_id=${user.id}`, { method: 'DELETE' });
      setHomework(prev => prev.filter(h => h.homework_id !== hwId));
    } catch { /* ignore */ }
  };

  const requestHomework = () => {
    sendMessage('Please assign me homework based on what we covered today. Make it specific and challenging.');
  };

  const loadSession = async (sid) => {
    try {
      const res = await fetch(`${API_URL}/api/liz/history/${sid}?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        const msgs = data.messages || [];
        setMessages(msgs);
        setSessionId(sid);
        setVoiceInsight(null);
        setShowSessions(false);
        setHasGreeted(true);
        const lastLiz = [...msgs].reverse().find(m => m.role === 'assistant');
        if (lastLiz) setLatestLiz(lastLiz.content);
      }
    } catch { /* ignore */ }
  };

  const startNewSession = () => {
    setMessages([]);
    setSessionId(null);
    setLatestLiz('');
    setVoiceInsight(null);
    setShowSessions(false);
    setHasGreeted(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const isLizBusy = status === 'thinking' || status === 'speaking';
  const isUserBusy = status === 'listening' || status === 'transcribing';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/20 to-white flex flex-col" data-testid="liz-teacher-page">
      {/* CSS for audio bars */}
      <style>{`
        @keyframes audioPulse {
          0% { transform: scaleY(0.4); opacity: 0.5; }
          100% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="text-slate-400 hover:text-slate-700" data-testid="liz-back-btn">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">Liz</h1>
              <p className="text-teal-600/60 text-[10px]">Your IELTS Teacher</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lizStatus?.has_access && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                <span>{lizStatus.plan}</span>
                <span>·</span>
                <span>{lizStatus.remaining_messages ?? 0} messages left</span>
              </div>
            )}
            {/* Homework button with badge */}
            <button
              onClick={() => setShowHomework(v => !v)}
              className={`relative p-2 rounded-full transition-colors ${showHomework ? 'text-teal-600 bg-teal-50' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}
              data-testid="homework-toggle-btn"
            >
              <ClipboardList className="w-4 h-4" />
              {homework.filter(h => h.status === 'pending').length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center" data-testid="homework-badge">
                  {homework.filter(h => h.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={toggleAutoVoice}
              className={`p-2 rounded-full transition-colors ${autoVoice ? 'text-teal-600 bg-teal-50' : 'text-slate-400 bg-slate-50'}`}
              data-testid="auto-voice-toggle"
              title={autoVoice ? 'Voice On' : 'Voice Off'}
            >
              {autoVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setShowSessions(!showSessions)} className="text-slate-500 text-xs" data-testid="sessions-btn">
                History <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              {showSessions && (
                <div className="absolute right-0 top-full mt-1 w-60 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-2 max-h-60 overflow-y-auto" data-testid="sessions-dropdown">
                  <button onClick={startNewSession} className="w-full px-4 py-2 text-left text-sm hover:bg-teal-50 flex items-center gap-2 text-teal-700 font-medium" data-testid="new-session-btn">
                    <Plus className="w-4 h-4" /> New Lesson
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  {sessions.map(s => (
                    <button key={s.session_id} onClick={() => loadSession(s.session_id)} className={`w-full px-4 py-1.5 text-left text-xs hover:bg-teal-50 truncate ${sessionId === s.session_id ? 'bg-teal-50 text-teal-800' : 'text-slate-500'}`}>
                      {s.preview || 'New lesson'}
                    </button>
                  ))}
                  {sessions.length === 0 && <p className="px-4 py-2 text-[11px] text-slate-400">No previous lessons</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4 overflow-hidden">
        {/* Liz Presence */}
        <LizPresence status={status} onStop={stopSpeaking} />

        {/* Current Liz Speech */}
        <SpeechDisplay text={latestLiz} status={status} />

        {lizStatus?.has_access && (
          <div className="text-[11px] text-slate-400" data-testid="liz-usage-note">
            {lizStatus.remaining_messages ?? 0} messages remaining this month
          </div>
        )}

        {voiceInsight && (
          <div className="max-w-xl w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800" data-testid="liz-voice-insight">
            <span className="font-semibold">Voice snapshot:</span>{' '}
            Pronunciation {voiceInsight.pronunciation}/100, Fluency {voiceInsight.fluency}/100, Accuracy {voiceInsight.accuracy}/100.
          </div>
        )}

        {/* Lesson mode buttons (only on fresh start, no messages yet) */}
        {messages.length <= 1 && status === 'idle' && latestLiz && (
          <div className="flex flex-wrap justify-center gap-2 mt-2" data-testid="lesson-modes">
            {LESSON_MODES.map(m => (
              <button
                key={m.testId}
                onClick={() => sendMessage(m.prompt)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm"
                data-testid={m.testId}
              >
                <m.icon className="w-3.5 h-3.5 text-teal-500" />
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Homework Panel */}
        {showHomework && (
          <div className="w-full max-w-xl space-y-2" data-testid="homework-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-teal-500" /> My Homework
              </h3>
              {messages.length > 2 && (
                <button onClick={requestHomework} disabled={isLizBusy} className="text-[11px] text-teal-600 hover:text-teal-700 font-medium disabled:opacity-40" data-testid="request-homework-btn">
                  + Ask for homework
                </button>
              )}
            </div>
            {homework.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">No homework yet. Liz will assign tasks during lessons.</p>
            ) : (
              homework.map(hw => (
                <HomeworkCard key={hw.homework_id} hw={hw} onSubmit={submitHomework} onDelete={deleteHomework} submitting={submittingHw} />
              ))
            )}
          </div>
        )}

        {/* Transcript toggle */}
        {messages.length > 1 && (
          <button
            onClick={() => setShowTranscript(v => !v)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            data-testid="transcript-toggle"
          >
            {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showTranscript ? 'Hide' : 'Show'} conversation ({messages.length} messages)
          </button>
        )}

        {/* Transcript */}
        {showTranscript && messages.length > 0 && (
          <div className="w-full max-w-xl max-h-48 overflow-y-auto bg-white/50 border border-slate-200 rounded-xl px-4 py-2 space-y-0.5" data-testid="transcript">
            {messages.map((msg, i) => <TranscriptItem key={i} msg={msg} />)}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>

      {/* ── Input Area ── */}
      <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm px-4 py-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
          {/* Microphone - primary action */}
          <button
            onClick={handleMicClick}
            disabled={isLizBusy || status === 'transcribing'}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              status === 'listening'
                ? 'bg-red-500 text-white shadow-lg shadow-red-200/60 scale-110 animate-pulse'
                : 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-200/40 hover:scale-105 hover:shadow-xl'
            } disabled:opacity-30 disabled:scale-100`}
            data-testid="mic-btn"
          >
            {status === 'listening' ? <MicOff className="w-7 h-7" /> :
             status === 'transcribing' ? <Loader2 className="w-7 h-7 animate-spin" /> :
             <Mic className="w-7 h-7" />}
          </button>
          <p className="text-[11px] text-slate-400">
            {status === 'listening' ? 'Tap to stop recording' :
             status === 'transcribing' ? 'Processing your voice...' :
             isLizBusy ? '' : 'Tap to speak to Liz'}
          </p>

          {/* Text input - secondary */}
          <div className="w-full flex items-end gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Or type here..."
                disabled={isLizBusy || isUserBusy}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:border-teal-400 focus:ring-1 focus:ring-teal-300/50 outline-none text-sm disabled:opacity-40"
                data-testid="liz-input"
              />
            </div>
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLizBusy || isUserBusy}
              className="h-10 w-10 rounded-full bg-slate-700 hover:bg-slate-800 text-white disabled:opacity-30 shrink-0 p-0"
              data-testid="liz-send-btn"
            >
              {status === 'thinking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
