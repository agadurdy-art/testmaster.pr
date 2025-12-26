import { useTheme, THEME_MODES } from '../contexts/ThemeContext';

/**
 * Custom hook that provides theme-aware CSS classes
 * Use this hook in any component to get consistent theme styling
 */
export function useThemeClasses() {
  const { activeTheme } = useTheme();
  const isDark = activeTheme === THEME_MODES.DARK;
  const isNightShift = activeTheme === THEME_MODES.NIGHT_SHIFT;

  return {
    // State indicators
    isDark,
    isNightShift,
    isLight: !isDark && !isNightShift,
    
    // Main backgrounds
    bgMain: isDark 
      ? 'bg-gray-900' 
      : isNightShift 
        ? 'bg-amber-50' 
        : 'bg-gradient-to-br from-slate-50 to-purple-50',
    
    bgPage: isDark 
      ? 'bg-gray-900' 
      : isNightShift 
        ? 'bg-amber-50/50' 
        : 'bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-100',
    
    // Card backgrounds
    bgCard: isDark 
      ? 'bg-gray-800 border-gray-700' 
      : isNightShift 
        ? 'bg-amber-100/50 border-amber-200' 
        : 'bg-white border-gray-200',
    
    bgCardHover: isDark 
      ? 'hover:bg-gray-700' 
      : isNightShift 
        ? 'hover:bg-amber-100' 
        : 'hover:bg-gray-50',
    
    bgSubtle: isDark 
      ? 'bg-gray-800/50' 
      : isNightShift 
        ? 'bg-amber-100/30' 
        : 'bg-gray-50',
    
    // Header
    bgHeader: isDark 
      ? 'bg-gray-800/95 border-gray-700' 
      : isNightShift 
        ? 'bg-amber-100/95 border-amber-200' 
        : 'bg-white/80 border-gray-100',
    
    // Text colors
    textPrimary: isDark 
      ? 'text-gray-100' 
      : isNightShift 
        ? 'text-amber-900' 
        : 'text-gray-900',
    
    textSecondary: isDark 
      ? 'text-gray-400' 
      : isNightShift 
        ? 'text-amber-700' 
        : 'text-gray-600',
    
    textMuted: isDark 
      ? 'text-gray-500' 
      : isNightShift 
        ? 'text-amber-600' 
        : 'text-gray-500',
    
    // Border colors
    borderColor: isDark 
      ? 'border-gray-700' 
      : isNightShift 
        ? 'border-amber-200' 
        : 'border-gray-200',
    
    // Input styles
    inputBg: isDark 
      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400' 
      : isNightShift 
        ? 'bg-amber-50 border-amber-200 text-amber-900 placeholder:text-amber-500' 
        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400',
    
    // Button hover effects
    hoverBg: isDark 
      ? 'hover:bg-gray-700' 
      : isNightShift 
        ? 'hover:bg-amber-100' 
        : 'hover:bg-gray-100',
    
    // Accent backgrounds for colored sections
    accentBg: (color) => {
      const colorMap = {
        blue: isDark ? 'bg-blue-900/30' : 'bg-blue-50',
        purple: isDark ? 'bg-purple-900/30' : 'bg-purple-50',
        green: isDark ? 'bg-green-900/30' : 'bg-green-50',
        amber: isDark ? 'bg-amber-900/30' : 'bg-amber-50',
        red: isDark ? 'bg-red-900/30' : 'bg-red-50',
        orange: isDark ? 'bg-orange-900/30' : 'bg-orange-50',
        emerald: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
        violet: isDark ? 'bg-violet-900/30' : 'bg-violet-50',
        pink: isDark ? 'bg-pink-900/30' : 'bg-pink-50',
      };
      return colorMap[color] || colorMap.blue;
    },
    
    // Shadow styles
    shadow: isDark 
      ? 'shadow-lg shadow-gray-900/50' 
      : 'shadow-lg shadow-gray-200/50',
    
    // Divider
    divider: isDark 
      ? 'divide-gray-700' 
      : isNightShift 
        ? 'divide-amber-200' 
        : 'divide-gray-200',
    
    // Modal/Dialog backgrounds
    bgModal: isDark 
      ? 'bg-gray-800' 
      : isNightShift 
        ? 'bg-amber-50' 
        : 'bg-white',
    
    // Code/Pre blocks
    bgCode: isDark 
      ? 'bg-gray-900' 
      : isNightShift 
        ? 'bg-amber-100' 
        : 'bg-gray-100',
  };
}

export default useThemeClasses;
