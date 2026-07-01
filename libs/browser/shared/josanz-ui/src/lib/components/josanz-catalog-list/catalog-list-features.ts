import type { JosanzCatalogListConfig } from './josanz-catalog-list';

/** Visibilidad declarativa de bloques UX en listados Figma (`josanz-catalog-list`). */
export interface JosanzCatalogListFeatures {
  /** Tabs tipología (Todos, Almacén 01…). Por defecto: hay `filterOptions`. */
  typologyTabs?: boolean;
  /** Pill resumen junto a tabs. Por defecto: hay `summaryLine`. */
  summaryLine?: boolean;
  /** Campo buscar. Por defecto: true. */
  search?: boolean;
  /** Botón Excel. Por defecto: true. */
  excel?: boolean;
  /** CTA secundario. Por defecto: hay `secondaryBtnLabel`. */
  secondaryAction?: boolean;
  /** CTA primario. Por defecto: true. */
  primaryAction?: boolean;
  /** Fila cabecera de columnas. Por defecto: true. */
  columnHeader?: boolean;
  /** Paginación inferior. Por defecto: true si hay total o filas. */
  pagination?: boolean;
  /** Selector Tabla / Lista / Cuadrícula. Por defecto: true. */
  viewSelector?: boolean;
  /** Vista tablero kanban con drag & drop de estado (eventos). */
  statusBoard?: boolean;
  /** Resumen por estado (Total, Borrador…). Por defecto: hay `summaryStats` sin `summaryLine`. */
  statusSummary?: boolean;
  /** Filtros avanzados (De X a X, Proveedores…). */
  advancedFilters?: boolean;
  /** Pills de filtro por estado. */
  statusFilters?: boolean;
}

export type ResolvedCatalogListFeatures = Required<JosanzCatalogListFeatures>;

export function resolveCatalogListFeatures(
  config: JosanzCatalogListConfig,
): ResolvedCatalogListFeatures {
  const f = config.features;
  const hasFilterOptions = (config.filterOptions?.length ?? 0) > 0;
  const hasSummaryLine =
    config.summaryLine != null &&
    (typeof config.summaryLine === 'string'
      ? config.summaryLine.trim().length > 0
      : true);
  const hasSecondary = Boolean(config.secondaryBtnLabel?.trim());
  const hasSummaryStats = (config.summaryStats?.length ?? 0) > 0;
  const advancedFilters =
    f?.advancedFilters ?? config.showAdvancedFilters ?? false;
  const statusFilters =
    f?.statusFilters ?? config.showStatusFilters ?? false;

  return {
    typologyTabs: f?.typologyTabs ?? hasFilterOptions,
    summaryLine: f?.summaryLine ?? hasSummaryLine,
    search: f?.search ?? true,
    excel: f?.excel ?? true,
    secondaryAction: f?.secondaryAction ?? hasSecondary,
    primaryAction: f?.primaryAction ?? true,
    columnHeader: f?.columnHeader ?? true,
    pagination:
      f?.pagination ??
      (config.paginationTotal !== undefined
        ? config.paginationTotal > 0
        : true),
    viewSelector: f?.viewSelector ?? true,
    statusBoard: f?.statusBoard ?? false,
    statusSummary:
      f?.statusSummary ?? (!hasSummaryLine && hasSummaryStats),
    advancedFilters,
    statusFilters,
  };
}
