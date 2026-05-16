import { Injectable, signal } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';

/** `figma`: bloque ‹ actual/total › con desplegable; `numbered`: páginas numeradas con elipsis. */
export type JosanzPaginationVariant = 'figma' | 'numbered';

/** Modo de listado en pantallas con «Elección de vista». */
export type JosanzListViewMode = 'Tabla' | 'Tarjetas';
import {
  JOSANZ_ATMOSPHERE_REGISTRY,
  JOSANZ_DEFAULT_PRIMARY,
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
  JOSANZ_DEFAULT_PRIMARY,
  josanzReadableOnSolid,
  applyJosanzThemeCssVariables,
  applyJosanzStructuralCssVariables,
} from '../theme/josanz-theme-tokens';

const PREFS_STORAGE_KEY = 'josanz-ui-preferences';

interface JosanzStoredPreferences {
  themeName?: JosanzThemeName;
  atmosphereName?: JosanzAtmosphereName;
  primaryColor?: string;
  paginationVariant?: JosanzPaginationVariant;
  listViewMode?: JosanzListViewMode;
}

@Injectable({
  providedIn: 'root',
})
export class JosanzThemeService {
  private readonly atmospheres = JOSANZ_ATMOSPHERE_REGISTRY;

  currentTheme = signal<JosanzThemeConfig>({
    name: 'luxe-rounded',
    defaultShape: 'rounded',
    /** Alineado con exports Figma (`test (5)`/`test (6)`) vía `josanz-figma-tokens`. */
    primaryColor: JOSANZ_DEFAULT_PRIMARY,
    atmosphere: this.atmospheres.neutral,
  });

  /** Variante de paginación en listados (`josanz-main-list-layout`). */
  paginationVariant = signal<JosanzPaginationVariant>('figma');

  /** Vista de listados: filas continuas (Tabla) o tarjetas separadas (Tarjetas). */
  listViewMode = signal<JosanzListViewMode>('Tarjetas');

  constructor() {
    this.restorePreferences();
    this.applyToDOM();
  }

  setTheme(name: JosanzThemeName) {
    this.currentTheme.update((t) => ({ ...t, name, defaultShape: this.getShapeFromName(name) }));
    this.persistPreferences();
    this.applyToDOM();
  }

  setAtmosphere(name: JosanzAtmosphereName) {
    this.currentTheme.update((t) => ({ ...t, atmosphere: this.atmospheres[name] }));
    this.persistPreferences();
    this.applyToDOM();
  }

  atmosphereBackground(name: JosanzAtmosphereName): string {
    return this.atmospheres[name].background;
  }

  setPrimaryColor(color: string) {
    this.currentTheme.update((t) => ({ ...t, primaryColor: color }));
    this.persistPreferences();
    this.applyToDOM();
  }

  setPaginationVariant(variant: JosanzPaginationVariant) {
    this.paginationVariant.set(variant);
    this.persistPreferences();
  }

  setListViewMode(mode: JosanzListViewMode) {
    this.listViewMode.set(mode);
    this.persistPreferences();
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

  private restorePreferences(): void {
    const stored = this.readStoredPreferences();
    if (!stored) {
      return;
    }

    if (stored.themeName) {
      this.currentTheme.update((t) => ({
        ...t,
        name: stored.themeName!,
        defaultShape: this.getShapeFromName(stored.themeName!),
      }));
    }

    if (stored.atmosphereName && this.atmospheres[stored.atmosphereName]) {
      this.currentTheme.update((t) => ({
        ...t,
        atmosphere: this.atmospheres[stored.atmosphereName!],
      }));
    }

    if (stored.primaryColor) {
      this.currentTheme.update((t) => ({ ...t, primaryColor: stored.primaryColor! }));
    }

    if (stored.paginationVariant === 'figma' || stored.paginationVariant === 'numbered') {
      this.paginationVariant.set(stored.paginationVariant);
    }

    if (stored.listViewMode === 'Tabla' || stored.listViewMode === 'Tarjetas') {
      this.listViewMode.set(stored.listViewMode);
    }
  }

  private persistPreferences(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const theme = this.currentTheme();
    const payload: JosanzStoredPreferences = {
      themeName: theme.name,
      atmosphereName: theme.atmosphere.name,
      primaryColor: theme.primaryColor,
      paginationVariant: this.paginationVariant(),
      listViewMode: this.listViewMode(),
    };
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* quota / private mode */
    }
  }

  private readStoredPreferences(): JosanzStoredPreferences | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as JosanzStoredPreferences;
    } catch {
      return null;
    }
  }
}
