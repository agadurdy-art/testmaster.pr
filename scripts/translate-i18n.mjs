#!/usr/bin/env node
/**
 * Auto-translate the i18n dictionary in frontend/src/lib/i18n.js.
 *
 * What it does:
 *   1. Parses the EN dictionary block out of i18n.js (source of truth).
 *   2. For each target language with an empty `xx: {}` placeholder, asks Claude
 *      Sonnet to translate all keys.
 *   3. Writes the result back into i18n.js in place of the placeholder.
 *
 * Usage:
 *     export ANTHROPIC_API_KEY=sk-ant-...
 *     node scripts/translate-i18n.mjs
 *
 *   Optional:
 *     LANGS=ar,ko,th node scripts/translate-i18n.mjs   # only these
 *     DRY=1 node scripts/translate-i18n.mjs            # don't write file
 *     MERGE=1 node scripts/translate-i18n.mjs          # only fill missing keys
 *     FORCE=1 node scripts/translate-i18n.mjs          # re-translate everything
 *     MODEL=claude-sonnet-4-6 node scripts/translate-i18n.mjs
 *
 * Notes:
 *   - Safe to re-run — skips languages whose block is non-empty unless FORCE=1.
 *   - IELTS terms (band descriptors, "Task Response", "Coherence & Cohesion",
 *     "Lexical Resource", "Grammatical Range & Accuracy", "Task 1"/"Task 2",
 *     "Band 6.5") stay in English, per Liz pedagogy. Product name "IELTS Ace"
 *     and "Liz" stay unchanged.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const I18N_PATH = path.resolve(__dirname, '..', 'frontend', 'src', 'lib', 'i18n.js');
const MODEL = process.env.MODEL || 'claude-sonnet-4-5-20250929';
const MAX_RETRIES = 3;
const BATCH_SIZE = 80;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const DRY = process.env.DRY === '1';
const FORCE = process.env.FORCE === '1';
// MERGE=1 → only translate keys missing from the target language. Existing
// translations are preserved verbatim and merged with the new keys, in EN
// order. Useful after a sprint adds new strings without touching the locales.
const MERGE = process.env.MERGE === '1';

// code -> human-readable name for the prompt
const LANG_NAMES = {
  mandarin: 'Mandarin Chinese (Simplified, 简体中文)',
  ar: 'Arabic (Modern Standard Arabic, العربية)',
  ko: 'Korean (한국어)',
  th: 'Thai (ภาษาไทย)',
  ja: 'Japanese (日本語)',
  es: 'Spanish (neutral Latin American, Español)',
  pt: 'Portuguese (Brazilian, Português do Brasil)',
  ru: 'Russian (Русский)',
  id: 'Indonesian (Bahasa Indonesia)',
};

if (!API_KEY && !DRY) {
  console.error('ANTHROPIC_API_KEY is required (or set DRY=1 to preview).');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. Parse i18n.js — extract EN dict + locate placeholder blocks
// ---------------------------------------------------------------------------

const source = await fs.readFile(I18N_PATH, 'utf8');

function extractBlockFrom(src, langKey) {
  // Returns { start, end, body } covering the full `  langKey: { ... },` block.
  // `start` points at the two-space indent; `end` is one past the trailing
  // comma (if present). `body` is between braces, exclusive.
  const marker = `  ${langKey}: {`;
  const start = src.indexOf(marker);
  if (start === -1) throw new Error(`Block not found: ${langKey}`);
  let depth = 0;
  let i = src.indexOf('{', start);
  const braceStart = i;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        let end = i + 1;
        if (src[end] === ',') end += 1;
        return { start, end, body: src.slice(braceStart + 1, i) };
      }
    }
  }
  throw new Error(`Unbalanced braces for ${langKey}`);
}

function extractBlock(langKey) {
  return extractBlockFrom(source, langKey);
}

function parseDictBody(body) {
  // Accepts: `    keyName: 'string value',`  OR `    keyName: "string",`
  // Handles escaped quotes inside the string. Comment lines (`    //`) ignored.
  const entries = [];
  const lines = body.split('\n');
  let buffer = '';
  for (const raw of lines) {
    const line = buffer ? buffer + '\n' + raw : raw;
    // skip blank / comment / section divider
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) { buffer = ''; continue; }
    // try a simple single-line key: 'value', pattern
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*):\s*(['"])((?:\\.|(?!\2).)*)\2,?\s*$/);
    if (m) {
      const [, key, , value] = m;
      entries.push([key, unescapeJs(value)]);
      buffer = '';
      continue;
    }
    // keep accumulating for multi-line strings (rare)
    buffer = line;
  }
  return entries;
}

function unescapeJs(s) {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function escapeJsSingle(s) {
  // Use single-quoted JS string: escape backslash + single quote only.
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatDictBlock(langKey, entries) {
  const lines = [`  ${langKey}: {`];
  for (const [key, value] of entries) {
    lines.push(`    ${key}: '${escapeJsSingle(value)}',`);
  }
  lines.push('  },');
  return lines.join('\n');
}

const enBlock = extractBlock('en');
const enEntries = parseDictBody(enBlock.body);
console.log(`Parsed ${enEntries.length} EN keys.`);

// ---------------------------------------------------------------------------
// 2. Determine target languages to fill
// ---------------------------------------------------------------------------

const envLangs = (process.env.LANGS || '').split(',').map(s => s.trim()).filter(Boolean);
const candidates = envLangs.length ? envLangs : Object.keys(LANG_NAMES);

const targets = [];
for (const lang of candidates) {
  if (!LANG_NAMES[lang]) {
    console.warn(`Skip unknown language: ${lang}`);
    continue;
  }
  const block = extractBlock(lang);
  const existing = parseDictBody(block.body);
  // MERGE mode: skip if every EN key is already translated; otherwise queue
  // only the missing keys for translation and keep existing ones.
  if (MERGE) {
    const have = new Set(existing.map(([k]) => k));
    const missing = enEntries.filter(([k]) => !have.has(k));
    if (missing.length === 0) {
      console.log(`Skip ${lang} (all ${enEntries.length} keys already present).`);
      continue;
    }
    console.log(`Queue ${lang}: ${missing.length} missing key${missing.length === 1 ? '' : 's'} (of ${enEntries.length}).`);
    targets.push({ lang, block, existing, missing });
    continue;
  }
  if (existing.length > 0 && !FORCE) {
    console.log(`Skip ${lang} (already has ${existing.length} keys; set FORCE=1 to overwrite, or MERGE=1 to fill gaps).`);
    continue;
  }
  targets.push({ lang, block, existing: [], missing: enEntries });
}

if (!targets.length) {
  console.log('Nothing to translate.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 3. Call Claude Sonnet per language, batched
// ---------------------------------------------------------------------------

async function translateBatch(lang, batch) {
  const langName = LANG_NAMES[lang];
  const systemPrompt = [
    'You are a professional IELTS-domain localizer.',
    `Translate the following UI strings from English into ${langName}.`,
    '',
    'HARD RULES:',
    '1. Keep the product name "IELTS Ace" and the coach name "Liz" unchanged.',
    '2. Keep IELTS terminology in English: band descriptors, Task 1, Task 2, ' +
      'Task Response, Task Achievement, Coherence & Cohesion, Lexical Resource, ' +
      'Grammatical Range & Accuracy, Speaking Parts 1/2/3, CEFR labels (A2/B1/B2/C1).',
    '3. Numbers, punctuation, and emoji stay as-is.',
    '4. Preserve placeholders like {name}, {{count}}, {0}, %s, and HTML tags.',
    '5. Do NOT add or remove keys. Output the SAME keys you receive.',
    '6. Respond with ONLY a valid JSON object: {"key": "translation", ...}.',
    '   No markdown fences, no commentary.',
  ].join('\n');

  const userPayload = Object.fromEntries(batch);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        { role: 'user', content: JSON.stringify(userPayload) },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text?.trim() ?? '';
  // Strip optional code fences defensively.
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error('Raw response:', text.slice(0, 500));
    throw new Error(`JSON parse failed for ${lang}: ${e.message}`);
  }
  const out = [];
  for (const [key] of batch) {
    if (typeof parsed[key] !== 'string') {
      throw new Error(`Missing key in ${lang} response: ${key}`);
    }
    out.push([key, parsed[key]]);
  }
  return out;
}

const PERMANENT_ERROR_MARKERS = [
  'budget', 'insufficient', 'quota', 'unauthorized', 'forbidden',
  'invalid api key', '401', '402', '403',
];

function isPermanentError(err) {
  const msg = String(err?.message ?? err).toLowerCase();
  return PERMANENT_ERROR_MARKERS.some(m => msg.includes(m));
}

async function translateBatchWithRetry(lang, batch) {
  let delayMs = 2000;
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await translateBatch(lang, batch);
    } catch (err) {
      lastErr = err;
      if (isPermanentError(err)) throw err;
      if (attempt === MAX_RETRIES) break;
      console.log(`\n  retry ${attempt}/${MAX_RETRIES - 1} after ${delayMs / 1000}s: ${err.message ?? err}`);
      await new Promise(r => setTimeout(r, delayMs));
      delayMs *= 2;
    }
  }
  throw lastErr;
}

async function translateAll(lang, source = enEntries) {
  const batches = [];
  for (let i = 0; i < source.length; i += BATCH_SIZE) {
    batches.push(source.slice(i, i + BATCH_SIZE));
  }
  console.log(`[${lang}] ${source.length} keys in ${batches.length} batches…`);
  const all = [];
  for (let b = 0; b < batches.length; b++) {
    process.stdout.write(`  batch ${b + 1}/${batches.length} `);
    const start = Date.now();
    const part = await translateBatchWithRetry(lang, batches[b]);
    all.push(...part);
    console.log(`(${Math.round((Date.now() - start) / 1000)}s)`);
  }
  return all;
}

// ---------------------------------------------------------------------------
// 4. Rewrite file — replace placeholder blocks with generated dicts
// ---------------------------------------------------------------------------

let mutated = source;
const completed = [];
const failed = [];
for (const { lang, existing, missing } of targets) {
  if (DRY) {
    console.log(`\n[DRY] would translate ${lang} (${missing.length} key${missing.length === 1 ? '' : 's'}).`);
    continue;
  }
  let translated;
  try {
    translated = await translateAll(lang, missing);
  } catch (err) {
    console.log(`[${lang}] ✗ ${err.message ?? err}`);
    failed.push([lang, String(err.message ?? err)]);
    if (isPermanentError(err)) {
      console.log('Permanent error — stopping further languages.');
      break;
    }
    continue;
  }
  // Build the final entries list:
  //   - MERGE / first-fill: union of existing + freshly translated, ordered
  //     by EN to keep the file diff readable.
  //   - FORCE: `existing` is already empty here because translateAll returned
  //     the full set, so we use only `translated`.
  const map = new Map([...(existing || []), ...translated]);
  const finalEntries = enEntries
    .filter(([k]) => map.has(k))
    .map(([k]) => [k, map.get(k)]);
  // Re-locate block on the mutated buffer — offsets shift after each rewrite.
  const block = extractBlockFrom(mutated, lang);
  const replacement = formatDictBlock(lang, finalEntries);
  mutated = mutated.slice(0, block.start) + replacement + mutated.slice(block.end);
  // Incremental write: persist after each language so a later failure
  // doesn't throw away progress already made.
  await fs.writeFile(I18N_PATH, mutated, 'utf8');
  completed.push(lang);
  console.log(`[${lang}] ✓ ${translated.length} new + ${(existing || []).length} kept = ${finalEntries.length} total written.`);
}

if (DRY) {
  console.log('\nDRY run — no file changes.');
} else {
  console.log(`\nDone. Completed: ${completed.length ? completed.join(', ') : '∅'}`);
  if (failed.length) {
    console.log('Failed:');
    for (const [lang, msg] of failed) console.log(`  - ${lang}: ${msg}`);
  }
  console.log(`File: ${I18N_PATH}`);
}
