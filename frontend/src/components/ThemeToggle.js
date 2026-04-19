import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import { Sun, Moon, Sunset, Clock } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { themeMode, setTheme, activeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { 
      mode: THEME_MODES.LIGHT, 
      icon: Sun, 
      label: 'Light', 
      description: 'Default bright mode',
      color: 'text-yellow-500'
    },
    { 
      mode: THEME_MODES.DARK, 
      icon: Moon, 
      label: 'Dark', 
      description: 'Easy on the eyes',
      color: 'text-indigo-400'
    },
    { 
      mode: THEME_MODES.NIGHT_SHIFT, 
      icon: Sunset, 
      label: 'Night Shift', 
      description: 'Warm colors, less blue light',
      color: 'text-orange-400'
    },
    { 
      mode: THEME_MODES.AUTO, 
      icon: Clock, 
      label: 'Auto', 
      description: 'Switch based on time',
      color: 'text-green-500'
    },
  ];

  const currentOption = options.find(o => o.mode === themeMode) || options[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${activeTheme === THEME_MODES.DARK 
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
            : activeTheme === THEME_MODES.NIGHT_SHIFT
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }
        `}
        title={`Theme: ${currentOption.label}`}
      >
        <CurrentIcon className={`w-5 h-5 ${currentOption.color}`} />
      </button>

      {isOpen && (
        <div className={`
          absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-50 overflow-hidden
          ${activeTheme === THEME_MODES.DARK 
            ? 'bg-gray-800 border border-gray-700' 
            : activeTheme === THEME_MODES.NIGHT_SHIFT
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-white border border-gray-200'
          }
        `}>
          <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider
            ${activeTheme === THEME_MODES.DARK 
              ? 'text-gray-400 border-b border-gray-700' 
              : activeTheme === THEME_MODES.NIGHT_SHIFT
                ? 'text-amber-700 border-b border-amber-200'
                : 'text-gray-500 border-b border-gray-100'
            }
          `}>
            Display Mode
          </div>
          
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = themeMode === option.mode;
            
            return (
              <button
                key={option.mode}
                onClick={() => {
                  setTheme(option.mode);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-3 flex items-center gap-3 transition-colors
                  ${isSelected 
                    ? activeTheme === THEME_MODES.DARK
                      ? 'bg-gray-700'
                      : activeTheme === THEME_MODES.NIGHT_SHIFT
                        ? 'bg-amber-100'
                        : 'bg-purple-50'
                    : activeTheme === THEME_MODES.DARK
                      ? 'hover:bg-gray-700'
                      : activeTheme === THEME_MODES.NIGHT_SHIFT
                        ? 'hover:bg-amber-100'
                        : 'hover:bg-gray-50'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg
                  ${activeTheme === THEME_MODES.DARK 
                    ? 'bg-gray-600' 
                    : activeTheme === THEME_MODES.NIGHT_SHIFT
                      ? 'bg-amber-200'
                      : 'bg-gray-100'
                  }
                `}>
                  <Icon className={`w-4 h-4 ${option.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-medium text-sm
                    ${activeTheme === THEME_MODES.DARK 
                      ? 'text-gray-200' 
                      : activeTheme === THEME_MODES.NIGHT_SHIFT
                        ? 'text-amber-900'
                        : 'text-gray-800'
                    }
                  `}>
                    {option.label}
                  </div>
                  <div className={`text-xs
                    ${activeTheme === THEME_MODES.DARK 
                      ? 'text-gray-400' 
                      : activeTheme === THEME_MODES.NIGHT_SHIFT
                        ? 'text-amber-700'
                        : 'text-gray-500'
                    }
                  `}>
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                )}
              </button>
            );
          })}

          {themeMode === THEME_MODES.AUTO && (
            <div className={`px-3 py-2 text-xs
              ${activeTheme === THEME_MODES.DARK 
                ? 'text-gray-400 border-t border-gray-700 bg-gray-750' 
                : activeTheme === THEME_MODES.NIGHT_SHIFT
                  ? 'text-amber-600 border-t border-amber-200 bg-amber-50'
                  : 'text-gray-500 border-t border-gray-100 bg-gray-50'
              }
            `}>
              🌙 Dark mode: 7pm - 7am
            </div>
          )}
        </div>
      )}
    </div>
  );
}
