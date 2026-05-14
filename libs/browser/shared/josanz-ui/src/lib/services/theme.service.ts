import { Injectable, signal } from '@angular/core';
import { JosanzControlShape } from '../josanz-control-styles';

export type JosanzThemeName = 'luxe-rounded' | 'luxe-sharp' | 'luxe-pill';

export interface JosanzThemeConfig {
  name: JosanzThemeName;
  defaultShape: JosanzControlShape;
  primaryColor: string;
  surfaceColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class JosanzThemeService {
  /** Tema activo globalmente */
  currentTheme = signal<JosanzThemeConfig>({
    name: 'luxe-rounded',
    defaultShape: 'rounded',
    primaryColor: '#635BFF',
    surfaceColor: '#F5F5F5'
  });

  setTheme(name: JosanzThemeName) {
    switch (name) {
      case 'luxe-sharp':
        this.currentTheme.set({
          name: 'luxe-sharp',
          defaultShape: 'square',
          primaryColor: '#222222',
          surfaceColor: '#F8FAFC'
        });
        break;
      case 'luxe-pill':
        this.currentTheme.set({
          name: 'luxe-pill',
          defaultShape: 'pill',
          primaryColor: '#635BFF',
          surfaceColor: '#F0F9FF'
        });
        break;
      default:
        this.currentTheme.set({
          name: 'luxe-rounded',
          defaultShape: 'rounded',
          primaryColor: '#635BFF',
          surfaceColor: '#F5F5F5'
        });
    }
    
    // Aplicar clase al body para cambios globales de CSS si fuera necesario
    document.body.setAttribute('data-josanz-theme', name);
  }
}
