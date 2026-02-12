
import React, { createContext, useContext, useEffect, useState } from 'react';

// ==========================================
// 1. THEME DEFINITIONS
// ==========================================

export type ThemeId = 'mobile' | '1940s' | '2026' | 'elegance' | 'book';

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    border: string;
    success: string;
    inputBg: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  borderRadius: string;
  animations: {
    fast: string;
    medium: string;
    slow: string;
  };
  effects: {
    glass: string;
    shadow: string;
    glow: string;
  };
}

export const THEMES: Record<ThemeId, Theme> = {
  mobile: {
    id: 'mobile',
    name: 'Ianua Mobile',
    colors: {
      background: '#fcfbf9',
      surface: '#ffffff',
      text: '#1c1917', // stone-900
      textMuted: '#a8a29e', // stone-400
      accent: '#D4AF37', // Gold
      border: '#e7e5e4', // stone-200
      success: '#059669', // emerald-600
      inputBg: '#fafaf9',
    },
    fonts: {
      heading: '"Cinzel", serif',
      body: '"Cormorant Garamond", serif',
      mono: '"Montserrat", sans-serif',
    },
    borderRadius: '1rem', // Prominent rounding for mobile
    animations: {
      fast: '0.2s ease',
      medium: '0.4s ease',
      slow: '0.7s ease',
    },
    effects: {
      glass: 'backdrop-blur-xl bg-white/80',
      shadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
      glow: '0 0 10px rgba(212, 175, 55, 0.2)',
    },
  },
  '1940s': {
    id: '1940s',
    name: 'Noir 1940',
    colors: {
      background: '#e8dcc5', // Sepia paper
      surface: '#dcbfa6', // Darker paper
      text: '#2a1f1d', // Dark brown/black
      textMuted: '#5c4d48',
      accent: '#8c3324', // Rust Red
      border: '#8c7b75',
      success: '#4a6b4a',
      inputBg: '#f0e6d2',
    },
    fonts: {
      heading: '"Courier Prime", monospace',
      body: '"Courier Prime", monospace',
      mono: '"Courier Prime", monospace',
    },
    borderRadius: '0px', // Strict corners
    animations: {
      fast: '0.1s linear', // Mechanical
      medium: '0.2s linear',
      slow: '0.3s linear',
    },
    effects: {
      glass: 'bg-[#e8dcc5]/90 border border-[#2a1f1d]', // No blur, just opacity
      shadow: '4px 4px 0px rgba(42, 31, 29, 0.5)', // Hard shadow
      glow: 'none',
    },
  },
  '2026': {
    id: '2026',
    name: 'Neon Gen Z',
    colors: {
      background: '#09090b', // Zinc-950
      surface: '#18181b', // Zinc-900
      text: '#ffffff',
      textMuted: '#a1a1aa',
      accent: '#06b6d4', // Cyan-500
      border: '#27272a',
      success: '#22c55e',
      inputBg: '#27272a',
    },
    fonts: {
      heading: '"Orbitron", sans-serif',
      body: '"Montserrat", sans-serif',
      mono: '"Share Tech Mono", monospace',
    },
    borderRadius: '2rem', // Super rounded
    animations: {
      fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      medium: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    effects: {
      glass: 'backdrop-blur-2xl bg-black/40 border border-white/10',
      shadow: '0 0 40px -10px rgba(6, 182, 212, 0.3)',
      glow: '0 0 15px rgba(6, 182, 212, 0.5), 0 0 30px rgba(6, 182, 212, 0.3)',
    },
  },
  elegance: {
    id: 'elegance',
    name: 'Elegance Night',
    colors: {
      background: '#0f172a', // Slate-950
      surface: '#1e293b', // Slate-800
      text: '#f8fafc', // Slate-50
      textMuted: '#94a3b8',
      accent: '#D4AF37', // Gold
      border: '#334155',
      success: '#10b981',
      inputBg: '#1e293b',
    },
    fonts: {
      heading: '"Playfair Display", serif',
      body: '"Lato", sans-serif',
      mono: '"Lato", sans-serif',
    },
    borderRadius: '4px', // Refined
    animations: {
      fast: '0.3s ease-out',
      medium: '0.6s ease-out',
      slow: '1s ease-out',
    },
    effects: {
      glass: 'backdrop-blur-md bg-[#0f172a]/70 border-t border-white/10',
      shadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
      glow: '0 0 20px rgba(212, 175, 55, 0.1)',
    },
  },
  book: {
    id: 'book',
    name: 'Bibliotheca',
    colors: {
      background: '#fdf6e3', // Solarized Light Base
      surface: '#eee8d5',
      text: '#2e2b29', // Ink
      textMuted: '#839496',
      accent: '#dc322f', // Red ink
      border: '#d2b48c', // Tan
      success: '#859900',
      inputBg: '#fdf6e3',
    },
    fonts: {
      heading: '"Crimson Text", serif',
      body: '"Crimson Text", serif',
      mono: '"Consolas", monospace',
    },
    borderRadius: '2px',
    animations: {
      fast: '0.2s ease',
      medium: '0.5s ease',
      slow: '0.8s ease',
    },
    effects: {
      glass: 'bg-[#fdf6e3] border-4 border-double border-[#d2b48c]', // Double border style
      shadow: '2px 2px 5px rgba(0,0,0,0.1)',
      glow: 'none',
    },
  },
};

// ==========================================
// 2. CONTEXT & PROVIDER
// ==========================================

interface ThemeContextType {
  currentTheme: ThemeId;
  theme: Theme;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('ianua_theme') as ThemeId) || 'mobile';
  });

  const theme = THEMES[currentThemeId];

  // Inject CSS Variables whenever theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Colors
    root.style.setProperty('--c-bg', theme.colors.background);
    root.style.setProperty('--c-surface', theme.colors.surface);
    root.style.setProperty('--c-text', theme.colors.text);
    root.style.setProperty('--c-text-muted', theme.colors.textMuted);
    root.style.setProperty('--c-accent', theme.colors.accent);
    root.style.setProperty('--c-border', theme.colors.border);
    root.style.setProperty('--c-input', theme.colors.inputBg);
    
    // Fonts
    root.style.setProperty('--f-heading', theme.fonts.heading);
    root.style.setProperty('--f-body', theme.fonts.body);
    root.style.setProperty('--f-mono', theme.fonts.mono);

    // Shape & Motion
    root.style.setProperty('--r-base', theme.borderRadius);
    root.style.setProperty('--t-fast', theme.animations.fast);
    root.style.setProperty('--t-medium', theme.animations.medium);
    root.style.setProperty('--t-slow', theme.animations.slow);

    // Effects
    root.style.setProperty('--e-glass', theme.effects.glass); // Note: tailwind classes might not read this directly without config
    root.style.setProperty('--e-shadow', theme.effects.shadow);
    root.style.setProperty('--e-glow', theme.effects.glow);

    // Save to local storage
    localStorage.setItem('ianua_theme', currentThemeId);
    
    // Set data-theme attribute for CSS selectors if needed
    root.setAttribute('data-theme', currentThemeId);

  }, [currentThemeId, theme]);

  return (
    <ThemeContext.Provider value={{ currentTheme: currentThemeId, theme, setTheme: setCurrentThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
