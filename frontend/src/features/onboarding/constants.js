export const BANDS = [4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

// Language code `zh` is ISO 639-1 for Chinese; we display it as "Mandarin"
// because Liz prompts and evaluators are tuned for Standard Mandarin.
export const LANGUAGES = [
  { code: 'en', name: 'English',              native: 'English',             flag: '🇬🇧' },
  { code: 'vi', name: 'Vietnamese',           native: 'Tiếng Việt',          flag: '🇻🇳' },
  { code: 'tr', name: 'Turkish',              native: 'Türkçe',              flag: '🇹🇷' },
  { code: 'zh', name: 'Mandarin',             native: '中文',                 flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic',               native: 'العربية',              flag: '🇸🇦' },
  { code: 'ko', name: 'Korean',               native: '한국어',                flag: '🇰🇷' },
  { code: 'th', name: 'Thai',                 native: 'ภาษาไทย',              flag: '🇹🇭' },
  { code: 'ja', name: 'Japanese',             native: '日本語',                flag: '🇯🇵' },
  { code: 'es', name: 'Spanish',              native: 'Español',             flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese',           native: 'Português',           flag: '🇵🇹' },
  { code: 'ru', name: 'Russian',              native: 'Русский',             flag: '🇷🇺' },
  { code: 'id', name: 'Indonesian',           native: 'Bahasa Indonesia',    flag: '🇮🇩' },
];

export const STEP_NAMES = {
  1: 'Choose your path',
  2: 'Target & timeline',
  3: 'Current level',
  4: 'Your language',
  5: 'Meet Liz',
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
