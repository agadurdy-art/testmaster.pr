import React from 'react';
import { STEP_NAMES } from '../constants';

export default function TopBar({ step }) {
  return (
    <header className="topbar">
      <div className="topbar-row">
        <a href="/landing/v2" className="logo">
          testmaster<span className="pro">.pro</span>
        </a>
        <div className="step-label">
          Step <b>{step}</b> of <b>5</b> · <span>{STEP_NAMES[step]}</span>
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
