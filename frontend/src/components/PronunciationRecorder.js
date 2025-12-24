import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Mic, Square, Play, Volume2, RotateCcw, Star, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// State machine states
const STATES = {
  IDLE: 'IDLE',
  RECORDING: 'RECORDING',
  VALIDATING: 'VALIDATING',
  UPLOADING: 'UPLOADING',
  ANALYZING: 'ANALYZING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

// Validation constants
const MIN_RECORDING_DURATION_MS = 600; // 0.6 seconds
const MIN_BLOB_SIZE_BYTES = 8000; // 8kb (reduced for faster validation)
const WHISPER_TIMEOUT_MS = 10000; // 10 seconds (reduced from 15)

// Text-to-Speech for native pronunciation
const speakWord = (word) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // Slower for learning
    utterance.pitch = 1;
    
    // Try to use a native English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Native') || v.name.includes('Samantha'))
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
    return true;
  }
  return false;
};

export default function PronunciationRecorder({ 
  targetText, 
  word, 
  phonetic,
  audioUrl: referenceAudioUrl,
  imageUrl,
  userId,
  onFeedback,
  type = 'sentence',
  maxAttempts = 3
}) {
  // State machine
  const [state, setState] = useState(STATES.IDLE);
  
  // Recording data
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  
  // Evaluation result
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const referenceAudioRef = useRef(null);
  const streamRef = useRef(null);
  
  // Debug mode
  const DEBUG = process.env.NODE_ENV === 'development';

  // Cleanup function for audio URL
  const cleanupAudioUrl = useCallback(() => {
    if (audioUrl) {
      if (DEBUG) console.log('[Pronunciation] Revoking old audio URL');
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl, DEBUG]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Get star rating based on score
  const getStars = (score) => {
    if (score >= 90) return 5;
    if (score >= 75) return 4;
    if (score >= 60) return 3;
    if (score >= 40) return 2;
    if (score >= 20) return 1;
    return 0;
  };

  // Get feedback message based on score
  const getFeedbackMessage = (score, status) => {
    if (status === 'fail') return { text: 'Try again', color: 'text-red-500' };
    if (score >= 90) return { text: 'Excellent!', color: 'text-green-600' };
    if (score >= 80) return { text: 'Good pronunciation!', color: 'text-green-500' };
    if (score >= 60) return { text: 'Almost there', color: 'text-yellow-600' };
    if (score >= 40) return { text: 'Keep practicing', color: 'text-orange-600' };
    return { text: 'Try again', color: 'text-red-500' };
  };

  // Debug log function
  const debugLog = (action, data) => {
    if (DEBUG) {
      console.log(`[Pronunciation] ${action}:`, {
        timestamp: new Date().toISOString(),
        word: word || targetText,
        ...data
      });
    }
  };

  // Play reference audio
  const playReferenceAudio = () => {
    if (referenceAudioRef.current) {
      referenceAudioRef.current.play().catch(err => {
        console.error('Reference audio play error:', err);
      });
    }
  };

  // Validate recording before upload
  const validateRecording = (blob, durationMs) => {
    debugLog('Validating recording', { 
      blobSize: blob.size, 
      durationMs,
      mimeType: blob.type 
    });

    if (durationMs < MIN_RECORDING_DURATION_MS) {
      return { valid: false, error: 'Recording too short. Please hold the button longer.' };
    }
    
    if (blob.size < MIN_BLOB_SIZE_BYTES) {
      return { valid: false, error: 'Recording too quiet. Please speak louder.' };
    }
    
    return { valid: true };
  };

  // Start recording
  const startRecording = async () => {
    if (state !== STATES.IDLE && state !== STATES.SUCCESS && state !== STATES.FAILED) {
      return;
    }

    try {
      // Show preparing state
      setState(STATES.VALIDATING);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      // Use audio/webm with opus codec for better quality
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4';
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const durationMs = Date.now() - recordingStartTime;
        
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        debugLog('Recording stopped', {
          blobSize: blob.size,
          durationMs,
          mimeType: blob.type
        });
        
        // Validate recording
        setState(STATES.VALIDATING);
        const validation = validateRecording(blob, durationMs);
        
        if (!validation.valid) {
          toast.error(validation.error);
          setState(STATES.IDLE);
          return;
        }
        
        // Cleanup old URL before creating new one
        cleanupAudioUrl();
        
        // Store blob and create new URL
        setAudioBlob(blob);
        const newUrl = URL.createObjectURL(blob);
        setAudioUrl(newUrl);
        
        debugLog('Audio URL created', { url: newUrl });
        
        // Proceed to evaluation
        await evaluatePronunciation(blob);
      };
      
      // Wait for recorder to be ready
      mediaRecorderRef.current.onstart = () => {
        debugLog('Recording actually started', { mimeType });
      };
      
      // Longer delay to ensure microphone is fully ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Start recording - collect data continuously with small chunks
      mediaRecorderRef.current.start(30); // Very small chunks for better capture
      setRecordingStartTime(Date.now());
      setState(STATES.RECORDING);
      setFeedback(null);
      
      // Play a short beep to indicate recording started
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 880; // Higher pitch
        gainNode.gain.value = 0.15;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
      } catch (e) {
        // Beep failed, continue anyway
      }
      
      debugLog('Recording started', { mimeType });
      toast.success('🎤 Speak now!', { duration: 2000 });
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please allow microphone access.');
      setState(STATES.IDLE);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && state === STATES.RECORDING) {
      mediaRecorderRef.current.stop();
    }
  };

  // Evaluate pronunciation with retry logic
  const evaluatePronunciation = async (blob, retryCount = 0) => {
    setState(STATES.UPLOADING);
    
    const formData = new FormData();
    formData.append('audio_file', blob, 'recording.webm');

    const targetWord = type === 'word' ? word : targetText;
    const endpoint = `${API_URL}/api/pronunciation/practice-word?word=${encodeURIComponent(targetWord)}&user_id=${userId}`;
    
    debugLog('Uploading for evaluation', { 
      endpoint, 
      blobSize: blob.size,
      retryCount 
    });

    setState(STATES.ANALYZING);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WHISPER_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Evaluation failed');
      }

      const result = await response.json();
      
      debugLog('Evaluation result', {
        status: result.status,
        score: result.score,
        transcribed: result.transcribed,
        feedback: result.feedback,
        should_count_attempt: result.should_count_attempt
      });

      setFeedback(result);
      
      // Determine state based on status
      if (result.status === 'success') {
        setState(STATES.SUCCESS);
      } else {
        setState(STATES.FAILED);
      }
      
      // Only increment attempts if should_count_attempt is true
      if (result.should_count_attempt !== false) {
        setAttempts(prev => prev + 1);
      }
      
      if (onFeedback) {
        onFeedback(result);
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      debugLog('Evaluation error', { 
        error: error.message, 
        retryCount,
        isTimeout: error.name === 'AbortError'
      });

      // Retry once on network/timeout error
      if (retryCount < 1 && (error.name === 'AbortError' || error.message.includes('network'))) {
        toast.info('Retrying...');
        return evaluatePronunciation(blob, retryCount + 1);
      }

      // Show error - do NOT increment attempts on system error
      toast.error("We couldn't analyze your recording. Please try again.");
      setState(STATES.FAILED);
      setFeedback({
        status: 'fail_system',
        score: 0,
        correct: false,
        feedback: "We couldn't analyze your recording. Please try again.",
        should_count_attempt: false
      });
    }
  };

  // Play recorded audio
  const playRecording = () => {
    if (!audioUrl) {
      toast.error('No recording available');
      return;
    }

    debugLog('Playing recording', { url: audioUrl });
    
    const audio = new Audio(audioUrl);
    audio.onended = () => debugLog('Playback ended', {});
    audio.onerror = (e) => {
      debugLog('Playback error', { error: e });
      toast.error('Could not play recording');
    };
    
    audio.play().catch(err => {
      debugLog('Play failed', { error: err.message });
      toast.error('Could not play recording');
    });
  };

  // Reset for new attempt
  const resetForRetry = () => {
    setFeedback(null);
    setState(STATES.IDLE);
    // Keep audioUrl for playback, don't cleanup yet
  };

  // Full reset
  const fullReset = () => {
    cleanupAudioUrl();
    setAudioBlob(null);
    setFeedback(null);
    setAttempts(0);
    setState(STATES.IDLE);
  };

  // Computed values
  const score = feedback?.score || 0;
  const stars = getStars(score);
  const feedbackMsg = getFeedbackMessage(score, feedback?.status);
  const displayWord = type === 'word' ? word : targetText;
  const isLocked = attempts >= maxAttempts;
  const canRecord = (state === STATES.IDLE || state === STATES.SUCCESS || state === STATES.FAILED) && !isLocked;
  const showResult = (state === STATES.SUCCESS || state === STATES.FAILED) && feedback;

  return (
    <Card className="overflow-hidden bg-white shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{displayWord}</h3>
            {phonetic && (
              <p className="text-violet-100 mt-1 font-mono">{phonetic}</p>
            )}
          </div>
          
          {/* Listen button - always show for words */}
          <Button
            onClick={() => speakWord(displayWord)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            title="Listen to pronunciation"
          >
            <Volume2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="flex justify-center p-4 bg-slate-50">
          <img 
            src={imageUrl} 
            alt={displayWord}
            className="w-32 h-32 object-cover rounded-lg shadow-md"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Listen and Repeat instruction */}
      {!showResult && state === STATES.IDLE && (
        <div className="px-6 pt-4">
          <Button
            onClick={() => speakWord(displayWord)}
            variant="outline"
            className="w-full mb-2 text-violet-600 border-violet-300 hover:bg-violet-50"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Listen First
          </Button>
          <p className="text-center text-sm text-slate-500">Then record yourself saying it</p>
        </div>
      )}

      {/* Recording Area */}
      <div className="p-6">
        {/* Attempts counter */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-slate-500">
            Attempts: <span className="font-semibold text-slate-700">{attempts}/{maxAttempts}</span>
          </p>
          {attempts > 0 && (
            <Button onClick={fullReset} variant="ghost" size="sm" className="text-slate-500">
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Recording Button - Only show when not showing results */}
        {!showResult && (
          <div className="flex flex-col items-center">
            {state === STATES.RECORDING ? (
              <>
                <div className="mb-2 text-red-600 font-semibold animate-pulse flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                  Recording... Speak now!
                </div>
                <Button
                  onClick={stopRecording}
                  className="w-28 h-28 rounded-full bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center gap-1 animate-pulse shadow-lg shadow-red-300"
                >
                  <Square className="w-10 h-10 text-white" />
                  <span className="text-sm text-white font-semibold">STOP</span>
                </Button>
              </>
            ) : state === STATES.VALIDATING || state === STATES.UPLOADING || state === STATES.ANALYZING ? (
              <div className="w-24 h-24 rounded-full bg-violet-100 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                <span className="text-xs text-violet-600">
                  {state === STATES.ANALYZING ? 'Analyzing...' : 'Preparing...'}
                </span>
              </div>
            ) : (
              <Button
                onClick={startRecording}
                disabled={!canRecord}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 ${
                  !canRecord 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600 hover:scale-105 transition-transform'
                }`}
              >
                <Mic className="w-8 h-8 text-white" />
                <span className="text-xs text-white">Record</span>
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        {showResult && (
          <div className="space-y-4">
            {/* Star Rating - Only show for valid evaluations */}
            {feedback.status !== 'error' && feedback.status !== 'fail' && (
              <div className="flex flex-col items-center py-4">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((starNum) => (
                    <Star
                      key={starNum}
                      className={`w-8 h-8 ${
                        starNum <= stars 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-slate-200 fill-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xl font-bold ${feedbackMsg.color}`}>
                  {feedbackMsg.text}
                </p>
                <p className="text-sm text-slate-500 mt-1">Score: {score}/100</p>
              </div>
            )}

            {/* Result indicator */}
            <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
              feedback.correct ? 'bg-green-50' : 'bg-amber-50'
            }`}>
              {feedback.correct ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Correct pronunciation!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-700 font-medium">
                    {feedback.feedback || 'Try again'}
                  </span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {audioUrl && (
                <Button onClick={playRecording} variant="outline" className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Play Recording
                </Button>
              )}
              
              {!isLocked && (
                <Button
                  onClick={resetForRetry}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Max attempts reached */}
        {isLocked && state !== STATES.SUCCESS && (
          <div className="text-center py-4">
            <p className="text-slate-600 mb-3">Maximum attempts reached</p>
            <Button onClick={fullReset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
