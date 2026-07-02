import {
  RefreshCw, BookOpen, Gamepad2, FileText, Edit3, Headphones,
  Mic, CheckCircle, Repeat
} from 'lucide-react';

export const API_URL = process.env.REACT_APP_BACKEND_URL;

// ═══════ STAGE THEMES ═══════
export const STAGE_THEMES = {
  stage_1: { bg: 'from-amber-50 to-orange-50', accent: '#F59E0B', accentLight: '#FEF3C7', accentText: 'text-amber-700', headerBg: 'bg-gradient-to-r from-amber-400 to-orange-400', pathColor: '#F59E0B', cardBorder: 'border-amber-200', activeBg: 'bg-amber-50', activeRing: 'ring-amber-400', completedBg: 'bg-amber-500', badgeBg: 'bg-amber-100 text-amber-700', btnBg: 'bg-amber-500 hover:bg-amber-600' },
  stage_2: { bg: 'from-emerald-50 to-teal-50', accent: '#10B981', accentLight: '#D1FAE5', accentText: 'text-emerald-700', headerBg: 'bg-gradient-to-r from-emerald-400 to-teal-400', pathColor: '#10B981', cardBorder: 'border-emerald-200', activeBg: 'bg-emerald-50', activeRing: 'ring-emerald-400', completedBg: 'bg-emerald-500', badgeBg: 'bg-emerald-100 text-emerald-700', btnBg: 'bg-emerald-500 hover:bg-emerald-600' },
  stage_3: { bg: 'from-blue-50 to-indigo-50', accent: '#3B82F6', accentLight: '#DBEAFE', accentText: 'text-blue-700', headerBg: 'bg-gradient-to-r from-blue-400 to-indigo-400', pathColor: '#3B82F6', cardBorder: 'border-blue-200', activeBg: 'bg-blue-50', activeRing: 'ring-blue-400', completedBg: 'bg-blue-500', badgeBg: 'bg-blue-100 text-blue-700', btnBg: 'bg-blue-500 hover:bg-blue-600' },
  stage_4: { bg: 'from-violet-50 to-purple-50', accent: '#8B5CF6', accentLight: '#EDE9FE', accentText: 'text-violet-700', headerBg: 'bg-gradient-to-r from-violet-400 to-purple-400', pathColor: '#8B5CF6', cardBorder: 'border-violet-200', activeBg: 'bg-violet-50', activeRing: 'ring-violet-400', completedBg: 'bg-violet-500', badgeBg: 'bg-violet-100 text-violet-700', btnBg: 'bg-violet-500 hover:bg-violet-600' },
  stage_5: { bg: 'from-rose-50 to-pink-50', accent: '#F43F5E', accentLight: '#FFE4E6', accentText: 'text-rose-700', headerBg: 'bg-gradient-to-r from-rose-400 to-pink-400', pathColor: '#F43F5E', cardBorder: 'border-rose-200', activeBg: 'bg-rose-50', activeRing: 'ring-rose-400', completedBg: 'bg-rose-500', badgeBg: 'bg-rose-100 text-rose-700', btnBg: 'bg-rose-500 hover:bg-rose-600' },
};
export const getTheme = (stageId) => STAGE_THEMES[stageId] || STAGE_THEMES.stage_1;

export const ACTIVITY_ICONS = {
  'retrieval_warmup': RefreshCw, 'vocabulary': BookOpen, 'micro_game_vocab': Gamepad2, 'vocab_games': Gamepad2,
  'micro_reading': FileText, 'grammar_focus': Edit3, 'micro_game_grammar': Gamepad2, 'grammar_games': Gamepad2,
  'listening': Headphones, 'listening_task': Headphones, 'production': Mic, 'exit_ticket': CheckCircle, 'auto_review': Repeat
};

export const ACTIVITY_LABELS = {
  'retrieval_warmup': 'Warm-up', 'vocabulary': 'Vocabulary', 'micro_game_vocab': 'Vocab Games', 'vocab_games': 'Vocab Games',
  'micro_reading': 'Reading', 'grammar_focus': 'Grammar', 'micro_game_grammar': 'Grammar Games', 'grammar_games': 'Grammar Games',
  'listening': 'Listening', 'listening_task': 'Listening', 'production': 'Speaking', 'exit_ticket': 'Exit Quiz', 'auto_review': 'Review'
};
