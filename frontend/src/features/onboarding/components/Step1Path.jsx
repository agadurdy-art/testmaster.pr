import React from 'react';
import { useI18n } from '../../../lib/i18n';

// Parse "**bold**" segments in the meta-row string so `+1.3 bands`, `45-day`,
// `A1 → C2`, `No exam` stay emphasised after translation.
function withBold(str) {
  if (!str) return null;
  const parts = String(str).split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) => (i % 2 === 1 ? <b key={i}>{p}</b> : p));
}

const CHECK_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Step1Path({ direction, path, onSelect }) {
  const { t } = useI18n();
  return (
    <section className={`step${direction === 'rev' ? ' rev' : ''}`}>
      <h1 className="step-title">
        {t('onbStep1Title')}{' '}
        <span className="ital">{t('onbStep1TitleItal')}</span>
      </h1>
      <p className="step-sub">
        {t('onbStep1Sub')}
      </p>

      <div className="path-grid">
        <button
          type="button"
          className={`path-card a${path === 'ielts' ? ' selected' : ''}`}
          onClick={() => onSelect('ielts')}
        >
          <span className="corner-check" aria-hidden="true">{CHECK_ICON}</span>
          <div className="path-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 10L12 4 2 10l10 6 10-6z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h3>{t('onbStep1PathAName')}</h3>
          <p className="desc">
            {t('onbStep1PathADesc')}
          </p>
          <div className="meta-row">
            <span>{withBold(t('onbStep1PathAMeta'))}</span>
          </div>
        </button>

        <button
          type="button"
          className={`path-card b${path === 'general' ? ' selected' : ''}`}
          onClick={() => onSelect('general')}
        >
          <span className="corner-check" aria-hidden="true">{CHECK_ICON}</span>
          <div className="path-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 3h7a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-7a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h8z" />
            </svg>
          </div>
          <h3>{t('onbStep1PathBName')}</h3>
          <p className="desc">
            {t('onbStep1PathBDesc')}
          </p>
          <div className="meta-row">
            <span>{withBold(t('onbStep1PathBMeta'))}</span>
          </div>
        </button>
      </div>
    </section>
  );
}
