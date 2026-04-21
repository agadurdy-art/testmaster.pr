import { useCallback, useMemo, useState } from 'react';

/**
 * Tiered per-day pricing — the longer you buy, the cheaper per day.
 * Kept under half of leading AI IELTS platforms (~$3/day) at every tier.
 */
export function priceFor(days) {
  let perDayRate;
  if (days <= 7) perDayRate = 1.20;
  else if (days <= 14) perDayRate = 0.85;
  else if (days <= 30) perDayRate = 0.50;
  else if (days <= 60) perDayRate = 0.42;
  else if (days <= 90) perDayRate = 0.38;
  else if (days <= 180) perDayRate = 0.32;
  else perDayRate = 0.28;

  let total = Math.round(days * perDayRate * 100) / 100;
  // Psychological pricing — .99 endings for whole dollars
  const whole = Math.floor(total);
  const frac = total - whole;
  if (frac < 0.05) total = whole - 0.01;
  return { total, perDay: total / days };
}

const MIN_DAYS = 3;
const MAX_DAYS = 365;
const LEADING_PER_DAY = 3; // Industry benchmark

export default function usePricingSlider(initialDays = 30) {
  const [days, setDaysRaw] = useState(initialDays);

  const setDays = useCallback((d) => {
    const clamped = Math.max(MIN_DAYS, Math.min(MAX_DAYS, d | 0));
    setDaysRaw(clamped);
  }, []);

  const computed = useMemo(() => {
    const { total, perDay } = priceFor(days);
    const leadingPrice = days * LEADING_PER_DAY;
    const savings = leadingPrice - total;
    const savingsPct = Math.round((savings / leadingPrice) * 100);
    // Bar fill must match the native <input type="range"> thumb position,
    // which is linear. Using a log scale here (old behavior) desynced the
    // fill from the thumb — thumb at 30 with fill reaching ~170.
    const fillPct = Math.min(
      100,
      Math.max(0, ((days - MIN_DAYS) / (MAX_DAYS - MIN_DAYS)) * 100),
    );
    return {
      total,
      totalText: total.toFixed(2),
      perDay,
      perDayText: `$${perDay.toFixed(2)}`,
      leadingPrice,
      leadingText: leadingPrice.toFixed(0),
      savingsPct,
      fillPct,
    };
  }, [days]);

  return { days, setDays, ...computed, MIN_DAYS, MAX_DAYS };
}
