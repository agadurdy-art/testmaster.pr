import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Mic, Square, Play, Pause, Volume2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function PronunciationRecorder({ 
  targetText, 
  word, 
  userId,
  onFeedback,
  type = 'sentence' // 'sentence' or 'word'
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

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
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setFeedback(null);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      toast.success('Recording stopped');
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const checkPronunciation = async () => {
    if (!audioBlob) {
      toast.error('Please record audio first');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');
      formData.append('target_text', type === 'word' ? word : targetText);
      formData.append('user_id', userId);

      const endpoint = type === 'word' 
        ? `${API_URL}/api/pronunciation/practice-word?word=${encodeURIComponent(word)}&user_id=${userId}`
        : `${API_URL}/api/pronunciation/check?target_text=${encodeURIComponent(targetText)}&user_id=${userId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Pronunciation check failed');
      }

      const result = await response.json();
      setFeedback(result);
      
      if (onFeedback) {
        onFeedback(result);
      }
      
      toast.success('Pronunciation checked!');
    } catch (error) {
      console.error('Error checking pronunciation:', error);
      toast.error('Failed to check pronunciation');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeIcon = (grade) => {
    if (grade === 'Excellent' || grade === 'Good') return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Target Text Display */}
        <div className="bg-violet-50 p-4 rounded-lg border-l-4 border-l-violet-500">
          <p className="text-sm text-violet-600 font-medium mb-1">
            {type === 'word' ? 'Practice Word' : 'Practice Sentence'}
          </p>
          <p className="text-lg font-bold text-slate-800">
            {type === 'word' ? word : targetText}
          </p>
        </div>

        {/* Recording Controls */}
        <div className="flex gap-3 items-center">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={isAnalyzing}
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button
                onClick={stopRecording}
                className="flex-1 bg-slate-700 hover:bg-slate-800 text-white"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm font-mono">{recordingTime}s</span>
              </div>
            </>
          )}
        </div>

        {/* Audio Playback */}
        {audioURL && (
          <div className="flex gap-3">
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <Button
              onClick={playAudio}
              variant="outline"
              className="flex-1"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play Recording
                </>
              )}
            </Button>
            <Button
              onClick={checkPronunciation}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Check Pronunciation
                </>
              )}
            </Button>
          </div>
        )}

        {/* Feedback Display */}
        {feedback && (
          <div className="space-y-4 mt-6">
            {type === 'word' ? (
              // Simple word feedback
              <Card className={`p-4 ${feedback.correct ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {feedback.correct ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    )}
                    <span className="font-bold text-lg">Score: {feedback.score}/100</span>
                  </div>
                </div>
                <p className="text-sm text-slate-700">
                  <strong>You said:</strong> "{feedback.transcribed}"
                </p>
                <p className="text-sm font-medium mt-2">{feedback.feedback}</p>
              </Card>
            ) : (
              // Detailed sentence feedback
              <>
                <Card className={`p-4 ${getScoreColor(feedback.overall_score)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getGradeIcon(feedback.pronunciation_grade)}
                      <div>
                        <p className="font-bold text-lg">{feedback.overall_score}/100</p>
                        <p className="text-sm">{feedback.pronunciation_grade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600">Words Correct</p>
                      <p className="font-bold">{feedback.matched_words?.length || 0}</p>
                    </div>
                  </div>
                </Card>

                {/* What you said */}
                <div className="bg-slate-100 p-3 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">What you said:</p>
                  <p className="font-medium">"{feedback.transcribed_text}"</p>
                </div>

                {/* Strengths */}
                {feedback.strengths && feedback.strengths.length > 0 && (
                  <Card className="p-4 bg-green-50 border-green-200">
                    <p className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </p>
                    <ul className="space-y-1">
                      {feedback.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Errors & Tips */}
                {feedback.errors && feedback.errors.length > 0 && (
                  <Card className="p-4 bg-amber-50 border-amber-200">
                    <p className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Areas to Improve
                    </p>
                    <div className="space-y-3">
                      {feedback.errors.map((error, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border-l-4 border-l-amber-400">
                          <p className="font-medium text-slate-800 mb-1">
                            Word: <span className="text-amber-700">{error.word}</span>
                          </p>
                          <p className="text-sm text-slate-600 mb-1">
                            <strong>Issue:</strong> {error.issue}
                          </p>
                          <p className="text-sm text-slate-600 mb-1">
                            <strong>Correct:</strong> {error.correct_pronunciation}
                          </p>
                          <p className="text-sm bg-blue-50 p-2 rounded mt-2 border-l-2 border-blue-400">
                            💡 <strong>Tip:</strong> {error.tip}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Phonics Lesson Recommendation */}
                {feedback.phonics_lesson_recommended && (
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <p className="font-semibold text-purple-700 mb-2">
                      📚 Recommended Lesson
                    </p>
                    <p className="text-sm text-slate-700">
                      Practice the <strong>{feedback.phonics_lesson_recommended.replace('_', ' ')}</strong> phonics lesson to improve this sound!
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.open(`/phonics/${feedback.phonics_lesson_recommended}`, '_blank')}
                    >
                      View Lesson
                    </Button>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
