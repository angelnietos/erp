import type { JosanzCatalogListRow } from './catalog-status';

export type JosanzCatalogModalFilterMode = 'events' | 'clients';

export interface JosanzCatalogModalFilterField {
  key: string;
  label: string;
  extract: (row: JosanzCatalogListRow) => string;
}

const EMPTY_MARK = '—';

function meaningful(value: string | undefined | null): string {
  const trimmed = (value ?? '').trim();
  return trimmed && trimmed !== EMPTY_MARK ? trimmed : '';
}

export const JOSANZ_EVENT_MODAL_FILTER_FIELDS: JosanzCatalogModalFilterField[] = [
  { key: 'ref', label: 'Referencia', extract: (row) => meaningful(row.title) },
  { key: 'nombre', label: 'Nombre evento', extract: (row) => meaningful(row.eventName) },
  { key: 'fecha', label: 'Fecha', extract: (row) => meaningful(row.date) },
  { key: 'cliente', label: 'Cliente', extract: (row) => meaningful(row.client) },
  { key: 'operador', label: 'Operador', extract: (row) => meaningful(row.operator) },
  { key: 'estado', label: 'Estado', extract: (row) => meaningful(row.pillLabel) },
];

export const JOSANZ_CLIENT_MODAL_FILTER_FIELDS: JosanzCatalogModalFilterField[] = [
  { key: 'nombre', label: 'Nombre cliente', extract: (row) => meaningful(row.title) },
  { key: 'telefono', label: 'Teléfono', extract: (row) => meaningful(row.values?.[0]) },
  { key: 'email', label: 'Email', extract: (row) => meaningful(row.values?.[1]) },
  { key: 'operador', label: 'Operador', extract: (row) => meaningful(row.values?.[2]) },
  { key: 'tarifa', label: 'Tarifa', extract: (row) => meaningful(row.pillLabel) },
];

export function resolveCatalogModalFilterFields(
  mode?: JosanzCatalogModalFilterMode,
): JosanzCatalogModalFilterField[] {
  return mode === 'clients'
    ? JOSANZ_CLIENT_MODAL_FILTER_FIELDS
    : JOSANZ_EVENT_MODAL_FILTER_FIELDS;
}

export function uniqueCatalogModalFilterOptions(
  rows: readonly JosanzCatalogListRow[],
  field: JosanzCatalogModalFilterField,
): string[] {
  const values = rows
    .map((row) => field.extract(row))
    .filter((value) => value.length > 0);
  return Array.from(new Set(values)).sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' }),
  );
}
