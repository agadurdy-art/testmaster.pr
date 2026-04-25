import React from 'react';
import { BANDS } from '../constants';

function tierClass(b) {
  if (b <= 5.5) return 'tier-starter';
  if (b <= 7.5) return 'tier-mid';
  return 'tier-high';
}

export default function BandLadder({ value, onChange, currentHint }) {
  return (
    <div className="ladder-wrap">
      <div className="ladder">
        {BANDS.map((b) => {
          const classes = ['rung', tierClass(b)];
          if (value === b) classes.push('selected');
          if (currentHint === b) classes.push('hint-current');
          return (
            <button
              key={b}
              type="button"
              className={classes.join(' ')}
              onClick={() => onChange(b)}
            >
              <div className="band-num">{b.toFixed(1)}</div>
              <div className="band-label"></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
