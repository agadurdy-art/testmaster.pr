import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Play } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { stripMeta } from '../lib/normalize';
import FormattedQuestion from './FormattedQuestion';
import SkipButton from './SkipButton';

// ═══════ LISTENING ACTIVITY ═══════
// Aga 2026-05-21: real IELTS-prep technique — student previews ALL questions
// BEFORE listening so they know what to listen for. So we render every Q at
// once with its own option buttons, instead of one-at-a-time.
function ListeningActivity({ activity, onComplete, onSkip }) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  // answers: keyed by question index, value = picked option
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  // Audio player state — full transport bar for listening surfaces
  // (Aga 2026-05-21: gelişmiş audio player olsun).
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const rawQuestions = activity?.questions || [];
  const questions = rawQuestions.map(q => q ? ({
    ...q,
    question: stripMeta(q.question),
    question_text: stripMeta(q.question_text),
    options: Array.isArray(q.options) ? q.options.map(stripMeta) : q.options,
  }) : q);
  const transcript = stripMeta(activity?.transcript || activity?.audio_script || activity?.audio_text || '');
  const audioRef = useRef(null);

  // Cleanup audio on unmount or activity change
  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.85;
    u.onend = () => setIsPlaying(false);
    speechSynthesis.speak(u);
    setIsPlaying(true);
  };

  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current;
    const audioUrl = activity?.audio_url;
    if (!audioUrl) return null;
    const fullUrl = audioUrl.startsWith('/') ? `${process.env.REACT_APP_BACKEND_URL}/api${audioUrl}` : audioUrl;
    const audio = new Audio();
    // Backend serves /api/static/audio/... as a 307 redirect to a Cloudflare
    // R2 URL. Safari + Chrome HTMLAudioElement can stall on a cross-origin
    // redirect without an explicit CORS hint. Set crossOrigin BEFORE src,
    // then assign src so the request is built with the right CORS mode
    // (Aga 2026-05-21: 'player play/stop iyi calismiyor, start vermiyor').
    audio.crossOrigin = 'anonymous';
    audio.src = fullUrl;
    audio.preload = 'auto';
    audio.playbackRate = playbackRate;
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration || 0));
    audio.addEventListener('timeupdate', () => setPosition(audio.currentTime || 0));
    audio.addEventListener('ended', () => { setIsPlaying(false); setPosition(audio.duration || 0); });
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('error', (e) => {
      // Surface load errors to the console so we can debug; fall back to TTS
      // on toggle if play() rejects.
      console.warn('[listening] audio load error', fullUrl, audio.error?.code, e);
    });
    audioRef.current = audio;
    return audio;
  };

  const playListeningAudio = () => {
    speechSynthesis.cancel();
    const audio = ensureAudio();
    if (audio) {
      const p = audio.play();
      if (p && p.catch) p.catch((err) => {
        console.warn('[listening] play() rejected', err);
        speakText(transcript);
      });
    } else {
      speakText(transcript);
    }
    setHasPlayed(true);
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) { playListeningAudio(); return; }
    if (audio.paused || audio.ended) {
      if (audio.ended) audio.currentTime = 0;
      // play() returns a Promise on modern browsers. If it rejects (autoplay
      // policy, cross-origin redirect stall, decode error) fall back to TTS
      // so the user is not stuck staring at a dead button.
      const p = audio.play();
      if (p && p.catch) p.catch((err) => {
        console.warn('[listening] toggle play() rejected', err);
        speakText(transcript);
      });
    } else {
      audio.pause();
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setPosition(audio.currentTime);
  };

  const skipBack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 5);
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 0.85, 0.75, 1.25];
    const idx = rates.indexOf(playbackRate);
    const next = rates[(idx + 1) % rates.length] || 1;
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const fmt = (s) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const matchesCorrect = (option, correctAns) => {
    if (correctAns == null || option == null) return false;
    const opt = String(option).toLowerCase().trim();
    if (Array.isArray(correctAns)) return correctAns.some(a => String(a).toLowerCase().trim() === opt);
    return opt === String(correctAns).toLowerCase().trim();
  };

  // Synthesise option set for Yes/No / numeric Qs that arrive without
  // explicit options. Keeps preview fully interactive.
  const optionsFor = (q) => {
    if (q.options && q.options.length) return q.options;
    const ans = String(q.answer || q.correct_answer || '').toLowerCase();
    if (ans === 'yes' || ans === 'no') return ['Yes', 'No'];
    const NUMS = ['one','two','three','four','five','six','seven','eight','nine','ten','1','2','3','4','5'];
    if (NUMS.includes(ans)) {
      return ['one','two','three','four','five'].filter(x => x !== ans).slice(0, 3).concat([ans]);
    }
    return [ans, 'yes', 'no'].filter((v, i, a) => v && a.indexOf(v) === i);
  };

  const handlePick = (qIdx, option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    let correct = 0;
    questions.forEach((q, i) => {
      const correctAns = q?.correct_answer || q?.answer;
      if (matchesCorrect(answers[i], correctAns)) correct += 1;
    });
    const pct = questions.length ? Math.round((correct / questions.length) * 100) : 100;
    // small reveal pause so kids see right/wrong colours before navigating on
    setTimeout(() => onComplete(pct), 1800);
  };

  const allAnswered = questions.length > 0 && questions.every((_, i) => answers[i] != null);

  // Full audio player — transport controls + seek bar + rate + skip-back.
  // Aga 2026-05-21: all listening surfaces should ship a real player, not
  // a single "Play" button.
  const progressPct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
  const AudioBar = () => (
    <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlayPause}
          data-testid="listening-play-btn"
          className="w-11 h-11 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center shadow shrink-0 transition"
          aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? (
            <span className="flex gap-0.5"><span className="w-1.5 h-4 bg-white rounded-sm" /><span className="w-1.5 h-4 bg-white rounded-sm" /></span>
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
        <button
          onClick={skipBack}
          disabled={!audioRef.current}
          className="w-9 h-9 rounded-full bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-100 flex items-center justify-center text-xs font-semibold shrink-0 disabled:opacity-40"
          title="Skip back 5 seconds"
          data-testid="listening-skip-back-btn">
          ‹5s
        </button>
        <div className="flex-1 min-w-0">
          <div
            onClick={handleSeek}
            className="relative w-full h-2 bg-cyan-100 rounded-full overflow-hidden cursor-pointer"
            role="slider"
            aria-valuenow={position}
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            data-testid="listening-seekbar">
            <div className="absolute inset-y-0 left-0 bg-cyan-600 rounded-full transition-[width] duration-150" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] tabular-nums text-cyan-800">
            <span>{fmt(position)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
        <button
          onClick={cyclePlaybackRate}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-full bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-100 shrink-0 tabular-nums"
          title="Playback speed"
          data-testid="listening-speed-btn">
          {playbackRate}×
        </button>
      </div>
      <div className="flex items-center justify-between text-xs text-cyan-800">
        <span>{hasPlayed ? 'Replay as many times as you need.' : 'Press play to start.'}</span>
        <button className="underline" onClick={() => setShowTranscript(!showTranscript)}>
          {showTranscript ? 'Hide' : 'Show'} script
        </button>
      </div>
    </div>
  );

  return (
    <div data-testid="listening-activity">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-cyan-100 text-cyan-700 border-0"><Headphones className="w-3 h-3 mr-1" /> Listening</Badge>
        <SkipButton onSkip={onSkip} />
      </div>

      <Card className="p-6 max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Listen carefully</h3>
            <p className="text-xs text-gray-500">Replay as many times as you need.</p>
          </div>
        </div>

        {/* The scene line tells the child who is talking and where, before
            they press play — the authors write one for every recording. */}
        {(activity?.scene_description || activity?.scene) && (
          <p className="text-sm text-cyan-900 bg-cyan-50 border border-cyan-100 rounded-xl px-3 py-2">
            {stripMeta(activity.scene_description || activity.scene)}
          </p>
        )}

        <AudioBar />
        {showTranscript && transcript && (
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-line">{transcript}</div>
        )}

        {questions.length === 0 ? (
          <div className="text-center pt-2">
            <Button onClick={() => onComplete(100)}>Continue</Button>
          </div>
        ) : (
          <div className="pt-2 border-t border-gray-100 space-y-5">
            <p className="text-xs text-cyan-700 font-semibold">
              Read all {questions.length} questions first — then listen and answer.
            </p>
            {questions.map((q, qIdx) => {
              if (!q) return null;
              const correctAns = q.correct_answer || q.answer;
              const picked = answers[qIdx];
              const opts = optionsFor(q);
              return (
                <div key={qIdx} className="rounded-2xl border border-gray-100 p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-cyan-700">Q{qIdx + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3"><FormattedQuestion text={q.question || q.question_text} /></h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opts.map(option => {
                      const isSelected = picked === option;
                      const isCorrect = matchesCorrect(option, correctAns);
                      let cls = 'border-gray-200 hover:border-cyan-300';
                      if (submitted) {
                        if (isCorrect) cls = 'border-green-500 bg-green-50 text-green-800';
                        else if (isSelected) cls = 'border-red-500 bg-red-50 text-red-800';
                        else cls = 'border-gray-200 opacity-50';
                      } else if (isSelected) {
                        cls = 'border-cyan-500 bg-cyan-50';
                      }
                      return (
                        <button key={option}
                          className={`p-3 rounded-xl text-left border-2 transition-all text-sm font-medium capitalize ${cls}`}
                          onClick={() => handlePick(qIdx, option)} disabled={submitted}
                          data-testid={`listening-q${qIdx}-option-${option}`}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="flex justify-end pt-2">
              <Button onClick={handleSubmit} disabled={submitted || !allAnswered}>
                {submitted ? 'Submitting…' : (allAnswered ? 'Submit answers' : `Answer all ${questions.length} questions`)}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ListeningActivity;
