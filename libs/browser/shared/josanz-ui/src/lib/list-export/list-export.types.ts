export type JosanzListExportFormat = 'xlsx' | 'csv' | 'sql';

export interface JosanzListExportMetaRow {
  label: string;
  value: string;
}

export interface JosanzListExportPayload {
  title: string;
  filename: string;
  sheetName?: string;
  headers: string[];
  rows: (string | number | null)[][];
  meta?: JosanzListExportMetaRow[];
}

export interface JosanzCatalogListFilterContext {
  search?: string;
  typology?: string;
  statusFilter?: string;
  modalFilters?: Record<string, string>;
  modalFilterFieldLabels?: Record<string, string>;
}
