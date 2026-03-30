import { Injectable, signal, effect } from '@angular/core';

/** Global app color palettes (selector in shell). Not the same as UI-kit *component* variants (button primary, alert success, etc.). */
export type Theme =
  | 'light'
  | 'dark'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'rose'
  | 'slate'
  | 'zinc'
  | 'neutral'
  | 'cyan'
  | 'teal'
  | 'amber'
  | 'indigo'
  | 'lime'
  | 'violet'
  | 'crimson'
  | 'mint'
  | 'coral'
  | 'gold';

function hexToRgbTriplet(hex: string): string {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6) return '79, 70, 229';
  const n = parseInt(normalized, 16);
  if (Number.isNaN(n)) return '79, 70, 229';
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const t = hexToRgbTriplet(hex);
  return `rgba(${t}, ${alpha})`;
}

export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  brand: string;
  brandGlow: string;
  bgSecondary: string;
  bgTertiary: string;
}

export const THEMES: Record<Theme, ThemeConfig> = {
  light: {
    name: 'Deck Light',
    primary: '#4338ca',
    secondary: '#64748B',
    background: '#f1f4f9',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: 'rgba(15, 23, 42, 0.08)',
    brand: '#4338ca',
    brandGlow: 'rgba(67, 56, 202, 0.35)',
    bgSecondary: '#ffffff',
    bgTertiary: '#e8edf5',
  },
  dark: {
    name: 'Noir Circuit',
    primary: '#ff3b3b',
    secondary: '#94a3b8',
    background: '#050506',
    surface: '#101014',
    text: '#f4f4f5',
    textMuted: '#8b919d',
    border: 'rgba(255, 255, 255, 0.07)',
    brand: '#ff3b3b',
    brandGlow: 'rgba(255, 59, 59, 0.42)',
    bgSecondary: '#0c0c0f',
    bgTertiary: '#15151a',
  },
  blue: {
    name: 'Helix Blue',
    primary: '#38bdf8',
    secondary: '#64748B',
    background: '#030712',
    surface: '#0c1525',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: 'rgba(56, 189, 248, 0.14)',
    brand: '#38bdf8',
    brandGlow: 'rgba(56, 189, 248, 0.45)',
    bgSecondary: '#0a1220',
    bgTertiary: '#111e33',
  },
  // Keep others with balanced defaults but focused on premium dark if possible
  green: {
    name: 'Signal Matrix',
    primary: '#10b981',
    secondary: '#64748B',
    background: '#050505',
    surface: '#0f1510',
    text: '#ecfdf5',
    textMuted: '#34d399',
    border: '#10b98133',
    brand: '#10b981',
    brandGlow: 'rgba(16, 185, 129, 0.4)',
    bgSecondary: '#0f1510',
    bgTertiary: '#1a241b',
  },
  purple: {
    name: 'Void Spiral',
    primary: '#8b5cf6',
    secondary: '#64748B',
    background: '#0a0014',
    surface: '#140028',
    text: '#faf5ff',
    textMuted: '#a78bfa',
    border: '#8b5cf633',
    brand: '#8b5cf6',
    brandGlow: 'rgba(139, 92, 246, 0.4)',
    bgSecondary: '#140028',
    bgTertiary: '#1e003c',
  },
  orange: {
    name: 'Solar Forge',
    primary: '#f97316',
    secondary: '#64748B',
    background: '#0a0500',
    surface: '#1a0d00',
    text: '#fff7ed',
    textMuted: '#fb923c',
    border: '#f9731633',
    brand: '#f97316',
    brandGlow: 'rgba(249, 115, 22, 0.4)',
    bgSecondary: '#1a0d00',
    bgTertiary: '#2d1600',
  },
  rose: {
    name: 'Cyber-Rose',
    primary: '#f43f5e',
    secondary: '#64748B',
    background: '#0a0005',
    surface: '#1a000d',
    text: '#fff1f2',
    textMuted: '#fb7185',
    border: '#f43f5e33',
    brand: '#f43f5e',
    brandGlow: 'rgba(244, 63, 94, 0.4)',
    bgSecondary: '#1a000d',
    bgTertiary: '#2d0016',
  },
  slate: {
    name: 'Technical-Slate',
    primary: '#64748b',
    secondary: '#475569',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#334155',
    brand: '#64748b',
    brandGlow: 'rgba(100, 116, 139, 0.4)',
    bgSecondary: '#1e293b',
    bgTertiary: '#334155',
  },
  zinc: {
    name: 'Monochrome',
    primary: '#71717a',
    secondary: '#52525b',
    background: '#09090b',
    surface: '#18181b',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    border: '#27272a',
    brand: '#71717a',
    brandGlow: 'rgba(113, 113, 122, 0.4)',
    bgSecondary: '#18181b',
    bgTertiary: '#27272a',
  },
  neutral: {
    name: 'Raw-Metal',
    primary: '#737373',
    secondary: '#525252',
    background: '#0a0a0a',
    surface: '#171717',
    text: '#fafafa',
    textMuted: '#a3a3a3',
    border: '#262626',
    brand: '#737373',
    brandGlow: 'rgba(115, 115, 115, 0.4)',
    bgSecondary: '#171717',
    bgTertiary: '#262626',
  },
  cyan: {
    name: 'Arctic-Pulse',
    primary: '#06b6d4',
    secondary: '#64748B',
    background: '#020a0f',
    surface: '#082028',
    text: '#ecfeff',
    textMuted: '#67e8f9',
    border: '#06b6d433',
    brand: '#06b6d4',
    brandGlow: 'rgba(6, 182, 212, 0.45)',
    bgSecondary: '#082028',
    bgTertiary: '#0c2e38',
  },
  teal: {
    name: 'Abyss-Teal',
    primary: '#14b8a6',
    secondary: '#64748B',
    background: '#020807',
    surface: '#0a1f1c',
    text: '#f0fdfa',
    textMuted: '#5eead4',
    border: '#14b8a633',
    brand: '#14b8a6',
    brandGlow: 'rgba(20, 184, 166, 0.45)',
    bgSecondary: '#0a1f1c',
    bgTertiary: '#0f2e29',
  },
  amber: {
    name: 'Forge-Amber',
    primary: '#f59e0b',
    secondary: '#64748B',
    background: '#0c0800',
    surface: '#1c1400',
    text: '#fffbeb',
    textMuted: '#fcd34d',
    border: '#f59e0b33',
    brand: '#f59e0b',
    brandGlow: 'rgba(245, 158, 11, 0.45)',
    bgSecondary: '#1c1400',
    bgTertiary: '#2d1f00',
  },
  indigo: {
    name: 'Nebula-Indigo',
    primary: '#6366f1',
    secondary: '#64748B',
    background: '#050510',
    surface: '#0f1020',
    text: '#eef2ff',
    textMuted: '#a5b4fc',
    border: '#6366f133',
    brand: '#6366f1',
    brandGlow: 'rgba(99, 102, 241, 0.45)',
    bgSecondary: '#0f1020',
    bgTertiary: '#16182e',
  },
  lime: {
    name: 'Acid-Lime',
    primary: '#84cc16',
    secondary: '#64748B',
    background: '#050800',
    surface: '#121a05',
    text: '#f7fee7',
    textMuted: '#bef264',
    border: '#84cc1633',
    brand: '#84cc16',
    brandGlow: 'rgba(132, 204, 22, 0.45)',
    bgSecondary: '#121a05',
    bgTertiary: '#1c2608',
  },
  violet: {
    name: 'Ultra-Violet',
    primary: '#7c3aed',
    secondary: '#64748B',
    background: '#080214',
    surface: '#14082a',
    text: '#f5f3ff',
    textMuted: '#c4b5fd',
    border: '#7c3aed33',
    brand: '#7c3aed',
    brandGlow: 'rgba(124, 58, 237, 0.45)',
    bgSecondary: '#14082a',
    bgTertiary: '#1c0c3d',
  },
  crimson: {
    name: 'Crimson-Code',
    primary: '#e11d48',
    secondary: '#64748B',
    background: '#0a0205',
    surface: '#1a0510',
    text: '#fff1f2',
    textMuted: '#fb7185',
    border: '#e11d4833',
    brand: '#e11d48',
    brandGlow: 'rgba(225, 29, 72, 0.45)',
    bgSecondary: '#1a0510',
    bgTertiary: '#2d0819',
  },
  mint: {
    name: 'Mint-Signal',
    primary: '#34d399',
    secondary: '#64748B',
    background: '#020807',
    surface: '#0a1812',
    text: '#ecfdf5',
    textMuted: '#6ee7b7',
    border: '#34d39933',
    brand: '#34d399',
    brandGlow: 'rgba(52, 211, 153, 0.45)',
    bgSecondary: '#0a1812',
    bgTertiary: '#0f241b',
  },
  coral: {
    name: 'Coral-Neon',
    primary: '#fb7185',
    secondary: '#64748B',
    background: '#0a0406',
    surface: '#1a0a10',
    text: '#fff1f2',
    textMuted: '#fda4af',
    border: '#fb718533',
    brand: '#fb7185',
    brandGlow: 'rgba(251, 113, 133, 0.45)',
    bgSecondary: '#1a0a10',
    bgTertiary: '#2d1018',
  },
  gold: {
    name: 'Vinewood Gold',
    primary: '#f5c518',
    secondary: '#64748B',
    background: '#060503',
    surface: '#141105',
    text: '#fffbeb',
    textMuted: '#f5e08a',
    border: 'rgba(245, 197, 24, 0.22)',
    brand: '#f5c518',
    brandGlow: 'rgba(245, 197, 24, 0.48)',
    bgSecondary: '#121008',
    bgTertiary: '#1f1a0c',
  },
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly currentTheme = signal<Theme>(this.getStoredTheme() || 'dark'); // Default to dark for Cyber-Luxe
  readonly themes = THEMES;

  constructor() {
    this.applyTheme(this.currentTheme());
    
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.storeTheme(theme);
    });
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
  }

  private applyTheme(theme: Theme) {
    const config = THEMES[theme];
    const root = document.documentElement;
    
    // Core legacy tokens
    root.style.setProperty('--theme-primary', config.primary);
    root.style.setProperty('--theme-primary-rgb', hexToRgbTriplet(config.primary));
    root.style.setProperty('--theme-secondary', config.secondary);
    root.style.setProperty('--theme-background', config.background);
    root.style.setProperty('--theme-surface', config.surface);
    root.style.setProperty('--theme-text', config.text);
    root.style.setProperty('--theme-text-muted', config.textMuted);
    root.style.setProperty('--theme-border', config.border);
    
    // Cyber-Luxe tokens
    root.style.setProperty('--brand', config.brand);
    root.style.setProperty('--brand-glow', config.brandGlow);
    root.style.setProperty('--bg-primary', config.background);
    root.style.setProperty('--bg-secondary', config.bgSecondary);
    root.style.setProperty('--bg-tertiary', config.bgTertiary);
    root.style.setProperty('--text-primary', config.text);
    root.style.setProperty('--text-secondary', config.textMuted);
    root.style.setProperty('--border-soft', config.border);

    root.style.setProperty('--surface', hexToRgba(config.surface, 0.78));
    const brandRgb = hexToRgbTriplet(config.brand);
    root.style.setProperty('--brand-ambient', `rgba(${brandRgb}, 0.12)`);
    root.style.setProperty('--brand-ambient-strong', `rgba(${brandRgb}, 0.2)`);
    
    root.setAttribute('data-theme', theme);
  }

  private storeTheme(theme: Theme) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }

  private getStoredTheme(): Theme | null {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('theme') as Theme;
      if (stored && THEMES[stored]) {
        return stored;
      }
    }
    return null;
  }
}
