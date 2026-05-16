/** Identificador único de la vista activa en listados. */
export type JosanzListViewSelection = 'tabla' | 'tarjetas-lista' | 'tarjetas-grid';

export type JosanzListGridColumns = 2 | 3 | 4;

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
] as const;

export const JOSANZ_LIST_GRID_COLUMN_OPTIONS: readonly {
  value: JosanzListGridColumns;
  label: string;
}[] = [
  { value: 2, label: '2 columnas' },
  { value: 3, label: '3 columnas' },
  { value: 4, label: '4 columnas' },
];

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
  return id === 'tarjetas-grid';
}
