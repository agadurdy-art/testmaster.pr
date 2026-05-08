import React from 'react';
import { LANGUAGES } from '../constants';

const TICK_ICON = (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Step4Language({
  direction,
  language,
  onSelect,
  nativeLanguage,
  onSelectNative,
}) {
  return (
    <section className={`step${direction === 'rev' ? ' rev' : ''}`}>
      <h1 className="step-title">
        Which language should Liz{' '}
        <span className="ital">explain things in?</span>
      </h1>
      <p className="step-sub">
        Every comment, rewrite, and lesson explanation will be translated. Your
        essays stay in English — only the feedback adapts.
      </p>

      <div className="lang-grid">
        {LANGUAGES.map((l) => {
          const selected = language?.code === l.code;
          return (
            <button
              key={l.code}
              type="button"
              className={`lang-chip${selected ? ' selected' : ''}`}
              onClick={() => onSelect(l)}
            >
              <span className="flag">{l.flag}</span>
              <span className="lbl">
                <span className="name">{l.name}</span>
                <span className="native">{l.native}</span>
              </span>
              <span className="tick">{TICK_ICON}</span>
            </button>
          );
        })}
      </div>

      {onSelectNative && (
        <div className="native-lang-block">
          <div className="q-label">What's your native language?</div>
          <div className="q-hint">
            Helps Liz spot L1-driven mistakes (false friends, article use, word
            order). Optional.
          </div>
          <div className="lang-grid native">
            {LANGUAGES.map((l) => {
              const selected = nativeLanguage?.code === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  className={`lang-chip${selected ? ' selected' : ''}`}
                  onClick={() => onSelectNative(l)}
                >
                  <span className="flag">{l.flag}</span>
                  <span className="lbl">
                    <span className="name">{l.name}</span>
                    <span className="native">{l.native}</span>
                  </span>
                  <span className="tick">{TICK_ICON}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
