import type { JosanzCatalogListRow } from '../catalog/catalog-status';
import type { JosanzCatalogListConfig } from '../components/josanz-catalog-list/josanz-catalog-list';
import type {
  JosanzCatalogListFilterContext,
  JosanzListExportMetaRow,
  JosanzListExportPayload,
} from './list-export.types';

export function slugifyExportName(title: string): string {
  return (
    title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'listado'
  );
}

export function buildCatalogListExportPayload(
  config: JosanzCatalogListConfig,
  filteredRows: readonly JosanzCatalogListRow[],
  rowValues: (row: JosanzCatalogListRow) => string[],
  filters: JosanzCatalogListFilterContext,
): JosanzListExportPayload {
  const titleCol = config.titleColumnLabel ?? config.idColumnLabel ?? 'ID';
  const fieldLabels = config.rowLabels ?? [];
  const statusCol = config.statusColumnLabel ?? 'Estado';
  const headers = [titleCol, ...fieldLabels, statusCol];

  const rows = filteredRows.map((row) => [
    row.title ?? row.id,
    ...rowValues(row),
    row.pillLabel,
  ]);

  const slug = slugifyExportName(config.title);
  const stamp = new Date().toISOString().slice(0, 10);

  return {
    title: config.title,
    filename: `josanz-${slug}-${stamp}`,
    sheetName: config.title.slice(0, 31),
    headers,
    rows,
    meta: buildExportFilterMeta(filters, filteredRows.length),
  };
}

export function buildExportFilterMeta(
  filters: JosanzCatalogListFilterContext,
  rowCount: number,
): JosanzListExportMetaRow[] {
  const meta: JosanzListExportMetaRow[] = [
    { label: 'Filas exportadas', value: String(rowCount) },
    { label: 'Generado', value: new Date().toLocaleString('es-ES') },
  ];

  const search = filters.search?.trim();
  if (search) {
    meta.push({ label: 'Búsqueda', value: search });
  }

  const typology = filters.typology?.trim();
  if (typology && typology !== 'Todos' && typology !== 'Todas') {
    meta.push({ label: 'Tipología', value: typology });
  }

  const statusFilter = filters.statusFilter?.trim();
  if (statusFilter && !statusFilter.startsWith('Todos')) {
    meta.push({ label: 'Estado', value: statusFilter });
  }

  const modal = filters.modalFilters;
  if (modal?.id) meta.push({ label: 'ID', value: modal.id });
  if (modal?.nombre) meta.push({ label: 'Nombre', value: modal.nombre });
  if (modal?.fecha) meta.push({ label: 'Fecha', value: modal.fecha });
  if (modal?.cliente) meta.push({ label: 'Cliente', value: modal.cliente });
  if (modal?.operador) meta.push({ label: 'Operador', value: modal.operador });
  if (modal?.estado) meta.push({ label: 'Estado (filtro)', value: modal.estado });

  return meta;
}

export function csvCell(value: string | number | null | undefined): string {
  const raw = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function buildCsvContent(payload: JosanzListExportPayload): string {
  const lines: string[] = [];

  lines.push(`# ${payload.title}`);
  for (const row of payload.meta ?? []) {
    lines.push(`# ${row.label}: ${row.value}`);
  }
  lines.push('');

  lines.push(payload.headers.map(csvCell).join(','));
  for (const row of payload.rows) {
    lines.push(row.map(csvCell).join(','));
  }

  return `\uFEFF${lines.join('\r\n')}`;
}

function sqlIdentifier(value: string): string {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || 'col';
}

function sqlLiteral(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function buildSqlScript(payload: JosanzListExportPayload): string {
  const tableName = `export_${slugifyExportName(payload.title).replace(/-/g, '_')}`;
  const columnNames = payload.headers.map((header, index) => {
    const base = sqlIdentifier(header);
    return base === 'col' ? `col_${index + 1}` : base;
  });

  const lines: string[] = [
    `-- Exportación: ${payload.title}`,
    `-- Generado: ${new Date().toISOString()}`,
  ];

  for (const row of payload.meta ?? []) {
    lines.push(`-- ${row.label}: ${row.value}`);
  }

  lines.push('');
  lines.push(`CREATE TABLE IF NOT EXISTS ${tableName} (`);
  lines.push(
    columnNames.map((name) => `  ${name} TEXT`).join(',\n'),
  );
  lines.push(');');
  lines.push('');

  if (!payload.rows.length) {
    lines.push('-- Sin filas con los filtros actuales.');
    return lines.join('\n');
  }

  const cols = columnNames.join(', ');
  for (const row of payload.rows) {
    const values = row.map(sqlLiteral).join(', ');
    lines.push(`INSERT INTO ${tableName} (${cols}) VALUES (${values});`);
  }

  lines.push('');
  lines.push(`-- Compatible con importación manual o ETL externo (Power BI / SQL).`);

  return lines.join('\n');
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}
