'use client';

import { useState, useEffect } from 'react';
import { themes, applyTheme, getCurrentTheme, type ThemeName } from '../../lib/theme';

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('family-friendly');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentTheme(getCurrentTheme());
  }, []);

  const handleThemeChange = (themeName: ThemeName) => {
    applyTheme(themeName);
    setCurrentTheme(themeName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="theme-btn-outline flex items-center gap-2 px-4 py-2"
      >
        <span className="text-lg">🎨</span>
        <span className="hidden sm:inline">{themes[currentTheme].name}</span>
        <span className="text-sm">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 theme-card p-4 z-50">
          <h3 className="theme-text-primary font-bold mb-3 flex items-center gap-2">
            <span className="text-lg">🎨</span>
            Choose Theme
          </h3>
          <div className="space-y-2">
            {Object.entries(themes)
              .filter(([key]) => key !== 'current') // Exclude the 'current' property
              .map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key as ThemeName)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentTheme === key
                    ? 'theme-btn-primary'
                    : 'hover:opacity-80 theme-text-primary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{theme.name}</span>
                  {currentTheme === key && (
                    <span className="text-sm">✓</span>
                  )}
                </div>
                <div className="flex gap-1 mt-1">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
