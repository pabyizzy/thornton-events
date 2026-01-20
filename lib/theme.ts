// Theme Configuration
// Change these values to update the entire app's theme

export const themes = {
  // Available themes
  'family-friendly': {
    name: 'Family Friendly',
    colors: {
      primary: '#8b5cf6',      // Purple
      secondary: '#ec4899',    // Pink
      accent: '#f59e0b',       // Orange
      success: '#10b981',      // Green
      info: '#3b82f6',         // Blue
    },
    backgrounds: {
      start: '#fefefe',        // Almost white
      middle: '#fefefe',       // Almost white
      end: '#fefefe',          // Almost white
    },
    cards: {
      bg: '#ffffff',
      bgSubtle: '#fef7ff',     // Very subtle purple tint
      border: '#e9d5ff',       // Purple-200
    },
    text: {
      primary: '#1f2937',      // Gray-800
      secondary: '#6b7280',    // Gray-500
      muted: '#9ca3af',        // Gray-400
    }
  },
  
  'ocean-breeze': {
    name: 'Ocean Breeze',
    colors: {
      primary: '#0ea5e9',      // Sky-500
      secondary: '#06b6d4',    // Cyan-500
      accent: '#8b5cf6',       // Purple-500
      success: '#10b981',      // Green-500
      info: '#3b82f6',         // Blue-500
    },
    backgrounds: {
      start: '#fefefe',        // Almost white
      middle: '#fefefe',       // Almost white
      end: '#fefefe',          // Almost white
    },
    cards: {
      bg: '#ffffff',
      bgSubtle: '#f0f9ff',     // Very subtle sky blue tint
      border: '#bae6fd',       // Sky-200
    },
    text: {
      primary: '#0f172a',      // Slate-900
      secondary: '#475569',    // Slate-600
      muted: '#94a3b8',        // Slate-400
    }
  },
  
  'sunset-warmth': {
    name: 'Sunset Warmth',
    colors: {
      primary: '#f97316',      // Orange-500
      secondary: '#ef4444',    // Red-500
      accent: '#eab308',       // Yellow-500
      success: '#22c55e',      // Green-500
      info: '#3b82f6',         // Blue-500
    },
    backgrounds: {
      start: '#fefefe',        // Almost white
      middle: '#fefefe',       // Almost white
      end: '#fefefe',          // Almost white
    },
    cards: {
      bg: '#ffffff',
      bgSubtle: '#fff7ed',     // Very subtle orange tint
      border: '#fed7aa',       // Orange-200
    },
    text: {
      primary: '#1c1917',      // Stone-900
      secondary: '#78716c',    // Stone-500
      muted: '#a8a29e',        // Stone-400
    }
  },
  
  'forest-nature': {
    name: 'Forest Nature',
    colors: {
      primary: '#059669',      // Emerald-600
      secondary: '#16a34a',    // Green-600
      accent: '#65a30d',       // Lime-600
      success: '#22c55e',      // Green-500
      info: '#0ea5e9',         // Sky-500
    },
    backgrounds: {
      start: '#fefefe',        // Almost white
      middle: '#fefefe',       // Almost white
      end: '#fefefe',          // Almost white
    },
    cards: {
      bg: '#ffffff',
      bgSubtle: '#f0fdf4',     // Very subtle green tint
      border: '#bbf7d0',       // Green-200
    },
    text: {
      primary: '#14532d',      // Green-900
      secondary: '#4b5563',    // Gray-600
      muted: '#9ca3af',        // Gray-400
    }
  },
  
  'midnight-elegance': {
    name: 'Midnight Elegance',
    colors: {
      primary: '#6366f1',      // Indigo-500
      secondary: '#8b5cf6',    // Purple-500
      accent: '#ec4899',       // Pink-500
      success: '#10b981',      // Green-500
      info: '#06b6d4',         // Cyan-500
    },
    backgrounds: {
      start: '#1e1b4b',        // Indigo-900
      middle: '#581c87',       // Purple-900
      end: '#4c1d95',          // Purple-800
    },
    cards: {
      bg: '#111827',           // Gray-900
      bgSubtle: '#1f2937',     // Very subtle dark gray tint
      border: '#374151',       // Gray-700
    },
    text: {
      primary: '#f9fafb',      // Gray-50
      secondary: '#e5e7eb',    // Gray-200 (lighter for better contrast)
      muted: '#9ca3af',        // Gray-400
    }
  }
} as const;

export type ThemeName = keyof typeof themes;

// Function to apply a theme
export function applyTheme(themeName: ThemeName) {
  const theme = themes[themeName];
  if (!theme) return;
  
  const root = document.documentElement;
  
  // Apply colors
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-success', theme.colors.success);
  root.style.setProperty('--theme-info', theme.colors.info);
  
  // Apply backgrounds
  root.style.setProperty('--theme-bg-start', theme.backgrounds.start);
  root.style.setProperty('--theme-bg-middle', theme.backgrounds.middle);
  root.style.setProperty('--theme-bg-end', theme.backgrounds.end);
  
  // Apply card colors
  root.style.setProperty('--theme-card-bg', theme.cards.bg);
  root.style.setProperty('--theme-card-bg-subtle', theme.cards.bgSubtle);
  root.style.setProperty('--theme-card-border', theme.cards.border);
  
  // Apply text colors
  root.style.setProperty('--theme-text-primary', theme.text.primary);
  root.style.setProperty('--theme-text-secondary', theme.text.secondary);
  root.style.setProperty('--theme-text-muted', theme.text.muted);
  
  // Update button colors (flat colors)
  root.style.setProperty('--theme-btn-primary', theme.colors.primary);
  root.style.setProperty('--theme-btn-secondary', theme.colors.accent);
  root.style.setProperty('--theme-btn-success', theme.colors.success);
  root.style.setProperty('--theme-btn-info', theme.colors.info);
  root.style.setProperty('--theme-btn-outline', theme.text.secondary);
  
  // Add data attribute for theme-specific styling
  root.setAttribute('data-theme', themeName);
  
  // Store current theme
  localStorage.setItem('thornton-events-theme', themeName);
}

// Function to get current theme
export function getCurrentTheme(): ThemeName {
  if (typeof window === 'undefined') return 'family-friendly';
  return (localStorage.getItem('thornton-events-theme') as ThemeName) || 'family-friendly';
}

// Function to initialize theme on page load
export function initializeTheme() {
  if (typeof window === 'undefined') return;
  const currentTheme = getCurrentTheme();
  applyTheme(currentTheme);
}
