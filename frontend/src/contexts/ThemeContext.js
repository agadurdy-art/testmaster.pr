import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  NIGHT_SHIFT: 'night-shift',
  AUTO: 'auto'
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || THEME_MODES.LIGHT;
  });
  
  const [activeTheme, setActiveTheme] = useState(THEME_MODES.LIGHT);

  // Determine active theme based on mode
  const determineTheme = React.useCallback(() => {
    if (themeMode === THEME_MODES.AUTO) {
      const hour = new Date().getHours();
      // Night time: 7pm - 7am
      if (hour >= 19 || hour < 7) {
        return THEME_MODES.DARK;
      }
      return THEME_MODES.LIGHT;
    }
    return themeMode;
  }, [themeMode]);

  // Update active theme when mode changes or for auto mode timer
  useEffect(() => {
    const newTheme = determineTheme();
    setActiveTheme(newTheme);

    // If auto mode, check every minute for time changes
    if (themeMode === THEME_MODES.AUTO) {
      const interval = setInterval(() => {
        const updatedTheme = determineTheme();
        setActiveTheme(updatedTheme);
      }, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [themeMode, determineTheme]);

  // Apply theme to document
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

  const setTheme = (mode) => {
    setThemeMode(mode);
  };

  const toggleDark = () => {
    if (themeMode === THEME_MODES.DARK) {
      setThemeMode(THEME_MODES.LIGHT);
    } else {
      setThemeMode(THEME_MODES.DARK);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      themeMode, 
      activeTheme, 
      setTheme, 
      toggleDark,
      isDark: activeTheme === THEME_MODES.DARK,
      isNightShift: activeTheme === THEME_MODES.NIGHT_SHIFT,
      isAuto: themeMode === THEME_MODES.AUTO
    }}>
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
