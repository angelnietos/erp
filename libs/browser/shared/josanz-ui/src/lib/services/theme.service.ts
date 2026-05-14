import { Injectable, signal } from '@angular/core';
import { JosanzControlShape } from '../josanz-control-styles';

export type JosanzThemeName = 'luxe-rounded' | 'luxe-sharp' | 'luxe-pill';

export type JosanzAtmosphereName = 
  | 'luxe' | 'nature' | 'fire' | 'midnight' | 'ocean' 
  | 'sunset' | 'cyberpunk' | 'industrial' | 'forest' | 'sakura';

export interface JosanzAtmosphereConfig {
  name: JosanzAtmosphereName;
  background: string;
  surface: string;
  text: string;
  border: string;
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
    luxe: { name: 'luxe', background: '#F8FAFC', surface: '#FFFFFF', text: '#1E293B', border: '#F1F5F9' },
    nature: { name: 'nature', background: '#F0FDF4', surface: '#FFFFFF', text: '#064E3B', border: '#DCFCE7' },
    fire: { name: 'fire', background: '#FEF2F2', surface: '#FFFFFF', text: '#7F1D1D', border: '#FEE2E2' },
    midnight: { name: 'midnight', background: '#0F172A', surface: '#1E293B', text: '#F8FAFC', border: '#334155' },
    ocean: { name: 'ocean', background: '#F0F9FF', surface: '#FFFFFF', text: '#0C4A6E', border: '#E0F2FE' },
    sunset: { name: 'sunset', background: '#FFF7ED', surface: '#FFFFFF', text: '#7C2D12', border: '#FFEDD5' },
    cyberpunk: { name: 'cyberpunk', background: '#000000', surface: '#111111', text: '#FFFFFF', border: '#333333' },
    industrial: { name: 'industrial', background: '#27272A', surface: '#3F3F46', text: '#F4F4F5', border: '#52525B' },
    forest: { name: 'forest', background: '#ECF3E9', surface: '#FFFFFF', text: '#1A2E05', border: '#D1E2C4' },
    sakura: { name: 'sakura', background: '#FFF1F2', surface: '#FFFFFF', text: '#881337', border: '#FFE4E6' }
  };

  currentTheme = signal<JosanzThemeConfig>({
    name: 'luxe-rounded',
    defaultShape: 'rounded',
    primaryColor: '#635BFF',
    atmosphere: this.atmospheres.luxe
  });

  setTheme(name: JosanzThemeName) {
    this.currentTheme.update(t => ({ ...t, name, defaultShape: this.getShapeFromName(name) }));
    this.applyToDOM();
  }

  setAtmosphere(name: JosanzAtmosphereName) {
    this.currentTheme.update(t => ({ ...t, atmosphere: this.atmospheres[name] }));
    this.applyToDOM();
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
    root.style.setProperty('--josanz-border', theme.atmosphere.border);
    
    document.body.style.backgroundColor = theme.atmosphere.background;
  }
}
