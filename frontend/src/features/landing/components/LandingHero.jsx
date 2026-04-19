import React from 'react';
import { useI18n } from '../../../lib/i18n';
import ArrowRightIcon from './ArrowRightIcon';

export default function LandingHero() {
  const { t } = useI18n();

  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <div className="eyebrow">
            <span className="dot" aria-hidden="true" />
            {t('landingV2HeroEyebrow')}
            <span className="sep">·</span>
            <span>{t('landingV2HeroEyebrowStudents')}</span>
          </div>
          <h1 className="headline">
            {t('landingV2HeroTitleA')} <span className="under">{t('landingV2HeroTitleTime')}</span> —{' '}
            <span className="ital">{t('landingV2HeroTitleB')}</span>
          </h1>
          <p className="sub">
            {t('landingV2HeroSub')}
          </p>
          <div className="cta-row">
            <a href="/samples/writing/band-6-5-task2" className="btn btn-primary btn-xl">
              {t('landingV2HeroCtaPrimary')}
              <ArrowRightIcon size={16} />
            </a>
            <a href="#samples" className="btn btn-outline btn-xl">
              {t('landingV2HeroCtaSecondary')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
          <div className="micro">
            <span className="chk">✓</span>
            {t('landingV2HeroMicro')}
          </div>
        </div>

        <HeroDemo />
      </div>
    </section>
  );
}

function HeroDemo() {
  return (
    <div className="demo-wrap">
      <div className="float-tag a"><span className="k" />Task Response · 6.5</div>
      <div className="float-tag b"><span className="k" />Grammar fix · 1 of 3</div>

      <div className="demo">
        <div className="demo-chrome">
          <span className="tl r" /><span className="tl y" /><span className="tl g" />
          <span className="demo-url">testmaster.pro / evaluate / d5-sample</span>
        </div>
        <div className="demo-body">
          <div className="essay">
            <div className="essay-label">Task 2 · Writing · Draft 1</div>
            <div className="essay-title">Do social media platforms improve communication?</div>
            <p>
              Nowadays, many <span className="err">peoples thinks that</span> social media has
              made communication easier than before. However, it is worth asking whether this
              convenience has also reduced the depth of our conversations.
            </p>
            <p>
              In my opinion, while platforms such as Facebook are useful for keeping in touch,
              they often encourage shorter, more superficial exchanges…
            </p>

            <div className="fix-tooltip">
              <div className="t">Grammar · Fix</div>
              <div><span className="s">peoples thinks that</span></div>
              <div className="e">people think that</div>
            </div>
          </div>
          <div className="score-panel">
            <div className="band-pill">
              <span className="num">6.5</span>
              <div className="txt">
                <div className="ttl">Estimated Band</div>
                <div className="lbl">Overall · Task 2</div>
              </div>
            </div>
            <div className="criteria">
              <div className="crit" data-w="75"><span className="name">Task Response</span><span className="val">7.0</span><span className="bar" /></div>
              <div className="crit" data-w="68"><span className="name">Coherence &amp; Cohesion</span><span className="val">6.5</span><span className="bar" /></div>
              <div className="crit" data-w="62"><span className="name">Lexical Resource</span><span className="val">6.0</span><span className="bar" /></div>
              <div className="crit" data-w="70"><span className="name">Grammar &amp; Accuracy</span><span className="val">6.5</span><span className="bar" /></div>
            </div>
            <div className="lang-note" data-lang-sample="vi">
              <b>Tiếng Việt</b> · Bản giải thích được dịch tự động · <b>12s</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
