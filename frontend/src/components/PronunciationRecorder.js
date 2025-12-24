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
const MIN_BLOB_SIZE_BYTES = 10000; // 10kb
const WHISPER_TIMEOUT_MS = 15000; // 15 seconds

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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType });
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
          // Do NOT increment attempts on validation failure
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
      
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setRecordingStartTime(Date.now());
      setState(STATES.RECORDING);
      setFeedback(null);
      
      debugLog('Recording started', { mimeType: mediaRecorderRef.current.mimeType });
      
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
        feedback: result.feedback
      });

      // Check if we got a valid evaluation
      if (result.status === 'fail' && !result.transcribed) {
        // System couldn't hear - this is a valid evaluation result
        setFeedback(result);
        setState(STATES.FAILED);
        setAttempts(prev => prev + 1); // Increment attempt
      } else if (result.status === 'success' || result.status === 'needs_practice') {
        setFeedback(result);
        setState(result.correct ? STATES.SUCCESS : STATES.FAILED);
        setAttempts(prev => prev + 1); // Increment attempt
        
        if (onFeedback) {
          onFeedback(result);
        }
      } else {
        // Unknown status
        setFeedback(result);
        setState(STATES.FAILED);
        setAttempts(prev => prev + 1);
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
        status: 'error',
        score: 0,
        correct: false,
        feedback: "We couldn't analyze your recording. Please try again."
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
          
          {referenceAudioUrl && (
            <>
              <audio ref={referenceAudioRef} src={referenceAudioUrl} />
              <Button
                onClick={playReferenceAudio}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            </>
          )}
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
          <div className="flex justify-center">
            {state === STATES.RECORDING ? (
              <Button
                onClick={stopRecording}
                className="w-24 h-24 rounded-full bg-slate-700 hover:bg-slate-800 flex flex-col items-center justify-center gap-1 animate-pulse"
              >
                <Square className="w-8 h-8 text-white" />
                <span className="text-xs text-white">Stop</span>
              </Button>
            ) : state === STATES.VALIDATING || state === STATES.UPLOADING || state === STATES.ANALYZING ? (
              <div className="w-24 h-24 rounded-full bg-violet-100 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                <span className="text-xs text-violet-600">
                  {state === STATES.ANALYZING ? 'Analyzing...' : 'Processing...'}
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
