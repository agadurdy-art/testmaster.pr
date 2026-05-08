import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  GraduationCap, MessageSquare, BookOpen, PenTool, Target,
  ClipboardList, FileText,
} from 'lucide-react';
import { canAccessLiz } from '../lib/lizAccess';
// 2026-04-29: LizLivePanel (Gemini Live) was removed in Phase A demolition.
// ElevenLabs Conversational Liz lives inside LizD8 — opened from the composer.
import LizD8 from '../features/liz/components/LizD8';
import AppShellNav from '../components/appshell/AppShellNav';
import '../features/speaking/speaking.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/* ── Status: idle | listening | transcribing | thinking | speaking ── */

// First-time welcome screen lesson chips. Each chip seeds the conversation
// with a teacher-written prompt so a brand-new user has a guided entry point.
const LESSON_MODES = [
  { icon: MessageSquare, label: 'Speaking Practice', prompt: 'Start a structured IELTS Speaking practice session. Begin with Part 1 warm-up questions, then move to Part 2 cue card, and finish with Part 3 discussion. Guide me step by step.', testId: 'lesson-speaking' },
  { icon: BookOpen, label: 'Vocabulary Builder', prompt: 'Start an interactive vocabulary lesson. Teach me useful IELTS vocabulary with examples, then quiz me on it. Use adaptive difficulty.', testId: 'lesson-vocab' },
  { icon: PenTool, label: 'Grammar Lesson', prompt: 'Start a structured grammar lesson focused on common IELTS grammar patterns. Explain a concept, give me a task, then provide feedback. Build up difficulty.', testId: 'lesson-grammar' },
  { icon: Target, label: 'Study Plan', prompt: 'Analyze my progress and create a detailed study plan for the next week. Be specific about what I should practice each day.', testId: 'lesson-plan' },
];

const HW_ICONS = { vocabulary: BookOpen, writing: PenTool, grammar: FileText, speaking: MessageSquare, default: ClipboardList };

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
            assigns homework, and builds structured study plans. Available on
            <span className="font-semibold text-teal-600"> Weekly</span>,
            <span className="font-semibold text-emerald-600"> Monthly</span>, and
            <span className="font-semibold text-violet-600"> Exam Pack</span> plans.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/pricing/v2')}
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
  const [voiceInsight, setVoiceInsight] = useState(null); // scalar fallback when no word-level pronunciation
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [lizStatus, setLizStatus] = useState(null);
  const [homework, setHomework] = useState([]);
  const [submittingHw, setSubmittingHw] = useState(false);
  const [autoVoice, setAutoVoice] = useState(false); // opt-in: every Liz reply auto-plays
  const [hasGreeted, setHasGreeted] = useState(false);
  const [currentMode, setCurrentMode] = useState('default'); // latest mode from backend
  const [recentAttempts, setRecentAttempts] = useState([]); // /api/progress/{id} → recent_attempts
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

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

  // Load recent attempts so Liz can pull up the user's most recent
  // speaking/writing review on demand from QuickActionsCard.
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/progress/${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        const list = (d && (d.recent_attempts || d.attempts)) || [];
        setRecentAttempts(Array.isArray(list) ? list : []);
      })
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

  // Deep-link from the Writing Evaluator's "Recommended Lesson" card. After
  // the greet lands we auto-send a message asking Liz to walk through the
  // suggested lesson — keeps the user inside Liz instead of jumping them to a
  // course landing page that lost their evaluation context.
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonHandoffRef = useRef(false);
  useEffect(() => {
    if (lessonHandoffRef.current) return;
    const source = searchParams.get('source');
    if (source !== 'writing-eval') return;
    if (!sessionId) return; // wait for greet to seed the session
    lessonHandoffRef.current = true;
    const title = searchParams.get('title') || 'the recommended lesson';
    const reason = searchParams.get('reason') || '';
    const stage = searchParams.get('stage') || '';
    const lessonId = searchParams.get('lesson_id') || '';
    const prompt =
      `I just finished a writing evaluation and you recommended I work on "${title}"` +
      (reason ? ` because ${reason}` : '') +
      (stage ? ` (stage: ${stage})` : '') +
      `. Can we go through it together right now? Start with the key idea, then give me one short worked example, then a 30-second exercise I can do here in chat.` +
      (lessonId ? `\n\n(lesson_id: ${lessonId})` : '');
    // Strip the deep-link params so a refresh doesn't replay the message.
    const next = new URLSearchParams(searchParams);
    ['source', 'lesson_id', 'title', 'reason', 'stage'].forEach((k) => next.delete(k));
    setSearchParams(next, { replace: true });
    sendMessage(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, searchParams]);

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
    // Toggle: if Liz is currently speaking, second click stops her.
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setStatus('idle');
      return;
    }
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
          return;
        }
      }
    } catch { /* ignore */ }
    setStatus('idle');
  };

  const sendMessage = async (text, isVoice = false, audioData = null) => {
    if (!text?.trim() || status === 'thinking') return;
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
          return;
        }
      } else {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: data.detail || "I couldn't process that right now.",
          mode: 'default',
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "I couldn't process that. Please try again.",
        mode: 'default',
        timestamp: new Date().toISOString(),
      }]);
    }
    setStatus('idle');
  };

  // Voice recording (per-turn dictation, NOT live conversation)
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

  const appendLizMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
    if (msg?.mode) setCurrentMode(msg.mode);
  }, []);

  const handleLessonPick = (prompt) => sendMessage(prompt);

  return (
    <div className="appshell-page">
      <AppShellNav currentPage="liz" user={user} lizStatus={lizStatus} />
      <LizD8
        user={user}
        messages={messages}
        input={input}
        setInput={setInput}
        onSend={() => sendMessage(input)}
        onSpeakMessage={speakMessage}
        sending={status === 'thinking'}
        status={status}
        currentMode={currentMode}
        sessions={sessions}
        lizStatus={lizStatus}
        homework={homework}
        onLoadSession={loadSession}
        onNewSession={startNewSession}
        onAssignHomework={requestHomework}
        onAppendLizMessage={appendLizMessage}
        onDeleteHomework={deleteHomework}
        onSubmitHomework={submitHomework}
        submittingHw={submittingHw}
        onMicClick={handleMicClick}
        autoVoice={autoVoice}
        onToggleAutoVoice={toggleAutoVoice}
        onStopSpeaking={stopSpeaking}
        voiceInsight={voiceInsight}
        lessonModes={LESSON_MODES}
        onPickLesson={handleLessonPick}
        hwIcons={HW_ICONS}
        recentAttempts={recentAttempts}
      />
    </div>
  );
}
