import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
  Headphones, Mic, Clock, Pause, Volume2,
  ChevronRight, CheckCircle, RefreshCw, X
} from 'lucide-react';
import { toast } from 'sonner';
import { mintClientRequestId } from '../../../../lib/clientRequestId';
import { ResultsState as SpeakingResultsState, adaptSpeakingResult } from '../..';
import '../../speaking.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Speaking state machine
const SPEAKING_STATES = {
  IDLE: 'IDLE',
  LOADING_AUDIO: 'LOADING_AUDIO',
  PLAYING_PROMPT: 'PLAYING_PROMPT',
  READY_TO_RECORD: 'READY_TO_RECORD',
  RECORDING: 'RECORDING',
  RECORDED: 'RECORDED'
};

// Cambridge test-interface Speaking section, extracted whole from
// CambridgeTestInterface.js (zero behavior change intended).
//
// Ownership split — these stay in the PAGE and arrive as props because they
// are shared with the rest of the test or must survive this component
// unmounting (it unmounts whenever the candidate tabs to another section):
//   - currentPart / setCurrentPart: shared part cursor — the page's bottom
//     bar renders "Part {currentPart + 1} of 3" for speaking, the section
//     tabs / submit flow reset it to 0, and listening/reading reuse it.
//   - questionRecordings / setQuestionRecordings: read by the page's
//     getAnsweredCount('speaking') header counter, and must persist across
//     section switches (answered state + playback URLs).
//   - questionPlayCounts / setQuestionPlayCounts: the 2-play TTS limit must
//     persist across section switches, otherwise tabbing away and back would
//     silently reset the plays-left budget.
//   - speakingBlobsRef: the raw answer blobs consumed at submit time by
//     evaluateAllSpeakingParts() inside the page's handleSubmitSection.
//   - setIsEvaluating / setQuestionEvaluations: the page owns evaluation
//     state (submit modal spinner + results-page payload); the per-question
//     evaluate path below writes into it through these setters.
// Everything else (state machine position, TTS playback, prep timer,
// recording timer, MediaRecorder plumbing) is ephemeral flow state and lives
// here.
export default function CambridgeSpeakingSection({
  sectionData,
  currentSection,
  currentPart,
  setCurrentPart,
  user,
  questionRecordings,
  setQuestionRecordings,
  questionPlayCounts,
  setQuestionPlayCounts,
  speakingBlobsRef,
  setIsEvaluating,
  setQuestionEvaluations,
}) {
  const { bookId, testId } = useParams();
  const location = useLocation();

  // Recording state (for Speaking)
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState({});
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Speaking state for TTS and questions
  const [speakingQuestionIndex, setSpeakingQuestionIndex] = useState(0);
  // Lazy init mirrors the navigation-restore fix across an unmount/remount:
  // before extraction this state lived in the page and survived section-tab
  // switches, so returning to speaking kept an answered question on its
  // RECORDED card. On a truly fresh test questionRecordings is empty and
  // this resolves to IDLE, exactly as before.
  const [speakingState, setSpeakingState] = useState(() => (
    questionRecordings[`part${currentPart}_q0`]
      ? SPEAKING_STATES.RECORDED
      : SPEAKING_STATES.IDLE
  ));
  const [ttsAudioUrl, setTtsAudioUrl] = useState(null);
  const [part2PrepTime, setPart2PrepTime] = useState(60);
  const [isPreparing, setIsPreparing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  // TTS couldn't play (fetch failed or the audio element errored). We then
  // reveal the question TEXT and open the record path — Part 1/3 hides the
  // question by design (listening-first), so without this reveal a TTS outage
  // hard-locked the flow: Record only renders from READY_TO_RECORD, and
  // READY_TO_RECORD was only reachable via a successful playback ending
  // (Faz 1 fix, 2026-07-02 — the "Cambridge speaking stuck" QA report).
  const [ttsUnavailable, setTtsUnavailable] = useState(false);
  const recordingTimerRef = useRef(null);
  const ttsAudioRef = useRef(null);
  // Map<questionIndex, uuid> — keeps each question's id stable across
  // retries so the backend idempotency cache de-dupes the (user, request_id)
  // pair. Rotated on successful eval.
  const speakingRequestIdsRef = useRef({});
  // Live mirror of recordingTime so the MediaRecorder onstop closure (which
  // captured recordingTime=0 at setup) can read the final duration.
  const recordingSecondsRef = useRef(0);

  // Per-question evaluation modal state (D7 UI). The evaluation MAP itself is
  // page state (setQuestionEvaluations prop) because the page's submit flow
  // reads it.
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showNextQuestion, setShowNextQuestion] = useState(false); // eslint-disable-line no-unused-vars

  // Part 2 prep timer effect
  useEffect(() => {
    let interval;
    if (isPreparing && part2PrepTime > 0) {
      interval = setInterval(() => {
        setPart2PrepTime(prev => prev - 1);
      }, 1000);
    } else if (isPreparing && part2PrepTime === 0) {
      setIsPreparing(false);
      toast.info('Preparation time is over. Please start speaking.');
    }
    return () => clearInterval(interval);
  }, [isPreparing, part2PrepTime]);

  // Recording functions for Speaking
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(prev => ({
          ...prev,
          [`part${currentPart + 1}`]: url
        }));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Recording functions for individual Speaking questions
  const startRecordingForQuestion = async (questionIndex) => {
    // Stop any playing audio first
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current.currentTime = 0;
    }
    setTtsAudioUrl(null);

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Check for supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          // Use part-based key to avoid conflicts between parts
          const recordingKey = `part${currentPart}_q${questionIndex}`;
          setQuestionRecordings(prev => ({
            ...prev,
            [recordingKey]: url
          }));
          // Retain the blob + spoken duration for per-question evaluation at
          // submit time (recordingSecondsRef is the live timer value; the
          // recordingTime state would be stale inside this closure).
          speakingBlobsRef.current[recordingKey] = {
            blob,
            duration: recordingSecondsRef.current || 0,
            mimeType,
          };
          // Save to server
          saveRecordingToServer(blob, questionIndex);
        }

        // Clear recording timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }

        setSpeakingState(SPEAKING_STATES.RECORDED);
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        toast.error('Recording error occurred');
        setSpeakingState(SPEAKING_STATES.READY_TO_RECORD);
      };

      // Start recording with timeslice for continuous data
      mediaRecorder.start(1000);
      setIsRecording(true);
      setSpeakingState(SPEAKING_STATES.RECORDING);
      setRecordingTime(0);
      recordingSecondsRef.current = 0;

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        recordingSecondsRef.current += 1;
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone.');
      } else {
        toast.error(`Could not start recording: ${error.message}`);
      }
      setSpeakingState(SPEAKING_STATES.READY_TO_RECORD);
    }
  };

  const stopRecordingForQuestion = (questionIndex) => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        toast.success('Recording stopped');
      } catch (error) {
        console.error('Stop recording error:', error);
        setIsRecording(false);
        setSpeakingState(SPEAKING_STATES.RECORDED);
      }
    }
  };

  const saveRecordingToServer = async (blob, questionIndex) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, `question_${questionIndex}.webm`);
      formData.append('user_id', 'test_user');
      formData.append('test_id', `${bookId}_${testId}`);
      formData.append('section', currentSection);
      formData.append('part', String(currentPart + 1));
      formData.append('question_index', String(questionIndex));

      const response = await fetch(`${API_URL}/api/recordings/save`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('Recording saved to server');
      } else {
        console.error('Failed to save recording to server');
      }
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  };

  // Go to next question in Speaking
  const goToNextSpeakingQuestion = (questions) => { // eslint-disable-line no-unused-vars
    if (speakingQuestionIndex < questions.length - 1) {
      setSpeakingQuestionIndex(speakingQuestionIndex + 1);
      setSpeakingState(SPEAKING_STATES.IDLE);
      setRecordingTime(0);
    }
  };

  // Evaluate a speaking response
  const evaluateSpeakingResponse = async (questionIndex, questionText) => { // eslint-disable-line no-unused-vars
    const recordingUrl = questionRecordings[questionIndex];
    if (!recordingUrl) {
      toast.error('No recording found. Please record your answer first.');
      return;
    }

    setIsEvaluating(true);

    try {
      // Fetch the blob from the object URL
      const response = await fetch(recordingUrl);
      const blob = await response.blob();

      // Migrate to unified /api/speaking/evaluate (Sonnet + Azure pronunciation).
      // The legacy /api/cambridge/speaking/evaluate path used Whisper+GPT-4o
      // and is deprecated.
      const partNumber = currentPart + 1; // 1-3
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('user_id', user?.id || 'anonymous');
      formData.append('part', `part${partNumber}`);
      formData.append('cue_card_prompt', questionText || '');
      formData.append('cue_card_bullets', '');
      formData.append('user_language', 'en');
      formData.append('target_band', String(user?.target_band ?? 7.0));
      formData.append('duration_seconds', String(recordingTime || 0));
      formData.append('context', 'cambridge');
      formData.append('book_id', bookId);
      formData.append('test_id', testId);
      formData.append('question_id', `p${partNumber}_q${questionIndex}`);
      // Per-question stable id so retries hit the idempotency cache instead
      // of re-billing Azure + Sonnet.
      if (!speakingRequestIdsRef.current[questionIndex]) {
        speakingRequestIdsRef.current[questionIndex] = mintClientRequestId();
      }
      formData.append(
        'client_request_id',
        speakingRequestIdsRef.current[questionIndex],
      );

      const evalResponse = await fetch(`${API_URL}/api/speaking/evaluate`, {
        method: 'POST',
        body: formData,
      });

      if (!evalResponse.ok) {
        let detail = null;
        try { detail = await evalResponse.json(); } catch {}
        const message = detail?.detail?.message
          || detail?.detail
          || `Evaluation failed (HTTP ${evalResponse.status})`;
        toast.error(typeof message === 'string' ? message : 'Evaluation failed');
        return;
      }

      const unified = await evalResponse.json();

      // Adapt unified response → legacy shape consumed by CambridgeTestResults.
      // Unified: { scores: {overall, fc, lr, gra, pr}, criteria: {fc:{band,...}}, ... }
      // Legacy:  { overall_band, criteria: {fluency_coherence,...}, transcript, success }
      const transcript = Array.isArray(unified.transcript_tokens)
        ? unified.transcript_tokens.map(t => t?.t || '').join('').trim()
        : (Array.isArray(unified.live_transcript_words)
            ? unified.live_transcript_words.join(' ')
            : '');

      const adapted = {
        success: true,
        overall_band: unified?.scores?.overall ?? 5,
        criteria: {
          fluency_coherence: unified?.criteria?.fc?.band ?? unified?.scores?.fc ?? 5,
          lexical_resource: unified?.criteria?.lr?.band ?? unified?.scores?.lr ?? 5,
          grammatical_range: unified?.criteria?.gra?.band ?? unified?.scores?.gra ?? 5,
          pronunciation: unified?.criteria?.pr?.band ?? unified?.scores?.pr ?? 5,
        },
        feedback: unified?.liz_note || '',
        strengths: [
          ...(unified?.criteria?.fc?.strengths || []),
          ...(unified?.criteria?.lr?.strengths || []),
        ].slice(0, 4),
        weaknesses: [
          ...(unified?.criteria?.fc?.weaknesses || []),
          ...(unified?.criteria?.gra?.weaknesses || []),
        ].slice(0, 4),
        tip: unified?.liz_note || '',
        transcript,
        word_count: transcript ? transcript.split(/\s+/).filter(Boolean).length : 0,
        audio_url: unified?.audio_url || null,
        // Keep raw unified payload for the new D7 UI/drawer downstream.
        unified,
      };

      setQuestionEvaluations(prev => ({
        ...prev,
        [questionIndex]: adapted,
      }));
      setCurrentEvaluation(adapted);
      setShowEvaluationModal(true);
      // Rotate so a fresh re-record + re-evaluate gets a new id.
      delete speakingRequestIdsRef.current[questionIndex];
      toast.success('Evaluation complete!');
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Could not evaluate response');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Generate TTS for current question
  const playQuestionAudio = async (questionText, isFirst = false) => {
    const playKey = `part${currentPart}_q${speakingQuestionIndex}`;
    const playCount = questionPlayCounts[playKey] || 0;
    if (playCount >= 2) {
      toast.error('Maximum 2 plays reached for this question');
      return;
    }

    setSpeakingState(SPEAKING_STATES.LOADING_AUDIO);

    try {
      // Add transition phrase if not first question
      let textToSpeak = questionText;
      if (!isFirst && playCount === 0) {
        const transitions = [
          "Now, let me ask you... ",
          "Moving on... ",
          "And what about this... ",
          "I would like to ask you... ",
        ];
        textToSpeak = transitions[speakingQuestionIndex % transitions.length] + questionText;
      }

      const _email = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null')?.email || null; } catch { return null; } })();
      const res = await fetch(`${API_URL}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, email: _email })
      });

      const data = await res.json();
      if (data.audio_url) {
        // Increment play count with part-based key
        setQuestionPlayCounts(prev => ({
          ...prev,
          [playKey]: playCount + 1
        }));

        setTtsAudioUrl(`${API_URL}${data.audio_url}`);
        setSpeakingState(SPEAKING_STATES.PLAYING_PROMPT);
      } else {
        throw new Error('No audio URL returned');
      }
    } catch (error) {
      console.error('TTS Error:', error);
      // Never dead-end the flow on a TTS failure: reveal the question text
      // and open the record path (READY_TO_RECORD) instead of bouncing to
      // IDLE, where Record is unreachable.
      toast.error('Question audio unavailable — read the question and record your answer.');
      setTtsUnavailable(true);
      setSpeakingState(SPEAKING_STATES.READY_TO_RECORD);
    }
  };

  // Handle TTS audio ended - now ready to record
  const handleTTSEnded = () => {
    setSpeakingState(SPEAKING_STATES.READY_TO_RECORD);
    setTtsAudioUrl(null); // Clear URL to prevent re-play
  };

  // The <audio> element itself can error after a good /generate response
  // (404'd cache file, decode error). Same recovery as a failed fetch —
  // without this the UI sat on "Listen carefully..." forever.
  const handleTTSError = () => {
    toast.error('Question audio unavailable — read the question and record your answer.');
    setTtsUnavailable(true);
    setTtsAudioUrl(null);
    setSpeakingState(SPEAKING_STATES.READY_TO_RECORD);
  };

  // Start Part 2 preparation timer
  const startPart2Prep = () => {
    setIsPreparing(true);
    setPart2PrepTime(60);
  };

  // Render Speaking Section - Real IELTS style
  const parts = sectionData?.parts || [];
  const currentSpeakingPart = parts[currentPart];

  if (!currentSpeakingPart) return null;

  // Get questions for Part 1 or Part 3
  let questions = [];
  if (currentSpeakingPart.questions) {
    questions = currentSpeakingPart.questions;
  } else if (currentSpeakingPart.sample_questions) {
    // Support sample_questions field
    questions = currentSpeakingPart.sample_questions;
  } else if (currentSpeakingPart.topics) {
    // Part 1 - topics array with questions
    questions = currentSpeakingPart.topics.flatMap(t => t.questions || []);
  } else if (currentSpeakingPart.discussion_topics) {
    // Part 3 - discussion_topics array with questions
    questions = currentSpeakingPart.discussion_topics.flatMap(dt => dt.questions || []);
  }

  const isPart1or3 = currentSpeakingPart.part_number === 1 || currentSpeakingPart.part_number === 3;
  const isPart2 = currentSpeakingPart.part_number === 2;

  return (
    <>
    <div className="space-y-4">
      {/* Part Navigation */}
      <div className="flex gap-2">
        {parts.map((part, idx) => (
          <Button
            key={idx}
            variant={currentPart === idx ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCurrentPart(idx);
              setSpeakingQuestionIndex(0);
              // Land on RECORDED (not IDLE) when this question already has an
              // answer, so the playback/re-record card is visible again.
              setSpeakingState(
                questionRecordings[`part${idx}_q0`]
                  ? SPEAKING_STATES.RECORDED
                  : SPEAKING_STATES.IDLE
              );
              setTtsAudioUrl(null);
              setTtsUnavailable(false);
              setRecordingTime(0);
              setIsPreparing(false);
            }}
            className={currentPart === idx ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            Part {part.part_number}
          </Button>
        ))}
      </div>

      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge className="bg-orange-100 text-orange-700 mb-2">Part {currentSpeakingPart.part_number}</Badge>
            <h3 className="font-bold text-lg text-gray-900">{currentSpeakingPart.title}</h3>
          </div>
          <Badge className="bg-gray-100 text-gray-700">{currentSpeakingPart.duration}</Badge>
        </div>

        {/* Part 1 or Part 3 - Individual Question Interface */}
        {isPart1or3 && (
          <div className="space-y-6">
            {/* Topic hint - Part 1 shows topic, Part 3 shows discussion topics */}
            {currentSpeakingPart.topics && currentSpeakingPart.topics.length > 0 && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
                <span className="text-sm font-medium text-orange-700">
                  Topic: {currentSpeakingPart.topics.map(t => typeof t === 'string' ? t : t.topic).join(', ')}
                </span>
              </div>
            )}
            {currentSpeakingPart.discussion_topics && currentSpeakingPart.discussion_topics.length > 0 && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
                <span className="text-sm font-medium text-orange-700">
                  Discussion: {currentSpeakingPart.discussion_topics.map(dt => dt.topic).join(', ')}
                </span>
              </div>
            )}
            {currentSpeakingPart.topic && !currentSpeakingPart.topics && !currentSpeakingPart.discussion_topics && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
                <span className="text-sm font-medium text-orange-700">Topic: {currentSpeakingPart.topic}</span>
              </div>
            )}

            {/* Question Progress */}
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-gray-600">Question {speakingQuestionIndex + 1} of {questions.length}</span>
              <div className="flex gap-1">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full ${
                      idx < speakingQuestionIndex ? 'bg-green-500' :
                      idx === speakingQuestionIndex ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Current Question Card */}
            <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  speakingState === SPEAKING_STATES.RECORDING ? 'bg-red-500 animate-pulse' :
                  speakingState === SPEAKING_STATES.PLAYING_PROMPT ? 'bg-blue-500' :
                  speakingState === SPEAKING_STATES.RECORDED ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                  {speakingState === SPEAKING_STATES.RECORDING ? (
                    <Mic className="w-8 h-8 text-white" />
                  ) : speakingState === SPEAKING_STATES.PLAYING_PROMPT ? (
                    <Volume2 className="w-8 h-8 text-white" />
                  ) : (
                    <Headphones className="w-8 h-8 text-white" />
                  )}
                </div>
                <h4 className="text-lg font-semibold">Question {speakingQuestionIndex + 1}</h4>

                {/* State indicator */}
                <p className="text-sm text-gray-400 mt-1">
                  {speakingState === SPEAKING_STATES.IDLE && 'Click Listen to hear the question'}
                  {speakingState === SPEAKING_STATES.LOADING_AUDIO && 'Loading audio...'}
                  {speakingState === SPEAKING_STATES.PLAYING_PROMPT && 'Listen carefully...'}
                  {speakingState === SPEAKING_STATES.READY_TO_RECORD && 'Ready to record - click Record Answer'}
                  {speakingState === SPEAKING_STATES.RECORDING && `Recording... ${recordingTime}s`}
                  {speakingState === SPEAKING_STATES.RECORDED && 'Answer recorded!'}
                </p>
              </div>

              {/* TTS Audio (hidden) */}
              {ttsAudioUrl && (
                <audio
                  ref={ttsAudioRef}
                  src={ttsAudioUrl}
                  autoPlay
                  onEnded={handleTTSEnded}
                  onError={handleTTSError}
                  onPlay={() => setSpeakingState(SPEAKING_STATES.PLAYING_PROMPT)}
                />
              )}

              {/* Question text reveal — only when audio can't carry it:
                  TTS failed, or both plays are spent (the candidate can no
                  longer re-listen, so hiding the text just blocks them). */}
              {(ttsUnavailable ||
                (questionPlayCounts[`part${currentPart}_q${speakingQuestionIndex}`] || 0) >= 2) && (
                <div className="p-4 mb-6 bg-slate-700/60 rounded-lg border border-slate-600 text-center">
                  <p className="text-sm text-gray-200">{questions[speakingQuestionIndex]}</p>
                </div>
              )}

              {/* Step 1: Listen Button */}
              {(speakingState === SPEAKING_STATES.IDLE || speakingState === SPEAKING_STATES.LOADING_AUDIO || speakingState === SPEAKING_STATES.PLAYING_PROMPT) && (
                <div className="flex flex-col items-center gap-4 mb-6">
                  <Button
                    onClick={() => playQuestionAudio(questions[speakingQuestionIndex], speakingQuestionIndex === 0)}
                    disabled={speakingState === SPEAKING_STATES.LOADING_AUDIO || speakingState === SPEAKING_STATES.PLAYING_PROMPT || (questionPlayCounts[`part${currentPart}_q${speakingQuestionIndex}`] || 0) >= 2}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 px-8"
                    size="lg"
                  >
                    {speakingState === SPEAKING_STATES.LOADING_AUDIO ? (
                      <>Loading...</>
                    ) : speakingState === SPEAKING_STATES.PLAYING_PROMPT ? (
                      <>
                        <div className="flex gap-1 mr-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-1 h-4 bg-white rounded animate-pulse" />
                          ))}
                        </div>
                        Playing...
                      </>
                    ) : (
                      <>
                        <Headphones className="w-5 h-5 mr-2" /> Listen to Question
                      </>
                    )}
                  </Button>
                  <span className="text-sm text-gray-400">
                    ({Math.max(0, 2 - (questionPlayCounts[`part${currentPart}_q${speakingQuestionIndex}`] || 0))} plays left)
                  </span>
                  {/* Plays spent while back in IDLE (e.g. after Previous/Next
                      navigation): Listen is disabled, so give the candidate
                      an explicit way into the record step — otherwise this
                      was a hard dead-end. */}
                  {speakingState === SPEAKING_STATES.IDLE &&
                    (questionPlayCounts[`part${currentPart}_q${speakingQuestionIndex}`] || 0) >= 2 && (
                    <Button
                      onClick={() => setSpeakingState(SPEAKING_STATES.READY_TO_RECORD)}
                      className="bg-red-600 hover:bg-red-700"
                      size="lg"
                    >
                      <Mic className="w-5 h-5 mr-2" /> Continue to Recording
                    </Button>
                  )}
                </div>
              )}

              {/* Step 2: Record Button - Only after listening */}
              {(speakingState === SPEAKING_STATES.READY_TO_RECORD || speakingState === SPEAKING_STATES.RECORDING) && (
                <div className="flex flex-col items-center gap-4 mb-6">
                  {speakingState === SPEAKING_STATES.READY_TO_RECORD ? (
                    <Button
                      onClick={() => startRecordingForQuestion(speakingQuestionIndex)}
                      className="bg-red-600 hover:bg-red-700 px-8"
                      size="lg"
                    >
                      <Mic className="w-5 h-5 mr-2" /> Record Answer
                    </Button>
                  ) : (
                    <Button
                      onClick={() => stopRecordingForQuestion(speakingQuestionIndex)}
                      variant="destructive"
                      size="lg"
                      className="animate-pulse px-8"
                    >
                      <Pause className="w-5 h-5 mr-2" /> Stop ({recordingTime}s)
                    </Button>
                  )}

                  {/* Re-listen option */}
                  {speakingState === SPEAKING_STATES.READY_TO_RECORD && (questionPlayCounts[`part${currentPart}_q${speakingQuestionIndex}`] || 0) < 2 && (
                    <Button
                      variant="ghost"
                      onClick={() => playQuestionAudio(questions[speakingQuestionIndex], false)}
                      className="text-gray-400 hover:text-white"
                      size="sm"
                    >
                      Listen again ({2 - (questionPlayCounts[`part${currentPart}_q${speakingQuestionIndex}`] || 0)} left)
                    </Button>
                  )}
                </div>
              )}

              {/* Step 3: Recorded - Show playback */}
              {speakingState === SPEAKING_STATES.RECORDED && questionRecordings[`part${currentPart}_q${speakingQuestionIndex}`] && (
                <div className="flex flex-col items-center gap-4 mb-6">
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Answer recorded
                  </p>
                  <audio
                    src={questionRecordings[`part${currentPart}_q${speakingQuestionIndex}`]}
                    controls
                    className="mx-auto"
                  />

                  {/* Re-record option */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSpeakingState(SPEAKING_STATES.READY_TO_RECORD);
                      setRecordingTime(0);
                    }}
                    className="text-white border-gray-600 hover:bg-gray-700"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" /> Re-record
                  </Button>
                </div>
              )}
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={() => {
                  if (speakingQuestionIndex > 0) {
                    const prevIdx = speakingQuestionIndex - 1;
                    setSpeakingQuestionIndex(prevIdx);
                    setSpeakingState(
                      questionRecordings[`part${currentPart}_q${prevIdx}`]
                        ? SPEAKING_STATES.RECORDED
                        : SPEAKING_STATES.IDLE
                    );
                    setTtsAudioUrl(null);
                    setTtsUnavailable(false);
                    setRecordingTime(0);
                  }
                }}
                variant="outline"
                disabled={speakingQuestionIndex === 0}
              >
                Previous Question
              </Button>

              {speakingQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={() => {
                    const nextIdx = speakingQuestionIndex + 1;
                    setSpeakingQuestionIndex(nextIdx);
                    setSpeakingState(
                      questionRecordings[`part${currentPart}_q${nextIdx}`]
                        ? SPEAKING_STATES.RECORDED
                        : SPEAKING_STATES.IDLE
                    );
                    setTtsAudioUrl(null);
                    setTtsUnavailable(false);
                    setRecordingTime(0);
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Next Question <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (currentPart < parts.length - 1) {
                      setCurrentPart(currentPart + 1);
                      setSpeakingQuestionIndex(0);
                      setSpeakingState(SPEAKING_STATES.IDLE);
                      setTtsAudioUrl(null);
                      setRecordingTime(0);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={currentPart >= parts.length - 1}
                >
                  {currentPart < parts.length - 1 ? 'Go to Next Part' : 'All Questions Done'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Part 2 - Task Card (Visible) */}
        {isPart2 && (currentSpeakingPart.cue_card || currentSpeakingPart.task_card || currentSpeakingPart.topic_card) && (
          <div className="space-y-6">
            {/* Task Card - Visible like real test */}
            <div className="p-6 bg-amber-50 border-2 border-amber-400 rounded-xl shadow-md">
              <div className="text-center mb-4">
                <Badge className="bg-amber-200 text-amber-800 text-sm px-4 py-1">TASK CARD</Badge>
              </div>
              <h4 className="font-bold text-lg mb-4 text-amber-900">
                {currentSpeakingPart.cue_card?.topic ||
                 (currentSpeakingPart.task_card || currentSpeakingPart.topic_card)?.instruction}
              </h4>
              <p className="text-sm text-gray-600 mb-4 font-medium">You should say:</p>
              <ul className="space-y-3 mb-6">
                {(currentSpeakingPart.cue_card?.bullet_points ||
                  currentSpeakingPart.cue_card?.points ||
                  (currentSpeakingPart.task_card || currentSpeakingPart.topic_card)?.points ||
                  (currentSpeakingPart.task_card || currentSpeakingPart.topic_card)?.bullets)?.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-3 text-gray-700">
                    <span className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 text-amber-800 font-bold text-sm">
                      •
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              {(currentSpeakingPart.cue_card?.final_prompt ||
                (currentSpeakingPart.task_card || currentSpeakingPart.topic_card)?.final_prompt) && (
                <div className="pt-4 border-t border-amber-300">
                  <p className="text-sm text-amber-700 font-medium">
                    {currentSpeakingPart.cue_card?.final_prompt ||
                     (currentSpeakingPart.task_card || currentSpeakingPart.topic_card).final_prompt}
                  </p>
                </div>
              )}
              {currentSpeakingPart.examiner_note && (
                <div className="mt-4 pt-4 border-t border-amber-200 text-xs text-gray-500 italic">
                  {currentSpeakingPart.examiner_note}
                </div>
              )}
            </div>

            {/* Preparation Timer */}
            {!isPreparing && part2PrepTime === 60 && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">You have 1 minute to prepare. Click when ready.</p>
                <Button onClick={startPart2Prep} className="bg-blue-600 hover:bg-blue-700">
                  <Clock className="w-4 h-4 mr-2" /> Start 1 Minute Preparation
                </Button>
              </div>
            )}

            {isPreparing && (
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <p className="text-blue-700 font-medium mb-2">Preparation Time</p>
                <div className="text-4xl font-mono font-bold text-blue-600">
                  {Math.floor(part2PrepTime / 60)}:{(part2PrepTime % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-sm text-blue-500 mt-2">Think about what you want to say</p>
              </div>
            )}

            {/* Recording Controls */}
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  {isPreparing ? 'Prepare your answer, then record' : 'Record your response (1-2 minutes)'}
                </p>
                <div className="flex justify-center gap-4">
                  {!isRecording ? (
                    <Button
                      onClick={() => startRecordingForQuestion('part2')}
                      className="bg-red-600 hover:bg-red-700"
                      size="lg"
                      disabled={isPreparing}
                    >
                      <Mic className="w-5 h-5 mr-2" /> Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={() => stopRecordingForQuestion('part2')}
                      variant="destructive"
                      size="lg"
                      className="animate-pulse"
                    >
                      <Pause className="w-5 h-5 mr-2" /> Stop Recording ({recordingTime}s)
                    </Button>
                  )}
                </div>

                {questionRecordings['part1_qpart2'] && (
                  <div className="mt-4">
                    <p className="text-sm text-green-600 mb-2">Recording saved!</p>
                    <audio
                      src={questionRecordings['part1_qpart2']}
                      controls
                      className="mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Part 2 → Part 3 navigation (mirrors Part 1/3 flow) */}
            {questionRecordings['part1_qpart2'] && (
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (currentPart < parts.length - 1) {
                      setCurrentPart(currentPart + 1);
                      setSpeakingQuestionIndex(0);
                      setSpeakingState(SPEAKING_STATES.IDLE);
                      setTtsAudioUrl(null);
                      setRecordingTime(0);
                      setIsPreparing(false);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={currentPart >= parts.length - 1}
                >
                  {currentPart < parts.length - 1 ? 'Go to Next Part' : 'All Questions Done'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>

    {/* D7 Speaking evaluation modal — fires after each per-question evaluate */}
    {showEvaluationModal && currentEvaluation && (() => {
      const adapted = adaptSpeakingResult(currentEvaluation, {
        targetBand: location.state?.target_band,
      });
      if (!adapted) return null;
      return (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowEvaluationModal(false)}
        >
          <div
            className="speaking-scope bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">Response evaluation</h3>
              <button
                onClick={() => setShowEvaluationModal(false)}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SpeakingResultsState
              data={adapted}
              onRetryCard={() => setShowEvaluationModal(false)}
              onNewCard={() => setShowEvaluationModal(false)}
            />
          </div>
        </div>
      );
    })()}
    </>
  );
}
