import React, { useState } from 'react';
import { MONTHS, DOW } from '../constants';

const TODAY = new Date();

export default function Calendar({ selected, onSelect }) {
  const [view, setView] = useState(
    () => new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 1),
  );

  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const total = startDay + daysInMonth;
  const trailing = (7 - (total % 7)) % 7;

  const goPrev = () => {
    const minView = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
    const cand = new Date(year, month - 1, 1);
    if (cand >= minView) setView(cand);
  };
  const goNext = () => setView(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = startDay - 1; i >= 0; i -= 1) {
    cells.push(
      <button key={`lead-${i}`} className="cal-day dim" disabled type="button">
        {prevMonthDays - i}
      </button>,
    );
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dt = new Date(year, month, d);
    const isToday = dt.toDateString() === TODAY.toDateString();
    const isSelected =
      selected instanceof Date && dt.toDateString() === selected.toDateString();
    const isPast = dt < TODAY && !isToday;
    const classes = ['cal-day'];
    if (isToday) classes.push('today');
    if (isSelected) classes.push('selected');
    if (isPast) classes.push('dim');
    cells.push(
      <button
        key={`d-${d}`}
        type="button"
        className={classes.join(' ')}
        disabled={isPast}
        onClick={() => onSelect(dt)}
      >
        {d}
      </button>,
    );
  }
  for (let i = 1; i <= trailing; i += 1) {
    cells.push(
      <button key={`trail-${i}`} className="cal-day dim" disabled type="button">
        {i}
      </button>,
    );
  }

  return (
    <div className="date-panel">
      <div className="cal-head">
        <div className="m-name">
          {MONTHS[month]} {year}
        </div>
        <div className="cal-nav">
          <button type="button" onClick={goPrev} aria-label="Previous month">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button type="button" onClick={goNext} aria-label="Next month">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="cal-grid">
        {DOW.map((d, i) => (
          <div key={`dow-${i}`} className="cal-dow">{d}</div>
        ))}
        {cells}
      </div>
    </div>
  );
}

export { TODAY };
