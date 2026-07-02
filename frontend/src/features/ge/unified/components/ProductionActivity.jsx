import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Sparkles, RotateCcw, ChevronRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { speakOnce } from '../../../../hooks/useLizVoice';
import { stripMeta } from '../lib/normalize';
import SkipButton from './SkipButton';

// ═══════ PRODUCTION (Speaking/Writing) ═══════
function ProductionActivity({ activity, onComplete, onSkip, lessonContext }) {
  // Support multiple prompts (new) or single prompt (legacy)
  // `prompts` from Sonnet may be array of strings (scaffold ladder) — render
  // those as separate scaffold hints rather than treating them like prompt
  // objects. The top-level `activity.prompt` is the main task.
  const rawPrompts = activity?.prompts;
  const scaffoldStrings = Array.isArray(rawPrompts) && rawPrompts.every(p => typeof p === 'string')
    ? rawPrompts : null;
  const prompts = scaffoldStrings ? [
    { prompt: activity?.prompt || 'Practice speaking', expected_text: activity?.expected_text || activity?.example_response || '' }
  ] : (rawPrompts || [
    { prompt: activity?.prompt || 'Practice speaking', expected_text: activity?.expected_text || activity?.example_response || '' }
  ]);
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [promptScores, setPromptScores] = useState([]);
  const [phase, setPhase] = useState('ready'); // ready, recording, processing, result
  const [transcription, setTranscription] = useState('');
  const [browserTranscript, setBrowserTranscript] = useState('');
  const [score, setScore] = useState(0);
  const [matchedWords, setMatchedWords] = useState([]);
  const [missingWords, setMissingWords] = useState([]);
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const currentPrompt = prompts[currentPromptIdx] || prompts[0];
  const expectedText = stripMeta(currentPrompt?.expected_text || '');
  const promptText = stripMeta(currentPrompt?.prompt || 'Practice speaking');
  const isWriting = activity?.production_type === 'writing';

  // Writing mode fallback
  const [writtenResponse, setWrittenResponse] = useState('');

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const startRecording = async () => {
    setError('');
    setTranscription('');
    setBrowserTranscript('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.start();
      setPhase('recording');
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);

      // Browser SpeechRecognition for live feedback
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const recognition = new SR();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.onresult = (e) => {
          let t = '';
          for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
          setBrowserTranscript(t);
        };
        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permission in your browser settings.');
      setPhase('ready');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') { resolve(null); return; }
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        recorder.stream?.getTracks().forEach(t => t.stop());
        resolve(blob);
      };
      recorder.stop();
    });
  };

  const handleStopAndEvaluate = async () => {
    setPhase('processing');
    const blob = await stopRecording();
    if (!blob || blob.size < 1000) {
      // Too short, use browser transcript
      if (browserTranscript.trim()) {
        evaluateLocally(browserTranscript);
      } else {
        setError('Recording too short. Please try again.');
        setPhase('ready');
      }
      return;
    }

    // Send to Whisper
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('expected_text', expectedText);
      formData.append('prompt_text', promptText);

      const res = await fetch(`${API_URL}/api/speech/evaluate`, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error && !data.transcription) {
        // Whisper failed, use browser transcript as fallback
        if (browserTranscript.trim()) {
          evaluateLocally(browserTranscript);
        } else {
          setError('Audio could not be evaluated. Please try again.');
          setPhase('ready');
        }
        return;
      }

      const transcriptText = data.transcription || browserTranscript;
      // For open-introduction prompts, the backend's word-overlap score
      // unfairly penalises the kid for not matching the model's identity
      // (Aga 2026-05-21). Re-score locally using the structural heuristic.
      if (isOpenIntroPrompt && transcriptText) {
        evaluateLocally(transcriptText);
        return;
      }

      setTranscription(transcriptText);
      setScore(data.score || 0);
      setMatchedWords(data.matched_words || []);
      setMissingWords(data.missing_words || []);
      setPhase('result');
    } catch {
      if (browserTranscript.trim()) {
        evaluateLocally(browserTranscript);
      } else {
        setError('Connection error. Please try again.');
        setPhase('ready');
      }
    }
  };

  // Heuristic: decide if the prompt is an OPEN self-introduction/personal
  // task ("Introduce yourself", "Tell us about you") vs an ECHO task
  // ("Repeat after Ray:"). Open tasks must NOT be scored against the model
  // answer's specific identity — the student's own info is correct. Aga
  // 2026-05-21: "expected answer yalnis. burda herkes serbestce kendinden
  // bahseder. odak pronunciation ve gramer dogrulugu olmali."
  const isOpenIntroPrompt = (() => {
    const p = String(promptText || '').toLowerCase();
    const m = String(activity?.production_type || '').toLowerCase();
    if (m === 'self_introduction' || m === 'open' || activity?.scoring_mode === 'structural') return true;
    return /introduce yourself|tell us about you|tell me about you|your name|your age|where (are )?you from/i.test(p) || /\bi['']?m\b.*\bi['']?m\b/i.test(expectedText);
  })();

  // "Say N things using 'X'" prompts: the student fills the X-pattern N times
  // with whatever content makes sense — what is in their bag, their family
  // members, their feelings. Identity of items is THEIR choice, so token
  // overlap against the model answer is wrong (Aga 2026-05-21: 'I have a
  // camera. I don't have a phone. I have a laptop.' scored 40% against a
  // model answer about book/pen/phone even though the structure was correct).
  // Pull the count + pattern from the prompt and score on pattern presence +
  // distinct items mentioned.
  const sayNStructure = (() => {
    const p = String(promptText || '');
    const numMap = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
    const countMatch = p.match(/\bsay\s+(\d+|one|two|three|four|five|six)\s+(things?|items?|sentences?|words?)/i);
    if (!countMatch) return null;
    const n = parseInt(countMatch[1], 10) || numMap[countMatch[1].toLowerCase()] || 3;
    // pattern is whatever the prompt quotes: 'I have a...', "I have an..."
    const patMatch = p.match(/using\s+['"`]([^'"`]{2,40})['"`]/i) || p.match(/using\s+['"`]([^'"`]+?)\s*\.{2,3}['"`]?/i);
    let stem = patMatch ? patMatch[1].trim().replace(/\.{2,}\s*$/, '').trim() : '';
    // Extract the leading verb/noun phrase as the structural anchor
    // (e.g. "I have a..." → require "i have a/an X")
    const leadMatch = stem.match(/^(.+?)\s+(a|an)\b/i);
    const anchorPhrase = leadMatch ? `${leadMatch[1]} ${leadMatch[2]}`.toLowerCase() : stem.toLowerCase();
    return { count: n, anchor: anchorPhrase, raw: stem };
  })();

  const evaluateLocally = (text) => {
    setTranscription(text);
    const clean = (s) => s.toLowerCase().trim().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);

    if (isOpenIntroPrompt) {
      // Structural scoring: did the student use the target patterns?
      // Reward "I'm/I am + X" usage, age, and "from + place" — content-agnostic.
      const lower = text.toLowerCase();
      const intros = (lower.match(/\bi['']?m\b\s+\w+|\bi am\s+\w+/g) || []).length;
      const hasAge = /\b(\d{1,2})\b/.test(lower) || /\b(ten|eleven|twelve|thirteen|fourteen|fifteen|nine|eight|seven|six|five|four|three)\b/.test(lower);
      const hasFrom = /\bfrom\s+\w+/.test(lower);
      const wordCount = clean(text).length;

      let pts = 0;
      const matched = [];
      const missing = [];

      if (intros >= 1) { pts += 30; matched.push("Used 'I'm' / 'I am'"); }
      else missing.push("Try 'I'm ___' or 'I am ___'");
      if (intros >= 2) pts += 15;
      if (intros >= 3) pts += 10;

      if (hasAge) { pts += 20; matched.push('Mentioned an age'); }
      else missing.push('Add how old you are');

      if (hasFrom) { pts += 20; matched.push('Said where you are from'); }
      else missing.push("Say 'I'm from ___'");

      // Length floor — a 3-word answer shouldn't ace this
      if (wordCount >= 6) pts += 5;
      if (wordCount >= 10) pts += 5;

      const s = Math.min(100, pts);
      setScore(s);
      setMatchedWords(matched);
      setMissingWords(missing);
      setPhase('result');
      return;
    }

    if (sayNStructure) {
      // "Say N things using 'I have a...'" — count pattern uses + distinct nouns
      const lower = text.toLowerCase();
      const { count: target, anchor, raw } = sayNStructure;
      // Build a regex from the anchor phrase. Treat "i have a" / "i have an"
      // / "i don't have a" / "i don't have an" all as the same pattern;
      // negative forms still demonstrate the structure.
      const anchorWords = anchor.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
      // Build flexible regex that allows "don't" / "do not" between subject + verb
      const subjVerbRe = anchorWords.length >= 3
        ? new RegExp(`\\b${anchorWords[0]}\\s+(?:do\\s*n['']?t\\s+|don['']?t\\s+|do\\s+not\\s+)?${anchorWords[1]}\\s+(?:${anchorWords[2]}|an?)\\s+([a-z]+)`, 'gi')
        : new RegExp(`\\b${anchor.replace(/\s+/g, '\\s+')}\\s+([a-z]+)`, 'gi');
      const matches = [...lower.matchAll(subjVerbRe)];
      const distinctItems = new Set(matches.map(m => m[1]).filter(Boolean));
      const uses = matches.length;
      const distinct = distinctItems.size;
      const wordCount = clean(text).length;

      let pts = 0;
      const matched = [];
      const missing = [];

      // Pattern presence: 60 pts if uses >= target, scaled down
      if (uses >= target) {
        pts += 60;
        matched.push(`Used '${raw}' pattern ${uses} times`);
      } else if (uses > 0) {
        pts += Math.round((uses / target) * 60);
        matched.push(`Used '${raw}' pattern ${uses} time${uses === 1 ? '' : 's'}`);
        missing.push(`Use '${raw}' ${target - uses} more time${target - uses === 1 ? '' : 's'}`);
      } else {
        missing.push(`Use the pattern '${raw}'`);
      }

      // Distinct items: 30 pts if distinct >= target
      if (distinct >= target) {
        pts += 30;
        matched.push(`Mentioned ${distinct} different things: ${[...distinctItems].slice(0, 5).join(', ')}`);
      } else if (distinct > 0) {
        pts += Math.round((distinct / target) * 30);
        matched.push(`Mentioned ${distinct} thing${distinct === 1 ? '' : 's'}: ${[...distinctItems].join(', ')}`);
        if (uses > 0) missing.push(`Mention ${target - distinct} more different thing${target - distinct === 1 ? '' : 's'}`);
      }

      // Length floor
      if (wordCount >= target * 3) pts += 10;

      const s = Math.min(100, pts);
      setScore(s);
      setMatchedWords(matched);
      setMissingWords(missing);
      setPhase('result');
      return;
    }

    // Echo/repetition task: word-overlap against the model answer
    const tWords = new Set(clean(text));
    const eWords = new Set(clean(expectedText));
    const matched = [...tWords].filter(w => eWords.has(w));
    const missing = [...eWords].filter(w => !tWords.has(w));
    const s = eWords.size > 0 ? Math.min(Math.round((matched.length / eWords.size) * 100), 100) : 100;
    setScore(s);
    setMatchedWords(matched);
    setMissingWords(missing);
    setPhase('result');
  };

  const handleWrittenSubmit = () => {
    if (!writtenResponse.trim()) return;
    evaluateLocally(writtenResponse);
  };

  const handleRetry = () => {
    setPhase('ready');
    setTranscription('');
    setBrowserTranscript('');
    setScore(0);
    setMatchedWords([]);
    setMissingWords([]);
    setRecordingTime(0);
    setError('');
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div data-testid="production-activity">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-rose-100 text-rose-700 border-0">
          <Mic className="w-3 h-3 mr-1" /> {isWriting ? 'Writing' : 'Speaking'}
        </Badge>
        <div className="flex items-center gap-3">
          {prompts.length > 1 && <span className="text-sm text-gray-500">{currentPromptIdx + 1}/{prompts.length}</span>}
          <SkipButton onSkip={onSkip} />
        </div>
      </div>

      <Card className="p-6 max-w-2xl mx-auto">
        {/* Prompt */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Volume2 className="w-3 h-3" /> Action
          </div>
          <h3 className="text-2xl font-bold text-gray-900" data-testid="production-prompt">{promptText}</h3>
          {/* Optional scene/reference photo from activity data */}
          {(activity?.image_url || activity?.scene_image) && (
            <img
              src={activity.image_url || activity.scene_image}
              alt="Reference"
              className="mt-4 mx-auto max-h-44 rounded-xl border border-rose-100 shadow-sm"
            />
          )}
          {expectedText && !/\[[A-Za-z/_-]+\]/.test(expectedText) && (
            <button
              onClick={() => speakOnce(expectedText, { rate: 0.95 })}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
              data-testid="listen-example-btn">
              <Volume2 className="w-3.5 h-3.5" /> Listen to example
            </button>
          )}
        </div>

        {/* Scaffold + tip card — keeps kids from staring at a blank prompt.
            Sources: activity.prompts (string ladder), vocab/grammar context
            from the lesson, optional activity.tips array. */}
        {phase === 'ready' && (scaffoldStrings?.length || lessonContext?.words?.length || lessonContext?.grammarRules?.length || activity?.tips?.length) && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-semibold text-amber-700">Tips from Ray</h4>
            </div>
            {scaffoldStrings?.length > 0 && (
              <ul className="text-sm text-gray-700 space-y-1.5 mb-2">
                {scaffoldStrings.slice(0, 3).map((s, i) => (
                  <li key={i} className="flex gap-2"><span className="text-amber-600 font-bold">{i + 1}.</span><span>{s}</span></li>
                ))}
              </ul>
            )}
            {lessonContext?.words?.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Words to use</p>
                <div className="flex flex-wrap gap-1.5">
                  {lessonContext.words.slice(0, 8).map((w, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-white text-amber-800 text-xs px-2 py-0.5 rounded-full border border-amber-200">
                      {w.word || w.term || w}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {lessonContext?.grammarRules?.[0]?.examples?.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Example sentences</p>
                <ul className="text-xs text-gray-700 space-y-0.5">
                  {lessonContext.grammarRules[0].examples.slice(0, 2).map((ex, i) => (
                    <li key={i} className="italic">"{ex}"</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl mb-4 text-center">{error}</div>
        )}

        {/* READY PHASE */}
        {phase === 'ready' && !isWriting && (
          <div className="text-center space-y-4">
            <button onClick={startRecording}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center mx-auto shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              data-testid="start-recording-btn">
              <Mic className="w-10 h-10" />
            </button>
            <p className="text-sm text-gray-500">Tap to start recording</p>
          </div>
        )}

        {/* RECORDING PHASE */}
        {phase === 'recording' && (
          <div className="text-center space-y-4">
            <div className="relative">
              <button onClick={handleStopAndEvaluate}
                className="w-24 h-24 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse"
                data-testid="stop-recording-btn">
                <div className="w-8 h-8 bg-white rounded-sm" />
              </button>
              <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-red-300 animate-ping mx-auto pointer-events-none" style={{animationDuration:'1.5s'}} />
            </div>
            <div className="text-red-600 font-mono font-bold text-lg" data-testid="recording-timer">{formatTime(recordingTime)}</div>
            {browserTranscript && (
              <div className="bg-gray-50 rounded-xl p-3 max-w-md mx-auto">
                <p className="text-sm text-gray-600 italic">"{browserTranscript}"</p>
              </div>
            )}
            <p className="text-sm text-gray-500">Tap to stop and evaluate</p>
          </div>
        )}

        {/* PROCESSING PHASE */}
        {phase === 'processing' && (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Evaluating your speech...</p>
          </div>
        )}

        {/* RESULT PHASE */}
        {phase === 'result' && (
          <div className="space-y-4" data-testid="speech-result">
            {/* Score Circle */}
            <div className="text-center mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-white ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                data-testid="speech-score">
                {score}%
              </div>
              <p className="mt-2 font-semibold text-gray-800">
                {score >= 80 ? 'Excellent!' : score >= 50 ? 'Good try!' : 'Keep practicing!'}
              </p>
            </div>

            {/* What you said */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">What you said</h4>
              <p className="text-sm text-gray-800" data-testid="speech-transcription">"{transcription || '(no speech detected)'}"</p>
            </div>

            {/* Model answer (inspiration, not a grading target for open prompts) */}
            {expectedText && (
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">
                  Model answer{(isOpenIntroPrompt || sayNStructure) && ' · yours can be different'}
                </h4>
                <p className="text-sm text-blue-800">"{expectedText}"</p>
              </div>
            )}

            {/* Word breakdown */}
            {(matchedWords.length > 0 || missingWords.length > 0) && (
              <div className="flex gap-3">
                {matchedWords.length > 0 && (
                  <div className="flex-1 bg-green-50 rounded-xl p-3">
                    <h5 className="text-xs font-semibold text-green-600 mb-1">Matched</h5>
                    <div className="flex flex-wrap gap-1">
                      {matchedWords.map((w, i) => <span key={i} className="bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">{w}</span>)}
                    </div>
                  </div>
                )}
                {missingWords.length > 0 && (
                  <div className="flex-1 bg-orange-50 rounded-xl p-3">
                    <h5 className="text-xs font-semibold text-orange-600 mb-1">Missing</h5>
                    <div className="flex flex-wrap gap-1">
                      {missingWords.map((w, i) => <span key={i} className="bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full">{w}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={handleRetry} data-testid="retry-speaking-btn">
                <RotateCcw className="w-4 h-4 mr-1" /> Try Again
              </Button>
              {currentPromptIdx < prompts.length - 1 ? (
                <Button onClick={() => {
                  setPromptScores(prev => [...prev, score]);
                  setCurrentPromptIdx(i => i + 1);
                  setPhase('ready');
                  setTranscription(''); setBrowserTranscript('');
                  setScore(0); setMatchedWords([]); setMissingWords([]);
                  setRecordingTime(0); setError('');
                }} data-testid="production-next-btn">
                  Next ({currentPromptIdx + 1}/{prompts.length}) <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={() => {
                  const allScores = [...promptScores, score];
                  const avg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
                  onComplete(avg);
                }} data-testid="production-continue-btn">
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* WRITING FALLBACK */}
        {isWriting && phase === 'ready' && (
          <div className="space-y-4">
            <textarea value={writtenResponse} onChange={e => setWrittenResponse(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 min-h-[120px] text-sm"
              placeholder="Write your answer here..."
              data-testid="production-textarea" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">{writtenResponse.split(/\s+/).filter(Boolean).length} words</span>
              <Button onClick={handleWrittenSubmit} disabled={!writtenResponse.trim()} data-testid="production-submit-btn">Submit</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ProductionActivity;
