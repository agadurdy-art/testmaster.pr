/**
 * Adapter: legacy speaking-result shapes → D7 ResultsState canonical shape.
 *
 * Why: during the unified-speaking rollout we have to render results that
 * came from four different endpoints, plus historical attempts already
 * persisted on the user's profile:
 *
 *   - new  POST /api/speaking/evaluate          (canonical SpeakingEvaluationResult)
 *   - old  POST /api/speaking/score              (flat scores object)
 *   - old  POST /api/speaking/submit             (multi-response feedback dict)
 *   - old  POST /api/cambridge/speaking/evaluate (per-part dict)
 *   - old  POST /api/speaking-practice/evaluate  (mirrors submit shape)
 *   - persisted attempts on Results.js: result.feedback.speaking_feedback
 *
 * D7's <ResultsState data={...} /> reads:
 *   data.scores           = { overall, target, fc, lr, gra, pr }
 *   data.fluency          = { wpm, pauses, fillers, unique, duration, words }
 *   data.transcript_tokens = [{ t, pron?, ipa?, note? }]
 *   data.liz_note         = string
 *   data.criteria?        = optional CriteriaBreakdown for the rubric drawer
 *
 * The adapter never throws on unknown shapes — it falls back to the D7
 * fixture so the page never crashes. Always returns a *new* object so the
 * caller can mutate freely.
 */

import {
  SCORES as FIXTURE_SCORES,
  FLUENCY as FIXTURE_FLUENCY,
  TRANSCRIPT_TOKENS as FIXTURE_TOKENS,
} from '../constants';

const NUMERIC_RE = /^-?\d+(?:\.\d+)?$/;

function toBand(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && NUMERIC_RE.test(value.trim())) {
    return Number(value.trim());
  }
  if (typeof value === 'object') {
    return toBand(value.band ?? value.score ?? value.value);
  }
  return null;
}

function toFeedback(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.feedback || value.explanation || value.notes || '';
  }
  // Numbers and booleans are band scores or flags, not feedback prose.
  return '';
}

function avg(nums) {
  const xs = nums.filter((n) => typeof n === 'number' && Number.isFinite(n));
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function roundHalf(n) {
  if (n === null || n === undefined) return null;
  return Math.round(n * 2) / 2;
}

function clampBand(n) {
  if (n === null || n === undefined) return null;
  return Math.max(0, Math.min(9, n));
}

function durationLabel(seconds) {
  if (!seconds || !Number.isFinite(seconds)) return '—';
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s} s`;
  return `${m} min ${String(s).padStart(2, '0')} s`;
}

function tokensFromTranscript(transcript) {
  if (!transcript || typeof transcript !== 'string') return null;
  return [{ t: transcript }];
}

// --- Source detection -------------------------------------------------------

function isCanonicalShape(raw) {
  return Boolean(
    raw &&
      raw.scores &&
      typeof raw.scores === 'object' &&
      Array.isArray(raw.transcript_tokens),
  );
}

function isLegacyMultiResponseShape(raw) {
  // Persisted attempts: result.feedback.speaking_feedback = { [k]: { band_score, ... } }
  // OR raw response itself with that shape inline.
  if (raw && raw.feedback && raw.feedback.speaking_feedback) return true;
  if (raw && raw.speaking_feedback && typeof raw.speaking_feedback === 'object') return true;
  return false;
}

function isLegacyFlatShape(raw) {
  if (!raw) return false;
  const hasBand = 'band_score' in raw || 'overall_band' in raw || 'band' in raw;
  if (!hasBand) return false;
  // /api/speaking/score-style: top-level { band_score, fluency_coherence, ... }
  // /api/speaking/submit-style: { overall_band, criteria: {fluency_coherence, ...} }
  const topCrit =
    'fluency_coherence' in raw ||
    'lexical_resource' in raw ||
    'grammatical_accuracy' in raw ||
    'pronunciation' in raw;
  const nestedCrit =
    raw.criteria &&
    typeof raw.criteria === 'object' &&
    ('fluency_coherence' in raw.criteria ||
      'lexical_resource' in raw.criteria ||
      'grammatical_accuracy' in raw.criteria ||
      'grammatical_range' in raw.criteria ||
      'pronunciation' in raw.criteria);
  return Boolean(topCrit || nestedCrit);
}

// --- Shape converters -------------------------------------------------------

/** Build the canonical scores block from a per-criterion source. */
function buildScores({ fc, lr, gra, pr, overall, target }) {
  const overallVal = clampBand(roundHalf(overall ?? avg([fc, lr, gra, pr])));
  return {
    overall: overallVal ?? FIXTURE_SCORES.overall,
    target: clampBand(target ?? FIXTURE_SCORES.target) ?? FIXTURE_SCORES.target,
    fc: clampBand(roundHalf(fc)) ?? FIXTURE_SCORES.fc,
    lr: clampBand(roundHalf(lr)) ?? FIXTURE_SCORES.lr,
    gra: clampBand(roundHalf(gra)) ?? FIXTURE_SCORES.gra,
    pr: clampBand(roundHalf(pr)) ?? FIXTURE_SCORES.pr,
  };
}

function fromLegacyFlat(raw, ctx) {
  // The criterion bands may live at the top level (/api/speaking/score) OR
  // nested inside raw.criteria (/api/speaking/submit QB response).
  const crit = (raw.criteria && typeof raw.criteria === 'object') ? raw.criteria : {};
  const fc = toBand(raw.fluency_coherence ?? crit.fluency_coherence);
  const lr = toBand(raw.lexical_resource ?? crit.lexical_resource);
  const gra = toBand(
    raw.grammatical_accuracy ??
      raw.grammatical_range ??
      crit.grammatical_accuracy ??
      crit.grammatical_range,
  );
  const pr = toBand(raw.pronunciation ?? crit.pronunciation);
  const overall = toBand(raw.band_score) ?? toBand(raw.overall_band) ?? toBand(raw.band);

  const scores = buildScores({
    fc,
    lr,
    gra,
    pr,
    overall,
    target: ctx?.targetBand,
  });

  const metrics = raw.metrics || {};
  const fluency = {
    wpm: raw.wpm ?? raw.speaking_rate ?? metrics.words_per_minute ?? 0,
    pauses: raw.pauses ?? '—',
    fillers: raw.fillers ?? '—',
    unique: raw.unique_ratio ?? raw.unique ?? '—',
    duration:
      raw.duration_label ||
      durationLabel(raw.duration_seconds || metrics.total_duration || ctx?.durationSeconds),
    words: raw.word_count ?? raw.words ?? metrics.total_words ?? 0,
  };

  // Liz note prefers explicit copy → mentor narrative → strengths/weaknesses summary.
  const wkSummary = Array.isArray(raw.weaknesses) && raw.weaknesses.length
    ? `Focus on: ${raw.weaknesses.slice(0, 3).join('; ')}.`
    : '';
  const lizNote =
    raw.liz_note ||
    raw.mentor_notes ||
    raw.overall_feedback ||
    (typeof raw.feedback === 'string' ? raw.feedback : '') ||
    toFeedback(raw.pronunciation ?? crit.pronunciation) ||
    wkSummary ||
    'Result loaded from a legacy evaluation. Run a fresh recording for full pronunciation analysis.';

  return {
    scores,
    fluency,
    transcript_tokens: tokensFromTranscript(raw.transcript) || FIXTURE_TOKENS,
    liz_note: lizNote,
    criteria: {
      fc: { band: scores.fc, explanation: toFeedback(raw.fluency_coherence ?? crit.fluency_coherence) || '—' },
      lr: { band: scores.lr, explanation: toFeedback(raw.lexical_resource ?? crit.lexical_resource) || '—' },
      gra: {
        band: scores.gra,
        explanation:
          toFeedback(
            raw.grammatical_accuracy ??
              raw.grammatical_range ??
              crit.grammatical_accuracy ??
              crit.grammatical_range,
          ) || '—',
      },
      pr: { band: scores.pr, explanation: toFeedback(raw.pronunciation ?? crit.pronunciation) || '—' },
    },
    _source: 'legacy_flat',
  };
}

function fromLegacyMultiResponse(raw, ctx) {
  const responses =
    raw?.feedback?.speaking_feedback ||
    raw?.speaking_feedback ||
    {};
  const entries = Object.values(responses).filter((r) => r && typeof r === 'object');

  if (entries.length === 0) return null;

  const fcs = entries.map((r) => toBand(r.fluency_coherence)).filter((n) => n !== null);
  const lrs = entries.map((r) => toBand(r.lexical_resource)).filter((n) => n !== null);
  const gras = entries.map((r) => toBand(r.grammatical_accuracy)).filter((n) => n !== null);
  const prs = entries.map((r) => toBand(r.pronunciation)).filter((n) => n !== null);
  const overalls = entries
    .map((r) => toBand(r.band_score) ?? toBand(r.overall_band))
    .filter((n) => n !== null);

  const scores = buildScores({
    fc: avg(fcs),
    lr: avg(lrs),
    gra: avg(gras),
    pr: avg(prs),
    overall: overalls.length ? avg(overalls) : null,
    target: ctx?.targetBand ?? raw?.target_band,
  });

  // Concatenate per-response transcripts as separate tokens with a header.
  const tokens = [];
  entries.forEach((r, i) => {
    if (i > 0) tokens.push({ t: '\n\n' });
    if (r.question_text || r.question) {
      tokens.push({ t: `Q: ${r.question_text || r.question}\n` });
    }
    if (r.transcript) {
      tokens.push({ t: r.transcript });
    } else if (r.user_response) {
      tokens.push({ t: r.user_response });
    }
  });

  const lizNote =
    raw.liz_note ||
    raw?.feedback?.overall_feedback ||
    entries.find((r) => r.overall_feedback)?.overall_feedback ||
    'Loaded from a previous attempt — re-record for fresh pronunciation analysis.';

  return {
    scores,
    fluency: {
      wpm: raw?.feedback?.wpm ?? 0,
      pauses: '—',
      fillers: '—',
      unique: '—',
      duration: durationLabel(raw?.duration_seconds ?? ctx?.durationSeconds),
      words: raw?.feedback?.word_count ?? 0,
    },
    transcript_tokens: tokens.length ? tokens : FIXTURE_TOKENS,
    liz_note: lizNote,
    criteria: {
      fc: {
        band: scores.fc,
        explanation:
          entries.map((r) => toFeedback(r.fluency_coherence)).filter(Boolean).join(' • ') || '—',
      },
      lr: {
        band: scores.lr,
        explanation:
          entries.map((r) => toFeedback(r.lexical_resource)).filter(Boolean).join(' • ') || '—',
      },
      gra: {
        band: scores.gra,
        explanation:
          entries.map((r) => toFeedback(r.grammatical_accuracy)).filter(Boolean).join(' • ') || '—',
      },
      pr: {
        band: scores.pr,
        explanation:
          entries.map((r) => toFeedback(r.pronunciation)).filter(Boolean).join(' • ') || '—',
      },
    },
    _source: 'legacy_multi',
  };
}

function fromCanonical(raw) {
  // Pass-through with a defensive copy so callers can mutate without
  // poisoning the SWR cache or whatever fed the data in.
  return {
    scores: { ...raw.scores },
    fluency: raw.fluency ? { ...raw.fluency } : { ...FIXTURE_FLUENCY },
    transcript_tokens: Array.isArray(raw.transcript_tokens)
      ? raw.transcript_tokens.map((tok) => ({ ...tok }))
      : FIXTURE_TOKENS,
    live_transcript_words: Array.isArray(raw.live_transcript_words)
      ? [...raw.live_transcript_words]
      : [],
    liz_note: raw.liz_note || '',
    criteria: raw.criteria || null,
    feedback_language: raw.feedback_language || 'en',
    _source: 'canonical',
  };
}

// --- Public API -------------------------------------------------------------

/**
 * Convert any speaking-evaluation result we might encounter into the
 * shape D7 <ResultsState /> understands.
 *
 * @param {unknown} raw       The result payload from any of the speaking
 *                            endpoints, or a persisted attempt record.
 * @param {object} [ctx]      Optional context to fill gaps the legacy
 *                            payload didn't carry.
 * @param {number} [ctx.targetBand]
 * @param {number} [ctx.durationSeconds]
 * @returns {object|null}     Canonical shape, or null if `raw` was empty.
 */
export function adaptSpeakingResult(raw, ctx = {}) {
  if (!raw || typeof raw !== 'object') return null;

  if (isCanonicalShape(raw)) return fromCanonical(raw);
  if (isLegacyMultiResponseShape(raw)) {
    const out = fromLegacyMultiResponse(raw, ctx);
    if (out) return out;
  }
  if (isLegacyFlatShape(raw)) return fromLegacyFlat(raw, ctx);

  // Last-ditch: scrape any shallow score-like fields. Better to render
  // *something* than crash the page.
  if ('overall_band' in raw || 'band_score' in raw || 'band' in raw) {
    return fromLegacyFlat(raw, ctx);
  }

  return null;
}

export default adaptSpeakingResult;
