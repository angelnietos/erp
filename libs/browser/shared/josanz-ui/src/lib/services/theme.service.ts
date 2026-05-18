import { Injectable, signal } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import {
  defaultGridColumnsForSelection,
  isValidListGridColumns,
  migrateLegacyListViewMode,
  type JosanzListGridColumns,
  type JosanzListViewSelection,
} from '../list-view/list-view-preferences';

/** @deprecated Usar `JosanzListViewSelection`. */
export type JosanzListViewMode = 'Tabla' | 'Tarjetas';

/** `figma`: bloque ‹ actual/total › con desplegable; `numbered`: páginas numeradas con elipsis. */
export type JosanzPaginationVariant = 'figma' | 'numbered';

import {
  JOSANZ_ATMOSPHERE_REGISTRY,
  JOSANZ_DEFAULT_PRIMARY,
  applyJosanzThemeCssVariables,
  applyJosanzStructuralCssVariables,
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

export type {
  JosanzListViewSelection,
  JosanzListGridColumns,
  JosanzGridCardDensity,
} from '../list-view/list-view-preferences';

const PREFS_STORAGE_KEY = 'josanz-ui-preferences';

interface JosanzStoredPreferences {
  themeName?: JosanzThemeName;
  atmosphereName?: JosanzAtmosphereName;
  primaryColor?: string;
  paginationVariant?: JosanzPaginationVariant;
  /** Legado */
  listViewMode?: JosanzListViewMode;
  listViewSelection?: JosanzListViewSelection;
  listGridColumns?: JosanzListGridColumns;
}

@Injectable({
  providedIn: 'root',
})
export class JosanzThemeService {
  private readonly atmospheres = JOSANZ_ATMOSPHERE_REGISTRY;

  currentTheme = signal<JosanzThemeConfig>({
    name: 'luxe-rounded',
    defaultShape: 'rounded',
    primaryColor: JOSANZ_DEFAULT_PRIMARY,
    atmosphere: this.atmospheres.neutral,
  });

  paginationVariant = signal<JosanzPaginationVariant>('figma');

  listViewSelection = signal<JosanzListViewSelection>('tarjetas-lista');

  /** Columnas del grid de tarjetas (2–6). */
  listGridColumns = signal<JosanzListGridColumns>(3);

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

  setListViewSelection(selection: JosanzListViewSelection) {
    this.listViewSelection.set(selection);
    const suggested = defaultGridColumnsForSelection(selection);
    if (suggested !== null) {
      this.listGridColumns.set(suggested);
    }
    this.persistPreferences();
  }

  /** @deprecated Usar `setListViewSelection`. */
  setListViewMode(mode: JosanzListViewMode) {
    this.setListViewSelection(migrateLegacyListViewMode(mode));
  }

  setListGridColumns(columns: JosanzListGridColumns) {
    this.listGridColumns.set(columns);
    this.persistPreferences();
  }

  readableOnPrimary(hex?: string): string {
    return josanzReadableOnSolid(hex ?? this.currentTheme().primaryColor);
  }

  private getShapeFromName(name: JosanzThemeName): JosanzControlShape {
    if (name === 'luxe-sharp') {
      return 'square';
    }
    if (name === 'luxe-pill') {
      return 'pill';
    }
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

    const atmosphereName =
      stored.atmosphereName && this.atmospheres[stored.atmosphereName]
        ? stored.atmosphereName
        : this.currentTheme().atmosphere.name;
    const storedPrimary = (stored.primaryColor ?? '').toUpperCase();
    if (
      atmosphereName === 'neutral' &&
      (!stored.primaryColor || storedPrimary === '#635BFF' || storedPrimary === '#0F1E2F')
    ) {
      this.currentTheme.update((t) => ({ ...t, primaryColor: JOSANZ_DEFAULT_PRIMARY }));
    }

    if (stored.paginationVariant === 'figma' || stored.paginationVariant === 'numbered') {
      this.paginationVariant.set(stored.paginationVariant);
    }

    const view = stored.listViewSelection;
    if (
      view === 'tabla' ||
      view === 'tarjetas-lista' ||
      view === 'tarjetas-grid' ||
      view === 'tarjetas-grid-compact' ||
      view === 'tarjetas-grid-dense'
    ) {
      this.listViewSelection.set(view);
    } else if (stored.listViewMode) {
      this.listViewSelection.set(migrateLegacyListViewMode(stored.listViewMode));
    }

    const cols = stored.listGridColumns;
    if (cols !== undefined && isValidListGridColumns(cols)) {
      this.listGridColumns.set(cols);
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
      listViewSelection: this.listViewSelection(),
      listGridColumns: this.listGridColumns(),
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
