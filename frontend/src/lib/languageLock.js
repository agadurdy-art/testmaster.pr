/**
 * Language Lock Utility
 * =====================
 * Manages route-level language locking for IELTS-level modules.
 * These modules are English-only regardless of system language.
 */

// Routes that are locked to English (IELTS level content)
export const ENGLISH_LOCKED_ROUTES = [
  '/test-interface',
  '/test/',
  '/mastery-course',
  '/advanced-mastery',
  '/cambridge-test',
  '/full-test',
  '/writing-practice',
  '/speaking-practice',
  '/reading-practice',
  '/listening-practice',
  '/practice-mode',
  '/question-bank',
  '/level-test',
  '/comprehensive-level-test',
  '/adaptive-level-test',
];

/**
 * Check if current route should be locked to English
 * @param {string} pathname - Current route pathname
 * @returns {boolean}
 */
export function isEnglishLockedRoute(pathname) {
  if (!pathname) return false;
  return ENGLISH_LOCKED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Get effective language for current route
 * @param {string} pathname - Current route pathname
 * @param {string} systemLanguage - User's system language preference
 * @returns {string} - Effective language ('en', 'vi', or 'tr')
 */
export function getEffectiveLanguage(pathname, systemLanguage) {
  if (isEnglishLockedRoute(pathname)) {
    return 'en';
  }
  return systemLanguage || 'en';
}

/**
 * Get English-only notice text based on system language
 * @param {string} systemLanguage - User's system language
 * @returns {Object} - Notice text in user's language
 */
export function getEnglishOnlyNotice(systemLanguage) {
  const notices = {
    en: {
      title: 'English Only',
      message: 'This section uses English only (IELTS level).'
    },
    vi: {
      title: 'Chỉ tiếng Anh',
      message: 'Phần này chỉ sử dụng tiếng Anh (trình độ IELTS).'
    },
    tr: {
      title: 'Sadece İngilizce',
      message: 'Bu bölüm sadece İngilizce kullanır (IELTS seviyesi).'
    }
  };
  
  return notices[systemLanguage] || notices.en;
}

export default {
  isEnglishLockedRoute,
  getEffectiveLanguage,
  getEnglishOnlyNotice,
  ENGLISH_LOCKED_ROUTES
};
