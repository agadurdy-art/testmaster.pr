import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { GraduationCap } from 'lucide-react';
import { canAccessLiz } from '../lib/lizAccess';
// 2026-04-29: LizLivePanel (Gemini Live) was removed in Phase A demolition.
// ElevenLabs Conversational Liz lives inside LizD8 — opened from the composer.
import LizD8 from '../features/liz/components/LizD8';
import '../features/speaking/speaking.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/* ── Status: idle | listening | transcribing | thinking | speaking ── */

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
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [lizStatus, setLizStatus] = useState(null);
  const [homework, setHomework] = useState([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [currentMode, setCurrentMode] = useState('default'); // latest mode from backend
  const audioRef = useRef(null);

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
        const mode = data.mode || 'default';
        setCurrentMode(mode);
        setMessages([{
          role: 'assistant',
          content: data.greeting,
          mode,
          audio: data.audio || null,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch { /* ignore */ }
    setStatus('idle');
  };

  const sendMessage = async (text) => {
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
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: data.response,
          mode,
          pronunciation_words: data.voice_pronunciation?.words || null,
          audio: data.audio || null,
          timestamp: new Date().toISOString(),
        }]);
        if (data.homework_assigned?.length > 0) fetchHomework();
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
        setHasGreeted(true);
      }
    } catch { /* ignore */ }
  };

  const startNewSession = () => {
    setMessages([]);
    setSessionId(null);
    setHasGreeted(false);
    setCurrentMode('default');
  };

  const appendLizMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
    if (msg?.mode) setCurrentMode(msg.mode);
  }, []);

  return (
    <LizD8
      user={user}
      messages={messages}
      input={input}
      setInput={setInput}
      onSend={() => sendMessage(input)}
      onSpeakMessage={speakMessage}
      sending={status === 'thinking'}
      currentMode={currentMode}
      sessions={sessions}
      lizStatus={lizStatus}
      homework={homework}
      onLoadSession={loadSession}
      onNewSession={startNewSession}
      onAssignHomework={requestHomework}
      onAppendLizMessage={appendLizMessage}
      onDeleteHomework={deleteHomework}
    />
  );
}
