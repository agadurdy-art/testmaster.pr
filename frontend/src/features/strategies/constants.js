// Shared constants for the Strategies Guide feature.
// Extracted verbatim from StrategiesGuide.jsx (lines 17-53) during the monolith split.
import {
  BookOpen, Headphones, PenTool, Mic, Sparkles, ListChecks,
  Lightbulb, Clock, Repeat, X as XIcon, BarChart, Hash,
  Newspaper, Presentation, Brain, Radio, Youtube, Tv,
  Globe, Search, Type, MessageSquare, AlignLeft, Image as ImageIcon,
  SpellCheck, Map as MapIcon, FileText, Eye, Ear,
  Pencil, Users, UserCheck, Star, FileEdit, Wand2, BookA, User,
  Grid3x3, Inbox, FastForward, TrendingUp, AlertTriangle,
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STATIC_BASE = process.env.REACT_APP_BACKEND_URL || '';

// Resolve a slide image path. Backend returns "/static/strategies/..." — prefix with backend URL.
// v=2 cache-bust after essay-structure diagram crops (2026-05-04).
const imgUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${STATIC_BASE}${path}${sep}v=2`;
};

// Icon name → component map. Add new lucide icons here as content references them.
const ICONS = {
  Headphones, SpellCheck, Clock, Lightbulb, X: XIcon, BookOpen,
  BarChart, Repeat, Hash, Newspaper, Presentation, Brain, Radio,
  Youtube, Tv, Globe, Search, Type, MessageSquare, AlignLeft,
  Image: ImageIcon, ListChecks, Mic, FileText, Eye, Ear, Pencil,
  Users, UserCheck, Star, FileEdit, Map: MapIcon, Wand2, BookA,
  User, Grid3x3, Inbox, FastForward, TrendingUp, AlertTriangle,
};

const SKILL_META = {
  listening: { name: 'Listening', icon: Headphones, accent: 'emerald' },
  reading:   { name: 'Reading',   icon: BookOpen,   accent: 'sky' },
  speaking:  { name: 'Speaking',  icon: Mic,        accent: 'violet' },
  writing:   { name: 'Writing',   icon: PenTool,    accent: 'amber' },
  vocabulary:{ name: 'Vocabulary',icon: Sparkles,   accent: 'rose' },
};

const ACCENTS = {
  emerald: { ring: 'ring-emerald-500', bg: 'bg-emerald-50', bgLight: 'bg-emerald-50/60', border: 'border-emerald-200', borderStrong: 'border-emerald-400', text: 'text-emerald-700', textDeep: 'text-emerald-900', solid: 'bg-emerald-600 hover:bg-emerald-700', solidBg: 'bg-emerald-600', soft: 'bg-emerald-100', softText: 'text-emerald-800', barBg: 'bg-emerald-500' },
  sky:     { ring: 'ring-sky-500',     bg: 'bg-sky-50',     bgLight: 'bg-sky-50/60',     border: 'border-sky-200',     borderStrong: 'border-sky-400',     text: 'text-sky-700',     textDeep: 'text-sky-900',     solid: 'bg-sky-600 hover:bg-sky-700',         solidBg: 'bg-sky-600',     soft: 'bg-sky-100',     softText: 'text-sky-800',     barBg: 'bg-sky-500' },
  violet:  { ring: 'ring-violet-500',  bg: 'bg-violet-50',  bgLight: 'bg-violet-50/60',  border: 'border-violet-200',  borderStrong: 'border-violet-400',  text: 'text-violet-700',  textDeep: 'text-violet-900',  solid: 'bg-violet-600 hover:bg-violet-700',   solidBg: 'bg-violet-600',  soft: 'bg-violet-100',  softText: 'text-violet-800',  barBg: 'bg-violet-500' },
  amber:   { ring: 'ring-amber-500',   bg: 'bg-amber-50',   bgLight: 'bg-amber-50/60',   border: 'border-amber-200',   borderStrong: 'border-amber-400',   text: 'text-amber-700',   textDeep: 'text-amber-900',   solid: 'bg-amber-600 hover:bg-amber-700',     solidBg: 'bg-amber-600',   soft: 'bg-amber-100',   softText: 'text-amber-800',   barBg: 'bg-amber-500' },
  rose:    { ring: 'ring-rose-500',    bg: 'bg-rose-50',    bgLight: 'bg-rose-50/60',    border: 'border-rose-200',    borderStrong: 'border-rose-400',    text: 'text-rose-700',    textDeep: 'text-rose-900',    solid: 'bg-rose-600 hover:bg-rose-700',       solidBg: 'bg-rose-600',    soft: 'bg-rose-100',    softText: 'text-rose-800',    barBg: 'bg-rose-500' },
};

export { API, STATIC_BASE, imgUrl, ICONS, SKILL_META, ACCENTS };
