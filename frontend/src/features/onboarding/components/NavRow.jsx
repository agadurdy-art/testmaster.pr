import React from 'react';
import { useI18n } from '../../../lib/i18n';

export default function NavRow({ step, onBack, onSkip }) {
  const { t } = useI18n();
  return (
    <div className="nav-row">
      <button
        type="button"
        className="back-btn"
        disabled={step === 1}
        onClick={onBack}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        {t('onboardingBack')}
      </button>
      <button type="button" className="skip-link" onClick={onSkip}>
        {t('onboardingSkip')} <span className="skip-hint">{t('onboardingSkipHint')}</span>
      </button>
    </div>
  );
}
