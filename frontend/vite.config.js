// vite.config.js — Faz 2 (CRA/craco -> Vite migration, 2026-07-03).
// Goal: replicate the EXACT CRA + craco surface so NOT ONE source file
// changes (mirrors the Faz 1 "no import breakage" rule). What we reproduce:
//   - '@/*'                    -> src/*            (was craco resolve.alias)
//   - process.env.REACT_APP_*  -> build-time constants (was CRA inlining)
//   - process.env.NODE_ENV     -> 'production' | 'development'
//   - %REACT_APP_*% / %PUBLIC_URL% in index.html   (was CRA HTML templating)
//   - output to build/         (keeps vercel.json outputDirectory untouched)
// See [[project-roadmap-2026-07]] Faz 2 and docs/SPLIT_MAP.md.
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// The complete set of REACT_APP_* vars the app reads (grep-verified against
// src). CRA inlined whichever were set (via .env OR the shell — Vercel injects
// prod values through the shell) and left the rest as the empty string. We
// reproduce that: value if present, '' otherwise.
const REACT_APP_VARS = [
  'REACT_APP_API_URL',
  'REACT_APP_BACKEND_URL',
  'REACT_APP_PAYPAL_CLIENT_ID',
  'REACT_APP_PAYPAL_MONTHLY_PLAN_ID',
  'REACT_APP_PAYPAL_WEEKLY_PLAN_ID',
];

export default defineConfig(({ mode }) => {
  // loadEnv(mode, dir, 'REACT_APP_') merges .env* files AND any REACT_APP_*
  // already present in process.env (the shell). The shell path is exactly how
  // Vercel supplies prod values at build time — identical to CRA's behavior.
  const env = loadEnv(mode, __dirname, 'REACT_APP_');

  // Build-time constant substitution. Same semantics as CRA: these become
  // literal strings in the bundle. We enumerate the exact keys the code reads
  // so no stray `process.env.X` survives to throw "process is not defined".
  const define = {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  };
  for (const key of REACT_APP_VARS) {
    define[`process.env.${key}`] = JSON.stringify(env[key] ?? '');
  }

  // Reproduce CRA's index.html templating. Runs order:'pre' so it wins over
  // Vite's own %VAR% handling and, crucially, substitutes '' for unset vars
  // (CRA did the same) — so no literal %TOKEN% ever ships to the browser.
  const htmlCraEnvReplace = {
    name: 'html-cra-env-replace',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace(/%PUBLIC_URL%/g, '') // root deploy: CRA resolved this to ''
          .replace(/%(REACT_APP_[A-Z0-9_]+)%/g, (_, k) => env[k] ?? '');
      },
    },
  };

  return {
    plugins: [react(), htmlCraEnvReplace],
    resolve: {
      // Mirror craco exactly. rollup-alias only matches '@' followed by '/',
      // so '@radix-ui/...' etc. are NOT rewritten (same as webpack did).
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    define,
    // Keep the CRA prefix so existing .env files and Vercel env vars work
    // unchanged; VITE_ kept available for anything added later.
    envPrefix: ['REACT_APP_', 'VITE_'],
    build: {
      outDir: 'build', // CRA's dir -> vercel.json { outputDirectory } untouched
      sourcemap: false, // matches the old GENERATE_SOURCEMAP=false
      chunkSizeWarningLimit: 2000, // this is a large SPA; silence noise
    },
    // The source is JSX-in-.js (CRA style) plus some .jsx. esbuild's default
    // '.js' loader can't parse JSX, and setting a custom esbuild.include
    // REPLACES Vite's default (which had covered .jsx/.tsx) — so our include
    // must cover .js AND .jsx/.ts/.tsx. jsx:'automatic' = React 19 runtime, so
    // no per-file `import React` is needed. Anchored to the absolute src path
    // so node_modules deps are never touched.
    esbuild: {
      loader: 'jsx',
      include: new RegExp(
        '^' + path.resolve(__dirname, 'src').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/.*\\.[jt]sx?$',
      ),
      exclude: [],
      jsx: 'automatic',
    },
    // The dependency scanner (esbuild) also needs .js treated as JSX so it
    // doesn't throw while crawling the import graph.
    optimizeDeps: {
      esbuildOptions: { loader: { '.js': 'jsx' } },
    },
    server: { port: 3000, host: true }, // CRA's default dev port
    preview: { port: 3000 },
    // Vitest — both existing test files are DOM-free (a Babel parse smoke test
    // and a pure-function unit test), so the fast 'node' env is enough; no jsdom.
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.{test,spec}.{js,jsx}'],
    },
  };
});
