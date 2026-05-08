import { useCallback, useState } from 'react';
import { useI18n } from '../../../lib/i18n';
import { LANGUAGES } from '../constants';

const PATH_STORAGE_KEY = 'testmaster_onboarding_path';

// Reads the initial path selection from (a) `?path=...` in the URL, (b) a
// hand-off value written to localStorage by the /signup bridge, or (c) null.
// Normalises "general_english" / "ge" aliases to the internal "general" value
// so Step1Path pre-selects correctly regardless of where the hint came from.
function readInitialPath() {
  if (typeof window === 'undefined') return null;
  let raw = null;
  try {
    const params = new URLSearchParams(window.location.search);
    raw = params.get('path');
  } catch (_) {
    raw = null;
  }
  if (!raw) {
    try {
      raw = window.localStorage.getItem(PATH_STORAGE_KEY);
    } catch (_) {
      raw = null;
    }
  }
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();
  if (v === 'ielts' || v === 'ielts_ace' || v === 'ielts-ace') return 'ielts';
  if (v === 'general' || v === 'general_english' || v === 'general-english' || v === 'ge') return 'general';
  return null;
}

const INITIAL_STATE = {
  step: 1,
  direction: 'fwd',
  path: null, // 'ielts' | 'general'
  targetBand: null,
  currentBand: null,
  examDate: null, // Date | 'tbd' | null
  language: null,
  // B3 — "Liz remembers your goals" — all optional, never block canContinue.
  // nativeLanguage shape mirrors `language` (LANGUAGES entry); motivation is a
  // free-text one-liner; weakSkills is a string[] of {listening|reading|writing|speaking}.
  nativeLanguage: null,
  motivation: '',
  weakSkills: [],
  name: null, // collected on Step 5; never hardcode a real name here — it leaks into the Dashboard for other users
};

function isStepComplete(state) {
  const n = state.step;
  if (n === 1) return !!state.path;
  if (n === 2) return !!state.targetBand && !!state.examDate;
  if (n === 3) return true; // optional
  if (n === 4) return !!state.language;
  return true;
}

export default function useOnboardingState() {
  const { t } = useI18n();
  const [state, setState] = useState(() => {
    const initialPath = readInitialPath();
    return initialPath ? { ...INITIAL_STATE, path: initialPath } : INITIAL_STATE;
  });

  const update = useCallback((patch) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const goStep = useCallback((n, direction = 'fwd') => {
    setState((s) => ({ ...s, step: n, direction }));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const next = useCallback(() => {
    setState((s) => {
      if (s.step >= 5) return s;
      // General English skips band target/date and current level — jump to language
      let nextStep = s.step + 1;
      if (s.step === 1 && s.path === 'general') nextStep = 4;
      return { ...s, step: nextStep, direction: 'fwd' };
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const back = useCallback(() => {
    setState((s) => {
      if (s.step <= 1) return s;
      let prev = s.step - 1;
      if (s.step === 4 && s.path === 'general') prev = 1;
      return { ...s, step: prev, direction: 'rev' };
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const skip = useCallback(() => {
    if (typeof window === 'undefined') return;
    const ok = window.confirm(t('onboardingSkipConfirm'));
    if (!ok) return;
    setState((s) => ({
      ...s,
      path: s.path || 'ielts',
      targetBand: s.targetBand || 7.0,
      currentBand: s.currentBand || 6.0,
      examDate: s.examDate || 'tbd',
      language: s.language || LANGUAGES[0],
      step: 5,
      direction: 'fwd',
    }));
  }, [t]);

  return {
    state,
    update,
    goStep,
    next,
    back,
    skip,
    canContinue: isStepComplete(state),
  };
}
