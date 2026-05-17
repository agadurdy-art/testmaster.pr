/**
 * Cumulative Race - Bigger timed quiz for review lessons
 * Same mechanic as WordRace but with longer timer and bigger word pool.
 * Item shape: { prompt, correct_emoji, options: [emoji, ...] }
 */

import React from 'react';
import WordRace from './WordRace';

const CumulativeRace = ({ items, onComplete, onSkip, timeLimit }) => {
  return (
    <WordRace
      items={items}
      onComplete={onComplete}
      onSkip={onSkip}
      timeLimit={timeLimit || 90}
    />
  );
};

export default CumulativeRace;
