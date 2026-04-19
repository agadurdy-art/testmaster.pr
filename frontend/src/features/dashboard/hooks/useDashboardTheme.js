import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dashboard-theme";
const VALID_THEMES = new Set(["light", "dark", "night"]);

/**
 * Persists the dashboard scope theme to localStorage. Returns [theme, setTheme].
 * Default is "light" — the design is tuned for it and theme tokens are
 * derived in the scoped stylesheet.
 */
export default function useDashboardTheme(defaultTheme = "light") {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && VALID_THEMES.has(saved)) return saved;
    } catch (e) {
      /* storage unavailable — fall through */
    }
    return defaultTheme;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore */
    }
  }, [theme]);

  const setSafe = useCallback((next) => {
    if (VALID_THEMES.has(next)) setTheme(next);
  }, []);

  return [theme, setSafe];
}
