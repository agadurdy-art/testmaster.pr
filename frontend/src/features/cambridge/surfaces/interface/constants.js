// Shared constants for the Cambridge test interface surface.
// Extracted verbatim from pages/CambridgeTestInterface.js (Faz1 refactor).
import {
  Headphones, BookOpen, PenTool, Mic
} from 'lucide-react';

export const API_URL = process.env.REACT_APP_BACKEND_URL;

// Section time limits in seconds
export const SECTION_TIMES = {
  listening: 30 * 60 + 10 * 60, // 40 minutes (30 + 10 transfer)
  reading: 60 * 60, // 60 minutes
  writing: 60 * 60, // 60 minutes
  speaking: 14 * 60 // 14 minutes
};

// Check if user has premium plan
export const isPremiumUser = (user) => {
  if (!user) return false;
  return user.plan === 'pro' || user.plan === 'booster' || (user.examCredits ?? 0) > 0;
};

// Section tab metadata (labels/icons/time budgets) shared by the header
// tabs and the per-section instructions screen.
export const SECTIONS = [
  { id: 'listening', label: 'Listening', icon: Headphones, color: 'blue', time: '40 min' },
  { id: 'reading', label: 'Reading', icon: BookOpen, color: 'green', time: '60 min' },
  { id: 'writing', label: 'Writing', icon: PenTool, color: 'purple', time: '60 min' },
  { id: 'speaking', label: 'Speaking', icon: Mic, color: 'orange', time: '14 min' }
];
