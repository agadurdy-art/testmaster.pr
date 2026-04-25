import React from 'react';

export default function SpeakingHeader() {
  return (
    <header className="sp-header">
      <div className="sp-header-inner">
        <a href="#" className="sp-logo">
          IELTS Ace<span className="sp-logo-tld">.pro</span>
        </a>
        <nav className="sp-nav">
          <a className="sp-nav-link" href="#">Writing</a>
          <a className="sp-nav-link active" href="#">Speaking</a>
          <a className="sp-nav-link" href="#">Reading</a>
          <a className="sp-nav-link" href="#">Listening</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            className="sp-font-mono"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--sp-muted-fg)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: 9999,
                background: 'var(--sp-primary)',
              }}
            />
            7‑day streak
          </span>
          <div className="sp-avatar">MT</div>
        </div>
      </div>
    </header>
  );
}
