import React, { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { useI18n, LANGUAGES } from '../lib/i18n';

/**
 * LanguageSwitcher
 * - default: native <select> with text label (full or compact pill)
 * - iconOnly: tiny Globe icon button → custom popover with full list
 *
 * iconOnly mode is for tight headers (AppShellNav, Profile header) where
 * a 200px-wide select would crowd the layout.
 */
export default function LanguageSwitcher({ compact = false, iconOnly = false }) {
  const { language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!wrapRef.current || !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (iconOnly) {
    return (
      <div ref={wrapRef} className="relative inline-block" data-lang-sample>
        <button
          type="button"
          aria-label="Language"
          aria-haspopup="listbox"
          aria-expanded={open}
          title={LANGUAGES[language] || 'Language'}
          onClick={() => setOpen((o) => !o)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <Globe className="w-4 h-4" />
        </button>
        {open && (
          <ul
            role="listbox"
            aria-label="Language"
            className="absolute right-0 mt-1 w-44 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
          >
            {Object.entries(LANGUAGES).map(([code, name]) => {
              const active = code === language;
              return (
                <li key={code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => { setLanguage(code); setOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-sm transition ${
                      active
                        ? 'bg-sky-50 text-sky-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {name}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // Single-select dropdown scales cleanly to 12+ languages.
  // Native <select> keeps accessibility + mobile UX correct on iOS/Android.
  const sizeClass = compact
    ? 'h-7 text-xs px-2 py-0.5 rounded-full border border-gray-300 bg-white text-gray-700'
    : 'h-8 text-sm px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700';

  return (
    <label className="inline-flex items-center gap-2" data-lang-sample>
      {!compact && <span className="text-xs text-gray-500">Lang</span>}
      <select
        aria-label="Language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className={`${sizeClass} font-medium focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer`}
      >
        {Object.entries(LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
