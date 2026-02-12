import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  ArrowLeft, Send, Volume2, VolumeX, Plus,
  Loader2, MessageCircle, Sparkles, BookOpen,
  ChevronDown
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const EMILY_AVATAR = 'https://static.prod-images.emergentagent.com/jobs/e894c13a-7662-45ac-8c71-306f08d8705f/images/2e9f8b6f1be9800cca71fdf82d4b316c36cf04fed684416b000d4b876305e828.png';

function MessageBubble({ msg, onSpeak, speakingId }) {
  const isUser = msg.role === 'user';
  const isSpeaking = speakingId === msg.timestamp;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`} data-testid={`message-${msg.role}`}>
      {!isUser && (
        <img src={EMILY_AVATAR} alt="Emily" className="w-9 h-9 rounded-full object-cover border-2 border-amber-200 shrink-0 mt-1" />
      )}
      <div className={`max-w-[80%] ${isUser ? 'ml-auto' : ''}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-sm'
            : 'bg-white border border-amber-100 text-slate-800 rounded-tl-sm shadow-sm'
        }`}>
          {msg.content}
        </div>
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : ''}`}>
          <span className="text-[10px] text-slate-400">
            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
          {!isUser && (
            <button
              onClick={() => onSpeak(msg.content, msg.timestamp)}
              className={`text-slate-400 hover:text-amber-500 transition-colors ${isSpeaking ? 'text-amber-500' : ''}`}
              data-testid="speak-btn"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3" data-testid="emily-typing">
      <img src={EMILY_AVATAR} alt="Emily" className="w-9 h-9 rounded-full object-cover border-2 border-amber-200 shrink-0 mt-1" />
      <div className="bg-white border border-amber-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  { icon: Sparkles, text: "Give me a grammar quiz" },
  { icon: BookOpen, text: "What should I study today?" },
  { icon: MessageCircle, text: "Help me improve my vocabulary" },
];

export default function EmilyTeacher({ user }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  // Load sessions on mount
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/emily/sessions/${user.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setSessions(d.sessions || []); })
      .catch(() => {});
  }, [user?.id]);

  const loadSession = async (sid) => {
    try {
      const res = await fetch(`${API_URL}/api/emily/history/${sid}?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setSessionId(sid);
        setShowSessions(false);
      }
    } catch { /* ignore */ }
  };

  const startNewSession = () => {
    setMessages([]);
    setSessionId(null);
    setShowSessions(false);
  };

  const sendMessage = async (text) => {
    if (!text?.trim() || loading) return;
    const userMsg = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/emily/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          message: text.trim(),
          session_id: sessionId
        })
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.session_id);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I couldn't respond right now. Please try again!",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (text, msgId) => {
    if (speakingId === msgId && audioRef.current) {
      audioRef.current.pause();
      setSpeakingId(null);
      return;
    }

    try {
      setSpeakingId(msgId);
      const res = await fetch(`${API_URL}/api/emily/tts?text=${encodeURIComponent(text.substring(0, 400))}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.audio) {
        const byteChars = atob(data.audio);
        const byteArray = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
        const blob = new Blob([byteArray], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        if (audioRef.current) { audioRef.current.pause(); }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { setSpeakingId(null); URL.revokeObjectURL(url); };
        audio.play();
      }
    } catch {
      setSpeakingId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col" data-testid="emily-teacher-page">
      {/* Header */}
      <div className="border-b border-amber-200/60 bg-white/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-amber-800/60 hover:text-amber-900" data-testid="emily-back-btn">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src={EMILY_AVATAR} alt="Emily" className="w-10 h-10 rounded-full object-cover border-2 border-amber-300" />
            <div>
              <h1 className="font-bold text-amber-950 text-base">Emily</h1>
              <p className="text-amber-600/60 text-xs">Your AI English Teacher</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSessions(!showSessions)}
                className="text-amber-700/60 hover:text-amber-800 text-xs"
                data-testid="sessions-btn"
              >
                History <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </Button>
              {showSessions && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl border border-amber-200 shadow-xl z-50 py-2 max-h-60 overflow-y-auto" data-testid="sessions-dropdown">
                  <button
                    onClick={startNewSession}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-amber-50 flex items-center gap-2 text-amber-700 font-medium"
                    data-testid="new-session-btn"
                  >
                    <Plus className="w-4 h-4" /> New Conversation
                  </button>
                  <div className="border-t border-amber-100 my-1" />
                  {sessions.map(s => (
                    <button
                      key={s.session_id}
                      onClick={() => loadSession(s.session_id)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-amber-50 truncate ${
                        sessionId === s.session_id ? 'bg-amber-50 text-amber-800' : 'text-slate-600'
                      }`}
                    >
                      {s.preview || 'New conversation'}
                    </button>
                  ))}
                  {sessions.length === 0 && <p className="px-4 py-2 text-xs text-slate-400">No previous chats</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center py-12" data-testid="emily-welcome">
              <img src={EMILY_AVATAR} alt="Emily" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-amber-200 shadow-lg" />
              <h2 className="text-xl font-bold text-amber-950 mb-2">Hi, I'm Emily!</h2>
              <p className="text-amber-700/60 text-sm mb-8 max-w-md mx-auto">
                I'm your personal IELTS teacher. I can help you with grammar, vocabulary,
                practice recommendations, and even give you quizzes. Let's learn together!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.text)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-amber-200 rounded-full text-sm text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm"
                    data-testid={`quick-prompt-${i}`}
                  >
                    <p.icon className="w-4 h-4 text-amber-500" />
                    {p.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onSpeak={speakText} speakingId={speakingId} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-amber-200/60 bg-white/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message to Emily..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-2xl border border-amber-200 bg-amber-50/30 text-slate-800 placeholder-amber-400/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-300/50 outline-none text-sm resize-none"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              data-testid="emily-input"
            />
          </div>
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="h-11 w-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white disabled:opacity-30 shrink-0 p-0"
            data-testid="emily-send-btn"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
