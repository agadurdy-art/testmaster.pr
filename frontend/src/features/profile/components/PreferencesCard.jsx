// PreferencesCard — verbatim from pages/Profile.js lines 829-900 (Faz1 wave 10).
// Closed-over values arrive as same-named props.
import React from 'react';
import { useTheme, THEME_MODES } from '../../../contexts/ThemeContext';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import { Card, Row } from './primitives';

// ─── Preferences ───────────────────────────────────────────────────────────

export default function PreferencesCard({ isGE, feedbackLanguage, onSwitchMode }) {
  const { themeMode, setTheme } = useTheme();
  const themeOptions = [
    { key: THEME_MODES.LIGHT, label: 'Light' },
    { key: THEME_MODES.DARK, label: 'Dark' },
    { key: THEME_MODES.NIGHT_SHIFT, label: 'Night' },
    { key: THEME_MODES.AUTO, label: 'Auto' },
  ];

  return (
    <Card title="Preferences" subtitle="Language, theme, and learning track.">
      <Row label="UI language">
        <LanguageSwitcher compact />
      </Row>
      <Row label="Feedback language">
        <div className="text-sm" style={{ color: 'hsl(var(--fg))' }}>
          {feedbackLanguage || 'English (default)'}
        </div>
      </Row>
      <Row label="Theme">
        <div
          role="radiogroup"
          className="inline-flex items-center gap-1 rounded-full p-1 border hairline"
          style={{ borderColor: 'hsl(var(--rule))' }}
        >
          {themeOptions.map((opt) => {
            const on = themeMode === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTheme(opt.key)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors"
                style={{
                  background: on ? 'hsl(var(--fg))' : 'transparent',
                  color: on ? 'hsl(var(--bg))' : 'hsl(var(--muted-fg))',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Row>
      <Row label="Learning track">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: isGE ? 'hsl(155 84% 95%)' : 'hsl(217 100% 96%)',
              color: isGE ? 'hsl(155 70% 30%)' : 'hsl(217 76% 38%)',
            }}
          >
            {isGE ? 'General English' : 'IELTS Ace'}
          </span>
          <button
            type="button"
            onClick={onSwitchMode}
            className="text-xs underline decoration-dotted underline-offset-2"
            style={{ color: 'hsl(var(--muted-fg))' }}
          >
            Switch
          </button>
        </div>
      </Row>
    </Card>
  );
}
