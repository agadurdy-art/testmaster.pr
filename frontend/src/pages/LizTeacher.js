import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  ArrowLeft,
  Send,
  Volume2,
  VolumeX,
  Plus,
  Loader2,
  Mic,
  MicOff,
  MessageSquare,
  BookOpen,
  PenTool,
  Target,
  GraduationCap,
  ClipboardList,
  CheckCircle2,
  X,
  Star,
  FileText,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { canAccessLiz } from '../lib/lizAccess';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const LIZ_AVATAR = 'https://static.prod-images.emergentagent.com/jobs/799d7d0f-0425-4acb-aa13-54128002d580/images/baeb03c8118b149f97024b78f7f053e092a9d4c22d6c09656fd3a17aacf6359b.png';

/* ── Status: idle | listening | transcribing | thinking | speaking ── */

// Mode → internal tint (no badge shown to user — per project memory)
const MODE_TINT = {
  teaching:   { canvasBg: 'bg-emerald-50/40', halo: 'ring-emerald-200' },
  listening:  { canvasBg: 'bg-sky-50/40',     halo: 'ring-sky-200' },
  reviewing:  { canvasBg: 'bg-amber-50/40',   halo: 'ring-amber-200' },
  coaching:   { canvasBg: 'bg-rose-50/40',    halo: 'ring-rose-200' },
  default:    { canvasBg: 'bg-white',         halo: 'ring-slate-200' },
};

const LESSON_MODES = [
  { icon: MessageSquare, label: 'Speaking Practice', prompt: 'Start a structured IELTS Speaking practice session. Begin with Part 1 warm-up questions, then move to Part 2 cue card, and finish with Part 3 discussion. Guide me step by step.', testId: 'lesson-speaking' },
  { icon: BookOpen, label: 'Vocabulary Builder', prompt: 'Start an interactive vocabulary lesson. Teach me useful IELTS vocabulary with examples, then quiz me on it. Use adaptive difficulty.', testId: 'lesson-vocab' },
  { icon: PenTool, label: 'Grammar Lesson', prompt: 'Start a structured grammar lesson focused on common IELTS grammar patterns. Explain a concept, give me a task, then provide feedback. Build up difficulty.', testId: 'lesson-grammar' },
  { icon: Target, label: 'Study Plan', prompt: 'Analyze my progress and create a detailed study plan for the next week. Be specific about what I should practice each day.', testId: 'lesson-plan' },
];

const HW_ICONS = { vocabulary: BookOpen, writing: PenTool, grammar: FileText, speaking: MessageSquare };

// ── Pronunciation underline renderer ──
// If msg.pronunciation_words is a word-level array [{word, score, tip?}], underline weak ones with tooltips.
// Otherwise, render content as plain text.
function TeacherNote({ msg }) {
  const modeTint = MODE_TINT[msg.mode] || MODE_TINT.default;
  const hasWords = Array.isArray(msg.pronunciation_words) && msg.pronunciation_words.length > 0;

  const body = hasWords
    ? msg.pronunciation_words.map((w, i) => (
        w.score != null && w.score < 70 ? (
          <span
            key={i}
            className="underline decoration-rose-400 decoration-wavy decoration-2 underline-offset-4 cursor-help"
            title={w.tip || `Pronunciation: ${w.score}/100`}
          >
            {w.word}{' '}
          </span>
        ) : (
          <span key={i}>{w.word} </span>
        )
      ))
    : msg.content;

  return (
    <div className="flex gap-3 py-3">
      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-offset-2 ring-offset-white ${modeTint.halo}">
        <img src={LIZ_AVATAR} alt="Liz" className="w-full h-full object-cover" />
      </div>
      <div className={`flex-1 min-w-0 border-l-2 border-emerald-400 pl-4 py-1 ${modeTint.canvasBg} rounded-r-lg`}>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mb-0.5">Liz</div>
        <div className="font-serif text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          {body}
        </div>
      </div>
    </div>
  );
}

function UserNote({ msg }) {
  return (
    <div className="flex justify-end py-2">
      <div className="max-w-[80%] text-right">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">You asked</div>
        <div className="italic text-slate-600 text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
      </div>
    </div>
  );
}

function HomeworkCard({ hw, onSubmit, onDelete, submitting }) {
  const [answer, setAnswer] = useState('');
  const [expanded, setExpanded] = useState(false);
  const Icon = HW_ICONS[hw.type] || ClipboardList;
  const isOverdue = hw.status === 'pending' && hw.due_date && new Date(hw.due_date) < new Date();
  const statusColors = {
    pending: isOverdue ? 'text-red-500' : 'text-amber-500',
    submitted: 'text-blue-500',
    reviewed: 'text-emerald-500',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm" data-testid={`homework-${hw.homework_id}`}>
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${hw.status === 'reviewed' ? 'bg-emerald-50' : 'bg-teal-50'}`}>
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
              onClick={() => navigate(-1)}
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
  const [messages, setMessages] = useState([]); // each: {role, content, mode?, pronunciation_words?, timestamp, audio?}
  const [voiceInsight, setVoiceInsight] = useState(null); // scalar fallback
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [lizStatus, setLizStatus] = useState(null);
  const [homework, setHomework] = useState([]);
  const [submittingHw, setSubmittingHw] = useState(false);
  const [autoVoice, setAutoVoice] = useState(false); // opt-in per D8 spec
  const [hasGreeted, setHasGreeted] = useState(false);
  const [currentMode, setCurrentMode] = useState('default'); // latest mode from backend
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const canvasEndRef = useRef(null);

  const scrollCanvas = useCallback(() => {
    canvasEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollCanvas(); }, [messages, scrollCanvas]);

  // Load sessions
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/liz/sessions/${user.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSessions(d.sessions || []); })
      .catch(() => {});
  }, [user?.id]);

  // Load plan/quota
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/liz/status/${user.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setLizStatus(d); })
      .catch(() => {});
  }, [user?.id]);

  // Load homework
  const fetchHomework = useCallback(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/liz/homework/${user.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setHomework(d.homework || []); })
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => { fetchHomework(); }, [fetchHomework]);

  // Auto-greet on first load
  const hasGreetedRef = useRef(false);
  useEffect(() => {
    if (!user?.id || hasGreetedRef.current || hasGreeted || sessionId) return;
    hasGreetedRef.current = true;
    greetStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, hasGreeted, sessionId]);

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
      } catch {
        setStatus('idle');
        resolve();
      }
    });
  }, []);

  const ttsText = useCallback(async (text) => {
    try {
      const res = await fetch(`${API_URL}/api/liz/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 500) }),
      });
      const data = await res.json();
      if (data.audio) return data.audio;
    } catch { /* ignore */ }
    return null;
  }, []);

  const speakMessage = useCallback(async (msg) => {
    // Per-message opt-in listen. If msg has cached audio, play it; else fetch now.
    if (msg.audio) {
      await playAudio(msg.audio);
      return;
    }
    const a = await ttsText(msg.content);
    if (a) {
      msg.audio = a;
      await playAudio(a);
    }
  }, [playAudio, ttsText]);

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
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.session_id);
        setVoiceInsight(null);
        const mode = data.mode || 'default';
        setCurrentMode(mode);
        setMessages([{
          role: 'assistant',
          content: data.greeting,
          mode,
          audio: data.audio || null,
          timestamp: new Date().toISOString(),
        }]);
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
    setMessages((prev) => [...prev, { role: 'user', content: trimmed, timestamp: new Date().toISOString() }]);
    setInput('');
    setStatus('thinking');

    try {
      const res = await fetch(`${API_URL}/api/liz/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          message: trimmed,
          session_id: sessionId,
          is_voice: isVoice,
          audio_data: audioData,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionId(data.session_id);
        if (data.usage) {
          setLizStatus((prev) => ({ ...(prev || {}), ...data.usage, has_access: true }));
        }
        const mode = data.mode || 'default';
        setCurrentMode(mode);
        const pronWords = data.voice_pronunciation?.words || null;
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: data.response,
          mode,
          pronunciation_words: pronWords,
          audio: data.audio || null,
          timestamp: new Date().toISOString(),
        }]);
        if (data.homework_assigned?.length > 0) fetchHomework();
        // Voice insight (scalar fallback when no word-level data)
        setVoiceInsight(pronWords ? null : (data.voice_pronunciation || null));
        if (data.audio && autoVoice) {
          await playAudio(data.audio);
        } else {
          setStatus('idle');
        }
      } else {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: data.detail || "I couldn't process that right now.",
          mode: 'default',
          timestamp: new Date().toISOString(),
        }]);
        setStatus('idle');
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "I couldn't process that. Please try again.",
        mode: 'default',
        timestamp: new Date().toISOString(),
      }]);
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
        stream.getTracks().forEach((t) => t.stop());
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
    setAutoVoice((v) => !v);
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
        body: JSON.stringify({ user_id: user.id, submission: answer }),
      });
      const data = await res.json();
      if (data.success) {
        fetchHomework();
        if (data.feedback) {
          setMessages((prev) => [...prev, {
            role: 'assistant',
            content: `Homework Review:\n\n${data.feedback}`,
            mode: 'reviewing',
            timestamp: new Date().toISOString(),
          }]);
          setCurrentMode('reviewing');
        }
      }
    } catch { /* ignore */ }
    setSubmittingHw(false);
  };

  const deleteHomework = async (hwId) => {
    try {
      await fetch(`${API_URL}/api/liz/homework/${hwId}?user_id=${user.id}`, { method: 'DELETE' });
      setHomework((prev) => prev.filter((h) => h.homework_id !== hwId));
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
        setHasGreeted(true);
      }
    } catch { /* ignore */ }
  };

  const startNewSession = () => {
    setMessages([]);
    setSessionId(null);
    setVoiceInsight(null);
    setHasGreeted(false);
    setCurrentMode('default');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isLizBusy = status === 'thinking' || status === 'speaking';
  const isUserBusy = status === 'listening' || status === 'transcribing';
  const tint = MODE_TINT[currentMode] || MODE_TINT.default;

  const pendingHwCount = homework.filter((h) => h.status === 'pending').length;
  const isFirstTime = messages.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" data-testid="liz-teacher-page">
      <style>{`
        @keyframes audioPulse {
          0% { transform: scaleY(0.4); opacity: 0.5; }
          100% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>

      {/* ── Header ── */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700" data-testid="liz-back-btn">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-white transition ${tint.halo} ${status === 'speaking' ? 'shadow-[0_0_20px_rgba(20,184,166,0.35)]' : ''}`}>
                <img src={LIZ_AVATAR} alt="Liz" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-sm leading-none">Liz</h1>
                <p className="text-teal-600/60 text-[10px] mt-0.5">Your IELTS Teacher</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lizStatus?.has_access && lizStatus?.plan && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                <span className="capitalize">{lizStatus.plan}</span>
                <span>·</span>
                <span>{lizStatus.remaining_messages ?? 0}/{lizStatus.monthly_quota ?? '–'} msgs</span>
              </div>
            )}
            <button
              onClick={toggleAutoVoice}
              className={`p-2 rounded-full transition-colors ${autoVoice ? 'text-teal-600 bg-teal-50' : 'text-slate-400 bg-slate-50'}`}
              title={autoVoice ? 'Auto-voice on' : 'Auto-voice off'}
              data-testid="auto-voice-toggle"
            >
              {autoVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {status === 'speaking' && (
              <button onClick={stopSpeaking} className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-medium hover:bg-rose-100" data-testid="stop-speaking-btn">
                <VolumeX className="w-3.5 h-3.5 inline mr-1" /> Stop
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 3-panel body ── */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-5 p-5">
        {/* LEFT: Today with Liz — sessions list */}
        <aside className="hidden lg:block">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-[76px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Today with Liz
              </h3>
              <button onClick={startNewSession} className="text-teal-600 hover:text-teal-700" title="New lesson" data-testid="new-session-btn">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-[60vh] overflow-y-auto">
              {sessions.length === 0 && (
                <p className="text-[11px] text-slate-400 py-2">Your lessons will appear here.</p>
              )}
              {sessions.map((s) => (
                <button
                  key={s.session_id}
                  onClick={() => loadSession(s.session_id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                    sessionId === s.session_id ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate">{s.preview || 'New lesson'}</div>
                  {s.created_at && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(s.created_at).toLocaleDateString()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER: Conversation canvas */}
        <section className={`rounded-xl border border-slate-200 ${tint.canvasBg} transition-colors flex flex-col min-h-[70vh]`}>
          <div className="flex-1 overflow-y-auto p-6">
            {isFirstTime ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-emerald-100 shadow-lg mb-5">
                  <img src={LIZ_AVATAR} alt="Liz" className="w-full h-full object-cover" />
                </div>
                <h2 className="font-serif text-2xl text-slate-900 mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                  Welcome. Let's work together.
                </h2>
                <p className="text-slate-500 text-sm max-w-md mb-6">
                  Speak, type, or pick a lesson below. I'll remember where we leave off.
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                  {LESSON_MODES.map((m) => (
                    <button
                      key={m.testId}
                      onClick={() => sendMessage(m.prompt)}
                      disabled={isLizBusy}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm disabled:opacity-40"
                      data-testid={m.testId}
                    >
                      <m.icon className="w-3.5 h-3.5 text-teal-500" />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                {messages.map((msg, i) => (
                  <div key={i}>
                    {msg.role === 'user' ? (
                      <UserNote msg={msg} />
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <TeacherNote msg={msg} />
                        </div>
                        {/* ▶ Listen button (opt-in per message) */}
                        <button
                          onClick={() => speakMessage(msg)}
                          disabled={isLizBusy}
                          className="mt-3 text-slate-400 hover:text-emerald-600 p-1 rounded-full hover:bg-emerald-50 transition disabled:opacity-30"
                          title="Listen"
                        >
                          <PlayCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {status === 'thinking' && (
                  <div className="flex items-center gap-2 py-4 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Liz is thinking…
                  </div>
                )}
                <div ref={canvasEndRef} />
              </div>
            )}
          </div>

          {/* Scalar voice insight fallback (only if no word-level data in last message) */}
          {voiceInsight && (
            <div className="mx-6 mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800" data-testid="liz-voice-insight">
              <span className="font-semibold">Voice snapshot:</span>{' '}
              Pronunciation {voiceInsight.pronunciation}/100, Fluency {voiceInsight.fluency}/100, Accuracy {voiceInsight.accuracy}/100.
            </div>
          )}

          {/* ── Input bar ── */}
          <div className="border-t border-slate-200 bg-white/60 p-4">
            <div className="max-w-3xl mx-auto flex items-end gap-3">
              <button
                onClick={handleMicClick}
                disabled={isLizBusy || status === 'transcribing'}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  status === 'listening'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-200/60 scale-110 animate-pulse'
                    : 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-200/40 hover:scale-105 hover:shadow-xl'
                } disabled:opacity-30 disabled:scale-100`}
                data-testid="mic-btn"
              >
                {status === 'listening' ? <MicOff className="w-5 h-5" /> :
                 status === 'transcribing' ? <Loader2 className="w-5 h-5 animate-spin" /> :
                 <Mic className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={status === 'listening' ? 'Listening…' : status === 'transcribing' ? 'Processing…' : 'Type or tap the mic'}
                disabled={isLizBusy || isUserBusy}
                className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-teal-400 focus:ring-1 focus:ring-teal-300/50 outline-none text-sm disabled:opacity-40"
                data-testid="liz-input"
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLizBusy || isUserBusy}
                className="h-11 w-11 rounded-full bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-30 shrink-0 p-0"
                data-testid="liz-send-btn"
              >
                {status === 'thinking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </section>

        {/* RIGHT: Liz remembers + quick actions */}
        <aside className="hidden lg:block">
          <div className="sticky top-[76px] space-y-3">
            {/* Liz remembers — summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-2">Liz remembers</h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {lizStatus?.target_band != null && (
                  <li>Target band: <b className="text-slate-900">{lizStatus.target_band}</b></li>
                )}
                {messages.length > 0 && <li>{messages.length} messages this session</li>}
                {pendingHwCount > 0 && <li>{pendingHwCount} homework item{pendingHwCount === 1 ? '' : 's'} pending</li>}
                {currentMode !== 'default' && (
                  <li className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Mode: {currentMode}
                  </li>
                )}
              </ul>
            </div>

            {/* Homework */}
            <div className="bg-white rounded-xl border border-slate-200 p-4" data-testid="homework-panel">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-teal-500" /> Homework
                  {pendingHwCount > 0 && (
                    <span className="ml-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full grid place-items-center" data-testid="homework-badge">
                      {pendingHwCount}
                    </span>
                  )}
                </h3>
                {messages.length > 2 && (
                  <button onClick={requestHomework} disabled={isLizBusy} className="text-[11px] text-teal-600 hover:text-teal-700 font-medium disabled:opacity-40" data-testid="request-homework-btn">
                    + Ask
                  </button>
                )}
              </div>
              {homework.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No homework yet.</p>
              ) : (
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {homework.map((hw) => (
                    <HomeworkCard key={hw.homework_id} hw={hw} onSubmit={submitHomework} onDelete={deleteHomework} submitting={submittingHw} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-2">Quick actions</h3>
              <div className="space-y-1.5">
                {LESSON_MODES.slice(0, 3).map((m) => (
                  <button
                    key={m.testId}
                    onClick={() => sendMessage(m.prompt)}
                    disabled={isLizBusy}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-slate-600 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition disabled:opacity-40"
                  >
                    <m.icon className="w-3.5 h-3.5 text-teal-500" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
