import React, { useState } from 'react';

const LANGS = ['EN', 'VI', 'TR', 'ZH'];

export default function PricingFooter() {
  const [lang, setLang] = useState('EN');
  return (
    <footer>
      <div className="container">
        <div className="foot">
          <a href="/landing/v2" className="logo">
            testmaster<span className="pro">.pro</span>
          </a>
          <ul className="foot-links">
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/terms">Terms</a></li>
            <li><a href="/blog">Teacher Blog</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/status">Status</a></li>
          </ul>
          <div className="lang-switch" role="tablist" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={lang === l}
                className={lang === l ? 'active' : ''}
                onClick={() => setLang(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="foot-copy">
          © 2026 testmaster.pro · Made by a teacher, powered by students.
        </div>
      </div>
    </footer>
  );
}
