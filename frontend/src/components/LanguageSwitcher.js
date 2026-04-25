import React from 'react';
import { useI18n, LANGUAGES } from '../lib/i18n';

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage } = useI18n();

  // Single-select dropdown scales cleanly to 12+ languages.
  // Native <select> keeps accessibility + mobile UX correct on iOS/Android.
  const sizeClass = compact
    ? 'h-7 text-xs px-2 py-0.5 rounded-full border border-gray-300 bg-white text-gray-700'
    : 'h-8 text-sm px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700';

  return (
    <label className="inline-flex items-center gap-2">
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
