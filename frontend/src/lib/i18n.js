// Multilingual i18n helper for the app.
//
// Faz 3 (2026-07-02): dictionaries moved to src/locales/<lang>.js and are
// LAZY-LOADED per language. The full 12-language dictionary was 788 KB —
// 59% of the main bundle — shipped to every visitor. Now only EN is inline
// (instant fallback + majority of users); the active language's chunk loads
// on demand and t() falls back to EN until it arrives (one quick re-render).
// Dictionaries are populated via scripts/translate_i18n.py (Sonnet).
import React from 'react';


export const LANGUAGES = {
  en: 'English',
  vi: 'Tiếng Việt',
  tr: 'Türkçe',
  mandarin: '中文 (Mandarin)',
  ar: 'العربية',
  ko: '한국어',
  th: 'ภาษาไทย',
  ja: '日本語',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
  id: 'Bahasa Indonesia',
};

// Backend uses ISO 639-1 codes. We display "Mandarin" but keep the wire code "zh"
// so backend contracts (liz_teacher, evaluators, auth) stay unchanged.
// Languages whose script is written right-to-left. Used to flip `dir` on
// <html> so layout (flex, text-align, margins) mirrors automatically.
export const RTL_LANGUAGES = new Set(['ar']);

export const LANGUAGE_WIRE_CODE = {
  en: 'en',
  vi: 'vi',
  tr: 'tr',
  mandarin: 'zh',
  ar: 'ar',
  ko: 'ko',
  th: 'th',
  ja: 'ja',
  es: 'es',
  pt: 'pt',
  ru: 'ru',
  id: 'id',
};

export const SUPPORTED_LANGUAGE_CODES = Object.keys(LANGUAGES);

// Translation keys used across the app. Keep keys stable.

// EN ships in the main bundle: it is the universal fallback inside t() and
// the default language, so it must be available synchronously.
import en from '../locales/en';

// Mutable registry — starts with EN, other languages are merged in as their
// chunks arrive. Consumers must go through t()/useI18n(), never import this
// for direct reads at module scope (it fills in asynchronously).
export const translations = { en };

// One dynamic import per language → one webpack chunk per language.
const LOCALE_LOADERS = {
  vi: () => import(/* webpackChunkName: "locale-vi" */ '../locales/vi'),
  tr: () => import(/* webpackChunkName: "locale-tr" */ '../locales/tr'),
  mandarin: () => import(/* webpackChunkName: "locale-zh" */ '../locales/mandarin'),
  ar: () => import(/* webpackChunkName: "locale-ar" */ '../locales/ar'),
  ko: () => import(/* webpackChunkName: "locale-ko" */ '../locales/ko'),
  th: () => import(/* webpackChunkName: "locale-th" */ '../locales/th'),
  ja: () => import(/* webpackChunkName: "locale-ja" */ '../locales/ja'),
  es: () => import(/* webpackChunkName: "locale-es" */ '../locales/es'),
  pt: () => import(/* webpackChunkName: "locale-pt" */ '../locales/pt'),
  ru: () => import(/* webpackChunkName: "locale-ru" */ '../locales/ru'),
  id: () => import(/* webpackChunkName: "locale-id" */ '../locales/id'),
};

export const I18nContext = React.createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, _vars) => key,
});

export function I18nProvider({ children }) {
  const [language, setLanguage] = React.useState(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem('ieltsace_language');
    return SUPPORTED_LANGUAGE_CODES.includes(stored) ? stored : 'en';
  });
  // Bumped when a locale chunk lands so t() re-renders consumers with the
  // real dictionary (until then they see the EN fallback).
  const [localeVersion, setLocaleVersion] = React.useState(0);

  // Load the active language's dictionary on demand (no-op for EN / already
  // loaded). Failure keeps the EN fallback — never crash the UI over copy.
  React.useEffect(() => {
    if (language === 'en' || translations[language]) return;
    let cancelled = false;
    const loader = LOCALE_LOADERS[language];
    if (!loader) return;
    loader()
      .then((mod) => {
        translations[language] = mod.default;
        if (!cancelled) setLocaleVersion((v) => v + 1);
      })
      .catch(() => {
        /* chunk failed (offline?) — EN fallback stays */
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  // Sync <html lang> + dir so RTL scripts (Arabic) mirror the layout.
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.setAttribute('lang', LANGUAGE_WIRE_CODE[language] || language || 'en');
    html.setAttribute('dir', RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr');
  }, [language]);

  const t = React.useCallback(
    (key, vars) => {
      const dict = translations[language] || translations.en;
      const raw = dict[key] || translations.en[key] || key;
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (m, name) =>
        Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : m
      );
    },
    // localeVersion re-binds t when the async dictionary arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, localeVersion]
  );

  const value = React.useMemo(
    () => ({
      language,
      languageWireCode: LANGUAGE_WIRE_CODE[language] || 'en',
      setLanguage: (lng) => {
        const next = SUPPORTED_LANGUAGE_CODES.includes(lng) ? lng : 'en';
        setLanguage(next);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('ieltsace_language', next);
        }
      },
      t,
    }),
    [language, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
