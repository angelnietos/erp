import { Injectable, signal } from '@angular/core';
import { JosanzControlShape } from '../josanz-control-styles';

export type JosanzThemeName = 'luxe-rounded' | 'luxe-sharp' | 'luxe-pill';

export interface JosanzThemeConfig {
  name: JosanzThemeName;
  defaultShape: JosanzControlShape;
  primaryColor: string;
  surfaceColor: string;
  accentColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class JosanzThemeService {
  /** Tema activo globalmente */
  currentTheme = signal<JosanzThemeConfig>({
    name: 'luxe-rounded',
    defaultShape: 'rounded',
    primaryColor: '#635BFF', // Luxe Blue
    surfaceColor: '#F5F5F5',
    accentColor: '#635BFF'
  });

  setTheme(name: JosanzThemeName) {
    const current = this.currentTheme();
    switch (name) {
      case 'luxe-sharp':
        this.currentTheme.set({
          ...current,
          name: 'luxe-sharp',
          defaultShape: 'square',
        });
        break;
      case 'luxe-pill':
        this.currentTheme.set({
          ...current,
          name: 'luxe-pill',
          defaultShape: 'pill',
        });
        break;
      default:
        this.currentTheme.set({
          ...current,
          name: 'luxe-rounded',
          defaultShape: 'rounded',
        });
    }
    this.applyThemeToDOM();
  }

  setPrimaryColor(color: string) {
    this.currentTheme.update(t => ({
      ...t,
      primaryColor: color,
      accentColor: color
    }));
    this.applyThemeToDOM();
  }

  private applyThemeToDOM() {
    const theme = this.currentTheme();
    document.body.setAttribute('data-josanz-theme', theme.name);
    // Inyectar variables CSS globales para que Tailwind u otros las usen
    document.documentElement.style.setProperty('--josanz-primary', theme.primaryColor);
  }
}
