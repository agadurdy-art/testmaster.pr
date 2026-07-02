import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, CheckCircle, Volume2, Mic, Square, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import { API_URL } from '../lib/constants';
import SkipButton from './SkipButton';

// ═══════ VOCABULARY MODULE (iSmart-style with Record & Check) ═══════
function VocabularyModule({ activity, onComplete, onSkip }) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [recording, setRecording] = useState(false);
  const [pronResult, setPronResult] = useState(null);
  const [pronLoading, setPronLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const vocabAudioRef = useRef(null);

  // Handle both normal words and review_words (string array)
  const rawWords = activity?.words || [];
  const reviewWords = activity?.review_words || [];
  const words = rawWords.length > 0 ? rawWords : reviewWords.map(w => ({ word: w, ipa: '', definition: '', example: '', image_emoji: '' }));
  const isReview = activity?.is_review === true && rawWords.length === 0;
  const w = words[idx];

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (vocabAudioRef.current) { vocabAudioRef.current.pause(); vocabAudioRef.current = null; }
      speechSynthesis.cancel();
    };
  }, []);

  const speakWord = (text) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.8; speechSynthesis.speak(u);
  };

  const playAudioUrl = (url) => {
    if (!url) return false;
    // Stop previous
    if (vocabAudioRef.current) { vocabAudioRef.current.pause(); }
    speechSynthesis.cancel();
    const fullUrl = url.startsWith('/') ? `${API_URL}/api${url}` : url;
    const audio = new Audio(fullUrl);
    vocabAudioRef.current = audio;
    audio.play().catch(() => {});
    return true;
  };

  const playWordAudio = () => {
    if (w?.audio_url && playAudioUrl(w.audio_url)) return;
    speakWord(w?.word || '');
  };

  const playExampleAudio = () => {
    if (w?.example_audio_url && playAudioUrl(w.example_audio_url)) return;
    speakWord(w?.example_sentence || w?.example || '');
  };

  const check = () => {
    const ok = input.toLowerCase().trim() === w.word.toLowerCase();
    setFeedback(ok ? 'correct' : 'wrong');
    // Use word string instead of word_id since content may not have word_id
    if (ok && !done.includes(w.word)) setDone([...done, w.word]);
  };

  const next = () => {
    setFeedback(null); setInput(''); setPronResult(null);
    if (idx < words.length - 1) setIdx(idx + 1);
    else onComplete(Math.round((done.length / words.length) * 100));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await checkPronunciation(blob);
      };
      mediaRecorder.start();
      setRecording(true);
      setPronResult(null);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const checkPronunciation = async (blob) => {
    setPronLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('target_word', w.word);
      if (w.example_sentence || w.example) formData.append('target_sentence', w.example_sentence || w.example);
      const res = await fetch(`${API_URL}/api/unified/pronunciation/check`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPronResult(data);
      // Use word string instead of word_id
      if (data.is_correct && !done.includes(w.word)) setDone(prev => [...prev, w.word]);
    } catch {
      toast.error('Pronunciation check failed. Try again.');
    } finally {
      setPronLoading(false);
    }
  };

  if (!w) return <div className="text-center text-gray-500 py-12">No vocabulary data</div>;

  // Review mode: show word grid for quick review
  if (isReview) {
    return (
      <div data-testid="vocabulary-review-module" className="space-y-4">
        <h3 className="text-lg font-bold text-center">Vocabulary Review</h3>
        <p className="text-sm text-gray-500 text-center">Review all words from this unit</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {words.map((word, i) => (
            <button key={i} onClick={() => {
              if (word.audio_url) {
                const fullUrl = word.audio_url.startsWith('/') ? `${API_URL}/api${word.audio_url}` : word.audio_url;
                new Audio(fullUrl).play().catch(() => speakWord(word.word));
              } else { speakWord(word.word); }
            }} className="p-3 bg-white rounded-xl border-2 border-gray-100 hover:border-amber-300 hover:shadow-md transition-all text-center cursor-pointer" data-testid={`review-word-${i}`}>
              {word.image_url ? (
                <>
                  <img
                    src={word.image_url.startsWith('/') ? `${API_URL}/api${word.image_url}` : word.image_url}
                    alt={word.word}
                    className="w-16 h-16 object-cover rounded-lg mx-auto mb-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const sib = e.currentTarget.nextElementSibling;
                      if (sib) sib.style.display = 'block';
                    }}
                  />
                  <span className="text-2xl block mb-1" style={{ display: 'none' }}>{word.image_emoji || '📝'}</span>
                </>
              ) : (
                <span className="text-2xl block mb-1">{word.image_emoji || '📝'}</span>
              )}
              <span className="font-bold text-gray-800">{word.word}</span>
            </button>
          ))}
        </div>
        <div className="text-center pt-4">
          <Button onClick={() => onComplete(100)} data-testid="review-vocab-continue-btn">
            <CheckCircle className="w-4 h-4 mr-2" /> Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="vocabulary-module">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-blue-100 text-blue-700 border-0"><BookOpen className="w-3 h-3 mr-1" /> Vocabulary</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Word {idx + 1} of {words.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={(idx / words.length) * 100} className="mb-6" />

      <div className="flex gap-5">
        {/* Word sidebar */}
        <div className="w-48 bg-white rounded-2xl border border-gray-100 p-3 hidden md:block shadow-sm">
          <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider px-1">Words</h4>
          {words.map((word, i) => (
            <button key={word.word || i} onClick={() => { if (done.includes(word.word) || i === idx) { setIdx(i); setFeedback(null); setInput(''); setPronResult(null); } }}
              className={`w-full flex items-center gap-2 py-2 px-2.5 text-sm rounded-lg mb-1 transition-all text-left ${
                i === idx ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' :
                done.includes(word.word) ? 'text-green-600 hover:bg-green-50' : 'text-gray-400'
              }`}>
              {done.includes(word.word) ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> :
               i === idx ? <div className="w-4 h-4 rounded-full bg-blue-500 shrink-0" /> :
               <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />}
              <span className="truncate">{word.word}</span>
            </button>
          ))}
        </div>

        {/* Main card - iSmart style */}
        <div className="flex-1 space-y-4">
          <Card className="p-6 bg-white shadow-sm">
            {/* Word display with image area */}
            <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
              {w.image_url ? (
                <div className="w-36 h-36 rounded-2xl overflow-hidden border border-blue-100 shadow-sm shrink-0 relative bg-gradient-to-br from-sky-100 to-blue-50 flex items-center justify-center">
                  <img
                    src={w.image_url.startsWith('/') ? `${API_URL}/api${w.image_url}` : w.image_url}
                    alt={w.word}
                    className="w-full h-full object-contain absolute inset-0 p-2"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const sib = e.currentTarget.nextElementSibling;
                      if (sib) sib.style.display = 'flex';
                    }}
                  />
                  <span className="text-5xl absolute inset-0 items-center justify-center" style={{ display: 'none' }}>{w.image_emoji || '📖'}</span>
                </div>
              ) : (
                <div className="w-36 h-36 bg-gradient-to-br from-sky-100 to-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shrink-0">
                  <span className="text-5xl">{w.image_emoji || '📖'}</span>
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-1" data-testid="current-word">{w.word}</h2>
                <button className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 mb-2 text-base" onClick={playWordAudio}>
                  <Volume2 className="w-5 h-5" /><span className="font-medium">{w.ipa}</span>
                </button>
                <p className="text-gray-600 text-base">{w.definition}</p>
              </div>
            </div>

            {/* Example sentence */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex-1">
                <p className="text-gray-700 italic text-lg">"{w.example_sentence || w.example}"</p>
              </div>
              <button className="shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors" onClick={playExampleAudio} data-testid="vocab-listen-sentence-btn">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Type the word */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block">Re-enter the vocabulary:</label>
              <div className="flex gap-2 items-center">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !feedback && input.trim() && check()}
                  className={`flex-1 px-4 py-3 text-lg border-2 rounded-xl focus:outline-none transition-colors ${
                    feedback === 'correct' ? 'border-green-500 bg-green-50' :
                    feedback === 'wrong' ? 'border-red-500 bg-red-50' :
                    'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="Type here..." disabled={!!feedback} autoFocus data-testid="vocab-input" />
                {!feedback && <Button onClick={check} disabled={!input.trim()} className="h-12 px-5" data-testid="vocab-check-btn">Check</Button>}
              </div>
              {feedback && <div className={`text-sm font-semibold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{feedback === 'correct' ? 'Correct!' : `The answer is: ${w.word}`}</div>}
            </div>
          </Card>

          {/* Record & Check card */}
          <Card className="p-5 bg-white shadow-sm" data-testid="vocab-record-card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700">Pronunciation Check</h4>
              <span className="text-xs text-gray-400">Say the word clearly</span>
            </div>

            <div className="flex flex-col items-center gap-4">
              {/* Record button */}
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={pronLoading}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  recording ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' :
                  pronLoading ? 'bg-gray-300 cursor-wait' :
                  'bg-blue-500 hover:bg-blue-600 hover:scale-105'
                } text-white`}
                data-testid="vocab-record-btn"
              >
                {pronLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                 recording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <span className={`text-sm font-medium ${recording ? 'text-red-600' : 'text-gray-500'}`}>
                {pronLoading ? 'Checking...' : recording ? 'Recording... Click to stop' : 'Tap to record'}
              </span>

              {/* Pronunciation result */}
              {pronResult && (
                <div className={`w-full p-4 rounded-xl text-center ${pronResult.is_correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`} data-testid="vocab-pron-result">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {pronResult.is_correct ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                    <span className={`font-bold ${pronResult.is_correct ? 'text-green-700' : 'text-red-700'}`}>{pronResult.feedback}</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="text-center">
                      <span className="text-2xl font-bold" style={{ color: pronResult.similarity_score >= 70 ? '#16a34a' : '#dc2626' }}>{pronResult.similarity_score}%</span>
                      <p className="text-xs text-gray-500">Accuracy</p>
                    </div>
                    {pronResult.transcribed_text && (
                      <div className="text-center">
                        <span className="text-sm text-gray-700 font-medium">"{pronResult.transcribed_text}"</span>
                        <p className="text-xs text-gray-500">What we heard</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Next button */}
          {feedback && (
            <div className="flex justify-end">
              <Button onClick={next} className="px-6" data-testid="vocab-next-btn">{idx < words.length - 1 ? 'Next Word' : 'Complete'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VocabularyModule;
