/**
 * Centralized Language Helper
 * ===========================
 * Single source of truth for all content localization.
 * 
 * Rules:
 * - EN mode: Only English, no TR/VI allowed
 * - VI mode: Vietnamese primary + optional English support, no TR
 * - TR mode: Turkish primary + optional English support, no VI
 */

/**
 * Get localized text from a multi-language object
 * @param {Object} obj - Object with {en, vi, tr} keys
 * @param {string} lang - Current system language ('en' | 'vi' | 'tr')
 * @param {Object} options - Configuration options
 * @returns {string | {primary: string, support: string} | null}
 */
export function getLocalizedText(obj, lang, options = {}) {
  const {
    allowEnglishSupport = false, // VI/TR content can show optional EN support
    fallbackToEmpty = true,      // Return "" if missing, otherwise null
    returnSupport = false        // Return {primary, support} object
  } = options;

  // Handle null/undefined or non-object
  if (!obj || typeof obj !== 'object') {
    return returnSupport ? { primary: '', support: '' } : (fallbackToEmpty ? '' : null);
  }

  const primary = (obj[lang] ?? '').toString().trim();
  const enSupport = (obj.en ?? '').toString().trim();

  // EN mode: No support text ever, only English content
  if (lang === 'en') {
    if (returnSupport) {
      return { primary, support: '' };
    }
    return primary || (fallbackToEmpty ? '' : null);
  }

  // VI/TR mode: If primary doesn't exist, hide content completely
  if (!primary) {
    if (returnSupport) {
      return { primary: '', support: '' };
    }
    return fallbackToEmpty ? '' : null;
  }

  // Support text only if explicitly allowed and we're in VI/TR mode
  const support = (allowEnglishSupport && enSupport && enSupport !== primary) ? enSupport : '';

  if (returnSupport) {
    return { primary, support };
  }
  
  return primary;
}

/**
 * Simple text getter (no support text)
 * Use this for UI elements where you just need the string
 */
export function getText(obj, lang) {
  return getLocalizedText(obj, lang, { 
    allowEnglishSupport: false, 
    fallbackToEmpty: true,
    returnSupport: false 
  });
}

/**
 * Content getter with optional English support
 * Use this for educational content in VI/TR modes
 */
export function getContentWithSupport(obj, lang) {
  return getLocalizedText(obj, lang, {
    allowEnglishSupport: lang !== 'en',
    fallbackToEmpty: true,
    returnSupport: true
  });
}

/**
 * Check if content exists for the given language
 * @param {Object} obj - Object with {en, vi, tr} keys
 * @param {string} lang - Current system language
 * @returns {boolean}
 */
export function hasLocalizedContent(obj, lang) {
  if (!obj || typeof obj !== 'object') return false;
  const text = (obj[lang] ?? '').toString().trim();
  return text.length > 0;
}

/**
 * Filter array of items to only those with content in current language
 * @param {Array} items - Array of objects with localized fields
 * @param {string} lang - Current system language
 * @param {string} field - Field name to check (e.g., 'word', 'title')
 * @returns {Array}
 */
export function filterByLanguage(items, lang, field = 'word') {
  if (!Array.isArray(items)) return [];
  return items.filter(item => {
    const fieldObj = item[field];
    return hasLocalizedContent(fieldObj, lang);
  });
}

export default getLocalizedText;
