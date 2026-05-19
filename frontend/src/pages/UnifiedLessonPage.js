import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import {
  ArrowLeft, ChevronRight, CheckCircle, Clock, Zap, X,
  RefreshCw, RotateCcw, BookOpen, Gamepad2, FileText, Edit3, Headphones, 
  Mic, MicOff, Repeat, Play, Star, Lock, Volume2, AlertCircle, ThumbsUp, ThumbsDown, Square, Trophy,
  Download, Map, Award, Sparkles, ArrowRight, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { speakOnce } from '../hooks/useLizVoice';

// Import Game Components
import {
  ListenChooseWord,
  ListenChoosePicture,
  ReadChoosePicture,
  LookWrite,
  ListenWrite,
  UnscrambleLetters,
  FlashcardMatch,
  MemoryGame,
  FillTheGap,
  AnimalSounds,
  WordRace,
  WordLadder,
  CumulativeRace,
  ImageWordMatch
} from '../components/games/vocab';
import {
  WordOrder,
  FillTheBlank,
  ErrorHunter,
  TrueFalseGrammar,
  MultipleChoiceGrammar,
  TransformSentence,
  AudioMatch,
  SentenceBuilderTimed
} from '../components/games/grammar';
import {
  Crossword,
  WordSearch,
  BoardGame
} from '../components/games/review';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ═══════ GAME ITEM NORMALIZATION ═══════
// Sonnet content writers emit different field names per game type
// (`audio_text` for listen, `scrambled` for unscramble, `correct` vs
// `correct_sentence`, etc). Components expect uniform fields. Normalize at
// dispatch so each component sees the shape it was authored for.
//
// Also strips author meta-comments that leak through to the student view —
// notes like "(Full 'there is/are' in Unit 3.)" the writer left for itself.

const META_COMMENT_REGEX = /\s*\([^)]*\bUnit\s+\d+[^)]*\)\s*/gi;

function stripMeta(value) {
  if (typeof value !== 'string') return value;
  return value.replace(META_COMMENT_REGEX, ' ').replace(/\s+/g, ' ').trim();
}

function synthesizeDistractors(correct, peerItems, fieldNames = ['answer', 'word', 'correct', 'correct_sentence']) {
  if (!correct) return [];
  const norm = String(correct).toLowerCase().trim();
  const pool = [];
  for (const peer of peerItems || []) {
    for (const f of fieldNames) {
      const v = peer?.[f];
      if (typeof v === 'string' && v.trim() && v.toLowerCase().trim() !== norm) {
        pool.push(v.trim());
      }
    }
  }
  const unique = Array.from(new Set(pool));
  return unique.slice(0, 3);
}

function normalizeGameItem(rawItem, gameType, peerItems) {
  if (!rawItem || typeof rawItem !== 'object') return rawItem;
  const item = { ...rawItem };

  // Strip meta-comments from every string field — catches sentence,
  // audio_text, prompt, hint, answer, correct_sentence, etc.
  for (const k of Object.keys(item)) {
    if (typeof item[k] === 'string') item[k] = stripMeta(item[k]);
  }

  // Uniform `word` field for components that expect it.
  if (!item.word) {
    if (gameType === 'listen_write') item.word = item.answer || item.audio_text;
    else if (gameType === 'unscramble') item.word = item.answer;
    else if (item.audio_text && (gameType === 'listen_choose_word' || gameType === 'flashcard_match')) {
      item.word = item.audio_text;
    }
  }
  // Uniform `answer` field (some components use `correct`).
  if (!item.answer && item.correct) item.answer = item.correct;
  // Word-order: support both camelCase + snake_case.
  if (!item.correctSentence && item.correct_sentence) item.correctSentence = item.correct_sentence;
  if (!item.correct_sentence && item.correctSentence) item.correct_sentence = item.correctSentence;

  // ListenChooseWord wants a `distractors` array; data ships `options` (which
  // already includes the correct answer). Map options → distractors minus
  // the correct word; synthesize from peers if there's only 1 option.
  if (gameType === 'listen_choose_word') {
    const correct = item.word || item.answer;
    let distractors = Array.isArray(item.options)
      ? item.options.filter(o => o && String(o).toLowerCase().trim() !== String(correct).toLowerCase().trim())
      : [];
    if (distractors.length < 2) {
      distractors = synthesizeDistractors(correct, peerItems, ['word', 'answer', 'audio_text']);
    }
    item.distractors = distractors;
  }

  // AudioMatch / multiple_choice_grammar: pad options if too few — data
  // sometimes emits a single-option array which leaves the user with no
  // choice to make. Pull alternatives from peer items.
  if ((gameType === 'audio_match' || gameType === 'multiple_choice_grammar')
      && Array.isArray(item.options) && item.options.length < 2) {
    const correct = item.correct || item.answer;
    const extras = synthesizeDistractors(correct, peerItems, ['correct', 'answer', 'audio_text', 'sentence']);
    item.options = Array.from(new Set([...(item.options || []), ...extras])).slice(0, 4);
  }

  return item;
}

function normalizeItemsForGame(items, gameType) {
  if (!Array.isArray(items)) return [];
  return items.map((it) => normalizeGameItem(it, gameType, items));
}

// Hard cap so a lesson never shows more than this many mini-games per game
// step. Aga's pedagogy call (2026-05-19): "6 oyun olmasina gerek yok en
// fazla 4 oyun ve 3 ideal." Existing data still ships 6-packs; this caps at
// render time until the packer is updated.
const MAX_GAMES_PER_STEP = 3;

// ═══════ LESSON SURFACE MOTION ═══════
// Very subtle — the lesson page is for learning, not for showing off.
// Activities fade in when they switch; sidebar dots breathe; cards lift on
// hover. Honors prefers-reduced-motion in full.
const LESSON_MOTION_CSS = `
.lesson-surface [data-testid="micro-reading"],
.lesson-surface [data-testid="listening-activity"],
.lesson-surface [data-testid="production-activity"],
.lesson-surface [data-testid="exit-ticket"],
.lesson-surface [data-testid="vocab-games-player"],
.lesson-surface [data-testid="grammar-games-player"],
.lesson-surface [data-testid="lesson-summary"] {
  animation: lessonFadeUp 0.36s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes lessonFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Soft hover lift on activity cards — kids feel they're interactive. */
.lesson-surface [data-testid="micro-reading"] [class*="rounded-xl"][class*="border-2"]:hover,
.lesson-surface [data-testid="listening-activity"] [class*="rounded-xl"][class*="border-2"]:hover,
.lesson-surface [data-testid="exit-ticket"] [class*="rounded-xl"][class*="border-2"]:hover {
  transform: translateY(-1px);
  transition: transform 0.18s ease;
}

/* Trophy + score breathe on Lesson Complete. */
.lesson-surface [data-testid="lesson-summary"] .lesson-trophy {
  animation: lessonTrophyPulse 2.6s ease-in-out infinite;
}
@keyframes lessonTrophyPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}

/* Score bars sweep in. */
.lesson-surface [data-testid="lesson-summary"] [role="progressbar"] > div {
  transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Locate-in-text highlight pulses softly the first second. */
.lesson-surface mark.bg-amber-200 {
  animation: lessonLocate 1.4s ease-out 1;
}
@keyframes lessonLocate {
  0%   { background-color: #fde68a; box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45); }
  60%  { background-color: #fcd34d; box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
  100% { background-color: #fde68a; }
}

@media (prefers-reduced-motion: reduce) {
  .lesson-surface * {
    animation: none !important;
    transition: none !important;
  }
}
`;

// ═══════ FETCH WITH RETRY ═══════
async function fetchRetry(url, options = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
}

// ═══════ ACTIVITY ERROR BOUNDARY ═══════
class ActivityErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error('Activity crash:', err, info); }
  componentDidUpdate(prevProps) {
    if (prevProps.activityType !== this.props.activityType) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 text-center" data-testid="activity-error-card">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong with this activity</h3>
          <p className="text-sm text-gray-500 mb-4">Your lesson progress is saved. You can retry or skip this activity.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => this.setState({ hasError: false })} data-testid="activity-retry-btn">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
            {this.props.onSkip && (
              <Button onClick={this.props.onSkip} data-testid="activity-skip-btn">
                Skip <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </Card>
      );
    }
    return this.props.children;
  }
}

// Per-game boundary — bad item / null prop in ONE game inside a 6-pack
// should not kill the rest. Resets whenever `resetKey` (gameIdx) changes.
class GameSlotBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error('Game slot crash:', err, info); }
  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 text-center" data-testid="game-slot-error">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-4">This mini-game can't load. Let's continue.</p>
          <Button size="sm" onClick={this.props.onSkip}>Next game <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </Card>
      );
    }
    return this.props.children;
  }
}

// ═══════ LESSON PROGRESS PERSISTENCE ═══════
const PROGRESS_KEY = 'lesson_progress_';
function saveLessonProgress(lessonId, data) {
  try { localStorage.setItem(PROGRESS_KEY + lessonId, JSON.stringify({ ...data, ts: Date.now() })); } catch {}
}
function loadLessonProgress(lessonId) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY + lessonId);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire after 24 hours
    if (Date.now() - data.ts > 86400000) { localStorage.removeItem(PROGRESS_KEY + lessonId); return null; }
    return data;
  } catch { return null; }
}
function clearLessonProgress(lessonId) {
  try { localStorage.removeItem(PROGRESS_KEY + lessonId); } catch {}
}

// ═══════ STAGE THEMES ═══════
const STAGE_THEMES = {
  stage_1: { bg: 'from-amber-50 to-orange-50', accent: '#F59E0B', accentLight: '#FEF3C7', accentText: 'text-amber-700', headerBg: 'bg-gradient-to-r from-amber-400 to-orange-400', pathColor: '#F59E0B', cardBorder: 'border-amber-200', activeBg: 'bg-amber-50', activeRing: 'ring-amber-400', completedBg: 'bg-amber-500', badgeBg: 'bg-amber-100 text-amber-700', btnBg: 'bg-amber-500 hover:bg-amber-600' },
  stage_2: { bg: 'from-emerald-50 to-teal-50', accent: '#10B981', accentLight: '#D1FAE5', accentText: 'text-emerald-700', headerBg: 'bg-gradient-to-r from-emerald-400 to-teal-400', pathColor: '#10B981', cardBorder: 'border-emerald-200', activeBg: 'bg-emerald-50', activeRing: 'ring-emerald-400', completedBg: 'bg-emerald-500', badgeBg: 'bg-emerald-100 text-emerald-700', btnBg: 'bg-emerald-500 hover:bg-emerald-600' },
  stage_3: { bg: 'from-blue-50 to-indigo-50', accent: '#3B82F6', accentLight: '#DBEAFE', accentText: 'text-blue-700', headerBg: 'bg-gradient-to-r from-blue-400 to-indigo-400', pathColor: '#3B82F6', cardBorder: 'border-blue-200', activeBg: 'bg-blue-50', activeRing: 'ring-blue-400', completedBg: 'bg-blue-500', badgeBg: 'bg-blue-100 text-blue-700', btnBg: 'bg-blue-500 hover:bg-blue-600' },
  stage_4: { bg: 'from-violet-50 to-purple-50', accent: '#8B5CF6', accentLight: '#EDE9FE', accentText: 'text-violet-700', headerBg: 'bg-gradient-to-r from-violet-400 to-purple-400', pathColor: '#8B5CF6', cardBorder: 'border-violet-200', activeBg: 'bg-violet-50', activeRing: 'ring-violet-400', completedBg: 'bg-violet-500', badgeBg: 'bg-violet-100 text-violet-700', btnBg: 'bg-violet-500 hover:bg-violet-600' },
  stage_5: { bg: 'from-rose-50 to-pink-50', accent: '#F43F5E', accentLight: '#FFE4E6', accentText: 'text-rose-700', headerBg: 'bg-gradient-to-r from-rose-400 to-pink-400', pathColor: '#F43F5E', cardBorder: 'border-rose-200', activeBg: 'bg-rose-50', activeRing: 'ring-rose-400', completedBg: 'bg-rose-500', badgeBg: 'bg-rose-100 text-rose-700', btnBg: 'bg-rose-500 hover:bg-rose-600' },
};
const getTheme = (stageId) => STAGE_THEMES[stageId] || STAGE_THEMES.stage_1;

// ═══════ FORMATTED QUESTION - Child-friendly with bold/colored keywords ═══════
const FormattedQuestion = ({ text, className = '' }) => {
  if (!text) return null;
  // Highlight quoted words, words in ALL CAPS, words with underscores
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700">$1</strong>')
    .replace(/"([^"]+)"/g, '<strong class=\'text-indigo-600 bg-indigo-50 px-1 rounded\'>&ldquo;$1&rdquo;</strong>')
    .replace(/'([^']+)'/g, '<strong class=\'text-indigo-600 bg-indigo-50 px-1 rounded\'>&#39;$1&#39;</strong>')
    .replace(/___+/g, '<span class="inline-block align-middle mx-1.5" style="width:80px;height:0;border-bottom:3px solid #2563eb;padding-top:2px"></span>')
    .replace(/\b([A-Z]{2,})\b/g, '<strong class="text-purple-700">$1</strong>');
  return <span className={className} dangerouslySetInnerHTML={{ __html: formatted }} />;
};

// ═══════ ADVENTURE ROADMAP — scattered treasure-map (GE / kids 8-15) ═══════
// 9 stops mapped 1:1 to real activity_flow types.
const ADVENTURE_STOPS = [
  { key: 'warmup',   num: '1 · Start',     title: 'Warm-up',        emoji: '👋', activities: ['retrieval_warmup', 'warm_up'],   meta: '⏱ 1m · ⭐ 10', badge: 'warmup',  pos: { left: '9.5%', top: '23%' }, tilt: 'l', float: 1, num_bg: 'bg-amber-100 text-amber-700' },
  { key: 'vocab',    num: '2',             title: 'Vocabulary',     emoji: '📖', activities: ['vocabulary'],                    meta: '⏱ 3m · ⭐ 40', badge: 'vocab',   pos: { left: '29%',  top: '12%' }, tilt: 'r', float: 2, num_bg: 'bg-orange-100 text-orange-700' },
  { key: 'vgames',   num: '3',             title: 'Word Games',     emoji: '🎮', activities: ['micro_game_vocab', 'vocab_games'], meta: '⏱ 3m · ⭐ 40', badge: 'vgames',  pos: { left: '53%',  top: '26%' }, tilt: 'l', float: 3, num_bg: 'bg-pink-100 text-pink-700' },
  { key: 'story',    num: '4 · Story',     title: 'Story Time',     emoji: '📜', activities: ['micro_reading'],                 meta: '⏱ 3m · ⭐ 30', badge: 'story',   pos: { left: '79%',  top: '18%' }, tilt: 'r', float: 4, num_bg: 'bg-rose-100 text-rose-700' },
  { key: 'grammar',  num: '5',             title: 'Grammar',        emoji: '🧩', activities: ['grammar_focus'],                 meta: '⏱ 2m · ⭐ 25', badge: 'grammar', pos: { left: '87%',  top: '57%' }, tilt: 'l', float: 5, num_bg: 'bg-violet-100 text-violet-700' },
  { key: 'ggames',   num: '6',             title: 'Gr. Games',      emoji: '🕹️', activities: ['micro_game_grammar', 'grammar_games'], meta: '⏱ 2m · ⭐ 30', badge: 'ggames',  pos: { left: '64%',  top: '62%' }, tilt: 'r', float: 6, num_bg: 'bg-teal-100 text-teal-700' },
  { key: 'listen',   num: '7',             title: 'Listening',      emoji: '🎧', activities: ['listening_task', 'listening'],   meta: '⏱ 2m · ⭐ 30', badge: 'listen',  pos: { left: '36%',  top: '57%' }, tilt: 'l', float: 7, num_bg: 'bg-blue-100 text-blue-700' },
  { key: 'speak',    num: '8 · Your turn', title: 'Speaking',       emoji: '🎤', activities: ['production'],                    meta: '⏱ 2m · ⭐ 30', badge: 'speak',   pos: { left: '17%',  top: '77%' }, tilt: 'r', float: 8, num_bg: 'bg-green-100 text-green-700' },
  { key: 'treasure', num: 'Final · 🏆',    title: 'Treasure',       emoji: '🏆', activities: ['exit_ticket', 'auto_review'],    meta: '⭐ 45 + Badge', badge: 'treasure', pos: { left: '50%',  top: '90%' }, tilt: 'l', float: 9, num_bg: 'bg-amber-100 text-amber-700' },
];

// Stop coords used by the SVG path (must mirror pos% in ADVENTURE_STOPS, in viewBox 1160×640 space)
const ADVENTURE_PATH_D =
  'M 110 147 ' +
  'C 200 100, 260 77, 336 77 ' +
  'S 540 156, 615 166 ' +
  'S 850 75, 916 115 ' +
  'S 1080 270, 1009 365 ' +
  'S 820 425, 742 397 ' +
  'S 530 333, 418 365 ' +
  'S 240 440, 197 493 ' +
  'S 460 600, 580 576';

const ADVENTURE_CSS = `
.adv-roadmap { font-family: 'Fredoka', 'Inter', system-ui, sans-serif; }
.adv-roadmap .display { font-family: 'Baloo 2', 'Fredoka', sans-serif; }
.adv-bg {
  background:
    radial-gradient(ellipse at 18% 8%,  #FFE9B6 0%, transparent 55%),
    radial-gradient(ellipse at 85% 18%, #C7EFFD 0%, transparent 55%),
    radial-gradient(ellipse at 20% 90%, #FFD8E8 0%, transparent 55%),
    radial-gradient(ellipse at 90% 95%, #D7F3E1 0%, transparent 55%),
    linear-gradient(180deg, #FFF5DB 0%, #FFE5D4 100%);
}
.adv-island { position: absolute; border-radius: 50% 50% 0 0 / 100% 100% 0 0; opacity: 0.28; pointer-events: none; }
.adv-cloud {
  position: absolute; width: 110px; height: 32px;
  background: white; border-radius: 40px;
  opacity: 0.8; animation: advDrift 30s linear infinite; pointer-events: none;
}
.adv-cloud::before, .adv-cloud::after { content: ''; position: absolute; background: white; border-radius: 50%; }
.adv-cloud::before { width: 44px; height: 44px; top: -20px; left: 10px; }
.adv-cloud::after  { width: 64px; height: 64px; top: -30px; right: 12px; }
@keyframes advDrift { 0% { transform: translateX(-200px); } 100% { transform: translateX(calc(100vw + 200px)); } }

.adv-mapwrap { position: relative; width: 100%; max-width: 1160px; margin: 0 auto; aspect-ratio: 1160 / 640; }
.adv-stop {
  position: absolute; display: flex; flex-direction: column; align-items: center; cursor: pointer;
  opacity: 0; transform: translate(-50%, -50%) scale(0.7);
  animation: advStopIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  z-index: 10;
}
@keyframes advStopIn { to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }

.adv-badge {
  width: 118px; height: 118px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 62px; position: relative;
  box-shadow: 0 22px 42px -10px rgba(0,0,0,0.30), inset 0 -12px 20px rgba(0,0,0,0.18), inset 0 12px 20px rgba(255,255,255,0.45);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: none; cursor: pointer;
}
.adv-badge::before {
  content: ''; position: absolute; top: 14px; left: 22px;
  width: 34px; height: 17px; background: rgba(255,255,255,0.55);
  border-radius: 50%; filter: blur(2px);
}
.adv-stop:hover .adv-badge { transform: scale(1.14) translateY(-4px); }
.adv-badge-warmup    { background: linear-gradient(135deg, #FFE066 0%, #FFB75E 100%); }
.adv-badge-vocab     { background: linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%); }
.adv-badge-vgames    { background: linear-gradient(135deg, #FF94BC 0%, #E04E89 100%); }
.adv-badge-story     { background: linear-gradient(135deg, #FF8DA1 0%, #C2185B 100%); }
.adv-badge-grammar   { background: linear-gradient(135deg, #A586FF 0%, #6A4BD9 100%); }
.adv-badge-ggames    { background: linear-gradient(135deg, #62E0CB 0%, #20A89F 100%); }
.adv-badge-listen    { background: linear-gradient(135deg, #6FBFFF 0%, #2C7BD9 100%); }
.adv-badge-speak     { background: linear-gradient(135deg, #84E184 0%, #2E9B3E 100%); }
.adv-badge-treasure  { background: linear-gradient(135deg, #FFE066 0%, #FFA500 100%); }

@keyframes advFloat { 0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-6px) rotate(calc(var(--rot, 0deg) + 1deg)); } }
.adv-float-1 { --rot: -3deg; animation: advFloat 4.2s ease-in-out 0.0s infinite; }
.adv-float-2 { --rot:  4deg; animation: advFloat 4.6s ease-in-out 0.3s infinite; }
.adv-float-3 { --rot: -2deg; animation: advFloat 4.0s ease-in-out 0.6s infinite; }
.adv-float-4 { --rot:  5deg; animation: advFloat 4.4s ease-in-out 0.9s infinite; }
.adv-float-5 { --rot: -4deg; animation: advFloat 4.3s ease-in-out 1.2s infinite; }
.adv-float-6 { --rot:  3deg; animation: advFloat 4.5s ease-in-out 1.5s infinite; }
.adv-float-7 { --rot: -5deg; animation: advFloat 4.1s ease-in-out 1.8s infinite; }
.adv-float-8 { --rot:  2deg; animation: advFloat 4.7s ease-in-out 2.1s infinite; }
.adv-float-9 { --rot: -3deg; animation: advFloat 4.2s ease-in-out 2.4s infinite; }

.adv-card {
  margin-top: 10px; background: rgba(255,255,255,0.95); backdrop-filter: blur(4px);
  border-radius: 14px; padding: 6px 14px; min-width: 130px; text-align: center;
  box-shadow: 0 8px 20px -6px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.9);
  transform: rotate(var(--card-rot, 0deg));
}
.adv-card.tilt-l { --card-rot: -2deg; }
.adv-card.tilt-r { --card-rot:  2deg; }
.adv-num {
  display: inline-block; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  padding: 2px 8px; border-radius: 999px;
}
.adv-title { font-family: 'Baloo 2', 'Fredoka', sans-serif; font-size: 16px; font-weight: 700; color: #1e293b; line-height: 1.1; margin-top: 3px; }
.adv-meta { font-size: 11px; color: #94a3b8; margin-top: 2px; }

.adv-locked .adv-badge { filter: grayscale(0.85) brightness(0.92); opacity: 0.7; }
.adv-lock-chip {
  position: absolute; bottom: -4px; right: -4px; width: 34px; height: 34px;
  background: white; color: #64748b; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); border: 3px solid #f8fafc;
}
.adv-check-chip {
  position: absolute; top: -4px; right: -4px; width: 32px; height: 32px;
  background: #10B981; color: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(16,185,129,0.4); border: 3px solid white;
}

.adv-pulse-ring {
  position: absolute; inset: -8px;
  border: 4px solid #FFB75E; border-radius: 50%;
  animation: advPulse 1.8s ease-out infinite; pointer-events: none;
}
@keyframes advPulse { 0% { transform: scale(0.95); opacity: 0.65; } 100% { transform: scale(1.55); opacity: 0; } }

.adv-path-line { stroke-dasharray: 3200; stroke-dashoffset: 3200; animation: advDrawPath 3.6s ease-out 0.3s forwards; }
@keyframes advDrawPath { to { stroke-dashoffset: 0; } }

.adv-deco { position: absolute; pointer-events: none; font-size: 28px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.12)); opacity: 0.9; z-index: 2; }
.adv-deco-small { font-size: 22px; opacity: 0.7; }
@keyframes advSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.adv-compass { animation: advSpin 30s linear infinite; }
@keyframes advSway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
.adv-palm { animation: advSway 4s ease-in-out infinite; transform-origin: bottom center; }

.adv-sparkle { position: absolute; font-size: 18px; animation: advTwinkle 2.4s ease-in-out infinite; pointer-events: none; z-index: 3; }
@keyframes advTwinkle { 0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; } 50% { transform: scale(1) rotate(180deg); opacity: 1; } }

@keyframes advBounce { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
.adv-mascot { animation: advBounce 2.5s ease-in-out infinite; }

@keyframes advStartPulse {
  0%, 100% { transform: scale(1);    box-shadow: 0 12px 30px rgba(237, 143, 3, 0.45); }
  50%      { transform: scale(1.04); box-shadow: 0 16px 40px rgba(237, 143, 3, 0.65); }
}
.adv-start-btn { animation: advStartPulse 2s ease-in-out infinite; }
.adv-start-btn:hover { animation-play-state: paused; transform: scale(1.07); }

.adv-bubble { position: relative; background: white; border-radius: 14px; padding: 7px 11px; box-shadow: 0 6px 18px rgba(0,0,0,0.12); font-size: 12px; font-weight: 500; color: #334155; white-space: nowrap; }
.adv-bubble::after { content: ''; position: absolute; bottom: -6px; left: 18px; width: 12px; height: 12px; background: white; transform: rotate(45deg); border-radius: 0 0 4px 0; }

/* ─── MOBILE: vertical timeline (treasure-map collapses on small screens) ─── */
@media (max-width: 768px) {
  .adv-roadmap .adv-deco,
  .adv-roadmap .adv-sparkle,
  .adv-roadmap .adv-island,
  .adv-roadmap .adv-cloud,
  .adv-roadmap svg.adv-path-svg,
  .adv-roadmap .adv-mapwrap > svg { display: none !important; }

  .adv-mapwrap {
    aspect-ratio: auto !important;
    max-width: 100% !important;
    padding: 8px 0 24px;
  }
  /* Vertical column with a connecting line down the middle of each badge */
  .adv-mapwrap::before {
    content: '';
    position: absolute;
    left: 51px; top: 30px; bottom: 30px;
    width: 3px;
    background: repeating-linear-gradient(to bottom, #FFB75E 0 8px, transparent 8px 14px);
    border-radius: 2px;
    z-index: 0;
  }
  .adv-stop {
    position: relative !important;
    left: 0 !important; top: 0 !important;
    transform: none !important;
    width: 100%;
    margin: 10px 0;
    padding: 0 16px;
    flex-direction: row !important;
    align-items: center !important;
    gap: 14px;
    animation: lessonFadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .adv-stop .adv-badge {
    width: 78px; height: 78px;
    font-size: 38px;
    flex-shrink: 0;
    z-index: 2;
  }
  .adv-stop .adv-card {
    flex: 1;
    transform: none !important;
    margin-top: 0 !important;
    padding: 10px 14px;
    background: white;
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    text-align: left;
  }
  .adv-stop .adv-num { font-size: 11px; padding: 2px 8px; }
  .adv-stop .adv-title { font-size: 16px; margin-top: 2px; }
  .adv-stop .adv-meta { font-size: 12px; }
  .adv-stop.adv-locked { opacity: 0.55; }
  .adv-stop.adv-locked .adv-card { filter: grayscale(0.4); }

  /* Mascot row + Start button: stack mascot above sticky CTA */
  .adv-roadmap .adv-mascot { margin-bottom: 12px; }
  .adv-roadmap .adv-start-btn {
    position: sticky;
    bottom: 16px;
    width: calc(100% - 32px);
    margin: 8px auto 0;
    justify-content: center;
  }
}
`;

// ═══════ LESSON ROADMAP (Adventure / Treasure-Map) ═══════
function LessonRoadmap({ lesson, completedActivities, onStartActivity, onStartLesson, theme }) {
  const isStopCompleted = (stop) => stop.activities.some(a => completedActivities.includes(a));
  // First not-yet-completed stop gets the active pulse ring
  const firstActiveIdx = ADVENTURE_STOPS.findIndex(s => !isStopCompleted(s));

  const handleConfetti = useCallback(() => {
    try {
      confetti({ particleCount: 80, spread: 75, origin: { y: 0.85 }, colors: ['#FFB75E','#FF6B9D','#8B73FF','#5BAEFA','#4ECDC4','#FFD700','#2E9B3E'] });
    } catch {}
  }, []);

  return (
    <div className="adv-roadmap adv-bg relative overflow-hidden" data-testid="lesson-roadmap" style={{ minHeight: '92vh' }}>
      <style>{ADVENTURE_CSS}</style>

      {/* Distant islands */}
      <div className="adv-island" style={{ width: 280, height: 70, bottom: 0, left: -30, background: '#f5b27a' }} />
      <div className="adv-island" style={{ width: 220, height: 60, bottom: 0, right: -20, background: '#f7c8a3' }} />

      {/* Drifting clouds */}
      <div className="adv-cloud" style={{ top: 50, animationDelay: '0s' }} />
      <div className="adv-cloud" style={{ top: 120, animationDelay: '-12s', transform: 'scale(0.65)' }} />
      <div className="adv-cloud" style={{ top: 80, animationDelay: '-22s', transform: 'scale(0.85)' }} />

      <div className="relative px-4 pt-4 pb-6">

        {/* Hero (compact) */}
        <div className="text-center mb-2 relative z-20">
          <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm mb-1.5">
            <Map className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-xs font-semibold text-amber-700">Your Adventure Map</span>
          </div>
          <h2 className="display text-3xl md:text-4xl font-bold text-slate-800 leading-tight">{lesson?.title}</h2>
          <p className="text-slate-600 text-sm mt-0.5">Lesson {lesson?.number} — follow the path, friend 🚀</p>
        </div>

        {/* Map */}
        <div className="adv-mapwrap">

          {/* Decorations */}
          <div className="adv-deco adv-compass" style={{ top: '6%', right: '4%', fontSize: 36 }}>🧭</div>
          <div className="adv-deco adv-palm" style={{ top: '20%', left: '50%' }}>🌴</div>
          <div className="adv-deco adv-deco-small" style={{ top: '12%', left: '25%' }}>⛰️</div>
          <div className="adv-deco adv-deco-small" style={{ top: '75%', left: '38%' }}>🌳</div>
          <div className="adv-deco adv-deco-small" style={{ top: '50%', left: '8%' }}>🪨</div>
          <div className="adv-deco adv-deco-small" style={{ top: '60%', right: '14%' }}>🌊</div>
          <div className="adv-deco adv-deco-small" style={{ top: '85%', right: '35%' }}>🐚</div>

          {/* Sparkles */}
          <div className="adv-sparkle" style={{ top: '30%', left: '4%', color: '#FFD700' }}>✨</div>
          <div className="adv-sparkle" style={{ top: '55%', right: '4%', color: '#F472B6', animationDelay: '0.5s' }}>⭐</div>
          <div className="adv-sparkle" style={{ top: '80%', left: '50%', color: '#60A5FA', animationDelay: '1s' }}>✨</div>

          {/* Path */}
          <svg viewBox="0 0 1160 640" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="advPathGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"  stopColor="#FFE066" />
                <stop offset="15%" stopColor="#FFB75E" />
                <stop offset="30%" stopColor="#FF6B9D" />
                <stop offset="50%" stopColor="#C2185B" />
                <stop offset="65%" stopColor="#8B73FF" />
                <stop offset="80%" stopColor="#2C7BD9" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>
            <path className="adv-path-line" d={ADVENTURE_PATH_D} stroke="url(#advPathGrad)" strokeWidth="6" fill="none" strokeDasharray="13 11" strokeLinecap="round" opacity="0.92" />
          </svg>

          {/* Stops */}
          {ADVENTURE_STOPS.map((stop, i) => {
            const completed = isStopCompleted(stop);
            const isActive = i === firstActiveIdx;
            const locked = !completed && !isActive;
            const firstActivity = stop.activities[0];
            return (
              <div
                key={stop.key}
                className={`adv-stop ${locked ? 'adv-locked' : ''}`}
                style={{ left: stop.pos.left, top: stop.pos.top, animationDelay: `${0.25 + i * 0.1}s` }}
                onClick={() => onStartActivity && onStartActivity(firstActivity)}
                data-testid={`roadmap-step-${stop.key}`}
              >
                <div className={`adv-badge adv-badge-${stop.badge} adv-float-${stop.float} relative`}>
                  {stop.emoji}
                  {completed && <div className="adv-check-chip"><CheckCircle className="w-4 h-4" /></div>}
                  {isActive && <div className="adv-pulse-ring" />}
                  {locked && <div className="adv-lock-chip">🔒</div>}
                </div>
                <div className={`adv-card tilt-${stop.tilt}`}>
                  <span className={`adv-num ${stop.num_bg}`}>{stop.num}</span>
                  <div className="adv-title">{stop.title}</div>
                  <div className="adv-meta">{stop.meta}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer row: mascot + Start + reward */}
        <div className="relative max-w-5xl mx-auto mt-3 flex items-end justify-between px-4 z-20">
          <div className="adv-mascot flex items-end gap-2">
            <img
              src="/static/images/ray/ray.png"
              alt="Ray"
              className="w-14 h-14 rounded-full shadow-lg border-[3px] border-white object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="adv-bubble mb-2">Let's go, friend! 🌟</div>
          </div>

          <button
            className="adv-start-btn bg-gradient-to-br from-amber-400 to-orange-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-2xl flex items-center gap-2 hover:from-amber-500 hover:to-orange-600 transition-colors"
            onClick={() => { handleConfetti(); onStartLesson && onStartLesson(); }}
            data-testid="roadmap-start-btn"
          >
            <Play className="w-5 h-5" /> Start Adventure!
          </button>

          <div className="hidden md:flex flex-col items-end text-right">
            <div className="text-xs text-slate-500">Earn up to</div>
            <div className="text-base font-bold text-amber-600">280 ⭐ + 🏆</div>
          </div>
        </div>

      </div>
    </div>
  );
}

const ACTIVITY_ICONS = {
  'retrieval_warmup': RefreshCw, 'vocabulary': BookOpen, 'micro_game_vocab': Gamepad2, 'vocab_games': Gamepad2,
  'micro_reading': FileText, 'grammar_focus': Edit3, 'micro_game_grammar': Gamepad2, 'grammar_games': Gamepad2,
  'listening': Headphones, 'listening_task': Headphones, 'production': Mic, 'exit_ticket': CheckCircle, 'auto_review': Repeat
};

const ACTIVITY_LABELS = {
  'retrieval_warmup': 'Warm-up', 'vocabulary': 'Vocabulary', 'micro_game_vocab': 'Vocab Games', 'vocab_games': 'Vocab Games',
  'micro_reading': 'Reading', 'grammar_focus': 'Grammar', 'micro_game_grammar': 'Grammar Games', 'grammar_games': 'Grammar Games',
  'listening': 'Listening', 'listening_task': 'Listening', 'production': 'Speaking', 'exit_ticket': 'Exit Quiz', 'auto_review': 'Review'
};

// ═══════ LESSON PATH SIDEBAR (Wavy Visual Path) ═══════
function LessonPath({ activities, currentActivity, completedActivities, onActivityClick, theme }) {
  const t = theme || STAGE_THEMES.stage_1;
  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${t.cardBorder} bg-white`}>
      <h3 className="text-base font-bold text-gray-900 mb-5" data-testid="lesson-progress-title">Lesson Path</h3>
      <div className="relative">
        {/* Wavy path SVG background */}
        <svg className="absolute left-5 top-0 w-1 h-full" style={{ overflow: 'visible' }}>
          {activities.map((_, i) => i < activities.length - 1 && (
            <line key={i} x1="0" y1={i * 64 + 20} x2="0" y2={(i + 1) * 64 + 20}
              stroke={completedActivities.includes(activities[i].type) ? t.accent : '#E5E7EB'}
              strokeWidth="3" strokeDasharray={completedActivities.includes(activities[i].type) ? '0' : '6 4'} />
          ))}
        </svg>

        <div className="space-y-2 relative">
          {activities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type] || Play;
            const isCompleted = completedActivities.includes(activity.type);
            const isCurrent = currentActivity === activity.type;
            const isAccessible = true; // All activities accessible

            return (
              <div key={activity.activity_id} data-testid={`activity-step-${activity.type}`}>
                <button
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                    isCurrent ? `${t.activeBg} ring-2 ${t.activeRing}` :
                    isCompleted ? 'bg-green-50' :
                    isAccessible ? 'hover:bg-gray-50' : 'opacity-40 cursor-not-allowed'
                  }`}
                  onClick={() => isAccessible && onActivityClick(activity)}
                  disabled={!isAccessible}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted ? 'bg-green-500 text-white shadow-md' :
                    isCurrent ? `${t.completedBg} text-white shadow-lg scale-110` :
                    isAccessible ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-300'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : !isAccessible ? <Lock className="w-4 h-4" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium truncate block ${isCurrent ? t.accentText : 'text-gray-900'}`}>{ACTIVITY_LABELS[activity.type] || activity.label}</span>
                    <span className="text-xs text-gray-400">{activity.duration_minutes} min</span>
                  </div>
                  {isCurrent && !isCompleted && <div className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: t.accent }} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════ SKIP BUTTON ═══════
function SkipButton({ onSkip, label = 'Skip' }) {
  return (
    <button onClick={onSkip} className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1" data-testid="activity-skip-btn">
      {label} <ChevronRight className="w-3 h-3" />
    </button>
  );
}

// ═══════ RETRIEVAL WARMUP ═══════
function RetrievalWarmup({ activity, onComplete, onSkip }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correct, setCorrect] = useState(0);
  const questions = activity?.questions || [];
  const q = questions[currentIndex];

  const handleSelect = (option) => {
    if (showFeedback) return;
    setSelectedAnswer(option);
    setShowFeedback(true);
    const isRight = Array.isArray(q.correct_answer) ? q.correct_answer.includes(option) : option === q.correct_answer;
    if (isRight) setCorrect(c => c + 1);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      onComplete(Math.round((correct / questions.length) * 100));
    }
  };

  if (!q) return <div className="text-center text-gray-500 py-12">No warmup questions available</div>;

  return (
    <div className="max-w-2xl mx-auto" data-testid="retrieval-warmup">
      <div className="flex items-center justify-between mb-6">
        <Badge className="bg-orange-100 text-orange-700 border-0"><RefreshCw className="w-3 h-3 mr-1" /> Warm-up</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{currentIndex + 1} / {questions.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={((currentIndex + 1) / questions.length) * 100} className="mb-8" />
      <Card className="p-8">
        {/* Video embed */}
        {q.video_url && (
          <div className="mb-5 rounded-xl overflow-hidden aspect-video max-w-md mx-auto">
            <iframe
              src={q.video_url.replace('watch?v=', 'embed/')}
              title="Lesson Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
            />
          </div>
        )}
        {/* Image hint */}
        {q.image_emoji && (
          <div className="flex justify-center mb-5">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-50 rounded-2xl flex items-center justify-center border border-orange-200 shadow-sm">
              <span className="text-5xl">{q.image_emoji}</span>
            </div>
          </div>
        )}
        <h3 className="text-2xl font-bold text-gray-900 mb-4"><FormattedQuestion text={q.question_text} /></h3>
        {q.hint && !showFeedback && (
          <p className="text-base text-amber-600 italic mb-4">Hint: {q.hint}</p>
        )}
        <div className="space-y-3">
          {q.options?.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = Array.isArray(q.correct_answer) ? q.correct_answer.includes(option) : option === q.correct_answer;
            let cls = 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30';
            if (showFeedback) {
              if (isCorrectOption) cls = 'border-green-500 bg-green-50 text-green-800';
              else if (isSelected && !isCorrectOption) cls = 'border-red-500 bg-red-50 text-red-800';
              else cls = 'border-gray-200 opacity-50';
            } else if (isSelected) cls = 'border-blue-500 bg-blue-50';
            return (
              <button key={option} className={`w-full p-5 rounded-xl text-left border-2 transition-all font-medium text-lg ${cls}`}
                onClick={() => handleSelect(option)} disabled={showFeedback}
                data-testid={`warmup-option-${option.substring(0,10).replace(/\s/g,'-')}`}>
                {option}
                {showFeedback && isCorrectOption && <CheckCircle className="inline w-5 h-5 ml-2 text-green-600" />}
                {showFeedback && isSelected && !isCorrectOption && <X className="inline w-5 h-5 ml-2 text-red-600" />}
              </button>
            );
          })}
        </div>
        {showFeedback && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleNext} data-testid="warmup-next-btn">
              {currentIndex < questions.length - 1 ? 'Next' : 'Continue'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

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
                <img src={word.image_url.startsWith('/') ? `${API_URL}/api${word.image_url}` : word.image_url} alt={word.word} className="w-16 h-16 object-cover rounded-lg mx-auto mb-1" />
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
                <div className="w-36 h-36 rounded-2xl overflow-hidden border border-blue-100 shadow-sm shrink-0">
                  <img src={w.image_url.startsWith('/') ? `${API_URL}/api${w.image_url}` : w.image_url} alt={w.word} className="w-full h-full object-cover" loading="lazy" />
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

// ═══════ VOCAB GAMES PLAYER (Multiple Games in Sequence) ═══════
function VocabGamesPlayer({ activity, onComplete, onSkip }) {
  // Cap pack length per pedagogy call — max 3-4 mini-games per step keeps
  // 8-12yo learners engaged without burnout. See MAX_GAMES_PER_STEP above.
  const games = (activity?.games || []).slice(0, MAX_GAMES_PER_STEP);
  const [currentGameIdx, setCurrentGameIdx] = useState(0);
  const [gameScores, setGameScores] = useState([]);
  const [isAllComplete, setIsAllComplete] = useState(false);

  // Fallback to old format if no games array
  if (!games.length && activity?.items) {
    return <MatchingGame activity={activity} onComplete={onComplete} onSkip={onSkip} />;
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No games available</p>
        <Button className="mt-4" onClick={() => onComplete(100)}>Continue</Button>
      </div>
    );
  }

  const currentGame = games[currentGameIdx];

  const handleGameComplete = (score) => {
    const newScores = [...gameScores, score];
    setGameScores(newScores);
    
    if (currentGameIdx < games.length - 1) {
      setCurrentGameIdx(i => i + 1);
    } else {
      // All games complete
      const avgScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
      setIsAllComplete(true);
      setTimeout(() => onComplete(avgScore), 1500);
    }
  };

  const handleSkip = () => {
    if (currentGameIdx < games.length - 1) {
      setCurrentGameIdx(i => i + 1);
    } else {
      onSkip();
    }
  };

  if (isAllComplete) {
    const avgScore = Math.round(gameScores.reduce((a, b) => a + b, 0) / gameScores.length);
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <Sparkles className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Games Complete!</h2>
        <p className="text-gray-600">Average Score: {avgScore}%</p>
        <div className="flex justify-center gap-1 mt-4">
          {[1, 2, 3].map(i => (
            <Star key={i} className={`w-8 h-8 ${avgScore >= i * 30 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>
      </Card>
    );
  }

  // Render game based on type
  const renderGame = () => {
    const gameType = currentGame?.game_type;
    const rawItems = currentGame?.items || [];
    const items = normalizeItemsForGame(rawItems, gameType);

    // Guard: skip games with no items
    if (!items.length) {
      return (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">This game has no items available.</p>
          <Button onClick={handleSkip}>Skip to Next</Button>
        </Card>
      );
    }

    switch (gameType) {
      case 'listen_choose_word':
        return <ListenChooseWord items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'listen_choose_picture':
        return <ListenChoosePicture items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'read_choose_picture':
        return <ReadChoosePicture items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'look_write':
        return <LookWrite items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'listen_write':
        return <ListenWrite items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'unscramble':
        return <UnscrambleLetters items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'flashcard_match':
        return <FlashcardMatch items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'memory_game':
        return <MemoryGame items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'fill_gap':
        return <FillTheGap items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'animal_sounds':
        return <AnimalSounds items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'crossword':
        return <Crossword items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'word_search':
        return <WordSearch items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'board_game':
        return <BoardGame items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'image_word_match':
        return <ImageWordMatch items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'word_race':
        return <WordRace items={items} onComplete={handleGameComplete} onSkip={handleSkip} timeLimit={currentGame?.time_limit_seconds} />;
      case 'cumulative_race':
        return <CumulativeRace items={items} onComplete={handleGameComplete} onSkip={handleSkip} timeLimit={currentGame?.time_limit_seconds} />;
      case 'word_ladder':
        // word_ladder uses `rungs` or `items`
        return <WordLadder items={currentGame?.rungs || items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      default:
        // Fallback to MCQ game
        return <MatchingGame activity={{ items }} onComplete={handleGameComplete} onSkip={handleSkip} />;
    }
  };

  return (
    <div data-testid="vocab-games-player">
      {/* Game Progress Header */}
      <div className="mb-4 text-center">
        <Badge className="bg-purple-100 text-purple-700 border-0">
          <Gamepad2 className="w-3 h-3 mr-1" /> Game {currentGameIdx + 1} of {games.length}
        </Badge>
      </div>
      <GameSlotBoundary resetKey={currentGameIdx} onSkip={handleSkip}>
        {renderGame()}
      </GameSlotBoundary>
    </div>
  );
}

// ═══════ GRAMMAR GAMES PLAYER ═══════
function GrammarGamesPlayer({ activity, onComplete, onSkip }) {
  // Same per-step cap as vocab pack — pedagogy call 2026-05-19.
  const games = (activity?.games || []).slice(0, MAX_GAMES_PER_STEP);
  const [currentGameIdx, setCurrentGameIdx] = useState(0);
  const [gameScores, setGameScores] = useState([]);
  const [isAllComplete, setIsAllComplete] = useState(false);

  // Fallback to old format
  if (!games.length) {
    return <GrammarGame activity={activity} onComplete={onComplete} onSkip={onSkip} />;
  }

  const currentGame = games[currentGameIdx];

  const handleGameComplete = (score) => {
    const newScores = [...gameScores, score];
    setGameScores(newScores);
    
    if (currentGameIdx < games.length - 1) {
      setCurrentGameIdx(i => i + 1);
    } else {
      const avgScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
      setIsAllComplete(true);
      setTimeout(() => onComplete(avgScore), 1500);
    }
  };

  const handleSkip = () => {
    if (currentGameIdx < games.length - 1) {
      setCurrentGameIdx(i => i + 1);
    } else {
      onSkip();
    }
  };

  if (isAllComplete) {
    const avgScore = Math.round(gameScores.reduce((a, b) => a + b, 0) / gameScores.length);
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Grammar Games Complete!</h2>
        <p className="text-gray-600">Average Score: {avgScore}%</p>
      </Card>
    );
  }

  const renderGame = () => {
    const gameType = currentGame?.game_type;
    const rawItems = currentGame?.items || [];
    const items = normalizeItemsForGame(rawItems, gameType);

    if (!items.length) {
      return (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">This game has no items available.</p>
          <Button onClick={handleSkip}>Skip to Next</Button>
        </Card>
      );
    }

    switch (gameType) {
      case 'word_order':
        return <WordOrder items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'fill_blank':
        return <FillTheBlank items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'error_hunter':
        return <ErrorHunter items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'true_false':
        return <TrueFalseGrammar items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'multiple_choice_grammar':
        return <MultipleChoiceGrammar items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'transform_sentence':
        return <TransformSentence items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'audio_match':
        return <AudioMatch items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
      case 'sentence_builder_timed':
        return <SentenceBuilderTimed items={items} onComplete={handleGameComplete} onSkip={handleSkip} timeLimit={currentGame?.time_limit_seconds} />;
      default:
        return <FillTheBlank items={items} onComplete={handleGameComplete} onSkip={handleSkip} />;
    }
  };

  return (
    <div data-testid="grammar-games-player">
      <div className="mb-4 text-center">
        <Badge className="bg-orange-100 text-orange-700 border-0">
          <Edit3 className="w-3 h-3 mr-1" /> Grammar Game {currentGameIdx + 1} of {games.length}
        </Badge>
      </div>
      <GameSlotBoundary resetKey={currentGameIdx} onSkip={handleSkip}>
        {renderGame()}
      </GameSlotBoundary>
    </div>
  );
}

// ═══════ VOCAB GAME (Multiple Choice or Matching) ═══════
function MatchingGame({ activity, onComplete, onSkip }) {
  const items = activity?.items || [];
  
  // Detect if items have matching format (word + match) or MCQ format (question_text + options)
  const isMatchingFormat = items.length > 0 && items[0]?.word && items[0]?.match;
  const isMCQFormat = items.length > 0 && items[0]?.question_text && items[0]?.options;
  
  // MCQ/Quiz Mode States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  
  // Matching Mode States
  const [matchingItems] = useState(() => isMatchingFormat ? [...items].sort(() => Math.random() - 0.5) : []);
  const [shuffledMatches] = useState(() => isMatchingFormat ? [...items].sort(() => Math.random() - 0.5) : []);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongPair, setWrongPair] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(null);

  // Matching game effect
  useEffect(() => {
    if (!isMatchingFormat || !selectedWord || !selectedMatch) return;
    const item = matchingItems.find(i => i.word === selectedWord);
    if (item && item.match === selectedMatch) {
      setLastCorrect(true);
      setMatchedPairs(prev => {
        const newMatched = [...prev, selectedWord];
        if (newMatched.length === matchingItems.length) {
          setTimeout(() => onComplete(100, 3), 400);
        }
        return newMatched;
      });
      setTimeout(() => { setSelectedWord(null); setSelectedMatch(null); setLastCorrect(null); }, 400);
    } else {
      setWrongPair(true);
      setLastCorrect(false);
      setTimeout(() => { setWrongPair(false); setSelectedWord(null); setSelectedMatch(null); setLastCorrect(null); }, 600);
    }
  }, [selectedWord, selectedMatch, matchingItems, isMatchingFormat, onComplete]);

  // MCQ handlers
  const handleMCQSelect = (option) => {
    if (showFeedback) return;
    setSelectedAnswer(option);
    setShowFeedback(true);
    const q = items[currentIdx];
    const opt = String(option).toLowerCase().trim();
    const isCorrect = Array.isArray(q.correct_answer)
      ? q.correct_answer.some(a => String(a).toLowerCase().trim() === opt)
      : opt === String(q.correct_answer || '').toLowerCase().trim();
    if (isCorrect) setScore(s => s + 1);
  };

  const handleMCQNext = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentIdx < items.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      const pct = Math.round((score / items.length) * 100);
      onComplete(pct, pct >= 80 ? 3 : pct >= 60 ? 2 : 1);
    }
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div data-testid="matching-game" className="text-center py-12">
        <p className="text-gray-500">No vocabulary game data available</p>
        <Button className="mt-4" onClick={() => onComplete(100)}>Skip</Button>
      </div>
    );
  }

  // MCQ/Quiz Format Rendering
  if (isMCQFormat) {
    const q = items[currentIdx];
    const isCorrectOption = (option) => {
      const opt = String(option).toLowerCase().trim();
      if (Array.isArray(q.correct_answer)) return q.correct_answer.some(a => String(a).toLowerCase().trim() === opt);
      return opt === String(q.correct_answer || '').toLowerCase().trim();
    };

    return (
      <div data-testid="matching-game">
        <div className="flex items-center justify-between mb-6">
          <Badge className="bg-purple-100 text-purple-700 border-0"><Gamepad2 className="w-3 h-3 mr-1" /> Vocab Game</Badge>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{currentIdx + 1} / {items.length}</span>
            <SkipButton onSkip={onSkip} />
          </div>
        </div>
        <Progress value={((currentIdx + 1) / items.length) * 100} className="mb-6" />
        
        <Card className="p-8 max-w-xl mx-auto text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-6">{q.question_text}</h3>
          <div className="space-y-3">
            {(q.options || []).map((option) => {
              const isSelected = selectedAnswer === option;
              const optionIsCorrect = isCorrectOption(option);
              let cls = 'border-gray-200 hover:border-purple-300 hover:bg-purple-50';
              if (showFeedback) {
                if (optionIsCorrect) cls = 'border-green-500 bg-green-50 text-green-800';
                else if (isSelected && !optionIsCorrect) cls = 'border-red-500 bg-red-50 text-red-800';
                else cls = 'border-gray-200 opacity-50';
              } else if (isSelected) {
                cls = 'border-purple-500 bg-purple-50';
              }
              return (
                <button
                  key={option}
                  className={`w-full p-4 rounded-xl text-left border-2 transition-all font-medium text-sm ${cls}`}
                  onClick={() => handleMCQSelect(option)}
                  disabled={showFeedback}
                  data-testid={`vocab-game-option-${option}`}
                >
                  {option}
                  {showFeedback && optionIsCorrect && <CheckCircle className="inline w-5 h-5 ml-2 text-green-600" />}
                  {showFeedback && isSelected && !optionIsCorrect && <X className="inline w-5 h-5 ml-2 text-red-600" />}
                </button>
              );
            })}
          </div>
          {showFeedback && (
            <div className="mt-6">
              <p className={`text-sm font-semibold mb-3 ${selectedAnswer && isCorrectOption(selectedAnswer) ? 'text-green-600' : 'text-red-600'}`}>
                {selectedAnswer && isCorrectOption(selectedAnswer) ? 'Correct!' : `The answer is: ${q.correct_answer}`}
              </p>
              <Button onClick={handleMCQNext} data-testid="vocab-game-next-btn">
                {currentIdx < items.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Matching Format Rendering (original logic)
  return (
    <div data-testid="matching-game">
      <div className="flex items-center justify-between mb-6">
        <Badge className="bg-purple-100 text-purple-700 border-0"><Gamepad2 className="w-3 h-3 mr-1" /> Vocab Game</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{matchedPairs.length} / {matchingItems.length} matched</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Match the Words</h3>
        <p className="text-sm text-gray-500">Connect words with their definitions</p>
        {lastCorrect === true && <p className="text-green-600 font-semibold text-sm mt-1">Correct match!</p>}
        {lastCorrect === false && <p className="text-red-600 font-semibold text-sm mt-1">Try again!</p>}
      </div>
      <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Words</h4>
          {matchingItems.map(item => (
            <button key={item.word} disabled={matchedPairs.includes(item.word)}
              className={`w-full p-3.5 rounded-xl text-left font-medium transition-all text-sm ${
                matchedPairs.includes(item.word) ? 'bg-green-100 text-green-700' :
                selectedWord === item.word ? (wrongPair ? 'bg-red-100 border-2 border-red-400' : 'bg-blue-500 text-white shadow-md') :
                'bg-white border-2 border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => !matchedPairs.includes(item.word) && setSelectedWord(item.word)}
              data-testid={`match-word-${item.word}`}>
              {item.word} {matchedPairs.includes(item.word) && <CheckCircle className="inline w-4 h-4 ml-1" />}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Definitions</h4>
          {shuffledMatches.map(item => (
            <button key={item.match} disabled={matchedPairs.includes(item.word)}
              className={`w-full p-3.5 rounded-xl text-left text-sm transition-all ${
                matchedPairs.includes(item.word) ? 'bg-green-100 text-green-700' :
                selectedMatch === item.match ? (wrongPair ? 'bg-red-100 border-2 border-red-400' : 'bg-blue-500 text-white shadow-md') :
                'bg-white border-2 border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => !matchedPairs.includes(item.word) && setSelectedMatch(item.match)}
              data-testid={`match-def-${item.word}`}>
              {item.match} {matchedPairs.includes(item.word) && <CheckCircle className="inline w-4 h-4 ml-1" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════ MICRO READING ═══════
function MicroReading({ activity, onComplete, onSkip }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [showPassage, setShowPassage] = useState(true);
  const [locateSpan, setLocateSpan] = useState(null); // text of the locate-in-text hint
  const rawQuestions = activity?.comprehension_questions || activity?.questions || [];
  // Strip author meta-comments like "(Full 'there is/are' in Unit 3.)" before
  // rendering — those notes are for the curriculum writer, not the student.
  const questions = rawQuestions.map(q => q ? ({
    ...q,
    question: stripMeta(q.question),
    question_text: stripMeta(q.question_text),
    options: Array.isArray(q.options) ? q.options.map(stripMeta) : q.options,
  }) : q);
  const passageText = stripMeta(activity?.passage_text || activity?.passage || activity?.text || '');
  const sceneImage = activity?.scene_image_url || activity?.scene_image || activity?.image_url;
  const q = questions[currentQ];

  // Locate-in-text: when learner gets a question wrong, highlight the
  // sentence in the passage that contains the answer so they can re-read.
  // Source order: q.locate_text (explicit author hint) → q.evidence →
  // sentence containing the correct answer string.
  const findLocateSentence = (question) => {
    if (!question || !passageText) return null;
    const explicit = question.locate_text || question.evidence || question.passage_quote;
    if (explicit && typeof explicit === 'string') return explicit;
    const ans = String(question.correct_answer || question.answer || '').trim();
    if (!ans) return null;
    const sentences = passageText.match(/[^.!?]+[.!?]+/g) || [passageText];
    const hit = sentences.find(s => s.toLowerCase().includes(ans.toLowerCase()));
    return hit ? hit.trim() : null;
  };

  const highlightText = (text) => {
    let result = text;
    // Locate-in-text wins (yellow) — wraps the full sentence carrying the
    // answer when the learner got it wrong.
    if (locateSpan) {
      const escaped = locateSpan.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(${escaped})`, 'i');
      result = result.replace(re, '<mark class="bg-amber-200 px-1 rounded shadow-sm">$1</mark>');
    }
    // Vocab pre-highlights (lighter yellow, only when no locate-in-text active)
    const words = activity?.highlighted_words;
    if (!locateSpan && words?.length) {
      words.forEach(word => {
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        result = result.replace(regex, `<mark class="bg-yellow-100 px-0.5 rounded">$1</mark>`);
      });
    }
    return result;
  };

  const checkAnswer = (answer, correctAnswer) => {
    // Handle both 'correct_answer' and 'answer' field names from different content formats
    const correctAns = correctAnswer || q?.answer;
    if (!correctAns) return false;
    const ans = String(answer).toLowerCase().trim();
    if (Array.isArray(correctAns)) return correctAns.some(a => String(a).toLowerCase().trim() === ans);
    return ans === String(correctAns).toLowerCase().trim();
  };

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    // Support both 'correct_answer' and 'answer' field names
    const correctAns = q.correct_answer || q.answer;
    if (checkAnswer(answer, correctAns)) setCorrect(c => c + 1);
  };

  const handleNext = () => {
    setSelectedAnswer(null); setShowFeedback(false); setLocateSpan(null);
    if (currentQ < questions.length - 1) { setCurrentQ(i => i + 1); }
    else onComplete(Math.round((correct / questions.length) * 100));
  };

  const handleLocateInText = () => {
    const sentence = findLocateSentence(q);
    if (sentence) {
      setLocateSpan(sentence);
      setShowPassage(true);
    }
  };

  const isCorrectOption = (option) => {
    const correctAns = q.correct_answer || q.answer;
    const opt = String(option).toLowerCase().trim();
    if (Array.isArray(correctAns)) return correctAns.some(a => String(a).toLowerCase().trim() === opt);
    return opt === String(correctAns || '').toLowerCase().trim();
  };

  return (
    <div data-testid="micro-reading">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-emerald-100 text-emerald-700 border-0"><FileText className="w-3 h-3 mr-1" /> Reading</Badge>
        <div className="flex items-center gap-3">
          {questions.length > 0 && <span className="text-sm text-gray-500">Question {currentQ + 1}/{questions.length}</span>}
          <SkipButton onSkip={onSkip} />
        </div>
      </div>

      {/* Passage */}
      {showPassage && (
        <Card className="p-6 mb-6 bg-amber-50/50 border-amber-200">
          <h4 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">Read the passage</h4>
          {sceneImage && (
            <img
              src={sceneImage}
              alt="Scene"
              className="block w-full max-h-64 object-cover rounded-xl mb-4 border border-amber-100"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <p className="text-xl text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightText(passageText) }} />
          {questions.length > 0 && (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowPassage(false)} data-testid="reading-answer-questions-btn">
              Answer Questions <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
          {questions.length === 0 && <Button className="mt-4" onClick={() => onComplete(100)}>Continue</Button>}
        </Card>
      )}

      {/* Questions */}
      {!showPassage && q && (
        <Card className="p-6">
          <button className="text-sm text-blue-600 mb-4 flex items-center gap-1" onClick={() => setShowPassage(true)}>
            <ArrowLeft className="w-3 h-3" /> Show passage
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-5"><FormattedQuestion text={q.question || q.question_text} /></h3>
          <div className="space-y-3">
            {(q.options || []).map(option => {
              const isSelected = selectedAnswer === option;
              const optionIsCorrect = isCorrectOption(option);
              let cls = 'border-gray-200 hover:border-blue-300';
              if (showFeedback) {
                if (optionIsCorrect) cls = 'border-green-500 bg-green-50';
                else if (isSelected) cls = 'border-red-500 bg-red-50';
                else cls = 'border-gray-200 opacity-50';
              }
              return (
                <button key={option} className={`w-full p-5 rounded-xl text-left border-2 transition-all text-lg font-medium ${cls}`}
                  onClick={() => handleAnswer(option)} disabled={showFeedback}>
                  <FormattedQuestion text={option} />
                </button>
              );
            })}
          </div>
          {showFeedback && (
            <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
              {!isCorrectOption(selectedAnswer) && findLocateSentence(q) && (
                <Button variant="outline" size="sm" onClick={handleLocateInText} data-testid="reading-locate-btn">
                  <Map className="w-3.5 h-3.5 mr-1" /> Find it in the passage
                </Button>
              )}
              <Button className="ml-auto" onClick={handleNext}>{currentQ < questions.length - 1 ? 'Next' : 'Continue'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ═══════ GRAMMAR FOCUS ═══════
function GrammarFocus({ activity, onComplete, onSkip }) {
  const [ruleIdx, setRuleIdx] = useState(0);
  
  // Support both 'rules' array (old format) and single rule (enriched format)
  const rules = activity?.rules || (activity?.rule ? [{
    pattern: activity.rule,
    rule_text: activity.rule,
    explanation: activity.explanation || '',
    examples: activity.examples || []
  }] : []);
  
  const rule = rules[ruleIdx];

  // Normalize examples: handle both [{correct, incorrect}] and plain string arrays
  const normalizeExamples = (examples) => {
    if (!examples?.length) return [];
    if (typeof examples[0] === 'string') {
      return examples.map(ex => ({ correct: ex, incorrect: null }));
    }
    return examples;
  };

  return (
    <div data-testid="grammar-focus">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-violet-100 text-violet-700 border-0"><Edit3 className="w-3 h-3 mr-1" /> Grammar</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Rule {ruleIdx + 1}/{rules.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={((ruleIdx + 1) / rules.length) * 100} className="mb-6" />

      {rule && (
        <Card className="p-8">
          {/* Pattern highlight */}
          <div className="text-center mb-6">
            <div className="inline-block bg-violet-100 text-violet-800 font-mono text-2xl px-6 py-3 rounded-xl font-bold">
              {rule.pattern || activity?.pattern_highlight || ''}
            </div>
          </div>

          {/* Rule */}
          <div className="bg-blue-50 rounded-xl p-5 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{rule.rule_text || rule.title}</h3>
            <p className="text-base text-gray-600 mb-2">{rule.explanation}</p>
            <code className="text-base text-blue-700 bg-blue-100 px-2 py-1 rounded">{rule.pattern}</code>
          </div>

          {/* Examples */}
          <div className="space-y-3 mb-6">
            {normalizeExamples(rule.examples).map((ex, i) => (
              <div key={i} className={ex.incorrect ? 'grid grid-cols-2 gap-3' : ''}>
                <div className="flex items-center gap-2 bg-green-50 p-4 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-lg font-medium text-green-800">{ex.correct}</span>
                </div>
                {ex.incorrect && (
                  <div className="flex items-center gap-2 bg-red-50 p-4 rounded-xl">
                    <X className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="text-lg font-medium text-red-800 line-through">{ex.incorrect}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            {ruleIdx > 0 && <Button variant="outline" onClick={() => setRuleIdx(i => i - 1)}>Previous</Button>}
            {ruleIdx < rules.length - 1 ? (
              <Button onClick={() => setRuleIdx(i => i + 1)} data-testid="grammar-next-btn">Next Rule <ChevronRight className="w-4 h-4 ml-1" /></Button>
            ) : (
              <Button onClick={() => onComplete(100)} data-testid="grammar-complete-btn">Got it! <ThumbsUp className="w-4 h-4 ml-1" /></Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════ GRAMMAR GAME (Multi-type) ═══════
function GrammarGame({ activity, onComplete, onSkip }) {
  // Mode-based routing: when activity.mode is set (Stage 3+ schema), delegate to dedicated renderer.
  const mode = activity?.mode;
  const items = activity?.items || [];
  if (mode === 'transform_sentence' && items.length) {
    return <TransformSentence items={items} onComplete={onComplete} onSkip={onSkip} />;
  }
  if (mode === 'audio_match' && items.length) {
    return <AudioMatch items={items} onComplete={onComplete} onSkip={onSkip} />;
  }
  if (mode === 'sentence_builder_timed' && items.length) {
    return <SentenceBuilderTimed items={items} onComplete={onComplete} onSkip={onSkip} timeLimit={activity?.time_limit_seconds} />;
  }
  if (mode === 'word_order' && items.length && items[0]?.words) {
    // Adapt items: existing WordOrder renderer accepts {words, correct_sentence}
    return <WordOrder items={items} onComplete={onComplete} onSkip={onSkip} />;
  }

  const allItems = React.useMemo(() => {
    const errorHunterItems = (activity?.items || []).map(item => ({ ...item, gameType: 'error_hunter' }));
    const wordOrderItems = (activity?.word_order_items || []).map(item => ({ ...item, gameType: 'word_order' }));
    const fillBlankItems = (activity?.fill_blank_items || []).map(item => ({ ...item, gameType: 'fill_blank' }));
    const combined = [...errorHunterItems, ...wordOrderItems, ...fillBlankItems];
    return combined.length > 0 ? combined.sort(() => Math.random() - 0.5) : errorHunterItems;
  }, [activity]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  // Word order state
  const [selectedWords, setSelectedWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  // Fill blank state
  const [selectedOption, setSelectedOption] = useState(null);
  // Error hunter state
  const [userChoice, setUserChoice] = useState(null);

  const item = allItems[idx];

  useEffect(() => {
    if (item?.gameType === 'word_order') {
      setShuffledWords([...(item.words || item.correct_sentence?.split(' ') || [])].sort(() => Math.random() - 0.5));
    }
  }, [idx, item]);

  const resetForNext = () => {
    setShowFeedback(false);
    setIsCorrect(false);
    setSelectedWords([]);
    setSelectedOption(null);
    setUserChoice(null);
  };

  const handleNext = () => {
    resetForNext();
    if (idx < allItems.length - 1) setIdx(i => i + 1);
    else {
      const pct = Math.round((score / allItems.length) * 100);
      const crowns = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
      onComplete(pct, crowns);
    }
  };

  // Error Hunter
  const handleErrorHunter = (hasError) => {
    if (showFeedback) return;
    setUserChoice(hasError);
    const correct = hasError === item.has_error;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setShowFeedback(true);
  };

  // Word Order
  const handleWordSelect = (word, fromIdx) => {
    if (showFeedback) return;
    setSelectedWords(prev => [...prev, word]);
    setShuffledWords(prev => prev.filter((_, i) => i !== fromIdx));
  };

  const handleWordRemove = (word, fromIdx) => {
    if (showFeedback) return;
    setShuffledWords(prev => [...prev, word]);
    setSelectedWords(prev => prev.filter((_, i) => i !== fromIdx));
  };

  const checkWordOrder = () => {
    const normalize = (s) => s.replace(/\s+([.!?,;:'""])/g, '$1').replace(/(['""])\s+/g, '$1').replace(/\s+/g, ' ').replace(/[.!?,;:]+$/g, '').trim().toLowerCase();
    const userSentence = normalize(selectedWords.join(' '));
    const correctSentence = normalize(item.correct_sentence || '');
    const correct = userSentence === correctSentence;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setShowFeedback(true);
  };

  // Fill Blank
  const handleFillBlank = (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
    const optLower = String(option).toLowerCase().trim();
    const correct = Array.isArray(item.correct_answer)
      ? item.correct_answer.some(a => String(a).toLowerCase().trim() === optLower)
      : optLower === String(item.correct_answer || '').toLowerCase().trim();
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setShowFeedback(true);
  };

  if (!item) return null;

  return (
    <div data-testid="grammar-game">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-pink-100 text-pink-700 border-0"><Gamepad2 className="w-3 h-3 mr-1" /> Grammar Game</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{idx + 1} / {allItems.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={(idx / allItems.length) * 100} className="mb-6" />

      {/* ── Error Hunter ── */}
      {item.gameType === 'error_hunter' && (
        <Card className="p-8 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <AlertCircle className="w-3 h-3" /> Find the Error
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <p className="text-xl font-bold text-gray-900">{item.sentence}</p>
          </div>
          {!showFeedback ? (
            <div className="flex justify-center gap-4">
              <Button className="bg-green-600 hover:bg-green-700 px-8" onClick={() => handleErrorHunter(false)} data-testid="error-correct-btn">
                <ThumbsUp className="w-5 h-5 mr-2" /> Correct
              </Button>
              <Button variant="destructive" className="px-8" onClick={() => handleErrorHunter(true)} data-testid="error-wrong-btn">
                <ThumbsDown className="w-5 h-5 mr-2" /> Has Error
              </Button>
            </div>
          ) : (
            <div>
              <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-semibold mb-1">{isCorrect ? 'You got it right!' : 'Not quite!'}</p>
                {item.has_error ? <p className="text-sm">Correct: <strong>{item.correct_sentence}</strong></p> : <p className="text-sm">This sentence is correct!</p>}
              </div>
              <Button onClick={handleNext} data-testid="game-next-btn">{idx < allItems.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      )}

      {/* ── Word Order ── */}
      {item.gameType === 'word_order' && (
        <Card className="p-8 max-w-xl mx-auto">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Repeat className="w-3 h-3" /> Build the Sentence
            </div>
            {item.hint && <p className="text-sm text-gray-500">{item.hint}</p>}
          </div>

          {/* Answer area */}
          <div className="min-h-[56px] bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-3 mb-4 flex flex-wrap gap-2" data-testid="word-order-answer">
            {selectedWords.map((word, i) => (
              <button key={`sel-${i}`} onClick={() => handleWordRemove(word, i)} disabled={showFeedback}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${showFeedback ? (isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800') : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                data-testid={`selected-word-${i}`}>
                {word}
              </button>
            ))}
            {selectedWords.length === 0 && <span className="text-sm text-blue-300">Tap words below to build the sentence</span>}
          </div>

          {/* Word bank */}
          <div className="flex flex-wrap gap-2 justify-center mb-5" data-testid="word-bank">
            {shuffledWords.map((word, i) => (
              <button key={`bank-${i}`} onClick={() => handleWordSelect(word, i)} disabled={showFeedback}
                className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-all"
                data-testid={`bank-word-${i}`}>
                {word}
              </button>
            ))}
          </div>

          {!showFeedback ? (
            <div className="flex justify-center">
              <Button onClick={checkWordOrder} disabled={shuffledWords.length > 0} data-testid="word-order-check-btn">
                Check Answer
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className={`p-3 rounded-xl mb-4 text-sm ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-semibold">{isCorrect ? 'Perfect!' : 'Not quite!'}</p>
                {!isCorrect && <p>Correct: <strong>{item.correct_sentence}</strong></p>}
              </div>
              <Button onClick={handleNext} data-testid="game-next-btn">{idx < allItems.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      )}

      {/* ── Fill in the Blank ── */}
      {item.gameType === 'fill_blank' && (
        <Card className="p-8 max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            <Edit3 className="w-3 h-3" /> Fill in the Blank
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <p className="text-xl font-bold text-gray-900">{item.sentence}</p>
            {item.hint && !showFeedback && (
              <p className="text-sm text-amber-600 mt-2 italic">Hint: {item.hint}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {(item.options || []).map(option => {
              const isSelected = selectedOption === option;
              const optLower = String(option).toLowerCase().trim();
              const isCorrectOption = Array.isArray(item.correct_answer)
                ? item.correct_answer.some(a => String(a).toLowerCase().trim() === optLower)
                : optLower === String(item.correct_answer || '').toLowerCase().trim();
              let cls = 'border-gray-200 hover:border-amber-400 hover:bg-amber-50';
              if (showFeedback) {
                if (isCorrectOption) cls = 'border-green-500 bg-green-50 text-green-800';
                else if (isSelected) cls = 'border-red-500 bg-red-50 text-red-800';
                else cls = 'border-gray-200 opacity-40';
              }
              return (
                <button key={option} onClick={() => handleFillBlank(option)} disabled={showFeedback}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${cls}`}
                  data-testid={`fill-option-${option}`}>
                  {option}
                  {showFeedback && isCorrectOption && <CheckCircle className="inline w-4 h-4 ml-1 text-green-600" />}
                </button>
              );
            })}
          </div>
          {showFeedback && (
            <div className="mt-5">
              <p className={`text-sm font-semibold mb-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{isCorrect ? 'Correct!' : 'Incorrect!'}</p>
              <Button onClick={handleNext} data-testid="game-next-btn">{idx < allItems.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ═══════ LISTENING ACTIVITY ═══════
function ListeningActivity({ activity, onComplete, onSkip }) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState('listen'); // listen -> questions
  const [hasPlayed, setHasPlayed] = useState(false);
  const rawQuestions = activity?.questions || [];
  const questions = rawQuestions.map(q => q ? ({
    ...q,
    question: stripMeta(q.question),
    question_text: stripMeta(q.question_text),
    options: Array.isArray(q.options) ? q.options.map(stripMeta) : q.options,
  }) : q);
  const transcript = stripMeta(activity?.transcript || activity?.audio_script || activity?.audio_text || '');
  const q = questions[currentQ];
  const audioRef = useRef(null);

  // Cleanup audio on unmount or activity change
  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.85;
    speechSynthesis.speak(u);
  };

  const playListeningAudio = () => {
    // Stop any existing audio first
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    speechSynthesis.cancel();

    const audioUrl = activity?.audio_url;
    if (audioUrl) {
      const fullUrl = audioUrl.startsWith('/') ? `${process.env.REACT_APP_BACKEND_URL}/api${audioUrl}` : audioUrl;
      const audio = new Audio(fullUrl);
      audio.playbackRate = 0.9;
      audioRef.current = audio;
      audio.play().catch(() => speakText(transcript));
    } else {
      speakText(transcript);
    }
    setHasPlayed(true);
  };

  const checkAnswer = (answer, correctAnswer) => {
    const correctAns = correctAnswer || q?.answer;
    if (!correctAns) return false;
    const ans = String(answer).toLowerCase().trim();
    if (Array.isArray(correctAns)) return correctAns.some(a => String(a).toLowerCase().trim() === ans);
    return ans === String(correctAns).toLowerCase().trim();
  };

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    const correctAns = q.correct_answer || q.answer;
    if (checkAnswer(answer, correctAns)) setCorrect(c => c + 1);
  };

  const handleNext = () => {
    setSelectedAnswer(null); setShowFeedback(false);
    if (currentQ < questions.length - 1) setCurrentQ(i => i + 1);
    else onComplete(Math.round((correct / questions.length) * 100));
  };

  const isCorrectOption = (option) => {
    const correctAns = q.correct_answer || q.answer;
    const opt = String(option).toLowerCase().trim();
    if (Array.isArray(correctAns)) return correctAns.some(a => String(a).toLowerCase().trim() === opt);
    return opt === String(correctAns || '').toLowerCase().trim();
  };

  // Compact audio bar — always visible so kids can replay while answering.
  const AudioBar = () => (
    <div className="flex items-center gap-3 bg-cyan-50 border border-cyan-200 rounded-xl p-3">
      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 shrink-0" onClick={playListeningAudio} data-testid="listening-play-btn">
        <Play className="w-4 h-4 mr-1" /> Play
      </Button>
      <div className="flex-1 text-xs text-cyan-800">
        {hasPlayed ? 'Played — you can replay as many times as you like.' : 'Click Play to start.'}
      </div>
      <button className="text-xs text-cyan-700 underline shrink-0" onClick={() => setShowTranscript(!showTranscript)}>
        {showTranscript ? 'Hide' : 'Show'} script
      </button>
    </div>
  );

  return (
    <div data-testid="listening-activity">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-cyan-100 text-cyan-700 border-0"><Headphones className="w-3 h-3 mr-1" /> Listening</Badge>
        <SkipButton onSkip={onSkip} />
      </div>

      <Card className="p-6 max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Listen carefully</h3>
            <p className="text-xs text-gray-500">Replay as many times as you need.</p>
          </div>
        </div>

        <AudioBar />
        {showTranscript && transcript && (
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">{transcript}</div>
        )}

        {questions.length === 0 && (
          <div className="text-center pt-2">
            <Button onClick={() => onComplete(100)}>Continue</Button>
          </div>
        )}

        {q && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-cyan-700">Question {currentQ + 1} of {questions.length}</span>
            </div>
          <Progress value={((currentQ + 1) / questions.length) * 100} className="mb-5" />
          <h3 className="text-2xl font-bold text-gray-900 mb-5"><FormattedQuestion text={q.question || q.question_text} /></h3>
          <div className="space-y-3">
            {((q.options && q.options.length > 0) ? q.options : (() => {
              const ans = (q.answer || q.correct_answer || '').toLowerCase();
              if (ans === 'yes' || ans === 'no') return ['Yes', 'No'];
              if (['one','two','three','four','five','six','seven','eight','nine','ten','1','2','3','4','5'].includes(ans))
                return ['one', 'two', 'three', 'four', 'five'].filter(x => x !== ans).slice(0, 3).concat([ans]).sort(() => Math.random() - 0.5);
              return [ans, 'yes', 'no'].filter((v, i, a) => a.indexOf(v) === i);
            })()).map(option => {
              const isSelected = selectedAnswer === option;
              const optionIsCorrect = isCorrectOption(option);
              let cls = 'border-gray-200 hover:border-cyan-300';
              if (showFeedback) {
                if (optionIsCorrect) cls = 'border-green-500 bg-green-50';
                else if (isSelected) cls = 'border-red-500 bg-red-50';
                else cls = 'border-gray-200 opacity-50';
              }
              return (
                <button key={option} className={`w-full p-5 rounded-xl text-left border-2 transition-all text-lg font-medium capitalize ${cls}`}
                  onClick={() => handleAnswer(option)} disabled={showFeedback}
                  data-testid={`listening-option-${option}`}>
                  {option}
                </button>
              );
            })}
          </div>
          {showFeedback && <div className="mt-5 flex justify-end"><Button onClick={handleNext}>{currentQ < questions.length - 1 ? 'Next' : 'Continue'}</Button></div>}
          </div>
        )}
      </Card>
    </div>
  );
}

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

      setTranscription(data.transcription || browserTranscript);
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

  const evaluateLocally = (text) => {
    setTranscription(text);
    // Strip punctuation before comparing words
    const clean = (s) => s.toLowerCase().trim().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
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

            {/* Expected */}
            {expectedText && (
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Expected</h4>
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

// ═══════ EXIT TICKET ═══════
function ExitTicket({ activity, onComplete, onSkip }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fillBlankValue, setFillBlankValue] = useState('');
  // Normalize Sonnet/legacy data shape so the renderer can rely on stable
  // fields: question_text, question_type, options. Question writer sometimes
  // emits `question` instead of `question_text` and omits `question_type`.
  // Also strips author meta-comments leaking from the prompt template.
  const questions = (activity?.questions || []).map((raw, qi) => {
    if (!raw || typeof raw !== 'object') return raw;
    const out = { ...raw };
    if (!out.question_text && out.question) out.question_text = out.question;
    out.question_text = stripMeta(out.question_text);
    out.question = stripMeta(out.question);
    if (Array.isArray(out.options)) out.options = out.options.map(stripMeta);
    if (!out.question_id) out.question_id = `exit_q${qi + 1}`;
    if (!out.question_type) {
      const opts = Array.isArray(out.options) ? out.options.map(o => String(o).toLowerCase()) : [];
      const isTF = opts.length === 2 && opts.includes('true') && opts.includes('false');
      out.question_type = isTF ? 'true_false' : (opts.length > 0 ? 'multiple_choice' : 'fill_blank');
    }
    return out;
  });
  const q = questions[idx];

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    const newAnswers = { ...answers, [q.question_id]: answer };
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setFillBlankValue('');
    if (idx < questions.length - 1) setIdx(i => i + 1);
    else setShowResults(true);
  };

  const calcScore = () => {
    let c = 0;
    questions.forEach(q => {
      const userAns = String(answers[q.question_id] || '').toLowerCase().trim();
      if (!userAns) return;
      let correct = false;
      if (Array.isArray(q.correct_answer)) {
        correct = q.correct_answer.some(a => String(a).toLowerCase().trim() === userAns);
      } else {
        correct = userAns === String(q.correct_answer || '').toLowerCase().trim();
      }
      if (!correct && q.acceptable_answers && Array.isArray(q.acceptable_answers)) {
        correct = q.acceptable_answers.some(a => String(a).toLowerCase().trim() === userAns);
      }
      if (correct) c++;
    });
    return Math.round((c / questions.length) * 100);
  };

  const handleRetry = () => {
    setIdx(0);
    setAnswers({});
    setShowResults(false);
    setShowFeedback(false);
    setFillBlankValue('');
  };

  if (showResults) {
    const score = calcScore();
    const passed = score >= (activity?.pass_threshold || 70);
    return (
      <Card className="p-8 text-center max-w-lg mx-auto" data-testid="exit-ticket-results">
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
          {passed ? <CheckCircle className="w-10 h-10 text-green-600" /> : <AlertCircle className="w-10 h-10 text-red-600" />}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{passed ? 'Great Job!' : 'Keep Practicing'}</h3>
        <p className="text-4xl font-bold mb-4" style={{ color: passed ? '#16a34a' : '#dc2626' }}>{score}%</p>

        {/* Show answer review */}
        <div className="text-left mb-6 space-y-2">
          {questions.map((q, i) => {
            const userAnswer = answers[q.question_id] || '';
            const isCorrect = Array.isArray(q.correct_answer)
              ? q.correct_answer.some(a => String(a).toLowerCase().trim() === String(userAnswer).toLowerCase().trim())
              : String(userAnswer).toLowerCase().trim() === String(q.correct_answer || '').toLowerCase().trim();
            const displayCorrect = Array.isArray(q.correct_answer) ? q.correct_answer.join(' / ') : q.correct_answer;
            return (
              <div key={q.question_id} className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="font-medium text-gray-800">{i + 1}. {q.question_text}</p>
                <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                  Your answer: {userAnswer} {isCorrect ? <CheckCircle className="inline w-4 h-4" /> : <span> (Correct: {displayCorrect})</span>}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          {passed ? 'You passed! Moving to the next step.' : `You need ${activity?.pass_threshold || 70}% to pass. Try again!`}
        </p>
        {passed ? (
          <Button onClick={() => onComplete(score)} data-testid="exit-ticket-continue-btn">Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
        ) : (
          <Button onClick={handleRetry} data-testid="exit-ticket-retry-btn">Try Again <RefreshCw className="w-4 h-4 ml-1" /></Button>
        )}
      </Card>
    );
  }

  if (!q) return null;

  const currentAnswer = answers[q.question_id];
  const checkCorrect = (ans, correctAns) => {
    if (!ans) return false;
    const ansLower = String(ans).toLowerCase().trim();
    // Check main correct answer(s)
    if (Array.isArray(correctAns)) {
      if (correctAns.some(a => String(a).toLowerCase().trim() === ansLower)) return true;
    } else {
      if (ansLower === String(correctAns || '').toLowerCase().trim()) return true;
    }
    // Check acceptable_answers for fill-blank
    if (q.acceptable_answers && Array.isArray(q.acceptable_answers)) {
      if (q.acceptable_answers.some(a => String(a).toLowerCase().trim() === ansLower)) return true;
    }
    return false;
  };
  const isCurrentCorrect = checkCorrect(currentAnswer, q.correct_answer);

  return (
    <div className="max-w-2xl mx-auto" data-testid="exit-ticket">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-amber-100 text-amber-700 border-0"><CheckCircle className="w-3 h-3 mr-1" /> Exit Quiz</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{idx + 1} / {questions.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={(idx / questions.length) * 100} className="mb-6" />
      <Card className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-5"><FormattedQuestion text={q.question_text || q.question} /></h3>
        {q.question_type === 'multiple_choice' && (
          <div className="space-y-3">
            {q.options?.map(option => {
              const isSelected = currentAnswer === option;
              const isCorrectOption = Array.isArray(q.correct_answer) ? q.correct_answer.includes(option) : option === q.correct_answer;
              let cls = 'border-gray-200 hover:border-blue-300';
              if (showFeedback) {
                if (isCorrectOption) cls = 'border-green-500 bg-green-50 text-green-800';
                else if (isSelected && !isCorrectOption) cls = 'border-red-500 bg-red-50 text-red-800';
                else cls = 'border-gray-200 opacity-50';
              } else if (isSelected) cls = 'border-blue-500 bg-blue-50';
              return (
                <button key={option} className={`w-full p-5 rounded-xl text-left border-2 transition-all text-lg font-medium ${cls}`}
                  onClick={() => handleAnswer(option)} disabled={showFeedback}
                  data-testid={`exit-option-${option.substring(0,15).replace(/\s/g,'-')}`}>
                  {option}
                  {showFeedback && isCorrectOption && <CheckCircle className="inline w-4 h-4 ml-2 text-green-600" />}
                  {showFeedback && isSelected && !isCorrectOption && <X className="inline w-4 h-4 ml-2 text-red-600" />}
                </button>
              );
            })}
          </div>
        )}
        {q.question_type === 'fill_blank' && (
          <div className="space-y-3">
            {q.hint && !showFeedback && (
              <p className="text-sm text-amber-600 italic">Hint: {q.hint}</p>
            )}
            <input type="text" value={fillBlankValue}
              onChange={e => setFillBlankValue(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-sm ${showFeedback ? (isCurrentCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'focus:border-blue-500 border-gray-200'}`}
              placeholder="Type your answer..."
              onKeyDown={e => { if (e.key === 'Enter' && fillBlankValue.trim() && !showFeedback) handleAnswer(fillBlankValue.trim()); }}
              disabled={showFeedback} autoFocus data-testid="exit-fill-blank-input" />
            {!showFeedback && <p className="text-xs text-gray-400">Press Enter to submit</p>}
            {!showFeedback && fillBlankValue.trim() && (
              <Button onClick={() => handleAnswer(fillBlankValue.trim())} size="sm" data-testid="exit-fill-blank-submit">Submit</Button>
            )}
            {showFeedback && !isCurrentCorrect && (
              <p className="text-sm text-red-600">Correct answer: <strong>{Array.isArray(q.correct_answer) ? q.correct_answer.join(' / ') : q.correct_answer}</strong></p>
            )}
          </div>
        )}
        {q.question_type === 'true_false' && (
          <div className="flex justify-center gap-4">
            <Button className="px-8" variant={currentAnswer === 'true' ? 'default' : 'outline'} onClick={() => handleAnswer('true')} disabled={showFeedback}>True</Button>
            <Button className="px-8" variant={currentAnswer === 'false' ? 'default' : 'outline'} onClick={() => handleAnswer('false')} disabled={showFeedback}>False</Button>
          </div>
        )}
        {showFeedback && (
          <div className="mt-5 flex items-center justify-between">
            <span className={`text-sm font-semibold ${isCurrentCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCurrentCorrect ? 'Correct!' : 'Incorrect'}
            </span>
            <Button onClick={handleNext} data-testid="exit-next-btn">
              {idx < questions.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════ MAIN LESSON PAGE ═══════
export default function UnifiedLessonPage({ user }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [currentActivityType, setCurrentActivityType] = useState(null);
  const [currentActivityData, setCurrentActivityData] = useState(null);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [activityScores, setActivityScores] = useState({});
  const [lessonSummaryData, setLessonSummaryData] = useState({ words: [], grammarRules: [] });
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Stop all audio when activity changes or component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [currentActivityType]);

  useEffect(() => { loadLesson(); }, [lessonId]);

  // Restore progress from localStorage on mount
  useEffect(() => {
    const saved = loadLessonProgress(lessonId);
    if (saved?.completedActivities?.length > 0) {
      setCompletedActivities(saved.completedActivities);
      setActivityScores(saved.activityScores || {});
      if (saved.currentActivityType) setCurrentActivityType(saved.currentActivityType);
      setShowRoadmap(saved.showRoadmap ?? true);
    }
  }, [lessonId]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (completedActivities.length > 0 || Object.keys(activityScores).length > 0) {
      saveLessonProgress(lessonId, { completedActivities, activityScores, currentActivityType, showRoadmap });
    }
  }, [completedActivities, activityScores, currentActivityType, showRoadmap, lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      // Check lock status first
      if (user?.id) {
        const lockRes = await fetchRetry(`${API_URL}/api/unified/lessons/${lessonId}/lock-status?user_id=${user.id}&email=${encodeURIComponent(user.email || '')}`);
        const lockData = await lockRes.json();
        if (!lockData.unlocked) {
          setIsLocked(true);
          setLoading(false);
          return;
        }
      }
      const res = await fetchRetry(`${API_URL}/api/unified/lessons/${lessonId}`);
      const data = await res.json();
      setLesson(data);
      // Only set first activity if no saved progress
      const saved = loadLessonProgress(lessonId);
      if (saved?.currentActivityType) {
        await loadActivityData(saved.currentActivityType);
      } else {
        const first = data.activity_flow?.[0];
        if (first) { setCurrentActivityType(first.type); await loadActivityData(first.type); }
      }
      // Pre-fetch vocab and grammar for summary card
      try {
        if (data.summary_data?.words?.length) {
          setLessonSummaryData({
            words: data.summary_data.words,
            grammarRules: data.summary_data.grammar_rules || []
          });
        } else {
          const [vocabRes, grammarRes] = await Promise.all([
            fetchRetry(`${API_URL}/api/unified/lessons/${lessonId}/activity/vocabulary`),
            fetchRetry(`${API_URL}/api/unified/lessons/${lessonId}/activity/grammar_focus`)
          ]);
          const vocabData = vocabRes.ok ? await vocabRes.json() : null;
          const grammarData = grammarRes.ok ? await grammarRes.json() : null;
          setLessonSummaryData({
            words: vocabData?.words || [],
            grammarRules: grammarData?.rules || []
          });
        }
      } catch { /* summary data is optional */ }
    } catch (error) { console.error('Error loading lesson:', error); } finally { setLoading(false); }
  };

  const loadActivityData = async (activityType) => {
    try {
      setActivityLoading(true);
      const res = await fetchRetry(`${API_URL}/api/unified/lessons/${lessonId}/activity/${activityType}`);
      const data = res.ok ? await res.json() : null;
      setCurrentActivityData(data);
      // Cache data for lesson summary
      if (data && activityType === 'vocabulary' && data.words?.length) {
        setLessonSummaryData(prev => ({ ...prev, words: data.words }));
      }
      if (data && activityType === 'grammar_focus' && data.rules?.length) {
        setLessonSummaryData(prev => ({ ...prev, grammarRules: data.rules }));
      }
    } catch { setCurrentActivityData(null); } finally { setActivityLoading(false); }
  };

  const handleActivityComplete = useCallback(async (score, crownsOrPassed) => {
    if (!completedActivities.includes(currentActivityType)) {
      setCompletedActivities(prev => [...prev, currentActivityType]);
    }
    if (typeof score === 'number') {
      setActivityScores(prev => ({ ...prev, [currentActivityType]: score }));
    }
    if (user?.id) {
      try {
        await fetchRetry(`${API_URL}/api/unified/progress/activity`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, lesson_id: lessonId, activity_type: currentActivityType, score, crowns: typeof crownsOrPassed === 'number' ? crownsOrPassed : null, time_spent_seconds: 0 })
        });
      } catch (e) { console.error('Error saving progress:', e); }
    }
    moveToNextActivity();
  }, [currentActivityType, completedActivities, user, lessonId]);

  const handleActivitySkip = useCallback(() => {
    if (!completedActivities.includes(currentActivityType)) setCompletedActivities(prev => [...prev, currentActivityType]);
    moveToNextActivity();
  }, [currentActivityType, completedActivities]);

  const moveToNextActivity = useCallback(() => {
    const activities = lesson?.activity_flow || [];
    const currentIndex = activities.findIndex(a => a.type === currentActivityType);
    const nextActivity = activities[currentIndex + 1];
    if (nextActivity) { setCurrentActivityType(nextActivity.type); loadActivityData(nextActivity.type); }
    else handleLessonComplete();
  }, [lesson, currentActivityType]);

  const handleLessonComplete = async () => {
    if (user?.id) {
      try {
        await fetchRetry(`${API_URL}/api/unified/progress/lesson`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, lesson_id: lessonId })
        });
        toast.success('Lesson completed! Points awarded.');
      } catch (e) { console.error('Error completing lesson:', e); }
    }
    // Clear saved progress on lesson complete
    clearLessonProgress(lessonId);
    // Check if this is a Final Gate lesson
    const isFinalGate = lesson?.title?.toLowerCase().includes('final gate') || lessonId?.includes('unit_12_lesson_04');
    if (isFinalGate) {
      setShowCertificate(true);
      return;
    }
    navigate(`/unified/stage/${lesson?.stage_id}`);
  };

  const handleActivityClick = (activity) => { setCurrentActivityType(activity.type); loadActivityData(activity.type); };

  const renderActivity = () => {
    if (activityLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
    const activity = lesson?.activity_flow?.find(a => a.type === currentActivityType);

    switch (currentActivityType) {
      case 'retrieval_warmup':
        return currentActivityData ? <RetrievalWarmup activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'vocabulary':
        return currentActivityData ? <VocabularyModule activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'micro_game_vocab':
      case 'vocab_games':
        return currentActivityData ? <VocabGamesPlayer activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'micro_reading':
        return currentActivityData ? <MicroReading activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'grammar_focus':
        return currentActivityData ? <GrammarFocus activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'micro_game_grammar':
      case 'grammar_games':
        return currentActivityData ? <GrammarGamesPlayer activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'listening':
      case 'listening_task':
        return currentActivityData ? <ListeningActivity activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'production':
        return currentActivityData ? <ProductionActivity activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} lessonContext={lessonSummaryData} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'exit_ticket':
        return currentActivityData ? <ExitTicket activity={currentActivityData} onComplete={(score) => handleActivityComplete(score)} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'auto_review':
        return <LessonSummary
          lesson={lesson}
          activityScores={activityScores}
          summaryData={lessonSummaryData}
          completedActivities={completedActivities}
          onFinish={() => handleActivityComplete(100)}
        />;
      default:
        return <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (isLocked) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid="lesson-locked-screen">
      <div className="text-center max-w-md p-8">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Lesson Locked</h2>
        <p className="text-gray-600 mb-6">Complete the previous lesson first to unlock this one.</p>
        <Button onClick={goBack} className="rounded-full px-6" data-testid="go-back-btn">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    </div>
  );
  if (!lesson) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Lesson not found</p></div>;

  const totalActivities = lesson.activity_flow?.length || 0;
  const progressPercent = Math.round((completedActivities.length / totalActivities) * 100);
  const theme = getTheme(lesson.stage_id);

  const handleRoadmapStart = () => {
    setShowRoadmap(false);
  };

  const handleRoadmapActivity = (activityType) => {
    setShowRoadmap(false);
    setCurrentActivityType(activityType);
    loadActivityData(activityType);
  };

  return (
    <div
      className="min-h-screen lesson-surface"
      style={{
        background: `radial-gradient(at 0% 0%, ${theme.accentLight}90 0, transparent 50%), radial-gradient(at 100% 0%, hsla(190,100%,92%,1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(37,100%,91%,1) 0, transparent 50%), #F8FAFC`
      }}
      data-testid="unified-lesson-page"
    >
      <style>{LESSON_MOTION_CSS}</style>
      {/* Header - iOS 26 Glass Style */}
      <div 
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.50)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate(`/unified/stage/${lesson.stage_id}`)} data-testid="lesson-back-btn"><X className="w-5 h-5" /></Button>
              <div>
                <h1 className="font-bold text-gray-900 text-sm">{lesson.title}</h1>
                <p className="text-xs text-gray-500">Lesson {lesson.number}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3.5 h-3.5" />{lesson.estimated_duration_minutes} min</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: theme.accentLight }}>
                <Star className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                <span className="text-xs font-semibold" style={{ color: theme.accent }}>{lesson.points_reward} pts</span>
              </div>
              {!showRoadmap && <div className="w-28"><Progress value={progressPercent} /></div>}
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap or Activity Content */}
      {showRoadmap ? (
        <LessonRoadmap
          lesson={lesson}
          completedActivities={completedActivities}
          onStartActivity={handleRoadmapActivity}
          onStartLesson={handleRoadmapStart}
          theme={theme}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <LessonPath activities={lesson.activity_flow || []} currentActivity={currentActivityType} completedActivities={completedActivities} onActivityClick={handleActivityClick} theme={theme} />
            </div>
            <div className="lg:col-span-3 lesson-content-area">
              <ActivityErrorBoundary activityType={currentActivityType} onSkip={handleActivitySkip}>
                {renderActivity()}
              </ActivityErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* Stage Certificate Overlay */}
      {showCertificate && (
        <div className="fixed inset-0 z-50">
          <StageCertificate lesson={lesson} activityScores={activityScores} />
        </div>
      )}
    </div>
  );
}

// ═══════ STAGE CERTIFICATE (Final Gate Celebration) ═══════
function StageCertificate({ lesson, activityScores }) {
  const navigate = useNavigate();
  const confettiFired = useRef(false);
  const stageNum = parseInt(lesson?.stage_id?.replace('stage_', '') || '1');
  const nextStageId = `stage_${stageNum + 1}`;

  const scores = Object.values(activityScores).filter(s => typeof s === 'number');
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 85;
  const passed = avgScore >= 80;

  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;
    if (passed) {
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [passed]);

  const stageNames = { 1: 'Foundations', 2: 'Starters', 3: 'Movers', 4: 'Flyers' };
  const stageName = stageNames[stageNum] || `Stage ${stageNum}`;
  const nextStageName = stageNames[stageNum + 1] || `Stage ${stageNum + 1}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fbbf24 60%, #f59e0b 100%)' }} data-testid="stage-certificate">
      <div className="max-w-lg w-full">
        {passed ? (
          <div className="text-center space-y-6" data-testid="certificate-passed">
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto border-4 border-amber-400">
                <Trophy className="w-14 h-14 text-amber-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black text-amber-900">Congratulations!</h1>
              <p className="text-lg text-amber-800 font-medium">You are now a <span className="font-black">{stageName} Graduate</span></p>
            </div>

            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-amber-200 mx-auto max-w-sm" data-testid="certificate-card">
              <div className="border-2 border-amber-300 rounded-xl p-5 space-y-3" style={{ borderStyle: 'dashed' }}>
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <Award className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Certificate of Completion</span>
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Stage {stageNum}: {stageName}</h2>
                <div className="text-4xl font-black text-amber-600">{avgScore}%</div>
                <p className="text-sm text-gray-600">12 Units &middot; 48 Lessons Mastered</p>
                <div className="flex justify-center gap-1 pt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.ceil(avgScore / 20) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-md border border-green-200 mx-auto max-w-sm" data-testid="stage-unlock-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-green-800">Stage {stageNum + 1}: {nextStageName}</p>
                  <p className="text-xs text-green-600">Unlocked! Ready for new adventures.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => navigate(`/unified/stage/${lesson.stage_id}`)} className="border-amber-300 text-amber-800 hover:bg-amber-100" data-testid="certificate-back-btn">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to {stageName}
              </Button>
              <Button onClick={() => navigate(`/unified/stage/${nextStageId}`)} className="bg-green-600 hover:bg-green-700 text-white shadow-lg" data-testid="certificate-next-stage-btn">
                Start {nextStageName} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6" data-testid="certificate-retry">
            <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto border-4 border-orange-300">
              <RefreshCw className="w-12 h-12 text-orange-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-amber-900">Almost There!</h1>
              <p className="text-lg text-amber-800">You scored <span className="font-black text-orange-600">{avgScore}%</span> &mdash; you need 80% to graduate.</p>
            </div>
            <div className="bg-white/90 backdrop-blur rounded-xl p-5 shadow-md border border-orange-200 max-w-sm mx-auto">
              <p className="text-sm text-gray-700">Review the lessons you found difficult and try the Final Gate again. You can do it!</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => navigate(`/unified/stage/${lesson.stage_id}`)} className="border-amber-300 text-amber-800" data-testid="certificate-review-btn">
                <ArrowLeft className="w-4 h-4 mr-2" /> Review Lessons
              </Button>
              <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600 text-white" data-testid="certificate-retry-btn">
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════ LESSON SUMMARY ("What did you learn?") ═══════
function LessonSummary({ lesson, activityScores, summaryData, completedActivities, onFinish }) {
  const words = summaryData?.words || [];
  const grammarRules = summaryData?.grammarRules || [];
  const totalActivities = (lesson?.activity_flow || []).filter(a => a.type !== 'auto_review').length;
  const completedCount = completedActivities.filter(a => a !== 'auto_review').length;

  const scores = Object.values(activityScores).filter(s => typeof s === 'number');
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const getMotivation = () => {
    if (avgScore >= 90) return { text: 'Amazing work!', emoji: 'trophy', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (avgScore >= 70) return { text: 'Good job!', emoji: 'star', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (avgScore >= 50) return { text: 'Nice effort!', emoji: 'thumbsup', color: 'text-green-600', bg: 'bg-green-50' };
    return { text: 'Keep practicing!', emoji: 'muscle', color: 'text-purple-600', bg: 'bg-purple-50' };
  };
  const motivation = getMotivation();

  const scoreLabels = {
    'retrieval_warmup': 'Warm-up', 'micro_game_vocab': 'Vocab Game', 'micro_reading': 'Reading',
    'micro_game_grammar': 'Grammar Game', 'listening': 'Listening', 'production': 'Speaking', 'exit_ticket': 'Exit Quiz'
  };

  const [pdfLoading, setPdfLoading] = useState(false);

  const buildPDFContent = (doc, worksheetData) => {
    const pw = 210;
    let y = 15;
    const pdfWords = worksheetData.words || [];
    const pdfRules = worksheetData.grammar_rules || [];
    const exercises = worksheetData.exercises || {};
    const title = worksheetData.mode === 'cumulative' ? 'Cumulative Review Worksheet' : 'Lesson Worksheet';
    const subtitle = worksheetData.lesson_title || '';

    // Header
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, pw, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pw / 2, 12, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle + (worksheetData.word_count ? ` (${worksheetData.word_count} words)` : ''), pw / 2, 22, { align: 'center' });
    y = 40;
    doc.setTextColor(0, 0, 0);

    const checkPage = (needed) => {
      if (y + needed > 280) { doc.addPage(); y = 20; }
    };

    // === VOCABULARY SECTION ===
    const vocabExercises = exercises.vocabulary_section || {};

    if (pdfWords.length > 0) {
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('Part A: Vocabulary', 15, y); y += 8;

      // Word list
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      pdfWords.forEach((w) => {
        checkPage(8);
        doc.setFont('helvetica', 'bold');
        doc.text(w.word || '', 18, y);
        doc.setFont('helvetica', 'normal');
        const def = w.definition || w.meaning || '';
        if (def) doc.text(` - ${def}`, 18 + doc.getTextWidth(w.word || '') + 2, y);
        y += 6;
      });
      y += 6;
    }

    // Activity 1: Matching
    const matching = vocabExercises.matching || [];
    if (matching.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 1: Match the Word to Its Meaning', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      const shuffledDefs = [...matching].sort(() => Math.random() - 0.5);
      matching.forEach((item, i) => {
        checkPage(8);
        doc.text(`${i + 1}. ${item.word}`, 20, y);
        doc.text(`___  ${String.fromCharCode(97 + i)}) ${shuffledDefs[i]?.definition || ''}`, 80, y);
        y += 7;
      });
      y += 6;
    }

    // Activity 2: Fill in the blank
    const fillBlank = vocabExercises.fill_blank || [];
    if (fillBlank.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 2: Fill in the Blank', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      fillBlank.forEach((item, i) => {
        checkPage(8);
        doc.text(`${i + 1}. ${item.sentence}`, 20, y);
        if (item.hint) { doc.setTextColor(150, 150, 150); doc.text(`  (Hint: ${item.hint})`, 20, y + 5); doc.setTextColor(0, 0, 0); y += 5; }
        y += 7;
      });
      y += 6;
    }

    // Activity 3: True/False
    const trueFalse = vocabExercises.true_false || [];
    if (trueFalse.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 3: True or False?', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      trueFalse.forEach((item, i) => {
        checkPage(8);
        doc.text(`${i + 1}. ${item.statement}   T / F`, 20, y);
        y += 7;
      });
      y += 6;
    }

    // === GRAMMAR SECTION ===
    const grammarExercises = exercises.grammar_section || {};

    if (pdfRules.length > 0) {
      checkPage(30);
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('Part B: Grammar', 15, y); y += 8;
      doc.setFontSize(10);
      pdfRules.forEach((r) => {
        checkPage(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Pattern: ${r.pattern}`, 18, y); y += 5;
        doc.setFont('helvetica', 'normal');
        if (r.explanation) { doc.text(r.explanation, 22, y, { maxWidth: 165 }); y += 6; }
        y += 3;
      });
      y += 4;
    }

    // Activity 4: Reorder words
    const reorder = grammarExercises.reorder || [];
    if (reorder.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 4: Put the Words in Order', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      reorder.forEach((item, i) => {
        checkPage(10);
        doc.text(`${i + 1}. ${item.scrambled}`, 20, y); y += 5;
        doc.text('   ________________________________________________', 20, y); y += 7;
      });
      y += 4;
    }

    // Activity 5: Correct the mistake
    const correctMistake = grammarExercises.correct_mistake || [];
    if (correctMistake.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 5: Find and Fix the Mistake', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      correctMistake.forEach((item, i) => {
        checkPage(10);
        doc.text(`${i + 1}. ${item.sentence}`, 20, y); y += 5;
        doc.text('   Correct: ________________________________________', 20, y); y += 7;
      });
      y += 4;
    }

    // Activity 6: Complete the pattern
    const completePattern = grammarExercises.complete_pattern || [];
    if (completePattern.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 6: Complete the Sentence', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      completePattern.forEach((item, i) => {
        checkPage(10);
        const opts = (item.options || []).join('  /  ');
        doc.text(`${i + 1}. ${item.pattern}`, 20, y);
        if (opts) { doc.setTextColor(100, 100, 100); doc.text(`  [ ${opts} ]`, 20, y + 5); doc.setTextColor(0, 0, 0); y += 5; }
        y += 7;
      });
      y += 4;
    }

    // === MIXED REVIEW ===
    const mixedReview = exercises.mixed_review || [];
    if (mixedReview.length > 0) {
      checkPage(20);
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('Part C: Mixed Review', 15, y); y += 8;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      mixedReview.forEach((item, i) => {
        checkPage(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. ${item.question}`, 20, y); y += 6;
        doc.setFont('helvetica', 'normal');
        (item.options || []).forEach((opt, oi) => {
          doc.text(`   ${String.fromCharCode(65 + oi)}) ${opt}`, 24, y); y += 5;
        });
        y += 3;
      });
    }

    // Footer
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Testmaster - Practice makes perfect!', pw / 2, 290, { align: 'center' });
      doc.text(`Date: ${new Date().toLocaleDateString()}  |  Page ${p}/${pages}`, pw / 2, 294, { align: 'center' });
    }
  };

  const generatePDF = async (mode = 'current') => {
    setPdfLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      // Fetch GPT-4o generated worksheet from backend (cached after first call)
      const res = await fetch(`${API_URL}/api/worksheet/generate/${lesson?.lesson_id}?mode=${mode}&max_words=20`);
      if (!res.ok) throw new Error('Failed to generate worksheet');
      const worksheetData = await res.json();

      buildPDFContent(doc, worksheetData);
      const filename = mode === 'cumulative'
        ? `Testmaster_Review_${lesson?.title?.replace(/\s+/g, '_') || 'Worksheet'}.pdf`
        : `Testmaster_${lesson?.title?.replace(/\s+/g, '_') || 'Worksheet'}_L${lesson?.number || ''}.pdf`;
      doc.save(filename);
      toast.success(mode === 'cumulative' ? 'Cumulative review worksheet downloaded!' : 'Worksheet downloaded!');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF');
    }
    setPdfLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5" data-testid="lesson-summary">
      {/* Header */}
      <Card className={`p-8 text-center ${motivation.bg} border-0`}>
        <div className="lesson-trophy w-20 h-20 bg-white/80 rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
          <Trophy className={`w-10 h-10 ${motivation.color}`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Lesson Complete!</h2>
        <p className={`text-lg font-semibold ${motivation.color} mb-1`}>{motivation.text}</p>
        <p className="text-sm text-gray-500">{completedCount}/{totalActivities} activities completed</p>
        {avgScore > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-gray-700">Average Score: {avgScore}%</span>
          </div>
        )}
      </Card>

      {/* Words Learned */}
      {words.length > 0 && (
        <Card className="p-5" data-testid="summary-words">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Words You Learned
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {words.map((w, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                <span className="text-lg">{w.image_emoji || w.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{w.word}</p>
                  <p className="text-xs text-gray-400 truncate">{w.ipa}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grammar Learned */}
      {grammarRules.length > 0 && (
        <Card className="p-5" data-testid="summary-grammar">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Edit3 className="w-3.5 h-3.5" /> Grammar Patterns
          </h3>
          <div className="space-y-2">
            {grammarRules.map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-violet-50 rounded-lg px-4 py-3">
                <code className="text-sm font-mono font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded">{r.pattern}</code>
                <span className="text-sm text-gray-600">{r.title || r.rule_text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Activity Scores */}
      {scores.length > 0 && (
        <Card className="p-5" data-testid="summary-scores">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Your Scores
          </h3>
          <div className="space-y-2">
            {Object.entries(activityScores).map(([type, score]) => {
              const label = scoreLabels[type] || type;
              const barColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400';
              const Icon = ACTIVITY_ICONS[type] || Play;
              return (
                <div key={type} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600 w-28 shrink-0">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${score}%` }} />
                  </div>
                  <span className={`text-sm font-bold w-12 text-right ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{score}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Extra Fun Links */}
      {lesson?.extra_links?.length > 0 && (
        <Card className="p-5 border-blue-100 bg-blue-50/30" data-testid="extra-fun-links">
          <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Play className="w-3.5 h-3.5" /> Extra Fun
          </h3>
          <div className="space-y-2">
            {lesson.extra_links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all"
                data-testid={`extra-link-${i}`}>
                {link.type === 'youtube' ? <Play className="w-5 h-5 text-red-500 shrink-0" /> : <BookOpen className="w-5 h-5 text-blue-500 shrink-0" />}
                <span className="text-sm font-medium text-gray-700">{link.label}</span>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" aria-label="Opens in a new tab" />
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Finish Button */}
      <div className="text-center pt-2 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" onClick={() => generatePDF('current')} disabled={pdfLoading} className="px-5 text-sm" data-testid="download-worksheet-btn">
            <Download className="w-4 h-4 mr-2" /> {pdfLoading ? 'Generating...' : 'This Lesson'}
          </Button>
          <Button variant="outline" onClick={() => generatePDF('cumulative')} disabled={pdfLoading} className="px-5 text-sm border-amber-300 text-amber-700 hover:bg-amber-50" data-testid="download-cumulative-btn">
            <Download className="w-4 h-4 mr-2" /> {pdfLoading ? 'Generating...' : 'All Lessons (Cumulative)'}
          </Button>
        </div>
        <div>
          {lesson?.title?.toLowerCase().includes('final gate') || lesson?.lesson_id?.includes('unit_12_lesson_04') ? (
            <Button size="lg" onClick={onFinish} className="px-8 bg-amber-500 hover:bg-amber-600 text-white shadow-lg" data-testid="lesson-summary-finish-btn">
              <Trophy className="w-5 h-5 mr-2" /> Claim Your Certificate
            </Button>
          ) : (
            <Button size="lg" onClick={onFinish} className="px-8" data-testid="lesson-summary-finish-btn">
              <Star className="w-5 h-5 mr-2" /> Finish Lesson
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Your vocabulary has been added to your review queue.</p>
      </div>
    </div>
  );
}

// ═══════ PLACEHOLDER ═══════
function PlaceholderActivity({ type, onComplete, onSkip, isSkippable }) {
  return (
    <Card className="p-12 text-center max-w-lg mx-auto" data-testid="placeholder-activity">
      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
        {React.createElement(ACTIVITY_ICONS[type] || Play, { className: 'w-8 h-8 text-gray-400' })}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{ACTIVITY_LABELS[type] || type}</h3>
      <p className="text-gray-500 mb-6 text-sm">This activity module is coming soon.</p>
      <div className="flex justify-center gap-3">
        {isSkippable && <Button variant="outline" onClick={onSkip} data-testid="placeholder-skip-btn">Skip</Button>}
        <Button onClick={() => onComplete(100)} data-testid="placeholder-complete-btn">Mark Complete</Button>
      </div>
    </Card>
  );
}
