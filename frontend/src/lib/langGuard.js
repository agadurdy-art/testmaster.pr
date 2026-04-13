/**
 * Language Guard Components
 * =========================
 * React components for rendering localized content
 * with language purity enforcement.
 */

import React from 'react';
import { getLocalizedText } from './getLocalizedText';

/**
 * LocalizedBlock - Renders content with optional English support
 * Use for educational content that may show EN as helper text in VI/TR modes
 */
export function LocalizedBlock({ 
  obj, 
  lang, 
  showEnglishSupport = false,
  className = '',
  primaryClassName = '',
  supportClassName = 'text-sm opacity-70 mt-1'
}) {
  const { primary, support } = getLocalizedText(obj, lang, {
    allowEnglishSupport: showEnglishSupport && (lang === 'vi' || lang === 'tr'),
    returnSupport: true
  });

  // If no primary content, render nothing
  if (!primary) return null;

  return (
    <div className={className}>
      <div className={primaryClassName}>{primary}</div>
      {support && <div className={supportClassName}>{support}</div>}
    </div>
  );
}

/**
 * LocalizedText - Simple text rendering without support
 * Use for UI labels, buttons, titles
 */
export function LocalizedText({ obj, lang, as: Component = 'span', className = '' }) {
  const text = getLocalizedText(obj, lang, { 
    allowEnglishSupport: false,
    returnSupport: false 
  });

  if (!text) return null;

  return <Component className={className}>{text}</Component>;
}

/**
 * LocalizedWord - Word with meaning (for vocabulary games)
 * Shows word and meaning in the correct language
 */
export function LocalizedWord({ 
  wordObj, 
  meaningObj, 
  lang, 
  showEnglishSupport = false,
  className = ''
}) {
  const word = getLocalizedText(wordObj, lang);
  const { primary: meaning, support: enMeaning } = getLocalizedText(meaningObj, lang, {
    allowEnglishSupport: showEnglishSupport && lang !== 'en',
    returnSupport: true
  });

  if (!word || !meaning) return null;

  return (
    <div className={className}>
      <div className="font-bold text-lg">{word}</div>
      <div className="text-gray-600">{meaning}</div>
      {enMeaning && <div className="text-sm text-gray-400 italic">{enMeaning}</div>}
    </div>
  );
}

/**
 * LanguageEmptyState - Shows when content is not available in current language
 */
export function LanguageEmptyState({ lang, className = '' }) {
  const messages = {
    en: 'This content is not available in English.',
    vi: 'Nội dung này chưa có bằng tiếng Việt.',
    tr: 'Bu içerik Türkçe olarak mevcut değil.'
  };

  return (
    <div className={`text-center py-8 text-gray-500 ${className}`}>
      <div className="text-4xl mb-3">📭</div>
      <p>{messages[lang] || messages.en}</p>
    </div>
  );
}

/**
 * withLanguageGuard - HOC to inject language and check content availability
 */
export function withLanguageGuard(WrappedComponent, requiredFields = []) {
  return function LanguageGuardedComponent({ lang, ...props }) {
    // Check if all required fields have content in current language
    const hasAllContent = requiredFields.every(field => {
      const obj = props[field];
      if (!obj || typeof obj !== 'object') return false;
      return (obj[lang] ?? '').toString().trim().length > 0;
    });

    if (!hasAllContent) {
      return <LanguageEmptyState lang={lang} />;
    }

    return <WrappedComponent lang={lang} {...props} />;
  };
}

export default LocalizedBlock;
