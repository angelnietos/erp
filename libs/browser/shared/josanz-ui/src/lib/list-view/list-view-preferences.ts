/** Identificador único de la vista activa en listados. */
export type JosanzListViewSelection =
  | 'tabla'
  | 'tarjetas-lista'
  | 'tarjetas-grid'
  | 'tarjetas-grid-compact'
  | 'tarjetas-grid-dense';

export type JosanzListGridColumns = 2 | 3 | 4 | 5 | 6;

export type JosanzGridCardDensity = 'comfortable' | 'compact' | 'dense';

export interface JosanzListViewMenuOption {
  id: JosanzListViewSelection;
  label: string;
  /** Agrupa bajo «Tarjetas» en el desplegable. */
  group?: 'tarjetas';
}

export const JOSANZ_LIST_VIEW_MENU_OPTIONS: readonly JosanzListViewMenuOption[] = [
  { id: 'tabla', label: 'Tabla' },
  { id: 'tarjetas-lista', label: 'Lista', group: 'tarjetas' },
  { id: 'tarjetas-grid', label: 'Cuadrícula', group: 'tarjetas' },
  { id: 'tarjetas-grid-compact', label: 'Cuadrícula compacta', group: 'tarjetas' },
  { id: 'tarjetas-grid-dense', label: 'Cuadrícula densa', group: 'tarjetas' },
] as const;

export const JOSANZ_LIST_GRID_COLUMN_OPTIONS: readonly {
  value: JosanzListGridColumns;
  label: string;
}[] = [
  { value: 2, label: '2 columnas' },
  { value: 3, label: '3 columnas' },
  { value: 4, label: '4 columnas' },
  { value: 5, label: '5 columnas' },
  { value: 6, label: '6 columnas' },
];

const GRID_COLUMN_SET = new Set<JosanzListGridColumns>([2, 3, 4, 5, 6]);

export function isValidListGridColumns(n: number): n is JosanzListGridColumns {
  return GRID_COLUMN_SET.has(n as JosanzListGridColumns);
}

/** Compatibilidad con preferencia antigua (`Tabla` | `Tarjetas`). */
export function migrateLegacyListViewMode(
  legacy: 'Tabla' | 'Tarjetas' | undefined,
): JosanzListViewSelection {
  if (legacy === 'Tabla') {
    return 'tabla';
  }
  return 'tarjetas-lista';
}

export function listViewSelectionLabel(id: JosanzListViewSelection): string {
  const opt = JOSANZ_LIST_VIEW_MENU_OPTIONS.find((o) => o.id === id);
  if (!opt) {
    return id;
  }
  if (opt.group === 'tarjetas') {
    return `Tarjetas · ${opt.label}`;
  }
  return opt.label;
}

export function isTableListView(id: JosanzListViewSelection): boolean {
  return id === 'tabla';
}

export function isListCardsView(id: JosanzListViewSelection): boolean {
  return id === 'tarjetas-lista';
}

export function isGridCardsView(id: JosanzListViewSelection): boolean {
  return (
    id === 'tarjetas-grid' || id === 'tarjetas-grid-compact' || id === 'tarjetas-grid-dense'
  );
}

export function gridDensityForSelection(id: JosanzListViewSelection): JosanzGridCardDensity {
  if (id === 'tarjetas-grid-dense') {
    return 'dense';
  }
  if (id === 'tarjetas-grid-compact') {
    return 'compact';
  }
  return 'comfortable';
}

export function listViewStackClasses(id: JosanzListViewSelection): string[] {
  if (isTableListView(id)) {
    return ['josanz-list-view--table'];
  }
  if (isListCardsView(id)) {
    return ['josanz-list-view--cards-list'];
  }
  const classes = ['josanz-list-view--cards-grid'];
  const density = gridDensityForSelection(id);
  if (density === 'compact') {
    classes.push('josanz-list-view--cards-grid-compact');
  } else if (density === 'dense') {
    classes.push('josanz-list-view--cards-grid-dense');
  } else {
    classes.push('josanz-list-view--cards-grid-comfortable');
  }
  return classes;
}

/** Columnas sugeridas al activar cada modo de cuadrícula. */
export function defaultGridColumnsForSelection(id: JosanzListViewSelection): JosanzListGridColumns | null {
  if (id === 'tarjetas-grid-dense') {
    return 6;
  }
  if (id === 'tarjetas-grid-compact') {
    return 5;
  }
  if (id === 'tarjetas-grid') {
    return null;
  }
  return null;
}
