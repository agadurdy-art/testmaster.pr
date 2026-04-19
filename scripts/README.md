# scripts/

One-off utility scripts. Not part of the runtime.

## translate-i18n.mjs

Auto-translates empty language blocks in `frontend/src/lib/i18n.js` using Claude
Sonnet via the Anthropic API.

### Usage

```bash
export ANTHROPIC_API_KEY=sk-ant-...
node scripts/translate-i18n.mjs
```

Options:

| Env           | Default             | Purpose                                      |
| ------------- | ------------------- | -------------------------------------------- |
| `LANGS`       | all empty blocks    | Comma list, e.g. `LANGS=ar,ko,th`            |
| `DRY=1`       | off                 | Preview without writing the file             |
| `FORCE=1`     | off                 | Retranslate even if a block is already full  |
| `MODEL`       | `claude-sonnet-4-6` | Override model                               |

### What it does

1. Parses the EN dictionary block from `i18n.js` (source of truth).
2. For each target language, batches ~80 keys at a time, asks Sonnet for a
   JSON object of translations with hard rules (keep IELTS terms + product
   name + placeholders in English, preserve punctuation/emoji).
3. Rewrites the corresponding `xx: { … }` block in `i18n.js`.

### Cost estimate

1,100 keys × 9 languages ≈ 9,900 translations. At current Sonnet pricing
this runs for roughly US$2–4 total. Single-pass; cached by the script's
skip-non-empty behavior so re-running is cheap.

### Post-run checklist

- `git diff frontend/src/lib/i18n.js` — sanity check quoting/escapes
- `yarn --cwd frontend lint` and `yarn --cwd frontend build` — catch syntax errors
- Spot check 2–3 keys per language against a speaker or DeepL
- Commit
