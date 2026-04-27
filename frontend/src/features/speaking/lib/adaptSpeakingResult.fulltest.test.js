/**
 * Unit tests for the Faz 2 fulltest branch in adaptSpeakingResult.
 * Verifies: shape detection, transcript token synthesis, fluency derivation,
 * criteria/parts pass-through, and the public API ordering.
 */
import { adaptSpeakingResult } from './adaptSpeakingResult';

const FULLTEST_FIXTURE = {
  scores: { overall: 7.5, target: 7.0, fc: 7.0, lr: 8.0, gra: 7.5, pr: 7.5 },
  criteria: {
    fc: { band: 7.0, explanation: 'Generally fluent.', strengths: [], weaknesses: [] },
    lr: { band: 8.0, explanation: 'Strong vocab.', strengths: [], weaknesses: [] },
    gra: { band: 7.5, explanation: 'Mostly accurate.', strengths: [], weaknesses: [] },
    pr: { band: 7.5, explanation: 'Clear pronunciation.', strengths: [], weaknesses: [] },
  },
  parts: [
    {
      part: 'part1',
      transcript: 'I live in a small apartment with my family.',
      duration_seconds: 60.0,
      indicative_band: 6.5,
      observation: 'Answers are clear and well-structured.',
    },
    {
      part: 'part2',
      transcript: 'I would like to talk about my high school English teacher.',
      duration_seconds: 120.0,
      indicative_band: 7.5,
      observation: 'Sustained and fluent.',
    },
    {
      part: 'part3',
      transcript: 'Influence works in subtle ways through the people we spend time with.',
      duration_seconds: 60.0,
      indicative_band: 7.5,
      observation: 'Sophisticated abstract reasoning.',
    },
  ],
  liz_note: 'Your vocabulary and ideas are genuinely impressive.',
  feedback_language: 'en',
};

describe('adaptSpeakingResult fulltest branch', () => {
  test('detects fulltest shape and tags _source', () => {
    const out = adaptSpeakingResult(FULLTEST_FIXTURE);
    expect(out).not.toBeNull();
    expect(out._source).toBe('fulltest');
  });

  test('synthesizes transcript tokens from parts', () => {
    const out = adaptSpeakingResult(FULLTEST_FIXTURE);
    expect(Array.isArray(out.transcript_tokens)).toBe(true);
    // 3 parts → 3 transcript tokens + 3 header tokens + 2 separator tokens = 8
    expect(out.transcript_tokens.length).toBeGreaterThan(3);
    const concat = out.transcript_tokens.map(t => t.t).join('');
    expect(concat).toContain('Part 1');
    expect(concat).toContain('Part 2');
    expect(concat).toContain('Part 3');
    expect(concat).toContain('I live in a small apartment');
    expect(concat).toContain('high school English teacher');
    expect(concat).toContain('Influence works in subtle ways');
  });

  test('derives fluency from concatenated transcripts', () => {
    const out = adaptSpeakingResult(FULLTEST_FIXTURE);
    expect(out.fluency.words).toBeGreaterThan(20);
    expect(out.fluency.wpm).toBeGreaterThan(0);
    // Total duration is 240s → "4 min 00 s"
    expect(out.fluency.duration).toMatch(/4 min/);
    // No Azure pron pass in holistic mode
    expect(out.fluency.pauses).toBe('—');
    expect(out.fluency.fillers).toBe('—');
  });

  test('passes through scores and criteria', () => {
    const out = adaptSpeakingResult(FULLTEST_FIXTURE);
    expect(out.scores).toEqual(FULLTEST_FIXTURE.scores);
    expect(out.criteria.fc.band).toBe(7.0);
    expect(out.criteria.lr.band).toBe(8.0);
    expect(out.criteria.gra.band).toBe(7.5);
    expect(out.criteria.pr.band).toBe(7.5);
  });

  test('exposes per-part insights for the FullTestResults card', () => {
    const out = adaptSpeakingResult(FULLTEST_FIXTURE);
    expect(out.parts).toHaveLength(3);
    expect(out.parts[0]).toEqual({
      part: 'part1',
      transcript: expect.any(String),
      duration_seconds: 60.0,
      indicative_band: 6.5,
      observation: 'Answers are clear and well-structured.',
    });
  });

  test('passes liz_note and feedback_language through', () => {
    const out = adaptSpeakingResult(FULLTEST_FIXTURE);
    expect(out.liz_note).toBe('Your vocabulary and ideas are genuinely impressive.');
    expect(out.feedback_language).toBe('en');
  });

  test('does not mutate the original input', () => {
    const original = JSON.parse(JSON.stringify(FULLTEST_FIXTURE));
    const out = adaptSpeakingResult(FULLTEST_FIXTURE);
    expect(FULLTEST_FIXTURE).toEqual(original);
    out.scores.overall = 0;
    expect(FULLTEST_FIXTURE.scores.overall).toBe(7.5);
  });

  test('canonical shape (with transcript_tokens) is preferred over fulltest', () => {
    // Defensive: if a payload happens to include both, canonical wins
    // because it's the more specific/feature-rich shape.
    const hybrid = {
      ...FULLTEST_FIXTURE,
      transcript_tokens: [{ t: 'canonical-token' }],
    };
    const out = adaptSpeakingResult(hybrid);
    expect(out._source).toBe('canonical');
  });
});
