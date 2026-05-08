import React from 'react';
import BandLadder from './BandLadder';

const WEAK_SKILLS = [
  { id: 'listening', label: 'Listening' },
  { id: 'reading', label: 'Reading' },
  { id: 'writing', label: 'Writing' },
  { id: 'speaking', label: 'Speaking' },
];

export default function Step3CurrentLevel({
  direction,
  currentBand,
  onChange,
  weakSkills = [],
  onWeakSkillsChange,
}) {
  const toggleWeak = (id) => {
    if (!onWeakSkillsChange) return;
    if (weakSkills.includes(id)) {
      onWeakSkillsChange(weakSkills.filter((s) => s !== id));
    } else {
      onWeakSkillsChange([...weakSkills, id]);
    }
  };

  return (
    <section className={`step${direction === 'rev' ? ' rev' : ''}`}>
      <h1 className="step-title">
        Where are you <span className="ital">starting from?</span>
      </h1>
      <p className="step-sub">
        A rough honest guess is fine — your plan recalibrates after your first
        mock. Not sure? Take the quick test instead.
      </p>

      <div className="question-block">
        <div className="q-label">What's your current estimated band?</div>
        <div className="q-hint">
          Based on your last mock test or your own gut feeling. Totally
          skippable.
        </div>
        <BandLadder value={currentBand} onChange={onChange} />

        <div className="q-label" style={{ marginTop: 24 }}>
          Which skills feel weakest right now?
        </div>
        <div className="q-hint">
          Pick any that apply — Liz will prioritize these in your plan. Optional.
        </div>
        <div
          className="weak-skills-row"
          role="group"
          aria-label="Self-declared weak skills"
        >
          {WEAK_SKILLS.map((s) => {
            const selected = weakSkills.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                className={`weak-chip${selected ? ' selected' : ''}`}
                aria-pressed={selected}
                onClick={() => toggleWeak(s.id)}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="alt-card">
          <div className="ico">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a7 7 0 0 1-9.3 9.3L6.3 21a2.83 2.83 0 1 1-4-4l7.3-7.3a7 7 0 0 1 9.3-9.3l-3.8 3.8z" />
            </svg>
          </div>
          <div>
            <div className="t">Not sure? Take a 10-min level test.</div>
            <div className="s">
              Adaptive questions calibrate your band in under ten minutes. Free,
              no commitment.
            </div>
          </div>
          <a
            href="/comprehensive-level-test"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            Take level test →
          </a>
        </div>
      </div>
    </section>
  );
}
