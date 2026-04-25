import React from 'react';
import { useI18n } from '../../../lib/i18n';

export default function StickyActions({ step, canContinue, onContinue }) {
  const { t } = useI18n();
  const label = step === 5 ? t('onbMeetDashboard') : t('onbContinue');
  return (
    <div className="actions">
      <div className="actions-inner">
        <div className="hint">
          <span className="kbd">Tab</span> {t('onbKbdMove')}
          <span className="kbd">Enter</span> {t('onbKbdContinue')}
          <span className="kbd">Esc</span> {t('onbKbdBack')}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          disabled={!canContinue}
          onClick={onContinue}
        >
          <span>{label}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
