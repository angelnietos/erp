import { Injectable, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange' | 'rose' | 'slate' | 'zinc' | 'neutral';

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
    name: 'Light',
    primary: '#4F46E5',
    secondary: '#64748B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#E2E8F0',
    brand: '#4F46E5',
    brandGlow: 'rgba(79, 70, 229, 0.4)',
    bgSecondary: '#F1F5F9',
    bgTertiary: '#E2E8F0',
  },
  dark: {
    name: 'Cyber-Dark',
    primary: '#F03E3E',
    secondary: '#94A3B8',
    background: '#0a0a0a',
    surface: '#121212',
    text: '#F1F5F9',
    textMuted: '#64748B',
    border: '#222222',
    brand: '#F03E3E',
    brandGlow: 'rgba(240, 62, 62, 0.5)',
    bgSecondary: '#161616',
    bgTertiary: '#1f1f1f',
  },
  blue: {
    name: 'Cyber-Blue',
    primary: '#0ea5e9',
    secondary: '#64748B',
    background: '#020617',
    surface: '#0f172a',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#1e293b',
    brand: '#0ea5e9',
    brandGlow: 'rgba(14, 165, 233, 0.5)',
    bgSecondary: '#0f172a',
    bgTertiary: '#1e293b',
  },
  // Keep others with balanced defaults but focused on premium dark if possible
  green: {
    name: 'Matrix',
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
    name: 'Neon-Vapor',
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
    name: 'Horizon',
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
