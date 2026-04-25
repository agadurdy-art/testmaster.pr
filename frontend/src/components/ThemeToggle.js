import React from 'react';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';

/**
 * Inline theme switcher — sits inside whatever page header renders it.
 * 4-option segmented control: Light / Dark / Night / Auto.
 * Reads + writes the global ThemeContext so the choice is shared across every
 * page (legacy pages keep importing this from `../components/ThemeToggle`).
 */
export default function ThemeToggle({ className = '' }) {
  const { themeMode, setTheme } = useTheme();

  const options = [
    { key: THEME_MODES.LIGHT,       label: 'Light', Icon: SunIcon },
    { key: THEME_MODES.DARK,        label: 'Dark',  Icon: MoonIcon },
    { key: THEME_MODES.NIGHT_SHIFT, label: 'Night', Icon: SepiaIcon },
    { key: THEME_MODES.AUTO,        label: 'Auto',  Icon: AutoIcon },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex items-center ${className}`}
      style={{
        padding: 3,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        boxShadow: '0 4px 12px -8px rgba(0,0,0,0.18)',
      }}
    >
      {options.map(({ key, label, Icon }) => {
        const on = themeMode === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={label}
            title={label}
            onClick={() => setTheme(key)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: on ? 'rgba(16,163,127,0.18)' : 'transparent',
              color: on ? '#0E8C6D' : '#6B7484',
              transition: 'background-color .15s ease, color .15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}
function SepiaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
      <path d="M4 19.5V21h16" />
    </svg>
  );
}
function AutoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
