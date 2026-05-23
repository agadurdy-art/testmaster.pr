import React from 'react';
import BandLadder from './BandLadder';
import Calendar, { TODAY } from './Calendar';
import { MONTHS, DAY_SHORT } from '../constants';

function DateSummary({ examDate }) {
  if (examDate === 'tbd') {
    return (
      <div className="date-summary">
        <div className="d-num">?</div>
        <div className="d-txt">
          <div className="m">Exam date to be decided</div>
          <div className="sub">
            Your plan will be paced for a 45-day build — we'll set a target date
            later
          </div>
        </div>
      </div>
    );
  }
  if (examDate instanceof Date) {
    const diff = Math.ceil((examDate - TODAY) / (1000 * 60 * 60 * 24));
    return (
      <div className="date-summary">
        <div className="d-num">{examDate.getDate()}</div>
        <div className="d-txt">
          <div className="m">
            {DAY_SHORT[examDate.getDay()]}, {MONTHS[examDate.getMonth()].slice(0, 3)}{' '}
            {examDate.getDate()}, {examDate.getFullYear()}
          </div>
          <div className="sub">
            {diff} days from today · Liz will build a{' '}
            {diff >= 45 ? '45-day ramp' : 'compressed'} plan
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="date-summary empty">
      <div className="d-num">—</div>
      <div className="d-txt">
        <div className="m">No date picked yet</div>
        <div className="sub">Liz will calculate your plan from here</div>
      </div>
    </div>
  );
}

export default function Step2TargetDate({
  direction,
  targetBand,
  examDate,
  onTargetChange,
  onDateChange,
}) {
  const tbdSelected = examDate === 'tbd';
  return (
    <section className={`step${direction === 'rev' ? ' rev' : ''}`}>
      <h1 className="step-title">
        Let's set your <span className="ital">target.</span>
      </h1>
      <p className="step-sub">
        Everything downstream — your study plan length, weekly drills, mock-test
        cadence — comes from these two numbers.
      </p>

      <div className="question-block">
        <div className="q-label">What band are you aiming for?</div>
        <div className="q-hint">
          Tap the band you'll need for your university, employer, or visa. Most
          applicants aim for 6.5 or 7.0.
        </div>
        <BandLadder value={targetBand} onChange={onTargetChange} />
      </div>

      <div className="question-block">
        <div className="q-label">When is your exam?</div>
        <div className="q-hint">
          Doesn't have to be exact — pick the closest date you're considering.
        </div>
        <div className="date-wrap">
          <div>
            <DateSummary examDate={examDate} />
            <div className="tbd-row">
              <button
                type="button"
                className={`chip${tbdSelected ? ' selected' : ''}`}
                onClick={() => onDateChange(tbdSelected ? null : 'tbd')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                I don't have a date yet
              </button>
              <a
                href="https://www.ielts.org/test-centres"
                target="_blank"
                rel="noopener noreferrer"
                className="chip"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Find a test center
              </a>
            </div>
          </div>

          <Calendar
            selected={examDate instanceof Date ? examDate : null}
            onSelect={onDateChange}
          />
        </div>
      </div>
    </section>
  );
}
