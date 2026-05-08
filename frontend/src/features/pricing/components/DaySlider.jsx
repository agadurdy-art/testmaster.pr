import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useI18n } from '../../../lib/i18n';
import { resolvePostCheckoutDestination } from '../../../lib/upgradeFlow';
import ArrowRightIcon from './ArrowRightIcon';
import usePricingSlider from '../hooks/usePricingSlider';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

const PRESET_CHIPS = [7, 14, 30, 60, 90, 180, 365];
// Labels on the scale — rendered at their real linear positions so they
// line up with the range-input thumb (which is linear).
const SCALE_LABELS = [3, 30, 90, 180, 365];

export default function DaySlider({ slider, user }) {
  const { t } = useI18n();
  // Fall back to an internal hook instance so the component still works
  // standalone (e.g. if mounted outside PricingPageV2).
  const fallback = usePricingSlider(30);
  const {
    days,
    setDays,
    total,
    totalText,
    perDayText,
    savingsPct,
    fillPct,
    leadingText,
    MIN_DAYS,
    MAX_DAYS,
  } = slider || fallback;

  // Logged-out (or PayPal SDK missing) -> signup with the Custom selection
  // encoded in the query string. Signup picks it up and resumes checkout
  // post-auth via the /upgrade/success flow.
  const canCheckoutInline = Boolean(user && paypalClientId);
  const signupHref = `/signup?plan=custom&price=${total.toFixed(2)}&days=${days}&currency=USD`;

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
            {canCheckoutInline ? (
              <div className="plan-paypal-wrap" style={{ minWidth: 220 }}>
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 40 }}
                  fundingSource={undefined}
                  // Force a remount when price/days change so the new amount
                  // is captured in the closure (PayPal caches createOrder).
                  forceReRender={[total, days]}
                  createOrder={async () => {
                    const res = await fetch(`${API_URL}/api/payments/paypal/create-order`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        planId: 'custom',
                        email: user.email,
                        priceUsd: total.toFixed(2),
                        durationDays: days,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.detail || 'Failed to create order');
                    return data.orderId;
                  }}
                  onApprove={async (data) => {
                    const res = await fetch(`${API_URL}/api/payments/paypal/capture-order`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderId: data.orderID,
                        planId: 'custom',
                        email: user.email,
                        priceUsd: total.toFixed(2),
                        durationDays: days,
                      }),
                    });
                    const result = await res.json();
                    if (res.ok) {
                      const updatedUser = {
                        ...user,
                        plan: result.plan,
                        subscription: result.subscription,
                      };
                      localStorage.setItem('user', JSON.stringify(updatedUser));
                      const pools = result.pools || {};
                      alert(
                        `Custom plan activated. ${days} days · ${pools.liz || '?'} Liz · ${pools.writing || '?'} essays · ${pools.speaking || '?'} speaking.`,
                      );
                      // If the user got bounced to /pricing mid-task, return
                      // them to that task instead of /dashboard.
                      window.location.href = resolvePostCheckoutDestination();
                    } else {
                      alert(result.detail || 'Payment capture failed');
                    }
                  }}
                />
              </div>
            ) : (
              <a href={signupHref} className="btn btn-primary btn-xl">
                {t('pricingV2SliderCtaButton', { days })}
                <ArrowRightIcon />
              </a>
            )}
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
