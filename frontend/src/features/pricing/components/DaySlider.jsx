import React from 'react';
import { useI18n } from '../../../lib/i18n';
import ArrowRightIcon from './ArrowRightIcon';
import usePricingSlider from '../hooks/usePricingSlider';

const PRESET_CHIPS = [7, 14, 30, 60, 90, 180, 365];
// Labels on the scale — rendered at their real linear positions so they
// line up with the range-input thumb (which is linear).
const SCALE_LABELS = [3, 30, 90, 180, 365];

export default function DaySlider({ slider }) {
  const { t } = useI18n();
  // Fall back to an internal hook instance so the component still works
  // standalone (e.g. if mounted outside PricingPageV2).
  const fallback = usePricingSlider(30);
  const {
    days,
    setDays,
    totalText,
    perDayText,
    savingsPct,
    fillPct,
    leadingText,
    MIN_DAYS,
    MAX_DAYS,
  } = slider || fallback;

  return (
    <section id="custom" style={{ paddingTop: 16, scrollMarginTop: 80 }}>
      <div className="container">
        <div className="slider-card">
          <div className="slider-head">
            <div className="slider-question">
              {t('pricingV2SliderQuestionA')} <span className="hl">{t('pricingV2SliderQuestionB')}</span>
            </div>
            <div className="price-display">
              <div className="days-readout">
                {t('pricingV2SliderForDays', { days })}
              </div>
              <div className="price-main">
                <span className="cur">$</span>
                <span>{totalText}</span>
              </div>
              <div className="per-day">
                {t('pricingV2SliderPerDayA')} <b>{perDayText}</b>{t('pricingV2SliderPerDayB')}
              </div>
              <div className="save-badge">
                <span className="spark"></span>
                {t('pricingV2SliderSaveA')} <span>{savingsPct}%</span> {t('pricingV2SliderSaveB')}
              </div>
            </div>
          </div>

          <div className="slider-wrap">
            <div className="slider-scale">
              {SCALE_LABELS.map((v) => {
                const pct = ((v - MIN_DAYS) / (MAX_DAYS - MIN_DAYS)) * 100;
                return (
                  <span
                    key={v}
                    style={{
                      left: `${pct}%`,
                      transform:
                        v === MIN_DAYS
                          ? 'translateX(0)'
                          : v === MAX_DAYS
                            ? 'translateX(-100%)'
                            : 'translateX(-50%)',
                    }}
                  >
                    {v}
                  </span>
                );
              })}
            </div>
            <div className="slider-track">
              <div className="slider-bar">
                <div
                  className="slider-bar-fill"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              <input
                type="range"
                className="days-range"
                min={MIN_DAYS}
                max={MAX_DAYS}
                value={days}
                step={1}
                aria-label={t('pricingV2SliderAriaDays')}
                onChange={(e) => setDays(parseInt(e.target.value, 10))}
              />
            </div>
            <div className="slider-preset-row">
              <span className="slider-preset-label">{t('pricingV2SliderQuickPicks')}</span>
              <div className="preset-chips">
                {PRESET_CHIPS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`chip${days === d ? ' active' : ''}`}
                    onClick={() => setDays(d)}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="slider-cta-row">
            <div className="slider-cta-text">
              {t('pricingV2SliderCtaText', { days })}
            </div>
            <a href="/signup" className="btn btn-primary btn-xl">
              {t('pricingV2SliderCtaButton', { days })}
              <ArrowRightIcon />
            </a>
          </div>

          <div className="compare-strip">
            <span>{t('pricingV2CompareStripA')}</span>
            <span className="name">{t('pricingV2CompareStripName')}</span>
            <span className="theirs">${leadingText}</span>
            <span>→</span>
            <span className="ours">{t('pricingV2CompareStripOurs', { totalText })}</span>
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11.5,
              }}
            >
              {t('pricingV2CompareStripSame', { days })}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
