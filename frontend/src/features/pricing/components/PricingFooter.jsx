import React from 'react';
import { useI18n } from '../../../lib/i18n';
import { isAdminUser } from '../../../lib/planAccess';

function readUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch (_) { return null; }
}

export default function PricingFooter() {
  const { t } = useI18n();
  // Status is an internal/admin page — only surface it to admins. Language is
  // handled by the real i18n selector in the top nav; the old footer EN/VI/TR/ZH
  // switch only set local state (never changed the language) so it's removed.
  const isAdmin = isAdminUser(readUser());
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
            <li><a href="/contact">{t('pricingV2FooterContact')}</a></li>
            {isAdmin && <li><a href="/status">{t('pricingV2FooterStatus')}</a></li>}
          </ul>
        </div>
        <div className="foot-copy">
          {t('pricingV2FooterCopy')}
        </div>
      </div>
    </footer>
  );
}
