import { Injectable, signal, effect } from '@angular/core';

export interface Theme {
  id: string;
  name: string;
  icon: string;
  colors: {
    brand: string;
    bgPrimary: string;
    bgSecondary: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    border: string;
  };
  uiVariant: 'glass' | 'solid' | 'flat' | 'neumorphic' | 'minimal';
  category: 'dark' | 'light' | 'colorful';
}

@Injectable({ providedIn: 'root' })
export class ThemeManagerService {
  private readonly STORAGE_KEY = 'docs20-theme';

  readonly currentTheme;
  readonly availableThemes;

  constructor() {
    this.currentTheme = signal(this.themes[0]);
    this.availableThemes = signal(this.themes);

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const savedTheme = JSON.parse(saved);
        const baseTheme = this.themes.find((t) => t.id === savedTheme.id);
        if (baseTheme) {
          this.setTheme({
            ...baseTheme,
            uiVariant: savedTheme.uiVariant || baseTheme.uiVariant,
          });
        }
      } catch {
        const theme = this.themes.find((t) => t.id === saved);
        if (theme) this.setTheme(theme);
      }
    }

    effect(() => {
      const theme = this.currentTheme();
      document.documentElement.setAttribute('data-theme', theme.id);
      document.documentElement.setAttribute('data-ui-variant', theme.uiVariant);

      // Aplicar variables CSS globales
      document.documentElement.style.setProperty('--brand', theme.colors.brand);
      document.documentElement.style.setProperty(
        '--primary',
        theme.colors.brand,
      );
      document.documentElement.style.setProperty(
        '--bg-primary',
        theme.colors.bgPrimary,
      );
      document.documentElement.style.setProperty(
        '--bg-secondary',
        theme.colors.bgSecondary,
      );
      document.documentElement.style.setProperty(
        '--surface',
        theme.colors.surface,
      );
      document.documentElement.style.setProperty(
        '--text-primary',
        theme.colors.textPrimary,
      );
      document.documentElement.style.setProperty(
        '--text-secondary',
        theme.colors.textSecondary,
      );
      document.documentElement.style.setProperty(
        '--accent',
        theme.colors.accent,
      );
      document.documentElement.style.setProperty(
        '--border-soft',
        theme.colors.border,
      );
      document.documentElement.style.setProperty(
        '--border-vibrant',
        theme.colors.border,
      );

      // Aplicar fondo al body inmediatamente
      document.body.style.backgroundColor = theme.colors.bgPrimary;

      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVar = `--${key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}`;
        document.documentElement.style.setProperty(cssVar, value as string);
      });
    });
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(theme));
  }

  setThemeById(id: string): void {
    const theme = this.themes.find((t) => t.id === id);
    if (theme) this.setTheme(theme);
  }

  getThemesByCategory(): Record<string, Theme[]> {
    return {
      dark: this.themes.filter((t) => t.category === 'dark'),
      light: this.themes.filter((t) => t.category === 'light'),
      colorful: this.themes.filter((t) => t.category === 'colorful'),
    };
  }

  private readonly themes: Theme[] = [
    {
      id: 'cosmic',
      name: 'Cosmic Dark',
      icon: '🌌',
      colors: {
        brand: '#e60012',
        bgPrimary: '#050608',
        bgSecondary: '#0c0d12',
        surface: 'rgba(18, 20, 28, 0.76)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.75)',
        accent: '#ffffff',
        border: 'rgba(255, 255, 255, 0.08)',
      },
      uiVariant: 'glass',
      category: 'dark',
    },
    {
      id: 'pearl',
      name: 'Pearl White',
      icon: '⚪',
      colors: {
        brand: '#2563eb',
        bgPrimary: '#f8fafc',
        bgSecondary: '#ffffff',
        surface: 'rgba(255, 255, 255, 0.85)',
        textPrimary: '#0f172a',
        textSecondary: '#334155',
        accent: '#0f172a',
        border: 'rgba(15, 23, 42, 0.08)',
      },
      uiVariant: 'glass',
      category: 'light',
    },
    {
      id: 'nordic',
      name: 'Nordic Frost',
      icon: '❄️',
      colors: {
        brand: '#5e81ac',
        bgPrimary: '#2e3440',
        bgSecondary: '#3b4252',
        surface: 'rgba(59, 66, 82, 0.85)',
        textPrimary: '#eceff4',
        textSecondary: '#d8dee9',
        accent: '#88c0d0',
        border: 'rgba(236, 239, 244, 0.08)',
      },
      uiVariant: 'glass',
      category: 'dark',
    },
    {
      id: 'dracula',
      name: 'Dracula',
      icon: '🧛',
      colors: {
        brand: '#bd93f9',
        bgPrimary: '#282a36',
        bgSecondary: '#44475a',
        surface: 'rgba(68, 71, 90, 0.85)',
        textPrimary: '#f8f8f2',
        textSecondary: '#6272a4',
        accent: '#ff79c6',
        border: 'rgba(248, 248, 242, 0.08)',
      },
      uiVariant: 'solid',
      category: 'dark',
    },
    {
      id: 'solarized',
      name: 'Solarized Dark',
      icon: '☀️',
      colors: {
        brand: '#b58900',
        bgPrimary: '#002b36',
        bgSecondary: '#073642',
        surface: 'rgba(7, 54, 66, 0.85)',
        textPrimary: '#839496',
        textSecondary: '#586e75',
        accent: '#2aa198',
        border: 'rgba(131, 148, 150, 0.08)',
      },
      uiVariant: 'solid',
      category: 'dark',
    },
    {
      id: 'catppuccin',
      name: 'Catppuccin Mocha',
      icon: '🐱',
      colors: {
        brand: '#cba6f7',
        bgPrimary: '#1e1e2e',
        bgSecondary: '#313244',
        surface: 'rgba(49, 50, 68, 0.85)',
        textPrimary: '#cdd6f4',
        textSecondary: '#a6adc8',
        accent: '#f5c2e7',
        border: 'rgba(205, 214, 244, 0.08)',
      },
      uiVariant: 'glass',
      category: 'dark',
    },
    {
      id: 'tokyo-night',
      name: 'Tokyo Night',
      icon: '🌃',
      colors: {
        brand: '#7aa2f7',
        bgPrimary: '#1a1b26',
        bgSecondary: '#24283b',
        surface: 'rgba(36, 40, 59, 0.85)',
        textPrimary: '#c0caf5',
        textSecondary: '#a9b1d6',
        accent: '#bb9af7',
        border: 'rgba(192, 202, 245, 0.08)',
      },
      uiVariant: 'glass',
      category: 'dark',
    },
    {
      id: 'github',
      name: 'GitHub Dark',
      icon: '🐙',
      colors: {
        brand: '#238636',
        bgPrimary: '#0d1117',
        bgSecondary: '#161b22',
        surface: 'rgba(22, 27, 34, 0.85)',
        textPrimary: '#f0f6fc',
        textSecondary: '#8b949e',
        accent: '#58a6ff',
        border: 'rgba(240, 246, 252, 0.08)',
      },
      uiVariant: 'solid',
      category: 'dark',
    },
    {
      id: 'monokai',
      name: 'Monokai Pro',
      icon: '🎨',
      colors: {
        brand: '#f92672',
        bgPrimary: '#272822',
        bgSecondary: '#3e3d32',
        surface: 'rgba(62, 61, 50, 0.85)',
        textPrimary: '#f8f8f2',
        textSecondary: '#75715e',
        accent: '#a6e22e',
        border: 'rgba(248, 248, 242, 0.08)',
      },
      uiVariant: 'solid',
      category: 'dark',
    },
    {
      id: 'aurora',
      name: 'Aurora Boreal',
      icon: '🌈',
      colors: {
        brand: '#00f2ad',
        bgPrimary: '#0a1628',
        bgSecondary: '#0f1d30',
        surface: 'rgba(15, 29, 48, 0.85)',
        textPrimary: '#e0f2fe',
        textSecondary: '#7dd3fc',
        accent: '#38bdf8',
        border: 'rgba(224, 242, 254, 0.08)',
      },
      uiVariant: 'glass',
      category: 'colorful',
    },
    {
      id: 'sunset',
      name: 'Sunset Orange',
      icon: '🌅',
      colors: {
        brand: '#f97316',
        bgPrimary: '#1c1917',
        bgSecondary: '#292524',
        surface: 'rgba(41, 37, 36, 0.85)',
        textPrimary: '#fef3c7',
        textSecondary: '#fbbf24',
        accent: '#fb923c',
        border: 'rgba(254, 243, 199, 0.08)',
      },
      uiVariant: 'glass',
      category: 'colorful',
    },
    {
      id: 'forest',
      name: 'Deep Forest',
      icon: '🌲',
      colors: {
        brand: '#16a34a',
        bgPrimary: '#052e16',
        bgSecondary: '#14532d',
        surface: 'rgba(20, 83, 45, 0.85)',
        textPrimary: '#dcfce7',
        textSecondary: '#86efac',
        accent: '#4ade80',
        border: 'rgba(220, 252, 231, 0.08)',
      },
      uiVariant: 'glass',
      category: 'colorful',
    },
    {
      id: 'ocean',
      name: 'Deep Ocean',
      icon: '🌊',
      colors: {
        brand: '#0ea5e9',
        bgPrimary: '#0c4a6e',
        bgSecondary: '#075985',
        surface: 'rgba(7, 89, 133, 0.85)',
        textPrimary: '#e0f2fe',
        textSecondary: '#7dd3fc',
        accent: '#38bdf8',
        border: 'rgba(224, 242, 254, 0.08)',
      },
      uiVariant: 'glass',
      category: 'colorful',
    },
    {
      id: 'lavender',
      name: 'Lavender Dream',
      icon: '💜',
      colors: {
        brand: '#a855f7',
        bgPrimary: '#3b0764',
        bgSecondary: '#581c87',
        surface: 'rgba(88, 28, 135, 0.85)',
        textPrimary: '#f3e8ff',
        textSecondary: '#d8b4fe',
        accent: '#c084fc',
        border: 'rgba(243, 232, 255, 0.08)',
      },
      uiVariant: 'glass',
      category: 'colorful',
    },
    {
      id: 'rose',
      name: 'Rose Pine',
      icon: '🌹',
      colors: {
        brand: '#eb6f92',
        bgPrimary: '#191724',
        bgSecondary: '#1f1d2e',
        surface: 'rgba(31, 29, 46, 0.85)',
        textPrimary: '#e0def4',
        textSecondary: '#908caa',
        accent: '#c4a7e7',
        border: 'rgba(224, 222, 244, 0.08)',
      },
      uiVariant: 'glass',
      category: 'dark',
    },
    {
      id: 'latte',
      name: 'Coffee Latte',
      icon: '☕',
      colors: {
        brand: '#7c3aed',
        bgPrimary: '#fef3c7',
        bgSecondary: '#fefce8',
        surface: 'rgba(254, 252, 232, 0.9)',
        textPrimary: '#451a03',
        textSecondary: '#92400e',
        accent: '#d97706',
        border: 'rgba(69, 26, 3, 0.08)',
      },
      uiVariant: 'glass',
      category: 'light',
    },
    {
      id: 'minimal-black',
      name: 'Minimal Black',
      icon: '⬛',
      colors: {
        brand: '#ffffff',
        bgPrimary: '#000000',
        bgSecondary: '#111111',
        surface: 'rgba(17, 17, 17, 0.95)',
        textPrimary: '#ffffff',
        textSecondary: '#888888',
        accent: '#ffffff',
        border: 'rgba(255, 255, 255, 0.1)',
      },
      uiVariant: 'minimal',
      category: 'dark',
    },
    {
      id: 'paper',
      name: 'Paper White',
      icon: '📄',
      colors: {
        brand: '#18181b',
        bgPrimary: '#ffffff',
        bgSecondary: '#fafafa',
        surface: 'rgba(250, 250, 250, 0.95)',
        textPrimary: '#18181b',
        textSecondary: '#71717a',
        accent: '#27272a',
        border: 'rgba(24, 24, 27, 0.06)',
      },
      uiVariant: 'minimal',
      category: 'light',
    },
  ];
}
