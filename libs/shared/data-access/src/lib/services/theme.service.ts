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
  success: string;
  warning: string;
  error: string;
  info: string;
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
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',
  },
  dark: {
    name: 'Dark',
    primary: '#818CF8',
    secondary: '#94A3B8',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    border: '#334155',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#38BDF8',
  },
  blue: {
    name: 'Blue',
    primary: '#0EA5E9',
    secondary: '#64748B',
    background: '#F0F9FF',
    surface: '#FFFFFF',
    text: '#0C4A6E',
    textMuted: '#0369A1',
    border: '#BAE6FD',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',
  },
  green: {
    name: 'Green',
    primary: '#10B981',
    secondary: '#64748B',
    background: '#ECFDF5',
    surface: '#FFFFFF',
    text: '#064E3B',
    textMuted: '#047857',
    border: '#A7F3D0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',
  },
  purple: {
    name: 'Purple',
    primary: '#8B5CF6',
    secondary: '#64748B',
    background: '#FAF5FF',
    surface: '#FFFFFF',
    text: '#5B21B6',
    textMuted: '#7C3AED',
    border: '#DDD6FE',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',
  },
  orange: {
    name: 'Orange',
    primary: '#F97316',
    secondary: '#64748B',
    background: '#FFF7ED',
    surface: '#FFFFFF',
    text: '#7C2D12',
    textMuted: '#C2410C',
    border: '#FED7AA',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',
  },
  rose: {
    name: 'Rose',
    primary: '#F43F5E',
    secondary: '#64748B',
    background: '#FFF1F2',
    surface: '#FFFFFF',
    text: '#881337',
    textMuted: '#E11D48',
    border: '#FECDD3',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',
  },
  slate: {
    name: 'Slate',
    primary: '#64748B',
    secondary: '#475569',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textMuted: '#475569',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',
  },
  zinc: {
    name: 'Zinc',
    primary: '#71717A',
    secondary: '#52525B',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#18181B',
    textMuted: '#3F3F46',
    border: '#E4E4E7',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',
  },
  neutral: {
    name: 'Neutral',
    primary: '#737373',
    secondary: '#525252',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#171717',
    textMuted: '#404040',
    border: '#E5E5E5',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',
  },
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly currentTheme = signal<Theme>(this.getStoredTheme() || 'light');
  readonly themes = THEMES;

  constructor() {
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
    
    root.style.setProperty('--theme-primary', config.primary);
    root.style.setProperty('--theme-secondary', config.secondary);
    root.style.setProperty('--theme-background', config.background);
    root.style.setProperty('--theme-surface', config.surface);
    root.style.setProperty('--theme-text', config.text);
    root.style.setProperty('--theme-text-muted', config.textMuted);
    root.style.setProperty('--theme-border', config.border);
    root.style.setProperty('--theme-success', config.success);
    root.style.setProperty('--theme-warning', config.warning);
    root.style.setProperty('--theme-error', config.error);
    root.style.setProperty('--theme-info', config.info);
    
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
