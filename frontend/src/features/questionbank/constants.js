import { BookOpen, Headphones, PenTool, Mic } from 'lucide-react';

// D9 handoff visual tokens — port-only, no data changes
export const T = {
  brand: '160 84% 39%',
  brandDark: '160 84% 28%',
  sky: '199 89% 60%',
  gold: '43 96% 56%',
  rose: '350 70% 58%',
  ink: '220 25% 12%',
  muted: '220 10% 45%',
  fainter: '220 10% 65%',
  bg: '210 20% 98%',
  surface: '0 0% 100%',
  border: '220 15% 90%',
  borderSoft: '220 15% 94%',
};
export const FONT_DISPLAY = '"Playfair Display", Georgia, serif';
export const FONT_SANS = '"Inter", system-ui, sans-serif';

// Section times and questions for Full Test modal
export const SECTION_TIMES = {
  listening: '40 minutes',
  reading: '60 minutes',
  writing: '60 minutes',
  speaking: '11-14 minutes'
};

export const SECTION_QUESTIONS = {
  listening: '40 questions',
  reading: '40 questions',
  writing: '2 tasks',
  speaking: '3 parts'
};

export const SECTION_COLORS = {
  listening: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
  reading: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600' },
  writing: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
  speaking: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' }
};

// Reading + Listening question-type pickers (Cathoven-style dropdown).
// Replaced the old all-visible card grid which users found confusing —
// now it's a single dropdown with full IELTS-official names. The eight
// reading + six listening type IDs mirror what /api/courses/reading/
// question-types and /api/listening/question-types return; downstream
// ReadingPracticeByType / ListeningPractice already filter on these IDs.
export const READING_QTYPES = [
  { id: 'multiple_choice', name: 'Multiple Choice' },
  { id: 'true_false_ng', name: 'True / False / Not Given' },
  { id: 'matching_headings', name: 'Matching Headings' },
  { id: 'matching_information', name: 'Matching Information' },
  { id: 'sentence_completion', name: 'Sentence Completion' },
  { id: 'summary_completion', name: 'Summary Completion' },
  { id: 'table_completion', name: 'Note / Table / Flow-chart Completion' },
  { id: 'short_answer', name: 'Short Answer Questions' },
];
export const LISTENING_QTYPES = [
  { id: 'multiple_choice', name: 'Multiple Choice' },
  { id: 'form_completion', name: 'Form / Note Completion' },
  { id: 'sentence_completion', name: 'Sentence Completion' },
  { id: 'matching', name: 'Matching' },
  { id: 'plan_map_labeling', name: 'Plan / Map Labelling' },
  { id: 'short_answer', name: 'Short Answer' },
];

export const skillIcons = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenTool,
  speaking: Mic,
};
