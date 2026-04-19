/**
 * Language Leak Detection Utility
 * ================================
 * Detects language purity violations:
 * - EN mode: No TR or VI characters allowed
 * - VI mode: No TR characters allowed
 * - TR mode: No VI characters allowed
 */

// Turkish-specific characters (not in English)
const TR_CHARS = /[ğĞüÜşŞıİöÖçÇ]/;

// Vietnamese-specific characters (diacritics and special letters)
const VI_CHARS = /[ăĂâÂêÊôÔơƠưƯđĐ]|[àáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]|[ầấậẩẫềếệểễồốộổỗờớợởỡừứựửữỳýỵỷỹ]/;

/**
 * Detect language leak in text
 * @param {string} text - Text to check
 * @param {string} lang - Current system language ('en' | 'vi' | 'tr')
 * @returns {Object|null} - Leak info or null if clean
 */
export function detectLanguageLeak(text, lang) {
  if (!text) return null;
  
  const t = String(text);

  if (lang === 'en') {
    // EN mode: No TR or VI allowed
    if (TR_CHARS.test(t)) {
      return { 
        type: 'TR_LEAK_IN_EN', 
        sample: t.slice(0, 140),
        message: 'Turkish characters detected in English mode'
      };
    }
    if (VI_CHARS.test(t)) {
      return { 
        type: 'VI_LEAK_IN_EN', 
        sample: t.slice(0, 140),
        message: 'Vietnamese characters detected in English mode'
      };
    }
  }

  if (lang === 'vi') {
    // VI mode: No TR allowed
    if (TR_CHARS.test(t)) {
      return { 
        type: 'TR_LEAK_IN_VI', 
        sample: t.slice(0, 140),
        message: 'Turkish characters detected in Vietnamese mode'
      };
    }
  }

  if (lang === 'tr') {
    // TR mode: No VI allowed
    if (VI_CHARS.test(t)) {
      return { 
        type: 'VI_LEAK_IN_TR', 
        sample: t.slice(0, 140),
        message: 'Vietnamese characters detected in Turkish mode'
      };
    }
  }

  return null;
}

/**
 * Scan DOM for language leaks (development only)
 * @param {string} lang - Current system language
 * @returns {Object|null}
 */
export function scanDomForLanguageLeaks(lang) {
  try {
    const bodyText = document?.body?.innerText || '';
    return detectLanguageLeak(bodyText, lang);
  } catch (e) {
    console.warn('DOM scan failed:', e);
    return null;
  }
}

/**
 * Check if text is pure for the given language
 * @param {string} text - Text to validate
 * @param {string} lang - Target language
 * @returns {boolean}
 */
export function isLanguagePure(text, lang) {
  return detectLanguageLeak(text, lang) === null;
}

/**
 * Get forbidden characters for a language mode
 * @param {string} lang - Current system language
 * @returns {string}
 */
export function getForbiddenCharsDescription(lang) {
  switch (lang) {
    case 'en':
      return 'Turkish (ğüşıöç) and Vietnamese (ăâêôơưđ + diacritics)';
    case 'vi':
      return 'Turkish (ğüşıöç)';
    case 'tr':
      return 'Vietnamese (ăâêôơưđ + diacritics)';
    default:
      return 'Unknown';
  }
}

export default detectLanguageLeak;
