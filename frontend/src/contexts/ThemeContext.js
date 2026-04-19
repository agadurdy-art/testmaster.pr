import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  NIGHT_SHIFT: 'night-shift',
  AUTO: 'auto'
};

const ThemeContext = createContext();

// Helper function to determine theme based on time
const getTimeBasedTheme = () => {
  const hour = new Date().getHours();
  // Night time: 7pm - 7am
  if (hour >= 19 || hour < 7) {
    return THEME_MODES.DARK;
  }
  return THEME_MODES.LIGHT;
};

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || THEME_MODES.LIGHT;
  });
  
  // For auto mode, we need to track time-based changes
  const [timeBasedTheme, setTimeBasedTheme] = useState(getTimeBasedTheme);

  // Calculate active theme based on mode
  const activeTheme = useMemo(() => {
    if (themeMode === THEME_MODES.AUTO) {
      return timeBasedTheme;
    }
    return themeMode;
  }, [themeMode, timeBasedTheme]);

  // Set up interval for auto mode time checking
  useEffect(() => {
    if (themeMode === THEME_MODES.AUTO) {
      const interval = setInterval(() => {
        setTimeBasedTheme(getTimeBasedTheme());
      }, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [themeMode]);

  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Remove all theme classes
    root.classList.remove('dark', 'night-shift');
    body.classList.remove('dark', 'night-shift');

    // Apply appropriate theme
    if (activeTheme === THEME_MODES.DARK) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else if (activeTheme === THEME_MODES.NIGHT_SHIFT) {
      root.classList.add('night-shift');
      body.classList.add('night-shift');
    }

    // Save preference
    localStorage.setItem('themeMode', themeMode);
  }, [activeTheme, themeMode]);

  const setTheme = useCallback((mode) => {
    setThemeMode(mode);
    // If switching to auto, also update time-based theme immediately
    if (mode === THEME_MODES.AUTO) {
      setTimeBasedTheme(getTimeBasedTheme());
    }
  }, []);

  const toggleDark = useCallback(() => {
    setThemeMode(prev => prev === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK);
  }, []);

  const value = useMemo(() => ({
    themeMode, 
    activeTheme, 
    setTheme, 
    toggleDark,
    isDark: activeTheme === THEME_MODES.DARK,
    isNightShift: activeTheme === THEME_MODES.NIGHT_SHIFT,
    isAuto: themeMode === THEME_MODES.AUTO
  }), [themeMode, activeTheme, setTheme, toggleDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
