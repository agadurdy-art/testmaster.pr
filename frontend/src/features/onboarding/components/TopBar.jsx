import React from 'react';
import { useI18n } from '../../../lib/i18n';

export default function TopBar({ step }) {
  const { t } = useI18n();
  const progress = t('onbStepProgress', { step: String(step) });
  const stepName = t(`onbStepName${step}`);
  return (
    <header className="topbar">
      <div className="topbar-row">
        <a href="/landing/v2" className="logo">
          testmaster<span className="pro">.pro</span>
        </a>
        <div className="step-label">
          {progress} · <span>{stepName}</span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${step * 20}%` }}
          />
        </div>
      </div>
    </header>
  );
}
