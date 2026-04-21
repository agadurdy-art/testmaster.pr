import React, { useState } from 'react';
import { useI18n } from '../../../lib/i18n';

const LANGS = ['EN', 'VI', 'TR', 'ZH'];

export default function PricingFooter() {
  const { t } = useI18n();
  const [lang, setLang] = useState('EN');
  return (
    <footer>
      <div className="container">
        <div className="foot">
          <a href="/" className="logo">
            testmaster<span className="pro">.pro</span>
          </a>
          <ul className="foot-links">
            <li><a href="/privacy">{t('pricingV2FooterPrivacy')}</a></li>
            <li><a href="/terms">{t('pricingV2FooterTerms')}</a></li>
            <li><a href="/blog">{t('pricingV2FooterBlog')}</a></li>
            <li><a href="/contact">{t('pricingV2FooterContact')}</a></li>
            <li><a href="/status">{t('pricingV2FooterStatus')}</a></li>
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
          {t('pricingV2FooterCopy')}
        </div>
      </div>
    </footer>
  );
}
