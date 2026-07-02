import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { ArrowLeft, Mic, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useGoBack } from '../../../../hooks/useGoBack';
import '../../speaking.css';
import SpeakingHelperPanel from '../../../speakingHelper/SpeakingHelperPanel';
import { STATES } from './qbConstants';
import { useQbTopics } from './hooks/useQbTopics';
import { useQbSubmission } from './hooks/useQbSubmission';
import TopicPicker, { QbLoadingScreen } from './TopicPicker';
import PartPicker from './PartPicker';
import Part2Flow from './Part2Flow';
import QuestionFlow from './QuestionFlow';
import TierModal from './TierModal';
import SubmittingOverlay from './SubmittingOverlay';
import ResultsPanel from './ResultsPanel';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function SpeakingQBPage({ user }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [searchParams] = useSearchParams();
  const initialTrack = searchParams.get('track') || 'academic';
  const initialBand = searchParams.get('band');
  const initialSetId = searchParams.get('set');
  const mode = searchParams.get('mode') || 'test';

  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState(null);
  // Per-part picker: after a module loads, the user lands on a chooser screen
  // (Part 1 / Part 2 / Part 3) instead of being railroaded through all 10
  // questions. selectedPart=null means the picker is showing; once chosen we
  // mirror it into currentPart and run only that part's question loop.
  const [selectedPart, setSelectedPart] = useState(null);
  const [currentPart, setCurrentPart] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordingState, setRecordingState] = useState(STATES.IDLE);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [showText, setShowText] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  // Object URL of the most-recently-stopped recording. Lets the candidate
  // press Play to verify their mic actually captured speech before they
  // commit to the next question / submit. Revoked when a new recording
  // starts or when the part is left.
  const [lastRecordingUrl, setLastRecordingUrl] = useState(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [prepTime, setPrepTime] = useState(60);
  const [speakingTime, setSpeakingTime] = useState(0);
  const [isPrepPhase, setIsPrepPhase] = useState(false);

  const [filterTrack, setFilterTrack] = useState(initialTrack);
  const [filterBand, setFilterBand] = useState(initialBand || '');
  const [userCredits, setUserCredits] = useState(0);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  // Holds the latest stopRecording so the state-driven countdown effect can
  // auto-stop without re-subscribing every second (stopRecording's identity
  // changes as speakingTime ticks).
  const stopRecordingRef = useRef(null);
  // Prompt-phase ("Listening...") failure guards. The prompt audio can 404,
  // fail to decode, get blocked by autoplay, or never emit `ended` (broken
  // file) — any of which previously hung the user on "Listening..." forever.
  // promptAdvancedRef ensures we leave the prompt phase exactly once no matter
  // which recovery signal fires first; promptWatchdogRef is the last-resort
  // timer; advanceFromPromptRef always holds the latest advance closure so the
  // timers/handlers never call a stale one.
  const promptAdvancedRef = useRef(false);
  const promptWatchdogRef = useRef(null);
  const advanceFromPromptRef = useRef(() => {});
  // Stable across retries of a single QB part submission. Backend
  // /api/speaking/evaluate de-dupes on (user_id, client_request_id).
  const clientRequestIdRef = useRef(null);
  const audioBlobsRef = useRef({}); // Store audio blobs for premium evaluation
  // In-memory prefetch cache for /api/speaking/set/{setId}. Filled on
  // topic-card hover so the click feels instant — Safari especially can
  // take 1–2s to resolve audio_urls + cue card content. Cleared on unmount.
  const prefetchedSetsRef = useRef({});

  // Fetch user credits on mount
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_URL}/api/users/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserCredits(data.examCredits || 0);
        }
      } catch (error) {
        console.error('Error fetching user credits:', error);
      }
    };
    fetchUserCredits();
  }, [user?.id]);

  // Watchdog cleanup on filter change / unmount. (Originally lived in the
  // same effect that fired loadModules — the data fetch moved to useQbTopics,
  // the deps and cleanup timing stay identical.)
  useEffect(() => {
    return () => {
      if (promptWatchdogRef.current) clearTimeout(promptWatchdogRef.current);
    };
  }, [filterTrack, filterBand]);

  const selectModule = async (setId) => {
    // Prefetch hit: hover already loaded this set — apply instantly,
    // skipping the spinner entirely.
    const prefetched = prefetchedSetsRef.current[setId];
    if (prefetched && prefetched !== 'pending') {
      setSelectedModule(setId);
      setModuleContent(prefetched);
      setSelectedPart(null);
      setCurrentPart(1);
      setCurrentQuestionIndex(0);
      setRecordingState(STATES.IDLE);
      setAnswers([]);
      setResults(null);
      audioBlobsRef.current = {};
      setShowText(prefetched.show_text || mode === 'practice');
      setTimeLeft(prefetched.part1?.answer_time_max || 25);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/speaking/set/${setId}?include_audio=true&mode=${mode}`);
      const data = await res.json();

      if (data.success) {
        prefetchedSetsRef.current[setId] = data.set;
        setSelectedModule(setId);
        setModuleContent(data.set);
        setSelectedPart(null);
        setCurrentPart(1);
        setCurrentQuestionIndex(0);
        setRecordingState(STATES.IDLE);
        setAnswers([]);
        setResults(null);
        audioBlobsRef.current = {}; // Clear stored audio blobs
        setShowText(data.set.show_text || mode === 'practice');
        setTimeLeft(data.set.part1?.answer_time_max || 25);
      }
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load speaking set');
    } finally {
      setLoading(false);
    }
  };

  // Topic list data layer: SWR sessionStorage cache, hover prefetch into
  // prefetchedSetsRef (owned here, shared with selectModule), loading tips.
  const { modules, tipIndex, prefetchSet } = useQbTopics({
    filterTrack,
    filterBand,
    mode,
    initialSetId,
    selectModule,
    prefetchedSetsRef,
    loading,
    setLoading,
  });

  // Submission pipeline: crash-safe persistence, durable async grading jobs,
  // page-leave resume, and the overlay's tier/step/error state.
  const {
    pendingResume,
    submittingTier,
    submitStep,
    submitError,
    submitTest,
    resumePendingSubmission,
    dismissPendingResume,
    setSubmittingTier,
    setSubmitStep,
    setSubmitError,
  } = useQbSubmission({
    user,
    currentPart,
    selectedModule,
    moduleContent,
    answers,
    audioBlobsRef,
    clientRequestIdRef,
    setResults,
    setShowTierModal,
  });

  const getCurrentQuestion = useCallback(() => {
    if (!moduleContent) return null;
    if (currentPart === 1) return moduleContent.part1?.questions?.[currentQuestionIndex];
    if (currentPart === 2) return { id: 'part2', cue_card: moduleContent.part2?.cue_card };
    if (currentPart === 3) return moduleContent.part3?.questions?.[currentQuestionIndex];
    return null;
  }, [moduleContent, currentPart, currentQuestionIndex]);

  // Single-fire exit from the "Listening..." prompt phase. Whichever signal
  // arrives first — audio `ended`, an `error`/404, a rejected play() promise,
  // or the watchdog — wins; the rest no-op. Refreshed every render so the
  // timers/handlers always run against the current part.
  advanceFromPromptRef.current = () => {
    if (promptAdvancedRef.current) return;
    promptAdvancedRef.current = true;
    if (promptWatchdogRef.current) {
      clearTimeout(promptWatchdogRef.current);
      promptWatchdogRef.current = null;
    }
    if (currentPart === 2) startPrepPhase();
    else startRecording();
  };

  const playQuestionAudio = useCallback(async () => {
    const question = getCurrentQuestion();
    if (!question) return;

    // Arm the prompt-phase guards before anything can fire.
    promptAdvancedRef.current = false;
    if (promptWatchdogRef.current) {
      clearTimeout(promptWatchdogRef.current);
      promptWatchdogRef.current = null;
    }
    setRecordingState(STATES.PROMPT_PLAYING);

    let audioUrl = null;
    if (currentPart === 1) audioUrl = question.audio_url;
    else if (currentPart === 2) audioUrl = moduleContent.part2?.audio_url;
    else if (currentPart === 3) audioUrl = question.audio_url;

    if (audioUrl && audioRef.current) {
      const fullUrl = audioUrl.startsWith('/api') ? `${API_URL}${audioUrl}` : audioUrl;
      // Last-resort watchdog: if the prompt audio stalls or never emits `ended`
      // (broken file that still loads metadata), don't strand the user on
      // "Listening...". Prompts are short sentences (<12s), so 30s never trips
      // during real playback. The `error`/`catch` paths handle the fast 404 case.
      promptWatchdogRef.current = setTimeout(() => advanceFromPromptRef.current(), 30000);
      audioRef.current.src = fullUrl;
      try {
        const p = audioRef.current.play();
        if (p && typeof p.then === 'function') {
          p.catch(() => advanceFromPromptRef.current());
        }
      } catch (_) {
        advanceFromPromptRef.current();
      }
    } else {
      // No audio attached to this question — go straight to prep/recording.
      setTimeout(() => advanceFromPromptRef.current(), 500);
    }
  }, [getCurrentQuestion, currentPart, moduleContent]);

  const handleAudioEnded = () => {
    // The shared <audio> element drives both prompt playback (auto-advance to
    // recording) and the user's own recording playback (just stop). Only the
    // PROMPT_PLAYING phase should kick off recording — playback during
    // READY_NEXT just rewinds the playback button.
    if (recordingState === STATES.READY_NEXT) {
      setIsPlayingBack(false);
      return;
    }
    if (recordingState !== STATES.PROMPT_PLAYING) return;
    advanceFromPromptRef.current();
  };

  // Same shared <audio> element: a load/decode error during prompt playback
  // must advance the user (so a missing audio_url can't freeze "Listening..."),
  // but an error while replaying their own recording just resets the button.
  const handleAudioError = () => {
    if (recordingState === STATES.READY_NEXT) {
      setIsPlayingBack(false);
      return;
    }
    if (recordingState !== STATES.PROMPT_PLAYING) return;
    advanceFromPromptRef.current();
  };

  // Prep is state-driven exactly like the recording countdown below: the
  // interval only decrements state, and a separate watcher starts recording at
  // 0. The old version called startRecording() INSIDE the setPrepTime updater —
  // updaters can be invoked twice (StrictMode/concurrent), which is the classic
  // double-getUserMedia / frozen-countdown bug this file already fixed once for
  // the recording timer.
  const startPrepPhase = () => {
    setIsPrepPhase(true);
    setPrepTime(60);
    setRecordingState(STATES.IDLE);
  };

  // Part 2 is the D7 "wow" cue-card experience end-to-end. Landing on Part 2
  // drops the candidate straight into the 1-minute preparation (the real-test
  // behaviour) so they see the polished prep surface — big cue card, live
  // countdown, notepad — instead of a bare "Start" screen with an empty status
  // card. Condition-gated rather than ref-gated so the mic-denied / no-audio
  // recovery paths (which bounce back to IDLE) re-arm it: the user lands back on
  // prep, never on an empty card. Parts 1 & 3 keep their listen-then-record flow.
  useEffect(() => {
    if (
      currentPart === 2 &&
      selectedPart === 2 &&
      moduleContent &&
      !results &&
      recordingState === STATES.IDLE &&
      !isPrepPhase &&
      !recordingIntentRef.current
    ) {
      startPrepPhase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPart, selectedPart, moduleContent, results, recordingState, isPrepPhase]);

  // Set while startRecording is in-flight (mic getUserMedia is async, so there's
  // a render gap where recordingState is still IDLE and isPrepPhase is already
  // false). The Part 2 auto-prep effect checks this so it can't spuriously
  // restart preparation during that gap (which would race a second prep timer
  // against the recording we're about to begin).
  const recordingIntentRef = useRef(false);

  const startRecording = async () => {
    recordingIntentRef.current = true;
    try {
      audioChunksRef.current = [];
      // Stop any active playback and free the previous blob URL so the user
      // doesn't get the prior question's audio still playing while recording.
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (_) { /* ignore */ }
      }
      setIsPlayingBack(false);
      if (lastRecordingUrl) {
        try { URL.revokeObjectURL(lastRecordingUrl); } catch (_) { /* ignore */ }
        setLastRecordingUrl(null);
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => stream.getTracks().forEach(track => track.stop());

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecordingState(STATES.RECORDING);
      recordingIntentRef.current = false;

      const maxTime = currentPart === 2 ? 120 : (currentPart === 3 ? 75 : 25);
      setSpeakingTime(0);
      setTimeLeft(maxTime);
      // The countdown itself is driven by a state effect keyed on RECORDING
      // (see below) — no inline interval here, so the async getUserMedia await
      // above can't race the timer into a frozen/stuck state.
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
      recordingIntentRef.current = false;
      setRecordingState(STATES.IDLE);
    }
  };

  const stopRecording = useCallback(async () => {
    // Resilient stop: ALWAYS leave RECORDING so the user can never get stuck on
    // the recording screen (the old code gated the whole transition on
    // mediaRecorder.state === 'recording'; when that wasn't true it silently
    // did nothing and the UI froze). Capture whatever audio exists, finalize if
    // we have any, otherwise reset to IDLE with a clear message.
    setRecordingState(STATES.PROCESSING);
    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state === 'recording') {
        mr.stop();
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (_) { /* recorder already gone — fall through to finalize */ }

    const chunks = audioChunksRef.current || [];
    if (chunks.length === 0) {
      audioChunksRef.current = [];
      mediaRecorderRef.current = null;
      toast.error('No audio was captured. Tap Start and record again.');
      setRecordingState(STATES.IDLE);
      return;
    }

    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
    const question = getCurrentQuestion();
    const questionId = question?.id || `part${currentPart}`;
    const transcript = await transcribeAudio(audioBlob, questionId, String(currentPart));

    // Store audio blob for premium evaluation
    audioBlobsRef.current[questionId] = audioBlob;

    const answer = {
      part: String(currentPart),
      question_id: questionId,
      question: currentPart === 2 ? moduleContent.part2?.cue_card?.topic : question?.text,
      transcript: transcript || '[No speech detected]',
      duration: speakingTime,
    };

    setAnswers((prev) => [...prev, answer]);
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;

    // Expose this question's audio for playback verification. Revoke any prior
    // URL to avoid leaking blob: handles across questions.
    setLastRecordingUrl((prev) => {
      if (prev) {
        try { URL.revokeObjectURL(prev); } catch (_) { /* ignore */ }
      }
      return URL.createObjectURL(audioBlob);
    });

    setRecordingState(STATES.READY_NEXT);
  }, [getCurrentQuestion, currentPart, moduleContent, speakingTime]);

  // Keep a live handle to stopRecording for the countdown effect (below).
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  // State-driven recording countdown. Runs only while RECORDING, cleans up on
  // any state change — so it cannot freeze, leak, or collide with the prep
  // timer. A separate watcher auto-stops at 0 (no side-effects inside setState).
  useEffect(() => {
    if (recordingState !== STATES.RECORDING) return undefined;
    const id = setInterval(() => {
      setSpeakingTime((s) => s + 1);
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [recordingState]);

  useEffect(() => {
    if (recordingState === STATES.RECORDING && timeLeft === 0) {
      stopRecordingRef.current?.();
    }
  }, [timeLeft, recordingState]);

  // State-driven prep countdown (mirror of the recording countdown above).
  // Runs only while isPrepPhase; cleans up on any change — backToParts just
  // flips isPrepPhase and the interval dies with it.
  useEffect(() => {
    if (!isPrepPhase) return undefined;
    const id = setInterval(() => setPrepTime((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(id);
  }, [isPrepPhase]);

  useEffect(() => {
    if (isPrepPhase && prepTime === 0) {
      setIsPrepPhase(false);
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepTime, isPrepPhase]);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current || !lastRecordingUrl) return;
    if (isPlayingBack) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingBack(false);
      return;
    }
    audioRef.current.src = lastRecordingUrl;
    audioRef.current.play().then(() => setIsPlayingBack(true)).catch(() => setIsPlayingBack(false));
  }, [lastRecordingUrl, isPlayingBack]);

  const transcribeAudio = async (blob, questionId, part) => {
    // Bounded so a hung/slow transcribe never strands the user on the
    // Processing screen — stopRecording proceeds to READY_NEXT with a null
    // transcript and the real evaluation re-transcribes on submit anyway.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('question_id', questionId);
      formData.append('part', part);

      const res = await fetch(`${API_URL}/api/speaking/transcribe`, {
        method: 'POST', body: formData, signal: controller.signal,
      });
      const data = await res.json();
      return data.success ? data.transcript : null;
    } catch (error) {
      console.error('Transcription error:', error);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  };

  // Disarm the "Listening..." prompt phase when the user leaves the question
  // screen. Without this, a pending 30s watchdog (or a late play().catch) could
  // fire on the part-picker screen and silently start prep/recording — mic on,
  // no question mounted (Faz 1 fix, 2026-07-02). Setting promptAdvancedRef
  // makes every queued advance callback a no-op; playQuestionAudio re-arms it.
  const cancelPromptPhase = () => {
    promptAdvancedRef.current = true;
    if (promptWatchdogRef.current) {
      clearTimeout(promptWatchdogRef.current);
      promptWatchdogRef.current = null;
    }
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch (_) { /* ignore */ }
    }
  };

  const choosePart = (partNum) => {
    cancelPromptPhase();
    setSelectedPart(partNum);
    setCurrentPart(partNum);
    setCurrentQuestionIndex(0);
    setRecordingState(STATES.IDLE);
    setIsPrepPhase(false);
    setAnswers([]);
    audioBlobsRef.current = {};
  };

  const backToParts = () => {
    cancelPromptPhase();
    setSelectedPart(null);
    setCurrentPart(1);
    setCurrentQuestionIndex(0);
    setRecordingState(STATES.IDLE);
    setIsPrepPhase(false);
    setAnswers([]);
    audioBlobsRef.current = {};
    if (lastRecordingUrl) {
      try { URL.revokeObjectURL(lastRecordingUrl); } catch (_) { /* ignore */ }
    }
    setLastRecordingUrl(null);
    setIsPlayingBack(false);
  };

  // Per-part flow: each part ends on its own and triggers the tier modal.
  // We no longer roll Part 1 → Part 2 → Part 3 automatically; the picker
  // brings the user back to choose another part (or exit) after results.
  const moveToNext = () => {
    if (currentPart === 1) {
      if (currentQuestionIndex < (moduleContent.part1?.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setRecordingState(STATES.IDLE);
      } else {
        setRecordingState(STATES.COMPLETED);
        setShowTierModal(true);
      }
    } else if (currentPart === 2) {
      setRecordingState(STATES.COMPLETED);
      setShowTierModal(true);
    } else if (currentPart === 3) {
      if (currentQuestionIndex < (moduleContent.part3?.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setRecordingState(STATES.IDLE);
      } else {
        setRecordingState(STATES.COMPLETED);
        setShowTierModal(true);
      }
    }
  };

  // Progress is now scoped to the chosen part — when practising Part 1 in
  // isolation, the user shouldn't see "1/14" counting against the full test.
  const getProgress = () => {
    if (!moduleContent) return { current: 1, total: 1 };
    if (currentPart === 1) {
      return { current: currentQuestionIndex + 1, total: moduleContent.part1?.questions?.length || 1 };
    }
    if (currentPart === 2) return { current: 1, total: 1 };
    if (currentPart === 3) {
      return { current: currentQuestionIndex + 1, total: moduleContent.part3?.questions?.length || 1 };
    }
    return { current: 1, total: 1 };
  };

  if (loading && !moduleContent) {
    return <QbLoadingScreen tipIndex={tipIndex} />;
  }

  const question = getCurrentQuestion();
  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <audio ref={audioRef} onEnded={handleAudioEnded} onError={handleAudioError} />

      {pendingResume && !submittingTier && (
        <div className="sticky top-0 z-30 bg-amber-50 border-b border-amber-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
            <RotateCcw className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm font-medium text-amber-900">
                You have a {pendingResume.record.part === 2 ? 'Part 2' : `Part ${pendingResume.record.part}`} speaking test waiting to be graded.
              </p>
              <p className="text-xs text-amber-700">
                {pendingResume.free
                  ? 'Your answers were saved on this device — pick up where you left off. This won’t use an extra evaluation.'
                  : 'Your answers were saved on this device. Grading it now will use one evaluation.'}
              </p>
            </div>
            <Button onClick={resumePendingSubmission} className="bg-amber-600 hover:bg-amber-700 text-white">
              {pendingResume.free ? 'Get my result' : 'Grade it now'}
            </Button>
            <Button variant="ghost" onClick={dismissPendingResume} className="text-amber-700 hover:bg-amber-100">
              Discard
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Hierarchical back: question screen → part picker → topic list → dashboard.
                  // The browser-history goBack was bouncing users out of the QB
                  // entirely from the question screen, which felt broken.
                  if (recordingState === STATES.RECORDING || recordingState === STATES.PROCESSING) return;
                  if (moduleContent && selectedPart) {
                    backToParts();
                  } else if (moduleContent && !selectedPart) {
                    setSelectedModule(null);
                    setModuleContent(null);
                  } else {
                    goBack();
                  }
                }}
                disabled={recordingState === STATES.RECORDING || recordingState === STATES.PROCESSING}
                title={recordingState === STATES.RECORDING ? 'Stop recording first' : 'Back'}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-indigo-600" />
                  {filterTrack === 'academic' ? 'Academic' : 'General'} Speaking
                </h1>
                <p className="text-sm text-gray-500">
                  {moduleContent
                    ? `${mode === 'practice' ? 'Practice' : 'Test'} • ${moduleContent.band_range}`
                    : 'Pick a topic to start'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* These controls only make sense once a module is loaded — hide them
                  on the topic picker so the header doesn't show "1/1 · Part 1"
                  before the user has chosen anything. */}
              {moduleContent && (
                <>
                  <span className="text-sm text-gray-600">{progress.current}/{progress.total}</span>
                  <Badge className={`${currentPart === 1 ? 'bg-green-600' : currentPart === 2 ? 'bg-blue-600' : 'bg-purple-600'} text-white`}>
                    Part {currentPart}
                  </Badge>
                  {!moduleContent?.show_text && (
                    <Button variant="ghost" size="sm" onClick={() => setShowText(!showText)}>
                      {showText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {!moduleContent && (
          <TopicPicker
            modules={modules}
            loading={loading}
            filterTrack={filterTrack}
            filterBand={filterBand}
            onTrackChange={setFilterTrack}
            onBandChange={setFilterBand}
            onSelect={selectModule}
            onPrefetch={prefetchSet}
          />
        )}

        {moduleContent && !selectedPart && !results && (
          <PartPicker
            moduleContent={moduleContent}
            onChoosePart={choosePart}
            onBackToModules={() => { setSelectedModule(null); setModuleContent(null); }}
            onFullMock={() => navigate('/full-mock')}
          />
        )}

        {/* Part 2 "wow" UI — the polished D7 preparation + recording experience,
            used during the prep and recording phases. Other phases (Start /
            processing / Next) keep the shared QuestionFlow controls below. */}
        {moduleContent && selectedPart && !results && currentPart === 2 && (isPrepPhase || recordingState === STATES.RECORDING || recordingState === STATES.IDLE) && (
          <Part2Flow
            moduleContent={moduleContent}
            recordingState={recordingState}
            prepTime={prepTime}
            timeLeft={timeLeft}
            onAddThirty={() => setPrepTime((p) => p + 30)}
            onStartSpeaking={() => { setIsPrepPhase(false); startRecording(); }}
            onExit={backToParts}
            onStopEarly={stopRecording}
          />
        )}

        {moduleContent && selectedPart && !results && !(currentPart === 2 && (isPrepPhase || recordingState === STATES.RECORDING || recordingState === STATES.IDLE)) && (
          <QuestionFlow
            recordingState={recordingState}
            isPrepPhase={isPrepPhase}
            timeLeft={timeLeft}
            prepTime={prepTime}
            currentPart={currentPart}
            currentQuestionIndex={currentQuestionIndex}
            moduleContent={moduleContent}
            showText={showText}
            question={question}
            progress={progress}
            lastRecordingUrl={lastRecordingUrl}
            isPlayingBack={isPlayingBack}
            onStart={playQuestionAudio}
            onStop={stopRecording}
            onTogglePlayback={togglePlayback}
            onNext={moveToNext}
            onStartSpeaking={() => { setIsPrepPhase(false); startRecording(); }}
            onBackToParts={backToParts}
          />
        )}

        {/* Submission processing overlay — keeps the user on a clearly-active
            screen while the eval runs. Replaces the previous toast-only flow
            where users would leave the page before the result landed. */}
        {submittingTier && (
          <SubmittingOverlay
            tier={submittingTier}
            step={submitStep}
            error={submitError}
            onRetry={() => submitTest(submittingTier)}
            onCancel={() => {
              setSubmittingTier(null);
              setSubmitStep('idle');
              setSubmitError(null);
              setShowTierModal(true);
            }}
          />
        )}

        {/* Evaluation Tier Selection Modal */}
        {showTierModal && (
          <TierModal userCredits={userCredits} onSubmit={submitTest} />
        )}

        {results && (
          <ResultsPanel
            results={results}
            user={user}
            navigate={navigate}
            onRetryPart={() => {
              // Re-run the same part with a clean slate.
              const part = selectedPart || currentPart;
              setResults(null);
              choosePart(part);
            }}
            onChooseAnother={() => {
              // Bounce back to the part picker for this module so the
              // user can try a different part without re-fetching.
              setResults(null);
              backToParts();
            }}
          />
        )}
      </div>

      {selectedPart !== null && question && (
        <SpeakingHelperPanel
          part={currentPart}
          question={currentPart === 2 ? '' : (question?.text || '')}
          cueCard={currentPart === 2 ? moduleContent?.part2?.cue_card : null}
          topic={selectedModule?.topic || filterTrack || ''}
        />
      )}
    </div>
  );
}
