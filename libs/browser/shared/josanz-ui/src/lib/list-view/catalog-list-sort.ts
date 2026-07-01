import type { JosanzCatalogListRow } from '../catalog/catalog-status';

export type JosanzCatalogSortDirection = 'asc' | 'desc';

/** `title` = columna ID/ref; `field-N` = campo N; `status` = estado/tipo. */
export type JosanzCatalogSortColumn = 'title' | `field-${number}` | 'status';

export interface JosanzCatalogSortColumnOption {
  key: JosanzCatalogSortColumn;
  label: string;
}

export interface JosanzCatalogSortState {
  column: JosanzCatalogSortColumn | null;
  direction: JosanzCatalogSortDirection;
}

export function createDefaultCatalogSortState(): JosanzCatalogSortState {
  return { column: null, direction: 'asc' };
}

export function buildCatalogSortColumns(
  titleLabel: string,
  fieldLabels: readonly string[],
  statusLabel: string,
): JosanzCatalogSortColumnOption[] {
  return [
    { key: 'title', label: titleLabel },
    ...fieldLabels.map(
      (label, index): JosanzCatalogSortColumnOption => ({
        key: `field-${index}`,
        label,
      }),
    ),
    { key: 'status', label: statusLabel },
  ];
}

function parseDdMmYyyy(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return null;
  }
  return Date.UTC(year, month - 1, day);
}

function compareSortValues(left: string, right: string): number {
  const leftDate = parseDdMmYyyy(left);
  const rightDate = parseDdMmYyyy(right);
  if (leftDate !== null && rightDate !== null) {
    return leftDate - rightDate;
  }

  const leftNum = Number(left.replace(/[^\d.,-]/g, '').replace(',', '.'));
  const rightNum = Number(right.replace(/[^\d.,-]/g, '').replace(',', '.'));
  if (
    left.trim() !== '' &&
    right.trim() !== '' &&
    Number.isFinite(leftNum) &&
    Number.isFinite(rightNum)
  ) {
    return leftNum - rightNum;
  }

  return left.localeCompare(right, 'es', { sensitivity: 'base', numeric: true });
}

export function catalogRowSortValue(
  row: JosanzCatalogListRow,
  column: JosanzCatalogSortColumn,
  rowValues: (row: JosanzCatalogListRow) => string[],
): string {
  if (column === 'title') {
    return String(row.title ?? row.id ?? '');
  }
  if (column === 'status') {
    return String(row.pillLabel ?? '');
  }
  const index = Number(column.replace('field-', ''));
  if (column.startsWith('field-') && index === 1 && row.eventDateIso) {
    return row.eventDateIso;
  }
  const values = rowValues(row);
  return String(values[index] ?? '');
}

export function sortCatalogRows(
  rows: readonly JosanzCatalogListRow[],
  sort: JosanzCatalogSortState,
  rowValues: (row: JosanzCatalogListRow) => string[],
): JosanzCatalogListRow[] {
  if (!sort.column) {
    return [...rows];
  }
  const column = sort.column;
  const direction = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = catalogRowSortValue(a, column, rowValues);
    const right = catalogRowSortValue(b, column, rowValues);
    return compareSortValues(left, right) * direction;
  });
}

export function catalogSortColumnLabel(
  columns: readonly JosanzCatalogSortColumnOption[],
  sort: JosanzCatalogSortState,
): string | null {
  if (!sort.column) {
    return null;
  }
  return columns.find((col) => col.key === sort.column)?.label ?? null;
}

export function toggleCatalogSort(
  current: JosanzCatalogSortState,
  column: JosanzCatalogSortColumn,
): JosanzCatalogSortState {
  if (current.column === column) {
    return {
      column,
      direction: current.direction === 'asc' ? 'desc' : 'asc',
    };
  }
  return { column, direction: 'asc' };
}
