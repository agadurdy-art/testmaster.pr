import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, RotateCcw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// IELTS speaking sample sentences
const SAMPLE_SENTENCES = [
  "I would like to describe my hometown.",
  "In my opinion, technology has changed the way we communicate.",
  "The government should invest more in public transportation.",
  "I have been living in this city for five years.",
  "Climate change is one of the most pressing issues of our time.",
  "Education plays a crucial role in a person's development.",
];

function ScoreBar({ label, score, color }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`text-xs font-bold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
          {score}/100
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function PronunciationChecker({ initialSentence }) {
  const [sentence, setSentence] = useState(initialSentence || SAMPLE_SENTENCES[0]);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const getRandomSentence = () => {
    const others = SAMPLE_SENTENCES.filter(s => s !== sentence);
    setSentence(others[Math.floor(Math.random() * others.length)]);
    setResult(null);
    setError(null);
  };

  const startRecording = useCallback(async () => {
    setResult(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await assess(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError('Microphone access denied. Please allow microphone and try again.');
    }
  }, [sentence]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setLoading(true);
    }
  }, [recording]);

  const assess = async (blob) => {
    const form = new FormData();
    form.append('audio', blob, 'recording.webm');
    form.append('reference_text', sentence);
    try {
      const res = await fetch(`${API_URL}/api/unified/pronunciation/assess`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Assessment failed');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const overallScore = result
    ? Math.round((result.accuracy_score + result.fluency_score + result.completeness_score) / 3)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Pronunciation Check</h3>
        <button
          onClick={getRandomSentence}
          className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> New sentence
        </button>
      </div>

      {/* Target sentence */}
      <div className="bg-violet-50 rounded-xl px-4 py-3 text-sm font-medium text-violet-900 leading-relaxed">
        "{sentence}"
      </div>

      {/* Record button */}
      <div className="flex justify-center">
        {recording ? (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-sm transition animate-pulse"
          >
            <MicOff className="w-4 h-4" /> Stop recording
          </button>
        ) : loading ? (
          <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-500 rounded-full text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Analysing...
          </div>
        ) : (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-semibold text-sm transition"
          >
            <Mic className="w-4 h-4" /> {result ? 'Try again' : 'Start recording'}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Overall badge */}
          <div className={`flex items-center gap-3 p-3 rounded-xl ${overallScore >= 80 ? 'bg-emerald-50' : overallScore >= 60 ? 'bg-amber-50' : 'bg-red-50'}`}>
            {overallScore >= 80
              ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              : <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            }
            <div>
              <div className={`font-bold text-sm ${overallScore >= 80 ? 'text-emerald-800' : overallScore >= 60 ? 'text-amber-800' : 'text-red-700'}`}>
                Overall: {overallScore}/100 — {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs practice'}
              </div>
              {result.recognized_text && (
                <div className="text-xs text-gray-500 mt-0.5">Heard: "{result.recognized_text}"</div>
              )}
            </div>
          </div>

          {/* Score bars */}
          <div className="space-y-2.5">
            <ScoreBar label="Accuracy" score={result.accuracy_score} />
            <ScoreBar label="Fluency" score={result.fluency_score} />
            <ScoreBar label="Completeness" score={result.completeness_score} />
            {result.prosody_score != null && <ScoreBar label="Prosody" score={result.prosody_score} />}
          </div>

          {/* Word-level breakdown */}
          {result.word_scores?.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Word breakdown:</div>
              <div className="flex flex-wrap gap-1.5">
                {result.word_scores.map((w, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      w.error_type && w.error_type !== 'None'
                        ? 'bg-red-100 text-red-700'
                        : w.accuracy_score >= 80
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                    title={w.error_type !== 'None' ? w.error_type : `${w.accuracy_score}/100`}
                  >
                    {w.word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
