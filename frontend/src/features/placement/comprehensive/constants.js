export const API_URL = process.env.REACT_APP_BACKEND_URL;

// ENHANCED READING QUESTIONS - 10 questions covering Band 2.0 to 9.0
// Reading questions loaded from server (no answer keys)

// ENHANCED SPEAKING PROMPTS - 3 questions covering A1 to C2
export const speakingPrompts = [
  {
    id: 1,
    level: 'A1-A2',
    band: '2.0-4.5',
    prompt: "Tell me about yourself. What is your name? Where are you from? What do you do every day?",
    duration: 60,
    tip: "Speak naturally for about 45-60 seconds. Use simple sentences.",
    criteria: ['basic_fluency', 'pronunciation', 'basic_vocabulary']
  },
  {
    id: 2,
    level: 'B1-B2',
    band: '5.0-6.5',
    prompt: "Describe a place you like to visit in your city or country. Where is it? What can you do there? Why do you like it?",
    duration: 120,
    tip: "Try to speak for 1.5-2 minutes. Use descriptive language and explain your reasons.",
    criteria: ['fluency', 'vocabulary_range', 'grammar_accuracy', 'coherence']
  },
  {
    id: 3,
    level: 'C1-C2',
    band: '7.0-9.0',
    prompt: "Some people believe that technology is making us more isolated, while others think it brings us closer together. What is your opinion? Provide reasons and examples to support your view.",
    duration: 150,
    tip: "Speak for 2-2.5 minutes. Develop your argument with clear reasoning and examples.",
    criteria: ['fluency', 'advanced_vocabulary', 'complex_grammar', 'argumentation', 'cohesion']
  }
];

// Band → CEFR mapping for the GE-flavoured surface. The underlying
// question pool maxes out around CEFR A2-B1, so we round generously.
export function bandToCEFR(band) {
  if (band == null) return '—';
  if (band >= 8.0) return 'C2 · Proficient';
  if (band >= 7.0) return 'C1 · Advanced';
  if (band >= 6.0) return 'B2 · Upper-Intermediate';
  if (band >= 5.0) return 'B1 · Intermediate';
  if (band >= 4.0) return 'A2 · Elementary';
  if (band >= 2.5) return 'A1 · Beginner';
  return 'Pre-A1 · Starter';
}

// Fallback static questions if API fails
export const FALLBACK_LISTENING_QUESTIONS = [
  {
    id: 'q1', section_id: 'listening_1', section_title: 'Daily Schedule',
    audio_url: '/audio/listening/listening_1.mp3', level: 'A1-A2', band_range: '2.0-3.5',
    type: 'mcq', question: "What time does Sarah wake up?",
    options: ["A) 6 o'clock", "B) 7 o'clock", "C) 8 o'clock", "D) 9 o'clock"], correct: 'B'
  },
  {
    id: 'q2', section_id: 'listening_1', section_title: 'Daily Schedule',
    audio_url: '/audio/listening/listening_1.mp3', level: 'A1-A2', band_range: '2.0-3.5',
    type: 'mcq', question: "What does Sarah have for breakfast?",
    options: ["A) Eggs and coffee", "B) Cereal and milk", "C) Toast and tea", "D) Fruit and juice"], correct: 'C'
  },
  {
    id: 'q3', section_id: 'listening_2', section_title: 'At the Train Station',
    audio_url: '/audio/listening/listening_2.mp3', level: 'A2', band_range: '3.5-4.5',
    type: 'mcq', question: "Which platform does the train to London leave from?",
    options: ["A) Platform 1", "B) Platform 2", "C) Platform 3", "D) Platform 4"], correct: 'C'
  },
  {
    id: 'q4', section_id: 'listening_2', section_title: 'At the Train Station',
    audio_url: '/audio/listening/listening_2.mp3', level: 'A2', band_range: '3.5-4.5',
    type: 'mcq', question: "How long does the journey take?",
    options: ["A) 1 hour", "B) 1 hour 20 minutes", "C) 2 hours", "D) 2 hours 15 minutes"], correct: 'B'
  }
];

// Default writing tasks used when the API fails
export const DEFAULT_WRITING_TASKS = [
  {
    id: 'writing_task_1',
    level: 'Band 2-4',
    type: 'guided',
    title: 'Introduce Yourself',
    instruction: 'Complete the sentences about yourself. Write 3-5 simple sentences.',
    min_words: 20,
    max_words: 50,
    time_minutes: 5
  },
  {
    id: 'writing_task_2',
    level: 'Band 4-6',
    type: 'paragraph',
    title: 'Describe Your Daily Routine',
    instruction: 'Write a short paragraph (60-90 words) describing what you do on a typical day.',
    min_words: 60,
    max_words: 90,
    time_minutes: 8
  },
  {
    id: 'writing_task_3',
    level: 'Band 6-7+',
    type: 'essay',
    title: 'Opinion Essay',
    instruction: 'Some people believe that technology makes our lives easier, while others think it creates more problems. What is your opinion? Write a short essay (120-180 words).',
    min_words: 120,
    max_words: 200,
    time_minutes: 12
  }
];
