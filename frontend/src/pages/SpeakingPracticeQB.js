import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft, Clock, Mic, Play, Square,
  CheckCircle, ChevronRight, Award,
  Volume2, Eye, EyeOff, SkipForward, RotateCcw,
  User, MessageSquare, FileText, Loader2,
  GraduationCap, Cpu, Leaf, Briefcase, Globe, Heart, Atom, TrendingUp,
  Newspaper, Home, Sparkles, Utensils, Plane, ShoppingBag, Users,
  Smile, MessageCircle, AlertCircle, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useGoBack } from '../hooks/useGoBack';
import { mintClientRequestId } from '../lib/clientRequestId';
import { savePendingSpeaking, getPendingSpeaking, clearPendingSpeaking, attachJobToPending, FREE_RESUME_MS } from '../lib/pendingSpeaking';
import { ResultsState as SpeakingResultsState, adaptSpeakingResult } from '../features/speaking';
import StructuredResultsLayout from '../features/speaking/components/StructuredResultsLayout';
import '../features/speaking/speaking.css';
import SpeakingHelperPanel from '../features/speakingHelper/SpeakingHelperPanel';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const STATES = {
  IDLE: 'IDLE',
  PROMPT_PLAYING: 'PROMPT_PLAYING',
  RECORDING: 'RECORDING',
  PROCESSING: 'PROCESSING',
  READY_NEXT: 'READY_NEXT',
  COMPLETED: 'COMPLETED'
};

// Visual identity per topic family. Keeps the picker scannable: the icon and
// soft gradient signal the topic at a glance instead of every card looking
// identical. Class strings are written in full (not interpolated) so Tailwind
// JIT can see them at build time — interpolating colours like
// `hover:border-${accent}-400` produces classes that exist in source but get
// purged from the bundle.
const TOPIC_THEME = {
  education:     { icon: GraduationCap, card: 'bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-400',   iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',   divider: 'border-emerald-200/60',  chev: 'text-emerald-500' },
  technology:    { icon: Cpu,           card: 'bg-gradient-to-br from-sky-50 to-blue-50 hover:border-sky-400',           iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',       divider: 'border-sky-200/60',      chev: 'text-sky-500' },
  environment:   { icon: Leaf,          card: 'bg-gradient-to-br from-green-50 to-lime-50 hover:border-green-400',       iconBg: 'bg-gradient-to-br from-green-500 to-lime-600',     divider: 'border-green-200/60',    chev: 'text-green-500' },
  work:          { icon: Briefcase,     card: 'bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-400',     iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',   divider: 'border-amber-200/60',    chev: 'text-amber-500' },
  culture:       { icon: Globe,         card: 'bg-gradient-to-br from-rose-50 to-pink-50 hover:border-rose-400',         iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',      divider: 'border-rose-200/60',     chev: 'text-rose-500' },
  health:        { icon: Heart,         card: 'bg-gradient-to-br from-red-50 to-rose-50 hover:border-red-400',           iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',       divider: 'border-red-200/60',      chev: 'text-red-500' },
  science:       { icon: Atom,          card: 'bg-gradient-to-br from-violet-50 to-purple-50 hover:border-violet-400',   iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',  divider: 'border-violet-200/60',   chev: 'text-violet-500' },
  business:      { icon: TrendingUp,    card: 'bg-gradient-to-br from-indigo-50 to-blue-50 hover:border-indigo-400',     iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600',    divider: 'border-indigo-200/60',   chev: 'text-indigo-500' },
  media:         { icon: Newspaper,     card: 'bg-gradient-to-br from-fuchsia-50 to-pink-50 hover:border-fuchsia-400',   iconBg: 'bg-gradient-to-br from-fuchsia-500 to-pink-600',   divider: 'border-fuchsia-200/60',  chev: 'text-fuchsia-500' },
  home:          { icon: Home,          card: 'bg-gradient-to-br from-orange-50 to-amber-50 hover:border-orange-400',    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',   divider: 'border-orange-200/60',   chev: 'text-orange-500' },
  hobbies:       { icon: Sparkles,      card: 'bg-gradient-to-br from-yellow-50 to-amber-50 hover:border-yellow-400',    iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-600',   divider: 'border-yellow-200/60',   chev: 'text-yellow-600' },
  food:          { icon: Utensils,      card: 'bg-gradient-to-br from-orange-50 to-red-50 hover:border-orange-400',      iconBg: 'bg-gradient-to-br from-orange-500 to-red-600',     divider: 'border-orange-200/60',   chev: 'text-orange-500' },
  travel:        { icon: Plane,         card: 'bg-gradient-to-br from-cyan-50 to-sky-50 hover:border-cyan-400',          iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600',       divider: 'border-cyan-200/60',     chev: 'text-cyan-500' },
  shopping:      { icon: ShoppingBag,   card: 'bg-gradient-to-br from-pink-50 to-rose-50 hover:border-pink-400',         iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',      divider: 'border-pink-200/60',     chev: 'text-pink-500' },
  community:     { icon: Users,         card: 'bg-gradient-to-br from-teal-50 to-emerald-50 hover:border-teal-400',      iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600',   divider: 'border-teal-200/60',     chev: 'text-teal-500' },
  lifestyle:     { icon: Smile,         card: 'bg-gradient-to-br from-lime-50 to-green-50 hover:border-lime-400',        iconBg: 'bg-gradient-to-br from-lime-500 to-green-600',     divider: 'border-lime-200/60',     chev: 'text-lime-600' },
  communication: { icon: MessageCircle, card: 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400',       iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',    divider: 'border-blue-200/60',     chev: 'text-blue-500' },
  social_issues: { icon: AlertCircle,   card: 'bg-gradient-to-br from-stone-50 to-slate-50 hover:border-slate-400',      iconBg: 'bg-gradient-to-br from-slate-500 to-stone-600',    divider: 'border-slate-200/60',    chev: 'text-slate-500' },
};
const FALLBACK_THEME = {
  icon: BookOpen,
  card: 'bg-gradient-to-br from-slate-50 to-gray-50 hover:border-slate-400',
  iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
  divider: 'border-slate-200/60',
  chev: 'text-slate-500',
};
const themeFor = (topic) => TOPIC_THEME[topic] || FALLBACK_THEME;

// IELTS tips shown while topics load. Keeps the wait useful instead of
// staring at a spinner — Safari especially can take 1–2s for the modules
// fetch + audio_url resolve, and a passive spinner there made users
// assume the page was broken.
const LOADING_TIPS = [
  { title: 'Part 1 timing', body: 'Aim for ~20–30 seconds per answer. Going too short signals limited range; rambling hurts coherence.' },
  { title: 'Hesitation > rushing', body: 'A short pause and a clear answer beats fast-but-mumbled. Examiners reward clarity, not speed.' },
  { title: 'Part 2 cue card', body: 'You get 1 minute to prepare. Jot 4–5 keywords, not full sentences — speak from memory, not a script.' },
  { title: 'Part 3 abstract', body: 'Use signposting: "There are two reasons…", "On the other hand…". It boosts your Coherence band.' },
  { title: 'Pronunciation', body: 'Word stress matters more than accent. "phoTOgraphy" not "PHOto-graphy" — Liz catches this for you.' },
];

export default function SpeakingPracticeQB({ user }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [searchParams] = useSearchParams();
  const initialTrack = searchParams.get('track') || 'academic';
  const initialBand = searchParams.get('band');
  const initialSetId = searchParams.get('set');
  const mode = searchParams.get('mode') || 'test';

  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
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
  // Submission overlay: covers the screen while /api/speaking/submit is in flight.
  // Without this, clicking Basic/Premium just dismisses the modal and the user
  // sees the stale Part 3 question for ~30–60s — they assume it's broken and leave.
  // submittingTier=null means idle; 'free'|'premium' means an overlay is showing.
  // submitStep narrates progress so users know we're working: 'preparing' (base64
  // encode for premium), 'uploading' (HTTP request in flight), 'evaluating'
  // (server is scoring). 'error' shows a retry path without bouncing the user.
  const [submittingTier, setSubmittingTier] = useState(null);
  const [submitStep, setSubmitStep] = useState('idle');
  const [submitError, setSubmitError] = useState(null);
  // A crash-saved submission found in IndexedDB on load (page-leave recovery).
  // null = none; otherwise the persisted record + whether it's still in the
  // free idempotency window.
  const [pendingResume, setPendingResume] = useState(null);
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
  // Rotating IELTS tip while loading — replaces the bare spinner so users
  // don't bounce thinking the page is stuck. Cycles every 4s.
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    if (!loading) return undefined;
    const id = setInterval(() => setTipIndex((i) => (i + 1) % LOADING_TIPS.length), 4000);
    return () => clearInterval(id);
  }, [loading]);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
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
  
  useEffect(() => {
    loadModules();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (promptWatchdogRef.current) clearTimeout(promptWatchdogRef.current);
    };
  }, [filterTrack, filterBand]);

  // Page-leave recovery: on first load, surface any crash-saved submission so
  // the user can finish grading instead of silently losing the test. We only
  // offer it when not already mid-submit.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rec = await getPendingSpeaking();
      if (cancelled || !rec || !rec.blobs || Object.keys(rec.blobs).length === 0) return;
      const ageMs = Date.now() - (rec.createdAt || 0);
      // Drop records older than 24h — far past any usefulness, and the audio
      // shouldn't linger on disk indefinitely.
      if (ageMs > 24 * 60 * 60 * 1000) { clearPendingSpeaking(); return; }
      setPendingResume({ record: rec, free: ageMs < FREE_RESUME_MS });
    })();
    return () => { cancelled = true; };
  }, []);

  // While a grade is actively in flight, nudge before an accidental tab close.
  // The answers are already crash-saved to IndexedDB so nothing is truly lost,
  // but finishing here avoids a needless re-grade round-trip.
  useEffect(() => {
    const active = submittingTier && submitStep !== 'error' && submitStep !== 'idle';
    if (!active) return undefined;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [submittingTier, submitStep]);

  // Re-fire a recovered submission. Idempotent within the backend's 10-min
  // window (free); past it the user already consented to a fresh evaluation
  // via the banner copy.
  const resumePendingSubmission = async () => {
    if (!pendingResume?.record) return;
    const rec = pendingResume.record;
    setPendingResume(null);
    // If the async submit already enqueued a server job, reconnect to it (no
    // re-upload) — the server graded it whether we stayed or not.
    if (rec.jobId) {
      setSubmittingTier(rec.tier || 'free');
      setSubmitError(null);
      setSubmitStep('evaluating');
      const polled = await pollStructuredJob(rec.jobId);
      if (polled.error) { setSubmitError(polled.error); setSubmitStep('error'); return; }
      finishStructured(polled.result);
      return;
    }
    // No job yet (the upload never completed) → re-submit idempotently.
    submitTest(rec.tier || 'free', {
      clientRequestId: rec.clientRequestId,
      part: rec.part,
      setId: rec.setId,
      topic: rec.topic,
      cueCard: rec.cueCard,
      answers: rec.answers || [],
      blobs: rec.blobs || {},
    });
  };

  const dismissPendingResume = () => {
    clearPendingSpeaking();
    setPendingResume(null);
  };

  // Common success sink for the structured (Part 1/3) async path.
  const finishStructured = (result) => {
    setResults(result);
    clearPendingSpeaking();          // graded → nothing left to recover
    audioBlobsRef.current = {};
    clientRequestIdRef.current = null;
    setSubmittingTier(null);
    setSubmitStep('idle');
  };

  // Poll a durable speaking job until it finishes. The server grades it
  // independent of this connection, so even if the user left and came back this
  // resolves the SAME job. Returns {result} or {error}.
  const pollStructuredJob = async (jobId, { maxMs = 6 * 60 * 1000, intervalMs = 2500 } = {}) => {
    const deadline = Date.now() + maxMs;
    while (Date.now() < deadline) {
      try {
        const r = await fetch(`${API_URL}/api/speaking-practice/jobs/${jobId}`);
        if (r.ok) {
          const j = await r.json();
          if (j.status === 'completed' && j.result) return { result: j.result };
          if (j.status === 'failed') return { error: j.error || 'Grading failed. Please try again.' };
        }
        // 404 right after enqueue can happen on a read replica — keep polling.
      } catch (_) { /* transient network — keep polling */ }
      await new Promise((res) => setTimeout(res, intervalMs));
    }
    return { error: 'Grading is taking longer than expected. Your answers are saved — check "My results" in a minute.' };
  };

  const loadModules = async () => {
    // sessionStorage cache — repeat visits to QB Speaking within 5 min
    // skip the network round-trip entirely. Stale-while-revalidate: show
    // the cached list immediately, then fetch in the background to refresh
    // it. Track+band keyed so the Academic/GT toggle and band chips don't
    // poison each other's cache.
    const cacheKey = `qb_speaking_modules_v1:${filterTrack}:${filterBand || 'all'}`;
    const TTL_MS = 5 * 60 * 1000;
    let usedCache = false;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && Array.isArray(cached.modules) && Date.now() - cached.t < TTL_MS) {
          setModules(cached.modules);
          setLoading(false);
          usedCache = true;
        }
      }
    } catch (_) { /* ignore corrupt cache */ }

    try {
      let url = `${API_URL}/api/speaking/modules?track=${filterTrack}`;
      if (filterBand) url += `&band=${filterBand}`;

      const res = await fetch(url);
      // TODO(backend): /api/speaking/modules is served by routes/speaking_qb.py
      // and depends on content/speaking/speaking_sets.py being importable +
      // populated. If the import fails, the route itself 404s and modules
      // stay empty. The previous code silently ignored non-2xx responses,
      // leaving the page blank with no toast — confusing for users.
      if (!res.ok) {
        console.error('Speaking modules HTTP error', res.status);
        toast.error(`Speaking topics unavailable (${res.status}). Try again shortly.`);
        setModules([]);
        return;
      }
      const data = await res.json();

      if (data?.success) {
        const list = Array.isArray(data.modules) ? data.modules : [];
        setModules(list);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), modules: list }));
        } catch (_) { /* sessionStorage full / disabled — non-fatal */ }
        if (list.length === 0 && !usedCache) {
          toast.info('No speaking topics matched this track yet.');
        }
        if (initialSetId) {
          selectModule(initialSetId);
        }
      } else {
        console.warn('Speaking modules response missing success flag', data);
        if (!usedCache) {
          setModules([]);
          toast.error(data?.error || 'Failed to load speaking topics.');
        }
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      // Only surface the error if we don't already have a cached list on
      // screen — otherwise it's just a background-refresh blip.
      if (!usedCache) toast.error('Failed to load speaking modules');
    } finally {
      setLoading(false);
    }
  };

  // Hover-prefetch helper. Fires /api/speaking/set/{setId} once per setId
  // and stashes the response in prefetchedSetsRef. selectModule below
  // checks this ref first so the click is instant on hovered cards.
  const prefetchSet = (setId) => {
    if (!setId || prefetchedSetsRef.current[setId]) return;
    // Mark as in-flight immediately so hover-spam doesn't fire N requests.
    prefetchedSetsRef.current[setId] = 'pending';
    fetch(`${API_URL}/api/speaking/set/${setId}?include_audio=true&mode=${mode}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.set) {
          prefetchedSetsRef.current[setId] = data.set;
        } else {
          delete prefetchedSetsRef.current[setId];
        }
      })
      .catch(() => { delete prefetchedSetsRef.current[setId]; });
  };

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

  const startPrepPhase = () => {
    setIsPrepPhase(true);
    setPrepTime(60);
    setRecordingState(STATES.IDLE);
    
    timerRef.current = setInterval(() => {
      setPrepTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsPrepPhase(false);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
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
      
      const maxTime = currentPart === 2 ? 120 : (currentPart === 3 ? 75 : 25);
      setSpeakingTime(0);
      setTimeLeft(maxTime);
      // The countdown itself is driven by a state effect keyed on RECORDING
      // (see below) — no inline interval here, so the async getUserMedia await
      // above can't race the timer into a frozen/stuck state.
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
      setRecordingState(STATES.IDLE);
    }
  };

  const stopRecording = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);

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

  const choosePart = (partNum) => {
    setSelectedPart(partNum);
    setCurrentPart(partNum);
    setCurrentQuestionIndex(0);
    setRecordingState(STATES.IDLE);
    setAnswers([]);
    audioBlobsRef.current = {};
  };

  const backToParts = () => {
    if (timerRef.current) clearInterval(timerRef.current);
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

  // Convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const submitTest = async (tier = 'free', resumeData = null) => {
    // Per-part submission. Routes to the unified Sonnet-backed
    // /api/speaking/evaluate endpoint (same path Smart Practice/Cambridge use).
    // The legacy /api/speaking/submit required EMERGENT_LLM_KEY and silently
    // returned `success:true, error:"Evaluation service not configured"` when
    // the key was missing — which surfaced as "No evaluation data returned"
    // in the UI. The unified endpoint uses ANTHROPIC_API_KEY (Sonnet)
    // and auto-tiers from the user's plan instead of free/premium toggle.
    //
    // `resumeData` (optional) lets a recovered submission re-run WITHOUT relying
    // on component state — it carries the part, answers, blobs and (crucially)
    // the original client_request_id, so a resume after a page-leave is
    // idempotent (free within the backend's 10-min window).
    setShowTierModal(false);
    setSubmittingTier(tier);
    setSubmitError(null);
    setSubmitStep('uploading');

    try {
      // Resolve the submission payload from resumeData when resuming, otherwise
      // from live component state.
      const part = resumeData ? resumeData.part : currentPart;
      const setId = resumeData ? resumeData.setId : selectedModule;
      const partAnswers = resumeData
        ? resumeData.answers
        : answers.filter(a => a.part === String(currentPart));
      const blobFor = (qid) => (resumeData ? resumeData.blobs?.[qid] : audioBlobsRef.current[qid]);
      const partBlobs = partAnswers.map(a => blobFor(a.question_id)).filter(Boolean);

      if (partBlobs.length === 0) {
        setSubmitError('No audio captured for this part. Re-record your answers and try again.');
        setSubmitStep('error');
        return;
      }

      // Mint once and reuse on transient retry / page-leave resume so the
      // backend idempotency cache short-circuits without re-running Azure +
      // Sonnet (and without charging a second evaluation).
      if (resumeData?.clientRequestId) {
        clientRequestIdRef.current = resumeData.clientRequestId;
      } else if (!clientRequestIdRef.current) {
        clientRequestIdRef.current = mintClientRequestId();
      }

      // Crash-safe persistence: before the (long) request goes out, stash
      // everything needed to re-run it so closing the tab can't lose the test.
      // Skipped when we're already resuming (the record is already on disk).
      if (!resumeData) {
        const topic = moduleContent?.title || (part === 1 ? 'Part 1 — Introduction' : part === 3 ? 'Part 3 — Discussion' : 'Part 2 — Long Turn');
        const blobs = {};
        partAnswers.forEach((a) => { const b = blobFor(a.question_id); if (b) blobs[a.question_id] = b; });
        savePendingSpeaking({
          clientRequestId: clientRequestIdRef.current,
          tier,
          part,
          setId: setId || null,
          topic,
          cueCard: part === 2 ? {
            prompt: moduleContent?.part2?.cue_card?.topic || 'Cue card monologue',
            bullets: moduleContent?.part2?.cue_card?.bullets || [],
          } : null,
          answers: partAnswers.map(a => ({ question_id: a.question_id, part: a.part, question: a.question, duration: a.duration })),
          blobs,
          createdAt: Date.now(),
        });
        setPendingResume(null); // hide any stale resume banner now that we're live
      }

      // Multi-question parts (Part 1 interview, Part 3 discussion) route to the
      // structured per-question pipeline so EACH answer is transcribed +
      // evaluated independently (Azure×N premium / Whisper×N basic + Sonnet×1),
      // counted as ONE eval. The legacy single-blob path concatenated every
      // answer into one webm and ran Azure recognize_once(), which stopped at
      // the first pause — so only the first question was ever evaluated.
      if (part === 1 || part === 3) {
        const form = new FormData();
        form.append('user_id', user?.id || '');
        form.append('part', `part${part}`);
        form.append('topic', (resumeData ? resumeData.topic : moduleContent?.title) || (part === 1 ? 'Part 1 — Introduction' : 'Part 3 — Discussion'));
        form.append('user_language', user?.feedback_language || user?.preferred_language || 'en');
        form.append('target_band', String(user?.target_band ?? 7.0));
        form.append('client_request_id', clientRequestIdRef.current);
        if (setId) form.append('set_id', setId);

        // One contiguous question_q{i}/audio_q{i}/duration_q{i} triple per answer.
        let idx = 0;
        partAnswers.forEach((a) => {
          const blob = blobFor(a.question_id);
          if (!blob) return; // skip any answer without captured audio
          idx += 1;
          form.append(`question_q${idx}`, a.question || '');
          form.append(`audio_q${idx}`, blob, `qb-part${part}-q${idx}-${Date.now()}.webm`);
          form.append(`duration_q${idx}`, String(a.duration || 0));
        });

        // Leave-safe async submit: the server enqueues a durable job, grades it
        // independent of this connection, and we poll for the result. Closing
        // the tab no longer drops the test — the job still finishes server-side
        // (and emails the result), and "My results" lists it.
        const res = await fetch(`${API_URL}/api/speaking-practice/evaluate-structured-async`, {
          method: 'POST',
          body: form,
        });
        setSubmitStep('evaluating');

        if (!res.ok) {
          let detail;
          try { detail = await res.json(); } catch (_) { detail = await res.text(); }
          const code = (typeof detail === 'object' && detail?.detail?.code) || '';
          const rawError = (typeof detail === 'object' && (detail?.detail?.message || detail?.detail)) || (typeof detail === 'string' ? detail : `HTTP ${res.status}`);
          const combined = `${code} ${rawError}`;
          const isNoMatch = /NoMatch|no\s*match|no_speech|no\s*speech/i.test(combined);
          const isTooShort = /audio_too_short|audio_too_small|too\s*short|too_short|min_seconds|min_bytes/i.test(combined);
          let message;
          if (code === 'quota_exhausted') {
            message = rawError || 'You\'ve used all evaluations for this period.';
          } else if (isTooShort) {
            message = "One of your recordings was shorter than the minimum. Re-record speaking in full sentences for at least 10–15 seconds, then submit again.";
          } else if (isNoMatch) {
            message = "We couldn't pick up clear speech from your microphone. Check the lock icon in the URL bar → Microphone = Allow, then re-record speaking in full sentences for 10–15 seconds.";
          } else {
            message = rawError;
          }
          setSubmitError(message);
          setSubmitStep('error');
          return;
        }

        const data = await res.json();
        // A cached replay (same client_request_id) returns already-completed.
        if (data.status === 'completed' && data.result) {
          finishStructured(data.result);
          return;
        }
        const jobId = data.job_id;
        if (!jobId) {
          setSubmitError('Could not start grading. Please try again.');
          setSubmitStep('error');
          return;
        }
        // Pin the job to the crash-saved record so a leave/return reconnects to
        // the same grade instead of re-uploading.
        attachJobToPending(jobId);
        const polled = await pollStructuredJob(jobId);
        if (polled.error) {
          setSubmitError(polled.error);
          setSubmitStep('error');
          return;
        }
        finishStructured(polled.result);
        return;
      }

      // ── Part 2 (cue card, single long-turn answer) — leave-safe async path ──
      // Same durable job queue as Part 1/3, just a single-blob 'cuecard' job.
      const combinedBlob = partBlobs.length === 1
        ? partBlobs[0]
        : new Blob(partBlobs, { type: 'audio/webm' });

      const cueCardPrompt = (resumeData ? resumeData.cueCard?.prompt : moduleContent?.part2?.cue_card?.topic) || 'Cue card monologue';
      const cueCardBullets = ((resumeData ? resumeData.cueCard?.bullets : moduleContent?.part2?.cue_card?.bullets) || []).join('\n');

      const totalDuration = partAnswers.reduce((s, a) => s + (a.duration || 0), 0);

      const form = new FormData();
      form.append('audio', combinedBlob, `qb-part${part}-${Date.now()}.webm`);
      form.append('user_id', user?.id || '');
      form.append('part', `part${part}`);
      form.append('cue_card_prompt', cueCardPrompt);
      form.append('cue_card_bullets', cueCardBullets);
      form.append('user_language', user?.feedback_language || 'en');
      form.append('target_band', String(user?.target_band ?? 7.0));
      form.append('duration_seconds', String(totalDuration || 0));
      form.append('topic', moduleContent?.title || cueCardPrompt);
      if (setId) form.append('set_id', setId);
      form.append('client_request_id', clientRequestIdRef.current);

      const res = await fetch(`${API_URL}/api/speaking-practice/evaluate-cuecard-async`, {
        method: 'POST',
        body: form,
      });
      setSubmitStep('evaluating');

      if (!res.ok) {
        let detail;
        try { detail = await res.json(); } catch (_) { detail = await res.text(); }
        const code = (typeof detail === 'object' && detail?.detail?.code) || '';
        const rawError = (typeof detail === 'object' && (detail?.detail?.message || detail?.detail)) || (typeof detail === 'string' ? detail : `HTTP ${res.status}`);
        const combined = `${code} ${rawError}`;
        const isNoMatch = /NoMatch|no\s*match|no_speech|no\s*speech/i.test(combined);
        const isTooShort = /audio_too_short|audio_too_small|too\s*short|too_short|min_seconds|min_bytes/i.test(combined);
        let message;
        if (code === 'quota_exhausted') {
          message = rawError || 'You\'ve used all evaluations for this period.';
        } else if (isTooShort) {
          message = "Your recording was shorter than the minimum. Re-record speaking in full sentences for at least 10–15 seconds, then submit again.";
        } else if (isNoMatch) {
          message = "We couldn't pick up clear speech from your microphone. Check the lock icon in the URL bar → Microphone = Allow, then re-record speaking in full sentences for 10–15 seconds.";
        } else {
          message = rawError;
        }
        setSubmitError(message);
        setSubmitStep('error');
        return;
      }

      const data = await res.json();
      if (data.status === 'completed' && data.result) {
        finishStructured(data.result);
        return;
      }
      const jobId = data.job_id;
      if (!jobId) {
        setSubmitError('Could not start grading. Please try again.');
        setSubmitStep('error');
        return;
      }
      attachJobToPending(jobId);
      const polled = await pollStructuredJob(jobId);
      if (polled.error) {
        setSubmitError(polled.error);
        setSubmitStep('error');
        return;
      }
      finishStructured(polled.result);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError('Could not reach the evaluation server. Check your connection and try again.');
      setSubmitStep('error');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    const tip = LOADING_TIPS[tipIndex];
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-emerald-50/30 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Animated mic — three concentric pulses give a sense of "Liz is
              listening / preparing" so the wait reads as activity, not a freeze. */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-20 h-20 mb-4">
              <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
              <span className="absolute inset-2 rounded-full bg-emerald-400/40 animate-ping" style={{ animationDelay: '0.3s' }} />
              <span className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Mic className="w-6 h-6 text-white" />
              </span>
            </div>
            <p className="text-sm font-medium text-emerald-700">Liz is preparing your speaking topics…</p>
          </div>

          {/* Rotating IELTS tip — keeps the wait useful */}
          <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 mb-8 transition-opacity duration-500" key={tipIndex}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-emerald-600 font-semibold mb-1">
                  Tip · {tipIndex + 1} / {LOADING_TIPS.length}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{tip.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{tip.body}</p>
              </div>
            </div>
          </div>

          {/* Skeleton topic cards — the page reads as "almost ready" instead
              of empty. Two columns mirror the real grid below. */}
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border-2 border-slate-100 bg-white p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-2/3 mt-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
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
          <div className="space-y-6">
            {/* Intro strip — explains what this page is so the picker doesn't
                feel like a bare list. Mirrors the tone of the Part 1/2/3 cards
                further down once a module is chosen. */}
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900">Choose a speaking topic</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Each set gives you Part 1 (interview), Part 2 (cue card) and Part 3 (discussion). You'll pick which part to practise on the next screen.
                  </p>
                </div>
              </div>
            </div>

            {/* Filter bar — segmented Academic/GT toggle + band chips. Replaces
                the unstyled <select> dropdowns that didn't match the rest of
                the app's chrome. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex p-1 bg-slate-100 rounded-lg self-start">
                {[{ v: 'academic', l: 'Academic' }, { v: 'general', l: 'General Training' }].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setFilterTrack(opt.v)}
                    className={`px-3.5 py-1.5 text-sm rounded-md transition-all ${
                      filterTrack === opt.v
                        ? 'bg-white shadow-sm font-semibold text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500 mr-1 uppercase tracking-wide">Band</span>
                {[
                  { v: '', l: 'All' },
                  { v: '4.0-5.0', l: '4–5' },
                  { v: '5.5-6.5', l: '5.5–6.5' },
                  { v: '7.0-9.0', l: '7–9' },
                ].map(opt => (
                  <button
                    key={opt.v || 'all'}
                    type="button"
                    onClick={() => setFilterBand(opt.v)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                      filterBand === opt.v
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic grid. On md+ we show two columns so the page doesn't feel
                like an endless 1-column list when there are 18+ topics. */}
            {modules.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {modules.map(m => {
                  const theme = themeFor(m.topic);
                  const Icon = theme.icon;
                  const ready = m.audio_cached === m.total_questions && m.total_questions > 0;
                  const partial = m.audio_cached > 0 && m.audio_cached < m.total_questions;
                  return (
                    <Card
                      key={m.set_id}
                      onClick={() => selectModule(m.set_id)}
                      onMouseEnter={() => prefetchSet(m.set_id)}
                      onFocus={() => prefetchSet(m.set_id)}
                      className={`p-5 cursor-pointer transition-all border-2 hover:shadow-md hover:-translate-y-0.5 ${theme.card}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-xl ${theme.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-bold text-gray-900 leading-tight">{m.title}</h3>
                            {/* Status badge: Ready (cached) / Caching (partial) / AI voice (none).
                                "Loading..." was alarming — these labels say what's
                                actually happening. */}
                            {ready ? (
                              <Badge className="bg-green-100 text-green-700 border border-green-200 shrink-0">
                                <CheckCircle className="w-3 h-3 mr-1" /> Ready
                              </Badge>
                            ) : partial ? (
                              <Badge className="bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Caching
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                <Volume2 className="w-3 h-3 mr-1" /> AI voice
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 capitalize">
                            {String(m.topic || '').replace(/_/g, ' ')} · Band {m.band_range}
                          </p>
                          <div className={`flex items-center justify-between mt-3 pt-3 border-t ${theme.divider}`}>
                            <span className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              ~12 min · 3 parts
                            </span>
                            <ChevronRight className={`w-4 h-4 ${theme.chev}`} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              !loading && (
                <Card className="p-10 text-center border-dashed">
                  <Mic className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-700">No topics in this band yet</p>
                  <p className="text-xs text-slate-500 mt-1">Try a different band filter or switch tracks.</p>
                  {filterBand && (
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setFilterBand('')}>
                      Show all bands
                    </Button>
                  )}
                </Card>
              )
            )}
          </div>
        )}

        {moduleContent && !selectedPart && !results && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{moduleContent.title || 'Speaking Module'}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose a part to practise. Each part is scored on its own — come back here to try another.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSelectedModule(null); setModuleContent(null); }}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Modules
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Part 1 */}
              <Card
                className="p-5 cursor-pointer hover:shadow-md transition-all border-2 hover:border-green-400 bg-gradient-to-br from-green-50 to-emerald-50"
                onClick={() => choosePart(1)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Badge className="bg-green-600 text-white mb-1">Part 1</Badge>
                    <h3 className="font-bold text-gray-900">Introduction</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Familiar topic Q&amp;A. Short answers (~25s each).
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{moduleContent.part1?.questions?.length || 0} questions</span>
                  <span>~4–5 min</span>
                </div>
              </Card>

              {/* Part 2 */}
              <Card
                className="p-5 cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-sky-50"
                onClick={() => choosePart(2)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Badge className="bg-blue-600 text-white mb-1">Part 2</Badge>
                    <h3 className="font-bold text-gray-900">Long Turn</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Cue-card monologue. 1 min prep, 2 min speaking.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate pr-2">{moduleContent.part2?.cue_card?.topic || 'Cue card'}</span>
                  <span>~3 min</span>
                </div>
              </Card>

              {/* Part 3 */}
              <Card
                className="p-5 cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50"
                onClick={() => choosePart(3)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Badge className="bg-purple-600 text-white mb-1">Part 3</Badge>
                    <h3 className="font-bold text-gray-900">Discussion</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Abstract follow-ups. Longer, opinion-based answers (~75s).
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{moduleContent.part3?.questions?.length || 0} questions</span>
                  <span>~4–5 min</span>
                </div>
              </Card>
            </div>

            {/* Full Test — all 3 parts back-to-back. Navigates to the unified
                /speaking-premium surface which hosts the FullTestFlow orchestrator.
                Tier gating happens there (Monthly + Exam Pack only). */}
            <Card
              className="p-5 cursor-pointer hover:shadow-md transition-all border-2 hover:border-amber-400 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50"
              onClick={() => navigate('/speaking-premium')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-amber-600 text-white">Full Test</Badge>
                    <span className="text-xs text-amber-700 font-medium">Monthly · Exam Pack</span>
                  </div>
                  <h3 className="font-bold text-gray-900">All 3 parts back-to-back</h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Simulate the full exam in one sitting — Part 1 → Part 2 → Part 3 with one shared theme.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-gray-500">~11–14 min</div>
                  <ChevronRight className="w-5 h-5 text-amber-700 ml-auto mt-1" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {moduleContent && selectedPart && !results && (
          <div className="space-y-6">
            <Card className={`p-4 ${recordingState === STATES.RECORDING ? 'bg-red-50 border-red-200' : isPrepPhase ? 'bg-yellow-50 border-yellow-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {recordingState === STATES.RECORDING && <><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /><span className="text-red-700 font-medium">Recording</span></>}
                  {isPrepPhase && <><Clock className="w-5 h-5 text-yellow-600" /><span className="text-yellow-700 font-medium">Preparation</span></>}
                  {recordingState === STATES.PROMPT_PLAYING && <><Volume2 className="w-5 h-5 text-blue-600 animate-pulse" /><span className="text-blue-700 font-medium">Listening...</span></>}
                  {recordingState === STATES.PROCESSING && <><Loader2 className="w-5 h-5 text-indigo-600 animate-spin" /><span className="text-indigo-700 font-medium">Processing...</span></>}
                </div>
                <div className={`text-2xl font-mono font-bold ${timeLeft < 10 && recordingState === STATES.RECORDING ? 'text-red-600' : ''}`}>
                  {isPrepPhase ? formatTime(prepTime) : formatTime(timeLeft)}
                </div>
              </div>
            </Card>

            <Card className="p-6 relative overflow-hidden border-emerald-100">
              <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
              {currentPart === 2 ? (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" /> Cue Card
                  </h2>
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <p className="font-semibold text-emerald-900 mb-3">{moduleContent.part2?.cue_card?.topic}</p>
                    <p className="text-sm text-emerald-700 mb-2">You should say:</p>
                    <ul className="list-disc list-inside text-sm text-emerald-800 space-y-1">
                      {moduleContent.part2?.cue_card?.bullets?.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" /> Question {currentQuestionIndex + 1}
                  </h2>
                  {(showText || moduleContent.show_text) && question?.text && <p className="text-lg text-gray-800 mb-4">{question.text}</p>}
                  {!showText && !moduleContent.show_text && (
                    <div className="text-center py-4 text-gray-500">
                      <Volume2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                      <p className="text-sm">Listen to the question</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <div className="flex gap-3 justify-center">
              {recordingState === STATES.IDLE && <Button onClick={playQuestionAudio} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200 px-8"><Play className="w-5 h-5 mr-2" /> Start</Button>}
              {recordingState === STATES.RECORDING && <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700 px-8"><Square className="w-5 h-5 mr-2" /> Stop</Button>}
              {recordingState === STATES.READY_NEXT && lastRecordingUrl && (
                <Button onClick={togglePlayback} variant="outline" className="px-6 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  {isPlayingBack ? (
                    <><Square className="w-4 h-4 mr-2" /> Stop playback</>
                  ) : (
                    <><Volume2 className="w-4 h-4 mr-2" /> Play my recording</>
                  )}
                </Button>
              )}
              {recordingState === STATES.READY_NEXT && <Button onClick={moveToNext} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200 px-8"><SkipForward className="w-5 h-5 mr-2" /> Next</Button>}
              {isPrepPhase && <Button onClick={() => { clearInterval(timerRef.current); setIsPrepPhase(false); startRecording(); }} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200 px-8"><Mic className="w-5 h-5 mr-2" /> Start Speaking</Button>}
            </div>

            {/* Footer: confirm which part the user is on + escape hatch back
                to the picker. We don't allow live mid-recording part swaps —
                the back button only acts when not actively recording. */}
            <Card className="p-4 bg-emerald-50/40 border-emerald-100 flex items-center justify-between">
              <div className="text-sm">
                <span className="font-semibold text-gray-900">
                  {currentPart === 1 ? 'Part 1 — Introduction' : currentPart === 2 ? 'Part 2 — Long Turn' : 'Part 3 — Discussion'}
                </span>
                <span className="text-gray-500 ml-2">
                  ({progress.current}/{progress.total})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={backToParts}
                disabled={recordingState === STATES.RECORDING || recordingState === STATES.PROCESSING}
                title={recordingState === STATES.RECORDING ? 'Stop recording first' : 'Choose another part'}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Choose another part
              </Button>
            </Card>
          </div>
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
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg p-6 bg-white">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> Test Completed! 🎉
              </h2>
              <p className="text-gray-500 mb-4">Choose your evaluation type:</p>
              
              {/* User Credits Display */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-600">Your Credits:</span>
                <Badge className={userCredits > 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}>
                  {userCredits} credit{userCredits !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {/* Free Tier */}
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-green-400 bg-green-50/50"
                  onClick={() => submitTest('free')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">Basic Evaluation</h3>
                        <Badge className="bg-green-100 text-green-700">FREE</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">AI-powered analysis with Whisper + GPT-4o</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Band estimation</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Strengths & weaknesses</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> General feedback</li>
                      </ul>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 mt-4" />
                  </div>
                </Card>

                {/* Premium Tier */}
                <Card 
                  className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 bg-gradient-to-r from-purple-50 to-indigo-50 ${userCredits > 0 ? 'hover:border-purple-400' : 'opacity-75'}`}
                  onClick={() => userCredits > 0 ? submitTest('premium') : toast.error('You need at least 1 credit for premium evaluation')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">Premium Evaluation</h3>
                        <Badge className="bg-purple-100 text-purple-700">1 Token</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Azure Pronunciation Assessment + Advanced AI</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Word-level accuracy scores</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Phoneme analysis (ses yutma tespiti)</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Missing endings detection</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Fluency & prosody scores</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Mentor notes & practice focus</li>
                      </ul>
                      {userCredits === 0 && (
                        <p className="text-xs text-red-500 mt-2">⚠️ You need at least 1 credit</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 mt-4" />
                  </div>
                </Card>
              </div>
              
              <p className="text-xs text-gray-400 mt-4 text-center">
                1 Credit = 5 Tokens • Premium gives detailed pronunciation feedback
              </p>
            </Card>
          </div>
        )}

        {results && Array.isArray(results.questions) && results.questions.length > 0 && (
          <div className="speaking-scope">
            <StructuredResultsLayout
              feedback={results}
              onPracticeAnother={() => { setResults(null); backToParts(); }}
              onTryAgain={() => {
                const part = selectedPart || currentPart;
                setResults(null);
                choosePart(part);
              }}
            />
          </div>
        )}

        {results && !(Array.isArray(results.questions) && results.questions.length > 0) && (() => {
          const adapted = adaptSpeakingResult(results, {
            targetBand: user?.target_band,
            durationSeconds: results.metrics?.total_duration,
          });
          return (
            <div className="space-y-4">
              {/* Tier / credits chip strip — kept outside D7 for app-level context */}
              <div className="flex items-center justify-end gap-2">
                {results.remaining_credits !== undefined && (
                  <Badge className="bg-gray-100 text-gray-600 text-xs">
                    {results.remaining_credits} credit{results.remaining_credits !== 1 ? 's' : ''} left
                  </Badge>
                )}
                {results.tier && (
                  <Badge className={results.tier === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}>
                    {results.tier === 'premium' ? '⭐ Premium' : '🎯 Basic'}
                  </Badge>
                )}
              </div>

              {/* Unified D7 ResultsState */}
              {adapted ? (
                <div className="speaking-scope rounded-2xl overflow-hidden border border-indigo-100 shadow-sm">
                  <SpeakingResultsState
                    data={adapted}
                    onRetryCard={() => {
                      // Re-run the same part with a clean slate.
                      const part = selectedPart || currentPart;
                      setResults(null);
                      choosePart(part);
                    }}
                    onNewCard={() => {
                      // Bounce back to the part picker for this module so the
                      // user can try a different part without re-fetching.
                      setResults(null);
                      backToParts();
                    }}
                  />
                </div>
              ) : (
                <Card className="p-6 text-center text-gray-500">No evaluation data returned.</Card>
              )}

              {/* QB-specific overflow info that doesn't fit the D7 layout */}
              {results.per_part_summary && (
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Part-by-part</h3>
                  <div className="space-y-1 text-sm">
                    {Object.entries(results.per_part_summary).map(([p, s]) => (
                      <div key={p}><span className="font-medium capitalize">{p}: </span><span className="text-gray-600">{s}</span></div>
                    ))}
                  </div>
                </Card>
              )}

              {results.upgrade_prompt && (
                <Card className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200">
                  <p className="text-sm text-purple-700">{results.upgrade_prompt}</p>
                </Card>
              )}

              {results.recommended_lessons?.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Recommended Lessons</h4>
                  <div className="space-y-2">
                    {results.recommended_lessons.map((l, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                        <div><p className="font-medium text-gray-900">{l.title}</p><p className="text-xs text-gray-500">{l.track} • {l.stage}</p></div>
                        <Button variant="outline" size="sm" onClick={() => navigate(l.url || '/mastery-course')}>Go <ChevronRight className="w-3 h-3 ml-1" /></Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const part = selectedPart || currentPart;
                    setResults(null);
                    choosePart(part);
                  }}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Try this part again
                </Button>
                <Button
                  onClick={() => { setResults(null); backToParts(); }}
                  className="flex-1 bg-indigo-600"
                >
                  Choose another part <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          );
        })()}
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

/**
 * Full-screen overlay shown during /api/speaking/submit.
 *
 * Why this exists: clicking Basic/Premium used to dismiss the tier modal and
 * leave the user on the (now-stale) Part 3 last-question screen until the
 * fetch resolved 30–60s later. Premium adds Azure word-level pronunciation
 * + Sonnet on top of base scoring, so timing can stretch toward a minute on
 * cold starts. Without an overlay, users assumed the click was lost and
 * navigated away before the result arrived.
 *
 * The overlay narrates progress (preparing → uploading → evaluating) so the
 * wait feels intentional, and surfaces errors inline with a Retry button so
 * users don't lose their answers — audioBlobsRef is preserved on error.
 */
function SubmittingOverlay({ tier, step, error, onRetry, onCancel }) {
  const isError = step === 'error';
  const isPremium = tier === 'premium';

  // Live elapsed counter — a moving number reassures the user the grade is
  // actually progressing during the otherwise-silent 30–60s wait.
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (isError) return undefined;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isError]);

  const stepCopy = {
    preparing: {
      title: 'Preparing your audio',
      detail: 'Encoding your responses for Azure pronunciation analysis…',
    },
    uploading: {
      title: 'Uploading to Liz',
      detail: 'Sending your answers to the evaluator…',
    },
    evaluating: {
      title: isPremium ? 'Liz is evaluating your speaking' : 'Liz is reviewing your answers',
      detail: isPremium
        ? 'Azure word-level pronunciation + Sonnet IELTS examiner. Usually 30–60 seconds.'
        : 'Sonnet IELTS examiner is scoring four criteria. Usually 15–25 seconds.',
    },
  };

  const copy = stepCopy[step] || stepCopy.evaluating;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-md p-8 bg-white text-center">
        {isError ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-4">
              <span className="text-3xl" role="img" aria-label="error">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <p className="text-xs text-gray-400 mb-6">
              Your recordings are safe — you can retry without re-recording.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Choose tier again
              </Button>
              <Button onClick={onRetry} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                <RotateCcw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Pulsing avatar — Liz "thinking". Two stacked rings for a soft
                radial glow rather than the harsh Loader2 spin we use in the
                rest of the app; the wait is long enough that a calmer
                animation feels less alarming. */}
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className={`absolute inset-0 rounded-full ${isPremium ? 'bg-purple-200' : 'bg-emerald-200'} animate-ping opacity-60`} />
              <div className={`absolute inset-2 rounded-full ${isPremium ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'} flex items-center justify-center`}>
                {isPremium ? (
                  <Award className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">{copy.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{copy.detail}</p>
            <p className="text-xs font-mono text-gray-400 mb-5">
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} elapsed · usually {isPremium ? '30–60s' : '15–25s'}
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <StepDot active={step === 'preparing'} done={step === 'uploading' || step === 'evaluating'} />
              {isPremium && (
                <>
                  <StepLine done={step === 'uploading' || step === 'evaluating'} />
                  <StepDot active={step === 'uploading'} done={step === 'evaluating'} />
                </>
              )}
              <StepLine done={step === 'evaluating'} />
              <StepDot active={step === 'evaluating'} done={false} />
            </div>

            <p className="text-xs text-gray-500">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline -mt-0.5 mr-1" />
              Your answers are saved on this device. If you need to leave, come back
              and tap <b>Get my result</b> — nothing is lost.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}

function StepDot({ active, done }) {
  if (done) {
    return (
      <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
        <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />
      </span>
    );
  }
  if (active) {
    return <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />;
  }
  return <span className="w-3 h-3 rounded-full bg-gray-200" />;
}

function StepLine({ done }) {
  return <span className={`h-0.5 w-8 ${done ? 'bg-emerald-500' : 'bg-gray-200'}`} />;
}
