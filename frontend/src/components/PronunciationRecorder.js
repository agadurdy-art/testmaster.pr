import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Mic, Square, Play, Volume2, RotateCcw, Star, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function PronunciationRecorder({ 
  targetText, 
  word, 
  phonetic,
  audioUrl, // Audio URL to play the correct pronunciation
  imageUrl,
  userId,
  onFeedback,
  type = 'sentence', // 'sentence' or 'word'
  maxAttempts = 3
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordedAudioURL, setRecordedAudioURL] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const referenceAudioRef = useRef(null);
  const recordedAudioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recordedAudioURL) URL.revokeObjectURL(recordedAudioURL);
    };
  }, [recordedAudioURL]);

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
  const getFeedbackMessage = (score) => {
    if (score >= 90) return { text: 'Excellent!', color: 'text-green-600' };
    if (score >= 75) return { text: 'Very Good!', color: 'text-green-500' };
    if (score >= 60) return { text: 'Good job!', color: 'text-blue-600' };
    if (score >= 40) return { text: 'Keep practicing!', color: 'text-yellow-600' };
    if (score >= 20) return { text: 'Need more effort', color: 'text-orange-600' };
    return { text: 'Try again', color: 'text-red-500' };
  };

  // Play reference audio (correct pronunciation)
  const playReferenceAudio = () => {
    if (referenceAudioRef.current) {
      referenceAudioRef.current.play();
      setIsPlayingReference(true);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
        
        // Automatically check pronunciation after recording
        await checkPronunciationWithBlob(blob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setFeedback(null);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAttempts(prev => prev + 1);
    }
  };

  const checkPronunciationWithBlob = async (blob) => {
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio_file', blob, 'recording.webm');

      const targetTextValue = type === 'word' ? word : targetText;
      const endpoint = type === 'word' 
        ? `${API_URL}/api/pronunciation/practice-word?word=${encodeURIComponent(word)}&user_id=${userId}`
        : `${API_URL}/api/pronunciation/check?target_text=${encodeURIComponent(targetTextValue)}&user_id=${userId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Pronunciation check failed');
      }

      const result = await response.json();
      setFeedback(result);
      
      if (onFeedback) {
        onFeedback(result);
      }
      
    } catch (error) {
      console.error('Error checking pronunciation:', error);
      toast.error(error.message || 'Failed to check pronunciation. Try again.');
      // Set a basic feedback even on error
      setFeedback({
        score: 0,
        overall_score: 0,
        feedback: 'Could not analyze. Please try again.',
        correct: false
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetPractice = () => {
    setFeedback(null);
    setAudioBlob(null);
    setRecordedAudioURL(null);
    setAttempts(0);
  };

  const score = feedback?.score || feedback?.overall_score || 0;
  const stars = getStars(score);
  const feedbackMsg = getFeedbackMessage(score);
  const displayWord = type === 'word' ? word : targetText;

  return (
    <Card className="overflow-hidden bg-white shadow-lg">
      {/* Header with word/sentence and phonetic */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{displayWord}</h3>
            {phonetic && (
              <p className="text-violet-100 mt-1 font-mono">{phonetic}</p>
            )}
          </div>
          
          {/* Listen to correct pronunciation */}
          {audioUrl && (
            <>
              <audio
                ref={referenceAudioRef}
                src={audioUrl}
                onEnded={() => setIsPlayingReference(false)}
              />
              <Button
                onClick={playReferenceAudio}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Volume2 className={`w-5 h-5 ${isPlayingReference ? 'animate-pulse' : ''}`} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Image (if provided for vocabulary) */}
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
            <Button
              onClick={resetPractice}
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Recording Button */}
        {!feedback && (
          <div className="flex justify-center">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isAnalyzing || attempts >= maxAttempts}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 ${
                  attempts >= maxAttempts 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600 hover:scale-105 transition-transform'
                }`}
              >
                <Mic className="w-8 h-8 text-white" />
                <span className="text-xs text-white">Record</span>
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="w-24 h-24 rounded-full bg-slate-700 hover:bg-slate-800 flex flex-col items-center justify-center gap-1 animate-pulse"
              >
                <Square className="w-8 h-8 text-white" />
                <span className="text-xs text-white">Stop</span>
              </Button>
            )}
          </div>
        )}

        {/* Analyzing State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin mb-3"></div>
            <p className="text-slate-600">Analyzing your pronunciation...</p>
          </div>
        )}

        {/* Feedback Display */}
        {feedback && !isAnalyzing && (
          <div className="space-y-4">
            {/* Star Rating */}
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

            {/* What you said */}
            {(feedback.transcribed || feedback.transcribed_text) && (
              <div className="bg-slate-50 p-3 rounded-lg border">
                <p className="text-xs text-slate-500 mb-1">You said:</p>
                <p className="text-slate-700 font-medium">
                  "{typeof feedback.transcribed === 'string' ? feedback.transcribed : 
                    typeof feedback.transcribed_text === 'string' ? feedback.transcribed_text : 
                    '(audio recorded)'}"
                </p>
              </div>
            )}

            {/* Correct/Incorrect indicator for word practice */}
            {type === 'word' && (
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                feedback.correct || score >= 70 ? 'bg-green-50' : 'bg-amber-50'
              }`}>
                {feedback.correct || score >= 70 ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">Correct pronunciation!</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-amber-600" />
                    <span className="text-amber-700 font-medium">Try saying it more clearly</span>
                  </>
                )}
              </div>
            )}

            {/* Quick tip - only show simple string tips */}
            {feedback.feedback && typeof feedback.feedback === 'string' && feedback.feedback.length < 100 && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-blue-800 text-sm">
                  💡 {feedback.feedback}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {audioUrl && (
                <Button
                  onClick={playReferenceAudio}
                  variant="outline"
                  className="flex-1"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen Again
                </Button>
              )}
              
              {attempts < maxAttempts && (
                <Button
                  onClick={() => {
                    setFeedback(null);
                    setAudioBlob(null);
                    setRecordedAudioURL(null);
                  }}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>

            {/* Play your recording */}
            {recordedAudioURL && (
              <Button
                onClick={() => recordedAudioRef.current?.play()}
                variant="ghost"
                size="sm"
                className="w-full text-slate-500"
              >
                <Play className="w-4 h-4 mr-2" />
                Play your recording
              </Button>
            )}
            <audio ref={recordedAudioRef} src={recordedAudioURL} />
          </div>
        )}

        {/* Max attempts reached */}
        {attempts >= maxAttempts && !feedback && !isAnalyzing && (
          <div className="text-center py-4">
            <p className="text-slate-600 mb-3">Maximum attempts reached</p>
            <Button onClick={resetPractice} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
