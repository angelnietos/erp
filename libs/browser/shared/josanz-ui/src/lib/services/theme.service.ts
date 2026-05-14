import { Injectable, signal } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';

export type JosanzThemeName = 'luxe-rounded' | 'luxe-sharp' | 'luxe-pill';

export type JosanzAtmosphereName =
  | 'luxe'
  | 'nordic'
  | 'ivory'
  | 'nature'
  | 'ocean'
  | 'forest'
  | 'sakura'
  | 'midnight'
  | 'slate'
  | 'fire'
  | 'cyberpunk'
  | 'industrial'
  | 'sunset';

export interface JosanzAtmosphereConfig {
  name: JosanzAtmosphereName;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  shadow: string;
}

export interface JosanzThemeConfig {
  name: JosanzThemeName;
  defaultShape: JosanzControlShape;
  primaryColor: string;
  atmosphere: JosanzAtmosphereConfig;
}

@Injectable({
  providedIn: 'root'
})
export class JosanzThemeService {
  
  private atmospheres: Record<JosanzAtmosphereName, JosanzAtmosphereConfig> = {
    luxe: { 
      name: 'luxe', 
      background: '#F8FAFC', 
      surface: '#FFFFFF', 
      text: '#0F172A', 
      textMuted: '#64748B', 
      border: '#E2E8F0',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
    },
    midnight: { 
      name: 'midnight', 
      background: '#0B0F1A', 
      surface: '#151C2C', 
      text: '#F8FAFC', 
      textMuted: '#94A3B8', 
      border: '#1E293B',
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)'
    },
    fire: { 
      name: 'fire', 
      background: '#2D1B1B', 
      surface: '#3D2626', 
      text: '#FFF1F1', 
      textMuted: '#E5AFAF', 
      border: '#4D3434',
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)'
    },
    nordic: { 
      name: 'nordic', 
      background: '#F1F5F9', 
      surface: '#FFFFFF', 
      text: '#334155', 
      textMuted: '#64748B', 
      border: '#CBD5E1',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
    },
    slate: { 
      name: 'slate', 
      background: '#0F172A', 
      surface: '#1E293B', 
      text: '#F1F5F9', 
      textMuted: '#94A3B8', 
      border: '#334155',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)'
    },
    ivory: {
      name: 'ivory',
      background: '#FAF9F6',
      surface: '#FFFFFF',
      text: '#2C2C2C',
      textMuted: '#7A7A7A',
      border: '#E8E6E1',
      shadow: '0 2px 10px rgb(0 0 0 / 0.05)',
    },
    nature: {
      name: 'nature',
      background: '#ECFDF5',
      surface: '#FFFFFF',
      text: '#064E3B',
      textMuted: '#047857',
      border: '#A7F3D0',
      shadow: '0 1px 3px rgb(16 185 129 / 0.12)',
    },
    ocean: {
      name: 'ocean',
      background: '#F0F9FF',
      surface: '#FFFFFF',
      text: '#0C4A6E',
      textMuted: '#0369A1',
      border: '#BAE6FD',
      shadow: '0 1px 3px rgb(14 165 233 / 0.15)',
    },
    forest: {
      name: 'forest',
      background: '#EEF3E8',
      surface: '#FFFFFF',
      text: '#1A2E16',
      textMuted: '#4B5F44',
      border: '#C5D4B8',
      shadow: '0 2px 8px rgb(34 55 24 / 0.08)',
    },
    sakura: {
      name: 'sakura',
      background: '#FFF1F2',
      surface: '#FFFFFF',
      text: '#881337',
      textMuted: '#BE123C',
      border: '#FECDD3',
      shadow: '0 2px 8px rgb(225 29 72 / 0.1)',
    },
    cyberpunk: {
      name: 'cyberpunk',
      background: '#0A0A12',
      surface: '#12121C',
      text: '#E2E8F0',
      textMuted: '#64748B',
      border: '#1E3A5F',
      shadow: '0 0 0 1px rgb(6 182 212 / 0.15), 0 12px 40px rgb(0 0 0 / 0.45)',
    },
    industrial: {
      name: 'industrial',
      background: '#18181B',
      surface: '#27272A',
      text: '#FAFAFA',
      textMuted: '#A1A1AA',
      border: '#3F3F46',
      shadow: '0 4px 14px rgb(0 0 0 / 0.35)',
    },
    sunset: {
      name: 'sunset',
      background: '#1C0F0C',
      surface: '#2D1810',
      text: '#FFF7ED',
      textMuted: '#FDBA74',
      border: '#5C2E22',
      shadow: '0 8px 24px rgb(124 45 18 / 0.35)',
    },
  };

  currentTheme = signal<JosanzThemeConfig>({
    name: 'luxe-rounded',
    defaultShape: 'rounded',
    primaryColor: '#635BFF',
    atmosphere: this.atmospheres.luxe
  });

  constructor() {
    this.applyToDOM();
  }

  setTheme(name: JosanzThemeName) {
    this.currentTheme.update(t => ({ ...t, name, defaultShape: this.getShapeFromName(name) }));
    this.applyToDOM();
  }

  setAtmosphere(name: JosanzAtmosphereName) {
    this.currentTheme.update(t => ({ ...t, atmosphere: this.atmospheres[name] }));
    this.applyToDOM();
  }

  /** Color de fondo registrado para una atmósfera (p. ej. swatches en el modal de temas). */
  atmosphereBackground(name: JosanzAtmosphereName): string {
    return this.atmospheres[name].background;
  }

  setPrimaryColor(color: string) {
    this.currentTheme.update(t => ({ ...t, primaryColor: color }));
    this.applyToDOM();
  }

  private getShapeFromName(name: JosanzThemeName): JosanzControlShape {
    if (name === 'luxe-sharp') return 'square';
    if (name === 'luxe-pill') return 'pill';
    return 'rounded';
  }

  private applyToDOM() {
    const theme = this.currentTheme();
    const root = document.documentElement;
    
    root.style.setProperty('--josanz-primary', theme.primaryColor);
    root.style.setProperty('--josanz-bg', theme.atmosphere.background);
    root.style.setProperty('--josanz-surface', theme.atmosphere.surface);
    root.style.setProperty('--josanz-text', theme.atmosphere.text);
    root.style.setProperty('--josanz-text-muted', theme.atmosphere.textMuted);
    root.style.setProperty('--josanz-border', theme.atmosphere.border);
    root.style.setProperty('--josanz-shadow', theme.atmosphere.shadow);

    root.setAttribute('data-josanz-atmosphere', theme.atmosphere.name);
    root.setAttribute('data-josanz-theme', theme.name);

    document.body.style.backgroundColor = theme.atmosphere.background;
    document.body.style.color = theme.atmosphere.text;
  }
}
