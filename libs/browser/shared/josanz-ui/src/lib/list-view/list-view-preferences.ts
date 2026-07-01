/** Identificador único de la vista activa en listados. */
export type JosanzListViewSelection =
  | 'tabla'
  | 'tarjetas-lista'
  | 'tarjetas-grid'
  | 'tarjetas-grid-compact'
  | 'tarjetas-grid-dense'
  | 'tablero';

export type JosanzListGridColumns = 2 | 3 | 4 | 5 | 6;

export type JosanzGridCardDensity = 'comfortable' | 'compact' | 'dense';

export interface JosanzListViewMenuOption {
  id: JosanzListViewSelection;
  label: string;
  /** Etiqueta corta para control segmentado en footer. */
  shortLabel: string;
  /** Agrupa bajo «Tarjetas» en el desplegable. */
  group?: 'tarjetas';
}

export const JOSANZ_LIST_VIEW_MENU_OPTIONS: readonly JosanzListViewMenuOption[] = [
  { id: 'tabla', label: 'Tabla', shortLabel: 'Tabla' },
  { id: 'tarjetas-lista', label: 'Lista', shortLabel: 'Lista', group: 'tarjetas' },
  { id: 'tarjetas-grid', label: 'Cuadrícula', shortLabel: 'Cuadrícula', group: 'tarjetas' },
  {
    id: 'tarjetas-grid-compact',
    label: 'Cuadrícula compacta',
    shortLabel: 'Compacta',
    group: 'tarjetas',
  },
  {
    id: 'tarjetas-grid-dense',
    label: 'Cuadrícula densa',
    shortLabel: 'Densa',
    group: 'tarjetas',
  },
  { id: 'tablero', label: 'Tablero', shortLabel: 'Tablero' },
] as const;

/** Opciones de vista visibles cuando el tablero kanban no está habilitado. */
export const JOSANZ_LIST_VIEW_MENU_OPTIONS_WITHOUT_BOARD = JOSANZ_LIST_VIEW_MENU_OPTIONS.filter(
  (opt) => opt.id !== 'tablero',
);

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

export function isStatusBoardView(id: JosanzListViewSelection): boolean {
  return id === 'tablero';
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
  if (isStatusBoardView(id)) {
    return ['josanz-list-view--status-board'];
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

/** Columnas sugeridas al activar cada modo de cuadrícula (siempre se aplican al cambiar de vista). */
export function defaultGridColumnsForSelection(
  id: JosanzListViewSelection,
): JosanzListGridColumns | null {
  if (id === 'tarjetas-grid-dense') {
    return 6;
  }
  if (id === 'tarjetas-grid-compact') {
    return 5;
  }
  if (id === 'tarjetas-grid') {
    return 4;
  }
  return null;
}
