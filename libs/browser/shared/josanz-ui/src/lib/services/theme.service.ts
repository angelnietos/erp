import { Injectable, signal } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import {
  JOSANZ_ATMOSPHERE_REGISTRY,
  applyJosanzThemeCssVariables,
  josanzReadableOnSolid,
  type JosanzAtmosphereName,
  type JosanzThemeConfig,
  type JosanzThemeName,
} from '../theme/josanz-theme-tokens';

export type {
  JosanzThemeName,
  JosanzAtmosphereName,
  JosanzAtmosphereConfig,
  JosanzThemeConfig,
} from '../theme/josanz-theme-tokens';

export {
  JOSANZ_ATMOSPHERE_REGISTRY,
  josanzReadableOnSolid,
  applyJosanzThemeCssVariables,
} from '../theme/josanz-theme-tokens';

@Injectable({
  providedIn: 'root',
})
export class JosanzThemeService {
  private readonly atmospheres = JOSANZ_ATMOSPHERE_REGISTRY;

  currentTheme = signal<JosanzThemeConfig>({
    name: 'luxe-rounded',
    defaultShape: 'rounded',
    primaryColor: '#5850EC',
    atmosphere: this.atmospheres.ubisoft,
  });

  constructor() {
    this.applyToDOM();
  }

  setTheme(name: JosanzThemeName) {
    this.currentTheme.update((t) => ({ ...t, name, defaultShape: this.getShapeFromName(name) }));
    this.applyToDOM();
  }

  setAtmosphere(name: JosanzAtmosphereName) {
    this.currentTheme.update((t) => ({ ...t, atmosphere: this.atmospheres[name] }));
    this.applyToDOM();
  }

  atmosphereBackground(name: JosanzAtmosphereName): string {
    return this.atmospheres[name].background;
  }

  setPrimaryColor(color: string) {
    this.currentTheme.update((t) => ({ ...t, primaryColor: color }));
    this.applyToDOM();
  }

  /** Color de texto legible sobre el color primario actual (o un hex arbitrario). */
  readableOnPrimary(hex?: string): string {
    return josanzReadableOnSolid(hex ?? this.currentTheme().primaryColor);
  }

  private getShapeFromName(name: JosanzThemeName): JosanzControlShape {
    if (name === 'luxe-sharp') return 'square';
    if (name === 'luxe-pill') return 'pill';
    return 'rounded';
  }

  private applyToDOM() {
    const theme = this.currentTheme();
    applyJosanzThemeCssVariables({
      atmosphere: theme.atmosphere,
      primaryColor: theme.primaryColor,
      themeName: theme.name,
    });
  }
}
