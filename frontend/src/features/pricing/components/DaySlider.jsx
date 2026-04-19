import React from 'react';
import ArrowRightIcon from './ArrowRightIcon';
import usePricingSlider from '../hooks/usePricingSlider';

const PRESET_CHIPS = [7, 14, 30, 60, 90, 180, 365];

export default function DaySlider() {
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
  } = usePricingSlider(30);

  return (
    <section style={{ paddingTop: 16 }}>
      <div className="container">
        <div className="slider-card">
          <div className="slider-head">
            <div className="slider-question">
              How many days until <span className="hl">your IELTS exam?</span>
            </div>
            <div className="price-display">
              <div className="days-readout">
                For <span className="n">{days}</span> days
              </div>
              <div className="price-main">
                <span className="cur">$</span>
                <span>{totalText}</span>
              </div>
              <div className="per-day">
                That's <b>{perDayText}</b>/day · pay once
              </div>
              <div className="save-badge">
                <span className="spark"></span>
                Save <span>{savingsPct}%</span> vs leading AI IELTS platforms
              </div>
            </div>
          </div>

          <div className="slider-wrap">
            <div className="slider-scale">
              <span>3</span><span>30</span><span>90</span><span>180</span><span>365</span>
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
                aria-label="Days until exam"
                onChange={(e) => setDays(parseInt(e.target.value, 10))}
              />
            </div>
            <div className="slider-preset-row">
              <span className="slider-preset-label">Quick picks</span>
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
              <b>Pay once</b>, practice unlimited for <b>{days}</b> days. No
              auto-renewal.
            </div>
            <a href="/signup" className="btn btn-primary btn-xl">
              Start <span>{days}</span>-day pack
              <ArrowRightIcon />
            </a>
          </div>

          <div className="compare-strip">
            <span>Less than half the price of</span>
            <span className="name">leading AI IELTS platforms</span>
            <span className="theirs">${leadingText}</span>
            <span>→</span>
            <span className="ours">our pack ${totalText}</span>
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11.5,
              }}
            >
              same {days} days
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
